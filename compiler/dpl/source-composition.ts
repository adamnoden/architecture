import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { composeDPL13EProjectReview } from './dpl13e-project-review.js'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'
import { loadB2TargetComposition } from './load.js'
import type { RawSourceSnapshot, RawTargetSlice } from './model.js'
import {
  composeScreeningSubstantiveAggregation,
  type ScreeningAggregationRecord,
  type ScreeningSubstantiveAggregationResult
} from './substantive-aggregation.js'
import { loadWaveCBoroughTarget } from './wavec.js'

export const DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION = 'DPL-13F-SOURCE-COMPOSITION-1' as const

const DPL09A_PATH = 'project/dpl/dpl-09a-england-source-applicability-spine.md' as const
const DPL10A_PATH = 'project/dpl/dpl-10a-planning-source-status-spine.md' as const
const ENGLAND_TARGET_PATH = 'project/dpl/targets/england-structure-ground-moisture-materials-v1.json' as const
const LONDON_TARGET_PATH = 'project/dpl/targets/london-strategic-residential-design-v1.json' as const
const CROYDON_TARGET_PATH = 'project/dpl/targets/croydon-local-planning-v1.json' as const

const EXPECTED_GIT_BLOB_SHAS = {
  dpl09a: 'd7106eeb03903b2ca1f25b22a3374e69ac50af78',
  dpl10a: '3e097ecf433ed1da70651939e1ed83ae605b91fb',
  englandTarget: 'c5cef671928837a22a81de44d328bc815f545c1a',
  londonTarget: '177eec46828648182270829ad7cbd32c14d0d05f',
  croydonTarget: '0b97a25e9aac962e8dd8cbb8a67b7e7fe6bbd106'
} as const

const EXPECTED_RS02_CANDIDATE_FINGERPRINT =
  'c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81' as const
const EXPECTED_ENGLAND_TARGET_ID = 'ENG-BC-STRUCTURE-GROUND-MOISTURE-MATERIALS-2026-10-20' as const
const EXPECTED_LONDON_TARGET_ID = 'LON-STRATEGIC-RESIDENTIAL-DESIGN-2021-2026-10-20' as const
const EXPECTED_CROYDON_TARGET_ID = 'CROYDON-LOCAL-PLANNING-2018-2026-10-21' as const

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
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const gitBlobSha = (path: string): string => {
  const content = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1')
    .update(`blob ${content.byteLength}\0`)
    .update(content)
    .digest('hex')
}

export const assertLockedGitBlob = (actual: string, expected: string, label: string): void => {
  if (actual !== expected) throw new Error(`DPL-13F refuses changed ${label} authority bytes; source composition is stale.`)
}

const assertAuthorityBytes = (): void => {
  assertLockedGitBlob(gitBlobSha(DPL09A_PATH), EXPECTED_GIT_BLOB_SHAS.dpl09a, 'DPL-09A')
  assertLockedGitBlob(gitBlobSha(DPL10A_PATH), EXPECTED_GIT_BLOB_SHAS.dpl10a, 'DPL-10A')
  assertLockedGitBlob(gitBlobSha(ENGLAND_TARGET_PATH), EXPECTED_GIT_BLOB_SHAS.englandTarget, 'England target')
  assertLockedGitBlob(gitBlobSha(LONDON_TARGET_PATH), EXPECTED_GIT_BLOB_SHAS.londonTarget, 'London target')
  assertLockedGitBlob(gitBlobSha(CROYDON_TARGET_PATH), EXPECTED_GIT_BLOB_SHAS.croydonTarget, 'Croydon target')
}

const requireTarget = (targets: ReturnType<typeof loadB2TargetComposition>, id: string): RawTargetSlice => {
  const target = targets.map((entry) => entry.target).find((entry) => entry.id === id)
  if (!target) throw new Error(`DPL-13F requires exact target ${id}.`)
  return target
}

const sourceById = (target: RawTargetSlice, id: string): RawSourceSnapshot => {
  const source = target.sourceSnapshots.find((entry) => entry.id === id)
  if (!source) throw new Error(`DPL-13F requires source snapshot ${id} in target ${target.id}.`)
  return source
}

const requireField = (source: RawSourceSnapshot, field: string, expected: string): void => {
  if (source[field] !== expected) {
    throw new Error(`DPL-13F source ${source.id} expected ${field}=${expected}; got ${String(source[field])}.`)
  }
}

const canonicalFinding = (
  finding: Omit<NarrowSourceCompositionFinding, 'findingFingerprint'>
): NarrowSourceCompositionFinding => {
  const canonical = {
    ...finding,
    sourceRefs: canonicalStrings(finding.sourceRefs),
    missingFacts: canonicalStrings(finding.missingFacts)
  }
  return { ...canonical, findingFingerprint: sha256SemanticFingerprint(canonical) }
}

const englandFinding = (target: RawTargetSlice): NarrowSourceCompositionFinding => {
  if (target.id !== EXPECTED_ENGLAND_TARGET_ID) {
    throw new Error(`DPL-13F expected England target ${EXPECTED_ENGLAND_TARGET_ID}; got ${target.id}.`)
  }
  const primary = sourceById(target, 'BR2010-SCH1-2026-07-20')
  const reg7 = sourceById(target, 'BR2010-REG7-REVISED-2026-10-20')
  requireField(primary, 'status', 'OPERATIVE_AT_RESEARCH_DATE')
  requireField(reg7, 'status', 'OPERATIVE_REVISED_VIEW_AT_RESEARCH_DATE')

  return canonicalFinding({
    owner: 'ENGLAND',
    ownerEntryId: 'ENG-COV-SOURCE-APPLICABILITY',
    result: 'UNRESOLVED',
    reason:
      'The current England source state is identified and fingerprinted, but DPL-RS-02 does not declare the legally relevant building-control route/application event and commencement evidence needed to freeze a transition-safe project technical target across the 2027/2028 transition. DPL-13F refuses to substitute the research-date source snapshot for project-event applicability.',
    sourceRefs: [
      DPL09A_PATH,
      `${ENGLAND_TARGET_PATH}#${primary.id}`,
      `${ENGLAND_TARGET_PATH}#${reg7.id}`,
      'S.I. 2026/335 transition relation as recorded by DPL-09A'
    ],
    missingFacts: [
      'buildingControlRouteOrNoticeApplicationKind',
      'noticeOrApplicationDateAndStatus',
      'qualifyingCommencementDate',
      'qualifyingCommencementEvidence'
    ]
  })
}

const planningStatusEntries = (
  london: RawTargetSlice,
  croydon: RawTargetSlice
): readonly PlanningSourceStatusEntry[] => {
  const londonPlan = sourceById(london, 'LONDON-PLAN-2021-CH3')
  const siteCapacityLpg = sourceById(london, 'LPG-OPTIMISING-SITE-CAPACITY-2023')
  const housingLpg = sourceById(london, 'LPG-HOUSING-DESIGN-STANDARDS-2023')
  const developmentPlan = sourceById(croydon, 'CROY-DEVELOPMENT-PLAN-PAGE-2026-10-21')
  const croydonPlan = sourceById(croydon, 'CROY-LOCAL-PLAN-2018')
  const emergingCroydon = sourceById(croydon, 'CROY-LOCAL-PLAN-REVIEW-EXAM-2026-10-21')
  const revokedSpd = sourceById(croydon, 'CROY-SUBURBAN-DESIGN-GUIDE-REVOCATION-2022')

  requireField(londonPlan, 'publicationStatus', 'ADOPTED_OPERATIVE')
  requireField(siteCapacityLpg, 'publicationStatus', 'ADOPTED_GUIDANCE')
  requireField(housingLpg, 'publicationStatus', 'ADOPTED_GUIDANCE')
  requireField(developmentPlan, 'status', 'CURRENT_COUNCIL_DEVELOPMENT_PLAN_PAGE_AT_RESEARCH_DATE')
  requireField(croydonPlan, 'status', 'OPERATIVE_AT_RESEARCH_DATE')
  requireField(emergingCroydon, 'status', 'EMERGING_NON_OPERATIVE_AT_RESEARCH_DATE')
  requireField(revokedSpd, 'status', 'REVOKED_FROM_2022-07-26')

  return [
    {
      id: 'LONDON_PLAN_2021',
      sourceClass: 'SPATIAL_DEVELOPMENT_STRATEGY',
      status: 'OPERATIVE_DEVELOPMENT_PLAN_SOURCE',
      developmentPlanMembership: 'YES',
      materialConsiderationCapability: 'YES',
      authorityRef: `${LONDON_TARGET_PATH}#${londonPlan.id}`
    },
    {
      id: 'CROYDON_LOCAL_PLAN_2018',
      sourceClass: 'LOCAL_PLAN',
      status: 'OPERATIVE_DEVELOPMENT_PLAN_SOURCE',
      developmentPlanMembership: 'YES',
      materialConsiderationCapability: 'YES',
      authorityRef: `${CROYDON_TARGET_PATH}#${croydonPlan.id}`
    },
    {
      id: 'NPPF_2026_09_29',
      sourceClass: 'NATIONAL_PLANNING_POLICY',
      status: 'OPERATIVE_POLICY_MATERIAL_CONSIDERATION',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'YES',
      authorityRef: DPL10A_PATH
    },
    {
      id: 'DRAFT_LONDON_PLAN_2026',
      sourceClass: 'EMERGING_STRATEGIC_POLICY',
      status: 'EMERGING_NON_OPERATIVE',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'CASE_DEPENDENT',
      authorityRef: DPL10A_PATH
    },
    {
      id: 'CROYDON_LOCAL_PLAN_REVIEW_2026',
      sourceClass: 'EMERGING_LOCAL_PLAN',
      status: 'EMERGING_NON_OPERATIVE',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'CASE_DEPENDENT',
      authorityRef: `${CROYDON_TARGET_PATH}#${emergingCroydon.id}`
    },
    {
      id: 'LPG_OPTIMISING_SITE_CAPACITY_2023',
      sourceClass: 'LONDON_PLAN_GUIDANCE',
      status: 'ADOPTED_GUIDANCE',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'YES',
      authorityRef: `${LONDON_TARGET_PATH}#${siteCapacityLpg.id}`
    },
    {
      id: 'LPG_HOUSING_DESIGN_STANDARDS_2023',
      sourceClass: 'LONDON_PLAN_GUIDANCE',
      status: 'ADOPTED_GUIDANCE',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'YES',
      authorityRef: `${LONDON_TARGET_PATH}#${housingLpg.id}`
    },
    {
      id: 'CROYDON_SPD2',
      sourceClass: 'REVOKED_SUPPLEMENTARY_PLANNING_DOCUMENT',
      status: 'REVOKED_FROM_2022-07-26',
      developmentPlanMembership: 'NO',
      materialConsiderationCapability: 'NO',
      authorityRef: `${CROYDON_TARGET_PATH}#${revokedSpd.id}`
    }
  ].sort((a, b) => a.id.localeCompare(b.id))
}

const planningFinding = (
  london: RawTargetSlice,
  croydon: RawTargetSlice,
  statuses: readonly PlanningSourceStatusEntry[]
): NarrowSourceCompositionFinding => {
  if (london.id !== EXPECTED_LONDON_TARGET_ID) {
    throw new Error(`DPL-13F expected London target ${EXPECTED_LONDON_TARGET_ID}; got ${london.id}.`)
  }
  if (croydon.id !== EXPECTED_CROYDON_TARGET_ID) {
    throw new Error(`DPL-13F expected Croydon target ${EXPECTED_CROYDON_TARGET_ID}; got ${croydon.id}.`)
  }
  const parent = (croydon as unknown as Record<string, unknown>).parentStrategicTargetId
  if (parent !== london.id) {
    throw new Error(`DPL-13F requires Croydon strategic parent ${london.id}; got ${String(parent)}.`)
  }
  const currentDevelopmentPlan = statuses.filter((entry) => entry.developmentPlanMembership === 'YES').map((entry) => entry.id).sort()
  if (JSON.stringify(currentDevelopmentPlan) !== JSON.stringify(['CROYDON_LOCAL_PLAN_2018', 'LONDON_PLAN_2021'])) {
    throw new Error('DPL-13F planning composition must preserve exact London Plan + Croydon Local Plan membership for this controlled case.')
  }

  return canonicalFinding({
    owner: 'PLANNING',
    ownerEntryId: 'DPL10-COV-SOURCE-COMPOSITION-STATUS',
    result: 'PASS',
    reason:
      'For the controlled 2026-10-24 DPL-RS-02 Croydon case, source membership/status is mechanically composed: London Plan 2021 and Croydon Local Plan 2018 are the operative development-plan sources; NPPF remains outside development-plan membership; London/Croydon emerging plans remain non-operative; London Plan Guidance remains guidance; revoked Croydon SPD2 remains revoked. PASS is limited to source/status composition and says nothing about case-specific materiality, weight, policy compliance or permission.',
    sourceRefs: [
      DPL10A_PATH,
      LONDON_TARGET_PATH,
      CROYDON_TARGET_PATH,
      ...statuses.map((entry) => entry.authorityRef)
    ],
    missingFacts: []
  })
}

const replaceSourceRecord = (
  record: ScreeningAggregationRecord,
  finding: NarrowSourceCompositionFinding
): ScreeningAggregationRecord => {
  const positive = finding.result === 'PASS' || finding.result === 'NOT_APPLICABLE'
  return {
    ...record,
    sourceKind: 'OWNER_SOURCE_COMPOSITION',
    sourceIds: canonicalStrings([...finding.sourceRefs, `DPL13F:${finding.findingFingerprint}`]),
    sourceResult: `SOURCE_COMPOSITION_${finding.result}`,
    aggregationState: positive
      ? 'POSITIVE_RESOLVED'
      : finding.result === 'UNSUPPORTED'
        ? 'SUBSTANTIVE_UNSUPPORTED'
        : 'SUBSTANTIVE_UNRESOLVED',
    ...(positive ? { blockerClass: undefined } : { blockerClass: 'SUBSTANTIVE_UNRESOLVED' as const }),
    reason: finding.reason
  }
}

export const composeDPL13FSourceComposition = (): DPL13FSourceCompositionResult => {
  assertAuthorityBytes()

  const fixture = composeDPL13DSecondFixture()
  if (fixture.canonicalCase.authoredCandidate.fingerprint !== EXPECTED_RS02_CANDIDATE_FINGERPRINT) {
    throw new Error('DPL-13F refuses changed DPL-RS-02 candidate identity; source composition is stale.')
  }

  const b2Targets = loadB2TargetComposition()
  const england = requireTarget(b2Targets, EXPECTED_ENGLAND_TARGET_ID)
  const london = requireTarget(b2Targets, EXPECTED_LONDON_TARGET_ID)
  const croydon = loadWaveCBoroughTarget('Croydon').target

  const englandSourceFinding = englandFinding(england)
  const statuses = planningStatusEntries(london, croydon)
  const planningSourceFinding = planningFinding(london, croydon, statuses)

  const architecturalReview = composeDPL13EProjectReview()
  const baseAggregation = architecturalReview.aggregation
  const replacements = new Map<string, NarrowSourceCompositionFinding>([
    ['ENGLAND:ENG-COV-SOURCE-APPLICABILITY', englandSourceFinding],
    ['PLANNING:DPL10-COV-SOURCE-COMPOSITION-STATUS', planningSourceFinding]
  ])
  const records = baseAggregation.aggregationRecords.map((record): ScreeningAggregationRecord => {
    const finding = replacements.get(`${record.owner}:${record.ownerEntryId}`)
    if (!finding) return record
    if (record.aggregationState !== 'SUBSTANTIVE_UNRESOLVED') {
      throw new Error(`DPL-13F expected source-composition blocker ${record.owner}:${record.ownerEntryId} to remain substantively unresolved before integration.`)
    }
    return replaceSourceRecord(record, finding)
  })

  const readiness = fixture.readiness as unknown as ScreeningCoverageReadinessResult
  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness,
    records
  })
  const proofBoundary = {
    englandTechnicalCompliance: 'NOT_CLAIMED' as const,
    planningPolicyCompliance: 'NOT_CLAIMED' as const,
    planningPermission: 'EXTERNAL_ONLY' as const,
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const
  }
  const sourceSnapshotIds = england.sourceSnapshots.map((source) => source.id).sort((a, b) => a.localeCompare(b))
  const identityManifest = {
    schemaVersion: DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION,
    siteId: fixture.site.siteId,
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    englandTargetId: england.id,
    englandSourceSnapshotIds: sourceSnapshotIds,
    englandFindingFingerprint: englandSourceFinding.findingFingerprint,
    strategicTargetId: london.id,
    localTargetId: croydon.id,
    planningSourceStatus: statuses,
    planningFindingFingerprint: planningSourceFinding.findingFingerprint,
    baseArchitecturalReviewIdentity: architecturalReview.identityFingerprint,
    proofBoundary
  }
  const identityFingerprint = sha256SemanticFingerprint(identityManifest)

  return {
    schemaVersion: DPL13F_SOURCE_COMPOSITION_SCHEMA_VERSION,
    siteId: 'DPL-RS-02',
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    england: {
      targetId: england.id,
      sourceSnapshotIds,
      finding: englandSourceFinding
    },
    planning: {
      strategicTargetId: london.id,
      localTargetId: croydon.id,
      sourceStatus: statuses,
      finding: planningSourceFinding
    },
    aggregation,
    identityFingerprint,
    resultFingerprint: sha256SemanticFingerprint({
      identityFingerprint,
      aggregationResultFingerprint: aggregation.resultFingerprint
    }),
    proofBoundary
  }
}
