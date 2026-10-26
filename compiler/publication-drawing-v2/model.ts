import type {
  DrawingDashRole,
  DrawingFillRole,
  DrawingLineRole,
  DrawingPrimitive,
  DrawingScene,
  PaperPoint
} from '../publication-drawing/model.js'

export type {
  DrawingDashRole,
  DrawingFillRole,
  DrawingLine,
  DrawingLineRole,
  DrawingRect,
  DrawingScene,
  DrawingText,
  DrawingTextRole,
  PaperPoint
} from '../publication-drawing/model.js'

/**
 * V2 adds only the terminal vector capability earned by ADE-02: a joined
 * region may contain one outer ring plus interior holes. Architectural meaning
 * remains upstream in ADE; this primitive knows only paper-space geometry.
 */
export interface DrawingPath {
  kind: 'path'
  id: string
  rings: readonly (readonly PaperPoint[])[]
  stroke?: DrawingLineRole
  dash?: DrawingDashRole
  fill?: DrawingFillRole
  metadata?: Record<string, string | number | boolean | undefined>
}

export type DrawingPrimitiveV2 = DrawingPrimitive | DrawingPath

export interface DrawingSceneV2 extends Omit<DrawingScene, 'primitives'> {
  primitives: DrawingPrimitiveV2[]
}
