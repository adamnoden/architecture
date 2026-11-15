import { defineNodes } from '../types.js'

export const codificationNodes = defineNodes([
  {
    id: 'PCO-EXECUTABLE-DESIGN', owners: ['PCO'],
    title: 'Require executable design, early current-house integration and an editor-ready model contract',
    dependencies: ['PCO-REVIEW-POLICY'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed instruction and graph repair recorded in #1539 and #1542.' },
    closeoutEvidence: ['project/pco/codification-direction-result.md']
  },
  {
    id: 'CCR-CURRENT-SOURCE', owners: ['CCR', 'HRS'],
    title: 'Implement one versioned current-design snapshot and inventory active consumers',
    dependencies: ['PCO-EXECUTABLE-DESIGN', 'HRS-BASELINE', 'CCR-IDENTITY'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/current-source-result.md']
  },
  {
    id: 'CCR-CURRENT-COMPILE', owners: ['CCR'],
    title: 'Implement the explicit current-house compile path without historical fallback',
    dependencies: ['CCR-CURRENT-SOURCE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/current-compile-result.md']
  },
  {
    id: 'CCR-STRUCTURE-INTEGRATION', owners: ['CCR', 'STR'],
    title: 'Integrate active structural computations through current-source parameters and methods',
    dependencies: ['CCR-CURRENT-COMPILE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/structure-integration-result.md']
  },
  {
    id: 'CCR-SERVICES-INTEGRATION', owners: ['CCR', 'HAD', 'RWT'],
    title: 'Integrate active service and water computations through current-source contracts',
    dependencies: ['CCR-CURRENT-COMPILE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/services-integration-result.md']
  },
  {
    id: 'CCR-ASSEMBLY-INTEGRATION', owners: ['CCR', 'IAS', 'OAS'],
    title: 'Integrate editable floor wall skirting grate and opening assembly families',
    dependencies: ['CCR-CURRENT-COMPILE', 'ADE-MODEL'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/assembly-integration-result.md']
  },
  {
    id: 'CCR-EDIT-CONTRACT', owners: ['CCR', 'ADE'],
    title: 'Prove serialisable semantic edits reversal and revision-bound compiler responses',
    dependencies: ['CCR-CURRENT-SOURCE', 'ADE-MODEL'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/editor-contract-result.md']
  },
  {
    id: 'CCR-CHANGE-PROOF', owners: ['CCR'],
    title: 'Prove end-to-end change propagation and selective evidence invalidation',
    dependencies: ['CCR-STRUCTURE-INTEGRATION', 'CCR-SERVICES-INTEGRATION', 'CCR-ASSEMBLY-INTEGRATION', 'CCR-EDIT-CONTRACT'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/change-propagation-result.md']
  },
  {
    id: 'CCR-CURRENT-RELEASE', owners: ['CCR', 'HRS', 'ADE'],
    title: 'Eliminate historical fallback and split current models from all active final outputs',
    dependencies: ['CCR-CHANGE-PROOF', 'HRS-SYNTHESIS', 'ADE-DETAILS', 'ADE-SCHEDULES', 'ADE-EVIDENCE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ccr/current-release-result.md']
  },
  {
    id: 'ADE-BROWSER-EDITOR', owners: ['ADE'],
    title: 'Demonstrate browser floor-plan editing through the shared headless compiler',
    dependencies: ['CCR-CHANGE-PROOF'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/browser-editor-result.md']
  }
])
