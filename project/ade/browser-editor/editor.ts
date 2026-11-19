import documents from 'virtual:ade-editor-documents'
import {
  applyDesignEdit, beginDesignEdit, editBase, inspectDraftGeometry, loadDesignDraft,
  replayDesignEdit, saveDesignDraft, type EditOperation, type EditorState,
} from '../../../compiler/reference-house/current-design/edit.js'
import {
  analysisTicket, currentAnalysisOutput, runRevisionAnalysis, type AnalysisTicket,
} from '../../../compiler/reference-house/current-design/revision-analysis.js'
import { candidatePlanMethod } from '../../../compiler/reference-house/current-design/candidate-plan.js'
import type { DesignSnapshot, StoreyId } from '../../../compiler/reference-house/current-design/snapshot.js'
import type { Plans, PlanRequest, PlanResponse } from './plan-worker.js'
import './editor.css'

const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const select = (id: string) => element<HTMLSelectElement>(id)
const button = (id: string) => element<HTMLButtonElement>(id)
const input = element<HTMLInputElement>('value')
const diagnostic = element('diagnostic')
const analysis = element('analysis')
const storage = element('storage')
const storageKey = 'ade-candidate-current-design-draft/1'
const label = (level: StoreyId) => level === 'GROUND' ? 'Ground' : 'First'
const worker = new Worker(new URL('./plan-worker.ts', import.meta.url), { type: 'module' })
const pending = new Map<string, { resolve: (plans: Plans) => void; reject: (error: Error) => void }>()
worker.addEventListener('message', (event: MessageEvent<PlanResponse>) => {
  const response = event.data
  const request = pending.get(response.requestId)
  if (!request) return
  pending.delete(response.requestId)
  if ('plans' in response) request.resolve(response.plans)
  else request.reject(new Error(response.error))
})
worker.addEventListener('error', event => {
  for (const request of pending.values()) request.reject(new Error(event.message || 'The plan worker failed'))
  pending.clear()
})
function requestPlans(design: DesignSnapshot, requestId: string) {
  return new Promise<Plans>((resolve, reject) => {
    pending.set(requestId, { resolve, reject })
    worker.postMessage({ design, requestId } satisfies PlanRequest)
  })
}

let state: EditorState
let active: AnalysisTicket | null = null
let live: Plans | undefined
let comparison: { label: string; plans?: Plans; requestId: string }
const id = () => crypto.randomUUID()
const level = () => select('storey').value as StoreyId

interface Option {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly change: (value: number) => EditOperation
}
function options(): readonly Option[] {
  const { design } = state
  const story = level()
  const storey = design.storeys[story]
  switch (select('kind').value) {
    case 'partition':
      return storey.partitions.map(wall => {
        const axis = wall.from[0] === wall.to[0] ? 0 : 1
        return {
          id: wall.id, label: `${wall.id} (${axis === 0 ? 'X' : 'Y'})`, value: wall.from[axis],
          change: coordinateMm => ({ kind: 'move-wall', level: story, wallId: wall.id, coordinateMm }),
        }
      })
    case 'assembly':
      return design.assemblies.map(assembly => ({
        id: assembly.id, label: assembly.role, value: assembly.depthMm,
        change: depthMm => ({ kind: 'set-assembly-depth', assemblyId: assembly.id, depthMm }),
      }))
    default:
      return storey.openings.map(opening => ({
        id: opening.id, label: opening.id, value: opening.widthMm,
        change: widthMm => ({ kind: 'resize-opening', level: story, openingId: opening.id, hostWallId: opening.hostWallId, widthMm }),
      }))
  }
}

function redrawControls() {
  const object = select('object')
  const previous = object.value
  const list = options()
  object.replaceChildren(...list.map(item => new window.Option(item.label, item.id)))
  if (list.some(item => item.id === previous)) object.value = previous
  const chosen = list.find(item => item.id === object.value)
  input.value = chosen ? String(chosen.value) : ''
  const kind = select('kind').value
  element('value-label').textContent = { partition: 'Position (mm)', assembly: 'Depth (mm)' }[kind] ?? 'Width (mm)'
  element('scope').textContent = kind === 'partition'
    ? 'Only free-standing partitions with a clear travel path can move. The separate study demonstrates this operation.'
    : ''
  const report = inspectDraftGeometry(state)
  element('clearance').textContent = `Nominal ground clear height ${report.nominalClearHeightMm} mm`
  button('undo').disabled = !state.undo.length
  button('redo').disabled = !state.redo.length
  object.disabled = input.disabled = button('decrease').disabled = button('increase').disabled = !chosen
  element<HTMLButtonElement>('edit').querySelector('button[type="submit"]')!.toggleAttribute('disabled', !chosen)
}

function drawPlans() {
  const draw = (elementId: string, plans: Plans | undefined) => {
    const img = element<HTMLImageElement>(elementId)
    const svg = plans?.[level()]
    if (svg) img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
    else img.removeAttribute('src')
  }
  draw('current-plan', live)
  draw('comparison-plan', comparison.plans)
  element('current-caption').textContent = `Draft revision ${state.revision}`
  element('comparison-caption').textContent = comparison.label
  button('pin').disabled = !live
  const affected = (['GROUND', 'FIRST'] as const).filter(storey => live?.[storey] !== comparison.plans?.[storey]).map(label)
  element('affected').textContent = !live || !comparison.plans ? '' : affected.length
    ? `Changed plans: ${affected.join(', ')}` : 'Both plans match the comparison.'
}

function diagnose(message = '', objectId?: string) {
  const obj = select('object')
  diagnostic.replaceChildren(document.createTextNode(message))
  if (!objectId) return
  diagnostic.append(document.createTextNode(` · ${objectId}`))
  const targetLevel = (['GROUND', 'FIRST'] as const).find(story => objectId.startsWith(story + '/'))
  const targetKind = targetLevel
    ? state.design.storeys[targetLevel].partitions.some(item => item.id === objectId) ? 'partition'
      : state.design.storeys[targetLevel].openings.some(item => item.id === objectId) ? 'opening' : undefined
    : state.design.assemblies.some(item => item.id === objectId) ? 'assembly' : undefined
  if (!targetKind) return
  const focus = document.createElement('button')
  focus.type = 'button'
  focus.textContent = 'Select object'
  focus.addEventListener('click', () => {
    if (targetLevel) select('storey').value = targetLevel
    select('kind').value = targetKind
    redrawControls()
    obj.value = objectId
    redrawControls()
    drawPlans()
    obj.focus()
  })
  diagnostic.append(document.createTextNode(' '), focus)
}

async function refresh() {
  const ticket = analysisTicket(state, id(), candidatePlanMethod.id)
  active = ticket
  live = undefined
  drawPlans()
  analysis.textContent = `Updating revision ${state.revision}…`
  const run = await runRevisionAnalysis(state, ticket, new AbortController().signal, design => requestPlans(design, ticket.requestId))
  const output = currentAnalysisOutput(state, active, run)
  if (!output) {
    if (active === ticket && run.status === 'failed') analysis.textContent = run.message
    else if (run.status === 'complete') element('stale').textContent = `Ignored analysis from earlier revision ${run.base.revision}.`
    return
  }
  live = output
  analysis.textContent = `Plans ready for revision ${state.revision}.`
  drawPlans()
}

function changed(result: ReturnType<typeof applyDesignEdit>) {
  if (result.status === 'rejected') {
    diagnose(result.diagnostic.message, result.diagnostic.objectIds[0])
    return
  }
  if (result.state === state) return
  state = result.state
  const issue = inspectDraftGeometry(state).diagnostics[0]
  diagnose(issue?.message, issue?.input.objectId)
  redrawControls()
  void refresh()
}

function edit(value: number) {
  const selected = options().find(option => option.id === select('object').value)
  if (!selected) return
  changed(applyDesignEdit(state, {
    schema: 'current-design-edit/1', units: 'mm', base: editBase(state), operations: [selected.change(value)],
  }, []))
}

function reset(next: EditorState, comparisonLabel: string) {
  state = next
  const requestId = id()
  comparison = { label: comparisonLabel, requestId }
  element('stale').textContent = ''
  const issue = inspectDraftGeometry(next).diagnostics[0]
  diagnose(issue?.message, issue?.input.objectId)
  redrawControls()
  void requestPlans(next.design, requestId).then(plans => {
    if (comparison.requestId !== requestId) return
    comparison.plans = plans
    drawPlans()
  }).catch(error => {
    if (comparison.requestId === requestId) element('comparison-caption').textContent = `Comparison unavailable. ${error.message}`
  })
  void refresh()
}

element('edit').addEventListener('submit', event => { event.preventDefault(); edit(input.valueAsNumber) })
button('decrease').addEventListener('click', () => edit(input.valueAsNumber - 10))
button('increase').addEventListener('click', () => edit(input.valueAsNumber + 10))
for (const control of ['kind', 'object', 'storey']) {
  select(control).addEventListener('change', () => {
    const issue = inspectDraftGeometry(state).diagnostics[0]
    diagnose(issue?.message, issue?.input.objectId)
    redrawControls()
    drawPlans()
  })
}
for (const direction of ['undo', 'redo'] as const) {
  button(direction).addEventListener('click', () => changed(replayDesignEdit(state, editBase(state), direction, [])))
}
button('pin').addEventListener('click', () => {
  if (!live) return
  comparison = { label: `Comparison · revision ${state.revision}`, plans: live, requestId: id() }
  drawPlans()
})
button('save').addEventListener('click', () => {
  try {
    localStorage.setItem(storageKey, saveDesignDraft(state))
    storage.textContent = `Saved draft revision ${state.revision} in this browser.`
  } catch (error) { storage.textContent = String(error) }
})
function loadDraft(saved: string) {
  reset(loadDesignDraft(saved, id()), 'Comparison · loaded document')
  storage.textContent = 'Loaded saved draft into a new edit session.'
}

button('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([saveDesignDraft(state)], { type: 'application/json' }))
  const download = document.createElement('a')
  download.href = url
  download.download = 'ovid-candidate-draft.json'
  download.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})
const fileInput = element<HTMLInputElement>('draft-file')
button('import').addEventListener('click', () => fileInput.click())
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  fileInput.value = ''
  if (!file) return
  const startingState = state
  try {
    const saved = await file.text()
    if (state === startingState) loadDraft(saved)
    else storage.textContent = 'The draft changed while reading the file. Import again to replace it.'
  } catch (error) { storage.textContent = String(error) }
})
button('reload').addEventListener('click', () => {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) { storage.textContent = 'No saved draft in this browser.'; return }
    loadDraft(saved)
  } catch (error) { storage.textContent = String(error) }
})
function newDraft() {
  const basis = select('basis').value as keyof typeof documents
  reset(beginDesignEdit(documents[basis], id(), `SPECIMEN-EDITOR-${id()}`), 'Comparison · starting document')
  storage.textContent = ''
}
button('new-draft').addEventListener('click', newDraft)
newDraft()
