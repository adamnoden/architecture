import type { DrawingLine, DrawingPrimitive, DrawingText } from '../publication-drawing/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { AdeDimension } from './model.js'

export type AdeDimensionSide = 'above' | 'below' | 'left' | 'right'

export interface AdeDimensionPaperStyle {
  offsetMm: number
  witnessGapMm: number
  witnessOvershootMm: number
  tickLengthMm: number
  textOffsetMm: number
}

export interface CompileAdeDimensionOptions {
  projection: PlanPaperProjection
  side: AdeDimensionSide
  style?: Partial<AdeDimensionPaperStyle>
}

export interface CompiledAdeDimension {
  dimensionId: string
  orientation: 'horizontal' | 'vertical'
  measuredModelMm: number
  paperSpanMm: number
  primitives: DrawingPrimitive[]
}

const DEFAULT_STYLE: AdeDimensionPaperStyle = {
  offsetMm: 9,
  witnessGapMm: 1.5,
  witnessOvershootMm: 1.5,
  tickLengthMm: 2.4,
  textOffsetMm: 1.8
}

const requirePositivePaperValue = (name: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`ADE dimension ${name} must be a positive paper-space value.`)
  }
}

const dimensionValue = (dimension: AdeDimension, measuredModelMm: number): string => {
  const rounded = Math.round(measuredModelMm * 100) / 100
  const value = `${rounded}`

  if (dimension.provenance.precision === 'exact') return value
  if (dimension.provenance.precision === 'approximate') return `≈ ${value}`

  throw new Error(
    `ADE dimension ${dimension.id} has ${dimension.provenance.precision} precision but the current semantic object carries no truthful ranged/qualitative display authority.`
  )
}

const metadata = (
  dimension: AdeDimension,
  part: string,
  measuredModelMm: number,
  paperSpanMm: number
): Record<string, string | number | boolean> => ({
  dimensionId: dimension.id,
  dimensionPart: part,
  sourceIds: dimension.provenance.sourceIds.join('|'),
  authority: dimension.provenance.authority,
  precision: dimension.provenance.precision,
  measuredModelMm,
  paperSpanMm
})

const line = (
  dimension: AdeDimension,
  id: string,
  part: string,
  a: { x: number; y: number },
  b: { x: number; y: number },
  measuredModelMm: number,
  paperSpanMm: number
): DrawingLine => ({
  kind: 'line',
  id,
  a,
  b,
  role: 'secondary',
  metadata: metadata(dimension, part, measuredModelMm, paperSpanMm)
})

const text = (
  dimension: AdeDimension,
  x: number,
  y: number,
  value: string,
  rotateDeg: number | undefined,
  measuredModelMm: number,
  paperSpanMm: number
): DrawingText => ({
  kind: 'text',
  id: `${dimension.id}-text`,
  x,
  y,
  value,
  role: 'marker',
  anchor: 'middle',
  rotateDeg,
  metadata: metadata(dimension, 'text', measuredModelMm, paperSpanMm)
})

export const compileAdeDimension = (
  dimension: AdeDimension,
  options: CompileAdeDimensionOptions
): CompiledAdeDimension => {
  const style: AdeDimensionPaperStyle = { ...DEFAULT_STYLE, ...options.style }
  for (const [name, value] of Object.entries(style)) requirePositivePaperValue(name, value)

  const horizontal = dimension.a.y === dimension.b.y && dimension.a.x !== dimension.b.x
  const vertical = dimension.a.x === dimension.b.x && dimension.a.y !== dimension.b.y
  if (!horizontal && !vertical) {
    throw new Error(`ADE dimension ${dimension.id} must be a non-zero horizontal or vertical model-space segment.`)
  }

  if (horizontal && !['above', 'below'].includes(options.side)) {
    throw new Error(`Horizontal ADE dimension ${dimension.id} requires side above or below.`)
  }
  if (vertical && !['left', 'right'].includes(options.side)) {
    throw new Error(`Vertical ADE dimension ${dimension.id} requires side left or right.`)
  }

  const measuredModelMm = horizontal
    ? Math.abs(dimension.b.x - dimension.a.x)
    : Math.abs(dimension.b.y - dimension.a.y)
  const paperSpanMm = options.projection.length(measuredModelMm)
  const pA = options.projection.point(dimension.a.x, dimension.a.y)
  const pB = options.projection.point(dimension.b.x, dimension.b.y)
  const value = dimensionValue(dimension, measuredModelMm)
  const halfTickAxis = style.tickLengthMm / (2 * Math.SQRT2)
  const primitives: DrawingPrimitive[] = []

  if (horizontal) {
    const outward = options.side === 'above' ? -1 : 1
    const y = pA.y + outward * style.offsetMm
    const witnessStartA = pA.y + outward * style.witnessGapMm
    const witnessStartB = pB.y + outward * style.witnessGapMm
    const witnessEnd = y + outward * style.witnessOvershootMm

    primitives.push(
      line(dimension, `${dimension.id}-witness-a`, 'witness-a', { x: pA.x, y: witnessStartA }, { x: pA.x, y: witnessEnd }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-witness-b`, 'witness-b', { x: pB.x, y: witnessStartB }, { x: pB.x, y: witnessEnd }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-line`, 'dimension-line', { x: pA.x, y }, { x: pB.x, y }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-tick-a`, 'terminal-a', { x: pA.x - halfTickAxis, y: y + halfTickAxis }, { x: pA.x + halfTickAxis, y: y - halfTickAxis }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-tick-b`, 'terminal-b', { x: pB.x - halfTickAxis, y: y + halfTickAxis }, { x: pB.x + halfTickAxis, y: y - halfTickAxis }, measuredModelMm, paperSpanMm),
      text(dimension, (pA.x + pB.x) / 2, y + outward * style.textOffsetMm, value, undefined, measuredModelMm, paperSpanMm)
    )
  } else {
    const outward = options.side === 'left' ? -1 : 1
    const x = pA.x + outward * style.offsetMm
    const witnessStartA = pA.x + outward * style.witnessGapMm
    const witnessStartB = pB.x + outward * style.witnessGapMm
    const witnessEnd = x + outward * style.witnessOvershootMm

    primitives.push(
      line(dimension, `${dimension.id}-witness-a`, 'witness-a', { x: witnessStartA, y: pA.y }, { x: witnessEnd, y: pA.y }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-witness-b`, 'witness-b', { x: witnessStartB, y: pB.y }, { x: witnessEnd, y: pB.y }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-line`, 'dimension-line', { x, y: pA.y }, { x, y: pB.y }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-tick-a`, 'terminal-a', { x: x - halfTickAxis, y: pA.y + halfTickAxis }, { x: x + halfTickAxis, y: pA.y - halfTickAxis }, measuredModelMm, paperSpanMm),
      line(dimension, `${dimension.id}-tick-b`, 'terminal-b', { x: x - halfTickAxis, y: pB.y + halfTickAxis }, { x: x + halfTickAxis, y: pB.y - halfTickAxis }, measuredModelMm, paperSpanMm),
      text(dimension, x + outward * style.textOffsetMm, (pA.y + pB.y) / 2, value, -90, measuredModelMm, paperSpanMm)
    )
  }

  return {
    dimensionId: dimension.id,
    orientation: horizontal ? 'horizontal' : 'vertical',
    measuredModelMm,
    paperSpanMm,
    primitives
  }
}
