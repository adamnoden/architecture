import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { renderReferenceHouseDrawings } from './drawings.js'
import { cloneReferenceHouseSource, createReferenceHouseSource } from './fixture.js'
import { RH_C1_DRAWING_PATHS } from './generate.js'
import { mm } from './units.js'

const baseline = () => compileReferenceHouse(createReferenceHouseSource())

describe('RH-C1 deterministic drawing projection', () => {
  test('renders every plan semantic entity with stable identity', () => {
    const result = baseline()
    const drawings = renderReferenceHouseDrawings(result)

    assert.equal(result.status, 'PASS')
    assert.ok(drawings.groundFloor.includes('data-entity="SHELL-01"'))
    assert.ok(drawings.groundFloor.includes('data-entity="C-01"'))

    for (const space of result.derived.spaces) {
      const drawing = space.levelId === 'GROUND' ? drawings.groundFloor : drawings.firstFloor
      assert.ok(drawing.includes(`data-entity="${space.id}"`), `Missing ${space.id}`)
    }
    for (const boundary of result.derived.boundaries) {
      const drawing = boundary.levelId === 'GROUND' ? drawings.groundFloor : drawings.firstFloor
      assert.ok(drawing.includes(`data-entity="${boundary.id}"`), `Missing ${boundary.id}`)
    }
    for (const opening of result.derived.openings) {
      const drawing = opening.levelId === 'GROUND' ? drawings.groundFloor : drawings.firstFloor
      assert.ok(drawing.includes(`data-entity="${opening.id}"`), `Missing ${opening.id}`)
    }
  })

  test('does not manufacture numeric east/west courtyard openings', () => {
    const drawings = renderReferenceHouseDrawings(baseline())

    for (const drawing of [drawings.groundFloor, drawings.firstFloor]) {
      assert.equal(drawing.includes('data-host="G-COURT-EAST"'), false)
      assert.equal(drawing.includes('data-host="G-COURT-WEST"'), false)
      assert.equal(drawing.includes('data-host="U-COURT-EAST"'), false)
      assert.equal(drawing.includes('data-host="U-COURT-WEST"'), false)
    }
  })

  test('drawing geometry follows the same derived axes used by semantic output', () => {
    const source = createReferenceHouseSource()
    source.frontField.value.spacing = mm(3000)
    const result = compileReferenceHouse(source)
    const drawings = renderReferenceHouseDrawings(result)

    assert.deepEqual(result.derived.frontAxes, [1500, 4500, 7500, 10500])
    assert.ok(drawings.groundFloor.includes('data-axis="FRONT-1" data-world-x="1500"'))
    assert.ok(drawings.groundFloor.includes('data-entity="G-FRONT-D01"'))
    assert.ok(drawings.groundFloor.includes('data-world-centre="7500"'))
  })

  test('opening mutation changes the rendered occurrence without changing its axis', () => {
    const source = createReferenceHouseSource()
    const target = source.openings.find((candidate) => candidate.id === 'G-FRONT-W01')
    assert.ok(target)
    target.widthOverride = { kind: 'approximate', value: mm(1300) }
    const result = compileReferenceHouse(source)
    const drawing = renderReferenceHouseDrawings(result).groundFloor

    assert.ok(drawing.includes('data-entity="G-FRONT-W01"'))
    assert.ok(drawing.includes('data-width-min="1300" data-width-max="1300"'))
    assert.ok(drawing.includes('data-world-centre="1950"'))
    assert.ok(drawing.includes('data-axis="FRONT-1" data-world-x="1950"'))
  })

  test('principal section is driven by level and roof derivations, not independent drawing datums', () => {
    const source = createReferenceHouseSource()
    source.levels.firstFfl.value = mm(3450)
    const result = compileReferenceHouse(source)
    const section = renderReferenceHouseDrawings(result).principalSection

    assert.equal(result.derived.levels.firstFfl, 3450)
    assert.ok(section.includes('data-datum="first FFL" data-z="3450"'))
    assert.ok(section.includes('data-derived="STAIR-LANDING-1" data-z="1150"'))
    assert.ok(section.includes('data-derived="STAIR-LANDING-2" data-z="2300"'))
    assert.ok(section.includes('no strings/guards/treads are implied'))
  })

  test('a recorded architectural conflict can be projected but remains visibly REVIEW', () => {
    const source = createReferenceHouseSource()
    source.court.value.depth = mm(4400)
    const result = compileReferenceHouse(source)
    const drawing = renderReferenceHouseDrawings(result).groundFloor

    assert.equal(result.status, 'REVIEW')
    assert.ok(drawing.includes('data-compile-status="REVIEW"'))
    assert.ok(drawing.includes('STAIR_RESERVATION_REVIEW'))
  })

  test('refuses to render a failed source model', () => {
    const source = createReferenceHouseSource()
    source.stair.riseTopology.value.riserCount = 17
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'FAIL')
    assert.throws(() => renderReferenceHouseDrawings(result), /failed compile/)
  })

  test('committed SVG artefacts are exact deterministic projections of the canonical fixture', () => {
    const source = createReferenceHouseSource()
    const first = renderReferenceHouseDrawings(compileReferenceHouse(cloneReferenceHouseSource(source)))
    const second = renderReferenceHouseDrawings(compileReferenceHouse(cloneReferenceHouseSource(source)))

    assert.deepEqual(first, second)
    assert.equal(readFileSync(RH_C1_DRAWING_PATHS.groundFloor, 'utf8'), first.groundFloor)
    assert.equal(readFileSync(RH_C1_DRAWING_PATHS.firstFloor, 'utf8'), first.firstFloor)
    assert.equal(readFileSync(RH_C1_DRAWING_PATHS.principalSection, 'utf8'), first.principalSection)
  })
})
