import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'
import { compileWallAssemblyTopology, type AdeWallAssemblyBandRegion } from '../../../compiler/architectural-drawing/assembly-topology.js'
import { wallAssemblyBandToDrawingPath } from '../../../compiler/architectural-drawing/assembly-drawing.js'
import type {
  AdeArchitecturalPlan,
  AdeOpening,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallRun
} from '../../../compiler/architectural-drawing/model.js'
import {
  applyOpeningCutoutsToAssemblyBands,
  applyOpeningCutoutsToWallRegions,
  compileOpeningCutouts
} from '../../../compiler/architectural-drawing/opening-topology.js'
import { compileWallTopology } from '../../../compiler/architectural-drawing/topology.js'
import { wallTopologyRegionToDrawingPath } from '../../../compiler/architectural-drawing/wall-drawing.js'
import { ADE04A_PROOF_TOKENS } from './tokens.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 594
const PAGE_HEIGHT = 420
const CELL_WIDTH = 277
const CELL_HEIGHT = 112
const MARGIN_X = 20
const MARGIN_Y = 54
const GAP_X = 0
const GAP_Y = 7

const exact: AdeProvenance = { sourceIds: ['ADE-04A-CAPABILITY'], authority: 'controlled', precision: 'exact' }
const ranged: AdeProvenance = { sourceIds: ['ADE-04A-RANGE'], authority: 'provisional', precision: 'range' }

const node = (id: string, x: number, y: number): AdePlanNode => ({ kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: exact })
const layer = (id: string, role: AdeWallAssemblyLayer['role'], value: number): AdeWallAssemblyLayer => ({
  id, role, thickness: { kind: 'exact', value: mm(value) }, provenance: exact
})
const monolithic: AdeWallAssembly = { kind: 'wall-assembly', id: 'WA-MONO', thickness: { kind: 'exact', value: mm(400) }, provenance: exact }
const layered: AdeWallAssembly = {
  kind: 'wall-assembly',
  id: 'WA-LAYERED',
  thickness: { kind: 'exact', value: mm(400) },
  layers: [
    layer('L-WEATHER', 'weathering-leaf', 100),
    layer('L-CAVITY', 'cavity-zone', 150),
    layer('L-STRUCT', 'structural-leaf', 140),
    layer('L-FINISH', 'finish-zone', 10)
  ],
  provenance: exact
}

const wall = (id: string, fromNodeId: string, toNodeId: string, assemblyId: string): AdeWallRun => ({
  kind: 'wall', id, fromNodeId, toNodeId, reference: 'right-face', assemblyId,
  assemblyStartFace: assemblyId === 'WA-LAYERED' ? 'right-face' : undefined,
  provenance: exact
})

const opening = (
  id: string,
  hostWallId: string,
  centre: number,
  width: number | { min: number; max: number }
): AdeOpening => ({
  kind: 'opening', id, hostWallId, role: 'window',
  centreOffset: { kind: 'exact', value: mm(centre) },
  width: typeof width === 'number'
    ? { kind: 'exact', value: mm(width) }
    : { kind: 'range', min: mm(width.min), max: mm(width.max) },
  provenance: typeof width === 'number' ? exact : ranged
})

const makePlan = (
  id: string,
  assembly: AdeWallAssembly,
  nodes: AdePlanNode[],
  walls: AdeWallRun[],
  openings: AdeOpening[]
): AdeArchitecturalPlan => ({
  id, sourceId: 'ADE-04A-CAPABILITY', nodes, wallAssemblies: [assembly], walls, openings,
  partitionDatums: [], spaces: [], adjacencies: [], dimensions: [], labels: []
})

const fixtureFor = (kind: 'single' | 'corner' | 'multiple', assembly: AdeWallAssembly): AdeArchitecturalPlan => {
  const aid = assembly.id
  if (kind === 'single') {
    return makePlan(
      `ADE04A-${aid}-SINGLE`, assembly,
      [node('A', 0, 0), node('B', 7000, 0)],
      [wall('W1', 'A', 'B', aid)],
      [opening('O1', 'W1', 3500, 1400)]
    )
  }
  if (kind === 'corner') {
    return makePlan(
      `ADE04A-${aid}-CORNER`, assembly,
      [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 3500)],
      [wall('W1', 'A', 'B', aid), wall('W2', 'B', 'C', aid)],
      [opening('O1', 'W1', 4700, 1200)]
    )
  }
  return makePlan(
    `ADE04A-${aid}-MULTIPLE`, assembly,
    [node('A', 0, 0), node('B', 8000, 0)],
    [wall('W1', 'A', 'B', aid)],
    [opening('O1', 'W1', 2200, 1000), opening('O2', 'W1', 5900, { min: 1000, max: 1400 })]
  )
}

const fixtureRows = [
  { id: 'SINGLE', label: 'exact aperture', kind: 'single' as const },
  { id: 'CORNER', label: 'opening near corner', kind: 'corner' as const },
  { id: 'MULTIPLE', label: 'multiple + ranged representative', kind: 'multiple' as const }
]

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')
const text = (id: string, x: number, y: number, value: string, role: DrawingText['role'] = 'note'): DrawingText => ({
  kind: 'text', id, x, y, value, role, anchor: 'start', metadata: { specimen: true }
})

const boundsOfRings = (rings: readonly (readonly { x: number; y: number }[])[]) => {
  const points = rings.flat()
  return {
    x0: Math.min(...points.map((point) => point.x)),
    y0: Math.min(...points.map((point) => point.y)),
    x1: Math.max(...points.map((point) => point.x)),
    y1: Math.max(...points.map((point) => point.y))
  }
}

const openingOptions = {
  resolveAssemblyThicknessMm: (candidate: AdeWallAssembly) => {
    if (candidate.thickness.kind !== 'exact') throw new Error('ADE-04A specimen expects exact assembly thickness.')
    return candidate.thickness.value
  },
  resolveOpeningCentreOffsetMm: (candidate: AdeOpening) => {
    if (candidate.centreOffset.kind !== 'exact') throw new Error('ADE-04A specimen expects exact opening centre.')
    return candidate.centreOffset.value
  },
  // Ranged proof intentionally uses the guaranteed minimum physical aperture;
  // ADE-04B owns the visual notation for the remaining possible width.
  resolveOpeningWidthMm: (candidate: AdeOpening) => {
    if (candidate.width.kind === 'exact') return candidate.width.value
    if (candidate.width.kind === 'range') return candidate.width.min
    throw new Error(`ADE-04A specimen cannot resolve ${candidate.width.kind} width.`)
  }
}

const drawMonolithic = (
  plan: AdeArchitecturalPlan,
  scale: number,
  cellX: number,
  cellY: number
): DrawingPrimitiveV2[] => {
  const topology = compileWallTopology(plan, { resolveAssemblyThicknessMm: openingOptions.resolveAssemblyThicknessMm })
  const cuts = compileOpeningCutouts(plan, openingOptions)
  const opened = applyOpeningCutoutsToWallRegions(topology.regions, cuts)
  if (opened.length !== 1) throw new Error(`${plan.id} expected one connected semantic region before aperture subtraction.`)
  const region = opened[0]
  const bounds = boundsOfRings(region.rings)
  const width = bounds.x1 - bounds.x0
  const height = bounds.y1 - bounds.y0
  const paperWidth = width / scale
  const paperHeight = height / scale
  if (paperWidth > CELL_WIDTH - 28 || paperHeight > CELL_HEIGHT - 28) throw new Error(`${plan.id} cannot fit proof cell without scaling.`)
  const project = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: bounds.x0, y: bounds.y0, width, height },
    paperOrigin: { x: cellX + (CELL_WIDTH - paperWidth) / 2, y: cellY + 16 + (CELL_HEIGHT - 28 - paperHeight) / 2 }
  })
  return [wallTopologyRegionToDrawingPath(region, project, {
    id: `${plan.id}-OPENED`, stroke: 'profile', fill: 'faint',
    metadata: { representation: 'topological-opening-subtraction', openings: region.openingIds.join(',') }
  })]
}

const band = (bands: readonly (AdeWallAssemblyBandRegion & { openingIds: readonly string[] })[], role: AdeWallAssemblyLayer['role']) => {
  const match = bands.find((candidate) => candidate.layerRole === role)
  if (!match) throw new Error(`ADE-04A layered proof lost ${role}.`)
  return match
}

const drawLayered = (
  plan: AdeArchitecturalPlan,
  scale: number,
  cellX: number,
  cellY: number
): DrawingPrimitiveV2[] => {
  const topology = compileWallTopology(plan, { resolveAssemblyThicknessMm: openingOptions.resolveAssemblyThicknessMm })
  const cuts = compileOpeningCutouts(plan, openingOptions)
  const overall = applyOpeningCutoutsToWallRegions(topology.regions, cuts)[0]
  const assembly = compileWallAssemblyTopology(plan, 'WA-LAYERED', {
    resolveAssemblyThicknessMm: () => mm(400),
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.thickness.kind !== 'exact') throw new Error('ADE-04A layered proof expects exact layer thickness.')
      return candidate.thickness.value
    }
  })
  const bands = applyOpeningCutoutsToAssemblyBands(assembly.bands, cuts)
  const bounds = boundsOfRings(overall.rings)
  const width = bounds.x1 - bounds.x0
  const height = bounds.y1 - bounds.y0
  const paperWidth = width / scale
  const paperHeight = height / scale
  if (paperWidth > CELL_WIDTH - 28 || paperHeight > CELL_HEIGHT - 28) throw new Error(`${plan.id} cannot fit proof cell without scaling.`)
  const project = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: bounds.x0, y: bounds.y0, width, height },
    paperOrigin: { x: cellX + (CELL_WIDTH - paperWidth) / 2, y: cellY + 16 + (CELL_HEIGHT - 28 - paperHeight) / 2 }
  })

  return [
    wallAssemblyBandToDrawingPath(band(bands, 'weathering-leaf'), project, { id: `${plan.id}-WEATHER`, fill: 'faint' }),
    wallAssemblyBandToDrawingPath(band(bands, 'cavity-zone'), project, { id: `${plan.id}-CAVITY`, fill: 'paper' }),
    wallAssemblyBandToDrawingPath(band(bands, 'structural-leaf'), project, { id: `${plan.id}-STRUCT`, fill: 'context' }),
    wallAssemblyBandToDrawingPath(band(bands, 'finish-zone'), project, { id: `${plan.id}-FINISH`, fill: 'context' }),
    wallTopologyRegionToDrawingPath(overall, project, {
      id: `${plan.id}-OUTLINE`, stroke: 'profile', fill: 'none',
      metadata: { representation: 'opened-layered-wall-profile', openings: overall.openingIds.join(',') }
    })
  ]
}

const sceneForScale = (scale: 100 | 50): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    text('title', 20, 13, `ADE-04A — topological opening subtraction — true 1:${scale}`, 'label'),
    text('subtitle', 20, 20, 'Left: monolithic control. Right: layered wall. Apertures remove material geometry; no white overpaint primitive exists.', 'note'),
    text('head-mono', MARGIN_X + 6, 40, 'MONOLITHIC JOINED WALL', 'marker'),
    text('head-layered', MARGIN_X + CELL_WIDTH + GAP_X + 6, 40, 'LAYERED CAVITY WALL', 'marker')
  ]

  fixtureRows.forEach((row, rowIndex) => {
    const cellY = MARGIN_Y + rowIndex * (CELL_HEIGHT + GAP_Y)
    const monoX = MARGIN_X
    const layeredX = MARGIN_X + CELL_WIDTH + GAP_X
    primitives.push(
      text(`row-mono-${row.id}`, monoX + 6, cellY + 7, row.label, 'note'),
      text(`row-layer-${row.id}`, layeredX + 6, cellY + 7, row.label, 'note'),
      ...drawMonolithic(fixtureFor(row.kind, monolithic), scale, monoX, cellY),
      ...drawLayered(fixtureFor(row.kind, layered), scale, layeredX, cellY)
    )
  })

  return {
    widthMm: PAGE_WIDTH, heightMm: PAGE_HEIGHT,
    viewId: `ADE04A-OPENING-SUBTRACTION-${scale}`,
    title: `ADE-04A opening subtraction at 1:${scale}`,
    description: 'Exact-size micro-fixtures proving that admitted openings subtract from joined wall topology and every layered wall band without white overpaint or invented frame/reveal geometry.',
    scaleDenominator: scale,
    sourceId: 'ADE-04A-CAPABILITY',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const outputs: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2SvgWithTokens(sceneForScale(scale), ADE04A_PROOF_TOKENS)
  const name = `ade04a-opening-subtraction-1-${scale}.svg`
  outputs[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}

const manifest = {
  schemaVersion: 1,
  packet: 'ADE-04A',
  issue: '#831',
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  fitScaling: false,
  materialSubtraction: true,
  whiteOverpaintPrimitive: false,
  frameRevealClaim: false,
  rangedFixtureRepresentation: 'minimum guaranteed physical aperture only; uncertainty remainder deferred to ADE-04B',
  files: Object.fromEntries(Object.entries(outputs).map(([name, svg]) => [name, { sha256: sha256(svg), bytes: Buffer.byteLength(svg) }]))
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log('Prepared ADE-04A exact-size opening-subtraction capability sheets.')
