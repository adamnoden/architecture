import { defineNodes } from '../types.js'

export const publicationNodes = defineNodes([
  {
    id: 'PLT-CURRENT-REVIEW',
    owners: ['PLT'],
    title: 'Current-house digital plate capability and review handoff',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/plt/current-review-digital-closeout.md'],
  },
  {
    id: 'PLT-FINAL-FREEZE',
    owners: ['PLT'],
    title: 'Final resolved-house plate integration and freeze',
    dependencies: ['PLT-FINAL-PREP', 'PLT-PRINT-REVIEW'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/plt/final-freeze-result.md'],
  },
  {
    id: 'EDA-RENEWED',
    owners: ['EDA'],
    title: 'Renewed editorial-doctrine assurance over enlarged final source',
    dependencies: ['PLT-FINAL-FREEZE', 'EDA-ADAPTER'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/eda/eda-renewed-result.md'],
  },
  {
    id: 'PUB-02-PREP',
    owners: ['PUB'],
    title: 'Content-independent private-object preparation',
    dependencies: ['BSR-ROOT'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/pub/pub-02-preparation-result.md'],
  },
  {
    id: 'PUB-02-FINAL',
    owners: ['PUB'],
    title: 'Final private-object content, drawing and manufacture gate',
    dependencies: ['PUB-02-PREP', 'EDA-RENEWED'],
    lifecycle: 'planned',
    agentDispatch: {
      mode: 'manual',
      reason: 'Final private-object manufacture/release is an owner-controlled gate rather than generic idle-agent work.'
    },
    closeoutEvidence: []
  },
  {
    id: 'EDA-ADAPTER',
    owners: ['EDA'],
    title: 'Restore authored ownership of architectural publication prose',
    dependencies: [],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/eda/eda-adapter-result.md']
  },
  {
    id: 'PLT-FINAL-PREP',
    owners: ['PLT'],
    title: 'Prepare coherent final current-house digital and print proof set',
    dependencies: ['HRS-SYNTHESIS', 'PLT-CURRENT-REVIEW'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/plt/final-preparation-result.md']
  },
  {
    id: 'PLT-PRINT-REVIEW',
    owners: ['PLT'],
    title: 'Receive and disposition actual-size BOOK and WALL print verdicts',
    dependencies: ['PLT-FINAL-PREP'],
    lifecycle: 'planned',
    agentDispatch: { mode: 'manual', reason: 'Actual-size physical print inspection needs owner or competent human evidence; digital rendering alone cannot close it.' },
    closeoutEvidence: ['project/plt/physical-print-review-result.md']
  },
  {
    id: 'EDA-ARGUMENT', owners: ['EDA'],
    title: 'Red-team architectural contribution and evidence for the central thesis',
    dependencies: [], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/eda/eda-argument-result.md']
  },
  {
    id: 'EDA-NARRATIVE', owners: ['EDA'],
    title: 'Reshape and subtract for a compelling architectural reader journey',
    dependencies: ['EDA-ARGUMENT', 'EDA-ADAPTER'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/eda/eda-narrative-result.md']
  }
])
