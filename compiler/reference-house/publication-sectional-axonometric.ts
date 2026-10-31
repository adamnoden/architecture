import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createParallelProjection3D, type ModelPoint3D } from '../publication-drawing/projection-3d.js'
import { createReferenceHouseSource } from './fixture.js'
import { referenceHouseCourtGeometry } from './plan-adapter.js'
import { createSectionalAxonometricViewSpec } from './publication-sectional-axonometric-view.js'
import { createServiceTransverseSectionSource } from './publication-service-section-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 112

// Editorial NTS composition only. This constant maps the already-selected parallel
// projection into the physical plate. It is not an architectural scale claim.
const COMPOSITION_MM_PER_MODEL_MM = 0.007
const PAPER_X_OFFSET_MM = -2
const PAPER_Y_BASELINE_MM = 84

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
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

const modelLineKey = (a: ModelPoint3D, b: ModelPoint3D): string =>
  `${a.x},${a.y},${a.z}-${b.x},${b.y},${b.z}`

export const createSectionalAxonometricPublicationScene = (): DrawingScene => {
  const house = createReferenceHouseSource()
  const court = referenceHouseCourtGeometry(house)
  const service = createServiceTransverseSectionSource()
  const view = createSectionalAxonometricViewSpec()

  if (view.cut.coordinate !== court.y0 || view.cut.keep !== 'north') {
    throw new Error('DRW-09D requires the frozen DRW-09A south-court-edge cut.')
  }

  const projection = createParallelProjection3D({
    basis: {
      horizontal: view.projection.horizontalBasis,
      vertical: view.projection.verticalBasis,
      viewDirection: view.projection.viewDirection
    }
  })

  const paperPoint = (point: ModelPoint3D): PaperPoint => {
    const projected = projection.project(point)
    return {
      x: PAPER_X_OFFSET_MM + projected.horizontal * COMPOSITION_MM_PER_MODEL_MM,
      y: PAPER_Y_BASELINE_MM - projected.vertical * COMPOSITION_MM_PER_MODEL_MM
    }
  }

  const modelLine = (
    id: string,
    a: ModelPoint3D,
    b: ModelPoint3D,
    role: DrawingLine['role'],
    metadata: DrawingLine['metadata'] = {},
    dash?: DrawingLine['dash']
  ): DrawingLine => line(id, paperPoint(a), paperPoint(b), role, {
    ...metadata,
    modelEdge: modelLineKey(a, b),
    composition: 'NTS-fixed-parallel-projection'
  }, dash)

  const footprint = [
    { x: 0, y: court.y0 },
    { x: court.x0, y: court.y0 },
    { x: court.x0, y: court.y1 },
    { x: court.x1, y: court.y1 },
    { x: court.x1, y: court.y0 },
    { x: house.shell.width.value, y: court.y0 },
    { x: house.shell.width.value, y: house.shell.depth.value },
    { x: 0, y: house.shell.depth.value }
  ]

  const primitives: DrawingPrimitive[] = []

  const addFootprintLoop = (
    id: string,
    z: number,
    defaultRole: DrawingLine['role'],
    metadata: DrawingLine['metadata']
  ): void => {
    footprint.forEach((point, index) => {
      const next = footprint[(index + 1) % footprint.length]
      const onCut = point.y === court.y0 && next.y === court.y0
      primitives.push(modelLine(
        `${id}-${index}`,
        { ...point, z },
        { ...next, z },
        onCut ? 'cut' : defaultRole,
        { ...metadata, ...(onCut ? { relation: 'section-cut-edge' } : {}) }
      ))
    })
  }

  addFootprintLoop('ground-order', house.levels.groundFfl.value, 'profile', {
    authority: 'CONTROLLED',
    role: 'retained-U-footprint-order'
  })
  addFootprintLoop('first-floor-order', house.levels.firstFfl.value, 'primary', {
    authority: 'CONTROLLED',
    role: 'first-floor-datum-order'
  })
  addFootprintLoop('upper-ceiling-order', house.levels.upperCeiling.value, 'profile', {
    authority: 'CONTROLLED',
    role: 'upper-clear-ceiling-order'
  })

  footprint.forEach((point, index) => {
    const onCut = point.y === court.y0
    primitives.push(modelLine(
      `vertical-order-${index}`,
      { ...point, z: house.levels.groundFfl.value },
      { ...point, z: house.levels.upperCeiling.value },
      onCut ? 'cut' : 'profile',
      {
        authority: 'CONTROLLED',
        role: onCut ? 'section-cut-vertical' : 'permanent-boundary-vertical-order'
      }
    ))
  })

  // Controlled east service-flank datum: exact in plan, shown at occupied floor datums.
  const serviceX = house.partitions.galleryServiceX.value
  for (const z of [house.levels.groundFfl.value, house.levels.firstFfl.value]) {
    primitives.push(modelLine(
      `service-flank-${z}`,
      { x: serviceX, y: court.y0, z },
      { x: serviceX, y: court.y1, z },
      'secondary',
      { authority: 'CONTROLLED', role: 'east-service-flank-geography' },
      'datum'
    ))
  }

  // SV-01 is a documented approximate capacity reservation, not a shaft lining or packed MEP solid.
  const sv = service.serviceZone.clearReservation.value
  const svCorners = [
    { x: sv.x0, y: sv.y0 },
    { x: sv.x1, y: sv.y0 },
    { x: sv.x1, y: sv.y1 },
    { x: sv.x0, y: sv.y1 }
  ]
  const svLevels = [house.levels.groundFfl.value, house.levels.upperCeiling.value]
  for (const z of svLevels) {
    svCorners.forEach((point, index) => {
      const next = svCorners[(index + 1) % svCorners.length]
      primitives.push(modelLine(
        `sv01-${z}-edge-${index}`,
        { ...point, z },
        { ...next, z },
        'secondary',
        { authority: service.serviceZone.clearReservation.authority, precision: 'approximate', role: 'capacity-zone-not-packed-services' },
        'provisional'
      ))
    })
  }
  svCorners.forEach((point, index) => {
    primitives.push(modelLine(
      `sv01-vertical-${index}`,
      { ...point, z: svLevels[0] },
      { ...point, z: svLevels[1] },
      'secondary',
      { authority: service.serviceZone.clearReservation.authority, precision: 'approximate', role: 'capacity-zone-not-packed-services' },
      'provisional'
    ))
  })

  // Only the controlled/provisional outer roof-edge datum is spatialised. Exact sloping
  // roof surfaces and inner high-edge geometry remain absent by DRW-09A authority.
  const corniceZ = house.levels.corniceControl.value
  const outerRoofEdges: Array<[ModelPoint3D, ModelPoint3D]> = [
    [{ x: 0, y: court.y0, z: corniceZ }, { x: 0, y: house.shell.depth.value, z: corniceZ }],
    [{ x: 0, y: house.shell.depth.value, z: corniceZ }, { x: house.shell.width.value, y: house.shell.depth.value, z: corniceZ }],
    [{ x: house.shell.width.value, y: house.shell.depth.value, z: corniceZ }, { x: house.shell.width.value, y: court.y0, z: corniceZ }]
  ]
  outerRoofEdges.forEach(([a, b], index) => primitives.push(modelLine(
    `roof-outer-control-${index}`,
    a,
    b,
    'secondary',
    { authority: house.levels.corniceControl.authority, precision: 'approximate', role: 'outer-roof-edge-control-only' },
    'provisional'
  )))

  primitives.push(
    text('nts-title', { x: 118, y: 18 }, 'SECTIONAL AXONOMETRIC · NTS', 'label'),
    text('cut-note', { x: 118, y: 25 }, 'cut Y = 3.40 m · south court edge', 'note', 'start', { authority: 'CONTROLLED' }),
    text('court-void-label', { x: 118, y: 29 }, 'court · controlled open void', 'note', 'start', { authority: 'CONTROLLED', geometry: 'void-not-solid' }),
    text('sv-note', { x: 118, y: 36 }, 'SV-01 · provisional capacity zone', 'note', 'start', { packing: 'ABSENT_TECHNICAL' }),
    text('roof-note-1', { x: 118, y: 45 }, 'roof · outward-field topology retained', 'note'),
    text('roof-note-2', { x: 118, y: 49 }, 'exact 3D fall surfaces absent', 'note', 'start', { roofVerticalGeometry: 'ABSENT' }),
    text('layers-note-1', { x: 118, y: 60 }, 'permanent support / enclosure order', 'note'),
    text('layers-note-2', { x: 118, y: 64 }, 'replaceable layers · semantic only', 'note', 'start', { layerThicknesses: 'ABSENT' }),
    text('opening-note', { x: 118, y: 75 }, 'no composite aperture geometry', 'note', 'start', { viewLocalProxyComposition: 'FORBIDDEN' }),
    text('composition-note', { x: 118, y: 86 }, 'editorial paper fit · NTS', 'note', 'start', { scale: 'NTS' })
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: view.id,
    title: 'Reference House sectional axonometric',
    description: 'NTS parallel sectional synthesis cut at the controlled south courtyard edge. Controlled shell, courtyard and level order are shown with bounded service geography; complete aperture geometry, construction-layer thicknesses, exact roof fall surfaces and packed MEP geometry remain absent.',
    scaleDenominator: 'NTS',
    sourceId: view.id,
    primitives
  }
}
