import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const ptPerMm = 72 / 25.4

interface PdfExpectation {
  name: 'A4' | 'B5'
  path: string
  widthMm: number
  heightMm: number
}

interface SvgExpectation {
  name: string
  path: string
  widthMm: number
  heightMm: number
  scale: number
}

const pdfs: PdfExpectation[] = [
  { name: 'A4', path: resolve(root, 'dist/drw10f-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw10f-b5.pdf'), widthMm: 176, heightMm: 250 }
]

const svgs: SvgExpectation[] = [
  { name: 'synthetic setting', path: 'docs/reference-house/publication-synthetic-setting.svg', widthMm: 166, heightMm: 108, scale: 200 },
  { name: 'external maintenance', path: 'docs/reference-house/publication-external-maintenance-setting-overlay.svg', widthMm: 166, heightMm: 108, scale: 200 },
  { name: 'ground service', path: 'docs/reference-house/publication-ground-service-maintenance-overlay.svg', widthMm: 136, heightMm: 145, scale: 100 },
  { name: 'first service', path: 'docs/reference-house/publication-first-service-maintenance-overlay.svg', widthMm: 136, heightMm: 145, scale: 100 },
  { name: 'roof', path: 'docs/reference-house/publication-roof-drainage.svg', widthMm: 166, heightMm: 145, scale: 100 },
  { name: 'roof failure', path: 'docs/reference-house/publication-roof-water-failure-overlay.svg', widthMm: 166, heightMm: 145, scale: 100 },
  { name: 'structural', path: 'docs/reference-house/publication-structural-span-overlay.svg', widthMm: 136, heightMm: 145, scale: 100 },
  { name: 'adaptation', path: 'docs/reference-house/publication-future-adaptation-overlay.svg', widthMm: 136, heightMm: 145, scale: 100 }
]

const pageNeedles = [
  '',
  'Synthetic setting / type plan',
  'External maintenance / setting',
  'Ground service / maintenance geography',
  'First-floor service / maintenance geography',
  'Roof / drainage plan',
  'Roof water / failure reading',
  'Structure as order, not specification',
  'Structural / span reading',
  'Framework, not accessible-suite proof',
  'Future-adaptation framework'
] as const

const pageScales: Array<string | null> = [null, '1:200', '1:200', '1:100', '1:100', '1:100', '1:100', null, '1:100', null, '1:100']

const near = (actual: number, expected: number, tolerance = 1): boolean => Math.abs(actual - expected) <= tolerance

for (const svg of svgs) {
  const source = await readFile(resolve(repositoryRoot, svg.path), 'utf8')
  const dimensions = new RegExp(`width="${svg.widthMm}mm" height="${svg.heightMm}mm"`)
  if (!dimensions.test(source)) throw new Error(`${svg.name}: controlled SVG lost ${svg.widthMm} × ${svg.heightMm} mm physical size`)
  if (!source.includes(`data-scale-denominator="${svg.scale}"`)) throw new Error(`${svg.name}: controlled SVG lost 1:${svg.scale} scale metadata`)
}

const commonCss = await readFile(resolve(root, 'common.css'), 'utf8')
for (const token of ['width: 136mm', 'height: 145mm', 'width: 166mm', 'height: 108mm']) {
  if (!commonCss.includes(token)) throw new Error(`DRW-10F common CSS lost physical token: ${token}`)
}
if (/transform\s*:\s*scale|zoom\s*:/i.test(commonCss)) throw new Error('DRW-10F proof may not fit-scale controlled drawings')

const b5Css = await readFile(resolve(root, 'b5.css'), 'utf8')
if (!b5Css.includes('--page-width: 176mm')) throw new Error('B5 proof lost 176 mm page width')
if (!b5Css.includes('166 mm')) throw new Error('B5 proof must retain the explicit 166 mm true-size wide-plate constraint')

for (const pdfItem of pdfs) {
  const bytes = new Uint8Array(await readFile(pdfItem.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== 11) throw new Error(`${pdfItem.name}: expected 11 proof pages, got ${pdf.numPages}`)

  for (let pageNo = 1; pageNo <= 11; pageNo += 1) {
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale: 1 })
    if (!near(viewport.width, pdfItem.widthMm * ptPerMm) || !near(viewport.height, pdfItem.heightMm * ptPerMm)) {
      throw new Error(`${pdfItem.name}: page ${pageNo} is not ${pdfItem.widthMm} × ${pdfItem.heightMm} mm`)
    }
  }

  const extracted = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(extracted.text) || extracted.text.length !== 11) throw new Error(`${pdfItem.name}: text extraction did not preserve 11 pages`)
  const pages = extracted.text.map((page) => page.replace(/\s+/g, ' ').trim())
  if (pages[0] !== '') throw new Error(`${pdfItem.name}: page 1 must remain intentionally blank`)

  for (let index = 1; index < pageNeedles.length; index += 1) {
    if (!pages[index].includes(pageNeedles[index])) {
      throw new Error(`${pdfItem.name}: page ${index + 1} lost expected role: ${pageNeedles[index]}`)
    }
    const scale = pageScales[index]
    if (scale && !pages[index].includes(scale)) throw new Error(`${pdfItem.name}: page ${index + 1} lost declared ${scale} scale`)
  }

  const pairChecks = [
    [1, 'Synthetic setting / type plan', 2, 'External maintenance / setting'],
    [3, 'Ground service / maintenance geography', 4, 'First-floor service / maintenance geography'],
    [5, 'Roof / drainage plan', 6, 'Roof water / failure reading']
  ] as const
  for (const [leftIndex, leftNeedle, rightIndex, rightNeedle] of pairChecks) {
    if ((leftIndex + 1) % 2 !== 0 || (rightIndex + 1) % 2 !== 1) throw new Error('DRW-10F pair parity definition is invalid')
    if (!pages[leftIndex].includes(leftNeedle) || !pages[rightIndex].includes(rightNeedle)) {
      throw new Error(`${pdfItem.name}: facing-pair pagination drifted for ${leftNeedle} / ${rightNeedle}`)
    }
  }
}

console.log('DRW-10F analytical-family physical proof valid: 11-page sequence, three facing pairs, two prose↔single-plate events, exact A4/B5 page sizes, controlled SVG physical dimensions/scales and no fit-scaling all hold.')
