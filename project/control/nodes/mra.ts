import { defineNodes } from '../types.js'

export const mraNodes = defineNodes([
  {
    id: 'MRA-00',
    owners: ['MRA'],
    title: 'Moisture constitution, inventory and threat model',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'complete',
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
    id: 'MRA-INTERNAL-LEAKS',
    owners: ['MRA'],
    title: 'Trace selected internal-water failures, isolation and repair consequences',
    dependencies: ['MRA-00', 'HAD-SERVICES-ADOPTION', 'IAS-03', 'MAT-INTERIORS'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/mra/internal-leak-study.md', 'project/mra/studies/internal-leak-study.json']
  },
  {
    id: 'MRA-02',
    owners: ['MRA'],
    title: 'Internal water and wet-zone assault',
    dependencies: ['MRA-00', 'MRA-INTERNAL-LEAKS', 'TRIAD-GATE'],
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
