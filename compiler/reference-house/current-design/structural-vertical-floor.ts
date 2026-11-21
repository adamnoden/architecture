import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/vertical_rc_floor.py'
const adapterPath = 'compiler/reference-house/current-design/structural-vertical-floor.ts'
const familyId = 'str-vertical-floor-comparison'
const fields = ['schema', 'sourceSHA256', 'monolithicCase', 'plateLaw', 'bearingLaw', 'maxPitchMm',
  'bearingQuadratureOrder', 'freshUniformLiveKPa', 'geometryPolicy', 'supportPolicy', 'use'] as const
const portalFields = ['gridLaw', 'frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm'] as const
const contactFields = ['portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm'] as const
export const verticalRcFloorStageFields = ['caseId', 'portal', 'geometry', ...contactFields, 'coreAxialWidthMm',
  'northUpstandWidthMm', 'physicalGFactor', 'includeExternalGMAXQ', 'plateLaw', 'bearingLaw', 'maxPitchMm',
  'bearingQuadratureOrder', 'freshUniformLiveKPa'] as const
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const exact = (value: unknown, keys: readonly string[], label: string): Record<string, unknown> => {
  if (!record(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Expected exact ${label} fields without derived sources, results or approval`)
  }
  return value
}
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
type Bound = Record<string, unknown> & { sourceSHA256: Readonly<Record<string, string>> }
type Joined = Bound & { portal: Bound; floor: Bound; geometry: Record<string, unknown> }
type House = Bound & { joinedCase: Joined; boundary: Record<string, unknown> }
type Monolithic = Bound & { houseCase: House }
type Comparison = Bound & { monolithicCase: Monolithic }
type Six = readonly [number, number, number, number, number, number]
type NativeResult = {
  schema: string; sourceSHA256: Readonly<Record<string, string>>; request: unknown
  native: { sourceSHA256: Readonly<Record<string, string>>; request: unknown; caseId: string;
    heads: readonly { id: string; reactionKN_KNm: Six }[]; equilibriumResidualKN_KNm: Six; [key: string]: unknown }
  mass: { newPlateAreaM2: number; newPlatePhysicalSelfGKN: number; joinedPhysicalGKN: number;
    sourceSelfGCondensationResidualKN_KNm: Six; [key: string]: unknown }
  plate: { physicalRecovery: { maximumDeflectionMm: number; workRelativeResidual: number; [key: string]: unknown }; [key: string]: unknown }
  bearings: readonly { active: boolean; normalCompressionKN: number; normalPressureMPa: number; [key: string]: unknown }[]
  additionalGroundCapCuts: readonly Record<string, unknown>[]
  groundCapNormalReceivingPaths: readonly Record<string, unknown>[]
  missingGroundContactAreaMm2: number
  unresolvedReceivingPorts: readonly { id: string }[]; unresolvedReceivingPortCount: number; completeReceivingPaths: number
  diagnostics: readonly string[]; drawings: { 'vertical-floor.svg': string }
  candidateAccepted: boolean; floorGravityAccepted: boolean; masonryConstitutiveLawAccepted: boolean
  completeHouseProof: boolean; roofAdoption: boolean; waterControlAccepted: boolean; thermalAccepted: boolean; installedAcceptance: boolean
}

function boundNodes(value: Comparison) {
  const mono = value.monolithicCase
  const house = mono.houseCase
  const joined = house.joinedCase
  return [value, mono, house, joined, joined.portal, joined.floor, joined.floor.componentCase]
}

function validateBindings(actual: Comparison, expected: Comparison) {
  const current = boundNodes(expected)
  for (const [i, node] of boundNodes(actual).entries()) {
    const reference = current[i]
    if (!record(node) || !record(reference) || !same(Object.keys(node).sort(), Object.keys(reference).sort())
      || !same(node.schema, reference.schema) || !same(node.sourceSHA256, reference.sourceSHA256)) {
      throw new Error('The vertical RC floor cannot replace nested schemas, sources or inject results')
    }
  }
}

function currentBinding(resolved: CurrentDesignResolution) {
  const owner = resolved.disciplineBindings.find(binding => binding.id === familyId)
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !owner) {
    throw new Error('The vertical RC floor requires its admitted str-vertical-floor-comparison source family')
  }
  const comparison = exact(JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })), fields, 'native vertical RC floor') as Comparison
  if (comparison.schema !== 'str-vertical-rc-floor-case/1' || !record(comparison.sourceSHA256)
    || Object.keys(comparison.sourceSHA256).length !== 36 || !record(comparison.monolithicCase)
    || !record(comparison.monolithicCase.houseCase) || !record(comparison.monolithicCase.houseCase.joinedCase)
    || !record(comparison.monolithicCase.houseCase.joinedCase.floor) || !record(comparison.monolithicCase.houseCase.joinedCase.portal)) {
    throw new Error('The vertical RC floor source inventory or exact native schema changed; integrate it explicitly')
  }
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    const owners = resolved.disciplineBindings.flatMap(binding => binding.identities[path] ? [binding.identities[path]] : [])
    if (owner.identities[path] !== blob || owners.some(value => value !== blob)
      || (Object.hasOwn(comparison.sourceSHA256, path) && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) {
      throw new Error(`Stale or missing current vertical RC floor source or method: ${path}`)
    }
    return [path, blob]
  }))
  const grid: { heads: readonly { id: string }[] } = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8'))
  const headIds = grid.heads.map(head => head.id)
  if (headIds.length !== 52 || new Set(headIds).size !== 52) throw new Error('The vertical RC floor requires all 52 actual named heads')
  return { comparison, inputs, headIds, planDigest: sha256SemanticFingerprint(resolved.design),
    bindingDigest: sha256SemanticFingerprint({ owner, inputs }) }
}

export function readVerticalRcFloorCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-vertical-rc-floor-request/1' as const, design: resolved.design,
    vertical: { schema: 'str-current-vertical-rc-floor-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, caseId: 'RC200-VERTICAL-GRAVITY-REFERENCE' } }
}

export function savedVerticalRcFloorCase(request: ReturnType<typeof readVerticalRcFloorCase>['vertical'],
  settings: Readonly<Record<string, unknown>>, sharedFloor: unknown) {
  if (!record(sharedFloor)) throw new Error('The vertical RC floor requires the sole shared distributed-floor stage')
  if (Object.keys(settings).some(key => !(verticalRcFloorStageFields as readonly string[]).includes(key))) {
    throw new Error('Vertical RC floor settings cannot supply another floor, bound case, sources or derived approval')
  }
  const portal = settings.portal ?? {}
  if (!record(portal) || Object.keys(portal).some(key => !(portalFields as readonly string[]).includes(key))) {
    throw new Error('Vertical RC portal settings accept only authored laws and section controls')
  }
  const mono = request.comparison.monolithicCase
  const house = mono.houseCase
  const joined = house.joinedCase
  exact(sharedFloor, Object.keys(joined.floor), 'shared distributed floor')
  if (!same(sharedFloor.sourceSHA256, joined.floor.sourceSHA256) || !record(sharedFloor.componentCase)
    || !record(joined.floor.componentCase) || !same(sharedFloor.componentCase.sourceSHA256, joined.floor.componentCase.sourceSHA256)) {
    throw new Error('The shared vertical floor cannot replace its derived floor/component source identities')
  }
  if (Object.hasOwn(portal, 'gridLaw') && !same(portal.gridLaw, sharedFloor.memberLaw)) {
    throw new Error('The vertical RC ground-grid law must equal its sole shared distributed-floor member law')
  }
  const geometry = settings.geometry ?? {}
  if (!record(geometry) || Object.keys(geometry).some(key => !['outerUpstandDepthMm', 'courtUpstandDepthMm'].includes(key))) {
    throw new Error('Vertical RC geometry settings accept only the authored north upstand depths')
  }
  return { ...request, caseId: settings.caseId ?? request.caseId,
    comparison: { ...request.comparison,
      ...Object.fromEntries(['plateLaw', 'bearingLaw', 'maxPitchMm', 'bearingQuadratureOrder', 'freshUniformLiveKPa']
        .filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]])),
      monolithicCase: { ...mono, houseCase: { ...house,
        coreAxialWidthMm: settings.coreAxialWidthMm ?? house.coreAxialWidthMm,
        northUpstandWidthMm: settings.northUpstandWidthMm ?? house.northUpstandWidthMm,
        boundary: { ...house.boundary, physicalGFactor: settings.physicalGFactor ?? house.boundary.physicalGFactor,
          includeExternalGMAXQ: settings.includeExternalGMAXQ ?? house.boundary.includeExternalGMAXQ },
        joinedCase: { ...joined, ...Object.fromEntries(contactFields.filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]])),
          geometry: { ...joined.geometry, ...geometry }, portal: { ...joined.portal, ...portal, gridLaw: sharedFloor.memberLaw }, floor: sharedFloor } } } } }
}

export function runVerticalRcFloorCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  const request = exact(input, ['schema', 'planDigest', 'bindingDigest', 'comparison', 'caseId'], 'current vertical RC floor case')
  if (request.schema !== 'str-current-vertical-rc-floor-case/1' || request.planDigest !== current.planDigest
    || request.bindingDigest !== current.bindingDigest) throw new Error('Stale vertical RC floor design or method binding')
  const comparison = exact(request.comparison, fields, 'native vertical RC floor comparison') as Comparison
  if (!record(comparison.monolithicCase) || !record(comparison.monolithicCase.houseCase)
    || !record(comparison.monolithicCase.houseCase.joinedCase) || !record(comparison.monolithicCase.houseCase.joinedCase.portal)
    || !record(comparison.monolithicCase.houseCase.joinedCase.floor)) throw new Error('The bound vertical RC house and shared floor are unavailable')
  validateBindings(comparison, current.comparison)
  for (const key of ['geometryPolicy', 'supportPolicy', 'use']) {
    if (!same(comparison[key], current.comparison[key])) throw new Error('The vertical RC floor cannot replace its geometry ownership or proof scope')
  }
  for (const key of ['jointMode', 'waterControl', 'barGeometry', 'use']) {
    if (!same(comparison.monolithicCase[key], current.comparison.monolithicCase[key])) throw new Error('The vertical RC floor cannot replace the bound northern control scheme')
  }
  if (typeof request.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(request.caseId)) throw new Error('The vertical RC floor requires a stable case ID')
  const output: NativeResult = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: comparison, name: request.caseId }), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  }))
  const six = (v: unknown): v is Six => Array.isArray(v) && v.length === 6 && v.every(x => typeof x === 'number' && Number.isFinite(x))
  const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  const receiving = current.comparison.monolithicCase.houseCase.joinedCase.floor.receivingLaws
  if (!record(receiving) || !record(receiving.intermediateSupports)) throw new Error('Actual intermediate receiving catalogue is unavailable')
  const ids = Object.keys(receiving.intermediateSupports)
  if (output.schema !== 'str-vertical-rc-floor-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.request, comparison) || !same(output.native?.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.native?.request, comparison) || output.native?.caseId !== request.caseId
    || ['candidateAccepted', 'floorGravityAccepted', 'masonryConstitutiveLawAccepted', 'completeHouseProof', 'roofAdoption',
      'waterControlAccepted', 'thermalAccepted', 'installedAcceptance'].some(key => output[key as keyof NativeResult] !== false)
    || output.completeReceivingPaths !== 0 || output.unresolvedReceivingPortCount !== ids.length
    || !Array.isArray(output.native?.heads) || output.native.heads.length !== 52
    || new Set(output.native.heads.map(h => h.id)).size !== 52 || current.headIds.some(id => !output.native.heads.some(h => h.id === id))
    || output.native.heads.some(h => !six(h.reactionKN_KNm)) || !six(output.native.equilibriumResidualKN_KNm)
    || !record(output.mass) || !finite(output.mass.newPlatePhysicalSelfGKN) || !finite(output.mass.newPlateAreaM2)
    || !six(output.mass.sourceSelfGCondensationResidualKN_KNm) || !record(output.plate?.physicalRecovery)
    || !finite(output.plate.physicalRecovery.maximumDeflectionMm) || !finite(output.plate.physicalRecovery.workRelativeResidual)
    || !Array.isArray(output.bearings) || output.bearings.some(row => typeof row.active !== 'boolean'
      || !finite(row.normalCompressionKN) || !finite(row.normalPressureMPa))
    || !Array.isArray(output.unresolvedReceivingPorts) || output.unresolvedReceivingPorts.length !== ids.length
    || new Set(output.unresolvedReceivingPorts.map(port => port.id)).size !== ids.length
    || ids.some(id => !output.unresolvedReceivingPorts.some(port => port.id === id))
    || !Array.isArray(output.diagnostics) || !output.drawings?.['vertical-floor.svg']?.startsWith('<svg')) {
    throw new Error('The vertical RC result differs from current sources, actual 52 heads, gravity inventory or unearned proof boundary')
  }
  const edits = comparison.monolithicCase.houseCase.joinedCase.floor.componentCase
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(request) },
    method: { id: 'str-current-vertical-rc-floor/1', path: methodPath, inputs: current.inputs,
      adapter: { path: adapterPath, blob: current.inputs[adapterPath] } },
    native: output.native, mass: output.mass, plate: output.plate, bearings: output.bearings,
    additionalGroundCapCuts: output.additionalGroundCapCuts, groundCapNormalReceivingPaths: output.groundCapNormalReceivingPaths,
    missingGroundContactAreaMm2: output.missingGroundContactAreaMm2, unresolvedReceivingPorts: output.unresolvedReceivingPorts,
    floorSvg: output.drawings['vertical-floor.svg'], diagnostics: output.diagnostics,
    authoredFloorEdits: record(edits) ? edits.edits : undefined,
    evidence: { state: 'unqualified-vertical-rc-floor-gravity-comparison' as const, installedAcceptance: false as const,
      candidateAccepted: false as const, floorGravityAccepted: false as const, completeHouseProof: false as const,
      scope: 'Known-domain RC200 plate gravity, actual openings and slab-band union, finite normal clear-core/cap receivers and all 52 heads. Sourceground0 only. Principal wet inventory, SW ground closure, actual material/contact resistance, local reinforcement, northern cage, L ties, full wall/roof gravity, raised profile and physical acceptance remain unresolved.' } }
}
