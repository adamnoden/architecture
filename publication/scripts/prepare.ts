import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { projectIdentity } from '../../project/identity.js'
import { applyAdapter, dependenciesForAdapter } from '../adapters.js'
import { applyPublicationFigures } from '../figures.js'
import {
  primerPublicationEntries,
  publicationEntries,
  smokePublicationEntries,
  type PublicationEntry
} from '../publication.js'
import { applyProductionTypography } from './typography.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const workSourceRoot = resolve(workRoot, 'source')
const liveBaseUrl = 'https://adamnoden.github.io/architecture/'
const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)([^)]*)\)/g

const smokeMode = process.argv.includes('--smoke')
const fullMode = process.argv.includes('--full')
const primerMode = process.argv.includes('--primer')
const selectedModes = [smokeMode, fullMode, primerMode].filter(Boolean).length
if (selectedModes !== 1) throw new Error('Choose exactly one publication mode: --smoke, --full or --primer.')

const entries: readonly PublicationEntry[] = smokeMode
  ? smokePublicationEntries
  : primerMode
    ? primerPublicationEntries
    : publicationEntries
const mode = smokeMode ? 'smoke' : primerMode ? 'primer' : 'full'

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}
function repoPath(path: string): string { return resolve(repoRoot, path) }
function workPath(path: string): string { return resolve(workSourceRoot, path) }
function gitOutput(args: string[]): string { return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim() }

function editionMetadata(): { revision: string; dateIso: string; dateDisplay: string } {
  const revision = (process.env.GITHUB_SHA ?? gitOutput(['rev-parse', 'HEAD'])).slice(0, 7)
  const dateIso = gitOutput(['show', '-s', '--format=%cs', 'HEAD'])
  const dateDisplay = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${dateIso}T00:00:00Z`))
  return { revision, dateIso, dateDisplay }
}

function resolveCanonicalTarget(source: string, hrefPath: string): string | null {
  const sourceDirectory = posix.dirname(source)
  let target = posix.normalize(posix.join(sourceDirectory, hrefPath))
  if (target.startsWith('../') || target === '..') return null
  const absolute = repoPath(target)
  if (existsSync(absolute) && lstatSync(absolute).isDirectory()) target = posix.join(target, 'README.md')
  return target
}
function liveUrlFor(target: string, suffix: string): string {
  if (target === 'README.md') return `${liveBaseUrl}${suffix}`
  let route = target
  if (route.endsWith('/README.md')) route = route.slice(0, -'README.md'.length)
  else if (route.endsWith('.md')) route = route.slice(0, -'.md'.length)
  return `${liveBaseUrl}${route}${suffix}`
}
function internalHtmlHref(source: string, target: string, suffix: string): string {
  const sourceDirectory = posix.dirname(source)
  const targetHtml = target.replace(/\.md$/, '.html')
  const relative = posix.relative(sourceDirectory, targetHtml)
  return `${relative || posix.basename(targetHtml)}${suffix}`
}
function rewritePublicationLinks(source: string, markdown: string, included: Set<string>): string {
  return markdown.replace(markdownLinkPattern, (whole, rawHref: string, tail: string) => {
    if (/^(?:[a-z]+:|#|\/)/i.test(rawHref)) return whole
    const suffixIndex = rawHref.search(/[?#]/)
    const hrefPath = suffixIndex >= 0 ? rawHref.slice(0, suffixIndex) : rawHref
    const suffix = suffixIndex >= 0 ? rawHref.slice(suffixIndex) : ''
    const target = resolveCanonicalTarget(source, hrefPath)
    if (!target) return whole
    const targetAbsolute = repoPath(target)
    if (!existsSync(targetAbsolute)) return whole
    const isMarkdownTarget = target.endsWith('.md') && lstatSync(targetAbsolute).isFile()
    const rewrittenHref = isMarkdownTarget
      ? included.has(target) ? internalHtmlHref(source, target, suffix) : liveUrlFor(target, suffix)
      : liveUrlFor(target, suffix)
    return whole.replace(`${rawHref}${tail})`, `${rewrittenHref}${tail})`)
  })
}
function assertNoLocalRepositoryLinks(source: string, markdown: string): void {
  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const href = match[1]
    if (/^(?:[a-z]+:|#|\/)/i.test(href)) continue
    const hrefPath = href.split(/[?#]/, 1)[0]
    if (hrefPath.endsWith('.html')) continue
    const target = resolveCanonicalTarget(source, hrefPath)
    if (target && existsSync(repoPath(target))) throw new Error(`Prepared publication still contains a local repository link in ${source}: ${href}`)
    if (hrefPath.endsWith('.md')) throw new Error(`Prepared publication still contains a local Markdown link in ${source}: ${href}`)
  }
}
function stripPreparedFrontmatter(source: string, markdown: string): string {
  if (!markdown.startsWith('---\n')) return markdown
  const end = markdown.indexOf('\n---\n', 4)
  if (end < 0) throw new Error(`Unclosed frontmatter in publication source: ${source}`)
  return markdown.slice(end + 5).trimStart()
}
function normalizePreparedHeading(entry: PublicationEntry, markdown: string): string {
  if (entry.kind !== 'back-matter') return markdown
  return markdown.replace(/^# .+$/m, `# ${entry.title}`)
}

function writeTitlePage(metadata: ReturnType<typeof editionMetadata>, editionLabel: 'Working Edition' | 'Primer'): string {
  const path = 'publication-title.html'
  writeFileSync(workPath(path), `<!doctype html>\n<html lang="en-GB">\n<head>\n  <meta charset="utf-8">\n  <title>${projectIdentity.name} — ${editionLabel}</title>\n</head>\n<body class="publication-title-page">\n  <main class="publication-title">\n    <div class="publication-title__primary">\n      <p class="publication-title__edition">${editionLabel}</p>\n      <h1>${projectIdentity.name}</h1>\n    </div>\n    <div class="publication-title__meta">\n      <p>${metadata.dateDisplay}</p>\n      <p>Revision <code>${metadata.revision}</code></p>\n      <p><a href="${liveBaseUrl}">adamnoden.github.io/architecture/</a></p>\n    </div>\n  </main>\n</body>\n</html>\n`)
  return path
}
function writeContentsTemplate(): string {
  const path = 'publication-contents.html'
  writeFileSync(workPath(path), '<!doctype html>\n<html lang="en-GB">\n<head>\n  <meta charset="utf-8">\n  <title>Contents</title>\n</head>\n<body class="publication-contents-page">\n  <nav id="toc" role="doc-toc"></nav>\n</body>\n</html>\n')
  return path
}

rmSync(workRoot, { recursive: true, force: true })
mkdirSync(workSourceRoot, { recursive: true })
cpSync(repoPath('docs'), workPath('docs'), { recursive: true })
copyFileSync(repoPath('README.md'), workPath('README.md'))
mkdirSync(workPath('publication'), { recursive: true })
cpSync(repoPath('publication/primer'), workPath('publication/primer'), { recursive: true })
copyFileSync(repoPath('publication/part-iii.md'), workPath('publication/part-iii.md'))

const metadata = editionMetadata()
const titlePage = smokeMode ? null : writeTitlePage(metadata, primerMode ? 'Primer' : 'Working Edition')
const contentsPage = smokeMode ? null : writeContentsTemplate()
const canonicalSources = new Set(entries.flatMap((entry) => [entry.source, ...dependenciesForAdapter(entry.adapter)]))
const canonicalHashes = new Map([...canonicalSources].map((source) => [source, sha256(repoPath(source))]))
const included = new Set(entries.map((entry) => entry.source))

for (const entry of entries) {
  const preparedPath = workPath(entry.source)
  let markdown = readFileSync(preparedPath, 'utf8')
  markdown = applyAdapter(entry.adapter, markdown, { repoRoot, workSourceRoot })
  markdown = stripPreparedFrontmatter(entry.source, markdown)
  if (fullMode) markdown = applyPublicationFigures(entry.id, markdown)
  markdown = normalizePreparedHeading(entry, markdown)
  if (markdown.includes('```mermaid')) {
    const renderedPath = `${preparedPath}.mmdc.md`
    const mermaidArgs = ['-i', preparedPath, '-o', renderedPath, '-t', 'neutral', '-b', 'transparent']
    if (process.env.CI) mermaidArgs.unshift('-p', resolve(publicationRoot, 'puppeteer.ci.json'))
    execFileSync('mmdc', mermaidArgs, { stdio: 'inherit' })
    renameSync(renderedPath, preparedPath)
    markdown = readFileSync(preparedPath, 'utf8')
  }
  markdown = rewritePublicationLinks(entry.source, markdown, included)
  assertNoLocalRepositoryLinks(entry.source, markdown)
  writeFileSync(preparedPath, markdown)
}

for (const [source, before] of canonicalHashes) {
  const after = sha256(repoPath(source))
  if (before !== after) throw new Error(`Preparation mutated canonical source: ${source}`)
}

const buildTitle = smokeMode ? `${projectIdentity.name} — Publication Smoke` : primerMode ? `${projectIdentity.name} — Primer` : `${projectIdentity.name} — Working Edition`
const output = smokeMode ? `${projectIdentity.slug}-smoke.pdf` : primerMode ? `${projectIdentity.slug}-primer.pdf` : `${projectIdentity.slug}.pdf`
const buildPath = resolve(workRoot, 'build.json')
writeFileSync(buildPath, JSON.stringify({
  mode,
  title: buildTitle,
  language: 'en-GB',
  output,
  titlePage,
  contentsPage,
  revision: metadata.revision,
  editionDate: metadata.dateIso,
  entries
}, null, 2))

if (fullMode && process.env.PUBLICATION_RAW_PREPARE !== '1') {
  await applyProductionTypography({ repoRoot, publicationRoot, workRoot, workSourceRoot })
}

console.log(`Prepared ${entries.length} ${mode} publication entries in publication/.work.`)
