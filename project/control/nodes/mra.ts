import { defineNodes } from '../types.js'

export const mraNodes = defineNodes([
  {
    id: 'MRA-00',
    owners: ['MRA'],
    title: 'Moisture constitution, inventory and threat model',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'started',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/mra/mra-00-moisture-constitution-threat-model.md']
  },
  {
    id: 'MRA-01',
    owners: ['MRA'],
    title: 'External water and ground-envelope assault',
    dependencies: ['MRA-00', 'TRIAD-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MRA-02',
    owners: ['MRA'],
    title: 'Internal water and wet-zone assault',
    dependencies: ['MRA-00', 'TRIAD-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MRA-03',
    owners: ['MRA'],
    title: 'Vapour, condensation and drying assault',
    dependencies: ['MRA-00', 'TRIAD-GATE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MRA-04',
    owners: ['MRA'],
    title: 'Whole-house moisture failure matrix and adversarial gate',
    dependencies: ['MRA-01', 'MRA-02', 'MRA-03'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  },
  {
    id: 'MRA-05',
    owners: ['MRA'],
    title: 'Post-BCR moisture assurance closeout',
    dependencies: ['BCR-CONVERGENCE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: []
  }
])
