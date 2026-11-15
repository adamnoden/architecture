import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePreflightEvent } from '../../scripts/ci-publication-preflight.js'

function event(body = 'Work: PCO-CODIFICATION\nLease: PCO-CODIFICATION / lease-123 / generation 2') {
  return {pull_request: {body,
    base: {ref: 'main', repo: {full_name: 'adamnoden/architecture'}},
    head: {ref: 'work/example', sha: 'a'.repeat(40), repo: {full_name: 'adamnoden/architecture'}}}}
}

test('CI publication preflight preserves exact target and canonical lease declarations', () => {
  assert.deepEqual(parsePreflightEvent(event()), {
    repository: 'adamnoden/architecture', head: 'a'.repeat(40), branch: 'work/example',
    leases: [{node: 'PCO-CODIFICATION', leaseId: 'lease-123', generation: 2}]
  })
  const shared = parsePreflightEvent(event('Work: STR-FLOOR-PORTAL, HAD-INLET-RESOLUTION\nLease: STR-FLOOR-PORTAL / one / generation 3\nLease: HAD-INLET-RESOLUTION / two / generation 4'))
  assert.deepEqual(shared.leases.map(lease => lease.node), ['STR-FLOOR-PORTAL', 'HAD-INLET-RESOLUTION'])
})

test('CI preflight rejects missing duplicated or zero-generation lease identities', () => {
  for (const body of ['Work: PCO-CODIFICATION', 'Work: PCO-CODIFICATION\nLease: PCO-CODIFICATION / a / generation 0', 'Work: PCO-CODIFICATION\nLease: PCO-CODIFICATION / a / generation 1\nLease: PCO-CODIFICATION / b / generation 2']) {
    assert.throws(() => parsePreflightEvent(event(body)))
  }
})

test('CI preflight retains the explicit non-packet exemption without inventing a lease', () => {
  assert.deepEqual(parsePreflightEvent(event('Work: none\nWork reason: Documentation only')).leases, [])
  assert.throws(() => parsePreflightEvent(event('Work: none')))
})

test('CI preflight rejects wrong repository base and malformed event heads', () => {
  const fork = event(); fork.pull_request.head.repo.full_name = 'other/architecture'
  const base = event(); base.pull_request.base.ref = 'other'
  const sha = event(); sha.pull_request.head.sha = 'not-a-sha'
  for (const invalid of [fork, base, sha, {}, null]) assert.throws(() => parsePreflightEvent(invalid))
})
