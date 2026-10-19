import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingScene } from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { PUBLICATION_DRAWING_TOKENS } from '../publication-drawing/tokens.js'

describe('DRW-03C publication drawing foundation', () => {
  test('encodes the frozen DRW-01B line and type hierarchy in physical paper units', () => {
    assert.deepEqual(PUBLICATION_DRAWING_TOKENS.lineMm, {
      cut: 0.5,
      profile: 0.35,
      primary: 0.25,
      secondary: 0.18
    })
    assert.ok(Math.abs(PUBLICATION_DRAWING_TOKENS.textMm.label - 2.645833333333333) < 1e-9)
    assert.ok(Math.abs(PUBLICATION_DRAWING_TOKENS.textMm.note - 2.2930555555555556) < 1e-9)
    assert.equal(PUBLICATION_DRAWING_TOKENS.textMm.marker, PUBLICATION_DRAWING_TOKENS.textMm.note)
    assert.deepEqual(PUBLICATION_DRAWING_TOKENS.dashMm.overhead, [3, 1.5])
    assert.deepEqual(PUBLICATION_DRAWING_TOKENS.dashMm.datum, [6, 1.5, 1, 1.5])
    assert.deepEqual(PUBLICATION_DRAWING_TOKENS.dashMm.provisional, [1, 1])
  })

  test('projects the 12.0 × 10.8 m Reference House shell to exactly 120 × 108 mm at 1:100', () => {
    const project = createPlanPaperProjection({
      scaleDenominator: 100,
      modelBounds: { x: 0, y: 0, width: 12000, height: 10800 },
      paperOrigin: { x: 4, y: 10 }
    })

    assert.equal(project.length(12000), 120)
    assert.equal(project.length(10800), 108)
    assert.deepEqual(project.point(0, 10800), { x: 4, y: 10 })
    assert.deepEqual(project.point(12000, 0), { x: 124, y: 118 })
    assert.deepEqual(project.rect({ x: 4200, y: 3400, width: 3600, height: 4000 }), {
      x: 46,
      y: 44,
      width: 36,
      height: 40
    })
  })

  test('serializes deterministic SVG geometry in user-space millimetres and type as matching SVG user units', () => {
    const scene: DrawingScene = {
      widthMm: 128,
      heightMm: 112,
      viewId: 'DRW-TEST-PLAN',
      title: 'Drawing foundation proof',
      description: 'Synthetic scene.',
      scaleDenominator: 100,
      sourceId: 'TEST-SOURCE',
      primitives: [
        {
          kind: 'rect',
          id: 'CUT-01',
          x: 4,
          y: 10,
          width: 120,
          height: 4,
          fill: 'ink',
          metadata: { provisional: false, source: 'SHELL-01' }
        },
        {
          kind: 'line',
          id: 'LINE-01',
          a: { x: 4, y: 20 },
          b: { x: 124, y: 20 },
          role: 'cut'
        },
        {
          kind: 'line',
          id: 'LINE-02',
          a: { x: 4, y: 24 },
          b: { x: 124, y: 24 },
          role: 'secondary',
          dash: 'provisional'
        },
        {
          kind: 'text',
          id: 'TEXT-01',
          x: 64,
          y: 30,
          value: 'Drawing room',
          role: 'label',
          anchor: 'middle'
        }
      ]
    }

    const a = renderDrawingSceneSvg(scene)
    const b = renderDrawingSceneSvg(structuredClone(scene))

    assert.equal(a, b)
    assert.match(a, /width="128mm" height="112mm" viewBox="0 0 128 112"/)
    assert.match(a, /\.line-cut\{stroke:#000000;stroke-width:0\.5;/)
    assert.match(a, /\.line-secondary\{stroke:#000000;stroke-width:0\.18;/)
    assert.match(a, /\.text-label\{[^}]*font-size:2\.646px;/)
    assert.match(a, /\.text-note\{[^}]*font-size:2\.293px;/)
    assert.match(a, /\.text-marker\{[^}]*font-size:2\.293px;/)
    assert.doesNotMatch(a, /font-size:(?:2\.646|2\.293)mm;/)
    assert.match(a, /\.dash-provisional\{stroke-dasharray:1 1\}/)
    assert.match(a, /data-provisional="false" data-source="SHELL-01"/)
  })

  test('rejects invalid scale and paper geometry instead of normalising it silently', () => {
    assert.throws(
      () => createPlanPaperProjection({ scaleDenominator: 0, modelBounds: { x: 0, y: 0, width: 1, height: 1 }, paperOrigin: { x: 0, y: 0 } }),
      /Invalid drawing scale denominator/
    )
    assert.throws(
      () => renderDrawingSceneSvg({ widthMm: 0, heightMm: 10, viewId: 'X', title: 'X', description: 'X', scaleDenominator: 100, sourceId: 'X', primitives: [] }),
      /positive paper dimensions/
    )
  })
})
