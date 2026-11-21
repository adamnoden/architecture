import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
const root = new URL('../../../', import.meta.url)
const hash = path => createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex')

test('serial lower bodies preserve free, clamped and contact physics at ordinary and tiny physical areas', () => {
  execFileSync('python3', ['-B', new URL('project/str/studies/lower_core_bodies_test.py', root).pathname], { encoding: 'utf8', env: {...process.env, OPENBLAS_NUM_THREADS:'1'} })
})

test('actual lower core density and floor edit propagate through compatible heads with an unchanged zero-density control', () => {
  const proof = JSON.parse(readFileSync(new URL('project/str/studies/lower-core-bodies-proof.json', root), 'utf8'))
  assert.equal(proof.schema, 'str-lower-clearcore-bodies-proof/1')
  assert.equal(proof.proofProducerSHA256, hash('project/str/studies/lower_core_bodies_proof.py'))
  for (const [path, value] of Object.entries(proof.sourceSHA256)) assert.equal(hash(path), value, path)
  assert.equal(proof.cases.length, 4)
  assert.ok(proof.zeroDensityMaximumHeadDifferenceKN_KNm < 1e-6)
  assert.ok(proof.apertureMaximumHeadComponentDeltaKN_KNm > 1e-5)
  for (const value of proof.cases) {
    assert.equal(value.heads.length, 52)
    assert.equal(new Set(value.heads.map(row=>row.id)).size, 52)
    assert.ok(Math.max(...value.equilibriumResidualKN_KNm.map(Math.abs)) < 1e-5)
    assert.equal(value.completeHouseProof, false)
    const body=value.lowerCoreBodies
    if (body) {
      assert.ok(Math.abs(body.inventory.netClearCoreVolumeM3 - 31.427430375) < 1e-8)
      assert.equal(body.unsupportedBodyPhysicalGKN, 0)
      assert.equal(body.noNewLateralStiffness, true)
      assert.equal(body.noMasonryTopTension, true)
      assert.ok(Math.max(...body.sourceSelfGAndFirstMomentResidualKN_KNm.map(Math.abs)) < 1e-6)
      assert.equal(body.bodyAxialComparisonLawAccepted, false)
      assert.equal(body.candidateAccepted, false)
      assert.ok(value.bodyResponse.minimumBodyEndCompressionKN > -1e-8)
      assert.equal(value.bodyResponse.gaugeReactionsAcceptedAsSupport, false)
      assert.equal(value.bodyResponse.candidateAccepted, false)
    }
  }
  assert.equal(proof.completeHouseProof, false)
})
