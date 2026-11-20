import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'

function numericalSettings() {
  const proof = JSON.parse(readFileSync(new URL('../../project/str/studies/distributed-floor-compatibility-proof.json', import.meta.url), 'utf8'))
  const { schema: _schema, sourceSHA256: _sources, componentCase, ...settings } = proof.authoredNumericalCase
  return { ...settings, edits: componentCase.edits }
}

test('a saved opening edit changes the actual four-wall and 52-head response and drawing through the production CLI', async () => {
  const design = readGeorgianDesignSnapshot()
  const source = await readEngineeringDocument(design)
  const stages = { distributedFloor: numericalSettings() }
  const document = { ...source, stages }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  assert.ok(before.engineering.distributedFloor)
  const native = JSON.parse(JSON.stringify(before.engineering.distributedFloor.native))
  assert.equal(native.heads.length, 52)
  assert.equal(new Set(native.heads.map((head: { id: string }) => head.id)).size, 52)
  assert.equal(native.completeHouseProof, false)
  assert.equal(native.installedAcceptance, false)
  assert.equal(native.completeSpliceDemand, null)
  assert.equal(native.unmodelledIntermediateReceivingPorts.length, 28)
  const edited = { ...document, stages: { distributedFloor: { ...stages.distributedFloor,
    edits: { ...stages.distributedFloor.edits, floorApertures: [{ id: 'FLOOR-APERTURE/plant-riser',
      shape: { kind: 'rectangle', boundsXYMm: [9240, 4760, 9905, 5305] } }] } } } }
  const after = await compileEngineeringDocument(edited)
  const changed = JSON.parse(JSON.stringify(after.engineering.distributedFloor?.native))
  assert.notEqual(changed.floor.membraneAreaM2, native.floor.membraneAreaM2)
  assert.notDeepEqual(changed.heads, native.heads)
  assert.notDeepEqual(changed.interfaces, native.interfaces)
  assert.deepEqual(changed.windBoundary, native.windBoundary)
  assert.notEqual(after.engineering.distributedFloor?.floorSvg, before.engineering.distributedFloor.floorSvg)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.deepEqual(after.manifest.filter(row => row.stage !== 'distributedFloor'), before.manifest.filter(row => row.stage !== 'distributedFloor'))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(after)))
})

test('missing constitutive laws and real aperture clashes cannot be replaced with approvals or stale saved data', async () => {
  const design = readGeorgianDesignSnapshot()
  const compile = prepareCurrentDesignCompile(design)
  const { floor } = await compile.readDistributedFloorCase()
  await assert.rejects(compile.distributedFloorCase(floor), /authored member law/)
  await assert.rejects(compile.distributedFloorCase({ ...floor, bindingDigest: 'stale' }), /Stale/)
  await assert.rejects(compile.distributedFloorCase({ ...floor, approved: true }), /explicit|derived|unsupported/i)
  const source = await readEngineeringDocument(design)
  const settings = numericalSettings()
  const document = { ...source, stages: { distributedFloor: settings } }
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { distributedFloor: { ...settings, sourceSHA256: {} } } }), /derived identity/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { distributedFloor: { ...settings, use: 'complete-house' } } }), /Complete-house use rejects/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { distributedFloor: { ...settings,
    edits: { ...settings.edits, floorApertures: [{ id: 'FLOOR-APERTURE/plant-riser',
      shape: { kind: 'rectangle', boundsXYMm: [5000, 3800, 5600, 4030] } }] } } } }), /aperture|band/i)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { distributedFloor: { ...settings,
    edgeBand: { ...settings.edgeBand, widthMm: 200 } } } }), /aperture|band/i)
})
