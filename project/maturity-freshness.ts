import { execFileSync } from 'node:child_process'
import { maturityEvidencePaths, workstreamStatuses } from './maturity.js'
import { maturitySubjectBindings, maturitySubjectMonitoringBaseline } from './maturity-subjects.js'

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
  evidence: assessment.evidence,
  subject: maturitySubjectBindings[assessment.id]
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

interface MonitoredChanges {
  changed: ReadonlySet<string>
  baselinePaths: ReadonlySet<string>
}

function monitoredChanges(repoRoot: string, baseline: string, paths: readonly string[]): MonitoredChanges | null {
  try {
    git(repoRoot, ['cat-file', '-e', `${baseline}^{commit}`])
    execFileSync('git', ['merge-base', '--is-ancestor', baseline, 'HEAD'], {
      cwd: repoRoot,
      stdio: 'ignore'
    })
    // Compare tracked working content as well as committed changes. A local
    // design edit must not look unchanged merely because it is not committed.
    const changed = git(repoRoot, ['diff', '--name-only', baseline, '--', ...paths])
    const baselinePaths = git(repoRoot, ['ls-tree', '-r', '--name-only', baseline])
    return {
      changed: new Set(changed ? changed.split('\n') : []),
      baselinePaths: new Set(baselinePaths ? baselinePaths.split('\n') : [])
    }
  } catch {
    return null
  }
}

export function maturityFreshness(
  repoRoot: string,
  baseline = maturityEvidenceMonitoringBaseline
): ReadonlyMap<string, MaturityEvidenceFreshness> {
  const changes = monitoredChanges(repoRoot, baseline, maturityEvidencePaths())
  if (changes) return maturityFreshnessFromChangedPaths(changes.changed)
  return new Map(maturityAssessments.map((assessment) => [assessment.id, {
    state: 'unknown', changedEvidence: [],
    reason: 'PCO evidence-monitoring baseline is unavailable, unreadable or not an ancestor in this Git checkout'
  } satisfies MaturityEvidenceFreshness]))
}

export type MaturitySubjectFreshness =
  | { state: 'unchanged'; changedSources: readonly [] }
  | { state: 'reassessment-required'; changedSources: readonly string[] }
  | { state: 'unknown'; changedSources: readonly []; reason: string }

const matchesSource = (path: string, source: string): boolean => path === source || path.startsWith(`${source}/`)

export function maturitySubjectFreshnessFromChangedPaths(
  changed: ReadonlySet<string>
): ReadonlyMap<string, MaturitySubjectFreshness> {
  return new Map(maturityAssessments.map((assessment) => {
    const changedSources = [...changed].filter((path) =>
      assessment.subject.controllingSources.some((source) => matchesSource(path, source))
    ).sort()
    return [assessment.id, changedSources.length
      ? { state: 'reassessment-required', changedSources }
      : { state: 'unchanged', changedSources: [] }]
  }))
}

export function maturitySubjectFreshness(
  repoRoot: string,
  baseline = maturitySubjectMonitoringBaseline
): ReadonlyMap<string, MaturitySubjectFreshness> {
  const paths = [...new Set(maturityAssessments.flatMap((assessment) => [...assessment.subject.controllingSources]))]
  const changes = monitoredChanges(repoRoot, baseline, paths)
  const result = new Map(maturitySubjectFreshnessFromChangedPaths(changes?.changed ?? new Set()))
  for (const assessment of maturityAssessments) {
    const missing = changes ? assessment.subject.controllingSources.filter((source) =>
      ![...changes.baselinePaths].some((path) => matchesSource(path, source))
    ) : []
    if (changes && !missing.length) continue
    result.set(assessment.id, {
      state: 'unknown', changedSources: [],
      reason: changes
        ? `Named controlling source absent from inspection baseline: ${missing.join(', ')}`
        : 'PCO subject-inspection baseline is unavailable, unreadable or not an ancestor in this Git checkout'
    })
  }
  return result
}

/** Human/CLI report keeps unknown separate from no changes and from M-level judgement. */
export function maturityWatchMessages(repoRoot: string): string[] {
  const evidence = maturityFreshness(repoRoot)
  const subjects = maturitySubjectFreshness(repoRoot)
  return maturityAssessments.map((assessment) => {
    const e = evidence.get(assessment.id)!
    const s = subjects.get(assessment.id)!
    const evidenceMessage = e.state === 'stale' ? `evidence reassessment required: ${e.changedEvidence.join(', ')}`
      : e.state === 'unknown' ? `evidence UNKNOWN: ${e.reason}` : 'evidence content unchanged against its baseline'
    const subjectMessage = s.state === 'reassessment-required' ? `subject applicability reassessment required: ${s.changedSources.join(', ')}`
      : s.state === 'unknown' ? `subject applicability UNKNOWN: ${s.reason}` : 'monitored subject sources unchanged; applicability is not automatically established'
    return `${assessment.name} (${assessment.maturity} unchanged): ${evidenceMessage}; ${subjectMessage}. ${assessment.subject.applicabilityLimit}`
  })
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
