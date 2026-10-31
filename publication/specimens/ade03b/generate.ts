import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { DrawingPath, DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'
import { compileWallAssemblyTopology, type AdeWallAssemblyBandRegion } from '../../../compiler/architectural-drawing/assembly-topology.js'
import { wallAssemblyBandToDrawingPath } from '../../../compiler/architectural-drawing/assembly-drawing.js'
import type {
  AdeArchitecturalPlan,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallRun
} from '../../../compiler/architectural-drawing/model.js'
import { compileWallTopology } from '../../../compiler/architectural-drawing/topology.js'
import { wallTopologyRegionToDrawingPath } from '../../../compiler/architectural-drawing/wall-drawing.js'
import { ADE03B_PROOF_TOKENS } from './tokens.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 594
const PAGE_HEIGHT = 420
const MARGIN_X = 20
const COLUMN_WIDTH = 184
const COLUMN_GAP = 1
const HEADER_Y = 12
const FIXTURE_TOPS = [66, 166, 274] as const
const FIXTURE_HEIGHTS = [72, 94, 116] as const
const REPRESENTED_TOTAL = 417.5

const controlledExact: AdeProvenance = {
  sourceIds: ['ADE-03B-SYNTHETIC'],
  authority: 'controlled',
  precision: 'exact'
}
const controlledApprox: AdeProvenance = {
  sourceIds: ['RH10-COORDINATION-FAMILY-SYNTHETIC'],
  authority: 'controlled',
  precision: 'approximate'
}
const controlledRange: AdeProvenance = {
  sourceIds: ['RH10-COORDINATION-FAMILY-SYNTHETIC'],
  authority: 'controlled',
  precision: 'range'
}

const node = (id: string, x: number, y: number): AdePlanNode => ({
  kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: controlledExact
})

const layer = (
  id: string,
  role: AdeWallAssemblyLayer['role'],
  thickness: AdeWallAssemblyLayer['thickness'],
  provenance: AdeProvenance
): AdeWallAssemblyLayer => ({ id, role, thickness, provenance })

const assembly = (): AdeWallAssembly => ({
  kind: 'wall-assembly',
  id: 'ADE03B-RH10-LIKE-WALL',
  thickness: { kind: 'range', min: mm(410), max: mm(435) },
  layers: [
    layer('ADE03B-WEATHERING', 'weathering-leaf', { kind: 'approximate', value: mm(102.5) }, controlledApprox),
    layer('ADE03B-CAVITY', 'cavity-zone', { kind: 'range', min: mm(150), max: mm(175) }, controlledRange),
    layer('ADE03B-STRUCTURAL', 'structural-leaf', { kind: 'approximate', value: mm(140) }, controlledApprox),
    layer('ADE03B-FINISH', 'finish-zone', { kind: 'approximate', value: mm(15) }, controlledApprox)
  ],
  provenance: controlledRange
})

const wall = (id: string, fromNodeId: string, toNodeId: string): AdeWallRun => ({
  kind: 'wall',
  id,
  fromNodeId,
  toNodeId,
  reference: 'right-face',
  assemblyId: 'ADE03B-RH10-LIKE-WALL',
  assemblyStartFace: 'right-face',
  provenance: controlledExact
})

const plan = (id: string, nodes: AdePlanNode[], walls: AdeWallRun[]): AdeArchitecturalPlan => ({
  id,
  sourceId: 'ADE-03B-SYNTHETIC',
  nodes,
  wallAssemblies: [assembly()],
  walls,
  openings: [],
  partitionDatums: [],
  spaces: [],
  adjacencies: [],
  dimensions: [],
  labels: []
})

const fixtures: readonly { id: string; label: string; plan: AdeArchitecturalPlan }[] = [
  {
    id: 'STRAIGHT',
    label: 'straight run',
    plan: plan('ADE03B-STRAIGHT', [node('A', 0, 0), node('B', 5000, 0)], [wall('W1', 'A', 'B')])
  },
  {
    id: 'CORNER',
    label: 'L corner',
    plan: plan('ADE03B-CORNER', [node('A', 0, 0), node('B', 5000, 0), node('C', 5000, 3500)], [wall('W1', 'A', 'B'), wall('W2', 'B', 'C')])
  },
  {
    id: 'RING',
    label: 'closed perimeter',
    plan: plan(
      'ADE03B-RING',
      [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
      [wall('S', 'A', 'B'), wall('E', 'B', 'C'), wall('N', 'C', 'D'), wall('W', 'D', 'A')]
    )
  }
]

const grammars = [
  { id: 'BODY', title: 'BODY CONTROL', note: 'single joined body' },
  { id: 'QUIET', title: 'LAYERED QUIET', note: 'leaf / void / leaf' },
  { id: 'STRUCTURAL', title: 'STRUCTURAL EMPHASIS', note: 'inner loadbearing leaf slightly weighted' }
] as const

type GrammarId = typeof grammars[number]['id']

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const text = (
  id: string,
  x: number,
  y: number,
  value: string,
  role: DrawingText['role'] = 'note',
  anchor: DrawingText['anchor'] = 'start'
): DrawingText => ({ kind: 'text', id, x, y, value, role, anchor, metadata: { specimen: true } })

const regionBounds = (rings: readonly (readonly { x: number; y: number }[])[]) => {
  const points = rings.flat()
  return {
    x0: Math.min(...points.map((point) => point.x)),
    y0: Math.min(...points.map((point) => point.y)),
    x1: Math.max(...points.map((point) => point.x)),
    y1: Math.max(...points.map((point) => point.y))
  }
}

const resolvedLayer = (candidate: AdeWallAssemblyLayer): number => {
  if (candidate.role === 'cavity-zone') return 160
  if (candidate.thickness.kind !== 'approximate') throw new Error(`ADE-03B unexpected authority for ${candidate.id}.`)
  return candidate.thickness.value
}

const bandByRole = (
  bands: readonly AdeWallAssemblyBandRegion[],
  role: AdeWallAssemblyLayer['role']
): AdeWallAssemblyBandRegion => {
  const matches = bands.filter((band) => band.layerRole === role)
  if (matches.length !== 1) throw new Error(`ADE-03B expected exactly one ${role} band, got ${matches.length}.`)
  return matches[0]
}

const bandPath = (
  band: AdeWallAssemblyBandRegion,
  project: ReturnType<typeof createPlanPaperProjection>,
  id: string,
  fill: DrawingPath['fill'],
  grammar: GrammarId
): DrawingPath => wallAssemblyBandToDrawingPath(band, project, {
  id,
  fill,
  metadata: {
    grammar,
    representation: 'source-owned-wall-band'
  }
})

const drawFixture = (
  item: typeof fixtures[number],
  grammar: GrammarId,
  scale: number,
  cellX: number,
  cellY: number,
  cellHeight: number
): DrawingPrimitiveV2[] => {
  const overall = compileWallTopology(item.plan, { resolveAssemblyThicknessMm: () => mm(REPRESENTED_TOTAL) })
  if (overall.regions.length !== 1) throw new Error(`ADE-03B ${item.id} expected one overall wall region.`)
  const overallRegion = overall.regions[0]
  const layered = compileWallAssemblyTopology(item.plan, 'ADE03B-RH10-LIKE-WALL', {
    resolveAssemblyThicknessMm: () => mm(REPRESENTED_TOTAL),
    resolveLayerThicknessMm: (candidate) => mm(resolvedLayer(candidate))
  })

  const bounds = regionBounds(overallRegion.rings)
  const modelWidth = bounds.x1 - bounds.x0
  const modelHeight = bounds.y1 - bounds.y0
  const paperWidth = modelWidth / scale
  const paperHeight = modelHeight / scale
  const availableWidth = COLUMN_WIDTH - 24
  const availableHeight = cellHeight - 24
  if (paperWidth > availableWidth || paperHeight > availableHeight) {
    throw new Error(`ADE-03B ${item.id} at 1:${scale} cannot fit without forbidden fit scaling.`)
  }

  const originX = cellX + (COLUMN_WIDTH - paperWidth) / 2
  const originY = cellY + 14 + (availableHeight - paperHeight) / 2
  const project = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: bounds.x0, y: bounds.y0, width: modelWidth, height: modelHeight },
    paperOrigin: { x: originX, y: originY }
  })

  const primitives: DrawingPrimitiveV2[] = [
    text(`fixture-${grammar}-${item.id}`, cellX + 6, cellY + 7, item.label, 'note')
  ]

  if (grammar === 'BODY') {
    primitives.push(wallTopologyRegionToDrawingPath(overallRegion, project, {
      id: `body-${item.id}`,
      stroke: 'profile',
      fill: 'faint',
      metadata: { grammar, representation: 'single-wall-body' }
    }))
    return primitives
  }

  const weathering = bandByRole(layered.bands, 'weathering-leaf')
  const cavity = bandByRole(layered.bands, 'cavity-zone')
  const structural = bandByRole(layered.bands, 'structural-leaf')
  const finish = bandByRole(layered.bands, 'finish-zone')
  const innerFill = grammar === 'STRUCTURAL' ? 'context' : 'faint'

  // Bands are fill-only. The cavity is explicitly paper-white; no hatch, ties or
  // faux insulation marks are introduced. Finish shares the structural tint so
  // its 15 mm coordination zone does not become a false technical double-line.
  primitives.push(
    bandPath(weathering, project, `weathering-${item.id}`, 'faint', grammar),
    bandPath(cavity, project, `cavity-${item.id}`, 'paper', grammar),
    bandPath(structural, project, `structural-${item.id}`, innerFill, grammar),
    bandPath(finish, project, `finish-${item.id}`, innerFill, grammar),
    wallTopologyRegionToDrawingPath(overallRegion, project, {
      id: `outline-${item.id}`,
      stroke: 'profile',
      fill: 'none',
      metadata: { grammar, representation: 'overall-wall-profile' }
    })
  )

  return primitives
}

const sceneForScale = (scale: 100 | 50): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    text('title', 20, HEADER_Y, `ADE-03B — cavity-wall representation grammar — true 1:${scale}`, 'label'),
    text('subtitle', 20, HEADER_Y + 7, 'Representative RH-10 coordination family: 102.5 weathering / 160 cavity / 140 structural / 15 finish = 417.5 mm. No technical-detail claim.', 'note')
  ]

  grammars.forEach((grammar, column) => {
    const cellX = MARGIN_X + column * (COLUMN_WIDTH + COLUMN_GAP)
    primitives.push(
      text(`grammar-${grammar.id}`, cellX + 6, 39, grammar.title, 'marker'),
      text(`grammar-note-${grammar.id}`, cellX + 6, 46, grammar.note, 'note')
    )
    fixtures.forEach((item, row) => {
      primitives.push(...drawFixture(item, grammar.id, scale, cellX, FIXTURE_TOPS[row], FIXTURE_HEIGHTS[row]))
    })
  })

  return {
    widthMm: PAGE_WIDTH,
    heightMm: PAGE_HEIGHT,
    viewId: `ADE03B-CAVITY-GRAMMAR-${scale}`,
    title: `ADE-03B cavity-wall grammar comparison at 1:${scale}`,
    description: 'Exact-size comparison of a single body, quiet layered cavity-wall representation and restrained structural-leaf emphasis using identical source-owned wall geometry.',
    scaleDenominator: scale,
    sourceId: 'ADE-03B-SYNTHETIC',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const outputs: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2SvgWithTokens(sceneForScale(scale), ADE03B_PROOF_TOKENS)
  const name = `ade03b-cavity-grammar-1-${scale}.svg`
  outputs[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}

const manifest = {
  schemaVersion: 1,
  packet: 'ADE-03B',
  issue: '#828',
  status: 'SCREEN_REVIEW_PENDING',
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  representedAssemblyMm: {
    total: REPRESENTED_TOTAL,
    weatheringLeaf: 102.5,
    cavity: 160,
    structuralLeaf: 140,
    finishZone: 15
  },
  technicalClaim: false,
  fitScaling: false,
  grammars: grammars.map((grammar) => grammar.id),
  specimens: fixtures.map((item) => item.id),
  visualRules: {
    cavity: 'paper void; no hatch, insulation symbol or tie notation',
    finish: 'semantically distinct but visually merged with structural leaf at whole-building scale',
    bodyOutline: 'single joined profile from ADE-02 topology',
    structuralEmphasis: 'fill tint only; no extra construction linework'
  },
  tokens: ADE03B_PROOF_TOKENS,
  files: Object.fromEntries(Object.entries(outputs).map(([name, svg]) => [name, {
    sha256: sha256(svg),
    bytes: Buffer.byteLength(svg)
  }]))
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared ADE-03B exact-size cavity-wall grammar comparison at 1:100 and 1:50.')
