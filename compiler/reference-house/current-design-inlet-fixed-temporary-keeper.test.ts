import assert from 'node:assert/strict'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './current-design/inlet-sill-insert.js'
import { readInletFaultCase, runInletFaultCase } from './current-design/inlet-fault.js'
import { compileFixedInletCandidate, readFixedInletSettings } from './current-design/inlet-fixed-entry.js'
import { compareCurrentFixedInletSupport } from './current-design/inlet-fixed-support-integration.js'
import { compareTemporaryFixedInletKeeper, temporaryKeeperReferenceSettings } from './current-design/inlet-fixed-temporary-keeper.js'

const resolved = readCurrentDesignResolution(), insertCase = readInletSillInsertCase(resolved).insert
const insert = runInletSillInsertCase(resolved, insertCase), faultCase = readInletFaultCase(resolved, insertCase).fault
const fault = runInletFaultCase(resolved, faultCase, insertCase)
const candidate = compileFixedInletCandidate(resolved, readFixedInletSettings(), { insert, faultCase, fault })
const compact = compareCurrentFixedInletSupport(resolved, candidate).compactReceiver
const reference = compareTemporaryFixedInletKeeper(candidate, compact)

test('actual guide geometry and source stainless properties bound the cold-service challenge without granting grip', () => {
  assert.equal(reference.challenge.maximumAxialN, 2167.054726)
  assert.equal(reference.challenge.thermalSingleLegBoundN, 1667.054726)
  assert.equal(reference.challenge.processPressureBar, 0)
  assert.equal(reference.clamp.minimumRequiredFrictionCoefficient, .19161)
  assert.equal(reference.clamp.axialGeometricInterlock, false)
  assert.equal(reference.clamp.actualFrictionAndTubeContactQualified, false)
  assert.equal(reference.status, 'blocked-unqualified-axial-grip')
  assert.equal(reference.completeTemporarySupport, false)
  assert.ok(reference.sharedUpperReceiver.original160GaugePayloadOnlyAdverseControl.linearInteraction > 1.64)
  assert.ok(reference.clamp.conditionalTubeContactPass)
  for (const b of reference.branches) {
    assert.deepEqual(b.lowerLDrawTranslationMm, [0, 739.5, 0])
    assert.equal(b.mainFrameRetainedDuringRenewal, true)
    const guide = compact.geometry.pipeMounts.find(m => m.branch === b.branch && m.kind === 'axial-guide')!
    assert.deepEqual(b.geometry.keeperZMm, [guide.centreMm[2] - 20, guide.centreMm[2] + 20])
    const branch = candidate.branches.find(row => row.branch === b.branch)!
    const upperCut = Math.max(...branch.repairZones.map(zone => zone.secondPlainPipeCutZMm))
    assert.deepEqual(b.geometry.latestCouplingParkZMm, [upperCut, upperCut + 96])
    assert.ok(b.geometry.keeperToCouplingParkAfter5Mm > 0)
    assert.ok(b.geometry.keeperToUpperNativeJawAfter5Mm > 0)
    assert.equal(b.conditionalLocalSteelPass, true)
    assert.ok(b.upperRoute.remainingDeadLoadChallengeN > 0)
    assert.equal(b.upperRoute.actualCompletePayloadBoundEstablished, false)
  }
})

test('the shared upper receiver receives both payloads and each real steel centroid, retaining the original160gauge failure', () => {
  const joint = reference.sharedUpperReceiver, down = joint.cases.find(c => c.signs.every(sign => sign === -1))!
  assert.ok(Math.abs(down.withRetainedSteel.forceN[2] + 2 * reference.challenge.maximumAxialN + joint.retainedSteelWeightN) < 2e-6)
  assert.equal(joint.original160GaugePayloadOnlyAdverseControl.linearInteraction, 1.649388)
  const gauge = compact.geometry.backplates.find(p => p.levelZMm === 1450)!.anchorAxesMm.map(p => p[2])
  assert.equal(joint.actualSourceGaugeWithRetainedSteel.anchorGaugeMm, Math.abs(gauge[1] - gauge[0]))
  assert.ok(joint.actualSourceGaugeWithRetainedSteel.shearEachN > 0)
  assert.equal(joint.actualGroupAndJambCapacityEstablished, false)
  assert.equal(reference.completeTemporarySupport, false)
})

test('both thermal signs carry their six-component wrench into each actual plate, arm and post interface', () => {
  for (const b of reference.branches) for (const c of b.cases) for (const reaction of Object.values(c.reactions)) {
    const q = reaction.pointMm, f = [0, 0, 0], cross = [0, 0, 0]
    for (const applied of [c.appliedWrench, ...b.fixtureGravityWrenches]) {
      const p = applied.pointMm, load = applied.forceN
      const moved = [(p[1] - q[1]) * load[2] - (p[2] - q[2]) * load[1],
        (p[2] - q[2]) * load[0] - (p[0] - q[0]) * load[2], (p[0] - q[0]) * load[1] - (p[1] - q[1]) * load[0]]
      for (let i = 0; i < 3; i++) { f[i] += load[i]; cross[i] += moved[i] }
    }
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(f[i] + reaction.forceN[i]) < 1e-5)
      assert.ok(Math.abs(cross[i] + reaction.momentNmm[i]) < 1e-3)
    }
  }
  const loaded = reference.branches[0].cases[0]
  assert.ok(Math.abs(loaded.reactions.guidePostBase.momentNmm[0]) > 260000)
  assert.ok(Math.abs(loaded.reactions.guideArmRoot.momentNmm[0]) > 216000)
})

test('preload and temperature perturbations change grip demand while the zero-load control cannot invent acceptance', () => {
  const half = compareTemporaryFixedInletKeeper(candidate, compact, { ...temporaryKeeperReferenceSettings, preloadEachBoltN: 900 })
  assert.ok(Math.abs(half.clamp.minimumRequiredFrictionCoefficient - reference.clamp.minimumRequiredFrictionCoefficient * 2) < 2e-6)
  assert.equal(half.clamp.uniformPressureMpa, reference.clamp.uniformPressureMpa / 2)
  assert.deepEqual(half.branches.map(b => b.geometry), reference.branches.map(b => b.geometry))
  const zero = compareTemporaryFixedInletKeeper(candidate, compact, { ...temporaryKeeperReferenceSettings, deadLoadChallengeN: 0, temperatureChangeK: 0 })
  assert.equal(zero.challenge.maximumAxialN, 0)
  assert.equal(zero.clamp.minimumRequiredFrictionCoefficient, 0)
  assert.equal(zero.completeTemporarySupport, false)
  assert.equal(zero.installedAcceptance, false)
})

test('an existing coupling permits positive lower-L capture but cannot support the severed upper stub or replace the real bend restraint duty', () => {
  for (const b of reference.branches) {
    const coupling = b.positiveAlternatives.couplingShoulder
    assert.equal(coupling.availableForLowerLOnlyRenewal, true)
    assert.equal(coupling.newUpperRepairSleeveAvailableBeforeFirstUpperCut, false)
    assert.equal(coupling.supportsRetainedUpperStubAfterUpperCut, false)
    assert.equal(coupling.initialUpperYoke.conditionalYokeSteelPass, true)
    assert.ok(coupling.initialUpperYoke.toReservedValveTopAfter5Mm > 2)
    assert.ok(coupling.initialUpperYoke.rodToBareCouplingAfter5Mm > 3)
    assert.ok(coupling.initialUpperYoke.lowerLDrawVerticalClearAfter5Mm > 260)
    assert.equal(coupling.initialUpperYoke.lowerRepairJawClear, true)
    assert.equal(coupling.initialUpperYoke.upperRepairJawClear, false)
    assert.equal(coupling.initialUpperYoke.pipeToFittingAxialRetentionEstablished, false)
    assert.ok(b.positiveAlternatives.formedBendOrTerminalCradle.additionalHeightAboveGuideMm! > 600)
    assert.equal(b.positiveAlternatives.formedBendOrTerminalCradle.existing40mmGuideEnvelopeSufficient, false)
    assert.equal(b.positiveAlternatives.formedBendOrTerminalCradle.capacityEstablished, false)
    assert.equal(b.positiveAlternatives.formedBendOrTerminalCradle.unspreadRadiusLeverAdverseControl.pass, false)
    assert.ok(b.positiveAlternatives.formedBendOrTerminalCradle.unspreadRadiusLeverAdverseControl.axialPlusStraightTubeBendingStressMpa > 348)
  }
})

test('out-of-domain cold states, injected acceptance and a moved guide reject rather than manufacturing a keeper pass', () => {
  for (const bad of [{ ...temporaryKeeperReferenceSettings, temperatureChangeK: 6 },
    { ...temporaryKeeperReferenceSettings, deadLoadChallengeN: Infinity },
    { ...temporaryKeeperReferenceSettings, preloadEachBoltN: 0 },
    { ...temporaryKeeperReferenceSettings, approved: true }]) {
    assert.throws(() => compareTemporaryFixedInletKeeper(candidate, compact, bad), /cold-service|evidence injection/)
  }
  const moved = { ...compact, geometry: { ...compact.geometry, pipeMounts: compact.geometry.pipeMounts.map(m =>
    m.kind === 'axial-guide' ? { ...m, centreMm: [m.centreMm[0], m.centreMm[1], m.centreMm[2] + 10] as const } : m) } }
  assert.throws(() => compareTemporaryFixedInletKeeper(candidate, moved), /actual candidate centred/)
  const reverse = { ...candidate, branches: candidate.branches.map(b => ({ ...b,
    renewal: { ...b.renewal, translationMm: [0, -739.5, 0] } })) }
  assert.throws(() => compareTemporaryFixedInletKeeper(reverse, compact), /room-side \+Y/)
})
