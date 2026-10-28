import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'
import {
  canonicalNodeId,
  claimPath,
  createClaimRecord,
  forceTakeover,
  leaseTemporalState,
  nextNormalAcquisition,
  operationalState,
  parseClaimRecord,
  releaseClaim,
  renewClaim,
  serializeClaimRecord
} from './claims.js'

const now = new Date('2026-10-28T22:40:00.000Z')

function node(id: string) {
  const candidate = controlNodes.find((item) => item.id === id)
  if (!candidate) throw new Error(`missing node ${id}`)
  return candidate
}

test('aliases resolve to one canonical lease path', () => {
  assert.equal(canonicalNodeId('IAS-OAS-JUNCTION', controlNodes), 'IAS-OAS-JUNCTION')
  assert.equal(canonicalNodeId('IAS-02O', controlNodes), 'IAS-OAS-JUNCTION')
  assert.equal(canonicalNodeId('OAS-02I', controlNodes), 'IAS-OAS-JUNCTION')
  assert.equal(claimPath(canonicalNodeId('IAS-02O', controlNodes)), '.pco/claims/IAS-OAS-JUNCTION.json')
  assert.equal(claimPath(canonicalNodeId('OAS-02I', controlNodes)), '.pco/claims/IAS-OAS-JUNCTION.json')
})

test('normal acquisition creates generation 1 and rejects a live second claimant', () => {
  const first = nextNormalAcquisition(null, {
    node: 'ACO-01',
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt', label: 'session-a' },
    now
  })
  assert.equal(first.generation, 1)
  assert.equal(first.state, 'claimed')
  assert.throws(
    () =>
      nextNormalAcquisition(first, {
        node: 'ACO-01',
        leaseId: 'lease-b',
        holder: { kind: 'codex', label: 'session-b' },
        now: new Date('2026-10-28T23:00:00.000Z')
      }),
    /already claimed/
  )
})

test('expiry grace prevents boundary overlap, then permits reacquisition', () => {
  const first = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now,
    ttlMinutes: 15
  })

  assert.equal(leaseTemporalState(first, new Date('2026-10-28T22:55:30.000Z')), 'grace')
  assert.throws(
    () =>
      nextNormalAcquisition(first, {
        node: 'ACO-01',
        leaseId: 'lease-b',
        holder: { kind: 'codex' },
        now: new Date('2026-10-28T22:55:30.000Z')
      }),
    /already claimed/
  )

  const second = nextNormalAcquisition(first, {
    node: 'ACO-01',
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now: new Date('2026-10-28T22:57:01.000Z')
  })
  assert.equal(second.generation, 2)
  assert.equal(second.leaseId, 'lease-b')
})

test('release allows immediate reacquisition and increments generation', () => {
  const first = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  const released = releaseClaim(first, 'lease-a', new Date('2026-10-28T22:50:00.000Z'), 'handoff', 1)
  assert.equal(released.state, 'released')

  const second = nextNormalAcquisition(released, {
    node: 'ACO-01',
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now: new Date('2026-10-28T22:50:01.000Z')
  })
  assert.equal(second.generation, 2)
})

test('superseded generations cannot renew or release a newer lease', () => {
  const first = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  const takeover = forceTakeover(first, {
    node: 'ACO-01',
    leaseId: 'lease-b',
    holder: { kind: 'human', label: 'owner' },
    now: new Date('2026-10-28T22:50:00.000Z'),
    reason: 'ghost session confirmed by owner'
  })

  assert.equal(takeover.generation, 2)
  assert.equal(takeover.supersedes?.leaseId, 'lease-a')
  assert.throws(() => renewClaim(takeover, 'lease-a', new Date('2026-10-28T22:55:00.000Z'), 120, 1), /does not own/)
  assert.throws(() => releaseClaim(takeover, 'lease-a', new Date('2026-10-28T22:55:00.000Z'), 'abandoned', 1), /does not own/)
})

test('renewal extends from renewal time but cannot resurrect a fully expired lease', () => {
  const first = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now,
    ttlMinutes: 15
  })
  const renewed = renewClaim(first, 'lease-a', new Date('2026-10-28T22:54:00.000Z'), 30, 1)
  assert.equal(renewed.expiresAt, '2026-10-28T23:24:00.000Z')

  assert.throws(
    () => renewClaim(first, 'lease-a', new Date('2026-10-28T22:58:00.000Z'), 30, 1),
    /Cannot renew expired lease/
  )
})

test('malformed records fail closed', () => {
  assert.throws(() => parseClaimRecord('{'), /Malformed claim JSON/)
  assert.throws(
    () => parseClaimRecord(JSON.stringify({ schemaVersion: 1, node: 'ACO-01' }), 'ACO-01'),
    /generation/
  )
})

test('serialization round-trips a valid record', () => {
  const record = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt', label: 'session-a' },
    now,
    branch: 'work/aco-runtime',
    pr: 123,
    note: 'implement runtime store'
  })
  assert.deepEqual(parseClaimRecord(serializeClaimRecord(record), 'ACO-01'), record)
})

test('operational state keeps structural truth orthogonal to occupancy', () => {
  const readyNode = node('ACO-01')
  const live = createClaimRecord({
    node: 'ACO-01',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  assert.equal(operationalState(readyNode, controlNodes, null, now).occupancy, 'available')
  assert.equal(operationalState(readyNode, controlNodes, live, now).occupancy, 'claimed')

  const blockedNode = node('ACO-02')
  const invalidClaim = createClaimRecord({
    node: 'ACO-02',
    generation: 1,
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now
  })
  const invalid = operationalState(blockedNode, controlNodes, invalidClaim, now)
  assert.equal(invalid.structural, 'blocked')
  assert.equal(invalid.occupancy, 'invalid-live-claim')
})
