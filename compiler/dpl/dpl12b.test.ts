import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { compileDeploymentCase } from './compile.js'
import { loadB2InterfaceContracts, loadB2TargetComposition, loadPilotSite } from './load.js'
import type {
  CandidateConformanceFinding,
  DeploymentCandidateInput,
  DeploymentCaseInput,
  DeploymentLedger
} from './model.js'

const referenceSource = createReferenceHouseSource()
const currentReferenceFingerprint = referenceHouseSourceFingerprint(referenceSource)

const canonicalCandidate = (): DeploymentCandidateInput => ({
  id: 'DPL-CAND-RS01-01',
  revision: '1',
  authoredSource: {
    id: 'synthetic-authored-candidate-fixture',
    revision: '1'
  },
  referenceHouseSourceFingerprint: currentReferenceFingerprint,
  facts: {
    courtyardOpenToSky: true,
    shellWidthMm: Number(referenceSource.shell.width.value),
    shellDepthMm: Number(referenceSource.shell.depth.value),
    courtyardWidthMm: Number(referenceSource.court.value.width),
    courtyardDepthMm: Number(referenceSource.court.value.depth),
    courtyardPlacement: referenceSource.court.value.placement,
    storeys: 2,
    stairRiserCount: referenceSource.stair.riseTopology.value.riserCount,
    stairFlightRiseGroups: [...referenceSource.stair.riseTopology.value.flightRiseGroups],
    stairGoingMm: Number(referenceSource.stair.goingTopology.value.going),
    frontBayCount: referenceSource.frontField.value.count,
    frontBaySpacingMm: Number(referenceSource.frontField.value.spacing),
    entranceBayIndex: referenceSource.entranceBay.value.bayIndex
  }
})

const baseInput = (candidate: DeploymentCandidateInput = canonicalCandidate()): DeploymentCaseInput => ({
  assuranceProfile: 'SCREENING',
  site: loadPilotSite('DPL-RP-003'),
  interfaceContracts: loadB2InterfaceContracts(),
  targets: loadB2TargetComposition(),
  candidate
})

const candidateFinding = (ledger: DeploymentLedger, id: string): CandidateConformanceFinding => {
  assert.ok(ledger.candidateConformance, 'Expected candidate conformance evaluation')
  const item = ledger.candidateConformance.findings.find((candidate) => candidate.clauseId === id)
  assert.ok(item, `Expected conformance finding ${id}`)
  return item
}

describe('DPL-12B authored candidate and Reference House conformance orchestration', () => {
  test('evaluates bounded controlled candidate facts without manufacturing whole-site compatibility', () => {
    const first = compileDeploymentCase(baseInput())
    const second = compileDeploymentCase(baseInput())

    assert.ok(first.candidateConformance)
    assert.equal(first.candidateConformance.referenceRevisionMatches, true)
    assert.equal(first.candidateConformance.candidate.id, 'DPL-CAND-RS01-01')
    assert.equal(first.candidateConformance.candidate.fingerprint, second.candidateConformance?.candidate.fingerprint)
    assert.equal(first.caseIdentity.fingerprint, second.caseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, second.resultFingerprint)

    assert.equal(candidateFinding(first, 'RH-I02').result, 'CONFORMS')
    assert.equal(candidateFinding(first, 'RH-PROT-01').result, 'CONFORMS')
    assert.equal(candidateFinding(first, 'RH-PROT-04').result, 'CONFORMS')
    assert.equal(candidateFinding(first, 'RH-PROT-06').result, 'CONFORMS')

    const unmodelled = candidateFinding(first, 'RH-PROT-10')
    assert.equal(unmodelled.result, 'OPEN')
    assert.equal(unmodelled.checkKind, 'EXTERNAL_OR_UNMODELLED')
    assert.ok(first.unresolvedInputs.includes('candidateConformance.RH-PROT-10'))

    assert.deepEqual(first.proofBoundary, {
      wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED',
      architecturalCandidateSelection: 'NOT_IMPLEMENTED',
      routeExhaustion: 'NOT_IMPLEMENTED'
    })
    assert.equal(Object.prototype.hasOwnProperty.call(first, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(first, 'deploymentConclusion'), false)
  })

  test('admits the explicit whole-house mirror route and checks its mirror-equivalent front entrance', () => {
    const candidate = canonicalCandidate()
    const mirrored: DeploymentCandidateInput = {
      ...candidate,
      revision: 'mirror-1',
      variantSelections: ['RH-V01'],
      facts: {
        ...candidate.facts,
        entranceBayIndex: 2
      }
    }

    const result = compileDeploymentCase(baseInput(mirrored))

    const mirror = candidateFinding(result, 'RH-V01')
    assert.equal(mirror.conformanceClass, 'PERMITTED_DISCRETE_VARIANT')
    assert.equal(mirror.result, 'CONFORMS')
    assert.equal(candidateFinding(result, 'RH-PROT-06').result, 'CONFORMS')
  })

  test('requires an explicit Reference House revision when protected shell geometry changes', () => {
    const candidate = canonicalCandidate()
    const narrowed: DeploymentCandidateInput = {
      ...candidate,
      revision: 'narrow-shell',
      facts: {
        ...candidate.facts,
        shellWidthMm: 11700
      }
    }

    const result = compileDeploymentCase(baseInput(narrowed))
    const morphology = candidateFinding(result, 'RH-PROT-01')

    assert.equal(morphology.result, 'REQUIRES_REFERENCE_HOUSE_REVISION')
    assert.match(morphology.reason, /protected gross morphology/i)
    assert.equal(result.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
  })

  test('marks loss of the open-to-sky courtyard identity invariant as non-conforming', () => {
    const candidate = canonicalCandidate()
    const roofedCourt: DeploymentCandidateInput = {
      ...candidate,
      revision: 'roofed-court',
      facts: {
        ...candidate.facts,
        courtyardOpenToSky: false
      }
    }

    const result = compileDeploymentCase(baseInput(roofedCourt))
    const courtyard = candidateFinding(result, 'RH-I02')

    assert.equal(courtyard.result, 'NON_CONFORMING')
    assert.match(courtyard.reason, /ceases to satisfy RH-I02/i)
    assert.equal(Object.prototype.hasOwnProperty.call(result, 'compatibility'), false)
  })

  test('refuses to infer conformance when controlled candidate facts are absent', () => {
    const candidate = canonicalCandidate()
    const incomplete: DeploymentCandidateInput = {
      ...candidate,
      revision: 'incomplete-front',
      facts: {
        ...candidate.facts,
        frontBayCount: undefined,
        frontBaySpacingMm: undefined,
        entranceBayIndex: undefined
      }
    }

    const result = compileDeploymentCase(baseInput(incomplete))
    const front = candidateFinding(result, 'RH-PROT-06')

    assert.equal(front.result, 'OPEN')
    assert.match(front.reason, /missing protected front-field facts/i)
    assert.ok(result.unresolvedInputs.includes('candidateConformance.RH-PROT-06'))
  })

  test('keeps site-interface and implementation routes open until their own evidence proves the response', () => {
    const candidate: DeploymentCandidateInput = {
      ...canonicalCandidate(),
      revision: 'external-routes',
      siteInterfaceResponseRefs: ['RH-SI01', 'RH-SI04'],
      implementationChoiceRefs: ['RH-IMP05']
    }

    const result = compileDeploymentCase(baseInput(candidate))

    assert.equal(candidateFinding(result, 'RH-SI01').result, 'OPEN')
    assert.equal(candidateFinding(result, 'RH-SI04').result, 'OPEN')
    assert.equal(candidateFinding(result, 'RH-IMP05').result, 'OPEN')
  })

  test('refuses to evaluate a candidate against a different Reference House revision by substitution', () => {
    const stale: DeploymentCandidateInput = {
      ...canonicalCandidate(),
      revision: 'stale-rh',
      referenceHouseSourceFingerprint: 'sha256:not-the-current-reference-house'
    }

    const result = compileDeploymentCase(baseInput(stale))
    assert.ok(result.candidateConformance)
    assert.equal(result.candidateConformance.referenceRevisionMatches, false)
    assert.deepEqual(result.candidateConformance.executableClauseIds, [])
    assert.deepEqual(result.candidateConformance.openClauseIds, ['RH-REVISION'])
    assert.equal(candidateFinding(result, 'RH-REVISION').result, 'OPEN')
  })

  test('candidate identity is deterministic, order-independent for admitted route references and invalidates on authored revision', () => {
    const candidate = canonicalCandidate()
    const first = compileDeploymentCase(baseInput({
      ...candidate,
      revision: 'route-order',
      variantSelections: ['RH-V02', 'RH-V01'],
      siteInterfaceResponseRefs: ['RH-SI04', 'RH-SI01']
    }))
    const reordered = compileDeploymentCase(baseInput({
      ...candidate,
      revision: 'route-order',
      variantSelections: ['RH-V01', 'RH-V02'],
      siteInterfaceResponseRefs: ['RH-SI01', 'RH-SI04']
    }))
    const revised = compileDeploymentCase(baseInput({
      ...candidate,
      revision: 'route-order-v2',
      variantSelections: ['RH-V01', 'RH-V02'],
      siteInterfaceResponseRefs: ['RH-SI01', 'RH-SI04']
    }))

    assert.equal(first.candidateConformance?.candidate.fingerprint, reordered.candidateConformance?.candidate.fingerprint)
    assert.equal(first.caseIdentity.fingerprint, reordered.caseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, reordered.resultFingerprint)

    assert.notEqual(first.candidateConformance?.candidate.fingerprint, revised.candidateConformance?.candidate.fingerprint)
    assert.notEqual(first.caseIdentity.fingerprint, revised.caseIdentity.fingerprint)
    assert.notEqual(first.resultFingerprint, revised.resultFingerprint)
  })
})
