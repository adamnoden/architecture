import { execFileSync } from 'node:child_process'
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs'

const provenancePaths = new Set([
  'docs/publication/nomenclature-register.md',
  'docs/publication/nomenclature-contract.md',
  'docs/publication/nomenclature-decisions.md',
  'docs/publication/pattern-identity-decision.md',
  'docs/publication/reader-reference-architecture.md',
  'docs/publication/nomenclature-validation.md',
  'docs/publication/public-nomenclature-programme.md'
])

const textExtensions = new Set([
  '.css', '.html', '.js', '.json', '.md', '.mjs', '.svg', '.ts', '.tsx', '.txt', '.yaml', '.yml'
])

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
}

function extension(path) {
  const dot = path.lastIndexOf('.')
  return dot >= 0 ? path.slice(dot) : ''
}

function replaceFile(path, transform) {
  const before = readFileSync(path, 'utf8')
  const after = transform(before)
  if (after !== before) writeFileSync(path, after)
}

function mustReplace(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`NOM-06 migration marker missing: ${label}`)
  return text.replace(before, after)
}

// Preserve the frozen PUB-NOM baseline/decision records as migration provenance,
// but migrate every other tracked textual occurrence to the neutral namespace.
for (const path of trackedFiles()) {
  if (provenancePaths.has(path) || path === 'project/nomenclature.ts') continue
  if (!textExtensions.has(extension(path))) continue
  replaceFile(path, (text) => text.replaceAll('HSA-P-', 'PAT-'))
}

// Canonical pattern pages keep machine identity in frontmatter but lead readers
// with the architectural title rather than the machine key.
for (const path of trackedFiles().filter((path) => /^docs\/patterns\/(?:retired\/)?[^/]+\.md$/.test(path))) {
  replaceFile(path, (text) => {
    if (!/^kind:\s*pattern\s*$/m.test(text)) return text
    const titleMatch = text.match(/^title:\s*(.+?)\s*$/m)
    if (!titleMatch) throw new Error(`Pattern title missing during NOM-06 migration: ${path}`)
    const title = titleMatch[1].replace(/^['"]|['"]$/g, '')
    return text.replace(/^# PAT-\d{3}\s+—\s+.+$/m, `# ${title}`)
  })
}

// Replace the legacy pattern namespace registry entry with explicit legacy and
// current families. Reader visibility remains title-only.
replaceFile('project/nomenclature.ts', (text) => {
  const startMarker = "  {\n    id: 'pattern.hsa',"
  const endMarker = "  {\n    id: 'grammar.g01',"
  const start = text.indexOf(startMarker)
  const end = text.indexOf(endMarker, start)
  if (start < 0 || end < 0) throw new Error('Pattern nomenclature registry boundary changed.')

  const replacement = `  {\n    id: 'legacy.pattern-hsa',\n    meaning: 'Superseded House Systems Architecture-derived pattern machine identity',\n    owner: 'provenance',\n    examples: ['HSA-P-001'],\n    pattern: '\\\\bHSA-P-\\\\d{3}\\\\b',\n    classification: 'LEGACY_PROHIBITED',\n    allowedSurfaces: PROVENANCE_SURFACES,\n    roles: ['PROVENANCE'],\n    stability: 'PROVENANCE_ONLY',\n    brandCoupling: 'NOT_APPLICABLE',\n    migration: 'LEGACY',\n    exception: 'Retained only in bounded PUB-NOM migration/provenance records and Git history.'\n  },\n  {\n    id: 'pattern.pat',\n    meaning: 'Canonical brand-neutral pattern machine identity',\n    owner: 'patterns',\n    examples: ['PAT-001'],\n    pattern: '\\\\bPAT-\\\\d{3}\\\\b',\n    classification: 'INTERNAL_STABLE',\n    allowedSurfaces: INTERNAL_MACHINE_SURFACES,\n    roles: ['IDENTITY_ONLY'],\n    stability: 'DURABLE',\n    brandCoupling: 'NOT_APPLICABLE',\n    migration: 'CURRENT',\n    exception: 'Exact machine join only; the pattern title is the ordinary reader identity.'\n  },\n`

  return `${text.slice(0, start)}${replacement}${text.slice(end)}`
})

// Publication adapters resolve machine identity to human titles on reader surfaces.
replaceFile('publication/adapters.ts', (text) => {
  text = mustReplace(
    text,
    "  const rows = patterns.filter((pattern) => pattern.state === state)\n",
    "  const rows = patternsInReaderOrder(patterns, state)\n",
    'static pattern list reader ordering'
  )

  const helperMarker = "function staticPatternList(patterns: PatternMetadata[], state: 'active' | 'retired'): string {"
  const helper = `function patternsInReaderOrder(\n  patterns: PatternMetadata[],\n  state: 'active' | 'retired'\n): PatternMetadata[] {\n  const rows = patterns.filter((pattern) => pattern.state === state)\n  if (state === 'retired') return rows.sort((a, b) => a.title.localeCompare(b.title))\n\n  const byId = new Map(rows.map((pattern) => [pattern.id, pattern]))\n  return canonicalPatternOrder.map((id) => {\n    const pattern = byId.get(id)\n    if (!pattern) throw new Error(\`Pattern reader order is missing canonical pattern \${id}.\`)\n    return pattern\n  })\n}\n\n`
  if (!text.includes(helperMarker)) throw new Error('Pattern adapter helper insertion marker changed.')
  text = text.replace(helperMarker, `${helper}${helperMarker}`)

  text = text.replaceAll(' — \\`${pattern.id}\\`', '')
  text = text.replace(
    '### ${metadata.title} — ${metadata.id}',
    '### ${metadata.title}'
  )

  if (text.includes(' — \\`${pattern.id}\\`')) {
    throw new Error('Pattern reader label still exposes machine identity in publication adapter.')
  }
  if (text.includes('### ${metadata.title} — ${metadata.id}')) {
    throw new Error('Primer pattern heading still exposes machine identity.')
  }
  return text
})

// Public explanatory prose states the identity/order distinction without teaching
// readers a machine namespace they do not need.
replaceFile('docs/patterns/language-model.md', (text) => {
  // Avoid brittle fenced-block surgery: replace the whole identity paragraph around the known PAT examples.
  return text.replace(
    /Canonical patterns receive stable IDs:\n\n```text\nPAT-001\nPAT-002\n\.\.\.\n```\n\nThe number is identity only\. It does \*\*not\*\* encode category, scale, evidence state or publication order\. Pattern names are the primary reader-facing identity; IDs provide durable cross-reference across patterns, evidence, project selections and computational representations\./,
    'Canonical patterns receive stable, brand-neutral machine IDs for exact joins across pattern relationships, project selections, evidence and computational representations. Those IDs are not part of ordinary reader presentation.\n\nThe numeric suffix is identity only. It does **not** encode category, scale, evidence state or publication order. Pattern names are the reader-facing identity.'
  )
})

replaceFile('publication/part-iii.md', (text) =>
  text.replace(
    'Pattern names are the primary reader-facing identity. Stable `PAT-*` identifiers provide compact cross-reference across patterns, evidence and computational representations. The number does not imply importance, sequence or maturity.',
    'Pattern names are the reader-facing identity. Stable machine identifiers support exact internal cross-reference across patterns, evidence and computational representations, but are not part of ordinary reader presentation. Their numbers do not imply importance, sequence or maturity.'
  )
)

// Source validation judges reader-visible Markdown while permitting the canonical
// pattern machine key in pattern frontmatter. Body occurrences remain prohibited.
replaceFile('scripts/validate-public-nomenclature.ts', (text) => {
  const marker = `function scan(path: string, text: string, failures: Failure[]): void {
`
  if (!text.includes(marker)) throw new Error('Public nomenclature scan marker changed.')

  const helper = `function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\\n')) return markdown
  const end = markdown.indexOf('\\n---\\n', 4)
  return end < 0 ? markdown : markdown.slice(end + 5)
}

function sourceTextForFamily(path: string, family: NomenclatureFamily, text: string): string {
  if (
    family.id === 'pattern.pat' &&
    /^docs\\/patterns\\/(?:retired\\/)?[^/]+\\.md$/.test(path)
  ) {
    return stripFrontmatter(text)
  }
  return text
}

function scanSource(path: string, text: string, failures: Failure[]): void {
  for (const family of readerProhibitedFamilies) {
    const matches = matchesFor(family, sourceTextForFamily(path, family, text))
    if (!matches.length) continue
    failures.push({
      path,
      family: family.id,
      matches: [...new Set(matches)].slice(0, 6)
    })
  }
}

`
  text = text.replace(marker, `${helper}${marker}`)
  text = mustReplace(
    text,
    `    scan(source, readFileSync(absolute, 'utf8'), failures)`,
    `    scanSource(source, readFileSync(absolute, 'utf8'), failures)`,
    'source-mode reader-visible scan'
  )
  return text
})

// CI inventories the current pattern family after the migration.
replaceFile('.github/workflows/validate-pr.yml', (text) =>
  mustReplace(text, 'pattern.hsa', 'pattern.pat', 'current pattern inventory family')
)

// Remove this one-shot migration mechanism from the resulting tree. Git history
// retains the operation; the repository does not retain a self-modifying workflow.
unlinkSync('scripts/nom06-migrate-pattern-ids.mjs')
unlinkSync('.github/workflows/nom06-migrate-pattern-ids.yml')

console.log('NOM-06 canonical pattern namespace migration applied.')
