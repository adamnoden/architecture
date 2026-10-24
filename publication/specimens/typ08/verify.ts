import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '../../..')
const proofRoot = resolve(repoRoot, 'publication/.proof/typ08a')

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

const command = (name: string, args: string[]): string => execFileSync(name, args, {
  cwd: repoRoot,
  encoding: 'utf8'
})

const sha256File = async (path: string): Promise<string> => createHash('sha256').update(await readFile(path)).digest('hex')

function parsePageCount(info: string): number {
  const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1] ?? '')
  if (!Number.isFinite(pages) || pages < 1) throw new Error('TYP-08A could not parse PDF page count.')
  return pages
}

function parsePageSize(info: string): { widthPt: number; heightPt: number } {
  const match = info.match(/^Page(?:\s+\d+)?\s+size:\s+([\d.]+)\s+x\s+([\d.]+)\s+pts/m)
  if (!match) throw new Error('TYP-08A could not parse per-page PDF geometry.')
  return { widthPt: Number(match[1]), heightPt: Number(match[2]) }
}

function finishedFonts(pdf: string): { names: string[]; raw: string } {
  const raw = command('pdffonts', [pdf])
  const lines = raw.split('\n').slice(2).map((line) => line.trim()).filter(Boolean)
  const names = lines.map((line) => line.split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ''))
  for (const line of lines) {
    if (!/\byes\s+yes\s+yes\s+\d+\s+\d+\s*$/i.test(line)) {
      throw new Error(`TYP-08A finished-PDF font is not embedded/subset/Unicode-mapped: ${line}`)
    }
  }
  return { names: [...new Set(names)].sort(), raw }
}

function blockImplication(pages: number): Record<string, number> {
  const leaves = Math.ceil(pages / 2)
  const sixteenPageSections = Math.ceil(pages / 16)
  const pagesAtSixteenPageBoundary = sixteenPageSections * 16
  return {
    pages,
    leaves,
    sixteenPageSections,
    pagesAtSixteenPageBoundary,
    paddingToSixteenPageBoundary: pagesAtSixteenPageBoundary - pages
  }
}

const manifest = JSON.parse(await readFile(resolve(proofRoot, 'manifest.json'), 'utf8')) as {
  canonicalMutation?: boolean
  candidateOnlyIntegration?: boolean
  entryCount?: number
  fonts?: Record<string, unknown>
  generatedTransforms?: {
    scheduleRecords?: number
    arrowSequences?: number
    referenceUrlRows?: number
    strippedWorkingPlateStyles?: number
    controlledSvgCount?: number
  }
  svgEvidence?: Record<string, { reversible?: boolean }>
  boundaries?: Record<string, boolean>
}

if (manifest.canonicalMutation !== false || manifest.candidateOnlyIntegration !== true) {
  throw new Error('TYP-08A manifest lost the candidate-only / no-canonical-mutation boundary.')
}
if ((manifest.entryCount ?? 0) < 30) throw new Error(`TYP-08A full-book manifest has suspicious entry count: ${manifest.entryCount}.`)
if (Object.keys(manifest.fonts ?? {}).length !== 5) throw new Error('TYP-08A manifest does not record all five exact Source font inputs.')
if ((manifest.generatedTransforms?.scheduleRecords ?? 0) < 20) throw new Error('TYP-08A did not convert the complete Appendix C schedule corpus.')
if (manifest.generatedTransforms?.arrowSequences !== 2) throw new Error('TYP-08A expected exactly two architectural sequence blocks.')
if ((manifest.generatedTransforms?.referenceUrlRows ?? 0) < 5) throw new Error('TYP-08A did not exercise the long-URL reference role across the real appendix.')
if (manifest.generatedTransforms?.strippedWorkingPlateStyles !== 1) throw new Error('TYP-08A did not isolate the single generated A4 working-plate style seam.')
const svgEvidence = manifest.svgEvidence ?? {}
if (Object.keys(svgEvidence).length !== manifest.generatedTransforms?.controlledSvgCount || Object.keys(svgEvidence).length < 20) {
  throw new Error('TYP-08A controlled FLOW/DRW asset evidence is incomplete.')
}
for (const [path, evidence] of Object.entries(svgEvidence)) {
  if (evidence.reversible !== true) throw new Error(`TYP-08A SVG typography transform is not reversible: ${path}`)
}
for (const [boundary, value] of Object.entries(manifest.boundaries ?? {})) {
  if (value !== false) throw new Error(`TYP-08A unexpectedly crossed candidate boundary ${boundary}.`)
}

const verification: {
  schemaVersion: number
  packet: string
  result: string
  formats: Record<string, unknown>
  comparison?: Record<string, unknown>
} = {
  schemaVersion: 1,
  packet: 'TYP-08A',
  result: 'PASS',
  formats: {}
}

const pageCounts: Record<'a4' | 'b5', number> = { a4: 0, b5: 0 }
for (const format of ['a4', 'b5'] as const) {
  const pdf = resolve(proofRoot, format, `typ08a-full-book-${format}.pdf`)
  const info = command('pdfinfo', [pdf])
  const pages = parsePageCount(info)
  pageCounts[format] = pages
  if (pages <= (manifest.entryCount ?? 0) + 2) {
    throw new Error(`TYP-08A ${format.toUpperCase()} candidate collapsed implausibly to ${pages} pages.`)
  }

  const target = expectedGeometry[format]
  const tolerancePt = 0.75
  for (let page = 1; page <= pages; page += 1) {
    const pageInfo = command('pdfinfo', ['-f', String(page), '-l', String(page), pdf])
    const size = parsePageSize(pageInfo)
    if (Math.abs(size.widthPt - target.widthPt) > tolerancePt || Math.abs(size.heightPt - target.heightPt) > tolerancePt) {
      throw new Error(`TYP-08A ${format.toUpperCase()} page ${page} geometry changed: ${size.widthPt} × ${size.heightPt} pt.`)
    }
  }

  const fonts = finishedFonts(pdf)
  const unexpected = fonts.names.filter((name) => !allowedFonts.has(name))
  const missing = [...allowedFonts].filter((name) => !fonts.names.includes(name))
  if (unexpected.length) throw new Error(`TYP-08A ${format.toUpperCase()} contains non-frozen finished-PDF fonts: ${unexpected.join(', ')}`)
  if (missing.length) throw new Error(`TYP-08A ${format.toUpperCase()} is missing required frozen faces: ${missing.join(', ')}`)

  verification.formats[format] = {
    ...blockImplication(pages),
    pageWidthPt: target.widthPt,
    pageHeightPt: target.heightPt,
    finishedFonts: fonts.names,
    pdfSha256: await sha256File(pdf)
  }
}

verification.comparison = {
  b5MinusA4Pages: pageCounts.b5 - pageCounts.a4,
  b5PageChangePercent: Number((((pageCounts.b5 - pageCounts.a4) / pageCounts.a4) * 100).toFixed(2)),
  b5MinusA4Leaves: Math.ceil(pageCounts.b5 / 2) - Math.ceil(pageCounts.a4 / 2),
  spineWidthClaim: 'not yet admissible without final paper caliper / manufacturing specification'
}

await writeFile(resolve(proofRoot, 'verification.json'), `${JSON.stringify(verification, null, 2)}\n`, 'utf8')
console.log(JSON.stringify(verification, null, 2))
