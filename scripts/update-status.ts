import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderMaturityStatusBlock } from '../project/maturity.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const statusPath = join(repoRoot, 'STATUS.md')
const startMarker = '<!-- maturity-status:start -->'
const endMarker = '<!-- maturity-status:end -->'

const source = readFileSync(statusPath, 'utf8')
const start = source.indexOf(startMarker)
const end = source.indexOf(endMarker)

if (start < 0 || end < 0 || end < start) {
  throw new Error('STATUS.md is missing the maturity-status markers')
}

const replacement = `${startMarker}\n${renderMaturityStatusBlock()}\n${endMarker}`
const updated = `${source.slice(0, start)}${replacement}${source.slice(end + endMarker.length)}`

writeFileSync(statusPath, updated)

console.log('Updated STATUS.md maturity block from project/maturity.ts.')
