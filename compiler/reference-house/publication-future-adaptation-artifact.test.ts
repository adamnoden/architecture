import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  PUBLICATION_FUTURE_ADAPTATION_OVERLAY_PATH,
  renderCanonicalPublicationFutureAdaptationOverlay
} from './generate-publication-future-adaptation-overlay.js'

test('DRW-10E.1 committed future-adaptation SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationFutureAdaptationOverlay()
  const second = renderCanonicalPublicationFutureAdaptationOverlay()

  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_FUTURE_ADAPTATION_OVERLAY_PATH, 'utf8'), first)
})

test('DRW-10E.1 controlled artifact preserves the bounded fallback framework and explicit nonclaims', () => {
  const svg = renderCanonicalPublicationFutureAdaptationOverlay()

  assert.match(svg, /width="136mm" height="145mm"/)
  assert.match(svg, /data-scale-denominator="100"/)
  assert.match(svg, /data-overlay="future-adaptation"/)
  assert.match(svg, /fallback-sleeping-topological-capability/)
  assert.match(svg, /one-level-route-territory/)
  assert.match(svg, /sanitary-shower-adaptation-geography/)
  assert.match(svg, /M4\(2\)-informed comparator; no compliance claim/)
  assert.match(svg, /Framework, not accessible-suite proof/)
  assert.match(svg, /data-accessibilityCompliance="NOT_CLAIMED"/)
  assert.match(svg, /data-completeFallbackModeProof="NOT_MODELLED"/)

  assert.doesNotMatch(
    svg,
    /data-entity="[^"]*(?:turning-circle|bed-clearance|wc-fixture|shower-tray|route-centreline)/i
  )
})
