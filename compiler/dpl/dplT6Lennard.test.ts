import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { architecturalReviewClauseIds } from './architectural-review.js'
import { compileDPLT5LennardRealControlCase } from './dplT5Lennard.js'
import {
  composeDPLT6LennardScreeningAggregation,
  DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT
} from './dplT6Lennard.js'

const EXPECTED_REVIEW_SCOPE = [
  'RH-I01',
  'RH-I03',
  'RH-I04',
  'RH-I05',
  'RH-I06',
  'RH-I07',
  'RH-PROT-02',
  'RH-PROT-03',
  'RH-PROT-05',
  'RH-PROT-07',
  'RH-PROT-09',
  'RH-PROT-10',
  'RH-PROT-11',
  'RH-PROT-12',
  'RH-PROT-13',
  'RH-PROT-15'
].sort((a, b) => a.localeCompare(b))

const blocker = (
  result: ReturnType<typeof composeDPLT6LennardScreeningAggregation>,
  owner: string,
  ownerEntryId: string
) => result.blockers.find((entry) => entry.owner === owner && entry.ownerEntryId === ownerEntryId)

const record = (
  result: ReturnType<typeof composeDPLT6LennardScreeningAggregation>,
  owner: string,
  ownerEntryId: string
) => result.aggregationRecords.find((entry) => entry.owner === owner && entry.ownerEntryId === ownerEntryId)

describe('DPL-T6 Lennard SCREENING aggregation', () => {
  test('binds to the frozen T5 real-control result', () => {
    const t5 = compileDPLT5LennardRealControlCase()
    assert.equal(t5.resultFingerprint, DPL_T6_EXPECTED_T5_RESULT_FINGERPRINT)
    const result = composeDPLT6LennardScreeningAggregation()
    assert.equal(result.t5ResultFingerprint, t5.resultFingerprint)
    assert.equal(result.controlId, 'DPL-T-CONTROL-004')
    assert.equal(result.candidateId, 'DPL-T-CANDIDATE-004-01')
  })

  test('derives the exact current sixteen-clause architectural-review universe', () => {
    assert.deepEqual(architecturalReviewClauseIds(), EXPECTED_REVIEW_SCOPE)
    const result = composeDPLT6LennardScreeningAggregation()
    assert.deepEqual(result.architecturalReview.ledger.reviewScopeClauseIds, EXPECTED_REVIEW_SCOPE)
    assert.deepEqual(result.architecturalReview.reviewedClauseIds, EXPECTED_REVIEW_SCOPE)
    assert.deepEqual(result.architecturalReview.pendingClauseIds, [])
    assert.equal(result.architecturalReview.ledger.reviews.length, 16)
    assert.ok(result.architecturalReview.ledger.reviews.every((review) => review.result === 'PASS'))
    assert.ok(result.architecturalReview.ledger.reviews.every((review) => review.evidenceRefs.length > 0))
  })

  test('resolves only project-author architectural review and preserves external Reference House authority', () => {
    const result = composeDPLT6LennardScreeningAggregation()
    for (const clauseId of EXPECTED_REVIEW_SCOPE) {
      const item = record(result, 'REFERENCE_HOUSE', clauseId)
      assert.ok(item, clauseId)
      assert.equal(item.aggregationState, 'POSITIVE_RESOLVED', clauseId)
      assert.equal(item.sourceResult, 'ARCHITECTURAL_REVIEW_PASS', clauseId)
      assert.equal(blocker(result, 'REFERENCE_HOUSE', clauseId), undefined, clauseId)
    }

    assert.ok(blocker(result, 'REFERENCE_HOUSE', 'RH-PROT-08'))
    assert.ok(blocker(result, 'REFERENCE_HOUSE', 'RH-PROT-14'))
    assert.equal(blocker(result, 'REFERENCE_HOUSE', 'RH-SI02'), undefined)
    assert.equal(blocker(result, 'REFERENCE_HOUSE', 'RH-SI05'), undefined)
    assert.ok(result.futureDue.some((entry) => entry.owner === 'REFERENCE_HOUSE' && entry.ownerEntryId === 'RH-SI02'))
    assert.ok(result.futureDue.some((entry) => entry.owner === 'REFERENCE_HOUSE' && entry.ownerEntryId === 'RH-SI05'))
  })

  test('uses current source-status authority rather than raw obligation absence', () => {
    const result = composeDPLT6LennardScreeningAggregation()
    const planning = record(result, 'PLANNING', 'DPL10-COV-SOURCE-COMPOSITION-STATUS')
    assert.ok(planning)
    assert.equal(planning.aggregationState, 'POSITIVE_RESOLVED')
    assert.equal(planning.sourceResult, 'SOURCE_COMPOSITION_PASS')

    const england = blocker(result, 'ENGLAND', 'ENG-COV-SOURCE-APPLICABILITY')
    assert.ok(england)
    assert.equal(england.aggregationState, 'SUBSTANTIVE_UNRESOLVED')
    assert.equal(england.sourceResult, 'SOURCE_COMPOSITION_UNRESOLVED')
  })

  test('shrinks the raw runtime field list into the actual current SCREENING frontier', () => {
    const t5 = compileDPLT5LennardRealControlCase()
    const result = composeDPLT6LennardScreeningAggregation()
    assert.equal(t5.runtime.unresolvedInputCount, 45)
    assert.ok(result.blockers.length > 0)
    assert.ok(result.blockers.length < t5.runtime.unresolvedInputCount)
    assert.equal(result.blockerCountsByState.SUBSTANTIVE_FAILURE ?? 0, 0)
    assert.equal(result.readiness.uncoveredRealClaimIds.length, 0)
  })

  test('preserves real claim vocabulary and keeps synthetic claims out of the real-control aggregation', () => {
    const result = composeDPLT6LennardScreeningAggregation()
    for (const entry of result.aggregationRecords) {
      assert.ok(entry.claimRefs.every((claimId) => claimId.startsWith('LNR-C')))
    }
    for (const entry of result.futureDue) {
      assert.ok(entry.claimRefs.every((claimId) => claimId.startsWith('LNR-C')))
    }
  })

  test('preserves the no-conclusion and no-survey-commission boundary', () => {
    const result = composeDPLT6LennardScreeningAggregation()
    assert.equal(result.result, 'UNRESOLVED_AT_SCREENING_GENUINE_FRONTIER_CLASSIFIED')
    assert.deepEqual(result.proofBoundary, {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      architecturalReviewNative: 'NO_HUMAN_AUTHORED',
      siteEvidenceCommissioned: 'NO',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and exposes the exact post-review blocker frontier', () => {
    const first = composeDPLT6LennardScreeningAggregation()
    const second = composeDPLT6LennardScreeningAggregation()
    assert.equal(second.readiness.identityFingerprint, first.readiness.identityFingerprint)
    assert.equal(second.architecturalReview.ledger.ledgerFingerprint, first.architecturalReview.ledger.ledgerFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)

    console.log('DPL-T6-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      readiness: first.readiness,
      architecturalReviewLedgerFingerprint: first.architecturalReview.ledger.ledgerFingerprint,
      blockerCountsByOwner: first.blockerCountsByOwner,
      blockerCountsByState: first.blockerCountsByState,
      blockerIds: first.blockers.map((entry) => `${entry.owner}:${entry.ownerEntryId}`),
      futureDueReferenceHouse: first.futureDue
        .filter((entry) => entry.owner === 'REFERENCE_HOUSE')
        .map((entry) => entry.ownerEntryId)
    }))
  })
})
