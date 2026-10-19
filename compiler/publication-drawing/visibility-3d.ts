import type { DrawingLineRole } from './model.js'
import type {
  ModelFace3D,
  ModelPoint3D,
  ParallelProjection3D,
  ProjectedPoint3D,
  Vector3
} from './projection-3d.js'

export type Axis3D = 'x' | 'y' | 'z'
export type ClipKeep3D = 'greater-or-equal' | 'less-or-equal'

export interface AxisAlignedClipPlane3D {
  axis: Axis3D
  coordinate: number
  keep: ClipKeep3D
}

export interface ProjectedLineCandidate3D {
  edgeId: string
  a: ProjectedPoint3D
  b: ProjectedPoint3D
  role: DrawingLineRole
}

export interface CleanProjectedLine3D extends ProjectedLineCandidate3D {}

const NORMAL_TOLERANCE = 1e-10

const axisValue = (point: ModelPoint3D, axis: Axis3D): number => point[axis]

const inside = (point: ModelPoint3D, plane: AxisAlignedClipPlane3D): boolean => {
  const value = axisValue(point, plane.axis)
  return plane.keep === 'greater-or-equal'
    ? value >= plane.coordinate
    : value <= plane.coordinate
}

const interpolate = (a: ModelPoint3D, b: ModelPoint3D, plane: AxisAlignedClipPlane3D): ModelPoint3D => {
  const av = axisValue(a, plane.axis)
  const bv = axisValue(b, plane.axis)
  if (av === bv) throw new Error('Cannot intersect a parallel edge with the clip plane.')
  const t = (plane.coordinate - av) / (bv - av)
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t
  }
}

/**
 * Clip one polygonal face against one axis-aligned half-space. Vertex order is
 * preserved. The operation does not create a sectional cap or classify edges.
 */
export const clipModelFaceByAxisPlane = (
  face: ModelFace3D,
  plane: AxisAlignedClipPlane3D
): ModelFace3D | null => {
  if (!Number.isFinite(plane.coordinate)) throw new Error('3D clip coordinate must be finite.')
  if (face.vertices.length < 3) throw new Error('3D face clipping requires at least three vertices.')

  const output: ModelPoint3D[] = []
  let previous = face.vertices[face.vertices.length - 1]
  let previousInside = inside(previous, plane)

  for (const current of face.vertices) {
    const currentInside = inside(current, plane)
    if (currentInside !== previousInside) output.push(interpolate(previous, current, plane))
    if (currentInside) output.push(current)
    previous = current
    previousInside = currentInside
  }

  if (output.length < 3) return null
  return { id: face.id, vertices: output }
}

const subtract = (a: ModelPoint3D, b: ModelPoint3D): Vector3 => [a.x - b.x, a.y - b.y, a.z - b.z]
const cross = (a: Vector3, b: Vector3): Vector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
]
const dot = (a: Vector3, b: Vector3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const vectorLength = (value: Vector3): number => Math.sqrt(dot(value, value))

export const faceNormal3D = (face: ModelFace3D): Vector3 => {
  if (face.vertices.length < 3) throw new Error('3D face normal requires at least three vertices.')
  const origin = face.vertices[0]

  for (let index = 1; index < face.vertices.length - 1; index += 1) {
    const a = subtract(face.vertices[index], origin)
    const b = subtract(face.vertices[index + 1], origin)
    const candidate = cross(a, b)
    const length = vectorLength(candidate)
    if (length > NORMAL_TOLERANCE) return [candidate[0] / length, candidate[1] / length, candidate[2] / length]
  }

  throw new Error(`3D face ${face.id} is degenerate and has no stable normal.`)
}

export const isFaceFrontFacing3D = (face: ModelFace3D, viewDirection: Vector3): boolean =>
  dot(faceNormal3D(face), viewDirection) > NORMAL_TOLERANCE

const meanDepth = (face: ModelFace3D, projection: ParallelProjection3D): number =>
  face.vertices.reduce((sum, point) => sum + projection.project(point).depth, 0) / face.vertices.length

/** Back-to-front painter order. Larger projected depth is closer to the viewer. */
export const orderFacesBackToFront3D = (
  faces: readonly ModelFace3D[],
  projection: ParallelProjection3D
): ModelFace3D[] => [...faces].sort((a, b) => {
  const delta = meanDepth(a, projection) - meanDepth(b, projection)
  return Math.abs(delta) > NORMAL_TOLERANCE ? delta : a.id.localeCompare(b.id)
})

const roleStrength: Record<DrawingLineRole, number> = {
  secondary: 1,
  primary: 2,
  profile: 3,
  cut: 4
}

const sameProjectedPoint = (a: ProjectedPoint3D, b: ProjectedPoint3D): boolean =>
  a.horizontal === b.horizontal && a.vertical === b.vertical && a.depth === b.depth

const sameProjectedEdge = (a: ProjectedLineCandidate3D, b: ProjectedLineCandidate3D): boolean =>
  (sameProjectedPoint(a.a, b.a) && sameProjectedPoint(a.b, b.b)) ||
  (sameProjectedPoint(a.a, b.b) && sameProjectedPoint(a.b, b.a))

/**
 * Collapse repeated topology-owned edge candidates while preserving the strongest
 * semantic line role. Callers must supply stable edge ids; coordinate proximity
 * is deliberately not used as a source of topological authority.
 */
export const cleanProjectedLineCandidates3D = (
  candidates: readonly ProjectedLineCandidate3D[]
): CleanProjectedLine3D[] => {
  const clean = new Map<string, CleanProjectedLine3D>()

  for (const candidate of candidates) {
    if (!candidate.edgeId) throw new Error('Projected edge candidate requires a stable edge id.')
    const existing = clean.get(candidate.edgeId)
    if (!existing) {
      clean.set(candidate.edgeId, { ...candidate })
      continue
    }
    if (!sameProjectedEdge(existing, candidate)) {
      throw new Error(`Projected edge id ${candidate.edgeId} was reused for different geometry.`)
    }
    if (roleStrength[candidate.role] > roleStrength[existing.role]) existing.role = candidate.role
  }

  return [...clean.values()]
}
