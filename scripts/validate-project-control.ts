import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { controlNodes } from '../project/control/nodes/index.js'
import { validateControlPlane } from '../project/control/validate.js'
import { workstreams } from '../project/control/workstreams.js'
import { staleMaturityAssessments } from '../project/maturity-freshness.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = validateControlPlane(repoRoot)

if (failures.length) {
  throw new Error(`Project-control validation failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
}

const stale = staleMaturityAssessments(repoRoot)

console.log(
  `Project control valid: ${workstreams.length} registered workstreams, ${controlNodes.length} execution nodes, acyclic dependencies and complete-node evidence contracts.`
)

if (stale.length) {
  console.warn('Maturity reassessment required for changed evidence:')
  for (const assessment of stale) {
    console.warn(`  - ${assessment.name}: ${assessment.changedEvidence.join(', ')}`)
  }
} else {
  console.log('Maturity evidence watch: no monitored evidence has changed since the PCO baseline.')
}
