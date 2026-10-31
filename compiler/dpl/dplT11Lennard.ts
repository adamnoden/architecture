import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPLT10LennardNoCostExecution } from './dplT10Lennard.js'

export const DPL_T11_SCHEMA_VERSION = 'DPL-T11-LENNARD-NO-SPEND-EVIDENCE-1' as const
export const DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT =
  '7a429b81016943fb12ba84b08df5ee18f618f85fc896253f983dd0b95bdfdaca' as const
export const DPL_T11_EVIDENCE_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-t11-no-spend-evidence-v01.json' as const
export const DPL_T11_STRUCTURAL_PACK_PATH =
  'project/dpl/evidence-briefs/dpl-t11-lennard-structural-acquisition-pack.md' as const
export const DPL_T11_GEOMETRY_PACK_PATH =
  'project/dpl/evidence-briefs/dpl-t11-lennard-geometry-acquisition-pack.md' as const

export const dplT11DependencyStates = [
  'ACQUISITION_READY_EXTERNAL_JUDGEMENT',
  'ACQUISITION_READY_EXTERNAL_MEASUREMENT',
  'NO_COST_PUBLIC_RECOVERY_TECHNICALLY_BLOCKED'
] as const
export type DPLT11DependencyState = (typeof dplT11DependencyStates)[number]

export type DPLT11DependencyClass =
  | 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW'
  | 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'
  | 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'

interface T11EvidenceRecord {
  readonly schemaVersion: 'dpl.lennardT11NoSpendEvidence.v1'
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly researchDate: '2026-10-26'
  readonly assuranceProfile: 'SCREENING'
  readonly parentT10ResultFingerprint: typeof DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT
  readonly floodAuthorityRecovery: {
    readonly targetPostcode: 'BR2 8LN'
    readonly state: 'AUTHORITATIVE_RESOURCE_KNOWN_EXECUTION_ENVIRONMENT_CANNOT_ACQUIRE_BYTES'
    readonly decision: 'KEEP_NO_COST_PUBLIC_RECOVERY_ACTIVE_DO_NOT_ESCALATE_TO_CONSULTANT'
  }
  readonly publicGeometryAudit: {
    readonly currentApplication: '26/02618/FPA'
    readonly currentDocumentAcquisitionState: 'DOCUMENT_INDEX_IDENTIFIED_CURRENT_DRAWING_BYTES_NOT_CONTROLLED_IN_T11_EXECUTION_PATH'
    readonly decision: 'SUPPLEMENTAL_MEASURED_SITE_CONTEXT_IDENTIFIED_FIELD_RETURN_STILL_REQUIRED'
    readonly scopeEffect: readonly string[]
  }
  readonly structuralPackAudit: {
    readonly additionalGenericEngineeringQuestionsEarned: 0
    readonly decision: 'PACKAGE_NOT_SCOPE_EXPANSION_REQUIRED'
  }
  readonly geometryPackAudit: {
    readonly additionalFullTopoScopeEarned: false
    readonly legalBoundaryOpinionEarned: false
    readonly decision: 'TARGETED_FIELD_PACKAGE_REMAINS_MINIMUM_COMPETENT_RETURN'
  }
}

export interface DPLT11DependencyRecord {
  readonly dependencyClass: DPLT11DependencyClass
  readonly state: DPLT11DependencyState
  readonly consumers: readonly string[]
  readonly acquisitionPackPath: string | null
  readonly externalAcquisitionReady: boolean
  readonly externallyCommissioned: false
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly fingerprint: string
}

export interface DPLT11Result {
  readonly schemaVersion: typeof DPL_T11_SCHEMA_VERSION
  readonly t10ResultFingerprint: typeof DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly evidenceFingerprint: string
  readonly inputDependencyCount: 3
  readonly records: readonly DPLT11DependencyRecord[]
  readonly activeDependencyClasses: readonly DPLT11DependencyClass[]
  readonly activeDependencyCount: 3
  readonly externalAcquisitionReady: readonly DPLT11DependencyClass[]
  readonly noCostPublicRecoveryPending: readonly DPLT11DependencyClass[]
  readonly dependenciesClosedAtT11: readonly DPLT11DependencyClass[]
  readonly publicGeometryDisposition: 'SUPPLEMENTAL_CONTEXT_ONLY_FIELD_RETURN_STILL_REQUIRED'
  readonly result: 'NO_SPEND_EVIDENCE_EXHAUSTED_THREE_DEPENDENCIES_REMAIN_TWO_ACQUISITION_READY'
  readonly proofBoundary: {
    readonly externalCommissioning: 'NO'
    readonly externalContact: 'NO'
    readonly spendAuthorised: 'NO'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'NO'
    readonly structuralAdequacy: 'NOT_CLAIMED'
    readonly statutoryPlanningDetermination: 'NO'
    readonly legalBoundaryDetermined: 'NO'
    readonly floodConclusion: 'NOT_RESOLVED'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const readEvidence = (): { record: T11EvidenceRecord; fingerprint: string } => {
  const record = JSON.parse(readText(DPL_T11_EVIDENCE_PATH)) as T11EvidenceRecord
  if (record.schemaVersion !== 'dpl.lennardT11NoSpendEvidence.v1') throw new Error('DPL-T11 evidence schema drifted.')
  if (record.controlId !== 'DPL-T-CONTROL-004' || record.candidateId !== 'DPL-T-CANDIDATE-004-01') {
    throw new Error('DPL-T11 evidence identity drifted.')
  }
  if (record.parentT10ResultFingerprint !== DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT) {
    throw new Error('DPL-T11 evidence parent fingerprint drifted.')
  }
  if (record.floodAuthorityRecovery.targetPostcode !== 'BR2 8LN') throw new Error('DPL-T11 flood target drifted.')
  if (record.floodAuthorityRecovery.decision !== 'KEEP_NO_COST_PUBLIC_RECOVERY_ACTIVE_DO_NOT_ESCALATE_TO_CONSULTANT') {
    throw new Error('DPL-T11 flood recovery was improperly escalated.')
  }
  if (record.publicGeometryAudit.currentApplication !== '26/02618/FPA') {
    throw new Error('DPL-T11 public-geometry application identity drifted.')
  }
  if (record.publicGeometryAudit.decision !== 'SUPPLEMENTAL_MEASURED_SITE_CONTEXT_IDENTIFIED_FIELD_RETURN_STILL_REQUIRED') {
    throw new Error('DPL-T11 public geometry was promoted beyond its authority.')
  }
  if (record.structuralPackAudit.additionalGenericEngineeringQuestionsEarned !== 0) {
    throw new Error('DPL-T11 duplicated generic RH-11 structural scope.')
  }
  if (record.geometryPackAudit.additionalFullTopoScopeEarned || record.geometryPackAudit.legalBoundaryOpinionEarned) {
    throw new Error('DPL-T11 expanded the geometry package without earned authority.')
  }
  return { record, fingerprint: sha256DplSemanticFingerprint(record) }
}

const assertAcquisitionPacks = (): void => {
  const structural = readText(DPL_T11_STRUCTURAL_PACK_PATH)
  const geometry = readText(DPL_T11_GEOMETRY_PACK_PATH)

  for (const marker of [
    'docs/reference-house/external-review-structural-rh11.md',
    'project/dpl/evidence-briefs/dpl-t9-lennard-structural-concept-addendum.md',
    'CONCEPT_ACCEPTABLE_NO_PROTECTED_ORDER_CHANGE_IDENTIFIED',
    'CONCEPT_ACCEPTABLE_WITH_FUTURE_DETAIL_DEPENDENCIES',
    'CONCEPT_CONFLICT_IDENTIFIED'
  ]) {
    if (!structural.includes(marker)) throw new Error(`DPL-T11 structural pack missing ${marker}.`)
  }

  for (const marker of [
    'project/dpl/evidence-briefs/dpl-t9-lennard-side-boundary-maintenance-geometry.md',
    '1.000 m',
    'planning purposes only',
    'determined legal boundary'
  ]) {
    if (!geometry.includes(marker)) throw new Error(`DPL-T11 geometry pack missing ${marker}.`)
  }
}

export const composeDPLT11LennardNoSpendEvidence = (): DPLT11Result => {
  const t10 = composeDPLT10LennardNoCostExecution()
  if (t10.resultFingerprint !== DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT) {
    throw new Error(`DPL-T11 parent T10 drifted: ${t10.resultFingerprint}.`)
  }

  const expected: DPLT11DependencyClass[] = [
    'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
    'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
    'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
  ].sort((a, b) => compareDplIdentityStrings(a, b)) as DPLT11DependencyClass[]

  const actual = [...t10.activeDependencyClasses].sort((a, b) => compareDplIdentityStrings(a, b))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('DPL-T11 parent dependency universe drifted.')
  }

  const evidence = readEvidence()
  assertAcquisitionPacks()

  const t10Consumers = Object.fromEntries(
    t10.records
      .filter((record) => record.dependencyClass !== 'PLANNING_DESIGN_CONTEXT_REVIEW')
      .map((record) => [record.dependencyClass, [...record.consumers]])
  ) as Record<DPLT11DependencyClass, string[]>

  const rawRecords: Omit<DPLT11DependencyRecord, 'fingerprint'>[] = [
    {
      dependencyClass: 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
      state: 'ACQUISITION_READY_EXTERNAL_JUDGEMENT',
      consumers: t10Consumers.COMPETENT_STRUCTURAL_CONCEPT_REVIEW,
      acquisitionPackPath: DPL_T11_STRUCTURAL_PACK_PATH,
      externalAcquisitionReady: true,
      externallyCommissioned: false,
      reason: 'No additional project-native engineering question is earned. RH-11 plus the Lennard addendum now form one bounded acquisition pack with exact return states and no detailed-design or GI default scope.',
      evidenceRefs: ['T11-EVIDENCE:structuralPackAudit', 'T11:structural-acquisition-pack']
    },
    {
      dependencyClass: 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
      state: 'NO_COST_PUBLIC_RECOVERY_TECHNICALLY_BLOCKED',
      consumers: t10Consumers.EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY,
      acquisitionPackPath: null,
      externalAcquisitionReady: false,
      externallyCommissioned: false,
      reason: 'The official Environment Agency resource and exact target postcode are known, but the current execution path cannot acquire the octet-stream bytes. This remains a no-cost authority-recovery task and does not justify flood-consultant procurement or secondary-source substitution.',
      evidenceRefs: ['T11-EVIDENCE:floodAuthorityRecovery']
    },
    {
      dependencyClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
      state: 'ACQUISITION_READY_EXTERNAL_MEASUREMENT',
      consumers: t10Consumers.MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY,
      acquisitionPackPath: DPL_T11_GEOMETRY_PACK_PATH,
      externalAcquisitionReady: true,
      externallyCommissioned: false,
      reason: 'Exact-site public planning material provides useful measured-context provenance and orientation, but its planning-purpose limitations and mixed neighbour-geometry provenance cannot discharge the centimetre-scale physical-control return. The existing targeted field package remains the minimum competent evidence and is now acquisition-ready without full-topo or legal-boundary scope.',
      evidenceRefs: ['T11-EVIDENCE:publicGeometryAudit', 'T11-EVIDENCE:geometryPackAudit', 'T11:geometry-acquisition-pack']
    }
  ]

  const records = rawRecords
    .map((record) => ({ ...record, fingerprint: sha256DplSemanticFingerprint(record) }))
    .sort((a, b) => compareDplIdentityStrings(a.dependencyClass, b.dependencyClass))

  const activeDependencyClasses = records.map((record) => record.dependencyClass)
  const externalAcquisitionReady = records
    .filter((record) => record.externalAcquisitionReady)
    .map((record) => record.dependencyClass)
  const noCostPublicRecoveryPending = records
    .filter((record) => record.state === 'NO_COST_PUBLIC_RECOVERY_TECHNICALLY_BLOCKED')
    .map((record) => record.dependencyClass)
  const dependenciesClosedAtT11: DPLT11DependencyClass[] = []

  if (activeDependencyClasses.length !== 3) throw new Error('DPL-T11 must retain the exact three-dependency frontier.')
  if (externalAcquisitionReady.length !== 2) throw new Error('DPL-T11 expected exactly two acquisition-ready external evidence classes.')
  if (noCostPublicRecoveryPending.length !== 1) throw new Error('DPL-T11 expected exactly one no-cost public recovery dependency.')

  const proofBoundary = {
    externalCommissioning: 'NO' as const,
    externalContact: 'NO' as const,
    spendAuthorised: 'NO' as const,
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    referenceHouseMutation: 'NO' as const,
    structuralAdequacy: 'NOT_CLAIMED' as const,
    statutoryPlanningDetermination: 'NO' as const,
    legalBoundaryDetermined: 'NO' as const,
    floodConclusion: 'NOT_RESOLVED' as const,
    dpl16: 'HELD' as const
  }

  const resultPayload = {
    schemaVersion: DPL_T11_SCHEMA_VERSION,
    t10ResultFingerprint: DPL_T11_EXPECTED_T10_RESULT_FINGERPRINT,
    controlId: t10.controlId,
    candidateId: t10.candidateId,
    evidenceFingerprint: evidence.fingerprint,
    inputDependencyCount: 3 as const,
    records,
    activeDependencyClasses,
    activeDependencyCount: 3 as const,
    externalAcquisitionReady,
    noCostPublicRecoveryPending,
    dependenciesClosedAtT11,
    publicGeometryDisposition: 'SUPPLEMENTAL_CONTEXT_ONLY_FIELD_RETURN_STILL_REQUIRED' as const,
    result: 'NO_SPEND_EVIDENCE_EXHAUSTED_THREE_DEPENDENCIES_REMAIN_TWO_ACQUISITION_READY' as const,
    proofBoundary
  }

  return { ...resultPayload, resultFingerprint: sha256DplSemanticFingerprint(resultPayload) }
}
