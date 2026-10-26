import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')
const [svg100, svg50, manifestText] = await Promise.all([
  readFile(resolve(workRoot, 'ade04b-opening-uncertainty-1-100.svg'), 'utf8'),
  readFile(resolve(workRoot, 'ade04b-opening-uncertainty-1-50.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])

const manifest = JSON.parse(manifestText) as {
  pageMm: { width: number; height: number }
  scales: number[]
  fitScaling: boolean
  uncertaintyInsideWallMatter: boolean
  dashedPseudoJambs: boolean
  physicalRangeGeometry: string
}

if (manifest.pageMm.width !== 594 || manifest.pageMm.height !== 420) throw new Error('ADE-04B atlas must remain exact A2 landscape.')
if (manifest.fitScaling !== false) throw new Error('ADE-04B must not use fit scaling.')
if (manifest.uncertaintyInsideWallMatter !== false || manifest.dashedPseudoJambs !== false) {
  throw new Error('ADE-04B manifest must forbid uncertainty marks inside wall matter and dashed pseudo-jambs.')
}
if (manifest.physicalRangeGeometry !== 'minimum guaranteed aperture') throw new Error('ADE-04B range geometry must remain the guaranteed minimum aperture.')

const style = (svg: string): string => svg.match(/<style>([^<]+)<\/style>/)?.[1] ?? ''
if (!style(svg100) || style(svg100) !== style(svg50)) throw new Error('ADE-04B 1:100 / 1:50 must use identical physical-paper tokens.')

const tags = (svg: string): string[] => svg.match(/<(?:line|path|text) [^>]+(?:\/>|<\/text>)/g) ?? []
const entityIds = (svg: string): string[] => [...svg.matchAll(/data-entity="([^"]+)"/g)].map((match) => match[1])
const epistemicTags = (svg: string): string[] => tags(svg).filter((tag) => tag.includes('data-epistemic="opening-uncertainty"'))
const pathFor = (svg: string, id: string): string => {
  const matches = (svg.match(/<path [^>]+\/>/g) ?? []).filter((tag) => tag.includes(`data-entity="${id}"`))
  if (matches.length !== 1) throw new Error(`ADE-04B expected exactly one path ${id}, got ${matches.length}.`)
  return matches[0]
}
const moveCount = (path: string): number => (path.match(/M /g) ?? []).length

for (const [scale, svg] of [[100, svg100], [50, svg50]] as const) {
  if (!svg.includes('width="594mm" height="420mm"')) throw new Error(`ADE-04B 1:${scale} is not exact A2 landscape.`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) throw new Error(`ADE-04B 1:${scale} does not honestly declare scale.`)
  if (svg.includes('transform="scale(')) throw new Error(`ADE-04B 1:${scale} contains forbidden fit scaling.`)

  const ids = entityIds(svg)
  if (new Set(ids).size !== ids.length) throw new Error(`ADE-04B 1:${scale} contains duplicate drawing entity ids.`)

  const epistemic = epistemicTags(svg)
  if (epistemic.length === 0) throw new Error(`ADE-04B 1:${scale} emitted no epistemic notation.`)
  for (const tag of epistemic) {
    if (/dash-/.test(tag) || /stroke-dasharray/.test(tag)) throw new Error(`ADE-04B 1:${scale} uncertainty notation contains a dashed pseudo-construction mark.`)
    if (!/data-state="(?:approximate-aperture|range-width|centre-only|host-obligation)"/.test(tag)) {
      throw new Error(`ADE-04B 1:${scale} uncertainty element lacks an explicit authority state.`)
    }
  }

  if (svg.includes('data-opening="O-EXACT" data-epistemic="opening-uncertainty"')) {
    throw new Error(`ADE-04B 1:${scale} exact aperture must not carry uncertainty notation.`)
  }

  // Exact / approximate / range states are true full-depth apertures in the
  // monolithic control; centre-only and host-only states must not invent one.
  for (const id of ['O-EXACT-WA-MONO-WALL', 'O-APPROX-WA-MONO-WALL', 'O-RANGE-WA-MONO-WALL']) {
    if (moveCount(pathFor(svg, id)) !== 2) throw new Error(`ADE-04B 1:${scale} ${id} must contain two material islands around a real aperture.`)
  }
  for (const id of ['O-CENTRE-WA-MONO-WALL', 'O-HOST-WA-MONO-WALL']) {
    if (moveCount(pathFor(svg, id)) !== 1) throw new Error(`ADE-04B 1:${scale} ${id} invented a physical aperture from unresolved authority.`)
  }
}

const lineById = (svg: string, id: string): string => {
  const matches = (svg.match(/<line [^>]+\/>/g) ?? []).filter((tag) => tag.includes(`data-entity="${id}"`))
  if (matches.length !== 1) throw new Error(`ADE-04B expected one line ${id}, got ${matches.length}.`)
  return matches[0]
}
const length = (line: string): number => {
  const read = (name: string): number => Number(line.match(new RegExp(`${name}="([^"]+)"`))?.[1])
  return Math.hypot(read('x2') - read('x1'), read('y2') - read('y1'))
}

// Physical-paper tick size remains constant while model-space uncertainty spans
// scale conventionally. Use the monolithic comparator to isolate notation from
// assembly-band styling.
const tick100 = length(lineById(svg100, 'WA-MONO-O-RANGE-span-a'))
const tick50 = length(lineById(svg50, 'WA-MONO-O-RANGE-span-a'))
if (Math.abs(tick100 - tick50) > 0.001) throw new Error('ADE-04B range tick changed physical size between 1:100 and 1:50.')
const span100 = length(lineById(svg100, 'WA-MONO-O-RANGE-span'))
const span50 = length(lineById(svg50, 'WA-MONO-O-RANGE-span'))
if (Math.abs(span50 / span100 - 2) > 0.002) throw new Error('ADE-04B model-space range span does not double at 1:50.')

console.log('ADE-04B PASS — uncertainty remains external, non-dashed and authority-specific at exact 1:100 / 1:50.')
