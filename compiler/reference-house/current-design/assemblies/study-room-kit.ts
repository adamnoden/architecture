import { admitStudyOakComposition, compileStudyOakComposition, type StudyOakComposition } from './study-oak-composition.js'
import { compileStudyStructuralRenewal } from './study-structural-renewal.js'
import { sha256SemanticFingerprint } from '../../../core/identity.js'
import { createPlanPaperProjection } from '../../../publication-drawing/projection.js'
import type { DrawingPrimitiveV2, DrawingSceneV2 } from '../../../publication-drawing-v2/model.js'
import { applyDesignEdit, beginDesignEdit, editBase, type EditOperation } from '../edit.js'
import { readBoundOccupiedServices } from '../occupied-services.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { compileRenewableOpenings } from './renewable-openings.js'
import { compileStudyFurnitureMotion, type ExtendedFirstRestWitness, type FirstRestWitness } from './study-furniture-motion.js'
import { compileResolvedStudyAssembly } from './study-floor.js'
import { compileStudyGroundSupport } from './study-ground-support.js'
import { compileResolvedStudyLinings, layStudySouthPanelStock } from './study-linings.js'
import { compileStudyWallTransition } from './study-wall-transition.js'
import { admitStudyOrdinaryHandlingPlan, studyOrdinaryPlanAppliesToParts, type StudyOrdinaryHandlingPlan } from './study-ordinary-handling.js'
import { compileStudyInstalledInlet } from './study-installed-inlet.js'
import { compileStudyRoomAssembly } from './study-room-assembly.js'
import { deriveStudyStructuralContext, type NativeSWGeometry, type StudyStructuralContext } from './study-structural-context.js'
import { clipStudyStructuralFloor, type StructuralPart } from './study-structural-floor.js'

type FloorAssembly = ReturnType<typeof compileResolvedStudyAssembly>
type Box = readonly [number, number, number, number]
type Pair = readonly [number, number]
type BcrFurnitureAccess = ReturnType<typeof compileRenewableOpenings>['window']['furnitureAccess']
type OpeningCase = { readonly id: string; readonly hostId: string; readonly widthMm?: number } & (
  { readonly occupiedCentreMm: number; readonly nominalCentreMm?: never }
  | { readonly nominalCentreMm: number; readonly occupiedCentreMm?: never }
)
type Case = {
  readonly schema: 'ias-study-room-kit-case/1'
  readonly units: 'mm'
  readonly pitchMm: number
  readonly wearingFace: 'oak' | 'stone-steel'
  readonly oakComposition?: StudyOakComposition
  readonly finishDepthMm?: 15 | 20
  readonly groundDeckLevelLossMm?: number
  readonly firstRestBoardSizeMm?: Pair
  readonly ordinaryHandling?: StudyOrdinaryHandlingPlan
  readonly frameFootClearanceMm?: 5
  readonly floorBorderMinimumMm?: 60 | 150
  readonly installedServices?: 'retained-plan-projection' | 'wall-hung-candidate'
  readonly floorWorkerTopMm?: number
  readonly floorPosture?: 'retained-cylinder' | 'kneeling-candidate'
  readonly wallPanelWidthMm?: 420 | 450
  readonly wallFace?: 'oak' | 'porcelain-steel'
  readonly wallReleaseMm?: number
  readonly opening?: OpeningCase
}

export function readStudyRoomKitReferenceCase(): Case {
  return { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak' }
}

const pickupBox: Box = [3800, 500, 4100, 800]
const firstRestBox: Box = [4100, 500, 4400, 800]
const directRelease = { bodyRadiusMm: 300, bodyToPanelMm: 35, bodySettingMm: 5, maximumReachMm: 600, gripZ: 180, shoulderZ: 360 }

function record(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === 'object' && !Array.isArray(input)
}

function caseInput(input: unknown): Case {
  if (!record(input) || Object.keys(input).some(key => !['schema', 'units', 'pitchMm', 'wearingFace', 'finishDepthMm', 'groundDeckLevelLossMm', 'firstRestBoardSizeMm', 'ordinaryHandling', 'frameFootClearanceMm', 'floorBorderMinimumMm', 'installedServices', 'floorWorkerTopMm', 'floorPosture', 'wallPanelWidthMm', 'wallFace', 'wallReleaseMm', 'opening', 'oakComposition'].includes(key))
    || input.schema !== 'ias-study-room-kit-case/1' || input.units !== 'mm'
    || typeof input.pitchMm !== 'number' || !Number.isFinite(input.pitchMm)
    || (input.finishDepthMm !== undefined && input.finishDepthMm !== 15 && input.finishDepthMm !== 20)
    || (input.groundDeckLevelLossMm !== undefined && (typeof input.groundDeckLevelLossMm !== 'number'
      || !Number.isFinite(input.groundDeckLevelLossMm) || input.groundDeckLevelLossMm < 0))
    || (input.frameFootClearanceMm !== undefined && input.frameFootClearanceMm !== 5)
    || (input.floorBorderMinimumMm !== undefined && input.floorBorderMinimumMm !== 60 && input.floorBorderMinimumMm !== 150)
    || (input.installedServices !== undefined && input.installedServices !== 'retained-plan-projection' && input.installedServices !== 'wall-hung-candidate')
    || (input.floorPosture !== undefined && input.floorPosture !== 'retained-cylinder' && input.floorPosture !== 'kneeling-candidate')
    || (input.floorWorkerTopMm !== undefined && (typeof input.floorWorkerTopMm !== 'number' || !Number.isFinite(input.floorWorkerTopMm) || input.floorWorkerTopMm < 900 || input.floorWorkerTopMm > 2000))
    || (input.wallPanelWidthMm !== undefined && input.wallPanelWidthMm !== 420 && input.wallPanelWidthMm !== 450)
    || (input.wallFace !== undefined && input.wallFace !== 'oak' && input.wallFace !== 'porcelain-steel')
    || (input.wallReleaseMm !== undefined && (typeof input.wallReleaseMm !== 'number' || !Number.isFinite(input.wallReleaseMm) || input.wallReleaseMm <= 0))
    || (input.wearingFace !== 'oak' && input.wearingFace !== 'stone-steel')) {
    throw new TypeError('INVALID_STUDY_ROOM_KIT_CASE')
  }
  const size = input.firstRestBoardSizeMm
  if (size !== undefined && (!Array.isArray(size) || size.length !== 2 || [size[0], size[1]].some(
    value => typeof value !== 'number' || !Number.isFinite(value) || value <= 0,
  ))) throw new TypeError('INVALID_STUDY_FIRST_REST_BOARD_SIZE')
  const common: Case = { schema: input.schema, units: input.units, pitchMm: input.pitchMm, wearingFace: input.wearingFace,
    ...(input.finishDepthMm === undefined ? {} : { finishDepthMm: input.finishDepthMm }),
    ...(input.groundDeckLevelLossMm === undefined ? {} : { groundDeckLevelLossMm: input.groundDeckLevelLossMm }),
    ...(size === undefined ? {} : { firstRestBoardSizeMm: [size[0], size[1]] as const }),
    ...(input.oakComposition === undefined ? {} : { oakComposition: admitStudyOakComposition(input.oakComposition) }),
    ...(input.ordinaryHandling === undefined ? {} : { ordinaryHandling: admitStudyOrdinaryHandlingPlan(input.ordinaryHandling) }),
    ...(input.frameFootClearanceMm === undefined ? {} : { frameFootClearanceMm: input.frameFootClearanceMm }),
    ...(input.floorBorderMinimumMm === undefined ? {} : { floorBorderMinimumMm: input.floorBorderMinimumMm }),
    ...(input.installedServices === undefined ? {} : { installedServices: input.installedServices }),
    ...(input.floorWorkerTopMm === undefined ? {} : { floorWorkerTopMm: input.floorWorkerTopMm }),
    ...(input.floorPosture === undefined ? {} : { floorPosture: input.floorPosture }),
    ...(input.wallPanelWidthMm === undefined ? {} : { wallPanelWidthMm: input.wallPanelWidthMm }),
    ...(input.wallFace === undefined ? {} : { wallFace: input.wallFace }),
    ...(input.wallReleaseMm === undefined ? {} : { wallReleaseMm: input.wallReleaseMm }) } as const
  if (input.opening === undefined) return common
  const opening = input.opening
  const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && !Object.is(value, -0)
  if (!record(opening) || Object.keys(opening).some(key => !['id', 'hostId', 'occupiedCentreMm', 'nominalCentreMm', 'widthMm'].includes(key))
    || typeof opening.id !== 'string' || typeof opening.hostId !== 'string'
    || Object.hasOwn(opening, 'occupiedCentreMm') === Object.hasOwn(opening, 'nominalCentreMm')
    || (Object.hasOwn(opening, 'widthMm') && (!finite(opening.widthMm) || opening.widthMm <= 0))) {
    throw new TypeError('INVALID_STUDY_ROOM_KIT_OPENING')
  }
  const reference = { id: opening.id, hostId: opening.hostId, ...(finite(opening.widthMm) ? { widthMm: opening.widthMm } : {}) }
  if (finite(opening.occupiedCentreMm)) return { ...common, opening: { ...reference, occupiedCentreMm: opening.occupiedCentreMm } }
  if (finite(opening.nominalCentreMm)) return { ...common, opening: { ...reference, nominalCentreMm: opening.nominalCentreMm } }
  throw new TypeError('INVALID_STUDY_ROOM_KIT_OPENING')
}

function setout(from: number, to: number, origin: number, pitch: number, minimumBorderMm: number) {
  const cuts = [from]
  for (let cut = origin + Math.floor((from - origin) / pitch + 1) * pitch; cut < to; cut += pitch) cuts.push(cut)
  cuts.push(to)
  // A short edge strip and the stock piece beside it become two deliberately sized border parts.
  if (cuts.length > 2 && cuts[1] - from < minimumBorderMm) cuts[1] = (from + cuts[2]) / 2
  const last = cuts.length - 1
  if (last > 1 && to - cuts[last - 1] < minimumBorderMm) cuts[last - 1] = (to + cuts[last - 2]) / 2
  return cuts.slice(1).map((end, index) => [cuts[index], end] as const)
}

function intersects([x0, y0, x1, y1]: Box, [a0, b0, a1, b1]: Box) {
  return x0 < a1 && a0 < x1 && y0 < b1 && b0 < y1
}

const keyCentresMm = 100
const keyEndMarginMm = 20
const settingMm = 5
const minimumKeyedFaceMm = keyCentresMm + 2 * keyEndMarginMm
const area = ([x0, y0, x1, y1]: Box) => (x1 - x0) * (y1 - y0)
const sameBox = (a: Box, b: Box) => a.every((value, index) => value === b[index])

function gripGeometry([x0, y0, x1, y1]: Box) {
  const x = (x0 + x1) / 2
  const y = (y0 + y1) / 2
  const half = keyCentresMm / 2
  const centres = x1 - x0 > y1 - y0
    ? [[x - half, y], [x + half, y]] as const
    : [[x, y - half], [x, y + half]] as const
  return { centres, endMarginMm: (Math.max(x1 - x0, y1 - y0) - keyCentresMm) / 2 }
}

function partSetout(assembly: FloorAssembly, minimumBorderMm: number, structuralBorderDevelopment?: StudyStructuralContext) {
  const { grid, source, section, schedule } = assembly
  const inset = section.jointMm / 2
  const massPerSquareMm = schedule.completeTileWearFaceMassKg / (schedule.clearTileSideMm ** 2)
  const faceOf = ([x0, y0, x1, y1]: Box): Box => [x0 + inset, y0 + inset, x1 - inset, y1 - inset]
  const makePart = (box: Box, band: number) => {
    const [left, bottom, right, top] = box
    const [x0, y0, x1, y1] = grid.bands[band]
    const face = faceOf(box)
    const sizeMm = [face[2] - face[0], face[3] - face[1]] as const
    const onEdge = left === x0 || right === x1 || (bottom === y0 && band === 0)
      || (top === y1 && (!grid.bands[band + 1] || right > grid.bands[band + 1][2]))
    const cut = right - left !== grid.pitchMm || top - bottom !== grid.pitchMm
    return {
      id: `${source.roomId}/room-kit/floor/${left}/${bottom}`, band, box, face, sizeMm,
      role: cut || onEdge ? 'border' as const : 'field' as const,
      wearFaceKg: sizeMm[0] * sizeMm[1] * massPerSquareMm,
      occupied: grid.occupied.filter(([, item]) => intersects(box, item)).map(([id]) => id),
      grip: Math.max(...sizeMm) >= minimumKeyedFaceMm && Math.min(...sizeMm) >= 40 ? gripGeometry(face) : null,
    }
  }
  const original = grid.bands.flatMap(([x0, y0, x1, y1], band) =>
    setout(x0, x1, grid.origin[0], grid.pitchMm, minimumBorderMm).flatMap(([left, right]) =>
      setout(y0, y1, grid.origin[1], grid.pitchMm, minimumBorderMm).map(([bottom, top]) => makePart([left, bottom, right, top], band))))
  const withheld = (code: string) => ({ parts: original, emitterPlinth: { state: 'withheld', code } as const })
  if (grid.pitchMm !== 300) return withheld('TRIAL_EMITTER_BORDER_REQUIRES_300_MM_STOCK')
  const emitterId = 'service-emitter-study-W'
  const emitter = grid.occupied.find(([id]) => id === emitterId)?.[1]
  if (!emitter) return withheld('MISSING_BOUND_STUDY_EMITTER')
  const [west, emitterSouth, emitterEast, emitterNorth] = emitter
  const setbacks = { south: structuralBorderDevelopment ? emitterSouth - structuralBorderDevelopment.finishedToeXYMm[1] : 4, east: 5, north: 5 }
  const south = emitterSouth - setbacks.south
  const east = emitterEast + setbacks.east
  const north = emitterNorth + setbacks.north
  const box: Box = [west, south, east, north]
  const affected = original.filter(part => intersects(part.box, box))
  const band = affected[0]?.band
  if (band === undefined || affected.some(part => part.band !== band) || west !== grid.bands[band][0]) {
    return withheld('TRIAL_EMITTER_NO_LONGER_IN_ONE_WALL_BAND')
  }
  const low = Math.min(...affected.map(part => part.box[1]))
  const high = Math.max(...affected.map(part => part.box[3]))
  const edge = Math.max(...affected.map(part => part.box[2]))
  const baselineArea = affected.reduce((sum, part) => sum + area(part.box), 0)
  if (baselineArea !== area([west, low, edge, high]) || !(low < south && north < high && east < edge)) {
    return withheld('TRIAL_EMITTER_CUT_FIELD_CHANGED')
  }
  const sideCuts = [...new Set(affected.flatMap(part => [part.box[1], part.box[3]]))]
    .filter(y => y > south && y < north).sort((a, b) => a - b)
  const borders = [south, ...sideCuts, north]
  const xCuts = [...new Set(affected.map(part => part.box[0]))].sort((a, b) => a - b)
  const ends = [...xCuts, edge]
  const additions = [
    ...ends.slice(1).flatMap((x, index) => [
      makePart([ends[index], low, x, south], band),
      makePart([ends[index], north, x, high], band),
    ]),
    ...borders.slice(1).map((y, index) => makePart([east, borders[index], edge, y], band)),
  ]
  const retained = original.filter(part => !affected.includes(part))
  const corner = retained.find(part => part.band === 0 && part.box[0] === grid.bands[0][0]
    && part.box[1] === grid.bands[0][1] && part.grip === null)
  if (corner) {
    const next = retained.find(part => part.band === 0 && part.box[0] === corner.box[2]
      && part.box[1] === corner.box[1] && part.box[3] === corner.box[3])
    if (!next) return withheld('TRIAL_CORNER_CANNOT_BE_MERGED')
    retained.splice(retained.indexOf(corner), 1, makePart([corner.box[0], corner.box[1], next.box[2], next.box[3]], 0))
    retained.splice(retained.indexOf(next), 1)
  }
  const parts = [...retained, ...additions]
  if (parts.some(part => intersects(part.box, emitter)) || (!structuralBorderDevelopment && parts.some(part => part.grip === null))) {
    return withheld('TRIAL_EMITTER_OR_GRIP_RESERVE_FAILED')
  }
  return {
    parts,
    emitterPlinth: {
      state: 'geometry-screen-only', id: `${source.roomId}/room-kit/floor/emitter-plinth`, emitterId,
      box, face: [west, south + inset, east - inset, north - inset] as Box, areaMm2: area(box), setbacks, smallestAdjacentFaceGapMm: Math.min(...Object.values(setbacks)) + inset,
      support: 'independent bearing to continuous deck; no radiator support on removable finishes',
    } as const,
  }
}

function notchFrameFeet(layout: Omit<ReturnType<typeof partSetout>, 'parts'> & { readonly parts: readonly StructuralPart<ReturnType<typeof partSetout>['parts'][number]>[] }, frameFootprints: readonly Box[], clearanceMm: number | undefined) {
  const subtract = (box: Box, reserve: Box): Box[] => {
    const [x0, y0, x1, y1] = box
    const left = Math.max(x0, reserve[0]), right = Math.min(x1, reserve[2])
    const bottom = Math.max(y0, reserve[1]), top = Math.min(y1, reserve[3])
    if (left >= right || bottom >= top) return [box]
    const pieces: Box[] = [[x0, y0, left, y1], [right, y0, x1, y1], [left, y0, right, bottom], [left, top, right, y1]]
    return pieces.filter(piece => piece[0] < piece[2] && piece[1] < piece[3])
  }
  return { ...layout, parts: layout.parts.map(part => {
    const initialFaces = part.structuralFacePieces ?? [part.face], initialStock = part.structuralStockPieces ?? [part.box]
    if (clearanceMm === undefined) return { ...part, facePieces: initialFaces, frameNotches: [] as Box[], stockAreaMm2: initialStock.reduce((sum, box) => sum + area(box), 0) }
    const frameNotches = frameFootprints.map(([x, y, width, depth]): Box => [x - clearanceMm, y - clearanceMm, x + width + clearanceMm, y + depth + clearanceMm])
      .filter(footprint => intersects(part.box, footprint))
      .map(([x0, y0, x1, y1]): Box => [x0, y0, Math.max(x1, part.box[2]), y1])
    const facePieces = frameNotches.reduce<Box[]>((pieces, footprint) => pieces.flatMap(piece => subtract(piece, footprint)), [...initialFaces])
    const stockPieces = frameNotches.reduce<Box[]>((pieces, footprint) => pieces.flatMap(piece => subtract(piece, footprint)), [...initialStock])
    if (part.grip?.centres.some(([x, y]) => !facePieces.some(box => x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3]))) {
      throw new RangeError('STUDY_FRAME_NOTCH_INTERSECTS_PICKUP_KEY')
    }
    return { ...part, facePieces, frameNotches, stockAreaMm2: stockPieces.reduce((sum, piece) => sum + area(piece), 0),
      wearFaceKg: part.wearFaceKg * facePieces.reduce((sum, piece) => sum + area(piece), 0) / initialFaces.reduce((sum, piece) => sum + area(piece), 0) }
  }) }
}

function handlingScreen(assembly: FloorAssembly, layout: ReturnType<typeof notchFrameFeet>, access: BcrFurnitureAccess) {
  const { parts, emitterPlinth } = layout
  if (emitterPlinth.state === 'withheld') return { state: 'withheld', code: emitterPlinth.code } as const
  const occupied = new Map(assembly.grid.occupied)
  const desk = occupied.get('study-desk')
  const chair = occupied.get('study-chair')
  if (!desk || !chair) return { state: 'withheld', code: 'MISSING_BOUND_STUDY_FURNITURE' } as const
  const toBox = ([x, y, width, depth]: Box): Box => [x, y, x + width, y + depth]
  if (!sameBox(desk, toBox(access.deskTranslation.start)) || !sameBox(chair, toBox(access.chairTranslation.start))) {
    return { state: 'withheld', code: 'TRIAL_BCR_FURNITURE_MISMATCH' } as const
  }
  const parkedChair = toBox(access.turnedChairReservation)
  const deskParts = parts.filter(part => intersects(part.box, desk))
  const deskShiftMm = Math.max(0, ...deskParts.map(part => part.box[3] - desk[1]))
  const parkedDesk: Box = [desk[0], desk[1] + deskShiftMm, desk[2], desk[3] + deskShiftMm]
  const furnitureCovered = parts.filter(part => intersects(part.box, desk) || intersects(part.box, chair))
  const unexposedParts = (first: readonly Box[], second: readonly Box[]) =>
    furnitureCovered.filter(({ box }) =>
      first.some(obstacle => intersects(box, obstacle)) && second.some(obstacle => intersects(box, obstacle)))
  const stageOne = [desk, parkedChair]
  const coveredInBothStages = unexposedParts(stageOne, [parkedDesk, parkedChair])
  const bcrDesk = toBox(access.deskTranslation.end)
  const bcrChair = toBox(access.chairTranslation.end)
  const bcrDeskShiftMm = bcrDesk[1] - desk[1]
  const bcrUnexposed = unexposedParts([desk, bcrChair], [bcrDesk, bcrChair])
  const turnedChairAtBcrDeskShift = unexposedParts(stageOne, [bcrDesk, parkedChair])
  const inBand = (box: Box) => assembly.grid.bands.some(([a0, b0, a1, b1]) =>
    box[0] >= a0 && box[1] >= b0 && box[2] <= a1 && box[3] <= b1)
  if (![parkedChair, parkedDesk].every(inBand) || intersects(parkedDesk, parkedChair)
    || [parkedChair, parkedDesk].some(box => intersects(box, emitterPlinth.box))) {
    return { state: 'withheld', code: 'TRIAL_FURNITURE_PARKING_OUTSIDE_CLEAR_FIELD' } as const
  }
  const east = emitterPlinth.box[2]
  const pickup = parts.find(part => sameBox(part.box, [east, 2000, 800, 2300]))
  const rest = parts.find(part => sameBox(part.box, [east, 1700, 800, 2000]))
  if (!pickup?.grip || !rest) return { state: 'withheld', code: 'TRIAL_EMITTER_EDGE_PICKUP_CHANGED' } as const
  const workerSweep: Box = [835, 1550, 1435, 2450]
  const panelSweep: Box = [east, rest.box[1], pickup.box[2], pickup.box[3]]
  const firstRestBoard: Box = [635, 1685, 800, 2015]
  const padCentres = [[670, 1775], [765, 1775], [670, 1925], [765, 1925]] as const
  const padWidthMm = 25
  const padHalf = padWidthMm / 2
  const padsClear = padCentres.every(([x, y]) =>
    x - padHalf >= rest.face[0] && x + padHalf <= rest.face[2]
    && y - padHalf >= rest.face[1] && y + padHalf <= rest.face[3])
  const edgeReleaseClear = padsClear && inBand(workerSweep) && inBand(firstRestBoard)
    && !intersects(workerSweep, firstRestBoard) && !intersects(firstRestBoard, emitterPlinth.box)
    && stageOne.every(box => !intersects(box, workerSweep) && !intersects(box, panelSweep))
  const workerStart = [1135, 2150]
  const reachMm = Math.max(...pickup.grip.centres.map(([x, y]) => Math.hypot(workerStart[0] - x, workerStart[1] - y, 180)))
  const packageBoundKg = 6
  const releaseForceN = 30
  const keyProofDemandN = 150
  const restBoardBoundKg = 2
  const worstRestPadN = (packageBoundKg + restBoardBoundKg) * 9.81 * 1.5
  const maxFaceMassKg = Math.max(...parts.map(part => part.wearFaceKg))
  const minimumLongitudinalEndMm = Math.min(...parts.map(part => part.grip?.endMarginMm ?? 0))
  const bands = assembly.grid.bands
  const walls = bands.flatMap(([x0, y0, x1, y1], index): Box[] => {
    const adjacent = bands[index + 1]
    const across = adjacent ? Math.min(x1, adjacent[2]) : x0
    const beyond = adjacent ? Math.max(x1, adjacent[2]) : x1
    return [[x0, y0, x0, y1], [x1, y0, x1, y1], [across, y1, beyond, y1]]
  })
  walls.push([bands[0][0], bands[0][1], bands[0][2], bands[0][1]])
  const closestWallAxisMm = Math.min(...parts.flatMap(part => part.grip?.centres.flatMap(([x, y]) =>
    walls.map(([x0, y0, x1, y1]) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1)))) ?? []))
  const nominalToolRadiusMm = 18
  const toolRadiusLimitMm = closestWallAxisMm - settingMm
  return {
    state: edgeReleaseClear && !coveredInBothStages.length && maxFaceMassKg < packageBoundKg && toolRadiusLimitMm >= nominalToolRadiusMm
      ? 'geometry-and-demand-screen' : 'conflict',
    keyedFace: { centresMm: keyCentresMm, minimumLongitudinalEndMm, closestWallAxisMm,
      nominalToolRadiusMm, toolRadiusLimitMm, femaleEngagementTrialMm: 12,
      flangeDiameterMm: 24, minimumEndLigamentMm: minimumLongitudinalEndMm - 12, maxFaceMassKg,
      packageBoundKg, releaseForceN, characteristicDemandN: packageBoundKg * 2 * 9.81 + releaseForceN, keyProofDemandN,
      timberFlangeDemandMPa: keyProofDemandN / (Math.PI * (12 ** 2 - 6 ** 2)),
      trayJointDemandMPaAt1MmThroat: keyProofDemandN / (Math.PI * 12) },
    parking: { parkedChair, parkedDesk, deskShiftMm, furnitureCovered: furnitureCovered.length,
      unexposedPartIds: coveredInBothStages.map(part => part.id),
      candidateState: 'static-only',
      retainedBcrCase: {
        receipt: access.receipt, deskShiftMm: bcrDeskShiftMm, parkedDesk: bcrDesk, parkedChair: bcrChair,
        unexposedPartIds: bcrUnexposed.map(part => part.id),
        geometryScope: 'BCR reversible furniture swept reservations',
      },
      turnedChairAtBcrDeskShiftUnexposedPartIds: turnedChairAtBcrDeskShift.map(part => part.id),
      deskTravelBeyondBcrMm: Math.max(0, deskShiftMm - bcrDeskShiftMm),
      extendedDeskOverlapWithBcrChairMm: intersects(parkedDesk, bcrChair)
        ? Math.min(parkedDesk[3], bcrChair[3]) - Math.max(parkedDesk[1], bcrChair[1]) : 0,
    },
    emitterEdgeRelease: { pickupId: pickup.id, firstRestId: rest.id, workerSweep, panelSweep,
      firstRestBoard, padCentres, padWidthMm, reachMm, edgeReleaseClear,
      restBoardTopMm: 12, pickupLiftMm: 12 + 6 + assembly.section.finishDepthMm, worstRestPadN, restPadDemandMPa: worstRestPadN / padWidthMm ** 2 },
    held: ['loaded grip and breakaway', 'loaded full-access furniture motion', 'qualified continuous deck and bedding',
      'ferrule pull-out and repeated fits', 'seating, acoustic, slip, movement and material performance'],
  } as const
}

const boardAxes = [0, 1] as const
const boxSize = ([x0, y0, x1, y1]: Box): Pair => [x1 - x0, y1 - y0]
type BoardFitLimit = {
  partId: string
  restPartId: string
  movingFaceSizeMm: Pair
  receivingFaceSizeMm: Pair
  orientationLimits: {
    turnDeg: number
    boardFaceShortfallMm: number[]
    receivingPadShortfallMm: number[]
    originIntervalGapMm: number[]
  }[]
}

function boardOriginsInsideBands(bands: readonly Box[], width: number, depth: number) {
  const origins: Box[] = []
  for (const [index, first] of bands.entries()) {
    let west = first[0]
    let east = first[2]
    for (const [offset, band] of bands.slice(index).entries()) {
      if (offset && bands[index + offset - 1][3] !== band[1]) break
      west = Math.max(west, band[0])
      east = Math.min(east, band[2])
      if (east - west < width) break
      if (band[3] - first[1] >= depth) origins.push([west, first[1], east - width, band[3] - depth])
    }
  }
  return origins
}

function compareFirstRestBoard(
  parts: ReturnType<typeof notchFrameFeet>['parts'],
  handling: ReturnType<typeof handlingScreen>,
  firstRest: NonNullable<ReturnType<typeof compileStudyFurnitureMotion>['firstRest']> | null | undefined,
  trialSize: Pair | undefined,
  floorBands: readonly Box[],
) {
  if (!firstRest || handling.state === 'withheld') return { retained: null, trial: null }
  const { firstRestBoard, padCentres, padWidthMm, worstRestPadN, restPadDemandMPa } = handling.emitterEdgeRelease
  const retainedSize = boxSize(firstRestBoard)
  const centredPads = padCentres.map(([x, y]) => [
    x - firstRestBoard[0] - retainedSize[0] / 2, y - firstRestBoard[1] - retainedSize[1] / 2,
  ] as const)
  const padHalf = padWidthMm / 2
  const padPatternSizeMm = boardAxes.map(axis => 2 * Math.max(...centredPads.map(point => Math.abs(point[axis]))) + padWidthMm)
  const faceByPartId = new Map(parts.map(part => [part.id, part.face]))
  const facePiecesByPartId = new Map(parts.map(part => [part.id, part.facePieces]))
  const comparison = {
    state: 'placement-comparison-only', physicalAcceptance: false, comparedWitnessCount: firstRest.witnessCount,
  } as const
  const held = ['Board placement and clearance to occupant, adjacent finishes and fixed obstructions',
    'Stable board and panel under load, breakaway and grip exchange', 'Qualified deck, finish and bedding under local pad demand'] as const
  const fit = (boardSizeMm: Pair, tryOtherReceivers = false, containInBands = false,
    obstructionMode?: 'installed' | 'local-wall-trim-released') => {
    const [width, depth] = boardSizeMm
    const offsets = centredPads.map(([x, y]) => [x + width / 2, y + depth / 2] as const)
    const orientations = [
      { turnDeg: 0, dimensions: boardSizeMm, offsets },
      { turnDeg: 90, dimensions: [depth, width], offsets: offsets.map(([x, y]) => [depth - y, x] as const) },
    ].map(orientation => ({
      ...orientation,
      minPad: boardAxes.map(axis => Math.min(...orientation.offsets.map(point => point[axis])) - padHalf),
      maxPad: boardAxes.map(axis => Math.max(...orientation.offsets.map(point => point[axis])) + padHalf),
      bandOrigins: containInBands ? boardOriginsInsideBands(floorBands, orientation.dimensions[0], orientation.dimensions[1]) : null,
    }))
    const place = (partId: string, { restPartId, shiftXYMm, stage, worker }: FirstRestWitness) => {
      const moving = faceByPartId.get(partId)!
      const receiving = faceByPartId.get(restPartId)!
      const movingFaceSizeMm = boxSize(moving)
      const receivingFaceSizeMm = boxSize(receiving)
      const orientationLimits = []
      for (const { turnDeg, dimensions, offsets: rotatedOffsets, minPad, maxPad, bandOrigins } of orientations) {
        const lower = boardAxes.map(axis => Math.max(
          moving[axis + 2] + shiftXYMm[axis] - dimensions[axis], receiving[axis] - minPad[axis],
        ))
        const upper = boardAxes.map(axis => Math.min(
          moving[axis] + shiftXYMm[axis], receiving[axis + 2] - maxPad[axis],
        ))
        if (boardAxes.some(axis => lower[axis] > upper[axis])) {
          orientationLimits.push({
            turnDeg,
            boardFaceShortfallMm: boardAxes.map(axis => Math.max(0, movingFaceSizeMm[axis] - dimensions[axis])),
            receivingPadShortfallMm: boardAxes.map(axis => Math.max(0, maxPad[axis] - minPad[axis] - receivingFaceSizeMm[axis])),
            originIntervalGapMm: boardAxes.map(axis => Math.max(0, lower[axis] - upper[axis])),
          })
          continue
        }
        const originRanges = bandOrigins
          ? bandOrigins.map(bounds => ({
            lower: boardAxes.map(axis => Math.max(lower[axis], bounds[axis])),
            upper: boardAxes.map(axis => Math.min(upper[axis], bounds[axis + 2])),
          })).filter(range => boardAxes.every(axis => range.lower[axis] <= range.upper[axis]))
          : [{ lower, upper }]
        const stageObstructions = firstRest.boardPlanObstructions?.find(item => item.stage === stage)?.obstacles
        if (obstructionMode && !stageObstructions) continue
        const obstacles = [...(obstructionMode ? Object.values(stageObstructions!).map(item =>
          obstructionMode === 'local-wall-trim-released' ? item.withoutWallTrimXYXYMm ?? item.boxXYXYMm : item.boxXYXYMm,
        ) : []), ...(worker.lowSupportSweepsXYXYMm ?? [])]
        const origins = originRanges.flatMap(range => {
          const coordinates = boardAxes.map(axis => [...new Set([
            (range.lower[axis] + range.upper[axis]) / 2, range.lower[axis], range.upper[axis],
            ...obstacles.flatMap(box => [box[axis] - dimensions[axis], box[axis + 2]])
              .filter(value => range.lower[axis] <= value && value <= range.upper[axis]),
          ])])
          return coordinates[0].flatMap(x => coordinates[1].map(y => [x, y] as const))
        })
        const origin = origins.find(([x, y]) => !obstacles.some(box => intersects([x, y, x + dimensions[0], y + dimensions[1]], box))
          && rotatedOffsets.every(([u, v]) => {
            const pad: Box = [x + u - padHalf, y + v - padHalf, x + u + padHalf, y + v + padHalf]
            const supportedArea = facePiecesByPartId.get(restPartId)!.reduce((sum, box) => sum +
              Math.max(0, Math.min(pad[2], box[2]) - Math.max(pad[0], box[0]))
              * Math.max(0, Math.min(pad[3], box[3]) - Math.max(pad[1], box[1])), 0)
            return Math.abs(supportedArea - padWidthMm ** 2) < 1e-8
          }))
        if (!origin) continue
        const [x, y] = origin
        return {
          placement: {
            partId, restPartId, turnDeg,
            boardXYXYMm: [x, y, x + dimensions[0], y + dimensions[1]] as Box,
            padCentresXYMm: rotatedOffsets.map(([u, v]) => [x + u, y + v] as const),
          },
        }
      }
      return { limit: { partId, restPartId, movingFaceSizeMm, receivingFaceSizeMm, orientationLimits } }
    }
    const outsideFit: (BoardFitLimit & {
      alternateLimits?: BoardFitLimit[]
      extendedLimits?: BoardFitLimit[]
      isolatingApproachCutXMm?: number[]
    })[] = []
    type Placement = NonNullable<ReturnType<typeof place>['placement']> & {
      alternateWitness?: FirstRestWitness
      extendedWitness?: ExtendedFirstRestWitness
    }
    const placements = firstRest.parts.flatMap<Placement>(result => {
      if (result.state !== 'direct-geometry-witness') return []
      const preferred = place(result.partId, result.witness)
      if (preferred.placement) return [preferred.placement]
      const alternateLimits: BoardFitLimit[] = []
      for (const alternate of (tryOtherReceivers ? result.alternateWitnesses ?? [] : [])) {
        const candidate = place(result.partId, alternate)
        if (candidate.placement) return [{ ...candidate.placement, alternateWitness: alternate }]
        alternateLimits.push(candidate.limit)
      }
      const extendedLimits: BoardFitLimit[] = []
      for (const extended of (tryOtherReceivers ? result.extendedWitnesses ?? [] : [])) {
        const candidate = place(result.partId, extended)
        if (candidate.placement) return [{ ...candidate.placement, extendedWitness: extended }]
        extendedLimits.push(candidate.limit)
      }
      const pickupWestMm = faceByPartId.get(result.partId)![0]
      const isolatingApproachCutXMm = tryOtherReceivers
        ? firstRest.closedApproachCuts?.filter(cut => cut.cutXMm < pickupWestMm).map(cut => cut.cutXMm)
        : undefined
      outsideFit.push({
        ...preferred.limit,
        ...(isolatingApproachCutXMm?.length ? { isolatingApproachCutXMm } : {}),
        ...(alternateLimits.length ? { alternateLimits } : {}),
        ...(extendedLimits.length ? { extendedLimits } : {}),
      })
      return []
    })
    return { placements, outsideFit }
  }
  const { placements, outsideFit } = fit(retainedSize)
  const retained = {
    ...comparison, boardSizeMm: retainedSize, padWidthMm, worstRestPadN, restPadDemandMPa,
    placements, outsideBoardFitPartIds: outsideFit.map(row => row.partId), held,
  }
  if (!trialSize) return { retained, trial: null }
  const trialGeometry = { boardSizeMm: trialSize, padWidthMm, padPatternSizeMm, physicalAcceptance: false } as const
  if (boardAxes.some(axis => trialSize[axis] < padPatternSizeMm[axis])) {
    return { retained, trial: { ...trialGeometry, state: 'withheld', code: 'STUDY_BOARD_CANNOT_CONTAIN_PAD_PATTERN' } as const }
  }
  const planar = fit(trialSize, true)
  const contained = fit(trialSize, true, true)
  const planarByPartId = new Map(planar.placements.map(row => [row.partId, row]))
  const containedIds = new Set(contained.placements.map(row => row.partId))
  const floorBandContainment = {
    state: 'floor-band-comparison-only',
    planarPlacementCount: planar.placements.length,
    selectedBoxInsideCount: planar.placements.filter(({ boardXYXYMm: box }) =>
      boardOriginsInsideBands(floorBands, ...boxSize(box)).some(origin =>
        boardAxes.every(axis => origin[axis] <= box[axis] && box[axis] <= origin[axis + 2]),
      )).length,
    sameReceiverPossibleCount: contained.placements.filter(row => planarByPartId.get(row.partId)?.restPartId === row.restPartId).length,
    containedPlacementCount: contained.placements.length,
    outsidePartIds: planar.placements.filter(row => !containedIds.has(row.partId)).map(row => row.partId),
    reassignedReceivers: contained.placements.flatMap(row => {
      const planarReceiverId = planarByPartId.get(row.partId)?.restPartId
      return planarReceiverId && planarReceiverId !== row.restPartId
        ? [{ partId: row.partId, planarReceiverId, floorBandReceiverId: row.restPartId }]
        : []
    }),
    placements: contained.placements,
  } as const
  const catalogueBoards = [
    { id: 'retained-narrow', sizeMm: retainedSize },
    { id: 'trial', sizeMm: trialSize },
  ] as const
  const catalogueFit = (mode?: 'installed' | 'local-wall-trim-released') => {
    const selected = new Set<string>()
    const placements = catalogueBoards.flatMap(board => fit(board.sizeMm, true, true, mode).placements.flatMap(row => {
      if (selected.has(row.partId)) return []
      selected.add(row.partId)
      const preferred = firstRest.parts.find(item => item.partId === row.partId)
      if (preferred?.state !== 'direct-geometry-witness') throw new Error('Missing native Study board witness')
      const witness = row.extendedWitness ?? row.alternateWitness ?? preferred.witness
      const obstacles = firstRest.boardPlanObstructions?.find(item => item.stage === witness.stage)?.obstacles
      const trimReleases = Object.entries(obstacles ?? {}).flatMap(([id, item]) =>
        item.withoutWallTrimXYXYMm && intersects(row.boardXYXYMm, item.boxXYXYMm)
          && !intersects(row.boardXYXYMm, item.withoutWallTrimXYXYMm) ? [id] : [],
      )
      return [{ ...row, boardId: board.id, stage: witness.stage, shiftXYMm: witness.shiftXYMm, trimReleases }]
    }))
    return {
      placementCount: placements.length,
      boardUseCounts: catalogueBoards.map(board => ({ boardId: board.id, count: placements.filter(row => row.boardId === board.id).length })),
      outsidePartIds: firstRest.parts.filter(row => row.state === 'direct-geometry-witness' && !selected.has(row.partId)).map(row => row.partId),
      placements,
    }
  }
  const installedPlanObstructions = catalogueFit('installed')
  const trimReleased = catalogueFit('local-wall-trim-released')
  const keptByPartId = new Map(installedPlanObstructions.placements.map(row => [row.partId, row]))
  const preferredPlacements = trimReleased.placements.map(row => keptByPartId.get(row.partId) ?? row)
  const boardCatalogue = {
    state: 'geometric-handling-kit-comparison-only', physicalAcceptance: false, boards: catalogueBoards,
    padWidthMm, padPatternSizeMm,
    floorBands: catalogueFit(),
    installedPlanObstructions,
    localWallTrimReleased: {
      ...trimReleased, placements: preferredPlacements,
      boardUseCounts: catalogueBoards.map(board => ({ boardId: board.id,
        count: preferredPlacements.filter(row => row.boardId === board.id).length })),
    },
    held: ['Independent removal of named local trim', 'Board insertion and grip exchange',
      'Complete installed service heights and worker approach', 'Board strength, loaded stability and seating'],
  } as const
  return { retained, trial: {
    ...comparison, ...trialGeometry, extendedTransfer: firstRest.extendedTransfer,
    closedApproachCuts: firstRest.closedApproachCuts, ...planar, floorBandContainment, boardCatalogue, held,
  } }
}

function openingSetout(resolved: CurrentDesignResolution, config: Case) {
  const { window, door } = compileRenewableOpenings(resolved)
  const current = window.opening
  const nominalToOccupiedOffsetMm = current.occupiedCentreMm - current.nominalCentreMm
  const requestedCentre = config.opening?.nominalCentreMm !== undefined
    ? config.opening.nominalCentreMm + nominalToOccupiedOffsetMm : config.opening?.occupiedCentreMm ?? current.occupiedCentreMm
  const requestedWidth = config.opening?.widthMm ?? current.nativeWidthMm
  const moved = requestedCentre !== current.occupiedCentreMm
  const resized = requestedWidth !== current.nativeWidthMm
  const linings = compileResolvedStudyLinings(resolved)
  const southField = linings.wall.southField
  const reserves = southField.windows.map(item => ({ ...item, id: `GROUND/${item.id}` }))
  const source = reserves.find(item => item.id === current.id)
  if (!source) throw new Error('MISSING_BOUND_STUDY_ROOM_KIT_OPENING')
  if (config.opening && (config.opening.id !== current.id || config.opening.hostId !== current.hostId)) {
    throw new RangeError('UNKNOWN_STUDY_ROOM_KIT_HOSTED_OPENING')
  }
  const [x0, z0, x1, z1] = source.box
  if (x1 - x0 !== current.nativeWidthMm || (x0 + x1) / 2 !== current.occupiedCentreMm) {
    throw new Error('The OAS and IAS Study opening reservations disagree')
  }
  const fixedControls = reserves.filter(item => item.id !== current.id)
  let centre = current.occupiedCentreMm
  let width = current.nativeWidthMm
  const relation = moved || resized ? 'changed-candidate' : 'native'
  if (moved || resized) {
    const draft = beginDesignEdit(resolved.design, 'ias-study-room-kit', 'SPECIMEN-IAS-STUDY-ROOM-KIT')
    const reference = { level: 'GROUND', openingId: current.id, hostWallId: current.hostId } as const
    const operations: EditOperation[] = []
    if (moved) operations.push({ ...reference, kind: 'move-opening', centreMm: requestedCentre - nominalToOccupiedOffsetMm })
    if (resized) operations.push({ ...reference, kind: 'resize-opening', widthMm: requestedWidth })
    const edited = applyDesignEdit(draft, { schema: 'current-design-edit/1', units: 'mm', base: editBase(draft), operations }, [])
    if (edited.status === 'rejected') throw new RangeError(`STUDY_ROOM_KIT_MOVE_REJECTED: ${edited.diagnostic.code}`)
    const editedOpening = edited.state.design.storeys.GROUND.openings.find(item => item.id === current.id)
    if (!editedOpening) throw new Error('MISSING_EDITED_STUDY_ROOM_KIT_OPENING')
    centre = editedOpening.centreMm + nominalToOccupiedOffsetMm
    width = editedOpening.widthMm
  }
  const box: Box = [centre - width / 2, z0, centre + width / 2, z1]
  if (box[0] < southField.startXMm || box[2] > southField.startXMm + southField.widthMm
    || fixedControls.some(other => intersects(box, other.box))) {
    throw new RangeError('STUDY_ROOM_KIT_OCCUPIED_OPENING_OUTSIDE_AVAILABLE_HOST')
  }
  const inlet = linings.grille.actualRetainedInlet
  const [grilleX, , grilleZ] = inlet.stationDatumMm
  const trialTrimMm = 25
  const radius = Math.max(inlet.completeOD, inlet.retainedReceiverID) / 2 + trialTrimMm
  const grilleKeepOut = {
    id: linings.grille.id + '/trial-clearance',
    box: [grilleX - radius, grilleZ - radius, grilleX + radius, grilleZ + radius] as Box,
    trialTrimMm,
  }
  if (intersects(box, grilleKeepOut.box)) throw new RangeError('STUDY_ROOM_KIT_OPENING_INTERSECTS_G1_RESERVE')
  const wall = {
    ...linings.wall,
    southField: layStudySouthPanelStock(southField.startXMm, southField.startXMm + southField.widthMm, southField.pitchMm,
      reserves.map(window => window.id === current.id ? { id: window.id, box } : window), [grilleKeepOut.box]),
  }
  const opening = {
    id: current.id, hostId: current.hostId, box, occupiedCentreMm: centre, relation,
    nominalToOccupiedOffsetMm,
    liningSource: linings.source,
    fixedControls, independentDoorControl: door.id,
    release: relation === 'native' ? window.release.state : resized ? 'withheld-for-width-change' : 'withheld-for-position-change',
    dependencies: ['fixed-frame', 'dry-seam', 'jamb-release', 'local-panelling-reveal'],
    evidence: relation === 'native'
      ? { state: 'native-comparison-only', receipt: window.receipt } as const
      : { state: 'stale', code: resized ? 'RESIZED_STUDY_OPENING_FIXED_DETAILS' : 'MOVED_STUDY_OPENING_FIXED_DETAILS' } as const,
  } as const
  return { opening, wall, grille: linings.grille, grilleKeepOut, nativeWindow: window } as const
}

function releaseScreen(assembly: FloorAssembly, parts: ReturnType<typeof partSetout>['parts']) {
  const at = (box: Box) => parts.find(part => sameBox(part.box, box))
  const pickup = at(pickupBox)
  const rest = at(firstRestBox)
  if (!pickup || !rest) return { state: 'withheld', code: 'TRIAL_PICKUP_OR_FIRST_REST_CHANGED' } as const
  const [, south, , north] = assembly.grid.bands[pickup.band]
  const { bodyRadiusMm: radius, bodySettingMm: setting, bodyToPanelMm: gap, gripZ, shoulderZ } = directRelease
  const projection = assembly.section.skirting.projectionMm
  const stanceY = (south + north) / 2
  const startX = pickupBox[0] - radius - gap
  const endX = firstRestBox[0] - radius - gap
  const workerSweep: Box = [startX - radius, stanceY - radius, endX + radius, stanceY + radius]
  const panelSweep: Box = [pickupBox[0], pickupBox[1], firstRestBox[2], firstRestBox[3]]
  const wallMarginMm = (north - south) / 2 - radius - projection - setting
  const blocked = wallMarginMm <= 0 || assembly.grid.occupied.some(([, box]) => intersects(box, workerSweep) || intersects(box, panelSweep))
  const gripX = (pickupBox[0] + pickupBox[2]) / 2
  const gripY = (pickupBox[1] + pickupBox[3]) / 2
  const gripCentres = [gripY - 50, gripY + 50].map(y => [gripX, y, gripZ] as const)
  const reachMm = Math.max(...gripCentres.map(([x, y, z]) => Math.hypot(x - startX, y - stanceY, z - shoulderZ)))
  return {
    state: blocked ? 'conflict' : 'geometry-screen-only', code: 'DIRECT_LIFT_OCCUPIED_PLAN',
    pickupId: pickup.id, firstRestId: rest.id, workerSweep, panelSweep, wallMarginMm, bodyToPanelMm: gap,
    posture: { gripCentres, shoulderZMm: shoulderZ, maximumComparisonReachMm: reachMm },
    outsidePlane: { retainedAdditionalMineralMm: 27, bestWallMarginMm: wallMarginMm - 27 / 2 },
    withheld: ['loaded reach and first rest', 'tool engagement and pull-out', 'support, retention and material admission'],
  } as const
}

function deriveStudyRoomKit(resolved: CurrentDesignResolution, input: unknown, structuralGeometry?: NativeSWGeometry) {
  const request = caseInput(input)
  const nativeAssembly = compileResolvedStudyAssembly(resolved, { pitchMm: request.pitchMm, wearingFace: request.wearingFace, finishDepthMm: request.finishDepthMm })
  const { opening, wall, grille, grilleKeepOut, nativeWindow } = openingSetout(resolved, request)
  const structuralContext = structuralGeometry ? deriveStudyStructuralContext(nativeAssembly.grid.bands, nativeAssembly.grid.occupied, wall.referenceDepthMm, structuralGeometry) : undefined
  // Keep the existing world-coordinate fabrication field. A geometric band
  // decomposition is not permission to retile otherwise unchanged floor faces.
  const assembly = structuralContext ? { ...nativeAssembly,
    source: { ...nativeAssembly.source, structuralConsequenceDigest: structuralContext.digest },
    grid: { ...nativeAssembly.grid, occupied: structuralContext.occupied } } : nativeAssembly
  const { house } = readBoundOccupiedServices(resolved)
  const sourceLayout = partSetout(assembly, request.floorBorderMinimumMm ?? 60, structuralContext)
  const cutLayout = structuralContext ? clipStudyStructuralFloor<ReturnType<typeof partSetout>['parts'][number], ReturnType<typeof partSetout>['emitterPlinth']>(sourceLayout, structuralContext, assembly.section.jointMm) : sourceLayout
  const floorLayout = notchFrameFeet(cutLayout,
    house.model.studyDoorOperation.checkedFramePieces, request.frameFootClearanceMm)
  const { parts, emitterPlinth } = floorLayout
  const ordinaryPlanApplicable = request.ordinaryHandling === undefined || studyOrdinaryPlanAppliesToParts(request.ordinaryHandling, parts.map(part => part.id))
  const installedInlet = compileStudyInstalledInlet(grille.actualRetainedInlet, request.installedServices ?? 'retained-plan-projection', request.floorWorkerTopMm ?? 900, assembly.grid.bands[0][1])
  const coordinatedGrilleKeepOut = installedInlet.state === 'wall-hung-candidate'
    ? { ...grilleKeepOut, box: [Math.min(grilleKeepOut.box[0], installedInlet.wallReserveXZMm[0]),
      Math.min(grilleKeepOut.box[1], installedInlet.wallReserveXZMm[1]), Math.max(grilleKeepOut.box[2], installedInlet.wallReserveXZMm[2]),
      Math.max(grilleKeepOut.box[3], installedInlet.wallReserveXZMm[3])] as Box } : grilleKeepOut
  const inletCoordinatedWall = installedInlet.state === 'wall-hung-candidate' ? { ...wall,
    southField: layStudySouthPanelStock(wall.southField.startXMm, wall.southField.startXMm + wall.southField.widthMm,
      wall.southField.pitchMm, wall.southField.windows, [coordinatedGrilleKeepOut.box]) } : wall
  const coordinatedWall = structuralContext ? { ...inletCoordinatedWall,
    southField: layStudySouthPanelStock(structuralContext.finishedToeXYMm[0], wall.southField.startXMm + wall.southField.widthMm,
      wall.southField.pitchMm, inletCoordinatedWall.southField.windows, [coordinatedGrilleKeepOut.box]) } : inletCoordinatedWall
  if (structuralContext && (opening.box[0] < structuralContext.finishedToeXYMm[0]
    || coordinatedWall.boundRoomOpenings.some(window => window.wall === 'outer-west' && window.centre - window.width / 2 < structuralContext.finishedToeXYMm[1]))) {
    throw new RangeError('STUDY_STRUCTURAL_OPENING_INTERSECTS_PILASTER')
  }
  const release = structuralContext ? { state: 'withheld' as const, code: 'STRUCTURAL_STUDY_RENEWAL_REQUIRES_REPLAY' } : releaseScreen(assembly, parts)
  const handling = structuralContext ? { state: 'withheld' as const, code: 'STRUCTURAL_STUDY_RENEWAL_REQUIRES_REPLAY' } : handlingScreen(assembly, floorLayout, nativeWindow.furnitureAccess)
  const movement = nativeWindow.furnitureAccess
  const { bodyRadiusMm, bodyToPanelMm, bodySettingMm, maximumReachMm, gripZ, shoulderZ } = directRelease
  const firstRest = emitterPlinth.state === 'withheld' || handling.state === 'withheld' ? undefined : {
    parts: parts.map(({ id, box, face, grip, facePieces }) => {
      if (!grip) throw new Error(`Missing Study pickup keys for ${id}`)
      return { id, box, face, keyCentresXYMm: grip.centres, ...(request.frameFootClearanceMm === undefined ? {} : { facePieces }) }
    }),
    bandsXYXYMm: assembly.grid.bands,
    emitterPlinthXYXYMm: emitterPlinth.box,
    bodyRadiusMm, bodyToPanelMm: request.floorPosture === 'kneeling-candidate' ? -40 : bodyToPanelMm,
    ...(request.floorPosture === 'kneeling-candidate' ? { lowWorkerProfile: { schema: 'ias-kneeling-floor-profile/1' as const,
      torsoBottomMm: 180, torsoTopMm: request.floorWorkerTopMm ?? 900, lowContactHeightMm: 180,
      normalRangeMm: [-250, 150] as const, tangentRangesMm: [[-200, -60], [60, 200]] as const, physicalAcceptance: false as const } } : {}),
    bodySettingMm, maximumReachMm, verticalGripDifferenceMm: shoulderZ - gripZ,
    liftMm: handling.emitterEdgeRelease.pickupLiftMm,
    restBoardTopMm: handling.emitterEdgeRelease.restBoardTopMm, finishDepthMm: assembly.section.finishDepthMm,
    ...(installedInlet.state === 'wall-hung-candidate' ? { installedServices: installedInlet } : {}),
    ...(request.ordinaryHandling && ordinaryPlanApplicable ? { ordinaryHandling: request.ordinaryHandling } : {}),
    ...(request.firstRestBoardSizeMm ? { includeAlternateReceivers: true, maximumExtendedTransferMm: 2 * assembly.grid.pitchMm } : {}),
  }
  const furnitureMotion = handling.state === 'withheld' ? null : compileStudyFurnitureMotion(
    movement.receipt.sha256, movement.turnReceiptSha256, handling.parking.parkedDesk, handling.parking.parkedChair, firstRest,
  )
  const board = compareFirstRestBoard(parts, handling, furnitureMotion?.firstRest, request.firstRestBoardSizeMm, assembly.grid.bands)
  const structuralRenewal = structuralContext && request.ordinaryHandling
    ? compileStudyStructuralRenewal(structuralContext,parts,emitterPlinth,request.ordinaryHandling,installedInlet) : null
  // Preserve the authored plan in kit.request; never submit a former part family
  // to the current handling solver or promote its witnesses after a width edit.
  const ordinaryHandling = request.ordinaryHandling ? !ordinaryPlanApplicable ? {
    schema: 'ias-study-ordinary-handling-result/1' as const, state: 'source-withheld' as const, physicalAcceptance: false as const,
    partCount: parts.length, witnessCount: 0, parts: [], diagnostics: [{ code: 'IAS_ORDINARY_RENEWAL_REQUIRES_CURRENT_PART_PLAN', objectIds: parts.map(part => part.id) }],
  } : structuralRenewal?.ordinaryHandling ?? furnitureMotion?.firstRest?.ordinaryHandling ?? {
    schema: 'ias-study-ordinary-handling-result/1' as const, state: 'source-withheld' as const, physicalAcceptance: false as const,
    partCount: parts.length, witnessCount: 0, parts: [], diagnostics: [{ code: 'IAS_ORDINARY_SOURCE_FLOOR_FAMILY_WITHHELD', objectIds: [assembly.source.roomId] }],
  } : null
  const [doorMin, doorMax] = house.model.studyDoorOperation.rough
  const [, doorAxis] = house.model.studyDoorOperation.hinge
  const door = { id: 'HAD/protectedRoute/STUDY', rough: [doorMin, doorMax], axis: doorAxis } as const
  const kit = {
    schema: 'ias-study-room-kit/1', state: 'candidate', units: 'mm', request,
    source: assembly.source, caseDigest: sha256SemanticFingerprint({ request, source: assembly.source, opening }),
    bands: structuralContext?.bands ?? assembly.grid.bands, occupied: assembly.grid.occupied,
    ...(structuralContext ? { structuralConsequence: structuralContext } : {}),
    floor: {
      parts, emitterPlinth, installedInlet, ordinaryHandling, ...(request.oakComposition && request.wearingFace === 'oak' ? { oakComposition:compileStudyOakComposition(request.oakComposition,parts,structuralContext?.bands??assembly.grid.bands,assembly.grid.origin,assembly.grid.pitchMm) } : {}), ...(structuralContext ? { structuralRenewal } : {}), ...(structuralContext && 'structuralFloor' in cutLayout ? { structuralFloor: { ...cutLayout.structuralFloor, ordinaryRenewalRevalidated:structuralRenewal?.status === 'computed-geometry-witnesses' } } : {}), frameFootprints: house.model.studyDoorOperation.checkedFramePieces, jointMm: assembly.section.jointMm, wearingFaceMm: assembly.section.wearFaceMm, beddingMm: assembly.section.beddingTerritoryMm,
      depthUnassignedWithinFinishMm: assembly.section.finishSupportDepthUnresolvedMm, handling, furnitureMotion,
      firstRestBoard: board.retained,
      ...(request.firstRestBoardSizeMm === undefined ? {} : { firstRestBoardTrial: board.trial }),
      groundSupport: compileStudyGroundSupport(resolved, assembly.section, request.groundDeckLevelLossMm ?? 0),
      borderParts: parts.filter(part => part.role === 'border').length, release,
      coverageMm2: parts.reduce((total, part) => total + part.stockAreaMm2, emitterPlinth.state === 'withheld' ? 0 : emitterPlinth.areaMm2),
      heldEvidence: ['permanent deck, bedding and product tests', 'finished-room installation and handling'],
    },
    opening, door, wall: coordinatedWall, grille, grilleKeepOut: coordinatedGrilleKeepOut,
  } as const
  return { kit, nativeWindow }
}

export type StudyRoomKit = ReturnType<typeof deriveStudyRoomKit>['kit']

export function compileStudyRoomKit(resolved: CurrentDesignResolution, input: unknown, structuralGeometry?: NativeSWGeometry) {
  const { kit, nativeWindow } = deriveStudyRoomKit(resolved, input, structuralGeometry)
  const wallTransition = compileStudyWallTransition(kit, nativeWindow)
  return { kit, wallTransition, roomAssembly: compileStudyRoomAssembly(kit, wallTransition) }
}

export function drawStudyRoomKitPlan(kit: StudyRoomKit, view: 'layout' | 'emitter-edge' | 'furniture-access' | 'furniture-motion' = 'layout'): DrawingSceneV2 {
  const x = Math.min(...kit.bands.map(band => band[0])), y = Math.min(...kit.bands.map(band => band[1]))
  const width = Math.max(...kit.bands.map(band => band[2])) - x
  const height = Math.max(...kit.bands.map(band => band[3])) - y
  const scaleDenominator = 25
  const projection = createPlanPaperProjection({ scaleDenominator, modelBounds: { x, y, width, height }, paperOrigin: { x: 12, y: 14 } })
  const rect = (box: Box) => {
    const [x0, y0, x1, y1] = box
    return projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 })
  }
  const { release, handling, furnitureMotion } = kit.floor
  const useParking = view === 'emitter-edge' && handling.state !== 'withheld'
  const bcrParking = view === 'furniture-access' && handling.state !== 'withheld' ? handling.parking.retainedBcrCase : null
  const motion = view === 'furniture-motion' ? furnitureMotion : null
  const showFurniture = Boolean(bcrParking || motion)
  const blockedPartIds = new Set(bcrParking?.unexposedPartIds)
  const parked = motion ? { parkedDesk: motion.candidate.deskParkXYXYMm, parkedChair: motion.candidate.chairParkXYXYMm } : bcrParking
  const centre = ([left, bottom, width, height]: Box) => projection.point(left + width / 2, bottom + height / 2)
  const phases = motion?.phases.flatMap<DrawingPrimitiveV2>(phase => {
    if (phase.type === 'approach') return []
    if (phase.type === 'rotation') {
      const [centreX, centreY] = phase.centreXYMm
      const sides = 64
      const radius = phase.radiusMm / Math.cos(Math.PI / sides)
      const ring = Array.from({ length: sides }, (_, index) => {
        const angle = 2 * Math.PI * index / sides
        return projection.point(centreX + radius * Math.cos(angle), centreY + radius * Math.sin(angle))
      })
      return [{ kind: 'path', id: phase.id, rings: [ring], stroke: 'secondary', dash: 'provisional' }]
    }
    return [{ kind: 'line' as const, id: phase.id, role: 'primary' as const, a: centre(phase.startXYWHMm), b: centre(phase.endXYWHMm) }]
  }) ?? []
  return {
    viewId: motion ? 'ias-study-room-kit-furniture-motion' : bcrParking ? 'ias-study-room-kit-furniture-access' : useParking ? 'ias-study-room-kit-emitter-edge' : 'ias-study-room-kit-plan',
    sourceId: kit.structuralConsequence ? `working-house/Study/${kit.structuralConsequence.digest}` : kit.source.occupiedHouse, scaleDenominator,
    title: motion ? 'Study staged furniture motion' : bcrParking ? 'Study floor access with the BCR furniture route' : useParking ? 'Study emitter-edge renewal and chair parking' : 'Study room-kit layout',
    description: motion ? 'Original and parked furniture, straight centreline movements and the whole turning reservation.'
      : bcrParking ? 'Dashed original furniture, parked furniture outlines and floor parts that remain covered in both stages.'
      : useParking ? 'Candidate emitter-edge pickup and first rest with the chair in its service parking position.'
      : 'Candidate finish field, fabricated borders, rough openings and shown furniture.',
    widthMm: projection.length(width) + 24, heightMm: projection.length(height) + 34,
    primitives: [
      ...(kit.structuralConsequence ? kit.structuralConsequence.source.native.rectanglesXYMm.map((box, index) => ({
        kind: 'rect' as const, id: `STR/SW/concrete/${index}`, ...rect(box), stroke: 'primary' as const, fill: 'context' as const,
        metadata: { role: 'Unselected native SW concrete body', controllingInput: kit.structuralConsequence!.source.controlPath },
      })) : []),
      ...(kit.structuralConsequence ? kit.structuralConsequence.finishReservations.map((box, index) => ({
        kind: 'rect' as const, id: `STR/SW/finish-reservation/${index}`, ...rect(box), stroke: 'secondary' as const, fill: 'none' as const,
        metadata: { role: 'Source-bound pilaster finish reservation' },
      })) : []),
      ...kit.floor.parts.flatMap(part => part.facePieces.map((face, index) => ({
        kind: 'rect' as const, id: index ? part.id + '/shape/' + index : part.id, ...rect(face), stroke: 'secondary' as const,
        fill: blockedPartIds.has(part.id) ? 'context' as const : 'none' as const, dash: part.role === 'border' ? 'datum' as const : 'none' as const,
        metadata: { role: part.role, band: part.band, ...(part.frameNotches.length ? { shapedPartId: part.id } : {}), ...(blockedPartIds.has(part.id) ? { coveredInBothBcrStages: true } : {}) },
      }))),
      ...(kit.floor.emitterPlinth.state === 'withheld' ? [] : [{
        kind: 'rect' as const, id: kit.floor.emitterPlinth.id, ...rect(kit.floor.emitterPlinth.face),
        stroke: 'primary' as const, fill: 'context' as const, metadata: { role: 'fixed emitter plinth' },
      }]),
      ...kit.occupied.map(([id, box]) => ({
        kind: 'rect' as const, id: `occupied:${id}`, ...rect(useParking && id === 'study-chair' ? handling.parking.parkedChair : box),
        stroke: 'profile' as const, fill: (showFurniture || kit.structuralConsequence) && id !== 'service-emitter-study-W' ? 'none' as const : 'context' as const,
        ...(showFurniture && id !== 'service-emitter-study-W' ? { dash: 'provisional' as const } : {}),
      })),
      ...(parked ? [
        { kind: 'rect' as const, id: 'parked:study-desk', ...rect(parked.parkedDesk), stroke: 'profile' as const, fill: 'none' as const },
        { kind: 'rect' as const, id: 'parked:study-chair', ...rect(parked.parkedChair), stroke: 'profile' as const, fill: 'none' as const },
      ] : []),
      ...phases,
      ...[kit.opening, ...kit.opening.fixedControls].map(opening => ({
        kind: 'line' as const, id: opening.id, role: 'profile' as const,
        a: projection.point(opening.box[0], y), b: projection.point(opening.box[2], y),
      })),
      { kind: 'line', id: kit.door.id, role: 'profile', a: projection.point(kit.door.rough[0], kit.door.axis),
        b: projection.point(kit.door.rough[1], kit.door.axis) },
      ...(!showFurniture && !useParking && release.state !== 'withheld' ? [
        { kind: 'rect' as const, id: 'trial-panel-sweep', stroke: 'primary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(release.panelSweep) },
        { kind: 'rect' as const, id: 'trial-worker-sweep', stroke: 'secondary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(release.workerSweep) },
      ] : []),
      ...(!useParking ? [] : [
        { kind: 'rect' as const, id: 'emitter-edge-panel-sweep', stroke: 'primary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(handling.emitterEdgeRelease.panelSweep) },
        { kind: 'rect' as const, id: 'emitter-edge-worker-sweep', stroke: 'secondary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(handling.emitterEdgeRelease.workerSweep) },
      ]),
      ...(kit.structuralConsequence ? [
        { kind: 'text' as const, id: 'working-room-title', x: 12, y: 8, role: 'label' as const,
          value: `SW${kit.structuralConsequence.source.native.widthMm} · actual working Study consequence` },
        { kind: 'text' as const, id: 'working-room-key', x: 12, y: projection.length(height) + 29, role: 'note' as const,
          value: 'Outlines: daily furniture. Grey: SW core, emitter and fixed border. Renewal uses explicit prepared states.' },
      ] : []),
      { kind: 'text', id: 'pitch', x: 12, y: projection.length(height) + 24, role: 'note',
        value: motion ? 'Dashed: starting positions and turning reservation · solid: translation and parking'
          : bcrParking ? `${blockedPartIds.size} parts covered in both BCR stages · ${bcrParking.deskShiftMm} mm desk shift`
          : useParking ? 'Chair parked · 300 mm lift-out transfer south of pickup'
          : `${kit.request.pitchMm} mm pitch · ${kit.floor.parts.length} parts · ${kit.floor.borderParts} border parts` },
    ],
  }
}

export function drawStudyOrdinaryHandling(kit: StudyRoomKit, partId: string): DrawingSceneV2 {
  const proof = kit.floor.ordinaryHandling
  if (!proof || proof.state === 'source-withheld') throw new RangeError('STUDY_ORDINARY_HANDLING_VIEW_WITHHELD')
  const selected = proof.parts.find(part => part.partId === partId)
  const part = kit.floor.parts.find(part => part.id === partId)
  if (!selected || selected.state !== 'joined-geometry-witness' || !part || !selected.boardXYXYMm
    || !selected.workerPathXYMm || !selected.panelPathWaypointDeltasMm) throw new RangeError('STUDY_ORDINARY_HANDLING_VIEW_HAS_NO_WITNESS')
  const x = Math.min(...kit.bands.map(band=>band[0])), y = Math.min(...kit.bands.map(band=>band[1]))
  const width = Math.max(...kit.bands.map(band => band[2])) - x
  const height = Math.max(...kit.bands.map(band => band[3])) - y
  const projection = createPlanPaperProjection({ scaleDenominator: 25, modelBounds: { x, y, width, height }, paperOrigin: { x: 12, y: 14 } })
  const rectangle = ([x0, y0, x1, y1]: Box) => projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 })
  const deltas: readonly Pair[] = [[0, 0], ...selected.panelPathWaypointDeltasMm]
  const shapes = deltas.flatMap((delta, step) => part.facePieces.map((piece, index) => ({
    kind: 'rect' as const, id: `panel-path/${step}/${index}`, ...rectangle([piece[0] + delta[0], piece[1] + delta[1], piece[2] + delta[0], piece[3] + delta[1]]),
    stroke: 'primary' as const, dash: step ? 'provisional' as const : 'none' as const,
  })))
  const people = selected.workerPathXYMm.map(([cx, cy], index) => ({
    kind: 'path' as const, id: `worker/${index}`, stroke: 'secondary' as const, dash: 'datum' as const,
    rings: [Array.from({ length: 64 }, (_, side) => projection.point(cx + 300 * Math.cos(side * Math.PI / 32), cy + 300 * Math.sin(side * Math.PI / 32)))],
  }))
  const panelLabels = deltas.map(([dx, dy], step) => ({
    kind: 'text' as const, id: `panel-step/${step}`, role: 'marker' as const,
    ...projection.point((part.box[0] + part.box[2]) / 2 + dx, (part.box[1] + part.box[3]) / 2 + dy), value: `P${step + 1}`,
  }))
  const workerLabels = selected.workerPathXYMm.map(([cx, cy], step) => ({
    kind: 'text' as const, id: `worker-step/${step}`, role: 'marker' as const,
    ...projection.point(cx, cy), value: `W${step + 1}`,
  }))
  const workerLinks = selected.workerPathXYMm.slice(1).map((point, step) => ({
    kind: 'line' as const, id: `worker-route/${step}`, role: 'secondary' as const, dash: 'provisional' as const,
    a: projection.point(...selected.workerPathXYMm![step]), b: projection.point(...point),
  }))
  const base = drawStudyRoomKitPlan(kit)
  return {
    ...base, heightMm: base.heightMm + 6, sourceId: kit.source.occupiedHouse + '/' + kit.caseDigest, viewId: 'ias-study-ordinary-handling-' + partId.split('/').slice(-2).join('-'),
    title: 'Study ordinary floor renewal',
    description: 'Source-bound moving finish, ordinary work board and 600 mm handler envelopes. Nominal geometric witness; loaded handling and tolerances remain unqualified.',
    primitives: [
      { kind: 'rect', id: 'handling-paper', x: 0, y: 0, width: base.widthMm, height: base.heightMm + 6, fill: 'paper' },
      ...base.primitives.filter(primitive => primitive.id !== 'pitch'),
      { kind: 'rect', id: 'ordinary-work-board', ...rectangle(selected.boardXYXYMm), stroke: 'primary', fill: 'faint' },
      ...shapes, ...people, ...workerLinks, ...panelLabels, ...workerLabels,
      { kind: 'text', id: 'ordinary-handling-title', x: 12, y: 8, role: 'label', value: `Floor renewal: ${partId.split('/').slice(-2).join(' / ')}` },
      ...kit.floor.frameFootprints.map(([a, b, w, d], index) => ({ kind: 'rect' as const, id: `fixed-frame-foot/${index}`,
        ...rectangle([a, b, a + w, b + d]), stroke: 'primary' as const, fill: 'context' as const })),
      { kind: 'text', id: 'ordinary-handling-key', x: 12, y: projection.length(height) + 24, role: 'note',
        value: `Board ${selected.boardId} · ${selected.maximumKeyReachMm?.toFixed(1)} mm key reach · ${selected.bodyToPanelMm?.toFixed(1)} mm body/part` },
      { kind: 'text', id: 'ordinary-handling-legend', x: 12, y: projection.length(height) + 29, role: 'note',
        value: 'P: finish sequence · W: 600 mm handler positions · shaded: ordinary rest board' },
    ],
  }
}
