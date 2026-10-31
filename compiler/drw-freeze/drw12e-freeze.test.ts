import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

type Pin = { version: string; path: string; gitObject: string }
type View = { id: string; version: string; files: string[] }
type FreezeManifest = {
  programme: string
  packet: string
  release: string
  baseCommit: string
  renderer: Pin
  style: Pin
  plateRegister: Pin
  filePins: Record<string, string>
  views: View[]
}

const manifest = JSON.parse(
  readFileSync(new URL('./drw12e-freeze.json', import.meta.url), 'utf8')
) as FreezeManifest

const gitObjectAtHead = (path: string): string =>
  execFileSync('git', ['rev-parse', `HEAD:${path}`], { encoding: 'utf8' }).trim()

const assertPinned = (path: string, expected: string): void => {
  assert.equal(
    gitObjectAtHead(path),
    expected,
    `${path} changed after DRW release; deliberately version and re-freeze the drawing contract`
  )
}

test('DRW-12E freezes the shared renderer, style and Part IV plate register', () => {
  assert.equal(manifest.programme, 'DRW')
  assert.equal(manifest.packet, 'DRW-12E')
  assert.equal(manifest.release, 'drawing-publication-v1')

  assertPinned(manifest.renderer.path, manifest.renderer.gitObject)
  assertPinned(manifest.style.path, manifest.style.gitObject)
  assertPinned(manifest.plateRegister.path, manifest.plateRegister.gitObject)
})

test('DRW-12E records exactly seventeen released RH01 view specifications', () => {
  assert.equal(manifest.views.length, 17)
  assert.equal(new Set(manifest.views.map((view) => view.id)).size, 17)
  assert.equal(new Set(manifest.views.map((view) => view.version)).size, 17)

  const referencedFiles = new Set(manifest.views.flatMap((view) => view.files))
  assert.deepEqual(
    [...referencedFiles].sort(),
    Object.keys(manifest.filePins).sort(),
    'filePins must be exactly the production modules referenced by the released view specifications'
  )

  for (const view of manifest.views) {
    assert.ok(view.files.length > 0, `${view.id} has no frozen production module`)
    for (const path of view.files) {
      const expected = manifest.filePins[path]
      assert.ok(expected, `${view.id} references unpinned module ${path}`)
      assertPinned(path, expected)
    }
  }
})

test('DRW-12E freeze identities are full Git object IDs, not friendly version labels alone', () => {
  const objects = [
    manifest.renderer.gitObject,
    manifest.style.gitObject,
    manifest.plateRegister.gitObject,
    ...Object.values(manifest.filePins)
  ]

  for (const object of objects) {
    assert.match(object, /^[0-9a-f]{40}$/)
  }
})
