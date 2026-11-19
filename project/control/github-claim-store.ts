import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { ClaimConflictError, ClaimStoreUnavailableError, storedClaimFromRaw, type ClaimStore, type StoredClaim, type ClaimWriteResult } from './claim-store.js'
import { claimPath, claimsBranch, claimsDirectory, serializeClaimRecord, type ClaimRecord } from './claims.js'

interface GitHubContentFile {
  type: 'file'
  path: string
  sha: string
  content?: string
  encoding?: string
}

const claimReadConcurrency = 8
const contentsDirectoryLimit = 1000
const gitSha = /^[a-f0-9]{40}$/

function observedAt(response: Response): Date {
  const serverDate = response.headers.get('date')
  const parsed = serverDate ? new Date(serverDate) : new Date()
  return Number.isFinite(parsed.getTime()) ? parsed : new Date()
}

function encodedPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

async function readJson(response: Response, subject: string): Promise<unknown> {
  try {
    return await response.json()
  } catch (error) {
    throw new ClaimStoreUnavailableError(`Malformed GitHub JSON for ${subject}: ${String(error)}`)
  }
}

export class GitHubClaimStore implements ClaimStore {
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

  private async branchSnapshot(): Promise<{ sha: string; observedAt: Date }> {
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/branches/${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers(), signal: AbortSignal.timeout(20000) }
    )
    if (!response.ok) {
      throw new ClaimStoreUnavailableError(
        response.status === 404
          ? `ACO runtime branch ${claimsBranch} does not exist`
          : `Cannot read ACO runtime branch ${claimsBranch}: GitHub ${response.status}`
      )
    }
    const value = (await readJson(response, claimsBranch)) as { commit?: { sha?: unknown } } | null
    const sha = value?.commit?.sha
    if (typeof sha !== 'string' || !gitSha.test(sha)) {
      throw new ClaimStoreUnavailableError(`Malformed ACO runtime branch ${claimsBranch} identity`)
    }
    this.branchChecked = true
    return { sha, observedAt: observedAt(response) }
  }

  private async assertBranch(): Promise<void> {
    if (!this.branchChecked) await this.branchSnapshot()
  }

  async read(node: string) {
    await this.assertBranch()
    const path = claimPath(node)
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/contents/${encodedPath(path)}?ref=${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers(), signal: AbortSignal.timeout(20000) }
    )
    const at = observedAt(response)
    if (response.status === 404) return { stored: null, observedAt: at }
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot read ${path}: GitHub ${response.status}`)

    const value = (await response.json()) as GitHubContentFile
    if (value.type !== 'file' || !value.content || value.encoding !== 'base64') {
      throw new ClaimStoreUnavailableError(`Unexpected GitHub contents response for ${path}`)
    }

    try {
      const raw = Buffer.from(value.content.replace(/\n/g, ''), 'base64').toString('utf8')
      return { stored: storedClaimFromRaw(raw, value.sha, node), observedAt: at }
    } catch (error) {
      throw new ClaimStoreUnavailableError(
        `Malformed lease record ${path}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  async create(node: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    return this.write(node, record)
  }

  async update(node: string, expectedSha: string, record: ClaimRecord): Promise<ClaimWriteResult> {
    return this.write(node, record, expectedSha)
  }

  private async write(node: string, record: ClaimRecord, expectedSha?: string): Promise<ClaimWriteResult> {
    await this.assertBranch()
    if (!this.token) throw new ClaimStoreUnavailableError('Claim mutation requires GH_TOKEN or GITHUB_TOKEN')
    const path = claimPath(node)
    const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/${encodedPath(path)}`, {
      signal: AbortSignal.timeout(20000),
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
    // Capture the entry set and every blob from one immutable revision. A later
    // acquisition still re-reads its selected node before exact per-file CAS.
    const snapshot = await this.branchSnapshot()
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/contents/${encodedPath(claimsDirectory)}?ref=${snapshot.sha}`,
      { headers: this.headers(), signal: AbortSignal.timeout(20000) }
    )
    if (response.status === 404) return { claims: [], observedAt: snapshot.observedAt }
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot list ${claimsDirectory}: GitHub ${response.status}`)

    const listing = await readJson(response, claimsDirectory)
    if (!Array.isArray(listing) || listing.length >= contentsDirectoryLimit) {
      throw new ClaimStoreUnavailableError('Claim directory listing is malformed or may exceed the GitHub 1,000-entry limit')
    }
    const entries: GitHubContentFile[] = []
    const seen = new Set<string>()
    for (const entry of listing) {
      if (!entry || typeof entry.path !== 'string') throw new ClaimStoreUnavailableError('Malformed claim directory entry')
      if (!entry.path.endsWith('.json')) continue
      const node = entry.path.slice(claimsDirectory.length + 1, -'.json'.length)
      if (entry.type !== 'file' || !/^[A-Z0-9][A-Z0-9-]*$/.test(node) ||
          entry.path !== claimPath(node) || typeof entry.sha !== 'string' || !gitSha.test(entry.sha) || seen.has(node)) {
        throw new ClaimStoreUnavailableError(`Malformed or duplicate claim directory entry: ${entry.path}`)
      }
      seen.add(node)
      entries.push(entry)
    }
    const claims = new Array<StoredClaim>(entries.length)
    let next = 0
    let failed = false
    await Promise.all(Array.from({ length: Math.min(claimReadConcurrency, entries.length) }, async () => {
      while (!failed && next < entries.length) {
        const index = next++
        try {
          claims[index] = await this.readBlob(entries[index])
        } catch (error) {
          failed = true
          throw error
        }
      }
    }))
    return { claims, observedAt: snapshot.observedAt }
  }

  private async readBlob(entry: GitHubContentFile): Promise<StoredClaim> {
    const response = await fetch(`https://api.github.com/repos/${this.repo}/git/blobs/${entry.sha}`, {
      headers: this.headers(), signal: AbortSignal.timeout(20000)
    })
    if (!response.ok) throw new ClaimStoreUnavailableError(`Cannot read ${entry.path} at ${entry.sha}: GitHub ${response.status}`)
    try {
      const value = (await response.json()) as { sha?: unknown; encoding?: unknown; content?: unknown }
      if (value.sha !== entry.sha || value.encoding !== 'base64' || typeof value.content !== 'string') {
        throw new Error('Unexpected GitHub blob response')
      }
      const bytes = Buffer.from(value.content.replace(/\n/g, ''), 'base64')
      const sha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
      if (sha !== entry.sha) throw new Error('Claim content does not match its pinned blob SHA')
      const raw = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      const node = entry.path.slice(claimsDirectory.length + 1, -'.json'.length)
      return storedClaimFromRaw(raw, sha, node)
    } catch (error) {
      throw new ClaimStoreUnavailableError(`Malformed lease blob ${entry.path}: ${String(error)}`)
    }
  }
}

