import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { sha256SemanticFingerprint } from '../../../core/identity.js'
import type { compileRenewableOpenings } from './renewable-openings.js'
import type { StudyRoomKit } from './study-room-kit.js'

type Box = readonly [number, number, number, number]
type WindowReference = ReturnType<typeof compileRenewableOpenings>['window']
type DoorReveal = {
  readonly finishedWallYmm: readonly [number, number]
  readonly trimEndPieceXmm: readonly [readonly [number, number], readonly [number, number]]
  readonly releaseSouthMm: number
}

const doorRevealPath = 'project/ias/studies/study-door-reveal.json'
const doorRevealSha256 = '5defb570d91832c5d862226fd93c46aa0026124a02b74bae0d5fe9f60a5f20b9'
const readDoorReveal = () => readFileSync(new URL(`../../../../${doorRevealPath}`, import.meta.url))
const fixed = { metalAirPlane: 500, gaugedFixedPlaneCorrection: 500, maximumMineralBoard: 6500 }
const moving = { matedCleat: 6350, fitting: 2000, maximumCassette: 10500 }
const stepUm = 100
const measurementAndSetUm = 150
const maximumHardPackUm = 1500

function gauge(datumUm: number, measuredStackUm: number, fixedLocalOutOfPlaneUm: number) {
  if (fixedLocalOutOfPlaneUm > fixed.gaugedFixedPlaneCorrection) {
    return { admitted: false, reason: 'fixed-plane-gauge-exceeded' } as const
  }
  const packUm = Math.floor((datumUm - measuredStackUm - measurementAndSetUm) / stepUm) * stepUm
  if (packUm < 0 || packUm > maximumHardPackUm) {
    return { admitted: false, reason: 'dry-pack-outside-tested-range' } as const
  }
  const faceUm = measuredStackUm + packUm
  return { admitted: true, packUm, faceUm, possibleFaceUm: [faceUm - measurementAndSetUm, faceUm + measurementAndSetUm] } as const
}

function intersects([x0, z0, x1, z1]: Box, [a0, b0, a1, b1]: Box) {
  return x0 < a1 && a0 < x1 && z0 < b1 && b0 < z1
}

function doorComparison(kit: StudyRoomKit, read: typeof readDoorReveal) {
  let bytes: Buffer
  try {
    bytes = read()
  } catch {
    return { code: 'IAS_STUDY_WALL_DOOR_REVEAL_UNAVAILABLE' } as const
  }
  if (createHash('sha256').update(bytes).digest('hex') !== doorRevealSha256) {
    return { code: 'IAS_STUDY_WALL_DOOR_REVEAL_STALE' } as const
  }
  const door = JSON.parse(bytes.toString('utf8')) as DoorReveal
  const [[, leftTrimEnd], [rightTrimStart]] = door.trimEndPieceXmm
  const [roughLeft, roughRight] = kit.door.rough
  if (door.finishedWallYmm[0] !== kit.bands.at(-1)?.[3] || leftTrimEnd + 5 !== roughLeft || rightTrimStart - 5 !== roughRight) {
    return { code: 'IAS_STUDY_WALL_DOOR_REVEAL_MISMATCH' } as const
  }
  return { door } as const
}

export function compileStudyWallTransition(kit: StudyRoomKit, window: WindowReference, read = readDoorReveal) {
  const doorReference = doorComparison(kit, read)
  const door = doorReference.door
  const secondWindow = kit.opening.fixedControls.find(item => item.box[0] >= kit.opening.box[2])
  if (!secondWindow) throw new TypeError('Missing the bound second Study south window')
  const depthMm = kit.wall.referenceDepthMm
  const { coreFaceYMm, ceilingZMm } = window.wallDatum
  const unchangedRoomFaceYMm = coreFaceYMm + depthMm
  if (unchangedRoomFaceYMm !== kit.bands[0][1]) throw new TypeError('The OAS and IAS Study south face datums disagree')
  const firstJambX = kit.opening.box[2]
  const secondJambX = secondWindow.box[0]
  const stopWidthMm = 50
  const module: Box = [firstJambX + 75, 1280, firstJambX + 525, 1730]
  const rails = { zMm: 1700, hardLandXMm: [firstJambX + 100, firstJambX + 500] }
  const jambStops = [[firstJambX, firstJambX + stopWidthMm], [secondJambX - stopWidthMm, secondJambX]] as const
  const lap = [jambStops[0][1] - 30, jambStops[0][1]]
  const grille = kit.grilleKeepOut.box
  const verticalReleaseMm = 10
  const release: Box = [module[0], module[1], module[2], module[3] + verticalReleaseMm]
  const up200: Box = [release[0], release[1] + 200, release[2], release[3] + 200]
  const overlapsJambStop = module[0] < jambStops[0][1] || module[2] > jambStops[1][0]
  const overlapsGrille = intersects(release, grille)
  const dimensions = Object.values(fixed).concat(Object.values(moving))
  const stackUm = dimensions.reduce((sum, thicknessUm) => sum + thicknessUm, 0)
  const datumUm = depthMm * 1000
  const maximumStack = gauge(datumUm, stackUm, fixed.gaugedFixedPlaneCorrection)
  const minimumBoardStack = gauge(datumUm, stackUm - 1000, fixed.gaugedFixedPlaneCorrection)
  const originalHalfHead = kit.opening.evidence.state === 'native-comparison-only' && window.release.state === 'native-half-head-only'
    ? window.release : null
  const diagnostics = [
    ...(overlapsJambStop ? [{ code: 'IAS_STUDY_WALL_MODULE_INTERSECTS_JAMB_STOP', objectIds: [kit.wall.id, kit.opening.id, secondWindow.id] }] : []),
    ...(overlapsGrille ? [{ code: 'IAS_STUDY_WALL_RELEASE_INTERSECTS_G1', objectIds: [kit.wall.id, kit.grilleKeepOut.id] }] : []),
    ...(!maximumStack.admitted || !minimumBoardStack.admitted
      ? [{ code: 'IAS_STUDY_WALL_PACK_RANGE_UNSUPPORTED', objectIds: [kit.wall.id] }] : []),
    ...(!originalHalfHead ? [{ code: 'IAS_STUDY_WALL_WINDOW_WITHDRAWAL_STALE', objectIds: [kit.opening.id] }] : []),
    ...(doorReference.code ? [{ code: doorReference.code, objectIds: [kit.door.id] }] : []),
  ]
  const status = overlapsJambStop || overlapsGrille || !maximumStack.admitted || !minimumBoardStack.admitted
    ? 'GEOMETRY_REJECTED' : door ? 'DEVELOPMENT_COMPARISON' : 'REFERENCE_WITHHELD'
  const inputs = { [window.receipt.path]: window.receipt.sha256, ...(door ? { [doorRevealPath]: doorRevealSha256 } : {}) }
  const field = {
    moduleXZMm: module, rails, jambStopsXMm: jambStops, fixedLapXMm: lap, grilleXZMm: grille,
    unchangedRoomFaceYMm, coreFaceYMm, verticalReleaseMm, minimumVerticalReserveToG1Mm: grille[1] - release[3],
    translatedUp200MmIntersectsG1: intersects(up200, grille), ceilingZMm, cornicePocketMm: 30, cornicePocketAfterSettingMm: 25,
    retainedHalfHeadInwardDrawMm: originalHalfHead?.inwardStrokeMm ?? null,
    retainedHalfHeadPocketReserveMm: originalHalfHead?.pocketReserveMm ?? null,
    doorFinishYMm: door?.finishedWallYmm[0] ?? null, doorHistoricBodyMarginMm: kit.wall.historicDoorBodyReserveMm,
    retainedSkirtingEndPiecesXMm: door?.trimEndPieceXmm ?? null, retainedSkirtingFirstDrawMm: door?.releaseSouthMm ?? null,
  }
  const fitUm = {
    fixed, moving, stackUm, datumUm, allowanceBeforeDryPackUm: datumUm - stackUm,
    stepUm, measurementAndSetUm, maximumHardPackUm, maximumStack, minimumBoardStack,
    uncorrectableSubstrate: gauge(datumUm, stackUm, 700),
    inadequateStackForPack: gauge(datumUm, stackUm - 1100, fixed.gaugedFixedPlaneCorrection),
    proudStack: gauge(datumUm, stackUm + 550, fixed.gaugedFixedPlaneCorrection),
  }
  const panelKg = 10
  const downwardN = panelKg * 9.81
  return {
    schema: 'ias-crafted-study-wall-transition/1', status, inputs,
    source: {
      kitCaseDigest: kit.caseDigest, binding: kit.source.bindingDigest,
      transitionCaseDigest: sha256SemanticFingerprint({ inputs, field, fitUm, panelKg, wall: kit.wall.id, opening: kit.opening.id }),
      wallId: kit.wall.id, openingId: kit.opening.id, hostId: kit.opening.hostId, fixedOpeningId: secondWindow.id,
      grilleId: kit.grilleKeepOut.id, doorId: kit.door.id,
    },
    field, fitUm,
    mechanics: {
      panelKg, downwardN, equalTwoLandN: downwardN / rails.hardLandXMm.length, oneLandLossRedistributionN: downwardN,
      momentNmAtMaximumOffset: downwardN * depthMm / 1000,
      gaugeRequiredAtBothRailsAndAcrossFace: true, anchorsBehindWallSideRail: true, boardOrAirPlaneReceivesRailLoad: false,
    },
    diagnostics,
    hold: 'Dimensional and load-destination screen only. Actual substrate, anchor and stop, sealed penetration and lap, head/foot joins, air/leakage testing, product constituents and complete dry wall performance remain open. Wet returns and skirting control stay independent.',
  } as const
}
