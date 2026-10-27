import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { classifySamples, composeExploration, explorationResultPath, readExplorationInput,
  testPlacement, validateExploration } from './exploration.js'

test('exploratory results reproduce the retained report, independently of object key order', () => {
  const result = composeExploration()
  assert.deepEqual(result, JSON.parse(readFileSync(explorationResultPath, 'utf8')))
  const input = readExplorationInput()
  const reordered = Object.fromEntries(Object.entries(input).reverse()) as unknown as typeof input
  assert.equal(composeExploration(reordered).resultFingerprint, result.resultFingerprint)
})

test('assumptions cannot discharge professional evidence, readiness or unsupported local targets', () => {
  const r = composeExploration()
  assert.equal(r.proofBoundary.verifiedReadyCorpusSites, 0)
  for (const t of r.trials) {
    assert.equal(t.wholeSiteConclusion, 'NOT_ESTABLISHED')
    assert.equal(t.verifiedCandidateReadiness, 'UNCHANGED_NOT_READY')
    assert.ok(t.evidenceBackedRuntime.openConformanceClauses.length > 0)
    assert.ok(t.evidenceBackedRuntime.unresolvedInputs.length > 0)
    for (const obligation of t.evidenceBackedRuntime.obligations) {
      if (obligation.methodKind.startsWith('EXTERNAL_')) {
        assert.notEqual(obligation.result, 'PASS')
        assert.notEqual(obligation.result, 'EXTERNALLY_DISCHARGED')
      }
    }
  }
  assert.equal(r.trials.find(t => t.siteId === 'DPL-RP-004')?.evidenceBackedRuntime.localBoroughTarget, 'UNSUPPORTED_LOCAL_TARGET')
  const input = readExplorationInput()
  const baseline = composeExploration(input)
  const changed = { ...input, trials: input.trials.map((t, i) => i === 3 ?
    { ...t, widthM: { ...t.widthM, samples: [12, 18, 22] as const } } : t) }
  const altered = composeExploration(changed)
  assert.notEqual(altered.resultFingerprint, baseline.resultFingerprint)
  assert.equal(altered.trials[3].evidenceBackedRuntime.fingerprint, baseline.trials[3].evidenceBackedRuntime.fingerprint)
})

test('rejects missing provenance, false authority, NaN, impossible slopes and corpus substitution', () => {
  const input = readExplorationInput()
  const invalid = (mutate: (x: any) => void) => {
    const changed = structuredClone(input); mutate(changed)
    assert.throws(() => validateExploration(changed))
  }
  invalid(x => { x.authority = 'VERIFIED' })
  invalid(x => { x.trials[0].widthM.basis = '' })
  invalid(x => { x.trials[0].widthM.samples[1] = NaN })
  invalid(x => { x.trials[0].slopeDeg.samples[2] = 90 })
  invalid(x => { x.trials[0].siteId = 'DPL-RP-004' })
  invalid(x => { x.trials[0].unresolved = [] })
  invalid(x => { x.projectCriteria.illustrativeApproachMaxGradient = 0 })
})

test('containment checks the complete rigid rotated rectangle without reauthoring it', () => {
  const t = structuredClone(readExplorationInput().trials[3])
  assert.equal(testPlacement(t, 12, 16, 12, 10.8, 1, 3).contained, true)
  assert.equal(testPlacement(t, 11.99, 16, 12, 10.8, 1, 3).contained, false)
  assert.equal(testPlacement(t, 14, 19, 12, 10.8, 1, 3).workingSpace, true)
  assert.equal(testPlacement(t, 13.99, 19, 12, 10.8, 1, 3).workingSpace, false)
  const offset = { ...t, fixedPlacement: { ...t.fixedPlacement, centreXM: 1 } }
  assert.equal(testPlacement(offset, 12, 16, 12, 10.8, 1, 3).contained, false)
  const rotated = { ...t, fixedPlacement: { ...t.fixedPlacement, rotationDeg: 90, centreXM: 5.4, frontYM: 6 } }
  assert.equal(testPlacement(rotated, 10.8, 12, 12, 10.8, 0, 0).contained, true)
  assert.equal(testPlacement(rotated, 10.79, 12, 12, 10.8, 0, 0).contained, false)
})

test('sensitivity exposes the small-area, access, slope and direct-approach consequences', () => {
  const r = composeExploration()
  const small = r.trials.find(t => t.siteId === 'DPL-RP-008')!
  assert.equal(small.geometry.result, 'FAILS_AT_ALL_TESTED_SAMPLES')
  assert.ok(small.conditionalResponses.areaAnchorWouldNeedIncreasePercentForBareFootprint! > 33)
  const ordinary = r.trials.find(t => t.siteId === 'DPL-RP-004')!
  assert.equal(ordinary.conditionalResponses.widthRequiredWithChosenSideWorkingSpaceM, 14)
  assert.equal(ordinary.conditionalResponses.depthRequiredWithChosenRearWorkingSpaceM, 19)
  assert.ok(Math.abs(ordinary.conditionalResponses.approachLengthAtNominalRiseM - 6) < 1e-9)
  assert.equal(ordinary.approachSamples[1].meetsIllustrativeProjectGradient, false)
  assert.equal(r.trials[0].accessSamples.some(s => s.meetsIllustrativeLogisticsWidth), false)
  assert.ok(r.trials[6].datumSamples[2].groundChangeAcrossHouseM > 2.8)
  assert.deepEqual(r.lennardFixedPlacementSensitivity.inwardBoundaryOffsetsM.map(s => s.containedUnderUniformInwardOffset), [true, true, true, false])
  assert.throws(() => classifySamples([]))
})

// The final case is separately authored after the original sensitivity experiment.
// It must not rewrite that experiment or turn external premises into evidence.
test('final conditional case resolves approach length by moving the house, without changing it', () => {
  const c = JSON.parse(readFileSync('project/dpl/exploration/conditional-case.json', 'utf8'))
  const trial = { ...readExplorationInput().trials[3], fixedPlacement: c.fixedPlacement }
  const fit = testPlacement(trial, c.parcel.widthM, c.parcel.depthM, 12, 10.8, 1, 3)
  assert.equal(fit.contained, true)
  assert.equal(fit.workingSpace, true)
  assert.ok(Math.abs(fit.clearancesM.left - 2.7) < 1e-9)
  assert.ok(Math.abs(fit.clearancesM.rear - 10.2) < 1e-9)
  const a = c.approach
  assert.equal(a.bottomLandingLengthM + a.slopingLengthM + a.topLandingLengthM, c.fixedPlacement.frontYM)
  assert.ok(a.riseM / a.slopingLengthM <= a.illustrativeMaxGradient)
  assert.equal(a.riseM, c.fixedPlacement.fflAboveFrontGroundM)
  assert.equal(c.referenceHouseMutation, false)
  assert.equal(readExplorationInput().trials[3].fixedPlacement.frontYM, 5.2)
})

test('conditional closeout retains all non-geometric adequacy as assumptions, never verified results', () => {
  const c = JSON.parse(readFileSync('project/dpl/exploration/conditional-case.json', 'utf8'))
  assert.equal(c.authority, 'CONDITIONAL_DESIGN_STUDY')
  assert.equal(c.siteKind, 'SYNTHETIC_ORDINARY_STREET_FRONT')
  assert.equal(c.verifiedReadiness, 'UNCHANGED_0_OF_8')
  assert.deepEqual(c.premises.map((p: any) => p.id), ['SPATIAL', 'CONTROL_RIGHTS', 'SUPPORT_GROUND',
    'WATER_ENVIRONMENT', 'DRAINAGE_UTILITIES', 'CONTEXT_PLANNING', 'ACCESS_LOGISTICS', 'TECHNICAL_COMPLETION'])
  assert.ok(c.premises.every((p: any) => p.state === 'ASSUMED' && p.proposition.length && p.replacement.length))
  assert.equal(composeExploration().proofBoundary.verifiedReadyCorpusSites, 0)
})
