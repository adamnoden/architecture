import type { BoundaryTopologyCompileResult } from '../../boundary-slice/model.js'
import type { ServiceTopologyCompileResult } from '../../service-slice/model.js'
import type { ReferenceHouseOutputContext } from './context.js'

const cell = (value: unknown): string =>
  String(value ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ')

const list = (values: readonly string[]): string => values.length ? values.join(', ') : '—'

const statusBlock = (
  context: ReferenceHouseOutputContext,
  topology: 'services' | 'boundary'
): string[] => {
  const proof = context.result.proof[topology]
  return [
    `**Compile status:** ${context.result.status}${context.reviewStateVisible ? ' — REVIEW' : ''}  `,
    `**Topology:** ${proof.topology}  `,
    `**Performance:** ${proof.performance}  `,
    `**Source compile:** \`${context.result.identity.compile.fingerprint}\``
  ]
}

const serviceRows = (result: ServiceTopologyCompileResult): string[] => {
  const networkById = new Map(result.derived.networks.map((network) => [network.id, network]))
  return [...result.derived.routes]
    .sort((a, b) => a.networkId.localeCompare(b.networkId) || a.id.localeCompare(b.id))
    .map((route) => {
      const network = networkById.get(route.networkId)
      return `| ${cell(network?.label ?? route.networkId)} | ${cell(route.id)} | ${cell(route.serviceClass)} | ${cell(route.fromNodeId)} → ${cell(route.toNodeId)} | ${cell(route.role)} | ${cell(list(route.crossingIds))} | ${cell(route.provisional ? 'provisional' : 'controlled')} |`
    })
}

export const renderServiceRegisterMarkdown = (
  context: ReferenceHouseOutputContext
): string => {
  const result = context.result.services
  const lines = [
    '# Reference House — service topology register',
    '',
    '> Generated semantic report. This is topology, not pipe/duct routing or MEP performance evidence.',
    '',
    ...statusBlock(context, 'services'),
    '',
    '## Routes',
    '',
    '| Network | Route ID | Service class | Semantic route | Role | Registered crossing | Authority |',
    '|---|---|---|---|---|---|---|',
    ...serviceRows(result),
    '',
    '## Selected crossings',
    '',
    ...result.derived.selectedCrossingIds.map((id) => `- \`${cell(id)}\``),
    '',
    '## Maintenance and access obligations',
    '',
    '| Target | Access | Via | External |',
    '|---|---|---|---|',
    ...[...result.derived.access]
      .sort((a, b) => a.targetNodeId.localeCompare(b.targetNodeId) || a.kind.localeCompare(b.kind))
      .map((access) => `| ${cell(access.targetNodeId)} | ${cell(access.kind)} | ${cell(list(access.viaSpaceIds))} | ${access.external ? 'yes' : 'no'} |`),
    '',
    '## Scope boundary',
    '',
    'Route coherence, selected crossing ownership and represented access obligations are machine-checked at the bounded compiler scope. Sizing, pressure loss, airflow, acoustics, fire stopping, commissioning, product adequacy and exact routing remain external.',
    ''
  ]
  return lines.join('\n')
}

const transitionReference = (
  transition: BoundaryTopologyCompileResult['derived']['transitions'][number]
): string => transition.openingId
  ?? transition.qualitativeOpeningRelationshipId
  ?? transition.serviceCrossingId
  ?? transition.projectOccurrenceId
  ?? '—'

const transitionHost = (
  transition: BoundaryTopologyCompileResult['derived']['transitions'][number]
): string => transition.hostPlanBoundaryId
  ?? (transition.drainageRouteIds?.join(' + ') || '—')

export const renderBoundaryRegisterMarkdown = (
  context: ReferenceHouseOutputContext
): string => {
  const result = context.result.boundary
  const carriers = [...result.derived.carriers].sort((a, b) => a.id.localeCompare(b.id))
  const transitions = [...result.derived.transitions].sort((a, b) => a.id.localeCompare(b.id))
  const routes = [...result.derived.drainageRoutes].sort((a, b) => a.id.localeCompare(b.id))
  const lines = [
    '# Reference House — envelope / boundary topology register',
    '',
    '> Generated semantic report. It records independent boundary carriers, typed transitions and drainage routes; it does not prove building-physics performance.',
    '',
    ...statusBlock(context, 'boundary'),
    '',
    `**Opening obligations:** ${result.derived.openingObligations.length}  `,
    `**Service-crossing obligations:** ${result.derived.serviceObligations.length}  `,
    `**Registered boundary occurrences:** ${result.derived.occurrenceObligations.length}`,
    '',
    '## Boundary carriers',
    '',
    '| Carrier | Role | Kind | Hosts | Critical | Removable | Authority | Description |',
    '|---|---|---|---|---|---|---|---|',
    ...carriers.map((carrier) => `| ${cell(carrier.id)} | ${cell(carrier.role)} | ${cell(carrier.kind)} | ${cell(list(carrier.planBoundaryIds))} | ${carrier.critical ? 'yes' : 'no'} | ${carrier.removable ? 'yes' : 'no'} | ${carrier.provisional ? 'provisional' : 'controlled'} | ${cell(carrier.label)} |`),
    '',
    '## Typed transitions',
    '',
    '| Transition | Kind | Reference | Carriers | Host / route | Authority |',
    '|---|---|---|---|---|---|',
    ...transitions.map((transition) => `| ${cell(transition.id)} | ${cell(transition.kind)} | ${cell(transitionReference(transition))} | ${cell(list(transition.carrierIds))} | ${cell(transitionHost(transition))} | ${transition.provisional ? 'provisional' : 'controlled'} |`),
    '',
    '## Directional drainage routes',
    '',
    '| Route | Kind | Direction | From → to | Visible failure | Authority |',
    '|---|---|---|---|---|---|',
    ...routes.map((route) => `| ${cell(route.id)} | ${cell(route.kind)} | ${cell(route.direction)} | ${cell(route.from)} → ${cell(route.to)} | ${route.visibleFailure ? 'yes' : 'no'} | ${route.provisional ? 'provisional' : 'controlled'} |`),
    '',
    '## Scope boundary',
    '',
    'Boundary topology and represented obligations are machine-checked at the bounded compiler scope. U-values, ψ-values, condensation, airtightness, rain resistance, drainage capacity, fire/acoustic performance and product compliance are not proved here.',
    ''
  ]
  return lines.join('\n')
}
