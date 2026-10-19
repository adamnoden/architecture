import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PUBLICATION_COURTYARD_ELEVATION_PATH,
  renderCanonicalPublicationCourtyardElevation
} from './generate-publication-courtyard-elevation.js'

test('DRW-08D committed courtyard SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationCourtyardElevation()
  const second = renderCanonicalPublicationCourtyardElevation()
  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_COURTYARD_ELEVATION_PATH, 'utf8'), first)
})

test('DRW-08D controlled artifact remains relationship geometry, not invented apertures', () => {
  const svg = renderCanonicalPublicationCourtyardElevation()
  assert.match(svg, /width="166mm" height="160mm"/)
  assert.match(svg, /data-scale-denominator="50"/)
  assert.match(svg, /data-apertureGeometry="ABSENT"/)
  assert.doesNotMatch(svg, /<rect /)
  assert.doesNotMatch(svg, /courtyard-elevations-study\.svg/)
})
