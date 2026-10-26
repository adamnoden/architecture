import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  composeDPL15FRp006,
  DPL15F_EXPECTED_PARENT,
  DPL15F_PATH,
  DPL15F_RESIDUAL_UNIVERSE,
  DPL15F_RESULT,
  validateDPL15FRp006
} from './dpl15fRp006.js'

const raw = (): Record<string, unknown> => JSON.parse(readFileSync(DPL15F_PATH, 'utf8')) as Record<string, unknown>
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

test('DPL-15F binds the exact landed DPL-15E result and residual universe', () => {
  const validated = validateDPL15FRp006(raw())
  assert.equal(validated.parent.resultFingerprint, DPL15F_EXPECTED_PARENT)
  assert.deepEqual(validated.residualInputUniverse, [...DPL15F_RESIDUAL_UNIVERSE].sort())
})

test('DPL-15F records six bounded recovery attempts without promoting route discovery into evidence', () => {
  const validated = validateDPL15FRp006(raw())
  assert.equal(validated.recoveryAttempts.length, 6)
  const planningData = validated.recoveryAttempts.find((attempt) => attempt.id === '15F-A01')
  assert.equal(planningData?.outcome, 'ROUTE_CONFIRMED_EXACT_RESPONSE_BYTES_NOT_ACQUIRED')
  assert.match(planningData?.authorityBoundary ?? '', /Route discovery is not spatial evidence/i)
  const ea = validated.recoveryAttempts.find((attempt) => attempt.id === '15F-A03')
  assert.equal(ea?.outcome, 'OFFICIAL_ROUTE_AND_COVERAGE_ID_CONFIRMED_RASTER_BYTES_NOT_ACQUIRED')
})

test('DPL-15F refuses the approximate 5.0 mAOD Google Earth level as R4 authority', () => {
  const validated = validateDPL15FRp006(raw())
  const r4 = validated.readiness.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')
  assert.equal(r4?.state, 'NOT_SATISFIED')
  assert.match(r4?.reason ?? '', /Google Earth/i)
  assert.match(r4?.reason ?? '', /no site walkover/i)
  const source = validated.recoveryAttempts.find((attempt) => attempt.id === '15F-A04')
  assert.deepEqual(source?.observed, [
    'Report later identifies Google Earth as the source for the general 5.0 mAOD site level.',
    'Report summary states site elevation approximately 5.0 mAOD.',
    'The report states that a site walkover was not undertaken and photographs were taken from Google Maps.'
  ].sort())
})

test('DPL-15F keeps R5 unresolved until access context is bound to controlled placement geometry', () => {
  const validated = validateDPL15FRp006(raw())
  const r5 = validated.readiness.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY')
  assert.equal(r5?.state, 'NOT_SATISFIED')
  assert.match(r5?.reason ?? '', /controlled placement geometry/i)
  assert.match(r5?.reason ?? '', /adopted-highway/i)
})

test('DPL-15F remains 2/6 and returns the exact public geometry/datum acquisition boundary', () => {
  const result = composeDPL15FRp006()
  assert.equal(result.result, DPL15F_RESULT)
  assert.equal(result.candidateAuthoringReady, false)
  assert.deepEqual(result.satisfiedDimensions, ['R3_REAL_ORIENTATION_FRAME', 'R6_SITE_IDENTITY_COHERENCE'])
  assert.deepEqual(result.residualDimensions, [...DPL15F_RESIDUAL_UNIVERSE].sort())
  assert.deepEqual(result.nextCorpusComparison, ['DPL-RP-007', 'DPL-RP-008'])
})

test('DPL-15F rejects a premature readiness promotion', () => {
  const changed = clone(raw())
  const readiness = changed.readiness as Record<string, unknown>[]
  const r4 = readiness.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')!
  r4.state = 'SATISFIED'
  changed.satisfiedDimensions = ['R3_REAL_ORIENTATION_FRAME', 'R4_DATUM_LEVEL_EVIDENCE', 'R6_SITE_IDENTITY_COHERENCE']
  changed.residualDimensions = ['R1_CONTROLLED_SPATIAL_IDENTITY', 'R2_FOOTPRINT_TEST_GEOMETRY', 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY']
  assert.throws(() => validateDPL15FRp006(changed), /has not earned any readiness promotion beyond R3\/R6/)
})

test('DPL-15F identity is ordering-neutral but evidence-sensitive', () => {
  const baseline = composeDPL15FRp006()
  const reordered = raw()
  reordered.recoveryAttempts = [...(reordered.recoveryAttempts as Record<string, unknown>[])].reverse().map((attempt) => ({
    ...attempt,
    targetDimensions: [...(attempt.targetDimensions as string[])].reverse(),
    ...(attempt.observed ? { observed: [...(attempt.observed as string[])].reverse() } : {})
  }))
  reordered.readiness = [...(reordered.readiness as Record<string, unknown>[])].reverse().map((entry) => ({
    ...entry,
    evidenceRefs: [...(entry.evidenceRefs as string[])].reverse()
  }))
  assert.equal(composeDPL15FRp006(reordered).resultFingerprint, baseline.resultFingerprint)

  const changed = clone(raw())
  const attempts = changed.recoveryAttempts as Record<string, unknown>[]
  attempts[0].authorityBoundary = `${String(attempts[0].authorityBoundary)} Material mutation.`
  assert.notEqual(composeDPL15FRp006(changed).resultFingerprint, baseline.resultFingerprint)
})

test('DPL-15F emits one deterministic frozen line for closeout', () => {
  const result = composeDPL15FRp006()
  console.log(`DPL-15F-FROZEN ${JSON.stringify({
    resultFingerprint: result.resultFingerprint,
    result: result.result,
    candidateAuthoringReady: result.candidateAuthoringReady,
    satisfiedDimensions: result.satisfiedDimensions,
    residualDimensions: result.residualDimensions,
    recoveryAttemptCount: result.recoveryAttemptCount,
    nextCorpusComparison: result.nextCorpusComparison
  })}`)
})
