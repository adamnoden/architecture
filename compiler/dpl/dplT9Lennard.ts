import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { composeDPLT8LennardSubstantiveDisposition } from './dplT8Lennard.js'

export const DPL_T9_SCHEMA_VERSION = 'DPL-T9-LENNARD-NO-COST-CLOSURE-1' as const
export const DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT =
  'e2532fe6bd77016cba92490120ea36d172fbed57ca66913d7419bcd5d6ef1bb7' as const
export const DPL_T9_AUTHORITY_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-t9-authority-v01.json' as const
export const DPL_T9_STRUCTURAL_BRIEF_PATH =
  'project/dpl/evidence-briefs/dpl-t9-lennard-structural-concept-addendum.md' as const
export const DPL_T9_GEOMETRY_BRIEF_PATH =
  'project/dpl/evidence-briefs/dpl-t9-lennard-side-boundary-maintenance-geometry.md' as const
export const DPL_T9_PLANNING_REVIEW_PATH =
  'project/dpl/dpl-t9-lennard-planning-context-review.md' as const
export const DPL_T9_BASE_STRUCTURAL_BRIEF_PATH =
  'docs/reference-house/external-review-structural-rh11.md' as const
// Exact pre-refresh bytes for the historical Lennard candidate, not current-house applicability.
export const DPL_T9_HISTORICAL_STRUCTURAL_BRIEF_PATH =
  'project/dpl/evidence-briefs/rh11-structural-pre-refresh.txt' as const
export const DPL_T9_HISTORICAL_STRUCTURAL_BRIEF_BLOB =
  '9ee85484ab6972a1063c4226c643f5bed146f8d8' as const

export const dplT9Dispositions = [
  'RESOLVED_BOUNDED_PROJECT_AUTHORITY',
  'PUBLIC_AUTHORITY_RECOVERY_PENDING',
  'SURVIVES_EXTERNAL_EVIDENCE_BRIEF',
  'CONSOLIDATED_PLANNING_CONTEXT_REVIEW'
] as const
export type DPLT9Disposition = (typeof dplT9Dispositions)[number]

export const dplT9DependencyClasses = [
  'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
  'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
  'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
  'PLANNING_DESIGN_CONTEXT_REVIEW'
] as const
export type DPLT9DependencyClass = (typeof dplT9DependencyClasses)[number]

export const DPL_T9_EXPECTED_INPUT_BLOCKER_IDS = [
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER',
  'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
  'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
  'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
  'REFERENCE_HOUSE:RH-PROT-08',
  'REFERENCE_HOUSE:RH-PROT-14'
].sort((a, b) => compareDplIdentityStrings(a, b)) as readonly string[]

interface T9AuthoritySource {
  readonly id: string
  readonly sourceClass: string
  readonly title: string
  readonly url?: string
  readonly repositoryRef?: string
  readonly observed: readonly string[]
  readonly authorityBoundary: string
}

interface T9AuthorityEvidence {
  readonly schemaVersion: 'dpl.lennardT9AuthorityEvidence.v1'
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly researchDate: '2026-10-26'
  readonly assuranceProfile: 'SCREENING'
  readonly parentT8ResultFingerprint: typeof DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT
  readonly authorityBoundary: string
  readonly sources: readonly T9AuthoritySource[]
  readonly interpretiveRules: readonly string[]
}

interface T9Spec {
  readonly blockerId: string
  readonly disposition: DPLT9Disposition
  readonly dependencyClass: DPLT9DependencyClass | null
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly briefPath?: string
}

export interface DPLT9Record {
  readonly blockerId: string
  readonly disposition: DPLT9Disposition
  readonly dependencyClass: DPLT9DependencyClass | null
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly briefPath: string | null
  readonly fingerprint: string
}

export interface DPLT9Result {
  readonly schemaVersion: typeof DPL_T9_SCHEMA_VERSION
  readonly t8ResultFingerprint: typeof DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly authorityEvidenceFingerprint: string
  readonly inputBlockerCount: 7
  readonly records: readonly DPLT9Record[]
  readonly countsByDisposition: Readonly<Record<DPLT9Disposition, number>>
  readonly resolvedBlockerIds: readonly string[]
  readonly currentActiveBlockerIds: readonly string[]
  readonly decisionDependencies: readonly DPLT9DependencyClass[]
  readonly externalProfessionalOrMeasurementDependencies: readonly DPLT9DependencyClass[]
  readonly publicAuthorityRecoveryDependencies: readonly DPLT9DependencyClass[]
  readonly planningJudgementDependencies: readonly DPLT9DependencyClass[]
  readonly dependencyConsumers: Readonly<Record<DPLT9DependencyClass, readonly string[]>>
  readonly result: 'NO_COST_FRONTIER_REDUCED_MINIMUM_DECISION_DEPENDENCIES_FROZEN'
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'NO'
    readonly evidenceCommissioned: 'NO'
    readonly statutoryPlanningDetermination: 'NO'
    readonly legalBoundaryDetermined: 'NO'
    readonly secondaryFloodEvidencePromoted: 'NO'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')
const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const readAuthorityEvidence = (): { record: T9AuthorityEvidence; fingerprint: string; sourceIds: Set<string> } => {
  const record = JSON.parse(readText(DPL_T9_AUTHORITY_PATH)) as T9AuthorityEvidence
  if (record.schemaVersion !== 'dpl.lennardT9AuthorityEvidence.v1') throw new Error('DPL-T9 authority schema drifted.')
  if (record.controlId !== 'DPL-T-CONTROL-004' || record.candidateId !== 'DPL-T-CANDIDATE-004-01') {
    throw new Error('DPL-T9 authority control/candidate identity drifted.')
  }
  if (record.parentT8ResultFingerprint !== DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT) {
    throw new Error('DPL-T9 authority parent T8 fingerprint drifted.')
  }
  if (record.researchDate !== '2026-10-26' || record.assuranceProfile !== 'SCREENING') {
    throw new Error('DPL-T9 authority date/assurance drifted.')
  }
  if (!record.authorityBoundary || record.sources.length < 7 || record.interpretiveRules.length === 0) {
    throw new Error('DPL-T9 authority record is incomplete.')
  }
  const sourceIds = new Set(record.sources.map((source) => source.id))
  if (sourceIds.size !== record.sources.length) throw new Error('DPL-T9 authority source IDs are not unique.')
  return { record, fingerprint: sha256DplSemanticFingerprint(record), sourceIds }
}

/** Historical byte identity is required before replay; current briefs cannot substitute. */
export const assertDPLT9HistoricalStructuralBrief = (baseStructural: string): void => {
  const bytes = Buffer.from(baseStructural, 'utf8')
  const historicalBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (historicalBlob !== DPL_T9_HISTORICAL_STRUCTURAL_BRIEF_BLOB) {
    throw new Error('DPL-T9 historical RH-11 source identity drifted.')
  }
}

const assertBriefs = (): void => {
  const structural = readText(DPL_T9_STRUCTURAL_BRIEF_PATH)
  const geometry = readText(DPL_T9_GEOMETRY_BRIEF_PATH)
  const planning = readText(DPL_T9_PLANNING_REVIEW_PATH)
  const baseStructural = readText(DPL_T9_HISTORICAL_STRUCTURAL_BRIEF_PATH)
  assertDPLT9HistoricalStructuralBrief(baseStructural)
  if (!structural.includes(DPL_T9_HISTORICAL_STRUCTURAL_BRIEF_PATH)) {
    throw new Error('DPL-T9 historical structural brief binding drifted.')
  }
  if (!structural.includes(DPL_T9_BASE_STRUCTURAL_BRIEF_PATH)) throw new Error('DPL-T9 structural base brief binding drifted.')
  if (!baseStructural.includes('no structural adequacy claim')) throw new Error('DPL-T9 RH-11 authority boundary drifted.')
  if (!geometry.includes('REFERENCE_HOUSE:RH-PROT-14') || !geometry.includes('PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY')) {
    throw new Error('DPL-T9 geometry brief consumer set drifted.')
  }
  if (!geometry.includes('does **not** request by default') || !geometry.includes('determined legal boundary')) {
    throw new Error('DPL-T9 geometry brief exclusions drifted.')
  }
  if (!planning.includes('PLANNING_DESIGN_CONTEXT_REVIEW') || !planning.includes('23/00297/FULL6')) {
    throw new Error('DPL-T9 planning-context binding drifted.')
  }
  if (!planning.includes('not a reusable refusal rule')) throw new Error('DPL-T9 planning review overclaims prior refusal.')
}

const specs: readonly T9Spec[] = [
  {
    blockerId: 'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
    disposition: 'RESOLVED_BOUNDED_PROJECT_AUTHORITY',
    dependencyClass: null,
    reason: 'Current official Bromley, GLA and national sources are sufficient to bound the SCREENING question: the operative development plan is distinguishable from emerging non-operative material and no project-native scalar planning weight may be invented. Proposal-specific statutory weight remains a later decision-maker judgement if it becomes material.',
    evidenceRefs: ['T9-AUTH-01', 'T9-AUTH-02', 'T9-AUTH-03', 'T9-AUTH-04']
  },
  {
    blockerId: 'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER',
    disposition: 'PUBLIC_AUTHORITY_RECOVERY_PENDING',
    dependencyClass: 'EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY',
    reason: 'The competent Environment Agency open dataset has been identified, but the exact BR2 8LN authoritative row was not acquired through the current automated path. T9 refuses to promote secondary postcode summaries. The next action remains no-cost recovery of the official row / address-level result, not flood modelling or consultant commissioning.',
    evidenceRefs: ['T9-AUTH-05']
  },
  {
    blockerId: 'REFERENCE_HOUSE:RH-PROT-08',
    disposition: 'SURVIVES_EXTERNAL_EVIDENCE_BRIEF',
    dependencyClass: 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
    reason: 'DPL-02 reserves the structural concept conformance question to competent engineering. RH-11 already provides the generic structural red-team brief; T9 adds only exact Lennard candidate context and does not duplicate detailed design or pre-authorise ground investigation.',
    evidenceRefs: ['T9-PROJECT-01'],
    briefPath: DPL_T9_STRUCTURAL_BRIEF_PATH
  },
  {
    blockerId: 'REFERENCE_HOUSE:RH-PROT-14',
    disposition: 'SURVIVES_EXTERNAL_EVIDENCE_BRIEF',
    dependencyClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
    reason: 'Actual side maintenance geography cannot be established from the indicative title-index polygon. T9 authors one narrow measured-geometry brief shared with Bromley Policy 8; it does not request a full topo or legal-boundary determination.',
    evidenceRefs: ['T9-PROJECT-01'],
    briefPath: DPL_T9_GEOMETRY_BRIEF_PATH
  },
  {
    blockerId: 'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
    disposition: 'SURVIVES_EXTERNAL_EVIDENCE_BRIEF',
    dependencyClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
    reason: 'The explicit Bromley Policy 8 one-metre side-space floor is decision-critical because both indicative title-index side clearances are below one metre, but that polygon cannot prove a measured/legal policy failure. The same narrow geometry brief used for RH-PROT-14 is sufficient; no duplicate procurement is earned.',
    evidenceRefs: ['T9-PROJECT-01'],
    briefPath: DPL_T9_GEOMETRY_BRIEF_PATH
  },
  {
    blockerId: 'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
    disposition: 'CONSOLIDATED_PLANNING_CONTEXT_REVIEW',
    dependencyClass: 'PLANNING_DESIGN_CONTEXT_REVIEW',
    reason: 'The exact-site 2024 refusal supplies positive qualitative context on side-space, dominance and street-scene sensitivity. It is not transferable to the Reference House, but it prevents a project-authored pass. T9 consolidates the local qualitative question with strategic capacity into one exact design-context review.',
    evidenceRefs: ['T9-CONTEXT-01', 'T9-PROJECT-01'],
    briefPath: DPL_T9_PLANNING_REVIEW_PATH
  },
  {
    blockerId: 'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
    disposition: 'CONSOLIDATED_PLANNING_CONTEXT_REVIEW',
    dependencyClass: 'PLANNING_DESIGN_CONTEXT_REVIEW',
    reason: 'The Reference House is a materially inland 26 m placement rather than the refused extension, so strategic design/context/capacity cannot be inferred from prior history. The prior D3-linked refusal is nevertheless a real red flag. T9 reduces the broad blocker to the same explicit candidate/site design-context review rather than inventing extra surveys.',
    evidenceRefs: ['T9-CONTEXT-01', 'T9-PROJECT-01'],
    briefPath: DPL_T9_PLANNING_REVIEW_PATH
  }
]

const counts = <T extends string>(values: readonly T[], observed: readonly T[]): Record<T, number> => {
  const result = Object.fromEntries(values.map((value) => [value, 0])) as Record<T, number>
  for (const value of observed) result[value] += 1
  return result
}

export const composeDPLT9LennardNoCostClosure = (): DPLT9Result => {
  const t8 = composeDPLT8LennardSubstantiveDisposition()
  if (t8.resultFingerprint !== DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT) throw new Error(`DPL-T9 parent T8 drifted: ${t8.resultFingerprint}.`)
  const t8Ids = canonicalStrings(t8.dueNowUnresolvedBlockerIds)
  if (t8Ids.length !== 7 || JSON.stringify(t8Ids) !== JSON.stringify(DPL_T9_EXPECTED_INPUT_BLOCKER_IDS)) {
    throw new Error('DPL-T9 seven-item parent frontier drifted.')
  }

  const authority = readAuthorityEvidence()
  assertBriefs()

  const records = specs.map((spec): DPLT9Record => {
    if (!t8Ids.includes(spec.blockerId)) throw new Error(`DPL-T9 non-parent blocker ${spec.blockerId}.`)
    for (const ref of spec.evidenceRefs.filter((value) => value.startsWith('T9-'))) {
      if (!authority.sourceIds.has(ref)) throw new Error(`DPL-T9 unknown evidence ref ${ref}.`)
    }
    if (spec.disposition === 'RESOLVED_BOUNDED_PROJECT_AUTHORITY' && spec.dependencyClass !== null) {
      throw new Error(`DPL-T9 resolved record ${spec.blockerId} retains dependency.`)
    }
    if (spec.disposition !== 'RESOLVED_BOUNDED_PROJECT_AUTHORITY' && spec.dependencyClass === null) {
      throw new Error(`DPL-T9 unresolved record ${spec.blockerId} lacks dependency.`)
    }
    const payload = {
      blockerId: spec.blockerId,
      disposition: spec.disposition,
      dependencyClass: spec.dependencyClass,
      reason: spec.reason,
      evidenceRefs: canonicalStrings(spec.evidenceRefs),
      briefPath: spec.briefPath ?? null
    }
    return { ...payload, fingerprint: sha256DplSemanticFingerprint(payload) }
  }).sort((a, b) => compareDplIdentityStrings(a.blockerId, b.blockerId))

  if (records.length !== 7 || new Set(records.map((record) => record.blockerId)).size !== 7) {
    throw new Error('DPL-T9 must classify exactly seven unique blockers.')
  }

  const countsByDisposition = counts(dplT9Dispositions, records.map((record) => record.disposition))
  const resolvedBlockerIds = records.filter((record) => record.disposition === 'RESOLVED_BOUNDED_PROJECT_AUTHORITY').map((record) => record.blockerId).sort((a, b) => compareDplIdentityStrings(a, b))
  const currentActiveBlockerIds = records.filter((record) => record.disposition !== 'RESOLVED_BOUNDED_PROJECT_AUTHORITY').map((record) => record.blockerId).sort((a, b) => compareDplIdentityStrings(a, b))
  const decisionDependencies = canonicalStrings(records.flatMap((record) => record.dependencyClass ? [record.dependencyClass] : [])) as DPLT9DependencyClass[]

  const consumers = (dependency: DPLT9DependencyClass): string[] =>
    records.filter((record) => record.dependencyClass === dependency).map((record) => record.blockerId).sort((a, b) => compareDplIdentityStrings(a, b))
  const dependencyConsumers: Record<DPLT9DependencyClass, readonly string[]> = {
    EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY: consumers('EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY'),
    COMPETENT_STRUCTURAL_CONCEPT_REVIEW: consumers('COMPETENT_STRUCTURAL_CONCEPT_REVIEW'),
    MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY: consumers('MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'),
    PLANNING_DESIGN_CONTEXT_REVIEW: consumers('PLANNING_DESIGN_CONTEXT_REVIEW')
  }

  const externalProfessionalOrMeasurementDependencies: DPLT9DependencyClass[] = [
    'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
    'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY'
  ]
  const publicAuthorityRecoveryDependencies: DPLT9DependencyClass[] = ['EA_POSTCODE_AUTHORITATIVE_ROW_RECOVERY']
  const planningJudgementDependencies: DPLT9DependencyClass[] = ['PLANNING_DESIGN_CONTEXT_REVIEW']
  const proofBoundary = {
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    referenceHouseMutation: 'NO' as const,
    evidenceCommissioned: 'NO' as const,
    statutoryPlanningDetermination: 'NO' as const,
    legalBoundaryDetermined: 'NO' as const,
    secondaryFloodEvidencePromoted: 'NO' as const,
    dpl16: 'HELD' as const
  }

  const resultPayload = {
    schemaVersion: DPL_T9_SCHEMA_VERSION,
    t8ResultFingerprint: DPL_T9_EXPECTED_T8_RESULT_FINGERPRINT,
    controlId: t8.controlId,
    candidateId: t8.candidateId,
    authorityEvidenceFingerprint: authority.fingerprint,
    inputBlockerCount: 7 as const,
    records,
    countsByDisposition,
    resolvedBlockerIds,
    currentActiveBlockerIds,
    decisionDependencies,
    externalProfessionalOrMeasurementDependencies,
    publicAuthorityRecoveryDependencies,
    planningJudgementDependencies,
    dependencyConsumers,
    result: 'NO_COST_FRONTIER_REDUCED_MINIMUM_DECISION_DEPENDENCIES_FROZEN' as const,
    proofBoundary
  }

  return { ...resultPayload, resultFingerprint: sha256DplSemanticFingerprint(resultPayload) }
}
