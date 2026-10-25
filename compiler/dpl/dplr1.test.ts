import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { DPL15C_DIMENSIONS, composeDPL15CCorpusReadiness } from './corpus-candidate-readiness.js'
import {
  composeDPLR1ControlReadiness,
  DPLR1_ASSESSMENT_PATH,
  validateDPLR1Assessment
} from './control-site-readiness.js'

const rawAssessment = (): Record<string, unknown> =>
  JSON.parse(readFileSync(DPLR1_ASSESSMENT_PATH, 'utf8')) as Record<string, unknown>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-R1 inherits the exact DPL-15C R1-R6 readiness contract', () => {
  const validated = validateDPLR1Assessment(rawAssessment())
  assert.deepEqual([...validated.inheritedReadinessDimensions].sort(), [...DPL15C_DIMENSIONS].sort())
  assert.equal(validated.assessments.length, 6)
  assert.deepEqual(validated.assessments.map((entry) => entry.dimension), [...DPL15C_DIMENSIONS].sort())
})

test('DPL-R1 derives candidate-authoring readiness only when all six dimensions are satisfied', () => {
  const result = composeDPLR1ControlReadiness()
  assert.equal(result.readiness, 'CONTROL_SITE_CANDIDATE_AUTHORING_READY')
  assert.deepEqual(result.gaps, [])
  assert.equal(result.sourceConflictState, 'NONE_WITHIN_FROZEN_SNAPSHOT')
})

test('DPL-R1 keeps one missing evidence dimension fail-closed', () => {
  const changed = rawAssessment()
  const assessments = changed.assessments as Record<string, unknown>[]
  const r2 = assessments.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY') as Record<string, unknown>
  r2.state = 'NOT_SATISFIED'
  const result = composeDPLR1ControlReadiness(changed)
  assert.equal(result.readiness, 'CONTROL_SITE_NOT_READY_EVIDENCE_GAP')
  assert.deepEqual(result.gaps, ['R2_FOOTPRINT_TEST_GEOMETRY'])
})

test('DPL-R1 source conflict outranks otherwise complete evidence', () => {
  const changed = rawAssessment()
  changed.sourceConflictState = 'SOURCE_CONFLICT'
  const result = composeDPLR1ControlReadiness(changed)
  assert.equal(result.readiness, 'CONTROL_SITE_NOT_READY_SOURCE_CONFLICT')
  assert.deepEqual(result.gaps, [])
})

test('DPL-R1 excludes later 2026 application authority from the frozen 2024 evidence graph', () => {
  const validated = validateDPLR1Assessment(rawAssessment())
  assert.deepEqual(validated.siteSnapshot.excludedLaterApplications, ['26/1039/FUL', '26/2819/CON'])
  for (const source of validated.sources) {
    const searchable = `${source.documentIdentity} ${source.admittedFacts.join(' ')}`
    assert.doesNotMatch(searchable, /26\/1039\/FUL|26\/2819\/CON/)
  }
})

test('DPL-R1 does not mutate the frozen eight-site DPL-15C corpus result', () => {
  const corpus = composeDPL15CCorpusReadiness()
  const control = composeDPLR1ControlReadiness()
  assert.deepEqual(corpus.counts, { ready: 0, notReady: 8 })
  assert.deepEqual(corpus.readySiteIds, [])
  assert.equal(control.proofBoundary.originalDpl15cCorpus, 'UNCHANGED_DPL_RP_001_THROUGH_008')
  assert.equal(control.proofBoundary.originalDpl15cReadyCount, 0)
})

test('DPL-R1 keeps candidate, compatibility, route exhaustion and DPL-16 held', () => {
  const result = composeDPLR1ControlReadiness()
  assert.deepEqual(result.proofBoundary, {
    referenceHouseCandidate: 'NOT_AUTHORED_IN_DPL_R1',
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    deploymentEnvelopeDpl16: 'HELD',
    originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008',
    originalDpl15cReadyCount: 0,
    deploymentEnvelopeSampleMembership: 'EXCLUDED',
    scalarSiteScore: 'FORBIDDEN'
  })
})

test('DPL-R1 refuses unknown evidence references', () => {
  const changed = rawAssessment()
  const assessments = changed.assessments as Record<string, unknown>[]
  const r1 = assessments.find((entry) => entry.dimension === 'R1_CONTROLLED_SPATIAL_IDENTITY') as Record<string, unknown>
  r1.evidenceRefs = ['U24-S1', 'DOES-NOT-EXIST']
  assert.throws(() => validateDPLR1Assessment(changed), /unknown evidence source/)
})

test('DPL-R1 rejects leakage of later-application facts into a source', () => {
  const changed = rawAssessment()
  const sources = changed.sources as Record<string, unknown>[]
  sources[0] = {
    ...sources[0],
    admittedFacts: [...(sources[0].admittedFacts as string[]), 'borrowed from 26/1039/FUL']
  }
  assert.throws(() => validateDPLR1Assessment(changed), /leaks later-application authority/)
})

test('DPL-R1 semantic ordering is identity-neutral', () => {
  const baseline = composeDPLR1ControlReadiness()
  const changed = clone(rawAssessment())
  changed.sources = [...(changed.sources as Record<string, unknown>[])].reverse().map((source) => ({
    ...source,
    admittedFacts: [...(source.admittedFacts as string[])].reverse()
  }))
  changed.assessments = [...(changed.assessments as Record<string, unknown>[])].reverse().map((assessment) => ({
    ...assessment,
    evidenceRefs: [...(assessment.evidenceRefs as string[])].reverse()
  }))
  changed.siteSnapshot = {
    ...(changed.siteSnapshot as Record<string, unknown>),
    acceptedDrawingLineage: [...((changed.siteSnapshot as Record<string, unknown>).acceptedDrawingLineage as string[])].reverse()
  }
  const next = composeDPLR1ControlReadiness(changed)
  assert.equal(next.evidenceFingerprint, baseline.evidenceFingerprint)
  assert.equal(next.assessmentFingerprint, baseline.assessmentFingerprint)
  assert.equal(next.resultFingerprint, baseline.resultFingerprint)
})

test('DPL-R1 material evidence mutation changes identity', () => {
  const baseline = composeDPLR1ControlReadiness()
  const changed = rawAssessment()
  const sources = changed.sources as Record<string, unknown>[]
  sources[0] = {
    ...sources[0],
    admittedFacts: [...(sources[0].admittedFacts as string[]), 'material new admitted fact']
  }
  const next = composeDPLR1ControlReadiness(changed)
  assert.notEqual(next.evidenceFingerprint, baseline.evidenceFingerprint)
  assert.notEqual(next.resultFingerprint, baseline.resultFingerprint)
})
