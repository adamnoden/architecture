import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './identity-order.js'

test('existing DPL versions retain their explicit English object-key ordering', () => {
  const value = { reviewScopeClauseIds: 3, reviews: 1, reviewer: 2 }
  const legacyBytes = '{"reviewer":2,"reviews":1,"reviewScopeClauseIds":3}'
  assert.equal(sha256DplSemanticFingerprint(value), createHash('sha256').update(legacyBytes).digest('hex'))
  assert.notEqual(sha256DplSemanticFingerprint(value), sha256SemanticFingerprint(value))
})

test('DPL ordering distinguishes equivalent Unicode spellings without losing permutation invariance', () => {
  const keys = ['é', 'e\u0301', 'A-1', 'A_1', 'A1']
  assert.notEqual(compareDplIdentityStrings('é', 'e\u0301'), 0)
  assert.equal(compareDplIdentityStrings('é', 'e\u0301'), -compareDplIdentityStrings('e\u0301', 'é'))
  assert.deepEqual([...keys].sort(compareDplIdentityStrings), ['A_1', 'A-1', 'A1', 'e\u0301', 'é'])
  assert.deepEqual([...keys].sort(compareDplIdentityStrings), [...keys].reverse().sort(compareDplIdentityStrings))
  const object = Object.fromEntries(keys.map((key) => [key, key]))
  assert.equal(sha256DplSemanticFingerprint(object), sha256DplSemanticFingerprint(Object.fromEntries(Object.entries(object).reverse())))
})
