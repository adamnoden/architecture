import assert from 'node:assert/strict'
import test from 'node:test'
import { createServiceSideElevationPublicationSource } from './publication-service-side-elevation-source.js'

test('DRW-08E.1 freezes the east view and three controlled plan-owned service-side fields', () => {
  const source = createServiceSideElevationPublicationSource()
  assert.equal(source.view.facade, 'east')
  assert.equal(source.view.facadePlaneX, 12000)
  assert.equal(source.view.horizontalAxis, 'south-to-north-model-y')
  assert.equal(source.view.scale, 100)
  assert.equal(source.facadeDepth.value, 10800)
  assert.deepEqual(
    source.fields.map((field) => [field.id, field.extent.value.y0, field.extent.value.y1]),
    [
      ['south', 0, 3400],
      ['middle', 3400, 7400],
      ['north', 7400, 10800]
    ]
  )
  assert.deepEqual(
    source.fields.map((field) => [field.ownership.value.groundSpaceId, field.ownership.value.upperSpaceId]),
    [
      ['G-STUDY-02', 'U-BED-03'],
      ['G-SVC-02', 'U-BATH-01'],
      ['G-KIT-02', 'U-BED-04']
    ]
  )
})

test('DRW-08E.1 preserves selected openings without manufacturing an east aperture schedule', () => {
  const source = createServiceSideElevationPublicationSource()
  assert.equal(source.architecturalOccurrences.studyWindow.value.apertureGeometry, 'ABSENT')
  assert.equal(source.architecturalOccurrences.bathroomWindow.value.apertureGeometry, 'ABSENT')
  assert.equal(source.architecturalOccurrences.kitchenWindow.value.apertureGeometry, 'ABSENT')
  assert.equal(source.architecturalOccurrences.plantReplacementOpening.value.clearOpeningTarget, 1000)
  assert.equal(source.architecturalOccurrences.plantReplacementOpening.value.apertureCentre, 'ABSENT')
  assert.equal(source.architecturalOccurrences.plantReplacementOpening.value.apertureHead, 'ABSENT')
})

test('DRW-08E.1 carries technical expression as selected zones and hierarchy rather than pseudo-MEP points', () => {
  const source = createServiceSideElevationPublicationSource()
  assert.equal(source.technicalOccurrences.utilityEntry.value.zone, 'low-service-side-plant-geography')
  assert.equal(source.technicalOccurrences.mvhrBoundary.value.zone, 'east-service-side-high-level-wall-preferred')
  assert.equal(source.technicalOccurrences.heatPumpBoundary.value.exactPosition, 'ABSENT_TECHNICAL')
  assert.equal(source.technicalOccurrences.cookerExtract.value.field, 'north')
  assert.equal(source.technicalOccurrences.rainwaterReturns.value.south.id, 'RWP-SE')
  assert.equal(source.technicalOccurrences.rainwaterReturns.value.north.id, 'RWP-NE')
  assert.equal(source.technicalOccurrences.rainwaterReturns.value.exactCentrelines, 'ABSENT_TECHNICAL')
  assert.deepEqual(source.hierarchy.value, [
    'occupied-windows-and-doors',
    'plant-replacement-opening',
    'downpipes-at-return-edges',
    'high-level-ventilation-and-extract-terminals',
    'small-utility-penetrations-low-and-subordinate'
  ])
  assert.equal(source.implementationState.bathroomDirectWallExtract, 'FALLBACK_ONLY_NOT_BASELINE')
})

test('DRW-08E.1 makes unresolved elevation geometry and legacy pixel quarantine explicit', () => {
  const source = createServiceSideElevationPublicationSource()
  assert.deepEqual(source.absent, {
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
  })
  assert.deepEqual(source.legacyRh10Svg, {
    status: 'QUARANTINED_COORDINATION_EVIDENCE',
    geometryAuthority: 'NONE'
  })
})
