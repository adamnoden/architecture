import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const workRoot = resolve(import.meta.dirname, '.work')
const [svg100, svg50, manifestText] = await Promise.all([
  readFile(resolve(workRoot, 'ade03b-cavity-grammar-1-100.svg'), 'utf8'),
  readFile(resolve(workRoot, 'ade03b-cavity-grammar-1-50.svg'), 'utf8'),
  readFile(resolve(workRoot, 'manifest.json'), 'utf8')
])

const manifest = JSON.parse(manifestText) as {
  pageMm: { width: number; height: number }
  scales: number[]
  representedAssemblyMm: Record<string, number>
  technicalClaim: boolean
  fitScaling: boolean
  grammars: string[]
  specimens: string[]
  visualRules: Record<string, string>
}

if (manifest.pageMm.width !== 594 || manifest.pageMm.height !== 420) {
  throw new Error('ADE-03B proof must remain exact A2 landscape.')
}
if (manifest.fitScaling !== false) throw new Error('ADE-03B must not use fit scaling.')
if (manifest.technicalClaim !== false) throw new Error('ADE-03B specimen must remain coordination-level representation, not technical specification.')
if (manifest.representedAssemblyMm.total !== 417.5) throw new Error('ADE-03B representative wall total drifted.')
if (manifest.representedAssemblyMm.weatheringLeaf !== 102.5 || manifest.representedAssemblyMm.cavity !== 160 || manifest.representedAssemblyMm.structuralLeaf !== 140 || manifest.representedAssemblyMm.finishZone !== 15) {
  throw new Error('ADE-03B representative layer values drifted from the recorded RH-10-like proof family.')
}
if (JSON.stringify(manifest.grammars) !== JSON.stringify(['BODY', 'QUIET', 'STRUCTURAL'])) {
  throw new Error('ADE-03B grammar set drifted.')
}
if (manifest.specimens.length !== 3) throw new Error('ADE-03B requires straight, corner and ring specimens.')

const style = (svg: string): string => svg.match(/<style>([^<]+)<\/style>/)?.[1] ?? ''
if (!style(svg100) || style(svg100) !== style(svg50)) {
  throw new Error('ADE-03B 1:100 and 1:50 must use identical physical-paper tokens.')
}

for (const [scale, svg] of [[100, svg100], [50, svg50]] as const) {
  if (!svg.includes('width="594mm" height="420mm"')) throw new Error(`ADE-03B 1:${scale} is not exact A2 landscape.`)
  if (!svg.includes(`data-scale-denominator="${scale}"`)) throw new Error(`ADE-03B sheet does not honestly declare 1:${scale}.`)
  if (svg.includes('transform="scale(')) throw new Error(`ADE-03B 1:${scale} contains forbidden fit scaling.`)
  if (svg.includes('stroke-dasharray') && /class="[^"]*dash-/.test(svg)) {
    throw new Error(`ADE-03B 1:${scale} must not use dashed construction/uncertainty graphics in the wall grammar proof.`)
  }

  const paths = svg.match(/<path [^>]+\/>/g) ?? []
  const body = paths.filter((path) => path.includes('data-grammar="BODY"'))
  const quiet = paths.filter((path) => path.includes('data-grammar="QUIET"'))
  const structural = paths.filter((path) => path.includes('data-grammar="STRUCTURAL"'))
  if (body.length !== 3) throw new Error(`ADE-03B 1:${scale} BODY should contain one joined path per specimen, got ${body.length}.`)
  if (quiet.length !== 15) throw new Error(`ADE-03B 1:${scale} QUIET should contain four bands + outline per specimen, got ${quiet.length}.`)
  if (structural.length !== 15) throw new Error(`ADE-03B 1:${scale} STRUCTURAL should contain four bands + outline per specimen, got ${structural.length}.`)

  const cavityPaths = paths.filter((path) => path.includes('data-layerRole="cavity-zone"'))
  if (cavityPaths.length !== 6 || cavityPaths.some((path) => !path.includes('class="fill-paper"'))) {
    throw new Error(`ADE-03B 1:${scale} cavity must be represented only as paper-white void in both layered grammars.`)
  }

  const quietStructural = paths.filter((path) => path.includes('data-grammar="QUIET"') && (path.includes('data-layerRole="structural-leaf"') || path.includes('data-layerRole="finish-zone"')))
  if (quietStructural.length !== 6 || quietStructural.some((path) => !path.includes('class="fill-faint"'))) {
    throw new Error(`ADE-03B 1:${scale} QUIET inner leaf/finish must remain the same faint tint as the weathering leaf.`)
  }

  const emphasizedStructural = paths.filter((path) => path.includes('data-grammar="STRUCTURAL"') && (path.includes('data-layerRole="structural-leaf"') || path.includes('data-layerRole="finish-zone"')))
  if (emphasizedStructural.length !== 6 || emphasizedStructural.some((path) => !path.includes('class="fill-context"'))) {
    throw new Error(`ADE-03B 1:${scale} STRUCTURAL emphasis must be tint-only on the inner leaf/finish zone.`)
  }
}

const pathFor = (svg: string, grammar: string, entityFragment: string): string => {
  const candidates = svg.match(/<path [^>]+\/>/g) ?? []
  const matches = candidates.filter((path) => path.includes(`data-grammar="${grammar}"`) && path.includes(`data-entity="${entityFragment}"`))
  if (matches.length !== 1) throw new Error(`ADE-03B expected one ${grammar}/${entityFragment} path, got ${matches.length}.`)
  return matches[0]
}

const bbox = (path: string) => {
  const d = path.match(/ d="([^"]+)"/)?.[1]
  if (!d) throw new Error('ADE-03B path has no d attribute.')
  const numbers = [...d.matchAll(/-?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]))
  const xs: number[] = []
  const ys: number[] = []
  for (let index = 0; index < numbers.length; index += 2) {
    xs.push(numbers[index]); ys.push(numbers[index + 1])
  }
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

for (const grammar of ['BODY', 'QUIET', 'STRUCTURAL']) {
  const entities = grammar === 'BODY'
    ? ['body-STRAIGHT', 'body-CORNER', 'body-RING']
    : ['weathering-STRAIGHT', 'cavity-STRAIGHT', 'structural-STRAIGHT', 'outline-CORNER', 'outline-RING']
  for (const entity of entities) {
    const a = bbox(pathFor(svg100, grammar, entity))
    const b = bbox(pathFor(svg50, grammar, entity))
    if (a.width > 0 && Math.abs(b.width / a.width - 2) > 0.002) {
      throw new Error(`ADE-03B ${grammar}/${entity} width is not true 1:100 → 1:50 scaling.`)
    }
    if (a.height > 0 && Math.abs(b.height / a.height - 2) > 0.002) {
      throw new Error(`ADE-03B ${grammar}/${entity} height is not true 1:100 → 1:50 scaling.`)
    }
  }
}

console.log('ADE-03B PASS — cavity-wall grammar comparison is exact-scale, source-identical and isolated to restrained fill hierarchy.')
