import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import type { ModelRect } from '../publication-drawing/projection.js'
import type { DerivedBoundary, DerivedOpening, ReferenceHouseCompileResult } from './model.js'
import type {
  FirstFloorExteriorOpeningSource,
  FirstFloorInternalOpeningSource,
  FirstFloorPublicationPlanSource
} from './publication-first-floor-plan-source.js'
import type { GroundFloorPublicationPlanSource } from './publication-plan-source.js'

const SCALE = 100
const SCENE_WIDTH_MM = 136
const SCENE_HEIGHT_MM = 145
const PLAN_ORIGIN: PaperPoint = { x: 8, y: 12 }

export type SharedPlanRepresentationSource = Pick<
  GroundFloorPublicationPlanSource,
  'wallRepresentation' | 'stair'
>

const close = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6

const rectPrimitive = (
  id: string,
  rect: { x: number; y: number; width: number; height: number },
  fill: DrawingRect['fill'],
  metadata: DrawingRect['metadata'] = {}
): DrawingRect => ({ kind: 'rect', id, ...rect, fill, metadata })

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
  anchor: DrawingText['anchor'] = 'middle',
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

const internalWallBody = (
  boundary: DerivedBoundary,
  externalCourtThickness: number,
  internalThickness: number,
  result: ReferenceHouseCompileResult
): ModelRect => {
  const xMin = Math.min(boundary.x1, boundary.x2)
  const xMax = Math.max(boundary.x1, boundary.x2)
  const yMin = Math.min(boundary.y1, boundary.y2)
  const yMax = Math.max(boundary.y1, boundary.y2)
  const courtFrameX0 = result.derived.court.x0 - externalCourtThickness
  const courtFrameX1 = result.derived.court.x1 + externalCourtThickness
  const courtFrameY0 = result.derived.court.y0 - externalCourtThickness
  const courtFrameY1 = result.derived.court.y1 + externalCourtThickness

  if (boundary.orientation === 'vertical') {
    let from = yMin
    let to = yMax
    const x = boundary.x1

    if (close(from, 0)) from += externalCourtThickness
    if (close(to, result.derived.shell.depth)) to -= externalCourtThickness
    if (close(from, result.derived.court.y1) && x >= courtFrameX0 && x <= courtFrameX1) {
      from += externalCourtThickness
    }
    if (close(to, result.derived.court.y0) && x >= courtFrameX0 && x <= courtFrameX1) {
      to -= externalCourtThickness
    }

    if (to <= from) throw new Error(`Internal wall ${boundary.id} is consumed by permanent-wall junctions.`)
    return { x: x - internalThickness / 2, y: from, width: internalThickness, height: to - from }
  }

  let from = xMin
  let to = xMax
  const y = boundary.y1

  if (close(from, 0)) from += externalCourtThickness
  if (close(to, result.derived.shell.width)) to -= externalCourtThickness
  if (close(from, result.derived.court.x1) && y >= courtFrameY0 && y <= courtFrameY1) {
    from += externalCourtThickness
  }
  if (close(to, result.derived.court.x0) && y >= courtFrameY0 && y <= courtFrameY1) {
    to -= externalCourtThickness
  }

  if (to <= from) throw new Error(`Internal wall ${boundary.id} is consumed by permanent-wall junctions.`)
  return { x: from, y: y - internalThickness / 2, width: to - from, height: internalThickness }
}

const wallBody = (
  boundary: DerivedBoundary,
  externalCourtThickness: number,
  internalThickness: number,
  result: ReferenceHouseCompileResult
): ModelRect => {
  const xMin = Math.min(boundary.x1, boundary.x2)
  const xMax = Math.max(boundary.x1, boundary.x2)
  const yMin = Math.min(boundary.y1, boundary.y2)
  const yMax = Math.max(boundary.y1, boundary.y2)

  if (boundary.kind === 'internal-planning') {
    return internalWallBody(boundary, externalCourtThickness, internalThickness, result)
  }

  const thickness = externalCourtThickness
  if (boundary.kind === 'outer') {
    if (boundary.orientation === 'vertical') {
      const isWest = close(boundary.x1, 0)
      return {
        x: isWest ? 0 : boundary.x1 - thickness,
        y: yMin,
        width: thickness,
        height: yMax - yMin
      }
    }
    const isSouth = close(boundary.y1, 0)
    return {
      x: xMin,
      y: isSouth ? 0 : boundary.y1 - thickness,
      width: xMax - xMin,
      height: thickness
    }
  }

  if (boundary.kind === 'courtyard') {
    if (boundary.orientation === 'vertical') {
      const isWest = close(boundary.x1, result.derived.court.x0)
      return {
        x: isWest ? boundary.x1 - thickness : boundary.x1,
        y: yMin - thickness,
        width: thickness,
        height: yMax - yMin + thickness * 2
      }
    }
    const isSouth = close(boundary.y1, result.derived.court.y0)
    return {
      x: xMin - thickness,
      y: isSouth ? boundary.y1 - thickness : boundary.y1,
      width: xMax - xMin + thickness * 2,
      height: thickness
    }
  }

  throw new Error(`Unsupported first-floor plan boundary kind: ${boundary.kind}`)
}

interface OpeningSpec {
  id: string
  hostBoundaryId: string
  role: 'window' | 'major-opening' | 'door-aperture-no-leaf'
  centre: number
  width: number
  provisional: boolean
  widthAuthority: string
}

const derivedOpeningWidth = (opening: DerivedOpening): { width: number; authority: string } => {
  if (opening.width.kind === 'approximate' && opening.width.value !== undefined) {
    return { width: opening.width.value, authority: 'approximate' }
  }
  if (opening.width.kind === 'range' && opening.width.max !== undefined) {
    return { width: opening.width.max, authority: 'range-max-cut' }
  }
  throw new Error(`Publication first-floor plan requires a drawable width for ${opening.id}.`)
}

const canonicalFrontOpenings = (result: ReferenceHouseCompileResult): OpeningSpec[] =>
  result.derived.openings
    .filter((opening) => opening.levelId === 'FIRST' && opening.hostBoundaryId === 'U-OUTER-SOUTH')
    .map((opening) => {
      if (opening.centre === undefined) throw new Error(`Upper front opening ${opening.id} has no centre.`)
      const width = derivedOpeningWidth(opening)
      if (opening.role !== 'window') {
        throw new Error(`Upper front opening ${opening.id} must remain a window.`)
      }
      return {
        id: opening.id,
        hostBoundaryId: opening.hostBoundaryId,
        role: 'window',
        centre: opening.centre,
        width: width.width,
        provisional: opening.provisional,
        widthAuthority: width.authority
      }
    })

const publicationExteriorOpening = (opening: FirstFloorExteriorOpeningSource): OpeningSpec => ({
  id: opening.id,
  hostBoundaryId: opening.hostBoundaryId,
  role: opening.role,
  centre: opening.centreCoordinate.value,
  width: opening.width.value,
  provisional: true,
  widthAuthority: 'approximate'
})

const publicationInternalOpening = (opening: FirstFloorInternalOpeningSource): OpeningSpec => ({
  id: opening.id,
  hostBoundaryId: opening.hostBoundaryId,
  role: opening.treatment,
  centre: opening.centreCoordinate.value,
  width: opening.width.value,
  provisional: true,
  widthAuthority: 'approximate'
})

const openingCutBox = (
  wall: ModelRect,
  host: DerivedBoundary,
  centre: number,
  width: number
): ModelRect =>
  host.orientation === 'horizontal'
    ? { x: centre - width / 2, y: wall.y, width, height: wall.height }
    : { x: wall.x, y: centre - width / 2, width: wall.width, height: width }

const openingFrameLine = (
  opening: OpeningSpec,
  wall: ModelRect,
  host: DerivedBoundary,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingLine | undefined => {
  if (opening.role !== 'window') return undefined
  const half = opening.width / 2
  if (host.orientation === 'horizontal') {
    const y = wall.y + wall.height / 2
    return linePrimitive(
      `frame-${opening.id}`,
      project.point(opening.centre - half, y),
      project.point(opening.centre + half, y),
      'primary',
      { source: opening.id, provisional: opening.provisional }
    )
  }
  const x = wall.x + wall.width / 2
  return linePrimitive(
    `frame-${opening.id}`,
    project.point(x, opening.centre - half),
    project.point(x, opening.centre + half),
    'primary',
    { source: opening.id, provisional: opening.provisional }
  )
}

const dimensionTick = (id: string, point: PaperPoint): DrawingLine =>
  linePrimitive(
    id,
    { x: point.x - 0.9, y: point.y + 0.9 },
    { x: point.x + 0.9, y: point.y - 0.9 },
    'secondary'
  )

interface RoomLabelSpec {
  x: number
  y: number
  label: string
  anchor?: DrawingText['anchor']
  leader?: {
    from: { x: number; y: number }
    to: { x: number; y: number }
  }
}

const roomLabelPositions: Record<string, RoomLabelSpec> = {
  'U-BED-02': { x: 2000, y: 2500, label: 'Bedroom 2' },
  'U-BED-P01': { x: 2000, y: 7800, label: 'Principal bedroom' },
  'U-STAIR-01': { x: 7100, y: 1400, label: 'South landing' },
  'U-BED-03': { x: 10400, y: 1400, label: 'Bedroom 3' },
  'U-GAL-02': {
    x: 7550,
    y: 5400,
    label: 'East gallery',
    anchor: 'end',
    leader: {
      from: { x: 7650, y: 5400 },
      to: { x: 8450, y: 5400 }
    }
  },
  'U-BATH-01': { x: 10550, y: 5400, label: 'Family bathroom' },
  'U-BED-04': { x: 10350, y: 9600, label: 'Bedroom 4' },
  'U-LAND-N01': { x: 7600, y: 8000, label: 'North landing' },
  'U-DRESS-01': { x: 5250, y: 9750, label: 'Dressing / storage' },
  'U-LIN-01': { x: 7100, y: 9750, label: 'Linen' }
}

const stairPrimitives = (
  source: SharedPlanRepresentationSource,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingPrimitive[] => {
  const r = source.stair.reservation.value
  const projected = project.rect({ x: r.x0, y: r.y0, width: r.width, height: r.depth })
  const lower = project.point(r.x0 + 500, r.y0 + 350)
  const westTurn = project.point(r.x0 + 500, r.y0 + 1950)
  const eastTurn = project.point(r.x0 + 2000, r.y0 + 1950)
  const upperArrival = project.point(r.x0 + 2000, r.y0 + 350)
  const arrowTip = lower

  return [
    {
      kind: 'rect',
      id: 'stair-reservation',
      ...projected,
      stroke: 'secondary',
      dash: 'provisional',
      metadata: { provisional: true, source: source.stair.id }
    },
    linePrimitive('stair-down-trace-1', upperArrival, eastTurn, 'primary', { provisional: true }),
    linePrimitive('stair-down-trace-2', eastTurn, westTurn, 'primary', { provisional: true }),
    linePrimitive('stair-down-trace-3', westTurn, lower, 'primary', { provisional: true }),
    linePrimitive(
      'stair-down-arrow-left',
      arrowTip,
      { x: arrowTip.x - 1.5, y: arrowTip.y + 2.2 },
      'primary',
      { provisional: true }
    ),
    linePrimitive(
      'stair-down-arrow-right',
      arrowTip,
      { x: arrowTip.x + 1.5, y: arrowTip.y + 2.2 },
      'primary',
      { provisional: true }
    ),
    textPrimitive(
      'stair-down',
      { x: upperArrival.x + 2, y: upperArrival.y - 2 },
      'DN',
      'marker',
      'start',
      { provisional: true }
    )
  ]
}

const dimensionPrimitives = (
  result: ReferenceHouseCompileResult,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingPrimitive[] => {
  const topLeft = project.point(0, result.derived.shell.depth)
  const topRight = project.point(result.derived.shell.width, result.derived.shell.depth)
  const bottomLeft = project.point(0, 0)
  const widthY = 5.5
  const depthX = 3.5
  const widthA = { x: topLeft.x, y: widthY }
  const widthB = { x: topRight.x, y: widthY }
  const depthA = { x: depthX, y: topLeft.y }
  const depthB = { x: depthX, y: bottomLeft.y }

  return [
    linePrimitive('dim-width', widthA, widthB, 'secondary'),
    linePrimitive('dim-width-ext-left', { x: topLeft.x, y: 8 }, topLeft, 'secondary'),
    linePrimitive('dim-width-ext-right', { x: topRight.x, y: 8 }, topRight, 'secondary'),
    dimensionTick('dim-width-tick-left', widthA),
    dimensionTick('dim-width-tick-right', widthB),
    textPrimitive(
      'dim-width-text',
      { x: (widthA.x + widthB.x) / 2, y: 4.2 },
      String(result.derived.shell.width),
      'note'
    ),
    linePrimitive('dim-depth', depthA, depthB, 'secondary'),
    linePrimitive(
      'dim-depth-ext-top',
      { x: depthX, y: topLeft.y },
      { x: topLeft.x - 1, y: topLeft.y },
      'secondary'
    ),
    linePrimitive(
      'dim-depth-ext-bottom',
      { x: depthX, y: bottomLeft.y },
      { x: bottomLeft.x - 1, y: bottomLeft.y },
      'secondary'
    ),
    dimensionTick('dim-depth-tick-top', depthA),
    dimensionTick('dim-depth-tick-bottom', depthB),
    textPrimitive(
      'dim-depth-text',
      { x: 2.2, y: (depthA.y + depthB.y) / 2 },
      String(result.derived.shell.depth),
      'note',
      'middle',
      {},
      -90
    )
  ]
}

const scaleBarPrimitives = (): DrawingPrimitive[] => {
  const x0 = 98
  const y = 136
  const length = 30
  const parts: DrawingPrimitive[] = [
    linePrimitive('scale-bar', { x: x0, y }, { x: x0 + length, y }, 'primary')
  ]
  for (let index = 0; index <= 3; index += 1) {
    const x = x0 + index * 10
    parts.push(
      linePrimitive(`scale-tick-${index}`, { x, y: y - 2 }, { x, y: y + 2 }, 'secondary')
    )
  }
  parts.push(
    textPrimitive('scale-zero', { x: x0, y: y + 5 }, '0', 'note', 'start'),
    textPrimitive('scale-three', { x: x0 + length, y: y + 5 }, '3 m', 'note', 'end')
  )
  return parts
}

export const createFirstFloorPublicationPlanScene = (
  result: ReferenceHouseCompileResult,
  source: FirstFloorPublicationPlanSource,
  shared: SharedPlanRepresentationSource
): DrawingScene => {
  if (result.status === 'FAIL') {
    throw new Error('Cannot create first-floor publication plan scene from a failed Reference House compile.')
  }

  const project = createPlanPaperProjection({
    scaleDenominator: SCALE,
    modelBounds: {
      x: 0,
      y: 0,
      width: result.derived.shell.width,
      height: result.derived.shell.depth
    },
    paperOrigin: PLAN_ORIGIN
  })
  const firstBoundaries = result.derived.boundaries.filter(
    (boundary) => boundary.levelId === 'FIRST'
  )
  const boundaryById = new Map(firstBoundaries.map((boundary) => [boundary.id, boundary]))
  const externalCourtThickness = shared.wallRepresentation.externalCourtBodyProxy.value
  const internalThickness = shared.wallRepresentation.internalBodyProxy.value
  const bodyByBoundary = new Map<string, ModelRect>()
  const primitives: DrawingPrimitive[] = []

  for (const boundary of firstBoundaries) {
    const body = wallBody(boundary, externalCourtThickness, internalThickness, result)
    bodyByBoundary.set(boundary.id, body)
    primitives.push(
      rectPrimitive(`wall-${boundary.id}`, project.rect(body), 'ink', {
        source: boundary.id,
        provisional:
          boundary.provisional ||
          shared.wallRepresentation.externalCourtBodyProxy.authority === 'PROVISIONAL'
      })
    )
  }

  const openingSpecs: OpeningSpec[] = [
    ...canonicalFrontOpenings(result),
    ...source.internalOpenings.map(publicationInternalOpening),
    ...source.courtyardOpenings.map(publicationExteriorOpening),
    ...source.gardenOpenings.map(publicationExteriorOpening)
  ]

  for (const opening of openingSpecs) {
    const host = boundaryById.get(opening.hostBoundaryId)
    const body = bodyByBoundary.get(opening.hostBoundaryId)
    if (!host || !body) {
      throw new Error(
        `First-floor opening ${opening.id} references unavailable host ${opening.hostBoundaryId}.`
      )
    }
    const cut = openingCutBox(body, host, opening.centre, opening.width)
    primitives.push(
      rectPrimitive(`opening-${opening.id}`, project.rect(cut), 'paper', {
        source: opening.id,
        host: opening.hostBoundaryId,
        provisional: opening.provisional,
        widthAuthority: opening.widthAuthority,
        treatment: opening.role
      })
    )
    const frame = openingFrameLine(opening, body, host, project)
    if (frame) primitives.push(frame)
  }

  primitives.push(...stairPrimitives(shared, project))

  for (const [spaceId, label] of Object.entries(roomLabelPositions)) {
    const space = result.derived.spaces.find(
      (candidate) => candidate.levelId === 'FIRST' && candidate.id === spaceId
    )
    if (!space) throw new Error(`First-floor label refers to missing space ${spaceId}.`)
    if (label.leader) {
      primitives.push(
        linePrimitive(
          `label-leader-${spaceId}`,
          project.point(label.leader.from.x, label.leader.from.y),
          project.point(label.leader.to.x, label.leader.to.y),
          'secondary',
          { space: spaceId, provisional: space.provisional }
        )
      )
    }
    primitives.push(
      textPrimitive(
        `label-${spaceId}`,
        project.point(label.x, label.y),
        label.label,
        'label',
        label.anchor ?? 'middle',
        { space: spaceId, provisional: space.provisional }
      )
    )
  }

  const courtCentre = project.point(result.derived.shell.centreX, result.derived.shell.centreY)
  primitives.push(
    textPrimitive(
      'label-courtyard',
      { x: courtCentre.x, y: courtCentre.y - 1.4 },
      'Courtyard',
      'label'
    ),
    textPrimitive(
      'dim-courtyard',
      { x: courtCentre.x, y: courtCentre.y + 2.5 },
      `${result.derived.court.width} × ${result.derived.court.depth}`,
      'note'
    ),
    textPrimitive('label-garden', { x: PLAN_ORIGIN.x + 60, y: 10 }, 'Garden', 'note'),
    textPrimitive(
      'label-front',
      { x: PLAN_ORIGIN.x + 60, y: 126 },
      'Front / street surrogate',
      'note'
    )
  )

  primitives.push(...dimensionPrimitives(result, project), ...scaleBarPrimitives())
  primitives.push(
    textPrimitive(
      'approx-note',
      { x: 8, y: 141 },
      'Approx. planning wall bodies, apertures, openings and stair.',
      'note',
      'start'
    )
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: 'REFERENCE-HOUSE-FIRST-FLOOR-PLAN',
    title: 'Reference House first-floor plan',
    description:
      'Architectural planning projection at 1:100. Approximate wall bodies, apertures, openings and stair are bounded planning geometry, not construction information.',
    scaleDenominator: SCALE,
    sourceId: result.fixtureId,
    primitives
  }
}
