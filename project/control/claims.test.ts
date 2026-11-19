import assert from 'node:assert/strict'
import test from 'node:test'
import type { ControlNode } from './types.js'
import { controlNodes } from './nodes/index.js'
import {
  ClaimOccupiedError,
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
    error => error instanceof ClaimOccupiedError && /already claimed/.test(error.message)
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
    error => error instanceof ClaimOccupiedError && /already claimed/.test(error.message)
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

test('normal recovery atomically preserves predecessor provenance, without transferring its checkpoint', () => {
  const earlier = createClaimRecord({
    node: 'TST-READY', generation: 2, leaseId: 'old-lease',
    holder: { kind: 'chatgpt' }, now, branch: 'work/old',
    pr: 432, checkpoint: { evidence: 'PR #432 head abc', next: 'Re-run validation' }
  })
  const released = releaseClaim(earlier, earlier.leaseId, new Date('2026-10-28T22:45:00Z'), 'abandoned', 2)
  const newer = nextNormalAcquisition(released, {
    node: 'TST-READY', leaseId: 'new-lease', holder: { kind: 'chatgpt' },
    now: new Date('2026-10-28T22:46:00Z'), branch: 'work/new'
  })
  assert.equal(newer.generation, 3)
  assert.deepEqual(newer.predecessor, {
    leaseId: 'old-lease', generation: 2, branch: 'work/old', pr: 432,
    checkpoint: { evidence: 'PR #432 head abc', next: 'Re-run validation' }
  })
  assert.equal(newer.checkpoint, undefined)
  assert.deepEqual(parseClaimRecord(serializeClaimRecord(newer)), newer)
  assert.throws(() => renewClaim(newer, 'old-lease', new Date('2026-10-28T22:47:00Z'), 45, 2), /does not own/)
  assert.throws(() => nextNormalAcquisition(released, {
    node: 'TST-READY', leaseId: 'bad-lease', holder: { kind: 'chatgpt' },
    now: new Date('2026-10-28T22:46:00Z'), branch: 'work/old'
  }), /must not reuse/)
  assert.throws(() => parseClaimRecord(JSON.stringify({...newer, predecessor: {...newer.predecessor, generation: 3}})), /predecessor/i)
  assert.equal(parseClaimRecord(serializeClaimRecord(earlier)).predecessor, undefined)
})

test('second abrupt cutoff retains the last pushed predecessor evidence rather than losing it', () => {
  const original=createClaimRecord({node:'TST-READY',generation:1,leaseId:'original',
    holder:{kind:'chatgpt'},now,branch:'work/original',pr:100,
    checkpoint:{evidence:'PR #100 head abc',next:'Inspect architecture'}})
  const first=nextNormalAcquisition(releaseClaim(original,'original',new Date('2026-10-28T22:45:00Z'),'abandoned',1),{
    node:'TST-READY',leaseId:'replacement-1',holder:{kind:'chatgpt'},
    now:new Date('2026-10-28T22:46:00Z'),branch:'work/replacement-1'
  })
  assert.equal(first.checkpoint,undefined)
  const second=nextNormalAcquisition(releaseClaim(first,'replacement-1',new Date('2026-10-28T22:47:00Z'),'abandoned',2),{
    node:'TST-READY',leaseId:'replacement-2',holder:{kind:'chatgpt'},
    now:new Date('2026-10-28T22:48:00Z'),branch:'work/replacement-2'
  })
  assert.equal(second.predecessor?.leaseId,'replacement-1')
  assert.equal(second.recoverySource?.leaseId,'original')
  assert.equal(second.recoverySource?.generation,1)
  assert.equal(second.recoverySource?.branch,'work/original')
  assert.equal(second.recoverySource?.checkpoint.next,'Inspect architecture')
  assert.equal(second.checkpoint,undefined)
  assert.deepEqual(parseClaimRecord(serializeClaimRecord(second)),second)
  assert.throws(()=>parseClaimRecord(JSON.stringify({...second,recoverySource:{...second.recoverySource,generation:3}})),/recovery source/i)
})
