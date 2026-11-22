import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { resolveCurrentDesign } from './current-design/resolve.js'
import { readStudyRoomKitReferenceCase } from './current-design/assemblies/study-room-kit.js'
import { admitStudyLightingCase, deriveStudyLighting, lightingBasis, readLightingComponents, readStudyLightingReferenceCase } from './current-design/assemblies/study-lighting.js'
import { drawStudyLightingComparison, drawStudyLightingServiceCorner } from './current-design/assemblies/study-lighting-views.js'
import { compileEngineeringDocument, readStudyLightingDocument } from './current-design/engineering-document.js'
import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableStudyLightingId, engineeringBase, engineeringTicket, replayEngineeringEdit, saveEngineeringEdit } from './current-design/engineering-edit.js'

const design = readGeorgianDesignSnapshot(), compiler = prepareCurrentDesignCompile(design)
const kit = await compiler.studyRoomKit({ ...readStudyRoomKitReferenceCase(), finishDepthMm: 15, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5 })
const basis = lightingBasis(resolveCurrentDesign(design), kit), components = readLightingComponents(), choices = readStudyLightingReferenceCase()
const run = (change = {}) => deriveStudyLighting({ ...choices, ...change }, basis, components)

test('four actual furnished-room comparisons and central kitchen share source geometry without invented performance', () => {
  const result = run()
  assert.equal(result.status, 'DEVELOPMENT_COMPARISON')
  assert.deepEqual(result.diagnostics, [])
  assert.deepEqual(result.arrangements.map(row => row.id), ['portable', 'lamps-with-wall', 'wall-led', 'ceiling-with-lamps'])
  assert.equal(new Set(result.arrangements.map(row => row.commonGeometryDigest)).size, 1)
  assert.deepEqual(result.commonRoom.occupied, kit.kit.occupied)
  assert.deepEqual(result.commonRoom.southModuleXZMm, kit.wallTransition.field.moduleXZMm)
  assert.ok(result.arrangements.every(row => row.roles.every(role => role.photometricAdequacy === 'UNMEASURED') && row.photometry.taskLux === null))
  assert.deepEqual(result.kitchen.tableXYWHMm, [8500, 9100, 800, 1200])
  assert.deepEqual(result.kitchen.taskMm, [8700, 9400, 750])
  assert.equal(result.kitchen.fixedFallback.wholeCeilingRequired, false)
  assert.ok(Object.values(result.evidence).every(value => value !== true || value === result.evidence.localInterfacesChanged))
  for (const key of ['materialAdmission', 'ownerAcceptance', 'anchorCapacity', 'electricalRelease', 'wholeCeilingMandated', 'craftedKitReopened'] as const) assert.equal(result.evidence[key], false)
})

test('real box drives local depth rejection; depth edit moves face/draw/territory while room and door remain controls', () => {
  const baseline = run(), shallow = run({ serviceTotalDepthMm: 27 }), deeper = run({ serviceTotalDepthMm: 85 })
  assert.equal(baseline.corner.connectedUsableRoutingDepthMm, 55)
  assert.equal(baseline.corner.remainingBoxDepthMm, 8)
  assert.equal(shallow.status, 'GEOMETRY_REJECTED')
  assert.ok(shallow.diagnostics.some(d => d.code === 'IAS_LIGHTING_DEPTH_REJECTED'))
  assert.equal(deeper.corner.socketCentreMm[1], baseline.corner.socketCentreMm[1] - 10)
  assert.equal(deeper.corner.connectedUsableRoutingDepthMm, 65)
  assert.ok(deeper.corner.conservativeFloorTerritoryM2 > baseline.corner.conservativeFloorTerritoryM2)
  assert.deepEqual(deeper.commonRoom, baseline.commonRoom)
  assert.deepEqual(deeper.kitchen, baseline.kitchen)
  const largeBox = structuredClone(components); largeBox.backBox.depthMm = 60
  assert.ok(deriveStudyLighting(choices, basis, largeBox).diagnostics.some(d => d.code === 'IAS_LIGHTING_DEPTH_REJECTED'))
})

test('complete fitting draw, retained skirt release and actual furniture adverse case are charged', () => {
  const result = run(), c = result.corner
  assert.deepEqual(c.retainedSkirtingEndXMm, [1225, 1345])
  assert.equal(c.retainedSkirtingDrawMm, 22)
  assert.equal(c.lowRouteStopXMm, 1220)
  assert.equal(c.bayBottomZMm, 155)
  assert.ok(c.completeModuleDrawPlanMm[1] < c.panelDrawPlanMm[1])
  assert.ok(c.localReplacedNorthPanelIds.length > 0)
  const blocked = structuredClone(basis)
  blocked.room.occupied = [...blocked.room.occupied, ['actual-new-obstruction', c.completeModuleDrawPlanMm]]
  assert.equal(deriveStudyLighting(choices, blocked, components).status, 'GEOMETRY_REJECTED')
  assert.ok(deriveStudyLighting(choices, blocked, components).diagnostics.some(d => d.code === 'IAS_LIGHTING_ACCESS_REJECTED'))
})

test('hand change affects actual task/lead; failure, finish and missing carrier stay explicit; automation is optional', () => {
  const baseline = run(), right = run({ lampHand: 'right' })
  assert.notDeepEqual(right.leads.desk.pathMm, baseline.leads.desk.pathMm)
  assert.ok(right.leads.desk.routedMm > baseline.leads.desk.routedMm)
  assert.deepEqual(right.corner, baseline.corner)
  assert.deepEqual(right.kitchen, baseline.kitchen)
  const failedPortable = run({ arrangement: 'portable', failedSourceId: 'floor-fill' })
  assert.equal(failedPortable.controls.ordinaryArrivalWorking, false)
  assert.ok(failedPortable.diagnostics.some(d => d.code === 'IAS_LIGHTING_ARRIVAL_UNAVAILABLE'))
  assert.equal(run({ failedSourceId: 'floor-fill' }).controls.ordinaryArrivalWorking, true)
  assert.equal(run({ localWallModule: false }).status, 'GEOMETRY_REJECTED')
  const dark = run({ finishTrial: 'darker-oak' })
  assert.ok(dark.diagnostics.some(d => d.code === 'IAS_LIGHTING_FINISH_TRIAL_INVALIDATED'))
  assert.deepEqual(dark.commonRoom, baseline.commonRoom)
  assert.notEqual(drawStudyLightingComparison(dark), drawStudyLightingComparison(baseline))
  assert.deepEqual(run({ automationConnected: true }).arrangements, baseline.arrangements)
  assert.equal(baseline.controls.automationRequired, false)
})

test('unsupported settings and incompatible source are rejected, not quietly defaulted', () => {
  for (const change of [{ units: 'cm' }, { serviceTotalDepthMm: NaN }, { serviceTotalDepthMm: 10 }, { failedSourceId: 'invented' }, { accepted: true }]) {
    assert.throws(() => admitStudyLightingCase({ ...choices, ...change }), /UNSUPPORTED_INPUT/)
  }
  const staleKit = structuredClone(kit); staleKit.kit.source.bindingDigest = '0'.repeat(64)
  assert.throws(() => lightingBasis(resolveCurrentDesign(design), staleKit), /STALE_ROOM_INTERFACE/)
  assert.match(drawStudyLightingServiceCorner(run()), /Usable route after carrier reserve: 55 mm/)
})

test('saved engineering stage uses the same sole room kit, rejects stale bindings, and depth edit preserves undo/load/reply rules', async () => {
  const document = await readStudyLightingDocument(design)
  const compiled = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.ok(compiled.engineering.studyLighting)
  assert.equal(compiled.engineering.studyLighting.lighting.source.roomKitCaseDigest, compiled.engineering.studyRoomKit!.kit.caseDigest)
  assert.deepEqual(compiled.manifest.find(row => row.stage === 'studyLighting')!.dependsOn.slice(-2), ['studyRoomKit', 'occupiedServices'])
  const state = beginEngineeringEdit(document, 'lighting-semantic')
  const ticket = engineeringTicket(state, 'old')
  const edited = applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation: {
    kind: 'set-lighting-service-depth', assemblyId: editableStudyLightingId, totalDepthMm: 27 } })
  assert.equal(edited.status, 'applied'); if (edited.status !== 'applied') return
  assert.equal(currentEngineeringReply(edited.state, ticket, { ticket }), undefined)
  assert.deepEqual(edited.state.document.stages.studyRoomKit, state.document.stages.studyRoomKit)
  const undo = replayEngineeringEdit(edited.state, engineeringBase(edited.state), 'undo')
  assert.equal(undo.status, 'applied'); if (undo.status === 'applied') assert.equal(saveEngineeringEdit(undo.state), saveEngineeringEdit(state))
  assert.equal(saveEngineeringEdit(beginEngineeringEdit(JSON.parse(saveEngineeringEdit(edited.state)), 'reload')), saveEngineeringEdit(edited.state))
  const stale = { ...document, bindings: { ...document.bindings, authoredDefaults: { ...document.bindings.authoredDefaults,
    'project/ias/studies/lighting-component-references.json': '0'.repeat(40) } } }
  await assert.rejects(() => compileEngineeringDocument(stale), /source|binding/i)
  const { studyRoomKit: _kit, ...withoutKit } = document.stages
  await assert.rejects(() => compileEngineeringDocument({ ...document, stages: withoutKit }), /sole explicit saved studyRoomKit/)
  const noStage = beginEngineeringEdit({ ...document, stages: { roofPitch: document.stages.roofPitch } }, 'absent')
  assert.equal(applyEngineeringEdit(noStage, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(noStage), operation: { kind: 'set-lighting-service-depth', assemblyId: editableStudyLightingId, totalDepthMm: 75 } }).status, 'rejected')
})
