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
import { smokePublicationEntries } from '../publication.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const workSourceRoot = resolve(workRoot, 'source')
const liveBaseUrl = 'https://adamnoden.github.io/architecture/'

if (!process.argv.includes('--smoke')) {
  throw new Error('Only the G1 --smoke publication mode is admitted before G2.')
}

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
  if (existsSync(absolute) && lstatSync(absolute).isDirectory()) {
    target = posix.join(target, 'README.md')
  }

  return target
}

function liveUrlFor(target: string, suffix: string): string {
  if (target === 'README.md') return `${liveBaseUrl}${suffix}`

  let route = target
  if (route.endsWith('/README.md')) route = route.slice(0, -'README.md'.length)
  else if (route.endsWith('.md')) route = route.slice(0, -'.md'.length)

  return `${liveBaseUrl}${route}${suffix}`
}

function rewriteExcludedMarkdownLinks(source: string, markdown: string, included: Set<string>): string {
  const linkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)([^)]*)\)/g

  return markdown.replace(linkPattern, (whole, rawHref: string, tail: string) => {
    if (/^(?:[a-z]+:|#|\/)/i.test(rawHref)) return whole

    const suffixIndex = rawHref.search(/[?#]/)
    const hrefPath = suffixIndex >= 0 ? rawHref.slice(0, suffixIndex) : rawHref
    const suffix = suffixIndex >= 0 ? rawHref.slice(suffixIndex) : ''
    const target = resolveCanonicalTarget(source, hrefPath)
    if (!target) return whole

    const targetAbsolute = repoPath(target)
    const isMarkdownTarget = target.endsWith('.md') && existsSync(targetAbsolute)
    if (!isMarkdownTarget) return whole
    if (included.has(target)) return whole

    return whole.replace(`${rawHref}${tail})`, `${liveUrlFor(target, suffix)}${tail})`)
  })
}

rmSync(workRoot, { recursive: true, force: true })
mkdirSync(workSourceRoot, { recursive: true })
cpSync(repoPath('docs'), workPath('docs'), { recursive: true })
copyFileSync(repoPath('README.md'), workPath('README.md'))

const canonicalHashes = new Map(
  smokePublicationEntries.map((entry) => [entry.source, sha256(repoPath(entry.source))])
)
const included = new Set(smokePublicationEntries.map((entry) => entry.source))

for (const entry of smokePublicationEntries) {
  const preparedPath = workPath(entry.source)
  let markdown = readFileSync(preparedPath, 'utf8')

  if (markdown.includes('```mermaid')) {
    const renderedPath = `${preparedPath}.mmdc.md`
    execFileSync(
      'mmdc',
      ['-i', preparedPath, '-o', renderedPath, '-t', 'neutral', '-b', 'transparent'],
      { stdio: 'inherit' }
    )
    renameSync(renderedPath, preparedPath)
    markdown = readFileSync(preparedPath, 'utf8')
  }

  markdown = rewriteExcludedMarkdownLinks(entry.source, markdown, included)
  writeFileSync(preparedPath, markdown)
}

for (const entry of smokePublicationEntries) {
  const before = canonicalHashes.get(entry.source)
  const after = sha256(repoPath(entry.source))
  if (before !== after) throw new Error(`Preparation mutated canonical source: ${entry.source}`)
}

writeFileSync(
  resolve(workRoot, 'build.json'),
  JSON.stringify(
    {
      mode: 'smoke',
      title: 'House Systems Architecture — Publication Smoke',
      language: 'en-GB',
      output: 'house-systems-architecture-smoke.pdf',
      entries: smokePublicationEntries
    },
    null,
    2
  )
)

console.log(`Prepared ${smokePublicationEntries.length} publication smoke entries in publication/.work.`)
