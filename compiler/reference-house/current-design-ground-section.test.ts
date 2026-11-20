import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'

test('a saved dry-ground edit recomputes actual levels, quantities and section without transferring nominal evidence', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readGroundSectionCase()
  const source = await readEngineeringDocument(design)
  const document = { ...source, stages: { groundSection: { caseId: request.ground.caseId, settings: request.ground.settings } } }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const baseline = before.engineering.groundSection
  assert.ok(baseline)
  assert.equal(baseline.native.selected, false)
  assert.equal(baseline.native.levelsMm.ffl, 530)
  assert.equal(baseline.diagnostics[0].code, 'GROUND_SECTION_JOINED_HOUSE_RECHECK')
  assert.equal(baseline.evidence.installedAcceptance, false)
  const edited = { ...document, stages: { groundSection: { ...document.stages.groundSection,
    settings: { ...request.ground.settings, courseBottomMm: 20 } } } }
  const after = await compileEngineeringDocument(edited)
  assert.equal(after.engineering.groundSection?.native.levelsMm.ffl, 550)
  assert.notDeepEqual(after.engineering.groundSection?.native.quantities, baseline.native.quantities)
  assert.notEqual(after.engineering.groundSection?.sectionSvg, baseline.sectionSvg)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.deepEqual(after.manifest.filter(row => row.stage !== 'groundSection'), before.manifest.filter(row => row.stage !== 'groundSection'))
  assert.notEqual(after.manifest.find(row => row.stage === 'groundSection')?.resultDigest,
    before.manifest.find(row => row.stage === 'groundSection')?.resultDigest)
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(after)))
  const direct = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--ground-section', '-'], {
    input: JSON.stringify(request), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  }))
  assert.deepEqual(direct, JSON.parse(JSON.stringify(baseline)))
})

test('dry-ground source and approval injection reject, while invalid grade and crowded cages retain adverse results', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const { ground } = await compile.readGroundSectionCase()
  await assert.rejects(compile.groundSectionCase({ ...ground, selected: true }), /Stale or unsupported/)
  await assert.rejects(compile.groundSectionCase({ ...ground, bindingDigest: 'stale' }), /Stale or unsupported/)
  await assert.rejects(compile.groundSectionCase({ ...ground, settings: { ...ground.settings, sources: {} } }), /only the authored/)
  const low = await compile.groundSectionCase({ ...ground, settings: { ...ground.settings, courseBottomMm: -180 } })
  assert.equal(low.native.selected, false)
  assert.ok(low.native.diagnostics.includes('EXTERIOR_GRADE_BRIDGES_LOW_MINERAL_COURSE'))
  assert.ok(!(await compile.groundSectionCase(ground)).native.diagnostics.includes('EXTERIOR_GRADE_BRIDGES_LOW_MINERAL_COURSE'))
  const beam = ground.settings.newBeam as Readonly<Record<string, unknown>>
  const crowded = await compile.groundSectionCase({ ...ground, settings: { ...ground.settings,
    newBeam: { ...beam, barsEachFace: 4, barDiameterMm: 16 } } })
  assert.ok(crowded.native.diagnostics.includes('NEW_BEAM_COMPARISON_FAILS'))
  assert.notEqual(crowded.sectionSvg, low.sectionSvg)
})
