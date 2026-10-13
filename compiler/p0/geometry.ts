import type { Geometry } from './model.js'

export {
  areAdjacent,
  boxesIntersect,
  containsBox,
  isValidBox,
  overlapArea
} from '../core/geometry.js'

export const isBox2D = (geometry: Geometry | undefined): geometry is Extract<Geometry, { kind: 'box2d' }> =>
  geometry?.kind === 'box2d'
