import type { DrawingFillRole, DrawingLineRole, DrawingPath } from '../publication-drawing/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { AdeWallTopologyRegion } from './topology.js'

export const wallTopologyRegionToDrawingPath = (
  region: AdeWallTopologyRegion,
  projection: PlanPaperProjection,
  options: {
    id?: string
    stroke?: DrawingLineRole
    fill?: DrawingFillRole
    metadata?: Record<string, string | number | boolean | undefined>
  } = {}
): DrawingPath => ({
  kind: 'path',
  id: options.id ?? region.id,
  rings: region.rings.map((ring) => ring.map((point) => projection.point(point.x, point.y))),
  stroke: options.stroke ?? 'profile',
  fill: options.fill ?? 'faint',
  metadata: {
    topology: 'joined-wall-region',
    wallCount: region.wallIds.length,
    walls: region.wallIds.join(','),
    sources: region.sourceIds.join(','),
    ...options.metadata
  }
})
