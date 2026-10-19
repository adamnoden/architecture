import assert from 'node:assert/strict'
import test from 'node:test'
import { createServiceSideElevationPublicationScene } from './publication-service-side-elevation.js'
import { createServiceSideElevationPublicationSource } from './publication-service-side-elevation-source.js'

test('DRW-08E.2 renders the east service facade at true 1:100 without fit-scale invention', () => {
  const scene = createServiceSideElevationPublicationScene(createServiceSideElevationPublicationSource())
  assert.equal(scene.widthMm, 166)
  assert.equal(scene.heightMm, 96)
  assert.equal(scene.scaleDenominator, 100)
  assert.equal(scene.viewId, 'REFERENCE-HOUSE-SERVICE-SIDE-ELEVATION')
})

test('DRW-08E.2 uses field ticks and editorial occurrence notation, never fabricated aperture rectangles', () => {
  const scene = createServiceSideElevationPublicationScene(createServiceSideElevationPublicationSource())
  assert.equal(scene.primitives.some((primitive) => primitive.kind === 'rect'), false)
  for (const id of ['service-field-middle-tick', 'service-field-north-tick']) {
    const primitive = scene.primitives.find((candidate) => candidate.id === id)
    assert.ok(primitive && primitive.kind === 'line')
    assert.equal(primitive.metadata?.treatment, 'plan-owned-field-break-not-facade-seam')
  }
  for (const id of ['service-study-window', 'service-bathroom-window', 'service-plant-opening', 'service-kitchen-window']) {
    const primitive = scene.primitives.find((candidate) => candidate.id === id)
    assert.ok(primitive && primitive.kind === 'text')
    assert.equal(primitive.metadata?.geometry, 'ABSENT')
  }
})

test('DRW-08E.2 keeps technical service notation explicitly non-coordinate', () => {
  const scene = createServiceSideElevationPublicationScene(createServiceSideElevationPublicationSource())
  for (const id of ['service-mvhr-zone', 'service-utility-zone', 'service-ashp-zone', 'service-cooker-zone', 'service-rwp-zones', 'service-soil-vent-zone']) {
    const primitive = scene.primitives.find((candidate) => candidate.id === id)
    assert.ok(primitive && primitive.kind === 'text')
    assert.equal(primitive.metadata?.geometry, 'ABSENT_TECHNICAL')
    assert.equal(primitive.metadata?.treatment, 'qualitative-zone-notation-not-terminal-coordinate')
  }
})

test('DRW-08E.2 records the service-side authority warnings in reader notation', () => {
  const scene = createServiceSideElevationPublicationScene(createServiceSideElevationPublicationSource())
  const textValues = scene.primitives.filter((primitive) => primitive.kind === 'text').map((primitive) => primitive.value)
  assert.ok(textValues.includes('plant opening ≈1.0 m clear target'))
  assert.ok(textValues.includes('position / head unresolved'))
  assert.ok(textValues.includes('RWP-SE / RWP-NE · return zones only; centrelines absent'))
  assert.ok(textValues.includes('Field ticks show ownership, not facade seams · service labels are zones, not MEP coordinates.'))
})
