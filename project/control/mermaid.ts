import { derivedState } from './derive.js'
import { operationalState, type ClaimRecord } from './claims.js'
import type { ControlNode, DerivedNodeState } from './types.js'

export interface MermaidGraphOptions {
  /** Include completed/cancelled history. Defaults to the remaining execution graph. */
  includeDone?: boolean
  /** Optional live ACO lease overlay, keyed by canonical node id. */
  claims?: ReadonlyMap<string, ClaimRecord>
  /** Observation time for ACO lease evaluation. Required when claims are supplied. */
  observedAt?: Date
  direction?: 'LR' | 'TB'
}

const structuralClass: Record<DerivedNodeState, string> = {
  ready: 'ready',
  blocked: 'blocked',
  active: 'active',
  held: 'held',
  done: 'done',
  cancelled: 'cancelled'
}

const classDefinitions = [
  'classDef ready fill:#e9f7ef,stroke:#2f855a,color:#1a202c,stroke-width:2px;',
  'classDef blocked fill:#f3f4f6,stroke:#718096,color:#2d3748;',
  'classDef active fill:#e8f1fb,stroke:#2b6cb0,color:#1a202c,stroke-width:2px;',
  'classDef held fill:#fff7e6,stroke:#b7791f,color:#3d2b0b;',
  'classDef done fill:#f7fafc,stroke:#a0aec0,color:#718096;',
  'classDef cancelled fill:#f7fafc,stroke:#a0aec0,color:#718096,stroke-dasharray:4 3;',
  'classDef available fill:#e9f7ef,stroke:#2f855a,color:#1a202c,stroke-width:3px;',
  'classDef claimed fill:#eee9ff,stroke:#6b46c1,color:#24144f,stroke-width:3px;',
  'classDef claimGrace fill:#fff7e6,stroke:#b7791f,color:#3d2b0b,stroke-width:3px,stroke-dasharray:4 3;',
  'classDef activeUnclaimed fill:#e8f1fb,stroke:#2b6cb0,color:#1a202c,stroke-width:3px,stroke-dasharray:4 3;',
  'classDef invalidClaim fill:#fff0f0,stroke:#c53030,color:#5b1515,stroke-width:4px;'
]

function mermaidId(id: string): string {
  return `n_${id.replace(/[^A-Za-z0-9_]/g, '_')}`
}

function safeLabel(value: string): string {
  return value
    .replace(/&/g, 'and')
    .replace(/[<>]/g, '')
    .replace(/"/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function holderLabel(record: ClaimRecord): string {
  return safeLabel(record.holder.label ?? record.holder.kind)
}

function expiryLabel(record: ClaimRecord): string {
  const parsed = new Date(record.expiresAt)
  if (!Number.isFinite(parsed.getTime())) return record.expiresAt
  return `${parsed.toISOString().slice(11, 16)}Z`
}

function nodePresentation(
  node: ControlNode,
  nodes: readonly ControlNode[],
  options: MermaidGraphOptions
): { label: string; className: string } {
  const title = safeLabel(node.title)

  if (!options.claims) {
    const state = derivedState(node, nodes)
    return {
      label: `${safeLabel(node.id)}<br/>${title}<br/><b>${state.toUpperCase()}</b>`,
      className: structuralClass[state]
    }
  }

  if (!options.observedAt) throw new Error('Mermaid live overlay requires observedAt')
  const state = operationalState(node, nodes, options.claims.get(node.id) ?? null, options.observedAt)

  switch (state.occupancy) {
    case 'available':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>AVAILABLE</b>`,
        className: 'available'
      }
    case 'claimed':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>CLAIMED · ${holderLabel(state.claim!)}</b><br/>until ${expiryLabel(state.claim!)}`,
        className: 'claimed'
      }
    case 'claim-grace':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>CLAIM GRACE · ${holderLabel(state.claim!)}</b><br/>expired ${expiryLabel(state.claim!)}`,
        className: 'claimGrace'
      }
    case 'active-unclaimed':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>ACTIVE · UNCLAIMED</b>`,
        className: 'activeUnclaimed'
      }
    case 'invalid-live-claim':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>INVALID LIVE CLAIM · ${state.structural.toUpperCase()}</b>`,
        className: 'invalidClaim'
      }
    case 'not-claimable':
      return {
        label: `${safeLabel(node.id)}<br/>${title}<br/><b>${state.structural.toUpperCase()}</b>`,
        className: structuralClass[state.structural]
      }
  }
}

function groupKey(node: ControlNode): string {
  return node.owners.length === 1 ? node.owners[0] : 'SHARED'
}

function groupLabel(key: string): string {
  return key === 'SHARED' ? 'Shared integration gates' : key
}

export function renderControlMermaid(
  nodes: readonly ControlNode[],
  options: MermaidGraphOptions = {}
): string {
  const direction = options.direction ?? 'LR'
  const visible = nodes.filter((node) => {
    if (options.includeDone) return true
    const state = derivedState(node, nodes)
    return state !== 'done' && state !== 'cancelled'
  })
  const visibleIds = new Set(visible.map((node) => node.id))
  const grouped = new Map<string, ControlNode[]>()

  for (const node of visible) {
    const key = groupKey(node)
    const existing = grouped.get(key) ?? []
    existing.push(node)
    grouped.set(key, existing)
  }

  const lines: string[] = [
    `flowchart ${direction}`,
    '  %% Generated from project/control. Do not hand-edit graph topology.'
  ]

  for (const [key, groupNodes] of grouped) {
    const groupId = `g_${key.replace(/[^A-Za-z0-9_]/g, '_')}`
    lines.push(`  subgraph ${groupId}["${groupLabel(key)}"]`)
    lines.push('    direction TB')
    for (const node of groupNodes) {
      const presentation = nodePresentation(node, nodes, options)
      lines.push(`    ${mermaidId(node.id)}["${presentation.label}"]`)
    }
    lines.push('  end')
  }

  for (const node of visible) {
    for (const dependency of node.dependencies) {
      if (!visibleIds.has(dependency)) continue
      lines.push(`  ${mermaidId(dependency)} --> ${mermaidId(node.id)}`)
    }
  }

  lines.push('')
  for (const definition of classDefinitions) lines.push(`  ${definition}`)
  for (const node of visible) {
    const presentation = nodePresentation(node, nodes, options)
    lines.push(`  class ${mermaidId(node.id)} ${presentation.className};`)
  }

  return `${lines.join('\n')}\n`
}

export function renderControlGraphDocument(nodes: readonly ControlNode[]): string {
  return [
    '# Project control map',
    '',
    '**State:** generated projection of `project/control/` — do not hand-edit graph topology.',
    '',
    'This page visualises the durable PCO dependency graph. It does **not** persist ACO runtime occupancy: live claims are intentionally queried from `runtime/claims` at read time.',
    '',
    '## Current execution graph',
    '',
    'Completed/cancelled history is omitted here so the current dependency frontier remains legible.',
    '',
    '```mermaid',
    renderControlMermaid(nodes).trimEnd(),
    '```',
    '',
    '## Complete graph',
    '',
    '<details>',
    '<summary>Show completed and cancelled history</summary>',
    '',
    '```mermaid',
    renderControlMermaid(nodes, { includeDone: true }).trimEnd(),
    '```',
    '',
    '</details>',
    '',
    '## Live ACO occupancy',
    '',
    'The committed Mermaid map above stays structural by design. To overlay current claims without creating heartbeat churn on `main`:',
    '',
    '```text',
    'npm run control:graph:live',
    '```',
    '',
    'For the structural graph in terminal/Markdown form use `npm run control:graph`; add `-- --all` to include completed history.',
    ''
  ].join('\n')
}
