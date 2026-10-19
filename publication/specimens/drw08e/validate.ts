import { readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractText, getDocumentProxy } from 'unpdf'

const root = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(root, '../../..')
const svgPath = resolve(repositoryRoot, 'docs/reference-house/publication-synthetic-setting.svg')
const ptPerMm = 72 / 25.4
const near = (a: number, b: number, tolerance = 1): boolean => Math.abs(a - b) <= tolerance

const svg = await readFile(svgPath, 'utf8')
if (!/width="166mm" height="108mm"/.test(svg)) throw new Error('Synthetic setting is not 166 × 108 mm')
if (!/data-scale-denominator="200"/.test(svg)) throw new Error('Synthetic setting is not true 1:200')
for (const token of [
  '≈15.5 m surrogate width stress-test',
  '≈1.75 m',
  'west access',
  'east service',
  'no plot boundary',
  'no legal boundary, plot depth, road or neighbours asserted'
]) if (!svg.includes(token)) throw new Error(`Synthetic setting lost authority cue: ${token}`)
for (const forbidden of ['site-boundary', 'highway-edge', 'neighbour', 'ashp-footprint', 'external-maintenance-access-rh08.svg']) {
  if (svg.includes(`data-entity="${forbidden}`)) throw new Error(`Synthetic setting invented forbidden site geometry: ${forbidden}`)
}
const rectCount = (svg.match(/<rect /g) ?? []).length
if (rectCount !== 2) throw new Error(`Synthetic setting expected only shell + court rectangles, got ${rectCount}`)

for (const item of [
  { name: 'A4', path: resolve(root, 'dist/drw08e-a4.pdf'), widthMm: 210, heightMm: 297 },
  { name: 'B5', path: resolve(root, 'dist/drw08e-b5.pdf'), widthMm: 176, heightMm: 250 }
]) {
  const pdf = await getDocumentProxy(new Uint8Array(await readFile(item.path)))
  if (pdf.numPages !== 3) throw new Error(`${item.name}: expected blank + two spread leaves`)
  for (let pageNo = 1; pageNo <= 3; pageNo++) {
    const viewport = (await pdf.getPage(pageNo)).getViewport({ scale: 1 })
    if (!near(viewport.width, item.widthMm * ptPerMm) || !near(viewport.height, item.heightMm * ptPerMm)) throw new Error(`${item.name}: wrong physical page size`)
  }
  const { text } = await extractText(pdf, { mergePages: false })
  if (!Array.isArray(text) || text[0].trim() !== '' || !text[1].includes('Synthetic setting / type plan') || !text[1].includes('1:200')) throw new Error(`${item.name}: spread grammar failed`)
  if (!text[2].includes('≈15.5 m surrogate width stress-test') || !text[2].includes('Synthetic type setting only')) throw new Error(`${item.name}: setting authority cues missing from recto`)
}
console.log('DRW-08E proof valid: true-1:200 surrogate setting survives A4/B5 without inventing plot depth or site boundaries.')
