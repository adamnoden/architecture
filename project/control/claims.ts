import { derivedState } from './derive.js'
import type { ControlNode, DerivedNodeState, NodeId } from './types.js'

export const claimsBranch = 'runtime/claims'
export const claimsDirectory = '.pco/claims'
export const claimSchemaVersion = 1 as const
export const defaultLeaseMinutes = 45
export const minimumLeaseMinutes = 15
export const maximumLeaseMinutes = 8 * 60
export const expiryGraceMs = 2 * 60 * 1000

export type ClaimHolderKind = 'chatgpt' | 'codex' | 'human' | 'automation' | 'other'
export type ClaimState = 'claimed' | 'released'

/** Occupancy may change between dispatcher selection and the fresh acquisition read. */
export class ClaimOccupiedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClaimOccupiedError'
  }
}
export type LeaseTemporalState = 'live' | 'grace' | 'expired' | 'released'

export interface ClaimHolder {
  kind: ClaimHolderKind
  label?: string
}

export interface SupersededLease {
  leaseId: string
  generation: number
  holder: ClaimHolder
  reason: string
}

/** Historical evidence pointer, not transferred ownership or validated current progress. */
/** Most recent durable remote evidence, retained across repeated empty successor runs. */
export interface RecoverySource {
  leaseId: string
  generation: number
  branch: string
  pr?: number
  checkpoint: RecoveryCheckpoint
}

export interface PredecessorClaim {
  leaseId: string
  generation: number
  branch?: string
  pr?: number
  checkpoint?: RecoveryCheckpoint
}

export interface RecoveryCheckpoint {
  /** Recoverable repository/PR evidence; never a path in another agent's scratch space. */
  evidence: string
  next: string
  blocker?: string
}

export interface ClaimRecord {
  schemaVersion: typeof claimSchemaVersion
  node: NodeId
  generation: number
  state: ClaimState
  leaseId: string
  holder: ClaimHolder
  claimedAt: string
  heartbeatAt: string
  expiresAt: string
  branch?: string
  pr?: number
  checkpoint?: RecoveryCheckpoint
  note?: string
  releasedAt?: string
  releaseReason?: 'completed' | 'handoff' | 'abandoned' | 'superseded' | 'other'
  supersedes?: SupersededLease
  predecessor?: PredecessorClaim
  recoverySource?: RecoverySource
}

export interface ClaimMetadata {
  branch?: string
  pr?: number
  checkpoint?: RecoveryCheckpoint
  note?: string
}

export interface AcquireClaimInput extends ClaimMetadata {
  predecessor?: PredecessorClaim
  recoverySource?: RecoverySource
  node: NodeId
  generation: number
  leaseId: string
  holder: ClaimHolder
  now: Date
  ttlMinutes?: number
  supersedes?: SupersededLease
}

export type OperationalOccupancy =
  | 'available'
  | 'claimed'
  | 'claim-grace'
  | 'active-unclaimed'
  | 'invalid-live-claim'
  | 'not-claimable'

export interface OperationalNodeState {
  structural: DerivedNodeState
  occupancy: OperationalOccupancy
  claim?: ClaimRecord
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function optionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || nonEmptyString(value)
}

function isHolderKind(value: unknown): value is ClaimHolderKind {
  return ['chatgpt', 'codex', 'human', 'automation', 'other'].includes(String(value))
}

export function canonicalNodeId(input: string, nodes: readonly ControlNode[]): NodeId {
  const direct = nodes.find((node) => node.id === input)
  if (direct) return direct.id

  const matches = nodes.filter((node) => node.aliases?.includes(input))
  if (matches.length === 1) return matches[0].id
  if (matches.length > 1) throw new Error(`Ambiguous node alias: ${input}`)
  throw new Error(`Unknown control node or alias: ${input}`)
}

export function claimPath(nodeId: NodeId): string {
  if (!/^[A-Z0-9][A-Z0-9-]*$/.test(nodeId)) throw new Error(`Unsafe claim node id: ${nodeId}`)
  return `${claimsDirectory}/${nodeId}.json`
}

export function validateTtlMinutes(value: number): number {
  if (!Number.isFinite(value) || !Number.isInteger(value)) throw new Error('Lease TTL must be an integer number of minutes')
  if (value < minimumLeaseMinutes || value > maximumLeaseMinutes) {
    throw new Error(`Lease TTL must be between ${minimumLeaseMinutes} and ${maximumLeaseMinutes} minutes`)
  }
  return value
}

export function parseClaimRecord(raw: string, expectedNode?: NodeId): ClaimRecord {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('Malformed claim JSON')
  }

  if (!isRecord(value)) throw new Error('Claim record must be an object')
  if (value.schemaVersion !== claimSchemaVersion) throw new Error(`Unsupported claim schema version: ${String(value.schemaVersion)}`)
  if (!nonEmptyString(value.node)) throw new Error('Claim record has invalid node')
  if (expectedNode && value.node !== expectedNode) throw new Error(`Claim record node mismatch: expected ${expectedNode}, got ${value.node}`)
  if (!Number.isInteger(value.generation) || Number(value.generation) < 1) throw new Error('Claim generation must be a positive integer')
  if (value.state !== 'claimed' && value.state !== 'released') throw new Error(`Invalid claim state: ${String(value.state)}`)
  if (!nonEmptyString(value.leaseId)) throw new Error('Claim record has invalid leaseId')
  if (!isRecord(value.holder) || !isHolderKind(value.holder.kind)) throw new Error('Claim record has invalid holder')
  if (!optionalNonEmptyString(value.holder.label)) throw new Error('Claim holder label must be non-empty when present')
  if (!isIsoDate(value.claimedAt) || !isIsoDate(value.heartbeatAt) || !isIsoDate(value.expiresAt)) {
    throw new Error('Claim record has invalid lease timestamps')
  }
  if (Date.parse(value.claimedAt as string) > Date.parse(value.heartbeatAt as string) || Date.parse(value.heartbeatAt as string) > Date.parse(value.expiresAt as string)) {
    throw new Error('Lease timestamps must satisfy claimedAt <= heartbeatAt <= expiresAt')
  }
  if (value.checkpoint !== undefined) {
    const c = value.checkpoint
    if (!isRecord(c) || !nonEmptyString(c.evidence) || !nonEmptyString(c.next) || !optionalNonEmptyString(c.blocker)) {
      throw new Error('Invalid recovery checkpoint: evidence and next are required')
    }
  }
  if (!optionalNonEmptyString(value.branch) || !optionalNonEmptyString(value.note)) {
    throw new Error('Claim branch/note must be non-empty when present')
  }
  if (value.pr !== undefined && (!Number.isInteger(value.pr) || Number(value.pr) <= 0)) throw new Error('Claim PR must be a positive integer')

  if (value.state === 'released') {
    if (!isIsoDate(value.releasedAt)) throw new Error('Released claim requires releasedAt')
    if (!['completed', 'handoff', 'abandoned', 'superseded', 'other'].includes(String(value.releaseReason))) {
      throw new Error('Released claim requires a valid releaseReason')
    }
  }

  if (value.recoverySource !== undefined) {
    const r = value.recoverySource
    if (!isRecord(r) || !nonEmptyString(r.leaseId) || !Number.isInteger(r.generation) || Number(r.generation) < 1 || Number(r.generation) >= Number(value.generation) || r.leaseId === value.leaseId || !nonEmptyString(r.branch)) {
      throw new Error('Invalid retained recovery source identity')
    }
    if (r.pr !== undefined && (!Number.isInteger(r.pr) || Number(r.pr) <= 0)) throw new Error('Invalid retained recovery PR')
    if (!isRecord(r.checkpoint) || !nonEmptyString(r.checkpoint.evidence) || !nonEmptyString(r.checkpoint.next) || !optionalNonEmptyString(r.checkpoint.blocker)) {
      throw new Error('Invalid retained recovery source checkpoint')
    }
  }

  if (value.predecessor !== undefined) {
    const p = value.predecessor
    if (!isRecord(p) || !nonEmptyString(p.leaseId) || !Number.isInteger(p.generation) || Number(p.generation) < 1 || Number(p.generation) >= Number(value.generation) || p.leaseId === value.leaseId) {
      throw new Error('Invalid predecessor lease identity/generation')
    }
    if (!optionalNonEmptyString(p.branch) || (p.pr !== undefined && (!Number.isInteger(p.pr) || Number(p.pr) <= 0))) {
      throw new Error('Invalid predecessor branch/PR')
    }
    if (p.checkpoint !== undefined && (!isRecord(p.checkpoint) || !nonEmptyString(p.checkpoint.evidence) || !nonEmptyString(p.checkpoint.next) || !optionalNonEmptyString(p.checkpoint.blocker))) {
      throw new Error('Invalid predecessor checkpoint')
    }
  }

  if (value.supersedes !== undefined) {
    if (!isRecord(value.supersedes)) throw new Error('Claim supersedes metadata must be an object')
    if (!nonEmptyString(value.supersedes.leaseId)) throw new Error('Superseded lease has invalid leaseId')
    if (!Number.isInteger(value.supersedes.generation) || Number(value.supersedes.generation) < 1) {
      throw new Error('Superseded lease has invalid generation')
    }
    if (!isRecord(value.supersedes.holder) || !isHolderKind(value.supersedes.holder.kind)) {
      throw new Error('Superseded lease has invalid holder')
    }
    if (!nonEmptyString(value.supersedes.reason)) throw new Error('Superseded lease requires a reason')
  }

  return value as unknown as ClaimRecord
}

export function serializeClaimRecord(record: ClaimRecord): string {
  return `${JSON.stringify(record, null, 2)}\n`
}

export function leaseTemporalState(
  record: ClaimRecord,
  now: Date,
  graceMs = expiryGraceMs
): LeaseTemporalState {
  if (record.state === 'released') return 'released'

  const nowMs = now.getTime()
  const expiryMs = Date.parse(record.expiresAt)
  if (nowMs < expiryMs) return 'live'
  if (nowMs < expiryMs + graceMs) return 'grace'
  return 'expired'
}

export function isStructurallyClaimable(state: DerivedNodeState): boolean {
  return state === 'ready' || state === 'active'
}

export function assertStructurallyClaimable(node: ControlNode, nodes: readonly ControlNode[]): DerivedNodeState {
  const state = derivedState(node, nodes)
  if (!isStructurallyClaimable(state)) {
    throw new Error(`${node.id} cannot be claimed while structurally ${state}`)
  }
  return state
}

export function createClaimRecord(input: AcquireClaimInput): ClaimRecord {
  const ttl = validateTtlMinutes(input.ttlMinutes ?? defaultLeaseMinutes)
  const now = new Date(input.now)
  if (!Number.isFinite(now.getTime())) throw new Error('Claim time is invalid')
  if (!Number.isInteger(input.generation) || input.generation < 1) throw new Error('Claim generation must be positive')
  if (!nonEmptyString(input.leaseId)) throw new Error('Claim leaseId must be non-empty')
  if (input.predecessor && (input.predecessor.generation >= input.generation || input.predecessor.leaseId === input.leaseId)) {
    throw new Error('Predecessor must identify an older, distinct lease')
  }
  if (input.recoverySource && (input.recoverySource.generation >= input.generation || input.recoverySource.leaseId === input.leaseId)) {
    throw new Error('Recovery source must identify an older, distinct lease')
  }
  if (input.recoverySource?.branch && input.branch === input.recoverySource.branch) {
    throw new Error('Recovery must not reuse the source branch')
  }
  if (input.predecessor?.branch && input.branch === input.predecessor.branch) {
    throw new Error('Recovery must not reuse the predecessor branch')
  }

  const expires = new Date(now.getTime() + ttl * 60 * 1000)
  return {
    schemaVersion: claimSchemaVersion,
    node: input.node,
    generation: input.generation,
    state: 'claimed',
    leaseId: input.leaseId,
    holder: input.holder,
    claimedAt: now.toISOString(),
    heartbeatAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    ...(input.checkpoint ? { checkpoint: input.checkpoint } : {}),
    ...(input.branch ? { branch: input.branch } : {}),
    ...(input.pr ? { pr: input.pr } : {}),
    ...(input.note ? { note: input.note } : {}),
    ...(input.supersedes ? { supersedes: input.supersedes } : {}),
    ...(input.predecessor ? { predecessor: input.predecessor } : {}),
    ...(input.recoverySource ? { recoverySource: input.recoverySource } : {})
  }
}

/** An evidence pointer, never an acceptance or ownership claim. */
export function lastRecoverableEvidence(record: ClaimRecord): RecoverySource | null {
  if (record.branch && record.checkpoint) return {
    leaseId: record.leaseId, generation: record.generation, branch: record.branch,
    ...(record.pr ? { pr: record.pr } : {}), checkpoint: record.checkpoint
  }
  if (record.recoverySource) return record.recoverySource
  if (record.predecessor?.branch && record.predecessor.checkpoint) return {
    leaseId: record.predecessor.leaseId, generation: record.predecessor.generation,
    branch: record.predecessor.branch,
    ...(record.predecessor.pr ? { pr: record.predecessor.pr } : {}),
    checkpoint: record.predecessor.checkpoint
  }
  return null
}

export function nextNormalAcquisition(
  previous: ClaimRecord | null,
  input: Omit<AcquireClaimInput, 'generation' | 'predecessor' | 'recoverySource'>
): ClaimRecord {
  if (previous) {
    const state = leaseTemporalState(previous, input.now)
    if (state === 'live' || state === 'grace') {
      throw new ClaimOccupiedError(`${previous.node} is already claimed by ${previous.holder.label ?? previous.holder.kind} until ${previous.expiresAt}`)
    }
  }

  return createClaimRecord({
    ...input,
    generation: previous ? previous.generation + 1 : 1,
    ...(previous && lastRecoverableEvidence(previous) ? { recoverySource: lastRecoverableEvidence(previous)! } : {}),
    ...(previous ? { predecessor: {
      leaseId: previous.leaseId,
      generation: previous.generation,
      ...(previous.branch ? { branch: previous.branch } : {}),
      ...(previous.pr ? { pr: previous.pr } : {}),
      ...(previous.checkpoint ? { checkpoint: previous.checkpoint } : {})
    } } : {})
  })
}

export function forceTakeover(
  previous: ClaimRecord,
  input: Omit<AcquireClaimInput, 'generation' | 'supersedes'> & { reason: string }
): ClaimRecord {
  if (!nonEmptyString(input.reason)) throw new Error('Force takeover requires a non-empty reason')

  return createClaimRecord({
    ...input,
    generation: previous.generation + 1,
    supersedes: {
      leaseId: previous.leaseId,
      generation: previous.generation,
      holder: previous.holder,
      reason: input.reason.trim()
    }
  })
}

function assertCurrentLease(record: ClaimRecord, leaseId: string, generation?: number): void {
  if (record.leaseId !== leaseId) throw new Error(`Lease id does not own ${record.node}`)
  if (generation !== undefined && record.generation !== generation) {
    throw new Error(`Lease generation ${generation} is stale for ${record.node}; current generation is ${record.generation}`)
  }
}

export function renewClaim(
  record: ClaimRecord,
  leaseId: string,
  now: Date,
  ttlMinutes = defaultLeaseMinutes,
  generation?: number,
  metadata: ClaimMetadata = {}
): ClaimRecord {
  assertCurrentLease(record, leaseId, generation)
  if (record.state !== 'claimed') throw new Error(`Cannot renew released lease for ${record.node}`)
  const temporal = leaseTemporalState(record, now)
  if (temporal === 'expired') throw new Error(`Cannot renew expired lease for ${record.node}; reacquire it`)

  const ttl = validateTtlMinutes(ttlMinutes)
  const expires = new Date(now.getTime() + ttl * 60 * 1000)
  return {
    ...record,
    heartbeatAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    ...(metadata.branch !== undefined ? { branch: metadata.branch } : {}),
    ...(metadata.pr !== undefined ? { pr: metadata.pr } : {}),
    ...(metadata.checkpoint !== undefined ? { checkpoint: metadata.checkpoint } : {}),
    ...(metadata.note !== undefined ? { note: metadata.note } : {})
  }
}

export function releaseClaim(
  record: ClaimRecord,
  leaseId: string,
  now: Date,
  reason: NonNullable<ClaimRecord['releaseReason']>,
  generation?: number
): ClaimRecord {
  assertCurrentLease(record, leaseId, generation)
  if (record.state === 'released') throw new Error(`Lease for ${record.node} is already released`)

  return {
    ...record,
    state: 'released',
    releasedAt: now.toISOString(),
    releaseReason: reason,
    heartbeatAt: now.toISOString(),
    expiresAt: now.toISOString()
  }
}

export function operationalState(
  node: ControlNode,
  nodes: readonly ControlNode[],
  claim: ClaimRecord | null,
  now: Date
): OperationalNodeState {
  const structural = derivedState(node, nodes)
  const temporal = claim ? leaseTemporalState(claim, now) : null
  const occupying = temporal === 'live' || temporal === 'grace'

  if (!isStructurallyClaimable(structural)) {
    return {
      structural,
      occupancy: occupying ? 'invalid-live-claim' : 'not-claimable',
      ...(claim ? { claim } : {})
    }
  }

  if (occupying) {
    return {
      structural,
      occupancy: temporal === 'grace' ? 'claim-grace' : 'claimed',
      claim: claim ?? undefined
    }
  }

  return {
    structural,
    occupancy: structural === 'active' ? 'active-unclaimed' : 'available',
    ...(claim ? { claim } : {})
  }
}
