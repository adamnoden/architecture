import { sha256SemanticFingerprint } from '../../core/identity.js'
import { createLayoutFamilyScene, layoutFamilySource } from '../georgian/layout-family.js'
import { candidatePlanMethod, createCandidatePlanScene } from './candidate-plan.js'
import { resolveCurrentDesign } from './resolve.js'

/** Compile nominal plan views from an explicitly supplied design and method scope. */
export function compileCurrentDesign(input: unknown) {
  const resolved = resolveCurrentDesign(input)
  const source = {
    id: resolved.design.source.id,
    planDigest: sha256SemanticFingerprint(resolved.design),
  }
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
      diagnostics: [{
        code: 'CANDIDATE_INTERPRETATION_LIMITS',
        message: 'Schematic geometry only. Room labels, fittings, stairs, styled plates and technical discipline applicability are withheld.',
      }],
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
    diagnostics: [{
      code: 'TECHNICAL_OUTPUTS_OUTSIDE_SCOPE',
      message: 'Occupied services, structure, roof, final schedules and publication acceptance require their own current methods.',
    }],
  }
}
