import type { PlanBoundaryId } from '../plan-slice/model.js'
import type { ServiceCrossingId } from '../service-slice/model.js'

export type BoundaryTopologyStatus = 'PASS' | 'REVIEW' | 'FAIL'

export type BoundaryRole = 'weather' | 'air' | 'thermal' | 'moisture'
export type BoundaryCarrierKind = 'plan-boundary' | 'roof-field' | 'ground-interface'
export type BoundaryTransitionKind =
  | 'wall-roof'
  | 'wall-ground'
  | 'opening'
  | 'service-penetration'
  | 'threshold'
  | 'rainwater-collection'
  | 'roof-penetration'

export interface BoundaryCarrierSource {
  id: string
  kind: BoundaryCarrierKind
  role: BoundaryRole
  planBoundaryIds: string[]
  label: string
  critical: boolean
  removable: boolean
  provisional: boolean
}

export interface BoundarySystemSource {
  id: string
  role: BoundaryRole
  carrierIds: string[]
  transitionIds: string[]
}

export interface BoundaryTransitionSource {
  id: string
  kind: BoundaryTransitionKind
  carrierIds: string[]
  hostPlanBoundaryId?: string
  openingId?: string
  qualitativeOpeningRelationshipId?: string
  serviceCrossingId?: string
  projectOccurrenceId?: string
  drainageRouteIds?: string[]
  obligations: string[]
  provisional: boolean
}

export interface DrainageRouteSource {
  id: string
  kind: 'roof-field' | 'courtyard-primary' | 'courtyard-emergency'
  from: string
  to: string
  direction: 'outward' | 'service-side'
  visibleFailure: boolean
  concealedPrimaryOutlet: false
  provisional: boolean
}

export interface BoundaryTopologySource {
  fixtureId: string
  planFixtureId: string
  serviceFixtureId: string
  carriers: BoundaryCarrierSource[]
  systems: BoundarySystemSource[]
  transitions: BoundaryTransitionSource[]
  drainageRoutes: DrainageRouteSource[]
}

export interface DerivedBoundarySystem extends BoundarySystemSource {
  connected: boolean
}

export interface DerivedBoundaryOpeningObligation {
  id: string
  openingRefId: string
  openingRefKind: 'numeric' | 'qualitative'
  hostPlanBoundaryId: PlanBoundaryId
  roles: BoundaryRole[]
  obligations: string[]
  provisional: boolean
}

export interface DerivedBoundaryServiceObligation {
  id: string
  serviceCrossingId: ServiceCrossingId
  hostPlanBoundaryId?: PlanBoundaryId
  roles: BoundaryRole[]
  obligations: string[]
  provisional: boolean
}

export interface DerivedBoundaryOccurrenceObligation {
  id: string
  projectOccurrenceId: string
  drainageRouteIds: string[]
  roles: BoundaryRole[]
  obligations: string[]
  provisional: boolean
}

export interface BoundaryTopologyDerived {
  carriers: BoundaryCarrierSource[]
  systems: DerivedBoundarySystem[]
  transitions: BoundaryTransitionSource[]
  drainageRoutes: DrainageRouteSource[]
  openingObligations: DerivedBoundaryOpeningObligation[]
  serviceObligations: DerivedBoundaryServiceObligation[]
  occurrenceObligations: DerivedBoundaryOccurrenceObligation[]
}

export interface BoundaryTopologyDiagnostic {
  code: string
  status: BoundaryTopologyStatus
  subjectIds: string[]
  message: string
}

export interface BoundaryTopologyCompileResult {
  fixtureId: string
  planFixtureId: string
  serviceFixtureId: string
  status: BoundaryTopologyStatus
  derived: BoundaryTopologyDerived
  diagnostics: BoundaryTopologyDiagnostic[]
}
