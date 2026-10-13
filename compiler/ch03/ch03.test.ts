import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from '../reference-house/fixture.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import { compileReferenceHouseSystem } from '../reference-house/system-compile.js'
import { compileReferenceHouseTargetCalculations } from '../rhc5/compile.js'
import { mm } from '../units.js'

const legacyProjection = (source: ReferenceHouseSource) => {
  const result = compileReferenceHouseTargetCalculations(source)
  const c4 = result.c4
  const c3 = c4.c3
  const c2 = c3.c2
  return {
    status: result.status,
    house: c2.house,
    plan: c2.plan,
    structure: c2.structure,
    services: c3.services,
    boundary: c4.boundaries,
    calculations: result.calculations,
    coordination: { boundary: c4.coordination },
    floorZoneDepth: c2.floorZoneDepth,
    proof: {
      structure: c2.proofBoundary,
      services: c3.proofBoundary,
      boundary: c4.proofBoundary,
      calculations: result.proofBoundary
    }
  }
}

const canonicalProjection = (source: ReferenceHouseSource) => {
  const result = compileReferenceHouseSystem(source)
  return {
    status: result.status,
    house: result.house,
    plan: result.plan,
    structure: result.structure,
    services: result.services,
    boundary: result.boundary,
    calculations: result.calculations,
    coordination: result.coordination,
    floorZoneDepth: result.floorZoneDepth,
    proof: result.proof
  }
}

describe('CH-03 single-pass Reference House compiler', () => {
  test('canonical production result is semantically identical to the historical RH-C2→RH-C5 chain', () => {
    const source = createReferenceHouseSource()
    assert.deepEqual(canonicalProjection(source), legacyProjection(source))
  })

  test('preserves a canonical architectural REVIEW without stage-result archaeology', () => {
    const source = createReferenceHouseSource()
    source.court.value.depth = mm(source.court.value.depth + 400)

    const canonical = compileReferenceHouseSystem(source)
    assert.equal(canonical.status, 'REVIEW')
    assert.deepEqual(canonicalProjection(source), legacyProjection(source))
    assert.equal('c2' in canonical, false)
    assert.equal('c3' in canonical, false)
    assert.equal('c4' in canonical, false)
  })

  test('production orchestration calls each generic compiler exactly once and never calls historical stage wrappers', () => {
    const source = readFileSync('compiler/reference-house/system-compile.ts', 'utf8')
    const count = (pattern: RegExp): number => source.match(pattern)?.length ?? 0

    assert.equal(count(/compilePlanSlice\(/g), 1)
    assert.equal(count(/compileReferenceHouseFromPlan\(/g), 1)
    assert.equal(count(/compileStructuralTopology\(/g), 1)
    assert.equal(count(/compileServiceTopology\(/g), 1)
    assert.equal(count(/compileBoundaryTopology\(/g), 1)
    assert.equal(count(/runCalculationCheck\(/g), 1)

    assert.doesNotMatch(source, /compileReferenceHouseStructuralView/)
    assert.doesNotMatch(source, /compileReferenceHouseServiceView/)
    assert.doesNotMatch(source, /compileReferenceHouseBoundaryView/)
    assert.doesNotMatch(source, /compileReferenceHouseTargetCalculations/)
    assert.doesNotMatch(source, /\.c[234]\b/)
  })
})
