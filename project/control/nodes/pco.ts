import { defineNodes } from '../types.js'

export const pcoNodes = defineNodes([
  {
    id: 'PCO-GIT-DEADLINE', owners: ['PCO'],
    title: 'Bound configurable Git command deadlines across canonical lease operations',
    dependencies: ['PCO-SNAPSHOT'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed throughput repair (#1241); exceptional lease bootstrap recorded in #953 before registration.' },
    closeoutEvidence: ['project/pco/git-deadline-result.md']
  },
  {
    id: 'PCO-REVIEW-POLICY', owners: ['PCO'],
    title: 'Separate internal development from external assurance and remove unnecessary review waits',
    dependencies: ['PCO-HOUSE-PLAN'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed review-gate audit and development-policy change on 31 October 2026.' },
    closeoutEvidence: ['project/pco/review-gate-audit.md']
  },
  {
    id: 'PCO-MODES', owners: ['PCO'],
    title: 'Close regular-chat PR association and confirm shared worker topologies',
    dependencies: ['PCO-GATEWAY'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed MVB release fix and cross-topology regression (#1091).' },
    closeoutEvidence: ['project/pco/mvb-barbell-modes-result.md']
  },
  {
    id: 'PCO-GATEWAY', owners: ['PCO'],
    title: 'Expose canonical self-service leases to connector-only chats through a minimal issue gateway',
    dependencies: ['PCO-CRASH'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed, security-sensitive privileged workflow change (#1088).' },
    closeoutEvidence: ['project/pco/mvb-issue-gateway-result.md']
  },
  {
    id: 'PCO-CRASH', owners: ['PCO'],
    title: 'Recover interrupted swarms and support connector-constrained chat execution',
    dependencies: ['PCO-COMMS'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed crash-recovery and cross-runtime MVB uplift (issue #1083).' },
    closeoutEvidence: ['project/pco/mvb-crash-recovery-result.md']
  },
  {
    id: 'PCO-COMMS', owners: ['PCO'],
    title: 'Introduce readable MVB communication discipline and scoped preflight observations',
    dependencies: ['PCO-MVB-REVIEW'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed red team, implementation and MVB 1.1 communications release.' },
    closeoutEvidence: ['project/control/communications.md', 'project/pco/mvb-communications-result.md']
  },
  {
    id: 'PCO-MVB-REVIEW', owners: ['PCO'],
    title: 'Assess external orchestration systems and version the MVB operating contract',
    dependencies: ['PCO-MANUAL'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed build-versus-adopt review and first explicit MVB version baseline.' },
    closeoutEvidence: ['project/pco/mvb-platform-review.md', 'project/control/releases.md']
  },
  {
    id: 'PCO-MANUAL', owners: ['PCO'],
    title: 'Document the integrated project execution system for outsiders and maintainers',
    dependencies: ['PCO-SNAPSHOT'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed cohesive documentation and discoverability review.' },
    closeoutEvidence: ['project/pco/execution-manual-result.md']
  },
  {
    id: 'PCO-SNAPSHOT', owners: ['PCO'],
    title: 'Keep claim and briefing snapshots correct during main updates',
    dependencies: ['PCO-OPERATIONS'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed operations verification exposed shared FETCH_HEAD interference.' },
    closeoutEvidence: ['project/pco/claim-snapshot-result.md']
  },
  {
    id: 'PCO-OPERATIONS', owners: ['PCO'],
    title: 'Integrate agent briefing, scoped proof CI and safe post-merge reconciliation',
    dependencies: ['PCO-RESILIENCE'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed coordination-system upgrade on 29 October 2026.' },
    closeoutEvidence: ['project/pco/operations-result.md']
  },
  {
    id: 'PCO-RESILIENCE', owners: ['PCO'],
    title: 'Bound failure recovery and expose lease freshness and handoff evidence',
    dependencies: ['PCO-SWARM'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed resilience hardening on 29 October 2026.' },
    closeoutEvidence: ['project/pco/lease-resilience-result.md']
  },
  {
    id: 'PCO-HOUSE-PLAN', owners: ['PCO'],
    title: 'Record owner-house objective and delivery execution plan',
    dependencies: ['PCO-DISPATCH'], lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed project planning; register before acquiring its normal lease.' },
    closeoutEvidence: ['project/pco/pco-house-plan-result.md']
  },
  {
    id: 'PCO-REFURB-PLAN',
    owners: ['PCO'],
    title: 'Record owner-directed refurbishment scope and swarmable handoffs',
    dependencies: ['PCO-DISPATCH'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed coordination packet; bootstrap before acquiring its ACO lease.' },
    closeoutEvidence: ['project/pco/pco-refurbishment-plan-result.md']
  },
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
  },
  {
    id: 'PCO-APPLICABILITY',
    owners: ['PCO'],
    title: 'Bind maturity applicability to assessed design sources',
    dependencies: ['PCO-DISPATCH', 'HRS-BASELINE'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'self-service' },
    closeoutEvidence: ['project/pco/pco-applicability-result.md']
  },
  {
    id: 'PCO-SWARM',
    owners: ['PCO'],
    title: 'Swarm continuation, startup transport and evidence-based run reporting',
    dependencies: ['PCO-DISPATCH'],
    lifecycle: 'complete',
    agentDispatch: { mode: 'manual', reason: 'Owner-directed operating-contract and runtime integration change; explicitly assigned on 29 October 2026.' },
    closeoutEvidence: ['project/pco/swarm-operations-result.md', 'project/control/swarm-runbook.md', 'project/control/run-report.ts', 'project/control/git-connector-claim-store.ts']
  }

])
