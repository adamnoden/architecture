import { MODEL_COORDINATE_EPSILON_MM } from '../core/numeric.js'
import { planBoundaryId } from '../plan-slice/model.js'
import type { DerivedBoundary, PlanSliceCompileResult } from '../plan-slice/model.js'
import { serviceCrossingId } from '../service-slice/model.js'
import type { ServiceTopologyCompileResult, ServiceTopologyDiagnostic, ServiceTopologySource } from '../service-slice/model.js'
import { structuralLineId } from '../structure-slice/model.js'
import type { DerivedStructuralLine, StructuralTopologyCompileResult } from '../structure-slice/model.js'
import type { Millimetres } from '../units.js'

const interval = (
  item: Pick<DerivedBoundary | DerivedStructuralLine, 'orientation' | 'x1' | 'y1' | 'x2' | 'y2'>
): [number, number] => item.orientation === 'horizontal'
  ? [Math.min(item.x1, item.x2), Math.max(item.x1, item.x2)]
  : [Math.min(item.y1, item.y2), Math.max(item.y1, item.y2)]

const coordinate = (
  item: Pick<DerivedBoundary | DerivedStructuralLine, 'orientation' | 'x1' | 'y1'>
): Millimetres => item.orientation === 'horizontal' ? item.y1 : item.x1

const sameLine = (boundary: DerivedBoundary, line: DerivedStructuralLine): boolean => {
  if (boundary.orientation !== line.orientation) return false
  if (Math.abs(coordinate(boundary) - coordinate(line)) > MODEL_COORDINATE_EPSILON_MM) return false
  const [b0, b1] = interval(boundary)
  const [l0, l1] = interval(line)
  return (
    Math.abs(b0 - l0) <= MODEL_COORDINATE_EPSILON_MM &&
    Math.abs(b1 - l1) <= MODEL_COORDINATE_EPSILON_MM
  )
}

const diagnostic = (
  code: string,
  status: 'PASS' | 'REVIEW' | 'FAIL',
  subjectIds: string[],
  message: string
): ServiceTopologyDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const statusOf = (diagnostics: ServiceTopologyDiagnostic[]): 'PASS' | 'REVIEW' | 'FAIL' => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

export const hardenReferenceHouseServiceTopology = (
  source: ServiceTopologySource,
  result: ServiceTopologyCompileResult,
  plan: PlanSliceCompileResult,
  structure: StructuralTopologyCompileResult
): ServiceTopologyCompileResult => {
  const extra: ServiceTopologyDiagnostic[] = []
  const derived = structuredClone(result.derived)
  derived.bearingCrossings = []

  for (const node of source.nodes) {
    const envelope = node.coordinationEnvelope
    if (!envelope) continue
    if (envelope.width <= 0 || envelope.depth <= 0) {
      extra.push(diagnostic(
        'INVALID_SERVICE_COORDINATION_ENVELOPE',
        'FAIL',
        [node.id],
        `${node.id} has a non-positive service coordination envelope.`
      ))
      continue
    }
    const interruption = structure.derived.interruptions.find(
      (item) => item.id === envelope.structuralInterruptionId
    )
    if (!interruption) {
      extra.push(diagnostic(
        'SERVICE_RESERVATION_STRUCTURAL_OPENING_MISSING',
        'FAIL',
        [node.id, envelope.structuralInterruptionId],
        `${node.id} references missing structural reservation ${envelope.structuralInterruptionId}.`
      ))
      continue
    }
    if (interruption.geometry.kind === 'qualitative') {
      extra.push(diagnostic(
        'SERVICE_RESERVATION_FIT_REVIEW',
        'REVIEW',
        [node.id, interruption.id],
        `${node.id} cannot be checked against a qualitative structural opening envelope.`
      ))
      continue
    }
    if (
      envelope.width > interruption.geometry.width + MODEL_COORDINATE_EPSILON_MM ||
      envelope.depth > interruption.geometry.depth + MODEL_COORDINATE_EPSILON_MM
    ) {
      extra.push(diagnostic(
        'SERVICE_RESERVATION_EXCEEDS_STRUCTURAL_OPENING',
        'FAIL',
        [node.id, interruption.id],
        `${node.id} clear reservation ${envelope.width}×${envelope.depth} mm exceeds structural opening envelope ${interruption.geometry.width}×${interruption.geometry.depth} mm.`
      ))
    }
  }

  for (const crossing of source.crossings.filter(
    (item) => item.selected && item.host.kind === 'plan-boundary'
  )) {
    const boundaryId = crossing.host.kind === 'plan-boundary' ? crossing.host.boundaryId : ''
    const boundary = plan.derived.boundaries.find((item) => item.id === boundaryId)
    if (!boundary) continue
    const matches = structure.derived.lineElements.filter(
      (line) => line.kind === 'bearing-wall' && sameLine(boundary, line)
    )
    if (matches.length > 1) {
      extra.push(diagnostic(
        'SERVICE_BEARING_HOST_AMBIGUOUS',
        'FAIL',
        [crossing.id, boundary.id, ...matches.map((item) => item.id)],
        `${crossing.id} lies on an architectural boundary matching more than one structural bearing line.`
      ))
      continue
    }
    if (matches.length === 0) {
      if (crossing.bearingLineId) {
        extra.push(diagnostic(
          'SERVICE_BEARING_HOST_MISMATCH',
          'FAIL',
          [crossing.id, crossing.bearingLineId, boundary.id],
          `${crossing.id} declares bearing line ${crossing.bearingLineId}, but the host boundary does not match a represented bearing line.`
        ))
      }
      continue
    }

    const line = matches[0]
    if (crossing.bearingLineId && crossing.bearingLineId !== line.id) {
      extra.push(diagnostic(
        'SERVICE_BEARING_HOST_MISMATCH',
        'FAIL',
        [crossing.id, crossing.bearingLineId, line.id],
        `${crossing.id} declares ${crossing.bearingLineId}, but its architectural host matches ${line.id}.`
      ))
      continue
    }
    derived.bearingCrossings.push({
      id: `SVC-BEARING-${crossing.id}`,
      crossingId: serviceCrossingId(crossing.id),
      planBoundaryId: planBoundaryId(boundary.id),
      structuralLineId: structuralLineId(line.id),
      proof: 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING',
      provisional: crossing.provisional || line.provisional || boundary.provisional
    })
  }
  derived.bearingCrossings.sort((a, b) => a.id.localeCompare(b.id))

  const diagnostics = [...result.diagnostics, ...extra].sort((a, b) => {
    const code = a.code.localeCompare(b.code)
    if (code) return code
    return a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
  })

  return {
    ...result,
    status: statusOf(diagnostics),
    derived,
    diagnostics
  }
}
