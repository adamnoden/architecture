import { defineNodes } from '../types.js'

export const acoNodes = defineNodes([
  {
    id: 'ACO-00',
    owners: ['ACO'],
    title: 'Authority and lease model',
    dependencies: [],
    lifecycle: 'complete',
    closeoutEvidence: ['project/aco/agent-claim-orchestration-programme.md']
  },
  {
    id: 'ACO-01',
    owners: ['ACO'],
    title: 'Runtime lease store and atomic protocol',
    dependencies: ['ACO-00'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/claims.ts',
      'project/control/claim-store.ts',
      'project/control/claims.test.ts',
      'project/control/claim-store.test.ts'
    ]
  },
  {
    id: 'ACO-02',
    owners: ['ACO'],
    title: 'Live operational query and authenticated client',
    dependencies: ['ACO-01'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'scripts/project-claims.ts',
      'package.json'
    ]
  },
  {
    id: 'ACO-03',
    owners: ['ACO'],
    title: 'Repository and agent integration',
    dependencies: ['ACO-02'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'AGENTS.md',
      'project/control/README.md',
      'project/control/render.ts',
      'project/control/validate.ts'
    ]
  },
  {
    id: 'ACO-04',
    owners: ['ACO'],
    title: 'Self-hosted adversarial closeout',
    dependencies: ['ACO-03'],
    lifecycle: 'planned',
    closeoutEvidence: []
  }
])
