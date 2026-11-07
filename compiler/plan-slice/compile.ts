import { areAdjacent, containsBox, isValidBox, overlapArea } from '../core/geometry.js'
import type { Box2D } from '../core/geometry.js'
import {
  MODEL_AREA_EPSILON_MM2,
  MODEL_COORDINATE_EPSILON_MM
} from '../core/numeric.js'
import { mm, mm2 } from '../units.js'
import type { Millimetres } from '../units.js'
import { derivePlanSlice } from './derive.js'
import { planBoundaryId } from './model.js'
import type {
  DerivedBoundary,
  DerivedOpening,
  DerivedSpace,
  PlanSliceCompileResult,
  PlanSliceDerived,
  PlanSliceDiagnostic,
  PlanSliceSource,
  PlanSliceStatus
} from './model.js'

const diagnostic = (
  code: string,
  status: PlanSliceStatus,
  subjectIds: string[],
  message: string
): PlanSliceDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const regionAdjacent = (a: DerivedSpace, b: DerivedSpace): boolean =>
  a.boxes.some((aBox) => b.boxes.some((bBox) => areAdjacent(aBox, bBox)))

const openingMaxWidth = (opening: DerivedOpening): Millimetres | undefined => {
  if (opening.width.kind === 'approximate') return opening.width.value
  if (opening.width.kind === 'range') return opening.width.max
  return undefined
}

const openingFitsHost = (opening: DerivedOpening, host: DerivedBoundary): boolean => {
  if (opening.centre === undefined) return opening.placementKind === 'qualitative-only'
  const halfWidth = mm((openingMaxWidth(opening) ?? mm(0)) / 2)
  const min = mm(
    host.orientation === 'horizontal'
      ? Math.min(host.x1, host.x2)
      : Math.min(host.y1, host.y2)
  )
  const max = mm(
    host.orientation === 'horizontal'
      ? Math.max(host.x1, host.x2)
      : Math.max(host.y1, host.y2)
  )
  return (
    opening.centre - halfWidth >= min - MODEL_COORDINATE_EPSILON_MM &&
    opening.centre + halfWidth <= max + MODEL_COORDINATE_EPSILON_MM
  )
}

const spaceTouchesHostAtCentre = (
  space: DerivedSpace,
  host: DerivedBoundary,
  centre: Millimetres
): boolean =>
  space.boxes.some((box) => {
    if (host.orientation === 'horizontal') {
      const onEdge =
        Math.abs(box.y - host.y1) <= MODEL_COORDINATE_EPSILON_MM ||
        Math.abs(box.y + box.height - host.y1) <= MODEL_COORDINATE_EPSILON_MM
      return (
        onEdge &&
        centre >= box.x - MODEL_COORDINATE_EPSILON_MM &&
        centre <= box.x + box.width + MODEL_COORDINATE_EPSILON_MM
      )
    }

    const onEdge =
      Math.abs(box.x - host.x1) <= MODEL_COORDINATE_EPSILON_MM ||
      Math.abs(box.x + box.width - host.x1) <= MODEL_COORDINATE_EPSILON_MM
    return (
      onEdge &&
      centre >= box.y - MODEL_COORDINATE_EPSILON_MM &&
      centre <= box.y + box.height + MODEL_COORDINATE_EPSILON_MM
    )
  })

const sourceDiagnostics = (source: PlanSliceSource): PlanSliceDiagnostic[] => {
  const diagnostics: PlanSliceDiagnostic[] = []

  for (const id of duplicates(source.levels.map((item) => item.id))) {
    diagnostics.push(diagnostic('DUPLICATE_LEVEL_ID', 'FAIL', [id], `Level ID ${id} is duplicated.`))
  }

  for (const id of duplicates(source.planLines.map((item) => item.id))) {
    diagnostics.push(
      diagnostic('DUPLICATE_PLAN_LINE_ID', 'FAIL', [id], `Plan line ID ${id} is duplicated.`)
    )
  }

  for (
    const id of duplicates(
      [...source.voids, ...source.spaces, ...source.boundaries, ...source.openings].map(
        (item) => item.id
      )
    )
  ) {
    diagnostics.push(
      diagnostic('DUPLICATE_SEMANTIC_ID', 'FAIL', [id], `Semantic entity ID ${id} is duplicated.`)
    )
  }

  for (const id of duplicates(source.openingFamilies.map((item) => item.id))) {
    diagnostics.push(
      diagnostic(
        'DUPLICATE_OPENING_FAMILY_ID',
        'FAIL',
        [id],
        `Opening family ID ${id} is duplicated.`
      )
    )
  }

  const levelIds = new Set(source.levels.map((item) => item.id))
  const planLineIds = new Set(source.planLines.map((item) => item.id))
  const familyIds = new Set(source.openingFamilies.map((item) => item.id))
  const boundaryIds = new Set(source.boundaries.map((item) => item.id))

  for (const item of [...source.voids, ...source.spaces]) {
    if (!levelIds.has(item.levelId)) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_LEVEL',
          'FAIL',
          [item.id, item.levelId],
          `${item.id} references unknown level ${item.levelId}.`
        )
      )
    }
    for (const rectangle of item.rectangles) {
      for (const lineId of [rectangle.x0, rectangle.x1, rectangle.y0, rectangle.y1]) {
        if (planLineIds.has(lineId)) continue
        diagnostics.push(
          diagnostic(
            'UNKNOWN_PLAN_LINE',
            'FAIL',
            [item.id, lineId],
            `${item.id} references unknown plan line ${lineId}.`
          )
        )
      }
    }
  }

  for (const boundary of source.boundaries) {
    if (!levelIds.has(boundary.levelId)) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_LEVEL',
          'FAIL',
          [boundary.id, boundary.levelId],
          `${boundary.id} references unknown level ${boundary.levelId}.`
        )
      )
    }
    for (const lineId of [boundary.at, boundary.from, boundary.to]) {
      if (planLineIds.has(lineId)) continue
      diagnostics.push(
        diagnostic(
          'UNKNOWN_PLAN_LINE',
          'FAIL',
          [boundary.id, lineId],
          `${boundary.id} references unknown plan line ${lineId}.`
        )
      )
    }
  }

  for (const opening of source.openings) {
    if (!levelIds.has(opening.levelId)) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_LEVEL',
          'FAIL',
          [opening.id, opening.levelId],
          `${opening.id} references unknown level ${opening.levelId}.`
        )
      )
    }
    if (!familyIds.has(opening.familyId)) {
      diagnostics.push(
        diagnostic(
          'UNKNOWN_OPENING_FAMILY',
          'FAIL',
          [opening.id, opening.familyId],
          `${opening.id} references unknown opening family ${opening.familyId}.`
        )
      )
    }
    if (!boundaryIds.has(opening.hostBoundaryId)) {
      diagnostics.push(
        diagnostic(
          'OPENING_MISSING_HOST',
          'FAIL',
          [opening.id, opening.hostBoundaryId],
          `${opening.id} references missing host boundary ${opening.hostBoundaryId}.`
        )
      )
    }
  }

  return diagnostics
}

const derivedDiagnostics = (
  source: PlanSliceSource,
  derived: PlanSliceDerived
): PlanSliceDiagnostic[] => {
  const diagnostics: PlanSliceDiagnostic[] = []
  const shell: Box2D = {
    kind: 'box2d',
    x: 0,
    y: 0,
    width: derived.shell.width,
    height: derived.shell.depth
  }

  for (const line of derived.planLines) {
    if (Number.isFinite(line.coordinate)) continue
    diagnostics.push(
      diagnostic('INVALID_PLAN_LINE', 'FAIL', [line.id], `${line.id} does not derive to a finite coordinate.`)
    )
  }

  for (const voidRegion of derived.voids) {
    for (const box of voidRegion.boxes) {
      if (!isValidBox(box)) {
        diagnostics.push(
          diagnostic(
            'INVALID_VOID_GEOMETRY',
            'FAIL',
            [voidRegion.id],
            `${voidRegion.id} derives a non-positive void rectangle.`
          )
        )
      } else if (!containsBox(shell, box)) {
        diagnostics.push(
          diagnostic(
            'VOID_OUTSIDE_SHELL',
            'FAIL',
            [voidRegion.id],
            `${voidRegion.id} lies outside the outer shell.`
          )
        )
      }
    }
  }

  for (let index = 0; index < derived.voids.length; index += 1) {
    for (let other = index + 1; other < derived.voids.length; other += 1) {
      const a = derived.voids[index]
      const b = derived.voids[other]
      if (a.levelId !== b.levelId) continue
      const overlap = a.boxes.reduce(
        (sum, aBox) => sum + b.boxes.reduce((inner, bBox) => inner + overlapArea(aBox, bBox), 0),
        0
      )
      if (overlap <= MODEL_AREA_EPSILON_MM2) continue
      diagnostics.push(
        diagnostic(
          'VOID_OVERLAP',
          'FAIL',
          [a.id, b.id],
          `${a.id} and ${b.id} overlap by ${overlap} mm².`
        )
      )
    }
  }

  for (const space of derived.spaces) {
    for (const box of space.boxes) {
      if (!isValidBox(box)) {
        diagnostics.push(
          diagnostic(
            'INVALID_SPACE_GEOMETRY',
            'FAIL',
            [space.id],
            `${space.id} derives a non-positive reservation rectangle.`
          )
        )
        continue
      }
      if (!containsBox(shell, box)) {
        diagnostics.push(
          diagnostic('SPACE_OUTSIDE_SHELL', 'FAIL', [space.id], `${space.id} lies outside the outer shell.`)
        )
      }
      for (const voidRegion of derived.voids.filter((item) => item.levelId === space.levelId)) {
        if (!voidRegion.boxes.some((voidBox) => overlapArea(box, voidBox) > MODEL_AREA_EPSILON_MM2)) continue
        diagnostics.push(
          diagnostic(
            'SPACE_OCCUPIES_VOID',
            'FAIL',
            [space.id, voidRegion.id],
            `${space.id} occupies excluded plan void ${voidRegion.id}.`
          )
        )
      }
    }
  }

  for (const level of derived.levels) {
    const spaces = derived.spaces.filter((space) => space.levelId === level.id)
    for (let index = 0; index < spaces.length; index += 1) {
      for (let other = index + 1; other < spaces.length; other += 1) {
        const a = spaces[index]
        const b = spaces[other]
        const overlap = a.boxes.reduce(
          (sum, aBox) => sum + b.boxes.reduce((inner, bBox) => inner + overlapArea(aBox, bBox), 0),
          0
        )
        if (overlap <= MODEL_AREA_EPSILON_MM2) continue
        diagnostics.push(
          diagnostic(
            'SPACE_OVERLAP',
            'FAIL',
            [a.id, b.id],
            `${a.id} and ${b.id} overlap by ${overlap} mm² on ${level.id}.`
          )
        )
      }
    }

    const totalArea = mm2(spaces.reduce((sum, space) => sum + space.area, 0))
    const plate = derived.plateAreas.find((item) => item.levelId === level.id)
    if (plate && Math.abs(totalArea - plate.area) <= MODEL_AREA_EPSILON_MM2) continue
    diagnostics.push(
      diagnostic(
        'PLATE_CLOSURE_MISMATCH',
        'FAIL',
        spaces.map((space) => space.id),
        `${level.id} semantic reservations total ${totalArea} mm², not the derived available plate ${plate?.area ?? 'unknown'} mm².`
      )
    )
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
    if (a.levelId === adjacency.levelId && b.levelId === adjacency.levelId && regionAdjacent(a, b)) {
      continue
    }
    diagnostics.push(
      diagnostic(
        'FALSE_REQUIRED_ADJACENCY',
        'FAIL',
        [adjacency.id, a.id, b.id],
        `${a.id} and ${b.id} do not share a planning edge on ${adjacency.levelId}.`
      )
    )
  }

  const boundaryById = new Map(derived.boundaries.map((boundary) => [boundary.id, boundary]))
  for (const opening of derived.openings) {
    const host = boundaryById.get(opening.hostBoundaryId)
    if (!host) continue

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
    const host = boundaryById.get(planBoundaryId(relation.hostBoundaryId))
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

  return diagnostics
}

const sortedDiagnostics = (diagnostics: PlanSliceDiagnostic[]): PlanSliceDiagnostic[] =>
  [...diagnostics].sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    if (byCode) return byCode
    const bySubjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    if (bySubjects) return bySubjects
    return a.message.localeCompare(b.message)
  })

const aggregate = (diagnostics: PlanSliceDiagnostic[]): PlanSliceStatus => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

const failedDerived = (source: PlanSliceSource): PlanSliceDerived => ({
  shell: {
    id: source.shell.id,
    width: source.shell.width,
    depth: source.shell.depth,
    area: mm2(0)
  },
  levels: [],
  planLines: [],
  voids: [],
  spaces: [],
  boundaries: [],
  openings: [],
  plateAreas: []
})

export const compilePlanSlice = (source: PlanSliceSource): PlanSliceCompileResult => {
  const before = sourceDiagnostics(source)
  if (before.some((item) => item.status === 'FAIL')) {
    const diagnostics = sortedDiagnostics(before)
    return {
      fixtureId: source.fixtureId,
      status: 'FAIL',
      derived: failedDerived(source),
      diagnostics
    }
  }

  const derived = derivePlanSlice(source)
  const diagnostics = sortedDiagnostics([...before, ...derivedDiagnostics(source, derived)])
  return {
    fixtureId: source.fixtureId,
    status: aggregate(diagnostics),
    derived,
    diagnostics
  }
}
