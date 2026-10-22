import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const pdfArg = process.argv[2]
const expectedSet = process.argv[3] ?? 'source'

if (!pdfArg) {
  throw new Error('Usage: npx tsx publication/specimens/typ03/validate-pdf-fonts.ts <pdf> [source]')
}
if (expectedSet !== 'source') {
  throw new Error(`Unsupported expected font set: ${expectedSet}`)
}

const pdfPath = resolve(pdfArg)
let report: string
try {
  report = execFileSync('pdffonts', [pdfPath], { encoding: 'utf8' })
} catch (error) {
  throw new Error(`pdffonts is required for rendered font identity proof: ${String(error)}`)
}

const rawNames = report
  .split(/\r?\n/)
  .slice(2)
  .map((line) => line.trim().split(/\s+/)[0])
  .filter(Boolean)
const normalizedNames = [...new Set(rawNames.map((name) => name.replace(/^[A-Z]{6}\+/, '')))].sort()

const expected = [
  'SourceSerif4-Regular',
  'SourceSerif4-It',
  'SourceSerif4-Bold',
  'SourceSans3-Regular',
  'SourceSans3-Bold'
]

const missing = expected.filter((name) => !normalizedNames.includes(name))
const fallbacks = normalizedNames.filter((name) => /Liberation|Arial|Helvetica|Times|Georgia/i.test(name))

if (normalizedNames.length === 0) {
  throw new Error(`pdffonts found no embedded font identities in ${pdfPath}.`)
}
if (missing.length > 0 || fallbacks.length > 0) {
  throw new Error(
    `TYP-03 PDF font identity failure for ${pdfPath}. ` +
    `Missing: ${missing.join(', ') || '(none)'}. ` +
    `Fallbacks: ${fallbacks.join(', ') || '(none)'}. ` +
    `Observed: ${normalizedNames.join(', ')}`
  )
}

console.log(`Verified embedded Source PDF fonts in ${pdfPath}: ${normalizedNames.join(', ')}`)
