import assert from 'node:assert/strict';
import test from 'node:test';
import {evidence, passageMargin, openingLowerBound, planeGaps, derive} from './copper-access-geometry.mjs';

test('published flange envelope, not 108 tube size, controls the intact-body comparison', () => {
  assert.equal(evidence.flange.item, '89604');
  assert.equal(passageMargin(160, evidence.flange.listedEnvelopeMm[1]), -60);
  assert.equal(passageMargin(160, evidence.flange.tubeSizeMm), 52);
});

test('unverified backing-ring removal does not earn a smaller carried envelope', () => {
  assert.equal(passageMargin(160, null), null);
  assert.equal(derive().separatelyRemovedBackingRingResidualMm, null);
});

test('690 is conditional on the old centres and side allowances, not a universal opening', () => {
  assert.equal(openingLowerBound(400, 220, 35), 690);
  assert.equal(openingLowerBound(400, 220, 0), 620);
  assert.equal(derive().excessOverHistoricalOpeningMm, 40);
});

test('catalogue mass includes the two removable adaptors but not fixed mates or missing hardware', () => {
  assert.equal(evidence.bend.item, '89641');
  assert.equal(derive().bendPlusTwoAdaptorsCatalogueMassKg, 9.44);
});

test('right-angle ideal faces admit a common separating translation', () => {
  assert.deepEqual(planeGaps([[-1, 0], [0, -1]], [-1, -1]), [1, 1]);
  assert.deepEqual(planeGaps([[-1, 0], [0, -1]], [-3, -2]), [3, 2]);
});

test('a direction that opens one joint can close the other', () => {
  assert.deepEqual(planeGaps([[-1, 0], [0, -1]], [-1, 1]), [1, -1]);
  for (const x of [-10, -1, 0, 1, 10]) {
    const gaps = planeGaps([[-1, 0], [1, 0]], [x, 5]);
    assert.ok(!gaps.every(gap => gap > 0));
  }
});

test('invalid inputs cannot produce plausible catalogue or motion results', () => {
  for (const bad of [0, -1, NaN, Infinity, undefined]) {
    assert.throws(() => passageMargin(bad, 220));
    assert.throws(() => passageMargin(160, bad));
  }
  assert.throws(() => openingLowerBound(200, 220, 35));
  assert.throws(() => openingLowerBound(400, 220, -1));
  assert.throws(() => planeGaps([[2, 0], [0, -1]], [-1, -1]));
  assert.throws(() => planeGaps([[-1, 0], [0, -1]], [NaN, -1]));
});

test('deterministic result cannot promote normal separation to installed acceptance', () => {
  assert.deepEqual(derive(), derive());
  assert.equal(derive().assemblyAcceptance, 'not-established');
  assert.ok(derive().withheld.includes('Whole-body and tool swept clearance'));
});
