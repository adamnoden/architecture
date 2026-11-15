import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectHostedOpening } from './construction-bay/opening-inspection.js'
import { compileCurrentDesign } from './current-design/compile.js'
import {
  applyDesignEdit, beginDesignEdit, editBase, inspectDraftGeometry, loadDesignDraft,
  replayDesignEdit, saveDesignDraft, type EditConsumer, type EditOperation, type EditorState,
} from './current-design/edit.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { analysisTicket, currentAnalysisOutput, runRevisionAnalysis } from './current-design/revision-analysis.js'

const ground = { bayId: 'BAY-FRONT-STUDY-01', level: 'GROUND', openingId: 'GROUND/south-window-0', hostWallId: 'GROUND/outer-south' } as const
const upper = { bayId: 'UPPER-CONTROL', level: 'FIRST', openingId: 'FIRST/south-window-0', hostWallId: 'FIRST/outer-south' } as const
const hosted = { level: ground.level, openingId: ground.openingId, hostWallId: ground.hostWallId } as const
const width = (openingId: typeof ground.openingId | typeof upper.openingId) => ({ objectId: openingId, field: 'widthMm' }) as const
const consumers = [
  { id: 'ade-study-view-and-row', kind: 'view', dependsOn: [width(ground.openingId), { objectId: ground.openingId, field: 'centreMm' }] },
  { id: 'declared-study-frame-fit-check', kind: 'evidence', dependsOn: [width(ground.openingId)] },
  { id: 'declared-upper-frame-fit-check', kind: 'evidence', dependsOn: [width(upper.openingId)] },
] satisfies readonly EditConsumer[]
const resize = (widthMm: number) => ({ kind: 'resize-opening', ...hosted, widthMm }) as const
const move = (centreMm: number) => ({ kind: 'move-opening', ...hosted, centreMm }) as const
const transaction = (state: EditorState, ...operations: EditOperation[]) =>
  ({ schema: 'current-design-edit/1', units: 'mm', base: editBase(state), operations } as const)
const study = (suffix: string) => beginDesignEdit(readGeorgianDesignSnapshot(), `session-${suffix}`, `SPECIMEN-${suffix}`)
const wallReference = { bayId: 'ALT-ROOM', level: 'GROUND', openingId: 'GROUND/workroom-door', hostWallId: 'GROUND/movable-wall' } as const

function applied(result: ReturnType<typeof applyDesignEdit>) {
  assert.equal(result.status, 'applied')
  return result
}

function glazing(design: EditorState['design']) {
  const plan = compileCurrentDesign(design)
  const line = plan.plans.GROUND.primitives.find(mark => mark.id === 'south-window-0-glazing-a')
  assert.ok(line?.kind === 'line')
  return { id: line.id, length: Math.round(Math.hypot(line.b.x - line.a.x, line.b.y - line.a.y) * 100), x: (line.a.x + line.b.x) / 2 }
}

test('a portable batch moves and resizes the same hosted opening across the actual plan and ADE schedule', () => {
  const baseline = readGeorgianDesignSnapshot()
  const start = study('STUDY')
  const request = JSON.parse(JSON.stringify(transaction(start, move(1900), resize(1100))))
  const result = applied(applyDesignEdit(start, request, consumers))
  assert.equal(result.state.revision, 1)
  const before = inspectHostedOpening(start.design, ground)
  const after = inspectHostedOpening(result.state.design, ground)
  assert.equal(after.row.id, before.row.id)
  assert.equal(after.model.cutout.id, before.model.cutout.id)
  assert.equal(after.row.widthMm, 1100)
  assert.deepEqual(after.row.axisIntervalMm, [1350, 2450])
  assert.deepEqual([after.model.cutout.rect.x0, after.model.cutout.rect.x1], after.row.axisIntervalMm)
  const originalLine = glazing(start.design)
  const editedLine = glazing(result.state.design)
  assert.equal(editedLine.id, originalLine.id)
  assert.deepEqual([originalLine.length, editedLine.length], [1000, 1100])
  assert.equal(Math.round((editedLine.x - originalLine.x) * 100), 100)
  assert.deepEqual(result.effects.map(({ consumerId, action, input }) => [consumerId, action, input.field]), [
    ['ade-study-view-and-row', 'recompute', 'centreMm'],
    ['ade-study-view-and-row', 'recompute', 'widthMm'],
    ['declared-study-frame-fit-check', 'stale', 'widthMm'],
  ])
  assert.deepEqual(inspectHostedOpening(result.state.design, upper).row, inspectHostedOpening(start.design, upper).row)
  assert.deepEqual(readGeorgianDesignSnapshot(), baseline)
  assert.deepEqual(compileCurrentDesign(result.state.design).disciplineBindings, [])
})

test('a non-square design translates a free-standing wall and its hosted door without replacing their identities', () => {
  const source = readGeorgianDesignSnapshot()
  const start = beginDesignEdit({
    ...source,
    envelope: { widthMm: 8600, depthMm: 10200, court: { x: 2200, y: 4400, width: 2800, depth: 2350 } },
    storeys: {
      GROUND: { elevationMm: 0, rooms: [],
        partitions: [
          { id: wallReference.hostWallId, from: [2600, 900], to: [2600, 3000] },
          { id: 'GROUND/limit', from: [3400, 900], to: [3400, 3000] },
        ],
        openings: [{ id: wallReference.openingId, hostWallId: wallReference.hostWallId, kind: 'door', centreMm: 1800, widthMm: 825,
          operation: { leaves: 1, hinge: 'low', swing: 'left' } }],
      },
      FIRST: { elevationMm: 2980, rooms: [], partitions: [], openings: [] },
    },
  }, 'session-wall', 'SPECIMEN-MOVABLE-WALL')
  const wallAt = (coordinateMm: number) => ({ kind: 'move-wall', level: 'GROUND', wallId: wallReference.hostWallId, coordinateMm }) as const
  const outcome = applied(applyDesignEdit(start, transaction(start, wallAt(2800)), []))
  const before = inspectHostedOpening(start.design, wallReference)
  const after = inspectHostedOpening(outcome.state.design, wallReference)
  assert.deepEqual(outcome.state.design.storeys.GROUND.openings, start.design.storeys.GROUND.openings)
  assert.equal(after.row.id, before.row.id)
  assert.deepEqual(after.model.cutout.rect, { ...before.model.cutout.rect, x0: before.model.cutout.rect.x0 + 200, x1: before.model.cutout.rect.x1 + 200 })
  const originalPlan = compileCurrentDesign(start.design).plans
  const newPlan = compileCurrentDesign(outcome.state.design).plans
  assert.notDeepEqual(newPlan.GROUND, originalPlan.GROUND)
  assert.deepEqual(newPlan.FIRST, originalPlan.FIRST)

  const crosses = applyDesignEdit(start, transaction(start, wallAt(3500)), [])
  assert.equal(crosses.status, 'rejected')
  assert.equal(crosses.diagnostic.code, 'unsupported-topology')
  assert.equal(crosses.state, start)
})

test('assembly depth edits change the actual cut and keep an infeasible floor draft with a bounded diagnostic', () => {
  const start = study('ASSEMBLY')
  const assemblyId = start.design.assemblyRefs.envelope
  const envelopeChange = applied(applyDesignEdit(start, transaction(start, { kind: 'set-assembly-depth', assemblyId, depthMm: 437.5 }), []))
  const nominal = inspectHostedOpening(envelopeChange.state.design, ground)
  assert.equal(nominal.row.hostAssembly.id, assemblyId)
  assert.equal(nominal.row.hostAssembly.depthMm, 437.5)
  assert.equal(nominal.model.cutout.rect.y1, 437.5)
  assert.equal(nominal.row.widthMm, 1000)

  const floorId = start.design.assemblyRefs['intermediate-floor']
  assert.equal(inspectDraftGeometry(start).nominalClearHeightMm, 3100)
  const floorChange = applied(applyDesignEdit(envelopeChange.state, transaction(envelopeChange.state,
    { kind: 'set-assembly-depth', assemblyId: floorId, depthMm: 3500 }), []))
  const finding = inspectDraftGeometry(floorChange.state)
  assert.equal(finding.nominalClearHeightMm, -50)
  assert.deepEqual(finding.diagnostics.map(({ code, base, input }) => [code, base.revision, input.objectId]), [
    ['floor-reservation-consumes-storey', 2, floorId],
  ])
  const reloaded = loadDesignDraft(saveDesignDraft(floorChange.state), 'load-infeasible')
  assert.deepEqual(reloaded.design, floorChange.state.design)
  assert.equal(inspectDraftGeometry(reloaded).nominalClearHeightMm, -50)
  assert.equal(compileCurrentDesign(reloaded.design).status, 'CANDIDATE_NOMINAL_PLAN_ONLY')
})

test('save/load, undo and redo restore exact candidate documents and reject stale requests', () => {
  const start = study('REVERSAL')
  const request = transaction(start, resize(1100))
  const edited = applied(applyDesignEdit(start, request, consumers)).state
  const undone = applied(replayDesignEdit(edited, editBase(edited), 'undo', consumers)).state
  const redone = applied(replayDesignEdit(undone, editBase(undone), 'redo', consumers)).state
  assert.deepEqual([edited.revision, undone.revision, redone.revision], [1, 2, 3])
  assert.deepEqual(undone.design, start.design)
  assert.deepEqual(redone.design, edited.design)
  assert.equal(saveDesignDraft(redone), saveDesignDraft(edited))
  const reloaded = loadDesignDraft(saveDesignDraft(redone), 'fresh-load')
  assert.equal(saveDesignDraft(reloaded), saveDesignDraft(redone))
  assert.deepEqual(compileCurrentDesign(reloaded.design), compileCurrentDesign(redone.design))
  assert.throws(() => loadDesignDraft(JSON.stringify({ schema: 'current-design-draft/2', design: redone.design }), 'wrong-schema'), /Unknown saved draft format/)
  const stale = applyDesignEdit(undone, request, consumers)
  assert.equal(stale.status, 'rejected')
  assert.equal(stale.diagnostic.code, 'stale-base')
  assert.deepEqual(stale.diagnostic.base, editBase(undone))
  const formerSession = applyDesignEdit(reloaded, transaction(redone, resize(1200)), consumers)
  assert.equal(formerSession.status, 'rejected')
  assert.equal(formerSession.diagnostic.code, 'stale-base')
  const fork = applied(applyDesignEdit(undone, transaction(undone, resize(1200)), consumers)).state
  const noRedo = replayDesignEdit(fork, editBase(fork), 'redo', consumers)
  assert.equal(noRedo.status, 'rejected')
  assert.equal(noRedo.diagnostic.code, 'history-empty')
})

test('malformed or unsupported edits fail atomically, including after a valid operation', () => {
  const start = study('ADVERSE')
  const valid = transaction(start, resize(1100))
  for (const [input, code] of [
    [{ ...valid, units: 'cm' }, 'invalid-transaction'],
    [{ ...valid, schema: 'current-design-edit/2' }, 'invalid-transaction'],
    [{ ...valid, operations: [resize(Infinity)] }, 'invalid-transaction'],
    [{ ...valid, operations: [{ kind: 'rotate-wall' }] }, 'unsupported-operation'],
    [{ ...valid, operations: [{ ...resize(1100), openingId: upper.openingId }] }, 'invalid-transaction'],
    [{ ...valid, operations: [{ ...resize(1100), hostWallId: 'GROUND/outer-east' }] }, 'host-mismatch'],
    [transaction(start, resize(1100), move(5400)), 'geometry-invalid'],
    [transaction(start, { kind: 'move-wall', level: 'GROUND', wallId: 'GROUND/study-east', coordinateMm: 4900 }), 'unsupported-topology'],
  ] as const) {
    const result = applyDesignEdit(start, input, consumers)
    assert.equal(result.status, 'rejected')
    assert.equal(result.diagnostic.code, code)
    assert.equal(result.state, start)
  }
  const netZero = applied(applyDesignEdit(start, transaction(start, resize(1200), resize(1000)), consumers))
  assert.equal(netZero.state, start)
  assert.deepEqual(netZero.effects, [])
})

test('headless clients cancel an active computation and reject stale or replaced completed responses', async () => {
  const start = study('ASYNC')
  const methodId = 'front-study-inspection/1'
  const older = analysisTicket(start, 'request-1', methodId)
  const cancelled = new AbortController()
  let begin!: () => void
  const started = new Promise<void>(resolve => { begin = resolve })
  let observedSignal = false
  const slow = runRevisionAnalysis(start, older, cancelled.signal, (_design, signal) => new Promise<never>((_resolve, reject) => {
    signal.addEventListener('abort', () => { observedSignal = true; reject(signal.reason) }, { once: true })
    begin()
  }))
  await started
  const current = applied(applyDesignEdit(start, transaction(start, resize(1100)), consumers)).state
  cancelled.abort()
  assert.equal((await slow).status, 'cancelled')
  assert.ok(observedSignal)

  const active = analysisTicket(current, 'request-3', methodId)
  const run = (design: EditorState['design']) => inspectHostedOpening(design, ground).row
  const result = await runRevisionAnalysis(current, active, new AbortController().signal, run)
  assert.equal(currentAnalysisOutput(current, active, result)?.widthMm, 1100)
  const previous = await runRevisionAnalysis(start, older, new AbortController().signal, run)
  assert.equal(previous.status, 'complete')
  assert.equal(previous.output.widthMm, 1000)
  assert.equal(currentAnalysisOutput(current, active, previous), undefined)
  assert.equal(currentAnalysisOutput(current, active, { ...result, requestId: 'request-2' }), undefined)
  assert.equal(currentAnalysisOutput(current, active, { ...result, methodId: 'different-method/1' }), undefined)
  assert.equal(currentAnalysisOutput(current, null, result), undefined)

  const ignoresCancellation = new AbortController()
  let finish!: () => void
  const work = new Promise<void>(resolve => { finish = resolve })
  const pending = runRevisionAnalysis(current, active, ignoresCancellation.signal, async design => {
    await work
    return run(design)
  })
  await Promise.resolve()
  ignoresCancellation.abort()
  assert.equal((await pending).status, 'cancelled')
  finish()
})
