import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const repository = new URL('../../../', import.meta.url)
const studies = 'project/str/studies/'
const methodPath = studies + 'floor-portal-monolithic-drag.py'
const receiptPath = studies + 'floor-portal-monolithic-drag.json'
const geometryPath = studies + 'court_tie_starter_paths.py'
const id = 'STR-NORTH-FLOOR-COLLECTOR'

type Point = readonly [number, number]

interface NorthCollectorCase {
  readonly schema: 'str-north-collector-case/1'
  readonly planDigest: string
  readonly bindingDigest: string
  readonly collectorId: typeof id
  readonly portAxisXYMm: Point
  readonly dragDemandFactor: number
  readonly remoteMainBarShiftMm?: number
}

interface CollectorComparison {
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly retainedNWPort: {
    readonly referenceAxisXYmm: Point
    readonly axisXYmm: Point
    readonly axisUVAndDiameterMm: readonly [number, number, number]
    readonly gapToWidenedWallUMm: number
    readonly levels: readonly { readonly levelZMm: number; readonly minimumClearToFormedEdgeAfter5Mm: number }[]
    readonly admitted: false
  }
  readonly straightDrag: { readonly requiredBondLengthEachSideMm: number }
  readonly lateralClosure: {
    readonly ownerHistoricalForceKN: number
    readonly comparisonForceKN: number
    readonly dragDemandFactor: number
    readonly normalCompressionReturnKN: number
    readonly momentAboutUnchangedGroundAxisU0KNm: number
  }
  readonly rearCabinetPortTerritory: {
    readonly state: 'no-port-territory' | 'overlap-throughout-territory'
      | 'cover-shortfall-throughout-territory' | 'cannot-exclude-cover-by-this-bound'
    readonly centreBoundsUVmm: readonly [number, number, number, number]
    readonly barCount?: number
    readonly continuousUpperBoundGapMm?: number
  }
  readonly gravity: {
    readonly directBearingURangeMm: Point
    readonly records: readonly { readonly field: string; readonly wingReactionKN: number }[]
  }
  readonly stack: {
    readonly uprightScreenClearShared5Mm: { readonly primaryH20: number; readonly secondaryH12: number }
    readonly primaryPlacingComparisonMm: number
    readonly primaryPlacingComparisonMet: boolean
  }
  readonly groundSplice: {
    readonly remoteMainBarShiftMm: number
    readonly knownMainBarAxes: readonly {
      readonly id: string
      readonly legacyBlindBoreXYMm: Point
      readonly upperBarXYMm: Point
      readonly axisOffsetMm: number
    }[]
    readonly legacyBoreAlignment: {
      readonly comparisonBudgetMm: number
      readonly axesOutsideBudgetCount: number
      readonly maximumAxisOffsetMm: number
    }
    readonly footprint: {
      readonly legacyMetalMm2: number
      readonly widenedBodyMm2: number
      readonly uncoveredByLegacyMetalMm2: number
      readonly uncoveredByExtendedWebMm2: number
      readonly extendedWebOverhangMm2: number
    }
    readonly receivingPlan: readonly {
      readonly heads: readonly string[]
      readonly girders: readonly string[]
      readonly receivingLevelZMm: number
      readonly uncoveredWithSettingMm2: number
      readonly verticalGapToWebUndersideMm: number
      readonly verticalGapToBlockUndersideMm: number
    }[]
  }
}

interface NativeResult {
  readonly schema: 'str-north-collector-native-result/1'
  readonly comparison: CollectorComparison
  readonly drawingSvg: string
}

const bindingFor = (resolved: CurrentDesignResolution) =>
  resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')

function unavailable() {
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'unavailable' as const,
    diagnostics: [{
      code: 'NORTH_COLLECTOR_REQUIRES_CURRENT_STR',
      message: 'Bind the current structural grid, floor and foul route before comparing the collector.',
    }],
  }
}

function readBound(path: string, identities: Readonly<Record<string, string>>) {
  const bytes = readFileSync(new URL(path, repository))
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (blob !== identities[path]) throw new Error(`Stale or missing north collector binding at ${path}`)
  return { bytes, blob }
}

function readReference(binding: NonNullable<ReturnType<typeof bindingFor>>) {
  const { identities } = binding
  const method = readBound(methodPath, identities)
  const receipt = readBound(receiptPath, identities)
  const geometry = readBound(geometryPath, identities)
  const reference: CollectorComparison = JSON.parse(receipt.bytes.toString('utf8'))
  const inputs = Object.fromEntries(Object.entries(reference.sourceSHA256).map(([path, expected]) => {
    const source = readBound(path, identities)
    if (createHash('sha256').update(source.bytes).digest('hex') !== expected) {
      throw new Error(`Stale north collector receipt at ${path}`)
    }
    return [path, source.blob]
  }))
  return { reference, method, receipt, inputs: { ...inputs, [geometryPath]: geometry.blob } }
}

export function readNorthCollectorCase(resolved: CurrentDesignResolution) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const { reference } = readReference(binding)
  const collector: NorthCollectorCase = {
    schema: 'str-north-collector-case/1',
    planDigest: binding.applicability.planDigest,
    bindingDigest: binding.digest,
    collectorId: id,
    portAxisXYMm: reference.retainedNWPort.referenceAxisXYmm,
    dragDemandFactor: 1,
  }
  return { schema: 'str-north-collector-request/1' as const, design: resolved.design, collector }
}

function admitCase(value: unknown, binding: NonNullable<ReturnType<typeof bindingFor>>): NorthCollectorCase {
  const fields = ['schema', 'planDigest', 'bindingDigest', 'collectorId', 'portAxisXYMm', 'dragDemandFactor']
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || fields.some(field => !Object.hasOwn(value, field))
      || Object.keys(value).some(field => field !== 'remoteMainBarShiftMm' && !fields.includes(field))) {
    throw new Error('Expected an explicit versioned north collector case')
  }
  const trial = value as NorthCollectorCase
  if (trial.schema !== 'str-north-collector-case/1' || trial.collectorId !== id
      || trial.planDigest !== binding.applicability.planDigest || trial.bindingDigest !== binding.digest) {
    throw new Error('Stale or unsupported north collector binding')
  }
  if (!Array.isArray(trial.portAxisXYMm) || trial.portAxisXYMm.length !== 2 || !trial.portAxisXYMm.every(Number.isFinite)
      || !Number.isFinite(trial.dragDemandFactor) || trial.dragDemandFactor <= 0 || trial.dragDemandFactor > 1) {
    throw new Error('Use finite port XY coordinates and a positive demand factor at or below one')
  }
  const shift = trial.remoteMainBarShiftMm
  if (Object.hasOwn(trial, 'remoteMainBarShiftMm') && (typeof shift !== 'number' || !Number.isFinite(shift) || shift < 0 || shift > 20)) {
    throw new Error('Remote main bar shift must be between zero and 20 mm')
  }
  return trial
}

export function runNorthCollectorCase(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const trial = admitCase(value, binding)
  const { reference, method, receipt, inputs } = readReference(binding)
  const { portAxisXYMm, dragDemandFactor } = trial
  const remoteMainBarShiftMm = trial.remoteMainBarShiftMm ?? reference.groundSplice.remoteMainBarShiftMm
  const native: NativeResult = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(methodPath, repository)), fileURLToPath(repository), '--current-request',
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'str-north-collector-native-case/1', portAxisXYMm, dragDemandFactor, remoteMainBarShiftMm }),
  }))
  const { comparison, drawingSvg } = native
  const isReference = dragDemandFactor === 1
    && remoteMainBarShiftMm === reference.groundSplice.remoteMainBarShiftMm
    && portAxisXYMm.every((coordinate, index) => coordinate === reference.retainedNWPort.referenceAxisXYmm[index])
  if (native.schema !== 'str-north-collector-native-result/1'
      || comparison.lateralClosure.dragDemandFactor !== dragDemandFactor
      || comparison.groundSplice.remoteMainBarShiftMm !== remoteMainBarShiftMm
      || portAxisXYMm.some((coordinate, index) => coordinate !== comparison.retainedNWPort.axisXYmm[index])
      || (isReference && sha256SemanticFingerprint(comparison) !== sha256SemanticFingerprint(reference))) {
    throw new Error('The recomputed north collector does not match its source-bound case')
  }
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'computed-comparison' as const,
    source: { id: resolved.design.source.id, planDigest: trial.planDigest,
      caseDigest: sha256SemanticFingerprint({ ...trial, remoteMainBarShiftMm }) },
    method: { id, path: methodPath, blob: method.blob, receipt: { path: receiptPath, blob: receipt.blob }, inputs },
    comparison,
    drawingSvg,
    evidence: {
      state: isReference ? 'historical-demand-comparison' : 'trial-only',
      installedAcceptance: false as const,
      outstanding: ['Continuous chord and wall cage', 'Imperforate ground splice', 'Coupled signed 52-head replay', 'Usable foul route and renewal'],
    },
  }
}
