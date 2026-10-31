import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { composeDPLR1ControlReadiness } from './control-site-readiness.js'

export const DPLR2_SCHEMA_VERSION = 'dpl.realControlCandidateAuthoring.v1' as const
export const DPLR2_RESULT_ID = 'DPL-R2-UPHILL-24-1141-v0.1' as const
export const DPLR2_RESULT_PATH = 'project/dpl/sites/dpl-control-001-92-uphill-road-candidate-v01.json' as const

export type DPLR2ResultState =
  | 'REAL_CONTROL_CANDIDATE_AUTHORED'
  | 'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED'
  | 'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_FOOTPRINT_NO_FIT'
  | 'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_SOURCE_CONFLICT'

interface RecoveryAttempt {
  readonly id: string
  readonly route: string
  readonly outcome: string
  readonly detail: string
}

interface RawDPLR2Result {
  readonly schemaVersion: typeof DPLR2_SCHEMA_VERSION
  readonly resultId: typeof DPLR2_RESULT_ID
  readonly controlSiteId: 'DPL-R-CONTROL-001'
  readonly parentReadiness: {
    readonly assessmentPath: string
    readonly requiredResult: 'CONTROL_SITE_CANDIDATE_AUTHORING_READY'
  }
  readonly geometryAuthority: {
    readonly sourceId: 'U24-S1'
    readonly documentIdentity: string
    readonly declaredSitePlanScale: '1:200 A1'
    readonly proposalBoundaryClass: 'RED_PROPOSAL_DEMISE'
    readonly allowedRecoveryRoutes: readonly string[]
    readonly forbiddenRecoveryRoutes: readonly string[]
  }
  readonly geometryRecovery: {
    readonly state: 'NOT_RECOVERED_CONTROLLED_VECTOR_OR_COORDINATES' | 'RECOVERED_CONTROLLED_GEOMETRY'
    readonly attempts: readonly RecoveryAttempt[]
    readonly screeningReadinessImplication: 'NONE_DPL_R1_REMAINS_VALID'
    readonly candidateAuthoringImplication: 'FAIL_CLOSED_NO_PLACEMENT_COORDINATES' | 'PLACEMENT_AUTHORING_ADMITTED'
  }
  readonly referenceHouse: {
    readonly footprintMm: { readonly width: 12000; readonly depth: 10800 }
    readonly mutation: 'FORBIDDEN'
  }
  readonly candidate: null | Record<string, unknown>
  readonly result: DPLR2ResultState
  readonly proofBoundary: {
    readonly referenceHouseCandidate: 'NOT_AUTHORED' | 'AUTHORED'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'FORBIDDEN'
    readonly originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008'
    readonly originalDpl15cReadyCount: 0
    readonly deploymentEnvelopeSampleMembership: 'EXCLUDED'
    readonly deploymentEnvelopeDpl16: 'HELD'
    readonly scalarSiteScore: 'FORBIDDEN'
  }
}

export interface DPLR2ValidatedResult extends RawDPLR2Result {
  readonly parentReadinessFingerprint: string
  readonly resultFingerprint: string
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

const exact = <T extends string | number | boolean | null>(value: unknown, expected: T, label: string): T => {
  if (value !== expected) throw new Error(`${label} must equal ${String(expected)}; got ${String(value)}.`)
  return expected
}

const sortedUniqueStrings = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a non-empty array.`)
  const strings = value.map((entry, index) => asString(entry, `${label}[${index}]`))
  if (new Set(strings).size !== strings.length) throw new Error(`${label} must not contain duplicates.`)
  return [...strings].sort((a, b) => a.localeCompare(b))
}

const canonicalAttempt = (value: unknown, index: number): RecoveryAttempt => {
  const raw = asRecord(value, `geometryRecovery.attempts[${index}]`)
  return {
    id: asString(raw.id, `geometryRecovery.attempts[${index}].id`),
    route: asString(raw.route, `geometryRecovery.attempts[${index}].route`),
    outcome: asString(raw.outcome, `geometryRecovery.attempts[${index}].outcome`),
    detail: asString(raw.detail, `geometryRecovery.attempts[${index}].detail`)
  }
}

export const validateDPLR2Result = (value: unknown): DPLR2ValidatedResult => {
  const raw = asRecord(value, 'DPL-R2 result')
  exact(raw.schemaVersion, DPLR2_SCHEMA_VERSION, 'schemaVersion')
  exact(raw.resultId, DPLR2_RESULT_ID, 'resultId')
  exact(raw.controlSiteId, 'DPL-R-CONTROL-001', 'controlSiteId')

  const parent = asRecord(raw.parentReadiness, 'parentReadiness')
  exact(parent.assessmentPath, 'project/dpl/sites/dpl-control-001-92-uphill-road-readiness-v01.json', 'parentReadiness.assessmentPath')
  exact(parent.requiredResult, 'CONTROL_SITE_CANDIDATE_AUTHORING_READY', 'parentReadiness.requiredResult')

  const readiness = composeDPLR1ControlReadiness()
  if (readiness.readiness !== 'CONTROL_SITE_CANDIDATE_AUTHORING_READY') {
    throw new Error(`DPL-R2 requires landed DPL-R1 readiness; got ${readiness.readiness}.`)
  }

  const authority = asRecord(raw.geometryAuthority, 'geometryAuthority')
  exact(authority.sourceId, 'U24-S1', 'geometryAuthority.sourceId')
  const documentIdentity = asString(authority.documentIdentity, 'geometryAuthority.documentIdentity')
  if (!/255402\/12 Rev B/.test(documentIdentity)) throw new Error('DPL-R2 must bind drawing 255402/12 Rev B.')
  exact(authority.declaredSitePlanScale, '1:200 A1', 'geometryAuthority.declaredSitePlanScale')
  exact(authority.proposalBoundaryClass, 'RED_PROPOSAL_DEMISE', 'geometryAuthority.proposalBoundaryClass')
  const allowedRecoveryRoutes = sortedUniqueStrings(authority.allowedRecoveryRoutes, 'geometryAuthority.allowedRecoveryRoutes')
  const forbiddenRecoveryRoutes = sortedUniqueStrings(authority.forbiddenRecoveryRoutes, 'geometryAuthority.forbiddenRecoveryRoutes')

  const recovery = asRecord(raw.geometryRecovery, 'geometryRecovery')
  const recoveryState = asString(recovery.state, 'geometryRecovery.state')
  if (recoveryState !== 'NOT_RECOVERED_CONTROLLED_VECTOR_OR_COORDINATES' && recoveryState !== 'RECOVERED_CONTROLLED_GEOMETRY') {
    throw new Error(`Unsupported geometryRecovery.state ${recoveryState}.`)
  }
  if (!Array.isArray(recovery.attempts) || recovery.attempts.length === 0) throw new Error('geometryRecovery.attempts must not be empty.')
  const attempts = recovery.attempts.map(canonicalAttempt).sort((a, b) => a.id.localeCompare(b.id))
  if (new Set(attempts.map((attempt) => attempt.id)).size !== attempts.length) throw new Error('geometryRecovery attempt ids must be unique.')
  exact(recovery.screeningReadinessImplication, 'NONE_DPL_R1_REMAINS_VALID', 'geometryRecovery.screeningReadinessImplication')
  const candidateAuthoringImplication = asString(recovery.candidateAuthoringImplication, 'geometryRecovery.candidateAuthoringImplication')
  if (candidateAuthoringImplication !== 'FAIL_CLOSED_NO_PLACEMENT_COORDINATES' && candidateAuthoringImplication !== 'PLACEMENT_AUTHORING_ADMITTED') {
    throw new Error(`Unsupported candidateAuthoringImplication ${candidateAuthoringImplication}.`)
  }

  const referenceHouse = asRecord(raw.referenceHouse, 'referenceHouse')
  const footprint = asRecord(referenceHouse.footprintMm, 'referenceHouse.footprintMm')
  exact(footprint.width, 12000, 'referenceHouse.footprintMm.width')
  exact(footprint.depth, 10800, 'referenceHouse.footprintMm.depth')
  exact(referenceHouse.mutation, 'FORBIDDEN', 'referenceHouse.mutation')

  const result = asString(raw.result, 'result') as DPLR2ResultState
  const allowedResults: readonly DPLR2ResultState[] = [
    'REAL_CONTROL_CANDIDATE_AUTHORED',
    'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED',
    'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_FOOTPRINT_NO_FIT',
    'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_SOURCE_CONFLICT'
  ]
  if (!allowedResults.includes(result)) throw new Error(`Unsupported DPL-R2 result ${result}.`)

  const candidate = raw.candidate === null ? null : asRecord(raw.candidate, 'candidate')
  if (recoveryState === 'NOT_RECOVERED_CONTROLLED_VECTOR_OR_COORDINATES') {
    if (candidate !== null) throw new Error('DPL-R2 cannot author a candidate when controlled geometry was not recovered.')
    if (candidateAuthoringImplication !== 'FAIL_CLOSED_NO_PLACEMENT_COORDINATES') {
      throw new Error('Unrecovered geometry must fail candidate authoring closed.')
    }
    if (result !== 'REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED') {
      throw new Error('Unrecovered geometry must produce REAL_CONTROL_CANDIDATE_NOT_AUTHORED_GEOMETRY_RECOVERY_FAILED.')
    }
  }
  if (result === 'REAL_CONTROL_CANDIDATE_AUTHORED' && (recoveryState !== 'RECOVERED_CONTROLLED_GEOMETRY' || candidate === null)) {
    throw new Error('REAL_CONTROL_CANDIDATE_AUTHORED requires recovered controlled geometry and a candidate.')
  }

  const boundary = asRecord(raw.proofBoundary, 'proofBoundary')
  const expectedCandidateBoundary = result === 'REAL_CONTROL_CANDIDATE_AUTHORED' ? 'AUTHORED' : 'NOT_AUTHORED'
  exact(boundary.referenceHouseCandidate, expectedCandidateBoundary, 'proofBoundary.referenceHouseCandidate')
  exact(boundary.compatibleAtScreening, 'NOT_ADMITTED', 'proofBoundary.compatibleAtScreening')
  exact(boundary.incompatible, 'NOT_ADMITTED', 'proofBoundary.incompatible')
  exact(boundary.routeExhaustion, 'NOT_IMPLEMENTED', 'proofBoundary.routeExhaustion')
  exact(boundary.referenceHouseMutation, 'FORBIDDEN', 'proofBoundary.referenceHouseMutation')
  exact(boundary.originalDpl15cCorpus, 'UNCHANGED_DPL_RP_001_THROUGH_008', 'proofBoundary.originalDpl15cCorpus')
  exact(boundary.originalDpl15cReadyCount, 0, 'proofBoundary.originalDpl15cReadyCount')
  exact(boundary.deploymentEnvelopeSampleMembership, 'EXCLUDED', 'proofBoundary.deploymentEnvelopeSampleMembership')
  exact(boundary.deploymentEnvelopeDpl16, 'HELD', 'proofBoundary.deploymentEnvelopeDpl16')
  exact(boundary.scalarSiteScore, 'FORBIDDEN', 'proofBoundary.scalarSiteScore')

  const canonical: RawDPLR2Result = {
    schemaVersion: DPLR2_SCHEMA_VERSION,
    resultId: DPLR2_RESULT_ID,
    controlSiteId: 'DPL-R-CONTROL-001',
    parentReadiness: {
      assessmentPath: 'project/dpl/sites/dpl-control-001-92-uphill-road-readiness-v01.json',
      requiredResult: 'CONTROL_SITE_CANDIDATE_AUTHORING_READY'
    },
    geometryAuthority: {
      sourceId: 'U24-S1',
      documentIdentity,
      declaredSitePlanScale: '1:200 A1',
      proposalBoundaryClass: 'RED_PROPOSAL_DEMISE',
      allowedRecoveryRoutes,
      forbiddenRecoveryRoutes
    },
    geometryRecovery: {
      state: recoveryState as RawDPLR2Result['geometryRecovery']['state'],
      attempts,
      screeningReadinessImplication: 'NONE_DPL_R1_REMAINS_VALID',
      candidateAuthoringImplication: candidateAuthoringImplication as RawDPLR2Result['geometryRecovery']['candidateAuthoringImplication']
    },
    referenceHouse: {
      footprintMm: { width: 12000, depth: 10800 },
      mutation: 'FORBIDDEN'
    },
    candidate,
    result,
    proofBoundary: {
      referenceHouseCandidate: expectedCandidateBoundary,
      compatibleAtScreening: 'NOT_ADMITTED',
      incompatible: 'NOT_ADMITTED',
      routeExhaustion: 'NOT_IMPLEMENTED',
      referenceHouseMutation: 'FORBIDDEN',
      originalDpl15cCorpus: 'UNCHANGED_DPL_RP_001_THROUGH_008',
      originalDpl15cReadyCount: 0,
      deploymentEnvelopeSampleMembership: 'EXCLUDED',
      deploymentEnvelopeDpl16: 'HELD',
      scalarSiteScore: 'FORBIDDEN'
    }
  }

  const resultFingerprint = sha256SemanticFingerprint({
    parentReadinessFingerprint: readiness.resultFingerprint,
    result: canonical
  })

  return {
    ...canonical,
    parentReadinessFingerprint: readiness.resultFingerprint,
    resultFingerprint
  }
}

export const composeDPLR2ControlCandidate = (
  value: unknown = JSON.parse(text(DPLR2_RESULT_PATH)) as unknown
): DPLR2ValidatedResult => validateDPLR2Result(value)
