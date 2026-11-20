import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileStudyInstalledInlet } from './current-design/assemblies/study-installed-inlet.js'
import { compileStudyRoomAssembly } from './current-design/assemblies/study-room-assembly.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const source = readGeorgianDesignSnapshot()
const current = prepareCurrentDesignCompile(source)
const initial = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak', firstRestBoardSizeMm: [300, 300] }
const baseline = current.studyRoomKit(initial)
const joined = current.studyRoomKit({ ...initial, installedServices: 'wall-hung-candidate' })

function overlaps(a: readonly number[], b: readonly number[]) {
  return a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]
}

test('the whole Study schedules all walls without a panel-release chain or a skirt across the door', async () => {
  const { roomAssembly: result, kit } = await baseline
  assert.equal(result.state, 'candidate-unqualified')
  assert.equal(result.walls.length, 8)
  assert.equal(result.schedule.movingFaceCount, 99)
  assert.equal(result.releaseReserveMm, 5)
  assert.deepEqual(result.diagnostics, [])
  assert.ok(result.schedule.maximumFaceMassKg < 6)
  assert.equal(new Set(result.walls.flatMap(wall => wall.pieces.map(piece => piece.id))).size, result.schedule.movingFaceCount)
  for (const wall of result.walls) {
    for (const piece of wall.pieces) {
      assert.ok(wall.reserves.every(reserve => !overlaps(piece.faceBox, reserve.box)))
      if (piece.family === 'gravity-hung-cassette') assert.ok(piece.faceBox[3] + piece.releaseMm + result.design.settingMm <= piece.box[3])
      assert.equal(piece.independentOfAdjacentPanels, true)
    }
    if (wall.id === 'north-door') {
      assert.ok(wall.trims.every(trim => trim.intervalMm[1] <= kit.door.rough[0] || trim.intervalMm[0] >= kit.door.rough[1]))
      assert.equal(wall.trims.filter(trim => trim.inheritedProtectedEnd).length, 2)
    }
  }
  assert.equal(result.claims.ownerAestheticApproval, false)
  assert.equal(result.claims.oneHourInstallationAchieved, false)
})

test('every former conditional board trim release names actual independent local skirt pieces', async () => {
  const { roomAssembly: result } = await baseline
  assert.equal(result.trimReleaseBindings.length, 6)
  for (const row of result.trimReleaseBindings) for (const release of row.releases) {
    assert.ok(release.trimIds.length)
    assert.ok(release.localGeometry.every(trim => trim.firstDrawMm === 40 || trim.firstDrawMm === 22))
    assert.equal(release.physicalAccessQualified, false)
  }
})

test('width and material edits regenerate the wall schedule while preserving the actual floor', async () => {
  const [original, wider, tiled] = await Promise.all([baseline,
    current.studyRoomKit({ ...initial, wallPanelWidthMm: 450 }),
    current.studyRoomKit({ ...initial, wallFace: 'porcelain-steel' }),
  ])
  assert.notEqual(wider.roomAssembly.source.inputDigest, original.roomAssembly.source.inputDigest)
  assert.notEqual(wider.roomAssembly.schedule.movingFaceCount, original.roomAssembly.schedule.movingFaceCount)
  assert.deepEqual(wider.kit.floor, original.kit.floor)
  assert.deepEqual(tiled.kit.floor, original.kit.floor)
  assert.ok(tiled.roomAssembly.schedule.completeFaceMassKg > 5 * original.roomAssembly.schedule.completeFaceMassKg)
  assert.ok(tiled.roomAssembly.schedule.maximumFaceMassKg < 10)
  assert.ok(tiled.roomAssembly.rowsMm.length > original.roomAssembly.rowsMm.length)
  assert.equal(tiled.roomAssembly.claims.tileWetRoomAcceptance, false)
})

test('an opening move changes the real south wall and invalidates its details while west and floor remain equal', async () => {
  const [original, moved, repitch] = await Promise.all([baseline,
    current.studyRoomKit({ ...initial, opening: { id: 'GROUND/south-window-0', hostId: 'GROUND/outer-south', occupiedCentreMm: 2120 } }),
    current.studyRoomKit({ ...initial, pitchMm: 450 }),
  ])
  assert.notDeepEqual(moved.roomAssembly.walls[0], original.roomAssembly.walls[0])
  assert.ok(moved.roomAssembly.walls[0].pieces.every(piece => piece.evidence === 'opening-details-stale'))
  assert.deepEqual(moved.roomAssembly.walls.at(-1), original.roomAssembly.walls.at(-1))
  assert.deepEqual(moved.kit.floor, original.kit.floor)
  assert.equal(repitch.kit.floor.parts.length, 77)
  assert.equal(repitch.roomAssembly.source.inputDigest, original.roomAssembly.source.inputDigest)
  assert.deepEqual(repitch.roomAssembly.walls, original.roomAssembly.walls)
})

test('excess lift, bad references and unsupported room shapes do not obtain a geometric pass', async () => {
  const [original, excessive] = await Promise.all([baseline, current.studyRoomKit({ ...initial, wallReleaseMm: 20 })])
  assert.equal(excessive.roomAssembly.state, 'geometry-rejected')
  assert.equal(excessive.roomAssemblySvg, null)
  assert.equal(excessive.roomAssembly.releaseReserveMm, -5)
  assert.ok(excessive.roomAssembly.diagnostics.some(item => item.code === 'IAS_ROOM_KIT_INDEPENDENT_RELEASE_POCKET_EXCEEDED'))
  assert.throws(() => compileStudyRoomAssembly({ ...original.kit, bands: [] }, original.wallTransition), /UNSUPPORTED_STUDY_ROOM_ASSEMBLY_BANDS/)
  assert.throws(() => compileStudyRoomAssembly({ ...original.kit, wall: { ...original.kit.wall, boundRoomOpenings: [] } }, original.wallTransition), /MISSING_BOUND_STUDY_ROOM_ASSEMBLY_OPENING/)
  await assert.rejects(() => current.studyRoomKit({ ...initial, wallPanelWidthMm: 1000 }), /INVALID_STUDY_ROOM_KIT_CASE/)
})

test('the candidate has complete declared inlet bodies and a phase-specific height rejection', async () => {
  const [original, candidate, standing] = await Promise.all([baseline, joined,
    current.studyRoomKit({ ...initial, installedServices: 'wall-hung-candidate', floorWorkerTopMm: 2000 }),
  ])
  assert.equal(original.kit.floor.installedInlet.state, 'unknown-installed-height')
  const installed = candidate.kit.floor.installedInlet
  assert.equal(installed.state, 'wall-hung-candidate')
  if (installed.state !== 'wall-hung-candidate') throw new Error('Missing authored inlet candidate')
  assert.equal(installed.components.length, 6)
  assert.equal(installed.installedCarrierMinimumZMm, 1773.58)
  assert.equal(installed.acceptance.installedEvidence, false)
  assert.ok(installed.components.every(component => component.xyzxyzMm[2] > installed.workerTopMm))
  assert.equal(candidate.kit.floor.furnitureMotion?.firstRest?.witnessCount, 135)
  assert.equal(original.kit.floor.furnitureMotion?.firstRest?.witnessCount, 119)
  assert.equal(standing.kit.floor.furnitureMotion?.firstRest?.witnessCount, 119)
  assert.equal(standing.kit.floor.furnitureMotion?.firstRest?.g1Projection.installedCarrierMinimumZMm, null)
  assert.deepEqual(candidate.kit.grilleKeepOut.box, [2826.5, 1773.58, 3263.5, 2304.58])
  assert.ok(installed.mechanics.oneArmLossStressMPa > 41 && installed.mechanics.oneArmLossStressMPa < 42)
  assert.throws(() => compileStudyInstalledInlet({ ...candidate.kit.grille.actualRetainedInlet, id: 'missing' }, 'wall-hung-candidate', 900, 429.5), /INVALID_BOUND_STUDY_INSTALLED_INLET/)
})

test('broader border pieces are compared honestly rather than selecting a larger route count', async () => {
  const [candidate, broader] = await Promise.all([joined,
    current.studyRoomKit({ ...initial, installedServices: 'wall-hung-candidate', floorBorderMinimumMm: 150 }),
  ])
  assert.equal(broader.kit.floor.parts.length, 145)
  assert.equal(broader.kit.floor.coverageMm2, candidate.kit.floor.coverageMm2)
  assert.equal(broader.kit.floor.furnitureMotion?.firstRest?.witnessCount, 137)
  const count = (item: typeof candidate) => {
    const board = item.kit.floor.firstRestBoardTrial
    assert.ok(board && 'boardCatalogue' in board)
    return board.boardCatalogue.localWallTrimReleased.placementCount
  }
  assert.equal(count(candidate), 133)
  assert.equal(count(broader), 128)
  assert.ok(Math.min(...broader.kit.floor.parts.flatMap(part => part.sizeMm)) >= 102)
})

test('a lower kneeling contact profile does not masquerade as a complete handling solution', async () => {
  const kneeling = await current.studyRoomKit({ ...initial, installedServices: 'wall-hung-candidate', floorPosture: 'kneeling-candidate' })
  const rest = kneeling.kit.floor.furnitureMotion?.firstRest
  assert.ok(rest)
  assert.equal(rest.witnessCount, 140)
  const board = kneeling.kit.floor.firstRestBoardTrial
  assert.ok(board && 'boardCatalogue' in board)
  assert.equal(board.boardCatalogue.localWallTrimReleased.placementCount, 105)
  assert.equal(kneeling.roomAssembly.claims.wholeFloorHandlingAcceptance, false)
  assert.ok(rest.parts.some(row => row.state === 'direct-geometry-witness' && row.witness.worker.lowSupportSweepsXYXYMm?.length === 2))
})

test('source-frame notches change the actual floor shape, mass and plan without changing fixed frames or the wall geometry', async () => {
  const [original, notched] = await Promise.all([joined, current.studyRoomKit({ ...initial, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5 })])
  const pieces = notched.kit.floor.parts.filter(part => part.frameNotches.length)
  assert.equal(pieces.length, 2)
  assert.ok(pieces.every(part => part.facePieces.length > 1))
  assert.ok(pieces.every(part => part.wearFaceKg < original.kit.floor.parts.find(other => other.id === part.id)!.wearFaceKg))
  assert.equal(original.kit.floor.coverageMm2 - notched.kit.floor.coverageMm2, 3105)
  assert.deepEqual(original.kit.floor.frameFootprints, notched.kit.floor.frameFootprints)
  assert.deepEqual(original.roomAssembly.walls, notched.roomAssembly.walls)
  assert.ok(notched.plan.primitives.some(primitive => primitive.metadata?.shapedPartId))
  for (const part of pieces) for (const foot of part.frameNotches) assert.ok(part.facePieces.every(piece => !overlaps(piece, foot)))
})

test('the production source plan validates every shaped floor part including actual board placement and connected approach', async () => {
  const ordinaryHandling = JSON.parse(readFileSync(new URL('../../project/ias/studies/crafted-study-handling-plan.json', import.meta.url), 'utf8'))
  const request = { ...initial, installedServices: 'wall-hung-candidate', frameFootClearanceMm: 5, finishDepthMm: 15, ordinaryHandling }
  const result = await current.studyRoomKit(request)
  const proof = result.kit.floor.ordinaryHandling
  assert.ok(proof && proof.state === 'joined-geometry-witnesses')
  assert.equal(proof.partCount, 144)
  assert.equal(proof.witnessCount, 144)
  assert.equal(new Set(proof.parts.map(part => part.partId)).size, 144)
  assert.equal(proof.physicalAcceptance, false)
  assert.ok(proof.parts.every(part => part.staging?.state === 'joined-geometry-witness'))
  assert.equal(proof.parts.filter(part => part.staging?.secondHandlerWithdrawalXYMm).length, 6)
  assert.ok(proof.parts.every(part => part.bodyToPanelMm! >= 335 - 1e-7 && part.maximumKeyReachMm! <= 600 + 1e-7))
  const overlap = structuredClone(ordinaryHandling)
  overlap.protocols[0].boardOriginXYMm = result.kit.floor.parts[0].face.slice(0, 2)
  const adverse = await current.studyRoomKit({ ...request, ordinaryHandling: overlap })
  assert.ok(adverse.kit.floor.ordinaryHandling && adverse.kit.floor.ordinaryHandling.state === 'partial-geometry-witnesses')
  assert.equal(adverse.kit.floor.ordinaryHandling.witnessCount, 143)
  assert.equal(adverse.kit.floor.ordinaryHandling.parts[0].diagnostic, 'IAS_ORDINARY_BOARD_PICKUP_CLEARANCE')
  assert.deepEqual(adverse.roomAssembly.walls, result.roomAssembly.walls)
  const missing = structuredClone(ordinaryHandling)
  missing.protocols[0].padBearingPartIds[0] = 'missing-current-floor-part'
  await assert.rejects(() => current.studyRoomKit({ ...request, ordinaryHandling: missing }), /Board pad must reference a separate current seated floor face/)
  const repitch = await current.studyRoomKit({ ...request, pitchMm: 450 })
  assert.equal(repitch.kit.floor.ordinaryHandling?.state, 'source-withheld')
})

test('saved engineering documents replay these wall, service and floor settings through the production path', async () => {
  const saved = await readEngineeringDocument(source)
  const document = { ...saved, stages: { studyRoomKit: { pitchMm: 300, wearingFace: 'oak', firstRestBoardSizeMm: [300, 300],
    installedServices: 'wall-hung-candidate', wallPanelWidthMm: 450, wallFace: 'porcelain-steel' } } }
  const result = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.equal(result.engineering.studyRoomKit?.roomAssembly.widthMm, 450)
  assert.equal(result.engineering.studyRoomKit?.roomAssembly.face, 'porcelain-steel')
  assert.equal(result.engineering.studyRoomKit?.kit.floor.installedInlet.state, 'wall-hung-candidate')
  assert.ok(result.manifest.find(row => row.stage === 'studyRoomKit')?.controls.includes('stages.studyRoomKit.installedServices'))
})

test('the joined proposal drawings and schedule regenerate from the actual compiler', () => {
  execFileSync(process.execPath, ['--import', 'tsx', 'project/ias/studies/crafted-study-convergence.mjs', '--check'], { cwd: new URL('../../', import.meta.url), stdio: 'pipe' })
})
