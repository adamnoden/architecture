import assert from 'node:assert/strict'
import test from 'node:test'
import { createSyntheticSettingPublicationScene } from './publication-synthetic-setting.js'
import { createSyntheticSettingPublicationSource } from './publication-synthetic-setting-source.js'

test('DRW-08E renders controlled house/court and lateral stress lines without a plot rectangle', () => {
  const scene = createSyntheticSettingPublicationScene(createSyntheticSettingPublicationSource())
  assert.equal(scene.scaleDenominator, 200)
  const rects = scene.primitives.filter((primitive) => primitive.kind === 'rect')
  assert.deepEqual(rects.map((primitive) => primitive.id), ['setting-house-shell', 'setting-court'])
  assert.ok(scene.primitives.some((primitive) => primitive.id === 'surrogate-west-stress-line'))
  assert.ok(scene.primitives.some((primitive) => primitive.id === 'surrogate-east-stress-line'))
})

test('DRW-08E preserves open front/rear context and site absences in notation', () => {
  const scene = createSyntheticSettingPublicationScene(createSyntheticSettingPublicationSource())
  const front = scene.primitives.find((primitive) => primitive.id === 'front-open-note')
  const rear = scene.primitives.find((primitive) => primitive.id === 'rear-open-note')
  const absence = scene.primitives.find((primitive) => primitive.id === 'site-absence-note')
  assert.ok(front && rear && absence)
  assert.equal(front.metadata?.boundary, 'ABSENT')
  assert.equal(rear.metadata?.boundary, 'ABSENT')
})

test('DRW-08E does not draw maintenance-task overlays reserved for DRW-10D', () => {
  const scene = createSyntheticSettingPublicationScene(createSyntheticSettingPublicationSource())
  for (const forbidden of ['scaffold', 'tower', 'withdrawal', 'support-zone', 'ashp-footprint']) {
    assert.equal(scene.primitives.some((primitive) => primitive.id.includes(forbidden)), false)
  }
})
