import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const path = 'project/dpl/sites/dpl-rp-006-15e-spatial-preflight-v01.json'
const record = (): any => JSON.parse(readFileSync(path, 'utf8'))

const dimensions = [
  'R1_CONTROLLED_SPATIAL_IDENTITY',
  'R2_FOOTPRINT_TEST_GEOMETRY',
  'R3_REAL_ORIENTATION_FRAME',
  'R4_DATUM_LEVEL_EVIDENCE',
  'R5_PHYSICAL_ACCESS_STREET_GEOMETRY',
  'R6_SITE_IDENTITY_COHERENCE'
] as const

test('DPL-15E binds the exact RP-006 DPL-15C parent state', () => {
  const r = record()
  assert.equal(r.packet, 'DPL-15E')
  assert.equal(r.siteId, 'DPL-RP-006')
  assert.equal(r.parentReadiness.assessmentId, 'DPL-15C-CORPUS-1-v0.1')
  assert.equal(r.parentReadiness.gitBlobSha, 'b2c46eb08ebe3bd1599bedc8716bcac35f0bdf08')
  assert.equal(r.parentReadiness.corpusIndexGitBlobSha, 'aeaa0aaf0b97caea066934687a5c350d111d7233')
  assert.equal(r.parentReadiness.rp006RecordGitBlobSha, '14a6209dc3e75e3690a1db209f0b82448d02dc43')
})

test('DPL-15E preserves exactly the R1-R6 readiness universe', () => {
  const r = record()
  assert.deepEqual(r.readiness.map((x: any) => x.dimension), dimensions)
  assert.equal(new Set(r.readiness.map((x: any) => x.dimension)).size, 6)
})

test('DPL-15E earns only R3 and R6 from current public evidence', () => {
  const r = record()
  const states = Object.fromEntries(r.readiness.map((x: any) => [x.dimension, x.state]))
  assert.equal(states.R1_CONTROLLED_SPATIAL_IDENTITY, 'NOT_SATISFIED')
  assert.equal(states.R2_FOOTPRINT_TEST_GEOMETRY, 'NOT_SATISFIED')
  assert.equal(states.R3_REAL_ORIENTATION_FRAME, 'SATISFIED')
  assert.equal(states.R4_DATUM_LEVEL_EVIDENCE, 'NOT_SATISFIED')
  assert.equal(states.R5_PHYSICAL_ACCESS_STREET_GEOMETRY, 'NOT_SATISFIED')
  assert.equal(states.R6_SITE_IDENTITY_COHERENCE, 'SATISFIED')
  assert.deepEqual(r.satisfiedDimensions, ['R3_REAL_ORIENTATION_FRAME', 'R6_SITE_IDENTITY_COHERENCE'])
  assert.equal(r.candidateAuthoringReady, false)
})

test('DPL-15E does not promote planning drawings or title-index route beyond their authority', () => {
  const r = record()
  const e2 = r.sources.find((x: any) => x.id === '15E-E02')
  const e4 = r.sources.find((x: any) => x.id === '15E-E04')
  const e5 = r.sources.find((x: any) => x.id === '15E-E05')
  assert.match(e2.authorityBoundary, /not a determined legal boundary/i)
  assert.match(e2.authorityBoundary, /does not itself recover a placement-ready boundary vector/i)
  assert.match(e4.authorityBoundary, /not substituted for the source drawing bytes/i)
  assert.match(e5.authorityBoundary, /has not yet been acquired/i)
  assert.match(e5.authorityBoundary, /not a determined legal boundary/i)
})

test('DPL-15E refuses applicant-house geometry as Reference House geometry', () => {
  const r = record()
  const r2 = r.readiness.find((x: any) => x.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')
  assert.match(r2.reason, /Applicant-house dimensions are explicitly non-transferable/)
})

test('DPL-15E identifies a bounded no-spend residual route rather than weakening readiness', () => {
  const r = record()
  assert.equal(r.result, 'RP006_MATERIALLY_STRONGER_PUBLIC_ROUTE_CONFIRMED_NOT_YET_CANDIDATE_READY')
  assert.deepEqual(r.residualDimensions, [
    'R1_CONTROLLED_SPATIAL_IDENTITY',
    'R2_FOOTPRINT_TEST_GEOMETRY',
    'R4_DATUM_LEVEL_EVIDENCE',
    'R5_PHYSICAL_ACCESS_STREET_GEOMETRY'
  ])
  assert.equal(r.nextNoSpendRoute.length, 4)
  assert.ok(r.nextNoSpendRoute.some((x: string) => x.includes('title-index polygon')))
  assert.ok(r.nextNoSpendRoute.some((x: string) => x.includes('Environment Agency 1 m DTM')))
})

test('DPL-15E keeps candidate authoring unearned', () => {
  assert.equal(record().candidateAuthoringReady, false)
})
