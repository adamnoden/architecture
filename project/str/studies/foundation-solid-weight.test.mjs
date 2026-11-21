import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const root = new URL('../../../', import.meta.url)
const sha = path => createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')

test('source foundation union has independent exact geometry and adverse input checks', () => {
  execFileSync('python3', ['-B', new URL('project/str/studies/foundation_solid_weight_test.py', root).pathname], { encoding: 'utf8' })
})

test('paired compatible foundation proof is current and preserves origin and acceptance boundaries', () => {
  const proof = JSON.parse(readFileSync(new URL('project/str/studies/foundation-solid-weight-proof.json', root), 'utf8'))
  assert.equal(proof.schema, 'str-foundation-solid-weight-proof/1')
  assert.equal(proof.proofProducerSHA256, sha('project/str/studies/foundation_solid_weight_proof.py'))
  for (const [path, hash] of Object.entries(proof.sourceSHA256)) assert.equal(sha(path), hash, path)
  assert.equal(proof.executedCoupledCaseCount, 8)
  assert.equal(proof.cases.length, 8)
  assert.ok(Math.abs(proof.inventory.RCVolumeM3 - 35.3932059375) < 1e-10)
  assert.ok(Math.abs(proof.inventory.removedOverlapVolumeM3 - 13.4000240625) < 1e-10)
  assert.equal(proof.inventory.aboveSourceDPCCompressionCreditKN, 0)
  for (const result of proof.cases) {
    assert.equal(result.heads.length, 52)
    assert.equal(new Set(result.heads.map(row => row.id)).size, 52)
    assert.ok(Math.max(...result.equilibriumResidualKN_KNm.map(Math.abs)) < 1e-5)
    assert.equal(result.candidateAccepted, false)
    assert.equal(result.capGridResistanceAccepted, false)
    assert.equal(result.completeHouseProof, false)
    const weight = result.foundationWeight
    if (weight) {
      assert.equal(weight.aboveSourceDPCCompressionCreditKN, 0)
      assert.equal(weight.pileCapacityAccepted, false)
      assert.equal(weight.local3DIntersectionTransferAccepted, false)
      assert.ok(Math.max(...weight.sourceSelfGAndFirstMomentResidualKN_KNm.map(Math.abs)) < 1e-7)
      if (result.caseId.endsWith('/zero-factor-control')) assert.ok(result.maximumHeadComponentDeltaFromUnweightedKN_KNm < 1e-7)
      else assert.ok(result.maximumHeadComponentDeltaFromUnweightedKN_KNm > 1)
    }
  }
  assert.equal(proof.completeHouseProof, false)
  assert.equal(proof.capGridResistanceAccepted, false)
  assert.equal(proof.pileCapacityAccepted, false)
})

test('explicit court node closes the real missing normal footprint without adding a restraint', () => {
  execFileSync('python3', ['-B', new URL('project/str/studies/court_corner_closure_test.py', root).pathname], { encoding: 'utf8' })
  const proof = JSON.parse(readFileSync(new URL('project/str/studies/court-corner-closure-proof.json', root), 'utf8'))
  assert.equal(proof.schema, 'str-court-sw-closure-proof/1')
  assert.equal(proof.proofProducerSHA256, sha('project/str/studies/court_corner_closure_proof.py'))
  for (const [path, hash] of Object.entries(proof.sourceSHA256)) assert.equal(sha(path), hash, path)
  assert.ok(Math.abs(proof.open.missingGroundContactAreaMm2 - 10506.25) < 1e-7)
  assert.equal(proof.closed.missingGroundContactAreaMm2, 0)
  assert.equal(proof.closure.newSupportCount, 0)
  assert.equal(proof.closure.newNormalFibreCount, 64)
  assert.equal(proof.closure.addedPhysicalGKN, 1.0125)
  assert.equal(proof.closure.newRCVolumeM3, .0405)
  assert.equal(proof.closure.foundationUnionAlreadyIncludesAddedBody, false)
  assert.equal(proof.closure.aboveSourceDPCCompressionCreditKN, 0)
  assert.equal(proof.closure.localJointRigidityAccepted, false)
  assert.equal(proof.closure.jointReinforcementAccepted, false)
  assert.equal(proof.completeHouseProof, false)
  assert.ok(proof.maximumHeadComponentDeltaKN_KNm > 1e-5)
  assert.ok(Math.max(...proof.closed.equilibriumResidualKN_KNm.map(Math.abs)) < 1e-5)
})
