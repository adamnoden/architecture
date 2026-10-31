import { mm, type Millimetres } from '../units.js'
import { assertResolvedDistanceWithinAuthority } from './authority.js'
import type {
  AdeArchitecturalPlan,
  AdeOpening,
  AdePlanNode,
  AdeWallAssembly,
  AdeWallRun
} from './model.js'
import { subtractRectilinearRectangles } from './rectilinear-region.js'
import { compileWallTopology, type AdeModelRect, type AdeWallTopologyRegion } from './topology.js'
import { assertValidArchitecturalPlan } from './validate.js'

const EPSILON = 1e-6

export interface AdeOpeningCutout {
  kind: 'opening-cutout'
  id: string
  openingId: string
  hostWallId: string
  rect: AdeModelRect
  sourceIds: readonly string[]
}

export interface AdeOpenedWallRegion extends AdeWallTopologyRegion {
  openingIds: readonly string[]
}

export interface AdeOpeningTopologyOptions {
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => Millimetres
  resolveOpeningCentreOffsetMm: (opening: AdeOpening) => Millimetres
  resolveOpeningWidthMm: (opening: AdeOpening) => Millimetres
}

const nodeFor = (nodes: ReadonlyMap<string, AdePlanNode>, id: string, ownerId: string): AdePlanNode => {
  const node = nodes.get(id)
  if (!node) throw new Error(`ADE-04A ${ownerId} references missing node ${id}.`)
  return node
}

const wallLengthAndDirection = (
  wall: AdeWallRun,
  nodes: ReadonlyMap<string, AdePlanNode>
): { from: AdePlanNode; to: AdePlanNode; length: number; ux: number; uy: number } => {
  const from = nodeFor(nodes, wall.fromNodeId, wall.id)
  const to = nodeFor(nodes, wall.toNodeId, wall.id)
  const dx = to.point.x - from.point.x
  const dy = to.point.y - from.point.y
  if (Math.abs(dx) > EPSILON && Math.abs(dy) > EPSILON) {
    throw new Error(`ADE-04A wall ${wall.id} is non-orthogonal; opening subtraction follows the earned ADE-02 rectilinear boundary.`)
  }
  const length = Math.hypot(dx, dy)
  if (length <= EPSILON) throw new Error(`ADE-04A wall ${wall.id} has zero length.`)
  return { from, to, length, ux: dx / length, uy: dy / length }
}

const singleWallStripRect = (
  plan: AdeArchitecturalPlan,
  wall: AdeWallRun,
  options: AdeOpeningTopologyOptions
): AdeModelRect => {
  const assembly = plan.wallAssemblies.find((candidate) => candidate.id === wall.assemblyId)
  if (!assembly) throw new Error(`ADE-04A wall ${wall.id} references missing assembly ${wall.assemblyId}.`)
  const synthetic: AdeArchitecturalPlan = {
    id: `${plan.id}::ADE04A::${wall.id}`,
    sourceId: plan.sourceId,
    nodes: plan.nodes,
    wallAssemblies: [assembly],
    walls: [wall],
    openings: [],
    partitionDatums: [],
    spaces: [],
    adjacencies: [],
    dimensions: [],
    labels: []
  }
  const topology = compileWallTopology(synthetic, {
    resolveAssemblyThicknessMm: options.resolveAssemblyThicknessMm
  })
  if (topology.sourceRectangles.length !== 1) {
    throw new Error(`ADE-04A expected one diagnostic wall strip for ${wall.id}, got ${topology.sourceRectangles.length}.`)
  }
  return topology.sourceRectangles[0]
}

export const compileOpeningCutouts = (
  plan: AdeArchitecturalPlan,
  options: AdeOpeningTopologyOptions
): readonly AdeOpeningCutout[] => {
  assertValidArchitecturalPlan(plan)
  const nodes = new Map(plan.nodes.map((node) => [node.id, node]))
  const walls = new Map(plan.walls.map((wall) => [wall.id, wall]))
  const cuts: AdeOpeningCutout[] = []

  for (const opening of plan.openings) {
    const wall = walls.get(opening.hostWallId)
    if (!wall) throw new Error(`ADE-04A opening ${opening.id} references missing host wall ${opening.hostWallId}.`)
    const { from, length, ux, uy } = wallLengthAndDirection(wall, nodes)
    const centre = options.resolveOpeningCentreOffsetMm(opening)
    const width = options.resolveOpeningWidthMm(opening)
    assertResolvedDistanceWithinAuthority(opening.id, 'opening centre offset', opening.centreOffset, centre)
    assertResolvedDistanceWithinAuthority(opening.id, 'opening width', opening.width, width)

    const start = centre - width / 2
    const end = centre + width / 2
    if (start <= EPSILON || end >= length - EPSILON) {
      throw new Error(`ADE-04A opening ${opening.id} reaches/touches host-wall endpoint or semantic junction. Corner/junction openings require an explicit later capability.`)
    }

    const strip = singleWallStripRect(plan, wall, options)
    const startPoint = {
      x: from.point.x + ux * start,
      y: from.point.y + uy * start
    }
    const endPoint = {
      x: from.point.x + ux * end,
      y: from.point.y + uy * end
    }

    const rect: AdeModelRect = Math.abs(ux) > EPSILON
      ? {
          x0: mm(Math.min(startPoint.x, endPoint.x)),
          y0: strip.y0,
          x1: mm(Math.max(startPoint.x, endPoint.x)),
          y1: strip.y1
        }
      : {
          x0: strip.x0,
          y0: mm(Math.min(startPoint.y, endPoint.y)),
          x1: strip.x1,
          y1: mm(Math.max(startPoint.y, endPoint.y))
        }

    cuts.push({
      kind: 'opening-cutout',
      id: `${plan.id}::OPENING-CUT::${opening.id}`,
      openingId: opening.id,
      hostWallId: wall.id,
      rect,
      sourceIds: [...new Set([...wall.provenance.sourceIds, ...opening.provenance.sourceIds])].sort()
    })
  }

  return cuts.sort((a, b) => a.id.localeCompare(b.id))
}

export const applyOpeningCutoutsToWallRegions = (
  regions: readonly AdeWallTopologyRegion[],
  cutouts: readonly AdeOpeningCutout[]
): readonly AdeOpenedWallRegion[] => regions.map((region) => {
  const applicable = cutouts.filter((cutout) => region.wallIds.includes(cutout.hostWallId))
  if (applicable.length === 0) return { ...region, openingIds: [] }
  return {
    ...region,
    rings: subtractRectilinearRectangles(region.rings, applicable.map((cutout) => cutout.rect)),
    sourceIds: [...new Set([...region.sourceIds, ...applicable.flatMap((cutout) => cutout.sourceIds)])].sort(),
    openingIds: applicable.map((cutout) => cutout.openingId).sort()
  }
})

export const applyOpeningCutoutsToAssemblyBands = <T extends {
  rings: readonly (readonly { x: Millimetres; y: Millimetres }[])[]
  wallIds: readonly string[]
  sourceIds: readonly string[]
}>(
  bands: readonly T[],
  cutouts: readonly AdeOpeningCutout[]
): readonly (T & { openingIds: readonly string[] })[] => bands.map((band) => {
  const applicable = cutouts.filter((cutout) => band.wallIds.includes(cutout.hostWallId))
  if (applicable.length === 0) return { ...band, openingIds: [] }
  return {
    ...band,
    rings: subtractRectilinearRectangles(band.rings, applicable.map((cutout) => cutout.rect)),
    sourceIds: [...new Set([...band.sourceIds, ...applicable.flatMap((cutout) => cutout.sourceIds)])].sort(),
    openingIds: applicable.map((cutout) => cutout.openingId).sort()
  }
})
