import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { composeDPL15CCorpusReadiness } from './corpus-candidate-readiness.js'
import { composeDPLR1ControlReadiness } from './control-site-readiness.js'
import {
  composeDPLR2ControlCandidate,
  DPLR2_RESULT_PATH,
  validateDPLR2Result
} from './control-site-candidate.js'

const rawResult = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPLR2_RESULT_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-R2 binds a landed READY DPL-R1 parent', () => {
  const parent = composeDPLR1ControlReadiness()
  const result = composeDPLR2ControlCandidate()
  assert.equal(parent.readiness, 'CONTROL_SITE_CANDIDATE_AUTHORING_READY')
  assert.equal(result.parentReadiness.requiredResult, parent.readiness)
  assert.equal(result.parentReadinessFingerprint, parent.resultFingerprint)
})

test('DPL-R2 fails closed when controlled vector/coordinate geometry is not recovered', () => {
  const result = composeDPLR2ControlCandidate()
  assert.equal(result.geometryRecovery.state, 'NOT_RECOVERED_CONTROLLED_VECTOR_OR_COORDINATES')
  assert.equal(result.geometryRecovery.candidateAuthoringImplication, 'FAIL_CLOSED_NO_PLACEMENT_COORDINATES')
  assert.equal(result.candidate, null)
  assert.equal(result.result, 'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED')
})

test('DPL-R2 records only allowed geometry-recovery routes and explicit forbidden shortcuts', () => {
  const result = composeDPLR2ControlCandidate()
  assert.deepEqual(result.geometryAuthority.allowedRecoveryRoutes, [
    'EXACT_FIRST_PARTY_OR_FAITHFUL_SOURCE_OF_SAME_DRAWING_GEOMETRY',
    'EXPLICIT_DIMENSIONS_OR_COORDINATES_SAME_CONTROLLED_LINEAGE',
    'ORIGINAL_OR_VECTOR_PLANNING_DOCUMENT_GEOMETRY'
  ])
  assert.deepEqual(result.geometryAuthority.forbiddenRecoveryRoutes, [
    'APPROVED_REPLACEMENT_HOUSE_AS_REFERENCE_HOUSE_SURROGATE',
    'DIFFERENT_APPLICATION_GEOMETRY',
    'ESTATE_AGENT_OR_MARKETING_GEOMETRY',
    'SCREENSHOT_OR_RASTER_DISPLAY_PIXEL_MEASUREMENT',
    'WEB_MAP_PIXEL_MEASUREMENT'
  ])
})

test('DPL-R2 cannot author a candidate while geometry recovery remains failed', () => {
  const changed = rawResult()
  changed.candidate = { candidateId: 'fabricated' }
  assert.throws(() => validateDPLR2Result(changed), /cannot author a candidate when controlled geometry was not recovered/)
})

test('DPL-R2 cannot relabel failed geometry recovery as an authored candidate result', () => {
  const changed = rawResult()
  changed.result = 'REAL_CONTROL_CANDIDATE_AUTHORED'
  const proof = changed.proofBoundary as Record<string, unknown>
  proof.referenceHouseCandidate = 'AUTHORED'
  assert.throws(() => validateDPLR2Result(changed), /Unrecovered geometry must produce/)
})

test('DPL-R2 keeps the unchanged Reference House footprint and forbids mutation', () => {
  const result = composeDPLR2ControlCandidate()
  assert.deepEqual(result.referenceHouse, {
    footprintMm: { width: 12000, depth: 10800 },
    mutation: 'FORBIDDEN'
  })
})

test('DPL-R2 keeps compatibility, incompatibility, route exhaustion and DPL-16 held', () => {
  const result = composeDPLR2ControlCandidate()
  assert.deepEqual(result.proofBoundary, {
    referenceHouseCandidate: 'NOT_AUTHORED',
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    referenceHouseMutation: 'FORBIDDEN',
    originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008',
    originalDpl15cReadyCount: 0,
    deploymentEnvelopeSampleMembership: 'EXCLUDED',
    deploymentEnvelopeDpl16: 'HELD',
    scalarSiteScore: 'FORBIDDEN'
  })
})

test('DPL-R2 does not change the frozen eight-site corpus result', () => {
  const corpus = composeDPL15CCorpusReadiness()
  const result = composeDPLR2ControlCandidate()
  assert.deepEqual(corpus.counts, { ready: 0, notReady: 8 })
  assert.deepEqual(corpus.readySiteIds, [])
  assert.equal(result.proofBoundary.originalDpl15cReadyCount, 0)
})

test('DPL-R2 recovery-attempt ordering is identity-neutral', () => {
  const baseline = composeDPLR2ControlCandidate()
  const changed = clone(rawResult())
  const recovery = changed.geometryRecovery as Record<string, unknown>
  recovery.attempts = [...(recovery.attempts as Record<string, unknown>[])].reverse()
  const authority = changed.geometryAuthority as Record<string, unknown>
  authority.allowedRecoveryRoutes = [...(authority.allowedRecoveryRoutes as string[])].reverse()
  authority.forbiddenRecoveryRoutes = [...(authority.forbiddenRecoveryRoutes as string[])].reverse()
  const next = composeDPLR2ControlCandidate(changed)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-R2 material recovery evidence mutation changes identity', () => {
  const baseline = composeDPLR2ControlCandidate()
  const changed = rawResult()
  const recovery = changed.geometryRecovery as Record<string, unknown>
  const attempts = recovery.attempts as Record<string, unknown>[]
  attempts[0] = { ...attempts[0], detail: `${String(attempts[0].detail)} Material mutation.` }
  const next = composeDPLR2ControlCandidate(changed)
  assert.notEqual(next.resultFingerprint, baseline.resultFingerprint)
})
