import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-ground-floor-plan.svg')
const cssPath = resolve(root, 'common.css')
const ptPerMm = 72 / 25.4
const frame = { width: 140, height: 153, safe: 5, drawingX: 6, drawingY: 5 }

type Expected = { name: string; path: string; widthMm: number; heightMm: number }
type TextMetric = { str: string; fontSize: number; width: number }
type SvgText = { x: number; y: number; anchor: string; value: string; className: string; rotate: number | null }
type SvgRect = { x: number; y: number; width: number; height: number; id: string }

const expected: Expected[] = [
  { name: 'A4', path: resolve(root, 'dist/drw03f-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw03f-b5.pdf'), widthMm: 176, heightMm: 250 }
]

// Standard Helvetica/Arial-compatible advance widths in thousandths of an em.
// The renderer's frozen family is Arial, Helvetica, sans-serif; room-label collision
// checks need deterministic paper-space widths rather than browser/PDF text extraction,
// because SVG text is retained by Chromium as vector content rather than PDF text items.
const helveticaWidths: Record<string, number> = {
  ' ': 278,
  A: 667, B: 667, C: 722, D: 722, E: 667, F: 611, G: 778, H: 722, I: 278, J: 500, K: 667, L: 556, M: 833,
  N: 722, O: 778, P: 667, Q: 778, R: 722, S: 667, T: 611, U: 722, V: 667, W: 944, X: 667, Y: 667, Z: 611,
  a: 556, b: 556, c: 500, d: 556, e: 556, f: 278, g: 556, h: 556, i: 222, j: 222, k: 500, l: 222, m: 833,
  n: 556, o: 556, p: 556, q: 556, r: 333, s: 500, t: 278, u: 556, v: 500, w: 722, x: 500, y: 500, z: 500,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556, '8': 556, '9': 556,
  '-': 333, '/': 278, '.': 278, ':': 278, '×': 584, '≈': 549
}

function near(actual: number, wanted: number, tolerance = 1): boolean {
  return Math.abs(actual - wanted) <= tolerance
}

function attrs(source: string): Record<string, string> {
  return Object.fromEntries([...source.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]))
}

function decodeXml(value: string): string {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
}

function parseSvgTexts(svg: string): SvgText[] {
  return [...svg.matchAll(/<text\s+([^>]+)>([^<]*)<\/text>/g)].map((match) => {
    const a = attrs(match[1])
    const rotation = a.transform?.match(/rotate\((-?[\d.]+)/)
    return {
      x: Number(a.x),
      y: Number(a.y),
      anchor: a['text-anchor'] ?? 'start',
      value: decodeXml(match[2]),
      className: a.class ?? '',
      rotate: rotation ? Number(rotation[1]) : null
    }
  })
}

function parseInkWalls(svg: string): SvgRect[] {
  return [...svg.matchAll(/<rect\s+([^>]+)\/>/g)]
    .map((match) => attrs(match[1]))
    .filter((a) => a.class === 'fill-ink' && (a['data-entity'] ?? '').startsWith('wall-'))
    .map((a) => ({
      x: Number(a.x),
      y: Number(a.y),
      width: Number(a.width),
      height: Number(a.height),
      id: a['data-entity']
    }))
}

async function inspect(item: Expected) {
  const bytes = new Uint8Array(await readFile(item.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== 2) throw new Error(`${item.name}: expected 2 pages, got ${pdf.numPages}`)
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) {
      throw new Error(`${item.name}: page ${pageNo} is not ${item.widthMm}×${item.heightMm} mm`)
    }
  }

  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text.length !== 2) throw new Error(`${item.name}: text extraction did not preserve 2 pages`)
  if (text[0].trim() !== '') throw new Error(`${item.name}: page 1 must remain intentionally blank`)
  for (const marker of ['Ground-floor plan', '1:100', 'Reference House.']) {
    if (!text[1].includes(marker)) throw new Error(`${item.name}: plate page missing ${marker}`)
  }

  const items = await extractTextItems(pdf)
  return items.items.flat().map((item) => item as unknown as TextMetric)
}

function metricFor(items: TextMetric[], label: string): TextMetric {
  const hits = items.filter((item) => item.str.trim() === label)
  if (!hits.length) throw new Error(`Could not find rendered page-furniture text item ${label}`)
  const metric = hits[0]
  if (!Number.isFinite(metric.fontSize) || !Number.isFinite(metric.width)) {
    throw new Error(`${label}: rendered page-furniture text metrics are unavailable`)
  }
  return metric
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

function horizontalBounds(text: SvgText, widthMm: number): [number, number] {
  if (text.anchor === 'middle') return [text.x - widthMm / 2, text.x + widthMm / 2]
  if (text.anchor === 'end') return [text.x - widthMm, text.x]
  return [text.x, text.x + widthMm]
}

function overlaps(a0: number, a1: number, b0: number, b1: number): boolean {
  return Math.min(a1, b1) - Math.max(a0, b0) > 0.01
}

const svg = await readFile(svgPath, 'utf8')
const css = await readFile(cssPath, 'utf8')
if (!/width="136mm" height="145mm"/.test(svg)) throw new Error('Controlled SVG is not 136 × 145 mm')
if (!/data-scale-denominator="100"/.test(svg)) throw new Error('Controlled SVG is not 1:100')
for (const token of ['width: 140mm', 'height: 153mm', 'left: 6mm', 'top: 5mm', 'width: 136mm', 'height: 145mm']) {
  if (!css.includes(token)) throw new Error(`Plate CSS lost physical token: ${token}`)
}

const a4Items = await inspect(expected[0])
const b5Items = await inspect(expected[1])

// Page furniture must retain the same physical type size/width in both trim proofs.
for (const [label, expectedPt] of [['Ground-floor plan', 11], ['1:100', 8.3]] as const) {
  const a4 = metricFor(a4Items, label)
  const b5 = metricFor(b5Items, label)
  if (!near(a4.fontSize, expectedPt, 0.25)) throw new Error(`${label}: A4 rendered size ${a4.fontSize.toFixed(2)} pt is not ${expectedPt} pt`)
  if (!near(b5.fontSize, expectedPt, 0.25)) throw new Error(`${label}: B5 rendered size ${b5.fontSize.toFixed(2)} pt is not ${expectedPt} pt`)
  if (!near(a4.fontSize, b5.fontSize, 0.12)) throw new Error(`${label}: physical type size drifted between A4 and B5`)
  if (!near(a4.width, b5.width, 0.5)) throw new Error(`${label}: physical text width drifted between A4 and B5`)
}

const svgTexts = parseSvgTexts(svg)
const walls = parseInkWalls(svg)

// Prove the nominal 5 mm plate-frame annotation inset from the frozen physical
// font family/size contract, independent of PDF text extraction behaviour.
for (const text of svgTexts) {
  const pointSize = textPointSize(text)
  const widthMm = helveticaWidthMm(text.value, pointSize)
  const fontMm = pointSize / ptPerMm
  let x0: number
  let x1: number
  let y0: number
  let y1: number

  if (text.rotate === -90) {
    x0 = text.x - fontMm
    x1 = text.x + fontMm
    y0 = text.y - widthMm
    y1 = text.y + widthMm
  } else {
    ;[x0, x1] = horizontalBounds(text, widthMm)
    y0 = text.y - fontMm
    y1 = text.y + fontMm * 0.3
  }

  x0 += frame.drawingX
  x1 += frame.drawingX
  y0 += frame.drawingY
  y1 += frame.drawingY

  if (x0 < frame.safe - 0.05 || x1 > frame.width - frame.safe + 0.05 || y0 < frame.safe - 0.05 || y1 > frame.height - frame.safe + 0.05) {
    throw new Error(`${text.value}: drawing annotation footprint breaches the 5 mm plate-frame safe zone`)
  }
}

// Fail closed when a principal room/place label crosses cut-wall poche at its authored baseline.
for (const text of svgTexts.filter((item) => item.className === 'text-label')) {
  const [x0, x1] = horizontalBounds(text, helveticaWidthMm(text.value, 7.5))
  const collision = walls.find((wall) =>
    text.y >= wall.y && text.y <= wall.y + wall.height && overlaps(x0, x1, wall.x, wall.x + wall.width)
  )
  if (collision) throw new Error(`${text.value}: room label intersects cut-wall poche ${collision.id}`)
}

console.log('DRW-03F ground-plan plate proof valid: true 1:100 size, A4/B5 page-furniture parity, 5 mm plate safe zone and room-label/poche collision checks all hold.')
