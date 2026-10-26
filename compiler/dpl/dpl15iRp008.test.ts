import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15IRp008,
  DPL15I_EXPECTED_PARENT,
  DPL15I_PATH,
  DPL15I_RESULT,
  validateDPL15I
} from './dpl15iRp008.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15I_PATH, 'utf8')) as Record<string, unknown>
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15I binds the exact DPL-15H parent and RP-008 application identity', () => {
  const validated = validateDPL15I(raw())
  const parent = validated.parent as Record<string, unknown>
  const identity = validated.controlledIdentity as Record<string, unknown>
  assert.equal(parent.resultFingerprint, DPL15I_EXPECTED_PARENT)
  assert.equal(identity.applicationRef, '24/00124/FUL')
  assert.equal(identity.corpusRole, 'LOWER_PATHOLOGY_ONE_HOUSE_CONTROL')
})

test('DPL-15I records five bounded acquisition attempts', () => {
  const validated = validateDPL15I(raw())
  const attempts = validated.acquisitionAttempts as Record<string, unknown>[]
  assert.equal(attempts.length, 5)
  assert.equal(new Set(attempts.map((attempt) => attempt.id)).size, 5)
  assert.equal(attempts.find((attempt) => attempt.id === '15I-A01')?.result, 'APPLICATION_IDENTITY_CONFIRMED_SOURCE_GEOMETRY_BYTES_NOT_RECOVERED')
  assert.equal(attempts.find((attempt) => attempt.id === '15I-A03')?.result, 'DATUM_NOT_BOUND_TO_CONTROLLED_SITE_EXTENT')
})

test('DPL-15I leaves RP-008 at exactly one of six readiness dimensions', () => {
  const result = composeDPL15IRp008()
  assert.equal(result.result, DPL15I_RESULT)
  assert.equal(result.satisfiedCount, 1)
  assert.equal(result.residualCount, 5)
  assert.equal(result.candidateAuthoringReady, false)
  const validated = validateDPL15I(raw())
  const readiness = validated.readiness as Record<string, unknown>[]
  assert.equal(readiness.find((entry) => entry.dimension === 'R6_SITE_IDENTITY_COHERENCE')?.state, 'SATISFIED')
  assert.equal(readiness.filter((entry) => entry.state === 'NOT_SATISFIED').length, 5)
})

test('DPL-15I preserves all authority firewalls', () => {
  const validated = validateDPL15I(raw())
  const identity = validated.controlledIdentity as Record<string, unknown>
  const boundary = validated.proofBoundary as Record<string, unknown>
  assert.equal(identity.marketingGeometryUse, 'PROHIBITED_FOR_FIT_NO_FIT')
  assert.equal(boundary.marketingGeometryAsAuthority, 'PROHIBITED')
  assert.equal(boundary.applicantProposalTransfer, 'PROHIBITED')
  assert.equal(boundary.planningRedLineAsLegalTitle, 'PROHIBITED')
  assert.equal(boundary.titleIndexAsDeterminedBoundary, 'PROHIBITED')
  assert.equal(boundary.postcodeElevationAsDatum, 'PROHIBITED')
  assert.equal(boundary.referenceHouseCandidate, 'NOT_AUTHORISED')
})

test('DPL-15I closes only the bounded no-spend transport search, not generic route exhaustion', () => {
  const result = composeDPL15IRp008()
  assert.equal(result.closeNoSpendCorpusTransportSearch, true)
  const validated = validateDPL15I(raw())
  const disposition = validated.programmeDisposition as Record<string, unknown>
  const boundary = validated.proofBoundary as Record<string, unknown>
  assert.equal(disposition.noSpendCorpusTransportSearch, 'CLOSE_AFTER_DPL15I')
  assert.equal(disposition.nextAction, 'AUTHOR_PROGRAMME_LEVEL_DPL15_EXTERNAL_EVIDENCE_BOUNDARY')
  assert.equal(boundary.routeExhaustion, 'NOT_CLAIMED_BEYOND_BOUNDED_NO_SPEND_CORPUS_TRANSPORT_EXPERIMENT')
  assert.match(String(validated.nextPacket), /DPL-15J.*external-evidence boundary/i)
})

test('DPL-15I fails closed if a residual dimension is promoted without evidence change', () => {
  const changed = clone(raw())
  const readiness = changed.readiness as Record<string, unknown>[]
  readiness.find((entry) => entry.dimension === 'R3_REAL_ORIENTATION_FRAME')!.state = 'SATISFIED'
  assert.throws(() => validateDPL15I(changed), /readiness state drift/)
})

test('DPL-15I semantic identity is ordering-neutral but evidence-sensitive', () => {
  const baseline = composeDPL15IRp008()
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
  assert.equal(composeDPL15IRp008(reordered).resultFingerprint, baseline.resultFingerprint)

  const changed = clone(raw())
  const attempts = changed.acquisitionAttempts as Record<string, unknown>[]
  attempts[0].authorityBoundary = `${String(attempts[0].authorityBoundary)} Material mutation.`
  assert.notEqual(composeDPL15IRp008(changed).resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15I emits one deterministic frozen line', () => {
  const result = composeDPL15IRp008()
  console.log(`DPL-15I-FROZEN ${JSON.stringify(result)}`)
})
