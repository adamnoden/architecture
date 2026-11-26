import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { resolveCurrentDesign } from './current-design/resolve.js'
import { readStudyRoomKitReferenceCase } from './current-design/assemblies/study-room-kit.js'
import { admitStudyLightingCase, deriveStudyLighting, lightingBasis, readLightingComponents, readStudyLightingReferenceCase } from './current-design/assemblies/study-lighting.js'
import { drawStudyLightingComparison, drawStudyLightingServiceCorner } from './current-design/assemblies/study-lighting-views.js'
import { admitCommonDepthChoices } from './current-design/assemblies/study-lighting-common-depth.js'
import { compileEngineeringDocument, readStudyLightingDocument } from './current-design/engineering-document.js'
import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableStudyLightingId, engineeringBase, engineeringTicket, replayEngineeringEdit, saveEngineeringEdit } from './current-design/engineering-edit.js'

const design = readGeorgianDesignSnapshot(), compiler = prepareCurrentDesignCompile(design)
const kit = await compiler.studyRoomKit({ ...readStudyRoomKitReferenceCase(), finishDepthMm: 15, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5 })
const basis = lightingBasis(resolveCurrentDesign(design), kit), components = readLightingComponents(), choices = readStudyLightingReferenceCase()
const run = (change = {}) => deriveStudyLighting({ ...choices, ...change }, basis, components)

test('four actual furnished-room comparisons and central kitchen share source geometry without invented performance', () => {
  const result = run()
  assert.equal(result.status, 'DEVELOPMENT_COMPARISON')
  assert.deepEqual(result.diagnostics.map(row => row.code), ['IAS_LIGHTING_SUPPLY_INSTALLATION_UNQUALIFIED', 'IAS_LIGHTING_HOME_RUN_ENTRIES_UNQUALIFIED'])
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
  assert.equal(c.accessoryUse.geometryStatus, 'DECLARED_PLUG_AND_FINGER_SWEEP_CLEAR')
  assert.ok(c.diagnostics.some(d => d.code === 'IAS_LIGHTING_COMMON_DEPTH_GRIP_PHYSICAL_EVIDENCE_PENDING' && d.state === 'unqualified'))
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

test('ordinary recessed grip charges the complete plug, fingers, pins and both settings without opening electrical closures', () => {
  const r = run(), c = r.commonDepthCornerComparison, a = c.accessoryUse
  assert.deepEqual(a.completeReferencePlugMm, [50, 52, 42])
  assert.equal(a.gripSideReserveMm, 5)
  assert.equal(a.gripVerticalReserveMm, 29)
  assert.equal(a.isolatedPlateDrawReserveMm, 7)
  assert.equal(a.requiredPlugNormalDrawMm, 27)
  assert.equal(a.authoredPlugNormalDrawMm, 27)
  assert.equal(a.ordinaryUseChangesProtectiveClosures, false)
  assert.equal(a.actualRecessOpeningAndBodyGripQualified, false)
  assert.equal(a.suppliedLeadBendAndGripForceQualified, false)
  assert.ok(a.surroundOpenings.every(row => row.fixingChecks.every(f => f.reserveMm > 3.68)))
  assert.equal(a.fingerSweeps.length, 2)
  assert.ok(a.fingerSweeps.every(f => f.intendedPlugSideContact))
  for (const [change, issue] of [
    [{ accessoryOpeningWidthMm: 100 }, 'ordinary-plug-finger-sweep-loses-two-settings'],
    [{ plugNormalDrawMm: 20 }, 'normal-plug-draw-leaves-pins-in-socket'],
    [{ gripRearOffsetMm: 1 }, 'finger-engagement-crosses-protected-face-or-complete-plug-body'],
    [{ accessoryOpeningHeightMm: 180 }, 'surround-opening-removes-fixing-tool-lands'],
  ] as const) {
    const altered = structuredClone(components)
    altered.commonDepthCornerCandidate = { ...altered.commonDepthCornerCandidate, ...change }
    const x = deriveStudyLighting(choices, basis, altered)
    assert.ok(x.commonDepthCornerComparison.geometryIssues.includes(issue))
    assert.deepEqual(x.construction, r.construction)
    assert.deepEqual(x.commonRoom, r.commonRoom)
    assert.deepEqual(x.kitchen, r.kitchen)
  }
  const biggerPlug = structuredClone(components)
  biggerPlug.plug.widthMm = 70
  assert.ok(deriveStudyLighting(choices, basis, biggerPlug).commonDepthCornerComparison.geometryIssues.includes('ordinary-plug-finger-sweep-loses-two-settings'))
  assert.throws(() => admitCommonDepthChoices({ ...components.commonDepthCornerCandidate, schema: 'ias-common-depth-corner-choices/1' }), /IAS_COMMON_DEPTH_CHOICES_UNSUPPORTED/)
  const missing = { ...components.commonDepthCornerCandidate } as Record<string, unknown>
  delete missing.fingerThicknessMm
  assert.throws(() => admitCommonDepthChoices(missing), /IAS_COMMON_DEPTH_CHOICES_UNSUPPORTED/)
  const impossibleOpening = structuredClone(components)
  impossibleOpening.commonDepthCornerCandidate = { ...impossibleOpening.commonDepthCornerCandidate, accessoryOpeningWidthMm: 500 }
  assert.throws(() => deriveStudyLighting(choices, basis, impossibleOpening), /IAS_COMMON_DEPTH_OPENING_OUTSIDE_CASE/)
})

test('explicit metal stock conserves six gravity components and fails an inadequate complete-case mass ceiling', () => {
  const c = run().commonDepthCornerComparison, load = c.loadInterface
  assert.ok(load.totalKnownSteelStockKgComparison > 7.39 && load.totalKnownSteelStockKgComparison < 7.4)
  assert.ok(load.caseBudgets.every(row => row.remainingRequirementForDeviceFixingsAndOtherStockKg > .87))
  assert.equal(load.secondaryRestCompleteCaseDemandN, 29.43)
  assert.ok(load.unknownInstalledStock.includes('front-serviced unions'))
  // Derive first moments from the physical rear plate, side shell and
  // independently fixed cover, rather than trusting the supplied lump origin.
  const firstCase = c.purpose.enclosures[0]!, thickness = c.choices.shellThicknessMm
  const width = firstCase.xMm[1]! - firstCase.xMm[0]!, height = firstCase.zMm[1]! - firstCase.zMm[0]!
  const [rear, front] = firstCase.bodyDepthMm, [coverRear, coverFront] = firstCase.fixedCoverDepthMm
  const faceVolume = width * height * thickness
  const sideVolume = 2 * (width + height) * (front! - rear!) * thickness
  const expectedDepth = (faceVolume * (rear! + thickness / 2) + sideVolume * (rear! + front!) / 2
    + faceVolume * (coverRear! + coverFront!) / 2) / (2 * faceVolume + sideVolume)
  assert.ok(expectedDepth > 37 && expectedDepth < 38)
  assert.ok(Math.abs(load.caseStockCentroidCoreDepthMm - expectedDepth) < 1e-12)
  for (const box of c.purpose.enclosures) {
    const row = load.knownStock.find(row => row.id === `${box.id}/case-stock`)!
    const coreY = box.bottomPort.pointXYZMm[1]! + c.commonAxisCoreDepthMm
    assert.ok(Math.abs(row.originXYZMm[1]! - (coreY - expectedDepth)) < 1e-12)
    assert.ok(Math.abs(row.kg - (2 * faceVolume + sideVolume) / 1e9 * load.steelDensityKgM3Comparison) < 1e-12)
  }
  const wrench = [0, 0, 0, 0, 0, 0]
  for (const row of load.knownStock) {
    const gravity = row.kg * 9.81, [x, y] = row.originXYZMm
    const independent = [0, 0, -gravity, -y! / 1000 * gravity, x! / 1000 * gravity, 0]
    row.gravityWrenchN_Nm.forEach((v, k) => assert.ok(Math.abs(v - independent[k]!) < 1e-10))
    independent.forEach((v, k) => { wrench[k]! += v })
  }
  wrench.forEach((v, k) => assert.ok(Math.abs(v - load.knownStockGravityWrenchN_Nm[k]!) < 1e-10))
  assert.ok(Math.abs(wrench[2]! + load.totalKnownSteelStockKgComparison * 9.81) < 1e-10)
  const tooHeavy = structuredClone(components)
  tooHeavy.commonDepthCornerCandidate = { ...tooHeavy.commonDepthCornerCandidate, shellThicknessMm: 3 }
  const failed = deriveStudyLighting(choices, basis, tooHeavy).commonDepthCornerComparison
  assert.ok(failed.geometryIssues.includes('known-case-steel-exceeds-complete-case-mass-ceiling'))
  assert.equal(failed.evidence.candidateSelected, false)
  assert.equal(load.sourceModelMassFeedbackApplied, false)
  assert.equal(load.actualInstalledMassQualified, false)
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
  assert.equal(c.renewal.completeCaseIncludingSurroundDepthMm, 61.5)
  assert.equal(c.renewal.wholeIsolatedCaseIncludesSurround, true)
  assert.equal(c.renewal.drawingCaseThroughSmallerSurroundOpeningClaimed, false)
  assert.equal(c.renewal.firstNormalDrawMm, 75)
  assert.equal(c.renewal.additionalTemporaryFloorTerritoryM2, .04)
  assert.deepEqual(c.renewal.secondaryRestPlanMm, [800, 2450.5, 1000, 2650.5])
  assert.ok(c.renewal.moves.every(move => move.conflictingIds.length === 0))
  const moved = c.renewal.moves.find(move => move.id === 'translate-left-above-main-rest')!
  assert.equal(moved.planMm[3]! - moved.planMm[1]!, 61.5)
  assert.equal(c.renewal.parkedCase.yMm[1]! - c.renewal.parkedCase.yMm[0]!, 61.5)
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


test('conventional independent home runs have finite continuous routes, bounded clearance and source-bound architectural consequences', () => {
  const r=run(), h=r.construction.localHomeRunComparison
  assert.equal(h.status,'DECLARED_EXTERNAL_CONTAINMENT_CONTINUOUS')
  assert.deepEqual(h.issues,[])
  assert.equal(h.selection,'unselected-development-direction')
  assert.deepEqual(h.routes.map(route=>route.bend.radiusMm),[70,111,152])
  assert.deepEqual(h.boxes.map(box=>box.entryAxisCoreDepthRequirementMm),[52,52,52])
  assert.equal(h.architecturalConsequence.additionalBayWidthMm,100)
  assert.equal(h.architecturalConsequence.carrierShiftXMm,-1)
  assert.equal(h.architecturalConsequence.addedConservativeFloorTerritoryM2,.013000000000000001)
  assert.equal(h.architecturalConsequence.accessoryRecessMm,0)
  assert.equal(h.independentRouteSettingMm,5)
  assert.equal(h.pairSettingMm,10)
  assert.equal(h.finishBottomZMm,150)
  assert.equal(r.localHomeRunWallDisposition.length,2)
  assert.ok(r.localHomeRunWallDisposition.flatMap(row=>row.remainingDecorativeFacesMm).every(box=>Math.min(box[2]!-box[0]!,box[3]!-box[1]!)>=50))
  assert.ok(r.localHomeRunWallDisposition.every(row=>row.remainingDecorativeFacesMm.every(box=>box[2]!>box[0]!&&box[3]!>box[1]!)))
  assert.ok(h.separations.every(row=>row.reserveMm>10.99))
  assert.ok(h.obstacleChecks.every(row=>row.reserveMm>=19.49))
  assert.ok(Object.values(h.fieldReservesMm).every(value=>value>=0))
  for(const route of h.routes){
    assert.deepEqual(route.straight.startMm,route.sourcePointMm)
    assert.deepEqual(route.straight.endMm,route.bend.startMm)
    assert.deepEqual(route.bend.endMm,route.collar.a)
    assert.equal(route.collar.b[0]!-route.collar.a[0]!,30)
    assert.equal(route.collar.b[2],h.boxes.find(b=>b.id===route.enclosureId)!.zMm.reduce((a,b)=>a+b,0)/2)
    assert.ok(route.bend.chordSagittaBoundMm>0&&route.bend.chordSagittaBoundMm<.01)
    assert.equal(route.actualHouseSupplyConnected,false)
    assert.ok(Object.values(route.reservesMm).every(value=>value>=0))
    assert.ok(route.clips.every(clip=>clip.independentlyFixed&&!clip.supportResistanceQualified))
    const spans=route.clips.slice(1).map((clip,i)=>clip.pointMm[2]!-route.clips[i]!.pointMm[2]!)
    assert.ok(spans.every(span=>span<=h.choices.maximumClipSpanMm))
  }
  assert.equal(h.stock.clipCount,10)
  const exactTubeLength=3*(Math.PI/2)*111+(600-70-375)+(1100-111-375)+(1500-152-375)
  assert.ok(Math.abs(h.stock.tubeLengthMm-exactTubeLength)<1e-9)
  const independentTubeMass=Math.PI*(10*10-9*9)*exactTubeLength*7850/1e9
  const independentCollarMass=Math.PI*15*15*90*7850/1e9
  assert.ok(Math.abs(h.stock.totalKnownContainmentStockKg-independentTubeMass-independentCollarMass)<1e-12)
  for(const [key,value] of Object.entries(h.evidence)) if(key!=='geometricContinuity') assert.equal(value,false,key)
  assert.ok(r.diagnostics.some(row=>row.code==='IAS_LIGHTING_HOME_RUN_ENTRIES_UNQUALIFIED'))
})

test('actual home-run inputs recompute stock and recut the north wall while collisions and absent references reject', () => {
  const baseline=run(), b=baseline.construction.localHomeRunComparison
  const higher=run({socketCentreZMm:650}), changed=higher.construction.localHomeRunComparison
  assert.equal(changed.routes[0]!.tubeLengthMm-b.routes[0]!.tubeLengthMm,50)
  assert.deepEqual(changed.routes.slice(1),b.routes.slice(1))
  assert.ok(changed.stock.totalKnownContainmentStockKg>b.stock.totalKnownContainmentStockKg)
  assert.deepEqual(higher.commonRoom,baseline.commonRoom)
  assert.deepEqual(higher.kitchen,baseline.kitchen)
  const narrow=structuredClone(components);narrow.localHomeRunCandidate={...narrow.localHomeRunCandidate,bayWidthMm:310}
  const rejected=deriveStudyLighting(choices,basis,narrow)
  assert.equal(rejected.construction.localHomeRunComparison.status,'GEOMETRY_REJECTED')
  assert.ok(rejected.diagnostics.some(row=>row.code==='IAS_LIGHTING_HOME_RUN_COMPARISON_REJECTED'))
  const crowded=structuredClone(components);crowded.localHomeRunCandidate={...crowded.localHomeRunCandidate,routeGapMm:6}
  assert.ok(deriveStudyLighting(choices,basis,crowded).construction.localHomeRunComparison.separations.some(row=>row.reserveMm<0))
  const wide=structuredClone(components);wide.localHomeRunCandidate={...wide.localHomeRunCandidate,bayWidthMm:420}
  const cut=deriveStudyLighting(choices,basis,wide)
  assert.equal(cut.construction.localHomeRunComparison.status,'DECLARED_EXTERNAL_CONTAINMENT_CONTINUOUS')
  assert.equal(cut.localHomeRunWallDisposition.length,4)
  assert.deepEqual(cut.commonRoom,baseline.commonRoom)
  const escaped=structuredClone(components);escaped.localHomeRunCandidate={...escaped.localHomeRunCandidate,stationOffsetXMm:200}
  const outside=deriveStudyLighting(choices,basis,escaped).construction.localHomeRunComparison
  assert.equal(outside.status,'GEOMETRY_REJECTED')
  assert.ok(outside.fieldReservesMm.carrierRight<0)
  assert.ok(outside.fieldReservesMm.restRight<0)
  const missing=structuredClone(components);delete (missing as unknown as {localHomeRunCandidate?:unknown}).localHomeRunCandidate
  assert.throws(()=>deriveStudyLighting(choices,basis,missing),/HOME_RUN_INPUT_INVALID/)
  const invalid=structuredClone(components);invalid.localHomeRunCandidate={...invalid.localHomeRunCandidate,tubeWallMm:11}
  assert.throws(()=>deriveStudyLighting(choices,basis,invalid),/HOME_RUN_INPUT_INVALID/)
  const absentPort=structuredClone(components);absentPort.localHomeRunCandidate={...absentPort.localHomeRunCandidate,lowerPortRearInsetMm:16}
  assert.equal(deriveStudyLighting(choices,basis,absentPort).construction.localHomeRunComparison.status,'GEOMETRY_REJECTED')
})


test('ordinary deeper boxes and fixed extension frames clear the complete lining and closed carrier, not just open steel',()=>{
  const r=run(),h=r.construction.localHomeRunComparison
  assert.equal(h.schema,'ias-local-home-runs/2')
  assert.equal(h.totalDepthMm,95)
  assert.deepEqual(h.boxes.map(b=>b.depthMm),[[32,79],[32,79],[32,79]])
  assert.deepEqual(h.boxes.map(b=>b.extensionDepthMm),[16,16,16])
  assert.equal(h.carrierStock.wrenchAboutCoreCentreNAndNm[4],0)
  assert.ok(h.routes.every(route=>route.reservesMm.tubeFront>=12.5))
  assert.ok(h.enclosureCarrierChecks.every(row=>row.reserveMm>=5.5))
  assert.ok(h.residualGeometryWarnings.every(w=>w.boundary==='portRear'))
  assert.ok(h.caseRenewal.every(c=>Object.values(c.restReservesMm).every(v=>v>=5)))
  assert.deepEqual(h.caseRenewal.map(c=>c.normalDrawMm),[83,83,83])
  assert.ok(h.caseRenewal.every(c=>c.sweptBodyChecks.every(v=>v.reserveMm>=5)&&c.pipeChecks.every(v=>v.reserveMm>=5)))
  for(const c of h.caseRenewal){
    assert.ok(c.pipeChecks.some(row=>row.phase==='normal-draw'&&row.routeId===h.routes.find(r=>r.enclosureId===c.id)!.id))
    assert.ok(c.pipeChecks.filter(row=>row.ownCollarExcluded).every(row=>row.phase==='normal-draw'))
    assert.equal(c.parts.find(p=>p.id==='base')!.width,72)
  }
  assert.equal(h.caseRestPlanMm[2]!-h.caseRestPlanMm[0]!,120)
  assert.equal(h.caseRestPlanMm[1]!-h.firstRestPlanMm[3]!,17)
  assert.ok(Math.abs(h.stock.extensionStockKgComparison-3*(72**2-68**2)*16*7850/1e9)<1e-12)
  assert.equal(h.stock.separateKnownSaddleReceiverStockKg,20*20*39*7850/1e9)
  const length=3*Math.PI/2*111+(600-70-375)+(1100-111-375)+(1500-152-375)
  const tubeAndCollars=(Math.PI*(10**2-9**2)*length+Math.PI*15**2*90)*7850/1e9
  assert.ok(Math.abs(h.stock.tubeCollarReceiverAndExtensionStockKgComparison-tubeAndCollars-20*20*39*7850/1e9-3*(72**2-68**2)*16*7850/1e9)<1e-12)
  const old=structuredClone(components);old.localHomeRunCandidate={...old.localHomeRunCandidate,additionalCornerDepthMm:0,accessoryExtensionMm:0,upperBoxBacksetMm:0,upperPortRearInsetMm:23.5}
  const rejected=deriveStudyLighting(choices,basis,old).construction.localHomeRunComparison
  assert.equal(rejected.status,'GEOMETRY_REJECTED')
  assert.ok(rejected.issues.some(i=>/carrier|collarFront|tubeFront/.test(i)))
  assert.ok(rejected.routes.some(route=>route.reservesMm.tubeFront<0))
  const invalidFloor=structuredClone(basis);invalidFloor.room.bands=invalidFloor.room.bands.map(b=>[b[0]!,Math.max(b[1]!,2500),b[2]!,b[3]!])
  assert.ok(deriveStudyLighting(choices,invalidFloor,components).construction.localHomeRunComparison.issues.includes('home-run-room-floor-geometry-invalid'))
  const tightMouth=structuredClone(components);tightMouth.localHomeRunCandidate={...tightMouth.localHomeRunCandidate,fixedIslandHeightMm:110}
  assert.ok(deriveStudyLighting(choices,basis,tightMouth).construction.localHomeRunComparison.issues.some(i=>i.includes('renewal-space')))
  const scaled=structuredClone(components);scaled.localHomeRunCandidate={...scaled.localHomeRunCandidate,accessoryExtensionMm:15}
  assert.ok(deriveStudyLighting(choices,basis,scaled).construction.localHomeRunComparison.issues.includes('home-run-manufactured-extension-depth-unsupported'))
})

test('the ordinary upper saddle includes the actual receiver, tool phase, stock and unchanged300mm support span',()=>{
  const h=run().construction.localHomeRunComparison,s=h.saddle!
  assert.ok(s)
  assert.equal(s.supportPath.masonryToSaddleDepthMm[0],0)
  assert.equal(s.supportPath.masonryToSaddleDepthMm[1],39)
  assert.equal(s.supportPath.penetrationSealQualified,false)
  assert.equal(s.sourceQualifiedForBend,false)
  assert.equal(s.tool.maximumDiameterMm,37)
  assert.equal(s.tool.tipMm[1]!-s.tool.endMm[1]!,205)
  assert.ok(s.bodyChecks.every(c=>c.reserveMm>=5)&&s.toolChecks.every(c=>c.reserveMm>=5))
  assert.ok(s.toolChecks.some(c=>c.obstacleId==='parked-complete-module'))
  assert.equal(h.choices.maximumClipSpanMm,300)
  assert.ok(h.routes.every(r=>r.finalSpansMm.every(span=>span<=300)))
  assert.ok(Math.abs(h.routes[2]!.finalSpansMm[0]!-169.38052083641213)<1e-10)
  const missing=structuredClone(components);missing.localHomeRunCandidate={...missing.localHomeRunCandidate,upperBendClipFraction:0}
  assert.ok(deriveStudyLighting(choices,basis,missing).construction.localHomeRunComparison.issues.includes('home-run-2-finalUnsupportedArc-rejected'))
  const noRest=structuredClone(components);noRest.localHomeRunCandidate={...noRest.localHomeRunCandidate,mainRestSouthShiftMm:0}
  assert.ok(deriveStudyLighting(choices,basis,noRest).construction.localHomeRunComparison.issues.some(s=>s.includes('renewal-space')))
  const wideTool=structuredClone(components);wideTool.localHomeRunSupportReference={...wideTool.localHomeRunSupportReference,driver:{...wideTool.localHomeRunSupportReference.driver,maximumDiameterMm:250}}
  assert.ok(deriveStudyLighting(choices,basis,wideTool).construction.localHomeRunComparison.issues.includes('home-run-bend-saddle-tool-rejected'))
})


test('a real corner notch moves only stations at the affected wall and exposes the old desk clash',()=>{
  const original=run(),notched=structuredClone(basis)
  notched.room.bands=[[1262.5,429.5,4703,489.5],[489.5,489.5,4703,1103],[489.5,1103,3303,1262.5],[429.5,1262.5,3303,2553],[429.5,2553,2720.5,3150.5]]
  const changed=deriveStudyLighting(choices,notched,components)
  assert.equal(changed.corner.westDeskSocketMm[0]-original.corner.westDeskSocketMm[0],60)
  assert.deepEqual(changed.leads.floor.pathMm,original.leads.floor.pathMm)
  assert.ok(changed.diagnostics.some(d=>d.code==='IAS_LIGHTING_STATION_ACCESS_REJECTED'))
  assert.equal(changed.arrangements.find(a=>a.id==='wall-led')!.sources.find(s=>s.id==='wall-task')!.positionMm[1]!-original.arrangements.find(a=>a.id==='wall-led')!.sources.find(s=>s.id==='wall-task')!.positionMm[1]!,60)
  const supported=structuredClone(notched)
  supported.room.occupied=supported.room.occupied.map(([id,b])=>id==='study-desk'?[id,[680,b[1],2280,b[3]]]:id==='service-emitter-study-W'?[id,[b[0],1325,b[2],2475]]:[id,b])
  const moved=deriveStudyLighting(choices,supported,components)
  assert.ok(!moved.diagnostics.some(d=>d.code==='IAS_LIGHTING_STATION_ACCESS_REJECTED'))
  assert.deepEqual(moved.leads.floor.pathMm,original.leads.floor.pathMm)
  assert.deepEqual(moved.kitchen,original.kitchen)
})


test('larger fitting gets an honestly larger rest while the former300mm rest rejects',()=>{
 const r=run(),h=r.construction.localHomeRunComparison
 assert.equal(h.firstRestPlanMm[3]!-h.firstRestPlanMm[1]!,350)
 assert.ok(h.fieldReservesMm.restFront>=30)
 const old=structuredClone(components);old.localHomeRunCandidate={...old.localHomeRunCandidate,moduleRestFrontExtensionMm:0}
 assert.ok(deriveStudyLighting(choices,basis,old).construction.localHomeRunComparison.issues.includes('home-run-field-restFront-rejected'))
 const ordinary=structuredClone(components);ordinary.localHomeRunSupportReference={...ordinary.localHomeRunSupportReference,driver:{...ordinary.localHomeRunSupportReference.driver,maximumDiameterMm:100}}
 assert.ok(deriveStudyLighting(choices,basis,ordinary).construction.localHomeRunComparison.saddle!.toolChecks.every(p=>p.reserveMm>=5))
})
