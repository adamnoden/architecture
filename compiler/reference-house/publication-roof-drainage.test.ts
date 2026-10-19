import assert from 'node:assert/strict'
import test from 'node:test'

import type { DrawingLine, DrawingRect, DrawingText } from '../publication-drawing/model.js'
import { renderDrawingSceneSvg } from '../publication-drawing/svg.js'
import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import { createRoofDrainagePublicationSource } from './publication-roof-drainage-source.js'

const scene = () => createRoofDrainagePublicationScene(createRoofDrainagePublicationSource())
const lines = (): DrawingLine[] => scene().primitives.filter((primitive): primitive is DrawingLine => primitive.kind === 'line')
const rects = (): DrawingRect[] => scene().primitives.filter((primitive): primitive is DrawingRect => primitive.kind === 'rect')
const texts = (): DrawingText[] => scene().primitives.filter((primitive): primitive is DrawingText => primitive.kind === 'text')

test('DRW-07C projects the exact roof substrate at literal 1:100', () => {
  const drawing = scene()
  const shell = rects().find((primitive) => primitive.id === 'roof-shell')
  const court = rects().find((primitive) => primitive.id === 'roof-court')
  assert.ok(shell && court)

  assert.equal(drawing.scaleDenominator, 100)
  assert.equal(drawing.widthMm, 166)
  assert.equal(drawing.heightMm, 145)
  assert.deepEqual(
    { x: shell.x, y: shell.y, width: shell.width, height: shell.height },
    { x: 8, y: 12, width: 120, height: 108 }
  )
  assert.deepEqual(
    { x: court.x, y: court.y, width: court.width, height: court.height },
    { x: 50, y: 46, width: 36, height: 40 }
  )
  assert.equal(shell.metadata?.authority, 'CONTROLLED')
  assert.equal(court.metadata?.authority, 'CONTROLLED')
})

test('DRW-07C refuses scale drift or incomplete frozen topology', () => {
  const source = createRoofDrainagePublicationSource()
  const wrongScale = structuredClone(source)
  Object.defineProperty(wrongScale.view.value, 'scale', { value: 50, configurable: true })
  assert.throws(() => createRoofDrainagePublicationScene(wrongScale), /frozen at 1:100/)

  const missingField = structuredClone(source)
  missingField.fields.pop()
  assert.throws(() => createRoofDrainagePublicationScene(missingField), /four-field/)
})

test('DRW-07C draws only the four source-derived watersheds and keeps them provisional', () => {
  const watersheds = lines().filter((primitive) => primitive.id.startsWith('ROOF-WATERSHED-'))
  assert.equal(watersheds.length, 4)
  assert.deepEqual(watersheds.map(({ id, a, b }) => ({ id, a, b })), [
    { id: 'ROOF-WATERSHED-SW', a: { x: 8, y: 120 }, b: { x: 50, y: 86 } },
    { id: 'ROOF-WATERSHED-SE', a: { x: 128, y: 120 }, b: { x: 86, y: 86 } },
    { id: 'ROOF-WATERSHED-NW', a: { x: 8, y: 12 }, b: { x: 50, y: 46 } },
    { id: 'ROOF-WATERSHED-NE', a: { x: 128, y: 12 }, b: { x: 86, y: 46 } }
  ])
  assert.ok(watersheds.every((primitive) => primitive.dash === 'provisional'))
  assert.ok(watersheds.every((primitive) => primitive.metadata?.authority === 'PROVISIONAL'))
})

test('DRW-07C uses directional annotation rather than pretending fall arrows are surveyed geometry', () => {
  const shafts = lines().filter((primitive) => /^fall-(south|north|west|east)-shaft$/.test(primitive.id))
  assert.equal(shafts.length, 4)
  assert.ok(shafts.every((primitive) => primitive.dash === 'provisional'))
  assert.ok(shafts.every((primitive) => primitive.metadata?.notExactGeometry === true))

  const values = texts().map((primitive) => primitive.value)
  assert.ok(values.includes('≈26.5 m² · fall ≈1:40'))
  assert.ok(values.includes('≈31.1 m² · fall ≈1:40'))
})

test('DRW-07C keeps qualitative RWP occurrences as zone notation, never exact plan points', () => {
  const rwpText = texts().filter((primitive) => primitive.id.startsWith('rwp-'))
  assert.equal(rwpText.length, 4)
  assert.ok(rwpText.every((primitive) => primitive.metadata?.exactPosition === false))
  assert.ok(rwpText.every((primitive) => primitive.metadata?.authority === 'RH08_SELECTED_OUTSIDE_RH_C1'))
  assert.equal(lines().some((primitive) => /rwp/i.test(primitive.id)), false)
  assert.equal(rects().some((primitive) => /rwp/i.test(primitive.id)), false)
})

test('DRW-07C represents courtyard drainage as topology text, not an invented pipe centreline', () => {
  const collector = texts().find((primitive) => primitive.id === 'court-collector-zone')
  const route = texts().find((primitive) => primitive.id === 'court-primary-route-topology')
  const overflow = texts().find((primitive) => primitive.id === 'court-overflow-topology')
  assert.ok(collector && route && overflow)
  assert.equal(collector.metadata?.exactGeometry, false)
  assert.equal(route.metadata?.exactCentreline, false)
  assert.equal(overflow.metadata?.exactLevel, false)
  assert.equal(lines().some((primitive) => /court-(?:collector|primary-route|overflow)/.test(primitive.id)), false)
})

test('DRW-07C protects selected absences and does not draw deferred technical systems', () => {
  const values = texts().map((primitive) => primitive.value)
  assert.ok(values.includes('No internal outlet'))
  assert.ok(values.includes('No front RWP'))
  assert.ok(values.includes('Soil vent · E zone'))

  const ids = scene().primitives.map((primitive) => primitive.id).join(' ')
  assert.doesNotMatch(ids, /hatch|rooflight|chimney|mvhr|cooker|pipe-diameter|gutter-profile|site-discharge|hydraulic/i)
})

test('DRW-07C serializes deterministically without legacy pixel geometry or packet-history leakage', () => {
  const a = renderDrawingSceneSvg(scene())
  const b = renderDrawingSceneSvg(scene())
  assert.equal(a, b)
  assert.match(a, /width="166mm" height="145mm" viewBox="0 0 166 145"/)
  assert.match(a, /data-scale-denominator="100"/)
  assert.match(a, /dash-provisional/)
  assert.doesNotMatch(a, /55 px|55px|DRW-07|07B|07C|packet|branch/i)
})
