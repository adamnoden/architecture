import { execFileSync } from 'node:child_process'
import { maturityEvidencePaths, workstreamStatuses } from './maturity.js'

/**
 * PCO-00–03 merge. This is the point from which maturity evidence is
 * deterministically monitored for content drift.
 *
 * It does not claim the evidence was independently revalidated at this commit;
 * it establishes the content baseline that future changes cannot silently cross.
 */
export const maturityEvidenceMonitoringBaseline = 'c3701c5f3985063dec77f8fdb83e6ea96b131f00'

export type MaturityEvidenceFreshness =
  | { state: 'fresh'; changedEvidence: readonly [] }
  | { state: 'stale'; changedEvidence: readonly string[] }
  | { state: 'unknown'; changedEvidence: readonly []; reason: string }

export const maturityAssessments = workstreamStatuses.map((assessment) => ({
  id: assessment.id,
  name: assessment.name,
  maturity: assessment.maturity,
  reviewedOn: assessment.reviewedOn,
  evidence: assessment.evidence
}))

function evidencePathsForAssessment(assessment: (typeof maturityAssessments)[number]): string[] {
  const paths = new Set<string>()
  for (const evidenceSet of Object.values(assessment.evidence) as readonly (readonly string[])[]) {
    for (const path of evidenceSet) paths.add(path)
  }
  return [...paths]
}

export function maturityFreshnessFromChangedPaths(
  changed: ReadonlySet<string>
): ReadonlyMap<string, MaturityEvidenceFreshness> {
  const result = new Map<string, MaturityEvidenceFreshness>()

  for (const assessment of maturityAssessments) {
    const changedForAssessment = evidencePathsForAssessment(assessment).filter((path) => changed.has(path))
    result.set(
      assessment.id,
      changedForAssessment.length
        ? { state: 'stale', changedEvidence: changedForAssessment }
        : { state: 'fresh', changedEvidence: [] }
    )
  }

  return result
}

function git(repoRoot: string, args: readonly string[]): string {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function changedEvidencePaths(repoRoot: string): Set<string> | null {
  try {
    git(repoRoot, ['cat-file', '-e', `${maturityEvidenceMonitoringBaseline}^{commit}`])
    execFileSync('git', ['merge-base', '--is-ancestor', maturityEvidenceMonitoringBaseline, 'HEAD'], {
      cwd: repoRoot,
      stdio: 'ignore'
    })
    const changed = git(repoRoot, [
      'diff',
      '--name-only',
      maturityEvidenceMonitoringBaseline,
      'HEAD',
      '--',
      ...maturityEvidencePaths()
    ])
    return new Set(changed ? changed.split('\n').filter(Boolean) : [])
  } catch {
    return null
  }
}

export function maturityFreshness(repoRoot: string): ReadonlyMap<string, MaturityEvidenceFreshness> {
  const changed = changedEvidencePaths(repoRoot)

  if (changed) return maturityFreshnessFromChangedPaths(changed)

  return new Map(
    maturityAssessments.map((assessment) => [
      assessment.id,
      {
        state: 'unknown',
        changedEvidence: [],
        reason: 'PCO evidence-monitoring baseline is unavailable in this Git checkout'
      } satisfies MaturityEvidenceFreshness
    ])
  )
}

export function staleMaturityAssessments(repoRoot: string): Array<{
  id: string
  name: string
  changedEvidence: readonly string[]
}> {
  const freshness = maturityFreshness(repoRoot)
  return maturityAssessments.flatMap((assessment) => {
    const status = freshness.get(assessment.id)
    return status?.state === 'stale'
      ? [{ id: assessment.id, name: assessment.name, changedEvidence: status.changedEvidence }]
      : []
  })
}
