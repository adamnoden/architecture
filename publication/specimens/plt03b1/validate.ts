import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { extractText, getDocumentProxy } from 'unpdf'

const root = import.meta.dirname
const workRoot = resolve(root, '.work')
const distRoot = resolve(root, 'dist')
const ptPerMm = 72 / 25.4
const expectedSourceRegular = '4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f'
const expectedSourceBold = '9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a'

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance
const entityIds = (svg: string): string[] =>
  [...svg.matchAll(/data-entity="([^"]+)"/g)].map((match) => match[1]).sort()
const textByEntity = (svg: string): Record<string, string> =>
  Object.fromEntries(
    [...svg.matchAll(/<text[^>]*data-entity="([^"]+)"[^>]*>([^<]*)<\/text>/g)]
      .map((match) => [match[1], match[2]] as const)
      .sort(([a], [b]) => a.localeCompare(b))
  )

type Manifest = {
  control: { sha256: string; widthMm: number; heightMm: number; scaleDenominator: number; disposition: string }
  candidate: {
    sha256: string
    widthMm: number
    heightMm: number
    scaleDenominator: number
    architectureScaleFactorFromControl: number
    entitySetIdenticalToControl: boolean
    textContentIdenticalToControl: boolean
    semanticClasses: string[]
  }
  physicalGrammar: {
    lineWeightsUnchanged: boolean
    dashSizesUnchanged: boolean
    typographyUnchanged: boolean
    annotationOffsetsReconstructedInPaperSpace: boolean
    fitScaling: boolean
  }
  fontFingerprints: Record<string, { sha256: string }>
  authorityBoundary: Record<string, unknown>
  pageProfile: { widthMm: number; heightMm: number; pages: number }
  physicalVerdict: string
  ownerPhysicalVerdict: string
}

const manifest = JSON.parse(await readFile(resolve(workRoot, 'manifest.json'), 'utf8')) as Manifest
const control = await readFile(resolve(workRoot, 'combined-100.svg'), 'utf8')
const candidate = await readFile(resolve(workRoot, 'combined-50.svg'), 'utf8')

if (manifest.control.sha256 !== sha256(control)) throw new Error('PLT-03B.1 1:100 control fingerprint mismatch.')
if (manifest.candidate.sha256 !== sha256(candidate)) throw new Error('PLT-03B.1 1:50 candidate fingerprint mismatch.')
if (manifest.control.scaleDenominator !== 100 || manifest.candidate.scaleDenominator !== 50) {
  throw new Error('PLT-03B.1 scale contract must compare exact 1:100 against exact 1:50.')
}
if (manifest.control.widthMm !== 136 || manifest.control.heightMm !== 145) {
  throw new Error('PLT-03B.1 rejected control lost the 136 × 145 mm PLT-03A envelope.')
}
if (manifest.candidate.widthMm !== 272 || manifest.candidate.heightMm !== 282) {
  throw new Error('PLT-03B.1 candidate lost the controlled 272 × 282 mm 1:50 envelope.')
}
if (manifest.candidate.architectureScaleFactorFromControl !== 2) {
  throw new Error('PLT-03B.1 candidate must double architectural geometry from 1:100 to 1:50.')
}
if (!candidate.includes('data-scale-denominator="50"') || !candidate.includes('width="272mm" height="282mm"')) {
  throw new Error('PLT-03B.1 SVG does not declare the exact 1:50 physical candidate contract.')
}
if (!control.includes('data-scale-denominator="100"') || !control.includes('width="136mm" height="145mm"')) {
  throw new Error('PLT-03B.1 control does not remain exact 1:100.')
}

if (JSON.stringify(entityIds(control)) !== JSON.stringify(entityIds(candidate))) {
  throw new Error('PLT-03B.1 candidate changed the semantic entity set.')
}
if (JSON.stringify(textByEntity(control)) !== JSON.stringify(textByEntity(candidate))) {
  throw new Error('PLT-03B.1 candidate changed drawing text content.')
}
if (!manifest.candidate.entitySetIdenticalToControl || !manifest.candidate.textContentIdenticalToControl) {
  throw new Error('PLT-03B.1 manifest does not record semantic identity to the 1:100 control.')
}
if (manifest.candidate.semanticClasses.includes('X')) throw new Error('PLT-03B.1 candidate contains unexplained semantic X.')
if (candidate.includes('data-authorityClass="C"') || candidate.includes('data-diffClass="X"')) {
  throw new Error('PLT-03B.1 candidate leaked forbidden C/X geometry.')
}

if (
  !manifest.physicalGrammar.lineWeightsUnchanged ||
  !manifest.physicalGrammar.dashSizesUnchanged ||
  !manifest.physicalGrammar.typographyUnchanged ||
  !manifest.physicalGrammar.annotationOffsetsReconstructedInPaperSpace ||
  manifest.physicalGrammar.fitScaling
) {
  throw new Error('PLT-03B.1 physical-grammar contract drifted.')
}

if (manifest.fontFingerprints.TYP03_SANS_REGULAR?.sha256 !== expectedSourceRegular) {
  throw new Error('PLT-03B.1 Source Sans Regular bytes drifted from TYP-06.')
}
if (manifest.fontFingerprints.TYP03_SANS_BOLD?.sha256 !== expectedSourceBold) {
  throw new Error('PLT-03B.1 Source Sans Bold bytes drifted from TYP-06.')
}
if (manifest.physicalVerdict !== 'SCREEN_REVIEW_PENDING' || manifest.ownerPhysicalVerdict !== 'UNREVIEWED') {
  throw new Error('PLT-03B.1 mechanical proof must not manufacture screen or owner physical acceptance.')
}

const pdfPath = resolve(distRoot, 'plt03b1-a2.pdf')
const pdfBytes = await readFile(pdfPath)
const pdf = await getDocumentProxy(new Uint8Array(pdfBytes))
if (pdf.numPages !== 2) throw new Error(`PLT-03B.1 expected two A2 pages, got ${pdf.numPages}.`)
for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
  const page = await pdf.getPage(pageNo)
  const viewport = page.getViewport({ scale: 1 })
  if (!near(viewport.width, 420 * ptPerMm) || !near(viewport.height, 594 * ptPerMm)) {
    throw new Error(`PLT-03B.1 page ${pageNo} is not exact A2.`)
  }
}

const extracted = await extractText(pdf, { mergePages: false })
if (!Array.isArray(extracted.text) || extracted.text.length !== 2) {
  throw new Error('PLT-03B.1 PDF text extraction did not preserve the two-page comparison.')
}
if (!extracted.text[0]?.includes('REJECTED WALL CONTROL') || !extracted.text[0]?.includes('1:100')) {
  throw new Error('PLT-03B.1 page 1 is not the rejected 1:100 control.')
}
if (!extracted.text[1]?.includes('WALL CANDIDATE') || !extracted.text[1]?.includes('1:50')) {
  throw new Error('PLT-03B.1 page 2 is not the true 1:50 candidate.')
}

let pdffonts = ''
try {
  pdffonts = execFileSync('pdffonts', [pdfPath], { encoding: 'utf8' })
} catch (error) {
  throw new Error(`PLT-03B.1 requires pdffonts for finished-PDF font proof: ${String(error)}`)
}
const normalizedFonts = pdffonts.toLowerCase()
if (!normalizedFonts.includes('source') || !normalizedFonts.includes('sans')) {
  throw new Error(`PLT-03B.1 PDF does not expose embedded Source Sans identity.\n${pdffonts}`)
}
for (const forbidden of ['arial', 'helvetica', 'liberation', 'dejavu']) {
  if (normalizedFonts.includes(forbidden)) {
    throw new Error(`PLT-03B.1 PDF contains forbidden fallback font ${forbidden}.\n${pdffonts}`)
  }
}

const evidence = {
  schemaVersion: 1,
  pdfSha256: sha256(pdfBytes),
  candidateSha256: sha256(candidate),
  controlSha256: sha256(control),
  a2FontTable: pdffonts,
  geometryContract: 'same semantic entity/text set; architectural coordinates doubled to 1:50; paper-space line/type/dash/notation offsets unchanged; no fit scaling',
  screenVerdictBoundary: 'pending raster review',
  ownerPhysicalVerdictBoundary: 'UNREVIEWED'
}
await writeFile(resolve(workRoot, 'validation-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')

console.log('PLT-03B.1 PASS — exact A2 1:100/1:50 comparison, semantic identity, unchanged paper-space grammar and Source Sans embedding are valid.')
