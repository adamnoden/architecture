import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'

const inputArg = process.argv[2]
if (!inputArg) throw new Error('Usage: normalize-pdf-destinations.ts <pdf>')

const pdfPath = resolve(inputArg)
const directory = dirname(pdfPath)
const stem = basename(pdfPath, '.pdf')
const qdfPath = resolve(directory, `${stem}.qdf.pdf`)
const editedPath = resolve(directory, `${stem}.qdf-edited.pdf`)
const fixedPath = resolve(directory, `${stem}.qdf-fixed.pdf`)
const normalizedPath = resolve(directory, `${stem}.normalized.pdf`)
const evidencePath = resolve(directory, `${stem}.destination-normalization.json`)

const syntheticNamePattern = /\/viv-id-[^\x00\x09\x0a\x0c\x0d\x20()<>\[\]{}/%]+/g
const maxPdfNameBytes = 127
const shortName = (value: string): string => `/v-${createHash('sha256').update(value).digest('hex').slice(0, 32)}`

execFileSync('qpdf', [
  pdfPath,
  '--qdf',
  '--object-streams=disable',
  '--stream-data=preserve',
  '--normalize-content=n',
  qdfPath
], { stdio: 'inherit' })

const qdfBytes = await readFile(qdfPath)
const qdf = qdfBytes.toString('latin1')
const matches = [...qdf.matchAll(syntheticNamePattern)].map((match) => match[0])
const overlong = matches.filter((name) => Buffer.byteLength(name.slice(1), 'latin1') > maxPdfNameBytes)
const unique = [...new Set(overlong)].sort()

if (unique.length < 1) {
  throw new Error('TYP-08C D05 expected overlong Vivliostyle destination names but found none before normalization.')
}

const mapping = new Map<string, string>()
const usedShortNames = new Set<string>()
for (const original of unique) {
  const replacement = shortName(original)
  if (usedShortNames.has(replacement)) {
    throw new Error(`TYP-08C D05 destination hash collision for ${replacement}.`)
  }
  usedShortNames.add(replacement)
  mapping.set(original, replacement)
}

let replacedOccurrences = 0
const edited = qdf.replace(syntheticNamePattern, (name) => {
  const replacement = mapping.get(name)
  if (!replacement) return name
  replacedOccurrences += 1
  return replacement
})

if (replacedOccurrences !== overlong.length) {
  throw new Error(`TYP-08C D05 replacement count drift: ${replacedOccurrences} vs ${overlong.length}.`)
}

const remainingOverlong = [...edited.matchAll(syntheticNamePattern)]
  .map((match) => match[0])
  .filter((name) => Buffer.byteLength(name.slice(1), 'latin1') > maxPdfNameBytes)
if (remainingOverlong.length) {
  throw new Error(`TYP-08C D05 left ${remainingOverlong.length} overlong Vivliostyle names after normalization.`)
}

await writeFile(editedPath, Buffer.from(edited, 'latin1'))
execFileSync('fix-qdf', [editedPath, fixedPath], { stdio: 'inherit' })
execFileSync('qpdf', [fixedPath, '--stream-data=preserve', normalizedPath], { stdio: 'inherit' })
execFileSync('qpdf', ['--check', normalizedPath], { stdio: 'inherit' })

await rename(normalizedPath, pdfPath)
await rm(qdfPath, { force: true })
await rm(editedPath, { force: true })
await rm(fixedPath, { force: true })

const occurrencesByName = Object.fromEntries(unique.map((name) => [name, overlong.filter((candidate) => candidate === name).length]))
await writeFile(evidencePath, `${JSON.stringify({
  schemaVersion: 1,
  packet: 'TYP-08C',
  defect: 'D05',
  strategy: 'qpdf-qdf-deterministic-destination-alias',
  maxPdfNameBytes,
  uniqueNamesRenamed: unique.length,
  occurrencesRenamed: replacedOccurrences,
  longestOriginalBytes: Math.max(...unique.map((name) => Buffer.byteLength(name.slice(1), 'latin1'))),
  replacementBytes: [...mapping.values()].map((name) => Buffer.byteLength(name.slice(1), 'latin1')),
  occurrencesByName,
  canonicalContentMutated: false,
  textOutlined: false
}, null, 2)}\n`, 'utf8')

console.log(`TYP-08C D05 normalized ${unique.length} overlong Vivliostyle destination names across ${replacedOccurrences} occurrences in ${basename(pdfPath)}.`)
