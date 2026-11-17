import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { auditSourceCoverage } from './source-coverage.ts'
import { deriveWaterReplan } from '../../had/studies/water-replan.mjs'

const root = new URL('../../../', import.meta.url)
const read = path => readFileSync(new URL(path, root))
const rwtSource = 'project/rwt/studies/selected-receiving-interface.json'
const hadReceipt = 'project/had/studies/water-replan.json'
const currentMatDock = 'project/mat/studies/plant-threshold.json'

test('the selected overlay account authenticates the real source edges and separates authored RWT inputs from receipts', () => {
  const audit = auditSourceCoverage()
  assert.deepEqual(audit.findings, [])
  assert.deepEqual(audit, auditSourceCoverage())
  const rwt = audit.families.find(family => family.id === 'rwt-conditional-receiving')
  assert.ok(rwt.authoredInputs.includes(rwtSource))
  assert.ok(!rwt.receipts.includes(rwtSource))
  const water = audit.families.find(family => family.id === 'had-selected-water')
  assert.ok(water.consumers.includes('project/had/studies/current-house.mjs'))
  assert.equal(JSON.stringify(deriveWaterReplan(), null, 2) + '\n', read(hadReceipt).toString('utf8'))
})

test('a changed active RWT receiving input contradicts the existing HAD producer receipt despite its retained identity', () => {
  const changed = JSON.parse(read(rwtSource))
  changed.east.maximumWater -= 10
  const audit = auditSourceCoverage(path =>
    path === rwtSource ? Buffer.from(JSON.stringify(changed, null, 2) + '\n') : read(path))
  assert.deepEqual(audit.findings.map(({ kind, path, receipt, source }) => ({ kind, path, receipt, source })), [
    { kind: 'changed-file', path: rwtSource, receipt: undefined, source: undefined },
    { kind: 'source-contradiction', path: undefined, receipt: hadReceipt, source: rwtSource },
  ])
})

test('the live MAT dock requirement remains unknown if the legacy helper could use its historical default', () => {
  const audit = auditSourceCoverage(path => path === currentMatDock ? undefined : read(path))
  assert.deepEqual(audit.findings, [{ kind: 'unknown-file', path: currentMatDock }])
})

test('changed discipline receipts invalidate both the affected candidate and its replayed result', () => {
  const cases = [
    ['str-conditional-interface', 'project/str/studies/current-house-ground-ties.json',
      'project/str/studies/floor-portal-monolithic-drag.json'],
    ['had-inlet-south-sill-insert', 'project/had/studies/south-inlet-under-sill.json',
      'project/had/studies/south-inlet-sill-insert.json'],
    ['had-inlet-south-fault-envelope', 'project/had/studies/south-inlet-relief.json',
      'project/had/studies/south-inlet-under-sill.json'],
  ]
  const baseline = auditSourceCoverage()
  for (const [id, input, receipt] of cases) {
    const changed = auditSourceCoverage(path => path === input ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path))
    assert.ok(changed.findings.some(finding => finding.kind === 'source-contradiction' &&
      finding.source === input && finding.receipt === receipt))
    const digest = (audit, family) => audit.bindings.find(binding => binding.id === family).digest
    assert.notEqual(digest(changed, id), digest(baseline, id))
    assert.equal(digest(changed, 'had-inlet-indoor-reference'), digest(baseline, 'had-inlet-indoor-reference'))
  }
})
