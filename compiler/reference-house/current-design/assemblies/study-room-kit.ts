import { sha256SemanticFingerprint } from '../../../core/identity.js'
import { createPlanPaperProjection } from '../../../publication-drawing/projection.js'
import type { DrawingPrimitiveV2, DrawingSceneV2 } from '../../../publication-drawing-v2/model.js'
import { applyDesignEdit, beginDesignEdit, editBase, type EditOperation } from '../edit.js'
import { readBoundOccupiedServices } from '../occupied-services.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { compileRenewableOpenings } from './renewable-openings.js'
import { compileStudyFurnitureMotion } from './study-furniture-motion.js'
import { compileResolvedStudyAssembly } from './study-floor.js'
import { compileStudyGroundSupport } from './study-ground-support.js'
import { compileResolvedStudyLinings, layStudySouthPanelStock } from './study-linings.js'
import { compileStudyWallTransition } from './study-wall-transition.js'

type FloorAssembly = ReturnType<typeof compileResolvedStudyAssembly>
type Box = readonly [number, number, number, number]
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
  readonly finishDepthMm?: 15 | 20
  readonly groundDeckLevelLossMm?: number
  readonly opening?: OpeningCase
}

const minimumBorderMm = 60
const pickupBox: Box = [3800, 500, 4100, 800]
const firstRestBox: Box = [4100, 500, 4400, 800]
const directRelease = { bodyRadiusMm: 300, bodyToPanelMm: 35, bodySettingMm: 5, maximumReachMm: 600, gripZ: 180, shoulderZ: 360 }

function record(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === 'object' && !Array.isArray(input)
}

function caseInput(input: unknown): Case {
  if (!record(input) || Object.keys(input).some(key => !['schema', 'units', 'pitchMm', 'wearingFace', 'finishDepthMm', 'groundDeckLevelLossMm', 'opening'].includes(key))
    || input.schema !== 'ias-study-room-kit-case/1' || input.units !== 'mm'
    || typeof input.pitchMm !== 'number' || !Number.isFinite(input.pitchMm)
    || (input.finishDepthMm !== undefined && input.finishDepthMm !== 15 && input.finishDepthMm !== 20)
    || (input.groundDeckLevelLossMm !== undefined && (typeof input.groundDeckLevelLossMm !== 'number'
      || !Number.isFinite(input.groundDeckLevelLossMm) || input.groundDeckLevelLossMm < 0))
    || (input.wearingFace !== 'oak' && input.wearingFace !== 'stone-steel')) {
    throw new TypeError('INVALID_STUDY_ROOM_KIT_CASE')
  }
  const common: Case = { schema: input.schema, units: input.units, pitchMm: input.pitchMm, wearingFace: input.wearingFace,
    ...(input.finishDepthMm === undefined ? {} : { finishDepthMm: input.finishDepthMm }),
    ...(input.groundDeckLevelLossMm === undefined ? {} : { groundDeckLevelLossMm: input.groundDeckLevelLossMm }) } as const
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

function setout(from: number, to: number, origin: number, pitch: number) {
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

function partSetout(assembly: FloorAssembly) {
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
    setout(x0, x1, grid.origin[0], grid.pitchMm).flatMap(([left, right]) =>
      setout(y0, y1, grid.origin[1], grid.pitchMm).map(([bottom, top]) => makePart([left, bottom, right, top], band))))
  const withheld = (code: string) => ({ parts: original, emitterPlinth: { state: 'withheld', code } as const })
  if (grid.pitchMm !== 300) return withheld('TRIAL_EMITTER_BORDER_REQUIRES_300_MM_STOCK')
  const emitterId = 'service-emitter-study-W'
  const emitter = grid.occupied.find(([id]) => id === emitterId)?.[1]
  if (!emitter) return withheld('MISSING_BOUND_STUDY_EMITTER')
  const [west, emitterSouth, emitterEast, emitterNorth] = emitter
  const setbacks = { south: 4, east: 5, north: 5 }
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
  if (parts.some(part => part.grip === null || intersects(part.box, emitter))) {
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

function handlingScreen(assembly: FloorAssembly, layout: ReturnType<typeof partSetout>, access: BcrFurnitureAccess) {
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

function deriveStudyRoomKit(resolved: CurrentDesignResolution, input: unknown) {
  const request = caseInput(input)
  const assembly = compileResolvedStudyAssembly(resolved, { pitchMm: request.pitchMm, wearingFace: request.wearingFace, finishDepthMm: request.finishDepthMm })
  const floorLayout = partSetout(assembly)
  const { parts, emitterPlinth } = floorLayout
  const { opening, wall, grille, grilleKeepOut, nativeWindow } = openingSetout(resolved, request)
  const release = releaseScreen(assembly, parts)
  const handling = handlingScreen(assembly, floorLayout, nativeWindow.furnitureAccess)
  const movement = nativeWindow.furnitureAccess
  const { bodyRadiusMm, bodyToPanelMm, bodySettingMm, maximumReachMm, gripZ, shoulderZ } = directRelease
  const firstRest = emitterPlinth.state === 'withheld' || handling.state === 'withheld' ? undefined : {
    parts: parts.map(({ id, box, face, grip }) => {
      if (!grip) throw new Error(`Missing Study pickup keys for ${id}`)
      return { id, box, face, keyCentresXYMm: grip.centres }
    }),
    bandsXYXYMm: assembly.grid.bands,
    emitterPlinthXYXYMm: emitterPlinth.box,
    bodyRadiusMm, bodyToPanelMm, bodySettingMm, maximumReachMm, verticalGripDifferenceMm: shoulderZ - gripZ,
    liftMm: handling.emitterEdgeRelease.pickupLiftMm,
    restBoardTopMm: handling.emitterEdgeRelease.restBoardTopMm, finishDepthMm: assembly.section.finishDepthMm,
  }
  const furnitureMotion = handling.state === 'withheld' ? null : compileStudyFurnitureMotion(
    movement.receipt.sha256, movement.turnReceiptSha256, handling.parking.parkedDesk, handling.parking.parkedChair, firstRest,
  )
  const { house } = readBoundOccupiedServices(resolved)
  const [doorMin, doorMax] = house.model.studyDoorOperation.rough
  const [, doorAxis] = house.model.studyDoorOperation.hinge
  const door = { id: 'HAD/protectedRoute/STUDY', rough: [doorMin, doorMax], axis: doorAxis } as const
  const kit = {
    schema: 'ias-study-room-kit/1', state: 'candidate', units: 'mm', request,
    source: assembly.source, caseDigest: sha256SemanticFingerprint({ request, source: assembly.source, opening }),
    bands: assembly.grid.bands, occupied: assembly.grid.occupied,
    floor: {
      parts, emitterPlinth, jointMm: assembly.section.jointMm, wearingFaceMm: assembly.section.wearFaceMm, beddingMm: assembly.section.beddingTerritoryMm,
      depthUnassignedWithinFinishMm: assembly.section.finishSupportDepthUnresolvedMm, handling, furnitureMotion,
      groundSupport: compileStudyGroundSupport(resolved, assembly.section, request.groundDeckLevelLossMm ?? 0),
      borderParts: parts.filter(part => part.role === 'border').length, release,
      coverageMm2: parts.reduce((total, part) => total + area(part.box), emitterPlinth.state === 'withheld' ? 0 : emitterPlinth.areaMm2),
      heldEvidence: ['permanent deck, bedding and product tests', 'finished-room installation and handling'],
    },
    opening, door, wall, grille, grilleKeepOut,
  } as const
  return { kit, nativeWindow }
}

export type StudyRoomKit = ReturnType<typeof deriveStudyRoomKit>['kit']

export function compileStudyRoomKit(resolved: CurrentDesignResolution, input: unknown) {
  const { kit, nativeWindow } = deriveStudyRoomKit(resolved, input)
  return { kit, wallTransition: compileStudyWallTransition(kit, nativeWindow) }
}

export function drawStudyRoomKitPlan(kit: StudyRoomKit, view: 'layout' | 'emitter-edge' | 'furniture-access' | 'furniture-motion' = 'layout'): DrawingSceneV2 {
  const [x, y] = kit.bands[0]
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
    sourceId: kit.source.occupiedHouse, scaleDenominator,
    title: motion ? 'Study staged furniture motion' : bcrParking ? 'Study floor access with the BCR furniture route' : useParking ? 'Study emitter-edge renewal and chair parking' : 'Study room-kit layout',
    description: motion ? 'Original and parked furniture, straight centreline movements and the whole turning reservation.'
      : bcrParking ? 'Dashed original furniture, parked furniture outlines and floor parts that remain covered in both stages.'
      : useParking ? 'Candidate emitter-edge pickup and first rest with the chair in its service parking position.'
      : 'Candidate finish field, fabricated borders, rough openings and shown furniture.',
    widthMm: projection.length(width) + 24, heightMm: projection.length(height) + 34,
    primitives: [
      ...kit.floor.parts.map(part => ({
        kind: 'rect' as const, id: part.id, ...rect(part.face), stroke: 'secondary' as const,
        fill: blockedPartIds.has(part.id) ? 'context' as const : 'none' as const, dash: part.role === 'border' ? 'datum' as const : 'none' as const,
        metadata: { role: part.role, band: part.band, ...(blockedPartIds.has(part.id) ? { coveredInBothBcrStages: true } : {}) },
      })),
      ...(kit.floor.emitterPlinth.state === 'withheld' ? [] : [{
        kind: 'rect' as const, id: kit.floor.emitterPlinth.id, ...rect(kit.floor.emitterPlinth.face),
        stroke: 'primary' as const, fill: 'context' as const, metadata: { role: 'fixed emitter plinth' },
      }]),
      ...kit.occupied.map(([id, box]) => ({
        kind: 'rect' as const, id: `occupied:${id}`, ...rect(useParking && id === 'study-chair' ? handling.parking.parkedChair : box),
        stroke: 'profile' as const, fill: showFurniture && id !== 'service-emitter-study-W' ? 'none' as const : 'context' as const,
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
      { kind: 'text', id: 'pitch', x: 12, y: projection.length(height) + 24, role: 'note',
        value: motion ? 'Dashed: starting positions and turning reservation · solid: translation and parking'
          : bcrParking ? `${blockedPartIds.size} parts covered in both BCR stages · ${bcrParking.deskShiftMm} mm desk shift`
          : useParking ? 'Chair parked · 300 mm lift-out transfer south of pickup'
          : `${kit.request.pitchMm} mm pitch · ${kit.floor.parts.length} parts · ${kit.floor.borderParts} border parts` },
    ],
  }
}
