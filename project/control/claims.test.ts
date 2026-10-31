import assert from 'node:assert/strict'
import test from 'node:test'
import type { ControlNode } from './types.js'
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

const operationalFixture: readonly ControlNode[] = [
  {
    id: 'TST-READY',
    owners: ['ACO'],
    title: 'Synthetic ready fixture',
    dependencies: [],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'TST-UPSTREAM',
    owners: ['ACO'],
    title: 'Synthetic incomplete upstream',
    dependencies: [],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'TST-BLOCKED',
    owners: ['ACO'],
    title: 'Synthetic blocked fixture',
    dependencies: ['TST-UPSTREAM'],
    lifecycle: 'planned',
    closeoutEvidence: []
  }
]

function fixtureNode(id: string): ControlNode {
  const candidate = operationalFixture.find((item) => item.id === id)
  if (!candidate) throw new Error(`missing fixture node ${id}`)
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
    node: 'TST-READY',
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt', label: 'session-a' },
    now
  })
  assert.equal(first.generation, 1)
  assert.equal(first.state, 'claimed')
  assert.throws(
    () =>
      nextNormalAcquisition(first, {
        node: 'TST-READY',
        leaseId: 'lease-b',
        holder: { kind: 'codex', label: 'session-b' },
        now: new Date('2026-10-28T23:00:00.000Z')
      }),
    /already claimed/
  )
})

test('expiry grace prevents boundary overlap, then permits reacquisition', () => {
  const first = createClaimRecord({
    node: 'TST-READY',
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
        node: 'TST-READY',
        leaseId: 'lease-b',
        holder: { kind: 'codex' },
        now: new Date('2026-10-28T22:55:30.000Z')
      }),
    /already claimed/
  )

  const second = nextNormalAcquisition(first, {
    node: 'TST-READY',
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now: new Date('2026-10-28T22:57:01.000Z')
  })
  assert.equal(second.generation, 2)
  assert.equal(second.leaseId, 'lease-b')
})

test('release allows immediate reacquisition and increments generation', () => {
  const first = createClaimRecord({
    node: 'TST-READY',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  const released = releaseClaim(first, 'lease-a', new Date('2026-10-28T22:50:00.000Z'), 'handoff', 1)
  assert.equal(released.state, 'released')

  const second = nextNormalAcquisition(released, {
    node: 'TST-READY',
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now: new Date('2026-10-28T22:50:01.000Z')
  })
  assert.equal(second.generation, 2)
})

test('superseded generations cannot renew or release a newer lease', () => {
  const first = createClaimRecord({
    node: 'TST-READY',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  const takeover = forceTakeover(first, {
    node: 'TST-READY',
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
    node: 'TST-READY',
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
    () => parseClaimRecord(JSON.stringify({ schemaVersion: 1, node: 'TST-READY' }), 'TST-READY'),
    /generation/
  )
})

test('serialization round-trips a valid record', () => {
  const record = createClaimRecord({
    node: 'TST-READY',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt', label: 'session-a' },
    now,
    branch: 'work/aco-runtime',
    pr: 123,
    note: 'implement runtime store'
  })
  assert.deepEqual(parseClaimRecord(serializeClaimRecord(record), 'TST-READY'), record)
})

test('operational state keeps structural truth orthogonal to occupancy', () => {
  const readyNode = fixtureNode('TST-READY')
  const live = createClaimRecord({
    node: 'TST-READY',
    generation: 1,
    leaseId: 'lease-a',
    holder: { kind: 'chatgpt' },
    now
  })
  assert.equal(operationalState(readyNode, operationalFixture, null, now).occupancy, 'available')
  assert.equal(operationalState(readyNode, operationalFixture, live, now).occupancy, 'claimed')

  const blockedNode = fixtureNode('TST-BLOCKED')
  const invalidClaim = createClaimRecord({
    node: 'TST-BLOCKED',
    generation: 1,
    leaseId: 'lease-b',
    holder: { kind: 'codex' },
    now
  })
  const invalid = operationalState(blockedNode, operationalFixture, invalidClaim, now)
  assert.equal(invalid.structural, 'blocked')
  assert.equal(invalid.occupancy, 'invalid-live-claim')
})
