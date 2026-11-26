import {readRearBearingSettings} from '../../../compiler/reference-house/current-design/structural-rear-bearing.js'
import {readWetBeamEndDevelopmentControls} from '../../../compiler/reference-house/current-design/structural-wet-beam-end-settings.js'
import {readGroundPocketSettings} from '../../../compiler/reference-house/current-design/structural-ground-pocket-settings.js'
import {readCurrentFiniteJointSettings,currentFiniteJointDefaults} from '../../../compiler/reference-house/current-design/structural-current-finite-joint-settings.js'
import { applyEngineeringEdit, beginEngineeringEdit, currentEngineeringReply, editableRoofId, editableWetCageId, editableWetSupportId, editableWetBeamEndId, editableInletBankId, editableInletBankFields, editablePlantRoomId, editablePlantRoomFields, editableStoreDrainId, editableStoreDrainFields, plantRoomEditableNumber, editableStudyLightingId, engineeringBase,
  engineeringTicket, replayEngineeringEdit, saveEngineeringEdit, editableFloorSectionId, editableRearBearingId, editableDistributedFloorId, type EngineeringEditorState, type EngineeringTicket,
} from '../../../compiler/reference-house/current-design/engineering-edit.js'
import type { EngineeringReply } from './engineering-api.js'
import './editor.css'
const element = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const button = (id: string) => element<HTMLButtonElement>(id)
const pitch = element<HTMLInputElement>('pitch')
const inletField=element<HTMLSelectElement>('inlet-field'),inletValue=element<HTMLInputElement>('inlet-value')
const plantField=element<HTMLSelectElement>('plant-room-field'),plantValue=element<HTMLInputElement>('plant-room-value')
const drainField=element<HTMLSelectElement>('store-drain-field'),drainValue=element<HTMLInputElement>('store-drain-value')
const cageTop = element<HTMLInputElement>('cage-top-level')
const endMandrel = element<HTMLInputElement>('beam-end-mandrel')
const padWidth=element<HTMLInputElement>('wet-pad-width')
const lightingDepth = element<HTMLInputElement>('lighting-depth')
const groundPlatePitch=element<HTMLInputElement>('ground-plate-pitch'),groundContactPitch=element<HTMLInputElement>('ground-contact-pitch'),groundExecution=element<HTMLSelectElement>('ground-execution')
const finiteEnabled=element<HTMLInputElement>('finite-joint-enabled'),finiteYoung=element<HTMLSelectElement>('finite-joint-young'),finitePitch=element<HTMLSelectElement>('finite-joint-pitch'),finiteExecution=element<HTMLSelectElement>('finite-joint-execution')
const southwestWidth=element<HTMLInputElement>('southwest-core-width')
const rearOpening=element<HTMLInputElement>('rear-bearing-opening'),rearExecution=element<HTMLSelectElement>('rear-bearing-execution')
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
  const distributed=state.document.stages.distributedFloor
  const widths=record(distributed)&&record(distributed.cornerWidthsMm)?distributed.cornerWidthsMm:undefined
  element('southwest-width-controls').hidden=typeof widths?.SW!=='number'
  southwestWidth.value=typeof widths?.SW==='number'?String(widths.SW):''
  element('finite-joint-controls').hidden=!record(floor)
  if(record(floor)){
    const value=readCurrentFiniteJointSettings(floor.finiteJointComparison??currentFiniteJointDefaults)
    finiteEnabled.checked=value.enabled;finiteYoung.value=String(value.youngMPa);finitePitch.value=String(value.solidPitchMm);finiteExecution.value=value.execution
  }
  const hasRear=record(floor)&&Object.hasOwn(floor,'rearBearingComparison')
  let rear:ReturnType<typeof readRearBearingSettings>|undefined
  if(hasRear){try{rear=readRearBearingSettings(floor.rearBearingComparison)}catch{/* The compiler reports the malformed saved stage; no replacement choices are invented. */}}
  element('rear-bearing-controls').hidden=!hasRear
  rearOpening.disabled=!rear;rearExecution.disabled=!rear
  if(rear){const opening=rear.openingYMm as number[];rearOpening.value=String(opening[1]!-opening[0]!);rearExecution.value=String(rear.execution)}
  const ground=state.document.stages.groundPocketLoads
  element('ground-pocket-controls').hidden=!record(ground)
  if(record(ground)){const choice=readGroundPocketSettings(ground);groundPlatePitch.value=String(choice.settings.platePitchMm);groundContactPitch.value=String(choice.settings.contactPitchMm);groundExecution.value=choice.execution}
  const bearing=record(floor)&&record(floor.wetSupport)?floor.wetSupport:undefined
  const hasBearing=typeof bearing?.padWidthMm==='number'
  element('wet-bearing-controls').hidden=!hasBearing;padWidth.disabled=!hasBearing;padWidth.value=hasBearing?String(bearing.padWidthMm):''
  const choices = record(floor) && record(floor.wetSupport) && record(floor.cageComparison) ? floor.cageComparison : undefined
  const available = typeof choices?.postTopLevelRaiseMm === 'number'
  element('wet-cage-controls').hidden = !available
  cageTop.disabled = !available
  cageTop.value = available ? String(choices.postTopLevelRaiseMm) : ''
  let endControls
  if (record(floor) && floor.thicknessMm === 200 && record(floor.wetSupport) && record(floor.cageComparison)
    && floor.beamEndDevelopment !== undefined) {
    try { endControls = readWetBeamEndDevelopmentControls(floor.beamEndDevelopment) } catch { /* Compiler reports unsupported saved controls. */ }
  }
  element('wet-beam-end-controls').hidden = !endControls
  endMandrel.disabled = !endControls
  endMandrel.value = endControls ? String(endControls.endReturnMandrelMm) : ''
  const inlet=state.document.stages.inletSourceEnvelope
  const hasInlet=record(inlet)&&editableInletBankFields.every(key=>typeof inlet[key]==='number')
  element('inlet-bank-controls').hidden=!hasInlet
  inletField.disabled=!hasInlet;inletValue.disabled=!hasInlet
  if(hasInlet){inletValue.value=String(inlet[inletField.value]);element('inlet-unit').textContent=inletField.value.endsWith('KgM3')?'kg/m³ density comparison':'mm'}
  const plant = record(inlet) && record(inlet.splitPlantRoom) ? inlet.splitPlantRoom : undefined
  const hasPlant = !!plant && editablePlantRoomFields.every(key => plantRoomEditableNumber(plant,key) !== undefined)
  element('plant-room-controls').hidden = !hasPlant
  plantField.disabled = !hasPlant; plantValue.disabled = !hasPlant
  if (hasPlant) { plantValue.value=String(plantRoomEditableNumber(plant,plantField.value)); element('plant-room-unit').textContent=plantField.value.endsWith('Kg')?'kg':'mm' }
  const drain=record(inlet)&&record(inlet.storeDrain)?inlet.storeDrain:undefined,hasDrain=!!drain&&editableStoreDrainFields.every(k=>typeof drain[k]==='number')
  element('store-drain-controls').hidden=!hasDrain;drainField.disabled=!hasDrain;drainValue.disabled=!hasDrain;if(hasDrain)drainValue.value=String(drain[drainField.value])
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
  const finite=current?.currentFiniteJoint
  element('finite-joint-result').textContent=finite
    ?`${finite.status==='analysis-pending'?'Finite joint analysis prepared for this saved revision.':finite.status==='computed-unselected-comparison'?`${finite.controls.enabled?'Finite southwest joint':'Matched conventional RC reference'} computed in the ${finite.headCount}-head house.`:'Finite joint comparison unsupported for this saved revision.'} ${finite.diagnostics.map(d=>d.message).join(' ')}`:''
  element('finite-joint-caption').textContent=finite?.controls.enabled?'Computed southwest joint and actual house response · unselected':'Matched conventional RC reference · unselected'
  element('finite-joint-views').hidden=!finite?.floorSvg
  const finiteImage=element<HTMLImageElement>('current-finite-joint')
  if(finite?.floorSvg)finiteImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(finite.floorSvg)
  else finiteImage.removeAttribute('src')
  const rear=current?.rearBearing,proposal=rear?.proposal
  element('rear-bearing-result').textContent=rear
    ?`${rear.status==='analysis-pending'?'Rear bearing proposal prepared; full replacement analysis is pending.':rear.status==='computed-unselected-comparison'?`Rear bearing response computed in the ${rear.nativeHeadCount}-head house; unselected.`:'Rear bearing comparison unsupported for this saved revision.'} ${proposal?`Actual raw opening ${proposal.rawOpeningYMm[1]-proposal.rawOpeningYMm[0]} mm; finished opening ${proposal.finishedClearWidthMm} mm; south cross passage ${proposal.southCrossPassageMm} mm. Layout/renewal geometry ${proposal.planPass?'within its comparison':'unsupported'}.`:''} ${rear.diagnostics.map(d=>d.message).join(' ')} No structural resistance, genuine arch, physical handling or owner acceptance is earned.`:''
  element('rear-bearing-views').hidden=!proposal
  for(const[view,svg]of[['plan',proposal?.planSvg],['section',proposal?.sectionSvg]]as const){
    const image=element<HTMLImageElement>(`current-rear-bearing-${view}`)
    if(svg)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);else image.removeAttribute('src')
  }
  const ground=current?.groundPocketLoads
  element('ground-pocket-result').textContent=ground?.status==='computed-unselected-candidate'
    ?`Utility and Plant floor gravity: ${ground.addedPhysicalGKN.toFixed(6)} kN through ${ground.headCount} foundation heads. ${ground.receiverCutsAvailable?`Physical beam cuts recovered in ${ground.receiverMemberCount} members.`:"Physical beam cuts unavailable."} Unselected comparison; complete installed loads and receiver resistance remain unresolved.`
    :ground?`${ground.status==='analysis-pending'?'Floor-support analysis prepared for this saved revision.':'Floor-support comparison unavailable.'} ${ground.diagnostics.map(issue=>issue.message).join(' ')}`:''
  const floor=current?.floorEvidence
  element('floor-result').textContent=floor?`Actual floor: ${floor.headCount} foundation heads; ${floor.lowerMasonryStatus?`Separate lower-masonry candidate: ${floor.lowerMasonryStatus}; no accepted replacement or joint resistance.`:''} normal-bearing analysis ${floor.contactComputed?'computed':'not applicable'}. ${floor.contourStatus==='deferred'?'Finite floor-contour analysis pending for this saved revision.':floor.contourStatus==='computed-local-comparison'?'Finite contour component computed; exterior band/chord, native insertion and joint resistance remain unavailable.':floor.contourStatus==='unsupported'?'The finite contour component does not support this saved revision or numerical runtime.':''} ${floor.slabSolidCompatibility.status==='common-modulus-ruled-out'?'The authored slab laws cannot describe one common positive 3D modulus; a solid replacement requires a declared constitutive change.':''} ${floor.jointStatus==='computed-rigid-joint-demand'?'Four rigid-joint demands computed; finite-node resistance remains unqualified.':floor.jointDiagnostics.includes('FOUR_L_JOINT/runtime-not-admitted')?'Joint demand unavailable for this numerical runtime; ordinary floor and cage remain computed.':'Joint-demand evidence unavailable for this request.'} ${floor.nominalHeadFanStatus==='computed-nominal-demand'?`Nominal post-head fan computed; necessary virtual-domain reserve ${floor.nominalHeadFanPlacementReserveMm ?? 'unavailable'} mm. Finite nodes, anchorage and tolerance remain unqualified.`:floor.nominalHeadFanStatus==='unsupported'?'This nominal post-head fan does not support the current input.':''}`:''
  for (const [name, result] of [['current', current], ['comparison', comparison]] as const) {
    const image = element<HTMLImageElement>(`${name}-roof`)
    if (result) image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.roof.svg)
    else image.removeAttribute('src')
    const lightingImage = element<HTMLImageElement>(`${name}-lighting`)
    if (result?.studyLighting) lightingImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(result.studyLighting.svg)
    else lightingImage.removeAttribute('src')
  }
  const lighting = current?.studyLighting?.comparison
  const homeRuns=current?.studyLighting?.homeRuns
  element('lighting-home-run-views').hidden=!homeRuns
  element('lighting-home-run-result').textContent=homeRuns?`Unselected conventional station: ${homeRuns.choices.bayWidthMm} mm bay, ${homeRuns.totalDepthMm} mm total local depth. Declared geometry ${homeRuns.status==='GEOMETRY_REJECTED'?'REJECTED':'within the stated checks'}. Actual supply, terminals, materials and physical performance remain unqualified.`:''
  const homeRunImage=element<HTMLImageElement>('current-lighting-home-runs')
  if(current?.studyLighting?.homeRunSvg)homeRunImage.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(current.studyLighting.homeRunSvg)
  else homeRunImage.removeAttribute('src')
  element('study-eye-level-views').hidden = !current?.studyRoom
  for (const tone of ['day', 'evening'] as const) {
    const image = element<HTMLImageElement>(`current-study-${tone}`), view = current?.studyRoom?.[tone]
    if (view) image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(view.svg)
    else image.removeAttribute('src')
  }
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
  const drain=current?.storeDrain?.state==='cold-maintenance-drawdown-comparison'?current.storeDrain.comparison:null
  element('store-drain-views').hidden=!drain
  element('store-drain-result').textContent=drain?`Factory low-point drain comparison: cold upper ${drain.coldEnergy.maximumLmin.toFixed(3)} L/min; cargo ceiling ${drain.cargoDemand.completeColdCargoDesignCeilingKg} kg; applied one-wheel comparison ${drain.cargoApplication.appliedWheelN.toFixed(2)} N. Residual requirement ${drain.finiteInventory.maximumCargoResidualWaterKg.toFixed(3)} / ${drain.choice.cargoResidualBudgetKg} kg. Pressure, thermal seams, materials, supports and physical qualification remain open.`:''
  for(const[name,result]of[['current',current],['comparison',comparison]]as const){const image=element<HTMLImageElement>(`${name}-store-drain`),d=result?.storeDrain?.state==='cold-maintenance-drawdown-comparison'?result.storeDrain.comparison:null;image.hidden=!d;if(d)image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(d.reviewSvg);else image.removeAttribute('src')}
  const cage = current?.wetCage
  element('cage-result').textContent = cage
    ? `Graded raise ${cage.settings.postTopLevelRaiseMm} mm. Cage geometry: ${cage.geometry.independentPathFailureCount} path-pair, ${cage.geometry.internalClosureFailureCount} closure and ${cage.geometry.coverFailureCount} cover failures. Explicit steel ${cage.quantities.actualSteelMassUpperKg.toFixed(3)} kg. Native case ${cage.nativeCaseId}. Comparison only; post-head resistance and installed acceptance remain unqualified.`
    : ''
  const end = current?.wetBeamEnd, endComparison = end?.comparison
  element('wet-beam-end-views').hidden = !endComparison
  element('beam-end-result').textContent = endComparison
    ? `Unadopted end return: mandrel ${endComparison.controls.endReturnMandrelMm} mm; strut cotangent comparisons ${endComparison.controls.strutCotangentComparisons.join(', ')}. Geometry: ${endComparison.geometry.independentPathFailureCount} path-pair, ${endComparison.geometry.internalClosureFailureCount} closure and ${endComparison.geometry.coverFailureCount} cover failures. Explicit steel ${endComparison.steelMassUpperKg.toFixed(3)} kg. Native case ${endComparison.nativeCaseId}. Native loads unchanged. Straight-section forces use a chosen allocation; curved-bar force, finite end transfer, anchorage and placement remain unresolved.`
    : end?.status === 'unsupported' ? `Local end comparison unavailable. ${end.diagnostics.map(issue => issue.message).join(' ')}` : ''
  for (const [name,result] of [['current',current],['comparison',comparison]] as const) {
    const image = element<HTMLImageElement>(`${name}-beam-end`), candidate = result?.wetBeamEnd?.comparison
    image.hidden = !candidate
    if (candidate) image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(candidate.svg)
    else image.removeAttribute('src')
  }
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
element('rear-bearing-edit').addEventListener('submit',event=>{
  event.preventDefault()
  changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),
    operation:{kind:'set-floor-rear-bearing-comparison',assemblyId:editableRearBearingId,openingWidthMm:rearOpening.valueAsNumber,execution:rearExecution.value}}))
})
element('finite-joint-edit').addEventListener('submit',event=>{
  event.preventDefault()
  changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),
    operation:{kind:'set-floor-finite-joint-comparison',assemblyId:editableFloorSectionId,settings:{enabled:finiteEnabled.checked,youngMPa:Number(finiteYoung.value),solidPitchMm:Number(finitePitch.value),execution:finiteExecution.value}}}))
})
element('southwest-width-edit').addEventListener('submit',event=>{
  event.preventDefault()
  changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-southwest-core-width',assemblyId:editableDistributedFloorId,widthMm:southwestWidth.valueAsNumber}}))
})
element('ground-pocket-edit').addEventListener('submit',event=>{
 event.preventDefault()
 const choice=readGroundPocketSettings(state.document.stages.groundPocketLoads)
 changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),operation:{kind:'set-ground-pocket-comparison',assemblyId:choice.id,settings:{...choice,execution:groundExecution.value,settings:{...choice.settings,platePitchMm:groundPlatePitch.valueAsNumber,contactPitchMm:groundContactPitch.valueAsNumber}}}}))
})
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
element('wet-beam-end-edit').addEventListener('submit',event => {
  event.preventDefault()
  changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:'mm',base:engineeringBase(state),
    operation:{kind:'set-wet-beam-end-mandrel',assemblyId:editableWetBeamEndId,endReturnMandrelMm:endMandrel.valueAsNumber}}))
})
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
endMandrel.disabled = true
lightingDepth.disabled = true
void fetch('/api/engineering/document').then(async response => {
  if (!response.ok) throw new Error('The local engineering compiler is unavailable')
  state = beginEngineeringEdit(await response.json(), id()); controls(); await refresh()
}).catch(error => { element('analysis').textContent = 'Engineering document unavailable.'; element('diagnostic').textContent = String(error) })

drainField.addEventListener('change',()=>controls())
button('apply-store-drain').addEventListener('click',()=>changed(applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units:drainField.value.endsWith('Kg')?'kg':'mm',base:engineeringBase(state),operation:{kind:'set-store-drain-field',assemblyId:editableStoreDrainId,inputId:drainField.value,value:drainValue.valueAsNumber}})))
