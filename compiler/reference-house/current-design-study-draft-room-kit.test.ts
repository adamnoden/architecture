import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { frontStudyOpening, inspectHostedOpening } from './construction-bay/opening-inspection.js'
import { studyDraftRoomKitMethod } from './current-design/assemblies/study-draft-room-kit.js'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { applyDesignEdit, beginDesignEdit, editBase, loadDesignDraft, saveDesignDraft, type EditOperation, type EditorState } from './current-design/edit.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { analysisTicket, currentAnalysisOutput, runRevisionAnalysis } from './current-design/revision-analysis.js'
import { resolveCurrentDesign } from './current-design/resolve.js'

const accepted = readGeorgianDesignSnapshot()
const compiler = prepareCurrentDesignCompile(accepted)
const { level, openingId, hostWallId } = frontStudyOpening
const reference = { level, openingId, hostWallId }
const kit = { schema: 'ias-study-room-kit-case/1', units: 'mm', pitchMm: 300, wearingFace: 'oak' }

function begin() {
  return beginDesignEdit(accepted, 'study-change', 'SPECIMEN-STUDY-CHANGE')
}

function apply(state: EditorState, ...operations: EditOperation[]) {
  const result = applyDesignEdit(state, { schema: 'current-design-edit/1', units: 'mm', base: editBase(state), operations }, [])
  assert.equal(result.status, 'applied')
  return result.state
}

function request(state: EditorState) {
  return { schema: 'ias-study-draft-case/1', acceptedPlanDigest: compiler.source.planDigest,
    draft: JSON.parse(saveDesignDraft(state)), kit }
}

test('a saved Study position edit drives nominal geometry, occupied kit and the real relief drawing', async () => {
  const state = apply(begin(), { kind: 'move-opening', ...reference, centreMm: 1820 })
  const draft = loadDesignDraft(saveDesignDraft(state), 'study-loaded')
  const candidate = prepareCurrentDesignCompile(draft.design)
  const baseline = await compiler.studyRoomKit(kit)
  const result = await compiler.studyDraftRoomKit(request(draft))
  assert.equal(result.status, 'CANDIDATE_COMPARISON')
  assert.deepEqual(result.source, { accepted: compiler.source, draft: candidate.source })
  assert.deepEqual(resolveCurrentDesign(draft.design).disciplineBindings, [])
  assert.equal(candidate.plans().status, 'CANDIDATE_NOMINAL_PLAN_ONLY')
  const { projection } = result
  const { axisIntervalMm } = inspectHostedOpening(draft.design, frontStudyOpening).row
  const expected = axisIntervalMm.map(x => x + result.opening.nominalToOccupiedOffsetMm)
  assert.deepEqual(result.opening, { id: openingId, hostId: hostWallId, nominalCentreMm: 1820, occupiedCentreMm: 2120,
    widthMm: 1000, nominalToOccupiedOffsetMm: 300 })
  assert.deepEqual([projection.kit.opening.box[0], projection.kit.opening.box[2]], expected)
  assert.equal(projection.kit.opening.evidence.state, 'stale')
  assert.deepEqual(projection.wallTransition.field.moduleXZMm, [2695, 1280, 3145, 1730])
  assert.equal(projection.wallTransition.field.retainedHalfHeadInwardDrawMm, null)
  assert.match(projection.wallTransitionSvg!, /id="study-wall-module-set-out" d="M715\.2 675H967\.2"/)
  assert.deepEqual(projection.kit.floor, baseline.kit.floor)
  assert.deepEqual(projection.kit.grille, baseline.kit.grille)
})

test('the browser width operation changes the actual occupied aperture and can be replayed through the CLI', async () => {
  const state = apply(begin(), { kind: 'resize-opening', ...reference, widthMm: 1110 })
  const draftCase = request(state)
  const result = await compiler.studyDraftRoomKit(draftCase)
  assert.equal(result.status, 'CANDIDATE_COMPARISON')
  const { projection, opening } = result
  assert.equal(inspectHostedOpening(state.design, frontStudyOpening).row.widthMm, opening.widthMm)
  assert.deepEqual(projection.kit.opening.box, [1545, 750, 2655, 2850])
  assert.deepEqual(projection.kit.opening.evidence, { state: 'stale', code: 'RESIZED_STUDY_OPENING_FIXED_DETAILS' })
  assert.deepEqual(projection.wallTransition.field.moduleXZMm, [2730, 1280, 3180, 1730])
  const cli = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--study-draft-room-kit', '-'], {
    cwd: new URL('../../', import.meta.url),
    input: JSON.stringify({ schema: 'ias-study-draft-request/1', design: accepted, draftCase }), encoding: 'utf8',
  }))
  assert.deepEqual(cli, result)
})

test('document-wide comparison withholds changed unrelated inputs and stale or inapplicable bases', async () => {
  const openingEdit = { kind: 'move-opening', ...reference, centreMm: 1820 } as const
  const changedAssembly = apply(begin(), openingEdit, { kind: 'set-assembly-depth', assemblyId: accepted.assemblyRefs.envelope, depthMm: 411 })
  const other = accepted.storeys.FIRST.openings.find(value => value.kind === 'window')!
  const changedUpper = apply(begin(), openingEdit, { kind: 'resize-opening', level: 'FIRST', openingId: other.id,
    hostWallId: other.hostWallId, widthMm: other.widthMm - 20 })
  const stale = { ...request(apply(begin(), openingEdit)), acceptedPlanDigest: '0'.repeat(64) }
  for (const [draftCase, code] of [
    [request(changedAssembly), 'IAS_STUDY_DRAFT_OTHER_INPUT_CHANGED'],
    [request(changedUpper), 'IAS_STUDY_DRAFT_OTHER_INPUT_CHANGED'],
    [stale, 'IAS_STUDY_DRAFT_STALE_ACCEPTED_PLAN'],
  ] as const) {
    const result = await compiler.studyDraftRoomKit(draftCase)
    assert.equal(result.status, 'WITHHELD')
    assert.equal(result.diagnostics[0].code, code)
    assert.ok(!('projection' in result))
  }
  const candidateAsBasis = prepareCurrentDesignCompile(begin().design)
  const unavailable = await candidateAsBasis.studyDraftRoomKit(request(begin()))
  assert.equal(unavailable.status, 'WITHHELD')
  assert.equal(unavailable.diagnostics[0].code, 'IAS_STUDY_DRAFT_ACCEPTED_BASIS_REQUIRED')
})

test('occupied G1 conflicts and late analysis follow the saved draft and revision fences', async () => {
  const blocked = apply(begin(), { kind: 'move-opening', ...reference, centreMm: 2100 })
  const result = await compiler.studyDraftRoomKit(request(blocked))
  assert.equal(result.status, 'WITHHELD')
  assert.deepEqual(result.diagnostics, [{ code: 'IAS_STUDY_DRAFT_OCCUPIED_GEOMETRY_BLOCKED',
    message: 'STUDY_ROOM_KIT_OPENING_INTERSECTS_G1_RESERVE', objectIds: [openingId, hostWallId] }])

  const state = apply(begin(), { kind: 'move-opening', ...reference, centreMm: 1820 })
  const ticket = analysisTicket(state, 'study-kit', studyDraftRoomKitMethod)
  const savedCase = request(state)
  const analysis = await runRevisionAnalysis(state, ticket, new AbortController().signal, design =>
    compiler.studyDraftRoomKit({ ...savedCase, draft: { ...savedCase.draft, design } }))
  assert.equal(currentAnalysisOutput(state, ticket, analysis)?.status, 'CANDIDATE_COMPARISON')
  const newer = apply(state, { kind: 'move-opening', ...reference, centreMm: 1830 })
  assert.equal(currentAnalysisOutput(newer, ticket, analysis), undefined)
})
