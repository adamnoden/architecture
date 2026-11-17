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
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== fields.length
      || fields.some(field => !Object.hasOwn(value, field))) throw new Error('Expected an explicit versioned north collector case')
  const trial = value as NorthCollectorCase
  if (trial.schema !== 'str-north-collector-case/1' || trial.collectorId !== id
      || trial.planDigest !== binding.applicability.planDigest || trial.bindingDigest !== binding.digest) {
    throw new Error('Stale or unsupported north collector binding')
  }
  if (!Array.isArray(trial.portAxisXYMm) || trial.portAxisXYMm.length !== 2 || !trial.portAxisXYMm.every(Number.isFinite)
      || !Number.isFinite(trial.dragDemandFactor) || trial.dragDemandFactor <= 0 || trial.dragDemandFactor > 1) {
    throw new Error('Use finite port XY coordinates and a positive demand factor at or below one')
  }
  return trial
}

export function runNorthCollectorCase(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable()
  const trial = admitCase(value, binding)
  const { reference, method, receipt, inputs } = readReference(binding)
  const { portAxisXYMm, dragDemandFactor } = trial
  const native: NativeResult = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(methodPath, repository)), fileURLToPath(repository), '--current-request',
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ schema: 'str-north-collector-native-case/1', portAxisXYMm, dragDemandFactor }),
  }))
  const { comparison, drawingSvg } = native
  const isReference = dragDemandFactor === 1
    && portAxisXYMm.every((coordinate, index) => coordinate === reference.retainedNWPort.referenceAxisXYmm[index])
  if (native.schema !== 'str-north-collector-native-result/1'
      || comparison.lateralClosure.dragDemandFactor !== dragDemandFactor
      || portAxisXYMm.some((coordinate, index) => coordinate !== comparison.retainedNWPort.axisXYmm[index])
      || (isReference && sha256SemanticFingerprint(comparison) !== sha256SemanticFingerprint(reference))) {
    throw new Error('The recomputed north collector does not match its source-bound case')
  }
  return {
    schema: 'str-north-collector-result/1' as const,
    status: 'computed-comparison' as const,
    source: { id: resolved.design.source.id, planDigest: trial.planDigest, caseDigest: sha256SemanticFingerprint(trial) },
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
