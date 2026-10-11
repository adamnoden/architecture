import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { publicationEntries } from '../publication.js'
import { renderPublicationScope, replacePublicationScope } from '../scope-report.js'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../..')
const crosswalkPath = resolve(repoRoot, 'docs/development/print-publication-scope-crosswalk.md')
const current = readFileSync(crosswalkPath, 'utf8')
const generated = renderPublicationScope(publicationEntries)
const next = replacePublicationScope(current, generated)

if (next !== current) {
  writeFileSync(crosswalkPath, next)
  console.log('Updated publication scope manifest in docs/development/print-publication-scope-crosswalk.md.')
} else {
  console.log('Publication scope manifest already matches publication/publication.ts.')
}
