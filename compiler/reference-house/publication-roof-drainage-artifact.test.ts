import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import {
  PUBLICATION_ROOF_DRAINAGE_PATH,
  renderCanonicalPublicationRoofDrainage
} from './generate-publication-roof-drainage.js'
import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'

const source = () => createRoofDrainagePublicationSource()

describe('DRW-07D controlled roof/drainage SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationRoofDrainage()
    const second = renderCanonicalPublicationRoofDrainage()

    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_ROOF_DRAINAGE_PATH, 'utf8'), first)
  })

  test('retains semantic view identity and literal physical scale in the controlled output', () => {
    const svg = renderCanonicalPublicationRoofDrainage()

    assert.match(svg, /data-view-id="REFERENCE-HOUSE-ROOF-DRAINAGE-PLAN"/)
    assert.match(svg, /data-source-id="REFERENCE-HOUSE-ROOF-DRAINAGE-PLAN"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="166mm" height="145mm"/)
    assert.doesNotMatch(svg, /DRW-07|07D|packet|branch/i)
  })

  test('cross-registers controlled shell/court and all four provisional watersheds', () => {
    const scene = createRoofDrainagePublicationScene(source())
    const rects = scene.primitives.filter((primitive) => primitive.kind === 'rect')
    const lines = scene.primitives.filter((primitive) => primitive.kind === 'line')
    const shell = rects.find((primitive) => primitive.id === 'roof-shell')
    const court = rects.find((primitive) => primitive.id === 'roof-court')
    assert.ok(shell && shell.kind === 'rect')
    assert.ok(court && court.kind === 'rect')
    assert.deepEqual({ x: shell.x, y: shell.y, width: shell.width, height: shell.height }, { x: 8, y: 12, width: 120, height: 108 })
    assert.deepEqual({ x: court.x, y: court.y, width: court.width, height: court.height }, { x: 50, y: 46, width: 36, height: 40 })

    const watersheds = lines.filter((primitive) => primitive.id.startsWith('ROOF-WATERSHED-'))
    assert.equal(watersheds.length, 4)
    assert.ok(watersheds.every((primitive) => primitive.dash === 'provisional'))
  })

  test('retains qualitative drainage topology without manufacturing exact technical geometry', () => {
    const svg = renderCanonicalPublicationRoofDrainage()

    for (const text of [
      'Collection · perimeter',
      'SW · W return',
      'SE · E return',
      'NW · rear/W',
      'NE · rear/E',
      'Soil vent · E zone',
      'No internal outlet',
      'No front RWP',
      'Court collector — east/service-side zone',
      'Primary route — straight → external service-side inspection',
      'Overflow — independent → visible east/service-side outlet'
    ]) assert.ok(svg.includes(text), text)

    assert.doesNotMatch(svg, /<(?:line|rect)[^>]+data-entity="rwp-/i)
    assert.doesNotMatch(svg, /<(?:line|rect)[^>]+data-entity="court-(?:collector|primary-route|overflow)/i)
    assert.doesNotMatch(svg, /data-entity="[^"]*(?:gutter-profile|pipe-diameter|drain-centreline|overflow-level|hydraulic-sizing)[^"]*"/i)
  })

  test('keeps provisional roof semantics and legacy pixel geometry out of the controlled artifact', () => {
    const svg = renderCanonicalPublicationRoofDrainage()
    assert.match(svg, /dash-provisional/)
    assert.match(svg, /≈26\.5 m² · fall ≈1:40/)
    assert.match(svg, /≈31\.1 m² · fall ≈1:40/)
    assert.doesNotMatch(svg, /55 px|55px|roof-drainage-plan-rh08/i)
  })
})
