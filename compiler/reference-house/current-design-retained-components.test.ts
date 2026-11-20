import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const compile = prepareCurrentDesignCompile(design)

test('the current compiler replaces both old retained families and checks every adverse signed state', async () => {
  const request = await compile.readRetainedComponentCase()
  const unresolved = await compile.retainedComponentCase(JSON.parse(JSON.stringify(request.retained)))
  assert.equal(unresolved.native.contact.windCaseCount, 96)
  assert.equal(unresolved.native.contact.candidatePassingCount, 0)
  assert.ok(Math.abs(unresolved.native.replacement.removedTotal[0] - 219.415822537501) < 1e-8)
  assert.equal(unresolved.native.replacement.creditedTotal[0], 0)
  assert.equal(unresolved.native.completeHouseProof, false)
  assert.equal(unresolved.native.installedAcceptance, false)
  const path = {
    id: 'declared-floor-and-clear-wall-comparison', state: 'declared-comparison',
    routeDescription: 'Candidate diaphragm and aligned walls; material bounds, actual continuity and connection capacities remain unproved.',
    sourceRefs: request.retained.componentCase.sourceSHA256,
    componentDigests: Object.fromEntries(unresolved.native.components.components.map(component => [component.id, component.componentDigest])),
  }
  const declaredCase = { ...request.retained, componentCase: { ...request.retained.componentCase, retentionPaths: [path] } }
  const declared = await compile.retainedComponentCase(declaredCase)
  assert.equal(declared.native.contact.candidatePassingCount, 96)
  assert.equal(declared.native.contact.cases.flatMap(row => row.adverseCandidates).length, 384)
  assert.ok(declared.native.contact.cases.every(row => row.adverseCandidates.every(vertex => vertex.contact.passesNecessaryVerticalCondition)))
  assert.ok(Math.abs(declared.native.replacement.creditedTotal[0] - 397.738503111748) < 1e-8)
  assert.ok(declared.native.components.components.filter(component => component.kind === 'ground-slab').every(component => component.creditedWeightKN === 0))
  assert.match(declared.planSvg, /data-role="non-RC-reservation"/)
  assert.match(declared.planSvg, /<circle[^>]+data-aperture="FLOOR-APERTURE\/rear-soil"/)
  assert.deepEqual(await compile.retainedComponentCase(JSON.parse(JSON.stringify(declaredCase))), declared)

  const editedCase = { ...declaredCase, componentCase: { ...declaredCase.componentCase,
    edits: { floorApertures: [{ id: 'FLOOR-APERTURE/rear-soil',
      shape: { kind: 'circle', centreXYMm: [687.5, 11177.5], diameterMm: 200 } }], wallOpenings: [] } } }
  const edited = await compile.retainedComponentCase(editedCase)
  const component = (result: typeof declared, id: string) => result.native.components.components.find(component => component.id === id)!
  const originalPart = component(declared, 'FF/FIELD/NW-W')
  const changedPart = component(edited, 'FF/FIELD/NW-W')
  assert.notEqual(changedPart.geometry.netAreaM2, originalPart.geometry.netAreaM2)
  assert.notDeepEqual(changedPart.geometry.centroidXYMm, originalPart.geometry.centroidXYMm)
  assert.equal(changedPart.creditedWeightKN, 0)
  assert.ok(changedPart.retention.reasons.includes('RETENTION_PATH_EVIDENCE_STALE'))
  assert.ok(edited.diagnostics.some(diagnostic => diagnostic.code === 'RETAINED_APERTURE_SERVICES_RECHECK'
    && diagnostic.state === 'stale-for-edited-candidate' && diagnostic.objects.some(object => object.id === 'FLOOR-APERTURE/rear-soil')))
  assert.deepEqual(component(edited, 'FF/FIELD/SE-front'), component(declared, 'FF/FIELD/SE-front'))
  assert.deepEqual(component(edited, 'WALL/FULL-HEIGHT/outer-south'), component(declared, 'WALL/FULL-HEIGHT/outer-south'))
  const circle = (svg: string) => svg.match(/<circle[^>]+data-aperture="FLOOR-APERTURE\/rear-soil"[^>]*\/>/)![0]
  assert.match(circle(declared.planSvg), /r="0.8"/)
  assert.match(circle(edited.planSvg), /r="1"/)
  assert.notEqual(edited.native.contact.cases[0].candidateN_Xfirst_Yfirst[0], declared.native.contact.cases[0].candidateN_Xfirst_Yfirst[0])
  const refreshedCase = { ...editedCase, componentCase: { ...editedCase.componentCase, retentionPaths: [{ ...path,
    componentDigests: { ...path.componentDigests, [changedPart.id]: changedPart.componentDigest } }] } }
  const refreshed = await compile.retainedComponentCase(refreshedCase)
  const areaDelta = originalPart.geometry.netAreaM2! - changedPart.geometry.netAreaM2!
  assert.ok(Math.abs(declared.native.replacement.creditedTotal[0] - refreshed.native.replacement.creditedTotal[0] - areaDelta * .9 * .190 * 23) < 1e-8)
  await assert.rejects(compile.retainedComponentCase({ ...request.retained, originAccount: declared.native }), /explicit retained-component contact case/)
  await assert.rejects(compile.retainedComponentCase({ ...request.retained, bindingDigest: 'stale' }), /Stale/)
  await assert.rejects(compile.retainedComponentCase({ ...request.retained, componentCase: { ...request.retained.componentCase,
    sourceSHA256: { ...request.retained.componentCase.sourceSHA256, 'project/str/studies/retained_component_geometry.py': '0'.repeat(64) } } }), /retained-component source identity/)
})

test('the saved engineering document and real CLI consume the same retained-component stage', async () => {
  const source = await readEngineeringDocument(design)
  const request = await compile.readRetainedComponentCase()
  const document = { ...source, stages: { retainedComponents: { cutZMm: request.retained.cutZMm, roofRiseMm: 0,
    edits: request.retained.componentCase.edits, retentionPaths: [] } } }
  const before = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const changed = { ...document, stages: { retainedComponents: { ...document.stages.retainedComponents, roofRiseMm: 100 } } }
  const after = await compileEngineeringDocument(changed)
  assert.equal(before.engineering.retainedComponents?.native.contact.windCaseCount, 96)
  assert.notDeepEqual(after.engineering.retainedComponents?.native.contact.cases, before.engineering.retainedComponents?.native.contact.cases)
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.occupiedServices, before.occupiedServices)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.deepEqual(after.manifest.filter(entry => entry.stage !== 'retainedComponents'), before.manifest.filter(entry => entry.stage !== 'retainedComponents'))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(document), encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }))
  assert.deepEqual(cli, JSON.parse(JSON.stringify(before)))
  const helper = 'project/str/studies/retained_component_geometry.py'
  assert.ok(Object.hasOwn(source.bindings.implementations, helper))
  const stale = JSON.parse(JSON.stringify(document))
  stale.bindings.implementations[helper] = '0'.repeat(40)
  await assert.rejects(compileEngineeringDocument(stale), /Stale engineering source or implementation/)
  await assert.rejects(compileEngineeringDocument({ ...document, stages: { retainedComponents: { ...document.stages.retainedComponents,
    originAccount: {} } } }), /Unknown retained components engineering setting/)
  const bodies = source.bindings.implementations
  assert.ok(Object.keys(bodies).some(path => path.endsWith('structural-retained.ts')))
})
