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
    readStructuralCase: async () => {
      const { readStructuralCase } = await import('./structural.js')
      return readStructuralCase(resolved)
    },
    structuralCase: async (input: unknown) => {
      const { runStructuralCase } = await import('./structural.js')
      return runStructuralCase(resolved, input)
    },
    readStructuralInterfaces: async () => {
      const { readStructuralInterfaces } = await import('./structural-interfaces.js')
      return readStructuralInterfaces(resolved)
    },
    structuralInterfaces: async (input: unknown) => {
      const { runStructuralInterfaces } = await import('./structural-interfaces.js')
      return runStructuralInterfaces(resolved, input)
    },
    occupiedServices: async () => {
      const { runOccupiedServiceSchedule } = await import('./occupied-services.js')
      return runOccupiedServiceSchedule(resolved)
    },
    selectedWaterEvent: async () => {
      const { runSelectedWaterEvent } = await import('./selected-water-event.js')
      return runSelectedWaterEvent(resolved)
    },
    readRoofPitchCase: async () => {
      const { readRoofPitchCase } = await import('./roof-pitch.js')
      return readRoofPitchCase(resolved)
    },
    roofPitch: async (input: unknown) => {
      const { runRoofPitchCase } = await import('./roof-pitch.js')
      return runRoofPitchCase(resolved, input)
    },
    readCourtIntakeCase: async () => {
      const { readCourtIntakeCase } = await import('./court-intake.js')
      return readCourtIntakeCase(resolved)
    },
    courtIntake: async (input: unknown) => {
      const { runCourtIntakeCase } = await import('./court-intake.js')
      return runCourtIntakeCase(resolved, input)
    },
    readEastGroundReceivingCase: async () => {
      const { readEastGroundReceivingCase } = await import('./east-ground-receiving.js')
      return readEastGroundReceivingCase(resolved)
    },
    eastGroundReceiving: async (input: unknown) => {
      const { runEastGroundReceivingCase } = await import('./east-ground-receiving.js')
      return runEastGroundReceivingCase(resolved, input)
    },
    readOccupiedCondensateCase: async () => {
      const { readOccupiedCondensateCase } = await import('./occupied-condensate.js')
      return readOccupiedCondensateCase(resolved)
    },
    occupiedCondensate: async (input: unknown) => {
      const { runOccupiedCondensateCase } = await import('./occupied-condensate.js')
      return runOccupiedCondensateCase(resolved, input)
    },
    readInletRouteCases: async () => {
      const { readInletRouteCases } = await import('./inlet-route.js')
      return readInletRouteCases(resolved)
    },
    inletRoute: async (input: unknown) => {
      const { runInletRouteCase } = await import('./inlet-route.js')
      return runInletRouteCase(resolved, input)
    },
    renewableOpenings: async (widthCase?: unknown) => {
      const [{ compileRenewableOpenings }, { drawStudyJambScreen }] = await Promise.all([
        import('./assemblies/renewable-openings.js'), import('./assemblies/renewable-opening-views.js'),
      ])
      const result = compileRenewableOpenings(resolved, widthCase)
      return { ...result, window: { ...result.window, jambSvg: drawStudyJambScreen(result.window) } }
    },
    studyLinings: async (options: unknown = {}) => {
      const [{ compileResolvedStudyLinings }, { drawStudyLiningComparison, drawStudyPanellingElevation }] = await Promise.all([
        import('./assemblies/study-linings.js'), import('./assemblies/study-linings-views.js'),
      ])
      const linings = compileResolvedStudyLinings(resolved, options)
      return { source, linings, detail: drawStudyLiningComparison(linings), elevation: drawStudyPanellingElevation(linings) }
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
