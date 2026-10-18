import type { Millimetres } from './units.js'
import { mm } from './units.js'
import type { SourceFact } from './model.js'

export type PlanCardinalDirection = 'north' | 'east' | 'south' | 'west'

export interface GroundPlanWallRepresentationSource {
  faceOwnership: SourceFact<{
    shellCoordinatesOwn: 'outer-face'
    courtCoordinatesOwn: 'void-face'
    internalPlanningLinesOwn: 'centreline'
  }>
  externalCourtBodyProxy: SourceFact<Millimetres>
  internalBodyProxy: SourceFact<Millimetres>
}

export interface GroundPlanStairSource {
  id: string
  hostSpaceId: 'G-HALL-02'
  reservation: SourceFact<{
    x0: Millimetres
    y0: Millimetres
    width: Millimetres
    depth: Millimetres
  }>
  topology: SourceFact<{
    kind: 'three-flight-quarter-turn'
    flightDirections: [PlanCardinalDirection, PlanCardinalDirection, PlanCardinalDirection]
    turnSense: 'clockwise'
    upDirection: 'towards-first-floor'
  }>
}

export interface GroundPlanInternalOpeningSource {
  id: string
  hostBoundaryId: string
  connects: [string, string]
  centreCoordinate: SourceFact<Millimetres>
  width: SourceFact<Millimetres>
  treatment: 'open-passage'
}

export interface GroundPlanExteriorOpeningSource {
  id: string
  hostBoundaryId: string
  spaceIds: string[]
  centreCoordinate: SourceFact<Millimetres>
  width: SourceFact<Millimetres>
  role: 'window' | 'major-opening' | 'garden-logistics-opening'
}

export interface GroundFloorPublicationPlanSource {
  wallRepresentation: GroundPlanWallRepresentationSource
  stair: GroundPlanStairSource
  internalOpenings: GroundPlanInternalOpeningSource[]
  courtyardOpenings: GroundPlanExteriorOpeningSource[]
  gardenOpenings: GroundPlanExteriorOpeningSource[]
}

const controlled = <T>(id: string, value: T): SourceFact<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'AUTHORED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision: 'exact'
})

const provisional = <T>(id: string, value: T): SourceFact<T> => ({
  id,
  value,
  authority: 'PROVISIONAL',
  authorship: 'AUTHORED_PROVISIONAL',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision: 'approximate'
})

/**
 * DRW-03B companion source for the first publication plan.
 *
 * These facts are deliberately separate from the RH-C1 inspection fixture. They
 * close only the six representation-critical gaps frozen by DRW-03A. They do
 * not select construction build-ups, product geometry, door leaves, service
 * routes, regulatory compliance or real-site orientation.
 */
export const createGroundFloorPublicationPlanSource = (): GroundFloorPublicationPlanSource => ({
  wallRepresentation: {
    faceOwnership: controlled('DRW03B-WALL-FACE-OWNERSHIP', {
      shellCoordinatesOwn: 'outer-face',
      courtCoordinatesOwn: 'void-face',
      internalPlanningLinesOwn: 'centreline'
    }),
    // Explicit drawing proxy at the lower bound of the existing 400–425 mm
    // planning family. It is not a selected construction thickness.
    externalCourtBodyProxy: provisional('DRW03B-WALL-EXT-PROXY', mm(400)),
    // Re-authorises the RH-02 planning allowance solely as a publication-plan
    // body proxy. It does not prescribe a technical partition build-up.
    internalBodyProxy: provisional('DRW03B-WALL-INT-PROXY', mm(125))
  },
  stair: {
    id: 'G-STAIR-PUB-01',
    hostSpaceId: 'G-HALL-02',
    reservation: provisional('DRW03B-STAIR-PLAN-RES', {
      x0: mm(4000),
      y0: mm(450),
      width: mm(2500),
      depth: mm(2500)
    }),
    topology: provisional('DRW03B-STAIR-PLAN-TOPOLOGY', {
      kind: 'three-flight-quarter-turn',
      flightDirections: ['north', 'east', 'south'],
      turnSense: 'clockwise',
      upDirection: 'towards-first-floor'
    })
  },
  internalOpenings: [
    {
      id: 'G-INT-DRAW-FAM-01',
      hostBoundaryId: 'G-WEST-SPLIT-B',
      connects: ['G-DRAW-02', 'G-FAM-02'],
      centreCoordinate: provisional('DRW03B-INT-DRAW-FAM-C', mm(3400)),
      width: provisional('DRW03B-INT-DRAW-FAM-W', mm(1200)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-DRAW-HALL-01',
      hostBoundaryId: 'G-HALL-WEST-B',
      connects: ['G-DRAW-02', 'G-HALL-02'],
      centreCoordinate: provisional('DRW03B-INT-DRAW-HALL-C', mm(2100)),
      width: provisional('DRW03B-INT-DRAW-HALL-W', mm(1000)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-HALL-GAL-01',
      hostBoundaryId: 'G-COURT-EAST-SOUTH-CONT-B',
      connects: ['G-HALL-02', 'G-GAL-01'],
      centreCoordinate: provisional('DRW03B-INT-HALL-GAL-C', mm(2400)),
      width: provisional('DRW03B-INT-HALL-GAL-W', mm(1100)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-STUDY-GAL-01',
      hostBoundaryId: 'G-GALLERY-SERVICE-B',
      connects: ['G-STUDY-02', 'G-GAL-01'],
      centreCoordinate: provisional('DRW03B-INT-STUDY-GAL-C', mm(1700)),
      width: provisional('DRW03B-INT-STUDY-GAL-W', mm(900)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-SVC-GAL-01',
      hostBoundaryId: 'G-GALLERY-SERVICE-B',
      connects: ['G-SVC-02', 'G-GAL-01'],
      centreCoordinate: provisional('DRW03B-INT-SVC-GAL-C', mm(5400)),
      width: provisional('DRW03B-INT-SVC-GAL-W', mm(900)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-FAM-GARDEN-01',
      hostBoundaryId: 'G-COURT-WEST-NORTH-CONT-B',
      connects: ['G-FAM-02', 'G-GARDEN-02'],
      centreCoordinate: provisional('DRW03B-INT-FAM-GARDEN-C', mm(9000)),
      width: provisional('DRW03B-INT-FAM-GARDEN-W', mm(1500)),
      treatment: 'open-passage'
    },
    {
      id: 'G-INT-GARDEN-KIT-01',
      hostBoundaryId: 'G-COURT-EAST-NORTH-CONT-B',
      connects: ['G-GARDEN-02', 'G-KIT-02'],
      centreCoordinate: provisional('DRW03B-INT-GARDEN-KIT-C', mm(9000)),
      width: provisional('DRW03B-INT-GARDEN-KIT-W', mm(1600)),
      treatment: 'open-passage'
    }
  ],
  courtyardOpenings: [
    {
      id: 'G-COURT-SOUTH-PUB-01',
      hostBoundaryId: 'G-COURT-SOUTH',
      spaceIds: ['G-HALL-02'],
      centreCoordinate: provisional('DRW03B-COURT-S-C', mm(6000)),
      width: provisional('DRW03B-COURT-S-W', mm(1600)),
      role: 'major-opening'
    },
    {
      id: 'G-COURT-NORTH-PUB-01',
      hostBoundaryId: 'G-COURT-NORTH',
      spaceIds: ['G-GARDEN-02'],
      centreCoordinate: provisional('DRW03B-COURT-N-C', mm(6000)),
      width: provisional('DRW03B-COURT-N-W', mm(1600)),
      role: 'major-opening'
    },
    {
      id: 'G-COURT-EAST-PUB-01',
      hostBoundaryId: 'G-COURT-EAST',
      spaceIds: ['G-GAL-01'],
      centreCoordinate: provisional('DRW03B-COURT-E1-C', mm(4400)),
      width: provisional('DRW03B-COURT-E1-W', mm(900)),
      role: 'window'
    },
    {
      id: 'G-COURT-EAST-PUB-02',
      hostBoundaryId: 'G-COURT-EAST',
      spaceIds: ['G-GAL-01'],
      centreCoordinate: provisional('DRW03B-COURT-E2-C', mm(6400)),
      width: provisional('DRW03B-COURT-E2-W', mm(900)),
      role: 'window'
    },
    {
      id: 'G-COURT-WEST-PUB-01',
      hostBoundaryId: 'G-COURT-WEST',
      spaceIds: ['G-DRAW-02'],
      centreCoordinate: provisional('DRW03B-COURT-W1-C', mm(4200)),
      width: provisional('DRW03B-COURT-W1-W', mm(900)),
      role: 'window'
    },
    {
      id: 'G-COURT-WEST-PUB-02',
      hostBoundaryId: 'G-COURT-WEST',
      spaceIds: ['G-FAM-02'],
      centreCoordinate: provisional('DRW03B-COURT-W2-C', mm(6200)),
      width: provisional('DRW03B-COURT-W2-W', mm(1000)),
      role: 'window'
    }
  ],
  gardenOpenings: [
    {
      id: 'G-GARDEN-WEST-PUB-01',
      hostBoundaryId: 'G-OUTER-NORTH',
      spaceIds: ['G-FAM-02'],
      centreCoordinate: provisional('DRW03B-GARDEN-W-C', mm(2100)),
      width: provisional('DRW03B-GARDEN-W-W', mm(1400)),
      role: 'window'
    },
    {
      id: 'G-GARDEN-CENTRE-PUB-01',
      hostBoundaryId: 'G-OUTER-NORTH',
      spaceIds: ['G-GARDEN-02'],
      centreCoordinate: provisional('DRW03B-GARDEN-C-C', mm(6000)),
      width: provisional('DRW03B-GARDEN-C-W', mm(1800)),
      role: 'garden-logistics-opening'
    },
    {
      id: 'G-GARDEN-EAST-PUB-01',
      hostBoundaryId: 'G-OUTER-NORTH',
      spaceIds: ['G-KIT-02'],
      centreCoordinate: provisional('DRW03B-GARDEN-E-C', mm(9900)),
      width: provisional('DRW03B-GARDEN-E-W', mm(1400)),
      role: 'window'
    }
  ]
})
