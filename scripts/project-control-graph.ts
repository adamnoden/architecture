import { execFileSync } from 'node:child_process'
import type { ClaimRecord } from '../project/control/claims.js'
import { GitHubClaimStore } from '../project/control/github-claim-store.js'
import { renderControlMermaid } from '../project/control/mermaid.js'
import { controlNodes } from '../project/control/nodes/index.js'

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

async function readLiveClaims(): Promise<{ claims: ReadonlyMap<string, ClaimRecord>; observedAt: Date }> {
  const store = new GitHubClaimStore(repositorySlug(), process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN)
  const snapshot = await store.list()
  return { claims: new Map(snapshot.claims.map(({ record }) => [record.node, record])), observedAt: snapshot.observedAt }
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
