import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readMasonryFrameCase, runMasonryFrameCase, savedMasonryFrameCase } from './current-design/structural-masonry-frame.js'
import { hasPhysicalPlateTrace, validateRoofCoupling } from './current-design/structural-house-coupling.js'

const proof = JSON.parse(readFileSync(new URL('../../project/str/studies/masonry-frame-a-proof.json', import.meta.url), 'utf8'))
const numerical = proof.authoredNumericalCase
const vertical = numerical.verticalCase
const house = vertical.monolithicCase.houseCase
const joined = house.joinedCase
const floorFields = ['cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw', 'edgeBand', 'maxPitchMm', 'boundaryCase', 'receivingLaws', 'use']
const portalFields = ['frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm']
const joinedFields = ['geometry', 'portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm']
const nativeFields = ['plateLaw', 'bearingLaw', 'maxPitchMm', 'bearingQuadratureOrder', 'freshUniformLiveKPa']
const masonryFields = ['masonrySeatProjectionMm', 'masonryUnitWeightKNM3', 'abutmentSlices', 'foundationWeight', 'courtCornerClosure', 'floorReinforcement', 'lowerCoreBodies', 'lowerLWeight', 'roofCoupling', 'straightFrameCage']
function stages() {
  const roof = numerical.roofCoupling ? { ...numerical.roofCoupling, roofSurfacePressure: {
    kind: 'authored-equivalent-plan-pressure-control', uniformKPa: 1.5,
    rowMultipliers: Object.fromEntries(Array.from({ length: 12 }, (_, frame) => Array.from({ length: 9 }, (_, row) => [`ROOF-ROW/${frame}/${row}`, 1])).flat()),
  } } : null
  return {
    distributedFloor: { ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), edits: joined.floor.componentCase.edits },
    masonryFrame: { ...Object.fromEntries(joinedFields.map(key => [key, joined[key]])),
      portal: Object.fromEntries(portalFields.map(key => [key, joined.portal[key]])),
      caseId: 'SAVED-MASONRY-A', coreAxialWidthMm: house.coreAxialWidthMm,
      northUpstandWidthMm: house.northUpstandWidthMm, physicalGFactor: house.boundary.physicalGFactor,
      includeExternalGMAXQ: house.boundary.includeExternalGMAXQ,
      ...Object.fromEntries(nativeFields.map(key => [key, vertical[key]])),
      ...Object.fromEntries(masonryFields.map(key => [key, numerical[key]])), roofCoupling: roof },
  }
}
function result(bundle: { engineering: object }) {
  const value = Reflect.get(bundle.engineering, 'masonryFrame') as ReturnType<typeof runMasonryFrameCase> | undefined
  assert.ok(value, 'The saved document must execute the actual separate masonry frame consumer')
  return value
}
function assertAcyclicManifest(manifest: readonly { stage: string; dependsOn: readonly string[] }[]) {
  const rows = new Map(manifest.map(row => [row.stage, row]))
  const seen = new Set<string>(), active = new Set<string>()
  function visit(stage: string) {
    if (seen.has(stage) || !rows.has(stage)) return
    assert.ok(!active.has(stage), `Compiler manifest dependency cycle at ${stage}`)
    active.add(stage)
    for (const dependency of rows.get(stage)!.dependsOn) visit(dependency)
    active.delete(stage); seen.add(stage)
  }
  for (const row of manifest) visit(row.stage)
}

function headDelta(a: ReturnType<typeof runMasonryFrameCase>, b: ReturnType<typeof runMasonryFrameCase>) {
  const before = new Map(a.native.heads.map(head => [head.id, head.reactionKN_KNm]))
  return Math.max(...b.native.heads.flatMap(head => head.reactionKN_KNm.map((value, axis) => Math.abs(value - before.get(head.id)![axis]!))))
}

test('one saved floor, body and roof edit propagates through the actual coupled response, public CLI and reversal', async () => {
  const sourceDocument = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...sourceDocument, stages: { ...stages(), roofPitch: sourceDocument.stages.roofPitch } }
  const baselineBundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const baseline = result(baselineBundle)
  assert.ok(numerical.lowerCoreBodies && numerical.roofCoupling, 'The current worked case must exercise real body and roof composition')
  const changedDocument = JSON.parse(JSON.stringify(document))
  changedDocument.stages.masonryFrame.lowerCoreBodies.masonryUnitWeightKNPerM3 += 1
  changedDocument.stages.masonryFrame.roofCoupling.roofWindFactor *= .8
  changedDocument.stages.masonryFrame.roofCoupling.roofSurfacePressure.uniformKPa = -2.25
  changedDocument.stages.masonryFrame.roofCoupling.roofSurfacePressure.rowMultipliers['ROOF-ROW/0/0'] = 0
  changedDocument.stages.masonryFrame.freshUniformLiveKPa = 2
  changedDocument.stages.distributedFloor.edits.floorApertures = [{ id: 'FLOOR-APERTURE/plant-riser',
    shape: { kind: 'rectangle', boundsXYMm: [9240, 4760, 9905, 5305] } }]
  const changedBundle = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(changedDocument), encoding: 'utf8', maxBuffer: 96 * 1024 * 1024,
  }))
  const changed = result(changedBundle)
  assert.equal(baseline.native.heads.length, 52)
  assert.equal(baseline.vertical.schema, 'str-masonry-frame-a-vertical-result/1')
  assert.equal(baseline.native.schema, 'str-masonry-frame-a-compatible-frame-result/1')
  assert.deepEqual(baseline.vertical.request, baseline.native.request)
  assert.equal(Object.keys(baseline.native.sourceSHA256 as object).length, 48)
  if (numerical.courtCornerClosure) {
    assert.equal(baseline.courtCornerClosure?.newSupportCount, 0)
    assert.equal(baseline.courtCornerClosure?.localJointRigidityAccepted, false)
    assert.equal(baseline.vertical.missingGroundContactAreaMm2, 0)
  }
  assert.ok(baseline.native.equilibriumResidualKN_KNm.every(value => Math.abs(value) < 1e-6))
  assert.ok(Math.abs(changed.vertical.mass.newPlatePhysicalSelfGKN - baseline.vertical.mass.newPlatePhysicalSelfGKN + .545) < 1e-7)
  assert.ok(headDelta(baseline, changed) > 1e-5)
  assert.equal(baseline.floorLiveLoad.characteristicPressureKPa, 0)
  assert.equal(baseline.floorLiveLoad.appliedQKN, 0)
  assert.equal(changed.floorLiveLoad.characteristicPressureKPa, 2)
  assert.equal(changed.floorLiveLoad.combinationFactor, 1.5)
  assert.equal(changed.floorLiveLoad.addedPhysicalMassKN, 0)
  assert.equal(changed.floorLiveLoad.legacyGrossGFlagRequired, false)
  assert.equal(changed.floorLiveLoad.appliedQKN, 3 * Number(changed.vertical.mass.newPlateAreaM2))
  assert.equal(changed.floorLiveLoadIntegrationDebt.length, 0)
  assert.equal(changed.floorLiveLoad.candidateAccepted, false)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.notEqual(changed.source.caseDigest, baseline.source.caseDigest)
  assert.ok(baseline.lowerCoreBodies && changed.lowerCoreBodies && baseline.roofCoupling && changed.roofCoupling)
  const bodyInventory = baseline.lowerCoreBodies.inventory as { netClearCoreVolumeM3: number }
  assert.ok(Math.abs(Number(changed.lowerCoreBodies.addedPhysicalGKN) - Number(baseline.lowerCoreBodies.addedPhysicalGKN) - bodyInventory.netClearCoreVolumeM3) < 1e-6)
  assert.equal(changed.lowerCoreBodies.noNewLateralStiffness, true)
  assert.equal(changed.lowerCoreResponse?.gaugeReactionsAcceptedAsSupport, false)
  assert.equal(changed.roofCoupling.windIndex, changedDocument.stages.distributedFloor.boundaryCase.windIndex)
  const current = readMasonryFrameCase(readCurrentDesignResolution()).masonry
  const checked = savedMasonryFrameCase(current, document.stages.masonryFrame, {
    ...current.comparison.verticalCase.monolithicCase.houseCase.joinedCase.floor,
    ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), componentCase: joined.floor.componentCase })
  assert.throws(() => validateRoofCoupling({ ...baseline.roofCoupling, windIndex: Number(baseline.roofCoupling!.windIndex) + 1 },
    document.stages.masonryFrame.roofCoupling, checked.comparison.sourceSHA256,
    checked.comparison.verticalCase.monolithicCase.houseCase.joinedCase.floor, baseline.native), /sole floor wind programme/)

  const pressureBaseline = baseline.roofCoupling.roofSurfacePressure as Record<string, unknown>
  const pressureChanged = changed.roofCoupling.roofSurfacePressure as Record<string, unknown>
  assert.equal(pressureBaseline.schema, 'str-roof-surface-pressure/1')
  assert.ok(Math.abs(Number(pressureBaseline.verticalDownKN) - 216.225) < 1e-7)
  assert.ok(Number(pressureChanged.verticalDownKN) < 0, 'The authored edit must actually execute suction')
  assert.ok(Number(pressureChanged.loadedWeightedPlanAreaM2) < Number(pressureBaseline.loadedWeightedPlanAreaM2))
  assert.notDeepEqual(pressureBaseline.actualLocalActions, pressureChanged.actualLocalActions)
  for (const roof of [baseline.roofCoupling, changed.roofCoupling]) {
    const receivers = roof.receivers as Record<string, unknown>[]
    assert.equal(receivers.length, 18)
    assert.ok(receivers.every(row => hasPhysicalPlateTrace(row.plateTrace)), 'All eighteen receivers must participate in the actual physical operator')
    assert.equal((roof.roofSurfacePressure as Record<string, unknown>).facadePressureCorrelationQualified, false)
  }
  assert.deepEqual(changed.roofCoupling.datumsMm, baseline.roofCoupling.datumsMm)
  assert.notEqual(changed.roofCoupling.roofSvg, baseline.roofCoupling.roofSvg)
  assert.ok(baseline.roofSteelGravity && changed.roofSteelGravity, 'Actual modeled roof stock G must join this worked case')
  assert.equal(changed.roofSteelGravity.physicalGKN, baseline.roofSteelGravity.physicalGKN)
  assert.equal(changed.roofSteelGravity.completeRoofGravity, false)
  assert.equal(changed.roofSteelGravity.retainedMinimumGQualified, false)
  const roofWrench = baseline.roofCoupling.additionalPressureWrenchKN_KNm as number[]
  assert.ok((changed.roofCoupling.additionalPressureWrenchKN_KNm as number[]).every((value, axis) => Math.abs(value - .8 * roofWrench[axis]) < 1e-6))
  assert.equal(changedBundle.manifest.find((row: { stage: string }) => row.stage === 'roofPitch').applicability.controllingStage, 'masonryFrame')
  assert.equal(changedBundle.manifest.find((row: { stage: string }) => row.stage === 'selectedWaterEvent').applicability.controllingStage, 'masonryFrame')
  assert.ok(changedBundle.coordinationDiagnostics.some((row: { code: string }) => row.code === 'COUPLED_ROOF_WEATHER_NOT_COORDINATED'))
  assertAcyclicManifest(changedBundle.manifest)

  for (const key of ['RCVolumeM3', 'physicalGKN', 'centroidXYZMm', 'request']) {
    assert.deepEqual(changed.foundationWeight[key], baseline.foundationWeight[key])
  }
  const serializedBaseline = JSON.parse(JSON.stringify(baselineBundle))
  assert.deepEqual(changedBundle.plans, serializedBaseline.plans)
  assert.deepEqual(changedBundle.selectedWaterEvent, serializedBaseline.selectedWaterEvent)
  assert.equal(changed.evidence.candidateAccepted, false)
  assert.equal(changed.evidence.completeHouseProof, false)
  assert.equal(changedBundle.manifest.find((row: { stage: string }) => row.stage === 'distributedFloor').applicability.controllingStage, 'masonryFrame')
  assert.ok(changedBundle.manifest.find((row: { stage: string }) => row.stage === 'masonryFrame').dependsOn.includes('distributedFloor'))
  assert.ok(!changedBundle.manifest.find((row: { stage: string }) => row.stage === 'distributedFloor').dependsOn.includes('masonryFrame'))
  changedDocument.stages.distributedFloor.edits = JSON.parse(JSON.stringify(document.stages.distributedFloor.edits))
  changedDocument.stages.masonryFrame.lowerCoreBodies = JSON.parse(JSON.stringify((document.stages.masonryFrame as Record<string, unknown>).lowerCoreBodies))
  changedDocument.stages.masonryFrame.roofCoupling = JSON.parse(JSON.stringify((document.stages.masonryFrame as Record<string, unknown>).roofCoupling))
  changedDocument.stages.masonryFrame.freshUniformLiveKPa = Reflect.get(document.stages.masonryFrame, 'freshUniformLiveKPa')
  const restored = result(await compileEngineeringDocument(changedDocument))
  assert.equal(restored.source.caseDigest, baseline.source.caseDigest)
  assert.ok(headDelta(baseline, restored) < 1e-7)
  assert.deepEqual(restored.floorLiveLoad, baseline.floorLiveLoad)
  assert.equal(restored.floorSvg, baseline.floorSvg)
  assert.equal(restored.roofCoupling?.roofSvg, baseline.roofCoupling.roofSvg)
  assert.deepEqual(restored.roofCoupling?.roofSurfacePressure, baseline.roofCoupling.roofSurfacePressure)
})

test('masonry stage rejects second-floor, result, historical-method and stale binding substitutions', async () => {
  const resolved = readCurrentDesignResolution()
  const { masonry } = readMasonryFrameCase(resolved)
  const authored = stages()
  const shared = { ...masonry.comparison.verticalCase.monolithicCase.houseCase.joinedCase.floor,
    ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), componentCase: joined.floor.componentCase }
  assert.deepEqual(savedMasonryFrameCase(masonry, JSON.parse(JSON.stringify(authored.masonryFrame)), shared),
    savedMasonryFrameCase(masonry, authored.masonryFrame, shared), 'A save/load no-op must preserve the exact authored case')
  assert.equal(Reflect.get(savedMasonryFrameCase(masonry, { ...authored.masonryFrame, freshUniformLiveKPa: 2 }, shared)
    .comparison.verticalCase, 'freshUniformLiveKPa'), 2)
  assert.equal(Reflect.get(savedMasonryFrameCase(masonry, { ...authored.masonryFrame, roofCoupling: null, freshUniformLiveKPa: 2 }, shared)
    .comparison.verticalCase, 'freshUniformLiveKPa'), 2)
  for (const invalid of [-1, 6, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => savedMasonryFrameCase(masonry, { ...authored.masonryFrame, freshUniformLiveKPa: invalid }, shared),
      /Independent net floor live pressure/)
  }
  assert.throws(() => savedMasonryFrameCase(masonry, authored.masonryFrame, undefined), /sole shared distributed-floor/)
  assert.throws(() => savedMasonryFrameCase(masonry, { ...authored.masonryFrame, floor: shared }, shared), /another floor/)
  assert.throws(() => savedMasonryFrameCase(masonry, { ...authored.masonryFrame, native: {} }, shared), /derived approval/)
  assert.throws(() => runMasonryFrameCase(resolved, { ...masonry, bindingDigest: 'historical' }), /Stale masonry frame/)
  assert.throws(() => runMasonryFrameCase(resolved, { ...masonry, accepted: true }), /without derived sources/)
  assert.throws(() => runMasonryFrameCase(resolved, { ...masonry,
    comparison: { ...masonry.comparison, sourceSHA256: {} } }), /nested sources/)
  const missing = { ...resolved, disciplineBindings: resolved.disciplineBindings.filter(binding => binding.id !== 'str-masonry-frame-comparison') }
  assert.throws(() => readMasonryFrameCase(missing), /admitted str-masonry-frame-comparison/)
  const isolated = { ...resolved, disciplineBindings: resolved.disciplineBindings.filter(binding => binding.id === 'str-masonry-frame-comparison') }
  assert.doesNotThrow(() => readMasonryFrameCase(isolated))
  const document = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { masonryFrame: authored.masonryFrame } }), /sole shared distributed-floor/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: authored, bindings: { ...document.bindings, implementations: {} } }), /Stale engineering/)
  const unsupported = { ...authored, masonryFrame: { ...authored.masonryFrame, plateLaw: { ...vertical.plateLaw, thicknessMm: 250 } } }
  await assert.rejects(compileEngineeringDocument({ ...document, stages: unsupported }), /ActualRC200 source floor required/)
})
