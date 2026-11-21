import assert from 'node:assert/strict'
import test from 'node:test'
import { inletElectricalScreen } from './current-design/inlet-electrical-screen.js'

const source = { boardBoxMm: [11190.5, 2647, 300, 380, 610, 605], lobbyYMm: [2647, 3603],
  portalMaximumXMm: [11150, 10925],portalMinimumXMm:[10250,9650],standOffMm:25,horizontalInsetMm:0,verticalInsetMm:0, clearHeightMm: 3100,
  ordinaryBody: { axisXMm: 10545, radiusMm: 300 }, fullReversalUpperN: [140, 340] }

test('the full passive cupboard intercepts complete-portal direct rays while a short front screen would miss them', () => {
  const r = inletElectricalScreen(source)
  assert.equal(r.visibility.allDirectPortalRaysIntercepted, true)
  assert.equal(r.visibility.portalToShieldReserveMm, 15.5)
  assert.equal(r.ordinaryRouteAfterSettingMm, 306.5)
  // A high ray from the right edge of the Utility portal reaches the FAR top
  // corner of the case. Sampling only the case's west face misses this ray.
  const p = [11150, 2647, 3100], q = [11570.5, 3257, 905], t = (r.barrierPlaneMm.x - p[0]) / (q[0] - p[0]),
    intersection = [p[1] + t * (q[1] - p[1]), p[2] + t * (q[2] - p[2])]
  assert.ok(intersection[1] > 3000)
  assert.ok(intersection[0] >= r.barrierPlaneMm.y[0] && intersection[0] <= r.barrierPlaneMm.y[1])
  assert.ok(intersection[1] <= r.barrierPlaneMm.z[1])
  assert.equal(r.panels.length, 8)
  assert.ok(r.panels.every(p => p.flatSheetOnlyKg > 11 && p.flatSheetOnlyKg < 12))
  assert.equal(r.actions.simultaneousPairN, 480)
  assert.equal(r.actions.maximumSingleBranchN, 340)
  assert.equal(r.visibility.pressureJetRicochetSeamsOrFloodQualification, false)
  assert.equal(r.wetBoundary.passiveThermalPassTransferred, false)
  assert.equal(r.maintenance.liveWetBoardMaintenanceClaimed, false)
  assert.equal(r.selected, false)
})

test('portal/board changes reject the visibility claim and do not hide a normal-route conflict', () => {
  assert.equal(inletElectricalScreen({ ...source, portalMaximumXMm: [11200, 10925] }).visibility.allDirectPortalRaysIntercepted, false)
  assert.equal(inletElectricalScreen({ ...source, boardBoxMm: [11190.5, 3047, 300, 380, 610, 605] }).visibility.allDirectPortalRaysIntercepted, false)
  const blocked = inletElectricalScreen({ ...source, ordinaryBody: { axisXMm: 10860, radiusMm: 300 } })
  assert.ok(blocked.diagnostics.includes('MAINBOARD_SCREEN_INTERCEPTS_NORMAL_ROUTE'))
  assert.throws(() => inletElectricalScreen({ ...source, clearHeightMm: NaN }), /Invalid/)
  assert.throws(() => inletElectricalScreen({ ...source, fullReversalUpperN: [-1, 340] }), /Invalid/)
})
