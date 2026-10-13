import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import type { StructuralTopologyCompileResult } from '../structure-slice/model.js'
import { deriveServiceTopology } from './derive.js'
import type {
  ServiceTopologyCompileResult,
  ServiceTopologyDiagnostic,
  ServiceTopologySource,
  ServiceTopologyStatus
} from './model.js'

const diagnostic = (
  code: string,
  status: ServiceTopologyStatus,
  subjectIds: string[],
  message: string
): ServiceTopologyDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const aggregate = (diagnostics: ServiceTopologyDiagnostic[]): ServiceTopologyStatus => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

const sortedDiagnostics = (items: ServiceTopologyDiagnostic[]): ServiceTopologyDiagnostic[] =>
  [...items].sort((a, b) => {
    const code = a.code.localeCompare(b.code)
    if (code) return code
    const subjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    return subjects || a.message.localeCompare(b.message)
  })

export const compileServiceTopology = (
  source: ServiceTopologySource,
  plan: PlanSliceCompileResult,
  structure: StructuralTopologyCompileResult
): ServiceTopologyCompileResult => {
  const diagnostics: ServiceTopologyDiagnostic[] = []
  const derived = deriveServiceTopology(source)

  const allEntityIds = [
    ...source.nodes.map((item) => item.id),
    ...source.routes.map((item) => item.id),
    ...source.networks.map((item) => item.id),
    ...source.crossings.map((item) => item.id),
    ...source.access.map((item) => item.id)
  ]
  for (const id of duplicates(allEntityIds)) {
    diagnostics.push(diagnostic('DUPLICATE_SERVICE_ID', 'FAIL', [id], `Service entity ID ${id} is duplicated.`))
  }

  if (plan.fixtureId !== source.planFixtureId) {
    diagnostics.push(diagnostic(
      'SERVICE_PLAN_FIXTURE_MISMATCH',
      'FAIL',
      [source.fixtureId, source.planFixtureId, plan.fixtureId],
      `Service source expects plan fixture ${source.planFixtureId}, not ${plan.fixtureId}.`
    ))
  }
  if (structure.fixtureId !== source.structuralFixtureId) {
    diagnostics.push(diagnostic(
      'SERVICE_STRUCTURE_FIXTURE_MISMATCH',
      'FAIL',
      [source.fixtureId, source.structuralFixtureId, structure.fixtureId],
      `Service source expects structural fixture ${source.structuralFixtureId}, not ${structure.fixtureId}.`
    ))
  }
  if (plan.status === 'FAIL' || structure.status === 'FAIL') {
    diagnostics.push(diagnostic(
      'UPSTREAM_COMPILE_FAILED',
      'FAIL',
      [plan.fixtureId, structure.fixtureId],
      'Service topology cannot pass over a failed architectural or structural compile.'
    ))
  } else if (plan.status === 'REVIEW' || structure.status === 'REVIEW') {
    diagnostics.push(diagnostic(
      'UPSTREAM_REVIEW_PROPAGATED',
      'REVIEW',
      [plan.fixtureId, structure.fixtureId],
      'An upstream architectural or structural REVIEW remains visible through the service compile.'
    ))
  }

  const spaceIds = new Set(plan.derived.spaces.map((item) => item.id))
  const boundaryIds = new Set(plan.derived.boundaries.map((item) => item.id))
  const structuralInterruptionIds = new Set(structure.derived.interruptions.map((item) => item.id))
  const nodeIds = new Set(source.nodes.map((item) => item.id))
  const routeById = new Map(source.routes.map((item) => [item.id, item]))
  const routeIds = new Set(routeById.keys())
  const networkById = new Map(source.networks.map((item) => [item.id, item]))
  const crossingById = new Map(source.crossings.map((item) => [item.id, item]))
  const accessByTarget = new Map<string, Set<string>>()

  for (const spaceId of source.protectedPrimaryFreeSpaceIds) {
    if (!spaceIds.has(spaceId)) {
      diagnostics.push(diagnostic(
        'PROTECTED_SERVICE_SPACE_MISSING',
        'FAIL',
        [spaceId],
        `Protected primary-service-free space ${spaceId} is absent from the architectural plan.`
      ))
    }
  }

  for (const node of source.nodes) {
    for (const spaceId of node.hostSpaceIds) {
      if (!spaceIds.has(spaceId)) {
        diagnostics.push(diagnostic(
          'SERVICE_NODE_HOST_SPACE_MISSING',
          'FAIL',
          [node.id, spaceId],
          `${node.id} references missing host space ${spaceId}.`
        ))
      }
    }
  }

  for (const access of source.access) {
    if (!nodeIds.has(access.targetNodeId)) {
      diagnostics.push(diagnostic(
        'SERVICE_ACCESS_TARGET_MISSING',
        'FAIL',
        [access.id, access.targetNodeId],
        `${access.id} references missing target node ${access.targetNodeId}.`
      ))
    }
    for (const spaceId of access.viaSpaceIds) {
      if (!spaceIds.has(spaceId)) {
        diagnostics.push(diagnostic(
          'SERVICE_ACCESS_SPACE_MISSING',
          'FAIL',
          [access.id, spaceId],
          `${access.id} references missing access space ${spaceId}.`
        ))
      }
    }
    const kinds = accessByTarget.get(access.targetNodeId) ?? new Set<string>()
    kinds.add(access.kind)
    accessByTarget.set(access.targetNodeId, kinds)
  }

  for (const node of source.nodes) {
    const available = accessByTarget.get(node.id) ?? new Set<string>()
    for (const required of node.requiredAccessKinds) {
      if (!available.has(required)) {
        diagnostics.push(diagnostic(
          'SERVICE_ACCESS_OBLIGATION_MISSING',
          'FAIL',
          [node.id, required],
          `${node.id} requires ${required} access but no access path is declared.`
        ))
      }
    }
  }

  const protectedSpaces = new Set(source.protectedPrimaryFreeSpaceIds)
  for (const route of source.routes) {
    if (!nodeIds.has(route.fromNodeId) || !nodeIds.has(route.toNodeId)) {
      diagnostics.push(diagnostic(
        'SERVICE_ROUTE_ENDPOINT_MISSING',
        'FAIL',
        [route.id, route.fromNodeId, route.toNodeId],
        `${route.id} references a missing endpoint.`
      ))
    }
    const network = networkById.get(route.networkId)
    if (!network) {
      diagnostics.push(diagnostic(
        'SERVICE_ROUTE_NETWORK_MISSING',
        'FAIL',
        [route.id, route.networkId],
        `${route.id} references missing network ${route.networkId}.`
      ))
    } else {
      if (!network.routeIds.includes(route.id)) {
        diagnostics.push(diagnostic(
          'SERVICE_ROUTE_NOT_OWNED_BY_NETWORK',
          'FAIL',
          [route.id, network.id],
          `${route.id} is not listed by its declared network ${network.id}.`
        ))
      }
      if (!network.serviceClasses.includes(route.serviceClass)) {
        diagnostics.push(diagnostic(
          'SERVICE_CLASS_NETWORK_MISMATCH',
          'FAIL',
          [route.id, network.id],
          `${route.serviceClass} is not allowed by ${network.id}.`
        ))
      }
    }
    for (const spaceId of route.hostSpaceIds) {
      if (!spaceIds.has(spaceId)) {
        diagnostics.push(diagnostic(
          'SERVICE_ROUTE_HOST_SPACE_MISSING',
          'FAIL',
          [route.id, spaceId],
          `${route.id} references missing host space ${spaceId}.`
        ))
      }
      if (route.primaryInfrastructure && protectedSpaces.has(spaceId)) {
        diagnostics.push(diagnostic(
          'PRIMARY_SERVICE_IN_PROTECTED_SPACE',
          'FAIL',
          [route.id, spaceId],
          `${route.id} places primary service infrastructure in protected space ${spaceId}.`
        ))
      }
    }

    if (route.role === 'boundary-link' && route.crossingIds.length === 0) {
      diagnostics.push(diagnostic(
        'ANONYMOUS_SERVICE_BOUNDARY_CROSSING',
        'FAIL',
        [route.id],
        `${route.id} crosses building fabric without a registered crossing.`
      ))
    }

    let structuralCrossingCount = 0
    for (const crossingId of route.crossingIds) {
      const crossing = crossingById.get(crossingId)
      if (!crossing) {
        diagnostics.push(diagnostic(
          'SERVICE_ROUTE_CROSSING_MISSING',
          'FAIL',
          [route.id, crossingId],
          `${route.id} references missing crossing ${crossingId}.`
        ))
        continue
      }
      if (!crossing.selected) {
        diagnostics.push(diagnostic(
          'SERVICE_ROUTE_USES_UNSELECTED_CROSSING',
          'FAIL',
          [route.id, crossing.id],
          `${route.id} uses fallback/unselected crossing ${crossing.id}.`
        ))
      }
      if (!crossing.routeIds.includes(route.id)) {
        diagnostics.push(diagnostic(
          'SERVICE_CROSSING_RECIPROCITY_MISMATCH',
          'FAIL',
          [route.id, crossing.id],
          `${crossing.id} does not declare ${route.id} among the routes it carries.`
        ))
      }
      if (crossing.host.kind === 'structural-interruption') structuralCrossingCount += 1
    }
    if (route.structuralInteraction === 'declared-crossing' && structuralCrossingCount === 0) {
      diagnostics.push(diagnostic(
        'STRUCTURAL_ROUTE_WITHOUT_CROSSING',
        'FAIL',
        [route.id],
        `${route.id} declares a structural interaction without a registered structural opening.`
      ))
    }
    if (route.structuralInteraction === 'none' && structuralCrossingCount > 0) {
      diagnostics.push(diagnostic(
        'UNDECLARED_STRUCTURAL_ROUTE_INTERACTION',
        'FAIL',
        [route.id],
        `${route.id} uses a structural opening while declaring no structural interaction.`
      ))
    }
  }

  for (const network of source.networks) {
    for (const nodeId of network.requiredNodeIds) {
      if (!nodeIds.has(nodeId)) {
        diagnostics.push(diagnostic(
          'SERVICE_NETWORK_NODE_MISSING',
          'FAIL',
          [network.id, nodeId],
          `${network.id} requires missing node ${nodeId}.`
        ))
      }
    }
    for (const routeId of network.routeIds) {
      const route = routeById.get(routeId)
      if (!route) {
        diagnostics.push(diagnostic(
          'SERVICE_NETWORK_ROUTE_MISSING',
          'FAIL',
          [network.id, routeId],
          `${network.id} references missing route ${routeId}.`
        ))
      } else if (route.networkId !== network.id) {
        diagnostics.push(diagnostic(
          'SERVICE_NETWORK_ROUTE_OWNERSHIP_MISMATCH',
          'FAIL',
          [network.id, route.id, route.networkId],
          `${route.id} belongs to ${route.networkId}, not ${network.id}.`
        ))
      }
    }
    const derivedNetwork = derived.networks.find((item) => item.id === network.id)
    if (derivedNetwork && !derivedNetwork.connected) {
      diagnostics.push(diagnostic(
        'SERVICE_NETWORK_DISCONNECTED',
        'FAIL',
        [network.id, ...network.requiredNodeIds],
        `${network.id} does not connect all required service nodes through its declared routes.`
      ))
    }
  }

  for (const crossing of source.crossings) {
    if (crossing.selected && crossing.routeIds.length === 0) {
      diagnostics.push(diagnostic(
        'SELECTED_SERVICE_CROSSING_UNUSED',
        'FAIL',
        [crossing.id],
        `${crossing.id} is selected but carries no service route.`
      ))
    }
    for (const routeId of crossing.routeIds) {
      if (!routeIds.has(routeId)) {
        diagnostics.push(diagnostic(
          'SERVICE_CROSSING_ROUTE_MISSING',
          'FAIL',
          [crossing.id, routeId],
          `${crossing.id} references missing route ${routeId}.`
        ))
      } else if (!routeById.get(routeId)!.crossingIds.includes(crossing.id)) {
        diagnostics.push(diagnostic(
          'SERVICE_CROSSING_RECIPROCITY_MISMATCH',
          'FAIL',
          [crossing.id, routeId],
          `${routeId} does not declare crossing ${crossing.id}.`
        ))
      }
    }
    if (crossing.host.kind === 'plan-boundary' && !boundaryIds.has(crossing.host.boundaryId)) {
      diagnostics.push(diagnostic(
        'SERVICE_CROSSING_BOUNDARY_MISSING',
        'FAIL',
        [crossing.id, crossing.host.boundaryId],
        `${crossing.id} references missing architectural boundary ${crossing.host.boundaryId}.`
      ))
    }
    if (
      crossing.host.kind === 'structural-interruption' &&
      !structuralInterruptionIds.has(crossing.host.interruptionId)
    ) {
      diagnostics.push(diagnostic(
        'SERVICE_STRUCTURAL_CROSSING_MISSING',
        'FAIL',
        [crossing.id, crossing.host.interruptionId],
        `${crossing.id} references missing structural interruption ${crossing.host.interruptionId}.`
      ))
    }
    if (crossing.selected && crossing.obligations.length === 0) {
      diagnostics.push(diagnostic(
        'SERVICE_CROSSING_OBLIGATIONS_MISSING',
        'FAIL',
        [crossing.id],
        `${crossing.id} has no declared downstream technical obligations.`
      ))
    }
  }

  const sorted = sortedDiagnostics(diagnostics)
  return {
    fixtureId: source.fixtureId,
    planFixtureId: source.planFixtureId,
    structuralFixtureId: source.structuralFixtureId,
    status: aggregate(sorted),
    derived,
    diagnostics: sorted
  }
}
