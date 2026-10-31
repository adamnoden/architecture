import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { loadWaveCBoroughTarget } from './wavec.js'

export const DPL15A_SCHEMA_VERSION = 'dpl.realSiteTrialManifest.v1' as const
export const DPL15A_SITE_ID = 'DPL-RP-003' as const
export const DPL15A_MANIFEST_ID = 'DPL-RP-003-DPL15A-v0.1' as const
export const DPL15A_MANIFEST_PATH = 'project/dpl/sites/dpl-rp-003-trial-manifest-v01.json' as const
export const DPL15A_AUTHORITY_PATH = 'project/dpl/sites/dpl-rp-003-rear-73a-73b-woodside-green-croydon.md' as const
export const DPL15A_AUTHORITY_GIT_BLOB_SHA = 'fb1c01a5e28044eda9ac275c2881082bb1917826' as const
export const DPL15A_STRATEGIC_TARGET_ID = 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20' as const
export const DPL15A_LOCAL_TARGET_ID = 'CROYDON-LOCAL-PLANNING-2018-2026-10-21' as const

export const DPL15A_EXPECTED_CLAIM_IDS = Array.from({ length: 15 }, (_, index) =>
  `RP003-C${String(index + 1).padStart(2, '0')}`
)

export const DPL15A_EVIDENCE_STATES = [
  'KNOWN_AT_SCREENING',
  'HISTORICAL_PUBLIC_RECORD',
  'EXTERNAL_PLANNING_DECISION_EVIDENCE',
  'EXTERNAL_PLANNING_JUDGEMENT_EVIDENCE',
  'UNKNOWN_AT_ADMITTED_EVIDENCE',
  'UNKNOWN_AT_SURVEY_OR_TITLE_PRECISION',
  'PARTIALLY_EVIDENCED_NOT_SURVEYED',
  'UNKNOWN'
] as const

export type DPL15AEvidenceState = (typeof DPL15A_EVIDENCE_STATES)[number]

type CoverageOwner = 'PLANNING' | 'NON_PLANNING'

export interface DPL15ASource {
  readonly id: string
  readonly sourceClass: string
  readonly subject: string
  readonly temporalScope: string
  readonly authorityBoundary: string
}

export interface DPL15AClaim {
  readonly id: string
  readonly subject: string
  readonly proposition: string
  readonly evidenceState: DPL15AEvidenceState
  readonly evidenceRefs: readonly string[]
  readonly coverageFamilyRefs: readonly string[]
  readonly currentStateQualifier?: string
  readonly limitation: string
}

export interface DPL15AManifest {
  readonly schemaVersion: typeof DPL15A_SCHEMA_VERSION
  readonly siteId: typeof DPL15A_SITE_ID
  readonly manifestId: typeof DPL15A_MANIFEST_ID
  readonly manifestRevision: '0.1'
  readonly siteKind: 'REAL'
  readonly assuranceProfile: 'SCREENING'
  readonly researchDate: '2026-10-20'
  readonly authoritySource: typeof DPL15A_AUTHORITY_PATH
  readonly authorityGitBlobSha: typeof DPL15A_AUTHORITY_GIT_BLOB_SHA
  readonly authorityBoundary: string
  readonly planningAuthority: {
    readonly strategicTargetId: typeof DPL15A_STRATEGIC_TARGET_ID
    readonly localTargetId: typeof DPL15A_LOCAL_TARGET_ID
  }
  readonly sources: readonly DPL15ASource[]
  readonly claims: readonly DPL15AClaim[]
  readonly candidateAuthoring: {
    readonly state: 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY'
    readonly reason: string
    readonly missingEvidence: readonly string[]
  }
  readonly syntheticVocabularyBoundary: {
    readonly directDPL13BClaimVocabularyReuse: 'NOT_ADMITTED'
    readonly reason: string
    readonly requiredNextAbstraction: 'REAL_CLAIM_TO_OWNER_FAMILY_ADAPTER_IF_EARNED'
  }
  readonly resultBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'NOT_AUTHORISED'
    readonly planningLikelihood: 'NOT_CLAIMED'
    readonly purchaseRecommendation: 'NOT_CLAIMED'
  }
}

export interface DPL15ATrialResult {
  readonly schemaVersion: typeof DPL15A_SCHEMA_VERSION
  readonly manifest: DPL15AManifest
  readonly manifestFingerprint: string
  readonly authorityFingerprint: string
  readonly claimCount: 15
  readonly mappedClaimCount: 15
  readonly evidenceStateCounts: Readonly<Record<DPL15AEvidenceState, number>>
  readonly coverageFamilyRefs: readonly string[]
  readonly candidateAuthoringState: 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY'
  readonly candidateAuthoringMissingEvidence: readonly string[]
  readonly directDPL13BReuse: 'NOT_ADMITTED_SYNTHETIC_CLAIM_VOCABULARY'
  readonly syntheticClaimIdIntersection: readonly string[]
  readonly proofBoundary: DPL15AManifest['resultBoundary']
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const gitBlobSha = (path: string): string => {
  const bytes = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex')
}

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const string = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const strings = (value: unknown, label: string, allowEmpty = false): readonly string[] => {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) throw new Error(`${label} must be an array.`)
  return value.map((entry, index) => string(entry, `${label}[${index}]`))
}

const uniqueSorted = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const loadCoverageIds = (path: string, owner: CoverageOwner): Set<string> => {
  const json = JSON.parse(readText(path)) as unknown
  const root = record(json, `${owner} coverage registry`)
  if (!Array.isArray(root.entries)) throw new Error(`${owner} coverage registry entries must be an array.`)
  return new Set(root.entries.map((entry, index) => string(record(entry, `${owner}.entries[${index}]`).id, `${owner}.entries[${index}].id`)))
}

const coverageIds = (): Readonly<Record<CoverageOwner, Set<string>>> => ({
  PLANNING: loadCoverageIds('project/dpl/coverage/dpl-10-planning-screening-coverage-v1.json', 'PLANNING'),
  NON_PLANNING: loadCoverageIds('project/dpl/coverage/dpl-11-nonplanning-screening-coverage-v1.json', 'NON_PLANNING')
})

const validateCoverageRef = (value: string, ids: Readonly<Record<CoverageOwner, Set<string>>>): string => {
  const colon = value.indexOf(':')
  if (colon <= 0) throw new Error(`DPL-15A coverage ref ${value} must use OWNER:ENTRY_ID.`)
  const owner = value.slice(0, colon) as CoverageOwner
  const entryId = value.slice(colon + 1)
  if (owner !== 'PLANNING' && owner !== 'NON_PLANNING') throw new Error(`DPL-15A coverage ref ${value} has unsupported owner.`)
  if (!ids[owner].has(entryId)) throw new Error(`DPL-15A coverage ref ${value} does not exist in current ${owner} authority.`)
  return value
}

const canonicalSource = (value: unknown, index: number): DPL15ASource => {
  const raw = record(value, `sources[${index}]`)
  return {
    id: string(raw.id, `sources[${index}].id`),
    sourceClass: string(raw.sourceClass, `sources[${index}].sourceClass`),
    subject: string(raw.subject, `sources[${index}].subject`),
    temporalScope: string(raw.temporalScope, `sources[${index}].temporalScope`),
    authorityBoundary: string(raw.authorityBoundary, `sources[${index}].authorityBoundary`)
  }
}

const canonicalClaim = (
  value: unknown,
  index: number,
  sourceIds: ReadonlySet<string>,
  ids: Readonly<Record<CoverageOwner, Set<string>>>
): DPL15AClaim => {
  const raw = record(value, `claims[${index}]`)
  const id = string(raw.id, `claims[${index}].id`)
  if (id.startsWith('RS-')) throw new Error(`DPL-15A refuses synthetic claim id ${id} in a real-site manifest.`)
  const evidenceState = string(raw.evidenceState, `${id}.evidenceState`)
  if (!(DPL15A_EVIDENCE_STATES as readonly string[]).includes(evidenceState)) {
    throw new Error(`DPL-15A claim ${id} has unsupported evidence state ${evidenceState}.`)
  }
  const evidenceRefs = uniqueSorted(strings(raw.evidenceRefs, `${id}.evidenceRefs`, true))
  for (const ref of evidenceRefs) {
    if (!sourceIds.has(ref)) throw new Error(`DPL-15A claim ${id} references unknown source ${ref}.`)
  }
  const coverageFamilyRefs = uniqueSorted(strings(raw.coverageFamilyRefs, `${id}.coverageFamilyRefs`))
    .map((ref) => validateCoverageRef(ref, ids))

  const currentStateQualifier = raw.currentStateQualifier === undefined
    ? undefined
    : string(raw.currentStateQualifier, `${id}.currentStateQualifier`)

  if (evidenceState === 'HISTORICAL_PUBLIC_RECORD' && currentStateQualifier !== 'UNKNOWN') {
    throw new Error(`DPL-15A historical claim ${id} must keep current physical state UNKNOWN.`)
  }

  return {
    id,
    subject: string(raw.subject, `${id}.subject`),
    proposition: string(raw.proposition, `${id}.proposition`),
    evidenceState: evidenceState as DPL15AEvidenceState,
    evidenceRefs,
    coverageFamilyRefs,
    ...(currentStateQualifier ? { currentStateQualifier } : {}),
    limitation: string(raw.limitation, `${id}.limitation`)
  }
}

const exactString = <T extends string>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${expected}; got ${String(value)}.`)
  return expected
}

export const validateDPL15AManifest = (value: unknown): DPL15AManifest => {
  const raw = record(value, 'DPL-15A manifest')
  exactString(raw.schemaVersion, DPL15A_SCHEMA_VERSION, 'schemaVersion')
  exactString(raw.siteId, DPL15A_SITE_ID, 'siteId')
  exactString(raw.manifestId, DPL15A_MANIFEST_ID, 'manifestId')
  exactString(raw.manifestRevision, '0.1', 'manifestRevision')
  exactString(raw.siteKind, 'REAL', 'siteKind')
  exactString(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exactString(raw.researchDate, '2026-10-20', 'researchDate')
  exactString(raw.authoritySource, DPL15A_AUTHORITY_PATH, 'authoritySource')
  exactString(raw.authorityGitBlobSha, DPL15A_AUTHORITY_GIT_BLOB_SHA, 'authorityGitBlobSha')

  if (!Array.isArray(raw.sources) || raw.sources.length !== 3) throw new Error('DPL-15A requires exactly S1/S2/S3 source records.')
  const sources = raw.sources.map(canonicalSource).sort((a, b) => a.id.localeCompare(b.id))
  const sourceIdList = sources.map((entry) => entry.id)
  if (JSON.stringify(sourceIdList) !== JSON.stringify(['S1', 'S2', 'S3'])) {
    throw new Error('DPL-15A source ids must be exactly S1, S2, S3.')
  }
  const sourceIds = new Set(sourceIdList)

  if (!Array.isArray(raw.claims) || raw.claims.length !== 15) throw new Error('DPL-15A requires exactly 15 RP003 claims.')
  const ids = coverageIds()
  const claims = raw.claims.map((entry, index) => canonicalClaim(entry, index, sourceIds, ids))
    .sort((a, b) => a.id.localeCompare(b.id))
  const claimIds = claims.map((entry) => entry.id)
  if (new Set(claimIds).size !== claimIds.length) throw new Error('DPL-15A claim ids must be unique.')
  if (JSON.stringify(claimIds) !== JSON.stringify(DPL15A_EXPECTED_CLAIM_IDS)) {
    throw new Error('DPL-15A must preserve exactly RP003-C01 through RP003-C15.')
  }

  const planningAuthority = record(raw.planningAuthority, 'planningAuthority')
  exactString(planningAuthority.strategicTargetId, DPL15A_STRATEGIC_TARGET_ID, 'planningAuthority.strategicTargetId')
  exactString(planningAuthority.localTargetId, DPL15A_LOCAL_TARGET_ID, 'planningAuthority.localTargetId')
  const croydon = loadWaveCBoroughTarget('Croydon').target as unknown as Record<string, unknown>
  if (croydon.id !== DPL15A_LOCAL_TARGET_ID || croydon.parentStrategicTargetId !== DPL15A_STRATEGIC_TARGET_ID) {
    throw new Error('DPL-15A refuses changed Croydon → London planning authority identity.')
  }

  const candidateAuthoring = record(raw.candidateAuthoring, 'candidateAuthoring')
  exactString(candidateAuthoring.state, 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY', 'candidateAuthoring.state')
  const missingEvidence = uniqueSorted(strings(candidateAuthoring.missingEvidence, 'candidateAuthoring.missingEvidence'))
  if (missingEvidence.length < 5) throw new Error('DPL-15A candidate-authoring refusal must name the missing evidence explicitly.')

  const synthetic = record(raw.syntheticVocabularyBoundary, 'syntheticVocabularyBoundary')
  exactString(synthetic.directDPL13BClaimVocabularyReuse, 'NOT_ADMITTED', 'syntheticVocabularyBoundary.directDPL13BClaimVocabularyReuse')
  exactString(synthetic.requiredNextAbstraction, 'REAL_CLAIM_TO_OWNER_FAMILY_ADAPTER_IF_EARNED', 'syntheticVocabularyBoundary.requiredNextAbstraction')

  const boundary = record(raw.resultBoundary, 'resultBoundary')
  exactString(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'resultBoundary.compatibleAtScreening')
  exactString(boundary.incompatible, 'NOT_ADMITTED', 'resultBoundary.incompatible')
  exactString(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'resultBoundary.routeExhaustion')
  exactString(boundary.referenceHouseMutation, 'NOT_AUTHORISED', 'resultBoundary.referenceHouseMutation')
  exactString(boundary.planningLikelihood, 'NOT_CLAIMED', 'resultBoundary.planningLikelihood')
  exactString(boundary.purchaseRecommendation, 'NOT_CLAIMED', 'resultBoundary.purchaseRecommendation')

  return {
    schemaVersion: DPL15A_SCHEMA_VERSION,
    siteId: DPL15A_SITE_ID,
    manifestId: DPL15A_MANIFEST_ID,
    manifestRevision: '0.1',
    siteKind: 'REAL',
    assuranceProfile: 'SCREENING',
    researchDate: '2026-10-20',
    authoritySource: DPL15A_AUTHORITY_PATH,
    authorityGitBlobSha: DPL15A_AUTHORITY_GIT_BLOB_SHA,
    authorityBoundary: string(raw.authorityBoundary, 'authorityBoundary'),
    planningAuthority: {
      strategicTargetId: DPL15A_STRATEGIC_TARGET_ID,
      localTargetId: DPL15A_LOCAL_TARGET_ID
    },
    sources,
    claims,
    candidateAuthoring: {
      state: 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY',
      reason: string(candidateAuthoring.reason, 'candidateAuthoring.reason'),
      missingEvidence
    },
    syntheticVocabularyBoundary: {
      directDPL13BClaimVocabularyReuse: 'NOT_ADMITTED',
      reason: string(synthetic.reason, 'syntheticVocabularyBoundary.reason'),
      requiredNextAbstraction: 'REAL_CLAIM_TO_OWNER_FAMILY_ADAPTER_IF_EARNED'
    },
    resultBoundary: {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'NOT_AUTHORISED',
      planningLikelihood: 'NOT_CLAIMED',
      purchaseRecommendation: 'NOT_CLAIMED'
    }
  }
}

const syntheticReferenceClaimIds = (): string[] => {
  const planning = JSON.parse(readText('project/dpl/coverage/dpl-10-planning-screening-coverage-v1.json')) as { entries: { referenceSiteClaimIds?: string[] }[] }
  const nonPlanning = JSON.parse(readText('project/dpl/coverage/dpl-11-nonplanning-screening-coverage-v1.json')) as { entries: { referenceSiteClaimIds?: string[] }[] }
  return uniqueSorted([...planning.entries, ...nonPlanning.entries].flatMap((entry) => entry.referenceSiteClaimIds ?? []))
}

export const composeDPL15ATrial = (
  value: unknown = JSON.parse(readText(DPL15A_MANIFEST_PATH)) as unknown
): DPL15ATrialResult => {
  const manifest = validateDPL15AManifest(value)
  const actualAuthoritySha = gitBlobSha(DPL15A_AUTHORITY_PATH)
  if (actualAuthoritySha !== DPL15A_AUTHORITY_GIT_BLOB_SHA) {
    throw new Error('DPL-15A refuses changed RP003 corpus authority bytes; the real-site trial is stale.')
  }

  const evidenceStateCounts = Object.fromEntries(
    DPL15A_EVIDENCE_STATES.map((state) => [state, manifest.claims.filter((claim) => claim.evidenceState === state).length])
  ) as Record<DPL15AEvidenceState, number>
  const familyRefs = uniqueSorted(manifest.claims.flatMap((claim) => claim.coverageFamilyRefs))
  const syntheticIds = new Set(syntheticReferenceClaimIds())
  const intersection = manifest.claims.map((claim) => claim.id).filter((id) => syntheticIds.has(id)).sort()
  if (intersection.length > 0) throw new Error(`DPL-15A real claims collide with synthetic fixture claims: ${intersection.join(', ')}.`)

  const authorityFingerprint = sha256SemanticFingerprint({
    path: DPL15A_AUTHORITY_PATH,
    gitBlobSha: DPL15A_AUTHORITY_GIT_BLOB_SHA,
    researchDate: manifest.researchDate
  })
  const manifestFingerprint = sha256SemanticFingerprint(manifest)
  const proofBoundary = manifest.resultBoundary
  const resultFingerprint = sha256SemanticFingerprint({
    manifestFingerprint,
    authorityFingerprint,
    claimCount: manifest.claims.length,
    coverageFamilyRefs: familyRefs,
    evidenceStateCounts,
    candidateAuthoring: manifest.candidateAuthoring,
    directDPL13BReuse: 'NOT_ADMITTED_SYNTHETIC_CLAIM_VOCABULARY',
    syntheticClaimIdIntersection: intersection,
    proofBoundary
  })

  return {
    schemaVersion: DPL15A_SCHEMA_VERSION,
    manifest,
    manifestFingerprint,
    authorityFingerprint,
    claimCount: 15,
    mappedClaimCount: 15,
    evidenceStateCounts,
    coverageFamilyRefs: familyRefs,
    candidateAuthoringState: 'NOT_AUTHORED_INSUFFICIENT_GEOMETRY',
    candidateAuthoringMissingEvidence: manifest.candidateAuthoring.missingEvidence,
    directDPL13BReuse: 'NOT_ADMITTED_SYNTHETIC_CLAIM_VOCABULARY',
    syntheticClaimIdIntersection: intersection,
    proofBoundary,
    resultFingerprint
  }
}
