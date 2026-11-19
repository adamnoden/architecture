import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPLT9LennardNoCostClosure } from './dplT9Lennard.js'

export const DPL_T10_SCHEMA_VERSION = 'DPL-T10-LENNARD-NO-COST-EXECUTION-1' as const
export const DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT =
  '55c7020d704b1285527c7249c961783185f56d467e0cdd7f5c93fcdc80393e6a' as const
export const DPL_T10_EVIDENCE_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-t10-no-cost-evidence-v01.json' as const
export const DPL_T10_PLANNING_REVIEW_PATH =
  'project/dpl/dpl-t10-lennard-planning-context-execution.md' as const

export const dplT10DependencyStates = [
  'NO_COST_PUBLIC_RECOVERY_BLOCKED',
  'ELIGIBLE_FOR_COMMISSIONING_NOT_COMMISSIONED',
  'EXECUTED_CONCERN_FOLDED_INTO_EXISTING_DEPENDENCY'
] as const
export type DPLT10DependencyState = (typeof dplT10DependencyStates)[number]

type T9Dependency =
  | 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'
  | 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW'
  | 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
  | 'PLANNING_DESIGN_CONTEXT_REVIEW'

interface T10EvidenceRecord {
  readonly schemaVersion: 'dpl.lennardT10NoCostEvidence.v1'
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly researchDate: '2026-10-26'
  readonly assuranceProfile: 'SCREENING'
  readonly parentT9ResultFingerprint: typeof DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT
  readonly authorityBoundary: string
  readonly floodRecovery: {
    readonly targetPostcode: 'BR2 8LN'
    readonly attemptState: 'COMPETENT_RESOURCE_IDENTIFIED_BYTES_NOT_ACQUIRED_BY_EXECUTION_ENVIRONMENT'
    readonly result: 'PUBLIC_AUTHORITY_RECOVERY_TECHNICALLY_BLOCKED_NOT_SUBSTANTIVELY_RESOLVED'
  }
  readonly planningContext: {
    readonly historicalApplication: '23/00297/FULL6'
    readonly historicalDecisionDate: '2024-03-21'
    readonly candidateFacts: readonly string[]
    readonly siteContextFacts: readonly string[]
    readonly authorityRules: readonly string[]
  }
}

export interface DPLT10DependencyRecord {
  readonly dependencyClass: T9Dependency
  readonly state: DPLT10DependencyState
  readonly consumers: readonly string[]
  readonly successorDependencyClass: T9Dependency | null
  readonly commissioningEligible: boolean
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly fingerprint: string
}

export interface DPLT10Result {
  readonly schemaVersion: typeof DPL_T10_SCHEMA_VERSION
  readonly t9ResultFingerprint: typeof DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly evidenceFingerprint: string
  readonly inputDependencyCount: 4
  readonly records: readonly DPLT10DependencyRecord[]
  readonly activeDependencyClasses: readonly T9Dependency[]
  readonly activeDependencyCount: 3
  readonly externalEvidenceEligibleForCommissioning: readonly T9Dependency[]
  readonly noCostPublicRecoveryPending: readonly T9Dependency[]
  readonly foldedDependencies: readonly T9Dependency[]
  readonly planningReviewResult: 'SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN'
  readonly result: 'NO_COST_EXECUTION_COMPLETE_THREE_DEPENDENCIES_REMAIN_TWO_COMMISSIONING_ELIGIBLE'
  readonly proofBoundary: {
    readonly externalCommissioning: 'NO'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'NO'
    readonly statutoryPlanningDetermination: 'NO'
    readonly legalBoundaryDetermined: 'NO'
    readonly floodConclusion: 'NOT_RESOLVED'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const readEvidence = (): { record: T10EvidenceRecord; fingerprint: string } => {
  const record = JSON.parse(readText(DPL_T10_EVIDENCE_PATH)) as T10EvidenceRecord
  if (record.schemaVersion !== 'dpl.lennardT10NoCostEvidence.v1') throw new Error('DPL-T10 evidence schema drifted.')
  if (record.controlId !== 'DPL-T-CONTROL-004' || record.candidateId !== 'DPL-T-CANDIDATE-004-01') {
    throw new Error('DPL-T10 evidence identity drifted.')
  }
  if (record.parentT9ResultFingerprint !== DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT) {
    throw new Error('DPL-T10 evidence parent fingerprint drifted.')
  }
  if (record.floodRecovery.targetPostcode !== 'BR2 8LN') throw new Error('DPL-T10 flood target drifted.')
  if (record.floodRecovery.result !== 'PUBLIC_AUTHORITY_RECOVERY_TECHNICALLY_BLOCKED_NOT_SUBSTANTIVELY_RESOLVED') {
    throw new Error('DPL-T10 flood recovery result drifted.')
  }
  if (record.planningContext.historicalApplication !== '23/00297/FULL6' || record.planningContext.historicalDecisionDate !== '2024-03-21') {
    throw new Error('DPL-T10 planning-history identity drifted.')
  }
  return { record, fingerprint: sha256DplSemanticFingerprint(record) }
}

const assertPlanningExecution = (): void => {
  const review = readText(DPL_T10_PLANNING_REVIEW_PATH)
  if (!review.includes('SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN')) {
    throw new Error('DPL-T10 planning execution result drifted.')
  }
  if (!review.includes('MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY')) {
    throw new Error('DPL-T10 planning execution must fold into existing measured-geometry dependency.')
  }
  if (!review.includes('new planning-consultant dependency             = NONE')) {
    throw new Error('DPL-T10 planning execution created unearned planning procurement.')
  }
}

export const composeDPLT10LennardNoCostExecution = (): DPLT10Result => {
  const t9 = composeDPLT9LennardNoCostClosure()
  if (t9.resultFingerprint !== DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT) {
    throw new Error(`DPL-T10 parent T9 drifted: ${t9.resultFingerprint}.`)
  }
  if (t9.decisionDependencies.length !== 4) throw new Error('DPL-T10 expected four T9 decision dependencies.')

  const evidence = readEvidence()
  assertPlanningExecution()

  const expected = [
    'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
    'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
    'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
    'PLANNING_DESIGN_CONTEXT_REVIEW'
  ].sort((a, b) => compareDplIdentityStrings(a, b))
  if (JSON.stringify([...t9.decisionDependencies].sort((a, b) => compareDplIdentityStrings(a, b))) !== JSON.stringify(expected)) {
    throw new Error('DPL-T10 parent dependency universe drifted.')
  }

  const rawRecords: Omit<DPLT10DependencyRecord, 'fingerprint'>[] = [
    {
      dependencyClass: 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
      state: 'NO_COST_PUBLIC_RECOVERY_BLOCKED',
      consumers: [...t9.dependencyConsumers.EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY],
      successorDependencyClass: null,
      commissioningEligible: false,
      reason: 'The competent Environment Agency CSV resource was identified directly, but its bytes/BR2 8LN row could not be acquired through the current execution environment. This remains a public-authority recovery problem, not grounds to commission an FRA or substitute a secondary postcode source.',
      evidenceRefs: ['T10-EVIDENCE:floodRecovery']
    },
    {
      dependencyClass: 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      state: 'ELIGIBLE_FOR_COMMISSIONING_NOT_COMMISSIONED',
      consumers: [...t9.dependencyConsumers.COMPETENT_STRUCTURAL_CONCEPT_REVIEW],
      successorDependencyClass: null,
      commissioningEligible: true,
      reason: 'No further project-native or public evidence can replace the competent structural concept judgement reserved by DPL-02. The T9 Lennard addendum is bounded and reuses RH-11, so this evidence class has crossed the eligibility threshold without being commissioned.',
      evidenceRefs: ['T9:structural-addendum', 'RH-11:external-structural-review']
    },
    {
      dependencyClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
      state: 'ELIGIBLE_FOR_COMMISSIONING_NOT_COMMISSIONED',
      consumers: [...t9.dependencyConsumers.MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY],
      successorDependencyClass: null,
      commissioningEligible: true,
      reason: 'The indicative title-index polygon is insufficient for the Policy 8 one-metre test or real maintenance geography, while both indicative sides lie below one metre. The T9 shared geometry brief is therefore the minimum competent measurement package and has crossed the eligibility threshold without being commissioned.',
      evidenceRefs: ['T9:side-boundary-maintenance-brief']
    },
    {
      dependencyClass: 'PLANNING_DESIGN_CONTEXT_REVIEW',
      state: 'EXECUTED_CONCERN_FOLDED_INTO_EXISTING_DEPENDENCY',
      consumers: [...t9.dependencyConsumers.PLANNING_DESIGN_CONTEXT_REVIEW],
      successorDependencyClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
      commissioningEligible: false,
      reason: 'The bounded project-author planning review has been executed. Exact-site history prevents an easy pass, but current evidence does not prove categorical conflict. The unresolved factual hinge is the already-existing measured side/context geometry dependency, so no separate planning-consultant dependency is created.',
      evidenceRefs: ['T10-EVIDENCE:planningContext', 'T10:planning-context-execution']
    }
  ]

  const records = rawRecords.map((record) => ({ ...record, fingerprint: sha256DplSemanticFingerprint(record) }))
    .sort((a, b) => compareDplIdentityStrings(a.dependencyClass, b.dependencyClass))

  const foldedDependencies: T9Dependency[] = records
    .filter((record) => record.state === 'EXECUTED_CONCERN_FOLDED_INTO_EXISTING_DEPENDENCY')
    .map((record) => record.dependencyClass)
  const activeDependencyClasses = records
    .filter((record) => record.state !== 'EXECUTED_CONCERN_FOLDED_INTO_EXISTING_DEPENDENCY')
    .map((record) => record.dependencyClass)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  if (activeDependencyClasses.length !== 3) throw new Error('DPL-T10 expected three active dependencies after no-cost execution.')

  const externalEvidenceEligibleForCommissioning = records
    .filter((record) => record.commissioningEligible)
    .map((record) => record.dependencyClass)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const noCostPublicRecoveryPending = records
    .filter((record) => record.state === 'NO_COST_PUBLIC_RECOVERY_BLOCKED')
    .map((record) => record.dependencyClass)

  const proofBoundary = {
    externalCommissioning: 'NO' as const,
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    referenceHouseMutation: 'NO' as const,
    statutoryPlanningDetermination: 'NO' as const,
    legalBoundaryDetermined: 'NO' as const,
    floodConclusion: 'NOT_RESOLVED' as const,
    dpl16: 'HELD' as const
  }

  const resultPayload = {
    schemaVersion: DPL_T10_SCHEMA_VERSION,
    t9ResultFingerprint: DPL_T10_EXPECTED_T9_RESULT_FINGERPRINT,
    controlId: t9.controlId,
    candidateId: t9.candidateId,
    evidenceFingerprint: evidence.fingerprint,
    inputDependencyCount: 4 as const,
    records,
    activeDependencyClasses,
    activeDependencyCount: 3 as const,
    externalEvidenceEligibleForCommissioning,
    noCostPublicRecoveryPending,
    foldedDependencies,
    planningReviewResult: 'SCREENING_CONTEXT_CONCERN_REQUIRES_EXISTING_TARGETED_GEOMETRY_RETURN' as const,
    result: 'NO_COST_EXECUTION_COMPLETE_THREE_DEPENDENCIES_REMAIN_TWO_COMMISSIONING_ELIGIBLE' as const,
    proofBoundary
  }

  return { ...resultPayload, resultFingerprint: sha256DplSemanticFingerprint(resultPayload) }
}
