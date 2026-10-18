import type {
  DrawingLine,
  DrawingPrimitive,
  DrawingRect,
  DrawingScene,
  DrawingText,
  PaperPoint
} from '../publication-drawing/model.js'
import { createSectionPaperProjection } from '../publication-drawing/projection.js'
import type { ReferenceHouseCompileResult } from './model.js'
import type {
  PrincipalSectionOpeningSource,
  PrincipalSectionPublicationSource,
  PrincipalSectionStairFlightSource
} from './publication-principal-section-source.js'

const SCENE_WIDTH_MM = 166
const SCENE_HEIGHT_MM = 92
const SECTION_ORIGIN: PaperPoint = { x: 14, y: 8 }
const SECTION_TOP_MM = 6500

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
  anchor: DrawingText['anchor'] = 'start',
  metadata: DrawingText['metadata'] = {}
): DrawingText => ({ kind: 'text', id, x: point.x, y: point.y, value, role, anchor, metadata })

interface CutWallSpec {
  id: 'outer-south' | 'court-south' | 'court-north' | 'outer-north'
  y0: number
  y1: number
  top: number
}

const cutWallSpecs = (
  result: ReferenceHouseCompileResult,
  source: PrincipalSectionPublicationSource
): CutWallSpec[] => {
  const thickness = source.representation.externalCourtBodyProxy.value
  const { court, shell, roofSection } = result.derived
  return [
    { id: 'outer-south', y0: 0, y1: thickness, top: roofSection.outerEdgeControl },
    { id: 'court-south', y0: court.y0 - thickness, y1: court.y0, top: roofSection.courtSideEdge },
    { id: 'court-north', y0: court.y1, y1: court.y1 + thickness, top: roofSection.courtSideEdge },
    { id: 'outer-north', y0: shell.depth - thickness, y1: shell.depth, top: roofSection.outerEdgeControl }
  ]
}

const openingKey = (opening: PrincipalSectionOpeningSource): string =>
  `${opening.host}-${opening.level.toLowerCase()}`

const openingBaseElevation = (
  opening: PrincipalSectionOpeningSource,
  result: ReferenceHouseCompileResult
): number => opening.level === 'GROUND' ? result.derived.levels.groundFfl : result.derived.levels.firstFfl

const openingWallId = (opening: PrincipalSectionOpeningSource): CutWallSpec['id'] => {
  if (opening.host === 'court-south') return 'court-south'
  if (opening.host === 'court-north') return 'court-north'
  return 'outer-north'
}

const floorZonePrimitives = (
  result: ReferenceHouseCompileResult,
  source: PrincipalSectionPublicationSource,
  project: ReturnType<typeof createSectionPaperProjection>
): DrawingPrimitive[] => {
  const z0 = result.derived.levels.groundCeiling
  const height = source.representation.interStoreyZone.value
  return [
    rectPrimitive(
      'floor-zone-south',
      project.rect({ x: 0, y: z0, width: result.derived.court.y0, height }),
      'ink',
      { representation: 'inter-storey-planning-zone', provisional: true }
    ),
    rectPrimitive(
      'floor-zone-north',
      project.rect({
        x: result.derived.court.y1,
        y: z0,
        width: result.derived.shell.depth - result.derived.court.y1,
        height
      }),
      'ink',
      { representation: 'inter-storey-planning-zone', provisional: true }
    )
  ]
}

const stairLine = (
  flight: PrincipalSectionStairFlightSource,
  project: ReturnType<typeof createSectionPaperProjection>,
  perpendicularY: number
): DrawingLine => {
  const relation = flight.relationToCut
  const role: DrawingLine['role'] = relation === 'cut' ? 'cut' : 'secondary'
  const dash: DrawingLine['dash'] | undefined = relation === 'cut' ? undefined : 'provisional'

  if (relation === 'perpendicular-beyond') {
    return linePrimitive(
      `stair-flight-${flight.order}-perpendicular-beyond`,
      project.point(perpendicularY, flight.startElevation.value),
      project.point(perpendicularY, flight.endElevation.value),
      role,
      { relation, provisional: true },
      dash
    )
  }

  return linePrimitive(
    `stair-flight-${flight.order}-${relation}`,
    project.point(flight.startPlanCoordinate.value, flight.startElevation.value),
    project.point(flight.endPlanCoordinate.value, flight.endElevation.value),
    role,
    { relation, provisional: true },
    dash
  )
}

const stairPrimitives = (
  source: PrincipalSectionPublicationSource,
  project: ReturnType<typeof createSectionPaperProjection>
): DrawingPrimitive[] => {
  const first = source.stair.flights.find((flight) => flight.order === 1)
  const third = source.stair.flights.find((flight) => flight.order === 3)
  if (!first || !third) throw new Error('Principal-section stair requires flights 1 and 3.')
  if (first.endPlanCoordinate.value !== third.startPlanCoordinate.value) {
    throw new Error('Principal-section stair perpendicular flight requires one shared Y turn coordinate.')
  }
  const perpendicularY = first.endPlanCoordinate.value
  return source.stair.flights.map((flight) => stairLine(flight, project, perpendicularY))
}

const levelPrimitives = (
  result: ReferenceHouseCompileResult,
  project: ReturnType<typeof createSectionPaperProjection>
): DrawingPrimitive[] => {
  const x0 = project.point(result.derived.shell.depth, 0).x + 3
  const x1 = x0 + 7
  const tx = x1 + 1.5
  const levels = [
    ['Ground FFL', result.derived.levels.groundFfl],
    ['Ground ceiling', result.derived.levels.groundCeiling],
    ['First FFL', result.derived.levels.firstFfl],
    ['Upper ceiling', result.derived.levels.upperCeiling],
    ['Roof edge', result.derived.roofSection.outerEdgeControl]
  ] as const

  return levels.flatMap(([label, z]) => {
    const py = project.point(0, z).y
    const slug = label.toLowerCase().replaceAll(' ', '-')
    return [
      linePrimitive(`level-${slug}`, { x: x0, y: py }, { x: x1, y: py }, 'secondary', { elevation: z }, 'datum'),
      textPrimitive(
        `level-text-${slug}`,
        { x: tx, y: py + 0.8 },
        z === 0 ? `${label} ±0` : `${label} +${z}`,
        'note'
      )
    ]
  })
}

const spaceMidY = (result: ReferenceHouseCompileResult, spaceId: string): number => {
  const space = result.derived.spaces.find((candidate) => candidate.id === spaceId)
  if (!space) throw new Error(`Principal-section label requires space ${spaceId}.`)
  return space.bounds.y + space.bounds.height / 2
}

const scaleBarPrimitives = (): DrawingPrimitive[] => {
  const x0 = 128
  const y = 84
  return [
    linePrimitive('scale-bar', { x: x0, y }, { x: x0 + 30, y }, 'primary'),
    ...Array.from({ length: 4 }, (_, index) =>
      linePrimitive(`scale-tick-${index}`, { x: x0 + index * 10, y: y - 2 }, { x: x0 + index * 10, y: y + 2 }, 'secondary')
    ),
    textPrimitive('scale-zero', { x: x0, y: y + 5 }, '0', 'note'),
    textPrimitive('scale-three', { x: x0 + 30, y: y + 5 }, '3 m', 'note', 'end')
  ]
}

export const createPrincipalSectionPublicationScene = (
  result: ReferenceHouseCompileResult,
  source: PrincipalSectionPublicationSource
): DrawingScene => {
  if (result.status === 'FAIL') throw new Error('Cannot create publication section scene from a failed Reference House compile.')

  const scale = source.view.value.scale
  const project = createSectionPaperProjection({
    scaleDenominator: scale,
    horizontalBounds: { min: 0, max: result.derived.shell.depth },
    verticalBounds: { min: 0, max: SECTION_TOP_MM },
    paperOrigin: SECTION_ORIGIN
  })
  const primitives: DrawingPrimitive[] = []
  const walls = cutWallSpecs(result, source)
  const wallById = new Map(walls.map((wall) => [wall.id, wall]))

  // The controlled 350 mm interval is a planning cut zone, not a member depth.
  primitives.push(...floorZonePrimitives(result, source, project))

  for (const wall of walls) {
    primitives.push(
      rectPrimitive(
        `cut-wall-${wall.id}`,
        project.rect({ x: wall.y0, y: 0, width: wall.y1 - wall.y0, height: wall.top }),
        'ink',
        { representation: 'cut-wall-body', provisional: true }
      )
    )
  }

  // Six source-authorised vertical openings are cut back to paper white.
  for (const opening of source.openings) {
    const wallId = openingWallId(opening)
    const wall = wallById.get(wallId)
    if (!wall) throw new Error(`Principal-section opening ${openingKey(opening)} has no cut wall host.`)
    const base = openingBaseElevation(opening, result)
    const sill = base + opening.sillAboveLevel.value
    const head = base + opening.headAboveLevel.value
    primitives.push(
      rectPrimitive(
        `opening-${openingKey(opening)}`,
        project.rect({ x: wall.y0, y: sill, width: wall.y1 - wall.y0, height: head - sill }),
        'paper',
        { host: wallId, level: opening.level, role: opening.role, provisional: true }
      )
    )
  }

  // Roof is profile only: no technical thickness/build-up is asserted.
  primitives.push(
    linePrimitive(
      'roof-profile-south',
      project.point(0, result.derived.roofSection.outerEdgeControl),
      project.point(result.derived.court.y0, result.derived.roofSection.courtSideEdge),
      'profile',
      { direction: result.derived.roofSection.direction }
    ),
    linePrimitive(
      'roof-profile-north',
      project.point(result.derived.court.y1, result.derived.roofSection.courtSideEdge),
      project.point(result.derived.shell.depth, result.derived.roofSection.outerEdgeControl),
      'profile',
      { direction: result.derived.roofSection.direction }
    )
  )

  // The architectural cut terminates at FFL: one profile line, no below-ground geometry.
  primitives.push(
    linePrimitive(
      'ground-termination',
      project.point(0, result.derived.levels.groundFfl),
      project.point(result.derived.shell.depth, result.derived.levels.groundFfl),
      'profile',
      { treatment: source.representation.groundTermination.value }
    )
  )

  // The west-looking projection makes the east-west middle flight collapse at
  // the shared Y turn; beyond flights remain lighter than the cut flight.
  primitives.push(...stairPrimitives(source, project))

  const southMid = spaceMidY(result, 'G-HALL-02')
  const northGroundMid = spaceMidY(result, 'G-GARDEN-02')
  const upperSouthMid = spaceMidY(result, 'U-STAIR-01')
  const northLandingMid = spaceMidY(result, 'U-LAND-N01')
  const dressingMid = spaceMidY(result, 'U-DRESS-01')
  const courtMid = (result.derived.court.y0 + result.derived.court.y1) / 2

  primitives.push(
    textPrimitive('label-ground-south', project.point(southMid, 1450), 'Entrance hall / stair', 'label', 'middle'),
    textPrimitive('label-ground-north', project.point(northGroundMid, 1450), 'Garden dining', 'label', 'middle'),
    textPrimitive('label-upper-south', project.point(upperSouthMid, 4550), 'South landing / stair', 'label', 'middle'),
    textPrimitive('label-upper-north-1', project.point(northLandingMid, 4700), 'North', 'label', 'middle'),
    textPrimitive('label-upper-north-2', project.point(northLandingMid, 4400), 'landing', 'label', 'middle'),
    textPrimitive('label-upper-dressing-1', project.point(dressingMid, 4700), 'Dressing /', 'label', 'middle'),
    textPrimitive('label-upper-dressing-2', project.point(dressingMid, 4400), 'storage', 'label', 'middle'),
    textPrimitive('label-courtyard', project.point(courtMid, 3000), 'Open courtyard', 'label', 'middle'),
    textPrimitive('label-south', { x: project.point(0, 0).x, y: 79 }, 'South', 'note'),
    textPrimitive('label-north', { x: project.point(result.derived.shell.depth, 0).x, y: 79 }, 'North', 'note', 'end')
  )

  primitives.push(...levelPrimitives(result, project), ...scaleBarPrimitives())
  primitives.push(
    textPrimitive(
      'approx-note',
      { x: 14, y: 89 },
      'Approx. planning cut bodies, openings and stair; no construction build-ups.',
      'note'
    )
  )

  return {
    widthMm: SCENE_WIDTH_MM,
    heightMm: SCENE_HEIGHT_MM,
    viewId: source.view.value.id,
    title: 'Reference House principal longitudinal section',
    description:
      'North-south architectural section at 1:100 through the courtyard centreline, looking west. Cut bodies and stair placement are bounded planning representation, not construction information.',
    scaleDenominator: scale,
    sourceId: result.fixtureId,
    primitives
  }
}
