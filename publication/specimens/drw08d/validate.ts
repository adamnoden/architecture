import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-courtyard-elevation.svg')
const ptPerMm = 72 / 25.4
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance

const svg = await readFile(svgPath, 'utf8')
if (!/width="166mm" height="160mm"/.test(svg)) throw new Error('Courtyard plate is not 166 × 160 mm')
if (!/data-scale-denominator="50"/.test(svg)) throw new Error('Courtyard plate is not true 1:50')
if (svg.includes('<rect ')) throw new Error('Courtyard plate invented aperture or wall-area rectangles despite absent geometry')
for (const token of [
  'South court face · arrival / stair',
  'North court face · garden / landing',
  'G · opening occurrence',
  'U · opening occurrence',
  'East · two-bay gallery order · numeric axes absent',
  'West · two room-owned axes · numeric positions absent',
  'aperture extents absent'
]) if (!svg.includes(token)) throw new Error(`Courtyard plate lost authority cue: ${token}`)
if (svg.includes('courtyard-elevations-study.svg')) throw new Error('Courtyard plate imported legacy study identity')

for (const item of [
  { name: 'A4', path: resolve(root, 'dist/drw08d-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw08d-b5.pdf'), widthMm: 176, heightMm: 250 }
]) {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(item.path)))
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two spread leaves`)
  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: wrong physical page size`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text[0].trim() !== '' || !text[1].includes('Courtyard architectural elevations') || !text[1].includes('1:50')) throw new Error(`${item.name}: spread grammar failed`)
  if (!text[2].includes('South court face') || !text[2].includes('North court face')) throw new Error(`${item.name}: controlled courtyard faces missing from recto`)
}
console.log('DRW-08D proof valid: opposed courtyard faces remain full-scale 1:50 in A4/B5 without invented aperture geometry.')
