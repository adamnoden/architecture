import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createServiceTransverseSectionSource } from './publication-service-section-source.js'

const source = () => createServiceTransverseSectionSource()

describe('DRW-08A service/transverse publication source', () => {
  test('freezes a true-1:100 west-to-east cut through the documented SV-01 reservation', () => {
    const result = source()
    assert.deepEqual(result.view, {
      id: 'REFERENCE-HOUSE-SERVICE-TRANSVERSE-SECTION',
      orientation: 'west-to-east-model-x-positive',
      cutPlaneY: 6900,
      scale: 100,
      authority: 'PUBLICATION_VIEW_SELECTION',
      precision: 'exact',
      selectionBasis: 'midpoint-of-rh06-sv01-y-reservation'
    })
    const sv = result.serviceZone.clearReservation.value
    assert.ok(result.view.cutPlaneY >= sv.y0 && result.view.cutPlaneY <= sv.y1)
  })

  test('carries canonical house/court/gallery/level datums without flattening their authority', () => {
    const result = source()
    assert.deepEqual(result.substrate.horizontalDatums.value, {
      westOuter: 0,
      courtWest: 4200,
      courtEast: 7800,
      galleryService: 9100,
      eastOuter: 12000
    })
    assert.deepEqual(
      [
        result.substrate.levels.groundFfl.value,
        result.substrate.levels.groundCeiling.value,
        result.substrate.levels.firstFfl.value,
        result.substrate.levels.upperCeiling.value
      ],
      [0, 2950, 3300, 6000]
    )
    assert.equal(result.substrate.levels.interStoreyReservation.value, 350)
    assert.equal(result.substrate.horizontalDatums.authority, 'CONTROLLED')
    assert.equal(result.substrate.levels.interStoreyReservation.authority, 'CONTROLLED')
  })

  test('keeps SV-01 and the framed floor-opening envelope approximate rather than controlled', () => {
    const result = source()
    assert.deepEqual(result.serviceZone.clearReservation.value, {
      id: 'SV-01',
      x0: 9150,
      x1: 10050,
      y0: 6550,
      y1: 7250,
      clearWidth: 900,
      clearDepth: 700
    })
    assert.equal(result.serviceZone.clearReservation.precision, 'approximate')
    assert.equal(result.serviceZone.clearReservation.authority, 'RH06_SELECTED_OUTSIDE_RH_C1')
    assert.deepEqual(result.serviceZone.floorOpening.value, {
      id: 'PEN-SV-01',
      width: 1050,
      depth: 850,
      representativeX0: 9075,
      representativeX1: 10125,
      placement: 'centred-around-sv01-for-publication-coordination',
      finalSize: 'ABSENT_TECHNICAL'
    })
    assert.equal(result.serviceZone.floorOpening.precision, 'approximate')
  })

  test('preserves each service class at the gate that actually selected it', () => {
    const result = source()
    assert.deepEqual(result.verticalBundle.rh06Base.value.serviceClasses, [
      'FS-01-soil-vent-100mm-class',
      'domestic-water-risers',
      'segregated-dry-electrical-data'
    ])
    assert.equal(result.verticalBundle.rh06Base.authority, 'RH06_SELECTED_OUTSIDE_RH_C1')
    assert.deepEqual(result.verticalBundle.rh07Mvhr.value.serviceClasses, [
      'MV-SUP-01-supply-air-trunk',
      'MV-EXT-01-extract-air-trunk'
    ])
    assert.deepEqual(result.verticalBundle.rh07Mvhr.value.principalDuctClass, { min: 160, max: 200 })
    assert.equal(result.verticalBundle.rh07Mvhr.authority, 'RH07_SELECTED_OUTSIDE_RH_C1')
    assert.equal(result.verticalBundle.rh10Hydronic.value.serviceClass, 'low-temperature-hydronic-risers')
    assert.equal(result.verticalBundle.rh10Hydronic.authority, 'RH10_SELECTED_OUTSIDE_RH_C1')
  })

  test('reflects current implementation state rather than the stale RH-06 SVG', () => {
    const result = source()
    assert.equal(result.implementationState.bathroomExtract, 'CENTRAL_MVHR_BASELINE_DIRECT_WALL_FALLBACK_ONLY')
    assert.equal(result.implementationState.wholeDwellingVentilation, 'MVHR_SELECTED_WORKING_BASELINE')
    assert.equal(result.implementationState.heatSource, 'AIR_TO_WATER_HEAT_PUMP_SELECTED_WORKING_BASELINE')
    assert.deepEqual(result.legacyRh06RiserSvg.staleStatements, [
      'direct-bathroom-extract-as-baseline',
      'mvhr-ducts-excluded-from-sv01'
    ])
  })

  test('does not manufacture MEP packing, construction-detail or penetration coordinates', () => {
    const result = source()
    assert.equal(result.verticalBundle.exactPacking, 'ABSENT_TECHNICAL')
    assert.equal(result.plant.value.exactEquipmentPacking, 'ABSENT_TECHNICAL')
    assert.equal(result.externalInterfaces.mvhrBoundary.value.exactPenetrations, 'ABSENT_TECHNICAL')
    assert.equal(result.externalInterfaces.heatPumpBoundary.value.exactPosition, 'ABSENT_TECHNICAL')
    assert.equal(result.externalInterfaces.foulExit.value.exactInvertAndGradient, 'ABSENT_TECHNICAL')
    assert.ok(Object.values(result.technicalAbsences).every((value) => value === 'ABSENT_TECHNICAL'))
  })

  test('keeps later external-interface selections at their actual current authority', () => {
    const result = source()
    assert.equal(result.externalInterfaces.mvhrBoundary.authority, 'RH08_SELECTED_OUTSIDE_RH_C1')
    assert.equal(result.externalInterfaces.soilVentRoofContinuation.authority, 'RH08_SELECTED_OUTSIDE_RH_C1')
    assert.equal(result.externalInterfaces.heatPumpBoundary.authority, 'RH10_SELECTED_OUTSIDE_RH_C1')
    assert.equal(result.externalInterfaces.foulExit.authority, 'RH06_SELECTED_OUTSIDE_RH_C1')
  })

  test('quarantines the inherited RH-06 schematic from publication geometry authority', () => {
    const result = source()
    assert.deepEqual(result.legacyRh06RiserSvg, {
      status: 'QUARANTINED_COORDINATION_EVIDENCE',
      geometryAuthority: 'NONE',
      staleStatements: [
        'direct-bathroom-extract-as-baseline',
        'mvhr-ducts-excluded-from-sv01'
      ]
    })
  })
})
