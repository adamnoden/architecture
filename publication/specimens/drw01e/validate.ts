import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const ptPerMm = 72 / 25.4

type Expected = { name: string; path: string; widthMm: number; heightMm: number }
const expected: Expected[] = [
  { name: 'A4', path: resolve(root, 'dist/drw01e-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw01e-b5.pdf'), widthMm: 176, heightMm: 250 }
]

function near(actual: number, wanted: number, tolerance = 1): boolean {
  return Math.abs(actual - wanted) <= tolerance
}

async function inspect(item: Expected) {
  const bytes = new Uint8Array(await readFile(item.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== 7) throw new Error(`${item.name}: expected 7 pages, got ${pdf.numPages}`)
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo)
    const viewport = page.getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) {
      throw new Error(`${item.name}: page ${pageNo} size ${viewport.width.toFixed(2)}×${viewport.height.toFixed(2)} pt is not ${item.widthMm}×${item.heightMm} mm`)
    }
  }
  const { text } = await extractText(pdf, { mergePages: true })
  const merged = String(text)
  for (const marker of ['Drawing doctrine specimen', 'Synthetic ground plan', 'Synthetic first-floor plan', 'Synthetic section / notation test', 'Synthetic long section — spread proof']) {
    if (!merged.includes(marker)) throw new Error(`${item.name}: missing proof marker: ${marker}`)
  }
  const items = await extractTextItems(pdf)
  return items.items
}

function fontSizeFor(items: Awaited<ReturnType<typeof inspect>>, label: string): number {
  const hits = items.flat().filter((item) => item.str.trim() === label)
  if (!hits.length) throw new Error(`Could not find text item ${label}`)
  return hits[0].fontSize
}

const a4 = await inspect(expected[0])
const b5 = await inspect(expected[1])
for (const label of ['Kitchen', 'Bedroom', 'Approx.']) {
  const a4Size = fontSizeFor(a4, label)
  const b5Size = fontSizeFor(b5, label)
  if (!near(a4Size, b5Size, 0.15)) throw new Error(`${label}: B5 font size ${b5Size.toFixed(2)} pt drifted from A4 ${a4Size.toFixed(2)} pt`)
}
console.log('DRW-01E proof PDFs valid: 7 pages each; A4/B5 sizes correct; key drawing labels preserve physical type size.')
