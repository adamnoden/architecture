import assert from 'node:assert/strict'
import test from 'node:test'
import { createCourtyardElevationPublicationScene } from './publication-courtyard-elevation.js'
import { createCourtyardElevationPublicationSource } from './publication-courtyard-elevation-source.js'

test('DRW-08D keeps the retained courtyard plate at true 1:50 and uses only opposed north/south geometry', () => {
  const scene = createCourtyardElevationPublicationScene(createCourtyardElevationPublicationSource())
  assert.equal(scene.scaleDenominator, 50)
  assert.equal(scene.widthMm, 166)
  assert.equal(scene.heightMm, 160)
  assert.ok(scene.primitives.some((primitive) => primitive.id === 'SOUTH-axis'))
  assert.ok(scene.primitives.some((primitive) => primitive.id === 'NORTH-axis'))
  assert.equal(scene.primitives.some((primitive) => primitive.id.startsWith('EAST-') || primitive.id.startsWith('WEST-')), false)
})

test('DRW-08D draws no courtyard aperture rectangles because extents are absent', () => {
  const scene = createCourtyardElevationPublicationScene(createCourtyardElevationPublicationSource())
  assert.equal(scene.primitives.some((primitive) => primitive.kind === 'rect'), false)
  const occurrence = scene.primitives.filter((primitive) => primitive.id.endsWith('-ground-occurrence') || primitive.id.endsWith('-upper-occurrence'))
  assert.equal(occurrence.length, 4)
  assert.ok(occurrence.every((primitive) => primitive.metadata?.apertureGeometry === 'ABSENT'))
})

test('DRW-08D preserves east/west order as non-coordinate notation', () => {
  const scene = createCourtyardElevationPublicationScene(createCourtyardElevationPublicationSource())
  const east = scene.primitives.find((primitive) => primitive.id === 'east-order-note')
  const west = scene.primitives.find((primitive) => primitive.id === 'west-order-note')
  assert.ok(east && west)
  assert.equal(east.metadata?.geometry, 'ABSENT')
  assert.equal(west.metadata?.geometry, 'ABSENT')
})
