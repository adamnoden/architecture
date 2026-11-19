import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { compileStudyAssembly } from './current-design/assemblies/study-floor.js'
import { drawStudyFloorPlan, drawStudyFloorSection } from './current-design/assemblies/study-floor-views.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const source = readGeorgianDesignSnapshot()
const read = (path: string) => readFileSync(new URL('../../' + path, import.meta.url))

test('the exact current basis binds native occupied Study receipts and reproduces their schedule', () => {
  const baseline = compileStudyAssembly(source)
  const native = JSON.parse(read(baseline.source.floor.path).toString('utf8'))
  const expected = native.moduleStudy.options.find((entry: { pitch: number }) => entry.pitch === baseline.grid.pitchMm)
  assert.deepEqual(baseline.grid.bands, native.study.bands)
  assert.deepEqual(baseline.grid.occupied, native.study.occupied)
  assert.equal(baseline.source.occupiedHouse, native.source.id)
  assert.equal(baseline.source.roomId, 'GROUND/G-STUDY')
  assert.equal(baseline.schedule.wholeTiles, expected.whole)
  assert.equal(baseline.schedule.wholeTilesClearOfShownFurniture, expected.unobstructed)
  assert.equal(baseline.schedule.clippedCells, expected.perimeterCutCells)
  assert.equal(new Set(baseline.grid.occurrences.map(row => row.id)).size, baseline.grid.occurrences.length)
  assert.equal(baseline.schedule.clearTileSideMm, 397)
  assert.equal(baseline.schedule.completeTileWearFaceMassKg, 1.9858734)
  assert.equal(baseline.section.rcTop, -180)
})

test('a real IAS pitch edit changes the room grid, schedule and section while withholding the fixed bridge', () => {
  const base = compileStudyAssembly(source)
  const changed = compileStudyAssembly(source, { pitchMm: 450 })
  assert.deepEqual(changed.source, base.source)
  assert.deepEqual(changed.grid.occupied, base.grid.occupied)
  assert.deepEqual([changed.schedule.wholeTiles, changed.schedule.wholeTilesClearOfShownFurniture, changed.schedule.clippedCells], [31, 14, 32])
  assert.equal(changed.schedule.clearTileSideMm, 447)
  assert.equal(changed.schedule.completeTileWearFaceMassKg, 2.5175934)
  assert.deepEqual(changed.release, { state: 'unresolved', code: 'FIXED_BRIDGE_PITCH', referencePitchMm: 400 })
  const common = base.grid.occurrences.find(cell => cell.full && changed.grid.occurrences.some(next => next.id === cell.id && next.full))
  assert.ok(common)
  const primitiveId = `${common.id}/part/0`
  for (const [model, width] of [[base, 16], [changed, 18]] as const) {
    const plan = drawStudyFloorPlan(model)
    const cell = plan.primitives.find(primitive => primitive.id === primitiveId)
    assert.ok(cell?.kind === 'rect')
    assert.equal(cell.width, width)
    assert.match(renderDrawingSceneV2Svg(plan), /<svg/)
  }
  const first = drawStudyFloorSection(base).primitives.find(mark => mark.id === 'one-complete-wearing-face')
  const next = drawStudyFloorSection(changed).primitives.find(mark => mark.id === 'one-complete-wearing-face')
  assert.ok(first?.kind === 'rect' && next?.kind === 'rect')
  assert.equal(next.width - first.width, 10)
})

test('the service skirting is drawn at its source-owned depth and conflicts with the same fixed shoe', () => {
  const base = compileStudyAssembly(source)
  const changed = compileStudyAssembly(source, { skirting: 'service' })
  assert.deepEqual(changed.schedule, base.schedule)
  assert.equal(changed.section.skirting.id, base.section.skirting.id)
  assert.equal(changed.section.skirting.projectionMm, 45)
  assert.equal(changed.section.skirting.serviceCoverMm, 18)
  assert.deepEqual(base.release, {
    state: 'geometry-only', code: 'SOUTH_BRIDGE_SHOE', shoeClearanceMm: 2.5, settingMm: 5, shoeExtentMm: [25.5, 55.5],
  })
  assert.deepEqual(changed.release, { ...base.release, state: 'conflict', shoeClearanceMm: -24.5 })
  const scene = drawStudyFloorSection(changed)
  const skirting = scene.primitives.find(mark => mark.id === changed.section.skirting.id)
  assert.ok(skirting?.kind === 'rect')
  assert.equal(skirting.width, 9)
  assert.match(renderDrawingSceneV2Svg(scene), /−24\.5|-24\.5/)
})

test('unsupported pitches, unknown parameters, unbound geometry and stale native inputs are refused', () => {
  assert.throws(() => compileStudyAssembly(source, { pitchMm: 425 }), /outside the native IAS comparison/)
  assert.throws(() => compileStudyAssembly(source, { density: 800 }), /Unsupported Study configuration/)
  assert.throws(() => compileStudyAssembly({ ...source, source: { kind: 'contrast-specimen', id: 'SPECIMEN-STUDY', state: 'candidate' } }), /exact admitted/)
  assert.throws(() => compileStudyAssembly(source, {}, path => path.endsWith('workable-study-floor.json')
    ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)), /receipts disagree/)
})

test('a stone and steel finish changes the physical section and mass over the same furnished fields', () => {
  const oak = compileStudyAssembly(source)
  const heavy = compileStudyAssembly(source, { wearingFace: 'stone-steel' })
  assert.equal(heavy.section.wearFaceMm, 15)
  assert.equal(heavy.section.finishSupportDepthUnresolvedMm, 3)
  assert.ok(Math.abs(heavy.schedule.completeTileWearFaceMassKg - 8.81822355) < 1e-9)
  assert.equal(heavy.handling.state, 'withheld')
  assert.equal(heavy.schedule.wholeTiles, oak.schedule.wholeTiles)
  assert.deepEqual(oak.furnishedComparisons.map(field => [field.id, field.complete, field.clearWhole]), [
    ['GROUND/G-FAMILY', 45, 15], ['GROUND/G-KITCHEN', 56, 28], ['FIRST/U-BED2', 55, 31],
  ])
  assert.ok(heavy.furnishedComparisons.every((field, index) => field.completeWearFaceMassKg > oak.furnishedComparisons[index].completeWearFaceMassKg))
  assert.ok(drawStudyFloorSection(heavy).primitives.some(item => item.id === 'stone-steel-layer'))
  assert.ok(!drawStudyFloorSection(oak).primitives.some(item => item.id === 'stone-steel-layer'))
})
