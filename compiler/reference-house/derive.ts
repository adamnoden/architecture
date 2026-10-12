import type { Box2D } from '../p0/model.js'
import type {
  AreaResult,
  DerivedBoundary,
  DerivedOpening,
  DerivedPlanLine,
  DerivedSpace,
  DimensionAuthority,
  ReferenceHouseDerived,
  ReferenceHouseSource,
  WidthResult
} from './model.js'
import { deg, mm, mm2, square } from './units.js'
import type { Millimetres } from './units.js'

const factProvisional = (disposition: string): boolean => disposition === 'PROVISIONAL_BUT_REPRESENTABLE'

const lineMap = (source: ReferenceHouseSource): Map<string, DerivedPlanLine> => {
  const shellWidth = source.shell.width.value
  const shellDepth = source.shell.depth.value
  const court = source.court.value
  const courtX0 = mm((shellWidth - court.width) / 2)
  const courtY0 = mm((shellDepth - court.depth) / 2)

  const lines: DerivedPlanLine[] = [
    { id: 'SHELL_WEST', coordinate: mm(0), provisional: false },
    { id: 'SHELL_EAST', coordinate: shellWidth, provisional: false },
    { id: 'SHELL_SOUTH', coordinate: mm(0), provisional: false },
    { id: 'SHELL_NORTH', coordinate: shellDepth, provisional: false },
    { id: 'COURT_WEST', coordinate: courtX0, provisional: false },
    { id: 'COURT_EAST', coordinate: mm(courtX0 + court.width), provisional: false },
    { id: 'COURT_SOUTH', coordinate: courtY0, provisional: false },
    { id: 'COURT_NORTH', coordinate: mm(courtY0 + court.depth), provisional: false },
    {
      id: 'WEST_ROOM_SPLIT',
      coordinate: source.partitions.westRoomSplitY.value,
      provisional: factProvisional(source.partitions.westRoomSplitY.disposition)
    },
    {
      id: 'HALL_WEST',
      coordinate: source.partitions.frontHallWestX.value,
      provisional: factProvisional(source.partitions.frontHallWestX.disposition)
    },
    {
      id: 'GALLERY_SERVICE',
      coordinate: source.partitions.galleryServiceX.value,
      provisional: factProvisional(source.partitions.galleryServiceX.disposition)
    },
    {
      id: 'UPPER_NORTH_SPLIT',
      coordinate: source.partitions.upperNorthSplitY.value,
      provisional: factProvisional(source.partitions.upperNorthSplitY.disposition)
    },
    {
      id: 'UPPER_DRY_SPLIT',
      coordinate: source.partitions.upperDrySplitX.value,
      provisional: factProvisional(source.partitions.upperDrySplitX.disposition)
    }
  ]

  return new Map(lines.map((line) => [line.id, line]))
}

const requireLine = (lines: Map<string, DerivedPlanLine>, id: string): DerivedPlanLine => {
  const line = lines.get(id)
  if (!line) throw new Error(`Unknown Reference House plan line ${id}.`)
  return line
}

const boxFromLines = (
  lines: Map<string, DerivedPlanLine>,
  spec: { x0: string; x1: string; y0: string; y1: string }
): { box: Box2D; provisional: boolean } => {
  const x0 = requireLine(lines, spec.x0)
  const x1 = requireLine(lines, spec.x1)
  const y0 = requireLine(lines, spec.y0)
  const y1 = requireLine(lines, spec.y1)
  return {
    box: {
      kind: 'box2d',
      x: x0.coordinate,
      y: y0.coordinate,
      width: x1.coordinate - x0.coordinate,
      height: y1.coordinate - y0.coordinate
    },
    provisional: x0.provisional || x1.provisional || y0.provisional || y1.provisional
  }
}

const boundsOf = (boxes: Box2D[]): Box2D => {
  const x0 = Math.min(...boxes.map((box) => box.x))
  const y0 = Math.min(...boxes.map((box) => box.y))
  const x1 = Math.max(...boxes.map((box) => box.x + box.width))
  const y1 = Math.max(...boxes.map((box) => box.y + box.height))
  return { kind: 'box2d', x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
}

const deriveSpaces = (
  source: ReferenceHouseSource,
  lines: Map<string, DerivedPlanLine>
): DerivedSpace[] =>
  source.spaces
    .map((space) => {
      const pieces = space.rectangles.map((rect) => boxFromLines(lines, rect))
      const boxes = pieces.map((piece) => piece.box)
      return {
        id: space.id,
        levelId: space.levelId,
        kind: space.kind,
        label: space.label,
        boxes,
        area: mm2(boxes.reduce((sum, box) => sum + box.width * box.height, 0)),
        bounds: boundsOf(boxes),
        provisional:
          factProvisional(space.disposition) || pieces.some((piece) => piece.provisional)
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const deriveBoundaries = (
  source: ReferenceHouseSource,
  lines: Map<string, DerivedPlanLine>
): DerivedBoundary[] =>
  source.boundaries
    .map((boundary) => {
      const at = requireLine(lines, boundary.at)
      const from = requireLine(lines, boundary.from)
      const to = requireLine(lines, boundary.to)
      const provisional =
        factProvisional(boundary.disposition) || at.provisional || from.provisional || to.provisional

      if (boundary.orientation === 'horizontal') {
        return {
          id: boundary.id,
          levelId: boundary.levelId,
          kind: boundary.kind,
          orientation: boundary.orientation,
          x1: from.coordinate,
          y1: at.coordinate,
          x2: to.coordinate,
          y2: at.coordinate,
          length: mm(to.coordinate - from.coordinate),
          provisional
        }
      }

      return {
        id: boundary.id,
        levelId: boundary.levelId,
        kind: boundary.kind,
        orientation: boundary.orientation,
        x1: at.coordinate,
        y1: from.coordinate,
        x2: at.coordinate,
        y2: to.coordinate,
        length: mm(to.coordinate - from.coordinate),
        provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const widthResult = (dimension: DimensionAuthority): WidthResult => {
  if (dimension.kind === 'approximate') return { kind: 'approximate', value: dimension.value }
  if (dimension.kind === 'range') return { kind: 'range', min: dimension.min, max: dimension.max }
  return { kind: 'unknown' }
}


const elevationResult = (dimension: DimensionAuthority | undefined, base: Millimetres): WidthResult | undefined => {
  if (!dimension || dimension.kind === 'unknown') return undefined
  if (dimension.kind === 'approximate') return { kind: 'approximate', value: mm(base + dimension.value) }
  return { kind: 'range', min: mm(base + dimension.min), max: mm(base + dimension.max) }
}

interface Range {
  min: Millimetres
  max: Millimetres
}

const dimensionRange = (dimension: DimensionAuthority | undefined): Range | undefined => {
  if (!dimension || dimension.kind === 'unknown') return undefined
  if (dimension.kind === 'approximate') return { min: dimension.value, max: dimension.value }
  return { min: dimension.min, max: dimension.max }
}

const openingArea = (width: DimensionAuthority, sill?: DimensionAuthority, head?: DimensionAuthority): AreaResult => {
  const w = dimensionRange(width)
  const s = dimensionRange(sill)
  const h = dimensionRange(head)
  if (!w || !s || !h) return { kind: 'unknown' }

  const minHeight = mm(h.min - s.max)
  const maxHeight = mm(h.max - s.min)
  if (minHeight <= 0 || maxHeight <= 0) return { kind: 'unknown' }

  const min = square(w.min, minHeight)
  const max = square(w.max, maxHeight)
  if (min === max) return { kind: 'approximate', value: min }
  return { kind: 'range', min, max }
}

const boundaryCentre = (boundary: DerivedBoundary): Millimetres =>
  boundary.orientation === 'horizontal'
    ? mm((boundary.x1 + boundary.x2) / 2)
    : mm((boundary.y1 + boundary.y2) / 2)

const deriveOpenings = (
  source: ReferenceHouseSource,
  boundaries: DerivedBoundary[],
  frontAxes: Millimetres[]
): DerivedOpening[] => {
  const familyById = new Map(source.openingFamilies.map((family) => [family.id, family]))
  const boundaryById = new Map(boundaries.map((boundary) => [boundary.id, boundary]))

  return source.openings
    .map((opening) => {
      const family = familyById.get(opening.familyId)
      if (!family) throw new Error(`Unknown opening family ${opening.familyId}.`)
      const host = boundaryById.get(opening.hostBoundaryId)
      if (!host) throw new Error(`Unknown opening host ${opening.hostBoundaryId}.`)

      const widthAuthority = opening.widthOverride ?? family.width
      const levelDatum = opening.levelId === 'GROUND' ? source.levels.groundFfl.value : source.levels.firstFfl.value
      let centre: Millimetres | undefined
      if (opening.placement.kind === 'front-bay') {
        centre = frontAxes[opening.placement.bayIndex - 1]
      } else if (opening.placement.kind === 'entrance-bay') {
        centre = frontAxes[source.entranceBay.value.bayIndex - 1]
      } else if (opening.placement.kind === 'boundary-centred') {
        centre = boundaryCentre(host)
      }

      return {
        id: opening.id,
        levelId: opening.levelId,
        hostBoundaryId: opening.hostBoundaryId,
        spaceIds: [...opening.spaceIds],
        role: opening.role,
        placementKind: opening.placement.kind,
        ...(centre === undefined ? {} : { centre }),
        width: widthResult(widthAuthority),
        ...(elevationResult(family.vertical.sill, levelDatum) ? { sillElevation: elevationResult(family.vertical.sill, levelDatum) } : {}),
        ...(elevationResult(family.vertical.head, levelDatum) ? { headElevation: elevationResult(family.vertical.head, levelDatum) } : {}),
        area: openingArea(widthAuthority, family.vertical.sill, family.vertical.head),
        provisional:
          factProvisional(opening.disposition) || factProvisional(family.disposition) || host.provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export const deriveReferenceHouse = (source: ReferenceHouseSource): ReferenceHouseDerived => {
  const shellWidth = source.shell.width.value
  const shellDepth = source.shell.depth.value
  const courtWidth = source.court.value.width
  const courtDepth = source.court.value.depth
  const courtX0 = mm((shellWidth - courtWidth) / 2)
  const courtY0 = mm((shellDepth - courtDepth) / 2)
  const courtX1 = mm(courtX0 + courtWidth)
  const courtY1 = mm(courtY0 + courtDepth)
  const centreX = mm(shellWidth / 2)
  const centreY = mm(shellDepth / 2)
  const shellArea = square(shellWidth, shellDepth)
  const courtArea = square(courtWidth, courtDepth)
  const ringWest = courtX0
  const ringEast = mm(shellWidth - courtX1)
  const ringSouth = courtY0
  const ringNorth = mm(shellDepth - courtY1)
  const lines = lineMap(source)

  const { riserCount, flightRiseGroups } = source.stair.riseTopology.value
  const { going, goingsPerFlight } = source.stair.goingTopology.value
  const firstFfl = source.levels.firstFfl.value
  const rise = mm(firstFfl / riserCount)
  const flightRun = mm(going * goingsPerFlight)
  let accumulatedRises = 0
  const landingDatums = flightRiseGroups.slice(0, -1).map((group) => {
    accumulatedRises += group
    return mm(accumulatedRises * rise)
  })
  const pitch = deg((Math.atan(rise / going) * 180) / Math.PI)

  const { count, spacing } = source.frontField.value
  const frontAxes = Array.from({ length: count }, (_, index) =>
    mm(centreX + (index + 1 - (count + 1) / 2) * spacing)
  )
  const entranceCentre = frontAxes[source.entranceBay.value.bayIndex - 1]

  const spaces = deriveSpaces(source, lines)
  const boundaries = deriveBoundaries(source, lines)
  const openings = deriveOpenings(source, boundaries, frontAxes)

  const normalMax = source.wallPlanning.normalRange.value.max
  const stress = source.wallPlanning.stressThickness.value
  const clearAt = (thickness: Millimetres) => ({
    sideRing: mm(ringWest - 2 * thickness),
    frontRearRing: mm(ringSouth - 2 * thickness)
  })

  const roof = source.roof.value
  const roofFall = mm(ringSouth / roof.screeningFallDenominator)
  const courtSideEdge = mm(
    roof.outerEdgeControl + (roof.drainageDirection === 'outward' ? roofFall : -roofFall)
  )

  return {
    shell: {
      id: source.shell.id,
      width: shellWidth,
      depth: shellDepth,
      centreX,
      centreY,
      area: shellArea
    },
    court: {
      id: source.court.value.id,
      width: courtWidth,
      depth: courtDepth,
      x0: courtX0,
      x1: courtX1,
      y0: courtY0,
      y1: courtY1,
      area: courtArea
    },
    ring: { west: ringWest, east: ringEast, south: ringSouth, north: ringNorth },
    enclosedPlateArea: mm2(shellArea - courtArea),
    planLines: [...lines.values()].sort((a, b) => a.id.localeCompare(b.id)),
    levels: {
      groundFfl: source.levels.groundFfl.value,
      groundCeiling: source.levels.groundCeiling.value,
      firstFfl,
      interStoreyGap: mm(firstFfl - source.levels.groundCeiling.value),
      upperCeiling: source.levels.upperCeiling.value,
      upperClearHeight: mm(source.levels.upperCeiling.value - firstFfl),
      corniceControl: source.levels.corniceControl.value
    },
    stair: {
      riserCount,
      flightRiseGroups: [...flightRiseGroups],
      rise,
      going,
      goingsPerFlight,
      flightRun,
      landingDatums,
      twoRPlusG: mm(2 * rise + going),
      pitch
    },
    frontAxes,
    entranceCentre,
    spaces,
    boundaries,
    openings,
    wallPlanning: {
      normalRange: { ...source.wallPlanning.normalRange.value },
      stressThickness: stress,
      clearAtNormalMax: clearAt(normalMax),
      clearAtStress: clearAt(stress)
    },
    roofSection: {
      direction: roof.drainageDirection,
      outerEdgeControl: roof.outerEdgeControl,
      courtSideEdge,
      fallAcrossFrontRearRing: roofFall
    }
  }
}
