import assert from 'node:assert/strict'
import test from 'node:test'

import type { DrawingScene } from '../publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import type { DrawingSceneV2 } from './model.js'
import { renderDrawingSceneV2Svg } from './svg.js'

const legacyScene = (): DrawingScene => ({
  widthMm: 100,
  heightMm: 80,
  viewId: 'V2-LEGACY-COMPAT',
  title: 'Legacy compatibility',
  description: 'V1 primitives serialized through both contracts.',
  scaleDenominator: 100,
  sourceId: 'V2-TEST',
  primitives: [
    { kind: 'line', id: 'line', a: { x: 10, y: 10 }, b: { x: 90, y: 10 }, role: 'primary' },
    { kind: 'rect', id: 'rect', x: 20, y: 20, width: 20, height: 10, stroke: 'secondary', fill: 'faint' },
    { kind: 'text', id: 'text', x: 50, y: 50, value: 'Room', role: 'label', anchor: 'middle' }
  ]
})

test('publication-drawing-v2 is byte-identical to frozen v1 for the v1 primitive set', () => {
  const v1 = legacyScene()
  const v2: DrawingSceneV2 = { ...v1, primitives: [...v1.primitives] }
  assert.equal(renderDrawingSceneV2Svg(v2), renderDrawingSceneSvg(v1))
})

test('publication-drawing-v2 serializes multiple closed rings as one even-odd vector region', () => {
  const scene: DrawingSceneV2 = {
    widthMm: 100,
    heightMm: 100,
    viewId: 'PATH-TEST',
    title: 'Path test',
    description: 'Joined outer region with inner hole.',
    scaleDenominator: 100,
    sourceId: 'PATH-TEST-SOURCE',
    primitives: [
      {
        kind: 'path',
        id: 'joined-wall-region',
        rings: [
          [{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 90 }, { x: 10, y: 90 }],
          [{ x: 30, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }, { x: 70, y: 30 }]
        ],
        stroke: 'profile',
        fill: 'faint',
        metadata: { topology: 'joined', holeCount: 1 }
      }
    ]
  }

  const svg = renderDrawingSceneV2Svg(scene)
  assert.match(svg, /<path d="M 10 10 L 90 10 L 90 90 L 10 90 Z M 30 30 L 30 70 L 70 70 L 70 30 Z" fill-rule="evenodd"/)
  assert.match(svg, /class="line-profile fill-faint"/)
  assert.match(svg, /data-holeCount="1" data-topology="joined"/)
  assert.equal((svg.match(/<path /g) ?? []).length, 1)
})

test('publication-drawing-v2 rejects degenerate path rings', () => {
  const scene: DrawingSceneV2 = {
    widthMm: 50,
    heightMm: 50,
    viewId: 'PATH-BAD',
    title: 'Bad path',
    description: 'Degenerate ring.',
    scaleDenominator: 50,
    sourceId: 'PATH-TEST-SOURCE',
    primitives: [{ kind: 'path', id: 'bad', rings: [[{ x: 1, y: 1 }, { x: 2, y: 2 }]], fill: 'ink' }]
  }

  assert.throws(() => renderDrawingSceneV2Svg(scene), /requires at least three points/)
})
