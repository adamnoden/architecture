import { BOX_GEOMETRY_EPSILON } from './numeric.js'

export interface Box2D {
  kind: 'box2d'
  x: number
  y: number
  width: number
  height: number
}

export const isValidBox = (box: Box2D): boolean =>
  Number.isFinite(box.x) &&
  Number.isFinite(box.y) &&
  Number.isFinite(box.width) &&
  Number.isFinite(box.height) &&
  box.width > 0 &&
  box.height > 0

export const containsBox = (container: Box2D, child: Box2D): boolean =>
  child.x >= container.x - BOX_GEOMETRY_EPSILON &&
  child.y >= container.y - BOX_GEOMETRY_EPSILON &&
  child.x + child.width <= container.x + container.width + BOX_GEOMETRY_EPSILON &&
  child.y + child.height <= container.y + container.height + BOX_GEOMETRY_EPSILON

export const overlapArea = (a: Box2D, b: Box2D): number => {
  const xOverlap = Math.max(
    0,
    Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
  )
  const yOverlap = Math.max(
    0,
    Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
  )
  return xOverlap * yOverlap
}

const intervalsOverlap = (a0: number, a1: number, b0: number, b1: number): boolean =>
  Math.min(a1, b1) - Math.max(a0, b0) > BOX_GEOMETRY_EPSILON

export const areAdjacent = (a: Box2D, b: Box2D): boolean => {
  const aRight = a.x + a.width
  const bRight = b.x + b.width
  const aTop = a.y + a.height
  const bTop = b.y + b.height

  const verticalEdgeTouch =
    (Math.abs(aRight - b.x) <= BOX_GEOMETRY_EPSILON ||
      Math.abs(bRight - a.x) <= BOX_GEOMETRY_EPSILON) &&
    intervalsOverlap(a.y, aTop, b.y, bTop)

  const horizontalEdgeTouch =
    (Math.abs(aTop - b.y) <= BOX_GEOMETRY_EPSILON ||
      Math.abs(bTop - a.y) <= BOX_GEOMETRY_EPSILON) &&
    intervalsOverlap(a.x, aRight, b.x, bRight)

  return verticalEdgeTouch || horizontalEdgeTouch
}

export const boxesIntersect = (a: Box2D, b: Box2D): boolean => {
  const separated =
    a.x + a.width < b.x - BOX_GEOMETRY_EPSILON ||
    b.x + b.width < a.x - BOX_GEOMETRY_EPSILON ||
    a.y + a.height < b.y - BOX_GEOMETRY_EPSILON ||
    b.y + b.height < a.y - BOX_GEOMETRY_EPSILON

  return !separated
}
