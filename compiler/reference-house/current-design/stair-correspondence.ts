/** Source correspondence only: neither footprint is selected or structurally qualified. */
export interface SourceStairFootprint {
  readonly objectId: string
  readonly source: { readonly path: string; readonly gitBlob: string }
  readonly units: 'mm'
  readonly datum: 'shell-south-west/source-ground-floor'
  readonly footprintXYWHMm: readonly number[]
  readonly floorDatumsMm: readonly number[]
}

export function compareStairFootprints(nominal: SourceStairFootprint, selected: SourceStairFootprint) {
  const supported = (value: SourceStairFootprint) => !!value && typeof value === 'object' && value.units === 'mm'
    && value.datum === 'shell-south-west/source-ground-floor'
    && !!value.objectId && !!value.source && !!value.source.path && /^[0-9a-f]{40}$/.test(value.source.gitBlob)
    && Array.isArray(value.footprintXYWHMm) && value.footprintXYWHMm.length === 4 && value.footprintXYWHMm.every(Number.isFinite)
    && value.footprintXYWHMm[2]! > 0 && value.footprintXYWHMm[3]! > 0
    && Array.isArray(value.floorDatumsMm) && value.floorDatumsMm.length === 2 && value.floorDatumsMm.every(Number.isFinite)
    && value.floorDatumsMm[1]! > value.floorDatumsMm[0]!
  const valid = supported(nominal) && supported(selected)
  const deltaXYWHMm = valid ? selected.footprintXYWHMm.map((value, i) => value - nominal.footprintXYWHMm[i]!) : null
  const floorDatumDeltaMm = valid ? selected.floorDatumsMm.map((value, i) => value - nominal.floorDatumsMm[i]!) : null
  const mismatch = !!deltaXYWHMm?.some(value => value !== 0) || !!floorDatumDeltaMm?.some(value => value !== 0)
  const diagnostics = !valid ? [{ code: 'STAIR_SOURCE_CORRESPONDENCE_UNSUPPORTED',
    objectId: 'reference-house/return-stair', state: 'uncoordinated-comparisons' as const,
    stages: ['plans', 'occupiedServices', 'selectedWaterEvent'],
    message: 'Stair correspondence requires explicit finite mm footprints, floor datums and authenticated sources in the same declared coordinate system; no translation or zero-datum equivalence is assumed.' }]
    : mismatch ? [{ code: 'STAIR_PLAN_SOURCE_SPLIT', objectId: 'reference-house/return-stair',
      state: 'uncoordinated-comparisons' as const, stages: ['plans', 'occupiedServices', 'selectedWaterEvent'],
      message: `Nominal stair ${JSON.stringify(nominal.footprintXYWHMm)} at ${nominal.source.path} differs from the selected HAD/STR-source stair ${JSON.stringify(selected.footprintXYWHMm)} at ${selected.source.path}; selected minus nominal XYWH is ${JSON.stringify(deltaXYWHMm)} mm and floor-datum difference is ${JSON.stringify(floorDatumDeltaMm)} mm. These are separate source comparisons, not one coordinated house. No footprint or datum is adopted or transformed.` }]
      : []
  return { schema: 'current-stair-source-correspondence/1' as const,
    status: !valid ? 'unsupported-correspondence' as const : mismatch ? 'different-source-geometry' as const : 'matching-source-geometry' as const,
    nominal, selected, deltaXYWHMm, floorDatumDeltaMm, diagnostics,
    evidence: { geometrySelected: false as const, structuralAcceptance: false as const, ownerAcceptance: false as const } }
}
