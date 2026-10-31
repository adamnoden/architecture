import assert from 'node:assert/strict'
import test from 'node:test'
import {
  architecturalReviewClauseIds,
  composeDPL13EArchitecturalReview,
  DPL13E_REVIEW_SCHEMA_VERSION,
  type ArchitecturalReviewLedgerInput,
  type ArchitecturalReviewRecordInput
} from './architectural-review.js'
import { loadConformanceCoverageRegistry } from './conformance-coverage.js'
import { composeDPL13DSecondFixture } from './dpl13d.js'

const expectedArchitecturalReviewIds = [
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
] as const

const review = (
  clauseId: string,
  result: ArchitecturalReviewRecordInput['result'] = 'PASS',
  reason = `Test-only architectural review for ${clauseId}.`,
  evidenceRefs: readonly string[] = ['TEST_ONLY:DPL-13E']
): ArchitecturalReviewRecordInput => ({ clauseId, result, reason, evidenceRefs })

const ledger = (
  reviews: readonly ArchitecturalReviewRecordInput[],
  overrides: Partial<ArchitecturalReviewLedgerInput> = {}
): ArchitecturalReviewLedgerInput => {
  const fixture = composeDPL13DSecondFixture()
  const coverage = loadConformanceCoverageRegistry()
  return {
    schemaVersion: DPL13E_REVIEW_SCHEMA_VERSION,
    id: 'DPL-13E-TEST-ONLY-LEDGER',
    assuranceProfile: 'SCREENING',
    siteId: fixture.site.siteId,
    candidateId: fixture.canonicalCase.authoredCandidate.input.id,
    candidateRevision: fixture.canonicalCase.authoredCandidate.input.revision,
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    referenceHouseSourceFingerprint: fixture.canonicalCase.authoredCandidate.input.referenceHouseSourceFingerprint,
    dpl02CoverageFingerprint: coverage.fingerprint,
    dpl02AuthorityFingerprint: coverage.authorityFingerprint,
    reviewer: {
      identity: 'TEST_ONLY_SYNTHETIC_REVIEWER',
      role: 'TEST_FIXTURE',
      authorityBasis: 'No project authority; adversarial test only.',
      authoredAt: '2026-10-24T00:00:00Z'
    },
    reviewScopeClauseIds: architecturalReviewClauseIds(),
    reviews,
    ...overrides
  }
}

test('DPL-13E derives exactly the sixteen DPL-02 architectural-review blockers', () => {
  assert.deepEqual(architecturalReviewClauseIds(), [...expectedArchitecturalReviewIds])
})

test('DPL-13E all-PASS test ledger resolves only the sixteen architectural blockers and still refuses COMPATIBLE', () => {
  const input = ledger(expectedArchitecturalReviewIds.map((id) => review(id)))
  const result = composeDPL13EArchitecturalReview(input)

  assert.deepEqual(result.reviewedClauseIds, [...expectedArchitecturalReviewIds])
  assert.deepEqual(result.pendingClauseIds, [])
  assert.deepEqual(result.aggregation.blockerCounts, {
    substantiveUnresolved: 11,
    dueClassificationUnresolved: 17,
    substantiveFailure: 0
  })
  assert.deepEqual(result.aggregation.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(result.aggregation.proofBoundary.compatibleAtScreening, 'NOT_ADMITTED')
  assert.equal(result.aggregation.proofBoundary.incompatible, 'NOT_ADMITTED')
  assert.equal(result.proofBoundary.nativeArchitecturalJudgement, 'NOT_IMPLEMENTED')
})

test('DPL-13E partial PASS resolves only the reviewed clause and leaves omitted review explicit', () => {
  const result = composeDPL13EArchitecturalReview(ledger([review('RH-I01')]))
  assert.deepEqual(result.reviewedClauseIds, ['RH-I01'])
  assert.equal(result.pendingClauseIds.length, 15)
  assert.ok(result.pendingClauseIds.includes('RH-PROT-15'))
  assert.deepEqual(result.aggregation.blockerCounts, {
    substantiveUnresolved: 26,
    dueClassificationUnresolved: 17,
    substantiveFailure: 0
  })
  const reviewed = result.aggregation.aggregationRecords.find((record) => record.ownerEntryId === 'RH-I01')
  const omitted = result.aggregation.aggregationRecords.find((record) => record.ownerEntryId === 'RH-I03')
  assert.equal(reviewed?.sourceResult, 'ARCHITECTURAL_REVIEW_PASS')
  assert.equal(reviewed?.aggregationState, 'POSITIVE_RESOLVED')
  assert.equal(omitted?.sourceResult, 'OPEN')
  assert.equal(omitted?.aggregationState, 'SUBSTANTIVE_UNRESOLVED')
})

test('DPL-13E authored UNRESOLVED remains unresolved', () => {
  const result = composeDPL13EArchitecturalReview(ledger([
    review('RH-I01', 'UNRESOLVED', 'Test-only reviewer cannot determine RH-I01 from the supplied evidence.')
  ]))
  assert.deepEqual(result.aggregation.blockerCounts, {
    substantiveUnresolved: 27,
    dueClassificationUnresolved: 17,
    substantiveFailure: 0
  })
  const record = result.aggregation.aggregationRecords.find((entry) => entry.ownerEntryId === 'RH-I01')
  assert.equal(record?.sourceResult, 'ARCHITECTURAL_REVIEW_UNRESOLVED')
  assert.equal(record?.aggregationState, 'SUBSTANTIVE_UNRESOLVED')
})

test('DPL-13E architectural FAIL is candidate-level failure and cannot imply site INCOMPATIBLE', () => {
  const result = composeDPL13EArchitecturalReview(ledger([
    review('RH-I01', 'FAIL', 'Test-only candidate departs from the controlled architectural grammar.')
  ]))
  assert.deepEqual(result.aggregation.blockerCounts, {
    substantiveUnresolved: 26,
    dueClassificationUnresolved: 17,
    substantiveFailure: 1
  })
  assert.deepEqual(result.aggregation.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(result.aggregation.proofBoundary.incompatible, 'NOT_ADMITTED')
})

test('DPL-13E rejects professional and site-interface clauses outside architectural-review authority', () => {
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([review('RH-PROT-08')])),
    /outside architectural-review authority/
  )
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([review('RH-PROT-14')])),
    /outside architectural-review authority/
  )
})

test('DPL-13E rejects duplicate and unknown review clauses', () => {
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([review('RH-I01'), review('RH-I01')])),
    /duplicate clause RH-I01/
  )
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([review('DPL11-COV-SITE-CONTROL')])),
    /outside architectural-review authority/
  )
})

test('DPL-13E refuses candidate, Reference House and DPL-02 authority mismatches', () => {
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([], { candidateFingerprint: 'stale-candidate' })),
    /different candidate fingerprint/
  )
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([], { referenceHouseSourceFingerprint: 'stale-reference-house' })),
    /different Reference House source identity/
  )
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([], { dpl02CoverageFingerprint: 'stale-coverage' })),
    /stale or different DPL-02 conformance-coverage identity/
  )
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([], { dpl02AuthorityFingerprint: 'stale-authority' })),
    /stale or different DPL-02 authority-source identity/
  )
})

test('DPL-13E rejects a review-scope universe that drifts from DPL-02 authority', () => {
  assert.throws(
    () => composeDPL13EArchitecturalReview(ledger([], { reviewScopeClauseIds: ['RH-I01'] })),
    /complete current DPL-02 ARCHITECTURAL_REVIEW blocker set exactly/
  )
})

test('DPL-13E ledger identity is neutral to set-like review and evidence ordering', () => {
  const forward = expectedArchitecturalReviewIds.map((id) => review(id, 'PASS', `Test-only pass ${id}.`, ['REF:B', 'REF:A']))
  const reverse = [...forward].reverse().map((entry) => ({ ...entry, evidenceRefs: [...entry.evidenceRefs].reverse() }))
  const first = composeDPL13EArchitecturalReview(ledger(forward))
  const second = composeDPL13EArchitecturalReview(ledger(reverse, {
    reviewScopeClauseIds: [...architecturalReviewClauseIds()].reverse()
  }))

  assert.equal(first.ledger.ledgerFingerprint, second.ledger.ledgerFingerprint)
  assert.equal(first.identityFingerprint, second.identityFingerprint)
  assert.equal(first.resultFingerprint, second.resultFingerprint)
})

test('DPL-13E material review reason and evidence changes invalidate identities', () => {
  const first = composeDPL13EArchitecturalReview(ledger([
    review('RH-I01', 'PASS', 'Test-only reason A.', ['REF:A'])
  ]))
  const changedReason = composeDPL13EArchitecturalReview(ledger([
    review('RH-I01', 'PASS', 'Test-only reason B.', ['REF:A'])
  ]))
  const changedEvidence = composeDPL13EArchitecturalReview(ledger([
    review('RH-I01', 'PASS', 'Test-only reason A.', ['REF:B'])
  ]))

  assert.notEqual(first.ledger.ledgerFingerprint, changedReason.ledger.ledgerFingerprint)
  assert.notEqual(first.ledger.ledgerFingerprint, changedEvidence.ledger.ledgerFingerprint)
  assert.notEqual(first.resultFingerprint, changedReason.resultFingerprint)
  assert.notEqual(first.resultFingerprint, changedEvidence.resultFingerprint)
})

test('DPL-13E review composition cannot mutate the controlled candidate identity', () => {
  const fixture = composeDPL13DSecondFixture()
  const before = fixture.canonicalCase.authoredCandidate.fingerprint
  const result = composeDPL13EArchitecturalReview(ledger([review('RH-I01')]), fixture)

  assert.equal(fixture.canonicalCase.authoredCandidate.fingerprint, before)
  assert.equal(result.aggregation.canonicalCase.candidateFingerprint, before)
  assert.equal(result.aggregation.proofBoundary.architecturalCandidateSelection, 'NOT_IMPLEMENTED')
})
