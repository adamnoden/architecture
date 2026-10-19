import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-service-side-elevation.svg')
const ptPerMm = 72 / 25.4
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance

const svg = await readFile(svgPath, 'utf8')
if (!/width="166mm" height="96mm"/.test(svg)) throw new Error('Service-side elevation is not 166 × 96 mm')
if (!/data-scale-denominator="100"/.test(svg)) throw new Error('Service-side elevation is not true 1:100')
if (!svg.includes('font-size:2.646px') || !svg.includes('font-size:2.293px')) throw new Error('Service-side elevation lost browser-safe SVG typography units')
for (const token of [
  'study window · aperture unresolved',
  'bathroom daylight · aperture unresolved',
  'plant opening ≈1.0 m clear target',
  'position / head unresolved',
  'kitchen window · aperture unresolved',
  'MVHR OA/EA · high service zone',
  'RWP-SE / RWP-NE · return zones only; centrelines absent',
  'Field ticks show ownership, not facade seams · service labels are zones, not MEP coordinates.'
]) if (!svg.includes(token)) throw new Error(`Service-side elevation lost authority cue: ${token}`)
if (svg.includes('<rect')) throw new Error('Service-side elevation invented aperture/equipment rectangle geometry')
for (const forbidden of ['outer-elevations-rh10.svg', 'bathroom direct wall extract', 'BX-01']) {
  if (svg.includes(forbidden)) throw new Error(`Service-side elevation imported stale or forbidden content: ${forbidden}`)
}

for (const item of [
  { name: 'A4', path: resolve(root, 'dist/drw08e2-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw08e2-b5.pdf'), widthMm: 176, heightMm: 250 }
]) {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(item.path)))
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two plate leaves`)
  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: wrong physical page size`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text[0].trim() !== '' || !text[1].includes('Service-side elevation') || !text[1].includes('1:100')) throw new Error(`${item.name}: plate grammar failed`)
  const right = text[2]
  for (const token of ['MVHR OA/EA', 'RWP-SE / RWP-NE', '3 m']) {
    if (!right.includes(token)) throw new Error(`${item.name}: controlled drawing text missing: ${token}`)
  }
}
console.log('DRW-08E.2 proof valid: service-side elevation stays true 1:100 in A4/B5 and preserves occurrence/zone authority without pseudo-MEP geometry.')
