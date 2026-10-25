import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ09b')
const diagnosticsRoot = resolve(proofRoot, 'diagnostics')
await mkdir(diagnosticsRoot, { recursive: true })

const allowedFonts = new Set([
  'SourceSerif4-Regular',
  'SourceSerif4-It',
  'SourceSerif4-Bold',
  'SourceSans3-Regular',
  'SourceSans3-Bold'
])
const expectedGeometry = {
  a4: { widthPt: (210 * 72) / 25.4, heightPt: (297 * 72) / 25.4 },
  b5: { widthPt: (176 * 72) / 25.4, heightPt: (250 * 72) / 25.4 }
} as const
const divisions = [
  { id: 'part-i', title: 'Part I — The Proposition' },
  { id: 'part-ii', title: 'Part II — Architecture of the Platform' },
  { id: 'part-iii', title: 'Part III — Patterns and Generative Sequences' },
  { id: 'part-iv', title: 'Part IV — Reference House' },
  { id: 'part-v', title: 'Part V — Making and Testing the Platform' }
] as const

const command = (name: string, args: string[]): string => execFileSync(name, args, { cwd: repoRoot, encoding: 'utf8' })
const sha256File = async (path: string): Promise<string> => createHash('sha256').update(await readFile(path)).digest('hex')

function parsePageCount(info: string): number {
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? '')
  if (!Number.isFinite(pages) || pages < 1) throw new Error('Could not parse production PDF page count.')
  return pages
}
function parsePageSize(info: string): { widthPt: number; heightPt: number } {
  const match = info.match(/^Page(?:\s+\d+)?\s+size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/m)
  if (!match) throw new Error('Could not parse production PDF page geometry.')
  return { widthPt: Number(match[1]), heightPt: Number(match[2]) }
}
function finishedFonts(raw: string): string[] {
  const lines = raw.split('\n').slice(2).map((line) => line.trim()).filter(Boolean)
  const names = lines.map((line) => line.split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ''))
  for (const line of lines) {
    if (!/\byes\s+yes\s+yes\s+\d+\s+\d+\s*$/i.test(line)) {
      throw new Error(`Finished-PDF font is not embedded/subset/Unicode-mapped: ${line}`)
    }
  }
  return [...new Set(names)].sort()
}
function blockImplication(pages: number): Record<string, number> {
  const leaves = Math.ceil(pages / 2)
  const sixteenPageSections = Math.ceil(pages / 16)
  const pagesAtSixteenPageBoundary = sixteenPageSections * 16
  return { pages, leaves, sixteenPageSections, pagesAtSixteenPageBoundary, paddingToSixteenPageBoundary: pagesAtSixteenPageBoundary - pages }
}
function normalized(page: string): string { return page.replace(/\s+/g, ' ').trim() }
function openingIndex(pages: string[], title: string): number {
  return pages.findIndex((page, pageIndex) => pageIndex > 2 && page.startsWith(title))
}
function hasStandaloneFolio(page: string): boolean {
  return page.split('\n').some((line) => /^\d+$/.test(line.trim()))
}

const metadata = JSON.parse(await readFile(resolve(repoRoot, 'publication/metadata.json'), 'utf8')) as any
const integration = JSON.parse(await readFile(resolve(proofRoot, 'typography-integration.json'), 'utf8')) as any
if (integration.canonicalMutation !== false || integration.productionThemeMigrated !== true) {
  throw new Error('Production typography integration evidence lost its no-canonical-mutation / production-migration boundary.')
}
const transforms = integration.transforms ?? {}
if (transforms.semanticDivisionOpenings !== 5) throw new Error(`Expected five semantic division openings; found ${transforms.semanticDivisionOpenings}.`)
if ((transforms.semanticEntryOpenings ?? 0) < 50) throw new Error(`Suspicious production entry-opening count: ${transforms.semanticEntryOpenings}.`)
if (transforms.partINoteCitationRows !== 31 || (transforms.partINoteUrlRows ?? 0) < 20) throw new Error('Part I Notes production role mapping drifted.')
if ((transforms.scheduleRecords ?? 0) < 20 || transforms.arrowSequences !== 2 || (transforms.referenceUrlRows ?? 0) < 5) throw new Error('TYP-05 production mixed-content transforms are incomplete.')
if (transforms.strippedWorkingPlateStyles !== 1 || transforms.controlledSvgCount !== 22) throw new Error('Production plate / controlled-SVG integration boundary drifted.')

const results: Record<string, unknown> = {}
const pageCounts: Record<'a4' | 'b5', number> = { a4: 0, b5: 0 }
const failures: string[] = []

for (const format of ['a4', 'b5'] as const) {
  const pdf = resolve(proofRoot, format, `publication-typography-production-${format}.pdf`)
  const info = command('pdfinfo', [pdf])
  const pages = parsePageCount(info)
  pageCounts[format] = pages
  if (format === 'a4' && pages !== metadata.workingEdition.pages) {
    failures.push(`A4 page ledger drift: PDF has ${pages}, publication metadata records ${metadata.workingEdition.pages}.`)
  }

  const target = expectedGeometry[format]
  const tolerancePt = 0.75
  for (let page = 1; page <= pages; page += 1) {
    const pageInfo = command('pdfinfo', ['-f', String(page), '-l', String(page), pdf])
    const size = parsePageSize(pageInfo)
    if (Math.abs(size.widthPt - target.widthPt) > tolerancePt || Math.abs(size.heightPt - target.heightPt) > tolerancePt) {
      failures.push(`${format.toUpperCase()} page ${page} geometry changed: ${size.widthPt} × ${size.heightPt} pt.`)
      break
    }
  }

  const fontsRaw = command('pdffonts', [pdf])
  await writeFile(resolve(diagnosticsRoot, `${format}-pdffonts.txt`), fontsRaw, 'utf8')
  await writeFile(resolve(diagnosticsRoot, `${format}-pdfinfo.txt`), info, 'utf8')
  const fonts = finishedFonts(fontsRaw)
  const unexpected = fonts.filter((name) => !allowedFonts.has(name))
  const missing = [...allowedFonts].filter((name) => !fonts.includes(name))
  if (unexpected.length) failures.push(`${format.toUpperCase()} contains non-frozen finished-PDF fonts: ${unexpected.join(', ')}`)
  if (missing.length) failures.push(`${format.toUpperCase()} is missing required frozen faces: ${missing.join(', ')}`)

  command('qpdf', ['--check', pdf])
  const extraction = spawnSync('pdftotext', ['-layout', pdf, '-'], { cwd: repoRoot, encoding: 'utf8' })
  await writeFile(resolve(diagnosticsRoot, `${format}-pdftotext-stderr.txt`), extraction.stderr ?? '', 'utf8')
  if (extraction.status !== 0) throw new Error(`${format.toUpperCase()} pdftotext failed: ${extraction.stderr}`)
  if ((extraction.stderr ?? '').trim()) failures.push(`${format.toUpperCase()} PDF parser emitted warnings: ${(extraction.stderr ?? '').trim()}`)

  const rawPages = extraction.stdout.split('\f').filter((page, index, all) => index < all.length - 1 || page.trim())
  const textPages = rawPages.map(normalized)
  const titleIndex = textPages.findIndex((page) => page.includes('WORKING EDITION') && page.includes('Ovid’s House'))
  if (titleIndex < 0) throw new Error(`${format.toUpperCase()} title page not found.`)
  if (/Revision\b|adamnoden\.github\.io\/architecture\/|\b\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b/.test(textPages[titleIndex])) {
    failures.push(`${format.toUpperCase()} principal title page contains provenance metadata.`)
  }
  const imprintIndex = textPages.findIndex((page) => page.includes('Imprint / provenance'))
  if (imprintIndex < 0) throw new Error(`${format.toUpperCase()} imprint page not found.`)
  if (!textPages[imprintIndex].includes('Revision') || !textPages[imprintIndex].includes('adamnoden.github.io/architecture/')) {
    failures.push(`${format.toUpperCase()} imprint page does not carry moved provenance.`)
  }

  const divisionPages: Record<string, number> = {}
  const blankBeforeDivision: Record<string, number> = {}
  let previousDivisionPage = 0
  for (const division of divisions) {
    const index = openingIndex(textPages, division.title)
    if (index < 0) {
      failures.push(`${format.toUpperCase()} has no semantic division opening for ${division.title}.`)
      continue
    }
    const pageNumber = index + 1
    divisionPages[division.id] = pageNumber
    if (pageNumber <= previousDivisionPage) failures.push(`${format.toUpperCase()} division order regressed at ${division.id}.`)
    previousDivisionPage = pageNumber
    if (pageNumber % 2 !== 1) failures.push(`${format.toUpperCase()} division ${division.title} begins on verso page ${pageNumber}.`)
    if (hasStandaloneFolio(rawPages[index])) failures.push(`${format.toUpperCase()} division ${division.title} carries a folio on page ${pageNumber}.`)
    if (index > 0 && textPages[index - 1] === '') {
      blankBeforeDivision[division.id] = pageNumber - 1
      if (hasStandaloneFolio(rawPages[index - 1])) failures.push(`${format.toUpperCase()} parity blank ${pageNumber - 1} carries a folio.`)
      if (index > 1 && textPages[index - 2] === '') failures.push(`${format.toUpperCase()} has more than one blank parity page before ${division.id}.`)
    }
  }

  const chapterNine = '9. Environmental resilience without dependence'
  const chapterNineIndex = openingIndex(textPages, chapterNine)
  if (chapterNineIndex < 0) failures.push(`${format.toUpperCase()} chapter 9 opening not found.`)
  else if (!hasStandaloneFolio(rawPages[chapterNineIndex])) failures.push(`${format.toUpperCase()} chapter 9 opening lost its retained folio.`)

  const normalization = JSON.parse(await readFile(resolve(proofRoot, format, `publication-typography-production-${format}.destination-normalization.json`), 'utf8')) as any
  if (normalization.packet !== 'TYP-09B' || normalization.qpdfCheck !== 'PASS') failures.push(`${format.toUpperCase()} destination-normalization evidence is invalid.`)

  results[format] = {
    ...blockImplication(pages),
    pageWidthPt: target.widthPt,
    pageHeightPt: target.heightPt,
    finishedFonts: fonts,
    pdfSha256: await sha256File(pdf),
    titlePage: titleIndex + 1,
    imprintPage: imprintIndex + 1,
    divisionPages,
    blankBeforeDivision,
    chapterNinePage: chapterNineIndex >= 0 ? chapterNineIndex + 1 : null,
    parserWarnings: 0,
    destinationNormalization: {
      needed: normalization.normalizationNeeded,
      uniqueNamesRenamed: normalization.uniqueNamesRenamed,
      occurrencesRenamed: normalization.occurrencesRenamed
    }
  }
}

const verification = {
  schemaVersion: 1,
  packet: 'TYP-09B',
  result: failures.length ? 'FAIL' : 'PASS',
  formats: results,
  comparison: {
    b5MinusA4Pages: pageCounts.b5 - pageCounts.a4,
    b5PageChangePercent: Number((((pageCounts.b5 - pageCounts.a4) / pageCounts.a4) * 100).toFixed(2)),
    b5MinusA4Leaves: Math.ceil(pageCounts.b5 / 2) - Math.ceil(pageCounts.a4 / 2),
    spineWidthClaim: 'not admissible without final paper caliper / manufacturing specification'
  },
  failures
}
await writeFile(resolve(proofRoot, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`, 'utf8')
if (failures.length) throw new Error(`Production typography verification failed:\n- ${failures.join('\n- ')}`)
console.log(JSON.stringify(verification, null, 2))
