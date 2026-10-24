import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15ATrial,
  DPL15A_EXPECTED_CLAIM_IDS,
  DPL15A_MANIFEST_PATH,
  validateDPL15AManifest
} from './real-site-trial.js'

const rawManifest = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPL15A_MANIFEST_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15A freezes the exact 15 real claims with distinct evidence states', () => {
  const result = composeDPL15ATrial()
  assert.equal(result.claimCount, 15)
  assert.equal(result.mappedClaimCount, 15)
  assert.deepEqual(result.manifest.claims.map((claim) => claim.id), DPL15A_EXPECTED_CLAIM_IDS)
  assert.deepEqual(result.evidenceStateCounts, {
    KNOWN_AT_SCREENING: 2,
    HISTORICAL_PUBLIC_RECORD: 1,
    EXTERNAL_PLANNING_DECISION_EVIDENCE: 2,
    EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE: 3,
    UNKNOWN_AT_ADMITTED_EVIDENCE: 2,
    UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION: 1,
    PARTIALLY_EVIDENCED_NOT_SURVEYED: 1,
    UNKNOWN: 3
  })
  assert.ok(result.manifest.claims.every((claim) => claim.coverageFamilyRefs.length > 0))
})

test('DPL-15A preserves historical evidence without promoting it to current physical truth', () => {
  const result = composeDPL15ATrial()
  const historical = result.manifest.claims.find((claim) => claim.id === 'RP003-C03')
  assert.equal(historical?.evidenceState, 'HISTORICAL_PUBLIC_RECORD')
  assert.equal(historical?.currentStateQualifier, 'UNKNOWN')

  const mutated = rawManifest()
  const claims = mutated.claims as Record<string, unknown>[]
  const c03 = claims.find((claim) => claim.id === 'RP003-C03') as Record<string, unknown>
  c03.currentStateQualifier = 'KNOWN_CURRENT'
  assert.throws(() => validateDPL15AManifest(mutated), /must keep current physical state UNKNOWN/)
})

test('DPL-15A refuses missing, duplicate and synthetic claim ids', () => {
  const missing = rawManifest()
  ;(missing.claims as unknown[]).pop()
  assert.throws(() => validateDPL15AManifest(missing), /exactly 15 RP003 claims/)

  const duplicate = rawManifest()
  const duplicateClaims = duplicate.claims as Record<string, unknown>[]
  duplicateClaims[14] = clone(duplicateClaims[0])
  assert.throws(() => validateDPL15AManifest(duplicate), /claim ids must be unique/)

  const synthetic = rawManifest()
  const syntheticClaims = synthetic.claims as Record<string, unknown>[]
  syntheticClaims[0].id = 'RS-PARCEL-01'
  assert.throws(() => validateDPL15AManifest(synthetic), /refuses synthetic claim id/)
})

test('DPL-15A validates every real-claim owner-family mapping against current authority', () => {
  const result = composeDPL15ATrial()
  assert.equal(result.coverageFamilyRefs.includes('PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY'), true)
  assert.equal(result.coverageFamilyRefs.includes('NON_PLANNING:DPL11-COV-SITE-CONTROL'), true)
  assert.equal(result.coverageFamilyRefs.includes('PLANNING:DPL10-COV-EXTERNAL-DETERMINATION-HISTORY-CONDITIONS'), true)

  const invalid = rawManifest()
  const claims = invalid.claims as Record<string, unknown>[]
  claims[0].coverageFamilyRefs = ['PLANNING:NOT-A-REAL-FAMILY']
  assert.throws(() => validateDPL15AManifest(invalid), /does not exist in current PLANNING authority/)
})

test('DPL-15A claim and mapping ordering are identity-neutral', () => {
  const baseline = composeDPL15ATrial()
  const reordered = rawManifest()
  const claims = reordered.claims as Record<string, unknown>[]
  reordered.claims = [...claims].reverse().map((claim) => ({
    ...claim,
    evidenceRefs: [...(claim.evidenceRefs as string[])].reverse(),
    coverageFamilyRefs: [...(claim.coverageFamilyRefs as string[])].reverse()
  }))
  reordered.sources = [...(reordered.sources as unknown[])].reverse()
  const next = composeDPL15ATrial(reordered)
  assert.equal(next.manifestFingerprint, baseline.manifestFingerprint)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15A material evidence or mapping mutation changes identity', () => {
  const baseline = composeDPL15ATrial()
  const changed = rawManifest()
  const claims = changed.claims as Record<string, unknown>[]
  const c06 = claims.find((claim) => claim.id === 'RP003-C06') as Record<string, unknown>
  c06.limitation = `${String(c06.limitation)} Material mutation.`
  const next = composeDPL15ATrial(changed)
  assert.notEqual(next.manifestFingerprint, baseline.manifestFingerprint)
  assert.notEqual(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15A refuses candidate authoring and names the missing real evidence', () => {
  const result = composeDPL15ATrial()
  assert.equal(result.candidateAuthoringState, 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY')
  assert.ok(result.candidateAuthoringMissingEvidence.length >= 5)
  assert.ok(result.candidateAuthoringMissingEvidence.some((entry) => entry.includes('boundary geometry')))
  assert.ok(result.candidateAuthoringMissingEvidence.some((entry) => entry.includes('topography')))
  assert.ok(result.candidateAuthoringMissingEvidence.some((entry) => entry.includes('access')))
  assert.ok(result.candidateAuthoringMissingEvidence.some((entry) => entry.includes('title/control')))
})

test('DPL-15A proves synthetic DPL-13B claim vocabulary is not reused', () => {
  const result = composeDPL15ATrial()
  assert.equal(result.directDPL13BReuse, 'NOT_ADMITTED_SYNTHETIC_CLAIM_VOCABULARY')
  assert.deepEqual(result.syntheticClaimIdIntersection, [])
  assert.equal(result.manifest.syntheticVocabularyBoundary.requiredNextAbstraction, 'REAL_CLAIM_TO_OWNER_FAMILY_ADAPTER_IF_EARNED')
})

test('DPL-15A preserves exact Croydon to London authority and no-conclusion boundary', () => {
  const result = composeDPL15ATrial()
  assert.deepEqual(result.manifest.planningAuthority, {
    strategicTargetId: 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20',
    localTargetId: 'CROYDON-LOCAL-PLANNING-2018-2026-10-21'
  })
  assert.deepEqual(result.proofBoundary, {
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    referenceHouseMutation: 'NOT_AUTHORISED',
    planningLikelihood: 'NOT_CLAIMED',
    purchaseRecommendation: 'NOT_CLAIMED'
  })
})
