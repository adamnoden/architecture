import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import {
  nomenclatureFamilies,
  nomenclaturePattern,
  type NomenclatureFamily,
  type NomenclatureSurface
} from '../project/nomenclature.js'
import { isPublicSource } from '../project/public-surface.js'

const repoRoot = process.cwd()
const sourceMode = process.argv.includes('--source')
const renderedMode = process.argv.includes('--rendered')

if (sourceMode === renderedMode) {
  throw new Error('Choose exactly one nomenclature validation mode: --source or --rendered.')
}

const readerSurfaces = new Set<NomenclatureSurface>([
  'BOOK_PRIMARY',
  'BOOK_TECHNICAL',
  'SITE_PRIMARY',
  'SITE_TECHNICAL'
])

/**
 * High-confidence enforcement boundary.
 *
 * If a family has no reader-facing surface in the canonical NOM registry, it
 * must not appear in public source, rendered site HTML or publication text.
 * PUBLIC_TECHNICAL/PUBLIC_REFERENCE families are deliberately not judged here;
 * their finer placement rules are checked by semantic/editorial audits rather
 * than pretending regex alone can distinguish context.
 */
const readerProhibitedFamilies = nomenclatureFamilies.filter(
  (family) => !family.allowedSurfaces.some((surface) => readerSurfaces.has(surface))
)

interface Failure {
  path: string
  family: string
  matches: readonly string[]
}

function collectMarkdown(dir: string): string[] {
  const files: string[] = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

function collectHtml(dir: string): string[] {
  const files: string[] = []
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectHtml(path))
    else if (entry.isFile() && extname(entry.name) === '.html') files.push(path)
  }
  return files
}

function repoPath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

function matchesFor(family: NomenclatureFamily, text: string): string[] {
  return [...text.matchAll(nomenclaturePattern(family))].map((match) => match[0])
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) return markdown
  const end = markdown.indexOf('\n---\n', 4)
  return end < 0 ? markdown : markdown.slice(end + 5)
}

function isPublicMachinePath(path: string): boolean {
  return (
    path.startsWith('docs/reference-house/generated/') ||
    path.includes('/docs/reference-house/generated/')
  )
}

function familyAllowedOnPublicMachine(path: string, family: NomenclatureFamily): boolean {
  return isPublicMachinePath(path) && family.allowedSurfaces.includes('PUBLIC_MACHINE')
}

function sourceTextForFamily(path: string, family: NomenclatureFamily, text: string): string {
  if (
    family.id === 'pattern.pat' &&
    /^docs\/patterns\/(?:retired\/)?[^/]+\.md$/.test(path)
  ) {
    return stripFrontmatter(text)
  }
  return text
}

function scanSource(path: string, text: string, failures: Failure[]): void {
  for (const family of readerProhibitedFamilies) {
    if (familyAllowedOnPublicMachine(path, family)) continue
    const matches = matchesFor(family, sourceTextForFamily(path, family, text))
    if (!matches.length) continue
    failures.push({
      path,
      family: family.id,
      matches: [...new Set(matches)].slice(0, 6)
    })
  }
}

function scan(path: string, text: string, failures: Failure[]): void {
  for (const family of readerProhibitedFamilies) {
    if (familyAllowedOnPublicMachine(path, family)) continue
    const matches = matchesFor(family, text)
    if (!matches.length) continue
    failures.push({
      path,
      family: family.id,
      matches: [...new Set(matches)].slice(0, 6)
    })
  }
}

function publicationSources(): Set<string> {
  const sources = new Set<string>()
  for (const entry of [...publicationEntries, ...primerPublicationEntries]) {
    sources.add(entry.source)
    for (const dependency of dependenciesForAdapter(entry.adapter)) sources.add(dependency)
  }
  return sources
}

function validateSource(): Failure[] {
  const failures: Failure[] = []
  const sources = new Set<string>()

  sources.add('README.md')
  for (const absolute of collectMarkdown(resolve(repoRoot, 'docs'))) {
    const source = repoPath(absolute)
    if (isPublicSource(source)) sources.add(source)
  }
  for (const source of publicationSources()) sources.add(source)

  for (const source of [...sources].sort()) {
    const absolute = resolve(repoRoot, source)
    if (!existsSync(absolute)) continue
    scanSource(source, readFileSync(absolute, 'utf8'), failures)
  }

  return failures
}

function pdfText(path: string): string {
  const absolute = resolve(repoRoot, path)
  if (!existsSync(absolute)) throw new Error(`Missing rendered publication required by NOM validation: ${path}`)
  return execFileSync('pdftotext', [absolute, '-'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024
  })
}

function validateRendered(): Failure[] {
  const failures: Failure[] = []
  const siteRoot = resolve(repoRoot, '.vitepress/dist')
  if (!existsSync(siteRoot)) {
    throw new Error('Missing rendered site required by NOM validation: .vitepress/dist')
  }

  for (const absolute of collectHtml(siteRoot)) {
    scan(`rendered-site:${repoPath(absolute)}`, readFileSync(absolute, 'utf8'), failures)
  }

  scan('publication/dist/ovids-house.pdf', pdfText('publication/dist/ovids-house.pdf'), failures)
  scan(
    'publication/dist/ovids-house-primer.pdf',
    pdfText('publication/dist/ovids-house-primer.pdf'),
    failures
  )

  return failures
}

const failures = sourceMode ? validateSource() : validateRendered()

if (failures.length) {
  throw new Error(
    `Public nomenclature validation failed (${sourceMode ? 'source' : 'rendered'}):\n${failures
      .map(
        (failure) =>
          `  - ${failure.path}: ${failure.family} (${failure.matches.map((value) => JSON.stringify(value)).join(', ')})`
      )
      .join('\n')}`
  )
}

console.log(
  `Public nomenclature valid (${sourceMode ? 'source' : 'rendered'}): no registry family prohibited from reader surfaces is exposed.`
)
