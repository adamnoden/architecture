import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createSectionPaperProjection } from '../publication-drawing/projection.js'
import type { ServiceTransverseSectionSource } from './publication-service-section-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 112
const SECTION_ORIGIN: PaperPoint = { x: 14, y: 8 }
const SECTION_TOP_MM = 6500

const rect = (
  id: string,
  box: { x: number; y: number; width: number; height: number },
  options: Pick<DrawingRect, 'fill' | 'stroke' | 'dash'> = {},
  metadata: DrawingRect['metadata'] = {}
): DrawingRect => ({ kind: 'rect', id, ...box, ...options, metadata })

const line = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, metadata, ...(dash ? { dash } : {}) })

const text = (
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
  metadata,
  ...(rotateDeg === undefined ? {} : { rotateDeg })
})

export const createServiceTransverseSectionScene = (
  source: ServiceTransverseSectionSource
): DrawingScene => {
  if (source.view.scale !== 100) throw new Error('Service/transverse section is frozen at 1:100.')

  const h = source.substrate.horizontalDatums.value
  const levels = source.substrate.levels
  const sv = source.serviceZone.clearReservation.value
  const opening = source.serviceZone.floorOpening.value
  if (!(source.view.cutPlaneY >= sv.y0 && source.view.cutPlaneY <= sv.y1)) {
    throw new Error('Service/transverse section cut no longer intersects SV-01.')
  }

  const project = createSectionPaperProjection({
    scaleDenominator: source.view.scale,
    horizontalBounds: { min: h.westOuter, max: h.eastOuter },
    verticalBounds: { min: levels.groundFfl.value, max: SECTION_TOP_MM },
    paperOrigin: SECTION_ORIGIN
  })
  const primitives: DrawingPrimitive[] = []

  const groundHeight = levels.groundCeiling.value - levels.groundFfl.value
  const upperHeight = levels.upperCeiling.value - levels.firstFfl.value
  const eastWidth = h.eastOuter - h.galleryService
  const galleryWidth = h.galleryService - h.courtEast

  primitives.push(
    rect(
      'context-ground-plant',
      project.rect({ x: h.galleryService, y: levels.groundFfl.value, width: eastWidth, height: groundHeight }),
      { fill: 'faint', stroke: 'secondary' },
      { authority: source.sectionContexts.groundPlant.authority, role: 'approximate-ground-plant-field' }
    ),
    rect(
      'context-upper-bathroom',
      project.rect({ x: h.galleryService, y: levels.firstFfl.value, width: eastWidth, height: upperHeight }),
      { fill: 'faint', stroke: 'secondary' },
      { authority: source.sectionContexts.upperBathroom.authority, role: 'upper-bathroom-field' }
    ),
    rect(
      'context-ground-gallery',
      project.rect({ x: h.courtEast, y: levels.groundFfl.value, width: galleryWidth, height: groundHeight }),
      { fill: 'none', stroke: 'secondary' },
      { authority: 'CONTROLLED', role: 'dry-side-gallery' }
    ),
    rect(
      'context-upper-gallery',
      project.rect({ x: h.courtEast, y: levels.firstFfl.value, width: galleryWidth, height: upperHeight }),
      { fill: 'none', stroke: 'secondary' },
      { authority: 'CONTROLLED', role: 'dry-side-gallery' }
    )
  )

  const interStoreyHeight = levels.interStoreyReservation.value
  primitives.push(
    rect(
      'interstorey-west',
      project.rect({ x: h.westOuter, y: levels.groundCeiling.value, width: h.courtWest - h.westOuter, height: interStoreyHeight }),
      { fill: 'faint' },
      { authority: 'CONTROLLED', representation: 'architectural-reservation-not-member-depth' }
    ),
    rect(
      'interstorey-east',
      project.rect({ x: h.courtEast, y: levels.groundCeiling.value, width: h.eastOuter - h.courtEast, height: interStoreyHeight }),
      { fill: 'faint' },
      { authority: 'CONTROLLED', representation: 'architectural-reservation-not-member-depth' }
    )
  )

  primitives.push(
    rect(
      'pen-sv-01-envelope',
      project.rect({
        x: opening.representativeX0,
        y: levels.groundCeiling.value,
        width: opening.representativeX1 - opening.representativeX0,
        height: interStoreyHeight
      }),
      { fill: 'paper', stroke: 'primary', dash: 'provisional' },
      { authority: source.serviceZone.floorOpening.authority, finalSize: false, role: 'engineering-starting-envelope' }
    ),
    rect(
      'sv-01-reservation',
      project.rect({
        x: sv.x0,
        y: levels.groundFfl.value,
        width: sv.x1 - sv.x0,
        height: levels.upperCeiling.value - levels.groundFfl.value
      }),
      { fill: 'none', stroke: 'primary', dash: 'provisional' },
      { authority: source.serviceZone.clearReservation.authority, exactPacking: false, role: 'service-capacity-envelope' }
    )
  )

  primitives.push(
    line('ground-termination', project.point(h.westOuter, levels.groundFfl.value), project.point(h.eastOuter, levels.groundFfl.value), 'profile', { role: 'architectural-termination' }),
    line('west-outer', project.point(h.westOuter, levels.groundFfl.value), project.point(h.westOuter, levels.upperCeiling.value), 'profile', { authority: 'CONTROLLED', buildUp: 'unresolved' }),
    line('court-west', project.point(h.courtWest, levels.groundFfl.value), project.point(h.courtWest, levels.upperCeiling.value), 'profile', { authority: 'CONTROLLED', buildUp: 'unresolved' }),
    line('court-east', project.point(h.courtEast, levels.groundFfl.value), project.point(h.courtEast, levels.upperCeiling.value), 'profile', { authority: 'CONTROLLED', buildUp: 'unresolved' }),
    line('east-outer', project.point(h.eastOuter, levels.groundFfl.value), project.point(h.eastOuter, levels.upperCeiling.value), 'profile', { authority: 'CONTROLLED', buildUp: 'unresolved' }),
    line('upper-ceiling-west', project.point(h.westOuter, levels.upperCeiling.value), project.point(h.courtWest, levels.upperCeiling.value), 'secondary', { authority: 'CONTROLLED' }),
    line('upper-ceiling-east', project.point(h.courtEast, levels.upperCeiling.value), project.point(h.eastOuter, levels.upperCeiling.value), 'secondary', { authority: 'CONTROLLED' })
  )

  primitives.push(
    line(
      'access-ground-qualitative',
      project.point(8500, 1400),
      project.point(sv.x0, 1400),
      'secondary',
      { authority: source.serviceZone.access.authority, exactRoute: false, role: 'dry-side-access-relation' },
      'provisional'
    ),
    line(
      'access-upper-qualitative',
      project.point(8300, 4550),
      project.point(sv.x0, 4550),
      'secondary',
      { authority: source.serviceZone.access.authority, exactRoute: false, role: 'dry-side-access-relation' },
      'provisional'
    ),
    line(
      'service-continuation-above-ceiling',
      project.point((sv.x0 + sv.x1) / 2, levels.upperCeiling.value),
      project.point((sv.x0 + sv.x1) / 2, 6400),
      'secondary',
      { exactRoute: false, role: 'qualitative-roof-service-continuation' },
      'provisional'
    )
  )

  primitives.push(
    text('label-west-ground', project.point(2100, 1450), 'Occupied west ring', 'label', 'middle', { occupancyGeometry: 'context-only' }),
    text('label-west-upper', project.point(2100, 4550), 'Occupied west ring', 'label', 'middle', { occupancyGeometry: 'context-only' }),
    text('label-court', project.point((h.courtWest + h.courtEast) / 2, 3000), 'Open courtyard', 'label', 'middle', { authority: 'CONTROLLED' }),
    text('label-ground-gallery', project.point((h.courtEast + h.galleryService) / 2, 1450), 'G-GAL-01', 'note', 'middle', { authority: 'CONTROLLED' }, -90),
    text('label-upper-gallery', project.point((h.courtEast + h.galleryService) / 2, 4550), 'U-GAL-02', 'note', 'middle', { authority: 'CONTROLLED' }, -90),
    text('label-ground-plant', project.point((h.galleryService + h.eastOuter) / 2, 1450), 'G-PLANT-01', 'label', 'middle', { authority: source.sectionContexts.groundPlant.authority }),
    text('label-upper-bath', project.point((h.galleryService + h.eastOuter) / 2, 4550), 'U-BATH-01', 'label', 'middle', { authority: 'CONTROLLED' }),
    text('label-sv-01', project.point((sv.x0 + sv.x1) / 2, 3650), 'SV-01 ≈900 clear', 'note', 'middle', { authority: source.serviceZone.clearReservation.authority }, -90),
    text('label-west', { x: 14, y: 77 }, 'West', 'note'),
    text('label-east', { x: 134, y: 77 }, 'East / service side', 'note', 'end')
  )

  const levelX0 = 137
  const levelX1 = 143
  const levelTextX = 145
  const levelSpecs = [
    ['G FFL ±0', levels.groundFfl.value],
    ['G ceil +2950', levels.groundCeiling.value],
    ['FFL1 +3300', levels.firstFfl.value],
    ['U ceil +6000', levels.upperCeiling.value]
  ] as const
  for (const [label, elevation] of levelSpecs) {
    const y = project.point(0, elevation).y
    primitives.push(
      line(`level-${elevation}`, { x: levelX0, y }, { x: levelX1, y }, 'secondary', { elevation }, 'datum'),
      text(`level-text-${elevation}`, { x: levelTextX, y: y + 0.8 }, label, 'note')
    )
  }

  primitives.push(
    text('note-capacity', { x: 14, y: 83 }, 'SV-01 capacity only — soil/vent · water · dry · hydronic · 2× MVHR trunks ≈160–200 mm class.', 'note'),
    text('note-packing', { x: 14, y: 87 }, 'Internal packing, supports and fire/acoustic closure unresolved.', 'note'),
    text('note-opening', { x: 14, y: 91 }, 'PEN-SV-01 ≈1050×850 mm engineering envelope; final opening/framing unresolved.', 'note'),
    text('note-plant', { x: 14, y: 95 }, 'G-PLANT-01 equipment classes only; product packing and replacement geometry unresolved.', 'note'),
    text('note-boundary', { x: 14, y: 99 }, 'East/service interfaces: MVHR air · ASHP link · foul exit · soil vent — exact penetrations unresolved.', 'note'),
    text('note-detail-boundary', { x: 14, y: 103 }, 'Wall build-up and roof distribution omitted; architectural coordination, not MEP detail.', 'note')
  )

  const scaleX = 128
  const scaleY = 106
  primitives.push(
    line('scale-bar', { x: scaleX, y: scaleY }, { x: scaleX + 30, y: scaleY }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) =>
      line(`scale-tick-${index}`, { x: scaleX + index * 10, y: scaleY - 2 }, { x: scaleX + index * 10, y: scaleY + 2 }, 'secondary')
    ),
    text('scale-zero', { x: scaleX, y: 111 }, '0', 'note'),
    text('scale-three', { x: scaleX + 30, y: 111 }, '3 m', 'note', 'end')
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.id,
    title: 'Reference House service / transverse section',
    description:
      'West-east architectural section at true 1:100 through the stacked service geography. Controlled building datums are combined with approximate service-capacity envelopes and qualitative current-system relationships; MEP packing and construction details are intentionally unresolved.',
    scaleDenominator: source.view.scale,
    sourceId: source.view.id,
    primitives
  }
}
