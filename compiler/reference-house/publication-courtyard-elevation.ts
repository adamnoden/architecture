import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createElevationPaperProjection } from '../publication-drawing/projection.js'
import type {
  CourtyardElevationPublicationSource,
  CourtyardFaceSource
} from './publication-courtyard-elevation-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 160
const ELEVATION_TOP_MM = 6500
const FACE_ORIGINS = { SOUTH: 7, NORTH: 87 } as const

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

const faceById = (
  source: CourtyardElevationPublicationSource,
  id: 'SOUTH' | 'NORTH'
): CourtyardFaceSource => {
  const face = source.faces.find((candidate) => candidate.id === id)
  if (!face) throw new Error(`Courtyard publication scene requires ${id} face.`)
  if (face.axisCoordinates === 'ABSENT' || face.axisCoordinates.length !== 1) {
    throw new Error(`Courtyard ${id} face requires one source-owned centred axis.`)
  }
  if (face.apertureGeometry !== 'ABSENT') {
    throw new Error(`Courtyard ${id} face must not acquire aperture geometry in DRW-08D.`)
  }
  return face
}

const facePrimitives = (
  source: CourtyardElevationPublicationSource,
  id: 'SOUTH' | 'NORTH'
): DrawingPrimitive[] => {
  const face = faceById(source, id)
  const originX = FACE_ORIGINS[id]
  const project = createElevationPaperProjection({
    scaleDenominator: source.view.value.scale,
    horizontalBounds: { min: 0, max: face.width },
    verticalBounds: { min: 0, max: ELEVATION_TOP_MM },
    paperOrigin: { x: originX, y: 8 }
  })
  const z0 = source.levels.groundFfl.value
  const zCornice = source.levels.corniceControl.value
  const axis = face.axisCoordinates[0]
  const envelopeMeta = {
    face: id,
    widthAuthority: face.widthAuthority,
    topAuthority: source.levels.corniceControl.authority,
    courtyardGrade: 'ABSENT',
    apertureGeometry: 'ABSENT'
  }
  const axisMeta = {
    face: id,
    authority: face.axisAuthority,
    role: 'opening-occurrence-axis-not-aperture',
    apertureGeometry: 'ABSENT'
  }
  const primitives: DrawingPrimitive[] = [
    text(`${id}-title`, { x: originX, y: 5 }, id === 'SOUTH' ? 'South court face · arrival / stair' : 'North court face · garden / landing', 'label'),
    line(`${id}-left`, project.point(0, z0), project.point(0, zCornice), 'profile', envelopeMeta, 'provisional'),
    line(`${id}-right`, project.point(face.width, z0), project.point(face.width, zCornice), 'profile', envelopeMeta, 'provisional'),
    line(`${id}-cornice`, project.point(0, zCornice), project.point(face.width, zCornice), 'secondary', envelopeMeta, 'provisional'),
    line(`${id}-gffl-termination`, project.point(0, z0), project.point(face.width, z0), 'profile', {
      face: id,
      authority: source.levels.groundFfl.authority,
      treatment: 'drawing-termination-not-courtyard-grade'
    }),
    line(`${id}-axis`, project.point(axis, 250), project.point(axis, 6100), 'secondary', axisMeta, 'datum')
  ]

  const firstY = project.point(0, source.levels.firstFfl.value).y
  primitives.push(
    line(`${id}-first-datum-left`, { x: originX - 2.5, y: firstY }, { x: originX + 2.5, y: firstY }, 'secondary', {
      elevation: source.levels.firstFfl.value,
      visibleFacadeGeometry: false,
      authority: source.levels.firstFfl.authority
    }, 'datum'),
    text(`${id}-ground-occurrence`, project.point(axis, 1450), 'G · opening occurrence', 'marker', 'middle', {
      ...axisMeta,
      occurrenceId: face.groundOccurrenceIds[0]
    }),
    text(`${id}-upper-occurrence`, project.point(axis, 4550), 'U · opening occurrence', 'marker', 'middle', {
      ...axisMeta,
      occurrenceId: face.firstOccurrenceIds[0]
    }),
    text(`${id}-extent-note`, { x: originX + face.width / source.view.value.scale / 2, y: 140 }, 'aperture extents absent', 'note', 'middle')
  )

  return primitives
}

const scaleBar = (): DrawingPrimitive[] => {
  const x0 = 7
  const y = 154
  return [
    line('scale-bar', { x: x0, y }, { x: x0 + 20, y }, 'primary'),
    ...Array.from({ length: 3 }, (_, index) =>
      line(`scale-tick-${index}`, { x: x0 + index * 10, y: y - 1.5 }, { x: x0 + index * 10, y: y + 1.5 }, 'secondary')
    ),
    text('scale-zero', { x: x0, y: 159 }, '0', 'note'),
    text('scale-two', { x: x0 + 20, y: 159 }, '1 m', 'note', 'end')
  ]
}

export const createCourtyardElevationPublicationScene = (
  source: CourtyardElevationPublicationSource
): DrawingScene => {
  if (source.view.value.scale !== 50) throw new Error('Courtyard publication plate is frozen at true 1:50.')
  if (source.commonOrder.value.principalFacadeGridInherited) {
    throw new Error('Courtyard publication plate may not inherit the principal facade grid.')
  }
  const east = source.faces.find((face) => face.id === 'EAST')
  const west = source.faces.find((face) => face.id === 'WEST')
  if (!east || !west || east.axisCoordinates !== 'ABSENT' || west.axisCoordinates !== 'ABSENT') {
    throw new Error('Courtyard east/west numeric axes must remain absent in DRW-08D.')
  }

  const primitives: DrawingPrimitive[] = [
    ...facePrimitives(source, 'SOUTH'),
    ...facePrimitives(source, 'NORTH'),
    text('common-first-datum', { x: 82, y: 76 }, 'First FFL +3.300', 'note', 'middle', {
      authority: source.levels.firstFfl.authority,
      visibleFacadeGeometry: false
    }),
    text('east-order-note', { x: 35, y: 146 }, 'East · two-bay gallery order · numeric axes absent', 'note', 'middle', {
      authority: east.order.authority,
      geometry: 'ABSENT'
    }),
    text('west-order-note', { x: 124, y: 146 }, 'West · two room-owned axes · numeric positions absent', 'note', 'middle', {
      authority: west.order.authority,
      geometry: 'ABSENT'
    }),
    ...scaleBar()
  ]

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House courtyard architectural elevations',
    description: 'Opposed south and north courtyard faces at true 1:50. Exact court width, shared datums and centred opening-occurrence axes are shown without inventing aperture extents. East/west two-axis relationships remain qualitative because their numeric centres are absent.',
    scaleDenominator: source.view.value.scale,
    sourceId: source.view.value.id,
    primitives
  }
}
