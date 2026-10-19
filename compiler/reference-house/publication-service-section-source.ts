import type { SourceFact } from './model.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

export type ServiceSelectionAuthority =
  | 'RH06_SELECTED_OUTSIDE_RH_C1'
  | 'RH07_SELECTED_OUTSIDE_RH_C1'
  | 'RH10_SELECTED_OUTSIDE_RH_C1'

export interface ControlledDerived<T> {
  id: string
  value: T
  authority: 'CONTROLLED'
  authorship: 'DERIVED'
  disposition: 'FROZEN_FOR_RH_C1'
  precision: 'exact'
  provenance: readonly string[]
}

export interface SelectedServiceFact<T> {
  id: string
  value: T
  authority: ServiceSelectionAuthority
  disposition: 'OUTSIDE_RH_C1'
  precision: 'approximate' | 'qualitative' | 'range'
  provenance: readonly string[]
}

export interface ServiceTransverseSectionSource {
  view: {
    id: 'REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION'
    orientation: 'west-to-east-model-x-positive'
    cutPlaneY: Millimetres
    scale: 100
    authority: 'PUBLICATION_VIEW_SELECTION'
    precision: 'exact'
    selectionBasis: 'midpoint-of-rh06-sv01-y-reservation'
  }
  substrate: {
    shellWidth: SourceFact<Millimetres>
    horizontalDatums: ControlledDerived<{
      westOuter: Millimetres
      courtWest: Millimetres
      courtEast: Millimetres
      galleryService: Millimetres
      eastOuter: Millimetres
    }>
    levels: {
      groundFfl: SourceFact<Millimetres>
      groundCeiling: SourceFact<Millimetres>
      firstFfl: SourceFact<Millimetres>
      upperCeiling: SourceFact<Millimetres>
      interStoreyReservation: ControlledDerived<Millimetres>
    }
    wallPlanning: {
      normalRange: SourceFact<{ min: Millimetres; max: Millimetres }>
      stressThickness: SourceFact<Millimetres>
    }
  }
  sectionContexts: {
    groundPlant: SelectedServiceFact<{
      id: 'G-PLANT-01'
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
      relation: 'north-part-of-G-SVC-02'
      exactInternalPartition: 'ABSENT_TECHNICAL'
    }>
    upperBathroom: ControlledDerived<{
      id: 'U-BATH-01'
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
    }>
    eastGallery: ControlledDerived<{
      groundId: 'G-GAL-01'
      upperId: 'U-GAL-02'
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
    }>
    courtyardVoid: ControlledDerived<{
      x0: Millimetres
      x1: Millimetres
    }>
  }
  serviceZone: {
    clearReservation: SelectedServiceFact<{
      id: 'SV-01'
      x0: Millimetres
      x1: Millimetres
      y0: Millimetres
      y1: Millimetres
      clearWidth: Millimetres
      clearDepth: Millimetres
    }>
    floorOpening: SelectedServiceFact<{
      id: 'PEN-SV-01'
      width: Millimetres
      depth: Millimetres
      representativeX0: Millimetres
      representativeX1: Millimetres
      placement: 'centred-around-sv01-for-publication-coordination'
      finalSize: 'ABSENT_TECHNICAL'
    }>
    access: SelectedServiceFact<{
      ground: 'G-GAL-01-or-G-PLANT-01'
      upper: 'U-GAL-02-dry-side-to-bathroom-service-edge'
      waterproofingIndependentOfAccess: true
    }>
  }
  verticalBundle: SelectedServiceFact<{
    serviceClasses: readonly [
      'FS-01-soil-vent-100mm-class',
      'domestic-water-risers',
      'low-temperature-hydronic-risers',
      'segregated-dry-electrical-data',
      'MV-SUP-01-supply-air-trunk',
      'MV-EXT-01-extract-air-trunk'
    ]
    mvhrPrincipalDuctClass: { min: Millimetres; max: Millimetres }
    exactPacking: 'ABSENT_TECHNICAL'
    exactSupports: 'ABSENT_TECHNICAL'
    exactFireAcousticClosure: 'ABSENT_TECHNICAL'
  }>
  plant: SelectedServiceFact<{
    id: 'G-PLANT-01'
    classes: readonly [
      'MVHR-01',
      'DHW-cylinder-and-hydraulic-equipment',
      'electrical-controls-service-index',
      'SV-01-working-access'
    ]
    replacementOpeningTarget: Millimetres
    exactEquipmentPacking: 'ABSENT_TECHNICAL'
    exactProductSelection: 'ABSENT_TECHNICAL'
  }>
  externalInterfaces: {
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
    foulExit: SelectedServiceFact<{
      id: 'PEN-FD-01'
      route: 'stack-base-to-east-service-side-external-inspection'
      exactInvertAndGradient: 'ABSENT_TECHNICAL'
    }>
    soilVentRoofContinuation: SelectedServiceFact<{
      id: 'PEN-SV-RF-01'
      zone: 'east-service-roof-field-near-outer-service-edge'
      exactTermination: 'ABSENT_TECHNICAL'
    }>
  }
  implementationState: {
    bathroomExtract: 'CENTRAL_MVHR_BASELINE_DIRECT_WALL_FALLBACK_ONLY'
    wholeDwellingVentilation: 'MVHR_SELECTED_WORKING_BASELINE'
    heatSource: 'AIR_TO_WATER_HEAT_PUMP_SELECTED_WORKING_BASELINE'
  }
  technicalAbsences: {
    exactRiserInternalPacking: 'ABSENT_TECHNICAL'
    finalStructuralOpening: 'ABSENT_TECHNICAL'
    floorMemberAndTrimmerDesign: 'ABSENT_TECHNICAL'
    fireAcousticClosureDetail: 'ABSENT_TECHNICAL'
    exactDuctSizes: 'ABSENT_TECHNICAL'
    exactPipeSizesExceptSoilClass: 'ABSENT_TECHNICAL'
    branchCentrelines: 'ABSENT_TECHNICAL'
    plantEquipmentPacking: 'ABSENT_TECHNICAL'
    penetrationCoordinates: 'ABSENT_TECHNICAL'
    wallBuildUp: 'ABSENT_TECHNICAL'
    roofDistributionGeometry: 'ABSENT_TECHNICAL'
  }
  legacyRh06RiserSvg: {
    status: 'QUARANTINED_COORDINATION_EVIDENCE'
    geometryAuthority: 'NONE'
    staleStatements: readonly [
      'direct-bathroom-extract-as-baseline',
      'mvhr-ducts-excluded-from-sv01'
    ]
  }
}

const controlledDerived = <T>(
  id: string,
  value: T,
  provenance: readonly string[]
): ControlledDerived<T> => ({
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

/** DRW-08A publication source. It hardens architectural service geography, not MEP design. */
export const createServiceTransverseSectionSource = (): ServiceTransverseSectionSource => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const galleryService = house.partitions.galleryServiceX.value

  const sv = {
    x0: mm(9150),
    x1: mm(10050),
    y0: mm(6550),
    y1: mm(7250)
  }
  const cutPlaneY = mm((sv.y0 + sv.y1) / 2)
  if (!(cutPlaneY >= sv.y0 && cutPlaneY <= sv.y1)) {
    throw new Error('Service/transverse publication cut no longer intersects the RH-06 SV-01 reservation.')
  }
  if (!(cutPlaneY >= court.y0 && cutPlaneY <= court.y1)) {
    throw new Error('Service/transverse publication cut no longer crosses the canonical courtyard/service band.')
  }

  const openingWidth = mm(1050)
  const svCentreX = mm((sv.x0 + sv.x1) / 2)

  return {
    view: {
      id: 'REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION',
      orientation: 'west-to-east-model-x-positive',
      cutPlaneY,
      scale: 100,
      authority: 'PUBLICATION_VIEW_SELECTION',
      precision: 'exact',
      selectionBasis: 'midpoint-of-rh06-sv01-y-reservation'
    },
    substrate: {
      shellWidth: house.shell.width,
      horizontalDatums: controlledDerived(
        'DRW08A-HORIZONTAL-DATUMS',
        {
          westOuter: mm(0),
          courtWest: court.x0,
          courtEast: court.x1,
          galleryService,
          eastOuter: house.shell.width.value
        },
        ['RHCF-SHELL-X', 'RHCF-COURT-SIZE', 'RHCF-GAL-X1']
      ),
      levels: {
        groundFfl: house.levels.groundFfl,
        groundCeiling: house.levels.groundCeiling,
        firstFfl: house.levels.firstFfl,
        upperCeiling: house.levels.upperCeiling,
        interStoreyReservation: controlledDerived(
          'DRW08A-INTERSTOREY-RESERVATION',
          mm(house.levels.firstFfl.value - house.levels.groundCeiling.value),
          ['RHCF-FFL-1', 'RHCF-CEIL-G']
        )
      },
      wallPlanning: {
        normalRange: house.wallPlanning.normalRange,
        stressThickness: house.wallPlanning.stressThickness
      }
    },
    sectionContexts: {
      groundPlant: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-G-PLANT-01',
        {
          id: 'G-PLANT-01',
          x0: galleryService,
          x1: house.shell.width.value,
          y0: mm(5200),
          y1: court.y1,
          relation: 'north-part-of-G-SVC-02',
          exactInternalPartition: 'ABSENT_TECHNICAL'
        },
        'approximate',
        ['RH-06', 'G-SVC-02', 'RHCF-GAL-X1', 'RHCF-COURT-SIZE']
      ),
      upperBathroom: controlledDerived(
        'DRW08A-U-BATH-01',
        {
          id: 'U-BATH-01',
          x0: galleryService,
          x1: house.shell.width.value,
          y0: court.y0,
          y1: court.y1
        },
        ['U-BATH-01', 'RHCF-GAL-X1', 'RHCF-SHELL-X', 'RHCF-COURT-SIZE']
      ),
      eastGallery: controlledDerived(
        'DRW08A-EAST-GALLERY',
        {
          groundId: 'G-GAL-01',
          upperId: 'U-GAL-02',
          x0: court.x1,
          x1: galleryService,
          y0: court.y0,
          y1: court.y1
        },
        ['G-GAL-01', 'U-GAL-02', 'RHCF-COURT-SIZE', 'RHCF-GAL-X1']
      ),
      courtyardVoid: controlledDerived(
        'DRW08A-COURT-VOID',
        { x0: court.x0, x1: court.x1 },
        ['RHCF-COURT-SIZE', 'RHCF-SHELL-X']
      )
    },
    serviceZone: {
      clearReservation: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-SV-01',
        {
          id: 'SV-01',
          ...sv,
          clearWidth: mm(sv.x1 - sv.x0),
          clearDepth: mm(sv.y1 - sv.y0)
        },
        'approximate',
        ['RH-06', 'RH-P014-02']
      ),
      floorOpening: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-PEN-SV-01',
        {
          id: 'PEN-SV-01',
          width: openingWidth,
          depth: mm(850),
          representativeX0: mm(svCentreX - openingWidth / 2),
          representativeX1: mm(svCentreX + openingWidth / 2),
          placement: 'centred-around-sv01-for-publication-coordination',
          finalSize: 'ABSENT_TECHNICAL'
        },
        'approximate',
        ['RH-06', 'RH-P005-08', 'SV-RES']
      ),
      access: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-SV-01-ACCESS',
        {
          ground: 'G-GAL-01-or-G-PLANT-01',
          upper: 'U-GAL-02-dry-side-to-bathroom-service-edge',
          waterproofingIndependentOfAccess: true
        },
        'qualitative',
        ['RH-06', 'SV-01']
      )
    },
    verticalBundle: selected(
      'RH07_SELECTED_OUTSIDE_RH_C1',
      'DRW08A-VERTICAL-BUNDLE',
      {
        serviceClasses: [
          'FS-01-soil-vent-100mm-class',
          'domestic-water-risers',
          'low-temperature-hydronic-risers',
          'segregated-dry-electrical-data',
          'MV-SUP-01-supply-air-trunk',
          'MV-EXT-01-extract-air-trunk'
        ] as const,
        mvhrPrincipalDuctClass: { min: mm(160), max: mm(200) },
        exactPacking: 'ABSENT_TECHNICAL',
        exactSupports: 'ABSENT_TECHNICAL',
        exactFireAcousticClosure: 'ABSENT_TECHNICAL'
      },
      'approximate',
      ['RH-06', 'RH-07', 'RH-10', 'RH-P005-08']
    ),
    plant: selected(
      'RH10_SELECTED_OUTSIDE_RH_C1',
      'DRW08A-G-PLANT-01-PACKING',
      {
        id: 'G-PLANT-01',
        classes: [
          'MVHR-01',
          'DHW-cylinder-and-hydraulic-equipment',
          'electrical-controls-service-index',
          'SV-01-working-access'
        ] as const,
        replacementOpeningTarget: mm(1000),
        exactEquipmentPacking: 'ABSENT_TECHNICAL',
        exactProductSelection: 'ABSENT_TECHNICAL'
      },
      'qualitative',
      ['RH-06', 'RH-07', 'RH-10']
    ),
    externalInterfaces: {
      mvhrBoundary: selected(
        'RH07_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-PEN-MV-01',
        {
          id: 'PEN-MV-01',
          zone: 'east-service-side-high-level-wall-preferred',
          exactPenetrations: 'ABSENT_TECHNICAL'
        },
        'qualitative',
        ['RH-07', 'RH-08', 'RH-P005-13']
      ),
      heatPumpBoundary: selected(
        'RH10_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-PEN-HS-01',
        {
          id: 'PEN-HS-01',
          externalObject: 'ASHP-01',
          zone: 'middle-to-rear-east-service-side-beside-G-PLANT-01',
          exactPosition: 'ABSENT_TECHNICAL'
        },
        'qualitative',
        ['RH-10', 'RH-P005-12']
      ),
      foulExit: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-PEN-FD-01',
        {
          id: 'PEN-FD-01',
          route: 'stack-base-to-east-service-side-external-inspection',
          exactInvertAndGradient: 'ABSENT_TECHNICAL'
        },
        'qualitative',
        ['RH-06', 'RH-P005-09']
      ),
      soilVentRoofContinuation: selected(
        'RH06_SELECTED_OUTSIDE_RH_C1',
        'DRW08A-PEN-SV-RF-01',
        {
          id: 'PEN-SV-RF-01',
          zone: 'east-service-roof-field-near-outer-service-edge',
          exactTermination: 'ABSENT_TECHNICAL'
        },
        'qualitative',
        ['RH-06', 'RH-08', 'RH-P005-15']
      )
    },
    implementationState: {
      bathroomExtract: 'CENTRAL_MVHR_BASELINE_DIRECT_WALL_FALLBACK_ONLY',
      wholeDwellingVentilation: 'MVHR_SELECTED_WORKING_BASELINE',
      heatSource: 'AIR_TO_WATER_HEAT_PUMP_SELECTED_WORKING_BASELINE'
    },
    technicalAbsences: {
      exactRiserInternalPacking: 'ABSENT_TECHNICAL',
      finalStructuralOpening: 'ABSENT_TECHNICAL',
      floorMemberAndTrimmerDesign: 'ABSENT_TECHNICAL',
      fireAcousticClosureDetail: 'ABSENT_TECHNICAL',
      exactDuctSizes: 'ABSENT_TECHNICAL',
      exactPipeSizesExceptSoilClass: 'ABSENT_TECHNICAL',
      branchCentrelines: 'ABSENT_TECHNICAL',
      plantEquipmentPacking: 'ABSENT_TECHNICAL',
      penetrationCoordinates: 'ABSENT_TECHNICAL',
      wallBuildUp: 'ABSENT_TECHNICAL',
      roofDistributionGeometry: 'ABSENT_TECHNICAL'
    },
    legacyRh06RiserSvg: {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE',
      staleStatements: [
        'direct-bathroom-extract-as-baseline',
        'mvhr-ducts-excluded-from-sv01'
      ]
    }
  }
}
