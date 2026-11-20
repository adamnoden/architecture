import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import {
  deriveSouthInletSillInsert, readSouthInletSillInsertInputs, sourceSouthInletSillInsertCase,
  southInletSillInsertInputPaths, southInletWindowId, type SillInsertGeometry,
} from '../../../project/had/studies/south-inlet-sill-insert-kernel.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createSectionPaperProjection } from '../../publication-drawing/projection.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { replaceSillWindPatch, type SillNativeWind } from './inlet-sill-wind.js'
import type { CurrentDesignResolution } from './resolve.js'

const methodPaths = [
  'project/had/studies/south-inlet-sill-insert-kernel.mjs',
  'project/had/studies/service-interface-geometry.mjs',
] as const
const receiptPath = 'project/had/studies/south-inlet-sill-insert.json'
const windReceiptPath = 'project/had/studies/south-inlet-sill-wind-source.json'
const windRunnerPath = 'project/had/studies/south-inlet-sill-wind-source.py'
const windInputPaths = [
  'project/str/studies/reconciled-corner-portals.py',
  'project/str/studies/reconciled-corner-portals.json',
  southInletSillInsertInputPaths.rewind,
] as const
type Calculation = ReturnType<typeof deriveSouthInletSillInsert>
type InsertCase = SillInsertGeometry & {
  readonly schema: 'had-inlet-sill-insert-case/1'
  readonly windowId: typeof southInletWindowId
  readonly planDigest: string
  readonly bindingDigest: string
}
type IssueCode = 'SLEEVE_APERTURE_MARGIN' | 'VENT_CLEARANCE' | 'PLANT_WET_CELL_PACKING' | 'EAST_STILE_MARGIN' |
  'STRUCTURAL_HOST_NOT_ADOPTED' | 'INSTALLATION_EVIDENCE_OUTSIDE_SCOPE'
type Diagnostic = { readonly code: IssueCode; readonly objectId: string; readonly message: string }

function readReference(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(item => item.id === 'had-inlet-south-sill-insert')
  if (!binding) throw new Error('South inlet sill insert requires the applicable HAD and STR source binding')
  const paths = [...new Set([...Object.values(southInletSillInsertInputPaths), ...methodPaths, receiptPath,
    windReceiptPath, windRunnerPath, ...windInputPaths])]
  const observed = new Map(paths.map(path => {
    const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
    const gitBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (gitBlob !== binding.identities[path]) throw new Error(`Stale south inlet sill insert source: ${path}`)
    return [path, { bytes, gitBlob }]
  }))
  const inputs = readSouthInletSillInsertInputs(path => JSON.parse(observed.get(path)!.bytes.toString('utf8')))
  const window = resolved.design.storeys.GROUND.openings.find(opening => opening.id === southInletWindowId)
  const { old: sourceCentre, new: candidateCentre, clear, side, sill } = inputs.window
  if (!window || window.kind !== 'window' || window.hostWallId !== `GROUND/${side}` ||
      window.centreMm !== sourceCentre || window.widthMm !== clear[1] - clear[0] ||
      candidateCentre !== (clear[0] + clear[1]) / 2) {
    throw new Error(`The STR rewind does not match the source occurrence ${southInletWindowId}`)
  }
  const offset = candidateCentre - sourceCentre
  const host = {
    id: window.id, wallId: window.hostWallId, acceptedCentreXMm: window.centreMm, nominalWidthMm: window.widthMm,
    acceptedClearXMm: [clear[0] - offset, clear[1] - offset] as const,
    candidateCentreXMm: window.centreMm + offset, candidateClearXMm: clear,
    candidateShiftXMm: offset, rawSillZMm: sill, candidateStatus: 'conditional-structural-rewind' as const,
  }
  const input: InsertCase = {
    schema: 'had-inlet-sill-insert-case/1', windowId: southInletWindowId,
    planDigest: binding.applicability.planDigest, bindingDigest: binding.digest,
    ...sourceSouthInletSillInsertCase(inputs),
  }
  const method = {
    id: 'HAD-SOUTH-INLET-SILL-INSERT/1',
    entries: methodPaths.map(path => ({ path, gitBlob: observed.get(path)!.gitBlob })),
    sources: Object.fromEntries([...observed].map(([path, file]) => [path, file.gitBlob])),
  }
  const wind = JSON.parse(observed.get(windReceiptPath)!.bytes.toString('utf8')) as SillNativeWind
  if (wind.schema !== 'had-south-inlet-sill-native-wind/1' || wind.windowId !== host.id ||
      windInputPaths.some(path => wind.sources[path] !== observed.get(path)?.gitBlob)) {
    throw new Error('The native ground wind projection does not match its source occurrence')
  }
  const windMethod = {
    id: 'HAD-SOUTH-SILL-WIND-REPLACEMENT/1', nativeMethod: wind.method,
    sourceReceipt: windReceiptPath, producer: windRunnerPath,
    sources: Object.fromEntries([windReceiptPath, windRunnerPath, ...windInputPaths].map(path => [path, observed.get(path)!.gitBlob])),
  }
  return { inputs, input, host, method, wind, windMethod, nativeReceipt: JSON.parse(observed.get(receiptPath)!.bytes.toString('utf8')) }
}

export function readInletSillInsertCase(resolved: CurrentDesignResolution) {
  return { schema: 'had-inlet-sill-insert-request/1' as const, design: resolved.design, insert: readReference(resolved).input }
}

function readTrial(input: unknown, reference: InsertCase): InsertCase {
  const keys = Object.keys(reference)
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== keys.length || keys.some(key => !Object.hasOwn(input, key))) {
    throw new Error('Expected a versioned south inlet sill insert case')
  }
  const trial = input as InsertCase
  if (trial.schema !== reference.schema || trial.windowId !== reference.windowId) {
    throw new Error('The south inlet sill insert requires the bound utility window occurrence')
  }
  if (trial.planDigest !== reference.planDigest || trial.bindingDigest !== reference.bindingDigest) {
    throw new Error('Stale south inlet sill insert source binding')
  }
  if (!Number.isFinite(trial.eastEdgeMm) || Math.abs(trial.eastEdgeMm - reference.eastEdgeMm) > 10 ||
      !Number.isFinite(trial.headZMm) || trial.headZMm > reference.headZMm || trial.headZMm < reference.headZMm - 100 ||
      !Number.isFinite(trial.plantPressureAxisXMm) || Math.abs(trial.plantPressureAxisXMm - reference.plantPressureAxisXMm) > 10) {
    throw new Error('South inlet sill geometry exceeds the screened edge, head or pressure-axis range')
  }
  return trial
}

function screen(calc: Calculation): Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  for (const bore of calc.bores) {
    const margin = Math.min(...Object.values(bore.apertureAfter10))
    if (margin < 5) diagnostics.push({ code: 'SLEEVE_APERTURE_MARGIN', objectId: bore.id,
      message: `The receiving aperture leaves ${margin} mm after setting against the 5 mm source comparison.` })
  }
  for (const [index, vent] of calc.vents.entries()) {
    const margin = Math.min(...Object.values(vent.apertureAfter5), vent.mainBoreReserveAfter5MM)
    if (margin < 9 || vent.freeCoreAboveWetStageGrossMM <= 0) diagnostics.push({
      code: 'VENT_CLEARANCE', objectId: index === 0 ? 'utility-vent' : 'plant-vent',
      message: `The vent has ${margin} mm formed clearance against the 9 mm source comparison and ${vent.freeCoreAboveWetStageGrossMM} mm above the static wet-stage screen.`,
    })
  }
  if (calc.plantWetCellPackingAfterSettingMm < 5) diagnostics.push({
    code: 'PLANT_WET_CELL_PACKING', objectId: 'plant-pressure',
    message: `The fixed wet cell leaves ${calc.plantWetCellPackingAfterSettingMm} mm after liner and setting against the 5 mm source comparison.`,
  })
  if (calc.loads.eastStile.afterTwo2MMSettingsFrameWidthReserveMM < 0) diagnostics.push({
    code: 'EAST_STILE_MARGIN', objectId: 'east-stile',
    message: 'The trial east stile and its two setting allowances exceed the remaining frame strip.',
  })
  return diagnostics
}

function elevation(calc: Calculation, host: ReturnType<typeof readReference>['host'], caseDigest: string,
  wind: ReturnType<typeof replaceSillWindPatch>): DrawingSceneV2 {
  const scaleDenominator = 10
  const west = Math.min(calc.jambAndSill.jambs[0][0], host.acceptedClearXMm[0])
  const east = Math.max(calc.jambAndSill.jambs[1][1], host.acceptedClearXMm[1])
  const top = host.rawSillZMm + 130
  const project = createSectionPaperProjection({ scaleDenominator,
    horizontalBounds: { min: west, max: east }, verticalBounds: { min: 0, max: top }, paperOrigin: { x: 12, y: 12 } })
  const primitives: DrawingSceneV2['primitives'] = []
  const rect = (id: string, [left, right]: readonly [number, number], [base, cap]: readonly [number, number],
    stroke: 'cut' | 'profile' | 'secondary', dash?: 'provisional') => primitives.push({
    kind: 'rect', id, ...project.point(left, cap), width: project.length(right - left),
    height: project.length(cap - base), stroke, dash, metadata: { caseDigest, xMinMm: left, xMaxMm: right, zMinMm: base, zMaxMm: cap },
  })
  rect('accepted-window-sill', host.acceptedClearXMm, [host.rawSillZMm, top], 'secondary', 'provisional')
  rect('candidate-window-sill', host.candidateClearXMm, [host.rawSillZMm, top], 'profile')
  for (const [index, jamb] of calc.jambAndSill.jambs.entries()) rect(`candidate-jamb-${index}`, jamb, [0, top], 'secondary')
  rect('candidate-insert-aperture', calc.opening.x, calc.opening.z, 'cut')
  const { centreXMm, centreZMm, forceKN } = wind.removedPatch
  const centre = project.point(centreXMm, centreZMm)
  primitives.push({ kind: 'line', id: 'insert-wind-resultant', role: 'primary',
    a: { x: centre.x - 2, y: centre.y }, b: { x: centre.x + 2, y: centre.y },
    metadata: { caseDigest, centreXMm, centreZMm, forceKN },
  })
  for (const cell of calc.retainedInsideCellBoundaries) {
    const [left, right] = cell.wetBoxX
    primitives.push({
      kind: 'line', id: `${cell.id}-retained-trough-lip`, role: 'secondary',
      a: project.point(left, cell.retainedTroughLipZ), b: project.point(right, cell.retainedTroughLipZ),
      metadata: { caseDigest, zMm: cell.retainedTroughLipZ },
    })
  }
  const circles = [
    ...calc.bores.map(bore => ({ id: bore.id, axis: bore.axis, radius: bore.formedReserveODMM / 2 })),
    ...calc.vents.map((vent, index) => ({ id: index === 0 ? 'utility-vent' : 'plant-vent', axis: vent.axis, radius: vent.outerDiameterMM / 2 })),
  ]
  for (const { id, axis: [, [x, , z]], radius } of circles) {
    const ring = Array.from({ length: 24 }, (_, i) => {
      const angle = i * Math.PI / 12
      return project.point(x + radius * Math.cos(angle), z + radius * Math.sin(angle))
    })
    primitives.push({ kind: 'path', id, rings: [ring], stroke: 'primary', metadata: { caseDigest, xMm: x, zMm: z, diameterMm: 2 * radius } })
  }
  return {
    viewId: 'HAD-SOUTH-INLET-SILL-INSERT', sourceId: host.id, title: 'South utility sill insert',
    description: 'Inside wall elevation. The dashed span projects the accepted plan at the candidate sill datum. The solid span follows the conditional STR rewind.',
    scaleDenominator, widthMm: 24 + project.length(east - west), heightMm: 24 + project.length(top), primitives,
  }
}

export function runInletSillInsertCase(resolved: CurrentDesignResolution, input: unknown) {
  const reference = readReference(resolved)
  const trial = readTrial(input, reference.input)
  const calc = deriveSouthInletSillInsert(reference.inputs, trial)
  const caseDigest = sha256SemanticFingerprint(trial)
  const nativeReplay = caseDigest === sha256SemanticFingerprint(reference.input)
  if (nativeReplay) {
    const { disposition, sources, ...nativeGeometry } = reference.nativeReceipt
    if (sha256SemanticFingerprint(nativeGeometry) !== sha256SemanticFingerprint(calc)) {
      throw new Error('The current sill insert calculation differs from its bound native result')
    }
  }
  const { jambs, rawSillZ } = calc.jambAndSill
  const wind = replaceSillWindPatch(reference.wind, calc.opening, calc.frame.bearingAxesX, rawSillZ,
    [jambs[0][0], jambs[1][1]])
  const failures = screen(calc)
  const diagnostics: Diagnostic[] = [
    ...failures,
    { code: 'STRUCTURAL_HOST_NOT_ADOPTED', objectId: trial.windowId,
      message: 'This insert relies on the conditional 300 mm STR window rewind. The accepted layout does not adopt it.' },
    { code: 'INSTALLATION_EVIDENCE_OUTSIDE_SCOPE', objectId: trial.windowId,
      message: 'The comparison leaves arch and jamb restraint, wet-cell closure and handling, fixings, product and site hydraulic proof open.' },
  ]
  return {
    schema: 'had-inlet-sill-insert-result/1' as const,
    status: failures.length ? 'blocked-screened-clearance' as const : 'within-conditional-screen' as const,
    source: { planDigest: trial.planDigest, bindingDigest: trial.bindingDigest, caseDigest, nativeReplay },
    host: reference.host, method: reference.method, calculation: calc, diagnostics,
    windPressure: { method: reference.windMethod, ...wind },
    drawing: elevation(calc, reference.host, caseDigest, wind),
    evidence: nativeReplay ? 'bound-comparison-only' as const : 'withheld-for-edited-insert' as const,
  }
}
