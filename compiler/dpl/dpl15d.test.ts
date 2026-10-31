import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15DRP004Readiness,
  deriveRP004ReadinessResult,
  DPL15D_PATH,
  validateDPL15DRecord
} from './rp004-document-readiness.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15D_PATH, 'utf8')) as Record<string, unknown>

test('DPL-15D derives the document-retrieval boundary rather than inventing RP-004 geometry', () => {
  const result = composeDPL15DRP004Readiness()
  assert.equal(result.result, 'RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY')
  assert.deepEqual(result.dimensionedSourceIds, [])
  assert.equal(result.unretrievedDocumentTargetIds.length, 5)
  assert.equal(result.record.dimensionState.R6_SITE_IDENTITY_COHERENCE, 'SATISFIED')
  assert.equal(Object.values(result.record.dimensionState).filter((state) => state === 'NOT_SATISFIED').length, 5)
})

test('DPL-15D keeps first-party application evidence distinct from third-party document indexing', () => {
  const result = composeDPL15DRP004Readiness()
  assert.equal(result.record.sources.find((source) => source.id === 'H1')?.relationship, 'FIRST_PARTY')
  assert.equal(result.record.sources.find((source) => source.id === 'H2')?.relationship, 'FIRST_PARTY')
  const h3 = result.record.sources.find((source) => source.id === 'H3')
  assert.equal(h3?.relationship, 'THIRD_PARTY')
  assert.equal(h3?.geometryAuthority, 'NO_GEOMETRY_AUTHORITY')
  assert.ok(h3?.recoveredFacts.some((fact) => fact.includes('20 documents')))
})

test('DPL-15D keeps retrieval state separate from geometry authority', () => {
  const result = composeDPL15DRP004Readiness()
  const h4 = result.record.sources.find((source) => source.id === 'H4')
  assert.equal(h4?.retrievalState, 'INDEXED_NOT_DOCUMENT_RETRIEVABLE')
  assert.equal(h4?.geometryAuthority, 'NO_GEOMETRY_AUTHORITY')
})

test('DPL-15D requires all six dimensions plus dimensioned evidence for READY', () => {
  const result = composeDPL15DRP004Readiness()
  const allReady = Object.fromEntries(Object.keys(result.record.dimensionState).map((key) => [key, 'SATISFIED'])) as typeof result.record.dimensionState
  const dimensionedSource = {
    ...result.record.sources[0],
    id: 'TEST-DIMENSIONED',
    geometryAuthority: 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY' as const
  }
  assert.equal(
    deriveRP004ReadinessResult(allReady, [...result.record.sources, dimensionedSource], result.record.documentTargets),
    'RP004_SCREENING_CANDIDATE_AUTHORING_READY'
  )
})

test('DPL-15D routes inspectable but inadequate evidence to PUBLIC_GEOMETRY_INSUFFICIENT', () => {
  const result = composeDPL15DRP004Readiness()
  const sources = result.record.sources.map((source) => ({
    ...source,
    retrievalState: 'RECOVERED_AND_INSPECTABLE' as const
  }))
  const targets = result.record.documentTargets.map((target) => ({
    ...target,
    state: 'RECOVERED_AND_INSPECTABLE' as const
  }))
  assert.equal(
    deriveRP004ReadinessResult(result.record.dimensionState, sources, targets),
    'RP004_NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT'
  )
})

test('DPL-15D refuses document-count indexing as geometry authority', () => {
  const changed = raw()
  const sources = changed.sources as Record<string, unknown>[]
  const h3 = sources.find((source) => source.id === 'H3') as Record<string, unknown>
  h3.geometryAuthority = 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
  assert.throws(() => validateDPL15DRecord(changed), /document-count index cannot acquire geometry authority/)
})

test('DPL-15D ordering is identity-neutral and material mutation changes identity', () => {
  const baseline = composeDPL15DRP004Readiness()
  const reordered = raw()
  reordered.sources = [...(reordered.sources as Record<string, unknown>[])].reverse().map((source) => ({
    ...source,
    recoveredFacts: [...(source.recoveredFacts as string[])].reverse(),
    limitations: [...(source.limitations as string[])].reverse()
  }))
  reordered.documentTargets = [...(reordered.documentTargets as Record<string, unknown>[])].reverse()
  const next = composeDPL15DRP004Readiness(reordered)
  assert.equal(next.acquisitionFingerprint, baseline.acquisitionFingerprint)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)

  const changed = raw()
  const changedSources = changed.sources as Record<string, unknown>[]
  changedSources[0].limitations = [...(changedSources[0].limitations as string[]), 'Material mutation']
  const mutated = composeDPL15DRP004Readiness(changed)
  assert.notEqual(mutated.acquisitionFingerprint, baseline.acquisitionFingerprint)
})

test('DPL-15D leaves candidate, compatibility and DPL-16 authority held', () => {
  const result = composeDPL15DRP004Readiness()
  assert.deepEqual(result.record.proofBoundary, {
    referenceHouseCandidate: 'NOT_AUTHORED',
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    deploymentEnvelopeDpl16: 'HELD',
    marketingGeometryAuthority: 'FORBIDDEN',
    pixelDerivedMeasurement: 'FORBIDDEN'
  })
  assert.ok(Object.values(result.record.unchangedEvidenceBoundary).every((state) => state === 'UNRESOLVED'))
})
