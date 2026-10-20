import assert from 'node:assert/strict'
import test from 'node:test'

import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'
import { createRoofWaterFailureOverlayScene } from './publication-roof-water-failure.js'

test('DRW-10C appends a removable failure-reading layer without changing the canonical roof scene', () => {
  const source = createRoofDrainagePublicationSource()
  const base = createRoofDrainagePublicationScene(source)
  const scene = createRoofWaterFailureOverlayScene(source)

  assert.equal(scene.viewId, 'REFERENCE-HOUSE-ROOF-WATER-FAILURE-OVERLAY')
  assert.equal(scene.scaleDenominator, 100)
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const overlay = scene.primitives.slice(base.primitives.length)
  assert.ok(overlay.length > 0)
  assert.ok(overlay.every((primitive) => primitive.metadata?.overlay === 'roof-water-failure'))
})

test('DRW-10C makes outward visible failure and courtyard redundancy explicit', () => {
  const scene = createRoofWaterFailureOverlayScene()
  const overlay = scene.primitives.filter((primitive) => primitive.metadata?.overlay === 'roof-water-failure')

  assert.equal(
    overlay.filter(
      (primitive) =>
        primitive.kind === 'line' &&
        primitive.metadata?.role === 'visible-outward-failure-direction-not-outlet-coordinate'
    ).length,
    12
  )
  assert.ok(overlay.some((primitive) => primitive.id === 'failure-court-primary-title'))
  assert.ok(overlay.some((primitive) => primitive.id === 'failure-court-emergency-title'))
  assert.ok(overlay.some((primitive) => primitive.metadata?.priority === 'discharge-before-occupied-threshold-flooding'))
})

test('DRW-10C keeps technical water-management geometry absent', () => {
  const scene = createRoofWaterFailureOverlayScene()
  const collection = scene.primitives.find((primitive) => primitive.id === 'failure-external-collection-zone')
  const court = scene.primitives.find((primitive) => primitive.id === 'failure-court-collector-zone')
  const primary = scene.primitives.find((primitive) => primitive.id === 'failure-court-primary-note')
  const emergency = scene.primitives.find((primitive) => primitive.id === 'failure-court-emergency-note')

  assert.equal(collection?.metadata?.gutterProfile, 'ABSENT_TECHNICAL')
  assert.equal(collection?.metadata?.hydraulicSizing, 'ABSENT_TECHNICAL')
  assert.equal(court?.metadata?.collectorDimensions, 'ABSENT_TECHNICAL')
  assert.equal(primary?.metadata?.exactCentreline, 'ABSENT')
  assert.equal(emergency?.metadata?.exactLevel, 'ABSENT')

  assert.equal(scene.primitives.some((primitive) => primitive.id.includes('rwp-coordinate')), false)
  assert.equal(scene.primitives.some((primitive) => primitive.id.includes('drain-centreline')), false)
})

test('DRW-10F keeps roof-failure absence notes clear of the inherited scale bar', () => {
  const scene = createRoofWaterFailureOverlayScene()
  const absenceNotes = scene.primitives.filter(
    (primitive) => primitive.kind === 'text' && primitive.id.startsWith('failure-absence-')
  )

  assert.equal(absenceNotes.length, 4)
  assert.ok(absenceNotes.every((primitive) => primitive.kind === 'text' && primitive.x >= 134))
  assert.ok(absenceNotes.some((primitive) => primitive.kind === 'text' && primitive.value === 'no internal outlet'))
  assert.ok(absenceNotes.some((primitive) => primitive.kind === 'text' && primitive.value === 'no hidden court gutter'))
  assert.ok(absenceNotes.some((primitive) => primitive.kind === 'text' && primitive.value === 'no sizing / coordinates'))
})
