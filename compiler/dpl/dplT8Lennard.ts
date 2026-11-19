import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { composeDPLT7LennardAccelerationDisposition } from './dplT7Lennard.js'

export const DPL_T8_SCHEMA_VERSION = 'DPL-T8-LENNARD-SUBSTANTIVE-DISPOSITION-1' as const
export const DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT =
  'f326bf64e599b08099edd21160e8e6a7af79477fd76a1f72b3b445e587f3c88c' as const
export const DPL_T8_AUTHORITY_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-t8-authority-v01.json' as const
export const DPL_T8_CANDIDATE_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-candidate-v01.json' as const
export const DPL_T8_ANALYSIS_GEOMETRY_PATH =
  'project/dpl/sites/dpl-t-control-004-lennard-road-analysis-bng-v01.json' as const

export const dplT8Dispositions = [
  'RESOLVED_EXISTING_AUTHORITY',
  'RECLASSIFIED_FUTURE_DUE',
  'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE',
  'UNRESOLVED_AUTHORITY'
] as const
export type DPLT8Disposition = (typeof dplT8Dispositions)[number]

export const dplT8EvidenceClasses = [
  'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
  'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
  'EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN'
] as const
export type DPLT8EvidenceClass = (typeof dplT8EvidenceClasses)[number]

export const dplT8AuthorityClasses = [
  'PLANNING_EMERGING_POLICY_WEIGHT_JUDGEMENT',
  'LOCAL_QUALITATIVE_DESIGN_JUDGEMENT',
  'STRATEGIC_CAPACITY_PLANNING_JUDGEMENT'
] as const
export type DPLT8AuthorityClass = (typeof dplT8AuthorityClasses)[number]

type Point = readonly [number, number]
type T8Owner = 'REFERENCE_HOUSE' | 'ENGLAND' | 'PLANNING' | 'NON_PLANNING'

interface T8AuthoritySource {
  readonly id: string
  readonly sourceClass: string
  readonly title: string
  readonly url: string
  readonly retrievedAt: string
  readonly observed: readonly string[]
  readonly authorityBoundary: string
}

interface T8AuthorityEvidence {
  readonly schemaVersion: 'dpl.lennardT8AuthorityEvidence.v1'
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly researchDate: '2026-10-26'
  readonly assuranceProfile: 'SCREENING'
  readonly authorityBoundary: string
  readonly sources: readonly T8AuthoritySource[]
  readonly controlledProjectEvidence: readonly string[]
  readonly classificationRules: readonly string[]
}

interface CandidateRecord {
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly assuranceProfile: 'SCREENING'
  readonly referenceHouse: {
    readonly boundedConformanceFacts: {
      readonly storeys: number
    }
  }
  readonly placement: {
    readonly footprintBngM: readonly Point[]
    readonly screeningFitEvidence: {
      readonly containedByAdmittedTitleIndexPolygon: boolean
      readonly minimumBoundaryClearanceM: number
    }
  }
}

interface AnalysisGeometryRecord {
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly derivation: {
    readonly analysisCrs: 'EPSG:27700'
    readonly authority: 'DERIVED_SCREENING_GEOMETRY'
    readonly limitation: string
  }
  readonly polygonBngM: readonly Point[]
}

interface DispositionSpec {
  readonly blockerId: string
  readonly disposition: DPLT8Disposition
  readonly reason: string
  readonly evidenceClass?: DPLT8EvidenceClass
  readonly authorityClass?: DPLT8AuthorityClass
  readonly evidenceRefs: readonly string[]
  readonly sharedDependencyIds?: readonly string[]
}

export interface DPLT8DispositionRecord {
  readonly blockerId: string
  readonly owner: T8Owner
  readonly ownerEntryId: string
  readonly disposition: DPLT8Disposition
  readonly evidenceClass: DPLT8EvidenceClass | null
  readonly authorityClass: DPLT8AuthorityClass | null
  readonly reason: string
  readonly evidenceRefs: readonly string[]
  readonly sharedDependencyIds: readonly string[]
  readonly fingerprint: string
}

export interface DPLT8Result {
  readonly schemaVersion: typeof DPL_T8_SCHEMA_VERSION
  readonly t7ResultFingerprint: typeof DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT
  readonly controlId: 'DPL-T-CONTROL-004'
  readonly candidateId: 'DPL-T-CANDIDATE-004-01'
  readonly authorityEvidenceFingerprint: string
  readonly candidateFingerprint: string
  readonly analysisGeometryFingerprint: string
  readonly inputBlockerCount: 10
  readonly records: readonly DPLT8DispositionRecord[]
  readonly countsByDisposition: Readonly<Record<DPLT8Disposition, number>>
  readonly sideSpaceScreening: {
    readonly policyId: 'BROM-P8-SIDE-SPACE'
    readonly policyNumericFloorM: 1
    readonly candidateStoreys: 2
    readonly westSideIndicativeMinimumClearanceM: number
    readonly eastSideIndicativeMinimumClearanceM: number
    readonly bothIndicativeSidesBelowNumericFloor: true
    readonly legalOrMeasuredBoundaryConclusion: 'NOT_ADMITTED'
  }
  readonly survivingEvidenceClasses: readonly DPLT8EvidenceClass[]
  readonly survivingAuthorityClasses: readonly DPLT8AuthorityClass[]
  readonly dueNowUnresolvedBlockerIds: readonly string[]
  readonly futureDueBlockerIds: readonly string[]
  readonly resolvedBlockerIds: readonly string[]
  readonly result: 'SUBSTANTIVE_FRONTIER_CLASSIFIED_MINIMUM_EVIDENCE_DEFINED'
  readonly proofBoundary: {
    readonly compatibleAtScreening: 'NOT_ADMITTED'
    readonly incompatible: 'NOT_ADMITTED'
    readonly routeExhaustion: 'NOT_IMPLEMENTED'
    readonly referenceHouseMutation: 'NO'
    readonly evidenceCommissioned: 'NO'
    readonly legalBoundaryDetermined: 'NO'
    readonly planningDetermination: 'NO'
    readonly dpl16: 'HELD'
  }
  readonly resultFingerprint: string
}

export const DPL_T8_EXPECTED_INPUT_BLOCKER_IDS = [
  'REFERENCE_HOUSE:RH-PROT-08',
  'REFERENCE_HOUSE:RH-PROT-14',
  'ENGLAND:ENG-COV-SOURCE-APPLICABILITY',
  'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
  'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
  'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
  'NON_PLANNING:DPL11-COV-ACCESS-STATUS',
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER',
  'NON_PLANNING:DPL11-COV-SITE-CONTROL'
].sort((a, b) => compareDplIdentityStrings(a, b)) as readonly string[]

const dispositionSpecs: readonly DispositionSpec[] = [
  {
    blockerId: 'REFERENCE_HOUSE:RH-PROT-08',
    disposition: 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE',
    evidenceClass: 'COMPETENT_STRUCTURAL_CONCEPT_REVIEW',
    reason: 'Current DPL-02 authority deliberately keeps the protected primary structural concept outside project-author self-certification. The minimum next evidence is a competent structural concept review against the unchanged Reference House and admitted site envelope. T8 does not pre-commission ground investigation: the engineer must state any ground/foundation dependency rather than T8 assuming one.',
    evidenceRefs: ['DPL-02:RH-PROT-08', 'T7:f326bf64e599b08099edd21160e8e6a7af79477fd76a1f72b3b445e587f3c88c']
  },
  {
    blockerId: 'REFERENCE_HOUSE:RH-PROT-14',
    disposition: 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE',
    evidenceClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
    reason: 'Maintenance geography cannot be positively conformed from an indicative HMLR title-index polygon. The same measured side-boundary/topographic geometry needed by Bromley Policy 8 is the narrow external fact set required before the project author can resolve actual façade/maintenance access geography.',
    evidenceRefs: ['DPL-02:RH-PROT-14', 'T8-AUTH-01', 'T3:candidate-screening-fit'],
    sharedDependencyIds: ['PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY']
  },
  {
    blockerId: 'ENGLAND:ENG-COV-SOURCE-APPLICABILITY',
    disposition: 'RECLASSIFIED_FUTURE_DUE',
    reason: 'The transition rule is known, but exact technical source applicability turns on future building-control notice/application and commencement events that do not yet exist. No England technical-family result is being promoted to a positive SCREENING pass here, so absence of those future events is not current site evidence debt.',
    evidenceRefs: ['T8-AUTH-05']
  },
  {
    blockerId: 'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT',
    disposition: 'UNRESOLVED_AUTHORITY',
    authorityClass: 'PLANNING_EMERGING_POLICY_WEIGHT_JUDGEMENT',
    reason: 'Current source status is knowable: Bromley review material is non-operative and its published Direction of Travel contains no draft policies, while a Draft London Plan completed statutory consultation in October 2026 but is not adopted. NPPF DM4 makes weight depend on stage, objections and policy compliance; the compiler cannot manufacture a scalar candidate-specific weight.',
    evidenceRefs: ['T8-AUTH-02', 'T8-AUTH-03', 'T8-AUTH-04']
  },
  {
    blockerId: 'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
    disposition: 'UNRESOLVED_AUTHORITY',
    authorityClass: 'LOCAL_QUALITATIVE_DESIGN_JUDGEMENT',
    reason: 'The operative Bromley policy set and its method classes are already identified. What remains is qualitative application of design/context/amenity policy to the exact candidate, which is planning/architectural judgement rather than an undifferentiated request for more site data. T8 therefore preserves the authority boundary and adds no standalone consultant evidence package.',
    evidenceRefs: ['BROMLEY-LOCAL-PLANNING-2019-2026-10-22', 'T8-AUTH-01']
  },
  {
    blockerId: 'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY',
    disposition: 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE',
    evidenceClass: 'MEASURED_SIDE_BOUNDARY_AND_MAINTENANCE_GEOMETRY',
    reason: 'Bromley Policy 8 applies an explicit 1 m side-space floor to this two-storey candidate. Deterministic replay against the admitted indicative title-index polygon puts both candidate side edges below 1 m, making exact side-boundary geometry decision-critical. Because that polygon is not a legal or measured boundary, T8 cannot call a policy failure; it can only earn the narrow need for authoritative measured boundary/side-space geometry.',
    evidenceRefs: ['T8-AUTH-01', 'BROM-P8-SIDE-SPACE', 'T3:candidate-screening-fit'],
    sharedDependencyIds: ['REFERENCE_HOUSE:RH-PROT-14']
  },
  {
    blockerId: 'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY',
    disposition: 'UNRESOLVED_AUTHORITY',
    authorityClass: 'STRATEGIC_CAPACITY_PLANNING_JUDGEMENT',
    reason: 'T3/T4 establish physical containment but do not establish planning capacity. Policy 8 makes side-boundary geometry a real dependency, while the broader character/context/capacity remainder is planning judgement. T8 avoids duplicating the boundary survey as a second evidence demand and records this blocker as an authority decision dependent on the shared measured-geometry result.',
    evidenceRefs: ['T4:0fafa462472370e54d5e1e3aba40e88cb594e8aafb877e0c687af0e5c5fc96dc', 'T8-AUTH-01'],
    sharedDependencyIds: ['PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY']
  },
  {
    blockerId: 'NON_PLANNING:DPL11-COV-ACCESS-STATUS',
    disposition: 'RESOLVED_EXISTING_AUTHORITY',
    reason: 'For SCREENING, the admitted exact-site record establishes conventional Lennard Road street frontage, existing front-garden/front-door access and a dropped kerb. T7 found no positive fact making legal/highway status decision-critical. Private rights and exact highway adoption remain explicitly future/downstream and are not silently passed.',
    evidenceRefs: ['T5:LNR-C06', 'S3:street-access', 'T7:NON_PLANNING:DPL11-COV-ACCESS-STATUS::ACCELERATION_REVIEW']
  },
  {
    blockerId: 'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER',
    disposition: 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE',
    evidenceClass: 'EA_ADDRESS_LEVEL_LONG_TERM_FLOOD_SCREEN',
    reason: 'DPL-11 asks for authoritative high-level flood/water screening before a positive SCREENING conclusion. The current record contains approximate/mirror context but no admitted Environment Agency address-level Lennard output. The minimum surviving evidence is the free public EA long-term address/area screen, not a flood-risk assessment, modelling exercise or drainage design unless that screen later indicates escalation.',
    evidenceRefs: ['T8-AUTH-06', 'T5:LNR-C11']
  },
  {
    blockerId: 'NON_PLANNING:DPL11-COV-SITE-CONTROL',
    disposition: 'RECLASSIFIED_FUTURE_DUE',
    reason: 'This packet is an explicitly excluded instrumented control, not an acquisition or live applicant project. Parcel/address/planning identity is already coherent enough to know what land is being tested. Ownership interest or transactional site control becomes real only if the control graduates into an actual deployment/acquisition route; requiring it now would confuse empirical pipeline testing with commercial control.',
    evidenceRefs: ['T5:LNR-C01', 'T5:LNR-C03', 'T7:instrumented-control-boundary']
  }
]

const canonicalStrings = <T extends string>(values: readonly T[]): T[] =>
  [...new Set(values)].sort((a, b) => compareDplIdentityStrings(a, b))

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T

const readAuthorityEvidence = (): { record: T8AuthorityEvidence; fingerprint: string; sourceIds: Set<string> } => {
  const record = readJson<T8AuthorityEvidence>(DPL_T8_AUTHORITY_PATH)
  if (
    record.schemaVersion !== 'dpl.lennardT8AuthorityEvidence.v1' ||
    record.controlId !== 'DPL-T-CONTROL-004' ||
    record.researchDate !== '2026-10-26' ||
    record.assuranceProfile !== 'SCREENING'
  ) {
    throw new Error('DPL-T8 authority-evidence identity drifted.')
  }
  if (!record.authorityBoundary || record.sources.length < 6 || record.classificationRules.length === 0) {
    throw new Error('DPL-T8 authority evidence lost its source/boundary contract.')
  }
  const sourceIds = new Set(record.sources.map((source) => source.id))
  if (sourceIds.size !== record.sources.length) throw new Error('DPL-T8 authority evidence has duplicate source ids.')
  return { record, fingerprint: sha256DplSemanticFingerprint(record), sourceIds }
}

const squared = (value: number): number => value * value

const pointToSegmentDistance = (point: Point, start: Point, end: Point): number => {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const denominator = squared(dx) + squared(dy)
  if (denominator === 0) return Math.hypot(point[0] - start[0], point[1] - start[1])
  const projection = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / denominator))
  const nearestX = start[0] + projection * dx
  const nearestY = start[1] + projection * dy
  return Math.hypot(point[0] - nearestX, point[1] - nearestY)
}

const orientation = (a: Point, b: Point, c: Point): number =>
  (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

const segmentsIntersect = (a: Point, b: Point, c: Point, d: Point): boolean => {
  const abC = orientation(a, b, c)
  const abD = orientation(a, b, d)
  const cdA = orientation(c, d, a)
  const cdB = orientation(c, d, b)
  return abC * abD <= 0 && cdA * cdB <= 0
}

const segmentDistance = (a: Point, b: Point, c: Point, d: Point): number => {
  if (segmentsIntersect(a, b, c, d)) return 0
  return Math.min(
    pointToSegmentDistance(a, c, d),
    pointToSegmentDistance(b, c, d),
    pointToSegmentDistance(c, a, b),
    pointToSegmentDistance(d, a, b)
  )
}

const segmentToPolygonBoundaryDistance = (start: Point, end: Point, polygon: readonly Point[]): number => {
  if (polygon.length < 4) throw new Error('DPL-T8 analysis polygon is too small.')
  let minimum = Number.POSITIVE_INFINITY
  for (let index = 0; index < polygon.length - 1; index += 1) {
    minimum = Math.min(minimum, segmentDistance(start, end, polygon[index], polygon[index + 1]))
  }
  return minimum
}

const counts = <T extends string>(universe: readonly T[], values: readonly T[]): Readonly<Record<T, number>> => {
  const result = Object.fromEntries(universe.map((value) => [value, 0])) as Record<T, number>
  for (const value of values) result[value] += 1
  return result
}

export const composeDPLT8LennardSubstantiveDisposition = (): DPLT8Result => {
  const t7 = composeDPLT7LennardAccelerationDisposition()
  if (t7.resultFingerprint !== DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT) {
    throw new Error(`DPL-T8 refuses changed T7 result identity: ${t7.resultFingerprint}.`)
  }
  const inputIds = canonicalStrings(t7.remainingBlockerIds)
  if (JSON.stringify(inputIds) !== JSON.stringify(DPL_T8_EXPECTED_INPUT_BLOCKER_IDS)) {
    throw new Error(`DPL-T8 refuses changed substantive frontier: ${inputIds.join(', ')}.`)
  }

  const specIds = canonicalStrings(dispositionSpecs.map((spec) => spec.blockerId))
  if (JSON.stringify(specIds) !== JSON.stringify(DPL_T8_EXPECTED_INPUT_BLOCKER_IDS)) {
    throw new Error('DPL-T8 disposition ledger does not exactly cover the T7 substantive frontier.')
  }

  const authority = readAuthorityEvidence()
  const candidate = readJson<CandidateRecord>(DPL_T8_CANDIDATE_PATH)
  const analysis = readJson<AnalysisGeometryRecord>(DPL_T8_ANALYSIS_GEOMETRY_PATH)
  if (candidate.candidateId !== t7.candidateId || candidate.assuranceProfile !== 'SCREENING') {
    throw new Error('DPL-T8 candidate identity/assurance drifted.')
  }
  if (analysis.controlId !== t7.controlId || analysis.derivation.analysisCrs !== 'EPSG:27700') {
    throw new Error('DPL-T8 analysis geometry identity/CRS drifted.')
  }
  if (analysis.derivation.authority !== 'DERIVED_SCREENING_GEOMETRY' || !analysis.derivation.limitation) {
    throw new Error('DPL-T8 analysis geometry lost its screening-only authority boundary.')
  }
  if (!candidate.placement.screeningFitEvidence.containedByAdmittedTitleIndexPolygon) {
    throw new Error('DPL-T8 expected the T4-contained candidate.')
  }
  if (candidate.referenceHouse.boundedConformanceFacts.storeys !== 2) {
    throw new Error('DPL-T8 Policy 8 classification assumes the frozen two-storey Reference House.')
  }

  const footprint = candidate.placement.footprintBngM
  if (footprint.length !== 5) throw new Error(`DPL-T8 expected closed four-corner candidate footprint, found ${footprint.length}.`)
  const westSide = [footprint[3], footprint[0]] as const
  const eastSide = [footprint[1], footprint[2]] as const
  const westSideIndicativeMinimumClearanceM = segmentToPolygonBoundaryDistance(westSide[0], westSide[1], analysis.polygonBngM)
  const eastSideIndicativeMinimumClearanceM = segmentToPolygonBoundaryDistance(eastSide[0], eastSide[1], analysis.polygonBngM)
  const policyNumericFloorM = 1 as const
  if (!(westSideIndicativeMinimumClearanceM < policyNumericFloorM && eastSideIndicativeMinimumClearanceM < policyNumericFloorM)) {
    throw new Error('DPL-T8 expected both indicative candidate side clearances below the Bromley Policy 8 numeric floor.')
  }

  const blockersById = new Map(t7.remainingBlockers.map((blocker) => [`${blocker.owner}:${blocker.ownerEntryId}`, blocker]))
  const records = dispositionSpecs.map((spec): DPLT8DispositionRecord => {
    const blocker = blockersById.get(spec.blockerId)
    if (!blocker) throw new Error(`DPL-T8 missing parent blocker ${spec.blockerId}.`)
    if (spec.evidenceClass && spec.disposition !== 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE') {
      throw new Error(`DPL-T8 ${spec.blockerId} has evidence class outside a surviving-evidence disposition.`)
    }
    if (spec.authorityClass && spec.disposition !== 'UNRESOLVED_AUTHORITY') {
      throw new Error(`DPL-T8 ${spec.blockerId} has authority class outside unresolved-authority disposition.`)
    }
    if (spec.disposition === 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE' && !spec.evidenceClass) {
      throw new Error(`DPL-T8 ${spec.blockerId} survives without a minimum evidence class.`)
    }
    if (spec.disposition === 'UNRESOLVED_AUTHORITY' && !spec.authorityClass) {
      throw new Error(`DPL-T8 ${spec.blockerId} lacks its required authority class.`)
    }
    for (const evidenceRef of spec.evidenceRefs.filter((ref) => ref.startsWith('T8-AUTH-'))) {
      if (!authority.sourceIds.has(evidenceRef)) throw new Error(`DPL-T8 ${spec.blockerId} references unknown authority source ${evidenceRef}.`)
    }
    const payload = {
      blockerId: spec.blockerId,
      owner: blocker.owner as T8Owner,
      ownerEntryId: blocker.ownerEntryId,
      disposition: spec.disposition,
      evidenceClass: spec.evidenceClass ?? null,
      authorityClass: spec.authorityClass ?? null,
      reason: spec.reason,
      evidenceRefs: canonicalStrings(spec.evidenceRefs),
      sharedDependencyIds: canonicalStrings(spec.sharedDependencyIds ?? [])
    }
    return { ...payload, fingerprint: sha256DplSemanticFingerprint(payload) }
  }).sort((a, b) => compareDplIdentityStrings(a.blockerId, b.blockerId))

  const countsByDisposition = counts(dplT8Dispositions, records.map((record) => record.disposition))
  const survivingEvidenceClasses = canonicalStrings(
    records.flatMap((record) => record.evidenceClass ? [record.evidenceClass] : [])
  )
  const survivingAuthorityClasses = canonicalStrings(
    records.flatMap((record) => record.authorityClass ? [record.authorityClass] : [])
  )
  const dueNowUnresolvedBlockerIds = records
    .filter((record) => record.disposition === 'SURVIVES_DUE_NOW_EXTERNAL_EVIDENCE' || record.disposition === 'UNRESOLVED_AUTHORITY')
    .map((record) => record.blockerId)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const futureDueBlockerIds = records
    .filter((record) => record.disposition === 'RECLASSIFIED_FUTURE_DUE')
    .map((record) => record.blockerId)
    .sort((a, b) => compareDplIdentityStrings(a, b))
  const resolvedBlockerIds = records
    .filter((record) => record.disposition === 'RESOLVED_EXISTING_AUTHORITY')
    .map((record) => record.blockerId)
    .sort((a, b) => compareDplIdentityStrings(a, b))

  const sideSpaceScreening = {
    policyId: 'BROM-P8-SIDE-SPACE' as const,
    policyNumericFloorM,
    candidateStoreys: 2 as const,
    westSideIndicativeMinimumClearanceM,
    eastSideIndicativeMinimumClearanceM,
    bothIndicativeSidesBelowNumericFloor: true as const,
    legalOrMeasuredBoundaryConclusion: 'NOT_ADMITTED' as const
  }
  const proofBoundary = {
    compatibleAtScreening: 'NOT_ADMITTED' as const,
    incompatible: 'NOT_ADMITTED' as const,
    routeExhaustion: 'NOT_IMPLEMENTED' as const,
    referenceHouseMutation: 'NO' as const,
    evidenceCommissioned: 'NO' as const,
    legalBoundaryDetermined: 'NO' as const,
    planningDetermination: 'NO' as const,
    dpl16: 'HELD' as const
  }
  const resultPayload = {
    schemaVersion: DPL_T8_SCHEMA_VERSION,
    t7ResultFingerprint: DPL_T8_EXPECTED_T7_RESULT_FINGERPRINT,
    controlId: t7.controlId,
    candidateId: t7.candidateId,
    authorityEvidenceFingerprint: authority.fingerprint,
    candidateFingerprint: sha256DplSemanticFingerprint(candidate),
    analysisGeometryFingerprint: sha256DplSemanticFingerprint(analysis),
    inputBlockerCount: records.length,
    records,
    countsByDisposition,
    sideSpaceScreening,
    survivingEvidenceClasses,
    survivingAuthorityClasses,
    dueNowUnresolvedBlockerIds,
    futureDueBlockerIds,
    resolvedBlockerIds,
    result: 'SUBSTANTIVE_FRONTIER_CLASSIFIED_MINIMUM_EVIDENCE_DEFINED' as const,
    proofBoundary
  }

  return {
    ...resultPayload,
    inputBlockerCount: 10,
    resultFingerprint: sha256DplSemanticFingerprint(resultPayload)
  }
}
