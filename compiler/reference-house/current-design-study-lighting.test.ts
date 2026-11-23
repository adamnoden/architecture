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
  assert.deepEqual(result.diagnostics.map(row => row.code), ['IAS_LIGHTING_SUPPLY_INTERFACE_UNBOUND', 'IAS_LIGHTING_RISER_TRANSITION_UNRESOLVED'])
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

test('every additional socket owns its real deep station and hand use; task lamp does not borrow background fitting envelope', () => {
  const result = run()
  assert.equal(result.serviceStations.length, 2)
  assert.ok(result.serviceStations.every(station => station.localDepthMm === 75 && station.usableDepthMm === 55))
  const station = result.serviceStations.find(value => value.id.endsWith('side-socket'))!
  const stand = result.arrangements.find(value => value.id === 'portable')!.addedOccupiedStandMm!
  assert.ok(stand[2] < station.usePlanMm[0])
  const oldStand = structuredClone(basis)
  oldStand.room.occupied = [...oldStand.room.occupied, ['old-side-stand', [stand[0] + 50, stand[1], stand[2] + 50, stand[3]]]]
  assert.ok(deriveStudyLighting(choices, oldStand, components).diagnostics.some(d => d.code === 'IAS_LIGHTING_STATION_ACCESS_REJECTED'))
  const task = result.fixedInterfaces.find(row => row.sourceId === 'wall-task')!
  assert.equal(task.projectionEnvelopeMm, 392.5)
  assert.equal(task.qualification, 'UNQUALIFIED_TASK_CARRIER_AND_LEAD')
  assert.notEqual(task.projectionEnvelopeMm, result.corner.module.completeProjectionMm)
})

test('public CLI reads and compiles the same explicit lighting document and producer rejects stale views', async () => {
  const { execFileSync } = await import('node:child_process')
  const cwd = new URL('../../', import.meta.url)
  const document = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--read-study-lighting', '-'], {
    cwd, input: JSON.stringify(design), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  const actual = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    cwd, input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  const expected = await compileEngineeringDocument(document)
  assert.deepEqual(actual.engineering.studyLighting, expected.engineering.studyLighting)
  execFileSync(process.execPath, ['--import', 'tsx', 'project/ias/studies/adaptable-study-lighting.mjs', '--check'], { cwd, stdio: 'pipe' })
})

test('actual carrier geometry, core lever arm and complete first rest use the same saved room inputs', () => {
  const result = run(), d = result.construction
  assert.equal(d.status, 'DEAD_MOCKUP_GEOMETRY_COMPARISON')
  assert.deepEqual(d.issues, [])
  assert.equal(d.attachmentPoints.length, 4)
  assert.equal(d.fixedEnclosures.length, 3)
  const junction = d.fixedEnclosures[2]
  assert.ok(junction.bodyDepthMm[1] < d.carrier.depthMm[0])
  assert.equal(junction.independentFixedCoverDepthMm![1], d.carrier.depthMm[0])
  assert.equal(junction.requiredDecorativeJointMm, basis.room.settingMm)
  assert.equal(d.coreFaceYMm, result.corner.bayPlanMm[1] + 75)
  assert.equal(d.loadDemand.weightN, 29.43)
  assert.ok(Math.abs(d.loadDemand.coreMomentNm - 7.50465) < 1e-10)
  assert.ok(d.loadDemand.coreMomentNm > d.loadDemand.faceMomentNm)
  assert.ok(d.carrier.carrierStockMassKgUpperComparison > 0)
  assert.ok(d.carrier.remainingAuthoredMassBudgetKg > 0)
  assert.equal(d.containment.sourceConnectedToCurrentHouseCircuit, false)
  assert.ok(d.attachmentPoints.every(point => point.id.startsWith('IAS/STUDY/carrier/bolt/')))
  assert.deepEqual(d.firstRelease.conflictingOccupiedIds, [])
  assert.equal(d.firstRelease.cradle.capacityAndFloorSupportAccepted, false)
  const deeper = run({ serviceTotalDepthMm: 85 }).construction
  assert.deepEqual(deeper.attachmentPoints, d.attachmentPoints)
  assert.ok(deeper.loadDemand.coreMomentNm > d.loadDemand.coreMomentNm)
  assert.deepEqual(deeper.carrier.xMm, d.carrier.xMm)
  assert.ok(run({ socketCentreZMm: 1100 }).construction.issues.includes('fixed-electrical-boxes-overlap'))
  const heavierSteel = structuredClone(components); heavierSteel.cornerConstruction = { ...heavierSteel.cornerConstruction, steelThicknessMm: 3 }
  assert.ok(deriveStudyLighting(choices, basis, heavierSteel).diagnostics.some(row => row.code === 'IAS_LIGHTING_CARRIER_RESERVE_REJECTED'))
})

test('longer assembled projection rejects the actual first rest and a changed mass recomputes every attachment demand', () => {
  const baseline = run(), larger = structuredClone(components)
  larger.wallLamp.reservedCompleteProjectionMm = 400
  const adverse = deriveStudyLighting(choices, basis, larger)
  assert.equal(adverse.status, 'GEOMETRY_REJECTED')
  assert.ok(adverse.construction.issues.includes('complete-module-outside-first-rest'))
  const heavier = structuredClone(components); heavier.projectRequirements.wallModuleMaximumInstalledMassKg *= 2
  const changed = deriveStudyLighting(choices, basis, heavier)
  assert.equal(changed.construction.loadDemand.coreMomentNm, baseline.construction.loadDemand.coreMomentNm * 2)
  assert.equal(changed.construction.loadDemand.normalCoupleN, baseline.construction.loadDemand.normalCoupleN * 2)
  assert.equal(changed.construction.loadDemand.equalFourFixingShearN, baseline.construction.loadDemand.equalFourFixingShearN * 2)
  assert.equal(changed.construction.firstRelease.cradle.demandKg, baseline.construction.firstRelease.cradle.demandKg * 2)
  assert.deepEqual(changed.construction.firstRelease.sweepPlanMm, baseline.construction.firstRelease.sweepPlanMm)
  assert.deepEqual(changed.commonRoom, baseline.commonRoom)
  assert.deepEqual(changed.kitchen, baseline.kitchen)
})


test('side-entry bends meet a real straight collar tangent and retain setting territory', () => {
  const baseline = run(), branches = baseline.construction.containment.localEntryBranches
  assert.equal(branches.length, 3)
  for (const branch of branches) {
    const { bend, collar } = branch
    assert.deepEqual(bend.endMm, collar.startMm)
    assert.equal(collar.boxEntryMm[0] - collar.startMm[0], 30)
    assert.equal(bend.endMm[0] - bend.startMm[0], 70)
    assert.equal(bend.endMm[2] - bend.startMm[2], 70)
    assert.deepEqual(bend.startUnitTangent, [0, 0, 1])
    assert.deepEqual(bend.endUnitTangent, [1, 0, 0])
    assert.ok(Object.values(branch.settingClearanceMm).every(gap => gap >= branch.requiredSettingMm))
    assert.deepEqual(branch.issues, [])
    assert.equal(branch.commonRiserDepthTransitionResolved, false)
    assert.equal(branch.currentHouseSupplyConnected, false)
  }
  assert.equal(branches[0].bend.axisCoreDepthMm, 51.5)
  assert.equal(branches[0].bend.startMm[1], baseline.construction.coreFaceYMm - 51.5)
  assert.equal(branches[2].bend.axisCoreDepthMm, 37)
  assert.equal(branches[2].bend.startMm[1], baseline.construction.coreFaceYMm - 37)
  assert.equal(branches[0].settingClearanceMm.left, 9)
  const oldBay = structuredClone(components); oldBay.projectRequirements.bayWidthMm = 300
  const rejected = deriveStudyLighting(choices, basis, oldBay)
  assert.equal(rejected.status, 'GEOMETRY_REJECTED')
  assert.ok(rejected.construction.issues.includes('entry-branch-setting-envelope-outside-local-field'))
  assert.equal(rejected.construction.containment.localEntryBranches[0].settingClearanceMm.left, 4)
  assert.deepEqual(rejected.commonRoom, baseline.commonRoom)
  assert.deepEqual(rejected.kitchen, baseline.kitchen)
  const largeCollar = structuredClone(components); largeCollar.cornerConstruction = { ...largeCollar.cornerConstruction, entryCollarAxialLengthMm: 60 }
  assert.ok(deriveStudyLighting(choices, basis, largeCollar).construction.issues.includes('entry-branch-setting-envelope-outside-local-field'))
  const deeper = run({ serviceTotalDepthMm: 85 }).construction.containment.localEntryBranches
  assert.equal(deeper[0].bend.axisCoreDepthMm, branches[0].bend.axisCoreDepthMm + 10)
  assert.equal(deeper[0].bend.startMm[1], branches[0].bend.startMm[1] - 10)
  assert.equal(deeper[2].bend.axisCoreDepthMm, branches[2].bend.axisCoreDepthMm + 10)
  assert.equal(deeper[2].bend.startMm[1], branches[2].bend.startMm[1] - 10)
  assert.deepEqual(deeper[0].bend.startMm.filter((_, i) => i !== 1), branches[0].bend.startMm.filter((_, i) => i !== 1))
})

test('common-depth purpose cases preserve real device/route volumes while rejecting the stock rear route and unknown reference ports', () => {
  const r = run(), c = r.commonDepthCornerComparison
  assert.equal(c.selection, 'unselected-comparison')
  assert.equal(c.commonAxisCoreDepthMm, 37)
  assert.equal(c.accessoryFaceRecessMm, 14.5)
  assert.equal(c.stockComparison.nominalRearSpaceMm, 24)
  assert.equal(c.stockComparison.requiredRouteSpaceMm, 30)
  assert.equal(c.stockComparison.rearThroughRouteFits, false)
  assert.equal(c.stockComparison.manufacturerPortCoordinatesQualified, false)
  assert.ok(c.diagnostics.some(d => d.code === 'IAS_LIGHTING_REFERENCE_BOX_PORT_COORDINATES_UNSUPPORTED' && d.state === 'unsupported'))
  assert.equal(c.purpose.internalBypassWidthMm, 45)
  assert.equal(c.purpose.requiredCollarSpaceMm, 40)
  assert.equal(c.purpose.collarSideClearanceMm, 7.5)
  assert.equal(c.purpose.collarRearClearanceMm, 6.5)
  assert.equal(c.purpose.collarFrontClearanceMm, 6.5)
  assert.equal(c.evidence.localGeometryPassing, true)
  assert.equal(c.accessoryUse.insertedPlugRoomwardProjectionBeyondDecorationMm, 5.5)
  assert.equal(c.accessoryUse.actualRecessOpeningAndBodyGripQualified, false)
  assert.ok(c.diagnostics.some(d => d.code === 'IAS_LIGHTING_COMMON_DEPTH_RECESSED_GRIP_UNQUALIFIED' && d.state === 'unsupported'))
  for (const box of c.purpose.enclosures) {
    assert.equal(box.accessoryReservedVolumeXYZMm[4]! - box.accessoryReservedVolumeXYZMm[1]!, 23)
    assert.equal(box.bodyDepthMm[0], 13.5)
    assert.equal(box.fixings.length, 4)
    assert.ok(box.fixings.every(f => f.hardLandDepthMm[0]! >= 7.5 && f.hardLandDepthMm[1]! >= f.hardLandDepthMm[0]!))
    assert.equal(box.actualProductInterfaceQualified, false)
    assert.match(box.deviceReferenceBinding, /unbound/)
    assert.equal(box.protectedCoverRetainedOnDecorativeRelease, true)
    assert.equal(box.fixedRecessSurroundRetainedOnDecorativeRelease, true)
  }
  assert.equal(c.purpose.permanentFabricCutsRequired, false)
  assert.equal(c.purpose.deviceTerminalsConnected, false)
  assert.equal(c.purpose.completeRoomCircuit, false)
  for (const key of ['actualReferenceProductConnected', 'equipmentTerminalGeometryComplete', 'installedProtectionQualified', 'materialAdmission', 'completeRenewalQualified', 'physicalTrialComplete', 'ownerAcceptance', 'candidateSelected'] as const) assert.equal(c.evidence[key], false)
})

test('finite straight pieces, collars and authored case ports meet at the same common plane with independent supports', () => {
  const c = run().commonDepthCornerComparison
  assert.equal(c.purpose.allMatesCoaxial, true)
  assert.equal(c.purpose.externalBendsRequired, 0)
  assert.equal(c.purpose.legacyR70RequirementRetainedWhereBendsExist, true)
  assert.equal(c.purpose.pipes.length, 3)
  assert.equal(c.purpose.collars.length, 6)
  assert.equal(c.purpose.pipeClips.length, 3)
  assert.equal(c.purpose.straightContainmentLengthMm, 960)
  for (const [i, pipe] of c.purpose.pipes.entries()) {
    const collar = c.purpose.collars.find(x => JSON.stringify(x.startXYZMm) === JSON.stringify(pipe.endXYZMm))!
    assert.ok(collar)
    assert.deepEqual(collar.endXYZMm, c.purpose.enclosures[i]!.bottomPort.pointXYZMm)
    assert.equal(pipe.startXYZMm[0], pipe.endXYZMm[0])
    assert.equal(pipe.startXYZMm[1], pipe.endXYZMm[1])
    assert.equal(pipe.outsideDiameterMm, 20)
    assert.ok(c.purpose.pipeClips[i]!.maximumUnsupportedLengthToEndPortMm <= c.choices.maximumClipSpanMm)
  }
})

test('whole cases require a paid 75mm draw and a separate rest; the parked module and occupied floor remain controls', () => {
  const c = run().commonDepthCornerComparison
  assert.equal(c.renewal.requiredWholeEnclosureNormalDrawMm, 66.5)
  assert.equal(c.renewal.firstNormalDrawMm, 75)
  assert.equal(c.renewal.additionalTemporaryFloorTerritoryM2, .04)
  assert.deepEqual(c.renewal.secondaryRestPlanMm, [800, 2450.5, 1000, 2650.5])
  assert.ok(c.renewal.moves.every(move => move.conflictingIds.length === 0))
  assert.equal(c.renewal.qualifiedUnionsAndToolRelease, false)
  const short = structuredClone(components)
  short.commonDepthCornerCandidate = { ...short.commonDepthCornerCandidate, firstNormalDrawMm: 50 }
  const failed = deriveStudyLighting(choices, basis, short).commonDepthCornerComparison
  assert.equal(failed.status, 'GEOMETRY_REJECTED')
  assert.ok(failed.geometryIssues.includes('complete-enclosure-normal-draw-is-too-short'))
  const blocked = structuredClone(basis)
  blocked.room.occupied = [...blocked.room.occupied, ['new-obstruction-in-rest-corner', [800, 2450.5, 805, 2455.5]]]
  assert.ok(deriveStudyLighting(choices, blocked, components).commonDepthCornerComparison.geometryIssues.includes('secondary-rest-intersects-occupied-or-main-rest'))
  const unsupported = structuredClone(basis)
  unsupported.room.bands = unsupported.room.bands.map(b => [b[0], Math.max(b[1]!, 2500), b[2], b[3]])
  assert.ok(deriveStudyLighting(choices, unsupported, components).commonDepthCornerComparison.geometryIssues.includes('secondary-rest-is-outside-actual-floor'))
  const weakFixing = structuredClone(components)
  weakFixing.commonDepthCornerCandidate = { ...weakFixing.commonDepthCornerCandidate, fixingEdgeMm: 10 }
  assert.ok(deriveStudyLighting(choices, basis, weakFixing).commonDepthCornerComparison.geometryIssues.includes('front-fixing-access-intersects-internal-port-hardware'))
  const smallRest = structuredClone(components)
  smallRest.commonDepthCornerCandidate = { ...smallRest.commonDepthCornerCandidate, secondaryRestSizeMm: 180 }
  assert.ok(deriveStudyLighting(choices, basis, smallRest).commonDepthCornerComparison.geometryIssues.includes('complete-enclosure-does-not-fit-secondary-rest'))
})

test('narrow cases cannot manufacture a pass by dropping collars, device volume or either 5mm allowance', () => {
  const narrow = structuredClone(components)
  narrow.commonDepthCornerCandidate = { ...narrow.commonDepthCornerCandidate, enclosureWidthMm: 150 }
  const result = deriveStudyLighting(choices, basis, narrow)
  assert.equal(result.commonDepthCornerComparison.status, 'GEOMETRY_REJECTED')
  assert.ok(result.commonDepthCornerComparison.geometryIssues.includes('purpose-bypass-loses-collar-and-two-setting-allowances'))
  assert.deepEqual(result.construction, run().construction)
  const deepDevice = structuredClone(components)
  deepDevice.socket = { ...deepDevice.socket, bodyDepthMm: 48 }
  assert.ok(deriveStudyLighting(choices, basis, deepDevice).commonDepthCornerComparison.geometryIssues.includes('device-body-enters-case-rear-shell'))
  const shallow = run({ serviceTotalDepthMm: 27 }).commonDepthCornerComparison
  assert.ok(shallow.geometryIssues.includes('purpose-enclosure-enters-retained-boundary-or-setting-space'))
  assert.equal(shallow.evidence.candidateSelected, false)
})

test('candidate parameter changes recompute side space, depth and mass requirements without adopting or rewriting the legacy comparison', () => {
  const baseline = run(), wider = structuredClone(components)
  wider.commonDepthCornerCandidate = { ...wider.commonDepthCornerCandidate, enclosureWidthMm: 190, secondaryRestSizeMm: 220, maximumEnclosureMassKg: 4 }
  const changed = deriveStudyLighting(choices, basis, wider)
  assert.equal(changed.commonDepthCornerComparison.purpose.internalBypassWidthMm, 50)
  assert.equal(changed.commonDepthCornerComparison.loadInterface.authoredTotalCaseGravityN, 4 * 3 * 9.81)
  assert.equal(changed.commonDepthCornerComparison.loadInterface.sourceModelMassFeedbackApplied, false)
  assert.deepEqual(changed.construction, baseline.construction)
  assert.deepEqual(changed.commonRoom, baseline.commonRoom)
  assert.deepEqual(changed.kitchen, baseline.kitchen)
  const deeper = run({ serviceTotalDepthMm: 85 }).commonDepthCornerComparison
  assert.equal(deeper.commonAxisCoreDepthMm, 47)
  assert.equal(deeper.accessoryFaceRecessMm, 14.5)
  assert.equal(deeper.purpose.enclosures[0]!.bodyDepthMm[0], 23.5)
})
