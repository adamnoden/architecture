import assert from 'node:assert/strict'
import test from 'node:test'
import { compileCanonicalReferenceSiteCase } from './canonical.js'
import {
  composeScreeningCoverageReadiness,
  type ScreeningCoverageReadinessResult
} from './coverage-readiness.js'
import {
  DPL13D_LOCAL_TARGET_ID,
  composeDPL13DSecondFixture,
  loadDPL13DReferenceSiteManifest,
  rebindScreeningCoverageReadinessToSyntheticContext
} from './dpl13d.js'
import {
  buildScreeningAggregationRecords,
  composeScreeningSubstantiveAggregation,
  type ScreeningAggregationRecord
} from './substantive-aggregation.js'

const asReadiness = (value: ReturnType<typeof composeDPL13DSecondFixture>['readiness']): ScreeningCoverageReadinessResult =>
  value as unknown as ScreeningCoverageReadinessResult

const withoutRecordIdentity = (
  records: ReturnType<typeof composeScreeningSubstantiveAggregation>['aggregationRecords']
): ScreeningAggregationRecord[] => records.map(({ recordFingerprint: _fingerprint, ...record }) => record)

test('DPL-13D rebinding reproduces canonical RS-01 coverage semantics before changing context', () => {
  const baseline = composeScreeningCoverageReadiness()
  const site = compileCanonicalReferenceSiteCase().site.manifest
  const rebound = rebindScreeningCoverageReadinessToSyntheticContext(
    site,
    { state: 'NO_REAL_BOROUGH_ASSIGNED', targetIds: [] },
    baseline
  )

  assert.deepEqual(rebound.normalizedCoverage, baseline.normalizedCoverage)
  assert.deepEqual(rebound.dispositionCounts, baseline.dispositionCounts)
  assert.deepEqual(rebound.uncoveredClaimIds, baseline.uncoveredClaimIds)
  assert.deepEqual(rebound.claimOwnership, baseline.claimOwnership)
})

test('DPL-13D creates a deterministic identity-distinct RS-02 case with exact Croydon parent composition', () => {
  const first = composeDPL13DSecondFixture()
  const second = composeDPL13DSecondFixture()
  const baseline = compileCanonicalReferenceSiteCase()

  assert.equal(first.site.siteId, 'DPL-RS-02')
  assert.equal(first.site.manifestId, 'DPL-RS-02-SM-v0.1')
  assert.equal(first.identityFingerprint, second.identityFingerprint)
  assert.equal(first.canonicalCase.canonicalCaseIdentity.fingerprint, second.canonicalCase.canonicalCaseIdentity.fingerprint)
  assert.notEqual(first.canonicalCase.site.fingerprint, baseline.site.fingerprint)
  assert.notEqual(first.canonicalCase.authoredCandidate.fingerprint, baseline.authoredCandidate.fingerprint)
  assert.notEqual(first.canonicalCase.canonicalCaseIdentity.fingerprint, baseline.canonicalCaseIdentity.fingerprint)
  assert.equal(
    first.canonicalCase.canonicalCaseIdentity.manifest.localBoroughTarget as unknown as string,
    DPL13D_LOCAL_TARGET_ID
  )
  assert.ok(first.canonicalCase.deploymentLedger.caseIdentity.manifest.targets.some((target) =>
    target.targetId === DPL13D_LOCAL_TARGET_ID
  ))
  const croydonEdge = first.readiness.planningAuthorityGraph.localEdges.find((edge) => edge.localTargetId === DPL13D_LOCAL_TARGET_ID)
  assert.ok(croydonEdge)
  assert.equal(croydonEdge?.borough, 'Croydon')
  assert.equal(croydonEdge?.strategicTargetId, first.readiness.planningAuthorityGraph.strategicTargetId)
})

test('DPL-13D changes local planning classification without making local policy pass', () => {
  const fixture = composeDPL13DSecondFixture()
  const quantitative = fixture.readiness.normalizedCoverage.find((entry) =>
    entry.ownerEntryId === 'DPL10-COV-LOCAL-QUANTITATIVE-POLICY'
  )
  const qualitative = fixture.readiness.normalizedCoverage.find((entry) =>
    entry.ownerEntryId === 'DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY'
  )

  assert.equal(fixture.readiness.site.localPlanningTargetState, 'CONTROLLED_BOROUGH_ASSIGNED')
  assert.deepEqual(fixture.readiness.site.localPlanningTargetIds, [DPL13D_LOCAL_TARGET_ID])
  assert.equal(quantitative?.normalizedDisposition, 'DUE_NOW_REPRESENTED')
  assert.equal(qualitative?.normalizedDisposition, 'DUE_NOW_REPRESENTED')
  assert.ok(fixture.changedClassificationKeys.includes('PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY'))
  assert.ok(fixture.changedClassificationKeys.includes('PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY'))

  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness: asReadiness(fixture.readiness)
  })
  for (const id of ['DPL10-COV-LOCAL-QUANTITATIVE-POLICY', 'DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY']) {
    const record = aggregation.aggregationRecords.find((entry) => entry.ownerEntryId === id)
    assert.ok(record)
    assert.equal(record?.sourceKind, 'OWNER_EVIDENCE_REQUIRED')
    assert.equal(record?.aggregationState, 'SUBSTANTIVE_UNRESOLVED')
  }
})

test('DPL-13D preserves opaque acceleration reviews when synthetic claim values become authored', () => {
  const baseline = composeScreeningCoverageReadiness()
  const fixture = composeDPL13DSecondFixture()
  const heritageReview = 'DPL10-COV-HERITAGE-DESIGNATION-SETTING::ACCELERATION_REVIEW'
  const noiseReview = 'DPL10-COV-AIR-QUALITY-NOISE-AGENT-OF-CHANGE::ACCELERATION_REVIEW'

  assert.ok(baseline.normalizedCoverage.some((entry) => entry.ownerEntryId === heritageReview))
  assert.ok(baseline.normalizedCoverage.some((entry) => entry.ownerEntryId === noiseReview))
  assert.ok(fixture.readiness.normalizedCoverage.some((entry) => entry.ownerEntryId === heritageReview))
  assert.ok(fixture.readiness.normalizedCoverage.some((entry) => entry.ownerEntryId === noiseReview))
  assert.equal(
    fixture.readiness.dispositionCounts.ACCELERATION_REVIEW_REQUIRED,
    baseline.dispositionCounts.ACCELERATION_REVIEW_REQUIRED
  )
})

test('DPL-13D authored adverse planning facts cannot suppress opaque acceleration reviews', () => {
  const site = loadDPL13DReferenceSiteManifest()
  const adverseSite = {
    ...site,
    claims: site.claims.map((claim) => {
      if (claim.id === 'RS-HERITAGE-01') {
        return {
          ...claim,
          state: 'AUTHORED' as const,
          basis: 'DERIVED_SITE_CLAIM' as const,
          basisDetail: 'test-only adverse synthetic heritage condition',
          value: { listedBuildingOnParcel: 'PRESENT_IN_SYNTHETIC_SCENARIO' }
        }
      }
      if (claim.id === 'RS-NOISE-01') {
        return {
          ...claim,
          state: 'AUTHORED' as const,
          basis: 'DERIVED_SITE_CLAIM' as const,
          basisDetail: 'test-only adverse synthetic acoustic condition',
          value: { severeNoiseFlag: true, sensitiveReceptorFlag: true }
        }
      }
      return claim
    })
  }
  const rebound = rebindScreeningCoverageReadinessToSyntheticContext(adverseSite, {
    state: 'CONTROLLED_BOROUGH_ASSIGNED',
    targetIds: [DPL13D_LOCAL_TARGET_ID]
  })

  assert.ok(rebound.normalizedCoverage.some((entry) =>
    entry.ownerEntryId === 'DPL10-COV-HERITAGE-DESIGNATION-SETTING::ACCELERATION_REVIEW'
  ))
  assert.ok(rebound.normalizedCoverage.some((entry) =>
    entry.ownerEntryId === 'DPL10-COV-AIR-QUALITY-NOISE-AGENT-OF-CHANGE::ACCELERATION_REVIEW'
  ))
})

test('DPL-13D uses the same DPL-13C aggregator and remains UNRESOLVED-only', () => {
  const fixture = composeDPL13DSecondFixture()
  const readiness = asReadiness(fixture.readiness)
  const result = composeScreeningSubstantiveAggregation({ canonicalCase: fixture.canonicalCase, readiness })
  const baseline = composeScreeningSubstantiveAggregation()

  assert.deepEqual(result.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(result.canonicalCase.localBoroughTarget, DPL13D_LOCAL_TARGET_ID)
  assert.equal(result.proofBoundary.localBoroughTarget, DPL13D_LOCAL_TARGET_ID)
  assert.equal(result.proofBoundary.compatibleAtScreening, 'NOT_ADMITTED')
  assert.equal(result.proofBoundary.incompatible, 'NOT_ADMITTED')
  assert.equal(result.proofBoundary.routeExhaustion, 'NOT_IMPLEMENTED')
  assert.notEqual(result.identityFingerprint, baseline.identityFingerprint)
  assert.notEqual(result.resultFingerprint, baseline.resultFingerprint)
  assert.ok(result.blockerCounts.dueClassificationUnresolved < baseline.blockerCounts.dueClassificationUnresolved)
})

test('DPL-13D preserves blocker completeness and ordering-neutral aggregation identity', () => {
  const fixture = composeDPL13DSecondFixture()
  const readiness = asReadiness(fixture.readiness)
  const records = buildScreeningAggregationRecords(fixture.canonicalCase, readiness)
  const first = composeScreeningSubstantiveAggregation({ canonicalCase: fixture.canonicalCase, readiness, records })
  const reversed = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness,
    records: [...records].reverse()
  })

  assert.equal(first.identityFingerprint, reversed.identityFingerprint)
  assert.equal(first.resultFingerprint, reversed.resultFingerprint)

  const represented = first.aggregationRecords.map((record) => `${record.owner}:${record.ownerEntryId}`)
  assert.equal(new Set(represented).size, represented.length)
})

test('DPL-13D refuses mismatched local-target identity rather than inferring a borough', () => {
  const fixture = composeDPL13DSecondFixture()
  const badReadiness = {
    ...fixture.readiness,
    site: {
      ...fixture.readiness.site,
      localPlanningTargetIds: ['BROMLEY-LOCAL-PLANNING-2019-2026-10-22']
    }
  }

  assert.throws(
    () => composeScreeningSubstantiveAggregation({
      canonicalCase: fixture.canonicalCase,
      readiness: badReadiness as unknown as ScreeningCoverageReadinessResult
    }),
    /local target to match/
  )
})

test('DPL-13D changed synthetic facts remain explicit claims and do not erase unrelated UNKNOWN evidence', () => {
  const site = loadDPL13DReferenceSiteManifest()
  const heritage = site.claims.find((claim) => claim.id === 'RS-HERITAGE-01')
  const noise = site.claims.find((claim) => claim.id === 'RS-NOISE-01')
  const ground = site.claims.find((claim) => claim.id === 'RS-GROUND-01')
  const title = site.claims.find((claim) => claim.id === 'RS-TITLE-DETAIL-01')
  const flood = site.claims.find((claim) => claim.id === 'RS-FLOOD-01')

  assert.equal(heritage?.state, 'AUTHORED')
  assert.equal(heritage?.basis, 'DERIVED_SITE_CLAIM')
  assert.equal(noise?.state, 'AUTHORED')
  assert.equal(noise?.basis, 'DERIVED_SITE_CLAIM')
  assert.equal(ground?.state, 'UNKNOWN')
  assert.equal(title?.state, 'UNKNOWN')
  assert.equal(flood?.state, 'UNKNOWN')
})

test('DPL-13D material site/readiness changes invalidate identities', () => {
  const fixture = composeDPL13DSecondFixture()
  const site = loadDPL13DReferenceSiteManifest()
  const changedSite = {
    ...site,
    claims: site.claims.map((claim) => claim.id === 'RS-ECO-01'
      ? {
          ...claim,
          state: 'AUTHORED' as const,
          basis: 'DERIVED_SITE_CLAIM' as const,
          basisDetail: 'test-only synthetic classification change',
          value: { syntheticHabitatFlag: false }
        }
      : claim)
  }
  const changedReadiness = rebindScreeningCoverageReadinessToSyntheticContext(changedSite, {
    state: 'CONTROLLED_BOROUGH_ASSIGNED',
    targetIds: [DPL13D_LOCAL_TARGET_ID]
  })

  assert.notEqual(changedReadiness.site.manifestFingerprint, fixture.readiness.site.manifestFingerprint)
  assert.notEqual(changedReadiness.identityFingerprint, fixture.readiness.identityFingerprint)
  assert.notEqual(changedReadiness.resultFingerprint, fixture.readiness.resultFingerprint)
})

test('DPL-13D all-positive override still cannot emit COMPATIBLE', () => {
  const fixture = composeDPL13DSecondFixture()
  const readiness = asReadiness(fixture.readiness)
  const result = composeScreeningSubstantiveAggregation({ canonicalCase: fixture.canonicalCase, readiness })
  const positiveRecords: ScreeningAggregationRecord[] = withoutRecordIdentity(result.aggregationRecords).map(({ blockerClass: _blocker, ...record }) => ({
    ...record,
    sourceResult: 'PASS',
    aggregationState: 'POSITIVE_RESOLVED',
    reason: 'Test-only positive override preserving DPL-13D aggregation scope.'
  }))
  const positive = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness,
    records: positiveRecords
  })

  assert.deepEqual(positive.wholeSiteConclusion, {
    status: 'NOT_ADMITTED',
    reason: 'POSITIVE_CONCLUSION_NOT_ADMITTED'
  })
  assert.equal(positive.proofBoundary.compatibleAtScreening, 'NOT_ADMITTED')
})
