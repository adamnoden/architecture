import { maturityLevels, renderMaturityStatusBlock } from '../maturity.js'
import {
  maturityAssessments,
  maturityEvidenceMonitoringBaseline,
  maturityFreshness
} from '../maturity-freshness.js'
import {
  directBlockers,
  nodesByDerivedState,
  structuralCriticalPath,
  unlocksOnCompletion
} from './derive.js'
import { controlNodes } from './nodes/index.js'
import { workstreams } from './workstreams.js'

function tableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

export function renderExecutionStatusBlock(): string {
  const groups = nodesByDerivedState(controlNodes)
  const criticalPath = structuralCriticalPath(controlNodes)

  const readyRows = groups.ready.map((node) => {
    const unlocks = unlocksOnCompletion(node.id, controlNodes).map((candidate) => candidate.id)
    return `| \`${node.id}\` | ${tableCell(node.title)} | ${tableCell(node.owners.join(' / '))} | ${unlocks.length ? tableCell(unlocks.join(', ')) : '—'} |`
  })

  const activeRows = groups.active.map(
    (node) => `| \`${node.id}\` | ${tableCell(node.title)} | ${tableCell(node.owners.join(' / '))} |`
  )

  const blockedRows = groups.blocked.map(
    (node) =>
      `| \`${node.id}\` | ${tableCell(node.title)} | ${tableCell(directBlockers(node, controlNodes).join(', '))} |`
  )

  return [
    'Structural execution state is derived from `project/control/`; this Markdown is a durable projection, not runtime claim authority.',
    '',
    'Visual dependency map: [`project/control/graph.md`](project/control/graph.md). For the same graph with live ACO occupancy overlaid, run `npm run control:graph:live`.',
    '',
    `**Structurally ready:** ${groups.ready.length} · **Active:** ${groups.active.length} · **Blocked:** ${groups.blocked.length} · **Held:** ${groups.held.length} · **Done:** ${groups.done.length} · **Cancelled:** ${groups.cancelled.length}`,
    '',
    '### Structurally ready frontier',
    '',
    'These nodes satisfy hard dependencies. A structurally ready node may already have a live ACO lease; query `npm run control:claims` before starting collision-prone durable work.',
    '',
    '| Node | Work | Owner | Completion would immediately unlock |',
    '|---|---|---|---|',
    ...(readyRows.length ? readyRows : ['| — | No node is currently structurally ready | — | — |']),
    '',
    '### Active durable work',
    '',
    '`active` means the packet is durably started; it is not an agent-presence or lease. Live occupancy belongs to ACO on `runtime/claims`.',
    '',
    '| Node | Work | Owner |',
    '|---|---|---|',
    ...(activeRows.length ? activeRows : ['| — | No node is currently active | — |']),
    '',
    '### Blocked',
    '',
    '| Node | Work | Direct blockers |',
    '|---|---|---|',
    ...(blockedRows.length ? blockedRows : ['| — | No node is currently blocked | — |']),
    '',
    '### Structural critical path',
    '',
    criticalPath.length ? criticalPath.map((id) => `\`${id}\``).join(' → ') : 'No remaining path.',
    '',
    'This path is structural by node count. It is not a wall-clock estimate; weighted scheduling is withheld unless every remaining node on the model has an explicit planning estimate.'
  ].join('\n')
}

function evidenceCount(assessment: (typeof maturityAssessments)[number]): number {
  return new Set(
    (Object.values(assessment.evidence) as readonly (readonly string[])[]).flatMap((paths) => paths)
  ).size
}

export function renderEpistemicMaturityBlock(repoRoot: string): string {
  const freshness = maturityFreshness(repoRoot)
  const scaleRows = maturityLevels.map(
    (level) => `| **${level.id}** | **${level.name}** | ${tableCell(level.criterion)} |`
  )
  const assessmentRows = maturityAssessments.map((assessment) => {
    const status = freshness.get(assessment.id)
    const evidenceStatus =
      status?.state === 'stale'
        ? `**STALE — reassess** (${status.changedEvidence.map((path) => `\`${path}\``).join(', ')})`
        : status?.state === 'fresh'
          ? 'fresh against PCO evidence baseline'
          : `unknown${status?.state === 'unknown' ? ` — ${tableCell(status.reason)}` : ''}`

    return `| **${tableCell(assessment.name)}** | **${assessment.maturity}** | ${assessment.reviewedOn} | ${evidenceCount(assessment)} | ${evidenceStatus} |`
  })

  return [
    'Maturity is an **epistemic judgement**, not execution progress. Completing a graph node does not promote maturity, and reopening work does not automatically demote it.',
    '',
    '### Scale',
    '',
    '| Level | Meaning | Gate |',
    '|---|---|---|',
    ...scaleRows,
    '',
    '### Evidence freshness',
    '',
    `PCO monitors the evidence content from baseline \`${maturityEvidenceMonitoringBaseline.slice(0, 7)}\`. A changed evidence file marks the affected assessment **stale / reassessment required**; it does not automatically lower the M-level. The baseline establishes future drift surveillance and does not itself constitute independent revalidation of earlier evidence.`,
    '',
    '| Assessment | Maturity | Reviewed | Evidence files | Evidence watch |',
    '|---|---:|---|---:|---|',
    ...assessmentRows
  ].join('\n')
}

export function renderWorkstreamCodeRegister(): string {
  const rows = workstreams.map((workstream) => {
    const issue = workstream.issue
      ? `[#${workstream.issue}](https://github.com/adamnoden/architecture/issues/${workstream.issue})`
      : '—'
    const programme = workstream.programme ? `\`${workstream.programme}\`` : '—'
    const aliases = workstream.aliases?.length ? workstream.aliases.map((alias) => `\`${alias}\``).join(', ') : '—'
    return `| \`${workstream.code}\` | ${tableCell(workstream.title)} | ${issue} | ${programme} | ${aliases} |`
  })

  return [
    '# Workstream code register',
    '',
    '**State:** generated projection of `project/control/workstreams.ts`',
    '',
    'New first-class workstreams use exactly three uppercase letters. Historical evidence identities remain aliases where provenance requires them. `RH` remains a deliberate grandfathered two-letter Reference House gate family rather than a new-workstream precedent.',
    '',
    '| Code | Workstream | Issue | Programme / control source | Historical aliases |',
    '|---|---|---:|---|---|',
    ...rows,
    '',
    'Do not hand-edit this register. Change the typed registry and regenerate projections.'
  ].join('\n')
}

export function renderStatusDocument(repoRoot: string): string {
  return [
    '# Project Status',
    '',
    '**Generated project-wide projection — do not hand-edit mutable status here.**',
    '',
    'Durable execution authority lives in `project/control/`. Live claim occupancy lives separately in ACO on `runtime/claims`. Epistemic maturity authority lives in `project/maturity.ts`. Workstream issues and programme/result records retain reasoning, scope and provenance.',
    '',
    '## Execution',
    '',
    '<!-- project-control:start -->',
    renderExecutionStatusBlock(),
    '<!-- project-control:end -->',
    '',
    '## Maturity',
    '',
    renderEpistemicMaturityBlock(repoRoot),
    '',
    '<details>',
    '<summary>Legacy maturity compatibility projection (non-authoritative)</summary>',
    '',
    'This collapsed block is retained temporarily because the existing repository-integrity check still verifies the historical renderer. Its `Current state` / `Next meaningful gate` columns are **not execution authority**; PCO owns current durable execution state above.',
    '',
    '<!-- maturity-status:start -->',
    renderMaturityStatusBlock(),
    '<!-- maturity-status:end -->',
    '',
    '</details>',
    '',
    '## Reading current state',
    '',
    '- Use the **Structurally ready frontier** above to identify work whose hard dependencies are satisfied.',
    '- Use [`project/control/graph.md`](project/control/graph.md) for the generated structural Mermaid dependency map.',
    '- Before substantial execution, query `npm run control:claims` and acquire the ACO lease; structural READY does not mean unclaimed.',
    '- Use owning workstream issues/programmes for the architectural question, scope and exit criteria behind a node.',
    '- A completed node does not itself raise maturity; maturity remains an explicit evidence-backed judgement.',
    '- Possible future PHY/EPR/DEL work is not a blocker until a concrete obligation is admitted into the graph.'
  ].join('\n')
}
