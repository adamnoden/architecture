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
