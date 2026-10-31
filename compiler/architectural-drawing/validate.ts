import type {
  AdeArchitecturalPlan,
  AdeDistanceAuthority,
  AdeModelPoint,
  AdeModelSegment,
  AdeProvenance,
  AdeSemanticEntity,
  AdeWallAssemblyLayer
} from './model.js'
import { architecturalPlanEntities } from './model.js'

export interface AdeValidationDiagnostic {
  code: string
  entityId: string
  message: string
}

interface NumericInterval {
  min: number
  max: number
}

const finitePoint = (point: AdeModelPoint): boolean => Number.isFinite(point.x) && Number.isFinite(point.y)
const samePoint = (a: AdeModelPoint, b: AdeModelPoint): boolean => a.x === b.x && a.y === b.y

const validateProvenance = (
  entityId: string,
  provenance: AdeProvenance,
  diagnostics: AdeValidationDiagnostic[]
): void => {
  if (provenance.sourceIds.length === 0 || provenance.sourceIds.some((id) => !id.trim())) {
    diagnostics.push({ code: 'ADE-PROVENANCE-SOURCE', entityId, message: 'Entity requires at least one non-empty source id.' })
  }
}

const validateDistance = (
  entityId: string,
  field: string,
  value: AdeDistanceAuthority,
  diagnostics: AdeValidationDiagnostic[],
  options: { allowZero?: boolean } = {}
): void => {
  const validNumber = (candidate: number): boolean =>
    Number.isFinite(candidate) && (options.allowZero ? candidate >= 0 : candidate > 0)

  switch (value.kind) {
    case 'exact':
    case 'approximate':
      if (!validNumber(value.value)) {
        diagnostics.push({ code: 'ADE-DISTANCE', entityId, message: `${field} ${value.kind} value must be ${options.allowZero ? 'non-negative' : 'positive'} and finite.` })
      }
      return
    case 'range':
      if (!validNumber(value.min) || !validNumber(value.max) || value.max < value.min) {
        diagnostics.push({ code: 'ADE-DISTANCE-RANGE', entityId, message: `${field} range must be finite, ordered and ${options.allowZero ? 'non-negative' : 'positive'}.` })
      }
      return
    case 'qualitative':
      if (!value.relationship.trim()) {
        diagnostics.push({ code: 'ADE-DISTANCE-QUALITATIVE', entityId, message: `${field} qualitative relationship must be non-empty.` })
      }
      return
    case 'unknown':
      return
  }
}

const numericInterval = (value: AdeDistanceAuthority): NumericInterval | undefined => {
  switch (value.kind) {
    case 'exact':
    case 'approximate':
      return Number.isFinite(value.value) ? { min: value.value, max: value.value } : undefined
    case 'range':
      return Number.isFinite(value.min) && Number.isFinite(value.max)
        ? { min: value.min, max: value.max }
        : undefined
    case 'qualitative':
    case 'unknown':
      return undefined
  }
}

const sumLayerIntervals = (layers: readonly AdeWallAssemblyLayer[]): NumericInterval | undefined => {
  const intervals = layers.map((layer) => numericInterval(layer.thickness))
  if (intervals.some((interval) => interval === undefined)) return undefined
  return intervals.reduce<NumericInterval>(
    (sum, interval) => ({ min: sum.min + interval!.min, max: sum.max + interval!.max }),
    { min: 0, max: 0 }
  )
}

const intervalsOverlap = (a: NumericInterval, b: NumericInterval): boolean =>
  a.max >= b.min && b.max >= a.min

const segmentValid = (segment: AdeModelSegment): boolean =>
  finitePoint(segment.a) && finitePoint(segment.b) && !samePoint(segment.a, segment.b)

const runtimeForbiddenPartitionFields = (entity: AdeSemanticEntity): string[] => {
  if (entity.kind !== 'partition-datum') return []
  const record = entity as unknown as Record<string, unknown>
  return ['assemblyId', 'thickness', 'width'].filter((field) => record[field] !== undefined)
}

export const validateArchitecturalPlan = (plan: AdeArchitecturalPlan): AdeValidationDiagnostic[] => {
  const diagnostics: AdeValidationDiagnostic[] = []
  if (!plan.id.trim()) diagnostics.push({ code: 'ADE-PLAN-ID', entityId: plan.id, message: 'Plan id must be non-empty.' })
  if (!plan.sourceId.trim()) diagnostics.push({ code: 'ADE-PLAN-SOURCE', entityId: plan.id, message: 'Plan sourceId must be non-empty.' })

  const entities = architecturalPlanEntities(plan)
  const ids = new Set<string>()
  for (const entity of entities) {
    if (!entity.id.trim()) diagnostics.push({ code: 'ADE-ENTITY-ID', entityId: entity.id, message: 'Semantic entity id must be non-empty.' })
    if (ids.has(entity.id)) diagnostics.push({ code: 'ADE-DUPLICATE-ID', entityId: entity.id, message: `Duplicate semantic entity id ${entity.id}.` })
    ids.add(entity.id)
    validateProvenance(entity.id, entity.provenance, diagnostics)
    for (const field of runtimeForbiddenPartitionFields(entity)) {
      diagnostics.push({ code: 'ADE-PARTITION-PHYSICAL-FIELD', entityId: entity.id, message: `Unresolved partition datum must not carry physical field ${field}.` })
    }
  }

  const nodes = new Map(plan.nodes.map((node) => [node.id, node]))
  for (const node of plan.nodes) {
    if (!finitePoint(node.point)) diagnostics.push({ code: 'ADE-NODE-POINT', entityId: node.id, message: 'Node point must be finite.' })
  }

  const layerIds = new Set<string>()
  const assemblies = new Map(plan.wallAssemblies.map((assembly) => [assembly.id, assembly]))
  for (const assembly of plan.wallAssemblies) {
    validateDistance(assembly.id, 'wall thickness', assembly.thickness, diagnostics)
    if (assembly.layers === undefined) continue

    if (assembly.layers.length === 0) {
      diagnostics.push({ code: 'ADE-ASSEMBLY-LAYERS-EMPTY', entityId: assembly.id, message: 'Layered wall assembly must contain at least one authored layer.' })
      continue
    }

    for (const layer of assembly.layers) {
      if (!layer.id.trim()) diagnostics.push({ code: 'ADE-LAYER-ID', entityId: assembly.id, message: 'Wall assembly layer id must be non-empty.' })
      if (ids.has(layer.id) || layerIds.has(layer.id)) {
        diagnostics.push({ code: 'ADE-DUPLICATE-ID', entityId: layer.id, message: `Duplicate semantic/layer id ${layer.id}.` })
      }
      layerIds.add(layer.id)
      validateProvenance(layer.id, layer.provenance, diagnostics)
      validateDistance(layer.id, 'wall layer thickness', layer.thickness, diagnostics)
    }

    const assemblyInterval = numericInterval(assembly.thickness)
    const layersInterval = sumLayerIntervals(assembly.layers)
    if (assemblyInterval && layersInterval && !intervalsOverlap(assemblyInterval, layersInterval)) {
      diagnostics.push({
        code: 'ADE-ASSEMBLY-LAYER-SUM',
        entityId: assembly.id,
        message: `Layer thickness family ${layersInterval.min}–${layersInterval.max} mm cannot produce authored overall wall thickness ${assemblyInterval.min}–${assemblyInterval.max} mm.`
      })
    }
  }

  const walls = new Map(plan.walls.map((wall) => [wall.id, wall]))
  for (const wall of plan.walls) {
    const from = nodes.get(wall.fromNodeId)
    const to = nodes.get(wall.toNodeId)
    const assembly = assemblies.get(wall.assemblyId)
    if (!from) diagnostics.push({ code: 'ADE-WALL-NODE', entityId: wall.id, message: `Wall references missing from-node ${wall.fromNodeId}.` })
    if (!to) diagnostics.push({ code: 'ADE-WALL-NODE', entityId: wall.id, message: `Wall references missing to-node ${wall.toNodeId}.` })
    if (from && to && samePoint(from.point, to.point)) diagnostics.push({ code: 'ADE-WALL-ZERO', entityId: wall.id, message: 'Wall run must have non-zero model-space length.' })
    if (!assembly) {
      diagnostics.push({ code: 'ADE-WALL-ASSEMBLY', entityId: wall.id, message: `Physical wall requires known assembly ${wall.assemblyId}.` })
    } else if (assembly.layers?.length) {
      if (!wall.assemblyStartFace) {
        diagnostics.push({
          code: 'ADE-WALL-LAYER-ORIENTATION',
          entityId: wall.id,
          message: `Wall using layered assembly ${assembly.id} must state which physical face starts the ordered layer sequence.`
        })
      }
    } else if (wall.assemblyStartFace) {
      diagnostics.push({
        code: 'ADE-WALL-LAYER-ORIENTATION-UNUSED',
        entityId: wall.id,
        message: `Wall sets assemblyStartFace but assembly ${assembly.id} has no authored layers.`
      })
    }
  }

  for(const f of plan.fittings ?? [])if(!finitePoint(f.origin)||!Number.isFinite(f.width)||!Number.isFinite(f.depth)||f.width<=0||f.depth<=0||!['wc','basin','storage','desk'].includes(f.role))diagnostics.push({code:'ADE-FITTING-GEOMETRY',entityId:f.id,message:'Fitting requires a supported role and positive finite envelope.'})
  for (const opening of plan.openings) {
    const host = walls.get(opening.hostWallId)
    if (!host) diagnostics.push({ code: 'ADE-OPENING-HOST', entityId: opening.id, message: `Opening references missing physical host wall ${opening.hostWallId}.` })
    validateDistance(opening.id, 'opening centre offset', opening.centreOffset, diagnostics, { allowZero: true })
    validateDistance(opening.id, 'opening width', opening.width, diagnostics)
    if(opening.symbol?.kind==='door' && (![1,2].includes(opening.symbol.leaves) || !['left','right'].includes(opening.symbol.swingSide) || (opening.symbol.hingeEnd !== undefined && (opening.symbol.leaves!==1 || !['low','high'].includes(opening.symbol.hingeEnd))))) diagnostics.push({code:'ADE-OPENING-SYMBOL',entityId:opening.id,message:'Door handing and leaf count must be explicit supported values; hinge end applies only to a single leaf.'})
    if (opening.symbol && (opening.role !== opening.symbol.kind || !['exact','approximate'].includes(opening.width.kind) || !['exact','approximate'].includes(opening.centreOffset.kind))) diagnostics.push({code:'ADE-OPENING-SYMBOL',entityId:opening.id,message:'Architectural symbol requires matching role and authored nominal position/width.'})
  }

  for (const datum of plan.partitionDatums) {
    const from = nodes.get(datum.fromNodeId)
    const to = nodes.get(datum.toNodeId)
    if (!from) diagnostics.push({ code: 'ADE-PARTITION-NODE', entityId: datum.id, message: `Partition datum references missing from-node ${datum.fromNodeId}.` })
    if (!to) diagnostics.push({ code: 'ADE-PARTITION-NODE', entityId: datum.id, message: `Partition datum references missing to-node ${datum.toNodeId}.` })
    if (from && to && samePoint(from.point, to.point)) diagnostics.push({ code: 'ADE-PARTITION-ZERO', entityId: datum.id, message: 'Partition datum must have non-zero model-space length.' })
  }

  const spaces = new Set(plan.spaces.map((space) => space.id))
  for (const space of plan.spaces) {
    if (!space.label.trim()) diagnostics.push({ code: 'ADE-SPACE-LABEL', entityId: space.id, message: 'Space label must be non-empty.' })
  }

  for (const adjacency of plan.adjacencies) {
    const [a, b] = adjacency.between
    if (a === b) diagnostics.push({ code: 'ADE-ADJACENCY-SELF', entityId: adjacency.id, message: 'Adjacency must connect two different spaces.' })
    if (!spaces.has(a)) diagnostics.push({ code: 'ADE-ADJACENCY-SPACE', entityId: adjacency.id, message: `Adjacency references missing space ${a}.` })
    if (!spaces.has(b)) diagnostics.push({ code: 'ADE-ADJACENCY-SPACE', entityId: adjacency.id, message: `Adjacency references missing space ${b}.` })
    for (const segment of adjacency.candidateSegments) {
      if (!segmentValid(segment)) diagnostics.push({ code: 'ADE-ADJACENCY-SEGMENT', entityId: adjacency.id, message: 'Adjacency candidate segment must be finite and non-zero.' })
    }
  }

  for (const dimension of plan.dimensions) {
    if (!finitePoint(dimension.a) || !finitePoint(dimension.b) || samePoint(dimension.a, dimension.b)) {
      diagnostics.push({ code: 'ADE-DIMENSION-GEOMETRY', entityId: dimension.id, message: 'Dimension endpoints must be finite and distinct.' })
    }
  }

  for (const stair of plan.stairs ?? []) {
    if (!finitePoint(stair.origin) || !Number.isInteger(stair.riserCount) || stair.riserCount < 4 || stair.riserCount % 2 !== 0 ||
      ![stair.floorToFloor, stair.going, stair.clearWidth, stair.landingDepth, stair.wellGap, stair.cutHeight].every((n)=>Number.isFinite(n)&&n>0) || stair.landingDepth < stair.clearWidth || stair.cutHeight <= stair.floorToFloor/stair.riserCount || stair.cutHeight >= stair.floorToFloor/2) {
      diagnostics.push({code:'ADE-STAIR-GEOMETRY',entityId:stair.id,message:'Return stair requires an even rise count, positive geometry, full-width intermediate landing and a cut within the lower flight.'})
    }
  }

  const targetIds = new Set([...ids, ...layerIds])
  for (const label of plan.labels) {
    if (!label.text.trim()) diagnostics.push({ code: 'ADE-LABEL-TEXT', entityId: label.id, message: 'Label text must be non-empty.' })
    if (!finitePoint(label.anchor)) diagnostics.push({ code: 'ADE-LABEL-ANCHOR', entityId: label.id, message: 'Label anchor must be finite.' })
    if (label.targetId && !targetIds.has(label.targetId)) diagnostics.push({ code: 'ADE-LABEL-TARGET', entityId: label.id, message: `Label references missing target ${label.targetId}.` })
  }

  return diagnostics
}

export const assertValidArchitecturalPlan = (plan: AdeArchitecturalPlan): void => {
  const diagnostics = validateArchitecturalPlan(plan)
  if (diagnostics.length === 0) return
  throw new Error(`Invalid ADE architectural plan:\n${diagnostics.map((item) => `${item.code} ${item.entityId}: ${item.message}`).join('\n')}`)
}
