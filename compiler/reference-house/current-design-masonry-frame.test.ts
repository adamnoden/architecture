import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readMasonryFrameCase, runMasonryFrameCase, savedMasonryFrameCase } from './current-design/structural-masonry-frame.js'

const proof = JSON.parse(readFileSync(new URL('../../project/str/studies/masonry-frame-a-proof.json', import.meta.url), 'utf8'))
const numerical = proof.authoredNumericalCase
const vertical = numerical.verticalCase
const house = vertical.monolithicCase.houseCase
const joined = house.joinedCase
const floorFields = ['cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw', 'edgeBand', 'maxPitchMm', 'boundaryCase', 'receivingLaws', 'use']
const portalFields = ['frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm']
const joinedFields = ['geometry', 'portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm']
const nativeFields = ['plateLaw', 'bearingLaw', 'maxPitchMm', 'bearingQuadratureOrder', 'freshUniformLiveKPa']
const masonryFields = ['masonrySeatProjectionMm', 'masonryUnitWeightKNM3', 'abutmentSlices', 'foundationWeight', 'courtCornerClosure', 'floorReinforcement']
function stages() {
  return {
    distributedFloor: { ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), edits: joined.floor.componentCase.edits },
    masonryFrame: { ...Object.fromEntries(joinedFields.map(key => [key, joined[key]])),
      portal: Object.fromEntries(portalFields.map(key => [key, joined.portal[key]])),
      caseId: 'SAVED-MASONRY-A', coreAxialWidthMm: house.coreAxialWidthMm,
      northUpstandWidthMm: house.northUpstandWidthMm, physicalGFactor: house.boundary.physicalGFactor,
      includeExternalGMAXQ: house.boundary.includeExternalGMAXQ,
      ...Object.fromEntries(nativeFields.map(key => [key, vertical[key]])),
      ...Object.fromEntries(masonryFields.map(key => [key, numerical[key]])) },
  }
}
function result(bundle: { engineering: object }) {
  const value = Reflect.get(bundle.engineering, 'masonryFrame') as ReturnType<typeof runMasonryFrameCase> | undefined
  assert.ok(value, 'The saved document must execute the actual separate masonry frame consumer')
  return value
}
function headDelta(a: ReturnType<typeof runMasonryFrameCase>, b: ReturnType<typeof runMasonryFrameCase>) {
  const before = new Map(a.native.heads.map(head => [head.id, head.reactionKN_KNm]))
  return Math.max(...b.native.heads.flatMap(head => head.reactionKN_KNm.map((value, axis) => Math.abs(value - before.get(head.id)![axis]!))))
}

test('a saved opening edit changes the actual straight-frame gravity response and drawing through the public CLI and reverses', async () => {
  const document = { ...await readEngineeringDocument(readGeorgianDesignSnapshot()), stages: stages() }
  const baselineBundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const baseline = result(baselineBundle)
  const changedDocument = JSON.parse(JSON.stringify(document))
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
  assert.equal(Object.keys(baseline.native.sourceSHA256 as object).length, 41)
  if (numerical.courtCornerClosure) {
    assert.equal(baseline.courtCornerClosure?.newSupportCount, 0)
    assert.equal(baseline.courtCornerClosure?.localJointRigidityAccepted, false)
    assert.equal(baseline.vertical.missingGroundContactAreaMm2, 0)
  }
  assert.ok(baseline.native.equilibriumResidualKN_KNm.every(value => Math.abs(value) < 1e-6))
  assert.ok(Math.abs(changed.vertical.mass.newPlatePhysicalSelfGKN - baseline.vertical.mass.newPlatePhysicalSelfGKN + .545) < 1e-7)
  assert.ok(headDelta(baseline, changed) > 1e-5)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.notEqual(changed.source.caseDigest, baseline.source.caseDigest)
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
  const restored = result(await compileEngineeringDocument(changedDocument))
  assert.equal(restored.source.caseDigest, baseline.source.caseDigest)
  assert.ok(headDelta(baseline, restored) < 1e-7)
  assert.equal(restored.floorSvg, baseline.floorSvg)
})

test('masonry stage rejects second-floor, result, historical-method and stale binding substitutions', async () => {
  const resolved = readCurrentDesignResolution()
  const { masonry } = readMasonryFrameCase(resolved)
  const authored = stages()
  const shared = { ...masonry.comparison.verticalCase.monolithicCase.houseCase.joinedCase.floor,
    ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), componentCase: joined.floor.componentCase }
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
