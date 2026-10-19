import assert from 'node:assert/strict'
import test from 'node:test'
import { createCourtyardElevationPublicationSource } from './publication-courtyard-elevation-source.js'

test('DRW-08D.1 freezes a true-1:50 four-face courtyard family on controlled court geometry', () => {
  const source = createCourtyardElevationPublicationSource()
  assert.equal(source.view.value.scale, 50)
  assert.equal(source.view.value.representation, 'four-face-family')
  assert.equal(source.court.value.width, 3600)
  assert.equal(source.court.value.depth, 4000)
  assert.deepEqual(source.faces.map((face) => [face.id, face.width]), [
    ['SOUTH', 3600], ['NORTH', 3600], ['EAST', 4000], ['WEST', 4000]
  ])
})

test('DRW-08D.1 keeps north/south centred order but refuses to invent their aperture sizes', () => {
  const source = createCourtyardElevationPublicationSource()
  for (const id of ['SOUTH', 'NORTH'] as const) {
    const face = source.faces.find((candidate) => candidate.id === id)
    assert.ok(face)
    assert.equal(face.axisCount, 1)
    assert.deepEqual(face.axisCoordinates, [1800])
    assert.equal(face.apertureGeometry, 'ABSENT')
    assert.equal(face.groundOccurrenceIds.length, 1)
    assert.equal(face.firstOccurrenceIds.length, 1)
  }
})

test('DRW-08D.1 preserves east/west two-axis relationships while keeping numeric centres absent', () => {
  const source = createCourtyardElevationPublicationSource()
  for (const id of ['EAST', 'WEST'] as const) {
    const face = source.faces.find((candidate) => candidate.id === id)
    assert.ok(face)
    assert.equal(face.axisCount, 2)
    assert.equal(face.axisCoordinates, 'ABSENT')
    assert.equal(face.axisAuthority, 'ABSENT')
    assert.equal(face.apertureGeometry, 'ABSENT')
  }
})

test('DRW-08D.1 prevents the legacy schematic from becoming publication geometry', () => {
  const source = createCourtyardElevationPublicationSource()
  assert.equal(source.commonOrder.value.principalFacadeGridInherited, false)
  assert.deepEqual(source.legacyRh04Svg, {
    status: 'QUARANTINED_COORDINATION_EVIDENCE',
    geometryAuthority: 'NONE'
  })
  assert.equal(source.absent.courtyardGrade, 'ABSENT')
  assert.equal(source.absent.decorativeTreatment, 'ABSENT')
})
