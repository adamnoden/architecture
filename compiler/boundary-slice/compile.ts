import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import type { ServiceTopologyCompileResult } from '../service-slice/model.js'
import { deriveBoundaryTopology } from './derive.js'
import type {
  BoundaryTopologyCompileResult,
  BoundaryTopologyDiagnostic,
  BoundaryTopologySource,
  BoundaryTopologyStatus
} from './model.js'

const diagnostic = (
  code: string,
  status: BoundaryTopologyStatus,
  subjectIds: string[],
  message: string
): BoundaryTopologyDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const aggregate = (diagnostics: BoundaryTopologyDiagnostic[]): BoundaryTopologyStatus => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

const sortDiagnostics = (items: BoundaryTopologyDiagnostic[]): BoundaryTopologyDiagnostic[] =>
  [...items].sort((a, b) => {
    const code = a.code.localeCompare(b.code)
    if (code) return code
    const subjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    return subjects || a.message.localeCompare(b.message)
  })

export const compileBoundaryTopology = (
  source: BoundaryTopologySource,
  plan: PlanSliceCompileResult,
  services: ServiceTopologyCompileResult
): BoundaryTopologyCompileResult => {
  const diagnostics: BoundaryTopologyDiagnostic[] = []
  const derived = deriveBoundaryTopology(source)

  for (const id of duplicates([
    ...source.carriers.map((item) => item.id),
    ...source.systems.map((item) => item.id),
    ...source.transitions.map((item) => item.id),
    ...source.drainageRoutes.map((item) => item.id)
  ])) {
    diagnostics.push(diagnostic('DUPLICATE_BOUNDARY_ID', 'FAIL', [id], `Boundary entity ID ${id} is duplicated.`))
  }

  if (plan.fixtureId !== source.planFixtureId) {
    diagnostics.push(diagnostic(
      'BOUNDARY_PLAN_FIXTURE_MISMATCH',
      'FAIL',
      [source.fixtureId, source.planFixtureId, plan.fixtureId],
      `Boundary source expects plan fixture ${source.planFixtureId}, not ${plan.fixtureId}.`
    ))
  }
  if (services.fixtureId !== source.serviceFixtureId) {
    diagnostics.push(diagnostic(
      'BOUNDARY_SERVICE_FIXTURE_MISMATCH',
      'FAIL',
      [source.fixtureId, source.serviceFixtureId, services.fixtureId],
      `Boundary source expects service fixture ${source.serviceFixtureId}, not ${services.fixtureId}.`
    ))
  }
  if (plan.status === 'FAIL' || services.status === 'FAIL') {
    diagnostics.push(diagnostic(
      'UPSTREAM_BOUNDARY_COMPILE_FAILED',
      'FAIL',
      [plan.fixtureId, services.fixtureId],
      'Boundary topology cannot pass over a failed architectural or service compile.'
    ))
  } else if (plan.status === 'REVIEW' || services.status === 'REVIEW') {
    diagnostics.push(diagnostic(
      'UPSTREAM_BOUNDARY_REVIEW_PROPAGATED',
      'REVIEW',
      [plan.fixtureId, services.fixtureId],
      'An upstream architectural or service REVIEW remains visible through the boundary compile.'
    ))
  }

  const planBoundaryById = new Map(plan.derived.boundaries.map((item) => [item.id, item]))
  const openingById = new Map(plan.derived.openings.map((item) => [item.id, item]))
  const serviceCrossingById = new Map(services.derived.crossings.map((item) => [item.id, item]))
  const carrierById = new Map(source.carriers.map((item) => [item.id, item]))
  const transitionById = new Map(source.transitions.map((item) => [item.id, item]))
  const drainageRouteById = new Map(source.drainageRoutes.map((item) => [item.id, item]))

  for (const carrier of source.carriers) {
    if (carrier.critical && carrier.removable) {
      diagnostics.push(diagnostic(
        'CRITICAL_BOUNDARY_ON_REMOVABLE_CARRIER',
        'FAIL',
        [carrier.id],
        `${carrier.id} carries a critical boundary while declaring itself routinely removable.`
      ))
    }
    if (carrier.kind === 'plan-boundary' && carrier.planBoundaryIds.length === 0) {
      diagnostics.push(diagnostic(
        'BOUNDARY_CARRIER_HAS_NO_PLAN_HOST',
        'FAIL',
        [carrier.id],
        `${carrier.id} is a plan-boundary carrier with no architectural boundary hosts.`
      ))
    }
    for (const boundaryId of carrier.planBoundaryIds) {
      const boundary = planBoundaryById.get(boundaryId)
      if (!boundary) {
        diagnostics.push(diagnostic(
          'BOUNDARY_CARRIER_PLAN_HOST_MISSING',
          'FAIL',
          [carrier.id, boundaryId],
          `${carrier.id} references missing plan boundary ${boundaryId}.`
        ))
      } else if (boundary.kind !== 'outer' && boundary.kind !== 'courtyard') {
        diagnostics.push(diagnostic(
          'BOUNDARY_CARRIER_ON_INTERNAL_PARTITION',
          'FAIL',
          [carrier.id, boundaryId],
          `${carrier.id} maps environmental enclosure semantics onto internal planning boundary ${boundaryId}.`
        ))
      }
    }
  }

  for (const system of source.systems) {
    for (const carrierId of system.carrierIds) {
      const carrier = carrierById.get(carrierId)
      if (!carrier) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SYSTEM_CARRIER_MISSING',
          'FAIL',
          [system.id, carrierId],
          `${system.id} references missing carrier ${carrierId}.`
        ))
      } else if (carrier.role !== system.role) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SYSTEM_ROLE_MISMATCH',
          'FAIL',
          [system.id, carrier.id],
          `${carrier.id} carries ${carrier.role}, not ${system.role}.`
        ))
      }
    }
    for (const transitionId of system.transitionIds) {
      const transition = transitionById.get(transitionId)
      if (!transition) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SYSTEM_TRANSITION_MISSING',
          'FAIL',
          [system.id, transitionId],
          `${system.id} references missing transition ${transitionId}.`
        ))
      } else if (!transition.carrierIds.some((id) => system.carrierIds.includes(id))) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SYSTEM_TRANSITION_OWNERSHIP_MISMATCH',
          'FAIL',
          [system.id, transition.id],
          `${system.id} lists ${transition.id}, but the transition touches none of the system's carriers.`
        ))
      }
    }
    const derivedSystem = derived.systems.find((item) => item.id === system.id)
    if (derivedSystem && !derivedSystem.connected) {
      diagnostics.push(diagnostic(
        'BOUNDARY_SYSTEM_DISCONNECTED',
        'FAIL',
        [system.id, ...system.carrierIds],
        `${system.id} does not connect all declared carriers through its transition graph.`
      ))
    }
  }

  for (const transition of source.transitions) {
    if (transition.obligations.length === 0) {
      diagnostics.push(diagnostic(
        'BOUNDARY_TRANSITION_OBLIGATIONS_MISSING',
        'FAIL',
        [transition.id],
        `${transition.id} has no declared downstream obligations.`
      ))
    }
    for (const carrierId of transition.carrierIds) {
      const carrier = carrierById.get(carrierId)
      if (!carrier) {
        diagnostics.push(diagnostic(
          'BOUNDARY_TRANSITION_CARRIER_MISSING',
          'FAIL',
          [transition.id, carrierId],
          `${transition.id} references missing carrier ${carrierId}.`
        ))
        continue
      }
      const owningSystems = source.systems.filter((system) => system.carrierIds.includes(carrierId))
      if (!owningSystems.some((system) => system.transitionIds.includes(transition.id))) {
        diagnostics.push(diagnostic(
          'BOUNDARY_TRANSITION_NOT_OWNED_BY_SYSTEM',
          'FAIL',
          [transition.id, carrier.id, ...owningSystems.map((item) => item.id)],
          `${transition.id} touches ${carrier.id}, but no system owning that carrier lists the transition.`
        ))
      }
    }

    if (transition.openingId) {
      const opening = openingById.get(transition.openingId)
      if (!opening) {
        diagnostics.push(diagnostic(
          'BOUNDARY_OPENING_MISSING',
          'FAIL',
          [transition.id, transition.openingId],
          `${transition.id} references missing architectural opening ${transition.openingId}.`
        ))
      } else if (transition.hostPlanBoundaryId !== opening.hostBoundaryId) {
        diagnostics.push(diagnostic(
          'BOUNDARY_OPENING_HOST_MISMATCH',
          'FAIL',
          [transition.id, opening.id, transition.hostPlanBoundaryId ?? 'NONE', opening.hostBoundaryId],
          `${transition.id} does not use ${opening.id}'s architectural host boundary.`
        ))
      }
    }

    if (transition.serviceCrossingId) {
      const crossing = serviceCrossingById.get(transition.serviceCrossingId)
      if (!crossing) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SERVICE_CROSSING_MISSING',
          'FAIL',
          [transition.id, transition.serviceCrossingId],
          `${transition.id} references missing service crossing ${transition.serviceCrossingId}.`
        ))
      } else if (!crossing.selected) {
        diagnostics.push(diagnostic(
          'BOUNDARY_USES_UNSELECTED_SERVICE_CROSSING',
          'FAIL',
          [transition.id, crossing.id],
          `${transition.id} promotes unselected/fallback crossing ${crossing.id} into the active boundary topology.`
        ))
      } else if (
        transition.hostPlanBoundaryId &&
        (crossing.host.kind !== 'plan-boundary' || crossing.host.boundaryId !== transition.hostPlanBoundaryId)
      ) {
        diagnostics.push(diagnostic(
          'BOUNDARY_SERVICE_HOST_MISMATCH',
          'FAIL',
          [transition.id, crossing.id, transition.hostPlanBoundaryId],
          `${transition.id} does not match ${crossing.id}'s architectural host.`
        ))
      }
    }

    if (transition.projectOccurrenceId) {
      if (!transition.drainageRouteIds?.length) {
        diagnostics.push(diagnostic(
          'BOUNDARY_OCCURRENCE_ROUTES_MISSING',
          'FAIL',
          [transition.id, transition.projectOccurrenceId],
          `${transition.projectOccurrenceId} has no linked drainage routes.`
        ))
      }
      for (const routeId of transition.drainageRouteIds ?? []) {
        if (!drainageRouteById.has(routeId)) {
          diagnostics.push(diagnostic(
            'BOUNDARY_OCCURRENCE_ROUTE_MISSING',
            'FAIL',
            [transition.id, transition.projectOccurrenceId, routeId],
            `${transition.projectOccurrenceId} references missing drainage route ${routeId}.`
          ))
        }
      }
    }

    if (transition.hostPlanBoundaryId) {
      const host = planBoundaryById.get(transition.hostPlanBoundaryId)
      if (!host) {
        diagnostics.push(diagnostic(
          'BOUNDARY_TRANSITION_PLAN_HOST_MISSING',
          'FAIL',
          [transition.id, transition.hostPlanBoundaryId],
          `${transition.id} references missing architectural boundary ${transition.hostPlanBoundaryId}.`
        ))
      }
      for (const carrierId of transition.carrierIds) {
        const carrier = carrierById.get(carrierId)
        if (carrier?.kind === 'plan-boundary' && !carrier.planBoundaryIds.includes(transition.hostPlanBoundaryId)) {
          diagnostics.push(diagnostic(
            'BOUNDARY_TRANSITION_CARRIER_HOST_MISMATCH',
            'FAIL',
            [transition.id, carrier.id, transition.hostPlanBoundaryId],
            `${carrier.id} does not carry architectural boundary ${transition.hostPlanBoundaryId}.`
          ))
        }
      }
    }
  }

  const openingTransitionIds = new Set(source.transitions.map((item) => item.openingId).filter(Boolean))
  for (const opening of plan.derived.openings) {
    const host = planBoundaryById.get(opening.hostBoundaryId)
    if ((host?.kind === 'outer' || host?.kind === 'courtyard') && !openingTransitionIds.has(opening.id)) {
      diagnostics.push(diagnostic(
        'ENVELOPE_OPENING_UNACCOUNTED',
        'FAIL',
        [opening.id, opening.hostBoundaryId],
        `${opening.id} interrupts the enclosure but has no boundary transition.`
      ))
    }
  }

  const serviceTransitionIds = new Set(source.transitions.map((item) => item.serviceCrossingId).filter(Boolean))
  for (const crossing of services.derived.crossings) {
    if (!crossing.selected || crossing.host.kind !== 'plan-boundary') continue
    const host = planBoundaryById.get(crossing.host.boundaryId)
    if ((host?.kind === 'outer' || host?.kind === 'courtyard') && !serviceTransitionIds.has(crossing.id)) {
      diagnostics.push(diagnostic(
        'ENVELOPE_SERVICE_CROSSING_UNACCOUNTED',
        'FAIL',
        [crossing.id, crossing.host.boundaryId],
        `${crossing.id} crosses the enclosure but has no boundary transition.`
      ))
    }
  }

  for (const route of source.drainageRoutes) {
    if ((route as { concealedPrimaryOutlet?: boolean }).concealedPrimaryOutlet !== false) {
      diagnostics.push(diagnostic(
        'CONCEALED_PRIMARY_DRAINAGE',
        'FAIL',
        [route.id],
        `${route.id} introduces a concealed primary drainage outlet contrary to the declared source contract.`
      ))
    }
    if (!route.visibleFailure) {
      diagnostics.push(diagnostic(
        'DRAINAGE_FAILURE_NOT_VISIBLE',
        'FAIL',
        [route.id],
        `${route.id} has no visible failure/overflow behaviour.`
      ))
    }
    if (route.kind === 'roof-field' && route.direction !== 'outward') {
      diagnostics.push(diagnostic(
        'ROOF_DRAINAGE_NOT_OUTWARD',
        'FAIL',
        [route.id],
        `${route.id} no longer drains away from the courtyard.`
      ))
    }
  }

  const sorted = sortDiagnostics(diagnostics)
  return {
    fixtureId: source.fixtureId,
    planFixtureId: source.planFixtureId,
    serviceFixtureId: source.serviceFixtureId,
    status: aggregate(sorted),
    derived,
    diagnostics: sorted
  }
}
