import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import {
  areAdjacent,
  boxesIntersect,
  containsBox,
  overlapArea,
  type Box2D
} from '../core/geometry.js'

const translate = (box: Box2D, dx: number, dy: number): Box2D => ({
  ...box,
  x: box.x + dx,
  y: box.y + dy
})

describe('CH-06 constructed positive geometry laws', () => {
  test('generated valid parents contain strict children and meet exact edge neighbours', () => {
    for (let caseIndex = 1; caseIndex <= 256; caseIndex += 1) {
      const width = 100 + (caseIndex % 97)
      const height = 120 + (caseIndex % 83)
      const margin = 1 + (caseIndex % 10)
      const parent: Box2D = {
        kind: 'box2d',
        x: (caseIndex * 97) % 10_000,
        y: (caseIndex * 193) % 10_000,
        width,
        height
      }
      const child: Box2D = {
        kind: 'box2d',
        x: parent.x + margin,
        y: parent.y + margin,
        width: parent.width - margin * 2,
        height: parent.height - margin * 2
      }
      const neighbour: Box2D = {
        kind: 'box2d',
        x: parent.x + parent.width,
        y: parent.y,
        width: 50 + (caseIndex % 31),
        height: parent.height
      }
      const dx = caseIndex * 7
      const dy = -caseIndex * 11

      assert.equal(
        overlapArea(parent, parent),
        parent.width * parent.height,
        `case ${caseIndex}: self-overlap equals area`
      )
      assert.equal(containsBox(parent, child), true, `case ${caseIndex}: parent contains strict child`)
      assert.equal(containsBox(child, parent), false, `case ${caseIndex}: strict child does not contain parent`)
      assert.equal(areAdjacent(parent, neighbour), true, `case ${caseIndex}: exact shared edge is adjacent`)
      assert.equal(boxesIntersect(parent, neighbour), true, `case ${caseIndex}: exact shared edge intersects`)
      assert.equal(overlapArea(parent, neighbour), 0, `case ${caseIndex}: shared edge has zero area`)

      assert.equal(containsBox(translate(parent, dx, dy), translate(child, dx, dy)), true)
      assert.equal(areAdjacent(translate(parent, dx, dy), translate(neighbour, dx, dy)), true)
      assert.equal(overlapArea(translate(parent, dx, dy), translate(parent, dx, dy)), parent.width * parent.height)
    }
  })
})
