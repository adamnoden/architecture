import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { composeScreeningSubstantiveAggregation } from './substantive-aggregation.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'

test('DPL-13D exact post-authority result probe', () => {
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
  assert.fail(`DPL13D_POST_AUTHORITY_RESULT ${JSON.stringify(summary)}`)
})