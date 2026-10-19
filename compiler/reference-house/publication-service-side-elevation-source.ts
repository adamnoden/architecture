import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import {
  createServiceTransverseSectionSource,
  type SelectedServiceFact,
  type ServiceSelectionAuthority
} from './publication-service-section-source.js'
import type { Millimetres } from './units.js'

export interface ServiceSideControlledDerived<T> {
  id: string
  value: T
  authority: 'CONTROLLED'
  authorship: 'DERIVED'
  disposition: 'FROZEN_FOR_RH_C1'
  precision: 'exact'
  provenance: readonly string[]
}

export interface ServiceSideFieldSource {
  id: 'south' | 'middle' | 'north'
  extent: ServiceSideControlledDerived<{ y0: Millimetres; y1: Millimetres }>
  ownership: SelectedServiceFact<{
    groundSpaceId: 'G-STUDY-02' | 'G-SVC-02' | 'G-KIT-02'
    upperSpaceId: 'U-BED-03' | 'U-BATH-01' | 'U-BED-04'
    role: 'occupied-south-field' | 'concentrated-service-field' | 'occupied-north-field'
  }>
}

export interface ServiceSideElevationPublicationSource {
  view: {
    id: 'REFERENCE-HOUSE-SERVICE-SIDE-ELEVATION'
    facade: 'east'
    facadePlaneX: Millimetres
    horizontalAxis: 'south-to-north-model-y'
    scale: 100
    authority: 'PUBLICATION_VIEW_SELECTION'
    precision: 'exact'
  }
  facadeDepth: SourceFact<Millimetres>
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
  fields: readonly [ServiceSideFieldSource, ServiceSideFieldSource, ServiceSideFieldSource]
  architecturalOccurrences: {
    studyWindow: SelectedServiceFact<{
      field: 'south'
      level: 'GROUND'
      hostSpaceId: 'G-STUDY-02'
      role: 'occupied-window'
      apertureGeometry: 'ABSENT'
    }>
    plantReplacementOpening: SelectedServiceFact<{
      field: 'middle'
      level: 'GROUND'
      hostSpaceId: 'G-PLANT-01'
      clearOpeningTarget: Millimetres
      apertureCentre: 'ABSENT'
      apertureHead: 'ABSENT'
    }>
    bathroomWindow: SelectedServiceFact<{
      field: 'middle'
      level: 'FIRST'
      hostSpaceId: 'U-BATH-01'
      role: 'daylight-window'
      apertureGeometry: 'ABSENT'
    }>
    kitchenWindow: SelectedServiceFact<{
      field: 'north'
      level: 'GROUND'
      hostSpaceId: 'G-KIT-02'
      role: 'occupied-window'
      apertureGeometry: 'ABSENT'
    }>
  }
  technicalOccurrences: {
    utilityEntry: SelectedServiceFact<{
      id: 'UE-01'
      field: 'middle'
      zone: 'low-service-side-plant-geography'
      exactCoordinates: 'ABSENT_TECHNICAL'
    }>
    mvhrBoundary: SelectedServiceFact<{
      id: 'PEN-MV-01'
      zone: 'east-service-side-high-level-wall-preferred'
      exactPenetrations: 'ABSENT_TECHNICAL'
    }>
    heatPumpBoundary: SelectedServiceFact<{
      id: 'PEN-HS-01'
      externalObject: 'ASHP-01'
      zone: 'middle-to-rear-east-service-side-beside-G-PLANT-01'
      exactPosition: 'ABSENT_TECHNICAL'
    }>
    cookerExtract: SelectedServiceFact<{
      id: 'KX-01'
      field: 'north'
      zone: 'short-local-subordinate-service-object'
      exactCoordinates: 'ABSENT_TECHNICAL'
    }>
    rainwaterReturns: SelectedServiceFact<{
      south: { id: 'RWP-SE'; zone: 'south-return-near-front' }
      north: { id: 'RWP-NE'; zone: 'north-return-near-rear' }
      exactCentrelines: 'ABSENT_TECHNICAL'
    }>
    soilVentRoofContinuation: SelectedServiceFact<{
      id: 'PEN-SV-RF-01'
      zone: 'east-service-roof-field-near-outer-service-edge'
      exactTermination: 'ABSENT_TECHNICAL'
    }>
  }
  hierarchy: SelectedServiceFact<readonly [
    'occupied-windows-and-doors',
    'plant-replacement-opening',
    'downpipes-at-return-edges',
    'high-level-ventilation-and-extract-terminals',
    'small-utility-penetrations-low-and-subordinate'
  ]>
  implementationState: {
    bathroomDirectWallExtract: 'FALLBACK_ONLY_NOT_BASELINE'
    wholeDwellingVentilation: 'MVHR_SELECTED_WORKING_BASELINE'
  }
  absent: {
    occupiedOpeningCentres: 'ABSENT'
    occupiedOpeningDimensions: 'ABSENT'
    plantOpeningCentre: 'ABSENT'
    plantOpeningHead: 'ABSENT'
    utilityPenetrationCoordinates: 'ABSENT_TECHNICAL'
    mvhrTerminalCoordinates: 'ABSENT_TECHNICAL'
    cookerTerminalCoordinates: 'ABSENT_TECHNICAL'
    downpipeCentrelines: 'ABSENT_TECHNICAL'
    ashpFootprint: 'ABSENT_TECHNICAL'
    exteriorGrade: 'ABSENT'
    wallBuildUp: 'ABSENT_TECHNICAL'
    facadePanels: 'ABSENT'
    decorativeScreen: 'ABSENT'
    materialPattern: 'ABSENT'
  }
  legacyRh10Svg: {
    status: 'QUARANTINED_COORDINATION_EVIDENCE'
    geometryAuthority: 'NONE'
  }
}

const controlledDerived = <T>(
  id: string,
  value: T,
  provenance: readonly string[]
): ServiceSideControlledDerived<T> => ({
  id,
  value,
  authority: 'CONTROLLED',
  authorship: 'DERIVED',
  disposition: 'FROZEN_FOR_RH_C1',
  precision: 'exact',
  provenance
})

const selected = <T>(
  authority: ServiceSelectionAuthority,
  id: string,
  value: T,
  precision: SelectedServiceFact<T>['precision'],
  provenance: readonly string[]
): SelectedServiceFact<T> => ({
  id,
  value,
  authority,
  disposition: 'OUTSIDE_RH_C1',
  precision,
  provenance
})

/**
 * DRW-08E.1 provenance-bearing source for the retained east/service elevation.
 *
 * The source owns the canonical facade envelope and the three room-owned plan
 * fields, plus selected architectural/service occurrences. It deliberately does
 * not manufacture east-facing aperture centres, terminal points or pipe lines.
 */
export const createServiceSideElevationPublicationSource = (): ServiceSideElevationPublicationSource => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const service = createServiceTransverseSectionSource()

  const field = (
    id: ServiceSideFieldSource['id'],
    y0: Millimetres,
    y1: Millimetres,
    groundSpaceId: ServiceSideFieldSource['ownership']['value']['groundSpaceId'],
    upperSpaceId: ServiceSideFieldSource['ownership']['value']['upperSpaceId'],
    role: ServiceSideFieldSource['ownership']['value']['role']
  ): ServiceSideFieldSource => ({
    id,
    extent: controlledDerived(
      `DRW08E1-SERVICE-FIELD-${id.toUpperCase()}-EXTENT`,
      { y0, y1 },
      ['RHCF-SHELL-Y', 'RHCF-COURT-SIZE']
    ),
    ownership: selected(
      'RH10_SELECTED_OUTSIDE_RH_C1',
      `DRW08E1-SERVICE-FIELD-${id.toUpperCase()}-OWNERSHIP`,
      { groundSpaceId, upperSpaceId, role },
      'qualitative',
      ['RH-10', 'outer-elevation-coordination-rh10.md']
    )
  })

  return {
    view: {
      id: 'REFERENCE-HOUSE-SERVICE-SIDE-ELEVATION',
      facade: 'east',
      facadePlaneX: house.shell.width.value,
      horizontalAxis: 'south-to-north-model-y',
      scale: 100,
      authority: 'PUBLICATION_VIEW_SELECTION',
      precision: 'exact'
    },
    facadeDepth: house.shell.depth,
    levels: {
      groundFfl: house.levels.groundFfl,
      groundCeiling: house.levels.groundCeiling,
      firstFfl: house.levels.firstFfl,
      upperCeiling: house.levels.upperCeiling,
      corniceControl: house.levels.corniceControl
    },
    roof: house.roof,
    fields: [
      field('south', 0 as Millimetres, court.y0, 'G-STUDY-02', 'U-BED-03', 'occupied-south-field'),
      field('middle', court.y0, court.y1, 'G-SVC-02', 'U-BATH-01', 'concentrated-service-field'),
      field('north', court.y1, house.shell.depth.value, 'G-KIT-02', 'U-BED-04', 'occupied-north-field')
    ],
    architecturalOccurrences: {
      studyWindow: selected(
        'RH10_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-STUDY-WINDOW',
        { field: 'south', level: 'GROUND', hostSpaceId: 'G-STUDY-02', role: 'occupied-window', apertureGeometry: 'ABSENT' },
        'qualitative',
        ['RH-10', 'G-STUDY-02']
      ),
      plantReplacementOpening: selected(
        service.plant.authority,
        'DRW08E1-PLANT-REPLACEMENT-OPENING',
        {
          field: 'middle',
          level: 'GROUND',
          hostSpaceId: 'G-PLANT-01',
          clearOpeningTarget: service.plant.value.replacementOpeningTarget,
          apertureCentre: 'ABSENT',
          apertureHead: 'ABSENT'
        },
        'approximate',
        [...service.plant.provenance, 'RH-10']
      ),
      bathroomWindow: selected(
        'RH10_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-BATHROOM-WINDOW',
        { field: 'middle', level: 'FIRST', hostSpaceId: 'U-BATH-01', role: 'daylight-window', apertureGeometry: 'ABSENT' },
        'qualitative',
        ['RH-10', 'U-BATH-01']
      ),
      kitchenWindow: selected(
        'RH10_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-KITCHEN-WINDOW',
        { field: 'north', level: 'GROUND', hostSpaceId: 'G-KIT-02', role: 'occupied-window', apertureGeometry: 'ABSENT' },
        'qualitative',
        ['RH-10', 'G-KIT-02']
      )
    },
    technicalOccurrences: {
      utilityEntry: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-UE-01',
        { id: 'UE-01', field: 'middle', zone: 'low-service-side-plant-geography', exactCoordinates: 'ABSENT_TECHNICAL' },
        'qualitative',
        ['RH-06', 'RH-10', 'UE-01']
      ),
      mvhrBoundary: service.externalInterfaces.mvhrBoundary,
      heatPumpBoundary: service.externalInterfaces.heatPumpBoundary,
      cookerExtract: selected(
        'RH08_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-KX-01',
        { id: 'KX-01', field: 'north', zone: 'short-local-subordinate-service-object', exactCoordinates: 'ABSENT_TECHNICAL' },
        'qualitative',
        ['RH-06', 'RH-08', 'RH-10', 'KX-01']
      ),
      rainwaterReturns: selected(
        'RH08_SELECTED_OUTSIDE_RH_C1',
        'DRW08E1-EAST-RWP-RETURNS',
        {
          south: { id: 'RWP-SE', zone: 'south-return-near-front' },
          north: { id: 'RWP-NE', zone: 'north-return-near-rear' },
          exactCentrelines: 'ABSENT_TECHNICAL'
        },
        'qualitative',
        ['RH-08', 'RH-10', 'RW-OUT-01']
      ),
      soilVentRoofContinuation: service.externalInterfaces.soilVentRoofContinuation
    },
    hierarchy: selected(
      'RH10_SELECTED_OUTSIDE_RH_C1',
      'DRW08E1-SERVICE-SIDE-HIERARCHY',
      [
        'occupied-windows-and-doors',
        'plant-replacement-opening',
        'downpipes-at-return-edges',
        'high-level-ventilation-and-extract-terminals',
        'small-utility-penetrations-low-and-subordinate'
      ] as const,
      'qualitative',
      ['RH-10', 'outer-elevation-coordination-rh10.md']
    ),
    implementationState: {
      bathroomDirectWallExtract: 'FALLBACK_ONLY_NOT_BASELINE',
      wholeDwellingVentilation: service.implementationState.wholeDwellingVentilation
    },
    absent: {
      occupiedOpeningCentres: 'ABSENT',
      occupiedOpeningDimensions: 'ABSENT',
      plantOpeningCentre: 'ABSENT',
      plantOpeningHead: 'ABSENT',
      utilityPenetrationCoordinates: 'ABSENT_TECHNICAL',
      mvhrTerminalCoordinates: 'ABSENT_TECHNICAL',
      cookerTerminalCoordinates: 'ABSENT_TECHNICAL',
      downpipeCentrelines: 'ABSENT_TECHNICAL',
      ashpFootprint: 'ABSENT_TECHNICAL',
      exteriorGrade: 'ABSENT',
      wallBuildUp: 'ABSENT_TECHNICAL',
      facadePanels: 'ABSENT',
      decorativeScreen: 'ABSENT',
      materialPattern: 'ABSENT'
    },
    legacyRh10Svg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE'
    }
  }
}
