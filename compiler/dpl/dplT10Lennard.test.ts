import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT9LennardNoCostClosure } from './dplT9Lennard.js'
import {
  composeDPLT10LennardNoCostExecution,
  DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT
} from './dplT10Lennard.js'

describe('DPL-T10 Lennard no-cost execution', () => {
  test('binds exactly to landed T9 and its four-dependency frontier', () => {
    const t9 = composeDPLT9LennardNoCostClosure()
    const result = composeDPLT10LennardNoCostExecution()
    assert.equal(t9.resultFingerprint, DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT)
    assert.equal(result.t9ResultFingerprint, t9.resultFingerprint)
    assert.equal(result.inputDependencyCount, 4)
  })

  test('executes planning context without manufacturing a planning-consultant dependency', () => {
    const result = composeDPLT10LennardNoCostExecution()
    const planning = result.records.find((record) => record.dependencyClass === 'PLANNING_DESIGN_CONTEXT_REVIEW')
    assert.ok(planning)
    assert.equal(planning.state, 'EXECUTED_CONCERN_FOLDED_INTO_EXISTING_DEPENDENCY')
    assert.equal(planning.successorDependencyClass, 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY')
    assert.equal(planning.commissioningEligible, false)
    assert.equal(result.planningReviewResult, 'SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN')
  })

  test('reduces four T9 decision dependencies to three active dependencies', () => {
    const result = composeDPLT10LennardNoCostExecution()
    assert.equal(result.activeDependencyCount, 3)
    assert.deepEqual(result.activeDependencyClasses, [
      'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
      'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    ].sort((a, b) => a.localeCompare(b)))
    assert.deepEqual(result.foldedDependencies, ['PLANNING_DESIGN_CONTEXT_REVIEW'])
  })

  test('makes exactly two evidence classes eligible for commissioning but commissions nothing', () => {
    const result = composeDPLT10LennardNoCostExecution()
    assert.deepEqual(result.externalEvidenceEligibleForCommissioning, [
      'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    ].sort((a, b) => a.localeCompare(b)))
    assert.equal(result.proofBoundary.externalCommissioning, 'NO')
    assert.ok(result.records.filter((record) => record.commissioningEligible).every((record) =>
      record.state === 'ELIGIBLE_FOR_COMMISSIONING_NOT_COMMISSIONED'
    ))
  })

  test('preserves flood as no-cost competent-public recovery rather than escalating to consultant work', () => {
    const result = composeDPLT10LennardNoCostExecution()
    assert.deepEqual(result.noCostPublicRecoveryPending, ['EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'])
    const flood = result.records.find((record) => record.dependencyClass === 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY')
    assert.ok(flood)
    assert.equal(flood.state, 'NO_COST_PUBLIC_RECOVERY_BLOCKED')
    assert.equal(flood.commissioningEligible, false)
    assert.match(flood.reason, /not grounds to commission an FRA/)
    assert.equal(result.proofBoundary.floodConclusion, 'NOT_RESOLVED')
  })

  test('preserves proof boundaries', () => {
    const result = composeDPLT10LennardNoCostExecution()
    assert.equal(result.result, 'NO_COST_EXECUTION_COMPLETE_THREE_DEPENDENCIES_REMAIN_TWO_COMMISSIONING_ELIGIBLE')
    assert.deepEqual(result.proofBoundary, {
      externalCommissioning: 'NO',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'NO',
      statutoryPlanningDetermination: 'NO',
      legalBoundaryDetermined: 'NO',
      floodConclusion: 'NOT_RESOLVED',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and logs the exact commissioning threshold', () => {
    const first = composeDPLT10LennardNoCostExecution()
    const second = composeDPLT10LennardNoCostExecution()
    assert.equal(second.evidenceFingerprint, first.evidenceFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.evidenceFingerprint, /^[a-f0-9]{64}$/)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)
    assert.ok(first.records.every((record) => /^[a-f0-9]{64}$/.test(record.fingerprint)))

    console.log('DPL-T10-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      evidenceFingerprint: first.evidenceFingerprint,
      activeDependencyClasses: first.activeDependencyClasses,
      externalEvidenceEligibleForCommissioning: first.externalEvidenceEligibleForCommissioning,
      noCostPublicRecoveryPending: first.noCostPublicRecoveryPending,
      foldedDependencies: first.foldedDependencies,
      planningReviewResult: first.planningReviewResult,
      recordFingerprints: first.records.map((record) => ({ dependencyClass: record.dependencyClass, fingerprint: record.fingerprint }))
    }))
  })
})
