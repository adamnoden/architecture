import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

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
import {
  compileOpeningUncertaintyInstruction,
  openingUncertaintyToDrawingPrimitives
} from '../../../compiler/architectural-drawing/opening-uncertainty.js'
import { compileWallTopology } from '../../../compiler/architectural-drawing/topology.js'
import { wallTopologyRegionToDrawingPath } from '../../../compiler/architectural-drawing/wall-drawing.js'
import type { DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2SvgWithTokens } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'
import { ADE04B_PROOF_TOKENS } from './tokens.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 594
const PAGE_HEIGHT = 420
const MARGIN_X = 17
const TOP = 50
const CELL_WIDTH = 112
const CELL_HEIGHT = 160
const ROW_GAP = 14

const exact: AdeProvenance = { sourceIds: ['ADE-04B-CAPABILITY'], authority: 'controlled', precision: 'exact' }
const approx: AdeProvenance = { sourceIds: ['ADE-04B-APPROX'], authority: 'provisional', precision: 'approximate' }
const ranged: AdeProvenance = { sourceIds: ['ADE-04B-RANGE'], authority: 'provisional', precision: 'range' }
const unknown: AdeProvenance = { sourceIds: ['ADE-04B-UNKNOWN'], authority: 'provisional', precision: 'unknown' }

const node = (id: string, x: number, y: number): AdePlanNode => ({ kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance: exact })
const layer = (id: string, role: AdeWallAssemblyLayer['role'], value: number): AdeWallAssemblyLayer => ({
  id, role, thickness: { kind: 'exact', value: mm(value) }, provenance: exact
})
const monolithic: AdeWallAssembly = { kind: 'wall-assembly', id: 'WA-MONO', thickness: { kind: 'exact', value: mm(400) }, provenance: exact }
const layered: AdeWallAssembly = {
  kind: 'wall-assembly', id: 'WA-LAYERED', thickness: { kind: 'exact', value: mm(400) },
  layers: [
    layer('L-WEATHER', 'weathering-leaf', 100),
    layer('L-CAVITY', 'cavity-zone', 150),
    layer('L-STRUCT', 'structural-leaf', 140),
    layer('L-FINISH', 'finish-zone', 10)
  ],
  provenance: exact
}

const wall = (assemblyId: string): AdeWallRun => ({
  kind: 'wall', id: 'W1', fromNodeId: 'A', toNodeId: 'B', reference: 'right-face', assemblyId,
  assemblyStartFace: assemblyId === 'WA-LAYERED' ? 'right-face' : undefined,
  provenance: exact
})

const states = [
  {
    id: 'EXACT',
    label: 'EXACT',
    opening: (): AdeOpening => ({
      kind: 'opening', id: 'O-EXACT', hostWallId: 'W1', role: 'window',
      centreOffset: { kind: 'exact', value: mm(2000) }, width: { kind: 'exact', value: mm(1000) }, provenance: exact
    })
  },
  {
    id: 'APPROX',
    label: 'APPROXIMATE',
    opening: (): AdeOpening => ({
      kind: 'opening', id: 'O-APPROX', hostWallId: 'W1', role: 'window',
      centreOffset: { kind: 'exact', value: mm(2000) }, width: { kind: 'approximate', value: mm(1000) }, provenance: approx
    })
  },
  {
    id: 'RANGE',
    label: 'RANGE WIDTH',
    opening: (): AdeOpening => ({
      kind: 'opening', id: 'O-RANGE', hostWallId: 'W1', role: 'window',
      centreOffset: { kind: 'exact', value: mm(2000) }, width: { kind: 'range', min: mm(800), max: mm(1200) }, provenance: ranged
    })
  },
  {
    id: 'CENTRE',
    label: 'CENTRE / WIDTH ?',
    opening: (): AdeOpening => ({
      kind: 'opening', id: 'O-CENTRE', hostWallId: 'W1', role: 'window',
      centreOffset: { kind: 'exact', value: mm(2000) }, width: { kind: 'unknown' }, provenance: unknown
    })
  },
  {
    id: 'HOST',
    label: 'HOST ONLY',
    opening: (): AdeOpening => ({
      kind: 'opening', id: 'O-HOST', hostWallId: 'W1', role: 'window',
      centreOffset: { kind: 'unknown' }, width: { kind: 'unknown' }, provenance: unknown
    })
  }
] as const

const planFor = (assembly: AdeWallAssembly, candidate: AdeOpening): AdeArchitecturalPlan => ({
  id: `ADE04B-${assembly.id}-${candidate.id}`,
  sourceId: 'ADE-04B-CAPABILITY',
  nodes: [node('A', 0, 0), node('B', 4000, 0)],
  wallAssemblies: [assembly], walls: [wall(assembly.id)], openings: [candidate],
  partitionDatums: [], spaces: [], adjacencies: [], dimensions: [], labels: []
})

const physicalOpening = (candidate: AdeOpening): boolean =>
  candidate.centreOffset.kind !== 'unknown' && candidate.centreOffset.kind !== 'qualitative' && candidate.centreOffset.kind !== 'range' &&
  candidate.width.kind !== 'unknown' && candidate.width.kind !== 'qualitative'

const openingOptions = {
  resolveAssemblyThicknessMm: () => mm(400),
  resolveOpeningCentreOffsetMm: (candidate: AdeOpening) => {
    if (candidate.centreOffset.kind === 'exact' || candidate.centreOffset.kind === 'approximate') return candidate.centreOffset.value
    throw new Error(`ADE-04B proof cannot cut ${candidate.centreOffset.kind} position.`)
  },
  resolveOpeningWidthMm: (candidate: AdeOpening) => {
    if (candidate.width.kind === 'exact' || candidate.width.kind === 'approximate') return candidate.width.value
    if (candidate.width.kind === 'range') return candidate.width.min
    throw new Error(`ADE-04B proof cannot cut ${candidate.width.kind} width.`)
  }
}

const text = (id: string, x: number, y: number, value: string, role: DrawingText['role'] = 'note'): DrawingText => ({
  kind: 'text', id, x, y, value, role, anchor: 'middle', metadata: { specimen: true }
})
const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const band = (bands: readonly (AdeWallAssemblyBandRegion & { openingIds: readonly string[] })[], role: AdeWallAssemblyLayer['role']) => {
  const match = bands.find((candidate) => candidate.layerRole === role)
  if (!match) throw new Error(`ADE-04B proof lost ${role}.`)
  return match
}

const drawCell = (
  scale: 100 | 50,
  assembly: AdeWallAssembly,
  candidate: AdeOpening,
  cellX: number,
  cellY: number
): DrawingPrimitiveV2[] => {
  const plan = planFor(assembly, candidate)
  const projection = createPlanPaperProjection({
    scaleDenominator: scale,
    modelBounds: { x: 0, y: -800, width: 4000, height: 1600 },
    paperOrigin: { x: cellX + (CELL_WIDTH - 4000 / scale) / 2, y: cellY + 56 }
  })
  const topology = compileWallTopology(plan, { resolveAssemblyThicknessMm: openingOptions.resolveAssemblyThicknessMm })
  const cuts = physicalOpening(candidate) ? compileOpeningCutouts(plan, openingOptions) : []
  const overall = cuts.length ? applyOpeningCutoutsToWallRegions(topology.regions, cuts)[0] : topology.regions[0]
  const primitives: DrawingPrimitiveV2[] = []

  if (assembly.id === 'WA-MONO') {
    primitives.push(wallTopologyRegionToDrawingPath(overall, projection, {
      id: `${candidate.id}-${assembly.id}-WALL`, stroke: 'profile', fill: 'faint',
      metadata: { proofState: candidate.provenance.precision }
    }))
  } else {
    const assemblyTopology = compileWallAssemblyTopology(plan, assembly.id, {
      resolveAssemblyThicknessMm: () => mm(400),
      resolveLayerThicknessMm: (candidateLayer) => {
        if (candidateLayer.thickness.kind !== 'exact') throw new Error('ADE-04B proof expects exact synthetic layers.')
        return candidateLayer.thickness.value
      }
    })
    const bands = cuts.length ? applyOpeningCutoutsToAssemblyBands(assemblyTopology.bands, cuts) : assemblyTopology.bands.map((item) => ({ ...item, openingIds: [] as readonly string[] }))
    primitives.push(
      wallAssemblyBandToDrawingPath(band(bands, 'weathering-leaf'), projection, { id: `${candidate.id}-WEATHER`, fill: 'faint' }),
      wallAssemblyBandToDrawingPath(band(bands, 'cavity-zone'), projection, { id: `${candidate.id}-CAVITY`, fill: 'paper' }),
      wallAssemblyBandToDrawingPath(band(bands, 'structural-leaf'), projection, { id: `${candidate.id}-STRUCT`, fill: 'context' }),
      wallAssemblyBandToDrawingPath(band(bands, 'finish-zone'), projection, { id: `${candidate.id}-FINISH`, fill: 'context' }),
      wallTopologyRegionToDrawingPath(overall, projection, { id: `${candidate.id}-${assembly.id}-OUTLINE`, stroke: 'profile', fill: 'none' })
    )
  }

  const instruction = compileOpeningUncertaintyInstruction(plan, candidate.id)
  primitives.push(...openingUncertaintyToDrawingPrimitives(plan, instruction, projection, {
    annotationSide: 'left', resolveAssemblyThicknessMm: () => mm(400), showLabels: true,
    gapPaperMm: 3.5, tickPaperMm: 1.5, markerPaperMm: 1.5
  }).map((primitive) => ({ ...primitive, id: `${assembly.id}-${primitive.id}` })))
  return primitives
}

const sceneFor = (scale: 100 | 50): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    { kind: 'text', id: 'title', x: 18, y: 14, value: `ADE-04B — opening authority grammar — true 1:${scale}`, role: 'label', anchor: 'start' },
    { kind: 'text', id: 'subtitle', x: 18, y: 22, value: 'Uncertainty lives outside wall matter. No dashed pseudo-jambs. Top row monolithic; bottom row layered cavity wall.', role: 'note', anchor: 'start' }
  ]

  states.forEach((state, index) => {
    const cellX = MARGIN_X + index * CELL_WIDTH
    const monoY = TOP
    const layeredY = TOP + CELL_HEIGHT + ROW_GAP
    primitives.push(
      text(`head-${state.id}`, cellX + CELL_WIDTH / 2, 41, state.label, 'marker'),
      text(`mono-${state.id}`, cellX + CELL_WIDTH / 2, monoY + 10, 'monolithic', 'note'),
      text(`layer-${state.id}`, cellX + CELL_WIDTH / 2, layeredY + 10, 'layered', 'note'),
      ...drawCell(scale, monolithic, state.opening(), cellX, monoY),
      ...drawCell(scale, layered, state.opening(), cellX, layeredY)
    )
  })

  return {
    widthMm: PAGE_WIDTH, heightMm: PAGE_HEIGHT,
    viewId: `ADE04B-UNCERTAINTY-${scale}`,
    title: `ADE-04B opening uncertainty grammar at 1:${scale}`,
    description: 'Exact-size capability atlas comparing exact, approximate, ranged, centre-only and host-only opening authority states on monolithic and layered walls.',
    scaleDenominator: scale, sourceId: 'ADE-04B-CAPABILITY', primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })
const files: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2SvgWithTokens(sceneFor(scale), ADE04B_PROOF_TOKENS)
  const name = `ade04b-opening-uncertainty-1-${scale}.svg`
  files[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify({
  schemaVersion: 1,
  packet: 'ADE-04B',
  issue: '#832',
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  fitScaling: false,
  uncertaintyInsideWallMatter: false,
  dashedPseudoJambs: false,
  physicalRangeGeometry: 'minimum guaranteed aperture',
  files: Object.fromEntries(Object.entries(files).map(([name, svg]) => [name, { sha256: sha256(svg), bytes: Buffer.byteLength(svg) }]))
}, null, 2)}\n`, 'utf8')
console.log('Prepared ADE-04B exact-size opening-authority grammar atlas.')
