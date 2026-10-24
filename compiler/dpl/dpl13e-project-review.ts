import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  architecturalReviewClauseIds,
  composeDPL13EArchitecturalReview,
  DPL13E_REVIEW_SCHEMA_VERSION,
  type ArchitecturalReviewLedgerInput,
  type ArchitecturalReviewRecordInput,
  type DPL13EArchitecturalReviewResult
} from './architectural-review.js'
import { loadConformanceCoverageRegistry } from './conformance-coverage.js'
import { composeDPL13DSecondFixture } from './dpl13d.js'

export const DPL13E_PROJECT_REVIEW_ID = 'DPL-13E-RS02-PROJECT-REVIEW-2026-10-24' as const

const EXPECTED_RS02_CANDIDATE_FINGERPRINT =
  'c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81' as const
const EXPECTED_DPL02_AUTHORITY_GIT_BLOB_SHA = 'f231541a98cb5d3a5adb7549ff37b143c6f84260' as const
const EXPECTED_DPL02_COVERAGE_GIT_BLOB_SHA = '983ba9286519a5e7f17334e7364cc149a32274aa' as const

const DPL02_AUTHORITY_PATH = 'project/dpl/dpl-02-reference-house-conformance.md' as const
const DPL02_COVERAGE_PATH = 'project/dpl/coverage/dpl-02-conformance-coverage-v1.json' as const

const gitBlobSha = (path: string): string => {
  const content = readFileSync(resolve(process.cwd(), path))
  return createHash('sha1')
    .update(`blob ${content.byteLength}\0`)
    .update(content)
    .digest('hex')
}

const assertReviewedAuthorityBytes = (): void => {
  const authoritySha = gitBlobSha(DPL02_AUTHORITY_PATH)
  const coverageSha = gitBlobSha(DPL02_COVERAGE_PATH)
  if (authoritySha !== EXPECTED_DPL02_AUTHORITY_GIT_BLOB_SHA) {
    throw new Error('DPL-13E project review refuses changed DPL-02 authority bytes; architectural review is stale.')
  }
  if (coverageSha !== EXPECTED_DPL02_COVERAGE_GIT_BLOB_SHA) {
    throw new Error('DPL-13E project review refuses changed DPL-02 coverage bytes; architectural review is stale.')
  }
}

const pass = (
  clauseId: string,
  reason: string,
  evidenceRefs: readonly string[]
): ArchitecturalReviewRecordInput => ({ clauseId, result: 'PASS', reason, evidenceRefs })

export const dpl13eProjectReviews = (): readonly ArchitecturalReviewRecordInput[] => [
  pass(
    'RH-I01',
    'RS-02 retains the controlled G-01 architectural-language proposition. Its only deployment route is rigid RH-V02 placement/orientation; the ordered front field, ranked entrance, spatial/sectional hierarchy and concentrated articulation already passed the controlled G-01 conformance gate and are not rewritten by the site transform.',
    [
      'docs/reference-house/g01-v0.1-conformance-d12.md',
      'docs/reference-house/plan-section-elevation-gate.md',
      'project/dpl/reference-site/dpl-rs-02-v01.json',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-I03',
    'RS-02 remains the same compact two-storey detached contemporary family-house proposition: 12.0 × 10.8 m outer reservation, central courtyard and four-bedroom active upper programme. The synthetic site placement changes location/orientation only and does not change type, scale posture or programme.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/upper-floor-and-stair-development.md',
      'project/dpl/reference-site/dpl-rs-02-v01.json',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-I04',
    'The principal arrival sequence remains public arrival → principal entrance/stair hall → courtyard address → garden-side room/garden. RS-02 applies the house as one rigid unmirrored transform, so the internal courtyard-centred sequence and the subordinate all-weather technical-flank route remain coupled exactly as selected.',
    [
      'docs/reference-house/ground-floor-development.md',
      'docs/reference-house/plan-section-elevation-gate.md',
      'project/dpl/reference-site/dpl-rs-02-v01.json'
    ]
  ),
  pass(
    'RH-I05',
    'The controlled G1 ground floor and four-bedroom upper floor retain distinct principal, family, service, circulation and private-room identities. No RS-02 route dissolves the plan into an undifferentiated open field or turns technical circulation into the governing domestic order.',
    [
      'docs/reference-house/ground-floor-development.md',
      'docs/reference-house/upper-floor-and-stair-development.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-I06',
    'The technical geography remains concentrated on the selected technical flank: dedicated plant/service suite, bounded vertical service zone, principal wet/service stack and short kitchen/bathroom relationships remain subordinate to principal occupied rooms. RS-02 does not author any service redistribution.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/ground-floor-development.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-I07',
    'Plan, section and elevation remain one coupled architectural order. The selected four-bay front, off-centre ranked entrance, courtyard orders and sectional hierarchy survive as a rigid whole under RH-V02; RS-02 contains no façade-only substitution or independent internal rearrangement.',
    [
      'docs/reference-house/plan-section-elevation-gate.md',
      'docs/reference-house/g01-v0.1-conformance-d12.md',
      'project/dpl/reference-site/dpl-rs-02-v01.json'
    ]
  ),
  pass(
    'RH-PROT-02',
    'The selected G1 ground-floor topology is preserved: drawing/family principal flank, courtyard-addressing entrance/stair hall, compact study, technical-flank gallery and service geography, garden dining hall and rear kitchen remain in their controlled relationships. No deployment-side plan reorder is authored.',
    [
      'docs/reference-house/ground-floor-development.md',
      'project/dpl/dpl-02-reference-house-conformance.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-03',
    'The active four-bedroom upper-floor topology remains unchanged, including the principal/rear bedroom, south landing + technical-flank gallery + north cross-landing U-circulation, no west gallery, stacked family bathroom and dry dressing/linen condition. RS-02 does not reintroduce the deleted remote en-suite or a fifth bedroom.',
    [
      'docs/reference-house/upper-floor-and-stair-development.md',
      'docs/reference-house/structural-coordination.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-05',
    'The H1 sectional hierarchy is unchanged by the horizontal rigid site transform: ground FFL, +2950 mm ground clear ceiling, +3300 mm first FFL, +6000 mm upper clear ceiling and approximately +6250 mm cornice/eaves control retain the selected restrained ground-floor primacy.',
    [
      'docs/reference-house/plan-section-elevation-gate.md',
      'docs/reference-house/structural-coordination.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-07',
    'The differentiated courtyard orders remain intact: south stair/hall address, north garden-dining/cross-landing address, regular technical/gallery-side order and room-owned principal-side order. Rigid orientation changes compass relationship but not these internal architectural relationships.',
    [
      'docs/reference-house/plan-section-elevation-gate.md',
      'docs/reference-house/ground-floor-development.md',
      'docs/reference-house/upper-floor-and-stair-development.md'
    ]
  ),
  pass(
    'RH-PROT-09',
    'RS-02 introduces no envelope or opening-system substitution. The controlled life-separation concept therefore remains: permanent weather/thermal/air boundary independent of removable trim, permanent masonry openings carrying replaceable frames through designed interfaces, and brittle finish kept out of the primary moving-frame interface.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/tectonic-architectural-language.md',
      'project/dpl/dpl-02-reference-house-conformance.md'
    ]
  ),
  pass(
    'RH-PROT-10',
    'The concentrated service topology remains the controlled Reference House topology: technical-flank plant/service suite, one bounded principal vertical service zone, short wet-service relationships, courtyard kept free of principal utility routing and remote principal en-suite deleted. RS-02 authors no competing service route.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/upper-floor-and-stair-development.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-11',
    'The architectural environmental hierarchy is preserved: shallow occupied bands, outer-façade daylight responsibility for principal rooms, disciplined glazing, orientation-specific control, openable purge distinct from whole-house ventilation and no mechanical-cooling rescue strategy. This PASS is architectural only; RS-02 environmental performance remains unproved.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/environmental-coordination.md',
      'project/dpl/reference-site/dpl-rs-02-v01.json'
    ]
  ),
  pass(
    'RH-PROT-12',
    'The selected whole-house system geography remains integrated with the same plant/service territory: central MVHR and air-to-water heat-pump / low-temperature wet heat family remain the current baselines, with no RS-02 equipment-family or distribution substitution authored.',
    [
      'docs/reference-house/structural-coordination.md',
      'docs/reference-house/energy-heat-coordination-rh10.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-13',
    'The roof/water architecture remains unchanged: four very-low-slope roof fields fall outward from the courtyard to inspectable external collection edges; no principal inner-court gutter, internal roof outlet, inward valley or rooftop-plant substitution is introduced by RS-02.',
    [
      'docs/reference-house/structural-coordination.md',
      'project/dpl/dpl-02-reference-house-conformance.md',
      'compiler/dpl/dpl13d.ts'
    ]
  ),
  pass(
    'RH-PROT-15',
    'The selected tectonic posture is preserved. RS-02 authors no finish, joinery or interface replacement: quiet permanent surfaces, sparse duty-earned architectural datums, replaceable frame/trim hierarchy, continuous principal-room floors and technically subordinate visible interfaces remain the controlled Reference House language.',
    [
      'docs/reference-house/tectonic-architectural-language.md',
      'docs/reference-house/structural-coordination.md',
      'compiler/dpl/dpl13d.ts'
    ]
  )
]

export const createDPL13EProjectReviewInput = (): ArchitecturalReviewLedgerInput => {
  assertReviewedAuthorityBytes()
  const fixture = composeDPL13DSecondFixture()
  const coverage = loadConformanceCoverageRegistry()
  const candidate = fixture.canonicalCase.authoredCandidate

  if (candidate.fingerprint !== EXPECTED_RS02_CANDIDATE_FINGERPRINT) {
    throw new Error('DPL-13E project review refuses changed RS-02 candidate identity; architectural review is stale.')
  }

  return {
    schemaVersion: DPL13E_REVIEW_SCHEMA_VERSION,
    id: DPL13E_PROJECT_REVIEW_ID,
    assuranceProfile: 'SCREENING',
    siteId: fixture.site.siteId,
    candidateId: candidate.input.id,
    candidateRevision: candidate.input.revision,
    candidateFingerprint: EXPECTED_RS02_CANDIDATE_FINGERPRINT,
    referenceHouseSourceFingerprint: candidate.input.referenceHouseSourceFingerprint,
    dpl02CoverageFingerprint: coverage.fingerprint,
    dpl02AuthorityFingerprint: coverage.authorityFingerprint,
    reviewer: {
      identity: 'PROJECT_AUTHOR_DELEGATED_ARCHITECTURE_AGENT',
      role: 'PROJECT_AUTHOR_DELEGATE_ARCHITECTURAL_REVIEW',
      authorityBasis: 'Project author instructed the Architecture agent to proceed through DPL packets on 2026-10-24. This is delegated project architectural authority only; it is not independent professional, statutory or planning evidence.',
      authoredAt: '2026-10-24'
    },
    reviewScopeClauseIds: architecturalReviewClauseIds(),
    reviews: dpl13eProjectReviews()
  }
}

export const composeDPL13EProjectReview = (): DPL13EArchitecturalReviewResult =>
  composeDPL13EArchitecturalReview(createDPL13EProjectReviewInput())
