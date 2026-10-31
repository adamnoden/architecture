import assert from 'node:assert/strict'
import test from 'node:test'

import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import { createStructuralSpanOverlayPublicationScene } from './publication-structural-span.js'

test('DRW-10A leaves the canonical first-floor substrate byte-equivalent at primitive level and appends a removable overlay', () => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  const ground = createGroundFloorPublicationPlanSource()
  const first = createFirstFloorPublicationPlanSource()
  const base = createFirstFloorPublicationPlanScene(result, first, ground)
  const scene = createStructuralSpanOverlayPublicationScene()

  assert.equal(scene.scaleDenominator, 100)
  assert.equal(scene.widthMm, base.widthMm)
  assert.equal(scene.heightMm, base.heightMm)
  assert.deepEqual(scene.primitives.slice(0, base.primitives.length), base.primitives)

  const overlay = scene.primitives.slice(base.primitives.length)
  assert.ok(overlay.length > 0)
  assert.ok(overlay.every((primitive) => primitive.metadata?.overlay === 'structural-span'))
})

test('DRW-10A shows exactly four gross span readings without drawing joist centrelines', () => {
  const scene = createStructuralSpanOverlayPublicationScene()
  const spanLines = scene.primitives.filter((primitive) => primitive.kind === 'line' && primitive.id.startsWith('span-') && !primitive.id.includes('-a') && !primitive.id.includes('-b'))
  const mainSpanLines = spanLines.filter((primitive) => ['span-WEST-SIDE', 'span-EAST-SIDE', 'span-SOUTH-CENTRE', 'span-NORTH-CENTRE'].includes(primitive.id))
  assert.equal(mainSpanLines.length, 4)
  assert.ok(mainSpanLines.every((primitive) => primitive.metadata?.role === 'gross-span-direction-not-joist-centreline'))
  assert.equal(scene.primitives.some((primitive) => primitive.id.includes('joist-centreline')), false)
})

test('DRW-10A identifies permanent courtyard support order and local framing obligations without member geometry', () => {
  const scene = createStructuralSpanOverlayPublicationScene()
  for (const id of ['support-court-south', 'support-court-north', 'support-court-west', 'support-court-east']) {
    const support = scene.primitives.find((primitive) => primitive.id === id)
    assert.ok(support && support.kind === 'line')
    assert.equal(support.metadata?.role, 'permanent-masonry-support-order-not-member-centreline')
  }

  const service = scene.primitives.find((primitive) => primitive.id === 'structural-service-opening-reservation')
  assert.ok(service && service.kind === 'rect')
  assert.equal(service.dash, 'provisional')
  assert.equal(service.metadata?.finalStructuralOpening, 'ABSENT_TECHNICAL')

  const absence = scene.primitives.find((primitive) => primitive.id === 'structural-absence-note')
  assert.ok(absence && absence.kind === 'text')
  assert.equal(absence.metadata?.memberSizes, 'ABSENT_STRUCTURAL_ENGINEERING')
  assert.equal(absence.metadata?.joistCentrelines, 'ABSENT_STRUCTURAL_ENGINEERING')
})
