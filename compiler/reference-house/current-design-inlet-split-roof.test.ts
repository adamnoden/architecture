import assert from 'node:assert/strict'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const roof = {
  liftMm: 70, sideTravelMm: 100, forwardTravelMm: 400, plateThicknessMm: 1.5, densityKgM3: 8000,
  handleAndRetainersMassBudgetKg: 0.15, handMassComparisonKg: 2, seamLapMm: 10,
  collarOutsideDiameterMm: 92, collarSealLandMm: 4, rearReturnDepthMm: 8, plantRoofRiseMm: 5,
  handWidthMm: 100, handDepthMm: 60, handHeightMm: 60, handleGripHeightMm: 45,
}
async function document() {
  const d = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const { inletSillInsert, inletFault, inletRemovals, inletCovers, inletAssembly } = d.stages
  return { ...d, stages: { inletSillInsert, inletFault, inletRemovals, inletCovers,
    inletAssembly: { ...inletAssembly, splitRoof: roof } } }
}

test('two light split roof plates replace the complete U-lid transfer and its offset receiver', async () => {
  const d = await document()
  const defaultDocument = await readEngineeringDocument(readGeorgianDesignSnapshot())
  assert.deepEqual(defaultDocument.stages.inletAssembly.splitRoof, roof)
  const result = await compileEngineeringDocument(d)
  const assembly = result.engineering.inletAssembly!
  const split = assembly.upperClosure!
  assert.equal(split.status, 'within-conditional-split-roof-screen')
  assert.equal(assembly.disposition, 'conditional-arrangement-incomplete')
  assert.deepEqual(assembly.geometryBlockers, [])
  assert.equal(assembly.displacedCoverComparison?.state, 'historical-comparison-only')
  assert.ok(result.engineering.inletCovers!.some(cover => cover.installedClosure.status === 'blocked'))
  for (const branch of split.branches) {
    assert.equal(branch.directSplitCollar.noSeparateOversizeFiller, true)
    assert.equal(branch.directSplitCollar.sealLandAfterSettingMm, 4)
    assert.equal(branch.rearReturnIsFixedAndAbsentFromMovingPlate, true)
    assert.equal(branch.parts.length, 2)
    for (const part of branch.parts) {
      assert.ok(part.completeMassBudgetKg < 0.42)
      assert.ok(Object.values(part.margins).every(value => value === null || value >= 0))
      assert.equal(part.movesMm.at(-1)![2], -part.plateDatumZMm)
      assert.deepEqual(part.handEnvelopeMm, [100, 60, 60])
    }
  }
  assert.equal(split.branches.find(branch => branch.branch === 'utility')!.directSplitCollar.collarToFixedCellAfterSettingMm, 3.402)
  assert.equal(split.branches.find(branch => branch.branch === 'plant')!.roofZMm, 735)
  assert.equal(split.evidence.wetClosureQualified, false)
  assert.equal(assembly.evidence.preSiteArrangementComplete, false)
  assert.equal(assembly.evidence.installedAcceptance, false)
  assert.ok(split.removesHardware.includes('offset lid receiver and front bearing'))
  assert.equal(split.drawing.primitives.filter(p => p.kind === 'path').length, 4)
  assert.deepEqual(await compileEngineeringDocument(JSON.parse(JSON.stringify(d))), result)
})

test('a short lift strikes the live sibling while an excessive lift reaches the actual retained dry connection', async () => {
  const d = await document()
  for (const [liftMm, code] of [[20, 'liftedUnderplateToSiblingRoofMm'], [120, 'liftedHandToDryConnectionMm']] as const) {
    const result = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
      inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, liftMm } } } })
    assert.equal(result.engineering.inletAssembly!.upperClosure!.status, 'blocked')
    assert.ok(result.engineering.inletAssembly!.geometryBlockers.some(item => item.includes(code)))
    assert.equal(result.engineering.inletAssembly!.disposition, 'reject-current-arrangement')
  }
})

test('a short forward move cannot lower through the live wet cell and small side travel cannot clear the riser', async () => {
  const d = await document()
  for (const [edit, code] of [
    [{ forwardTravelMm: 100 }, 'loweredToSiblingMm'], [{ sideTravelMm: 30 }, 'lateralToRetainedRiserMm'],
  ] as const) {
    const result = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
      inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, ...edit } } } })
    assert.ok(result.engineering.inletAssembly!.geometryBlockers.some(item => item.includes(code)))
  }
})

test('plate stock, complete hardware budget and hands control the real parts and clearance result', async () => {
  const d = await document()
  const baseline = await compileEngineeringDocument(d)
  const thick = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
    inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, plateThicknessMm: 3 } } } })
  const before = baseline.engineering.inletAssembly!.upperClosure!, after = thick.engineering.inletAssembly!.upperClosure!
  assert.ok(Math.abs(after.branches[0].parts[0].plateMassUpperBoundKg - 2 * before.branches[0].parts[0].plateMassUpperBoundKg) < 0.00011)
  assert.notEqual(after.caseDigest, before.caseDigest)
  assert.deepEqual(thick.engineering.inletAssembly!.routeCalculation, baseline.engineering.inletAssembly!.routeCalculation)
  assert.deepEqual(thick.manifest.filter(row => row.stage !== 'inletAssembly'), baseline.manifest.filter(row => row.stage !== 'inletAssembly'))
  const heavy = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
    inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, handleAndRetainersMassBudgetKg: 3 } } } })
  assert.ok(heavy.engineering.inletAssembly!.geometryBlockers.some(item => item.includes('massBudgetReserveKg')))
  const hands = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
    inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, handDepthMm: 100 } } } })
  assert.ok(hands.engineering.inletAssembly!.geometryBlockers.some(item => item.includes('handToRiserMm')))
})

test('split roofs preserve the independently failed fault path and reject incomplete or fabricated candidate settings', async () => {
  const d = await document()
  const fault = d.stages.inletFault as { branches: { utility: object; plant: object } }
  const result = await compileEngineeringDocument({ ...d, stages: { ...d.stages,
    inletFault: { ...fault, branches: { ...fault.branches, plant: { ...fault.branches.plant, lowerReliefOpen: false } } } } })
  assert.ok(result.engineering.inletAssembly!.geometryBlockers.includes('plant:no-passive-path'))
  assert.equal(result.engineering.inletAssembly!.upperClosure!.status, 'within-conditional-split-roof-screen')
  for (const splitRoof of [null, { ...roof, fabricatedApproval: true }, { liftMm: 70 }]) {
    await assert.rejects(compileEngineeringDocument({ ...d, stages: { ...d.stages,
      inletAssembly: { ...d.stages.inletAssembly, splitRoof } } }), /complete split-roof authoring settings/)
  }
  await assert.rejects(compileEngineeringDocument({ ...d, stages: { ...d.stages,
    inletAssembly: { ...d.stages.inletAssembly, splitRoof: { ...roof, densityKgM3: 0 } } } }), /bounded two-plate comparison/)
})
