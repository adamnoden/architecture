import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')
const [svg100, svg50, manifestText] = await Promise.all([
  readFile(resolve(workRoot, 'ade05b-partition-adjacency-candidates-1-100.svg'), 'utf8'),
  readFile(resolve(workRoot, 'ade05b-partition-adjacency-candidates-1-50.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])
const manifest = JSON.parse(manifestText) as {
  pageMm: { width: number; height: number }
  scales: number[]
  physicalPartitionSelected: boolean
  doorSelected: boolean
  datumPaperWidthMm: number
}

if (manifest.pageMm.width !== 594 || manifest.pageMm.height !== 420) throw new Error('ADE-05B candidates must remain exact A2 landscape.')
if (manifest.physicalPartitionSelected !== false) throw new Error('ADE-05B candidate atlas must not select a physical partition family before ADE-05A.')
if (manifest.doorSelected !== false) throw new Error('ADE-05B adjacency atlas must not select a door.')
if (manifest.datumPaperWidthMm !== 0.9) throw new Error('ADE-05B faint datum locus must remain a fixed paper-space width candidate.')

const style = (svg: string): string => svg.match(/<style>([^<]+)<\/style>/)?.[1] ?? ''
if (!style(svg100) || style(svg100) !== style(svg50)) throw new Error('ADE-05B must use identical physical-paper tokens between scales.')

const entityIds = (svg: string): string[] => [...svg.matchAll(/data-entity="([^"]+)"/g)].map((match) => match[1])
const lineById = (svg: string, id: string): string => {
  const matches = (svg.match(/<line [^>]+\/>/g) ?? []).filter((tag) => tag.includes(`data-entity="${id}"`))
  if (matches.length !== 1) throw new Error(`ADE-05B expected one line ${id}, got ${matches.length}.`)
  return matches[0]
}
const rectById = (svg: string, id: string): string => {
  const matches = (svg.match(/<rect [^>]+\/>/g) ?? []).filter((tag) => tag.includes(`data-entity="${id}"`))
  if (matches.length !== 1) throw new Error(`ADE-05B expected one rect ${id}, got ${matches.length}.`)
  return matches[0]
}
const attribute = (tag: string, name: string): number => Number(tag.match(new RegExp(`${name}="([^"]+)"`))?.[1])
const lineLength = (tag: string): number => Math.hypot(attribute(tag, 'x2') - attribute(tag, 'x1'), attribute(tag, 'y2') - attribute(tag, 'y1'))

for (const [scale, svg] of [[100, svg100], [50, svg50]] as const) {
  if (!svg.includes('width="594mm" height="420mm"')) throw new Error(`ADE-05B 1:${scale} is not exact A2 landscape.`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) throw new Error(`ADE-05B 1:${scale} does not honestly declare scale.`)
  if (svg.includes('transform="scale(')) throw new Error(`ADE-05B 1:${scale} contains forbidden fit scaling.`)
  const ids = entityIds(svg)
  if (new Set(ids).size !== ids.length) throw new Error(`ADE-05B 1:${scale} contains duplicate drawing entity ids.`)
  if (svg.includes('doorSelected="true"') || svg.includes('physicalThickness="true"')) throw new Error(`ADE-05B 1:${scale} smuggled physical partition/door authority into candidate notation.`)

  const band = rectById(svg, 'datum-0-band')
  if (Math.abs(attribute(band, 'width') - 0.9) > 0.001) throw new Error(`ADE-05B 1:${scale} faint datum locus is not constant paper width.`)
  const rails = [lineById(svg, 'datum-2-rail-a'), lineById(svg, 'datum-2-rail-b')]
  const railSpacing = Math.abs(attribute(rails[1], 'x1') - attribute(rails[0], 'x1'))
  if (Math.abs(railSpacing - 0.9) > 0.001) throw new Error(`ADE-05B 1:${scale} paired datum rail spacing is not constant paper-space notation.`)
}

// Adjacency candidate span is derived from a 2600 mm model segment and must
// therefore double conventionally at 1:50. Bracket offset/tick geometry remains
// paper-space notation.
const span100 = lineLength(lineById(svg100, 'adj-0-span'))
const span50 = lineLength(lineById(svg50, 'adj-0-span'))
if (Math.abs(span50 / span100 - 2) > 0.002) throw new Error('ADE-05B adjacency span does not double conventionally at 1:50.')
const tick100 = lineLength(lineById(svg100, 'adj-0-a'))
const tick50 = lineLength(lineById(svg50, 'adj-0-a'))
if (Math.abs(tick100 - tick50) > 0.001) throw new Error('ADE-05B adjacency bracket ticks changed physical paper size between scales.')

console.log('ADE-05B PASS — candidate atlas preserves non-physical partition notation and non-door adjacency semantics at exact 1:100 / 1:50.')
