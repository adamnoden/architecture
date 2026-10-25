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
const deterministicOnePath = resolve(directory, `${stem}.deterministic-1.pdf`)
const deterministicTwoPath = resolve(directory, `${stem}.deterministic-2.pdf`)
const evidencePath = resolve(directory, `${stem}.destination-normalization.json`)

const syntheticNamePattern = /\/viv-id-[^\x00\x09\x0a\x0c\x0d\x20()<>\[\]{}/%]+/g
const creationDatePattern = /\/CreationDate\s+\(D:[^)]+\)\s*/g
const modificationDatePattern = /\/ModDate\s+\(D:[^)]+\)\s*/g
const maxPdfNameBytes = 127
const shortName = (value: string): string => `/v-${createHash('sha256').update(value).digest('hex').slice(0, 32)}`
const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

const beforeBytes = await readFile(pdfPath)
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
const mapping = new Map<string, string>()
const usedShortNames = new Set<string>()

for (const original of unique) {
  const replacement = shortName(original)
  if (usedShortNames.has(replacement)) throw new Error(`Destination hash collision for ${replacement}.`)
  usedShortNames.add(replacement)
  mapping.set(original, replacement)
}

let replacedOccurrences = 0
let edited = qdf.replace(syntheticNamePattern, (name) => {
  const replacement = mapping.get(name)
  if (!replacement) return name
  replacedOccurrences += 1
  return replacement
})
if (replacedOccurrences !== overlong.length) {
  throw new Error(`Destination replacement count drift: ${replacedOccurrences} vs ${overlong.length}.`)
}
const remainingOverlong = [...edited.matchAll(syntheticNamePattern)]
  .map((match) => match[0])
  .filter((name) => Buffer.byteLength(name.slice(1), 'latin1') > maxPdfNameBytes)
if (remainingOverlong.length) throw new Error(`Left ${remainingOverlong.length} overlong Vivliostyle names after normalization.`)

const creationDatesRemoved = [...edited.matchAll(creationDatePattern)].length
const modificationDatesRemoved = [...edited.matchAll(modificationDatePattern)].length
edited = edited.replace(creationDatePattern, '').replace(modificationDatePattern, '')

await writeFile(editedPath, Buffer.from(edited, 'latin1'))
execFileSync('fix-qdf', [editedPath, fixedPath], { stdio: 'inherit' })
execFileSync('qpdf', [fixedPath, '--stream-data=preserve', normalizedPath], { stdio: 'inherit' })
execFileSync('qpdf', ['--deterministic-id', '--stream-data=preserve', normalizedPath, deterministicOnePath], { stdio: 'inherit' })
execFileSync('qpdf', ['--deterministic-id', '--stream-data=preserve', deterministicOnePath, deterministicTwoPath], { stdio: 'inherit' })

const deterministicOneBytes = await readFile(deterministicOnePath)
const deterministicTwoBytes = await readFile(deterministicTwoPath)
const deterministicOneSha256 = sha256(deterministicOneBytes)
const deterministicTwoSha256 = sha256(deterministicTwoBytes)
if (deterministicOneSha256 !== deterministicTwoSha256 || !deterministicOneBytes.equals(deterministicTwoBytes)) {
  throw new Error('qpdf deterministic canonicalization was not byte-idempotent across consecutive passes.')
}

execFileSync('qpdf', ['--check', deterministicTwoPath], { stdio: 'inherit' })
await rename(deterministicTwoPath, pdfPath)
const outputSha256 = sha256(await readFile(pdfPath))

await rm(qdfPath, { force: true })
await rm(editedPath, { force: true })
await rm(fixedPath, { force: true })
await rm(normalizedPath, { force: true })
await rm(deterministicOnePath, { force: true })
await rm(deterministicTwoPath, { force: true })

const occurrencesByName = Object.fromEntries(unique.map((name) => [name, overlong.filter((candidate) => candidate === name).length]))
await writeFile(evidencePath, `${JSON.stringify({
  schemaVersion: 2,
  packet: 'TYP-09C',
  strategy: 'qpdf-qdf-destination-alias-plus-reproducible-canonicalization',
  normalizationNeeded: unique.length > 0,
  maxPdfNameBytes,
  uniqueNamesRenamed: unique.length,
  occurrencesRenamed: replacedOccurrences,
  longestOriginalBytes: unique.length ? Math.max(...unique.map((name) => Buffer.byteLength(name.slice(1), 'latin1'))) : 0,
  replacementBytes: [...mapping.values()].map((name) => Buffer.byteLength(name.slice(1), 'latin1')),
  occurrencesByName,
  volatileInfoDatesRemoved: {
    creationDate: creationDatesRemoved,
    modificationDate: modificationDatesRemoved
  },
  deterministicIdPasses: 2,
  deterministicByteIdempotence: 'PASS',
  deterministicOneSha256,
  deterministicTwoSha256,
  inputSha256: sha256(beforeBytes),
  outputSha256,
  canonicalContentMutated: false,
  textOutlined: false,
  qpdfCheck: 'PASS'
}, null, 2)}\n`, 'utf8')

console.log(
  `Production PDF normalization ${unique.length ? `renamed ${unique.length} overlong destinations across ${replacedOccurrences} occurrences; ` : ''}` +
  `removed volatile PDF dates (${creationDatesRemoved}/${modificationDatesRemoved}); deterministic canonical SHA-256 ${outputSha256}.`
)
