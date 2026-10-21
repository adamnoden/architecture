export const DPL12A_SCHEMA_VERSION = 'DPL-12A-1' as const

export const assuranceProfiles = [
  'SCREENING',
  'FEASIBILITY',
  'PLANNING_CASE',
  'TECHNICAL_DESIGN',
  'CONSTRUCTION',
  'COMMISSIONED_AS_BUILT'
] as const

export type AssuranceProfile = (typeof assuranceProfiles)[number]

export const obligationResults = [
  'PASS',
  'EXTERNALLY_DISCHARGED',
  'FAIL',
  'UNSUPPORTED',
  'UNRESOLVED',
  'NOT_APPLICABLE',
  'WARNING',
  'SUPERSEDED'
] as const

export type ObligationResult = (typeof obligationResults)[number]

export const evidenceStates = [
  'PLANNED',
  'PRESENT',
  'ACCEPTED',
  'REJECTED',
  'STALE',
  'SUPERSEDED',
  'WITHDRAWN'
] as const

export type EvidenceState = (typeof evidenceStates)[number]

export type ApplicabilityState = 'APPLIES' | 'NOT_APPLICABLE' | 'UNRESOLVED'

export type TargetAuthorityClass =
  | 'ENGLAND_BUILDING_CONTROL'
  | 'LONDON_STRATEGIC_PLANNING'

export type MethodKind =
  | 'NATIVE_DETERMINISTIC'
  | 'EXTERNAL_PROFESSIONAL_EVIDENCE'
  | 'EXTERNAL_EVIDENCE_AND_INSPECTION'
  | 'EXTERNAL_PLANNING_OR_ARCHITECTURAL_JUDGEMENT'
  | 'EXTERNAL_PLANNING_OR_INCLUSIVE_DESIGN_JUDGEMENT'
  | 'EXTERNAL_PLANNING_DETERMINATION'
  | 'UNSUPPORTED'

export interface RawMethodClass {
  readonly id: string
  readonly kind: string
  readonly claimBoundary?: string
}

export interface RawSourceSnapshot {
  readonly id: string
  readonly sourceClass?: string
  readonly title?: string
  readonly status?: string
  readonly publicationStatus?: string
  readonly canonicalSource?: string
  readonly retrievedAt?: string
  readonly [key: string]: unknown
}

export interface RawObligation {
  readonly id: string
  readonly sourceSnapshot: string
  readonly sourceProvision?: string
  readonly title: string
  readonly applicability: string
  readonly applicabilityMethod?: string
  readonly resolutionMethod: string
  readonly defaultResultAtCurrentDPLEvidence?: string
  readonly requiredInputs?: readonly string[]
  readonly deterministicApplicabilityRule?: {
    readonly input: string
    readonly true: string
    readonly false: string
    readonly unknown: string
  }
  readonly deterministicRule?: string
  readonly crossTargetOutput?: string
  readonly [key: string]: unknown
}

export interface RawTargetSlice {
  readonly schemaVersion: string
  readonly id: string
  readonly methodClasses: readonly RawMethodClass[]
  readonly sourceSnapshots: readonly RawSourceSnapshot[]
  readonly obligations: readonly RawObligation[]
  readonly spaceTable?: readonly {
    readonly bedrooms: number
    readonly bedspaces: number
    readonly storeys: number
    readonly minGIA: number
    readonly minBuiltInStorage: number
    readonly minGIAWithShowerInsteadOfBathroom?: number
  }[]
  readonly [key: string]: unknown
}

export interface PilotSiteIndexEntry {
  readonly id: string
  readonly displayName: string
  readonly borough: string
  readonly record: string
  readonly primaryIdentityBasis: string
  readonly challengeTags: readonly string[]
  readonly decisionCriticalUnknowns: readonly string[]
}

export interface PilotSiteIndex {
  readonly schemaVersion: string
  readonly assuranceProfile: string
  readonly sites: readonly PilotSiteIndexEntry[]
}

export interface LoadedPilotSite {
  readonly indexEntry: PilotSiteIndexEntry
  readonly recordPath: string
  readonly recordText: string
  readonly recordFingerprint: string
  readonly indexEntryFingerprint: string
}

export interface InterfaceContractRef {
  readonly id: string
  readonly path: string
  readonly semanticFingerprint: string
}

export interface EvidenceItem {
  readonly id: string
  readonly version: string
  readonly state: EvidenceState
  readonly dischargesObligationIds?: readonly string[]
  readonly sourceRefs?: readonly string[]
}

export type ProposalFacts = Readonly<Record<string, unknown>>

export interface DeploymentCaseInput {
  readonly assuranceProfile: AssuranceProfile
  readonly site: LoadedPilotSite
  readonly interfaceContracts: readonly InterfaceContractRef[]
  readonly targets: readonly {
    readonly authorityClass: TargetAuthorityClass
    readonly target: RawTargetSlice
  }[]
  readonly proposalFacts?: ProposalFacts
  readonly evidence?: readonly EvidenceItem[]
}

export interface ApplicabilityResolution {
  readonly state: ApplicabilityState
  readonly reason: string
  readonly missingFactIds: readonly string[]
}

export interface DeploymentObligationLedgerEntry {
  readonly targetId: string
  readonly authorityClass: TargetAuthorityClass
  readonly obligationId: string
  readonly sourceSnapshotId: string
  readonly sourceProvision?: string
  readonly title: string
  readonly methodId: string
  readonly methodKind: MethodKind
  readonly applicability: ApplicabilityResolution
  readonly result: ObligationResult
  readonly resultReason: string
  readonly requiredInputs: readonly string[]
  readonly missingInputs: readonly string[]
  readonly evidenceIds: readonly string[]
  readonly crossTargetOutput?: string
}

export interface CrossTargetEdge {
  readonly fromTargetId: string
  readonly fromObligationId: string
  readonly output: string
  readonly state: 'RESOLVED' | 'UNRESOLVED'
  readonly value?: unknown
  readonly reason: string
}

export interface DeploymentCaseIdentityManifest {
  readonly schemaVersion: typeof DPL12A_SCHEMA_VERSION
  readonly referenceHouseSourceFingerprint: string
  readonly assuranceProfile: AssuranceProfile
  readonly site: {
    readonly id: string
    readonly indexEntryFingerprint: string
    readonly recordFingerprint: string
  }
  readonly interfaceContracts: readonly InterfaceContractRef[]
  readonly targets: readonly {
    readonly authorityClass: TargetAuthorityClass
    readonly targetId: string
    readonly targetFingerprint: string
  }[]
  readonly proposalFactsFingerprint: string
  readonly evidenceSetFingerprint: string
  readonly methodVersion: typeof DPL12A_SCHEMA_VERSION
}

export interface DeploymentLedger {
  readonly schemaVersion: typeof DPL12A_SCHEMA_VERSION
  readonly caseIdentity: {
    readonly algorithm: 'sha256'
    readonly fingerprint: string
    readonly manifest: DeploymentCaseIdentityManifest
  }
  readonly site: {
    readonly id: string
    readonly displayName: string
    readonly borough: string
    readonly primaryIdentityBasis: string
    readonly decisionCriticalUnknowns: readonly string[]
    readonly recordFingerprint: string
  }
  readonly targetComposition: readonly {
    readonly authorityClass: TargetAuthorityClass
    readonly targetId: string
  }[]
  readonly obligations: readonly DeploymentObligationLedgerEntry[]
  readonly crossTargetEdges: readonly CrossTargetEdge[]
  readonly unresolvedInputs: readonly string[]
  readonly evidence: readonly EvidenceItem[]
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED'
    readonly architecturalCandidateSelection: 'NOT_IMPLEMENTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
  }
}
