import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePdfPageSizes } from './pdf-page-geometry.js'

test('preserves individual dimensions so a wrong interior page cannot hide behind page one', () => {
  assert.deepEqual(parsePdfPageSizes(`Pages: 3
Page    1 size: 595.276 x 841.89 pts (A4)
Page    1 rot:  0
Page    2 size: 841.89 x 595.276 pts (A4)
Page    3 size: 595.276 x 841.89 pts (A4)`, 3), [
    { widthPt: 595.276, heightPt: 841.89 },
    { widthPt: 841.89, heightPt: 595.276 },
    { widthPt: 595.276, heightPt: 841.89 }
  ])
})

test('supports numbered and unnumbered single-page pdfinfo output', () => {
  const expected = [{ widthPt: 498.898, heightPt: 708.661 }]
  assert.deepEqual(parsePdfPageSizes('Page size: 498.898 x 708.661 pts', 1), expected)
  assert.deepEqual(parsePdfPageSizes('Page    1 size: 498.898 x 708.661 pts', 1), expected)
})

test('rejects missing, duplicated, out-of-order or unnumbered multi-page geometry', () => {
  for (const raw of [
    'Page 1 size: 595 x 842 pts',
    'Page 1 size: 595 x 842 pts\nPage 1 size: 595 x 842 pts',
    'Page 2 size: 595 x 842 pts\nPage 1 size: 595 x 842 pts',
    'Page size: 595 x 842 pts\nPage size: 595 x 842 pts',
    'Page 1 size: 595 x 842 pts\nPage 3 size: 595 x 842 pts'
  ]) assert.throws(() => parsePdfPageSizes(raw, 2))
})

test('rejects invalid dimensions and page counts rather than silently skipping a page', () => {
  for (const dimensions of ['NaN x 842', '595 x Infinity', '0 x 842', '-595 x 842', '5..9 x 842']) {
    assert.throws(() => parsePdfPageSizes(`Page 1 size: ${dimensions} pts`, 1))
  }
  for (const pages of [0, -1, 1.5, NaN, Infinity]) {
    assert.throws(() => parsePdfPageSizes('Page 1 size: 595 x 842 pts', pages))
  }
  assert.throws(() => parsePdfPageSizes('Page 1 size: 595 x 842 pts\nPage 2 size: 595 x 842 pts', 1))
})
