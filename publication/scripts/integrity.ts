import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyAdapter } from '../adapters.js'
import { applyPublicationFigures } from '../figures.js'
import { publicationEntries } from '../publication.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const primaryKinds = new Set(['preface', 'front-matter', 'part', 'pattern', 'strategy', 'candidate'])
const processPatterns = [
  { label: 'PR-00 process language', regex: /\bPR-00[A-Z0-9-]*\b/g },
  { label: 'candidate-book process language', regex: /\bcandidate-book\b/gi },
  { label: 'Working Edition process language', regex: /\bWorking Edition\b/g }
]
const literalRepoPath = /`(?:docs|publication|compiler|project)\/[A-Za-z0-9_./-]+`/g

function sourcePath(source: string): string {
  return resolve(repoRoot, source)
}

function stripMarkdownDestinations(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
}

const failures: string[] = []

for (const entry of publicationEntries) {
  const raw = readFileSync(sourcePath(entry.source), 'utf8')
  const adapted = applyAdapter(entry.adapter, raw, {
    repoRoot,
    workSourceRoot: repoRoot
  })
  const composed = applyPublicationFigures(entry.id, adapted)
  const prose = stripMarkdownDestinations(composed)

  for (const match of prose.matchAll(literalRepoPath)) {
    failures.push(`${entry.id}: literal repository path survives publication composition: ${match[0]}`)
  }

  if (primaryKinds.has(entry.kind)) {
    for (const { label, regex } of processPatterns) {
      for (const match of prose.matchAll(regex)) {
        failures.push(`${entry.id}: ${label}: ${match[0]}`)
      }
    }
  }
}

if (failures.length) {
  throw new Error(`PR-00F publication integrity residue:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
}

console.log('PR-00F publication integrity scan passed: no literal repository paths or publication-process language survive composed reader-facing content.')
