import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

const allFacts = (source: ReturnType<typeof createFirstFloorPublicationPlanSource>) => [
  ...source.internalOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width]),
  ...source.courtyardOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width]),
  ...source.gardenOpenings.flatMap((opening) => [opening.centreCoordinate, opening.width])
]

const pair = (a: string, b: string): string => [a, b].sort().join('|')

describe('DRW-04A first-floor publication-plan source', () => {
  test('adds only upper internal, courtyard and garden opening geometry', () => {
    const source = createFirstFloorPublicationPlanSource() as unknown as Record<string, unknown>

    assert.equal((source.internalOpenings as unknown[]).length, 7)
    assert.equal((source.courtyardOpenings as unknown[]).length, 6)
    assert.equal((source.gardenOpenings as unknown[]).length, 3)
    assert.equal('wallRepresentation' in source, false)
    assert.equal('stair' in source, false)
    assert.equal('northArrow' in source, false)
    assert.equal('sectionMarkers' in source, false)
    assert.equal('siteBoundary' in source, false)
  })

  test('keeps every newly selected coordinate and width provisional and approximate', () => {
    for (const fact of allFacts(createFirstFloorPublicationPlanSource())) {
      assert.equal(fact.authority, 'PROVISIONAL', fact.id)
      assert.equal(fact.authorship, 'AUTHORED_PROVISIONAL', fact.id)
      assert.equal(fact.disposition, 'PROVISIONAL_BUT_REPRESENTABLE', fact.id)
      assert.equal(fact.precision, 'approximate', fact.id)
    }
  })

  test('authors the minimum private-room apertures from the three-sided circulation without door leaves', () => {
    const source = createFirstFloorPublicationPlanSource()
    const expected = [
      pair('U-BED-02', 'U-STAIR-01'),
      pair('U-BED-03', 'U-STAIR-01'),
      pair('U-BED-P01', 'U-LAND-N01'),
      pair('U-BATH-01', 'U-GAL-02'),
      pair('U-BED-04', 'U-LAND-N01'),
      pair('U-DRESS-01', 'U-LAND-N01'),
      pair('U-LIN-01', 'U-LAND-N01')
    ].sort()

    assert.deepEqual(
      source.internalOpenings.map((opening) => pair(...opening.connects)).sort(),
      expected
    )
    assert.ok(source.internalOpenings.every((opening) => opening.treatment === 'door-aperture-no-leaf'))
    assert.ok(source.internalOpenings.every((opening) => !('swing' in opening)))
  })

  test('keeps every authored internal aperture on a boundary shared by its declared spaces', () => {
    const result = compileReferenceHouse(createReferenceHouseSource())
    assert.equal(result.status, 'PASS')

    const spaces = new Map(result.derived.spaces.map((space) => [space.id, space]))
    const boundaries = new Map(result.derived.boundaries.map((boundary) => [boundary.id, boundary]))

    for (const opening of createFirstFloorPublicationPlanSource().internalOpenings) {
      const boundary = boundaries.get(opening.hostBoundaryId)
      const a = spaces.get(opening.connects[0])
      const b = spaces.get(opening.connects[1])
      assert.ok(boundary, opening.id)
      assert.ok(a && b, opening.id)

      const centre = opening.centreCoordinate.value
      const touches = (space: NonNullable<typeof a>): boolean =>
        space.boxes.some((box) => {
          if (boundary.orientation === 'vertical') {
            const onEdge = box.x === boundary.x1 || box.x + box.width === boundary.x1
            return onEdge && centre >= box.y && centre <= box.y + box.height
          }
          const onEdge = box.y === boundary.y1 || box.y + box.height === boundary.y1
          return onEdge && centre >= box.x && centre <= box.x + box.width
        })

      assert.ok(touches(a), `${opening.id} misses ${a.id}`)
      assert.ok(touches(b), `${opening.id} misses ${b.id}`)
    }
  })

  test('derives the upper courtyard field from DRW-03B only where RH-04 requires vertical alignment', () => {
    const upper = createFirstFloorPublicationPlanSource().courtyardOpenings
    const ground = createGroundFloorPublicationPlanSource().courtyardOpenings

    assert.equal(upper.length, ground.length)
    for (let index = 0; index < upper.length; index += 1) {
      assert.equal(upper[index].centreCoordinate.value, ground[index].centreCoordinate.value)
      assert.equal(upper[index].width.value, ground[index].width.value)
    }

    assert.deepEqual(
      upper.map((opening) => [opening.hostBoundaryId, opening.centreCoordinate.value]),
      [
        ['U-COURT-SOUTH', 6000],
        ['U-COURT-NORTH', 6000],
        ['U-COURT-EAST', 4400],
        ['U-COURT-EAST', 6400],
        ['U-COURT-WEST', 4200],
        ['U-COURT-WEST', 6200]
      ]
    )
  })

  test('uses RH-10 garden axes and only the lower-bound upper-window family as a cut proxy', () => {
    const house = createReferenceHouseSource()
    const family = house.openingFamilies.find((item) => item.id === 'FAM-FRONT-UPPER')
    if (!family || family.width.kind !== 'range') {
      throw new Error('FAM-FRONT-UPPER must retain its controlled width range.')
    }
    const width = family.width

    const garden = createFirstFloorPublicationPlanSource().gardenOpenings
    assert.deepEqual(garden.map((opening) => opening.centreCoordinate.value), [2100, 6000, 9900])
    assert.ok(garden.every((opening) => opening.width.value === width.min))
    assert.equal(width.min, 900)
    assert.notEqual(garden[0].width.value, 925)
    assert.deepEqual(garden.map((opening) => opening.spaceIds), [
      ['U-BED-P01'],
      ['U-DRESS-01'],
      ['U-BED-04']
    ])
  })

  test('does not reinterpret geometric required adjacency as a door schedule', () => {
    const house = createReferenceHouseSource()
    const requiredPairs = house.requiredAdjacencies
      .filter((adjacency) => adjacency.levelId === 'FIRST')
      .map((adjacency) => pair(adjacency.a, adjacency.b))

    assert.ok(requiredPairs.includes(pair('U-BED-02', 'U-BED-P01')))
    assert.ok(!requiredPairs.includes(pair('U-BED-P01', 'U-LAND-N01')))
    assert.ok(
      createFirstFloorPublicationPlanSource().internalOpenings.some(
        (opening) => pair(...opening.connects) === pair('U-BED-P01', 'U-LAND-N01')
      )
    )
  })
})
