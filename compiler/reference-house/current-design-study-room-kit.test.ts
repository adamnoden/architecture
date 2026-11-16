import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const current = prepareCurrentDesignCompile(design)
const initial = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak' }
const opening = { id: 'GROUND/south-window-0', hostId: 'GROUND/outer-south', occupiedCentreMm: 2120 }

test('Study kit lays out actual stable parts and discrete border widths in the furnished Study', async () => {
  const [baseline, repitch, tile] = await Promise.all([
    current.studyRoomKit(initial), current.studyRoomKit({ ...initial, pitchMm: 450 }),
    current.studyRoomKit({ ...initial, wearingFace: 'stone-steel' }),
  ])
  const { kit, plan } = baseline
  assert.equal(kit.source.occupiedHouse, 'HAD-SERVICES-02')
  assert.equal(kit.source.roomId, 'GROUND/G-STUDY')
  assert.deepEqual([kit.floor.parts.length, repitch.kit.floor.parts.length], [146, 77])
  assert.equal(kit.floor.coverageMm2, 8_413_649.75)
  assert.equal(kit.floor.coverageMm2, repitch.kit.floor.coverageMm2)
  assert.deepEqual(kit.occupied, repitch.kit.occupied)
  assert.deepEqual(kit.opening, repitch.kit.opening)
  assert.equal(kit.floor.jointMm, 3)
  assert.equal(new Set(kit.floor.parts.map(part => part.id)).size, kit.floor.parts.length)
  assert.ok(kit.floor.parts.every(part => part.sizeMm.every(size => size >= 57 && size <= 297)))
  assert.ok(kit.floor.parts.some(part => part.role === 'border' && part.sizeMm.includes(148.5)))
  assert.notEqual(kit.caseDigest, repitch.kit.caseDigest)
  assert.notEqual(renderDrawingSceneV2Svg(plan), renderDrawingSceneV2Svg(repitch.plan))
  assert.equal(kit.floor.release.state, 'geometry-screen-only')
  assert.equal(kit.floor.release.wallMarginMm, 13.75)
  assert.equal(kit.floor.release.outsidePlane.bestWallMarginMm, 0.25)
  assert.ok(Math.abs(kit.floor.release.posture.maximumComparisonReachMm - 543.3820594204412) < 1e-8)
  assert.equal(kit.floor.release.pickupId, 'GROUND/G-STUDY/room-kit/floor/3800/500')
  assert.equal(kit.floor.release.firstRestId, 'GROUND/G-STUDY/room-kit/floor/4100/500')
  assert.deepEqual(repitch.kit.floor.release, { state: 'withheld', code: 'TRIAL_PICKUP_OR_FIRST_REST_CHANGED' })
  const pick = <T extends typeof kit | typeof tile.kit>(trial: T) => trial.floor.parts.find(part => part.id.endsWith('/3800/500'))
  assert.ok(Math.abs(pick(kit)!.wearFaceKg - 1.1114334) < 1e-8)
  assert.ok(Math.abs(pick(tile.kit)!.wearFaceKg - 4.93529355) < 1e-8)
  assert.equal(tile.kit.floor.depthUnassignedWithinFinishMm, 3)
})

test('a real hosted current-design position edit moves the local reserve and withholds its fixed evidence', async () => {
  const baseline = await current.studyRoomKit(initial)
  const moved = await current.studyRoomKit({ ...initial, opening })
  assert.deepEqual(baseline.kit.opening.box, [1600, 750, 2600, 2850])
  assert.deepEqual(moved.kit.opening.box, [1620, 750, 2620, 2850])
  assert.equal(moved.kit.opening.nominalToOccupiedOffsetMm, 300)
  assert.equal(moved.kit.opening.id, opening.id)
  assert.deepEqual(moved.kit.opening.evidence, { state: 'stale', code: 'MOVED_STUDY_OPENING_FIXED_DETAILS' })
  assert.deepEqual(moved.kit.opening.fixedControls, baseline.kit.opening.fixedControls)
  assert.deepEqual(moved.kit.floor, baseline.kit.floor)
  assert.deepEqual(moved.kit.door, baseline.kit.door)
  assert.deepEqual(moved.kit.grille, baseline.kit.grille)
  assert.notDeepEqual(moved.kit.wall.southField.pieces, baseline.kit.wall.southField.pieces)
  assert.notEqual(renderDrawingSceneV2Svg(moved.wallElevation), renderDrawingSceneV2Svg(baseline.wallElevation))
  assert.ok(Math.abs(moved.kit.wall.southField.faceAreaM2 - baseline.kit.wall.southField.faceAreaM2) < 1e-8)
  assert.notEqual(moved.kit.caseDigest, baseline.kit.caseDigest)
  const changed = (draft: typeof baseline) => draft.plan.primitives.find(item => item.id === opening.id)
  assert.notDeepEqual(changed(moved), changed(baseline))
  assert.notEqual(renderDrawingSceneV2Svg(moved.plan), renderDrawingSceneV2Svg(baseline.plan))
})

test('room kit refuses malformed and out-of-scope geometry and can be replayed through the CLI', async () => {
  await assert.rejects(current.studyRoomKit({ ...initial, opening: { ...opening, id: 'GROUND/unknown' } }), /UNKNOWN_STUDY_ROOM_KIT_HOSTED_OPENING/)
  await assert.rejects(current.studyRoomKit({ ...initial, opening: { ...opening, hostId: 'GROUND/outer-west' } }), /UNKNOWN_STUDY_ROOM_KIT_HOSTED_OPENING/)
  await assert.rejects(current.studyRoomKit({ ...initial, opening: { ...opening, occupiedCentreMm: 3600 } }), /STUDY_ROOM_KIT_(MOVE_REJECTED|OCCUPIED_OPENING_OUTSIDE_AVAILABLE_HOST)/)
  await assert.rejects(current.studyRoomKit({ ...initial, opening: { ...opening, occupiedCentreMm: Infinity } }), /INVALID_STUDY_ROOM_KIT_OPENING/)
  await assert.rejects(current.studyRoomKit({ ...initial, pitchMm: 374 }), /outside the native IAS comparison/)
  const draft = { ...initial, opening }
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--study-room-kit', '-'], {
    cwd: new URL('../../', import.meta.url), input: JSON.stringify({ schema: 'ias-study-room-kit-request/1', design, kit: draft }), encoding: 'utf8',
  }))
  assert.deepEqual(cli, await current.studyRoomKit(draft))
})

test('the furnished comparison, technical drawings and part schedule match the current kit', () => {
  execFileSync(process.execPath, ['--import', 'tsx', 'project/ias/studies/crafted-study-views.mjs', '--check'], {
    cwd: new URL('../../', import.meta.url),
  })
})
