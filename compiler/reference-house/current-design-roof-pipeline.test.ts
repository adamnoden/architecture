import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

test('saved roof pitch recomputes native geometry, slate stock and drawing while withholding dependent roof claims', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  assert.equal(source.stages.roofPitch.pitchDeg, 25)
  const document = { ...source, stages: { roofPitch: source.stages.roofPitch } }
  const before = await compileEngineeringDocument(document)
  const edited = { ...document, stages: { roofPitch: { pitchDeg: 27 } } }
  const after = await compileEngineeringDocument(JSON.parse(JSON.stringify(edited)))
  const baseline = before.engineering.roofPitch
  const changed = after.engineering.roofPitch
  assert.ok(baseline && changed)
  assert.deepEqual([baseline.schedule.fieldSectionQZMm[2][1], changed.schedule.fieldSectionQZMm[2][1]]
    .map(z => Number(z.toFixed(2))), [8409.33, 8501.16])
  assert.deepEqual([baseline.schedule.slateStockComparisons.severe.court.rowsPerFace,
    changed.schedule.slateStockComparisons.severe.court.rowsPerFace], [12, 13])
  assert.notEqual(renderDrawingSceneV2Svg(baseline.drawing), renderDrawingSceneV2Svg(changed.drawing))
  assert.equal(changed.evidence.state, 'withheld-for-pitch-change')
  assert.ok(changed.evidence.state === 'withheld-for-pitch-change'
    && changed.evidence.invalidated.includes('STR roof actions and stiffness'))
  assert.deepEqual(after.plans, before.plans)
  assert.deepEqual(after.selectedWaterEvent, before.selectedWaterEvent)
  assert.equal(before.manifest.find(row => row.stage === 'selectedWaterEvent')?.applicability, undefined)
  assert.equal(after.manifest.find(row => row.stage === 'selectedWaterEvent')?.applicability?.state, 'withheld-for-stage-change')
  assert.ok(after.manifest.find(row => row.stage === 'selectedWaterEvent')?.dependsOn.includes('roofPitch'))
  assert.equal(changed.schedule.planCatchmentM2, baseline.schedule.planCatchmentM2)
  assert.notEqual(after.documentIdentity.digest, before.documentIdentity.digest)
  assert.deepEqual(after.manifest.find(row => row.stage === 'roofPitch')?.controls, ['stages.roofPitch.pitchDeg'])
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  }))
  assert.deepEqual(cli.engineering.roofPitch, JSON.parse(JSON.stringify(changed)))
  const reversed = await compileEngineeringDocument({ ...edited, stages: document.stages })
  assert.deepEqual(reversed.engineering.roofPitch, baseline)
  assert.equal(reversed.documentIdentity.digest, before.documentIdentity.digest)
})

test('saved roof edits reject absent pitch, unsupported geometry, injected evidence and stale native methods', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  for (const roofPitch of [{}, { pitchDeg: 15 }, { pitchDeg: null }, { pitchDeg: 25, approved: true },
    { pitchDeg: 25, wallWeatherLineMm: 6800 }]) {
    await assert.rejects(compileEngineeringDocument({ ...source, stages: { roofPitch } }),
      /authored pitch|at least 25|Unknown roof pitch/)
  }
  const stale = { ...source, stages: { roofPitch: source.stages.roofPitch }, bindings: { ...source.bindings,
    implementations: { ...source.bindings.implementations, 'project/mat/studies/ring-roof-pitch-case.py': '0'.repeat(40) } } }
  await assert.rejects(compileEngineeringDocument(stale), /Stale engineering source/)
})
