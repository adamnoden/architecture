import { Buffer } from 'node:buffer'
import { ClaimConflictError, ClaimStoreUnavailableError, storedClaimFromRaw, type ClaimStore, type StoredClaim, type ClaimWriteResult } from './claim-store.js'
import { claimPath, claimsBranch, claimsDirectory, serializeClaimRecord, type ClaimRecord } from './claims.js'

interface GitHubContentFile {
  type: 'file'
  path: string
  sha: string
  content?: string
  encoding?: string
}

function observedAt(response: Response): Date {
  const serverDate = response.headers.get('date')
  const parsed = serverDate ? new Date(serverDate) : new Date()
  return Number.isFinite(parsed.getTime()) ? parsed : new Date()
}

function encodedPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
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

  private async assertBranch(): Promise<void> {
    if (this.branchChecked) return
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
    this.branchChecked = true
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
    await this.assertBranch()
    const response = await fetch(
      `https://api.github.com/repos/${this.repo}/contents/${encodedPath(claimsDirectory)}?ref=${encodeURIComponent(claimsBranch)}`,
      { headers: this.headers(), signal: AbortSignal.timeout(20000) }
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

