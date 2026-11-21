import { readFileSync, writeFileSync } from 'node:fs'
import { readCurrentDesignResolution } from '../../../compiler/reference-house/current-design/resolve.js'
import { readInletSourceEnvelopeCase, runInletSourceEnvelopeCase } from '../../../compiler/reference-house/current-design/inlet-source-envelope.js'
const resolved = readCurrentDesignResolution(), request = readInletSourceEnvelopeCase(resolved)
const { reviewSvg, ...result } = runInletSourceEnvelopeCase(resolved, request.sourceEnvelope)
for (const [name, content] of [['inlet-source-envelope.results.json', JSON.stringify(result, null, 2) + '\n'],
  ['inlet-source-envelope.svg', reviewSvg + '\n']]) {
  const path = new URL(name, import.meta.url)
  if (process.argv.includes('--check')) { if (readFileSync(path, 'utf8') !== content) throw new Error('Stale source-and-room decision: ' + name) }
  else writeFileSync(path, content)
}
console.log(result.state + '; whole internal wet station, actual source and material acceptance remain open.')
