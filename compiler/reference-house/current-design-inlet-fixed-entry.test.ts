import assert from 'node:assert/strict'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './current-design/inlet-sill-insert.js'
import { readInletFaultCase, runInletFaultCase } from './current-design/inlet-fault.js'
import { compileFixedInletCandidate, readFixedInletSettings } from './current-design/inlet-fixed-entry.js'

function source() {
  const resolved = readCurrentDesignResolution()
  const insertCase = readInletSillInsertCase(resolved).insert
  const insert = runInletSillInsertCase(resolved, insertCase)
  const faultCase = readInletFaultCase(resolved, insertCase).fault
  return { resolved, insertCase, joined: { insert, faultCase, fault: runInletFaultCase(resolved, faultCase, insertCase) } }
}

test('the whole fixed inlet uses level primary spools, real factory elbows and R98 upper pipes on actual axes', () => {
  const { resolved, joined } = source(), input = readFixedInletSettings()
  const result = compileFixedInletCandidate(resolved, input, joined)
  assert.equal(result.status, 'conditional-whole-arrangement')
  assert.deepEqual(result.geometryBlockers, [])
  assert.deepEqual(result.branches.map(row => row.pressurePathMm[0][0]), [10080, 10285])
  for (const branch of result.branches) {
    assert.equal(branch.primaryTubeAxis, 'level-through-sloping-secondary-sleeve')
    assert.equal(branch.sleeve.clearDiameterMm, 150)
    assert.ok(branch.sleeve.radialReserveAfter5Mm > 16)
    assert.ok(branch.sleeve.reverseFlowWithMinimumOffset!.ventedCrownRetained)
    assert.equal(branch.factoryElbow.article, '435660')
    assert.equal(branch.renewal.inSituLowJointRequired, false)
    assert.equal(branch.renewal.translationMm[1], 739.5)
    assert.ok(branch.renewal.toWasherFirstRestAfter10Mm > 100)
    assert.equal(branch.repairZones[0].cutToInitialBodyAfter5Mm, 27)
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
  assert.deepEqual(compileFixedInletCandidate(resolved, JSON.parse(JSON.stringify(input)), joined), result)
})

test('a riser or repair edit propagates through actual fittings, routes and drawings while source fault stays independent', () => {
  const { resolved, joined } = source(), input = readFixedInletSettings()
  const before = compileFixedInletCandidate(resolved, input, joined)
  const rear = compileFixedInletCandidate(resolved, { ...input, riserYMm: 605 }, joined)
  assert.deepEqual(rear.geometryBlockers, [])
  assert.notEqual(rear.source.caseDigest, before.source.caseDigest)
  assert.notDeepEqual(rear.drawing, before.drawing)
  assert.equal(rear.branches[0].factoryElbow.virtualCornerMm[1], 605)
  assert.ok(rear.branches[0].clearances.upperPipeToPVFieldMm > before.branches[0].clearances.upperPipeToPVFieldMm + 19)
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
