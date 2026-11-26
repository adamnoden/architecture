import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { auditSourceCoverage } from '../../ccr/studies/source-coverage.ts'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const accountPath = resolve(root, 'project/ccr/studies/source-coverage.json')
const output = resolve(process.env.MIGRATION_INVENTORY_DIR ?? 'current-source-migration-evidence')
mkdirSync(output, { recursive: true })
const bytes = readFileSync(accountPath)
const account = JSON.parse(bytes)
const replacements = {
  'project/str/studies/distributed_floor_compatibility.py': '7a8eb302813e8a509a1fac16ee29e7359d2c0bf9',
  'project/str/studies/perforated_floor_condensation.py': 'fbdea8993c4c00d863f2105c0a83f6ac0bf78c03',
}
const hash = b => createHash('sha256').update(b).digest('hex')
const blob = b => createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex')
const baseline = auditSourceCoverage()
const changedBindings = []
try {
  for (const [path, expected] of Object.entries(replacements)) {
    assert.ok(Object.hasOwn(account.gitBlobs, path), path)
    const observed = blob(readFileSync(resolve(root, path)))
    assert.equal(observed, expected, path)
    changedBindings.push({ path, before: account.gitBlobs[path], after: observed })
    account.gitBlobs[path] = observed
  }
  const expectedAccount = JSON.parse(bytes)
  for (const change of changedBindings) expectedAccount.gitBlobs[change.path] = change.after
  assert.deepEqual(account, expectedAccount)
  writeFileSync(accountPath, JSON.stringify(account, null, 2) + '\n')
  const refreshedBytes = readFileSync(accountPath)
  const audit = auditSourceCoverage()
  const group = key => {
    const groups = {}
    for (const finding of audit.findings) {
      const value = finding[key] ?? (key === 'source' ? finding.path : undefined) ?? '(no ' + key + ')'
      ;(groups[value] ??= []).push(finding)
    }
    return groups
  }
  const summary = {
    authority: 'Read-only migration inventory; workcopy account bindings only; no receipt replay or design admission',
    sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    auditMethodGitBlob: blob(readFileSync(resolve(root, 'project/ccr/studies/source-coverage.ts'))),
    accountGitBlobBefore: blob(bytes), accountSHA256Before: hash(bytes),
    accountSHA256DuringWorkcopy: hash(refreshedBytes),
    changedBindings, receiptEdgesChanged: false, historicalReceiptsChanged: false,
    baselineFindings: baseline.findings,
    findings: audit.findings,
    byReceipt: group('receipt'), bySource: group('source'),
    kindCounts: Object.fromEntries([...new Set(audit.findings.map(f => f.kind))].sort().map(kind => [kind, audit.findings.filter(f => f.kind === kind).length])),
    fullAuditFile: 'source-coverage-workcopy-audit.json',
  }
  writeFileSync(resolve(output, 'source-coverage-workcopy-audit.json'), JSON.stringify(audit, null, 2) + '\n')
  writeFileSync(resolve(output, 'source-coverage-migration-inventory.json'), JSON.stringify(summary, null, 2) + '\n')
  console.log('MIGRATION_INVENTORY_JSON ' + JSON.stringify(summary))
} finally {
  writeFileSync(accountPath, bytes)
  assert.deepEqual(readFileSync(accountPath), bytes)
}
const changed = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' }).trim()
assert.equal(changed, '', 'tracked checkout must be restored')
console.log('ACCOUNT_RESTORED_EXACTLY true')
