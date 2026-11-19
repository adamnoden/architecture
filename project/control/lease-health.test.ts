import assert from 'node:assert/strict'
import test from 'node:test'
import { createClaimRecord, nextNormalAcquisition, parseClaimRecord, renewClaim, releaseClaim } from './claims.js'
import { leaseHealth, assertPublicationLease } from './lease-health.js'
const now = new Date('2026-10-29T12:00:00Z')
const record = () => createClaimRecord({ node: 'PCO-TEST', generation: 1, leaseId: 'old', holder: { kind: 'chatgpt' }, branch: 'work/test', now })
const expected = { leaseId: 'old', generation: 1, branch: 'work/test' }
const at = (minutes: number) => new Date(now.getTime() + minutes * 60000)
test('shorter leases bound disappearance without treating silence as death', () => {
  const r = record()
  assert.equal(r.expiresAt, at(45).toISOString())
  const h = leaseHealth(r, at(16))
  assert.equal(h.renewalDue, true)
  assert.equal(h.responsiveness, 'unknown')
  assert.equal(h.temporal, 'live')
  assert.equal(leaseHealth(r, at(-3)).clockAhead, true)
  assert.throws(() => nextNormalAcquisition(r, { node: r.node, leaseId: 'new', holder: {kind:'chatgpt'}, now:at(16) }), /already claimed/)
})
test('returning ghost cannot publish using its old identity after expiry and reacquisition', () => {
  const old = record()
  const replacement = nextNormalAcquisition(old, { node: old.node, leaseId: 'new', holder: {kind:'chatgpt'}, branch:'work/new', now:at(48) })
  assert.throws(() => assertPublicationLease(replacement, at(48), expected), /Superseded/)
  assert.throws(() => renewClaim(replacement, 'old', at(48), 45, 1), /lease|generation/i)
  assert.throws(() => releaseClaim(replacement, 'old', at(48), 'abandoned', 1), /lease|generation/i)
})
test('publication rejects grace, little remaining time, wrong branch and clock uncertainty', () => {
  assert.doesNotThrow(() => assertPublicationLease(record(), at(0), expected))
  assert.throws(() => assertPublicationLease(record(), at(41), expected), /Renew/)
  assert.throws(() => assertPublicationLease(record(), at(45), expected), /live lease/)
  assert.throws(() => assertPublicationLease(record(), at(0), {...expected, branch:'other'}), /branch/)
  assert.throws(() => assertPublicationLease(record(), at(-3), expected), /Clock/)
})
test('checkpoint survives renewal, old records remain readable, malformed timelines fail closed', () => {
  const renewed = renewClaim(record(), 'old', at(10), 45, 1, {checkpoint:{evidence:'PR #123',next:'Run CI',blocker:'Awaiting CI'}})
  assert.equal(parseClaimRecord(JSON.stringify(renewed)).checkpoint?.next, 'Run CI')
  assert.equal(renewClaim(renewed, 'old', at(20), 45, 1).checkpoint?.evidence, 'PR #123')
  assert.doesNotThrow(() => parseClaimRecord(JSON.stringify(record())))
  assert.throws(() => parseClaimRecord(JSON.stringify({...record(),heartbeatAt:at(50).toISOString()})), /timestamps/)
  assert.throws(() => parseClaimRecord(JSON.stringify({...record(),checkpoint:{next:'guess'}})), /checkpoint/)
})
