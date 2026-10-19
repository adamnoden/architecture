import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const sectionPath = resolve(repositoryRoot, 'docs/reference-house/publication-principal-section.svg')
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
type SvgLine = { x1: number; y1: number; x2: number; y2: number; id: string; className: string }
type Box = { x0: number; y0: number; x1: number; y1: number }
type PdfInspection = { pages: TextMetric[][] }

const expected: Expected[] = [
  { name: 'A4', path: resolve(root, 'dist/drw05e-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw05e-b5.pdf'), widthMm: 176, heightMm: 250 }
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
function parseSvgLines(svg: string): SvgLine[] {
  return [...svg.matchAll(/<line\s+([^>]+)\/>/g)].map((match) => {
    const a = attrs(match[1])
    return { x1: Number(a.x1), y1: Number(a.y1), x2: Number(a.x2), y2: Number(a.y2), id: a['data-entity'] ?? '', className: a.class ?? '' }
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
function segmentIntersectsBox(line: SvgLine, box: Box): boolean {
  const dx = line.x2 - line.x1
  const dy = line.y2 - line.y1
  let t0 = 0
  let t1 = 1
  for (const [p, q] of [[-dx, line.x1 - box.x0], [dx, box.x1 - line.x1], [-dy, line.y1 - box.y0], [dy, box.y1 - line.y1]] as const) {
    if (p === 0) { if (q < 0) return false; continue }
    const r = q / p
    if (p < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    if (t0 > t1) return false
  }
  return true
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
  if (!text[1].includes('Principal longitudinal section') || !text[1].includes('1:100')) throw new Error(`${item.name}: spread-left furniture missing`)
  const extracted = await extractTextItems(pdf)
  const pages = extracted.items.map((page) => page.map((entry) => entry as unknown as TextMetric))
  if (pages.length !== 3) throw new Error(`${item.name}: text-item extraction did not preserve three pages`)
  if (pages[2].filter((entry) => entry.str.trim()).length < 12) throw new Error(`${item.name}: spread-right controlled drawing text is missing`)
  return { pages }
}
function exactMetric(items: TextMetric[], label: string): TextMetric {
  const found = items.find((item) => item.str.trim() === label)
  if (!found) throw new Error(`Could not find rendered text item ${label}`)
  return found
}

const [sectionSvg, commonCss, a4Css, b5Css] = await Promise.all([readFile(sectionPath, 'utf8'), readFile(commonCssPath, 'utf8'), readFile(a4CssPath, 'utf8'), readFile(b5CssPath, 'utf8')])
if (!/width="166mm" height="92mm"/.test(sectionSvg)) throw new Error('Controlled principal section is not 166 × 92 mm')
if (!/data-scale-denominator="100"/.test(sectionSvg)) throw new Error('Controlled principal section is not true 1:100')
if (!sectionSvg.includes('font-size:2.646px') || !sectionSvg.includes('font-size:2.293px')) throw new Error('Controlled section lost browser-safe SVG user-space typography units')
if (/font-size:(?:2\.646|2\.293)mm/.test(sectionSvg)) throw new Error('Controlled section regressed to browser-expanding CSS mm typography units')
for (const semantic of ['Entrance hall /', '>stair<', 'Open courtyard', 'Garden dining']) if (!sectionSvg.includes(semantic)) throw new Error(`Controlled section lost semantic content: ${semantic}`)
for (const token of ['--fold-exclusion: 12mm', '--drawing-fold-offset: 5mm', 'width: 166mm', 'height: 92mm']) if (!commonCss.includes(token)) throw new Error(`Spread CSS lost physical token: ${token}`)
if (/transform\s*:\s*scale|zoom\s*:/i.test(commonCss + a4Css + b5Css)) throw new Error('Spread proof must not scale controlled drawing geometry')

const texts = parseSvgTexts(sectionSvg)
for (const text of texts) {
  const box = textBox(text)
  if (drawingOffsetX + box.x0 < foldExclusion - 0.01) throw new Error(`${text.value}: unique drawing annotation enters the 12 mm fold exclusion`)
  if (drawingOffsetX + box.x1 > 171.01) throw new Error(`${text.value}: drawing annotation breaches the B5 outer 5 mm safe edge`)
  if (drawingTop + box.y0 < 5 || drawingTop + box.y1 > 245) throw new Error(`${text.value}: drawing annotation breaches the B5 vertical safe edge`)
}

const a4 = await inspectPdf(expected[0])
const b5 = await inspectPdf(expected[1])
const aTitle = exactMetric(a4.pages[1], 'Principal longitudinal section')
const bTitle = exactMetric(b5.pages[1], 'Principal longitudinal section')
const aUnit = aTitle.fontSize / 11
const bUnit = bTitle.fontSize / 11
if (!(aUnit > 0) || !(bUnit > 0) || !near(aUnit, bUnit, Math.max(aUnit, bUnit) * 0.02)) throw new Error('A4/B5 PDF text-unit calibration is inconsistent')
for (const [inspection, unit, name] of [[a4, aUnit, 'A4'], [b5, bUnit, 'B5']] as const) {
  const scale = exactMetric(inspection.pages[1], '1:100')
  if (!near(scale.fontSize, 8.3 * unit, 0.2 * unit)) throw new Error(`${name}: plate scale type is not physically proportional to its declared 8.3 pt size`)
  const right = inspection.pages[2].filter((entry) => entry.str.trim())
  const labelRole = right.filter((entry) => near(entry.fontSize, 7.5 * unit, 0.2 * unit))
  const noteRole = right.filter((entry) => near(entry.fontSize, 6.5 * unit, 0.2 * unit))
  if (labelRole.length < 8 || noteRole.length < 8) throw new Error(`${name}: controlled drawing does not preserve the frozen 7.5 pt / 6.5 pt type roles`)
}
if (!near(aTitle.width, bTitle.width, 0.5)) throw new Error('A4/B5 plate-title physical width parity failed')

const visibleLines = parseSvgLines(sectionSvg).filter((line) => /line-(?:cut|profile|primary|secondary)/.test(line.className))
for (const text of texts.filter((item) => item.className === 'text-label')) {
  const collision = visibleLines.find((line) => segmentIntersectsBox(line, textBox(text)))
  if (collision) throw new Error(`${text.value}: label intersects visible line ${collision.id || collision.className}`)
}

console.log('DRW-05E spread proof valid: blank→spread-left→spread-right pagination, literal true-1:100 section size, calibrated physical typography, 12 mm fold safety, B5 edge safety, label collision freedom and A4/B5 parity all hold.')
