import { defineNodes } from '../types.js'

export const softwareNodes = defineNodes([
  {
    id: 'SWE-PLAN', owners: ['SWE'],
    title: 'Register the owner-directed software audit and bounded implementation packets',
    dependencies: [], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed registration bootstrap recorded in issue #1174.' },
    closeoutEvidence: ['project/swe/software-reliability-programme.md', 'project/swe/registration-result.md']
  },
  {
    id: 'SWE-CONTROL', owners: ['SWE'],
    title: 'Repair dispatcher selection races and make lease snapshots efficient and coherent',
    dependencies: ['SWE-PLAN'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed audit #1174; preserve coordination safety during concurrent implementation.' },
    closeoutEvidence: ['project/swe/control-result.md']
  },
  {
    id: 'SWE-PUBLICATION', owners: ['SWE'],
    title: 'Correct PDF routes, persist pinned fonts and preserve Mermaid transformations',
    dependencies: ['SWE-PLAN'], lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed audit #1174; coordinate publication sources and generated metadata.' },
    closeoutEvidence: ['project/swe/publication-result.md']
  },
  {
    id: 'SWE-AUTOMATION', owners: ['SWE'],
    title: 'Make briefings source-coherent and reduce evidenced setup and proof overhead',
    dependencies: ['SWE-PLAN'], lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed audit #1174; privileged workflow and proof-trigger changes need bounded review.' },
    closeoutEvidence: ['project/swe/automation-result.md']
  },
  {
    id: 'SWE-IDENTITY', owners: ['SWE'],
    title: 'Make canonical compiler fingerprints independent of execution locale',
    dependencies: ['SWE-PLAN'], lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed audit #1174; control any fingerprint and generated-baseline migration.' },
    closeoutEvidence: ['project/swe/identity-result.md']
  }
])
