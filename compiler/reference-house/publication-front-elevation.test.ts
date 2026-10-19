import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { DrawingLine, DrawingRect, DrawingText } from '../publication-drawing/model.js'
import { createElevationPaperProjection } from '../publication-drawing/projection.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { createFrontElevationPublicationScene } from './publication-front-elevation.js'
import { createFrontElevationPublicationSource } from './publication-front-elevation-source.js'

const source = () => createFrontElevationPublicationSource()
const scene = () => createFrontElevationPublicationScene(source())
const lines = (): DrawingLine[] => scene().primitives.filter((primitive): primitive is DrawingLine => primitive.kind === 'line')
const rects = (): DrawingRect[] => scene().primitives.filter((primitive): primitive is DrawingRect => primitive.kind === 'rect')
const texts = (): DrawingText[] => scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

describe('DRW-06C principal-front-elevation renderer', () => {
  test('projects X/Z orthographically at literal 1:100 paper scale', () => {
    const project = createElevationPaperProjection({
      scaleDenominator: 100,
      horizontalBounds: { min: 0, max: 12000 },
      verticalBounds: { min: 0, max: 6500 },
      paperOrigin: { x: 14, y: 8 }
    })

    assert.equal(project.length(12000), 120)
    assert.equal(project.length(6500), 65)
    assert.deepEqual(project.point(0, 6500), { x: 14, y: 8 })
    assert.deepEqual(project.point(12000, 0), { x: 134, y: 73 })
    assert.deepEqual(project.rect({ x: 1950, y: 650, width: 1050, height: 1900 }), {
      x: 33.5,
      y: 47.5,
      width: 10.5,
      height: 19
    })
  })

  test('keeps the scene at the frozen whole-building scale without fit scaling', () => {
    const drawing = scene()
    assert.equal(drawing.scaleDenominator, 100)
    assert.equal(drawing.widthMm, 166)
    assert.equal(drawing.heightMm, 92)

    const s = source()
    const projectedAxes = s.bayAxes.value.map((axis) => 14 + axis / 100)
    assert.deepEqual(projectedAxes, [33.5, 60.5, 87.5, 114.5])
  })

  test('represents approximate ground openings provisionally without promoting their precision', () => {
    const principal = rects().find((primitive) => primitive.id === 'opening-G-FRONT-W01-envelope')
    const stair = rects().find((primitive) => primitive.id === 'opening-G-FRONT-W02-envelope')
    assert.ok(principal && stair)

    assert.deepEqual(
      { x: principal.x, y: principal.y, width: principal.width, height: principal.height, dash: principal.dash },
      { x: 28.25, y: 47.5, width: 10.5, height: 19, dash: 'provisional' }
    )
    assert.equal(principal.metadata?.authority, 'PROVISIONAL')
    assert.equal(principal.metadata?.precisionSill, 'range')
    assert.equal(lines().some((primitive) => primitive.id === 'opening-G-FRONT-W01-sill-max'), true)

    assert.deepEqual(
      { x: stair.x, y: stair.y, width: stair.width, height: stair.height, dash: stair.dash },
      { x: 56, y: 47.5, width: 9, height: 15, dash: 'provisional' }
    )
  })

  test('draws paired upper width bounds instead of choosing a value from the source range', () => {
    const upper = rects().find((primitive) => primitive.id === 'opening-U-FRONT-W01-envelope')
    const minLeft = lines().find((primitive) => primitive.id === 'opening-U-FRONT-W01-width-min-left')
    const minRight = lines().find((primitive) => primitive.id === 'opening-U-FRONT-W01-width-min-right')
    assert.ok(upper && minLeft && minRight)

    assert.deepEqual(
      { x: upper.x, y: upper.y, width: upper.width, height: upper.height },
      { x: 28.75, y: 16.5, width: 9.5, height: 15.5 }
    )
    assert.equal(minRight.a.x - minLeft.a.x, 9)
    assert.equal(upper.metadata?.precisionWidth, 'range')
  })

  test('does not invent an entrance sill or threshold', () => {
    const entranceEnvelope = rects().find((primitive) => primitive.id.includes('G-FRONT-D01'))
    const head = lines().find((primitive) => primitive.id === 'opening-G-FRONT-D01-head-max')
    const innerLeft = lines().find((primitive) => primitive.id === 'opening-G-FRONT-D01-width-min-left')
    const note = texts().find((primitive) => primitive.id === 'entrance-unresolved-note')

    assert.equal(entranceEnvelope, undefined)
    assert.ok(head && innerLeft && note)
    assert.deepEqual(head.a, { x: 82.25, y: 47.5 })
    assert.deepEqual(head.b, { x: 92.75, y: 47.5 })
    assert.equal(head.metadata?.unresolvedLowerTermination, true)
    assert.match(note.value, /lower termination unresolved/i)
    assert.match(note.value, /no threshold/i)
  })

  test('uses GFFL only as a datum/drawing termination and creates no exterior grade line', () => {
    const west = lines().find((primitive) => primitive.id === 'facade-profile-west')
    const east = lines().find((primitive) => primitive.id === 'facade-profile-east')
    const gffl = lines().find((primitive) => primitive.id.startsWith('level-gffl'))
    assert.ok(west && east && gffl)

    assert.deepEqual(west.a, { x: 14, y: 73 })
    assert.deepEqual(east.a, { x: 134, y: 73 })
    assert.equal(west.dash, 'provisional')
    assert.equal(gffl.a.x > 134, true)
    assert.equal(gffl.b.x > 134, true)

    const ids = scene().primitives.map((primitive) => primitive.id)
    assert.equal(ids.some((id) => /grade|ground-line|threshold/.test(id)), false)
  })

  test('renders only a provisional cornice control and no resolved roof or facade articulation', () => {
    const cornice = lines().find((primitive) => primitive.id === 'cornice-control')
    assert.ok(cornice)
    assert.equal(cornice.dash, 'provisional')
    assert.equal(cornice.metadata?.treatment, 'control-only-not-resolved-roof-silhouette')

    const ids = scene().primitives.map((primitive) => primitive.id).join(' ')
    assert.doesNotMatch(ids, /ridge|canopy|panel|pilaster|seam|slab|course|decorative|roof-profile/i)
  })

  test('uses controlled level datums only as side references, not facade courses', () => {
    const datumLines = lines().filter((primitive) => primitive.id.startsWith('level-'))
    assert.equal(datumLines.length, 5)
    assert.ok(datumLines.every((primitive) => primitive.a.x > 134 && primitive.b.x > 134))

    const values = texts().map((primitive) => primitive.value)
    for (const label of [
      'GFFL ±0.000',
      'Ground ceiling +2.950',
      'First FFL +3.300',
      'Upper ceiling +6.000',
      '≈ Cornice control +6.250',
      '3 m'
    ]) assert.ok(values.includes(label), label)
  })

  test('serializes deterministically with uncertainty surviving black-only output and no packet-history leakage', () => {
    const a = renderDrawingSceneSvg(scene())
    const b = renderDrawingSceneSvg(scene())
    assert.equal(a, b)
    assert.match(a, /width="166mm" height="92mm" viewBox="0 0 166 92"/)
    assert.match(a, /data-scale-denominator="100"/)
    assert.match(a, /dash-provisional/)
    assert.match(a, /Provisional opening geometry/)
    assert.doesNotMatch(a, /DRW-06|06B|06C|packet|branch/i)
  })
})
