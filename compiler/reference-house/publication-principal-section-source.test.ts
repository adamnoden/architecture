import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'

describe('DRW-05B principal-section publication source', () => {
  test('freezes the DRW-05A cut without inventing a second view', () => {
    const source = createPrincipalSectionPublicationSource()

    assert.deepEqual(source.view.value, {
      id: 'REFERENCE-HOUSE-PRINCIPAL-LONGITUDINAL-SECTION',
      cutAxis: 'x',
      cutCoordinate: 6000,
      orientation: 'north-south',
      looking: 'west',
      southOnPaper: 'left',
      northOnPaper: 'right',
      scale: 100
    })
    assert.equal(source.view.authority, 'CONTROLLED')
    assert.equal(source.view.precision, 'exact')
  })

  test('reuses the existing wall proxy and keeps the inter-storey zone non-technical', () => {
    const source = createPrincipalSectionPublicationSource()
    const plan = createGroundFloorPublicationPlanSource()
    const house = createReferenceHouseSource()

    assert.equal(source.representation.externalCourtBodyProxy.value, plan.wallRepresentation.externalCourtBodyProxy.value)
    assert.equal(source.representation.externalCourtBodyProxy.id, plan.wallRepresentation.externalCourtBodyProxy.id)
    assert.equal(source.representation.interStoreyZone.value, house.levels.firstFfl.value - house.levels.groundCeiling.value)
    assert.equal(source.representation.interStoreyZone.value, 350)
    assert.equal(source.representation.interStoreyZone.authority, 'PROVISIONAL')
    assert.equal(source.representation.interStoreyZone.precision, 'approximate')
  })

  test('terminates at ground FFL and refuses foundation or technical roof build-up claims', () => {
    const source = createPrincipalSectionPublicationSource()

    assert.equal(
      source.representation.groundTermination.value,
      'terminate-at-ground-ffl-no-foundation-or-site-profile'
    )
    assert.equal(source.representation.roofTreatment.value, 'controlled-profile-line-no-technical-build-up')
  })

  test('authors only the six vertical opening occurrences crossed by the section', () => {
    const source = createPrincipalSectionPublicationSource()

    assert.deepEqual(
      source.openings.map((opening) => [opening.host, opening.level, opening.role]),
      [
        ['court-south', 'GROUND', 'major-opening'],
        ['court-north', 'GROUND', 'major-opening'],
        ['court-south', 'FIRST', 'window'],
        ['court-north', 'FIRST', 'window'],
        ['outer-north', 'GROUND', 'garden-logistics-opening'],
        ['outer-north', 'FIRST', 'window']
      ]
    )

    assert.deepEqual(
      source.openings.map((opening) => [opening.sillAboveLevel.value, opening.headAboveLevel.value]),
      [
        [0, 2550],
        [0, 2550],
        [800, 2350],
        [800, 2350],
        [0, 2550],
        [800, 2350]
      ]
    )

    for (const opening of source.openings) {
      assert.equal(opening.sillAboveLevel.authority, 'PROVISIONAL', opening.id)
      assert.equal(opening.headAboveLevel.authority, 'PROVISIONAL', opening.id)
      assert.equal(opening.sillAboveLevel.precision, 'approximate', opening.id)
      assert.equal(opening.headAboveLevel.precision, 'approximate', opening.id)
    }
  })

  test('reuses the controlled upper opening family vertically rather than inventing a midpoint', () => {
    const house = createReferenceHouseSource()
    const family = house.openingFamilies.find((item) => item.id === 'FAM-FRONT-UPPER')
    if (!family || family.vertical.sill?.kind !== 'approximate' || family.vertical.head?.kind !== 'approximate') {
      throw new Error('FAM-FRONT-UPPER must retain approximate sill/head controls.')
    }
    const upperSill = family.vertical.sill.value
    const upperHead = family.vertical.head.value

    const upper = createPrincipalSectionPublicationSource().openings.filter((opening) => opening.level === 'FIRST')
    assert.ok(upper.every((opening) => opening.sillAboveLevel.value === upperSill))
    assert.ok(upper.every((opening) => opening.headAboveLevel.value === upperHead))
  })

  test('derives stair rise/run arithmetic from canonical source, not the old schematic plan trace', () => {
    const house = createReferenceHouseSource()
    const source = createPrincipalSectionPublicationSource()

    assert.equal(source.stair.riseCount.value, 18)
    assert.deepEqual(source.stair.risesPerFlight.value, [6, 6, 6])
    assert.equal(source.stair.going.value, 280)
    assert.equal(source.stair.goingsPerFlight.value, 5)

    const flightRun = source.stair.going.value * source.stair.goingsPerFlight.value
    const rise = house.levels.firstFfl.value / source.stair.riseCount.value
    assert.equal(flightRun, 1400)
    assert.equal(source.stair.flights[0].endPlanCoordinate.value - source.stair.flights[0].startPlanCoordinate.value, flightRun)
    assert.equal(source.stair.flights[1].endPlanCoordinate.value - source.stair.flights[1].startPlanCoordinate.value, flightRun)
    assert.equal(source.stair.flights[2].startPlanCoordinate.value - source.stair.flights[2].endPlanCoordinate.value, flightRun)
    assert.equal(source.stair.flights[0].endElevation.value, rise * 6)
    assert.equal(source.stair.flights[1].endElevation.value, rise * 12)
    assert.equal(source.stair.flights[2].endElevation.value, house.levels.firstFfl.value)

    // The older publication plan trace used a schematic 1600 mm line for legibility.
    // Section source must follow canonical going arithmetic instead of copying that renderer coordinate.
    assert.notEqual(flightRun, 1600)
  })

  test('keeps stair placement provisional while retaining controlled topology/arithmetic', () => {
    const source = createPrincipalSectionPublicationSource()

    assert.deepEqual(source.stair.flights.map((flight) => flight.relationToCut), [
      'beyond',
      'perpendicular-beyond',
      'cut'
    ])
    assert.deepEqual(source.stair.flights.map((flight) => flight.direction), ['north', 'east', 'south'])

    for (const flight of source.stair.flights) {
      assert.equal(flight.startPlanCoordinate.authority, 'PROVISIONAL', flight.id)
      assert.equal(flight.endPlanCoordinate.authority, 'PROVISIONAL', flight.id)
      assert.equal(flight.startElevation.authority, 'CONTROLLED', flight.id)
      assert.equal(flight.endElevation.authority, 'CONTROLLED', flight.id)
    }
  })

  test('contains no construction-detail source categories', () => {
    const source = createPrincipalSectionPublicationSource() as unknown as Record<string, unknown>

    for (const forbidden of [
      'foundations',
      'siteProfile',
      'joists',
      'wallBuildUp',
      'roofBuildUp',
      'handrails',
      'guards',
      'strings',
      'services',
      'insulation'
    ]) {
      assert.equal(forbidden in source, false, forbidden)
    }
  })
})
