import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { compileStudyLinings } from './current-design/assemblies/study-linings.js'
import { drawStudyLiningComparison } from './current-design/assemblies/study-linings-views.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const read = (path: string) => readFileSync(new URL('../../' + path, import.meta.url))

test('the current Study basis binds native W1 dimensions and the real retained inlet', () => {
  const baseline = compileStudyLinings(design)
  assert.equal(baseline.source.occupiedHouse, 'HAD-SERVICES-02')
  assert.equal(Object.keys(baseline.source.identities).length, 5)
  assert.equal(baseline.state, 'candidate')
  assert.equal(baseline.wall.referenceDepthMm, 27)
  assert.deepEqual(baseline.wall.layerSchedule.map(layer => layer.depthMm), [7, 2, 18])
  assert.equal(baseline.grille.nominalPlateMm, 4)
  assert.deepEqual(baseline.grille.actualRetainedInlet, {
    id: 'study', wall: 'outer-south', stationDatumMm: [3045, 0, 2100],
    completeOD: 347, retainedReceiverID: 354, radialGapMM: 3.5, drawMM: 250,
    installedNormalMM: [458, 608], finalNormalMM: [708, 858], finalZ: [1933.58, 2282.08],
    maximumCompleteMassKG: 12, supportedCarrier: [2845, 675, 400, 225],
  })
  assert.equal(baseline.grille.slotSchedule.totalOpenAreaMm2, 17280)
  assert.equal(baseline.grille.evidence.installedAreaSoundAndWeather, 'unresolved')
})

test('retaining the native mineral backing changes the wall schedule and actual CAD section', () => {
  const baseline = compileStudyLinings(design)
  const retained = compileStudyLinings(design, { backing: 'retain-mineral' })
  assert.deepEqual(retained.grille, baseline.grille)
  assert.equal(retained.wall.id, baseline.wall.id)
  assert.deepEqual(retained.wall.layerSchedule.slice(1), baseline.wall.layerSchedule)
  assert.deepEqual(retained.wall.layerSchedule.map(layer => layer.depthMm), [27, 7, 2, 18])
  assert.deepEqual([retained.wall.totalDepthMm, retained.wall.wallFaceOverrunMm], [54, 27])
  assert.equal(retained.wall.revealStatus, 'conflict')
  assert.equal(retained.wall.evidence.protectedRevealAndRenewal, 'recheck')
  const heldFace = retained.wall.layerSchedule.at(-1)!.id
  const before = drawStudyLiningComparison(baseline).primitives.find(item => item.id === heldFace)
  const after = drawStudyLiningComparison(retained).primitives.find(item => item.id === heldFace)
  assert.ok(before?.kind === 'rect' && after?.kind === 'rect')
  assert.equal(after.x - before.x, 13.5)
  assert.equal(after.width, before.width)
})

test('narrowing the real G1 trial slot changes area reserve and leaves HAD cartridge geometry alone', () => {
  const baseline = compileStudyLinings(design)
  const narrow = compileStudyLinings(design, { slotWidthMm: 5 })
  assert.deepEqual(narrow.wall, baseline.wall)
  assert.deepEqual(narrow.grille.actualRetainedInlet, baseline.grille.actualRetainedInlet)
  assert.equal(narrow.grille.slotSchedule.id, baseline.grille.slotSchedule.id)
  assert.deepEqual([narrow.grille.slotSchedule.totalOpenAreaMm2, narrow.grille.grossAreaScreen.inwardGrossMarginMm2], [14400, -600])
  assert.equal(narrow.grille.grossAreaScreen.state, 'below-reference')
  assert.equal(narrow.grille.evidence.existingFlangeAndRelease, 'recheck')
  const initial = drawStudyLiningComparison(baseline).primitives.find(item => item.id === baseline.grille.slotSchedule.id)
  const edited = drawStudyLiningComparison(narrow).primitives.find(item => item.id === narrow.grille.slotSchedule.id)
  assert.ok(initial?.kind === 'rect' && edited?.kind === 'rect')
  assert.deepEqual([initial.height, edited.height, edited.width], [3, 2.5, 120])
  assert.match(renderDrawingSceneV2Svg(drawStudyLiningComparison(narrow)), /14400 mm² gross opening/)
})

test('unsupported widths, author changes and unbound designs prevent lining compilation', () => {
  assert.throws(() => compileStudyLinings(design, { slotWidthMm: 7 }), /requires the actual retained plate/)
  assert.throws(() => compileStudyLinings(design, { slotWidthMm: 0 }), /Unsupported Study lining configuration/)
  assert.throws(() => compileStudyLinings(design, { backing: 'custom' }), /Unsupported Study lining configuration/)
  assert.throws(() => compileStudyLinings({ ...design, source: { kind: 'contrast-specimen', id: 'SPECIMEN-UNBOUND', state: 'candidate' } }), /exact admitted/)
  assert.throws(() => compileStudyLinings(design, {}, path => path.endsWith('workable-room-assemblies.json')
    ? Buffer.concat([read(path), Buffer.from('\n')]) : read(path)), /differ from their binding/)
})

test('panelling stock geometry follows the actual furnished south wall and does not fill either rough window', async () => {
  const { prepareCurrentDesignCompile } = await import('./current-design/compile.js')
  const compile = prepareCurrentDesignCompile(readGeorgianDesignSnapshot())
  const base = await compile.studyLinings()
  const alternate = await compile.studyLinings({ panelPitchMm: 450, backing: 'retain-mineral' })
  const wall = base.linings.wall.southField
  const edited = alternate.linings.wall.southField
  assert.equal(wall.widthMm, 4273.5)
  assert.deepEqual(wall.windows.map(window => window.box), [[1600, 750, 2600, 2850], [3400, 750, 4400, 2850]])
  assert.ok(Math.abs(edited.faceAreaM2 - 7.979475) < 1e-10)
  assert.equal(wall.faceAreaM2, edited.faceAreaM2)
  assert.deepEqual([wall.columns, edited.columns], [11, 10])
  assert.notEqual(wall.pieceCount, edited.pieceCount)
  assert.notDeepEqual(base.elevation.primitives, alternate.elevation.primitives)
})
