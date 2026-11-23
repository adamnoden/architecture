/** Thin current-source adapter. The existing Python method owns contact mechanics. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'

const root = new URL('../../../', import.meta.url)
export const wetBearingObjectId = 'STR/wet-wall-support/normal-bearing'
export const wetBearingMethodPath = 'project/str/studies/wet_bearing_refinement.py'
export const wetBearingInputsPath = 'project/str/studies/wet-bearing-refinement-inputs.json'
export const wetBearingAdapterPath = 'compiler/reference-house/current-design/structural-wet-bearing.ts'
export const wetBearingConsumerPaths = [wetBearingMethodPath, wetBearingInputsPath, wetBearingAdapterPath] as const
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const sha = (path: string) => createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')
const evidence = { physicalContactAccepted: false, postHeadResistanceAccepted: false,
  completeSignedLoadEnvelope: false, wholeHouseAccepted: false, installedAcceptance: false } as const
const criteriaKeys = ['forceAbsoluteKN', 'forceRelative', 'centreOfPressureAbsoluteMm', 'unloadedForceKN',
  'maximum52HeadComponentDifferenceKN_KNm', 'maximumRawTensileResidualKN'] as const

export interface WetBearingNumericalInputs {
  readonly schema: 'str-wet-bearing-refinement-inputs/1'
  readonly orders: readonly number[]
  readonly conditionalNextOrder: number
  readonly criteria: Readonly<Record<typeof criteriaKeys[number], number>>
  readonly scope: string
}
export function admitWetBearingNumericalInputs(input: unknown): WetBearingNumericalInputs {
  const criteria = record(input) && record(input.criteria) ? input.criteria : undefined
  if (!record(input) || !same(Object.keys(input).sort(), ['schema', 'orders', 'conditionalNextOrder', 'criteria', 'scope'].sort())
    || input.schema !== 'str-wet-bearing-refinement-inputs/1' || !same(input.orders, [8, 16, 32]) || input.conditionalNextOrder !== 64
    || typeof input.scope !== 'string' || !input.scope || !record(input.criteria)
    || !same(Object.keys(input.criteria).sort(), [...criteriaKeys].sort())
    || criteriaKeys.some(key => !finite(criteria![key]) || Number(criteria![key]) <= 0)) {
    throw new Error('WET_BEARING_NUMERICAL_INPUTS_UNSUPPORTED: explicit versioned dimensionless orders, mm/kN criteria and scope required')
  }
  return structuredClone(input) as unknown as WetBearingNumericalInputs
}
export function readWetBearingNumericalInputs() {
  return admitWetBearingNumericalInputs(JSON.parse(readFileSync(new URL(wetBearingInputsPath, root), 'utf8')))
}
type Diagnostic = { code: string; severity: 'error' | 'warning'; objectId: typeof wetBearingObjectId; message: string }
function unsupported(code: string, message: string) {
  return { status: 'unsupported' as const, objectId: wetBearingObjectId, comparison: null,
    diagnostics: [{ code, severity: 'error', objectId: wetBearingObjectId, message }] as Diagnostic[], evidence: { ...evidence } }
}
class InputFailure extends Error {
  constructor(readonly code: string, message: string) { super(message) }
}
type Native = Record<string, unknown> & { sourceSHA256: Record<string, string>; request: Record<string, unknown>;
  seatedWetSupport: Record<string, unknown> & { settings: Record<string, unknown>; posts: Record<string, unknown>[] };
  nativeVertical: { native: { caseId: string } } }
function currentNative(input: unknown): Native {
  if (!record(input) || input.schema !== 'str-coupled-floor-section-result/1' || !record(input.sourceSHA256)
    || Object.keys(input.sourceSHA256).length !== 58 || !record(input.request) || !same(input.sourceSHA256, input.request.sourceSHA256)
    || !record(input.seatedWetSupport) || !record(input.seatedWetSupport.settings)
    || !same(input.request.wetSupport, input.seatedWetSupport.settings) || input.seatedWetSupport.physicalAcceptance !== false
    || !Array.isArray(input.seatedWetSupport.posts) || input.seatedWetSupport.posts.length !== 2
    || input.candidateAccepted !== false || input.completeHouseProof !== false
    || !record(input.nativeVertical) || !record(input.nativeVertical.native) || typeof input.nativeVertical.native.caseId !== 'string') {
    throw new InputFailure('WET_BEARING_NATIVE_RESPONSE_UNSUPPORTED', 'An explicitly unadopted, matching native58-source wet-support response is required.')
  }
  for (const [path, identity] of Object.entries(input.sourceSHA256)) {
    if (typeof identity !== 'string' || !/^[a-f0-9]{64}$/.test(identity) || !/^project\/[A-Za-z0-9/_.-]+$/.test(path)
      || path.split('/').some(part => !part || part === '.' || part === '..')) {
      throw new InputFailure('WET_BEARING_NATIVE_SOURCE_UNSUPPORTED', 'Native source paths and SHA-256 identities must be explicit repository sources.')
    }
    if (sha(path) !== identity) throw new InputFailure('WET_BEARING_NATIVE_SOURCE_STALE', `Native wet-bearing evidence is stale at ${path}.`)
  }
  return input as unknown as Native
}
function validateAssessment(output: unknown, native: Native, criteria: WetBearingNumericalInputs['criteria']) {
  if (!record(output) || output.schema !== 'str-wet-bearing-contact-integration/1'
    || !same(output.sourceSHA256, native.sourceSHA256) || !same(output.executedRequest, native.request)
    || output.nativeCaseId !== native.nativeVertical.native.caseId || output.order !== native.seatedWetSupport.settings.bearingQuadratureOrder
    || !same(output.criteria, criteria) || output.physicalContactAccepted !== false || output.postHeadResistanceAccepted !== false
    || typeof output.numericalSamePlaneIntegrationPassing !== 'boolean' || !Array.isArray(output.posts) || output.posts.length !== 2
    || output.posts.some((post: unknown, i: number) => !record(post) || post.id !== native.seatedWetSupport.posts[i]!.id
      || !finite(post.normalCompressionKN) || !finite(post.exactSamePlaneCompressionKN)
      || typeof post.numericalSamePlaneIntegrationPassing !== 'boolean')) {
    throw new InputFailure('WET_BEARING_METHOD_RESPONSE_INVALID', 'The method lost actual source/request/post identity, criteria or explicit proof limits.')
  }
  return output
}
function execute(operation: 'assess' | 'compare', first: unknown, second?: unknown) {
  try {
    const a = currentNative(first), b = operation === 'compare' ? currentNative(second) : undefined
    const inputs = readWetBearingNumericalInputs()
    const methodSources = Object.fromEntries(wetBearingConsumerPaths.map(path => [path, sha(path)]))
    const payload = { schema: 'str-wet-bearing-analysis-request/1', operation,
      ...(b ? { coarse: a, fine: b } : { native: a }), criteria: inputs.criteria }
    let raw: unknown
    try {
      raw = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(wetBearingMethodPath, root))], {
        input: JSON.stringify(payload), encoding: 'utf8', stdio: 'pipe', maxBuffer: 128 * 1024 * 1024,
        env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
      }))
    } catch (error) {
      const stderr = record(error) && Buffer.isBuffer(error.stderr) ? error.stderr.toString('utf8').trim().split('\n').at(-1) : undefined
      throw new InputFailure('WET_BEARING_METHOD_REJECTED', stderr ?? (error instanceof Error ? error.message : String(error)))
    }
    let passing: boolean
    if (b) {
      if (!record(raw) || raw.schema !== 'str-wet-bearing-coupled-refinement/1' || raw.physicalContactAccepted !== false
        || raw.postHeadResistanceAccepted !== false || typeof raw.numericalRefinementPassing !== 'boolean') {
        throw new InputFailure('WET_BEARING_METHOD_RESPONSE_INVALID', 'The paired method lost its numerical or physical acceptance boundary.')
      }
      validateAssessment(raw.coarse, a, inputs.criteria); validateAssessment(raw.fine, b, inputs.criteria)
      passing = raw.numericalRefinementPassing
    } else passing = validateAssessment(raw, a, inputs.criteria).numericalSamePlaneIntegrationPassing as boolean
    for (const native of b ? [a, b] : [a]) for (const [path, identity] of Object.entries(native.sourceSHA256)) {
      if (sha(path) !== identity) throw new InputFailure('WET_BEARING_NATIVE_SOURCE_STALE', `Native source changed during contact recovery: ${path}.`)
    }
    if (wetBearingConsumerPaths.some(path => sha(path) !== methodSources[path])) {
      throw new InputFailure('WET_BEARING_METHOD_SOURCE_CHANGED', 'The method, authored numerical criteria or adapter changed during recovery.')
    }
    const diagnostics: Diagnostic[] = [{ code: 'WET_BEARING_NOT_PHYSICAL_ACCEPTANCE', severity: 'warning', objectId: wetBearingObjectId,
      message: 'Declared affine-plane quadrature comparisons only; pad material/contact, post-head resistance and whole-house acceptance remain unqualified.' }]
    if (!passing) diagnostics.push({ code: 'WET_BEARING_NUMERICAL_SCREEN_FAILED', severity: 'warning', objectId: wetBearingObjectId,
      message: 'The unchanged authored same-plane or paired refinement criteria failed. Retain the negative result; do not infer physical rejection or relax its criteria.' })
    if (!b) diagnostics.push({ code: 'WET_BEARING_COUPLED_REFINEMENT_NOT_EXECUTED', severity: 'warning', objectId: wetBearingObjectId,
      message: 'One re-equilibrated state supplies its own integration screen. A separate matched native order-doubling comparison is required before claiming refinement stability.' })
    return { status: 'computed-comparison' as const, objectId: wetBearingObjectId, comparison: raw, diagnostics, evidence: { ...evidence },
      source: { nativeSourceSHA256: structuredClone(a.sourceSHA256), nativeCaseIds: [a.nativeVertical.native.caseId, ...(b ? [b.nativeVertical.native.caseId] : [])],
        nativeResponseSemanticDigests: [sha256SemanticFingerprint(a), ...(b ? [sha256SemanticFingerprint(b)] : [])],
        upstreamValidationOwner: 'compiler/reference-house/current-design/structural-floor-section.ts',
        scope: 'Native source bytes are checked. Existing full capture/global source-wrench/head/reversal controls establish execution provenance; this postprocessor does not certify it.' },
      method: { id: 'str-current-wet-bearing-numerics/1', path: wetBearingMethodPath, inputsPath: wetBearingInputsPath,
        sourceSHA256: methodSources }, numericalInputs: inputs }
  } catch (error) {
    return unsupported(error instanceof InputFailure ? error.code : 'WET_BEARING_INPUT_OR_SOURCE_UNAVAILABLE',
      error instanceof Error ? error.message : String(error))
  }
}

/** Call only after the existing current floor-section native validation. No non-wet subprocess or fallback. */
export function runWetBearingContactAnalysis(native: unknown) {
  if (record(native) && record(native.request) && native.request.wetSupport === null && native.seatedWetSupport === undefined) return null
  return execute('assess', native)
}
/** Batch/CLI callers compare actual captured responses through the same owning method. */
export function compareWetBearingRefinement(coarse: unknown, fine: unknown) { return execute('compare', coarse, fine) }
