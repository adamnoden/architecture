import { createHash, randomUUID } from 'node:crypto'
import { runGit } from './git-command.js'
import { existsSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { ClaimConflictError, ClaimStoreUnavailableError, storedClaimFromRaw, type ClaimStore, type StoredClaim, type ClaimWriteResult } from './claim-store.js'
import { claimPath, claimsBranch, claimsDirectory, serializeClaimRecord, type ClaimRecord } from './claims.js'

export interface ClaimGitSnapshot {
  observedAt: Date
  files: readonly { path: string; sha: string; content: string }[]
}
export interface ConnectorWriteRequest {
  schemaVersion: 1
  requestId: string
  repository: string
  branch: typeof claimsBranch
  operation: 'create' | 'update'
  path: string
  expectedSha?: string
  content: string
  message: string
}
export interface ConnectorWriteReply {
  schemaVersion: 1
  requestId: string
  outcome: 'written' | 'conflict' | 'unavailable'
  contentSha?: string
  detail?: string
}
export type ConnectorExchange = (request: ConnectorWriteRequest) => Promise<ConnectorWriteReply>
export function gitBlobSha(content: string): string {
  const bytes = Buffer.from(content)
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
}
function safeFiles(snapshot: ClaimGitSnapshot): StoredClaim[] {
  if (!Number.isFinite(snapshot.observedAt.getTime())) throw new ClaimStoreUnavailableError('Invalid snapshot observation time')
  const seen = new Set<string>()
  return snapshot.files.map(file => {
    const node = file.path.slice(claimsDirectory.length + 1, -5)
    if (file.path !== claimPath(node) || seen.has(node) || !/^[a-f0-9]{40}$/.test(file.sha) || gitBlobSha(file.content) !== file.sha) throw new ClaimStoreUnavailableError('Malformed or duplicate claim snapshot file')
    seen.add(node)
    try { return storedClaimFromRaw(file.content, file.sha, node) } catch (e) { throw new ClaimStoreUnavailableError(`Malformed ${file.path}: ${String(e)}`) }
  })
}
/** Same canonical lease/store protocol; only the authenticated write transport differs. */
export class GitConnectorClaimStore implements ClaimStore {
  constructor(private readonly repository: string, private readonly snapshot: () => Promise<ClaimGitSnapshot>, private readonly exchange?: ConnectorExchange) {
    if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid repository')
  }
  async list() {
    const snapshot = await this.snapshot()
    return { claims: safeFiles(snapshot), observedAt: snapshot.observedAt }
  }
  async read(node: string) {
    claimPath(node)
    const listed = await this.list()
    return { stored: listed.claims.find(c => c.record.node === node) ?? null, observedAt: listed.observedAt }
  }
  create(node: string, record: ClaimRecord) { return this.write(node, record) }
  update(node: string, expectedSha: string, record: ClaimRecord) { return this.write(node, record, expectedSha) }
  private async write(node: string, record: ClaimRecord, expectedSha?: string): Promise<ClaimWriteResult> {
    if (!this.exchange) throw new ClaimStoreUnavailableError('Connector mutation needs --bridge-dir outside the repository')
    if (record.node !== node) throw new ClaimStoreUnavailableError('Lease node mismatch')
    const request: ConnectorWriteRequest = {
      schemaVersion: 1, requestId: randomUUID(), repository: this.repository, branch: claimsBranch,
      operation: expectedSha ? 'update' : 'create', path: claimPath(node),
      ...(expectedSha ? { expectedSha } : {}), content: serializeClaimRecord(record), message: `ACO: ${expectedSha ? 'update' : 'claim'} ${node} lease`
    }
    const reply = await this.exchange(request)
    if (reply.schemaVersion !== 1 || reply.requestId !== request.requestId) throw new ClaimStoreUnavailableError('Mismatched connector reply')
    if (reply.outcome === 'conflict') throw new ClaimConflictError(reply.detail ?? 'Connector CAS conflict')
    if (reply.outcome !== 'written' || reply.contentSha !== gitBlobSha(request.content)) throw new ClaimStoreUnavailableError(reply.detail ?? 'Connector did not confirm the intended blob')
    // A tool returning successfully is insufficient: re-fetch and prove actual stored content.
    const after = await this.read(node)
    if (!after.stored || after.stored.sha !== reply.contentSha || serializeClaimRecord(after.stored.record) !== request.content) throw new ClaimStoreUnavailableError('Connector write not verified in fresh remote snapshot; reconcile before retrying')
    return { stored: after.stored, observedAt: after.observedAt }
  }
}
export function readGitClaimSnapshot(repoRoot: string): ClaimGitSnapshot {
  const git = (args: string[]) => runGit(args, { cwd: repoRoot, maxBuffer: 4 * 1024 * 1024 }).trim()
  try {
    // FETCH_HEAD is shared mutable state: an overlapping main fetch can replace it.
    git(['fetch','--no-write-fetch-head','origin',`refs/heads/${claimsBranch}:refs/remotes/origin/${claimsBranch}`,'--quiet'])
    const ref = git(['rev-parse',`refs/remotes/origin/${claimsBranch}`])
    if (!/^[a-f0-9]{40}$/.test(ref)) throw new Error('Unsupported Git object identity')
    const entries = git(['ls-tree','-r',ref,'--',claimsDirectory])
    // Git commit times are not server clock readings. Match the native client's explicit local-clock fallback.
    const observedAt = new Date()
    const files = entries.split('\n').filter(Boolean).filter(line => line.endsWith('.json')).map(line => {
      const match = line.match(/^100644 blob ([a-f0-9]{40})\t(.+)$/)
      if (!match) throw new Error('Unsupported claim tree entry')
      const [,sha,path] = match
      const content = runGit(['show',`${ref}:${path}`],{cwd:repoRoot,maxBuffer:1024*1024})
      return {path,sha,content}
    })
    return { observedAt, files }
  } catch (e) { throw new ClaimStoreUnavailableError(`Cannot refresh runtime claims through Git: ${String(e)}`) }
}
/** A private, bounded mailbox to an agent's already-authorised GitHub connector. No token or HTTP monkey-patch. */
export function connectorMailbox(repoRoot: string, directory: string, timeoutMs = 120000): ConnectorExchange {
  if (!isAbsolute(directory)) throw new Error('--bridge-dir must be absolute')
  const root = realpathSync(repoRoot), dir = realpathSync(directory), rel = relative(root, dir)
  if (!(rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel))) throw new Error('--bridge-dir must be outside the repository')
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) throw new Error('Invalid connector timeout')
  return async request => {
    const prefix = join(dir, request.requestId), responsePath = `${prefix}.response.json`
    writeFileSync(`${prefix}.request.tmp`, JSON.stringify(request, null, 2)+'\n', {mode:0o600,flag:'wx'})
    renameSync(`${prefix}.request.tmp`,`${prefix}.request.json`)
    process.stderr.write(`ACO_CONNECTOR_REQUEST ${prefix}.request.json\n`)
    const until = Date.now() + timeoutMs
    while (Date.now() < until) {
      if (existsSync(responsePath)) {
        try { return JSON.parse(readFileSync(responsePath,'utf8')) as ConnectorWriteReply } catch { throw new ClaimStoreUnavailableError('Malformed connector reply; reconcile remote state before retrying') }
      }
      await delay(Math.min(250, Math.max(0, until-Date.now())))
    }
    throw new ClaimStoreUnavailableError(`Connector response timeout for ${request.requestId}; remote outcome unknown. Reconcile this exact lease before retrying; retain mailbox until reconciled.`)
  }
}
