import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import matter from 'gray-matter'
import type { PublicationEntry } from './publication'

export type PublicationAdapter =
  | 'part-i-composite'
  | 'part-ii-composite'
  | 'part-v-wrapper'
  | 'pattern-index'
  | 'pattern-page'
  | 'reference-house-overview'
  | 'evidence-notes'
  | 'primer-principles'
  | 'primer-patterns'
  | 'primer-reference-house'

export interface AdapterContext {
  readonly repoRoot: string
  readonly source: string
  readonly entry: PublicationEntry
}

function sourcePath(context: AdapterContext, source: string): string {
  return resolve(context.repoRoot, source)
}

function readSource(context: AdapterContext, source: string): string {
  const path = sourcePath(context, source)
  if (!existsSync(path)) throw new Error(`Missing adapter source: ${source}`)
  return matter(readFileSync(path, 'utf8')).content.trim()
}

function stripLeadingHeading(markdown: string, heading: string): string {
  const prefix = `# ${heading}`
  if (!markdown.startsWith(prefix)) {
    throw new Error(`Expected leading heading "${prefix}"`)
  }
  return markdown.slice(prefix.length).trimStart()
}

function stripHeadingLine(markdown: string, heading: string): string {
  const prefix = `${heading}\n`
  if (!markdown.startsWith(prefix)) {
    throw new Error(`Expected heading line "${heading}"`)
  }
  return markdown.slice(prefix.length)
}

function readAndStripHeading(
  context: AdapterContext,
  source: string,
  heading: string
): string {
  return stripLeadingHeading(readSource(context, source), heading)
}

function headingLevel(markdown: string): number {
  const match = markdown.match(/^(#{1,6})\s+/m)
  return match ? match[1].length : 0
}

function shiftHeadings(markdown: string, by: number): string {
  if (by === 0) return markdown
  return markdown.replace(/^(#{1,6})(\s+)/gm, (_, hashes: string, spacing: string) => {
    const count = Math.max(1, Math.min(6, hashes.length + by))
    return `${'#'.repeat(count)}${spacing}`
  })
}

function replaceHeading(markdown: string, from: string, to: string): string {
  const marker = `# ${from}`
  if (!markdown.startsWith(marker)) throw new Error(`Expected leading heading "${marker}"`)
  return `# ${to}${markdown.slice(marker.length)}`
}

function stripSection(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = markdown.match(new RegExp(`\\n## ${escaped}\\n`))
  if (!match || match.index === undefined) throw new Error(`Missing section: ${heading}`)
  const start = match.index
  const after = start + match[0].length
  const next = markdown.slice(after).search(/\n## /)
  return next < 0
    ? markdown.slice(0, start).trimEnd()
    : `${markdown.slice(0, start)}\n${markdown.slice(after + next + 1)}`.trimEnd()
}

function section(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = markdown.match(new RegExp(`(?:^|\\n)## ${escaped}\\n`))
  if (!match || match.index === undefined) throw new Error(`Missing section: ${heading}`)
  const start = match.index + (match[0].startsWith('\n') ? 1 : 0)
  const after = start + `## ${heading}\n`.length
  const next = markdown.slice(after).search(/\n## /)
  return next < 0 ? markdown.slice(start).trim() : markdown.slice(start, after + next).trim()
}

function adaptPartI(markdown: string, context: AdapterContext): string {
  const governing = readAndStripHeading(context, 'docs/manuscript/governing-principles.md', 'Governing Principles')
  const repose = readAndStripHeading(context, 'docs/manuscript/principle-08-repose.md', 'Principle 8 — Design for Repose')
  return `${markdown.trim()}\n\n## The governing principles\n\n${shiftHeadings(governing, 1)}\n\n## Principle 8 — Design for Repose\n\n${shiftHeadings(repose, 1)}\n`
}

function adaptPartII(markdown: string, context: AdapterContext): string {
  const external = readAndStripHeading(
    context,
    'docs/manuscript/maintenance-geography-external.md',
    'Maintenance Geography — The Exterior'
  )
  return `${markdown.trim()}\n\n## Maintenance Geography — The Exterior\n\n${shiftHeadings(external, 1)}\n`
}

function adaptPartV(markdown: string): string {
  return markdown
}

interface PatternMetadata {
  readonly id: string
  readonly title: string
  readonly domain: string
  readonly evidence: string
  readonly state: string
  readonly canonical: boolean
}

function patternMetadata(markdown: string): PatternMetadata {
  const parsed = matter(markdown)
  const id = parsed.data.id
  const title = parsed.data.title
  const domain = parsed.data.domain
  const evidence = parsed.data.evidence
  const state = parsed.data.state
  const canonical = parsed.data.canonical
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof domain !== 'string' ||
    typeof evidence !== 'string' ||
    typeof state !== 'string' ||
    typeof canonical !== 'boolean'
  ) {
    throw new Error('Pattern metadata incomplete')
  }
  return { id, title, domain, evidence, state, canonical }
}

function patternFiles(context: AdapterContext): string[] {
  const index = sourcePath(context, 'docs/patterns/pattern-index.ts')
  const text = readFileSync(index, 'utf8')
  const matches = [...text.matchAll(/source:\s*'([^']+)'/g)].map((match) => `docs/patterns/${match[1]}`)
  if (!matches.length) throw new Error('No pattern source files discovered')
  return matches
}

function canonicalPatterns(context: AdapterContext): Array<{ source: string; metadata: PatternMetadata }> {
  return patternFiles(context)
    .map((source) => ({ source, metadata: patternMetadata(readFileSync(sourcePath(context, source), 'utf8')) }))
    .filter(({ metadata }) => metadata.canonical && metadata.state === 'active')
}

function adaptPatternIndex(markdown: string, context: AdapterContext): string {
  const entries = canonicalPatterns(context)
    .map(({ metadata }) => `- **${metadata.id} — ${metadata.title}** · ${metadata.domain} · ${metadata.evidence}`)
    .join('\n')

  const withoutScript = markdown.replace(/<script setup>[\s\S]*?<\/script>\s*/m, '')
  const withoutDynamic = withoutScript
    .replace(/<div v-if="activePatterns\.length">[\s\S]*?<\/div>/m, entries)
    .replace(/<div v-if="retiredPatterns\.length">[\s\S]*?<\/div>/m, '')
    .replace(/## Retired identities\s*/m, '')

  return withoutDynamic.trim()
}

function adaptPatternPage(markdown: string): string {
  const parsed = matter(markdown)
  const metadata = patternMetadata(markdown)
  let body = parsed.content.trim()
  body = replaceHeading(body, metadata.title, `${metadata.title} — ${metadata.id}`)

  const evidenceLine = `**Evidence:** ${metadata.evidence}`
  if (body.includes(evidenceLine)) return body

  const lines = body.split('\n')
  lines.splice(1, 0, '', evidenceLine)
  return lines.join('\n')
}

function adaptReferenceHouseOverview(markdown: string): string {
  let body = markdown.trim()
  body = body.replace(/^# Reference House\n/, '# Reference House\n')
  return body
}

function adaptEvidenceNotes(markdown: string): string {
  return markdown
}

function headingContent(markdown: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = markdown.match(new RegExp(`(?:^|\\n)## ${escaped}\\n`))
  if (!match || match.index === undefined) throw new Error(`Missing heading: ${heading}`)
  const start = match.index + match[0].length
  const next = markdown.slice(start).search(/\n## /)
  return next < 0 ? markdown.slice(start).trim() : markdown.slice(start, start + next).trim()
}

function compactPrinciple(markdown: string, principle: number): string {
  const body = headingContent(markdown, `Principle ${principle}`)
  const paragraphs = body.split(/\n\n+/)
  return paragraphs.slice(0, 2).join('\n\n')
}

function adaptPrimerPrinciples(_markdown: string, context: AdapterContext): string {
  const source = readSource(context, 'docs/manuscript/governing-principles.md')
  const introEnd = source.indexOf('\n## Principle 1')
  if (introEnd < 0) throw new Error('Could not find Principle 1 in governing principles')
  const intro = stripLeadingHeading(source.slice(0, introEnd).trim(), 'Governing Principles')
  const principles = Array.from({ length: 11 }, (_, index) => {
    const number = index + 1
    const sectionText = section(source, `Principle ${number}`)
    const firstLine = sectionText.split('\n', 1)[0]
    const title = firstLine.replace(/^## Principle \d+ —\s*/, '')
    const compact = compactPrinciple(source, number)
    return `### ${number}. ${title}\n\n${compact}`
  }).join('\n\n')
  return `# The constitution\n\n${intro}\n\n${principles}\n`
}

function patternSection(markdown: string, heading: string): string {
  const marker = `\n## ${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing pattern section: ${heading}`)
  const contentStart = start + marker.length
  const next = markdown.slice(contentStart).search(/\n## /)
  return next < 0
    ? markdown.slice(contentStart).trim()
    : markdown.slice(contentStart, contentStart + next).trim()
}

function concisePattern(context: AdapterContext, id: string): string {
  const match = canonicalPatterns(context).find(({ metadata }) => metadata.id === id)
  if (!match) throw new Error(`Primer representative pattern missing: ${id}`)
  const raw = readFileSync(sourcePath(context, match.source), 'utf8')
  const body = matter(raw).content
  const metadata = match.metadata
  const problem = patternSection(body, 'Problem').split(/\n\n+/)[0]
  const pattern = patternSection(body, 'Pattern').split(/\n\n+/)[0]

  const invariant = pattern.replace(/^\*\*/, '').replace(/\*\*$/, '')
  return `### ${metadata.title} — ${metadata.id}\n\n**Problem.** ${problem}\n\n**Pattern.** ${invariant}`
}

function primerPatternList(context: AdapterContext): string {
  return canonicalPatterns(context)
    .map(({ metadata }) => `- **${metadata.id} — ${metadata.title}**`)
    .join('\n')
}

function firstParagraphs(markdown: string, count: number): string[] {
  return markdown.split(/\n\n+/).slice(0, count)
}

function markdownSection(markdown: string, heading: string): string {
  const marker = `\n## ${heading}\n`
  const start = markdown.indexOf(marker)
  if (start < 0) throw new Error(`Missing Markdown section: ${heading}`)
  const bodyStart = start + marker.length
  const next = markdown.slice(bodyStart).search(/\n## /)
  return next < 0
    ? markdown.slice(bodyStart).trim()
    : markdown.slice(bodyStart, bodyStart + next).trim()
}

function adaptPrimerPatterns(_markdown: string, context: AdapterContext): string {
  const representative = [
    'HSA-P-001',
    'HSA-P-005',
    'HSA-P-018',
    'HSA-P-007',
    'HSA-P-013',
    'HSA-P-012'
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

  const openingParagraphs = firstParagraphs(
    markdown.slice(opening.length, authorityStart).trim(),
    3
  )
  if (openingParagraphs.length !== 3) {
    throw new Error('Primer expected three opening Reference House paragraphs.')
  }
  const architecturalScope = openingParagraphs.slice(0, 2)
  const coordination = openingParagraphs[2]

  const authority = markdownSection(markdown, 'Authority stack')
  const compositionChain = authority.match(/```text\n[\s\S]*?```/)?.[0]
  if (!compositionChain) throw new Error('Primer could not find the Reference House authority chain.')

  return `# The Reference House\n\n## One interpretation, not a style doctrine\n\n${architecturalScope.join('\n\n')}\n\n## What is being integrated\n\n${compositionChain}\n\nThe layers constrain one another without becoming interchangeable. A project-specific choice can satisfy an Ovid’s House provision without being promoted into Ovid’s House doctrine, and use of a pattern in the Reference House does not increase that pattern's general evidence.\n\n## Current coordination test\n\n${coordination}\n\n![Current whole-house coordination fixture](whole-house-coordination-fixture.svg)\n\n*The current whole-house fixture is schematic and provisional. Its purpose is to expose coordination conflicts, not to present a final house design.*\n`
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
    case 'evidence-notes':
      return adaptEvidenceNotes(markdown)
    case 'primer-principles':
      return adaptPrimerPrinciples(markdown, context)
    case 'primer-patterns':
      return adaptPrimerPatterns(markdown, context)
    case 'primer-reference-house':
      return adaptPrimerReferenceHouse(markdown)
  }
}
