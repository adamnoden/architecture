import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readGroundSectionCase, runGroundSectionCase } from './current-design/structural-ground.js'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase } from './current-design/inlet-source-envelope.js'
import { rectangularCatchmentScreen } from './current-design/inlet-room-catchment.js'
import { readEngineeringDocument, compileEngineeringDocument } from './current-design/engineering-document.js'

const current = readCurrentDesignResolution(), { ground } = readGroundSectionCase(current),
  source = readInletSourceEnvelopeCase(current).sourceEnvelope
const run = (zone: number, edit: object = {}) => runInletSourceEnvelopeCase(current,
  { ...source, settings: { ...source.settings, ...edit } },
  runGroundSectionCase(current, { ...ground, settings: { ...ground.settings, serviceZoneMm: zone } }))

test('the channel distinguishes steep inlet control, a mild upper-friction comparison and a submerged-entry rejection', () => {
  const steep = rectangularCatchmentScreen(318.549, 400, 150, 1680)
  assert.equal(steep.control, 'critical-inlet-supercritical-chute')
  assert.ok(Math.abs(steep.criticalDepthMm - 41.5693912077) < 1e-8)
  assert.ok(Math.abs(steep.requiredHeadAboveInvertMm - 125.5311302173) < 1e-8)
  assert.ok(Math.abs(steep.openEntryHeadReserveMm - 9.4688697827) < 1e-8)
  assert.ok(steep.entranceKMaximumBeforeOpenEntryFailure > 1.95 && steep.entranceKMaximumBeforeOpenEntryFailure < 1.96)
  assert.equal(steep.entranceKCeilingQualified, false)
  const mild = rectangularCatchmentScreen(318.549, 400, 180, 1680, 200)
  assert.equal(mild.control, 'critical-outlet-subcritical-upper-friction-bound')
  assert.ok(mild.chargedFrictionHeadMm > 17)
  assert.ok(mild.requiredHeadAboveInvertMm > steep.requiredHeadAboveInvertMm)
  assert.equal(rectangularCatchmentScreen(500, 400, 150, 1680).necessaryOpenChannelScreen, false)
  assert.equal(rectangularCatchmentScreen(318.549, 300, 100, 1680).necessaryOpenChannelScreen, false)
  assert.throws(() => rectangularCatchmentScreen(NaN, 400, 150, 1680), /Invalid/)
})

test('the actual default ground rejects the duct; its enlarged saved zone changes levels, source pressure and floor drawing together', () => {
  const old = run(65), changed = run(250)
  assert.equal(old.roomCatchment.state, 'whole-room-development-comparison')
  assert.equal(changed.roomCatchment.state, 'whole-room-development-comparison')
  if (old.roomCatchment.state !== 'whole-room-development-comparison' || changed.roomCatchment.state !== 'whole-room-development-comparison') return
  assert.equal(old.roomCatchment.levelsMm.ffl, 530)
  assert.equal(old.roomCatchment.route.fitsActualDistributionZone, false)
  assert.equal(changed.roomCatchment.levelsMm.ffl, 715)
  assert.deepEqual(changed.roomCatchment.levelsMm.distribution, [450, 700])
  assert.equal(changed.roomCatchment.route.fitsActualDistributionZone, true)
  assert.ok(Math.abs(changed.roomCatchment.route.bottomAfterSettingMm - 12.41) < 1e-8)
  assert.equal(changed.roomCatchment.route.topAfterSettingMm, 8)
  assert.notEqual(changed.roomCatchment.sectionSvg, old.roomCatchment.sectionSvg)
  assert.equal(changed.roomCatchment.sourceOnlyEvent.necessarySourceOnlyScreen, true)
  assert.equal(changed.branches[1].minimumResidualScreen, false, 'New715mm lift must not inherit the previous nominal pressure pass')
  assert.ok(changed.branches[1].residualPressureComparisonBar < 1)
  assert.ok(changed.branches[1].residualPressureComparisonBar < old.branches[1].residualPressureComparisonBar)
  const widened = run(250, { plantApertureNominalMm: 10.4 })
  assert.ok(widened.roomCatchment.state === 'whole-room-development-comparison')
  assert.equal(widened.branches[1].minimumResidualScreen, true)
  assert.ok(widened.bound.maximumCombinedLmin > changed.bound.maximumCombinedLmin)
  assert.notEqual(widened.roomCatchment.sourceOnlyEvent.hydraulic.requiredHeadAboveInvertMm,
    changed.roomCatchment.sourceOnlyEvent.hydraulic.requiredHeadAboveInvertMm)
  assert.equal(widened.preSiteArrangementComplete, false)
  assert.equal(widened.roomCatchment.selected, false)
  assert.ok(changed.roomCatchment.diagnostics.includes('INLET_ROOM_STORED_RELEASE_UNBOUNDED'))
  assert.ok(changed.roomCatchment.diagnostics.includes('INLET_ROOM_ADDED_LOADS_NOT_IN_52_HEAD_MODEL'))
  assert.equal(changed.roomCatchment.room.assuredAvailableStorageLitres, null)
  assert.equal(changed.roomCatchment.room.floorLipAboveFflMm, 0)
  assert.equal(changed.roomCatchment.room.manualResponseCredited, false)
})

test('high tailwater, excess outlet width and forged computed ground stay adverse', () => {
  const adverse = run(250, { catchmentReceiverCrestAboveGradeMm: 700, catchmentClearWidthMm: 450, catchmentReceiverWidthMm: 800 })
  assert.equal(adverse.roomCatchment.state, 'whole-room-development-comparison')
  if (adverse.roomCatchment.state !== 'whole-room-development-comparison') return
  for (const code of ['INLET_FLOOR_RECEIVER_TAILWATER_SCREEN_FAILS', 'INLET_FLOOR_PORT_EXCEEDS_EXISTING_WINDOW_AXIS', 'INLET_FLOOR_SEPARATE_RECEIVER_LANES_OVERLAP']) {
    assert.ok(adverse.roomCatchment.diagnostics.includes(code), code)
  }
  const computed = runGroundSectionCase(current, ground)
  assert.throws(() => runInletSourceEnvelopeCase(current, source, { ...computed,
    native: { ...computed.native, levelsMm: { ...computed.native.levelsMm, ffl: 715 } } }), /Stale or modified/)
  assert.equal(runInletSourceEnvelopeCase(current, source).roomCatchment.state, 'missing-ground-section')
  assert.throws(() => runInletSourceEnvelopeCase(current, { ...source, schema: 'had-inlet-source-envelope-case/2' }), /Stale/)
})

test('one saved document and public CLI regenerate the joined floor/source result, record its dependency and undo exactly', async () => {
  const saved = await readEngineeringDocument(current.design)
  const make = (zone: number) => ({ ...saved, stages: {
    groundSection: { caseId: ground.caseId, settings: { ...ground.settings, serviceZoneMm: zone } },
    inletSourceEnvelope: { ...source.settings, plantApertureNominalMm: 10.4 },
  } })
  const before = await compileEngineeringDocument(make(65))
  const document = make(250)
  const after = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 24 * 1024 * 1024,
  }))
  assert.deepEqual(after, JSON.parse(JSON.stringify(await compileEngineeringDocument(JSON.parse(JSON.stringify(document))))))
  assert.deepEqual(after.plans, JSON.parse(JSON.stringify(before.plans)))
  assert.deepEqual(after.occupiedServices, JSON.parse(JSON.stringify(before.occupiedServices)))
  assert.ok(after.manifest.find((r: any) => r.stage === 'inletSourceEnvelope').dependsOn.includes('groundSection'))
  const beforeCatchment = before.engineering.inletSourceEnvelope!.roomCatchment
  assert.ok(beforeCatchment.state === 'whole-room-development-comparison')
  assert.notEqual(after.engineering.inletSourceEnvelope.roomCatchment.groundAuthority.resultDigest, beforeCatchment.groundAuthority.resultDigest)
  assert.deepEqual(await compileEngineeringDocument(make(65)), before)
})


test('a below-source ground datum raises both the flow bound and actual electrical jet action', () => {
  const low = runGroundSectionCase(current, { ...ground, settings: { ...ground.settings, courseBottomMm: -1000 } })
  assert.ok(low.native.levelsMm.ffl < 0)
  const raised = runInletSourceEnvelopeCase(current, source), lowered = runInletSourceEnvelopeCase(current, source, low)
  assert.ok(lowered.bound.maximumAbsoluteTotalBar > raised.bound.maximumAbsoluteTotalBar)
  assert.ok(lowered.bound.maximumCombinedLmin > raised.bound.maximumCombinedLmin)
  const room = lowered.joinedDirection.room, expectedVelocity = Math.sqrt(2 * (lowered.bound.maximumAbsoluteTotalBar - source.settings.atmosphericMinimumBar) * 1e5 / 990)
  assert.ok(Math.abs(room.newMainboard.jetComparison.sourceAirVelocityUpperMps - expectedVelocity) < 1e-6)
  for (let i = 0; i < lowered.branches.length; i++) {
    const expected = 2 * 1000 * lowered.branches[i].maximumLimitedEachLmin / 60000 * expectedVelocity
    assert.ok(Math.abs(room.electricalScreen.actions.fullReversalUpperN[i] - expected) < 1e-9)
    assert.ok(Math.abs(room.newMainboard.jetComparison.byBranch[i].fullReversalUpperN - expected) < 1e-6)
  }
  assert.deepEqual(lowered.joinedDirection.room.electricalScreen.panels, raised.joinedDirection.room.electricalScreen.panels)
  assert.equal(room.electricalScreen.changedGroundOrSlabHeightAcceptanceTransferred, false)
  assert.equal(lowered.selected, false)
})
