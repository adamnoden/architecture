import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import { isPublicSource } from '../project/public-surface.js'

const repoRoot = process.cwd()

function collectMarkdown(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...collectMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

function sourcePath(path: string): string {
  return relative(repoRoot, path).split(sep).join('/')
}

const residuePatterns: readonly { label: string; pattern: RegExp }[] = [
  { label: 'legacy doctrine version', pattern: /House Design Doctrine v7/i },
  { label: 'legacy doctrine crosswalk', pattern: /Legacy Doctrine Register Crosswalk/i },
  { label: 'candidate-book process state', pattern: /candidate-book stage/i },
  { label: 'PR-00 publication-stage identity', pattern: /\bPR-00[A-Z0-9-]*\b/ },
  { label: 'Reference House development gate identity', pattern: /\bRH-(?:0\d|1[01])\b/ },
  { label: 'H1 paper-compilation identity', pattern: /\bH1-PAPER(?:-\d+)?\b/i },
  { label: 'migration provenance footer', pattern: /^\*\*Provenance:\*\*/m }
]

const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^\s)]+)(?:\s+[^)]*)?\)/g

function canonicalMarkdownTarget(source: string, rawHref: string): string | null {
  if (/^(?:[a-z]+:|#|\/)/i.test(rawHref)) return null

  const hrefPath = rawHref.split(/[?#]/, 1)[0]
  if (!hrefPath) return null

  let target = posix.normalize(posix.join(posix.dirname(source), hrefPath))
  if (target.startsWith('../') || target === '..') return null

  const absolute = join(repoRoot, ...target.split('/'))
  if (existsSync(absolute) && lstatSync(absolute).isDirectory()) target = posix.join(target, 'README.md')

  return target.endsWith('.md') ? target : null
}

function validateResolvedPublicSurface(): void {
  const failures: string[] = []
  const files = [join(repoRoot, 'README.md'), ...collectMarkdown(join(repoRoot, 'docs'))]
    .map((path) => ({ path, source: sourcePath(path) }))
    .filter(({ source }) => isPublicSource(source))

  for (const { path, source } of files) {
    const markdown = readFileSync(path, 'utf8')

    for (const { label, pattern } of residuePatterns) {
      if (pattern.test(markdown)) failures.push(`${source}: reader-facing ${label}`)
    }

    for (const match of markdown.matchAll(markdownLinkPattern)) {
      const target = canonicalMarkdownTarget(source, match[1])
      if (!target) continue

      const absolute = join(repoRoot, ...target.split('/'))
      if (!existsSync(absolute)) continue
      if (!isPublicSource(target)) {
        failures.push(`${source}: reader-facing link points to internal source ${target}`)
      }
    }
  }

  if (failures.length) {
    throw new Error(
      `Resolved public surface validation failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`
    )
  }
}

validateResolvedPublicSurface()
console.log('Resolved public surface valid: no high-confidence development residue or links into internal-only records.')
