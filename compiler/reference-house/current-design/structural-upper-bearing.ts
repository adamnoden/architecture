import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { savedMasonryFrameCase } from './structural-masonry-frame.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/upper_roof_bearing.py'
const adapterPath = 'compiler/reference-house/current-design/structural-upper-bearing.ts'
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const six = (v: unknown): v is number[] => Array.isArray(v) && v.length === 6 && v.every(finite)
export const upperRoofBearingStageFields = ['seats', 'masonryUnitWeightKNPerM3', 'masonryModulusMPa',
  'jointNormalComplianceMmPerMPa', 'padThicknessMm', 'padUnitWeightKNPerM3'] as const
type NativeCase = Record<string, unknown> & { sourceSHA256: Record<string, string>; masonryCase: Record<string, unknown>; roofControls: Record<string, unknown> }
type NativeResult = {
  schema: string; sourceSHA256: Record<string, string>; request: unknown
  nativeVertical: { native: { caseId: string; heads: { id: string; reactionKN_KNm: number[] }[]; equilibriumResidualKN_KNm: number[] }; [key: string]: unknown }
  upperMasonry: { sourceSelfGAndFirstMomentResidualKN_KNm: number[]; allIntermediateRoofTensionRemoved: boolean
    finiteFootprintPressureAndRotationQualified: boolean; wholeUpperWallInventoryComplete: boolean
    seats: { id: string; contactCompressionKN: number; contactActive: boolean }[]; [key: string]: unknown }
  drawings: Record<string, string>; [key: string]: unknown
}

function currentBinding(resolved: CurrentDesignResolution) {
  const owner = resolved.disciplineBindings.find(binding => binding.id === 'str-masonry-frame-comparison')
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !owner) throw new Error('Upper masonry bearing requires the admitted current masonry-frame source')
  const comparison = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })) as NativeCase
  if (comparison.schema !== 'str-upper-masonry-roof-bearing-case/1' || !record(comparison.sourceSHA256)
      || Object.keys(comparison.sourceSHA256).length !== 53) throw new Error('The upper bearing source contract changed; integrate explicitly')
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (owner.identities[path] !== blob || (Object.hasOwn(comparison.sourceSHA256, path)
        && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) {
      throw new Error(`Stale or missing upper masonry source or method: ${path}`)
    }
    return [path, blob]
  }))
  return { comparison, inputs, planDigest: sha256SemanticFingerprint(resolved.design), bindingDigest: sha256SemanticFingerprint({ owner, inputs }) }
}

export function readUpperRoofBearingCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-upper-roof-bearing-request/1' as const, design: resolved.design,
    bearing: { schema: 'str-current-upper-roof-bearing-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, caseId: 'UPPER-ROOF-BEARING' } }
}

/** Reuse the sole saved floor/frame controls, without retaining obsolete bilateral roof laws. */
export function savedUpperRoofBearingCase(request: ReturnType<typeof readUpperRoofBearingCase>['bearing'],
  settings: Readonly<Record<string, unknown>>, masonry: ReturnType<typeof savedMasonryFrameCase>) {
  if (Object.keys(settings).some(key => !(upperRoofBearingStageFields as readonly string[]).includes(key))) {
    throw new Error('Upper bearing settings cannot supply another floor, source, roof or derived approval')
  }
  const base = structuredClone(masonry.comparison) as unknown as Record<string, unknown>
  if (!record(base.roofCoupling)) throw new Error('Upper bearing requires explicit saved masonry-frame roof controls')
  const { intermediateSupportLaws: _superseded, ...roofControls } = base.roofCoupling
  base.roofCoupling = null
  return { ...request, caseId: masonry.caseId,
    comparison: { ...request.comparison, ...settings, masonryCase: base, roofControls } }
}

export function runUpperRoofBearingCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  if (!record(input) || !same(Object.keys(input).sort(), ['schema', 'planDigest', 'bindingDigest', 'comparison', 'caseId'].sort())
      || input.schema !== 'str-current-upper-roof-bearing-case/1' || input.planDigest !== current.planDigest
      || input.bindingDigest !== current.bindingDigest || !record(input.comparison)
      || !same(Object.keys(input.comparison).sort(), Object.keys(current.comparison).sort())
      || !same(input.comparison.sourceSHA256, current.comparison.sourceSHA256)
      || input.comparison.schema !== current.comparison.schema || input.comparison.use !== current.comparison.use
      || typeof input.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(input.caseId)) {
    throw new Error('Stale or malformed current upper-bearing case or method binding')
  }
  const output = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: input.comparison, name: input.caseId }), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  })) as NativeResult
  const vertical = output.nativeVertical, upper = output.upperMasonry
  const grid = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8')) as { heads: { id: string }[] }
  if (output.schema !== 'str-upper-masonry-roof-bearing-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
      || !same(output.request, input.comparison) || !record(vertical) || !record(vertical.native)
      || vertical.native.caseId !== input.caseId || !Array.isArray(vertical.native.heads) || vertical.native.heads.length !== 53
      || new Set(vertical.native.heads.map(row => row.id)).size !== 52
      || grid.heads.some(row => !vertical.native.heads.some(head => head.id === row.id))
      || vertical.native.heads.some(row => !six(row.reactionKN_KNm))
      || !six(vertical.native.equilibriumResidualKN_KNm) || vertical.native.equilibriumResidualKN_KNm.some(v => Math.abs(v) > 1e-5)
      || !record(upper) || !six(upper.sourceSelfGAndFirstMomentResidualKN_KNm)
      || upper.sourceSelfGAndFirstMomentResidualKN_KNm.some(v => Math.abs(v) > 1e-6)
      || upper.allIntermediateRoofTensionRemoved !== true || upper.finiteFootprintPressureAndRotationQualified !== false
      || upper.wholeUpperWallInventoryComplete !== false || !Array.isArray(upper.seats) || upper.seats.length !== 18
      || new Set(upper.seats.map(row => row.id)).size !== 18
      || upper.seats.some(row => !finite(row.contactCompressionKN) || row.contactCompressionKN < -1e-7)
      || ['candidateAccepted', 'completeHouseProof', 'installedAcceptance', 'roofAdoption', 'waterControlAccepted', 'thermalAccepted',
        'masonryStrengthAccepted', 'archMovementCompatibilityAccepted', 'frameReinforcementAccepted'].some(key => output[key] !== false)
      || !record(output.drawings) || !output.drawings['upper-roof-bearing.svg']?.startsWith('<svg')) {
    throw new Error('Upper bearing result lost source identity, actual 52-head equilibrium, unilateral seats or proof limits')
  }
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'str-current-upper-roof-bearing/1', path: methodPath, inputs: current.inputs },
    native: vertical.native, vertical, upperMasonry: upper, roofCoupling: output.roofCoupling,
    mass: output.mass, plateBending: output.plateBending, floorReinforcement: output.floorReinforcement,
    straightFrameCage: output.straightFrameCage, foundationWeight: output.foundationWeight,
    drawings: output.drawings, roofSvg: output.drawings['upper-roof-bearing.svg'],
    frameSvg: output.drawings['masonry-frame-a.svg'], floorSvg: output.drawings['masonry-frame-a-floor.svg'],
    evidence: { state: 'unqualified-upper-clear-masonry-and-axial-roof-seats' as const,
      candidateAccepted: false as const, completeHouseProof: false as const, installedAcceptance: false as const,
      scope: 'Actual source-ground-0 clear masonry, bedded pads, compression-only point bearings, ordinary roof ring and four RC L paths in one52-head solve. Full pad pressure/rotation, sliding, wall stability, complete gravity/pressure, reinforcement and water/thermal qualification remain open.' } }
}
