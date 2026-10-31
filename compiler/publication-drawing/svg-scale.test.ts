import assert from 'node:assert/strict'
import test from 'node:test'

import type { DrawingScene } from './model.js'
import { renderDrawingSceneSvg } from './svg.js'

const scene = (scaleDenominator: DrawingScene['scaleDenominator']): DrawingScene => ({
  widthMm: 10,
  heightMm: 10,
  viewId: 'TEST-VIEW',
  title: 'Test view',
  description: 'Scale semantics test.',
  scaleDenominator,
  sourceId: 'TEST-SOURCE',
  primitives: []
})

test('DRW-09D serializer emits truthful NTS metadata without a fake denominator', () => {
  const svg = renderDrawingSceneSvg(scene('NTS'))
  assert.match(svg, /data-scale="NTS"/)
  assert.doesNotMatch(svg, /data-scale-denominator=/)
})

test('DRW-09D serializer preserves numeric scale metadata for existing architectural drawings', () => {
  const svg = renderDrawingSceneSvg(scene(100))
  assert.match(svg, /data-scale-denominator="100"/)
  assert.doesNotMatch(svg, /data-scale="NTS"/)
})

test('DRW-09D serializer rejects invalid numeric scale while accepting NTS explicitly', () => {
  assert.throws(() => renderDrawingSceneSvg(scene(0)), /positive scale denominator or NTS/)
  assert.doesNotThrow(() => renderDrawingSceneSvg(scene('NTS')))
})
