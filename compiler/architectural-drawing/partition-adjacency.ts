import type { DrawingLine } from '../publication-drawing/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { DrawingPath, DrawingPrimitiveV2 } from '../publication-drawing-v2/model.js'
import type {
  AdeAdjacencyObligation,
  AdeArchitecturalPlan,
  AdeModelPoint,
  AdePartitionDatum,
  AdePlanNode
} from './model.js'
import { assertValidArchitecturalPlan } from './validate.js'

const EPSILON = 1e-6

export interface AdePartitionDatumDrawingOptions {
  /** Fixed paper-space width. It is notation, never model-space thickness. */
  locusPaperMm?: number
}

export interface AdeAdjacencyDrawingOptions {
  /** Which side of the candidate segment carries the annotation bracket. */
  annotationSide: 'left' | 'right'
  offsetPaperMm?: number
  tickPaperMm?: number
}

const nodeFor = (nodes: ReadonlyMap<string, AdePlanNode>, id: string, owner: string): AdePlanNode => {
  const node = nodes.get(id)
  if (!node) throw new Error(`ADE-05B ${owner} references missing node ${id}.`)
  return node
}

const projectedSegment = (
  a: AdeModelPoint,
  b: AdeModelPoint,
  projection: PlanPaperProjection,
  owner: string
) => {
  const p0 = projection.point(a.x, a.y)
  const p1 = projection.point(b.x, b.y)
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const length = Math.hypot(dx, dy)
  if (length <= EPSILON) throw new Error(`ADE-05B ${owner} projects to zero paper-space length.`)
  const tx = dx / length
  const ty = dy / length
  return { p0, p1, tx, ty, nx: -ty, ny: tx, length }
}

export const partitionDatumToDrawingPath = (
  plan: AdeArchitecturalPlan,
  datum: AdePartitionDatum,
  projection: PlanPaperProjection,
  options: AdePartitionDatumDrawingOptions = {}
): DrawingPath => {
  assertValidArchitecturalPlan(plan)
  const nodes = new Map(plan.nodes.map((node) => [node.id, node]))
  const from = nodeFor(nodes, datum.fromNodeId, datum.id)
  const to = nodeFor(nodes, datum.toNodeId, datum.id)
  const segment = projectedSegment(from.point, to.point, projection, datum.id)
  const width = options.locusPaperMm ?? 0.9
  if (!Number.isFinite(width) || width <= 0) throw new Error('ADE-05B partition locus width must be positive finite paper millimetres.')
  const half = width / 2

  return {
    kind: 'path',
    id: `${datum.id}-datum-locus`,
    rings: [[
      { x: segment.p0.x + segment.nx * half, y: segment.p0.y + segment.ny * half },
      { x: segment.p1.x + segment.nx * half, y: segment.p1.y + segment.ny * half },
      { x: segment.p1.x - segment.nx * half, y: segment.p1.y - segment.ny * half },
      { x: segment.p0.x - segment.nx * half, y: segment.p0.y - segment.ny * half }
    ]],
    fill: 'faint',
    metadata: {
      epistemic: 'partition-datum',
      physicalThickness: false,
      paperWidthMm: width,
      sources: datum.provenance.sourceIds.join(',')
    }
  }
}

const bracketForSegment = (
  adjacency: AdeAdjacencyObligation,
  segmentIndex: number,
  segment: AdeAdjacencyObligation['candidateSegments'][number],
  projection: PlanPaperProjection,
  options: AdeAdjacencyDrawingOptions
): DrawingLine[] => {
  const geometry = projectedSegment(segment.a, segment.b, projection, `${adjacency.id}[${segmentIndex}]`)
  const side = options.annotationSide === 'left' ? 1 : -1
  const nx = geometry.nx * side
  const ny = geometry.ny * side
  const offset = options.offsetPaperMm ?? 3.2
  const tick = options.tickPaperMm ?? 2
  if (!Number.isFinite(offset) || offset <= 0 || !Number.isFinite(tick) || tick <= 0) {
    throw new Error('ADE-05B adjacency bracket offset/tick must be positive finite paper millimetres.')
  }
  const a = { x: geometry.p0.x + nx * offset, y: geometry.p0.y + ny * offset }
  const b = { x: geometry.p1.x + nx * offset, y: geometry.p1.y + ny * offset }
  const metadata = {
    epistemic: 'adjacency-obligation',
    doorSelected: false,
    between: adjacency.between.join('|'),
    candidateSegment: segmentIndex,
    sources: adjacency.provenance.sourceIds.join(',')
  }
  const line = (id: string, x1: number, y1: number, x2: number, y2: number): DrawingLine => ({
    kind: 'line', id, a: { x: x1, y: y1 }, b: { x: x2, y: y2 }, role: 'secondary', metadata
  })

  return [
    line(`${adjacency.id}-seg${segmentIndex}-span`, a.x, a.y, b.x, b.y),
    line(`${adjacency.id}-seg${segmentIndex}-a`, a.x, a.y, a.x - nx * tick, a.y - ny * tick),
    line(`${adjacency.id}-seg${segmentIndex}-b`, b.x, b.y, b.x - nx * tick, b.y - ny * tick)
  ]
}

export const adjacencyObligationToDrawingPrimitives = (
  plan: AdeArchitecturalPlan,
  adjacency: AdeAdjacencyObligation,
  projection: PlanPaperProjection,
  options: AdeAdjacencyDrawingOptions
): DrawingPrimitiveV2[] => {
  assertValidArchitecturalPlan(plan)
  return adjacency.candidateSegments.flatMap((segment, index) => bracketForSegment(adjacency, index, segment, projection, options))
}
