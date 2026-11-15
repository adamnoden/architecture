import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createLayoutFamilyScene, layoutFamilySource } from '../georgian/layout-family.js'
import { candidatePlanMethod, createCandidatePlanScene } from './candidate-plan.js'
import { resolveCurrentDesign, type CurrentDesignResolution } from './resolve.js'
import type { StoreyId } from './snapshot.js'

type Domain = 'plans' | 'occupied-services' | 'selected-water-event'
type CompileDiagnostic = {
  readonly code: 'CANDIDATE_INTERPRETATION_LIMITS' | 'TECHNICAL_OUTPUTS_OUTSIDE_SCOPE' | 'DOMAIN_REQUIRES_ACCEPTED_SOURCE'
  readonly domain: Domain
  readonly message: string
  readonly objects: readonly ({ readonly kind: 'design'; readonly id: string } | { readonly kind: 'storey'; readonly id: StoreyId })[]
}

function planDiagnostic(code: CompileDiagnostic['code'], message: string): CompileDiagnostic {
  return { code, message, domain: 'plans', objects: [{ kind: 'storey', id: 'GROUND' }, { kind: 'storey', id: 'FIRST' }] }
}


function compileResolvedPlans(resolved: CurrentDesignResolution, source: { readonly id: string; readonly planDigest: string }) {
  const schema = 'current-design-compile/1' as const
  if (resolved.design.source.kind === 'contrast-specimen') {
    return {
      schema,
      status: 'CANDIDATE_NOMINAL_PLAN_ONLY' as const,
      source,
      method: candidatePlanMethod,
      nominalDimensions: resolved.design.envelope,
      disciplineBindings: resolved.disciplineBindings,
      plans: {
        GROUND: createCandidatePlanScene(resolved.design, 'GROUND'),
        FIRST: createCandidatePlanScene(resolved.design, 'FIRST'),
      },
      diagnostics: [planDiagnostic('CANDIDATE_INTERPRETATION_LIMITS',
        'Schematic geometry only. Room labels, fittings, stairs, styled plates and technical discipline applicability are withheld.')],
    }
  }

  return {
    schema,
    status: 'NOMINAL_PLAN_ONLY' as const,
    source,
    method: { id: layoutFamilySource.id, scaleDenominator: 100 },
    nominalDimensions: resolved.design.envelope,
    disciplineBindings: resolved.disciplineBindings,
    plans: {
      GROUND: createLayoutFamilyScene('GROUND', 100),
      FIRST: createLayoutFamilyScene('FIRST', 100),
    },
    diagnostics: [planDiagnostic('TECHNICAL_OUTPUTS_OUTSIDE_SCOPE',
      'This plan method supplies nominal drawing geometry. Technical claims and publication acceptance require their own methods.')],
  }
}

/** Resolve one explicit input for the requested projections. Unrequested native methods are not loaded. */
export function prepareCurrentDesignCompile(input: unknown) {
  const resolved = resolveCurrentDesign(input)
  const source = {
    id: resolved.design.source.id,
    planDigest: sha256SemanticFingerprint(resolved.design),
  }
  return {
    source,
    plans: () => compileResolvedPlans(resolved, source),
    structuralBridge: async (trialAxes?: readonly [number, number]) => {
      const { runStructuralBridge } = await import('./structural.js')
      return runStructuralBridge(resolved, trialAxes)
    },
    structuralActions: async () => {
      const { runStructuralActions } = await import('./structural.js')
      return runStructuralActions(resolved)
    },
    occupiedServices: async () => {
      const { runOccupiedServiceSchedule } = await import('./occupied-services.js')
      return runOccupiedServiceSchedule(resolved)
    },
    selectedWaterEvent: async () => {
      const { runSelectedWaterEvent } = await import('./selected-water-event.js')
      return runSelectedWaterEvent(resolved)
    },
    readCourtIntakeCase: async () => {
      const { readCourtIntakeCase } = await import('./court-intake.js')
      return readCourtIntakeCase(resolved)
    },
    courtIntake: async (input: unknown) => {
      const { runCourtIntakeCase } = await import('./court-intake.js')
      return runCourtIntakeCase(resolved, input)
    },
    studyAssembly: async (options: unknown = {}) => {
      const [{ compileResolvedStudyAssembly }, { drawStudyFloorPlan, drawStudyFloorSection }] = await Promise.all([
        import('./assemblies/study-floor.js'), import('./assemblies/study-floor-views.js'),
      ])
      const assembly = compileResolvedStudyAssembly(resolved, options)
      return { source, assembly, plan: drawStudyFloorPlan(assembly), section: drawStudyFloorSection(assembly) }
    },
  }
}

/** The existing drawing/Primer entry point only requests plan geometry. */
export function compileCurrentDesign(input: unknown) {
  return prepareCurrentDesignCompile(input).plans()
}

export async function compileCurrentDesignBundle(input: unknown) {
  const compile = prepareCurrentDesignCompile(input)
  const plans = compile.plans()
  const schema = 'current-design-bundle/1' as const
  const excluded = (domain: Exclude<Domain, 'plans'>) => {
    const diagnostic: CompileDiagnostic = {
      code: 'DOMAIN_REQUIRES_ACCEPTED_SOURCE',
      domain,
      message: 'This candidate does not carry an applicable selected discipline binding.',
      objects: [{ kind: 'design', id: compile.source.id }],
    }
    return { status: 'unavailable' as const, diagnostics: [diagnostic] }
  }
  if (plans.status === 'CANDIDATE_NOMINAL_PLAN_ONLY') {
    return { schema, source: compile.source, plans,
      occupiedServices: excluded('occupied-services'), selectedWaterEvent: excluded('selected-water-event') }
  }

  const [occupiedServices, selectedWaterEvent] = await Promise.all([
    compile.occupiedServices(), compile.selectedWaterEvent(),
  ])
  return { schema, source: compile.source, plans, occupiedServices, selectedWaterEvent }
}
