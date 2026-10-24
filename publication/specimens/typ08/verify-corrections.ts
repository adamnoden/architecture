import { spawnSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')

const corrections = JSON.parse(await readFile(resolve(proofRoot, 'corrections.json'), 'utf8')) as any
for (const id of ['D01', 'D02', 'D03', 'D04', 'D05']) {
  if (corrections.defects?.[id]?.status !== 'corrected') {
    throw new Error(`TYP-08C ${id} is not recorded as corrected.`)
  }
}

function normalized(page: string): string {
  return page.replace(/\s+/g, ' ').trim()
}

const results: Record<string, unknown> = {}
const divisionTitles = [
  'Part I — The Proposition',
  'Part II — Architecture of the Platform',
  'Part III — Patterns and Generative Sequences',
  'Part IV — Reference House',
  'Part V — Making and Testing the Platform'
]

for (const format of ['a4', 'b5'] as const) {
  const pdf = resolve(proofRoot, format, `typ08a-full-book-${format}.pdf`)
  const extraction = spawnSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' })
  if (extraction.status !== 0) {
    throw new Error(`TYP-08C ${format} pdftotext failed: ${extraction.stderr}`)
  }
  if (extraction.stderr.trim()) {
    throw new Error(`TYP-08C ${format} PDF parser emitted warnings:\n${extraction.stderr.trim()}`)
  }

  const pages = extraction.stdout.split('\f').filter((page, index, all) => index < all.length - 1 || page.trim())
  const normalizedPages = pages.map(normalized)

  if (normalizedPages.some((page) => page.includes('TYP-08A full-book candidate —'))) {
    throw new Error(`TYP-08C ${format} still exposes proof-harness metadata as running context.`)
  }

  const titleIndex = normalizedPages.findIndex((page) => page.includes('WORKING EDITION') && page.includes('Ovid’s House'))
  if (titleIndex < 0) throw new Error(`TYP-08C ${format} title page not found.`)
  const titlePage = normalizedPages[titleIndex]
  if (/Revision\b|adamnoden\.github\.io\/architecture\/|\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/.test(titlePage)) {
    throw new Error(`TYP-08C ${format} principal title page still contains provenance metadata.`)
  }

  const imprintIndex = normalizedPages.findIndex((page) => page.includes('Imprint / provenance'))
  if (imprintIndex < 0) throw new Error(`TYP-08C ${format} imprint/provenance page not found.`)
  const imprintPage = normalizedPages[imprintIndex]
  if (!imprintPage.includes('Revision') || !imprintPage.includes('adamnoden.github.io/architecture/')) {
    throw new Error(`TYP-08C ${format} imprint page does not carry the moved provenance fields.`)
  }

  const divisionPages: Record<string, number> = {}
  for (const title of divisionTitles) {
    const candidates = normalizedPages
      .map((page, index) => ({ page, index }))
      .filter(({ page, index }) => index > 2 && page.includes(title) && page.split(' ').length < 45)
    if (!candidates.length) {
      throw new Error(`TYP-08C ${format} has no dedicated sparse division page for ${title}.`)
    }
    divisionPages[title] = candidates[0].index + 1
  }

  const chapterNineIndex = normalizedPages.findIndex((page) => page.includes('9. Environmental resilience without dependence'))
  if (chapterNineIndex < 0) throw new Error(`TYP-08C ${format} chapter 9 opening not found.`)

  results[format] = {
    pages: pages.length,
    titlePage: titleIndex + 1,
    imprintPage: imprintIndex + 1,
    divisionPages,
    chapterNinePage: chapterNineIndex + 1,
    parserWarnings: 0
  }
}

await writeFile(
  resolve(proofRoot, 'correction-verification.json'),
  `${JSON.stringify({ schemaVersion: 1, packet: 'TYP-08C', result: 'PASS', formats: results }, null, 2)}\n`,
  'utf8'
)

console.log('TYP-08C correction verification PASS: semantic openings/provenance present and Poppler parser stderr is clean.')
