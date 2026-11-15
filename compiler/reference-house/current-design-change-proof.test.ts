import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { sha256SemanticFingerprint } from '../core/identity.js'
import { translateDrawingPrimitive } from '../publication-drawing-v2/composition.js'
import { renderDrawingSceneV2Svg } from '../publication-drawing-v2/svg.js'
import { compileReferenceHouse } from './compile.js'
import { inspectHostedOpening } from './construction-bay/opening-inspection.js'
import { compileRenewableOpenings } from './current-design/assemblies/renewable-openings.js'
import { compileCurrentDesignBundle, prepareCurrentDesignCompile } from './current-design/compile.js'
import {
  applyDesignEdit, beginDesignEdit, editBase, loadDesignDraft, replayDesignEdit, saveDesignDraft,
  type EditConsumer, type EditorState,
} from './current-design/edit.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { analysisTicket, currentAnalysisOutput, runRevisionAnalysis } from './current-design/revision-analysis.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { runRoofPitchCase } from './current-design/roof-pitch.js'
import { createReferenceHouseSource } from './fixture.js'

const repository = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, repository))
const accepted = readGeorgianDesignSnapshot()
const windowRef = { bayId: 'BAY-FRONT-STUDY-01', level: 'GROUND', hostWallId: 'GROUND/outer-south', openingId: 'GROUND/south-window-0' } as const

function resize(state: EditorState, ref: Parameters<typeof inspectHostedOpening>[1],
  widthMm: number, consumers: readonly EditConsumer[] = []) {
  return applyDesignEdit(state, { schema: 'current-design-edit/1', units: 'mm', base: editBase(state),
    operations: [{ kind: 'resize-opening', level: ref.level, openingId: ref.openingId, hostWallId: ref.hostWallId, widthMm }] }, consumers)
}

test('one bound current input distinguishes local Study edits from still-valid control geometry', async () => {
  const compile = prepareCurrentDesignCompile(accepted)
  const [opening, resized, floor, repitched, panel, repanelled] = await Promise.all([
    compile.renewableOpenings(), compile.renewableOpenings({ schema: 'oas-study-width-case/1', widthMm: 1020 }),
    compile.studyAssembly(), compile.studyAssembly({ pitchMm: 450, wearingFace: 'stone-steel' }),
    compile.studyLinings(), compile.studyLinings({ panelPitchMm: 450, backing: 'retain-mineral' }),
  ])

  assert.equal(opening.source.planDigest, compile.source.planDigest)
  assert.deepEqual([resized.window.opening.id, resized.window.opening.occupiedCentreMm, resized.window.fixedFrameWidthMm],
    [windowRef.openingId, 2100, 922])
  assert.deepEqual(resized.window.schedule.map(row => row.retainedFrameClearanceEachJamb), [6, 1])
  assert.match(resized.window.jambSvg, /width="1020"/)
  assert.equal(resized.window.release.state, 'withheld-for-width-change')
  assert.deepEqual(resized.door, opening.door)
  assert.throws(() => compileRenewableOpenings(readCurrentDesignResolution(), undefined, path => path === opening.window.receipt.method
    ? Buffer.concat([read(path), Buffer.from('\n// Changed jamb method\n')]) : read(path)), /dry-seam method changed/)

  assert.equal(repitched.source.planDigest, compile.source.planDigest)
  assert.deepEqual([floor.assembly.schedule.wholeTiles, repitched.assembly.schedule.wholeTiles], [43, 31])
  assert.equal(repitched.assembly.section.finishSupportDepthUnresolvedMm, 3)
  assert.equal(repitched.assembly.release.code, 'FIXED_BRIDGE_PITCH')
  assert.notEqual(renderDrawingSceneV2Svg(repitched.plan), renderDrawingSceneV2Svg(floor.plan))
  assert.notEqual(renderDrawingSceneV2Svg(repitched.section), renderDrawingSceneV2Svg(floor.section))
  assert.deepEqual(repitched.assembly.grid.occupied, floor.assembly.grid.occupied)

  assert.equal(repanelled.source.planDigest, compile.source.planDigest)
  assert.equal(repanelled.linings.wall.wallFaceOverrunMm, 27)
  assert.equal(repanelled.linings.wall.evidence.protectedRevealAndRenewal, 'recheck')
  assert.notEqual(renderDrawingSceneV2Svg(repanelled.elevation), renderDrawingSceneV2Svg(panel.elevation))
  assert.deepEqual(repanelled.linings.grille, panel.linings.grille)
})

test('the native roof slope and stock edit changes real output and withholds changed product and water claims', async () => {
  const compile = prepareCurrentDesignCompile(accepted)
  const request = await compile.readRoofPitchCase()
  const baseline = await compile.roofPitch(request.roof)
  const width = { ...request, roof: { ...request.roof, pitchDeg: 27 } }
  const trial = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--roof-pitch', '-'], {
    cwd: repository, input: JSON.stringify(width), encoding: 'utf8',
  })) as typeof baseline

  assert.equal(baseline.source.planDigest, compile.source.planDigest)
  assert.equal(trial.source.bindingDigest, baseline.source.bindingDigest)
  assert.notEqual(trial.source.caseDigest, baseline.source.caseDigest)
  const ridgeZ = (result: typeof baseline) => Number(result.schedule.fieldSectionQZMm[2][1].toFixed(2))
  assert.deepEqual([ridgeZ(baseline), ridgeZ(trial)], [8409.33, 8501.16])
  assert.equal(trial.schedule.planCatchmentM2, baseline.schedule.planCatchmentM2)
  assert.deepEqual([baseline.schedule.slateStockComparisons.severe.court.rowsPerFace, trial.schedule.slateStockComparisons.severe.court.rowsPerFace], [12, 13])
  assert.notEqual(renderDrawingSceneV2Svg(trial.drawing), renderDrawingSceneV2Svg(baseline.drawing))
  assert.equal(trial.evidence.state, 'withheld-for-pitch-change')
  assert.ok(trial.evidence.invalidated.includes('RWT selected roof-water collection and movement'))

  const labelled = { ...trial.drawing, primitives: trial.drawing.primitives.map(item =>
    item.kind === 'text' ? translateDrawingPrimitive(item, 1, 0) : item) }
  assert.notEqual(sha256SemanticFingerprint(labelled), sha256SemanticFingerprint(trial.drawing))
  assert.deepEqual(labelled.primitives.filter(item => item.kind !== 'text'), trial.drawing.primitives.filter(item => item.kind !== 'text'))
  assert.deepEqual(await compile.roofPitch(width.roof), trial)

  const resolved = readCurrentDesignResolution()
  assert.throws(() => runRoofPitchCase(resolved, request.roof, path => path === baseline.method.path
    ? Buffer.concat([read(path), Buffer.from('\n# Changed comparison method\n')]) : read(path)), /Stale roof method, product or source/)
  assert.throws(() => runRoofPitchCase(resolved, request.roof, path => {
    if (path !== 'project/mat/studies/ring-roof-family-sources.json') return read(path)
    const catalogue = JSON.parse(read(path).toString('utf8'))
    catalogue.slate.size[0] += 10
    return Buffer.from(JSON.stringify(catalogue))
  }), /Stale roof method, product or source/)
  await assert.rejects(compile.roofPitch({ ...request.roof, pitchDeg: NaN }), /finite/)
  await assert.rejects(compile.roofPitch({ ...request.roof, pitchDeg: 15 }), /at least 25 degrees/)
  await assert.rejects(compile.roofPitch({ ...request.roof, roofId: 'MAT/renamed-roof' }), /Only the bound MAT roof/)
})

test('changed structure and service cases use real kernels and exact linked geometry without installed acceptance', async () => {
  const compile = prepareCurrentDesignCompile(accepted)
  const [structural, interfaceRequest, { condensate }, { intake }] = await Promise.all([
    compile.readStructuralCase(), compile.readStructuralInterfaces(), compile.readOccupiedCondensateCase(), compile.readCourtIntakeCase(),
  ])
  assert.ok('case' in structural && 'replay' in interfaceRequest)
  const [structBefore, structTrial, activeInterfaces, serviceBefore, serviceTrial, rwtBefore] = await Promise.all([
    compile.structuralCase(structural.case),
    compile.structuralCase({ ...structural.case, combination: { id: 'stripped suction+wind', suctionFactor: 0.75 },
      joint: { ...structural.case.joint, supportAxesYMm: [6100, 7730], sectionDepthMm: 200 } }),
    compile.structuralInterfaces({ ...interfaceRequest.replay, interfaces: ['north-roof-shoe'] }),
    compile.occupiedCondensate(condensate), compile.occupiedCondensate({ ...condensate, portLevelMm: 2675 }), compile.courtIntake(intake),
  ])
  assert.equal(structBefore.status, 'computed-comparison')
  assert.equal(structTrial.status, 'computed-comparison')
  assert.deepEqual(structTrial.source, compile.source)
  assert.equal(structTrial.foundation.native.heads.length, 52)
  assert.notDeepEqual(structTrial.foundation.native.verticalEquilibrium, structBefore.foundation.native.verticalEquilibrium)
  assert.deepEqual(structTrial.foundation.native.horizontalEquilibrium, structBefore.foundation.native.horizontalEquilibrium)
  assert.ok(Math.abs(structTrial.joint.clearSpanMm - 1030) < 1e-8)
  assert.ok(structTrial.joint.members.every(member => member.compareAtBothCovers.every(row => !row.pass)))
  assert.equal(structTrial.joint.installedAcceptance, false)
  assert.equal(activeInterfaces.status, 'recomputed-comparisons')
  const [shoe] = activeInterfaces.interfaces
  assert.equal(shoe.geometry.id, 'north-roof-shoe')
  assert.deepEqual(shoe.geometry.slotXZMm, [60, 34])
  assert.equal(shoe.installedAcceptance, false)

  assert.deepEqual(serviceTrial.calculation.port.point, [9130, 0, 2675])
  assert.notEqual(serviceTrial.source.caseDigest, serviceBefore.source.caseDigest)
  assert.equal(serviceTrial.source.planDigest, compile.source.planDigest)
  assert.notEqual(serviceTrial.trialSchedule, serviceBefore.trialSchedule)
  assert.ok(serviceTrial.diagnostics.some(item => item.code === 'ASSEMBLED_OPERATION_UNQUALIFIED'))
  const port = serviceTrial.drawing.primitives.find(item => item.id === 'trial-formed-sleeve')
  assert.equal(port?.metadata?.levelMm, 2675)

  const [[a, b], ...others] = intake.route.intervalsYMm
  const narrowed = await compile.courtIntake({ ...intake, route: { intervalsYMm: [[a, b - 25], ...others] } })
  assert.equal(narrowed.calculation.widthMm, rwtBefore.calculation.widthMm - 25)
  assert.ok(narrowed.calculation.capacityAtQuietLps < rwtBefore.calculation.capacityAtQuietLps)
  assert.notEqual(narrowed.source.caseDigest, rwtBefore.source.caseDigest)
  assert.equal(narrowed.source.planDigest, compile.source.planDigest)
  assert.notEqual(renderDrawingSceneV2Svg(narrowed.drawing), renderDrawingSceneV2Svg(rwtBefore.drawing))
  assert.equal((await compile.courtIntake({ ...intake, route: { intervalsYMm: [] } })).status, 'blocked')
  const blockedCondensate = await compile.occupiedCondensate({ ...condensate, portLevelMm: 2760 })
  assert.equal(blockedCondensate.trialSchedule, null)
  assert.ok(blockedCondensate.diagnostics.some(item => item.code === 'SOCKET_REACH_EXCEEDED'))
  await assert.rejects(compile.occupiedCondensate({ ...condensate, bindingDigest: 'superseded' }), /Stale/)
  await assert.rejects(compile.structuralCase({ ...structural.case, planDigest: 'superseded' }), /source binding/)
})

test('draft round trips and stale analysis preserve exact revisions and historic separation', async () => {
  const historical = createReferenceHouseSource()
  const historicBefore = compileReferenceHouse(historical)
  assert.throws(() => prepareCurrentDesignCompile(historical), /design: expected exactly/)
  const compile = prepareCurrentDesignCompile(accepted)
  const { condensate } = await compile.readOccupiedCondensateCase()
  const baselineOpening = await compile.renewableOpenings()
  const opening = baselineOpening.window.opening
  const consumers = [
    { id: opening.id + '/cad', kind: 'view', dependsOn: [{ objectId: opening.id, field: 'widthMm' }] },
    { id: baselineOpening.window.receipt.path, kind: 'evidence', dependsOn: [{ objectId: opening.id, field: 'widthMm' }] },
  ] satisfies readonly EditConsumer[]

  const alternative = {
    ...accepted, envelope: { widthMm: 8600, depthMm: 10200, court: { x: 2200, y: 4400, width: 2800, depth: 2350 } },
    storeys: {
      GROUND: { elevationMm: 0, rooms: [], partitions: [],
        openings: [{ id: 'GROUND/alt-window', hostWallId: 'GROUND/outer-south', kind: 'window', centreMm: 1100, widthMm: 760 }] },
      FIRST: { elevationMm: 2980, rooms: [], partitions: [], openings: [] },
    },
  }
  for (const [design, id, ref, target] of [[accepted, 'CURRENT', windowRef, 1020],
    [alternative, 'ALT', { ...windowRef, bayId: 'ALT-ROOM', openingId: 'GROUND/alt-window' }, 920]] as const) {
    const start = beginDesignEdit(design, 'edit-' + id, 'SPECIMEN-' + id)
    const edited = resize(start, ref, target, consumers)
    assert.equal(edited.status, 'applied')
    assert.equal(inspectHostedOpening(edited.state.design, ref).row.widthMm, target)
    const undo = replayDesignEdit(edited.state, editBase(edited.state), 'undo', consumers)
    assert.equal(undo.status, 'applied')
    assert.deepEqual(undo.state.design, start.design)
    const redo = replayDesignEdit(undo.state, editBase(undo.state), 'redo', consumers)
    assert.equal(redo.status, 'applied')
    const saved = saveDesignDraft(redo.state)
    const reloaded = loadDesignDraft(saved, 'load-' + id)
    assert.equal(saveDesignDraft(reloaded), saved)
    assert.deepEqual(prepareCurrentDesignCompile(reloaded.design).plans(), prepareCurrentDesignCompile(redo.state.design).plans())
    assert.deepEqual([edited.state.revision, undo.state.revision, redo.state.revision], [1, 2, 3])
    assert.equal(resize(redo.state, { ...ref, openingId: 'GROUND/unknown' }, target).status, 'rejected')

    const ticket = analysisTicket(start, 'old', 'candidate-plan/1')
    let finish!: () => void
    const delayed = new Promise<void>(resolve => { finish = resolve })
    const response = runRevisionAnalysis(start, ticket, new AbortController().signal,
      async draft => { await delayed; return prepareCurrentDesignCompile(draft).plans() })
    finish()
    const old = await response
    assert.equal(old.status, 'complete')
    assert.equal(currentAnalysisOutput(redo.state, analysisTicket(redo.state, 'new', 'candidate-plan/1'), old), undefined)

    if (id === 'CURRENT') {
      assert.deepEqual(edited.effects.map(effect => effect.action), ['recompute', 'stale'])
      await assert.rejects(prepareCurrentDesignCompile(reloaded.design).occupiedCondensate(condensate), /applicable selected HAD/)
      const downstream = await compileCurrentDesignBundle(reloaded.design)
      assert.equal(downstream.selectedWaterEvent.status, 'unavailable')
      assert.equal(downstream.occupiedServices.status, 'unavailable')
    }
  }
  assert.deepEqual(compileReferenceHouse(historical), historicBefore)
  assert.deepEqual(readGeorgianDesignSnapshot(), accepted)
})
