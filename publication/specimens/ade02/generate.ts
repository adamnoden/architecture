import { createHash } from 'node:crypto'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { DrawingPrimitiveV2, DrawingSceneV2, DrawingText } from '../../../compiler/publication-drawing-v2/model.js'
import { renderDrawingSceneV2Svg } from '../../../compiler/publication-drawing-v2/svg.js'
import { createPlanPaperProjection } from '../../../compiler/publication-drawing/projection.js'
import { mm } from '../../../compiler/units.js'
import type {
  AdeArchitecturalPlan,
  AdePlanNode,
  AdeProvenance,
  AdeWallAssembly,
  AdeWallReference,
  AdeWallRun
} from '../../../compiler/architectural-drawing/model.js'
import { compileWallTopology } from '../../../compiler/architectural-drawing/topology.js'
import { wallTopologyRegionToDrawingPath } from '../../../compiler/architectural-drawing/wall-drawing.js'

const workRoot = resolve(import.meta.dirname, '.work')
const PAGE_WIDTH = 594
const PAGE_HEIGHT = 420
const CELL_WIDTH = 184
const CELL_HEIGHT = 178
const MARGIN_X = 20
const MARGIN_Y = 28
const GAP_X = 1
const GAP_Y = 8

const provenance: AdeProvenance = {
  sourceIds: ['ADE-02-CAPABILITY-FIXTURE'],
  authority: 'controlled',
  precision: 'exact'
}

const node = (id: string, x: number, y: number): AdePlanNode => ({
  kind: 'node', id, point: { x: mm(x), y: mm(y) }, provenance
})

const assembly = (id: string, thickness: number): AdeWallAssembly => ({
  kind: 'wall-assembly', id, thickness: { kind: 'exact', value: mm(thickness) }, provenance
})

const wall = (
  id: string,
  fromNodeId: string,
  toNodeId: string,
  assemblyId = 'WA-400',
  reference: AdeWallReference = 'centreline'
): AdeWallRun => ({ kind: 'wall', id, fromNodeId, toNodeId, assemblyId, reference, provenance })

const fixture = (
  id: string,
  nodes: AdePlanNode[],
  walls: AdeWallRun[],
  assemblies: AdeWallAssembly[] = [assembly('WA-400', 400)]
): AdeArchitecturalPlan => ({
  id,
  sourceId: 'ADE-02-CAPABILITY-FIXTURE',
  nodes,
  wallAssemblies: assemblies,
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
    id: 'C01', label: 'C01 — straight run',
    plan: fixture('ADE02-C01', [node('A', 0, 0), node('B', 6000, 0)], [wall('W1', 'A', 'B')])
  },
  {
    id: 'C02', label: 'C02 — L corner',
    plan: fixture('ADE02-C02', [node('A', 0, 0), node('B', 5000, 0), node('C', 5000, 3500)], [wall('W1', 'A', 'B'), wall('W2', 'B', 'C')])
  },
  {
    id: 'C03', label: 'C03 — T junction',
    plan: fixture(
      'ADE02-C03',
      [node('A', 0, 0), node('B', 4000, 0), node('C', 8000, 0), node('D', 4000, 3500)],
      [wall('W1', 'A', 'B'), wall('W2', 'B', 'C'), wall('W3', 'B', 'D')]
    )
  },
  {
    id: 'C04', label: 'C04 — cross junction',
    plan: fixture(
      'ADE02-C04',
      [node('C', 0, 0), node('W', -3000, 0), node('E', 3000, 0), node('N', 0, 3000), node('S', 0, -3000)],
      [wall('WW', 'W', 'C'), wall('WE', 'C', 'E'), wall('WN', 'C', 'N'), wall('WS', 'S', 'C')]
    )
  },
  {
    id: 'C05', label: 'C05 — closed ring / hole',
    plan: fixture(
      'ADE02-C05',
      [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
      [wall('W1', 'A', 'B'), wall('W2', 'B', 'C'), wall('W3', 'C', 'D'), wall('W4', 'D', 'A')]
    )
  },
  {
    id: 'C06', label: 'C06 — face-aligned perimeter',
    plan: fixture(
      'ADE02-C06',
      [node('A', 0, 0), node('B', 6000, 0), node('C', 6000, 4000), node('D', 0, 4000)],
      [
        wall('S', 'A', 'B', 'WA-400', 'right-face'),
        wall('E', 'B', 'C', 'WA-400', 'right-face'),
        wall('N', 'C', 'D', 'WA-400', 'right-face'),
        wall('W', 'D', 'A', 'WA-400', 'right-face')
      ]
    )
  }
]

const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex')

const label = (id: string, x: number, y: number, value: string, role: DrawingText['role'] = 'note'): DrawingText => ({
  kind: 'text', id, x, y, value, role, anchor: 'start', metadata: { specimen: true }
})

const regionBounds = (rings: readonly (readonly { x: number; y: number }[])[]) => {
  const points = rings.flat()
  return {
    x: Math.min(...points.map((point) => point.x)),
    y: Math.min(...points.map((point) => point.y)),
    maxX: Math.max(...points.map((point) => point.x)),
    maxY: Math.max(...points.map((point) => point.y))
  }
}

const sceneForScale = (scaleDenominator: number): DrawingSceneV2 => {
  const primitives: DrawingPrimitiveV2[] = [
    label('sheet-title', 20, 13, `ADE-02 — joined wall topology capabilities — 1:${scaleDenominator}`, 'label'),
    label('sheet-note', 20, 19, 'One semantic wall network → one joined vector region. No internal rectangle seams.', 'note')
  ]

  fixtures.forEach((item, index) => {
    const column = index % 3
    const row = Math.floor(index / 3)
    const cellX = MARGIN_X + column * (CELL_WIDTH + GAP_X)
    const cellY = MARGIN_Y + row * (CELL_HEIGHT + GAP_Y)
    const topology = compileWallTopology(item.plan, {
      resolveAssemblyThicknessMm: (wallAssembly) => {
        if (wallAssembly.thickness.kind !== 'exact') throw new Error(`${item.id} expects exact fixture thickness.`)
        return wallAssembly.thickness.value
      }
    })
    if (topology.regions.length !== 1) throw new Error(`${item.id} expected one connected wall region.`)
    const region = topology.regions[0]
    const bounds = regionBounds(region.rings)
    const modelWidth = bounds.maxX - bounds.x
    const modelHeight = bounds.maxY - bounds.y
    const paperWidth = modelWidth / scaleDenominator
    const paperHeight = modelHeight / scaleDenominator
    const drawingTop = cellY + 16
    const availableHeight = CELL_HEIGHT - 24
    if (paperWidth > CELL_WIDTH - 24 || paperHeight > availableHeight) {
      throw new Error(`${item.id} at 1:${scaleDenominator} does not fit its fixed capability cell without fit-scaling.`)
    }
    const originX = cellX + (CELL_WIDTH - paperWidth) / 2
    const originY = drawingTop + (availableHeight - paperHeight) / 2
    const projection = createPlanPaperProjection({
      scaleDenominator,
      modelBounds: { x: bounds.x, y: bounds.y, width: modelWidth, height: modelHeight },
      paperOrigin: { x: originX, y: originY }
    })

    primitives.push(
      label(`label-${item.id}`, cellX + 6, cellY + 7, item.label, 'marker'),
      wallTopologyRegionToDrawingPath(region, projection, {
        id: `wall-region-${item.id}`,
        stroke: 'profile',
        fill: 'faint',
        metadata: { capability: item.id, scale: `1:${scaleDenominator}` }
      })
    )
  })

  return {
    widthMm: PAGE_WIDTH,
    heightMm: PAGE_HEIGHT,
    viewId: `ADE02-WALL-TOPOLOGY-${scaleDenominator}`,
    title: `ADE-02 wall topology capabilities at 1:${scaleDenominator}`,
    description: 'Exact-size capability sheet proving joined wall runs, L/T/cross junctions and closed wall rings without independent-rectangle seams.',
    scaleDenominator,
    sourceId: 'ADE-02-CAPABILITY-FIXTURE',
    primitives
  }
}

await rm(workRoot, { recursive: true, force: true })
await mkdir(workRoot, { recursive: true })

const outputs: Record<string, string> = {}
for (const scale of [100, 50] as const) {
  const svg = renderDrawingSceneV2Svg(sceneForScale(scale))
  const name = `ade02-wall-topology-1-${scale}.svg`
  outputs[name] = svg
  await writeFile(resolve(workRoot, name), svg, 'utf8')
}

const manifest = {
  schemaVersion: 1,
  packet: 'ADE-02',
  terminalIr: 'publication-drawing-v2',
  protectedV1Mutation: false,
  pageMm: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
  scales: [100, 50],
  capabilities: fixtures.map(({ id, label: fixtureLabel }) => ({ id, label: fixtureLabel })),
  fitScaling: false,
  wallRepresentation: 'one joined even-odd path per connected semantic wall network',
  files: Object.fromEntries(Object.entries(outputs).map(([name, svg]) => [name, { sha256: sha256(svg), bytes: Buffer.byteLength(svg) }]))
}
await writeFile(resolve(workRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log('Prepared ADE-02 exact-size wall topology capability sheets at 1:100 and 1:50 through publication-drawing-v2.')
