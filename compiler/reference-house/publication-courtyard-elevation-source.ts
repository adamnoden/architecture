import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import type { Millimetres } from './units.js'
import { mm } from './units.js'

export type CourtyardFaceId = 'SOUTH' | 'NORTH' | 'EAST' | 'WEST'
export type CourtyardRelationAuthority = 'RH04_SELECTED_OUTSIDE_RH_C1'

export interface CourtyardRelationFact<T> {
  id: string
  value: T
  authority: CourtyardRelationAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'exact' | 'qualitative'
  provenance: readonly string[]
}

export interface CourtyardFaceSource {
  id: CourtyardFaceId
  width: Millimetres
  widthAuthority: 'CONTROLLED_DERIVED'
  owners: {
    ground: readonly string[]
    first: readonly string[]
  }
  order: CourtyardRelationFact<string>
  axisCount: 1 | 2
  axisCoordinates: readonly Millimetres[] | 'ABSENT'
  axisAuthority: 'CONTROLLED_DERIVED' | CourtyardRelationAuthority | 'ABSENT'
  groundOccurrenceIds: readonly string[]
  firstOccurrenceIds: readonly string[]
  apertureGeometry: 'ABSENT'
}

export interface CourtyardElevationPublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-COURTYARD-ELEVATION-FAMILY'
    scale: 50
    representation: 'four-face-family'
  }>
  court: SourceFact<{
    width: Millimetres
    depth: Millimetres
  }>
  levels: {
    groundFfl: SourceFact<Millimetres>
    groundCeiling: SourceFact<Millimetres>
    firstFfl: SourceFact<Millimetres>
    upperCeiling: SourceFact<Millimetres>
    corniceControl: SourceFact<Millimetres>
  }
  faces: readonly CourtyardFaceSource[]
  commonOrder: CourtyardRelationFact<{
    statement: 'four-faces-have-distinct-owners-with-common-vertical-datums'
    principalFacadeGridInherited: false
  }>
  absent: {
    southOpeningWidth: 'ABSENT'
    southOpeningVerticalGeometry: 'ABSENT'
    northOpeningWidth: 'ABSENT'
    northOpeningVerticalGeometry: 'ABSENT'
    eastAxisCoordinates: 'ABSENT'
    eastOpeningGeometry: 'ABSENT'
    westAxisCoordinates: 'ABSENT'
    westOpeningGeometry: 'ABSENT'
    thresholdBuildUps: 'ABSENT'
    courtyardGrade: 'ABSENT'
    guarding: 'ABSENT'
    copingAndWeathering: 'ABSENT'
    decorativeTreatment: 'ABSENT'
  }
  legacyRh04Svg: {
    status: 'QUARANTINED_COORDINATION_EVIDENCE'
    geometryAuthority: 'NONE'
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

const relation = <T>(
  id: string,
  value: T,
  precision: CourtyardRelationFact<T>['precision'],
  provenance: readonly string[]
): CourtyardRelationFact<T> => ({
  id,
  value,
  authority: 'RH04_SELECTED_OUTSIDE_RH_C1',
  disposition: 'OUTSIDE_RH_C1',
  precision,
  provenance
})

/**
 * DRW-08D.1 publication source for the retained 1:50 courtyard architectural
 * elevation family. The legacy RH-04 study contributes semantic relationships
 * only; none of its pixel geometry is imported.
 */
export const createCourtyardElevationPublicationSource = (): CourtyardElevationPublicationSource => {
  const house = createReferenceHouseSource()
  const occurrence = (id: string) => {
    const found = house.openings.find((candidate) => candidate.id === id)
    if (!found) throw new Error(`Courtyard publication source requires opening occurrence ${id}.`)
    return found
  }
  for (const id of ['G-COURT-SOUTH-O01', 'U-COURT-SOUTH-O01', 'G-COURT-NORTH-O01', 'U-COURT-NORTH-O01']) occurrence(id)

  const qualitative = (id: string) => {
    const found = house.qualitativeOpeningRelationships.find((candidate) => candidate.id === id)
    if (!found) throw new Error(`Courtyard publication source requires relationship ${id}.`)
    return found
  }
  for (const id of ['RHCF-COURT-E-G', 'RHCF-COURT-E-U', 'RHCF-COURT-W-G', 'RHCF-COURT-W-U']) qualitative(id)

  const centredAxis = mm(house.court.value.width / 2)
  const face = (
    id: CourtyardFaceId,
    width: Millimetres,
    owners: CourtyardFaceSource['owners'],
    orderText: string,
    axisCount: 1 | 2,
    axisCoordinates: readonly Millimetres[] | 'ABSENT',
    axisAuthority: CourtyardFaceSource['axisAuthority'],
    groundOccurrenceIds: readonly string[],
    firstOccurrenceIds: readonly string[],
    provenance: readonly string[]
  ): CourtyardFaceSource => ({
    id,
    width,
    widthAuthority: 'CONTROLLED_DERIVED',
    owners,
    order: relation(`DRW08D1-${id}-ORDER`, orderText, axisCoordinates === 'ABSENT' ? 'qualitative' : 'exact', provenance),
    axisCount,
    axisCoordinates,
    axisAuthority,
    groundOccurrenceIds,
    firstOccurrenceIds,
    apertureGeometry: 'ABSENT'
  })

  return {
    view: controlled('DRW08D1-COURTYARD-VIEW', {
      id: 'REFERENCE-HOUSE-COURTYARD-ELEVATION-FAMILY',
      scale: 50,
      representation: 'four-face-family'
    }),
    court: house.court,
    levels: {
      groundFfl: house.levels.groundFfl,
      groundCeiling: house.levels.groundCeiling,
      firstFfl: house.levels.firstFfl,
      upperCeiling: house.levels.upperCeiling,
      corniceControl: house.levels.corniceControl
    },
    faces: [
      face(
        'SOUTH',
        house.court.value.width,
        { ground: ['G-HALL-02'], first: ['U-STAIR-01'] },
        'single-centred-arrival-and-stair-order',
        1,
        [centredAxis],
        'CONTROLLED_DERIVED',
        ['G-COURT-SOUTH-O01'],
        ['U-COURT-SOUTH-O01'],
        ['RH-04', 'G-COURT-SOUTH-O01', 'U-COURT-SOUTH-O01', 'RHCF-COURT-SIZE']
      ),
      face(
        'NORTH',
        house.court.value.width,
        { ground: ['G-GARDEN-02'], first: ['U-LAND-N01'] },
        'single-centred-garden-and-cross-landing-order',
        1,
        [centredAxis],
        'CONTROLLED_DERIVED',
        ['G-COURT-NORTH-O01'],
        ['U-COURT-NORTH-O01'],
        ['RH-04', 'G-COURT-NORTH-O01', 'U-COURT-NORTH-O01', 'RHCF-COURT-SIZE']
      ),
      face(
        'EAST',
        house.court.value.depth,
        { ground: ['G-GAL-01'], first: ['U-GAL-02'] },
        'two-bay-gallery-rhythm-aligned-between-storeys-where-coherent',
        2,
        'ABSENT',
        'ABSENT',
        ['RHCF-COURT-E-G'],
        ['RHCF-COURT-E-U'],
        ['RH-04', 'RHCF-COURT-E-G', 'RHCF-COURT-E-U']
      ),
      face(
        'WEST',
        house.court.value.depth,
        { ground: ['G-DRAW-02', 'G-FAM-02'], first: ['U-BED-02', 'U-BED-P01'] },
        'two-room-owned-axes-aligned-between-storeys-where-supported',
        2,
        'ABSENT',
        'ABSENT',
        ['RHCF-COURT-W-G'],
        ['RHCF-COURT-W-U'],
        ['RH-04', 'RHCF-COURT-W-G', 'RHCF-COURT-W-U']
      )
    ],
    commonOrder: relation(
      'DRW08D1-COURT-COMMON-ORDER',
      {
        statement: 'four-faces-have-distinct-owners-with-common-vertical-datums',
        principalFacadeGridInherited: false
      },
      'qualitative',
      ['RH-04']
    ),
    absent: {
      southOpeningWidth: 'ABSENT',
      southOpeningVerticalGeometry: 'ABSENT',
      northOpeningWidth: 'ABSENT',
      northOpeningVerticalGeometry: 'ABSENT',
      eastAxisCoordinates: 'ABSENT',
      eastOpeningGeometry: 'ABSENT',
      westAxisCoordinates: 'ABSENT',
      westOpeningGeometry: 'ABSENT',
      thresholdBuildUps: 'ABSENT',
      courtyardGrade: 'ABSENT',
      guarding: 'ABSENT',
      copingAndWeathering: 'ABSENT',
      decorativeTreatment: 'ABSENT'
    },
    legacyRh04Svg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE'
    }
  }
}
