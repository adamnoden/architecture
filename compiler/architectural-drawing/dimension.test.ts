import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'
import { compileAdeDimension } from './dimension.js'
import type { AdeDimension, AdeProvenance } from './model.js'

const provenance = (precision: AdeProvenance['precision']): AdeProvenance => ({
  sourceIds: ['ADE-06A-DIMENSION-FIXTURE'],
  authority: precision === 'exact' ? 'controlled' : 'provisional',
  precision
})

const dimension = (
  id: string,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  precision: AdeProvenance['precision'] = 'exact'
): AdeDimension => ({
  kind: 'dimension',
  id,
  a: { x: mm(ax), y: mm(ay) },
  b: { x: mm(bx), y: mm(by) },
  label: 'THIS LABEL MUST NOT DRIVE THE VALUE',
  provenance: provenance(precision)
})

const projection = (scaleDenominator: number) =>
  createPlanPaperProjection({
    scaleDenominator,
    modelBounds: { x: 0, y: 0, width: 8000, height: 5000 },
    paperOrigin: { x: 20, y: 20 }
  })

const lineById = (compiled: ReturnType<typeof compileAdeDimension>, id: string) => {
  const primitive = compiled.primitives.find((item) => item.id === id)
  assert.ok(primitive && primitive.kind === 'line')
  return primitive
}

const textPrimitive = (compiled: ReturnType<typeof compileAdeDimension>) => {
  const primitive = compiled.primitives.find((item) => item.kind === 'text')
  assert.ok(primitive && primitive.kind === 'text')
  return primitive
}

describe('ADE composed dimensions', () => {
  test('scales measured geometry while holding paper-space dimension furniture constant', () => {
    const semantic = dimension('DIM-H', 1000, 1000, 7000, 1000)
    const at100 = compileAdeDimension(semantic, { projection: projection(100), side: 'above' })
    const at50 = compileAdeDimension(semantic, { projection: projection(50), side: 'above' })

    assert.equal(at100.orientation, 'horizontal')
    assert.equal(at100.measuredModelMm, 6000)
    assert.equal(at100.paperSpanMm, 60)
    assert.equal(at50.paperSpanMm, 120)

    const dim100 = lineById(at100, 'DIM-H-line')
    const dim50 = lineById(at50, 'DIM-H-line')
    assert.equal(Math.abs(dim100.b.x - dim100.a.x), 60)
    assert.equal(Math.abs(dim50.b.x - dim50.a.x), 120)

    const witness100 = lineById(at100, 'DIM-H-witness-a')
    const witness50 = lineById(at50, 'DIM-H-witness-a')
    assert.equal(Math.abs(witness100.b.y - dim100.a.y), 1.5)
    assert.equal(Math.abs(witness50.b.y - dim50.a.y), 1.5)

    const tick100 = lineById(at100, 'DIM-H-tick-a')
    const tick50 = lineById(at50, 'DIM-H-tick-a')
    assert.ok(Math.abs(Math.hypot(tick100.b.x - tick100.a.x, tick100.b.y - tick100.a.y) - 2.4) < 1e-9)
    assert.ok(Math.abs(Math.hypot(tick50.b.x - tick50.a.x, tick50.b.y - tick50.a.y) - 2.4) < 1e-9)
  })

  test('derives exact and approximate text from semantic geometry and precision, not label copy', () => {
    const exact = compileAdeDimension(dimension('DIM-E', 0, 0, 4200, 0), {
      projection: projection(100),
      side: 'below'
    })
    const approximate = compileAdeDimension(dimension('DIM-A', 0, 0, 0, 2950, 'approximate'), {
      projection: projection(100),
      side: 'left'
    })

    assert.equal(textPrimitive(exact).value, '4200')
    assert.equal(textPrimitive(approximate).value, '≈ 2950')
    assert.equal(textPrimitive(approximate).rotateDeg, -90)
  })

  test('emits one mechanically identifiable composition with provenance on every primitive', () => {
    const compiled = compileAdeDimension(dimension('DIM-C', 500, 1000, 6500, 1000), {
      projection: projection(100),
      side: 'above'
    })

    assert.equal(compiled.primitives.length, 6)
    assert.deepEqual(
      compiled.primitives.map((primitive) => primitive.metadata?.dimensionPart).sort(),
      ['dimension-line', 'terminal-a', 'terminal-b', 'text', 'witness-a', 'witness-b']
    )
    assert.ok(compiled.primitives.every((primitive) => primitive.metadata?.dimensionId === 'DIM-C'))
    assert.ok(compiled.primitives.every((primitive) => primitive.metadata?.sourceIds === 'ADE-06A-DIMENSION-FIXTURE'))
  })

  test('rejects diagonal, zero-length and orientation/side mismatches', () => {
    assert.throws(
      () => compileAdeDimension(dimension('DIM-DIAG', 0, 0, 1000, 1000), { projection: projection(100), side: 'above' }),
      /horizontal or vertical/
    )
    assert.throws(
      () => compileAdeDimension(dimension('DIM-ZERO', 0, 0, 0, 0), { projection: projection(100), side: 'above' }),
      /horizontal or vertical/
    )
    assert.throws(
      () => compileAdeDimension(dimension('DIM-SIDE', 0, 0, 1000, 0), { projection: projection(100), side: 'left' }),
      /requires side above or below/
    )
  })

  test('refuses precision states whose display authority is absent from AdeDimension', () => {
    for (const precision of ['range', 'qualitative', 'unknown'] as const) {
      assert.throws(
        () => compileAdeDimension(dimension(`DIM-${precision}`, 0, 0, 3000, 0, precision), { projection: projection(100), side: 'above' }),
        /no truthful ranged\/qualitative display authority/
      )
    }
  })
})
