import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assertParallelProjectionBasis3D,
  createParallelProjection3D,
  extrudePlanPolygonZ,
  type ParallelProjectionBasis3D,
  type ProjectedPoint3D
} from './projection-3d.js'

const SQRT_2 = Math.sqrt(2)
const SQRT_3 = Math.sqrt(3)
const SQRT_6 = Math.sqrt(6)

const ISOMETRIC_BASIS: ParallelProjectionBasis3D = {
  horizontal: [1 / SQRT_2, 1 / SQRT_2, 0],
  vertical: [-1 / SQRT_6, 1 / SQRT_6, 2 / SQRT_6],
  viewDirection: [1 / SQRT_3, -1 / SQRT_3, 1 / SQRT_3]
}

const near = (a: number, b: number, tolerance = 1e-10): boolean => Math.abs(a - b) <= tolerance
const projectedLength = (value: ProjectedPoint3D): number => Math.hypot(value.horizontal, value.vertical)

test('DRW-09B accepts the frozen right-handed isometric basis and rejects malformed bases', () => {
  assert.doesNotThrow(() => assertParallelProjectionBasis3D(ISOMETRIC_BASIS))

  assert.throws(
    () => assertParallelProjectionBasis3D({
      horizontal: [1, 0, 0],
      vertical: [1, 0, 0],
      viewDirection: [0, 0, 1]
    }),
    /mutually orthogonal/
  )

  assert.throws(
    () => assertParallelProjectionBasis3D({
      horizontal: [1, 0, 0],
      vertical: [0, 1, 0],
      viewDirection: [0, 0, -1]
    }),
    /right-handed/
  )
})

test('DRW-09B parallel projection has no perspective and preserves equal isometric foreshortening', () => {
  const projection = createParallelProjection3D({ basis: ISOMETRIC_BASIS })
  const origin = projection.project({ x: 0, y: 0, z: 0 })
  const x = projection.project({ x: 1, y: 0, z: 0 })
  const y = projection.project({ x: 0, y: 1, z: 0 })
  const z = projection.project({ x: 0, y: 0, z: 1 })

  assert.ok(near(projectedLength(x), projectedLength(y)))
  assert.ok(near(projectedLength(y), projectedLength(z)))

  const p = { x: 1200, y: 3400, z: 3300 }
  const projected = projection.project(p)
  const alongView = {
    x: p.x + ISOMETRIC_BASIS.viewDirection[0] * 5000,
    y: p.y + ISOMETRIC_BASIS.viewDirection[1] * 5000,
    z: p.z + ISOMETRIC_BASIS.viewDirection[2] * 5000
  }
  const projectedAlongView = projection.project(alongView)

  assert.ok(near(projected.horizontal, projectedAlongView.horizontal))
  assert.ok(near(projected.vertical, projectedAlongView.vertical))
  assert.ok(near(projectedAlongView.depth - projected.depth, 5000))
  assert.deepEqual(origin, { horizontal: 0, vertical: 0, depth: 0 })
})

test('DRW-09B projection origin is explicit and deterministic', () => {
  const projection = createParallelProjection3D({
    basis: ISOMETRIC_BASIS,
    origin: { x: 100, y: 200, z: 300 }
  })

  assert.deepEqual(projection.project({ x: 100, y: 200, z: 300 }), {
    horizontal: 0,
    vertical: 0,
    depth: 0
  })
  assert.deepEqual(
    projection.project({ x: 400, y: 500, z: 600 }),
    projection.project({ x: 400, y: 500, z: 600 })
  )
})

test('DRW-09B extrudes a counter-clockwise plan polygon into deterministic faces without culling', () => {
  const prism = extrudePlanPolygonZ({
    id: 'test-prism',
    vertices: [
      { x: 0, y: 0 },
      { x: 1000, y: 0 },
      { x: 1000, y: 500 },
      { x: 0, y: 500 }
    ],
    z0: 0,
    z1: 3000
  })

  assert.equal(prism.faces.length, 6)
  assert.deepEqual(prism.faces.map((face) => face.id), [
    'test-prism-bottom',
    'test-prism-top',
    'test-prism-side-0',
    'test-prism-side-1',
    'test-prism-side-2',
    'test-prism-side-3'
  ])
  assert.ok(prism.faces[0].vertices.every((vertex) => vertex.z === 0))
  assert.ok(prism.faces[1].vertices.every((vertex) => vertex.z === 3000))
  assert.deepEqual(prism.faces[2].vertices, [
    { x: 0, y: 0, z: 0 },
    { x: 1000, y: 0, z: 0 },
    { x: 1000, y: 0, z: 3000 },
    { x: 0, y: 0, z: 3000 }
  ])
})

test('DRW-09B rejects invalid extrusion geometry rather than repairing it', () => {
  assert.throws(
    () => extrudePlanPolygonZ({ id: 'short', vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }], z0: 0, z1: 1 }),
    /at least three/
  )
  assert.throws(
    () => extrudePlanPolygonZ({
      id: 'flat',
      vertices: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }],
      z0: 1,
      z1: 1
    }),
    /z1 > z0/
  )
})
