import assert from 'node:assert/strict'
import test from 'node:test'
import { inventoryConsumerSources } from './source-consumers.mjs'

test('each BCR, IAS and OAS study entry has one owning scope and its literal references can be traced across workstreams', () => {
  const report = inventoryConsumerSources()
  assert.deepEqual(report.findings, [])
  assert.deepEqual(report, inventoryConsumerSources())
  const occurrences = [
    ['bcr-georgian-feasibility', 'project/bcr/studies/structure-geometry.ts',
      ['compiler/reference-house/georgian/layout-revision.ts']],
    ['ias-workable-interiors', 'project/ias/studies/workable-room-assemblies.mjs',
      ['project/had/studies/current-house.mjs']],
    ['ias-crafted-room-kit', 'project/ias/studies/crafted-study-views.mjs',
      ['compiler/reference-house/current-design/compile.ts', 'project/ias/studies/workable-study-floor.json']],
    ['ias-crafted-room-kit', 'project/ias/studies/study-furniture-motion.py',
      ['project/bcr/studies/bay-interface-study.py', 'project/bcr/studies/bay-interface-study.json',
        'project/mat/studies/study-coupled-window.json']],
    ['oas-study-subframe', 'project/oas/studies/study-subframe.mjs',
      ['project/bcr/studies/bay-interface-study.json', 'project/had/studies/current-house.mjs']],
  ]
  for (const [family, path, references] of occurrences) {
    assert.ok(report.families.find(entry => entry.id === family)?.entries.includes(path))
    for (const target of references) assert.ok(report.references[path].includes(target))
  }
  assert.ok(report.references['project/had/studies/current-house.mjs'].includes('project/had/studies/water-replan.json'))
  assert.equal(report.families.find(entry => entry.id === 'oas-north-export').state, 'current-rejection-witness')
})
