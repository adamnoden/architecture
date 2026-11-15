import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const read = name => new URL('./' + name, import.meta.url);

test('the split inlet remains clear of the southern stability leg and inherited transfer lanes', () => {
  execFileSync(process.execPath, [fileURLToPath(read('south-utility-inlet.mjs')), '--check']);
  const result = JSON.parse(readFileSync(read('south-utility-inlet.json'), 'utf8'));
  const { clearance, bores, sleeveFall } = result.walls;
  assert.equal(clearance.east600CutsStabilityLeg, true);
  assert.equal(clearance.utilityBoreToWindow, 35);
  assert.equal(clearance.plantBoreToRCWing, 27.5);
  assert.equal(clearance.trialHousingToRoofRenewalLane, 140);
  assert.equal(sleeveFall, 10.39);
  for (const [index, path] of [result.continuation.utility, result.continuation.plant].entries()) {
    assert.equal(path[0][2], bores[index][2] + 18);
    assert.equal(path[1][2], bores[index][2] + 18 + sleeveFall);
  }
  assert.ok(result.continuation.coldPairAfterSetting >= 25);
  assert.equal(result.continuation.toleranceMMFrom25AtExistingUtilityCrossing, 3.17);
  assert.equal(result.completed, false);
});

test('the enlarged and jacketed comparisons cannot inherit the bounded sleeve discharge result', () => {
  const { hydro, fixedResistanceComparison } = JSON.parse(readFileSync(read('south-utility-inlet.json'), 'utf8'));
  assert.ok(hydro.circular100CleanLmin < hydro.supplyComparatorLmin);
  assert.ok(hydro.circular150HalfWidthLminAt30 < hydro.supplyComparatorLmin);
  assert.ok(hydro.circular150BoreBoundaryMinMMAtCurrentCentres < 25);
  assert.deepEqual(hydro.raisedBareCarrier.map(row => row.halfWidthLmin), [72.78, 66.19]);
  assert.ok(hydro.raisedBareCarrier.every(row => row.halfWidthLmin < 90 && row.centredHalfWidthLmin < 60));
  assert.equal(hydro.noDischargeRejection, true);
  assert.deepEqual(fixedResistanceComparison.resistanceComparisons.map(row => row.minimumDynamicBarAtComparatorDemand), [5.67, 7.75]);
  assert.ok(fixedResistanceComparison.resistanceComparisons.every(row => !row.atTrialDynamicHead));
});
