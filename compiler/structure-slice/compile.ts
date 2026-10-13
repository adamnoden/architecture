import { containsBox, isValidBox, overlapArea } from '../core/geometry.js'
import type { Box2D } from '../core/geometry.js'
import type { DerivedBoundary, PlanSliceCompileResult } from '../plan-slice/model.js'
import { mm2 } from '../units.js'
import { deriveStructuralTopology } from './derive.js'
import type {
  DerivedStructuralLine,
  DerivedSupportPath,
  StructuralTopologyCompileResult,
  StructuralTopologyDiagnostic,
  StructuralTopologySource,
  StructuralTopologyStatus
} from './model.js'

const EPSILON = 1e-6

const diagnostic = (
  code: string,
  status: StructuralTopologyStatus,
  subjectIds: string[],
  message: string
): StructuralTopologyDiagnostic => ({
  code,
  status,
  subjectIds: [...subjectIds].sort(),
  message
})

const duplicates = (ids: string[]): string[] =>
  [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))].sort()

const intervalOf = (
  line: Pick<DerivedStructuralLine | DerivedSupportPath, 'orientation' | 'x1' | 'y1' | 'x2' | 'y2'>
): [number, number] =>
  line.orientation === 'horizontal'
    ? [Math.min(line.x1, line.x2), Math.max(line.x1, line.x2)]
    : [Math.min(line.y1, line.y2), Math.max(line.y1, line.y2)]

const coordinateOf = (
  line: Pick<DerivedStructuralLine | DerivedSupportPath, 'orientation' | 'x1' | 'y1'>
): number => line.orientation === 'horizontal' ? line.y1 : line.x1

const boundaryInterval = (boundary: DerivedBoundary): [number, number] =>
  boundary.orientation === 'horizontal'
    ? [Math.min(boundary.x1, boundary.x2), Math.max(boundary.x1, boundary.x2)]
    : [Math.min(boundary.y1, boundary.y2), Math.max(boundary.y1, boundary.y2)]

const boundaryCoordinate = (boundary: DerivedBoundary): number =>
  boundary.orientation === 'horizontal' ? boundary.y1 : boundary.x1

const rangeCovers = (line: DerivedSupportPath, min: number, max: number): boolean => {
  const [lineMin, lineMax] = intervalOf(line)
  return lineMin <= min + EPSILON && lineMax >= max - EPSILON
}

const pointOnLine = (x: number, y: number, line: DerivedStructuralLine): boolean => {
  const [min, max] = intervalOf(line)
  if (line.orientation === 'horizontal') {
    return Math.abs(y - line.y1) <= EPSILON && x >= min - EPSILON && x <= max + EPSILON
  }
  return Math.abs(x - line.x1) <= EPSILON && y >= min - EPSILON && y <= max + EPSILON
}

const pathTouchesBeamEndpoint = (
  path: DerivedSupportPath,
  beam: DerivedStructuralLine,
  endpoint: 'start' | 'end'
): boolean => {
  const x = endpoint === 'start' ? beam.x1 : beam.x2
  const y = endpoint === 'start' ? beam.y1 : beam.y2
  if (beam.orientation === 'vertical') {
    if (path.orientation !== 'horizontal' || Math.abs(path.y1 - y) > EPSILON) return false
    const [min, max] = intervalOf(path)
    return x >= min - EPSILON && x <= max + EPSILON
  }
  if (path.orientation !== 'vertical' || Math.abs(path.x1 - x) > EPSILON) return false
  const [min, max] = intervalOf(path)
  return y >= min - EPSILON && y <= max + EPSILON
}

const sourceDiagnostics = (
  source: StructuralTopologySource,
  plan: PlanSliceCompileResult
): StructuralTopologyDiagnostic[] => {
  const diagnostics: StructuralTopologyDiagnostic[] = []
  const allIds = [
    ...source.foundationDestinations.map((item) => item.id),
    ...source.lineElements.map((item) => item.id),
    ...source.supportPaths.map((item) => item.id),
    ...source.spanFields.map((item) => item.id),
    ...source.reactionNodes.map((item) => item.id),
    ...source.bearingBoundaryMappings.map((item) => item.id),
    ...source.interruptions.map((item) => item.id),
    ...source.localFramingSystems.map((item) => item.id),
    source.diaphragm.id
  ]

  for (const id of duplicates(allIds)) {
    diagnostics.push(
      diagnostic('DUPLICATE_STRUCTURAL_ID', 'FAIL', [id], `Structural entity ID ${id} is duplicated.`)
    )
  }

  if (plan.fixtureId !== source.planFixtureId) {
    diagnostics.push(
      diagnostic(
        'PLAN_FIXTURE_MISMATCH',
        'FAIL',
        [source.fixtureId, source.planFixtureId, plan.fixtureId],
        `Structural source expects plan fixture ${source.planFixtureId}, not ${plan.fixtureId}.`
      )
    )
  }

  if (plan.status === 'FAIL') {
    diagnostics.push(
      diagnostic('PLAN_FAILED', 'FAIL', [plan.fixtureId], 'Structural topology cannot pass over a failed architectural plan compile.')
    )
  } else if (plan.status === 'REVIEW') {
    diagnostics.push(
      diagnostic('PLAN_REVIEW_PROPAGATED', 'REVIEW', [plan.fixtureId], 'Architectural plan remains under REVIEW; structural topology cannot silently erase that state.')
    )
  }

  if (!plan.derived.levels.some((level) => level.id === source.planeLevelId)) {
    diagnostics.push(
      diagnostic(
        'STRUCTURAL_LEVEL_MISSING',
        'FAIL',
        [source.planeLevelId],
        `Structural plane level ${source.planeLevelId} is absent from the compiled plan.`
      )
    )
  }

  const foundationIds = new Set(source.foundationDestinations.map((item) => item.id))
  const pathIds = new Set(source.supportPaths.map((item) => item.id))
  const lineById = new Map(source.lineElements.map((item) => [item.id, item]))
  const lineIds = new Set(lineById.keys())
  const fieldIds = new Set(source.spanFields.map((item) => item.id))
  const interruptionIds = new Set(source.interruptions.map((item) => item.id))
  const framingById = new Map(source.localFramingSystems.map((item) => [item.id, item]))
  const planBoundaryIds = new Set(plan.derived.boundaries.map((item) => item.id))
  const planLineIds = new Set(plan.derived.planLines.map((item) => item.id))

  const requirePlanLine = (subjectId: string, lineId: string): void => {
    if (planLineIds.has(lineId)) return
    diagnostics.push(
      diagnostic(
        'STRUCTURAL_PLAN_LINE_MISSING',
        'FAIL',
        [subjectId, lineId],
        `${subjectId} references missing architectural plan line ${lineId}.`
      )
    )
  }

  for (const element of source.lineElements) {
    for (const lineId of [element.at, element.from, element.to]) requirePlanLine(element.id, lineId)

    if (element.kind === 'bearing-wall') {
      if (!element.foundationDestinationId) {
        diagnostics.push(
          diagnostic('BEARING_LINE_NO_FOUNDATION', 'FAIL', [element.id], `${element.id} has no declared foundation destination.`)
        )
      } else if (!foundationIds.has(element.foundationDestinationId)) {
        diagnostics.push(
          diagnostic(
            'MISSING_FOUNDATION_DESTINATION',
            'FAIL',
            [element.id, element.foundationDestinationId],
            `${element.id} references missing foundation destination ${element.foundationDestinationId}.`
          )
        )
      }
    }

    if (element.kind === 'edge-beam') {
      if (!element.supportedByPathIds || element.supportedByPathIds.length !== 2) {
        diagnostics.push(
          diagnostic('EDGE_BEAM_SUPPORTS_MISSING', 'FAIL', [element.id], `${element.id} must declare two endpoint support paths.`)
        )
      } else {
        for (const pathId of element.supportedByPathIds) {
          if (!pathIds.has(pathId)) {
            diagnostics.push(
              diagnostic('EDGE_BEAM_MISSING_SUPPORT_PATH', 'FAIL', [element.id, pathId], `${element.id} references missing support path ${pathId}.`)
            )
          }
        }
      }
    }
  }

  for (const path of source.supportPaths) {
    for (const lineId of [path.at, path.from, path.to]) requirePlanLine(path.id, lineId)
    if (path.segmentIds.length === 0) {
      diagnostics.push(
        diagnostic('EMPTY_SUPPORT_PATH', 'FAIL', [path.id], `${path.id} contains no structural segments.`)
      )
    }
    for (const segmentId of path.segmentIds) {
      if (!lineIds.has(segmentId)) {
        diagnostics.push(
          diagnostic('SUPPORT_PATH_MISSING_SEGMENT', 'FAIL', [path.id, segmentId], `${path.id} references missing segment ${segmentId}.`)
        )
      }
    }
  }

  for (const field of source.spanFields) {
    if (field.levelId !== source.planeLevelId) {
      diagnostics.push(
        diagnostic('SPAN_FIELD_LEVEL_MISMATCH', 'FAIL', [field.id, source.planeLevelId], `${field.id} is not on the structural plane level.`)
      )
    }
    for (const rectangle of field.rectangles) {
      for (const lineId of [rectangle.x0, rectangle.x1, rectangle.y0, rectangle.y1]) {
        requirePlanLine(field.id, lineId)
      }
    }
    for (const pathId of field.supportPathIds) {
      if (!pathIds.has(pathId)) {
        diagnostics.push(
          diagnostic('SPAN_FIELD_MISSING_SUPPORT', 'FAIL', [field.id, pathId], `${field.id} references missing support path ${pathId}.`)
        )
      }
    }
  }

  for (const node of source.reactionNodes) {
    requirePlanLine(node.id, node.x)
    requirePlanLine(node.id, node.y)
    for (const elementId of node.elementIds) {
      if (!lineIds.has(elementId)) {
        diagnostics.push(
          diagnostic('REACTION_NODE_MISSING_ELEMENT', 'FAIL', [node.id, elementId], `${node.id} references missing structural element ${elementId}.`)
        )
      }
    }
  }

  for (const mapping of source.bearingBoundaryMappings) {
    if (!planBoundaryIds.has(mapping.planBoundaryId)) {
      diagnostics.push(
        diagnostic(
          'BEARING_MAPPING_MISSING_PLAN_BOUNDARY',
          'FAIL',
          [mapping.id, mapping.planBoundaryId],
          `${mapping.id} references missing plan boundary ${mapping.planBoundaryId}.`
        )
      )
    }
    const structuralLine = lineById.get(mapping.structuralLineId)
    if (!structuralLine) {
      diagnostics.push(
        diagnostic(
          'BEARING_MAPPING_MISSING_STRUCTURAL_LINE',
          'FAIL',
          [mapping.id, mapping.structuralLineId],
          `${mapping.id} references missing structural line ${mapping.structuralLineId}.`
        )
      )
    } else if (structuralLine.kind !== 'bearing-wall') {
      diagnostics.push(
        diagnostic(
          'BEARING_MAPPING_NON_BEARING_LINE',
          'FAIL',
          [mapping.id, structuralLine.id],
          `${mapping.id} maps an architectural bearing boundary to non-bearing structural element ${structuralLine.id}.`
        )
      )
    }
  }

  for (const interruption of source.interruptions) {
    if (!fieldIds.has(interruption.hostFieldId)) {
      diagnostics.push(
        diagnostic('INTERRUPTION_MISSING_FIELD', 'FAIL', [interruption.id, interruption.hostFieldId], `${interruption.id} references missing host field ${interruption.hostFieldId}.`)
      )
    }
    const framing = framingById.get(interruption.framingSystemId)
    if (!framing) {
      diagnostics.push(
        diagnostic('INTERRUPTION_UNFRAMED', 'FAIL', [interruption.id, interruption.framingSystemId], `${interruption.id} has no declared local framing system.`)
      )
    } else if (framing.interruptionId !== interruption.id || framing.hostFieldId !== interruption.hostFieldId) {
      diagnostics.push(
        diagnostic(
          'INTERRUPTION_FRAMING_MISMATCH',
          'FAIL',
          [interruption.id, framing.id],
          `${framing.id} does not frame ${interruption.id} within the same structural field.`
        )
      )
    }
    if (interruption.geometry.kind === 'approximate-envelope' && (interruption.geometry.width <= 0 || interruption.geometry.depth <= 0)) {
      diagnostics.push(
        diagnostic('INVALID_INTERRUPTION_ENVELOPE', 'FAIL', [interruption.id], `${interruption.id} has a non-positive approximate opening envelope.`)
      )
    }
  }

  for (const framing of source.localFramingSystems) {
    if (!interruptionIds.has(framing.interruptionId)) {
      diagnostics.push(
        diagnostic('FRAMING_SYSTEM_MISSING_INTERRUPTION', 'FAIL', [framing.id, framing.interruptionId], `${framing.id} references missing interruption ${framing.interruptionId}.`)
      )
    }
    if (!fieldIds.has(framing.hostFieldId)) {
      diagnostics.push(
        diagnostic('FRAMING_SYSTEM_MISSING_FIELD', 'FAIL', [framing.id, framing.hostFieldId], `${framing.id} references missing host field ${framing.hostFieldId}.`)
      )
    }
  }

  for (const fieldId of source.diaphragm.fieldIds) {
    if (!fieldIds.has(fieldId)) {
      diagnostics.push(
        diagnostic('DIAPHRAGM_MISSING_FIELD', 'FAIL', [source.diaphragm.id, fieldId], `${source.diaphragm.id} references missing field ${fieldId}.`)
      )
    }
  }
  for (const interruptionId of source.diaphragm.interruptionIds) {
    if (!interruptionIds.has(interruptionId)) {
      diagnostics.push(
        diagnostic('DIAPHRAGM_MISSING_INTERRUPTION', 'FAIL', [source.diaphragm.id, interruptionId], `${source.diaphragm.id} references missing interruption ${interruptionId}.`)
      )
    }
  }

  return diagnostics
}

const derivedDiagnostics = (
  source: StructuralTopologySource,
  plan: PlanSliceCompileResult,
  derived: StructuralTopologyCompileResult['derived']
): StructuralTopologyDiagnostic[] => {
  const diagnostics: StructuralTopologyDiagnostic[] = []
  const shell: Box2D = {
    kind: 'box2d',
    x: 0,
    y: 0,
    width: plan.derived.shell.width,
    height: plan.derived.shell.depth
  }
  const lineById = new Map(derived.lineElements.map((item) => [item.id, item]))
  const pathById = new Map(derived.supportPaths.map((item) => [item.id, item]))
  const planBoundaryById = new Map(plan.derived.boundaries.map((item) => [item.id, item]))

  for (const element of derived.lineElements) {
    if (!Number.isFinite(element.length) || element.length <= 0) {
      diagnostics.push(
        diagnostic('INVALID_STRUCTURAL_LINE', 'FAIL', [element.id], `${element.id} derives a non-positive or non-finite line.`)
      )
    }
  }

  for (const mapping of source.bearingBoundaryMappings) {
    const boundary = planBoundaryById.get(mapping.planBoundaryId)
    const structuralLine = lineById.get(mapping.structuralLineId)
    if (!boundary || !structuralLine || structuralLine.kind !== 'bearing-wall') continue

    const [boundaryMin, boundaryMax] = boundaryInterval(boundary)
    const [lineMin, lineMax] = intervalOf(structuralLine)
    const collinear =
      boundary.orientation === structuralLine.orientation &&
      Math.abs(boundaryCoordinate(boundary) - coordinateOf(structuralLine)) <= EPSILON
    const covered = lineMin <= boundaryMin + EPSILON && lineMax >= boundaryMax - EPSILON
    if (!collinear || !covered) {
      diagnostics.push(
        diagnostic(
          'BEARING_MAPPING_GEOMETRY_MISMATCH',
          'FAIL',
          [mapping.id, boundary.id, structuralLine.id],
          `${boundary.id} is not geometrically covered by mapped bearing line ${structuralLine.id}.`
        )
      )
    }
  }

  for (const path of derived.supportPaths) {
    if (!Number.isFinite(path.length) || path.length <= 0) {
      diagnostics.push(
        diagnostic('INVALID_SUPPORT_PATH', 'FAIL', [path.id], `${path.id} derives a non-positive or non-finite path.`)
      )
      continue
    }
    const [pathMin, pathMax] = intervalOf(path)
    const pathCoordinate = coordinateOf(path)
    const segments = path.segmentIds
      .map((id) => lineById.get(id))
      .filter((item): item is DerivedStructuralLine => Boolean(item))

    const intervals: Array<[number, number, string]> = []
    for (const segment of segments) {
      if (segment.orientation !== path.orientation || Math.abs(coordinateOf(segment) - pathCoordinate) > EPSILON) {
        diagnostics.push(
          diagnostic('SUPPORT_PATH_MISALIGNMENT', 'FAIL', [path.id, segment.id], `${segment.id} is not collinear with ${path.id}.`)
        )
        continue
      }
      const [min, max] = intervalOf(segment)
      if (min < pathMin - EPSILON || max > pathMax + EPSILON) {
        diagnostics.push(
          diagnostic('SUPPORT_SEGMENT_OUTSIDE_PATH', 'FAIL', [path.id, segment.id], `${segment.id} extends outside ${path.id}.`)
        )
      }
      intervals.push([min, max, segment.id])
    }

    intervals.sort((a, b) => a[0] - b[0])
    let cursor = pathMin
    for (const [min, max] of intervals) {
      if (min > cursor + EPSILON) {
        diagnostics.push(
          diagnostic('SUPPORT_PATH_GAP', 'FAIL', [path.id], `${path.id} has an unsupported gap before coordinate ${min}.`)
        )
        break
      }
      cursor = Math.max(cursor, max)
    }
    if (cursor < pathMax - EPSILON) {
      diagnostics.push(
        diagnostic('SUPPORT_PATH_GAP', 'FAIL', [path.id], `${path.id} does not reach its declared end.`)
      )
    }
  }

  for (const beam of derived.lineElements.filter((item) => item.kind === 'edge-beam')) {
    const supports = (beam.supportedByPathIds ?? [])
      .map((id) => pathById.get(id))
      .filter((item): item is DerivedSupportPath => Boolean(item))
    if (supports.length !== 2) continue
    const startCovered = supports.some((path) => pathTouchesBeamEndpoint(path, beam, 'start'))
    const endCovered = supports.some((path) => pathTouchesBeamEndpoint(path, beam, 'end'))
    if (!startCovered || !endCovered) {
      diagnostics.push(
        diagnostic(
          'EDGE_BEAM_ENDPOINT_UNSUPPORTED',
          'FAIL',
          [beam.id, ...supports.map((item) => item.id)],
          `${beam.id} does not terminate on its two declared support paths.`
        )
      )
    }
  }

  const planVoids = plan.derived.voids.filter((item) => item.levelId === source.planeLevelId)
  for (const field of derived.spanFields) {
    for (const box of field.boxes) {
      if (!isValidBox(box)) {
        diagnostics.push(
          diagnostic('INVALID_SPAN_FIELD', 'FAIL', [field.id], `${field.id} derives a non-positive structural field rectangle.`)
        )
        continue
      }
      if (!containsBox(shell, box)) {
        diagnostics.push(
          diagnostic('SPAN_FIELD_OUTSIDE_SHELL', 'FAIL', [field.id], `${field.id} lies outside the architectural shell.`)
        )
      }
      for (const voidRegion of planVoids) {
        if (voidRegion.boxes.some((voidBox) => overlapArea(box, voidBox) > EPSILON)) {
          diagnostics.push(
            diagnostic('SPAN_FIELD_OCCUPIES_VOID', 'FAIL', [field.id, voidRegion.id], `${field.id} occupies architectural void ${voidRegion.id}.`)
          )
        }
      }
    }

    const supports = field.supportPathIds
      .map((id) => pathById.get(id))
      .filter((item): item is DerivedSupportPath => Boolean(item))
    if (supports.length !== 2) continue
    const expectedOrientation = field.spanAxis === 'x' ? 'vertical' : 'horizontal'
    if (supports.some((path) => path.orientation !== expectedOrientation)) {
      diagnostics.push(
        diagnostic('SPAN_SUPPORT_ORIENTATION', 'FAIL', [field.id, ...supports.map((item) => item.id)], `${field.id} support paths do not oppose its ${field.spanAxis}-axis span.`)
      )
      continue
    }

    const expectedEdges = field.spanAxis === 'x'
      ? [field.bounds.x, field.bounds.x + field.bounds.width]
      : [field.bounds.y, field.bounds.y + field.bounds.height]
    const actualEdges = supports.map(coordinateOf).sort((a, b) => a - b)
    const sortedExpected = [...expectedEdges].sort((a, b) => a - b)
    if (Math.abs(actualEdges[0] - sortedExpected[0]) > EPSILON || Math.abs(actualEdges[1] - sortedExpected[1]) > EPSILON) {
      diagnostics.push(
        diagnostic('SPAN_SUPPORT_MISMATCH', 'FAIL', [field.id, ...supports.map((item) => item.id)], `${field.id} does not terminate on its declared opposing support paths.`)
      )
    }

    const crossMin = field.spanAxis === 'x' ? field.bounds.y : field.bounds.x
    const crossMax = field.spanAxis === 'x'
      ? field.bounds.y + field.bounds.height
      : field.bounds.x + field.bounds.width
    for (const path of supports) {
      if (!rangeCovers(path, crossMin, crossMax)) {
        diagnostics.push(
          diagnostic('SPAN_SUPPORT_TOO_SHORT', 'FAIL', [field.id, path.id], `${path.id} does not support the full cross-width of ${field.id}.`)
        )
      }
    }
  }

  for (let index = 0; index < derived.spanFields.length; index += 1) {
    for (let other = index + 1; other < derived.spanFields.length; other += 1) {
      const a = derived.spanFields[index]
      const b = derived.spanFields[other]
      const overlap = a.boxes.reduce(
        (sum, aBox) => sum + b.boxes.reduce((inner, bBox) => inner + overlapArea(aBox, bBox), 0),
        0
      )
      if (overlap > EPSILON) {
        diagnostics.push(
          diagnostic('SPAN_FIELD_OVERLAP', 'FAIL', [a.id, b.id], `${a.id} and ${b.id} overlap by ${overlap} mm².`)
        )
      }
    }
  }

  const plateArea = plan.derived.plateAreas.find((item) => item.levelId === source.planeLevelId)?.area
  if (plateArea === undefined) {
    diagnostics.push(
      diagnostic('STRUCTURAL_PLATE_AREA_MISSING', 'FAIL', [source.planeLevelId], `No architectural plate area exists for ${source.planeLevelId}.`)
    )
  } else if (Math.abs(derived.grossFieldArea - plateArea) > EPSILON) {
    diagnostics.push(
      diagnostic(
        'STRUCTURAL_FIELD_CLOSURE_MISMATCH',
        'FAIL',
        derived.spanFields.map((item) => item.id),
        `Gross structural fields total ${derived.grossFieldArea} mm², not architectural plate ${mm2(plateArea)} mm².`
      )
    )
  }

  const elementGravity = (elementId: string, visiting: Set<string>): boolean => {
    if (visiting.has(elementId)) return false
    const element = lineById.get(elementId)
    if (!element) return false
    if (element.kind === 'bearing-wall') return Boolean(element.foundationDestinationId)
    const next = new Set(visiting)
    next.add(elementId)
    const supportIds = element.supportedByPathIds ?? []
    return supportIds.length === 2 && supportIds.every((pathId) => pathGravity(pathId, next))
  }

  const pathGravity = (pathId: string, visiting: Set<string>): boolean => {
    const path = pathById.get(pathId)
    if (!path) return false
    return path.segmentIds.length > 0 && path.segmentIds.every((elementId) => elementGravity(elementId, visiting))
  }

  for (const field of derived.spanFields) {
    for (const pathId of field.supportPathIds) {
      if (!pathGravity(pathId, new Set())) {
        diagnostics.push(
          diagnostic('GRAVITY_PATH_UNRESOLVED', 'FAIL', [field.id, pathId], `${field.id} does not have a complete represented gravity path through ${pathId} to a foundation destination.`)
        )
      }
    }
  }

  for (const node of derived.reactionNodes) {
    for (const elementId of node.elementIds) {
      const element = lineById.get(elementId)
      if (element && !pointOnLine(node.x, node.y, element)) {
        diagnostics.push(
          diagnostic('REACTION_NODE_GEOMETRY_MISMATCH', 'FAIL', [node.id, element.id], `${node.id} does not lie on ${element.id}.`)
        )
      }
    }
  }

  const diaphragmFieldIds = new Set(derived.diaphragm.fieldIds)
  for (const field of derived.spanFields) {
    if (!diaphragmFieldIds.has(field.id)) {
      diagnostics.push(
        diagnostic('DIAPHRAGM_FIELD_OMITTED', 'FAIL', [derived.diaphragm.id, field.id], `${field.id} is omitted from the declared structural-deck diaphragm.`)
      )
    }
  }
  const diaphragmInterruptionIds = new Set(derived.diaphragm.interruptionIds)
  for (const interruption of derived.interruptions) {
    if (!diaphragmInterruptionIds.has(interruption.id)) {
      diagnostics.push(
        diagnostic('DIAPHRAGM_INTERRUPTION_OMITTED', 'FAIL', [derived.diaphragm.id, interruption.id], `${interruption.id} is omitted from diaphragm interruption accounting.`)
      )
    }
  }

  return diagnostics
}

const sortedDiagnostics = (diagnostics: StructuralTopologyDiagnostic[]): StructuralTopologyDiagnostic[] =>
  [...diagnostics].sort((a, b) => {
    const byCode = a.code.localeCompare(b.code)
    if (byCode) return byCode
    const bySubjects = a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
    if (bySubjects) return bySubjects
    return a.message.localeCompare(b.message)
  })

const aggregate = (diagnostics: StructuralTopologyDiagnostic[]): StructuralTopologyStatus => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

const fatalDerivationCodes = new Set([
  'DUPLICATE_STRUCTURAL_ID',
  'PLAN_FIXTURE_MISMATCH',
  'PLAN_FAILED',
  'STRUCTURAL_LEVEL_MISSING',
  'STRUCTURAL_PLAN_LINE_MISSING'
])

const blocksStructuralDerivation = (diagnostic: StructuralTopologyDiagnostic): boolean =>
  diagnostic.status === 'FAIL' && fatalDerivationCodes.has(diagnostic.code)

const failedDerived = (
  source: StructuralTopologySource
): StructuralTopologyCompileResult['derived'] => ({
  planeLevelId: source.planeLevelId,
  lineElements: [],
  supportPaths: [],
  spanFields: [],
  reactionNodes: [],
  bearingOpenings: [],
  interruptions: [],
  localFramingSystems: [],
  diaphragm: {
    ...source.diaphragm,
    fieldIds: [],
    interruptionIds: []
  },
  grossFieldArea: mm2(0)
})

export const compileStructuralTopology = (
  source: StructuralTopologySource,
  plan: PlanSliceCompileResult
): StructuralTopologyCompileResult => {
  const before = sourceDiagnostics(source, plan)
  if (before.some(blocksStructuralDerivation)) {
    const diagnostics = sortedDiagnostics(before)
    return {
      fixtureId: source.fixtureId,
      planFixtureId: source.planFixtureId,
      status: 'FAIL',
      derived: failedDerived(source),
      diagnostics
    }
  }

  const derived = deriveStructuralTopology(source, plan.derived)
  const diagnostics = sortedDiagnostics([...before, ...derivedDiagnostics(source, plan, derived)])
  return {
    fixtureId: source.fixtureId,
    planFixtureId: source.planFixtureId,
    status: aggregate(diagnostics),
    derived,
    diagnostics
  }
}
