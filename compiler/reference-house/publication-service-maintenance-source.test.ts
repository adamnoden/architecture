import assert from 'node:assert/strict'
import test from 'node:test'

import { createServiceMaintenanceOverlaySource } from './publication-service-maintenance-source.js'

test('DRW-10B selects the bounded RHC3 service geography without inventing routes', () => {
  const source = createServiceMaintenanceOverlaySource()

  assert.equal(source.views.ground.scale, 100)
  assert.equal(source.views.first.scale, 100)
  assert.equal(source.topology.value.fixtureId, 'RH-C3-REFERENCE-HOUSE-SERVICES')

  assert.deepEqual(source.ground.plantHostSpaceIds.value, ['G-SVC-02'])
  assert.deepEqual(source.ground.wetHostSpaceIds.value, ['G-KIT-02', 'G-SVC-02'])
  assert.deepEqual(source.ground.distributionHostSpaceIds.value, ['G-GAL-01', 'G-HALL-02'])
  assert.deepEqual(source.ground.protectedPrimarySpaceIds.value, ['G-DRAW-02', 'G-FAM-02'])

  assert.deepEqual(source.first.wetHostSpaceIds.value, ['U-BATH-01'])
  assert.deepEqual(source.first.distributionHostSpaceIds.value, ['U-GAL-02', 'U-STAIR-01', 'U-LAND-N01'])
  assert.deepEqual(source.first.protectedPrimarySpaceIds.value, ['U-BED-02', 'U-BED-P01', 'U-BED-03', 'U-BED-04'])
  assert.equal(source.first.remoteEnsuiteInfrastructure.value, 'REMOVED_RATHER_THAN_ADD_SECOND_PERMANENT_STACK')

  assert.equal(source.technicalAbsences.routeCentrelines, 'ABSENT_TECHNICAL')
  assert.equal(source.technicalAbsences.exactPipeDuctCableSizes, 'ABSENT_TECHNICAL')
  assert.equal(source.technicalAbsences.plantPacking, 'ABSENT_TECHNICAL')
  assert.equal(source.technicalAbsences.penetrationCoordinates, 'ABSENT_TECHNICAL')
})

test('DRW-10B reuses the existing service reservation and access authority rather than promoting it', () => {
  const source = createServiceMaintenanceOverlaySource()

  assert.equal(source.ground.riserReservation.id, 'DRW08A-SV-01')
  assert.equal(source.ground.riserReservation.value.id, 'SV-01')
  assert.equal(source.ground.riserReservation.authority, 'RH06_SELECTED_OUTSIDE_RH_C1')
  assert.equal(source.ground.riserReservation.precision, 'approximate')
  assert.equal(source.ground.access.value.ground, 'G-GAL-01-or-G-PLANT-01')
  assert.equal(source.first.access.value.upper, 'U-GAL-02-dry-side-to-bathroom-service-edge')
})
