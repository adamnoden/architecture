import assert from 'node:assert/strict'
import test from 'node:test'

import type { DrawingScene } from './model.js'
import { renderDrawingSceneSvg } from './svg.js'

test('DrawingPath serializes multiple closed rings as one even-odd vector region', () => {
  const scene: DrawingScene = {
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

  const svg = renderDrawingSceneSvg(scene)
  assert.match(svg, /<path d="M 10 10 L 90 10 L 90 90 L 10 90 Z M 30 30 L 30 70 L 70 70 L 70 30 Z" fill-rule="evenodd"/)
  assert.match(svg, /class="line-profile fill-faint"/)
  assert.match(svg, /data-holeCount="1" data-topology="joined"/)
  assert.equal((svg.match(/<path /g) ?? []).length, 1)
})

test('DrawingPath rejects degenerate rings rather than emitting invalid topology', () => {
  const scene: DrawingScene = {
    widthMm: 50,
    heightMm: 50,
    viewId: 'PATH-BAD',
    title: 'Bad path',
    description: 'Degenerate ring.',
    scaleDenominator: 50,
    sourceId: 'PATH-TEST-SOURCE',
    primitives: [{ kind: 'path', id: 'bad', rings: [[{ x: 1, y: 1 }, { x: 2, y: 2 }]], fill: 'ink' }]
  }

  assert.throws(() => renderDrawingSceneSvg(scene), /requires at least three points/)
})
