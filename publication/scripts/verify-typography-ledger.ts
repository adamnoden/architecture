import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const ledger = JSON.parse(await readFile(resolve(repoRoot, 'publication/typography-metadata.json'), 'utf8')) as any
const verification = JSON.parse(await readFile(resolve(repoRoot, 'publication/.proof/typ09b/verification.json'), 'utf8')) as any

if (verification.result !== 'PASS') throw new Error(`Production typography verification is ${verification.result}, not PASS.`)
for (const format of ['a4', 'b5'] as const) {
  const expected = ledger[format]
  const actual = verification.formats?.[format]
  if (!expected || !actual) throw new Error(`Missing ${format.toUpperCase()} typography ledger or verification result.`)
  const checks: Array<[string, unknown, unknown]> = [
    ['pages', actual.pages, expected.pages],
    ['duplex leaves', actual.leaves, expected.duplexLeaves],
    ['16-page sections', actual.sixteenPageSections, expected.sixteenPageSections],
    ['16-page boundary', actual.pagesAtSixteenPageBoundary, expected.pagesAtSixteenPageBoundary],
    ['boundary padding', actual.paddingToSixteenPageBoundary, expected.paddingToSixteenPageBoundary]
  ]
  for (const [label, received, wanted] of checks) {
    if (received !== wanted) throw new Error(`${format.toUpperCase()} ${label} drift: expected ${wanted}, got ${received}.`)
  }
}

const comparison = verification.comparison ?? {}
for (const key of ['b5MinusA4Pages', 'b5PageChangePercent', 'b5MinusA4Leaves'] as const) {
  if (comparison[key] !== ledger.comparison?.[key]) {
    throw new Error(`Production typography comparison ${key} drift: expected ${ledger.comparison?.[key]}, got ${comparison[key]}.`)
  }
}

console.log(`Production typography ledger PASS: A4 ${ledger.a4.pages} pages / ${ledger.a4.duplexLeaves} leaves; B5 ${ledger.b5.pages} pages / ${ledger.b5.duplexLeaves} leaves.`)
