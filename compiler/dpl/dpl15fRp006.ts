import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPL15ERp006, DPL15E_DIMENSIONS, type DPL15EDimension } from './dpl15eRp006.js'

export const DPL15F_PATH = 'project/dpl/sites/dpl-rp-006-15f-residual-recovery-v01.json' as const
export const DPL15F_SCHEMA_VERSION = 'dpl.rp006ResidualRecovery.v1' as const
export const DPL15F_RESULT = 'RP006_NOT_READY_RESIDUAL_PUBLIC_GEOMETRY_DATUM_BOUNDARY' as const
export const DPL15F_EXPECTED_PARENT = '54c9dc580265e2b74f0cb5fa6113da4a93503265a38e9c96046477f3d48e9d8f' as const
export const DPL15F_RESIDUAL_UNIVERSE = [
  'R1_CONTROLLED_SPATIAL_IDENTITY',
  'R2_FOOTPRINT_TEST_GEOMETRY',
  'R4_DATUM_LEVEL_EVIDENCE',
  'R5_PHYSICAL_ACCESS_STREET_GEOMETRY'
] as const

type RecoveryOutcome =
  | 'ROUTE_CONFIRMED_EXACT_RESPONSE_BYTES_NOT_ACQUIRED'
  | 'SCALED_DRAWING_EXISTENCE_AND_TEXT_INDEXED_BYTES_NOT_ACQUIRED_FOR_CONTROLLED_GEOMETRY'
  | 'OFFICIAL_ROUTE_AND_COVERAGE_ID_CONFIRMED_RASTER_BYTES_NOT_ACQUIRED'
  | 'NUMERIC_APPROXIMATE_LEVEL_RECOVERED_AUTHORITY_INSUFFICIENT_FOR_R4'
  | 'PHYSICAL_APPROACH_CONTEXT_IMPROVED_PLACEMENT_GEOMETRY_STILL_NOT_CONTROLLED'
  | 'LEGAL_PACK_EXISTENCE_CONFIRMED_CONTROLLED_PACK_BYTES_NOT_ACQUIRED'

interface RecoveryAttempt {
  readonly id: string
  readonly targetDimensions: readonly DPL15EDimension[]
  readonly sourceClass: string
  readonly source: string
  readonly route: string
  readonly outcome: RecoveryOutcome
  readonly observed?: readonly string[]
  readonly authorityBoundary: string
}

interface ReadinessRecord {
  readonly dimension: DPL15EDimension
  readonly state: 'SATISFIED' | 'NOT_SATISFIED'
  readonly evidenceRefs: readonly string[]
  readonly reason: string
}

interface RawDPL15F {
  readonly schemaVersion: typeof DPL15F_SCHEMA_VERSION
  readonly packet: 'DPL-15F'
  readonly siteId: 'DPL-RP-006'
  readonly assuranceProfile: 'SCREENING'
  readonly researchDate: string
  readonly parent: {
    readonly packet: 'DPL-15E'
    readonly mergeSha: string
    readonly resultFingerprint: typeof DPL15F_EXPECTED_PARENT
    readonly record: string
  }
  readonly residualInputUniverse: readonly DPL15EDimension[]
  readonly recoveryAttempts: readonly RecoveryAttempt[]
  readonly readiness: readonly ReadinessRecord[]
  readonly satisfiedDimensions: readonly DPL15EDimension[]
  readonly residualDimensions: readonly DPL15EDimension[]
  readonly candidateAuthoringReady: false
  readonly sourceConflict: false
  readonly nextCorpusComparison: readonly ['DPL-RP-007', 'DPL-RP-008']
  readonly result: typeof DPL15F_RESULT
  readonly proofBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORISED'
    readonly referenceHouseMutation: 'PROHIBITED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly dpl16: 'HELD'
    readonly externalSpend: 'NONE'
  }
}

export interface DPL15FResult {
  readonly result: typeof DPL15F_RESULT
  readonly candidateAuthoringReady: false
  readonly satisfiedDimensions: readonly DPL15EDimension[]
  readonly residualDimensions: readonly DPL15EDimension[]
  readonly recoveryAttemptCount: number
  readonly resultFingerprint: string
  readonly nextCorpusComparison: readonly ['DPL-RP-007', 'DPL-RP-008']
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
const asStrings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  return value.map((entry, index) => asString(entry, `${label}[${index}]`))
}
const exact = <T extends string | boolean>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}
const uniqueSorted = (values: readonly string[]): string[] => [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))
const dimension = (value: unknown, label: string): DPL15EDimension => {
  const candidate = asString(value, label)
  if (!(DPL15E_DIMENSIONS as readonly string[]).includes(candidate)) throw new Error(`${label} has unsupported dimension ${candidate}.`)
  return candidate as DPL15EDimension
}

export const validateDPL15FRp006 = (value: unknown): RawDPL15F => {
  const raw = asRecord(value, 'DPL-15F result')
  exact(raw.schemaVersion, DPL15F_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.packet, 'DPL-15F', 'packet')
  exact(raw.siteId, 'DPL-RP-006', 'siteId')
  exact(raw.assuranceProfile, 'SCREENING', 'assuranceProfile')
  exact(raw.result, DPL15F_RESULT, 'result')
  exact(raw.candidateAuthoringReady, false, 'candidateAuthoringReady')
  exact(raw.sourceConflict, false, 'sourceConflict')

  const parent = asRecord(raw.parent, 'parent')
  exact(parent.packet, 'DPL-15E', 'parent.packet')
  exact(parent.resultFingerprint, DPL15F_EXPECTED_PARENT, 'parent.resultFingerprint')
  const liveParent = composeDPL15ERp006()
  if (liveParent.resultFingerprint !== DPL15F_EXPECTED_PARENT) {
    throw new Error(`DPL-15F parent drift: expected ${DPL15F_EXPECTED_PARENT}, got ${liveParent.resultFingerprint}.`)
  }

  if (!Array.isArray(raw.residualInputUniverse)) throw new Error('residualInputUniverse must be an array.')
  const residualInputUniverse = raw.residualInputUniverse.map((entry, index) => dimension(entry, `residualInputUniverse[${index}]`)).sort()
  if (JSON.stringify(residualInputUniverse) !== JSON.stringify([...DPL15F_RESIDUAL_UNIVERSE].sort())) {
    throw new Error('DPL-15F residual input universe must be exactly R1/R2/R4/R5.')
  }

  if (!Array.isArray(raw.recoveryAttempts) || raw.recoveryAttempts.length !== 6) throw new Error('DPL-15F requires exactly six bounded recovery attempts.')
  const allowedOutcomes: readonly RecoveryOutcome[] = [
    'ROUTE_CONFIRMED_EXACT_RESPONSE_BYTES_NOT_ACQUIRED',
    'SCALED_DRAWING_EXISTENCE_AND_TEXT_INDEXED_BYTES_NOT_ACQUIRED_FOR_CONTROLLED_GEOMETRY',
    'OFFICIAL_ROUTE_AND_COVERAGE_ID_CONFIRMED_RASTER_BYTES_NOT_ACQUIRED',
    'NUMERIC_APPROXIMATE_LEVEL_RECOVERED_AUTHORITY_INSUFFICIENT_FOR_R4',
    'PHYSICAL_APPROACH_CONTEXT_IMPROVED_PLACEMENT_GEOMETRY_STILL_NOT_CONTROLLED',
    'LEGAL_PACK_EXISTENCE_CONFIRMED_CONTROLLED_PACK_BYTES_NOT_ACQUIRED'
  ]
  const recoveryAttempts: RecoveryAttempt[] = raw.recoveryAttempts.map((entry, index) => {
    const record = asRecord(entry, `recoveryAttempts[${index}]`)
    const outcome = asString(record.outcome, `recoveryAttempts[${index}].outcome`)
    if (!allowedOutcomes.includes(outcome as RecoveryOutcome)) throw new Error(`Unsupported DPL-15F recovery outcome ${outcome}.`)
    if (!Array.isArray(record.targetDimensions) || record.targetDimensions.length === 0) throw new Error('Recovery attempt must target at least one residual dimension.')
    const targets = record.targetDimensions.map((target, targetIndex) => dimension(target, `recoveryAttempts[${index}].targetDimensions[${targetIndex}]`)).sort()
    for (const target of targets) if (!(DPL15F_RESIDUAL_UNIVERSE as readonly string[]).includes(target)) throw new Error(`Recovery attempt targets non-residual dimension ${target}.`)
    const observed = record.observed === undefined ? undefined : uniqueSorted(asStrings(record.observed, `recoveryAttempts[${index}].observed`))
    return {
      id: asString(record.id, `recoveryAttempts[${index}].id`),
      targetDimensions: targets,
      sourceClass: asString(record.sourceClass, `recoveryAttempts[${index}].sourceClass`),
      source: asString(record.source, `recoveryAttempts[${index}].source`),
      route: asString(record.route, `recoveryAttempts[${index}].route`),
      outcome: outcome as RecoveryOutcome,
      ...(observed ? { observed } : {}),
      authorityBoundary: asString(record.authorityBoundary, `recoveryAttempts[${index}].authorityBoundary`)
    }
  }).sort((a, b) => compareDplIdentityStrings(a.id, b.id))
  if (new Set(recoveryAttempts.map((attempt) => attempt.id)).size !== recoveryAttempts.length) throw new Error('DPL-15F recovery attempt ids must be unique.')

  if (!Array.isArray(raw.readiness) || raw.readiness.length !== DPL15E_DIMENSIONS.length) throw new Error('DPL-15F must return all six readiness dimensions.')
  const readiness: ReadinessRecord[] = raw.readiness.map((entry, index) => {
    const record = asRecord(entry, `readiness[${index}]`)
    const dim = dimension(record.dimension, `readiness[${index}].dimension`)
    const state = asString(record.state, `${dim}.state`)
    if (state !== 'SATISFIED' && state !== 'NOT_SATISFIED') throw new Error(`${dim} has unsupported state ${state}.`)
    return {
      dimension: dim,
      state: state as ReadinessRecord['state'],
      evidenceRefs: uniqueSorted(asStrings(record.evidenceRefs, `${dim}.evidenceRefs`)),
      reason: asString(record.reason, `${dim}.reason`)
    }
  }).sort((a, b) => compareDplIdentityStrings(a.dimension, b.dimension))
  if (JSON.stringify(readiness.map((entry) => entry.dimension)) !== JSON.stringify([...DPL15E_DIMENSIONS].sort())) throw new Error('DPL-15F readiness universe must be exactly R1-R6.')

  const satisfied = readiness.filter((entry) => entry.state === 'SATISFIED').map((entry) => entry.dimension).sort()
  if (JSON.stringify(satisfied) !== JSON.stringify(['R3_REAL_ORIENTATION_FRAME', 'R6_SITE_IDENTITY_COHERENCE'])) throw new Error('DPL-15F has not earned any readiness promotion beyond R3/R6.')
  const residual = readiness.filter((entry) => entry.state === 'NOT_SATISFIED').map((entry) => entry.dimension).sort()
  if (JSON.stringify(residual) !== JSON.stringify([...DPL15F_RESIDUAL_UNIVERSE].sort())) throw new Error('DPL-15F residual frontier must remain exactly R1/R2/R4/R5.')

  const r4 = readiness.find((entry) => entry.dimension === 'R4_DATUM_LEVEL_EVIDENCE')!
  if (!/Google Earth/i.test(r4.reason) || !/no site walkover/i.test(r4.reason)) throw new Error('DPL-15F R4 must preserve the weak-source reason for rejecting the approximate 5.0 mAOD level.')
  const r5 = readiness.find((entry) => entry.dimension === 'R5_PHYSICAL_ACCESS_STREET_GEOMETRY')!
  if (!/adopted-highway/i.test(r5.reason) || !/controlled placement geometry/i.test(r5.reason)) throw new Error('DPL-15F R5 must preserve the physical-geometry/highway boundary.')

  const declaredSatisfied = uniqueSorted(asStrings(raw.satisfiedDimensions, 'satisfiedDimensions'))
  const declaredResidual = uniqueSorted(asStrings(raw.residualDimensions, 'residualDimensions'))
  if (JSON.stringify(declaredSatisfied) !== JSON.stringify(satisfied)) throw new Error('satisfiedDimensions disagree with readiness records.')
  if (JSON.stringify(declaredResidual) !== JSON.stringify(residual)) throw new Error('residualDimensions disagree with readiness records.')

  if (!Array.isArray(raw.nextCorpusComparison) || JSON.stringify(raw.nextCorpusComparison) !== JSON.stringify(['DPL-RP-007', 'DPL-RP-008'])) throw new Error('DPL-15F next corpus comparison must be RP-007 then RP-008 as a categorical shortlist.')

  const boundary = asRecord(raw.proofBoundary, 'proofBoundary')
  exact(boundary.referenceHouseCandidate, 'NOT_AUTHORISED', 'proofBoundary.referenceHouseCandidate')
  exact(boundary.referenceHouseMutation, 'PROHIBITED', 'proofBoundary.referenceHouseMutation')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'proofBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'proofBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'proofBoundary.routeExhaustion')
  exact(boundary.dpl16, 'HELD', 'proofBoundary.dpl16')
  exact(boundary.externalSpend, 'NONE', 'proofBoundary.externalSpend')

  return {
    schemaVersion: DPL15F_SCHEMA_VERSION,
    packet: 'DPL-15F',
    siteId: 'DPL-RP-006',
    assuranceProfile: 'SCREENING',
    researchDate: asString(raw.researchDate, 'researchDate'),
    parent: {
      packet: 'DPL-15E',
      mergeSha: asString(parent.mergeSha, 'parent.mergeSha'),
      resultFingerprint: DPL15F_EXPECTED_PARENT,
      record: asString(parent.record, 'parent.record')
    },
    residualInputUniverse,
    recoveryAttempts,
    readiness,
    satisfiedDimensions: satisfied,
    residualDimensions: residual,
    candidateAuthoringReady: false,
    sourceConflict: false,
    nextCorpusComparison: ['DPL-RP-007', 'DPL-RP-008'],
    result: DPL15F_RESULT,
    proofBoundary: {
      referenceHouseCandidate: 'NOT_AUTHORISED',
      referenceHouseMutation: 'PROHIBITED',
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      dpl16: 'HELD',
      externalSpend: 'NONE'
    }
  }
}

export const composeDPL15FRp006 = (value: unknown = JSON.parse(text(DPL15F_PATH)) as unknown): DPL15FResult => {
  const validated = validateDPL15FRp006(value)
  const canonical = {
    schemaVersion: validated.schemaVersion,
    packet: validated.packet,
    siteId: validated.siteId,
    assuranceProfile: validated.assuranceProfile,
    researchDate: validated.researchDate,
    parent: validated.parent,
    residualInputUniverse: validated.residualInputUniverse,
    recoveryAttempts: validated.recoveryAttempts,
    readiness: validated.readiness,
    satisfiedDimensions: validated.satisfiedDimensions,
    residualDimensions: validated.residualDimensions,
    candidateAuthoringReady: validated.candidateAuthoringReady,
    sourceConflict: validated.sourceConflict,
    nextCorpusComparison: validated.nextCorpusComparison,
    result: validated.result,
    proofBoundary: validated.proofBoundary
  }
  return {
    result: DPL15F_RESULT,
    candidateAuthoringReady: false,
    satisfiedDimensions: validated.satisfiedDimensions,
    residualDimensions: validated.residualDimensions,
    recoveryAttemptCount: validated.recoveryAttempts.length,
    resultFingerprint: sha256DplSemanticFingerprint(canonical),
    nextCorpusComparison: validated.nextCorpusComparison
  }
}
