import type {
  OpeningPlacement as PlanOpeningPlacement,
  PlanLineSource,
  PlanSliceSource
} from '../plan-slice/model.js'
import type { OpeningPlacement, ReferenceHouseCoordinationSource } from './model.js'
import { mm } from './units.js'
import type { Millimetres } from './units.js'

const provisional = (disposition: string): boolean =>
  disposition === 'PROVISIONAL_BUT_REPRESENTABLE'

export interface ReferenceHouseCourtGeometry {
  width: Millimetres
  depth: Millimetres
  x0: Millimetres
  x1: Millimetres
  y0: Millimetres
  y1: Millimetres
}

export const referenceHouseCourtGeometry = (
  source: ReferenceHouseCoordinationSource
): ReferenceHouseCourtGeometry => {
  const width = source.court.value.width
  const depth = source.court.value.depth
  const x0 = mm((source.shell.width.value - width) / 2)
  const offset = source.court.value.offsetY
  if (source.court.value.placement === 'centred-in-shell' && offset !== undefined) throw new Error('Centred courtyard cannot carry an offset')
  if (source.court.value.placement === 'offset-from-shell-centre' && (offset === undefined || !Number.isFinite(offset))) throw new Error('Offset courtyard requires a finite offset')
  const y0 = mm((source.shell.depth.value - depth) / 2 + (offset ?? 0))
  if (width <= 0 || depth <= 0 || x0 <= 0 || y0 <= 0 || x0 + width >= source.shell.width.value || y0 + depth >= source.shell.depth.value) throw new Error('Courtyard must lie strictly within shell')
  return {
    width,
    depth,
    x0,
    x1: mm(x0 + width),
    y0,
    y1: mm(y0 + depth)
  }
}

export const referenceHouseFrontAxes = (source: ReferenceHouseCoordinationSource): Millimetres[] => {
  const centreX = mm(source.shell.width.value / 2)
  const { count, spacing } = source.frontField.value
  return Array.from({ length: count }, (_, index) =>
    mm(centreX + (index + 1 - (count + 1) / 2) * spacing)
  )
}

export const referenceHousePlanLines = (source: ReferenceHouseCoordinationSource): PlanLineSource[] => {
  const court = referenceHouseCourtGeometry(source)
  return [
    { id: 'SHELL_WEST', coordinate: mm(0), provisional: false },
    { id: 'SHELL_EAST', coordinate: source.shell.width.value, provisional: false },
    { id: 'SHELL_SOUTH', coordinate: mm(0), provisional: false },
    { id: 'SHELL_NORTH', coordinate: source.shell.depth.value, provisional: false },
    { id: 'COURT_WEST', coordinate: court.x0, provisional: false },
    { id: 'COURT_EAST', coordinate: court.x1, provisional: false },
    { id: 'COURT_SOUTH', coordinate: court.y0, provisional: false },
    { id: 'COURT_NORTH', coordinate: court.y1, provisional: false },
    ...(source.partitions.groundStudyNorthY ? [{id:'STUDY_NORTH',coordinate:source.partitions.groundStudyNorthY.value,provisional:true}] : []),
    ...(source.partitions.groundGuestSplitY ? [{id:'GUEST_SPLIT',coordinate:source.partitions.groundGuestSplitY.value,provisional:true}] : []),
    ...(source.partitions.serviceNorthY ? [{id:'SERVICE_NORTH',coordinate:source.partitions.serviceNorthY.value,provisional:true}] : []),
    ...(source.partitions.pantrySouthY ? [{id:'PANTRY_SOUTH',coordinate:source.partitions.pantrySouthY.value,provisional:true}] : []),
    ...(source.partitions.serviceSouthY ? [{ id: 'SERVICE_SOUTH', coordinate: source.partitions.serviceSouthY.value, provisional: true }] : []),
    {
      id: 'WEST_ROOM_SPLIT',
      coordinate: source.partitions.westRoomSplitY.value,
      provisional: provisional(source.partitions.westRoomSplitY.disposition)
    },
    {
      id: 'HALL_WEST',
      coordinate: source.partitions.frontHallWestX.value,
      provisional: provisional(source.partitions.frontHallWestX.disposition)
    },
    {
      id: 'GALLERY_SERVICE',
      coordinate: source.partitions.galleryServiceX.value,
      provisional: provisional(source.partitions.galleryServiceX.disposition)
    },
    {
      id: 'UPPER_NORTH_SPLIT',
      coordinate: source.partitions.upperNorthSplitY.value,
      provisional: provisional(source.partitions.upperNorthSplitY.disposition)
    },
    {
      id: 'UPPER_DRY_SPLIT',
      coordinate: source.partitions.upperDrySplitX.value,
      provisional: provisional(source.partitions.upperDrySplitX.disposition)
    },
    {
      id: 'UPPER_SOUTH_TURN',
      coordinate: mm(court.y0 - source.partitions.upperSouthLandingTurnDepth.value),
      provisional: provisional(source.partitions.upperSouthLandingTurnDepth.disposition)
    }
  ]
}

const adaptOpeningPlacement = (
  placement: OpeningPlacement,
  source: ReferenceHouseCoordinationSource,
  frontAxes: Millimetres[]
): PlanOpeningPlacement => {
  if (placement.kind === 'front-bay') {
    return {
      kind: 'at-coordinate',
      coordinate: frontAxes[placement.bayIndex - 1],
      semanticKind: 'front-bay'
    }
  }
  if (placement.kind === 'entrance-bay') {
    return {
      kind: 'at-coordinate',
      coordinate: frontAxes[source.entranceBay.value.bayIndex - 1],
      semanticKind: 'entrance-bay'
    }
  }
  if (placement.kind === 'boundary-centred') return { kind: 'boundary-centred' }
  return {
    kind: 'qualitative-only',
    order: placement.order,
    semanticKind: 'qualitative-only'
  }
}

export const adaptReferenceHousePlanSource = (
  source: ReferenceHouseCoordinationSource
): PlanSliceSource => {
  const frontAxes = referenceHouseFrontAxes(source)
  const levels = [
    { id: 'GROUND', datum: source.levels.groundFfl.value },
    { id: 'FIRST', datum: source.levels.firstFfl.value }
  ]

  return {
    fixtureId: source.fixtureId,
    shell: {
      id: source.shell.id,
      width: source.shell.width.value,
      depth: source.shell.depth.value
    },
    levels,
    planLines: referenceHousePlanLines(source),
    voids: levels.map((level) => ({
      id: `${source.court.value.id}-${level.id}-VOID`,
      levelId: level.id,
      rectangles: [
        { x0: 'COURT_WEST', x1: 'COURT_EAST', y0: 'COURT_SOUTH', y1: 'COURT_NORTH' }
      ],
      provisional: provisional(source.court.disposition)
    })),
    spaces: source.spaces.map((space) => ({
      id: space.id,
      levelId: space.levelId,
      kind: space.kind,
      label: space.label,
      rectangles: space.rectangles.map((rectangle) => ({ ...rectangle })),
      provisional: provisional(space.disposition)
    })),
    boundaries: source.boundaries.map((boundary) => ({
      id: boundary.id,
      levelId: boundary.levelId,
      kind: boundary.kind,
      orientation: boundary.orientation,
      at: boundary.at,
      from: boundary.from,
      to: boundary.to,
      provisional: provisional(boundary.disposition)
    })),
    requiredAdjacencies: source.requiredAdjacencies.map((adjacency) => ({ ...adjacency })),
    openingFamilies: source.openingFamilies.map((family) => ({
      id: family.id,
      width: family.width,
      vertical: { ...family.vertical },
      provisional: provisional(family.disposition)
    })),
    openings: source.openings.map((opening) => ({
      id: opening.id,
      levelId: opening.levelId,
      hostBoundaryId: opening.hostBoundaryId,
      role: opening.role,
      familyId: opening.familyId,
      spaceIds: [...opening.spaceIds],
      ...(opening.widthOverride ? { widthOverride: opening.widthOverride } : {}),
      placement: adaptOpeningPlacement(opening.placement, source, frontAxes),
      provisional: provisional(opening.disposition)
    })),
    qualitativeOpeningRelationships: source.qualitativeOpeningRelationships.map((relationship) => ({
      id: relationship.id,
      levelId: relationship.levelId,
      hostBoundaryId: relationship.hostBoundaryId,
      relationship: relationship.relationship,
      ...(relationship.spaceIds ? { spaceIds: [...relationship.spaceIds] } : {}),
      provisional: provisional(relationship.disposition)
    }))
  }
}
