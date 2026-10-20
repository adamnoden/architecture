import {
  createSyntheticSettingPublicationSource,
  type SyntheticSettingPublicationSource
} from './publication-synthetic-setting-source.js'

export type ExternalMaintenanceAuthority = 'PROJECT_MAINTENANCE_COORDINATION'

export interface ExternalMaintenanceFact<T> {
  value: T
  authority: ExternalMaintenanceAuthority
  precision: 'qualitative'
  provenance: readonly string[]
}

export interface ExternalMaintenancePublicationSource {
  view: {
    id: 'REFERENCE-HOUSE-EXTERNAL-MAINTENANCE-SETTING-OVERLAY'
    scale: 200
  }
  setting: SyntheticSettingPublicationSource
  tasks: {
    westCapacity: ExternalMaintenanceFact<'facade-and-roof-edge-ground-supported-access-capacity'>
    eastCapacity: ExternalMaintenanceFact<'service-plant-facade-and-roof-access-capacity-with-useful-passage-retained'>
    courtyardWorkingArea: ExternalMaintenanceFact<'courtyard-working-area-for-dismantled-mobile-tower'>
    rearLogistics: ExternalMaintenanceFact<'rear-working-and-garden-dining-courtyard-logistics-continuation'>
    frontDependency: ExternalMaintenanceFact<'front-facade-access-may-require-highway-facing-scaffold'>
    landscapeControl: ExternalMaintenanceFact<'category-a-capacity-remains-substantially-open'>
  }
  absences: {
    exactScaffoldFootprint: 'ABSENT_TECHNICAL'
    exactTowerFootprint: 'ABSENT_TECHNICAL'
    exactSupportZoneDimensions: 'ABSENT_TECHNICAL'
    temporarySupportLoads: 'ABSENT_TECHNICAL'
    exactAshpPosition: 'ABSENT'
    manufacturerWorkingClearance: 'ABSENT_TECHNICAL'
    permanentAnchors: 'ABSENT'
    legalBoundary: 'ABSENT'
    plotDepth: 'ABSENT'
    roadOrHighwayLine: 'ABSENT'
    neighbours: 'ABSENT'
    plantingAndMatureCanopies: 'ABSENT'
    drainsAndChambers: 'ABSENT'
    routeCentreline: 'ABSENT'
  }
}

const task = <T>(value: T, provenance: readonly string[] = ['external-access-maintenance-plan.md']): ExternalMaintenanceFact<T> => ({
  value,
  authority: 'PROJECT_MAINTENANCE_COORDINATION',
  precision: 'qualitative',
  provenance
})

/**
 * DRW-10D owns no new site geometry. It selects maintenance-task meanings that
 * may be read over the already-controlled DRW-08E synthetic setting substrate.
 */
export const createExternalMaintenancePublicationSource = (): ExternalMaintenancePublicationSource => {
  const setting = createSyntheticSettingPublicationSource()

  if (setting.laterOverlay.owner !== 'DRW-10D') {
    throw new Error('Synthetic setting no longer delegates maintenance overlay ownership to DRW-10D.')
  }

  return {
    view: {
      id: 'REFERENCE-HOUSE-EXTERNAL-MAINTENANCE-SETTING-OVERLAY',
      scale: 200
    },
    setting,
    tasks: {
      westCapacity: task('facade-and-roof-edge-ground-supported-access-capacity'),
      eastCapacity: task('service-plant-facade-and-roof-access-capacity-with-useful-passage-retained', [
        'external-access-maintenance-plan.md',
        'energy-heat-coordination-rh10.md'
      ]),
      courtyardWorkingArea: task('courtyard-working-area-for-dismantled-mobile-tower'),
      rearLogistics: task('rear-working-and-garden-dining-courtyard-logistics-continuation'),
      frontDependency: task('front-facade-access-may-require-highway-facing-scaffold'),
      landscapeControl: task('category-a-capacity-remains-substantially-open')
    },
    absences: {
      exactScaffoldFootprint: 'ABSENT_TECHNICAL',
      exactTowerFootprint: 'ABSENT_TECHNICAL',
      exactSupportZoneDimensions: 'ABSENT_TECHNICAL',
      temporarySupportLoads: 'ABSENT_TECHNICAL',
      exactAshpPosition: setting.absences.ashpExactPosition,
      manufacturerWorkingClearance: 'ABSENT_TECHNICAL',
      permanentAnchors: 'ABSENT',
      legalBoundary: setting.absences.legalBoundary,
      plotDepth: setting.absences.plotDepth,
      roadOrHighwayLine: setting.absences.highwayOrRoadLine,
      neighbours: setting.absences.neighbours,
      plantingAndMatureCanopies: setting.absences.plantingAndMatureCanopies,
      drainsAndChambers: setting.absences.actualDrainageAndChambers,
      routeCentreline: 'ABSENT'
    }
  }
}
