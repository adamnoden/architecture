import assert from 'node:assert/strict'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readRetainedInletComparisonDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

async function inletDocument() {
  const document = await readRetainedInletComparisonDocument(readGeorgianDesignSnapshot())
  const { inletSillInsert, inletFault, inletRemovals, inletCovers } = document.stages
  return { ...document, stages: { inletSillInsert, inletFault, inletRemovals, inletCovers } }
}

test('a saved sill edit propagates its wind accounting and source identity through the inlet stages', async () => {
  const document = await inletDocument()
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document,
    stages: { ...document.stages, inletSillInsert: { ...document.stages.inletSillInsert, headZMm: 699.5 } } })
  const before = baseline.engineering
  const after = changed.engineering
  assert.ok(before.inletSillInsert && after.inletSillInsert && before.inletFault && after.inletFault)
  assert.equal(after.inletSillInsert.calculation.opening.z[1], 699.5)
  assert.ok(after.inletSillInsert.windPressure.removedPatch.forceKN < before.inletSillInsert.windPressure.removedPatch.forceKN)
  assert.deepEqual(after.inletSillInsert.windPressure.conservation.residual, { forceKN: 0, firstMomentXKNm: 0, firstMomentZKNm: 0 })
  const insertDigest = after.inletSillInsert.source.caseDigest
  assert.notEqual(insertDigest, before.inletSillInsert.source.caseDigest)
  assert.equal(after.inletFault.source.insertCaseDigest, insertDigest)
  assert.equal(before.inletFault.source.nativeReplay, true)
  assert.equal(after.inletFault.source.nativeReplay, false)
  assert.deepEqual(after.inletFault.branchCases, before.inletFault.branchCases)
  assert.ok(after.inletRemovals && after.inletCovers)
  for (const removal of after.inletRemovals) {
    assert.equal(removal.source.insertCaseDigest, insertDigest)
    assert.equal(after.inletCovers.find(cover => cover.branch === removal.branch)?.source.removalCaseDigest, removal.source.caseDigest)
  }
  assert.deepEqual(changed.plans, baseline.plans)
  assert.deepEqual(changed.selectedWaterEvent, baseline.selectedWaterEvent)
  assert.ok(changed.manifest.find(entry => entry.stage === 'inletFault')?.dependsOn.includes('inletSillInsert'))
  assert.ok(changed.manifest.find(entry => entry.stage === 'inletCovers/utility')?.dependsOn.includes('inletRemovals/utility'))
  assert.equal(changed.evidence.installedAcceptance, false)
})

test('a saved branch draw changes the dependent cover corridor while its sibling retains its result', async () => {
  const document = await inletDocument()
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletRemovals: document.stages.inletRemovals.map(removal => removal.branch === 'utility' ? { ...removal, drawMm: 600 } : removal) } })
  const beforeRemoval = baseline.engineering.inletRemovals!.find(result => result.branch === 'utility')!
  const afterRemoval = changed.engineering.inletRemovals!.find(result => result.branch === 'utility')!
  assert.equal(afterRemoval.calculation.exteriorTipPastInsideFaceMm, beforeRemoval.calculation.exteriorTipPastInsideFaceMm - 20)
  const beforeCover = baseline.engineering.inletCovers!.find(result => result.branch === 'utility')!
  const afterCover = changed.engineering.inletCovers!.find(result => result.branch === 'utility')!
  assert.equal(afterCover.source.removalCaseDigest, afterRemoval.source.caseDigest)
  assert.notEqual(afterCover.source.caseDigest, beforeCover.source.caseDigest)
  const beforeCorridor = beforeCover.drawing.primitives.find(item => item.id === 'carrier-corridor-0')!
  const afterCorridor = afterCover.drawing.primitives.find(item => item.id === 'carrier-corridor-0')!
  assert.equal(Number(afterCorridor.metadata?.yMaxMm), Number(beforeCorridor.metadata?.yMaxMm) - 20)
  assert.deepEqual(changed.manifest.filter(entry => ['plans', 'selectedWaterEvent', 'inletFault', 'inletRemovals/plant', 'inletCovers/plant'].includes(entry.stage)),
    baseline.manifest.filter(entry => ['plans', 'selectedWaterEvent', 'inletFault', 'inletRemovals/plant', 'inletCovers/plant'].includes(entry.stage)))
})

test('blocked insert, unready removal and selected split collar cannot replay a default downstream cover', async () => {
  const document = await inletDocument()
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletSillInsert: { ...document.stages.inletSillInsert, headZMm: 695 } } }), /selected sill insert blocks/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletSillInsert: { ...document.stages.inletSillInsert, plantPressureAxisXMm: 10286 } } }), /PLANT_WET_CELL_PACKING/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletRemovals: document.stages.inletRemovals.map(removal => removal.branch === 'utility' ? { ...removal, roofAccess: 'split-collar' } : removal) } }), /dependent cover: ROOF_STRIP_REQUIRED/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletRemovals: document.stages.inletRemovals.map(removal => removal.branch === 'utility' ? { ...removal, drawMm: 500 } : removal) } }), /WALL_TIP_NOT_RELEASED/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletCovers: document.stages.inletCovers.map(cover => cover.branch === 'utility' ? { ...cover, washer: 'installed' } : cover) } }), /washer state differs/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletRemovals: document.stages.inletRemovals.filter(removal => removal.branch === 'utility'),
    inletCovers: document.stages.inletCovers.filter(cover => cover.branch === 'plant') } }), /requested inlet branch is unavailable/)
})

test('a rejected sibling removal does not substitute or block the other branch cover', async () => {
  const document = await inletDocument()
  const selected = { ...document, stages: { ...document.stages,
    inletRemovals: document.stages.inletRemovals.map(removal => removal.branch === 'utility' ? { ...removal, roofAccess: 'split-collar' } : removal),
    inletCovers: document.stages.inletCovers.filter(cover => cover.branch === 'plant') } }
  const result = await compileEngineeringDocument(selected)
  assert.equal(result.engineering.inletRemovals!.find(removal => removal.branch === 'utility')!.status, 'blocked')
  assert.deepEqual(result.engineering.inletCovers!.map(cover => cover.branch), ['plant'])
})

test('normal standalone callers retain their default insert and explicit upstream identities reject stale cases', async () => {
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const insert = (await compile.readInletSillInsertCase()).insert
  const changedInsert = { ...insert, headZMm: 699.5 }
  const originalFault = (await compile.readInletFaultCase()).fault
  const changedFault = (await compile.readInletFaultCase(changedInsert)).fault
  await assert.rejects(compile.inletFault(originalFault, changedInsert), /Stale south inlet fault source binding/)
  const native = await compile.inletFault(originalFault)
  assert.equal(native.source.nativeReplay, true)
  assert.equal((await compile.inletFault(changedFault, changedInsert)).source.nativeReplay, false)
  const originalRemoval = (await compile.readInletRemovalCases())[0].removal
  await assert.rejects(compile.inletRemoval(originalRemoval, changedInsert), /Stale south inlet removal source binding/)
  await assert.rejects(compile.readInletFaultCase(null), /versioned south inlet sill insert case/)
  const document = await inletDocument()
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { inletRemovals: [{ branch: 'utility', insertCaseDigest: '0'.repeat(64) }] } }), /derived identity supplied/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { inletRemovals: [{ branch: 'utility' }, { branch: 'utility' }] } }), /at most once/)
})

test('the authored insert vent propagates the same axis and formed diameter through fault, removal, both closure methods and drawings', async () => {
  const full = await readRetainedInletComparisonDocument(readGeorgianDesignSnapshot())
  const { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } = full.stages
  const document = { ...full, stages: { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } }
  const baseline = await compileEngineeringDocument(document)
  const changed = await compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletSillInsert: { ...inletSillInsert, plantVentOuterZMm: Number(inletSillInsert.plantVentOuterZMm) + 0.5 } } })
  const before = baseline.engineering, after = changed.engineering
  const actual = after.inletSillInsert!.calculation.vents[1]
  const removalBefore = before.inletRemovals!.find(row => row.branch === 'plant')!
  const removalAfter = after.inletRemovals!.find(row => row.branch === 'plant')!
  assert.deepEqual(removalBefore.calculation.wetBox.innerVentAxisMm, [10348, 429.5, 670.39])
  assert.deepEqual(removalAfter.calculation.wetBox.innerVentAxisMm, actual.axis[1])
  assert.equal(removalAfter.calculation.wetBox.formedVentDiameterMm, actual.outerDiameterMM)
  assert.equal(actual.outerDiameterMM, 30)
  assert.equal(after.inletFault!.branchCases[1].geometry.highVentInvertZMm - before.inletFault!.branchCases[1].geometry.highVentInvertZMm, 0.5)
  const coverBefore = before.inletCovers!.find(row => row.branch === 'plant')!
  const coverAfter = after.inletCovers!.find(row => row.branch === 'plant')!
  assert.equal(coverAfter.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm,
    coverBefore.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm - 0.5)
  const splitBefore = before.inletAssembly!.upperClosure!.branches.find(row => row.branch === 'plant')!
  const splitAfter = after.inletAssembly!.upperClosure!.branches.find(row => row.branch === 'plant')!
  assert.equal(splitAfter.rearReturnBelowVentAfterSettingMm, splitBefore.rearReturnBelowVentAfterSettingMm - 0.5)
  assert.notDeepEqual(after.inletSillInsert!.drawing, before.inletSillInsert!.drawing)
  assert.notDeepEqual(after.inletFault!.drawing, before.inletFault!.drawing)
  assert.notEqual(after.inletAssembly!.source.caseDigest, before.inletAssembly!.source.caseDigest)
  assert.deepEqual(after.inletFault!.branchCases[0], before.inletFault!.branchCases[0])
  assert.deepEqual(after.inletRemovals!.find(row => row.branch === 'utility')!.calculation,
    before.inletRemovals!.find(row => row.branch === 'utility')!.calculation)
  assert.deepEqual(changed.plans, baseline.plans)
  assert.deepEqual(changed.selectedWaterEvent, baseline.selectedWaterEvent)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    inletSillInsert: { ...inletSillInsert, plantVentOuterZMm: 661 } } }), /selected sill insert blocks/)
})
