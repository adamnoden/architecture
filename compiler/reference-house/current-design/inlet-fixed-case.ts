import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { compileFixedInletCandidate, readFixedInletSettings } from './inlet-fixed-entry.js'
import { compareCurrentFixedInletSupport } from './inlet-fixed-support-integration.js'
import { renderCompactInletSupportView } from './inlet-fixed-support-view.js'
import { compareTemporaryFixedInletKeeper } from './inlet-fixed-temporary-keeper.js'
import { compareFixedInletWetSupport } from './inlet-fixed-wet-support.js'
import { readInletSillInsertCase, runInletSillInsertCase } from './inlet-sill-insert.js'
import { readInletFaultCase, runInletFaultCase } from './inlet-fault.js'
import type { CurrentDesignResolution } from './resolve.js'

function boundSource(resolved: CurrentDesignResolution) {
  if (resolved.design.source.kind !== 'georgian-layout-revision' || !resolved.disciplineBindings.length) {
    throw new Error('The fixed inlet requires the admitted current house and its actual service bindings')
  }
  const implementations = Object.fromEntries([
    'compiler/reference-house/current-design/inlet-fixed-case.ts',
    'compiler/reference-house/current-design/inlet-fixed-entry.ts',
    'compiler/reference-house/current-design/inlet-fixed-operating.ts',
    'compiler/reference-house/current-design/inlet-fixed-support-integration.ts',
    'compiler/reference-house/current-design/inlet-fixed-thermal.ts',
    'compiler/reference-house/current-design/inlet-fixed-receiver.ts',
    'compiler/reference-house/current-design/inlet-fixed-compact-receiver.ts',
    'compiler/reference-house/current-design/inlet-fixed-support-view.ts',
    'compiler/reference-house/current-design/inlet-fixed-temporary-keeper.ts',
    'compiler/reference-house/current-design/inlet-fixed-wet-support.ts',
    'project/had/studies/incoming-water-geometry.mjs',
    'project/had/studies/service-interface-geometry.mjs',
    'project/had/studies/south-inlet-relief-hydraulics.mjs',
  ].map(path => {
    const bytes = readFileSync(new URL('../../../' + path, import.meta.url))
    return [path, createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')]
  }))
  return { planDigest: sha256SemanticFingerprint(resolved.design), implementations,
    bindingDigest: sha256SemanticFingerprint({ disciplines: resolved.disciplineBindings, implementations }) }
}

export function readFixedInletCase(resolved: CurrentDesignResolution) {
  const binding = boundSource(resolved)
  return { schema: 'had-fixed-inlet-request/1' as const, design: resolved.design,
    fixed: { schema: 'had-fixed-inlet-case/1' as const, planDigest: binding.planDigest,
      bindingDigest: binding.bindingDigest, settings: readFixedInletSettings() } }
}

export function runFixedInletCase(resolved: CurrentDesignResolution, input: unknown,
  sources: { readonly insertCase?: unknown; readonly faultCase?: unknown } = {}) {
  const binding = boundSource(resolved)
  const fields = ['schema', 'planDigest', 'bindingDigest', 'settings']
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length !== fields.length
      || fields.some(field => !Object.hasOwn(input, field))) throw new Error('Expected a versioned fixed-inlet case without derived evidence')
  const value = input as Record<string, unknown>
  if (value.schema !== 'had-fixed-inlet-case/1' || value.planDigest !== binding.planDigest || value.bindingDigest !== binding.bindingDigest) {
    throw new Error('Stale or unsupported fixed-inlet source binding')
  }
  const referenceInsert = readInletSillInsertCase(resolved)
  const insertCase = sources.insertCase ?? referenceInsert.insert
  const insert = runInletSillInsertCase(resolved, insertCase)
  const referenceFault = readInletFaultCase(resolved, insertCase)
  const faultCase = sources.faultCase ?? referenceFault.fault
  const fault = runInletFaultCase(resolved, faultCase, insertCase)
  const candidate = compileFixedInletCandidate(resolved, value.settings, {
    insert, fault, faultCase: faultCase as typeof referenceFault.fault,
  })
  const supportDevelopment = compareCurrentFixedInletSupport(resolved, candidate)
  const temporaryKeeper = compareTemporaryFixedInletKeeper(candidate, supportDevelopment.compactReceiver)
  const read = (path: string) => readFileSync(new URL('../../../' + path, import.meta.url), 'utf8')
  const wetSupportDevelopment = compareFixedInletWetSupport(candidate, {
    wetCellsText: read('project/had/studies/south-inlet-wet-box.json'),
    servicesText: read('project/had/studies/current-house-services.json'),
    portalText: read('project/str/studies/floor-portal-interface-review.json'),
  })
  const geometryBlockers = [...candidate.geometryBlockers, ...wetSupportDevelopment.diagnostics
    .filter(value => value.endsWith('CURRENT_CLEAR_THROAT_BODY_INTERCEPTS_CELL'))]
  return { ...candidate, geometryBlockers,
    status: geometryBlockers.length ? 'rejected-geometry' as const : candidate.status,
    supportDevelopment, temporaryKeeper, wetSupportDevelopment,
    supportReviewSvg: renderCompactInletSupportView(candidate, supportDevelopment),
    source: { ...candidate.source, bindingDigest: binding.bindingDigest },
    method: { ...candidate.method, currentImplementations: binding.implementations } }
}
