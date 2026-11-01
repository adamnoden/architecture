import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { compileDeploymentCase } from './compile.js'
import {
  obligationResults,
  type CandidateConformanceResult,
  type DeploymentCandidateInput,
  type DeploymentLedger,
  type LoadedPilotSite,
  type ObligationResult,
  type ProposalFacts
} from './model.js'
import {
  loadWaveCBoroughTarget,
  loadWaveCInterfaceContracts,
  loadWaveCTargetComposition
} from './wavec.js'

export const DPL_T5_SCHEMA_VERSION = 'DPL-T5-LENNARD-REAL-CONTROL-1' as const
export const DPL_T5_MANIFEST_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-runtime-manifest-v01.json' as const
export const DPL_T5_CANDIDATE_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json' as const
export const DPL_T5_VERIFICATION_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-verification-v01.json' as const
export const DPL_T5_CONTROL_ID = 'DPL-T-CONTROL-004' as const
export const DPL_T5_CANDIDATE_ID = 'DPL-T-CANDIDATE-004-01' as const
export const DPL_T5_VERIFICATION_FINGERPRINT =
  '0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc' as const
export const DPL_T5_BROMLEY_TARGET_ID =
  'BROMLEY-LOCAL-PLANNING-2019-2026-10-22' as const
export const DPL_T5_LONDON_TARGET_ID =
  'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20' as const

export const DPL_T5_EVIDENCE_STATES = [
  'KNOWN_AT_SCREENING',
  'VERIFIED_CONTROL_RESULT',
  'PARTIALLY_EVIDENCED_NOT_SURVEYED',
  'PARTIALLY_EVIDENCED_NOT_POLICY_MEASURED',
  'UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION',
  'UNKNOWN_AT_ADMITTED_EVIDENCE',
  'EXTERNAL_PLANNING_RECORD_CONTEXT'
] as const

export type DPLT5EvidenceState = (typeof DPL_T5_EVIDENCE_STATES)[number]

type CoverageOwner = 'PLANNING' | 'NON_PLANNING'

export interface DPLT5Source {
  readonly id: string
  readonly path: string
  readonly gitBlobSha: string
  readonly sourceClass: string
  readonly subject: string
  readonly authorityBoundary: string
}

export interface DPLT5Claim {
  readonly id: string
  readonly subject: string
  readonly proposition: string
  readonly evidenceState: DPLT5EvidenceState
  readonly evidenceRefs: readonly string[]
  readonly coverageFamilyRefs: readonly string[]
  readonly limitation: string
}

export interface DPLT5Manifest {
  readonly schemaVersion: 'dpl.instrumentedRealControlRuntimeManifest.v1'
  readonly controlId: typeof DPL_T5_CONTROL_ID
  readonly manifestId: 'DPL-T-CONTROL-004-T5-v0.1'
  readonly manifestRevision: '0.1'
  readonly controlKind: 'INSTRUMENTED_REAL_CONTROL'
  readonly sampleMembership: 'EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE'
  readonly assuranceProfile: 'SCREENING'
  readonly researchDate: '2026-10-25'
  readonly displayName: string
  readonly borough: 'Bromley'
  readonly address: string
  readonly planningApplicationRef: '26/02618/FPA'
  readonly uprn: '100020404537'
  readonly authorityBoundary: string
  readonly sources: readonly DPLT5Source[]
  readonly claims: readonly DPLT5Claim[]
  readonly runtimeProposalFacts: {
    readonly dwellingStoreys: {
      readonly value: 2
      readonly evidenceRefs: readonly ['S4', 'S5']
      readonly derivation: string
      readonly boundary: string
    }
  }
  readonly decisionCriticalUnknowns: readonly string[]
  readonly candidate: {
    readonly id: typeof DPL_T5_CANDIDATE_ID
    readonly revision: '0.1'
    readonly sourceRef: 'S4'
    readonly verificationRef: 'S5'
    readonly verificationResultFingerprint: typeof DPL_T5_VERIFICATION_FINGERPRINT
    readonly state: 'VERIFIED_BOUNDED_CANDIDATE'
  }
  readonly planningAuthority: {
    readonly strategicTargetId: typeof DPL_T5_LONDON_TARGET_ID
    readonly localTargetId: typeof DPL_T5_BROMLEY_TARGET_ID
  }
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'PROHIBITED'
    readonly planningLikelihood: 'NOT_CLAIMED'
    readonly legalBoundary: 'UNRESOLVED'
    readonly measuredTopography: 'NOT_ACQUIRED'
    readonly dpl16: 'HELD'
  }
}

export interface DPLT5RuntimeSummary {
  readonly targetIds: readonly string[]
  readonly interfaceIds: readonly string[]
  readonly obligationResultCounts: Readonly<Record<ObligationResult, number>>
  readonly applicabilityCounts: Readonly<Record<'APPLIES' | 'NOT_APPLICABLE' | 'UNRESOLVED', number>>
  readonly candidateConformanceCounts: Readonly<Record<CandidateConformanceResult, number>>
  readonly unresolvedInputs: readonly string[]
  readonly unresolvedInputCount: number
}

export interface DPLT5CoverageSummary {
  readonly claimCount: number
  readonly evidenceStateCounts: Readonly<Record<DPLT5EvidenceState, number>>
  readonly mappedClaimCount: number
  readonly coverageFamilyRefs: readonly string[]
  readonly coverageFamilyCount: number
  readonly unknownOrPartialClaimIds: readonly string[]
}

export interface DPLT5Result {
  readonly schemaVersion: typeof DPL_T5_SCHEMA_VERSION
  readonly manifest: DPLT5Manifest
  readonly manifestFingerprint: string
  readonly sourceSetFingerprint: string
  readonly candidateVerificationFingerprint: typeof DPL_T5_VERIFICATION_FINGERPRINT
  readonly ledger: DeploymentLedger
  readonly runtime: DPLT5RuntimeSummary
  readonly coverage: DPLT5CoverageSummary
  readonly readiness: 'REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED'
  readonly proofBoundary: {
    readonly wholeSiteCompatibilityConclusion: 'NOT_ADMITTED'
    readonly wholeSiteIncompatibilityConclusion: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly candidateSelection: 'ALREADY_AUTHORED_DPL_T3_AND_VERIFIED_DPL_T4'
    readonly siteInterfaceDischarge: 'NOT_INFERRED_FROM_PLACEMENT'
    readonly corpusMembership: 'EXCLUDED_FROM_DPL14_AND_DPL16_SAMPLE'
  }
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const gitBlobSha = (path: string): string => {
  const bytes = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1')
    .update(`blob ${bytes.byteLength}\0`)
    .update(bytes)
    .digest('hex')
}

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const string = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string.`)
  }
  return value
}

const strings = (value: unknown, label: string, allowEmpty = false): readonly string[] => {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new Error(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array.`)
  }
  return value.map((entry, index) => string(entry, `${label}[${index}]`))
}

const exact = <T extends string | number>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}

const uniqueSorted = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const coverageRegistryIds = (
  path: string,
  owner: CoverageOwner
): Set<string> => {
  const root = record(readJson(path), `${owner} coverage registry`)
  if (!Array.isArray(root.entries)) throw new Error(`${owner} coverage registry entries must be an array.`)
  return new Set(
    root.entries.map((entry, index) =>
      string(record(entry, `${owner}.entries[${index}]`).id, `${owner}.entries[${index}].id`)
    )
  )
}

const controlledCoverageIds = (): Readonly<Record<CoverageOwner, Set<string>>> => ({
  PLANNING: coverageRegistryIds(
    'project/dpl/coverage/dpl-10-planning-screening-coverage-v1.json',
    'PLANNING'
  ),
  NON_PLANNING: coverageRegistryIds(
    'project/dpl/coverage/dpl-11-nonplanning-screening-coverage-v1.json',
    'NON_PLANNING'
  )
})

const validateCoverageRef = (
  value: string,
  ids: Readonly<Record<CoverageOwner, Set<string>>>
): string => {
  const colon = value.indexOf(':')
  if (colon <= 0) throw new Error(`DPL-T5 coverage ref ${value} must use OWNER:ENTRY_ID.`)
  const owner = value.slice(0, colon) as CoverageOwner
  const entryId = value.slice(colon + 1)
  if (owner !== 'PLANNING' && owner !== 'NON_PLANNING') {
    throw new Error(`DPL-T5 coverage ref ${value} has unsupported owner.`)
  }
  if (!ids[owner].has(entryId)) {
    throw new Error(`DPL-T5 coverage ref ${value} does not exist in current ${owner} coverage authority.`)
  }
  return value
}

const validateSource = (value: unknown, index: number): DPLT5Source => {
  const raw = record(value, `sources[${index}]`)
  const source: DPLT5Source = {
    id: string(raw.id, `sources[${index}].id`),
    path: string(raw.path, `sources[${index}].path`),
    gitBlobSha: string(raw.gitBlobSha, `sources[${index}].gitBlobSha`),
    sourceClass: string(raw.sourceClass, `sources[${index}].sourceClass`),
    subject: string(raw.subject, `sources[${index}].subject`),
    authorityBoundary: string(raw.authorityBoundary, `sources[${index}].authorityBoundary`)
  }
  const currentBlob = gitBlobSha(source.path)
  if (currentBlob !== source.gitBlobSha) {
    throw new Error(`DPL-T5 source ${source.id} drifted: expected ${source.gitBlobSha}; got ${currentBlob}.`)
  }
  return source
}

const validateClaim = (
  value: unknown,
  index: number,
  sourceIds: ReadonlySet<string>,
  coverageIds: Readonly<Record<CoverageOwner, Set<string>>>
): DPLT5Claim => {
  const raw = record(value, `claims[${index}]`)
  const id = string(raw.id, `claims[${index}].id`)
  if (!/^LNR-C\d{2}$/.test(id)) throw new Error(`DPL-T5 claim ${id} must use real-control LNR-C## vocabulary.`)
  if (id.startsWith('RS-')) throw new Error(`DPL-T5 refuses synthetic claim id ${id}.`)

  const evidenceState = string(raw.evidenceState, `${id}.evidenceState`)
  if (!(DPL_T5_EVIDENCE_STATES as readonly string[]).includes(evidenceState)) {
    throw new Error(`DPL-T5 claim ${id} has unsupported evidence state ${evidenceState}.`)
  }
  const evidenceRefs = uniqueSorted(strings(raw.evidenceRefs, `${id}.evidenceRefs`, true))
  for (const ref of evidenceRefs) {
    if (!sourceIds.has(ref)) throw new Error(`DPL-T5 claim ${id} references unknown source ${ref}.`)
  }
  const coverageFamilyRefs = uniqueSorted(strings(raw.coverageFamilyRefs, `${id}.coverageFamilyRefs`))
    .map((ref) => validateCoverageRef(ref, coverageIds))

  return {
    id,
    subject: string(raw.subject, `${id}.subject`),
    proposition: string(raw.proposition, `${id}.proposition`),
    evidenceState: evidenceState as DPLT5EvidenceState,
    evidenceRefs,
    coverageFamilyRefs,
    limitation: string(raw.limitation, `${id}.limitation`)
  }
}

export const validateDPLT5Manifest = (value: unknown): DPLT5Manifest => {
  const raw = record(value, 'DPL-T5 manifest')
  exact(raw.schemaVersion, 'dpl.instrumentedRealControlRuntimeManifest.v1', 'schemaVersion')
  exact(raw.controlId, DPL_T5_CONTROL_ID, 'controlId')
  exact(raw.manifestId, 'DPL-T-CONTROL-004-T5-v0.1', 'manifestId')
  exact(raw.manifestRevision, '0.1', 'manifestRevision')
  exact(raw.controlKind, 'INSTRUMENTED_REAL_CONTROL', 'controlKind')
  exact(raw.sampleMembership, 'EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE', 'sampleMembership')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.researchDate, '2026-10-25', 'researchDate')
  exact(raw.borough, 'Bromley', 'borough')
  exact(raw.planningApplicationRef, '26/02618/FPA', 'planningApplicationRef')
  exact(raw.uprn, '100020404537', 'uprn')

  if (!Array.isArray(raw.sources) || raw.sources.length !== 5) {
    throw new Error('DPL-T5 requires exactly five pinned T1–T4/control source records.')
  }
  const sources = raw.sources.map(validateSource).sort((a, b) => a.id.localeCompare(b.id))
  const expectedSourceIds = ['S1', 'S2', 'S3', 'S4', 'S5']
  if (JSON.stringify(sources.map((source) => source.id)) !== JSON.stringify(expectedSourceIds)) {
    throw new Error('DPL-T5 source ids must be exactly S1 through S5.')
  }
  const sourceIds = new Set(expectedSourceIds)

  if (!Array.isArray(raw.claims) || raw.claims.length !== 17) {
    throw new Error('DPL-T5 requires exactly 17 bounded Lennard real-control claims.')
  }
  const ids = controlledCoverageIds()
  const claims = raw.claims
    .map((claim, index) => validateClaim(claim, index, sourceIds, ids))
    .sort((a, b) => a.id.localeCompare(b.id))
  const expectedClaimIds = Array.from({ length: 17 }, (_, index) => `LNR-C${String(index + 1).padStart(2, '0')}`)
  if (JSON.stringify(claims.map((claim) => claim.id)) !== JSON.stringify(expectedClaimIds)) {
    throw new Error('DPL-T5 claims must be exactly LNR-C01 through LNR-C17.')
  }

  const runtimeFacts = record(raw.runtimeProposalFacts, 'runtimeProposalFacts')
  const storeys = record(runtimeFacts.dwellingStoreys, 'runtimeProposalFacts.dwellingStoreys')
  exact(storeys.value, 2, 'runtimeProposalFacts.dwellingStoreys.value')
  const storeyEvidence = strings(storeys.evidenceRefs, 'runtimeProposalFacts.dwellingStoreys.evidenceRefs')
  if (JSON.stringify(storeyEvidence) !== JSON.stringify(['S4', 'S5'])) {
    throw new Error('DPL-T5 dwellingStoreys must be pinned to S4/S5 only.')
  }

  const candidate = record(raw.candidate, 'candidate')
  exact(candidate.id, DPL_T5_CANDIDATE_ID, 'candidate.id')
  exact(candidate.revision, '0.1', 'candidate.revision')
  exact(candidate.sourceRef, 'S4', 'candidate.sourceRef')
  exact(candidate.verificationRef, 'S5', 'candidate.verificationRef')
  exact(candidate.verificationResultFingerprint, DPL_T5_VERIFICATION_FINGERPRINT, 'candidate.verificationResultFingerprint')
  exact(candidate.state, 'VERIFIED_BOUNDED_CANDIDATE', 'candidate.state')

  const planningAuthority = record(raw.planningAuthority, 'planningAuthority')
  exact(planningAuthority.strategicTargetId, DPL_T5_LONDON_TARGET_ID, 'planningAuthority.strategicTargetId')
  exact(planningAuthority.localTargetId, DPL_T5_BROMLEY_TARGET_ID, 'planningAuthority.localTargetId')
  const bromley = loadWaveCBoroughTarget('Bromley').target as unknown as Record<string, unknown>
  if (bromley.id !== DPL_T5_BROMLEY_TARGET_ID || bromley.parentStrategicTargetId !== DPL_T5_LONDON_TARGET_ID) {
    throw new Error('DPL-T5 refuses changed Bromley → London planning authority identity.')
  }

  const boundary = record(raw.proofBoundary, 'proofBoundary')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'proofBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'proofBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'proofBoundary.routeExhaustion')
  exact(boundary.referenceHouseMutation, 'PROHIBITED', 'proofBoundary.referenceHouseMutation')
  exact(boundary.planningLikelihood, 'NOT_CLAIMED', 'proofBoundary.planningLikelihood')
  exact(boundary.legalBoundary, 'UNRESOLVED', 'proofBoundary.legalBoundary')
  exact(boundary.measuredTopography, 'NOT_ACQUIRED', 'proofBoundary.measuredTopography')
  exact(boundary.dpl16, 'HELD', 'proofBoundary.dpl16')

  const decisionCriticalUnknowns = uniqueSorted(strings(raw.decisionCriticalUnknowns, 'decisionCriticalUnknowns'))
  if (decisionCriticalUnknowns.length < 8) {
    throw new Error('DPL-T5 must retain the real control decision-critical unknowns explicitly.')
  }

  return {
    schemaVersion: 'dpl.instrumentedRealControlRuntimeManifest.v1',
    controlId: DPL_T5_CONTROL_ID,
    manifestId: 'DPL-T-CONTROL-004-T5-v0.1',
    manifestRevision: '0.1',
    controlKind: 'INSTRUMENTED_REAL_CONTROL',
    sampleMembership: 'EXCLUDED_FROM_DEPLOYMENT_ENVELOPE_SAMPLE',
    assuranceProfile: 'SCREENING',
    researchDate: '2026-10-25',
    displayName: string(raw.displayName, 'displayName'),
    borough: 'Bromley',
    address: string(raw.address, 'address'),
    planningApplicationRef: '26/02618/FPA',
    uprn: '100020404537',
    authorityBoundary: string(raw.authorityBoundary, 'authorityBoundary'),
    sources,
    claims,
    runtimeProposalFacts: {
      dwellingStoreys: {
        value: 2,
        evidenceRefs: ['S4', 'S5'],
        derivation: string(storeys.derivation, 'runtimeProposalFacts.dwellingStoreys.derivation'),
        boundary: string(storeys.boundary, 'runtimeProposalFacts.dwellingStoreys.boundary')
      }
    },
    decisionCriticalUnknowns,
    candidate: {
      id: DPL_T5_CANDIDATE_ID,
      revision: '0.1',
      sourceRef: 'S4',
      verificationRef: 'S5',
      verificationResultFingerprint: DPL_T5_VERIFICATION_FINGERPRINT,
      state: 'VERIFIED_BOUNDED_CANDIDATE'
    },
    planningAuthority: {
      strategicTargetId: DPL_T5_LONDON_TARGET_ID,
      localTargetId: DPL_T5_BROMLEY_TARGET_ID
    },
    proofBoundary: {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'PROHIBITED',
      planningLikelihood: 'NOT_CLAIMED',
      legalBoundary: 'UNRESOLVED',
      measuredTopography: 'NOT_ACQUIRED',
      dpl16: 'HELD'
    }
  }
}

export const loadDPLT5Manifest = (path = DPL_T5_MANIFEST_PATH): DPLT5Manifest =>
  validateDPLT5Manifest(readJson(path))

const createRuntimeSite = (manifest: DPLT5Manifest): LoadedPilotSite => {
  const recordText = readText(DPL_T5_MANIFEST_PATH)
  const indexEntry = {
    id: manifest.controlId,
    displayName: manifest.displayName,
    borough: manifest.borough,
    record: DPL_T5_MANIFEST_PATH,
    primaryIdentityBasis: `${manifest.manifestId} / ${manifest.controlKind}; source-bound instrumented real control excluded from DPL-14/DPL-16 sampling.`,
    challengeTags: [
      'INSTRUMENTED_REAL_CONTROL',
      'CONVENTIONAL_STREET_FRONT_REPLACEMENT',
      'VERIFIED_REFERENCE_HOUSE_CANDIDATE',
      'BROMLEY'
    ],
    decisionCriticalUnknowns: [...manifest.decisionCriticalUnknowns]
  }
  return {
    indexEntry,
    recordPath: DPL_T5_MANIFEST_PATH,
    recordText,
    recordFingerprint: sha256SemanticFingerprint({ recordPath: DPL_T5_MANIFEST_PATH, recordText }),
    indexEntryFingerprint: sha256SemanticFingerprint(indexEntry)
  }
}

const createCandidateInput = (manifest: DPLT5Manifest): DeploymentCandidateInput => {
  const raw = record(readJson(DPL_T5_CANDIDATE_PATH), 'DPL-T5 candidate source')
  exact(raw.candidateId, manifest.candidate.id, 'candidate source id')
  exact(raw.revision, manifest.candidate.revision, 'candidate source revision')
  const referenceHouse = record(raw.referenceHouse, 'candidate.referenceHouse')
  const source = createReferenceHouseSource()
  const currentSourceFingerprint = referenceHouseSourceFingerprint(source)
  const boundedFacts = record(referenceHouse.boundedConformanceFacts, 'candidate.referenceHouse.boundedConformanceFacts')
  exact(boundedFacts.storeys, manifest.runtimeProposalFacts.dwellingStoreys.value, 'candidate storeys/runtime dwellingStoreys')

  const siteInterfaceResponses = record(raw.siteInterfaceResponses, 'candidate.siteInterfaceResponses')
  const refs = strings(siteInterfaceResponses.refs, 'candidate.siteInterfaceResponses.refs')
  const variantSelections = strings(referenceHouse.variantSelections, 'candidate.referenceHouse.variantSelections')

  return {
    id: manifest.candidate.id,
    revision: manifest.candidate.revision,
    authoredSource: {
      id: DPL_T5_CANDIDATE_PATH,
      revision: manifest.candidate.revision
    },
    referenceHouseSourceFingerprint: currentSourceFingerprint,
    facts: boundedFacts,
    variantSelections: variantSelections as DeploymentCandidateInput['variantSelections'],
    siteInterfaceResponseRefs: refs as DeploymentCandidateInput['siteInterfaceResponseRefs']
  }
}

const validateT4Verification = (manifest: DPLT5Manifest): void => {
  const root = record(readJson(DPL_T5_VERIFICATION_PATH), 'DPL-T4 verification result')
  exact(root.resultFingerprint, manifest.candidate.verificationResultFingerprint, 'T4 result fingerprint')
  const payload = record(root.payload, 'DPL-T4 verification payload')
  const candidate = record(payload.candidate, 'DPL-T4 verification payload candidate')
  exact(candidate.id, manifest.candidate.id, 'T4 verified candidate id')
  exact(candidate.revision, manifest.candidate.revision, 'T4 verified candidate revision')
  exact(payload.result, 'VERIFIED_BOUNDED_CANDIDATE_READY_FOR_NEXT_DPL_GATE', 'T4 verification result')
}

const evidenceStateCounts = (claims: readonly DPLT5Claim[]): Readonly<Record<DPLT5EvidenceState, number>> => {
  const counts = Object.fromEntries(DPL_T5_EVIDENCE_STATES.map((state) => [state, 0])) as Record<DPLT5EvidenceState, number>
  for (const claim of claims) counts[claim.evidenceState] += 1
  return counts
}

const obligationResultCounts = (ledger: DeploymentLedger): Readonly<Record<ObligationResult, number>> => {
  const counts = Object.fromEntries(obligationResults.map((result) => [result, 0])) as Record<ObligationResult, number>
  for (const obligation of ledger.obligations) counts[obligation.result] += 1
  return counts
}

const applicabilityCounts = (ledger: DeploymentLedger): Readonly<Record<'APPLIES' | 'NOT_APPLICABLE' | 'UNRESOLVED', number>> => {
  const counts = { APPLIES: 0, NOT_APPLICABLE: 0, UNRESOLVED: 0 }
  for (const obligation of ledger.obligations) counts[obligation.applicability.state] += 1
  return counts
}

const candidateConformanceCounts = (
  ledger: DeploymentLedger
): Readonly<Record<CandidateConformanceResult, number>> => {
  const counts: Record<CandidateConformanceResult, number> = {
    CONFORMS: 0,
    NON_CONFORMING: 0,
    REQUIRES_REFERENCE_HOUSE_REVISION: 0,
    OPEN: 0
  }
  for (const finding of ledger.candidateConformance?.findings ?? []) counts[finding.result] += 1
  return counts
}

export const compileDPLT5LennardRealControlCase = (
  manifest: DPLT5Manifest = loadDPLT5Manifest()
): DPLT5Result => {
  validateT4Verification(manifest)

  const site = createRuntimeSite(manifest)
  const candidate = createCandidateInput(manifest)
  const proposalFacts: ProposalFacts = {
    dwellingStoreys: manifest.runtimeProposalFacts.dwellingStoreys.value
  }
  const targets = loadWaveCTargetComposition('Bromley')
  const interfaces = loadWaveCInterfaceContracts()
  const ledger = compileDeploymentCase({
    assuranceProfile: 'SCREENING',
    site,
    interfaceContracts: interfaces,
    targets,
    candidate,
    proposalFacts
  })

  const coverageFamilyRefs = uniqueSorted(manifest.claims.flatMap((claim) => claim.coverageFamilyRefs))
  const unknownOrPartialClaimIds = manifest.claims
    .filter((claim) =>
      claim.evidenceState.startsWith('UNKNOWN_') || claim.evidenceState.startsWith('PARTIALLY_')
    )
    .map((claim) => claim.id)
    .sort((a, b) => a.localeCompare(b))

  const runtime: DPLT5RuntimeSummary = {
    targetIds: ledger.targetComposition.map((target) => target.targetId).sort((a, b) => a.localeCompare(b)),
    interfaceIds: ledger.caseIdentity.manifest.interfaceContracts.map((contract) => contract.id).sort((a, b) => a.localeCompare(b)),
    obligationResultCounts: obligationResultCounts(ledger),
    applicabilityCounts: applicabilityCounts(ledger),
    candidateConformanceCounts: candidateConformanceCounts(ledger),
    unresolvedInputs: [...ledger.unresolvedInputs].sort((a, b) => a.localeCompare(b)),
    unresolvedInputCount: ledger.unresolvedInputs.length
  }
  const coverage: DPLT5CoverageSummary = {
    claimCount: manifest.claims.length,
    evidenceStateCounts: evidenceStateCounts(manifest.claims),
    mappedClaimCount: manifest.claims.filter((claim) => claim.coverageFamilyRefs.length > 0).length,
    coverageFamilyRefs,
    coverageFamilyCount: coverageFamilyRefs.length,
    unknownOrPartialClaimIds
  }
  const proofBoundary = {
    wholeSiteCompatibilityConclusion: 'NOT_ADMITTED' as const,
    wholeSiteIncompatibilityConclusion: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    candidateSelection: 'ALREADY_AUTHORED_DPL_T3_AND_VERIFIED_DPL_T4' as const,
    siteInterfaceDischarge: 'NOT_INFERRED_FROM_PLACEMENT' as const,
    corpusMembership: 'EXCLUDED_FROM_DPL14_AND_DPL16_SAMPLE' as const
  }
  const manifestFingerprint = sha256SemanticFingerprint(manifest)
  const sourceSetFingerprint = sha256SemanticFingerprint(
    manifest.sources.map(({ id, path, gitBlobSha }) => ({ id, path, gitBlobSha }))
  )
  const resultPayload = {
    schemaVersion: DPL_T5_SCHEMA_VERSION,
    manifestFingerprint,
    sourceSetFingerprint,
    candidateVerificationFingerprint: DPL_T5_VERIFICATION_FINGERPRINT,
    deploymentCaseFingerprint: ledger.caseIdentity.fingerprint,
    deploymentResultFingerprint: ledger.resultFingerprint,
    runtime,
    coverage,
    readiness: 'REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED' as const,
    proofBoundary
  }

  return {
    schemaVersion: DPL_T5_SCHEMA_VERSION,
    manifest,
    manifestFingerprint,
    sourceSetFingerprint,
    candidateVerificationFingerprint: DPL_T5_VERIFICATION_FINGERPRINT,
    ledger,
    runtime,
    coverage,
    readiness: 'REAL_CONTROL_RUNTIME_COMPOSED_GAPS_EXPOSED',
    proofBoundary,
    resultFingerprint: sha256SemanticFingerprint(resultPayload)
  }
}
