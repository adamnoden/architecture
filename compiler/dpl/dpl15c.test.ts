import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15CCorpusReadiness,
  DPL15C_ASSESSMENT_PATH,
  DPL15C_DIMENSIONS,
  validateDPL15CAssessment
} from './corpus-candidate-readiness.js'

const rawAssessment = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPL15C_ASSESSMENT_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15C assesses exactly eight real sites against all six readiness dimensions', () => {
  const result = composeDPL15CCorpusReadiness()
  assert.equal(result.sites.length, 8)
  assert.deepEqual(result.sites.map((site) => site.siteId), [
    'DPL-RP-001','DPL-RP-002','DPL-RP-003','DPL-RP-004',
    'DPL-RP-005','DPL-RP-006','DPL-RP-007','DPL-RP-008'
  ])
  const validated = validateDPL15CAssessment(rawAssessment())
  assert.ok(validated.sites.every((site) => site.assessments.length === DPL15C_DIMENSIONS.length))
})

test('DPL-15C derives zero ready sites from the frozen corpus evidence', () => {
  const result = composeDPL15CCorpusReadiness()
  assert.deepEqual(result.counts, { ready: 0, notReady: 8 })
  assert.deepEqual(result.readySiteIds, [])
  assert.equal(result.notReadySiteIds.length, 8)
  assert.ok(result.sites.every((site) => site.readiness === 'NOT_READY'))
})

test('DPL-15C exposes categorical gaps rather than a scalar score', () => {
  const result = composeDPL15CCorpusReadiness()
  assert.ok(result.sites.every((site) => site.gaps.length > 0))
  assert.equal('score' in result, false)
  assert.equal(result.proofBoundary.scalarSiteScore, 'FORBIDDEN')
  const rp005 = result.sites.find((site) => site.siteId === 'DPL-RP-005')
  assert.ok(rp005?.gaps.includes('SITE_IDENTITY_COHERENCE_GAP'))
})

test('DPL-15C keeps approximate area from satisfying footprint-test geometry', () => {
  const validated = validateDPL15CAssessment(rawAssessment())
  for (const siteId of ['DPL-RP-001', 'DPL-RP-006', 'DPL-RP-008']) {
    const site = validated.sites.find((entry) => entry.siteId === siteId)
    const r2 = site?.assessments.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')
    assert.equal(r2?.state, 'NOT_SATISFIED')
  }
})

test('DPL-15C keeps steep-topography description from satisfying datum/level evidence', () => {
  const validated = validateDPL15CAssessment(rawAssessment())
  const rp007 = validated.sites.find((site) => site.siteId === 'DPL-RP-007')
  const r4 = rp007?.assessments.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')
  assert.equal(r4?.state, 'NOT_SATISFIED')
  assert.match(r4?.reason ?? '', /contours|gradients|level datum/)
})

test('DPL-15C preserves the combined-site geometry non-transfer rule for RP-002', () => {
  const validated = validateDPL15CAssessment(rawAssessment())
  const rp002 = validated.sites.find((site) => site.siteId === 'DPL-RP-002')
  const r2 = rp002?.assessments.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')
  assert.equal(r2?.state, 'NOT_SATISFIED')
  assert.match(r2?.reason ?? '', /larger rear-of-8-and-10 site|forbidden from transfer/)
})

test('DPL-15C carries the landed RP-003 NOT_READY boundary forward', () => {
  const result = composeDPL15CCorpusReadiness()
  const rp003 = result.sites.find((site) => site.siteId === 'DPL-RP-003')
  assert.equal(rp003?.readiness, 'NOT_READY')
  assert.ok(rp003?.gaps.includes('FOOTPRINT_TEST_GEOMETRY_GAP'))
})

test('DPL-15C identifies RP-004 categorically for later public evidence acquisition without ranking', () => {
  const result = composeDPL15CCorpusReadiness()
  assert.deepEqual(result.nextPublicEvidenceCandidateIds, ['DPL-RP-004'])
  const rp004 = result.sites.find((site) => site.siteId === 'DPL-RP-004')
  assert.equal(rp004?.readiness, 'NOT_READY')
})

test('DPL-15C ordering is identity-neutral', () => {
  const baseline = composeDPL15CCorpusReadiness()
  const reordered = rawAssessment()
  reordered.sites = [...(reordered.sites as Record<string, unknown>[])].reverse().map((site) => ({
    ...site,
    assessments: [...(site.assessments as Record<string, unknown>[])].reverse().map((assessment) => ({
      ...assessment,
      evidenceRefs: [...(assessment.evidenceRefs as string[])].reverse()
    }))
  }))
  const next = composeDPL15CCorpusReadiness(reordered)
  assert.equal(next.assessmentFingerprint, baseline.assessmentFingerprint)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15C material evidence-assessment mutation changes identity', () => {
  const baseline = composeDPL15CCorpusReadiness()
  const changed = rawAssessment()
  const sites = changed.sites as Record<string, unknown>[]
  const rp004 = sites.find((site) => site.siteId === 'DPL-RP-004') as Record<string, unknown>
  const dimensions = rp004.assessments as Record<string, unknown>[]
  const r5 = dimensions.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY') as Record<string, unknown>
  r5.reason = `${String(r5.reason)} Material mutation.`
  const next = composeDPL15CCorpusReadiness(changed)
  assert.notEqual(next.assessmentFingerprint, baseline.assessmentFingerprint)
  assert.notEqual(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15C refuses missing readiness dimensions', () => {
  const changed = rawAssessment()
  const sites = changed.sites as Record<string, unknown>[]
  const rp001 = sites.find((site) => site.siteId === 'DPL-RP-001') as Record<string, unknown>
  ;(rp001.assessments as unknown[]).pop()
  assert.throws(() => validateDPL15CAssessment(changed), /exactly 6 readiness assessments/)
})

test('DPL-15C keeps candidate, compatibility and DPL-16 authority held', () => {
  const result = composeDPL15CCorpusReadiness()
  assert.deepEqual(result.proofBoundary, {
    referenceHouseCandidate: 'NOT_AUTHORED',
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    deploymentEnvelopeDpl16: 'HELD',
    scalarSiteScore: 'FORBIDDEN'
  })
})
