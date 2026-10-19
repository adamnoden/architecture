import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const ptPerMm = 72 / 25.4

type TextMetric = { str: string; fontSize: number }
type ExpectedPdf = { name: string; path: string; widthMm: number; heightMm: number }
type Drawing = { name: string; path: string; widthMm: number; heightMm: number }

const pdfs: ExpectedPdf[] = [
  { name: 'A4', path: resolve(root, 'dist/drw03c2-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw03c2-b5.pdf'), widthMm: 176, heightMm: 250 }
]

const drawings: Drawing[] = [
  { name: 'ground plan', path: resolve(repositoryRoot, 'docs/reference-house/publication-ground-floor-plan.svg'), widthMm: 136, heightMm: 145 },
  { name: 'first-floor plan', path: resolve(repositoryRoot, 'docs/reference-house/publication-first-floor-plan.svg'), widthMm: 136, heightMm: 145 },
  { name: 'principal section', path: resolve(repositoryRoot, 'docs/reference-house/publication-principal-section.svg'), widthMm: 166, heightMm: 92 }
]

function near(actual: number, wanted: number, tolerance: number): boolean {
  return Math.abs(actual - wanted) <= tolerance
}

for (const drawing of drawings) {
  const svg = await readFile(drawing.path, 'utf8')
  if (!svg.includes(`width="${drawing.widthMm}mm" height="${drawing.heightMm}mm"`)) {
    throw new Error(`${drawing.name}: controlled physical dimensions changed`)
  }
  if (!svg.includes('data-scale-denominator="100"')) throw new Error(`${drawing.name}: scale denominator is not 1:100`)
  if (!svg.includes('font-size:2.646px') || !svg.includes('font-size:2.293px')) {
    throw new Error(`${drawing.name}: SVG type is not encoded in browser-safe user-space units`)
  }
  if (/font-size:(?:2\.646|2\.293)mm/.test(svg)) throw new Error(`${drawing.name}: physical CSS mm leaked back into SVG type`)
}

const commonCss = await readFile(resolve(root, 'common.css'), 'utf8')
const controlledRule = commonCss.match(/\.controlled-drawing\s*\{([^}]*)\}/s)?.[1]
if (!controlledRule) throw new Error('Proof CSS lost the controlled drawing rule')
if (/(?:^|;)\s*(?:width|height)\s*:/.test(controlledRule)) throw new Error('Proof CSS must not resize controlled drawings')
if (/transform\s*:\s*scale|\bzoom\s*:/i.test(commonCss)) throw new Error('Proof CSS must not scale controlled drawings')

for (const expected of pdfs) {
  const bytes = new Uint8Array(await readFile(expected.path))
  const pdf = await getDocumentProxy(bytes)
  if (pdf.numPages !== drawings.length) throw new Error(`${expected.name}: expected ${drawings.length} proof pages, got ${pdf.numPages}`)

  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, expected.widthMm * ptPerMm, 1) || !near(viewport.height, expected.heightMm * ptPerMm, 1)) {
      throw new Error(`${expected.name}: page ${pageNo} physical size changed`)
    }
  }

  const extracted = await extractTextItems(pdf)
  if (extracted.items.length !== drawings.length) throw new Error(`${expected.name}: text extraction lost proof pages`)

  extracted.items.forEach((rawPage, index) => {
    const page = rawPage.map((entry) => entry as unknown as TextMetric).filter((entry) => entry.str.trim())
    const calibration = page.find((entry) => entry.str.trim() === 'DRW-CAL')
    if (!calibration) throw new Error(`${expected.name} ${drawings[index].name}: 10 pt calibration text missing`)
    const unit = calibration.fontSize / 10
    if (!(unit > 0)) throw new Error(`${expected.name} ${drawings[index].name}: invalid PDF text calibration`)

    const drawingText = page.filter((entry) => entry !== calibration)
    const labels = drawingText.filter((entry) => near(entry.fontSize, 7.5 * unit, 0.2 * unit))
    const notes = drawingText.filter((entry) => near(entry.fontSize, 6.5 * unit, 0.2 * unit))
    const observed = [...new Set(drawingText.map((entry) => Math.round((entry.fontSize / unit) * 1000) / 1000))].sort((a, b) => a - b)
    if (labels.length < 1) throw new Error(`${expected.name} ${drawings[index].name}: no physically correct 7.5 pt SVG labels found; observed calibrated sizes: ${observed.join(', ')} pt`)
    if (notes.length < 1) throw new Error(`${expected.name} ${drawings[index].name}: no physically correct 6.5 pt SVG notes/markers found; observed calibrated sizes: ${observed.join(', ')} pt`)

    const oversized = drawingText.filter((entry) => near(entry.fontSize, 28.3425 * unit, 0.3 * unit) || near(entry.fontSize, 24.5625 * unit, 0.3 * unit))
    if (oversized.length) throw new Error(`${expected.name} ${drawings[index].name}: DRW-03C.1 3.779× typography regression detected`)
  })
}

console.log('DRW-03C.2 proof valid: all three controlled 1:100 drawings preserve 7.5 pt / 6.5 pt SVG typography through A4 and B5 browser/PDF embedding with no fit scaling.')
