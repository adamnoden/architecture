import assert from 'node:assert/strict'
import test from 'node:test'

import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'

test('DRW-07B reuses the exact controlled shell and courtyard substrate', () => {
  const source = createRoofDrainagePublicationSource()

  assert.equal(source.view.value.scale, 100)
  assert.equal(source.view.value.orientation, 'south-front-model-y0')
  assert.deepEqual(source.substrate.shell.value, { width: 12000, depth: 10800 })
  assert.deepEqual(source.substrate.court.value, {
    width: 3600,
    depth: 4000,
    x0: 4200,
    x1: 7800,
    y0: 3400,
    y1: 7400
  })
  assert.equal(source.substrate.shell.authority, 'CONTROLLED')
  assert.equal(source.substrate.court.authority, 'CONTROLLED')
})

test('DRW-07B derives exact field geometry without promoting provisional roof authority', () => {
  const source = createRoofDrainagePublicationSource()
  const polygons = Object.fromEntries(source.fields.map((field) => [field.side, field.polygon.value]))

  assert.deepEqual(polygons.SOUTH, [
    { x: 0, y: 0 }, { x: 12000, y: 0 }, { x: 7800, y: 3400 }, { x: 4200, y: 3400 }
  ])
  assert.deepEqual(polygons.NORTH, [
    { x: 0, y: 10800 }, { x: 4200, y: 7400 }, { x: 7800, y: 7400 }, { x: 12000, y: 10800 }
  ])
  assert.ok(source.fields.every((field) => field.polygon.authority === 'PROVISIONAL'))
  assert.ok(source.fields.every((field) => field.fallDirection.authority === 'RH08_SELECTED_OUTSIDE_RH_C1'))
  assert.equal(source.roofFamily.authority, 'PROVISIONAL')
  assert.equal(source.roofFamily.value.screeningFallDenominator, 40)
})

test('DRW-07B reproduces RH-08 catchment proxies as outside-RH-C1 derived values', () => {
  const source = createRoofDrainagePublicationSource()
  const catchments = Object.fromEntries(source.fields.map((field) => [field.side, field.catchment.squareMetres]))

  assert.deepEqual(catchments, { SOUTH: 26.52, NORTH: 26.52, WEST: 31.08, EAST: 31.08 })
  assert.ok(source.fields.every((field) => field.catchment.authority === 'OUTSIDE_RH_C1_DERIVED'))
  assert.equal(Object.values(catchments).reduce((sum, area) => sum + area, 0), 115.2)
})

test('DRW-07B derives watersheds from canonical corners while retaining provisional provenance', () => {
  const source = createRoofDrainagePublicationSource()
  assert.deepEqual(source.watersheds.map(({ id, from, to }) => ({ id, from, to })), [
    { id: 'ROOF-WATERSHED-SW', from: { x: 0, y: 0 }, to: { x: 4200, y: 3400 } },
    { id: 'ROOF-WATERSHED-SE', from: { x: 12000, y: 0 }, to: { x: 7800, y: 3400 } },
    { id: 'ROOF-WATERSHED-NW', from: { x: 0, y: 10800 }, to: { x: 4200, y: 7400 } },
    { id: 'ROOF-WATERSHED-NE', from: { x: 12000, y: 10800 }, to: { x: 7800, y: 7400 } }
  ])
  assert.ok(source.watersheds.every((watershed) => watershed.authority === 'PROVISIONAL'))
})

test('DRW-07B carries RWP identity and zone without laundering diagram pixels into exact coordinates', () => {
  const source = createRoofDrainagePublicationSource()

  assert.deepEqual(source.rwps.map(({ id, zone, exactPosition }) => ({ id, zone, exactPosition })), [
    { id: 'RWP-SW', zone: 'west-side-return-just-behind-principal-front', exactPosition: 'ABSENT' },
    { id: 'RWP-SE', zone: 'east-service-side-return-just-behind-principal-front', exactPosition: 'ABSENT' },
    { id: 'RWP-NW', zone: 'rear-west-return', exactPosition: 'ABSENT' },
    { id: 'RWP-NE', zone: 'rear-east-service-return', exactPosition: 'ABSENT' }
  ])
  assert.ok(source.rwps.every((rwp) => !('x' in rwp) && !('y' in rwp)))
  assert.equal(source.selectedAbsences.principalFrontRwp, 'ABSENT_SELECTED')
})

test('DRW-07B preserves courtyard drainage topology without inventing pipe geometry', () => {
  const source = createRoofDrainagePublicationSource()

  assert.equal(source.courtWater.primaryCollector.value.zone, 'east-service-side-of-courtyard')
  assert.equal(source.courtWater.primaryCollector.value.exactGeometry, 'ABSENT')
  assert.equal(source.courtWater.primaryRoute.value.through, 'east-service-gallery-strip')
  assert.equal(source.courtWater.primaryRoute.value.exactCentreline, 'ABSENT')
  assert.equal(source.courtWater.emergencyOverflow.value.outlet, 'visible-east-service-side-external-outlet')
  assert.equal(source.courtWater.emergencyOverflow.value.exactLevel, 'ABSENT')
  assert.ok(Object.values(source.courtWater).every((relation) => relation.authority === 'RH08_SELECTED_OUTSIDE_RH_C1'))
})

test('DRW-07B makes selected and technical absences machine-visible', () => {
  const source = createRoofDrainagePublicationSource()

  assert.ok(Object.values(source.selectedAbsences).every((value) => value === 'ABSENT_SELECTED'))
  assert.ok(Object.values(source.technicalAbsences).every((value) => value === 'ABSENT_TECHNICAL'))
  assert.equal(source.roofService.value.exactPosition, 'ABSENT')
  assert.equal(source.legacyRh08Svg.status, 'QUARANTINED_COORDINATION_EVIDENCE')
  assert.equal(source.legacyRh08Svg.geometryAuthority, 'NONE')
})
