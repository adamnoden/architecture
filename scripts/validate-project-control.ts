import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { controlNodes } from '../project/control/nodes/index.js'
import { validateControlPlane } from '../project/control/validate.js'
import { workstreams } from '../project/control/workstreams.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = validateControlPlane(repoRoot)

if (failures.length) {
  throw new Error(`Project-control validation failed:\n${failures.map((failure) => `  - ${failure}`).join('\n')}`)
}

console.log(
  `Project control valid: ${workstreams.length} registered workstreams, ${controlNodes.length} execution nodes, acyclic dependencies and complete-node evidence contracts.`
)
