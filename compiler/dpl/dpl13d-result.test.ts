import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { composeScreeningSubstantiveAggregation } from './substantive-aggregation.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'

test('DPL-13D corrected second-fixture result identity is deterministic and ready to refreeze', () => {
  const fixture = composeDPL13DSecondFixture()
  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness: fixture.readiness as unknown as ScreeningCoverageReadinessResult
  })

  const identities = {
    siteFingerprint: fixture.canonicalCase.site.fingerprint,
    candidateFingerprint: fixture.canonicalCase.authoredCandidate.fingerprint,
    canonicalCaseFingerprint: fixture.canonicalCase.canonicalCaseIdentity.fingerprint,
    readinessIdentityFingerprint: fixture.readiness.identityFingerprint,
    readinessResultFingerprint: fixture.readiness.resultFingerprint,
    fixtureIdentityFingerprint: fixture.identityFingerprint,
    aggregationIdentityFingerprint: aggregation.identityFingerprint,
    aggregationResultFingerprint: aggregation.resultFingerprint
  }
  console.log(`DPL13D1_IDENTITIES=${JSON.stringify(identities)}`)

  assert.equal(fixture.site.siteId, 'DPL-RS-02')
  for (const value of Object.values(identities)) assert.match(value, /^[0-9a-f]{64}$/)

  assert.deepEqual(fixture.readiness.dispositionCounts, {
    DUE_NOW_REPRESENTED: 31,
    DUE_NOW_MISSING: 0,
    FUTURE_DUE: 53,
    DUE_CLASSIFICATION_UNRESOLVED: 0,
    NOT_APPLICABLE_PROVED: 1,
    ADVISORY_NON_BLOCKING: 2,
    ACCELERATION_REVIEW_REQUIRED: 17
  })
  assert.deepEqual(fixture.changedClassificationKeys, [
    'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
    'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY'
  ])

  assert.deepEqual(aggregation.blockerCounts, {
    substantiveUnresolved: 27,
    dueClassificationUnresolved: 17,
    substantiveFailure: 0
  })
  assert.deepEqual(aggregation.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(aggregation.canonicalCase.localBoroughTarget, 'CROYDON-LOCAL-PLANNING-2018-2026-10-21')
})
