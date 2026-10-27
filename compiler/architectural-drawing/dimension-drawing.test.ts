import assert from 'node:assert/strict'
import test from 'node:test'

import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'
import type { AdeDimension, AdeProvenance } from './model.js'
import { dimensionToDrawingPrimitives } from './dimension-drawing.js'

const provenance: AdeProvenance = {
  sourceIds: ['ADE-06-DIMENSION'],
  authority: 'controlled',
  precision: 'exact'
}

const dimension: AdeDimension = {
  kind: 'dimension',
  id: 'DIM-6000',
  a: { x: mm(0), y: mm(0) },
  b: { x: mm(6000), y: mm(0) },
  provenance
}

const projection = (scaleDenominator: 100 | 50) => createPlanPaperProjection({
  scaleDenominator,
  modelBounds: { x: -1000, y: -1000, width: 8000, height: 2000 },
  paperOrigin: { x: 20, y: 20 }
})

const length = (item: { a: { x: number; y: number }; b: { x: number; y: number } }) =>
  Math.hypot(item.b.x - item.a.x, item.b.y - item.a.y)

const lineById = (items: ReturnType<typeof dimensionToDrawingPrimitives>, id: string) => {
  const match = items.find((item) => item.id === id)
  assert.ok(match && match.kind === 'line')
  if (!match || match.kind !== 'line') throw new Error(`Missing line ${id}`)
  return match
}

test('ADE dimension scales model span while preserving paper-space witnesses and ticks', () => {
  const a = dimensionToDrawingPrimitives(dimension, projection(100), { annotationSide: 'left' })
  const b = dimensionToDrawingPrimitives(dimension, projection(50), { annotationSide: 'left' })

  assert.equal(a.length, 6)
  assert.equal(b.length, 6)
  assert.ok(Math.abs(length(lineById(b, 'DIM-6000-dimension-line')) / length(lineById(a, 'DIM-6000-dimension-line')) - 2) < 1e-6)
  assert.ok(Math.abs(length(lineById(a, 'DIM-6000-tick-a')) - length(lineById(b, 'DIM-6000-tick-a'))) < 1e-6)
  assert.ok(Math.abs(length(lineById(a, 'DIM-6000-witness-a')) - length(lineById(b, 'DIM-6000-witness-a'))) < 1e-6)
})

test('ADE dimension retains authority and provenance on every composed primitive', () => {
  const items = dimensionToDrawingPrimitives(dimension, projection(100), { annotationSide: 'right' })
  assert.ok(items.every((item) => item.metadata?.composedObject === 'architectural-dimension'))
  assert.ok(items.every((item) => item.metadata?.sources === 'ADE-06-DIMENSION'))
  assert.ok(items.every((item) => item.metadata?.authority === 'controlled'))
  const label = items.find((item) => item.id === 'DIM-6000-label')
  assert.ok(label && label.kind === 'text')
  if (label?.kind === 'text') assert.equal(label.value, '6000 mm')
})

test('ADE dimension rejects zero-length geometry', () => {
  assert.throws(() => dimensionToDrawingPrimitives({
    ...dimension,
    id: 'DIM-ZERO',
    b: dimension.a
  }, projection(100), { annotationSide: 'left' }), /zero projected length/)
})

test('vertical dimensions rotate their label to keep the measured edge readable in a narrow paper margin', () => {
  const items = dimensionToDrawingPrimitives({ ...dimension, b: { x: dimension.a.x, y: mm(dimension.a.y + 6000) } }, projection(100), { annotationSide: 'right' })
  const label = items.find((p) => p.kind === 'text')!
  assert.ok(label.kind === 'text' && label.rotateDeg === -90)
})
