import type { VerifiedLease } from './claim-store.js'
import { assertPublicationLease } from './lease-health.js'

interface PublicationTarget {
  repository: string
  branch: string
  head: string
  leaseId: string
  generation: number
}

/** Read-only observations. A successful return is not CI evidence or an atomic merge fence. */
export async function publicationPreflight(target: PublicationTarget, dependencies: {
  git: (args: readonly string[]) => string
  verify: () => Promise<VerifiedLease>
}) {
  const { git, verify } = dependencies
  if (!/^[a-f0-9]{40}$/.test(target.head)) throw new Error('--head must be a full commit SHA')
  if (!Number.isInteger(target.generation) || target.generation < 1) throw new Error('Invalid generation')
  await verify()
  if (git(['status', '--porcelain', '--untracked-files=no'])) throw new Error('Publication requires a clean tracked working tree matching the validated head')
  git(['check-ref-format', '--branch', target.branch])
  git(['fetch', 'origin', 'main', target.branch, '--quiet'])
  if (git(['rev-parse', `origin/${target.branch}`]) !== target.head || git(['rev-parse', 'HEAD']) !== target.head) throw new Error('Validated local/remote head mismatch')
  // Use the same immutable main identity for ancestry checking and the report.
  // A parallel fetch may otherwise change the shared remote-tracking ref between them.
  const main = git(['rev-parse', 'origin/main'])
  git(['merge-base', '--is-ancestor', main, target.head])
  const verified = await verify()
  assertPublicationLease(verified.stored.record, verified.observedAt, target)
  return {
    node: verified.stored.record.node,
    generation: verified.stored.record.generation,
    leaseId: verified.stored.record.leaseId,
    temporal: verified.temporal,
    observedAt: verified.observedAt.toISOString(),
    expiresAt: verified.stored.record.expiresAt,
    publication: {
      repository: target.repository, branch: target.branch, head: target.head, main,
      claimSha: verified.stored.sha,
      ci: 'not-checked' as const,
      atomicFence: false as const
    }
  }
}

export function renderPublicationReport(result: Awaited<ReturnType<typeof publicationPreflight>>): string {
  const line = (value: string) => value.replace(/[\r\n]/g, ' ')
  return [
    `REPORT · ${line(result.node)} · merge preflight checks passed`,
    `Observed: ${result.observedAt}; lease expires: ${result.expiresAt}.`,
    `Ownership: ${line(result.leaseId)} / generation ${result.generation}; ${result.temporal}.`,
    `Target: ${line(result.publication.repository)} / ${line(result.publication.branch)}.`,
    `Head: ${result.publication.head}; observed main: ${result.publication.main}.`,
    `Lease evidence: ${result.publication.claimSha}.`,
    'Boundary: CI not checked; cooperative preflight, not an atomic merge fence. Recheck after a delay or relevant change.'
  ].join('\n')
}
