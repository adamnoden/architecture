import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { auditSourceCoverage } from '../../project/ccr/studies/source-coverage.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readFixedInletCase, runFixedInletCase } from './current-design/inlet-fixed-case.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'

test('the fixed inlet is the same saved, edited and CLI proposal with exact upstream fault identity', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const request = await compile.readFixedInletCase()
  const source = await readEngineeringDocument(design)
  const document = { ...source, stages: { inletSillInsert: source.stages.inletSillInsert,
    inletFault: source.stages.inletFault, fixedInlet: request.fixed.settings } }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.equal(before.engineering.fixedInlet?.status, 'rejected-geometry')
  assert.equal(before.engineering.fixedInlet?.source.insertCaseDigest, before.engineering.inletSillInsert?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.source.faultCaseDigest, before.engineering.inletFault?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.evidence.preSiteArrangementComplete, false)
  assert.ok(before.engineering.fixedInlet?.geometryBlockers.includes('utility:CURRENT_CLEAR_THROAT_BODY_INTERCEPTS_CELL'))
  assert.equal(before.engineering.fixedInlet?.wetSupportDevelopment.source.candidateCaseDigest, before.engineering.fixedInlet?.source.caseDigest)
  assert.equal(before.engineering.fixedInlet?.wetSupportDevelopment.completeSupportCapacity, false)
  const shared = before.engineering.fixedInlet?.sharedServiceFrameDevelopment
  assert.ok(shared?.status === 'unselected-whole-arrangement-comparison')
  assert.equal(shared.source.candidateCaseDigest, before.engineering.fixedInlet?.source.caseDigest)
  assert.equal(shared.source.supportCaseDigest, before.engineering.fixedInlet?.supportDevelopment.caseDigest)
  assert.equal(shared.source.wetSource.candidateCaseDigest, before.engineering.fixedInlet?.source.caseDigest)
  assert.equal(shared.operating.roomReview?.allRepresentedFrameClear, true)
  assert.equal(shared.geometry.noOldLowChassis, true)
  assert.equal(shared.geometry.noOldSingleJambCantilever, true)
  assert.equal(shared.selected, false)
  assert.equal(shared.completeSupportCapacity, false)
  assert.ok(shared.diagnostics.includes('FIXED850_ARM_CROSSES_BACK_SHELL_WITHOUT_DIMENSIONED_PASSIVE_CLOSURE'))
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
  const originalFrame = baseline.sharedServiceFrameDevelopment
  const editedFrame = edited.sharedServiceFrameDevelopment
  assert.ok(originalFrame.status === 'unselected-whole-arrangement-comparison')
  assert.ok(editedFrame.status === 'unselected-whole-arrangement-comparison')
  assert.notEqual(editedFrame.mechanics.cases[0].maximumIsolatedAnchorInteraction,
    originalFrame.mechanics.cases[0].maximumIsolatedAnchorInteraction)
  assert.equal(editedFrame.mechanics.cases[0].sourcePipeTemperatureRangeK, 80)
  assert.deepEqual(editedFrame.geometry, originalFrame.geometry)
  assert.notEqual(editedFrame.source.candidateCaseDigest, originalFrame.source.candidateCaseDigest)
  assert.equal(editedFrame.selected, false)
  assert.equal(edited.status, 'rejected-geometry')
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(changed), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli.engineering.fixedInlet.supportDevelopment, JSON.parse(JSON.stringify(result)))
  assert.deepEqual(cli.engineering.fixedInlet.sharedServiceFrameDevelopment, JSON.parse(JSON.stringify(editedFrame)))
})

test('saved guide edits regenerate the actual shared frame and unsupported guides preserve the current rejection', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...source, stages: { inletSillInsert: source.stages.inletSillInsert,
    inletFault: source.stages.inletFault, fixedInlet: source.stages.fixedInlet } }
  const before = await compileEngineeringDocument(document)
  const changed = JSON.parse(JSON.stringify(document)) as typeof document
  assert.ok(changed.stages.fixedInlet)
  changed.stages.fixedInlet = { ...changed.stages.fixedInlet, upperPipeGuideZMm: 1820 }
  const after = await compileEngineeringDocument(changed)
  const baseline = before.engineering.fixedInlet?.sharedServiceFrameDevelopment
  const raised = after.engineering.fixedInlet?.sharedServiceFrameDevelopment
  assert.ok(baseline?.status === 'unselected-whole-arrangement-comparison')
  assert.ok(raised?.status === 'unselected-whole-arrangement-comparison')
  assert.notDeepEqual(raised.geometry.members, baseline.geometry.members)
  assert.deepEqual(raised.source.hostWindow, baseline.source.hostWindow)
  assert.deepEqual(after.engineering.inletFault, before.engineering.inletFault)
  assert.deepEqual(after.plans, before.plans)
  assert.equal(after.engineering.fixedInlet?.status, 'rejected-geometry')
  changed.stages.fixedInlet = { ...changed.stages.fixedInlet, upperPipeGuideZMm: 1700 }
  const unsupported = await compileEngineeringDocument(changed)
  const comparison = unsupported.engineering.fixedInlet?.sharedServiceFrameDevelopment
  assert.ok(comparison?.status === 'unsupported-geometry')
  assert.deepEqual(comparison.diagnostics, ['SHARED_SERVICE_FRAME_REQUIRES_GUIDE_1760_TO_2000_MM'])
  assert.equal(comparison.selected, false)
  assert.equal(unsupported.engineering.fixedInlet?.status, 'rejected-geometry')
  assert.ok(unsupported.engineering.fixedInlet?.geometryBlockers.includes('utility:CURRENT_CLEAR_THROAT_BODY_INTERCEPTS_CELL'))
  const restored = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.deepEqual(restored.engineering.fixedInlet?.sharedServiceFrameDevelopment, baseline)
})

test('shared-frame method changes invalidate the source account and stale resolved requests', () => {
  const path = 'compiler/reference-house/current-design/inlet-fixed-shared-service-frame.ts'
  const resolved = readCurrentDesignResolution()
  const request = readFixedInletCase(resolved)
  const result = runFixedInletCase(resolved, request.fixed)
  const methodBlob = result.method.currentImplementations[path]
  assert.equal(methodBlob.length, 40)
  const family = resolved.disciplineBindings.find(row => row.id === 'had-fixed-inlet-arrangement')
  assert.equal(family?.identities[path], methodBlob)
  const changed = auditSourceCoverage(input => {
    const bytes = readFileSync(new URL('../../' + input, import.meta.url))
    return input === path ? Buffer.concat([bytes, Buffer.from('\n')]) : bytes
  })
  assert.ok(changed.findings.some(row => row.kind === 'changed-file' && row.path === path))
  const stale = { ...resolved, disciplineBindings: resolved.disciplineBindings.map(row => ({ ...row,
    identities: Object.hasOwn(row.identities, path) ? { ...row.identities, [path]: '0'.repeat(40) } : row.identities })) }
  assert.throws(() => readFixedInletCase(stale), /Stale fixed-inlet implementation source/)
  assert.throws(() => runFixedInletCase(stale, request.fixed), /Stale fixed-inlet implementation source/)
  const injected = { ...request.fixed, sharedServiceFrameDevelopment: result.sharedServiceFrameDevelopment }
  assert.throws(() => runFixedInletCase(resolved, injected), /without derived evidence/)
})
