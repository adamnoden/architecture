import type { Box2D } from '../p0/model.js'
import type { Degrees, Millimetres, SquareMillimetres } from './units.js'

export type FreezeDisposition =
  | 'FROZEN_FOR_RH_C1'
  | 'PROVISIONAL_BUT_REPRESENTABLE'

export type SourceAuthorship = 'AUTHORED' | 'AUTHORED_PROVISIONAL'
export type SourceAuthority = 'CONTROLLED' | 'PROVISIONAL'
export type Precision = 'exact' | 'approximate' | 'range' | 'qualitative'

export interface SourceFact<T> {
  id: string
  value: T
  authority: SourceAuthority
  authorship: SourceAuthorship
  disposition: FreezeDisposition
  precision: Precision
}

export type LevelId = 'GROUND' | 'FIRST'
export type SpaceKind = 'room' | 'circulation'
export type BoundaryKind = 'outer' | 'courtyard' | 'internal-planning'
export type AxisOrientation = 'vertical' | 'horizontal'
export type PlanLineId = string

export interface RectByLines {
  x0: PlanLineId
  x1: PlanLineId
  y0: PlanLineId
  y1: PlanLineId
}

export interface SpaceSource {
  id: string
  levelId: LevelId
  kind: SpaceKind
  label: string
  rectangles: RectByLines[]
  disposition: FreezeDisposition
}

export interface BoundarySource {
  id: string
  levelId: LevelId
  kind: BoundaryKind
  orientation: AxisOrientation
  at: PlanLineId
  from: PlanLineId
  to: PlanLineId
  disposition: FreezeDisposition
}

export interface RequiredAdjacency {
  id: string
  levelId: LevelId
  a: string
  b: string
}

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

export interface OpeningVerticalFamily {
  sill?: DimensionAuthority
  head?: DimensionAuthority
}

export interface OpeningFamilySource {
  id: string
  width: DimensionAuthority
  vertical: OpeningVerticalFamily
  disposition: FreezeDisposition
}

export type OpeningPlacement =
  | { kind: 'front-bay'; bayIndex: number }
  | { kind: 'entrance-bay' }
  | { kind: 'boundary-centred' }
  | { kind: 'qualitative-only'; order: string }

export interface OpeningSource {
  id: string
  levelId: LevelId
  hostBoundaryId: string
  role: 'window' | 'entrance' | 'major-opening'
  familyId: string
  spaceIds: string[]
  widthOverride?: DimensionAuthority
  placement: OpeningPlacement
  disposition: FreezeDisposition
}

export interface ReferenceHouseSource<CourtPlacement extends 'centred-in-shell' | 'offset-from-shell-centre' = 'centred-in-shell'> {
  fixtureId: 'RH-C1-REFERENCE-HOUSE'
  coordinateConvention: SourceFact<{
    origin: 'south-west-outer-corner'
    xPositive: 'east'
    yPositive: 'north'
    front: 'south'
  }>
  shell: {
    id: string
    width: SourceFact<Millimetres>
    depth: SourceFact<Millimetres>
  }
  court: SourceFact<{
    id: string
    width: Millimetres
    depth: Millimetres
    placement: CourtPlacement
    /** Positive northward offset; required only for the explicit offset placement. */
    offsetY?: Millimetres
  }>
  partitions: {
    serviceSouthY?: SourceFact<Millimetres>
    serviceNorthY?: SourceFact<Millimetres>
    pantrySouthY?: SourceFact<Millimetres>
    groundStudyNorthY?: SourceFact<Millimetres>
    groundGuestSplitY?: SourceFact<Millimetres>
    westRoomSplitY: SourceFact<Millimetres>
    frontHallWestX: SourceFact<Millimetres>
    galleryServiceX: SourceFact<Millimetres>
    upperNorthSplitY: SourceFact<Millimetres>
    upperDrySplitX: SourceFact<Millimetres>
    upperSouthLandingTurnDepth: SourceFact<Millimetres>
  }
  levels: {
    groundFfl: SourceFact<Millimetres>
    groundCeiling: SourceFact<Millimetres>
    firstFfl: SourceFact<Millimetres>
    upperCeiling: SourceFact<Millimetres>
    corniceControl: SourceFact<Millimetres>
  }
  stair: {
    riseTopology: SourceFact<{ riserCount: number; flightRiseGroups: number[] }>
    goingTopology: SourceFact<{ going: Millimetres; goingsPerFlight: number }>
    clearWidthTarget: SourceFact<Millimetres>
    reservation: SourceFact<{ min: Millimetres; max: Millimetres }>
  }
  frontField: SourceFact<{
    count: number
    spacing: Millimetres
    centredOnShell: true
  }>
  entranceBay: SourceFact<{ bayIndex: number }>
  wallPlanning: {
    normalRange: SourceFact<{ min: Millimetres; max: Millimetres }>
    stressThickness: SourceFact<Millimetres>
  }
  roof: SourceFact<{
    topology: 'four-low-slope-fields'
    drainageDirection: 'outward' | 'inward'
    screeningFallDenominator: number
    outerEdgeControl: Millimetres
  }>
  spaces: SpaceSource[]
  boundaries: BoundarySource[]
  requiredAdjacencies: RequiredAdjacency[]
  openingFamilies: OpeningFamilySource[]
  openings: OpeningSource[]
  qualitativeOpeningRelationships: Array<{
    id: string
    levelId: LevelId
    hostBoundaryId: string
    relationship: string
    spaceIds?: string[]
    disposition: FreezeDisposition
  }>
}

/** Explicit successor input; the historical factory retains its centred court contract. */
export type ReferenceHouseCoordinationSource = ReferenceHouseSource<'centred-in-shell' | 'offset-from-shell-centre'>

export interface DerivedPlanLine {
  id: PlanLineId
  coordinate: Millimetres
  provisional: boolean
}

export interface DerivedSpace {
  id: string
  levelId: LevelId
  kind: SpaceKind
  label: string
  boxes: Box2D[]
  area: SquareMillimetres
  bounds: Box2D
  provisional: boolean
}

export interface DerivedBoundary {
  id: string
  levelId: LevelId
  kind: BoundaryKind
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
  levelId: LevelId
  hostBoundaryId: string
  spaceIds: string[]
  role: OpeningSource['role']
  placementKind: OpeningPlacement['kind']
  centre?: Millimetres
  width: WidthResult
  sillElevation?: WidthResult
  headElevation?: WidthResult
  area: AreaResult
  provisional: boolean
}

export interface DerivedStair {
  riserCount: number
  flightRiseGroups: number[]
  rise: Millimetres
  going: Millimetres
  goingsPerFlight: number
  flightRun: Millimetres
  landingDatums: Millimetres[]
  twoRPlusG: Millimetres
  pitch: Degrees
}

export interface DerivedLevels {
  groundFfl: Millimetres
  groundCeiling: Millimetres
  firstFfl: Millimetres
  interStoreyGap: Millimetres
  upperCeiling: Millimetres
  upperClearHeight: Millimetres
  corniceControl: Millimetres
}

export interface DerivedWallPlanning {
  normalRange: { min: Millimetres; max: Millimetres }
  stressThickness: Millimetres
  clearAtNormalMax: { sideRing: Millimetres; frontRearRing: Millimetres }
  clearAtStress: { sideRing: Millimetres; frontRearRing: Millimetres }
}

export interface DerivedRoofSection {
  direction: 'outward' | 'inward'
  outerEdgeControl: Millimetres
  courtSideEdge: Millimetres
  fallAcrossFrontRearRing: Millimetres
}

export interface ReferenceHouseDerived {
  shell: {
    id: string
    width: Millimetres
    depth: Millimetres
    centreX: Millimetres
    centreY: Millimetres
    area: SquareMillimetres
  }
  court: {
    id: string
    width: Millimetres
    depth: Millimetres
    x0: Millimetres
    x1: Millimetres
    y0: Millimetres
    y1: Millimetres
    area: SquareMillimetres
  }
  ring: {
    west: Millimetres
    east: Millimetres
    south: Millimetres
    north: Millimetres
  }
  enclosedPlateArea: SquareMillimetres
  planLines: DerivedPlanLine[]
  levels: DerivedLevels
  stair: DerivedStair
  frontAxes: Millimetres[]
  entranceCentre: Millimetres
  spaces: DerivedSpace[]
  boundaries: DerivedBoundary[]
  openings: DerivedOpening[]
  wallPlanning: DerivedWallPlanning
  roofSection: DerivedRoofSection
}

export type RhCompileStatus = 'PASS' | 'REVIEW' | 'FAIL'

export interface RhDiagnostic {
  code: string
  status: RhCompileStatus
  subjectIds: string[]
  message: string
}

export interface ReferenceHouseCompileResult {
  fixtureId: ReferenceHouseSource['fixtureId']
  status: RhCompileStatus
  derived: ReferenceHouseDerived
  diagnostics: RhDiagnostic[]
}
