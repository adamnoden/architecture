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
import { applyAdapter, dependenciesForAdapter } from '../adapters.js'
import { publicationEntries, smokePublicationEntries, type PublicationEntry } from '../publication.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const workSourceRoot = resolve(workRoot, 'source')
const liveBaseUrl = 'https://adamnoden.github.io/architecture/'
const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)([^)]*)\)/g

const smokeMode = process.argv.includes('--smoke')
const fullMode = process.argv.includes('--full')
if (smokeMode === fullMode) throw new Error('Choose exactly one publication mode: --smoke or --full.')

const entries: readonly PublicationEntry[] = smokeMode ? smokePublicationEntries : publicationEntries
const mode = smokeMode ? 'smoke' : 'full'

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function repoPath(path: string): string {
  return resolve(repoRoot, path)
}

function workPath(path: string): string {
  return resolve(workSourceRoot, path)
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
      ? included.has(target)
        ? internalHtmlHref(source, target, suffix)
        : liveUrlFor(target, suffix)
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
    if (target && existsSync(repoPath(target))) {
      throw new Error(`Prepared publication still contains a local repository link in ${source}: ${href}`)
    }
    if (hrefPath.endsWith('.md')) {
      throw new Error(`Prepared publication still contains a local Markdown link in ${source}: ${href}`)
    }
  }
}

rmSync(workRoot, { recursive: true, force: true })
mkdirSync(workSourceRoot, { recursive: true })
cpSync(repoPath('docs'), workPath('docs'), { recursive: true })
copyFileSync(repoPath('README.md'), workPath('README.md'))

const canonicalSources = new Set(
  entries.flatMap((entry) => [entry.source, ...dependenciesForAdapter(entry.adapter)])
)
const canonicalHashes = new Map([...canonicalSources].map((source) => [source, sha256(repoPath(source))]))
const included = new Set(entries.map((entry) => entry.source))

for (const entry of entries) {
  const preparedPath = workPath(entry.source)
  let markdown = readFileSync(preparedPath, 'utf8')
  markdown = applyAdapter(entry.adapter, markdown, { repoRoot, workSourceRoot })

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

writeFileSync(
  resolve(workRoot, 'build.json'),
  JSON.stringify(
    {
      mode,
      title: smokeMode ? 'House Systems Architecture — Publication Smoke' : 'House Systems Architecture — Working Edition',
      language: 'en-GB',
      output: smokeMode ? 'house-systems-architecture-smoke.pdf' : 'house-systems-architecture.pdf',
      entries
    },
    null,
    2
  )
)

console.log(`Prepared ${entries.length} ${mode} publication entries in publication/.work.`)
