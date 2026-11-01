import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15BPublicEvidence } from './public-evidence-readiness.js'

export const DPL15C_SCHEMA_VERSION = 'dpl.realSiteCandidateReadiness.v1' as const
export const DPL15C_ASSESSMENT_ID = 'DPL-15C-CORPUS-1-v0.1' as const
export const DPL15C_ASSESSMENT_PATH = 'project/dpl/sites/dpl-corpus-1-candidate-readiness-v01.json' as const

export const DPL15C_DIMENSIONS = [
  'R1_CONTROLLED_SPATIAL_IDENTITY',
  'R2_FOOTPRINT_TEST_GEOMETRY',
  'R3_REAL_ORIENTATION_FRAME',
  'R4_DATUM_LEVEL_EVIDENCE',
  'R5_PHYSICAL_ACCESS_STREET_GEOMETRY',
  'R6_SITE_IDENTITY_COHERENCE'
] as const
export type DPL15CDimension = (typeof DPL15C_DIMENSIONS)[number]
export type DPL15CDimensionState = 'SATISFIED' | 'NOT_SATISFIED'
export type DPL15CSiteReadiness = 'CANDIDATE_AUTHORING_READY' | 'NOT_READY'

export const DPL15C_GAP_BY_DIMENSION: Readonly<Record<DPL15CDimension, string>> = {
  R1_CONTROLLED_SPATIAL_IDENTITY: 'CONTROLLED_SPATIAL_IDENTITY_GAP',
  R2_FOOTPRINT_TEST_GEOMETRY: 'FOOTPRINT_TEST_GEOMETRY_GAP',
  R3_REAL_ORIENTATION_FRAME: 'REAL_ORIENTATION_FRAME_GAP',
  R4_DATUM_LEVEL_EVIDENCE: 'DATUM_LEVEL_EVIDENCE_GAP',
  R5_PHYSICAL_ACCESS_STREET_GEOMETRY: 'PHYSICAL_ACCESS_STREET_GEOMETRY_GAP',
  R6_SITE_IDENTITY_COHERENCE: 'SITE_IDENTITY_COHERENCE_GAP'
} as const

const EXPECTED_SITE_IDS = [
  'DPL-RP-001',
  'DPL-RP-002',
  'DPL-RP-003',
  'DPL-RP-004',
  'DPL-RP-005',
  'DPL-RP-006',
  'DPL-RP-007',
  'DPL-RP-008'
] as const

interface DimensionAssessment {
  readonly dimension: DPL15CDimension
  readonly state: DPL15CDimensionState
  readonly evidenceRefs: readonly string[]
  readonly reason: string
}

interface SiteAssessment {
  readonly siteId: string
  readonly recordPath: string
  readonly recordGitBlobSha: string
  readonly nextPublicEvidenceCandidate: boolean
  readonly assessments: readonly DimensionAssessment[]
}

interface RawAssessment {
  readonly schemaVersion: typeof DPL15C_SCHEMA_VERSION
  readonly assessmentId: typeof DPL15C_ASSESSMENT_ID
  readonly assuranceProfile: 'SCREENING'
  readonly referenceHouseFootprintMm: { readonly width: 12000; readonly depth: 10800 }
  readonly corpusIndex: { readonly path: string; readonly gitBlobSha: string }
  readonly dimensions: readonly DPL15CDimension[]
  readonly sites: readonly SiteAssessment[]
  readonly resultBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly deploymentEnvelopeDpl16: 'HELD'
    readonly scalarSiteScore: 'FORBIDDEN'
  }
}

export interface DPL15CSiteResult {
  readonly siteId: string
  readonly readiness: DPL15CSiteReadiness
  readonly gaps: readonly string[]
  readonly nextPublicEvidenceCandidate: boolean
  readonly assessmentFingerprint: string
}

export interface DPL15CResult {
  readonly schemaVersion: typeof DPL15C_SCHEMA_VERSION
  readonly assessmentId: typeof DPL15C_ASSESSMENT_ID
  readonly sites: readonly DPL15CSiteResult[]
  readonly readySiteIds: readonly string[]
  readonly notReadySiteIds: readonly string[]
  readonly nextPublicEvidenceCandidateIds: readonly string[]
  readonly counts: { readonly ready: number; readonly notReady: number }
  readonly corpusFingerprint: string
  readonly assessmentFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: RawAssessment['resultBoundary']
}

const text = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const gitBlobSha = (path: string): string => {
  const bytes = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex')
}

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const asString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const asStrings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  return value.map((entry, index) => asString(entry, `${label}[${index}]`))
}

const exact = <T extends string | number | boolean>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}

const uniqueSorted = (values: readonly string[]): string[] => [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const canonicalDimensionAssessment = (value: unknown, siteId: string, index: number): DimensionAssessment => {
  const raw = asRecord(value, `${siteId}.assessments[${index}]`)
  const dimension = asString(raw.dimension, `${siteId}.assessments[${index}].dimension`)
  if (!(DPL15C_DIMENSIONS as readonly string[]).includes(dimension)) {
    throw new Error(`${siteId} has unsupported readiness dimension ${dimension}.`)
  }
  const state = asString(raw.state, `${siteId}.${dimension}.state`)
  if (state !== 'SATISFIED' && state !== 'NOT_SATISFIED') {
    throw new Error(`${siteId}.${dimension} has unsupported state ${state}.`)
  }
  return {
    dimension: dimension as DPL15CDimension,
    state,
    evidenceRefs: uniqueSorted(asStrings(raw.evidenceRefs, `${siteId}.${dimension}.evidenceRefs`)),
    reason: asString(raw.reason, `${siteId}.${dimension}.reason`)
  }
}

const canonicalSite = (value: unknown, index: number): SiteAssessment => {
  const raw = asRecord(value, `sites[${index}]`)
  const siteId = asString(raw.siteId, `sites[${index}].siteId`)
  if (!(EXPECTED_SITE_IDS as readonly string[]).includes(siteId)) throw new Error(`Unexpected DPL-15C site ${siteId}.`)
  if (typeof raw.nextPublicEvidenceCandidate !== 'boolean') throw new Error(`${siteId}.nextPublicEvidenceCandidate must be boolean.`)
  if (!Array.isArray(raw.assessments) || raw.assessments.length !== DPL15C_DIMENSIONS.length) {
    throw new Error(`${siteId} must contain exactly ${DPL15C_DIMENSIONS.length} readiness assessments.`)
  }
  const assessments = raw.assessments.map((entry, assessmentIndex) =>
    canonicalDimensionAssessment(entry, siteId, assessmentIndex)
  ).sort((a, b) => compareDplIdentityStrings(a.dimension, b.dimension))
  const dimensions = assessments.map((assessment) => assessment.dimension).sort()
  if (new Set(dimensions).size !== DPL15C_DIMENSIONS.length || JSON.stringify(dimensions) !== JSON.stringify([...DPL15C_DIMENSIONS].sort())) {
    throw new Error(`${siteId} must assess each readiness dimension exactly once.`)
  }
  return {
    siteId,
    recordPath: asString(raw.recordPath, `${siteId}.recordPath`),
    recordGitBlobSha: asString(raw.recordGitBlobSha, `${siteId}.recordGitBlobSha`),
    nextPublicEvidenceCandidate: raw.nextPublicEvidenceCandidate,
    assessments
  }
}

export const validateDPL15CAssessment = (value: unknown): RawAssessment => {
  const raw = asRecord(value, 'DPL-15C assessment')
  exact(raw.schemaVersion, DPL15C_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.assessmentId, DPL15C_ASSESSMENT_ID, 'assessmentId')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')

  const footprint = asRecord(raw.referenceHouseFootprintMm, 'referenceHouseFootprintMm')
  exact(footprint.width, 12000, 'referenceHouseFootprintMm.width')
  exact(footprint.depth, 10800, 'referenceHouseFootprintMm.depth')

  const corpusIndex = asRecord(raw.corpusIndex, 'corpusIndex')
  const corpusPath = asString(corpusIndex.path, 'corpusIndex.path')
  const corpusBlob = asString(corpusIndex.gitBlobSha, 'corpusIndex.gitBlobSha')
  if (gitBlobSha(corpusPath) !== corpusBlob) throw new Error('DPL-15C corpus index authority changed; readiness sweep is stale.')

  if (!Array.isArray(raw.dimensions)) throw new Error('dimensions must be an array.')
  const declaredDimensions = raw.dimensions.map((entry, index) => asString(entry, `dimensions[${index}]`)).sort()
  if (JSON.stringify(declaredDimensions) !== JSON.stringify([...DPL15C_DIMENSIONS].sort())) {
    throw new Error('DPL-15C declared readiness dimensions differ from the frozen R1-R6 contract.')
  }

  if (!Array.isArray(raw.sites) || raw.sites.length !== EXPECTED_SITE_IDS.length) throw new Error('DPL-15C requires exactly eight site assessments.')
  const sites = raw.sites.map(canonicalSite).sort((a, b) => compareDplIdentityStrings(a.siteId, b.siteId))
  const siteIds = sites.map((site) => site.siteId)
  if (new Set(siteIds).size !== EXPECTED_SITE_IDS.length || JSON.stringify(siteIds) !== JSON.stringify([...EXPECTED_SITE_IDS])) {
    throw new Error('DPL-15C site universe must be exactly DPL-RP-001 through DPL-RP-008.')
  }

  const corpusJson = JSON.parse(text(corpusPath)) as { sites?: { id?: string; record?: string }[] }
  const corpusSites = (corpusJson.sites ?? []).map((site) => site.id).sort()
  if (JSON.stringify(corpusSites) !== JSON.stringify([...EXPECTED_SITE_IDS])) {
    throw new Error('DPL-15C refuses a changed DPL-14 corpus site universe.')
  }
  for (const site of sites) {
    if (gitBlobSha(site.recordPath) !== site.recordGitBlobSha) {
      throw new Error(`DPL-15C source record changed for ${site.siteId}; readiness assessment is stale.`)
    }
    const indexEntry = (corpusJson.sites ?? []).find((entry) => entry.id === site.siteId)
    if (!indexEntry || `project/dpl/sites/${indexEntry.record}` !== site.recordPath) {
      throw new Error(`DPL-15C ${site.siteId} record path does not match the frozen corpus index.`)
    }
  }

  const rp003 = composeDPL15BPublicEvidence()
  if (rp003.geometryReadiness !== 'NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT') {
    throw new Error('DPL-15C refuses a changed RP-003 DPL-15B geometry-readiness result.')
  }
  const rp003Assessment = sites.find((site) => site.siteId === 'DPL-RP-003')
  if (!rp003Assessment || rp003Assessment.assessments.every((assessment) => assessment.state === 'SATISFIED')) {
    throw new Error('DPL-15C cannot treat RP-003 as ready while DPL-15B remains NOT_READY.')
  }

  const boundary = asRecord(raw.resultBoundary, 'resultBoundary')
  exact(boundary.referenceHouseCandidate, 'NOT_AUTHORED', 'resultBoundary.referenceHouseCandidate')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'resultBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'resultBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'resultBoundary.routeExhaustion')
  exact(boundary.deploymentEnvelopeDpl16, 'HELD', 'resultBoundary.deploymentEnvelopeDpl16')
  exact(boundary.scalarSiteScore, 'FORBIDDEN', 'resultBoundary.scalarSiteScore')

  return {
    schemaVersion: DPL15C_SCHEMA_VERSION,
    assessmentId: DPL15C_ASSESSMENT_ID,
    assuranceProfile: 'SCREENING',
    referenceHouseFootprintMm: { width: 12000, depth: 10800 },
    corpusIndex: { path: corpusPath, gitBlobSha: corpusBlob },
    dimensions: DPL15C_DIMENSIONS,
    sites,
    resultBoundary: {
      referenceHouseCandidate: 'NOT_AUTHORED',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      deploymentEnvelopeDpl16: 'HELD',
      scalarSiteScore: 'FORBIDDEN'
    }
  }
}

export const composeDPL15CCorpusReadiness = (
  value: unknown = JSON.parse(text(DPL15C_ASSESSMENT_PATH)) as unknown
): DPL15CResult => {
  const assessment = validateDPL15CAssessment(value)
  const sites = assessment.sites.map((site): DPL15CSiteResult => {
    const unsatisfied = site.assessments.filter((dimension) => dimension.state === 'NOT_SATISFIED')
    const readiness: DPL15CSiteReadiness = unsatisfied.length === 0 ? 'CANDIDATE_AUTHORING_READY' : 'NOT_READY'
    return {
      siteId: site.siteId,
      readiness,
      gaps: unsatisfied.map((entry) => DPL15C_GAP_BY_DIMENSION[entry.dimension]).sort(),
      nextPublicEvidenceCandidate: site.nextPublicEvidenceCandidate,
      assessmentFingerprint: sha256DplSemanticFingerprint({
        siteId: site.siteId,
        recordGitBlobSha: site.recordGitBlobSha,
        assessments: site.assessments,
        nextPublicEvidenceCandidate: site.nextPublicEvidenceCandidate
      })
    }
  }).sort((a, b) => compareDplIdentityStrings(a.siteId, b.siteId))

  const readySiteIds = sites.filter((site) => site.readiness === 'CANDIDATE_AUTHORING_READY').map((site) => site.siteId)
  const notReadySiteIds = sites.filter((site) => site.readiness === 'NOT_READY').map((site) => site.siteId)
  const nextPublicEvidenceCandidateIds = sites.filter((site) => site.nextPublicEvidenceCandidate).map((site) => site.siteId)
  for (const siteId of nextPublicEvidenceCandidateIds) {
    const site = sites.find((entry) => entry.siteId === siteId)
    if (!site || site.readiness !== 'NOT_READY') throw new Error(`DPL-15C public-evidence candidate ${siteId} must remain NOT_READY in this packet.`)
  }

  const corpusFingerprint = sha256DplSemanticFingerprint({
    corpusIndex: assessment.corpusIndex,
    sourceRecords: assessment.sites.map((site) => ({ siteId: site.siteId, recordPath: site.recordPath, recordGitBlobSha: site.recordGitBlobSha }))
  })
  const assessmentFingerprint = sha256DplSemanticFingerprint({
    schemaVersion: assessment.schemaVersion,
    assessmentId: assessment.assessmentId,
    corpusFingerprint,
    footprint: assessment.referenceHouseFootprintMm,
    dimensions: assessment.dimensions,
    sites: assessment.sites,
    proofBoundary: assessment.resultBoundary
  })

  return {
    schemaVersion: DPL15C_SCHEMA_VERSION,
    assessmentId: DPL15C_ASSESSMENT_ID,
    sites,
    readySiteIds,
    notReadySiteIds,
    nextPublicEvidenceCandidateIds,
    counts: { ready: readySiteIds.length, notReady: notReadySiteIds.length },
    corpusFingerprint,
    assessmentFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({
      assessmentFingerprint,
      sites,
      readySiteIds,
      notReadySiteIds,
      nextPublicEvidenceCandidateIds,
      proofBoundary: assessment.resultBoundary
    }),
    proofBoundary: assessment.resultBoundary
  }
}
