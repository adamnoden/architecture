import {
  ClaimConflictError,
  acquireClaimFromStore,
  type AcquireOptions,
  type ClaimStore,
  type ClaimWriteResult
} from './claim-store.js'
import {
  directBlockers,
  derivedState
} from './derive.js'
import {
  ClaimOccupiedError,
  leaseTemporalState,
  operationalState,
  lastRecoverableEvidence,
  type ClaimRecord
} from './claims.js'
import type { ControlNode, NodeId } from './types.js'
import type { WorkstreamCode } from './workstreams.js'

export const dispatchPolicyVersion = 1 as const
export const defaultDispatchLimit = 5
export const defaultSelectionRaceRetries = 8

export interface DispatchMetrics {
  /** Longest unfinished dependency chain starting at this node, including itself. */
  criticalDepth: number
  /** Fractional relief across directly blocked planned dependants. */
  blockerRelief: number
  /** Number of unfinished descendants reachable from this node. */
  downstreamReach: number
  /** Direct dependants that would become READY if this node alone completed now. */
  immediateUnlocks: number
  /** Mean occupied-node count across owning workstreams. */
  ownerLoad: number
}

export interface DispatchCandidate {
  previousClaim?: ClaimRecord
  /** Started packet with a verified recovery pointer, not a new work queue. */
  resumeActive?: true
  node: ControlNode
  metrics: DispatchMetrics
}

export interface DispatchClaimedNode {
  node: ControlNode
  claim: ClaimRecord
  grace: boolean
}

export interface DispatchInvalidClaim {
  node: string
  structural: string
  claim: ClaimRecord
  reason: string
}

export interface DispatchManualReady {
  node: ControlNode
  reason: string
}

export interface DispatchPolicyError {
  node: NodeId
  reason: string
}

export interface DispatchSnapshot {
  policyVersion: typeof dispatchPolicyVersion
  observedAt: Date
  workstream?: WorkstreamCode
  safeForAutomaticClaim: boolean
  unsafeReasons: readonly string[]
  candidates: readonly DispatchCandidate[]
  manualReady: readonly DispatchManualReady[]
  claimed: readonly DispatchClaimedNode[]
  activeUnclaimed: readonly ControlNode[]
  invalidLiveClaims: readonly DispatchInvalidClaim[]
  policyErrors: readonly DispatchPolicyError[]
}

export interface DispatchBuildOptions {
  workstream?: WorkstreamCode
}

export interface ClaimNextOptions extends AcquireOptions {
  workstream?: WorkstreamCode
  maxSelectionRaceRetries?: number
}

export interface ClaimNextResult {
  snapshot: DispatchSnapshot
  selected: DispatchCandidate | null
  claim: ClaimWriteResult | null
  selectionRaces: number
}

export class DispatchUnsafeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DispatchUnsafeError'
  }
}

function remainingNodes(nodes: readonly ControlNode[]): ControlNode[] {
  return nodes.filter((node) => node.lifecycle !== 'complete' && node.lifecycle !== 'cancelled')
}

function outgoingMap(nodes: readonly ControlNode[]): Map<NodeId, NodeId[]> {
  const remaining = remainingNodes(nodes)
  const ids = new Set(remaining.map((node) => node.id))
  const outgoing = new Map<NodeId, NodeId[]>(remaining.map((node) => [node.id, []]))

  for (const node of remaining) {
    for (const dependency of node.dependencies) {
      if (ids.has(dependency)) outgoing.get(dependency)?.push(node.id)
    }
  }

  for (const children of outgoing.values()) children.sort()
  return outgoing
}

function criticalDepths(nodes: readonly ControlNode[]): ReadonlyMap<NodeId, number> {
  const outgoing = outgoingMap(nodes)
  const memo = new Map<NodeId, number>()

  function depth(id: NodeId): number {
    const cached = memo.get(id)
    if (cached !== undefined) return cached
    const children = outgoing.get(id) ?? []
    const value = 1 + (children.length ? Math.max(...children.map(depth)) : 0)
    memo.set(id, value)
    return value
  }

  for (const id of outgoing.keys()) depth(id)
  return memo
}

function descendantCounts(nodes: readonly ControlNode[]): ReadonlyMap<NodeId, number> {
  const outgoing = outgoingMap(nodes)
  const memo = new Map<NodeId, ReadonlySet<NodeId>>()

  function descendants(id: NodeId): ReadonlySet<NodeId> {
    const cached = memo.get(id)
    if (cached) return cached
    const result = new Set<NodeId>()
    for (const child of outgoing.get(id) ?? []) {
      result.add(child)
      for (const descendant of descendants(child)) result.add(descendant)
    }
    memo.set(id, result)
    return result
  }

  return new Map([...outgoing.keys()].map((id) => [id, descendants(id).size]))
}

function blockerReliefFor(node: ControlNode, nodes: readonly ControlNode[]): {
  blockerRelief: number
  immediateUnlocks: number
} {
  let blockerRelief = 0
  let immediateUnlocks = 0

  for (const dependant of nodes) {
    if (dependant.lifecycle !== 'planned' || !dependant.dependencies.includes(node.id)) continue
    const blockers = directBlockers(dependant, nodes)
    if (!blockers.includes(node.id) || blockers.length === 0) continue
    blockerRelief += 1 / blockers.length
    if (blockers.length === 1) immediateUnlocks += 1
  }

  return { blockerRelief, immediateUnlocks }
}

function matchesWorkstream(node: ControlNode, workstream?: WorkstreamCode): boolean {
  return !workstream || node.owners.includes(workstream)
}

function liveClaimMap(claims: readonly ClaimRecord[]): Map<string, ClaimRecord> {
  const result = new Map<string, ClaimRecord>()
  for (const claim of claims) result.set(claim.node, claim)
  return result
}

function ownerLoads(
  nodes: readonly ControlNode[],
  claims: ReadonlyMap<string, ClaimRecord>,
  now: Date
): ReadonlyMap<string, number> {
  const occupied = new Set<NodeId>()

  for (const node of nodes) {
    if (derivedState(node, nodes) === 'active') occupied.add(node.id)
    const claim = claims.get(node.id)
    if (!claim) continue
    const operational = operationalState(node, nodes, claim, now)
    if (operational.occupancy === 'claimed' || operational.occupancy === 'claim-grace') {
      occupied.add(node.id)
    }
  }

  const result = new Map<string, number>()
  for (const id of occupied) {
    const node = nodes.find((candidate) => candidate.id === id)
    if (!node) continue
    for (const owner of node.owners) result.set(owner, (result.get(owner) ?? 0) + 1)
  }
  return result
}

function meanOwnerLoad(node: ControlNode, loads: ReadonlyMap<string, number>): number {
  if (!node.owners.length) return 0
  return node.owners.reduce((sum, owner) => sum + (loads.get(owner) ?? 0), 0) / node.owners.length
}

function compareCandidates(left: DispatchCandidate, right: DispatchCandidate): number {
  if (left.metrics.criticalDepth !== right.metrics.criticalDepth) {
    return right.metrics.criticalDepth - left.metrics.criticalDepth
  }
  if (left.metrics.blockerRelief !== right.metrics.blockerRelief) {
    return right.metrics.blockerRelief - left.metrics.blockerRelief
  }
  if (left.metrics.downstreamReach !== right.metrics.downstreamReach) {
    return right.metrics.downstreamReach - left.metrics.downstreamReach
  }
  if (left.metrics.ownerLoad !== right.metrics.ownerLoad) {
    return left.metrics.ownerLoad - right.metrics.ownerLoad
  }
  return left.node.id.localeCompare(right.node.id)
}

function dispatchPolicyError(node: ControlNode): string | null {
  if (node.lifecycle === 'complete' || node.lifecycle === 'cancelled') return null
  if (!node.agentDispatch) return 'missing explicit agent dispatch policy'
  if (node.agentDispatch.mode === 'manual' && !node.agentDispatch.reason?.trim()) {
    return 'manual dispatch policy has no durable reason'
  }
  return null
}

export function buildDispatchSnapshot(
  nodes: readonly ControlNode[],
  claims: readonly ClaimRecord[],
  now: Date,
  options: DispatchBuildOptions = {}
): DispatchSnapshot {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const claimByNode = liveClaimMap(claims)
  const depths = criticalDepths(nodes)
  const reach = descendantCounts(nodes)
  const loads = ownerLoads(nodes, claimByNode, now)
  const candidates: DispatchCandidate[] = []
  const manualReady: DispatchManualReady[] = []
  const claimed: DispatchClaimedNode[] = []
  const activeUnclaimed: ControlNode[] = []
  const invalidLiveClaims: DispatchInvalidClaim[] = []
  const policyErrors: DispatchPolicyError[] = []

  for (const node of nodes) {
    const error = dispatchPolicyError(node)
    if (error) policyErrors.push({ node: node.id, reason: error })

    const claim = claimByNode.get(node.id) ?? null
    const state = operationalState(node, nodes, claim, now)

    if (state.occupancy === 'invalid-live-claim' && state.claim) {
      invalidLiveClaims.push({
        node: node.id,
        structural: state.structural,
        claim: state.claim,
        reason: `live lease occupies structurally ${state.structural} node`
      })
      continue
    }

    if (!matchesWorkstream(node, options.workstream)) continue

    if ((state.occupancy === 'claimed' || state.occupancy === 'claim-grace') && state.claim) {
      claimed.push({
        node,
        claim: state.claim,
        grace: state.occupancy === 'claim-grace'
      })
      continue
    }

    // Active work is normally a manual handoff. Only self-service work with a
    // durable predecessor branch and actionable checkpoint can re-enter dispatch.
    // Fresh CAS acquisition rechecks this evidence against the current record.
    const resumeActive = state.occupancy === 'active-unclaimed' &&
      node.agentDispatch?.mode === 'self-service' &&
      Boolean(claim && lastRecoverableEvidence(claim))
    if (state.occupancy === 'active-unclaimed' && !resumeActive) {
      activeUnclaimed.push(node)
      continue
    }

    if (!resumeActive && (state.structural !== 'ready' || state.occupancy !== 'available')) continue

    if (node.agentDispatch?.mode === 'manual') {
      manualReady.push({ node, reason: node.agentDispatch.reason ?? 'manual dispatch' })
      continue
    }

    if (node.agentDispatch?.mode !== 'self-service') continue

    const relief = blockerReliefFor(node, nodes)
    candidates.push({
      ...(claim ? { previousClaim: claim } : {}),
      ...(resumeActive ? { resumeActive: true as const } : {}),
      node,
      metrics: {
        criticalDepth: depths.get(node.id) ?? 1,
        blockerRelief: relief.blockerRelief,
        downstreamReach: reach.get(node.id) ?? 0,
        immediateUnlocks: relief.immediateUnlocks,
        ownerLoad: meanOwnerLoad(node, loads)
      }
    })
  }

  const knownIds = new Set(nodes.map((node) => node.id))
  for (const claim of claims) {
    if (knownIds.has(claim.node)) continue
    const temporal = leaseTemporalState(claim, now)
    if (temporal === 'live' || temporal === 'grace') {
      invalidLiveClaims.push({
        node: claim.node,
        structural: 'unknown',
        claim,
        reason: 'live lease references a node absent from the durable PCO graph'
      })
    }
  }

  candidates.sort(compareCandidates)
  manualReady.sort((a, b) => a.node.id.localeCompare(b.node.id))
  claimed.sort((a, b) => a.node.id.localeCompare(b.node.id))
  activeUnclaimed.sort((a, b) => a.id.localeCompare(b.id))
  invalidLiveClaims.sort((a, b) => a.node.localeCompare(b.node))
  policyErrors.sort((a, b) => a.node.localeCompare(b.node))

  const unsafeReasons: string[] = []
  if (invalidLiveClaims.length) unsafeReasons.push(`${invalidLiveClaims.length} invalid live claim(s) require reconciliation`)
  if (policyErrors.length) unsafeReasons.push(`${policyErrors.length} live node dispatch policy error(s) require reconciliation`)

  return {
    policyVersion: dispatchPolicyVersion,
    observedAt: now,
    ...(options.workstream ? { workstream: options.workstream } : {}),
    safeForAutomaticClaim: unsafeReasons.length === 0,
    unsafeReasons,
    candidates,
    manualReady,
    claimed,
    activeUnclaimed,
    invalidLiveClaims,
    policyErrors
  }
}

function selectionRetryLimit(value?: number): number {
  if (value === undefined) return defaultSelectionRaceRetries
  if (!Number.isInteger(value) || value < 0 || value > 50) {
    throw new Error('Selection-race retry limit must be an integer between 0 and 50')
  }
  return value
}

export async function claimNextFromStore(
  store: ClaimStore,
  nodes: readonly ControlNode[],
  options: ClaimNextOptions
): Promise<ClaimNextResult> {
  let racesRemaining = selectionRetryLimit(options.maxSelectionRaceRetries)
  let selectionRaces = 0

  while (true) {
    const listed = await store.list()
    const snapshot = buildDispatchSnapshot(
      nodes,
      listed.claims.map((claim) => claim.record),
      listed.observedAt,
      { workstream: options.workstream }
    )

    if (!snapshot.safeForAutomaticClaim) {
      throw new DispatchUnsafeError(`Automatic dispatch is unsafe: ${snapshot.unsafeReasons.join('; ')}`)
    }

    const selected = snapshot.candidates[0] ?? null
    if (!selected) return { snapshot, selected: null, claim: null, selectionRaces }

    try {
      const claim = await acquireClaimFromStore(store, selected.node.id, nodes, { ...options, requireRecoveryEvidence: true })
      return { snapshot, selected, claim, selectionRaces }
    } catch (error) {
      if (!(error instanceof ClaimConflictError) && !(error instanceof ClaimOccupiedError)) throw error
      if (racesRemaining <= 0) {
        throw new ClaimConflictError(
          `Dispatcher exhausted selection-race retries after ${selectionRaces + 1} conflict(s): ${error.message}`
        )
      }
      racesRemaining -= 1
      selectionRaces += 1
      // Full relist + rerank on every lost selection race. The new best node may
      // differ because another claimant changed occupancy or owner load.
    }
  }
}
