import assert from 'node:assert/strict'
import test from 'node:test'
import { createClaimRecord } from './claims.js'
import type { VerifiedLease } from './claim-store.js'
import { publicationPreflight, renderPublicationReport } from './publication-preflight.js'

const head = 'a'.repeat(40), main = 'b'.repeat(40)
const now = new Date('2026-10-29T12:00:00Z')
const target = { repository: 'o/r', branch: 'work/test', head, leaseId: 'lease', generation: 1 }
function fixture() {
  const calls: string[] = []
  const record = createClaimRecord({ node: 'PCO-TEST', generation: 1, leaseId: 'lease', holder: {kind:'chatgpt'}, branch: target.branch, now })
  let count = 0
  return {
    calls,
    mutate: (_verified: VerifiedLease, _count: number) => {},
    git(args: readonly string[]) {
      calls.push(args.join(' '))
      if (args[0] === 'rev-parse') return args[1] === 'origin/main' ? main : head
      return ''
    },
    async verify(): Promise<VerifiedLease> {
      calls.push('verify')
      const verified: VerifiedLease = { stored: {record: {...record}, sha: `claim-${++count}`}, observedAt: new Date(now.getTime() + count * 1000), temporal: 'live' }
      this.mutate(verified, count)
      return verified
    }
  }
}

test('report binds the checked target and final ownership observation without claiming CI or fencing', async () => {
  const f = fixture()
  const result = await publicationPreflight(target, {git: f.git.bind(f), verify: f.verify.bind(f)})
  assert.equal(result.observedAt, '2026-10-29T12:00:02.000Z')
  assert.equal(result.publication.claimSha, 'claim-2')
  assert.deepEqual(result.publication, {repository:'o/r', branch:'work/test', head, main, claimSha:'claim-2', ci:'not-checked', atomicFence:false})
  assert.equal(f.calls[0], 'verify')
  assert.equal(f.calls.at(-1), 'verify')
  const report = renderPublicationReport(result)
  for (const value of [head, main, 'generation 1', 'CI not checked', 'not an atomic merge fence']) assert.ok(report.includes(value))
  assert.doesNotMatch(report, /cleared|CI passed|merged successfully/i)
})

test('dirty trees, wrong heads and failed ancestry never produce a successful report', async () => {
  for (const failure of ['dirty', 'remote', 'local', 'ancestry']) {
    const f = fixture()
    const git = (args: readonly string[]) => {
      if (failure === 'dirty' && args[0] === 'status') return ' M source.ts'
      if (args[0] === 'rev-parse' && ((failure === 'remote' && args[1] === 'origin/work/test') || (failure === 'local' && args[1] === 'HEAD'))) return 'c'.repeat(40)
      if (failure === 'ancestry' && args[0] === 'merge-base') throw new Error('main advanced')
      return f.git(args)
    }
    await assert.rejects(publicationPreflight(target, {git, verify:f.verify.bind(f)}))
    assert.equal(f.calls.filter(c => c === 'verify').length, 1)
  }
})

test('superseded, released, near-expiry and uncertain-clock workers fail the final observation', async () => {
  for (const failure of ['generation', 'lease', 'branch', 'released', 'runway', 'clock', 'unavailable']) {
    const f = fixture()
    f.mutate = (v, count) => {
      if (count !== 2) return
      if (failure === 'generation') v.stored.record.generation++
      if (failure === 'lease') v.stored.record.leaseId = 'replacement'
      if (failure === 'branch') v.stored.record.branch = 'other'
      if (failure === 'released') v.stored.record.state = 'released'
      if (failure === 'runway') v.observedAt = new Date(now.getTime() + 41 * 60000)
      if (failure === 'clock') v.stored.record.heartbeatAt = new Date(now.getTime() + 3 * 60000).toISOString()
      if (failure === 'unavailable') throw new Error('ownership unknown')
    }
    await assert.rejects(publicationPreflight(target, {git:f.git.bind(f), verify:f.verify.bind(f)}))
  }
})

test('a moving remote-tracking ref cannot change the main identity between ancestry check and report', async () => {
  const f = fixture()
  let current = main
  const git = (args: readonly string[]) => {
    if (args[0] === 'rev-parse' && args[1] === 'origin/main') return current
    if (args[0] === 'merge-base') {
      current = 'c'.repeat(40)
      assert.deepEqual(args, ['merge-base', '--is-ancestor', main, head])
    }
    return f.git(args)
  }
  const result = await publicationPreflight(target, {git, verify:f.verify.bind(f)})
  assert.equal(result.publication.main, main)
  assert.notEqual(result.publication.main, current)
})

test('invalid publication identities are rejected before contacting the store', async () => {
  const f = fixture()
  for (const invalid of [{...target, head:'short'}, {...target, generation:0}, {...target, generation:1.5}]) {
    await assert.rejects(publicationPreflight(invalid, {git:f.git.bind(f), verify:f.verify.bind(f)}))
  }
  assert.deepEqual(f.calls, [])
})
