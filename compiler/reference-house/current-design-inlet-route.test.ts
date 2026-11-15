import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { auditSourceCoverage } from '../../project/ccr/studies/source-coverage.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const root = new URL('../../', import.meta.url)
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })
const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
const cases = compile.readInletRouteCases()
const southPath = 'project/had/studies/south-utility-inlet.json'

test('the explicit inlet requests replay both current native method scopes without transferring installation or wet authority', async () => {
  const [indoor, south] = await cases
  const [a, b] = await Promise.all([compile.inletRoute(indoor.inlet), compile.inletRoute(south.inlet)])
  assert.equal(a.source.nativeReplay, true)
  assert.equal(b.source.nativeReplay, true)
  assert.notEqual(a.source.bindingDigest, b.source.bindingDigest)
  assert.equal(a.calculation.pairClearanceMm, 185.99)
  assert.equal(b.calculation.pairClearanceMm, 31.23)
  assert.equal(b.calculation.utilityToHotMm, 40.19)
  assert.equal(b.status, 'within-screened-clearances')
  assert.ok(b.diagnostics.some(row => row.code === 'SUPERSEDED_UTILITY_HOT_ROUTE'))
  const comparison = b.calculation.coldRiserComparison!
  assert.equal(comparison.source.earlierHotBackboneMm, 15.99)
  assert.equal(comparison.trial.earlierHotBackboneMm, 30.99)
  assert.equal(comparison.trial.revisedHotAndColdTerminalMm, comparison.source.revisedHotAndColdTerminalMm)
  assert.deepEqual(comparison.washerValve, [10800, 1250, 750])
  assert.deepEqual(comparison.forwardBreak, [11110, 1275, 595])
  assert.equal(comparison.pressureFittingsAndNewSupportsAdmitted, false)
  assert.deepEqual(a.calculation.ports[0].outerPoint, [12090, 2800, 600])
  assert.deepEqual(b.calculation.ports.map(port => port.outerPoint), [[10500, -90, 450], [10645, -90, 650]])
  assert.ok(b.method.entries.every(entry => /^[0-9a-f]{40}$/.test(entry.gitBlob)))
  assert.ok(a.diagnostics.some(row => row.code === 'INSTALLED_INLET_OUTSIDE_SCOPE'))

  const exported = cli('--read-inlet-route', south.design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), [indoor, south])
  const executed = cli('--inlet-route', south)
  assert.equal(executed.status, 0, executed.stderr)
  assert.deepEqual(JSON.parse(executed.stdout), b)
})

test('raising the real south plant leg keeps source ports and stroke but measurably blocks the pair', async () => {
  const [, request] = await cases
  const before = await compile.inletRoute(request.inlet)
  const after = await compile.inletRoute({ ...request.inlet, plantSouthLegLevelMm: 2635 })
  assert.equal(before.calculation.pairMeetsComparison, true)
  assert.equal(after.calculation.pairMeetsComparison, false)
  assert.equal(after.status, 'blocked-screened-clearance')
  assert.equal(after.calculation.pairClearanceMm, 6.29)
  assert.notEqual(before.source.caseDigest, after.source.caseDigest)
  assert.equal(before.source.bindingDigest, after.source.bindingDigest)
  assert.deepEqual(before.calculation.ports, after.calculation.ports)
  assert.equal(after.source.nativeReplay, false)
  const original = (name: string) => before.drawing.primitives.filter(p => p.id.startsWith(name))
  const edited = (name: string) => after.drawing.primitives.filter(p => p.id.startsWith(name))
  assert.deepEqual(original('source-plant'), edited('source-plant'))
  assert.notDeepEqual(original('trial-plant'), edited('trial-plant'))
  assert.ok(edited('trial-plant').some(p => p.metadata?.startZMm === 2635))
})

test('unsupported edits, stale cases and changed source receipts cannot earn reused inlet results', async () => {
  const [indoor, south] = await cases
  await assert.rejects(compile.inletRoute({ ...south.inlet, plantSouthLegLevelMm: 2800 }), /within 50 mm/)
  await assert.rejects(compile.inletRoute({ ...south.inlet, port: { x: 1 } }), /explicit inlet route case/)
  await assert.rejects(compile.inletRoute({ ...south.inlet, bindingDigest: indoor.inlet.bindingDigest }), /Stale inlet route/)
  await assert.rejects(compile.inletRoute({ ...south.inlet, planDigest: 'old' }), /Stale inlet route/)
  await assert.rejects(compile.inletRoute({ ...indoor.inlet, plantSouthLegLevelMm: 2610 }), /no editable south route/)
  assert.ok(auditSourceCoverage(path => {
    const bytes = readFileSync(new URL(path, root))
    return path === southPath ? Buffer.concat([bytes, Buffer.from('\n')]) : bytes
  }).findings.some(finding => finding.kind === 'changed-file' && finding.path === southPath))
})
