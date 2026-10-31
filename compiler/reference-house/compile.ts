import { compilePlanSlice } from '../plan-slice/compile.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import { deriveReferenceHouse } from './derive.js'
import { adaptReferenceHousePlanSource } from './plan-adapter.js'
import type {
  ReferenceHouseCompileResult,
  ReferenceHouseDerived,
  ReferenceHouseCoordinationSource,
  RhCompileStatus,
  RhDiagnostic
} from './model.js'

const diagnostic = (
  code: string,
  status: RhCompileStatus,
  subjectIds: string[],
  message: string
): RhDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const sourceDiagnostics = (source: ReferenceHouseCoordinationSource): RhDiagnostic[] => {
  const diagnostics: RhDiagnostic[] = []

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

  if (
    source.stair.goingTopology.value.goingsPerFlight <= 0 ||
    source.stair.goingTopology.value.going <= 0
  ) {
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
      diagnostic(
        'INVALID_FRONT_FIELD',
        'FAIL',
        [source.frontField.id],
        'Front field count must be a positive integer.'
      )
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

const referenceHouseDerivedDiagnostics = (
  source: ReferenceHouseCoordinationSource,
  derived: ReferenceHouseDerived
): RhDiagnostic[] => {
  const diagnostics: RhDiagnostic[] = []

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

export const compileReferenceHouseFromPlan = (
  source: ReferenceHouseCoordinationSource,
  planResult: PlanSliceCompileResult
): ReferenceHouseCompileResult => {
  const referenceDiagnostics = sourceDiagnostics(source)
  const derived = deriveReferenceHouse(source, planResult.derived)
  const sharedDiagnostics: RhDiagnostic[] = planResult.diagnostics.map((item) => ({ ...item }))
  const diagnostics = sortedDiagnostics([
    ...referenceDiagnostics,
    ...sharedDiagnostics,
    ...referenceHouseDerivedDiagnostics(source, derived)
  ])

  return {
    fixtureId: source.fixtureId,
    status: aggregate(diagnostics),
    derived,
    diagnostics
  }
}

export const compileReferenceHouse = (source: ReferenceHouseCoordinationSource): ReferenceHouseCompileResult => {
  const planResult = compilePlanSlice(adaptReferenceHousePlanSource(source))
  return compileReferenceHouseFromPlan(source, planResult)
}
