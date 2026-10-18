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

export interface SectionPaperProjection {
  scaleDenominator: number
  point: (horizontal: number, elevation: number) => PaperPoint
  rect: (box: ModelRect) => PaperRect
  length: (modelMillimetres: number) => number
}

const requirePositiveScale = (scaleDenominator: number): void => {
  if (!Number.isFinite(scaleDenominator) || scaleDenominator <= 0) {
    throw new Error(`Invalid drawing scale denominator: ${scaleDenominator}`)
  }
}

export const createPlanPaperProjection = (options: {
  scaleDenominator: number
  modelBounds: ModelRect
  paperOrigin: PaperPoint
}): PlanPaperProjection => {
  const { scaleDenominator, modelBounds, paperOrigin } = options

  requirePositiveScale(scaleDenominator)
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

/**
 * Orthographic architectural-section projection in physical paper space.
 * The horizontal model coordinate increases left-to-right; elevation increases
 * upward while SVG Y increases downward. No perspective or fit-to-box scaling
 * is permitted.
 */
export const createSectionPaperProjection = (options: {
  scaleDenominator: number
  horizontalBounds: { min: number; max: number }
  verticalBounds: { min: number; max: number }
  paperOrigin: PaperPoint
}): SectionPaperProjection => {
  const { scaleDenominator, horizontalBounds, verticalBounds, paperOrigin } = options

  requirePositiveScale(scaleDenominator)
  if (horizontalBounds.max <= horizontalBounds.min || verticalBounds.max <= verticalBounds.min) {
    throw new Error('Section projection requires positive horizontal and vertical bounds.')
  }

  const length = (modelMillimetres: number): number => modelMillimetres / scaleDenominator
  const point = (horizontal: number, elevation: number): PaperPoint => ({
    x: paperOrigin.x + length(horizontal - horizontalBounds.min),
    y: paperOrigin.y + length(verticalBounds.max - elevation)
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
