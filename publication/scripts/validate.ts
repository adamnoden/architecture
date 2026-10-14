import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAdapter, dependenciesForAdapter, readFrontmatterValue } from '../adapters.js'
import { applyPublicationFigures, publicationFigurePlacements } from '../figures.js'
import {
  canonicalPatternOrder,
  primerPublicationEntries,
  publicationEntries,
  smokePublicationEntries,
  type PublicationEntry
} from '../publication.js'
import { readPublicationScope, renderPublicationScope } from '../scope-report.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const unsupportedSourceConstructs = [
  { label: '<script setup>', test: /<script\s+setup\b/i },
  { label: 'Vue v-if/v-for directive', test: /\bv-(?:if|for|else|show)\s*=/i },
  { label: 'Vue template interpolation', test: /\{\{[^}]+\}\}/ }
]

function localPath(source: string): string {
  const absolute = resolve(repoRoot, source)
  if (!absolute.startsWith(`${repoRoot}/`) && absolute !== repoRoot) {
    throw new Error(`Publication source escapes repository root: ${source}`)
  }
  return absolute
}

function validateLocalImages(source: string, markdown: string): void {
  const sourceDirectory = dirname(localPath(source))
  const imagePattern = /!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g

  for (const match of markdown.matchAll(imagePattern)) {
    const href = match[1]
    if (/^(?:[a-z]+:|#|\/)/i.test(href)) continue

    const pathOnly = href.split(/[?#]/, 1)[0]
    const target = resolve(sourceDirectory, pathOnly)
    if (!existsSync(target)) throw new Error(`Missing local image in ${source}: ${href}`)
  }
}

function validateEntries(label: string, entries: readonly PublicationEntry[]): void {
  const ids = new Set<string>()
  const sources = new Set<string>()

  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error(`Duplicate ${label} entry id: ${entry.id}`)
    ids.add(entry.id)

    if (sources.has(entry.source)) throw new Error(`Duplicate ${label} primary source: ${entry.source}`)
    sources.add(entry.source)

    if (extname(entry.source) !== '.md') throw new Error(`${label} source must be Markdown: ${entry.source}`)

    const allSources = [entry.source, ...dependenciesForAdapter(entry.adapter)]
    for (const source of allSources) {
      const sourcePath = localPath(source)
      if (!existsSync(sourcePath) || !lstatSync(sourcePath).isFile()) {
        throw new Error(`Missing ${label} source: ${source}`)
      }

      const markdown = readFileSync(sourcePath, 'utf8')
      const mayContainVue = source === entry.source && (
        entry.adapter === 'pattern-index' || entry.adapter === 'primer-patterns'
      )
      if (!mayContainVue) {
        for (const construct of unsupportedSourceConstructs) {
          if (construct.test.test(markdown)) {
            throw new Error(
              `${source} contains ${construct.label}; add an explicit print adapter instead of silently degrading it.`
            )
          }
        }
      }
      validateLocalImages(source, markdown)
    }

    const sourceMarkdown = readFileSync(localPath(entry.source), 'utf8')
    const adapted = applyAdapter(entry.adapter, sourceMarkdown, {
      repoRoot,
      workSourceRoot: repoRoot
    })
    const composed = label === 'publication'
      ? applyPublicationFigures(entry.id, adapted)
      : adapted
    if (!composed.trim()) throw new Error(`${label} composition produced empty output for ${entry.source}`)
    validateLocalImages(entry.source, composed)

    if (entry.patternId) {
      const markdown = readFileSync(localPath(entry.source), 'utf8')
      const sourceId = readFrontmatterValue(markdown, 'id')
      const state = readFrontmatterValue(markdown, 'state')
      if (sourceId !== entry.patternId) {
        throw new Error(`${entry.source}: manifest id ${entry.patternId} does not match frontmatter ${sourceId}`)
      }
      if (state !== 'active') throw new Error(`${entry.source}: publication pattern must be active, got ${state}`)
    }
  }
}

function validateScopeReport(): void {
  const source = 'docs/development/print-publication-scope-crosswalk.md'
  const markdown = readFileSync(localPath(source), 'utf8')
  const actual = readPublicationScope(markdown)
  const expected = renderPublicationScope(publicationEntries)

  if (actual !== expected) {
    throw new Error(
      `${source}: generated Working Edition manifest is stale; run npm run publication:scope:update and review the scope change.`
    )
  }
}

function validateFigureRegister(): void {
  const entryIds = new Set(publicationEntries.map((entry) => entry.id))
  const figureIds = new Set<string>()
  const images = new Set<string>()

  for (const placement of publicationFigurePlacements()) {
    if (!entryIds.has(placement.entryId)) {
      throw new Error(`${placement.id} targets unknown publication entry ${placement.entryId}.`)
    }
    if (figureIds.has(placement.id)) throw new Error(`Duplicate publication figure id: ${placement.id}`)
    if (images.has(placement.image)) throw new Error(`Publication figure reused unexpectedly: ${placement.image}`)
    figureIds.add(placement.id)
    images.add(placement.image)
  }

  const expected = Array.from({ length: 11 }, (_, index) => `D-F${String(index + 1).padStart(2, '0')}`)
  for (const id of expected) {
    if (!figureIds.has(id)) throw new Error(`Missing retained PR-00D publication figure placement: ${id}`)
  }
  if (figureIds.has('D-F12') || figureIds.has('D-F13')) {
    throw new Error('D-F12/D-F13 are intentionally omitted; add them only after an explicit PR-00D decision.')
  }
}

validateEntries('smoke', smokePublicationEntries)
validateEntries('primer', primerPublicationEntries)
validateEntries('publication', publicationEntries)
validateFigureRegister()
validateScopeReport()

const mermaidFixture = smokePublicationEntries.find((entry) => entry.smokeOnly)
if (!mermaidFixture) throw new Error('G1 requires one explicitly smoke-only Mermaid fixture.')
if (!readFileSync(localPath(mermaidFixture.source), 'utf8').includes('```mermaid')) {
  throw new Error(`${mermaidFixture.source} no longer contains the Mermaid fixture expected by G1.`)
}

const fullPatternIds = publicationEntries
  .map((entry) => entry.patternId)
  .filter((id): id is string => Boolean(id))
if (fullPatternIds.length !== canonicalPatternOrder.length) {
  throw new Error(`Expected ${canonicalPatternOrder.length} canonical patterns, found ${fullPatternIds.length}.`)
}
for (let index = 0; index < canonicalPatternOrder.length; index += 1) {
  if (fullPatternIds[index] !== canonicalPatternOrder[index]) {
    throw new Error(
      `Canonical pattern order mismatch at ${index + 1}: expected ${canonicalPatternOrder[index]}, got ${fullPatternIds[index]}`
    )
  }
}

console.log(
  `Publication manifests, adapters, PR-00D figure composition and generated scope report valid: ${smokePublicationEntries.length} smoke entries; ${primerPublicationEntries.length} Primer entries; ${publicationEntries.length} Working Edition entries.`
)
