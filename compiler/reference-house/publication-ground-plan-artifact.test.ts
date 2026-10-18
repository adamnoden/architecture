import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import {
  PUBLICATION_GROUND_PLAN_PATH,
  renderCanonicalPublicationGroundPlan
} from './generate-publication-ground-plan.js'

describe('DRW-03E controlled ground-floor publication SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationGroundPlan()
    const second = renderCanonicalPublicationGroundPlan()

    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_GROUND_PLAN_PATH, 'utf8'), first)
  })

  test('retains explicit source and scale lineage in the controlled output', () => {
    const svg = renderCanonicalPublicationGroundPlan()

    assert.match(svg, /data-view-id="REFERENCE-HOUSE-GROUND-PLAN"/)
    assert.match(svg, /data-source-id="[^"]+"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="136mm" height="145mm"/)
    assert.doesNotMatch(svg, /DRW-03|03E|packet|branch/i)
  })
})
