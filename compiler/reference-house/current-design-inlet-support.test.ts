import assert from 'node:assert/strict'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

async function document() {
  const all = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } = all.stages
  return { ...all, stages: { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } }
}

test('the complete front rail fails the actual permanent electrical field despite clearing the carrier draw', async () => {
  const source = await document()
  const result = await compileEngineeringDocument(source)
  const assembly = result.engineering.inletAssembly!
  const support = assembly.supportComparison!
  assert.equal(support.disposition, 'reject-geometric-arrangement')
  assert.deepEqual([...support.jambAxesXMm].sort((a, b) => a - b), [9297.5, 10502.5])
  assert.equal(support.structuralRoomFaceYMm, 402.5)
  assert.equal(support.roomSideProjectionMm, 317.5)
  assert.equal(support.obstructions.length, 2)
  assert.ok(support.obstructions.every(row => row.objectId === 'PV-permanent-working-field'))
  assert.ok(support.carrierClearances.every(row => row.afterSettingMm > 0))
  assert.equal(support.selectedSupport, false)
  assert.equal(support.inheritedWindowOrInsertCapacity, false)
  assert.equal(assembly.evidence.preSiteArrangementComplete, false)
  assert.ok(source.bindings.implementations['compiler/reference-house/current-design/inlet-support.ts'])
  assert.deepEqual(await compileEngineeringDocument(JSON.parse(JSON.stringify(source))), result)
})

test('retreating a rail from occupied space exposes the actual fixed wet-cell conflict in the same saved model', async () => {
  const source = await document()
  const before = await compileEngineeringDocument(source)
  const changed = await compileEngineeringDocument({ ...source, stages: { ...source.stages,
    inletAssembly: { ...source.stages.inletAssembly, supportRails: { ...source.stages.inletAssembly.supportRails, centreYMm: 640 } } } })
  const base = before.engineering.inletAssembly!, after = changed.engineering.inletAssembly!
  assert.ok(after.supportComparison!.obstructions.some(row => row.objectId === 'utility-fixed-wet-cell'))
  assert.equal(after.supportComparison!.obstructions.some(row => row.objectId === 'PV-permanent-working-field'), false)
  assert.equal(after.supportComparison!.disposition, 'reject-geometric-arrangement')
  assert.notDeepEqual(after.supportComparison!.drawing, base.supportComparison!.drawing)
  assert.notEqual(after.source.caseDigest, base.source.caseDigest)
  assert.deepEqual(after.routeCalculation, base.routeCalculation)
  assert.deepEqual(changed.engineering.inletFault, before.engineering.inletFault)
  assert.deepEqual(changed.engineering.inletRemovals, before.engineering.inletRemovals)
  assert.deepEqual(changed.selectedWaterEvent, before.selectedWaterEvent)
  assert.deepEqual(changed.plans, before.plans)
  assert.deepEqual(changed.manifest.filter(row => row.stage !== 'inletAssembly'), before.manifest.filter(row => row.stage !== 'inletAssembly'))
})

test('raising a rail intercepts the real carrier sweep and an unloaded geometric fit never invents concrete capacity', async () => {
  const source = await document()
  const raised = await compileEngineeringDocument({ ...source, stages: { ...source.stages,
    inletAssembly: { ...source.stages.inletAssembly, supportRails: { ...source.stages.inletAssembly.supportRails, upperZMm: 600 } } } })
  assert.ok(raised.engineering.inletAssembly!.supportComparison!.diagnostics.some(row => row.code === 'CARRIER_DRAW_INTERCEPT'))
  const behind = await compileEngineeringDocument({ ...source, stages: { ...source.stages,
    inletAssembly: { ...source.stages.inletAssembly, supportRails: { ...source.stages.inletAssembly.supportRails, centreYMm: 350 } } } })
  assert.equal(behind.engineering.inletAssembly!.supportComparison!.receivingCapacity, 'not-established')
  assert.equal(behind.engineering.inletAssembly!.supportComparison!.selectedSupport, false)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { ...source.stages,
    inletAssembly: { ...source.stages.inletAssembly, supportRails: { ...source.stages.inletAssembly.supportRails, approved: true } } } }), /explicit inlet support/)
})
