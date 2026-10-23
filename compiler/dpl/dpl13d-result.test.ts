import assert from 'node:assert/strict'
import test from 'node:test'
import { composeDPL13DSecondFixture } from './dpl13d.js'
import { composeScreeningSubstantiveAggregation } from './substantive-aggregation.js'
import type { ScreeningCoverageReadinessResult } from './coverage-readiness.js'

test('DPL-13D corrected second-fixture result identity is frozen and deterministic', () => {
  const fixture = composeDPL13DSecondFixture()
  const aggregation = composeScreeningSubstantiveAggregation({
    canonicalCase: fixture.canonicalCase,
    readiness: fixture.readiness as unknown as ScreeningCoverageReadinessResult
  })

  assert.equal(
    fixture.canonicalCase.site.fingerprint,
    'c1bc2e7fe0fc5778cda25de81ea0e4f0161962a59d5de80d6bea28d2df33e142'
  )
  assert.equal(
    fixture.canonicalCase.authoredCandidate.fingerprint,
    'c0b4618cb8203e4dfddcf7e7ef852fa6c92e905fcd8e3a7e5322154e11903d81'
  )
  assert.equal(
    fixture.canonicalCase.canonicalCaseIdentity.fingerprint,
    '0ee4d52ed66097ff735fee2d505ce6dbcc0ca5fac254dd9ea4308c7a90c04ecf'
  )
  assert.equal(
    fixture.readiness.identityFingerprint,
    'dae53dae431d77dfa6e2ebfed467fce85cb9e01bebf062b0c6c0456b6210310e'
  )
  assert.equal(
    fixture.readiness.resultFingerprint,
    '56b71e2afedef764dbec3499cf9f8d9882438716b3ac9535468a3cb8d8a6e318'
  )
  assert.equal(
    fixture.identityFingerprint,
    '95400f494615a5df0258de9a295edf75d340456a6bc8243bb482d1cb510ab514'
  )
  assert.equal(
    aggregation.identityFingerprint,
    'b9bb76178f4968818f3d6ad1ee51d5688d3c311608eedbc06468773ef752d590'
  )
  assert.equal(
    aggregation.resultFingerprint,
    'b18c45da18469164a4360357859f9762bc26136fa47c774fd03074f2a7742312'
  )

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
