import type { DrawingLine, DrawingPrimitive, DrawingRect, DrawingScene, DrawingText, PaperPoint } from '../publication-drawing/model.js'
import { createPlanPaperProjection } from '../publication-drawing/projection.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  DerivedSpace,
  ReferenceHouseCompileResult,
  ReferenceHouseSource
} from './model.js'

const SCALE = 100
const SCENE_WIDTH_MM = 148
const SCENE_HEIGHT_MM = 150
const PLAN_ORIGIN: PaperPoint = { x: 14, y: 18 }
const EPSILON = 0.001

interface ModelRect {
  x: number
  y: number
  width: number
  height: number
}

interface ModelSegment {
  x1: number
  y1: number
  x2: number
  y2: number
}

const near = (a: number, b: number): boolean => Math.abs(a - b) <= EPSILON

const linePrimitive = (
  id: string,
  a: PaperPoint,
  b: PaperPoint,
  role: DrawingLine['role'],
  metadata: DrawingLine['metadata'] = {},
  dash?: DrawingLine['dash']
): DrawingLine => ({ kind: 'line', id, a, b, role, metadata, dash })

const rectPrimitive = (
  id: string,
  rect: { x: number; y: number; width: number; height: number },
  fill: DrawingRect['fill'],
  metadata: DrawingRect['metadata'] = {}
): DrawingRect => ({ kind: 'rect', id, ...rect, fill, metadata })

const textPrimitive = (
  id: string,
  point: PaperPoint,
  value: string,
  role: DrawingText['role'],
  anchor: DrawingText['anchor'] = 'middle',
  metadata: DrawingText['metadata'] = {},
  rotateDeg?: number
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata, rotateDeg })

const boundarySegment = (boundary: DerivedBoundary): ModelSegment => ({
  x1: boundary.x1,
  y1: boundary.y1,
  x2: boundary.x2,
  y2: boundary.y2
})

const wallMinimumBody = (
  boundary: DerivedBoundary,
  result: ReferenceHouseCompileResult
): ModelRect | undefined => {
  if (boundary.kind === 'internal-planning') return undefined

  const d = result.derived
  const thickness = d.wallPlanning.normalRange.min
  const minX = Math.min(boundary.x1, boundary.x2)
  const maxX = Math.max(boundary.x1, boundary.x2)
  const minY = Math.min(boundary.y1, boundary.y2)
  const maxY = Math.max(boundary.y1, boundary.y2)

  if (boundary.kind === 'outer') {
    if (boundary.orientation === 'horizontal') {
      if (near(boundary.y1, 0)) return { x: minX, y: 0, width: maxX - minX, height: thickness }
      if (near(boundary.y1, d.shell.depth)) {
        return { x: minX, y: d.shell.depth - thickness, width: maxX - minX, height: thickness }
      }
    } else {
      if (near(boundary.x1, 0)) return { x: 0, y: minY, width: thickness, height: maxY - minY }
      if (near(boundary.x1, d.shell.width)) {
        return { x: d.shell.width - thickness, y: minY, width: thickness, height: maxY - minY }
      }
    }
  }

  if (boundary.kind === 'courtyard') {
    if (boundary.orientation === 'horizontal') {
      if (near(boundary.y1, d.court.y0)) {
        return { x: minX, y: d.court.y0 - thickness, width: maxX - minX, height: thickness }
      }
      if (near(boundary.y1, d.court.y1)) {
        return { x: minX, y: d.court.y1, width: maxX - minX, height: thickness }
      }
    } else {
      if (near(boundary.x1, d.court.x0)) {
        return { x: d.court.x0 - thickness, y: minY, width: thickness, height: maxY - minY }
      }
      if (near(boundary.x1, d.court.x1)) {
        return { x: d.court.x1, y: minY, width: thickness, height: maxY - minY }
      }
    }
  }

  throw new Error(`PLT-03A cannot derive minimum planning body for ${boundary.id}.`)
}

const openingCut = (
  body: ModelRect,
  host: DerivedBoundary,
  centre: number,
  width: number
): ModelRect =>
  host.orientation === 'horizontal'
    ? { x: centre - width / 2, y: body.y, width, height: body.height }
    : { x: body.x, y: centre - width / 2, width: body.width, height: width }

const jambSegment = (
  body: ModelRect,
  host: DerivedBoundary,
  coordinate: number
): ModelSegment =>
  host.orientation === 'horizontal'
    ? { x1: coordinate, y1: body.y, x2: coordinate, y2: body.y + body.height }
    : { x1: body.x, y1: coordinate, x2: body.x + body.width, y2: coordinate }

const projectSegment = (
  project: ReturnType<typeof createPlanPaperProjection>,
  segment: ModelSegment
): [PaperPoint, PaperPoint] => [project.point(segment.x1, segment.y1), project.point(segment.x2, segment.y2)]

const openingPrimitives = (
  opening: DerivedOpening,
  host: DerivedBoundary,
  body: ModelRect,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingPrimitive[] => {
  if (opening.centre === undefined) return []

  const metadata = {
    authorityClass: 'A',
    source: opening.id,
    host: opening.hostBoundaryId,
    precision: opening.width.kind,
    provisional: opening.provisional
  }

  if (opening.width.kind === 'unknown') {
    const segment = jambSegment(body, host, opening.centre)
    const [a, b] = projectSegment(project, segment)
    return [linePrimitive(`plt03-opening-centre-${opening.id}`, a, b, 'primary', metadata, 'provisional')]
  }

  const maxWidth = opening.width.kind === 'approximate' ? opening.width.value : opening.width.max
  if (maxWidth === undefined) throw new Error(`PLT-03A opening ${opening.id} has no usable maximum width.`)
  const cut = openingCut(body, host, opening.centre, maxWidth)
  const primitives: DrawingPrimitive[] = [
    rectPrimitive(`plt03-opening-cut-${opening.id}`, project.rect(cut), 'paper', metadata)
  ]

  const maxCoordinates = [opening.centre - maxWidth / 2, opening.centre + maxWidth / 2]
  for (const [index, coordinate] of maxCoordinates.entries()) {
    const [a, b] = projectSegment(project, jambSegment(body, host, coordinate))
    primitives.push(
      linePrimitive(
        `plt03-opening-max-${opening.id}-${index + 1}`,
        a,
        b,
        opening.width.kind === 'range' ? 'secondary' : 'profile',
        metadata,
        'provisional'
      )
    )
  }

  if (opening.width.kind === 'range') {
    if (opening.width.min === undefined) throw new Error(`PLT-03A opening ${opening.id} range has no minimum width.`)
    const minCoordinates = [opening.centre - opening.width.min / 2, opening.centre + opening.width.min / 2]
    for (const [index, coordinate] of minCoordinates.entries()) {
      const [a, b] = projectSegment(project, jambSegment(body, host, coordinate))
      primitives.push(
        linePrimitive(`plt03-opening-min-${opening.id}-${index + 1}`, a, b, 'profile', metadata, 'provisional')
      )
    }
  }

  return primitives
}

const overlap = (a0: number, a1: number, b0: number, b1: number): [number, number] | undefined => {
  const start = Math.max(a0, b0)
  const end = Math.min(a1, b1)
  return end - start > EPSILON ? [start, end] : undefined
}

const sharedEdges = (a: DerivedSpace, b: DerivedSpace): ModelSegment[] => {
  const segments: ModelSegment[] = []
  const seen = new Set<string>()

  for (const boxA of a.boxes) {
    for (const boxB of b.boxes) {
      const aRight = boxA.x + boxA.width
      const bRight = boxB.x + boxB.width
      const aTop = boxA.y + boxA.height
      const bTop = boxB.y + boxB.height

      if (near(aRight, boxB.x) || near(bRight, boxA.x)) {
        const range = overlap(boxA.y, aTop, boxB.y, bTop)
        if (range) {
          const x = near(aRight, boxB.x) ? aRight : bRight
          const segment = { x1: x, y1: range[0], x2: x, y2: range[1] }
          const key = `${segment.x1}:${segment.y1}:${segment.x2}:${segment.y2}`
          if (!seen.has(key)) {
            seen.add(key)
            segments.push(segment)
          }
        }
      }

      if (near(aTop, boxB.y) || near(bTop, boxA.y)) {
        const range = overlap(boxA.x, aRight, boxB.x, bRight)
        if (range) {
          const y = near(aTop, boxB.y) ? aTop : bTop
          const segment = { x1: range[0], y1: y, x2: range[1], y2: y }
          const key = `${segment.x1}:${segment.y1}:${segment.x2}:${segment.y2}`
          if (!seen.has(key)) {
            seen.add(key)
            segments.push(segment)
          }
        }
      }
    }
  }

  return segments
}

const labelText: Record<string, string> = {
  'G-DRAW-02': 'Drawing room',
  'G-FAM-02': 'Family room',
  'G-GAL-01': 'Gallery',
  'G-GARDEN-02': 'Garden dining',
  'G-HALL-02': 'Hall / stair',
  'G-KIT-02': 'Kitchen',
  'G-STUDY-02': 'Study',
  'G-SVC-02': 'Service suite'
}

const dimensionTick = (id: string, point: PaperPoint): DrawingLine =>
  linePrimitive(
    id,
    { x: point.x - 0.8, y: point.y + 0.8 },
    { x: point.x + 0.8, y: point.y - 0.8 },
    'secondary',
    { authorityClass: 'B', representation: 'dimension-tick' }
  )

const dimensionAndScalePrimitives = (
  result: ReferenceHouseCompileResult,
  project: ReturnType<typeof createPlanPaperProjection>
): DrawingPrimitive[] => {
  const d = result.derived
  const topLeft = project.point(0, d.shell.depth)
  const topRight = project.point(d.shell.width, d.shell.depth)
  const bottomLeft = project.point(0, 0)
  const widthY = 9.5
  const depthX = 7.5
  const widthA = { x: topLeft.x, y: widthY }
  const widthB = { x: topRight.x, y: widthY }
  const depthA = { x: depthX, y: topLeft.y }
  const depthB = { x: depthX, y: bottomLeft.y }
  const scaleX = 104
  const scaleY = 144

  const primitives: DrawingPrimitive[] = [
    linePrimitive('plt03-dim-width', widthA, widthB, 'secondary', { authorityClass: 'B', source: 'shell.width' }),
    linePrimitive('plt03-dim-width-ext-left', { x: topLeft.x, y: 12 }, topLeft, 'secondary', { authorityClass: 'B' }),
    linePrimitive('plt03-dim-width-ext-right', { x: topRight.x, y: 12 }, topRight, 'secondary', { authorityClass: 'B' }),
    dimensionTick('plt03-dim-width-tick-left', widthA),
    dimensionTick('plt03-dim-width-tick-right', widthB),
    textPrimitive('plt03-dim-width-text', { x: (widthA.x + widthB.x) / 2, y: 8 }, String(d.shell.width), 'note', 'middle', { authorityClass: 'A', source: 'shell.width' }),
    linePrimitive('plt03-dim-depth', depthA, depthB, 'secondary', { authorityClass: 'B', source: 'shell.depth' }),
    linePrimitive('plt03-dim-depth-ext-top', { x: depthX, y: topLeft.y }, { x: topLeft.x - 1, y: topLeft.y }, 'secondary', { authorityClass: 'B' }),
    linePrimitive('plt03-dim-depth-ext-bottom', { x: depthX, y: bottomLeft.y }, { x: bottomLeft.x - 1, y: bottomLeft.y }, 'secondary', { authorityClass: 'B' }),
    dimensionTick('plt03-dim-depth-tick-top', depthA),
    dimensionTick('plt03-dim-depth-tick-bottom', depthB),
    textPrimitive('plt03-dim-depth-text', { x: 6.1, y: (depthA.y + depthB.y) / 2 }, String(d.shell.depth), 'note', 'middle', { authorityClass: 'A', source: 'shell.depth' }, -90),
    linePrimitive('plt03-scale-bar', { x: scaleX, y: scaleY }, { x: scaleX + 30, y: scaleY }, 'primary', { authorityClass: 'B', scale: '1:100' })
  ]

  for (let index = 0; index <= 3; index += 1) {
    const x = scaleX + index * 10
    primitives.push(linePrimitive(`plt03-scale-tick-${index}`, { x, y: scaleY - 1.6 }, { x, y: scaleY + 1.6 }, 'secondary', { authorityClass: 'B' }))
  }
  primitives.push(
    textPrimitive('plt03-scale-zero', { x: scaleX, y: scaleY + 4.4 }, '0', 'note', 'start', { authorityClass: 'B' }),
    textPrimitive('plt03-scale-three', { x: scaleX + 30, y: scaleY + 4.4 }, '3 m', 'note', 'end', { authorityClass: 'B' })
  )

  return primitives
}

export const createPlt03CurrentGroundPlanScene = (
  result: ReferenceHouseCompileResult,
  source: ReferenceHouseSource
): DrawingScene => {
  if (result.status === 'FAIL') throw new Error('PLT-03A cannot build a current-authority plan from a failed Reference House compile.')

  const d = result.derived
  const project = createPlanPaperProjection({
    scaleDenominator: SCALE,
    modelBounds: { x: 0, y: 0, width: d.shell.width, height: d.shell.depth },
    paperOrigin: PLAN_ORIGIN
  })
  const boundaries = d.boundaries.filter((boundary) => boundary.levelId === 'GROUND')
  const boundaryById = new Map(boundaries.map((boundary) => [boundary.id, boundary]))
  const wallBodyByBoundary = new Map<string, ModelRect>()
  const primitives: DrawingPrimitive[] = []

  // A-class planning wall information only. Exterior/courtyard wall bodies use the
  // minimum extent of the controlled 400–425 mm planning range. Internal wall
  // thickness is deliberately not invented.
  for (const boundary of boundaries) {
    const body = wallMinimumBody(boundary, result)
    if (body) {
      wallBodyByBoundary.set(boundary.id, body)
      primitives.push(
        rectPrimitive(`plt03-wall-${boundary.id}`, project.rect(body), 'ink', {
          authorityClass: 'A',
          source: source.wallPlanning.normalRange.id,
          host: boundary.id,
          planningRange: `${d.wallPlanning.normalRange.min}-${d.wallPlanning.normalRange.max}`,
          representedExtent: 'range-minimum',
          constructionClaim: false
        })
      )
      continue
    }

    const segment = boundarySegment(boundary)
    const [a, b] = projectSegment(project, segment)
    primitives.push(
      linePrimitive(
        `plt03-boundary-${boundary.id}`,
        a,
        b,
        boundary.provisional ? 'secondary' : 'primary',
        {
          authorityClass: 'A',
          source: boundary.id,
          wallThickness: 'unresolved',
          provisional: boundary.provisional
        },
        boundary.provisional ? 'provisional' : undefined
      )
    )
  }

  // Only current numeric opening authority is admitted. No frame/reveal position
  // is drawn: the transverse lines below express aperture extent/uncertainty only.
  for (const opening of d.openings.filter((candidate) => candidate.levelId === 'GROUND')) {
    const host = boundaryById.get(opening.hostBoundaryId)
    const body = wallBodyByBoundary.get(opening.hostBoundaryId)
    if (!host || !body) {
      throw new Error(`PLT-03A current opening ${opening.id} has no representable planning wall host.`)
    }
    primitives.push(...openingPrimitives(opening, host, body, project))
  }

  // Qualitative façade/opening obligations remain host-wide. A full-host dashed
  // trace cannot be mistaken for an exact aperture position.
  for (const relationship of source.qualitativeOpeningRelationships.filter((item) => item.levelId === 'GROUND')) {
    const host = boundaryById.get(relationship.hostBoundaryId)
    if (!host) throw new Error(`PLT-03A qualitative opening ${relationship.id} has no host ${relationship.hostBoundaryId}.`)
    const [a, b] = projectSegment(project, boundarySegment(host))
    primitives.push(
      linePrimitive(
        `plt03-qualitative-opening-${relationship.id}`,
        a,
        b,
        'secondary',
        {
          authorityClass: 'A',
          source: relationship.id,
          geometry: 'host-wide-relationship',
          exactAperture: false
        },
        'provisional'
      )
    )
  }

  const groundSpaces = d.spaces.filter((space) => space.levelId === 'GROUND')
  const spaceById = new Map(groundSpaces.map((space) => [space.id, space]))

  // Required connectivity is drawn across every shared candidate edge. The edge,
  // not a midpoint, is the authored information; no door position or swing exists.
  for (const adjacency of source.requiredAdjacencies.filter((item) => item.levelId === 'GROUND')) {
    const aSpace = spaceById.get(adjacency.a)
    const bSpace = spaceById.get(adjacency.b)
    if (!aSpace || !bSpace) throw new Error(`PLT-03A adjacency ${adjacency.id} references unavailable ground spaces.`)
    const edges = sharedEdges(aSpace, bSpace)
    if (edges.length === 0) throw new Error(`PLT-03A adjacency ${adjacency.id} has no shared candidate edge.`)
    for (const [index, edge] of edges.entries()) {
      const [a, b] = projectSegment(project, edge)
      primitives.push(
        linePrimitive(
          `plt03-adjacency-${adjacency.id}-${index + 1}`,
          a,
          b,
          'secondary',
          {
            authorityClass: 'A',
            source: adjacency.id,
            geometry: 'shared-edge-obligation',
            exactDoorPosition: false
          },
          'provisional'
        )
      )
    }
  }

  for (const space of groundSpaces) {
    const centre = project.point(space.bounds.x + space.bounds.width / 2, space.bounds.y + space.bounds.height / 2)
    const isHall = space.id === 'G-HALL-02'
    primitives.push(
      textPrimitive(
        `plt03-label-${space.id}`,
        { x: centre.x, y: centre.y + (isHall ? -2.2 : 0) },
        labelText[space.id] ?? space.label,
        'label',
        'middle',
        { authorityClass: 'A', source: space.id, provisional: space.provisional }
      )
    )
    if (isHall) {
      primitives.push(
        textPrimitive(
          'plt03-stair-topology',
          { x: centre.x, y: centre.y + 2.2 },
          `${d.stair.riserCount} rises · ${d.stair.flightRiseGroups.join('/')} · going ${d.stair.going}`,
          'note',
          'middle',
          {
            authorityClass: 'A+B',
            source: `${source.stair.riseTopology.id}+${source.stair.goingTopology.id}`,
            planGeometry: 'unresolved'
          }
        )
      )
    }
  }

  const courtCentre = project.point(d.shell.centreX, d.shell.centreY)
  primitives.push(
    textPrimitive('plt03-label-courtyard', { x: courtCentre.x, y: courtCentre.y - 1.5 }, 'Courtyard', 'label', 'middle', { authorityClass: 'A', source: source.court.id }),
    textPrimitive('plt03-dim-courtyard', { x: courtCentre.x, y: courtCentre.y + 2.6 }, `${d.court.width} × ${d.court.depth}`, 'note', 'middle', { authorityClass: 'A', source: source.court.id })
  )

  for (const [index, axis] of d.frontAxes.entries()) {
    const onFront = project.point(axis, 0)
    const belowFront = { x: onFront.x, y: onFront.y + 4.2 }
    primitives.push(
      linePrimitive(`plt03-front-axis-${index + 1}`, onFront, belowFront, 'secondary', { authorityClass: 'B', source: source.frontField.id }),
      textPrimitive(`plt03-front-axis-label-${index + 1}`, { x: belowFront.x, y: belowFront.y + 2.7 }, `B${index + 1}`, 'note', 'middle', { authorityClass: 'B', source: source.frontField.id })
    )
  }

  primitives.push(...dimensionAndScalePrimitives(result, project))

  const northX = 141
  const northBaseY = 27
  const northTipY = 20
  primitives.push(
    linePrimitive('plt03-north-shaft', { x: northX, y: northBaseY }, { x: northX, y: northTipY }, 'primary', { authorityClass: 'B', convention: 'north-arrow' }),
    linePrimitive('plt03-north-left', { x: northX, y: northTipY }, { x: northX - 1.6, y: northTipY + 2.5 }, 'primary', { authorityClass: 'B' }),
    linePrimitive('plt03-north-right', { x: northX, y: northTipY }, { x: northX + 1.6, y: northTipY + 2.5 }, 'primary', { authorityClass: 'B' }),
    textPrimitive('plt03-north-label', { x: northX, y: northBaseY + 3.3 }, 'N', 'marker', 'middle', { authorityClass: 'B' })
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: 'PLT03-CURRENT-GROUND-PLAN',
    title: 'Reference House ground-floor plan — current authority substrate',
    description:
      'PLT-03 current-authority 1:100 plan substrate. Only controlled or deterministically derived architectural facts are represented; exact internal doors, stair plan geometry, frame/reveal construction and unresolved aperture extents are not invented.',
    scaleDenominator: SCALE,
    sourceId: source.fixtureId,
    primitives
  }
}
