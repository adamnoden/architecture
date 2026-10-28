import { renderMaturityStatusBlock } from '../maturity.js'
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
    'Execution state is derived from `project/control/`; this Markdown is a projection, not authority.',
    '',
    `**Ready:** ${groups.ready.length} · **Active:** ${groups.active.length} · **Blocked:** ${groups.blocked.length} · **Held:** ${groups.held.length} · **Done:** ${groups.done.length} · **Cancelled:** ${groups.cancelled.length}`,
    '',
    '### Ready frontier',
    '',
    '| Node | Work | Owner | Completion would immediately unlock |',
    '|---|---|---|---|',
    ...(readyRows.length ? readyRows : ['| — | No node is currently ready | — | — |']),
    '',
    '### Active durable work',
    '',
    '`active` means the packet is durably started; it is not an agent-presence or branch lease.',
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

export function renderStatusDocument(): string {
  return [
    '# Project Status',
    '',
    '**Generated project-wide projection — do not hand-edit mutable status here.**',
    '',
    'Execution authority lives in `project/control/`. Epistemic maturity authority lives in `project/maturity.ts`. Workstream issues and programme/result records retain reasoning, scope and provenance. This document intentionally does not duplicate mutable programme prose.',
    '',
    '## Execution',
    '',
    '<!-- project-control:start -->',
    renderExecutionStatusBlock(),
    '<!-- project-control:end -->',
    '',
    '## Maturity',
    '',
    '<!-- maturity-status:start -->',
    renderMaturityStatusBlock(),
    '<!-- maturity-status:end -->',
    '',
    '## Reading current state',
    '',
    '- Use the **Ready frontier** above for work that can start without violating a hard dependency.',
    '- Use owning workstream issues/programmes for the architectural question, scope and exit criteria behind a node.',
    '- A completed node does not itself raise maturity; maturity remains an explicit evidence-backed judgement.',
    '- Possible future PHY/EPR/DEL work is not a blocker until a concrete obligation is admitted into the graph.'
  ].join('\n')
}
