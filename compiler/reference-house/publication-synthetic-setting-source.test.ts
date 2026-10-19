import assert from 'node:assert/strict'
import test from 'node:test'
import { createSyntheticSettingPublicationSource } from './publication-synthetic-setting-source.js'

test('DRW-08E owns only the documented surrogate width, not a fictional site rectangle', () => {
  const source = createSyntheticSettingPublicationSource()
  assert.equal(source.view.value.scale, 200)
  assert.equal(source.house.shell.value.width, 12000)
  assert.equal(source.house.shell.value.depth, 10800)
  assert.equal(source.surrogate.width.value, 15500)
  assert.equal(source.surrogate.sideClearance.value, 1750)
  assert.equal(source.surrogate.width.authority, 'SURROGATE_SETTING_OUTSIDE_RH_C1')
  assert.equal(source.surrogate.sideClearance.precision, 'approximate')
})

test('DRW-08E keeps real-site facts explicitly absent', () => {
  const source = createSyntheticSettingPublicationSource()
  assert.deepEqual(source.absences, {
    plotDepth: 'ABSENT',
    legalBoundary: 'ABSENT',
    frontBoundary: 'ABSENT',
    rearBoundary: 'ABSENT',
    highwayOrRoadLine: 'ABSENT',
    neighbours: 'ABSENT',
    geographicNorth: 'ABSENT',
    topography: 'ABSENT',
    plantingAndMatureCanopies: 'ABSENT',
    actualDrainageAndChambers: 'ABSENT',
    actualUtilityApproach: 'ABSENT',
    exactSiteEntrance: 'ABSENT',
    ashpExactPosition: 'ABSENT'
  })
  assert.equal(source.legacyMaintenanceSvg.geometryAuthority, 'NONE')
})

test('DRW-08E keeps analytical maintenance geometry for DRW-10D rather than duplicating it', () => {
  const source = createSyntheticSettingPublicationSource()
  assert.deepEqual(source.laterOverlay, {
    owner: 'DRW-10D',
    geometryAuthority: 'NOT_PART_OF_SETTING_SUBSTRATE'
  })
})
