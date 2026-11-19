import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'
import { readPinnedPublicationAsset } from './fonts.js'

const pin = {
  repo: 'fixture/fonts', commit: 'fixed', path: 'fixture.ttf', outputName: 'fixture.ttf',
  // Git's object ID for the literal bytes "hello\n"; no network is used by these tests.
  gitBlobSha: 'ce013625030ba8dba906f756967f9e9ca394464a'
}
async function cache(t: TestContext): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'publication-font-cache-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return root
}

test('a cold pinned asset is cached and a warm read works without network access', async (t) => {
  const root = await cache(t)
  let requests = 0
  const request: typeof fetch = async () => { requests += 1; return new Response('hello\n') }
  assert.equal((await readPinnedPublicationAsset(pin, root, request)).toString(), 'hello\n')
  assert.equal(requests, 1)
  assert.equal((await readPinnedPublicationAsset(pin, root, async () => {
    throw new Error('Network unavailable: a valid cache must work offline')
  })).toString(), 'hello\n')
  assert.deepEqual(await readdir(root), [pin.gitBlobSha])
})

test('a partial or corrupt restored cache is replaced only by bytes matching the upstream pin', async (t) => {
  const root = await cache(t)
  const path = join(root, pin.gitBlobSha)
  await writeFile(path, 'partial')
  let requests = 0
  const bytes = await readPinnedPublicationAsset(pin, root, async () => {
    requests += 1
    return new Response('hello\n')
  })
  assert.equal(requests, 1)
  assert.equal(bytes.toString(), 'hello\n')
  assert.equal((await readFile(path)).toString(), 'hello\n')
  assert.deepEqual(await readdir(root), [pin.gitBlobSha])
})

test('invalid downloads and network failures never turn a corrupt cache into accepted evidence', async (t) => {
  const root = await cache(t)
  const path = join(root, pin.gitBlobSha)
  await writeFile(path, 'partial')
  await assert.rejects(readPinnedPublicationAsset(pin, root, async () => new Response('wrong bytes')), /integrity failure/)
  await assert.rejects(readPinnedPublicationAsset(pin, root, async () => new Response('', { status: 503 })), /HTTP 503/)
  await assert.rejects(readPinnedPublicationAsset(pin, root, async () => { throw new Error('Offline') }), /Offline/)
  assert.equal((await readFile(path)).toString(), 'partial')
})
