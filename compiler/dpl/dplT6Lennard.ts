import { sha256SemanticFingerprint } from '../core/identity.js'
import {
  applyArchitecturalReviewLedger,
  architecturalReviewClauseIds,
  createArchitecturalReviewLedger,
  DPL13E_REVIEW_SCHEMA_VERSION,
  type ArchitecturalReviewLedger,
  type ArchitecturalReviewRecordInput
} from './architectural-review.js'
import { loadConformanceCoverageRegistry } from './conformance-coverage.js'
import type {
  CoverageOwner,
  NormalizedCoverageDisposition,
  NormalizedCoverageReference,
  ScreeningCoverageReadinessResult
} from './coverage-readiness.js'
import { compileDPLT5LennardRealControlCase, type DPLT5Claim } from './dplT5Lennard.js'
import { loadEnglandCoverageRegistry } from './england-coverage.js'
import type { DeploymentLedger } from './model.js'
import { loadNonPlanningCoverageRegistry } from './nonplanning-coverage.js'
import { loadPlanningCoverageRegistry } from './planning-coverage.js'
import {
  buildScreeningAggregationRecords,
  type ScreeningAggregationRecord
} from './substantive-aggregation.js'
import { loadWaveCBoroughTarget, loadWaveCTargetComposition } from './wavec.js'
import type { CanonicalReferenceSiteCompile } from './canonical.js'

export const DPL_T6_SCHEMA_VERSION = 'DPL-T6-LENNARD-SCREENING-AGGREGATION-1' as const
export const DPL_T6_REVIEW_ID = 'DPL-T6-LENNARD-PROJECT-REVIEW-2026-10-25' as const
export const DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT =
  'bf04feb48795c0f5fddda5d9ddbe944428f06a52fd2afebc857a3b1bde1cf009' as const
export const DPL_T6_BROMLEY_TARGET_ID = 'BROMLEY-LOCAL-PLANNING-2019-2026-10-22' as const
export const DPL_T6_LONDON_TARGET_ID = 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20' as const

export interface DPLT6ReviewResult {
  readonly ledger: ArchitecturalReviewLedger
  readonly reviewedClauseIds: readonly string[]
  readonly pendingClauseIds: readonly string[]
}

export interface DPLT6BlockerRecord {
  readonly owner: CoverageOwner
  readonly ownerEntryId: string
  readonly coverageDisposition: NormalizedCoverageDisposition
  readonly sourceKind: ScreeningAggregationRecord['sourceKind']
  readonly sourceResult: string
  readonly aggregationState: ScreeningAggregationRecord['aggregationState']
  readonly claimRefs: readonly string[]
  readonly reason: string
}

export interface DPLT6Result {
  readonly schemaVersion: typeof DPL_T6_SCHEMA_VERSION
  readonly t5ResultFingerprint: typeof DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly readiness: {
    readonly normalizedCoverageCount: number
    readonly blockingCoverageCount: number
    readonly futureDueCount: number
    readonly accelerationReviewCount: number
    readonly uncoveredRealClaimIds: readonly string[]
    readonly localPlanningTargetId: typeof DPL_T6_BROMLEY_TARGET_ID
    readonly identityFingerprint: string
  }
  readonly architecturalReview: DPLT6ReviewResult
  readonly aggregationRecords: readonly ScreeningAggregationRecord[]
  readonly blockers: readonly DPLT6BlockerRecord[]
  readonly futureDue: readonly {
    readonly owner: CoverageOwner
    readonly ownerEntryId: string
    readonly claimRefs: readonly string[]
  }[]
  readonly blockerCountsByOwner: Readonly<Record<CoverageOwner, number>>
  readonly blockerCountsByState: Readonly<Record<string, number>>
  readonly result: 'UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED'
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly architecturalReviewNative: 'NO_HUMAN_AUTHORED'
    readonly siteEvidenceCommissioned: 'NO'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const ownerOrder: Readonly<Record<CoverageOwner, number>> = {
  REFERENCE_HOUSE: 0,
  ENGLAND: 1,
  PLANNING: 2,
  NON_PLANNING: 3
}

const conformanceDisposition = (posture: string): NormalizedCoverageDisposition => {
  switch (posture) {
    case 'POSITIVE_CONFORMANCE_REQUIRES_RESOLUTION':
      return 'DUE_NOW_REPRESENTED'
    case 'ADMITTED_ROUTE_ONLY':
      return 'ADVISORY_NON_BLOCKING'
    case 'RESOLVE_IF_INVOKED':
    case 'FUTURE_IMPLEMENTATION_BOUNDARY':
      return 'FUTURE_DUE'
    default:
      throw new Error(`DPL-T6 unsupported conformance screening posture ${posture}.`)
  }
}

const mappedClaimIds = (
  claims: readonly DPLT5Claim[],
  owner: 'PLANNING' | 'NON_PLANNING',
  entryId: string
): string[] => claims
  .filter((claim) => claim.coverageFamilyRefs.includes(`${owner}:${entryId}`))
  .map((claim) => claim.id)
  .sort((a, b) => a.localeCompare(b))

const realClaimNeedsAccelerationReview = (claim: DPLT5Claim): boolean =>
  claim.evidenceState.startsWith('UNKNOWN_') || claim.evidenceState.startsWith('PARTIALLY_')

const planningDisposition = (
  entry: ReturnType<typeof loadPlanningCoverageRegistry>['registry']['entries'][number]
): NormalizedCoverageDisposition => {
  if (entry.applicabilityClass !== 'LOCAL_AUTHORITY_DEPENDENT') {
    return entry.defaultScreeningDisposition
  }
  return entry.representedTargetIds.includes(DPL_T6_BROMLEY_TARGET_ID)
    ? 'DUE_NOW_REPRESENTED'
    : 'DUE_NOW_MISSING'
}

const composeNormalizedCoverage = (
  claims: readonly DPLT5Claim[]
): NormalizedCoverageReference[] => {
  const conformance = loadConformanceCoverageRegistry().registry.entries.map((entry): NormalizedCoverageReference => ({
    owner: 'REFERENCE_HOUSE',
    ownerEntryId: entry.id,
    normalizedDisposition: conformanceDisposition(entry.screeningCoveragePosture),
    positiveCompatibilityBlockingWhenDue: entry.unresolvedBlocksPositiveConformance,
    claimRefs: [],
    ownerSemantic: {
      conformanceClass: entry.conformanceClass,
      resolutionMode: entry.resolutionMode,
      executableStatus: entry.executableStatus,
      screeningCoveragePosture: entry.screeningCoveragePosture,
      canProveSiteIncompatibilityAlone: entry.canProveSiteIncompatibilityAlone
    }
  }))

  const england = loadEnglandCoverageRegistry().registry.entries.map((entry): NormalizedCoverageReference => ({
    owner: 'ENGLAND',
    ownerEntryId: entry.id,
    normalizedDisposition: entry.defaultScreeningDisposition,
    positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
    claimRefs: [],
    ownerSemantic: {
      applicabilityClass: entry.applicabilityClass,
      implementationState: entry.implementationState,
      representedTargetIds: canonicalStrings(entry.representedTargetIds),
      resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities),
      accelerationTriggerCount: entry.accelerationTriggers.length
    }
  }))

  const planningRegistry = loadPlanningCoverageRegistry().registry.entries
  const planning = planningRegistry.map((entry): NormalizedCoverageReference => ({
    owner: 'PLANNING',
    ownerEntryId: entry.id,
    normalizedDisposition: planningDisposition(entry),
    positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
    claimRefs: mappedClaimIds(claims, 'PLANNING', entry.id),
    ownerSemantic: {
      sourceClasses: canonicalStrings(entry.sourceClasses),
      applicabilityClass: entry.applicabilityClass,
      resolutionClasses: canonicalStrings(entry.resolutionClasses),
      implementationState: entry.implementationState,
      representedTargetIds: canonicalStrings(entry.representedTargetIds),
      accelerationTriggerCount: entry.accelerationTriggers.length
    }
  }))

  const nonPlanningRegistry = loadNonPlanningCoverageRegistry().registry.entries
  const nonPlanning = nonPlanningRegistry.map((entry): NormalizedCoverageReference => ({
    owner: 'NON_PLANNING',
    ownerEntryId: entry.id,
    normalizedDisposition: entry.defaultScreeningDisposition,
    positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
    claimRefs: mappedClaimIds(claims, 'NON_PLANNING', entry.id),
    ownerSemantic: {
      runtimeRepresentationState: entry.runtimeRepresentationState,
      applicabilityInputs: canonicalStrings(entry.applicabilityInputs),
      resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities),
      accelerationTriggerCount: entry.accelerationTriggers.length
    }
  }))

  const planningAcceleration = planningRegistry
    .filter((entry) => {
      if (entry.accelerationTriggers.length === 0) return false
      const refs = new Set(mappedClaimIds(claims, 'PLANNING', entry.id))
      return claims.some((claim) => refs.has(claim.id) && realClaimNeedsAccelerationReview(claim))
    })
    .map((entry): NormalizedCoverageReference => ({
      owner: 'PLANNING',
      ownerEntryId: `${entry.id}::ACCELERATION_REVIEW`,
      normalizedDisposition: 'ACCELERATION_REVIEW_REQUIRED',
      positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
      claimRefs: mappedClaimIds(claims, 'PLANNING', entry.id),
      ownerSemantic: {
        sourceEntryId: entry.id,
        triggerKind: 'REAL_CONTROL_UNKNOWN_OR_PARTIAL_CLAIM_REQUIRES_ACCELERATION_REVIEW',
        accelerationTriggerCount: entry.accelerationTriggers.length
      }
    }))

  const nonPlanningAcceleration = nonPlanningRegistry
    .filter((entry) => {
      if (entry.accelerationTriggers.length === 0) return false
      const refs = new Set(mappedClaimIds(claims, 'NON_PLANNING', entry.id))
      return claims.some((claim) => refs.has(claim.id) && realClaimNeedsAccelerationReview(claim))
    })
    .map((entry): NormalizedCoverageReference => ({
      owner: 'NON_PLANNING',
      ownerEntryId: `${entry.id}::ACCELERATION_REVIEW`,
      normalizedDisposition: 'ACCELERATION_REVIEW_REQUIRED',
      positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
      claimRefs: mappedClaimIds(claims, 'NON_PLANNING', entry.id),
      ownerSemantic: {
        sourceEntryId: entry.id,
        triggerKind: 'REAL_CONTROL_UNKNOWN_OR_PARTIAL_CLAIM_REQUIRES_ACCELERATION_REVIEW',
        accelerationTriggerCount: entry.accelerationTriggers.length
      }
    }))

  return [...conformance, ...england, ...planning, ...nonPlanning, ...planningAcceleration, ...nonPlanningAcceleration]
    .map((entry) => ({ ...entry, claimRefs: canonicalStrings(entry.claimRefs) }))
    .sort((a, b) => {
      const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
      return byOwner || a.ownerEntryId.localeCompare(b.ownerEntryId)
    })
}

const pass = (clauseId: string, reason: string, evidenceRefs: readonly string[]): ArchitecturalReviewRecordInput => ({
  clauseId,
  result: 'PASS',
  reason,
  evidenceRefs
})

const lennardProjectReviews = (): readonly ArchitecturalReviewRecordInput[] => [
  pass('RH-I01', 'The Lennard candidate is the unchanged controlled Reference House under one rigid RH-V02 transform. The four-bay front field, ranked entrance, courtyard-centred hierarchy and concentrated articulation remain the controlled G-01 architectural-language proposition rather than a site-authored façade substitution.', ['docs/reference-house/g01-v0.1-conformance-d12.md', 'docs/reference-house/plan-section-elevation-gate.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json', 'project/dpl/dpl-t4-lennard-candidate-verification.md']),
  pass('RH-I03', 'The candidate remains the same compact two-storey detached family-house type with the controlled 12.0 × 10.8 m shell and central courtyard. T3/T4 change only absolute placement, orientation and screening datum; no programme or type mutation is authored.', ['docs/reference-house/structural-coordination.md', 'docs/reference-house/upper-floor-and-stair-development.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-I04', 'The principal arrival sequence remains principal entrance/stair hall → courtyard address → garden-side room/garden. The Lennard transform is rigid and unmirrored, so the internal courtyard-centred sequence and subordinate technical-flank route are unchanged; exact external approach remains RH-SI05 rather than this architectural review.', ['docs/reference-house/ground-floor-development.md', 'docs/reference-house/plan-section-elevation-gate.md', 'project/dpl/dpl-t3-lennard-authored-candidate.md']),
  pass('RH-I05', 'Ground and upper plans retain their controlled room identities and hierarchy. No Lennard deployment action dissolves the plan into an undifferentiated open field or promotes technical circulation above principal domestic order.', ['docs/reference-house/ground-floor-development.md', 'docs/reference-house/upper-floor-and-stair-development.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-I06', 'The selected plant/service suite, vertical service zone and concentrated wet/service geography remain subordinate to principal rooms. The site transform authors no internal service redistribution.', ['docs/reference-house/structural-coordination.md', 'docs/reference-house/ground-floor-development.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-I07', 'Plan, section and elevation remain one coupled architectural order. Lennard applies the complete house as a single rigid transform and introduces no façade-only substitution or internal rearrangement.', ['docs/reference-house/plan-section-elevation-gate.md', 'docs/reference-house/g01-v0.1-conformance-d12.md', 'project/dpl/dpl-t4-lennard-candidate-verification.md']),
  pass('RH-PROT-02', 'The selected ground-floor topology and its courtyard/principal/service relationships are unchanged by the Lennard site transform.', ['docs/reference-house/ground-floor-development.md', 'project/dpl/dpl-02-reference-house-conformance.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-03', 'The active four-bedroom upper-floor topology, U-circulation and stacked service relationships remain unchanged; no historical fifth-bedroom or remote en-suite route is reintroduced.', ['docs/reference-house/upper-floor-and-stair-development.md', 'docs/reference-house/structural-coordination.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-05', 'The H1 sectional hierarchy is unchanged by the rigid horizontal site transform. The 70.70 m ODN screening FFL changes absolute datum only; internal relative section remains protected.', ['docs/reference-house/plan-section-elevation-gate.md', 'docs/reference-house/structural-coordination.md', 'project/dpl/dpl-t4-lennard-candidate-verification.md']),
  pass('RH-PROT-07', 'The differentiated courtyard orders remain intact. Rotation changes compass relationship, not the internal south/north/technical/principal architectural relationships.', ['docs/reference-house/plan-section-elevation-gate.md', 'docs/reference-house/ground-floor-development.md', 'docs/reference-house/upper-floor-and-stair-development.md']),
  pass('RH-PROT-09', 'No envelope or opening-system substitution is authored at Lennard; the controlled permanent-envelope / replaceable-frame interface logic therefore remains the architectural proposition. Product and performance proof remain downstream.', ['docs/reference-house/structural-coordination.md', 'docs/reference-house/tectonic-architectural-language.md', 'project/dpl/dpl-02-reference-house-conformance.md']),
  pass('RH-PROT-10', 'The concentrated technical-flank service topology, bounded vertical service zone and short wet-service relationships are unchanged. External utility approach remains a separate site-interface matter.', ['docs/reference-house/structural-coordination.md', 'docs/reference-house/upper-floor-and-stair-development.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-11', 'The architectural environmental hierarchy is preserved: shallow occupied bands, outer-façade daylight responsibility, disciplined glazing, orientation-specific control and no mechanical-cooling rescue strategy remain selected. This PASS is architectural only; Lennard performance and mitigation remain external/site evidence.', ['docs/reference-house/environmental-coordination.md', 'docs/reference-house/structural-coordination.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-12', 'The selected whole-house system geography remains integrated with the same controlled plant/service territory; no Lennard equipment-family or distribution substitution is authored.', ['docs/reference-house/structural-coordination.md', 'docs/reference-house/energy-heat-coordination-rh10.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-13', 'The outward-draining roof/water architecture is unchanged by site placement: no courtyard gutter, internal roof outlet, inward valley or rooftop-plant substitution is introduced. Site discharge beyond building-side collection remains separate.', ['docs/reference-house/structural-coordination.md', 'project/dpl/dpl-02-reference-house-conformance.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json']),
  pass('RH-PROT-15', 'The selected tectonic / visible-interface hierarchy is unchanged. Lennard authors no finish, joinery or interface replacement; site-specific external work remains outside this protected internal architectural review.', ['docs/reference-house/tectonic-architectural-language.md', 'docs/reference-house/structural-coordination.md', 'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json'])
]

const createLennardReview = (t5: ReturnType<typeof compileDPLT5LennardRealControlCase>): DPLT6ReviewResult => {
  const conformance = t5.ledger.candidateConformance
  if (!conformance) throw new Error('DPL-T6 requires the T5 candidate-conformance evaluation.')
  const coverage = loadConformanceCoverageRegistry()
  const input = {
    schemaVersion: DPL13E_REVIEW_SCHEMA_VERSION,
    id: DPL_T6_REVIEW_ID,
    assuranceProfile: 'SCREENING' as const,
    siteId: t5.ledger.site.id,
    candidateId: conformance.candidate.id,
    candidateRevision: conformance.candidate.revision,
    candidateFingerprint: conformance.candidate.fingerprint,
    referenceHouseSourceFingerprint: conformance.candidate.referenceHouseSourceFingerprint,
    dpl02CoverageFingerprint: coverage.fingerprint,
    dpl02AuthorityFingerprint: coverage.authorityFingerprint,
    reviewer: {
      identity: 'PROJECT_AUTHOR_DELEGATED_ARCHITECTURE_AGENT',
      role: 'PROJECT_AUTHOR_DELEGATE_ARCHITECTURAL_REVIEW',
      authorityBasis: 'Project author instructed the Architecture agent to proceed through DPL packets on 2026-10-25. This is delegated project architectural authority only; it is not independent professional, statutory or planning evidence.',
      authoredAt: '2026-10-25'
    },
    reviewScopeClauseIds: architecturalReviewClauseIds(),
    reviews: lennardProjectReviews()
  }
  const ledger = createArchitecturalReviewLedger(input)

  if (ledger.siteId !== t5.ledger.site.id) throw new Error('DPL-T6 review site binding drifted.')
  if (ledger.candidateId !== conformance.candidate.id || ledger.candidateRevision !== conformance.candidate.revision) {
    throw new Error('DPL-T6 review candidate id/revision drifted.')
  }
  if (ledger.candidateFingerprint !== conformance.candidate.fingerprint) {
    throw new Error('DPL-T6 review candidate fingerprint drifted.')
  }
  if (ledger.referenceHouseSourceFingerprint !== conformance.currentReferenceHouseSourceFingerprint) {
    throw new Error('DPL-T6 review Reference House source identity drifted.')
  }
  if (ledger.dpl02CoverageFingerprint !== coverage.fingerprint || ledger.dpl02AuthorityFingerprint !== coverage.authorityFingerprint) {
    throw new Error('DPL-T6 review DPL-02 authority identity drifted.')
  }

  const reviewedClauseIds = ledger.reviews.map((review) => review.clauseId)
  const reviewed = new Set(reviewedClauseIds)
  return {
    ledger,
    reviewedClauseIds,
    pendingClauseIds: ledger.reviewScopeClauseIds.filter((id) => !reviewed.has(id))
  }
}

interface NarrowSourceFinding {
  readonly owner: 'ENGLAND' | 'PLANNING'
  readonly ownerEntryId: 'ENG-COV-SOURCE-APPLICABILITY' | 'DPL10-COV-SOURCE-COMPOSITION-STATUS'
  readonly result: 'PASS' | 'UNRESOLVED'
  readonly reason: string
  readonly sourceRefs: readonly string[]
  readonly missingFacts: readonly string[]
  readonly fingerprint: string
}

const sourceFinding = (
  value: Omit<NarrowSourceFinding, 'fingerprint'>
): NarrowSourceFinding => {
  const canonical = {
    ...value,
    sourceRefs: canonicalStrings(value.sourceRefs),
    missingFacts: canonicalStrings(value.missingFacts)
  }
  return { ...canonical, fingerprint: sha256SemanticFingerprint(canonical) }
}

const composeEnglandSourceFinding = (): NarrowSourceFinding => {
  const target = loadWaveCTargetComposition('Bromley')
    .find((entry) => entry.target.id === 'ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20')?.target
  if (!target) throw new Error('DPL-T6 requires the current England structure/ground/moisture/materials target.')
  const schedule1 = target.sourceSnapshots.find((source) => source.id === 'BR2010-SCH1-2026-07-20')
  const reg7 = target.sourceSnapshots.find((source) => source.id === 'BR2010-REG7-REVISED-2026-10-20')
  if (schedule1?.status !== 'OPERATIVE_AT_RESEARCH_DATE' || reg7?.status !== 'OPERATIVE_REVISED_VIEW_AT_RESEARCH_DATE') {
    throw new Error('DPL-T6 refuses changed England source-status authority.')
  }
  return sourceFinding({
    owner: 'ENGLAND',
    ownerEntryId: 'ENG-COV-SOURCE-APPLICABILITY',
    result: 'UNRESOLVED',
    reason: 'Current England sources are identified, but Lennard has no admitted building-control route/application and commencement events sufficient to freeze transition-safe project technical applicability. Research-date source status is not substituted for project-event applicability.',
    sourceRefs: [
      'project/dpl/dpl-09a-england-source-applicability-spine.md',
      `project/dpl/targets/england-structure-ground-moisture-materials-v1.json#${schedule1.id}`,
      `project/dpl/targets/england-structure-ground-moisture-materials-v1.json#${reg7.id}`
    ],
    missingFacts: [
      'buildingControlRouteOrNoticeApplicationKind',
      'noticeOrApplicationDateAndStatus',
      'qualifyingCommencementDate',
      'qualifyingCommencementEvidence'
    ]
  })
}

const composePlanningSourceFinding = (): NarrowSourceFinding => {
  const targets = loadWaveCTargetComposition('Bromley')
  const london = targets.find((entry) => entry.target.id === DPL_T6_LONDON_TARGET_ID)?.target
  const bromley = loadWaveCBoroughTarget('Bromley').target
  if (!london || bromley.id !== DPL_T6_BROMLEY_TARGET_ID) {
    throw new Error('DPL-T6 requires the controlled London → Bromley planning target pair.')
  }
  const londonPlan = london.sourceSnapshots.find((source) => source.id === 'LONDON-PLAN-2021-CH3')
  const capacity = london.sourceSnapshots.find((source) => source.id === 'LPG-OPTIMISING-SITE-CAPACITY-2023')
  const housing = london.sourceSnapshots.find((source) => source.id === 'LPG-HOUSING-DESIGN-STANDARDS-2023')
  const localPlan = bromley.sourceSnapshots.find((source) => source.id === 'BROM-LOCAL-PLAN-2019')
  const emerging = bromley.sourceSnapshots.find((source) => source.id === 'BROM-LOCAL-PLAN-REVIEW-2026-10-22')
  if (
    londonPlan?.publicationStatus !== 'ADOPTED_OPERATIVE' ||
    capacity?.publicationStatus !== 'ADOPTED_GUIDANCE' ||
    housing?.publicationStatus !== 'ADOPTED_GUIDANCE' ||
    localPlan?.status !== 'OPERATIVE_AT_RESEARCH_DATE' ||
    emerging?.status !== 'EMERGING_NON_OPERATIVE_AT_RESEARCH_DATE'
  ) {
    throw new Error('DPL-T6 refuses changed London/Bromley source-status authority.')
  }
  return sourceFinding({
    owner: 'PLANNING',
    ownerEntryId: 'DPL10-COV-SOURCE-COMPOSITION-STATUS',
    result: 'PASS',
    reason: 'For Lennard/Bromley, London Plan 2021 and Bromley Local Plan 2019 are the controlled operative development-plan pair; the current Bromley review remains emerging/non-operative and London Plan Guidance remains guidance. PASS is source/status composition only, not policy compliance, material weight or planning permission.',
    sourceRefs: [
      'project/dpl/dpl-10a-planning-source-status-spine.md',
      `project/dpl/targets/london-strategic-residential-design-v1.json#${londonPlan.id}`,
      `project/dpl/targets/london-strategic-residential-design-v1.json#${capacity.id}`,
      `project/dpl/targets/london-strategic-residential-design-v1.json#${housing.id}`,
      `project/dpl/targets/bromley-local-planning-v1.json#${localPlan.id}`,
      `project/dpl/targets/bromley-local-planning-v1.json#${emerging.id}`
    ],
    missingFacts: []
  })
}

const replaceSourceRecord = (
  record: ScreeningAggregationRecord,
  finding: NarrowSourceFinding
): ScreeningAggregationRecord => ({
  ...record,
  sourceKind: 'OWNER_EVIDENCE_REQUIRED',
  sourceIds: canonicalStrings([...finding.sourceRefs, `DPLT6_SOURCE:${finding.fingerprint}`]),
  sourceResult: `SOURCE_COMPOSITION_${finding.result}`,
  aggregationState: finding.result === 'PASS' ? 'POSITIVE_RESOLVED' : 'SUBSTANTIVE_UNRESOLVED',
  ...(finding.result === 'PASS' ? { blockerClass: undefined } : { blockerClass: 'SUBSTANTIVE_UNRESOLVED' as const }),
  reason: finding.reason
})

const builderReadiness = (
  normalizedCoverage: readonly NormalizedCoverageReference[]
): ScreeningCoverageReadinessResult => ({ normalizedCoverage } as unknown as ScreeningCoverageReadinessResult)

const builderCase = (ledger: DeploymentLedger): CanonicalReferenceSiteCompile =>
  ({ deploymentLedger: ledger } as unknown as CanonicalReferenceSiteCompile)

const canonicalRecords = (records: readonly ScreeningAggregationRecord[]): ScreeningAggregationRecord[] => records
  .map((record) => ({
    ...record,
    claimRefs: canonicalStrings(record.claimRefs),
    sourceIds: canonicalStrings(record.sourceIds)
  }))
  .sort((a, b) => {
    const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
    return byOwner || a.ownerEntryId.localeCompare(b.ownerEntryId)
  })

export const composeDPLT6LennardScreeningAggregation = (): DPLT6Result => {
  const t5 = compileDPLT5LennardRealControlCase()
  if (t5.resultFingerprint !== DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT) {
    throw new Error(`DPL-T6 refuses changed T5 result identity: ${t5.resultFingerprint}.`)
  }

  const normalizedCoverage = composeNormalizedCoverage(t5.manifest.claims)
  const uncoveredRealClaimIds = t5.manifest.claims
    .filter((claim) => claim.coverageFamilyRefs.length === 0)
    .map((claim) => claim.id)
    .sort((a, b) => a.localeCompare(b))
  if (uncoveredRealClaimIds.length > 0) {
    throw new Error(`DPL-T6 refuses uncovered real claims: ${uncoveredRealClaimIds.join(', ')}.`)
  }

  const baseRecords = buildScreeningAggregationRecords(
    builderCase(t5.ledger),
    builderReadiness(normalizedCoverage)
  )
  const architecturalReview = createLennardReview(t5)
  let records = applyArchitecturalReviewLedger(baseRecords, architecturalReview.ledger)

  const sourceFindings = new Map<string, NarrowSourceFinding>([
    ['ENGLAND:ENG-COV-SOURCE-APPLICABILITY', composeEnglandSourceFinding()],
    ['PLANNING:DPL10-COV-SOURCE-COMPOSITION-STATUS', composePlanningSourceFinding()]
  ])
  records = records.map((record) => {
    const finding = sourceFindings.get(`${record.owner}:${record.ownerEntryId}`)
    return finding ? replaceSourceRecord(record, finding) : record
  })
  records = canonicalRecords(records)

  const blockers: DPLT6BlockerRecord[] = records
    .filter((record) => record.aggregationState !== 'POSITIVE_RESOLVED')
    .map((record) => ({
      owner: record.owner,
      ownerEntryId: record.ownerEntryId,
      coverageDisposition: record.coverageDisposition,
      sourceKind: record.sourceKind,
      sourceResult: record.sourceResult,
      aggregationState: record.aggregationState,
      claimRefs: [...record.claimRefs],
      reason: record.reason
    }))

  const futureDue = normalizedCoverage
    .filter((entry) => entry.normalizedDisposition === 'FUTURE_DUE')
    .map((entry) => ({
      owner: entry.owner,
      ownerEntryId: entry.ownerEntryId,
      claimRefs: [...entry.claimRefs]
    }))
    .sort((a, b) => {
      const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
      return byOwner || a.ownerEntryId.localeCompare(b.ownerEntryId)
    })

  const blockerCountsByOwner: Record<CoverageOwner, number> = {
    REFERENCE_HOUSE: 0,
    ENGLAND: 0,
    PLANNING: 0,
    NON_PLANNING: 0
  }
  const blockerCountsByState: Record<string, number> = {}
  for (const blocker of blockers) {
    blockerCountsByOwner[blocker.owner] += 1
    blockerCountsByState[blocker.aggregationState] = (blockerCountsByState[blocker.aggregationState] ?? 0) + 1
  }

  const blockingCoverageCount = normalizedCoverage.filter((entry) =>
    entry.positiveCompatibilityBlockingWhenDue &&
    ['DUE_NOW_REPRESENTED', 'DUE_NOW_MISSING', 'DUE_CLASSIFICATION_UNRESOLVED', 'ACCELERATION_REVIEW_REQUIRED']
      .includes(entry.normalizedDisposition)
  ).length
  const readinessManifest = {
    normalizedCoverage,
    blockingCoverageCount,
    futureDueCount: futureDue.length,
    accelerationReviewCount: normalizedCoverage.filter((entry) => entry.normalizedDisposition === 'ACCELERATION_REVIEW_REQUIRED').length,
    uncoveredRealClaimIds,
    localPlanningTargetId: DPL_T6_BROMLEY_TARGET_ID
  }
  const readiness = {
    normalizedCoverageCount: normalizedCoverage.length,
    blockingCoverageCount,
    futureDueCount: futureDue.length,
    accelerationReviewCount: readinessManifest.accelerationReviewCount,
    uncoveredRealClaimIds,
    localPlanningTargetId: DPL_T6_BROMLEY_TARGET_ID,
    identityFingerprint: sha256SemanticFingerprint(readinessManifest)
  }
  const proofBoundary = {
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalReviewNative: 'NO_HUMAN_AUTHORED' as const,
    siteEvidenceCommissioned: 'NO' as const,
    dpl16: 'HELD' as const
  }
  const resultPayload = {
    schemaVersion: DPL_T6_SCHEMA_VERSION,
    t5ResultFingerprint: DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT,
    controlId: t5.manifest.controlId,
    candidateId: t5.manifest.candidate.id,
    readiness,
    architecturalReviewLedgerFingerprint: architecturalReview.ledger.ledgerFingerprint,
    architecturalReviewReviewedClauseIds: architecturalReview.reviewedClauseIds,
    aggregationRecords: records,
    blockers,
    futureDue,
    blockerCountsByOwner,
    blockerCountsByState,
    result: 'UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED' as const,
    proofBoundary
  }

  return {
    schemaVersion: DPL_T6_SCHEMA_VERSION,
    t5ResultFingerprint: DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT,
    controlId: 'DPL-T-CONTROL-004',
    candidateId: 'DPL-T-CANDIDATE-004-01',
    readiness,
    architecturalReview,
    aggregationRecords: records,
    blockers,
    futureDue,
    blockerCountsByOwner,
    blockerCountsByState,
    result: 'UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED',
    proofBoundary,
    resultFingerprint: sha256SemanticFingerprint(resultPayload)
  }
}
