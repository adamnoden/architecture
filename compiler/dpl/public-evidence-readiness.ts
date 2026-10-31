import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15ATrial } from './real-site-trial.js'

export const DPL15B_SCHEMA_VERSION = 'dpl.realSitePublicEvidenceSupplement.v1' as const
export const DPL15B_SITE_ID = 'DPL-RP-003' as const
export const DPL15B_SUPPLEMENT_ID = 'DPL-RP-003-DPL15B-PUBLIC-EVIDENCE-v0.1' as const
export const DPL15B_SUPPLEMENT_PATH = 'project/dpl/sites/dpl-rp-003-public-evidence-supplement-v01.json' as const
export const DPL15A_MERGE_COMMIT = '732dabfca881cbb43b35a109d861e8921bbb0122' as const

export const DPL15B_SOURCE_RELATIONSHIPS = ['FIRST_PARTY', 'MIRROR', 'THIRD_PARTY'] as const
export type DPL15BSourceRelationship = (typeof DPL15B_SOURCE_RELATIONSHIPS)[number]

export const DPL15B_GEOMETRY_AUTHORITY = [
  'NO_GEOMETRY_AUTHORITY',
  'CONTEXT_GEOMETRY_ONLY',
  'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY',
  'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
] as const
export type DPL15BGeometryAuthority = (typeof DPL15B_GEOMETRY_AUTHORITY)[number]

export type DPL15BReadinessState =
  | 'SCREENING_CANDIDATE_AUTHORING_READY'
  | 'NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT'

export interface DPL15BSource {
  readonly id: string
  readonly url: string
  readonly host: string
  readonly publisher: string
  readonly authorityClass: string
  readonly sourceRelationship: DPL15BSourceRelationship
  readonly applicationRef: string
  readonly documentIdentity: string
  readonly retrievalMode: string
  readonly remoteByteIdentity: string
  readonly geometryAuthority: DPL15BGeometryAuthority
  readonly recoveredFacts: readonly string[]
  readonly limitations: readonly string[]
}

export interface DPL15BSupplement {
  readonly schemaVersion: typeof DPL15B_SCHEMA_VERSION
  readonly siteId: typeof DPL15B_SITE_ID
  readonly supplementId: typeof DPL15B_SUPPLEMENT_ID
  readonly supplementRevision: '0.1'
  readonly assuranceProfile: 'SCREENING'
  readonly retrievalDate: '2026-10-24'
  readonly baseline: {
    readonly dpl15aMergeCommit: typeof DPL15A_MERGE_COMMIT
    readonly manifestPath: 'project/dpl/sites/dpl-rp-003-trial-manifest-v01.json'
  }
  readonly sources: readonly DPL15BSource[]
  readonly decisionStatusResolution: {
    readonly applicationRef: '24/03598/FUL'
    readonly selectedSourceId: string
    readonly selectedStatus: 'PERMISSION_GRANTED'
    readonly selectedDecisionDate: '2025-04-11'
    readonly conflictingSourceIds: readonly string[]
    readonly resolutionRule: string
  }
  readonly geometryReadiness: {
    readonly state: DPL15BReadinessState
    readonly requiredForReady: readonly string[]
    readonly available: readonly string[]
    readonly missing: readonly string[]
    readonly candidateAuthoring: 'NOT_AUTHORISED'
  }
  readonly unchangedExternalEvidenceBoundary: Readonly<Record<string, 'UNRESOLVED'>>
  readonly resultBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseCandidate: 'NOT_AUTHORED'
    readonly referenceHouseMutation: 'NOT_AUTHORISED'
    readonly planningLikelihood: 'NOT_CLAIMED'
    readonly purchaseRecommendation: 'NOT_CLAIMED'
  }
}

export interface DPL15BResult {
  readonly schemaVersion: typeof DPL15B_SCHEMA_VERSION
  readonly supplement: DPL15BSupplement
  readonly baselineManifestFingerprint: string
  readonly sourceFingerprints: readonly { readonly id: string; readonly fingerprint: string }[]
  readonly selectedDecisionSourceId: string
  readonly selectedDecisionAuthorityRank: number
  readonly geometryReadiness: DPL15BReadinessState
  readonly dimensionedGeometrySourceIds: readonly string[]
  readonly evidenceFingerprint: string
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const expectRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const expectStrings = (value: unknown, label: string, allowEmpty = false): string[] => {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) throw new Error(`${label} must be an array.`)
  return value.map((item, index) => expectString(item, `${label}[${index}]`))
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const exact = <T extends string>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${expected}; got ${String(value)}.`)
  return expected
}

const relationshipRank: Readonly<Record<DPL15BSourceRelationship, number>> = {
  THIRD_PARTY: 1,
  MIRROR: 2,
  FIRST_PARTY: 3
}

export const sourceRelationshipRank = (relationship: DPL15BSourceRelationship): number => relationshipRank[relationship]

const canonicalSource = (value: unknown, index: number): DPL15BSource => {
  const raw = expectRecord(value, `sources[${index}]`)
  const relationship = expectString(raw.sourceRelationship, `sources[${index}].sourceRelationship`)
  if (!(DPL15B_SOURCE_RELATIONSHIPS as readonly string[]).includes(relationship)) {
    throw new Error(`sources[${index}] has unsupported sourceRelationship ${relationship}.`)
  }
  const geometryAuthority = expectString(raw.geometryAuthority, `sources[${index}].geometryAuthority`)
  if (!(DPL15B_GEOMETRY_AUTHORITY as readonly string[]).includes(geometryAuthority)) {
    throw new Error(`sources[${index}] has unsupported geometryAuthority ${geometryAuthority}.`)
  }
  return {
    id: expectString(raw.id, `sources[${index}].id`),
    url: expectString(raw.url, `sources[${index}].url`),
    host: expectString(raw.host, `sources[${index}].host`),
    publisher: expectString(raw.publisher, `sources[${index}].publisher`),
    authorityClass: expectString(raw.authorityClass, `sources[${index}].authorityClass`),
    sourceRelationship: relationship as DPL15BSourceRelationship,
    applicationRef: expectString(raw.applicationRef, `sources[${index}].applicationRef`),
    documentIdentity: expectString(raw.documentIdentity, `sources[${index}].documentIdentity`),
    retrievalMode: expectString(raw.retrievalMode, `sources[${index}].retrievalMode`),
    remoteByteIdentity: expectString(raw.remoteByteIdentity, `sources[${index}].remoteByteIdentity`),
    geometryAuthority: geometryAuthority as DPL15BGeometryAuthority,
    recoveredFacts: canonicalStrings(expectStrings(raw.recoveredFacts, `sources[${index}].recoveredFacts`)),
    limitations: canonicalStrings(expectStrings(raw.limitations, `sources[${index}].limitations`))
  }
}

export const derivePublicGeometryReadiness = (
  sources: readonly DPL15BSource[],
  missing: readonly string[]
): DPL15BReadinessState => {
  const dimensioned = sources.some((source) =>
    source.geometryAuthority === 'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY' ||
    source.geometryAuthority === 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
  )
  return dimensioned && missing.length === 0
    ? 'SCREENING_CANDIDATE_AUTHORING_READY'
    : 'NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT'
}

export const validateDPL15BSupplement = (value: unknown): DPL15BSupplement => {
  const raw = expectRecord(value, 'DPL-15B supplement')
  exact(raw.schemaVersion, DPL15B_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.siteId, DPL15B_SITE_ID, 'siteId')
  exact(raw.supplementId, DPL15B_SUPPLEMENT_ID, 'supplementId')
  exact(raw.supplementRevision, '0.1', 'supplementRevision')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.retrievalDate, '2026-10-24', 'retrievalDate')

  const baseline = expectRecord(raw.baseline, 'baseline')
  exact(baseline.dpl15aMergeCommit, DPL15A_MERGE_COMMIT, 'baseline.dpl15aMergeCommit')
  exact(baseline.manifestPath, 'project/dpl/sites/dpl-rp-003-trial-manifest-v01.json', 'baseline.manifestPath')

  if (!Array.isArray(raw.sources) || raw.sources.length !== 4) throw new Error('DPL-15B requires exactly E1-E4 sources.')
  const sources = raw.sources.map(canonicalSource).sort((a, b) => compareDplIdentityStrings(a.id, b.id))
  if (JSON.stringify(sources.map((source) => source.id)) !== JSON.stringify(['E1', 'E2', 'E3', 'E4'])) {
    throw new Error('DPL-15B source ids must be exactly E1, E2, E3, E4.')
  }
  if (new Set(sources.map((source) => source.url)).size !== sources.length) throw new Error('DPL-15B source URLs must be unique.')

  const decision = expectRecord(raw.decisionStatusResolution, 'decisionStatusResolution')
  exact(decision.applicationRef, '24/03598/FUL', 'decisionStatusResolution.applicationRef')
  exact(decision.selectedStatus, 'PERMISSION_GRANTED', 'decisionStatusResolution.selectedStatus')
  exact(decision.selectedDecisionDate, '2025-04-11', 'decisionStatusResolution.selectedDecisionDate')
  const selectedSourceId = expectString(decision.selectedSourceId, 'decisionStatusResolution.selectedSourceId')
  const selected = sources.find((source) => source.id === selectedSourceId)
  if (!selected) throw new Error(`DPL-15B selected decision source ${selectedSourceId} is missing.`)
  if (selected.sourceRelationship !== 'FIRST_PARTY') {
    throw new Error('DPL-15B controlled decision status must be selected from first-party authority.')
  }
  const conflicts = canonicalStrings(expectStrings(decision.conflictingSourceIds, 'decisionStatusResolution.conflictingSourceIds'))
  for (const conflictId of conflicts) {
    const conflict = sources.find((source) => source.id === conflictId)
    if (!conflict) throw new Error(`DPL-15B decision conflict source ${conflictId} is missing.`)
    if (sourceRelationshipRank(conflict.sourceRelationship) >= sourceRelationshipRank(selected.sourceRelationship)) {
      throw new Error(`DPL-15B conflict source ${conflictId} is not lower-authority than selected source ${selected.id}.`)
    }
  }

  const geometry = expectRecord(raw.geometryReadiness, 'geometryReadiness')
  const requiredForReady = canonicalStrings(expectStrings(geometry.requiredForReady, 'geometryReadiness.requiredForReady'))
  const available = canonicalStrings(expectStrings(geometry.available, 'geometryReadiness.available'))
  const missing = canonicalStrings(expectStrings(geometry.missing, 'geometryReadiness.missing', true))
  const derived = derivePublicGeometryReadiness(sources, missing)
  if (geometry.state !== derived) {
    throw new Error(`DPL-15B geometry readiness must derive from admitted geometry evidence; expected ${derived}, got ${String(geometry.state)}.`)
  }
  exact(geometry.candidateAuthoring, 'NOT_AUTHORISED', 'geometryReadiness.candidateAuthoring')

  const externalRaw = expectRecord(raw.unchangedExternalEvidenceBoundary, 'unchangedExternalEvidenceBoundary')
  const external: Record<string, 'UNRESOLVED'> = {}
  for (const [key, value] of Object.entries(externalRaw).sort(([a], [b]) => compareDplIdentityStrings(a, b))) {
    external[key] = exact(value, 'UNRESOLVED', `unchangedExternalEvidenceBoundary.${key}`)
  }
  if (Object.keys(external).length < 7) throw new Error('DPL-15B must preserve the external evidence boundary explicitly.')

  const boundary = expectRecord(raw.resultBoundary, 'resultBoundary')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'resultBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'resultBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'resultBoundary.routeExhaustion')
  exact(boundary.referenceHouseCandidate, 'NOT_AUTHORED', 'resultBoundary.referenceHouseCandidate')
  exact(boundary.referenceHouseMutation, 'NOT_AUTHORISED', 'resultBoundary.referenceHouseMutation')
  exact(boundary.planningLikelihood, 'NOT_CLAIMED', 'resultBoundary.planningLikelihood')
  exact(boundary.purchaseRecommendation, 'NOT_CLAIMED', 'resultBoundary.purchaseRecommendation')

  return {
    schemaVersion: DPL15B_SCHEMA_VERSION,
    siteId: DPL15B_SITE_ID,
    supplementId: DPL15B_SUPPLEMENT_ID,
    supplementRevision: '0.1',
    assuranceProfile: 'SCREENING',
    retrievalDate: '2026-10-24',
    baseline: {
      dpl15aMergeCommit: DPL15A_MERGE_COMMIT,
      manifestPath: 'project/dpl/sites/dpl-rp-003-trial-manifest-v01.json'
    },
    sources,
    decisionStatusResolution: {
      applicationRef: '24/03598/FUL',
      selectedSourceId,
      selectedStatus: 'PERMISSION_GRANTED',
      selectedDecisionDate: '2025-04-11',
      conflictingSourceIds: conflicts,
      resolutionRule: expectString(decision.resolutionRule, 'decisionStatusResolution.resolutionRule')
    },
    geometryReadiness: {
      state: derived,
      requiredForReady,
      available,
      missing,
      candidateAuthoring: 'NOT_AUTHORISED'
    },
    unchangedExternalEvidenceBoundary: external,
    resultBoundary: {
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseCandidate: 'NOT_AUTHORED',
      referenceHouseMutation: 'NOT_AUTHORISED',
      planningLikelihood: 'NOT_CLAIMED',
      purchaseRecommendation: 'NOT_CLAIMED'
    }
  }
}

export const composeDPL15BPublicEvidence = (
  value: unknown = JSON.parse(readText(DPL15B_SUPPLEMENT_PATH)) as unknown
): DPL15BResult => {
  const supplement = validateDPL15BSupplement(value)
  const baseline = composeDPL15ATrial()
  const sourceFingerprints = supplement.sources.map((source) => ({
    id: source.id,
    fingerprint: sha256DplSemanticFingerprint(source)
  }))
  const dimensionedGeometrySourceIds = supplement.sources
    .filter((source) =>
      source.geometryAuthority === 'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY' ||
      source.geometryAuthority === 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
    )
    .map((source) => source.id)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const evidenceFingerprint = sha256DplSemanticFingerprint({
    supplement,
    baselineManifestFingerprint: baseline.manifestFingerprint,
    sourceFingerprints
  })
  const selected = supplement.sources.find((source) => source.id === supplement.decisionStatusResolution.selectedSourceId)
  if (!selected) throw new Error('DPL-15B selected source disappeared after validation.')
  return {
    schemaVersion: DPL15B_SCHEMA_VERSION,
    supplement,
    baselineManifestFingerprint: baseline.manifestFingerprint,
    sourceFingerprints,
    selectedDecisionSourceId: selected.id,
    selectedDecisionAuthorityRank: sourceRelationshipRank(selected.sourceRelationship),
    geometryReadiness: supplement.geometryReadiness.state,
    dimensionedGeometrySourceIds,
    evidenceFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({
      evidenceFingerprint,
      geometryReadiness: supplement.geometryReadiness.state,
      decisionStatus: supplement.decisionStatusResolution,
      resultBoundary: supplement.resultBoundary
    })
  }
}
