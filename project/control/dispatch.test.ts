import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ClaimConflictError,
  ClaimStoreUnavailableError,
  type ClaimReadResult,
  type ClaimStore,
  type ClaimWriteResult,
  type StoredClaim
} from './claim-store.js'
import {
  buildDispatchSnapshot,
  claimNextFromStore,
  DispatchUnsafeError
} from './dispatch.js'
import {
  createClaimRecord,
  releaseClaim,
  type ClaimRecord
} from './claims.js'
import type { ControlNode, NodeId } from './types.js'
import { validateGraphStructure } from './validate.js'

const now = new Date('2026-10-29T09:00:00.000Z')

function planned(
  id: string,
  dependencies: readonly string[] = [],
  owners: ControlNode['owners'] = ['PCO'],
  mode: 'self-service' | 'manual' = 'self-service'
): ControlNode {
  return {
    id,
    owners,
    title: id,
    dependencies,
    lifecycle: 'planned',
    agentDispatch: mode === 'manual'
      ? { mode, reason: `${id} requires directed execution` }
      : { mode },
    closeoutEvidence: []
  }
}

function started(id: string, owners: ControlNode['owners'] = ['PCO']): ControlNode {
  return {
    id,
    owners,
    title: id,
    dependencies: [],
    lifecycle: 'started',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
}

function claim(
  node: string,
  label = 'worker',
  at = now,
  ttlMinutes = 120,
  generation = 1
): ClaimRecord {
  return createClaimRecord({
    node,
    generation,
    leaseId: `lease-${node}-${generation}`,
    holder: { kind: 'chatgpt', label },
    now: at,
    ttlMinutes
  })
}

function ids(snapshot: ReturnType<typeof buildDispatchSnapshot>): string[] {
  return snapshot.candidates.map((candidate) => candidate.node.id)
}

test('ranking is deterministic independent of input ordering', () => {
  const nodes = [planned('AAA'), planned('BBB'), planned('CCC')]
  const forward = ids(buildDispatchSnapshot(nodes, [], now))
  const reverse = ids(buildDispatchSnapshot([...nodes].reverse(), [], now))
  assert.deepEqual(forward, ['AAA', 'BBB', 'CCC'])
  assert.deepEqual(reverse, forward)
})

test('critical depth outranks shallower independent work', () => {
  const nodes = [
    planned('DEEP'),
    planned('MID', ['DEEP']),
    planned('TAIL', ['MID']),
    planned('SHALLOW')
  ]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  assert.equal(snapshot.candidates[0].node.id, 'DEEP')
  assert.equal(snapshot.candidates[0].metrics.criticalDepth, 3)
  assert.equal(snapshot.candidates.find((item) => item.node.id === 'SHALLOW')?.metrics.criticalDepth, 1)
})

test('blocker relief breaks equal-depth ties before downstream reach', () => {
  const nodes = [
    planned('AAA'),
    planned('BBB'),
    planned('A-CHILD', ['AAA']),
    planned('B-CHILD', ['BBB', 'OTHER']),
    planned('OTHER')
  ]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  const a = snapshot.candidates.find((item) => item.node.id === 'AAA')!
  const b = snapshot.candidates.find((item) => item.node.id === 'BBB')!
  assert.equal(a.metrics.criticalDepth, b.metrics.criticalDepth)
  assert.equal(a.metrics.blockerRelief, 1)
  assert.equal(b.metrics.blockerRelief, 0.5)
  assert.equal(ids(snapshot).indexOf('AAA') < ids(snapshot).indexOf('BBB'), true)
})

test('downstream reach breaks remaining structural ties', () => {
  const nodes = [
    planned('AAA'),
    planned('BBB'),
    planned('A-X', ['AAA', 'LOCK-A']),
    planned('A-Y', ['A-X']),
    planned('A-Z', ['A-X']),
    planned('B-X', ['BBB', 'LOCK-B']),
    planned('B-Y', ['B-X']),
    planned('LOCK-A'),
    planned('LOCK-B')
  ]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  const a = snapshot.candidates.find((item) => item.node.id === 'AAA')!
  const b = snapshot.candidates.find((item) => item.node.id === 'BBB')!
  assert.equal(a.metrics.criticalDepth, b.metrics.criticalDepth)
  assert.equal(a.metrics.blockerRelief, b.metrics.blockerRelief)
  assert.equal(a.metrics.downstreamReach > b.metrics.downstreamReach, true)
  assert.equal(ids(snapshot).indexOf('AAA') < ids(snapshot).indexOf('BBB'), true)
})

test('owner load is only a late tie-breaker and spreads equivalent work', () => {
  const nodes = [
    planned('IAS-A', [], ['IAS']),
    planned('OAS-A', [], ['OAS']),
    started('IAS-BUSY', ['IAS'])
  ]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  assert.deepEqual(ids(snapshot).slice(0, 2), ['OAS-A', 'IAS-A'])
  assert.equal(snapshot.candidates.find((item) => item.node.id === 'IAS-A')?.metrics.ownerLoad, 1)
  assert.equal(snapshot.candidates.find((item) => item.node.id === 'OAS-A')?.metrics.ownerLoad, 0)
})

test('claimed and grace nodes are excluded while expired and released claims do not block dispatch', () => {
  const nodes = [planned('LIVE'), planned('GRACE'), planned('EXPIRED'), planned('RELEASED')]
  const live = claim('LIVE')
  const grace = claim('GRACE', 'worker', new Date('2026-10-29T06:59:30.000Z'), 120)
  const expired = claim('EXPIRED', 'worker', new Date('2026-10-29T06:00:00.000Z'), 120)
  const releasedBase = claim('RELEASED')
  const released = releaseClaim(releasedBase, releasedBase.leaseId, now, 'abandoned', releasedBase.generation)

  const snapshot = buildDispatchSnapshot(nodes, [live, grace, expired, released], now)
  assert.deepEqual(ids(snapshot).sort(), ['EXPIRED', 'RELEASED'])
  assert.deepEqual(snapshot.claimed.map((item) => item.node.id).sort(), ['GRACE', 'LIVE'])
})

test('manual READY work is visible but never a default candidate', () => {
  const nodes = [planned('AUTO'), planned('PHYSICAL', [], ['PHY'], 'manual')]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  assert.deepEqual(ids(snapshot), ['AUTO'])
  assert.equal(snapshot.manualReady[0].node.id, 'PHYSICAL')
  assert.match(snapshot.manualReady[0].reason, /directed execution/)
})

test('active unclaimed work is a handoff signal rather than a default candidate', () => {
  const nodes = [planned('READY'), started('ACTIVE')]
  const snapshot = buildDispatchSnapshot(nodes, [], now)
  assert.deepEqual(ids(snapshot), ['READY'])
  assert.deepEqual(snapshot.activeUnclaimed.map((node) => node.id), ['ACTIVE'])
})

test('invalid known and unknown live claims make automatic dispatch unsafe', async () => {
  const nodes = [planned('READY'), planned('BLOCKED', ['UPSTREAM']), planned('UPSTREAM')]
  const invalidKnown = claim('BLOCKED')
  const invalidUnknown = claim('REMOVED')
  const snapshot = buildDispatchSnapshot(nodes, [invalidKnown, invalidUnknown], now)
  assert.equal(snapshot.safeForAutomaticClaim, false)
  assert.deepEqual(snapshot.invalidLiveClaims.map((item) => item.node).sort(), ['BLOCKED', 'REMOVED'])

  const store = new MemoryClaimStore(now, [invalidKnown, invalidUnknown])
  await assert.rejects(
    claimNextFromStore(store, nodes, { holder: { kind: 'chatgpt', label: 'worker' } }),
    DispatchUnsafeError
  )
  assert.equal(store.mutations, 0)
})

test('workstream filter narrows candidates without widening manual eligibility', () => {
  const nodes = [
    planned('IAS-A', [], ['IAS']),
    planned('OAS-A', [], ['OAS']),
    planned('IAS-MANUAL', [], ['IAS'], 'manual')
  ]
  const snapshot = buildDispatchSnapshot(nodes, [], now, { workstream: 'IAS' })
  assert.deepEqual(ids(snapshot), ['IAS-A'])
  assert.deepEqual(snapshot.manualReady.map((item) => item.node.id), ['IAS-MANUAL'])
})

test('missing live dispatch policy is rejected by validation and fail-closed by dispatcher', async () => {
  const nodes: ControlNode[] = [{
    id: 'NO-POLICY',
    owners: ['PCO'],
    title: 'missing policy',
    dependencies: [],
    lifecycle: 'planned',
    closeoutEvidence: []
  }]
  assert.equal(
    validateGraphStructure(nodes).some((failure) => failure.includes('live without an explicit agent dispatch policy')),
    true
  )

  const snapshot = buildDispatchSnapshot(nodes, [], now)
  assert.equal(snapshot.safeForAutomaticClaim, false)
  assert.equal(snapshot.policyErrors[0].node, 'NO-POLICY')

  const store = new MemoryClaimStore(now)
  await assert.rejects(
    claimNextFromStore(store, nodes, { holder: { kind: 'chatgpt', label: 'worker' } }),
    DispatchUnsafeError
  )
  assert.equal(store.mutations, 0)
})

test('manual live policy without reason is rejected', () => {
  const nodes: ControlNode[] = [{
    id: 'MANUAL-NO-REASON',
    owners: ['PCO'],
    title: 'manual',
    dependencies: [],
    lifecycle: 'planned',
    agentDispatch: { mode: 'manual' },
    closeoutEvidence: []
  }]
  assert.equal(
    validateGraphStructure(nodes).some((failure) => failure.includes('manual dispatch without a durable reason')),
    true
  )
})

test('claim-next reranks after losing the top candidate race and takes the new best node', async () => {
  const nodes = [planned('AAA'), planned('BBB')]
  const store = new MemoryClaimStore(now)
  store.loseFirstCreateFor = 'AAA'

  const result = await claimNextFromStore(store, nodes, {
    holder: { kind: 'chatgpt', label: 'ours' },
    leaseId: 'our-lease',
    maxInfrastructureRetries: 0,
    maxSelectionRaceRetries: 3
  })

  assert.equal(result.selected?.node.id, 'BBB')
  assert.equal(result.claim?.stored.record.node, 'BBB')
  assert.equal(result.selectionRaces, 1)
  assert.equal(store.records.get('AAA')?.record.holder.label, 'competitor')
  assert.equal(store.records.get('BBB')?.record.holder.label, 'ours')
})

test('no eligible candidate produces no mutation', async () => {
  const nodes = [planned('MANUAL', [], ['PHY'], 'manual')]
  const store = new MemoryClaimStore(now)
  const result = await claimNextFromStore(store, nodes, { holder: { kind: 'chatgpt', label: 'worker' } })
  assert.equal(result.selected, null)
  assert.equal(result.claim, null)
  assert.equal(store.mutations, 0)
})

for (const temporal of ['live', 'grace'] as const) {
  test(`claim-next reranks when a ${temporal} competitor appears between listing and acquisition read`, async () => {
    const store = new MemoryClaimStore(now)
    const competitor = claim('AAA', 'competitor', temporal === 'live' ? now : new Date(now.getTime() - 120.5 * 60_000), 120)
    const read = store.read.bind(store)
    let raced = false
    store.read = async node => {
      if (node === 'AAA' && !raced) {
        raced = true
        store.records.set(node, { record: competitor, sha: 'competitor-before-read' })
      }
      return read(node)
    }
    const result = await claimNextFromStore(store, [planned('AAA'), planned('BBB')], {
      holder: { kind: 'codex', label: 'ours' }, leaseId: 'our-lease'
    })
    assert.equal(result.selected?.node.id, 'BBB')
    assert.equal(result.selectionRaces, 1)
    assert.equal(store.mutations, 1)
    assert.equal(store.records.get('AAA')?.record.leaseId, competitor.leaseId)
    assert.equal(store.records.get('BBB')?.record.leaseId, 'our-lease')
  })
}

test('a lost read-stage selection returns an empty frontier when no alternative remains', async () => {
  const store = new MemoryClaimStore(now)
  const read = store.read.bind(store)
  store.read = async node => {
    store.records.set(node, { record: claim(node, 'competitor'), sha: 'competitor-before-read' })
    return read(node)
  }
  const result = await claimNextFromStore(store, [planned('AAA')], { holder: { kind: 'codex' } })
  assert.equal(result.selected, null)
  assert.equal(result.claim, null)
  assert.equal(result.selectionRaces, 1)
  assert.equal(store.mutations, 0)
})

test('read-stage occupancy races retain the selection retry bound', async () => {
  const store = new MemoryClaimStore(now, [claim('AAA', 'competitor')])
  let lists = 0
  store.list = async () => { lists += 1; return { claims: [], observedAt: now } }
  await assert.rejects(claimNextFromStore(store, [planned('AAA')], {
    holder: { kind: 'codex' }, maxSelectionRaceRetries: 1
  }), error => error instanceof ClaimConflictError && /after 2 conflict/.test(error.message))
  assert.equal(lists, 2)
  assert.equal(store.mutations, 0)
})

test('a failed fresh acquisition read is not treated as a selection race', async () => {
  const store = new MemoryClaimStore(now)
  const unavailable = new ClaimStoreUnavailableError('simulated unavailable fresh read')
  let reads = 0
  store.read = async () => { reads += 1; throw unavailable }
  await assert.rejects(claimNextFromStore(store, [planned('AAA'), planned('BBB')], {
    holder: { kind: 'codex' }
  }), error => error === unavailable)
  assert.equal(reads, 1)
  assert.equal(store.mutations, 0)
})

class MemoryClaimStore implements ClaimStore {
  records = new Map<string, StoredClaim>()
  mutations = 0
  loseFirstCreateFor?: string
  private lost = false
  private sequence = 0

  constructor(
    private readonly at: Date,
    initial: readonly ClaimRecord[] = []
  ) {
    for (const record of initial) this.records.set(record.node, { record, sha: this.nextSha() })
  }

  private nextSha(): string {
    this.sequence += 1
    return `sha-${this.sequence}`
  }

  async read(node: NodeId): Promise<ClaimReadResult> {
    return { stored: this.records.get(node) ?? null, observedAt: this.at }
  }

  async create(node: NodeId, record: ClaimRecord): Promise<ClaimWriteResult> {
    this.mutations += 1
    if (this.loseFirstCreateFor === node && !this.lost) {
      this.lost = true
      const competitor = claim(node, 'competitor')
      this.records.set(node, { record: competitor, sha: this.nextSha() })
      throw new ClaimConflictError(`${node} concurrent winner`)
    }
    if (this.records.has(node)) throw new ClaimConflictError(`${node} exists`)
    const stored = { record, sha: this.nextSha() }
    this.records.set(node, stored)
    return { stored, observedAt: this.at }
  }

  async update(node: NodeId, expectedSha: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    this.mutations += 1
    const before = this.records.get(node)
    if (!before || before.sha !== expectedSha) throw new ClaimConflictError(`${node} stale sha`)
    const stored = { record, sha: this.nextSha() }
    this.records.set(node, stored)
    return { stored, observedAt: this.at }
  }

  async list(): Promise<{ claims: readonly StoredClaim[]; observedAt: Date }> {
    return { claims: [...this.records.values()], observedAt: this.at }
  }
}


test('expired work retains recovery evidence in dispatcher candidates without changing ranking', () => {
  const node = planned('RECOVERY')
  const previous = {...claim('RECOVERY', 'silent', new Date(now.getTime()-3*3600000)), branch:'work/preserved', checkpoint:{evidence:'PR #123',next:'Inspect tests'}}
  const snapshot = buildDispatchSnapshot([node], [previous], now)
  assert.equal(snapshot.candidates[0].previousClaim?.checkpoint?.evidence, 'PR #123')
  assert.equal(snapshot.candidates[0].previousClaim?.branch, 'work/preserved')
})

test('started self-service work with a preserved branch and actionable checkpoint can be redispatched', async () => {
  const first = {...claim('ACTIVE', 'old', new Date(now.getTime() - 3 * 3600000)),
    branch: 'work/old-active',
    checkpoint: { evidence: 'PR #17 validated on old head', next: 'Check current main' }}
  const nodes = [started('ACTIVE'), planned('OTHER')]
  const snapshot = buildDispatchSnapshot(nodes, [first], now)
  assert.equal(snapshot.candidates.find(c => c.node.id === 'ACTIVE')?.resumeActive, true)
  assert.equal(snapshot.activeUnclaimed.length, 0)
  const store = new MemoryClaimStore(now, [first])
  const result = await claimNextFromStore(store, nodes, {holder:{kind:'chatgpt'}, branch:'work/successor'})
  assert.equal(result.selected?.node.id, 'ACTIVE')
  assert.equal(result.claim?.stored.record.predecessor?.leaseId, first.leaseId)
  assert.equal(result.claim?.stored.record.predecessor?.branch, 'work/old-active')
  assert.equal(result.claim?.stored.record.checkpoint, undefined)
})

test('started work without predecessor evidence or with manual policy is never automatically inherited', () => {
  const manual: ControlNode = {...started('MANUAL'), agentDispatch:{mode:'manual',reason:'Owner review'}}
  const noCheckpoint = {...claim('ACTIVE', 'old', new Date(now.getTime() - 3 * 3600000)), branch:'work/old'}
  const evidence = {...claim('MANUAL', 'old', new Date(now.getTime() - 3 * 3600000)),
    branch:'work/manual', checkpoint:{evidence:'PR #99',next:'Review'}}
  const snapshot = buildDispatchSnapshot([started('ACTIVE'),manual,planned('OTHER')],[noCheckpoint,evidence],now)
  assert.deepEqual(ids(snapshot), ['OTHER'])
  assert.deepEqual(snapshot.activeUnclaimed.map(n=>n.id), ['ACTIVE','MANUAL'])
})

test('dispatcher rechecks active predecessor evidence at CAS boundary after a racing update', async () => {
  const previous = {...claim('ACTIVE', 'old', new Date(now.getTime() - 3 * 3600000)),
    branch:'work/old', checkpoint:{evidence:'PR #100',next:'Resume'}}
  const nodes = [started('ACTIVE'),planned('OTHER')]
  const store = new MemoryClaimStore(now,[previous])
  const originalRead = store.read.bind(store)
  let changed = false
  store.read = async (node: NodeId) => {
    if (node === 'ACTIVE' && !changed) {
      changed = true
      store.records.set(node,{record:{...previous,checkpoint:undefined},sha:'raced-remote'})
    }
    return originalRead(node)
  }
  const result = await claimNextFromStore(store,nodes,{
    holder:{kind:'chatgpt'},branch:'work/successor',maxSelectionRaceRetries:3
  })
  assert.equal(result.selected?.node.id,'OTHER')
  assert.equal(store.records.get('ACTIVE')?.record.leaseId,previous.leaseId)
  assert.equal(store.mutations,1)
  assert.equal(result.selectionRaces,1)
})

test('active successor with no own checkpoint remains safely resumable after a second cutoff',()=>{
 const earlier={...claim('ACTIVE','old',new Date(now.getTime()-3*3600000)),
   branch:'work/original',checkpoint:{evidence:'PR #11',next:'Validate'}}
 const next={...claim('ACTIVE','replacement',new Date(now.getTime()-2*3600000),45,2),
   branch:'work/empty-successor',checkpoint:undefined,
   predecessor:{leaseId:earlier.leaseId,generation:1,branch:'work/original',checkpoint:earlier.checkpoint},
   recoverySource:{leaseId:earlier.leaseId,generation:1,branch:'work/original',checkpoint:earlier.checkpoint}}
 const r=buildDispatchSnapshot([started('ACTIVE')],[next],now)
 assert.equal(r.candidates[0]?.node.id,'ACTIVE')
 assert.equal(r.candidates[0]?.resumeActive,true)
})


test('barbell handover: independent chats and a returning commander share one lease frontier',async()=>{
  const nodes=[
    ...['AAA','BBB','CCC','DDD','EEE','FFF','GGG','HHH'].map(id=>planned(id)),
    started('RECOVER'),
    planned('OWNER-GATE',[],['PCO'],'manual')
  ]
  const staleTime=new Date(now.getTime()-3*3600000)
  const rwtOld={...claim('RECOVER','astra',staleTime),branch:'work/previous-astra',
    checkpoint:{evidence:'Pushed PR #123',next:'Revalidate against main'}}
  const previous=[
    claim('AAA','astra-live'), claim('BBB','astra-live'),
    claim('CCC','astra-expired',staleTime),
    releaseClaim(claim('DDD','astra-released'),'lease-DDD-1',now,'handoff',1),
    rwtOld
  ]
  const store=new MemoryClaimStore(now,previous)
  const fallback=await Promise.all([1,2,3,4].map(n=>claimNextFromStore(store,nodes,{
    holder:{kind:'chatgpt',label:'regular-'+n},branch:'work/regular-'+n
  })))
  const fallbackNodes=fallback.map(r=>r.claim?.stored.record.node)
  assert.equal(new Set(fallbackNodes).size,4)
  assert.deepEqual([...fallbackNodes].sort(),['CCC','DDD','EEE','FFF'])
  assert.equal(store.records.get('AAA')?.record.holder.label,'astra-live')
  assert.equal(store.records.get('BBB')?.record.holder.label,'astra-live')
  assert.equal(store.records.get('CCC')?.record.generation,2)

  const commander=await Promise.all([1,2,3].map(n=>claimNextFromStore(store,nodes,{
    holder:{kind:'chatgpt',label:'astra-worker-'+n},branch:'work/astra-return-'+n
  })))
  assert.deepEqual(commander.map(r=>r.claim?.stored.record.node).sort(),['GGG','HHH','RECOVER'])
  const recovered=store.records.get('RECOVER')?.record
  assert.equal(recovered?.generation,2)
  assert.equal(recovered?.predecessor?.branch,'work/previous-astra')
  assert.equal(recovered?.checkpoint,undefined)
  assert.equal((await claimNextFromStore(store,nodes,{
    holder:{kind:'chatgpt',label:'extra'}
  })).claim,null)

  const reclaimed=store.records.get('CCC')!
  await store.update('CCC',reclaimed.sha,releaseClaim(reclaimed.record,reclaimed.record.leaseId,now,'handoff',2))
  const next=await claimNextFromStore(store,nodes,{
    holder:{kind:'chatgpt',label:'astra-after-handoff'},branch:'work/astra-after-handoff'
  })
  assert.equal(next.claim?.stored.record.node,'CCC')
  assert.equal(next.claim?.stored.record.generation,3)
  assert.equal(store.records.get('OWNER-GATE'),undefined)
})
