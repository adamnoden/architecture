/** Bounded catalogue/geometry comparison. No selected fitting assembly or house clearance. */
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const evidence = Object.freeze({
  inspectedOn: '2026-10-30',
  flange: Object.freeze({
    manufacturer: 'Aalberts IPS', family: 'N1FMGI', item: '89604', tubeSizeMm: 108,
    listedEnvelopeMm: Object.freeze([19, 220, 220]), listedMassKg: 4.05,
    source: 'https://aalberts-ips.co.uk/products/detail/n1fmgi/',
    boundary: 'HTML assortment row; not verified mating geometry, tolerances or removable backing-ring evidence.'
  }),
  bend: Object.freeze({
    manufacturer: 'Aalberts IPS', family: 'N18', item: '89641', tubeSizeMm: 108,
    listedEnvelopeMm: Object.freeze([113, 195, 195]), listedMassKg: 1.34,
    source: 'https://aalberts-ips.co.uk/products/item/89641/',
    boundary: 'Manufacturer indexed HTML; not a fabricated terminal dimension or a matched joint approval.'
  }),
  historicalRoute: Object.freeze({
    source: 'project/rwt/north-court-carrier.md',
    originalBoreMm: 160, axisSpacingMm: 400, sideAllowanceMm: 35, clearOpeningMm: 650,
    boundary: 'Unadopted north-study envelopes. No polymer sleeve, structural opening or site is selected.'
  })
});

function number(name, value, positive = false) {
  if (!Number.isFinite(value) || value < 0 || (positive && value === 0)) {
    throw new RangeError(`${name} must be finite and ${positive ? 'positive' : 'nonnegative'}`);
  }
}

/** A negative value rejects this carried envelope. Null cannot become the bare tube. */
export function passageMargin(bore, carriedEnvelope) {
  number('bore', bore, true);
  if (carriedEnvelope === null) return null;
  number('carriedEnvelope', carriedEnvelope, true);
  return bore - carriedEnvelope;
}

/** Two equal passages at retained centres; zero wall and zero running clearance is only a lower bound. */
export function openingLowerBound(axisSpacing, carriedEnvelope, sideAllowance) {
  number('axisSpacing', axisSpacing, true);
  number('carriedEnvelope', carriedEnvelope, true);
  number('sideAllowance', sideAllowance);
  if (axisSpacing <= carriedEnvelope) throw new RangeError('The distinct equal passages overlap or touch');
  return axisSpacing + carriedEnvelope + 2 * sideAllowance;
}

/**
 * Signed plane-gap witness, after all fasteners have been removed.
 * Normal points away from each FIXED mate. Flat, non-interlocking mating faces
 * and no contact obstruction are assumptions, not facts about the catalogue items.
 * Positive results are not a collision, gasket-release, tool or removal proof.
 */
export function planeGaps(normals, translation) {
  if (!Array.isArray(normals) || normals.length !== 2 || !Array.isArray(translation) ||
      translation.length !== 2 || !translation.every(Number.isFinite)) {
    throw new TypeError('Exactly two 2D unit normals and a finite 2D translation are required');
  }
  return normals.map(normal => {
    if (!Array.isArray(normal) || normal.length !== 2 || !normal.every(Number.isFinite) ||
        Math.abs(Math.hypot(...normal) - 1) > 1e-12) {
      throw new RangeError('Each normal must be a finite unit vector');
    }
    return normal[0] * translation[0] + normal[1] * translation[1];
  });
}

export function derive() {
  const f = evidence.flange, b = evidence.bend, r = evidence.historicalRoute;
  const lowerBound = openingLowerBound(r.axisSpacingMm, f.listedEnvelopeMm[1], r.sideAllowanceMm);
  return {
    authority: 'Catalogue-envelope rejection and ideal plane-gap witness only; not for construction.',
    intactFlangeAgainstOriginalBoreMm: passageMargin(r.originalBoreMm, f.listedEnvelopeMm[1]),
    separatelyRemovedBackingRingResidualMm: passageMargin(r.originalBoreMm, null),
    retainedCentresAndMarginsOpeningLowerBoundMm: lowerBound,
    excessOverHistoricalOpeningMm: lowerBound - r.clearOpeningMm,
    bendPlusTwoAdaptorsCatalogueMassKg: Number((b.listedMassKg + 2 * f.listedMassKg).toFixed(2)),
    orthogonalUnitWitness: {translation: [-1, -1], planeGaps: planeGaps([[-1, 0], [0, -1]], [-1, -1])},
    opposedCounterexample: {translation: [-1, -1], planeGaps: planeGaps([[-1, 0], [1, 0]], [-1, -1])},
    assemblyAcceptance: 'not-established',
    withheld: ['Actual flange face profile, gasket and axial dimensions', 'Whole-body and tool swept clearance',
      'Independent support, movement and fabrication', 'Water barrier, dry access, hydraulics and house route']
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error('No arguments are accepted');
  console.log(JSON.stringify(derive(), null, 2));
}
