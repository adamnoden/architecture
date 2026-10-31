import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { canonicalPatternOrder, publicationEntries, type PublicationAdapter } from './publication.js'
import { layoutRevision } from '../compiler/reference-house/georgian/layout-revision.js'
import { renderPrimerGroundPlanSvg } from './primer/figure.js'

export interface AdapterContext {
  repoRoot: string
  workSourceRoot: string
}

interface PatternMetadata {
  id: string
  title: string
  state: 'active' | 'retired'
  evidence: string
  href: string
}

const adapterDependencies: Record<PublicationAdapter, readonly string[]> = {
  'part-i-composite': [
    'docs/manuscript/governing-principles.md',
    'docs/manuscript/principle-08-repose.md'
  ],
  'part-ii-composite': ['docs/manuscript/maintenance-geography-external.md'],
  'part-v-wrapper': [],
  'pattern-index': [],
  'pattern-page': [],
  'reference-house-overview': [],
  'reference-house-page': [],
  'primer-principles': ['publication/primer/constitution.md'],
  'primer-patterns': [
    'publication/primer/patterns.md',
    ...publicationEntries.filter((entry) => entry.kind === 'pattern').map((entry) => entry.source)
  ],
  'primer-reference-house': [
    'publication/primer/reference-house.md',
    'docs/reference-house/current-house-basis.md',
    'project/owner-house-charter.md'
  ]
}

export function dependenciesForAdapter(adapter?: PublicationAdapter): readonly string[] {
  return adapter ? adapterDependencies[adapter] : []
}

function workPath(context: AdapterContext, path: string): string {
  return resolve(context.workSourceRoot, path)
}

function readWork(context: AdapterContext, path: string): string {
  return readFileSync(workPath(context, path), 'utf8')
}

function demoteHeadings(markdown: string, levels: number): string {
  let inFence = false
  return markdown
    .split('\n')
    .map((line) => {
      if (/^```/.test(line.trimStart())) {
        inFence = !inFence
        return line
      }
      if (inFence) return line

      const match = line.match(/^(#{1,6})(\s+.*)$/)
      if (!match) return line
      return `${'#'.repeat(Math.min(6, match[1].length + levels))}${match[2]}`
    })
    .join('\n')
}

function normalisePartOpening(markdown: string, partHeading: string): string {
  const opening = `# Ovid’s House\n## ${partHeading}`
  if (!markdown.startsWith(opening)) {
    throw new Error(`${partHeading} opening changed; update the print wrapper deliberately.`)
  }
  return markdown
    .replace(opening, `# ${partHeading}`)
}

function adaptPartI(markdown: string, context: AdapterContext): string {
  markdown = normalisePartOpening(markdown, 'Part I — The Proposition')

  const chapter5Marker = '# 5. Governing constitution'
  const transitionMarker = '\n---\n\n# From constitution to buildings'
  const chapter5Index = markdown.indexOf(chapter5Marker)
  const transitionIndex = markdown.indexOf(transitionMarker)

  if (chapter5Index < 0 || transitionIndex < chapter5Index) {
    throw new Error('Part I composition markers changed; update the print adapter deliberately.')
  }

  let chapter5Stub = markdown.slice(chapter5Index, transitionIndex).trimEnd()
  chapter5Stub = chapter5Stub
    .replace(
      '[Ovid’s House — Governing Constitution](governing-principles.md)',
      '**Ovid’s House — Governing Constitution**'
    )
    .replace(
      '[Principle 8 — Design for Repose](principle-08-repose.md)',
      '**Principle 8 — Design for Repose**'
    )

  let principles = demoteHeadings(
    readWork(context, 'docs/manuscript/governing-principles.md').trim(),
    1
  )
  const principle9Marker = '\n### 9. Let passive architecture do the first work — standing environmental discipline'
  const principle9Index = principles.indexOf(principle9Marker)
  if (principle9Index < 0) {
    throw new Error('Governing-constitution Principle 9 marker changed; update Part I composition deliberately.')
  }

  const repose = demoteHeadings(
    readWork(context, 'docs/manuscript/principle-08-repose.md').trim(),
    3
  )
  principles = `${principles.slice(0, principle9Index).trimEnd()}\n\n${repose}\n\n${principles
    .slice(principle9Index)
    .trimStart()}`

  const embeddedBridgeMarker = '\n---\n\n### From constitution to implementation'
  const embeddedBridgeIndex = principles.indexOf(embeddedBridgeMarker)
  if (embeddedBridgeIndex < 0) {
    throw new Error(
      'Governing-constitution implementation bridge changed; update Part I composition deliberately.'
    )
  }
  principles = principles.slice(0, embeddedBridgeIndex).trimEnd()

  return `${markdown.slice(0, chapter5Index)}${chapter5Stub}\n\n${principles}${markdown.slice(
    transitionIndex
  )}`
}

function adaptPartII(markdown: string, context: AdapterContext): string {
  markdown = normalisePartOpening(markdown, 'Part II — Architecture of the Platform')

  const chapter9Marker = '\n---\n\n# 9. Environmental resilience without dependence'
  const chapter9Index = markdown.indexOf(chapter9Marker)
  if (chapter9Index < 0) {
    throw new Error('Part II Chapter 9 marker changed; update the print adapter deliberately.')
  }

  const exterior = demoteHeadings(
    readWork(context, 'docs/manuscript/maintenance-geography-external.md').trim(),
    1
  )

  return `${markdown.slice(0, chapter9Index).trimEnd()}\n\n${exterior}\n${markdown.slice(
    chapter9Index
  )}`
}

function adaptPartV(markdown: string): string {
  return normalisePartOpening(markdown, 'Part V — Making and Testing the Platform')
}

function adaptPatternPage(markdown: string): string {
  const provenanceMarker = '\n---\n\n**Provenance:**'
  const provenanceIndex = markdown.lastIndexOf(provenanceMarker)
  if (provenanceIndex < 0) return markdown
  return `${markdown.slice(0, provenanceIndex).trimEnd()}\n`
}

function frontmatterValue(markdown: string, key: string): string | null {
  if (!markdown.startsWith('---\n')) return null
  const end = markdown.indexOf('\n---\n', 4)
  if (end < 0) return null
  const frontmatter = markdown.slice(4, end)
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'))
  return match ? match[1].replace(/^['"]|['"]$/g, '') : null
}

function patternMetadata(context: AdapterContext): PatternMetadata[] {
  const patternRoot = workPath(context, 'docs/patterns')
  const rootFiles = readdirSync(patternRoot)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ absolute: join(patternRoot, name), href: name }))
  const retiredRoot = join(patternRoot, 'retired')
  const retiredFiles = existsSync(retiredRoot)
    ? readdirSync(retiredRoot)
        .filter((name) => name.endsWith('.md'))
        .map((name) => ({ absolute: join(retiredRoot, name), href: `retired/${name}` }))
    : []

  return [...rootFiles, ...retiredFiles]
    .flatMap(({ absolute, href }): PatternMetadata[] => {
      const source = readFileSync(absolute, 'utf8')
      if (frontmatterValue(source, 'kind') !== 'pattern') return []

      const id = frontmatterValue(source, 'id')
      const title = frontmatterValue(source, 'title')
      const state = frontmatterValue(source, 'state')
      const evidence = frontmatterValue(source, 'evidence') ?? 'unspecified'
      if (!id || !title || (state !== 'active' && state !== 'retired')) {
        throw new Error(`Invalid canonical pattern metadata in ${absolute}`)
      }

      return [{ id, title, state, evidence, href }]
    })
    .sort((a, b) => a.id.localeCompare(b.id))
}

function patternsInReaderOrder(
  patterns: PatternMetadata[],
  state: 'active' | 'retired'
): PatternMetadata[] {
  const rows = patterns.filter((pattern) => pattern.state === state)
  if (state === 'retired') return rows.sort((a, b) => a.title.localeCompare(b.title))

  const byId = new Map(rows.map((pattern) => [pattern.id, pattern]))
  return canonicalPatternOrder.map((id) => {
    const pattern = byId.get(id)
    if (!pattern) throw new Error(`Pattern reader order is missing canonical pattern ${id}.`)
    return pattern
  })
}

function staticPatternList(patterns: PatternMetadata[], state: 'active' | 'retired'): string {
  const rows = patternsInReaderOrder(patterns, state)
  if (!rows.length) throw new Error(`Pattern index has no ${state} patterns.`)

  return rows
    .map((pattern) => {
      const label = `[${pattern.title}](${pattern.href})`
      return state === 'active' ? `- ${label} · ${pattern.evidence}` : `- ${label}`
    })
    .join('\n')
}

function adaptPatternIndex(markdown: string, context: AdapterContext): string {
  const patterns = patternMetadata(context)
  const scriptPattern = /<script setup>[\s\S]*?<\/script>\s*/
  const activePattern = /<div v-if="activePatterns\.length">[\s\S]*?<\/div>/
  const retiredPattern = /<div v-if="retiredPatterns\.length">[\s\S]*?<\/div>/

  if (!scriptPattern.test(markdown) || !activePattern.test(markdown) || !retiredPattern.test(markdown)) {
    throw new Error('Pattern index Vue structure changed; update the static print adapter deliberately.')
  }

  const adapted = markdown
    .replace(scriptPattern, '')
    .replace(activePattern, staticPatternList(patterns, 'active'))
    .replace(retiredPattern, staticPatternList(patterns, 'retired'))

  const opening = '# Patterns and generative sequences\n'
  if (!adapted.startsWith(opening)) {
    throw new Error('Pattern index opening heading changed; update the Part III print wrapper deliberately.')
  }

  const body = adapted.slice(opening.length).trimStart()
  if (/<script\s+setup\b|\bv-(?:if|for|else|show)\s*=|\{\{[^}]+\}\}/i.test(body)) {
    throw new Error('Pattern index adapter left Vue-only constructs in prepared Markdown.')
  }

  return `# Part III — Patterns and Generative Sequences\n\n${body}`
}

function stripReferenceHouseControlHeader(markdown: string): string {
  return markdown
    .replace(/^\*\*(?:Status|Purpose):\*\*[^\n]*\n/gm, '')
    .replace(/\n{3,}/g, '\n\n')
}

function adaptReferenceHouseOverview(markdown: string): string {
  const opening = '# Reference House\n'
  if (!markdown.startsWith(opening)) {
    throw new Error('Reference House opening heading changed; update the Part IV print wrapper deliberately.')
  }

  return stripReferenceHouseControlHeader(
    `# Part IV — The Reference House\n\n${markdown.slice(opening.length).trimStart()}`
  )
}

function adaptReferenceHousePage(markdown: string): string {
  let adapted = stripReferenceHouseControlHeader(markdown)

  const h1Start = '\n---\n\n## 1. Relationship to the computational H1 fixture\n'
  const h1End = '\n---\n\n## 2. Site and orientation assumptions'
  const h1StartIndex = adapted.indexOf(h1Start)

  if (h1StartIndex >= 0) {
    const h1EndIndex = adapted.indexOf(h1End, h1StartIndex + h1Start.length)
    if (h1EndIndex < 0) {
      throw new Error('Whole-House H1 comparator boundary changed; update print adaptation deliberately.')
    }

    const replacement = `\n---\n\n## 1. Service coherence test\n\nThe courtyard plan increases perimeter and strengthens front-to-courtyard-to-garden ordering. That architectural choice should not be paid for through unnecessarily long service routes, duplicated cores or technical corridors.\n\n> **Can the courtyard house remain service-coherent without paying for its spatial order through long routes, duplicated cores or technical corridors?**`

    adapted = `${adapted.slice(0, h1StartIndex)}${replacement}${adapted.slice(h1EndIndex)}`
  }

  if (/computational H1 fixture|paper-compilation house/i.test(adapted)) {
    throw new Error('Reference House print adaptation still contains internal H1 provenance.')
  }

  return adapted
}

function markdownSection(markdown: string, heading: string): string {
  const marker = `## ${heading}`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing Markdown section: ${heading}`)

  const bodyStart = markdown.indexOf('\n', start + marker.length)
  if (bodyStart < 0) return ''
  const tail = markdown.slice(bodyStart + 1)
  const nextHeading = tail.search(/^## /m)
  return (nextHeading < 0 ? tail : tail.slice(0, nextHeading)).trim()
}

function firstParagraphs(markdown: string, count: number): string[] {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && paragraph !== '---' && !paragraph.startsWith('## '))
    .slice(0, count)
}

// Authored framing is a normal publication/EDA source; only selected material is inserted here.
function composePrimer(context: AdapterContext, source: string, slots: Record<string, string>): string {
  let text = readWork(context, source)
  for (const [name, value] of Object.entries(slots)) {
    const marker = `<!-- primer:${name} -->`
    if (text.split(marker).length !== 2) throw new Error(`${source}: expected one ${marker}`)
    text = text.replace(marker, () => value)
  }
  if (/<!-- primer:/.test(text)) throw new Error(`${source}: unknown Primer composition slot`)
  return text
}

// The anchors select complete source sentences, not a second maintained paraphrase.
// A changed or ambiguous selection requires an editorial decision instead of a silent fallback.
function sourceSentences(markdown: string, starts: readonly string[], label: string): string {
  const sentences = markdown.trim().split(/\n{2,}/)
    .filter((paragraph) => !paragraph.startsWith('#'))
    .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+(?=[A-Z“])/u))
    .map((sentence) => sentence.trim())
  return starts.map((start) => {
    const matches = sentences.filter((sentence) => sentence.replace(/\*\*/g, '').startsWith(start))
    if (matches.length !== 1) throw new Error(`${label}: expected one source sentence beginning “${start}”, found ${matches.length}.`)
    return matches[0]
  }).join(' ')
}

// Supporting explanations are selected for meaning, never merely by paragraph position.
const primerPrincipleSupport: Record<number, readonly string[]> = {
  1: ['Foreseeable change includes', 'Where a modest early decision'],
  2: ['Mechanical fasteners', 'Reversible screws', 'The objective is'],
  3: ['Required load paths', 'Where constructions of different'],
  4: ['Ask how the system fails'],
  5: ['A person needs', 'The same rule applies outside'],
  6: ['Test for understandability', 'Repeated construction should'],
  7: ['Well-proportioned rooms', 'Permanence carries'],
  8: ['Where recurring use demands', 'A room can be ornamented', 'Thermal conditions'],
  9: ['Mechanical systems are the correct answer', 'A long-lived real project', 'At the ground'],
  10: ['The strongest form of legibility', 'A restrained amount'],
  11: ['Architecture may cover services', 'Cosmetic continuity']
}

function adaptPrimerPrinciples(markdown: string, context: AdapterContext): string {
  const constraints = markdownSection(markdown, 'Governing constraints')
    .replace(/\n?---\s*$/, '')
    .trim()
  const principlePattern = /^## (\d+)\. (.+)\n\n\*\*([^\n]+)\*\*\n\n([\s\S]*?)(?=^## \d+\. |^---\n\n## From constitution to implementation)/gm
  const principles = [...markdown.matchAll(principlePattern)]

  if (principles.length !== 11) {
    throw new Error(`Primer expected 11 numbered governing provisions, found ${principles.length}.`)
  }

  const rendered = principles.map((match, index) => {
    const number = Number(match[1])
    if (number !== index + 1) {
      throw new Error(`Primer governing-provision order changed at ${index + 1}; found ${number}.`)
    }

    const title = match[2].trim()
    const rule = match[3].trim()
    const support = sourceSentences(match[4], primerPrincipleSupport[number], `Primer provision ${number}`)

    return `<section class="primer-provision">\n\n## ${number}. ${title}\n\n**${rule}**\n\n${support}\n\n</section>`
  })

  return composePrimer(context, 'publication/primer/constitution.md', {
    'constraints': constraints,
    'provisions': rendered.join('\n\n')
  })
}

function activePatternsInCanonicalOrder(context: AdapterContext): PatternMetadata[] {
  const metadata = patternMetadata(context).filter((pattern) => pattern.state === 'active')
  const active = new Map(metadata.map((pattern) => [pattern.id, pattern]))
  if (active.size !== metadata.length || new Set(canonicalPatternOrder).size !== canonicalPatternOrder.length ||
      active.size !== canonicalPatternOrder.length) {
    throw new Error('Primer active pattern inventory differs from the canonical order; review the complete map.')
  }

  return canonicalPatternOrder.map((id) => {
    const pattern = active.get(id)
    if (!pattern) throw new Error(`Primer pattern map is missing canonical pattern ${id}.`)
    return pattern
  })
}

function primerPatternList(context: AdapterContext): string {
  const patterns = activePatternsInCanonicalOrder(context)
  const byId = new Map(patterns.map((pattern) => [pattern.id, pattern]))
  const groups = [
    { title: 'A · Service geography and distribution', ids: canonicalPatternOrder.slice(0, 8) },
    { title: 'B · Water, leakage and failure', ids: canonicalPatternOrder.slice(8, 11) },
    { title: 'C · Openings, movement and attachment', ids: canonicalPatternOrder.slice(11, 16) },
    { title: 'D · Environment and external maintenance', ids: canonicalPatternOrder.slice(16, 20) },
    { title: 'E · Stewardship', ids: canonicalPatternOrder.slice(20, 21) }
  ]

  const groupedIds = groups.flatMap((group) => group.ids)
  if (groupedIds.length !== patterns.length || new Set(groupedIds).size !== patterns.length) {
    throw new Error('Primer pattern grouping omits or duplicates an active pattern; review the complete map.')
  }
  const rows = groups
    .map(({ title, ids }) => {
      const links = ids.map((id) => {
        const pattern = byId.get(id)
        if (!pattern) throw new Error(`Primer pattern group is missing ${id}.`)
        return `[${pattern.title}](${pattern.href})`
      })
      return `| ${title.replace(/^[A-E] · /, '')} | ${links.join('; ')} |`
    })
    .join('\n')
  return `| Field | Patterns |\n| --- | --- |\n${rows}`
}

function concisePattern(context: AdapterContext, id: string): string {
  const metadata = activePatternsInCanonicalOrder(context).find((pattern) => pattern.id === id)
  if (!metadata) throw new Error(`Primer representative pattern missing: ${id}`)

  const source = readWork(context, `docs/patterns/${metadata.href}`)
  const patternSection = markdownSection(source, 'Pattern')
  const pattern = firstParagraphs(patternSection, 1)[0]
  if (!pattern?.startsWith('**') || !pattern.endsWith('**')) {
    throw new Error(`Primer representative ${id} has no complete canonical pattern statement.`)
  }
  const qualifications: Record<string, readonly string[]> = {
    'PAT-001': ['The pattern does not require', 'Supplier rules'],
    'PAT-005': ['An ordinary engineered opening'],
    'PAT-018': ['The invariant is room-scale'],
    'PAT-007': ['The required outcome'],
    'PAT-013': ['For ground-supported access', 'The pattern does'],
    'PAT-012': ['Typical content may include']
  }
  const invariant = pattern.slice(2, -2)
  const contextText = id === 'PAT-018' ? `${markdownSection(source, 'Context')}\n\n` : ''
  const qualification = sourceSentences(patternSection, qualifications[id], `Primer pattern ${id}`)
  return `<section class="primer-pattern">\n\n### ${metadata.title}\n\n*Evidence: ${metadata.evidence}.*\n\n${contextText}${invariant} ${qualification}\n\n</section>`
}

function adaptPrimerPatterns(_markdown: string, context: AdapterContext): string {
  const representative = [
    'PAT-001',
    'PAT-005',
    'PAT-018',
    'PAT-007',
    'PAT-013',
    'PAT-012'
  ]
    .map((id) => concisePattern(context, id))
    .join('\n\n')

  return composePrimer(context, 'publication/primer/patterns.md', {
    'pattern-list': primerPatternList(context),
    'representatives': representative,
    'pattern-count': String(activePatternsInCanonicalOrder(context).length)
  })
}

function adaptPrimerReferenceHouse(markdown: string, context: AdapterContext): string {
  const opening = '# Reference House\n'
  if (!markdown.startsWith(opening)) {
    throw new Error('Reference House opening changed; update the Primer adapter deliberately.')
  }

  const authorityMarker = '\n## Authority stack'
  const authorityStart = markdown.indexOf(authorityMarker)
  if (authorityStart < 0) {
    throw new Error('Reference House Authority stack changed; update the Primer adapter deliberately.')
  }

  const basis = readWork(context, 'docs/reference-house/current-house-basis.md')
  const facts = markdownSection(basis, 'Current architectural facts')
  const charter = readWork(context, 'project/owner-house-charter.md')
  const roofRow = markdownSection(basis, 'Sources to use').split('\n').find((line) => line.startsWith('| Roof prohibition |'))
  if (!roofRow) throw new Error('Primer current-house roof requirement is missing from its owning basis.')
  if (layoutRevision.court.width !== layoutRevision.court.depth) throw new Error('Primer courtyard description requires review: current court is no longer square.')
  if (layoutRevision.court.x !== (layoutRevision.shell - layoutRevision.court.width) / 2 ||
      layoutRevision.court.y !== (layoutRevision.shell - layoutRevision.court.depth) / 2) {
    throw new Error('Primer courtyard description requires review: current court is no longer centred.')
  }

  return composePrimer(context, 'publication/primer/reference-house.md', {
    'scope': sourceSentences(markdown.slice(opening.length, authorityStart), [
      'The Reference House is', 'It forces doctrine', 'It is not proof'
    ], 'Primer Reference House scope'),
    'shell': String(layoutRevision.shell / 1000),
    'court': String(layoutRevision.court.width / 1000),
    'arrangement': sourceSentences(facts, ['The front has five bays', 'Four bedrooms'], 'Primer current-house arrangement'),
    'material-direction': sourceSentences(charter, ['The owner requires the strongest practicable avoidance'], 'Primer material direction'),
    'structural-direction': sourceSentences(charter, ['The owner prefers solid internal masonry', 'Explore non-timber primary'], 'Primer structural direction'),
    'water-direction': sourceSentences(charter, ['The owner requires dryness by position and geometry'], 'Primer water direction'),
    'roof-direction': `${roofRow.split('|')[3].trim()}.`,
    'technical-limit': sourceSentences(facts, ['Actual structural, thermal'], 'Primer technical limit'),
    'ground-plan': renderPrimerGroundPlanSvg()
  })
}

export function applyAdapter(
  adapter: PublicationAdapter | undefined,
  markdown: string,
  context: AdapterContext
): string {
  switch (adapter) {
    case undefined:
      return markdown
    case 'part-i-composite':
      return adaptPartI(markdown, context)
    case 'part-ii-composite':
      return adaptPartII(markdown, context)
    case 'part-v-wrapper':
      return adaptPartV(markdown)
    case 'pattern-index':
      return adaptPatternIndex(markdown, context)
    case 'pattern-page':
      return adaptPatternPage(markdown)
    case 'reference-house-overview':
      return adaptReferenceHouseOverview(markdown)
    case 'reference-house-page':
      return adaptReferenceHousePage(markdown)
    case 'primer-principles':
      return adaptPrimerPrinciples(markdown, context)
    case 'primer-patterns':
      return adaptPrimerPatterns(markdown, context)
    case 'primer-reference-house':
      return adaptPrimerReferenceHouse(markdown, context)
  }
}

export function readFrontmatterValue(markdown: string, key: string): string | null {
  return frontmatterValue(markdown, key)
}
