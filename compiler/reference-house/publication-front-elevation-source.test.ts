import assert from 'node:assert/strict'
import test from 'node:test'
import { createFrontElevationPublicationSource } from './publication-front-elevation-source.js'

test('DRW-06B derives only the controlled front-field geometry', () => {
  const source = createFrontElevationPublicationSource()
  assert.equal(source.view.value.facade, 'south')
  assert.equal(source.view.value.facadePlaneY, 0)
  assert.equal(source.facadeWidth.value, 12000)
  assert.deepEqual(source.bayAxes.value, [1950, 4650, 7350, 10050])
  assert.equal(source.entranceBay.value, 3)
  assert.deepEqual(
    source.openings.filter((opening) => opening.level === 'GROUND').map((opening) => opening.role),
    ['principal-window', 'stair-window', 'entrance', 'principal-window']
  )
})

test('DRW-06B preserves provisional vertical, opening and roof authority', () => {
  const source = createFrontElevationPublicationSource()
  assert.equal(source.levels.groundFfl.authority, 'CONTROLLED')
  assert.equal(source.levels.groundCeiling.value, 2950)
  assert.equal(source.levels.firstFfl.value, 3300)
  assert.equal(source.levels.upperCeiling.value, 6000)
  assert.equal(source.levels.corniceControl.authority, 'PROVISIONAL')
  assert.equal(source.roof.authority, 'PROVISIONAL')
  assert.ok(source.openings.every((opening) => opening.width.authority === 'PROVISIONAL'))
  assert.ok(source.openings.every((opening) => opening.sill.authority === 'PROVISIONAL'))
  assert.ok(source.openings.every((opening) => opening.head.authority === 'PROVISIONAL'))
})

test('DRW-06B makes absent facade geometry machine-visible rather than inventing it', () => {
  const source = createFrontElevationPublicationSource()
  assert.deepEqual(source.absent, {
    ridgeDatum: 'ABSENT',
    exteriorGrade: 'ABSENT',
    canopy: 'ABSENT',
    facadePanels: 'ABSENT',
    visibleSlabLines: 'ABSENT',
    decorativeGeometry: 'ABSENT'
  })
  assert.equal('ridgeHeight' in source, false)
  assert.equal('gradeLevel' in source, false)
  assert.equal('panelEdges' in source, false)
})
