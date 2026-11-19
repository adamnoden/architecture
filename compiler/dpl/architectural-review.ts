import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { loadConformanceCoverageRegistry } from './conformance-coverage.js'
import { composeDPL13DSecondFixture, type DPL13DSecondFixtureResult } from './dpl13d.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'
import {
  buildScreeningAggregationRecords,
  composeScreeningSubstantiveAggregation,
  type ScreeningAggregationRecord,
  type ScreeningSubstantiveAggregationResult
} from './substantive-aggregation.js'

export const DPL13E_REVIEW_SCHEMA_VERSION = 'DPL-13E-ARCHITECTURAL-REVIEW-1' as const

export const architecturalReviewResults = ['PASS', 'UNRESOLVED', 'FAIL'] as const
export type ArchitecturalReviewResult = (typeof architecturalReviewResults)[number]

export interface ArchitecturalReviewRecordInput {
  readonly clauseId: string
  readonly result: ArchitecturalReviewResult
  readonly reason: string
  readonly evidenceRefs: readonly string[]
}

export interface ArchitecturalReviewLedgerInput {
  readonly schemaVersion: typeof DPL13E_REVIEW_SCHEMA_VERSION
  readonly id: string
  readonly assuranceProfile: 'SCREENING'
  readonly siteId: string
  readonly candidateId: string
  readonly candidateRevision: string
  readonly candidateFingerprint: string
  readonly referenceHouseSourceFingerprint: string
  readonly dpl02CoverageFingerprint: string
  readonly dpl02AuthorityFingerprint: string
  readonly reviewer: {
    readonly identity: string
    readonly role: string
    readonly authorityBasis: string
    readonly authoredAt: string
  }
  readonly reviewScopeClauseIds: readonly string[]
  readonly reviews: readonly ArchitecturalReviewRecordInput[]
}

export interface ArchitecturalReviewRecord extends ArchitecturalReviewRecordInput {
  readonly evidenceRefs: readonly string[]
  readonly recordFingerprint: string
}

export interface ArchitecturalReviewLedger {
  readonly schemaVersion: typeof DPL13E_REVIEW_SCHEMA_VERSION
  readonly id: string
  readonly assuranceProfile: 'SCREENING'
  readonly siteId: string
  readonly candidateId: string
  readonly candidateRevision: string
  readonly candidateFingerprint: string
  readonly referenceHouseSourceFingerprint: string
  readonly dpl02CoverageFingerprint: string
  readonly dpl02AuthorityFingerprint: string
  readonly reviewer: ArchitecturalReviewLedgerInput['reviewer']
  readonly reviewScopeClauseIds: readonly string[]
  readonly reviews: readonly ArchitecturalReviewRecord[]
  readonly ledgerFingerprint: string
}

export interface DPL13EArchitecturalReviewResult {
  readonly schemaVersion: typeof DPL13E_REVIEW_SCHEMA_VERSION
  readonly ledger: ArchitecturalReviewLedger
  readonly reviewedClauseIds: readonly string[]
  readonly pendingClauseIds: readonly string[]
  readonly aggregation: ScreeningSubstantiveAggregationResult
  readonly identityFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly humanAuthoredReview: true
    readonly nativeArchitecturalJudgement: 'NOT_IMPLEMENTED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly architecturalCandidateSelection: 'NOT_IMPLEMENTED'
  }
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const requireNonEmpty = (value: string, label: string): string => {
  if (value.trim().length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

export const architecturalReviewClauseIds = (): string[] => {
  const { registry } = loadConformanceCoverageRegistry()
  return registry.entries
    .filter((entry) =>
      entry.resolutionMode === 'ARCHITECTURAL_REVIEW' &&
      entry.executableStatus === 'NOT_NATIVE' &&
      entry.unresolvedBlocksPositiveConformance
    )
    .map((entry) => entry.id)
    .sort((a, b) => compareDplIdentityStrings(a, b))
}

const sameStringSet = (left: readonly string[], right: readonly string[]): boolean => {
  const canonicalLeft = canonicalStrings(left)
  const canonicalRight = canonicalStrings(right)
  return canonicalLeft.length === canonicalRight.length &&
    canonicalLeft.every((value, index) => value === canonicalRight[index])
}

const canonicalReview = (review: ArchitecturalReviewRecordInput): ArchitecturalReviewRecord => {
  requireNonEmpty(review.clauseId, 'Architectural review clause id')
  requireNonEmpty(review.reason, `Architectural review ${review.clauseId} reason`)
  if (!architecturalReviewResults.includes(review.result)) {
    throw new Error(`Architectural review ${review.clauseId} has unsupported result ${String(review.result)}.`)
  }
  if (review.evidenceRefs.length === 0) {
    throw new Error(`Architectural review ${review.clauseId} must cite at least one evidence/source reference.`)
  }
  for (const [index, ref] of review.evidenceRefs.entries()) {
    requireNonEmpty(ref, `Architectural review ${review.clauseId} evidenceRefs[${index}]`)
  }
  const canonical = {
    clauseId: review.clauseId,
    result: review.result,
    reason: review.reason,
    evidenceRefs: canonicalStrings(review.evidenceRefs)
  }
  return {
    ...canonical,
    recordFingerprint: sha256DplSemanticFingerprint(canonical)
  }
}

export const createArchitecturalReviewLedger = (
  input: ArchitecturalReviewLedgerInput
): ArchitecturalReviewLedger => {
  if (input.schemaVersion !== DPL13E_REVIEW_SCHEMA_VERSION) {
    throw new Error(`DPL-13E review ledger must use ${DPL13E_REVIEW_SCHEMA_VERSION}.`)
  }
  if (input.assuranceProfile !== 'SCREENING') {
    throw new Error('DPL-13E review ledger must use SCREENING assurance profile.')
  }
  requireNonEmpty(input.id, 'DPL-13E review ledger id')
  requireNonEmpty(input.siteId, 'DPL-13E review ledger site id')
  requireNonEmpty(input.candidateId, 'DPL-13E review ledger candidate id')
  requireNonEmpty(input.candidateRevision, 'DPL-13E review ledger candidate revision')
  requireNonEmpty(input.candidateFingerprint, 'DPL-13E review ledger candidate fingerprint')
  requireNonEmpty(input.referenceHouseSourceFingerprint, 'DPL-13E Reference House source fingerprint')
  requireNonEmpty(input.dpl02CoverageFingerprint, 'DPL-13E DPL-02 coverage fingerprint')
  requireNonEmpty(input.dpl02AuthorityFingerprint, 'DPL-13E DPL-02 authority fingerprint')
  requireNonEmpty(input.reviewer.identity, 'DPL-13E reviewer identity')
  requireNonEmpty(input.reviewer.role, 'DPL-13E reviewer role')
  requireNonEmpty(input.reviewer.authorityBasis, 'DPL-13E reviewer authorityBasis')
  requireNonEmpty(input.reviewer.authoredAt, 'DPL-13E reviewer authoredAt')

  const expectedScope = architecturalReviewClauseIds()
  if (!sameStringSet(input.reviewScopeClauseIds, expectedScope)) {
    throw new Error('DPL-13E review scope must equal the complete current DPL-02 ARCHITECTURAL_REVIEW blocker set exactly.')
  }

  const seen = new Set<string>()
  const reviews = input.reviews.map((review) => {
    if (!expectedScope.includes(review.clauseId)) {
      throw new Error(`DPL-13E review clause ${review.clauseId} is outside architectural-review authority.`)
    }
    if (seen.has(review.clauseId)) {
      throw new Error(`DPL-13E review ledger contains duplicate clause ${review.clauseId}.`)
    }
    seen.add(review.clauseId)
    return canonicalReview(review)
  }).sort((a, b) => compareDplIdentityStrings(a.clauseId, b.clauseId))

  const canonical = {
    schemaVersion: input.schemaVersion,
    id: input.id,
    assuranceProfile: input.assuranceProfile,
    siteId: input.siteId,
    candidateId: input.candidateId,
    candidateRevision: input.candidateRevision,
    candidateFingerprint: input.candidateFingerprint,
    referenceHouseSourceFingerprint: input.referenceHouseSourceFingerprint,
    dpl02CoverageFingerprint: input.dpl02CoverageFingerprint,
    dpl02AuthorityFingerprint: input.dpl02AuthorityFingerprint,
    reviewer: { ...input.reviewer },
    reviewScopeClauseIds: [...expectedScope],
    reviews
  }

  return {
    ...canonical,
    ledgerFingerprint: sha256DplSemanticFingerprint(canonical)
  }
}

const assertLedgerBinding = (
  ledger: ArchitecturalReviewLedger,
  fixture: DPL13DSecondFixtureResult
): void => {
  const { fingerprint: coverageFingerprint, authorityFingerprint } = loadConformanceCoverageRegistry()
  const candidate = fixture.canonicalCase.authoredCandidate

  if (ledger.siteId !== fixture.site.siteId) {
    throw new Error('DPL-13E refuses an architectural review for a different site identity.')
  }
  if (ledger.candidateId !== candidate.input.id || ledger.candidateRevision !== candidate.input.revision) {
    throw new Error('DPL-13E refuses an architectural review for a different candidate id/revision.')
  }
  if (ledger.candidateFingerprint !== candidate.fingerprint) {
    throw new Error('DPL-13E refuses an architectural review for a different candidate fingerprint.')
  }
  if (ledger.referenceHouseSourceFingerprint !== candidate.input.referenceHouseSourceFingerprint) {
    throw new Error('DPL-13E refuses an architectural review against a different Reference House source identity.')
  }
  if (ledger.dpl02CoverageFingerprint !== coverageFingerprint) {
    throw new Error('DPL-13E refuses a stale or different DPL-02 conformance-coverage identity.')
  }
  if (ledger.dpl02AuthorityFingerprint !== authorityFingerprint) {
    throw new Error('DPL-13E refuses a stale or different DPL-02 authority-source identity.')
  }
}

const applyReviewRecord = (
  record: ScreeningAggregationRecord,
  review: ArchitecturalReviewRecord,
  ledger: ArchitecturalReviewLedger
): ScreeningAggregationRecord => {
  const sourceIds = canonicalStrings([
    ...record.sourceIds,
    `DPL13E_LEDGER:${ledger.id}:${ledger.ledgerFingerprint}`,
    `DPL13E_REVIEW:${review.clauseId}:${review.recordFingerprint}`
  ])

  switch (review.result) {
    case 'PASS':
      return {
        ...record,
        sourceIds,
        sourceResult: 'ARCHITECTURAL_REVIEW_PASS',
        aggregationState: 'POSITIVE_RESOLVED',
        blockerClass: undefined,
        reason: review.reason
      }
    case 'UNRESOLVED':
      return {
        ...record,
        sourceIds,
        sourceResult: 'ARCHITECTURAL_REVIEW_UNRESOLVED',
        aggregationState: 'SUBSTANTIVE_UNRESOLVED',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED',
        reason: review.reason
      }
    case 'FAIL':
      return {
        ...record,
        sourceIds,
        sourceResult: 'ARCHITECTURAL_REVIEW_FAIL',
        aggregationState: 'SUBSTANTIVE_FAILURE',
        blockerClass: 'SUBSTANTIVE_UNRESOLVED',
        reason: review.reason
      }
  }
}

export const applyArchitecturalReviewLedger = (
  records: readonly ScreeningAggregationRecord[],
  ledger: ArchitecturalReviewLedger
): ScreeningAggregationRecord[] => {
  const reviews = new Map(ledger.reviews.map((review) => [review.clauseId, review]))
  return records.map((record) => {
    if (record.owner !== 'REFERENCE_HOUSE') return { ...record }
    const review = reviews.get(record.ownerEntryId)
    if (!review) return { ...record }
    if (record.sourceKind !== 'CANDIDATE_CONFORMANCE') {
      throw new Error(`DPL-13E expected ${record.ownerEntryId} to remain a candidate-conformance record.`)
    }
    return applyReviewRecord(record, review, ledger)
  })
}

export const composeDPL13EArchitecturalReview = (
  input: ArchitecturalReviewLedgerInput,
  fixture: DPL13DSecondFixtureResult = composeDPL13DSecondFixture()
): DPL13EArchitecturalReviewResult => {
  const ledger = createArchitecturalReviewLedger(input)
  assertLedgerBinding(ledger, fixture)

  const readiness = fixture.readiness as unknown as ScreeningCoverageReadinessResult
  const baseRecords = buildScreeningAggregationRecords(fixture.canonicalCase, readiness)
  const records = applyArchitecturalReviewLedger(baseRecords, ledger)
  const reviewedClauseIds = ledger.reviews.map((review) => review.clauseId)
  const reviewIds = new Set(reviewedClauseIds)
  const pendingClauseIds = ledger.reviewScopeClauseIds.filter((id) => !reviewIds.has(id))

  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness,
    records
  })
  const proofBoundary = {
    humanAuthoredReview: true as const,
    nativeArchitecturalJudgement: 'NOT_IMPLEMENTED' as const,
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const
  }
  const identityManifest = {
    schemaVersion: DPL13E_REVIEW_SCHEMA_VERSION,
    ledgerFingerprint: ledger.ledgerFingerprint,
    canonicalCaseFingerprint: fixture.canonicalCase.canonicalCaseIdentity.fingerprint,
    readinessIdentityFingerprint: readiness.identityFingerprint,
    reviewedClauseIds,
    pendingClauseIds,
    proofBoundary
  }
  const identityFingerprint = sha256DplSemanticFingerprint(identityManifest)

  return {
    schemaVersion: DPL13E_REVIEW_SCHEMA_VERSION,
    ledger,
    reviewedClauseIds,
    pendingClauseIds,
    aggregation,
    identityFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({
      identityFingerprint,
      aggregationResultFingerprint: aggregation.resultFingerprint
    }),
    proofBoundary
  }
}
