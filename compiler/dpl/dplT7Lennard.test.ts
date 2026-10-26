import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT6LennardScreeningAggregation } from './dplT6Lennard.js'
import {
  composeDPLT7LennardAccelerationDisposition,
  DPL_T7_EXPECTED_ACCELERATION_IDS,
  DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT
} from './dplT7Lennard.js'

const EXPECTED_REMAINING_BLOCKERS = [
  'REFERENCE_HOUSE:RH-PROT-08',
  'REFERENCE_HOUSE:RH-PROT-14',
  'ENGLAND:ENG-COV-SOURCE-APPLICABILITY',
  'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
  'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
  'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
  'NON_PLANNING:DPL11-COV-ACCESS-STATUS',
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER',
  'NON_PLANNING:DPL11-COV-SITE-CONTROL'
].sort((a, b) => a.localeCompare(b))

describe('DPL-T7 Lennard acceleration disposition', () => {
  test('binds exactly to the frozen landed T6 result and fifteen-record acceleration frontier', () => {
    const t6 = composeDPLT6LennardScreeningAggregation()
    const result = composeDPLT7LennardAccelerationDisposition()
    assert.equal(t6.resultFingerprint, DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT)
    assert.equal(result.t6ResultFingerprint, t6.resultFingerprint)
    assert.equal(result.controlId, 'DPL-T-CONTROL-004')
    assert.equal(result.candidateId, 'DPL-T-CANDIDATE-004-01')
    assert.equal(result.accelerationInputCount, 15)
    assert.deepEqual(
      result.records.map((record) => `${record.owner}:${record.accelerationEntryId}`).sort((a, b) => a.localeCompare(b)),
      DPL_T7_EXPECTED_ACCELERATION_IDS
    )
  })

  test('evaluates literal registered trigger predicates rather than treating unknownness as activation', () => {
    const result = composeDPLT7LennardAccelerationDisposition()
    assert.equal(result.countsByTriggerEvaluation.NO_POSITIVE_TRIGGER_FACT_ADMITTED, 15)
    assert.equal(result.countsByTriggerEvaluation.POSITIVE_TRIGGER_FACT_ADMITTED, 0)
    assert.equal(result.countsByTriggerEvaluation.TRIGGER_AUTHORITY_UNRESOLVED, 0)
    assert.ok(result.records.every((record) => record.registeredTriggers.length > 0))
    assert.ok(result.records.every((record) => record.claimRefs.every((claimId) => claimId.startsWith('LNR-C'))))
    assert.ok(result.records.every((record) => record.evidenceRefs.length > 0))
  })

  test('returns twelve non-activated future families to future-due and creates no accelerated due-now evidence', () => {
    const result = composeDPLT7LennardAccelerationDisposition()
    assert.equal(result.countsByDisposition.FUTURE_DUE_OR_DOWNSTREAM, 12)
    assert.equal(result.countsByDisposition.TRIGGER_NOT_ACTIVATED_AT_SCREENING, 3)
    assert.equal(result.countsByDisposition.ACTIVATED_DUE_NOW_EXTERNAL_EVIDENCE_SURVIVES, 0)
    assert.equal(result.countsByDisposition.UNRESOLVED_TRIGGER_AUTHORITY, 0)
    assert.deepEqual(result.survivingAccelerationDueNowIds, [])

    for (const record of result.records.filter((entry) => entry.disposition === 'FUTURE_DUE_OR_DOWNSTREAM')) {
      assert.equal(record.defaultScreeningDisposition, 'FUTURE_DUE', `${record.owner}:${record.sourceEntryId}`)
      assert.equal(record.accelerationAddsDueNowEvidence, false)
    }
  })

  test('preserves the three independently due-now base families after their acceleration triggers are not activated', () => {
    const result = composeDPLT7LennardAccelerationDisposition()
    const expected = new Set([
      'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
      'NON_PLANNING:DPL11-COV-ACCESS-STATUS',
      'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER'
    ])
    const actual = result.records
      .filter((record) => record.disposition === 'TRIGGER_NOT_ACTIVATED_AT_SCREENING')
      .map((record) => `${record.owner}:${record.sourceEntryId}`)

    assert.deepEqual(new Set(actual), expected)
    for (const record of result.records.filter((entry) => expected.has(`${entry.owner}:${entry.sourceEntryId}`))) {
      assert.equal(record.baseCoverageRemainsBlocking, true, `${record.owner}:${record.sourceEntryId}`)
      assert.equal(record.accelerationAddsDueNowEvidence, false, `${record.owner}:${record.sourceEntryId}`)
    }
  })

  test('does not mistake legal-boundary imprecision for a known legal-boundary discrepancy', () => {
    const result = composeDPLT7LennardAccelerationDisposition()
    const legal = result.records.find((record) =>
      record.owner === 'NON_PLANNING' && record.sourceEntryId === 'DPL11-COV-LEGAL-BOUNDARY-TITLE'
    )
    assert.ok(legal)
    assert.equal(legal.triggerEvaluation, 'NO_POSITIVE_TRIGGER_FACT_ADMITTED')
    assert.equal(legal.disposition, 'FUTURE_DUE_OR_DOWNSTREAM')
    assert.match(legal.reason, /not a known boundary\/control discrepancy/)
  })

  test('shrinks the active frontier from twenty-five T6 blockers to the ten substantive blockers without resolving them', () => {
    const t6 = composeDPLT6LennardScreeningAggregation()
    const result = composeDPLT7LennardAccelerationDisposition()
    assert.equal(t6.blockers.length, 25)
    assert.equal(result.remainingBlockers.length, 10)
    assert.deepEqual(result.remainingBlockerIds, EXPECTED_REMAINING_BLOCKERS)
    assert.ok(result.remainingBlockers.every((blocker) => !blocker.ownerEntryId.endsWith('::ACCELERATION_REVIEW')))
  })

  test('preserves the no-conclusion, no-procurement and no-applicant-fact-transfer boundaries', () => {
    const result = composeDPLT7LennardAccelerationDisposition()
    assert.equal(result.result, 'ACCELERATION_FRONTIER_DISPOSED_NO_NEW_DUE_NOW_EVIDENCE')
    assert.deepEqual(result.proofBoundary, {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      siteEvidenceCommissioned: 'NO',
      applicantProposalFactsTransferred: 'NO',
      unknownTreatedAsTrigger: 'NO',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and exposes the exact T7 frontier', () => {
    const first = composeDPLT7LennardAccelerationDisposition()
    const second = composeDPLT7LennardAccelerationDisposition()
    assert.equal(second.publicEvidenceFingerprint, first.publicEvidenceFingerprint)
    assert.equal(second.planningCoverageFingerprint, first.planningCoverageFingerprint)
    assert.equal(second.nonPlanningCoverageFingerprint, first.nonPlanningCoverageFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)
    assert.ok(first.records.every((record) => /^[a-f0-9]{64}$/.test(record.fingerprint)))

    console.log('DPL-T7-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      publicEvidenceFingerprint: first.publicEvidenceFingerprint,
      planningCoverageFingerprint: first.planningCoverageFingerprint,
      nonPlanningCoverageFingerprint: first.nonPlanningCoverageFingerprint,
      accelerationInputCount: first.accelerationInputCount,
      countsByDisposition: first.countsByDisposition,
      countsByTriggerEvaluation: first.countsByTriggerEvaluation,
      survivingAccelerationDueNowIds: first.survivingAccelerationDueNowIds,
      remainingBlockerIds: first.remainingBlockerIds,
      recordFingerprints: first.records.map((record) => ({
        id: `${record.owner}:${record.accelerationEntryId}`,
        fingerprint: record.fingerprint
      }))
    }))
  })
})
