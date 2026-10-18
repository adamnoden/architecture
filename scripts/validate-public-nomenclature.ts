import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, posix, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  nomenclatureFamilies,
  nomenclaturePattern,
  type NomenclatureFamily,
  type NomenclatureSurface
} from '../project/nomenclature.js'
import { isPublicSource } from '../project/public-surface.js'
import { routeForSource } from '../project/site-routes.js'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { publicationFigurePlacements } from '../publication/figures.js'
import { extractPdfText } from '../publication/pdf-inspector.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import { projectIdentity } from '../project/identity.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '..')
const args = new Set(process.argv.slice(2))
const sourceMode = args.has('--source')
const renderedMode = args.has('--rendered')

if (sourceMode === renderedMode) {
  throw new Error('Choose exactly one public nomenclature validation mode: --source or --rendered.')
}

interface Failure {
  source: string
  family: string
  classification: string
  surface: NomenclatureSurface
  match: string
  context: string
}

function sourcePath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

function walk(root: string): string[] {
  if (!existsSync(root)) return []
  const files: string[] = []
  for (const entry of readdirSync(root)) {
    const absolute = resolve(root, entry)
    if (statSync(absolute).isDirectory()) files.push(...walk(absolute))
    else files.push(absolute)
  }
  return files
}

function surfaceForSource(path: string): NomenclatureSurface {
  if (path.startsWith('docs/computational/')) return 'SITE_TECHNICAL'
  if (path.startsWith('docs/reference-house/generated/')) return 'SITE_TECHNICAL'
  if (path === 'docs/reference-house/g01-v0.1-conformance-d12.md') return 'SITE_TECHNICAL'
  if (path === 'docs/patterns/language-model.md') return 'SITE_TECHNICAL'
  if (path.startsWith('docs/grammar/') && !path.endsWith('/README.md')) return 'SITE_TECHNICAL'
  return 'SITE_PRIMARY'
}

function surfaceForPublication(path: string): NomenclatureSurface {
  if (path.includes('primer')) return 'BOOK_PRIMARY'
  return 'BOOK_PRIMARY'
}

function failsSurface(family: NomenclatureFamily, surface: NomenclatureSurface): boolean {
  return !family.allowedSurfaces.includes(surface)
}

function contextAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 70)
  const end = Math.min(text.length, index + length + 70)
  return text.slice(start, end).replace(/\s+/g, ' ').trim()
}

function scanText(
  source: string,
  text: string,
  surface: NomenclatureSurface,
  failures: Failure[]
): void {
  for (const family of nomenclatureFamilies) {
    if (!failsSurface(family, surface)) continue
    const regex = nomenclaturePattern(family)
    for (const match of text.matchAll(regex)) {
      failures.push({
        source,
        family: family.id,
        classification: family.classification,
        surface,
        match: match[0],
        context: contextAround(text, match.index ?? 0, match[0].length)
      })
    }
  }
}

function stripSourceTechnicalRegions(source: string, text: string): string {
  if (source.endsWith('.svg')) return text

  let result = text
  if (result.startsWith('---\n')) {
    const end = result.indexOf('\n---\n', 4)
    if (end >= 0) result = result.slice(end + 5)
  }

  result = result
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '')
    .replace(/<!--([\s\S]*?)-->/g, '')

  return result
}

function scanSource(source: string, text: string, failures: Failure[]): void {
  scanText(source, stripSourceTechnicalRegions(source, text), surfaceForSource(source), failures)
}

function publicSiteSources(): Set<string> {
  const sources = new Set<string>(['README.md'])
  for (const file of walk(resolve(repoRoot, 'docs'))) {
    const source = sourcePath(file)
    if (!source.endsWith('.md')) continue
    if (!isPublicSource(source)) continue
    sources.add(source)
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

/**
 * Publication figures are reader-facing content in their own right. Scanning
 * only the Markdown that embeds them misses text authored inside SVGs — the
 * exact class of leak that exposed machine pattern IDs in the book. Resolve
 * assets from the canonical placement registry so this remains bounded to
 * figures that actually enter the publication rather than every repository SVG.
 */
function publicationFigureSources(): Set<string> {
  const sourceByEntry = new Map(publicationEntries.map((entry) => [entry.id, entry.source]))
  const sources = new Set<string>()

  for (const placement of publicationFigurePlacements()) {
    const entrySource = sourceByEntry.get(placement.entryId)
    if (!entrySource) {
      throw new Error(`Publication figure ${placement.image} references unknown entry ${placement.entryId}.`)
    }
    if (/^(?:[a-z]+:|\/\/)/i.test(placement.image)) continue

    const target = posix.normalize(posix.join(posix.dirname(entrySource), placement.image))
    if (target.endsWith('.svg')) sources.add(target)
  }

  return sources
}

function validateSource(): Failure[] {
  const failures: Failure[] = []
  const sources = publicSiteSources()
  for (const source of publicationSources()) sources.add(source)
  for (const source of publicationFigureSources()) sources.add(source)

  for (const source of [...sources].sort()) {
    const absolute = resolve(repoRoot, source)
    if (!existsSync(absolute)) {
      throw new Error(`Missing reader-facing source required by NOM validation: ${source}`)
    }
    scanSource(source, readFileSync(absolute, 'utf8'), failures)
  }

  return failures
}

function renderedSiteFiles(): { root: string; files: string[] } {
  const root = resolve(repoRoot, '.vitepress/dist')
  const files = walk(root).filter((file) => file.endsWith('.html'))
  if (!files.length) {
    throw new Error(`Rendered public-site nomenclature validation found no HTML under ${root}.`)
  }
  return { root, files }
}

function routeForRenderedSiteFile(root: string, file: string): string {
  const rendered = relative(root, file).split(sep).join('/')
  if (rendered === 'index.html') return '/'
  if (rendered.endsWith('/index.html')) return `/${rendered.slice(0, -'index.html'.length)}`
  return `/${rendered.replace(/\.html$/, '')}`
}

function renderedSiteSurface(root: string, file: string): NomenclatureSurface {
  const surfaceByRoute = new Map<string, NomenclatureSurface>()
  for (const source of publicSiteSources()) {
    surfaceByRoute.set(routeForSource(source), surfaceForSource(source))
  }
  return surfaceByRoute.get(routeForRenderedSiteFile(root, file)) ?? 'SITE_PRIMARY'
}

/**
 * Rendered nomenclature is a reader-surface check, not a byte-level scan of
 * build plumbing. Asset URLs, cache-busting hashes and script/style payloads
 * are implementation metadata and can coincidentally contain compact tokens
 * such as `M1`. Strip those regions while preserving title/body text so the
 * validator remains strict on content a reader can actually encounter.
 */
function renderedHtmlReaderText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal: string) => String.fromCodePoint(Number.parseInt(decimal, 10)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
}

function renderedPublicationPdfs(): string[] {
  const dist = resolve(repoRoot, 'publication/dist')
  const files = [
    resolve(dist, `${projectIdentity.slug}.pdf`),
    resolve(dist, `${projectIdentity.slug}-primer.pdf`)
  ]
  const missing = files.filter((file) => !existsSync(file))
  if (missing.length) {
    throw new Error(
      `Missing required rendered publication PDF(s): ${missing.map((file) => sourcePath(file)).join(', ')}`
    )
  }
  return files
}

async function validateRendered(): Promise<Failure[]> {
  const failures: Failure[] = []
  const site = renderedSiteFiles()
  const pdfs = renderedPublicationPdfs()

  for (const file of site.files) {
    scanText(
      sourcePath(file),
      renderedHtmlReaderText(readFileSync(file, 'utf8')),
      renderedSiteSurface(site.root, file),
      failures
    )
  }

  for (const file of pdfs) {
    scanText(
      sourcePath(file),
      await extractPdfText(file),
      surfaceForPublication(sourcePath(file)),
      failures
    )
  }

  return failures
}

const failures = sourceMode ? validateSource() : await validateRendered()
if (failures.length) {
  for (const failure of failures) {
    console.error(
      `[${failure.surface}] ${failure.source}: ${failure.family} (${failure.classification}) matched “${failure.match}” — ${failure.context}`
    )
  }
  throw new Error(`Public nomenclature validation failed with ${failures.length} occurrence(s).`)
}

console.log(
  `Public nomenclature ${sourceMode ? 'source' : 'rendered'} validation passed.`
)
