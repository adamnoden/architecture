import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import {
  maturityAssessments, maturityFreshness, maturityFreshnessFromChangedPaths,
  maturitySubjectFreshness, maturitySubjectFreshnessFromChangedPaths, maturityWatchMessages
} from '../maturity-freshness.js'
import { maturitySubjectBindings } from '../maturity-subjects.js'
import { renderEpistemicMaturityBlock } from './render.js'

const layoutPath = 'compiler/reference-house/georgian/layout-revision.ts'
const referenceSources = maturitySubjectBindings['reference-house'].controllingSources
const git = (root: string, ...args: string[]): string => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
}).trim()
function fixture(omit?: string) {
  const root = mkdtempSync(join(tmpdir(), 'pco-applicability-'))
  git(root, 'init', '-q')
  for (const path of referenceSources.filter((path) => path !== omit)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), 'baseline subject content\n')
  }
  git(root, 'add', '.')
  git(root, '-c', 'user.name=PCO Test', '-c', 'user.email=pco-test@example.invalid', 'commit', '-qm', 'subject baseline')
  return { root, baseline: git(root, 'rev-parse', 'HEAD') }
}

test('layout-only audit probe separates unchanged evidence from required subject reassessment', () => {
  const changed = new Set([layoutPath])
  const evidence = maturityFreshnessFromChangedPaths(changed)
  const subjects = maturitySubjectFreshnessFromChangedPaths(changed)
  for (const id of ['reference-house', 'computational-track']) {
    assert.equal(evidence.get(id)?.state, 'fresh')
    assert.deepEqual(subjects.get(id), { state: 'reassessment-required', changedSources: [layoutPath] })
  }
  assert.equal(subjects.get('pattern-language')?.state, 'unchanged')
  assert.equal(maturityAssessments.find(({ id }) => id === 'reference-house')?.maturity, 'M3')
  assert.equal(maturityAssessments.find(({ id }) => id === 'computational-track')?.maturity, 'M4')
})

test('implementation/provenance changes require computational reassessment without geometry edits', () => {
  const path = 'compiler/rhc5/method.ts'
  const result = maturitySubjectFreshnessFromChangedPaths(new Set([path]))
  assert.deepEqual(result.get('computational-track'), { state: 'reassessment-required', changedSources: [path] })
  assert.equal(result.get('pattern-language')?.state, 'unchanged')
  assert.equal(result.get('reference-house')?.state, 'unchanged')
})

test('review prose and unrelated edits retain distinct, scoped consequences', () => {
  const evidencePath = 'docs/reference-house/whole-house-coordination-audit.md'
  assert.equal(maturityFreshnessFromChangedPaths(new Set([evidencePath])).get('reference-house')?.state, 'stale')
  assert.equal(maturitySubjectFreshnessFromChangedPaths(new Set([evidencePath])).get('reference-house')?.state, 'unchanged')
  for (const state of maturitySubjectFreshnessFromChangedPaths(new Set(['unrelated-notes.md'])).values()) {
    assert.equal(state.state, 'unchanged')
  }
  // Prefix matching must not mistake a similarly named sibling for the owning directory.
  assert.equal(maturitySubjectFreshnessFromChangedPaths(new Set(['compiler/rhc5-copy/method.ts'])).get('computational-track')?.state, 'unchanged')
})

test('real Git baseline detects tracked working design edits and preserves unchanged control', () => {
  const { root, baseline } = fixture()
  try {
    assert.equal(maturitySubjectFreshness(root, baseline).get('reference-house')?.state, 'unchanged')
    writeFileSync(join(root, layoutPath), 'material layout change without review-prose change\n')
    assert.deepEqual(maturitySubjectFreshness(root, baseline).get('reference-house'), {
      state: 'reassessment-required', changedSources: [layoutPath]
    })
    writeFileSync(join(root, layoutPath), 'baseline subject content\n')
    writeFileSync(join(root, 'unrelated-notes.md'), 'unrelated\n')
    assert.equal(maturitySubjectFreshness(root, baseline).get('reference-house')?.state, 'unchanged')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('missing baseline and missing named baseline source are unknown, never unchanged', () => {
  const { root, baseline } = fixture(layoutPath)
  try {
    assert.equal(maturitySubjectFreshness(root, baseline).get('reference-house')?.state, 'unknown')
    assert.equal(maturitySubjectFreshness(root, '0000000000000000000000000000000000000000').get('reference-house')?.state, 'unknown')
    assert.equal(maturityFreshness(root, '0000000000000000000000000000000000000000').get('reference-house')?.state, 'unknown')
    const messages = maturityWatchMessages(root).join('\n')
    assert.match(messages, /evidence UNKNOWN/)
    assert.match(messages, /subject applicability UNKNOWN/)
    assert.doesNotMatch(messages, /no monitored evidence has changed/)
    const rendered = renderEpistemicMaturityBlock(root)
    assert.match(rendered, /\*\*UNKNOWN\*\*/)
    assert.match(rendered, /Historical subject only/)
    assert.match(rendered, /not a retrospective maturity assessment/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('unreadable repository and non-ancestor baseline cannot masquerade as fresh', () => {
  const { root, baseline } = fixture()
  try {
    assert.equal(maturitySubjectFreshness(join(root, 'absent'), baseline).get('reference-house')?.state, 'unknown')
    git(root, 'checkout', '--orphan', 'other-history')
    git(root, '-c', 'user.name=PCO Test', '-c', 'user.email=pco-test@example.invalid', 'commit', '-qm', 'unrelated history')
    assert.equal(maturitySubjectFreshness(root, baseline).get('reference-house')?.state, 'unknown')
    assert.equal(maturityFreshness(root, baseline).get('reference-house')?.state, 'unknown')
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('all existing assessments have explicit named scopes and unchanged-source limits', () => {
  assert.equal(maturityAssessments.length, Object.keys(maturitySubjectBindings).length)
  for (const assessment of maturityAssessments) {
    assert.ok(assessment.subject.assessedSubject.trim())
    assert.ok(assessment.subject.assessedSubject.includes(assessment.reviewedOn), 'new review needs an explicit subject binding update')
    assert.ok(assessment.subject.controllingSources.length)
    assert.ok(assessment.subject.applicabilityLimit.trim())
  }
  assert.match(maturitySubjectBindings['reference-house'].applicabilityLimit, /not established/)
  assert.match(maturitySubjectBindings['deployment-real-site'].applicabilityLimit, /no empirical compatibility/)
})
