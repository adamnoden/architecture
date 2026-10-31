import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingRect, DrawingText } from '../publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

const compiled = () => compileReferenceHouse(createReferenceHouseSource())
const shared = () => createGroundFloorPublicationPlanSource()

const scene = () =>
  createFirstFloorPublicationPlanScene(
    compiled(),
    createFirstFloorPublicationPlanSource(),
    shared()
  )

const groundScene = () =>
  createGroundFloorPublicationPlanScene(compiled(), createGroundFloorPublicationPlanSource())

const texts = (): DrawingText[] =>
  scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

const rect = (id: string): DrawingRect => {
  const primitive = scene().primitives.find((candidate) => candidate.id === id)
  assert.ok(primitive && primitive.kind === 'rect', id)
  return primitive
}

const groundRect = (id: string): DrawingRect => {
  const primitive = groundScene().primitives.find((candidate) => candidate.id === id)
  assert.ok(primitive && primitive.kind === 'rect', id)
  return primitive
}

describe('DRW-04B first-floor publication plan scene', () => {
  test('uses the same frozen 1:100 paper-space contract as the ground plan', () => {
    const drawing = scene()
    assert.equal(drawing.scaleDenominator, 100)
    assert.equal(drawing.widthMm, 136)
    assert.equal(drawing.heightMm, 145)

    const wallBodies = drawing.primitives.filter(
      (primitive) => primitive.kind === 'rect' && primitive.id.startsWith('wall-') && primitive.fill === 'ink'
    )
    assert.equal(wallBodies.length, 18)
  })

  test('keeps outer and courtyard wall bodies physically registered with the ground plan', () => {
    for (const suffix of [
      'OUTER-SOUTH',
      'OUTER-NORTH',
      'OUTER-WEST',
      'OUTER-EAST',
      'COURT-SOUTH',
      'COURT-NORTH',
      'COURT-WEST',
      'COURT-EAST'
    ]) {
      const upper = rect(`wall-U-${suffix}`)
      const ground = groundRect(`wall-G-${suffix}`)
      assert.deepEqual(
        { x: upper.x, y: upper.y, width: upper.width, height: upper.height },
        { x: ground.x, y: ground.y, width: ground.width, height: ground.height },
        suffix
      )
    }
  })

  test('cuts every authorised upper opening back to paper white', () => {
    const cuts = scene().primitives.filter(
      (primitive) => primitive.kind === 'rect' && primitive.id.startsWith('opening-') && primitive.fill === 'paper'
    )

    // 4 canonical front windows + 7 private-room apertures + 6 court + 3 garden.
    assert.equal(cuts.length, 20)
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-U-FRONT-W01'))
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-U-INT-P01-LAND-01'))
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-U-GARDEN-CENTRE-PUB-01'))
  })

  test('renders private-room access as apertures only, never as invented door leaves or swings', () => {
    const drawing = scene()
    const internalCuts = drawing.primitives.filter(
      (primitive) =>
        primitive.kind === 'rect' &&
        primitive.id.startsWith('opening-U-INT-') &&
        primitive.metadata?.treatment === 'door-aperture-no-leaf'
    )

    assert.equal(internalCuts.length, 7)
    assert.equal(drawing.primitives.some((primitive) => /swing|door-leaf|hinge|handing/i.test(primitive.id)), false)
  })

  test('draws only sourced upper windows as minimal frame lines', () => {
    const frames = scene().primitives.filter(
      (primitive) => primitive.kind === 'line' && primitive.id.startsWith('frame-')
    )

    // 4 front + 4 east/west court + 3 garden windows. North/south court openings are major openings.
    assert.equal(frames.length, 11)
    assert.ok(frames.every((primitive) => primitive.kind === 'line' && primitive.role === 'primary'))
    assert.equal(frames.some((primitive) => primitive.id.includes('U-INT-')), false)
  })

  test('projects the same stair reservation from above with a reversed DN trace', () => {
    const upper = rect('stair-reservation')
    const ground = groundRect('stair-reservation')
    assert.deepEqual(
      { x: upper.x, y: upper.y, width: upper.width, height: upper.height },
      { x: ground.x, y: ground.y, width: ground.width, height: ground.height }
    )
    assert.equal(upper.dash, 'provisional')
    assert.equal(upper.stroke, 'secondary')

    const groundFirst = groundScene().primitives.find((primitive) => primitive.id === 'stair-flight-trace-1')
    const groundLast = groundScene().primitives.find((primitive) => primitive.id === 'stair-flight-trace-3')
    const upperFirst = scene().primitives.find((primitive) => primitive.id === 'stair-down-trace-1')
    const upperLast = scene().primitives.find((primitive) => primitive.id === 'stair-down-trace-3')
    assert.ok(groundFirst?.kind === 'line' && groundLast?.kind === 'line')
    assert.ok(upperFirst?.kind === 'line' && upperLast?.kind === 'line')
    assert.deepEqual(upperFirst.a, groundLast.b)
    assert.deepEqual(upperLast.b, groundFirst.a)
    assert.ok(texts().some((text) => text.value === 'DN'))
    assert.equal(scene().primitives.some((primitive) => /tread|balustrade|handrail|string|nosing/i.test(primitive.id)), false)
  })

  test('shows the resolved private-floor hierarchy with human labels only', () => {
    const values = texts().map((text) => text.value)
    for (const label of [
      'Bedroom 2',
      'Principal bedroom',
      'South',
      'landing',
      'Bedroom 3',
      'East gallery',
      'Family bathroom',
      'Bedroom 4',
      'North landing',
      'Dressing /',
      'storage',
      'Linen',
      'Courtyard'
    ]) {
      assert.ok(values.includes(label), label)
    }
    assert.equal(values.some((value) => /(?:U-|RH-C|DRW-)/.test(value)), false)
  })

  test('wraps the south-landing label inside the clear arrival strip without changing type size', () => {
    const landing = texts().filter((text) => text.metadata?.space === 'U-STAIR-01')
    assert.deepEqual(
      landing.map((text) => ({ id: text.id, value: text.value, x: text.x, y: text.y })),
      [
        { id: 'label-U-STAIR-01-1', value: 'South', x: 79.5, y: 104.5 },
        { id: 'label-U-STAIR-01-2', value: 'landing', x: 79.5, y: 107.5 }
      ]
    )
  })

  test('wraps the dressing/storage label clear of the north courtyard continuation wall', () => {
    const dressing = texts().filter((text) => text.metadata?.space === 'U-DRESS-01')
    assert.deepEqual(
      dressing.map((text) => ({ id: text.id, value: text.value, x: text.x, y: text.y })),
      [
        { id: 'label-U-DRESS-01-1', value: 'Dressing /', x: 60.5, y: 21 },
        { id: 'label-U-DRESS-01-2', value: 'storage', x: 60.5, y: 24 }
      ]
    )
  })

  test('uses a leader to keep the east-gallery label out of the narrow circulation strip', () => {
    const gallery = texts().find((text) => text.value === 'East gallery')
    assert.ok(gallery)
    assert.deepEqual(
      { x: gallery.x, y: gallery.y, anchor: gallery.anchor },
      { x: 83.5, y: 56, anchor: 'end' }
    )

    const leader = scene().primitives.find((primitive) => primitive.id === 'label-leader-U-GAL-02')
    assert.ok(leader?.kind === 'line')
    assert.deepEqual(
      { a: leader.a, b: leader.b, role: leader.role },
      { a: { x: 84.5, y: 56 }, b: { x: 92.5, y: 56 }, role: 'secondary' }
    )
  })

  test('keeps dimensions sparse and preserves the physical graphic scale', () => {
    const drawing = scene()
    const values = texts().map((text) => text.value)
    assert.ok(values.includes('12000'))
    assert.ok(values.includes('10800'))
    assert.ok(values.includes('3600 × 4000'))

    const scale = drawing.primitives.find((primitive) => primitive.id === 'scale-bar')
    assert.ok(scale?.kind === 'line')
    assert.equal(scale.b.x - scale.a.x, 30)
    assert.ok(values.includes('3 m'))
  })

  test('does not smuggle site orientation, section cuts or technical plan claims into the upper scene', () => {
    const values = texts().map((text) => text.value)
    assert.ok(values.includes('Front / street surrogate'))
    assert.ok(values.includes('Garden'))
    assert.equal(values.some((value) => /^N$|north arrow|section/i.test(value)), false)
    assert.equal(scene().primitives.some((primitive) => /north-arrow|section-marker/i.test(primitive.id)), false)
  })

  test('serializes deterministically with no workflow-history residue', () => {
    const a = renderDrawingSceneSvg(scene())
    const b = renderDrawingSceneSvg(scene())
    assert.equal(a, b)
    assert.match(a, /data-scale-denominator="100"/)
    assert.match(a, /width="136mm" height="145mm"/)
    assert.doesNotMatch(a, /DRW-04|04B|packet|branch/i)
  })
})
