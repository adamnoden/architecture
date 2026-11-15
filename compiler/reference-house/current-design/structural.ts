import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const repositoryRoot = new URL('../../../', import.meta.url)
const sourcePath = 'project/had/studies/water-replan.json'
const geometryPath = 'project/had/studies/open-north-loggia.json'
const loadsPath = 'project/str/studies/open-loggia-support.json'
const methodPath = 'project/str/studies/current-house-bridge.py'
interface BridgeComparison {
  readonly assumptions: { readonly axisSpanM: number; readonly actualClearSpanM: number }
  readonly members: readonly {
    readonly line: { readonly id: string }
    readonly minimumPassingDepthAtBothCovers: number | null
    readonly capacityComparison: readonly {
      readonly depth: number
      readonly cover: number
      readonly M: number
      readonly T: number
      readonly deflectionIncluding400microstrain: number
      readonly pass: boolean
    }[]
  }[]
}
interface NativeBridgeResponse {
  readonly schema: 'current-bridge-comparison/1'
  readonly mode: 'reference' | 'span-comparison'
  readonly supportAxesYMm: readonly [number, number]
  readonly sectionScreenPasses: boolean
  readonly installedAcceptance: false
  readonly comparison: BridgeComparison
}

const receiptPath = 'project/str/studies/current-house-bridge.json'

function readSource(path: string) {
  const bytes = readFileSync(new URL(path, repositoryRoot))
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  return { blob, sha256, parse: () => JSON.parse(bytes.toString('utf8')) }
}

export function runStructuralBridge(resolved: CurrentDesignResolution, trialAxes?: readonly [number, number]) {
  const { design, disciplineBindings } = resolved
  const source = { id: design.source.id, planDigest: sha256SemanticFingerprint(design) }
  const occurrence = { kind: 'structural-interface', id: 'gallery-east-water-weather/short-bridge' } as const
  const author = disciplineBindings.find(binding => binding.id === 'had-selected-water')
  const structure = disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  if (!author || !structure) {
    return { status: 'unavailable' as const, source, diagnostics: [{
      code: 'BRIDGE_REQUIRES_CURRENT_HAD' as const, occurrence,
      message: 'This design does not carry the selected HAD bridge interface.',
    }] }
  }

  const had = readSource(sourcePath)
  const geometry = readSource(geometryPath)
  const loads = readSource(loadsPath)
  if (author.identities[sourcePath] !== had.blob || author.identities[geometryPath] !== geometry.blob
      || structure.identities[loadsPath] !== loads.blob) {
    throw new Error('The authored bridge input differs from its current binding')
  }

  const bridge = had.parse().bridge
  const authoredAxes: [number, number] = [bridge.supportAxesY[0], bridge.supportAxesY[1]]
  const supportAxesYMm = trialAxes ?? authoredAxes
  const spanMm = supportAxesYMm[1] - supportAxesYMm[0]
  const courtNorthMm = design.envelope.court.y + design.envelope.court.depth
  if (supportAxesYMm.length !== 2 || !supportAxesYMm.every(Number.isFinite) || supportAxesYMm[0] !== authoredAxes[0]
      || spanMm <= bridge.supportNodes.plan[1] || supportAxesYMm[1] > courtNorthMm) {
    return { status: 'unavailable' as const, source, diagnostics: [{
      code: 'BRIDGE_AXES_OUTSIDE_METHOD' as const, occurrence,
      message: 'Keep the authored first support and a positive clear span within the court corridor.',
    }] }
  }

  const mode = trialAxes === undefined ? 'reference' : 'span-comparison'
  const method = readSource(methodPath)
  const receipt = readSource(receiptPath)
  if (structure.identities[methodPath] !== method.blob || structure.identities[receiptPath] !== receipt.blob) {
    throw new Error('The current bridge method or receipt differs from its structural binding')
  }
  const native: NativeBridgeResponse = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, repositoryRoot)), '--current-request'], {
    input: JSON.stringify({ schema: 'current-bridge-request/1', mode, sourceSha256: had.sha256, supportAxesYMm }),
    encoding: 'utf8',
  }))
  if (mode === 'reference' && sha256SemanticFingerprint(native.comparison) !== sha256SemanticFingerprint(receipt.parse())) {
    throw new Error('The recomputed bridge comparison differs from its retained receipt')
  }

  return {
    status: 'computed-comparison' as const, source, occurrence,
    method: {
      id: 'str-current-house-bridge/1', path: methodPath, blob: method.blob,
      baseline: { path: receiptPath, blob: receipt.blob },
      inputs: { [sourcePath]: had.blob, [geometryPath]: geometry.blob, [loadsPath]: loads.blob },
    },
    native,
    diagnostics: [{
      code: 'BRIDGE_SCREEN_ONLY' as const, occurrence,
      message: 'Retained local actions and section screening only. Edited support geometry, nodes, field redistribution, ground and installation are unqualified.',
    }],
  }
}

const foundationMethodPath = 'project/str/studies/current-house-joined-foundation.py'
const headCaseMethodPath = 'project/str/studies/current-house-structural-case.py'
const foundationReceiptPath = 'project/str/studies/current-house-joined-foundation.json'

function bindStructuralActions(resolved: CurrentDesignResolution) {
  const { design, disciplineBindings } = resolved
  const source = { id: design.source.id, planDigest: sha256SemanticFingerprint(design) }
  const occurrence = { kind: 'structural-system', id: 'STR-52-HEAD-JOINED-FOUNDATION' } as const
  const structure = disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  if (!structure) {
    return { status: 'unavailable' as const, source, diagnostics: [{
      code: 'HEAD_ACTIONS_REQUIRE_CURRENT_STR' as const, occurrence,
      message: 'This design has no applicable signed head actions. Rebuild its structural model before transferring the result.',
    }] }
  }

  const method = readSource(foundationMethodPath)
  const receipt = readSource(foundationReceiptPath)
  if (structure.identities[foundationMethodPath] !== method.blob || structure.identities[foundationReceiptPath] !== receipt.blob) {
    throw new Error('The signed foundation method or receipt differs from its current binding')
  }
  const native: {
    readonly sources: Readonly<Record<string, string>>
    readonly admitted: false
    readonly status: string
    readonly heads: readonly { readonly id: string; readonly xy: [number, number] }[]
    readonly coherentSignedStates: readonly { readonly wind: number }[]
  } = receipt.parse()
  const inputs = Object.fromEntries(Object.entries(native.sources).map(([path, expected]) => {
    if (!(path in structure.identities)) throw new Error(`The source ${path} has no structural binding`)
    const measured = readSource(path)
    if (measured.blob !== structure.identities[path] || expected !== measured.sha256) {
      throw new Error(`The signed foundation receipt is stale at ${path}`)
    }
    return [path, measured.blob]
  }))
  return { status: 'bound' as const, source, occurrence, structure, method, receipt, native, inputs }
}

export function runStructuralActions(resolved: CurrentDesignResolution) {
  const binding = bindStructuralActions(resolved)
  if (binding.status === 'unavailable') return binding
  const { source, occurrence, method, receipt, native, inputs } = binding
  execFileSync('python3', ['-B', fileURLToPath(new URL(foundationMethodPath, repositoryRoot)), '--check'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return {
    status: 'computed-comparison' as const, source, occurrence,
    method: {
      id: 'str-current-house-signed-head-actions/1', path: foundationMethodPath, blob: method.blob,
      receipt: { path: foundationReceiptPath, blob: receipt.blob }, inputs,
    },
    native,
    diagnostics: [{
      code: 'HEAD_ACTIONS_SCREEN_ONLY' as const, occurrence,
      message: 'Fixed-base signed actions only. Soil, section, proposed collar confinement and connection stiffness remain open.',
    }],
  }
}

interface NativeHeadCase {
  readonly schema: 'str-head-case-result/1'
  readonly windIndex: number
  readonly windProgramme: readonly number[]
  readonly combination: unknown
  readonly admitted: false
  readonly headComponentOrder: readonly ['N', 'Cx', 'Cy', 'Vx', 'Vy']
  readonly heads: readonly {
    readonly id: string
    readonly xy: readonly [number, number]
    readonly actions: readonly [number, number, number, number, number]
  }[]
  readonly releasedPassivePads: readonly {
    readonly xy: readonly [number, number]
    readonly signedBeforeRelease: number
  }[]
  readonly verticalEquilibrium: readonly [number, number, number]
  readonly horizontalEquilibrium: readonly [number, number, number]
}

function exactFields(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value) ||
    Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) {
    throw new Error(`Invalid ${label} fields`)
  }
  return value as Record<string, unknown>
}

export function readStructuralCase(resolved: CurrentDesignResolution) {
  const binding = bindStructuralActions(resolved)
  if (binding.status === 'unavailable') return binding
  return {
    schema: 'str-structural-case-request/1' as const,
    design: resolved.design,
    case: {
      schema: 'str-structural-case/1' as const,
      planDigest: binding.source.planDigest,
      bindingDigest: binding.structure.digest,
      windIndex: 8,
      combination: { id: 'stripped suction+wind' as const, suctionFactor: 1 },
      joint: {
        id: 'gallery-east-water-weather/short-bridge' as const,
        supportAxesYMm: readSource(sourcePath).parse().bridge.supportAxesY as [number, number],
        sectionDepthMm: 250,
        materials: { concrete: 'C30', reinforcingSteel: 'S500' },
      },
    },
  }
}

export function runStructuralCase(resolved: CurrentDesignResolution, value: unknown) {
  const binding = bindStructuralActions(resolved)
  if (binding.status === 'unavailable') return binding
  const input = exactFields(value, [
    'schema', 'planDigest', 'bindingDigest', 'windIndex', 'combination', 'joint',
  ], 'structural case')
  if (input.schema !== 'str-structural-case/1' || input.planDigest !== binding.source.planDigest ||
    input.bindingDigest !== binding.structure.digest) {
    throw new Error('Stale or unsupported structural case source binding')
  }
  const joint = exactFields(input.joint, ['id', 'supportAxesYMm', 'sectionDepthMm', 'materials'], 'structural joint')
  const materials = exactFields(joint.materials, ['concrete', 'reinforcingSteel'], 'structural joint materials')
  if (joint.id !== 'gallery-east-water-weather/short-bridge' ||
    materials.concrete !== 'C30' || materials.reinforcingSteel !== 'S500') {
    throw new Error('This joint or material change requires a new authored structural method')
  }
  if (!Array.isArray(joint.supportAxesYMm) || joint.supportAxesYMm.length !== 2 ||
    !joint.supportAxesYMm.every(Number.isFinite) ||
    typeof joint.sectionDepthMm !== 'number' || ![200, 250, 300, 350, 450].includes(joint.sectionDepthMm)) {
    throw new Error('Choose a retained bridge section depth and two valid support coordinates')
  }
  const axes: [number, number] = [joint.supportAxesYMm[0], joint.supportAxesYMm[1]]
  const bridge = runStructuralBridge(resolved, axes)
  if (bridge.status === 'unavailable') return bridge
  const method = readSource(headCaseMethodPath)
  if (binding.structure.identities[headCaseMethodPath] !== method.blob) {
    throw new Error('The signed load case runner differs from its current binding')
  }
  const foundation: NativeHeadCase = JSON.parse(execFileSync('python3', [
    '-B', fileURLToPath(new URL(headCaseMethodPath, repositoryRoot)),
  ], {
    input: JSON.stringify({ schema: 'str-head-case/1', windIndex: input.windIndex, combination: input.combination }),
    encoding: 'utf8',
  }))
  return {
    schema: 'str-structural-case-result/1' as const,
    status: 'computed-comparison' as const,
    source: binding.source,
    foundation: {
      method: { path: headCaseMethodPath, blob: method.blob,
        solver: { path: foundationMethodPath, blob: binding.method.blob }, inputs: binding.inputs },
      native: foundation,
    },
    joint: {
      occurrence: bridge.occurrence,
      method: bridge.method,
      materials,
      axesYMm: axes,
      clearSpanMm: bridge.native.comparison.assumptions.actualClearSpanM * 1000,
      members: bridge.native.comparison.members.map(member => ({
        line: member.line,
        compareAtBothCovers: member.capacityComparison.filter(row => row.depth === joint.sectionDepthMm),
      })),
      installedAcceptance: false as const,
    },
    diagnostics: [{
      code: 'FIXED_BASE_AND_LOCAL_BRIDGE_ONLY' as const,
      message: 'Foundation reactions use unchanged geometry and signed actions. The local bridge trial does not move the foundation or supply coupled actions. Portal, collar, arch, stiffness, material and physical structural acceptance remain open.',
    }],
  }
}
