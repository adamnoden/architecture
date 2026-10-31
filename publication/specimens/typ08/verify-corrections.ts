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

function openingIndex(normalizedPages: string[], title: string): number {
  // Large opening titles can wrap across physical text lines in Poppler. Search
  // normalized page text and take the first page that starts with the complete
  // title; later running headers can repeat it but cannot precede the opening.
  return normalizedPages.findIndex((page, pageIndex) => pageIndex > 2 && page.startsWith(title))
}

function hasStandaloneFolio(page: string): boolean {
  return page.split('\n').some((line) => /^\d+$/.test(line.trim()))
}

const divisions = [
  { id: 'part-i', title: 'Part I — The Proposition' },
  { id: 'part-ii', title: 'Part II — Architecture of the Platform' },
  { id: 'part-iii', title: 'Part III — Patterns and Generative Sequences' },
  { id: 'part-iv', title: 'Part IV — Reference House' },
  { id: 'part-v', title: 'Part V — Making and Testing the Platform' }
] as const

const results: Record<string, unknown> = {}
const failures: string[] = []

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

  if (normalizedPages.some((page) => page.includes('TYP-08A full-book candidate —') || page.includes('TYP-08C corrected full-book candidate —'))) {
    failures.push(`TYP-08C ${format} exposes proof-harness metadata to the reader.`)
  }

  const titleIndex = normalizedPages.findIndex((page) => page.includes('WORKING EDITION') && page.includes('Ovid’s House'))
  if (titleIndex < 0) throw new Error(`TYP-08C ${format} title page not found.`)
  const titlePage = normalizedPages[titleIndex]
  if (/Revision\b|adamnoden\.github\.io\/architecture\/|\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/.test(titlePage)) {
    failures.push(`TYP-08C ${format} principal title page still contains provenance metadata.`)
  }

  const imprintIndex = normalizedPages.findIndex((page) => page.includes('Imprint / provenance'))
  if (imprintIndex < 0) throw new Error(`TYP-08C ${format} imprint/provenance page not found.`)
  const imprintPage = normalizedPages[imprintIndex]
  if (!imprintPage.includes('Revision') || !imprintPage.includes('adamnoden.github.io/architecture/')) {
    failures.push(`TYP-08C ${format} imprint page does not carry the moved provenance fields.`)
  }

  const divisionPages: Record<string, number> = {}
  const blankBeforeDivision: Record<string, number> = {}
  let previousDivisionPage = 0
  for (const division of divisions) {
    const index = openingIndex(normalizedPages, division.title)
    if (index < 0) {
      failures.push(`TYP-08C ${format} has no semantic division opening for ${division.title}.`)
      continue
    }

    const pageNumber = index + 1
    divisionPages[division.id] = pageNumber
    if (pageNumber <= previousDivisionPage) {
      failures.push(`TYP-08C ${format} division order regressed at ${division.id}: ${pageNumber} after ${previousDivisionPage}.`)
    }
    previousDivisionPage = pageNumber

    if (pageNumber % 2 !== 1) {
      failures.push(`TYP-08C ${format} division ${division.title} begins on verso page ${pageNumber}.`)
    }
    if (hasStandaloneFolio(pages[index])) {
      failures.push(`TYP-08C ${format} division ${division.title} still carries a folio on page ${pageNumber}.`)
    }

    if (index > 0 && normalizedPages[index - 1] === '') {
      blankBeforeDivision[division.id] = pageNumber - 1
      if (hasStandaloneFolio(pages[index - 1])) {
        failures.push(`TYP-08C ${format} blank parity page ${pageNumber - 1} before ${division.id} carries a folio.`)
      }
      if (index > 1 && normalizedPages[index - 2] === '') {
        failures.push(`TYP-08C ${format} has more than one blank parity page before ${division.id}.`)
      }
    }
  }

  const chapterNineTitle = '9. Environmental resilience without dependence'
  const chapterNineIndex = openingIndex(normalizedPages, chapterNineTitle)
  if (chapterNineIndex < 0) {
    failures.push(`TYP-08C ${format} chapter 9 entry opening not found.`)
  } else if (!hasStandaloneFolio(pages[chapterNineIndex])) {
    failures.push(`TYP-08C ${format} chapter 9 opening lost the folio retained by the TYP-04 entry role.`)
  }

  results[format] = {
    pages: pages.length,
    titlePage: titleIndex + 1,
    imprintPage: imprintIndex + 1,
    divisionPages,
    blankBeforeDivision,
    chapterNinePage: chapterNineIndex >= 0 ? chapterNineIndex + 1 : null,
    parserWarnings: 0
  }
}

const result = failures.length === 0 ? 'PASS' : 'FAIL'
await writeFile(
  resolve(proofRoot, 'correction-verification.json'),
  `${JSON.stringify({ schemaVersion: 3, packet: 'TYP-08C', result, formats: results, failures }, null, 2)}\n`,
  'utf8'
)

if (failures.length > 0) {
  throw new Error(`TYP-08C correction verification failed:\n- ${failures.join('\n- ')}\nDivision-page diagnostics: ${JSON.stringify(results)}`)
}

console.log('TYP-08C correction verification PASS: all Part openings are recto and furnitureless; actual parity blanks, semantic openings, provenance and Poppler parser boundary are clean.')
