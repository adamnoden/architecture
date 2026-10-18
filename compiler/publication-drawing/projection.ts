import type { PaperPoint } from './model.js'

export interface ModelRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PaperRect {
  x: number
  y: number
  width: number
  height: number
}

export interface PlanPaperProjection {
  scaleDenominator: number
  point: (x: number, y: number) => PaperPoint
  rect: (box: ModelRect) => PaperRect
  length: (modelMillimetres: number) => number
}

export const createPlanPaperProjection = (options: {
  scaleDenominator: number
  modelBounds: ModelRect
  paperOrigin: PaperPoint
}): PlanPaperProjection => {
  const { scaleDenominator, modelBounds, paperOrigin } = options

  if (!Number.isFinite(scaleDenominator) || scaleDenominator <= 0) {
    throw new Error(`Invalid drawing scale denominator: ${scaleDenominator}`)
  }
  if (modelBounds.width <= 0 || modelBounds.height <= 0) {
    throw new Error('Plan projection requires positive model bounds.')
  }

  const length = (modelMillimetres: number): number => modelMillimetres / scaleDenominator
  const point = (x: number, y: number): PaperPoint => ({
    x: paperOrigin.x + length(x - modelBounds.x),
    // Architectural plan convention: model +Y is drawn upward while SVG +Y is downward.
    y: paperOrigin.y + length(modelBounds.y + modelBounds.height - y)
  })

  return {
    scaleDenominator,
    point,
    length,
    rect: (box) => {
      const topLeft = point(box.x, box.y + box.height)
      return {
        x: topLeft.x,
        y: topLeft.y,
        width: length(box.width),
        height: length(box.height)
      }
    }
  }
}
