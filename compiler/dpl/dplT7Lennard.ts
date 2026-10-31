import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  composeDPLT6LennardScreeningAggregation,
  type DPLT6BlockerRecord
} from './dplT6Lennard.js'
import { loadNonPlanningCoverageRegistry } from './nonplanning-coverage.js'
import { loadPlanningCoverageRegistry } from './planning-coverage.js'

export const DPL_T7_SCHEMA_VERSION = 'DPL-T7-LENNARD-ACCELERATION-DISPOSITION-1' as const
export const DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT =
  'c59073cc2c6b073c2905a92b42b36b27f287e32e84d86d51f92cdd4d52ba3b45' as const
export const DPL_T7_PUBLIC_EVIDENCE_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-t7-public-screening-v01.json' as const

export const dplT7Dispositions = [
  'TRIGGER_NOT_ACTIVATED_AT_SCREENING',
  'ACTIVATED_DUE_NOW_EXTERNAL_EVIDENCE_SURVIVES',
  'FUTURE_DUE_OR_DOWNSTREAM',
  'UNRESOLVED_TRIGGER_AUTHORITY'
] as const
export type DPLT7Disposition = (typeof dplT7Dispositions)[number]

export const dplT7TriggerEvaluations = [
  'NO_POSITIVE_TRIGGER_FACT_ADMITTED',
  'POSITIVE_TRIGGER_FACT_ADMITTED',
  'TRIGGER_AUTHORITY_UNRESOLVED'
] as const
export type DPLT7TriggerEvaluation = (typeof dplT7TriggerEvaluations)[number]

type AccelerationOwner = 'PLANNING' | 'NON_PLANNING'

interface PublicEvidenceSource {
  readonly id: string
  readonly sourceClass: string
  readonly url: string
  readonly retrievedAt: string
  readonly subject: string
  readonly observed: readonly string[]
  readonly authorityBoundary: string
}

interface PublicEvidenceRecord {
  readonly schemaVersion: 'dpl.lennardT7PublicScreeningEvidence.v1'
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly researchDate: '2026-10-26'
  readonly assuranceProfile: 'SCREENING'
  readonly authorityBoundary: string
  readonly sources: readonly PublicEvidenceSource[]
  readonly controlledEvidenceRefs: readonly string[]
  readonly interpretiveRules: readonly string[]
}

interface DispositionSpec {
  readonly owner: AccelerationOwner
  readonly sourceEntryId: string
  readonly disposition: DPLT7Disposition
  readonly reason: string
  readonly evidenceRefs: readonly string[]
}

export interface DPLT7AccelerationRecord {
  readonly owner: AccelerationOwner
  readonly accelerationEntryId: string
  readonly sourceEntryId: string
  readonly defaultScreeningDisposition: string
  readonly registeredTriggers: readonly string[]
  readonly claimRefs: readonly string[]
  readonly triggerEvaluation: DPLT7TriggerEvaluation
  readonly disposition: DPLT7Disposition
  readonly accelerationAddsDueNowEvidence: boolean
  readonly baseCoverageRemainsBlocking: boolean
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly fingerprint: string
}

export interface DPLT7Result {
  readonly schemaVersion: typeof DPL_T7_SCHEMA_VERSION
  readonly t6ResultFingerprint: typeof DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly publicEvidenceFingerprint: string
  readonly planningCoverageFingerprint: string
  readonly nonPlanningCoverageFingerprint: string
  readonly accelerationInputCount: 15
  readonly records: readonly DPLT7AccelerationRecord[]
  readonly countsByDisposition: Readonly<Record<DPLT7Disposition, number>>
  readonly countsByTriggerEvaluation: Readonly<Record<DPLT7TriggerEvaluation, number>>
  readonly survivingAccelerationDueNowIds: readonly string[]
  readonly remainingBlockers: readonly DPLT6BlockerRecord[]
  readonly remainingBlockerIds: readonly string[]
  readonly result: 'ACCELERATION_FRONTIER_DISPOSED_NO_NEW_DUE_NOW_EVIDENCE'
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly siteEvidenceCommissioned: 'NO'
    readonly applicantProposalFactsTransferred: 'NO'
    readonly unknownTreatedAsTrigger: 'NO'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

const canonicalStrings = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const accelerationKey = (owner: AccelerationOwner, sourceEntryId: string): string =>
  `${owner}:${sourceEntryId}::ACCELERATION_REVIEW`

export const DPL_T7_EXPECTED_ACCELERATION_IDS = [
  'PLANNING:DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-HERITAGE-DESIGNATION-SETTING::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-HOUSING-QUALITY-ACCESSIBILITY::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING::ACCELERATION_REVIEW',
  'PLANNING:DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-ACCESS-STATUS::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-GROUND-ENVIRONMENT::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-LEGAL-BOUNDARY-TITLE::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-PRIVATE-RIGHTS::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-SEWER-UNDERTAKER::ACCELERATION_REVIEW',
  'NON_PLANNING:DPL11-COV-UTILITIES::ACCELERATION_REVIEW'
].sort((a, b) => compareDplIdentityStrings(a, b)) as readonly string[]

const dispositionSpecs: readonly DispositionSpec[] = [
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
    disposition: 'TRIGGER_NOT_ACTIVATED_AT_SCREENING',
    reason: 'T3/T4 positively establish one unchanged Reference House placement inside the admitted screening polygon. No admitted site/context fact establishes a condition capable of categorically defeating that proposition. The ~0.640 m title-index clearance is explicitly screening-only and remains a substantive capacity/maintenance evidence question rather than a positive acceleration fact.',
    evidenceRefs: ['T5:LNR-C03', 'T5:LNR-C04', 'T4:0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-HOUSING-QUALITY-ACCESSIBILITY',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Candidate-specific policy measurements and planning M4 assignment are not yet admitted, but missing measurements are not a known obvious housing-quality/accessibility blocker. The applicant proposal has a separate M4(2) statement, which is contextual only and is not transferred to the Reference House candidate.',
    evidenceRefs: ['T5:LNR-C16', 'T7-PUB-02']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-NEIGHBOUR-AMENITY-PRIVACY-DAYLIGHT',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Decision-grade Reference House neighbour geometry/openings remain unknown. The public file indexes a BRE 25 Degree Test for the different applicant proposal, but no admitted fact establishes obvious candidate-specific amenity or privacy conflict. Unknown neighbour evidence cannot self-activate this trigger.',
    evidenceRefs: ['T5:LNR-C09', 'T7-PUB-02']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-TRANSPORT-ACCESS-HIGHWAY-PARKING',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Exact-site evidence identifies an ordinary street-front relationship, existing front-garden/front-door access and a dropped kerb. No admitted street/access fact establishes an obvious categorical road-safety or access concern, and candidate-specific parking policy facts are not yet decision-critical evidence.',
    evidenceRefs: ['T5:LNR-C06', 'S3:street-access']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-HERITAGE-DESIGNATION-SETTING',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'No admitted credible designation or setting evidence indicates a potentially categorical heritage constraint. The public mirror reports no scheduled monument at its approximate postcode-centred pin, but that is not an authoritative all-heritage absence finding; heritage remains future-due rather than positively accelerated.',
    evidenceRefs: ['T5:LNR-C14', 'T7-PUB-02']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-TREES-LANDSCAPE-URBAN-GREENING',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'No admitted known/protected tree or landscape condition dominates the verified Reference House placement. The applicant file includes a landscaping strategy for a different proposal, which neither transfers tree status nor proves absence; no positive acceleration fact is established.',
    evidenceRefs: ['T5:LNR-C10', 'T7-PUB-02']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-ECOLOGY-BIODIVERSITY-GREEN-INFRASTRUCTURE',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'The public mirror reports habitat-network context and an SSSI approximately 349 m from a postcode-centred pin, and indexes a BNG exemption statement for the applicant proposal. Those facts do not establish a site-specific ecological/designation condition capable of categorically defeating the Reference House candidate. Ecology remains unresolved and future-due, not accelerated.',
    evidenceRefs: ['T5:LNR-C15', 'T7-PUB-02']
  },
  {
    owner: 'PLANNING',
    sourceEntryId: 'DPL10-COV-FLOOD-DRAINAGE-SUDS-PLANNING',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'The public mirror reports the approximate application pin outside Flood Zones 2 and 3 and indexes a SuDS note for the different applicant proposal. Candidate-specific surface-water, sewer and drainage facts remain unresolved, but no known flood/sewer/drainage condition is admitted that threatens the only conformance-preserving deployment route.',
    evidenceRefs: ['T5:LNR-C11', 'T5:LNR-C05', 'T7-PUB-02']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-ACCESS-STATUS',
    disposition: 'TRIGGER_NOT_ACTIVATED_AT_SCREENING',
    reason: 'The admitted physical relationship is conventional street frontage with existing front access and a dropped kerb; it is not known to be narrow, backland, private, unmade, steep or otherwise obviously constrained. The due-now base access record remains unresolved because legal/highway status and detailed route evidence are not proved.',
    evidenceRefs: ['T5:LNR-C06', 'T5:LNR-C08', 'S3:street-access']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-GROUND-ENVIRONMENT',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Ground, contamination, groundwater, gas and foundation evidence remain unknown, but no known tree/ground/mining/contamination/groundwater/gas condition is admitted that plausibly defeats the deployment. Unknown ground conditions remain future-due rather than accelerated.',
    evidenceRefs: ['T5:LNR-C13', 'T5:LNR-C10', 'T5:LNR-C11']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-LEGAL-BOUNDARY-TITLE',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'The HMLR/Planning Data polygon is explicitly indicative and legal boundary precision remains unresolved. That limitation is not a known boundary/control discrepancy, third-party strip or title ambiguity capable of defeating the site. The registered trigger therefore does not accelerate full title/boundary evidence at SCREENING.',
    evidenceRefs: ['T5:LNR-C03', 'T5:LNR-C07', 'S1:title-index']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-PHYSICAL-FLOOD-WATER',
    disposition: 'TRIGGER_NOT_ACTIVATED_AT_SCREENING',
    reason: 'No admitted flood/water source identifies a potentially fatal or strongly geometry-shaping condition. The public mirror reports the approximate pin outside Flood Zones 2 and 3, but does not resolve surface-water/groundwater/site-water evidence. The due-now base high-level flood/water blocker therefore remains while the acceleration trigger is not activated.',
    evidenceRefs: ['T5:LNR-C11', 'T7-PUB-02']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-PRIVATE-RIGHTS',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Private rights, easements and covenants are unresolved, but no known adverse covenant/easement/access-right/ransom-strip/wayleave issue is admitted. An unresolved rights search is not itself the registered acceleration condition.',
    evidenceRefs: ['T5:LNR-C08']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-SEWER-UNDERTAKER',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Sewer route, capacity and connection evidence are unresolved, but no known sewer route/capacity/easement/build-over condition is admitted that plausibly defeats the deployment. The family therefore remains future-due.',
    evidenceRefs: ['T5:LNR-C11']
  },
  {
    owner: 'NON_PLANNING',
    sourceEntryId: 'DPL11-COV-UTILITIES',
    disposition: 'FUTURE_DUE_OR_DOWNSTREAM',
    reason: 'Utility routes, capacities and rights are unresolved, but no known capacity/network/easement/route issue is admitted that plausibly defeats the deployment. Existing occupation is not used to infer provider-confirmed capacity, and unknownness does not accelerate the family.',
    evidenceRefs: ['T5:LNR-C12']
  }
]

const readPublicEvidence = (): { record: PublicEvidenceRecord; fingerprint: string; sourceIds: Set<string> } => {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), DPL_T7_PUBLIC_EVIDENCE_PATH), 'utf8')) as PublicEvidenceRecord
  if (raw.schemaVersion !== 'dpl.lennardT7PublicScreeningEvidence.v1') {
    throw new Error(`DPL-T7 public evidence schema drifted: ${String(raw.schemaVersion)}.`)
  }
  if (raw.controlId !== 'DPL-T-CONTROL-004' || raw.researchDate !== '2026-10-26' || raw.assuranceProfile !== 'SCREENING') {
    throw new Error('DPL-T7 public evidence identity/assurance drifted.')
  }
  if (!raw.authorityBoundary || raw.sources.length === 0 || raw.interpretiveRules.length === 0) {
    throw new Error('DPL-T7 public evidence must retain authority and interpretive boundaries.')
  }
  const sourceIds = new Set(raw.sources.map((source) => source.id))
  if (sourceIds.size !== raw.sources.length) throw new Error('DPL-T7 public evidence contains duplicate source ids.')
  return { record: raw, fingerprint: sha256DplSemanticFingerprint(raw), sourceIds }
}

const sourceEntry = (
  owner: AccelerationOwner,
  sourceEntryId: string,
  planning: ReturnType<typeof loadPlanningCoverageRegistry>,
  nonPlanning: ReturnType<typeof loadNonPlanningCoverageRegistry>
) => {
  const entry = owner === 'PLANNING'
    ? planning.registry.entries.find((candidate) => candidate.id === sourceEntryId)
    : nonPlanning.registry.entries.find((candidate) => candidate.id === sourceEntryId)
  if (!entry) throw new Error(`DPL-T7 missing source coverage entry ${owner}:${sourceEntryId}.`)
  return entry
}

const counts = <T extends string>(universe: readonly T[], values: readonly T[]): Readonly<Record<T, number>> => {
  const result = Object.fromEntries(universe.map((value) => [value, 0])) as Record<T, number>
  for (const value of values) result[value] += 1
  return result
}

export const composeDPLT7LennardAccelerationDisposition = (): DPLT7Result => {
  const t6 = composeDPLT6LennardScreeningAggregation()
  if (t6.resultFingerprint !== DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT) {
    throw new Error(`DPL-T7 refuses changed T6 result identity: ${t6.resultFingerprint}.`)
  }

  const accelerationBlockers = t6.blockers.filter((blocker) =>
    (blocker.owner === 'PLANNING' || blocker.owner === 'NON_PLANNING') &&
    blocker.ownerEntryId.endsWith('::ACCELERATION_REVIEW')
  )
  const actualAccelerationIds = accelerationBlockers
    .map((blocker) => `${blocker.owner}:${blocker.ownerEntryId}`)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  if (JSON.stringify(actualAccelerationIds) !== JSON.stringify(DPL_T7_EXPECTED_ACCELERATION_IDS)) {
    throw new Error(`DPL-T7 refuses changed acceleration frontier: ${actualAccelerationIds.join(', ')}.`)
  }

  const specIds = dispositionSpecs
    .map((spec) => accelerationKey(spec.owner, spec.sourceEntryId))
    .sort((a, b) => compareDplIdentityStrings(a, b))
  if (JSON.stringify(specIds) !== JSON.stringify(DPL_T7_EXPECTED_ACCELERATION_IDS)) {
    throw new Error('DPL-T7 disposition specification does not exactly cover the frozen T6 acceleration universe.')
  }

  const publicEvidence = readPublicEvidence()
  const planning = loadPlanningCoverageRegistry()
  const nonPlanning = loadNonPlanningCoverageRegistry()
  const t6BlockerKeys = new Set(t6.blockers.map((blocker) => `${blocker.owner}:${blocker.ownerEntryId}`))

  const records = dispositionSpecs.map((spec): DPLT7AccelerationRecord => {
    const accelerationEntryId = `${spec.sourceEntryId}::ACCELERATION_REVIEW`
    const blocker = accelerationBlockers.find((candidate) =>
      candidate.owner === spec.owner && candidate.ownerEntryId === accelerationEntryId
    )
    if (!blocker) throw new Error(`DPL-T7 missing T6 blocker ${spec.owner}:${accelerationEntryId}.`)

    const entry = sourceEntry(spec.owner, spec.sourceEntryId, planning, nonPlanning)
    if (entry.accelerationTriggers.length === 0) {
      throw new Error(`DPL-T7 source entry ${spec.owner}:${spec.sourceEntryId} has no registered acceleration trigger.`)
    }

    const triggerEvaluation: DPLT7TriggerEvaluation = 'NO_POSITIVE_TRIGGER_FACT_ADMITTED'
    if (spec.disposition === 'FUTURE_DUE_OR_DOWNSTREAM' && entry.defaultScreeningDisposition !== 'FUTURE_DUE') {
      throw new Error(`DPL-T7 ${spec.owner}:${spec.sourceEntryId} cannot be future-due from ${entry.defaultScreeningDisposition}.`)
    }
    if (spec.disposition === 'TRIGGER_NOT_ACTIVATED_AT_SCREENING' && entry.defaultScreeningDisposition === 'FUTURE_DUE') {
      throw new Error(`DPL-T7 ${spec.owner}:${spec.sourceEntryId} must preserve FUTURE_DUE timing.`)
    }
    if (spec.disposition === 'ACTIVATED_DUE_NOW_EXTERNAL_EVIDENCE_SURVIVES' || spec.disposition === 'UNRESOLVED_TRIGGER_AUTHORITY') {
      throw new Error(`DPL-T7 current Lennard evidence does not earn ${spec.disposition} for ${spec.owner}:${spec.sourceEntryId}.`)
    }

    for (const evidenceRef of spec.evidenceRefs.filter((ref) => ref.startsWith('T7-PUB-'))) {
      if (!publicEvidence.sourceIds.has(evidenceRef)) {
        throw new Error(`DPL-T7 record ${spec.owner}:${spec.sourceEntryId} references unknown public evidence ${evidenceRef}.`)
      }
    }

    const payload = {
      owner: spec.owner,
      accelerationEntryId,
      sourceEntryId: spec.sourceEntryId,
      defaultScreeningDisposition: entry.defaultScreeningDisposition,
      registeredTriggers: canonicalStrings(entry.accelerationTriggers),
      claimRefs: canonicalStrings(blocker.claimRefs),
      triggerEvaluation,
      disposition: spec.disposition,
      accelerationAddsDueNowEvidence: false,
      baseCoverageRemainsBlocking: t6BlockerKeys.has(`${spec.owner}:${spec.sourceEntryId}`),
      reason: spec.reason,
      evidenceRefs: canonicalStrings(spec.evidenceRefs)
    }
    return { ...payload, fingerprint: sha256DplSemanticFingerprint(payload) }
  }).sort((a, b) => {
    const ownerOrder = a.owner === b.owner ? 0 : a.owner === 'PLANNING' ? -1 : 1
    return ownerOrder || compareDplIdentityStrings(a.sourceEntryId, b.sourceEntryId)
  })

  const survivingAccelerationDueNowIds = records
    .filter((record) => record.accelerationAddsDueNowEvidence)
    .map((record) => `${record.owner}:${record.accelerationEntryId}`)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  if (survivingAccelerationDueNowIds.length !== 0) {
    throw new Error('DPL-T7 unexpectedly created acceleration-driven due-now evidence.')
  }

  const remainingBlockers = t6.blockers.filter((blocker) => !blocker.ownerEntryId.endsWith('::ACCELERATION_REVIEW'))
  const remainingBlockerIds = remainingBlockers
    .map((blocker) => `${blocker.owner}:${blocker.ownerEntryId}`)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  if (remainingBlockers.length !== 10) {
    throw new Error(`DPL-T7 expected ten substantive T6 blockers after acceleration disposition, found ${remainingBlockers.length}.`)
  }

  const countsByDisposition = counts(dplT7Dispositions, records.map((record) => record.disposition))
  const countsByTriggerEvaluation = counts(dplT7TriggerEvaluations, records.map((record) => record.triggerEvaluation))
  const proofBoundary = {
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    siteEvidenceCommissioned: 'NO' as const,
    applicantProposalFactsTransferred: 'NO' as const,
    unknownTreatedAsTrigger: 'NO' as const,
    dpl16: 'HELD' as const
  }
  const resultPayload = {
    schemaVersion: DPL_T7_SCHEMA_VERSION,
    t6ResultFingerprint: DPL_T7_EXPECTED_T6_RESULT_FINGERPRINT,
    controlId: t6.controlId,
    candidateId: t6.candidateId,
    publicEvidenceFingerprint: publicEvidence.fingerprint,
    planningCoverageFingerprint: planning.fingerprint,
    nonPlanningCoverageFingerprint: nonPlanning.fingerprint,
    accelerationInputCount: records.length,
    records,
    countsByDisposition,
    countsByTriggerEvaluation,
    survivingAccelerationDueNowIds,
    remainingBlockerIds,
    result: 'ACCELERATION_FRONTIER_DISPOSED_NO_NEW_DUE_NOW_EVIDENCE' as const,
    proofBoundary
  }

  return {
    ...resultPayload,
    accelerationInputCount: 15,
    remainingBlockers,
    resultFingerprint: sha256DplSemanticFingerprint(resultPayload)
  }
}
