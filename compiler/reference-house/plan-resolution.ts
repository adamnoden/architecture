import { mm } from '../units.js'
import { groundPlanResolution as previous, createResolvedReferenceHouseSource as previousSource } from './plan-resolution-b3.js'
export { auditCurrentStairReservation } from './plan-resolution-b3.js'
export type { PlanOpeningChoice } from './plan-resolution-b3.js'

/** Provisional architectural successor. B3 remains a recoverable, rejected
 * circulation arrangement; its data is retained only for comparisons. */
export const groundPlanResolution = {
  ...previous,
  id: 'RH-GROUND-PLAN-RESOLUTION-02',
  addPartitions: [...previous.addPartitions,
    { id: 'G-HALL-WEST-RETURN-B', a: [3100, 4100], b: [4200, 4100] }],
  openings: [
    ...previous.openings.map(o => {
      if(o.id === 'G-FRONT-D01') return {...o, hingeEnd: 'high' as const}
      if(o.id === 'G-GARDEN-D01') return {...o, width: 1800}
      if(o.id === 'G-DRAW-HALL-D01') return {...o, centre: 3150}
      if(o.id === 'G-COURT-W-W01') return {...o, centre: 4600, width: 700}
      if(o.id === 'G-COURT-W-W02') return {...o, centre: 6500}
      if(o.id === 'G-COURT-E-W01') return {...o, centre: 5000}
      if(o.id === 'G-COURT-E-W02') return {...o, centre: 6500}
      return o
    }),
    { id: 'G-STUDY-E-W01', hostBoundaryId: 'G-OUTER-EAST', centre: 2000, width: 1200, nominalSillMm: 675, role: 'window' as const, replaces: [] },
    { id: 'G-SERVICE-E-W01', hostBoundaryId: 'G-OUTER-EAST', centre: 4400, width: 900, nominalSillMm: 1500, role: 'window' as const, replaces: [] }
  ],
  stair: {...previous.stair, x: 3250, y: 500}
}

export const createResolvedReferenceHouseSource = () => {
  const s = previousSource()
  s.court = {...s.court, id: 'RHPR-COURT-B4', authority: 'PROVISIONAL', authorship: 'AUTHORED_PROVISIONAL', disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
    value: {...s.court.value, depth: mm(3300), placement: 'offset-from-shell-centre', offsetY: mm(350)}}
  // Hold study/service and bedroom/bathroom geography when the courtyard's
  // south edge moves. This prevents silently taking the gained hall area
  // from service capacity instead of from the explicitly smaller courtyard.
  s.partitions.serviceSouthY = {...s.partitions.westRoomSplitY, id: 'RHPR-SERVICE-SOUTH', value: mm(3400), authority: 'PROVISIONAL', authorship: 'AUTHORED_PROVISIONAL', disposition: 'PROVISIONAL_BUT_REPRESENTABLE'}
  for(const room of s.spaces) {
    if(['G-STUDY-02', 'U-BED-03'].includes(room.id)) for(const r of room.rectangles) if(r.y1 === 'COURT_SOUTH') r.y1 = 'SERVICE_SOUTH'
    if(['G-SVC-02', 'U-BATH-01'].includes(room.id)) for(const r of room.rectangles) if(r.y0 === 'COURT_SOUTH') r.y0 = 'SERVICE_SOUTH'
  }
  return s
}
