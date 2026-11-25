import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableRoofId, editableWetCageId, editableWetSupportId, editableInletBankId, editableInletBankFields, editablePlantRoomId, editablePlantRoomFields, editableStudyLightingId, engineeringBase,
  engineeringTicket, replayEngineeringEdit, saveEngineeringEdit, type EngineeringEditorState, type EngineeringTicket,
} from '../../../compiler/reference-house/current-design/engineering-edit.js'
import type { EngineeringReply } from './engineering-api.js'
import './editor.css'
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const button = (id: string) => element<HTMLButtonElement>(id)
const pitch = element<HTMLInputElement>('pitch')
const inletField=element<HTMLSelectElement>('inlet-field'),inletValue=element<HTMLInputElement>('inlet-value')
const plantField=element<HTMLSelectElement>('plant-room-field'),plantValue=element<HTMLInputElement>('plant-room-value')
const cageTop = element<HTMLInputElement>('cage-top-level')
const padWidth=element<HTMLInputElement>('wet-pad-width')
const lightingDepth = element<HTMLInputElement>('lighting-depth')
const record = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const storageKey = 'ovid-current-engineering-document/1'
let state: EngineeringEditorState
let active: EngineeringTicket | null = null
let current: EngineeringReply | undefined
let comparison: EngineeringReply | undefined
let comparisonLabel = 'Starting document'
const id = () => crypto.randomUUID()
async function request(ticket: EngineeringTicket) {
  const response = await fetch('/api/engineering/compile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticket }) })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error ?? 'Engineering compilation failed')
  return result as EngineeringReply
}
function controls() {
  for (const control of document.querySelectorAll<HTMLButtonElement>('button')) control.disabled = false
  pitch.disabled = false
  pitch.value = String(state.document.stages.roofPitch.pitchDeg)
  const floor = state.document.stages.floorSection
  const bearing=record(floor)&&record(floor.wetSupport)?floor.wetSupport:undefined
  const hasBearing=typeof bearing?.padWidthMm==='number'
  element('wet-bearing-controls').hidden=!hasBearing;padWidth.disabled=!hasBearing;padWidth.value=hasBearing?String(bearing.padWidthMm):''
  const choices = record(floor) && record(floor.wetSupport) && record(floor.cageComparison) ? floor.cageComparison : undefined
  const available = typeof choices?.postTopLevelRaiseMm === 'number'
  element('wet-cage-controls').hidden = !available
  cageTop.disabled = !available
  cageTop.value = available ? String(choices.postTopLevelRaiseMm) : ''
  const inlet=state.document.stages.inletSourceEnvelope
  const hasInlet=record(inlet)&&editableInletBankFields.every(key=>typeof inlet[key]==='number')
  element('inlet-bank-controls').hidden=!hasInlet
  inletField.disabled=!hasInlet;inletValue.disabled=!hasInlet
  if(hasInlet){inletValue.value=String(inlet[inletField.value]);element('inlet-unit').textContent=inletField.value.endsWith('KgM3')?'kg/m³ density comparison':'mm'}
  const plant = record(inlet) && record(inlet.splitPlantRoom) ? inlet.splitPlantRoom : undefined
  const hasPlant = !!plant && editablePlantRoomFields.every(key => typeof plant[key] === 'number')
  element('plant-room-controls').hidden = !hasPlant
  plantField.disabled = !hasPlant; plantValue.disabled = !hasPlant
  if (hasPlant) { plantValue.value=String(plantField.value.startsWith('fittedFrame.')?(plant.fittedFrame as Record<string,unknown>)[plantField.value.slice('fittedFrame.'.length)]:plant[plantField.value]); element('plant-room-unit').textContent=plantField.value.endsWith('Kg')?'kg':'mm' }
  const lighting = state.document.stages.studyLighting
  const hasLighting = record(lighting) && typeof lighting.serviceTotalDepthMm === 'number'
  element('lighting-controls').hidden = !hasLighting
  lightingDepth.disabled = !hasLighting
  lightingDepth.value = hasLighting ? String(lighting.serviceTotalDepthMm) : ''
  button('undo').disabled = !state.undo.length
  button('redo').disabled = !state.redo.length
  element('stage-scope').textContent = `Saved stages: ${Object.keys(state.document.stages).join(', ')}. All are retained and compiled.`
}
function draw() {
  const floor=current?.floorEvidence
  element('floor-result').textContent=floor?`Actual floor: ${floor.headCount} foundation heads; normal-bearing analysis ${floor.contactComputed?'computed':'not applicable'}. ${floor.contourStatus==='deferred'?'Finite floor-contour analysis pending for this saved revision.':floor.contourStatus==='computed-local-comparison'?'Finite contour component computed; exterior band/chord, native insertion and joint resistance remain unavailable.':floor.contourStatus==='unsupported'?'The finite contour component does not support this saved revision or numerical runtime.':''} ${floor.slabSolidCompatibility.status==='common-modulus-ruled-out'?'The authored slab laws cannot describe one common positive 3D modulus; a solid replacement requires a declared constitutive change.':''} ${floor.jointStatus==='computed-rigid-joint-demand'?'Four rigid-joint demands computed; finite-node resistance remains unqualified.':floor.jointDiagnostics.includes('FOUR_L_JOINT/runtime-not-admitted')?'Joint demand unavailable for this numerical runtime; ordinary floor and cage remain computed.':'Joint-demand evidence unavailable for this request.'} ${floor.nominalHeadFanStatus==='computed-nominal-demand'?`Nominal post-head fan computed; necessary virtual-domain reserve ${floor.nominalHeadFanPlacementReserveMm ?? 'unavailable'} mm. Finite nodes, anchorage and tolerance remain unqualified.`:floor.nominalHeadFanStatus==='unsupported'?'This nominal post-head fan does not support the current input.':''}`:''
  for (const [name, result] of [['current', current], ['comparison', comparison]] as const) {
    const image = element<HTMLImageElement>(`${name}-roof`)
    if (result) image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.roof.svg)
    else image.removeAttribute('src')
    const lightingImage = element<HTMLImageElement>(`${name}-lighting`)
    if (result?.studyLighting) lightingImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.studyLighting.svg)
    else lightingImage.removeAttribute('src')
  }
  const lighting = current?.studyLighting?.comparison
  element('lighting-views').hidden = !lighting
  element('lighting-result').textContent = lighting
    ? `Unselected comparison: common axis ${lighting.commonAxisCoreDepthMm} mm from the masonry core; accessory recess ${lighting.accessoryFaceRecessMm} mm. Local enclosure geometry ${lighting.evidence.localGeometryPassing ? 'within declared checks' : 'REJECTED'}. Actual device connections, protective qualification, materials, loaded renewal and owner acceptance remain unqualified.`
    : ''
  element('lighting-diagnostics').textContent = lighting ? lighting.diagnostics.map(issue => issue.message).join(' ') : ''
  const bank=current?.inletBank
  element('inlet-bank-views').hidden=!bank
  for(const [name,result]of [['current',current],['comparison',comparison]] as const){const image=element<HTMLImageElement>(`${name}-inlet-bank`);if(result?.inletBank)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(result.inletBank.receiver.reviewSvg);else image.removeAttribute('src')}
  for(const [name,result]of [['current',current],['comparison',comparison]] as const){const image=element<HTMLImageElement>(`${name}-inlet-carrier`);if(result?.inletBank)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(result.inletBank.carrier.reviewSvg);else image.removeAttribute('src')}
  element('inlet-result').textContent=bank?`Finite route/operation/clamp envelope: ${bank.receiver.necessaryRouteOperationAndClampEnvelopeScreen?'within declared bounds':'REJECTED'}. Jacket reference ${bank.route.insulationAndJacketInventory.jacketDensityReferenceKg.toFixed(3)} kg; insulation reference ${bank.route.insulationAndJacketInventory.insulationDensityReferenceKg.toFixed(3)} kg. Flat-shelf carrier: ${bank.carrier.necessaryCarrierComparison?'within declared bounds':'REJECTED'}. Actual materials, tools, carrier, pier, coupled pressure/thermal reactions and loaded renewal remain unqualified.`:''
  const routeCandidate=bank?.route.candidateComparison
  element('inlet-candidate-result').textContent=routeCandidate?.comparison
    ? `Explicit unadopted route: ${routeCandidate.comparison.necessaryJoinedEnvelopeScreen?'within declared comparisons':'REJECTED'}. Retained services and complete package: ${routeCandidate.comparison.retained.necessaryRetainedServiceEnvelopeScreen?'within declared comparisons':'REJECTED'}. No route is selected.`
    : routeCandidate?'Explicit unadopted route unavailable for the edited connections; no historical geometry is substituted.':''
  for(const [name,result]of [['current',current],['comparison',comparison]] as const){
    const image=element<HTMLImageElement>(`${name}-inlet-candidate`),candidate=result?.inletBank?.route.candidateComparison.comparison
    image.hidden=!candidate
    if(candidate)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(candidate.reviewSvg)
    else image.removeAttribute('src')
  }
  const plantBranch=bank?.route.splitStationComparison.branchDevelopment
  const plantRoom = current?.plantRoom?.comparison
  element('inlet-plant-room-result').textContent = plantRoom
    ? plantRoom.state === 'unadopted-threshold-drainage-successor'
      ? `Plant threshold comparison: each surviving outlet receives the complete ${plantRoom.sourceOnlyLmin.toFixed(2)} L/min source challenge. Source-only drain geometry ${plantRoom.drainageGeometry.necessarySourceOnlyDrainGeometry ? 'within declared comparisons' : 'REJECTED'}. Threshold junction ${plantRoom.diagnostics.includes('SPLIT_PLANT_ROOM/threshold-bridge-comparison-fails')?'REJECTED':'within declared comparisons'}. Stored backfeed, supports and complete renewal remain unresolved; no arrangement is adopted.`
      : 'The Plant floor comparison requires the actual saved ground profile. No floor, receiver level or support is inferred from the nominal plan.'
    : ''
  for (const [name, result] of [['current', current], ['comparison', comparison]] as const) {
    const image = element<HTMLImageElement>(`${name}-inlet-plant-room`), room = result?.plantRoom?.comparison
    image.hidden = !room
    if (room) image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(room.reviewSvg)
    else image.removeAttribute('src')
  }
  element('inlet-plant-branch-result').textContent=plantBranch?.comparison
    ? `Independent Plant branch remains unadopted. Service-infill port / pipe reserve ${plantBranch.comparison.geometry.ingressBorePipePositionReserveMm.toFixed(2)} mm; retained drop / cylinder ${plantBranch.comparison.geometry.dropStoreReserveMm.toFixed(2)} mm against25 mm. ${plantBranch.diagnostics.join('; ')}.`
    : plantBranch?'Plant branch unavailable for current connections; no historical route is substituted.':''
  for(const[name,result]of[['current',current],['comparison',comparison]]as const){
    const image=element<HTMLImageElement>(`${name}-inlet-plant-branch`),branch=result?.inletBank?.route.splitStationComparison.branchDevelopment.comparison
    image.hidden=!branch
    if(branch)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(branch.reviewSvg)
    else image.removeAttribute('src')
  }
  const cage = current?.wetCage
  element('cage-result').textContent = cage
    ? `Graded raise ${cage.settings.postTopLevelRaiseMm} mm. Cage geometry: ${cage.geometry.independentPathFailureCount} path-pair, ${cage.geometry.internalClosureFailureCount} closure and ${cage.geometry.coverFailureCount} cover failures. Explicit steel ${cage.quantities.actualSteelMassUpperKg.toFixed(3)} kg. Native case ${cage.nativeCaseId}. Comparison only; post-head resistance and installed acceptance remain unqualified.`
    : ''
  element('current-caption').textContent = `Draft revision ${state.revision}`
  element('comparison-caption').textContent = comparisonLabel
  button('pin').disabled = !current
  const rows = (result: EngineeringReply | undefined) => result ? [result.roof.schedule.pitchDeg,
    result.roof.schedule.fieldSectionQZMm[2][1].toFixed(2), result.roof.schedule.slateStockComparisons.severe.court.rowsPerFace,
    result.roof.schedule.roofSlopeAreaM2.toFixed(3)] : ['—', '—', '—', '—']
  const values = rows(current), previous = rows(comparison)
  element('schedule').replaceChildren(...['Pitch (degrees)', 'Field ridge Z (mm)', 'Court slate rows · severe', 'Roof slope area (m²)'].map((label, index) => {
    const row = document.createElement('tr')
    for (const text of [label, values[index], previous[index]]) { const cell = document.createElement('td'); cell.textContent = String(text); row.append(cell) }
    return row
  }))
  element('identity').textContent = current ? `Compiled document ${current.documentIdentity.digest}` : ''
  element('affected').textContent = current && comparison ? current.documentIdentity.digest === comparison.documentIdentity.digest
    ? 'Document matches the comparison.' : 'Saved engineering choices recomputed. Nominal plans remain on their admitted basis.' : ''
  element('evidence').textContent = current ? current.roof.evidence.state === 'withheld-for-pitch-change'
    ? `Evidence withheld: ${current.roof.evidence.invalidated.join('; ')}. Nominal water-event applicability is withheld.`
    : 'Native comparison only. No installed roof, structure or water-system acceptance.' : ''
}
async function refresh() {
  const ticket = engineeringTicket(state, id())
  active = ticket
  current = undefined
  draw()
  element('analysis').textContent = `Compiling revision ${state.revision}…`
  try {
    const reply = await request(ticket)
    const accepted = currentEngineeringReply(state, active, reply)
    if (!accepted) { element('stale').textContent = `Ignored analysis from earlier revision ${reply.ticket.base.revision}.`; return }
    current = accepted
    if (!comparison) comparison = accepted
    element('analysis').textContent = `Engineering ready for revision ${state.revision}.`
    element('diagnostic').textContent = accepted.coordinationDiagnostics.map(issue => issue.message).join(' ')
    draw()
  } catch (error) {
    if (active === ticket) {
      element('analysis').textContent = `Revision ${state.revision} could not compile.`
      element('diagnostic').textContent = error instanceof Error ? error.message : String(error)
    }
  }
}
function changed(result: ReturnType<typeof applyEngineeringEdit>) {
  if (result.status === 'rejected') { element('diagnostic').textContent = result.message; return }
  if (result.state === state) return
  state = result.state
  element('diagnostic').textContent = ''
  controls()
  void refresh()
}
function edit(value: number) {
  changed(applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'degrees', base: engineeringBase(state),
    operation: { kind: 'set-roof-pitch', roofId: editableRoofId, pitchDeg: value } }))
}
element('edit').addEventListener('submit', event => { event.preventDefault(); edit(pitch.valueAsNumber) })
element('lighting-edit').addEventListener('submit', event => {
  event.preventDefault()
  changed(applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state),
    operation: { kind: 'set-lighting-service-depth', assemblyId: editableStudyLightingId, totalDepthMm: lightingDepth.valueAsNumber } }))
})
inletField.addEventListener('change',controls)
plantField.addEventListener('change',controls)
element('plant-room-edit').addEventListener('submit', event => {
  event.preventDefault()
  changed(applyEngineeringEdit(state, { schema:'current-engineering-edit/1', units:plantField.value.endsWith('Kg')?'kg':'mm',base:engineeringBase(state),
    operation:{kind:'set-plant-room-field',assemblyId:editablePlantRoomId,inputId:plantField.value,value:plantValue.valueAsNumber} }))
})
element('inlet-bank-edit').addEventListener('submit',event=>{event.preventDefault();changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:inletField.value.endsWith('KgM3')?'kg/m3':'mm',base:engineeringBase(state),operation:{kind:'set-inlet-bank-field',assemblyId:editableInletBankId,inputId:inletField.value,value:inletValue.valueAsNumber}}))})
element('wet-pad-width-edit').addEventListener('submit',event=>{event.preventDefault();changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-wet-bearing-width',assemblyId:editableWetSupportId,widthMm:padWidth.valueAsNumber}}))})
element('wet-cage-edit').addEventListener('submit', event => {
  event.preventDefault()
  changed(applyEngineeringEdit(state, { schema: 'current-engineering-edit/1', units: 'mm', base: engineeringBase(state),
    operation: { kind: 'set-wet-cage-top-level', assemblyId: editableWetCageId, postTopLevelRaiseMm: cageTop.valueAsNumber } }))
})
button('increase').addEventListener('click', () => edit(pitch.valueAsNumber + 1))
button('decrease').addEventListener('click', () => edit(pitch.valueAsNumber - 1))
for (const direction of ['undo', 'redo'] as const) button(direction).addEventListener('click', () => changed(replayEngineeringEdit(state, engineeringBase(state), direction)))
button('pin').addEventListener('click', () => { if (current) { comparison = current; comparisonLabel = `Comparison · revision ${state.revision}`; draw() } })
button('save').addEventListener('click', () => { localStorage.setItem(storageKey, saveEngineeringEdit(state)); element('storage').textContent = `Saved document revision ${state.revision}.` })
async function load(saved: string) {
  const next = beginEngineeringEdit(JSON.parse(saved), id())
  // Keep the previous document until the exact shared compiler admits the imported one.
  const starting = state
  const ticket = engineeringTicket(next, id())
  const reply = await request(ticket)
  if (state !== starting) throw new Error('The document changed while loading. Import again to replace it.')
  if (!currentEngineeringReply(next, ticket, reply)) throw new Error('Imported compilation returned a different document')
  state = next; active = ticket; current = reply; comparison = reply; comparisonLabel = 'Loaded document'
  element('diagnostic').textContent = ''
  element('stale').textContent = ''
  element('analysis').textContent = 'Engineering ready for revision 0.'
  element('storage').textContent = 'Loaded saved document; all stages and bindings retained.'
  controls(); draw()
}
button('reload').addEventListener('click', () => {
  const saved = localStorage.getItem(storageKey)
  if (!saved) { element('storage').textContent = 'No saved document in this browser.'; return }
  void load(saved).catch(error => { element('storage').textContent = String(error) })
})
button('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([saveEngineeringEdit(state)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = 'ovid-engineering-document.json'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
})
const file = element<HTMLInputElement>('document-file')
button('import').addEventListener('click', () => file.click())
file.addEventListener('change', () => {
  const selected = file.files?.[0]; file.value = ''
  const starting = state
  if (selected) void selected.text().then(saved => {
    if (state !== starting) throw new Error('The document changed while reading the file. Import again to replace it.')
    return load(saved)
  }).catch(error => { element('storage').textContent = String(error) })
})
for (const control of document.querySelectorAll<HTMLButtonElement>('button')) control.disabled = true
pitch.disabled = true
cageTop.disabled = true
lightingDepth.disabled = true
void fetch('/api/engineering/document').then(async response => {
  if (!response.ok) throw new Error('The local engineering compiler is unavailable')
  state = beginEngineeringEdit(await response.json(), id()); controls(); await refresh()
}).catch(error => { element('analysis').textContent = 'Engineering document unavailable.'; element('diagnostic').textContent = String(error) })
