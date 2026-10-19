import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PUBLICATION_GARDEN_ELEVATION_PATH,
  renderCanonicalPublicationGardenElevation
} from './generate-publication-garden-elevation.js'

test('DRW-08C committed garden SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationGardenElevation()
  const second = renderCanonicalPublicationGardenElevation()
  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_GARDEN_ELEVATION_PATH, 'utf8'), first)
})

test('DRW-08C controlled artifact keeps true scale and unresolved apertures machine-visible', () => {
  const svg = renderCanonicalPublicationGardenElevation()
  assert.match(svg, /width="166mm" height="96mm"/)
  assert.match(svg, /data-scale-denominator="100"/)
  assert.match(svg, /data-apertureGeometry="ABSENT"/)
  assert.match(svg, /data-treatment="occurrence-axis-only"/)
  assert.doesNotMatch(svg, /opening-G-GARDEN-CENTRE-envelope/)
  assert.doesNotMatch(svg, /opening-G-GARDEN-EAST-envelope/)
  assert.doesNotMatch(svg, /opening-U-GARDEN-CENTRE-envelope/)
})
