import type { ControlNode, DerivedNodeState, NodeId } from './types.js'

function nodeMap(nodes: readonly ControlNode[]): Map<NodeId, ControlNode> {
  return new Map(nodes.map((node) => [node.id, node]))
}

export function derivedState(node: ControlNode, nodes: readonly ControlNode[]): DerivedNodeState {
  switch (node.lifecycle) {
    case 'complete':
      return 'done'
    case 'cancelled':
      return 'cancelled'
    case 'held':
      return 'held'
    case 'started':
      return 'active'
    case 'planned': {
      const byId = nodeMap(nodes)
      const ready = node.dependencies.every((dependency) => byId.get(dependency)?.lifecycle === 'complete')
      return ready ? 'ready' : 'blocked'
    }
  }
}

export function directBlockers(node: ControlNode, nodes: readonly ControlNode[]): NodeId[] {
  const byId = nodeMap(nodes)
  return node.dependencies.filter((dependency) => byId.get(dependency)?.lifecycle !== 'complete')
}

export function readyFrontier(nodes: readonly ControlNode[]): ControlNode[] {
  return nodes.filter((node) => derivedState(node, nodes) === 'ready')
}

export function activeNodes(nodes: readonly ControlNode[]): ControlNode[] {
  return nodes.filter((node) => derivedState(node, nodes) === 'active')
}

export function nodesByDerivedState(
  nodes: readonly ControlNode[]
): Record<DerivedNodeState, ControlNode[]> {
  const result: Record<DerivedNodeState, ControlNode[]> = {
    ready: [],
    blocked: [],
    active: [],
    held: [],
    done: [],
    cancelled: []
  }

  for (const node of nodes) result[derivedState(node, nodes)].push(node)
  return result
}

/** Nodes that would become READY if `completedId` alone were completed now. */
export function unlocksOnCompletion(completedId: NodeId, nodes: readonly ControlNode[]): ControlNode[] {
  return nodes.filter((node) => {
    if (node.lifecycle !== 'planned' || !node.dependencies.includes(completedId)) return false
    const blockers = directBlockers(node, nodes)
    return blockers.length === 1 && blockers[0] === completedId
  })
}

/**
 * Longest remaining dependency chain by node count.
 *
 * This is deliberately structural rather than a promise of elapsed time. Nodes
 * marked complete/cancelled are removed. A held node remains visible because it
 * can still sit on the path that blocks a committed downstream result.
 */
export function structuralCriticalPath(nodes: readonly ControlNode[]): NodeId[] {
  const remaining = nodes.filter((node) => node.lifecycle !== 'complete' && node.lifecycle !== 'cancelled')
  const remainingIds = new Set(remaining.map((node) => node.id))
  const outgoing = new Map<NodeId, NodeId[]>()

  for (const node of remaining) outgoing.set(node.id, [])
  for (const node of remaining) {
    for (const dependency of node.dependencies) {
      if (remainingIds.has(dependency)) outgoing.get(dependency)?.push(node.id)
    }
  }

  const byId = nodeMap(remaining)
  const roots = remaining.filter((node) =>
    node.dependencies.every((dependency) => !remainingIds.has(dependency))
  )
  const memo = new Map<NodeId, NodeId[]>()

  function longestFrom(id: NodeId): NodeId[] {
    const cached = memo.get(id)
    if (cached) return cached

    let bestChild: NodeId[] = []
    for (const child of outgoing.get(id) ?? []) {
      const candidate = longestFrom(child)
      if (candidate.length > bestChild.length) bestChild = candidate
    }

    const result = [id, ...bestChild]
    memo.set(id, result)
    return result
  }

  let best: NodeId[] = []
  for (const root of roots) {
    if (!byId.has(root.id)) continue
    const candidate = longestFrom(root.id)
    if (candidate.length > best.length) best = candidate
  }

  return best
}

/**
 * Weighted path is only reported when every remaining node has an explicit
 * estimate. This avoids silently converting missing estimates into false zeroes.
 */
export function weightedCriticalPath(
  nodes: readonly ControlNode[]
): { path: NodeId[]; estimatedEffortHours: number } | null {
  const remaining = nodes.filter((node) => node.lifecycle !== 'complete' && node.lifecycle !== 'cancelled')
  if (remaining.length === 0) return { path: [], estimatedEffortHours: 0 }
  if (remaining.some((node) => node.estimatedEffortHours === undefined)) return null

  const remainingIds = new Set(remaining.map((node) => node.id))
  const outgoing = new Map<NodeId, NodeId[]>()
  const byId = nodeMap(remaining)
  for (const node of remaining) outgoing.set(node.id, [])
  for (const node of remaining) {
    for (const dependency of node.dependencies) {
      if (remainingIds.has(dependency)) outgoing.get(dependency)?.push(node.id)
    }
  }

  const roots = remaining.filter((node) =>
    node.dependencies.every((dependency) => !remainingIds.has(dependency))
  )
  const memo = new Map<NodeId, { path: NodeId[]; weight: number }>()

  function longestFrom(id: NodeId): { path: NodeId[]; weight: number } {
    const cached = memo.get(id)
    if (cached) return cached

    let bestChild: { path: NodeId[]; weight: number } = { path: [], weight: 0 }
    for (const child of outgoing.get(id) ?? []) {
      const candidate = longestFrom(child)
      if (candidate.weight > bestChild.weight) bestChild = candidate
    }

    const current = byId.get(id)
    if (!current || current.estimatedEffortHours === undefined) {
      throw new Error(`Weighted path encountered an unestimated node: ${id}`)
    }

    const result = {
      path: [id, ...bestChild.path],
      weight: current.estimatedEffortHours + bestChild.weight
    }
    memo.set(id, result)
    return result
  }

  let best: { path: NodeId[]; weight: number } = { path: [], weight: 0 }
  for (const root of roots) {
    const candidate = longestFrom(root.id)
    if (candidate.weight > best.weight) best = candidate
  }

  return { path: best.path, estimatedEffortHours: best.weight }
}
