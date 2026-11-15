import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compareGradeCutCabinet, gradeCabinetDrawing } from './incoming-water-grade-cabinet.mjs'

const result = compareGradeCutCabinet()

test('ground-level dry approach avoids the raised witness without buying a raised operator platform', () => {
  const { access } = result
  assert.equal(access.dropMM, 1310)
  assert.equal(access.trialWorkingFloor, -1800)
  assert.equal(access.oldSouthFaceBodyDeficitMM, 160)
  assert.equal(access.drySideGapToRaisedDripMM, 25)
  assert.ok(access.gripReachMM > 555 && access.gripReachMM < 557)
  assert.ok(Math.max(...access.spannerSectors) < 612)
  assert.equal(access.firstRest.eastwardThrowMM, 610)
  assert.equal(access.firstRest.operatorAndCaptureProved, false)
})

test('the post-stop isolated rise clears the structural projection and retained drip route', () => {
  const { supply } = result
  assert.deepEqual(supply.retainedWallPassage, [12090, 2800, 600])
  assert.equal(supply.workingUnionZ, -710)
  assert.equal(supply.protectedTowerToDripAfterSettingMM, 15)
  assert.ok(supply.protectedPostCutToBeamMM > 32)
  assert.ok(supply.actualDuctGapAfterSettingsMM > 33)
  assert.equal(supply.separatelyRenewableProtectedRiseProved, false)
})

test('one half-open separate overflow retains the modeled residual reserve without a verified outfall', () => {
  const { fault } = result
  assert.deepEqual(fault.paths.map(path => path.maximumTrialTailwaterZ), [-1160, -1140])
  assert.ok(fault.paths.every(path => path.toDryFieldAfterSettingMM >= 60))
  assert.equal(fault.bothPathsBlockedTimeToReserveS, 36)
  assert.ok(fault.illustrativeResidualReserveLitres > 6)
  assert.equal(fault.assumedActualTailwaterZ, null)
  assert.equal(fault.independentReceivingAreasProved, false)
  assert.equal(fault.jetCaptureProved, false)
  assert.deepEqual(result, JSON.parse(readFileSync(new URL('./incoming-water-grade-cabinet.json', import.meta.url), 'utf8')))
  assert.equal(gradeCabinetDrawing(result), readFileSync(new URL('./incoming-water-grade-cabinet.svg', import.meta.url), 'utf8'))
})
