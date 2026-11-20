import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readJoinedRcFloorCase } from './current-design/structural-rc-floor.js'

type Numerical = Record<string, unknown> & { portal: Record<string, unknown>;
  floor: Record<string, unknown> & { componentCase: { edits: unknown } } }
const fixture = JSON.parse(readFileSync(
  new URL('../../project/str/studies/monolithic-rc-native31-request.json', import.meta.url), 'utf8'))
const numerical = fixture.case.houseCase.joinedCase as Numerical

function stages() {
  const portalFields = ['gridLaw', 'frameLaw', 'dpcLaw', 'dpcIntervalZMm', 'coverMm', 'archSegments', 'infillHeadGapMm']
  const floorFields = ['cornerWidthsMm', 'memberLaw', 'jointLaw', 'membraneLaw', 'edgeBand', 'maxPitchMm']
  const contactFields = ['geometry', 'portalDPCNormalMode', 'portalDPCNormalIntegration', 'portalDPCQuadratureOrder',
    'portalDPCNormalSubdivisions', 'portalDPCInsetMm']
  return {
    distributedFloor: { ...Object.fromEntries(floorFields.map(key => [key, numerical.floor[key]])),
      edits: numerical.floor.componentCase.edits },
    joinedRcFloor: { ...Object.fromEntries(contactFields.map(key => [key, numerical[key]])),
      portal: Object.fromEntries(portalFields.map(key => [key, numerical.portal[key]])),
      caseId: fixture.name, coreAxialWidthMm: 290, northUpstandWidthMm: 200,
      physicalGFactor: .9, includeExternalGMAXQ: false },
  }
}

test('one saved floor aperture controls both the existing floor and actual joined portal/head/drawing calculations', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document = { ...source, stages: stages() }
  const before = await compileEngineeringDocument(document)
  const edited = { ...document, stages: { ...document.stages, distributedFloor: { ...document.stages.distributedFloor,
    edits: { floorApertures: [{ id: 'FLOOR-APERTURE/plant-riser',
      shape: { kind: 'rectangle', boundsXYMm: [9240, 4760, 9905, 5305] } }], wallOpenings: [] } } } }
  const after = await compileEngineeringDocument(JSON.parse(JSON.stringify(edited)))
  const baseline = before.engineering.joinedRcFloor
  const changed = after.engineering.joinedRcFloor
  assert.ok(baseline && changed)
  assert.equal(baseline.native.heads.length, 52)
  assert.ok(baseline.native.equilibriumResidualKN_KNm.every(value => Math.abs(value) < .000001))
  assert.deepEqual(baseline.native.portalNormalContactResults, [])
  assert.equal(baseline.native.contactIntegrationStatus, 'not-applicable-finite-RC-continuity')
  assert.equal(baseline.native.monolithicRCBridgeMembers.length, 4)
  assert.equal(baseline.native.barrierDuties.length, 4)
  assert.match(baseline.barrierSvg, /waterstop|waterstop|WATERSTOP/)
  assert.equal(baseline.evidence.completeHouseProof, false)
  assert.equal(baseline.evidence.candidateAccepted, false)
  assert.equal(baseline.unresolvedReceivingPorts.length, 28)
  assert.notEqual(changed.floor.triangleCount, baseline.floor.triangleCount)
  assert.notDeepEqual(changed.native.heads, baseline.native.heads)
  assert.notEqual(changed.floorSvg, baseline.floorSvg)
  assert.notDeepEqual(after.engineering.distributedFloor?.native.heads, before.engineering.distributedFloor?.native.heads)
  assert.notEqual(changed.schedule.physicalGKN, baseline.schedule.physicalGKN)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.ok(after.manifest.find(row => row.stage === 'joinedRcFloor')?.dependsOn.includes('distributedFloor'))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli.engineering.joinedRcFloor, JSON.parse(JSON.stringify(changed)))
})

test('joined saved cases reject a second floor authority, injected sources, missing shared floor and stale bindings', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  const controls = stages()
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { joinedRcFloor: controls.joinedRcFloor } }),
    /explicit shared distributed-floor stage/)
  await assert.rejects(compileEngineeringDocument({ ...source, stages: {
    joinedRcFloor: { ...controls.joinedRcFloor, floor: numerical.floor } } }), /Unknown joined RC floor/)
  const compile = prepareCurrentDesignCompile(source.design)
  const request = await compile.readJoinedRcFloorCase()
  await assert.rejects(compile.joinedRcFloorCase({ ...request.joined, bindingDigest: 'stale' }), /Stale joined RC floor/)
  await assert.rejects(compile.joinedRcFloorCase({ ...request.joined, comparison: { ...request.joined.comparison, houseCase: { ...request.joined.comparison.houseCase,
      joinedCase: { ...request.joined.comparison.houseCase.joinedCase, portal: { ...numerical.portal, sourceSHA256: {} } } } } }), /nested source identities/)
  await assert.rejects(compile.joinedRcFloorCase({ ...request.joined, approved: true }), /without derived sources or approvals/)
  const resolved = readCurrentDesignResolution()
  const missing = { ...resolved, disciplineBindings: resolved.disciplineBindings.map(binding => ({ ...binding,
    identities: Object.fromEntries(Object.entries(binding.identities).filter(([path]) => !path.endsWith('/rc_portal_monolithic.py'))) })) }
  assert.throws(() => readJoinedRcFloorCase(missing), /Stale or missing current joined RC floor source/)
  const stale = { ...source, stages: controls, bindings: { ...source.bindings,
    implementations: { ...source.bindings.implementations, 'compiler/reference-house/current-design/structural-rc-floor.ts': '0'.repeat(40) } } }
  await assert.rejects(compileEngineeringDocument(stale), /Stale engineering source/)
})
