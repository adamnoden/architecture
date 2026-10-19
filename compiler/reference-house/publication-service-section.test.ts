import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingLine, DrawingRect, DrawingText } from '../publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { createServiceTransverseSectionScene } from './publication-service-section.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'

const scene = () => createServiceTransverseSectionScene(createServiceTransverseSectionSource())
const rects = (): DrawingRect[] => scene().primitives.filter((primitive): primitive is DrawingRect => primitive.kind === 'rect')
const lines = (): DrawingLine[] => scene().primitives.filter((primitive): primitive is DrawingLine => primitive.kind === 'line')
const texts = (): DrawingText[] => scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

describe('DRW-08B service/transverse section renderer', () => {
  test('projects the whole 12 m house width literally at 1:100', () => {
    const drawing = scene()
    assert.equal(drawing.scaleDenominator, 100)
    assert.equal(drawing.widthMm, 166)
    assert.equal(drawing.heightMm, 112)
    const ground = lines().find((primitive) => primitive.id === 'ground-termination')
    assert.ok(ground)
    assert.deepEqual(ground.a, { x: 14, y: 73 })
    assert.deepEqual(ground.b, { x: 134, y: 73 })
  })

  test('keeps the courtyard and gallery/service split on canonical controlled datums', () => {
    const byId = new Map(lines().map((primitive) => [primitive.id, primitive]))
    assert.equal(byId.get('court-west')?.a.x, 56)
    assert.equal(byId.get('court-east')?.a.x, 92)
    const gallery = rects().find((primitive) => primitive.id === 'context-ground-gallery')
    assert.ok(gallery)
    assert.equal(gallery.x, 92)
    assert.equal(gallery.width, 13)
  })

  test('renders SV-01 and PEN-SV-01 only as provisional capacity envelopes', () => {
    const sv = rects().find((primitive) => primitive.id === 'sv-01-reservation')
    const opening = rects().find((primitive) => primitive.id === 'pen-sv-01-envelope')
    assert.ok(sv && opening)
    assert.deepEqual({ x: sv.x, y: sv.y, width: sv.width, height: sv.height }, { x: 105.5, y: 13, width: 9, height: 60 })
    assert.equal(sv.dash, 'provisional')
    assert.equal(sv.metadata?.exactPacking, false)
    assert.deepEqual({ x: opening.x, y: opening.y, width: opening.width, height: opening.height }, { x: 104.75, y: 40, width: 10.5, height: 3.5 })
    assert.equal(opening.dash, 'provisional')
    assert.equal(opening.metadata?.finalSize, false)
  })

  test('uses notation for the service bundle instead of invented individual pipe or duct geometry', () => {
    const capacity = texts().find((primitive) => primitive.id === 'note-capacity')
    assert.ok(capacity)
    assert.match(capacity.value, /soil\/vent/)
    assert.match(capacity.value, /2× MVHR trunks ≈160–200 mm class/)

    const geometricIds = [...rects(), ...lines()].map((primitive) => primitive.id).join(' ')
    assert.doesNotMatch(geometricIds, /soil|water|hydronic|electrical|mv-sup|mv-ext|duct|pipe/i)
  })

  test('shows dry-side access as qualitative relation rather than an exact route', () => {
    const access = lines().filter((primitive) => primitive.id.startsWith('access-'))
    assert.equal(access.length, 2)
    assert.ok(access.every((primitive) => primitive.dash === 'provisional'))
    assert.ok(access.every((primitive) => primitive.metadata?.exactRoute === false))
  })

  test('does not revive the superseded direct-bathroom-extract baseline or technical detail', () => {
    const svg = renderDrawingSceneSvg(scene())
    assert.doesNotMatch(svg, /BX-01|direct bathroom extract|direct-bathroom/i)
    assert.doesNotMatch(svg, /joist|trimmer|firestop product|pipe centreline|duct centreline/i)
    assert.match(svg, /architectural coordination, not MEP detail/)
  })

  test('serializes deterministically with no packet-history leakage', () => {
    const a = renderDrawingSceneSvg(scene())
    const b = renderDrawingSceneSvg(scene())
    assert.equal(a, b)
    assert.match(a, /width="166mm" height="112mm" viewBox="0 0 166 112"/)
    assert.match(a, /data-scale-denominator="100"/)
    assert.doesNotMatch(a, /DRW-08|08A|08B|packet|branch/i)
  })
})
