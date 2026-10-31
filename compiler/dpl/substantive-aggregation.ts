import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import {
  compileCanonicalReferenceSiteCase,
  type CanonicalReferenceSiteCompile
} from './canonical.js'
import {
  composeScreeningCoverageReadiness,
  type CoverageOwner,
  type NormalizedCoverageDisposition,
  type NormalizedCoverageReference,
  type ScreeningCoverageReadinessResult,
  type SiteInterfaceClaimAuthority
} from './coverage-readiness.js'
import type {
  CandidateConformanceFinding,
  DeploymentObligationLedgerEntry,
  ObligationResult
} from './model.js'

export const DPL13C_SCHEMA_VERSION = 'DPL-13C-SUBSTANTIVE-AGGREGATION-1' as const

export type AggregationBlockerClass =
  | 'SUBSTANTIVE_UNRESOLVED'
  | 'DUE_CLASSIFICATION_UNRESOLVED'

export type AggregationState =
  | 'POSITIVE_RESOLVED'
  | 'SUBSTANTIVE_UNRESOLVED'
  | 'SUBSTANTIVE_UNSUPPORTED'
  | 'SUBSTANTIVE_FAILURE'
  | 'DUE_CLASSIFICATION_UNRESOLVED'

export type AggregationSourceKind =
  | 'CANDIDATE_CONFORMANCE'
  | 'DEPLOYMENT_OBLIGATION'
  | 'OWNER_EVIDENCE_REQUIRED'
  | 'OWNER_COVERAGE_GAP'
  | 'OWNER_CLASSIFICATION'

export type WholeSiteNonConclusionReason =
  | 'PROFILE_UNIVERSE_INCOMPLETE'
  | 'BLOCKING_SCOPE_INCOMPLETE'
  | 'POSITIVE_CONCLUSION_NOT_ADMITTED'

export interface ScreeningAggregationRecord {
  readonly owner: CoverageOwner
  readonly ownerEntryId: string
  readonly coverageDisposition: NormalizedCoverageDisposition
  readonly claimRefs: readonly string[]
  readonly sourceKind: AggregationSourceKind
  readonly sourceIds: readonly string[]
  readonly sourceResult: string
  readonly aggregationState: AggregationState
  readonly blockerClass?: AggregationBlockerClass
  readonly reason: string
}

export interface IdentityBearingAggregationRecord extends ScreeningAggregationRecord {
  readonly recordFingerprint: string
}

export interface FutureDueCoverageRecord {
  readonly owner: CoverageOwner
  readonly ownerEntryId: string
  readonly claimRefs: readonly string[]
}

export type WholeSiteScreeningConclusion =
  | {
      readonly status: 'EMITTED'
      readonly result: 'UNRESOLVED'
      readonly assuranceProfile: 'SCREENING'
      readonly display: 'UNRESOLVED @ SCREENING'
    }
  | {
      readonly status: 'NOT_ADMITTED'
      readonly reason: WholeSiteNonConclusionReason
    }

export interface ScreeningSubstantiveAggregationResult {
  readonly schemaVersion: typeof DPL13C_SCHEMA_VERSION
  readonly assuranceProfile: 'SCREENING'
  readonly canonicalCase: {
    readonly canonicalCaseFingerprint: string
    readonly deploymentCaseFingerprint: string
    readonly deploymentResultFingerprint: string
    readonly siteManifestFingerprint: string
    readonly candidateFingerprint: string
    readonly localBoroughTarget: string
  }
  readonly coverageReadiness: {
    readonly identityFingerprint: string
    readonly resultFingerprint: string
    readonly profileUniverseState: ScreeningCoverageReadinessResult['profileUniverseState']
    readonly conclusionReadiness: ScreeningCoverageReadinessResult['conclusionReadiness']
    readonly uncoveredClaimIds: readonly string[]
  }
  readonly aggregationRecords: readonly IdentityBearingAggregationRecord[]
  readonly futureDue: readonly FutureDueCoverageRecord[]
  readonly siteInterfaceClaimAuthorities: readonly SiteInterfaceClaimAuthority[]
  readonly blockerCounts: {
    readonly substantiveUnresolved: number
    readonly dueClassificationUnresolved: number
    readonly substantiveFailure: number
  }
  readonly wholeSiteConclusion: WholeSiteScreeningConclusion
  readonly identityFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly architecturalCandidateSelection: 'NOT_IMPLEMENTED'
    readonly localBoroughTarget: string
  }
}

export interface ScreeningSubstantiveAggregationOverrides {
  readonly canonicalCase?: CanonicalReferenceSiteCompile
  readonly readiness?: ScreeningCoverageReadinessResult
  readonly records?: readonly ScreeningAggregationRecord[]
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const ownerOrder: Readonly<Record<CoverageOwner, number>> = {
  REFERENCE_HOUSE: 0,
  ENGLAND: 1,
  PLANNING: 2,
  NON_PLANNING: 3
}

const blockingDispositions = new Set<NormalizedCoverageDisposition>([
  'DUE_NOW_REPRESENTED',
  'DUE_NOW_MISSING',
  'DUE_CLASSIFICATION_UNRESOLVED',
  'ACCELERATION_REVIEW_REQUIRED'
])

const exactObligationMappings: Readonly<Record<string, readonly string[]>> = {
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY': ['LON-D3-DESIGN-LED']
}

const coverageKey = (entry: Pick<NormalizedCoverageReference, 'owner' | 'ownerEntryId'>): string =>
  `${entry.owner}:${entry.ownerEntryId}`

const recordKey = (entry: Pick<ScreeningAggregationRecord, 'owner' | 'ownerEntryId'>): string =>
  `${entry.owner}:${entry.ownerEntryId}`

const requiredBlockingCoverage = (
  readiness: ScreeningCoverageReadinessResult
): NormalizedCoverageReference[] => readiness.normalizedCoverage
  .filter((entry) => entry.positiveCompatibilityBlockingWhenDue && blockingDispositions.has(entry.normalizedDisposition))
  .sort((a, b) => {
    const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
    return byOwner || compareDplIdentityStrings(a.ownerEntryId, b.ownerEntryId)
  })

const futureDueCoverage = (
  readiness: ScreeningCoverageReadinessResult
): FutureDueCoverageRecord[] => readiness.normalizedCoverage
  .filter((entry) => entry.normalizedDisposition === 'FUTURE_DUE')
  .map((entry) => ({
    owner: entry.owner,
    ownerEntryId: entry.ownerEntryId,
    claimRefs: canonicalStrings(entry.claimRefs)
  }))
  .sort((a, b) => {
    const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
    return byOwner || compareDplIdentityStrings(a.ownerEntryId, b.ownerEntryId)
  })

const candidateState = (
  finding: CandidateConformanceFinding
): Pick<ScreeningAggregationRecord, 'sourceResult' | 'aggregationState' | 'blockerClass'> => {
  switch (finding.result) {
    case 'CONFORMS':
      return { sourceResult: finding.result, aggregationState: 'POSITIVE_RESOLVED' }
    case 'OPEN':
      return {
        sourceResult: finding.result,
        aggregationState: 'SUBSTANTIVE_UNRESOLVED',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED'
      }
    case 'NON_CONFORMING':
    case 'REQUIRES_REFERENCE_HOUSE_REVISION':
      return {
        sourceResult: finding.result,
        aggregationState: 'SUBSTANTIVE_FAILURE',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED'
      }
  }
}

const obligationState = (
  result: ObligationResult
): Pick<ScreeningAggregationRecord, 'sourceResult' | 'aggregationState' | 'blockerClass'> => {
  switch (result) {
    case 'PASS':
    case 'EXTERNALLY_DISCHARGED':
    case 'NOT_APPLICABLE':
      return { sourceResult: result, aggregationState: 'POSITIVE_RESOLVED' }
    case 'UNSUPPORTED':
      return {
        sourceResult: result,
        aggregationState: 'SUBSTANTIVE_UNSUPPORTED',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED'
      }
    case 'FAIL':
      return {
        sourceResult: result,
        aggregationState: 'SUBSTANTIVE_FAILURE',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED'
      }
    case 'UNRESOLVED':
    case 'WARNING':
    case 'SUPERSEDED':
      return {
        sourceResult: result,
        aggregationState: 'SUBSTANTIVE_UNRESOLVED',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED'
      }
  }
}

const classificationRecord = (
  coverage: NormalizedCoverageReference
): ScreeningAggregationRecord => ({
  owner: coverage.owner,
  ownerEntryId: coverage.ownerEntryId,
  coverageDisposition: coverage.normalizedDisposition,
  claimRefs: canonicalStrings(coverage.claimRefs),
  sourceKind: 'OWNER_CLASSIFICATION',
  sourceIds: [coverage.ownerEntryId],
  sourceResult: 'DUE_CLASSIFICATION_UNRESOLVED',
  aggregationState: 'DUE_CLASSIFICATION_UNRESOLVED',
  blockerClass: 'DUE_CLASSIFICATION_UNRESOLVED',
  reason: coverage.normalizedDisposition === 'ACCELERATION_REVIEW_REQUIRED'
    ? 'Owner acceleration question is represented but opaque trigger metadata is not executed; due classification remains unresolved.'
    : 'Owner coverage authority leaves applicability or timing unresolved at SCREENING.'
})

const missingCoverageRecord = (
  coverage: NormalizedCoverageReference
): ScreeningAggregationRecord => ({
  owner: coverage.owner,
  ownerEntryId: coverage.ownerEntryId,
  coverageDisposition: coverage.normalizedDisposition,
  claimRefs: canonicalStrings(coverage.claimRefs),
  sourceKind: 'OWNER_COVERAGE_GAP',
  sourceIds: [coverage.ownerEntryId],
  sourceResult: 'DUE_NOW_MISSING',
  aggregationState: 'SUBSTANTIVE_UNSUPPORTED',
  blockerClass: 'SUBSTANTIVE_UNRESOLVED',
  reason: 'Owner authority marks this SCREENING blocker as due now but missing; DPL-13C preserves the gap rather than omitting or passing it.'
})

const candidateRecord = (
  coverage: NormalizedCoverageReference,
  finding: CandidateConformanceFinding | undefined
): ScreeningAggregationRecord => {
  if (!finding) {
    return {
      owner: coverage.owner,
      ownerEntryId: coverage.ownerEntryId,
      coverageDisposition: coverage.normalizedDisposition,
      claimRefs: canonicalStrings(coverage.claimRefs),
      sourceKind: 'CANDIDATE_CONFORMANCE',
      sourceIds: [coverage.ownerEntryId],
      sourceResult: 'FINDING_NOT_PRESENT',
      aggregationState: 'SUBSTANTIVE_UNSUPPORTED',
      blockerClass: 'SUBSTANTIVE_UNRESOLVED',
      reason: 'DPL-02C requires this clause at SCREENING but the current DPL-12B candidate evaluation has no corresponding finding.'
    }
  }

  return {
    owner: coverage.owner,
    ownerEntryId: coverage.ownerEntryId,
    coverageDisposition: coverage.normalizedDisposition,
    claimRefs: canonicalStrings(coverage.claimRefs),
    sourceKind: 'CANDIDATE_CONFORMANCE',
    sourceIds: [finding.clauseId],
    ...candidateState(finding),
    reason: finding.reason
  }
}

const obligationRecord = (
  coverage: NormalizedCoverageReference,
  obligations: readonly DeploymentObligationLedgerEntry[]
): ScreeningAggregationRecord => {
  const mappingIds = exactObligationMappings[coverageKey(coverage)] ?? []
  const mapped = mappingIds
    .map((id) => obligations.find((obligation) => obligation.obligationId === id))
    .filter((entry): entry is DeploymentObligationLedgerEntry => entry !== undefined)

  if (mappingIds.length === 0) {
    return {
      owner: coverage.owner,
      ownerEntryId: coverage.ownerEntryId,
      coverageDisposition: coverage.normalizedDisposition,
      claimRefs: canonicalStrings(coverage.claimRefs),
      sourceKind: 'OWNER_EVIDENCE_REQUIRED',
      sourceIds: [coverage.ownerEntryId],
      sourceResult: 'NO_CASE_SPECIFIC_SUBSTANTIVE_FINDING',
      aggregationState: 'SUBSTANTIVE_UNRESOLVED',
      blockerClass: 'SUBSTANTIVE_UNRESOLVED',
      reason: 'This due-now owner family is inside the controlled SCREENING universe but has no admitted case-specific substantive evaluator or accepted discharge. It remains explicit and unresolved.'
    }
  }

  if (mapped.length !== mappingIds.length) {
    const missing = mappingIds.filter((id) => !mapped.some((entry) => entry.obligationId === id))
    return {
      owner: coverage.owner,
      ownerEntryId: coverage.ownerEntryId,
      coverageDisposition: coverage.normalizedDisposition,
      claimRefs: canonicalStrings(coverage.claimRefs),
      sourceKind: 'DEPLOYMENT_OBLIGATION',
      sourceIds: canonicalStrings(mappingIds),
      sourceResult: 'MAPPED_OBLIGATION_NOT_PRESENT',
      aggregationState: 'SUBSTANTIVE_UNSUPPORTED',
      blockerClass: 'SUBSTANTIVE_UNRESOLVED',
      reason: `Exact DPL-13C mapping requires obligation(s) not present in the current deployment ledger: ${missing.join(', ')}.`
    }
  }

  const states = mapped.map((entry) => obligationState(entry.result))
  const state = states.some((entry) => entry.aggregationState === 'SUBSTANTIVE_FAILURE')
    ? 'SUBSTANTIVE_FAILURE'
    : states.some((entry) => entry.aggregationState === 'SUBSTANTIVE_UNSUPPORTED')
      ? 'SUBSTANTIVE_UNSUPPORTED'
      : states.some((entry) => entry.aggregationState === 'SUBSTANTIVE_UNRESOLVED')
        ? 'SUBSTANTIVE_UNRESOLVED'
        : 'POSITIVE_RESOLVED'
  const blockerClass = state === 'POSITIVE_RESOLVED' ? undefined : 'SUBSTANTIVE_UNRESOLVED' as const

  return {
    owner: coverage.owner,
    ownerEntryId: coverage.ownerEntryId,
    coverageDisposition: coverage.normalizedDisposition,
    claimRefs: canonicalStrings(coverage.claimRefs),
    sourceKind: 'DEPLOYMENT_OBLIGATION',
    sourceIds: mapped
      .map((entry) => `${entry.targetId}:${entry.obligationId}`)
      .sort((a, b) => compareDplIdentityStrings(a, b)),
    sourceResult: mapped
      .map((entry) => `${entry.obligationId}=${entry.result}`)
      .sort((a, b) => compareDplIdentityStrings(a, b))
      .join(';'),
    aggregationState: state,
    ...(blockerClass ? { blockerClass } : {}),
    reason: mapped
      .map((entry) => `${entry.obligationId}: ${entry.resultReason}`)
      .sort((a, b) => compareDplIdentityStrings(a, b))
      .join(' | ')
  }
}

export const buildScreeningAggregationRecords = (
  canonicalCase: CanonicalReferenceSiteCompile,
  readiness: ScreeningCoverageReadinessResult
): ScreeningAggregationRecord[] => {
  const findings = canonicalCase.deploymentLedger.candidateConformance?.findings ?? []
  const obligations = canonicalCase.deploymentLedger.obligations

  return requiredBlockingCoverage(readiness)
    .map((coverage) => {
      if (
        coverage.normalizedDisposition === 'DUE_CLASSIFICATION_UNRESOLVED' ||
        coverage.normalizedDisposition === 'ACCELERATION_REVIEW_REQUIRED'
      ) {
        return classificationRecord(coverage)
      }
      if (coverage.normalizedDisposition === 'DUE_NOW_MISSING') return missingCoverageRecord(coverage)
      if (coverage.owner === 'REFERENCE_HOUSE') {
        return candidateRecord(
          coverage,
          findings.find((finding) => finding.clauseId === coverage.ownerEntryId)
        )
      }
      return obligationRecord(coverage, obligations)
    })
    .sort((a, b) => {
      const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
      return byOwner || compareDplIdentityStrings(a.ownerEntryId, b.ownerEntryId)
    })
}

const canonicalRecords = (
  records: readonly ScreeningAggregationRecord[]
): IdentityBearingAggregationRecord[] => records
  .map((record) => {
    const canonical = {
      ...record,
      claimRefs: canonicalStrings(record.claimRefs),
      sourceIds: canonicalStrings(record.sourceIds)
    }
    return {
      ...canonical,
      recordFingerprint: sha256DplSemanticFingerprint(canonical)
    }
  })
  .sort((a, b) => {
    const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
    return byOwner || compareDplIdentityStrings(a.ownerEntryId, b.ownerEntryId) || compareDplIdentityStrings(a.recordFingerprint, b.recordFingerprint)
  })

const blockingScopeComplete = (
  readiness: ScreeningCoverageReadinessResult,
  records: readonly IdentityBearingAggregationRecord[]
): boolean => {
  const required = requiredBlockingCoverage(readiness).map(coverageKey)
  const actual = records.map(recordKey)
  return required.length === actual.length &&
    new Set(required).size === required.length &&
    new Set(actual).size === actual.length &&
    required.every((key) => actual.includes(key))
}

const conclusionFor = (
  readiness: ScreeningCoverageReadinessResult,
  records: readonly IdentityBearingAggregationRecord[]
): WholeSiteScreeningConclusion => {
  if (
    readiness.uncoveredClaimIds.length > 0 ||
    readiness.profileUniverseState === 'PROFILE_UNIVERSE_INCOMPLETE'
  ) {
    return { status: 'NOT_ADMITTED', reason: 'PROFILE_UNIVERSE_INCOMPLETE' }
  }

  if (!blockingScopeComplete(readiness, records)) {
    return { status: 'NOT_ADMITTED', reason: 'BLOCKING_SCOPE_INCOMPLETE' }
  }

  const blockers = records.filter((record) => record.aggregationState !== 'POSITIVE_RESOLVED')
  if (blockers.length === 0) {
    return { status: 'NOT_ADMITTED', reason: 'POSITIVE_CONCLUSION_NOT_ADMITTED' }
  }

  return {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  }
}

type GeneralizedReadinessSite = ScreeningCoverageReadinessResult['site'] & {
  readonly localPlanningTargetState: string
  readonly localPlanningTargetIds?: readonly string[]
}

const assertCompositionIdentity = (
  canonicalCase: CanonicalReferenceSiteCompile,
  readiness: ScreeningCoverageReadinessResult
): void => {
  if (readiness.assuranceProfile !== 'SCREENING') {
    throw new Error(`DPL-13C requires SCREENING readiness; got ${readiness.assuranceProfile}.`)
  }
  if (canonicalCase.canonicalCaseIdentity.manifest.assuranceProfile !== 'SCREENING') {
    throw new Error('DPL-13C requires a SCREENING canonical deployment case.')
  }
  if (canonicalCase.site.fingerprint !== readiness.site.manifestFingerprint) {
    throw new Error('DPL-13C refuses to aggregate readiness against a different site-manifest identity.')
  }
  if (canonicalCase.site.manifest.siteId !== readiness.site.siteId) {
    throw new Error('DPL-13C refuses to aggregate readiness against a different site id.')
  }

  const readinessSite = readiness.site as GeneralizedReadinessSite
  const localBoroughTarget = canonicalCase.canonicalCaseIdentity.manifest.localBoroughTarget as string
  if (readinessSite.localPlanningTargetState === 'NO_REAL_BOROUGH_ASSIGNED') {
    if (localBoroughTarget !== 'NOT_ASSIGNED_SYNTHETIC_REFERENCE') {
      throw new Error('DPL-13C refuses a local borough target when readiness declares NO_REAL_BOROUGH_ASSIGNED.')
    }
    return
  }

  if (readinessSite.localPlanningTargetState !== 'CONTROLLED_BOROUGH_ASSIGNED') {
    throw new Error(`DPL-13C does not recognise local planning target state ${readinessSite.localPlanningTargetState}.`)
  }
  const targetIds = readinessSite.localPlanningTargetIds ?? []
  if (targetIds.length !== 1 || targetIds[0] !== localBoroughTarget) {
    throw new Error('DPL-13C requires the canonical case local target to match the single controlled readiness local target exactly.')
  }
  if (!readiness.planningAuthorityGraph.localEdges.some((edge) => edge.localTargetId === localBoroughTarget)) {
    throw new Error(`DPL-13C local target ${localBoroughTarget} is outside the controlled planning authority graph.`)
  }
}

export const composeScreeningSubstantiveAggregation = (
  overrides: ScreeningSubstantiveAggregationOverrides = {}
): ScreeningSubstantiveAggregationResult => {
  const canonicalCase = overrides.canonicalCase ?? compileCanonicalReferenceSiteCase()
  const readiness = overrides.readiness ?? composeScreeningCoverageReadiness()
  assertCompositionIdentity(canonicalCase, readiness)

  const records = canonicalRecords(
    overrides.records ?? buildScreeningAggregationRecords(canonicalCase, readiness)
  )
  const futureDue = futureDueCoverage(readiness)
  const siteInterfaceClaimAuthorities = [...readiness.siteInterfaceClaimAuthorities]
    .map((authority) => ({ ...authority }))
    .sort((a, b) => compareDplIdentityStrings(a.claimId, b.claimId) || compareDplIdentityStrings(a.authorityId, b.authorityId))
  const wholeSiteConclusion = conclusionFor(readiness, records)

  const substantiveUnresolved = records.filter((record) =>
    record.aggregationState === 'SUBSTANTIVE_UNRESOLVED' ||
    record.aggregationState === 'SUBSTANTIVE_UNSUPPORTED'
  ).length
  const dueClassificationUnresolved = records.filter((record) =>
    record.aggregationState === 'DUE_CLASSIFICATION_UNRESOLVED'
  ).length
  const substantiveFailure = records.filter((record) =>
    record.aggregationState === 'SUBSTANTIVE_FAILURE'
  ).length

  const localBoroughTarget = canonicalCase.canonicalCaseIdentity.manifest.localBoroughTarget as string
  const canonicalCaseIdentity = {
    canonicalCaseFingerprint: canonicalCase.canonicalCaseIdentity.fingerprint,
    deploymentCaseFingerprint: canonicalCase.deploymentLedger.caseIdentity.fingerprint,
    deploymentResultFingerprint: canonicalCase.deploymentLedger.resultFingerprint,
    siteManifestFingerprint: canonicalCase.site.fingerprint,
    candidateFingerprint: canonicalCase.authoredCandidate.fingerprint,
    localBoroughTarget
  }
  const coverageReadiness = {
    identityFingerprint: readiness.identityFingerprint,
    resultFingerprint: readiness.resultFingerprint,
    profileUniverseState: readiness.profileUniverseState,
    conclusionReadiness: readiness.conclusionReadiness,
    uncoveredClaimIds: [...readiness.uncoveredClaimIds].sort((a, b) => compareDplIdentityStrings(a, b))
  }
  const proofBoundary = {
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const,
    localBoroughTarget
  }
  const identityManifest = {
    schemaVersion: DPL13C_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING' as const,
    canonicalCase: canonicalCaseIdentity,
    coverageReadiness,
    aggregationRecords: records,
    futureDue,
    siteInterfaceClaimAuthorities,
    proofBoundary
  }
  const identityFingerprint = sha256DplSemanticFingerprint(identityManifest)

  return {
    schemaVersion: DPL13C_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING',
    canonicalCase: canonicalCaseIdentity,
    coverageReadiness,
    aggregationRecords: records,
    futureDue,
    siteInterfaceClaimAuthorities,
    blockerCounts: {
      substantiveUnresolved,
      dueClassificationUnresolved,
      substantiveFailure
    },
    wholeSiteConclusion,
    identityFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({
      identityFingerprint,
      blockerCounts: { substantiveUnresolved, dueClassificationUnresolved, substantiveFailure },
      wholeSiteConclusion
    }),
    proofBoundary
  }
}