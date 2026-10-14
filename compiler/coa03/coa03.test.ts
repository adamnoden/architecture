import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  ANNOTATION_ZONE,
  INSPECTION_SECTION_ID,
  renderCompactLegend,
  renderNorthArrow,
  renderQualitativeHost,
  renderRequiredConnection,
  renderReviewBanner,
  renderSectionCut,
  renderUndirectedSpanAxis
} from '../output/conventions.js'
import { createNorthUpPlanProjection, createSouthToNorthSectionProjection } from '../output/projection.js'

describe('COA-03 shared drawing and uncertainty language', () => {
  test('freezes north-up plan projection and south-to-north section orientation', () => {
    const plan = createNorthUpPlanProjection(10800)
    assert.deepEqual(plan.point(1000, 0), { x: 1000, y: 10800 })
    assert.deepEqual(plan.point(1000, 10800), { x: 1000, y: 0 })
    assert.ok(plan.point(1000, 9000).y < plan.point(1000, 2000).y)

    const section = createSouthToNorthSectionProjection(7000)
    assert.ok(section.point(9000, 0).x > section.point(2000, 0).x)
    assert.ok(section.point(0, 6000).y < section.point(0, 1000).y)
    assert.equal(INSPECTION_SECTION_ID, 'A–A')
  })

  test('uses a visible cardinal north indicator and matching A–A cut identity', () => {
    const north = renderNorthArrow(1000, 1000)
    const cut = renderSectionCut(6000, 10800, 0)
    assert.match(north, /data-convention="north-arrow"/)
    assert.match(north, />N<\/text>/)
    assert.match(cut, /data-section="A–A"/)
    assert.match(cut, />A<\/text>/)
  })

  test('represents qualitative relationships over the known host span rather than inventing a centre opening', () => {
    const opening = renderQualitativeHost('REL-01', 0, 0, 4000, 0)
    const connection = renderRequiredConnection('ADJ-01', 0, 0, 0, 3000)
    for (const svg of [opening, connection]) {
      assert.match(svg, /data-authority="qualitative"/)
      assert.match(svg, /data-geometry="unresolved"/)
      assert.doesNotMatch(svg, /data-width=/)
    }
    assert.match(opening, /position unresolved/)
    assert.match(connection, /connection required · position unresolved/)
  })

  test('renders a span axis as explicitly undirected', () => {
    const axis = renderUndirectedSpanAxis('F-W', 0, 0, 1000, 0)
    assert.match(axis, /marker-start="url\(#oh-span-arrow\)"/)
    assert.match(axis, /marker-end="url\(#oh-span-arrow\)"/)
    assert.match(axis, /data-convention="span-axis"/)
  })

  test('makes REVIEW visible and machine-readable', () => {
    const review = renderReviewBanner(0, 0, 3000, ['RH-TEST-01'])
    assert.match(review, /data-compile-status="REVIEW"/)
    assert.match(review, /REVIEW · RH-TEST-01/)
  })

  test('keeps one compact monochrome-first legend and reserves deterministic annotation space', () => {
    const legend = renderCompactLegend(0, 0)
    assert.match(legend, /controlled \/ represented/)
    assert.match(legend, /provisional/)
    assert.match(legend, /approximate/)
    assert.match(legend, /range — outer extent/)
    assert.match(legend, /geometry unresolved/)
    assert.ok(ANNOTATION_ZONE.rightWidth >= 3000)
    assert.ok(ANNOTATION_ZONE.bottomHeight >= 1500)
  })
})
