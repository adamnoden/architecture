import type { DimensionAuthority, SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

export type FrontElevationBayRole = 'principal-window' | 'stair-window' | 'entrance'

export interface FrontElevationOpeningSource {
  id: string
  level: 'GROUND' | 'FIRST'
  bayIndex: 1 | 2 | 3 | 4
  role: FrontElevationBayRole
  width: SourceFact<DimensionAuthority>
  sill: SourceFact<DimensionAuthority>
  head: SourceFact<DimensionAuthority>
}

export interface FrontElevationAbsentGeometry {
  ridgeDatum: 'ABSENT'
  exteriorGrade: 'ABSENT'
  canopy: 'ABSENT'
  facadePanels: 'ABSENT'
  visibleSlabLines: 'ABSENT'
  decorativeGeometry: 'ABSENT'
}

export interface FrontElevationPublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION'
    facade: 'south'
    facadePlaneY: Millimetres
    horizontalAxis: 'west-to-east-model-x'
    scale: 100
  }>
  facadeWidth: SourceFact<Millimetres>
  bayAxes: SourceFact<[Millimetres, Millimetres, Millimetres, Millimetres]>
  entranceBay: SourceFact<3>
  levels: {
    groundFfl: SourceFact<Millimetres>
    groundCeiling: SourceFact<Millimetres>
    firstFfl: SourceFact<Millimetres>
    upperCeiling: SourceFact<Millimetres>
    corniceControl: SourceFact<Millimetres>
  }
  roof: SourceFact<{ topology: string; drainageDirection: string; screeningFallDenominator: number; outerEdgeControl: Millimetres }>
  openings: FrontElevationOpeningSource[]
  absent: FrontElevationAbsentGeometry
}

const controlled = <T>(id: string, value: T): SourceFact<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'AUTHORED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision: 'exact'
})

const provisional = <T>(id: string, value: T, precision: SourceFact<T>['precision']): SourceFact<T> => ({
  id,
  value,
  authority: 'PROVISIONAL',
  authorship: 'AUTHORED_PROVISIONAL',
  disposition: 'PROVISIONAL_BUT_REPRESENTABLE',
  precision
})

const precisionOf = (dimension: DimensionAuthority): SourceFact<DimensionAuthority>['precision'] =>
  dimension.kind === 'range' ? 'range' : dimension.kind === 'unknown' ? 'qualitative' : 'approximate'

/** DRW-06B canonical source for the principal front elevation. No renderer geometry is selected here. */
export const createFrontElevationPublicationSource = (): FrontElevationPublicationSource => {
  const house = createReferenceHouseSource()
  const spacing = house.frontField.value.spacing
  const fieldWidth = spacing * (house.frontField.value.count - 1)
  const firstAxis = mm((house.shell.width.value - fieldWidth) / 2)
  const bayAxes = [0, 1, 2, 3].map((index) => mm(firstAxis + spacing * index)) as [Millimetres, Millimetres, Millimetres, Millimetres]

  const family = (id: string) => {
    const result = house.openingFamilies.find((candidate) => candidate.id === id)
    if (!result) throw new Error(`Front elevation requires canonical opening family ${id}.`)
    return result
  }

  const opening = (
    id: string,
    level: 'GROUND' | 'FIRST',
    bayIndex: 1 | 2 | 3 | 4,
    role: FrontElevationBayRole,
    familyId: string
  ): FrontElevationOpeningSource => {
    const sourceFamily = family(familyId)
    const sill = sourceFamily.vertical.sill ?? { kind: 'unknown' as const }
    const head = sourceFamily.vertical.head ?? { kind: 'unknown' as const }
    return {
      id,
      level,
      bayIndex,
      role,
      width: provisional(`${id}-WIDTH`, sourceFamily.width, precisionOf(sourceFamily.width)),
      sill: provisional(`${id}-SILL`, sill, precisionOf(sill)),
      head: provisional(`${id}-HEAD`, head, precisionOf(head))
    }
  }

  return {
    view: controlled('DRW06B-FRONT-VIEW', {
      id: 'REFERENCE-HOUSE-PRINCIPAL-FRONT-ELEVATION',
      facade: 'south',
      facadePlaneY: mm(0),
      horizontalAxis: 'west-to-east-model-x',
      scale: 100
    }),
    facadeWidth: house.shell.width,
    // These coordinates are deterministic consequences of the controlled field rule; they do not imply facade panel edges.
    bayAxes: controlled('DRW06B-FRONT-BAY-AXES', bayAxes),
    entranceBay: controlled('DRW06B-ENTRANCE-BAY', 3 as const),
    levels: {
      groundFfl: house.levels.groundFfl,
      groundCeiling: house.levels.groundCeiling,
      firstFfl: house.levels.firstFfl,
      upperCeiling: house.levels.upperCeiling,
      corniceControl: house.levels.corniceControl
    },
    roof: house.roof,
    openings: [
      opening('G-FRONT-W01', 'GROUND', 1, 'principal-window', 'FAM-FRONT-GROUND-PRINCIPAL'),
      opening('G-FRONT-W02', 'GROUND', 2, 'stair-window', 'FAM-FRONT-GROUND-STAIR'),
      opening('G-FRONT-D01', 'GROUND', 3, 'entrance', 'FAM-FRONT-ENTRANCE'),
      opening('G-FRONT-W04', 'GROUND', 4, 'principal-window', 'FAM-FRONT-GROUND-PRINCIPAL'),
      ...([1, 2, 3, 4] as const).map((bayIndex) =>
        opening(`U-FRONT-W0${bayIndex}`, 'FIRST', bayIndex, 'principal-window', 'FAM-FRONT-UPPER')
      )
    ],
    absent: {
      ridgeDatum: 'ABSENT',
      exteriorGrade: 'ABSENT',
      canopy: 'ABSENT',
      facadePanels: 'ABSENT',
      visibleSlabLines: 'ABSENT',
      decorativeGeometry: 'ABSENT'
    }
  }
}
