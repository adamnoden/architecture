import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PUBLICATION_SERVICE_SIDE_ELEVATION_PATH,
  renderCanonicalPublicationServiceSideElevation
} from './generate-publication-service-side-elevation.js'

test('DRW-08E.2 committed service-side SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationServiceSideElevation()
  const second = renderCanonicalPublicationServiceSideElevation()
  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_SERVICE_SIDE_ELEVATION_PATH, 'utf8'), first)
})

test('DRW-08E.2 controlled artifact keeps unresolved geometry machine-visible', () => {
  const svg = readFileSync(PUBLICATION_SERVICE_SIDE_ELEVATION_PATH, 'utf8')
  assert.match(svg, /data-scale-denominator="100"/)
  assert.match(svg, /data-geometry="ABSENT"/)
  assert.match(svg, /data-geometry="ABSENT_TECHNICAL"/)
  assert.match(svg, /data-treatment="plan-owned-field-break-not-facade-seam"/)
  assert.doesNotMatch(svg, /<rect/)
})
