import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
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
    for (const source of ['docs/manuscript/governing-principles.md', 'docs/reference-house/README.md',
      'docs/reference-house/current-house-basis.md', 'project/owner-house-charter.md']) {
      mkdirSync(dirname(join(root, source)), { recursive: true })
      copyFileSync(join(repoRoot, source), join(root, source))
    }
    run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

function render(id: string, root: string): string {
  const entry = primerPublicationEntries.find((entry) => entry.id === id)!
  return applyAdapter(entry.adapter, readFileSync(join(existsSync(join(root, entry.source)) ? root : repoRoot, entry.source), 'utf8'), {
    repoRoot, workSourceRoot: root
  })
}

test('authored Primer framing changes both emitted text and declared source identity', () => {
  fixture((root) => {
    for (const [id, source, phrase] of [
      ['primer-principles', 'constitution', '# Governing constitution'],
      ['primer-patterns', 'patterns', '# From constitution to patterns'],
      ['primer-reference-house', 'reference-house', '# The Reference House']
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

test('Primer preserves every canonical rule and consequential later explanations', () => {
  fixture((root) => {
    const output = render('primer-principles', root)
    const source = readFileSync(join(root, 'docs/manuscript/governing-principles.md'), 'utf8')
    const rules = [...source.matchAll(/^## (\d+)\. .+\n\n(\*\*[^\n]+\*\*)/gm)]
    assert.equal(rules.length, 11)
    for (const [, , rule] of rules) assert.ok(output.includes(rule))
    for (const phrase of ['change in occupants', 'reduced mobility', 'incoming variation',
      'outside the weather envelope', 'ordinary competent trade', 'Permanence carries',
      'future climate', 'siting, level, separation', 'loss of software']) {
      assert.ok(output.includes(phrase), `Missing consequential doctrine: ${phrase}`)
    }
    const path = join(root, 'docs/manuscript/governing-principles.md')
    writeFileSync(path, source.replace('Foreseeable change includes', 'A changed source selection includes'))
    assert.throws(() => render('primer-principles', root), /expected one source sentence/)
  })
})

test('Primer preserves pattern qualifications and derives evidence classifications', () => {
  fixture((root) => {
    const output = render('primer-patterns', root)
    for (const phrase of ['several adjacent controlled crossings', 'ordinary engineered opening',
      'A utility, laundry', 'without reconstructing the opening', 'where it bears',
      'principal isolation', 'Evidence: proposed.']) assert.ok(output.includes(phrase), phrase)
    assert.ok(!output.includes('**Problem.** These rooms'))
    const path = join(root, 'docs/patterns/physical-service-index.md')
    writeFileSync(path, readFileSync(path, 'utf8').replace('evidence: proposed', 'evidence: supported'))
    assert.ok(!render('primer-patterns', root).includes('Evidence: proposed.'))
  })
})

test('Primer fails closed when the active pattern set grows outside its declared order', () => {
  fixture((root) => {
    const source = readFileSync(join(root, 'docs/patterns/controlled-utility-entry.md'), 'utf8')
    writeFileSync(join(root, 'docs/patterns/new-active-pattern.md'), source.replace('id: PAT-001', 'id: PAT-999'))
    assert.throws(() => render('primer-patterns', root), /active pattern inventory/)
  })
})

test('Primer binds the current house, owner directions and current drawing', () => {
  fixture((root) => {
    const output = render('primer-reference-house', root)
    assert.ok(output.includes('12 m square footprint'))
    assert.ok(output.includes('3.5 m square open court'))
    assert.ok(output.includes('RH-LAYOUT-FAMILY-02'))
    for (const phrase of ['avoidance of plastic', 'solid internal masonry', 'active dewatering',
      'No flat or very-low-slope', 'remain to be selected and coordinated']) assert.ok(output.includes(phrase), phrase)
    assert.ok(!output.includes('reference-house-type-orientation.svg'))
    assert.ok(!output.includes('STATUS.md'))
    const path = join(root, 'project/owner-house-charter.md')
    const before = readFileSync(path, 'utf8')
    writeFileSync(path, before.replace('including concealed parts', 'including concealed constituent evidence'))
    assert.ok(render('primer-reference-house', root).includes('concealed constituent evidence'))
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
