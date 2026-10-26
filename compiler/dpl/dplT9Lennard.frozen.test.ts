import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { composeDPLT9LennardNoCostClosure } from './dplT9Lennard.js'

const EXPECTED_RESULT_FINGERPRINT = '55c7020d704b1285527c7249c961783185f56d467e0cdd7f5c93fcdc80393e6a'
const EXPECTED_AUTHORITY_FINGERPRINT = '90c69b103fff3fe330a0b3f88fdeff8c44928e587ff8c864d01393161ca4946a'

const EXPECTED_RECORD_FINGERPRINTS: Readonly<Record<string, string>> = {
  'NON_PLANNING:DPL11-COV-PHYSICAL-FLOOD-WATER': '283b4ec8cb6aafd2a112896eb73bba9535de50541ee7316bb35ddd4e420a88d6',
  'PLANNING:DPL10-COV-EMERGING-POLICY-MATERIAL-WEIGHT': '0d7f9e5304aca6ff662699a499a865d6dbc3035102b238e21f270ff3203b7ab6',
  'PLANNING:DPL10-COV-LOCAL-QUALITATIVE-EVIDENCE-POLICY': '49f9ff9bdff3dce7f28a9cfe96667a54704dc53d6d1653f3eac201ad7aaa0294',
  'PLANNING:DPL10-COV-LOCAL-QUANTITATIVE-POLICY': 'c33a9f3b3d0d381f37b69bc2df825948309222521984787fdbe26c0964652155',
  'PLANNING:DPL10-COV-STRATEGIC-DESIGN-CONTEXT-CAPACITY': '4c55d74c700ac0430e79f80b4848f7a552fbbaf474d147a4c3083769919982c0',
  'REFERENCE_HOUSE:RH-PROT-08': 'c78798580e99ed7aa25ba27f9ebaf64914ba4bb60c1001a4afb9c8a1a45fe162',
  'REFERENCE_HOUSE:RH-PROT-14': 'c162b6afb6e46c2a61097d731517da7537ab8360cb67b268d34db132ffb0672d'
}

describe('DPL-T9 frozen semantic identity', () => {
  test('matches the independently reconstructed semantic fingerprints exactly', () => {
    const result = composeDPLT9LennardNoCostClosure()
    assert.equal(result.resultFingerprint, EXPECTED_RESULT_FINGERPRINT)
    assert.equal(result.authorityEvidenceFingerprint, EXPECTED_AUTHORITY_FINGERPRINT)
    assert.deepEqual(
      Object.fromEntries(result.records.map((record) => [record.blockerId, record.fingerprint])),
      EXPECTED_RECORD_FINGERPRINTS
    )
  })
})
