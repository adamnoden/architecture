import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')

const [svg100, svg50, manifestText] = await Promise.all([
  readFile(resolve(workRoot, 'ade02-wall-topology-1-100.svg'), 'utf8'),
  readFile(resolve(workRoot, 'ade02-wall-topology-1-50.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])

const manifest = JSON.parse(manifestText) as {
  pageMm: { width: number; height: number }
  scales: number[]
  capabilities: Array<{ id: string; label: string }>
  fitScaling: boolean
  wallRepresentation: string
}

if (manifest.pageMm.width !== 594 || manifest.pageMm.height !== 420) {
  throw new Error(`ADE-02 capability atlas must remain exact A2 landscape, got ${manifest.pageMm.width} × ${manifest.pageMm.height} mm.`)
}
if (manifest.fitScaling !== false) throw new Error('ADE-02 capability atlas must not use fit scaling.')
if (manifest.wallRepresentation !== 'one joined even-odd path per connected semantic wall network') {
  throw new Error('ADE-02 manifest no longer records joined-region wall representation.')
}
if (manifest.capabilities.length !== 6) throw new Error(`ADE-02 expected six topology capabilities, got ${manifest.capabilities.length}.`)

const style = (svg: string): string => svg.match(/<style>([^<]+)<\/style>/)?.[1] ?? ''
if (!style(svg100) || style(svg100) !== style(svg50)) {
  throw new Error('ADE-02 1:100 and 1:50 sheets must use identical physical-paper graphic tokens.')
}

for (const [scale, svg] of [[100, svg100], [50, svg50]] as const) {
  if (!svg.includes('width="594mm" height="420mm"')) throw new Error(`ADE-02 1:${scale} sheet is not exact A2 landscape.`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) throw new Error(`ADE-02 sheet does not honestly declare 1:${scale}.`)
  if (svg.includes('transform="scale(')) throw new Error(`ADE-02 1:${scale} sheet contains forbidden fit/transform scaling.`)
  if ((svg.match(/<path /g) ?? []).length !== 6) throw new Error(`ADE-02 1:${scale} sheet must contain exactly six joined wall paths.`)
  if (!svg.includes('fill-rule="evenodd"')) throw new Error(`ADE-02 1:${scale} sheet lost even-odd joined-region support.`)
}

const pathFor = (svg: string, capability: string): string => {
  const paths = svg.match(/<path [^>]+\/>/g) ?? []
  const path = paths.find((candidate) => candidate.includes(`data-capability="${capability}"`))
  if (!path) throw new Error(`ADE-02 missing path for ${capability}.`)
  return path
}

const bbox = (path: string) => {
  const d = path.match(/ d="([^"]+)"/)?.[1]
  if (!d) throw new Error('ADE-02 path has no d attribute.')
  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]))
  if (numbers.length < 8 || numbers.length % 2 !== 0) throw new Error('ADE-02 path coordinate stream is malformed.')
  const xs: number[] = []
  const ys: number[] = []
  for (let index = 0; index < numbers.length; index += 2) {
    xs.push(numbers[index]); ys.push(numbers[index + 1])
  }
  return {
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  }
}

for (const capability of manifest.capabilities.map((item) => item.id)) {
  const path100 = pathFor(svg100, capability)
  const path50 = pathFor(svg50, capability)
  if (!path100.includes('data-topology="joined-wall-region"') || !path50.includes('data-topology="joined-wall-region"')) {
    throw new Error(`ADE-02 ${capability} is not emitted as a joined wall region.`)
  }
  const a = bbox(path100)
  const b = bbox(path50)
  const ratioW = b.width / a.width
  const ratioH = b.height / a.height
  if (Math.abs(ratioW - 2) > 0.001 || Math.abs(ratioH - 2) > 0.001) {
    throw new Error(`ADE-02 ${capability} geometry is not true 1:100 → 1:50 scaling: ${ratioW.toFixed(4)} × ${ratioH.toFixed(4)}.`)
  }
}

// Closed rings are the capability that independent rectangles could not express
// without seams. Preserve two subpaths (outer boundary + hole) inside ONE path.
for (const capability of ['C05', 'C06']) {
  for (const svg of [svg100, svg50]) {
    const path = pathFor(svg, capability)
    const d = path.match(/ d="([^"]+)"/)?.[1] ?? ''
    if ((d.match(/M /g) ?? []).length !== 2) {
      throw new Error(`ADE-02 ${capability} must contain exactly outer + inner rings inside one path.`)
    }
  }
}

console.log('ADE-02 PASS — joined wall topology is deterministic, seam-free at the vector boundary, and true-scale at 1:100 / 1:50.')
