import type { Millimetres } from '../units.js'

export type AdeAuthority = 'controlled' | 'provisional'
export type AdePrecision = 'exact' | 'approximate' | 'range' | 'qualitative' | 'unknown'

export interface AdeProvenance {
  sourceIds: readonly string[]
  authority: AdeAuthority
  precision: AdePrecision
}

export interface AdeModelPoint {
  x: Millimetres
  y: Millimetres
}

export interface AdeModelSegment {
  a: AdeModelPoint
  b: AdeModelPoint
}

export type AdeDistanceAuthority =
  | { kind: 'exact'; value: Millimetres }
  | { kind: 'approximate'; value: Millimetres }
  | { kind: 'range'; min: Millimetres; max: Millimetres }
  | { kind: 'qualitative'; relationship: string }
  | { kind: 'unknown' }

export interface AdePlanNode {
  kind: 'node'
  id: string
  point: AdeModelPoint
  provenance: AdeProvenance
}

export type AdeWallLayerRole =
  | 'weathering-leaf'
  | 'cavity-zone'
  | 'structural-leaf'
  | 'finish-zone'
  | 'other'

export interface AdeWallAssemblyLayer {
  id: string
  role: AdeWallLayerRole
  thickness: AdeDistanceAuthority
  provenance: AdeProvenance
}

export interface AdeWallAssembly {
  kind: 'wall-assembly'
  id: string
  thickness: AdeDistanceAuthority
  /** Ordered source-owned layers. Omit for monolithic/unresolved assemblies. */
  layers?: readonly AdeWallAssemblyLayer[]
  provenance: AdeProvenance
}

/**
 * The reference line is architectural/model-space geometry, not a paper-space
 * wall edge. `left-face` and `right-face` are defined looking from `fromNodeId`
 * toward `toNodeId`.
 */
export type AdeWallReference = 'centreline' | 'left-face' | 'right-face'

/**
 * For a layered assembly, identifies which physical face the ordered layer list
 * starts from. This is architectural orientation, not renderer z-order.
 */
export type AdeAssemblyStartFace = 'left-face' | 'right-face'

export interface AdeWallRun {
  kind: 'wall'
  id: string
  fromNodeId: string
  toNodeId: string
  reference: AdeWallReference
  assemblyId: string
  assemblyStartFace?: AdeAssemblyStartFace
  provenance: AdeProvenance
}

export type AdeOpeningRole = 'window' | 'door' | 'major-opening' | 'other'

/**
 * Opening position is measured from the host wall's `fromNodeId` along its
 * reference line. A qualitative/unknown position deliberately carries no
 * plausible coordinate.
 */
export interface AdeOpening {
  kind: 'opening'
  id: string
  hostWallId: string
  role: AdeOpeningRole
  centreOffset: AdeDistanceAuthority
  width: AdeDistanceAuthority
  provenance: AdeProvenance
}

/**
 * An unresolved partition datum is explicitly not a physical wall. It has no
 * assembly or thickness. Once architecture selects a real partition family it
 * becomes an ordinary AdeWallRun using an owned AdeWallAssembly.
 */
export interface AdePartitionDatum {
  kind: 'partition-datum'
  id: string
  fromNodeId: string
  toNodeId: string
  provenance: AdeProvenance
}

export interface AdeSpaceRef {
  kind: 'space'
  id: string
  label: string
  provenance: AdeProvenance
}

/**
 * Required adjacency says two spaces must connect. Candidate segments may
 * bound where that obligation can occur, but they do not choose a door.
 */
export interface AdeAdjacencyObligation {
  kind: 'adjacency'
  id: string
  between: readonly [string, string]
  candidateSegments: readonly AdeModelSegment[]
  provenance: AdeProvenance
}

export interface AdeDimension {
  kind: 'dimension'
  id: string
  a: AdeModelPoint
  b: AdeModelPoint
  label?: string
  provenance: AdeProvenance
}

export type AdeLabelRole = 'space' | 'annotation' | 'marker'

export interface AdePlanLabel {
  kind: 'label'
  id: string
  text: string
  anchor: AdeModelPoint
  role: AdeLabelRole
  targetId?: string
  provenance: AdeProvenance
}

export interface AdeArchitecturalPlan {
  id: string
  sourceId: string
  nodes: readonly AdePlanNode[]
  wallAssemblies: readonly AdeWallAssembly[]
  walls: readonly AdeWallRun[]
  openings: readonly AdeOpening[]
  partitionDatums: readonly AdePartitionDatum[]
  spaces: readonly AdeSpaceRef[]
  adjacencies: readonly AdeAdjacencyObligation[]
  dimensions: readonly AdeDimension[]
  labels: readonly AdePlanLabel[]
}

export type AdeSemanticEntity =
  | AdePlanNode
  | AdeWallAssembly
  | AdeWallRun
  | AdeOpening
  | AdePartitionDatum
  | AdeSpaceRef
  | AdeAdjacencyObligation
  | AdeDimension
  | AdePlanLabel

export const architecturalPlanEntities = (plan: AdeArchitecturalPlan): readonly AdeSemanticEntity[] => [
  ...plan.nodes,
  ...plan.wallAssemblies,
  ...plan.walls,
  ...plan.openings,
  ...plan.partitionDatums,
  ...plan.spaces,
  ...plan.adjacencies,
  ...plan.dimensions,
  ...plan.labels
]
