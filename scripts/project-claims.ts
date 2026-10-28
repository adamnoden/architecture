import { execFileSync } from 'node:child_process'
import { Buffer } from 'node:buffer'
import {
  ClaimConflictError,
  ClaimStoreUnavailableError,
  acquireClaimFromStore,
  forceAcquireClaimFromStore,
  releaseClaimInStore,
  renewClaimInStore,
  storedClaimFromRaw,
  type ClaimStore,
  type ClaimWriteResult,
  type StoredClaim
} from '../project/control/claim-store.js'
import {
  canonicalNodeId,
  claimPath,
  claimsBranch,
  claimsDirectory,
  operationalState,
  parseClaimRecord,
  serializeClaimRecord,
  type ClaimHolderKind,
  type ClaimRecord
} from '../project/control/claims.js'
import { controlNodes } from '../project/control/nodes/index.js'

interface GitHubContentFile {
  type: 'file'
  path: string
  sha: string
  content?: string
  encoding?: string
}

interface ParsedArgs {
  command: string
  node?: string
  flags: Map<string, string>
}

function git(args: readonly string[]): string {
  return execFileSync('git', [...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
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

  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index]
    if (!value.startsWith('--') && node === undefined) {
      node = value
      continue
    }
    if (!value.startsWith('--')) throw new Error(`Unexpected positional argument: ${value}`)
    const key = value.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) throw new Error(`Flag --${key} requires a value`)
    flags.set(key, next)
    index += 1
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

function requiredFlag(flags: Map<string, string>, key: string): string {
  const value = flags.get(key)
  if (!value?.trim()) throw new Error(`--${key} is required`)
  return value.trim()
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
  return {
    ...(branch ? { branch } : {}),
    ...(note ? { note } : {}),
    ...(pr ? { pr } : {})
  }
}

function ensureControlViewMatchesMain(): void {
  git(['fetch', 'origin', 'main', '--quiet'])
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { stdio: 'ignore' })
  } catch {
    throw new Error('Local checkout does not contain current origin/main; reconcile before using structural claimability')
  }

  const changed = git([
    'diff',
    '--name-only',
    'origin/main...HEAD',
    '--',
    'project/control/nodes',
    'project/control/types.ts',
    'project/control/workstreams.ts',
    'project/control/derive.ts'
  ])
  if (changed) {
    throw new Error(
      `Local branch changes PCO structural state (${changed.split('\n').join(', ')}); run claim/status from a checkout whose control graph matches current main`
    )
  }
}

function observedAt(response: Response): Date {
  const serverDate = response.headers.get('date')
  const parsed = serverDate ? new Date(serverDate) : new Date()
  return Number.isFinite(parsed.getTime()) ? parsed : new Date()
}

function encodedPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

class GitHubClaimStore implements ClaimStore {
  private branchChecked = false

  constructor(
    private readonly repo: string,
    private readonly token?: string
  ) {}

  private headers(write = false): Record<string, string> {
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(write ? { 'Content-Type': 'application/json' } : {})
    }
  }

  private async assertBranch(): Promise<void> {
    if (this.branchChecked) return
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/branches/${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers() }
    )
    if (!response.ok) {
      throw new ClaimStoreUnavailableError(
        response.status === 404
          ? `ACO runtime branch ${claimsBranch} does not exist`
          : `Cannot read ACO runtime branch ${claimsBranch}: GitHub ${response.status}`
      )
    }
    this.branchChecked = true
  }

  async read(node: string) {
    await this.assertBranch()
    const path = claimPath(node)
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/contents/${encodedPath(path)}?ref=${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers() }
    )
    const at = observedAt(response)
    if (response.status === 404) return { stored: null, observedAt: at }
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot read ${path}: GitHub ${response.status}`)

    const value = (await response.json()) as GitHubContentFile
    if (value.type !== 'file' || !value.content || value.encoding !== 'base64') {
      throw new ClaimStoreUnavailableError(`Unexpected GitHub contents response for ${path}`)
    }
    const raw = Buffer.from(value.content.replace(/\n/g, ''), 'base64').toString('utf8')
    return { stored: storedClaimFromRaw(raw, value.sha, node), observedAt: at }
  }

  async create(node: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    return this.write(node, record, undefined)
  }

  async update(node: string, expectedSha: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    return this.write(node, record, expectedSha)
  }

  private async write(node: string, record: ClaimRecord, expectedSha?: string): Promise<ClaimWriteResult> {
    await this.assertBranch()
    if (!this.token) throw new ClaimStoreUnavailableError('Claim mutation requires GH_TOKEN or GITHUB_TOKEN')
    const path = claimPath(node)
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/${encodedPath(path)}`, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify({
        message: expectedSha ? `ACO: update ${node} lease` : `ACO: claim ${node}`,
        content: Buffer.from(serializeClaimRecord(record), 'utf8').toString('base64'),
        branch: claimsBranch,
        ...(expectedSha ? { sha: expectedSha } : {})
      })
    })
    const at = observedAt(response)
    if (response.status === 409 || response.status === 422) {
      throw new ClaimConflictError(`${node} lease CAS conflict (GitHub ${response.status})`)
    }
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot write ${path}: GitHub ${response.status}`)

    const value = (await response.json()) as { content?: { sha?: string } }
    const sha = value.content?.sha
    if (!sha) throw new ClaimStoreUnavailableError(`GitHub did not return a content SHA for ${path}`)
    return { stored: { record, sha }, observedAt: at }
  }

  async list(): Promise<{ claims: readonly StoredClaim[]; observedAt: Date }> {
    await this.assertBranch()
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/contents/${encodedPath(claimsDirectory)}?ref=${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers() }
    )
    const at = observedAt(response)
    if (response.status === 404) return { claims: [], observedAt: at }
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot list ${claimsDirectory}: GitHub ${response.status}`)

    const entries = (await response.json()) as GitHubContentFile[]
    const claims: StoredClaim[] = []
    for (const entry of entries) {
      if (entry.type !== 'file' || !entry.path.endsWith('.json')) continue
      const filename = entry.path.split('/').at(-1)!
      const node = filename.slice(0, -'.json'.length)
      const read = await this.read(node)
      if (!read.stored) throw new ClaimStoreUnavailableError(`Claim disappeared while listing: ${node}`)
      claims.push(read.stored)
    }
    return { claims, observedAt: at }
  }
}

function storeFor(command: string): GitHubClaimStore {
  const mutation = ['claim', 'renew', 'release', 'force'].includes(command)
  return new GitHubClaimStore(repositorySlug(), mutation ? tokenForMutation() : process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN)
}

function canonicalForMutation(input: string): string {
  try {
    return canonicalNodeId(input, controlNodes)
  } catch {
    if (/^[A-Z0-9][A-Z0-9-]*$/.test(input)) return input
    throw new Error(`Unknown or unsafe node id: ${input}`)
  }
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

async function status(store: GitHubClaimStore): Promise<void> {
  ensureControlViewMatchesMain()
  const listed = await store.list()
  const claims = new Map(listed.claims.map((claim) => [claim.record.node, claim.record]))
  const available: string[] = []
  const claimed: Array<{ node: string; structural: string; record: ClaimRecord; grace: boolean }> = []
  const handoff: string[] = []
  const invalid: Array<{ node: string; structural: string; record: ClaimRecord }> = []

  for (const node of controlNodes) {
    const state = operationalState(node, controlNodes, claims.get(node.id) ?? null, listed.observedAt)
    switch (state.occupancy) {
      case 'available':
        available.push(node.id)
        break
      case 'active-unclaimed':
        handoff.push(node.id)
        break
      case 'claimed':
      case 'claim-grace':
        claimed.push({ node: node.id, structural: state.structural, record: state.claim!, grace: state.occupancy === 'claim-grace' })
        break
      case 'invalid-live-claim':
        invalid.push({ node: node.id, structural: state.structural, record: state.claim! })
        break
      case 'not-claimable':
        break
    }
  }

  const known = new Set(controlNodes.map((node) => node.id))
  for (const record of claims.values()) {
    if (known.has(record.node)) continue
    const temporal = record.state === 'claimed' ? Date.parse(record.expiresAt) > listed.observedAt.getTime() : false
    if (temporal) invalid.push({ node: record.node, structural: 'unknown', record })
  }

  console.log('# Operational project control')
  console.log(`Observed: ${listed.observedAt.toISOString()} via GitHub`)
  console.log(`Available: ${available.length} | Claimed: ${claimed.length} | Active unclaimed: ${handoff.length} | Invalid live claims: ${invalid.length}`)

  console.log('\n## Available')
  for (const id of available) console.log(`- ${id}`)
  if (!available.length) console.log('- none')

  console.log('\n## Claimed')
  for (const item of claimed) {
    console.log(`- ${item.node} — ${item.record.holder.label ?? item.record.holder.kind}; ${item.grace ? 'expiry grace through' : 'expires'} ${item.record.expiresAt}${item.record.branch ? `; branch ${item.record.branch}` : ''}${item.record.pr ? `; PR #${item.record.pr}` : ''}`)
  }
  if (!claimed.length) console.log('- none')

  console.log('\n## Active / unclaimed handoff candidates')
  for (const id of handoff) console.log(`- ${id}`)
  if (!handoff.length) console.log('- none')

  if (invalid.length) {
    console.log('\n## Invalid live claims')
    for (const item of invalid) {
      console.log(`- ${item.node} — structural ${item.structural}; lease ${item.record.leaseId} generation ${item.record.generation}`)
    }
    process.exitCode = 2
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const store = storeFor(args.command)

  switch (args.command) {
    case 'status':
      await status(store)
      return
    case 'claim': {
      if (!args.node) throw new Error('claim requires NODE')
      ensureControlViewMatchesMain()
      const result = await acquireClaimFromStore(store, args.node, controlNodes, {
        holder: holder(args.flags),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        leaseId: args.flags.get('lease-id'),
        ...metadata(args.flags)
      })
      printWrite(result)
      return
    }
    case 'force': {
      if (!args.node) throw new Error('force requires NODE')
      ensureControlViewMatchesMain()
      const result = await forceAcquireClaimFromStore(store, args.node, controlNodes, {
        holder: holder(args.flags),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        leaseId: args.flags.get('lease-id'),
        reason: requiredFlag(args.flags, 'reason'),
        ...metadata(args.flags)
      })
      printWrite(result)
      return
    }
    case 'renew': {
      if (!args.node) throw new Error('renew requires NODE')
      const node = canonicalForMutation(args.node)
      const result = await renewClaimInStore(store, node, controlNodes, {
        leaseId: requiredFlag(args.flags, 'lease-id'),
        generation: optionalInt(args.flags, 'generation'),
        ttlMinutes: optionalInt(args.flags, 'ttl'),
        ...metadata(args.flags)
      })
      printWrite(result)
      return
    }
    case 'release': {
      if (!args.node) throw new Error('release requires NODE')
      const node = canonicalForMutation(args.node)
      const reason = requiredFlag(args.flags, 'reason')
      if (!['completed', 'handoff', 'abandoned', 'superseded', 'other'].includes(reason)) {
        throw new Error('--reason must be completed, handoff, abandoned, superseded or other')
      }
      const result = await releaseClaimInStore(store, node, controlNodes, {
        leaseId: requiredFlag(args.flags, 'lease-id'),
        generation: optionalInt(args.flags, 'generation'),
        reason: reason as NonNullable<ClaimRecord['releaseReason']>
      })
      printWrite(result)
      return
    }
    case 'show': {
      if (!args.node) throw new Error('show requires NODE')
      const node = canonicalForMutation(args.node)
      const read = await store.read(node)
      console.log(read.stored ? serializeClaimRecord(read.stored.record) : `${node}: no lease record`)
      return
    }
    default:
      throw new Error(`Unknown command ${args.command}. Use status, show, claim, renew, release or force.`)
  }
}

main().catch((error) => {
  if (error instanceof ClaimConflictError) {
    console.error(`CLAIM CONFLICT: ${error.message}`)
    process.exitCode = 3
    return
  }
  if (error instanceof ClaimStoreUnavailableError) {
    console.error(`CLAIM STORE UNAVAILABLE: ${error.message}`)
    process.exitCode = 4
    return
  }
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
