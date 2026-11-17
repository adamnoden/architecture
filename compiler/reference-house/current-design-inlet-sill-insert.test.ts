import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const accepted = readGeorgianDesignSnapshot()
const compile = prepareCurrentDesignCompile(accepted)
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })

test('the compiler replays the framed sill on its conditional structural occurrence without moving the accepted window', async () => {
  const request = await compile.readInletSillInsertCase()
  const result = await compile.inletSillInsert(request.insert)
  const { disposition, sources, ...nativeGeometry } = JSON.parse(readFileSync(
    new URL('../../project/had/studies/south-inlet-sill-insert.json', import.meta.url), 'utf8'))
  assert.deepEqual(result.calculation, nativeGeometry)
  assert.equal(result.status, 'within-conditional-screen')
  assert.equal(result.source.nativeReplay, true)
  assert.equal(result.evidence, 'bound-comparison-only')
  assert.equal(result.host.id, 'GROUND/south-window-4')
  assert.equal(result.host.acceptedCentreXMm, 10200)
  assert.deepEqual(result.host.acceptedClearXMm, [9700, 10700])
  assert.equal(result.host.candidateCentreXMm, 9900)
  assert.deepEqual(result.host.candidateClearXMm, [9400, 10400])
  assert.equal(result.host.candidateShiftXMm, -300)
  assert.equal(result.calculation.plantWetCellPackingAfterSettingMm, 5)
  assert.equal(result.calculation.vents[1].freeCoreAboveWetStageGrossMM, 224.4562)
  assert.deepEqual(result.calculation.loads.outerSUncut.addedSimpleBalanceVerticalKN, [1.791, 1.209])
  assert.equal(result.calculation.throughLoadArchRestraintAndWholeBarrierVerified, false)
  assert.ok(result.diagnostics.some(issue => issue.code === 'STRUCTURAL_HOST_NOT_ADOPTED'))
  assert.ok(result.diagnostics.some(issue => issue.code === 'INSTALLATION_EVIDENCE_OUTSIDE_SCOPE'))
  assert.ok(result.method.entries.every(entry => /^[a-f0-9]{40}$/.test(entry.gitBlob)))

  const exported = cli('--read-inlet-sill-insert', accepted)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), request)
  const output = cli('--inlet-sill-insert', request)
  assert.equal(output.status, 0, output.stderr)
  assert.deepEqual(JSON.parse(output.stdout), JSON.parse(JSON.stringify(result)))
})

test('a wider east stile fails the sleeve fit, and moving only the sleeve fails its retained wet cell', async () => {
  const { insert } = await compile.readInletSillInsertCase()
  const baseline = await compile.inletSillInsert(insert)
  const [indoor] = await compile.readInletRouteCases()
  const route = await compile.inletRoute(indoor.inlet)

  const narrow = await compile.inletSillInsert({ ...insert, eastEdgeMm: 10370 })
  const shifted = await compile.inletSillInsert({ ...insert, eastEdgeMm: 10370, plantPressureAxisXMm: 10275 })
  const plantPressure = (result: typeof narrow) => result.calculation.bores.find(bore => bore.id === 'plant-pressure')!
  assert.equal(plantPressure(baseline).apertureAfter10.eastMM, 5)
  assert.equal(plantPressure(narrow).apertureAfter10.eastMM, -5)
  assert.equal(narrow.calculation.loads.eastStile.afterTwo2MMSettingsFrameWidthReserveMM, 10)
  assert.equal(narrow.calculation.plantWetCellPackingAfterSettingMm, 5)
  assert.equal(plantPressure(shifted).apertureAfter10.eastMM, 5)
  assert.equal(shifted.calculation.plantWetCellPackingAfterSettingMm, -5)
  assert.ok(narrow.diagnostics.some(issue => issue.code === 'SLEEVE_APERTURE_MARGIN' && issue.objectId === 'plant-pressure'))
  assert.ok(shifted.diagnostics.some(issue => issue.code === 'PLANT_WET_CELL_PACKING' && issue.objectId === 'plant-pressure'))
  assert.equal(narrow.status, 'blocked-screened-clearance')
  assert.equal(shifted.status, 'blocked-screened-clearance')
  assert.equal(shifted.evidence, 'withheld-for-edited-insert')
  assert.equal(shifted.source.bindingDigest, baseline.source.bindingDigest)
  assert.notEqual(shifted.source.caseDigest, narrow.source.caseDigest)
  assert.notEqual(narrow.source.caseDigest, baseline.source.caseDigest)
  const primitive = (result: typeof narrow, id: string) => result.drawing.primitives.find(item => item.id === id)!
  assert.equal(primitive(narrow, 'candidate-insert-aperture').metadata!.xMaxMm, 10370)
  assert.equal(primitive(shifted, 'plant-pressure').metadata!.xMm, 10275)
  assert.deepEqual(shifted.calculation.loads.eachSupportVerticalAndNormalKN, baseline.calculation.loads.eachSupportVerticalAndNormalKN)
  assert.deepEqual(await compile.inletRoute(indoor.inlet), route)
})

test('a deep sill member recomputes the elastic comparison and obstructs the plant sleeve', async () => {
  const { insert } = await compile.readInletSillInsertCase()
  const deep = await compile.inletSillInsert({ ...insert, headZMm: 600 })
  assert.deepEqual(deep.calculation.loads.idealSillRhsMM, [100, 150, 5])
  assert.equal(deep.calculation.bores.find(bore => bore.id === 'plant-pressure')!.apertureAfter10.headerMM, -70.39)
  assert.ok(deep.diagnostics.some(issue => issue.code === 'VENT_CLEARANCE' && issue.objectId === 'plant-vent'))
  assert.equal(deep.status, 'blocked-screened-clearance')
})

test('stale source, wrong occurrence and unsupported dimensions cannot reuse the sill result', async () => {
  const { insert } = await compile.readInletSillInsertCase()
  await assert.rejects(compile.inletSillInsert({ ...insert, planDigest: 'stale' }), /source binding/)
  await assert.rejects(compile.inletSillInsert({ ...insert, windowId: 'GROUND/south-window-3' }), /utility window occurrence/)
  await assert.rejects(compile.inletSillInsert({ ...insert, plantPressureAxisXMm: 10274 }), /screened edge, head or pressure-axis range/)
  const candidate = prepareCurrentDesignCompile({
    ...accepted, source: { kind: 'contrast-specimen', id: 'SPECIMEN-OTHER-PLAN', state: 'candidate' },
  })
  await assert.rejects(candidate.inletSillInsert(insert), /applicable HAD and STR source binding/)
})

test('the opening patch replaces one part of the native opaque wind field and preserves both world first moments', async () => {
  const { insert } = await compile.readInletSillInsertCase()
  const result = await compile.inletSillInsert(insert)
  const wind = result.windPressure
  const zero = { forceKN: 0, firstMomentXKNm: 0, firstMomentZKNm: 0 }
  assert.equal(wind.pressureKPa, 2.25)
  assert.equal(wind.method.nativeMethod, 'reconciled-corner-portals.py::Portal.pressure')
  assert.deepEqual(wind.supports.portalAxesXMm, [9297.5, 10502.5])
  assert.deepEqual(wind.supports.frameAxesXMm, [9425, 10390])
  assert.deepEqual(wind.originalFields.gross, {
    forceKN: 11.262375, firstMomentXKNm: 111.4975125, firstMomentZKNm: 17.963488125,
  })
  assert.deepEqual(wind.replacementFields.window, wind.originalFields.window)
  assert.equal(wind.removedPatch.forceKN, .570825)
  assert.equal(wind.removedPatch.centreXMm, 10165)
  assert.equal(wind.removedPatch.centreZMm, 405)
  const roundedForces = (rows: readonly { forceKN: number }[]) => rows.map(row => Number(row.forceKN.toFixed(6)))
  assert.deepEqual(roundedForces(wind.supports.samePatchAtPortalAxesComparison), [.159878, .410947])
  assert.deepEqual(roundedForces(wind.supports.independentlySupportedPatch), [.133094, .437731])
  assert.deepEqual(wind.conservation.residual, zero)
  assert.deepEqual(wind.conservation.recovered, wind.originalFields.gross)
  assert.equal(wind.adverseControls.addPatchWithoutRemoval.forceKN, .570825)
  assert.deepEqual(wind.adverseControls.subtractEqualSplitThenAddTruePatch,
    { forceKN: 0, firstMomentXKNm: .151268625, firstMomentZKNm: 0 })
  assert.equal(wind.restraintOrStrengthVerified, false)

  const narrowed = await compile.inletSillInsert({ ...insert, eastEdgeMm: 10370 })
  const deepened = await compile.inletSillInsert({ ...insert, headZMm: 600 })
  assert.equal(narrowed.windPressure.removedPatch.forceKN, .55755)
  assert.equal(narrowed.windPressure.removedPatch.centreXMm, 10160)
  assert.equal(deepened.windPressure.removedPatch.forceKN, .474075)
  assert.equal(deepened.windPressure.removedPatch.centreZMm, 355)
  for (const trial of [narrowed, deepened]) {
    assert.deepEqual(trial.windPressure.originalFields, wind.originalFields)
    assert.deepEqual(trial.windPressure.conservation.residual, zero)
    const marker = trial.drawing.primitives.find(primitive => primitive.id === 'insert-wind-resultant')
    assert.equal(marker?.metadata?.forceKN, trial.windPressure.removedPatch.forceKN)
  }

  const sleeveOnly = await compile.inletSillInsert({ ...insert, plantPressureAxisXMm: 10275 })
  assert.deepEqual(sleeveOnly.windPressure, wind)
})
