import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { evaluateDeploymentCase } from './evaluate.js'
import type { ReferenceHouseSource } from '../reference-house/model.js'
import {
  loadB2InterfaceContracts,
  loadB2TargetComposition,
  loadInterfaceContract,
  loadTargetSlice
} from './load.js'
import type {
  DeploymentCandidateInput,
  DeploymentCaseInput,
  DeploymentLedger,
  InterfaceContractRef
} from './model.js'

export const DPL13A_SCHEMA_VERSION = 'DPL-13A-1' as const

export type ReferenceSiteClaimBasis =
  | 'ASSUMED'
  | 'ASSUMED_DEPLOYMENT_DATUM'
  | 'DERIVED_SITE_CLAIM'
  | 'UNKNOWN'
export type ReferenceSiteClaimState = 'AUTHORED' | 'UNKNOWN'

export interface ReferenceSiteClaim {
  readonly id: string
  readonly proposition: string
  readonly basis: ReferenceSiteClaimBasis
  readonly basisDetail?: string
  readonly state: ReferenceSiteClaimState
  readonly precision?: string
  readonly value?: unknown
  readonly unknownComponents?: readonly string[]
}

export interface ReferenceSiteManifest {
  readonly schemaVersion: 'dpl.referenceSiteManifest.v1'
  readonly siteId: 'DPL-RS-01'
  readonly manifestId: 'DPL-RS-01-SM-v0.1'
  readonly manifestRevision: '0.1'
  readonly siteKind: 'SYNTHETIC_REFERENCE'
  readonly authoritySource: string
  readonly authorityBoundary: string
  readonly coordinateFrame: {
    readonly origin: string
    readonly xPositive: string
    readonly yPositive: string
    readonly zDatum: string
    readonly geographicNorth: string
  }
  readonly parcel: {
    readonly southWestMm: readonly [number, number]
    readonly southEastMm: readonly [number, number]
    readonly northEastMm: readonly [number, number]
    readonly northWestMm: readonly [number, number]
    readonly widthMm: number
    readonly depthMm: number
    readonly derivedAreaM2: number
    readonly streetEdge: string
    readonly rearGarden: string
  }
  readonly housePlacement: {
    readonly referenceHouseHandedness: 'UNMIRRORED'
    readonly variantRoute: 'RH-V02'
    readonly rotationDeg: 180
    readonly boundingBoxMm: {
      readonly west: number
      readonly east: number
      readonly south: number
      readonly north: number
    }
    readonly derivedClearancesMm: {
      readonly westTechnicalServiceSide: number
      readonly eastPrincipalSide: number
      readonly northFrontSetback: number
      readonly southRearGarden: number
    }
    readonly modelToSiteTransform: {
      readonly siteX: string
      readonly siteY: string
    }
    readonly groundFflSiteZMm: number
  }
  readonly claims: readonly ReferenceSiteClaim[]
}

export type CoverageClassification =
  | 'RUNTIME_REPRESENTED'
  | 'SITE_CLAIM_ONLY'
  | 'KNOWN_RUNTIME_GAP'
  | 'FUTURE_DUE_WHERE_ESTABLISHED'
  | 'DUE_CLASSIFICATION_NOT_ESTABLISHED'

export interface CanonicalCoverageEntry {
  readonly id: string
  readonly classification: CoverageClassification
  readonly owner: string
  readonly subject: string
  readonly representedBy?: readonly string[]
  readonly claimRefs?: readonly string[]
  readonly boundary?: string
}

export interface CanonicalCoverageManifest {
  readonly schemaVersion: 'dpl.canonicalCoverageManifest.v1'
  readonly id: 'DPL-13A-COVERAGE-v1'
  readonly assuranceProfile: 'SCREENING'
  readonly authoritySources: readonly string[]
  readonly coverageCompleteness: 'NOT_ESTABLISHED'
  readonly conclusionReadiness: 'NOT_ESTABLISHED'
  readonly entries: readonly CanonicalCoverageEntry[]
}

export interface CanonicalAuthoredCandidate {
  readonly input: DeploymentCandidateInput
  readonly placement: ReferenceSiteManifest['housePlacement']
  readonly authoredPlacementClaimId: 'RS-HOUSE-XFORM-01'
  readonly fingerprint: string
}

export interface CanonicalCaseIdentityManifest {
  readonly schemaVersion: typeof DPL13A_SCHEMA_VERSION
  readonly assuranceProfile: 'SCREENING'
  readonly referenceHouseSourceFingerprint: string
  readonly siteManifestId: string
  readonly siteManifestFingerprint: string
  readonly siteAuthorityFingerprint: string
  readonly canonicalCandidateFingerprint: string
  readonly deploymentCaseFingerprint: string
  readonly coverageManifestId: string
  readonly coverageManifestFingerprint: string
  readonly coverageAuthoritySetFingerprint: string
  readonly interfaceIds: readonly string[]
  readonly targetIds: readonly string[]
  readonly localBoroughTarget: 'NOT_ASSIGNED_SYNTHETIC_REFERENCE'
  readonly methodVersion: typeof DPL13A_SCHEMA_VERSION
}

export interface CanonicalReferenceSiteCompile {
  readonly schemaVersion: typeof DPL13A_SCHEMA_VERSION
  readonly canonicalCaseIdentity: {
    readonly algorithm: 'sha256'
    readonly fingerprint: string
    readonly manifest: CanonicalCaseIdentityManifest
  }
  readonly site: {
    readonly manifest: ReferenceSiteManifest
    readonly fingerprint: string
    readonly authorityFingerprint: string
    readonly authoredClaimIds: readonly string[]
    readonly unknownClaimIds: readonly string[]
  }
  readonly authoredCandidate: CanonicalAuthoredCandidate
  readonly deploymentLedger: DeploymentLedger
  readonly coverage: {
    readonly manifest: CanonicalCoverageManifest
    readonly fingerprint: string
    readonly authoritySetFingerprint: string
  }
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED'
    readonly conclusionReadiness: 'NOT_ESTABLISHED'
    readonly coverageCompleteness: 'NOT_ESTABLISHED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly architecturalCandidateSelection: 'NOT_IMPLEMENTED'
    readonly localBoroughTarget: 'NOT_ASSIGNED_SYNTHETIC_REFERENCE'
  }
}

export interface CanonicalCompileOverrides {
  readonly siteManifest?: ReferenceSiteManifest
  readonly coverageManifest?: CanonicalCoverageManifest
  readonly candidateInput?: DeploymentCandidateInput
  readonly placement?: ReferenceSiteManifest['housePlacement']
  readonly interfaces?: readonly InterfaceContractRef[]
  readonly targets?: DeploymentCaseInput['targets']
}

const siteManifestPath = 'project/dpl/reference-site/dpl-rs-01-v01.json'
const coverageManifestPath = 'project/dpl/reference-site/dpl-13a-coverage-v1.json'

const expectedClaimIds = [
  'RS-PARCEL-01',
  'RS-FRAME-01',
  'RS-STREET-01',
  'RS-HOUSE-XFORM-01',
  'RS-SIDES-01',
  'RS-GARDENS-01',
  'RS-TOPO-01',
  'RS-FFL-01',
  'RS-ACCESS-01',
  'RS-NBR-W-01',
  'RS-NBR-E-01',
  'RS-NBR-OPEN-01',
  'RS-TREE-01',
  'RS-TREE-ROOT-01',
  'RS-GROUND-01',
  'RS-SEWER-STREET-01',
  'RS-SEWER-DETAIL-01',
  'RS-SW-01',
  'RS-UTIL-E-01',
  'RS-UTIL-W-01',
  'RS-UTIL-T-01',
  'RS-UTIL-CAP-01',
  'RS-HERITAGE-01',
  'RS-TITLE-CONTROL-01',
  'RS-TITLE-DETAIL-01',
  'RS-FLOOD-01',
  'RS-NOISE-01',
  'RS-ECO-01',
  'RS-CONST-01'
] as const

const requiredCoverageIds = [
  'COV-RH-CONFORMANCE-BOUNDED',
  'COV-IF-08B',
  'COV-IF-08C',
  'COV-ENG-09B',
  'COV-ENG-09C',
  'COV-LON-10B',
  'COV-RS01-CLAIMS',
  'COV-RH-CONFORMANCE-OPEN',
  'COV-DPL11-TITLE-BOUNDARY',
  'COV-DPL11-PRIVATE-RIGHTS',
  'COV-DPL11-PARTY-WALL-NEIGHBOUR',
  'COV-DPL11-SEWER-UNDERTAKER',
  'COV-DPL11-UTILITIES',
  'COV-DPL11-GROUND',
  'COV-DPL11-PHYSICAL-WATER-FLOOD',
  'COV-DPL11-CONSTRUCTION-LOGISTICS',
  'COV-ENGLAND-TARGET-COMPLETENESS',
  'COV-LOCAL-BOROUGH-TARGET',
  'COV-CLAIM-OBLIGATION-MAPPING',
  'COV-ROUTE-EXHAUSTION'
] as const

const allowedCoverageClassifications = new Set<CoverageClassification>([
  'RUNTIME_REPRESENTED',
  'SITE_CLAIM_ONLY',
  'KNOWN_RUNTIME_GAP',
  'FUTURE_DUE_WHERE_ESTABLISHED',
  'DUE_CLASSIFICATION_NOT_ESTABLISHED'
])

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const expectRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`)
  }
  return value
}

const canonicalStringArray = (values: readonly string[] | undefined): string[] | undefined =>
  values ? [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b)) : undefined

const canonicalClaims = (claims: readonly ReferenceSiteClaim[]): ReferenceSiteClaim[] =>
  [...claims]
    .map((claim) => ({
      ...claim,
      unknownComponents: canonicalStringArray(claim.unknownComponents)
    }))
    .sort((a, b) => compareDplIdentityStrings(a.id, b.id))

const canonicalCoverageEntries = (
  entries: readonly CanonicalCoverageEntry[]
): CanonicalCoverageEntry[] =>
  [...entries]
    .map((entry) => ({
      ...entry,
      representedBy: canonicalStringArray(entry.representedBy),
      claimRefs: canonicalStringArray(entry.claimRefs)
    }))
    .sort((a, b) => compareDplIdentityStrings(a.id, b.id))

const canonicalizeSiteManifest = (manifest: ReferenceSiteManifest): ReferenceSiteManifest => ({
  ...manifest,
  coordinateFrame: { ...manifest.coordinateFrame },
  parcel: {
    ...manifest.parcel,
    southWestMm: [...manifest.parcel.southWestMm] as [number, number],
    southEastMm: [...manifest.parcel.southEastMm] as [number, number],
    northEastMm: [...manifest.parcel.northEastMm] as [number, number],
    northWestMm: [...manifest.parcel.northWestMm] as [number, number]
  },
  housePlacement: {
    ...manifest.housePlacement,
    boundingBoxMm: { ...manifest.housePlacement.boundingBoxMm },
    derivedClearancesMm: { ...manifest.housePlacement.derivedClearancesMm },
    modelToSiteTransform: { ...manifest.housePlacement.modelToSiteTransform }
  },
  claims: canonicalClaims(manifest.claims)
})

const canonicalizeCoverageManifest = (
  manifest: CanonicalCoverageManifest
): CanonicalCoverageManifest => ({
  ...manifest,
  authoritySources: canonicalStringArray(manifest.authoritySources) ?? [],
  entries: canonicalCoverageEntries(manifest.entries)
})

const validateSiteManifest = (value: unknown, path: string): ReferenceSiteManifest => {
  const raw = expectRecord(value, `Reference Site manifest ${path}`)
  if (raw.schemaVersion !== 'dpl.referenceSiteManifest.v1') {
    throw new Error(`Unsupported Reference Site manifest schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.siteId !== 'DPL-RS-01' || raw.manifestId !== 'DPL-RS-01-SM-v0.1') {
    throw new Error(`Reference Site manifest ${path} has unexpected canonical identity.`)
  }
  if (raw.manifestRevision !== '0.1' || raw.siteKind !== 'SYNTHETIC_REFERENCE') {
    throw new Error(`Reference Site manifest ${path} has unexpected revision/site kind.`)
  }
  expectString(raw.authoritySource, `Reference Site manifest ${path} authoritySource`)
  expectString(raw.authorityBoundary, `Reference Site manifest ${path} authorityBoundary`)
  if ('borough' in raw) {
    throw new Error(`Reference Site manifest ${path} must not fabricate a real borough.`)
  }
  if (!Array.isArray(raw.claims)) throw new Error(`Reference Site manifest ${path} claims must be an array.`)

  const ids = new Set<string>()
  for (const [index, claimValue] of raw.claims.entries()) {
    const claim = expectRecord(claimValue, `Reference Site manifest ${path} claims[${index}]`)
    const id = expectString(claim.id, `Reference Site manifest ${path} claims[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate Reference Site claim ${id} at ${path}.`)
    ids.add(id)
    expectString(claim.proposition, `Reference Site manifest ${path} claims[${index}].proposition`)
    const state = expectString(claim.state, `Reference Site manifest ${path} claims[${index}].state`)
    const basis = expectString(claim.basis, `Reference Site manifest ${path} claims[${index}].basis`)
    if (state !== 'AUTHORED' && state !== 'UNKNOWN') {
      throw new Error(`Reference Site claim ${id} has unsupported state ${state}.`)
    }
    if (!['ASSUMED', 'ASSUMED_DEPLOYMENT_DATUM', 'DERIVED_SITE_CLAIM', 'UNKNOWN'].includes(basis)) {
      throw new Error(`Reference Site claim ${id} has unsupported basis ${basis}.`)
    }
    if (state === 'UNKNOWN' && basis !== 'UNKNOWN') {
      throw new Error(`Reference Site claim ${id} is UNKNOWN but has non-UNKNOWN basis ${basis}.`)
    }
    if (state === 'AUTHORED' && basis === 'UNKNOWN') {
      throw new Error(`Reference Site claim ${id} is authored but has UNKNOWN basis.`)
    }
  }

  for (const id of expectedClaimIds) {
    if (!ids.has(id)) throw new Error(`Reference Site manifest ${path} is missing DPL-07 claim ${id}.`)
  }
  if (ids.size !== expectedClaimIds.length) {
    throw new Error(`Reference Site manifest ${path} contains claims outside the frozen DPL-07 v0.1 register.`)
  }

  const manifest = canonicalizeSiteManifest(raw as unknown as ReferenceSiteManifest)
  if (
    manifest.parcel.widthMm !== 17400 ||
    manifest.parcel.depthMm !== 30000 ||
    manifest.parcel.derivedAreaM2 !== 522
  ) {
    throw new Error(`Reference Site manifest ${path} does not preserve DPL-07 parcel geometry.`)
  }
  const placement = manifest.housePlacement
  if (
    placement.referenceHouseHandedness !== 'UNMIRRORED' ||
    placement.variantRoute !== 'RH-V02' ||
    placement.rotationDeg !== 180 ||
    placement.boundingBoxMm.west !== 3000 ||
    placement.boundingBoxMm.east !== 15000 ||
    placement.boundingBoxMm.south !== 14000 ||
    placement.boundingBoxMm.north !== 24800
  ) {
    throw new Error(`Reference Site manifest ${path} does not preserve the authored DPL-07 house placement.`)
  }

  return manifest
}

const validateCoverageManifest = (value: unknown, path: string): CanonicalCoverageManifest => {
  const raw = expectRecord(value, `Coverage manifest ${path}`)
  if (raw.schemaVersion !== 'dpl.canonicalCoverageManifest.v1') {
    throw new Error(`Unsupported canonical coverage schema ${String(raw.schemaVersion)} at ${path}.`)
  }
  if (raw.id !== 'DPL-13A-COVERAGE-v1' || raw.assuranceProfile !== 'SCREENING') {
    throw new Error(`Coverage manifest ${path} has unexpected identity/profile.`)
  }
  if (raw.coverageCompleteness !== 'NOT_ESTABLISHED' || raw.conclusionReadiness !== 'NOT_ESTABLISHED') {
    throw new Error(`Coverage manifest ${path} must fail closed on completeness/readiness.`)
  }
  if (!Array.isArray(raw.authoritySources) || !Array.isArray(raw.entries)) {
    throw new Error(`Coverage manifest ${path} requires authoritySources and entries arrays.`)
  }

  const ids = new Set<string>()
  for (const [index, entryValue] of raw.entries.entries()) {
    const entry = expectRecord(entryValue, `Coverage manifest ${path} entries[${index}]`)
    const id = expectString(entry.id, `Coverage manifest ${path} entries[${index}].id`)
    if (ids.has(id)) throw new Error(`Duplicate coverage entry ${id} at ${path}.`)
    ids.add(id)
    expectString(entry.owner, `Coverage manifest ${path} entries[${index}].owner`)
    expectString(entry.subject, `Coverage manifest ${path} entries[${index}].subject`)
    const classification = expectString(
      entry.classification,
      `Coverage manifest ${path} entries[${index}].classification`
    ) as CoverageClassification
    if (!allowedCoverageClassifications.has(classification)) {
      throw new Error(`Coverage entry ${id} has unsupported classification ${classification}.`)
    }
  }

  for (const id of requiredCoverageIds) {
    if (!ids.has(id)) throw new Error(`Coverage manifest ${path} is missing required gap/represented family ${id}.`)
  }

  for (const [index, source] of raw.authoritySources.entries()) {
    expectString(source, `Coverage manifest ${path} authoritySources[${index}]`)
  }

  return canonicalizeCoverageManifest(raw as unknown as CanonicalCoverageManifest)
}

const authorityFingerprint = (path: string): string =>
  sha256DplSemanticFingerprint({ path, content: readText(path) })

const authoritySetFingerprint = (paths: readonly string[]): string =>
  sha256DplSemanticFingerprint(
    [...paths]
      .sort((a, b) => compareDplIdentityStrings(a, b))
      .map((path) => ({ path, fingerprint: authorityFingerprint(path) }))
  )

export const loadCanonicalReferenceSiteManifest = (
  path = siteManifestPath
): ReferenceSiteManifest => validateSiteManifest(readJson(path), path)

export const loadCanonicalCoverageManifest = (
  path = coverageManifestPath
): CanonicalCoverageManifest => validateCoverageManifest(readJson(path), path)

const createCandidateInput = (
  site: ReferenceSiteManifest,
  source: ReferenceHouseSource = createReferenceHouseSource()
): DeploymentCandidateInput => {
  return {
    id: 'DPL-13A-CANONICAL-RS01-CANDIDATE',
    revision: '1',
    authoredSource: {
      id: 'DPL-07:DPL-RS-01:RS-HOUSE-XFORM-01',
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

export const createCanonicalReferenceSiteCandidate = (
  site: ReferenceSiteManifest = loadCanonicalReferenceSiteManifest(),
  candidateInput: DeploymentCandidateInput = createCandidateInput(site),
  placement: ReferenceSiteManifest['housePlacement'] = site.housePlacement
): CanonicalAuthoredCandidate => {
  const canonicalPlacement = {
    ...placement,
    boundingBoxMm: { ...placement.boundingBoxMm },
    derivedClearancesMm: { ...placement.derivedClearancesMm },
    modelToSiteTransform: { ...placement.modelToSiteTransform }
  }
  const manifest = {
    input: candidateInput,
    placement: canonicalPlacement,
    authoredPlacementClaimId: 'RS-HOUSE-XFORM-01' as const
  }
  return {
    ...manifest,
    fingerprint: sha256DplSemanticFingerprint(manifest)
  }
}

export const loadCanonicalInterfaces = (): readonly InterfaceContractRef[] => [
  ...loadB2InterfaceContracts(),
  loadInterfaceContract(
    'DPL-08C-FOUL-SURFACE-SITE-WATER',
    'project/dpl/dpl-08c-foul-surface-site-water-interface.md'
  )
]

export const loadCanonicalTargets = (): DeploymentCaseInput['targets'] => [
  ...loadB2TargetComposition(),
  loadTargetSlice(
    'project/dpl/targets/england-drainage-waste-water-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  )
]

const runtimeSite = (
  site: ReferenceSiteManifest,
  siteFingerprint: string
): DeploymentCaseInput['site'] => ({
  indexEntry: {
    id: site.siteId,
    displayName: 'DPL-RS-01 Synthetic Reference Site',
    borough: 'SYNTHETIC_REFERENCE_NO_BOROUGH',
    record: siteManifestPath,
    primaryIdentityBasis: `${site.manifestId} / ${site.siteKind}; synthetic DPL-07 authority only`,
    challengeTags: ['SYNTHETIC_REFERENCE', 'CANONICAL_DPL_FIXTURE', 'NO_REAL_BOROUGH'],
    decisionCriticalUnknowns: []
  },
  recordPath: siteManifestPath,
  recordText: JSON.stringify(site),
  recordFingerprint: siteFingerprint,
  indexEntryFingerprint: sha256DplSemanticFingerprint({
    siteId: site.siteId,
    manifestId: site.manifestId,
    manifestRevision: site.manifestRevision,
    siteKind: site.siteKind,
    authoritySource: site.authoritySource,
    noRealBorough: true
  })
})

/** A captured evidence set. Evaluation never consults cwd or reloads authority files. */
export interface CanonicalReferenceSiteEvidence {
  readonly referenceHouseSource: ReferenceHouseSource
  readonly site: ReferenceSiteManifest
  readonly coverage: CanonicalCoverageManifest
  readonly authoredCandidate: CanonicalAuthoredCandidate
  readonly interfaces: readonly InterfaceContractRef[]
  readonly targets: DeploymentCaseInput['targets']
  readonly siteAuthorityFingerprint: string
  readonly coverageAuthoritySetFingerprint: string
}

export const loadCanonicalReferenceSiteEvidence = (
  overrides: CanonicalCompileOverrides = {}
): CanonicalReferenceSiteEvidence => {
  const referenceHouseSource = createReferenceHouseSource()
  const site = canonicalizeSiteManifest(overrides.siteManifest ?? loadCanonicalReferenceSiteManifest())
  const coverage = canonicalizeCoverageManifest(overrides.coverageManifest ?? loadCanonicalCoverageManifest())
  return {
    referenceHouseSource, site, coverage,
    authoredCandidate: createCanonicalReferenceSiteCandidate(
      site, overrides.candidateInput ?? createCandidateInput(site, referenceHouseSource), overrides.placement ?? site.housePlacement
    ),
    interfaces: overrides.interfaces ?? loadCanonicalInterfaces(),
    targets: overrides.targets ?? loadCanonicalTargets(),
    siteAuthorityFingerprint: authorityFingerprint(site.authoritySource),
    coverageAuthoritySetFingerprint: authoritySetFingerprint(coverage.authoritySources)
  }
}

export const compileCanonicalReferenceSiteCase = (
  overrides: CanonicalCompileOverrides = {}
): CanonicalReferenceSiteCompile => evaluateCanonicalReferenceSiteCase(loadCanonicalReferenceSiteEvidence(overrides))

export const evaluateCanonicalReferenceSiteCase = (
  evidence: CanonicalReferenceSiteEvidence
): CanonicalReferenceSiteCompile => {
  const { referenceHouseSource, authoredCandidate, interfaces, targets, siteAuthorityFingerprint, coverageAuthoritySetFingerprint } = evidence
  const site = canonicalizeSiteManifest(evidence.site)
  const coverage = canonicalizeCoverageManifest(evidence.coverage)
  const siteFingerprint = sha256DplSemanticFingerprint(site)
  const coverageFingerprint = sha256DplSemanticFingerprint(coverage)

  if (targets.some(({ target }) => /CROYDON|BROMLEY/i.test(target.id))) {
    throw new Error('DPL-13A canonical synthetic Reference Site must not fabricate a local borough target.')
  }
  if (!targets.some(({ authorityClass }) => authorityClass === 'LONDON_STRATEGIC_PLANNING')) {
    throw new Error('DPL-13A canonical case requires the London strategic planning target.')
  }

  const deploymentLedger = evaluateDeploymentCase({
    assuranceProfile: 'SCREENING',
    site: runtimeSite(site, siteFingerprint),
    interfaceContracts: interfaces,
    targets,
    candidate: authoredCandidate.input
  }, referenceHouseSource)

  const canonicalInterfaceIds = deploymentLedger.caseIdentity.manifest.interfaceContracts
    .map((item) => item.id)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const canonicalTargetIds = deploymentLedger.caseIdentity.manifest.targets
    .map((item) => item.targetId)
    .sort((a, b) => compareDplIdentityStrings(a, b))

  const identityManifest: CanonicalCaseIdentityManifest = {
    schemaVersion: DPL13A_SCHEMA_VERSION,
    assuranceProfile: 'SCREENING',
    referenceHouseSourceFingerprint: deploymentLedger.caseIdentity.manifest.referenceHouseSourceFingerprint,
    siteManifestId: site.manifestId,
    siteManifestFingerprint: siteFingerprint,
    siteAuthorityFingerprint,
    canonicalCandidateFingerprint: authoredCandidate.fingerprint,
    deploymentCaseFingerprint: deploymentLedger.caseIdentity.fingerprint,
    coverageManifestId: coverage.id,
    coverageManifestFingerprint: coverageFingerprint,
    coverageAuthoritySetFingerprint,
    interfaceIds: canonicalInterfaceIds,
    targetIds: canonicalTargetIds,
    localBoroughTarget: 'NOT_ASSIGNED_SYNTHETIC_REFERENCE',
    methodVersion: DPL13A_SCHEMA_VERSION
  }
  const canonicalCaseFingerprint = sha256DplSemanticFingerprint(identityManifest)
  const proofBoundary = {
    wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED' as const,
    conclusionReadiness: 'NOT_ESTABLISHED' as const,
    coverageCompleteness: 'NOT_ESTABLISHED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    architecturalCandidateSelection: 'NOT_IMPLEMENTED' as const,
    localBoroughTarget: 'NOT_ASSIGNED_SYNTHETIC_REFERENCE' as const
  }
  const authoredClaimIds = site.claims
    .filter((claim) => claim.state === 'AUTHORED')
    .map((claim) => claim.id)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const unknownClaimIds = site.claims
    .filter((claim) => claim.state === 'UNKNOWN')
    .map((claim) => claim.id)
    .sort((a, b) => compareDplIdentityStrings(a, b))

  const resultManifest = {
    schemaVersion: DPL13A_SCHEMA_VERSION,
    canonicalCaseFingerprint,
    siteManifestFingerprint: siteFingerprint,
    siteAuthorityFingerprint,
    canonicalCandidateFingerprint: authoredCandidate.fingerprint,
    deploymentResultFingerprint: deploymentLedger.resultFingerprint,
    coverageManifestFingerprint: coverageFingerprint,
    coverageAuthoritySetFingerprint,
    authoredClaimIds,
    unknownClaimIds,
    proofBoundary
  }

  return {
    schemaVersion: DPL13A_SCHEMA_VERSION,
    canonicalCaseIdentity: {
      algorithm: 'sha256',
      fingerprint: canonicalCaseFingerprint,
      manifest: identityManifest
    },
    site: {
      manifest: site,
      fingerprint: siteFingerprint,
      authorityFingerprint: siteAuthorityFingerprint,
      authoredClaimIds,
      unknownClaimIds
    },
    authoredCandidate,
    deploymentLedger,
    coverage: {
      manifest: coverage,
      fingerprint: coverageFingerprint,
      authoritySetFingerprint: coverageAuthoritySetFingerprint
    },
    resultFingerprint: sha256DplSemanticFingerprint(resultManifest),
    proofBoundary
  }
}
