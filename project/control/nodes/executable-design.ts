import { defineNodes } from '../types.js'

export const executableDesignNodes = defineNodes([
  {
    id: 'PCO-EXECUTABLE-DESIGN', owners: ['PCO'],
    title: 'Bind executable-design instructions and register current-model/editor delivery',
    dependencies: ['PCO-REVIEW-POLICY'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed instruction and registry bootstrap recorded in issue #1542; no compiler capability is claimed by registration.' },
    closeoutEvidence: ['project/ade/executable-design-programme.md', 'project/control/executable-design.test.ts']
  },
  {
    id: 'ADE-DESIGN-INPUT', owners: ['ADE'],
    title: 'Implement versioned editable design input and current-source adapter',
    dependencies: ['ADE-DELIVERY-AUDIT', 'HRS-BASELINE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/design-input-result.md']
  },
  {
    id: 'ADE-CURRENT-COMPILE', owners: ['ADE', 'CCR'],
    title: 'Compile supplied current-house input without historical fixture fallback',
    dependencies: ['ADE-DESIGN-INPUT'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/current-compile-result.md']
  },
  {
    id: 'ADE-PARAMETRIC-SYSTEMS', owners: ['ADE', 'IAS', 'OAS', 'STR', 'HAD'],
    title: 'Integrate representative assembly and engineering studies as input-driven capabilities',
    dependencies: ['ADE-CURRENT-COMPILE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/parametric-systems-result.md']
  },
  {
    id: 'ADE-CHANGE-PROPAGATION', owners: ['ADE', 'CCR'],
    title: 'Implement semantic edits, recomputation and selective evidence invalidation',
    dependencies: ['ADE-CURRENT-COMPILE'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/change-propagation-result.md']
  },
  {
    id: 'ADE-EDIT-REGRESSION', owners: ['ADE', 'CCR'],
    title: 'Prove current-house edit-to-output consistency and eliminate active historical fallback',
    dependencies: ['ADE-PARAMETRIC-SYSTEMS', 'ADE-CHANGE-PROPAGATION'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/edit-regression-result.md']
  },
  {
    id: 'ADE-BROWSER-EDITOR', owners: ['ADE'],
    title: 'Demonstrate browser floor-plan editing through the shared headless compiler',
    dependencies: ['ADE-EDIT-REGRESSION'], lifecycle: 'planned',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/ade/browser-editor-result.md']
  }
])
