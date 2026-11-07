import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'

export const DPL15E_PATH = 'project/dpl/sites/dpl-rp-006-15e-spatial-preflight-v01.json' as const
export const DPL15E_SCHEMA_VERSION = 'dpl.rp006SpatialPreflight.v1' as const
export const DPL15E_PACKET = 'DPL-15E' as const
export const DPL15E_SITE_ID = 'DPL-RP-006' as const
export const DPL15E_RESULT = 'RP006_MATERIALLY_STRONGER_PUBLIC_ROUTE_CONFIRMED_NOT_YET_CANDIDATE_READY' as const

export const DPL15E_DIMENSIONS = [
  'R1_CONTROLLED_SPATIAL_IDENTITY',
  'R2_FOOTPRINT_TEST_GEOMETRY',
  'R3_REAL_ORIENTATION_FRAME',
  'R4_DATUM_LEVEL_EVIDENCE',
  'R5_PHYSICAL_ACCESS_STREET_GEOMETRY',
  'R6_SITE_IDENTITY_COHERENCE'
] as const

export type DPL15EDimension = (typeof DPL15E_DIMENSIONS)[number]
export type DPL15EState = 'SATISFIED' | 'NOT_SATISFIED'

interface ReadinessRecord {
  readonly dimension: DPL15EDimension
  readonly state: DPL15EState
  readonly evidenceRefs: readonly string[]
  readonly reason: string
}

interface SourceRecord {
  readonly id: string
  readonly sourceClass: string
  readonly title: string
  readonly url: string
  readonly observed: readonly string[]
  readonly authorityBoundary: string
}

interface RawPreflight {
  readonly schemaVersion: typeof DPL15E_SCHEMA_VERSION
  readonly packet: typeof DPL15E_PACKET
  readonly siteId: typeof DPL15E_SITE_ID
  readonly site: string
  readonly assuranceProfile: 'SCREENING'
  readonly researchDate: string
  readonly parentReadiness: {
    readonly assessmentId: 'DPL-15C-CORPUS-1-v0.1'
    readonly path: string
    readonly gitBlobSha: string
    readonly corpusIndexGitBlobSha: string
    readonly rp006RecordGitBlobSha: string
  }
  readonly sources: readonly SourceRecord[]
  readonly coordinateFrame: {
    readonly bng: readonly [number, number]
    readonly crs: 'EPSG:27700'
    readonly derivedWgs84: readonly [number, number]
    readonly derivation: string
  }
  readonly readiness: readonly ReadinessRecord[]
  readonly candidateAuthoringReady: boolean
  readonly satisfiedDimensions: readonly DPL15EDimension[]
  readonly residualDimensions: readonly DPL15EDimension[]
  readonly nextNoSpendRoute: readonly string[]
  readonly result: typeof DPL15E_RESULT
}

export interface DPL15EResult {
  readonly siteId: typeof DPL15E_SITE_ID
  readonly result: typeof DPL15E_RESULT
  readonly candidateAuthoringReady: false
  readonly satisfiedDimensions: readonly DPL15EDimension[]
  readonly residualDimensions: readonly DPL15EDimension[]
  readonly counts: { readonly satisfied: number; readonly residual: number }
  readonly sourceIds: readonly string[]
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORISED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly dpl16: 'HELD'
  }
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

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

const exact = <T extends string | boolean>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}

const uniqueSorted = (values: readonly string[]): string[] => [...new Set(values)].sort((a, b) => a.localeCompare(b))

const canonicalSource = (value: unknown, index: number): SourceRecord => {
  const raw = asRecord(value, `sources[${index}]`)
  return {
    id: asString(raw.id, `sources[${index}].id`),
    sourceClass: asString(raw.sourceClass, `sources[${index}].sourceClass`),
    title: asString(raw.title, `sources[${index}].title`),
    url: asString(raw.url, `sources[${index}].url`),
    observed: uniqueSorted(asStrings(raw.observed, `sources[${index}].observed`)),
    authorityBoundary: asString(raw.authorityBoundary, `sources[${index}].authorityBoundary`)
  }
}

const canonicalReadiness = (value: unknown, index: number): ReadinessRecord => {
  const raw = asRecord(value, `readiness[${index}]`)
  const dimension = asString(raw.dimension, `readiness[${index}].dimension`)
  if (!(DPL15E_DIMENSIONS as readonly string[]).includes(dimension)) throw new Error(`Unsupported DPL-15E dimension ${dimension}.`)
  const state = asString(raw.state, `readiness[${index}].state`)
  if (state !== 'SATISFIED' && state !== 'NOT_SATISFIED') throw new Error(`${dimension} has unsupported state ${state}.`)
  return {
    dimension: dimension as DPL15EDimension,
    state,
    evidenceRefs: uniqueSorted(asStrings(raw.evidenceRefs, `${dimension}.evidenceRefs`)),
    reason: asString(raw.reason, `${dimension}.reason`)
  }
}

export const validateDPL15ERp006 = (value: unknown): RawPreflight => {
  const raw = asRecord(value, 'DPL-15E preflight')
  exact(raw.schemaVersion, DPL15E_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.packet, DPL15E_PACKET, 'packet')
  exact(raw.siteId, DPL15E_SITE_ID, 'siteId')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.result, DPL15E_RESULT, 'result')
  exact(raw.candidateAuthoringReady, false, 'candidateAuthoringReady')

  const parent = asRecord(raw.parentReadiness, 'parentReadiness')
  exact(parent.assessmentId, 'DPL-15C-CORPUS-1-v0.1', 'parentReadiness.assessmentId')
  const parentPath = asString(parent.path, 'parentReadiness.path')
  const parentBlob = asString(parent.gitBlobSha, 'parentReadiness.gitBlobSha')
  if (gitBlobSha(parentPath) !== parentBlob) throw new Error('DPL-15E parent DPL-15C readiness bytes changed.')
  if (gitBlobSha('project/dpl/sites/corpus-1-index.json') !== asString(parent.corpusIndexGitBlobSha, 'parentReadiness.corpusIndexGitBlobSha')) {
    throw new Error('DPL-15E DPL-14 corpus index bytes changed.')
  }
  if (gitBlobSha('project/dpl/sites/dpl-rp-006-land-adjacent-50-camelot-close-thamesmead.md') !== asString(parent.rp006RecordGitBlobSha, 'parentReadiness.rp006RecordGitBlobSha')) {
    throw new Error('DPL-15E RP-006 corpus authority bytes changed.')
  }

  if (!Array.isArray(raw.sources) || raw.sources.length < 4) throw new Error('DPL-15E requires its bounded evidence source set.')
  const sources = raw.sources.map(canonicalSource).sort((a, b) => a.id.localeCompare(b.id))
  const sourceIds = sources.map((source) => source.id)
  if (new Set(sourceIds).size !== sources.length) throw new Error('DPL-15E source ids must be unique.')

  const frame = asRecord(raw.coordinateFrame, 'coordinateFrame')
  exact(frame.crs, 'EPSG:27700', 'coordinateFrame.crs')
  if (!Array.isArray(frame.bng) || frame.bng.length !== 2 || frame.bng.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
    throw new Error('coordinateFrame.bng must contain exactly two finite numbers.')
  }
  if (!Array.isArray(frame.derivedWgs84) || frame.derivedWgs84.length !== 2 || frame.derivedWgs84.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
    throw new Error('coordinateFrame.derivedWgs84 must contain exactly two finite numbers.')
  }

  if (!Array.isArray(raw.readiness) || raw.readiness.length !== DPL15E_DIMENSIONS.length) throw new Error('DPL-15E must assess all six R1-R6 dimensions exactly once.')
  const readiness = raw.readiness.map(canonicalReadiness).sort((a, b) => a.dimension.localeCompare(b.dimension))
  if (JSON.stringify(readiness.map((entry) => entry.dimension)) !== JSON.stringify([...DPL15E_DIMENSIONS].sort())) {
    throw new Error('DPL-15E readiness universe must be exactly R1-R6.')
  }

  const expectedSatisfied = ['R3_REAL_ORIENTATION_FRAME', 'R6_SITE_IDENTITY_COHERENCE'] as const
  const satisfied = readiness.filter((entry) => entry.state === 'SATISFIED').map((entry) => entry.dimension).sort()
  if (JSON.stringify(satisfied) !== JSON.stringify([...expectedSatisfied].sort())) {
    throw new Error(`DPL-15E current positive readiness must be exactly ${expectedSatisfied.join(', ')}.`)
  }

  const expectedResidual = DPL15E_DIMENSIONS.filter((dimension) => !(expectedSatisfied as readonly string[]).includes(dimension)).sort()
  const residual = readiness.filter((entry) => entry.state === 'NOT_SATISFIED').map((entry) => entry.dimension).sort()
  if (JSON.stringify(residual) !== JSON.stringify(expectedResidual)) throw new Error('DPL-15E current residual readiness frontier changed unexpectedly.')

  const declaredSatisfied = uniqueSorted(asStrings(raw.satisfiedDimensions, 'satisfiedDimensions'))
  const declaredResidual = uniqueSorted(asStrings(raw.residualDimensions, 'residualDimensions'))
  if (JSON.stringify(declaredSatisfied) !== JSON.stringify(satisfied)) throw new Error('DPL-15E satisfiedDimensions disagree with readiness records.')
  if (JSON.stringify(declaredResidual) !== JSON.stringify(residual)) throw new Error('DPL-15E residualDimensions disagree with readiness records.')

  const r1 = readiness.find((entry) => entry.dimension === 'R1_CONTROLLED_SPATIAL_IDENTITY')!
  const r2 = readiness.find((entry) => entry.dimension === 'R2_FOOTPRINT_TEST_GEOMETRY')!
  const r4 = readiness.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')!
  const r5 = readiness.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY')!
  if (!/boundary coordinates|placement-ready/i.test(r1.reason)) throw new Error('R1 must remain blocked on placement-ready controlled geometry, not mere source discovery.')
  if (!/1:100|boundary shape|dimensions/i.test(r2.reason) || !/non-transferable/i.test(r2.reason)) throw new Error('R2 must preserve the scaled-plan / applicant-house non-transfer boundary.')
  if (!/Environment Agency DTM|elevation/i.test(r4.reason)) throw new Error('R4 must remain blocked pending controlled terrain/datum evidence.')
  if (!/frontage|access geometry|adopted-highway/i.test(r5.reason)) throw new Error('R5 must remain blocked pending exact physical access geometry.')

  const site = asString(raw.site, 'site')
  const researchDate = asString(raw.researchDate, 'researchDate')
  const nextNoSpendRoute = asStrings(raw.nextNoSpendRoute, 'nextNoSpendRoute')

  return {
    schemaVersion: DPL15E_SCHEMA_VERSION,
    packet: DPL15E_PACKET,
    siteId: DPL15E_SITE_ID,
    site,
    assuranceProfile: 'SCREENING',
    researchDate,
    parentReadiness: {
      assessmentId: 'DPL-15C-CORPUS-1-v0.1',
      path: parentPath,
      gitBlobSha: parentBlob,
      corpusIndexGitBlobSha: asString(parent.corpusIndexGitBlobSha, 'parentReadiness.corpusIndexGitBlobSha'),
      rp006RecordGitBlobSha: asString(parent.rp006RecordGitBlobSha, 'parentReadiness.rp006RecordGitBlobSha')
    },
    sources,
    coordinateFrame: {
      bng: [frame.bng[0] as number, frame.bng[1] as number],
      crs: 'EPSG:27700',
      derivedWgs84: [frame.derivedWgs84[0] as number, frame.derivedWgs84[1] as number],
      derivation: asString(frame.derivation, 'coordinateFrame.derivation')
    },
    readiness,
    candidateAuthoringReady: false,
    satisfiedDimensions: satisfied,
    residualDimensions: residual,
    nextNoSpendRoute,
    result: DPL15E_RESULT
  }
}

export const composeDPL15ERp006 = (
  value: unknown = JSON.parse(readText(DPL15E_PATH)) as unknown
): DPL15EResult => {
  const preflight = validateDPL15ERp006(value)
  const canonical = {
    schemaVersion: preflight.schemaVersion,
    packet: preflight.packet,
    siteId: preflight.siteId,
    site: preflight.site,
    assuranceProfile: preflight.assuranceProfile,
    researchDate: preflight.researchDate,
    parentReadiness: preflight.parentReadiness,
    sources: preflight.sources,
    coordinateFrame: preflight.coordinateFrame,
    readiness: preflight.readiness,
    candidateAuthoringReady: preflight.candidateAuthoringReady,
    satisfiedDimensions: preflight.satisfiedDimensions,
    residualDimensions: preflight.residualDimensions,
    nextNoSpendRoute: preflight.nextNoSpendRoute,
    result: preflight.result
  }
  return {
    siteId: DPL15E_SITE_ID,
    result: DPL15E_RESULT,
    candidateAuthoringReady: false,
    satisfiedDimensions: preflight.satisfiedDimensions,
    residualDimensions: preflight.residualDimensions,
    counts: { satisfied: preflight.satisfiedDimensions.length, residual: preflight.residualDimensions.length },
    sourceIds: preflight.sources.map((source) => source.id).sort(),
    resultFingerprint: sha256SemanticFingerprint(canonical),
    proofBoundary: {
      referenceHouseCandidate: 'NOT_AUTHORISED',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      dpl16: 'HELD'
    }
  }
}
