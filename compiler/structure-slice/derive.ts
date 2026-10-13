import type { Box2D } from '../core/geometry.js'
import { planBoundaryId } from '../plan-slice/model.js'
import type { PlanSliceDerived } from '../plan-slice/model.js'
import { mm, mm2 } from '../units.js'
import type { Millimetres } from '../units.js'
import { structuralLineId } from './model.js'
import type {
  DerivedBearingOpeningObligation,
  DerivedReactionNode,
  DerivedSpanField,
  DerivedStructuralLine,
  DerivedSupportPath,
  StructuralTopologyDerived,
  StructuralTopologySource
} from './model.js'

const requireLine = (plan: PlanSliceDerived, id: string): { coordinate: Millimetres; provisional: boolean } => {
  const line = plan.planLines.find((candidate) => candidate.id === id)
  if (!line) throw new Error(`Unknown plan line ${id}.`)
  return line
}

const deriveLineGeometry = (
  plan: PlanSliceDerived,
  source: { orientation: 'horizontal' | 'vertical'; at: string; from: string; to: string }
): { x1: Millimetres; y1: Millimetres; x2: Millimetres; y2: Millimetres; length: Millimetres; provisional: boolean } => {
  const at = requireLine(plan, source.at)
  const from = requireLine(plan, source.from)
  const to = requireLine(plan, source.to)
  if (source.orientation === 'horizontal') {
    return {
      x1: from.coordinate,
      y1: at.coordinate,
      x2: to.coordinate,
      y2: at.coordinate,
      length: mm(to.coordinate - from.coordinate),
      provisional: at.provisional || from.provisional || to.provisional
    }
  }
  return {
    x1: at.coordinate,
    y1: from.coordinate,
    x2: at.coordinate,
    y2: to.coordinate,
    length: mm(to.coordinate - from.coordinate),
    provisional: at.provisional || from.provisional || to.provisional
  }
}

const boxFromLines = (
  plan: PlanSliceDerived,
  spec: { x0: string; x1: string; y0: string; y1: string }
): { box: Box2D; provisional: boolean } => {
  const x0 = requireLine(plan, spec.x0)
  const x1 = requireLine(plan, spec.x1)
  const y0 = requireLine(plan, spec.y0)
  const y1 = requireLine(plan, spec.y1)
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

const deriveStructuralLines = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): DerivedStructuralLine[] =>
  source.lineElements
    .map((element) => {
      const geometry = deriveLineGeometry(plan, element)
      return {
        id: element.id,
        kind: element.kind,
        orientation: element.orientation,
        x1: geometry.x1,
        y1: geometry.y1,
        x2: geometry.x2,
        y2: geometry.y2,
        length: geometry.length,
        protected: element.protected,
        provisional: element.provisional || geometry.provisional,
        ...(element.foundationDestinationId
          ? { foundationDestinationId: element.foundationDestinationId }
          : {}),
        ...(element.supportedByPathIds
          ? { supportedByPathIds: [...element.supportedByPathIds] as [string, string] }
          : {})
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const deriveSupportPaths = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): DerivedSupportPath[] =>
  source.supportPaths
    .map((path) => {
      const geometry = deriveLineGeometry(plan, path)
      return {
        id: path.id,
        orientation: path.orientation,
        x1: geometry.x1,
        y1: geometry.y1,
        x2: geometry.x2,
        y2: geometry.y2,
        length: geometry.length,
        segmentIds: [...path.segmentIds],
        provisional: path.provisional || geometry.provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const deriveSpanFields = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): DerivedSpanField[] =>
  source.spanFields
    .map((field) => {
      const pieces = field.rectangles.map((rectangle) => boxFromLines(plan, rectangle))
      const boxes = pieces.map((piece) => piece.box)
      const bounds = boundsOf(boxes)
      return {
        id: field.id,
        levelId: field.levelId,
        label: field.label,
        boxes,
        bounds,
        area: mm2(boxes.reduce((sum, box) => sum + box.width * box.height, 0)),
        spanAxis: field.spanAxis,
        grossSpan: mm(field.spanAxis === 'x' ? bounds.width : bounds.height),
        supportPathIds: [...field.supportPathIds] as [string, string],
        provisional: field.provisional || pieces.some((piece) => piece.provisional)
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const deriveReactionNodes = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): DerivedReactionNode[] =>
  source.reactionNodes
    .map((node) => {
      const x = requireLine(plan, node.x)
      const y = requireLine(plan, node.y)
      return {
        id: node.id,
        x: x.coordinate,
        y: y.coordinate,
        elementIds: [...node.elementIds].sort(),
        protected: node.protected,
        provisional: node.provisional || x.provisional || y.provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

const deriveBearingOpenings = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): DerivedBearingOpeningObligation[] => {
  const structuralLineByBoundary = new Map(
    source.bearingBoundaryMappings.map((mapping) => [
      planBoundaryId(mapping.planBoundaryId),
      structuralLineId(mapping.structuralLineId)
    ])
  )

  return plan.openings
    .filter((opening) => structuralLineByBoundary.has(opening.hostBoundaryId))
    .map((opening) => {
      const lineId = structuralLineByBoundary.get(opening.hostBoundaryId)
      if (!lineId) throw new Error(`Validated bearing mapping is missing for ${opening.hostBoundaryId}.`)
      return {
        id: `BO-${opening.id}`,
        openingId: opening.id,
        levelId: opening.levelId,
        planBoundaryId: opening.hostBoundaryId,
        structuralLineId: lineId,
        ...(opening.centre === undefined ? {} : { centre: opening.centre }),
        width: { ...opening.width },
        proof: 'EXTERNAL-HEAD-SUPPORT-AND-BEARING' as const,
        provisional: opening.provisional
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

export const deriveStructuralTopology = (
  source: StructuralTopologySource,
  plan: PlanSliceDerived
): StructuralTopologyDerived => {
  const lineElements = deriveStructuralLines(source, plan)
  const supportPaths = deriveSupportPaths(source, plan)
  const spanFields = deriveSpanFields(source, plan)
  const reactionNodes = deriveReactionNodes(source, plan)
  const bearingOpenings = deriveBearingOpenings(source, plan)
  return {
    planeLevelId: source.planeLevelId,
    lineElements,
    supportPaths,
    spanFields,
    reactionNodes,
    bearingOpenings,
    interruptions: source.interruptions.map((item) => ({
      ...item,
      geometry: { ...item.geometry }
    })).sort((a, b) => a.id.localeCompare(b.id)),
    localFramingSystems: source.localFramingSystems.map((item) => ({ ...item })).sort((a, b) => a.id.localeCompare(b.id)),
    diaphragm: {
      ...source.diaphragm,
      fieldIds: [...source.diaphragm.fieldIds],
      interruptionIds: [...source.diaphragm.interruptionIds]
    },
    grossFieldArea: mm2(spanFields.reduce((sum, field) => sum + field.area, 0))
  }
}
