import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { CurrentDesignResolution } from './resolve.js'
import { readStructuralDpcOriginSettings } from './structural-dpc.js'
import { runStructuralOriginAccount } from './structural.js'
import { drawRetainedComponentPlan, type RetainedComponent } from './structural-retained-views.js'

const root = new URL('../../../', import.meta.url)
const methodPath = 'project/str/studies/retained-contact.py'
const componentPath = 'project/str/studies/retained_components.py'
const geometryPath = 'project/str/studies/retained_component_geometry.py'
const contactPath = 'project/str/studies/current-house-structural-case.py'
type ComponentCase = {
  readonly schema: 'str-retained-components-case/1'
  readonly sourceSHA256: Readonly<Record<string, string>>
  readonly edits: unknown
  readonly retentionPaths: readonly unknown[]
}

function currentBinding(resolved: CurrentDesignResolution) {
  const structure = resolved.disciplineBindings.find(binding => binding.id === 'str-conditional-interface')
  if (!structure) throw new Error('Retained components require the current structural source')
  const comparison: ComponentCase = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(componentPath, root)), '--read'], { encoding: 'utf8' }))
  if (comparison.schema !== 'str-retained-components-case/1' || !comparison.sourceSHA256) {
    throw new Error('The retained-component method did not provide its source-bound case')
  }
  const identities = Object.assign({}, ...resolved.disciplineBindings.map(binding => binding.identities)) as Record<string, string>
  const inputs = Object.fromEntries([...new Set([methodPath, componentPath, geometryPath, contactPath, ...Object.keys(comparison.sourceSHA256)])].map(path => {
    const bytes = readFileSync(new URL(path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    if (identities[path] !== blob) throw new Error(`Retained-component source differs from its current binding at ${path}`)
    if (Object.hasOwn(comparison.sourceSHA256, path) && createHash('sha256').update(bytes).digest('hex') !== comparison.sourceSHA256[path]) {
      throw new Error(`Retained-component source identity differs at ${path}`)
    }
    return [path, blob]
  }))
  return { structure, comparison, inputs, source: { id: resolved.design.source.id, planDigest: sha256SemanticFingerprint(resolved.design) } }
}

export function readRetainedComponentCase(resolved: CurrentDesignResolution) {
  const current = currentBinding(resolved)
  return {
    schema: 'str-retained-contact-request/1' as const,
    design: resolved.design,
    retained: { schema: 'str-retained-contact-case/1' as const, planDigest: current.source.planDigest,
      bindingDigest: current.structure.digest, cutZMm: readStructuralDpcOriginSettings(resolved).cutZMm,
      roofRiseMm: 0, componentCase: current.comparison },
  }
}

export function runRetainedComponentCase(resolved: CurrentDesignResolution, input: unknown) {
  const current = currentBinding(resolved)
  const fields = ['schema', 'planDigest', 'bindingDigest', 'cutZMm', 'roofRiseMm', 'componentCase']
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== fields.length
      || fields.some(field => !Object.hasOwn(input, field))) throw new Error('Expected an explicit retained-component contact case')
  const value = input as Record<string, unknown>
  if (value.schema !== 'str-retained-contact-case/1' || value.planDigest !== current.source.planDigest
      || value.bindingDigest !== current.structure.digest) throw new Error('Stale or unsupported retained-component design binding')
  const cutZMm = value.cutZMm
  const roofRiseMm = value.roofRiseMm
  if (typeof cutZMm !== 'number' || !Number.isFinite(cutZMm) || typeof roofRiseMm !== 'number' || !Number.isFinite(roofRiseMm)) {
    throw new Error('Retained-component cut and pressure-height change must be finite millimetres')
  }
  const account = runStructuralOriginAccount(resolved, { cutZMm, roofRiseMm, additionalRetainedNKN: 0,
    additionalRetainedCentroidXYMm: [resolved.design.envelope.widthMm / 2, resolved.design.envelope.depthMm / 2] })
  const native: {
    readonly schema: 'str-retained-contact-result/1'
    readonly components: { readonly components: readonly RetainedComponent[]; readonly sourceSHA256: Readonly<Record<string, string>> }
    readonly replacement: { readonly removedTotal: readonly [number, number, number]; readonly creditedTotal: readonly [number, number, number];
      readonly deltaN_Xfirst_Yfirst: readonly [number, number, number] }
    readonly contact: { readonly windCaseCount: number; readonly candidatePassingCount: number;
      readonly cases: readonly { readonly wind: number; readonly candidateN_Xfirst_Yfirst: readonly [number, number, number];
        readonly adverseCandidates: readonly { readonly vertex: number; readonly candidateN_Xfirst_Yfirst: readonly [number, number, number];
          readonly contact: { readonly passesNecessaryVerticalCondition: boolean } }[] }[] }
    readonly installedAcceptance: false
    readonly completeHouseProof: false
  } = JSON.parse(execFileSync('python3', ['-B', fileURLToPath(new URL(methodPath, root))], {
    input: JSON.stringify({ schema: 'str-retained-contact-replay/1', componentCase: value.componentCase, originAccount: account.native }),
    encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  if (native.schema !== 'str-retained-contact-result/1' || native.installedAcceptance !== false
      || native.completeHouseProof !== false || native.contact.windCaseCount !== account.native.globalContact?.windCaseCount) {
    throw new Error('The retained-component replay differs from its actual signed source and proof boundary')
  }
  if (!Array.isArray(native.components.components) || new Set(native.components.components.map(component => component.id)).size !== native.components.components.length) {
    throw new Error('The retained component catalogue requires distinct stable component identities')
  }
  const source = { ...current.source, caseDigest: sha256SemanticFingerprint(value) }
  const edits = (value.componentCase as ComponentCase).edits as {
    readonly floorApertures: readonly { readonly id: string }[]
    readonly wallOpenings: readonly { readonly id: string }[]
  }
  return {
    status: 'computed-comparison' as const,
    source,
    method: { id: 'str-retained-component-contact/1', path: methodPath, blob: current.inputs[methodPath],
      inputs: current.inputs, signedCutMethod: account.method },
    native,
    planSvg: drawRetainedComponentPlan(native.components.components, resolved.design.envelope, source, native.contact.candidatePassingCount),
    diagnostics: [
      ...(edits.floorApertures.length ? [{ code: 'RETAINED_APERTURE_SERVICES_RECHECK', state: 'stale-for-edited-candidate' as const,
        objects: edits.floorApertures.map(aperture => ({ kind: 'floor-aperture' as const, id: aperture.id })),
        message: 'The edited structural aperture has not requalified the fixed service, protection or handling geometry. Base service outputs retain their original source scope.' }] : []),
      ...(edits.wallOpenings.length ? [{ code: 'RETAINED_WALL_LOCAL_STRUCTURE_RECHECK', state: 'stale-for-edited-candidate' as const,
        objects: edits.wallOpenings.map(opening => ({ kind: 'wall-opening' as const, id: opening.id })),
        message: 'Changed wall openings invalidate the corresponding local arch, support and opening evidence. This method updates retained mass only; the gross native pressure envelope remains its named baseline.' }] : []),
    ],
    evidence: { state: 'declared-retention-path-comparison' as const, installedAcceptance: false as const,
      scope: 'Net component geometry and explicitly declared comparison paths replace the two old retained floor/core families in the actual 96-case upper-cut equilibrium. Missing apertures or paths withhold weight. Local bearing, shear, anchorage, compatible whole-house response and moisture remain unproved.' },
  }
}
