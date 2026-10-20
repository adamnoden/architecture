import assert from 'node:assert/strict'
import test from 'node:test'

import type { DrawingScene } from '../publication-drawing/model.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createExternalMaintenancePublicationSource } from './publication-external-maintenance-source.js'
import { createExternalMaintenancePublicationScene } from './publication-external-maintenance.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createFutureAdaptationOverlayScene } from './publication-future-adaptation.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'
import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import { createRoofWaterFailureOverlayScene } from './publication-roof-water-failure.js'
import {
  createFirstServiceMaintenanceOverlayScene,
  createGroundServiceMaintenanceOverlayScene
} from './publication-service-maintenance.js'
import { createStructuralSpanOverlayPublicationScene } from './publication-structural-span.js'
import { createSyntheticSettingPublicationScene } from './publication-synthetic-setting.js'

const compiled = compileReferenceHouse(createReferenceHouseSource())
if (compiled.status === 'FAIL') throw new Error('DRW-10F requires a compiling Reference House.')
const groundSource = createGroundFloorPublicationPlanSource()
const firstSource = createFirstFloorPublicationPlanSource()
const ground = createGroundFloorPublicationPlanScene(compiled, groundSource)
const first = createFirstFloorPublicationPlanScene(compiled, firstSource, groundSource)

const assertSubstrate = (
  name: string,
  overlay: DrawingScene,
  base: DrawingScene,
  expected: { scale: number; width: number; height: number }
): void => {
  assert.equal(overlay.scaleDenominator, expected.scale, `${name}: scale drift`)
  assert.equal(overlay.widthMm, expected.width, `${name}: width drift`)
  assert.equal(overlay.heightMm, expected.height, `${name}: height drift`)
  assert.ok(overlay.primitives.length > base.primitives.length, `${name}: analytical layer missing`)
  assert.deepEqual(
    overlay.primitives.slice(0, base.primitives.length),
    base.primitives,
    `${name}: canonical substrate was not preserved byte-semantically`
  )
}

test('DRW-10F 1:100 plan overlays preserve their canonical substrates unchanged', () => {
  assertSubstrate('structural/span', createStructuralSpanOverlayPublicationScene(), first, { scale: 100, width: 136, height: 145 })
  assertSubstrate('ground service/maintenance', createGroundServiceMaintenanceOverlayScene(), ground, { scale: 100, width: 136, height: 145 })
  assertSubstrate('first service/maintenance', createFirstServiceMaintenanceOverlayScene(), first, { scale: 100, width: 136, height: 145 })
  assertSubstrate('future adaptation', createFutureAdaptationOverlayScene(), ground, { scale: 100, width: 136, height: 145 })
})

test('DRW-10F roof failure reading preserves the controlled 1:100 roof scene', () => {
  const source = createRoofDrainagePublicationSource()
  const base = createRoofDrainagePublicationScene(source)
  const overlay = createRoofWaterFailureOverlayScene(source)
  assertSubstrate('roof water/failure', overlay, base, { scale: 100, width: 166, height: 145 })
})

test('DRW-10F external-maintenance reading preserves the controlled 1:200 synthetic setting', () => {
  const source = createExternalMaintenancePublicationSource()
  const base = createSyntheticSettingPublicationScene(source.setting)
  const overlay = createExternalMaintenancePublicationScene(source)
  assertSubstrate('external maintenance/setting', overlay, base, { scale: 200, width: 166, height: 108 })
})

test('DRW-10F frozen analytical publication roles remain exactly two singles and three facing pairs', () => {
  const roles = [
    ['single', 'structural/span', 100],
    ['pair-left', 'synthetic setting', 200],
    ['pair-right', 'external maintenance/setting', 200],
    ['pair-left', 'ground service/maintenance', 100],
    ['pair-right', 'first service/maintenance', 100],
    ['pair-left', 'roof/drainage', 100],
    ['pair-right', 'roof water/failure', 100],
    ['single', 'future adaptation', 100]
  ] as const

  assert.equal(roles.filter(([role]) => role === 'single').length, 2)
  assert.equal(roles.filter(([role]) => role === 'pair-left').length, 3)
  assert.equal(roles.filter(([role]) => role === 'pair-right').length, 3)
  assert.deepEqual(roles.map(([, , scale]) => scale), [100, 200, 200, 100, 100, 100, 100, 100])
})
