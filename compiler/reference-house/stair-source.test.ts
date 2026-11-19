import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createReferenceHouseSource } from './fixture.js'
import { compileReferenceHouseSystem } from './system-compile.js'
import { compileReferenceHouseTargetCalculations } from '../rhc5/compile.js'
import { mm } from '../units.js'

test('a common elevation translation preserves stair geometry and translates every landing', () => {
  const source = createReferenceHouseSource()
  const baseline = compileReferenceHouseSystem(source)
  for (const offset of [1000, -2000]) {
    const shifted = createReferenceHouseSource()
    for (const datum of Object.values(shifted.levels)) datum.value = mm(datum.value + offset)
    const translated = compileReferenceHouseSystem(shifted)
    assert.equal(translated.status, baseline.status)
    assert.equal(translated.calculations.privateStairGeometry.status, 'PASS')
    for (const key of ['rise', 'pitch', 'twoRPlusG', 'flightRun'] as const) {
      assert.equal(translated.house.derived.stair[key], baseline.house.derived.stair[key])
    }
    assert.deepEqual(translated.house.derived.stair.landingDatums,
      baseline.house.derived.stair.landingDatums.map(level => level + offset))
    assert.equal(compileReferenceHouseTargetCalculations(shifted).status, 'PASS')
  }
})

test('changing only the lower floor changes rise and the canonical target result', () => {
  const source = createReferenceHouseSource()
  source.levels.groundFfl.value = mm(1000)
  const result = compileReferenceHouseSystem(source)
  assert.equal(result.house.derived.stair.rise, 2300 / 18)
  assert.equal(result.status, 'FAIL')
  assert.equal(result.calculations.privateStairGeometry.criteria.find(c => c.criterionId === 'ADK-K1-PRIVATE-RISE')?.status, 'FAIL')
  assert.deepEqual(result.house.derived.stair.landingDatums, [1000 + 6 * 2300 / 18, 1000 + 12 * 2300 / 18])
})

test('canonical equal flights retain their arithmetic; a different coherent equal-flight control is admitted', () => {
  const source = createReferenceHouseSource()
  const baseline = compileReferenceHouseSystem(source)
  assert.equal(baseline.status, 'PASS')
  assert.equal(baseline.house.derived.stair.rise, 3300 / 18)
  assert.equal(baseline.house.derived.stair.flightRun, 1500)
  assert.deepEqual(baseline.house.derived.stair.landingDatums, [1100, 2200])
  source.stair.riseTopology.value.flightRiseGroups = [9, 9]
  source.stair.goingTopology.value.goingsPerFlight = 8
  const twoFlights = compileReferenceHouseSystem(source)
  assert.equal(twoFlights.status, 'PASS')
  assert.equal(twoFlights.house.derived.stair.flightRun, 2400)
  assert.deepEqual(twoFlights.house.derived.stair.landingDatums, [1650])
})

test('fractional, non-finite, empty and mismatched flight counts cannot pass the canonical compiler', () => {
  const cases = [
    { count: 18, groups: [5.5, 6, 6.5], goings: 5 },
    { count: 18.5, groups: [6, 6, 6.5], goings: 5 },
    { count: 18, groups: [5, 6, 7], goings: 5 },
    { count: 18, groups: [6, 6, 6], goings: 100 },
    { count: 18, groups: [6, 6, 6], goings: 5.5 },
    { count: 0, groups: [], goings: 5 },
    { count: NaN, groups: [6, 6, 6], goings: 5 },
    { count: Infinity, groups: [Infinity], goings: Infinity },
    { count: 18, groups: [6, NaN, 6], goings: 5 },
    { count: 18, groups: [6, 6, 6], goings: NaN }
  ]
  for (const { count, groups, goings } of cases) {
    const source = createReferenceHouseSource()
    source.stair.riseTopology.value = { riserCount: count, flightRiseGroups: groups }
    source.stair.goingTopology.value.goingsPerFlight = goings
    const result = compileReferenceHouseSystem(source)
    assert.equal(result.status, 'FAIL', JSON.stringify({ count, groups, goings }))
    assert.ok(result.house.diagnostics.some(d => d.code.includes('STAIR')))
    assert.match(result.identity.compile.fingerprint, /^[0-9a-f]{64}$/)
  }
})

test('non-finite or reversed floor datums and non-finite going fail with controlled diagnostics', () => {
  for (const value of [NaN, Infinity, -Infinity, 3300, 3400]) {
    const source = createReferenceHouseSource()
    source.levels.groundFfl.value = mm(value)
    const result = compileReferenceHouseSystem(source)
    assert.equal(result.status, 'FAIL')
    assert.ok(result.house.diagnostics.some(d => /LEVEL|STOREY/.test(d.code)))
  }
  for (const key of ['groundCeiling', 'firstFfl', 'upperCeiling'] as const) {
    const source = createReferenceHouseSource()
    source.levels[key].value = mm(NaN)
    const result = compileReferenceHouseSystem(source)
    assert.equal(result.status, 'FAIL')
    assert.ok(result.house.diagnostics.some(d => d.code === 'INVALID_LEVEL_DATUM'))
  }
  for (const value of [NaN, Infinity, -Infinity]) {
    const source = createReferenceHouseSource()
    source.stair.goingTopology.value.going = mm(value)
    assert.ok(compileReferenceHouseSystem(source).house.diagnostics.some(d => d.code === 'INVALID_STAIR_GOING_TOPOLOGY'))
  }
})

test('stair method and lineage identify actual controlling floor and topology facts', () => {
  const source = createReferenceHouseSource()
  source.levels.groundFfl.id = 'LOWER-FLOOR'
  source.levels.firstFfl.id = 'UPPER-FLOOR'
  source.stair.riseTopology.id = 'RISE-TOPOLOGY'
  source.stair.goingTopology.id = 'GOING-TOPOLOGY'
  const result = compileReferenceHouseSystem(source)
  const expected = {
    'ADK-K1-PRIVATE-RISE': ['LOWER-FLOOR', 'UPPER-FLOOR', 'RISE-TOPOLOGY'],
    'ADK-K1-PRIVATE-GOING': ['GOING-TOPOLOGY'],
    'ADK-K1-PRIVATE-PITCH': ['LOWER-FLOOR', 'UPPER-FLOOR', 'RISE-TOPOLOGY', 'GOING-TOPOLOGY'],
    'ADK-K1-PRIVATE-2R+G': ['LOWER-FLOOR', 'UPPER-FLOOR', 'RISE-TOPOLOGY', 'GOING-TOPOLOGY']
  }
  for (const [id, facts] of Object.entries(expected)) {
    assert.deepEqual(result.lineage.privateStairGeometry.criteria[id].sourceFactIds, [...facts].sort())
    const layered = compileReferenceHouseTargetCalculations(source).calculations.privateStairGeometry.criteria.find(c => c.criterionId === id)
    assert.deepEqual([...(layered?.sourceIds ?? [])].sort(), [...facts].sort())
  }
})
