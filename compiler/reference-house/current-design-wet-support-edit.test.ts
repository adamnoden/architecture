import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { applyEngineeringEdit, beginEngineeringEdit, engineeringBase, replayEngineeringEdit, saveEngineeringEdit,
  engineeringTicket, currentEngineeringReply, editableWetSupportId, editableFloorSectionId } from './current-design/engineering-edit.js'

const support = JSON.parse(execFileSync('python3', ['-B', '-c', "import sys,json;sys.path.insert(0,'project/str/studies');from seated_wet_support import reference_support;print(json.dumps(reference_support(json.load(open('project/had/studies/water-replan.json'))['model'])))"], { encoding: 'utf8' }))
const document = () => ({ schema: 'current-engineering-document/1', design: readGeorgianDesignSnapshot(), bindings: {},
  stages: { roofPitch: { pitchDeg: 35 }, floorSection: { thicknessMm: 200, wetSupport: structuredClone(support) } } })

test('actual pad edit preserves source post geometry, save/load, exact undo and stale-reply rejection', () => {
  const state = beginEngineeringEdit(document(), 'wet-pad')
  const operation = { kind: 'set-wet-bearing-offset', assemblyId: editableWetSupportId, receiverId: 'south', offsetMm: 160 }
  const edit = applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation })
  assert.equal(edit.status, 'applied')
  const changed = JSON.parse(saveEngineeringEdit(edit.state))
  assert.deepEqual(changed.stages.floorSection.wetSupport.padCentreOffsetsYMm, [160, 0])
  assert.deepEqual(changed.stages.floorSection.wetSupport.receiverRectanglesXYMm, support.receiverRectanglesXYMm)
  assert.deepEqual(beginEngineeringEdit(changed, 'reload').document, changed)
  const ticket = engineeringTicket(state, 'old-support')
  assert.equal(currentEngineeringReply(edit.state, ticket, { ticket }), undefined)
  const undo = replayEngineeringEdit(edit.state, engineeringBase(edit.state), 'undo')
  assert.equal(undo.status, 'applied'); assert.equal(saveEngineeringEdit(undo.state), saveEngineeringEdit(state))
  assert.equal(applyEngineeringEdit(edit.state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation }).status, 'rejected')
})

test('authoring rejects unknown geometry, overhanging pad, wrong units and unsupported slab edit without inventing a support', () => {
  const state = beginEngineeringEdit(document(), 'wet-invalid')
  const operation = { kind: 'set-wet-bearing-offset', assemblyId: editableWetSupportId, receiverId: 'south', offsetMm: 166 }
  const transaction = { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation }
  assert.equal(applyEngineeringEdit(state, transaction).status, 'rejected')
  for (const units of ['m', 'degrees']) assert.equal(applyEngineeringEdit(state, { ...transaction, units, operation: { ...operation, offsetMm: 0 } }).status, 'rejected')
  assert.equal(applyEngineeringEdit(state, { ...transaction, operation: { kind: 'set-floor-section-thickness', assemblyId: editableFloorSectionId, thicknessMm: 250 } }).status, 'rejected')
  const noSupport = document(); (noSupport.stages.floorSection as unknown as Record<string, unknown>).wetSupport = null
  const absent = beginEngineeringEdit(noSupport, 'no-wet')
  assert.equal(applyEngineeringEdit(absent, { ...transaction, base: engineeringBase(absent), operation: { ...operation, offsetMm: 0 } }).status, 'rejected')
})
