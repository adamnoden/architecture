import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const editions = {
  workingEdition: 'publication/dist/ovids-house.pdf',
  primer: 'publication/dist/ovids-house-primer.pdf',
}

export function publicationReviewManifest(root, source) {
  const metadata = JSON.parse(readFileSync(resolve(root, 'publication/metadata.json'), 'utf8'))
  if (metadata.schemaVersion !== 1) throw new Error('Unsupported publication metadata schema')
  const objects = Object.entries(editions).map(([edition, file]) => {
    const entry = metadata[edition]
    if (entry?.file !== file || !Number.isSafeInteger(entry.pages) || entry.pages < 1 || !entry.pageSize) {
      throw new Error(`Invalid checked publication metadata for ${edition}`)
    }
    const bytes = readFileSync(resolve(root, file))
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error(`Invalid rendered PDF: ${file}`)
    return {
      edition,
      file,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      bytes: bytes.length,
      pages: entry.pages,
      pageSize: entry.pageSize,
    }
  })
  return { schemaVersion: 1, source, objects }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const output = process.argv[2]
  const { GITHUB_EVENT_PATH, GITHUB_SHA } = process.env
  if (!output || !GITHUB_EVENT_PATH || !GITHUB_SHA) throw new Error('Run after the PR publication checks with an output path')
  const root = process.cwd()
  const { pull_request: pr } = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf8'))
  const head = pr?.head?.sha
  const base = pr?.base?.sha
  const checkout = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  if (checkout !== GITHUB_SHA || ![head, base].every(sha => /^[a-f0-9]{40}$/.test(sha ?? ''))) {
    throw new Error('Rendered checkout and PR event do not identify the expected source')
  }
  for (const ancestor of [base, head]) {
    execFileSync('git', ['merge-base', '--is-ancestor', ancestor, checkout])
  }
  writeFileSync(output, `${JSON.stringify(publicationReviewManifest(root, { head, base, checkout }), null, 2)}\n`)
}
