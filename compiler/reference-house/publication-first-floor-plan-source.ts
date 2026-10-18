import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import type { Millimetres } from './units.js'
import { mm } from './units.js'

export interface FirstFloorInternalOpeningSource {
  id: string
  hostBoundaryId: string
  connects: [string, string]
  centreCoordinate: SourceFact<Millimetres>
  width: SourceFact<Millimetres>
  treatment: 'door-aperture-no-leaf'
}

export interface FirstFloorExteriorOpeningSource {
  id: string
  hostBoundaryId: string
  spaceIds: string[]
  centreCoordinate: SourceFact<Millimetres>
  width: SourceFact<Millimetres>
  role: 'window' | 'major-opening'
}

export interface FirstFloorPublicationPlanSource {
  internalOpenings: FirstFloorInternalOpeningSource[]
  courtyardOpenings: FirstFloorExteriorOpeningSource[]
  gardenOpenings: FirstFloorExteriorOpeningSource[]
}

const provisional = <T>(id: string, value: T): SourceFact<T> => ({
  id,
  value,
  authority: 'PROVISIONAL',
  authorship: 'AUTHORED_PROVISIONAL',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision: 'approximate'
})

const upperWindowDrawingProxy = (): Millimetres => {
  const family = createReferenceHouseSource().openingFamilies.find(
    (item) => item.id === 'FAM-FRONT-UPPER'
  )
  if (!family || family.width.kind !== 'range') {
    throw new Error('FAM-FRONT-UPPER must retain its controlled width range.')
  }
  // Reuse the lower bound of the existing upper-window family as a publication
  // cut proxy. This is not a selected rear-window product or clear opening.
  return family.width.min
}

const alignedGroundCourtOpening = (
  groundId: string,
  id: string,
  hostBoundaryId: string,
  spaceIds: string[]
): FirstFloorExteriorOpeningSource => {
  const ground = createGroundFloorPublicationPlanSource().courtyardOpenings.find(
    (opening) => opening.id === groundId
  )
  if (!ground) throw new Error(`Missing DRW-03B court opening ${groundId}.`)
  return {
    id,
    hostBoundaryId,
    spaceIds,
    centreCoordinate: provisional(`${id}-C`, ground.centreCoordinate.value),
    width: provisional(`${id}-W`, ground.width.value),
    role: ground.role === 'window' ? 'window' : 'major-opening'
  }
}

/**
 * DRW-04A companion source for the first-floor publication plan.
 *
 * It adds only geometry that the upper plan must show but RH-C1 deliberately
 * leaves qualitative: planning door apertures and the upper court/garden
 * opening field. Wall bodies and the stair footprint/topology are reused from
 * DRW-03B rather than re-authored here.
 */
export const createFirstFloorPublicationPlanSource = (): FirstFloorPublicationPlanSource => {
  const gardenWindowProxy = upperWindowDrawingProxy()

  return {
    internalOpenings: [
      {
        id: 'U-INT-BED02-STAIR-01',
        hostBoundaryId: 'U-HALL-WEST-B',
        connects: ['U-BED-02', 'U-STAIR-01'],
        centreCoordinate: provisional('DRW04A-INT-BED02-STAIR-C', mm(800)),
        width: provisional('DRW04A-INT-BED02-STAIR-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-BED03-STAIR-01',
        hostBoundaryId: 'U-COURT-EAST-SOUTH-CONT-B',
        connects: ['U-BED-03', 'U-STAIR-01'],
        centreCoordinate: provisional('DRW04A-INT-BED03-STAIR-C', mm(800)),
        width: provisional('DRW04A-INT-BED03-STAIR-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-P01-LAND-01',
        hostBoundaryId: 'U-COURT-WEST-NORTH-CONT-B',
        connects: ['U-BED-P01', 'U-LAND-N01'],
        centreCoordinate: provisional('DRW04A-INT-P01-LAND-C', mm(8000)),
        width: provisional('DRW04A-INT-P01-LAND-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-BATH-GAL-01',
        hostBoundaryId: 'U-GALLERY-SERVICE-B',
        connects: ['U-BATH-01', 'U-GAL-02'],
        centreCoordinate: provisional('DRW04A-INT-BATH-GAL-C', mm(5400)),
        width: provisional('DRW04A-INT-BATH-GAL-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-BED04-LAND-01',
        hostBoundaryId: 'U-GALLERY-SERVICE-B',
        connects: ['U-BED-04', 'U-LAND-N01'],
        centreCoordinate: provisional('DRW04A-INT-BED04-LAND-C', mm(8000)),
        width: provisional('DRW04A-INT-BED04-LAND-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-DRESS-LAND-01',
        hostBoundaryId: 'U-NORTH-SPLIT-B',
        connects: ['U-DRESS-01', 'U-LAND-N01'],
        centreCoordinate: provisional('DRW04A-INT-DRESS-LAND-C', mm(5200)),
        width: provisional('DRW04A-INT-DRESS-LAND-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      },
      {
        id: 'U-INT-LIN-LAND-01',
        hostBoundaryId: 'U-NORTH-SPLIT-B',
        connects: ['U-LIN-01', 'U-LAND-N01'],
        centreCoordinate: provisional('DRW04A-INT-LIN-LAND-C', mm(7100)),
        width: provisional('DRW04A-INT-LIN-LAND-W', mm(900)),
        treatment: 'door-aperture-no-leaf'
      }
    ],
    courtyardOpenings: [
      alignedGroundCourtOpening(
        'G-COURT-SOUTH-PUB-01',
        'U-COURT-SOUTH-PUB-01',
        'U-COURT-SOUTH',
        ['U-STAIR-01']
      ),
      alignedGroundCourtOpening(
        'G-COURT-NORTH-PUB-01',
        'U-COURT-NORTH-PUB-01',
        'U-COURT-NORTH',
        ['U-LAND-N01']
      ),
      alignedGroundCourtOpening(
        'G-COURT-EAST-PUB-01',
        'U-COURT-EAST-PUB-01',
        'U-COURT-EAST',
        ['U-GAL-02']
      ),
      alignedGroundCourtOpening(
        'G-COURT-EAST-PUB-02',
        'U-COURT-EAST-PUB-02',
        'U-COURT-EAST',
        ['U-GAL-02']
      ),
      alignedGroundCourtOpening(
        'G-COURT-WEST-PUB-01',
        'U-COURT-WEST-PUB-01',
        'U-COURT-WEST',
        ['U-BED-02']
      ),
      alignedGroundCourtOpening(
        'G-COURT-WEST-PUB-02',
        'U-COURT-WEST-PUB-02',
        'U-COURT-WEST',
        ['U-BED-P01']
      )
    ],
    gardenOpenings: [
      {
        id: 'U-GARDEN-WEST-PUB-01',
        hostBoundaryId: 'U-OUTER-NORTH',
        spaceIds: ['U-BED-P01'],
        centreCoordinate: provisional('DRW04A-GARDEN-W-C', mm(2100)),
        width: provisional('DRW04A-GARDEN-W-W', gardenWindowProxy),
        role: 'window'
      },
      {
        id: 'U-GARDEN-CENTRE-PUB-01',
        hostBoundaryId: 'U-OUTER-NORTH',
        spaceIds: ['U-DRESS-01'],
        centreCoordinate: provisional('DRW04A-GARDEN-C-C', mm(6000)),
        width: provisional('DRW04A-GARDEN-C-W', gardenWindowProxy),
        role: 'window'
      },
      {
        id: 'U-GARDEN-EAST-PUB-01',
        hostBoundaryId: 'U-OUTER-NORTH',
        spaceIds: ['U-BED-04'],
        centreCoordinate: provisional('DRW04A-GARDEN-E-C', mm(9900)),
        width: provisional('DRW04A-GARDEN-E-W', gardenWindowProxy),
        role: 'window'
      }
    ]
  }
}
