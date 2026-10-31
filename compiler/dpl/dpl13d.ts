import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import {
  compileCanonicalReferenceSiteCase,
  createCanonicalReferenceSiteCandidate,
  loadCanonicalInterfaces,
  loadCanonicalTargets,
  type CanonicalReferenceSiteCompile,
  type ReferenceSiteManifest
} from './canonical.js'
import { compileDeploymentCase } from './compile.js'
import {
  composeScreeningCoverageReadiness,
  type ClaimOwnershipReference,
  type ConclusionReadinessState,
  type CoverageOwner,
  type NormalizedCoverageDisposition,
  type NormalizedCoverageReference,
  type ProfileUniverseState,
  type ScreeningCoverageReadinessResult
} from './coverage-readiness.js'
import type { DeploymentCandidateInput } from './model.js'
import { assertBoroughStrategicParent, strategicPlanningTargetId } from './planning-target-identity.js'
import { loadWaveCBoroughTarget } from './wavec.js'

export const DPL13D_SCHEMA_VERSION = 'DPL-13D-SECOND-SYNTHETIC-1' as const
export const DPL13D_SITE_ID = 'DPL-RS-02' as const
export const DPL13D_SITE_MANIFEST_ID = 'DPL-RS-02-SM-v0.1' as const
export const DPL13D_SITE_PATH = 'project/dpl/reference-site/dpl-rs-02-v01.json' as const
export const DPL13D_LOCAL_TARGET_ID = 'CROYDON-LOCAL-PLANNING-2018-2026-10-21' as const
export const DPL13D_LOCAL_BOROUGH = 'Croydon' as const

export type SyntheticLocalPlanningContext =
  | {
      readonly state: 'NO_REAL_BOROUGH_ASSIGNED'
      readonly targetIds: readonly []
    }
  | {
      readonly state: 'CONTROLLED_BOROUGH_ASSIGNED'
      readonly targetIds: readonly [string]
    }

export type SyntheticReferenceSiteManifest = Omit<ReferenceSiteManifest, 'siteId' | 'manifestId'> & {
  readonly siteId: string
  readonly manifestId: string
}

export type ReboundScreeningCoverageReadiness = Omit<ScreeningCoverageReadinessResult, 'site'> & {
  readonly site: {
    readonly siteId: string
    readonly manifestId: string
    readonly manifestFingerprint: string
    readonly localPlanningTargetState: SyntheticLocalPlanningContext['state']
    readonly localPlanningTargetIds: readonly string[]
    readonly claimCount: number
    readonly unknownClaimIds: readonly string[]
    readonly assumedClaimIds: readonly string[]
  }
}

export interface DPL13DSecondFixtureResult {
  readonly schemaVersion: typeof DPL13D_SCHEMA_VERSION
  readonly site: SyntheticReferenceSiteManifest
  readonly canonicalCase: CanonicalReferenceSiteCompile
  readonly readiness: ReboundScreeningCoverageReadiness
  readonly changedClassificationKeys: readonly string[]
  readonly identityFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const ownerOrder: Readonly<Record<CoverageOwner, number>> = {
  REFERENCE_HOUSE: 0,
  ENGLAND: 1,
  PLANNING: 2,
  NON_PLANNING: 3
}

const canonicalCoverage = (
  references: readonly NormalizedCoverageReference[]
): NormalizedCoverageReference[] => [...references]
  .map((reference) => ({ ...reference, claimRefs: canonicalStrings(reference.claimRefs) }))
  .sort((a, b) => {
    const byOwner = ownerOrder[a.owner] - ownerOrder[b.owner]
    return byOwner || a.ownerEntryId.localeCompare(b.ownerEntryId) || a.normalizedDisposition.localeCompare(b.normalizedDisposition)
  })

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

const expectSyntheticManifest = (value: unknown, path: string): SyntheticReferenceSiteManifest => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path} must contain an object.`)
  const manifest = value as SyntheticReferenceSiteManifest
  if (manifest.schemaVersion !== 'dpl.referenceSiteManifest.v1') throw new Error(`${path} has unsupported site schema.`)
  if (manifest.siteId !== DPL13D_SITE_ID || manifest.manifestId !== DPL13D_SITE_MANIFEST_ID) {
    throw new Error(`${path} has unexpected DPL-13D site identity.`)
  }
  if (manifest.siteKind !== 'SYNTHETIC_REFERENCE' || manifest.manifestRevision !== '0.1') {
    throw new Error(`${path} must remain a v0.1 synthetic reference site.`)
  }
  if (!Array.isArray(manifest.claims) || manifest.claims.length !== 29) {
    throw new Error(`${path} must preserve the 29-claim DPL reference-site vocabulary.`)
  }
  const ids = manifest.claims.map((claim) => claim.id)
  if (new Set(ids).size !== ids.length) throw new Error(`${path} contains duplicate site-claim ids.`)

  const baselineIds = compileCanonicalReferenceSiteCase().site.manifest.claims.map((claim) => claim.id).sort()
  if (JSON.stringify([...ids].sort()) !== JSON.stringify(baselineIds)) {
    throw new Error(`${path} must preserve the exact DPL-RS-01 claim-id vocabulary for the generalisation experiment.`)
  }
  return manifest
}

export const loadDPL13DReferenceSiteManifest = (
  path = DPL13D_SITE_PATH
): SyntheticReferenceSiteManifest => expectSyntheticManifest(readJson(path), path)

const createSecondFixtureCandidateInput = (site: SyntheticReferenceSiteManifest): DeploymentCandidateInput => {
  const source = createReferenceHouseSource()
  return {
    id: 'DPL-13D-CANONICAL-RS02-CANDIDATE',
    revision: '1',
    authoredSource: {
      id: 'DPL-13D:DPL-RS-02:RS-HOUSE-XFORM-01',
      revision: site.manifestRevision
    },
    referenceHouseSourceFingerprint: referenceHouseSourceFingerprint(source),
    facts: {
      courtyardOpenToSky: true,
      shellWidthMm: Number(source.shell.width.value),
      shellDepthMm: Number(source.shell.depth.value),
      courtyardWidthMm: Number(source.court.value.width),
      courtyardDepthMm: Number(source.court.value.depth),
      courtyardPlacement: source.court.value.placement,
      storeys: 2,
      stairRiserCount: source.stair.riseTopology.value.riserCount,
      stairFlightRiseGroups: [...source.stair.riseTopology.value.flightRiseGroups],
      stairGoingMm: Number(source.stair.goingTopology.value.going),
      frontBayCount: source.frontField.value.count,
      frontBaySpacingMm: Number(source.frontField.value.spacing),
      entranceBayIndex: source.entranceBay.value.bayIndex
    },
    variantSelections: ['RH-V02']
  }
}

const authorityFingerprint = (path: string): string =>
  sha256SemanticFingerprint({ path, content: readText(path) })

export const compileDPL13DSecondFixtureCase = (
  site: SyntheticReferenceSiteManifest = loadDPL13DReferenceSiteManifest()
): CanonicalReferenceSiteCompile => {
  const baseline = compileCanonicalReferenceSiteCase()
  const siteFingerprint = sha256SemanticFingerprint(site)
  const candidateInput = createSecondFixtureCandidateInput(site)
  const authoredCandidate = createCanonicalReferenceSiteCandidate(
    site as unknown as ReferenceSiteManifest,
    candidateInput,
    site.housePlacement
  )
  const boroughTarget = loadWaveCBoroughTarget(DPL13D_LOCAL_BOROUGH)
  const baseTargets = loadCanonicalTargets()
  const strategicId = strategicPlanningTargetId(baseTargets)
  assertBoroughStrategicParent(boroughTarget.target, strategicId)
  if (boroughTarget.target.id !== DPL13D_LOCAL_TARGET_ID) {
    throw new Error(`DPL-13D expected Croydon target ${DPL13D_LOCAL_TARGET_ID}; got ${boroughTarget.target.id}.`)
  }
  const targets = [...baseTargets, boroughTarget.runtimeTarget]
  const recordText = JSON.stringify(site)
  const deploymentLedger = compileDeploymentCase({
    assuranceProfile: 'SCREENING',
    site: {
      indexEntry: {
        id: site.siteId,
        displayName: 'DPL-RS-02 Synthetic Croydon Generalisation Site',
        borough: DPL13D_LOCAL_BOROUGH,
        record: DPL13D_SITE_PATH,
        primaryIdentityBasis: `${site.manifestId} / ${site.siteKind}; synthetic DPL-13D authority only`,
        challengeTags: ['SYNTHETIC_REFERENCE', 'DPL_13D_GENERALISATION', 'CONTROLLED_CROYDON_TARGET'],
        decisionCriticalUnknowns: []
      },
      recordPath: DPL13D_SITE_PATH,
      recordText,
      recordFingerprint: siteFingerprint,
      indexEntryFingerprint: sha256SemanticFingerprint({
        siteId: site.siteId,
        manifestId: site.manifestId,
        manifestRevision: site.manifestRevision,
        siteKind: site.siteKind,
        borough: DPL13D_LOCAL_BOROUGH,
        localTargetId: DPL13D_LOCAL_TARGET_ID
      })
    },
    interfaceContracts: loadCanonicalInterfaces(),
    targets,
    candidate: candidateInput
  })

  const interfaceIds = deploymentLedger.caseIdentity.manifest.interfaceContracts
    .map((item) => item.id)
    .sort((a, b) => a.localeCompare(b))
  const targetIds = deploymentLedger.caseIdentity.manifest.targets
    .map((item) => item.targetId)
    .sort((a, b) => a.localeCompare(b))
  const siteAuthorityFingerprint = authorityFingerprint(site.authoritySource)
  const identityManifest = {
    schemaVersion: DPL13D_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING' as const,
    referenceHouseSourceFingerprint: deploymentLedger.caseIdentity.manifest.referenceHouseSourceFingerprint,
    siteManifestId: site.manifestId,
    siteManifestFingerprint: siteFingerprint,
    siteAuthorityFingerprint,
    canonicalCandidateFingerprint: authoredCandidate.fingerprint,
    deploymentCaseFingerprint: deploymentLedger.caseIdentity.fingerprint,
    coverageManifestId: baseline.coverage.manifest.id,
    coverageManifestFingerprint: baseline.coverage.fingerprint,
    coverageAuthoritySetFingerprint: baseline.coverage.authoritySetFingerprint,
    interfaceIds,
    targetIds,
    localBoroughTarget: DPL13D_LOCAL_TARGET_ID,
    methodVersion: DPL13D_SCHEMA_VERSION
  }
  const canonicalCaseFingerprint = sha256SemanticFingerprint(identityManifest)
  const authoredClaimIds = site.claims.filter((claim) => claim.state === 'AUTHORED').map((claim) => claim.id).sort()
  const unknownClaimIds = site.claims.filter((claim) => claim.state === 'UNKNOWN').map((claim) => claim.id).sort()
  const proofBoundary = {
    wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED' as const,
    conclusionReadiness: 'NOT_ESTABLISHED' as const,
    coverageCompleteness: 'NOT_ESTABLISHED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const,
    localBoroughTarget: DPL13D_LOCAL_TARGET_ID
  }
  const resultFingerprint = sha256SemanticFingerprint({
    schemaVersion: DPL13D_SCHEMA_VERSION,
    canonicalCaseFingerprint,
    siteManifestFingerprint: siteFingerprint,
    siteAuthorityFingerprint,
    canonicalCandidateFingerprint: authoredCandidate.fingerprint,
    deploymentResultFingerprint: deploymentLedger.resultFingerprint,
    coverageManifestFingerprint: baseline.coverage.fingerprint,
    coverageAuthoritySetFingerprint: baseline.coverage.authoritySetFingerprint,
    authoredClaimIds,
    unknownClaimIds,
    proofBoundary
  })

  return {
    schemaVersion: baseline.schemaVersion,
    canonicalCaseIdentity: {
      algorithm: 'sha256',
      fingerprint: canonicalCaseFingerprint,
      manifest: identityManifest as unknown as CanonicalReferenceSiteCompile['canonicalCaseIdentity']['manifest']
    },
    site: {
      manifest: site as unknown as ReferenceSiteManifest,
      fingerprint: siteFingerprint,
      authorityFingerprint: siteAuthorityFingerprint,
      authoredClaimIds,
      unknownClaimIds
    },
    authoredCandidate,
    deploymentLedger,
    coverage: baseline.coverage,
    resultFingerprint,
    proofBoundary: proofBoundary as unknown as CanonicalReferenceSiteCompile['proofBoundary']
  }
}

const representedTargetIds = (entry: NormalizedCoverageReference): readonly string[] => {
  const value = entry.ownerSemantic.representedTargetIds
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value as string[] : []
}

const reboundBaseDisposition = (
  entry: NormalizedCoverageReference,
  context: SyntheticLocalPlanningContext
): NormalizedCoverageDisposition => {
  if (
    entry.owner !== 'PLANNING' ||
    entry.ownerSemantic.applicabilityClass !== 'LOCAL_AUTHORITY_DEPENDENT' ||
    context.state !== 'CONTROLLED_BOROUGH_ASSIGNED'
  ) {
    return entry.normalizedDisposition
  }
  const selected = context.targetIds[0]
  return representedTargetIds(entry).includes(selected) ? 'DUE_NOW_REPRESENTED' : 'DUE_NOW_MISSING'
}

export const rebindScreeningCoverageReadinessToSyntheticContext = (
  site: SyntheticReferenceSiteManifest,
  context: SyntheticLocalPlanningContext,
  base: ScreeningCoverageReadinessResult = composeScreeningCoverageReadiness()
): ReboundScreeningCoverageReadiness => {
  if (context.state === 'CONTROLLED_BOROUGH_ASSIGNED') {
    const selected = context.targetIds[0]
    const edge = base.planningAuthorityGraph.localEdges.find((candidate) => candidate.localTargetId === selected)
    if (!edge) throw new Error(`Synthetic planning context selects uncontrolled local target ${selected}.`)
    if (edge.strategicTargetId !== base.planningAuthorityGraph.strategicTargetId) {
      throw new Error(`Synthetic local target ${selected} does not preserve the controlled strategic parent edge.`)
    }
  }

  const claims = new Map(site.claims.map((claim) => [claim.id, claim]))
  const baseCoverage = base.normalizedCoverage.filter((entry) => entry.normalizedDisposition !== 'ACCELERATION_REVIEW_REQUIRED')
  const reboundBase = baseCoverage.map((entry): NormalizedCoverageReference => ({
    ...entry,
    normalizedDisposition: reboundBaseDisposition(entry, context),
    claimRefs: canonicalStrings(entry.claimRefs),
    ownerSemantic: { ...entry.ownerSemantic }
  }))
  const accelerationReviews = base.normalizedCoverage
    .filter((entry) => entry.normalizedDisposition === 'ACCELERATION_REVIEW_REQUIRED')
    .map((entry): NormalizedCoverageReference => ({
      ...entry,
      claimRefs: canonicalStrings(entry.claimRefs),
      ownerSemantic: { ...entry.ownerSemantic }
    }))
  const normalizedCoverage = canonicalCoverage([...reboundBase, ...accelerationReviews])

  const claimOwnership: ClaimOwnershipReference[] = base.claimOwnership.map((ownership) => {
    const claim = claims.get(ownership.claimId)
    if (!claim) throw new Error(`Synthetic site ${site.siteId} is missing owner-covered claim ${ownership.claimId}.`)
    return {
      ...ownership,
      state: claim.state,
      basis: claim.basis,
      owners: [...ownership.owners],
      ownerEntryIds: [...ownership.ownerEntryIds]
    }
  })
  const uncoveredClaimIds = claimOwnership.filter((claim) => claim.owners.length === 0).map((claim) => claim.claimId)
  const counts = dispositionCounts(normalizedCoverage)
  const hasDispositionUncertainty = counts.DUE_CLASSIFICATION_UNRESOLVED > 0 || counts.ACCELERATION_REVIEW_REQUIRED > 0
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
  const siteView = {
    siteId: site.siteId,
    manifestId: site.manifestId,
    manifestFingerprint,
    localPlanningTargetState: context.state,
    localPlanningTargetIds: [...context.targetIds].sort(),
    claimCount: site.claims.length,
    unknownClaimIds: site.claims.filter((claim) => claim.state === 'UNKNOWN').map((claim) => claim.id).sort(),
    assumedClaimIds: site.claims
      .filter((claim) => claim.basis === 'ASSUMED' || claim.basis === 'ASSUMED_DEPLOYMENT_DATUM')
      .map((claim) => claim.id)
      .sort()
  }
  const identityManifest = {
    schemaVersion: DPL13D_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING' as const,
    ownerRegistries: base.ownerRegistries,
    siteInterfaceClaimAuthorities: base.siteInterfaceClaimAuthorities,
    planningAuthorityGraph: base.planningAuthorityGraph,
    site: siteView,
    claimOwnership,
    uncoveredClaimIds,
    normalizedCoverage,
    profileUniverseState,
    conclusionReadiness
  }
  const identityFingerprint = sha256SemanticFingerprint(identityManifest)
  const proofBoundary = { ...base.proofBoundary }

  return {
    ...base,
    site: siteView,
    claimOwnership,
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

export const composeDPL13DSecondFixture = (): DPL13DSecondFixtureResult => {
  const site = loadDPL13DReferenceSiteManifest()
  const canonicalCase = compileDPL13DSecondFixtureCase(site)
  const readiness = rebindScreeningCoverageReadinessToSyntheticContext(site, {
    state: 'CONTROLLED_BOROUGH_ASSIGNED',
    targetIds: [DPL13D_LOCAL_TARGET_ID]
  })
  const baselineReadiness = composeScreeningCoverageReadiness()
  const baselineByKey = new Map(
    baselineReadiness.normalizedCoverage.map((entry) => [`${entry.owner}:${entry.ownerEntryId}`, entry.normalizedDisposition])
  )
  const changedClassificationKeys = readiness.normalizedCoverage
    .filter((entry) => baselineByKey.get(`${entry.owner}:${entry.ownerEntryId}`) !== entry.normalizedDisposition)
    .map((entry) => `${entry.owner}:${entry.ownerEntryId}`)
    .sort()

  return {
    schemaVersion: DPL13D_SCHEMA_VERSION,
    site,
    canonicalCase,
    readiness,
    changedClassificationKeys,
    identityFingerprint: sha256SemanticFingerprint({
      schemaVersion: DPL13D_SCHEMA_VERSION,
      siteFingerprint: canonicalCase.site.fingerprint,
      canonicalCaseFingerprint: canonicalCase.canonicalCaseIdentity.fingerprint,
      readinessIdentityFingerprint: readiness.identityFingerprint,
      changedClassificationKeys
    })
  }
}
