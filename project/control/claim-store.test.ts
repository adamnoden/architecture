import assert from 'node:assert/strict'
import test from 'node:test'
import { controlNodes } from './nodes/index.js'
import {
  ClaimConflictError,
  acquireClaimFromStore,
  forceAcquireClaimFromStore,
  releaseClaimInStore,
  renewClaimInStore,
  type ClaimReadResult,
  type ClaimStore,
  type ClaimWriteResult,
  type StoredClaim
} from './claim-store.js'
import { serializeClaimRecord, type ClaimRecord } from './claims.js'

class FakeStore implements ClaimStore {
  private readonly records = new Map<string, StoredClaim>()
  private counter = 0
  now = new Date('2026-10-28T22:40:00.000Z')
  conflictNextWriteWithoutNodeChange = false
  onConflict?: () => void

  private sha(): string {
    this.counter += 1
    return `sha-${this.counter}`
  }

  async read(node: string): Promise<ClaimReadResult> {
    return { stored: this.records.get(node) ?? null, observedAt: new Date(this.now) }
  }

  async create(node: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    if (this.conflictNextWriteWithoutNodeChange) {
      this.conflictNextWriteWithoutNodeChange = false
      throw new ClaimConflictError('simulated unrelated branch-head contention')
    }
    if (this.records.has(node)) throw new ClaimConflictError('already exists')
    const stored = { record, sha: this.sha() }
    this.records.set(node, stored)
    return { stored, observedAt: new Date(this.now) }
  }

  async update(node: string, expectedSha: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    if (this.conflictNextWriteWithoutNodeChange) {
      this.conflictNextWriteWithoutNodeChange = false
      throw new ClaimConflictError('simulated unrelated branch-head contention')
    }
    if (this.onConflict) {
      const callback = this.onConflict
      this.onConflict = undefined
      callback()
      throw new ClaimConflictError('simulated same-node race')
    }
    const current = this.records.get(node)
    if (!current || current.sha !== expectedSha) throw new ClaimConflictError('stale sha')
    const stored = { record, sha: this.sha() }
    this.records.set(node, stored)
    return { stored, observedAt: new Date(this.now) }
  }

  async list(): Promise<{ claims: readonly StoredClaim[]; observedAt: Date }> {
    return { claims: [...this.records.values()], observedAt: new Date(this.now) }
  }

  seed(node: string, stored: StoredClaim): void {
    this.records.set(node, stored)
  }

  get(node: string): StoredClaim | undefined {
    return this.records.get(node)
  }
}

test('unrelated branch-head contention retries when the node file itself is unchanged', async () => {
  const store = new FakeStore()
  store.conflictNextWriteWithoutNodeChange = true

  const result = await acquireClaimFromStore(store, 'ACO-01', controlNodes, {
    holder: { kind: 'chatgpt', label: 'alpha' },
    leaseId: 'lease-alpha'
  })

  assert.equal(result.stored.record.leaseId, 'lease-alpha')
  assert.equal(result.stored.record.generation, 1)
})

test('same-node acquisition race has one winner', async () => {
  const store = new FakeStore()
  const first = await acquireClaimFromStore(store, 'ACO-01', controlNodes, {
    holder: { kind: 'chatgpt', label: 'alpha' },
    leaseId: 'lease-alpha'
  })
  assert.equal(first.stored.record.leaseId, 'lease-alpha')

  await assert.rejects(
    acquireClaimFromStore(store, 'ACO-01', controlNodes, {
      holder: { kind: 'codex', label: 'beta' },
      leaseId: 'lease-beta'
    }),
    /already claimed/
  )
})

test('renewal retries unrelated branch contention but not a changed lease generation', async () => {
  const store = new FakeStore()
  const first = await acquireClaimFromStore(store, 'ACO-01', controlNodes, {
    holder: { kind: 'chatgpt' },
    leaseId: 'lease-alpha'
  })

  store.now = new Date('2026-10-28T23:00:00.000Z')
  store.conflictNextWriteWithoutNodeChange = true
  const renewed = await renewClaimInStore(store, 'ACO-01', controlNodes, {
    leaseId: 'lease-alpha',
    generation: first.stored.record.generation
  })
  assert.equal(renewed.stored.record.heartbeatAt, '2026-10-28T23:00:00.000Z')

  const current = store.get('ACO-01')!
  store.onConflict = () => {
    const superseded: ClaimRecord = {
      ...current.record,
      generation: current.record.generation + 1,
      leaseId: 'lease-beta',
      holder: { kind: 'codex' },
      claimedAt: '2026-10-28T23:01:00.000Z',
      heartbeatAt: '2026-10-28T23:01:00.000Z',
      expiresAt: '2026-10-29T01:01:00.000Z'
    }
    store.seed('ACO-01', { record: superseded, sha: 'sha-race-winner' })
  }

  await assert.rejects(
    renewClaimInStore(store, 'ACO-01', controlNodes, {
      leaseId: 'lease-alpha',
      generation: current.record.generation
    }),
    /lease changed before renewal completed/
  )
})

test('force takeover does not silently overwrite a lease that changed during the decision', async () => {
  const store = new FakeStore()
  await acquireClaimFromStore(store, 'ACO-01', controlNodes, {
    holder: { kind: 'chatgpt', label: 'alpha' },
    leaseId: 'lease-alpha'
  })

  const current = store.get('ACO-01')!
  store.onConflict = () => {
    store.seed('ACO-01', {
      sha: 'sha-new-holder',
      record: {
        ...current.record,
        generation: 2,
        leaseId: 'lease-beta',
        holder: { kind: 'codex', label: 'beta' },
        claimedAt: '2026-10-28T22:45:00.000Z',
        heartbeatAt: '2026-10-28T22:45:00.000Z',
        expiresAt: '2026-10-29T00:45:00.000Z'
      }
    })
  }

  await assert.rejects(
    forceAcquireClaimFromStore(store, 'ACO-01', controlNodes, {
      holder: { kind: 'human', label: 'owner' },
      leaseId: 'lease-owner',
      reason: 'ghost session'
    }),
    /changed while force takeover was being decided/
  )
})

test('release requires the current lease identity and leaves an auditable record', async () => {
  const store = new FakeStore()
  const first = await acquireClaimFromStore(store, 'ACO-01', controlNodes, {
    holder: { kind: 'chatgpt' },
    leaseId: 'lease-alpha'
  })
  store.now = new Date('2026-10-28T22:50:00.000Z')

  await assert.rejects(
    releaseClaimInStore(store, 'ACO-01', controlNodes, {
      leaseId: 'wrong',
      generation: first.stored.record.generation,
      reason: 'handoff'
    }),
    /does not own/
  )

  const released = await releaseClaimInStore(store, 'ACO-01', controlNodes, {
    leaseId: 'lease-alpha',
    generation: first.stored.record.generation,
    reason: 'handoff'
  })
  assert.equal(released.stored.record.state, 'released')
  assert.match(serializeClaimRecord(released.stored.record), /"releaseReason": "handoff"/)
})
