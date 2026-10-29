import { defineNodes } from '../types.js'

export const ccrNodes = defineNodes([
  {
    id: 'CCR-PLAN',
    owners: ['CCR'],
    title: 'Repair rectangle-union area and plate closure',
    dependencies: [],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/ccr-plan-result.md']
  },
  {
    id: 'CCR-STAIR',
    owners: ['CCR'],
    title: 'Repair stair datum arithmetic and discrete topology',
    dependencies: [],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/ccr-stair-result.md']
  },
  {
    id: 'CCR-DRAINAGE',
    owners: ['CCR'],
    title: 'Repair drainage declaration validity and source consistency',
    dependencies: [],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/ccr-drainage-result.md']
  },
  {
    id: 'CCR-IDENTITY',
    owners: ['CCR'],
    title: 'Adjudicate identity guarantees and integrate correctness repairs',
    dependencies: ['CCR-PLAN', 'CCR-STAIR', 'CCR-DRAINAGE'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/ccr-identity-result.md']
  }
])
