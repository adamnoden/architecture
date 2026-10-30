import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { test } from 'node:test'
import { applyAdapter, dependenciesForAdapter } from './adapters.js'
import { primerPublicationEntries, publicationEntries } from './publication.js'

const repoRoot = resolve(import.meta.dirname, '..')
const digest = (value: string) => createHash('sha256').update(value).digest('hex')

function fixture(run: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), 'primer-ownership-'))
  try {
    cpSync(join(repoRoot, 'publication/primer'), join(root, 'publication/primer'), { recursive: true })
    cpSync(join(repoRoot, 'docs/patterns'), join(root, 'docs/patterns'), { recursive: true })
    run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function render(id: string, root: string): string {
  const entry = primerPublicationEntries.find((entry) => entry.id === id)!
  return applyAdapter(entry.adapter, readFileSync(join(repoRoot, entry.source), 'utf8'), {
    repoRoot, workSourceRoot: root
  })
}

test('authored Primer framing changes both emitted text and declared source identity', () => {
  fixture((root) => {
    for (const [id, source, phrase] of [
      ['primer-principles', 'constitution', 'The constitution retains'],
      ['primer-patterns', 'patterns', 'The governing constitution is intentionally'],
      ['primer-reference-house', 'reference-house', 'The layers constrain one another']
    ]) {
      const path = `publication/primer/${source}.md`
      const entry = primerPublicationEntries.find((entry) => entry.id === id)!
      assert.ok(dependenciesForAdapter(entry.adapter).includes(path))
      const before = readFileSync(join(root, path), 'utf8')
      const output = render(id, root)
      const changed = before.replace(phrase, 'AUTHORED REVIEW PROBE')
      assert.notEqual(changed, before)
      writeFileSync(join(root, path), changed)
      assert.notEqual(digest(changed), digest(before))
      assert.notEqual(render(id, root), output)
      assert.ok(render(id, root).includes('AUTHORED REVIEW PROBE'))
    }
  })
})

test('the complete pattern map depends on metadata beyond its six expanded examples', () => {
  fixture((root) => {
    const entry = publicationEntries.find((entry) => entry.patternId === 'PAT-002')!
    assert.ok(dependenciesForAdapter('primer-patterns').includes(entry.source))
    const path = join(root, entry.source)
    const before = readFileSync(path, 'utf8')
    const output = render('primer-patterns', root)
    const changed = before.replace(/^title:.*$/m, 'title: Authored pattern title probe')
    assert.notEqual(changed, before)
    writeFileSync(path, changed)
    assert.notEqual(render('primer-patterns', root), output)
    assert.ok(render('primer-patterns', root).includes('Authored pattern title probe'))
  })
})

test('missing, duplicated or unknown composition slots fail rather than drop authored material', () => {
  fixture((root) => {
    const path = join(root, 'publication/primer/constitution.md')
    const source = readFileSync(path, 'utf8')
    const slot = '<!-- primer:constraints -->'
    for (const changed of [source.replace(slot, ''), source.replace(slot, slot + slot), source + '\n<!-- primer:unknown -->']) {
      writeFileSync(path, changed)
      assert.throws(() => render('primer-principles', root), /expected one|unknown Primer/)
    }
  })
})
