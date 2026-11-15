import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const execute = promisify(execFile)
const root = new URL('../../../', import.meta.url)
const studies = 'project/str/studies/'
const methods = {
  'north-floor-collar': { file: 'floor-portal-north-collar', comparison: 'stdout', sourceKey: 'sourceHashes',
    extra: [studies + 'court_tie_starter_paths.py'] },
  'north-roof-shoe': { file: 'floor-portal-north-roof-shoe', comparison: 'stdout', sourceKey: 'sourceSHA256', extra: [] },
  'outward-arch-widths': { file: 'current-house-outward-arches', comparison: 'check', sourceKey: 'sources',
    extra: ['project/had/studies/water-replan.json', studies + 'current-house-arch-jambs.json',
      'project/oas/studies/north-export-occurrence.json'] },
  'roof-action-route': { file: 'current-house-roof-route', comparison: 'check', sourceKey: 'sources', extra: [] },
  'roof-stiffness': { file: 'current-house-roof-stiffness', comparison: 'check', sourceKey: null,
    extra: [studies + 'current-house-roof-route.py', studies + 'current-house-roof-route.json'] },
  'floor-membrane': { file: 'current-house-membrane-reactions', comparison: 'check', sourceKey: null,
    extra: [studies + 'current-house-roof-bracing.py', studies + 'current-house-membrane.py', studies + 'current-house-floor-closure.json'] },
  'floor-stops': { file: 'current-house-floor-stops', comparison: 'check', sourceKey: null,
    extra: [studies + 'current-house-joined-foundation.py', studies + 'current-house-joined-foundation.json', studies + 'current-house-floor-closure.py'] },
  'wall-load-transfers': { file: 'current-house-wall-transfers', comparison: 'check', sourceKey: null,
    extra: ['project/had/studies/water-replan.json', studies + 'open-loggia-support.json'] },
  'north-cap-layer': { file: 'floor-portal-north-cap-layer', comparison: 'stdout', sourceKey: 'sourceHashes', extra: [] },
  'north-floor-cage': { file: 'floor-portal-north-cage', comparison: 'stdout', sourceKey: 'sourceHashes', extra: [] },
} as const
type InterfaceId = keyof typeof methods

interface ReceiptSources {
  readonly sourceHashes?: Readonly<Record<string, string>>
  readonly sourceSHA256?: Readonly<Record<string, string>>
  readonly sources?: Readonly<Record<string, string>>
}
interface CollarReceipt extends ReceiptSources {
  readonly scope: string
  readonly cornerCandidate: {
    readonly sameExistingSoffitOrdinarySlabTopAndCollarTopZmm: readonly [number, number, number]
    readonly nominalCollarAndActuallyCommonContactDepthMm: readonly [number, number]
    readonly residualServiceHeightUnder15FinishMm: number
    readonly allNearestApertures: Readonly<Record<string, {
      readonly nearestWindow: string
      readonly nearestRawPlanReserveMm: number
    }>>
  }
  readonly bendShoulderGeometry: { readonly lowerUpperSteelCoverAfter5SettingMm: readonly [number, number] }
}
interface ShoeReceipt extends ReceiptSources {
  readonly axisAndIndependentLoadPaths: {
    readonly roofSeatXYmm: readonly (readonly [number, number])[]
    readonly explicitLoadsSeparate: true
  }
  readonly movementAndEnvelope: {
    readonly ordinaryMovingSlotXandZFreeDimensionsMm: readonly [number, number]
    readonly pinDiameterMm: number
    readonly residualBeyondHardwareAfterSettingsMm: number
    readonly worstOnFaceResidualXAtFullVerticalEccentricityMm: number
  }
  readonly throughBandFerrules: { readonly positiveRodAxesXYmm: readonly (readonly [number, number])[] }
}
interface ArchReceipt extends ReceiptSources {
  readonly role: string
  readonly admitted: false
  readonly controls: readonly {
    readonly geometry: {
      readonly normalWidthNominal: number
      readonly remainingOrdinaryGlass: number
      readonly parallelBarClearAfterTwo5: number
      readonly drainedCavity: number
    }
    readonly coupled: readonly {
      readonly memberWindowRecoveries: number
      readonly maximumSameStateActions: { readonly adverseRatio: readonly number[] }
    }[]
  }[]
}

const bindingFor = (resolved: CurrentDesignResolution) =>
  resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
const sourceFor = (resolved: CurrentDesignResolution) =>
  ({ id: resolved.design.source.id, planDigest: sha256SemanticFingerprint(resolved.design) })
const unavailable = (resolved: CurrentDesignResolution, code: string, message: string) =>
  ({ schema: 'str-interface-result/1' as const, status: 'unavailable' as const, source: sourceFor(resolved),
    diagnostics: [{ code, message }] })

export function readStructuralInterfaces(resolved: CurrentDesignResolution) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable(resolved, 'STR_INTERFACES_REQUIRE_CURRENT_PLAN', 'No matching STR source binding.')
  return {
    schema: 'str-interface-request/1' as const,
    design: resolved.design,
    replay: { schema: 'str-interface-replay/1' as const, planDigest: binding.applicability.planDigest,
      bindingDigest: binding.digest, interfaces: Object.keys(methods) },
  }
}

function readBoundFile(path: string, identities: Readonly<Record<string, string>>) {
  const fileUrl = new URL(path, root)
  const bytes = readFileSync(fileUrl)
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (identities[path] !== blob) throw new Error(`Stale or missing structural interface binding at ${path}`)
  return { path, url: fileUrl, bytes, blob }
}

function comparisonGeometry(id: InterfaceId, result: ReceiptSources) {
  if (id === 'north-floor-collar') {
    const collar = result as CollarReceipt
    const { cornerCandidate, bendShoulderGeometry } = collar
    return {
      id, slabAndCollarZMm: cornerCandidate.sameExistingSoffitOrdinarySlabTopAndCollarTopZmm,
      thicknessAndOverlapMm: cornerCandidate.nominalCollarAndActuallyCommonContactDepthMm,
      finishReserveMm: cornerCandidate.residualServiceHeightUnder15FinishMm,
      minimumWindowReserveMm: Math.min(...Object.values(cornerCandidate.allNearestApertures).map(row => row.nearestRawPlanReserveMm)),
      coverAfterSettingMm: bendShoulderGeometry.lowerUpperSteelCoverAfter5SettingMm,
      remaining: collar.scope,
    }
  }
  if (id === 'north-roof-shoe') {
    const { axisAndIndependentLoadPaths, movementAndEnvelope, throughBandFerrules } = result as ShoeReceipt
    return {
      id, seatsXYMm: axisAndIndependentLoadPaths.roofSeatXYmm,
      rodAxesXYMm: throughBandFerrules.positiveRodAxesXYmm,
      slotXZMm: movementAndEnvelope.ordinaryMovingSlotXandZFreeDimensionsMm,
      pinDiameterMm: movementAndEnvelope.pinDiameterMm,
      strokeReserveMm: movementAndEnvelope.worstOnFaceResidualXAtFullVerticalEccentricityMm,
      hardwareReserveMm: movementAndEnvelope.residualBeyondHardwareAfterSettingsMm,
      remaining: 'The independent gravity, normal and uplift paths require the joined stiffness and signed load replay.',
    }
  }
  if (id !== 'outward-arch-widths') return { id, native: result }
  const arch = result as ArchReceipt
  return {
    id, controls: arch.controls.map(({ geometry, coupled }) => ({
      widthMm: geometry.normalWidthNominal, residualInsulationMm: geometry.remainingOrdinaryGlass,
      cavityMm: geometry.drainedCavity, placingMm: geometry.parallelBarClearAfterTwo5,
      memberRecoveries: coupled.reduce((total, row) => total + row.memberWindowRecoveries, 0),
      largestAdverseRatio: Math.max(...coupled.flatMap(row => row.maximumSameStateActions.adverseRatio)),
    })), remaining: arch.role,
  }
}

async function verifyInterface(id: InterfaceId, identities: Readonly<Record<string, string>>) {
  const spec = methods[id]
  const method = readBoundFile(studies + spec.file + '.py', identities)
  const receipt = readBoundFile(studies + spec.file + '.json', identities)
  const report = JSON.parse(receipt.bytes.toString('utf8')) as ReceiptSources
  const sources = spec.sourceKey === null ? undefined : report[spec.sourceKey]
  if (spec.sourceKey !== null && (!sources || !Object.keys(sources).length)) throw new Error(`Missing source list for ${id}`)
  const inputs = Object.fromEntries([
    ...Object.entries(sources ?? {}).map(([name, digest]) => {
      const path = name.includes('/') ? name : studies + name
      const source = readBoundFile(path, identities)
      if (createHash('sha256').update(source.bytes).digest('hex') !== digest) {
        throw new Error(`The structural interface receipt is stale at ${path}`)
      }
      return [path, source.blob] as const
    }),
    ...spec.extra.map(path => [path, readBoundFile(path, identities).blob] as const),
  ])
  const { stdout } = await execute('python3', [
    '-B', fileURLToPath(method.url), spec.comparison === 'check' ? '--check' : fileURLToPath(root),
  ], { encoding: 'utf8' })
  if (spec.comparison === 'stdout' && stdout !== receipt.bytes.toString('utf8')) {
    throw new Error(`The recomputed structural interface differs from its retained receipt at ${receipt.path}`)
  }
  return {
    geometry: comparisonGeometry(id, report),
    method: { path: method.path, blob: method.blob }, receipt: { path: receipt.path, blob: receipt.blob },
    inputs, installedAcceptance: false as const,
  }
}

export async function runStructuralInterfaces(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindingFor(resolved)
  if (!binding) return unavailable(resolved, 'STR_INTERFACES_REQUIRE_CURRENT_PLAN', 'No matching STR source binding.')
  if (!value || typeof value !== 'object' || Object.keys(value).length !== 4 ||
    !('schema' in value) || value.schema !== 'str-interface-replay/1' ||
    !('planDigest' in value) || value.planDigest !== binding.applicability.planDigest ||
    !('bindingDigest' in value) || value.bindingDigest !== binding.digest) {
    return unavailable(resolved, 'STR_INTERFACES_STALE_BINDING', 'The request does not match the current STR source.')
  }
  if (!('interfaces' in value) || !Array.isArray(value.interfaces) || !value.interfaces.length ||
    new Set(value.interfaces).size !== value.interfaces.length ||
    value.interfaces.some(id => typeof id !== 'string' || !Object.hasOwn(methods, id))) {
    return unavailable(resolved, 'STR_INTERFACE_UNSUPPORTED', 'Choose supported interface identities from the current replay request.')
  }
  return {
    schema: 'str-interface-result/1' as const, status: 'recomputed-comparisons' as const,
    source: sourceFor(resolved),
    interfaces: await Promise.all((value.interfaces as InterfaceId[]).map(id => verifyInterface(id, binding.identities))),
  }
}
