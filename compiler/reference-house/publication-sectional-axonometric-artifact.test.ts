import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PUBLICATION_SECTIONAL_AXONOMETRIC_PATH,
  renderCanonicalPublicationSectionalAxonometric
} from './generate-publication-sectional-axonometric.js'

test('DRW-09D committed sectional axonometric is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationSectionalAxonometric()
  const second = renderCanonicalPublicationSectionalAxonometric()
  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_SECTIONAL_AXONOMETRIC_PATH, 'utf8'), first)
})

test('DRW-09D controlled SVG remains explicitly NTS and preserves its authority boundaries', () => {
  const svg = renderCanonicalPublicationSectionalAxonometric()
  assert.match(svg, /data-scale="NTS"/)
  assert.doesNotMatch(svg, /data-scale-denominator=/)
  assert.match(svg, /data-relation="section-cut-edge"/)
  assert.match(svg, /capacity-zone-not-packed-services/)
  assert.match(svg, /data-roofVerticalGeometry="ABSENT"/)
  assert.match(svg, /data-viewLocalProxyComposition="FORBIDDEN"/)
  assert.doesNotMatch(svg, /(?:pipe-centreline|duct-centreline|window-solid|door-solid|plant-product)/)
})
