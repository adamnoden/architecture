import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { smokePublicationEntries } from '../publication.js'

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
    if (!existsSync(target)) {
      throw new Error(`Missing local image in ${source}: ${href}`)
    }
  }
}

const seen = new Set<string>()

for (const entry of smokePublicationEntries) {
  if (seen.has(entry.source)) throw new Error(`Duplicate smoke source: ${entry.source}`)
  seen.add(entry.source)

  if (extname(entry.source) !== '.md') {
    throw new Error(`Smoke source must be Markdown: ${entry.source}`)
  }

  const sourcePath = localPath(entry.source)
  if (!existsSync(sourcePath) || !lstatSync(sourcePath).isFile()) {
    throw new Error(`Missing smoke source: ${entry.source}`)
  }

  const markdown = readFileSync(sourcePath, 'utf8')
  for (const construct of unsupportedSourceConstructs) {
    if (construct.test.test(markdown)) {
      throw new Error(
        `${entry.source} contains ${construct.label}; add an explicit print adapter instead of silently degrading it.`
      )
    }
  }

  validateLocalImages(entry.source, markdown)
}

const mermaidFixture = smokePublicationEntries.find((entry) => entry.smokeOnly)
if (!mermaidFixture) throw new Error('G1 requires one explicitly smoke-only Mermaid fixture.')
if (!readFileSync(localPath(mermaidFixture.source), 'utf8').includes('```mermaid')) {
  throw new Error(`${mermaidFixture.source} no longer contains the Mermaid fixture expected by G1.`)
}

const patternFixture = smokePublicationEntries.find(
  (entry) => entry.source === 'docs/patterns/controlled-utility-entry.md'
)
if (!patternFixture) throw new Error('G1 requires the canonical pattern-frontmatter fixture.')
if (!readFileSync(localPath(patternFixture.source), 'utf8').startsWith('---\n')) {
  throw new Error('Canonical pattern fixture no longer begins with YAML frontmatter.')
}

console.log(`Publication smoke manifest valid: ${smokePublicationEntries.length} entries.`)
