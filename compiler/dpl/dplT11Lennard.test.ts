import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT10LennardNoCostExecution } from './dplT10Lennard.js'
import {
  composeDPLT11LennardNoSpendEvidence,
  DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT
} from './dplT11Lennard.js'

const EXPECTED = [
  'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
  'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
  'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
].sort((a, b) => a.localeCompare(b))

describe('DPL-T11 Lennard no-spend evidence exhaustion', () => {
  test('binds exactly to the landed T10 three-dependency frontier', () => {
    const t10 = composeDPLT10LennardNoCostExecution()
    const result = composeDPLT11LennardNoSpendEvidence()
    assert.equal(t10.resultFingerprint, DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT)
    assert.equal(result.t10ResultFingerprint, t10.resultFingerprint)
    assert.equal(result.inputDependencyCount, 3)
    assert.equal(result.activeDependencyCount, 3)
    assert.deepEqual([...result.activeDependencyClasses].sort((a, b) => a.localeCompare(b)), EXPECTED)
    assert.deepEqual(result.dependenciesClosedAtT11, [])
  })

  test('makes exactly two external packages acquisition-ready without commissioning them', () => {
    const result = composeDPLT11LennardNoSpendEvidence()
    assert.deepEqual([...result.externalAcquisitionReady].sort((a, b) => a.localeCompare(b)), [
      'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    ])
    assert.equal(result.externalAcquisitionReady.length, 2)
    assert.ok(result.records.every((record) => record.externallyCommissioned === false))
    assert.equal(result.proofBoundary.externalCommissioning, 'NO')
    assert.equal(result.proofBoundary.externalContact, 'NO')
    assert.equal(result.proofBoundary.spendAuthorised, 'NO')
  })

  test('keeps flood as competent no-cost public recovery rather than consultant scope', () => {
    const result = composeDPLT11LennardNoSpendEvidence()
    assert.deepEqual(result.noCostPublicRecoveryPending, ['EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'])
    const flood = result.records.find((record) => record.dependencyClass === 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY')
    assert.ok(flood)
    assert.equal(flood.state, 'NO_COST_PUBLIC_RECOVERY_TECHNICALLY_BLOCKED')
    assert.equal(flood.externalAcquisitionReady, false)
    assert.equal(flood.acquisitionPackPath, null)
    assert.match(flood.reason, /does not justify flood-consultant procurement/)
  })

  test('does not promote planning drawings into the measured geometry return', () => {
    const result = composeDPLT11LennardNoSpendEvidence()
    assert.equal(result.publicGeometryDisposition, 'SUPPLEMENTAL_CONTEXT_ONLY_FIELD_RETURN_STILL_REQUIRED')
    const geometry = result.records.find((record) =>
      record.dependencyClass === 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
    )
    assert.ok(geometry)
    assert.equal(geometry.state, 'ACQUISITION_READY_EXTERNAL_MEASUREMENT')
    assert.match(geometry.reason, /planning-purpose limitations/)
    assert.match(geometry.reason, /centimetre-scale physical-control return/)
    assert.ok(geometry.acquisitionPackPath?.endsWith('dpl-t11-lennard-geometry-acquisition-pack.md'))
  })

  test('reuses RH-11 without inventing a second generic structural scope', () => {
    const result = composeDPLT11LennardNoSpendEvidence()
    const structural = result.records.find((record) => record.dependencyClass === 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW')
    assert.ok(structural)
    assert.equal(structural.state, 'ACQUISITION_READY_EXTERNAL_JUDGEMENT')
    assert.match(structural.reason, /RH-11 plus the Lennard addendum/)
    assert.match(structural.reason, /no detailed-design or GI default scope/)
    assert.ok(structural.acquisitionPackPath?.endsWith('dpl-t11-lennard-structural-acquisition-pack.md'))
  })

  test('preserves all proof boundaries', () => {
    const result = composeDPLT11LennardNoSpendEvidence()
    assert.deepEqual(result.proofBoundary, {
      externalCommissioning: 'NO',
      externalContact: 'NO',
      spendAuthorised: 'NO',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'NO',
      structuralAdequacy: 'NOT_CLAIMED',
      statutoryPlanningDetermination: 'NO',
      legalBoundaryDetermined: 'NO',
      floodConclusion: 'NOT_RESOLVED',
      dpl16: 'HELD'
    })
  })

  test('is deterministic and freezes the acquisition-ready frontier', () => {
    const first = composeDPLT11LennardNoSpendEvidence()
    const second = composeDPLT11LennardNoSpendEvidence()
    assert.equal(second.evidenceFingerprint, first.evidenceFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.evidenceFingerprint, /^[a-f0-9]{64}$/)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)
    assert.ok(first.records.every((record) => /^[a-f0-9]{64}$/.test(record.fingerprint)))

    console.log('DPL-T11-FROZEN', JSON.stringify({
      resultFingerprint: first.resultFingerprint,
      evidenceFingerprint: first.evidenceFingerprint,
      activeDependencyClasses: first.activeDependencyClasses,
      externalAcquisitionReady: first.externalAcquisitionReady,
      noCostPublicRecoveryPending: first.noCostPublicRecoveryPending,
      dependenciesClosedAtT11: first.dependenciesClosedAtT11,
      publicGeometryDisposition: first.publicGeometryDisposition,
      recordFingerprints: first.records.map((record) => ({
        dependencyClass: record.dependencyClass,
        fingerprint: record.fingerprint
      }))
    }))
  })
})
