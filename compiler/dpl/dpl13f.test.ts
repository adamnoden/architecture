import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13EProjectReview } from './dpl13e-project-review.js'
import {
  assertLockedGitBlob,
  composeDPL13FSourceComposition
} from './source-composition.js'

test('DPL-13F resolves only planning source/status while keeping England transition selection explicit and unresolved', () => {
  const result = composeDPL13FSourceComposition()

  assert.equal(result.england.finding.ownerEntryId, 'ENG-COV-SOURCE-APPLICABILITY')
  assert.equal(result.england.finding.result, 'UNRESOLVED')
  assert.deepEqual(result.england.finding.missingFacts, [
    'buildingControlRouteOrNoticeApplicationKind',
    'noticeOrApplicationDateAndStatus',
    'qualifyingCommencementDate',
    'qualifyingCommencementEvidence'
  ])

  assert.equal(result.planning.finding.ownerEntryId, 'DPL10-COV-SOURCE-COMPOSITION-STATUS')
  assert.equal(result.planning.finding.result, 'PASS')
  assert.deepEqual(
    result.planning.sourceStatus
      .filter((entry) => entry.developmentPlanMembership === 'YES')
      .map((entry) => entry.id)
      .sort(),
    ['CROYDON_LOCAL_PLAN_2018', 'LONDON_PLAN_2021']
  )

  const draftLondon = result.planning.sourceStatus.find((entry) => entry.id === 'DRAFT_LONDON_PLAN_2026')
  assert.equal(draftLondon?.status, 'EMERGING_NON_OPERATIVE')
  assert.equal(draftLondon?.developmentPlanMembership, 'NO')
  assert.equal(draftLondon?.materialConsiderationCapability, 'CASE_DEPENDENT')

  const revoked = result.planning.sourceStatus.find((entry) => entry.id === 'CROYDON_SPD2')
  assert.equal(revoked?.status, 'REVOKED_FROM_2022-07-26')
  assert.equal(revoked?.materialConsiderationCapability, 'NO')
})

test('DPL-13F reduces substantive blockers by exactly one and admits no whole-site authority', () => {
  const result = composeDPL13FSourceComposition()
  assert.deepEqual(result.aggregation.blockerCounts, {
    substantiveUnresolved: 10,
    dueClassificationUnresolved: 17,
    substantiveFailure: 0
  })
  assert.deepEqual(result.aggregation.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(result.proofBoundary.englandTechnicalCompliance, 'NOT_CLAIMED')
  assert.equal(result.proofBoundary.planningPolicyCompliance, 'NOT_CLAIMED')
  assert.equal(result.proofBoundary.planningPermission, 'EXTERNAL_ONLY')
  assert.equal(result.proofBoundary.compatibleAtScreening, 'NOT_ADMITTED')
  assert.equal(result.proofBoundary.incompatible, 'NOT_ADMITTED')
  assert.equal(result.proofBoundary.routeExhaustion, 'NOT_IMPLEMENTED')
})

test('DPL-13F preserves the exact 17 opaque acceleration records', () => {
  const before = composeDPL13EProjectReview().aggregation.aggregationRecords
    .filter((record) => record.ownerEntryId.endsWith('::ACCELERATION_REVIEW'))
    .map(({ recordFingerprint: _recordFingerprint, ...record }) => record)
  const after = composeDPL13FSourceComposition().aggregation.aggregationRecords
    .filter((record) => record.ownerEntryId.endsWith('::ACCELERATION_REVIEW'))
    .map(({ recordFingerprint: _recordFingerprint, ...record }) => record)

  assert.equal(before.length, 17)
  assert.deepEqual(after, before)
})

test('DPL-13F changes only the exact two source/applicability records', () => {
  const base = composeDPL13EProjectReview().aggregation.aggregationRecords
  const next = composeDPL13FSourceComposition().aggregation.aggregationRecords
  const targetKeys = new Set([
    'ENGLAND:ENG-COV-SOURCE-APPLICABILITY',
    'PLANNING:DPL10-COV-SOURCE-COMPOSITION-STATUS'
  ])
  const stripFingerprint = <T extends { readonly recordFingerprint: string }>(record: T) => {
    const { recordFingerprint: _recordFingerprint, ...rest } = record
    return rest
  }

  const unchangedBefore = base
    .filter((record) => !targetKeys.has(`${record.owner}:${record.ownerEntryId}`))
    .map(stripFingerprint)
  const unchangedAfter = next
    .filter((record) => !targetKeys.has(`${record.owner}:${record.ownerEntryId}`))
    .map(stripFingerprint)
  assert.deepEqual(unchangedAfter, unchangedBefore)

  const england = next.find((record) => record.owner === 'ENGLAND' && record.ownerEntryId === 'ENG-COV-SOURCE-APPLICABILITY')
  const planning = next.find((record) => record.owner === 'PLANNING' && record.ownerEntryId === 'DPL10-COV-SOURCE-COMPOSITION-STATUS')
  assert.equal(england?.sourceResult, 'SOURCE_COMPOSITION_UNRESOLVED')
  assert.equal(england?.aggregationState, 'SUBSTANTIVE_UNRESOLVED')
  assert.equal(planning?.sourceResult, 'SOURCE_COMPOSITION_PASS')
  assert.equal(planning?.aggregationState, 'POSITIVE_RESOLVED')
})

test('DPL-13F stale authority lock fails closed', () => {
  assert.throws(
    () => assertLockedGitBlob('changed', 'expected', 'test'),
    /refuses changed test authority bytes/
  )
})
