import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const ptPerMm = 72 / 25.4

type Sheet = {
  path: string
  viewId: string
  widthMm: number
  heightMm: number
  scale: number
}

const sheets: Sheet[] = [
  { path: 'docs/reference-house/publication-structural-span-overlay.svg', viewId: 'REFERENCE-HOUSE-STRUCTURAL-SPAN-OVERLAY', widthMm: 136, heightMm: 145, scale: 100 },
  { path: 'docs/reference-house/publication-synthetic-setting.svg', viewId: 'REFERENCE-HOUSE-SYNTHETIC-SETTING-PLAN', widthMm: 166, heightMm: 108, scale: 200 },
  { path: 'docs/reference-house/publication-external-maintenance-setting-overlay.svg', viewId: 'REFERENCE-HOUSE-EXTERNAL-MAINTENANCE-SETTING-OVERLAY', widthMm: 166, heightMm: 108, scale: 200 },
  { path: 'docs/reference-house/publication-ground-service-maintenance-overlay.svg', viewId: 'REFERENCE-HOUSE-GROUND-SERVICE-MAINTENANCE-OVERLAY', widthMm: 136, heightMm: 145, scale: 100 },
  { path: 'docs/reference-house/publication-first-service-maintenance-overlay.svg', viewId: 'REFERENCE-HOUSE-FIRST-SERVICE-MAINTENANCE-OVERLAY', widthMm: 136, heightMm: 145, scale: 100 },
  { path: 'docs/reference-house/publication-roof-drainage.svg', viewId: 'REFERENCE-HOUSE-ROOF-DRAINAGE-PLAN', widthMm: 166, heightMm: 145, scale: 100 },
  { path: 'docs/reference-house/publication-roof-water-failure-overlay.svg', viewId: 'REFERENCE-HOUSE-ROOF-WATER-FAILURE-OVERLAY', widthMm: 166, heightMm: 145, scale: 100 },
  { path: 'docs/reference-house/publication-future-adaptation-overlay.svg', viewId: 'REFERENCE-HOUSE-ENTRANCE-STOREY-FUTURE-ADAPTATION-OVERLAY', widthMm: 136, heightMm: 145, scale: 100 }
]

const expectedPages = [
  '',
  'Structural reading — context',
  'Structural / span overlay',
  'Synthetic setting / type plan',
  'External maintenance / setting overlay',
  'Ground service / maintenance overlay',
  'First-floor service / maintenance overlay',
  'Roof / drainage plan',
  'Roof water / failure overlay',
  'Entrance-storey future adaptation',
  'Future adaptation — context'
]

function near(actual: number, wanted: number, tolerance = 1): boolean {
  return Math.abs(actual - wanted) <= tolerance
}

function rootAttribute(svg: string, name: string): string | null {
  const rootTag = svg.match(/^<svg\s+([^>]+)>/)?.[1] ?? ''
  return rootTag.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? null
}

for (const sheet of sheets) {
  const svg = await readFile(resolve(repositoryRoot, sheet.path), 'utf8')
  const width = rootAttribute(svg, 'width')
  const height = rootAttribute(svg, 'height')
  const viewId = rootAttribute(svg, 'data-view-id')
  const scale = rootAttribute(svg, 'data-scale-denominator')

  if (width !== `${sheet.widthMm}mm` || height !== `${sheet.heightMm}mm`) {
    throw new Error(`${sheet.path}: expected intrinsic ${sheet.widthMm}×${sheet.heightMm} mm, got ${width} × ${height}`)
  }
  if (viewId !== sheet.viewId) throw new Error(`${sheet.path}: unexpected controlled view id ${viewId}`)
  if (scale !== String(sheet.scale)) throw new Error(`${sheet.path}: expected 1:${sheet.scale}, got denominator ${scale}`)
}

const [prepared, commonCss, a4Css, b5Css] = await Promise.all([
  readFile(resolve(root, '.work/source/specimen.html'), 'utf8'),
  readFile(resolve(root, 'common.css'), 'utf8'),
  readFile(resolve(root, 'a4.css'), 'utf8'),
  readFile(resolve(root, 'b5.css'), 'utf8')
])

let previousIndex = -1
for (const sheet of sheets) {
  const token = `data-view-id="${sheet.viewId}"`
  const matches = prepared.split(token).length - 1
  if (matches !== 1) throw new Error(`Prepared proof must contain ${sheet.viewId} exactly once; found ${matches}`)
  const index = prepared.indexOf(token)
  if (index <= previousIndex) throw new Error(`Prepared proof breaks frozen analytical-family ordering at ${sheet.viewId}`)
  previousIndex = index
}
if (/SPATIAL[-_ ]HIERARCHY/i.test(prepared)) throw new Error('DRW-10F must not resurrect the NOT_REQUIRED spatial-hierarchy plate')

for (const literal of [
  '.sheet-136-145 { width: 136mm; height: 145mm; }',
  '.sheet-166-108 { width: 166mm; height: 108mm; }',
  '.sheet-166-145 { width: 166mm; height: 145mm; }'
]) {
  if (!commonCss.includes(literal)) throw new Error(`Missing literal-size controlled-sheet rule: ${literal}`)
}
if (/scale\s*\(/i.test(commonCss) || /object-fit\s*:/i.test(commonCss) || /max-width\s*:\s*100%/i.test(commonCss)) {
  throw new Error('DRW-10F proof CSS contains a forbidden fit-scaling path')
}
if (!a4Css.includes('--page-width: 210mm') || !a4Css.includes('--page-height: 297mm')) throw new Error('A4 proof dimensions are not explicit')
if (!b5Css.includes('--page-width: 176mm') || !b5Css.includes('--page-height: 250mm')) throw new Error('B5 proof dimensions are not explicit')

async function inspectPdf(name: string, path: string, widthMm: number, heightMm: number): Promise<void> {
  const bytes = new Uint8Array(await readFile(path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== expectedPages.length) throw new Error(`${name}: expected ${expectedPages.length} pages, got ${pdf.numPages}`)

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale: 1 })
    if (!near(viewport.width, widthMm * ptPerMm) || !near(viewport.height, heightMm * ptPerMm)) {
      throw new Error(`${name}: page ${pageNo} is not ${widthMm}×${heightMm} mm`)
    }
  }

  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text.length !== expectedPages.length) throw new Error(`${name}: text extraction did not preserve ${expectedPages.length} pages`)
  if (text[0].trim() !== '') throw new Error(`${name}: page 1 must remain intentionally blank`)

  for (let i = 1; i < expectedPages.length; i++) {
    if (!text[i].includes(expectedPages[i])) throw new Error(`${name}: page ${i + 1} is missing expected role “${expectedPages[i]}”`)
  }

  for (const pageIndex of [2, 5, 6, 7, 8, 9]) {
    if (!text[pageIndex].includes('1:100')) throw new Error(`${name}: page ${pageIndex + 1} must declare 1:100`)
  }
  for (const pageIndex of [3, 4]) {
    if (!text[pageIndex].includes('1:200')) throw new Error(`${name}: page ${pageIndex + 1} must declare 1:200`)
  }
}

await inspectPdf('A4', resolve(root, 'dist/drw10f-a4.pdf'), 210, 297)
await inspectPdf('B5', resolve(root, 'dist/drw10f-b5.pdf'), 176, 250)

console.log('DRW-10F analytical-family A4/B5 physical proof PASS')
