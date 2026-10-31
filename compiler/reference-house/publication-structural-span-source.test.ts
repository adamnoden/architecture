import assert from 'node:assert/strict'
import test from 'node:test'

import { createStructuralSpanOverlaySource } from './publication-structural-span-source.js'

test('DRW-10A derives the four gross span readings from canonical shell/court geometry', () => {
  const source = createStructuralSpanOverlaySource()
  assert.equal(source.view.scale, 100)
  assert.equal(source.substrate.shell.width.value, 12000)
  assert.equal(source.substrate.shell.depth.value, 10800)
  assert.deepEqual(source.substrate.court.extents.value, { x0: 4200, x1: 7800, y0: 3400, y1: 7400 })

  assert.deepEqual(source.structuralConcept.spanRegions.value.map(({ id, direction, grossSpan, qualification }) => ({ id, direction, grossSpan, qualification })), [
    { id: 'WEST-SIDE', direction: 'east-west', grossSpan: 4200, qualification: 'ordinary-gross-span' },
    { id: 'EAST-SIDE', direction: 'east-west', grossSpan: 4200, qualification: 'ordinary-gross-span' },
    { id: 'SOUTH-CENTRE', direction: 'north-south', grossSpan: 3400, qualification: 'local-stair-framing-modifies-field' },
    { id: 'NORTH-CENTRE', direction: 'north-south', grossSpan: 3400, qualification: 'ordinary-gross-span' }
  ])
})

test('DRW-10A keeps the current structural concept outside RH-C1 rather than pretending member design is controlled', () => {
  const source = createStructuralSpanOverlaySource()
  assert.equal(source.structuralConcept.permanentSupportOrder.authority, 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1')
  assert.equal(source.structuralConcept.spanRegions.authority, 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1')
  assert.equal(source.structuralConcept.courtEdgeBeamFamily.value.exactMemberExtents, 'ABSENT_STRUCTURAL_ENGINEERING')
  assert.equal(source.absences.memberSizes, 'ABSENT_STRUCTURAL_ENGINEERING')
  assert.equal(source.absences.joistCentrelines, 'ABSENT_STRUCTURAL_ENGINEERING')
  assert.equal(source.absences.foundations, 'ABSENT_SITE_AND_STRUCTURAL_ENGINEERING')
})

test('DRW-10A carries only existing stair/service reservations into local-framing obligations', () => {
  const source = createStructuralSpanOverlaySource()
  const framing = source.structuralConcept.openingFraming.value
  assert.equal(framing.stair.reservation.width, 2500)
  assert.equal(framing.stair.reservation.depth, 2500)
  assert.equal(framing.service.reservation.clearWidth, 900)
  assert.equal(framing.service.reservation.clearDepth, 700)
  assert.equal(framing.service.finalStructuralOpening, 'ABSENT_TECHNICAL')
  assert.equal(framing.stair.exactTrimmersAndBearings, 'ABSENT_STRUCTURAL_ENGINEERING')
  assert.equal(framing.service.exactTrimmersAndBearings, 'ABSENT_STRUCTURAL_ENGINEERING')
})
