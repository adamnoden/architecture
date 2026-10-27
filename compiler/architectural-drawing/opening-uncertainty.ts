import type { DrawingLine, DrawingPrimitive, DrawingRect, DrawingText } from '../publication-drawing/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { Millimetres } from '../units.js'
import { assertResolvedDistanceWithinAuthority } from './authority.js'
import type {
  AdeArchitecturalPlan,
  AdeOpening,
  AdePlanNode,
  AdeWallAssembly,
  AdeWallRun
} from './model.js'
import { assertValidArchitecturalPlan } from './validate.js'

const EPSILON = 1e-6

export type AdeOpeningUncertaintyInstruction =
  | { kind: 'exact'; openingId: string; hostWallId: string; sourceIds: readonly string[] }
  | {
      kind: 'approximate-aperture'
      openingId: string
      hostWallId: string
      centreOffset: Millimetres
      nominalWidth: Millimetres
      sourceIds: readonly string[]
    }
  | {
      kind: 'range-width'
      openingId: string
      hostWallId: string
      centreOffset: Millimetres
      minimumWidth: Millimetres
      maximumWidth: Millimetres
      sourceIds: readonly string[]
    }
  | {
      kind: 'centre-only'
      openingId: string
      hostWallId: string
      centreOffset: Millimetres
      sourceIds: readonly string[]
    }
  | { kind: 'host-obligation'; openingId: string; hostWallId: string; sourceIds: readonly string[] }

export interface AdeOpeningUncertaintyCompileOptions {
  resolveApproximateCentreMm?: (opening: AdeOpening) => Millimetres
  resolveApproximateWidthMm?: (opening: AdeOpening) => Millimetres
}

export interface AdeOpeningUncertaintyDrawingOptions {
  annotationSide: 'left' | 'right'
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => Millimetres
  gapPaperMm?: number
  tickPaperMm?: number
  markerPaperMm?: number
  /** Physical-paper thickness of the host-only possibility band. */
  hostBandPaperMm?: number
  showLabels?: boolean
}

const sourceIdsFor = (wall: AdeWallRun, opening: AdeOpening): readonly string[] =>
  [...new Set([...wall.provenance.sourceIds, ...opening.provenance.sourceIds])].sort()

const wallAndOpening = (
  plan: AdeArchitecturalPlan,
  openingId: string
): { opening: AdeOpening; wall: AdeWallRun } => {
  const opening = plan.openings.find((candidate) => candidate.id === openingId)
  if (!opening) throw new Error(`ADE-04B missing opening ${openingId}.`)
  const wall = plan.walls.find((candidate) => candidate.id === opening.hostWallId)
  if (!wall) throw new Error(`ADE-04B opening ${opening.id} references missing wall ${opening.hostWallId}.`)
  return { opening, wall }
}

const nominal = (
  opening: AdeOpening,
  field: 'centre' | 'width',
  options: AdeOpeningUncertaintyCompileOptions
): Millimetres => {
  const authority = field === 'centre' ? opening.centreOffset : opening.width
  if (authority.kind === 'exact' || authority.kind === 'approximate') {
    const resolved = authority.kind === 'exact'
      ? authority.value
      : field === 'centre'
        ? options.resolveApproximateCentreMm?.(opening) ?? authority.value
        : options.resolveApproximateWidthMm?.(opening) ?? authority.value
    assertResolvedDistanceWithinAuthority(opening.id, `opening ${field}`, authority, resolved)
    return resolved
  }
  throw new Error(`ADE-04B ${opening.id} has no nominal ${field} for ${authority.kind} authority.`)
}

export const compileOpeningUncertaintyInstruction = (
  plan: AdeArchitecturalPlan,
  openingId: string,
  options: AdeOpeningUncertaintyCompileOptions = {}
): AdeOpeningUncertaintyInstruction => {
  assertValidArchitecturalPlan(plan)
  const { opening, wall } = wallAndOpening(plan, openingId)
  const sourceIds = sourceIdsFor(wall, opening)

  if (opening.centreOffset.kind === 'range') {
    throw new Error(`ADE-04B opening ${opening.id} has ranged position authority; ranged-position notation is not yet an earned capability.`)
  }
  if (opening.centreOffset.kind === 'qualitative' || opening.centreOffset.kind === 'unknown') {
    return { kind: 'host-obligation', openingId: opening.id, hostWallId: wall.id, sourceIds }
  }

  const centreOffset = nominal(opening, 'centre', options)
  if (opening.width.kind === 'unknown' || opening.width.kind === 'qualitative') {
    return { kind: 'centre-only', openingId: opening.id, hostWallId: wall.id, centreOffset, sourceIds }
  }
  if (opening.width.kind === 'range') {
    return {
      kind: 'range-width', openingId: opening.id, hostWallId: wall.id, centreOffset,
      minimumWidth: opening.width.min, maximumWidth: opening.width.max, sourceIds
    }
  }

  const nominalWidth = nominal(opening, 'width', options)
  if (opening.centreOffset.kind === 'exact' && opening.width.kind === 'exact') {
    return { kind: 'exact', openingId: opening.id, hostWallId: wall.id, sourceIds }
  }
  return {
    kind: 'approximate-aperture', openingId: opening.id, hostWallId: wall.id,
    centreOffset, nominalWidth, sourceIds
  }
}

const nodeFor = (nodes: ReadonlyMap<string, AdePlanNode>, id: string, owner: string): AdePlanNode => {
  const node = nodes.get(id)
  if (!node) throw new Error(`ADE-04B ${owner} references missing node ${id}.`)
  return node
}

const wallGeometry = (
  plan: AdeArchitecturalPlan,
  wall: AdeWallRun,
  projection: PlanPaperProjection,
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => Millimetres
) => {
  const nodes = new Map(plan.nodes.map((node) => [node.id, node]))
  const from = nodeFor(nodes, wall.fromNodeId, wall.id)
  const to = nodeFor(nodes, wall.toNodeId, wall.id)
  const p0 = projection.point(from.point.x, from.point.y)
  const p1 = projection.point(to.point.x, to.point.y)
  const dx = p1.x - p0.x
  const dy = p1.y - p0.y
  const lengthPaper = Math.hypot(dx, dy)
  if (lengthPaper <= EPSILON) throw new Error(`ADE-04B wall ${wall.id} has zero paper-space length.`)
  const tx = dx / lengthPaper
  const ty = dy / lengthPaper
  // Plan projection reflects model +Y. Keep side names in architectural/model space.
  const leftNx = ty
  const leftNy = -tx

  const assembly = plan.wallAssemblies.find((candidate) => candidate.id === wall.assemblyId)
  if (!assembly) throw new Error(`ADE-04B wall ${wall.id} references missing assembly ${wall.assemblyId}.`)
  const thickness = resolveAssemblyThicknessMm(assembly)
  assertResolvedDistanceWithinAuthority(assembly.id, 'wall thickness', assembly.thickness, thickness)

  return { p0, p1, tx, ty, leftNx, leftNy, lengthPaper, thickness, reference: wall.reference }
}

const materialDepthOnSide = (
  wallReference: AdeWallRun['reference'],
  side: 'left' | 'right',
  thickness: Millimetres
): Millimetres => {
  if (wallReference === 'centreline') return (thickness / 2) as Millimetres
  if (wallReference === 'left-face') return (side === 'right' ? thickness : 0) as Millimetres
  return (side === 'left' ? thickness : 0) as Millimetres
}

const line = (
  id: string,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  metadata: Record<string, string | number | boolean | undefined>
): DrawingLine => ({
  kind: 'line', id, a: { x: ax, y: ay }, b: { x: bx, y: by }, role: 'secondary', metadata
})

const note = (
  id: string,
  x: number,
  y: number,
  value: string,
  metadata: Record<string, string | number | boolean | undefined>
): DrawingText => ({
  kind: 'text', id, x, y, value, role: 'note', anchor: 'middle', metadata
})

const hostPossibilityBand = (
  id: string,
  a: { x: number; y: number },
  b: { x: number; y: number },
  tx: number,
  ty: number,
  bandPaperMm: number,
  metadata: Record<string, string | number | boolean | undefined>
): DrawingRect => {
  if (!Number.isFinite(bandPaperMm) || bandPaperMm <= 0) {
    throw new Error('ADE-04B host possibility band must have positive finite paper thickness.')
  }
  const horizontal = Math.abs(ty) <= EPSILON
  const vertical = Math.abs(tx) <= EPSILON
  if (!horizontal && !vertical) {
    throw new Error('ADE-04B host possibility band currently supports orthogonal host walls only.')
  }
  if (horizontal) {
    return {
      kind: 'rect', id,
      x: Math.min(a.x, b.x), y: (a.y + b.y) / 2 - bandPaperMm / 2,
      width: Math.abs(b.x - a.x), height: bandPaperMm,
      fill: 'faint', metadata: { ...metadata, notation: 'possibility-band' }
    }
  }
  return {
    kind: 'rect', id,
    x: (a.x + b.x) / 2 - bandPaperMm / 2, y: Math.min(a.y, b.y),
    width: bandPaperMm, height: Math.abs(b.y - a.y),
    fill: 'faint', metadata: { ...metadata, notation: 'possibility-band' }
  }
}

const formatMm = (value: number): string => `${Math.round(value)} mm`

export const openingUncertaintyToDrawingPrimitives = (
  plan: AdeArchitecturalPlan,
  instruction: AdeOpeningUncertaintyInstruction,
  projection: PlanPaperProjection,
  options: AdeOpeningUncertaintyDrawingOptions
): DrawingPrimitive[] => {
  if (instruction.kind === 'exact') return []
  const wall = plan.walls.find((candidate) => candidate.id === instruction.hostWallId)
  if (!wall) throw new Error(`ADE-04B instruction references missing wall ${instruction.hostWallId}.`)
  const geometry = wallGeometry(plan, wall, projection, options.resolveAssemblyThicknessMm)
  const sideSign = options.annotationSide === 'left' ? 1 : -1
  const nx = geometry.leftNx * sideSign
  const ny = geometry.leftNy * sideSign
  const gap = options.gapPaperMm ?? 3.5
  const tick = options.tickPaperMm ?? 1.6
  const marker = options.markerPaperMm ?? 1.7
  const hostBand = options.hostBandPaperMm ?? 0.9
  const materialDepthPaper = projection.length(materialDepthOnSide(geometry.reference, options.annotationSide, geometry.thickness))
  const offset = materialDepthPaper + gap
  const metadata = {
    epistemic: 'opening-uncertainty', state: instruction.kind,
    opening: instruction.openingId, hostWall: instruction.hostWallId,
    sources: instruction.sourceIds.join(',')
  }

  const pointAlong = (offsetModel: number, normalOffset = offset) => ({
    x: geometry.p0.x + geometry.tx * projection.length(offsetModel) + nx * normalOffset,
    y: geometry.p0.y + geometry.ty * projection.length(offsetModel) + ny * normalOffset
  })
  const tickAt = (id: string, point: { x: number; y: number }, size = tick): DrawingLine =>
    line(id, point.x - nx * size / 2, point.y - ny * size / 2, point.x + nx * size / 2, point.y + ny * size / 2, metadata)

  if (instruction.kind === 'host-obligation') {
    const trim = Math.min(3, geometry.lengthPaper * 0.08)
    const a = { x: geometry.p0.x + geometry.tx * trim + nx * offset, y: geometry.p0.y + geometry.ty * trim + ny * offset }
    const b = { x: geometry.p1.x - geometry.tx * trim + nx * offset, y: geometry.p1.y - geometry.ty * trim + ny * offset }
    const band = hostPossibilityBand(`${instruction.openingId}-host-band`, a, b, geometry.tx, geometry.ty, hostBand, metadata)
    const primitives: DrawingPrimitive[] = [band]
    if (options.showLabels !== false) {
      primitives.push(note(
        `${instruction.openingId}-host-label`, (a.x + b.x) / 2 + nx * 2.3, (a.y + b.y) / 2 + ny * 2.3,
        'opening position unresolved', metadata
      ))
    }
    return primitives
  }

  const centre = pointAlong(instruction.centreOffset)
  if (instruction.kind === 'centre-only') {
    const cx = centre.x
    const cy = centre.y
    const primitives: DrawingPrimitive[] = [
      line(`${instruction.openingId}-pin-1`, cx, cy - marker, cx + marker, cy, metadata),
      line(`${instruction.openingId}-pin-2`, cx + marker, cy, cx, cy + marker, metadata),
      line(`${instruction.openingId}-pin-3`, cx, cy + marker, cx - marker, cy, metadata),
      line(`${instruction.openingId}-pin-4`, cx - marker, cy, cx, cy - marker, metadata),
      line(
        `${instruction.openingId}-pin-leader`,
        cx - nx * marker, cy - ny * marker,
        cx - nx * gap, cy - ny * gap,
        metadata
      )
    ]
    if (options.showLabels !== false) {
      primitives.push(note(`${instruction.openingId}-pin-label`, cx + nx * 3.2, cy + ny * 3.2, 'width unresolved', metadata))
    }
    return primitives
  }

  const spanWidth = instruction.kind === 'range-width' ? instruction.maximumWidth : instruction.nominalWidth
  const halfSpan = projection.length(spanWidth) / 2
  const a = { x: centre.x - geometry.tx * halfSpan, y: centre.y - geometry.ty * halfSpan }
  const b = { x: centre.x + geometry.tx * halfSpan, y: centre.y + geometry.ty * halfSpan }
  const primitives: DrawingPrimitive[] = [
    line(`${instruction.openingId}-span`, a.x, a.y, b.x, b.y, metadata),
    tickAt(`${instruction.openingId}-span-a`, a), tickAt(`${instruction.openingId}-span-b`, b)
  ]

  if (instruction.kind === 'range-width' && instruction.minimumWidth < instruction.maximumWidth - EPSILON) {
    const halfMin = projection.length(instruction.minimumWidth) / 2
    const minA = { x: centre.x - geometry.tx * halfMin, y: centre.y - geometry.ty * halfMin }
    const minB = { x: centre.x + geometry.tx * halfMin, y: centre.y + geometry.ty * halfMin }
    primitives.push(tickAt(`${instruction.openingId}-min-a`, minA, tick * 0.7), tickAt(`${instruction.openingId}-min-b`, minB, tick * 0.7))
  }

  if (options.showLabels !== false) {
    const value = instruction.kind === 'range-width'
      ? `${formatMm(instruction.minimumWidth)}–${formatMm(instruction.maximumWidth)}`
      : `≈ ${formatMm(instruction.nominalWidth)}`
    primitives.push(note(`${instruction.openingId}-span-label`, centre.x + nx * 2.3, centre.y + ny * 2.3, value, metadata))
  }
  return primitives
}
