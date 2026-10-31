/** Type boundary for the existing JavaScript study; runtime values remain in .mjs. */
interface CatalogueComponent {
  readonly manufacturer: string;
  readonly family: string;
  readonly item: string;
  readonly tubeSizeMm: number;
  readonly listedEnvelopeMm: readonly [number, number, number];
  readonly listedMassKg: number;
  readonly source: string;
  readonly boundary: string;
}

export const evidence: Readonly<{
  inspectedOn: string;
  flange: CatalogueComponent;
  bend: CatalogueComponent;
  historicalRoute: Readonly<{
    source: string;
    originalBoreMm: number;
    axisSpacingMm: number;
    sideAllowanceMm: number;
    clearOpeningMm: number;
    boundary: string;
  }>;
}>;

export function passageMargin(bore: number, carriedEnvelope: number | null): number | null;
export function openingLowerBound(axisSpacing: number, carriedEnvelope: number, sideAllowance: number): number;
export function planeGaps(
  normals: readonly [readonly [number, number], readonly [number, number]],
  translation: readonly [number, number],
): [number, number];

export function derive(): {
  authority: string;
  intactFlangeAgainstOriginalBoreMm: number | null;
  separatelyRemovedBackingRingResidualMm: number | null;
  retainedCentresAndMarginsOpeningLowerBoundMm: number;
  excessOverHistoricalOpeningMm: number;
  bendPlusTwoAdaptorsCatalogueMassKg: number;
  orthogonalUnitWitness: {translation: number[]; planeGaps: [number, number]};
  opposedCounterexample: {translation: number[]; planeGaps: [number, number]};
  assemblyAcceptance: string;
  withheld: string[];
};
