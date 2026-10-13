import type { BoundaryTopologyCompileResult } from './model.js'

const esc = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

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

export const renderBoundaryTopologySvg = (
  result: BoundaryTopologyCompileResult,
  title = 'Boundary topology'
): string => {
  if (result.status === 'FAIL') throw new Error('Cannot render failed boundary topology.')

  const carriers = result.derived.carriers
  const transitions = result.derived.transitions
  const routes = result.derived.drainageRoutes
  const row = 18
  const carrierStart = 116
  const transitionHeading = carrierStart + carriers.length * row + 26
  const transitionStart = transitionHeading + 22
  const drainageHeading = transitionStart + transitions.length * row + 26
  const drainageStart = drainageHeading + 22
  const height = drainageStart + routes.length * row + 48

  const carrierRows = carriers.map((carrier, index) => {
    const hosts = carrier.planBoundaryIds.length ? `${carrier.planBoundaryIds.length} plan boundaries` : 'semantic surface'
    return `<text data-entity="${esc(carrier.id)}" x="40" y="${carrierStart + index * row}" font-size="11">${esc(carrier.id)} · ${esc(carrier.role)} · ${esc(carrier.kind)} · ${esc(hosts)} · ${esc(carrier.label)}</text>`
  }).join('\n')

  const transitionRows = transitions.map((transition, index) =>
    `<text data-entity="${esc(transition.id)}" x="40" y="${transitionStart + index * row}" font-size="10">${esc(transition.id)} · ${esc(transition.kind)} · ${esc(transitionReference(transition))} · ${transition.carrierIds.length} carriers · ${esc(transitionHost(transition))}</text>`
  ).join('\n')

  const drainageRows = routes.map((route, index) =>
    `<text data-entity="${esc(route.id)}" x="40" y="${drainageStart + index * row}" font-size="10">${esc(route.id)} · ${esc(route.kind)} · ${esc(route.direction)} · ${esc(route.from)} → ${esc(route.to)}</text>`
  ).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">Deterministic non-spatial envelope/boundary projection showing independent performance carriers, typed interruptions and directional rainwater routes. It does not prove building-physics performance.</desc>
<rect width="1280" height="${height}" fill="white"/>
<g fill="currentColor" font-family="ui-sans-serif, system-ui, sans-serif">
<text x="40" y="34" font-size="22" font-weight="700">${esc(title)}</text>
<text x="40" y="56" font-size="12">STATUS ${result.status} · BOUNDARY TOPOLOGY ONLY</text>
<text x="40" y="76" font-size="11">${result.derived.openingObligations.length} opening obligations · ${result.derived.serviceObligations.length} service-crossing obligations · ${result.derived.occurrenceObligations.length} registered boundary occurrence · performance remains external</text>
<text x="40" y="98" font-size="11" font-weight="700">BOUNDARY CARRIERS</text>
${carrierRows}
<text x="40" y="${transitionHeading}" font-size="11" font-weight="700">TYPED BOUNDARY TRANSITIONS</text>
${transitionRows}
<text x="40" y="${drainageHeading}" font-size="11" font-weight="700">DIRECTIONAL DRAINAGE ROUTES</text>
${drainageRows}
<text x="40" y="${height - 18}" font-size="10">Topology only: U-values, ψ-values, condensation, airtightness, rain resistance, drainage capacity, fire/acoustic performance and product compliance are not proved here.</text>
</g>
</svg>`
}
