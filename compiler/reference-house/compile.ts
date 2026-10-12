import { areAdjacent, containsBox, isValidBox, overlapArea } from '../p0/geometry.js'
import type { Box2D } from '../p0/model.js'
import { deriveReferenceHouse } from './derive.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  DerivedSpace,
  ReferenceHouseCompileResult,
  ReferenceHouseDerived,
  ReferenceHouseSource,
  RhCompileStatus,
  RhDiagnostic
} from './model.js'
import { mm2 } from './units.js'

const EPSILON = 1e-6

const diagnostic = (
  code: string,
  status: RhCompileStatus,
  subjectIds: string[],
  message: string
): RhDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const regionAdjacent = (a: DerivedSpace, b: DerivedSpace): boolean =>
  a.boxes.some((aBox) => b.boxes.some((bBox) => areAdjacent(aBox, bBox)))

const openingMaxWidth = (opening: DerivedOpening): number | undefined => {
  if (opening.width.kind === 'approximate') return opening.width.value
  if (opening.width.kind === 'range') return opening.width.max
  return undefined
}

const openingFitsHost = (opening: DerivedOpening, host: DerivedBoundary): boolean => {
  if (opening.centre === undefined) return opening.placementKind === 'qualitative-only'
  const maxWidth = openingMaxWidth(opening)
  const halfWidth = maxWidth === undefined ? 0 : maxWidth / 2
  const min = host.orientation === 'horizontal' ? Math.min(host.x1, host.x2) : Math.min(host.y1, host.y2)
  const max = host.orientation === 'horizontal' ? Math.max(host.x1, host.x2) : Math.max(host.y1, host.y2)
  return opening.centre - halfWidth >= min - EPSILON && opening.centre + halfWidth <= max + EPSILON
}


const spaceTouchesHostAtCentre = (
  space: DerivedSpace,
  host: DerivedBoundary,
  centre: number
): boolean =>
  space.boxes.some((box) => {
    if (host.orientation === 'horizontal') {
      const onEdge = Math.abs(box.y - host.y1) <= EPSILON || Math.abs(box.y + box.height - host.y1) <= EPSILON
      return onEdge && centre >= box.x - EPSILON && centre <= box.x + box.width + EPSILON
    }
    const onEdge = Math.abs(box.x - host.x1) <= EPSILON || Math.abs(box.x + box.width - host.x1) <= EPSILON
    return onEdge && centre >= box.y - EPSILON && centre <= box.y + box.height + EPSILON
  })

const sourceDiagnostics = (source: ReferenceHouseSource): RhDiagnostic[] => {
  const diagnostics: RhDiagnostic[] = []
  const semanticIds = [
    ...source.spaces.map((item) => item.id),
    ...source.boundaries.map((item) => item.id),
    ...source.openings.map((item) => item.id)
  ]

  for (const id of duplicates(semanticIds)) {
    diagnostics.push(
      diagnostic('DUPLICATE_SEMANTIC_ID', 'FAIL', [id], `Semantic entity ID ${id} is duplicated.`)
    )
  }

  for (const id of duplicates(source.openingFamilies.map((item) => item.id))) {
    diagnostics.push(
      diagnostic('DUPLICATE_OPENING_FAMILY_ID', 'FAIL', [id], `Opening family ID ${id} is duplicated.`)
    )
  }

  const { riserCount, flightRiseGroups } = source.stair.riseTopology.value
  const groupedRises = flightRiseGroups.reduce((sum, value) => sum + value, 0)
  if (groupedRises !== riserCount) {
    diagnostics.push(
      diagnostic(
        'STAIR_RISE_GROUP_MISMATCH',
        'FAIL',
        [source.stair.riseTopology.id],
        `Stair rise groups total ${groupedRises}, but riserCount is ${riserCount}. Re-author the topology rather than silently regrouping it.`
      )
    )
  }

  if (riserCount <= 0 || flightRiseGroups.some((value) => value <= 0)) {
    diagnostics.push(
      diagnostic(
        'INVALID_STAIR_RISE_TOPOLOGY',
        'FAIL',
        [source.stair.riseTopology.id],
        'Stair riser count and flight rise groups must be positive.'
      )
    )
  }

  if (source.stair.goingTopology.value.goingsPerFlight <= 0 || source.stair.goingTopology.value.going <= 0) {
    diagnostics.push(
      diagnostic(
        'INVALID_STAIR_GOING_TOPOLOGY',
        'FAIL',
        [source.stair.goingTopology.id],
        'Stair going and goings-per-flight must be positive.'
      )
    )
  }

  const { count } = source.frontField.value
  if (!Number.isInteger(count) || count <= 0) {
    diagnostics.push(
      diagnostic('INVALID_FRONT_FIELD', 'FAIL', [source.frontField.id], 'Front field count must be a positive integer.')
    )
  }

  if (source.entranceBay.value.bayIndex < 1 || source.entranceBay.value.bayIndex > count) {
    diagnostics.push(
      diagnostic(
        'ENTRANCE_BAY_OUT_OF_RANGE',
        'FAIL',
        [source.entranceBay.id, source.frontField.id],
        `Entrance bay ${source.entranceBay.value.bayIndex} is outside the ${count}-bay front field.`
      )
    )
  }

  for (const opening of source.openings) {
    if (opening.placement.kind !== 'front-bay') continue
    if (opening.placement.bayIndex >= 1 && opening.placement.bayIndex <= count) continue
    diagnostics.push(
      diagnostic(
        'OPENING_BAY_OUT_OF_RANGE',
        'FAIL',
        [opening.id, source.frontField.id],
        `${opening.id} references front bay ${opening.placement.bayIndex}, outside the ${count}-bay field.`
      )
    )
  }

  if (source.levels.groundCeiling.value > source.levels.firstFfl.value) {
    diagnostics.push(
      diagnostic(
        'LEVEL_DATUM_ORDER',
        'FAIL',
        [source.levels.groundCeiling.id, source.levels.firstFfl.id],
        'Ground clear ceiling cannot lie above first-floor FFL in the RH-C1 datum model.'
      )
    )
  }

  if (source.levels.firstFfl.value >= source.levels.upperCeiling.value) {
    diagnostics.push(
      diagnostic(
        'LEVEL_DATUM_ORDER',
        'FAIL',
        [source.levels.firstFfl.id, source.levels.upperCeiling.id],
        'First-floor FFL must remain below the upper clear ceiling.'
      )
    )
  }

  return diagnostics
}

const derivedDiagnostics = (
  source: ReferenceHouseSource,
  derived: ReferenceHouseDerived
): RhDiagnostic[] => {
  const diagnostics: RhDiagnostic[] = []
  const shell: Box2D = {
    kind: 'box2d',
    x: 0,
    y: 0,
    width: derived.shell.width,
    height: derived.shell.depth
  }
  const court: Box2D = {
    kind: 'box2d',
    x: derived.court.x0,
    y: derived.court.y0,
    width: derived.court.width,
    height: derived.court.depth
  }

  const invalidLines = derived.planLines.filter((line) => !Number.isFinite(line.coordinate))
  for (const line of invalidLines) {
    diagnostics.push(
      diagnostic('INVALID_PLAN_LINE', 'FAIL', [line.id], `${line.id} does not derive to a finite coordinate.`)
    )
  }

  for (const space of derived.spaces) {
    for (const box of space.boxes) {
      if (!isValidBox(box)) {
        diagnostics.push(
          diagnostic('INVALID_SPACE_GEOMETRY', 'FAIL', [space.id], `${space.id} derives a non-positive reservation rectangle.`)
        )
        continue
      }
      if (!containsBox(shell, box)) {
        diagnostics.push(
          diagnostic('SPACE_OUTSIDE_SHELL', 'FAIL', [space.id], `${space.id} lies outside the outer shell.`)
        )
      }
      if (overlapArea(box, court) > EPSILON) {
        diagnostics.push(
          diagnostic('SPACE_OCCUPIES_COURT', 'FAIL', [space.id], `${space.id} occupies the open courtyard.`)
        )
      }
    }
  }

  for (const levelId of ['GROUND', 'FIRST'] as const) {
    const spaces = derived.spaces.filter((space) => space.levelId === levelId)
    for (let index = 0; index < spaces.length; index += 1) {
      for (let other = index + 1; other < spaces.length; other += 1) {
        const a = spaces[index]
        const b = spaces[other]
        const overlap = a.boxes.reduce(
          (sum, aBox) => sum + b.boxes.reduce((inner, bBox) => inner + overlapArea(aBox, bBox), 0),
          0
        )
        if (overlap <= EPSILON) continue
        diagnostics.push(
          diagnostic(
            'SPACE_OVERLAP',
            'FAIL',
            [a.id, b.id],
            `${a.id} and ${b.id} overlap by ${overlap} mm² on ${levelId}.`
          )
        )
      }
    }

    const totalArea = mm2(spaces.reduce((sum, space) => sum + space.area, 0))
    if (Math.abs(totalArea - derived.enclosedPlateArea) > EPSILON) {
      diagnostics.push(
        diagnostic(
          'PLATE_CLOSURE_MISMATCH',
          'FAIL',
          spaces.map((space) => space.id),
          `${levelId} semantic reservations total ${totalArea} mm², not the derived enclosed plate ${derived.enclosedPlateArea} mm².`
        )
      )
    }
  }

  const spaceById = new Map(derived.spaces.map((space) => [space.id, space]))
  for (const adjacency of source.requiredAdjacencies) {
    const a = spaceById.get(adjacency.a)
    const b = spaceById.get(adjacency.b)
    if (!a || !b) {
      diagnostics.push(
        diagnostic(
          'ADJACENCY_MISSING_SPACE',
          'FAIL',
          [adjacency.id, adjacency.a, adjacency.b],
          `${adjacency.id} references a missing space.`
        )
      )
      continue
    }
    if (a.levelId !== adjacency.levelId || b.levelId !== adjacency.levelId || !regionAdjacent(a, b)) {
      diagnostics.push(
        diagnostic(
          'FALSE_REQUIRED_ADJACENCY',
          'FAIL',
          [adjacency.id, a.id, b.id],
          `${a.id} and ${b.id} do not share a planning edge on ${adjacency.levelId}.`
        )
      )
    }
  }

  const boundaryById = new Map(derived.boundaries.map((boundary) => [boundary.id, boundary]))
  for (const opening of derived.openings) {
    const host = boundaryById.get(opening.hostBoundaryId)
    if (!host) {
      diagnostics.push(
        diagnostic(
          'OPENING_MISSING_HOST',
          'FAIL',
          [opening.id, opening.hostBoundaryId],
          `${opening.id} references missing host boundary ${opening.hostBoundaryId}.`
        )
      )
      continue
    }
    if (host.levelId !== opening.levelId) {
      diagnostics.push(
        diagnostic(
          'OPENING_HOST_LEVEL_MISMATCH',
          'FAIL',
          [opening.id, host.id],
          `${opening.id} and ${host.id} are on different levels.`
        )
      )
    }
    if (!openingFitsHost(opening, host)) {
      diagnostics.push(
        diagnostic(
          'OPENING_OUTSIDE_HOST',
          'FAIL',
          [opening.id, host.id],
          `${opening.id} does not fit on its declared host boundary ${host.id}.`
        )
      )
    }

    for (const spaceId of opening.spaceIds) {
      const served = spaceById.get(spaceId)
      if (!served) {
        diagnostics.push(
          diagnostic(
            'OPENING_MISSING_SPACE',
            'FAIL',
            [opening.id, spaceId],
            `${opening.id} references missing host space ${spaceId}.`
          )
        )
        continue
      }
      if (served.levelId !== opening.levelId) {
        diagnostics.push(
          diagnostic(
            'OPENING_SPACE_LEVEL_MISMATCH',
            'FAIL',
            [opening.id, served.id],
            `${opening.id} and ${served.id} are on different levels.`
          )
        )
        continue
      }
      if (opening.centre !== undefined && !spaceTouchesHostAtCentre(served, host, opening.centre)) {
        diagnostics.push(
          diagnostic(
            'OPENING_SPACE_HOST_MISMATCH',
            'FAIL',
            [opening.id, host.id, served.id],
            `${opening.id} is centred on ${host.id} outside the boundary edge owned by ${served.id}.`
          )
        )
      }
    }
  }

  for (const relation of source.qualitativeOpeningRelationships) {
    const host = boundaryById.get(relation.hostBoundaryId)
    if (!host) {
      diagnostics.push(
        diagnostic(
          'QUALITATIVE_OPENING_MISSING_HOST',
          'FAIL',
          [relation.id, relation.hostBoundaryId],
          `${relation.id} references missing host boundary ${relation.hostBoundaryId}.`
        )
      )
      continue
    }
    if (host.levelId !== relation.levelId) {
      diagnostics.push(
        diagnostic(
          'QUALITATIVE_OPENING_HOST_LEVEL_MISMATCH',
          'FAIL',
          [relation.id, host.id],
          `${relation.id} and ${host.id} are on different levels.`
        )
      )
    }
    for (const spaceId of relation.spaceIds ?? []) {
      const space = spaceById.get(spaceId)
      if (!space) {
        diagnostics.push(
          diagnostic(
            'QUALITATIVE_OPENING_MISSING_SPACE',
            'FAIL',
            [relation.id, spaceId],
            `${relation.id} references missing semantic host space ${spaceId}.`
          )
        )
      } else if (space.levelId !== relation.levelId) {
        diagnostics.push(
          diagnostic(
            'QUALITATIVE_OPENING_SPACE_LEVEL_MISMATCH',
            'FAIL',
            [relation.id, spaceId],
            `${relation.id} and ${spaceId} are on different levels.`
          )
        )
      }
    }
  }

  for (const axis of derived.frontAxes) {
    if (axis >= 0 && axis <= derived.shell.width) continue
    diagnostics.push(
      diagnostic(
        'FRONT_AXIS_OUTSIDE_SHELL',
        'FAIL',
        [source.frontField.id],
        `Front axis ${axis} mm lies outside shell width ${derived.shell.width} mm.`
      )
    )
  }

  if (derived.wallPlanning.clearAtNormalMax.frontRearRing < source.stair.reservation.value.min) {
    diagnostics.push(
      diagnostic(
        'STAIR_RESERVATION_REVIEW',
        'REVIEW',
        [source.stair.reservation.id, source.wallPlanning.normalRange.id, source.court.id],
        `At the normal wall-family maximum, the front/rear clear planning field is ${derived.wallPlanning.clearAtNormalMax.frontRearRing} mm, below the stair reservation minimum ${source.stair.reservation.value.min} mm. Re-open architectural fit; do not auto-repair geometry.`
      )
    )
  }

  return diagnostics
}

const sortedDiagnostics = (diagnostics: RhDiagnostic[]): RhDiagnostic[] =>
  [...diagnostics].sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    if (byCode) return byCode
    const bySubjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    if (bySubjects) return bySubjects
    return a.message.localeCompare(b.message)
  })

const aggregate = (diagnostics: RhDiagnostic[]): RhCompileStatus => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

export const compileReferenceHouse = (source: ReferenceHouseSource): ReferenceHouseCompileResult => {
  const before = sourceDiagnostics(source)
  const derived = deriveReferenceHouse(source)
  const diagnostics = sortedDiagnostics([...before, ...derivedDiagnostics(source, derived)])
  return {
    fixtureId: source.fixtureId,
    status: aggregate(diagnostics),
    derived,
    diagnostics
  }
}
