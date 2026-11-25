/** Same-native local end-return comparison; no native solve or selected cage. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { runWetSupportCageComparison } from './structural-wet-support-cage.js'
import { readWetBeamEndDevelopmentControls } from './structural-wet-beam-end-settings.js'
export { readWetBeamEndDevelopmentControls } from './structural-wet-beam-end-settings.js'
export type { WetBeamEndDevelopmentControls } from './structural-wet-beam-end-settings.js'
const root = new URL('../../../', import.meta.url)
const backend = 'project/str/studies/wet_beam_rectangular_return.py'
const gridPath = 'project/str/studies/current-house-grid.json'
export const wetBeamEndDevelopmentPaths = [
  'compiler/reference-house/current-design/structural-wet-beam-end.ts',
  'compiler/reference-house/current-design/structural-wet-beam-end-settings.ts',
  backend, 'project/str/studies/wet_beam_end_views.py',
  'project/str/studies/wet_support_cage_comparison.py', 'project/str/studies/wet_post_head_fan.py',
  'project/str/studies/continuous_rc_cage.py', 'project/str/studies/wet-beam-rectangular-return-inputs.json',
] as const
const record = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const sha = (p: string) => createHash('sha256').update(readFileSync(new URL(p, root))).digest('hex')
const limits = { candidateAccepted: false, nativeSolveExecuted: false, nativeCageMassFeedbackApplied: false,
  beamEndDRegionAccepted: false, bendPressureAccepted: false, bondAndAnchorageAccepted: false,
  toleranceDomainAccepted: false, completeSignedLoadEnvelope: false, continuousCutEnvelopeAvailable: false } as const
type ComputedEndDevelopment = Record<string, any> & typeof limits & {
  status: 'computed-development-comparison'; drawings: Record<string, string>; nativeCaseId: string
  nativeRequest: unknown; candidateCageGeometrySHA256: string; sameCaseCutComparisons: Record<string, unknown>
}
function unsupported(code: string, message: string) {
  return { status: 'unsupported' as const, ...limits, diagnostics: [{ code, message }], drawings: {} as Record<string, string> }
}
export function readWetBeamEndDevelopmentDefaults() {
  const value = JSON.parse(readFileSync(new URL('project/str/studies/wet-beam-rectangular-return-inputs.json', root), 'utf8'))
  if (value.schema !== 'str-wet-beam-rectangular-return-input/1'
    || value.id !== 'STR/WET-CAGE/beam/rectangular-return-development'
    || value.units !== 'mm-kN-kNm' || value.datum !== 'source-ground-zero') throw new Error('Versioned local end-development controls and units required')
  return readWetBeamEndDevelopmentControls({ endReturnMandrelMm: value.endReturnMandrelMm,
    strutCotangentComparisons: value.strutCotangentComparisons })
}
export function runWetBeamEndDevelopment(native: unknown, cage: ReturnType<typeof runWetSupportCageComparison> | null, value: unknown) {
  if (value === undefined || value === null) return null
  const controls = readWetBeamEndDevelopmentControls(value)
  try {
    if (!cage || !record(native) || native.schema !== 'str-coupled-floor-section-result/1'
      || !record(native.sourceSHA256) || Object.keys(native.sourceSHA256).length !== 58
      || !record(native.request) || native.request.thicknessMm !== 200 || !same(native.request.sourceSHA256, native.sourceSHA256)
      || !record(native.nativeVertical) || !record(native.nativeVertical.native)
      || native.candidateAccepted !== false || native.completeHouseProof !== false
      || cage.nativeCaseId !== native.nativeVertical.native.caseId || !same(cage.nativeSourceSHA256, native.sourceSHA256)
      || cage.source.rawGridIdentityVerified !== true) {
      return unsupported('WET_BEAM_END_NATIVE_UNSUPPORTED', 'An actual current RC200 native response and independently generated same-case cage choices are required')
    }
    for (const [p, identity] of Object.entries(native.sourceSHA256)) {
      if (!/^project\/[A-Za-z0-9/_.-]+$/.test(p) || p.split('/').includes('..') || sha(p) !== identity) {
        return unsupported('WET_BEAM_END_SOURCE_STALE', `Actual native source changed: ${p}`)
      }
    }
    for (const [p, identity] of Object.entries(cage.method.sourceSHA256)) if (sha(p) !== identity) {
      return unsupported('WET_BEAM_END_CAGE_SOURCE_STALE', `Actual source cage method changed: ${p}`)
    }
    const methods = Object.fromEntries(wetBeamEndDevelopmentPaths.map(p => [p, sha(p)]))
    const gridBytes = readFileSync(new URL(gridPath, root))
    if (createHash('sha256').update(gridBytes).digest('hex') !== native.sourceSHA256[gridPath]) throw new Error('Actual receiving grid identity changed')
    const response = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(backend, root)), '--stdin'], {
      input: JSON.stringify({ schema: 'str-wet-beam-end-request/1', native, grid: JSON.parse(gridBytes.toString('utf8')),
        cageSettings: cage.settings, controls, geometryChecks: true }), encoding: 'utf8', stdio: 'pipe',
      maxBuffer: 64 * 1024 * 1024, timeout: 300000,
      env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
    }))
    const result = response.result
    if (response.schema !== 'str-wet-beam-end-response/1' || !record(result)
      || result.schema !== 'str-wet-beam-rectangular-return-development/1' || result.status !== 'computed-development-comparison'
      || Object.keys(limits).some(k => result[k] !== false) || result.geometryChecksAvailable !== true
      || !same(result.nativeSourceSHA256, native.sourceSHA256) || !same(result.nativeRequest, native.request)
      || result.nativeCaseId !== cage.nativeCaseId || !same(result.controls, controls)
      || !same(result.authoredCageSettings, cage.settings) || typeof result.candidateCageGeometrySHA256 !== 'string'
      || !record(result.sameCaseCutComparisons) || result.sameCaseCutComparisons.nativeCaseId !== cage.nativeCaseId
      || !record(result.sameCasePostHeadFan) || !record(result.sameCasePostHeadFan.sourceBinding)
      || result.sameCasePostHeadFan.sourceBinding.cageGeometrySHA256 !== result.candidateCageGeometrySHA256
      || !record(result.collisions) || !Number.isSafeInteger(result.collisions.failedPairCount) || result.collisions.failedPairCount < 0
      || !record(result.internalClosures) || !Array.isArray(result.internalClosures.failures)
      || !record(result.cover) || !Array.isArray(result.cover.failedPaths)
      || !record(result.drawings) || typeof result.drawings['wet-beam-end.svg'] !== 'string'
      || !result.drawings['wet-beam-end.svg'].startsWith('<svg')) throw new Error('Local end-development result lost its actual case, geometry, diagram or explicit limits')
    const backendPaths = wetBeamEndDevelopmentPaths.filter(p => p.endsWith('.py'))
    if (!record(result.methodSourceSHA256) || !same(Object.keys(result.methodSourceSHA256).sort(), [...backendPaths].sort())) throw new Error('Complete executed local method identity required')
    for (const [p, identity] of Object.entries(result.methodSourceSHA256)) if (methods[p] !== identity) throw new Error('Executed end method identity differs')
    if (!same(methods, Object.fromEntries(wetBeamEndDevelopmentPaths.map(p => [p, sha(p)])))) throw new Error('Local end method changed during computation')
    for (const [p, identity] of Object.entries(native.sourceSHA256)) if (sha(p) !== identity) throw new Error('Native source changed during end computation')
    for (const [p, identity] of Object.entries(cage.method.sourceSHA256)) if (sha(p) !== identity) throw new Error('Source cage changed during end computation')
    return { ...(result as ComputedEndDevelopment), diagnostics: [{code:'WET_BEAM_END_DEVELOPMENT_UNQUALIFIED',
      message:'Actual same-case geometry and necessary straight-section force comparisons only. Finite curved-bar forces, end nodes, bond and anchorage, tolerance domain and complete signed demand remain unqualified; native cage mass is unchanged.'}], method: { id: 'str-current-wet-beam-end-development/1', sourceSHA256: methods },
      evidence: { ...limits, scope: result.scope } }
  } catch (error) {
    return unsupported('WET_BEAM_END_METHOD_UNAVAILABLE', error instanceof Error ? error.message : String(error))
  }
}
