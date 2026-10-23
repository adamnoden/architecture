import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { composeScreeningSubstantiveAggregation } from './substantive-aggregation.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'

test('DPL-13D exact second-fixture result identity is frozen', () => {
  const fixture = composeDPL13DSecondFixture()
  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness: fixture.readiness as unknown as ScreeningCoverageReadinessResult
  })

  assert.equal(fixture.site.siteId, 'DPL-RS-02')
  assert.equal(fixture.canonicalCase.site.fingerprint, 'c1bc2e7fe0fc5778cda25de81ea0e4f0161962a59d5de80d6bea28d2df33e142')
  assert.equal(fixture.canonicalCase.authoredCandidate.fingerprint, 'c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81')
  assert.equal(fixture.canonicalCase.canonicalCaseIdentity.fingerprint, '52f27afbfd64e44bcdda3b7c7a5d2529e7cf10b0e91f9f33daa74ac4ad131c42')
  assert.equal(fixture.readiness.identityFingerprint, '8d5187137d0f48e0ea43fa1860db761c6c001f64b4e4ffecf2392581373a80ab')
  assert.equal(fixture.readiness.resultFingerprint, '4f384e6ae0eebd1e921bc58242cf452d34be96c6b80520be899341bdeab33dd2')
  assert.equal(fixture.identityFingerprint, '42ea515948f17d5fdc4838a7c1cb13109a9139515baf62a8271271e7c8ee9d9d')

  assert.deepEqual(fixture.readiness.dispositionCounts, {
    DUE_NOW_REPRESENTED: 31,
    DUE_NOW_MISSING: 0,
    FUTURE_DUE: 53,
    DUE_CLASSIFICATION_UNRESOLVED: 0,
    NOT_APPLICABLE_PROVED: 1,
    ADVISORY_NON_BLOCKING: 2,
    ACCELERATION_REVIEW_REQUIRED: 15
  })
  assert.deepEqual(fixture.changedClassificationKeys, [
    'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY',
    'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY'
  ])

  assert.deepEqual(aggregation.blockerCounts, {
    substantiveUnresolved: 27,
    dueClassificationUnresolved: 15,
    substantiveFailure: 0
  })
  assert.equal(aggregation.identityFingerprint, '4a3915fc927ed4c7450619ced3c9378994f38a7436b6ba5a78fa6633f7dfd195')
  assert.equal(aggregation.resultFingerprint, '880385d2b230dbc3de14e93088d7b700259b09318d599579523389ef2faa7eff')
  assert.deepEqual(aggregation.wholeSiteConclusion, {
    status: 'EMITTED',
    result: 'UNRESOLVED',
    assuranceProfile: 'SCREENING',
    display: 'UNRESOLVED @ SCREENING'
  })
  assert.equal(aggregation.canonicalCase.localBoroughTarget, 'CROYDON-LOCAL-PLANNING-2018-2026-10-21')
})