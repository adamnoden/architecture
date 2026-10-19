export interface ModelPoint2D {
  x: number
  y: number
}

export interface ModelPoint3D {
  x: number
  y: number
  z: number
}

export type Vector3 = readonly [number, number, number]

export interface ProjectedPoint3D {
  horizontal: number
  vertical: number
  depth: number
}

export interface ParallelProjectionBasis3D {
  horizontal: Vector3
  vertical: Vector3
  viewDirection: Vector3
}

export interface ParallelProjection3D {
  basis: ParallelProjectionBasis3D
  origin: ModelPoint3D
  project: (point: ModelPoint3D) => ProjectedPoint3D
}

export interface ModelFace3D {
  id: string
  vertices: readonly ModelPoint3D[]
}

export interface ExtrudedPolygon3D {
  id: string
  z0: number
  z1: number
  faces: readonly ModelFace3D[]
}

const BASIS_TOLERANCE = 1e-10

const dot = (a: Vector3, b: Vector3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

const cross = (a: Vector3, b: Vector3): Vector3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
]

const vectorLength = (value: Vector3): number => Math.sqrt(dot(value, value))

const finiteVector = (value: Vector3): boolean => value.every(Number.isFinite)

const finitePoint3D = (value: ModelPoint3D): boolean =>
  Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z)

const finitePoint2D = (value: ModelPoint2D): boolean =>
  Number.isFinite(value.x) && Number.isFinite(value.y)

const near = (a: number, b: number, tolerance = BASIS_TOLERANCE): boolean =>
  Math.abs(a - b) <= tolerance

const assertUnitVector = (name: string, value: Vector3): void => {
  if (!finiteVector(value) || !near(vectorLength(value), 1)) {
    throw new Error(`Parallel projection ${name} basis must be a finite unit vector.`)
  }
}

export const assertParallelProjectionBasis3D = (basis: ParallelProjectionBasis3D): void => {
  assertUnitVector('horizontal', basis.horizontal)
  assertUnitVector('vertical', basis.vertical)
  assertUnitVector('view-direction', basis.viewDirection)

  if (!near(dot(basis.horizontal, basis.vertical), 0) ||
      !near(dot(basis.horizontal, basis.viewDirection), 0) ||
      !near(dot(basis.vertical, basis.viewDirection), 0)) {
    throw new Error('Parallel projection basis vectors must be mutually orthogonal.')
  }

  const handed = cross(basis.horizontal, basis.vertical)
  if (!near(handed[0], basis.viewDirection[0]) ||
      !near(handed[1], basis.viewDirection[1]) ||
      !near(handed[2], basis.viewDirection[2])) {
    throw new Error('Parallel projection basis must be right-handed: horizontal × vertical = view direction.')
  }
}

/**
 * Deterministic orthographic projection from model XYZ into a 2D view plane plus
 * signed depth. No perspective, fit-to-box or paper scaling exists here.
 */
export const createParallelProjection3D = (options: {
  basis: ParallelProjectionBasis3D
  origin?: ModelPoint3D
}): ParallelProjection3D => {
  assertParallelProjectionBasis3D(options.basis)
  const origin = options.origin ?? { x: 0, y: 0, z: 0 }
  if (!finitePoint3D(origin)) throw new Error('Parallel projection origin must be finite.')

  const project = (point: ModelPoint3D): ProjectedPoint3D => {
    if (!finitePoint3D(point)) throw new Error('Parallel projection point must be finite.')
    const delta: Vector3 = [point.x - origin.x, point.y - origin.y, point.z - origin.z]
    return {
      horizontal: dot(delta, options.basis.horizontal),
      vertical: dot(delta, options.basis.vertical),
      depth: dot(delta, options.basis.viewDirection)
    }
  }

  return { basis: options.basis, origin, project }
}

/**
 * Extrude a caller-owned plan polygon between two Z datums. The polygon is
 * assumed to be supplied counter-clockwise when viewed from +Z. Face order is
 * deterministic: bottom, top, then one side per plan edge. No clipping,
 * visibility, culling or drawing-role decisions are made here.
 */
export const extrudePlanPolygonZ = (options: {
  id: string
  vertices: readonly ModelPoint2D[]
  z0: number
  z1: number
}): ExtrudedPolygon3D => {
  const { id, vertices, z0, z1 } = options
  if (!id) throw new Error('Extruded polygon requires a non-empty id.')
  if (vertices.length < 3) throw new Error('Extruded polygon requires at least three plan vertices.')
  if (!vertices.every(finitePoint2D)) throw new Error('Extruded polygon vertices must be finite.')
  if (!Number.isFinite(z0) || !Number.isFinite(z1) || z1 <= z0) {
    throw new Error('Extruded polygon requires finite Z datums with z1 > z0.')
  }

  const lower = vertices.map(({ x, y }) => ({ x, y, z: z0 }))
  const upper = vertices.map(({ x, y }) => ({ x, y, z: z1 }))

  const faces: ModelFace3D[] = [
    { id: `${id}-bottom`, vertices: [...lower].reverse() },
    { id: `${id}-top`, vertices: upper },
    ...vertices.map((_, index) => {
      const next = (index + 1) % vertices.length
      return {
        id: `${id}-side-${index}`,
        vertices: [lower[index], lower[next], upper[next], upper[index]]
      }
    })
  ]

  return { id, z0, z1, faces }
}
