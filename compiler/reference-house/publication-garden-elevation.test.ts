import assert from 'node:assert/strict'
import test from 'node:test'
import { createGardenElevationPublicationScene } from './publication-garden-elevation.js'
import { createGardenElevationPublicationSource } from './publication-garden-elevation-source.js'

test('DRW-08C renders only bounded provisional openings as aperture envelopes', () => {
  const scene = createGardenElevationPublicationScene(createGardenElevationPublicationSource())
  const ids = scene.primitives.map((primitive) => primitive.id)
  for (const id of ['opening-G-GARDEN-WEST-envelope', 'opening-U-GARDEN-WEST-envelope', 'opening-U-GARDEN-EAST-envelope']) assert.ok(ids.includes(id), id)
  assert.ok(!ids.includes('opening-G-GARDEN-CENTRE-envelope'))
  assert.ok(!ids.includes('opening-G-GARDEN-EAST-envelope'))
  assert.ok(!ids.includes('opening-U-GARDEN-CENTRE-envelope'))
})

test('DRW-08C represents unresolved selected occurrences without fabricating apertures', () => {
  const scene = createGardenElevationPublicationScene(createGardenElevationPublicationSource())
  const byId = new Map(scene.primitives.map((primitive) => [primitive.id, primitive]))
  assert.ok(byId.has('garden-clear-target'))
  assert.ok(byId.has('upper-centre-occurrence-axis'))
  assert.ok(byId.has('ground-east-occurrence-tick'))
  const target = byId.get('garden-clear-target')
  assert.ok(target && target.kind === 'line')
  assert.equal(target.metadata?.apertureGeometry, 'ABSENT')
})

test('DRW-08C keeps composition axes as notation rather than facade divisions', () => {
  const scene = createGardenElevationPublicationScene(createGardenElevationPublicationSource())
  const axisLines = scene.primitives.filter((primitive) => primitive.id.startsWith('garden-axis-') && primitive.id.endsWith('-tick'))
  assert.equal(axisLines.length, 3)
  assert.ok(axisLines.every((primitive) => primitive.metadata?.role === 'composition-axis-not-panel-edge'))
  assert.equal(scene.primitives.some((primitive) => primitive.id.includes('facade-panel')), false)
})
