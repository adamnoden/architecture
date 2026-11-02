import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { sha256SemanticFingerprint, stableJsonStringify } from './identity.js'

test('finite plain data retains canonical bytes, omitted optional fields and authored array order', () => {
  const source = { z: [2, 1, null], a: { x: true, absent: undefined }, title: 'House' }
  const json = '{"a":{"x":true},"title":"House","z":[2,1,null]}'
  assert.equal(stableJsonStringify(source), json)
  assert.equal(sha256SemanticFingerprint(source), createHash('sha256').update(json).digest('hex'))
  assert.equal(sha256SemanticFingerprint(source), sha256SemanticFingerprint({ title: 'House', a: { x: true }, z: [2, 1, null] }))
  assert.notEqual(sha256SemanticFingerprint([1, 2]), sha256SemanticFingerprint([2, 1]))
})

test('exceptional numbers have distinct identities and cannot alias authored sentinel shapes', () => {
  const inputs = [NaN, Infinity, -Infinity, null, 'NaN', ['number', 'NaN'], { number: 'NaN' }]
  assert.equal(new Set(inputs.map((x) => sha256SemanticFingerprint({ x }))).size, inputs.length)
  for (const x of [NaN, Infinity, -Infinity]) assert.throws(() => stableJsonStringify({ x }), /Non-finite/)
  assert.equal(sha256SemanticFingerprint({ z: 1, x: NaN }), sha256SemanticFingerprint({ x: NaN, z: 1 }))
  assert.notEqual(sha256SemanticFingerprint({ x: NaN }), sha256SemanticFingerprint({ x: ['number', 'NaN'], y: Infinity }))
})

test('unsupported objects, values and cycles are rejected rather than losing information', () => {
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic
  for (const value of [new Date(), new Map(), new Set(), undefined, { x: () => 1 }, [undefined], [Symbol('x')], 1n, cyclic]) {
    assert.throws(() => sha256SemanticFingerprint(value), /Cannot fingerprint/)
  }
  const shared = { x: 1 }
  assert.equal(stableJsonStringify([shared, shared]), '[{"x":1},{"x":1}]')
})
