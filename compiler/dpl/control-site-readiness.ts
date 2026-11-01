import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { DPL15C_DIMENSIONS, type DPL15CDimension } from './corpus-candidate-readiness.js'

export const DPLR1_SCHEMA_VERSION = 'dpl.controlSiteCandidateReadiness.v1' as const
export const DPLR1_ASSESSMENT_ID = 'DPL-R1-UPHILL-24-1141-v0.1' as const
export const DPLR1_ASSESSMENT_PATH = 'project/dpl/sites/dpl-control-001-92-uphill-road-readiness-v01.json' as const

export type DPLR1DimensionState = 'SATISFIED' | 'NOT_SATISFIED'
export type DPLR1Readiness =
  | 'CONTROL_SITE_CANDIDATE_AUTHORING_READY'
  | 'CONTROL_SITE_NOT_READY_EVIDENCE_GAP'
  | 'CONTROL_SITE_NOT_READY_SOURCE_CONFLICT'

type SourceConflictState = 'NONE_WITHIN_FROZEN_SNAPSHOT' | 'SOURCE_CONFLICT'

interface SourceRecord {
  readonly id: string
  readonly authorityClass: string
  readonly url: string
  readonly documentIdentity: string
  readonly retrievedAt: string
  readonly byteFingerprintState: string
  readonly admittedFacts: readonly string[]
}

interface DimensionAssessment {
  readonly dimension: DPL15CDimension
  readonly state: DPLR1DimensionState
  readonly evidenceRefs: readonly string[]
  readonly reason: string
}

interface RawAssessment {
  readonly schemaVersion: typeof DPLR1_SCHEMA_VERSION
  readonly assessmentId: typeof DPLR1_ASSESSMENT_ID
  readonly assuranceProfile: 'SCREENING'
  readonly controlSiteKind: 'INSTRUMENTED_REAL_CONTROL'
  readonly controlSiteId: 'DPL-R-CONTROL-001'
  readonly siteSnapshot: {
    readonly address: string
    readonly planningPermissionRef: '24/1141/FUL'
    readonly planningPermissionDecisionDate: '2024-10-18'
    readonly acceptedNmaRef: '25/1691/NMA'
    readonly acceptedDrawingLineage: readonly string[]
    readonly excludedLaterApplications: readonly ['26/1039/FUL', '26/2819/CON']
  }
  readonly referenceHouseFootprintMm: { readonly width: 12000; readonly depth: 10800 }
  readonly inheritedReadinessDimensions: readonly DPL15CDimension[]
  readonly sources: readonly SourceRecord[]
  readonly sourceConflictState: SourceConflictState
  readonly assessments: readonly DimensionAssessment[]
  readonly resultBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORED_IN_DPL_R1'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly deploymentEnvelopeDpl16: 'HELD'
    readonly originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008'
    readonly originalDpl15cReadyCount: 0
    readonly deploymentEnvelopeSampleMembership: 'EXCLUDED'
    readonly scalarSiteScore: 'FORBIDDEN'
  }
}

export interface DPLR1Result {
  readonly schemaVersion: typeof DPLR1_SCHEMA_VERSION
  readonly assessmentId: typeof DPLR1_ASSESSMENT_ID
  readonly controlSiteId: 'DPL-R-CONTROL-001'
  readonly readiness: DPLR1Readiness
  readonly gaps: readonly DPL15CDimension[]
  readonly sourceConflictState: SourceConflictState
  readonly evidenceFingerprint: string
  readonly assessmentFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: RawAssessment['resultBoundary']
}

const text = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}

const asString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const exact = <T extends string | number | boolean>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}

const uniqueSorted = (values: readonly string[]): string[] => [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const asStrings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  return value.map((entry, index) => asString(entry, `${label}[${index}]`))
}

const canonicalSource = (value: unknown, index: number): SourceRecord => {
  const raw = asRecord(value, `sources[${index}]`)
  return {
    id: asString(raw.id, `sources[${index}].id`),
    authorityClass: asString(raw.authorityClass, `sources[${index}].authorityClass`),
    url: asString(raw.url, `sources[${index}].url`),
    documentIdentity: asString(raw.documentIdentity, `sources[${index}].documentIdentity`),
    retrievedAt: asString(raw.retrievedAt, `sources[${index}].retrievedAt`),
    byteFingerprintState: asString(raw.byteFingerprintState, `sources[${index}].byteFingerprintState`),
    admittedFacts: uniqueSorted(asStrings(raw.admittedFacts, `sources[${index}].admittedFacts`))
  }
}

const canonicalAssessment = (
  value: unknown,
  index: number,
  sourceIds: ReadonlySet<string>
): DimensionAssessment => {
  const raw = asRecord(value, `assessments[${index}]`)
  const dimension = asString(raw.dimension, `assessments[${index}].dimension`)
  if (!(DPL15C_DIMENSIONS as readonly string[]).includes(dimension)) {
    throw new Error(`Unsupported DPL-R1 readiness dimension ${dimension}.`)
  }
  const state = asString(raw.state, `${dimension}.state`)
  if (state !== 'SATISFIED' && state !== 'NOT_SATISFIED') {
    throw new Error(`${dimension} has unsupported state ${state}.`)
  }
  const evidenceRefs = uniqueSorted(asStrings(raw.evidenceRefs, `${dimension}.evidenceRefs`))
  for (const evidenceRef of evidenceRefs) {
    if (!sourceIds.has(evidenceRef)) throw new Error(`${dimension} references unknown evidence source ${evidenceRef}.`)
  }
  return {
    dimension: dimension as DPL15CDimension,
    state,
    evidenceRefs,
    reason: asString(raw.reason, `${dimension}.reason`)
  }
}

export const validateDPLR1Assessment = (value: unknown): RawAssessment => {
  const raw = asRecord(value, 'DPL-R1 control-site assessment')
  exact(raw.schemaVersion, DPLR1_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.assessmentId, DPLR1_ASSESSMENT_ID, 'assessmentId')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.controlSiteKind, 'INSTRUMENTED_REAL_CONTROL', 'controlSiteKind')
  exact(raw.controlSiteId, 'DPL-R-CONTROL-001', 'controlSiteId')

  const siteSnapshot = asRecord(raw.siteSnapshot, 'siteSnapshot')
  const address = asString(siteSnapshot.address, 'siteSnapshot.address')
  exact(siteSnapshot.planningPermissionRef, '24/1141/FUL', 'siteSnapshot.planningPermissionRef')
  exact(siteSnapshot.planningPermissionDecisionDate, '2024-10-18', 'siteSnapshot.planningPermissionDecisionDate')
  exact(siteSnapshot.acceptedNmaRef, '25/1691/NMA', 'siteSnapshot.acceptedNmaRef')
  const acceptedDrawingLineage = uniqueSorted(asStrings(siteSnapshot.acceptedDrawingLineage, 'siteSnapshot.acceptedDrawingLineage'))
  if (acceptedDrawingLineage.length !== 4) throw new Error('DPL-R1 requires the exact four-drawing accepted Rev B lineage.')
  const excludedLaterApplications = asStrings(siteSnapshot.excludedLaterApplications, 'siteSnapshot.excludedLaterApplications')
  if (JSON.stringify(excludedLaterApplications) !== JSON.stringify(['26/1039/FUL', '26/2819/CON'])) {
    throw new Error('DPL-R1 must exclude exactly the later 26/1039/FUL and 26/2819/CON authority from this snapshot.')
  }

  const footprint = asRecord(raw.referenceHouseFootprintMm, 'referenceHouseFootprintMm')
  exact(footprint.width, 12000, 'referenceHouseFootprintMm.width')
  exact(footprint.depth, 10800, 'referenceHouseFootprintMm.depth')

  if (!Array.isArray(raw.inheritedReadinessDimensions)) throw new Error('inheritedReadinessDimensions must be an array.')
  const declaredDimensions = raw.inheritedReadinessDimensions.map((entry, index) =>
    asString(entry, `inheritedReadinessDimensions[${index}]`)
  ).sort()
  if (JSON.stringify(declaredDimensions) !== JSON.stringify([...DPL15C_DIMENSIONS].sort())) {
    throw new Error('DPL-R1 must inherit the DPL-15C R1-R6 contract unchanged.')
  }

  if (!Array.isArray(raw.sources) || raw.sources.length === 0) throw new Error('DPL-R1 requires evidence sources.')
  const sources = raw.sources.map(canonicalSource).sort((a, b) => compareDplIdentityStrings(a.id, b.id))
  const sourceIds = sources.map((source) => source.id)
  if (new Set(sourceIds).size !== sourceIds.length) throw new Error('DPL-R1 evidence source ids must be unique.')
  for (const source of sources) {
    const searchable = `${source.documentIdentity} ${source.admittedFacts.join(' ')}`
    if (/26\/1039\/FUL|26\/2819\/CON/.test(searchable)) {
      throw new Error(`DPL-R1 source ${source.id} leaks later-application authority into the frozen 2024 snapshot.`)
    }
  }

  const sourceConflictState = asString(raw.sourceConflictState, 'sourceConflictState')
  if (sourceConflictState !== 'NONE_WITHIN_FROZEN_SNAPSHOT' && sourceConflictState !== 'SOURCE_CONFLICT') {
    throw new Error(`Unsupported DPL-R1 sourceConflictState ${sourceConflictState}.`)
  }

  if (!Array.isArray(raw.assessments) || raw.assessments.length !== DPL15C_DIMENSIONS.length) {
    throw new Error(`DPL-R1 requires exactly ${DPL15C_DIMENSIONS.length} readiness assessments.`)
  }
  const sourceIdSet = new Set(sourceIds)
  const assessments = raw.assessments.map((entry, index) => canonicalAssessment(entry, index, sourceIdSet))
    .sort((a, b) => compareDplIdentityStrings(a.dimension, b.dimension))
  const assessmentDimensions = assessments.map((assessment) => assessment.dimension)
  if (new Set(assessmentDimensions).size !== DPL15C_DIMENSIONS.length ||
      JSON.stringify(assessmentDimensions) !== JSON.stringify([...DPL15C_DIMENSIONS].sort())) {
    throw new Error('DPL-R1 must assess every inherited readiness dimension exactly once.')
  }

  const boundary = asRecord(raw.resultBoundary, 'resultBoundary')
  exact(boundary.referenceHouseCandidate, 'NOT_AUTHORED_IN_DPL_R1', 'resultBoundary.referenceHouseCandidate')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'resultBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'resultBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'resultBoundary.routeExhaustion')
  exact(boundary.deploymentEnvelopeDpl16, 'HELD', 'resultBoundary.deploymentEnvelopeDpl16')
  exact(boundary.originalDpl15cCorpus, 'UNCHANGED_DPL_RP_001_THROUGH_008', 'resultBoundary.originalDpl15cCorpus')
  exact(boundary.originalDpl15cReadyCount, 0, 'resultBoundary.originalDpl15cReadyCount')
  exact(boundary.deploymentEnvelopeSampleMembership, 'EXCLUDED', 'resultBoundary.deploymentEnvelopeSampleMembership')
  exact(boundary.scalarSiteScore, 'FORBIDDEN', 'resultBoundary.scalarSiteScore')

  return {
    schemaVersion: DPLR1_SCHEMA_VERSION,
    assessmentId: DPLR1_ASSESSMENT_ID,
    assuranceProfile: 'SCREENING',
    controlSiteKind: 'INSTRUMENTED_REAL_CONTROL',
    controlSiteId: 'DPL-R-CONTROL-001',
    siteSnapshot: {
      address,
      planningPermissionRef: '24/1141/FUL',
      planningPermissionDecisionDate: '2024-10-18',
      acceptedNmaRef: '25/1691/NMA',
      acceptedDrawingLineage,
      excludedLaterApplications: ['26/1039/FUL', '26/2819/CON']
    },
    referenceHouseFootprintMm: { width: 12000, depth: 10800 },
    inheritedReadinessDimensions: DPL15C_DIMENSIONS,
    sources,
    sourceConflictState: sourceConflictState as SourceConflictState,
    assessments,
    resultBoundary: {
      referenceHouseCandidate: 'NOT_AUTHORED_IN_DPL_R1',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      deploymentEnvelopeDpl16: 'HELD',
      originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008',
      originalDpl15cReadyCount: 0,
      deploymentEnvelopeSampleMembership: 'EXCLUDED',
      scalarSiteScore: 'FORBIDDEN'
    }
  }
}

export const composeDPLR1ControlReadiness = (
  value: unknown = JSON.parse(text(DPLR1_ASSESSMENT_PATH)) as unknown
): DPLR1Result => {
  const assessment = validateDPLR1Assessment(value)
  const gaps = assessment.assessments
    .filter((entry) => entry.state === 'NOT_SATISFIED')
    .map((entry) => entry.dimension)
    .sort()

  const readiness: DPLR1Readiness = assessment.sourceConflictState === 'SOURCE_CONFLICT'
    ? 'CONTROL_SITE_NOT_READY_SOURCE_CONFLICT'
    : gaps.length > 0
      ? 'CONTROL_SITE_NOT_READY_EVIDENCE_GAP'
      : 'CONTROL_SITE_CANDIDATE_AUTHORING_READY'

  const evidenceFingerprint = sha256DplSemanticFingerprint({
    controlSiteId: assessment.controlSiteId,
    siteSnapshot: assessment.siteSnapshot,
    sources: assessment.sources
  })
  const assessmentFingerprint = sha256DplSemanticFingerprint({
    schemaVersion: assessment.schemaVersion,
    assessmentId: assessment.assessmentId,
    footprint: assessment.referenceHouseFootprintMm,
    dimensions: assessment.inheritedReadinessDimensions,
    evidenceFingerprint,
    sourceConflictState: assessment.sourceConflictState,
    assessments: assessment.assessments,
    proofBoundary: assessment.resultBoundary
  })
  const resultFingerprint = sha256DplSemanticFingerprint({
    assessmentFingerprint,
    readiness,
    gaps
  })

  return {
    schemaVersion: DPLR1_SCHEMA_VERSION,
    assessmentId: DPLR1_ASSESSMENT_ID,
    controlSiteId: 'DPL-R-CONTROL-001',
    readiness,
    gaps,
    sourceConflictState: assessment.sourceConflictState,
    evidenceFingerprint,
    assessmentFingerprint,
    resultFingerprint,
    proofBoundary: assessment.resultBoundary
  }
}
