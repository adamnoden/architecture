import type { ServiceTopologyCompileResult } from './model.js'

const esc = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const renderServiceTopologySvg = (
  result: ServiceTopologyCompileResult,
  title = 'Service topology'
): string => {
  if (result.status === 'FAIL') {
    throw new Error('Refusing to render failed service topology.')
  }

  const networkById = new Map(result.derived.networks.map((item) => [item.id, item]))
  const routes = [...result.derived.routes].sort((a, b) => {
    const network = a.networkId.localeCompare(b.networkId)
    return network || a.id.localeCompare(b.id)
  })
  const rowHeight = 34
  const headerHeight = 118
  const footerHeight = 64
  const height = headerHeight + routes.length * rowHeight + footerHeight
  const width = 1280
  let previousNetwork = ''

  const rows = routes.map((route, index) => {
    const y = headerHeight + index * rowHeight
    const network = networkById.get(route.networkId)
    const networkLabel = route.networkId === previousNetwork ? '' : (network?.label ?? route.networkId)
    previousNetwork = route.networkId
    const crossingLabel = route.crossingIds.length ? route.crossingIds.join(', ') : '—'
    return [
      `<g data-entity="${esc(route.id)}" data-network="${esc(route.networkId)}" transform="translate(0 ${y})">`,
      `<line x1="32" y1="30" x2="1248" y2="30" stroke="currentColor" stroke-opacity="0.16"/>`,
      `<text x="40" y="21" font-size="13" font-weight="600">${esc(networkLabel)}</text>`,
      `<text x="285" y="21" font-size="12">${esc(route.serviceClass)}</text>`,
      `<text x="465" y="21" font-size="12">${esc(route.fromNodeId)} → ${esc(route.toNodeId)}</text>`,
      `<text x="840" y="21" font-size="12">${esc(route.role)}</text>`,
      `<text x="1000" y="21" font-size="12">${esc(crossingLabel)}</text>`,
      `</g>`
    ].join('')
  }).join('\n')

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">`,
    `<title id="title">${esc(title)}</title>`,
    `<desc id="desc">Deterministic non-spatial service-topology projection. It shows semantic network connectivity and registered crossings, not exact pipe or duct coordinates.</desc>`,
    `<rect width="${width}" height="${height}" fill="white"/>`,
    `<g fill="currentColor" font-family="ui-sans-serif, system-ui, sans-serif">`,
    `<text x="40" y="40" font-size="24" font-weight="700">${esc(title)}</text>`,
    `<text x="40" y="68" font-size="13">STATUS ${esc(result.status)} · TOPOLOGY ONLY — NOT PLAN GEOMETRY</text>`,
    `<text x="40" y="90" font-size="12">Route coherence is machine-checked. Sizing, pressure loss, airflow, acoustics, fire stopping, commissioning and product adequacy remain external.</text>`,
    `<text x="40" y="112" font-size="11" font-weight="700">NETWORK</text>`,
    `<text x="285" y="112" font-size="11" font-weight="700">SERVICE CLASS</text>`,
    `<text x="465" y="112" font-size="11" font-weight="700">SEMANTIC ROUTE</text>`,
    `<text x="840" y="112" font-size="11" font-weight="700">ROLE</text>`,
    `<text x="1000" y="112" font-size="11" font-weight="700">REGISTERED CROSSING</text>`,
    rows,
    `<text x="40" y="${height - 28}" font-size="11">Selected crossings: ${esc(result.derived.selectedCrossingIds.join(', '))}</text>`,
    `</g>`,
    `</svg>`
  ].join('\n')
}
