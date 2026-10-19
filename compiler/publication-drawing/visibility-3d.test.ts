import assert from 'node:assert/strict'
import test from 'node:test'

import { createParallelProjection3D, extrudePlanPolygonZ, type ModelFace3D } from './projection-3d.js'
import {
  cleanProjectedLineCandidates3D,
  clipModelFaceByAxisPlane,
  faceNormal3D,
  isFaceFrontFacing3D,
  orderFacesBackToFront3D
} from './visibility-3d.js'

test('DRW-09C clips polygonal faces against an axis-aligned half-space without inventing a cap', () => {
  const face: ModelFace3D = {
    id: 'floor-face',
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 10, y: 10, z: 0 },
      { x: 0, y: 10, z: 0 }
    ]
  }

  const clipped = clipModelFaceByAxisPlane(face, {
    axis: 'y',
    coordinate: 4,
    keep: 'greater-or-equal'
  })

  assert.ok(clipped)
  assert.deepEqual(clipped.vertices, [
    { x: 0, y: 4, z: 0 },
    { x: 10, y: 4, z: 0 },
    { x: 10, y: 10, z: 0 },
    { x: 0, y: 10, z: 0 }
  ])
  assert.equal(clipModelFaceByAxisPlane(face, {
    axis: 'y',
    coordinate: 11,
    keep: 'greater-or-equal'
  }), null)
})

test('DRW-09C face normal and front-facing tests respect caller-owned winding', () => {
  const prism = extrudePlanPolygonZ({
    id: 'box',
    vertices: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 }
    ],
    z0: 0,
    z1: 1
  })
  const bottom = prism.faces.find((face) => face.id === 'box-bottom')
  const top = prism.faces.find((face) => face.id === 'box-top')
  assert.ok(bottom && top)

  assert.deepEqual(faceNormal3D(top), [0, 0, 1])
  assert.deepEqual(faceNormal3D(bottom), [0, 0, -1])
  assert.equal(isFaceFrontFacing3D(top, [0, 0, 1]), true)
  assert.equal(isFaceFrontFacing3D(bottom, [0, 0, 1]), false)
})

test('DRW-09C orders faces back-to-front by explicit projection depth with stable id tie-breaks', () => {
  const projection = createParallelProjection3D({
    basis: {
      horizontal: [1, 0, 0],
      vertical: [0, 1, 0],
      viewDirection: [0, 0, 1]
    }
  })
  const face = (id: string, z: number): ModelFace3D => ({
    id,
    vertices: [
      { x: 0, y: 0, z },
      { x: 1, y: 0, z },
      { x: 1, y: 1, z },
      { x: 0, y: 1, z }
    ]
  })

  assert.deepEqual(
    orderFacesBackToFront3D([face('near', 10), face('far-b', 0), face('far-a', 0)], projection).map((item) => item.id),
    ['far-a', 'far-b', 'near']
  )
})

test('DRW-09C line cleanup preserves topology ids and promotes the strongest semantic role', () => {
  const a = { horizontal: 1, vertical: 2, depth: 3 }
  const b = { horizontal: 4, vertical: 5, depth: 6 }
  const clean = cleanProjectedLineCandidates3D([
    { edgeId: 'edge-1', a, b, role: 'secondary' },
    { edgeId: 'edge-1', a: b, b: a, role: 'cut' },
    { edgeId: 'edge-2', a, b, role: 'primary' }
  ])

  assert.equal(clean.length, 2)
  assert.equal(clean[0].edgeId, 'edge-1')
  assert.equal(clean[0].role, 'cut')
  assert.equal(clean[1].role, 'primary')
})

test('DRW-09C refuses to merge one semantic edge id across different projected geometry', () => {
  assert.throws(() => cleanProjectedLineCandidates3D([
    {
      edgeId: 'edge-1',
      a: { horizontal: 0, vertical: 0, depth: 0 },
      b: { horizontal: 1, vertical: 0, depth: 0 },
      role: 'primary'
    },
    {
      edgeId: 'edge-1',
      a: { horizontal: 0, vertical: 0, depth: 0 },
      b: { horizontal: 2, vertical: 0, depth: 0 },
      role: 'profile'
    }
  ]), /reused for different geometry/)
})
