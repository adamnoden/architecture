import assert from 'node:assert/strict'
import test from 'node:test'

import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { mm } from '../units.js'
import type { AdeArchitecturalPlan, AdeProvenance } from './model.js'
import { adjacencyObligationToDrawingPrimitives, partitionDatumToDrawingPath } from './partition-adjacency.js'

const provenance: AdeProvenance = {
  sourceIds: ['ADE-05B-TEST'],
  authority: 'provisional',
  precision: 'qualitative'
}

const plan: AdeArchitecturalPlan = {
  id: 'ADE05B-TEST',
  sourceId: 'ADE-05B-TEST',
  nodes: [
    { kind: 'node', id: 'A', point: { x: mm(0), y: mm(0) }, provenance },
    { kind: 'node', id: 'B', point: { x: mm(0), y: mm(3000) }, provenance }
  ],
  wallAssemblies: [],
  walls: [],
  openings: [],
  partitionDatums: [{ kind: 'partition-datum', id: 'PD-1', fromNodeId: 'A', toNodeId: 'B', provenance }],
  spaces: [
    { kind: 'space', id: 'S-A', label: 'A', provenance },
    { kind: 'space', id: 'S-B', label: 'B', provenance }
  ],
  adjacencies: [{
    kind: 'adjacency',
    id: 'ADJ-1',
    between: ['S-A', 'S-B'],
    candidateSegments: [{ a: { x: mm(0), y: mm(500) }, b: { x: mm(0), y: mm(2500) } }],
    provenance
  }],
  dimensions: [],
  labels: []
}

const projection = (scaleDenominator: 100 | 50) => createPlanPaperProjection({
  scaleDenominator,
  modelBounds: { x: -1000, y: 0, width: 2000, height: 3000 },
  paperOrigin: { x: 20, y: 20 }
})

const ringWidth = (ring: readonly { x: number; y: number }[]): number => {
  const xs = ring.map((point) => point.x)
  return Math.max(...xs) - Math.min(...xs)
}

const lineLength = (primitive: { a: { x: number; y: number }; b: { x: number; y: number } }): number =>
  Math.hypot(primitive.b.x - primitive.a.x, primitive.b.y - primitive.a.y)

test('ADE-05B partition datum is a constant-paper faint locus, never model thickness', () => {
  const datum = plan.partitionDatums[0]
  const path100 = partitionDatumToDrawingPath(plan, datum, projection(100), { locusPaperMm: 0.9 })
  const path50 = partitionDatumToDrawingPath(plan, datum, projection(50), { locusPaperMm: 0.9 })
  assert.equal(path100.fill, 'faint')
  assert.equal(path100.stroke, undefined)
  assert.equal(path100.metadata?.physicalThickness, false)
  assert.equal(path100.metadata?.epistemic, 'partition-datum')
  assert.ok(Math.abs(ringWidth(path100.rings[0]) - 0.9) < 1e-6)
  assert.ok(Math.abs(ringWidth(path50.rings[0]) - 0.9) < 1e-6)
  const length100 = Math.max(...path100.rings[0].map((point) => point.y)) - Math.min(...path100.rings[0].map((point) => point.y))
  const length50 = Math.max(...path50.rings[0].map((point) => point.y)) - Math.min(...path50.rings[0].map((point) => point.y))
  assert.ok(Math.abs(length50 / length100 - 2) < 0.001)
})

test('ADE-05B adjacency bracket scales in extent but keeps paper offset/ticks invariant', () => {
  const adjacency = plan.adjacencies[0]
  const a100 = adjacencyObligationToDrawingPrimitives(plan, adjacency, projection(100), {
    annotationSide: 'right', offsetPaperMm: 3.2, tickPaperMm: 2
  })
  const a50 = adjacencyObligationToDrawingPrimitives(plan, adjacency, projection(50), {
    annotationSide: 'right', offsetPaperMm: 3.2, tickPaperMm: 2
  })
  assert.equal(a100.length, 3)
  assert.equal(a50.length, 3)
  const span100 = a100[0]
  const span50 = a50[0]
  const tick100 = a100[1]
  const tick50 = a50[1]
  assert.ok(span100.kind === 'line' && span50.kind === 'line' && tick100.kind === 'line' && tick50.kind === 'line')
  if (span100.kind !== 'line' || span50.kind !== 'line' || tick100.kind !== 'line' || tick50.kind !== 'line') return
  assert.ok(Math.abs(lineLength(span50) / lineLength(span100) - 2) < 0.001)
  assert.ok(Math.abs(lineLength(tick50) - lineLength(tick100)) < 1e-6)
  assert.equal(span100.metadata?.doorSelected, false)
  assert.equal(span100.metadata?.epistemic, 'adjacency-obligation')
  assert.equal(span100.dash, undefined)
})
