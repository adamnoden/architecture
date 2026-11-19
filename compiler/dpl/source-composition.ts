import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'
import { composeDPL13EProjectReview } from './dpl13e-project-review.js'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { loadB2TargetComposition } from './load.js'
import type { RawSourceSnapshot, RawTargetSlice } from './model.js'
import {
  composeScreeningSubstantiveAggregation,
  type ScreeningAggregationRecord,
  type ScreeningSubstantiveAggregationResult
} from './substantive-aggregation.js'
import { loadWaveCBoroughTarget } from './wavec.js'

export const DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION = 'DPL-13F-SOURCE-COMPOSITION-1' as const

const PATHS = {
  dpl09a: 'project/dpl/dpl-09a-england-source-applicability-spine.md',
  dpl10a: 'project/dpl/dpl-10a-planning-source-status-spine.md',
  england: 'project/dpl/targets/england-structure-ground-moisture-materials-v1.json',
  london: 'project/dpl/targets/london-strategic-residential-design-v1.json',
  croydon: 'project/dpl/targets/croydon-local-planning-v1.json'
} as const

const LOCKS = {
  dpl09a: 'd7106eeb03903b2ca1f25b22a3374e69ac50af78',
  dpl10a: '3e097ecf433ed1da70651939e1ed83ae605b91fb',
  england: 'c5cef671928837a22a81de44d328bc815f545c1a',
  london: '177eec46828648182270829ad7cbd32c14d0d05f',
  croydon: '0b97a25e9aac962e8dd8cbb8a67b7e7fe6bbd106'
} as const

const RS02_CANDIDATE = 'c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81' as const
const ENGLAND_TARGET = 'ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20' as const
const LONDON_TARGET = 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20' as const
const CROYDON_TARGET = 'CROYDON-LOCAL-PLANNING-2018-2026-10-21' as const

export type NarrowSourceCompositionResult = 'PASS' | 'UNRESOLVED' | 'UNSUPPORTED' | 'NOT_APPLICABLE'

export interface NarrowSourceCompositionFinding {
  readonly owner: 'ENGLAND' | 'PLANNING'
  readonly ownerEntryId: 'ENG-COV-SOURCE-APPLICABILITY' | 'DPL10-COV-SOURCE-COMPOSITION-STATUS'
  readonly result: NarrowSourceCompositionResult
  readonly reason: string
  readonly sourceRefs: readonly string[]
  readonly missingFacts: readonly string[]
  readonly findingFingerprint: string
}

export interface PlanningSourceStatusEntry {
  readonly id: string
  readonly sourceClass: string
  readonly status: string
  readonly developmentPlanMembership: 'YES' | 'NO'
  readonly materialConsiderationCapability: 'YES' | 'CASE_DEPENDENT' | 'NO'
  readonly authorityRef: string
}

export interface DPL13FSourceCompositionResult {
  readonly schemaVersion: typeof DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION
  readonly siteId: 'DPL-RS-02'
  readonly candidateFingerprint: string
  readonly england: {
    readonly targetId: string
    readonly sourceSnapshotIds: readonly string[]
    readonly finding: NarrowSourceCompositionFinding
  }
  readonly planning: {
    readonly strategicTargetId: string
    readonly localTargetId: string
    readonly sourceStatus: readonly PlanningSourceStatusEntry[]
    readonly finding: NarrowSourceCompositionFinding
  }
  readonly aggregation: ScreeningSubstantiveAggregationResult
  readonly identityFingerprint: string
  readonly resultFingerprint: string
  readonly proofBoundary: {
    readonly englandTechnicalCompliance: 'NOT_CLAIMED'
    readonly planningPolicyCompliance: 'NOT_CLAIMED'
    readonly planningPermission: 'EXTERNAL_ONLY'
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
  }
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const gitBlobSha = (path: string): string => {
  const bytes = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex')
}

export const assertLockedGitBlob = (actual: string, expected: string, label: string): void => {
  if (actual !== expected) throw new Error(`DPL-13F refuses changed ${label} authority bytes; source composition is stale.`)
}

const assertAuthorityLocks = (): void => {
  for (const key of Object.keys(PATHS) as (keyof typeof PATHS)[]) {
    assertLockedGitBlob(gitBlobSha(PATHS[key]), LOCKS[key], key)
  }
}

const exactTarget = (targets: readonly { readonly target: RawTargetSlice }[], id: string): RawTargetSlice => {
  const target = targets.find((entry) => entry.target.id === id)?.target
  if (!target) throw new Error(`DPL-13F requires exact target ${id}.`)
  return target
}

const source = (target: RawTargetSlice, id: string): RawSourceSnapshot => {
  const found = target.sourceSnapshots.find((entry) => entry.id === id)
  if (!found) throw new Error(`DPL-13F requires source snapshot ${id} in ${target.id}.`)
  return found
}

const expectField = (record: RawSourceSnapshot, field: string, expected: string): void => {
  if (record[field] !== expected) {
    throw new Error(`DPL-13F source ${record.id} expected ${field}=${expected}; got ${String(record[field])}.`)
  }
}

const finding = (
  value: Omit<NarrowSourceCompositionFinding, 'findingFingerprint'>
): NarrowSourceCompositionFinding => {
  const canonical = {
    ...value,
    sourceRefs: canonicalStrings(value.sourceRefs),
    missingFacts: canonicalStrings(value.missingFacts)
  }
  return { ...canonical, findingFingerprint: sha256DplSemanticFingerprint(canonical) }
}

const composeEnglandFinding = (target: RawTargetSlice): NarrowSourceCompositionFinding => {
  if (target.id !== ENGLAND_TARGET) throw new Error(`DPL-13F expected England target ${ENGLAND_TARGET}; got ${target.id}.`)
  const schedule1 = source(target, 'BR2010-SCH1-2026-07-20')
  const reg7 = source(target, 'BR2010-REG7-REVISED-2026-10-20')
  expectField(schedule1, 'status', 'OPERATIVE_AT_RESEARCH_DATE')
  expectField(reg7, 'status', 'OPERATIVE_REVISED_VIEW_AT_RESEARCH_DATE')
  return finding({
    owner: 'ENGLAND',
    ownerEntryId: 'ENG-COV-SOURCE-APPLICABILITY',
    result: 'UNRESOLVED',
    reason: 'Current England sources are identified, but RS-02 lacks the building-control route/application and commencement events required to freeze a transition-safe project technical target across the 2027/2028 transition. Research-date source status is not substituted for project-event applicability.',
    sourceRefs: [PATHS.dpl09a, `${PATHS.england}#${schedule1.id}`, `${PATHS.england}#${reg7.id}`],
    missingFacts: [
      'buildingControlRouteOrNoticeApplicationKind',
      'noticeOrApplicationDateAndStatus',
      'qualifyingCommencementDate',
      'qualifyingCommencementEvidence'
    ]
  })
}

const composePlanningStatuses = (
  london: RawTargetSlice,
  croydon: RawTargetSlice
): readonly PlanningSourceStatusEntry[] => {
  if (london.id !== LONDON_TARGET) throw new Error(`DPL-13F expected London target ${LONDON_TARGET}; got ${london.id}.`)
  if (croydon.id !== CROYDON_TARGET) throw new Error(`DPL-13F expected Croydon target ${CROYDON_TARGET}; got ${croydon.id}.`)
  const parent = (croydon as unknown as Record<string, unknown>).parentStrategicTargetId
  if (parent !== london.id) throw new Error(`DPL-13F Croydon parent mismatch: ${String(parent)}.`)

  const londonPlan = source(london, 'LONDON-PLAN-2021-CH3')
  const capacityLpg = source(london, 'LPG-OPTIMISING-SITE-CAPACITY-2023')
  const housingLpg = source(london, 'LPG-HOUSING-DESIGN-STANDARDS-2023')
  const localPlan = source(croydon, 'CROY-LOCAL-PLAN-2018')
  const emergingLocal = source(croydon, 'CROY-LOCAL-PLAN-REVIEW-EXAM-2026-10-21')
  const revokedSpd = source(croydon, 'CROY-SUBURBAN-DESIGN-GUIDE-REVOCATION-2022')

  expectField(londonPlan, 'publicationStatus', 'ADOPTED_OPERATIVE')
  expectField(capacityLpg, 'publicationStatus', 'ADOPTED_GUIDANCE')
  expectField(housingLpg, 'publicationStatus', 'ADOPTED_GUIDANCE')
  expectField(localPlan, 'status', 'OPERATIVE_AT_RESEARCH_DATE')
  expectField(emergingLocal, 'status', 'EMERGING_NON_OPERATIVE_AT_RESEARCH_DATE')
  expectField(revokedSpd, 'status', 'REVOKED_FROM_2022-07-26')

  const entries: PlanningSourceStatusEntry[] = [
    { id: 'LONDON_PLAN_2021', sourceClass: 'SPATIAL_DEVELOPMENT_STRATEGY', status: 'OPERATIVE_DEVELOPMENT_PLAN_SOURCE', developmentPlanMembership: 'YES', materialConsiderationCapability: 'YES', authorityRef: `${PATHS.london}#${londonPlan.id}` },
    { id: 'CROYDON_LOCAL_PLAN_2018', sourceClass: 'LOCAL_PLAN', status: 'OPERATIVE_DEVELOPMENT_PLAN_SOURCE', developmentPlanMembership: 'YES', materialConsiderationCapability: 'YES', authorityRef: `${PATHS.croydon}#${localPlan.id}` },
    { id: 'NPPF_2026_09_29', sourceClass: 'NATIONAL_PLANNING_POLICY', status: 'OPERATIVE_POLICY_MATERIAL_CONSIDERATION', developmentPlanMembership: 'NO', materialConsiderationCapability: 'YES', authorityRef: PATHS.dpl10a },
    { id: 'DRAFT_LONDON_PLAN_2026', sourceClass: 'EMERGING_STRATEGIC_POLICY', status: 'EMERGING_NON_OPERATIVE', developmentPlanMembership: 'NO', materialConsiderationCapability: 'CASE_DEPENDENT', authorityRef: PATHS.dpl10a },
    { id: 'CROYDON_LOCAL_PLAN_REVIEW_2026', sourceClass: 'EMERGING_LOCAL_PLAN', status: 'EMERGING_NON_OPERATIVE', developmentPlanMembership: 'NO', materialConsiderationCapability: 'CASE_DEPENDENT', authorityRef: `${PATHS.croydon}#${emergingLocal.id}` },
    { id: 'LPG_OPTIMISING_SITE_CAPACITY_2023', sourceClass: 'LONDON_PLAN_GUIDANCE', status: 'ADOPTED_GUIDANCE', developmentPlanMembership: 'NO', materialConsiderationCapability: 'YES', authorityRef: `${PATHS.london}#${capacityLpg.id}` },
    { id: 'LPG_HOUSING_DESIGN_STANDARDS_2023', sourceClass: 'LONDON_PLAN_GUIDANCE', status: 'ADOPTED_GUIDANCE', developmentPlanMembership: 'NO', materialConsiderationCapability: 'YES', authorityRef: `${PATHS.london}#${housingLpg.id}` },
    { id: 'CROYDON_SPD2', sourceClass: 'REVOKED_SUPPLEMENTARY_PLANNING_DOCUMENT', status: 'REVOKED_FROM_2022-07-26', developmentPlanMembership: 'NO', materialConsiderationCapability: 'NO', authorityRef: `${PATHS.croydon}#${revokedSpd.id}` }
  ]
  return entries.sort((a, b) => compareDplIdentityStrings(a.id, b.id))
}

const composePlanningFinding = (
  statuses: readonly PlanningSourceStatusEntry[]
): NarrowSourceCompositionFinding => {
  const members = statuses.filter((entry) => entry.developmentPlanMembership === 'YES').map((entry) => entry.id).sort()
  if (JSON.stringify(members) !== JSON.stringify(['CROYDON_LOCAL_PLAN_2018', 'LONDON_PLAN_2021'])) {
    throw new Error('DPL-13F planning development-plan membership drifted from the controlled London + Croydon pair.')
  }
  return finding({
    owner: 'PLANNING',
    ownerEntryId: 'DPL10-COV-SOURCE-COMPOSITION-STATUS',
    result: 'PASS',
    reason: 'For controlled RS-02/Croydon, London Plan 2021 and Croydon Local Plan 2018 are the operative development-plan sources; NPPF remains outside development-plan membership; London/Croydon emerging plans remain non-operative; London Plan Guidance remains guidance; revoked Croydon SPD2 remains revoked. PASS is source/status composition only, not materiality, weight, policy compliance or permission.',
    sourceRefs: [PATHS.dpl10a, PATHS.london, PATHS.croydon, ...statuses.map((entry) => entry.authorityRef)],
    missingFacts: []
  })
}

const replaceRecord = (
  record: ScreeningAggregationRecord,
  sourceFinding: NarrowSourceCompositionFinding
): ScreeningAggregationRecord => {
  const positive = sourceFinding.result === 'PASS' || sourceFinding.result === 'NOT_APPLICABLE'
  return {
    ...record,
    sourceKind: 'OWNER_EVIDENCE_REQUIRED',
    sourceIds: canonicalStrings([...sourceFinding.sourceRefs, `DPL13F:${sourceFinding.findingFingerprint}`]),
    sourceResult: `SOURCE_COMPOSITION_${sourceFinding.result}`,
    aggregationState: positive
      ? 'POSITIVE_RESOLVED'
      : sourceFinding.result === 'UNSUPPORTED'
        ? 'SUBSTANTIVE_UNSUPPORTED'
        : 'SUBSTANTIVE_UNRESOLVED',
    ...(positive ? { blockerClass: undefined } : { blockerClass: 'SUBSTANTIVE_UNRESOLVED' as const }),
    reason: sourceFinding.reason
  }
}

export const composeDPL13FSourceComposition = (): DPL13FSourceCompositionResult => {
  assertAuthorityLocks()
  const fixture = composeDPL13DSecondFixture()
  if (fixture.canonicalCase.authoredCandidate.fingerprint !== RS02_CANDIDATE) {
    throw new Error('DPL-13F refuses changed RS-02 candidate identity; source composition is stale.')
  }

  const b2 = loadB2TargetComposition()
  const england = exactTarget(b2, ENGLAND_TARGET)
  const london = exactTarget(b2, LONDON_TARGET)
  const croydon = loadWaveCBoroughTarget('Croydon').target
  const englandFinding = composeEnglandFinding(england)
  const statuses = composePlanningStatuses(london, croydon)
  const planningFinding = composePlanningFinding(statuses)

  const architectural = composeDPL13EProjectReview()
  const replacements = new Map<string, NarrowSourceCompositionFinding>([
    ['ENGLAND:ENG-COV-SOURCE-APPLICABILITY', englandFinding],
    ['PLANNING:DPL10-COV-SOURCE-COMPOSITION-STATUS', planningFinding]
  ])
  const records = architectural.aggregation.aggregationRecords.map((record): ScreeningAggregationRecord => {
    const next = replacements.get(`${record.owner}:${record.ownerEntryId}`)
    return next ? replaceRecord(record, next) : record
  })
  const readiness = fixture.readiness as unknown as ScreeningCoverageReadinessResult
  const aggregation = composeScreeningSubstantiveAggregation({ canonicalCase: fixture.canonicalCase, readiness, records })
  const proofBoundary = {
    englandTechnicalCompliance: 'NOT_CLAIMED' as const,
    planningPolicyCompliance: 'NOT_CLAIMED' as const,
    planningPermission: 'EXTERNAL_ONLY' as const,
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const
  }
  const sourceSnapshotIds = england.sourceSnapshots.map((entry) => entry.id).sort((a, b) => compareDplIdentityStrings(a, b))
  const identityFingerprint = sha256DplSemanticFingerprint({
    schemaVersion: DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION,
    siteId: fixture.site.siteId,
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    englandTargetId: england.id,
    englandSourceSnapshotIds: sourceSnapshotIds,
    englandFindingFingerprint: englandFinding.findingFingerprint,
    strategicTargetId: london.id,
    localTargetId: croydon.id,
    planningSourceStatus: statuses,
    planningFindingFingerprint: planningFinding.findingFingerprint,
    baseArchitecturalIdentity: architectural.identityFingerprint,
    proofBoundary
  })

  return {
    schemaVersion: DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION,
    siteId: 'DPL-RS-02',
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    england: { targetId: england.id, sourceSnapshotIds, finding: englandFinding },
    planning: { strategicTargetId: london.id, localTargetId: croydon.id, sourceStatus: statuses, finding: planningFinding },
    aggregation,
    identityFingerprint,
    resultFingerprint: sha256DplSemanticFingerprint({ identityFingerprint, aggregationResultFingerprint: aggregation.resultFingerprint }),
    proofBoundary
  }
}
