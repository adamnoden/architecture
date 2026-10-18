import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingText } from '../publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createGroundFloorPublicationPlanScene } from './publication-ground-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'

const scene = () =>
  createGroundFloorPublicationPlanScene(
    compileReferenceHouse(createReferenceHouseSource()),
    createGroundFloorPublicationPlanSource()
  )

const texts = (): DrawingText[] => scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

describe('DRW-03D ground-floor publication plan scene', () => {
  test('keeps the frozen 1:100 plan at true paper size rather than fit-scaling it', () => {
    const drawing = scene()
    assert.equal(drawing.scaleDenominator, 100)
    assert.equal(drawing.widthMm, 136)
    assert.equal(drawing.heightMm, 145)

    const shellWalls = drawing.primitives.filter(
      (primitive) => primitive.kind === 'rect' && primitive.id.startsWith('wall-G-OUTER-')
    )
    assert.equal(shellWalls.length, 4)

    const south = shellWalls.find((primitive) => primitive.id === 'wall-G-OUTER-SOUTH')
    assert.ok(south && south.kind === 'rect')
    assert.equal(south.x, 8)
    assert.equal(south.y, 116)
    assert.equal(south.width, 120)
    assert.equal(south.height, 4)
  })

  test('renders all ground boundaries as cut matter and cuts every authorised opening back to paper white', () => {
    const drawing = scene()
    const wallBodies = drawing.primitives.filter(
      (primitive) => primitive.kind === 'rect' && primitive.id.startsWith('wall-') && primitive.fill === 'ink'
    )
    const cuts = drawing.primitives.filter(
      (primitive) => primitive.kind === 'rect' && primitive.id.startsWith('opening-') && primitive.fill === 'paper'
    )

    assert.equal(wallBodies.length, 14)
    // 4 canonical front openings + 7 internal passages + 6 court + 3 garden.
    assert.equal(cuts.length, 20)
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-G-FRONT-D01'))
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-G-GARDEN-CENTRE-PUB-01'))
    assert.ok(cuts.some((primitive) => primitive.id === 'opening-G-INT-GARDEN-KIT-01'))
  })

  test('shows windows as minimal frame lines but invents no hinged door or swing geometry', () => {
    const drawing = scene()
    const frames = drawing.primitives.filter(
      (primitive) => primitive.kind === 'line' && primitive.id.startsWith('frame-')
    )
    assert.equal(frames.length, 9)
    assert.ok(frames.every((primitive) => primitive.kind === 'line' && primitive.role === 'primary'))
    assert.equal(drawing.primitives.some((primitive) => /swing|door-leaf|hinge/i.test(primitive.id)), false)
  })

  test('uses a visibly provisional stair reservation and topological trace rather than technical stair construction', () => {
    const drawing = scene()
    const reservation = drawing.primitives.find((primitive) => primitive.id === 'stair-reservation')
    assert.ok(reservation && reservation.kind === 'rect')
    assert.equal(reservation.dash, 'provisional')
    assert.equal(reservation.stroke, 'secondary')
    assert.equal(drawing.primitives.filter((primitive) => primitive.id.startsWith('stair-flight-trace-')).length, 3)
    assert.ok(texts().some((text) => text.value === 'UP'))
    assert.equal(drawing.primitives.some((primitive) => /tread|balustrade|handrail|string/i.test(primitive.id)), false)
  })

  test('shows human architectural names and no reader-visible machine IDs', () => {
    const values = texts().map((text) => text.value)
    for (const label of [
      'Drawing room',
      'Family room',
      'Entrance hall',
      'Study',
      'Gallery',
      'Service suite',
      'Garden dining',
      'Kitchen',
      'Courtyard'
    ]) {
      assert.ok(values.includes(label), label)
    }
    assert.equal(values.some((value) => /(?:G-|RH-C|DRW-)/.test(value)), false)
  })

  test('keeps dimensioning sparse and adds the required physical graphic scale bar', () => {
    const drawing = scene()
    const values = texts().map((text) => text.value)
    assert.ok(values.includes('12000'))
    assert.ok(values.includes('10800'))
    assert.ok(values.includes('3600 × 4000'))

    const scale = drawing.primitives.find((primitive) => primitive.id === 'scale-bar')
    assert.ok(scale && scale.kind === 'line')
    assert.equal(scale.b.x - scale.a.x, 30)
    assert.ok(values.includes('3 m'))
  })

  test('explicitly refuses true north and section-cut markers at this stage', () => {
    const values = texts().map((text) => text.value)
    assert.ok(values.includes('Front / street surrogate'))
    assert.ok(values.includes('Garden'))
    assert.equal(values.some((value) => /^N$|north arrow|section/i.test(value)), false)
    assert.equal(scene().primitives.some((primitive) => /north-arrow|section-marker/i.test(primitive.id)), false)
  })

  test('serializes deterministically without workflow-history residue', () => {
    const a = renderDrawingSceneSvg(scene())
    const b = renderDrawingSceneSvg(scene())
    assert.equal(a, b)
    assert.match(a, /data-scale-denominator="100"/)
    assert.match(a, /width="136mm" height="145mm"/)
    assert.doesNotMatch(a, /DRW-03|03D|packet|branch/i)
  })
})
