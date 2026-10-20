import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createRoofDrainagePublicationScene } from './publication-roof-drainage.js'
import {
  createRoofDrainagePublicationSource,
  type RoofDrainagePublicationSource
} from './publication-roof-drainage-source.js'

const line = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'],
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, metadata, ...(dash ? { dash } : {}) })

const rect = (
  id: string,
  value: { x: number; y: number; width: number; height: number },
  metadata: DrawingRect['metadata'],
  dash?: DrawingRect['dash']
): DrawingRect => ({ kind: 'rect', id, ...value, stroke: 'secondary', fill: 'none', metadata, ...(dash ? { dash } : {}) })

const text = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  metadata: DrawingText['metadata'],
  anchor: DrawingText['anchor'] = 'start',
  rotateDeg?: number
): DrawingText => ({
  kind: 'text',
  id,
  x: point.x,
  y: point.y,
  value,
  role,
  metadata,
  anchor,
  ...(rotateDeg === undefined ? {} : { rotateDeg })
})

const outwardArrow = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  metadata: DrawingLine['metadata']
): DrawingLine[] => {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  if (length === 0) throw new Error(`${id}: outward-failure arrow requires non-zero length.`)
  const ux = dx / length
  const uy = dy / length
  const px = -uy
  const py = ux
  const headBase = { x: b.x - ux * 2.1, y: b.y - uy * 2.1 }
  return [
    line(`${id}-shaft`, a, b, 'primary', metadata, 'provisional'),
    line(`${id}-head-a`, b, { x: headBase.x + px * 1.2, y: headBase.y + py * 1.2 }, 'primary', metadata, 'provisional'),
    line(`${id}-head-b`, b, { x: headBase.x - px * 1.2, y: headBase.y - py * 1.2 }, 'primary', metadata, 'provisional')
  ]
}

/**
 * DRW-10C deliberately reuses the complete DRW-07 roof scene as its substrate.
 * Added paper-space notation communicates failure direction and inspection
 * relationships only; it never becomes a gutter, RWP, drain or overflow coordinate.
 */
export const createRoofWaterFailureOverlayScene = (
  source: RoofDrainagePublicationSource = createRoofDrainagePublicationSource()
): DrawingScene => {
  const base = createRoofDrainagePublicationScene(source)
  const overlay: DrawingPrimitive[] = []

  const collectionMetadata = {
    overlay: 'roof-water-failure',
    authority: source.outerCollection.authority,
    role: 'external-collection-zone-not-gutter-profile',
    exactGeometry: false,
    gutterProfile: source.technicalAbsences.gutterProfile,
    hydraulicSizing: source.technicalAbsences.hydraulicSizing
  }
  // Offset rectangle is paper-space analytical notation only. It intentionally
  // cannot be mistaken for a model-space gutter profile.
  overlay.push(rect('failure-external-collection-zone', { x: 6, y: 10, width: 124, height: 112 }, collectionMetadata, 'provisional'))

  const overflowMetadata = {
    overlay: 'roof-water-failure',
    authority: source.outerCollection.authority,
    role: 'visible-outward-failure-direction-not-outlet-coordinate',
    exactPosition: false,
    overflowLevel: source.technicalAbsences.overflowLevel
  }
  overlay.push(
    ...outwardArrow('failure-north-outward', { x: 68, y: 10 }, { x: 68, y: 4 }, overflowMetadata),
    ...outwardArrow('failure-west-outward', { x: 6, y: 66 }, { x: 1.5, y: 66 }, overflowMetadata),
    ...outwardArrow('failure-east-outward', { x: 130, y: 66 }, { x: 134.5, y: 66 }, overflowMetadata),
    ...outwardArrow('failure-south-outward', { x: 118, y: 122 }, { x: 118, y: 127 }, overflowMetadata)
  )

  const courtMetadata = {
    overlay: 'roof-water-failure',
    authority: source.courtWater.primaryCollector.authority,
    role: 'courtyard-collector-inspection-zone-not-exact-geometry',
    exactGeometry: false,
    collectorDimensions: source.technicalAbsences.collectorDimensions
  }
  // East court edge in the controlled 1:100 roof scene is x=86, y=46..86.
  // This inset paper-space bracket marks the selected zone, not a collector line.
  overlay.push(
    line('failure-court-collector-zone', { x: 88.5, y: 52 }, { x: 88.5, y: 80 }, 'primary', courtMetadata, 'provisional'),
    text('failure-court-collector-label', { x: 91.5, y: 66 }, 'INSPECT', 'marker', courtMetadata, 'middle', -90)
  )

  overlay.push(
    text(
      'failure-perimeter-title',
      { x: 134, y: 74 },
      'FAILURE READING',
      'marker',
      { overlay: 'roof-water-failure' }
    ),
    text(
      'failure-perimeter-note-1',
      { x: 134, y: 80 },
      'Perimeter overflow',
      'note',
      { ...overflowMetadata, overflowBehaviour: source.outerCollection.value.overflowBehaviour }
    ),
    text(
      'failure-perimeter-note-2',
      { x: 134, y: 84 },
      'visible + outward',
      'note',
      overflowMetadata
    ),
    text(
      'failure-court-primary-title',
      { x: 134, y: 93 },
      '1 · PRIMARY',
      'marker',
      { overlay: 'roof-water-failure', authority: source.courtWater.primaryRoute.authority }
    ),
    text(
      'failure-court-primary-note',
      { x: 134, y: 97 },
      'collector → external',
      'note',
      {
        overlay: 'roof-water-failure',
        authority: source.courtWater.primaryRoute.authority,
        exactCentreline: source.courtWater.primaryRoute.value.exactCentreline
      }
    ),
    text(
      'failure-court-primary-inspection',
      { x: 134, y: 101 },
      'inspection point',
      'note',
      { overlay: 'roof-water-failure', authority: source.courtWater.primaryRoute.authority }
    ),
    text(
      'failure-court-emergency-title',
      { x: 134, y: 110 },
      '2 · EMERGENCY',
      'marker',
      { overlay: 'roof-water-failure', authority: source.courtWater.emergencyOverflow.authority }
    ),
    text(
      'failure-court-emergency-note',
      { x: 134, y: 114 },
      'independent + visible',
      'note',
      {
        overlay: 'roof-water-failure',
        authority: source.courtWater.emergencyOverflow.authority,
        exactLevel: source.courtWater.emergencyOverflow.value.exactLevel
      }
    ),
    text(
      'failure-court-emergency-priority',
      { x: 134, y: 118 },
      'before thresholds',
      'note',
      {
        overlay: 'roof-water-failure',
        authority: source.courtWater.emergencyOverflow.authority,
        priority: source.courtWater.emergencyOverflow.value.priority
      }
    ),
    text(
      'failure-absence-note',
      { x: 8, y: 142 },
      'No internal roof outlet · no hidden courtyard gutter · no hydraulic sizing or outlet coordinates.',
      'note',
      {
        overlay: 'roof-water-failure',
        internalRoofOutlet: source.selectedAbsences.internalRoofOutlet,
        courtyardRoofGutter: source.selectedAbsences.courtyardRoofGutter,
        siteDischarge: source.technicalAbsences.siteDischarge
      }
    )
  )

  return {
    ...base,
    viewId: 'REFERENCE-HOUSE-ROOF-WATER-FAILURE-OVERLAY',
    title: 'Reference House roof water and failure reading',
    description: 'Removable analytical overlay on the controlled DRW-07 roof/drainage plan. External collection and overflow failure are read as inspectable, visible and outward; courtyard primary collection and independent emergency overflow remain distinct. Analytical notation does not assert gutter profiles, RWP coordinates, drain centrelines, overflow levels or hydraulic sizing.',
    sourceId: source.view.value.id,
    primitives: [...base.primitives, ...overlay]
  }
}
