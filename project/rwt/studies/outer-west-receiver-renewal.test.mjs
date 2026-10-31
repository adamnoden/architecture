import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seamCoverage, capRelease, rectanglesOverlap, tailApertureMargin, outputs} from './outer-west-receiver-renewal.mjs';

const basis = {gauge: 2000, footprint: 40, placement: 2, seatWidth: 50,
  alpha: 17e-6, installed: 20, cold: -10, hot: 70};
const cap = {hole: [36,44], stud: [37,43], capBottom: 5, capTop: 9, studTop: 20, lift: 16};
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9,
  `${actual} differs from ${expected}`);

test('full footprint and installation offset expand, not only the seam centre', () => {
  const r = seamCoverage(basis);
  close(r.centreMotion[0], -1.02);
  close(r.centreMotion[1], 1.7);
  close(r.interval[0], -23.00878);
  close(r.interval[1], 23.7187);
  close(r.minimumMargin, 1.2813);
  assert.equal(r.strictlyCovered, true);
  // Moving only a rigid 40-wide box would produce a different right extreme.
  assert.ok(r.interval[1] > 23.7);
});

test('an installation-position seat can miss the seam after movement', () => {
  const r = seamCoverage({...basis, seatWidth: 46});
  close(r.minimumMargin, -0.7187);
  assert.equal(r.strictlyCovered, false);
  // The installation-temperature footprint, including placement, fits 46.
  assert.equal(seamCoverage({...basis, seatWidth: 46, cold: 20, hot: 20}).strictlyCovered, true);
});

test('relative support movement can defeat the stationary-seat result', () => {
  const r = seamCoverage({...basis, seatShift: [2,2]});
  close(r.leftMargin, -0.00878);
  assert.equal(r.strictlyCovered, false);
});

test('a footprint straddling the datum has hot extremes on both sides', () => {
  const r = seamCoverage({...basis, gauge: 0});
  close(r.interval[0], -22.0187);
  close(r.interval[1], 22.0187);
  assert.equal(r.extremes.minimum.temperature, 70);
  assert.equal(r.extremes.maximum.temperature, 70);
  const reverse = seamCoverage({...basis, gauge: -2000});
  close(reverse.interval[0], -23.7187);
  close(reverse.interval[1], 23.00878);
});

test('keeper must clear both the cylindrical hole and retained stud top', () => {
  const r = capRelease(cap);
  assert.deepEqual(r.holeMargins, [1,1]);
  close(r.finalStudClearance, 1);
  assert.equal(r.canTranslateAfterLift, true);
  assert.equal(capRelease({...cap, lift: 15}).canTranslateAfterLift, false);
  assert.equal(capRelease({...cap, hole: [37.5,42.5]}).canTranslateAfterLift, false);
  assert.equal(rectanglesOverlap([0,5,20,8],[-5,5,50,9]), true);
  assert.equal(rectanglesOverlap([0,5,20,8],[60,21,115,25]), false);
});

test('stem clearance cannot substitute for the complete carried terminal', () => {
  // Synthetic envelopes exercise the inequality; not receiver product sizes.
  assert.ok(tailApertureMargin({opening: 100, carriedWidth: 80}) > 0);
  assert.ok(tailApertureMargin({opening: 100, carriedWidth: 110}) < 0);
  close(tailApertureMargin({opening: 100, carriedWidth: 100}), 0);
  assert.ok(tailApertureMargin({opening: 100, carriedWidth: 96, lateralOffset: 3}) < 0);
});

test('invalid physical intervals are rejected', () => {
  assert.throws(() => seamCoverage({...basis, placement: -1}));
  assert.throws(() => seamCoverage({...basis, seatShift: [3,2]}));
  assert.throws(() => seamCoverage({...basis, gauge: NaN}));
  assert.throws(() => capRelease({...cap, lift: -1}));
  assert.throws(() => tailApertureMargin({opening: 0, carriedWidth: 10}));
});

test('owning generator reproduces both sheets and the located record', () => {
  for (const [name, content] of outputs)
    assert.equal(readFileSync(new URL(name, import.meta.url), 'utf8'), content, name);
});
