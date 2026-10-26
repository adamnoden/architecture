import { mm, type Millimetres } from '../units.js'
import type {
  AdeArchitecturalPlan,
  AdeModelPoint,
  AdePlanNode,
  AdeWallAssembly,
  AdeWallRun
} from './model.js'
import { assertValidArchitecturalPlan } from './validate.js'

const EPSILON = 1e-6

export interface AdeModelRect {
  x0: Millimetres
  y0: Millimetres
  x1: Millimetres
  y1: Millimetres
}

export interface AdeWallTopologyRegion {
  kind: 'wall-topology-region'
  id: string
  rings: readonly (readonly AdeModelPoint[])[]
  wallIds: readonly string[]
  sourceIds: readonly string[]
}

export interface AdeWallTopologyResult {
  regions: readonly AdeWallTopologyRegion[]
  /** Diagnostic geometry retained for deterministic tests, not publication. */
  sourceRectangles: readonly AdeModelRect[]
}

export interface AdeWallTopologyOptions {
  /**
   * Representation must not silently choose a value from a ranged/qualitative
   * wall assembly. The caller resolves a drawing thickness from source-owned
   * authority; ADE verifies that the value is admissible.
   */
  resolveAssemblyThicknessMm: (assembly: AdeWallAssembly) => Millimetres
}

interface NumericRect {
  x0: number
  y0: number
  x1: number
  y1: number
}

interface DirectedEdge {
  a: [number, number]
  b: [number, number]
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= EPSILON

const pointKey = (point: [number, number]): string => `${point[0]}:${point[1]}`

const uniqueSorted = (values: readonly number[]): number[] =>
  [...new Set(values)].sort((a, b) => a - b)

const assertAdmissibleThickness = (assembly: AdeWallAssembly, resolved: Millimetres): void => {
  if (!Number.isFinite(resolved) || resolved <= 0) {
    throw new Error(`ADE-02 wall assembly ${assembly.id} resolved to a non-positive/non-finite thickness.`)
  }

  const authority = assembly.thickness
  switch (authority.kind) {
    case 'exact':
      if (!near(resolved, authority.value)) {
        throw new Error(`ADE-02 wall assembly ${assembly.id} resolved ${resolved} mm outside exact authority ${authority.value} mm.`)
      }
      return
    case 'approximate':
      // An approximate source value is still the only authored nominal value at
      // this packet. Later representation profiles may add explicit tolerance.
      if (!near(resolved, authority.value)) {
        throw new Error(`ADE-02 wall assembly ${assembly.id} resolved ${resolved} mm away from its approximate nominal ${authority.value} mm without a representation rule.`)
      }
      return
    case 'range':
      if (resolved < authority.min - EPSILON || resolved > authority.max + EPSILON) {
        throw new Error(`ADE-02 wall assembly ${assembly.id} resolved ${resolved} mm outside authored range ${authority.min}–${authority.max} mm.`)
      }
      return
    case 'qualitative':
    case 'unknown':
      throw new Error(`ADE-02 wall assembly ${assembly.id} has ${authority.kind} thickness authority and cannot yet compile a physical wall body.`)
  }
}

const nodeFor = (nodes: ReadonlyMap<string, AdePlanNode>, id: string, wallId: string): AdePlanNode => {
  const node = nodes.get(id)
  if (!node) throw new Error(`ADE-02 wall ${wallId} references missing node ${id}.`)
  return node
}

const wallOffsets = (wall: AdeWallRun, thickness: number): readonly [number, number] => {
  switch (wall.reference) {
    case 'centreline': return [-thickness / 2, thickness / 2]
    case 'left-face': return [-thickness, 0]
    case 'right-face': return [0, thickness]
  }
}

interface WallStrip {
  wall: AdeWallRun
  rect: NumericRect
  crossSectionAtFrom: readonly [readonly [number, number], readonly [number, number]]
  crossSectionAtTo: readonly [readonly [number, number], readonly [number, number]]
}

const wallStrip = (
  wall: AdeWallRun,
  nodes: ReadonlyMap<string, AdePlanNode>,
  thickness: number
): WallStrip => {
  const from = nodeFor(nodes, wall.fromNodeId, wall.id).point
  const to = nodeFor(nodes, wall.toNodeId, wall.id).point
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (!near(dx, 0) && !near(dy, 0)) {
    throw new Error(`ADE-02 wall ${wall.id} is non-orthogonal. Angled topology is not yet an earned capability.`)
  }
  const length = Math.hypot(dx, dy)
  if (length <= EPSILON) throw new Error(`ADE-02 wall ${wall.id} has zero length.`)

  const nx = -dy / length
  const ny = dx / length
  const [offsetA, offsetB] = wallOffsets(wall, thickness)
  const fromA: [number, number] = [from.x + nx * offsetA, from.y + ny * offsetA]
  const fromB: [number, number] = [from.x + nx * offsetB, from.y + ny * offsetB]
  const toA: [number, number] = [to.x + nx * offsetA, to.y + ny * offsetA]
  const toB: [number, number] = [to.x + nx * offsetB, to.y + ny * offsetB]
  const xs = [fromA[0], fromB[0], toA[0], toB[0]]
  const ys = [fromA[1], fromB[1], toA[1], toB[1]]

  return {
    wall,
    rect: { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) },
    crossSectionAtFrom: [fromA, fromB],
    crossSectionAtTo: [toA, toB]
  }
}

const jointRects = (strips: readonly WallStrip[]): NumericRect[] => {
  const endpoints = new Map<string, Array<readonly [number, number]>>()

  for (const strip of strips) {
    const entries = [
      [strip.wall.fromNodeId, strip.crossSectionAtFrom] as const,
      [strip.wall.toNodeId, strip.crossSectionAtTo] as const
    ]
    for (const [nodeId, section] of entries) {
      const current = endpoints.get(nodeId) ?? []
      current.push(...section)
      endpoints.set(nodeId, current)
    }
  }

  const patches: NumericRect[] = []
  for (const points of endpoints.values()) {
    // A lone wall endpoint stays a clean square/flat termination. A semantic
    // shared node is what authorises material continuity across wall runs.
    if (points.length < 4) continue
    const xs = points.map((point) => point[0])
    const ys = points.map((point) => point[1])
    const rect = { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }
    if (rect.x1 - rect.x0 > EPSILON && rect.y1 - rect.y0 > EPSILON) patches.push(rect)
  }
  return patches
}

const containsPoint = (rect: NumericRect, x: number, y: number): boolean =>
  x > rect.x0 - EPSILON && x < rect.x1 + EPSILON && y > rect.y0 - EPSILON && y < rect.y1 + EPSILON

const boundaryEdges = (rectangles: readonly NumericRect[]): DirectedEdge[] => {
  const xs = uniqueSorted(rectangles.flatMap((rect) => [rect.x0, rect.x1]))
  const ys = uniqueSorted(rectangles.flatMap((rect) => [rect.y0, rect.y1]))
  if (xs.length < 2 || ys.length < 2) return []

  const filled: boolean[][] = Array.from({ length: xs.length - 1 }, () => Array<boolean>(ys.length - 1).fill(false))
  for (let xi = 0; xi < xs.length - 1; xi += 1) {
    for (let yi = 0; yi < ys.length - 1; yi += 1) {
      const cx = (xs[xi] + xs[xi + 1]) / 2
      const cy = (ys[yi] + ys[yi + 1]) / 2
      filled[xi][yi] = rectangles.some((rect) => containsPoint(rect, cx, cy))
    }
  }

  const isFilled = (xi: number, yi: number): boolean =>
    xi >= 0 && yi >= 0 && xi < xs.length - 1 && yi < ys.length - 1 && filled[xi][yi]

  const edges: DirectedEdge[] = []
  for (let xi = 0; xi < xs.length - 1; xi += 1) {
    for (let yi = 0; yi < ys.length - 1; yi += 1) {
      if (!filled[xi][yi]) continue
      const x0 = xs[xi]
      const x1 = xs[xi + 1]
      const y0 = ys[yi]
      const y1 = ys[yi + 1]
      // Directed so filled material is always on the left side of the edge.
      if (!isFilled(xi, yi - 1)) edges.push({ a: [x0, y0], b: [x1, y0] })
      if (!isFilled(xi + 1, yi)) edges.push({ a: [x1, y0], b: [x1, y1] })
      if (!isFilled(xi, yi + 1)) edges.push({ a: [x1, y1], b: [x0, y1] })
      if (!isFilled(xi - 1, yi)) edges.push({ a: [x0, y1], b: [x0, y0] })
    }
  }
  return edges
}

const signedArea = (ring: readonly [number, number][]): number => {
  let area = 0
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index]
    const [x2, y2] = ring[(index + 1) % ring.length]
    area += x1 * y2 - x2 * y1
  }
  return area / 2
}

const simplifyRing = (ring: readonly [number, number][]): [number, number][] => {
  if (ring.length <= 3) return [...ring]
  let points = [...ring]
  let changed = true
  while (changed && points.length > 3) {
    changed = false
    const next: [number, number][] = []
    for (let index = 0; index < points.length; index += 1) {
      const prev = points[(index - 1 + points.length) % points.length]
      const current = points[index]
      const after = points[(index + 1) % points.length]
      const collinear = (near(prev[0], current[0]) && near(current[0], after[0])) ||
        (near(prev[1], current[1]) && near(current[1], after[1]))
      if (collinear) {
        changed = true
      } else {
        next.push(current)
      }
    }
    points = next
  }
  return points
}

const traceRings = (edges: readonly DirectedEdge[]): [number, number][][] => {
  const outgoing = new Map<string, DirectedEdge[]>()
  for (const edge of edges) {
    const key = pointKey(edge.a)
    const list = outgoing.get(key) ?? []
    list.push(edge)
    outgoing.set(key, list)
  }
  for (const [key, list] of outgoing) {
    if (list.length > 1) {
      throw new Error(`ADE-02 ambiguous point-touch topology at ${key}; wall networks must meet through an authored junction, not diagonal contact.`)
    }
  }

  const unused = new Set(edges.map((edge) => `${pointKey(edge.a)}>${pointKey(edge.b)}`))
  const edgeById = new Map(edges.map((edge) => [`${pointKey(edge.a)}>${pointKey(edge.b)}`, edge]))
  const rings: [number, number][][] = []

  while (unused.size > 0) {
    const firstId = [...unused].sort()[0]
    const first = edgeById.get(firstId)
    if (!first) throw new Error('ADE-02 internal edge lookup failure.')
    const startKey = pointKey(first.a)
    const ring: [number, number][] = [first.a]
    let current = first

    while (true) {
      const currentId = `${pointKey(current.a)}>${pointKey(current.b)}`
      if (!unused.delete(currentId)) throw new Error(`ADE-02 repeated boundary edge ${currentId}.`)
      const endKey = pointKey(current.b)
      if (endKey === startKey) break
      ring.push(current.b)
      const candidates = outgoing.get(endKey) ?? []
      const next = candidates.find((candidate) => unused.has(`${pointKey(candidate.a)}>${pointKey(candidate.b)}`))
      if (!next) throw new Error(`ADE-02 open wall-region boundary at ${endKey}.`)
      current = next
    }

    const simplified = simplifyRing(ring)
    if (simplified.length < 4) throw new Error('ADE-02 wall-region ring collapsed below four rectilinear corners.')
    rings.push(simplified)
  }

  return rings.sort((a, b) => {
    const areaDifference = Math.abs(signedArea(b)) - Math.abs(signedArea(a))
    if (!near(areaDifference, 0)) return areaDifference
    const minA = [Math.min(...a.map((point) => point[0])), Math.min(...a.map((point) => point[1]))]
    const minB = [Math.min(...b.map((point) => point[0])), Math.min(...b.map((point) => point[1]))]
    return minA[0] - minB[0] || minA[1] - minB[1]
  })
}

const connectedWallGroups = (walls: readonly AdeWallRun[]): AdeWallRun[][] => {
  const byNode = new Map<string, AdeWallRun[]>()
  for (const wall of walls) {
    for (const nodeId of [wall.fromNodeId, wall.toNodeId]) {
      const list = byNode.get(nodeId) ?? []
      list.push(wall)
      byNode.set(nodeId, list)
    }
  }

  const unvisited = new Set(walls.map((wall) => wall.id))
  const byId = new Map(walls.map((wall) => [wall.id, wall]))
  const groups: AdeWallRun[][] = []

  while (unvisited.size > 0) {
    const seedId = [...unvisited].sort()[0]
    const seed = byId.get(seedId)
    if (!seed) throw new Error('ADE-02 internal wall lookup failure.')
    const queue = [seed]
    const group: AdeWallRun[] = []
    unvisited.delete(seed.id)

    while (queue.length > 0) {
      const wall = queue.shift()!
      group.push(wall)
      for (const nodeId of [wall.fromNodeId, wall.toNodeId]) {
        for (const neighbour of byNode.get(nodeId) ?? []) {
          if (unvisited.delete(neighbour.id)) queue.push(neighbour)
        }
      }
    }
    groups.push(group.sort((a, b) => a.id.localeCompare(b.id)))
  }

  return groups
}

export const compileWallTopology = (
  plan: AdeArchitecturalPlan,
  options: AdeWallTopologyOptions
): AdeWallTopologyResult => {
  assertValidArchitecturalPlan(plan)
  const nodes = new Map(plan.nodes.map((node) => [node.id, node]))
  const assemblies = new Map(plan.wallAssemblies.map((assembly) => [assembly.id, assembly]))
  const allRects: NumericRect[] = []
  const regions: AdeWallTopologyRegion[] = []

  for (const [groupIndex, walls] of connectedWallGroups(plan.walls).entries()) {
    const strips = walls.map((wall) => {
      const assembly = assemblies.get(wall.assemblyId)
      if (!assembly) throw new Error(`ADE-02 wall ${wall.id} references missing assembly ${wall.assemblyId}.`)
      const thickness = options.resolveAssemblyThicknessMm(assembly)
      assertAdmissibleThickness(assembly, thickness)
      return wallStrip(wall, nodes, thickness)
    })
    const rectangles = [...strips.map((strip) => strip.rect), ...jointRects(strips)]
    allRects.push(...rectangles)
    const rings = traceRings(boundaryEdges(rectangles))
    const sourceIds = [...new Set(walls.flatMap((wall) => wall.provenance.sourceIds))].sort()
    regions.push({
      kind: 'wall-topology-region',
      id: `${plan.id}-WALL-REGION-${groupIndex + 1}`,
      rings: rings.map((ring) => ring.map(([x, y]) => ({ x: mm(x), y: mm(y) }))),
      wallIds: walls.map((wall) => wall.id),
      sourceIds
    })
  }

  return {
    regions,
    sourceRectangles: allRects.map((rect) => ({ x0: mm(rect.x0), y0: mm(rect.y0), x1: mm(rect.x1), y1: mm(rect.y1) }))
  }
}
