import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectFloorServiceRoutes } from './current-design/structural-floor-section.js'

test('actual segments preserve holes and distinguish pre-existing crossings from new section depth', () => {
  const cells = [[0, 0, 40, 100], [60, 0, 100, 100]]
  const r = inspectFloorServiceRoutes([
    [[20, 50, 3000], [20, 50, 3500]], // Existing vertical crossing.
    [[50, 50, 3000], [50, 50, 3500]], // Actual opening remains empty.
    [[10, 10, 3390], [90, 10, 3390]], // New band, split by the opening.
    [[0, 0, 3600], [100, 100, 3600]], // Outside the section.
  ], cells, 3170, 3420)
  assert.equal(r.conflicts.length, 3)
  assert.equal(r.conflicts[0]!.preExistingAt200Mm, true)
  assert.deepEqual(r.conflicts[0]!.intervalXYZMm, [[20, 50, 3170], [20, 50, 3420]])
  assert.ok(r.conflicts.slice(1).every(row => !row.preExistingAt200Mm))
  assert.deepEqual(r.conflicts.slice(1).map(row => row.intervalXYZMm), [[[10, 10, 3390], [40, 10, 3390]], [[60, 10, 3390], [90, 10, 3390]]])
  assert.equal(r.serviceFitAccepted, false)
  assert.equal(r.completeServiceEnvelopesAvailable, false)
})

test('route segmentation and reversed orientation preserve the actual physical intersection', () => {
  const cells = [[0, 0, 100, 100]]
  const forward = inspectFloorServiceRoutes([[[50, 50, 3000], [50, 50, 3500]]], cells, 3170, 3420)
  const reverse = inspectFloorServiceRoutes([[[50, 50, 3500], [50, 50, 3000]]], cells, 3170, 3420)
  assert.deepEqual(reverse.conflicts[0]!.intervalXYZMm, [...forward.conflicts[0]!.intervalXYZMm].reverse())
  assert.throws(() => inspectFloorServiceRoutes([[[0, Number.NaN, 3200], [10, 0, 3300]]], cells, 3170, 3420), /Unsupported/)
})
