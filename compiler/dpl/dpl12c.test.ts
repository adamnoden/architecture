import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { createReferenceHouseSource } from '../reference-house/fixture.js'
import { referenceHouseSourceFingerprint } from '../reference-house/identity.js'
import { compileDeploymentCase } from './compile.js'
import type { DeploymentCandidateInput, DeploymentLedger } from './model.js'
import {
  compileWaveCDeploymentCase,
  createWaveCDeploymentCaseInput,
  loadWaveCBoroughTarget,
  loadWaveCInterfaceContracts,
  loadWaveCSite,
  loadWaveCTargetComposition
} from './wavec.js'

const referenceSource = createReferenceHouseSource()
const currentReferenceFingerprint = referenceHouseSourceFingerprint(referenceSource)

const canonicalCandidate = (): DeploymentCandidateInput => ({
  id: 'DPL-12C-AUTHORED-CANDIDATE',
  revision: '1',
  authoredSource: {
    id: 'dpl-12c-synthetic-authored-candidate-fixture',
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

const obligation = (ledger: DeploymentLedger, id: string) => {
  const item = ledger.obligations.find((candidate) => candidate.obligationId === id)
  assert.ok(item, `Expected obligation ${id}`)
  return item
}

describe('DPL-12C Wave-C runtime composition', () => {
  test('loads the complete eight-site controlled corpus without inventing claim-level unknowns', () => {
    const one = loadWaveCSite('DPL-RP-007')
    const two = loadWaveCSite('DPL-RP-007')

    assert.equal(one.corpus, 'DPL-CORPUS-1')
    assert.equal(one.indexEntry.id, 'DPL-RP-007')
    assert.equal(one.indexEntry.borough, 'Croydon')
    assert.equal(one.indexEntry.admissionState, 'ADMITTED_TOPOGRAPHY_STRESS')
    assert.equal(one.claimLevelUnknownsExposedByIndex, false)
    assert.deepEqual(one.runtimeSite.indexEntry.decisionCriticalUnknowns, [])
    assert.equal(one.indexEntryFingerprint, two.indexEntryFingerprint)
    assert.equal(one.recordFingerprint, two.recordFingerprint)
  })

  test('compiles an admitted site outside the original three-site pilot through the actual Wave-C targets', () => {
    const result = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-007',
      boroughTarget: 'Croydon',
      candidate: canonicalCandidate()
    })

    assert.equal(result.ledger.site.id, 'DPL-RP-007')
    assert.ok(
      result.ledger.targetComposition.some(
        (target) => target.targetId === 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'
      )
    )
    assert.ok(
      result.ledger.targetComposition.some(
        (target) => target.targetId === 'CROYDON-LOCAL-PLANNING-2018-2026-10-21'
      )
    )
    assert.ok(result.ledger.candidateConformance)
    assert.equal(result.ledger.candidateConformance.candidate.id, 'DPL-12C-AUTHORED-CANDIDATE')
  })

  test('loads Croydon and Bromley through one narrow borough envelope without equalising their policy families', () => {
    const croydon = loadWaveCBoroughTarget('Croydon')
    const bromley = loadWaveCBoroughTarget('Bromley')

    assert.equal(croydon.target.schemaVersion, 'dpl.boroughPlanningSlice.v1')
    assert.equal(bromley.target.schemaVersion, 'dpl.boroughPlanningSlice.v1')
    assert.notEqual(croydon.target.id, bromley.target.id)
    assert.ok(croydon.target.obligations.some((item) => item.id === 'CROY-DM25-SUDS-FLOOD'))
    assert.ok(bromley.target.obligations.some((item) => item.id === 'BROM-P3-BACKLAND-GARDEN'))
    assert.equal(croydon.target.obligations.some((item) => item.id === 'BROM-P3-BACKLAND-GARDEN'), false)
    assert.equal(bromley.target.obligations.some((item) => item.id === 'CROY-DM10-1-DESIGN-CHARACTER'), false)
  })

  test('keeps Bromley Policy 30 unsupported instead of executing a stale local parking table', () => {
    const result = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-002',
      boroughTarget: 'Bromley',
      candidate: canonicalCandidate()
    })

    const parking = obligation(result.ledger, 'BROM-P30-PARKING')
    assert.equal(parking.methodKind, 'UNSUPPORTED')
    assert.equal(parking.result, 'UNSUPPORTED')
    assert.match(parking.resultReason, /not supported/i)
  })

  test('composes the DPL-08C interface, DPL-09C technical target and local planning water duty without collapsing ownership', () => {
    const result = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-002',
      boroughTarget: 'Bromley',
      candidate: canonicalCandidate()
    })

    const interfaceIds = result.ledger.caseIdentity.manifest.interfaceContracts.map((item) => item.id)
    assert.ok(interfaceIds.includes('DPL-08C-FOUL-SURFACE-SITE-WATER'))

    const roofWater = obligation(result.ledger, 'ENG-BR-H3-1-ROOF-RAINWATER')
    const localSuds = obligation(result.ledger, 'BROM-P115-P116-FLOOD-SUDS')

    assert.equal(roofWater.authorityClass, 'ENGLAND_BUILDING_CONTROL')
    assert.equal(String(localSuds.authorityClass), 'LOCAL_BOROUGH_PLANNING')
    assert.equal(roofWater.result, 'UNRESOLVED')
    assert.equal(localSuds.result, 'UNRESOLVED')
    assert.equal(Object.prototype.hasOwnProperty.call(result.ledger, 'drainagePass'), false)
  })

  test('the additional Wave-C technical and interface identities materially change case identity', () => {
    const prepared = createWaveCDeploymentCaseInput({
      siteId: 'DPL-RP-003',
      boroughTarget: 'Croydon',
      candidate: canonicalCandidate()
    })

    const full = compileDeploymentCase(prepared.input)
    const withoutWater = compileDeploymentCase({
      ...prepared.input,
      interfaceContracts: prepared.input.interfaceContracts.filter(
        (item) => item.id !== 'DPL-08C-FOUL-SURFACE-SITE-WATER'
      ),
      targets: prepared.input.targets.filter(
        (item) => item.target.id !== 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'
      )
    })

    assert.notEqual(full.caseIdentity.fingerprint, withoutWater.caseIdentity.fingerprint)
    assert.notEqual(full.resultFingerprint, withoutWater.resultFingerprint)
  })

  test('candidate conformance survives target and interface reordering unchanged', () => {
    const prepared = createWaveCDeploymentCaseInput({
      siteId: 'DPL-RP-003',
      boroughTarget: 'Croydon',
      candidate: canonicalCandidate()
    })

    const first = compileDeploymentCase(prepared.input)
    const second = compileDeploymentCase({
      ...prepared.input,
      targets: [...prepared.input.targets].reverse(),
      interfaceContracts: [...prepared.input.interfaceContracts].reverse()
    })

    assert.equal(first.caseIdentity.fingerprint, second.caseIdentity.fingerprint)
    assert.equal(first.resultFingerprint, second.resultFingerprint)
    assert.equal(
      first.candidateConformance?.resultFingerprint,
      second.candidateConformance?.resultFingerprint
    )
  })

  test('the two borough compositions retain different target identity while leaving authored candidate identity untouched', () => {
    const croydon = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-003',
      boroughTarget: 'Croydon',
      candidate: canonicalCandidate()
    })
    const bromley = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-002',
      boroughTarget: 'Bromley',
      candidate: canonicalCandidate()
    })

    assert.notEqual(croydon.ledger.caseIdentity.fingerprint, bromley.ledger.caseIdentity.fingerprint)
    assert.equal(
      croydon.ledger.candidateConformance?.candidate.fingerprint,
      bromley.ledger.candidateConformance?.candidate.fingerprint
    )
    assert.equal(
      croydon.ledger.candidateConformance?.resultFingerprint,
      bromley.ledger.candidateConformance?.resultFingerprint
    )
  })

  test('fails closed on unsupported corpus and borough-target schemas and on borough/site mismatch', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dpl12c-'))
    try {
      const badCorpus = join(dir, 'bad-corpus.json')
      writeFileSync(badCorpus, JSON.stringify({ schemaVersion: 'dpl.realSiteIndex.v999' }))
      assert.throws(() => loadWaveCSite('DPL-RP-001', badCorpus), /Unsupported DPL Wave-C corpus schema/)

      const duplicateCorpus = join(dir, 'duplicate-corpus.json')
      writeFileSync(
        duplicateCorpus,
        JSON.stringify({
          schemaVersion: 'dpl.realSiteIndex.v1',
          corpus: 'TEST',
          researchDate: '2026-10-22',
          assuranceProfile: 'SCREENING',
          sites: [
            {
              id: 'DUP',
              displayName: 'One',
              borough: 'Croydon',
              admissionState: 'ADMITTED',
              record: 'one.md',
              challengeTags: []
            },
            {
              id: 'DUP',
              displayName: 'Two',
              borough: 'Croydon',
              admissionState: 'ADMITTED',
              record: 'two.md',
              challengeTags: []
            }
          ]
        })
      )
      assert.throws(() => loadWaveCSite('DUP', duplicateCorpus), /Duplicate Wave-C corpus site id DUP/)

      const badBorough = join(dir, 'bad-borough.json')
      writeFileSync(badBorough, JSON.stringify({ schemaVersion: 'dpl.boroughPlanningSlice.v999' }))
      assert.throws(
        () => loadWaveCBoroughTarget('Croydon', badBorough),
        /Unsupported DPL borough target schema/
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }

    assert.throws(
      () =>
        createWaveCDeploymentCaseInput({
          siteId: 'DPL-RP-002',
          boroughTarget: 'Croydon',
          candidate: canonicalCandidate()
        }),
      /is in Bromley; Croydon borough target is not applicable/
    )
  })

  test('retains the explicit no-compatibility boundary in the expanded Wave-C composition', () => {
    const result = compileWaveCDeploymentCase({
      siteId: 'DPL-RP-003',
      boroughTarget: 'Croydon',
      candidate: canonicalCandidate()
    })

    assert.deepEqual(result.ledger.proofBoundary, {
      wholeSiteCompatibilityConclusion: 'NOT_IMPLEMENTED',
      architecturalCandidateSelection: 'NOT_IMPLEMENTED',
      routeExhaustion: 'NOT_IMPLEMENTED'
    })
    assert.equal(Object.prototype.hasOwnProperty.call(result.ledger, 'compatibility'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(result.ledger, 'deploymentConclusion'), false)
    assert.equal(Object.prototype.hasOwnProperty.call(result.ledger, 'planningPermissionPrediction'), false)
  })

  test('exposes deterministic Wave-C composition helpers without mutating the controlled core loaders', () => {
    const targets = loadWaveCTargetComposition('Croydon')
    const interfaces = loadWaveCInterfaceContracts()

    assert.ok(targets.some((item) => item.target.id === 'ENG-BC-DRAINAGE-WASTE-WATER-2026-10-21'))
    assert.ok(targets.some((item) => item.target.id === 'CROYDON-LOCAL-PLANNING-2018-2026-10-21'))
    assert.ok(interfaces.some((item) => item.id === 'DPL-08C-FOUL-SURFACE-SITE-WATER'))
  })
})
