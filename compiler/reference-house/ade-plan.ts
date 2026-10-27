import type { AdeArchitecturalPlan, AdeModelPoint, AdeProvenance, AdeWallAssembly, AdeWallRun } from '../architectural-drawing/model.js'
import { assertValidArchitecturalPlan } from '../architectural-drawing/validate.js'
import { auditReferenceHouseInternalPartitionSource, createReferenceHouseInternalPartitionSource } from './internal-partitions.js'
import type { DerivedBoundary, DerivedSpace, LevelId, ReferenceHouseCompileResult, ReferenceHouseSource } from './model.js'
import { mm } from '../units.js'

const provenance = (sourceIds: string[], provisional = false, precision: AdeProvenance['precision'] = 'exact'): AdeProvenance => ({
  sourceIds, authority: provisional ? 'provisional' : 'controlled', precision
})
const point = (x: number, y: number): AdeModelPoint => ({ x: mm(x), y: mm(y) })

/** RH-10 coordination family, not a tested technical wall specification. */
export const referenceHouseAdeEnvelope = (): AdeWallAssembly => ({
  kind: 'wall-assembly', id: 'RH-ADE-ENVELOPE', thickness: { kind: 'range', min: mm(410), max: mm(435) },
  provenance: provenance(['docs/reference-house/envelope-coordination-rh10.md'], true, 'range'),
  layers: [
    { id: 'RH-ADE-WEATHER', role: 'weathering-leaf', thickness: { kind: 'approximate', value: mm(102.5) }, provenance: provenance(['RH-10'], true, 'approximate') },
    { id: 'RH-ADE-CAVITY', role: 'cavity-zone', thickness: { kind: 'range', min: mm(150), max: mm(175) }, provenance: provenance(['RH-10'], true, 'range') },
    { id: 'RH-ADE-INNER', role: 'structural-leaf', thickness: { kind: 'approximate', value: mm(140) }, provenance: provenance(['RH-10'], true, 'approximate') },
    { id: 'RH-ADE-FINISH', role: 'finish-zone', thickness: { kind: 'approximate', value: mm(15) }, provenance: provenance(['RH-10'], true, 'approximate') }
  ]
})

/** All shared candidate edges, with no midpoint/door selection. Planning boxes stay planning reservations. */
const sharedSegments = (a: DerivedSpace, b: DerivedSpace) => {
  const result = new Map<string, { a: AdeModelPoint; b: AdeModelPoint }>()
  for (const aa of a.boxes) for (const bb of b.boxes) {
    const add = (x0: number, y0: number, x1: number, y1: number) => {
      if (x0 === x1 && y0 === y1) return
      result.set(`${x0},${y0},${x1},${y1}`, { a: point(x0, y0), b: point(x1, y1) })
    }
    if (aa.x + aa.width === bb.x || bb.x + bb.width === aa.x) {
      const lo = Math.max(aa.y, bb.y), hi = Math.min(aa.y + aa.height, bb.y + bb.height)
      const x = aa.x + aa.width === bb.x ? bb.x : aa.x
      if (hi > lo) add(x, lo, x, hi)
    }
    if (aa.y + aa.height === bb.y || bb.y + bb.height === aa.y) {
      const lo = Math.max(aa.x, bb.x), hi = Math.min(aa.x + aa.width, bb.x + bb.width)
      const y = aa.y + aa.height === bb.y ? bb.y : aa.y
      if (hi > lo) add(lo, y, hi, y)
    }
  }
  return [...result.values()]
}

export const createReferenceHouseAdePlan = (result: ReferenceHouseCompileResult, source: ReferenceHouseSource, level: LevelId = 'GROUND'): AdeArchitecturalPlan => {
  if (result.status === 'FAIL') throw new Error('Cannot migrate a failed Reference House compile.')
  const partitionSource = createReferenceHouseInternalPartitionSource()
  const diagnostics = auditReferenceHouseInternalPartitionSource(source, partitionSource)
  if (diagnostics.length) throw new Error(`Invalid partition source: ${JSON.stringify(diagnostics)}`)
  const plan: AdeArchitecturalPlan = {
    id: `RH-ADE-${level}`, sourceId: source.fixtureId, nodes: [], wallAssemblies: [referenceHouseAdeEnvelope(), {
      kind: 'wall-assembly', id: partitionSource.family.id, thickness: partitionSource.family.coordinationThickness,
      provenance: provenance(['compiler/reference-house/internal-partitions.ts', partitionSource.family.id], true, 'range')
    }], walls: [], openings: [], partitionDatums: [], spaces: [], adjacencies: [], dimensions: [], labels: []
  }
  const nodes = new Map<string, AdeArchitecturalPlan['nodes'][number]>()
  const nodeId = (p: AdeModelPoint, sourceId: string, provisional: boolean): string => {
    const id = `${level}-NODE-${p.x}-${p.y}`
    const existing = nodes.get(id)
    const uncertain = provisional || existing?.provenance.authority === 'provisional'
    nodes.set(id, { kind: 'node', id, point: p, provenance: provenance([...new Set([...(existing?.provenance.sourceIds ?? []), sourceId])].sort(), uncertain, uncertain ? 'approximate' : 'exact') })
    return id
  }
  const boundaries = result.derived.boundaries.filter((b) => b.levelId === level)
  const oriented = new Map<string, { a: AdeModelPoint; b: AdeModelPoint }>()
  const orient = (b: DerivedBoundary) => {
    // Material is left of directed run; outside/courtyard weathering face is right.
    const reverse = b.kind === 'outer'
      ? (b.orientation === 'horizontal' ? b.y1 > 0 : b.x1 === 0)
      : b.kind === 'courtyard'
        ? (b.orientation === 'horizontal' ? b.y1 === result.derived.court.y0 : b.x1 === result.derived.court.x1)
        : false
    return reverse ? { a: point(b.x2, b.y2), b: point(b.x1, b.y1) } : { a: point(b.x1, b.y1), b: point(b.x2, b.y2) }
  }
  for (const boundary of boundaries) {
    const segment = orient(boundary)
    oriented.set(boundary.id, segment)
    const physicalPartition = boundary.kind === 'internal-planning'
    // Split partition runs at authored same-family junctions; no geometric guessing of new walls.
    const cuts = physicalPartition ? boundaries.filter((b) => b.kind === 'internal-planning').flatMap((b) => [point(b.x1, b.y1), point(b.x2, b.y2)])
      .filter((p) => boundary.orientation === 'horizontal' ? p.y === segment.a.y && p.x > segment.a.x && p.x < segment.b.x : p.x === segment.a.x && p.y > segment.a.y && p.y < segment.b.y) : []
    const points = [segment.a, ...new Map(cuts.map((p) => [`${p.x},${p.y}`, p])).values(), segment.b]
      .sort((a, b) => boundary.orientation === 'horizontal' ? (segment.b.x - segment.a.x) * (a.x - b.x) : (segment.b.y - segment.a.y) * (a.y - b.y))
    for (let index = 0; index < points.length - 1; index++) {
      const wall: AdeWallRun = { kind: 'wall', id: points.length === 2 ? boundary.id : `${boundary.id}::${index + 1}`,
        fromNodeId: nodeId(points[index], boundary.id, boundary.provisional), toNodeId: nodeId(points[index + 1], boundary.id, boundary.provisional),
        reference: physicalPartition ? 'centreline' : 'right-face', assemblyStartFace: physicalPartition ? undefined : 'right-face',
        assemblyId: physicalPartition ? partitionSource.family.id : 'RH-ADE-ENVELOPE',
        provenance: provenance([boundary.id, ...(physicalPartition ? [partitionSource.family.id] : ['RH-10'])], boundary.provisional) }
      ;(plan.walls as AdeWallRun[]).push(wall)
    }
  }
  plan.nodes = [...nodes.values()]
  const openings = result.derived.openings.filter((o) => o.levelId === level).map((o) => {
    const segment = oriented.get(o.hostBoundaryId)!
    const horizontal = segment.a.y === segment.b.y
    const from = horizontal ? segment.a.x : segment.a.y
    const to = horizontal ? segment.b.x : segment.b.y
    return { kind: 'opening' as const, id: o.id, hostWallId: o.hostBoundaryId,
      role: o.role === 'entrance' ? 'door' as const : o.role,
      centreOffset: o.centre === undefined ? { kind: 'unknown' as const } : { kind: 'approximate' as const, value: mm((o.centre - from) * Math.sign(to - from)) },
      width: o.width.kind === 'range' ? { kind: 'range' as const, min: o.width.min!, max: o.width.max! } : o.width.kind === 'approximate' ? { kind: 'approximate' as const, value: o.width.value! } : { kind: 'unknown' as const }, provenance: provenance([o.id, o.hostBoundaryId], o.provisional, o.width.kind) }
  })
  plan.openings = [...openings, ...source.qualitativeOpeningRelationships.filter((o) => o.levelId === level).map((o) => ({
    kind: 'opening' as const, id: o.id, hostWallId: o.hostBoundaryId, role: 'other' as const,
    centreOffset: { kind: 'qualitative' as const, relationship: o.relationship }, width: { kind: 'unknown' as const },
    provenance: provenance([o.id, o.hostBoundaryId], true, 'qualitative')
  }))]
  const spaces = result.derived.spaces.filter((s) => s.levelId === level)
  plan.spaces = spaces.map((s) => ({ kind: 'space', id: s.id, label: s.label, provenance: provenance([s.id], s.provisional) }))
  plan.adjacencies = source.requiredAdjacencies.filter((a) => a.levelId === level).map((a) => {
    const segments = sharedSegments(spaces.find((s) => s.id === a.a)!, spaces.find((s) => s.id === a.b)!)
    if (!segments.length) throw new Error(`Adjacency ${a.id} has no shared candidate edge.`)
    return { kind: 'adjacency', id: a.id, between: [a.a, a.b], candidateSegments: segments, provenance: provenance([a.id], true, 'qualitative') }
  })
  plan.labels = spaces.map((s) => {
    const box = [...s.boxes].sort((a, b) => b.width * b.height - a.width * a.height)[0]
    return { kind: 'label', id: `${s.id}-label`, targetId: s.id, text: s.id === 'U-DRESS-01' ? 'Dressing / store' : s.label[0].toUpperCase() + s.label.slice(1),
      anchor: point(box.x + box.width / 2, box.y + box.height / 2), role: 'space', provenance: provenance([s.id], s.provisional) }
  })
  const stairSpace = spaces.find((s) => s.id === (level === 'GROUND' ? 'G-HALL-02' : 'U-STAIR-01'))!
  const stairBox = [...stairSpace.boxes].sort((a, b) => b.width * b.height - a.width * a.height)[0]
  plan.labels = [...plan.labels,
    { kind: 'label', id: `${level}-court-label`, text: 'Courtyard', anchor: point((result.derived.court.x0 + result.derived.court.x1) / 2, (result.derived.court.y0 + result.derived.court.y1) / 2), role: 'space', provenance: provenance([source.court.id]) },
    { kind: 'label', id: `${level}-court-size`, text: `${result.derived.court.width} × ${result.derived.court.depth}`, anchor: point((result.derived.court.x0 + result.derived.court.x1) / 2, (result.derived.court.y0 + result.derived.court.y1) / 2), role: 'annotation', provenance: provenance([source.court.id]) },
    { kind: 'label', id: `${level}-stair-note`, text: `${result.derived.stair.riserCount} rises · ${result.derived.stair.flightRiseGroups.join('/')} · going ${result.derived.stair.going}`, anchor: point(stairBox.x + stairBox.width / 2, stairBox.y + stairBox.height / 2), role: 'annotation', provenance: provenance([source.stair.riseTopology.id, source.stair.goingTopology.id]) }
  ]
  plan.dimensions = [
    { kind: 'dimension', id: `${level}-width`, a: point(0, result.derived.shell.depth), b: point(result.derived.shell.width, result.derived.shell.depth), provenance: provenance([source.shell.width.id]) },
    { kind: 'dimension', id: `${level}-depth`, a: point(0, 0), b: point(0, result.derived.shell.depth), provenance: provenance([source.shell.depth.id]) }
  ]
  assertValidArchitecturalPlan(plan)
  return plan
}
