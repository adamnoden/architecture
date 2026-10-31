export type DrawingLineRole = 'cut' | 'profile' | 'primary' | 'secondary'
export type DrawingTextRole = 'label' | 'note' | 'marker'
export type DrawingFillRole = 'none' | 'paper' | 'ink' | 'context' | 'faint'
export type DrawingDashRole = 'none' | 'overhead' | 'datum' | 'provisional'
export type DrawingTextAnchor = 'start' | 'middle' | 'end'
export type DrawingScaleDenominator = number | 'NTS'

export interface PaperPoint {
  x: number
  y: number
}

export interface DrawingMetadata {
  [key: string]: string | number | boolean | undefined
}

interface PrimitiveBase {
  id: string
  metadata?: DrawingMetadata
}

export interface DrawingLine extends PrimitiveBase {
  kind: 'line'
  a: PaperPoint
  b: PaperPoint
  role: DrawingLineRole
  dash?: DrawingDashRole
}

export interface DrawingRect extends PrimitiveBase {
  kind: 'rect'
  x: number
  y: number
  width: number
  height: number
  stroke?: DrawingLineRole
  dash?: DrawingDashRole
  fill?: DrawingFillRole
}

export interface DrawingText extends PrimitiveBase {
  kind: 'text'
  x: number
  y: number
  value: string
  role: DrawingTextRole
  anchor?: DrawingTextAnchor
  rotateDeg?: number
}

export type DrawingPrimitive = DrawingLine | DrawingRect | DrawingText

export interface DrawingScene {
  widthMm: number
  heightMm: number
  viewId: string
  title: string
  description: string
  scaleDenominator: DrawingScaleDenominator
  sourceId: string
  primitives: DrawingPrimitive[]
}
