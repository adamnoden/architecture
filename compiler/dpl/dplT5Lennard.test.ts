import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import {
  compileDPLT5LennardRealControlCase,
  DPL_T5_BROMLEY_TARGET_ID,
  DPL_T5_CANDIDATE_ID,
  DPL_T5_CONTROL_ID,
  DPL_T5_LONDON_TARGET_ID,
  DPL_T5_MANIFEST_PATH,
  DPL_T5_VERIFICATION_FINGERPRINT,
  loadDPLT5Manifest,
  validateDPLT5Manifest
} from './dplT5Lennard.js'

const rawManifest = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPL_T5_MANIFEST_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const finding = (
  result: ReturnType<typeof compileDPLT5LennardRealControlCase>,
  clauseId: string
) => {
  const match = result.ledger.candidateConformance?.findings.find((item) => item.clauseId === clauseId)
  assert.ok(match, `Expected candidate conformance finding ${clauseId}`)
  return match
}

describe('DPL-T5 Lennard real-control runtime assembly', () => {
  test('validates a real-control manifest without synthetic claim laundering', () => {
    const manifest = loadDPLT5Manifest()
    assert.equal(manifest.controlId, DPL_T5_CONTROL_ID)
    assert.equal(manifest.controlKind, 'INSTRUMENTED_REAL_CONTROL')
    assert.equal(manifest.sampleMembership, 'EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE')
    assert.equal(manifest.claims.length, 17)
    assert.ok(manifest.claims.every((claim) => claim.id.startsWith('LNR-C')))
    assert.ok(manifest.claims.every((claim) => !claim.id.startsWith('RS-')))
    assert.ok(manifest.claims.every((claim) => claim.coverageFamilyRefs.length > 0))
    assert.equal(manifest.candidate.id, DPL_T5_CANDIDATE_ID)
    assert.equal(manifest.candidate.verificationResultFingerprint, DPL_T5_VERIFICATION_FINGERPRINT)
  })

  test('keeps the instrumented control out of the empirical DPL-14/DPL-16 corpus', () => {
    const corpus = JSON.parse(readFileSync('project/dpl/sites/corpus-1-index.json', 'utf8')) as {
      sites: readonly { id: string }[]
    }
    assert.equal(corpus.sites.some((site) => site.id === DPL_T5_CONTROL_ID), false)
    assert.equal(corpus.sites.length, 8)
  })

  test('composes the verified candidate through current England/London/Bromley runtime authority', () => {
    const result = compileDPLT5LennardRealControlCase()
    assert.equal(result.readiness, 'REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED')
    assert.equal(result.candidateVerificationFingerprint, DPL_T5_VERIFICATION_FINGERPRINT)
    assert.equal(result.ledger.site.id, DPL_T5_CONTROL_ID)
    assert.equal(result.ledger.site.borough, 'Bromley')
    assert.ok(result.runtime.targetIds.includes(DPL_T5_LONDON_TARGET_ID))
    assert.ok(result.runtime.targetIds.includes(DPL_T5_BROMLEY_TARGET_ID))
    assert.ok(result.runtime.targetIds.includes('ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'))
    assert.equal(result.runtime.targetIds.length, 4)
    assert.deepEqual(result.runtime.interfaceIds, [
      'DPL-08B-GROUND-DATUM-PLINTH-APPROACH',
      'DPL-08C-FOUL-SURFACE-SITE-WATER'
    ])
  })

  test('preserves T4 candidate conformance while leaving site-interface freedoms open', () => {
    const result = compileDPLT5LennardRealControlCase()
    for (const clauseId of ['RH-I02', 'RH-PROT-01', 'RH-PROT-04', 'RH-PROT-06', 'RH-V02']) {
      assert.equal(finding(result, clauseId).result, 'CONFORMS', clauseId)
    }
    for (const clauseId of ['RH-SI02', 'RH-SI05']) {
      const item = finding(result, clauseId)
      assert.equal(item.result, 'OPEN', clauseId)
      assert.equal(item.checkKind, 'EXTERNAL_OR_UNMODELLED', clauseId)
    }
    assert.equal(result.runtime.candidateConformanceCounts.NON_CONFORMING, 0)
    assert.equal(result.runtime.candidateConformanceCounts.REQUIRES_REFERENCE_HOUSE_REVISION, 0)
    assert.ok(result.runtime.candidateConformanceCounts.OPEN >= 2)
  })

  test('exposes missing candidate-specific policy/evidence inputs instead of importing applicant facts', () => {
    const result = compileDPLT5LennardRealControlCase()
    assert.ok(result.runtime.obligationResultCounts.UNRESOLVED > 0)
    assert.equal(result.runtime.obligationResultCounts.FAIL, 0)
    assert.equal(result.runtime.obligationResultCounts.EXTERNALLY_DISCHARGED, 0)
    assert.ok(result.runtime.unresolvedInputs.includes('bedroomCount'))
    assert.ok(result.runtime.unresolvedInputs.includes('bedspaceCount'))
    assert.ok(result.runtime.unresolvedInputs.includes('policyDefinedGIA'))
    assert.ok(result.runtime.unresolvedInputs.includes('builtInStorageArea'))
    assert.ok(result.runtime.unresolvedInputCount >= 4)
    assert.ok(result.coverage.unknownOrPartialClaimIds.includes('LNR-C16'))
  })

  test('maps every real claim to current owner coverage authority and preserves conclusion boundaries', () => {
    const result = compileDPLT5LennardRealControlCase()
    assert.equal(result.coverage.claimCount, 17)
    assert.equal(result.coverage.mappedClaimCount, 17)
    assert.ok(result.coverage.coverageFamilyCount >= 10)
    assert.ok(result.coverage.coverageFamilyRefs.every((ref) => ref.startsWith('PLANNING:') || ref.startsWith('NON_PLANNING:')))
    assert.deepEqual(result.proofBoundary, {
      wholeSiteCompatibilityConclusion: 'NOT_ADMITTED',
      wholeSiteIncompatibilityConclusion: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      candidateSelection: 'ALREADY_AUTHORED_DPL_T3_AND_VERIFIED_DPL_T4',
      siteInterfaceDischarge: 'NOT_INFERRED_FROM_PLACEMENT',
      corpusMembership: 'EXCLUDED_FROM_DPL14_AND_DPL16_SAMPLE'
    })
    assert.equal(result.ledger.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
    assert.equal(result.ledger.proofBoundary.routeExhaustion, 'NOT_IMPLEMENTED')
  })

  test('is deterministic under repeated composition and exposes the exact runtime identities', () => {
    const first = compileDPLT5LennardRealControlCase()
    const second = compileDPLT5LennardRealControlCase()
    assert.equal(second.manifestFingerprint, first.manifestFingerprint)
    assert.equal(second.sourceSetFingerprint, first.sourceSetFingerprint)
    assert.equal(second.ledger.caseIdentity.fingerprint, first.ledger.caseIdentity.fingerprint)
    assert.equal(second.ledger.resultFingerprint, first.ledger.resultFingerprint)
    assert.equal(second.resultFingerprint, first.resultFingerprint)
    assert.match(first.resultFingerprint, /^[a-f0-9]{64}$/)

    console.log('DPL-T5-FROZEN', JSON.stringify({
      manifestFingerprint: first.manifestFingerprint,
      sourceSetFingerprint: first.sourceSetFingerprint,
      deploymentCaseFingerprint: first.ledger.caseIdentity.fingerprint,
      deploymentResultFingerprint: first.ledger.resultFingerprint,
      resultFingerprint: first.resultFingerprint,
      runtime: first.runtime,
      coverage: first.coverage
    }))
  })

  test('fails closed on synthetic vocabulary, corpus admission drift and source identity drift', () => {
    const synthetic = rawManifest()
    const syntheticClaims = synthetic.claims as Record<string, unknown>[]
    syntheticClaims[0] = { ...syntheticClaims[0], id: 'RS-PARCEL-01' }
    assert.throws(() => validateDPLT5Manifest(synthetic), /real-control LNR-C## vocabulary/)

    const admitted = rawManifest()
    admitted.sampleMembership = 'INCLUDED'
    assert.throws(() => validateDPLT5Manifest(admitted), /sampleMembership must equal EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE/)

    const stale = rawManifest()
    const sources = stale.sources as Record<string, unknown>[]
    sources[0] = { ...sources[0], gitBlobSha: '0000000000000000000000000000000000000000' }
    assert.throws(() => validateDPLT5Manifest(stale), /source S1 drifted/)
  })

  test('refuses to manufacture proposal facts beyond the one controlled storey mapping', () => {
    const manifest = loadDPLT5Manifest()
    assert.deepEqual(Object.keys(manifest.runtimeProposalFacts), ['dwellingStoreys'])
    assert.equal(manifest.runtimeProposalFacts.dwellingStoreys.value, 2)
    assert.equal(manifest.claims.find((claim) => claim.id === 'LNR-C16')?.evidenceState, 'PARTIALLY_EVIDENCED_NOT_POLICY_MEASURED')

    const changed = clone(rawManifest())
    const facts = changed.runtimeProposalFacts as Record<string, unknown>
    const storeys = facts.dwellingStoreys as Record<string, unknown>
    storeys.value = 3
    assert.throws(() => validateDPLT5Manifest(changed), /dwellingStoreys.value must equal 2/)
  })
})
