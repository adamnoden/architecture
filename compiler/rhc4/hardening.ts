import type {
  BoundaryRole,
  BoundaryTopologyCompileResult,
  BoundaryTopologyDiagnostic
} from '../boundary-slice/model.js'
import { MODEL_AREA_EPSILON_MM2 } from '../core/numeric.js'
import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import type { ReferenceHouseCoordinationSource } from '../reference-house/model.js'
import { serviceCrossingId } from '../service-slice/model.js'
import type { ServiceTopologyCompileResult } from '../service-slice/model.js'
import { mm2, square } from '../units.js'
import type { Millimetres, SquareMillimetres } from '../units.js'

const requiredRoles: BoundaryRole[] = ['air', 'moisture', 'thermal', 'weather']

const diagnostic = (
  code: string,
  status: 'PASS' | 'REVIEW' | 'FAIL',
  subjectIds: string[],
  message: string
): BoundaryTopologyDiagnostic => ({ code, status, subjectIds: [...subjectIds].sort(), message })

const statusOf = (diagnostics: BoundaryTopologyDiagnostic[]): 'PASS' | 'REVIEW' | 'FAIL' => {
  if (diagnostics.some((item) => item.status === 'FAIL')) return 'FAIL'
  if (diagnostics.some((item) => item.status === 'REVIEW')) return 'REVIEW'
  return 'PASS'
}

const sameRoles = (roles: BoundaryRole[]): boolean =>
  roles.length === requiredRoles.length && requiredRoles.every((role) => roles.includes(role))

export interface ReferenceHouseBoundaryUpstream {
  plan: PlanSliceCompileResult
  services: ServiceTopologyCompileResult
}

export interface RhC4Coordination {
  roofCatchments: Array<{
    id: 'SOUTH' | 'NORTH' | 'WEST' | 'EAST'
    planArea: SquareMillimetres
  }>
  roofCatchmentTotal: SquareMillimetres
  enclosedPlateArea: SquareMillimetres
  courtyardOpenSkyArea: SquareMillimetres
  wallPlanningStressThicknessMm: Millimetres
}

export const deriveReferenceHouseBoundaryCoordination = (
  house: ReferenceHouseCoordinationSource,
  upstream: ReferenceHouseBoundaryUpstream
): RhC4Coordination => {
  const shellWidth = house.shell.width.value
  const shellDepth = house.shell.depth.value
  const courtWidth = house.court.value.width
  const courtDepth = house.court.value.depth
  const frontRearDepth = (shellDepth - courtDepth) / 2
  const sideWidth = (shellWidth - courtWidth) / 2

  const southNorth = mm2(((shellWidth + courtWidth) / 2) * frontRearDepth)
  const westEast = mm2(((shellDepth + courtDepth) / 2) * sideWidth)
  const roofCatchments: RhC4Coordination['roofCatchments'] = [
    { id: 'SOUTH', planArea: southNorth },
    { id: 'NORTH', planArea: southNorth },
    { id: 'WEST', planArea: westEast },
    { id: 'EAST', planArea: westEast }
  ]
  const roofCatchmentTotal = mm2(roofCatchments.reduce((sum, item) => sum + item.planArea, 0))
  const enclosedPlateArea = upstream.plan.derived.plateAreas.find((item) => item.levelId === 'GROUND')?.area
    ?? mm2(0)

  return {
    roofCatchments,
    roofCatchmentTotal,
    enclosedPlateArea,
    courtyardOpenSkyArea: square(courtWidth, courtDepth),
    wallPlanningStressThicknessMm: house.wallPlanning.stressThickness.value
  }
}

export const hardenReferenceHouseBoundaryTopology = (
  house: ReferenceHouseCoordinationSource,
  upstream: ReferenceHouseBoundaryUpstream,
  result: BoundaryTopologyCompileResult
): BoundaryTopologyCompileResult => {
  const extra: BoundaryTopologyDiagnostic[] = []

  for (const system of result.derived.systems) {
    if (system.carrierIds.length !== 4) {
      extra.push(diagnostic(
        'RH_BOUNDARY_SYSTEM_CARRIER_SET_INCOMPLETE',
        'FAIL',
        [system.id, ...system.carrierIds],
        `${system.id} must retain outer-wall, courtyard-wall, roof and ground-interface carriers.`
      ))
    }
  }

  for (const obligation of result.derived.openingObligations) {
    if (!sameRoles(obligation.roles)) {
      extra.push(diagnostic(
        'RH_ENVELOPE_OPENING_ROLE_GAP',
        'FAIL',
        [obligation.id, obligation.openingRefId, ...obligation.roles],
        `${obligation.openingRefId} does not carry all four RH-C4 weather/air/thermal/moisture interface obligations.`
      ))
    }
  }

  const qualitativeIds = new Set(house.qualitativeOpeningRelationships.map((item) => item.id))
  const representedQualitativeIds = new Set(
    result.derived.openingObligations
      .filter((item) => item.openingRefKind === 'qualitative')
      .map((item) => item.openingRefId)
  )
  for (const id of qualitativeIds) {
    if (!representedQualitativeIds.has(id)) {
      extra.push(diagnostic(
        'RH_QUALITATIVE_OPENING_BOUNDARY_OBLIGATION_MISSING',
        'FAIL',
        [id],
        `${id} remains architecturally qualitative but still needs explicit boundary obligations.`
      ))
    }
  }

  for (const obligation of result.derived.serviceObligations) {
    if (!sameRoles(obligation.roles)) {
      extra.push(diagnostic(
        'RH_ENVELOPE_SERVICE_ROLE_GAP',
        'FAIL',
        [obligation.id, obligation.serviceCrossingId, ...obligation.roles],
        `${obligation.serviceCrossingId} does not carry all four RH-C4 boundary reinstatement roles.`
      ))
    }
  }

  const representedServiceIds = new Set<string>(
    result.derived.serviceObligations.map((item) => item.serviceCrossingId)
  )
  const selectedCrossings = upstream.services.derived.crossings.filter((item) => item.selected)
  for (const crossing of selectedCrossings) {
    const required = crossing.host.kind === 'plan-boundary' ||
      crossing.id === 'PEN-SV-RF-01' ||
      crossing.id === 'PEN-PV-01' ||
      crossing.id === 'PEN-FD-01'
    if (required && !representedServiceIds.has(crossing.id)) {
      extra.push(diagnostic(
        'RH_SELECTED_ENVELOPE_SERVICE_CROSSING_MISSING',
        'FAIL',
        [crossing.id],
        `${crossing.id} is selected upstream but absent from the RH-C4 boundary topology.`
      ))
    }
  }
  if (representedServiceIds.has(serviceCrossingId('PEN-BX-01'))) {
    extra.push(diagnostic(
      'RH_FALLBACK_BATHROOM_EXTRACT_PROMOTED',
      'FAIL',
      ['PEN-BX-01'],
      'RH-C4 must not promote the unselected direct bathroom extract fallback into the active envelope topology.'
    ))
  }

  const courtyardCrossing = result.derived.occurrenceObligations.find(
    (item) => item.projectOccurrenceId === 'PEN-CD-01'
  )
  if (!courtyardCrossing) {
    extra.push(diagnostic(
      'RH_COURTYARD_DRAINAGE_CROSSING_MISSING',
      'FAIL',
      ['PEN-CD-01'],
      'RH-C4 must retain PEN-CD-01 as the registered courtyard primary-drain and emergency-overflow crossing occurrence.'
    ))
  } else {
    const routes = [...courtyardCrossing.drainageRouteIds].sort()
    if (!sameRoles(courtyardCrossing.roles)) {
      extra.push(diagnostic(
        'RH_COURTYARD_DRAINAGE_CROSSING_ROLE_GAP',
        'FAIL',
        [courtyardCrossing.id, 'PEN-CD-01', ...courtyardCrossing.roles],
        'PEN-CD-01 does not carry the full RH-C4 boundary reinstatement set.'
      ))
    }
    if (
      routes.length !== 2 ||
      routes[0] !== 'RW-COURT-EMERGENCY' ||
      routes[1] !== 'RW-COURT-PRIMARY'
    ) {
      extra.push(diagnostic(
        'RH_COURTYARD_DRAINAGE_CROSSING_ROUTE_MISMATCH',
        'FAIL',
        ['PEN-CD-01', ...routes],
        'PEN-CD-01 must explicitly own both the courtyard primary route and the independent emergency overflow route.'
      ))
    }
  }

  const roofRoutes = result.derived.drainageRoutes.filter((item) => item.kind === 'roof-field')
  if (roofRoutes.length !== 4) {
    extra.push(diagnostic(
      'RH_ROOF_DRAINAGE_FIELD_COUNT_MISMATCH',
      'FAIL',
      roofRoutes.map((item) => item.id),
      `RH-08 requires four outward-draining roof fields; RH-C4 carries ${roofRoutes.length}.`
    ))
  }

  const courtPrimary = result.derived.drainageRoutes.filter((item) => item.kind === 'courtyard-primary')
  const courtEmergency = result.derived.drainageRoutes.filter((item) => item.kind === 'courtyard-emergency')
  if (courtPrimary.length !== 1 || courtEmergency.length !== 1) {
    extra.push(diagnostic(
      'RH_COURTYARD_DRAINAGE_REDUNDANCY_MISSING',
      'FAIL',
      [...courtPrimary, ...courtEmergency].map((item) => item.id),
      'RH-08 requires one primary courtyard route and one independent emergency overflow route.'
    ))
  } else if (courtPrimary[0].to === courtEmergency[0].to) {
    extra.push(diagnostic(
      'RH_COURTYARD_OVERFLOW_NOT_INDEPENDENT',
      'FAIL',
      [courtPrimary[0].id, courtEmergency[0].id],
      'The courtyard emergency overflow must not disappear into the same destination description as the primary collector.'
    ))
  }

  const coordination = deriveReferenceHouseBoundaryCoordination(house, upstream)
  if (
    Math.abs(coordination.roofCatchmentTotal - coordination.enclosedPlateArea) >
    MODEL_AREA_EPSILON_MM2
  ) {
    extra.push(diagnostic(
      'RH_ROOF_CATCHMENT_CLOSURE_MISMATCH',
      'FAIL',
      coordination.roofCatchments.map((item) => item.id),
      `Roof catchment plan area ${coordination.roofCatchmentTotal} mm² does not close to enclosed plate area ${coordination.enclosedPlateArea} mm².`
    ))
  }
  if (coordination.courtyardOpenSkyArea <= 0) {
    extra.push(diagnostic(
      'RH_COURTYARD_CATCHMENT_INVALID',
      'FAIL',
      [house.court.value.id],
      'Courtyard open-sky catchment area must be positive.'
    ))
  }

  const diagnostics = [...result.diagnostics, ...extra].sort((a, b) => {
    const code = a.code.localeCompare(b.code)
    if (code) return code
    return a.subjectIds.join('|').localeCompare(b.subjectIds.join('|'))
  })

  return {
    ...result,
    status: statusOf(diagnostics),
    diagnostics
  }
}
