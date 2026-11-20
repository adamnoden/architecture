import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'

test('the fixed inlet is the same saved, edited and CLI proposal with exact upstream fault identity', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readFixedInletCase()
  const source = await readEngineeringDocument(design)
  const document = { ...source, stages: { inletSillInsert: source.stages.inletSillInsert,
    inletFault: source.stages.inletFault, fixedInlet: request.fixed.settings } }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.equal(before.engineering.fixedInlet?.status, 'conditional-whole-arrangement')
  assert.equal(before.engineering.fixedInlet?.source.insertCaseDigest, before.engineering.inletSillInsert?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.source.faultCaseDigest, before.engineering.inletFault?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.evidence.preSiteArrangementComplete, false)
  assert.equal(before.engineering.fixedInlet?.supportDevelopment.source.candidateCaseDigest,
    before.engineering.fixedInlet?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.supportDevelopment.evidence.completeSupportCapacity, false)
  assert.equal(before.engineering.inletRemovals, undefined)
  const changed = { ...document, stages: { ...document.stages,
    fixedInlet: { ...document.stages.fixedInlet, riserYMm: request.fixed.settings.riserYMm + 20 } } }
  const after = await compileEngineeringDocument(changed)
  assert.notDeepEqual(after.engineering.fixedInlet?.drawing, before.engineering.fixedInlet?.drawing)
  assert.notDeepEqual(after.engineering.fixedInlet?.branches.map(branch => branch.pressurePathMm), before.engineering.fixedInlet?.branches.map(branch => branch.pressurePathMm))
  assert.deepEqual(after.engineering.inletFault, before.engineering.inletFault)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.deepEqual(after.manifest.filter(row => row.stage !== 'fixedInlet'), before.manifest.filter(row => row.stage !== 'fixedInlet'))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(before)))
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { fixedInlet: request.fixed.settings } }), /requires explicit saved insert and fault/)
  await assert.rejects(compile.fixedInletCase({ ...request.fixed, bindingDigest: 'stale' }), /Stale/)
  await assert.rejects(compile.fixedInletCase({ ...request.fixed, approved: true }), /without derived evidence/)
  const fault = JSON.parse(JSON.stringify(document))
  fault.stages.inletFault.branches.plant.highHoodOpen = false
  const failed = await compileEngineeringDocument(fault)
  assert.equal(failed.engineering.fixedInlet?.status, 'rejected-geometry')
  assert.ok(failed.engineering.fixedInlet?.geometryBlockers.includes('plant:SOURCE_FED_FAULT_PATH_REJECTED'))
})

test('saved inlet temperature changes recompute both thermal subroutes and actual receiver wrenches without moving the pipe or fault case', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...source, stages: { inletSillInsert: source.stages.inletSillInsert,
    inletFault: source.stages.inletFault, fixedInlet: source.stages.fixedInlet } }
  const before = await compileEngineeringDocument(document)
  const changed = { ...document, stages: { ...document.stages,
    fixedInlet: { ...document.stages.fixedInlet, localPipeTemperatureRangeK: 80 } } }
  const after = await compileEngineeringDocument(changed)
  const baseline = before.engineering.fixedInlet
  const edited = after.engineering.fixedInlet
  assert.ok(baseline && edited)
  const original = baseline.supportDevelopment
  const result = edited.supportDevelopment
  assert.ok(Math.abs(result.thermal[0].result.combinedFixedPointWrench.forceComponentBoundsN[1]
    - 2 * original.thermal[0].result.combinedFixedPointWrench.forceComponentBoundsN[1]) < .000001)
  assert.notDeepEqual(result.receivers.guidedRoute.actions.thermalActionWrenches,
    original.receivers.guidedRoute.actions.thermalActionWrenches)
  assert.notDeepEqual(result.receivers.guidedRoute.elasticComparisons, original.receivers.guidedRoute.elasticComparisons)
  assert.deepEqual(result.receivers.guidedRoute.geometry, original.receivers.guidedRoute.geometry)
  assert.deepEqual(edited.branches.map(branch => branch.pressurePathMm), baseline.branches.map(branch => branch.pressurePathMm))
  assert.deepEqual(after.engineering.inletFault, before.engineering.inletFault)
  assert.deepEqual(after.plans, before.plans)
  assert.equal(result.evidence.selectedHouseAdoption, false)
  assert.equal(result.evidence.fullLodgeAndHouseSupportNetworkEstablished, false)
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(changed), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli.engineering.fixedInlet.supportDevelopment, JSON.parse(JSON.stringify(result)))
})
