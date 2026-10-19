import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingLine, DrawingRect, DrawingText } from '../publication-drawing/model.js'
import { createSectionPaperProjection } from '../publication-drawing/projection.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createPrincipalSectionPublicationScene } from './publication-principal-section.js'
import { createPrincipalSectionPublicationSource } from './publication-principal-section-source.js'

const compiled = () => compileReferenceHouse(createReferenceHouseSource())
const scene = () => createPrincipalSectionPublicationScene(compiled(), createPrincipalSectionPublicationSource())

const rects = (): DrawingRect[] =>
  scene().primitives.filter((primitive): primitive is DrawingRect => primitive.kind === 'rect')

const lines = (): DrawingLine[] =>
  scene().primitives.filter((primitive): primitive is DrawingLine => primitive.kind === 'line')

const texts = (): DrawingText[] =>
  scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

describe('DRW-05C principal-section publication renderer', () => {
  test('projects Y/Z orthographically at literal 1:100 paper scale', () => {
    const project = createSectionPaperProjection({
      scaleDenominator: 100,
      horizontalBounds: { min: 0, max: 10800 },
      verticalBounds: { min: 0, max: 6500 },
      paperOrigin: { x: 14, y: 8 }
    })

    assert.equal(project.length(10800), 108)
    assert.equal(project.length(6500), 65)
    assert.deepEqual(project.point(0, 6500), { x: 14, y: 8 })
    assert.deepEqual(project.point(10800, 0), { x: 122, y: 73 })
    assert.deepEqual(project.rect({ x: 3000, y: 2950, width: 400, height: 350 }), {
      x: 44,
      y: 40,
      width: 4,
      height: 3.5
    })
  })

  test('creates only the bounded cut-wall and inter-storey planning bodies', () => {
    const drawing = scene()
    assert.equal(drawing.scaleDenominator, 100)
    assert.equal(drawing.widthMm, 166)
    assert.equal(drawing.heightMm, 92)

    const cutWalls = rects().filter((primitive) => primitive.id.startsWith('cut-wall-') && primitive.fill === 'ink')
    const floorZones = rects().filter((primitive) => primitive.id.startsWith('floor-zone-') && primitive.fill === 'ink')

    assert.deepEqual(cutWalls.map((primitive) => primitive.id), [
      'cut-wall-outer-south',
      'cut-wall-court-south',
      'cut-wall-court-north',
      'cut-wall-outer-north'
    ])
    assert.equal(floorZones.length, 2)
    assert.ok(floorZones.every((primitive) => primitive.height === 3.5))
    assert.ok(floorZones.every((primitive) => primitive.metadata?.representation === 'inter-storey-planning-zone'))
  })

  test('cuts exactly the six DRW-05B opening occurrences through their section hosts', () => {
    const openings = rects().filter((primitive) => primitive.id.startsWith('opening-') && primitive.fill === 'paper')
    assert.deepEqual(openings.map((primitive) => primitive.id), [
      'opening-court-south-ground',
      'opening-court-north-ground',
      'opening-court-south-first',
      'opening-court-north-first',
      'opening-outer-north-ground',
      'opening-outer-north-first'
    ])
    assert.ok(openings.every((primitive) => primitive.metadata?.provisional === true))

    const groundSouth = openings.find((primitive) => primitive.id === 'opening-court-south-ground')
    const upperNorth = openings.find((primitive) => primitive.id === 'opening-outer-north-first')
    assert.ok(groundSouth && upperNorth)
    assert.deepEqual(
      { x: groundSouth.x, y: groundSouth.y, width: groundSouth.width, height: groundSouth.height },
      { x: 44, y: 47.5, width: 4, height: 25.5 }
    )
    assert.deepEqual(
      { x: upperNorth.x, y: upperNorth.y, width: upperNorth.width, height: upperNorth.height },
      { x: 118, y: 16.5, width: 4, height: 15.5 }
    )
  })

  test('renders the roof as two profile lines without a technical roof body', () => {
    const result = compiled()
    const south = lines().find((primitive) => primitive.id === 'roof-profile-south')
    const north = lines().find((primitive) => primitive.id === 'roof-profile-north')
    assert.ok(south && north)
    assert.equal(south.role, 'profile')
    assert.equal(north.role, 'profile')
    assert.ok(south.b.y < south.a.y)
    assert.ok(north.a.y < north.b.y)
    assert.equal(rects().some((primitive) => /roof/i.test(primitive.id)), false)
    assert.equal(result.derived.roofSection.courtSideEdge - result.derived.roofSection.outerEdgeControl, 85)
  })

  test('uses cut/beyond hierarchy for the three-flight stair and projects the perpendicular flight at the shared Y turn', () => {
    const flight1 = lines().find((primitive) => primitive.id === 'stair-flight-1-beyond')
    const flight2 = lines().find((primitive) => primitive.id === 'stair-flight-2-perpendicular-beyond')
    const flight3 = lines().find((primitive) => primitive.id === 'stair-flight-3-cut')
    assert.ok(flight1 && flight2 && flight3)

    assert.deepEqual(
      { role: flight1.role, dash: flight1.dash, a: flight1.a, b: flight1.b },
      { role: 'secondary', dash: 'provisional', a: { x: 22, y: 73 }, b: { x: 36, y: 62 } }
    )
    assert.deepEqual(
      { role: flight2.role, dash: flight2.dash, a: flight2.a, b: flight2.b },
      { role: 'secondary', dash: 'provisional', a: { x: 36, y: 62 }, b: { x: 36, y: 51 } }
    )
    assert.deepEqual(
      { role: flight3.role, dash: flight3.dash, a: flight3.a, b: flight3.b },
      { role: 'cut', dash: undefined, a: { x: 36, y: 51 }, b: { x: 22, y: 40 } }
    )
  })

  test('fits the split entrance-hall label clear of all three stair flights at frozen 7.5 pt type', () => {
    const label1 = texts().find((primitive) => primitive.id === 'label-ground-south-1')
    const label2 = texts().find((primitive) => primitive.id === 'label-ground-south-2')
    const flight1 = lines().find((primitive) => primitive.id === 'stair-flight-1-beyond')
    const flight2 = lines().find((primitive) => primitive.id === 'stair-flight-2-perpendicular-beyond')
    const flight3 = lines().find((primitive) => primitive.id === 'stair-flight-3-cut')
    assert.ok(label1 && label2 && flight1 && flight2 && flight3)

    assert.deepEqual(
      { value: label1.value, x: label1.x, y: label1.y, anchor: label1.anchor },
      { value: 'Entrance hall /', x: 27, y: 57, anchor: 'middle' }
    )
    assert.deepEqual(
      { value: label2.value, x: label2.x, y: label2.y, anchor: label2.anchor },
      { value: 'stair', x: 27, y: 60, anchor: 'middle' }
    )

    const labelFontMm = (7.5 * 25.4) / 72
    const entranceHallSlashHalfWidthMm = 16.912166666666664 / 2
    assert.ok(label1.x + entranceHallSlashHalfWidthMm < flight2.a.x)
    assert.ok(label1.y - labelFontMm > Math.max(flight3.a.y, flight3.b.y))
    assert.ok(label2.y + labelFontMm * 0.3 < Math.min(flight1.a.y, flight1.b.y))
  })

  test('terminates at ground FFL and introduces no below-ground or construction component geometry', () => {
    const termination = lines().find((primitive) => primitive.id === 'ground-termination')
    assert.ok(termination)
    assert.deepEqual(termination.a, { x: 14, y: 73 })
    assert.deepEqual(termination.b, { x: 122, y: 73 })
    assert.equal(termination.role, 'profile')

    const ids = scene().primitives.map((primitive) => primitive.id).join(' ')
    assert.doesNotMatch(ids, /foundation|footing|slab|joist|string|handrail|guard|balustrade|service|duct|pipe/i)
  })

  test('uses restrained human labels and level markers without machine IDs', () => {
    const values = texts().map((primitive) => primitive.value)
    for (const label of [
      'Entrance hall /',
      'stair',
      'Garden dining',
      'South landing / stair',
      'North',
      'landing',
      'Dressing /',
      'storage',
      'Open courtyard',
      'Ground FFL ±0',
      'Ground ceiling +2950',
      'First FFL +3300',
      'Upper ceiling +6000',
      'Roof edge +6250',
      '3 m'
    ]) assert.ok(values.includes(label), label)

    assert.equal(values.some((value) => /RH-C|DRW|U-|G-/.test(value)), false)
  })

  test('serializes deterministically with no packet-history leakage', () => {
    const a = renderDrawingSceneSvg(scene())
    const b = renderDrawingSceneSvg(scene())
    assert.equal(a, b)
    assert.match(a, /width="166mm" height="92mm" viewBox="0 0 166 92"/)
    assert.match(a, /data-scale-denominator="100"/)
    assert.doesNotMatch(a, /DRW-05|05B|05C|packet|branch/i)
  })
})
