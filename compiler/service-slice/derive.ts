import { planBoundaryId } from '../plan-slice/model.js'
import { structuralInterruptionId, structuralLineId } from '../structure-slice/model.js'
import { serviceCrossingId } from './model.js'
import type {
  DerivedServiceCrossing,
  DerivedServiceNetwork,
  ServiceTopologyDerived,
  ServiceTopologySource
} from './model.js'

const connected = (
  requiredNodeIds: string[],
  routeIds: string[],
  source: ServiceTopologySource
): boolean => {
  if (requiredNodeIds.length <= 1) return true
  const allowed = new Set(routeIds)
  const adjacency = new Map<string, Set<string>>()
  for (const route of source.routes) {
    if (!allowed.has(route.id)) continue
    const a = adjacency.get(route.fromNodeId) ?? new Set<string>()
    const b = adjacency.get(route.toNodeId) ?? new Set<string>()
    a.add(route.toNodeId)
    b.add(route.fromNodeId)
    adjacency.set(route.fromNodeId, a)
    adjacency.set(route.toNodeId, b)
  }

  const start = requiredNodeIds[0]
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
  return requiredNodeIds.every((id) => visited.has(id))
}

const deriveCrossing = (item: ServiceTopologySource['crossings'][number]): DerivedServiceCrossing => ({
  ...item,
  id: serviceCrossingId(item.id),
  routeIds: [...item.routeIds].sort(),
  obligations: [...item.obligations].sort(),
  host:
    item.host.kind === 'plan-boundary'
      ? { kind: 'plan-boundary', boundaryId: planBoundaryId(item.host.boundaryId) }
      : item.host.kind === 'structural-interruption'
        ? {
            kind: 'structural-interruption',
            interruptionId: structuralInterruptionId(item.host.interruptionId)
          }
        : { ...item.host },
  ...(item.bearingLineId ? { bearingLineId: structuralLineId(item.bearingLineId) } : {})
})

export const deriveServiceTopology = (
  source: ServiceTopologySource
): ServiceTopologyDerived => {
  const nodes = source.nodes.map((item) => ({
    ...item,
    hostSpaceIds: [...item.hostSpaceIds].sort(),
    requiredAccessKinds: [...item.requiredAccessKinds].sort(),
    ...(item.coordinationEnvelope
      ? { coordinationEnvelope: { ...item.coordinationEnvelope } }
      : {})
  })).sort((a, b) => a.id.localeCompare(b.id))

  const routes = source.routes.map((item) => ({
    ...item,
    hostSpaceIds: [...item.hostSpaceIds].sort(),
    crossingIds: [...item.crossingIds].sort()
  })).sort((a, b) => a.id.localeCompare(b.id))

  const networks: DerivedServiceNetwork[] = source.networks.map((network) => ({
    ...network,
    serviceClasses: [...network.serviceClasses].sort(),
    requiredNodeIds: [...network.requiredNodeIds].sort(),
    routeIds: [...network.routeIds].sort(),
    connected: connected(network.requiredNodeIds, network.routeIds, source)
  })).sort((a, b) => a.id.localeCompare(b.id))

  const crossings = source.crossings
    .map(deriveCrossing)
    .sort((a, b) => a.id.localeCompare(b.id))

  const access = source.access.map((item) => ({
    ...item,
    viaSpaceIds: [...item.viaSpaceIds].sort()
  })).sort((a, b) => a.id.localeCompare(b.id))

  const bearingCrossings = crossings.flatMap((item) => {
    if (!item.selected || item.host.kind !== 'plan-boundary' || !item.bearingLineId) return []
    return [{
      id: `SVC-BEARING-${item.id}`,
      crossingId: item.id,
      planBoundaryId: item.host.boundaryId,
      structuralLineId: item.bearingLineId,
      proof: 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING' as const,
      provisional: item.provisional
    }]
  }).sort((a, b) => a.id.localeCompare(b.id))

  return {
    nodes,
    routes,
    networks,
    crossings,
    access,
    bearingCrossings,
    selectedCrossingIds: crossings.filter((item) => item.selected).map((item) => item.id),
    serviceClasses: [...new Set(routes.map((item) => item.serviceClass))].sort()
  }
}
