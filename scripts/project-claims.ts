import { GitHubClaimStore } from '../project/control/github-claim-store.js'
import { GitConnectorClaimStore, connectorMailbox, readGitClaimSnapshot } from '../project/control/git-connector-claim-store.js'
import { leaseHealth } from '../project/control/lease-health.js'
import { publicationPreflight, renderPublicationReport } from '../project/control/publication-preflight.js'
import { runGit } from '../project/control/git-command.js'
import {
  ClaimConflictError,
  ClaimStoreUnavailableError,
  acquireClaimFromStore,
  claimKeyForRead,
  forceAcquireClaimFromStore,
  releaseClaimInStore,
  renewClaimInStore,
  verifyClaimInStore,
  type ClaimStore,
  type ClaimWriteResult
} from '../project/control/claim-store.js'
import {
  claimsBranch,
  leaseTemporalState,
  operationalState,
  serializeClaimRecord,
  type ClaimHolderKind,
  type ClaimRecord
} from '../project/control/claims.js'
import {
  buildDispatchSnapshot,
  claimNextFromStore,
  defaultDispatchLimit,
  DispatchUnsafeError,
  type DispatchCandidate,
  type DispatchSnapshot
} from '../project/control/dispatch.js'
import { controlNodes } from '../project/control/nodes/index.js'
import { isWorkstreamCode, type WorkstreamCode } from '../project/control/workstreams.js'


interface ParsedArgs {
  command: string
  node?: string
  flags: Map<string, string>
}

type OutputFormat = 'text' | 'json'

function git(args: readonly string[]): string {
  return runGit(args).trim()
}

function repositorySlug(): string {
  const explicit = process.env.GITHUB_REPOSITORY
  if (explicit && /^[^/]+\/[^/]+$/.test(explicit)) return explicit

  const remote = git(['config', '--get', 'remote.origin.url'])
  const ssh = remote.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/)
  if (ssh) return ssh[1]
  const https = remote.match(/^https:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/)
  if (https) return https[1]
  throw new Error('Cannot determine GitHub repository; set GITHUB_REPOSITORY=owner/repo')
}

function tokenForMutation(): string {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  if (!token) throw new Error('Claim mutation requires GH_TOKEN or GITHUB_TOKEN')
  return token
}

function parseArgs(argv: readonly string[]): ParsedArgs {
  const command = argv[0] ?? 'status'
  let node: string | undefined
  const flags = new Map<string, string>()

  for (let i = 1; i < argv.length; i += 1) {
    const value = argv[i]
    if (!value.startsWith('--') && node === undefined) {
      node = value
      continue
    }
    if (!value.startsWith('--')) throw new Error(`Unexpected positional argument: ${value}`)
    const key = value.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) throw new Error(`Flag --${key} requires a value`)
    flags.set(key, next)
    i += 1
  }

  return { command, node, flags }
}

function optionalInt(flags: Map<string, string>, key: string): number | undefined {
  const value = flags.get(key)
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`--${key} must be an integer`)
  return parsed
}

function positiveInt(flags: Map<string, string>, key: string, fallback: number): number {
  const value = optionalInt(flags, key)
  if (value === undefined) return fallback
  if (value < 1) throw new Error(`--${key} must be a positive integer`)
  return value
}

function requiredFlag(flags: Map<string, string>, key: string): string {
  const value = flags.get(key)?.trim()
  if (!value) throw new Error(`--${key} is required`)
  return value
}

function outputFormat(flags: Map<string, string>): OutputFormat {
  const value = flags.get('format') ?? 'text'
  if (value !== 'text' && value !== 'json') throw new Error('--format must be text or json')
  return value
}

function workstreamFilter(flags: Map<string, string>): WorkstreamCode | undefined {
  const value = flags.get('workstream')?.trim()
  if (!value) return undefined
  if (!isWorkstreamCode(value)) throw new Error(`--workstream must be a registered workstream code; got ${value}`)
  return value
}

function holder(flags: Map<string, string>) {
  const kind = requiredFlag(flags, 'holder-kind') as ClaimHolderKind
  if (!['chatgpt', 'codex', 'human', 'automation', 'other'].includes(kind)) {
    throw new Error('--holder-kind must be chatgpt, codex, human, automation or other')
  }
  const label = flags.get('holder-label')?.trim()
  return { kind, ...(label ? { label } : {}) }
}

function metadata(flags: Map<string, string>) {
  const branch = flags.get('branch')?.trim()
  const note = flags.get('note')?.trim()
  const pr = optionalInt(flags, 'pr')
  const evidence = flags.get('checkpoint-evidence'), next = flags.get('checkpoint-next'), blocker = flags.get('checkpoint-blocker')
  if ((evidence || next || blocker) && (!evidence?.trim() || !next?.trim())) throw new Error('Checkpoint requires --checkpoint-evidence and --checkpoint-next')
  return {
    ...(evidence && next ? { checkpoint: { evidence, next, ...(blocker ? { blocker } : {}) } } : {}),
    ...(branch ? { branch } : {}),
    ...(note ? { note } : {}),
    ...(pr ? { pr } : {})
  }
}

/**
 * Acquisition and whole-programme status must be evaluated against current
 * durable PCO truth, not against a feature branch that is editing the graph.
 */
function ensureControlViewMatchesMain(extraPaths: readonly string[] = []): void {
  git(['fetch', 'origin', 'main', '--quiet'])
  try {
    runGit(['merge-base', '--is-ancestor', 'origin/main', 'HEAD'])
  } catch {
    throw new Error('Local checkout does not contain current origin/main; reconcile before using structural claimability')
  }

  const changed = git([
    'diff', '--name-only', 'origin/main...HEAD', '--',
    'project/control/nodes',
    'project/control/types.ts',
    'project/control/workstreams.ts',
    'project/control/derive.ts',
    ...extraPaths
  ])
  if (changed) {
    throw new Error(
      `Local branch changes PCO structural/dispatch state (${changed.split('\n').join(', ')}); run this command from a checkout whose control policy matches current main`
    )
  }
}

function ensureDispatcherViewMatchesMain(): void {
  ensureControlViewMatchesMain([
    'project/control/dispatch.ts',
    'project/control/claims.ts',
    'project/control/lease-health.ts',
    'project/control/claim-store.ts',
    'project/control/git-connector-claim-store.ts',
    'project/control/git-command.ts',
    'project/control/github-claim-store.ts',
    'scripts/project-claims.ts'
  ])
}


function storeFor(command: string, flags: Map<string, string>): ClaimStore {
  const transport = flags.get('transport') ?? 'github'
  if (transport === 'connector') {
    const root = git(['rev-parse', '--show-toplevel'])
    const dir = flags.get('bridge-dir')
    return new GitConnectorClaimStore(repositorySlug(), async () => readGitClaimSnapshot(root), dir ? connectorMailbox(root, dir) : undefined)
  }
  if (transport !== 'github') throw new Error('--transport must be github or connector')
  const mutation = ['claim', 'claim-next', 'renew', 'release', 'force'].includes(command)
  return new GitHubClaimStore(
    repositorySlug(),
    mutation ? tokenForMutation() : process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  )
}

function printWrite(result: ClaimWriteResult): void {
  const claim = result.stored.record
  console.log(JSON.stringify({
    node: claim.node,
    generation: claim.generation,
    state: claim.state,
    leaseId: claim.leaseId,
    holder: claim.holder,
    expiresAt: claim.expiresAt,
    branch: claim.branch ?? null,
    pr: claim.pr ?? null
  }, null, 2))
}

function candidateJson(candidate: DispatchCandidate) {
  return {
    node: candidate.node.id,
    title: candidate.node.title,
    owners: candidate.node.owners,
    recovery: candidate.previousClaim ? { branch: candidate.previousClaim.branch ?? null, pr: candidate.previousClaim.pr ?? null, checkpoint: candidate.previousClaim.checkpoint ?? null, note: candidate.previousClaim.note ?? null, generation: candidate.previousClaim.generation } : null,
    metrics: candidate.metrics
  }
}

function snapshotJson(snapshot: DispatchSnapshot, limit = defaultDispatchLimit) {
  return {
    policyVersion: snapshot.policyVersion,
    observedAt: snapshot.observedAt.toISOString(),
    workstream: snapshot.workstream ?? null,
    safeForAutomaticClaim: snapshot.safeForAutomaticClaim,
    unsafeReasons: snapshot.unsafeReasons,
    candidates: snapshot.candidates.slice(0, limit).map(candidateJson),
    totalCandidates: snapshot.candidates.length,
    manualReady: snapshot.manualReady.map((item) => ({
      node: item.node.id,
      title: item.node.title,
      owners: item.node.owners,
      reason: item.reason
    })),
    claimed: snapshot.claimed.map((item) => ({
      node: item.node.id,
      title: item.node.title,
      holder: item.claim.holder,
      expiresAt: item.claim.expiresAt,
      health: leaseHealth(item.claim, snapshot.observedAt),
      checkpoint: item.claim.checkpoint ?? null,
      grace: item.grace,
      branch: item.claim.branch ?? null,
      pr: item.claim.pr ?? null
    })),
    activeUnclaimed: snapshot.activeUnclaimed.map((node) => ({
      node: node.id,
      title: node.title,
      owners: node.owners
    })),
    invalidLiveClaims: snapshot.invalidLiveClaims.map((item) => ({
      node: item.node,
      structural: item.structural,
      holder: item.claim.holder,
      leaseId: item.claim.leaseId,
      generation: item.claim.generation,
      reason: item.reason
    })),
    policyErrors: snapshot.policyErrors
  }
}

function formatMetric(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function printDispatchSnapshot(snapshot: DispatchSnapshot, limit: number, format: OutputFormat): void {
  if (format === 'json') {
    console.log(JSON.stringify(snapshotJson(snapshot, limit), null, 2))
    return
  }

  console.log('# Agent dispatcher')
  console.log(`Observed: ${snapshot.observedAt.toISOString()} via GitHub`)
  console.log(`Automatic claim: ${snapshot.safeForAutomaticClaim ? 'SAFE' : 'UNSAFE'}`)
  if (snapshot.workstream) console.log(`Workstream filter: ${snapshot.workstream}`)
  console.log('Policy: critical depth ↓ > blocker relief ↓ > downstream reach ↓ > owner load ↑ > canonical id')
  for (const reason of snapshot.unsafeReasons) console.log(`WARNING: ${reason}`)

  console.log('\n## Ranked self-service READY')
  snapshot.candidates.slice(0, limit).forEach((candidate, index) => {
    const m = candidate.metrics
    console.log(
      `${index + 1}. ${candidate.node.id} — ${candidate.node.title} [${candidate.node.owners.join('/')}]\n` +
      `   depth ${m.criticalDepth} | relief ${formatMetric(m.blockerRelief)} | reach ${m.downstreamReach} | immediate unlocks ${m.immediateUnlocks} | owner load ${formatMetric(m.ownerLoad)}`
    )
  })
  if (!snapshot.candidates.length) console.log('- none')

  console.log('\n## Manual READY')
  for (const item of snapshot.manualReady) console.log(`- ${item.node.id} — ${item.node.title}: ${item.reason}`)
  if (!snapshot.manualReady.length) console.log('- none')

  console.log('\n## Claimed')
  for (const item of snapshot.claimed) {
    console.log(
      `- ${item.node.id} — ${item.claim.holder.label ?? item.claim.holder.kind}; last heartbeat ${leaseHealth(item.claim, snapshot.observedAt).heartbeatAgeMinutes} min ago; ${item.grace ? 'grace; expires' : 'expires'} ${item.claim.expiresAt}; ${item.claim.checkpoint?.next ?? item.claim.note ?? 'no recovery checkpoint'}`
    )
  }
  if (!snapshot.claimed.length) console.log('- none')

  console.log('\n## Active / unclaimed handoff candidates')
  for (const node of snapshot.activeUnclaimed) console.log(`- ${node.id} — ${node.title}`)
  if (!snapshot.activeUnclaimed.length) console.log('- none')

  if (snapshot.invalidLiveClaims.length) {
    console.log('\n## Invalid live claims')
    for (const item of snapshot.invalidLiveClaims) console.log(`- ${item.node} — ${item.reason}`)
  }
  if (snapshot.policyErrors.length) {
    console.log('\n## Dispatch policy errors')
    for (const item of snapshot.policyErrors) console.log(`- ${item.node} — ${item.reason}`)
  }
}

async function next(store: ClaimStore, flags: Map<string, string>): Promise<void> {
  ensureDispatcherViewMatchesMain()
  const listed = await store.list()
  const snapshot = buildDispatchSnapshot(
    controlNodes,
    listed.claims.map((claim) => claim.record),
    listed.observedAt,
    { workstream: workstreamFilter(flags) }
  )
  printDispatchSnapshot(snapshot, positiveInt(flags, 'limit', defaultDispatchLimit), outputFormat(flags))
}

async function claimNext(store: ClaimStore, flags: Map<string, string>): Promise<void> {
  ensureDispatcherViewMatchesMain()
  const format = outputFormat(flags)
  const result = await claimNextFromStore(store, controlNodes, {
    holder: holder(flags),
    ttlMinutes: optionalInt(flags, 'ttl'),
    leaseId: flags.get('lease-id'),
    workstream: workstreamFilter(flags),
    ...metadata(flags)
  })

  if (format === 'json') {
    console.log(JSON.stringify({
      policyVersion: result.snapshot.policyVersion,
      observedAt: result.snapshot.observedAt.toISOString(),
      selectionRaces: result.selectionRaces,
      selected: result.selected ? candidateJson(result.selected) : null,
      claim: result.claim ? {
        node: result.claim.stored.record.node,
        generation: result.claim.stored.record.generation,
        state: result.claim.stored.record.state,
        leaseId: result.claim.stored.record.leaseId,
        holder: result.claim.stored.record.holder,
        expiresAt: result.claim.stored.record.expiresAt,
        branch: result.claim.stored.record.branch ?? null,
        pr: result.claim.stored.record.pr ?? null
      } : null
    }, null, 2))
    return
  }

  if (!result.selected || !result.claim) {
    console.log('No self-service READY node is currently available; no lease was created.')
    return
  }

  console.log(`Selected ${result.selected.node.id} — ${result.selected.node.title}`)
  console.log(
    `Ranking: depth ${result.selected.metrics.criticalDepth} | relief ${formatMetric(result.selected.metrics.blockerRelief)} | reach ${result.selected.metrics.downstreamReach} | owner load ${formatMetric(result.selected.metrics.ownerLoad)}`
  )
  if (result.selectionRaces) console.log(`Selection races lost before success: ${result.selectionRaces}`)
  printWrite(result.claim)
}

async function status(store: ClaimStore): Promise<void> {
  ensureControlViewMatchesMain()
  const listed = await store.list()
  const claims = new Map<string, ClaimRecord>(listed.claims.map((claim) => [claim.record.node, claim.record]))
  const available: string[] = []
  const claimed: Array<{ node: string; structural: string; record: ClaimRecord; grace: boolean }> = []
  const handoff: string[] = []
  const invalid: Array<{ node: string; structural: string; record: ClaimRecord }> = []

  for (const node of controlNodes) {
    const state = operationalState(node, controlNodes, claims.get(node.id) ?? null, listed.observedAt)
    if (state.occupancy === 'available') available.push(node.id)
    else if (state.occupancy === 'active-unclaimed') handoff.push(node.id)
    else if (state.occupancy === 'claimed' || state.occupancy === 'claim-grace') {
      claimed.push({
        node: node.id,
        structural: state.structural,
        record: state.claim!,
        grace: state.occupancy === 'claim-grace'
      })
    } else if (state.occupancy === 'invalid-live-claim') {
      invalid.push({ node: node.id, structural: state.structural, record: state.claim! })
    }
  }

  const known = new Set<string>(controlNodes.map((node) => node.id))
  for (const record of claims.values()) {
    if (known.has(record.node)) continue
    const temporal = leaseTemporalState(record, listed.observedAt)
    if (temporal === 'live' || temporal === 'grace') {
      invalid.push({ node: record.node, structural: 'unknown', record })
    }
  }

  console.log('# Operational project control')
  console.log(`Observed: ${listed.observedAt.toISOString()} via GitHub`)
  console.log(
    `Available: ${available.length} | Claimed: ${claimed.length} | Active unclaimed: ${handoff.length} | Invalid live claims: ${invalid.length}`
  )

  console.log('\n## Available')
  for (const id of available) console.log(`- ${id}`)
  if (!available.length) console.log('- none')

  console.log('\n## Claimed')
  for (const item of claimed) {
    console.log(
      `- ${item.node} — ${item.record.holder.label ?? item.record.holder.kind}; ${item.grace ? 'expiry grace through' : 'expires'} ${item.record.expiresAt}; heartbeat ${leaseHealth(item.record, listed.observedAt).heartbeatAgeMinutes} min ago${item.record.branch ? `; branch ${item.record.branch}` : ''}${item.record.pr ? `; PR #${item.record.pr}` : ''}`
    )
  }
  if (!claimed.length) console.log('- none')

  console.log('\n## Active / unclaimed handoff candidates')
  for (const id of handoff) console.log(`- ${id}`)
  if (!handoff.length) console.log('- none')

  if (invalid.length) {
    console.log('\n## Invalid live claims')
    for (const item of invalid) {
      console.log(
        `- ${item.node} — structural ${item.structural}; lease ${item.record.leaseId} generation ${item.record.generation}`
      )
    }
    process.exitCode = 2
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const store = storeFor(args.command, args.flags)

  switch (args.command) {
    case 'doctor': {
      ensureDispatcherViewMatchesMain()
      const listed = await store.list()
      const transport = args.flags.get('transport') ?? 'github'
      const configured = transport === 'connector' ? Boolean(args.flags.get('bridge-dir')) : Boolean(process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN)
      console.log(JSON.stringify({ transport, read: 'verified', mutationConfigured: configured, writeAuthorization: 'unproven until successful CAS write', observedAt: listed.observedAt.toISOString(), claims: listed.claims.length }, null, 2))
      if (!configured) process.exitCode = 2
      return
    }
    case 'status':
      await status(store)
      return

    case 'next':
      if (args.node) throw new Error('next does not accept a positional NODE; use --workstream CODE to narrow')
      await next(store, args.flags)
      return

    case 'claim-next':
      if (args.node) throw new Error('claim-next does not accept a positional NODE; use --workstream CODE to narrow')
      await claimNext(store, args.flags)
      return

    case 'show': {
      if (!args.node) throw new Error('show requires NODE')
      const node = claimKeyForRead(args.node, controlNodes)
      const read = await store.read(node)
      console.log(read.stored ? serializeClaimRecord(read.stored.record) : `${node}: no lease record`)
      return
    }

    case 'merge-check':
    case 'verify': {
      if (!args.node) throw new Error('verify requires NODE')
      const node = args.node
      if (args.command === 'merge-check') {
        // Preserve the existing default JSON; readable operational wording is explicit opt-in.
        const format = args.flags.has('format') ? outputFormat(args.flags) : 'json'
        const leaseId = requiredFlag(args.flags, 'lease-id')
        requiredFlag(args.flags, 'generation')
        const generation = optionalInt(args.flags, 'generation')!
        const result = await publicationPreflight({
          repository: repositorySlug(), branch: requiredFlag(args.flags, 'branch'),
          head: requiredFlag(args.flags, 'head'), leaseId, generation
        }, { git, verify: () => verifyClaimInStore(store, node, controlNodes, {leaseId, generation}) })
        console.log(format === 'text' ? renderPublicationReport(result) : JSON.stringify(result, null, 2))
        return
      }
      // Verification is deliberately occupancy-only. PCO/merge validation is
      // the independent durable structural check.
      const verified = await verifyClaimInStore(store, node, controlNodes, {
        leaseId: requiredFlag(args.flags, 'lease-id'),
        generation: optionalInt(args.flags, 'generation')
      })
      console.log(JSON.stringify({
        node: verified.stored.record.node,
        generation: verified.stored.record.generation,
        leaseId: verified.stored.record.leaseId,
        temporal: verified.temporal,
        observedAt: verified.observedAt.toISOString(),
        expiresAt: verified.stored.record.expiresAt
      }, null, 2))
      return
    }

    case 'claim': {
      if (!args.node) throw new Error('claim requires NODE')
      ensureControlViewMatchesMain()
      printWrite(await acquireClaimFromStore(store, args.node, controlNodes, {
        holder: holder(args.flags),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        leaseId: args.flags.get('lease-id'),
        ...metadata(args.flags)
      }))
      return
    }

    case 'force': {
      if (!args.node) throw new Error('force requires NODE')
      ensureControlViewMatchesMain()
      printWrite(await forceAcquireClaimFromStore(store, args.node, controlNodes, {
        holder: holder(args.flags),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        leaseId: args.flags.get('lease-id'),
        reason: requiredFlag(args.flags, 'reason'),
        ...metadata(args.flags)
      }))
      return
    }

    case 'renew': {
      if (!args.node) throw new Error('renew requires NODE')
      // Renew uses the caller's PCO graph to refuse a node already made
      // non-claimable by the current work. It does not pretend branch-local
      // occupancy is a durable PCO fact.
      printWrite(await renewClaimInStore(store, args.node, controlNodes, {
        leaseId: requiredFlag(args.flags, 'lease-id'),
        generation: optionalInt(args.flags, 'generation'),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        ...metadata(args.flags)
      }))
      return
    }

    case 'release': {
      if (!args.node) throw new Error('release requires NODE')
      const reason = requiredFlag(args.flags, 'reason')
      if (!['completed', 'handoff', 'abandoned', 'superseded', 'other'].includes(reason)) {
        throw new Error('--reason must be completed, handoff, abandoned, superseded or other')
      }
      printWrite(await releaseClaimInStore(store, args.node, controlNodes, {
        leaseId: requiredFlag(args.flags, 'lease-id'),
        generation: optionalInt(args.flags, 'generation'),
        reason: reason as NonNullable<ClaimRecord['releaseReason']>
      }))
      return
    }

    default:
      throw new Error(
        `Unknown command ${args.command}. Use doctor, status, next, claim-next, show, verify, merge-check, claim, renew, release or force.`
      )
  }
}

main().catch((error) => {
  if (error instanceof ClaimConflictError) {
    console.error(`CLAIM CONFLICT: ${error.message}`)
    process.exitCode = 3
  } else if (error instanceof ClaimStoreUnavailableError) {
    console.error(`CLAIM STORE UNAVAILABLE: ${error.message}`)
    process.exitCode = 4
  } else if (error instanceof DispatchUnsafeError) {
    console.error(`DISPATCH UNSAFE: ${error.message}`)
    process.exitCode = 5
  } else {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
})
