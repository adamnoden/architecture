/**
 * RWT-06: grade-only plot-envelope counterexample for the open-surface route.
 *
 * Test a continuous shallow garden surface against the historical notional
 * receiver-water elevation. This is deliberately an optimistic NECESSARY
 * geometry screen: it excludes water depth, approach/transition losses, land
 * ownership, structural support, accessibility, flooding and legal disposal.
 * The -800 mm water plane is NOT a site requirement or selected destination.
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { compareOpenSurfaceRoute } from './court-full-width-surface.mjs';

export function compareGardenGradeEnvelope(source) {
  // Inherit both pinned selected-source blobs and all floor/terminal assertions.
  const baseline = compareOpenSurfaceRoute(source);
  const {selected, challenger} = baseline;
  const outerHouseYmm = selected.footprint[1] + selected.footprint[3];
  const guardYmm = challenger.hypotheticalContinuationToGuardYmm;
  const atGuardMm = challenger.hypotheticalContinuationEndMm;
  const notionalWaterMm = challenger.unchangedAuthoredReceiverWaterMm;
  const dropAfterGuardMm = atGuardMm - notionalWaterMm;
  const stripWidthMm = challenger.hypotheticalFullWidthMm;
  assert(guardYmm > outerHouseYmm);
  assert.equal(guardYmm - outerHouseYmm, challenger.additionalOutsideHouseRunMm);
  assert(dropAfterGuardMm > 0);
  assert.equal(dropAfterGuardMm, challenger.elevationDiscontinuityToUnverifiedWaterMm);

  const continuationSlopes = [0.01, 0.02, 0.05].map(slope => {
    const requiredBeyondGuardMm = dropAfterGuardMm / slope;
    const totalBeyondOuterHouseMm = guardYmm - outerHouseYmm + requiredBeyondGuardMm;
    return {
      nominalSlope: slope,
      requiredBeyondGuardMm,
      totalBeyondOuterHouseMm,
      optimisticNorthCoordinateYmm: guardYmm + requiredBeyondGuardMm,
      grossSurfaceAreaBeyondHouseM2: totalBeyondOuterHouseMm * stripWidthMm / 1e6
    };
  });

  const availableGardenRuns = [5000, 10000, 20000].map(beyondGuardMm => ({
    beyondGuardMm,
    requiredSlopeToNotionalWater: dropAfterGuardMm / beyondGuardMm,
    hypotheticalEndAtOnePercentMm: atGuardMm - selected.slope * beyondGuardMm,
    onePercentShortfallToNotionalWaterMm: atGuardMm -
      selected.slope * beyondGuardMm - notionalWaterMm
  }));

  return {
    authority: 'Unadopted, optimistic continuous-grade arithmetic only. Neither historic -800 receiving water nor a particular London plot is selected; no discharge, safe access or first-harm pass.',
    source: baseline.source,
    section: {
      outerHouseYmm,
      outerHouseLevelMm: selected.outerBoundaryMm,
      guardYmm,
      guardLevelAtHypotheticalOnePercentMm: atGuardMm,
      loggiaMouthYmm: selected.footprint[1],
      loggiaMouthLevelMm: selected.courtMouthMm,
      widthMm: stripWidthMm,
      unqualifiedPanDpcWettingComparatorMm: selected.firstHarmComparatorMm,
      notionalHistoricalReceiverWaterMm: notionalWaterMm,
      gradeOnlyDropFromGuardToNotionalWaterMm: dropAfterGuardMm,
      nominalLoggiaSlope: selected.slope
    },
    continuationSlopes,
    availableGardenRuns,
    counterexamples: [
      'At the historic -800 water comparison, a 1% continuous surface would consume more than 64 m of depth north of the outer wall. This is a plot-screening burden, not a minimum garden requirement.',
      'A 5 or 10 m garden cannot achieve that same -800 level by merely continuing the nominal 1% floor. A steeper joined landform introduces different daily circulation, support, erosion and water-control duties.',
      'If the actual maximum receiving water is at or above the -164.5 guard trial level, the proposed onward falling open surface has no positive gravity head; a local lower recess does not create one.',
      'If high connected tailwater reaches the unqualified -30 pan/DPC comparison, it threatens that wetting boundary even without a mouth obstruction. Neither a second drawn receiver nor dry-weather flow solves this.',
      'A new, higher site receiving contour may remove the historical -800 mismatch, but only measured land, acceptable flow/head/first-harm states and a lawful onward destination could qualify it.'
    ],
    decision: 'Reject reuse of the historical -800 receiver-water plane as an assumed continuous shallow garden destination. Develop the open-surface family only against a surveyed plot, joined HAD/STR/MAT section, actual safe circulation and independent full-failure escape. RWT-06 remains planned.'
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = compareGardenGradeEnvelope();
  console.log(JSON.stringify({
    section: result.section,
    continuationSlopes: result.continuationSlopes,
    availableGardenRuns: result.availableGardenRuns,
    decision: result.decision
  }, null, 2));
}
