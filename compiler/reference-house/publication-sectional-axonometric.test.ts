import assert from 'node:assert/strict'
import test from 'node:test'

import { createSectionalAxonometricPublicationScene } from './publication-sectional-axonometric.js'

test('DRW-09D scene is explicitly NTS and keeps every primitive inside its physical scene', () => {
  const scene = createSectionalAxonometricPublicationScene()
  assert.equal(scene.scaleDenominator, 'NTS')
  assert.equal(scene.widthMm, 166)
  assert.equal(scene.heightMm, 112)

  for (const primitive of scene.primitives) {
    if (primitive.kind === 'line') {
      for (const point of [primitive.a, primitive.b]) {
        assert.ok(point.x >= 0 && point.x <= scene.widthMm, `${primitive.id} x escaped scene`)
        assert.ok(point.y >= 0 && point.y <= scene.heightMm, `${primitive.id} y escaped scene`)
      }
    } else if (primitive.kind === 'text') {
      assert.ok(primitive.x >= 0 && primitive.x <= scene.widthMm, `${primitive.id} x escaped scene`)
      assert.ok(primitive.y >= 0 && primitive.y <= scene.heightMm, `${primitive.id} y escaped scene`)
    }
  }
})

test('DRW-09D scene exposes controlled court/storey order and the frozen section cut', () => {
  const scene = createSectionalAxonometricPublicationScene()
  const lines = scene.primitives.filter((primitive) => primitive.kind === 'line')
  const cutLines = lines.filter((primitive) => primitive.role === 'cut')

  assert.ok(cutLines.length >= 8)
  assert.ok(cutLines.every((primitive) => primitive.metadata?.relation === 'section-cut-edge' || primitive.metadata?.role === 'section-cut-vertical'))
  assert.ok(scene.primitives.some((primitive) => primitive.id === 'court-void-label'))
  assert.ok(scene.primitives.some((primitive) => primitive.id.startsWith('first-floor-order-')))
  assert.ok(scene.primitives.some((primitive) => primitive.id.startsWith('upper-ceiling-order-')))
})

test('DRW-09D shows service capacity without packed MEP or manufactured terminal geometry', () => {
  const scene = createSectionalAxonometricPublicationScene()
  const sv = scene.primitives.filter((primitive) => primitive.id.startsWith('sv01-'))
  assert.equal(sv.length, 12)
  assert.ok(sv.every((primitive) => primitive.kind === 'line' && primitive.dash === 'provisional'))
  assert.ok(sv.every((primitive) => primitive.metadata?.role === 'capacity-zone-not-packed-services'))

  const serialized = JSON.stringify(scene)
  for (const forbidden of ['pipe-centreline', 'duct-centreline', 'plant-product', 'terminal-point', 'window-solid', 'door-solid']) {
    assert.equal(serialized.includes(forbidden), false)
  }
})

test('DRW-09D spatialises only provisional outer roof control, not fictional exact roof fall surfaces', () => {
  const scene = createSectionalAxonometricPublicationScene()
  const roofLines = scene.primitives.filter((primitive) => primitive.id.startsWith('roof-outer-control-'))
  assert.equal(roofLines.length, 3)
  assert.ok(roofLines.every((primitive) => primitive.kind === 'line' && primitive.dash === 'provisional'))

  const note = scene.primitives.find((primitive) => primitive.id === 'roof-note-2')
  assert.ok(note && note.kind === 'text')
  assert.equal(note.metadata?.roofVerticalGeometry, 'ABSENT')
})

test('DRW-09D retains the DRW-08F non-composability rule in the hero scene', () => {
  const scene = createSectionalAxonometricPublicationScene()
  const note = scene.primitives.find((primitive) => primitive.id === 'opening-note')
  assert.ok(note && note.kind === 'text')
  assert.equal(note.metadata?.viewLocalProxyComposition, 'FORBIDDEN')
  assert.equal(scene.primitives.some((primitive) => primitive.id.includes('aperture')), false)
})
