import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readEngineeringDocument, compileEngineeringDocument } from './current-design/engineering-document.js'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase } from './current-design/inlet-source-envelope.js'
const resolved = readCurrentDesignResolution(), request = readInletSourceEnvelopeCase(resolved)
const baseline = runInletSourceEnvelopeCase(resolved, request.sourceEnvelope)
const run = (edit: object) => runInletSourceEnvelopeCase(resolved, { ...request.sourceEnvelope, settings: { ...request.sourceEnvelope.settings, ...edit } })

test('the boundary upper flow follows energy and bore tolerance, independently of the delivery Cd comparison', () => {
  const d = .0091, independentUpperLmin = Math.PI * d * d / 4 * Math.sqrt(2 * 1010000 / 990) * 60000
  assert.ok(Math.abs(baseline.bound.maximumEachLmin - independentUpperLmin) < 1e-6)
  assert.equal(baseline.bound.maximumDiameterMm, 9.1)
  assert.equal(baseline.bound.minimumDiameterMm, 8.9)
  const smaller = run({ apertureNominalMm: 6.5 })
  assert.ok(smaller.bound.maximumEachLmin < 101)
  assert.ok(smaller.branches.every(b => b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen))
  assert.ok(smaller.branches.every(b => !b.minimumResidualScreen), 'A capture pass must not erase the ordinary delivery failure')
  const worseCd = run({ dischargeCoefficientComparison: .5 })
  assert.equal(worseCd.bound.maximumEachLmin, baseline.bound.maximumEachLmin, 'Cd1 is the upper-flow bound regardless of hopeful delivery Cd')
  assert.ok(worseCd.branches[0].pressureLossComparisonBar > baseline.branches[0].pressureLossComparisonBar)
  assert.equal(baseline.branches[0].dischargeCoefficientQualified, false)
})

test('pressure recovery is separate from throat pressure and prevents a false universal fixed-restriction rejection', () => {
  const recovered = run({apertureNominalMm:6.5, dischargeCoefficientComparison:1, pressureRecoveryFractionComparison:.9})
  assert.ok(recovered.branches.every(b=>b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen))
  assert.ok(recovered.branches.every(b=>b.minimumResidualScreen && b.nonnegativeThroatPressureScreen))
  assert.ok(recovered.branches.every(b=>b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
  assert.equal(recovered.preSiteArrangementComplete,false)
  assert.equal(recovered.bound.pressureRecoveryAndCavitationQualified,false)
  assert.equal(recovered.bound.maximumAbsoluteTotalBar,10.1)
  assert.equal(recovered.bound.minimumThroatAbsoluteBarForUpperBound,0)
  const noRecovery=run({apertureNominalMm:6.5,dischargeCoefficientComparison:1})
  assert.equal(noRecovery.bound.maximumEachLmin,recovered.bound.maximumEachLmin)
  assert.ok(noRecovery.branches.every(b=>!b.minimumResidualScreen))
  assert.ok(recovered.branches[0].pressureLossComparisonBar<noRecovery.branches[0].pressureLossComparisonBar/9)
  const idealEquality = run({apertureNominalMm:6.5,dischargeCoefficientComparison:1,
    pressureRecoveryFractionComparison:1,sourceMinimumDynamicBar:3,requiredResidualBar:2.5})
  assert.ok(idealEquality.branches.every(b=>b.minimumResidualScreen && b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
  assert.ok(run({apertureNominalMm:6.5,dischargeCoefficientComparison:1,
    pressureRecoveryFractionComparison:.999,sourceMinimumDynamicBar:3,requiredResidualBar:2.5})
    .branches.every(b=>!b.minimumResidualScreen && !b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
})

test('actual entrance and receiver controls reject a locally restricted old arrangement without borrowing crown-only capacity', () => {
  for (const b of baseline.branches) {
    assert.ok(b.existingReceiver.maximumScreenedLmin > 100 && b.existingReceiver.maximumScreenedLmin < 102)
    assert.ok(b.existingReceiver.crownOnlyCapacityLmin > b.existingReceiver.maximumScreenedLmin + 20)
    assert.equal(b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen, false)
    assert.equal(b.existingReceiver.requiredDemandControl.necessaryChannelAndReceiverScreen, true)
    assert.equal(b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens, false)
    assert.equal(b.feasibleNominalApertureIntervalMm.optimisticCdOneIntervalExists, false, 'Even an ideal lossless-contraction discharge coefficient cannot rescue this envelope')
    assert.ok(b.feasibleNominalApertureIntervalMm.minimumForDelivery! > b.feasibleNominalApertureIntervalMm.maximumForExistingReceiver + 2)
    assert.equal(b.internalHouseCut.required, true)
    assert.equal(b.internalHouseCut.suppliedByLodge, false)
    assert.equal(b.internalHouseCut.suppliedByApplianceStop, false)
  }
  const strongerSource = run({ sourceMinimumDynamicBar: 8.99 })
  assert.ok(strongerSource.branches.every(b => b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
  assert.equal(strongerSource.preSiteArrangementComplete, false, 'A necessary hydraulic interval does not qualify the upper wet room, frost or materials')
  assert.equal(strongerSource.state, 'existing-whole-arrangement-rejected')
  assert.deepEqual(strongerSource.architectureDecision, baseline.architectureDecision)
})

test('the complete series path preserves independent cuts and adverse source, renewal, pressure and frost states', () => {
  const state = (id: string) => baseline.states.find(s => s.id === id)!
  assert.match(state('downstream-house-cut-closed').result, /full-source-static-pressure/)
  assert.match(state('restriction-missing-eroded-or-bypassed').result, /reject/)
  assert.ok(state('restriction-missing-eroded-or-bypassed').eachLmin! > 1300)
  assert.equal(state('upstream-of-restriction-rupture').eachLmin, null)
  assert.ok(Math.abs(state('both-branches-rupture').combinedLmin! - baseline.bound.maximumEachLmin * 2) < .000002)
  assert.equal(state('downstream-indoor-cut-or-upper-joint-fault').result, 'reject-uncontained-upper-network')
  assert.equal(state('both-reliefs-blocked').result, 'reject-unattended-event')
  assert.match(state('secondary-high-or-submerged').result, /reject/)
  assert.match(state('wall-spool-renewal-inward-and-outward').result, /conflict-not-discharged/)
  assert.match(state('frost-or-loss-of-warmth').result, /whole-route/)
  assert.equal(baseline.materials.knownPolymerItemsAcrossTwoValves, 6)
  assert.equal(baseline.materials.ownerExceptionsApproved, 0)
  assert.equal(baseline.architectureDecision.newRoomGeometryAuthored, false)
  assert.equal(baseline.architectureDecision.annexSelected, false)
})

test('stale design/method identities, missing current sources and derived-result injection reject', () => {
  assert.throws(() => runInletSourceEnvelopeCase(resolved, { ...request.sourceEnvelope, bindingDigest: 'old' }), /Stale/)
  assert.throws(() => runInletSourceEnvelopeCase(resolved, { ...request.sourceEnvelope, selected: true }), /Versioned/)
  assert.throws(() => run({ sourceMaximumTotalBar: Number.NaN }), /comparison domain/)
  assert.throws(() => run({ sourceMinimumDynamicBar: 9.1 }), /comparison domain/)
  assert.throws(() => run({ derivedMaximumFlow: 90 }), /Complete authored/)
  const missing = { ...resolved, disciplineBindings: resolved.disciplineBindings.map(f => f.id === 'had-fixed-inlet-arrangement'
    ? { ...f, identities: { ...f.identities, 'project/had/studies/south-inlet-relief.json': 'missing' } } : f) }
  assert.throws(() => readInletSourceEnvelopeCase(missing), /missing inlet source-envelope binding/)
  assert.deepEqual(runInletSourceEnvelopeCase(resolved, JSON.parse(JSON.stringify(request.sourceEnvelope))), baseline)
})

test('saved authoring and public CLI regenerate the actual source bound, channels, decision drawing and evidence then reverse', async () => {
  const original = await readEngineeringDocument(readGeorgianDesignSnapshot())
  assert.ok(!Object.hasOwn(original.stages, 'inletSourceEnvelope'), 'The unselected boundary proposal stays opt-in')
  const doc = { ...original, stages: { inletSourceEnvelope: request.sourceEnvelope.settings } }
  const first = await compileEngineeringDocument(JSON.parse(JSON.stringify(doc)))
  const changedDoc = { ...doc, stages: { inletSourceEnvelope: { ...request.sourceEnvelope.settings, apertureNominalMm: 6.5 } } }
  const changed = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
    { input: JSON.stringify(changedDoc), encoding: 'utf8', maxBuffer: 24 * 1024 * 1024 }))
  const a = first.engineering.inletSourceEnvelope!, b = changed.engineering.inletSourceEnvelope
  assert.notEqual(a.bound.maximumEachLmin, b.bound.maximumEachLmin)
  assert.notEqual(a.branches[0].existingReceiver.limitedFault.entranceHeadMm, b.branches[0].existingReceiver.limitedFault.entranceHeadMm)
  assert.notEqual(a.reviewSvg, b.reviewSvg)
  assert.deepEqual(a.architectureDecision.retainedPlantCylinderPathMm, b.architectureDecision.retainedPlantCylinderPathMm)
  assert.deepEqual(changed.plans, JSON.parse(JSON.stringify(first.plans)))
  assert.equal(changed.manifest.find((row: any) => row.stage === 'occupiedServices').applicability.controllingStage, 'inletSourceEnvelope')
  assert.ok(changed.coordinationDiagnostics.some((row: any) => row.code === 'INLET_SOURCE_AND_ROOM_REPLAN_NOT_COORDINATED'))
  assert.deepEqual((await compileEngineeringDocument(doc)).engineering.inletSourceEnvelope, a)
  const standalone = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--inlet-source-envelope', '-'],
    { input: JSON.stringify({ ...request, sourceEnvelope: { ...request.sourceEnvelope, settings: changedDoc.stages.inletSourceEnvelope } }), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }))
  assert.deepEqual(standalone, b)
})
