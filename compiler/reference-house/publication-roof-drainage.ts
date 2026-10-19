import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import type {
  RoofDrainagePublicationSource,
  RoofPoint,
  RoofSide
} from './publication-roof-drainage-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 145
const PLAN_ORIGIN: PaperPoint = { x: 8, y: 12 }

const rectPrimitive = (
  id: string,
  rect: { x: number; y: number; width: number; height: number },
  stroke: DrawingRect['stroke'],
  metadata: DrawingRect['metadata'] = {},
  dash?: DrawingRect['dash']
): DrawingRect => ({ kind: 'rect', id, ...rect, fill: 'none', stroke, ...(dash ? { dash } : {}), metadata })

const linePrimitive = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, ...(dash ? { dash } : {}), metadata })

const textPrimitive = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {},
  rotateDeg?: number
): DrawingText => ({
  kind: 'text',
  id,
  x: point.x,
  y: point.y,
  value,
  role,
  anchor,
  ...(rotateDeg === undefined ? {} : { rotateDeg }),
  metadata
})

const arrowPrimitives = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  metadata: DrawingLine['metadata']
): DrawingLine[] => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  if (length <= 0) throw new Error(`${id}: fall arrow requires distinct points.`)
  const ux = dx / length
  const uy = dy / length
  const px = -uy
  const py = ux
  const headLength = 2.4
  const headWidth = 1.5
  const headBase = { x: b.x - ux * headLength, y: b.y - uy * headLength }

  return [
    linePrimitive(`${id}-shaft`, a, b, 'secondary', metadata, 'provisional'),
    linePrimitive(
      `${id}-head-a`,
      b,
      { x: headBase.x + px * headWidth, y: headBase.y + py * headWidth },
      'secondary',
      metadata,
      'provisional'
    ),
    linePrimitive(
      `${id}-head-b`,
      b,
      { x: headBase.x - px * headWidth, y: headBase.y - py * headWidth },
      'secondary',
      metadata,
      'provisional'
    )
  ]
}

const fallAnnotationModelPoints = (side: RoofSide): readonly [RoofPoint, RoofPoint] => {
  if (side === 'SOUTH') return [{ x: 6000, y: 2700 }, { x: 6000, y: 700 }]
  if (side === 'NORTH') return [{ x: 6000, y: 8100 }, { x: 6000, y: 10100 }]
  if (side === 'WEST') return [{ x: 3300, y: 5400 }, { x: 800, y: 5400 }]
  return [{ x: 8700, y: 5400 }, { x: 11200, y: 5400 }]
}

const fieldLabelModelPoint = (side: RoofSide): RoofPoint => {
  if (side === 'SOUTH') return { x: 6000, y: 1800 }
  if (side === 'NORTH') return { x: 6000, y: 9000 }
  if (side === 'WEST') return { x: 2350, y: 5400 }
  return { x: 9650, y: 5400 }
}

export const createRoofDrainagePublicationScene = (
  source: RoofDrainagePublicationSource
): DrawingScene => {
  const width = source.substrate.shell.value.width
  const depth = source.substrate.shell.value.depth
  const court = source.substrate.court.value
  const project = createPlanPaperProjection({
    scaleDenominator: source.view.value.scale,
    modelBounds: { x: 0, y: 0, width, height: depth },
    paperOrigin: PLAN_ORIGIN
  })
  const primitives: DrawingPrimitive[] = []

  primitives.push(
    rectPrimitive(
      'roof-shell',
      project.rect({ x: 0, y: 0, width, height: depth }),
      'profile',
      { authority: 'CONTROLLED', role: 'roof-plan-substrate' }
    ),
    rectPrimitive(
      'roof-court',
      project.rect({ x: court.x0, y: court.y0, width: court.width, height: court.depth }),
      'profile',
      { authority: 'CONTROLLED', role: 'open-courtyard' }
    )
  )

  for (const watershed of source.watersheds) {
    primitives.push(
      linePrimitive(
        watershed.id,
        project.point(watershed.from.x, watershed.from.y),
        project.point(watershed.to.x, watershed.to.y),
        'secondary',
        { authority: watershed.authority, role: 'watershed', provenance: 'RH-08 + canonical substrate' },
        'provisional'
      )
    )
  }

  for (const field of source.fields) {
    const [from, to] = fallAnnotationModelPoints(field.side)
    primitives.push(
      ...arrowPrimitives(
        `fall-${field.side.toLowerCase()}`,
        project.point(from.x, from.y),
        project.point(to.x, to.y),
        {
          authority: field.polygon.authority,
          semanticAuthority: field.fallDirection.authority,
          role: 'direction-only-annotation',
          notExactGeometry: true
        }
      )
    )
    const label = fieldLabelModelPoint(field.side)
    primitives.push(
      textPrimitive(
        `field-${field.side.toLowerCase()}-catchment`,
        project.point(label.x, label.y),
        `≈${field.catchment.squareMetres.toFixed(1)} m² · fall ≈1:${source.roofFamily.value.screeningFallDenominator}`,
        'note',
        'middle',
        { authority: 'OUTSIDE_RH_C1_DERIVED', role: 'plan-area-proxy-not-hydraulic-sizing' },
        field.side === 'WEST' || field.side === 'EAST' ? -90 : undefined
      )
    )
  }

  primitives.push(
    textPrimitive(
      'outer-collection-note',
      { x: 134, y: 18 },
      'External collection: all perimeter edges',
      'note',
      'start',
      { authority: source.outerCollection.authority, exactProfile: false }
    ),
    textPrimitive('rwp-sw-zone', { x: 134, y: 27 }, 'RWP SW — W return zone', 'note', 'start', { authority: source.rwps[0].authority, exactPosition: false }),
    textPrimitive('rwp-se-zone', { x: 134, y: 31 }, 'RWP SE — E/service return zone', 'note', 'start', { authority: source.rwps[1].authority, exactPosition: false }),
    textPrimitive('rwp-nw-zone', { x: 134, y: 35 }, 'RWP NW — rear/W zone', 'note', 'start', { authority: source.rwps[2].authority, exactPosition: false }),
    textPrimitive('rwp-ne-zone', { x: 134, y: 39 }, 'RWP NE — rear/E zone', 'note', 'start', { authority: source.rwps[3].authority, exactPosition: false }),
    textPrimitive(
      'soil-vent-zone',
      { x: 134, y: 50 },
      'Soil vent — E/service roof-field zone',
      'note',
      'start',
      { authority: source.roofService.authority, exactPosition: false }
    ),
    textPrimitive(
      'selected-absence-note',
      { x: 134, y: 59 },
      'No internal roof outlet / no front RWP',
      'note',
      'start',
      { authority: 'ABSENT_SELECTED' }
    )
  )

  primitives.push(
    textPrimitive(
      'principal-front-label',
      { x: 68, y: 124 },
      'SOUTH / PRINCIPAL FRONT',
      'marker',
      'middle',
      { orientation: 'south-front-model-y0' }
    ),
    textPrimitive(
      'court-collector-zone',
      { x: 8, y: 130 },
      'Court collector — east/service-side zone',
      'note',
      'start',
      { authority: source.courtWater.primaryCollector.authority, exactGeometry: false }
    ),
    textPrimitive(
      'court-primary-route-topology',
      { x: 8, y: 134 },
      'Primary route — straight → external service-side inspection',
      'note',
      'start',
      { authority: source.courtWater.primaryRoute.authority, exactCentreline: false }
    ),
    textPrimitive(
      'court-overflow-topology',
      { x: 8, y: 138 },
      'Overflow — independent → visible east/service-side outlet',
      'note',
      'start',
      { authority: source.courtWater.emergencyOverflow.authority, exactLevel: false }
    )
  )

  const scaleX = 98
  const scaleY = 137
  primitives.push(
    linePrimitive('scale-bar', { x: scaleX, y: scaleY }, { x: scaleX + 30, y: scaleY }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) =>
      linePrimitive(`scale-tick-${index}`, { x: scaleX + index * 10, y: scaleY - 2 }, { x: scaleX + index * 10, y: scaleY + 2 }, 'secondary')
    ),
    textPrimitive('scale-zero', { x: scaleX, y: scaleY + 5 }, '0', 'note'),
    textPrimitive('scale-three', { x: scaleX + 30, y: scaleY + 5 }, '3 m', 'note', 'end')
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House roof and drainage plan',
    description:
      'Roof/drainage plan at true 1:100. Exact shell and courtyard substrate are combined with provisional roof-field geometry and explicitly qualitative drainage topology; deferred technical coordinates are not invented.',
    scaleDenominator: source.view.value.scale,
    sourceId: source.view.value.id,
    primitives
  }
}
