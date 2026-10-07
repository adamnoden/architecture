export type CompileStatus =
  | 'PASS'
  | 'FAIL'
  | 'UNRESOLVED'
  | 'UNSUPPORTED'
  | 'EXTERNALLY_DISCHARGED'

export type EntityType =
  | 'Storey'
  | 'Space'
  | 'Wall'
  | 'Opening'
  | 'ServiceRoute'
  | 'Penetration'
  | 'AccessPath'

export type RelationshipType =
  | 'contains'
  | 'adjacent-to'
  | 'hosts'
  | 'crosses'
  | 'carries'
  | 'requires-access-to'
  | 'accessible-via'

export type BoundaryRole = 'air' | 'weather' | 'thermal' | 'fire' | 'acoustic' | 'moisture'

export interface Box2D {
  kind: 'box2d'
  x: number
  y: number
  width: number
  height: number
}

export interface UnsupportedGeometry {
  kind: 'unsupported'
  description: string
}

export type Geometry = Box2D | UnsupportedGeometry

export interface Entity {
  id: string
  type: EntityType
  levelId?: string
  geometry?: Geometry
  attributes?: Record<string, unknown>
}

export interface Relationship {
  id: string
  type: RelationshipType
  from: string
  to: string
  attributes?: Record<string, unknown>
}

export interface RelationshipPresentRequirement {
  id: string
  kind: 'relationship-present'
  dimension: 'architecture'
  relationshipType: RelationshipType
  from: string
  to: string
  message: string
  provenance?: string
}

export type ProjectRequirement = RelationshipPresentRequirement

export interface CompilerTarget {
  id: string
  version: string
  supportedGeometryKinds: Array<Geometry['kind']>
}

export interface DependencyRef {
  kind: 'entity' | 'relationship' | 'target'
  id: string
  path?: string
}

export interface DependencySnapshot extends DependencyRef {
  value: unknown
}

export type EvidenceResolver = 'product' | 'inspection' | 'external-determination'
export type EvidenceResult = 'pass' | 'fail'

export interface EvidenceRecord {
  id: string
  resolver: EvidenceResolver
  proposition: string
  subjectIds: string[]
  source: {
    name: string
    version: string
  }
  result: EvidenceResult
  obligationKeys: string[]
  dependencies: DependencySnapshot[]
}

export interface SourceModel {
  target: CompilerTarget
  entities: Entity[]
  relationships: Relationship[]
  requirements: ProjectRequirement[]
  evidence: EvidenceRecord[]
}

export type ObligationDimension = 'architecture' | 'technical'
export type ObligationAuthority = 'project' | 'physical' | 'regulatory' | 'product'
export type ObligationResolution = 'machine' | 'evidence'

export interface Obligation {
  key: string
  code: string
  dimension: ObligationDimension
  authority: ObligationAuthority
  resolution: ObligationResolution
  subjectIds: string[]
  message: string
  status: CompileStatus
  evidenceIds: string[]
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export interface Diagnostic {
  code: string
  severity: DiagnosticSeverity
  status: CompileStatus
  subjectIds: string[]
  message: string
}

export interface EvidenceState {
  id: string
  current: boolean
  staleDependencies: string[]
}

export interface CompileValidity {
  model: CompileStatus
  architecture: CompileStatus
  technical: CompileStatus
  evidence: CompileStatus
}

export interface CompileResult {
  target: string
  validity: CompileValidity
  obligations: Obligation[]
  evidence: EvidenceState[]
  diagnostics: Diagnostic[]
}

export const boundaryRolesOf = (entity: Entity): BoundaryRole[] => {
  const value = entity.attributes?.boundaryRoles
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []

  return (Object.entries(value) as Array<[BoundaryRole, unknown]>)
    .filter(([, enabled]) => enabled === true)
    .map(([role]) => role)
    .sort()
}
