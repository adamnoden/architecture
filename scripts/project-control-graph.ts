import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import {
  claimsBranch,
  claimsDirectory,
  parseClaimRecord,
  type ClaimRecord
} from '../project/control/claims.js'
import { renderControlMermaid } from '../project/control/mermaid.js'
import { controlNodes } from '../project/control/nodes/index.js'

interface GitHubContentFile {
  type: 'file'
  path: string
  sha: string
  content?: string
  encoding?: string
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

function ensureLiveControlViewMatchesMain(): void {
  git(['fetch', 'origin', 'main', '--quiet'])
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { stdio: 'ignore' })
  } catch {
    throw new Error('Local checkout does not contain current origin/main; reconcile before rendering live occupancy')
  }

  const changed = git([
    'diff', '--name-only', 'origin/main...HEAD', '--',
    'project/control/nodes',
    'project/control/types.ts',
    'project/control/workstreams.ts',
    'project/control/derive.ts'
  ])
  if (changed) {
    throw new Error(
      `Local branch changes PCO structural state (${changed.split('\n').join(', ')}); render live occupancy from a checkout whose control graph matches current main`
    )
  }
}

function headers(): Record<string, string> {
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

function encodedPath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

function responseTime(response: Response): Date {
  const value = response.headers.get('date')
  const parsed = value ? new Date(value) : new Date()
  return Number.isFinite(parsed.getTime()) ? parsed : new Date()
}

async function readLiveClaims(): Promise<{ claims: ReadonlyMap<string, ClaimRecord>; observedAt: Date }> {
  const repo = repositorySlug()
  const base = `https://api.github.com/repos/${repo}/contents/${encodedPath(claimsDirectory)}`
  const listing = await fetch(`${base}?ref=${encodeURIComponent(claimsBranch)}`, { headers: headers() })
  if (!listing.ok) {
    throw new Error(`Cannot read ACO lease store ${claimsBranch}:${claimsDirectory} (GitHub ${listing.status})`)
  }

  let observedAt = responseTime(listing)
  const entries = (await listing.json()) as GitHubContentFile[]
  const claims = new Map<string, ClaimRecord>()

  for (const entry of entries) {
    if (entry.type !== 'file' || !entry.path.endsWith('.json')) continue
    const response = await fetch(
      `https://api.github.com/repos/${repo}/contents/${encodedPath(entry.path)}?ref=${encodeURIComponent(claimsBranch)}`,
      { headers: headers() }
    )
    if (!response.ok) throw new Error(`Cannot read ACO lease ${entry.path} (GitHub ${response.status})`)
    observedAt = responseTime(response)
    const file = (await response.json()) as GitHubContentFile
    if (!file.content || file.encoding !== 'base64') throw new Error(`Unexpected ACO lease response for ${entry.path}`)
    const raw = Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8')
    const expectedNode = entry.path.split('/').at(-1)!.replace(/\.json$/, '')
    const claim = parseClaimRecord(raw, expectedNode)
    claims.set(claim.node, claim)
  }

  return { claims, observedAt }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2))
  const live = args.has('--live')
  const includeDone = args.has('--all')
  const direction = args.has('--tb') ? 'TB' : 'LR'

  if (!live) {
    process.stdout.write(renderControlMermaid(controlNodes, { includeDone, direction }))
    return
  }

  ensureLiveControlViewMatchesMain()
  const snapshot = await readLiveClaims()
  process.stdout.write(
    renderControlMermaid(controlNodes, {
      includeDone,
      direction,
      claims: snapshot.claims,
      observedAt: snapshot.observedAt
    })
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
