import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { dependenciesForAdapter } from '../publication/adapters.js'
import { primerPublicationEntries, publicationEntries } from '../publication/publication.js'
import { projectIdentity } from '../project/identity.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function publicationSources(): Set<string> {
  const sources = new Set<string>()
  for (const entry of [...publicationEntries, ...primerPublicationEntries]) {
    sources.add(entry.source)
    for (const dependency of dependenciesForAdapter(entry.adapter)) sources.add(dependency)
  }
  return sources
}

const guardedSources = new Set([
  'README.md',
  'STATUS.md',
  'docs/README.md',
  'docs/reading-guide.md',
  'docs/manuscript/README.md',
  'docs/grammar/README.md',
  'docs/reference-house/README.md',
  'docs/research/README.md',
  'docs/prototypes/README.md',
  'docs/delivery/README.md',
  'docs/editorial/editorial-doctrine.md',
  ...publicationSources()
])

const allowedFormerMasterSources = new Set<string>(projectIdentity.formerMasterNameAllowedSources)
const failures: string[] = []

for (const source of guardedSources) {
  if (allowedFormerMasterSources.has(source)) continue
  const content = readFileSync(resolve(repoRoot, source), 'utf8')

  for (const formerName of projectIdentity.formerMasterNames) {
    if (content.includes(formerName)) {
      failures.push(`${source} still uses former master identity outside an explicit subsystem/provenance boundary: ${formerName}`)
    }
  }
}

if (failures.length) {
  throw new Error(`Project brand boundary drift:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
}

console.log(
  `Project brand boundary valid: ${projectIdentity.name} is the master identity and ${projectIdentity.formalSystemName} is confined to explicit subsystem/provenance surfaces.`
)
