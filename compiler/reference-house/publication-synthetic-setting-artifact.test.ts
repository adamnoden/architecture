import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  PUBLICATION_SYNTHETIC_SETTING_PATH,
  renderCanonicalPublicationSyntheticSetting
} from './generate-publication-synthetic-setting.js'

test('DRW-08E committed synthetic setting SVG is the deterministic canonical render', () => {
  const first = renderCanonicalPublicationSyntheticSetting()
  const second = renderCanonicalPublicationSyntheticSetting()
  assert.equal(first, second)
  assert.equal(readFileSync(PUBLICATION_SYNTHETIC_SETTING_PATH, 'utf8'), first)
})

test('DRW-08E controlled setting never turns its width stress-test into a fictional site polygon', () => {
  const svg = renderCanonicalPublicationSyntheticSetting()
  assert.match(svg, /data-scale-denominator="200"/)
  assert.match(svg, /lateral-width-stress-line-not-legal-boundary/)
  assert.match(svg, /data-boundary="ABSENT"/)
  assert.equal((svg.match(/<rect /g) ?? []).length, 2)
  assert.doesNotMatch(svg, /data-entity="(?:site-boundary|highway-edge|neighbour)/)
})
