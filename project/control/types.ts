import type { WorkstreamCode } from './workstreams.js'

export const nodeLifecycles = ['planned', 'started', 'held', 'complete', 'cancelled'] as const
export type NodeLifecycle = (typeof nodeLifecycles)[number]

export const agentDispatchModes = ['self-service', 'manual'] as const
export type AgentDispatchMode = (typeof agentDispatchModes)[number]

export interface AgentDispatchPolicy {
  /** Whether an undirected generic repository agent may take this node automatically. */
  mode: AgentDispatchMode
  /** Required for manual nodes so exclusion is visible rather than implicit. */
  reason?: string
}

export type NodeId = string

export interface ControlNode {
  id: NodeId
  owners: readonly WorkstreamCode[]
  title: string
  dependencies: readonly NodeId[]
  lifecycle: NodeLifecycle
  /** Historical/per-stream packet identities represented by this canonical execution node. */
  aliases?: readonly string[]
  /** Generic-agent dispatch policy. Required by validation for every non-terminal live node. */
  agentDispatch?: AgentDispatchPolicy
  /** Repository-relative durable evidence required before a node may be complete. */
  closeoutEvidence: readonly string[]
  /** Optional planning estimate. It is not evidence and is never required for scheduling correctness. */
  estimatedEffortHours?: number
}

export type DerivedNodeState = 'ready' | 'blocked' | 'active' | 'held' | 'done' | 'cancelled'

export function defineNodes<const T extends readonly ControlNode[]>(nodes: T): T {
  return nodes
}
