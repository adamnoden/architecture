import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readWetSupportCageDefaults, validateWetSupportCageChoices, wetSupportCageGeometrySummary,
  wetSupportCageObjectId, wetSupportCageChoicesPath, runWetSupportCageComparison } from './current-design/structural-wet-support-cage.js'
import { savedFloorSectionCase, type readFloorSectionCase } from './current-design/structural-floor-section.js'
import { savedMasonryFrameCase } from './current-design/structural-masonry-frame.js'
import { savedUpperRoofBearingCase } from './current-design/structural-upper-bearing.js'
import { applyEngineeringEdit, beginEngineeringEdit, engineeringBase, replayEngineeringEdit, saveEngineeringEdit,
  engineeringTicket, currentEngineeringReply, editableWetCageId, editableFloorSectionId } from './current-design/engineering-edit.js'

const defaults = readWetSupportCageDefaults()
const support = JSON.parse(execFileSync('python3', ['-B', '-c', "import sys,json;sys.path.insert(0,'project/str/studies');from seated_wet_support import reference_support;print(json.dumps(reference_support(json.load(open('project/had/studies/water-replan.json'))['model'])))"], { encoding: 'utf8' }))
const document = () => ({ schema: 'current-engineering-document/1', design: readGeorgianDesignSnapshot(), bindings: {},
  stages: { roofPitch: { pitchDeg: 35 }, floorSection: { thicknessMm: 200, wetSupport: structuredClone(support), cageComparison: structuredClone(defaults) } } })

test('the actual browser wet import reconstructs the sole saved masonry/upper-bearing/floor request without a native solve', () => {
  const proof = JSON.parse(readFileSync('project/str/studies/floor-section-proof.json', 'utf8'))
  const canonical = proof.controls.find((row: { nativeCaseId: string }) => row.nativeCaseId === 'wet-aligned-quadrature8').executedRequest
  const before = JSON.stringify(canonical)
  const stages = JSON.parse(execFileSync('python3', ['-B', '-c',
    "import json,runpy;print(json.dumps(runpy.run_path('project/ade/browser-editor/engineering_browser_test.py')['current_wet_stages']()))"], { encoding: 'utf8' }))
  const masonryCase = canonical.bearingCase.masonryCase
  const nativeFloor = masonryCase.verticalCase.monolithicCase.houseCase.joinedCase.floor
  const { edits, ...authored } = stages.distributedFloor
  const sharedFloor = { ...nativeFloor, ...authored, componentCase: { ...nativeFloor.componentCase, edits } }
  const metadata = { planDigest: 'authoring-only', bindingDigest: 'authoring-only', caseId: 'BROWSER-WET-CAGE' }
  const masonry = savedMasonryFrameCase({ ...metadata, schema: 'str-current-masonry-frame-case/1', comparison: masonryCase }, stages.masonryFrame, sharedFloor)
  const upper = savedUpperRoofBearingCase({ ...metadata, schema: 'str-current-upper-roof-bearing-case/1', comparison: canonical.bearingCase }, stages.upperRoofBearing, masonry)
  const request = { ...metadata, schema: 'str-current-floor-section-case/1', comparison: canonical, sectionCuts: [], cageComparison: null } as ReturnType<typeof readFloorSectionCase>['section']
  const floor = savedFloorSectionCase(request, stages.floorSection, upper)
  assert.deepEqual(floor.comparison, canonical)
  assert.deepEqual(floor.cageComparison, defaults)
  assert.equal(floor.caseId, 'BROWSER-WET-CAGE')
  assert.equal(floor.comparison.bearingCase.masonryCase.roofCoupling, null)
  assert.deepEqual(floor.comparison.bearingCase.roofControls, canonical.bearingCase.roofControls)
  assert.equal(Object.hasOwn(floor.comparison.bearingCase.roofControls, 'intermediateSupportLaws'), false)
  assert.equal(JSON.stringify(canonical), before)
})

test('the serialized cage choice source is discoverable and validates adverse120mm without manufacturing eligibility', () => {
  assert.deepEqual(defaults, JSON.parse(readFileSync(new URL('../../'+wetSupportCageChoicesPath, import.meta.url), 'utf8')))
  assert.equal(validateWetSupportCageChoices({ ...defaults, linkHookTailMm: 120 }).linkHookTailMm, 120)
  for (const choices of [{ ...defaults, linkHookTailMm: 79 }, { ...defaults, linkHookTailMm: 121 },
    { ...defaults, linkHookTailMm: NaN }, { ...defaults, sourceSteelYieldMPa: 500 }, { ...defaults, accepted: true }]) {
    assert.throws(() => validateWetSupportCageChoices(choices))
  }
  assert.throws(() => runWetSupportCageComparison({}, defaults), /actual unadopted58-source/)
  const staleSource = Object.fromEntries(Array.from({ length: 57 }, (_, i) => ['unexecuted/'+i, '0'.repeat(64)]))
  staleSource['project/str/studies/current-house-grid.json'] = '0'.repeat(64)
  assert.throws(() => runWetSupportCageComparison({ schema: 'str-coupled-floor-section-result/1', sourceSHA256: staleSource,
    seatedWetSupport: {}, nativeVertical: { native: { caseId: 'REJECTION-PROBE' } }, candidateAccepted: false, completeHouseProof: false }, defaults), /grid bytes/)
})

test('same-bar internal closures remain a failure when pair and cover reports are clear', () => {
  const otherReports = { collisions: { failedPairCount: 0, failures: [] }, cover: { failedPaths: [] } }
  const failed = wetSupportCageGeometrySummary({ ...otherReports, internalClosures: { failures: [{ id: 'same-bar-crossing' }] } })
  assert.equal(failed.allReportedGeometryClear, false)
  assert.equal(failed.internalClosureFailureCount, 1)
  assert.equal(failed.independentPathFailureCount, 0)
  assert.equal(failed.coverFailureCount, 0)
  const clear = wetSupportCageGeometrySummary({ ...otherReports, internalClosures: { failures: [] } })
  assert.equal(clear.allReportedGeometryClear, true)
  assert.equal(clear.physicalCageAccepted, false)
  assert.throws(() => wetSupportCageGeometrySummary({ ...otherReports, collisions: { failedPairCount: 1, failures: [] }, internalClosures: { failures: [] } }), /Malformed/)
})

test('saved cage choices require the actual selected support before any native solve', () => {
  // This authors a request envelope only; it supplies no stored physical response.
  const request = { comparison: {} } as ReturnType<typeof readFloorSectionCase>['section']
  const upper: Parameters<typeof savedFloorSectionCase>[2] = { schema: 'str-current-upper-roof-bearing-case/1',
    planDigest: 'authoring-only', bindingDigest: 'authoring-only', caseId: 'AUTHORING-PROBE',
    comparison: { masonryCase: {}, roofControls: {}, sourceSHA256: {} } }
  assert.throws(() => savedFloorSectionCase(request, { thicknessMm: 200, cageComparison: defaults }, upper), /explicit actual wet support/)
  assert.throws(() => savedFloorSectionCase(request, { thicknessMm: 200, wetSupport: support,
    cageComparison: { ...defaults, linkHookTailMm: 121 } }, upper))
  const saved = savedFloorSectionCase(request, { thicknessMm: 200, wetSupport: support, cageComparison: defaults }, upper)
  assert.deepEqual(saved.cageComparison, defaults)
  assert.deepEqual(saved.comparison.wetSupport, support)
  assert.equal(savedFloorSectionCase(request, { thicknessMm: 200 }, upper).cageComparison, null)
})

test('hook-tail semantic edit saves all choices, reverses exactly and rejects stale replies', () => {
  assert.equal(editableWetCageId, wetSupportCageObjectId)
  const state = beginEngineeringEdit(document(), 'wet-cage')
  const operation = { kind: 'set-wet-cage-hook-tail', assemblyId: editableWetCageId, linkHookTailMm: 120 }
  const transaction = { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation }
  const edit = applyEngineeringEdit(state, transaction)
  assert.equal(edit.status, 'applied')
  const saved = JSON.parse(saveEngineeringEdit(edit.state))
  assert.equal(saved.stages.floorSection.cageComparison.linkHookTailMm, 120)
  assert.deepEqual(saved.stages.floorSection.cageComparison, { ...defaults, linkHookTailMm: 120 })
  assert.deepEqual(saved.stages.floorSection.wetSupport, support)
  assert.deepEqual(beginEngineeringEdit(saved, 'reload-cage').document, saved)
  const ticket = engineeringTicket(state, 'old-cage')
  assert.equal(currentEngineeringReply(edit.state, ticket, { ticket }), undefined)
  assert.equal(applyEngineeringEdit(edit.state, transaction).status, 'rejected')
  const undo = replayEngineeringEdit(edit.state, engineeringBase(edit.state), 'undo')
  assert.equal(undo.status, 'applied'); assert.equal(saveEngineeringEdit(undo.state), saveEngineeringEdit(state))
})

test('hook-tail edits cannot create a cage/support stage, escape units/domain or discard its parent choices', () => {
  const state = beginEngineeringEdit(document(), 'wet-cage-invalid')
  const operation = { kind: 'set-wet-cage-hook-tail', assemblyId: editableWetCageId, linkHookTailMm: 80 }
  const transaction = { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation }
  for (const changed of [{ ...operation, assemblyId: 'STR/missing' }, { ...operation, linkHookTailMm: 79 },
    { ...operation, linkHookTailMm: 121 }, { ...operation, linkHookTailMm: NaN }, { ...operation, accepted: true }]) {
    const rejected = applyEngineeringEdit(state, { ...transaction, operation: changed })
    assert.equal(rejected.status, 'rejected'); assert.equal(rejected.state, state)
  }
  assert.equal(applyEngineeringEdit(state, { ...transaction, units: 'm' }).status, 'rejected')
  for (const cageComparison of [undefined, null]) {
    const input = document(), floor = input.stages.floorSection as Record<string, unknown>
    if (cageComparison === undefined) delete floor.cageComparison
    else floor.cageComparison = cageComparison
    const noCage = beginEngineeringEdit(input, 'no-cage')
    assert.equal(applyEngineeringEdit(noCage, { ...transaction, base: engineeringBase(noCage) }).status, 'rejected')
  }
  const noSupport = document(); (noSupport.stages.floorSection as Record<string, unknown>).wetSupport = null
  const absent = beginEngineeringEdit(noSupport, 'no-cage-support')
  assert.equal(applyEngineeringEdit(absent, { ...transaction, base: engineeringBase(absent) }).status, 'rejected')
  const unselected = document(); Object.assign(unselected.stages.floorSection, { wetSupport: null, cageComparison: null })
  const slab = beginEngineeringEdit(unselected, 'unselected-cage')
  assert.equal(applyEngineeringEdit(slab, { ...transaction, base: engineeringBase(slab), operation: {
    kind: 'set-floor-section-thickness', assemblyId: editableFloorSectionId, thicknessMm: 250 } }).status, 'applied')
})

test('post top-level edit preserves the full authored cage, reverses and invalidates stale replies', () => {
  const state = beginEngineeringEdit(document(), 'wet-cage-top')
  const operation = { kind: 'set-wet-cage-top-level', assemblyId: editableWetCageId, postTopLevelRaiseMm: 15 }
  const transaction = { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state), operation }
  const edit = applyEngineeringEdit(state, transaction)
  assert.equal(edit.status, 'applied')
  const saved = JSON.parse(saveEngineeringEdit(edit.state))
  assert.deepEqual(saved.stages.floorSection.cageComparison, { ...defaults, postTopLevelRaiseMm: 15 })
  assert.deepEqual(saved.stages.floorSection.wetSupport, support)
  assert.deepEqual(beginEngineeringEdit(saved, 'top-reload').document, saved)
  const oldTicket = engineeringTicket(state, 'old-top')
  assert.equal(currentEngineeringReply(edit.state, oldTicket, { ticket: oldTicket }), undefined)
  assert.equal(applyEngineeringEdit(edit.state, transaction).status, 'rejected')
  const undo = replayEngineeringEdit(edit.state, engineeringBase(edit.state), 'undo')
  assert.equal(saveEngineeringEdit(undo.state), saveEngineeringEdit(state))
  for (const changed of [{ ...operation, postTopLevelRaiseMm: -1 }, { ...operation, postTopLevelRaiseMm: 21 },
    { ...operation, postTopLevelRaiseMm: NaN }, { ...operation, accepted: true }, { ...operation, assemblyId: 'missing' }]) {
    assert.equal(applyEngineeringEdit(state, { ...transaction, operation: changed }).status, 'rejected')
  }
  assert.equal(applyEngineeringEdit(state, { ...transaction, units: 'm' }).status, 'rejected')
  assert.equal(validateWetSupportCageChoices({ ...defaults, postTopLevelRaiseMm: 20 }).postTopLevelRaiseMm, 20)
  // Admission is a comparison domain: actual cover independently rejects20mm.
})
