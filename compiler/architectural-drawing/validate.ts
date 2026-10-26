import type {
  AdeArchitecturalPlan,
  AdeDistanceAuthority,
  AdeModelPoint,
  AdeModelSegment,
  AdeProvenance,
  AdeSemanticEntity
} from './model.js'
import { architecturalPlanEntities } from './model.js'

export interface AdeValidationDiagnostic {
  code: string
  entityId: string
  message: string
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

  const assemblies = new Map(plan.wallAssemblies.map((assembly) => [assembly.id, assembly]))
  for (const assembly of plan.wallAssemblies) {
    validateDistance(assembly.id, 'wall thickness', assembly.thickness, diagnostics)
  }

  const walls = new Map(plan.walls.map((wall) => [wall.id, wall]))
  for (const wall of plan.walls) {
    const from = nodes.get(wall.fromNodeId)
    const to = nodes.get(wall.toNodeId)
    if (!from) diagnostics.push({ code: 'ADE-WALL-NODE', entityId: wall.id, message: `Wall references missing from-node ${wall.fromNodeId}.` })
    if (!to) diagnostics.push({ code: 'ADE-WALL-NODE', entityId: wall.id, message: `Wall references missing to-node ${wall.toNodeId}.` })
    if (from && to && samePoint(from.point, to.point)) diagnostics.push({ code: 'ADE-WALL-ZERO', entityId: wall.id, message: 'Wall run must have non-zero model-space length.' })
    if (!assemblies.has(wall.assemblyId)) diagnostics.push({ code: 'ADE-WALL-ASSEMBLY', entityId: wall.id, message: `Physical wall requires known assembly ${wall.assemblyId}.` })
  }

  for (const opening of plan.openings) {
    const host = walls.get(opening.hostWallId)
    if (!host) diagnostics.push({ code: 'ADE-OPENING-HOST', entityId: opening.id, message: `Opening references missing physical host wall ${opening.hostWallId}.` })
    validateDistance(opening.id, 'opening centre offset', opening.centreOffset, diagnostics, { allowZero: true })
    validateDistance(opening.id, 'opening width', opening.width, diagnostics)
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

  const targetIds = new Set(entities.filter((entity) => entity.kind !== 'label').map((entity) => entity.id))
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
