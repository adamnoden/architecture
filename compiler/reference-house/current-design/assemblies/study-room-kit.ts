import { sha256SemanticFingerprint } from '../../../core/identity.js'
import { createPlanPaperProjection } from '../../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../../publication-drawing-v2/model.js'
import { applyDesignEdit, beginDesignEdit, editBase } from '../edit.js'
import { readBoundOccupiedServices } from '../occupied-services.js'
import type { CurrentDesignResolution } from '../resolve.js'
import { compileRenewableOpenings } from './renewable-openings.js'
import { compileResolvedStudyAssembly } from './study-floor.js'
import { compileResolvedStudyLinings, layStudySouthPanelStock } from './study-linings.js'

type FloorAssembly = ReturnType<typeof compileResolvedStudyAssembly>
type Box = readonly [number, number, number, number]
type Case = {
  readonly schema: 'ias-study-room-kit-case/1'
  readonly units: 'mm'
  readonly pitchMm: number
  readonly wearingFace: 'oak' | 'stone-steel'
  readonly opening?: { readonly id: string; readonly hostId: string; readonly occupiedCentreMm: number }
}

const minimumBorderMm = 60
const pickupBox: Box = [3800, 500, 4100, 800]
const firstRestBox: Box = [4100, 500, 4400, 800]

function record(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === 'object' && !Array.isArray(input)
}

function caseInput(input: unknown): Case {
  if (!record(input) || Object.keys(input).some(key => !['schema', 'units', 'pitchMm', 'wearingFace', 'opening'].includes(key))
    || input.schema !== 'ias-study-room-kit-case/1' || input.units !== 'mm'
    || typeof input.pitchMm !== 'number' || !Number.isFinite(input.pitchMm)
    || (input.wearingFace !== 'oak' && input.wearingFace !== 'stone-steel')) {
    throw new TypeError('INVALID_STUDY_ROOM_KIT_CASE')
  }
  const wearingFace = input.wearingFace
  if (input.opening === undefined) return { schema: input.schema, units: input.units, pitchMm: input.pitchMm, wearingFace }
  const opening = input.opening
  if (!record(opening) || Object.keys(opening).length !== 3 || typeof opening.id !== 'string'
    || typeof opening.hostId !== 'string' || typeof opening.occupiedCentreMm !== 'number' || !Number.isFinite(opening.occupiedCentreMm)) {
    throw new TypeError('INVALID_STUDY_ROOM_KIT_OPENING')
  }
  return { schema: input.schema, units: input.units, pitchMm: input.pitchMm, wearingFace,
    opening: { id: opening.id, hostId: opening.hostId, occupiedCentreMm: opening.occupiedCentreMm } }
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

function partSetout(assembly: FloorAssembly) {
  const { grid, source, section, schedule } = assembly
  const inset = section.jointMm / 2
  const massPerSquareMm = schedule.completeTileWearFaceMassKg / (schedule.clearTileSideMm ** 2)
  return grid.bands.flatMap(([x0, y0, x1, y1], band) =>
    setout(x0, x1, grid.origin[0], grid.pitchMm).flatMap(([left, right]) =>
      setout(y0, y1, grid.origin[1], grid.pitchMm).map(([bottom, top]) => {
        const box: Box = [left, bottom, right, top]
        const face: Box = [left + inset, bottom + inset, right - inset, top - inset]
        const sizeMm = [face[2] - face[0], face[3] - face[1]] as const
        const onEdge = left === x0 || right === x1 || (bottom === y0 && band === 0)
          || (top === y1 && (!grid.bands[band + 1] || right > grid.bands[band + 1][2]))
        const cut = right - left !== grid.pitchMm || top - bottom !== grid.pitchMm
        return {
          id: `${source.roomId}/room-kit/floor/${left}/${bottom}`, band, box, face, sizeMm,
          role: cut || onEdge ? 'border' as const : 'field' as const,
          wearFaceKg: sizeMm[0] * sizeMm[1] * massPerSquareMm,
          occupied: grid.occupied.filter(([, item]) => intersects(box, item)).map(([id]) => id),
        }
      })))
}

function openingSetout(resolved: CurrentDesignResolution, config: Case) {
  const { window, door } = compileRenewableOpenings(resolved)
  const current = window.opening
  const requestedCentre = config.opening?.occupiedCentreMm ?? current.occupiedCentreMm
  const shift = requestedCentre - current.occupiedCentreMm
  const nominalToOccupiedOffsetMm = current.occupiedCentreMm - current.nominalCentreMm
  const linings = compileResolvedStudyLinings(resolved)
  const southField = linings.wall.southField
  const reserves = southField.windows.map(item => ({ ...item, id: `GROUND/${item.id}` }))
  const source = reserves.find(item => item.id === current.id)
  if (!source) throw new Error('MISSING_BOUND_STUDY_ROOM_KIT_OPENING')
  if (config.opening && (config.opening.id !== current.id || config.opening.hostId !== current.hostId)) {
    throw new RangeError('UNKNOWN_STUDY_ROOM_KIT_HOSTED_OPENING')
  }
  const [x0, z0, x1, z1] = source.box
  const fixedControls = reserves.filter(item => item.id !== current.id)
  let centre = current.occupiedCentreMm
  const relation = shift === 0 ? 'native' : 'changed-candidate'
  if (shift !== 0) {
    const draft = beginDesignEdit(resolved.design, 'ias-study-room-kit', 'SPECIMEN-IAS-STUDY-ROOM-KIT')
    const moved = applyDesignEdit(draft, { schema: 'current-design-edit/1', units: 'mm', base: editBase(draft),
      operations: [{ kind: 'move-opening', level: 'GROUND', openingId: current.id, hostWallId: current.hostId,
        centreMm: requestedCentre - nominalToOccupiedOffsetMm }] }, [])
    if (moved.status === 'rejected') throw new RangeError(`STUDY_ROOM_KIT_MOVE_REJECTED: ${moved.diagnostic.code}`)
    const editedOpening = moved.state.design.storeys.GROUND.openings.find(item => item.id === current.id)
    if (!editedOpening) throw new Error('MISSING_EDITED_STUDY_ROOM_KIT_OPENING')
    centre = editedOpening.centreMm + nominalToOccupiedOffsetMm
  }
  const offset = centre - current.occupiedCentreMm
  const box: Box = [x0 + offset, z0, x1 + offset, z1]
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
    release: relation === 'native' ? window.release.state : 'withheld-for-position-change',
    dependencies: ['fixed-frame', 'dry-seam', 'jamb-release', 'local-panelling-reveal'],
    evidence: relation === 'native'
      ? { state: 'native-comparison-only', receipt: window.receipt } as const
      : { state: 'stale', code: 'MOVED_STUDY_OPENING_FIXED_DETAILS' } as const,
  } as const
  return { opening, wall, grille: linings.grille, grilleKeepOut } as const
}

function releaseScreen(assembly: FloorAssembly, parts: ReturnType<typeof partSetout>) {
  const at = (box: Box) => parts.find(part => part.box.every((coordinate, index) => coordinate === box[index]))
  const pickup = at(pickupBox)
  const rest = at(firstRestBox)
  if (!pickup || !rest) return { state: 'withheld', code: 'TRIAL_PICKUP_OR_FIRST_REST_CHANGED' } as const
  const [, south, , north] = assembly.grid.bands[pickup.band]
  const radius = 300
  const setting = 5
  const projection = assembly.section.skirting.projectionMm
  const stanceY = (south + north) / 2
  const gap = 35
  const startX = pickupBox[0] - radius - gap
  const endX = firstRestBox[0] - radius - gap
  const workerSweep: Box = [startX - radius, stanceY - radius, endX + radius, stanceY + radius]
  const panelSweep: Box = [pickupBox[0], pickupBox[1], firstRestBox[2], firstRestBox[3]]
  const wallMarginMm = (north - south) / 2 - radius - projection - setting
  const blocked = wallMarginMm <= 0 || assembly.grid.occupied.some(([, box]) => intersects(box, workerSweep) || intersects(box, panelSweep))
  const gripX = (pickupBox[0] + pickupBox[2]) / 2
  const gripY = (pickupBox[1] + pickupBox[3]) / 2
  const gripZ = 180
  const shoulderZ = 360
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

export function compileStudyRoomKit(resolved: CurrentDesignResolution, input: unknown) {
  const request = caseInput(input)
  const assembly = compileResolvedStudyAssembly(resolved, { pitchMm: request.pitchMm, wearingFace: request.wearingFace })
  const parts = partSetout(assembly)
  const { opening, wall, grille, grilleKeepOut } = openingSetout(resolved, request)
  const release = releaseScreen(assembly, parts)
  const { house } = readBoundOccupiedServices(resolved)
  const [doorMin, doorMax] = house.model.studyDoorOperation.rough
  const [, doorAxis] = house.model.studyDoorOperation.hinge
  const door = { id: 'HAD/protectedRoute/STUDY', rough: [doorMin, doorMax], axis: doorAxis } as const
  return {
    schema: 'ias-study-room-kit/1', state: 'candidate', units: 'mm', request,
    source: assembly.source, caseDigest: sha256SemanticFingerprint({ request, source: assembly.source, opening }),
    bands: assembly.grid.bands, occupied: assembly.grid.occupied,
    floor: {
      parts, jointMm: assembly.section.jointMm, wearingFaceMm: assembly.section.wearFaceMm, beddingMm: assembly.section.beddingTerritoryMm,
      depthUnassignedWithinFinishMm: assembly.section.finishSupportDepthUnresolvedMm,
      borderParts: parts.filter(part => part.role === 'border').length, release,
      coverageMm2: parts.reduce((total, { box: [x0, y0, x1, y1] }) => total + (x1 - x0) * (y1 - y0), 0),
      heldEvidence: ['permanent deck, bedding and product tests', 'finished-room installation and handling'],
    },
    opening, door, wall, grille, grilleKeepOut,
  } as const
}

export function drawStudyRoomKitPlan(kit: ReturnType<typeof compileStudyRoomKit>): DrawingSceneV2 {
  const [x, y] = kit.bands[0]
  const width = Math.max(...kit.bands.map(band => band[2])) - x
  const height = Math.max(...kit.bands.map(band => band[3])) - y
  const scaleDenominator = 25
  const projection = createPlanPaperProjection({ scaleDenominator, modelBounds: { x, y, width, height }, paperOrigin: { x: 12, y: 14 } })
  const rect = (box: Box) => {
    const [x0, y0, x1, y1] = box
    return projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 })
  }
  const release = kit.floor.release
  return {
    viewId: 'ias-study-room-kit-plan', sourceId: kit.source.occupiedHouse, scaleDenominator,
    title: 'Study room-kit layout', description: 'Candidate finish field, fabricated borders, rough openings and shown furniture.',
    widthMm: projection.length(width) + 24, heightMm: projection.length(height) + 34,
    primitives: [
      ...kit.floor.parts.map(part => ({
        kind: 'rect' as const, id: part.id, ...rect(part.face), stroke: 'secondary' as const,
        fill: 'none' as const, dash: part.role === 'border' ? 'datum' as const : 'none' as const,
        metadata: { role: part.role, band: part.band },
      })),
      ...kit.occupied.map(([id, box]) => ({ kind: 'rect' as const, id: `occupied:${id}`, ...rect(box),
        stroke: 'profile' as const, fill: 'context' as const })),
      ...[kit.opening, ...kit.opening.fixedControls].map(opening => ({
        kind: 'line' as const, id: opening.id, role: 'profile' as const,
        a: projection.point(opening.box[0], y), b: projection.point(opening.box[2], y),
      })),
      { kind: 'line', id: kit.door.id, role: 'profile', a: projection.point(kit.door.rough[0], kit.door.axis),
        b: projection.point(kit.door.rough[1], kit.door.axis) },
      ...(release.state !== 'withheld' ? [
        { kind: 'rect' as const, id: 'trial-panel-sweep', stroke: 'primary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(release.panelSweep) },
        { kind: 'rect' as const, id: 'trial-worker-sweep', stroke: 'secondary' as const,
          dash: 'provisional' as const, fill: 'none' as const, ...rect(release.workerSweep) },
      ] : []),
      { kind: 'text', id: 'pitch', x: 12, y: projection.length(height) + 24, role: 'note',
        value: `${kit.request.pitchMm} mm pitch · ${kit.floor.parts.length} parts · ${kit.floor.borderParts} border parts` },
    ],
  }
}
