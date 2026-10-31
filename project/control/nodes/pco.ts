import { defineNodes } from '../types.js'

export const pcoNodes = defineNodes([
  {
    id: 'PCO-00',
    owners: ['PCO'],
    title: 'Control-plane inventory and authority map',
    dependencies: [],
    lifecycle: 'complete',
    closeoutEvidence: ['project/pco/pco-00-control-plane-inventory.md']
  },
  {
    id: 'PCO-01',
    owners: ['PCO'],
    title: 'Schema and concurrency-safe storage',
    dependencies: ['PCO-00'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/workstreams.ts',
      'project/control/types.ts',
      'project/control/nodes/pco.ts'
    ]
  },
  {
    id: 'PCO-02',
    owners: ['PCO'],
    title: 'Derivation engine',
    dependencies: ['PCO-01'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/derive.ts',
      'project/control/validate.ts',
      'project/control/control.test.ts',
      'scripts/project-control.ts'
    ]
  },
  {
    id: 'PCO-03',
    owners: ['PCO'],
    title: 'Live-frontier migration',
    dependencies: ['PCO-02'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/nodes/architecture.ts',
      'project/control/nodes/publication.ts',
      'project/control/nodes/index.ts'
    ]
  },
  {
    id: 'PCO-04',
    owners: ['PCO'],
    title: 'Status and naming projections',
    dependencies: ['PCO-03'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/render.ts',
      'scripts/update-status.ts',
      '.github/workflows/project-control-projections.yml'
    ]
  },
  {
    id: 'PCO-05',
    owners: ['PCO'],
    title: 'Maturity separation and stale-evidence guard',
    dependencies: ['PCO-04'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/maturity-freshness.ts', 'project/control/render.ts']
  },
  {
    id: 'PCO-06',
    owners: ['PCO'],
    title: 'Repository, CI and agent guardrails',
    dependencies: ['PCO-04', 'PCO-05'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'scripts/validate-project-control.ts',
      '.github/workflows/validate-pr.yml',
      'project/control/control.test.ts',
      'project/control/README.md'
    ]
  },
  {
    id: 'PCO-07',
    owners: ['PCO'],
    title: 'Wider migration and overlap removal',
    dependencies: ['PCO-06'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/nodes/evidence.ts',
      'project/control/nodes/index.ts',
      'project/programme-controls.ts'
    ]
  },
  {
    id: 'PCO-08',
    owners: ['PCO'],
    title: 'Adversarial closeout',
    dependencies: ['PCO-07'],
    lifecycle: 'complete',
    closeoutEvidence: ['project/pco/pco-08-adversarial-closeout.md']
  },
  {
    id: 'PCO-VIS',
    owners: ['PCO'],
    title: 'Generated structural and live Mermaid control graphs',
    dependencies: ['PCO-08'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/control/mermaid.ts',
      'project/control/mermaid.test.ts',
      'scripts/project-control-graph.ts',
      'scripts/update-status.ts',
      '.github/workflows/project-control-projections.yml',
      'project/control/README.md'
    ]
  },
  {
    id: 'PCO-DISPATCH',
    owners: ['PCO'],
    title: 'Self-service agent dispatcher and race-safe claim-next policy',
    dependencies: ['PCO-VIS'],
    lifecycle: 'complete',
    closeoutEvidence: [
      'project/pco/pco-dispatcher-design.md',
      'project/pco/pco-dispatcher-closeout.md',
      'project/control/types.ts',
      'project/control/validate.ts',
      'project/control/dispatch.ts',
      'project/control/dispatch.test.ts',
      'scripts/project-claims.ts',
      'project/control/README.md',
      'AGENTS.md'
    ]
  }
])
