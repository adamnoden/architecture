import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { compileWallAssemblyTopology, type AdeWallAssemblyBandRegion } from '../../../compiler/architectural-drawing/assembly-topology.js'
import { wallAssemblyBandToDrawingPath } from '../../../compiler/architectural-drawing/assembly-drawing.js'
import { assertResolvedDistanceWithinAuthority } from '../../../compiler/architectural-drawing/authority.js'
import { dimensionToDrawingPrimitives } from '../../../compiler/architectural-drawing/dimension-drawing.js'
import type {
  AdeArchitecturalPlan,
  AdeOpening,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallReference,
  AdeWallRun
} from '../../../compiler/architectural-drawing/model.js'
import {
  applyOpeningCutoutsToWallRegions,
  compileOpeningCutouts
} from '../../../compiler/architectural-drawing/opening-topology.js'
import {
  compileOpeningUncertaintyInstruction,
  openingUncertaintyToDrawingPrimitives
} from '../../../compiler/architectural-drawing/opening-uncertainty.js'
import {
  adjacencyObligationToDrawingPrimitives,
  partitionDatumToDrawingPath
} from '../../../compiler/architectural-drawing/partition-adjacency.js'
import { compileWallTopology, type AdeWallTopologyRegion } from '../../../compiler/architectural-drawing/topology.js'
import { wallTopologyRegionToDrawingPath } from '../../../compiler/architectural-drawing/wall-drawing.js'
import type { DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection, type PlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'
import { ADE03B_PROOF_TOKENS } from '../ade03b/tokens.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 841
const PAGE_HEIGHT = 594
const MARGIN_X = 20
const TOP = 42
const COLS = 6
const ROWS = 3
const GAP_X = 5
const GAP_Y = 8
const CELL_WIDTH = (PAGE_WIDTH - MARGIN_X * 2 - GAP_X * (COLS - 1)) / COLS
const CELL_HEIGHT = (PAGE_HEIGHT - TOP - 20 - GAP_Y * (ROWS - 1)) / ROWS
const DRAWING_TOP = 25
const DRAWING_BOTTOM = 8
const DRAWING_SIDE = 6

const exact: AdeProvenance = { sourceIds: ['ADE-06-CAPABILITY'], authority: 'controlled', precision: 'exact' }
const approx: AdeProvenance = { sourceIds: ['ADE-06-APPROX'], authority: 'provisional', precision: 'approximate' }
const ranged: AdeProvenance = { sourceIds: ['ADE-06-RANGE'], authority: 'provisional', precision: 'range' }
const qualitative: AdeProvenance = { sourceIds: ['ADE-06-QUALITATIVE'], authority: 'provisional', precision: 'qualitative' }
const unknown: AdeProvenance = { sourceIds: ['ADE-06-UNKNOWN'], authority: 'provisional', precision: 'unknown' }

const capabilityMeta = (id: string, provenance: AdeProvenance, extra: Record<string, string | number | boolean | undefined> = {}) => ({
  capability: id,
  authority: provenance.authority,
  precision: provenance.precision,
  sources: provenance.sourceIds.join(','),
  ...extra
})

const text = (
  id: string,
  x: number,
  y: number,
  value: string,
  role: DrawingText['role'] = 'note',
  anchor: DrawingText['anchor'] = 'start'
): DrawingText => ({ kind: 'text', id, x, y, value, role, anchor, metadata: { specimen: true } })

const node = (id: string, x: number, y: number, provenance: AdeProvenance = exact): AdePlanNode => ({
  kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance
})

const assembly = (
  id: string,
  thickness: AdeWallAssembly['thickness'],
  provenance: AdeProvenance = exact,
  layers?: readonly AdeWallAssemblyLayer[]
): AdeWallAssembly => ({ kind: 'wall-assembly', id, thickness, layers, provenance })

const wall = (
  id: string,
  fromNodeId: string,
  toNodeId: string,
  assemblyId: string,
  reference: AdeWallReference = 'centreline',
  provenance: AdeProvenance = exact,
  assemblyStartFace?: AdeWallRun['assemblyStartFace']
): AdeWallRun => ({ kind: 'wall', id, fromNodeId, toNodeId, assemblyId, reference, provenance, assemblyStartFace })

const plan = (options: Partial<AdeArchitecturalPlan> & Pick<AdeArchitecturalPlan, 'id' | 'nodes' | 'wallAssemblies' | 'walls'>): AdeArchitecturalPlan => ({
  id: options.id,
  sourceId: options.sourceId ?? 'ADE-06-CAPABILITY',
  nodes: options.nodes,
  wallAssemblies: options.wallAssemblies,
  walls: options.walls,
  openings: options.openings ?? [],
  partitionDatums: options.partitionDatums ?? [],
  spaces: options.spaces ?? [],
  adjacencies: options.adjacencies ?? [],
  dimensions: options.dimensions ?? [],
  labels: options.labels ?? []
})

const cell = (index: number) => {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  return {
    x: MARGIN_X + col * (CELL_WIDTH + GAP_X),
    y: TOP + row * (CELL_HEIGHT + GAP_Y),
    width: CELL_WIDTH,
    height: CELL_HEIGHT
  }
}

const regionBounds = (region: AdeWallTopologyRegion) => {
  const points = region.rings.flat()
  return {
    x0: Math.min(...points.map((point) => point.x)),
    y0: Math.min(...points.map((point) => point.y)),
    x1: Math.max(...points.map((point) => point.x)),
    y1: Math.max(...points.map((point) => point.y))
  }
}

const projectionForRegion = (
  region: AdeWallTopologyRegion,
  scale: 100 | 50,
  target: ReturnType<typeof cell>
): PlanPaperProjection => {
  const bounds = regionBounds(region)
  const modelWidth = bounds.x1 - bounds.x0
  const modelHeight = bounds.y1 - bounds.y0
  const paperWidth = modelWidth / scale
  const paperHeight = modelHeight / scale
  const availableWidth = target.width - DRAWING_SIDE * 2
  const availableHeight = target.height - DRAWING_TOP - DRAWING_BOTTOM
  if (paperWidth > availableWidth || paperHeight > availableHeight) {
    throw new Error(`ADE-06 fixture does not fit true 1:${scale} cell without fit scaling.`)
  }
  return createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: bounds.x0, y: bounds.y0, width: modelWidth, height: modelHeight },
    paperOrigin: {
      x: target.x + DRAWING_SIDE + (availableWidth - paperWidth) / 2,
      y: target.y + DRAWING_TOP + (availableHeight - paperHeight) / 2
    }
  })
}

const header = (target: ReturnType<typeof cell>, id: string, label: string, authority: string): DrawingText[] => [
  text(`${id}-head`, target.x + 4, target.y + 7, `${id} — ${label}`, 'marker'),
  text(`${id}-state`, target.x + 4, target.y + 14, authority, 'note')
]

const solidAssembly = assembly('WA-400', { kind: 'exact', value: mm(400) })

const topologyFixture = (
  id: string,
  nodes: AdePlanNode[],
  walls: AdeWallRun[]
): AdeArchitecturalPlan => plan({ id, nodes, wallAssemblies: [solidAssembly], walls })

const topologyCapabilities = [
  {
    id: 'C01', label: 'straight wall run', authority: 'controlled / exact',
    plan: topologyFixture('C01', [node('A', 0, 0), node('B', 4000, 0)], [wall('W1', 'A', 'B', 'WA-400')])
  },
  {
    id: 'C02', label: 'L corner / joined body', authority: 'controlled / exact',
    plan: topologyFixture('C02', [node('A', 0, 0), node('B', 3500, 0), node('C', 3500, 2500)], [wall('W1', 'A', 'B', 'WA-400'), wall('W2', 'B', 'C', 'WA-400')])
  },
  {
    id: 'C03', label: 'T junction', authority: 'controlled / exact',
    plan: topologyFixture('C03', [node('A', 0, 0), node('B', 2500, 0), node('C', 5000, 0), node('D', 2500, 2500)], [wall('W1', 'A', 'B', 'WA-400'), wall('W2', 'B', 'C', 'WA-400'), wall('W3', 'B', 'D', 'WA-400')])
  },
  {
    id: 'C04', label: 'cross junction', authority: 'controlled / exact',
    plan: topologyFixture('C04', [node('C', 0, 0), node('W', -2200, 0), node('E', 2200, 0), node('N', 0, 2200), node('S', 0, -2200)], [wall('WW', 'W', 'C', 'WA-400'), wall('WE', 'C', 'E', 'WA-400'), wall('WN', 'C', 'N', 'WA-400'), wall('WS', 'S', 'C', 'WA-400')])
  },
  {
    id: 'C05', label: 'closed outer ring', authority: 'controlled / exact',
    plan: topologyFixture('C05', [node('A', 0, 0), node('B', 4000, 0), node('C', 4000, 3000), node('D', 0, 3000)], [wall('S', 'A', 'B', 'WA-400'), wall('E', 'B', 'C', 'WA-400'), wall('N', 'C', 'D', 'WA-400'), wall('W', 'D', 'A', 'WA-400')])
  },
  {
    id: 'C06', label: 'courtyard / inner ring', authority: 'controlled / exact',
    plan: topologyFixture('C06', [node('A', 0, 0), node('B', 3000, 0), node('C', 3000, 2200), node('D', 0, 2200)], [wall('S', 'A', 'B', 'WA-400', 'right-face'), wall('E', 'B', 'C', 'WA-400', 'right-face'), wall('N', 'C', 'D', 'WA-400', 'right-face'), wall('W', 'D', 'A', 'WA-400', 'right-face')])
  }
] as const

const drawTopology = (item: typeof topologyCapabilities[number], scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const topology = compileWallTopology(item.plan, { resolveAssemblyThicknessMm: () => mm(400) })
  if (topology.regions.length !== 1) throw new Error(`${item.id} expected one connected region.`)
  const region = topology.regions[0]
  const projection = projectionForRegion(region, scale, target)
  return [
    ...header(target, item.id, item.label, item.authority),
    wallTopologyRegionToDrawingPath(region, projection, {
      id: `${item.id}-wall`, stroke: 'profile', fill: 'faint', metadata: capabilityMeta(item.id, exact)
    })
  ]
}

const layer = (id: string, role: AdeWallAssemblyLayer['role'], thickness: AdeWallAssemblyLayer['thickness'], provenance: AdeProvenance): AdeWallAssemblyLayer => ({ id, role, thickness, provenance })
const layeredAssembly = assembly('WA-LAYERED', { kind: 'range', min: mm(410), max: mm(435) }, ranged, [
  layer('L-WEATHER', 'weathering-leaf', { kind: 'approximate', value: mm(102.5) }, approx),
  layer('L-CAVITY', 'cavity-zone', { kind: 'range', min: mm(150), max: mm(175) }, ranged),
  layer('L-STRUCT', 'structural-leaf', { kind: 'approximate', value: mm(140) }, approx),
  layer('L-FINISH', 'finish-zone', { kind: 'approximate', value: mm(15) }, approx)
])

const layeredPlan = (id: string, corner: boolean): AdeArchitecturalPlan => plan({
  id,
  nodes: corner ? [node('A', 0, 0), node('B', 3500, 0), node('C', 3500, 2500)] : [node('A', 0, 0), node('B', 4000, 0)],
  wallAssemblies: [layeredAssembly],
  walls: corner
    ? [wall('W1', 'A', 'B', 'WA-LAYERED', 'right-face', exact, 'right-face'), wall('W2', 'B', 'C', 'WA-LAYERED', 'right-face', exact, 'right-face')]
    : [wall('W1', 'A', 'B', 'WA-LAYERED', 'right-face', exact, 'right-face')]
})

const bandByRole = (bands: readonly AdeWallAssemblyBandRegion[], role: AdeWallAssemblyLayer['role']) => {
  const found = bands.find((candidate) => candidate.layerRole === role)
  if (!found) throw new Error(`ADE-06 layered fixture lost ${role}.`)
  return found
}

const drawLayered = (id: 'C07' | 'C08', labelValue: string, sourcePlan: AdeArchitecturalPlan, scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const total = mm(417.5)
  assertResolvedDistanceWithinAuthority('WA-LAYERED', 'assembly thickness', layeredAssembly.thickness, total)
  const topology = compileWallTopology(sourcePlan, { resolveAssemblyThicknessMm: () => total })
  if (topology.regions.length !== 1) throw new Error(`${id} expected one connected region.`)
  const region = topology.regions[0]
  const projection = projectionForRegion(region, scale, target)
  const bands = compileWallAssemblyTopology(sourcePlan, 'WA-LAYERED', {
    resolveAssemblyThicknessMm: () => total,
    resolveLayerThicknessMm: (candidate) => {
      if (candidate.role === 'cavity-zone') return mm(160)
      if (candidate.thickness.kind !== 'approximate') throw new Error(`${id} unexpected layer authority.`)
      return candidate.thickness.value
    }
  }).bands
  return [
    ...header(target, id, labelValue, 'controlled family / provisional dimensions'),
    wallAssemblyBandToDrawingPath(bandByRole(bands, 'weathering-leaf'), projection, { id: `${id}-weather`, fill: 'faint', metadata: capabilityMeta(id, ranged) }),
    wallAssemblyBandToDrawingPath(bandByRole(bands, 'cavity-zone'), projection, { id: `${id}-cavity`, fill: 'paper', metadata: capabilityMeta(id, ranged) }),
    wallAssemblyBandToDrawingPath(bandByRole(bands, 'structural-leaf'), projection, { id: `${id}-struct`, fill: 'context', metadata: capabilityMeta(id, ranged) }),
    wallAssemblyBandToDrawingPath(bandByRole(bands, 'finish-zone'), projection, { id: `${id}-finish`, fill: 'context', metadata: capabilityMeta(id, ranged) }),
    wallTopologyRegionToDrawingPath(region, projection, { id: `${id}-outline`, stroke: 'profile', fill: 'none', metadata: capabilityMeta(id, ranged) })
  ]
}

const openingFor = (id: string, state: 'exact' | 'approx' | 'range' | 'centre' | 'host' | 'near-corner'): AdeOpening => {
  if (state === 'exact' || state === 'near-corner') return {
    kind: 'opening', id, hostWallId: 'W1', role: 'window',
    centreOffset: { kind: 'exact', value: mm(state === 'near-corner' ? 950 : 2000) },
    width: { kind: 'exact', value: mm(1000) }, provenance: exact
  }
  if (state === 'approx') return {
    kind: 'opening', id, hostWallId: 'W1', role: 'window', centreOffset: { kind: 'exact', value: mm(2000) },
    width: { kind: 'approximate', value: mm(1000) }, provenance: approx
  }
  if (state === 'range') return {
    kind: 'opening', id, hostWallId: 'W1', role: 'window', centreOffset: { kind: 'exact', value: mm(2000) },
    width: { kind: 'range', min: mm(800), max: mm(1200) }, provenance: ranged
  }
  if (state === 'centre') return {
    kind: 'opening', id, hostWallId: 'W1', role: 'window', centreOffset: { kind: 'exact', value: mm(2000) },
    width: { kind: 'unknown' }, provenance: unknown
  }
  return {
    kind: 'opening', id, hostWallId: 'W1', role: 'window', centreOffset: { kind: 'unknown' },
    width: { kind: 'unknown' }, provenance: unknown
  }
}

const openingCapabilities = [
  ['C09', 'exact opening subtraction', 'exact', 'controlled / exact'],
  ['C10', 'approximate opening', 'approx', 'provisional / approximate'],
  ['C11', 'range-width opening', 'range', 'provisional / range'],
  ['C12', 'known centre / width unknown', 'centre', 'provisional / unknown'],
  ['C13', 'host-only opening obligation', 'host', 'provisional / unknown'],
  ['C14', 'opening near corner', 'near-corner', 'controlled / exact']
] as const

const drawOpening = (item: typeof openingCapabilities[number], scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const [id, labelValue, state, authorityLabel] = item
  const opening = openingFor(`O-${id}`, state)
  const sourcePlan = plan({
    id,
    nodes: [node('A', 0, 0), node('B', 4000, 0)],
    wallAssemblies: [solidAssembly],
    walls: [wall('W1', 'A', 'B', 'WA-400', 'right-face')],
    openings: [opening]
  })
  const resolver = {
    resolveAssemblyThicknessMm: () => mm(400),
    resolveOpeningCentreOffsetMm: (candidate: AdeOpening) => {
      if (candidate.centreOffset.kind === 'exact' || candidate.centreOffset.kind === 'approximate') return candidate.centreOffset.value
      throw new Error(`${id} cannot resolve ${candidate.centreOffset.kind} centre.`)
    },
    resolveOpeningWidthMm: (candidate: AdeOpening) => {
      if (candidate.width.kind === 'exact' || candidate.width.kind === 'approximate') return candidate.width.value
      if (candidate.width.kind === 'range') return candidate.width.min
      throw new Error(`${id} cannot resolve ${candidate.width.kind} width.`)
    }
  }
  const topology = compileWallTopology(sourcePlan, { resolveAssemblyThicknessMm: resolver.resolveAssemblyThicknessMm })
  const physical = state === 'exact' || state === 'approx' || state === 'range' || state === 'near-corner'
  const cuts = physical ? compileOpeningCutouts(sourcePlan, resolver) : []
  const region = cuts.length ? applyOpeningCutoutsToWallRegions(topology.regions, cuts)[0] : topology.regions[0]
  const bounds = { x: 0, y: -800, width: 4000, height: 1600 }
  const paperWidth = bounds.width / scale
  const availableWidth = target.width - DRAWING_SIDE * 2
  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: bounds,
    paperOrigin: { x: target.x + DRAWING_SIDE + (availableWidth - paperWidth) / 2, y: target.y + 52 }
  })
  const provenance = opening.provenance
  const primitives: DrawingPrimitiveV2[] = [
    ...header(target, id, labelValue, authorityLabel),
    wallTopologyRegionToDrawingPath(region, projection, { id: `${id}-wall`, stroke: 'profile', fill: 'faint', metadata: capabilityMeta(id, provenance) })
  ]
  const instruction = compileOpeningUncertaintyInstruction(sourcePlan, opening.id)
  primitives.push(...openingUncertaintyToDrawingPrimitives(sourcePlan, instruction, projection, {
    annotationSide: 'left', resolveAssemblyThicknessMm: () => mm(400), showLabels: false,
    gapPaperMm: 3.5, tickPaperMm: 1.5, markerPaperMm: 1.5
  }).map((primitive) => ({ ...primitive, id: `${id}-${primitive.id}`, metadata: { ...primitive.metadata, ...capabilityMeta(id, provenance) } })))
  return primitives
}

const drawDatum = (scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const sourcePlan = plan({
    id: 'C15',
    nodes: [node('A', 0, 0, qualitative), node('B', 0, 3000, qualitative)],
    wallAssemblies: [], walls: [],
    partitionDatums: [{ kind: 'partition-datum', id: 'PD-C15', fromNodeId: 'A', toNodeId: 'B', provenance: qualitative }]
  })
  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: -1200, y: 0, width: 2400, height: 3000 },
    paperOrigin: { x: target.x + target.width / 2 - 1200 / scale, y: target.y + 42 }
  })
  const datum = partitionDatumToDrawingPath(sourcePlan, sourcePlan.partitionDatums[0], projection, { locusPaperMm: 0.9 })
  return [
    ...header(target, 'C15', 'unresolved partition datum', 'provisional / qualitative / non-physical'),
    { ...datum, metadata: { ...datum.metadata, ...capabilityMeta('C15', qualitative) } }
  ]
}

const drawPhysicalPartition = (scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const partitionProvenance: AdeProvenance = { sourceIds: ['RH-PART-DRY-01'], authority: 'provisional', precision: 'range' }
  const partitionAssembly = assembly('RH-PART-DRY-01', { kind: 'range', min: mm(100), max: mm(150) }, partitionProvenance)
  const represented = mm(125)
  assertResolvedDistanceWithinAuthority(partitionAssembly.id, 'coordination thickness', partitionAssembly.thickness, represented)
  const sourcePlan = plan({
    id: 'C16', nodes: [node('A', 0, 0, partitionProvenance), node('B', 3500, 0, partitionProvenance)],
    wallAssemblies: [partitionAssembly],
    walls: [wall('P1', 'A', 'B', partitionAssembly.id, 'centreline', partitionProvenance)]
  })
  const topology = compileWallTopology(sourcePlan, { resolveAssemblyThicknessMm: () => represented })
  const region = topology.regions[0]
  const projection = projectionForRegion(region, scale, target)
  return [
    ...header(target, 'C16', 'resolved dry partition family', 'provisional / 100–150 mm range; 125 mm proof representative'),
    wallTopologyRegionToDrawingPath(region, projection, {
      id: 'C16-partition', stroke: 'primary', fill: 'faint',
      metadata: capabilityMeta('C16', partitionProvenance, { representedThicknessMm: 125, nominalThicknessSelected: false, serviceFree: true })
    })
  ]
}

const drawDimension = (scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: 0, y: -800, width: 4000, height: 1600 },
    paperOrigin: { x: target.x + (target.width - 4000 / scale) / 2, y: target.y + 55 }
  })
  const primitives = dimensionToDrawingPrimitives({
    kind: 'dimension', id: 'DIM-C17', a: { x: mm(0), y: mm(0) }, b: { x: mm(4000), y: mm(0) }, provenance: exact
  }, projection, { annotationSide: 'left' })
  return [
    ...header(target, 'C17', 'composed dimension', 'controlled / exact; paper ticks + witnesses'),
    ...primitives.map((primitive) => ({ ...primitive, metadata: { ...primitive.metadata, ...capabilityMeta('C17', exact) } }))
  ]
}

const drawAdjacency = (scale: 100 | 50, target: ReturnType<typeof cell>): DrawingPrimitiveV2[] => {
  const sourcePlan = plan({
    id: 'C18', nodes: [], wallAssemblies: [], walls: [],
    spaces: [
      { kind: 'space', id: 'A', label: 'A', provenance: qualitative },
      { kind: 'space', id: 'B', label: 'B', provenance: qualitative }
    ],
    adjacencies: [{
      kind: 'adjacency', id: 'ADJ-C18', between: ['A', 'B'],
      candidateSegments: [{ a: { x: mm(500), y: mm(0) }, b: { x: mm(3000), y: mm(0) } }],
      provenance: qualitative
    }]
  })
  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: 0, y: -800, width: 3500, height: 1600 },
    paperOrigin: { x: target.x + (target.width - 3500 / scale) / 2, y: target.y + 55 }
  })
  const boundaryA = projection.point(0, 0)
  const boundaryB = projection.point(3500, 0)
  const context = {
    kind: 'line' as const, id: 'C18-host-boundary', a: boundaryA, b: boundaryB, role: 'secondary' as const,
    metadata: capabilityMeta('C18', qualitative, { contextOnly: true, doorSelected: false })
  }
  const bracket = adjacencyObligationToDrawingPrimitives(sourcePlan, sourcePlan.adjacencies[0], projection, {
    annotationSide: 'right', offsetPaperMm: 3.2, tickPaperMm: 2
  }).map((primitive) => ({ ...primitive, id: `C18-${primitive.id}`, metadata: { ...primitive.metadata, ...capabilityMeta('C18', qualitative) } }))
  return [
    ...header(target, 'C18', 'adjacency obligation', 'provisional / qualitative / no door selected'),
    context,
    ...bracket
  ]
}

const capabilityList = [
  ...topologyCapabilities.map((item) => ({ id: item.id, label: item.label })),
  { id: 'C07', label: 'quiet layered cavity wall' },
  { id: 'C08', label: 'layered wall L corner' },
  ...openingCapabilities.map(([id, labelValue]) => ({ id, label: labelValue })),
  { id: 'C15', label: 'unresolved partition datum' },
  { id: 'C16', label: 'resolved dry partition family' },
  { id: 'C17', label: 'composed dimension' },
  { id: 'C18', label: 'adjacency obligation' }
]

const sceneFor = (scale: 100 | 50): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    text('title', 20, 14, `ADE-06 — architectural capability atlas — true 1:${scale}`, 'label'),
    text('subtitle', 20, 22, 'Model geometry changes with scale. Type, strokes, ticks, uncertainty marks and datum widths remain physical-paper quantities.', 'note'),
    text('source-note', 20, 29, 'Capability labels sit outside drawing fields. Grays are black-only tints. No fit scaling, raster content or invented technical construction.', 'note')
  ]

  topologyCapabilities.forEach((item, index) => primitives.push(...drawTopology(item, scale, cell(index))))
  primitives.push(...drawLayered('C07', 'quiet layered cavity wall', layeredPlan('C07', false), scale, cell(6)))
  primitives.push(...drawLayered('C08', 'layered wall L corner', layeredPlan('C08', true), scale, cell(7)))
  openingCapabilities.forEach((item, index) => primitives.push(...drawOpening(item, scale, cell(index + 8))))
  primitives.push(...drawDatum(scale, cell(14)))
  primitives.push(...drawPhysicalPartition(scale, cell(15)))
  primitives.push(...drawDimension(scale, cell(16)))
  primitives.push(...drawAdjacency(scale, cell(17)))

  return {
    widthMm: PAGE_WIDTH,
    heightMm: PAGE_HEIGHT,
    viewId: `ADE06-CAPABILITY-ATLAS-${scale}`,
    title: `ADE-06 architectural capability atlas at 1:${scale}`,
    description: 'Exact-size A1 atlas proving joined wall topology, layered wall representation, opening subtraction and uncertainty, partition states, dimension composition and adjacency notation before Reference House migration.',
    scaleDenominator: scale,
    sourceId: 'ADE-06-CAPABILITY',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const files: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2SvgWithTokens(sceneFor(scale), ADE03B_PROOF_TOKENS)
  const name = `ade06-capability-atlas-1-${scale}.svg`
  files[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  packet: 'ADE-06',
  issue: '#819',
  page: 'A1 landscape',
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  fitScaling: false,
  rasterContent: false,
  blackOnly: true,
  capabilities: capabilityList,
  resolvedPartitionProof: { sourceRangeMm: [100, 150], representedMm: 125, nominalThicknessSelected: false },
  scaleProof: {
    modelSpan4000Mm: { at100Mm: 40, at50Mm: 80 },
    partitionDatumPaperWidthMm: { at100: 0.9, at50: 0.9 },
    dimensionTickPaperMm: { at100: 2.2, at50: 2.2 },
    lineTokensMm: ADE03B_PROOF_TOKENS.lineMm,
    textTokensMm: ADE03B_PROOF_TOKENS.textMm
  },
  files: Object.fromEntries(Object.entries(files).map(([name, svg]) => [name, { sha256: sha256(svg), bytes: Buffer.byteLength(svg) }]))
}, null, 2)}\n`, 'utf8')

console.log('Prepared ADE-06 exact-size A1 capability atlas at 1:100 and 1:50.')
