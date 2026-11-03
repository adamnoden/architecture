import test from 'node:test';
import assert from 'node:assert/strict';
import { readInputs } from './open-loggia-event.mjs';
import { compareGardenGradeEnvelope } from './court-site-grade-envelope.mjs';

const near = (actual, expected, tolerance = 1e-8) =>
  assert(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('the joined section uses pinned HAD/MAT geometry and never chooses a real site', () => {
  const v = compareGardenGradeEnvelope(), s = v.section;
  near(s.loggiaMouthYmm, 7750);
  near(s.loggiaMouthLevelMm, -110);
  near(s.outerHouseYmm, 12000);
  near(s.outerHouseLevelMm, -152.5);
  near(s.guardYmm, 13200);
  near(s.guardLevelAtHypotheticalOnePercentMm, -164.5);
  near(s.gradeOnlyDropFromGuardToNotionalWaterMm, 635.5);
  near(s.unqualifiedPanDpcWettingComparatorMm, -30);
  near(s.notionalHistoricalReceiverWaterMm, -800);
  near(s.widthMm, 2400);
  near(s.nominalLoggiaSlope, 0.01);
  assert.equal(typeof v.source.had, 'string');
  assert.equal(typeof v.source.mat, 'string');
  assert.match(v.authority, /nor a particular London plot is selected/);
  assert(!Object.hasOwn(v, 'selectedSiteGrade'));
});

test('preserving the historical -800 water plane at a shallow grade has a large optimistic land burden', () => {
  const v = compareGardenGradeEnvelope();
  const [one, two, five] = v.continuationSlopes;
  near(one.nominalSlope, .01);
  near(one.requiredBeyondGuardMm, 63550);
  near(one.totalBeyondOuterHouseMm, 64750);
  near(one.optimisticNorthCoordinateYmm, 76750);
  near(one.grossSurfaceAreaBeyondHouseM2, 155.4);
  near(two.requiredBeyondGuardMm, 31775);
  near(two.grossSurfaceAreaBeyondHouseM2, 79.14);
  near(five.requiredBeyondGuardMm, 12710);
  near(five.grossSurfaceAreaBeyondHouseM2, 33.384);
  assert(one.grossSurfaceAreaBeyondHouseM2 > two.grossSurfaceAreaBeyondHouseM2);
  assert(two.grossSurfaceAreaBeyondHouseM2 > five.grossSurfaceAreaBeyondHouseM2);
});

test('shorter garden probes demand different grades and are not 1% continuations', () => {
  const v = compareGardenGradeEnvelope();
  const [five, ten, twenty] = v.availableGardenRuns;
  near(five.requiredSlopeToNotionalWater, .1271);
  near(ten.requiredSlopeToNotionalWater, .06355);
  near(twenty.requiredSlopeToNotionalWater, .031775);
  near(five.hypotheticalEndAtOnePercentMm, -214.5);
  near(ten.hypotheticalEndAtOnePercentMm, -264.5);
  near(twenty.hypotheticalEndAtOnePercentMm, -364.5);
  near(five.onePercentShortfallToNotionalWaterMm, 585.5);
  near(ten.onePercentShortfallToNotionalWaterMm, 535.5);
  near(twenty.onePercentShortfallToNotionalWaterMm, 435.5);
  assert(v.availableGardenRuns.every(c => c.onePercentShortfallToNotionalWaterMm > 0));
  assert(v.counterexamples.some(s => s.includes('no positive gravity head')));
  assert(v.counterexamples.some(s => s.includes('measured land')));
  assert.match(v.decision, /RWT-06 remains planned/);
});

test('selected source drift fails closed, rather than silently inheriting the old water levels', () => {
  const shifted = structuredClone(readInputs());
  shifted.house.model.sections.waterLevels.loggiaNorth = -180;
  assert.throws(() => compareGardenGradeEnvelope(shifted));
  const moved = structuredClone(readInputs());
  moved.envelope.model.terminals.guardNorthY = 13500;
  assert.throws(() => compareGardenGradeEnvelope(moved));
});
