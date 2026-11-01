import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { canonicalPatternOrder, type PublicationAdapter } from './publication.js'

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
  'primer-principles': [],
  'primer-patterns': [
    'docs/patterns/controlled-utility-entry.md',
    'docs/patterns/designed-structural-penetration.md',
    'docs/patterns/failure-tolerant-wet-service-room.md',
    'docs/patterns/permanent-opening-replaceable-window.md',
    'docs/patterns/ground-supported-facade-access.md',
    'docs/patterns/physical-service-index.md'
  ],
  'primer-reference-house': []
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

function adaptPrimerPrinciples(markdown: string): string {
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
    const support = firstParagraphs(match[4], 1)[0]
    if (!support) throw new Error(`Primer governing provision ${number} has no supporting paragraph.`)

    return `## ${number}. ${title}\n\n**${rule}**\n\n${support}`
  })

  return `# Governing constitution\n\nThe constitution retains eleven stable numbered provisions because the wider project refers to them. They are not eleven co-equal novelty claims: core doctrine is distinguished from standing architectural disciplines. All operate within non-negotiable requirements for life safety, legal compliance, structural integrity, health and environmental performance.\n\n${constraints}\n\n${rendered.join('\n\n')}\n`
}

function activePatternsInCanonicalOrder(context: AdapterContext): PatternMetadata[] {
  const active = new Map(
    patternMetadata(context)
      .filter((pattern) => pattern.state === 'active')
      .map((pattern) => [pattern.id, pattern])
  )

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

  return groups
    .map(({ title, ids }) => {
      const rows = ids.map((id) => {
        const pattern = byId.get(id)
        if (!pattern) throw new Error(`Primer pattern group is missing ${id}.`)
        return `- [${pattern.title}](${pattern.href})`
      })
      return `### ${title}\n\n${rows.join('\n')}`
    })
    .join('\n\n')
}

function concisePattern(context: AdapterContext, id: string): string {
  const metadata = activePatternsInCanonicalOrder(context).find((pattern) => pattern.id === id)
  if (!metadata) throw new Error(`Primer representative pattern missing: ${id}`)

  const source = readWork(context, `docs/patterns/${metadata.href}`)
  const problem = firstParagraphs(markdownSection(source, 'Problem'), 1)[0]
  const pattern = firstParagraphs(markdownSection(source, 'Pattern'), 1)[0]
  if (!problem || !pattern) throw new Error(`Primer could not compress representative pattern ${id}.`)

  const invariant = pattern.replace(/^\*\*/, '').replace(/\*\*$/, '')
  return `### ${metadata.title}\n\n**Problem.** ${problem}\n\n**Pattern.** ${invariant}`
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

  return `# From constitution to patterns\n\nThe governing constitution is intentionally too general to specify a building. Ovid’s House therefore keeps four levels of authority distinct:\n\n**Constitution** — core doctrine plus standing disciplines.  \n**Strategy** — a general way to satisfy it.  \n**Pattern** — a reusable architectural response with stated trade-offs and evidence.  \n**Reference implementation** — one project-specific choice.\n\nA pattern is not a product detail and does not become universally correct because it has a stable name. It is specific enough to shape design, but general enough to admit materially different implementations. Evidence maturity is recorded separately from pattern identity.\n\nThe current system contains **21 active patterns**. Service topology has the strongest demonstrated generative sequence; the other fields are not presented as one uniformly mature pattern language. Three broader strategies sit beside the set; four plausible propositions remain held candidates rather than being promoted prematurely. The complete active set is listed below so the Primer remains complete in coverage even though only a small set is expanded.\n\n## The complete current pattern set\n\n${primerPatternList(context)}\n\n## Six patterns in brief\n\nThe following examples are not a privileged inner canon. They are chosen because, together, they show the range of consequences that follows from the constitution: service topology, permanent-fabric protection, water failure, replaceable openings, external maintenance and intergenerational legibility.\n\n${representative}\n`
}

function adaptPrimerReferenceHouse(markdown: string): string {
  const opening = '# Reference House\n'
  if (!markdown.startsWith(opening)) {
    throw new Error('Reference House opening changed; update the Primer adapter deliberately.')
  }

  const authorityMarker = '\n## Authority stack'
  const authorityStart = markdown.indexOf(authorityMarker)
  if (authorityStart < 0) {
    throw new Error('Reference House Authority stack changed; update the Primer adapter deliberately.')
  }

  const architecturalScope = firstParagraphs(
    markdown.slice(opening.length, authorityStart).trim(),
    2
  )
  if (architecturalScope.length !== 2) {
    throw new Error('Primer expected two opening Reference House scope paragraphs.')
  }

  const authority = markdownSection(markdown, 'Authority stack')
  const compositionChain = authority.match(/```text\n[\s\S]*?```/)?.[0]
  if (!compositionChain) throw new Error('Primer could not find the Reference House authority chain.')

  const coordination = firstParagraphs(markdownSection(markdown, 'Maturity'), 2)
  if (coordination.length !== 2) {
    throw new Error('Primer expected two Reference House Maturity paragraphs.')
  }

  return `# The Reference House\n\n## One interpretation, not a style doctrine\n\n${architecturalScope.join('\n\n')}\n\n## What is being integrated\n\n${compositionChain}\n\nThe layers constrain one another without becoming interchangeable. A project-specific choice can satisfy an Ovid’s House provision without being promoted into Ovid’s House doctrine, and use of a pattern in the Reference House does not increase that pattern's general evidence.\n\n## Current coordination test\n\n${coordination.join('\n\n')}\n\n![Reference House type and orientation](../manuscript/figures/reference-house-type-orientation.svg)\n\n*The Reference House is a compact two-storey ring around an open court, with a concentrated service flank and a legible front-to-court-to-garden sequence.*\n`
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
      return adaptPrimerPrinciples(markdown)
    case 'primer-patterns':
      return adaptPrimerPatterns(markdown, context)
    case 'primer-reference-house':
      return adaptPrimerReferenceHouse(markdown)
  }
}

export function readFrontmatterValue(markdown: string, key: string): string | null {
  return frontmatterValue(markdown, key)
}