import type { Box2D } from '../core/geometry.js'
import { mm, mm2, square } from '../units.js'
import type { Millimetres } from '../units.js'
import { planBoundaryId } from './model.js'
import type {
  AreaResult,
  DerivedBoundary,
  DerivedOpening,
  DerivedPlanLine,
  DerivedRegion,
  DerivedSpace,
  DimensionAuthority,
  PlanRegionSource,
  PlanSliceDerived,
  PlanSliceSource,
  WidthResult
} from './model.js'

const lineMap = (source: PlanSliceSource): Map<string, DerivedPlanLine> =>
  new Map(source.planLines.map((line) => [line.id, { ...line }]))

const requireLine = (lines: Map<string, DerivedPlanLine>, id: string): DerivedPlanLine => {
  const line = lines.get(id)
  if (!line) throw new Error(`Unknown plan line ${id}.`)
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

const deriveRegion = (
  region: PlanRegionSource,
  lines: Map<string, DerivedPlanLine>
): DerivedRegion => {
  const pieces = region.rectangles.map((rect) => boxFromLines(lines, rect))
  const boxes = pieces.map((piece) => piece.box)
  return {
    id: region.id,
    levelId: region.levelId,
    boxes,
    area: mm2(boxes.reduce((sum, box) => sum + box.width * box.height, 0)),
    bounds: boundsOf(boxes),
    provisional: region.provisional || pieces.some((piece) => piece.provisional)
  }
}

const widthResult = (dimension: DimensionAuthority): WidthResult => {
  if (dimension.kind === 'approximate') return { kind: 'approximate', value: dimension.value }
  if (dimension.kind === 'range') return { kind: 'range', min: dimension.min, max: dimension.max }
  return { kind: 'unknown' }
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

const elevationResult = (
  dimension: DimensionAuthority | undefined,
  base: Millimetres
): WidthResult | undefined => {
  const range = dimensionRange(dimension)
  if (!range) return undefined
  if (range.min === range.max) return { kind: 'approximate', value: mm(base + range.min) }
  return { kind: 'range', min: mm(base + range.min), max: mm(base + range.max) }
}

const openingArea = (
  width: DimensionAuthority,
  sill?: DimensionAuthority,
  head?: DimensionAuthority
): AreaResult => {
  const widthRange = dimensionRange(width)
  const sillRange = dimensionRange(sill)
  const headRange = dimensionRange(head)
  if (!widthRange || !sillRange || !headRange) return { kind: 'unknown' }

  const minHeight = mm(headRange.min - sillRange.max)
  const maxHeight = mm(headRange.max - sillRange.min)
  if (minHeight <= 0 || maxHeight <= 0) return { kind: 'unknown' }

  const min = square(widthRange.min, minHeight)
  const max = square(widthRange.max, maxHeight)
  if (min === max) return { kind: 'approximate', value: min }
  return { kind: 'range', min, max }
}

const boundaryCentre = (boundary: DerivedBoundary): Millimetres =>
  boundary.orientation === 'horizontal'
    ? mm((boundary.x1 + boundary.x2) / 2)
    : mm((boundary.y1 + boundary.y2) / 2)

export const derivePlanSlice = (source: PlanSliceSource): PlanSliceDerived => {
  const lines = lineMap(source)
  const voids = source.voids
    .map((voidSource) => deriveRegion(voidSource, lines))
    .sort((a, b) => a.id.localeCompare(b.id))
  const spaces: DerivedSpace[] = source.spaces
    .map((space) => ({ ...deriveRegion(space, lines), kind: space.kind, label: space.label }))
    .sort((a, b) => a.id.localeCompare(b.id))

  const boundaries: DerivedBoundary[] = source.boundaries
    .map((boundary) => {
      const at = requireLine(lines, boundary.at)
      const from = requireLine(lines, boundary.from)
      const to = requireLine(lines, boundary.to)
      const provisional =
        boundary.provisional || at.provisional || from.provisional || to.provisional

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

  const familyById = new Map(source.openingFamilies.map((family) => [family.id, family]))
  const boundaryById = new Map(boundaries.map((boundary) => [boundary.id, boundary]))
  const levelById = new Map(source.levels.map((level) => [level.id, level]))

  const openings: DerivedOpening[] = source.openings
    .map((opening) => {
      const family = familyById.get(opening.familyId)
      if (!family) throw new Error(`Unknown opening family ${opening.familyId}.`)
      const host = boundaryById.get(opening.hostBoundaryId)
      if (!host) throw new Error(`Unknown opening host ${opening.hostBoundaryId}.`)
      const level = levelById.get(opening.levelId)
      if (!level) throw new Error(`Unknown level ${opening.levelId}.`)

      const widthAuthority = opening.widthOverride ?? family.width
      const centre =
        opening.placement.kind === 'boundary-centred'
          ? boundaryCentre(host)
          : opening.placement.kind === 'at-coordinate'
            ? opening.placement.coordinate
            : undefined
      const placementKind =
        'semanticKind' in opening.placement && opening.placement.semanticKind
          ? opening.placement.semanticKind
          : opening.placement.kind
      const sillElevation = elevationResult(family.vertical.sill, level.datum)
      const headElevation = elevationResult(family.vertical.head, level.datum)

      return {
        id: opening.id,
        levelId: opening.levelId,
        hostBoundaryId: planBoundaryId(host.id),
        spaceIds: [...opening.spaceIds],
        role: opening.role,
        placementKind,
        ...(centre === undefined ? {} : { centre }),
        width: widthResult(widthAuthority),
        ...(sillElevation ? { sillElevation } : {}),
        ...(headElevation ? { headElevation } : {}),
        area: openingArea(widthAuthority, family.vertical.sill, family.vertical.head),
        provisional: opening.provisional || family.provisional || host.provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  const shellArea = square(source.shell.width, source.shell.depth)
  const plateAreas = source.levels
    .map((level) => ({
      levelId: level.id,
      area: mm2(
        shellArea -
          voids
            .filter((voidRegion) => voidRegion.levelId === level.id)
            .reduce((sum, voidRegion) => sum + voidRegion.area, 0)
      )
    }))
    .sort((a, b) => a.levelId.localeCompare(b.levelId))

  return {
    shell: {
      id: source.shell.id,
      width: source.shell.width,
      depth: source.shell.depth,
      area: shellArea
    },
    levels: source.levels.map((level) => ({ ...level })).sort((a, b) => a.id.localeCompare(b.id)),
    planLines: [...lines.values()].sort((a, b) => a.id.localeCompare(b.id)),
    voids,
    spaces,
    boundaries,
    openings,
    plateAreas
  }
}
