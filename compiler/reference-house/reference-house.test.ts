import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { cloneReferenceHouseSource, createReferenceHouseSource } from './fixture.js'
import type { DerivedOpening, DerivedSpace, ReferenceHouseCompileResult } from './model.js'
import { mm, mm2, toSquareMetres } from './units.js'

const closeTo = (actual: number, expected: number, tolerance = 1e-6): void =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} ≈ ${expected}`)

const space = (result: ReferenceHouseCompileResult, id: string): DerivedSpace => {
  const found = result.derived.spaces.find((candidate) => candidate.id === id)
  assert.ok(found, `Expected space ${id}`)
  return found
}

const opening = (result: ReferenceHouseCompileResult, id: string): DerivedOpening => {
  const found = result.derived.openings.find((candidate) => candidate.id === id)
  assert.ok(found, `Expected opening ${id}`)
  return found
}

const diagnosticCodes = (result: ReferenceHouseCompileResult): string[] =>
  result.diagnostics.map((item) => item.code)

describe('RH-C1 baseline source and derivation', () => {
  test('compiles the frozen RH-C0 architectural slice without inventing a technical proof', () => {
    const source = createReferenceHouseSource()
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.deepEqual(result.diagnostics, [])
    assert.equal(result.derived.shell.width, 12000)
    assert.equal(result.derived.shell.depth, 10800)
    assert.equal(result.derived.court.width, 3600)
    assert.equal(result.derived.court.depth, 4000)
    assert.deepEqual(
      [result.derived.court.x0, result.derived.court.x1, result.derived.court.y0, result.derived.court.y1],
      [4200, 7800, 3400, 7400]
    )
    assert.equal(toSquareMetres(result.derived.shell.area), 129.6)
    assert.equal(toSquareMetres(result.derived.court.area), 14.4)
    assert.equal(toSquareMetres(result.derived.enclosedPlateArea), 115.2)
  })

  test('derives room reservations from named planning lines and closes both storeys to one plate', () => {
    const result = compileReferenceHouse(createReferenceHouseSource())

    assert.equal(toSquareMetres(space(result, 'G-DRAW-02').area), 20.32)
    assert.equal(toSquareMetres(space(result, 'G-FAM-02').area), 24.36)
    assert.equal(toSquareMetres(space(result, 'G-HALL-02').area), 12.92)
    assert.equal(toSquareMetres(space(result, 'G-STUDY-02').area), 9.86)
    assert.equal(toSquareMetres(space(result, 'G-GAL-01').area), 9.62)
    assert.equal(toSquareMetres(space(result, 'G-SVC-02').area), 11.6)
    assert.equal(toSquareMetres(space(result, 'G-GARDEN-02').area), 12.24)
    assert.equal(toSquareMetres(space(result, 'G-KIT-02').area), 14.28)

    for (const levelId of ['GROUND', 'FIRST'] as const) {
      const total = result.derived.spaces
        .filter((candidate) => candidate.levelId === levelId)
        .reduce((sum, candidate) => sum + candidate.area, 0)
      assert.equal(toSquareMetres(mm2(total)), 115.2)
    }

    assert.equal(space(result, 'G-DRAW-02').provisional, true)
    assert.equal(space(result, 'G-STUDY-02').provisional, false)
  })

  test('derives levels and stair arithmetic instead of authoring their consequences', () => {
    const result = compileReferenceHouse(createReferenceHouseSource())

    assert.equal(result.derived.levels.interStoreyGap, 350)
    assert.equal(result.derived.levels.upperClearHeight, 2700)
    closeTo(result.derived.stair.rise, 183.33333333333334)
    assert.equal(result.derived.stair.flightRun, 1400)
    assert.deepEqual(result.derived.stair.landingDatums, [1100, 2200])
    closeTo(result.derived.stair.twoRPlusG, 646.6666666666667)
    closeTo(result.derived.stair.pitch, 33.2152514937372)
  })

  test('derives the centred front field and entrance from one membership fact', () => {
    const source = createReferenceHouseSource()
    const result = compileReferenceHouse(source)
    const entranceSource = source.openings.find((candidate) => candidate.id === 'G-FRONT-D01')

    assert.deepEqual(result.derived.frontAxes, [1950, 4650, 7350, 10050])
    assert.equal(result.derived.entranceCentre, 7350)
    assert.equal(opening(result, 'G-FRONT-D01').centre, 7350)
    assert.ok(entranceSource)
    assert.equal(entranceSource.placement.kind, 'entrance-bay')
    assert.equal('bayIndex' in entranceSource.placement, false)
  })

  test('keeps wall faces absent while deriving legitimate boundary lengths and wall stress clear fields', () => {
    const source = createReferenceHouseSource()
    const result = compileReferenceHouse(source)
    const south = result.derived.boundaries.find((candidate) => candidate.id === 'G-OUTER-SOUTH')
    const courtNorth = result.derived.boundaries.find((candidate) => candidate.id === 'G-COURT-NORTH')

    assert.ok(south)
    assert.ok(courtNorth)
    assert.equal(south.length, 12000)
    assert.equal(courtNorth.length, 3600)
    assert.equal(result.derived.wallPlanning.clearAtNormalMax.sideRing, 3350)
    assert.equal(result.derived.wallPlanning.clearAtNormalMax.frontRearRing, 2550)
    assert.equal(result.derived.wallPlanning.clearAtStress.sideRing, 3300)
    assert.equal(result.derived.wallPlanning.clearAtStress.frontRearRing, 2500)
    assert.ok(source.boundaries.every((boundary) => !('thickness' in boundary)))
  })

  test('derives opening dimensions only to the authority actually present', () => {
    const result = compileReferenceHouse(createReferenceHouseSource())
    const principal = opening(result, 'G-FRONT-W01')
    const stairWindow = opening(result, 'G-FRONT-W02')
    const upper = opening(result, 'U-FRONT-W01')
    const entrance = opening(result, 'G-FRONT-D01')
    const court = opening(result, 'G-COURT-NORTH-O01')

    assert.deepEqual(principal.area, { kind: 'range', min: 1_942_500, max: 1_995_000 })
    assert.deepEqual(stairWindow.area, { kind: 'approximate', value: 1_350_000 })
    assert.deepEqual(upper.area, { kind: 'range', min: 1_395_000, max: 1_472_500 })
    assert.deepEqual(upper.sillElevation, { kind: 'approximate', value: 4100 })
    assert.deepEqual(upper.headElevation, { kind: 'approximate', value: 5650 })
    assert.deepEqual(entrance.area, { kind: 'unknown' })
    assert.deepEqual(court.width, { kind: 'unknown' })
  })

  test('preserves intentionally absent east/west court coordinates and other outside-slice detail', () => {
    const source = createReferenceHouseSource()

    assert.equal(source.openings.some((item) => /COURT-(EAST|WEST)/.test(item.hostBoundaryId)), false)
    assert.equal(source.qualitativeOpeningRelationships.filter((item) => /COURT-[EW]-/.test(item.id)).length, 4)
    const upperGarden = source.qualitativeOpeningRelationships.find((item) => item.id === 'RHCF-GARDEN-CENTRE-U')
    assert.ok(upperGarden)
    assert.deepEqual(upperGarden.spaceIds, ['U-DRESS-01'])
    assert.match(upperGarden.relationship, /not the north cross-landing/)
    assert.ok(source.qualitativeOpeningRelationships.filter((item) => /COURT-[EW]-/.test(item.id)).every((item) => /exact numeric centres deliberately absent/.test(item.relationship)))
    assert.equal(source.spaces.some((item) => item.id === 'G-PLANT-01'), false)
    assert.equal(source.spaces.some((item) => item.id === 'SV-01'), false)
    assert.equal(JSON.stringify(source).includes('doorSwing'), false)
  })

  test('rejects an opening assigned to the wrong semantic host space even when the façade line is valid', () => {
    const source = createReferenceHouseSource()
    const target = source.openings.find((candidate) => candidate.id === 'G-FRONT-W01')
    assert.ok(target)
    target.spaceIds = ['G-STUDY-02']

    const result = compileReferenceHouse(source)
    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result).includes('OPENING_SPACE_HOST_MISMATCH'))
  })

  test('repeated compilation of unchanged source is deeply deterministic', () => {
    const source = createReferenceHouseSource()
    assert.deepEqual(
      compileReferenceHouse(cloneReferenceHouseSource(source)),
      compileReferenceHouse(cloneReferenceHouseSource(source))
    )
  })
})

describe('RH-C0 mutation map expressed against RH-C1', () => {
  test('M1 shell width -300 propagates centred geometry and leaves absolute partition / levels alone', () => {
    const source = createReferenceHouseSource()
    source.shell.width.value = mm(11700)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.equal(result.derived.shell.centreX, 5850)
    assert.deepEqual([result.derived.court.x0, result.derived.court.x1], [4050, 7650])
    assert.equal(toSquareMetres(result.derived.shell.area), 126.36)
    assert.equal(toSquareMetres(result.derived.enclosedPlateArea), 111.96)
    assert.deepEqual(result.derived.frontAxes, [1800, 4500, 7200, 9900])
    assert.equal(result.derived.entranceCentre, 7200)
    assert.equal(opening(result, 'G-FRONT-D01').centre, 7200)
    assert.equal(space(result, 'G-GAL-01').bounds.width, 1450)
    assert.equal(space(result, 'G-SVC-02').bounds.width, 2600)
    assert.equal(result.derived.levels.firstFfl, 3300)
    assert.equal(result.derived.stair.riserCount, 18)
  })

  test('M2a court width +400 propagates centred edges, area and gallery width without moving the shell', () => {
    const source = createReferenceHouseSource()
    source.court.value.width = mm(4000)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.deepEqual([result.derived.court.x0, result.derived.court.x1], [4000, 8000])
    assert.equal(toSquareMetres(result.derived.court.area), 16)
    assert.equal(toSquareMetres(result.derived.enclosedPlateArea), 113.6)
    assert.equal(space(result, 'G-GAL-01').bounds.width, 1100)
    assert.equal(result.derived.shell.width, 12000)
    assert.deepEqual(result.derived.frontAxes, [1950, 4650, 7350, 10050])
  })

  test('M2b court depth +400 propagates geometry but surfaces the recorded stair-fit review instead of repairing it', () => {
    const source = createReferenceHouseSource()
    source.court.value.depth = mm(4400)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'REVIEW')
    assert.deepEqual([result.derived.court.y0, result.derived.court.y1], [3200, 7600])
    assert.equal(toSquareMetres(result.derived.enclosedPlateArea), 113.76)
    assert.equal(result.derived.wallPlanning.clearAtNormalMax.frontRearRing, 2350)
    assert.ok(diagnosticCodes(result).includes('STAIR_RESERVATION_REVIEW'))
    assert.equal(result.derived.shell.depth, 10800)
  })

  test('M3 wall stress 450 -> 500 changes thickness-aware stress views but never gross source geometry', () => {
    const source = createReferenceHouseSource()
    source.wallPlanning.stressThickness.value = mm(500)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.equal(result.derived.wallPlanning.clearAtStress.sideRing, 3200)
    assert.equal(result.derived.wallPlanning.clearAtStress.frontRearRing, 2400)
    assert.deepEqual([result.derived.court.x0, result.derived.court.x1], [4200, 7800])
    assert.deepEqual(result.derived.frontAxes, [1950, 4650, 7350, 10050])
  })

  test('M4 first-floor FFL +150 recalculates stair and vertical consequences without moving authored ceilings', () => {
    const source = createReferenceHouseSource()
    source.levels.firstFfl.value = mm(3450)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    closeTo(result.derived.stair.rise, 191.66666666666666)
    assert.deepEqual(result.derived.stair.landingDatums, [1150, 2300])
    closeTo(result.derived.stair.twoRPlusG, 663.3333333333333)
    closeTo(result.derived.stair.pitch, 34.392569127225215)
    assert.equal(result.derived.levels.interStoreyGap, 500)
    assert.equal(result.derived.levels.upperClearHeight, 2550)
    assert.equal(result.derived.levels.groundCeiling, 2950)
    assert.equal(result.derived.levels.upperCeiling, 6000)
    assert.deepEqual(opening(result, 'U-FRONT-W01').sillElevation, { kind: 'approximate', value: 4250 })
    assert.deepEqual(opening(result, 'U-FRONT-W01').headElevation, { kind: 'approximate', value: 5800 })
  })

  test('M5 18 -> 17 risers with authored 3 x 6 grouping fails source integrity rather than inventing a regrouping', () => {
    const source = createReferenceHouseSource()
    source.stair.riseTopology.value.riserCount = 17
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'FAIL')
    assert.ok(diagnosticCodes(result).includes('STAIR_RISE_GROUP_MISMATCH'))
    assert.deepEqual(result.derived.stair.flightRiseGroups, [6, 6, 6])
  })

  test('M6 front spacing 2700 -> 3000 moves axes and all bay-derived openings while rooms stay put', () => {
    const baseline = compileReferenceHouse(createReferenceHouseSource())
    const source = createReferenceHouseSource()
    source.frontField.value.spacing = mm(3000)
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.deepEqual(result.derived.frontAxes, [1500, 4500, 7500, 10500])
    assert.equal(result.derived.entranceCentre, 7500)
    assert.equal(opening(result, 'G-FRONT-D01').centre, 7500)
    assert.equal(opening(result, 'G-FRONT-W01').centre, 1500)
    assert.deepEqual(result.derived.spaces, baseline.derived.spaces)
  })

  test('M7 and M10 remain impossible to fake inside RH-C1 because service-riser and plant-detail source is absent', () => {
    const source = createReferenceHouseSource()
    const serialized = JSON.stringify(source)

    assert.equal(serialized.includes('SV-01'), false)
    assert.equal(serialized.includes('G-PLANT-01'), false)
    assert.equal(serialized.includes('plantRoom'), false)
    assert.equal(serialized.includes('serviceRiser'), false)
  })

  test('M8 one major window +250 changes only that occurrence width; its bay centre does not move', () => {
    const source = createReferenceHouseSource()
    const target = source.openings.find((candidate) => candidate.id === 'G-FRONT-W01')
    assert.ok(target)
    target.widthOverride = { kind: 'approximate', value: mm(1300) }
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.deepEqual(opening(result, 'G-FRONT-W01').width, { kind: 'approximate', value: 1300 })
    assert.deepEqual(opening(result, 'G-FRONT-W04').width, { kind: 'approximate', value: 1050 })
    assert.equal(opening(result, 'G-FRONT-W01').centre, 1950)
    assert.deepEqual(result.derived.frontAxes, [1950, 4650, 7350, 10050])
  })

  test('M9 reversing roof drainage changes only the provisional roof section relation in the C1 model', () => {
    const baseline = compileReferenceHouse(createReferenceHouseSource())
    const source = createReferenceHouseSource()
    source.roof.value.drainageDirection = 'inward'
    const result = compileReferenceHouse(source)

    assert.equal(result.status, 'PASS')
    assert.equal(baseline.derived.roofSection.courtSideEdge, 6335)
    assert.equal(result.derived.roofSection.courtSideEdge, 6165)
    assert.equal(result.derived.roofSection.direction, 'inward')
    assert.deepEqual(result.derived.spaces, baseline.derived.spaces)
    assert.deepEqual(result.derived.frontAxes, baseline.derived.frontAxes)
  })
})
