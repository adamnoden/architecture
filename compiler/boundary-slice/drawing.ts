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
  const openingCount = result.derived.openingObligations.length
  const serviceCount = result.derived.serviceObligations.length
  const occurrenceCount = result.derived.occurrenceObligations.length
  const carrierRowHeight = 34
  const transitionRowHeight = 30
  const drainageRowHeight = 34
  const carrierStart = 128
  const transitionHeading = carrierStart + carriers.length * carrierRowHeight + 52
  const transitionStart = transitionHeading + 10
  const drainageHeading = transitionStart + transitions.length * transitionRowHeight + 50
  const drainageStart = drainageHeading + 10
  const height = drainageStart + routes.length * drainageRowHeight + 82

  const carrierRows = carriers.map((carrier, index) => {
    const y = carrierStart + index * carrierRowHeight
    const hosts = carrier.planBoundaryIds.length ? `${carrier.planBoundaryIds.length} plan boundaries` : 'semantic surface'
    return `<g data-entity="${esc(carrier.id)}" transform="translate(0 ${y})"><line x1="32" y1="30" x2="1248" y2="30" stroke="currentColor" stroke-opacity="0.16"/><text x="40" y="21" font-size="13" font-weight="600">${esc(carrier.id)}</text><text x="230" y="21" font-size="12">${esc(carrier.role)}</text><text x="365" y="21" font-size="12">${esc(carrier.kind)}</text><text x="545" y="21" font-size="12">${esc(hosts)}</text><text x="760" y="21" font-size="12">${esc(carrier.label)}</text></g>`
  }).join('\n')

  const transitionRows = transitions.map((transition, index) => {
    const y = transitionStart + index * transitionRowHeight
    return `<g data-entity="${esc(transition.id)}" transform="translate(0 ${y})"><line x1="32" y1="26" x2="1248" y2="26" stroke="currentColor" stroke-opacity="0.12"/><text x="40" y="19" font-size="11" font-weight="600">${esc(transition.id)}</text><text x="330" y="19" font-size="11">${esc(transition.kind)}</text><text x="520" y="19" font-size="11">${esc(transitionReference(transition))}</text><text x="780" y="19" font-size="11">${transition.carrierIds.length} carrier${transition.carrierIds.length === 1 ? '' : 's'}</text><text x="900" y="19" font-size="11">${esc(transitionHost(transition))}</text></g>`
  }).join('\n')

  const drainageRows = routes.map((route, index) => {
    const y = drainageStart + index * drainageRowHeight
    return `<g data-entity="${esc(route.id)}" transform="translate(0 ${y})"><line x1="32" y1="30" x2="1248" y2="30" stroke="currentColor" stroke-opacity="0.16"/><text x="40" y="21" font-size="13" font-weight="600">${esc(route.id)}</text><text x="250" y="21" font-size="12">${esc(route.kind)}</text><text x="460" y="21" font-size="12">${esc(route.direction)}</text><text x="590" y="21" font-size="12">${esc(route.from)} → ${esc(route.to)}</text></g>`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">Deterministic non-spatial envelope/boundary projection showing independent performance carriers, typed interruptions and directional rainwater routes. It does not prove building-physics performance.</desc>
<rect width="1280" height="${height}" fill="white"/>
<g fill="currentColor" font-family="ui-sans-serif, system-ui, sans-serif">
<text x="40" y="40" font-size="24" font-weight="700">${esc(title)}</text>
<text x="40" y="68" font-size="13">STATUS ${result.status} · BOUNDARY TOPOLOGY ONLY</text>
<text x="40" y="90" font-size="12">Opening obligations: ${openingCount} · service-crossing obligations: ${serviceCount} · registered boundary occurrences: ${occurrenceCount} · performance remains external.</text>
<text x="40" y="118" font-size="11" font-weight="700">CARRIER</text><text x="230" y="118" font-size="11" font-weight="700">ROLE</text><text x="365" y="118" font-size="11" font-weight="700">KIND</text><text x="545" y="118" font-size="11" font-weight="700">HOST</text><text x="760" y="118" font-size="11" font-weight="700">REFERENCE HOUSE STRATEGY</text>
${carrierRows}
<text x="40" y="${transitionHeading}" font-size="11" font-weight="700">TYPED BOUNDARY TRANSITIONS</text><text x="330" y="${transitionHeading}" font-size="11" font-weight="700">KIND</text><text x="520" y="${transitionHeading}" font-size="11" font-weight="700">OPENING / CROSSING / OCCURRENCE</text><text x="780" y="${transitionHeading}" font-size="11" font-weight="700">CARRIERS</text><text x="900" y="${transitionHeading}" font-size="11" font-weight="700">HOST / ROUTES</text>
${transitionRows}
<text x="40" y="${drainageHeading}" font-size="11" font-weight="700">DIRECTIONAL DRAINAGE ROUTES</text>
${drainageRows}
<text x="40" y="${height - 30}" font-size="11">Boundary connectivity is machine-checked; U-values, ψ-values, condensation, airtightness, rain resistance, fire/acoustic performance and product compliance are not proved here.</text>
</g>
</svg>`
}
