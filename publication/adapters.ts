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
  'pattern-index': [],
  'reference-house-overview': []
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

function adaptPartI(markdown: string, context: AdapterContext): string {
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

  return `${markdown.slice(0, chapter5Index)}${chapter5Stub}\n\n${principles}${markdown.slice(
    transitionIndex
  )}`
}

function adaptPartII(markdown: string, context: AdapterContext): string {
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

  if (/<script\s+setup\b|\bv-(?:if|for|else|show)\s*=|\{\{[^}]+\}\}/i.test(adapted)) {
    throw new Error('Pattern index adapter left Vue-only constructs in prepared Markdown.')
  }

  if (!adapted.startsWith('# Patterns\n')) {
    throw new Error('Pattern index opening heading changed; update the Part III print wrapper deliberately.')
  }

  return `# Part III — Pattern Language\n\n${demoteHeadings(adapted, 1)}`
}

function adaptReferenceHouseOverview(markdown: string): string {
  if (!markdown.startsWith('# Reference House\n')) {
    throw new Error('Reference House opening heading changed; update the Part IV print wrapper deliberately.')
  }

  return `# Part IV — The Reference House\n\n${demoteHeadings(markdown, 1)}`
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
    case 'pattern-index':
      return adaptPatternIndex(markdown, context)
    case 'reference-house-overview':
      return adaptReferenceHouseOverview(markdown)
  }
}

export function readFrontmatterValue(markdown: string, key: string): string | null {
  return frontmatterValue(markdown, key)
}
