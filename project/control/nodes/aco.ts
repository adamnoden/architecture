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
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'ACO-02',
    owners: ['ACO'],
    title: 'Live operational query and authenticated client',
    dependencies: ['ACO-01'],
    lifecycle: 'planned',
    closeoutEvidence: []
  },
  {
    id: 'ACO-03',
    owners: ['ACO'],
    title: 'Repository and agent integration',
    dependencies: ['ACO-02'],
    lifecycle: 'planned',
    closeoutEvidence: []
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
