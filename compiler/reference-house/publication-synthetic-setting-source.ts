import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import type { Millimetres } from './units.js'
import { mm } from './units.js'

export type SyntheticSettingAuthority = 'SURROGATE_SETTING_OUTSIDE_RH_C1'

export interface SyntheticSettingFact<T> {
  id: string
  value: T
  authority: SyntheticSettingAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'approximate' | 'qualitative'
  provenance: readonly string[]
}

export interface SyntheticSettingPublicationSource {
  view: SourceFact<{
    id: 'REFERENCE-HOUSE-SYNTHETIC-SETTING-PLAN'
    scale: 200
    orientation: 'model-south-front-not-geographic-north'
  }>
  house: {
    shell: SourceFact<{ width: Millimetres; depth: Millimetres }>
    court: SourceFact<{
      width: Millimetres
      depth: Millimetres
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
    }>
  }
  surrogate: {
    width: SyntheticSettingFact<Millimetres>
    lateralPlacement: SyntheticSettingFact<'house-centred-within-width-stress-test'>
    sideClearance: SyntheticSettingFact<Millimetres>
    westStrip: SyntheticSettingFact<'representative-facade-and-roof-edge-access-capacity'>
    eastStrip: SyntheticSettingFact<'service-plant-facade-and-roof-access-capacity'>
    rearRelation: SyntheticSettingFact<'rear-working-and-garden-logistics-continuation'>
    courtyardLogistics: SyntheticSettingFact<'rear-garden-through-garden-dining-to-courtyard'>
  }
  absences: {
    plotDepth: 'ABSENT'
    legalBoundary: 'ABSENT'
    frontBoundary: 'ABSENT'
    rearBoundary: 'ABSENT'
    highwayOrRoadLine: 'ABSENT'
    neighbours: 'ABSENT'
    geographicNorth: 'ABSENT'
    topography: 'ABSENT'
    plantingAndMatureCanopies: 'ABSENT'
    actualDrainageAndChambers: 'ABSENT'
    actualUtilityApproach: 'ABSENT'
    exactSiteEntrance: 'ABSENT'
    ashpExactPosition: 'ABSENT'
  }
  laterOverlay: {
    owner: 'DRW-10D'
    geometryAuthority: 'NOT_PART_OF_SETTING_SUBSTRATE'
  }
  legacyMaintenanceSvg: {
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

const surrogate = <T>(
  id: string,
  value: T,
  precision: SyntheticSettingFact<T>['precision'],
  provenance: readonly string[] = ['external-access-maintenance-plan.md']
): SyntheticSettingFact<T> => ({
  id,
  value,
  authority: 'SURROGATE_SETTING_OUTSIDE_RH_C1',
  disposition: 'OUTSIDE_RH_C1',
  precision,
  provenance
})

/**
 * DRW-08E publication source for an honest synthetic setting/type plan.
 *
 * Only the documented 15.5 m surrogate width is spatialised. No plot depth,
 * legal boundary, highway line, neighbour or real-site orientation is created.
 */
export const createSyntheticSettingPublicationSource = (): SyntheticSettingPublicationSource => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const surrogateWidth = mm(15500)
  const sideClearance = mm((surrogateWidth - house.shell.width.value) / 2)

  return {
    view: controlled('DRW08E-SETTING-VIEW', {
      id: 'REFERENCE-HOUSE-SYNTHETIC-SETTING-PLAN',
      scale: 200,
      orientation: 'model-south-front-not-geographic-north'
    }),
    house: {
      shell: controlled('DRW08E-SHELL', {
        width: house.shell.width.value,
        depth: house.shell.depth.value
      }),
      court: controlled('DRW08E-COURT', { ...court })
    },
    surrogate: {
      width: surrogate('DRW08E-SURROGATE-WIDTH', surrogateWidth, 'approximate'),
      lateralPlacement: surrogate('DRW08E-LATERAL-PLACEMENT', 'house-centred-within-width-stress-test', 'qualitative'),
      sideClearance: surrogate('DRW08E-SIDE-CLEARANCE', sideClearance, 'approximate', [
        'external-access-maintenance-plan.md',
        'DRW08E-SURROGATE-WIDTH',
        'RHCF-SHELL-X'
      ]),
      westStrip: surrogate('DRW08E-WEST-STRIP', 'representative-facade-and-roof-edge-access-capacity', 'qualitative'),
      eastStrip: surrogate('DRW08E-EAST-STRIP', 'service-plant-facade-and-roof-access-capacity', 'qualitative'),
      rearRelation: surrogate('DRW08E-REAR-RELATION', 'rear-working-and-garden-logistics-continuation', 'qualitative'),
      courtyardLogistics: surrogate('DRW08E-COURT-LOGISTICS', 'rear-garden-through-garden-dining-to-courtyard', 'qualitative')
    },
    absences: {
      plotDepth: 'ABSENT',
      legalBoundary: 'ABSENT',
      frontBoundary: 'ABSENT',
      rearBoundary: 'ABSENT',
      highwayOrRoadLine: 'ABSENT',
      neighbours: 'ABSENT',
      geographicNorth: 'ABSENT',
      topography: 'ABSENT',
      plantingAndMatureCanopies: 'ABSENT',
      actualDrainageAndChambers: 'ABSENT',
      actualUtilityApproach: 'ABSENT',
      exactSiteEntrance: 'ABSENT',
      ashpExactPosition: 'ABSENT'
    },
    laterOverlay: {
      owner: 'DRW-10D',
      geometryAuthority: 'NOT_PART_OF_SETTING_SUBSTRATE'
    },
    legacyMaintenanceSvg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE'
    }
  }
}
