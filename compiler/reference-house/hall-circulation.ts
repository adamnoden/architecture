import type { ReferenceHouseCoordinationSource } from './model.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import type { groundPlanResolution } from './plan-resolution.js'

/** Bounded occupied-space check, not a navigation or compliance solver. The
 * chosen routes pass outside the FULL stair envelope: no under-flight
 * headroom assumption is used to rescue the drawing-room or courtyard door.
 * Fabric allowances must match the represented ADE assemblies. */
export const auditResolvedHallCirculation = (source: ReferenceHouseCoordinationSource, choice: Pick<typeof groundPlanResolution, 'stair' | 'openings'>) => {
  const court = referenceHouseCourtGeometry(source), s = choice.stair
  const envelope = 417.5, halfPartition = 62.5, routeWidth = 1000
  const stair = {x0:s.x-50, x1:s.x+s.footprintWidth+50, y0:s.y-50, y1:s.y+s.footprintDepth+50}
  const crossHall = {x0:source.partitions.frontHallWestX.value+halfPartition, x1:source.partitions.galleryServiceX.value-halfPartition,
    y0:stair.y1, y1:court.y0-envelope}
  const arrival = {x0:stair.x1, x1:stair.x1+routeWidth, y0:s.y, y1:crossHall.y0+routeWidth}
  const drawing = choice.openings.find(o=>o.id==='G-DRAW-HALL-D01')!
  const courtyard = choice.openings.find(o=>o.id==='G-COURT-SOUTH-O01')!
  const entrance = choice.openings.find(o=>o.id==='G-FRONT-D01')!
  const checks = {
    stairInsideHall: stair.x0 >= crossHall.x0 && stair.y0 >= envelope && stair.y1 <= crossHall.y1,
    crossHallWidth: crossHall.y1-crossHall.y0 >= routeWidth,
    // 900 mm nominal door receives a 1000 mm wide occupied approach field.
    drawingApproach: drawing.centre-routeWidth/2 >= crossHall.y0 && drawing.centre+routeWidth/2 <= crossHall.y1,
    courtyardApproach: courtyard.centre-courtyard.width/2 >= crossHall.x0 && courtyard.centre+courtyard.width/2 <= crossHall.x1,
    arrivalOutsideStair: arrival.x1 <= court.x1-halfPartition,
    entranceOpenLeafOutsideArrival: 'hingeEnd' in entrance && entrance.hingeEnd==='high' && entrance.centre+entrance.width/2 >= arrival.x1,
    entranceSweepOutsideStair: entrance.centre-entrance.width/2 >= stair.x1,
    upperTurnConnection: crossHall.y0 >= court.y0-source.partitions.upperSouthLandingTurnDepth.value+halfPartition,
    eastGalleryWidth: source.partitions.galleryServiceX.value-halfPartition-(court.x1+envelope) >= routeWidth
  }
  return {pass:Object.values(checks).every(Boolean), checks, stair, crossHall, arrival,
    clearCrossHallMm:crossHall.y1-crossHall.y0, routeWidthMm:routeWidth,
    groundRouteCeilingMm:source.levels.groundCeiling.value-source.levels.groundFfl.value,
    underFlightRouteUsed:false, stairHeadroomProved:false}
}
