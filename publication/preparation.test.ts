import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, posix, resolve } from 'node:path'
import { test } from 'node:test'
import { applyAdapter } from './adapters.js'
import { primerPublicationEntries } from './publication.js'
import { publicationSourceUrl, renderPublicationMermaid } from './preparation.js'

const repoRoot = resolve(import.meta.dirname, '..')
const liveBaseUrl = 'https://adamnoden.github.io/architecture/'

test('every Primer pattern-index link uses the published route without the source docs prefix', () => {
  const entry = primerPublicationEntries.find(({ id }) => id === 'primer-patterns')!
  const markdown = applyAdapter(entry.adapter, readFileSync(resolve(repoRoot, entry.source), 'utf8'), {
    repoRoot, workSourceRoot: repoRoot
  })
  const links = [...markdown.matchAll(/\[[^\]]+\]\(([^\s)]+\.md)\)/g)].map((match) => match[1])
  assert.equal(links.length, 21)
  assert.equal(new Set(links).size, 21)
  for (const href of links) {
    const target = posix.join(posix.dirname(entry.source), href)
    assert.equal(publicationSourceUrl(target, '', repoRoot, liveBaseUrl),
      `${liveBaseUrl}patterns/${href.slice(0, -3)}`)
  }
})

test('Working Edition references and excluded source records retain the canonical destinations', () => {
  for (const source of [
    'research/repose-and-low-vigilance.md',
    'research/repose-evidence-audit.md',
    'research/external-maintenance-access.md',
    'reference-house/current-house-basis.md',
    'research/seated-floor-structure-options.md',
    'research/finish-agnostic-floor-platform-options.md',
    'research/replaceable-wall-system-options.md'
  ]) {
    assert.equal(publicationSourceUrl(`docs/${source}`, '?view=print#evidence', repoRoot, liveBaseUrl),
      `${liveBaseUrl}${source.slice(0, -3)}?view=print#evidence`)
  }
  assert.equal(publicationSourceUrl('docs/prototypes/README.md', '', repoRoot, liveBaseUrl), `${liveBaseUrl}prototypes/`)
  assert.equal(publicationSourceUrl('README.md', '#the-project', repoRoot, liveBaseUrl), `${liveBaseUrl}#the-project`)
  assert.equal(publicationSourceUrl('project/control/README.md', '#sources', repoRoot, liveBaseUrl),
    'https://github.com/adamnoden/architecture/blob/main/project/control/README.md#sources')
})

test('Mermaid consumes transformed Markdown and preserves adapter, frontmatter and figure changes', () => {
  const root = mkdtempSync(join(tmpdir(), 'publication-mermaid-'))
  try {
    const path = join(root, 'pattern.md')
    const original = '---\nid: PAT-PROBE\n---\n# Pattern\n\n```mermaid\nflowchart TD\nA --> B\n```\n\n---\n\n**Provenance:** internal marker\n'
    writeFileSync(path, original)
    const adapted = applyAdapter('pattern-page', original, { repoRoot, workSourceRoot: root })
      .replace(/^---\n[\s\S]*?\n---\n/, '') + '\n![Inserted publication figure](figure.svg)\n'
    const result = renderPublicationMermaid(adapted, path, (input, output) => {
      const received = readFileSync(input, 'utf8')
      assert.equal(received, adapted)
      writeFileSync(output, received.replace(/```mermaid\n[\s\S]*?\n```/, '![Rendered diagram](diagram.svg)'))
    })
    assert.ok(result.includes('![Inserted publication figure](figure.svg)'))
    assert.ok(result.includes('![Rendered diagram](diagram.svg)'))
    assert.ok(!result.includes('internal marker'))
    assert.ok(!result.includes('id: PAT-PROBE'))
    assert.ok(!result.includes('```mermaid'))
    assert.equal(renderPublicationMermaid('No diagram.', path, () => assert.fail('Unnecessary rendering')), 'No diagram.')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
