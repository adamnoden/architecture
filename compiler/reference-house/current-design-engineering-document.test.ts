import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const cli = (args: string[], input?: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', ...args], {
    input: input === undefined ? undefined : JSON.stringify(input), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  })

test('one saved engineering document replays its bound stages and preserves their conditional evidence', async () => {
  const design = readGeorgianDesignSnapshot()
  const document = await readEngineeringDocument(design)
  const saved = JSON.stringify(document)
  const result = await compileEngineeringDocument(JSON.parse(saved))
  assert.equal(JSON.stringify(document), saved)
  assert.equal(result.source.planDigest, sha256SemanticFingerprint(design))
  assert.equal(result.documentIdentity.planDigest, result.source.planDigest)
  assert.deepEqual(result.manifest.map(item => item.stage), ['plans', 'occupiedServices', 'selectedWaterEvent',
    'northCollector', 'rearFoulVent', 'inletSillInsert', 'inletFault', 'inletRemovals/plant', 'inletRemovals/utility',
    'inletCovers/plant', 'inletCovers/utility', 'inletAssembly', 'studyRoomKit'])
  assert.ok(result.engineering.northCollector?.status === 'computed-comparison')
  assert.equal(result.engineering.northCollector.evidence.installedAcceptance, false)
  assert.equal(result.engineering.studyRoomKit?.kit.state, 'candidate')
  assert.equal(result.evidence.installedAcceptance, false)
  assert.equal(result.evidence.state, 'conditional-stage-comparisons')
  assert.ok(result.manifest.every(item => item.resultDigest.length === 64 && item.dependsOn.includes('design')))
  assert.deepEqual(result.plans, (await compileCurrentDesignBundle(design)).plans)
  const direct = prepareCurrentDesignCompile(design)
  const request = await direct.readNorthCollectorCase()
  assert.ok('collector' in request)
  assert.deepEqual(result.engineering.northCollector, await direct.northCollectorCase({ ...request.collector, ...document.stages.northCollector }))
  assert.equal(result.engineering.northCollector.dpcOriginAudit?.globalContact?.baselinePassingCount, 4)
  assert.equal(result.engineering.northCollector.dpcOriginAudit?.globalContact?.admitted, false)
  assert.ok(document.bindings.implementations['project/ias/studies/study-furniture-motion.py'])
  assert.ok(document.bindings.implementations['compiler/reference-house/current-design/engineering-document.ts'])
  assert.ok(document.bindings.implementations['compiler/reference-house/georgian/layout-family.ts'])
  assert.ok(document.bindings.implementations['compiler/publication-drawing/projection.ts'])
  assert.ok(document.bindings.implementations['compiler/core/identity.ts'])
  assert.ok(document.bindings.implementations['compiler/reference-house/construction-bay/opening-inspection.ts'])
  assert.ok(document.bindings.implementations['project/had/studies/inlet-maintenance.mjs'])
  assert.ok(document.bindings.implementations['project/ccr/studies/source-coverage.ts'])
})

test('a stored collector edit changes its result and manifest while the vent and nominal plans retain their source', async () => {
  const full = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...full, stages: { northCollector: full.stages.northCollector, rearFoulVent: full.stages.rearFoulVent } }
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document,
    stages: { ...document.stages, northCollector: { ...document.stages.northCollector, dragDemandFactor: 0.5 } } })
  assert.notEqual(changed.documentIdentity.digest, baseline.documentIdentity.digest)
  assert.equal(changed.documentIdentity.planDigest, baseline.documentIdentity.planDigest)
  assert.notEqual(changed.manifest.find(item => item.stage === 'northCollector')?.resultDigest,
    baseline.manifest.find(item => item.stage === 'northCollector')?.resultDigest)
  assert.deepEqual(changed.manifest.filter(item => item.stage !== 'northCollector'),
    baseline.manifest.filter(item => item.stage !== 'northCollector'))
  assert.deepEqual(changed.engineering.rearFoulVent, baseline.engineering.rearFoulVent)
  assert.deepEqual(changed.plans, baseline.plans)
  assert.ok(changed.engineering.northCollector?.status === 'computed-comparison'
    && baseline.engineering.northCollector?.status === 'computed-comparison')
  assert.equal(changed.engineering.northCollector.comparison.lateralClosure.comparisonForceKN,
    baseline.engineering.northCollector.comparison.lateralClosure.comparisonForceKN / 2)
  assert.deepEqual(changed, await compileEngineeringDocument(JSON.parse(JSON.stringify({ ...document,
    stages: { ...document.stages, northCollector: { ...document.stages.northCollector, dragDemandFactor: 0.5 } } }))))
})

test('saved method drift, injected derived identities, duplicate branches and unbound design inputs fail closed', async () => {
  const document = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...document, bindings: { ...document.bindings,
    implementations: { ...document.bindings.implementations,
      'project/ias/studies/study-furniture-motion.py': '0'.repeat(40) } } }), /Stale engineering source or implementation binding/)
  await assert.rejects(compileEngineeringDocument({ ...document, bindings: { ...document.bindings,
    implementations: { ...document.bindings.implementations,
      'compiler/publication-drawing/projection.ts': '0'.repeat(40) } } }), /Stale engineering source or implementation binding/)
  await assert.rejects(compileEngineeringDocument({ ...document, bindings: { ...document.bindings,
    implementations: { ...document.bindings.implementations,
      'compiler/reference-house/construction-bay/opening-inspection.ts': '0'.repeat(40) } } }), /Stale engineering source or implementation binding/)
  await assert.rejects(compileEngineeringDocument({ ...document,
    stages: { northCollector: { bindingDigest: '0'.repeat(64) } } }), /derived identity supplied/)
  await assert.rejects(compileEngineeringDocument({ ...document,
    stages: { inletCovers: [{ branch: 'utility' }, { branch: 'utility' }] } }), /at most once/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { unsupported: {} } }), /supported engineering stage/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { studyRoomKit: { pitchMm: 300 } } }), /INVALID_STUDY_ROOM_KIT_CASE/)
  await assert.rejects(readEngineeringDocument({ ...document.design,
    source: { kind: 'contrast-specimen', id: 'SPECIMEN-UNBOUND-ENGINEERING', state: 'candidate' } }), /accepted current design basis/)
  const changed = { ...document.design, storeys: { ...document.design.storeys,
    GROUND: { ...document.design.storeys.GROUND, openings: document.design.storeys.GROUND.openings.map((opening, index) =>
      index === 0 ? { ...opening, widthMm: opening.widthMm - 10 } : opening) } } }
  await assert.rejects(readEngineeringDocument(changed), /differs from the current Georgian layout inputs/)
})

test('a persisted Study pitch changes its real part schedule and invalidates unsupported release geometry', async () => {
  const basis = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...basis, stages: { studyRoomKit: { ...basis.stages.studyRoomKit, firstRestBoardSizeMm: [300, 300] } } }
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document,
    stages: { studyRoomKit: { ...document.stages.studyRoomKit, pitchMm: 450 } } })
  const oldKit = baseline.engineering.studyRoomKit!.kit
  const newKit = changed.engineering.studyRoomKit!.kit
  assert.equal(oldKit.floor.parts.length, 144)
  assert.equal(newKit.floor.parts.length, 77)
  assert.equal(newKit.floor.emitterPlinth.state, 'withheld')
  assert.notEqual(baseline.manifest.find(item => item.stage === 'studyRoomKit')?.resultDigest,
    changed.manifest.find(item => item.stage === 'studyRoomKit')?.resultDigest)
  assert.deepEqual(baseline.manifest.filter(item => item.stage !== 'studyRoomKit'),
    changed.manifest.filter(item => item.stage !== 'studyRoomKit'))
  assert.ok(changed.manifest.find(item => item.stage === 'studyRoomKit')?.controls.includes('stages.studyRoomKit.pitchMm'))
  assert.deepEqual(changed.plans, baseline.plans)
  assert.deepEqual(changed.occupiedServices, baseline.occupiedServices)
  assert.deepEqual(changed.selectedWaterEvent, baseline.selectedWaterEvent)
})

test('the CLI saves and replays an explicit engineering document through the bundle entry point', async () => {
  const source = readGeorgianDesignSnapshot()
  const read = cli(['--read-engineering', '-'], source)
  assert.equal(read.status, 0, read.stderr)
  const document = JSON.parse(read.stdout)
  document.stages = { northCollector: { ...document.stages.northCollector, dragDemandFactor: 0.5 } }
  const compiled = cli(['--bundle', '-'], document)
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.equal(compiled.stdout, JSON.stringify(await compileEngineeringDocument(document)) + '\n')
  const legacy = cli(['--bundle', '-'], source)
  assert.equal(legacy.status, 0, legacy.stderr)
  assert.equal(JSON.parse(legacy.stdout).schema, 'current-design-bundle/1')
})

test('one saved file regenerates the inlet front bearing and the Study board catalogue', async () => {
  const original = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...original, stages: {
    ...original.stages,
    inletCovers: original.stages.inletCovers.map(cover => cover.branch === 'utility' ? { ...cover, closure: {
      profile: 'rounded-taper', notchLapMm: 9, collarSealLandMm: 4, collarOutsideDiameterMm: 92,
      wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true, taperToeReliefMm: 20,
      frontReceiver: { widthMm: 8, edgeInsetMm: 5 },
    } } : cover),
    studyRoomKit: { ...original.stages.studyRoomKit, firstRestBoardSizeMm: [300, 300] },
  } }
  const directory = mkdtempSync(join(tmpdir(), 'ovid-engineering-document-'))
  try {
    const path = join(directory, 'design.json')
    writeFileSync(path, JSON.stringify(document))
    const compiled = cli(['--bundle', path])
    assert.equal(compiled.status, 0, compiled.stderr)
    const result = JSON.parse(compiled.stdout)
    const utility = result.engineering.inletCovers.find((cover: { branch: string }) => cover.branch === 'utility')
    assert.equal(utility.roundedRelease.frontReceiver.status, 'within-plan-contact-screen')
    assert.equal(utility.roundedRelease.gravity.minimumSignedSupportEdgeMarginMm, 46.2737)
    assert.equal(utility.roundedRelease.captureQualified, false)
    const catalogue = result.engineering.studyRoomKit.kit.floor.firstRestBoardTrial.boardCatalogue
    assert.equal(catalogue.installedPlanObstructions.placementCount, 111)
    assert.equal(catalogue.localWallTrimReleased.placementCount, 117)
    assert.equal(catalogue.physicalAcceptance, false)
    assert.equal(result.documentIdentity.digest, sha256SemanticFingerprint(document))
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
