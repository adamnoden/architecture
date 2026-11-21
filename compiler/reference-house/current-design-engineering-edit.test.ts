import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import test from 'node:test'
import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableRoofId, engineeringBase,
  engineeringTicket, readEngineeringEditDocument, replayEngineeringEdit, saveEngineeringEdit,
} from './current-design/engineering-edit.js'
import { compileEngineeringDocument } from './current-design/engineering-document.js'
import { engineeringApi, readEditorEngineeringDocument, runEditorEngineeringRequest } from '../../project/ade/browser-editor/engineering-api.js'

const edit = (state: ReturnType<typeof beginEngineeringEdit>, pitchDeg: number, extra = {}) => applyEngineeringEdit(state,
  { schema: 'current-engineering-edit/1', units: 'degrees', base: engineeringBase(state),
    operation: { kind: 'set-roof-pitch', roofId: editableRoofId, pitchDeg, ...extra } })

test('engineering transactions retain the whole saved document and reverse without mutating source or history', async () => {
  const source = await readEditorEngineeringDocument()
  const input = { ...source, stages: { ...source.stages, futureStage: { retained: [1, 2] } } }
  const saved = JSON.stringify(input)
  const state = beginEngineeringEdit(input, 'test-session')
  const changed = edit(state, 27)
  assert.equal(changed.status, 'applied')
  if (changed.status !== 'applied') return
  assert.equal(changed.state.revision, 1)
  assert.deepEqual(changed.state.document.stages.futureStage, { retained: [1, 2] })
  assert.deepEqual(changed.state.document.design, state.document.design)
  assert.deepEqual(changed.state.document.bindings, state.document.bindings)
  assert.equal(JSON.stringify(input), saved)
  assert.equal(saveEngineeringEdit(beginEngineeringEdit(JSON.parse(saveEngineeringEdit(changed.state)), 'reloaded')),
    saveEngineeringEdit(changed.state))
  const undo = replayEngineeringEdit(changed.state, engineeringBase(changed.state), 'undo')
  assert.equal(undo.status, 'applied')
  if (undo.status !== 'applied') return
  assert.equal(saveEngineeringEdit(undo.state), saved)
  assert.equal(undo.state.revision, 2)
  const redo = replayEngineeringEdit(undo.state, engineeringBase(undo.state), 'redo')
  assert.equal(redo.status, 'applied')
  if (redo.status === 'applied') assert.equal(saveEngineeringEdit(redo.state), saveEngineeringEdit(changed.state))
  for (const result of [edit(state, NaN), edit(state, Infinity), edit(state, 27, { approved: true }),
    edit(state, 27, { roofId: 'missing/roof' }), replayEngineeringEdit(changed.state, engineeringBase(state), 'undo')]) {
    assert.equal(result.status, 'rejected')
  }
  assert.throws(() => readEngineeringEditDocument({ ...source, schema: 'current-design-draft/1' }), /shared engineering/)
  assert.throws(() => readEngineeringEditDocument({ ...source, stages: {} }), /explicit finite roof/)
  assert.throws(() => readEngineeringEditDocument({ ...source, stages: { ...source.stages, other: { value: Infinity } } }), /finite/)
})

test('revision and exact document identity reject stale or substituted replies', async () => {
  const state = beginEngineeringEdit(await readEditorEngineeringDocument(), 'session-one')
  const ticket = engineeringTicket(state, 'first')
  const changed = edit(state, 27)
  assert.equal(changed.status, 'applied')
  if (changed.status !== 'applied') return
  const nextTicket = engineeringTicket(changed.state, 'second')
  assert.equal(currentEngineeringReply(changed.state, nextTicket, { ticket, output: 'old' }), undefined)
  assert.equal(currentEngineeringReply(changed.state, nextTicket, { ticket: { ...nextTicket, documentJson: ticket.documentJson } }), undefined)
  assert.equal(currentEngineeringReply(beginEngineeringEdit(state.document, 'session-two'), ticket, { ticket }), undefined)
  assert.equal(currentEngineeringReply(changed.state, nextTicket, { ticket: nextTicket, output: 'current' })?.output, 'current')
})

test('actual HTTP transport admits a shared document and reports compiler and protocol failures', async () => {
  const server = createServer((request, response) => engineeringApi(request, response, () => { response.writeHead(404); response.end() }))
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const url = `http://127.0.0.1:${address.port}/api/engineering/`
    const document = await (await fetch(url + 'document')).json()
    const state = beginEngineeringEdit(document, 'http-session')
    const response = await fetch(url + 'compile', { method: 'POST', body: JSON.stringify({ ticket: engineeringTicket(state, 'http') }) })
    assert.equal(response.status, 200)
    const reply = await response.json()
    assert.ok(currentEngineeringReply(state, reply.ticket, reply))
    assert.equal(reply.roof.schedule.pitchDeg, 25)
    const invalid = await fetch(url + 'compile', { method: 'POST', body: '{' })
    assert.equal(invalid.status, 422)
    assert.ok((await invalid.json()).error)
    assert.equal((await fetch(url + 'unknown')).status, 404)
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
})

test('real editor compiler equals public CLI, changes native roof outputs and withholds dependent evidence', async () => {
  const state = beginEngineeringEdit(await readEditorEngineeringDocument(), 'api-session')
  const before = await runEditorEngineeringRequest({ ticket: engineeringTicket(state, 'before') })
  const changed = edit(state, 27)
  assert.equal(changed.status, 'applied')
  if (changed.status !== 'applied') return
  const request = { ticket: engineeringTicket(changed.state, 'after') }
  const after = await runEditorEngineeringRequest(JSON.parse(JSON.stringify(request)))
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'],
    { input: saveEngineeringEdit(changed.state), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }))
  const { svg: _svg, ...roof } = after.roof
  assert.deepEqual(JSON.parse(JSON.stringify(roof)), cli.engineering.roofPitch)
  assert.deepEqual(after.documentIdentity, cli.documentIdentity)
  assert.deepEqual(after.manifest, cli.manifest)
  assert.deepEqual([before.roof.schedule.fieldSectionQZMm[2][1], after.roof.schedule.fieldSectionQZMm[2][1]].map(z => Number(z.toFixed(2))), [8409.33, 8501.16])
  assert.deepEqual([before.roof.schedule.slateStockComparisons.severe.court.rowsPerFace, after.roof.schedule.slateStockComparisons.severe.court.rowsPerFace], [12, 13])
  assert.notEqual(before.roof.svg, after.roof.svg)
  assert.equal(after.roof.evidence.state, 'withheld-for-pitch-change')
  assert.equal(after.manifest.find(row => row.stage === 'selectedWaterEvent')?.applicability?.state, 'withheld-for-stage-change')
  assert.deepEqual(cli.plans, JSON.parse(JSON.stringify((await compileEngineeringDocument(state.document)).plans)))
  const restored = await runEditorEngineeringRequest({ ticket: engineeringTicket(state, 'restored') })
  assert.deepEqual(restored.documentIdentity, before.documentIdentity)
  assert.deepEqual(restored.roof, before.roof)
  const invalid = edit(state, 24)
  assert.equal(invalid.status, 'applied')
  if (invalid.status === 'applied') await assert.rejects(runEditorEngineeringRequest({ ticket: engineeringTicket(invalid.state, 'invalid') }), /at least 25/)
  const stale = structuredClone(state.document)
  ;(stale.bindings.implementations as Record<string, unknown>)['project/mat/studies/ring-roof-pitch-case.py'] = '0'.repeat(40)
  await assert.rejects(runEditorEngineeringRequest({ ticket: engineeringTicket(beginEngineeringEdit(stale, 'stale'), 'stale') }), /Stale engineering/)
  const unsupported = { ...state.document, stages: { ...state.document.stages, unknownStage: {} } }
  await assert.rejects(runEditorEngineeringRequest({ ticket: engineeringTicket(beginEngineeringEdit(unsupported, 'unsupported'), 'unsupported') }), /supported engineering stage/)
})
