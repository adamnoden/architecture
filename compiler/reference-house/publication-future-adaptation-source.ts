export type FutureAdaptationAuthority =
  | 'RH_C1_ARCHITECTURAL_TOPOLOGY'
  | 'HFI_AUDITED_TOPOLOGICAL_CAPABILITY'
  | 'HFI_ADAPTATION_INTENT'

export interface FutureAdaptationFact<T> {
  id: string
  value: T
  authority: FutureAdaptationAuthority
  precision: 'architectural-geography' | 'qualitative'
  provenance: readonly string[]
}

const fact = <T>(
  id: string,
  value: T,
  authority: FutureAdaptationAuthority,
  precision: FutureAdaptationFact<T>['precision'],
  provenance: readonly string[]
): FutureAdaptationFact<T> => ({ id, value, authority, precision, provenance })

/**
 * DRW-10E.1 selects only already-audited entrance-storey adaptation meanings.
 * It creates no sanitary subdivision, route centreline, bed layout or compliance
 * geometry. The canonical ground plan remains the sole geometric substrate.
 */
export const createFutureAdaptationPublicationSource = () => ({
  view: {
    id: 'REFERENCE-HOUSE-ENTRANCE-STOREY-FUTURE-ADAPTATION-OVERLAY' as const,
    substrate: 'REFERENCE-HOUSE-GROUND-PLAN' as const,
    scale: 100 as const
  },
  sleeping: fact(
    'DRW10E1-FALLBACK-SLEEPING',
    {
      spaceId: 'G-FAM-02' as const,
      reading: 'fallback-sleeping-option-topological-capability' as const,
      sourceStatus: 'PROVISIONAL' as const
    },
    'HFI_AUDITED_TOPOLOGICAL_CAPABILITY',
    'architectural-geography',
    [
      'project/hfi/hfi-07b-approach-ground-floor.md#HFI-07B-10',
      'project/hfi/hfi-02c-vertical-life-course.md'
    ]
  ),
  route: fact(
    'DRW10E1-ONE-LEVEL-ROUTE',
    {
      spaceIds: ['G-HALL-02', 'G-GAL-01'] as const,
      reading: 'one-level-all-weather-route-territory-not-route-centreline' as const
    },
    'HFI_AUDITED_TOPOLOGICAL_CAPABILITY',
    'architectural-geography',
    [
      'project/hfi/hfi-07b-approach-ground-floor.md#HFI-07B-01',
      'project/hfi/hfi-07b-approach-ground-floor.md#HFI-07B-02',
      'project/hfi/hfi-07b-approach-ground-floor.md#HFI-07B-03'
    ]
  ),
  sanitary: fact(
    'DRW10E1-SANITARY-ADAPTATION',
    {
      spaceId: 'G-SVC-02' as const,
      reading: 'gross-service-suite-sanitary-shower-adaptation-geography' as const,
      sourceStatus: 'FROZEN_GROSS_GEOGRAPHY_ONLY' as const
    },
    'HFI_ADAPTATION_INTENT',
    'architectural-geography',
    [
      'project/hfi/hfi-02c-vertical-life-course.md',
      'project/hfi/hfi-04a-bathing-toileting-dressing.md',
      'project/hfi/hfi-07b-approach-ground-floor.md#HFI-07B-11'
    ]
  ),
  comparator: fact(
    'DRW10E1-M4-BOUNDARY',
    'M4(2)-informed-comparator-no-compliance-claim' as const,
    'HFI_ADAPTATION_INTENT',
    'qualitative',
    [
      'docs/publication/architectural-drawing-drw02a-part-iv-claim-map.md',
      'project/hfi/hfi-02c-vertical-life-course.md'
    ]
  ),
  absences: {
    bedGeometry: 'ABSENT' as const,
    routeCentreline: 'ABSENT' as const,
    finishedRouteClearWidth: 'NOT_MODELLED' as const,
    doorwayManoeuvres: 'NOT_MODELLED' as const,
    thresholds: 'NOT_MODELLED' as const,
    siteApproach: 'NOT_MODELLED_SITE_BOUND' as const,
    exactSanitarySubdivision: 'ABSENT' as const,
    wcFixtureGeometry: 'NOT_MODELLED' as const,
    showerGeometry: 'NOT_MODELLED' as const,
    drainage: 'NOT_MODELLED_TECHNICAL' as const,
    showerControls: 'NOT_MODELLED' as const,
    supportGeometry: 'NOT_MODELLED' as const,
    dryStaging: 'NOT_MODELLED' as const,
    accessibilityCompliance: 'NOT_CLAIMED' as const,
    completeFallbackModeProof: 'NOT_MODELLED' as const
  }
})

export type FutureAdaptationPublicationSource = ReturnType<typeof createFutureAdaptationPublicationSource>
