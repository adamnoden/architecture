import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'

const root = new URL('../../../', import.meta.url)
export const wetSupportCageObjectId = 'STR/wet-wall-support/reinforcement'
export const wetSupportCageMethodPath = 'project/str/studies/wet_support_cage_comparison.py'
export const wetSupportCageChoicesPath = 'project/str/studies/wet-support-cage-comparison-settings.json'
export const wetSupportCageAdapterPath = 'compiler/reference-house/current-design/structural-wet-support-cage.ts'
export const wetSupportCageConsumerPaths = ['project/str/studies/wet_post_head_duties.py', wetSupportCageMethodPath, wetSupportCageChoicesPath, wetSupportCageAdapterPath] as const
const gridPath = 'project/str/studies/current-house-grid.json'
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
export interface WetSupportCageChoices extends Readonly<Record<string, unknown>> {
  readonly schema: 'str-wet-support-cage-comparison/1'
  readonly linkHookTailMm: number
  readonly postTopLevelRaiseMm: number
}
function method(args: string[], input?: unknown): unknown {
  try {
    return JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(wetSupportCageMethodPath, root)), ...args], {
      ...(input === undefined ? {} : { input: JSON.stringify(input) }), encoding: 'utf8', stdio: 'pipe', maxBuffer: 128 * 1024 * 1024,
      env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
    }))
  } catch (error) {
    const stderr = record(error) && Buffer.isBuffer(error.stderr) ? error.stderr.toString('utf8').trim().split('\n').at(-1) : undefined
    throw new Error(`Wet-support cage method rejected the comparison: ${stderr ?? (error instanceof Error ? error.message : String(error))}`)
  }
}
/** Uses the owning method's exact field/domain admission before a native solve. */
export function validateWetSupportCageChoices(input: unknown): WetSupportCageChoices {
  const admitted = method(['--validate-settings'], input)
  if (!record(admitted) || admitted.schema !== 'str-wet-support-cage-comparison/1'
    || !finite(admitted.postTopLevelRaiseMm) || !finite(admitted.linkHookTailMm) || !same(admitted, input)) throw new Error('Unsupported serialized wet-support cage choices')
  return admitted as WetSupportCageChoices
}
export function readWetSupportCageDefaults(): WetSupportCageChoices {
  const choices = JSON.parse(readFileSync(new URL(wetSupportCageChoicesPath, root), 'utf8')) as unknown
  if (!same(choices, method(['--read-settings']))) throw new Error('Authored wet-support cage choices differ from the current method defaults')
  return validateWetSupportCageChoices(choices)
}
export interface WetCageGeometryReports {
  readonly collisions: { readonly failedPairCount: number; readonly failures: readonly unknown[] }
  readonly internalClosures: { readonly failures: readonly unknown[] }
  readonly cover: { readonly failedPaths: readonly unknown[] }
}
/** All three reports matter: one-bar self-crossings are not pair collisions. */
export function wetSupportCageGeometrySummary(input: WetCageGeometryReports) {
  const pairs = input.collisions.failedPairCount, internal = input.internalClosures.failures.length, cover = input.cover.failedPaths.length
  if (!Number.isSafeInteger(pairs) || pairs < 0 || pairs !== input.collisions.failures.length) throw new Error('Malformed wet-cage independent-path report')
  return { independentPathFailureCount: pairs, internalClosureFailureCount: internal, coverFailureCount: cover,
    allReportedGeometryClear: pairs === 0 && internal === 0 && cover === 0, physicalCageAccepted: false as const }
}
export function runWetSupportCageComparison(native: unknown, choices: WetSupportCageChoices) {
  const settings = validateWetSupportCageChoices(choices)
  if (!record(native) || native.schema !== 'str-coupled-floor-section-result/1' || !record(native.sourceSHA256)
    || Object.keys(native.sourceSHA256).length !== 58 || !record(native.seatedWetSupport)
    || !record(native.nativeVertical) || !record(native.nativeVertical.native)
    || typeof native.nativeVertical.native.caseId !== 'string' || native.candidateAccepted !== false || native.completeHouseProof !== false) {
    throw new Error('Wet-support cage comparison requires the actual unadopted58-source coupled wet-support response')
  }
  const bytes = readFileSync(new URL(gridPath, root)), rawGridSHA256 = createHash('sha256').update(bytes).digest('hex')
  if (native.sourceSHA256[gridPath] !== rawGridSHA256) throw new Error('Wet-support cage grid bytes do not match the actual native source identity')
  const output = method(['--stdin'], { native, grid: JSON.parse(bytes.toString('utf8')), settings })
  if (!record(output) || output.schema !== 'str-wet-support-cage-path-result/1'
    || !same(output.settings, settings) || !same(output.nativeSourceSHA256, native.sourceSHA256)
    || output.nativeCaseId !== native.nativeVertical.native.caseId
    || !Array.isArray(output.postHeadDuties) || output.postHeadDuties.length !== 2
    || !record(output.collisions) || !Array.isArray(output.collisions.failures) || !finite(output.collisions.failedPairCount)
    || !record(output.internalClosures) || !Array.isArray(output.internalClosures.failures)
    || !record(output.cover) || !Array.isArray(output.cover.failedPaths) || !record(output.quantities)
    || ['actualPad220mmBearingMaterial', 'beamEndDRegionAccepted', 'postHeadDRegionAccepted', 'postBaseGridJointAccepted', 'completeSignedLoadEnvelope', 'cageAccepted'].some(key => output[key] !== false)
    || ['explicitCageWeightUpperKN', 'nativeWetBodiesWeightKN', 'conditionalNativeMassReserveKN', 'actualSteelMassUpperKg'].some(key => !finite((output.quantities as Record<string, unknown>)[key]))
    || output.quantities.plainConcreteDensityBoundEstablished !== false || output.quantities.wireChairsAndExistingGridCageIncluded !== false
    || output.quantities.installedMass25Qualified !== false) {
    throw new Error('Wet-support cage result lost actual demand identity, one of its three geometry reports, quantities or proof limits')
  }
  const geometry = wetSupportCageGeometrySummary(output as unknown as WetCageGeometryReports)
  const quantities = output.quantities as Record<string, unknown> & { explicitCageWeightUpperKN: number; nativeWetBodiesWeightKN: number;
    conditionalNativeMassReserveKN: number; actualSteelMassUpperKg: number }
  const diagnostics: { code: string; objectId: string; state: 'uncoordinated-comparisons'; message: string }[] = []
  if (!geometry.allReportedGeometryClear) diagnostics.push({ code: 'WET_SUPPORT_CAGE_GEOMETRY_FAILED', objectId: wetSupportCageObjectId,
    state: 'uncoordinated-comparisons', message: `${wetSupportCageObjectId}: ${geometry.independentPathFailureCount} independent-path, ${geometry.internalClosureFailureCount} internal-closure and ${geometry.coverFailureCount} cover failures. Clear pair/cover reports cannot cancel a same-bar crossing.` })
  diagnostics.push({ code: 'WET_SUPPORT_CAGE_MASS_NOT_COUPLED', objectId: wetSupportCageObjectId, state: 'uncoordinated-comparisons',
    message: `${wetSupportCageObjectId}: explicit comparison weight ${quantities.explicitCageWeightUpperKN} kN versus native wet-body weight ${quantities.nativeWetBodiesWeightKN} kN; conditional reserve ${quantities.conditionalNativeMassReserveKN} kN. Wire, chairs, existing grid cage and delivered density remain unqualified. These quantities do not alter the solved native mass or loads.` })
  diagnostics.push({ code: 'WET_SUPPORT_CAGE_NOT_ADOPTED', objectId: wetSupportCageObjectId, state: 'uncoordinated-comparisons',
    message: `${wetSupportCageObjectId}: geometry and necessary section comparisons on this exact native case only. Full signed demand, concrete bearing, end/post-head D-regions, development, grid cage and installed acceptance remain unqualified.` })
  return { status: 'computed-comparison' as const, objectId: wetSupportCageObjectId, settings,
    nativeCaseId: output.nativeCaseId as string, nativeSourceSHA256: native.sourceSHA256 as Record<string, string>,
    source: { rawGridPath: gridPath, rawGridSHA256, rawGridIdentityVerified: true as const },
    method: { id: 'str-current-wet-support-cage/1', path: wetSupportCageMethodPath, choicesPath: wetSupportCageChoicesPath,
      sourceSHA256: Object.fromEntries(wetSupportCageConsumerPaths.map(path => [path, createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')])) },
    comparison: { ...output, rawGridIdentityVerified: true as const, rawGridIdentityVerificationOwner: wetSupportCageAdapterPath }, geometry, quantities, diagnostics,
    evidence: { cageAccepted: false as const, completeSignedLoadEnvelope: false as const, installedAcceptance: false as const,
      massFeedbackApplied: false as const, scope: 'Selected serialized cage choices are evaluated on the actual returned native58-source wet-support case. This comparison neither adopts a cage nor feeds its mass back into the native solve.' } }
}
