import type {
  BoundaryRole,
  BoundaryTopologyDerived,
  BoundaryTopologySource,
  DerivedBoundaryOpeningObligation,
  DerivedBoundaryServiceObligation,
  DerivedBoundarySystem
} from './model.js'

const connected = (
  carrierIds: string[],
  transitionIds: string[],
  source: BoundaryTopologySource
): boolean => {
  if (carrierIds.length <= 1) return true
  const allowedCarriers = new Set(carrierIds)
  const allowedTransitions = new Set(transitionIds)
  const adjacency = new Map<string, Set<string>>()

  for (const transition of source.transitions) {
    if (!allowedTransitions.has(transition.id)) continue
    const members = transition.carrierIds.filter((id) => allowedCarriers.has(id))
    for (const a of members) {
      const links = adjacency.get(a) ?? new Set<string>()
      for (const b of members) if (b !== a) links.add(b)
      adjacency.set(a, links)
    }
  }

  const start = carrierIds[0]
  const visited = new Set<string>([start])
  const queue = [start]
  while (queue.length) {
    const current = queue.shift()!
    for (const next of adjacency.get(current) ?? []) {
      if (visited.has(next)) continue
      visited.add(next)
      queue.push(next)
    }
  }
  return carrierIds.every((id) => visited.has(id))
}

const rolesFor = (carrierIds: string[], source: BoundaryTopologySource): BoundaryRole[] => {
  const byId = new Map(source.carriers.map((carrier) => [carrier.id, carrier]))
  return [...new Set(carrierIds.map((id) => byId.get(id)?.role).filter((role): role is BoundaryRole => Boolean(role)))].sort()
}

export const deriveBoundaryTopology = (
  source: BoundaryTopologySource
): BoundaryTopologyDerived => {
  const carriers = source.carriers.map((carrier) => ({
    ...carrier,
    planBoundaryIds: [...carrier.planBoundaryIds].sort()
  })).sort((a, b) => a.id.localeCompare(b.id))

  const transitions = source.transitions.map((transition) => ({
    ...transition,
    carrierIds: [...transition.carrierIds].sort(),
    obligations: [...transition.obligations].sort()
  })).sort((a, b) => a.id.localeCompare(b.id))

  const systems: DerivedBoundarySystem[] = source.systems.map((system) => ({
    ...system,
    carrierIds: [...system.carrierIds].sort(),
    transitionIds: [...system.transitionIds].sort(),
    connected: connected(system.carrierIds, system.transitionIds, source)
  })).sort((a, b) => a.id.localeCompare(b.id))

  const openingObligations: DerivedBoundaryOpeningObligation[] = transitions
    .filter((transition) => transition.kind === 'opening' || transition.kind === 'threshold')
    .filter((transition) => Boolean(
      transition.hostPlanBoundaryId &&
      (transition.openingId || transition.qualitativeOpeningRelationshipId)
    ))
    .map((transition) => {
      const numeric = Boolean(transition.openingId)
      const openingRefId = transition.openingId ?? transition.qualitativeOpeningRelationshipId!
      return {
        id: `BND-OPEN-${openingRefId}`,
        openingRefId,
        openingRefKind: numeric ? 'numeric' as const : 'qualitative' as const,
        hostPlanBoundaryId: transition.hostPlanBoundaryId!,
        roles: rolesFor(transition.carrierIds, source),
        obligations: [...transition.obligations],
        provisional: transition.provisional
      }
    })

  const serviceObligations: DerivedBoundaryServiceObligation[] = transitions
    .filter((transition) => transition.kind === 'service-penetration' || transition.kind === 'roof-penetration')
    .filter((transition): transition is typeof transition & { serviceCrossingId: string } => Boolean(transition.serviceCrossingId))
    .map((transition) => ({
      id: `BND-SVC-${transition.serviceCrossingId}`,
      serviceCrossingId: transition.serviceCrossingId,
      ...(transition.hostPlanBoundaryId ? { hostPlanBoundaryId: transition.hostPlanBoundaryId } : {}),
      roles: rolesFor(transition.carrierIds, source),
      obligations: [...transition.obligations],
      provisional: transition.provisional
    }))

  return {
    carriers,
    systems,
    transitions,
    drainageRoutes: source.drainageRoutes.map((route) => ({ ...route })).sort((a, b) => a.id.localeCompare(b.id)),
    openingObligations,
    serviceObligations
  }
}
