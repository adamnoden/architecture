import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT8LennardSubstantiveDisposition } from './dplT8Lennard.js'
import {
  composeDPLT9LennardNoCostClosure,
  DPL_T9_EXPECTED_INPUT_BLOCKER_IDS,
  DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT
} from './dplT9Lennard.js'

const EXPECTED_DEPENDENCIES = [
  'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
  'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
  'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
  'PLANNING_DESIGN_CONTEXT_REVIEW'
].sort((a, b) => a.localeCompare(b))

describe('DPL-T9 Lennard no-cost authority closure', () => {
  test('binds exactly to the landed T8 fingerprint and seven-item current frontier', () => {
    const t8 = composeDPLT8LennardSubstantiveDisposition()
    const result = composeDPLT9LennardNoCostClosure()
    assert.equal(t8.resultFingerprint, DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT)
    assert.equal(result.t8ResultFingerprint, t8.resultFingerprint)
    assert.equal(result.inputBlockerCount, 7)
    assert.deepEqual(
      result.records.map((record) => record.blockerId).sort((a, b) => a.localeCompare(b)),
      DPL_T9_EXPECTED_INPUT_BLOCKER_IDS
    )
  })

  test('resolves the emerging-policy source/weight blocker without inventing scalar statutory weight', () => {
    const result = composeDPLT9LennardNoCostClosure()
    const emerging = result.records.find((record) =>
      record.blockerId === 'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT'
    )
    assert.ok(emerging)
    assert.equal(emerging.disposition, 'RESOLVED_BOUNDED_PROJECT_AUTHORITY')
    assert.equal(emerging.dependencyClass, null)
    assert.match(emerging.reason, /no project-native scalar planning weight may be invented/)
    assert.deepEqual(result.resolvedBlockerIds, ['PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT'])
  })

  test('reduces seven active blocker records to six while freezing only four decision dependencies', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.equal(result.currentActiveBlockerIds.length, 6)
    assert.deepEqual(result.decisionDependencies, EXPECTED_DEPENDENCIES)
    assert.equal(result.decisionDependencies.length, 4)
    assert.equal(result.countsByDisposition.RESOLVED_BOUNDED_PROJECT_AUTHORITY, 1)
    assert.equal(result.countsByDisposition.PUBLIC_AUTHORITY_RECOVERY_PENDING, 1)
    assert.equal(result.countsByDisposition.SURVIVES_EXTERNAL_EVIDENCE_BRIEF, 3)
    assert.equal(result.countsByDisposition.CONSOLIDATED_PLANNING_CONTEXT_REVIEW, 2)
  })

  test('keeps only two professional or measurement evidence dependencies', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.deepEqual(result.externalProfessionalOrMeasurementDependencies, [
      'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    ])
    assert.deepEqual(result.publicAuthorityRecoveryDependencies, ['EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'])
    assert.deepEqual(result.planningJudgementDependencies, ['PLANNING_DESIGN_CONTEXT_REVIEW'])
  })

  test('shares one measured-geometry dependency between maintenance and Bromley Policy 8', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.deepEqual(
      result.dependencyConsumers.MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY,
      [
        'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
        'REFERENCE_HOUSE:RH-PROT-14'
      ].sort((a, b) => a.localeCompare(b))
    )
    const records = result.records.filter((record) =>
      record.dependencyClass === 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    )
    assert.equal(records.length, 2)
    assert.equal(new Set(records.map((record) => record.briefPath)).size, 1)
  })

  test('reuses the existing RH-11 structural red team through a Lennard addendum', () => {
    const result = composeDPLT9LennardNoCostClosure()
    const structural = result.records.find((record) => record.blockerId === 'REFERENCE_HOUSE:RH-PROT-08')
    assert.ok(structural)
    assert.equal(structural.disposition, 'SURVIVES_EXTERNAL_EVIDENCE_BRIEF')
    assert.equal(structural.dependencyClass, 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW')
    assert.equal(structural.briefPath, 'project/dpl/evidence-briefs/dpl-t9-lennard-structural-concept-addendum.md')
    assert.match(structural.reason, /RH-11 already provides the generic structural red-team brief/)
  })

  test('does not falsely discharge flood screening with secondary postcode evidence', () => {
    const result = composeDPLT9LennardNoCostClosure()
    const flood = result.records.find((record) =>
      record.blockerId === 'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER'
    )
    assert.ok(flood)
    assert.equal(flood.disposition, 'PUBLIC_AUTHORITY_RECOVERY_PENDING')
    assert.equal(flood.dependencyClass, 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY')
    assert.match(flood.reason, /refuses to promote secondary postcode summaries/)
    assert.equal(result.proofBoundary.secondaryFloodEvidencePromoted, 'NO')
  })

  test('consolidates local qualitative and strategic capacity into one exact planning-context review', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.deepEqual(
      result.dependencyConsumers.PLANNING_DESIGN_CONTEXT_REVIEW,
      [
        'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
        'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY'
      ].sort((a, b) => a.localeCompare(b))
    )
    const planningRecords = result.records.filter((record) =>
      record.dependencyClass === 'PLANNING_DESIGN_CONTEXT_REVIEW'
    )
    assert.equal(planningRecords.length, 2)
    assert.ok(planningRecords.every((record) => record.disposition === 'CONSOLIDATED_PLANNING_CONTEXT_REVIEW'))
    assert.ok(planningRecords.every((record) => record.evidenceRefs.includes('T9-CONTEXT-01')))
    assert.ok(planningRecords.every((record) => record.briefPath === 'project/dpl/dpl-t9-lennard-planning-context-review.md'))
  })

  test('preserves all proof boundaries and commissions nothing', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.equal(result.result, 'NO_COST_FRONTIER_REDUCED_MINIMUM_DECISION_DEPENDENCIES_FROZEN')
    assert.deepEqual(result.proofBoundary, {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'NO',
      evidenceCommissioned: 'NO',
      statutoryPlanningDetermination: 'NO',
      legalBoundaryDetermined: 'NO',
      secondaryFloodEvidencePromoted: 'NO',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and freezes the exact reduced frontier', () => {
    const first = composeDPLT9LennardNoCostClosure()
    const second = composeDPLT9LennardNoCostClosure()
    assert.equal(second.authorityEvidenceFingerprint, first.authorityEvidenceFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.authorityEvidenceFingerprint, /^[a-f0-9]{64}$/)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)
    assert.ok(first.records.every((record) => /^[a-f0-9]{64}$/.test(record.fingerprint)))

    console.log('DPL-T9-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      authorityEvidenceFingerprint: first.authorityEvidenceFingerprint,
      countsByDisposition: first.countsByDisposition,
      resolvedBlockerIds: first.resolvedBlockerIds,
      currentActiveBlockerIds: first.currentActiveBlockerIds,
      decisionDependencies: first.decisionDependencies,
      dependencyConsumers: first.dependencyConsumers,
      externalProfessionalOrMeasurementDependencies: first.externalProfessionalOrMeasurementDependencies,
      publicAuthorityRecoveryDependencies: first.publicAuthorityRecoveryDependencies,
      planningJudgementDependencies: first.planningJudgementDependencies,
      recordFingerprints: first.records.map((record) => ({ blockerId: record.blockerId, fingerprint: record.fingerprint }))
    }))
  })
})
