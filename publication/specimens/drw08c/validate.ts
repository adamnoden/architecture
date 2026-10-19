import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, extractTextItems, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-garden-elevation.svg')
const ptPerMm = 72 / 25.4
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance

const svg = await readFile(svgPath, 'utf8')
if (!/width="166mm" height="96mm"/.test(svg)) throw new Error('Garden elevation is not 166 × 96 mm')
if (!/data-scale-denominator="100"/.test(svg)) throw new Error('Garden elevation is not true 1:100')
if (!svg.includes('font-size:2.646px') || !svg.includes('font-size:2.293px')) throw new Error('Garden elevation lost browser-safe SVG typography units')
for (const token of [
  '≈1.2 m clear target',
  'kitchen opening · unresolved',
  'dry-store opening · width unresolved',
  'Three room-owned fields · masonry retained between openings.',
  'axis-only marks mean aperture geometry is absent.'
]) if (!svg.includes(token)) throw new Error(`Garden elevation lost authority cue: ${token}`)
for (const forbidden of ['opening-G-GARDEN-CENTRE-envelope', 'opening-G-GARDEN-EAST-envelope', 'opening-U-GARDEN-CENTRE-envelope', 'outer-elevations-rh10.svg']) {
  if (svg.includes(forbidden)) throw new Error(`Garden elevation invented or imported forbidden geometry: ${forbidden}`)
}
for (const required of ['opening-G-GARDEN-WEST-envelope', 'opening-U-GARDEN-WEST-envelope', 'opening-U-GARDEN-EAST-envelope']) {
  if (!svg.includes(required)) throw new Error(`Garden elevation lost bounded aperture: ${required}`)
}

for (const item of [
  { name: 'A4', path: resolve(root, 'dist/drw08c-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw08c-b5.pdf'), widthMm: 176, heightMm: 250 }
]) {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(item.path)))
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two spread leaves`)
  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: wrong physical page size`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text[0].trim() !== '' || !text[1].includes('Garden elevation') || !text[1].includes('1:100')) throw new Error(`${item.name}: spread grammar failed`)
  const extracted = await extractTextItems(pdf)
  const right = extracted.items[2].map((entry) => entry as unknown as { str: string; fontSize: number })
  for (const label of ['≈1.2 m clear target', '3 m']) {
    const metric = right.find((entry) => entry.str.trim() === label)
    if (!metric) throw new Error(`${item.name}: missing controlled drawing text ${label}`)
  }
}
console.log('DRW-08C proof valid: garden elevation stays true 1:100 in A4/B5 and preserves unresolved aperture authority without fabricated completeness.')
