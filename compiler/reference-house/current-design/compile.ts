import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createLayoutFamilyScene, layoutFamilySource } from '../georgian/layout-family.js'
import { candidatePlanMethod, createCandidatePlanScene } from './candidate-plan.js'
import { resolveCurrentDesign, type CurrentDesignResolution } from './resolve.js'
import type { StoreyId } from './snapshot.js'
import type { InletCoverSources } from './inlet-cover.js'
import type { runGroundSectionCase } from './structural-ground.js'

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
    structuralDpcOriginAudit: async (cutZMm?: number, globalContactTrial?: unknown) => {
      const { runStructuralDpcOriginAudit } = await import('./structural-dpc.js')
      return runStructuralDpcOriginAudit(resolved, cutZMm, globalContactTrial)
    },
    readStructuralSuccessorCase: async () => {
      const { readStructuralSuccessorCase } = await import('./structural-successor.js')
      return readStructuralSuccessorCase(resolved)
    },
    structuralSuccessorCase: async (input: unknown) => {
      const { runStructuralSuccessorCase } = await import('./structural-successor.js')
      return runStructuralSuccessorCase(resolved, input)
    },
    readRetainedComponentCase: async () => {
      const { readRetainedComponentCase } = await import('./structural-retained.js')
      return readRetainedComponentCase(resolved)
    },
    retainedComponentCase: async (input: unknown) => {
      const { runRetainedComponentCase } = await import('./structural-retained.js')
      return runRetainedComponentCase(resolved, input)
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
    readDistributedFloorCase: async () => {
      const { readDistributedFloorCase } = await import('./structural-distributed-floor.js')
      return readDistributedFloorCase(resolved)
    },
    distributedFloorCase: async (input: unknown) => {
      const { runDistributedFloorCase } = await import('./structural-distributed-floor.js')
      return runDistributedFloorCase(resolved, input)
    },
    readGroundSectionCase: async () => {
      const { readGroundSectionCase } = await import('./structural-ground.js')
      return readGroundSectionCase(resolved)
    },
    readHouseVerticalProfileCase: async () => {
      const { readHouseVerticalProfileCase } = await import('./house-vertical-profile.js')
      return readHouseVerticalProfileCase(resolved)
    },
    houseVerticalProfileCase: async (input: unknown) => {
      const { runHouseVerticalProfileCase } = await import('./house-vertical-profile.js')
      return runHouseVerticalProfileCase(resolved, input)
    },
    groundSectionCase: async (input: unknown) => {
      const { runGroundSectionCase } = await import('./structural-ground.js')
      return runGroundSectionCase(resolved, input)
    },
    readServiceFloorCase: async (ground: ReturnType<typeof runGroundSectionCase>) => {
      const { readServiceFloorCase } = await import('./service-floor.js')
      return readServiceFloorCase(resolved, ground)
    },
    serviceFloorCase: async (input: unknown, ground: ReturnType<typeof runGroundSectionCase>) => {
      const { runServiceFloorCase } = await import('./service-floor.js')
      return runServiceFloorCase(resolved, ground, input)
    },
    readNorthCollectorCase: async () => {
      const { readNorthCollectorCase } = await import('./north-collector.js')
      return readNorthCollectorCase(resolved)
    },
    readJoinedRcFloorCase: async () => {
      const { readJoinedRcFloorCase } = await import('./structural-rc-floor.js')
      return readJoinedRcFloorCase(resolved)
    },
    readVerticalRcFloorCase: async () => {
      const { readVerticalRcFloorCase } = await import('./structural-vertical-floor.js')
      return readVerticalRcFloorCase(resolved)
    },
    verticalRcFloorCase: async (input: unknown) => {
      const { runVerticalRcFloorCase } = await import('./structural-vertical-floor.js')
      return runVerticalRcFloorCase(resolved, input)
    },
    readMasonryFrameCase: async () => {
      const { readMasonryFrameCase } = await import('./structural-masonry-frame.js')
      return readMasonryFrameCase(resolved)
    },
    masonryFrameCase: async (input: unknown) => {
      const { runMasonryFrameCase } = await import('./structural-masonry-frame.js')
      return runMasonryFrameCase(resolved, input)
    },
    joinedRcFloorCase: async (input: unknown) => {
      const { runJoinedRcFloorCase } = await import('./structural-rc-floor.js')
      return runJoinedRcFloorCase(resolved, input)
    },
    northCollectorCase: async (input: unknown, westVentCase?: unknown) => {
      const { runNorthCollectorCase } = await import('./north-collector.js')
      return runNorthCollectorCase(resolved, input, westVentCase)
    },
    readRearFoulVentCase: async () => {
      const { readRearFoulVentCase } = await import('./rear-foul-vent.js')
      return readRearFoulVentCase(resolved)
    },
    rearFoulVent: async (input: unknown) => {
      const { runRearFoulVentCase } = await import('./rear-foul-vent.js')
      return runRearFoulVentCase(resolved, input)
    },
    occupiedServices: async () => {
      const { runOccupiedServiceSchedule } = await import('./occupied-services.js')
      return runOccupiedServiceSchedule(resolved)
    },
    occupiedServiceDrawings: async () => {
      const { runOccupiedServiceDrawings } = await import('./occupied-services.js')
      return runOccupiedServiceDrawings(resolved)
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
    readInletSillInsertCase: async () => {
      const { readInletSillInsertCase } = await import('./inlet-sill-insert.js')
      return readInletSillInsertCase(resolved)
    },
    inletSillInsert: async (input: unknown) => {
      const { runInletSillInsertCase } = await import('./inlet-sill-insert.js')
      return runInletSillInsertCase(resolved, input)
    },
    readInletFaultCase: async (insertCase?: unknown) => {
      const { readInletFaultCase } = await import('./inlet-fault.js')
      return readInletFaultCase(resolved, insertCase)
    },
    inletFault: async (input: unknown, insertCase?: unknown) => {
      const { runInletFaultCase } = await import('./inlet-fault.js')
      return runInletFaultCase(resolved, input, insertCase)
    },
    readFixedInletCase: async () => {
      const { readFixedInletCase } = await import('./inlet-fixed-case.js')
      return readFixedInletCase(resolved)
    },
    fixedInletCase: async (input: unknown, sources?: { readonly insertCase?: unknown; readonly faultCase?: unknown }) => {
      const { runFixedInletCase } = await import('./inlet-fixed-case.js')
      return runFixedInletCase(resolved, input, sources)
    },
    readInletRemovalCases: async (insertCase?: unknown) => {
      const { readInletRemovalCases } = await import('./inlet-removal.js')
      return readInletRemovalCases(resolved, insertCase)
    },
    inletRemoval: async (input: unknown, insertCase?: unknown) => {
      const { runInletRemovalCase } = await import('./inlet-removal.js')
      return runInletRemovalCase(resolved, input, insertCase)
    },
    readInletCoverCases: async (sources?: InletCoverSources) => {
      const { readInletCoverCases } = await import('./inlet-cover.js')
      return readInletCoverCases(resolved, sources)
    },
    inletCover: async (input: unknown, sources?: InletCoverSources) => {
      const { runInletCoverCase } = await import('./inlet-cover.js')
      return runInletCoverCase(resolved, input, sources)
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
    studyRoomKit: async (input: unknown) => {
      const { compileStudyRoomKitProjection } = await import('./assemblies/study-room-kit-projection.js')
      return { source, ...compileStudyRoomKitProjection(resolved, input) }
    },
    studyDraftRoomKit: async (input: unknown) => {
      const { compileStudyDraftRoomKit } = await import('./assemblies/study-draft-room-kit.js')
      return compileStudyDraftRoomKit(resolved, input)
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
