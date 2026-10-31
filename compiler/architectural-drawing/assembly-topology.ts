import { mm, type Millimetres } from '../units.js'
import { assertResolvedDistanceWithinAuthority } from './authority.js'
import type {
  AdeArchitecturalPlan,
  AdeModelPoint,
  AdeWallAssembly,
  AdeWallAssemblyLayer,
  AdeWallRun
} from './model.js'
import { compileWallTopology, type AdeWallTopologyRegion } from './topology.js'
import { assertValidArchitecturalPlan } from './validate.js'

const EPSILON = 1e-6

export interface AdeWallAssemblyBandRegion {
  kind: 'wall-assembly-band-region'
  id: string
  assemblyId: string
  layerId: string
  layerRole: AdeWallAssemblyLayer['role']
  rings: readonly (readonly AdeModelPoint[])[]
  wallIds: readonly string[]
  sourceIds: readonly string[]
}

export interface AdeWallAssemblyTopologyResult {
  assemblyId: string
  resolvedOverallThicknessMm: Millimetres
  resolvedLayerThicknessMm: Readonly<Record<string, Millimetres>>
  bands: readonly AdeWallAssemblyBandRegion[]
}

export interface AdeWallAssemblyTopologyOptions {
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => Millimetres
  resolveLayerThicknessMm: (layer: AdeWallAssemblyLayer, assembly: AdeWallAssembly) => Millimetres
}

const wallNetworkKey = (region: AdeWallTopologyRegion): string => [...region.wallIds].sort().join('|')

const edgeKey = (a: AdeModelPoint, b: AdeModelPoint): string => {
  const first = `${a.x},${a.y}`
  const second = `${b.x},${b.y}`
  return first < second ? `${first}>${second}` : `${second}>${first}`
}

const ringKey = (ring: readonly AdeModelPoint[]): string => {
  const edges = ring.map((point, index) => edgeKey(point, ring[(index + 1) % ring.length]))
  return edges.sort().join('|')
}

/**
 * An even-odd path is a parity set of closed boundaries. XOR is therefore the
 * correct geometric composition for A \ B when B is nested inside A: any shared
 * outer boundary cancels, leaving only the two boundaries that enclose the band.
 */
const xorRings = (
  a: readonly (readonly AdeModelPoint[])[],
  b: readonly (readonly AdeModelPoint[])[]
): readonly (readonly AdeModelPoint[])[] => {
  const byKey = new Map<string, { count: number; ring: readonly AdeModelPoint[] }>()
  for (const ring of [...a, ...b]) {
    const key = ringKey(ring)
    const current = byKey.get(key)
    if (current) current.count += 1
    else byKey.set(key, { count: 1, ring })
  }
  return [...byKey.entries()]
    .filter(([, value]) => value.count % 2 === 1)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(([, value]) => value.ring)
}

const syntheticPlanForCumulativeThickness = (
  plan: AdeArchitecturalPlan,
  assembly: AdeWallAssembly,
  walls: readonly AdeWallRun[],
  thickness: Millimetres,
  layerIndex: number
): AdeArchitecturalPlan => {
  const syntheticAssemblyId = `${assembly.id}::ADE-CUMULATIVE-${layerIndex + 1}`
  return {
    id: `${plan.id}::${syntheticAssemblyId}`,
    sourceId: plan.sourceId,
    nodes: plan.nodes,
    wallAssemblies: [{
      kind: 'wall-assembly',
      id: syntheticAssemblyId,
      thickness: { kind: 'exact', value: thickness },
      provenance: assembly.provenance
    }],
    walls: walls.map((wall) => ({
      ...wall,
      assemblyId: syntheticAssemblyId,
      assemblyStartFace: undefined
    })),
    openings: [],
    partitionDatums: [],
    spaces: [],
    adjacencies: [],
    dimensions: [],
    labels: []
  }
}

const regionsByNetwork = (regions: readonly AdeWallTopologyRegion[]): Map<string, AdeWallTopologyRegion> =>
  new Map(regions.map((region) => [wallNetworkKey(region), region]))

export const compileWallAssemblyTopology = (
  plan: AdeArchitecturalPlan,
  assemblyId: string,
  options: AdeWallAssemblyTopologyOptions
): AdeWallAssemblyTopologyResult => {
  assertValidArchitecturalPlan(plan)
  const assembly = plan.wallAssemblies.find((candidate) => candidate.id === assemblyId)
  if (!assembly) throw new Error(`ADE-03A cannot find wall assembly ${assemblyId}.`)
  if (!assembly.layers?.length) throw new Error(`ADE-03A wall assembly ${assemblyId} has no authored layers.`)

  const walls = plan.walls.filter((wall) => wall.assemblyId === assemblyId)
  if (walls.length === 0) throw new Error(`ADE-03A wall assembly ${assemblyId} is not used by any wall run.`)

  // ADE-03A proves layer bands from an authored physical face. Supporting a
  // centreline/opposite-face reference would require offset-network geometry
  // that no current Reference House plan condition has earned yet.
  for (const wall of walls) {
    if (!wall.assemblyStartFace) throw new Error(`ADE-03A wall ${wall.id} lacks assemblyStartFace.`)
    if (wall.reference !== wall.assemblyStartFace) {
      throw new Error(`ADE-03A wall ${wall.id} must reference the same physical face that starts its layered assembly. Offset reference networks are not yet an earned capability.`)
    }
  }

  const startFace = walls[0].assemblyStartFace
  if (walls.some((wall) => wall.assemblyStartFace !== startFace)) {
    throw new Error(`ADE-03A assembly ${assemblyId} changes layer orientation inside one compiled wall family.`)
  }

  const resolvedOverall = options.resolveAssemblyThicknessMm(assembly)
  assertResolvedDistanceWithinAuthority(assembly.id, 'overall wall thickness', assembly.thickness, resolvedOverall)

  const resolvedLayers = assembly.layers.map((layer) => {
    const value = options.resolveLayerThicknessMm(layer, assembly)
    assertResolvedDistanceWithinAuthority(layer.id, 'wall layer thickness', layer.thickness, value)
    return { layer, value }
  })
  const layerSum = resolvedLayers.reduce((sum, item) => sum + item.value, 0)
  if (Math.abs(layerSum - resolvedOverall) > EPSILON) {
    throw new Error(`ADE-03A assembly ${assembly.id} resolved layers sum to ${layerSum} mm but represented overall thickness is ${resolvedOverall} mm.`)
  }

  const cumulativeRegions: Array<Map<string, AdeWallTopologyRegion>> = []
  let cumulative = 0
  for (const [layerIndex, item] of resolvedLayers.entries()) {
    cumulative += item.value
    const syntheticPlan = syntheticPlanForCumulativeThickness(plan, assembly, walls, mm(cumulative), layerIndex)
    const topology = compileWallTopology(syntheticPlan, {
      resolveAssemblyThicknessMm: (candidate) => {
        if (candidate.thickness.kind !== 'exact') throw new Error('ADE-03A cumulative synthetic assembly lost exact thickness.')
        return candidate.thickness.value
      }
    })
    cumulativeRegions.push(regionsByNetwork(topology.regions))
  }

  const bands: AdeWallAssemblyBandRegion[] = []
  for (const [layerIndex, item] of resolvedLayers.entries()) {
    const current = cumulativeRegions[layerIndex]
    const previous = layerIndex === 0 ? undefined : cumulativeRegions[layerIndex - 1]
    for (const [network, region] of current.entries()) {
      const previousRegion = previous?.get(network)
      if (previous && !previousRegion) {
        throw new Error(`ADE-03A layer ${item.layer.id} lost wall-network continuity for ${network}.`)
      }
      const rings = previousRegion ? xorRings(region.rings, previousRegion.rings) : region.rings
      if (rings.length === 0) throw new Error(`ADE-03A layer ${item.layer.id} collapsed to an empty band for ${network}.`)
      bands.push({
        kind: 'wall-assembly-band-region',
        id: `${plan.id}::${assembly.id}::${item.layer.id}::${network}`,
        assemblyId: assembly.id,
        layerId: item.layer.id,
        layerRole: item.layer.role,
        rings,
        wallIds: region.wallIds,
        sourceIds: [...new Set([
          ...assembly.provenance.sourceIds,
          ...item.layer.provenance.sourceIds,
          ...region.sourceIds
        ])].sort()
      })
    }
  }

  return {
    assemblyId: assembly.id,
    resolvedOverallThicknessMm: resolvedOverall,
    resolvedLayerThicknessMm: Object.fromEntries(resolvedLayers.map(({ layer, value }) => [layer.id, value])),
    bands
  }
}
