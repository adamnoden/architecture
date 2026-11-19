import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { studyDrySeam, type StudyDryProfile } from '../../../../project/oas/studies/study-dry-seam.mjs'
import { frontStudyOpening, inspectResolvedHostedOpening } from '../../construction-bay/opening-inspection.js'
import type { CurrentDesignResolution } from '../resolve.js'

const windowPath = 'project/oas/studies/study-subframe.json'
const windowMethod = 'project/oas/studies/study-dry-seam.mjs'
const doorPath = 'project/had/studies/water-replan.json'
const doorDrawingPath = 'project/had/studies/south-court-threshold.svg'
const references = {
  bay: 'project/bcr/studies/bay-interface-study.json',
  window: 'project/mat/studies/study-coupled-window.json',
  sash: 'project/mat/studies/study-coupled-window-sources.json',
  room: 'project/ias/studies/workable-study-floor.json',
} as const
const reader = (path: string) => readFileSync(new URL('../../../../' + path, import.meta.url))
const sha = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')

interface WindowReceipt {
  readonly schemaVersion: 1
  readonly sourceBlobs: Readonly<Record<string, string>>
  readonly sourceSha256: Readonly<Record<keyof typeof references, string>>
  readonly occurrence: { readonly level: string; readonly host: string; readonly id: string; readonly centre: number; readonly width: number }
  readonly e0: { readonly frameWidth: number; readonly lining: number; readonly joint: number }
  readonly e2: readonly (StudyDryProfile & { readonly id: string; readonly nominalDryReleaseAfterSettings: number })[]
  readonly retainedControls: {
    readonly portalCore: readonly [number, number]
    readonly existingCeiling: number
    readonly release: { readonly headDraw: number; readonly headPocketAfterTwo2: number }
  }
}

type PlanRectangle = readonly [number, number, number, number]

interface BayReceipt {
  readonly basis: { readonly opening: { readonly id: string; readonly old: number; readonly new: number } }
  readonly rejectedParkedState: { readonly chair: PlanRectangle }
  readonly candidate: {
    readonly chairTranslation: { readonly start: PlanRectangle; readonly end: PlanRectangle }
    readonly deskTranslation: { readonly start: PlanRectangle; readonly end: PlanRectangle }
  }
}

interface DoorReceipt {
  readonly model: {
    readonly southCourtWeatherDoor: { readonly rough: readonly [number, number]; readonly clearBeyondOpenTip: number }
    readonly southCourtThresholdReference: {
      readonly status: string
      readonly retained: { readonly leafEach: readonly [number, number, number]; readonly hinges: readonly (readonly [number, number])[] }
      readonly primarySill: { readonly leafClearance: number }
      readonly maintainedState: {
        readonly temporaryWeatherLine: { readonly plan: readonly [number, number, number, number] }
        readonly leafTask: { readonly firstTranslationNorth: number; readonly turnDegrees: number; readonly hingeRelease: { readonly maximumToolStroke: number } }
        readonly panTask: { readonly pullNorth: number; readonly wholeBodyMaximum: readonly [number, number, number]; readonly clearDrawPlan: readonly [number, number, number, number] }
        readonly geometryProof: { readonly pass: boolean; readonly bodyReserve: number; readonly scope: string }
      }
    }
  }
}

function widthFor(received: unknown, nativeWidth: number) {
  if (received === undefined) return nativeWidth
  if (!received || typeof received !== 'object' || Object.getPrototypeOf(received) !== Object.prototype
    || Object.keys(received).length !== 2 || !('schema' in received) || received.schema !== 'oas-study-width-case/1'
    || !('widthMm' in received) || typeof received.widthMm !== 'number'
    || !Number.isSafeInteger(received.widthMm) || received.widthMm <= 0) throw new TypeError('Expected a versioned Study width case in whole millimetres')
  return received.widthMm
}

export function compileRenewableOpenings(resolved: CurrentDesignResolution, received?: unknown, read = reader) {
  const occupiedBinding = resolved.disciplineBindings.find(item => item.id === 'had-occupied-services')
  const waterBinding = resolved.disciplineBindings.find(item => item.id === 'had-selected-water')
  if (!occupiedBinding?.identities[references.room] || !waterBinding?.identities[doorPath]) {
    throw new TypeError('Renewable openings require exact accepted occupied-house and HAD selected-water bindings')
  }

  const methodHash = sha(read(windowMethod))
  if (methodHash !== '353dcc5b867a7a4e720268a85b534ed3ee84e08c2c330dbbe09795385a8c8d3c') throw new TypeError('The OAS Study dry-seam method changed')
  const windowBytes = read(windowPath)
  const windowHash = sha(windowBytes)
  // The OAS comparison is a candidate receipt, separate from the selected HAD binding.
  if (windowHash !== '72e77dccc022fa38f75b1056966c18ea49f9e4d5e453215d1441f678f7520710') {
    throw new TypeError('The OAS Study comparison receipt changed')
  }
  const window = JSON.parse(windowBytes.toString('utf8')) as WindowReceipt
  const bayBytes = read(references.bay)
  for (const [key, path] of Object.entries(references) as [keyof typeof references, string][]) {
    const bytes = key === 'bay' ? bayBytes : read(path)
    if (sha(bytes) !== window.sourceSha256[key] || (key === 'room' && gitBlob(bytes) !== occupiedBinding.identities[path])) {
      throw new TypeError(`OAS Study comparison provenance disagrees at ${path}`)
    }
  }
  for (const [path, blob] of Object.entries(window.sourceBlobs)) {
    if (gitBlob(read(path)) !== blob) throw new TypeError(`OAS occupied-house input changed at ${path}`)
  }

  const doorBytes = read(doorPath)
  const doorSvg = read(doorDrawingPath)
  const doorDrawingHash = sha(doorSvg)
  if (gitBlob(doorBytes) !== waterBinding.identities[doorPath]
    || doorDrawingHash !== 'dbe6637719db6261ab46a828313f5b0fdb2ae927127a557bb4ccf50073a9ec05') {
    throw new TypeError('The HAD south-court door receipt or native drawing changed')
  }
  const door = JSON.parse(doorBytes.toString('utf8')) as DoorReceipt
  const nominal = inspectResolvedHostedOpening(resolved, frontStudyOpening)
  const bay = JSON.parse(bayBytes.toString('utf8')) as BayReceipt
  const occurrence = window.occurrence
  if (`${occurrence.level}/${occurrence.id}` !== nominal.row.openingId
    || `${occurrence.level}/${occurrence.host}` !== nominal.row.hostWallId
    || bay.basis.opening.id !== occurrence.id || bay.basis.opening.new !== occurrence.centre
    || !nominal.row.axisIntervalMm.every((edge, i) => edge === bay.basis.opening.old + (i === 0 ? -1 : 1) * occurrence.width / 2)) {
    throw new TypeError('The BCR Study shift does not connect the exact nominal and occupied openings')
  }

  const shiftEndpoints = ({ start, end }: BayReceipt['candidate']['chairTranslation']) => ({ start, end })
  const widthMm = widthFor(received, occurrence.width)
  const sameWidth = widthMm === occurrence.width
  const { e0 } = window
  const schedule = window.e2.map(profile => {
    const totalSetting = profile.openDryRelease - profile.nominalDryReleaseAfterSettings
    const seam = studyDrySeam(widthMm, e0.lining, e0.joint, totalSetting, profile, e0.frameWidth)
    return {
      id: profile.id, ...seam,
      fit: seam.retainedFrameClearanceEachJamb < 0 ? 'fixed-frame-conflict' : 'jamb-screen-only',
    } as const
  })
  const release = window.retainedControls.release
  const wallDatum = { coreFaceYMm: window.retainedControls.portalCore[1], ceilingZMm: window.retainedControls.existingCeiling }
  const weather = door.model.southCourtWeatherDoor
  const threshold = door.model.southCourtThresholdReference
  const { leafTask, panTask, geometryProof, temporaryWeatherLine } = threshold.maintainedState
  return {
    schema: 'renewable-opening-trial/1', state: 'candidate', units: 'mm', source: nominal.source,
    window: {
      receipt: { path: windowPath, sha256: windowHash, method: windowMethod, methodSha256: methodHash },
      wallDatum,
      opening: { id: nominal.row.openingId, hostId: nominal.row.hostWallId, nominalCentreMm: bay.basis.opening.old,
        occupiedCentreMm: occurrence.centre, nativeWidthMm: occurrence.width, widthMm },
      furnitureAccess: {
        receipt: { path: references.bay, sha256: window.sourceSha256.bay },
        turnReceiptSha256: window.sourceSha256.window,
        turnedChairReservation: bay.rejectedParkedState.chair,
        chairTranslation: shiftEndpoints(bay.candidate.chairTranslation),
        deskTranslation: shiftEndpoints(bay.candidate.deskTranslation),
      },
      fixedFrameWidthMm: e0.frameWidth, schedule,
      release: sameWidth
        ? { state: 'native-half-head-only', inwardStrokeMm: release.headDraw, pocketReserveMm: release.headPocketAfterTwo2 } as const
        : { state: 'withheld-for-width-change', code: 'NATIVE_HEAD_AND_HANDLING_NOT_RESIZED' } as const,
      withheld: ['arch head and glazing resize', 'installed fixing and weather qualification', 'complete window handling'],
    },
    door: {
      id: 'HAD/southCourtWeatherDoor',
      receipt: { path: doorPath, sha256: sha(doorBytes), method: 'project/had/studies/south-court-threshold.mjs', binding: waterBinding.digest },
      drawing: { path: doorDrawingPath, sha256: doorDrawingHash, svg: doorSvg.toString('utf8') },
      scope: threshold.status, roughWidthMm: weather.rough[1] - weather.rough[0],
      schedule: { leaves: threshold.retained.hinges.length, leafDimensionsMm: threshold.retained.leafEach,
        sillClearanceMm: threshold.primarySill.leafClearance, beyondOpenLeafMm: weather.clearBeyondOpenTip },
      release: {
        temporaryWeatherLine: temporaryWeatherLine.plan,
        leaves: { northStrokeMm: leafTask.firstTranslationNorth, turnDegrees: leafTask.turnDegrees, hingeToolStrokeMm: leafTask.hingeRelease.maximumToolStroke },
        pan: { northStrokeMm: panTask.pullNorth, bodyMm: panTask.wholeBodyMaximum, dryHandlingField: panTask.clearDrawPlan },
        geometryProof,
      },
    },
  } as const
}
