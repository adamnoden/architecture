import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { compileRenewableOpenings } from './current-design/assemblies/renewable-openings.js'
import { compileResolvedStudyAssembly } from './current-design/assemblies/study-floor.js'
import { compileStudyFurnitureMotion } from './current-design/assemblies/study-furniture-motion.js'
import { compileStudyGroundSupport } from './current-design/assemblies/study-ground-support.js'
import { compileStudyWallTransition } from './current-design/assemblies/study-wall-transition.js'
import { drawStudyWallTransition } from './current-design/assemblies/study-wall-transition-views.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { resolveCurrentDesign } from './current-design/resolve.js'

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
  assert.deepEqual([kit.floor.parts.length, repitch.kit.floor.parts.length], [144, 77])
  assert.equal(kit.floor.coverageMm2, 8_413_649.75)
  assert.equal(kit.floor.coverageMm2, repitch.kit.floor.coverageMm2)
  assert.deepEqual(kit.occupied, repitch.kit.occupied)
  assert.deepEqual(kit.opening, repitch.kit.opening)
  assert.equal(baseline.wallTransition.source.transitionCaseDigest, repitch.wallTransition.source.transitionCaseDigest)
  assert.deepEqual(baseline.wallTransition.field, repitch.wallTransition.field)
  assert.equal(kit.floor.jointMm, 3)
  assert.equal(new Set(kit.floor.parts.map(part => part.id)).size, kit.floor.parts.length)
  assert.ok(kit.floor.parts.every(part => part.sizeMm.every(size => size >= 67.5 && size <= 367.5)))
  assert.deepEqual(kit.floor.emitterPlinth.state, 'geometry-screen-only')
  if (kit.floor.emitterPlinth.state !== 'geometry-screen-only') throw new Error('Missing Study emitter plinth')
  const plinth = kit.floor.emitterPlinth
  assert.deepEqual(plinth.box, [429.5, 1246, 634.5, 2405])
  assert.deepEqual(plinth.face, [429.5, 1247.5, 633, 2403.5])
  assert.equal(plinth.areaMm2, 237_595)
  assert.equal(plinth.smallestAdjacentFaceGapMm, 5.5)
  for (const { box, occupied, grip } of kit.floor.parts) {
    assert.ok(box[2] <= plinth.box[0] || box[0] >= plinth.box[2] || box[3] <= plinth.box[1] || box[1] >= plinth.box[3])
    assert.ok(!occupied.includes(plinth.emitterId))
    assert.ok(grip && grip.endMarginMm >= 20)
  }
  assert.equal(plan.primitives.filter(part => part.id === plinth.id).length, 1)
  assert.deepEqual(repitch.kit.floor.emitterPlinth, { state: 'withheld', code: 'TRIAL_EMITTER_BORDER_REQUIRES_300_MM_STOCK' })
  assert.deepEqual(repitch.kit.floor.handling, repitch.kit.floor.emitterPlinth)
  assert.equal(kit.floor.handling.state, 'geometry-and-demand-screen')
  assert.equal(tile.kit.floor.handling.state, 'geometry-and-demand-screen')
  assert.equal(kit.floor.handling.parking.furnitureCovered, 37)
  assert.deepEqual(kit.floor.handling.parking.unexposedPartIds, [])
  assert.equal(kit.floor.handling.keyedFace.toolRadiusLimitMm, 20.75)
  assert.equal(kit.floor.handling.emitterEdgeRelease.pickupLiftMm, 38)
  assert.equal(kit.floor.handling.emitterEdgeRelease.worstRestPadN, 117.72)
  assert.ok(kit.floor.handling.emitterEdgeRelease.edgeReleaseClear)
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

test('Study floor access identifies the parts the reversible BCR furniture path leaves covered', async () => {
  const [baseline, repitch, moved] = await Promise.all([
    current.studyRoomKit(initial), current.studyRoomKit({ ...initial, pitchMm: 450 }),
    current.studyRoomKit({ ...initial, opening }),
  ])
  const { handling } = baseline.kit.floor
  assert.ok(handling.state !== 'withheld')
  const { parking } = handling
  assert.equal(parking.candidateState, 'static-only')
  assert.equal(parking.deskShiftMm, 800)
  assert.equal(parking.deskTravelBeyondBcrMm, 100)
  assert.equal(parking.extendedDeskOverlapWithBcrChairMm, 50)
  const { retainedBcrCase: bcr } = parking
  assert.equal(bcr.receipt.path, 'project/bcr/studies/bay-interface-study.json')
  assert.equal(bcr.deskShiftMm, 700)
  assert.deepEqual(bcr.unexposedPartIds.map(id => id.split('/').slice(-2).join('/')), [
    '800/1103', '800/2000', '1100/1103', '1100/2000', '1400/1103', '1400/2000',
    '1700/1103', '1700/2000', '2000/1103', '634.5/1246',
  ])
  assert.deepEqual(parking.turnedChairAtBcrDeskShiftUnexposedPartIds,
    bcr.unexposedPartIds.filter(id => !id.endsWith('/2000')))
  assert.ok(baseline.furnitureAccessPlan)
  const highlighted = (result: typeof baseline) =>
    result.furnitureAccessPlan?.primitives.flatMap(item =>
      item.kind === 'rect' && item.fill === 'context' && item.metadata?.coveredInBothBcrStages
        ? [item.id] : [])
  assert.deepEqual(highlighted(baseline), bcr.unexposedPartIds)
  assert.deepEqual(highlighted(moved), bcr.unexposedPartIds)
  assert.equal(repitch.furnitureAccessPlan, null)
})

test('the full Study furniture sequence clears the fixed occupied bay and rejects a missed chair alignment', async () => {
  const [baseline, repitch] = await Promise.all([
    current.studyRoomKit(initial), current.studyRoomKit({ ...initial, pitchMm: 450 }),
  ])
  const motion = baseline.kit.floor.furnitureMotion
  assert.ok(motion)
  assert.equal(motion.state, 'geometry-screen-only')
  assert.equal(motion.physicalAcceptance, false)
  assert.equal(motion.reverseUsesSameSweeps, true)
  assert.deepEqual(motion.conflictingPhaseIds, [])
  assert.equal(motion.phases.length, 12)
  const turn = motion.phases.find(phase => phase.type === 'rotation')
  assert.equal(turn?.type, 'rotation')
  if (turn?.type !== 'rotation') throw new Error('Missing chair turn')
  assert.deepEqual(turn.centreXYMm, [2250, 2020])
  assert.ok(Math.abs(turn.bodyToItemMm - 25.318797646314465) < 1e-9)
  assert.equal(turn.maximumProspectiveReachMm, 548)
  const desk = motion.phases.find(phase => phase.id === 'pull-desk-north')
  assert.equal(desk?.type, 'translation')
  if (desk?.type !== 'translation') throw new Error('Missing desk shift')
  assert.equal(desk.minimumItemClearanceMm, 25.5)
  assert.deepEqual(desk.worker.points, [[1455, 1645], [1455, 2445]])
  assert.deepEqual(desk.endXYWHMm, [655, 1400, 1600, 700])
  assert.ok(baseline.furnitureMotionPlan?.primitives.some(item => item.id === 'turn-chair'))
  assert.equal(repitch.kit.floor.furnitureMotion, null)
  assert.equal(repitch.furnitureMotionPlan, null)

  const { bayReceiptSha256, turnReceiptSha256 } = motion.basis
  const adverse = compileStudyFurnitureMotion(bayReceiptSha256, turnReceiptSha256,
    motion.candidate.deskParkXYXYMm, [2325, 1520, 3225, 2520])
  assert.equal(adverse.state, 'geometry-conflict')
  assert.ok(adverse.conflictingPhaseIds.includes('park-turned-chair-east'))
  assert.throws(() => compileStudyFurnitureMotion('0'.repeat(64), turnReceiptSha256,
    motion.candidate.deskParkXYXYMm, motion.candidate.chairParkXYXYMm), /source-bound bay receipt/)
})

test('the Study kit locates whole-face first rests and withholds unknown G1 crossing heights', async () => {
  const { kit } = await current.studyRoomKit(initial)
  const results = kit.floor.furnitureMotion?.firstRest
  assert.ok(results)
  assert.equal(results.physicalAcceptance, false)
  assert.equal(results.partCount, 144)
  assert.equal(results.witnessCount, 118)
  assert.deepEqual(results.transferVertical, {
    initialLiftMm: 38, travelTopMm: 38, travelUndersideMm: 18, firstRestBoardTopMm: 12, undersideReserveMm: 6,
  })
  assert.deepEqual(results.parts.map(part => part.partId), kit.floor.parts.map(part => part.id))
  const rest = new Map(kit.floor.parts.map(part => [part.id, part]))
  for (const result of results.parts) {
    if (result.state !== 'direct-geometry-witness') continue
    const { witness } = result
    const [start, end] = witness.worker.points
    assert.ok(witness.worker.minimumClearance >= 5 - 1e-8)
    assert.ok(witness.reachMm <= 600 + 1e-8)
    assert.ok(witness.shiftXYMm.every((shift, axis) => Math.abs(end[axis] - start[axis] - shift) < 1e-8))
    const source = rest.get(result.partId)!
    const receiving = rest.get(witness.restPartId)!
    assert.notEqual(source.id, receiving.id)
    for (const axis of [0, 1]) {
      assert.ok(source.face[axis] + witness.shiftXYMm[axis] >= receiving.face[axis] - 1e-8)
      assert.ok(source.face[axis + 2] + witness.shiftXYMm[axis] <= receiving.face[axis + 2] + 1e-8)
    }
  }
  const at = (suffix: string) => results.parts.find(part => part.partId.endsWith(`/${suffix}`))
  assert.equal(at('429.5/429.5')?.state, 'no-adjacent-whole-face-rest')
  assert.equal(at('3800/500')?.state, 'worker-stance-or-reach-unsupported')
  const g1 = at('2900/500')
  assert.ok(g1?.state === 'panel-sweep-unsupported')
  assert.deepEqual(g1.encounteredPlanProjectionIds, ['study-inlet-carrier', 'study-inlet-installed'])
  assert.equal(results.g1Projection.installedCarrierMinimumZMm, null)
  assert.deepEqual(results.g1Projection.releasedPackageZMm, [1933.58, 2282.08])
})

test('A 15 mm finish preserves the ground datum but the floating support allowance is still short', async () => {
  const [standard, oak, stone] = await Promise.all([
    current.studyRoomKit(initial),
    current.studyRoomKit({ ...initial, finishDepthMm: 15 }),
    current.studyRoomKit({ ...initial, finishDepthMm: 15, wearingFace: 'stone-steel' }),
  ])
  assert.equal(oak.kit.floor.wearingFaceMm, 13)
  assert.equal(stone.kit.floor.wearingFaceMm, 13)
  assert.equal(stone.kit.floor.parts[0].grip?.endMarginMm, oak.kit.floor.parts[0].grip?.endMarginMm)
  assert.deepEqual(oak.kit.floor.parts.map(p => p.face), standard.kit.floor.parts.map(p => p.face))
  assert.equal(standard.kit.floor.groundSupport.state, 'geometry-comparison')
  assert.equal(oak.kit.floor.groundSupport.state, 'geometry-comparison')
  assert.equal(oak.kit.floor.groundSupport.glassTopMm, -80)
  assert.equal(oak.kit.floor.groundSupport.cellularGlassMm, 100)
  assert.ok(Math.abs(standard.kit.floor.groundSupport.marginToMinimumBeforeLevelToleranceMm + 5.3) < 1e-9)
  assert.ok(Math.abs(oak.kit.floor.groundSupport.marginToMinimumBeforeLevelToleranceMm + 0.3) < 1e-9)
  assert.deepEqual(oak.kit.floor.groundSupport, stone.kit.floor.groundSupport)
  assert.equal(oak.kit.floor.groundSupport.disposition, 'withheld')
  assert.equal(oak.kit.floor.handling.state, 'geometry-and-demand-screen')
  assert.equal(oak.kit.floor.handling.emitterEdgeRelease.pickupLiftMm, 33)
  assert.equal(oak.kit.floor.furnitureMotion?.firstRest?.transferVertical.travelTopMm, 33)
  assert.equal(stone.kit.floor.furnitureMotion?.firstRest?.transferVertical.undersideReserveMm, 6)
  assert.notEqual(oak.kit.caseDigest, standard.kit.caseDigest)
  await assert.rejects(current.studyRoomKit({ ...initial, finishDepthMm: 16 }), /INVALID_STUDY_ROOM_KIT_CASE/)
})

test('Study ground support carries the actual MAT stack and charges a deck level loss only to that comparison', async () => {
  const request = { ...initial, finishDepthMm: 15 }
  const baseline = await current.studyRoomKit(request)
  const changed = await current.studyRoomKit({ ...request, groundDeckLevelLossMm: 1 })
  const native = baseline.kit.floor.groundSupport
  const trial = changed.kit.floor.groundSupport
  assert.equal(native.state, 'geometry-comparison')
  assert.equal(trial.state, 'geometry-comparison')
  assert.deepEqual([native.fflMm, native.matDeckTopMm, native.glassTopMm, native.rcTopMm, native.rcSoffitMm], [0, -15, -80, -180, -380])
  assert.equal(native.matDistributionMm, 65)
  assert.equal(native.source.comparison.path, 'project/mat/studies/floor-pour-boundary.results.json')
  assert.deepEqual(trial.source, native.source)
  assert.equal(native.actualCourseBeforeLevelToleranceMm, 64.7)
  assert.equal(trial.actualCourseBeforeLevelToleranceMm, 64.7)
  assert.equal(trial.courseAfterDeckLevelLossMm, 63.7)
  assert.equal(native.maximumFinishAndBeddingMm, 14.7)
  assert.equal(trial.maximumFinishAndBeddingMm, 13.7)
  assert.equal(trial.diagnostics[0].code, 'IAS_STUDY_GROUND_COURSE_BELOW_COMPARATOR')
  assert.deepEqual(changed.kit.floor.parts, baseline.kit.floor.parts)
  assert.deepEqual(changed.kit.wall, baseline.kit.wall)
  assert.equal(changed.wallTransition.source.transitionCaseDigest, baseline.wallTransition.source.transitionCaseDigest)
  await assert.rejects(current.studyRoomKit({ ...request, groundDeckLevelLossMm: -1 }), /INVALID_STUDY_ROOM_KIT_CASE/)
})

test('the Study support stage withholds missing MAT evidence, altered bytes or an incompatible local datum', () => {
  const resolved = resolveCurrentDesign(design)
  const { section } = compileResolvedStudyAssembly(resolved, { finishDepthMm: 15 })
  const receipt = 'project/mat/studies/floor-pour-boundary.results.json'
  const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url))
  const missing = compileStudyGroundSupport(resolved, section, 0, path => {
    if (path === receipt) throw new Error('missing file')
    return read(path)
  })
  const stale = compileStudyGroundSupport(resolved, section, 0, path => path === receipt ? Buffer.from('{}') : read(path))
  const incompatible = compileStudyGroundSupport(resolved, { ...section, rcTop: section.rcTop - 1 }, 0)
  for (const [result, code] of [
    [missing, 'IAS_STUDY_GROUND_SOURCE_UNAVAILABLE'], [stale, 'IAS_STUDY_GROUND_SOURCE_STALE'],
    [incompatible, 'IAS_STUDY_GROUND_DATUM_MISMATCH'],
  ] as const) {
    assert.equal(result.state, 'source-withheld')
    assert.deepEqual(result.diagnostics, [{ code, path: receipt, objectIds: ['GROUND/G-STUDY/floor'] }])
    assert.ok(!('marginAfterDeckLevelLossMm' in result))
  }
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
  assert.deepEqual(moved.kit.grilleKeepOut, baseline.kit.grilleKeepOut)
  const [left, bottom, right, top] = baseline.kit.grilleKeepOut.box
  for (const trial of [baseline, moved]) {
    assert.ok(trial.kit.wall.southField.pieces.every(({ box: [x0, z0, x1, z1] }) =>
      x1 <= left || right <= x0 || z1 <= bottom || top <= z0))
  }
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
  await assert.rejects(current.studyRoomKit({ ...initial, opening: { ...opening, occupiedCentreMm: 2400 } }), /STUDY_ROOM_KIT_OPENING_INTERSECTS_G1_RESERVE/)
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
  execFileSync(process.execPath, ['--import', 'tsx', 'project/ias/studies/crafted-study-wall-transition.mjs', '--check'], {
    cwd: new URL('../../', import.meta.url),
  })
})

test('Study wall transition follows the occupied jamb and keeps independent controls', async () => {
  const baseline = await current.studyRoomKit(initial)
  const moved = await current.studyRoomKit({ ...initial, opening })
  const { wallTransition: native } = baseline
  const { wallTransition: trial } = moved
  assert.equal(native.status, 'DEVELOPMENT_COMPARISON')
  assert.equal(trial.status, 'DEVELOPMENT_COMPARISON')
  assert.equal(native.source.kitCaseDigest, baseline.kit.caseDigest)
  assert.equal(trial.source.kitCaseDigest, moved.kit.caseDigest)
  assert.deepEqual(native.field.moduleXZMm, [2675, 1280, 3125, 1730])
  assert.deepEqual(trial.field.moduleXZMm, [2695, 1280, 3145, 1730])
  assert.deepEqual(trial.field.rails.hardLandXMm, [2720, 3120])
  assert.deepEqual(trial.field.fixedLapXMm, [2640, 2670])
  assert.deepEqual(trial.field.jambStopsXMm[1], native.field.jambStopsXMm[1])
  assert.deepEqual(trial.field.grilleXZMm, native.field.grilleXZMm)
  assert.equal(trial.field.doorFinishYMm, native.field.doorFinishYMm)
  assert.equal(trial.field.minimumVerticalReserveToG1Mm, 158)
  assert.equal(trial.field.translatedUp200MmIntersectsG1, true)
  assert.deepEqual(trial.fitUm, native.fitUm)
  assert.deepEqual(native.fitUm.maximumStack, { admitted: true, packUm: 500, faceUm: 26850, possibleFaceUm: [26700, 27000] })
  assert.equal(native.fitUm.proudStack.admitted, false)
  assert.equal(native.fitUm.uncorrectableSubstrate.admitted, false)
  assert.equal(native.fitUm.inadequateStackForPack.admitted, false)
  assert.equal(native.field.retainedHalfHeadInwardDrawMm, 250)
  assert.equal(trial.field.retainedHalfHeadInwardDrawMm, null)
  assert.equal(trial.field.retainedHalfHeadPocketReserveMm, null)
  assert.deepEqual(trial.diagnostics, [{ code: 'IAS_STUDY_WALL_WINDOW_WITHDRAWAL_STALE', objectIds: [opening.id] }])
  assert.match(baseline.wallTransitionSvg!, /id="study-wall-module-set-out" d="M704 675H956"/)
  assert.match(moved.wallTransitionSvg!, /id="study-wall-module-set-out" d="M715\.2 675H967\.2"/)
  assert.notEqual(trial.source.transitionCaseDigest, native.source.transitionCaseDigest)
  const window = compileRenewableOpenings(resolveCurrentDesign(design)).window
  const stale = compileStudyWallTransition(baseline.kit, window, () => Buffer.from('{}'))
  assert.equal(stale.status, 'REFERENCE_WITHHELD')
  assert.deepEqual(stale.diagnostics, [{ code: 'IAS_STUDY_WALL_DOOR_REVEAL_STALE', objectIds: [baseline.kit.door.id] }])
  assert.equal(stale.field.retainedSkirtingFirstDrawMm, null)
  assert.equal(drawStudyWallTransition(stale), null)
  const missing = compileStudyWallTransition(baseline.kit, window, () => { throw new Error('missing file') })
  assert.equal(missing.diagnostics[0].code, 'IAS_STUDY_WALL_DOOR_REVEAL_UNAVAILABLE')
})

test('a permissible window move can exhaust the independent lining pier and reject its sheet', async () => {
  const { kit, wallTransition, wallTransitionSvg } = await current.studyRoomKit({
    ...initial, opening: { ...opening, occupiedCentreMm: 2330 },
  })
  assert.equal(kit.opening.box[2], 2830)
  assert.equal(wallTransition.field.moduleXZMm[2], 3355)
  assert.equal(wallTransition.field.jambStopsXMm[1][0], 3350)
  assert.equal(wallTransition.status, 'GEOMETRY_REJECTED')
  assert.equal(wallTransitionSvg, null)
  assert.deepEqual(wallTransition.diagnostics[0], {
    code: 'IAS_STUDY_WALL_MODULE_INTERSECTS_JAMB_STOP',
    objectIds: [kit.wall.id, kit.opening.id, wallTransition.source.fixedOpeningId],
  })
})
