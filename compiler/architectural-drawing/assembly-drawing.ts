import type { DrawingFillRole, DrawingLineRole, DrawingPath } from '../publication-drawing-v2/model.js'
import type { PlanPaperProjection } from '../publication-drawing/projection.js'
import type { AdeWallAssemblyBandRegion } from './assembly-topology.js'

export const wallAssemblyBandToDrawingPath = (
  band: AdeWallAssemblyBandRegion,
  projection: PlanPaperProjection,
  options: {
    id?: string
    stroke?: DrawingLineRole
    fill?: DrawingFillRole
    metadata?: Record<string, string | number | boolean | undefined>
  } = {}
): DrawingPath => ({
  kind: 'path',
  id: options.id ?? band.id,
  rings: band.rings.map((ring) => ring.map((point) => projection.point(point.x, point.y))),
  stroke: options.stroke,
  fill: options.fill,
  metadata: {
    topology: 'joined-wall-assembly-band',
    assembly: band.assemblyId,
    layer: band.layerId,
    layerRole: band.layerRole,
    wallCount: band.wallIds.length,
    walls: band.wallIds.join(','),
    sources: band.sourceIds.join(','),
    ...options.metadata
  }
})
