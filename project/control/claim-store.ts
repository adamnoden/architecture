import { randomUUID } from 'node:crypto'
import type { ControlNode, NodeId } from './types.js'
import {
  assertStructurallyClaimable,
  canonicalNodeId,
  createClaimRecord,
  forceTakeover,
  leaseTemporalState,
  nextNormalAcquisition,
  parseClaimRecord,
  releaseClaim,
  renewClaim,
  type ClaimHolder,
  type ClaimMetadata,
  type ClaimRecord
} from './claims.js'

export interface StoredClaim {
  record: ClaimRecord
  sha: string
}

export interface ClaimReadResult {
  stored: StoredClaim | null
  observedAt: Date
}

export interface ClaimWriteResult {
  stored: StoredClaim
  observedAt: Date
}

export class ClaimConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClaimConflictError'
  }
}

export class ClaimStoreUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClaimStoreUnavailableError'
  }
}

export interface ClaimStore {
  read(node: NodeId): Promise<ClaimReadResult>
  create(node: NodeId, record: ClaimRecord): Promise<ClaimWriteResult>
  update(node: NodeId, expectedSha: string, record: ClaimRecord): Promise<ClaimWriteResult>
  list(): Promise<{ claims: readonly StoredClaim[]; observedAt: Date }>
}

export interface AcquireOptions extends ClaimMetadata {
  holder: ClaimHolder
  ttlMinutes?: number
  leaseId?: string
  maxInfrastructureRetries?: number
}

export interface ForceAcquireOptions extends AcquireOptions {
  reason: string
}

export interface LeaseMutationOptions extends ClaimMetadata {
  leaseId: string
  generation?: number
  ttlMinutes?: number
  maxInfrastructureRetries?: number
}

export interface ReleaseOptions {
  leaseId: string
  generation?: number
  reason: NonNullable<ClaimRecord['releaseReason']>
  maxInfrastructureRetries?: number
}

export interface VerifyOptions {
  leaseId: string
  generation?: number
}

export interface VerifiedLease {
  stored: StoredClaim
  observedAt: Date
  temporal: 'live' | 'grace'
}

function candidateLeaseId(explicit?: string): string {
  return explicit ?? randomUUID()
}

function retryLimit(value?: number): number {
  if (value === undefined) return 3
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    throw new Error('Infrastructure retry limit must be an integer between 0 and 10')
  }
  return value
}

function sameStoredVersion(left: StoredClaim | null, right: StoredClaim | null): boolean {
  return left?.sha === right?.sha
}

function canonicalOrSafeStoredNode(inputNode: string, nodes: readonly ControlNode[]): NodeId {
  try {
    return canonicalNodeId(inputNode, nodes)
  } catch (error) {
    // Recovery must remain possible after a canonical node is removed from the
    // durable graph. Aliases cannot be recovered once their canonical mapping
    // disappears, so only a syntactically canonical key is accepted here.
    if (/^[A-Z0-9][A-Z0-9-]*$/.test(inputNode)) return inputNode
    throw error
  }
}

async function resolveConflict(
  store: ClaimStore,
  nodeId: NodeId,
  before: StoredClaim | null,
  retriesRemaining: number
): Promise<{ retry: boolean; current: ClaimReadResult }> {
  const current = await store.read(nodeId)
  if (sameStoredVersion(before, current.stored) && retriesRemaining > 0) {
    return { retry: true, current }
  }
  return { retry: false, current }
}

export async function acquireClaimFromStore(
  store: ClaimStore,
  inputNode: string,
  nodes: readonly ControlNode[],
  options: AcquireOptions
): Promise<ClaimWriteResult> {
  const nodeId = canonicalNodeId(inputNode, nodes)
  const node = nodes.find((candidate) => candidate.id === nodeId)
  if (!node) throw new Error(`Unknown canonical node: ${nodeId}`)
  assertStructurallyClaimable(node, nodes)

  const leaseId = candidateLeaseId(options.leaseId)
  let retries = retryLimit(options.maxInfrastructureRetries)

  while (true) {
    const before = await store.read(nodeId)
    const next = nextNormalAcquisition(before.stored?.record ?? null, {
      node: nodeId,
      leaseId,
      holder: options.holder,
      now: before.observedAt,
      ttlMinutes: options.ttlMinutes,
      branch: options.branch,
      pr: options.pr,
      note: options.note
    })

    try {
      return before.stored
        ? await store.update(nodeId, before.stored.sha, next)
        : await store.create(nodeId, next)
    } catch (error) {
      if (!(error instanceof ClaimConflictError)) throw error
      const resolution = await resolveConflict(store, nodeId, before.stored, retries)
      if (resolution.retry) {
        retries -= 1
        continue
      }

      const current = resolution.current.stored?.record
      if (current?.leaseId === leaseId) {
        return { stored: resolution.current.stored!, observedAt: resolution.current.observedAt }
      }
      if (current) {
        const temporal = leaseTemporalState(current, resolution.current.observedAt)
        throw new ClaimConflictError(
          temporal === 'live' || temporal === 'grace'
            ? `${nodeId} was claimed concurrently by ${current.holder.label ?? current.holder.kind} until ${current.expiresAt}`
            : `${nodeId} changed concurrently; refetch before acquiring again`
        )
      }
      throw new ClaimConflictError(`${nodeId} claim creation conflicted; retry from fresh state`)
    }
  }
}

export async function forceAcquireClaimFromStore(
  store: ClaimStore,
  inputNode: string,
  nodes: readonly ControlNode[],
  options: ForceAcquireOptions
): Promise<ClaimWriteResult> {
  if (!options.reason.trim()) throw new Error('Force acquisition requires a non-empty reason')
  const nodeId = canonicalNodeId(inputNode, nodes)
  const node = nodes.find((candidate) => candidate.id === nodeId)
  if (!node) throw new Error(`Unknown canonical node: ${nodeId}`)
  assertStructurallyClaimable(node, nodes)

  const before = await store.read(nodeId)
  if (!before.stored) return acquireClaimFromStore(store, nodeId, nodes, options)

  const next = forceTakeover(before.stored.record, {
    node: nodeId,
    leaseId: candidateLeaseId(options.leaseId),
    holder: options.holder,
    now: before.observedAt,
    ttlMinutes: options.ttlMinutes,
    branch: options.branch,
    pr: options.pr,
    note: options.note,
    reason: options.reason
  })

  try {
    return await store.update(nodeId, before.stored.sha, next)
  } catch (error) {
    if (!(error instanceof ClaimConflictError)) throw error
    const current = await store.read(nodeId)
    if (current.stored?.sha !== before.stored.sha) {
      throw new ClaimConflictError(
        `${nodeId} changed while force takeover was being decided; inspect the new holder before forcing again`
      )
    }
    throw error
  }
}

/**
 * Verify occupancy only: does this execution still own a non-expired lease?
 * Durable structural eligibility remains PCO's independent responsibility.
 */
export async function verifyClaimInStore(
  store: ClaimStore,
  inputNode: string,
  nodes: readonly ControlNode[],
  options: VerifyOptions
): Promise<VerifiedLease> {
  const nodeId = canonicalOrSafeStoredNode(inputNode, nodes)
  const current = await store.read(nodeId)
  if (!current.stored) throw new Error(`No lease exists for ${nodeId}`)
  const record = current.stored.record
  if (record.leaseId !== options.leaseId) throw new Error(`Lease id does not own ${nodeId}`)
  if (options.generation !== undefined && record.generation !== options.generation) {
    throw new Error(`Lease generation ${options.generation} is stale for ${nodeId}; current generation is ${record.generation}`)
  }
  if (record.state !== 'claimed') throw new Error(`Lease for ${nodeId} is released`)

  const temporal = leaseTemporalState(record, current.observedAt)
  if (temporal !== 'live' && temporal !== 'grace') {
    throw new Error(`Lease for ${nodeId} has expired; reacquire before continuing`)
  }

  return { stored: current.stored, observedAt: current.observedAt, temporal }
}

export async function renewClaimInStore(
  store: ClaimStore,
  inputNode: string,
  nodes: readonly ControlNode[],
  options: LeaseMutationOptions
): Promise<ClaimWriteResult> {
  const nodeId = canonicalNodeId(inputNode, nodes)
  const node = nodes.find((candidate) => candidate.id === nodeId)
  if (!node) throw new Error(`Unknown canonical node: ${nodeId}`)
  assertStructurallyClaimable(node, nodes)
  let retries = retryLimit(options.maxInfrastructureRetries)

  while (true) {
    // Renewal is intentionally denied when the caller's durable PCO view says
    // the node is no longer ready/active. The lease can still be released.
    assertStructurallyClaimable(node, nodes)
    const before = await store.read(nodeId)
    if (!before.stored) throw new Error(`No lease exists for ${nodeId}`)
    const next = renewClaim(
      before.stored.record,
      options.leaseId,
      before.observedAt,
      options.ttlMinutes,
      options.generation,
      { branch: options.branch, pr: options.pr, note: options.note }
    )

    try {
      return await store.update(nodeId, before.stored.sha, next)
    } catch (error) {
      if (!(error instanceof ClaimConflictError)) throw error
      const resolution = await resolveConflict(store, nodeId, before.stored, retries)
      if (resolution.retry) {
        retries -= 1
        continue
      }
      throw new ClaimConflictError(
        `${nodeId} lease changed before renewal completed; current generation must be re-read`
      )
    }
  }
}

export async function releaseClaimInStore(
  store: ClaimStore,
  inputNode: string,
  nodes: readonly ControlNode[],
  options: ReleaseOptions
): Promise<ClaimWriteResult> {
  // Release is intentionally more permissive than acquire/renew. A lease must
  // remain releasable even if its canonical node has since been removed from the
  // PCO graph. In that recovery case the caller must supply the canonical key.
  const nodeId = canonicalOrSafeStoredNode(inputNode, nodes)
  let retries = retryLimit(options.maxInfrastructureRetries)

  while (true) {
    const before = await store.read(nodeId)
    if (!before.stored) throw new Error(`No lease exists for ${nodeId}`)
    const next = releaseClaim(
      before.stored.record,
      options.leaseId,
      before.observedAt,
      options.reason,
      options.generation
    )

    try {
      return await store.update(nodeId, before.stored.sha, next)
    } catch (error) {
      if (!(error instanceof ClaimConflictError)) throw error
      const resolution = await resolveConflict(store, nodeId, before.stored, retries)
      if (resolution.retry) {
        retries -= 1
        continue
      }
      throw new ClaimConflictError(
        `${nodeId} lease changed before release completed; current generation must be re-read`
      )
    }
  }
}

/** Read a claim key for diagnostics/recovery, including an orphaned canonical key. */
export function claimKeyForRead(inputNode: string, nodes: readonly ControlNode[]): NodeId {
  return canonicalOrSafeStoredNode(inputNode, nodes)
}

/** Validate a store payload before exposing it to orchestration logic. */
export function storedClaimFromRaw(raw: string, sha: string, expectedNode: NodeId): StoredClaim {
  return { record: parseClaimRecord(raw, expectedNode), sha }
}
