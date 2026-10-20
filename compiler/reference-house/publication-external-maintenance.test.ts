import assert from 'node:assert/strict'
import test from 'node:test'

import { createExternalMaintenancePublicationScene } from './publication-external-maintenance.js'
import { createExternalMaintenancePublicationSource } from './publication-external-maintenance-source.js'
import { createSyntheticSettingPublicationScene } from './publication-synthetic-setting.js'

test('DRW-10D keeps the complete DRW-08E synthetic setting as an unchanged 1:200 substrate', () => {
  const source = createExternalMaintenancePublicationSource()
  const base = createSyntheticSettingPublicationScene(source.setting)
  const scene = createExternalMaintenancePublicationScene(source)

  assert.equal(scene.viewId, 'REFERENCE-HOUSE-EXTERNAL-MAINTENANCE-SETTING-OVERLAY')
  assert.equal(scene.scaleDenominator, 200)
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const overlay = scene.primitives.slice(base.primitives.length)
  assert.ok(overlay.length > 0)
  assert.ok(overlay.every((primitive) => primitive.metadata?.overlay === 'external-maintenance-setting'))
})

test('DRW-10D spatialises only the existing side capacities and controlled courtyard', () => {
  const source = createExternalMaintenancePublicationSource()
  const base = createSyntheticSettingPublicationScene(source.setting)
  const scene = createExternalMaintenancePublicationScene(source)

  const house = base.primitives.find((primitive) => primitive.id === 'setting-house-shell')
  const court = base.primitives.find((primitive) => primitive.id === 'setting-court')
  const westStress = base.primitives.find((primitive) => primitive.id === 'surrogate-west-stress-line')
  const eastStress = base.primitives.find((primitive) => primitive.id === 'surrogate-east-stress-line')
  const west = scene.primitives.find((primitive) => primitive.id === 'maintenance-west-capacity')
  const east = scene.primitives.find((primitive) => primitive.id === 'maintenance-east-capacity')
  const courtWorking = scene.primitives.find((primitive) => primitive.id === 'maintenance-court-working-area')

  assert.ok(house?.kind === 'rect')
  assert.ok(court?.kind === 'rect')
  assert.ok(westStress?.kind === 'line')
  assert.ok(eastStress?.kind === 'line')
  assert.ok(west?.kind === 'rect')
  assert.ok(east?.kind === 'rect')
  assert.ok(courtWorking?.kind === 'rect')

  assert.equal(west.x, westStress.a.x)
  assert.equal(west.x + west.width, house.x)
  assert.equal(east.x, house.x + house.width)
  assert.equal(east.x + east.width, eastStress.a.x)
  assert.deepEqual(
    { x: courtWorking.x, y: courtWorking.y, width: courtWorking.width, height: courtWorking.height },
    { x: court.x, y: court.y, width: court.width, height: court.height }
  )

  assert.equal(west.metadata?.role, 'west-ground-supported-access-capacity-not-support-footprint')
  assert.equal(east.metadata?.role, 'east-service-access-capacity-not-equipment-clearance')
  assert.equal(courtWorking.metadata?.role, 'courtyard-working-area-not-tower-footprint')
})

test('DRW-10D refuses pseudo-site and temporary-works geometry', () => {
  const source = createExternalMaintenancePublicationSource()
  const scene = createExternalMaintenancePublicationScene(source)
  const overlay = scene.primitives.filter((primitive) => primitive.metadata?.overlay === 'external-maintenance-setting')

  assert.equal(overlay.some((primitive) => primitive.kind === 'line'), false)
  assert.equal(source.setting.laterOverlay.owner, 'DRW-10D')
  assert.equal(source.absences.exactScaffoldFootprint, 'ABSENT_TECHNICAL')
  assert.equal(source.absences.exactTowerFootprint, 'ABSENT_TECHNICAL')
  assert.equal(source.absences.exactSupportZoneDimensions, 'ABSENT_TECHNICAL')
  assert.equal(source.absences.temporarySupportLoads, 'ABSENT_TECHNICAL')
  assert.equal(source.absences.exactAshpPosition, 'ABSENT')
  assert.equal(source.absences.manufacturerWorkingClearance, 'ABSENT_TECHNICAL')
  assert.equal(source.absences.legalBoundary, 'ABSENT')
  assert.equal(source.absences.plotDepth, 'ABSENT')
  assert.equal(source.absences.roadOrHighwayLine, 'ABSENT')
  assert.equal(source.absences.plantingAndMatureCanopies, 'ABSENT')
  assert.equal(source.absences.routeCentreline, 'ABSENT')
})
