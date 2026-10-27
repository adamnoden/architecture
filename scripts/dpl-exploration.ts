import { readFileSync, writeFileSync } from 'node:fs'
import { composeExploration, explorationResultPath } from '../compiler/dpl/exploration.js'

const args = process.argv.slice(2)
if (args.length !== 1 || !['--write', '--check'].includes(args[0])) {
  throw new Error('Use --write or --check')
}
const result = composeExploration()
const bytes = `${JSON.stringify(result, null, 2)}\n`
if (args[0] === '--write') writeFileSync(explorationResultPath, bytes)
else if (readFileSync(explorationResultPath, 'utf8') !== bytes) throw new Error('Exploration result drift; regenerate explicitly')
console.log(`DPL exploratory result ${result.resultFingerprint}`)
console.table(result.trials.map(t => ({ site: t.siteId, footprint: t.geometry.result,
  workingSpace: t.geometry.workingSpaceResult, joint: t.jointProjectChecks.result })))
