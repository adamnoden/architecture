import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import {
  PUBLICATION_FIRST_FLOOR_PLAN_PATH,
  renderCanonicalPublicationFirstFloorPlan
} from './generate-publication-first-floor-plan.js'

describe('DRW-04C controlled first-floor publication SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationFirstFloorPlan()
    const second = renderCanonicalPublicationFirstFloorPlan()

    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_FIRST_FLOOR_PLAN_PATH, 'utf8'), first)
  })

  test('retains explicit source, view and physical-scale lineage in the controlled output', () => {
    const svg = renderCanonicalPublicationFirstFloorPlan()

    assert.match(svg, /data-view-id="REFERENCE-HOUSE-FIRST-FLOOR-PLAN"/)
    assert.match(svg, /data-source-id="RH-C1-REFERENCE-HOUSE"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="136mm" height="145mm" viewBox="0 0 136 145"/)
    assert.doesNotMatch(svg, /DRW-04|04C|packet|branch/i)
  })

  test('preserves the bounded first-floor reader content without technical invention', () => {
    const svg = renderCanonicalPublicationFirstFloorPlan()

    for (const label of [
      'Principal bedroom',
      'South',
      'landing',
      'East gallery',
      'Family bathroom',
      'North landing',
      'Dressing / storage',
      'Linen',
      'Courtyard',
      'DN'
    ]) {
      assert.match(svg, new RegExp(`>${label.replace('/', '\\/')}<`), label)
    }

    assert.doesNotMatch(svg, /door-leaf|swing|hinge|handing|balustrade|handrail|nosing|north-arrow|section-marker/i)
  })
})
