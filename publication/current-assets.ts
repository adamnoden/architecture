import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { prepareCurrentDesignCompile } from '../compiler/reference-house/current-design/compile.js'
import { readGeorgianDesignSnapshot } from '../compiler/reference-house/current-design/georgian-source.js'
import { renderDrawingSceneV2SvgWithTokens } from '../compiler/publication-drawing-v2/svg.js'
import { PLT_CANDIDATE_TOKENS } from '../compiler/publication-drawing-v2/plt-candidate-tokens.js'
import { createPrimerGroundPlanScene } from './primer/figure.js'
import { translateDrawingPrimitive } from '../compiler/publication-drawing-v2/composition.js'

export const currentPublicationAssetPaths = [
  'publication/current/ground-plan.svg', 'publication/current/first-plan.svg',
  'publication/current/study-fixed.svg', 'publication/current/study-timber.svg', 'publication/current/study-tile.svg',
] as const

const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const planTokens = { ...PLT_CANDIDATE_TOKENS, fontFamily: 'Arial, Helvetica, sans-serif' }

export function compilePublicationPlanAssets(input: unknown, scope: 'current' | 'authored-candidate' = 'current') {
  const plans = prepareCurrentDesignCompile(input).plans()
  if ((scope === 'current' && plans.status !== 'NOMINAL_PLAN_ONLY')
      || (scope === 'authored-candidate' && plans.status !== 'CANDIDATE_NOMINAL_PLAN_ONLY')) {
    throw new Error('Current book plates require the admitted current design; candidate plans need explicit review scope')
  }
  const assets = (['GROUND', 'FIRST'] as const).map((level, index) => {
    const native = plans.plans[level]
    const common = createPrimerGroundPlanScene(native)
    const framed = { ...common, widthMm: common.widthMm + 10, heightMm: 176,
      primitives: common.primitives.map(primitive => translateDrawingPrimitive(primitive, 5, 0)) }
    const scene = plans.status === 'NOMINAL_PLAN_ONLY' ? framed : { ...framed,
      widthMm: Math.max(framed.widthMm, native.widthMm), heightMm: Math.max(framed.heightMm, native.heightMm + 8) }
    return { path: currentPublicationAssetPaths[index], svg: renderDrawingSceneV2SvgWithTokens(scene, planTokens) + '\n' }
  })
  return { source: plans.source, state: plans.status, scope, method: plans.method, assets,
    diagnostics: plans.diagnostics }
}

export function blackOnlyPublicationSvg(svg: string) {
  return svg.replace(/#[0-9a-f]{6}\b/gi, colour => {
    const channels = [1, 3, 5].map(offset => parseInt(colour.slice(offset, offset + 2), 16))
    const grey = Math.round(channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722)
    return '#' + grey.toString(16).padStart(2, '0').repeat(3)
  })
}

export function frameFurnishedStudy(svg: string, view: 'fixed' | 'timber' | 'tile') {
  const styles = svg.match(/<style>[\s\S]*?<\/style>/g)
  const groups = [...svg.matchAll(/<g\b[^>]*>[\s\S]*?<\/g>/g)].map(match => match[0])
  const expected = view === 'tile' ? ['translate(25,15)'] : ['translate(6,50) scale(.95)', 'translate(722,50) scale(.95)']
  if (styles?.length !== 1 || groups.length !== expected.length
      || groups.some((group, index) => !group.startsWith(`<g transform="${expected[index]}">`))) {
    throw new Error('The furnished Study producer changed its composition; review the publication frame')
  }
  const content = view === 'tile' ? groups[0] : view === 'fixed' ? groups[0]
    : groups[1].replace('translate(722,50)', 'translate(2,50)')
  const [width, height] = view === 'tile' ? [790, 903] : [720, 895]
  const title = view === 'fixed' ? 'Fixed Study finish comparison' : view === 'timber' ? 'Removable timber Study proposal' : 'Tiled Study finish comparison'
  const style = styles[0].replace(/font:(\d+)px (?:Georgia|Arial)/g, 'font-family:Arial, Helvetica, sans-serif;font-size:$1px')
  return blackOnlyPublicationSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="138mm" height="${138 * height / width}mm" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc" data-publication-source-sha256="${digest(svg)}" data-scale="NTS"><title id="title">${title}</title><desc id="desc">Conditional furnished room comparison. Geometry and furniture are unchanged from the current Study generator; black-only paint and page framing are publication choices. Owner acceptance remains open.</desc>${style}<rect width="${width}" height="${height}" fill="#ffffff"/>${content}</svg>\n`)
}

export function buildCurrentPublicationAssets(repoRoot: string, input: unknown = readGeorgianDesignSnapshot()) {
  const plans = compilePublicationPlanAssets(input)
  const producer = 'project/ias/studies/crafted-study-views.mjs'
  execFileSync(process.execPath, ['--import', 'tsx', producer, '--check'], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] })
  const comparisonPath = 'project/ias/studies/crafted-study-comparison.svg'
  const tilePath = 'project/ias/studies/crafted-study-tile.svg'
  const comparison = readFileSync(resolve(repoRoot, comparisonPath), 'utf8')
  const tile = readFileSync(resolve(repoRoot, tilePath), 'utf8')
  const assets = [...plans.assets,
    { path: currentPublicationAssetPaths[2], svg: frameFurnishedStudy(comparison, 'fixed') },
    { path: currentPublicationAssetPaths[3], svg: frameFurnishedStudy(comparison, 'timber') },
    { path: currentPublicationAssetPaths[4], svg: frameFurnishedStudy(tile, 'tile') },
  ]
  return {
    schema: 'current-publication-assets/1' as const, source: plans.source,
    nominalPlanMethod: plans.method,
    scope: 'Two current nominal plans and three conditional owner-review room comparisons. The occupied Study opening set-out is not adopted into the nominal plans. No roof/section reconciliation or technical, physical or owner acceptance.',
    producerChecks: [{ path: producer, sha256: digest(readFileSync(resolve(repoRoot, producer), 'utf8')),
      inputArtwork: { [comparisonPath]: digest(comparison), [tilePath]: digest(tile) } }],
    assets: assets.map(asset => ({ ...asset, sha256: digest(asset.svg) })),
  }
}

export type CurrentPublicationAssets = ReturnType<typeof buildCurrentPublicationAssets>
