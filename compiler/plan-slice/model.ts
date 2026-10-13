import type { Box2D } from '../core/geometry.js'
import type { Millimetres, SquareMillimetres } from '../units.js'

export type PlanSliceStatus = 'PASS' | 'REVIEW' | 'FAIL'
export type PlanSpaceKind = 'room' | 'circulation'
export type PlanBoundaryKind = 'outer' | 'courtyard' | 'void' | 'internal-planning'
export type AxisOrientation = 'vertical' | 'horizontal'
export type PlanLineId = string

export interface ApproximateDimension {
  kind: 'approximate'
  value: Millimetres
}

export interface RangeDimension {
  kind: 'range'
  min: Millimetres
  max: Millimetres
}

export interface UnknownDimension {
  kind: 'unknown'
}

export type DimensionAuthority = ApproximateDimension | RangeDimension | UnknownDimension

export interface PlanLevelSource {
  id: string
  datum: Millimetres
}

export interface PlanLineSource {
  id: PlanLineId
  coordinate: Millimetres
  provisional: boolean
}

export interface RectByLines {
  x0: PlanLineId
  x1: PlanLineId
  y0: PlanLineId
  y1: PlanLineId
}

export interface PlanRegionSource {
  id: string
  levelId: string
  rectangles: RectByLines[]
  provisional: boolean
}

export interface PlanSpaceSource extends PlanRegionSource {
  kind: PlanSpaceKind
  label: string
}

export interface PlanBoundarySource {
  id: string
  levelId: string
  kind: PlanBoundaryKind
  orientation: AxisOrientation
  at: PlanLineId
  from: PlanLineId
  to: PlanLineId
  provisional: boolean
}

export interface RequiredAdjacency {
  id: string
  levelId: string
  a: string
  b: string
}

export interface OpeningVerticalFamily {
  sill?: DimensionAuthority
  head?: DimensionAuthority
}

export interface OpeningFamilySource {
  id: string
  width: DimensionAuthority
  vertical: OpeningVerticalFamily
  provisional: boolean
}

export type OpeningPlacement =
  | { kind: 'boundary-centred' }
  | { kind: 'at-coordinate'; coordinate: Millimetres; semanticKind?: string }
  | { kind: 'qualitative-only'; order: string; semanticKind?: string }

export interface OpeningSource {
  id: string
  levelId: string
  hostBoundaryId: string
  role: 'window' | 'entrance' | 'major-opening'
  familyId: string
  spaceIds: string[]
  widthOverride?: DimensionAuthority
  placement: OpeningPlacement
  provisional: boolean
}

export interface QualitativeOpeningRelationship {
  id: string
  levelId: string
  hostBoundaryId: string
  relationship: string
  spaceIds?: string[]
  provisional: boolean
}

export interface PlanSliceSource {
  fixtureId: string
  shell: {
    id: string
    width: Millimetres
    depth: Millimetres
  }
  levels: PlanLevelSource[]
  planLines: PlanLineSource[]
  voids: PlanRegionSource[]
  spaces: PlanSpaceSource[]
  boundaries: PlanBoundarySource[]
  requiredAdjacencies: RequiredAdjacency[]
  openingFamilies: OpeningFamilySource[]
  openings: OpeningSource[]
  qualitativeOpeningRelationships: QualitativeOpeningRelationship[]
}

export interface DerivedPlanLine extends PlanLineSource {}

export interface DerivedRegion {
  id: string
  levelId: string
  boxes: Box2D[]
  area: SquareMillimetres
  bounds: Box2D
  provisional: boolean
}

export interface DerivedSpace extends DerivedRegion {
  kind: PlanSpaceKind
  label: string
}

export interface DerivedBoundary {
  id: string
  levelId: string
  kind: PlanBoundaryKind
  orientation: AxisOrientation
  x1: Millimetres
  y1: Millimetres
  x2: Millimetres
  y2: Millimetres
  length: Millimetres
  provisional: boolean
}

export interface WidthResult {
  kind: 'approximate' | 'range' | 'unknown'
  value?: Millimetres
  min?: Millimetres
  max?: Millimetres
}

export interface AreaResult {
  kind: 'approximate' | 'range' | 'unknown'
  value?: SquareMillimetres
  min?: SquareMillimetres
  max?: SquareMillimetres
}

export interface DerivedOpening {
  id: string
  levelId: string
  hostBoundaryId: string
  spaceIds: string[]
  role: OpeningSource['role']
  placementKind: string
  centre?: Millimetres
  width: WidthResult
  sillElevation?: WidthResult
  headElevation?: WidthResult
  area: AreaResult
  provisional: boolean
}

export interface PlanSliceDerived {
  shell: {
    id: string
    width: Millimetres
    depth: Millimetres
    area: SquareMillimetres
  }
  levels: PlanLevelSource[]
  planLines: DerivedPlanLine[]
  voids: DerivedRegion[]
  spaces: DerivedSpace[]
  boundaries: DerivedBoundary[]
  openings: DerivedOpening[]
  plateAreas: Array<{
    levelId: string
    area: SquareMillimetres
  }>
}

export interface PlanSliceDiagnostic {
  code: string
  status: PlanSliceStatus
  subjectIds: string[]
  message: string
}

export interface PlanSliceCompileResult {
  fixtureId: string
  status: PlanSliceStatus
  derived: PlanSliceDerived
  diagnostics: PlanSliceDiagnostic[]
}
