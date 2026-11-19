import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceSource, RectByLines } from '../plan-slice/model.js'
import { mm } from '../units.js'

type Rect = [number, number, number, number]
const sourceWith = (rooms: Rect[][], voids: Rect[][] = []): PlanSliceSource => {
  const lines = new Map<string, number>()
  const rectangles = (pieces: Rect[]): RectByLines[] => pieces.map(([x0, x1, y0, y1]) => {
    for (const [axis, value] of [['x', x0], ['x', x1], ['y', y0], ['y', y1]] as const) {
      lines.set(`${axis}${value}`, value)
    }
    return { x0: `x${x0}`, x1: `x${x1}`, y0: `y${y0}`, y1: `y${y1}` }
  })
  const regions = (items: Rect[][], prefix: string) => items.map((pieces, index) => ({
    id: `${prefix}${index}`, levelId: 'G', rectangles: rectangles(pieces), provisional: false
  }))
  const spaces = regions(rooms, 'room').map((region) => ({ ...region, kind: 'room' as const, label: region.id }))
  const exclusions = regions(voids, 'void')
  return {
    fixtureId: 'CCR-PLAN-UNION', shell: { id: 'shell', width: mm(10000), depth: mm(10000) },
    levels: [{ id: 'G', datum: mm(0) }],
    planLines: [...lines].map(([id, coordinate]) => ({ id, coordinate: mm(coordinate), provisional: false })),
    spaces, voids: exclusions, boundaries: [], requiredAdjacencies: [], openingFamilies: [],
    openings: [], qualitativeOpeningRelationships: []
  }
}
const codes = (source: PlanSliceSource) => compilePlanSlice(source).diagnostics.map(({ code }) => code)

describe('CCR-PLAN rectangle unions and plate closure', () => {
  test('duplicate half-plate rectangles cannot conceal an uncovered half', () => {
    const result = compilePlanSlice(sourceWith([[[0, 5000, 0, 10000], [0, 5000, 0, 10000]]]))
    assert.equal(result.status, 'FAIL')
    assert.equal(result.derived.spaces[0].area, 50_000_000)
    assert.equal(result.derived.plateAreas[0].area, 100_000_000)
    assert.deepEqual(result.diagnostics.map(({ code }) => code), ['PLATE_CLOSURE_MISMATCH'])
  })

  test('partially overlapping pieces cannot conceal the missing eastern strip', () => {
    const result = compilePlanSlice(sourceWith([[[0, 6000, 0, 10000], [4000, 8000, 0, 10000]]]))
    assert.equal(result.status, 'FAIL')
    assert.equal(result.derived.spaces[0].area, 80_000_000)
    assert.ok(result.diagnostics.some(({ code }) => code === 'PLATE_CLOSURE_MISMATCH'))
  })

  test('valid disjoint and overlapping decompositions describe the same complete region', () => {
    const decompositions: Rect[][] = [
      [[0, 10000, 0, 10000]],
      [[0, 5000, 0, 10000], [5000, 10000, 0, 10000]],
      [[0, 6000, 0, 10000], [4000, 10000, 0, 10000]],
      [[0, 10000, 0, 5000], [0, 10000, 5000, 10000], [2000, 8000, 2000, 8000]]
    ]
    for (const rectangles of decompositions) {
      for (const ordered of [rectangles, [...rectangles].reverse()]) {
        const result = compilePlanSlice(sourceWith([ordered]))
        assert.equal(result.status, 'PASS')
        assert.equal(result.derived.spaces[0].area, 100_000_000)
        assert.deepEqual(result.diagnostics, [])
      }
    }
  })

  test('L-shaped union preserves its missing corner and accepts a distinct filling room', () => {
    const room: Rect[] = [[0, 4000, 0, 10000], [0, 10000, 0, 4000]]
    const result = compilePlanSlice(sourceWith([room, [[4000, 10000, 4000, 10000]]]))
    assert.equal(result.status, 'PASS')
    assert.deepEqual(result.derived.spaces.map(({ area }) => area), [64_000_000, 36_000_000])
  })

  test('duplicate and overlapping void pieces exclude their union only once', () => {
    for (const pieces of [
      [[0, 6000, 0, 10000], [0, 6000, 0, 10000]],
      [[0, 4000, 0, 10000], [2000, 6000, 0, 10000]]
    ] as Rect[][]) {
      const result = compilePlanSlice(sourceWith([[[6000, 10000, 0, 10000]]], [pieces]))
      assert.equal(result.status, 'PASS')
      assert.equal(result.derived.voids[0].area, 60_000_000)
      assert.equal(result.derived.plateAreas[0].area, 40_000_000)
    }
  })

  test('duplicate void cannot manufacture a false closure by subtracting uncovered floor', () => {
    const result = compilePlanSlice(sourceWith([[[5000, 10000, 0, 10000]]], [
      [[0, 2500, 0, 10000], [0, 2500, 0, 10000]]
    ]))
    assert.equal(result.status, 'FAIL')
    assert.equal(result.derived.plateAreas[0].area, 75_000_000)
    assert.ok(result.diagnostics.some(({ code }) => code === 'PLATE_CLOSURE_MISMATCH'))
  })

  test('separate semantic spaces and voids still cannot overlap; diagnostic area is a union', () => {
    const repeated: Rect[] = [[0, 6000, 0, 10000], [0, 6000, 0, 10000]]
    const rooms = compilePlanSlice(sourceWith([repeated, [[4000, 10000, 0, 10000]]]))
    assert.equal(rooms.status, 'FAIL')
    assert.match(rooms.diagnostics.find(({ code }) => code === 'SPACE_OVERLAP')!.message, /20000000 mm²/)
    const voids = compilePlanSlice(sourceWith([], [repeated, [[4000, 10000, 0, 10000]]]))
    assert.equal(voids.status, 'FAIL')
    assert.match(voids.diagnostics.find(({ code }) => code === 'VOID_OVERLAP')!.message, /20000000 mm²/)
  })

  test('containment, exclusion and invalid geometry remain controlled failures', () => {
    assert.ok(codes(sourceWith([[[-1000, 10000, 0, 10000]]])).includes('SPACE_OUTSIDE_SHELL'))
    assert.ok(codes(sourceWith([[[0, 10000, 0, 10000]]], [[[0, 1000, 0, 10000]]])).includes('SPACE_OCCUPIES_VOID'))
    assert.ok(codes(sourceWith([[[0, 0, 0, 10000]]])).includes('INVALID_SPACE_GEOMETRY'))
    assert.ok(codes(sourceWith([], [[[0, -1000, 0, 10000]]])).includes('INVALID_VOID_GEOMETRY'))
  })
})
