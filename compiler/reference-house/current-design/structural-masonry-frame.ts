import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { savedVerticalRcFloorCase, verticalRcFloorStageFields } from './structural-vertical-floor.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/masonry_frame_a.py'
const adapterPath = 'compiler/reference-house/current-design/structural-masonry-frame.ts'
const familyId = 'str-masonry-frame-comparison'
const nativeFields = ['schema', 'sourceSHA256', 'verticalCase', 'masonrySeatProjectionMm', 'masonryUnitWeightKNM3',
  'abutmentSlices', 'foundationWeight', 'courtCornerClosure', 'floorReinforcement', 'use'] as const
const ownFields = ['masonrySeatProjectionMm', 'masonryUnitWeightKNM3', 'abutmentSlices', 'foundationWeight', 'courtCornerClosure', 'floorReinforcement'] as const
export const masonryFrameStageFields = [...verticalRcFloorStageFields, ...ownFields] as const
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const exact = (value: unknown, keys: readonly string[], label: string): Record<string, unknown> => {
  if (!record(value) || Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Expected exact ${label} fields without derived sources, results or approval`)
  }
  return value
}
const same = (a: unknown, b: unknown) => sha256SemanticFingerprint(a) === sha256SemanticFingerprint(b)
type Bound = Record<string, unknown> & { sourceSHA256: Readonly<Record<string, string>> }
type Comparison = Bound & { verticalCase: Parameters<typeof savedVerticalRcFloorCase>[0]['comparison'] }
type Six = readonly [number, number, number, number, number, number]
type NativeVertical = {
  schema: string; sourceSHA256: Readonly<Record<string, string>>; request: unknown
  native: { heads: readonly { id: string; reactionKN_KNm: Six }[]; caseId: string; equilibriumResidualKN_KNm: Six; [key: string]: unknown }
  mass: { newPlatePhysicalSelfGKN: number; [key: string]: unknown }
  missingGroundContactAreaMm2: number; unresolvedReceivingPortCount: number; completeReceivingPaths: number
  unresolvedReceivingPorts: readonly { id: string }[]; plate: { cellCount: number }; [key: string]: unknown
}
type Result = {
  schema: string; sourceSHA256: Readonly<Record<string, string>>; request: unknown; nativeVertical: NativeVertical
  geometry: Readonly<Record<string, unknown>>; mass: Readonly<Record<string, unknown>>
  courtCornerClosure: Readonly<Record<string, unknown>> | null
  foundationWeight: Readonly<Record<string, unknown>>; plateBending: Readonly<Record<string, unknown>>; floorReinforcement: Readonly<Record<string, unknown>>
  drawings: { 'masonry-frame-a.svg': string; 'masonry-frame-a-floor.svg': string }; [key: string]: unknown
}

function currentBinding(resolved: CurrentDesignResolution) {
  const owner = resolved.disciplineBindings.find(binding => binding.id === familyId)
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !owner) {
    throw new Error('The separate masonry frame requires its admitted str-masonry-frame-comparison source family')
  }
  const comparison = exact(JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'],
    { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })), nativeFields, 'native masonry frame') as Comparison
  if (comparison.schema !== 'str-masonry-frame-a-case/1' || !record(comparison.sourceSHA256)
    || Object.keys(comparison.sourceSHA256).length !== 41
    || !record(comparison.verticalCase) || comparison.verticalCase.schema !== 'str-vertical-rc-floor-case/1') {
    throw new Error('The separate masonry frame native schema changed; integrate it explicitly')
  }
  const inputs = Object.fromEntries([...Object.keys(comparison.sourceSHA256), adapterPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    const owners = resolved.disciplineBindings.flatMap(binding => binding.identities[path] ? [binding.identities[path]] : [])
    if (owner.identities[path] !== blob || owners.some(value => value !== blob)
      || (Object.hasOwn(comparison.sourceSHA256, path) && comparison.sourceSHA256[path] !== createHash('sha256').update(bytes).digest('hex'))) {
      throw new Error(`Stale or missing current masonry frame source or method: ${path}`)
    }
    return [path, blob]
  }))
  const grid: { heads: readonly { id: string }[] } = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8'))
  const headIds = grid.heads.map(head => head.id)
  if (headIds.length !== 52 || new Set(headIds).size !== 52) throw new Error('The masonry frame requires all 52 actual named heads')
  return { comparison, inputs, headIds, planDigest: sha256SemanticFingerprint(resolved.design),
    bindingDigest: sha256SemanticFingerprint({ owner, inputs }) }
}

export function readMasonryFrameCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return { schema: 'str-current-masonry-frame-request/1' as const, design: resolved.design,
    masonry: { schema: 'str-current-masonry-frame-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison, caseId: 'MASONRY-FRAME-A-GRAVITY' } }
}

export function savedMasonryFrameCase(request: ReturnType<typeof readMasonryFrameCase>['masonry'],
  settings: Readonly<Record<string, unknown>>, sharedFloor: unknown) {
  if (Object.keys(settings).some(key => !(masonryFrameStageFields as readonly string[]).includes(key))) {
    throw new Error('Masonry frame settings cannot supply another floor, bound case, sources or derived approval')
  }
  const verticalSettings = Object.fromEntries(Object.entries(settings).filter(([key]) =>
    (verticalRcFloorStageFields as readonly string[]).includes(key)))
  const vertical = savedVerticalRcFloorCase({ schema: 'str-current-vertical-rc-floor-case/1',
    planDigest: request.planDigest, bindingDigest: request.bindingDigest, comparison: request.comparison.verticalCase,
    caseId: request.caseId }, verticalSettings, sharedFloor)
  return { ...request, caseId: vertical.caseId, comparison: { ...request.comparison, verticalCase: vertical.comparison,
    ...Object.fromEntries(ownFields.filter(key => Object.hasOwn(settings, key)).map(key => [key, settings[key]])) } }
}

function nestedBindings(actual: unknown, expected: unknown) {
  if (!record(expected)) return
  if (!record(actual) || !same(Object.keys(actual).sort(), Object.keys(expected).sort())) {
    throw new Error('The masonry frame cannot replace nested schema fields or inject results')
  }
  for (const key of ['schema', 'sourceSHA256', 'use', 'geometryPolicy', 'supportPolicy', 'jointMode', 'waterControl', 'barGeometry']) {
    if (Object.hasOwn(expected, key) && !same(actual[key], expected[key])) {
      throw new Error('The masonry frame cannot replace nested sources, scope or schema')
    }
  }
  for (const key of ['verticalCase', 'monolithicCase', 'houseCase', 'joinedCase', 'portal', 'floor', 'componentCase']) {
    if (Object.hasOwn(expected, key)) nestedBindings(actual[key], expected[key])
  }
}

export function runMasonryFrameCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  const request = exact(input, ['schema', 'planDigest', 'bindingDigest', 'comparison', 'caseId'], 'current masonry frame case')
  if (request.schema !== 'str-current-masonry-frame-case/1' || request.planDigest !== current.planDigest
    || request.bindingDigest !== current.bindingDigest) throw new Error('Stale masonry frame design or method binding')
  const comparison = exact(request.comparison, nativeFields, 'native masonry frame comparison') as Comparison
  nestedBindings(comparison, current.comparison)
  if (typeof request.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(request.caseId)) throw new Error('The masonry frame requires a stable case ID')
  const output: Result = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ case: comparison, name: request.caseId }), encoding: 'utf8', maxBuffer: 96 * 1024 * 1024,
    env: { ...process.env, OPENBLAS_NUM_THREADS: '1', OMP_NUM_THREADS: '1' },
  }))
  const six = (v: unknown): v is Six => Array.isArray(v) && v.length === 6 && v.every(x => typeof x === 'number' && Number.isFinite(x))
  const vertical = output.nativeVertical
  if (output.schema !== 'str-masonry-frame-a-result/1' || !same(output.sourceSHA256, current.comparison.sourceSHA256)
    || !same(output.request, comparison) || !record(vertical) || !record(vertical.native)
    || vertical.schema !== 'str-masonry-frame-a-vertical-result/1'
    || !same(vertical.sourceSHA256, comparison.sourceSHA256)
    || !same(vertical.request, comparison)
    || !same(vertical.native.sourceSHA256, comparison.sourceSHA256)
    || !same(vertical.native.request, comparison)
    || vertical.native.schema !== 'str-masonry-frame-a-compatible-frame-result/1'
    || !same(vertical.plateCase, comparison.verticalCase)
    || vertical.native.caseId !== request.caseId || !Array.isArray(vertical.native.heads) || vertical.native.heads.length !== 52
    || new Set(vertical.native.heads.map(head => head.id)).size !== 52
    || current.headIds.some(id => !vertical.native.heads.some(head => head.id === id))
    || vertical.native.heads.some(head => !six(head.reactionKN_KNm)) || !six(vertical.native.equilibriumResidualKN_KNm)
    || ['candidateAccepted', 'completeHouseProof', 'installedAcceptance', 'roofAdoption', 'waterControlAccepted', 'thermalAccepted',
      'masonryStrengthAccepted', 'archMovementCompatibilityAccepted', 'frameReinforcementAccepted']
      .some(key => output[key] !== false)
    || !record(output.geometry) || !record(output.mass) || !record(output.foundationWeight) || !record(output.plateBending)
    || !output.drawings?.['masonry-frame-a.svg']?.startsWith('<svg')
    || !output.drawings?.['masonry-frame-a-floor.svg']?.startsWith('<svg')) {
    throw new Error('The masonry frame result differs from current sources, actual 52 heads or unearned proof boundary')
  }
  const receiving = comparison.verticalCase.monolithicCase.houseCase.joinedCase.floor.receivingLaws
  if (!record(receiving) || !record(receiving.intermediateSupports)) throw new Error('The actual masonry-frame receiving catalogue is unavailable')
  const receivingIds = Object.keys(receiving.intermediateSupports)
  if (['candidateAccepted', 'floorGravityAccepted', 'masonryConstitutiveLawAccepted', 'completeHouseProof',
      'roofAdoption', 'waterControlAccepted', 'thermalAccepted', 'installedAcceptance'].some(key => vertical[key] !== false)
    || vertical.completeReceivingPaths !== 0 || vertical.unresolvedReceivingPortCount !== receivingIds.length
    || !Array.isArray(vertical.unresolvedReceivingPorts) || vertical.unresolvedReceivingPorts.length !== receivingIds.length
    || new Set(vertical.unresolvedReceivingPorts.map(row => row.id)).size !== receivingIds.length
    || receivingIds.some(id => !vertical.unresolvedReceivingPorts.some(row => row.id === id))) {
    throw new Error('The nested masonry-frame result changed its actual receiving inventory or unqualified evidence scope')
  }
  const bending = output.plateBending
  const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
  if (bending.schema !== 'str-physical-plate-bending-recovery/1' || !Number.isInteger(bending.cellCount)
    || bending.cellCount !== vertical.plate?.cellCount || bending.sampleCount !== 4 * Number(bending.cellCount)
    || !Array.isArray(bending.cells) || bending.cells.length !== bending.cellCount
    || !finite(bending.maximumAbsoluteBendingPlusTwistingKNmPerM) || bending.maximumAbsoluteBendingPlusTwistingKNmPerM < 0
    || !finite(bending.bendingStrainEnergyKNmm) || bending.bendingStrainEnergyKNmm < 0
    || ['localStressConvergenceProven', 'reinforcementAccepted', 'anchorageAccepted'].some(key => bending[key] !== false)) {
    throw new Error('The masonry-frame plate recovery changed its physical cell inventory or asserted unearned reinforcement proof')
  }
  const foundation = output.foundationWeight
  const foundationSettings = comparison.foundationWeight
  if (!record(foundationSettings) || foundation.schema !== 'str-foundation-solid-inventory/1'
    || !record(foundation.sourceSHA256) || !same(Object.keys(foundation.sourceSHA256).sort(),
      ['project/str/studies/foundation_solid_weight.py', 'project/str/studies/current-house-grid.json',
        'project/str/studies/current-house-lateral.json'].sort())
    || Object.entries(foundation.sourceSHA256).some(([path, hash]) => comparison.sourceSHA256[path] !== hash)
    || !record(foundation.request) || foundation.request.unitWeightKNPerM3 !== foundationSettings.unitWeightKNPerM3
    || foundation.request.gravityFactor !== foundationSettings.gravityFactor
    || !finite(foundation.RCVolumeM3) || foundation.RCVolumeM3 <= 0 || !finite(foundation.physicalGKN)
    || foundation.aboveSourceDPCCompressionCreditKN !== 0 || foundation.completeSolidAboveCut !== false
    || ['candidateAccepted', 'capGridResistanceAccepted', 'local3DIntersectionTransferAccepted', 'pileCapacityAccepted']
      .some(key => foundation[key] !== false)) {
    throw new Error('The masonry-frame foundation result changed its source, authored gravity or below-DPC proof boundary')
  }
  const closure = output.courtCornerClosure
  if (comparison.courtCornerClosure === null) {
    if (closure !== null) throw new Error('An unrequested court closure cannot enter the masonry-frame result')
  } else if (!record(closure) || closure.schema !== 'str-court-sw-closure-comparison/1'
    || !same(closure.request, comparison.courtCornerClosure) || !record(closure.sourceSHA256)
    || !same(Object.keys(closure.sourceSHA256).sort(), ['project/str/studies/foundation_solid_weight.py',
      'project/str/studies/current-house-grid.json', 'project/str/studies/current-house-lateral.json',
      'project/str/studies/court_corner_closure.py', 'project/had/studies/water-replan.json'].sort())
    || Object.entries(closure.sourceSHA256).some(([path, hash]) => comparison.sourceSHA256[path] !== hash)
    || !finite(closure.missingGroundContactAreaBeforeMm2) || closure.missingGroundContactAreaBeforeMm2 <= 0
    || closure.missingGroundContactAreaAfterMm2 !== vertical.missingGroundContactAreaMm2
    || closure.missingGroundContactAreaAfterMm2 !== 0
    || !Number.isInteger(closure.newNormalFibreCount) || Number(closure.newNormalFibreCount) <= 0
    || !finite(closure.newRCVolumeM3) || closure.newRCVolumeM3 <= 0 || !finite(closure.addedPhysicalGKN)
    || closure.newSupportCount !== 0 || closure.aboveSourceDPCCompressionCreditKN !== 0
    || closure.foundationUnionAlreadyIncludesAddedBody !== false
    || ['localJointRigidityAccepted', 'local3DTransferAccepted', 'jointReinforcementAccepted', 'candidateAccepted']
      .some(key => closure[key] !== false)) {
    throw new Error('The court closure changed its source-bound contact, material or unqualified rigid-joint assumption')
  }
  const reinforcement = output.floorReinforcement
  if (!record(reinforcement) || reinforcement.schema !== 'str-floor-reinforcement-result/1'
    || !same(reinforcement.settings, comparison.floorReinforcement) || reinforcement.sourceCaseId !== request.caseId
    || reinforcement.momentInspectionKNmPerM !== bending.maximumAbsoluteBendingPlusTwistingKNmPerM
    || ['localStressConvergenceProven', 'reinforcementAccepted', 'anchorageAccepted', 'wholeHouseProof']
      .some(key => reinforcement[key] !== false)) {
    throw new Error('The masonry-frame reinforcement comparison changed its actual demand, authored controls or unearned acceptance')
  }
  return { status: 'computed-comparison' as const,
    source: { planDigest: current.planDigest, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(request) },
    method: { id: 'str-current-masonry-frame/1', path: methodPath, inputs: current.inputs,
      adapter: { path: adapterPath, blob: current.inputs[adapterPath] } },
    native: vertical.native, vertical, courtCornerClosure: closure, geometry: output.geometry, mass: output.mass, foundationWeight: output.foundationWeight,
    plateBending: output.plateBending, floorReinforcement: output.floorReinforcement, frameSvg: output.drawings['masonry-frame-a.svg'], floorSvg: output.drawings['masonry-frame-a-floor.svg'],
    evidence: { state: 'unqualified-separate-masonry-straight-frame-comparison' as const,
      candidateAccepted: false as const, completeHouseProof: false as const, installedAcceptance: false as const,
      scope: 'Separate direct-bearing masonry arch and straight RC frame, actual floor gravity and exact cap/grid self-weight in one52head solve. Sourceground0 only. Reinforcement, actual masonry/receiver resistance, roof/wind, moisture/thermal continuity and raised-ground coordination remain unresolved.' } }
}
