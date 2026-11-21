import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import type { savedUpperRoofBearingCase } from './structural-upper-bearing.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/floor_section_model.py'
const adapterPath = 'compiler/reference-house/current-design/structural-floor-section.ts'
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const six = (v: unknown): v is number[] => Array.isArray(v) && v.length === 6 && v.every(finite)
export const floorSectionStageFields = ['thicknessMm'] as const
type NativeCase = Record<string, unknown> & { sourceSHA256: Record<string, string>; bearingCase: unknown }
type NativeResult = {
  schema: string; sourceSHA256: Record<string, string>; request: unknown
  nativeVertical: { native: { caseId: string; heads: { id: string; reactionKN_KNm: number[] }[]; equilibriumResidualKN_KNm: number[] }; [key: string]: unknown }
  floorSection: { thicknessMm: number; topZMm: number; midplaneZMm: number; sourceGravityResidualKN_KNm: number[]; sourcePressureResidualKN_KNm: number[]; sourceUpperMaterialResidualKN_KNm: number[]; [key: string]: unknown }
  drawings: Record<string, string>; [key: string]: unknown
}

function currentBinding(resolved: CurrentDesignResolution) {
  const owner = resolved.disciplineBindings.find(row => row.id === 'str-masonry-frame-comparison')
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !owner) throw new Error('Floor section requires the admitted current masonry-frame source')
  const comparison = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })) as NativeCase
  if (comparison.schema !== 'str-coupled-floor-section-case/1' || !record(comparison.sourceSHA256)
    || Object.keys(comparison.sourceSHA256).length !== 54) throw new Error('Floor-section source contract changed; integrate explicitly')
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (owner.identities[path] !== blob || (Object.hasOwn(comparison.sourceSHA256, path)
      && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) throw new Error(`Stale or missing floor-section source: ${path}`)
    return [path, blob]
  }))
  return { comparison, inputs, planDigest: sha256SemanticFingerprint(resolved.design), bindingDigest: sha256SemanticFingerprint({ owner, inputs }) }
}

export function readFloorSectionCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-floor-section-request/1' as const, design: resolved.design,
    section: { schema: 'str-current-floor-section-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, caseId: 'FLOOR-SECTION' } }
}

/** A section edit reuses the sole saved floor, frame, roof and seat inputs. */
export function savedFloorSectionCase(request: ReturnType<typeof readFloorSectionCase>['section'],
  settings: Readonly<Record<string, unknown>>, upper: ReturnType<typeof savedUpperRoofBearingCase>) {
  if (Object.keys(settings).some(key => !(floorSectionStageFields as readonly string[]).includes(key))
    || !finite(settings.thicknessMm) || settings.thicknessMm < 200 || settings.thicknessMm > 250) {
    throw new Error('Explicit finite floor-section thickness 200..250 mm required; no duplicate floor or derived approval')
  }
  return { ...request, caseId: upper.caseId,
    comparison: { ...request.comparison, bearingCase: upper.comparison, thicknessMm: settings.thicknessMm } }
}

export function runFloorSectionCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  if (!record(input) || !same(Object.keys(input).sort(), ['schema', 'planDigest', 'bindingDigest', 'comparison', 'caseId'].sort())
    || input.schema !== 'str-current-floor-section-case/1' || input.planDigest !== current.planDigest || input.bindingDigest !== current.bindingDigest
    || !record(input.comparison) || !same(Object.keys(input.comparison).sort(), Object.keys(current.comparison).sort())
    || !same(input.comparison.sourceSHA256, current.comparison.sourceSHA256) || input.comparison.schema !== current.comparison.schema
    || input.comparison.use !== current.comparison.use || typeof input.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(input.caseId)) {
    throw new Error('Stale or malformed floor-section request or binding')
  }
  const output = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: input.comparison, name: input.caseId }), encoding: 'utf8', maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  })) as NativeResult
  const vertical = output.nativeVertical, section = output.floorSection
  const grid = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8')) as { heads: { id: string }[] }
  if (output.schema !== 'str-coupled-floor-section-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.request, input.comparison) || !record(vertical) || !record(vertical.native) || vertical.native.caseId !== input.caseId
    || !Array.isArray(vertical.native.heads) || vertical.native.heads.length !== 52 || new Set(vertical.native.heads.map(h => h.id)).size !== 52
    || grid.heads.some(row => !vertical.native.heads.some(h => h.id === row.id)) || vertical.native.heads.some(h => !six(h.reactionKN_KNm))
    || !six(vertical.native.equilibriumResidualKN_KNm) || vertical.native.equilibriumResidualKN_KNm.some(v => Math.abs(v) > 1e-5)
    || !record(section) || section.thicknessMm !== input.comparison.thicknessMm || section.topZMm !== 3170 + section.thicknessMm
    || section.midplaneZMm !== 3170 + section.thicknessMm / 2
    || [section.sourceGravityResidualKN_KNm, section.sourcePressureResidualKN_KNm, section.sourceUpperMaterialResidualKN_KNm].some(row => !six(row) || row.some(v => Math.abs(v) > 1e-6))
    || output.candidateAccepted !== false || output.completeHouseProof !== false
    || !record(output.drawings) || !output.drawings['floor-section-floor.svg']?.startsWith('<svg')) {
    throw new Error('Floor-section result lost current source, actual datums, 52-head balance or explicit proof limits')
  }
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'str-current-floor-section/1', path: methodPath, inputs: current.inputs },
    native: vertical.native, vertical, floorSection: section, upperMasonry: output.upperMasonry,
    mass: output.mass, plateBending: output.plateBending, floorReinforcement: output.floorReinforcement,
    roofCoupling: output.roofCoupling, drawings: output.drawings, floorSvg: output.drawings['floor-section-floor.svg'],
    diagnostics: output.diagnostics, evidence: { state: 'unselected-actual-section-replacement' as const,
      candidateAccepted: false as const, completeHouseProof: false as const, installedAcceptance: false as const,
      scope: 'Actual plate and membrane reassembly, work maps, upper body starts, self-weight and recovery at the authored thickness. Finish, FFL, stairs, services, aerodynamic tributaries, local stress convergence, reinforcement and joints remain unqualified.' } }
}
