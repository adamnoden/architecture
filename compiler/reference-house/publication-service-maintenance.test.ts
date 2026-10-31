import assert from 'node:assert/strict'
import test from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import {
  createFirstServiceMaintenanceOverlayScene,
  createGroundServiceMaintenanceOverlayScene
} from './publication-service-maintenance.js'

const compiled = () => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  assert.notEqual(result.status, 'FAIL')
  return result
}

test('DRW-10B appends a removable ground service-geography layer without changing the canonical plan', () => {
  const result = compiled()
  const groundSource = createGroundFloorPublicationPlanSource()
  const base = createGroundFloorPublicationPlanScene(result, groundSource)
  const scene = createGroundServiceMaintenanceOverlayScene()

  assert.equal(scene.viewId, 'REFERENCE-HOUSE-GROUND-SERVICE-MAINTENANCE-OVERLAY')
  assert.equal(scene.scaleDenominator, 100)
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const overlay = scene.primitives.slice(base.primitives.length)
  assert.ok(overlay.length > 0)
  assert.equal(overlay.some((primitive) => primitive.kind === 'line'), false)
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'plant-host'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'wet-host'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'distribution-host'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.role === 'vertical-service-reservation-not-packed-services'))
})

test('DRW-10B appends a removable first-floor service-geography layer without ghost en-suite geometry', () => {
  const result = compiled()
  const groundSource = createGroundFloorPublicationPlanSource()
  const firstSource = createFirstFloorPublicationPlanSource()
  const base = createFirstFloorPublicationPlanScene(result, firstSource, groundSource)
  const scene = createFirstServiceMaintenanceOverlayScene()

  assert.equal(scene.viewId, 'REFERENCE-HOUSE-FIRST-SERVICE-MAINTENANCE-OVERLAY')
  assert.equal(scene.scaleDenominator, 100)
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const overlay = scene.primitives.slice(base.primitives.length)
  assert.equal(overlay.some((primitive) => primitive.kind === 'line'), false)
  assert.ok(overlay.some((primitive) => primitive.metadata?.space === 'U-BATH-01'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.space === 'U-GAL-02'))
  assert.equal(overlay.some((primitive) => primitive.metadata?.space === 'U-ENSUITE-01'), false)

  const note = overlay.find((primitive) => primitive.id === 'service-first-note')
  assert.equal(note?.metadata?.remoteEnsuiteInfrastructure, 'REMOVED_RATHER_THAN_ADD_SECOND_PERMANENT_STACK')
})

test('DRW-10B overlay metadata keeps route centrelines explicitly absent', () => {
  for (const scene of [createGroundServiceMaintenanceOverlayScene(), createFirstServiceMaintenanceOverlayScene()]) {
    const analytical = scene.primitives.filter((primitive) => primitive.metadata?.overlay === 'service-maintenance-geography')
    assert.ok(analytical.length > 0)
    assert.equal(analytical.some((primitive) => primitive.kind === 'line'), false)
    assert.ok(analytical.some((primitive) => primitive.metadata?.routeCentrelines === 'ABSENT_TECHNICAL'))
  }
})
