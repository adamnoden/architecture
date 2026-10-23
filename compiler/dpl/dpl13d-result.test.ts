import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { composeScreeningSubstantiveAggregation } from './substantive-aggregation.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'

test('DPL-13D executable result record', () => {
  const fixture = composeDPL13DSecondFixture()
  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness: fixture.readiness as unknown as ScreeningCoverageReadinessResult
  })
  const summary = {
    siteId: fixture.site.siteId,
    siteManifestFingerprint: fixture.canonicalCase.site.fingerprint,
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    canonicalCaseFingerprint: fixture.canonicalCase.canonicalCaseIdentity.fingerprint,
    readinessIdentityFingerprint: fixture.readiness.identityFingerprint,
    readinessResultFingerprint: fixture.readiness.resultFingerprint,
    fixtureIdentityFingerprint: fixture.identityFingerprint,
    dispositionCounts: fixture.readiness.dispositionCounts,
    changedClassificationKeys: fixture.changedClassificationKeys,
    blockerCounts: aggregation.blockerCounts,
    aggregationIdentityFingerprint: aggregation.identityFingerprint,
    aggregationResultFingerprint: aggregation.resultFingerprint,
    wholeSiteConclusion: aggregation.wholeSiteConclusion,
    localBoroughTarget: aggregation.canonicalCase.localBoroughTarget
  }
  console.log(`DPL13D_RESULT ${JSON.stringify(summary)}`)
  assert.equal(summary.siteId, 'DPL-RS-02')
  assert.equal(summary.wholeSiteConclusion.status, 'EMITTED')
  assert.equal(summary.localBoroughTarget, 'CROYDON-LOCAL-PLANNING-2018-2026-10-21')
})