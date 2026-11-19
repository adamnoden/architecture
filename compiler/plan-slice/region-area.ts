import { isValidBox } from '../core/geometry.js'
import type { Box2D } from '../core/geometry.js'
import { mm2 } from '../units.js'
import type { SquareMillimetres } from '../units.js'

// Exact rectangle-union decomposition at component x edges; no polygon model or
// coordinate snapping. Existing compilation diagnostics own invalid geometry.
export const regionUnionArea = (boxes: Box2D[]): SquareMillimetres => {
  if (boxes.some((box) => !isValidBox(box))) return mm2(Number.NaN)
  const xs = [...new Set(boxes.flatMap((box) => [box.x, box.x + box.width]))]
    .sort((a, b) => a - b)
  let area = 0
  for (let index = 1; index < xs.length; index += 1) {
    const left = xs[index - 1]
    const right = xs[index]
    const intervals = boxes
      .filter((box) => box.x < right && box.x + box.width > left)
      .map((box) => [box.y, box.y + box.height])
      .sort((a, b) => a[0] - b[0])
    let covered = 0
    let end = Number.NEGATIVE_INFINITY
    for (const [bottom, top] of intervals) {
      covered += Math.max(0, top - Math.max(bottom, end))
      end = Math.max(end, top)
    }
    area += (right - left) * covered
  }
  return mm2(area)
}

export const regionOverlapArea = (a: Box2D[], b: Box2D[]): SquareMillimetres => {
  const intersections: Box2D[] = []
  for (const first of a) {
    for (const second of b) {
      const x = Math.max(first.x, second.x)
      const y = Math.max(first.y, second.y)
      const width = Math.min(first.x + first.width, second.x + second.width) - x
      const height = Math.min(first.y + first.height, second.y + second.height) - y
      if (width > 0 && height > 0) intersections.push({ kind: 'box2d', x, y, width, height })
    }
  }
  return regionUnionArea(intersections)
}
