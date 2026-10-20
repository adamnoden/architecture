import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(root, '../../..')
const ptPerMm = 72 / 25.4

type Expected = { name: string; path: string; widthMm: number; heightMm: number }
const expected: Expected[] = [
  { name: 'A4', path: resolve(root, 'dist/drw11f-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw11f-b5.pdf'), widthMm: 176, heightMm: 250 }
]

function near(actual: number, wanted: number, tolerance = 1): boolean {
  return Math.abs(actual - wanted) <= tolerance
}

async function inspect(item: Expected) {
  const bytes = new Uint8Array(await readFile(item.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== 1) throw new Error(`${item.name}: expected 1 page, got ${pdf.numPages}`)
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 1 })
  if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) {
    throw new Error(`${item.name}: page is not ${item.widthMm}×${item.heightMm} mm`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text.length !== 1 || !text[0].includes('Early-book FLOW proof')) {
    throw new Error(`${item.name}: proof page marker missing`)
  }
  const items = await extractTextItems(pdf)
  return items.items
}

function fontSizeFor(items: Awaited<ReturnType<typeof inspect>>, label: string): number {
  const hits = items.flat().filter((item) => item.str.trim() === label)
  if (!hits.length) throw new Error(`Could not find text item ${label}`)
  return hits[0].fontSize
}

const svg = await readFile(resolve(repoRoot, 'docs/manuscript/figures/selective-permanence-platform.svg'), 'utf8')
if (!svg.includes('width="128mm"') || !svg.includes('height="78mm"') || !svg.includes('viewBox="0 0 128 78"')) {
  throw new Error('Selective-permanence SVG must retain its 128 × 78 mm physical frame')
}
if (!svg.includes('.label{font-size:2.646px') || !svg.includes('.note{font-size:2.293px')) {
  throw new Error('Selective-permanence SVG must retain the proven 7.5 / 6.5 pt paper-space type roles')
}

const a4 = await inspect(expected[0])
const b5 = await inspect(expected[1])
for (const [label, target] of [['Permanent fabric', 7.5], ['SLOWER / MORE ENDURING', 6.5]] as const) {
  const a4Size = fontSizeFor(a4, label)
  const b5Size = fontSizeFor(b5, label)
  if (!near(a4Size, target, 0.25)) throw new Error(`${label}: A4 font size ${a4Size.toFixed(2)} pt is not ${target} pt`)
  if (!near(b5Size, target, 0.25)) throw new Error(`${label}: B5 font size ${b5Size.toFixed(2)} pt is not ${target} pt`)
  if (!near(a4Size, b5Size, 0.15)) throw new Error(`${label}: B5 font size ${b5Size.toFixed(2)} pt drifted from A4 ${a4Size.toFixed(2)} pt`)
}

console.log('DRW-11F early FLOW proof valid: A4/B5 page sizes, fixed 128 mm figure frame and 7.5/6.5 pt embedded type all hold.')
