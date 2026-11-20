import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

type FloorGeometry = {
  east: { invertEndsMm: number[]; section: { pressureLidTopMm: number; boltToThermalAfter5Mm: number } }
  north: { waterBedZMm: number[][]; supportSeats: { columnTopMm: number }[] }
  approaches: { front: { riseMm: number; slopingRunMm: number; actualSiteOrRegulatoryAcceptance: false } }
}
const geometry = (value: unknown) => value as FloorGeometry
const cli = (mode: string, input: unknown) => JSON.parse(execFileSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'], {
    input: JSON.stringify(input), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))

async function fixture() {
  const design = readGeorgianDesignSnapshot(), compile = prepareCurrentDesignCompile(design)
  const groundRequest = await compile.readGroundSectionCase()
  const groundCase = { ...groundRequest.ground, caseId: 'saved-service-floor-ground',
    settings: { ...groundRequest.ground.settings, serviceZoneMm: 250 } }
  const ground = await compile.groundSectionCase(groundCase)
  const floorRequest = await compile.readServiceFloorCase(ground)
  const source = await readEngineeringDocument(design)
  const document = { ...source, stages: {
    groundSection: { caseId: groundCase.caseId, settings: groundCase.settings },
    serviceFloor: { caseId: floorRequest.serviceFloor.caseId, settings: floorRequest.serviceFloor.settings },
  } }
  return { compile, source, document, groundRequest: { ...groundRequest, ground: groundCase }, floorCase: floorRequest.serviceFloor }
}

test('one saved ground edit drives the same service floor, support, lid clearances, approaches and CLI consumers', async () => {
  const { compile, document, groundRequest, floorCase } = await fixture()
  assert.equal(Object.hasOwn(document.stages.serviceFloor.settings, 'serviceZoneMm'), false)
  assert.equal(Object.hasOwn(document.stages.serviceFloor.settings, 'accessibleZoneMm'), false)
  assert.ok(document.bindings.implementations['project/had/studies/closed_service_floor.py'])
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const edited = { ...document, stages: { ...document.stages, groundSection: { ...document.stages.groundSection,
    settings: { ...document.stages.groundSection.settings, serviceZoneMm: 270 } } } }
  const after = await compileEngineeringDocument(JSON.parse(JSON.stringify(edited)))
  const a = before.engineering.serviceFloor, b = after.engineering.serviceFloor
  assert.ok(a && b && before.engineering.groundSection && after.engineering.groundSection)
  assert.deepEqual([a.native.levelsMm.ffl, b.native.levelsMm.ffl], [715, 735])
  assert.equal(a.source.groundCaseDigest, before.engineering.groundSection.source.caseDigest)
  assert.equal(b.source.groundCaseDigest, after.engineering.groundSection.source.caseDigest)
  assert.notEqual(a.source.groundResultDigest, b.source.groundResultDigest)
  const old = geometry(a.native), changed = geometry(b.native)
  assert.equal(changed.east.section.boltToThermalAfter5Mm - old.east.section.boltToThermalAfter5Mm, 20)
  assert.equal(changed.north.supportSeats[0].columnTopMm - old.north.supportSeats[0].columnTopMm, 20)
  assert.equal(changed.north.waterBedZMm[0][1] - old.north.waterBedZMm[0][1], 20)
  assert.equal(changed.approaches.front.slopingRunMm - old.approaches.front.slopingRunMm, 400)
  assert.deepEqual(changed.east.invertEndsMm, old.east.invertEndsMm)
  assert.equal(changed.east.section.pressureLidTopMm, old.east.section.pressureLidTopMm)
  assert.notEqual(a.sectionPlanSvg, b.sectionPlanSvg)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  for (const stage of ['occupiedServices', 'selectedWaterEvent']) {
    assert.equal(after.manifest.find(row => row.stage === stage)?.applicability?.controllingStage, 'groundSection')
  }
  const beforeRow = before.manifest.find(row => row.stage === 'serviceFloor'), afterRow = after.manifest.find(row => row.stage === 'serviceFloor')
  assert.ok(afterRow)
  assert.ok(afterRow.dependsOn.includes('groundSection'))
  assert.equal(afterRow.settingsDigest, beforeRow?.settingsDigest)
  assert.notEqual(afterRow.resultDigest, beforeRow?.resultDigest)
  assert.equal(b.native.selectedHouseAdmitted, false)
  assert.equal(b.native.physicalInstallationAdmitted, false)
  assert.equal(b.evidence.installedAcceptance, false)
  assert.ok(b.holds.length >= 6)
  await assert.rejects(compile.serviceFloorCase(floorCase, after.engineering.groundSection), /Stale service-floor/)
  assert.deepEqual(cli('--bundle', edited), JSON.parse(JSON.stringify(after)))
  const request = cli('--read-service-floor', groundRequest)
  assert.equal(request.schema, 'had-grounded-service-floor-request/1')
  assert.deepEqual(request.groundSection, groundRequest.ground)
  assert.equal(Object.hasOwn(request, 'groundResult'), false)
  assert.deepEqual(cli('--service-floor', request), JSON.parse(JSON.stringify(a)))
  assert.throws(() => cli('--service-floor', { ...request, groundSection: { ...request.groundSection,
    settings: { ...request.groundSection.settings, serviceZoneMm: 270 } } }), /Stale service-floor/)
  const reversed = await compileEngineeringDocument(document)
  assert.deepEqual(reversed.engineering.serviceFloor, a)
  assert.equal(reversed.documentIdentity.digest, before.documentIdentity.digest)
})

test('missing ground, second floor authority, approvals and unsupported source stacks cannot enter the saved stage', async () => {
  const { document } = await fixture()
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { serviceFloor: document.stages.serviceFloor } }), /explicit saved groundSection/)
  for (const serviceFloor of [{}, { ...document.stages.serviceFloor, levelsMm: { ffl: 715 } },
    { ...document.stages.serviceFloor, selectedHouseAdmitted: true },
    { ...document.stages.serviceFloor, settings: { ...document.stages.serviceFloor.settings, serviceZoneMm: 250 } },
    { ...document.stages.serviceFloor, settings: { ...document.stages.serviceFloor.settings, accessibleZoneMm: 250 } }]) {
    await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages, serviceFloor } }),
      /Unknown service floor|explicit case ID|only service-floor settings/)
  }
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages, groundSection: {
    ...document.stages.groundSection, settings: { ...document.stages.groundSection.settings, courseBottomMm: 20 },
  } } }), /Unsupported ground-section stack/)
  const shallow = await compileEngineeringDocument({ ...document, stages: { ...document.stages, groundSection: {
    ...document.stages.groundSection, settings: { ...document.stages.groundSection.settings, serviceZoneMm: 65 },
  } } })
  assert.equal(shallow.engineering.serviceFloor?.native.levelsMm.ffl, 530)
  assert.equal(shallow.engineering.serviceFloor?.geometryStatus, 'rejected-numerical-comparison')
  const stale = { ...document, bindings: { ...document.bindings, implementations: { ...document.bindings.implementations,
    'project/had/studies/closed_service_floor.py': '0'.repeat(40) } } }
  await assert.rejects(compileEngineeringDocument(stale), /Stale engineering source/)
})

test('raised ground withholds source water evidence without dropping an independent edited-roof cause', async () => {
  const { document, source } = await fixture()
  const bundle = await compileEngineeringDocument({ ...document, stages: { ...document.stages,
    roofPitch: { pitchDeg: source.stages.roofPitch.pitchDeg + 2 } } })
  const water = bundle.manifest.find(row => row.stage === 'selectedWaterEvent')
  assert.equal(water?.applicability?.controllingStage, 'groundSection')
  assert.ok(water.applicability.additionalControllingStages?.includes('roofPitch'))
  assert.ok(water.dependsOn.includes('roofPitch') && water.dependsOn.includes('groundSection'))
  assert.match(water.applicability.reason, /reference roof/)
  assert.match(water.applicability.reason, /ground-section levels/)
  assert.equal(bundle.evidence.installedAcceptance, false)
})

test('the full saved bundle flags later source-datum inlet and room outputs while leaving recomputed ground and nominal plans free', async () => {
  const { document, source } = await fixture()
  const independent = await compileEngineeringDocument(source)
  const coordinated = await compileEngineeringDocument({ ...source, stages: { ...source.stages, ...document.stages,
    roofPitch: { pitchDeg: source.stages.roofPitch.pitchDeg + 2 } } })
  const affected = ['occupiedServices', 'selectedWaterEvent', 'roofPitch', 'northCollector', 'rearFoulVent',
    'inletSillInsert', 'inletFault', 'fixedInlet', 'studyRoomKit']
  for (const stage of affected) {
    const row = coordinated.manifest.find(value => value.stage === stage)
    assert.ok(row, 'missing actual saved stage ' + stage)
    assert.equal(row.applicability?.controllingStage, 'groundSection')
    assert.ok(row.dependsOn.includes('groundSection'))
    assert.match(row.applicability.reason, /ground-section levels/)
    assert.equal(independent.manifest.find(value => value.stage === stage)?.dependsOn.includes('groundSection'), false)
  }
  for (const stage of ['plans', 'groundSection', 'serviceFloor']) {
    assert.equal(coordinated.manifest.find(value => value.stage === stage)?.applicability, undefined)
  }
  assert.deepEqual(coordinated.plans, independent.plans)
  assert.deepEqual(coordinated.engineering.fixedInlet, independent.engineering.fixedInlet)
  assert.deepEqual(coordinated.engineering.studyRoomKit, independent.engineering.studyRoomKit)
  assert.equal(coordinated.engineering.serviceFloor?.source.groundCaseDigest, coordinated.engineering.groundSection?.source.caseDigest)
  const water = coordinated.manifest.find(value => value.stage === 'selectedWaterEvent')
  assert.ok(water?.applicability?.additionalControllingStages?.includes('roofPitch'))
  const diagnostic = coordinated.coordinationDiagnostics.find(row => row.code === 'GROUND_STAGE_OUTPUTS_NOT_COORDINATED')
  assert.ok(diagnostic?.stages.includes('fixedInlet') && diagnostic.stages.includes('studyRoomKit'))
  assert.equal(coordinated.evidence.installedAcceptance, false)
})
