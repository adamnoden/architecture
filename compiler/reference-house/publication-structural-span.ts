import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import { compileReferenceHouse } from './compile.js'
import { createReferenceHouseSource } from './fixture.js'
import { createFirstFloorPublicationPlanSource } from './publication-first-floor-plan-source.js'
import { createFirstFloorPublicationPlanScene } from './publication-first-floor-plan.js'
import { createGroundFloorPublicationPlanSource } from './publication-plan-source.js'
import {
  createStructuralSpanOverlaySource,
  type StructuralSpanOverlaySource,
  type StructuralSpanRegion
} from './publication-structural-span-source.js'

const PLAN_ORIGIN: PaperPoint = { x: 8, y: 12 }

const line = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, ...(dash ? { dash } : {}), metadata })

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'middle',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

const rect = (
  id: string,
  value: { x: number; y: number; width: number; height: number },
  metadata: DrawingRect['metadata'] = {},
  dash?: DrawingRect['dash']
): DrawingRect => ({ kind: 'rect', id, ...value, stroke: 'secondary', fill: 'none', ...(dash ? { dash } : {}), metadata })

const arrowHead = (
  id: string,
  tip: PaperPoint,
  direction: 'east' | 'west' | 'north' | 'south',
  metadata: DrawingLine['metadata']
): DrawingLine[] => {
  const along = 2.2
  const across = 1.3
  if (direction === 'east') return [
    line(`${id}-a`, tip, { x: tip.x - along, y: tip.y - across }, 'primary', metadata),
    line(`${id}-b`, tip, { x: tip.x - along, y: tip.y + across }, 'primary', metadata)
  ]
  if (direction === 'west') return [
    line(`${id}-a`, tip, { x: tip.x + along, y: tip.y - across }, 'primary', metadata),
    line(`${id}-b`, tip, { x: tip.x + along, y: tip.y + across }, 'primary', metadata)
  ]
  if (direction === 'north') return [
    line(`${id}-a`, tip, { x: tip.x - across, y: tip.y + along }, 'primary', metadata),
    line(`${id}-b`, tip, { x: tip.x + across, y: tip.y + along }, 'primary', metadata)
  ]
  return [
    line(`${id}-a`, tip, { x: tip.x - across, y: tip.y - along }, 'primary', metadata),
    line(`${id}-b`, tip, { x: tip.x + across, y: tip.y - along }, 'primary', metadata)
  ]
}

const spanArrow = (
  region: StructuralSpanRegion,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingPrimitive[] => {
  const metadata = {
    overlay: 'structural-span',
    source: 'structural-coordination.md',
    authority: 'TECHNICAL_COORDINATION_SELECTED_OUTSIDE_RH_C1',
    role: 'gross-span-direction-not-joist-centreline',
    spanRegion: region.id,
    grossSpanMm: region.grossSpan,
    qualification: region.qualification
  }

  if (region.id === 'WEST-SIDE') {
    const a = project.point(region.x0 + 800, 5400)
    const b = project.point(region.x1 - 800, 5400)
    return [
      line(`span-${region.id}`, a, b, 'primary', metadata),
      ...arrowHead(`span-${region.id}-west`, a, 'west', metadata),
      ...arrowHead(`span-${region.id}-east`, b, 'east', metadata),
      text(`span-${region.id}-label`, project.point(2100, 5850), '≈4.2 m gross · E–W', 'marker', 'middle', metadata)
    ]
  }

  if (region.id === 'EAST-SIDE') {
    const a = project.point(region.x0 + 800, 3500)
    const b = project.point(region.x1 - 800, 3500)
    return [
      line(`span-${region.id}`, a, b, 'primary', metadata),
      ...arrowHead(`span-${region.id}-west`, a, 'west', metadata),
      ...arrowHead(`span-${region.id}-east`, b, 'east', metadata),
      text(`span-${region.id}-label`, project.point(9900, 3950), '≈4.2 m gross · E–W', 'marker', 'middle', metadata)
    ]
  }

  const x = region.id === 'SOUTH-CENTRE' ? 7000 : 6000
  const a = project.point(x, region.y0 + 650)
  const b = project.point(x, region.y1 - 650)
  const labelY = region.id === 'SOUTH-CENTRE' ? 3050 : 8500
  const parts: DrawingPrimitive[] = [
    line(`span-${region.id}`, a, b, 'primary', metadata),
    ...arrowHead(`span-${region.id}-south`, a, 'south', metadata),
    ...arrowHead(`span-${region.id}-north`, b, 'north', metadata),
    text(`span-${region.id}-label`, project.point(x - 250, labelY), '≈3.4 m gross · N–S', 'marker', 'end', metadata)
  ]
  if (region.qualification === 'local-stair-framing-modifies-field') {
    parts.push(text(
      `span-${region.id}-qualification`,
      project.point(x - 250, labelY - 350),
      'stair opening modifies regular field',
      'note',
      'end',
      metadata
    ))
  }
  return parts
}

export const createStructuralSpanOverlayPublicationScene = (
  source: StructuralSpanOverlaySource = createStructuralSpanOverlaySource()
): DrawingScene => {
  const result = compileReferenceHouse(createReferenceHouseSource())
  if (result.status === 'FAIL') throw new Error('Cannot create DRW-10A overlay from failed Reference House compile.')
  const ground = createGroundFloorPublicationPlanSource()
  const first = createFirstFloorPublicationPlanSource()
  const base = createFirstFloorPublicationPlanScene(result, first, ground)
  if (base.scaleDenominator !== source.view.scale || base.viewId !== source.view.substrate) {
    throw new Error('DRW-10A overlay substrate no longer matches the frozen first-floor publication plan.')
  }

  // Deliberately mirrors the frozen first-floor paper projection. The base scene
  // remains untouched; DRW-10F will independently prove analytical-family source equivalence.
  const project = createPlanPaperProjection({
    scaleDenominator: source.view.scale,
    modelBounds: {
      x: 0,
      y: 0,
      width: source.substrate.shell.width.value,
      height: source.substrate.shell.depth.value
    },
    paperOrigin: PLAN_ORIGIN
  })

  const overlay: DrawingPrimitive[] = source.structuralConcept.spanRegions.value.flatMap((region) => spanArrow(region, project))
  const court = source.substrate.court.extents.value
  const supportMetadata = {
    overlay: 'structural-span',
    source: 'structural-coordination.md',
    authority: source.structuralConcept.permanentSupportOrder.authority,
    role: 'permanent-masonry-support-order-not-member-centreline'
  }
  overlay.push(
    line('support-court-south', project.point(court.x0, court.y0), project.point(court.x1, court.y0), 'profile', supportMetadata),
    line('support-court-north', project.point(court.x0, court.y1), project.point(court.x1, court.y1), 'profile', supportMetadata),
    line('support-court-west', project.point(court.x0, court.y0), project.point(court.x0, court.y1), 'profile', supportMetadata),
    line('support-court-east', project.point(court.x1, court.y0), project.point(court.x1, court.y1), 'profile', supportMetadata)
  )

  const service = source.structuralConcept.openingFraming.value.service.reservation
  overlay.push(rect(
    'structural-service-opening-reservation',
    project.rect({
      x: service.x0,
      y: service.y0,
      width: service.clearWidth,
      height: service.clearDepth
    }),
    {
      overlay: 'structural-span',
      source: 'SV-01',
      authority: source.structuralConcept.openingFraming.authority,
      role: 'local-framing-obligation-zone-not-final-opening',
      finalStructuralOpening: source.structuralConcept.openingFraming.value.service.finalStructuralOpening
    },
    'provisional'
  ))

  overlay.push(
    text('structural-court-note', project.point(6000, 6650), 'court masonry · permanent support order', 'note', 'middle', supportMetadata),
    text('structural-service-note', project.point(10300, 7450), 'SV-01 · local framing required', 'note', 'middle', {
      overlay: 'structural-span',
      finalTrimmers: 'ABSENT_STRUCTURAL_ENGINEERING'
    }),
    text('structural-absence-note', { x: 8, y: 133 }, 'Concept only · no member sizes, joist centrelines, bearings, connections or foundations.', 'note', 'start', {
      overlay: 'structural-span',
      memberSizes: source.absences.memberSizes,
      joistCentrelines: source.absences.joistCentrelines
    })
  )

  return {
    ...base,
    viewId: source.view.id,
    title: 'Reference House structural and span reading',
    description: 'Removable analytical overlay on the canonical first-floor plan. Permanent masonry support order, gross span directions and local opening-framing obligations are shown at architectural coordination level only; member sizes, joist centrelines, bearings, connections and foundations remain external structural-engineering work.',
    sourceId: source.view.id,
    primitives: [...base.primitives, ...overlay]
  }
}
