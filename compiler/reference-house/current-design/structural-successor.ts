import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/joined_successor_compatibility.py'
const kernelPath = 'project/str/studies/joined_successor_kernel.py'
const sourcePaths = [
  'project/str/studies/current-house-grid.json',
  'project/str/studies/current-house-lateral.json',
  'project/str/studies/current-house-ground-ties.json',
  'project/str/studies/floor-portal-monolithic-drag.json',
  'project/str/studies/current-house-floor-stops.json',
  'project/str/studies/structural-linear.py',
] as const

type Six = readonly [number, number, number, number, number, number]
type NativeResult = {
  readonly schema: 'str-joined-successor-result/1'
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly status: 'coupled-boundary-comparison'
  readonly section: { readonly A: number }
  readonly nodeCount: number
  readonly memberCount: number
  readonly applied: readonly unknown[]
  readonly heads: readonly { readonly id: string; readonly xyzMm: readonly [number, number, number]; readonly reactionKN_KNm: Six; readonly displacementMmRad: Six }[]
  readonly interfaces: readonly { readonly id: string; readonly forceOnUpperKN_KNm: Six; readonly upperDisplacementMmRad: Six; readonly lowerDisplacementMmRad: Six }[]
  readonly equilibriumResidualKN_KNm: Six
  readonly installedAcceptance: false
  readonly completeHouseProof: false
  readonly diagnostics: readonly string[]
}

function binding(resolved: CurrentDesignResolution) {
  const structure = resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  if (!structure) throw new Error('The joined successor replay requires the current structural source')
  const sources = Object.fromEntries([...sourcePaths, methodPath, kernelPath].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (structure.identities[path] !== blob) throw new Error(`The joined successor source differs from its structural binding at ${path}`)
    return [path, { blob, sha256: createHash('sha256').update(bytes).digest('hex') }]
  }))
  return { structure, sources, source: { id: resolved.design.source.id, planDigest: sha256SemanticFingerprint(resolved.design) } }
}

export function readStructuralSuccessorCase(resolved: CurrentDesignResolution) {
  const current = binding(resolved)
  const comparison: unknown = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'], { encoding: 'utf8' }))
  return {
    schema: 'str-successor-request/1' as const,
    design: resolved.design,
    successor: { schema: 'str-successor-case/1' as const, planDigest: current.source.planDigest,
      bindingDigest: current.structure.digest, comparison },
  }
}

export function runStructuralSuccessorCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = binding(resolved)
  const fields = ['schema', 'planDigest', 'bindingDigest', 'comparison']
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== fields.length
      || fields.some(field => !Object.hasOwn(input, field))) throw new Error('Expected an explicit joined successor case')
  const value = input as Record<string, unknown>
  if (value.schema !== 'str-successor-case/1' || value.planDigest !== current.source.planDigest || value.bindingDigest !== current.structure.digest) {
    throw new Error('Stale or unsupported joined successor design binding')
  }
  const native: NativeResult = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify(value.comparison), encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  }))
  if (native.schema !== 'str-joined-successor-result/1' || native.heads.length !== 52
      || new Set(native.heads.map(head => head.id)).size !== 52 || native.installedAcceptance !== false || native.completeHouseProof !== false
      || sourcePaths.some(path => native.sourceSHA256[path] !== current.sources[path].sha256)) {
    throw new Error('The joined successor replay does not match its source and proof boundary')
  }
  return {
    status: 'computed-comparison' as const,
    source: { ...current.source, caseDigest: sha256SemanticFingerprint(value) },
    method: { id: 'str-joined-successor-compatibility/1', path: methodPath, blob: current.sources[methodPath].blob,
      inputs: Object.fromEntries(Object.entries(current.sources).map(([path, source]) => [path, source.blob])) },
    native,
    evidence: { state: 'authored-constitutive-comparison' as const, installedAcceptance: false as const,
      scope: 'Coupled finite frame and unilateral north DPC comparison on all 52 ideal pinned heads. Actual intermediate floor supports, full plate/chord, tied-roof successor, local resistance, moisture and site acceptance remain unresolved.' },
  }
}
