import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15HRp007,
  DPL15H_EXPECTED_PARENT,
  DPL15H_PATH,
  DPL15H_RESULT,
  validateDPL15H
} from './dpl15hRp007.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15H_PATH, 'utf8')) as Record<string, unknown>
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15H binds the exact DPL-15G parent and RP-007 identity', () => {
  const validated = validateDPL15H(raw())
  const parent = validated.parent as Record<string, unknown>
  const identity = validated.controlledIdentity as Record<string, unknown>
  assert.equal(parent.resultFingerprint, DPL15H_EXPECTED_PARENT)
  assert.equal(identity.applicationRef, '25/03774/FUL')
  assert.equal(identity.uprn, '10095497120')
})

test('DPL-15H records five bounded no-spend acquisition attempts', () => {
  const validated = validateDPL15H(raw())
  const attempts = validated.acquisitionAttempts as Record<string, unknown>[]
  assert.equal(attempts.length, 5)
  assert.equal(new Set(attempts.map((attempt) => attempt.id)).size, 5)
  assert.equal(attempts.find((attempt) => attempt.id === '15H-A01')?.result, 'DOCUMENT_BYTES_NOT_RECOVERED')
  assert.equal(attempts.find((attempt) => attempt.id === '15H-A03')?.result, 'EA_DTM_BYTES_NOT_BOUND_TO_CONTROLLED_SITE_EXTENT')
})

test('DPL-15H leaves RP-007 at exactly one of six readiness dimensions', () => {
  const result = composeDPL15HRp007()
  assert.equal(result.result, DPL15H_RESULT)
  assert.equal(result.satisfiedCount, 1)
  assert.equal(result.residualCount, 5)
  assert.equal(result.candidateAuthoringReady, false)
  const validated = validateDPL15H(raw())
  const readiness = validated.readiness as Record<string, unknown>[]
  assert.equal(readiness.find((entry) => entry.dimension === 'R6_SITE_IDENTITY_COHERENCE')?.state, 'SATISFIED')
  assert.equal(readiness.filter((entry) => entry.state === 'NOT_SATISFIED').length, 5)
})

test('DPL-15H does not promote indexed documents, postcode elevation or applicant geometry', () => {
  const validated = validateDPL15H(raw())
  const boundary = validated.proofBoundary as Record<string, unknown>
  assert.equal(boundary.marketingGeometryAsAuthority, 'PROHIBITED')
  assert.equal(boundary.applicantProposalTransfer, 'PROHIBITED')
  assert.equal(boundary.planningRedLineAsLegalTitle, 'PROHIBITED')
  assert.equal(boundary.titleIndexAsDeterminedBoundary, 'PROHIBITED')
  assert.equal(boundary.narrativeSteepnessAsDatum, 'PROHIBITED')
  assert.equal(boundary.referenceHouseCandidate, 'NOT_AUTHORISED')
})

test('DPL-15H deliberately hands the next bounded test to RP-008', () => {
  const validated = validateDPL15H(raw())
  const disposition = validated.nextDisposition as Record<string, unknown>
  assert.equal(disposition.rp007, 'HOLD_AT_EXTERNAL_OR_PORTAL_CONTROLLED_SPATIAL_EVIDENCE_BOUNDARY')
  assert.equal(disposition.rp008, 'EXECUTE_BOUNDED_NO_SPEND_TRANSPORT_TEST_NEXT')
  assert.match(String(validated.nextPacket), /DPL-15I.*RP-008/)
})

test('DPL-15H fails closed if a residual dimension is promoted without changing evidence', () => {
  const changed = clone(raw())
  const readiness = changed.readiness as Record<string, unknown>[]
  readiness.find((entry) => entry.dimension === 'R3_REAL_ORIENTATION_FRAME')!.state = 'SATISFIED'
  assert.throws(() => validateDPL15H(changed), /readiness state drift/)
})

test('DPL-15H semantic identity is ordering-neutral but evidence-sensitive', () => {
  const baseline = composeDPL15HRp007()
  const reordered = raw()
  reordered.acquisitionAttempts = [...(reordered.acquisitionAttempts as Record<string, unknown>[])].reverse().map((attempt) => ({
    ...attempt,
    observed: [...(attempt.observed as string[])].reverse()
  }))
  reordered.readiness = [...(reordered.readiness as Record<string, unknown>[])].reverse().map((entry) => ({
    ...entry,
    evidenceRefs: [...(entry.evidenceRefs as string[])].reverse()
  }))
  reordered.satisfiedDimensions = [...(reordered.satisfiedDimensions as string[])].reverse()
  reordered.residualDimensions = [...(reordered.residualDimensions as string[])].reverse()
  assert.equal(composeDPL15HRp007(reordered).resultFingerprint, baseline.resultFingerprint)

  const changed = clone(raw())
  const attempts = changed.acquisitionAttempts as Record<string, unknown>[]
  attempts[0].authorityBoundary = `${String(attempts[0].authorityBoundary)} Material mutation.`
  assert.notEqual(composeDPL15HRp007(changed).resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15H emits one deterministic frozen line', () => {
  const result = composeDPL15HRp007()
  console.log(`DPL-15H-FROZEN ${JSON.stringify(result)}`)
})
