import type { DrawingLine, DrawingPrimitive, DrawingText } from '../publication-drawing/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { AdeDimension } from './model.js'

const EPSILON = 1e-6

export interface AdeDimensionDrawingOptions {
  annotationSide: 'left' | 'right'
  /** Distance from measured geometry to the dimension line, in physical paper millimetres. */
  offsetPaperMm?: number
  /** Witness extension beyond the dimension line, in physical paper millimetres. */
  witnessOverrunPaperMm?: number
  /** Diagonal tick length, in physical paper millimetres. */
  tickPaperMm?: number
  /** Text clearance from the dimension line, in physical paper millimetres. */
  textGapPaperMm?: number
}

const line = (
  id: string,
  a: { x: number; y: number },
  b: { x: number; y: number },
  metadata: DrawingLine['metadata']
): DrawingLine => ({ kind: 'line', id, a, b, role: 'secondary', metadata })

const offsetPoint = (point: { x: number; y: number }, nx: number, ny: number, distance: number) => ({
  x: point.x + nx * distance,
  y: point.y + ny * distance
})

export const dimensionToDrawingPrimitives = (
  dimension: AdeDimension,
  projection: PlanPaperProjection,
  options: AdeDimensionDrawingOptions
): DrawingPrimitive[] => {
  const p0 = projection.point(dimension.a.x, dimension.a.y)
  const p1 = projection.point(dimension.b.x, dimension.b.y)
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const span = Math.hypot(dx, dy)
  if (span <= EPSILON) throw new Error(`ADE dimension ${dimension.id} has zero projected length.`)

  const tx = dx / span
  const ty = dy / span
  const side = options.annotationSide === 'left' ? 1 : -1
  const nx = -ty * side
  const ny = tx * side
  const offset = options.offsetPaperMm ?? 7
  const witnessOverrun = options.witnessOverrunPaperMm ?? 1.5
  const tick = options.tickPaperMm ?? 2.2
  const textGap = options.textGapPaperMm ?? 2.2
  for (const [name, value] of Object.entries({ offset, witnessOverrun, tick, textGap })) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`ADE dimension ${name} must be positive finite paper millimetres.`)
  }

  const d0 = offsetPoint(p0, nx, ny, offset)
  const d1 = offsetPoint(p1, nx, ny, offset)
  const w0 = offsetPoint(d0, nx, ny, witnessOverrun)
  const w1 = offsetPoint(d1, nx, ny, witnessOverrun)
  const halfTick = tick / 2
  // A 45-degree architectural tick: tangent + normal components are equal.
  const tickDx = (tx + nx) * halfTick / Math.SQRT2
  const tickDy = (ty + ny) * halfTick / Math.SQRT2
  const metadata = {
    composedObject: 'architectural-dimension',
    dimensionId: dimension.id,
    authority: dimension.provenance.authority,
    precision: dimension.provenance.precision,
    sources: dimension.provenance.sourceIds.join(',')
  }

  const modelLength = Math.hypot(dimension.b.x - dimension.a.x, dimension.b.y - dimension.a.y)
  const value = dimension.label ?? `${Math.round(modelLength)} mm`
  const midpoint = { x: (d0.x + d1.x) / 2, y: (d0.y + d1.y) / 2 }
  const textPoint = offsetPoint(midpoint, nx, ny, textGap)
  const label: DrawingText = {
    kind: 'text',
    id: `${dimension.id}-label`,
    x: textPoint.x,
    y: textPoint.y,
    value,
    role: 'note',
    anchor: 'middle',
    metadata
  }

  return [
    line(`${dimension.id}-dimension-line`, d0, d1, metadata),
    line(`${dimension.id}-witness-a`, p0, w0, metadata),
    line(`${dimension.id}-witness-b`, p1, w1, metadata),
    line(`${dimension.id}-tick-a`, { x: d0.x - tickDx, y: d0.y - tickDy }, { x: d0.x + tickDx, y: d0.y + tickDy }, metadata),
    line(`${dimension.id}-tick-b`, { x: d1.x - tickDx, y: d1.y - tickDy }, { x: d1.x + tickDx, y: d1.y + tickDy }, metadata),
    label
  ]
}
