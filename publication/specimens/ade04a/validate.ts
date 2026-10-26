import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')
const [svg100, svg50, manifestText] = await Promise.all([
  readFile(resolve(workRoot, 'ade04a-opening-subtraction-1-100.svg'), 'utf8'),
  readFile(resolve(workRoot, 'ade04a-opening-subtraction-1-50.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])

const manifest = JSON.parse(manifestText) as {
  pageMm: { width: number; height: number }
  scales: number[]
  fitScaling: boolean
  materialSubtraction: boolean
  whiteOverpaintPrimitive: boolean
  frameRevealClaim: boolean
  rangedFixtureRepresentation: string
}

if (manifest.pageMm.width !== 594 || manifest.pageMm.height !== 420) throw new Error('ADE-04A proof must remain exact A2 landscape.')
if (manifest.fitScaling !== false) throw new Error('ADE-04A must not use fit scaling.')
if (manifest.materialSubtraction !== true || manifest.whiteOverpaintPrimitive !== false) {
  throw new Error('ADE-04A manifest must preserve true material subtraction and forbid white opening overpaint.')
}
if (manifest.frameRevealClaim !== false) throw new Error('ADE-04A must not claim frame/reveal geometry.')
if (!manifest.rangedFixtureRepresentation.startsWith('minimum guaranteed physical aperture')) {
  throw new Error('ADE-04A ranged fixture must remain minimum-guaranteed geometry pending ADE-04B uncertainty notation.')
}

const style = (svg: string): string => svg.match(/<style>([^<]+)<\/style>/)?.[1] ?? ''
if (!style(svg100) || style(svg100) !== style(svg50)) throw new Error('ADE-04A 1:100 / 1:50 must use identical physical-paper tokens.')

const paths = (svg: string): string[] => svg.match(/<path [^>]+\/>/g) ?? []
const pathFor = (svg: string, entity: string): string => {
  const matches = paths(svg).filter((path) => path.includes(`data-entity="${entity}"`))
  if (matches.length !== 1) throw new Error(`ADE-04A expected one path ${entity}, got ${matches.length}.`)
  return matches[0]
}
const moveCount = (path: string): number => (path.match(/M /g) ?? []).length

const bbox = (path: string) => {
  const d = path.match(/ d="([^"]+)"/)?.[1]
  if (!d) throw new Error('ADE-04A path has no d attribute.')
  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]))
  const xs: number[] = []
  const ys: number[] = []
  for (let index = 0; index < numbers.length; index += 2) { xs.push(numbers[index]); ys.push(numbers[index + 1]) }
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

for (const [scale, svg] of [[100, svg100], [50, svg50]] as const) {
  if (!svg.includes('width="594mm" height="420mm"')) throw new Error(`ADE-04A 1:${scale} is not exact A2 landscape.`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) throw new Error(`ADE-04A 1:${scale} does not honestly declare scale.`)
  if (svg.includes('transform="scale(')) throw new Error(`ADE-04A 1:${scale} contains forbidden fit scaling.`)
  if (/<rect\b/.test(svg)) throw new Error(`ADE-04A 1:${scale} contains a rectangle primitive; aperture proof must be path topology, not white rectangle overpaint.`)

  const allPaths = paths(svg)
  if (allPaths.length !== 18) throw new Error(`ADE-04A 1:${scale} expected 18 topology/band paths, got ${allPaths.length}.`)
  const outlined = allPaths.filter((path) => path.includes('data-openings='))
  if (outlined.length !== 6) throw new Error(`ADE-04A 1:${scale} expected six opening-aware overall paths, got ${outlined.length}.`)

  // A full-depth opening in a lone straight wall physically disconnects the
  // remaining material. The path must therefore contain two material islands.
  if (moveCount(pathFor(svg, 'ADE04A-WA-MONO-SINGLE-OPENED')) !== 2) {
    throw new Error(`ADE-04A 1:${scale} single monolithic aperture is not represented as two genuine material islands.`)
  }
  // Two openings create three material islands in the straight control.
  if (moveCount(pathFor(svg, 'ADE04A-WA-MONO-MULTIPLE-OPENED')) !== 3) {
    throw new Error(`ADE-04A 1:${scale} multiple-opening control is not represented as three material islands.`)
  }
  // The L-corner wall remains one connected material region around its turn.
  if (moveCount(pathFor(svg, 'ADE04A-WA-MONO-CORNER-OPENED')) !== 1) {
    throw new Error(`ADE-04A 1:${scale} near-corner opening incorrectly disconnects the L wall network.`)
  }
}

for (const entity of [
  'ADE04A-WA-MONO-SINGLE-OPENED',
  'ADE04A-WA-MONO-CORNER-OPENED',
  'ADE04A-WA-MONO-MULTIPLE-OPENED',
  'ADE04A-WA-LAYERED-SINGLE-OUTLINE',
  'ADE04A-WA-LAYERED-CORNER-OUTLINE',
  'ADE04A-WA-LAYERED-MULTIPLE-OUTLINE'
]) {
  const a = bbox(pathFor(svg100, entity))
  const b = bbox(pathFor(svg50, entity))
  if (a.width > 0 && Math.abs(b.width / a.width - 2) > 0.002) throw new Error(`ADE-04A ${entity} width does not double at 1:50.`)
  if (a.height > 0 && Math.abs(b.height / a.height - 2) > 0.002) throw new Error(`ADE-04A ${entity} height does not double at 1:50.`)
}

console.log('ADE-04A PASS — admitted apertures are true topology subtraction through joined and layered wall regions at exact 1:100 / 1:50.')
