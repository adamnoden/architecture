import type { Box2D } from '../p0/model.js'
import type { AxisOrientation, PlanLineId, RectByLines } from '../plan-slice/model.js'
import type { Millimetres, SquareMillimetres } from '../units.js'

export type StructuralTopologyStatus = 'PASS' | 'REVIEW' | 'FAIL'
export type StructuralLineKind = 'bearing-wall' | 'edge-beam'
export type SpanAxis = 'x' | 'y'
export type StructuralInterruptionKind = 'stair-opening' | 'service-opening'
export type LocalFramingKind = 'local-trimmer-system' | 'engineered-opening-trimmer'

export interface FoundationDestinationSource {
  id: string
  kind: 'site-designed-foundations'
  provisional: boolean
}

export interface StructuralLineSource {
  id: string
  kind: StructuralLineKind
  orientation: AxisOrientation
  at: PlanLineId
  from: PlanLineId
  to: PlanLineId
  protected: boolean
  provisional: boolean
  foundationDestinationId?: string
  supportedByPathIds?: [string, string]
}

export interface SupportPathSource {
  id: string
  orientation: AxisOrientation
  at: PlanLineId
  from: PlanLineId
  to: PlanLineId
  segmentIds: string[]
  provisional: boolean
}

export interface SpanFieldSource {
  id: string
  levelId: string
  label: string
  rectangles: RectByLines[]
  spanAxis: SpanAxis
  supportPathIds: [string, string]
  provisional: boolean
}

export interface ReactionNodeSource {
  id: string
  x: PlanLineId
  y: PlanLineId
  elementIds: string[]
  protected: boolean
  provisional: boolean
}

export type StructuralInterruptionGeometry =
  | { kind: 'qualitative' }
  | {
      kind: 'approximate-envelope'
      width: Millimetres
      depth: Millimetres
    }

export interface StructuralInterruptionSource {
  id: string
  kind: StructuralInterruptionKind
  hostFieldId: string
  geometry: StructuralInterruptionGeometry
  framingSystemId: string
  protected: boolean
  provisional: boolean
}

export interface LocalFramingSystemSource {
  id: string
  kind: LocalFramingKind
  interruptionId: string
  hostFieldId: string
  provisional: boolean
}

export interface DiaphragmSource {
  id: string
  levelId: string
  fieldIds: string[]
  interruptionIds: string[]
  primaryLayer: 'structural-deck'
  changeableFinishStructural: false
  provisional: boolean
}

export interface StructuralTopologySource {
  fixtureId: string
  planFixtureId: string
  planeLevelId: string
  foundationDestinations: FoundationDestinationSource[]
  lineElements: StructuralLineSource[]
  supportPaths: SupportPathSource[]
  spanFields: SpanFieldSource[]
  reactionNodes: ReactionNodeSource[]
  interruptions: StructuralInterruptionSource[]
  localFramingSystems: LocalFramingSystemSource[]
  diaphragm: DiaphragmSource
}

export interface DerivedStructuralLine {
  id: string
  kind: StructuralLineKind
  orientation: AxisOrientation
  x1: Millimetres
  y1: Millimetres
  x2: Millimetres
  y2: Millimetres
  length: Millimetres
  protected: boolean
  provisional: boolean
  foundationDestinationId?: string
  supportedByPathIds?: [string, string]
}

export interface DerivedSupportPath {
  id: string
  orientation: AxisOrientation
  x1: Millimetres
  y1: Millimetres
  x2: Millimetres
  y2: Millimetres
  length: Millimetres
  segmentIds: string[]
  provisional: boolean
}

export interface DerivedSpanField {
  id: string
  levelId: string
  label: string
  boxes: Box2D[]
  bounds: Box2D
  area: SquareMillimetres
  spanAxis: SpanAxis
  grossSpan: Millimetres
  supportPathIds: [string, string]
  provisional: boolean
}

export interface DerivedReactionNode {
  id: string
  x: Millimetres
  y: Millimetres
  elementIds: string[]
  protected: boolean
  provisional: boolean
}

export interface StructuralTopologyDerived {
  planeLevelId: string
  lineElements: DerivedStructuralLine[]
  supportPaths: DerivedSupportPath[]
  spanFields: DerivedSpanField[]
  reactionNodes: DerivedReactionNode[]
  interruptions: StructuralInterruptionSource[]
  localFramingSystems: LocalFramingSystemSource[]
  diaphragm: DiaphragmSource
  grossFieldArea: SquareMillimetres
}

export interface StructuralTopologyDiagnostic {
  code: string
  status: StructuralTopologyStatus
  subjectIds: string[]
  message: string
}

export interface StructuralTopologyCompileResult {
  fixtureId: string
  planFixtureId: string
  status: StructuralTopologyStatus
  derived: StructuralTopologyDerived
  diagnostics: StructuralTopologyDiagnostic[]
}
