import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import {
  PUBLICATION_SERVICE_SECTION_PATH,
  renderCanonicalPublicationServiceSection
} from './generate-publication-service-section.js'

describe('DRW-08B controlled service/transverse section SVG', () => {
  test('committed SVG is the exact deterministic projection of canonical sources', () => {
    const first = renderCanonicalPublicationServiceSection()
    const second = renderCanonicalPublicationServiceSection()
    assert.equal(first, second)
    assert.equal(readFileSync(PUBLICATION_SERVICE_SECTION_PATH, 'utf8'), first)
  })

  test('locks semantic identity, literal physical size and true scale', () => {
    const svg = renderCanonicalPublicationServiceSection()
    assert.match(svg, /data-view-id="REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION"/)
    assert.match(svg, /data-source-id="REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION"/)
    assert.match(svg, /data-scale-denominator="100"/)
    assert.match(svg, /width="166mm" height="112mm"/)
  })

  test('locks the controlled cross-view datums and provisional service envelopes', () => {
    const svg = renderCanonicalPublicationServiceSection()
    for (const token of [
      'data-entity="court-west"',
      'data-entity="court-east"',
      'data-entity="sv-01-reservation"',
      'data-entity="pen-sv-01-envelope"',
      'data-exactPacking="false"',
      'data-finalSize="false"',
      'dash-provisional'
    ]) assert.ok(svg.includes(token), token)
  })

  test('does not manufacture individual services or revive superseded process state', () => {
    const svg = renderCanonicalPublicationServiceSection()
    assert.doesNotMatch(svg, /<(?:line|rect)[^>]+data-entity="[^"]*(?:soil|water|hydronic|mv-sup|mv-ext|duct|pipe)[^"]*"/i)
    assert.doesNotMatch(svg, /BX-01|direct bathroom extract|DRW-08|08A|08B|packet|branch/i)
    assert.match(svg, /architectural coordination, not MEP detail/)
  })
})
