import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { compileDeploymentCase } from './compile.js'
import { loadB2InterfaceContracts, loadB2TargetComposition, loadPilotSite } from './load.js'
import type { DeploymentCaseInput, DeploymentLedger } from './model.js'

const baseInput = (): DeploymentCaseInput => ({
  assuranceProfile: 'SCREENING',
  site: loadPilotSite('DPL-RP-003'),
  interfaceContracts: loadB2InterfaceContracts(),
  targets: loadB2TargetComposition()
})

const obligation = (ledger: DeploymentLedger, id: string) => {
  const item = ledger.obligations.find((candidate) => candidate.obligationId === id)
  assert.ok(item, `Expected obligation ${id}`)
  return item
}

describe('DPL-12A minimal deployment orchestration', () => {
  test('compiles the actual B2 site and target slices into a deterministic mixed obligation ledger', () => {
    const first = compileDeploymentCase(baseInput())
    const second = compileDeploymentCase(baseInput())

    assert.equal(first.caseIdentity.fingerprint, second.caseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, second.resultFingerprint)
    assert.equal(first.site.id, 'DPL-RP-003')
    assert.equal(first.site.borough, 'Croydon')
    assert.ok(first.unresolvedInputs.includes('site.current_legal_parcel'))
    assert.ok(first.unresolvedInputs.includes('site.drainage_and_sewers'))

    const a1 = obligation(first, 'ENG-BR-A1')
    assert.equal(a1.applicability.state, 'APPLIES')
    assert.equal(a1.methodKind, 'EXTERNAL_PROFESSIONAL_EVIDENCE')
    assert.equal(a1.result, 'UNRESOLVED')

    const d1 = obligation(first, 'ENG-BR-D1')
    assert.equal(d1.applicability.state, 'UNRESOLVED')
    assert.deepEqual(d1.applicability.missingFactIds, ['cavityInsulationInserted'])
    assert.equal(d1.result, 'UNRESOLVED')

    const d6 = obligation(first, 'LON-D6-GIA-STORAGE')
    assert.equal(d6.methodKind, 'NATIVE_DETERMINISTIC')
    assert.equal(d6.result, 'UNRESOLVED')
    assert.ok(d6.missingInputs.includes('policyDefinedGIA'))

    const d3 = obligation(first, 'LON-D3-DESIGN-LED')
    assert.equal(d3.methodKind, 'EXTERNAL_PLANNING_OR_ARCHITECTURAL_JUDGEMENT')
    assert.equal(d3.result, 'UNRESOLVED')
    assert.match(d3.resultReason, /judgement/i)

    const d7Edge = first.crossTargetEdges.find(
      (edge) => edge.fromObligationId === 'LON-D7-ACCESSIBLE-HOUSING-MIX'
    )
    assert.ok(d7Edge)
    assert.equal(d7Edge.state, 'UNRESOLVED')

    assert.deepEqual(first.proofBoundary, {
      wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED',
      architecturalCandidateSelection: 'NOT_IMPLEMENTED',
      routeExhaustion: 'NOT_IMPLEMENTED'
    })
    assert.equal(Object.prototype.hasOwnProperty.call(first, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(first, 'deploymentConclusion'), false)
  })

  test('target order does not change case or result identity', () => {
    const original = baseInput()
    const reversed: DeploymentCaseInput = {
      ...original,
      targets: [...original.targets].reverse()
    }

    const a = compileDeploymentCase(original)
    const b = compileDeploymentCase(reversed)

    assert.equal(a.caseIdentity.fingerprint, b.caseIdentity.fingerprint)
    assert.equal(a.resultFingerprint, b.resultFingerprint)
    assert.deepEqual(a.targetComposition, b.targetComposition)
  })

  test('evaluates the admitted London D6 space-table rule when proposal facts are explicitly supplied', () => {
    const input: DeploymentCaseInput = {
      ...baseInput(),
      proposalFacts: {
        bedroomCount: 4,
        bedspaceCount: 6,
        dwellingStoreys: 2,
        policyDefinedGIA: 150,
        builtInStorageArea: 4
      }
    }

    const result = compileDeploymentCase(input)
    const d6 = obligation(result, 'LON-D6-GIA-STORAGE')
    assert.equal(d6.result, 'PASS')
    assert.match(d6.resultReason, /requires GIA >= 106 m²/)
  })

  test('fails the native London D6 rule deterministically when admitted proposal facts are below the policy minimum', () => {
    const input: DeploymentCaseInput = {
      ...baseInput(),
      proposalFacts: {
        bedroomCount: 4,
        bedspaceCount: 6,
        dwellingStoreys: 2,
        policyDefinedGIA: 100,
        builtInStorageArea: 2
      }
    }

    const result = compileDeploymentCase(input)
    assert.equal(obligation(result, 'LON-D6-GIA-STORAGE').result, 'FAIL')
  })

  test('fact-gated applicability never guesses and changes compile identity when the admitted fact changes', () => {
    const unknown = compileDeploymentCase(baseInput())
    const notApplicable = compileDeploymentCase({
      ...baseInput(),
      proposalFacts: { cavityInsulationInserted: false }
    })

    assert.equal(obligation(unknown, 'ENG-BR-D1').result, 'UNRESOLVED')
    assert.equal(obligation(notApplicable, 'ENG-BR-D1').result, 'NOT_APPLICABLE')
    assert.notEqual(unknown.caseIdentity.fingerprint, notApplicable.caseIdentity.fingerprint)
    assert.notEqual(unknown.resultFingerprint, notApplicable.resultFingerprint)
  })

  test('accepted external evidence can discharge an external obligation without converting it into a native method', () => {
    const result = compileDeploymentCase({
      ...baseInput(),
      evidence: [
        {
          id: 'STRUCTURAL-ENGINEER-A1-REVIEW',
          version: '1',
          state: 'ACCEPTED',
          dischargesObligationIds: ['ENG-BR-A1'],
          sourceRefs: ['competent-structural-evidence']
        }
      ]
    })

    const a1 = obligation(result, 'ENG-BR-A1')
    assert.equal(a1.methodKind, 'EXTERNAL_PROFESSIONAL_EVIDENCE')
    assert.equal(a1.result, 'EXTERNALLY_DISCHARGED')
    assert.deepEqual(a1.evidenceIds, ['STRUCTURAL-ENGINEER-A1-REVIEW'])
  })

  test('cross-target assignment becomes a resolved edge but does not pretend to prove the receiving technical requirement', () => {
    const result = compileDeploymentCase({
      ...baseInput(),
      proposalFacts: { planningM4Category: 'M4(2)' }
    })

    const edge = result.crossTargetEdges.find(
      (candidate) => candidate.fromObligationId === 'LON-D7-ACCESSIBLE-HOUSING-MIX'
    )
    assert.ok(edge)
    assert.equal(edge.state, 'RESOLVED')
    assert.equal(edge.value, 'M4(2)')
    assert.equal(obligation(result, 'LON-D7-ACCESSIBLE-HOUSING-MIX').result, 'UNRESOLVED')
    assert.equal(result.proofBoundary.wholeSiteCompatibilityConclusion, 'NOT_IMPLEMENTED')
  })

  test('changing admitted evidence identity changes case and result identity', () => {
    const one = compileDeploymentCase({
      ...baseInput(),
      evidence: [{ id: 'E-1', version: '1', state: 'PRESENT' }]
    })
    const two = compileDeploymentCase({
      ...baseInput(),
      evidence: [{ id: 'E-1', version: '2', state: 'PRESENT' }]
    })

    assert.notEqual(one.caseIdentity.fingerprint, two.caseIdentity.fingerprint)
    assert.notEqual(one.resultFingerprint, two.resultFingerprint)
  })
})
