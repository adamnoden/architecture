import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { readGroundSectionCase, runGroundSectionCase } from './structural-ground.js'

const repository = new URL('../../../', import.meta.url)
const methodPath = 'project/had/studies/house_vertical_profile.py'
const wrapperPath='compiler/reference-house/current-design/house-vertical-profile.ts'
type GroundCase = ReturnType<typeof readGroundSectionCase>['ground']
type NativeCase = {
  readonly schema: 'house-vertical-profile/1'
  readonly sources: Readonly<Record<string, string>>
  readonly groundCase: { readonly settings: Readonly<Record<string, unknown>>; readonly [key: string]: unknown }
}
type NativeProfile = {
  readonly schema: 'house-vertical-profile-result/1'
  readonly sourceIdentities: Readonly<Record<string, string>>
  readonly selectedHouseAdmitted: false
  readonly installedAcceptance: false
  readonly groundLevelsMm: Readonly<Record<string, unknown>>
  readonly occupied: { readonly groundFFLMm: number; readonly firstFFLMm: number; readonly firstRCMm: readonly number[]; readonly atticDatumMm: number; readonly storeyIntervalMm: number }
  readonly roof: { readonly coherentWeatherProfile: null; readonly wholeHouseWeatherHeightAboveAuthoredGradeMm: null }
  readonly diagnostics: readonly { readonly code: string; readonly objects: readonly string[]; readonly message: string }[]
  readonly [key: string]: unknown
}
const exact = (value: unknown, fields: readonly string[]): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key))

function binding(resolved: CurrentDesignResolution) {
  if (resolved.design.source.kind !== 'georgian-layout-revision') throw new Error('The vertical profile requires its current structural house and authored ground case')
  const reference: NativeCase = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, repository)), '--read'], { encoding: 'utf8' }))
  if (reference.schema !== 'house-vertical-profile/1' || !reference.sources || !reference.groundCase) throw new Error('Unsupported native house-profile contract')
  const identities = Object.assign({}, ...resolved.disciplineBindings.map(row => row.identities)) as Record<string, string>
  const inputs = Object.fromEntries(Object.entries(reference.sources).map(([path, sha256]) => {
    const bytes = readFileSync(new URL(path, repository))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (identities[path] !== blob || createHash('sha256').update(bytes).digest('hex') !== sha256) throw new Error(`Stale vertical-profile current source binding at ${path}`)
    return [path, blob]
  }))
  const wrapperBytes=readFileSync(new URL(wrapperPath,repository)),wrapperBlob=createHash('sha1').update(`blob ${wrapperBytes.length}\0`).update(wrapperBytes).digest('hex')
  if(identities[wrapperPath]!==wrapperBlob)throw Error(`Stale vertical-profile current source binding at ${wrapperPath}`)
  inputs[wrapperPath]=wrapperBlob
  const planDigest = sha256SemanticFingerprint(resolved.design)
  // Receipts are outputs: a profile may itself be recorded inside one. Bind
  // only exact authored sources/methods and the plan, avoiding a self-reference.
  return { reference, inputs, planDigest, bindingDigest: sha256SemanticFingerprint({ planDigest, inputs }) }
}

export function readHouseVerticalProfileCase(resolved: CurrentDesignResolution, groundCase?: GroundCase) {
  const current = binding(resolved)
  const ground = groundCase ?? readGroundSectionCase(resolved).ground
  runGroundSectionCase(resolved, ground)
  return { schema: 'house-vertical-profile-request/1' as const, design: resolved.design,
    profile: { schema: 'house-vertical-profile-case/1' as const, planDigest: current.planDigest,
      bindingDigest: current.bindingDigest, groundCase: structuredClone(ground) } }
}

export function runHouseVerticalProfileCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = binding(resolved)
  if (!exact(input, ['schema', 'planDigest', 'bindingDigest', 'groundCase']) || input.schema !== 'house-vertical-profile-case/1'
      || input.planDigest !== current.planDigest || input.bindingDigest !== current.bindingDigest) throw new Error('Stale or unsupported house vertical-profile case; floor levels derive only from groundCase')
  const ground = runGroundSectionCase(resolved, input.groundCase)
  const authored = ground.authoredCase as GroundCase
  const nativeCase = { ...current.reference, groundCase: { ...current.reference.groundCase,
    settings: { ...authored.settings, caseId: authored.caseId, geometryOnly: current.reference.groundCase.settings.geometryOnly } } }
  const output: { readonly schema: string; readonly result: NativeProfile; readonly sectionSvg: string } = JSON.parse(execFileSync('python3',
    ['-B', fileURLToPath(new URL(methodPath, repository))], { input: JSON.stringify(nativeCase), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }))
  if (output.schema !== 'house-vertical-profile-replay/1' || output.result.schema !== 'house-vertical-profile-result/1'
      || output.result.selectedHouseAdmitted !== false || output.result.installedAcceptance !== false
      || sha256SemanticFingerprint(output.result.sourceIdentities) !== sha256SemanticFingerprint(current.reference.sources)
      || sha256SemanticFingerprint(output.result.groundLevelsMm) !== sha256SemanticFingerprint(ground.native.levelsMm)
      || !output.sectionSvg?.startsWith('<svg')) throw new Error('The profile does not match its recomputed source-bound ground stage')
  return { status: 'computed-unselected-profile' as const, authoredCase: structuredClone(input),
    source: { id: resolved.design.source.id, planDigest: current.planDigest, groundCaseDigest: ground.source.caseDigest,
      groundResultDigest: sha256SemanticFingerprint(ground.native), caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'source-derived-house-vertical-profile/1', path: methodPath, blob: current.inputs[methodPath], inputs: current.inputs },
    native: output.result, sectionSvg: output.sectionSvg, diagnostics: output.result.diagnostics,
    evidence: { installedAcceptance: false as const, selectedHouseAdmitted: false as const,
      scope: 'One actual ground case drives occupied structure, arch/wall datums and approaches. Cold foundations remain fixed; raised force replay and coherent roof/weather enclosure remain unqualified.' } }
}
