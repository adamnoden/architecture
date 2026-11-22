import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { pathToFileURL } from 'node:url'
import { auditSourceCoverage } from './source-coverage.ts'
import { deriveWaterReplan } from '../../had/studies/water-replan.mjs'

const root = new URL('../../../', import.meta.url)
const read = path => readFileSync(new URL(path, root))
const rwtSource = 'project/rwt/studies/selected-receiving-interface.json'
const hadReceipt = 'project/had/studies/water-replan.json'
const currentMatDock = 'project/mat/studies/plant-threshold.json'

test('an already loaded audit accepts a refreshed authority and its matching source account', async () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'ovid-source-refresh-'))
  try {
    const scope = join(sandbox, 'project/ccr/studies')
    mkdirSync(scope, { recursive: true })
    const method = join(scope, 'source-coverage.ts')
    copyFileSync(new URL('./source-coverage.ts', import.meta.url), method)
    const source = 'project/authority.json'
    const manifest = join(scope, 'source-coverage.json')
    const write = widthMm => {
      const content = Buffer.from(JSON.stringify({ widthMm }))
      writeFileSync(join(sandbox, source), content)
      return createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex')
    }
    const bind = blob => writeFileSync(manifest, JSON.stringify({ families: [], gitBlobs: { [source]: blob }, receiptEdges: [] }))
    bind(write(12000))
    const loaded = await import(pathToFileURL(method).href)
    assert.deepEqual(loaded.auditSourceCoverage().findings, [])
    const next = write(12001)
    assert.deepEqual(loaded.auditSourceCoverage().findings.map(entry => entry.kind), ['changed-file'])
    bind(next)
    assert.deepEqual(loaded.auditSourceCoverage().findings, [])
  } finally {
    rmSync(sandbox, { recursive: true, force: true })
  }
})

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

test('current RC, service-floor and keeper methods have canonical bindings without promoting retired structural defaults', () => {
  const baseline = auditSourceCoverage()
  const family = id => baseline.families.find(row => row.id === id)
  const structural = family('str-conditional-interface')
  for (const name of ['floor-portal-north-collar', 'floor-portal-north-roof-shoe', 'current-house-roof-route',
    'current-house-roof-stiffness', 'current-house-membrane-reactions', 'current-house-floor-stops']) {
    for (const extension of ['py', 'json']) {
      const path = `project/str/studies/${name}.${extension}`
      assert.ok(structural.historicalInputs.includes(path))
      assert.ok(![...structural.authorRoots, ...structural.inputReceipts, ...structural.receipts].includes(path))
      assert.ok(baseline.bindings.find(row => row.id === structural.id).identities[path])
    }
  }
  for (const [id, source] of [
    ['str-conditional-interface', 'project/str/studies/rc_portal_monolithic.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/masonry_frame_a.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/foundation_solid_weight.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/court_corner_closure.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/floor_reinforcement.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/plate_bending_recovery.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/lower_core_bodies.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/roof_floor_compatibility.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/roof_stock_gravity.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/roof_surface_pressure.py'],
    ['str-masonry-frame-comparison', 'project/str/studies/straight_frame_cage.py'],
    ['str-masonry-frame-comparison', 'compiler/reference-house/current-design/structural-house-coupling.ts'],
    ['str-conditional-interface', 'project/str/studies/rc_floor_house_loads.py'],
    ['had-fixed-inlet-arrangement', 'compiler/reference-house/current-design/inlet-fixed-temporary-keeper.ts'],
    ['had-fixed-inlet-arrangement', 'compiler/reference-house/current-design/inlet-fixed-support-view.ts'],
    ['had-closed-service-floor', 'compiler/reference-house/current-design/service-floor.ts'],
    ['had-closed-service-floor', 'project/had/studies/closed-service-gasket-evidence.json'],
  ]) {
    const binding = audit => audit.bindings.find(row => row.id === id)
    assert.ok(binding(baseline).identities[source])
    const changed = auditSourceCoverage(path => path === source ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path))
    assert.ok(changed.findings.some(row => row.kind === 'changed-file' && row.path === source))
    assert.notEqual(binding(changed).digest, binding(baseline).digest)
    assert.equal(changed.bindings.find(row => row.id === 'had-inlet-indoor-reference').digest,
      baseline.bindings.find(row => row.id === 'had-inlet-indoor-reference').digest)
  }
  assert.equal(family('had-closed-service-floor').state, 'candidate-interface')
})

test('a changed active RWT receiving input contradicts the existing HAD producer receipt despite its retained identity', () => {
  const changed = JSON.parse(read(rwtSource))
  changed.east.maximumWater -= 10
  const audit = auditSourceCoverage(path =>
    path === rwtSource ? Buffer.from(JSON.stringify(changed, null, 2) + '\n') : read(path))
  assert.deepEqual(audit.findings.map(({ kind, path, receipt, source }) => ({ kind, path, receipt, source })), [
    { kind: 'changed-file', path: rwtSource, receipt: undefined, source: undefined },
    { kind: 'source-contradiction', path: undefined, receipt: hadReceipt, source: rwtSource },
    { kind: 'source-contradiction', path: undefined, receipt: 'project/had/studies/receiver-selection.json', source: rwtSource },
    { kind: 'source-contradiction', path: undefined, receipt: 'project/had/studies/closed-service-floor.json', source: rwtSource },
    { kind: 'source-contradiction', path: undefined, receipt: 'project/had/studies/closed-service-floor.results.json', source: rwtSource },
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
    ['had-inlet-south-sill-insert', 'project/str/studies/reconciled-corner-portals.json',
      'project/had/studies/south-inlet-sill-wind-source.json'],
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


test('current court intake identity invalidates both active RWT records and their downstream receiver before full numerical replay', () => {
  const source = 'project/had/studies/court-intake-selection.json'
  const changed = auditSourceCoverage(path => path === source ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path))
  const receipts = changed.findings.filter(finding => finding.kind === 'source-contradiction' && finding.source === source)
    .map(finding => finding.receipt).sort()
  assert.deepEqual(receipts, [
    'project/had/studies/receiver-selection.json',
    'project/rwt/studies/court-bypass-choice.json',
    'project/rwt/studies/joined-service-routes.json',
  ])
})


test('a changed north-transfer receipt invalidates the actual twin-tie and roof-shoe source maps before interface replay', () => {
  const source = 'project/str/studies/floor-portal-north-transfer.json'
  const changed = auditSourceCoverage(path => path === source ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path))
  const receipts = changed.findings.filter(finding => finding.kind === 'source-contradiction' && finding.source === source)
    .map(finding => finding.receipt).sort()
  assert.deepEqual(receipts, [
    'project/str/studies/floor-portal-north-roof-shoe.json',
    'project/str/studies/floor-portal-twin-garden-tie.json',
  ])
})

test('actual native stage inventories are completely bound in their consuming source families', () => {
  const audit=auditSourceCoverage()
  for(const [id,method] of [
    ['str-conditional-interface','distributed_floor_compatibility.py'],
    ['str-vertical-floor-comparison','vertical_rc_floor.py'],
    ['str-masonry-frame-comparison','upper_roof_bearing.py'],
    ['str-masonry-frame-comparison','floor_section_model.py'],
  ]) {
    const request=JSON.parse(execFileSync('python3',['-B','project/str/studies/'+method,'--read'],{cwd:root,encoding:'utf8'}))
    const binding=audit.bindings.find(row=>row.id===id)
    assert.ok(binding, 'Missing actual consuming source family '+id)
    for(const [path,digest] of Object.entries(request.sourceSHA256)) {
      const bytes=read(path)
      assert.equal(createHash('sha256').update(bytes).digest('hex'),digest,'Native source drift at '+path)
      assert.equal(binding.identities[path],createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),
        id+' lost the actual native dependency '+path)
    }
  }
})
