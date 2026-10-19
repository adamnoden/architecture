import type { DimensionAuthority, SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

export type Rh10GardenAuthority = 'RH10_SELECTED_OUTSIDE_RH_C1'
export type GardenElevationOpeningRole =
  | 'family-room-window'
  | 'garden-dining-threshold'
  | 'kitchen-window-or-door'
  | 'principal-bedroom-window'
  | 'dry-storage-window'
  | 'rear-bedroom-window'

export interface Rh10GardenFact<T> {
  id: string
  value: T
  authority: Rh10GardenAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'approximate' | 'qualitative'
  provenance: readonly string[]
}

export interface GardenElevationOpeningSource {
  id: string
  level: 'GROUND' | 'FIRST'
  axisIndex: 1 | 2 | 3
  role: GardenElevationOpeningRole
  spaceIds: readonly string[]
  occurrence: Rh10GardenFact<'SELECTED_OCCURRENCE'>
  width: SourceFact<DimensionAuthority> | Rh10GardenFact<DimensionAuthority> | 'ABSENT'
  sill: SourceFact<DimensionAuthority> | 'ABSENT'
  head: SourceFact<DimensionAuthority> | 'ABSENT'
  clearOpeningTarget?: Rh10GardenFact<Millimetres>
  unresolvedKind?: 'window-or-door'
  provenance: readonly string[]
}

export interface GardenElevationPublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-GARDEN-ELEVATION'
    facade: 'north'
    facadePlaneY: Millimetres
    horizontalAxis: 'west-to-east-model-x'
    scale: 100
  }>
  facadeWidth: SourceFact<Millimetres>
  axes: Rh10GardenFact<readonly [Millimetres, Millimetres, Millimetres]>
  levels: {
    groundFfl: SourceFact<Millimetres>
    groundCeiling: SourceFact<Millimetres>
    firstFfl: SourceFact<Millimetres>
    upperCeiling: SourceFact<Millimetres>
    corniceControl: SourceFact<Millimetres>
  }
  roof: SourceFact<{
    topology: 'four-low-slope-fields'
    drainageDirection: 'outward' | 'inward'
    screeningFallDenominator: number
    outerEdgeControl: Millimetres
  }>
  openings: GardenElevationOpeningSource[]
  order: Rh10GardenFact<{
    fieldCount: 3
    relationship: 'separated-room-owned-fields-with-masonry-piers'
    continuousGlazedWall: false
  }>
  absent: {
    exteriorGrade: 'ABSENT'
    gardenThresholdBuildUp: 'ABSENT'
    gardenDoorApertureWidth: 'ABSENT'
    gardenDoorHead: 'ABSENT'
    kitchenOpeningKind: 'ABSENT'
    kitchenOpeningDimensions: 'ABSENT'
    dryStorageOpeningWidth: 'ABSENT'
    ridgeDatum: 'ABSENT'
    facadePanels: 'ABSENT'
    decorativeGeometry: 'ABSENT'
  }
  legacyRh10Svg: {
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

const provisional = <T>(
  id: string,
  value: T,
  precision: SourceFact<T>['precision']
): SourceFact<T> => ({
  id,
  value,
  authority: 'PROVISIONAL',
  authorship: 'AUTHORED_PROVISIONAL',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision
})

const selected = <T>(
  id: string,
  value: T,
  precision: Rh10GardenFact<T>['precision'] = 'qualitative',
  provenance: readonly string[] = ['RH-10']
): Rh10GardenFact<T> => ({
  id,
  value,
  authority: 'RH10_SELECTED_OUTSIDE_RH_C1',
  disposition: 'OUTSIDE_RH_C1',
  precision,
  provenance
})

const precisionOf = (
  dimension: DimensionAuthority
): SourceFact<DimensionAuthority>['precision'] =>
  dimension.kind === 'range'
    ? 'range'
    : dimension.kind === 'unknown'
      ? 'qualitative'
      : 'approximate'

/**
 * DRW-08C.1 canonical publication source for the north/garden elevation.
 *
 * RH-10 owns the three-field composition and opening occurrences, but not a
 * complete numeric rear-opening schedule. This source therefore reuses only
 * existing provisional opening-family dimensions where a real family can be
 * identified, and keeps the remaining aperture geometry machine-visibly absent.
 * The legacy RH-10 SVG contributes no coordinates.
 */
export const createGardenElevationPublicationSource = (): GardenElevationPublicationSource => {
  const house = createReferenceHouseSource()

  const family = (id: string) => {
    const result = house.openingFamilies.find((candidate) => candidate.id === id)
    if (!result) throw new Error(`Garden elevation requires canonical opening family ${id}.`)
    return result
  }

  const familyDimension = (
    id: string,
    dimension: DimensionAuthority
  ): SourceFact<DimensionAuthority> =>
    provisional(id, dimension, precisionOf(dimension))

  const groundWindowFamily = family('FAM-FRONT-GROUND-PRINCIPAL')
  const upperWindowFamily = family('FAM-FRONT-UPPER')
  const groundWindowSill = groundWindowFamily.vertical.sill ?? { kind: 'unknown' as const }
  const groundWindowHead = groundWindowFamily.vertical.head ?? { kind: 'unknown' as const }
  const upperWindowSill = upperWindowFamily.vertical.sill ?? { kind: 'unknown' as const }
  const upperWindowHead = upperWindowFamily.vertical.head ?? { kind: 'unknown' as const }

  const occurrence = (
    id: string,
    provenance: readonly string[]
  ): Rh10GardenFact<'SELECTED_OCCURRENCE'> =>
    selected(`${id}-OCCURRENCE`, 'SELECTED_OCCURRENCE', 'qualitative', provenance)

  const window = (
    id: string,
    level: 'GROUND' | 'FIRST',
    axisIndex: 1 | 2 | 3,
    role: GardenElevationOpeningRole,
    spaceIds: readonly string[],
    sourceFamily: typeof groundWindowFamily,
    sill: DimensionAuthority,
    head: DimensionAuthority,
    provenance: readonly string[],
    width: SourceFact<DimensionAuthority> | 'ABSENT' = familyDimension(`${id}-WIDTH`, sourceFamily.width)
  ): GardenElevationOpeningSource => ({
    id,
    level,
    axisIndex,
    role,
    spaceIds,
    occurrence: occurrence(id, provenance),
    width,
    sill: familyDimension(`${id}-SILL`, sill),
    head: familyDimension(`${id}-HEAD`, head),
    provenance
  })

  return {
    view: controlled('DRW08C1-GARDEN-VIEW', {
      id: 'REFERENCE-HOUSE-GARDEN-ELEVATION',
      facade: 'north',
      facadePlaneY: house.shell.depth.value,
      horizontalAxis: 'west-to-east-model-x',
      scale: 100
    }),
    facadeWidth: house.shell.width,
    axes: selected(
      'DRW08C1-GARDEN-AXES',
      [mm(2100), mm(6000), mm(9900)] as const,
      'approximate',
      ['RH-10', 'outer-elevation-coordination-rh10.md']
    ),
    levels: {
      groundFfl: house.levels.groundFfl,
      groundCeiling: house.levels.groundCeiling,
      firstFfl: house.levels.firstFfl,
      upperCeiling: house.levels.upperCeiling,
      corniceControl: house.levels.corniceControl
    },
    roof: house.roof,
    openings: [
      window(
        'G-GARDEN-WEST',
        'GROUND',
        1,
        'family-room-window',
        ['G-FAM-02'],
        groundWindowFamily,
        groundWindowSill,
        groundWindowHead,
        ['RH-10', 'G-FAM-02', 'FAM-FRONT-GROUND-PRINCIPAL']
      ),
      {
        id: 'G-GARDEN-CENTRE',
        level: 'GROUND',
        axisIndex: 2,
        role: 'garden-dining-threshold',
        spaceIds: ['G-GARDEN-02'],
        occurrence: occurrence('G-GARDEN-CENTRE', ['RH-08', 'RH-10', 'G-GARDEN-02']),
        width: 'ABSENT',
        sill: 'ABSENT',
        head: 'ABSENT',
        clearOpeningTarget: selected(
          'G-GARDEN-CENTRE-CLEAR-TARGET',
          mm(1200),
          'approximate',
          ['RH-08', 'RH-10']
        ),
        provenance: ['RH-08', 'RH-10', 'RHCF-GARDEN-CENTRE-G']
      },
      {
        id: 'G-GARDEN-EAST',
        level: 'GROUND',
        axisIndex: 3,
        role: 'kitchen-window-or-door',
        spaceIds: ['G-KIT-02'],
        occurrence: occurrence('G-GARDEN-EAST', ['RH-10', 'G-KIT-02']),
        width: 'ABSENT',
        sill: 'ABSENT',
        head: 'ABSENT',
        unresolvedKind: 'window-or-door',
        provenance: ['RH-10', 'G-KIT-02']
      },
      window(
        'U-GARDEN-WEST',
        'FIRST',
        1,
        'principal-bedroom-window',
        ['U-BED-P01'],
        upperWindowFamily,
        upperWindowSill,
        upperWindowHead,
        ['RH-10', 'U-BED-P01', 'FAM-FRONT-UPPER']
      ),
      window(
        'U-GARDEN-CENTRE',
        'FIRST',
        2,
        'dry-storage-window',
        ['U-DRESS-01'],
        upperWindowFamily,
        upperWindowSill,
        upperWindowHead,
        ['RH-10', 'RH-C0.6', 'U-DRESS-01', 'FAM-FRONT-UPPER'],
        'ABSENT'
      ),
      window(
        'U-GARDEN-EAST',
        'FIRST',
        3,
        'rear-bedroom-window',
        ['U-BED-04'],
        upperWindowFamily,
        upperWindowSill,
        upperWindowHead,
        ['RH-10', 'U-BED-04', 'FAM-FRONT-UPPER']
      )
    ],
    order: selected(
      'DRW08C1-GARDEN-ORDER',
      {
        fieldCount: 3,
        relationship: 'separated-room-owned-fields-with-masonry-piers',
        continuousGlazedWall: false
      },
      'qualitative',
      ['RH-10']
    ),
    absent: {
      exteriorGrade: 'ABSENT',
      gardenThresholdBuildUp: 'ABSENT',
      gardenDoorApertureWidth: 'ABSENT',
      gardenDoorHead: 'ABSENT',
      kitchenOpeningKind: 'ABSENT',
      kitchenOpeningDimensions: 'ABSENT',
      dryStorageOpeningWidth: 'ABSENT',
      ridgeDatum: 'ABSENT',
      facadePanels: 'ABSENT',
      decorativeGeometry: 'ABSENT'
    },
    legacyRh10Svg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE'
    }
  }
}
