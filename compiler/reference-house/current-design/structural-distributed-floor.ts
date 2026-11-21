import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/distributed_floor_compatibility.py'
const adapterPath = 'compiler/reference-house/current-design/structural-distributed-floor.ts'
const nativePaths = [
  'project/had/studies/water-replan.json',
  'project/mat/studies/whole-house-service-baseline.json',
  'project/str/studies/current-house-floor-closure.json',
  'project/str/studies/current-house-floor-closure.py',
  'project/str/studies/current-house-floor-stops.json',
  'project/str/studies/current-house-grid.json',
  'project/str/studies/current-house-ground-ties.json',
  'project/str/studies/current-house-head-actions.json',
  'project/str/studies/current-house-head-actions.py',
  'project/str/studies/current-house-lateral.json',
  'project/str/studies/current-house-membrane.py',
  'project/str/studies/current-house-roof-bracing.py',
  'project/str/studies/distributed_floor_compatibility.py',
  'project/str/studies/distributed_floor_views.py',
  'project/str/studies/floor-portal-monolithic-drag.json',
  'project/str/studies/joined_successor_compatibility.py',
  'project/str/studies/joined_successor_kernel.py',
  'project/str/studies/open-loggia-support.json',
  'project/str/studies/perforated_floor_condensation.py',
  'project/str/studies/physical-slab-join.json',
  'project/str/studies/retained_component_geometry.py',
  'project/str/studies/retained_components.py',
  'project/str/studies/structural-linear.py',
  'project/str/studies/vertical-floor-requirements.txt',
] as const
const comparisonFields = ['schema', 'sourceSHA256', 'cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw',
  'edgeBand', 'maxPitchMm', 'componentCase', 'boundaryCase', 'receivingLaws', 'use'] as const

type Six = readonly [number, number, number, number, number, number]
type NativeComparison = Readonly<Record<string, unknown>> & {
  readonly schema: 'str-distributed-floor-case/1'
  readonly sourceSHA256: Readonly<Record<string, string>>
}
type NativeResult = {
  readonly schema: 'str-distributed-floor-result/1'
  readonly status: 'four-wall-diaphragm-coupled-comparison'
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly heads: readonly { readonly id: string; readonly xyzMm: readonly [number, number, number];
    readonly reactionKN_KNm: Six; readonly displacementMmRad: Six }[]
  readonly interfaces: readonly { readonly id: string; readonly forceOnUpperKN_KNm: Six;
    readonly upperDisplacementMmRad: Six; readonly lowerDisplacementMmRad: Six }[]
  readonly floor: { readonly membraneAreaM2: number; readonly triangleCount: number;
    readonly compatiblePortDisplacements: readonly number[]; readonly condensedStiffnessKNPerMm: readonly (readonly number[])[];
    readonly condensedForceKN: readonly number[]; readonly [key: string]: unknown }
  readonly nodeCount: number
  readonly memberCount: number
  readonly equilibriumResidualKN_KNm: Six
  readonly unmodelledIntermediateReceivingPorts: readonly { readonly id: string; readonly wallId: string;
    readonly xyMm: readonly [number, number]; readonly law: null; readonly status: string }[]
  readonly missingPorts: readonly { readonly id: string; readonly missing: string }[]
  readonly drawings: Readonly<Record<string, string>>
  readonly installedAcceptance: false
  readonly completeHouseProof: false
  readonly completeSpliceDemand: null
  readonly diagnostics: readonly string[]
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function exactFields(value: unknown, fields: readonly string[], label: string): asserts value is Record<string, unknown> {
  if (!record(value) || Object.keys(value).length !== fields.length || fields.some(field => !Object.hasOwn(value, field))) {
    throw new Error(`Expected exact ${label} fields without derived results or approvals`)
  }
}

function sameIdentities(value: unknown, expected: Readonly<Record<string, string>>) {
  return record(value) && Object.keys(value).length === Object.keys(expected).length
    && Object.entries(expected).every(([path, identity]) => value[path] === identity)
}

function currentBinding(resolved: CurrentDesignResolution) {
  if (!resolved.disciplineBindings.some(binding => binding.id === 'str-conditional-interface')) {
    throw new Error('The distributed floor comparison requires the admitted current structural source')
  }
  const comparison: unknown = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root)), '--read'], {
    encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  }))
  exactFields(comparison, comparisonFields, 'native distributed-floor case')
  if (comparison.schema !== 'str-distributed-floor-case/1' || !record(comparison.sourceSHA256)
      || Object.keys(comparison.sourceSHA256).length !== nativePaths.length
      || nativePaths.some(path => !Object.hasOwn(comparison.sourceSHA256 as object, path))) {
    throw new Error('The native distributed-floor source inventory changed; integrate its actual methods before replay')
  }
  const identities = new Map<string, string>()
  const owners = resolved.disciplineBindings.filter(binding => nativePaths.some(path => Object.hasOwn(binding.identities, path)))
  for (const binding of owners) {
    for (const path of nativePaths) {
      const identity = binding.identities[path]
      if (!identity) continue
      const previous = identities.get(path)
      if (previous && previous !== identity) throw new Error(`Conflicting current distributed-floor source identities at ${path}`)
      identities.set(path, identity)
    }
  }
  const sources = Object.fromEntries(nativePaths.map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    if (identities.get(path) !== blob || (comparison.sourceSHA256 as Record<string, unknown>)[path] !== sha256) {
      throw new Error(`Distributed-floor source or method differs from its current discipline binding at ${path}`)
    }
    return [path, { blob, sha256 }]
  }))
  const adapterBytes = readFileSync(new URL(adapterPath, root))
  const adapterBlob = createHash('sha1').update(`blob ${adapterBytes.length}\0`).update(adapterBytes).digest('hex')
  const inputs = { ...Object.fromEntries(Object.entries(sources).map(([path, source]) => [path, source.blob])), [adapterPath]: adapterBlob }
  const bindingDigest = sha256SemanticFingerprint({ owners: owners.map(owner => ({ id: owner.id, digest: owner.digest })), inputs })
  const grid: { readonly heads: readonly { readonly id: string }[] } = JSON.parse(readFileSync(new URL('project/str/studies/current-house-grid.json', root), 'utf8'))
  const headIds = grid.heads.map(head => head.id)
  if (headIds.length !== 52 || new Set(headIds).size !== 52) throw new Error('The distributed floor requires all 52 actual named source heads')
  return { comparison: comparison as NativeComparison, sources, inputs, bindingDigest, headIds,
    source: { id: resolved.design.source.id, planDigest: sha256SemanticFingerprint(resolved.design) } }
}

export function readDistributedFloorCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return {
    schema: 'str-distributed-floor-request/1' as const,
    design: resolved.design,
    floor: { schema: 'str-distributed-floor-case/1' as const, planDigest: current.source.planDigest,
      bindingDigest: current.bindingDigest, comparison: current.comparison },
  }
}

export function runDistributedFloorCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  exactFields(input, ['schema', 'planDigest', 'bindingDigest', 'comparison'], 'current distributed-floor case')
  if (input.schema !== 'str-distributed-floor-case/1' || input.planDigest !== current.source.planDigest || input.bindingDigest !== current.bindingDigest) {
    throw new Error('Stale or unsupported distributed-floor design or method binding')
  }
  exactFields(input.comparison, comparisonFields, 'native distributed-floor case')
  if (input.comparison.schema !== current.comparison.schema
      || !sameIdentities(input.comparison.sourceSHA256, current.comparison.sourceSHA256)) {
    throw new Error('The distributed-floor comparison cannot replace its derived source identities')
  }
  const native: NativeResult = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify(input.comparison), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  const receiving = current.comparison.receivingLaws as { readonly intermediateSupports: Readonly<Record<string, unknown>> }
  const expectedReceiverIds = Object.keys(receiving.intermediateSupports)
  const expectedSources = Object.fromEntries(Object.entries(current.sources).map(([path, source]) => [path, source.sha256]))
  const six = (value: unknown): value is Six => Array.isArray(value) && value.length === 6
    && value.every(component => typeof component === 'number' && Number.isFinite(component))
  if (native.schema !== 'str-distributed-floor-result/1' || native.status !== 'four-wall-diaphragm-coupled-comparison'
      || !sameIdentities(native.sourceSHA256, expectedSources) || native.installedAcceptance !== false
      || native.completeHouseProof !== false || native.completeSpliceDemand !== null || !Array.isArray(native.heads)
      || native.heads.length !== 52 || new Set(native.heads.map(head => head.id)).size !== 52
      || current.headIds.some(id => !native.heads.some(head => head.id === id))
      || native.heads.some(head => !six(head.reactionKN_KNm) || !six(head.displacementMmRad))
      || !Array.isArray(native.interfaces) || native.interfaces.length !== 4
      || new Set(native.interfaces.map(port => port.id)).size !== 4
      || ['NW', 'NE', 'SW', 'SE'].some(id => !native.interfaces.some(port => port.id === id))
      || native.interfaces.some(port => !six(port.forceOnUpperKN_KNm) || !six(port.upperDisplacementMmRad) || !six(port.lowerDisplacementMmRad))
      || !six(native.equilibriumResidualKN_KNm) || !record(native.drawings) || typeof native.drawings['floor.svg'] !== 'string'
      || !Array.isArray(native.unmodelledIntermediateReceivingPorts)
      || native.unmodelledIntermediateReceivingPorts.length !== expectedReceiverIds.length
      || new Set(native.unmodelledIntermediateReceivingPorts.map(port => port.id)).size !== expectedReceiverIds.length
      || expectedReceiverIds.some(id => !native.unmodelledIntermediateReceivingPorts.some(port => port.id === id))
      || native.unmodelledIntermediateReceivingPorts.some(port => port.law !== null) || !Array.isArray(native.missingPorts)) {
    throw new Error('The distributed-floor replay differs from its current source or explicit proof boundary')
  }
  const edits = input.comparison.componentCase as { readonly edits: {
    readonly floorApertures: readonly { readonly id: string }[]; readonly wallOpenings: readonly { readonly id: string }[] } }
  return {
    status: 'computed-comparison' as const,
    source: { ...current.source, bindingDigest: current.bindingDigest, caseDigest: sha256SemanticFingerprint(input) },
    method: { id: 'str-distributed-floor-compatibility/1', path: methodPath, blob: current.sources[methodPath]!.blob,
      inputs: current.inputs, adapter: { path: adapterPath, blob: current.inputs[adapterPath] } },
    native,
    floorSvg: native.drawings['floor.svg'],
    diagnostics: [
      { code: 'DISTRIBUTED_FLOOR_MISSING_RECEIVING_LAWS', state: 'unresolved' as const,
        objects: native.unmodelledIntermediateReceivingPorts.map(port => ({ kind: 'structural-receiving-port' as const, id: port.id })),
        message: 'Actual intermediate receiving ports remain unmodelled because finite masonry, arch, portal and contact laws are missing. No restraint or completed house is inferred.' },
      { code: 'DISTRIBUTED_FLOOR_INCOMPLETE_HOUSE', state: 'unresolved' as const,
        objects: native.missingPorts.map(port => ({ kind: 'structural-interface' as const, id: port.id })),
        message: 'Successor roof, vertical slab/full upstands, actual gravity/precompression, dry-side ground section and physical joint proofs remain incomplete.' },
      ...(edits.edits.floorApertures.length ? [{ code: 'DISTRIBUTED_FLOOR_APERTURE_SERVICES_RECHECK', state: 'stale-for-edited-candidate' as const,
        objects: edits.edits.floorApertures.map(aperture => ({ kind: 'floor-aperture' as const, id: aperture.id })),
        message: 'The edited aperture changes diaphragm geometry and compatible reactions; source service-route, host, trimmer and local reinforcement applicability must be requalified.' }] : []),
      ...(edits.edits.wallOpenings.length ? [{ code: 'DISTRIBUTED_FLOOR_WALL_OPENING_RECHECK', state: 'stale-for-edited-candidate' as const,
        objects: edits.edits.wallOpenings.map(opening => ({ kind: 'wall-opening' as const, id: opening.id })),
        message: 'Edited upper-wall openings do not rebuild the missing intermediate wall and arch stiffness. Their structural and receiving applicability remains unresolved.' }] : []),
    ],
    evidence: { state: 'authored-constitutive-comparison' as const, installedAcceptance: false as const, completeHouseProof: false as const,
      scope: 'One compatible perforated membrane, explicit slab-level bands, four finite L-wall/contact paths and all 52 ideal pinned heads under the native floor-only signed pressure band. Missing receiving laws, full floor/roof/gravity/moisture behavior and local physical acceptance remain explicit.' },
  }
}
