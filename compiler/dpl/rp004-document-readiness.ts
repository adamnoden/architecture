import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15CCorpusReadiness, DPL15C_DIMENSIONS, type DPL15CDimension } from './corpus-candidate-readiness.js'

export const DPL15D_SCHEMA_VERSION = 'dpl.realSitePlanningDocumentAcquisition.v1' as const
export const DPL15D_PATH = 'project/dpl/sites/dpl-rp-004-public-document-acquisition-v01.json' as const
export const DPL15D_SITE_RECORD_PATH = 'project/dpl/sites/dpl-rp-004-4-nelmes-way-hornchurch.md' as const
export const DPL15D_SITE_RECORD_BLOB = '36b7fb53af2cd4522e671c721b828d07778757f0' as const

export type RetrievalState = 'RECOVERED_AND_INSPECTABLE' | 'INDEXED_NOT_DOCUMENT_RETRIEVABLE' | 'NOT_FOUND_IN_BOUNDED_SEARCH'
export type GeometryAuthority = 'NO_GEOMETRY_AUTHORITY' | 'CONTEXT_GEOMETRY_ONLY' | 'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY' | 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
export type RP004ReadinessResult = 'RP004_SCREENING_CANDIDATE_AUTHORING_READY' | 'RP004_NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT' | 'RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY'

type Relationship = 'FIRST_PARTY' | 'MIRROR' | 'THIRD_PARTY'
type DimensionState = 'SATISFIED' | 'NOT_SATISFIED'

interface SourceRecord {
  readonly id: string
  readonly url: string
  readonly publisher: string
  readonly relationship: Relationship
  readonly authorityClass: string
  readonly retrievalState: RetrievalState
  readonly geometryAuthority: GeometryAuthority
  readonly recoveredFacts: readonly string[]
  readonly limitations: readonly string[]
}

interface DocumentTarget {
  readonly id: string
  readonly priority: number
  readonly state: 'NOT_FOUND_IN_BOUNDED_SEARCH' | 'INDEXED_CORPUS_NOT_ITEMISED' | 'RECOVERED_AND_INSPECTABLE'
  readonly requiredContent: string
}

interface AcquisitionRecord {
  readonly schemaVersion: typeof DPL15D_SCHEMA_VERSION
  readonly siteId: 'DPL-RP-004'
  readonly assessmentId: 'DPL-RP-004-DPL15D-v0.1'
  readonly applicationRef: 'P0366.26'
  readonly assuranceProfile: 'SCREENING'
  readonly retrievalDate: '2026-10-24'
  readonly baseline: {
    readonly siteRecordPath: typeof DPL15D_SITE_RECORD_PATH
    readonly siteRecordGitBlobSha: typeof DPL15D_SITE_RECORD_BLOB
    readonly dpl15cAssessmentPath: 'project/dpl/sites/dpl-corpus-1-candidate-readiness-v01.json'
  }
  readonly sources: readonly SourceRecord[]
  readonly documentTargets: readonly DocumentTarget[]
  readonly dimensionState: Readonly<Record<DPL15CDimension, DimensionState>>
  readonly result: RP004ReadinessResult
  readonly resultReason: string
  readonly unchangedEvidenceBoundary: Readonly<Record<string, 'UNRESOLVED'>>
  readonly proofBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly deploymentEnvelopeDpl16: 'HELD'
    readonly marketingGeometryAuthority: 'FORBIDDEN'
    readonly pixelDerivedMeasurement: 'FORBIDDEN'
  }
}

export interface DPL15DResult {
  readonly record: AcquisitionRecord
  readonly result: RP004ReadinessResult
  readonly dimensionedSourceIds: readonly string[]
  readonly unretrievedDocumentTargetIds: readonly string[]
  readonly baselineDpl15cFingerprint: string
  readonly acquisitionFingerprint: string
  readonly resultFingerprint: string
}

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const gitBlobSha = (path: string): string => {
  const bytes = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex')
}
const object = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`)
  return value as Record<string, unknown>
}
const str = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}
const strings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  return [...new Set(value.map((entry, index) => str(entry, `${label}[${index}]`)))].sort()
}
const exact = <T extends string>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${expected}; got ${String(value)}.`)
  return expected
}

const retrievalStates: readonly RetrievalState[] = ['RECOVERED_AND_INSPECTABLE','INDEXED_NOT_DOCUMENT_RETRIEVABLE','NOT_FOUND_IN_BOUNDED_SEARCH']
const geometryAuthorities: readonly GeometryAuthority[] = ['NO_GEOMETRY_AUTHORITY','CONTEXT_GEOMETRY_ONLY','EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY','APPROVED_DIMENSIONED_SCREENING_GEOMETRY']
const relationships: readonly Relationship[] = ['FIRST_PARTY','MIRROR','THIRD_PARTY']

const canonicalSource = (value: unknown, index: number): SourceRecord => {
  const raw = object(value, `sources[${index}]`)
  const relationship = str(raw.relationship, `sources[${index}].relationship`)
  const retrievalState = str(raw.retrievalState, `sources[${index}].retrievalState`)
  const geometryAuthority = str(raw.geometryAuthority, `sources[${index}].geometryAuthority`)
  if (!relationships.includes(relationship as Relationship)) throw new Error(`Unsupported source relationship ${relationship}.`)
  if (!retrievalStates.includes(retrievalState as RetrievalState)) throw new Error(`Unsupported retrieval state ${retrievalState}.`)
  if (!geometryAuthorities.includes(geometryAuthority as GeometryAuthority)) throw new Error(`Unsupported geometry authority ${geometryAuthority}.`)
  const url = str(raw.url, `sources[${index}].url`)
  if (!url.startsWith('https://development.havering.gov.uk/') && !url.startsWith('https://www.havering.gov.uk/') && !url.startsWith('https://planindex.co.uk/')) {
    throw new Error(`DPL-15D refuses unapproved source host ${url}.`)
  }
  return {
    id: str(raw.id, `sources[${index}].id`),
    url,
    publisher: str(raw.publisher, `sources[${index}].publisher`),
    relationship: relationship as Relationship,
    authorityClass: str(raw.authorityClass, `sources[${index}].authorityClass`),
    retrievalState: retrievalState as RetrievalState,
    geometryAuthority: geometryAuthority as GeometryAuthority,
    recoveredFacts: strings(raw.recoveredFacts, `sources[${index}].recoveredFacts`),
    limitations: strings(raw.limitations, `sources[${index}].limitations`)
  }
}

const canonicalTarget = (value: unknown, index: number): DocumentTarget => {
  const raw = object(value, `documentTargets[${index}]`)
  const state = str(raw.state, `documentTargets[${index}].state`)
  if (!['NOT_FOUND_IN_BOUNDED_SEARCH','INDEXED_CORPUS_NOT_ITEMISED','RECOVERED_AND_INSPECTABLE'].includes(state)) throw new Error(`Unsupported document target state ${state}.`)
  if (!Number.isInteger(raw.priority) || (raw.priority as number) < 1) throw new Error(`documentTargets[${index}].priority must be a positive integer.`)
  return {
    id: str(raw.id, `documentTargets[${index}].id`),
    priority: raw.priority as number,
    state: state as DocumentTarget['state'],
    requiredContent: str(raw.requiredContent, `documentTargets[${index}].requiredContent`)
  }
}

export const deriveRP004ReadinessResult = (
  dimensionState: Readonly<Record<DPL15CDimension, DimensionState>>,
  sources: readonly SourceRecord[],
  targets: readonly DocumentTarget[]
): RP004ReadinessResult => {
  const allReady = DPL15C_DIMENSIONS.every((dimension) => dimensionState[dimension] === 'SATISFIED')
  const dimensionedSource = sources.some((source) => source.retrievalState === 'RECOVERED_AND_INSPECTABLE' && (
    source.geometryAuthority === 'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY' ||
    source.geometryAuthority === 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
  ))
  if (allReady && dimensionedSource) return 'RP004_SCREENING_CANDIDATE_AUTHORING_READY'

  const retrievalBoundary = sources.some((source) => source.retrievalState === 'INDEXED_NOT_DOCUMENT_RETRIEVABLE') ||
    targets.some((target) => target.state === 'INDEXED_CORPUS_NOT_ITEMISED')
  if (retrievalBoundary && !dimensionedSource) return 'RP004_NOT_READY_DOCUMENT_RETRIEVAL_BOUNDARY'
  return 'RP004_NOT_READY_PUBLIC_GEOMETRY_INSUFFICIENT'
}

export const validateDPL15DRecord = (value: unknown): AcquisitionRecord => {
  const raw = object(value, 'DPL-15D acquisition')
  exact(raw.schemaVersion, DPL15D_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.siteId, 'DPL-RP-004', 'siteId')
  exact(raw.assessmentId, 'DPL-RP-004-DPL15D-v0.1', 'assessmentId')
  exact(raw.applicationRef, 'P0366.26', 'applicationRef')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.retrievalDate, '2026-10-24', 'retrievalDate')

  const baseline = object(raw.baseline, 'baseline')
  exact(baseline.siteRecordPath, DPL15D_SITE_RECORD_PATH, 'baseline.siteRecordPath')
  exact(baseline.siteRecordGitBlobSha, DPL15D_SITE_RECORD_BLOB, 'baseline.siteRecordGitBlobSha')
  exact(baseline.dpl15cAssessmentPath, 'project/dpl/sites/dpl-corpus-1-candidate-readiness-v01.json', 'baseline.dpl15cAssessmentPath')
  if (gitBlobSha(DPL15D_SITE_RECORD_PATH) !== DPL15D_SITE_RECORD_BLOB) throw new Error('DPL-15D RP-004 source record changed; acquisition is stale.')

  if (!Array.isArray(raw.sources) || raw.sources.length !== 4) throw new Error('DPL-15D requires exactly H1-H4 sources.')
  const sources = raw.sources.map(canonicalSource).sort((a,b) => compareDplIdentityStrings(a.id, b.id))
  if (JSON.stringify(sources.map((source) => source.id)) !== JSON.stringify(['H1','H2','H3','H4'])) throw new Error('DPL-15D source ids must be exactly H1-H4.')
  if (sources.filter((source) => source.relationship === 'FIRST_PARTY').length < 3) throw new Error('DPL-15D must preserve the first-party Havering evidence spine.')
  const h3 = sources.find((source) => source.id === 'H3')!
  if (h3.relationship !== 'THIRD_PARTY' || h3.geometryAuthority !== 'NO_GEOMETRY_AUTHORITY') throw new Error('DPL-15D document-count index cannot acquire geometry authority.')

  if (!Array.isArray(raw.documentTargets) || raw.documentTargets.length !== 5) throw new Error('DPL-15D requires five ordered document targets.')
  const documentTargets = raw.documentTargets.map(canonicalTarget).sort((a,b) => a.priority - b.priority)
  if (new Set(documentTargets.map((target) => target.priority)).size !== 5) throw new Error('DPL-15D document-target priorities must be unique.')

  const rawDimensions = object(raw.dimensionState, 'dimensionState')
  const dimensionState = {} as Record<DPL15CDimension, DimensionState>
  for (const dimension of DPL15C_DIMENSIONS) {
    const state = str(rawDimensions[dimension], `dimensionState.${dimension}`)
    if (state !== 'SATISFIED' && state !== 'NOT_SATISFIED') throw new Error(`Invalid state ${state} for ${dimension}.`)
    dimensionState[dimension] = state
  }
  if (Object.keys(rawDimensions).sort().join('|') !== [...DPL15C_DIMENSIONS].sort().join('|')) throw new Error('DPL-15D dimension-state universe must equal DPL-15C R1-R6 exactly.')

  const dpl15c = composeDPL15CCorpusReadiness()
  const baselineRp004 = dpl15c.sites.find((site) => site.siteId === 'DPL-RP-004')
  if (!baselineRp004 || baselineRp004.readiness !== 'NOT_READY') throw new Error('DPL-15D requires the landed DPL-15C RP-004 NOT_READY baseline.')

  const derived = deriveRP004ReadinessResult(dimensionState, sources, documentTargets)
  if (raw.result !== derived) throw new Error(`DPL-15D result must derive from evidence; expected ${derived}, got ${String(raw.result)}.`)

  const externalRaw = object(raw.unchangedEvidenceBoundary, 'unchangedEvidenceBoundary')
  const unchangedEvidenceBoundary: Record<string,'UNRESOLVED'> = {}
  for (const [key,value] of Object.entries(externalRaw).sort(([a],[b]) => compareDplIdentityStrings(a, b))) unchangedEvidenceBoundary[key] = exact(value, 'UNRESOLVED', `unchangedEvidenceBoundary.${key}`)
  if (Object.keys(unchangedEvidenceBoundary).length < 6) throw new Error('DPL-15D must preserve external evidence boundaries explicitly.')

  const boundary = object(raw.proofBoundary, 'proofBoundary')
  const proofBoundary = {
    referenceHouseCandidate: exact(boundary.referenceHouseCandidate, 'NOT_AUTHORED', 'proofBoundary.referenceHouseCandidate'),
    compatibleAtScreening: exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'proofBoundary.compatibleAtScreening'),
    incompatible: exact(boundary.incompatible, 'NOT_ADMITTED', 'proofBoundary.incompatible'),
    routeExhaustion: exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'proofBoundary.routeExhaustion'),
    deploymentEnvelopeDpl16: exact(boundary.deploymentEnvelopeDpl16, 'HELD', 'proofBoundary.deploymentEnvelopeDpl16'),
    marketingGeometryAuthority: exact(boundary.marketingGeometryAuthority, 'FORBIDDEN', 'proofBoundary.marketingGeometryAuthority'),
    pixelDerivedMeasurement: exact(boundary.pixelDerivedMeasurement, 'FORBIDDEN', 'proofBoundary.pixelDerivedMeasurement')
  } as const

  return {
    schemaVersion: DPL15D_SCHEMA_VERSION,
    siteId: 'DPL-RP-004',
    assessmentId: 'DPL-RP-004-DPL15D-v0.1',
    applicationRef: 'P0366.26',
    assuranceProfile: 'SCREENING',
    retrievalDate: '2026-10-24',
    baseline: {
      siteRecordPath: DPL15D_SITE_RECORD_PATH,
      siteRecordGitBlobSha: DPL15D_SITE_RECORD_BLOB,
      dpl15cAssessmentPath: 'project/dpl/sites/dpl-corpus-1-candidate-readiness-v01.json'
    },
    sources,
    documentTargets,
    dimensionState,
    result: derived,
    resultReason: str(raw.resultReason, 'resultReason'),
    unchangedEvidenceBoundary,
    proofBoundary
  }
}

export const composeDPL15DRP004Readiness = (
  value: unknown = JSON.parse(read(DPL15D_PATH)) as unknown
): DPL15DResult => {
  const record = validateDPL15DRecord(value)
  const dpl15c = composeDPL15CCorpusReadiness()
  const dimensionedSourceIds = record.sources.filter((source) => source.retrievalState === 'RECOVERED_AND_INSPECTABLE' && (
    source.geometryAuthority === 'EXPLICIT_DIMENSIONED_SCREENING_GEOMETRY' || source.geometryAuthority === 'APPROVED_DIMENSIONED_SCREENING_GEOMETRY'
  )).map((source) => source.id)
  const unretrievedDocumentTargetIds = record.documentTargets.filter((target) => target.state !== 'RECOVERED_AND_INSPECTABLE').map((target) => target.id)
  const acquisitionFingerprint = sha256DplSemanticFingerprint(record)
  return {
    record,
    result: record.result,
    dimensionedSourceIds,
    unretrievedDocumentTargetIds,
    baselineDpl15cFingerprint: dpl15c.resultFingerprint,
    acquisitionFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({
      acquisitionFingerprint,
      baselineDpl15cFingerprint: dpl15c.resultFingerprint,
      result: record.result,
      proofBoundary: record.proofBoundary
    })
  }
}
