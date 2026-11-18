import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import { readBoundOccupiedServices } from './occupied-services.js'
import type { CurrentDesignResolution } from './resolve.js'

const repository = new URL('../../../', import.meta.url)
const methodPath = 'project/mat/studies/rear-wc-west-roof-interface.py'
const receiptPath = 'project/mat/studies/rear-wc-west-roof-interface.json'
const occupiedSchedulePath = 'project/had/studies/current-house-services.json'
const id = 'MAT-REAR-FOUL-VENT'

type Point = readonly [number, number]
type SpatialPoint = readonly [number, number, number]
interface VentParameters {
  readonly riserAxisXYMm: Point
  readonly wetStackAirTakeoffZMm: number
  readonly terminalZMm: number
}

interface VentCase extends VentParameters {
  readonly schema: 'mat-rear-foul-vent-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly routeId: typeof id
  readonly buriedReceiving?: BuriedReceivingCase
}

interface BuriedReceivingCase {
  readonly hostAxisXYZMm: SpatialPoint
  readonly stackGradeZMm: number
  readonly hostGradeZMm: number
}

interface ModelledOpening {
  readonly id: string
  readonly kind: string
  readonly wall: string
  readonly xyBoundsMm: readonly [Point, Point]
  readonly topZMm: number | null
  readonly axisDistanceMm: number
  readonly comparisonDistanceMm: number
}

interface NearbyOpening extends ModelledOpening {
  readonly heightReserveMm: number | null
}

interface UnresolvedTerminalDuty {
  readonly state: 'unresolved'
  readonly remaining: string
}

interface VentTerminalApplicability {
  readonly modelledOpenings: {
    readonly scope: string
    readonly guidance: string
    readonly guidanceUrl: string
    readonly state: 'passes' | 'fails' | 'unresolved'
    readonly horizontalCutoffMm: number
    readonly minimumHeightAboveOpeningMm: number
    readonly terminalPlanRadiusAllowanceMm: number
    readonly inventoryCount: number
    readonly nearby: readonly NearbyOpening[]
    readonly governingKnownOpening: NearbyOpening | null
    readonly nearbyOpeningsWithoutHeight: readonly string[]
    readonly nearestModelledAirIntake: ModelledOpening | null
  }
  readonly roofBoundary: UnresolvedTerminalDuty & {
    readonly maximumNominalRoofCoverAtFlashingZMm: number
    readonly terminalRiseAboveNominalRoofCoverMm: number
  }
  readonly siteOpenings: UnresolvedTerminalDuty
  readonly terminalCover: UnresolvedTerminalDuty
  readonly otherBuildingVentilation: UnresolvedTerminalDuty
}

interface VentComparison {
  readonly case: VentParameters
  readonly state: 'bounded-dry-return-comparison' | 'geometric-failure'
  readonly installedAcceptance: false
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly wet: {
    readonly stackAxisXYMm: Point
    readonly junctionLevelsZMm: Point
    readonly upperWC: unknown
    readonly lowerShower: unknown
  }
  readonly clearanceMm: Readonly<Record<string, number>>
  readonly failedChecks: readonly string[]
  readonly terminalApplicability: VentTerminalApplicability
  readonly cornersXYZmm?: readonly SpatialPoint[]
  readonly roundedCentrelineXYZmm?: readonly SpatialPoint[]
  readonly formedWallCentreXYZmm?: SpatialPoint
  readonly hostAndRenewalUnresolved?: readonly string[]
}

interface StudyReceipt {
  readonly dryReturnComparison: { readonly lowObliqueReturn: VentComparison }
  readonly existingStackXYmm: Point
  readonly independentFoul: {
    readonly previousConditionalHostXYZmm: SpatialPoint
    readonly trialGradeZmm: number
    readonly trialCoverMM: number
    readonly maximumUpstreamAxisZmm: number
    readonly minimumDirectPlanLengthMM: number
    readonly minimumDropAt1In40MM: number
    readonly minimumPipeEnvelopeToWestGirderPlanMM: number
  }
}

interface NativeResult {
  readonly schema: 'mat-rear-foul-vent-native-result/1'
  readonly comparison: VentComparison
}

function bindingsFor(resolved: CurrentDesignResolution) {
  const structure = resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  const occupied = resolved.disciplineBindings.find(binding => binding.id === 'had-occupied-services')
  if (!structure || !occupied) return undefined
  return {
    planDigest: structure.applicability.planDigest,
    digest: sha256SemanticFingerprint({ structure: structure.digest, occupied: occupied.digest }),
    identities: { ...structure.identities, ...occupied.identities },
    occupied,
  }
}
type Bindings = NonNullable<ReturnType<typeof bindingsFor>>

function unavailable() {
  return {
    schema: 'mat-rear-foul-vent-result/1' as const,
    status: 'unavailable' as const,
    diagnostics: [{
      code: 'REAR_FOUL_VENT_REQUIRES_CURRENT_HOUSE',
      message: 'The rear foul vent case requires the current occupied services and structural roof sources.',
    }],
  }
}

function readBound(path: string, identities: Readonly<Record<string, string>>) {
  const bytes = readFileSync(new URL(path, repository))
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (blob !== identities[path]) throw new Error(`Stale or missing rear foul vent source binding at ${path}`)
  return { bytes, blob }
}

function readReference(binding: Bindings) {
  const method = readBound(methodPath, binding.identities)
  const receipt = readBound(receiptPath, binding.identities)
  const decoded: StudyReceipt = JSON.parse(receipt.bytes.toString('utf8'))
  const reference = decoded.dryReturnComparison.lowObliqueReturn
  const sourceBlobs = Object.fromEntries(Object.entries(reference.sourceSHA256).map(([path, expected]) => {
    const source = readBound(path, binding.identities)
    if (createHash('sha256').update(source.bytes).digest('hex') !== expected) {
      throw new Error(`Stale rear foul vent receipt source at ${path}`)
    }
    return [path, source.blob]
  }))
  return { method, receipt, reference, sourceBlobs, receivingReference: decoded }
}

export function readRearFoulVentCase(resolved: CurrentDesignResolution) {
  const binding = bindingsFor(resolved)
  if (!binding) return unavailable()
  const { reference } = readReference(binding)
  const vent: VentCase = {
    schema: 'mat-rear-foul-vent-case/1', routeId: id,
    planDigest: binding.planDigest, bindingDigest: binding.digest, ...reference.case,
  }
  return { schema: 'mat-rear-foul-vent-request/1' as const, design: resolved.design, vent }
}

function admitCase(value: unknown, binding: Bindings): VentCase {
  const keys = ['schema', 'planDigest', 'bindingDigest', 'routeId', 'riserAxisXYMm', 'wetStackAirTakeoffZMm', 'terminalZMm']
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).some(key => key !== 'buriedReceiving' && !keys.includes(key))
      || keys.some(key => !Object.hasOwn(value, key))) throw new Error('Expected an explicit versioned rear foul vent case')
  const trial = value as VentCase
  if (trial.schema !== 'mat-rear-foul-vent-case/1' || trial.routeId !== id
      || trial.planDigest !== binding.planDigest || trial.bindingDigest !== binding.digest) {
    throw new Error('Stale or unsupported rear foul vent source binding')
  }
  if (!Array.isArray(trial.riserAxisXYMm) || trial.riserAxisXYMm.length !== 2
      || !trial.riserAxisXYMm.every(Number.isFinite)
      || !Number.isFinite(trial.wetStackAirTakeoffZMm) || !Number.isFinite(trial.terminalZMm)) {
    throw new Error('Use finite riser coordinates and levels in millimetres')
  }
  if (Object.hasOwn(trial, 'buriedReceiving')) {
    const receiving = trial.buriedReceiving
    if (!receiving || typeof receiving !== 'object' || Array.isArray(receiving)
        || Object.keys(receiving).length !== 3 || !Array.isArray(receiving.hostAxisXYZMm)
        || receiving.hostAxisXYZMm.length !== 3 || !receiving.hostAxisXYZMm.every(Number.isFinite)
        || !Number.isFinite(receiving.stackGradeZMm) || !Number.isFinite(receiving.hostGradeZMm)) {
      throw new Error('Use a buried receiving host axis and two finite grade levels in millimetres')
    }
  }
  return trial
}

function compareBuriedReceiving(reference: StudyReceipt, trial?: BuriedReceivingCase) {
  const { independentFoul: basis, existingStackXYmm: stack } = reference
  const { hostAxisXYZMm: host, stackGradeZMm, hostGradeZMm } = trial ?? {
    hostAxisXYZMm: basis.previousConditionalHostXYZmm,
    stackGradeZMm: basis.trialGradeZmm, hostGradeZMm: basis.trialGradeZmm,
  }
  const [hostX, hostY, hostZ] = host
  const [stackX, stackY] = stack
  const lengthMm = Math.hypot(hostX - stackX, hostY - stackY)
  if (!Number.isFinite(lengthMm) || lengthMm <= 0) throw new Error('Use a finite nonzero west foul receiving run')
  const fall = basis.minimumDropAt1In40MM / basis.minimumDirectPlanLengthMM
  const radiusMm = basis.trialGradeZmm - basis.trialCoverMM - basis.maximumUpstreamAxisZmm
  const dropMm = lengthMm * fall
  const stackAxisZMm = hostZ + dropMm
  const stackCoverMm = stackGradeZMm - stackAxisZMm - radiusMm
  const hostCoverMm = hostGradeZMm - hostZ - radiusMm
  const westGirderClearanceMm = basis.minimumPipeEnvelopeToWestGirderPlanMM + stackX - Math.max(stackX, hostX)
  const maxHostAxisZMm = Math.min(stackGradeZMm - radiusMm - basis.trialCoverMM - dropMm,
    hostGradeZMm - radiusMm - basis.trialCoverMM)
  if (![dropMm, stackAxisZMm, stackCoverMm, hostCoverMm, westGirderClearanceMm, maxHostAxisZMm].every(Number.isFinite)) {
    throw new Error('West foul receiving geometry exceeds the finite comparison range')
  }
  const failedChecks = [
    ...(hostZ > maxHostAxisZMm ? ['MINIMUM_CROWN_COVER'] : []),
    ...(westGirderClearanceMm < 0 ? ['WEST_GIRDER_PLAN_CLEARANCE'] : []),
  ]
  return {
    state: failedChecks.length ? 'geometric-failure' : 'bounded-direct-run-comparison',
    stackAxisXYZMm: [stackX, stackY, stackAxisZMm], hostAxisXYZMm: host,
    gradient: fall, planLengthMm: lengthMm, fallMm: dropMm,
    stackGradeZMm, hostGradeZMm, pipeEnvelopeDiameterMm: radiusMm * 2,
    requiredCoverMm: basis.trialCoverMM, stackCoverMm, hostCoverMm,
    maximumHostAxisZMm: maxHostAxisZMm, westGirderClearanceMm, failedChecks,
    installedAcceptance: false as const,
    scope: 'Straight minimum-fall axis and linear grade between endpoints. Site profile, fittings, support, inspection, hydraulic and lawful receiving duties remain open.',
  }
}

function planDrawing(comparison: VentComparison, caseDigest: string): DrawingSceneV2 | undefined {
  const route = comparison.roundedCentrelineXYZmm
  const wall = comparison.formedWallCentreXYZmm
  if (!route || !wall) return undefined
  const points = route.map(([x, y]) => [x, y] as const)
  const xMin = Math.min(...points.map(p => p[0]))-125
  const xMax = Math.max(...points.map(p => p[0]))+125
  const yMin = Math.min(...points.map(p => p[1]))-125
  const yMax = Math.max(...points.map(p => p[1]))+125
  const scaleDenominator = 10
  const paper = createPlanPaperProjection({
    scaleDenominator, modelBounds: { x: xMin, y: yMin, width: xMax-xMin, height: yMax-yMin },
    paperOrigin: { x: 12, y: 22 },
  })
  const primitives: DrawingSceneV2['primitives'] = [
    { kind: 'text', id: 'case', x: 12, y: 10, role: 'label',
      value: comparison.state === 'geometric-failure' ? 'Rear foul vent · rejected geometry' : 'Rear foul vent · low dry return comparison' },
    { kind: 'line', id: 'exterior-face', role: 'secondary', a: paper.point(0, yMin), b: paper.point(0, yMax) },
  ]
  for (const [i, point] of points.entries()) {
    if (!i || point.every((coordinate, index) => coordinate === points[i-1][index])) continue
    primitives.push({ kind: 'line', id: `vent-${i}`, role: 'primary',
      a: paper.point(...points[i-1]), b: paper.point(...point), metadata: { caseDigest } })
  }
  primitives.push({ kind: 'text', id: 'levels', x: 12, y: 29+paper.length(yMax-yMin), role: 'note',
    value: `West wall Y${wall[1].toFixed(1)} / Z${wall[2].toFixed(1)} · open termination Z${comparison.case.terminalZMm} mm` })
  return {
    title: 'Rear foul vent plan comparison', viewId: 'MAT-REAR-FOUL-VENT-PLAN', sourceId: id,
    description: 'Modelled dry connection from the retained exterior wet stack to the rear-bath roof riser.',
    scaleDenominator, widthMm: 24+paper.length(xMax-xMin), heightMm: 39+paper.length(yMax-yMin), primitives,
  }
}

export function runRearFoulVentCase(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindingsFor(resolved)
  if (!binding) return unavailable()
  const trial = admitCase(value, binding)
  const { method, receipt, reference, sourceBlobs, receivingReference } = readReference(binding)
  const buriedReceiving = compareBuriedReceiving(receivingReference, trial.buriedReceiving)
  const { house } = readBoundOccupiedServices(resolved)
  const occupied = { model: house.model }
  const { riserAxisXYMm, wetStackAirTakeoffZMm, terminalZMm } = trial
  const vent: VentParameters = { riserAxisXYMm, wetStackAirTakeoffZMm, terminalZMm }
  const native: NativeResult = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(methodPath, repository)), fileURLToPath(repository), '--current-request',
  ], {
    encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'mat-rear-foul-vent-native-case/1', vent, occupied }),
  }))
  const { comparison } = native
  const trialIdentity = sha256SemanticFingerprint(vent)
  const isReference = trialIdentity === sha256SemanticFingerprint(reference.case)
  if (native.schema !== 'mat-rear-foul-vent-native-result/1'
      || trialIdentity !== sha256SemanticFingerprint(comparison.case)
      || sha256SemanticFingerprint(comparison.sourceSHA256) !== sha256SemanticFingerprint(reference.sourceSHA256)
      || (isReference && sha256SemanticFingerprint(reference) !== sha256SemanticFingerprint(comparison))) {
    throw new Error('The rear foul vent comparison does not match its source-bound case')
  }
  const caseDigest = sha256SemanticFingerprint(trial)
  return {
    schema: 'mat-rear-foul-vent-result/1' as const,
    status: 'computed-comparison' as const,
    source: { planDigest: binding.planDigest, bindingDigest: binding.digest, caseDigest },
    method: {
      id, path: methodPath, blob: method.blob, receipt: { path: receiptPath, blob: receipt.blob },
      inputs: { ...sourceBlobs, ...binding.occupied.inputReceiptIdentities },
      occupiedScheduleBlob: sourceBlobs[occupiedSchedulePath],
    },
    comparison,
    buriedReceiving,
    drawing: planDrawing(comparison, caseDigest),
  }
}
