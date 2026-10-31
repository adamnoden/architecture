import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-sectional-axonometric.svg')
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
  { name: 'A4', path: resolve(root, 'dist/drw09e-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw09e-b5.pdf'), widthMm: 176, heightMm: 250 }
]

const helveticaWidths: Record<string, number> = {
  ' ': 278,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  '-': 333, '–': 500, '/': 278, '.': 278, ':': 278, ',': 278, '×': 584, '≈': 549, '±': 584, '+': 584,
  '·': 278, '²': 556, '→': 584, '=': 584
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
function exactMetric(items: TextMetric[], label: string): TextMetric {
  const found = items.find((item) => item.str.trim() === label)
  if (!found) throw new Error(`Could not find rendered text item ${label}`)
  return found
}
async function inspectPdf(item: Expected): Promise<PdfInspection> {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(item.path)))
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two spread leaves`)
  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: wrong physical page size`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text[0].trim() !== '' || !text[1].includes('Sectional axonometric') || !text[1].includes('NTS')) throw new Error(`${item.name}: spread grammar failed`)
  if (!text[2].includes('SECTIONAL AXONOMETRIC · NTS') || !text[2].includes('court · controlled open void')) throw new Error(`${item.name}: controlled drawing text missing`)
  const extracted = await extractTextItems(pdf)
  const pages = extracted.items.map((page) => page.map((entry) => entry as unknown as TextMetric))
  if (pages.length !== 3) throw new Error(`${item.name}: text-item extraction did not preserve three pages`)
  return { pages }
}

const [svg, commonCss, a4Css, b5Css] = await Promise.all([readFile(svgPath, 'utf8'), readFile(commonCssPath, 'utf8'), readFile(a4CssPath, 'utf8'), readFile(b5CssPath, 'utf8')])
if (!/width="166mm" height="112mm"/.test(svg)) throw new Error('Controlled axonometric is not 166 × 112 mm')
if (!/data-scale="NTS"/.test(svg) || /data-scale-denominator=/.test(svg)) throw new Error('Controlled axonometric lost truthful NTS semantics')
if (!svg.includes('font-size:2.646px') || !svg.includes('font-size:2.293px')) throw new Error('Controlled axonometric lost browser-safe SVG user-space typography units')
for (const token of ['--fold-exclusion: 12mm', '--drawing-fold-offset: 5mm', 'width: 166mm', 'height: 112mm']) if (!commonCss.includes(token)) throw new Error(`Spread CSS lost physical token: ${token}`)
if (/transform\s*:\s*scale|zoom\s*:/i.test(commonCss + a4Css + b5Css)) throw new Error('Spread proof must not scale controlled drawing geometry')
for (const semantic of ['court · controlled open void', 'SV-01 · provisional capacity zone', 'exact 3D fall surfaces absent', 'no composite aperture geometry', 'editorial paper fit · NTS']) if (!svg.includes(semantic)) throw new Error(`Controlled axonometric lost authority cue: ${semantic}`)

for (const match of svg.matchAll(/<line\s+([^>]+)\/>/g)) {
  const a = attrs(match[1])
  for (const x of [Number(a.x1), Number(a.x2)]) {
    if (drawingOffsetX + x < foldExclusion - 0.01) throw new Error(`Drawing line ${a['data-entity']} enters fold exclusion`)
    if (drawingOffsetX + x > 171.01) throw new Error(`Drawing line ${a['data-entity']} breaches B5 outer safe edge`)
  }
  for (const y of [Number(a.y1), Number(a.y2)]) if (drawingTop + y < 5 || drawingTop + y > 245) throw new Error(`Drawing line ${a['data-entity']} breaches B5 vertical safe edge`)
}
for (const text of parseSvgTexts(svg)) {
  const box = textBox(text)
  if (drawingOffsetX + box.x0 < foldExclusion - 0.01) throw new Error(`${text.value}: annotation enters fold exclusion`)
  if (drawingOffsetX + box.x1 > 171.01) throw new Error(`${text.value}: annotation breaches B5 outer safe edge`)
  if (drawingTop + box.y0 < 5 || drawingTop + box.y1 > 245) throw new Error(`${text.value}: annotation breaches B5 vertical safe edge`)
}

const a4 = await inspectPdf(expected[0])
const b5 = await inspectPdf(expected[1])
const aTitle = exactMetric(a4.pages[1], 'Sectional axonometric')
const bTitle = exactMetric(b5.pages[1], 'Sectional axonometric')
const aUnit = aTitle.fontSize / 11
const bUnit = bTitle.fontSize / 11
if (!(aUnit > 0) || !(bUnit > 0) || !near(aUnit, bUnit, Math.max(aUnit, bUnit) * 0.02)) throw new Error('A4/B5 PDF text-unit calibration is inconsistent')
for (const [inspection, unit, name] of [[a4, aUnit, 'A4'], [b5, bUnit, 'B5']] as const) {
  const scale = exactMetric(inspection.pages[1], 'NTS')
  if (!near(scale.fontSize, 8.3 * unit, 0.2 * unit)) throw new Error(`${name}: NTS furniture type is not physically 8.3 pt`)
  const right = inspection.pages[2].filter((entry) => entry.str.trim())
  const internalTitle = exactMetric(right, 'SECTIONAL AXONOMETRIC · NTS')
  const internalNote = exactMetric(right, 'cut Y = 3.40 m · south court edge')
  if (!near(internalTitle.fontSize, 7.5 * unit, 0.2 * unit)) throw new Error(`${name}: internal label is not physically 7.5 pt`)
  if (!near(internalNote.fontSize, 6.5 * unit, 0.2 * unit)) throw new Error(`${name}: internal note is not physically 6.5 pt`)
}
if (!near(aTitle.width, bTitle.width, 0.5)) throw new Error('A4/B5 plate-title physical width parity failed')
const aNote = exactMetric(a4.pages[2], 'cut Y = 3.40 m · south court edge')
const bNote = exactMetric(b5.pages[2], 'cut Y = 3.40 m · south court edge')
if (!near(aNote.width, bNote.width, 0.5)) throw new Error('A4/B5 controlled-drawing physical width parity failed')

console.log('DRW-09E spread proof valid: literal NTS axonometric placement, blank→spread grammar, fold/B5 safety, calibrated physical typography and A4/B5 parity all hold.')
