import assert from 'node:assert/strict'
import test from 'node:test'
import { createGardenElevationPublicationSource } from './publication-garden-elevation-source.js'

test('DRW-08C.1 freezes the north view and RH-10 three-field order without laundering it into RH-C1', () => {
  const source = createGardenElevationPublicationSource()
  assert.equal(source.view.value.facade, 'north')
  assert.equal(source.view.value.facadePlaneY, 10800)
  assert.equal(source.view.value.scale, 100)
  assert.equal(source.facadeWidth.value, 12000)
  assert.deepEqual(source.axes.value, [2100, 6000, 9900])
  assert.equal(source.axes.authority, 'RH10_SELECTED_OUTSIDE_RH_C1')
  assert.equal(source.axes.precision, 'approximate')
  assert.deepEqual(source.order.value, {
    fieldCount: 3,
    relationship: 'separated-room-owned-fields-with-masonry-piers',
    continuousGlazedWall: false
  })
})

test('DRW-08C.1 preserves the corrected six opening occurrences and host roles', () => {
  const source = createGardenElevationPublicationSource()
  assert.deepEqual(
    source.openings.filter((opening) => opening.level === 'GROUND').map((opening) => opening.role),
    ['family-room-window', 'garden-dining-threshold', 'kitchen-window-or-door']
  )
  assert.deepEqual(
    source.openings.filter((opening) => opening.level === 'FIRST').map((opening) => opening.role),
    ['principal-bedroom-window', 'dry-storage-window', 'rear-bedroom-window']
  )
  const centreUpper = source.openings.find((opening) => opening.id === 'U-GARDEN-CENTRE')
  assert.ok(centreUpper)
  assert.deepEqual(centreUpper.spaceIds, ['U-DRESS-01'])
  assert.ok(centreUpper.provenance.includes('RH-C0.6'))
})

test('DRW-08C.1 reuses only existing provisional window-family dimensions and keeps unresolved apertures absent', () => {
  const source = createGardenElevationPublicationSource()
  const westGround = source.openings.find((opening) => opening.id === 'G-GARDEN-WEST')
  const westUpper = source.openings.find((opening) => opening.id === 'U-GARDEN-WEST')
  const centreGround = source.openings.find((opening) => opening.id === 'G-GARDEN-CENTRE')
  const eastGround = source.openings.find((opening) => opening.id === 'G-GARDEN-EAST')
  const centreUpper = source.openings.find((opening) => opening.id === 'U-GARDEN-CENTRE')

  assert.ok(westGround && westGround.width !== 'ABSENT')
  assert.equal(westGround.width.authority, 'PROVISIONAL')
  assert.ok(westUpper && westUpper.width !== 'ABSENT')
  assert.equal(westUpper.width.authority, 'PROVISIONAL')

  assert.ok(centreGround)
  assert.equal(centreGround.width, 'ABSENT')
  assert.equal(centreGround.head, 'ABSENT')
  assert.equal(centreGround.clearOpeningTarget?.value, 1200)
  assert.equal(centreGround.clearOpeningTarget?.authority, 'RH10_SELECTED_OUTSIDE_RH_C1')

  assert.ok(eastGround)
  assert.equal(eastGround.width, 'ABSENT')
  assert.equal(eastGround.unresolvedKind, 'window-or-door')

  assert.ok(centreUpper)
  assert.equal(centreUpper.width, 'ABSENT')
})

test('DRW-08C.1 makes remaining elevation absences and legacy geometry quarantine explicit', () => {
  const source = createGardenElevationPublicationSource()
  assert.deepEqual(source.absent, {
    exteriorGrade: 'ABSENT',
    gardenThresholdBuildUp: 'ABSENT',
    gardenDoorApertureWidth: 'ABSENT',
    gardenDoorHead: 'ABSENT',
    kitchenOpeningKind: 'ABSENT',
    kitchenOpeningDimensions: 'ABSENT',
    dryStorageOpeningWidth: 'ABSENT',
    ridgeDatum: 'ABSENT',
    facadePanels: 'ABSENT',
    decorativeGeometry: 'ABSENT'
  })
  assert.deepEqual(source.legacyRh10Svg, {
    status: 'QUARANTINED_COORDINATION_EVIDENCE',
    geometryAuthority: 'NONE'
  })
})
