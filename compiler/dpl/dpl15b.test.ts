import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15BPublicEvidence,
  derivePublicGeometryReadiness,
  DPL15B_SUPPLEMENT_PATH,
  sourceRelationshipRank,
  validateDPL15BSupplement,
  type DPL15BSource
} from './public-evidence-readiness.js'

const rawSupplement = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPL15B_SUPPLEMENT_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15B selects first-party Croydon decision authority over the conflicting third-party index', () => {
  const result = composeDPL15BPublicEvidence()
  assert.equal(result.selectedDecisionSourceId, 'E1')
  assert.equal(result.selectedDecisionAuthorityRank, sourceRelationshipRank('FIRST_PARTY'))
  assert.equal(result.supplement.decisionStatusResolution.selectedStatus, 'PERMISSION_GRANTED')
  assert.equal(result.supplement.decisionStatusResolution.selectedDecisionDate, '2025-04-11')
  assert.deepEqual(result.supplement.decisionStatusResolution.conflictingSourceIds, ['E4'])

  const e1 = result.supplement.sources.find((source) => source.id === 'E1')
  const e4 = result.supplement.sources.find((source) => source.id === 'E4')
  assert.equal(e1?.sourceRelationship, 'FIRST_PARTY')
  assert.equal(e4?.sourceRelationship, 'THIRD_PARTY')
  assert.ok(sourceRelationshipRank(e1!.sourceRelationship) > sourceRelationshipRank(e4!.sourceRelationship))
})

test('DPL-15B keeps mirrored applicant material below first-party decision authority', () => {
  const result = composeDPL15BPublicEvidence()
  for (const id of ['E2', 'E3']) {
    const source = result.supplement.sources.find((entry) => entry.id === id)
    assert.equal(source?.sourceRelationship, 'MIRROR')
    assert.equal(source?.authorityClass, 'PUBLIC_DOCUMENT_MIRROR_APPLICANT_STATEMENT')
    assert.ok(sourceRelationshipRank(source!.sourceRelationship) < result.selectedDecisionAuthorityRank)
  }
})

test('DPL-15B derives NOT_READY because no dimensioned planning geometry was acquired', () => {
  const result = composeDPL15BPublicEvidence()
  assert.equal(result.geometryReadiness, 'NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT')
  assert.deepEqual(result.dimensionedGeometrySourceIds, [])
  assert.ok(result.supplement.geometryReadiness.missing.includes('controlled dimensioned site/block plan'))
  assert.equal(result.supplement.geometryReadiness.candidateAuthoring, 'NOT_AUTHORISED')
})

test('DPL-15B contextual red-line metadata cannot become dimensioned geometry', () => {
  const result = composeDPL15BPublicEvidence()
  const fire = result.supplement.sources.find((source) => source.id === 'E3')
  assert.equal(fire?.geometryAuthority, 'CONTEXT_GEOMETRY_ONLY')
  assert.ok(fire?.recoveredFacts.some((fact) => fact.includes('red application boundary')))
  assert.ok(fire?.limitations.some((limitation) => limitation.includes('No explicit scale/dimensions')))
})

test('DPL-15B readiness only becomes READY with dimensioned evidence and no named geometry gaps', () => {
  const base = composeDPL15BPublicEvidence()
  const fakeDimensioned: DPL15BSource = {
    ...base.supplement.sources[1],
    id: 'TEST-DIMENSIONED',
    geometryAuthority: 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
  }
  assert.equal(
    derivePublicGeometryReadiness([...base.supplement.sources, fakeDimensioned], []),
    'SCREENING_CANDIDATE_AUTHORING_READY'
  )
  assert.equal(
    derivePublicGeometryReadiness([...base.supplement.sources, fakeDimensioned], ['explicit access geometry missing']),
    'NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT'
  )
})

test('DPL-15B rejects a lower-authority selected decision source', () => {
  const mutated = rawSupplement()
  const decision = mutated.decisionStatusResolution as Record<string, unknown>
  decision.selectedSourceId = 'E4'
  decision.conflictingSourceIds = ['E1']
  assert.throws(
    () => validateDPL15BSupplement(mutated),
    /controlled decision status must be selected from first-party authority/
  )
})

test('DPL-15B source/evidence ordering is identity-neutral', () => {
  const baseline = composeDPL15BPublicEvidence()
  const reordered = rawSupplement()
  reordered.sources = [...(reordered.sources as Record<string, unknown>[])].reverse().map((source) => ({
    ...source,
    recoveredFacts: [...(source.recoveredFacts as string[])].reverse(),
    limitations: [...(source.limitations as string[])].reverse()
  }))
  const next = composeDPL15BPublicEvidence(reordered)
  assert.equal(next.evidenceFingerprint, baseline.evidenceFingerprint)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15B material source mutation changes evidence identity', () => {
  const baseline = composeDPL15BPublicEvidence()
  const changed = rawSupplement()
  const sources = changed.sources as Record<string, unknown>[]
  const e2 = sources.find((source) => source.id === 'E2') as Record<string, unknown>
  e2.documentIdentity = 'Materially changed document identity'
  const next = composeDPL15BPublicEvidence(changed)
  assert.notEqual(next.evidenceFingerprint, baseline.evidenceFingerprint)
  assert.notEqual(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15B preserves the external-evidence and no-conclusion boundary', () => {
  const result = composeDPL15BPublicEvidence()
  assert.ok(Object.values(result.supplement.unchangedExternalEvidenceBoundary).every((state) => state === 'UNRESOLVED'))
  assert.deepEqual(result.supplement.resultBoundary, {
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    referenceHouseCandidate: 'NOT_AUTHORED',
    referenceHouseMutation: 'NOT_AUTHORISED',
    planningLikelihood: 'NOT_CLAIMED',
    purchaseRecommendation: 'NOT_CLAIMED'
  })
})

test('DPL-15B supplement remains a separate layer over the landed DPL-15A baseline', () => {
  const result = composeDPL15BPublicEvidence()
  assert.equal(result.supplement.baseline.dpl15aMergeCommit, '732dabfca881cbb43b35a109d861e8921bbb0122')
  assert.equal(result.supplement.baseline.manifestPath, 'project/dpl/sites/dpl-rp-003-trial-manifest-v01.json')
  assert.equal(typeof result.baselineManifestFingerprint, 'string')
  assert.equal(result.baselineManifestFingerprint.length, 64)
})
