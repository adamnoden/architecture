import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compareExternalCutCabinet } from './incoming-water-cut-cabinet.mjs'

const result = compareExternalCutCabinet()

test('the external cut exchanges the wet lobby approach for explicit exterior access and still needs a dry site path', () => {
  const { cabinet, retained } = result
  assert.equal(cabinet.cabinetToDockMM, 50)
  assert.equal(cabinet.workerPlatformRiseAtTrialGradeMM, 1310)
  assert.equal(cabinet.firstRest.remainingPlatformRunMM, 25)
  assert.ok(cabinet.openings.every(end => end.toolLateralGapMM > 60 && end.farthestHandReachMM < 591))
  assert.match(retained.I0, /outside-wall/)
  assert.match(retained.B0, /precedes/)
  assert.equal(cabinet.actualDryApproachProved, false)
  assert.equal(cabinet.firstRest.operatorAndCaptureProved, false)
})

test('the changed low link protects the east indoor turn but fitting through the sleeve is still unproved', () => {
  const { supply } = result
  assert.equal(supply.straightInsideSleeveBeforeBendMM, 70.5)
  assert.equal(supply.alignedPreformedBendAcrossBoreShortfallMM, 34)
  assert.ok(Object.values(supply.routeWalls).every(gap => gap > 25))
  assert.ok(supply.wallClearanceAfterTwoSettingsMM.eastBeyondSleeveTurn < 25)
  assert.equal(supply.d1TeeOnStraightAfterBends, true)
  assert.equal(supply.relocatedI0Unions + supply.retainedU0P0Unions, supply.interiorUnionsBefore)
  assert.equal(supply.routeInstallationAndWithdrawalProved, false)
})

test('local storage buys a bounded response interval with both outlets blocked', () => {
  const { response } = result
  assert.ok(response.trayGrossLitres > response.trialNetLitres)
  const high = response.byFlow.find(row => row.flowLmin === 30)
  assert.equal(high.cutTimeBeforeReserveS, 36)
  assert.equal(high.blockedSecondsToRim, 48)
  assert.ok(high.halfClearControllingLmin > 34 && high.halfClearControllingLmin < 35)
  assert.equal(response.automatedCutCredited, false)
  assert.equal(response.outletIndependenceProved, false)
  assert.equal(response.storageAfterClosureKnown, false)
  assert.deepEqual(result, JSON.parse(readFileSync(new URL('./incoming-water-cut-cabinet.json', import.meta.url), 'utf8')))
})
