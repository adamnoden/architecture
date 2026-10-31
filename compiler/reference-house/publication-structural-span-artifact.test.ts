import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PUBLICATION_STRUCTURAL_SPAN_OVERLAY_PATH,
  renderCanonicalPublicationStructuralSpanOverlay
} from './generate-publication-structural-span-overlay.js'

test('DRW-10A committed structural/span SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationStructuralSpanOverlay()
  const second = renderCanonicalPublicationStructuralSpanOverlay()

  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_STRUCTURAL_SPAN_OVERLAY_PATH, 'utf8'), first)
})

test('DRW-10A controlled artifact keeps architectural scale and structural absences machine-visible', () => {
  const svg = renderCanonicalPublicationStructuralSpanOverlay()

  assert.match(svg, /width="136mm" height="145mm"/)
  assert.match(svg, /data-scale-denominator="100"/)
  assert.match(svg, /data-overlay="structural-span"/)
  assert.match(svg, /gross-span-direction-not-joist-centreline/)
  assert.match(svg, /permanent-masonry-support-order-not-member-centreline/)
  assert.match(svg, /data-grossSpanMm="4200"/)
  assert.match(svg, /data-grossSpanMm="3400"/)
  assert.match(svg, /data-finalStructuralOpening="ABSENT_TECHNICAL"/)
  assert.match(svg, /data-memberSizes="ABSENT_STRUCTURAL_ENGINEERING"/)
  assert.match(svg, /data-joistCentrelines="ABSENT_STRUCTURAL_ENGINEERING"/)

  assert.doesNotMatch(svg, /data-entity="(?:joist-centreline|beam-member|column-member|foundation-member)/)
})
