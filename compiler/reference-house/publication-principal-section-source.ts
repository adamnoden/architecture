import type { DimensionAuthority, SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

export interface PrincipalSectionOpeningSource {
  id: string
  host: 'court-south' | 'court-north' | 'outer-north'
  level: 'GROUND' | 'FIRST'
  role: 'major-opening' | 'window' | 'garden-logistics-opening'
  sillAboveLevel: SourceFact<Millimetres>
  headAboveLevel: SourceFact<Millimetres>
}

export interface PrincipalSectionStairFlightSource {
  id: string
  order: 1 | 2 | 3
  relationToCut: 'beyond' | 'perpendicular-beyond' | 'cut'
  direction: 'north' | 'east' | 'south'
  startPlanCoordinate: SourceFact<Millimetres>
  endPlanCoordinate: SourceFact<Millimetres>
  startElevation: SourceFact<Millimetres>
  endElevation: SourceFact<Millimetres>
}

export interface PrincipalSectionPublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION'
    cutAxis: 'x'
    cutCoordinate: Millimetres
    orientation: 'north-south'
    looking: 'west'
    southOnPaper: 'left'
    northOnPaper: 'right'
    scale: 100
  }>
  representation: {
    externalCourtBodyProxy: SourceFact<Millimetres>
    interStoreyZone: SourceFact<Millimetres>
    groundTermination: SourceFact<'terminate-at-ground-ffl-no-foundation-or-site-profile'>
    roofTreatment: SourceFact<'controlled-profile-line-no-technical-build-up'>
  }
  openings: PrincipalSectionOpeningSource[]
  stair: {
    riseCount: SourceFact<number>
    risesPerFlight: SourceFact<[number, number, number]>
    going: SourceFact<Millimetres>
    goingsPerFlight: SourceFact<number>
    flights: PrincipalSectionStairFlightSource[]
  }
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

const approximateValue = (authority: DimensionAuthority | undefined, id: string): Millimetres => {
  if (!authority || authority.kind !== 'approximate') {
    throw new Error(`${id} must remain an approximate controlled opening datum.`)
  }
  return authority.value
}

const sectionOpening = (
  id: string,
  host: PrincipalSectionOpeningSource['host'],
  level: PrincipalSectionOpeningSource['level'],
  role: PrincipalSectionOpeningSource['role'],
  sill: Millimetres,
  head: Millimetres
): PrincipalSectionOpeningSource => ({
  id,
  host,
  level,
  role,
  sillAboveLevel: provisional(`${id}-SILL`, sill),
  headAboveLevel: provisional(`${id}-HEAD`, head)
})

/**
 * DRW-05B companion source for the frozen publication principal section.
 *
 * This source does not select construction build-ups. It adds only the
 * bounded representation and vertical-opening facts needed to turn the
 * canonical Reference House section relationships into an honest 1:100
 * architectural section.
 */
export const createPrincipalSectionPublicationSource = (): PrincipalSectionPublicationSource => {
  const house = createReferenceHouseSource()
  const groundPlan = createGroundFloorPublicationPlanSource()
  const firstFfl = house.levels.firstFfl.value
  const interStoreyZone = mm(firstFfl - house.levels.groundCeiling.value)
  const rise = mm(firstFfl / house.stair.riseTopology.value.riserCount)
  const risesPerFlight = house.stair.riseTopology.value.flightRiseGroups
  const [firstRiseGroup, secondRiseGroup] = risesPerFlight
  const firstLanding = mm(rise * firstRiseGroup)
  const secondLanding = mm(rise * (firstRiseGroup + secondRiseGroup))
  const flightRun = mm(house.stair.goingTopology.value.going * house.stair.goingTopology.value.goingsPerFlight)

  const groundPrincipalFamily = house.openingFamilies.find(
    (family) => family.id === 'FAM-FRONT-GROUND-PRINCIPAL'
  )
  const upperFamily = house.openingFamilies.find((family) => family.id === 'FAM-FRONT-UPPER')
  if (!groundPrincipalFamily || !upperFamily) {
    throw new Error('Principal section requires the canonical ground and upper opening families.')
  }

  // DRW-05B provisionally extends the already-coordinated ground opening-head
  // datum to the court and centre garden openings crossed by this section. The
  // selection remains provisional; deriving the number here avoids creating a
  // second independent 2550 mm datum.
  const groundHead = approximateValue(
    groundPrincipalFamily.vertical.head,
    'FAM-FRONT-GROUND-PRINCIPAL head'
  )

  // Upper court / garden section cuts reuse the canonical upper opening family
  // vertically. Width remains owned by plan/elevation publication source.
  const upperSill = approximateValue(upperFamily.vertical.sill, 'FAM-FRONT-UPPER sill')
  const upperHead = approximateValue(upperFamily.vertical.head, 'FAM-FRONT-UPPER head')

  // Stair placement remains deliberately provisional. The longitudinal runs
  // use canonical going arithmetic rather than copying the older plan
  // renderer's schematic trace. Exact strings, landings, guards and headroom
  // construction remain outside this source.
  const southStart = mm(800)
  const northEnd = mm(southStart + flightRun)
  const westFlightX = mm(4500)

  return {
    view: controlled('DRW05B-SECTION-VIEW', {
      id: 'REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION',
      cutAxis: 'x',
      cutCoordinate: mm(6000),
      orientation: 'north-south',
      looking: 'west',
      southOnPaper: 'left',
      northOnPaper: 'right',
      scale: 100
    }),
    representation: {
      // Reuse the plan cut-body proxy rather than creating a second wall family.
      externalCourtBodyProxy: groundPlan.wallRepresentation.externalCourtBodyProxy,
      // This is the existing architectural planning zone between the controlled
      // clear ceiling and first FFL, not a joist/slab/member depth.
      interStoreyZone: provisional('DRW05B-INTERSTOREY-ZONE', interStoreyZone),
      groundTermination: controlled(
        'DRW05B-GROUND-TERMINATION',
        'terminate-at-ground-ffl-no-foundation-or-site-profile'
      ),
      roofTreatment: controlled(
        'DRW05B-ROOF-TREATMENT',
        'controlled-profile-line-no-technical-build-up'
      )
    },
    openings: [
      sectionOpening('DRW05B-COURT-S-G', 'court-south', 'GROUND', 'major-opening', mm(0), groundHead),
      sectionOpening('DRW05B-COURT-N-G', 'court-north', 'GROUND', 'major-opening', mm(0), groundHead),
      sectionOpening('DRW05B-COURT-S-U', 'court-south', 'FIRST', 'window', upperSill, upperHead),
      sectionOpening('DRW05B-COURT-N-U', 'court-north', 'FIRST', 'window', upperSill, upperHead),
      sectionOpening(
        'DRW05B-GARDEN-C-G',
        'outer-north',
        'GROUND',
        'garden-logistics-opening',
        mm(0),
        groundHead
      ),
      sectionOpening('DRW05B-GARDEN-C-U', 'outer-north', 'FIRST', 'window', upperSill, upperHead)
    ],
    stair: {
      riseCount: controlled('DRW05B-STAIR-RISE-COUNT', house.stair.riseTopology.value.riserCount),
      risesPerFlight: controlled(
        'DRW05B-STAIR-RISE-GROUPS',
        [...risesPerFlight] as [number, number, number]
      ),
      going: controlled('DRW05B-STAIR-GOING', house.stair.goingTopology.value.going),
      goingsPerFlight: controlled(
        'DRW05B-STAIR-GOINGS-PER-FLIGHT',
        house.stair.goingTopology.value.goingsPerFlight
      ),
      flights: [
        {
          id: 'DRW05B-STAIR-FLIGHT-1',
          order: 1,
          relationToCut: 'beyond',
          direction: 'north',
          startPlanCoordinate: provisional('DRW05B-STAIR-F1-START', southStart),
          endPlanCoordinate: provisional('DRW05B-STAIR-F1-END', northEnd),
          startElevation: controlled('DRW05B-STAIR-F1-Z0', mm(0)),
          endElevation: controlled('DRW05B-STAIR-F1-Z1', firstLanding)
        },
        {
          id: 'DRW05B-STAIR-FLIGHT-2',
          order: 2,
          relationToCut: 'perpendicular-beyond',
          direction: 'east',
          startPlanCoordinate: provisional('DRW05B-STAIR-F2-START', westFlightX),
          endPlanCoordinate: provisional('DRW05B-STAIR-F2-END', mm(westFlightX + flightRun)),
          startElevation: controlled('DRW05B-STAIR-F2-Z0', firstLanding),
          endElevation: controlled('DRW05B-STAIR-F2-Z1', secondLanding)
        },
        {
          id: 'DRW05B-STAIR-FLIGHT-3',
          order: 3,
          relationToCut: 'cut',
          direction: 'south',
          startPlanCoordinate: provisional('DRW05B-STAIR-F3-START', northEnd),
          endPlanCoordinate: provisional('DRW05B-STAIR-F3-END', southStart),
          startElevation: controlled('DRW05B-STAIR-F3-Z0', secondLanding),
          endElevation: controlled('DRW05B-STAIR-F3-Z1', firstFfl)
        }
      ]
    }
  }
}
