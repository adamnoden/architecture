import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const elevationPath = resolve(repositoryRoot, 'docs/reference-house/publication-principal-front-elevation.svg')
const commonCssPath = resolve(root, 'common.css')
const a4CssPath = resolve(root, 'a4.css')
const b5CssPath = resolve(root, 'b5.css')
const ptPerMm = 72 / 25.4
const drawingOffsetX = 5
const drawingTop = 28
const foldExclusion = 12

type Expected = { name: string; path: string; widthMm: number; heightMm: number }
type TextMetric = { str: string; fontSize: number; width: number }
type SvgText = { x: number; y: number; anchor: string; value: string; className: string }
type Box = { x0: number; y0: number; x1: number; y1: number }
type PdfInspection = { pages: TextMetric[][] }

const expected: Expected[] = [
  { name: 'A4', path: resolve(root, 'dist/drw06e-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw06e-b5.pdf'), widthMm: 176, heightMm: 250 }
]

const helveticaWidths: Record<string, number> = {
  ' ': 278,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  '-': 333, '–': 500, '/': 278, '.': 278, ':': 278, ',': 278, '×': 584, '≈': 549, '±': 584, '+': 584
}

function near(actual: number, wanted: number, tolerance = 1): boolean { return Math.abs(actual - wanted) <= tolerance }
function attrs(source: string): Record<string, string> { return Object.fromEntries([...source.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]])) }
function decodeXml(value: string): string { return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'") }
function parseSvgTexts(svg: string): SvgText[] {
  return [...svg.matchAll(/<text\s+([^>]+)>([^<]*)<\/text>/g)].map((match) => {
    const a = attrs(match[1])
    return { x: Number(a.x), y: Number(a.y), anchor: a['text-anchor'] ?? 'start', value: decodeXml(match[2]), className: a.class ?? '' }
  })
}
function textPointSize(text: SvgText): number {
  if (text.className === 'text-label') return 7.5
  if (text.className === 'text-note' || text.className === 'text-marker') return 6.5
  throw new Error(`${text.value}: unknown drawing text class ${text.className}`)
}
function helveticaWidthMm(value: string, pointSize: number): number {
  const units = [...value].reduce((sum, glyph) => sum + (helveticaWidths[glyph] ?? 700), 0)
  return (units / 1000) * (pointSize / ptPerMm)
}
function textBox(text: SvgText): Box {
  const pointSize = textPointSize(text)
  const width = helveticaWidthMm(text.value, pointSize)
  const fontMm = pointSize / ptPerMm
  let x0 = text.x
  let x1 = text.x + width
  if (text.anchor === 'middle') { x0 = text.x - width / 2; x1 = text.x + width / 2 }
  if (text.anchor === 'end') { x0 = text.x - width; x1 = text.x }
  return { x0, x1, y0: text.y - fontMm, y1: text.y + fontMm * 0.3 }
}
async function inspectPdf(item: Expected): Promise<PdfInspection> {
  const bytes = new Uint8Array(await readFile(item.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two spread leaves, got ${pdf.numPages} pages`)
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: page ${pageNo} is not ${item.widthMm}×${item.heightMm} mm`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text.length !== 3) throw new Error(`${item.name}: text extraction did not preserve three pages`)
  if (text[0].trim() !== '') throw new Error(`${item.name}: page 1 must remain intentionally blank`)
  if (!text[1].includes('Principal front elevation') || !text[1].includes('1:100')) throw new Error(`${item.name}: spread-left furniture missing`)
  const extracted = await extractTextItems(pdf)
  const pages = extracted.items.map((page) => page.map((entry) => entry as unknown as TextMetric))
  if (pages.length !== 3) throw new Error(`${item.name}: text-item extraction did not preserve three pages`)
  if (pages[2].filter((entry) => entry.str.trim()).length < 8) throw new Error(`${item.name}: spread-right controlled drawing text is missing`)
  return { pages }
}
function exactMetric(items: TextMetric[], label: string): TextMetric {
  const found = items.find((item) => item.str.trim() === label)
  if (!found) throw new Error(`Could not find rendered text item ${label}`)
  return found
}

const [elevationSvg, commonCss, a4Css, b5Css] = await Promise.all([readFile(elevationPath, 'utf8'), readFile(commonCssPath, 'utf8'), readFile(a4CssPath, 'utf8'), readFile(b5CssPath, 'utf8')])
if (!/width="166mm" height="92mm"/.test(elevationSvg)) throw new Error('Controlled principal front elevation is not 166 × 92 mm')
if (!/data-scale-denominator="100"/.test(elevationSvg)) throw new Error('Controlled principal front elevation is not true 1:100')
if (!elevationSvg.includes('font-size:2.646px') || !elevationSvg.includes('font-size:2.293px')) throw new Error('Controlled elevation lost browser-safe SVG user-space typography units')
if (/font-size:(?:2\.646|2\.293)mm/.test(elevationSvg)) throw new Error('Controlled elevation regressed to browser-expanding CSS mm typography units')
for (const semantic of ['Provisional opening geometry', 'Entrance lower termination unresolved', 'GFFL ±0.000', '≈ Cornice control +6.250']) if (!elevationSvg.includes(semantic)) throw new Error(`Controlled elevation lost semantic content: ${semantic}`)
for (const token of ['--fold-exclusion: 12mm', '--drawing-fold-offset: 5mm', 'width: 166mm', 'height: 92mm']) if (!commonCss.includes(token)) throw new Error(`Spread CSS lost physical token: ${token}`)
if (/transform\s*:\s*scale|zoom\s*:/i.test(commonCss + a4Css + b5Css)) throw new Error('Spread proof must not scale controlled drawing geometry')
if (!/dash-provisional/.test(elevationSvg)) throw new Error('Controlled elevation lost provisional line notation')
for (const rangeCue of ['opening-G-FRONT-D01-width-min-left', 'opening-U-FRONT-W01-width-min-left', 'opening-G-FRONT-W01-sill-max']) if (!elevationSvg.includes(rangeCue)) throw new Error(`Controlled elevation lost range cue: ${rangeCue}`)

const texts = parseSvgTexts(elevationSvg)
for (const text of texts) {
  const box = textBox(text)
  if (drawingOffsetX + box.x0 < foldExclusion - 0.01) throw new Error(`${text.value}: unique drawing annotation enters the 12 mm fold exclusion`)
  if (drawingOffsetX + box.x1 > 171.01) throw new Error(`${text.value}: drawing annotation breaches the B5 outer 5 mm safe edge`)
  if (drawingTop + box.y0 < 5 || drawingTop + box.y1 > 245) throw new Error(`${text.value}: drawing annotation breaches the B5 vertical safe edge`)
}

const a4 = await inspectPdf(expected[0])
const b5 = await inspectPdf(expected[1])
const aTitle = exactMetric(a4.pages[1], 'Principal front elevation')
const bTitle = exactMetric(b5.pages[1], 'Principal front elevation')
const aUnit = aTitle.fontSize / 11
const bUnit = bTitle.fontSize / 11
if (!(aUnit > 0) || !(bUnit > 0) || !near(aUnit, bUnit, Math.max(aUnit, bUnit) * 0.02)) throw new Error('A4/B5 PDF text-unit calibration is inconsistent')
for (const [inspection, unit, name] of [[a4, aUnit, 'A4'], [b5, bUnit, 'B5']] as const) {
  const scale = exactMetric(inspection.pages[1], '1:100')
  if (!near(scale.fontSize, 8.3 * unit, 0.2 * unit)) throw new Error(`${name}: plate scale type is not physically proportional to its declared 8.3 pt size`)
  const right = inspection.pages[2].filter((entry) => entry.str.trim())
  for (const label of ['GFFL ±0.000', '3 m', 'Provisional opening geometry; paired extents show source ranges.']) {
    const metric = exactMetric(right, label)
    if (!near(metric.fontSize, 6.5 * unit, 0.2 * unit)) throw new Error(`${name}: ${label} is not physically 6.5 pt`)
  }
}
if (!near(aTitle.width, bTitle.width, 0.5)) throw new Error('A4/B5 plate-title physical width parity failed')
const aDatum = exactMetric(a4.pages[2], 'GFFL ±0.000')
const bDatum = exactMetric(b5.pages[2], 'GFFL ±0.000')
if (!near(aDatum.width, bDatum.width, 0.5)) throw new Error('A4/B5 controlled-drawing physical width parity failed')

console.log('DRW-06E spread proof valid: blank→spread-left→spread-right pagination, literal true-1:100 elevation size, calibrated physical typography, fold/B5 edge safety, provisional-range notation and A4/B5 parity all hold.')
