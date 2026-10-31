import assert from 'node:assert/strict'
import test from 'node:test'
import { architecturalReviewClauseIds } from './architectural-review.js'
import {
  composeDPL13EProjectReview,
  createDPL13EProjectReviewInput,
  dpl13eProjectReviews,
  DPL13E_PROJECT_REVIEW_ID
} from './dpl13e-project-review.js'

test('DPL-13E project review covers the exact architectural-review universe with PASS evidence', () => {
  const input = createDPL13EProjectReviewInput()
  const expected = architecturalReviewClauseIds()
  assert.equal(input.id, DPL13E_PROJECT_REVIEW_ID)
  assert.deepEqual(input.reviewScopeClauseIds, expected)
  assert.deepEqual(dpl13eProjectReviews().map((review) => review.clauseId).sort(), expected)
  assert.ok(dpl13eProjectReviews().every((review) => review.result === 'PASS'))
  assert.ok(dpl13eProjectReviews().every((review) => review.reason.length > 40))
  assert.ok(dpl13eProjectReviews().every((review) => review.evidenceRefs.length >= 3))
  assert.equal(input.reviewer.identity, 'PROJECT_AUTHOR_DELEGATED_ARCHITECTURE_AGENT')
  assert.equal(input.reviewer.role, 'PROJECT_AUTHOR_DELEGATE_ARCHITECTURAL_REVIEW')
})

test('DPL-13E project review resolves the sixteen architectural blockers and no others', () => {
  const result = composeDPL13EProjectReview()
  assert.deepEqual(result.pendingClauseIds, [])
  assert.deepEqual(result.reviewedClauseIds, architecturalReviewClauseIds())
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
  assert.equal(result.aggregation.proofBoundary.routeExhaustion, 'NOT_IMPLEMENTED')
  assert.equal(result.aggregation.proofBoundary.architecturalCandidateSelection, 'NOT_IMPLEMENTED')
})

test('DPL-13E project review keeps non-architectural blockers outside delegated review authority', () => {
  const result = composeDPL13EProjectReview()
  const reviewed = new Set(result.reviewedClauseIds)
  assert.equal(reviewed.has('RH-PROT-08'), false)
  assert.equal(reviewed.has('RH-PROT-14'), false)
  assert.equal(result.aggregation.blockerCounts.substantiveUnresolved, 11)
  assert.equal(result.aggregation.blockerCounts.dueClassificationUnresolved, 17)
})
