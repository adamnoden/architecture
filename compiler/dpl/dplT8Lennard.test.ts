import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT7LennardAccelerationDisposition } from './dplT7Lennard.js'
import {
  composeDPLT8LennardSubstantiveDisposition,
  DPL_T8_EXPECTED_INPUT_BLOCKER_IDS,
  DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT
} from './dplT8Lennard.js'

const EXPECTED_DUE_NOW_UNRESOLVED = [
  'REFERENCE_HOUSE:RH-PROT-08',
  'REFERENCE_HOUSE:RH-PROT-14',
  'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
  'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
  'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER'
].sort((a, b) => a.localeCompare(b))

const EXPECTED_FUTURE_DUE = [
  'ENGLAND:ENG-COV-SOURCE-APPLICABILITY',
  'NON_PLANNING:DPL11-COV-SITE-CONTROL'
].sort((a, b) => a.localeCompare(b))

const EXPECTED_RESOLVED = ['NON_PLANNING:DPL11-COV-ACCESS-STATUS']

const EXPECTED_EVIDENCE_CLASSES = [
  'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
  'EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN',
  'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
].sort((a, b) => a.localeCompare(b))

const EXPECTED_AUTHORITY_CLASSES = [
  'LOCAL_QUALITATIVE_DESIGN_JUDGEMENT',
  'PLANNING_EMERGING_POLICY_WEIGHT_JUDGEMENT',
  'STRATEGIC_CAPACITY_PLANNING_JUDGEMENT'
].sort((a, b) => a.localeCompare(b))

describe('DPL-T8 Lennard substantive SCREENING disposition', () => {
  test('binds exactly to the landed T7 result and ten-item substantive frontier', () => {
    const t7 = composeDPLT7LennardAccelerationDisposition()
    const result = composeDPLT8LennardSubstantiveDisposition()
    assert.equal(t7.resultFingerprint, DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT)
    assert.equal(result.t7ResultFingerprint, t7.resultFingerprint)
    assert.equal(result.inputBlockerCount, 10)
    assert.deepEqual(
      result.records.map((record) => record.blockerId).sort((a, b) => a.localeCompare(b)),
      DPL_T8_EXPECTED_INPUT_BLOCKER_IDS
    )
  })

  test('classifies all ten blockers without converting every uncertainty into evidence procurement', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    assert.equal(result.countsByDisposition.RESOLVED_EXISTING_AUTHORITY, 1)
    assert.equal(result.countsByDisposition.RECLASSIFIED_FUTURE_DUE, 2)
    assert.equal(result.countsByDisposition.SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE, 4)
    assert.equal(result.countsByDisposition.UNRESOLVED_AUTHORITY, 3)
    assert.deepEqual(result.dueNowUnresolvedBlockerIds, EXPECTED_DUE_NOW_UNRESOLVED)
    assert.deepEqual(result.futureDueBlockerIds, EXPECTED_FUTURE_DUE)
    assert.deepEqual(result.resolvedBlockerIds, EXPECTED_RESOLVED)
  })

  test('deduplicates four surviving evidence blockers into exactly three minimum evidence classes', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    assert.deepEqual(result.survivingEvidenceClasses, EXPECTED_EVIDENCE_CLASSES)
    assert.deepEqual(result.survivingAuthorityClasses, EXPECTED_AUTHORITY_CLASSES)

    const boundaryEvidenceUsers = result.records
      .filter((record) => record.evidenceClass === 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY')
      .map((record) => record.blockerId)
      .sort((a, b) => a.localeCompare(b))
    assert.deepEqual(boundaryEvidenceUsers, [
      'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
      'REFERENCE_HOUSE:RH-PROT-14'
    ].sort((a, b) => a.localeCompare(b)))
  })

  test('proves that Bromley Policy 8 makes exact side-boundary geometry decision-critical without claiming a legal-boundary failure', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    assert.equal(result.sideSpaceScreening.policyId, 'BROM-P8-SIDE-SPACE')
    assert.equal(result.sideSpaceScreening.policyNumericFloorM, 1)
    assert.equal(result.sideSpaceScreening.candidateStoreys, 2)
    assert.ok(result.sideSpaceScreening.westSideIndicativeMinimumClearanceM > 0.75)
    assert.ok(result.sideSpaceScreening.westSideIndicativeMinimumClearanceM < 0.82)
    assert.ok(result.sideSpaceScreening.eastSideIndicativeMinimumClearanceM > 0.63)
    assert.ok(result.sideSpaceScreening.eastSideIndicativeMinimumClearanceM < 0.65)
    assert.equal(result.sideSpaceScreening.bothIndicativeSidesBelowNumericFloor, true)
    assert.equal(result.sideSpaceScreening.legalOrMeasuredBoundaryConclusion, 'NOT_ADMITTED')

    const quantitative = result.records.find((record) =>
      record.blockerId === 'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY'
    )
    assert.ok(quantitative)
    assert.equal(quantitative.disposition, 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE')
    assert.equal(quantitative.evidenceClass, 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY')
    assert.match(quantitative.reason, /cannot call a policy failure/)
  })

  test('reclassifies future event and commercial-control questions rather than inventing missing site facts', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    const england = result.records.find((record) => record.blockerId === 'ENGLAND:ENG-COV-SOURCE-APPLICABILITY')
    const siteControl = result.records.find((record) => record.blockerId === 'NON_PLANNING:DPL11-COV-SITE-CONTROL')
    assert.ok(england)
    assert.ok(siteControl)
    assert.equal(england.disposition, 'RECLASSIFIED_FUTURE_DUE')
    assert.match(england.reason, /future building-control notice\/application and commencement events/)
    assert.equal(siteControl.disposition, 'RECLASSIFIED_FUTURE_DUE')
    assert.match(siteControl.reason, /instrumented control/)
  })

  test('resolves high-level physical access at screening while retaining downstream legal and private-rights boundaries', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    const access = result.records.find((record) => record.blockerId === 'NON_PLANNING:DPL11-COV-ACCESS-STATUS')
    assert.ok(access)
    assert.equal(access.disposition, 'RESOLVED_EXISTING_AUTHORITY')
    assert.match(access.reason, /existing front-garden\/front-door access and a dropped kerb/)
    assert.match(access.reason, /Private rights and exact highway adoption remain explicitly future\/downstream/)
  })

  test('keeps planning judgements typed as authority work rather than repackaging them as surveys', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    const authorityRecords = result.records.filter((record) => record.disposition === 'UNRESOLVED_AUTHORITY')
    assert.equal(authorityRecords.length, 3)
    assert.ok(authorityRecords.every((record) => record.authorityClass !== null))
    assert.ok(authorityRecords.every((record) => record.evidenceClass === null))
  })

  test('keeps high-level flood screening narrow and does not pre-authorize modelling or drainage design', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    const flood = result.records.find((record) => record.blockerId === 'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER')
    assert.ok(flood)
    assert.equal(flood.disposition, 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE')
    assert.equal(flood.evidenceClass, 'EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN')
    assert.match(flood.reason, /not a flood-risk assessment, modelling exercise or drainage design/)
  })

  test('preserves proof boundaries and commissions nothing', () => {
    const result = composeDPLT8LennardSubstantiveDisposition()
    assert.equal(result.result, 'SUBSTANTIVE_FRONTIER_CLASSIFIED_MINIMUM_EVIDENCE_DEFINED')
    assert.deepEqual(result.proofBoundary, {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'NO',
      evidenceCommissioned: 'NO',
      legalBoundaryDetermined: 'NO',
      planningDetermination: 'NO',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and emits the exact minimum frontier', () => {
    const first = composeDPLT8LennardSubstantiveDisposition()
    const second = composeDPLT8LennardSubstantiveDisposition()
    assert.equal(second.authorityEvidenceFingerprint, first.authorityEvidenceFingerprint)
    assert.equal(second.candidateFingerprint, first.candidateFingerprint)
    assert.equal(second.analysisGeometryFingerprint, first.analysisGeometryFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)
    assert.ok(first.records.every((record) => /^[a-f0-9]{64}$/.test(record.fingerprint)))

    console.log('DPL-T8-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      authorityEvidenceFingerprint: first.authorityEvidenceFingerprint,
      candidateFingerprint: first.candidateFingerprint,
      analysisGeometryFingerprint: first.analysisGeometryFingerprint,
      countsByDisposition: first.countsByDisposition,
      sideSpaceScreening: first.sideSpaceScreening,
      survivingEvidenceClasses: first.survivingEvidenceClasses,
      survivingAuthorityClasses: first.survivingAuthorityClasses,
      dueNowUnresolvedBlockerIds: first.dueNowUnresolvedBlockerIds,
      futureDueBlockerIds: first.futureDueBlockerIds,
      resolvedBlockerIds: first.resolvedBlockerIds,
      recordFingerprints: first.records.map((record) => ({ blockerId: record.blockerId, fingerprint: record.fingerprint }))
    }))
  })
})
