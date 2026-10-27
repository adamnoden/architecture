import { createReferenceHouseSource } from './fixture.js'
import { mm } from '../units.js'

/**
 * Authored architectural choices succeeding the deliberately incomplete C1
 * plan boundary. Values are provisional coordination nominals, not measured
 * facts, clear finished sizes, construction details or performance evidence.
 * Historical B3 comparison data; superseded by plan-resolution.ts.
 * Owning decision: docs/reference-house/ground-plan-resolution.md.
 */
export interface PlanOpeningChoice {
  id: string
  hostBoundaryId: string
  /** Global model coordinate along the host (X for horizontal, Y for vertical). */
  centre: number
  width: number
  role: 'window' | 'door'
  leaves?: 1 | 2
  swingSide?: 'left' | 'right'
  hingeEnd?: 'low' | 'high'
  nominalSillMm?: number
  replaces: readonly string[]
}
export const groundPlanResolution = {
  id: 'RH-GROUND-PLAN-RESOLUTION-01',
  authority: 'PROVISIONAL_DESIGN_CHOICE',
  removePartitions: ['G-COURT-WEST-NORTH-CONT-B', 'G-COURT-EAST-NORTH-CONT-B', 'G-COURT-EAST-SOUTH-CONT-B'],
  addPartitions: [
    { id: 'G-SERVICE-SOUTH-B', a: [9350, 3400], b: [12000, 3400] },
    { id: 'G-SERVICE-NORTH-B', a: [9350, 7400], b: [12000, 7400] }
  ],
  openings: [
    { id: 'G-FRONT-W01', hostBoundaryId: 'G-OUTER-SOUTH', centre: 1950, width: 1050, role: 'window', replaces: ['G-FRONT-W01'] },
    { id: 'G-FRONT-W02', hostBoundaryId: 'G-OUTER-SOUTH', centre: 4650, width: 900, role: 'window', replaces: ['G-FRONT-W02'] },
    { id: 'G-FRONT-D01', hostBoundaryId: 'G-OUTER-SOUTH', centre: 7350, width: 1000, role: 'door', leaves: 1, swingSide: 'left', replaces: ['G-FRONT-D01'] },
    { id: 'G-FRONT-W04', hostBoundaryId: 'G-OUTER-SOUTH', centre: 10050, width: 1050, role: 'window', replaces: ['G-FRONT-W04'] },
    { id: 'G-GARDEN-W01', hostBoundaryId: 'G-OUTER-NORTH', centre: 2100, width: 1500, role: 'window', replaces: ['RH-10-NORTH-WEST'] },
    { id: 'G-GARDEN-D01', hostBoundaryId: 'G-OUTER-NORTH', centre: 6000, width: 1400, role: 'door', leaves: 2, swingSide: 'right', replaces: ['RHCF-GARDEN-CENTRE-G'] },
    { id: 'G-GARDEN-W03', hostBoundaryId: 'G-OUTER-NORTH', centre: 9900, width: 1500, role: 'window', replaces: ['RH-10-NORTH-EAST'] },
    { id: 'G-COURT-SOUTH-O01', hostBoundaryId: 'G-COURT-SOUTH', centre: 6000, width: 1400, role: 'door', leaves: 2, swingSide: 'right', replaces: ['G-COURT-SOUTH-O01'] },
    { id: 'G-COURT-NORTH-O01', hostBoundaryId: 'G-COURT-NORTH', centre: 6000, width: 1400, role: 'door', leaves: 2, swingSide: 'right', replaces: ['G-COURT-NORTH-O01'] },
    { id: 'G-COURT-W-W01', hostBoundaryId: 'G-COURT-WEST', centre: 4300, width: 1000, role: 'window', replaces: ['RHCF-COURT-W-G'] },
    { id: 'G-COURT-W-W02', hostBoundaryId: 'G-COURT-WEST', centre: 6200, width: 1200, role: 'window', replaces: ['RHCF-COURT-W-G'] },
    { id: 'G-COURT-E-W01', hostBoundaryId: 'G-COURT-EAST', centre: 4400, width: 1000, role: 'window', replaces: ['RHCF-COURT-E-G'] },
    { id: 'G-COURT-E-W02', hostBoundaryId: 'G-COURT-EAST', centre: 6400, width: 1000, role: 'window', replaces: ['RHCF-COURT-E-G'] },
    { id: 'G-PLANT-EXTERNAL-D01', hostBoundaryId: 'G-OUTER-EAST', centre: 6300, width: 1200, role: 'door', leaves: 1, swingSide: 'left', replaces: ['RH-06-PLANT-REPLACEMENT'] },
    { id: 'G-KITCHEN-E-W01', hostBoundaryId: 'G-OUTER-EAST', centre: 9000, width: 1200, role: 'window', replaces: ['RH-10-KITCHEN-EAST'] },
    { id: 'G-DRAW-HALL-D01', hostBoundaryId: 'G-HALL-WEST-B', centre: 1700, width: 900, role: 'door', leaves: 1, swingSide: 'left', replaces: ['ADJ-G-DRAW-HALL'] },
    { id: 'G-DRAW-FAMILY-D01', hostBoundaryId: 'G-WEST-SPLIT-B', centre: 2100, width: 1200, role: 'door', leaves: 2, swingSide: 'right', replaces: ['ADJ-G-DRAW-FAM'] },
    { id: 'G-STUDY-GALLERY-D01', hostBoundaryId: 'G-GALLERY-SERVICE-B', centre: 1700, width: 900, role: 'door', leaves: 1, swingSide: 'right', replaces: ['ADJ-G-STUDY-GAL'] },
    { id: 'G-SERVICE-GALLERY-D01', hostBoundaryId: 'G-GALLERY-SERVICE-B', centre: 5200, width: 900, role: 'door', leaves: 1, swingSide: 'right', replaces: ['ADJ-G-SVC-GAL'] }
  ] satisfies PlanOpeningChoice[],
  openConnections: ['ADJ-G-FAM-GARDEN', 'ADJ-G-GARDEN-KIT', 'ADJ-G-HALL-GAL'],
  stairDisposition: 'TWO_FLIGHT_RETURN_PROVISIONAL',
  stair: { x: 3300, y: 800, risers: 18, flightRiseGroups: [9, 9], going: 300, clearWidth: 1000, landingDepth: 1000, wellGap: 100, cutHeight: 1200, footprintWidth: 3400, footprintDepth: 2100, coordinationWidth: 3500, coordinationDepth: 2200 },
  serviceSubdivision: 'RH06_INTENT_RETAINED_INTERNAL_LAYOUT_NOT_YET_SELECTED'
} as const

/** Necessary envelope test for the ordinary three-sided U arrangement.
 * This is a falsification of the claimed square reservation, not a general
 * stair-design solver or proof that no alternative topology can ever fit.
 */
export const auditCurrentStairReservation = (going = 300, goingsPerFlight = 5, clearWidth = 1000, squareReservation = 2500) => {
  const run = going * goingsPerFlight
  // Two corner landings flank the transverse middle flight.
  const transverseMinimum = run + 2 * clearWidth
  return { runMm: run, transverseMinimumMm: transverseMinimum, reservationMm: squareReservation,
    deficitMm: Math.max(0, transverseMinimum - squareReservation),
    ordinaryThreeSidedUFitsSquare: transverseMinimum <= squareReservation,
    headroomProved: false, selectedAlternative: false }
}

/** Current coordination successor; historical C1 and its released drawings are
 * untouched. The former scalar reservation becomes an explicitly short-axis
 * check; the full rectangular reservation is owned above. */
export const createResolvedReferenceHouseSource = () => {
  const s = createReferenceHouseSource()
  s.partitions.frontHallWestX = { ...s.partitions.frontHallWestX, id:'RHPR-HALL-WEST',value:mm(3100) }
  s.partitions.galleryServiceX = { ...s.partitions.galleryServiceX,id:'RHPR-GALLERY-SERVICE',value:mm(9350),authority:'PROVISIONAL',disposition:'PROVISIONAL_BUT_REPRESENTABLE',authorship:'AUTHORED_PROVISIONAL' }
  s.partitions.upperSouthLandingTurnDepth = { ...s.partitions.upperSouthLandingTurnDepth,id:'RHPR-UPPER-SOUTH-TURN',value:mm(1600) }
  s.stair.riseTopology = { ...s.stair.riseTopology,id:'RHPR-STAIR-RISES',value:{riserCount:18,flightRiseGroups:[9,9]},authority:'PROVISIONAL',disposition:'PROVISIONAL_BUT_REPRESENTABLE',authorship:'AUTHORED_PROVISIONAL' }
  s.stair.goingTopology = { ...s.stair.goingTopology,id:'RHPR-STAIR-GOINGS',value:{going:mm(300),goingsPerFlight:8},authority:'PROVISIONAL',disposition:'PROVISIONAL_BUT_REPRESENTABLE',authorship:'AUTHORED_PROVISIONAL' }
  s.stair.reservation = { ...s.stair.reservation,id:'RHPR-STAIR-SHORT-AXIS',value:{min:mm(2200),max:mm(2300)} }
  return s
}
