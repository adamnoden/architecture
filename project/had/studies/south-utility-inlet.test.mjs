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
  assert.equal(result.continuation.utilityToHotAfterSetting, 40.19);
  assert.equal(result.continuation.olderHotBackboneUtilityAfterSetting, 15.99);
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

test('Independent lower relief keeps a vented reverse path with the normal outlet obstructed', () => {
  execFileSync(process.execPath, [fileURLToPath(read('south-inlet-relief.mjs')), '--check']);
  const result = JSON.parse(readFileSync(read('south-inlet-relief.json'), 'utf8'));
  assert.equal(result.adopted, false);
  assert.deepEqual(result.geometry.provisionalJamb.alongWallBandX, [10400, 10605]);
  assert.deepEqual(result.geometry.provisionalJamb.bores.map(bore => bore.nominalJambOverlapMM), [160, 110, 67.5, 15]);
  assert.deepEqual(result.geometry.indoorBoxMouthClearanceMM.map(row => row.outsideBoxMM), [40, 47.5]);
  const reverse = result.throughWallRupture;
  assert.equal(reverse.existingClearanceOnly.ventedCrownRetained, false);
  assert.ok(reverse.preferredWideBore.reserveToAirLimitMM > 10);
  assert.equal(reverse.jacketEnvelopeTrials.at(-1).ventedCrownRetained, false);
  assert.ok(result.branches.every(branch => branch.outlet.freeDropReserveAfterSettingsMM > 10));
});

test('The under-sill successor reproduces its occupied bypass and taper limits', () => {
  execFileSync(process.execPath, [fileURLToPath(read('south-inlet-under-sill.mjs')), '--check']);
});
