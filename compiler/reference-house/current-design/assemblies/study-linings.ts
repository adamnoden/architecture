import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { grossSlotArea, roomSideGrillePlateMm, studyWallPanel } from '../../../../project/ias/studies/workable-lining-dimensions.mjs'
import { resolveCurrentDesign, type CurrentDesignResolution } from '../resolve.js'

const studyId = 'GROUND/G-STUDY'
const inputs = {
  floor: 'project/ias/studies/workable-study-floor.json',
  release: 'project/ias/studies/workable-study-release.json',
  assemblies: 'project/ias/studies/workable-room-assemblies.json',
  services: 'project/had/studies/current-house-services.json',
  dimensions: 'project/ias/studies/workable-lining-dimensions.mjs',
} as const
const reader = (path: string) => readFileSync(new URL('../../../../' + path, import.meta.url))
const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')

interface FloorReceipt {
  source: { id: string; relevantGeometrySHA256: string }
  assemblies: { finishTradeoffs: readonly { depthMM: number; projectionBeyondBaselineMM: number }[] }
  study: {
    door: { operatingBodyLowerBoundMM: number }
    bands: readonly (readonly [number, number, number, number])[]
    windows: readonly { readonly id: string; readonly wall: string; readonly centre: number; readonly width: number;
      readonly sill: number; readonly head: number }[]
  }
}
interface RoomReceipt {
  source: { id: string; geometry: string; floorSHA256: string; releaseSHA256: string }
  groundedInterfaces: { wallFinishMM: number }
  grate: { slotLength: number; slotWidth: number; slots: number; grossOpenArea: number
    referenceInwardEquivalentArea: number; referenceOutwardEquivalentArea: number }
}
interface ServicesReceipt {
  selectedServiceInterfaces: { inletMaintenance: readonly {
    id: string; wall: string; point: readonly [number, number, number]; innerCartridge: {
      completeOD: number; retainedReceiverID: number; radialGapMM: number; drawMM: number
    }
  }[] }
}
interface Configuration {
  readonly backing?: 'replace-mineral' | 'retain-mineral'
  readonly slotWidthMm?: number
  readonly panelPitchMm?: 420 | 450
}

function configuration(input: unknown): Configuration {
  if (!input || typeof input !== 'object' || Object.getPrototypeOf(input) !== Object.prototype) throw new TypeError('Expected a Study lining configuration')
  const config = input as Configuration
  if (Object.keys(input).some(key => key !== 'backing' && key !== 'slotWidthMm' && key !== 'panelPitchMm')
    || (config.backing !== undefined && config.backing !== 'replace-mineral' && config.backing !== 'retain-mineral')
    || (config.panelPitchMm !== undefined && config.panelPitchMm !== 420 && config.panelPitchMm !== 450)
    || (config.slotWidthMm !== undefined && (!Number.isFinite(config.slotWidthMm) || config.slotWidthMm <= 0))) {
    throw new TypeError('Unsupported Study lining configuration')
  }
  return config
}

function admittedSources(resolved: CurrentDesignResolution, read: typeof reader) {
  const binding = resolved.disciplineBindings.find(item => item.id === 'had-occupied-services')
  if (!binding || !resolved.design.storeys.GROUND.rooms.some(room => room.id === studyId)) {
    throw new TypeError('The lining trial requires the exact admitted occupied Study sources')
  }
  const boundBytes = (path: string) => {
    const bytes = read(path)
    if (gitBlob(bytes) !== binding.identities[path]) throw new TypeError(`Study lining source bytes differ from their binding: ${path}`)
    return bytes
  }
  const floorBytes = boundBytes(inputs.floor)
  const releaseBytes = boundBytes(inputs.release)
  const roomBytes = boundBytes(inputs.assemblies)
  const servicesBytes = boundBytes(inputs.services)
  boundBytes(inputs.dimensions)
  const floor = JSON.parse(floorBytes.toString('utf8')) as FloorReceipt
  const room = JSON.parse(roomBytes.toString('utf8')) as RoomReceipt
  const services = JSON.parse(servicesBytes.toString('utf8')) as ServicesReceipt
  const inlet = services.selectedServiceInterfaces.inletMaintenance.find(item => item.id === 'study')
  if (!inlet || inlet.wall !== 'outer-south' || inlet.point.length !== 3 || !inlet.point.every(Number.isFinite)
    || floor.source.id !== room.source.id || floor.source.relevantGeometrySHA256 !== room.source.geometry
    || room.source.floorSHA256 !== hash(floorBytes) || room.source.releaseSHA256 !== hash(releaseBytes)) {
    throw new TypeError('IAS lining receipts disagree with their Study basis')
  }
  return { floor, room, inlet, source: {
    planBasis: resolved.design.source.id, occupiedHouse: floor.source.id, roomId: studyId, bindingDigest: binding.digest,
    identities: Object.fromEntries(Object.values(inputs).map(path => [path, binding.identities[path]])),
  } }
}

export function compileStudyLinings(input: unknown, options: unknown = {}, read = reader) {
  return compileResolvedStudyLinings(resolveCurrentDesign(input), options, read)
}

type FaceBox = readonly [lowX: number, lowZ: number, highX: number, highZ: number]

function outsideReserve(face: FaceBox, reserved: FaceBox): readonly FaceBox[] {
  const [a, b, c, d] = face
  const [e, f, g, h] = reserved
  const lo = Math.max(a, e), hi = Math.min(c, g), base = Math.max(b, f), head = Math.min(d, h)
  if (lo >= hi || base >= head) return [face]
  const candidates: FaceBox[] = [[a, b, lo, d], [hi, b, c, d], [lo, b, hi, base], [lo, head, hi, d]]
  return candidates.filter(([x0, z0, x1, z1]) => x1 > x0 && z1 > z0)
}

function southPanelField(floor: FloorReceipt, pitchMm: number) {
  const [x0, , x1] = floor.study.bands[0]
  const windows = floor.study.windows.filter(item => item.wall === 'outer-south').map(window => ({
    id: window.id, box: [window.centre - window.width / 2, window.sill, window.centre + window.width / 2, window.head] as FaceBox,
  }))
  return layStudySouthPanelStock(x0, x1, pitchMm, windows)
}

export function layStudySouthPanelStock(
  x0: number, x1: number, pitchMm: number, windows: readonly { readonly id: string; readonly box: FaceBox }[],
  serviceReserves: readonly FaceBox[] = [],
) {
  const rows = studyWallPanel.rowDatumsMm
  const apertures = [...windows.map(window => window.box), ...serviceReserves]
  const columns = Math.ceil((x1 - x0) / pitchMm)
  const pieces = Array.from({ length: columns }, (_, column) => {
    const x = x0 + column * pitchMm
    return rows.slice(1).flatMap((head, index) => {
      const face: FaceBox = [x, rows[index], Math.min(x + pitchMm, x1), head]
      return apertures.reduce<readonly FaceBox[]>((parts, aperture) => parts.flatMap(part => outsideReserve(part, aperture)), [face])
        .map((box, part) => ({ id: `SOUTH/W1/${column}/${index}/${part}`, box }))
    })
  }).flat()
  return {
    pitchMm, rowDatumsMm: rows, windows, pieces, columns,
    widthMm: x1 - x0, startXMm: x0, pieceCount: pieces.length,
    faceAreaM2: pieces.reduce((area, { box: [a, b, c, d] }) => area + (c - a) * (d - b), 0) / 1e6,
    scope: 'Nominal rectangular stock zones. Full arch rectangles are reserved before final reveal and capture.',
  } as const
}

export function compileResolvedStudyLinings(resolved: CurrentDesignResolution, options: unknown = {}, read = reader) {
  const config = configuration(options)
  const { floor, room, inlet, source } = admittedSources(resolved, read)
  const referenceDepthMm = room.groundedInterfaces.wallFinishMM
  const fixedParts = [
    { id: `${studyId}/W1/capture`, role: 'point-capture-territory', depthMm: studyWallPanel.captureMm },
    { id: `${studyId}/W1/setting`, role: 'fit-allowance', depthMm: studyWallPanel.fitMm },
    { id: `${studyId}/W1/face`, role: 'removable-timber-face', depthMm: studyWallPanel.faceMm },
  ]
  const newDepthMm = fixedParts.reduce((sum, part) => sum + part.depthMm, 0)
  const retainMineral = config.backing === 'retain-mineral'
  const totalDepthMm = newDepthMm + (retainMineral ? referenceDepthMm : 0)
  const wallFaceOverrunMm = totalDepthMm - referenceDepthMm
  const authored = floor.assemblies.finishTradeoffs[retainMineral ? 2 : 1]
  if (authored?.depthMM !== totalDepthMm || authored.projectionBeyondBaselineMM !== wallFaceOverrunMm) {
    throw new TypeError('W1 depth comparison disagrees with the native worksheet')
  }

  const slot = room.grate
  const slotWidthMm = config.slotWidthMm ?? slot.slotWidth
  if (slotWidthMm > slot.slotWidth) throw new RangeError('Widening the slots requires the actual retained plate, webs and edge set-out')
  if (grossSlotArea(slot.slotLength, slot.slotWidth, slot.slots) !== slot.grossOpenArea) {
    throw new TypeError('G1 reference slots disagree with the native worksheet')
  }
  const totalOpenAreaMm2 = grossSlotArea(slot.slotLength, slotWidthMm, slot.slots)
  const inwardGrossMarginMm2 = totalOpenAreaMm2 - slot.referenceInwardEquivalentArea
  const { completeOD, retainedReceiverID, radialGapMM, drawMM } = inlet.innerCartridge
  return {
    schema: 'ias-study-lining-trial/1', state: 'candidate', units: 'mm', source,
    wall: {
      id: `${studyId}/W1`, backing: retainMineral ? 'retain-mineral' : 'replace-mineral',
      referenceDepthMm, totalDepthMm, wallFaceOverrunMm,
      southField: southPanelField(floor, config.panelPitchMm ?? studyWallPanel.pitchMm),
      layerSchedule: retainMineral
        ? [{ id: `${studyId}/W1/retained-mineral`, role: 'retained-mineral', depthMm: referenceDepthMm }, ...fixedParts]
        : fixedParts,
      revealStatus: wallFaceOverrunMm > 0 ? 'conflict' : 'face-aligned',
      historicDoorBodyReserveMm: floor.study.door.operatingBodyLowerBoundMM,
      evidence: {
        protectedRevealAndRenewal: wallFaceOverrunMm > 0 ? 'recheck' : 'geometry-only',
        captureAndPermanentBoundary: 'unresolved',
      },
    },
    grille: {
      id: `${studyId}/G1/room-side-grille`,
      actualRetainedInlet: { id: inlet.id, wall: inlet.wall, stationDatumMm: inlet.point, completeOD, retainedReceiverID, radialGapMM, drawMM },
      nominalPlateMm: roomSideGrillePlateMm,
      slotSchedule: { id: `${studyId}/G1/slots`, count: slot.slots, lengthMm: slot.slotLength, clearWidthMm: slotWidthMm, totalOpenAreaMm2 },
      grossAreaScreen: {
        inwardGrossMarginMm2, outwardGrossMarginMm2: totalOpenAreaMm2 - slot.referenceOutwardEquivalentArea,
        state: inwardGrossMarginMm2 < 0 ? 'below-reference' : 'geometric-only',
      },
      evidence: {
        installedAreaSoundAndWeather: 'unresolved',
        existingFlangeAndRelease: slotWidthMm === slot.slotWidth ? 'unresolved' : 'recheck',
      },
    },
  } as const
}
