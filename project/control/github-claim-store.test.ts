import assert from 'node:assert/strict'
import test from 'node:test'
import { ClaimStoreUnavailableError } from './claim-store.js'
import { claimPath, claimsBranch, createClaimRecord, releaseClaim, serializeClaimRecord, type ClaimRecord } from './claims.js'
import { claimNextFromStore } from './dispatch.js'
import { GitHubClaimStore } from './github-claim-store.js'
import { gitBlobSha } from './git-connector-claim-store.js'
import type { ControlNode } from './types.js'

const now = new Date('2026-10-31T20:00:00Z')
const firstCommit = 'a'.repeat(40)
const secondCommit = 'b'.repeat(40)
const repository = 'fixture/architecture'
const record = (node: string, generation = 1, at = now): ClaimRecord => createClaimRecord({
  node, generation, leaseId: `lease-${node}-${generation}`, holder: { kind: 'codex' }, now: at
})
const entry = (value: ClaimRecord) => ({ type: 'file', path: claimPath(value.node), sha: gitBlobSha(serializeClaimRecord(value)) })
const blob = (raw: string) => ({ sha: gitBlobSha(raw), encoding: 'base64', content: Buffer.from(raw).toString('base64') })
const response = (value: unknown, status = 200, at = now) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json', Date: at.toUTCString() }
})
const branchRequest = (url: URL) => url.pathname.endsWith('/branches/runtime%2Fclaims')
const directoryRequest = (url: URL) => url.pathname.endsWith('/contents/.pco/claims')
const blobRequest = (url: URL) => url.pathname.includes('/git/blobs/')

test('native listing pins a commit and blob set while subsequent reads and listings stay fresh', async t => {
  const original = [record('AAA'), record('BBB')]
  const changed = [record('AAA', 2), record('BBB', 2)]
  const blobs = new Map([...original, ...changed].map(value => {
    const valueBlob = blob(serializeClaimRecord(value))
    return [valueBlob.sha, valueBlob]
  }))
  let branchReads = 0
  let advanced = false
  const nextTime = new Date(now.getTime() + 60_000)
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    const url = new URL(input)
    if (branchRequest(url)) {
      branchReads += 1
      return response({ commit: { sha: advanced ? secondCommit : firstCommit } }, 200, advanced ? nextTime : now)
    }
    if (directoryRequest(url)) {
      const ref = url.searchParams.get('ref')
      assert.ok(ref === firstCommit || ref === secondCommit)
      advanced = true // A writer advances runtime/claims after the captured branch response.
      return response((ref === firstCommit ? original : changed).map(entry), 200, nextTime)
    }
    if (blobRequest(url)) return response(blobs.get(url.pathname.split('/').at(-1)!), 200, nextTime)
    assert.equal(url.pathname, `/repos/${repository}/contents/${claimPath('AAA')}`)
    assert.equal(url.searchParams.get('ref'), claimsBranch)
    return response({ ...entry(changed[0]), ...blob(serializeClaimRecord(changed[0])) }, 200, nextTime)
  })
  const store = new GitHubClaimStore(repository)
  const first = await store.list()
  assert.deepEqual(first.claims.map(value => value.record.generation), [1, 1])
  assert.equal(first.observedAt.toISOString(), now.toISOString())
  const fresh = await store.read('AAA')
  assert.equal(fresh.stored?.record.generation, 2)
  assert.equal(fresh.observedAt.toISOString(), nextTime.toISOString())
  const second = await store.list()
  assert.deepEqual(second.claims.map(value => value.record.generation), [2, 2])
  assert.equal(second.observedAt.toISOString(), nextTime.toISOString())
  assert.equal(branchReads, 2)
})

test('89 claim blobs use eight concurrent readers and twelve waves without reordering the snapshot', async t => {
  const records = Array.from({ length: 89 }, (_, index) => record(`TST-${String(index).padStart(3, '0')}`))
  const blobs = new Map(records.map(value => { const valueBlob = blob(serializeClaimRecord(value)); return [valueBlob.sha, valueBlob] }))
  let requests = 0
  let active = 0
  let peak = 0
  let waves = 0
  const pending: { resolve: (response: Response) => void; value: unknown }[] = []
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    requests += 1
    const url = new URL(input)
    if (branchRequest(url)) return response({ commit: { sha: firstCommit } })
    if (directoryRequest(url)) return response(records.map(entry))
    assert.equal(blobRequest(url), true)
    active += 1
    peak = Math.max(peak, active)
    return new Promise<Response>(resolve => {
      pending.push({ resolve, value: blobs.get(url.pathname.split('/').at(-1)!) })
      if (pending.length === 1) setImmediate(() => {
        waves += 1
        const batch = pending.splice(0)
        active -= batch.length
        for (const item of batch) item.resolve(response(item.value))
      })
    })
  })
  const result = await new GitHubClaimStore(repository).list()
  assert.deepEqual(result.claims.map(value => value.record.node), records.map(value => value.node))
  assert.equal(requests, 91)
  assert.equal(peak, 8)
  assert.equal(waves, 12)
  assert.equal(active, 0)
  t.diagnostic('89 records: 91 HTTP requests, maximum 8 concurrent blob reads, 12 blob waves plus 2 snapshot requests.')
})

test('acquisition after a listing uses the fresh selected record SHA and generation for CAS', async t => {
  const expired = record('AAA', 1, new Date(now.getTime() - 3 * 60 * 60_000))
  const newer = record('AAA', 2)
  const released = releaseClaim(newer, newer.leaseId, now, 'handoff', 2)
  const node: ControlNode = { id: 'AAA', owners: ['ACO'], title: 'Synthetic ready packet', dependencies: [],
    lifecycle: 'planned', agentDispatch: { mode: 'self-service' }, closeoutEvidence: [] }
  let freshReads = 0
  let writes = 0
  t.mock.method(globalThis, 'fetch', async (input: string, options: RequestInit = {}) => {
    const url = new URL(input)
    if (branchRequest(url)) return response({ commit: { sha: firstCommit } })
    if (directoryRequest(url)) return response([entry(expired)])
    if (blobRequest(url)) return response(blob(serializeClaimRecord(expired)))
    assert.equal(url.pathname, `/repos/${repository}/contents/${claimPath('AAA')}`)
    if (options.method !== 'PUT') {
      freshReads += 1
      assert.equal(url.searchParams.get('ref'), claimsBranch)
      return response({ ...entry(released), ...blob(serializeClaimRecord(released)) })
    }
    writes += 1
    assert.equal(freshReads, 1)
    const write = JSON.parse(String(options.body))
    assert.equal(write.sha, entry(released).sha)
    assert.equal(write.branch, claimsBranch)
    const intended = Buffer.from(write.content, 'base64').toString('utf8')
    assert.equal(JSON.parse(intended).generation, 3)
    assert.equal(JSON.parse(intended).leaseId, 'new-worker')
    return response({ content: { sha: gitBlobSha(intended) } })
  })
  const result = await claimNextFromStore(new GitHubClaimStore(repository, 'synthetic-test-token'), [node], {
    holder: { kind: 'codex' }, leaseId: 'new-worker'
  })
  assert.equal(result.claim?.stored.record.generation, 3)
  assert.equal(freshReads, 1)
  assert.equal(writes, 1)
})

test('malformed or potentially truncated inventories fail closed before any blob fetch', async t => {
  const valid = entry(record('AAA'))
  for (const [name, listing] of [
    ['not an array', {}],
    ['missing path', [null]],
    ['duplicate node', [valid, valid]],
    ['invalid SHA', [{ ...valid, sha: 'invalid' }]],
    ['non-file claim', [{ ...valid, type: 'dir' }]],
    ['unsafe path', [{ ...valid, path: '.pco/claims/../AAA.json' }]],
    ['directory limit', Array.from({ length: 1000 }, () => ({ type: 'file', path: '.pco/claims/.store' }))]
  ] as const) {
    await t.test(name, async sub => {
      sub.mock.method(globalThis, 'fetch', async (input: string) => {
        const url = new URL(input)
        if (branchRequest(url)) return response({ commit: { sha: firstCommit } })
        assert.equal(directoryRequest(url), true, 'an invalid inventory must not launch blob requests')
        return response(listing)
      })
      await assert.rejects(new GitHubClaimStore(repository).list(), ClaimStoreUnavailableError)
    })
  }
})

test('missing, malformed and content-mismatched blobs never produce a partial claim listing', async t => {
  const raw = serializeClaimRecord(record('AAA'))
  const valid = blob(raw)
  for (const [name, pinnedSha, payload, status] of [
    ['missing blob', valid.sha, {}, 404],
    ['mismatched response SHA', valid.sha, { ...valid, sha: secondCommit }, 200],
    ['tampered bytes', valid.sha, { ...valid, content: Buffer.from(raw.replace('AAA', 'BBB')).toString('base64') }, 200],
    ['invalid JSON', gitBlobSha('{'), blob('{'), 200],
    ['wrong node', gitBlobSha(serializeClaimRecord(record('BBB'))), blob(serializeClaimRecord(record('BBB'))), 200]
  ] as const) {
    await t.test(name, async sub => {
      sub.mock.method(globalThis, 'fetch', async (input: string) => {
        const url = new URL(input)
        if (branchRequest(url)) return response({ commit: { sha: firstCommit } })
        if (directoryRequest(url)) return response([{ type: 'file', path: claimPath('AAA'), sha: pinnedSha }])
        assert.equal(blobRequest(url), true)
        return response(payload, status)
      })
      await assert.rejects(new GitHubClaimStore(repository).list(), ClaimStoreUnavailableError)
    })
  }
})

test('a missing branch fails closed and a missing directory in a known snapshot is empty', async t => {
  let branchExists = false
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    const url = new URL(input)
    if (branchRequest(url)) return response({ commit: { sha: firstCommit } }, branchExists ? 200 : 404)
    assert.equal(directoryRequest(url), true)
    assert.equal(url.searchParams.get('ref'), firstCommit)
    return response({}, 404)
  })
  const store = new GitHubClaimStore(repository)
  await assert.rejects(store.list(), ClaimStoreUnavailableError)
  branchExists = true
  const empty = await store.list()
  assert.deepEqual(empty.claims, [])
  assert.equal(empty.observedAt.toISOString(), now.toISOString())
})

test('invalid branch and directory JSON retain unavailable-store error classification', async t => {
  for (const stage of ['branch', 'directory', 'null-branch'] as const) {
    await t.test(stage, async sub => {
      sub.mock.method(globalThis, 'fetch', async (input: string) => {
        const url = new URL(input)
        if (branchRequest(url)) {
          if (stage === 'null-branch') return response(null)
          if (stage === 'directory') return response({ commit: { sha: firstCommit } })
        } else {
          assert.equal(directoryRequest(url), true)
        }
        return new Response('{', { status: 200 })
      })
      await assert.rejects(new GitHubClaimStore(repository).list(), ClaimStoreUnavailableError)
    })
  }
})
