import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/dry_side_ground_section.py'
const defaultsPath = 'project/str/studies/dry-side-ground-section.json'
const wrapperPath = 'compiler/reference-house/current-design/structural-ground.ts'
type Settings = Readonly<Record<string, unknown>>
type NativeCase = {
  readonly schema: 'dry-side-ground-section/2'
  readonly status: string
  readonly sources: Readonly<Record<string, string>>
  readonly settings: Settings & { readonly caseId: string; readonly geometryOnly: string }
}
type NativeResult = {
  readonly schema: 'dry-side-ground-section-result/2'
  readonly sources: Readonly<Record<string, string>>
  readonly selected: false
  readonly levelsMm: { readonly ffl: number; readonly occupiedTranslation: number }
  readonly diagnostics: readonly unknown[]
  readonly invalidatedEvidence: readonly string[]
  readonly holds: readonly string[]
  readonly [key: string]: unknown
}
const exact = (value: unknown, keys: readonly string[]): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key))

function binding(resolved: CurrentDesignResolution) {
  const structure = resolved.disciplineBindings.find(value => value.id === 'str-conditional-interface')
  if (!structure || resolved.design.source.kind !== 'georgian-layout-revision') {
    throw new Error('The dry ground section requires the admitted current structural house')
  }
  const reference: NativeCase = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'], { encoding: 'utf8' }))
  if (reference.schema !== 'dry-side-ground-section/2' || !reference.sources || !reference.settings) {
    throw new Error('The ground section did not provide its versioned source-bound inputs')
  }
  const identities = Object.assign({}, ...resolved.disciplineBindings.map(value => value.identities)) as Record<string, string>
  const inputs = Object.fromEntries([wrapperPath, methodPath, defaultsPath, ...Object.keys(reference.sources)].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (identities[path] !== blob) throw new Error(`The ground section differs from its current source binding at ${path}`)
    if (Object.hasOwn(reference.sources, path) && createHash('sha256').update(bytes).digest('hex') !== reference.sources[path]) {
      throw new Error(`The ground section source changed at ${path}`)
    }
    return [path, blob]
  }))
  const source = { id: resolved.design.source.id, planDigest: sha256SemanticFingerprint(resolved.design) }
  // Only actual checked inputs own this calculation. Hashing every discipline's
  // OUTPUT receipts here makes a ground-dependent receipt depend on itself.
  return { reference, inputs, source, bindingDigest: sha256SemanticFingerprint({ source, inputs }) }
}

export function readGroundSectionCase(resolved: CurrentDesignResolution) {
  const current = binding(resolved)
  const { caseId, geometryOnly: _scope, ...settings } = current.reference.settings
  return { schema: 'str-dry-ground-request/1' as const, design: resolved.design,
    ground: { schema: 'str-dry-ground-case/1' as const, planDigest: current.source.planDigest,
      bindingDigest: current.bindingDigest, caseId, settings } }
}

export function runGroundSectionCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = binding(resolved)
  if (!exact(input, ['schema', 'planDigest', 'bindingDigest', 'caseId', 'settings'])
      || input.schema !== 'str-dry-ground-case/1' || input.planDigest !== current.source.planDigest
      || input.bindingDigest !== current.bindingDigest) throw new Error('Stale or unsupported dry ground-section case')
  if (typeof input.caseId !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(input.caseId)) throw new Error('The ground-section candidate requires a stable case ID')
  const fields = Object.keys(current.reference.settings).filter(key => !['caseId', 'geometryOnly'].includes(key))
  if (!exact(input.settings, fields)) throw new Error('Supply only the authored ground-section settings without source identities or approval')
  const nativeCase = { ...current.reference, settings: { ...input.settings, caseId: input.caseId,
    geometryOnly: current.reference.settings.geometryOnly } }
  const output: { readonly schema: string; readonly result: NativeResult; readonly sectionSvg: string } = JSON.parse(execFileSync('python3',
    ['-B', fileURLToPath(new URL(methodPath, root))], { input: JSON.stringify(nativeCase), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }))
  if (output.schema !== 'dry-side-ground-section-replay/1' || output.result.schema !== 'dry-side-ground-section-result/2'
      || output.result.selected !== false || !output.sectionSvg?.startsWith('<svg')
      || sha256SemanticFingerprint(output.result.sources) !== sha256SemanticFingerprint(current.reference.sources)) {
    throw new Error('The dry ground section does not match its current source and comparison boundary')
  }
  return { status: 'computed-comparison' as const,
    authoredCase: structuredClone(input),
    source: { ...current.source, caseId: input.caseId, caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'str-separated-dry-ground/2', path: methodPath, blob: current.inputs[methodPath], inputs: current.inputs },
    native: output.result, sectionSvg: output.sectionSvg,
    diagnostics: [{ code: 'GROUND_SECTION_JOINED_HOUSE_RECHECK', state: 'unqualified-candidate' as const,
      objects: [{ kind: 'ground-section' as const, id: input.caseId }],
      message: `This ground-section candidate translates occupied levels by ${output.result.levelsMm.occupiedTranslation} mm. Nominal plans, services, water routes and roof retain their separately bound source scope; their vertical coordination, pressure height and compatible foundation/contact evidence are not transferred.` }],
    evidence: { state: 'unselected-ground-section-comparison' as const, installedAcceptance: false as const,
      scope: 'Source-derived ground construction, actual support union, local member comparisons and approach/threshold consequences. Mineral contact/shear, whole-house compatibility, complete weather/thermal boundaries and owner acceptance remain open.' } }
}
