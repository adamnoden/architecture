import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readVerticalRcFloorCase, runVerticalRcFloorCase, savedVerticalRcFloorCase } from './current-design/structural-vertical-floor.js'

const fixture = JSON.parse(readFileSync(new URL('../../project/str/studies/vertical-rc-floor-proof.json', import.meta.url), 'utf8'))
const numerical = fixture.authoredNumericalCase
const house = numerical.monolithicCase.houseCase
const joined = house.joinedCase
const floorFields = ['cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw', 'edgeBand', 'maxPitchMm', 'boundaryCase', 'receivingLaws', 'use']
const portalFields = ['frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm']
const contactFields = ['geometry', 'portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder', 'portalDPCNormalSubdivisions', 'portalDPCInsetMm']

function stages() {
  return {
    distributedFloor: { ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), edits: joined.floor.componentCase.edits },
    verticalRcFloor: { ...Object.fromEntries(contactFields.map(key => [key, joined[key]])),
      portal: Object.fromEntries(portalFields.map(key => [key, joined.portal[key]])),
      caseId: 'VERTICAL-GRAVITY-OWNER-CONTROL', coreAxialWidthMm: house.coreAxialWidthMm,
      northUpstandWidthMm: house.northUpstandWidthMm, physicalGFactor: house.boundary.physicalGFactor,
      includeExternalGMAXQ: house.boundary.includeExternalGMAXQ,
      ...Object.fromEntries(['plateLaw', 'bearingLaw', 'maxPitchMm', 'bearingQuadratureOrder', 'freshUniformLiveKPa'].map(key => [key, numerical[key]])) },
  }
}

function vertical(bundle: { readonly engineering: object }) {
  const value = Reflect.get(bundle.engineering, 'verticalRcFloor') as ReturnType<typeof runVerticalRcFloorCase> | undefined
  assert.ok(value, 'The saved current design must actually execute the verticalRcFloor consumer')
  return value
}

const maximumHeadDelta = (a: ReturnType<typeof runVerticalRcFloorCase>, b: ReturnType<typeof runVerticalRcFloorCase>) => {
  const before = new Map(a.native.heads.map(head => [head.id, head.reactionKN_KNm]))
  return Math.max(...b.native.heads.flatMap(head => head.reactionKN_KNm.map((value, axis) => Math.abs(value - before.get(head.id)![axis]!))))
}

test('one saved physical opening changes vertical plate mass, all-head response and drawing, then reverses without a second floor', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...source, stages: stages() }
  const baselineBundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const edited = JSON.parse(JSON.stringify(document))
  edited.stages.distributedFloor.edits.floorApertures = [{ id: 'FLOOR-APERTURE/plant-riser',
    shape: { kind: 'rectangle', boundsXYMm: [9240, 4760, 9905, 5305] } }]
  const changedBundle = await compileEngineeringDocument(edited)
  const baseline = vertical(baselineBundle)
  const changed = vertical(changedBundle)
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 48 * 1024 * 1024,
  }))
  const cliResult = vertical(cli)
  assert.equal(cliResult.source.caseDigest, changed.source.caseDigest)
  assert.equal(cliResult.floorSvg, changed.floorSvg)
  assert.ok(maximumHeadDelta(cliResult, changed) < 1e-7)
  assert.equal(baseline.native.heads.length, 52)
  assert.equal((baseline.native.pressureBoundary as { nativeWind: { windIndex: number } }).nativeWind.windIndex, 31)
  assert.ok(baseline.native.equilibriumResidualKN_KNm.every(value => Math.abs(value) < 1e-6))
  assert.ok(Math.abs(baseline.mass.newPlatePhysicalSelfGKN - 493.79690625) < 1e-7)
  assert.ok(Math.abs(changed.mass.newPlatePhysicalSelfGKN - baseline.mass.newPlatePhysicalSelfGKN + .545) < 1e-7)
  assert.ok(maximumHeadDelta(baseline, changed) > 1)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.notEqual(changed.source.caseDigest, baseline.source.caseDigest)
  assert.equal(baseline.evidence.floorGravityAccepted, false)
  assert.equal(baseline.evidence.candidateAccepted, false)
  assert.equal(baseline.evidence.completeHouseProof, false)
  assert.equal(baseline.unresolvedReceivingPorts.length, 28)
  assert.ok(Math.abs(baseline.missingGroundContactAreaMm2 - 10506.25) < 1e-6)
  assert.deepEqual(changed.authoredFloorEdits, edited.stages.distributedFloor.edits)
  const manifest = changedBundle.manifest.find(row => row.stage === 'verticalRcFloor')
  assert.ok(manifest?.dependsOn.includes('distributedFloor'))
  assert.equal(changedBundle.manifest.find(row => row.stage === 'distributedFloor')?.applicability?.controllingStage, 'verticalRcFloor')
  assert.deepEqual(changedBundle.plans, baselineBundle.plans)
  assert.deepEqual(changedBundle.selectedWaterEvent, baselineBundle.selectedWaterEvent)
  edited.stages.distributedFloor.edits = JSON.parse(JSON.stringify(document.stages.distributedFloor.edits))
  const restored = vertical(await compileEngineeringDocument(edited))
  assert.ok(maximumHeadDelta(baseline, restored) < 1e-7)
  assert.equal(restored.mass.newPlatePhysicalSelfGKN, baseline.mass.newPlatePhysicalSelfGKN)
  assert.equal(restored.source.caseDigest, baseline.source.caseDigest)
})

test('vertical stage rejects unsupported thickness, second floor, source/result injection and stale current bindings', async () => {
  const resolved = readCurrentDesignResolution()
  const request = readVerticalRcFloorCase(resolved)
  const control = stages()
  const shared = { ...request.vertical.comparison.monolithicCase.houseCase.joinedCase.floor,
    ...Object.fromEntries(floorFields.map(key => [key, joined.floor[key]])), componentCase: joined.floor.componentCase }
  assert.throws(() => savedVerticalRcFloorCase(request.vertical, control.verticalRcFloor, undefined), /sole shared distributed-floor/)
  assert.throws(() => savedVerticalRcFloorCase(request.vertical, { ...control.verticalRcFloor, floor: shared }, shared), /another floor/)
  assert.throws(() => savedVerticalRcFloorCase(request.vertical, { ...control.verticalRcFloor, monolithicCase: numerical.monolithicCase }, shared), /bound case/)
  assert.throws(() => savedVerticalRcFloorCase(request.vertical, control.verticalRcFloor, { ...shared, sourceSHA256: {} }), /derived floor\/component source identities/)
  assert.throws(() => runVerticalRcFloorCase(resolved, { ...request.vertical, bindingDigest: 'stale' }), /Stale vertical RC floor/)
  assert.throws(() => runVerticalRcFloorCase(resolved, { ...request.vertical, accepted: true }), /without derived sources, results or approval/)
  assert.throws(() => runVerticalRcFloorCase(resolved, { ...request.vertical,
    comparison: { ...request.vertical.comparison, sourceSHA256: {} } }), /nested schemas, sources or inject results/)
  const missing = { ...resolved, disciplineBindings: resolved.disciplineBindings.map(binding => binding.id !== 'str-vertical-floor-comparison' ? binding : {
    ...binding, identities: Object.fromEntries(Object.entries(binding.identities).filter(([path]) => !path.endsWith('/vertical_floor_plate.py'))) }) }
  assert.throws(() => readVerticalRcFloorCase(missing), /Stale or missing current vertical RC floor/)
  const independent = { ...resolved, disciplineBindings: resolved.disciplineBindings.filter(binding => binding.id === 'str-vertical-floor-comparison') }
  assert.doesNotThrow(() => readVerticalRcFloorCase(independent))
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { verticalRcFloor: control.verticalRcFloor } }), /sole shared distributed-floor/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: control, bindings: { ...source.bindings, implementations: {} } }), /Stale engineering/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { ...control,
    verticalRcFloor: { ...control.verticalRcFloor, floor: shared } } }), /Unknown vertical RC floor/)
  const unsupported = { ...control, verticalRcFloor: { ...control.verticalRcFloor, plateLaw: { ...numerical.plateLaw, thicknessMm: 250 } } }
  await assert.rejects(compileEngineeringDocument({ ...source, stages: unsupported }), /ActualRC200 source floor required/)
})
