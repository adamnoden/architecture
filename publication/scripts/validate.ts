import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAdapter, dependenciesForAdapter, readFrontmatterValue } from '../adapters.js'
import { applyPublicationFigures, publicationFigurePlacements } from '../figures.js'
import { publicationPlatePlacements } from '../plates.js'
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
const patternMachineId = /\b(?:HSA-P|PAT)-\d{3}\b/

function localPath(source: string): string {
  const absolute = resolve(repoRoot, source)
  if (!absolute.startsWith(`${repoRoot}/`) && absolute !== repoRoot) {
    throw new Error(`Publication source escapes repository root: ${source}`)
  }
  return absolute
}

function validateLocalImages(source: string, markdown: string): void {
  const sourceDirectory = dirname(localPath(source))
  const hrefs = [
    ...[...markdown.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)].map((match) => match[1]),
    ...[...markdown.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1])
  ]

  for (const href of hrefs) {
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
      if (patternMachineId.test(entry.title)) {
        throw new Error(
          `${entry.source}: reader-facing pattern title must not be constructed from machine identity (${entry.title}).`
        )
      }

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
  const images = new Set<string>()
  const expectedImages = new Set([
    'figures/selective-permanence-platform.svg',
    'figures/designed-interface-functions.svg',
    'figures/failure-architecture-sequence.svg',
    'figures/maintenance-geography-route.svg',
    '../docs/manuscript/figures/pattern-language-fields-sequence.svg'
  ])

  for (const placement of publicationFigurePlacements()) {
    if (!entryIds.has(placement.entryId)) {
      throw new Error(`${placement.image} targets unknown publication entry ${placement.entryId}.`)
    }
    if (images.has(placement.image)) throw new Error(`Publication figure reused unexpectedly: ${placement.image}`)
    images.add(placement.image)
  }

  for (const image of expectedImages) {
    if (!images.has(image)) throw new Error(`Missing retained publication figure placement: ${image}`)
  }
  if (images.size !== expectedImages.size) {
    const unexpected = [...images].filter((image) => !expectedImages.has(image))
    throw new Error(`Unexpected publication figure placement(s): ${unexpected.join(', ')}`)
  }
}

function validatePlateRegister(): void {
  const placements = publicationPlatePlacements()
  const views = placements.flatMap((placement) => placement.views)
  const expectedImages = new Set([
    '../reference-house/publication-ground-floor-plan.svg',
    '../reference-house/publication-first-floor-plan.svg',
    '../reference-house/publication-synthetic-setting.svg',
    '../reference-house/publication-external-maintenance-setting-overlay.svg',
    '../reference-house/publication-principal-front-elevation.svg',
    '../reference-house/publication-principal-section.svg',
    '../reference-house/publication-courtyard-elevation.svg',
    '../reference-house/publication-structural-span-overlay.svg',
    '../reference-house/publication-service-transverse-section.svg',
    '../reference-house/publication-service-side-elevation.svg',
    '../reference-house/publication-ground-service-maintenance-overlay.svg',
    '../reference-house/publication-first-service-maintenance-overlay.svg',
    '../reference-house/publication-roof-drainage.svg',
    '../reference-house/publication-roof-water-failure-overlay.svg',
    '../reference-house/publication-garden-elevation.svg',
    '../reference-house/publication-sectional-axonometric.svg',
    '../reference-house/publication-future-adaptation-overlay.svg'
  ])
  const actualImages = new Set(views.map((view) => view.image))

  if (placements.some((placement) => placement.entryId !== 'part-iv')) {
    throw new Error('Architectural plate placements are restricted to Part IV.')
  }
  if (views.length !== expectedImages.size || actualImages.size !== expectedImages.size) {
    throw new Error(`Expected ${expectedImages.size} unique controlled Part IV plate views, got ${views.length}.`)
  }
  for (const placement of placements) {
    const expectedViewCount = placement.pageClass === 'PLATE_PAIR' ? 2 : 1
    if (placement.views.length !== expectedViewCount) {
      throw new Error(`${placement.pageClass} at ${placement.anchor} must contain ${expectedViewCount} view(s).`)
    }
  }
  for (const image of expectedImages) {
    if (!actualImages.has(image)) throw new Error(`Missing controlled Part IV plate placement: ${image}`)
  }
  for (const image of actualImages) {
    if (!expectedImages.has(image)) throw new Error(`Unexpected Part IV plate placement: ${image}`)
  }
}

validateEntries('smoke', smokePublicationEntries)
validateEntries('primer', primerPublicationEntries)
validateEntries('publication', publicationEntries)
validateFigureRegister()
validatePlateRegister()
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

const numericPatternOrder = [...canonicalPatternOrder].sort((left, right) => left.localeCompare(right))
if (canonicalPatternOrder.every((id, index) => id === numericPatternOrder[index])) {
  throw new Error(
    'Pattern publication order has collapsed to machine-ID order; reading sequence must remain an explicit independent editorial decision.'
  )
}

console.log(
  `Publication manifests, adapters, figure/plate composition and generated scope report valid: ${smokePublicationEntries.length} smoke entries; ${primerPublicationEntries.length} Primer entries; ${publicationEntries.length} Working Edition entries.`
)
