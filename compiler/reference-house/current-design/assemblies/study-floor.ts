import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { tileField, type FloorObstacle, type FloorPoint, type FloorRect } from '../../../../project/ias/studies/workable-floor-tiles.mjs'
import { resolveCurrentDesign, type CurrentDesignResolution } from '../resolve.js'

const floorPath = 'project/ias/studies/workable-study-floor.json'
const releasePath = 'project/ias/studies/workable-study-release.json'
const housePath = 'project/had/studies/current-house.mjs'
const waterPath = 'project/had/studies/water-replan.json'
const studyId = 'GROUND/G-STUDY'
const reader = (path: string) => readFileSync(new URL('../../../../' + path, import.meta.url))
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')

interface FloorReceipt {
  readonly source: { readonly id: string; readonly model: string; readonly compositorSHA256: string; readonly relevantGeometrySHA256: string }
  readonly study: { readonly bands: readonly FloorRect[]; readonly occupied: readonly FloorObstacle[]; readonly finishedAreaM2: number }
  readonly assemblies: {
    readonly groundDepthAboveRC: number
    readonly skirting: {
      readonly heightMM: number; readonly existingProjectionMM: number; readonly serviceProjectionMM: number; readonly coverMM: number
    }
  }
  readonly moduleStudy: { readonly origin: FloorPoint; readonly options: readonly { readonly pitch: number }[] }
  readonly release: { readonly lift: FloorRect }
}

interface ReleaseReceipt {
  readonly sourceSHA256: string
  readonly panel: { readonly pitch: number; readonly gap: number; readonly skin: number; readonly beddingTerritory: number; readonly nominalDensity: number }
  readonly revised: {
    readonly southWallReserveMM: number; readonly southSkirtingClearanceMM: number; readonly southSkirtingAfter5SettingMM: number
    readonly footHalfY: number
  }
}

interface StudyConfiguration { readonly pitchMm?: number; readonly skirting?: 'ordinary' | 'service' }

function configuration(input: unknown): StudyConfiguration {
  if (!input || typeof input !== 'object' || Object.getPrototypeOf(input) !== Object.prototype) throw new TypeError('Expected a Study configuration')
  const config = input as StudyConfiguration
  if (Object.keys(input).some(key => key !== 'pitchMm' && key !== 'skirting')
    || (config.pitchMm !== undefined && (!Number.isFinite(config.pitchMm) || config.pitchMm <= 0))
    || (config.skirting !== undefined && config.skirting !== 'ordinary' && config.skirting !== 'service')) {
    throw new TypeError('Unsupported Study configuration')
  }
  return config
}

function finiteRect(rect: FloorRect) {
  return Array.isArray(rect) && rect.length === 4 && rect.every(Number.isFinite) && rect[0] < rect[2] && rect[1] < rect[3]
}

function secureSources(resolution: CurrentDesignResolution, read: typeof reader) {
  const binding = resolution.disciplineBindings.find(item => item.id === 'had-occupied-services')
  if (!binding?.identities[waterPath] || !binding.identities[housePath]
    || !resolution.design.storeys.GROUND.rooms.some(room => room.id === studyId)) {
    throw new TypeError('The Study assembly requires the exact admitted occupied-services source binding')
  }
  const floorBytes = read(floorPath)
  const releaseBytes = read(releasePath)
  const floor = JSON.parse(floorBytes.toString('utf8')) as FloorReceipt
  const release = JSON.parse(releaseBytes.toString('utf8')) as ReleaseReceipt
  const floorHash = digest(floorBytes)
  const compositor = read(housePath)
  const compositorBlob = gitBlob(compositor)
  if (binding.identities[floorPath] !== gitBlob(floorBytes) || binding.identities[releasePath] !== gitBlob(releaseBytes)
    || release.sourceSHA256 !== floorHash || floor.source.model !== binding.identities[waterPath]
    || floor.source.compositorSHA256 !== digest(compositor) || compositorBlob !== binding.identities[housePath]) {
    throw new TypeError('The IAS floor and release receipts disagree with their occupied-house inputs')
  }
  if (!floor.study.bands.length || !floor.study.bands.every(finiteRect) || !floor.study.occupied.every(([, box]) => finiteRect(box))
    || !finiteRect(floor.release.lift)
    || !floor.moduleStudy.origin.every(Number.isFinite) || floor.moduleStudy.origin.length !== 2
    || ![floor.assemblies.groundDepthAboveRC, floor.assemblies.skirting.heightMM, floor.assemblies.skirting.existingProjectionMM,
      floor.assemblies.skirting.serviceProjectionMM, floor.assemblies.skirting.coverMM, release.panel.pitch, release.panel.gap,
      release.panel.skin, release.panel.beddingTerritory, release.panel.nominalDensity].every(value => Number.isFinite(value) && value > 0)
    || ![release.revised.southWallReserveMM, release.revised.southSkirtingAfter5SettingMM,
      release.revised.southSkirtingClearanceMM, release.revised.footHalfY].every(Number.isFinite)) {
    throw new TypeError('Malformed source-owned Study assembly data')
  }
  return { floor, release, source: {
    currentPlanBasis: resolution.design.source.id, occupiedHouse: floor.source.id, roomId: studyId, bindingDigest: binding.digest,
    floor: { path: floorPath, sha256: floorHash }, release: { path: releasePath, sha256: digest(releaseBytes) },
    furnishedGeometrySha256: floor.source.relevantGeometrySHA256,
  } }
}

/** Read-only pre-site trial over the native IAS Study comparison and its native tile kernel. */
export function compileStudyAssembly(input: unknown, options: unknown = {}, read = reader) {
  return compileResolvedStudyAssembly(resolveCurrentDesign(input), options, read)
}

export function compileResolvedStudyAssembly(resolved: CurrentDesignResolution, options: unknown = {}, read = reader) {
  const config = configuration(options)
  const { floor, release, source } = secureSources(resolved, read)
  const pitchMm = config.pitchMm ?? release.panel.pitch
  if (!floor.moduleStudy.options.some(option => option.pitch === pitchMm) || pitchMm <= release.panel.gap) {
    throw new RangeError('Study pitch is outside the native IAS comparison')
  }

  const sideMm = pitchMm - release.panel.gap
  const fullTileMassKg = sideMm ** 2 * release.panel.skin * release.panel.nominalDensity / 1e9
  const [ox, oy] = floor.moduleStudy.origin
  const occurrences = tileField(pitchMm, floor.moduleStudy.origin, floor.study.bands, floor.study.occupied).map(cell => ({
    id: `${studyId}/floor/cell/${(cell.box[0] - ox) / pitchMm}/${(cell.box[1] - oy) / pitchMm}`,
    ...cell, wearFaceMassKg: cell.full ? fullTileMassKg : null,
  }))
  const complete = occurrences.filter(cell => cell.full)
  const skirting = floor.assemblies.skirting
  const profile = config.skirting ?? 'ordinary'
  const projectionMm = profile === 'ordinary' ? skirting.existingProjectionMM : skirting.serviceProjectionMM
  const settingMm = release.revised.southSkirtingClearanceMM - release.revised.southSkirtingAfter5SettingMM
  const shoeClearanceMm = release.revised.southWallReserveMM - projectionMm - settingMm
  return {
    schema: 'ias-study-assembly-trial/1', state: 'candidate', units: 'mm', source,
    grid: { pitchMm, origin: floor.moduleStudy.origin, occupied: floor.study.occupied, bands: floor.study.bands, occurrences },
    schedule: {
      wholeTiles: complete.length, wholeTilesClearOfShownFurniture: complete.filter(tile => !tile.fixedObstructions.length).length,
      clippedCells: occurrences.length - complete.length, finishedAreaM2: floor.study.finishedAreaM2,
      clearTileSideMm: sideMm, completeTileWearFaceMassKg: fullTileMassKg,
      wearFaceMassAllCompleteTilesKg: fullTileMassKg * complete.length,
    },
    section: {
      status: 'nominal-comparison', datum: 'Study ground finished floor', ffl: 0, rcTop: -floor.assemblies.groundDepthAboveRC,
      wearFaceMm: release.panel.skin, beddingTerritoryMm: release.panel.beddingTerritory, jointMm: release.panel.gap,
      tileSouthSetbackMm: floor.release.lift[1] - floor.study.bands[0][1] + release.panel.gap / 2,
      skirting: {
        id: `${studyId}/skirting/south-release-edge`, profile, projectionMm, heightMm: skirting.heightMM,
        serviceCoverMm: profile === 'service' ? skirting.coverMM : null,
      },
    },
    release: pitchMm !== release.panel.pitch
      ? { state: 'unresolved', code: 'FIXED_BRIDGE_PITCH', referencePitchMm: release.panel.pitch } as const
      : { state: shoeClearanceMm < 0 ? 'conflict' : 'geometry-only', code: 'SOUTH_BRIDGE_SHOE', shoeClearanceMm, settingMm,
        shoeExtentMm: [release.revised.southWallReserveMM, release.revised.southWallReserveMM + 2 * release.revised.footHalfY] } as const,
    withheld: ['perimeter piece fabrication and mass', 'tool/body and loaded handling', 'fixed captures and actual support',
      'cable support and clearances', 'floor durability, fire, acoustics and moisture'],
  } as const
}
