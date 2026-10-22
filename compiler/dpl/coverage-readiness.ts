import { sha256SemanticFingerprint } from '../core/identity.js'
import {
  loadCanonicalReferenceSiteManifest,
  type ReferenceSiteClaim,
  type ReferenceSiteManifest
} from './canonical.js'
import {
  loadConformanceCoverageRegistry,
  type ConformanceCoverageEntry,
  type LoadedConformanceCoverageRegistry
} from './conformance-coverage.js'
import {
  loadEnglandCoverageRegistry,
  type EnglandCoverageEntry,
  type LoadedEnglandCoverageRegistry
} from './england-coverage.js'
import { loadB2TargetComposition } from './load.js'
import {
  loadNonPlanningCoverageRegistry,
  type LoadedNonPlanningCoverageRegistry,
  type NonPlanningCoverageEntry
} from './nonplanning-coverage.js'
import {
  loadPlanningCoverageRegistry,
  type LoadedPlanningCoverageRegistry,
  type PlanningCoverageEntry
} from './planning-coverage.js'
import { assertBoroughStrategicParent, strategicPlanningTargetId } from './planning-target-identity.js'
import { loadWaveCBoroughTarget, type LoadedWaveCBoroughTarget } from './wavec.js'

export const DPL13B_SCHEMA_VERSION = 'DPL-13B-COVERAGE-READINESS-1' as const

export type CoverageOwner = 'REFERENCE_HOUSE' | 'ENGLAND' | 'PLANNING' | 'NON_PLANNING'
export type ClaimOwner = CoverageOwner | 'SITE_INTERFACE'

export type NormalizedCoverageDisposition =
  | 'DUE_NOW_REPRESENTED'
  | 'DUE_NOW_MISSING'
  | 'FUTURE_DUE'
  | 'DUE_CLASSIFICATION_UNRESOLVED'
  | 'NOT_APPLICABLE_PROVED'
  | 'ADVISORY_NON_BLOCKING'
  | 'ACCELERATION_REVIEW_REQUIRED'

export type ProfileUniverseState =
  | 'PROFILE_UNIVERSE_COMPLETE'
  | 'PROFILE_UNIVERSE_INCOMPLETE'
  | 'PROFILE_DISPOSITION_UNRESOLVED'

export type ConclusionReadinessState =
  | 'READY_FOR_SUBSTANTIVE_AGGREGATION_REVIEW'
  | 'NOT_READY_PROFILE_UNIVERSE_INCOMPLETE'
  | 'NOT_READY_PROFILE_DISPOSITION_UNRESOLVED'

export interface OwnerRegistryIdentity {
  readonly owner: CoverageOwner
  readonly registryId: string
  readonly registryFingerprint: string
  readonly authorityFingerprint: string
}

export interface SiteInterfaceClaimAuthority {
  readonly claimId: string
  readonly owner: 'SITE_INTERFACE'
  readonly authorityId: string
  readonly authoritySource: string
  readonly claimBoundary: string
}

export interface NormalizedCoverageReference {
  readonly owner: CoverageOwner
  readonly ownerEntryId: string
  readonly normalizedDisposition: NormalizedCoverageDisposition
  readonly positiveCompatibilityBlockingWhenDue: boolean
  readonly claimRefs: readonly string[]
  readonly ownerSemantic: Readonly<Record<string, unknown>>
}

export interface ClaimOwnershipReference {
  readonly claimId: string
  readonly state: ReferenceSiteClaim['state']
  readonly basis: ReferenceSiteClaim['basis']
  readonly owners: readonly ClaimOwner[]
  readonly ownerEntryIds: readonly string[]
}

export interface PlanningAuthorityGraph {
  readonly strategicTargetId: string
  readonly localEdges: readonly {
    readonly borough: 'Bromley' | 'Croydon'
    readonly localTargetId: string
    readonly strategicTargetId: string
  }[]
  readonly fingerprint: string
}

export interface ScreeningCoverageReadinessResult {
  readonly schemaVersion: typeof DPL13B_SCHEMA_VERSION
  readonly assuranceProfile: 'SCREENING'
  readonly ownerRegistries: readonly OwnerRegistryIdentity[]
  readonly siteInterfaceClaimAuthorities: readonly SiteInterfaceClaimAuthority[]
  readonly planningAuthorityGraph: PlanningAuthorityGraph
  readonly site: {
    readonly siteId: 'DPL-RS-01'
    readonly manifestId: 'DPL-RS-01-SM-v0.1'
    readonly manifestFingerprint: string
    readonly localPlanningTargetState: 'NO_REAL_BOROUGH_ASSIGNED'
    readonly claimCount: number
    readonly unknownClaimIds: readonly string[]
    readonly assumedClaimIds: readonly string[]
  }
  readonly claimOwnership: readonly ClaimOwnershipReference[]
  readonly uncoveredClaimIds: readonly string[]
  readonly normalizedCoverage: readonly NormalizedCoverageReference[]
  readonly dispositionCounts: Readonly<Record<NormalizedCoverageDisposition, number>>
  readonly profileUniverseState: ProfileUniverseState
  readonly conclusionReadiness: ConclusionReadinessState
  readonly identityFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED'
    readonly substantiveConclusionAggregation: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly architecturalCandidateSelection: 'NOT_IMPLEMENTED'
  }
}

export interface ScreeningCoverageReadinessOverrides {
  readonly conformance?: LoadedConformanceCoverageRegistry
  readonly england?: LoadedEnglandCoverageRegistry
  readonly planning?: LoadedPlanningCoverageRegistry
  readonly nonPlanning?: LoadedNonPlanningCoverageRegistry
  readonly site?: ReferenceSiteManifest
  readonly boroughTargets?: readonly [LoadedWaveCBoroughTarget, LoadedWaveCBoroughTarget]
  readonly siteInterfaceClaimAuthorities?: readonly SiteInterfaceClaimAuthority[]
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const ownerOrder: Readonly<Record<CoverageOwner, number>> = {
  REFERENCE_HOUSE: 0,
  ENGLAND: 1,
  PLANNING: 2,
  NON_PLANNING: 3
}

const canonicalSiteInterfaceClaimAuthorities: readonly SiteInterfaceClaimAuthority[] = [
  {
    claimId: 'RS-FFL-01',
    owner: 'SITE_INTERFACE',
    authorityId: 'DPL-08B:GI-D02-DATUM',
    authoritySource: 'project/dpl/dpl-08b-ground-datum-plinth-approach-interface.md',
    claimBoundary: 'Owns the authored absolute site datum response only; does not prove ground, access, weathering, foundation or whole-site compatibility.'
  }
]

const conformanceDisposition = (entry: ConformanceCoverageEntry): NormalizedCoverageDisposition => {
  switch (entry.screeningCoveragePosture) {
    case 'POSITIVE_CONFORMANCE_REQUIRES_RESOLUTION':
      return 'DUE_NOW_REPRESENTED'
    case 'ADMITTED_ROUTE_ONLY':
      return 'ADVISORY_NON_BLOCKING'
    case 'RESOLVE_IF_INVOKED':
    case 'FUTURE_IMPLEMENTATION_BOUNDARY':
      return 'FUTURE_DUE'
  }
}

const conformanceReference = (entry: ConformanceCoverageEntry): NormalizedCoverageReference => ({
  owner: 'REFERENCE_HOUSE',
  ownerEntryId: entry.id,
  normalizedDisposition: conformanceDisposition(entry),
  positiveCompatibilityBlockingWhenDue: entry.unresolvedBlocksPositiveConformance,
  claimRefs: [],
  ownerSemantic: {
    conformanceClass: entry.conformanceClass,
    resolutionMode: entry.resolutionMode,
    executableStatus: entry.executableStatus,
    screeningCoveragePosture: entry.screeningCoveragePosture,
    canProveSiteIncompatibilityAlone: entry.canProveSiteIncompatibilityAlone
  }
})

const englandReference = (entry: EnglandCoverageEntry): NormalizedCoverageReference => ({
  owner: 'ENGLAND',
  ownerEntryId: entry.id,
  normalizedDisposition: entry.defaultScreeningDisposition,
  positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
  claimRefs: [],
  ownerSemantic: {
    applicabilityClass: entry.applicabilityClass,
    implementationState: entry.implementationState,
    representedTargetIds: canonicalStrings(entry.representedTargetIds),
    resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities),
    accelerationTriggerCount: entry.accelerationTriggers.length
  }
})

const planningReference = (entry: PlanningCoverageEntry): NormalizedCoverageReference => ({
  owner: 'PLANNING',
  ownerEntryId: entry.id,
  normalizedDisposition: entry.defaultScreeningDisposition,
  positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
  claimRefs: canonicalStrings(entry.referenceSiteClaimIds),
  ownerSemantic: {
    sourceClasses: canonicalStrings(entry.sourceClasses),
    applicabilityClass: entry.applicabilityClass,
    resolutionClasses: canonicalStrings(entry.resolutionClasses),
    implementationState: entry.implementationState,
    representedTargetIds: canonicalStrings(entry.representedTargetIds),
    accelerationTriggerCount: entry.accelerationTriggers.length
  }
})

const nonPlanningReference = (entry: NonPlanningCoverageEntry): NormalizedCoverageReference => ({
  owner: 'NON_PLANNING',
  ownerEntryId: entry.id,
  normalizedDisposition: entry.defaultScreeningDisposition,
  positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
  claimRefs: canonicalStrings(entry.referenceSiteClaimIds),
  ownerSemantic: {
    runtimeRepresentationState: entry.runtimeRepresentationState,
    applicabilityInputs: canonicalStrings(entry.applicabilityInputs),
    resolutionAuthorities: canonicalStrings(entry.resolutionAuthorities),
    accelerationTriggerCount: entry.accelerationTriggers.length
  }
})

const opaqueAccelerationReviews = (
  planning: LoadedPlanningCoverageRegistry,
  nonPlanning: LoadedNonPlanningCoverageRegistry,
  site: ReferenceSiteManifest
): NormalizedCoverageReference[] => {
  const claims = new Map(site.claims.map((claim) => [claim.id, claim]))
  const reviewRequired = (claimRefs: readonly string[]): boolean =>
    claimRefs.some((id) => {
      const claim = claims.get(id)
      return claim !== undefined && (claim.state === 'UNKNOWN' || claim.basis === 'ASSUMED' || claim.basis === 'ASSUMED_DEPLOYMENT_DATUM')
    })

  const planningReviews = planning.registry.entries
    .filter((entry) => entry.accelerationTriggers.length > 0 && reviewRequired(entry.referenceSiteClaimIds))
    .map((entry): NormalizedCoverageReference => ({
      owner: 'PLANNING',
      ownerEntryId: `${entry.id}::ACCELERATION_REVIEW`,
      normalizedDisposition: 'ACCELERATION_REVIEW_REQUIRED',
      positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
      claimRefs: canonicalStrings(entry.referenceSiteClaimIds),
      ownerSemantic: {
        sourceEntryId: entry.id,
        triggerKind: 'OPAQUE_OWNER_METADATA_NOT_EXECUTED',
        accelerationTriggerCount: entry.accelerationTriggers.length
      }
    }))

  const nonPlanningReviews = nonPlanning.registry.entries
    .filter((entry) => entry.accelerationTriggers.length > 0 && reviewRequired(entry.referenceSiteClaimIds))
    .map((entry): NormalizedCoverageReference => ({
      owner: 'NON_PLANNING',
      ownerEntryId: `${entry.id}::ACCELERATION_REVIEW`,
      normalizedDisposition: 'ACCELERATION_REVIEW_REQUIRED',
      positiveCompatibilityBlockingWhenDue: entry.positiveCompatibilityBlockingWhenDue,
      claimRefs: canonicalStrings(entry.referenceSiteClaimIds),
      ownerSemantic: {
        sourceEntryId: entry.id,
        triggerKind: 'OPAQUE_OWNER_METADATA_NOT_EXECUTED',
        accelerationTriggerCount: entry.accelerationTriggers.length
      }
    }))

  return [...planningReviews, ...nonPlanningReviews]
}

const canonicalCoverage = (references: readonly NormalizedCoverageReference[]): NormalizedCoverageReference[] =>
  [...references]
    .map((reference) => ({ ...reference, claimRefs: canonicalStrings(reference.claimRefs) }))
    .sort((a, b) => {
      const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
      return byOwner || a.ownerEntryId.localeCompare(b.ownerEntryId) || a.normalizedDisposition.localeCompare(b.normalizedDisposition)
    })

const buildPlanningGraph = (
  boroughTargets: readonly [LoadedWaveCBoroughTarget, LoadedWaveCBoroughTarget]
): PlanningAuthorityGraph => {
  const strategicId = strategicPlanningTargetId(loadB2TargetComposition())
  const localEdges = boroughTargets.map((loaded) => {
    assertBoroughStrategicParent(loaded.target, strategicId)
    return {
      borough: loaded.borough,
      localTargetId: loaded.target.id,
      strategicTargetId: strategicId
    }
  }).sort((a, b) => a.borough.localeCompare(b.borough))

  const manifest = { strategicTargetId: strategicId, localEdges }
  return { ...manifest, fingerprint: sha256SemanticFingerprint(manifest) }
}

const registryIdentities = (
  conformance: LoadedConformanceCoverageRegistry,
  england: LoadedEnglandCoverageRegistry,
  planning: LoadedPlanningCoverageRegistry,
  nonPlanning: LoadedNonPlanningCoverageRegistry
): OwnerRegistryIdentity[] => {
  const identities: OwnerRegistryIdentity[] = [
    {
      owner: 'REFERENCE_HOUSE',
      registryId: conformance.registry.id,
      registryFingerprint: conformance.fingerprint,
      authorityFingerprint: conformance.authorityFingerprint
    },
    {
      owner: 'ENGLAND',
      registryId: england.registry.id,
      registryFingerprint: england.fingerprint,
      authorityFingerprint: england.authoritySetFingerprint
    },
    {
      owner: 'PLANNING',
      registryId: planning.registry.id,
      registryFingerprint: planning.fingerprint,
      authorityFingerprint: planning.authoritySetFingerprint
    },
    {
      owner: 'NON_PLANNING',
      registryId: nonPlanning.registry.id,
      registryFingerprint: nonPlanning.fingerprint,
      authorityFingerprint: nonPlanning.authoritySetFingerprint
    }
  ]
  return identities.sort((a, b) => ownerOrder[a.owner] - ownerOrder[b.owner])
}

const canonicalInterfaceAuthorities = (
  authorities: readonly SiteInterfaceClaimAuthority[]
): SiteInterfaceClaimAuthority[] => [...authorities]
  .map((authority) => ({ ...authority }))
  .sort((a, b) => a.claimId.localeCompare(b.claimId) || a.authorityId.localeCompare(b.authorityId))

const claimOwnership = (
  site: ReferenceSiteManifest,
  coverage: readonly NormalizedCoverageReference[],
  siteInterfaceAuthorities: readonly SiteInterfaceClaimAuthority[]
): ClaimOwnershipReference[] => site.claims
  .map((claim) => {
    const refs = coverage.filter((entry) => entry.claimRefs.includes(claim.id) && entry.normalizedDisposition !== 'ACCELERATION_REVIEW_REQUIRED')
    const interfaceRefs = siteInterfaceAuthorities.filter((authority) => authority.claimId === claim.id)
    return {
      claimId: claim.id,
      state: claim.state,
      basis: claim.basis,
      owners: canonicalStrings([
        ...refs.map((entry) => entry.owner),
        ...interfaceRefs.map((authority) => authority.owner)
      ]) as ClaimOwner[],
      ownerEntryIds: canonicalStrings([
        ...refs.map((entry) => `${entry.owner}:${entry.ownerEntryId}`),
        ...interfaceRefs.map((authority) => `${authority.owner}:${authority.authorityId}`)
      ])
    }
  })
  .sort((a, b) => a.claimId.localeCompare(b.claimId))

const dispositionCounts = (
  coverage: readonly NormalizedCoverageReference[]
): Readonly<Record<NormalizedCoverageDisposition, number>> => {
  const result: Record<NormalizedCoverageDisposition, number> = {
    DUE_NOW_REPRESENTED: 0,
    DUE_NOW_MISSING: 0,
    FUTURE_DUE: 0,
    DUE_CLASSIFICATION_UNRESOLVED: 0,
    NOT_APPLICABLE_PROVED: 0,
    ADVISORY_NON_BLOCKING: 0,
    ACCELERATION_REVIEW_REQUIRED: 0
  }
  for (const entry of coverage) result[entry.normalizedDisposition] += 1
  return result
}

export const composeScreeningCoverageReadiness = (
  overrides: ScreeningCoverageReadinessOverrides = {}
): ScreeningCoverageReadinessResult => {
  const conformance = overrides.conformance ?? loadConformanceCoverageRegistry()
  const england = overrides.england ?? loadEnglandCoverageRegistry()
  const planning = overrides.planning ?? loadPlanningCoverageRegistry()
  const nonPlanning = overrides.nonPlanning ?? loadNonPlanningCoverageRegistry()
  const site = overrides.site ?? loadCanonicalReferenceSiteManifest()
  const boroughTargets = overrides.boroughTargets ?? [loadWaveCBoroughTarget('Bromley'), loadWaveCBoroughTarget('Croydon')]
  const siteInterfaceClaimAuthorities = canonicalInterfaceAuthorities(
    overrides.siteInterfaceClaimAuthorities ?? canonicalSiteInterfaceClaimAuthorities
  )

  if (planning.registry.canonicalFixture.siteId !== site.siteId) {
    throw new Error(`Planning coverage fixture ${planning.registry.canonicalFixture.siteId} does not match canonical site ${site.siteId}.`)
  }
  if (planning.registry.canonicalFixture.localPlanningTargetState !== 'NO_REAL_BOROUGH_ASSIGNED') {
    throw new Error('DPL-13B canonical synthetic fixture must retain NO_REAL_BOROUGH_ASSIGNED.')
  }
  if (planning.registry.canonicalFixture.localPlanningTargetIds.length !== 0) {
    throw new Error('DPL-13B canonical synthetic fixture must not assign a real local planning target.')
  }
  for (const authority of siteInterfaceClaimAuthorities) {
    if (!site.claims.some((claim) => claim.id === authority.claimId)) {
      throw new Error(`Site-interface claim authority ${authority.authorityId} references unknown claim ${authority.claimId}.`)
    }
  }

  const ownerRegistries = registryIdentities(conformance, england, planning, nonPlanning)
  const planningAuthorityGraph = buildPlanningGraph(boroughTargets)
  const normalizedCoverage = canonicalCoverage([
    ...conformance.registry.entries.map(conformanceReference),
    ...england.registry.entries.map(englandReference),
    ...planning.registry.entries.map(planningReference),
    ...nonPlanning.registry.entries.map(nonPlanningReference),
    ...opaqueAccelerationReviews(planning, nonPlanning, site)
  ])
  const ownership = claimOwnership(site, normalizedCoverage, siteInterfaceClaimAuthorities)
  const uncoveredClaimIds = ownership.filter((claim) => claim.owners.length === 0).map((claim) => claim.claimId)
  const counts = dispositionCounts(normalizedCoverage)

  const hasDispositionUncertainty =
    counts.DUE_CLASSIFICATION_UNRESOLVED > 0 || counts.ACCELERATION_REVIEW_REQUIRED > 0
  const profileUniverseState: ProfileUniverseState = uncoveredClaimIds.length > 0
    ? 'PROFILE_UNIVERSE_INCOMPLETE'
    : hasDispositionUncertainty
      ? 'PROFILE_DISPOSITION_UNRESOLVED'
      : 'PROFILE_UNIVERSE_COMPLETE'
  const conclusionReadiness: ConclusionReadinessState = profileUniverseState === 'PROFILE_UNIVERSE_INCOMPLETE'
    ? 'NOT_READY_PROFILE_UNIVERSE_INCOMPLETE'
    : profileUniverseState === 'PROFILE_DISPOSITION_UNRESOLVED'
      ? 'NOT_READY_PROFILE_DISPOSITION_UNRESOLVED'
      : 'READY_FOR_SUBSTANTIVE_AGGREGATION_REVIEW'

  const manifestFingerprint = sha256SemanticFingerprint(site)
  const identityManifest = {
    schemaVersion: DPL13B_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING' as const,
    ownerRegistries,
    siteInterfaceClaimAuthorities,
    planningAuthorityGraph,
    site: {
      siteId: site.siteId,
      manifestId: site.manifestId,
      manifestFingerprint,
      localPlanningTargetState: planning.registry.canonicalFixture.localPlanningTargetState
    },
    claimOwnership: ownership,
    uncoveredClaimIds,
    normalizedCoverage,
    profileUniverseState,
    conclusionReadiness
  }
  const identityFingerprint = sha256SemanticFingerprint(identityManifest)
  const proofBoundary = {
    wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED' as const,
    substantiveConclusionAggregation: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const
  }

  return {
    schemaVersion: DPL13B_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING',
    ownerRegistries,
    siteInterfaceClaimAuthorities,
    planningAuthorityGraph,
    site: {
      siteId: site.siteId,
      manifestId: site.manifestId,
      manifestFingerprint,
      localPlanningTargetState: planning.registry.canonicalFixture.localPlanningTargetState,
      claimCount: site.claims.length,
      unknownClaimIds: site.claims.filter((claim) => claim.state === 'UNKNOWN').map((claim) => claim.id).sort(),
      assumedClaimIds: site.claims
        .filter((claim) => claim.basis === 'ASSUMED' || claim.basis === 'ASSUMED_DEPLOYMENT_DATUM')
        .map((claim) => claim.id)
        .sort()
    },
    claimOwnership: ownership,
    uncoveredClaimIds,
    normalizedCoverage,
    dispositionCounts: counts,
    profileUniverseState,
    conclusionReadiness,
    identityFingerprint,
    resultFingerprint: sha256SemanticFingerprint({ identityFingerprint, dispositionCounts: counts, proofBoundary }),
    proofBoundary
  }
}
