import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import {
  nomenclatureFamilies,
  nomenclaturePattern,
  type NomenclatureFamily,
  type NomenclatureSurface
} from '../project/nomenclature.js'
import { isPublicSource } from '../project/public-surface.js'
import { routeForSource } from '../project/site-routes.js'

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
 * must not appear in public source, reader-visible rendered site content or
 * publication text. PUBLIC_TECHNICAL/PUBLIC_REFERENCE families are deliberately
 * not judged here; their finer placement rules are checked by semantic/editorial
 * audits rather than pretending regex alone can distinguish context.
 */
const readerProhibitedFamilies = nomenclatureFamilies.filter(
  (family) => !family.allowedSurfaces.some((surface) => readerSurfaces.has(surface))
)

interface Failure {
  path: string
  family: string
  matches: readonly string[]
  contexts: readonly string[]
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

function repoPath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

function familyOccurrences(
  family: NomenclatureFamily,
  text: string
): { matches: string[]; contexts: string[] } {
  const occurrences = [...text.matchAll(nomenclaturePattern(family))]
  const matches = [...new Set(occurrences.map((match) => match[0]))].slice(0, 6)
  const contexts = occurrences.slice(0, 3).map((match) => {
    const index = match.index ?? 0
    const start = Math.max(0, index - 80)
    const end = Math.min(text.length, index + match[0].length + 80)
    return text.slice(start, end).replace(/\s+/g, ' ').trim()
  })
  return { matches, contexts }
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) return markdown
  const end = markdown.indexOf('\n---\n', 4)
  return end < 0 ? markdown : markdown.slice(end + 5)
}

function isPublicMachinePath(path: string): boolean {
  return (
    path.startsWith('docs/reference-house/generated/') ||
    path.includes('/docs/reference-house/generated/') ||
    path.includes('/reference-house/generated/')
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
    const occurrence = familyOccurrences(family, sourceTextForFamily(path, family, text))
    if (!occurrence.matches.length) continue
    failures.push({ path, family: family.id, ...occurrence })
  }
}

function scan(path: string, text: string, failures: Failure[]): void {
  for (const family of readerProhibitedFamilies) {
    if (familyAllowedOnPublicMachine(path, family)) continue
    const occurrence = familyOccurrences(family, text)
    if (!occurrence.matches.length) continue
    failures.push({ path, family: family.id, ...occurrence })
  }
}

function publicSiteSources(): Set<string> {
  const sources = new Set<string>(['README.md'])
  for (const absolute of collectMarkdown(resolve(repoRoot, 'docs'))) {
    const source = repoPath(absolute)
    if (isPublicSource(source)) sources.add(source)
  }
  return sources
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
  const sources = publicSiteSources()
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

function renderedHtmlPath(siteRoot: string, source: string): string {
  const route = routeForSource(source)
  if (route === '/') return resolve(siteRoot, 'index.html')
  const relativeRoute = route.replace(/^\//, '')
  if (relativeRoute.endsWith('/')) return resolve(siteRoot, relativeRoute, 'index.html')
  return resolve(siteRoot, `${relativeRoute}.html`)
}

/**
 * Raw VitePress HTML contains non-reader implementation data: hydration state,
 * bundled search/config payloads and build metadata. Those strings are not
 * publication typography and scanning them creates false cross-page leakage.
 *
 * The rendered gate therefore scans the actual body after removing non-visible
 * executable/style/template payloads. Navigation, headings, prose, tables and
 * other SSR-visible text remain in scope.
 */
function readerVisibleHtml(html: string): string {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html
  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, "'")
    .replace(/\s+/g, ' ')
}

function assertNoInternalRenderedTrees(siteRoot: string): void {
  const leakedRoots = ['compiler', 'publication', 'project', 'scripts'].filter((name) =>
    existsSync(resolve(siteRoot, name))
  )
  if (leakedRoots.length) {
    throw new Error(
      `Rendered public site contains repository-only top-level trees: ${leakedRoots.join(', ')}. ` +
        'Fix the VitePress source boundary rather than excluding them from nomenclature validation.'
    )
  }
}

function validateRendered(): Failure[] {
  const failures: Failure[] = []
  const siteRoot = resolve(repoRoot, '.vitepress/dist')
  if (!existsSync(siteRoot)) {
    throw new Error('Missing rendered site required by NOM validation: .vitepress/dist')
  }

  assertNoInternalRenderedTrees(siteRoot)

  for (const source of [...publicSiteSources()].sort()) {
    const absolute = renderedHtmlPath(siteRoot, source)
    if (!existsSync(absolute)) {
      throw new Error(`Missing rendered public route required by NOM validation: ${source} -> ${repoPath(absolute)}`)
    }
    scan(`rendered-site:${repoPath(absolute)}`, readerVisibleHtml(readFileSync(absolute, 'utf8')), failures)
  }

  const notFound = resolve(siteRoot, '404.html')
  if (existsSync(notFound)) {
    scan(`rendered-site:${repoPath(notFound)}`, readerVisibleHtml(readFileSync(notFound, 'utf8')), failures)
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
      .map((failure) => {
        const contexts = failure.contexts.length
          ? `\n${failure.contexts.map((context) => `      context: ${JSON.stringify(context)}`).join('\n')}`
          : ''
        return `  - ${failure.path}: ${failure.family} (${failure.matches
          .map((value) => JSON.stringify(value))
          .join(', ')})${contexts}`
      })
      .join('\n')}`
  )
}

console.log(
  `Public nomenclature valid (${sourceMode ? 'source' : 'rendered'}): no registry family prohibited from reader surfaces is exposed.`
)
