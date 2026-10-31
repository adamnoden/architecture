import type { PlanSliceCompileResult } from '../plan-slice/model.js'
import type { ReferenceHouseCoordinationSource } from '../reference-house/model.js'
import type { ServiceTopologyCompileResult } from '../service-slice/model.js'
import type {
  BoundaryCarrierSource,
  BoundaryRole,
  BoundaryTopologySource,
  BoundaryTransitionSource,
  DrainageRouteSource
} from '../boundary-slice/model.js'

const roles: BoundaryRole[] = ['weather', 'air', 'thermal', 'moisture']

const roleCode = (role: BoundaryRole): string => ({
  weather: 'WEA',
  air: 'AIR',
  thermal: 'THM',
  moisture: 'MOI'
})[role]

const carrierId = (role: BoundaryRole, family: 'OUTER' | 'COURT' | 'ROOF' | 'GROUND'): string =>
  `${roleCode(role)}-${family}`

const interfaceObligations = [
  'WEATHER-SHEDDING-AND-DRAINAGE',
  'AIR-CONTINUITY',
  'THERMAL-CONTINUITY',
  'MOISTURE-DRAINAGE-AND-DRYING',
  'REINSTATEMENT-INDEPENDENT-OF-DECORATIVE-TRIM'
]

const familyForBoundary = (
  plan: PlanSliceCompileResult,
  boundaryId: string
): 'OUTER' | 'COURT' | undefined => {
  const boundary = plan.derived.boundaries.find((item) => item.id === boundaryId)
  if (boundary?.kind === 'outer') return 'OUTER'
  if (boundary?.kind === 'courtyard') return 'COURT'
  return undefined
}

const carriers = (plan: PlanSliceCompileResult): BoundaryCarrierSource[] => {
  const outer = plan.derived.boundaries.filter((item) => item.kind === 'outer').map((item) => item.id)
  const court = plan.derived.boundaries.filter((item) => item.kind === 'courtyard').map((item) => item.id)

  return roles.flatMap((role) => {
    const labels: Record<'OUTER' | 'COURT' | 'ROOF' | 'GROUND', string> = {
      OUTER: role === 'weather'
        ? 'outer masonry weathering / drained-cavity boundary'
        : role === 'air'
          ? 'outer-wall room-side air-control boundary'
          : role === 'thermal'
            ? 'outer-wall insulated boundary'
            : 'outer-wall wetting / drainage / drying strategy',
      COURT: role === 'weather'
        ? 'courtyard masonry weathering / drained-cavity boundary'
        : role === 'air'
          ? 'courtyard-wall room-side air-control boundary'
          : role === 'thermal'
            ? 'courtyard-wall insulated boundary'
            : 'courtyard-wall wetting / drainage / drying strategy',
      ROOF: `${role} roof boundary — technical build-up remains external`,
      GROUND: `${role} ground-interface handoff — technical build-up remains external`
    }
    return [
      { id: carrierId(role, 'OUTER'), kind: 'plan-boundary' as const, role, planBoundaryIds: outer, label: labels.OUTER, critical: true, removable: false, provisional: true },
      { id: carrierId(role, 'COURT'), kind: 'plan-boundary' as const, role, planBoundaryIds: court, label: labels.COURT, critical: true, removable: false, provisional: true },
      { id: carrierId(role, 'ROOF'), kind: 'roof-field' as const, role, planBoundaryIds: [], label: labels.ROOF, critical: true, removable: false, provisional: true },
      { id: carrierId(role, 'GROUND'), kind: 'ground-interface' as const, role, planBoundaryIds: [], label: labels.GROUND, critical: true, removable: false, provisional: true }
    ]
  })
}

const backboneTransitions = (): BoundaryTransitionSource[] =>
  roles.flatMap((role) => [
    {
      id: `INT-${roleCode(role)}-OUTER-ROOF`,
      kind: 'wall-roof' as const,
      carrierIds: [carrierId(role, 'OUTER'), carrierId(role, 'ROOF')],
      obligations: [`${role.toUpperCase()}-CONTINUITY-AT-OUTER-WALL-ROOF`],
      provisional: true
    },
    {
      id: `INT-${roleCode(role)}-COURT-ROOF`,
      kind: 'wall-roof' as const,
      carrierIds: [carrierId(role, 'COURT'), carrierId(role, 'ROOF')],
      obligations: [`${role.toUpperCase()}-CONTINUITY-AT-COURTYARD-WALL-ROOF`],
      provisional: true
    },
    {
      id: `INT-${roleCode(role)}-OUTER-GROUND`,
      kind: 'wall-ground' as const,
      carrierIds: [carrierId(role, 'OUTER'), carrierId(role, 'GROUND')],
      obligations: [`${role.toUpperCase()}-CONTINUITY-AT-OUTER-WALL-GROUND`],
      provisional: true
    },
    {
      id: `INT-${roleCode(role)}-COURT-GROUND`,
      kind: 'wall-ground' as const,
      carrierIds: [carrierId(role, 'COURT'), carrierId(role, 'GROUND')],
      obligations: [`${role.toUpperCase()}-CONTINUITY-AT-COURTYARD-WALL-GROUND`],
      provisional: true
    }
  ])

const openingTransitions = (
  house: ReferenceHouseCoordinationSource,
  plan: PlanSliceCompileResult
): BoundaryTransitionSource[] => {
  const numeric = plan.derived.openings.flatMap((opening) => {
    const family = familyForBoundary(plan, opening.hostBoundaryId)
    if (!family) return []
    const isCourtThreshold = opening.levelId === 'GROUND' && opening.role === 'major-opening' && family === 'COURT'
    return [{
      id: `INT-OPEN-${opening.id}`,
      kind: isCourtThreshold ? 'threshold' as const : 'opening' as const,
      carrierIds: roles.map((role) => carrierId(role, family)),
      hostPlanBoundaryId: opening.hostBoundaryId,
      openingId: opening.id,
      obligations: [
        ...interfaceObligations,
        ...(isCourtThreshold ? ['THRESHOLD-DRAINAGE-MOVEMENT-AND-ACCESSIBILITY'] : []),
        'PERMANENT-OPENING-REPLACEABLE-FRAME-SEQUENCE'
      ],
      provisional: opening.provisional
    }]
  })

  const qualitative = house.qualitativeOpeningRelationships.flatMap((relationship) => {
    const family = familyForBoundary(plan, relationship.hostBoundaryId)
    if (!family) return []
    return [{
      id: `INT-QOPEN-${relationship.id}`,
      kind: 'opening' as const,
      carrierIds: roles.map((role) => carrierId(role, family)),
      hostPlanBoundaryId: relationship.hostBoundaryId,
      qualitativeOpeningRelationshipId: relationship.id,
      obligations: [
        ...interfaceObligations,
        'GEOMETRY-REMAINS-QUALITATIVE-UNTIL-ARCHITECTURALLY-CONTROLLED'
      ],
      provisional: true
    }]
  })

  return [...numeric, ...qualitative]
}

const serviceTransitions = (
  plan: PlanSliceCompileResult,
  services: ServiceTopologyCompileResult
): BoundaryTransitionSource[] => services.derived.crossings.flatMap<BoundaryTransitionSource>((crossing): BoundaryTransitionSource[] => {
  if (!crossing.selected) return []

  if (crossing.host.kind === 'plan-boundary') {
    const family = familyForBoundary(plan, crossing.host.boundaryId)
    if (!family) return []
    return [{
      id: `INT-SVC-${crossing.id}`,
      kind: 'service-penetration',
      carrierIds: roles.map((role) => carrierId(role, family)),
      hostPlanBoundaryId: crossing.host.boundaryId,
      serviceCrossingId: crossing.id,
      obligations: [
        'WEATHER-REINSTATEMENT',
        'AIR-REINSTATEMENT',
        'THERMAL-TREATMENT',
        'MOISTURE-WATER-PEST-TREATMENT',
        'MAINTAINABLE-RESEAL-AND-INSPECTION'
      ],
      provisional: crossing.provisional
    }]
  }

  if (crossing.id === 'PEN-SV-RF-01' || crossing.id === 'PEN-PV-01') {
    return [{
      id: `INT-ROOF-SVC-${crossing.id}`,
      kind: 'roof-penetration',
      carrierIds: roles.map((role) => carrierId(role, 'ROOF')),
      serviceCrossingId: crossing.id,
      obligations: [
        'ROOF-WEATHERING-REINSTATEMENT',
        'ROOF-AIR-THERMAL-CONTINUITY',
        'MOISTURE-DRAINAGE-AND-INSPECTION',
        'ACCESSIBLE-FLASHING-AND-RENEWAL'
      ],
      provisional: crossing.provisional
    }]
  }

  if (crossing.id === 'PEN-FD-01') {
    return [{
      id: `INT-GROUND-SVC-${crossing.id}`,
      kind: 'service-penetration',
      carrierIds: roles.map((role) => carrierId(role, 'GROUND')),
      serviceCrossingId: crossing.id,
      obligations: [
        'GROUND-MOISTURE-AND-GAS-SEAL',
        'AIR-THERMAL-CONTINUITY',
        'SETTLEMENT-TOLERANCE',
        'RODDING-AND-REINSTATEMENT-ACCESS'
      ],
      provisional: crossing.provisional
    }]
  }

  return []
})

const courtyardDrainageCrossing = (): BoundaryTransitionSource => ({
  id: 'INT-RW-PEN-CD-01',
  kind: 'rainwater-collection',
  carrierIds: roles.map((role) => carrierId(role, 'GROUND')),
  projectOccurrenceId: 'PEN-CD-01',
  drainageRouteIds: ['RW-COURT-PRIMARY', 'RW-COURT-EMERGENCY'],
  obligations: [
    'FOUNDATION-AND-SLAB-LOAD-PATH-COORDINATION',
    'SETTLEMENT-TOLERANCE',
    'MOISTURE-GAS-PEST-SEAL',
    'RODDING-AND-ACCESS',
    'THRESHOLD-AND-OVERFLOW-LEVEL-COORDINATION',
    'PRIMARY-AND-EMERGENCY-ROUTES-REMAIN-INDEPENDENT',
    'NO-HIDDEN-MAINTAINABLE-JOINT-BENEATH-PRINCIPAL-ROOM'
  ],
  provisional: true
})

const drainageRoutes = (): DrainageRouteSource[] => [
  { id: 'RW-ROOF-SOUTH', kind: 'roof-field', from: 'south roof field', to: 'outer south collection edge / corner returns', direction: 'outward', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true },
  { id: 'RW-ROOF-NORTH', kind: 'roof-field', from: 'north roof field', to: 'outer north collection edge / corner returns', direction: 'outward', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true },
  { id: 'RW-ROOF-WEST', kind: 'roof-field', from: 'west roof field', to: 'outer west collection edge / corner returns', direction: 'outward', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true },
  { id: 'RW-ROOF-EAST', kind: 'roof-field', from: 'east roof field', to: 'outer east collection edge / corner returns', direction: 'outward', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true },
  { id: 'RW-COURT-PRIMARY', kind: 'courtyard-primary', from: 'courtyard surface / east-side removable-grate collector', to: 'external east/service inspection point', direction: 'service-side', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true },
  { id: 'RW-COURT-EMERGENCY', kind: 'courtyard-emergency', from: 'higher-level independent courtyard overflow inlet', to: 'visible above-ground east/service outlet', direction: 'service-side', visibleFailure: true, concealedPrimaryOutlet: false, provisional: true }
]

export const createReferenceHouseBoundarySource = (
  house: ReferenceHouseCoordinationSource,
  plan: PlanSliceCompileResult,
  services: ServiceTopologyCompileResult
): BoundaryTopologySource => {
  const sourceCarriers = carriers(plan)
  const transitions = [
    ...backboneTransitions(),
    ...openingTransitions(house, plan),
    ...serviceTransitions(plan, services),
    courtyardDrainageCrossing()
  ]

  return {
    fixtureId: 'RH-C4-REFERENCE-HOUSE-BOUNDARIES',
    planFixtureId: plan.fixtureId,
    serviceFixtureId: services.fixtureId,
    carriers: sourceCarriers,
    systems: roles.map((role) => {
      const ownCarriers = sourceCarriers.filter((carrier) => carrier.role === role).map((carrier) => carrier.id)
      const ownCarrierSet = new Set(ownCarriers)
      return {
        id: `BND-${roleCode(role)}-01`,
        role,
        carrierIds: ownCarriers,
        transitionIds: transitions
          .filter((transition) => transition.carrierIds.some((id) => ownCarrierSet.has(id)))
          .map((transition) => transition.id)
      }
    }),
    transitions,
    drainageRoutes: drainageRoutes()
  }
}

export const cloneReferenceHouseBoundarySource = (
  source: BoundaryTopologySource
): BoundaryTopologySource => structuredClone(source)
