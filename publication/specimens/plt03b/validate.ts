import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { extractText, getDocumentProxy } from 'unpdf'

const root = import.meta.dirname
const workRoot = resolve(root, '.work')
const distRoot = resolve(root, 'dist')
const ptPerMm = 72 / 25.4
const protectedBaselineSha256 = '91eec9c3dd32e3a2154cf42c9d8db8525efeb92677289ca78056e0b1aa9c25ba'
const expectedSourceRegular = '4644c81b86ec9caaa76b634889968ed3c4f4f52f054855933acc7c2b21e53b0f'
const expectedSourceBold = '9214b9d95e4231c609802815c2646c98174e2102d0d37f88978a7f8e71006e6a'

const sha256 = (value: string | Buffer): string => createHash('sha256').update(value).digest('hex')
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance

type Manifest = {
  protectedBaselineSha256: string
  specimens: Record<string, { sha256: string; widthMm: number; heightMm: number; scaleDenominator: number; semanticClasses: string[] }>
  fontFingerprints: Record<string, { sha256: string }>
  pageProfiles: Record<string, unknown>
  physicalVerdict: string
}

const manifestPath = resolve(workRoot, 'manifest.json')
const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as Manifest

if (manifest.protectedBaselineSha256 !== protectedBaselineSha256) {
  throw new Error('PLT-03B protected v1 baseline fingerprint drifted.')
}
if (manifest.fontFingerprints.TYP03_SANS_REGULAR?.sha256 !== expectedSourceRegular) {
  throw new Error('PLT-03B Source Sans Regular bytes drifted from TYP-06.')
}
if (manifest.fontFingerprints.TYP03_SANS_BOLD?.sha256 !== expectedSourceBold) {
  throw new Error('PLT-03B Source Sans Bold bytes drifted from TYP-06.')
}
if (manifest.physicalVerdict !== 'UNREVIEWED') {
  throw new Error('PLT-03B mechanical proof must not manufacture a physical acceptance verdict.')
}

for (const name of ['baseline', 'hierarchy', 'articulation', 'combined']) {
  const svgPath = resolve(root, '../plt03/.work', `${name}.svg`)
  const svg = await readFile(svgPath, 'utf8')
  const specimen = manifest.specimens[name]
  if (!specimen || specimen.sha256 !== sha256(svg)) throw new Error(`PLT-03B ${name} fingerprint mismatch.`)
  if (specimen.widthMm !== 136 || specimen.heightMm !== 145 || specimen.scaleDenominator !== 100) {
    throw new Error(`PLT-03B ${name} manifest lost the exact 136 × 145 mm / 1:100 contract.`)
  }
  if (!svg.includes('width="136mm" height="145mm"') || !svg.includes('data-scale-denominator="100"')) {
    throw new Error(`PLT-03B ${name} SVG lost its exact physical-size/scale contract.`)
  }
}

const pdfProfiles = [
  { name: 'B5', path: resolve(distRoot, 'plt03b-b5.pdf'), widthMm: 176, heightMm: 250, pages: 4 },
  { name: 'A4', path: resolve(distRoot, 'plt03b-a4.pdf'), widthMm: 210, heightMm: 297, pages: 4 },
  { name: 'A2', path: resolve(distRoot, 'plt03b-a2.pdf'), widthMm: 420, heightMm: 594, pages: 1 }
] as const

const pdfFingerprints: Record<string, string> = {}
for (const profile of pdfProfiles) {
  const bytes = await readFile(profile.path)
  pdfFingerprints[profile.name] = sha256(bytes)
  const pdf = await getDocumentProxy(new Uint8Array(bytes))
  if (pdf.numPages !== profile.pages) {
    throw new Error(`${profile.name}: expected ${profile.pages} pages, got ${pdf.numPages}.`)
  }
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale: 1 })
    if (!near(viewport.width, profile.widthMm * ptPerMm) || !near(viewport.height, profile.heightMm * ptPerMm)) {
      throw new Error(`${profile.name}: page ${pageNo} is not ${profile.widthMm} × ${profile.heightMm} mm.`)
    }
  }
  const extracted = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(extracted.text) || extracted.text.length !== profile.pages) {
    throw new Error(`${profile.name}: text extraction did not preserve page count.`)
  }
}

const b5Text = await extractText(await getDocumentProxy(new Uint8Array(await readFile(resolve(distRoot, 'plt03b-b5.pdf')))), { mergePages: false })
for (const [index, label] of ['BASELINE', 'HIERARCHY', 'ARTICULATION', 'COMBINED'].entries()) {
  if (!b5Text.text[index]?.includes(label)) throw new Error(`B5: page ${index + 1} is missing ${label}.`)
  if (!b5Text.text[index]?.includes('1:100')) throw new Error(`B5: page ${index + 1} is missing the exact scale label.`)
}

// A2 contains only the current-authority COMBINED candidate, so it is the clean
// finished-PDF font gate: no historical Arial baseline or page-furniture fallback
// is allowed to muddy the result.
const a2Path = resolve(distRoot, 'plt03b-a2.pdf')
let pdffonts = ''
try {
  pdffonts = execFileSync('pdffonts', [a2Path], { encoding: 'utf8' })
} catch (error) {
  throw new Error(`PLT-03B requires pdffonts for the finished-PDF font gate: ${String(error)}`)
}
const normalizedFonts = pdffonts.toLowerCase()
if (!normalizedFonts.includes('source') || !normalizedFonts.includes('sans')) {
  throw new Error(`A2: finished PDF does not expose embedded Source Sans identity.\n${pdffonts}`)
}
for (const forbidden of ['arial', 'helvetica', 'liberation', 'dejavu']) {
  if (normalizedFonts.includes(forbidden)) {
    throw new Error(`A2: finished COMBINED PDF contains forbidden fallback font ${forbidden}.\n${pdffonts}`)
  }
}

const evidence = {
  schemaVersion: 1,
  pdfFingerprints,
  a2FontTable: pdffonts,
  scaleContract: 'all specimens 136 × 145 mm at 1:100; CSS intrinsic size; no transform or fit scaling',
  verdictBoundary: 'mechanically valid only; physical/aesthetic acceptance remains owner review'
}
await writeFile(resolve(workRoot, 'validation-evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`, 'utf8')

console.log('PLT-03B PASS — B5/A4/A2 geometry, exact 1:100 specimen size, semantic fingerprints and A2 Source Sans finished-PDF gate are valid. Physical verdict remains UNREVIEWED.')
