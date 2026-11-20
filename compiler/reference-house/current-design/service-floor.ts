import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import type { runGroundSectionCase } from './structural-ground.js'

const repository = new URL('../../../', import.meta.url)
const methodPath = 'project/had/studies/closed_service_floor.py'
const defaultsPath = 'project/had/studies/closed-service-floor.json'
type Settings = Readonly<Record<string, number>>
type Ground = ReturnType<typeof runGroundSectionCase>
type Pair = readonly [number, number]
type GroundLevels = {
  readonly mineralCourse: Pair
  readonly dryRC: Pair
  readonly glass: Pair
  readonly accessibleDistribution: Pair
  readonly finish: Pair
  readonly ffl: number
  readonly authoredExteriorGrade: number
  readonly localSolum: number
}
type NativeCase = {
  readonly schema: 'closed-service-floor/2'
  readonly sources: Readonly<Record<string, string>>
  readonly settings: Settings
  readonly groundStack: { readonly schema: string; readonly source: unknown; readonly levelsMm: GroundLevels }
}
type NativeResult = {
  readonly schema: 'closed-service-floor-result/2'
  readonly sourceIdentities: Readonly<Record<string, string>>
  readonly groundAuthority: { readonly caseId: string; readonly caseDigest: string; readonly planDigest: string }
  readonly groundStack: GroundLevels
  readonly selectedHouseAdmitted: false
  readonly physicalInstallationAdmitted: false
  readonly sourceApprovalTransferred: false
  readonly status: 'bounded-numerical-comparison' | 'rejected-numerical-comparison'
  readonly diagnostics: readonly string[]
  readonly holds: readonly { readonly id: string; readonly objects: readonly string[]; readonly missing: string }[]
  readonly levelsMm: { readonly ffl: number; readonly actualLowestGround: null }
  readonly [key: string]: unknown
}
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))

function binding(resolved: CurrentDesignResolution, ground: Ground) {
  const planDigest = sha256SemanticFingerprint(resolved.design)
  if (resolved.design.source.kind !== 'georgian-layout-revision'
      || !resolved.disciplineBindings.some(row => row.id === 'str-conditional-interface')
      || ground.status !== 'computed-comparison' || ground.source.planDigest !== planDigest
      || ground.native.schema !== 'dry-side-ground-section-result/2' || ground.native.selected !== false
      || ground.evidence.installedAcceptance !== false || !ground.source.caseDigest) {
    throw new Error('The service floor requires its computed current-plan ground-section stage')
  }
  const reference: NativeCase = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, repository)), '--read'], { encoding: 'utf8' }))
  if (reference.schema !== 'closed-service-floor/2' || !reference.sources || !reference.settings
      || Object.hasOwn(reference.settings, 'accessibleZoneMm') || Object.hasOwn(reference.settings, 'exteriorGradeMm')) {
    throw new Error('The service-floor method must derive its entire floor stack from the ground section')
  }
  const identities = Object.assign({}, ...resolved.disciplineBindings.map(row => row.identities)) as Record<string, string>
  const paths = [...new Set([methodPath, defaultsPath, ...Object.keys(reference.sources), ...Object.keys(ground.method.inputs)])]
  const inputs = Object.fromEntries(paths.map(path => {
    const bytes = readFileSync(new URL(path, repository))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (identities[path] !== blob || (Object.hasOwn(ground.method.inputs, path) && ground.method.inputs[path] !== blob)) {
      throw new Error(`Stale service-floor or ground-section current source binding at ${path}`)
    }
    if (Object.hasOwn(reference.sources, path) && createHash('sha256').update(bytes).digest('hex') !== reference.sources[path]) {
      throw new Error(`Stale native service-floor source at ${path}`)
    }
    return [path, blob]
  }))
  const rawLevels = ground.native.levelsMm as unknown as Record<string, unknown>
  const interval = (key: string): Pair => {
    const value = rawLevels[key]
    if (!Array.isArray(value) || value.length !== 2 || !value.every(v => typeof v === 'number' && Number.isFinite(v))) {
      throw new Error(`The ground-section stage did not supply actual ${key} levels`)
    }
    return [value[0], value[1]]
  }
  if (typeof rawLevels.ffl !== 'number' || !Number.isFinite(rawLevels.ffl)
      || typeof rawLevels.authoredExteriorGrade !== 'number' || !Number.isFinite(rawLevels.authoredExteriorGrade)
      || typeof rawLevels.localSolum !== 'number' || !Number.isFinite(rawLevels.localSolum)) {
    throw new Error('The service floor has no ground-section FFL or exterior datum')
  }
  const levels: GroundLevels = { mineralCourse: interval('mineralCourse'), dryRC: interval('dryRC'), glass: interval('glass'),
    accessibleDistribution: interval('accessibleDistribution'), finish: interval('finish'),
    ffl: rawLevels.ffl, authoredExteriorGrade: rawLevels.authoredExteriorGrade, localSolum: rawLevels.localSolum }
  if (JSON.stringify(levels.mineralCourse) !== '[0,150]' || JSON.stringify(levels.dryRC) !== '[150,350]' || JSON.stringify(levels.glass) !== '[350,450]') {
    throw new Error('Unsupported ground-section stack for this service-floor body, scupper and support method')
  }
  const source = { id: resolved.design.source.id, planDigest }
  const groundResultDigest = sha256SemanticFingerprint(ground)
  const groundStack = { schema: 'service-floor-ground-stack/1', source: { caseId: ground.source.caseId,
    caseDigest: ground.source.caseDigest, planDigest }, levelsMm: levels }
  return { reference, inputs, source, groundResultDigest, groundStack,
    bindingDigest: sha256SemanticFingerprint({ disciplines: resolved.disciplineBindings, inputs, groundResultDigest }) }
}

export function readServiceFloorCase(resolved: CurrentDesignResolution, ground: Ground) {
  const current = binding(resolved, ground)
  return { schema: 'had-service-floor-request/1' as const, design: resolved.design,
    serviceFloor: { schema: 'had-service-floor-case/1' as const, planDigest: current.source.planDigest,
      bindingDigest: current.bindingDigest, groundCaseDigest: ground.source.caseDigest,
      groundResultDigest: current.groundResultDigest, caseId: 'closed-e-split-lids', settings: current.reference.settings } }
}

export function runServiceFloorCase(resolved: CurrentDesignResolution, ground: Ground, input: unknown) {
  const current = binding(resolved, ground)
  if (!exact(input, ['schema', 'planDigest', 'bindingDigest', 'groundCaseDigest', 'groundResultDigest', 'caseId', 'settings'])
      || input.schema !== 'had-service-floor-case/1' || input.planDigest !== current.source.planDigest
      || input.bindingDigest !== current.bindingDigest || input.groundCaseDigest !== ground.source.caseDigest
      || input.groundResultDigest !== current.groundResultDigest) throw new Error('Stale service-floor plan, source or ground-section case')
  if (typeof input.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(input.caseId)) throw new Error('The service-floor candidate requires a stable case ID')
  if (!exact(input.settings, Object.keys(current.reference.settings))) throw new Error('Supply only service-floor settings; floor levels, sources and approval derive from the ground-section stage')
  const nativeCase = { ...current.reference, groundStack: current.groundStack, settings: input.settings }
  const output: { readonly schema: string; readonly result: NativeResult; readonly sectionPlanSvg: string } = JSON.parse(execFileSync('python3',
    ['-B', fileURLToPath(new URL(methodPath, repository))], { input: JSON.stringify(nativeCase), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }))
  if (output.schema !== 'closed-service-floor-replay/2' || output.result.schema !== 'closed-service-floor-result/2'
      || output.result.selectedHouseAdmitted !== false || output.result.physicalInstallationAdmitted !== false
      || output.result.sourceApprovalTransferred !== false || !output.sectionPlanSvg?.startsWith('<svg')
      || sha256SemanticFingerprint(output.result.sourceIdentities) !== sha256SemanticFingerprint(current.reference.sources)
      || sha256SemanticFingerprint(output.result.groundAuthority) !== sha256SemanticFingerprint(current.groundStack.source)
      || sha256SemanticFingerprint(output.result.groundStack) !== sha256SemanticFingerprint(current.groundStack.levelsMm)) {
    throw new Error('The service-floor replay changed its current source, ground authority or comparison ceiling')
  }
  return { status: 'computed-comparison' as const,
    source: { ...current.source, caseId: input.caseId, caseDigest: sha256SemanticFingerprint(input),
      groundCaseDigest: ground.source.caseDigest, groundResultDigest: current.groundResultDigest },
    method: { id: 'had-closed-service-floor/2', path: methodPath, blob: current.inputs[methodPath], inputs: current.inputs },
    native: output.result, holds: output.result.holds, geometryStatus: output.result.status, sectionPlanSvg: output.sectionPlanSvg,
    diagnostics: [{ code: 'SERVICE_FLOOR_ADMISSION_UNQUALIFIED',
      state: 'unqualified-candidate' as const, objects: [{ kind: 'service-floor' as const, id: input.caseId }],
      message: 'The service-floor comparison uses this exact ground-section stack. Numerical lid/water/renewal/support comparisons do not transfer original hydraulic, material, weather, handling, grid/contact, site or installed acceptance.' }],
    evidence: { state: 'unselected-service-floor-comparison' as const, installedAcceptance: false as const,
      scope: 'Source-bound split E lids/body/local leak drain and actual-grid N support trial. Rigid-primary transfer, signed added head actions and exact physical proof limits remain explicit.' } }
}
