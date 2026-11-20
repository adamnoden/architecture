import assert from 'node:assert/strict'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './current-design/inlet-sill-insert.js'
import { readInletFaultCase, runInletFaultCase } from './current-design/inlet-fault.js'
import { compileFixedInletCandidate, readFixedInletSettings } from './current-design/inlet-fixed-entry.js'
import { fixedInletOperatingProof } from './current-design/inlet-fixed-operating.js'

function source() {
  const resolved = readCurrentDesignResolution()
  const insertCase = readInletSillInsertCase(resolved).insert
  const insert = runInletSillInsertCase(resolved, insertCase)
  const faultCase = readInletFaultCase(resolved, insertCase).fault
  return { resolved, insertCase, joined: { insert, faultCase, fault: runInletFaultCase(resolved, faultCase, insertCase) } }
}

test('the whole fixed inlet uses joint-free sloping R98 turns and upper pipes on actual axes', () => {
  const { resolved, joined } = source(), input = readFixedInletSettings()
  const result = compileFixedInletCandidate(resolved, input, joined)
  assert.equal(result.status, 'conditional-whole-arrangement')
  assert.deepEqual(result.geometryBlockers, [])
  assert.deepEqual(result.branches.map(row => row.pressurePathMm[0][0]), [10080, 10285])
  for (const branch of result.branches) {
    assert.equal(branch.primaryTubeAxis, 'slope-following-joint-free-through-secondary-sleeve')
    assert.equal(branch.sleeve.clearDiameterMm, 150)
    assert.ok(branch.sleeve.radialReserveAfter5Mm > 16)
    assert.ok(branch.sleeve.reverseFlowWithMinimumOffset!.ventedCrownRetained)
    assert.equal(branch.lowerTurn.construction, 'single-cold-bent-joint-free-tube')
    const expectedStraight = input.riserYMm - branch.lowerTurn.finishedWallYMm
      - input.pipeBendRadiusMm * Math.tan((Math.PI / 2 - Math.atan(1 / 50)) / 2) / Math.sqrt(1 + 1 / 2500)
    assert.ok(Math.abs(branch.lowerTurn.insideFaceToTangentMm - expectedStraight) < .0001)
    assert.ok(branch.lowerTurn.insideFaceToTangentMm >= 50)
    assert.ok(branch.lowerTurn.upperStraightEndMm > 250)
    assert.ok(Math.abs(branch.lowerTurn.angleDeg-88.8542371618)<1e-8)
    assert.ok(branch.lowerTurn.toSolidRoofAfter5Mm>1.99)
    assert.ok(branch.renewal.toActualVentThroughFullDrawAfter5Mm>50)
    assert.deepEqual(branch.renewal.primaryOffsetRangeDuringDrawMm,[3.21,18])
    assert.equal(branch.renewal.inSituLowJointRequired, false)
    assert.equal(branch.renewal.translationMm[1], 739.5)
    assert.ok(branch.renewal.toWasherFirstRestAfter10Mm > 120)
    assert.equal(branch.repairZones[0].cutToInitialBodyAfter5Mm, 47)
    assert.equal(branch.repairZones[0].newBodyToRetainedInitialBodyMm, 4)
    assert.equal(branch.repairZones[0].initialBodyToValveMm, 19)
    assert.equal(branch.sleeve.isolatedInventoryMustBeCaught, true)
    assert.equal(branch.valveControl.newRemoteDriveRequired, false)
    assert.equal(branch.support.receiverStructuralFaceYMm, 402.5)
    assert.equal(branch.support.old1000NCarrierHandlingLoadApplied, false)
    assert.ok(branch.clearances.ordinaryReachMm < 650)
    assert.equal(branch.clearances.guardToPermanentPVFieldMm, 5)
    assert.equal(branch.fault.noManualOrSiblingCredit, true)
  }
  assert.ok(result.upperPipePairAfterSettingMm > 55)
  assert.equal(result.evidence.preSiteArrangementComplete, false)
  assert.equal(result.materialDisposition.ownerExceptionRecorded, false)
  assert.equal(result.productFacts.valve.pnBar, 16)
  assert.equal(result.materialDisposition.knownPressSealCountPerBranch,8)
  assert.deepEqual(compileFixedInletCandidate(resolved, JSON.parse(JSON.stringify(input)), joined), result)
})

test('first and second lower-pipe repairs leave real separate old and new fitting bodies',()=>{
  const {resolved,joined}=source(),input=readFixedInletSettings()
  const result=compileFixedInletCandidate(resolved,input,joined)
  for(const branch of result.branches) {
    const initial=branch.components.find(part=>part.id==='initial-lower-splice')!.boxMm
    const first=branch.repairZones[0].madeBodyZMm
    assert.equal(initial[2]-first[1],4)
    assert.equal(branch.repairZones[0].initialBodyToValveMm,19)
    const secondEnd=branch.repairZones[0].secondPlainPipeCutZMm+48
    assert.equal(first[0]-secondEnd,4)
  }
  const formerInitialStart=1080-48,formerRepairEnd=1000+48
  assert.equal(formerRepairEnd-formerInitialStart,16)
  const formerCuts=compileFixedInletCandidate(resolved,{...input,lowerCutZMm:1000,upperCutZMm:1400},joined)
  assert.ok(formerCuts.geometryBlockers.includes('utility:lower-cut:INITIAL_BODY_INTERCEPTS_VALVE'))
})

test('native joined jaw motions, known-action reactions and frost sensitivity keep distinct proof ceilings',()=>{
  const {resolved,joined}=source(),input=readFixedInletSettings()
  const before=compileFixedInletCandidate(resolved,input,joined)
  assert.equal(before.operatingProof.toolPoses.length,12)
  assert.equal(before.operatingProof.nativeJawPoseBoundsClear,true)
  assert.equal(before.operatingProof.continuousJawBound.openClosedAndEveryIntermediateHingeAngleCovered,true)
  assert.equal(before.operatingProof.toolPoses.every(p=>p.allMachineAndHandMotionQualified===false),true)
  for(const branch of before.branches) {
    const hood=branch.controlArrangementComparison.wholeOrdinaryValveHood
    assert.ok(hood.completeHandleInsideAfter3PlateAnd5SettingMm>0)
    assert.ok(hood.throatToPrimaryAfter5Mm>0)
    assert.ok(hood.throatToOwnActualCellBoundaryAfterLiningAnd5Mm>0)
    assert.ok(hood.headWithin80MmFunnelAfter10Mm>20)
    assert.equal(hood.stationaryBonnetLandingRequired,false)
    assert.equal(hood.liveFaultContainedInsideShutoff,false)
    assert.equal(hood.fittedDischargeCoefficientAndSpraySeamsQualified,false)
    assert.equal(hood.passiveOccupiedCaseRequiresClosedHood,true)
    assert.equal(hood.hoodRetentionRequiresHouseholdPower,false)
    assert.ok(hood.normalControlOpening.lowestEdgeToInstalledWasherAfter5Mm>90)
    assert.equal(hood.normalControlOpening.afterDrawBackToFullHandleAfter5Mm,33.8)
  }
  const unlinedFit = compileFixedInletCandidate(resolved, { ...input, riserYMm: 605 }, joined)
  assert.ok(unlinedFit.geometryBlockers.includes('utility:WHOLE_VALVE_HOOD_THROAT_LEAVES_OWN_CELL'))
  for(const scenario of before.operatingProof.supportFreebody.equilibriumCases) {
    assert.equal(scenario.completeEquilibrium,true)
    assert.deepEqual(scenario.forceResidualN,[0,0,0])
    assert.deepEqual(scenario.momentResidualNmm,[0,0,0])
  }
  assert.ok(before.operatingProof.noFlowFrost.firstZeroCelsiusHours>2)
  assert.ok(before.operatingProof.noFlowFrost.firstZeroCelsiusHours<2.02)
  assert.equal(before.operatingProof.noFlowFrost.status,'unqualified-no-flow-frost')
  const thicker=compileFixedInletCandidate(resolved,{...input,protectedLowerDiameterMm:70},joined)
  assert.ok(thicker.operatingProof.noFlowFrost.firstZeroCelsiusHours>before.operatingProof.noFlowFrost.firstZeroCelsiusHours)
  assert.deepEqual(thicker.operatingProof.supportFreebody,before.operatingProof.supportFreebody)
  assert.deepEqual(thicker.operatingProof.toolPoses,before.operatingProof.toolPoses)
  assert.ok(thicker.geometryBlockers.some(code=>code.includes('LOWER_TURN_INTERCEPTS_ROOF_OUTSIDE_DECLARED_OPENING')))
  const open=compileFixedInletCandidate(resolved,{...input,controlHoodDrawMm:150},joined)
  assert.ok(open.geometryBlockers.includes('utility:PASSIVE_SOURCE_FED_CASE_REQUIRES_CLOSED_CONTROL_HOOD'))
  assert.deepEqual(open.branches[0].sleeve,before.branches[0].sleeve)
  assert.deepEqual(open.branches[0].pressurePathMm,before.branches[0].pressurePathMm)
  for(const pose of before.operatingProof.toolPoses.filter(p=>p.joint==='exterior-tail')) {
    const branch=before.branches.find(b=>b.branch===pose.branch)!
    assert.ok(Math.abs(pose.cutCentreMm[2]-branch.pressurePathMm[0][2]-(pose.cutCentreMm[1]-input.outerCutYMm)/50)<1e-8)
  }
})

test('a hand-solvable orthogonal force has the expected paired bearing reactions and adverse signs',()=>{
  const result=fixedInletOperatingProof({branches:[{branch:'synthetic-control',pressurePathMm:[[0,0,0],[0,2,3]],
    lowerTurn:{virtualCornerMm:[0,2,3]},support:{blockedEndThrustN:100,centrelineStockMassKg:0},
    repairZones:[],externalRepairZone:{cutYMm:-300,secondPlainPipeCutYMm:-200}}],
    frame:{jambAxesXMm:[-1,1],normalAxisYMm:0,railAxesZMm:[-1,1]},finishedWallYMm:-1000,outsideWallYMm:0,
    washerFirstRestMm:[1000,1000,1000,10,10,10],inverterMm:[2000,2000,2000,10,10,10],
    protectedDiameterMm:50,pipe:{outerDiameterMm:28,minimumWallMm:1.2,massKgM:.84}})
  assert.equal(result.supportFreebody.maximumAbsoluteKnownNormalReactionN,150)
  assert.equal(result.supportFreebody.equilibriumCases.every(c=>c.completeEquilibrium),true)
  assert.equal(result.supportFreebody.completeSupportCapacity,false)
})

test('a riser or repair edit propagates through actual fittings, routes and drawings while source fault stays independent', () => {
  const { resolved, joined } = source(), input = readFixedInletSettings()
  const before = compileFixedInletCandidate(resolved, input, joined)
  const rear = compileFixedInletCandidate(resolved, { ...input, riserYMm: 595 }, joined)
  assert.deepEqual(rear.geometryBlockers, [])
  assert.notEqual(rear.source.caseDigest, before.source.caseDigest)
  assert.notDeepEqual(rear.drawing, before.drawing)
  assert.equal(rear.branches[0].lowerTurn.virtualCornerMm[1], 595)
  assert.ok(Math.abs(rear.branches[0].clearances.upperPipeToPVFieldMm - before.branches[0].clearances.upperPipeToPVFieldMm
    - (input.riserYMm - 595)) < .0001)
  assert.deepEqual(rear.branches.map(row => row.fault.inheritedLowerReliefAndIndependentReceiver), before.branches.map(row => row.fault.inheritedLowerReliefAndIndependentReceiver))
  assert.notDeepEqual(rear.branches.map(row => row.fault.ownUpperGuard.bodyMm), before.branches.map(row => row.fault.ownUpperGuard.bodyMm))
  const long = compileFixedInletCandidate(resolved, { ...input, outerCutYMm: -500 }, joined)
  assert.ok(long.geometryBlockers.some(code => code.includes('LOWER_MODULE_RENEWAL_REACHES_WASHER_FIRST_REST')))
  const short = compileFixedInletCandidate(resolved, { ...input, upperCutZMm: 1250 }, joined)
  assert.ok(short.geometryBlockers.some(code => code.includes('REPAIR_BODY_INTERCEPTS_VALVE')))
  assert.deepEqual(short.branches.map(row => row.pressurePathMm), before.branches.map(row => row.pressurePathMm))
  const warm = compileFixedInletCandidate(resolved, { ...input, localPipeTemperatureRangeK: 80 }, joined)
  assert.ok(Math.abs(warm.branches[0].support.whollyRestrainedThermalForceN - before.branches[0].support.whollyRestrainedThermalForceN * 2) < .0001)
  assert.deepEqual(warm.branches.map(row => row.pressurePathMm), before.branches.map(row => row.pressurePathMm))
  assert.equal(warm.branches[0].support.thermalReactionSolved, false)
})

test('the larger protected jacket, short pipe radius and permanent guard reveal separate failures', () => {
  const { resolved, joined } = source(), input = readFixedInletSettings()
  const baseline = compileFixedInletCandidate(resolved, input, joined)
  const jacket = compileFixedInletCandidate(resolved, { ...input, protectedLowerDiameterMm: 74 }, joined)
  assert.ok(jacket.geometryBlockers.some(code => code.includes('SOURCE_FED_FAULT_PATH_REJECTED')))
  const small = compileFixedInletCandidate(resolved, { ...input, pipeBendRadiusMm: 75 }, joined)
  assert.ok(small.geometryBlockers.some(code => code.includes('BENT_PIPE_RADIUS_BELOW_MATCHED_MINIMUM')))
  const front = compileFixedInletCandidate(resolved, { ...input, wetGuardFrontYMm: 710 }, joined)
  assert.ok(front.geometryBlockers.some(code => code.includes('guardToPermanentPVFieldMm')))
  assert.deepEqual(front.branches.map(row => row.sleeve), baseline.branches.map(row => row.sleeve))
})

test('a lost hood and mixed fault revision cannot be rescued by geometric fit or injected approval', () => {
  const { resolved, insertCase, joined } = source(), input = readFixedInletSettings()
  assert.throws(() => compileFixedInletCandidate(resolved, { ...input, approved: true }, joined), /evidence cannot be injected/)
  assert.throws(() => compileFixedInletCandidate(resolved, input, { ...joined,
    faultCase: { ...joined.faultCase, branches: { ...joined.faultCase.branches,
      plant: { ...joined.faultCase.branches.plant, highHoodOpen: false } } } }), /exact authored fault/)
  const faultCase = { ...joined.faultCase, branches: { ...joined.faultCase.branches,
    plant: { ...joined.faultCase.branches.plant, highHoodOpen: false } } }
  const lost = compileFixedInletCandidate(resolved, input, { ...joined, faultCase,
    fault: runInletFaultCase(resolved, faultCase, insertCase) })
  assert.equal(lost.status, 'rejected-geometry')
  assert.ok(lost.geometryBlockers.includes('plant:SOURCE_FED_FAULT_PATH_REJECTED'))
  assert.equal(lost.evidence.installedAcceptance, false)
})
