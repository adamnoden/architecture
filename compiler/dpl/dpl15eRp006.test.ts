import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15ERp006,
  DPL15E_DIMENSIONS,
  DPL15E_PATH,
  DPL15E_RESULT,
  validateDPL15ERp006
} from './dpl15eRp006.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15E_PATH, 'utf8')) as Record<string, unknown>
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15E binds the frozen DPL-14 / DPL-15C parent state and exact RP-006 corpus authority', () => {
  const result = composeDPL15ERp006()
  assert.equal(result.siteId, 'DPL-RP-006')
  assert.equal(result.result, DPL15E_RESULT)
  assert.deepEqual(result.counts, { satisfied: 2, residual: 4 })
})

test('DPL-15E assesses exactly R1-R6 and only R3/R6 are currently satisfied', () => {
  const validated = validateDPL15ERp006(raw())
  assert.equal(validated.readiness.length, 6)
  assert.deepEqual(validated.readiness.map((entry) => entry.dimension).sort(), [...DPL15E_DIMENSIONS].sort())
  assert.deepEqual(validated.satisfiedDimensions, ['R3_REAL_ORIENTATION_FRAME', 'R6_SITE_IDENTITY_COHERENCE'])
  assert.deepEqual(validated.residualDimensions, [
    'R1_CONTROLLED_SPATIAL_IDENTITY',
    'R2_FOOTPRINT_TEST_GEOMETRY',
    'R4_DATUM_LEVEL_EVIDENCE',
    'R5_PHYSICAL_ACCESS_STREET_GEOMETRY'
  ])
})

test('DPL-15E does not promote an evidenced 1:100 application drawing into placement-ready footprint geometry', () => {
  const validated = validateDPL15ERp006(raw())
  const r2 = validated.readiness.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')
  assert.equal(r2?.state, 'NOT_SATISFIED')
  assert.match(r2?.reason ?? '', /1:100/)
  assert.match(r2?.reason ?? '', /non-transferable/)
})

test('DPL-15E does not promote title-boundary route discovery into a controlled spatial extent', () => {
  const validated = validateDPL15ERp006(raw())
  const r1 = validated.readiness.find((entry) => entry.dimension === 'R1_CONTROLLED_SPATIAL_IDENTITY')
  assert.equal(r1?.state, 'NOT_SATISFIED')
  assert.match(r1?.reason ?? '', /placement-ready|boundary coordinates/)
  const titleRoute = validated.sources.find((source) => source.id === '15E-E05')
  assert.match(titleRoute?.authorityBoundary ?? '', /indicative registered-property index extent/i)
})

test('DPL-15E accepts the exact-site BNG/north frame without pretending it is elevation evidence', () => {
  const validated = validateDPL15ERp006(raw())
  const r3 = validated.readiness.find((entry) => entry.dimension === 'R3_REAL_ORIENTATION_FRAME')
  const r4 = validated.readiness.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')
  assert.equal(r3?.state, 'SATISFIED')
  assert.equal(r4?.state, 'NOT_SATISFIED')
  assert.deepEqual(validated.coordinateFrame.bng, [544654, 179561])
  assert.equal(validated.coordinateFrame.crs, 'EPSG:27700')
  assert.match(r4?.reason ?? '', /Environment Agency DTM|elevation/i)
})

test('DPL-15E preserves physical-access uncertainty despite the exact-site gate/path evidence', () => {
  const validated = validateDPL15ERp006(raw())
  const r5 = validated.readiness.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY')
  assert.equal(r5?.state, 'NOT_SATISFIED')
  assert.match(r5?.reason ?? '', /frontage|access geometry|adopted-highway/i)
})

test('DPL-15E keeps candidate authoring, compatibility, incompatibility, route exhaustion and DPL-16 held', () => {
  const result = composeDPL15ERp006()
  assert.equal(result.candidateAuthoringReady, false)
  assert.deepEqual(result.proofBoundary, {
    referenceHouseCandidate: 'NOT_AUTHORISED',
    compatibleAtScreening: 'NOT_ADMITTED',
    incompatible: 'NOT_ADMITTED',
    routeExhaustion: 'NOT_IMPLEMENTED',
    dpl16: 'HELD'
  })
})

test('DPL-15E semantic identity is ordering-neutral but evidence-sensitive', () => {
  const baseline = composeDPL15ERp006()
  const reordered = raw()
  reordered.sources = [...(reordered.sources as Record<string, unknown>[])].reverse().map((source) => ({
    ...source,
    observed: [...(source.observed as string[])].reverse()
  }))
  reordered.readiness = [...(reordered.readiness as Record<string, unknown>[])].reverse().map((record) => ({
    ...record,
    evidenceRefs: [...(record.evidenceRefs as string[])].reverse()
  }))
  assert.equal(composeDPL15ERp006(reordered).resultFingerprint, baseline.resultFingerprint)

  const changed = clone(raw())
  const records = changed.readiness as Record<string, unknown>[]
  const r5 = records.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY')!
  r5.reason = `${String(r5.reason)} Material mutation.`
  assert.notEqual(composeDPL15ERp006(changed).resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15E rejects any premature current readiness promotion', () => {
  const changed = clone(raw())
  const records = changed.readiness as Record<string, unknown>[]
  const r2 = records.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')!
  r2.state = 'SATISFIED'
  changed.satisfiedDimensions = [
    'R2_FOOTPRINT_TEST_GEOMETRY',
    'R3_REAL_ORIENTATION_FRAME',
    'R6_SITE_IDENTITY_COHERENCE'
  ]
  changed.residualDimensions = [
    'R1_CONTROLLED_SPATIAL_IDENTITY',
    'R4_DATUM_LEVEL_EVIDENCE',
    'R5_PHYSICAL_ACCESS_STREET_GEOMETRY'
  ]
  assert.throws(() => validateDPL15ERp006(changed), /current positive readiness must be exactly/)
})

test('DPL-15E emits one deterministic frozen line for closeout', () => {
  const result = composeDPL15ERp006()
  console.log(`DPL-15E-FROZEN ${JSON.stringify({
    resultFingerprint: result.resultFingerprint,
    result: result.result,
    candidateAuthoringReady: result.candidateAuthoringReady,
    satisfiedDimensions: result.satisfiedDimensions,
    residualDimensions: result.residualDimensions,
    counts: result.counts
  })}`)
})
