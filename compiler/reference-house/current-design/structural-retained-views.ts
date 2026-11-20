import { createPlanPaperProjection } from '../../publication-drawing/projection.js'
import { formatDrawingNumberV2 as number } from '../../publication-drawing-v2/svg.js'

type XY = readonly [number, number]
type Aperture = { readonly id: string; readonly shape:
  { readonly kind: 'rectangle'; readonly boundsXYMm: readonly [number, number, number, number] }
  | { readonly kind: 'circle'; readonly centreXYMm: XY; readonly diameterMm: number } }
export type RetainedComponent = {
  readonly id: string
  readonly componentDigest: string
  readonly kind: 'first-floor' | 'upper-wall' | 'ground-slab'
  readonly geometry: {
    readonly outerPolygonXYMm?: readonly XY[]
    readonly polygonsXYMm?: readonly (readonly XY[])[]
    readonly apertures?: readonly Aperture[]
    readonly materialReservations?: readonly Aperture[]
    readonly centroidXYMm: XY | null
    readonly netAreaM2?: number
  }
  readonly lowerWeightKN: number | null
  readonly creditedWeightKN: number
  readonly retention: { readonly state: string; readonly reasons: readonly string[] }
}

const xml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

export function drawRetainedComponentPlan(components: readonly RetainedComponent[], envelope: { readonly widthMm: number; readonly depthMm: number },
  source: { readonly id: string; readonly caseDigest: string }, passing: number) {
  const scaleDenominator = 100
  const panelWidth = envelope.widthMm / scaleDenominator
  const panelHeight = envelope.depthMm / scaleDenominator
  const width = 3 * 12 + 2 * panelWidth
  const height = panelHeight + 60
  const groups = (['first-floor', 'upper-wall'] as const).map((kind, index) => {
    const x = 12 + index * (panelWidth + 12)
    const projection = createPlanPaperProjection({ scaleDenominator,
      modelBounds: { x: 0, y: 0, width: envelope.widthMm, height: envelope.depthMm }, paperOrigin: { x, y: 22 } })
    const selected = components.filter(component => component.kind === kind)
    const polygons = selected.flatMap(component => {
      const regions = component.geometry.outerPolygonXYMm ? [component.geometry.outerPolygonXYMm] : component.geometry.polygonsXYMm ?? []
      return regions.map((region, regionIndex) => `<polygon data-component="${xml(component.id)}" data-region="${regionIndex}" data-retention="${xml(component.retention.state)}" points="${region.map(([a, b]) => {
        const point = projection.point(a, b)
        return `${number(point.x)},${number(point.y)}`
      }).join(' ')}" fill="${component.creditedWeightKN > 0 ? '#aaa' : '#eee'}" stroke="#333" stroke-width="0.15"/>`)
    })
    const apertures = selected.flatMap(component => [
      ...(component.geometry.apertures ?? []).map(aperture => ({ ...aperture, role: 'service-aperture' })),
      ...(component.geometry.materialReservations ?? []).map(aperture => ({ ...aperture, role: 'non-RC-reservation' })),
    ].map(aperture => {
      const attributes = `data-component="${xml(component.id)}" data-aperture="${xml(aperture.id)}" data-role="${aperture.role}" fill="white" stroke="none"`
      if (aperture.shape.kind === 'circle') {
        const point = projection.point(...aperture.shape.centreXYMm)
        return `<circle cx="${number(point.x)}" cy="${number(point.y)}" r="${number(projection.length(aperture.shape.diameterMm / 2))}" ${attributes}/>`
      }
      const [x0, y0, x1, y1] = aperture.shape.boundsXYMm
      const box = projection.rect({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 })
      return `<rect x="${number(box.x)}" y="${number(box.y)}" width="${number(box.width)}" height="${number(box.height)}" ${attributes}/>`
    }))
    const labels = kind === 'first-floor' ? selected.filter(component => {
      const polygon = component.geometry.outerPolygonXYMm
      return polygon && [0, 1].every(axis => Math.max(...polygon.map(point => point[axis])) - Math.min(...polygon.map(point => point[axis])) >= 1200)
    }).map(component => {
      if (!component.geometry.centroidXYMm || component.lowerWeightKN === null) throw new Error('A drawn first-floor component needs its actual centroid and lower weight')
      const point = projection.point(...component.geometry.centroidXYMm)
      return `<text x="${number(point.x)}" y="${number(point.y)}" text-anchor="middle" font-size="2.3" data-component="${xml(component.id)}">${number(Math.round(component.lowerWeightKN * 10) / 10)} kN</text>`
    }) : []
    return `<g data-kind="${kind}"><text x="${number(x)}" y="17" font-size="3.2">${kind === 'first-floor' ? 'Net first-floor components' : 'Upper-wall clear envelopes'}</text>${polygons.join('')}${apertures.join('')}${labels.join('')}</g>`
  })
  const credited = components.reduce((sum, component) => sum + component.creditedWeightKN, 0)
  const y = panelHeight + 33
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${number(width)}mm" height="${number(height)}mm" viewBox="0 0 ${number(width)} ${number(height)}" data-source="${xml(source.id)}" data-case="${xml(source.caseDigest)}" data-scale="100"><title>Retained component comparison</title><desc>Source-derived net floor fields, union-cut apertures and upper-wall clear envelopes. Darker fill denotes explicitly declared comparison retention only. Ground slab remains bypass-withheld; uncertain wall loss is tested at adverse positions.</desc><rect width="100%" height="100%" fill="white"/><g font-family="serif" fill="#111"><text x="12" y="8" font-size="4">Retained mass · 1:100 · conditional load paths</text>${groups.join('')}<text x="12" y="${number(y)}" font-size="2.8">${number(credited)} kN credited in declared comparison paths · ${passing}/96 necessary global contact cases</text><text x="12" y="${number(y + 5)}" font-size="2.8">Pale: withheld. Dark: declared comparison. Labels: lower component weight, not automatically retained.</text><text x="12" y="${number(y + 10)}" font-size="2.8">Wall strips show clear envelopes; 25% loss is tested at adverse positions.</text><text x="12" y="${number(y + 15)}" font-size="2.8">Local bearing, shear, anchorage, coupled response and ground-floor moisture remain unresolved.</text></g></svg>`
}
