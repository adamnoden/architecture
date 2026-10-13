import type { Millimetres } from '../units.js'

export type ServiceTopologyStatus = 'PASS' | 'REVIEW' | 'FAIL'

export type ServiceClass =
  | 'utility-water'
  | 'utility-electricity'
  | 'communications'
  | 'foul'
  | 'domestic-water'
  | 'electrical-data'
  | 'hydronic'
  | 'mvhr-supply'
  | 'mvhr-extract'
  | 'mvhr-outdoor-air'
  | 'mvhr-exhaust-air'
  | 'cooker-extract'
  | 'heat-pump-link'
  | 'pv-electrical'

export type ServiceNodeKind =
  | 'external-source'
  | 'external-destination'
  | 'plant'
  | 'equipment'
  | 'riser'
  | 'distribution-hub'
  | 'terminal'
  | 'inspection-point'

export type ServiceRouteRole =
  | 'entry'
  | 'primary'
  | 'vertical-trunk'
  | 'distribution'
  | 'local-branch'
  | 'boundary-link'
  | 'vent'

export type ServiceAccessKind =
  | 'working'
  | 'replacement'
  | 'inspection'
  | 'isolation'
  | 'filter-service'

export interface ServiceNodeSource {
  id: string
  kind: ServiceNodeKind
  label: string
  hostSpaceIds: string[]
  requiredAccessKinds: ServiceAccessKind[]
  coordinationEnvelope?: {
    width: Millimetres
    depth: Millimetres
    structuralInterruptionId: string
  }
  provisional: boolean
}

export interface ServiceRouteSource {
  id: string
  networkId: string
  serviceClass: ServiceClass
  fromNodeId: string
  toNodeId: string
  role: ServiceRouteRole
  hostSpaceIds: string[]
  crossingIds: string[]
  primaryInfrastructure: boolean
  structuralInteraction: 'none' | 'declared-crossing'
  provisional: boolean
}

export interface ServiceNetworkSource {
  id: string
  label: string
  serviceClasses: ServiceClass[]
  requiredNodeIds: string[]
  routeIds: string[]
}

export type ServiceCrossingHost =
  | { kind: 'plan-boundary'; boundaryId: string }
  | { kind: 'structural-interruption'; interruptionId: string }
  | { kind: 'external-handoff'; description: string }

export interface ServiceCrossingSource {
  id: string
  occurrenceId: string
  selected: boolean
  routeIds: string[]
  host: ServiceCrossingHost
  bearingLineId?: string
  obligations: string[]
  provisional: boolean
}

export interface ServiceAccessSource {
  id: string
  targetNodeId: string
  kind: ServiceAccessKind
  viaSpaceIds: string[]
  external: boolean
}

export interface ServiceTopologySource {
  fixtureId: string
  planFixtureId: string
  structuralFixtureId: string
  protectedPrimaryFreeSpaceIds: string[]
  nodes: ServiceNodeSource[]
  routes: ServiceRouteSource[]
  networks: ServiceNetworkSource[]
  crossings: ServiceCrossingSource[]
  access: ServiceAccessSource[]
}

export interface DerivedServiceNetwork {
  id: string
  label: string
  serviceClasses: ServiceClass[]
  requiredNodeIds: string[]
  routeIds: string[]
  connected: boolean
}

export interface DerivedServiceBearingCrossingObligation {
  id: string
  crossingId: string
  planBoundaryId: string
  structuralLineId: string
  proof: 'EXTERNAL-STRUCTURAL-OPENING-AND-BEARING'
  provisional: boolean
}

export interface ServiceTopologyDerived {
  nodes: ServiceNodeSource[]
  routes: ServiceRouteSource[]
  networks: DerivedServiceNetwork[]
  crossings: ServiceCrossingSource[]
  access: ServiceAccessSource[]
  bearingCrossings: DerivedServiceBearingCrossingObligation[]
  selectedCrossingIds: string[]
  serviceClasses: ServiceClass[]
}

export interface ServiceTopologyDiagnostic {
  code: string
  status: ServiceTopologyStatus
  subjectIds: string[]
  message: string
}

export interface ServiceTopologyCompileResult {
  fixtureId: string
  planFixtureId: string
  structuralFixtureId: string
  status: ServiceTopologyStatus
  derived: ServiceTopologyDerived
  diagnostics: ServiceTopologyDiagnostic[]
}
