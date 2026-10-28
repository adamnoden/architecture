import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createReferenceHouseSource } from './fixture.js'
import { compileReferenceHouseSystem } from './system-compile.js'
import { mm } from '../units.js'

test('lineage follows actual authored fact IDs without changing numeric derivations', () => {
  const source = createReferenceHouseSource()
  const baseline = compileReferenceHouseSystem(source)
  source.levels.groundCeiling.id = 'ALT-CEILING'
  source.levels.firstFfl.id = 'ALT-FFL'
  source.shell.width.id = 'ALT-WIDTH'
  source.shell.depth.id = 'ALT-DEPTH'
  source.court.id = 'ALT-COURT'
  source.wallPlanning.stressThickness.id = 'ALT-WALL'
  const result = compileReferenceHouseSystem(source)
  assert.equal(result.floorZoneDepth, baseline.floorZoneDepth)
  assert.deepEqual(result.lineage.floorZoneDepth.sourceFactIds, ['ALT-CEILING', 'ALT-FFL'])
  assert.deepEqual(result.lineage.boundaryCoordination.roofCatchmentTotal.sourceFactIds, ['ALT-WIDTH', 'ALT-DEPTH', 'ALT-COURT'])
  assert.deepEqual(result.lineage.boundaryCoordination.enclosedPlateArea.sourceFactIds, ['ALT-WIDTH', 'ALT-DEPTH', 'ALT-COURT'])
  assert.deepEqual(result.lineage.boundaryCoordination.courtyardOpenSkyArea.sourceFactIds, ['ALT-COURT'])
  assert.deepEqual(result.lineage.boundaryCoordination.wallPlanningStressThickness.sourceFactIds, ['ALT-WALL'])
})

test('non-finite source still returns controlled FAIL with a diagnostic compile identity', () => {
  const source = createReferenceHouseSource()
  source.shell.width.value = mm(NaN)
  const result = compileReferenceHouseSystem(source)
  assert.equal(result.status, 'FAIL')
  assert.match(result.identity.compile.fingerprint, /^[0-9a-f]{64}$/)
})
