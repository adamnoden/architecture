import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { StudyOrdinaryHandlingPlan } from './study-ordinary-handling.js'
import type { compileStudyInstalledInlet } from './study-installed-inlet.js'

type Point = readonly [number, number]
type PlanBox = readonly [number, number, number, number]
type Worker = {
  readonly points: readonly Point[]
  readonly minimumClearance: number
  readonly limitingObstacle: string
  readonly lowSupportSweepsXYXYMm?: readonly PlanBox[]
}
type MovingPhase = {
  readonly id: string
  readonly item: 'study-desk' | 'study-chair'
  readonly startXYWHMm: PlanBox
  readonly endXYWHMm: PlanBox
  readonly worker: Worker
  readonly minimumItemClearanceMm: number
  readonly bodyToItemMm: number
  readonly maximumProspectiveReachMm: number
}
type FurniturePhase = { readonly type: 'approach'; readonly id: string; readonly worker: Worker }
  | (MovingPhase & { readonly type: 'translation'; readonly itemSweepXYWHMm: PlanBox })
  | (MovingPhase & { readonly type: 'rotation'; readonly centreXYMm: Point; readonly radiusMm: number; readonly angleDeg: 90 })

type FirstRestPart = { readonly id: string; readonly box: PlanBox; readonly face: PlanBox; readonly keyCentresXYMm: readonly Point[]; readonly facePieces?: readonly PlanBox[] }
export interface FirstRestScreen {
  readonly parts: readonly FirstRestPart[]
  readonly ordinaryHandling?: StudyOrdinaryHandlingPlan
  readonly bandsXYXYMm: readonly PlanBox[]
  readonly emitterPlinthXYXYMm: PlanBox
  readonly bodyRadiusMm: number
  readonly bodyToPanelMm: number
  readonly bodySettingMm: number
  readonly maximumReachMm: number
  readonly verticalGripDifferenceMm: number
  readonly liftMm: number
  readonly finishDepthMm: number
  readonly restBoardTopMm: number
  readonly lowWorkerProfile?: { readonly schema: 'ias-kneeling-floor-profile/1'; readonly torsoBottomMm: number; readonly torsoTopMm: number;
    readonly lowContactHeightMm: number; readonly normalRangeMm: Point; readonly tangentRangesMm: readonly Point[]; readonly physicalAcceptance: false }
  readonly installedServices?: Extract<ReturnType<typeof compileStudyInstalledInlet>, { state: 'wall-hung-candidate' }>
  readonly includeAlternateReceivers?: boolean
  readonly maximumExtendedTransferMm?: number
}

export interface FirstRestWitness {
  readonly stage: string
  readonly restPartId: string
  readonly shiftXYMm: Point
  readonly faceSweepXYXYMm: PlanBox
  readonly worker: Worker
  readonly reachMm: number
}

export interface ExtendedFirstRestWitness extends FirstRestWitness {
  readonly interveningPartId: string
}

type FirstRestOutcome = {
  readonly partId: string
} & (
  | { readonly state: 'direct-geometry-witness'; readonly witness: FirstRestWitness;
      readonly alternateWitnesses?: readonly FirstRestWitness[];
      readonly extendedWitnesses?: readonly ExtendedFirstRestWitness[] }
  | { readonly state: 'panel-sweep-unsupported'; readonly encounteredPlanProjectionIds: readonly string[] }
  | { readonly state: 'no-adjacent-whole-face-rest' | 'worker-stance-or-reach-unsupported' }
)

interface FurnitureMotion {
  readonly firstRest: {
    readonly ordinaryHandling?: {
      readonly schema: 'ias-study-ordinary-handling-result/1'; readonly units: 'mm';
      readonly state: 'joined-geometry-witnesses' | 'partial-geometry-witnesses'; readonly physicalAcceptance: false;
      readonly partCount: number; readonly witnessCount: number;
      readonly parts: readonly { readonly partId: string; readonly state: string; readonly diagnostic?: string;
        readonly stage?: string; readonly boardId?: string; readonly trimReleases?: readonly string[]; readonly boardXYXYMm?: PlanBox;
        readonly panelPathWaypointDeltasMm?: readonly Point[]; readonly workerPathXYMm?: readonly Point[];
        readonly padBearingPartIds?: readonly string[]; readonly maximumKeyReachMm?: number;
        readonly bodyToPanelMm?: number; readonly boardPickupClearanceMm?: number; readonly bodyToBoardClearanceMm?: number;
        readonly staging?: { readonly state: string; readonly arrivalPathXYMm?: readonly Point[]; readonly secondHandlerWithdrawalXYMm?: readonly Point[];
          readonly placement?: { readonly maximumReachMm: number; readonly carriedXYXYMm?: PlanBox }; readonly holdReserveMm?: number } }[]
    }
    readonly schema: 'ias-study-floor-first-rest/1'
    readonly physicalAcceptance: false
    readonly partCount: number
    readonly witnessCount: number
    readonly extendedTransfer?: { readonly maximumTravelMm: number; readonly interveningPartCount: 1 }
    readonly boardPlanObstructions?: readonly {
      readonly stage: string
      readonly obstacles: Readonly<Record<string, {
        readonly boxXYXYMm: PlanBox
        readonly withoutWallTrimXYXYMm?: PlanBox
      }>>
    }[]
    readonly closedApproachCuts?: readonly {
      readonly cutXMm: number
      readonly roomYMm: Point
      readonly settingEnvelopeRadiusMm: number
      readonly blockingIntervals: readonly { readonly obstacleId: string; readonly excludedYMm: Point }[]
    }[]
    readonly transferVertical: {
      readonly initialLiftMm: number; readonly travelTopMm: number
      readonly travelUndersideMm: number; readonly firstRestBoardTopMm: number; readonly undersideReserveMm: number
    }
    readonly parts: readonly FirstRestOutcome[]
    readonly g1Projection: { readonly installedCarrierMinimumZMm: number | null; readonly releasedPackageZMm: Point }
  } | null
  readonly schema: 'ias-study-furniture-native-result/1'
  readonly state: 'geometry-screen-only' | 'geometry-conflict'
  readonly basis: {
    readonly bayReceiptSha256: string
    readonly turnReceiptPath: string
    readonly turnReceiptSha256: string
  }
  readonly candidate: {
    readonly deskParkXYXYMm: PlanBox
    readonly chairParkXYXYMm: PlanBox
  }
  readonly comparisonClearanceMm: number
  readonly phases: readonly FurniturePhase[]
  readonly conflictingPhaseIds: readonly string[]
  readonly reverseUsesSameSweeps: true
  readonly physicalAcceptance: false
  readonly held: readonly string[]
}

const repository = new URL('../../../../', import.meta.url)
const nativePath = 'project/ias/studies/study-furniture-motion.py'
const bcrPath = 'project/bcr/studies/bay-interface-study.py'
const ordinaryPath = 'project/ias/studies/study-floor-handling.py'
const sourceSha256 = (path: string) => createHash('sha256').update(readFileSync(new URL(path, repository))).digest('hex')

export function compileStudyFurnitureMotion(
  bayReceiptSha256: string,
  turnReceiptSha256: string,
  deskParkXYXYMm: PlanBox,
  chairParkXYXYMm: PlanBox,
  firstRest?: FirstRestScreen,
) {
  const source = { [nativePath]: sourceSha256(nativePath), [bcrPath]: sourceSha256(bcrPath), [ordinaryPath]: sourceSha256(ordinaryPath) }
  const result: FurnitureMotion = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(nativePath, repository)), fileURLToPath(repository),
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'ias-study-furniture-native-case/1', bayReceiptSha256, deskParkXYXYMm, chairParkXYXYMm, firstRest }),
  }))
  if (result.schema !== 'ias-study-furniture-native-result/1' || result.basis.bayReceiptSha256 !== bayReceiptSha256
      || result.basis.turnReceiptSha256 !== turnReceiptSha256 || result.physicalAcceptance !== false
      || (firstRest && result.state === 'geometry-screen-only' && (result.firstRest?.partCount !== firstRest.parts.length
          || result.firstRest.physicalAcceptance !== false
          || result.firstRest.parts.some((part, index) => part.partId !== firstRest.parts[index].id)))
      || !result.candidate.deskParkXYXYMm.every((value, index) => value === deskParkXYXYMm[index])
      || !result.candidate.chairParkXYXYMm.every((value, index) => value === chairParkXYXYMm[index])) {
    throw new Error('The Study furniture motion disagrees with its source-bound room case')
  }
  return { ...result, source }
}
