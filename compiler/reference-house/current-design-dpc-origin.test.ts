import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { partitionDpcOrigins, type OriginPathRule } from './current-design/dpc-origin-ledger.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'

test('a source-path partition excludes bypass loads even above the cut and preserves signed first moments', () => {
  const origins = [
    { family: 'wall', case: 'G', N_Xmoment_Ymoment: [100, 200, 300] as const },
    { family: 'ground occupation', case: 'Q', N_Xmoment_Ymoment: [20, 60, 80] as const },
    { family: 'roof suction', case: 'U', N_Xmoment_Ymoment: [-30, -90, -60] as const },
    { family: 'new unclassified stock', case: 'G', N_Xmoment_Ymoment: [5, 7, 11] as const },
  ]
  const rules: OriginPathRule[] = [
    { family: 'wall', path: 'inner-wall', reason: 'Uniform mineral member', uniformVerticalExtentMm: [-200, 800] },
    { family: 'ground occupation', path: 'below-or-bypass', reason: 'Ground slab load path bypasses wall barrier' },
    { family: 'roof suction', path: 'inner-wall', reason: 'Upper roof' },
  ]
  const reference = partitionDpcOrigins(origins, rules, 0, { G: 1, Q: 1, U: 1 })
  assert.deepEqual(reference.totals.innerWallAboveCut, [50, 70, 180])
  assert.deepEqual(reference.totals.belowOrBypass, [40, 100, 140])
  assert.deepEqual(reference.totals.unresolved, [5, 7, 11])
  assert.deepEqual(reference.unknownFamilies, ['new unclassified stock'])
  const raisedCut = partitionDpcOrigins(origins, rules, 100, { G: 1, Q: 1, U: 1 })
  assert.deepEqual(raisedCut.totals.innerWallAboveCut, [40, 50, 150])
  assert.deepEqual(raisedCut.entries.find(entry => entry.family === 'ground occupation'),
    reference.entries.find(entry => entry.family === 'ground occupation'))
  assert.deepEqual(reference.partitionResidual, [0, 0, 0])
  assert.equal(reference.completeSpliceDemand, null)
  assert.equal(reference.installedAcceptance, false)
  assert.throws(() => partitionDpcOrigins(origins, [...rules, rules[0]], 0, { G: 1 }), /Duplicate/)
  assert.throws(() => partitionDpcOrigins(origins, rules, NaN, { G: 1 }), /Invalid/)
  assert.throws(() => partitionDpcOrigins(origins, rules, 0, { G: Infinity }), /Invalid/)
  assert.throws(() => partitionDpcOrigins([...origins, origins[0]], rules, 0, { G: 1 }), /duplicate/)
})

test('actual DPC origin audit reruns the 52-head source while withholding a fabricated corner-joint demand', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const baseline = await compile.structuralDpcOriginAudit()
  assert.equal(baseline.status, 'incomplete-joint-demand')
  assert.equal(baseline.source.planDigest, compile.source.planDigest)
  assert.deepEqual(baseline.sourcePlateZMm, [-50, -30])
  const gravity = baseline.cases.find(result => result.id === 'GQ')!
  const retained = JSON.parse(readFileSync(new URL('../../project/str/studies/current-house-joined-foundation.json', import.meta.url), 'utf8'))
  assert.equal(gravity.entries.length, retained.origins.length)
  assert.equal(gravity.entries.find(entry => entry.family === 'ground finishes and use')?.path, 'below-or-bypass')
  assert.equal(gravity.entries.find(entry => entry.family === 'upper leaf and finish budget')?.path, 'weather-leaf')
  assert.ok(gravity.unknownFamilies.includes('outer pier cage and positive DPC stock reserve'))
  assert.ok(gravity.unknownFamilies.includes('landing beam and post'))
  assert.ok(gravity.totals.belowOrBypass[0] > 2600)
  assert.ok(gravity.partitionResidual.every(value => Math.abs(value) < 1e-8))
  assert.equal(baseline.completeSpliceDemand, null)
  const changed = await compile.structuralDpcOriginAudit(-31)
  const after = changed.cases.find(result => result.id === 'GQ')!
  assert.ok(after.totals.innerWallAboveCut[0] < gravity.totals.innerWallAboveCut[0])
  assert.deepEqual(after.totals.all, gravity.totals.all)
  assert.deepEqual(after.totals.weatherLeaf, gravity.totals.weatherLeaf)
  await assert.rejects(compile.structuralDpcOriginAudit(-180), /inside the source/)
  await assert.rejects(compile.structuralDpcOriginAudit(NaN), /inside the source/)
  await assert.rejects(prepareCurrentDesignCompile({ ...design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-DPC-UNBOUND', state: 'candidate' },
  }).structuralDpcOriginAudit(), /requires the current/)
})

test('saved collector documents carry the requested DPC cut and invalidate changed cut results', async () => {
  const design = readGeorgianDesignSnapshot()
  const saved = await readEngineeringDocument(design)
  const document = { ...saved, stages: { northCollector: { dpcOriginAudit: { cutZMm: -40 } } } }
  const first = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const changed = await compileEngineeringDocument({ ...document,
    stages: { northCollector: { dpcOriginAudit: { cutZMm: -31 } } },
  })
  assert.notEqual(first.documentIdentity, changed.documentIdentity)
  const identity = (bundle: typeof first, stage: string) => bundle.manifest.find(entry => entry.stage === stage)!.resultDigest
  assert.notEqual(identity(first, 'northCollector'), identity(changed, 'northCollector'))
  assert.equal(identity(first, 'plans'), identity(changed, 'plans'))
  const north = first.engineering.northCollector
  assert.ok(north?.status === 'computed-comparison' && north.dpcOriginAudit)
  assert.equal(north.dpcOriginAudit.cutZMm, -40)
  assert.equal(north.dpcOriginAudit.completeSpliceDemand, null)
  const returned = await compileEngineeringDocument(document)
  assert.deepEqual(returned, first)
})

test('upper-cut global contact rejects the retained shell and derives a conditional added-load requirement', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const trial = { roofRiseMm: 0, additionalRetainedNKN: 0, additionalRetainedCentroidXYMm: [6000, 6000] }
  const initial = await compile.structuralDpcOriginAudit(-40, trial)
  assert.ok(initial.globalContact)
  const global = initial.globalContact
  assert.equal(global.windCaseCount, 96)
  assert.equal(global.baselinePassingCount, 4)
  assert.equal(global.candidatePassingCount, 4)
  assert.ok(global.minimumAdditionalRetainedNKN && global.minimumAdditionalRetainedNKN > 138 && global.minimumAdditionalRetainedNKN < 139)
  assert.ok(global.nativeUpperCutReplayResidual.momentKNm < 1e-6)
  assert.ok(global.nativeUpperCutReplayResidual.forceKN < 1e-6)
  assert.ok(global.nativeUpperCutReplayResidual.netVerticalWindKN < 1e-6)
  const required = global.minimumAdditionalRetainedNKN
  const above = await compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedNKN: required + 0.001 })
  const below = await compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedNKN: required - 0.001 })
  const raised = await compile.structuralDpcOriginAudit(-40, { ...trial, roofRiseMm: 100 })
  const offset = await compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedCentroidXYMm: [4000, 6000] })
  const adverseOffset = await compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedCentroidXYMm: [8000, 6000] })
  assert.equal(above.globalContact?.candidatePassingCount, 96)
  assert.ok(below.globalContact && below.globalContact.candidatePassingCount < 96)
  assert.ok(raised.globalContact?.minimumAdditionalRetainedNKN && raised.globalContact.minimumAdditionalRetainedNKN > required + 4)
  assert.ok(offset.globalContact?.minimumAdditionalRetainedNKN && offset.globalContact.minimumAdditionalRetainedNKN < required)
  assert.ok(adverseOffset.globalContact?.minimumAdditionalRetainedNKN && adverseOffset.globalContact.minimumAdditionalRetainedNKN > required)
  assert.deepEqual(initial.cases, above.cases)
  assert.deepEqual(initial.cases, raised.cases)
  assert.equal(above.globalContact?.completeSpliceDemand, null)
  assert.equal(above.globalContact?.admitted, false)
  await assert.rejects(compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedNKN: -1 }), /retained load/)
  await assert.rejects(compile.structuralDpcOriginAudit(-40, { ...trial, roofRiseMm: 121 }), /roof rise/)
  await assert.rejects(compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedCentroidXYMm: [13000, 6000] }), /outside/)
  await assert.rejects(compile.structuralDpcOriginAudit(-40, { ...trial, additionalRetainedNKN: Infinity }), /finite/)
  await assert.rejects(compile.structuralDpcOriginAudit(-40, { ...trial, verifiedWeight: true }), /complete explicit/)
})

test('the global contact trial travels through the saved north-collector production stage', async () => {
  const saved = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...saved, stages: { northCollector: { dpcOriginAudit: { cutZMm: -40,
    globalContactTrial: { roofRiseMm: 0, additionalRetainedNKN: 150, additionalRetainedCentroidXYMm: [6000, 6000] },
  } } } }
  const result = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.ok(result.engineering.northCollector?.status === 'computed-comparison')
  assert.equal(result.engineering.northCollector.dpcOriginAudit?.globalContact?.candidatePassingCount, 96)
  assert.equal(result.engineering.northCollector.dpcOriginAudit?.globalContact?.admitted, false)
  const changed = await compileEngineeringDocument({ ...document, stages: { northCollector: { dpcOriginAudit: {
    ...document.stages.northCollector.dpcOriginAudit,
    globalContactTrial: { ...document.stages.northCollector.dpcOriginAudit.globalContactTrial, roofRiseMm: 100 },
  } } } })
  assert.notEqual(result.documentIdentity, changed.documentIdentity)
  assert.equal(result.manifest.find(stage => stage.stage === 'plans')?.resultDigest,
    changed.manifest.find(stage => stage.stage === 'plans')?.resultDigest)
  assert.notEqual(result.manifest.find(stage => stage.stage === 'northCollector')?.resultDigest,
    changed.manifest.find(stage => stage.stage === 'northCollector')?.resultDigest)
})
