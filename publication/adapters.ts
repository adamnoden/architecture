import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { PublicationAdapter } from './publication.js'

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
  'reference-house-page': []
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

function normaliseLegacyPartOpening(markdown: string, partHeading: string): string {
  const legacyOpening = `# The Long-Life House\n## ${partHeading}`
  if (!markdown.startsWith(legacyOpening)) {
    throw new Error(`${partHeading} opening changed; update the print wrapper deliberately.`)
  }
  return markdown
    .replace(legacyOpening, `# ${partHeading}`)
    .replaceAll('The Long-Life House', 'House Systems Architecture')
}

function adaptPartI(markdown: string, context: AdapterContext): string {
  markdown = normaliseLegacyPartOpening(markdown, 'Part I — The Proposition')

  const chapter5Marker = '# 5. Eleven principles'
  const transitionMarker = '\n---\n\n# From principles to buildings'
  const chapter5Index = markdown.indexOf(chapter5Marker)
  const transitionIndex = markdown.indexOf(transitionMarker)

  if (chapter5Index < 0 || transitionIndex < chapter5Index) {
    throw new Error('Part I composition markers changed; update the print adapter deliberately.')
  }

  let chapter5Stub = markdown.slice(chapter5Index, transitionIndex).trimEnd()
  chapter5Stub = chapter5Stub
    .replace(
      '[House Systems Architecture — Governing Principles](governing-principles.md)',
      '**House Systems Architecture — Governing Principles**'
    )
    .replace(
      '[Principle 8 — Design for Repose](principle-08-repose.md)',
      '**Principle 8 — Design for Repose**'
    )

  let principles = demoteHeadings(
    readWork(context, 'docs/manuscript/governing-principles.md').trim(),
    1
  )
  const principle9Marker = '\n### 9. Let passive architecture do the first work'
  const principle9Index = principles.indexOf(principle9Marker)
  if (principle9Index < 0) {
    throw new Error('Governing-principles Principle 9 marker changed; update Part I composition deliberately.')
  }

  const repose = demoteHeadings(
    readWork(context, 'docs/manuscript/principle-08-repose.md').trim(),
    3
  )
  principles = `${principles.slice(0, principle9Index).trimEnd()}\n\n${repose}\n\n${principles
    .slice(principle9Index)
    .trimStart()}`

  const embeddedBridgeMarker = '\n---\n\n### From doctrine to implementation'
  const embeddedBridgeIndex = principles.indexOf(embeddedBridgeMarker)
  if (embeddedBridgeIndex < 0) {
    throw new Error(
      'Governing-principles implementation bridge changed; update Part I composition deliberately.'
    )
  }
  principles = principles.slice(0, embeddedBridgeIndex).trimEnd()

  return `${markdown.slice(0, chapter5Index)}${chapter5Stub}\n\n${principles}${markdown.slice(
    transitionIndex
  )}`
}

function adaptPartII(markdown: string, context: AdapterContext): string {
  markdown = normaliseLegacyPartOpening(markdown, 'Part II — Architecture of the Platform')

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
  return normaliseLegacyPartOpening(markdown, 'Part V — Making and Testing the Platform')
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

function staticPatternList(patterns: PatternMetadata[], state: 'active' | 'retired'): string {
  const rows = patterns.filter((pattern) => pattern.state === state)
  if (!rows.length) throw new Error(`Pattern index has no ${state} patterns.`)

  return rows
    .map((pattern) => {
      const label = `[\`${pattern.id}\` — ${pattern.title}](${pattern.href})`
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

  const opening = '# Patterns\n'
  if (!adapted.startsWith(opening)) {
    throw new Error('Pattern index opening heading changed; update the Part III print wrapper deliberately.')
  }

  const body = adapted.slice(opening.length).trimStart()
  if (/<script\s+setup\b|\bv-(?:if|for|else|show)\s*=|\{\{[^}]+\}\}/i.test(body)) {
    throw new Error('Pattern index adapter left Vue-only constructs in prepared Markdown.')
  }

  return `# Part III — Pattern Language\n\n${body}`
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
  }
}

export function readFrontmatterValue(markdown: string, key: string): string | null {
  return frontmatterValue(markdown, key)
}
