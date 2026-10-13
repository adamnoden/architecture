import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compilePlanSlice } from '../plan-slice/compile.js'
import { renderPlanSliceSvg } from '../plan-slice/drawing.js'
import { compileReferenceHouse } from '../reference-house/compile.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { adaptReferenceHousePlanSource } from '../reference-house/plan-adapter.js'
import { mm, toSquareMetres } from '../units.js'
import { createCf01ContrastSource } from './fixture.js'

const diagnosticCodes = (result: ReturnType<typeof compilePlanSlice>): string[] =>
  result.diagnostics.map((item) => item.code)

describe('CF-01 bounded generality gate', () => {
  test('routes both fixtures through the same neutral plan compiler', () => {
    const referencePlan = compilePlanSlice(adaptReferenceHousePlanSource(createReferenceHouseSource()))
    const contrastPlan = compilePlanSlice(createCf01ContrastSource())

    assert.equal(referencePlan.status, 'PASS')
    assert.equal(contrastPlan.status, 'PASS')
    assert.equal(compileReferenceHouse(createReferenceHouseSource()).status, 'PASS')
    assert.equal(referencePlan.derived.levels.length, 2)
    assert.equal(referencePlan.derived.voids.length, 2)
    assert.equal(contrastPlan.derived.levels.length, 1)
    assert.equal(contrastPlan.derived.voids.length, 0)
  })

  test('compiles a one-storey no-void asymmetric domestic plan to full plate closure', () => {
    const result = compilePlanSlice(createCf01ContrastSource())

    assert.equal(result.status, 'PASS')
    assert.deepEqual(result.diagnostics, [])
    assert.equal(toSquareMetres(result.derived.shell.area), 69.12)
    assert.equal(toSquareMetres(result.derived.plateAreas[0].area), 69.12)
    assert.equal(result.derived.spaces.length, 5)
  })

  test('accepts irregular facade coordinates with no bay field, courtyard or stair contract', () => {
    const source = createCf01ContrastSource()
    const result = compilePlanSlice(source)
    const southCentres = result.derived.openings
      .filter((opening) => opening.hostBoundaryId === 'CF-SOUTH')
      .map((opening) => opening.centre)

    assert.deepEqual(southCentres, [4275, 1350, 7825])
    const serialized = JSON.stringify(source)
    assert.equal(serialized.includes('frontField'), false)
    assert.equal(serialized.includes('entranceBay'), false)
    assert.equal(serialized.includes('stair'), false)
    assert.equal(serialized.includes('court'), false)
  })

  test('preserves Reference House placement semantics while resolving them into neutral coordinates', () => {
    const source = adaptReferenceHousePlanSource(createReferenceHouseSource())
    const result = compilePlanSlice(source)
    const entrance = result.derived.openings.find((opening) => opening.id === 'G-FRONT-D01')
    const principal = result.derived.openings.find((opening) => opening.id === 'G-FRONT-W01')

    assert.ok(entrance)
    assert.ok(principal)
    assert.equal(entrance.placementKind, 'entrance-bay')
    assert.equal(entrance.centre, 7350)
    assert.equal(principal.placementKind, 'front-bay')
    assert.equal(principal.centre, 1950)
  })

  test('fails closed when an irregular opening leaves its host', () => {
    const source = createCf01ContrastSource()
    const opening = source.openings.find((candidate) => candidate.id === 'CF-W02')
    assert.ok(opening)
    opening.placement = { kind: 'at-coordinate', coordinate: mm(9500) }

    const result = compilePlanSlice(source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result).includes('OPENING_OUTSIDE_HOST'))
  })

  test('fails closed on missing plate area rather than inventing replacement room geometry', () => {
    const source = createCf01ContrastSource()
    source.spaces = source.spaces.filter((space) => space.id !== 'CF-BEDROOM')

    const result = compilePlanSlice(source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result).includes('PLATE_CLOSURE_MISMATCH'))
  })

  test('is deeply deterministic, including the neutral semantic plan projection', () => {
    const a = compilePlanSlice(createCf01ContrastSource())
    const b = compilePlanSlice(createCf01ContrastSource())
    assert.deepEqual(a, b)

    const svgA = renderPlanSliceSvg(a, 'GROUND', 'CF-01 contrast plan')
    const svgB = renderPlanSliceSvg(b, 'GROUND', 'CF-01 contrast plan')
    assert.equal(svgA, svgB)
    assert.match(svgA, /data-entity="CF-D01"/)
    assert.match(svgA, /data-entity="CF-KITCHEN-DINING"/)
  })
})
