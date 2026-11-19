import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

async function linkedDocument() {
  const document = await readEngineeringDocument(readGeorgianDesignSnapshot())
  return { ...document, stages: {
    northCollector: { ...document.stages.northCollector, portStrategy: 'linked-west-foul-route',
      remoteMainBarShiftMm: 0, chordBendRadiusMm: 140 },
    rearFoulVent: { ...document.stages.rearFoulVent, buriedReceiving: {
      hostAxisXYZMm: [-450, 11177.5, -2530], stackGradeZMm: -1800, hostGradeZMm: -1800,
    } },
  } }
}

test('a saved west route drives an intact collector candidate and preserves its source reservation', async () => {
  const document = await linkedDocument()
  const result = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const collector = result.engineering.northCollector
  const route = result.engineering.rearFoulVent
  assert.ok(collector?.status === 'computed-comparison' && route?.status === 'computed-comparison')
  assert.ok(collector.serviceDependency)
  assert.equal(collector.serviceDependency.source.caseDigest, route.source.caseDigest)
  assert.equal(collector.serviceDependency.canonicalSourcePortRetained, true)
  assert.equal(collector.serviceDependency.installedAcceptance, false)
  assert.equal(collector.comparison.retainedNWPort.state, 'omitted-in-linked-candidate')
  assert.equal(collector.stationCapacity.state, 'not-applicable-no-floor-port')
  assert.equal(collector.cabinetStationCapacity.state, 'not-applicable-no-floor-port')
  assert.ok(Math.abs(collector.serviceDependency.requiredSiteEnvelope.maximumHostAxisZMm + 2524.595447) < 1e-5)
  assert.ok(collector.serviceDependency.adoptionConditions.some(condition => condition.includes('site host levels')))
  assert.ok(result.manifest.find(entry => entry.stage === 'northCollector')?.dependsOn.includes('rearFoulVent'))
  const stageOrder = result.manifest.map(entry => entry.stage)
  assert.ok(stageOrder.indexOf('rearFoulVent') < stageOrder.indexOf('northCollector'))
  assert.deepEqual(document.design, readGeorgianDesignSnapshot())
  assert.deepEqual(result.plans.source, { id: document.design.source.id, planDigest: result.documentIdentity.planDigest })
  const command = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  })
  assert.equal(command.status, 0, command.stderr)
  assert.deepEqual(JSON.parse(command.stdout), JSON.parse(JSON.stringify(result)))
})

test('a missing, shallow or low-cover saved route cannot create the intact collector candidate', async () => {
  const document = await linkedDocument()
  await assert.rejects(compileEngineeringDocument({ ...document,
    stages: { northCollector: document.stages.northCollector } }), /explicit saved west foul vent stage/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    rearFoulVent: { ...document.stages.rearFoulVent, buriedReceiving: {
      ...document.stages.rearFoulVent.buriedReceiving, hostAxisXYZMm: [-450, 11177.5, -2480],
    } } } }), /fails its dry, terminal or buried receiving geometry/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { ...document.stages,
    rearFoulVent: { ...document.stages.rearFoulVent, buriedReceiving: {
      ...document.stages.rearFoulVent.buriedReceiving, interiorGrade: [{ distanceFromStackMm: 1000, gradeZMm: -1860 }],
    } } } }), /fails its dry, terminal or buried receiving geometry/)
})
