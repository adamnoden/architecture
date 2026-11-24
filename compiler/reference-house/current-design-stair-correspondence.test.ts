import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { layoutRevision } from './georgian/layout-revision.js'
import { compareStairFootprints, type SourceStairFootprint } from './current-design/stair-correspondence.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from './current-design/compile.js'
import { compileEngineeringDocument } from './current-design/engineering-document.js'
import { readEditorEngineeringDocument, runEditorEngineeringRequest } from '../../project/ade/browser-editor/engineering-api.js'
import { beginEngineeringEdit, engineeringTicket } from './current-design/engineering-edit.js'

const repository = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, repository))
const source = (path: string) => {
  const bytes = read(path)
  return { path, gitBlob: createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') }
}
const model = JSON.parse(read('project/had/studies/water-replan.json').toString()).model
const nominal: SourceStairFootprint = { objectId: 'RH-LAYOUT-REVISION-02/return-stair',
  source: source('compiler/reference-house/georgian/layout-revision.ts'), units: 'mm', datum: 'shell-south-west/source-ground-floor',
  footprintXYWHMm: [layoutRevision.stair.x, layoutRevision.stair.y, layoutRevision.stair.width, layoutRevision.stair.length],
  floorDatumsMm: [layoutRevision.levels.ground, layoutRevision.levels.first] }
const selected: SourceStairFootprint = { objectId: 'HAD/selected-house/return-stair',
  source: source('project/had/studies/water-replan.json'), units: 'mm', datum: 'shell-south-west/source-ground-floor',
  footprintXYWHMm: model.stair, floorDatumsMm: [model.sections.groundFFL, model.sections.firstFFL] }

test('actual source footprints expose the 600mm northward split without adopting or translating either stair', () => {
  const result = compareStairFootprints(nominal, selected)
  assert.equal(result.status, 'different-source-geometry')
  assert.deepEqual(result.deltaXYWHMm, [0, 600, 0, 0])
  assert.deepEqual(result.floorDatumDeltaMm, [0, 0])
  assert.deepEqual(result.nominal.footprintXYWHMm, [417.5, 3832.5, 2400, 4335])
  assert.deepEqual(result.selected.footprintXYWHMm, [417.5, 4432.5, 2400, 4335])
  assert.equal(result.diagnostics[0]?.code, 'STAIR_PLAN_SOURCE_SPLIT')
  assert.ok(Object.values(result.evidence).every(value => value === false))
})

test('a footprint edit recomputes correspondence, reversal restores it and matching controls stay unchanged', () => {
  const before = JSON.stringify({ nominal, selected })
  const changed = { ...selected, footprintXYWHMm: selected.footprintXYWHMm.map((value, i) => value + (i === 1 ? 100 : 0)) }
  assert.deepEqual(compareStairFootprints(nominal, changed).deltaXYWHMm, [0, 700, 0, 0])
  assert.deepEqual(compareStairFootprints(nominal, selected).deltaXYWHMm, [0, 600, 0, 0])
  const matching = compareStairFootprints(nominal, { ...selected, footprintXYWHMm: [...nominal.footprintXYWHMm] })
  assert.equal(matching.status, 'matching-source-geometry')
  assert.deepEqual(matching.diagnostics, [])
  assert.equal(JSON.stringify({ nominal, selected }), before)
})

test('unbound sources, incompatible units or datums and malformed geometry cannot manufacture correspondence', () => {
  for (const change of [{ source: { ...selected.source, gitBlob: '' } }, { units: 'cm' }, { datum: 'unknown-local-origin' },
    { footprintXYWHMm: [417.5, NaN, 2400, 4335] }, { footprintXYWHMm: [417.5, 4432.5, -2400, 4335] },
    { floorDatumsMm: [] }, { floorDatumsMm: [0, 0] }, { footprintXYWHMm: undefined }]) {
    const result = compareStairFootprints(nominal, { ...selected, ...change } as SourceStairFootprint)
    assert.equal(result.status, 'unsupported-correspondence')
    assert.equal(result.deltaXYWHMm, null)
    assert.equal(result.diagnostics[0]?.code, 'STAIR_SOURCE_CORRESPONDENCE_UNSUPPORTED')
  }
  assert.equal(compareStairFootprints(nominal, null as unknown as SourceStairFootprint).status, 'unsupported-correspondence')
  const differentLevels = compareStairFootprints(nominal, { ...selected, footprintXYWHMm: nominal.footprintXYWHMm, floorDatumsMm: [1000, 4450] })
  assert.equal(differentLevels.status, 'different-source-geometry')
  assert.deepEqual(differentLevels.floorDatumDeltaMm, [1000, 1000])
})

test('shared bundle and engineering HTTP adapter expose the split while retaining nominal drawings and exact HAD schedule', async () => {
  const bundle = await compileCurrentDesignBundle(readGeorgianDesignSnapshot())
  assert.equal(bundle.stairCorrespondence?.status, 'different-source-geometry')
  assert.deepEqual(bundle.stairCorrespondence?.selected, selected)
  assert.equal(bundle.occupiedServices.status, 'compiled')
  if (bundle.occupiedServices.status !== 'compiled') return
  assert.equal(bundle.occupiedServices.schedule, read('project/had/studies/current-house-services.json').toString())
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const [schedule, drawings] = await Promise.all([compile.occupiedServices(), compile.occupiedServiceDrawings()])
  for (const output of [schedule, drawings]) {
    assert.equal(output.applicability.state, 'selected-reference', 'Retain the actual HAD selection, distinct from exact nominal-plan applicability')
    assert.equal(output.applicability.nominalPlanApplicability.state, 'withheld-for-source-correspondence')
    assert.equal(output.applicability.nominalPlanApplicability.diagnostics[0]?.code, 'STAIR_PLAN_SOURCE_SPLIT')
    assert.equal(output.source.scope.includes('exact accepted Georgian plan basis only'), false)
    assert.deepEqual(output.stairCorrespondence, bundle.stairCorrespondence)
  }
  const document = await readEditorEngineeringDocument()
  const engineering = await compileEngineeringDocument(document)
  assert.deepEqual(engineering.plans, bundle.plans)
  assert.deepEqual(engineering.stairCorrespondence, bundle.stairCorrespondence)
  assert.equal(engineering.manifest.find(row => row.stage === 'plans')?.applicability, undefined)
  assert.equal(engineering.manifest.find(row => row.stage === 'occupiedServices')?.applicability?.controllingStage, 'stairCorrespondence')
  const water = engineering.manifest.find(row => row.stage === 'selectedWaterEvent')!
  assert.equal(water.applicability?.controllingStage, 'stairCorrespondence')
  assert.ok(engineering.manifest.find(row => row.stage === 'stairCorrespondence')?.dependsOn.includes('occupiedServices'))
  assert.ok(!engineering.manifest.find(row => row.stage === 'occupiedServices')?.dependsOn.includes('stairCorrespondence'), 'Correspondence gate must not create a computation cycle')
  const state = beginEngineeringEdit(JSON.parse(JSON.stringify(document)), 'stair-correspondence')
  const reply = await runEditorEngineeringRequest({ ticket: engineeringTicket(state, 'source-check') })
  assert.ok(reply.coordinationDiagnostics.some(row => row.code === 'STAIR_PLAN_SOURCE_SPLIT' && row.message.includes('[0,600,0,0]')))
  assert.deepEqual(reply.manifest, engineering.manifest)
})
