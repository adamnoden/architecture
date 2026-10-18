import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

const allFacts = (source: ReturnType<typeof createGroundFloorPublicationPlanSource>) => [
  source.wallRepresentation.faceOwnership,
  source.wallRepresentation.externalCourtBodyProxy,
  source.wallRepresentation.internalBodyProxy,
  source.stair.reservation,
  source.stair.topology,
  ...source.internalOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width]),
  ...source.courtyardOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width]),
  ...source.gardenOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width])
]

describe('DRW-03B ground-floor publication-plan source', () => {
  test('adds exactly the six source categories authorised by DRW-03A', () => {
    const source = createGroundFloorPublicationPlanSource()

    assert.equal(source.wallRepresentation.externalCourtBodyProxy.value, 400)
    assert.equal(source.wallRepresentation.internalBodyProxy.value, 125)
    assert.equal(source.stair.id, 'G-STAIR-PUB-01')
    assert.equal(source.internalOpenings.length, 7)
    assert.equal(source.courtyardOpenings.length, 6)
    assert.equal(source.gardenOpenings.length, 3)

    assert.deepEqual(source.wallRepresentation.faceOwnership.value, {
      shellCoordinatesOwn: 'outer-face',
      courtCoordinatesOwn: 'void-face',
      internalPlanningLinesOwn: 'centreline'
    })
  })

  test('keeps every newly selected dimension provisional rather than promoting it to technical truth', () => {
    const source = createGroundFloorPublicationPlanSource()
    const facts = allFacts(source)

    for (const fact of facts) {
      if (fact.id === 'DRW03B-WALL-FACE-OWNERSHIP') continue
      assert.equal(fact.authority, 'PROVISIONAL', fact.id)
      assert.equal(fact.authorship, 'AUTHORED_PROVISIONAL', fact.id)
      assert.equal(fact.disposition, 'PROVISIONAL_BUT_REPRESENTABLE', fact.id)
      assert.equal(fact.precision, 'approximate', fact.id)
    }

    assert.equal(source.wallRepresentation.faceOwnership.authority, 'CONTROLLED')
    assert.equal(source.wallRepresentation.faceOwnership.precision, 'exact')
  })

  test('uses the existing wall family without silently selecting its midpoint as construction thickness', () => {
    const house = createReferenceHouseSource()
    const plan = createGroundFloorPublicationPlanSource()

    assert.deepEqual(house.wallPlanning.normalRange.value, { min: 400, max: 425 })
    assert.equal(plan.wallRepresentation.externalCourtBodyProxy.value, house.wallPlanning.normalRange.value.min)
    assert.notEqual(plan.wallRepresentation.externalCourtBodyProxy.value, 412.5)
  })

  test('bounds the stair inside the hall and preserves the eastern arrival passage', () => {
    const source = createGroundFloorPublicationPlanSource()
    const stair = source.stair.reservation.value

    assert.deepEqual(stair, { x0: 4000, y0: 450, width: 2500, depth: 2500 })
    assert.ok(stair.x0 >= 4000)
    assert.ok(stair.x0 + stair.width <= 7800)
    assert.ok(stair.y0 >= 0)
    assert.ok(stair.y0 + stair.depth <= 3400)
    assert.equal(7800 - (stair.x0 + stair.width), 1300)
    assert.deepEqual(source.stair.topology.value.flightDirections, ['north', 'east', 'south'])
  })

  test('authors one bounded opening for every required ground adjacency without inventing door leaves', () => {
    const house = createReferenceHouseSource()
    const source = createGroundFloorPublicationPlanSource()

    const required = house.requiredAdjacencies
      .filter((adjacency) => adjacency.levelId === 'GROUND')
      .map((adjacency) => [adjacency.a, adjacency.b].sort().join('|'))
      .sort()
    const authored = source.internalOpenings
      .map((opening) => [...opening.connects].sort().join('|'))
      .sort()

    assert.deepEqual(authored, required)
    assert.ok(source.internalOpenings.every((opening) => opening.treatment === 'open-passage'))
    assert.ok(!('swing' in source.internalOpenings[0]))
  })

  test('makes the existing court and garden opening orders executable only at provisional plan resolution', () => {
    const source = createGroundFloorPublicationPlanSource()

    assert.deepEqual(
      source.courtyardOpenings.map((opening) => [opening.hostBoundaryId, opening.centreCoordinate.value]),
      [
        ['G-COURT-SOUTH', 6000],
        ['G-COURT-NORTH', 6000],
        ['G-COURT-EAST', 4400],
        ['G-COURT-EAST', 6400],
        ['G-COURT-WEST', 4200],
        ['G-COURT-WEST', 6200]
      ]
    )
    assert.deepEqual(
      source.gardenOpenings.map((opening) => opening.centreCoordinate.value),
      [2100, 6000, 9900]
    )
    assert.ok(source.courtyardOpenings.every((opening) => opening.centreCoordinate.authority === 'PROVISIONAL'))
    assert.ok(source.gardenOpenings.every((opening) => opening.centreCoordinate.authority === 'PROVISIONAL'))
  })

  test('contains no real-site orientation or section-cut source', () => {
    const source = createGroundFloorPublicationPlanSource() as unknown as Record<string, unknown>

    assert.equal('northArrow' in source, false)
    assert.equal('sectionMarkers' in source, false)
    assert.equal('siteBoundary' in source, false)
  })
})
