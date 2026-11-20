import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

async function inletDocument() {
  const document = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } = document.stages
  return { ...document, stages: { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly: { plantSouthLegLevelMm: inletAssembly.plantSouthLegLevelMm } } }
}

async function refittedDocument() {
  const document = await inletDocument()
  return { ...document, stages: { ...document.stages, inletCovers: document.stages.inletCovers.map(cover => ({
    ...cover, closure: cover.branch === 'utility' ? {
      profile: 'rounded-taper', notchLapMm: 9, collarSealLandMm: 4, collarOutsideDiameterMm: 92,
      wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true, taperToeReliefMm: 20,
      minimumTaperReservesMm: { filler: 5, baffle: 5, purge: 5 }, frontReceiver: { widthMm: 8, edgeInsetMm: 5 },
    } : { notchLapMm: 10, collarSealLandMm: 4, collarOutsideDiameterMm: 92, wallReturnDepthMm: 10 },
  })) } }
}

test('the whole inlet joins the actual sill and wet-cell axes through to named pressure endpoints', async () => {
  const document = await inletDocument()
  const result = await compileEngineeringDocument(document)
  const assembly = result.engineering.inletAssembly!
  assert.equal(assembly.disposition, 'reject-current-arrangement')
  assert.equal(assembly.routeCalculation.pairClearanceMm, 36.2024)
  assert.equal(assembly.routeCalculation.pairClearanceMm, assembly.routeCalculation.nativeWetBoxControl.pairClearanceMm)
  assert.equal(assembly.routeCalculation.branches[0].hotBackboneMm, assembly.routeCalculation.nativeWetBoxControl.utilityHotMm)
  assert.equal(assembly.branches[0].routeMm[0][0], 10080)
  assert.equal(assembly.branches[1].routeMm[0][0], 10285)
  assert.equal(assembly.branches[0].routeMm[2][1], 580)
  for (const branch of assembly.branches) {
    assert.equal(branch.routeMm[2][0], branch.dryBreak.xMm)
    assert.equal(branch.routeMm[2][1], branch.dryBreak.yMm)
    assert.equal(branch.sourceFailure.manualClosureCredited, false)
  }
  assert.ok(assembly.pressureNetwork.continuity.every(joint => joint.meets))
  assert.deepEqual(assembly.pressureNetwork.plantColdConnectorMm.at(-1), assembly.pressureNetwork.factoryColdPortMm)
  assert.equal(assembly.pressureNetwork.terminalMotionProved, false)
  assert.equal(assembly.evidence.preSiteArrangementComplete, false)
  assert.ok(assembly.geometryBlockers.includes('utility:RECTANGULAR_COVER_EXCEEDS_INSTALLED_CELL_PLAN'))
  assert.equal(assembly.geometryBlockers.includes('plant:WALL_RETURN_INTERCEPTS_FORMED_VENT'), false)
  assert.ok(assembly.geometryBlockers.includes('plant:COLLAR_RADIAL_SEAL_LAND_SHORT'))
  assert.ok(result.manifest.find(row => row.stage === 'inletAssembly')!.dependsOn.includes('inletCovers/utility'))
  assert.ok(document.bindings.implementations['compiler/reference-house/current-design/inlet-assembly.ts'])
})

test('a passing closure fit cannot turn the joined arrangement into installed or pre-site acceptance', async () => {
  const document = await refittedDocument()
  const result = await compileEngineeringDocument(document)
  const assembly = result.engineering.inletAssembly!
  assert.equal(assembly.disposition, 'conditional-arrangement-incomplete')
  assert.deepEqual(assembly.geometryBlockers, [])
  assert.equal(assembly.routeCalculation.routesClear, true)
  assert.equal(assembly.evidence.preSiteArrangementComplete, false)
  assert.equal(assembly.evidence.selectedInlet, false)
  assert.equal(assembly.evidence.installedAcceptance, false)
  assert.equal(assembly.evidence.preparationBooleansAreEvidence, false)
  assert.equal(assembly.independentSupport.carrierAndWetCells, 'separate-anchored-support-not-qualified')
  assert.equal(assembly.remainingProof.filter(row => row.stage === 'pre-site arrangement').length, 3)
  assert.deepEqual(await compileEngineeringDocument(JSON.parse(JSON.stringify(document))), result)
})

test('a real plant-leg edit changes the joined drawing and clearance while unrelated stages retain their results', async () => {
  const document = await refittedDocument()
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletAssembly: { ...document.stages.inletAssembly, plantSouthLegLevelMm: 2635 } } })
  const before = baseline.engineering.inletAssembly!, after = changed.engineering.inletAssembly!
  assert.equal(before.routeCalculation.routesClear, true)
  assert.equal(after.routeCalculation.routesClear, false)
  assert.ok(after.routeCalculation.pairClearanceMm < 25)
  assert.ok(after.geometryBlockers.includes('JOINED_OCCUPIED_ROUTE_CLEARANCE'))
  assert.notEqual(after.source.caseDigest, before.source.caseDigest)
  assert.notDeepEqual(after.drawing, before.drawing)
  assert.deepEqual(after.branches[0].routeMm, before.branches[0].routeMm)
  assert.deepEqual(changed.manifest.filter(row => row.stage !== 'inletAssembly'), baseline.manifest.filter(row => row.stage !== 'inletAssembly'))
  assert.deepEqual(changed.selectedWaterEvent, baseline.selectedWaterEvent)
  assert.deepEqual(changed.plans, baseline.plans)
})

test('a branch-specific loss of atmospheric relief rejects the arrangement despite unchanged pipe clearance', async () => {
  const document = await refittedDocument()
  const baseline = await compileEngineeringDocument(document)
  const fault = document.stages.inletFault as { branches: { utility: object; plant: object } }
  const changed = await compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletFault: { ...fault, branches: { ...fault.branches, plant: { ...fault.branches.plant, highHoodOpen: false } } } } })
  const before = baseline.engineering.inletAssembly!, after = changed.engineering.inletAssembly!
  assert.equal(after.disposition, 'reject-current-arrangement')
  assert.ok(after.geometryBlockers.includes('plant:no-passive-path'))
  assert.deepEqual(after.routeCalculation, before.routeCalculation)
  assert.deepEqual(after.branches[0].geometryBlockers, before.branches[0].geometryBlockers)
  assert.equal(after.branches[1].sourceFailure.lowerReliefAndHighHood, 'no-passive-path')
  assert.notEqual(after.source.caseDigest, before.source.caseDigest)
})

test('the joined stage rejects missing branches, unsupported levels and injected evidence rather than substituting defaults', async () => {
  const document = await inletDocument()
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { inletAssembly: document.stages.inletAssembly } }), /requires explicit insert, fault/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletCovers: document.stages.inletCovers.filter(row => row.branch === 'plant') } }), /both removals and both covers/)
  for (const plantSouthLegLevelMm of [Number.NaN, Number.POSITIVE_INFINITY, 2800]) {
    await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
      inletAssembly: { plantSouthLegLevelMm } } }), /within 50 mm/)
  }
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletAssembly: { ...document.stages.inletAssembly, approved: true } } }), /derived identity supplied/)
})

test('the supported CLI exports and compiles the joined stage from one persisted engineering document', async () => {
  const document = await inletDocument()
  const result = await compileEngineeringDocument(document)
  const cli = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
    { input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  assert.equal(cli.status, 0, cli.stderr)
  assert.deepEqual(JSON.parse(cli.stdout).engineering.inletAssembly, JSON.parse(JSON.stringify(result.engineering.inletAssembly)))
})
