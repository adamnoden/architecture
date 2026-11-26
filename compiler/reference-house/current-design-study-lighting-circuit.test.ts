import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {prepareCurrentDesignCompile} from './current-design/compile.js'
import {resolveCurrentDesign} from './current-design/resolve.js'
import {readEngineeringEditDocument} from './current-design/engineering-edit.js'
import {deriveStudyLighting,lightingBasis,readLightingComponents} from './current-design/assemblies/study-lighting.js'
import {compileStudyStructuralRenewal,studyPanelTransferProfile} from './current-design/assemblies/study-structural-renewal.js'
const document=readEngineeringEditDocument(JSON.parse(readFileSync(new URL('../../project/ccr/studies/working-house-comparison.json',import.meta.url),'utf8')))
assert.ok(document.stages.studyRoomKit&&document.stages.distributedFloor&&document.stages.studyLighting)
const compiler=prepareCurrentDesignCompile(document.design),kit=await compiler.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...document.stages.studyRoomKit},document.stages.distributedFloor)
const basis=lightingBasis(resolveCurrentDesign(document.design),kit),components=readLightingComponents(),input={schema:'ias-study-lighting-case/1',units:'mm',...document.stages.studyLighting}
const run=(c=components,b=basis)=>deriveStudyLighting(input,b,c)

test('actual saved200/95case specifies two source-bound ways and complete ordinary terminal nets',()=>{
 const r=run(),c=r.circuit,h=r.construction.localHomeRunComparison
 assert.equal((document.stages.distributedFloor as {cornerWidthsMm:{SW:number}}).cornerWidthsMm.SW,200)
 assert.equal(r.commonRoom.bands.length,5)
 assert.equal(h.totalDepthMm,95)
 assert.deepEqual(h.issues,[])
 assert.equal(c.status,'SPECIFIED_DEVELOPMENT')
 assert.deepEqual(c.issues,[])
 assert.deepEqual(c.sourceBinding.consumerStationXYWHMm,[9397,1750,300,650])
 assert.deepEqual(c.feeders.map(f=>f.ratedA),[16,6])
 assert.equal(c.physicalMILengths,5)
 assert.equal(c.cableEnds,10)
 assert.deepEqual(c.cableStock.references,['Pyrotenax2L2.5'])
 assert.ok(c.calculations.every(q=>q.externalTailComparison.withstandA2s===82656.25&&!q.externalTailComparison.actualFullFaultRangeQualified))
 assert.equal(c.terminalSchedule[1]!.publishedMaximumMm2,6)
 assert.equal(c.terminalSchedule[2]!.publishedMaximumMm2,null)
 assert.deepEqual(c.nets.find(n=>n.id==='L-SL')!.ends,['SWITCH/L1','SOURCE/L-SL','LAMP/L'])
 assert.deepEqual(c.sourceBox.terminalNets,['S-L','S-N','L-L','L-N','L-SL'])
 assert.ok(c.homeRuns.every(p=>p.transition.straightAboveMm>=5&&p.fillFraction<0.4&&p.insideRadiusMm>=p.requiredInsideRadiusMm&&p.transition.counterholdRearReserveMm>=5&&p.transition.sideToolReserveMm>=5))
 assert.ok(c.pairReserveMm>20)
 assert.ok(c.neighbourToolChecks.every(p=>p.reserveMm>=5))
 assert.ok(c.retainedChecks.every(p=>p.reserveMm>=5))
 assert.ok(c.sourceBox.renewal.cradleInFloor&&c.sourceBox.renewal.moduleReserveMm>=5)
 assert.ok(c.sourceBox.renewal.checks.every(p=>p.reserveMm>=5))
 assert.deepEqual(c.feeders.map(f=>f.wallCrossings.map(w=>w.wallId).sort()),Array.from({length:2},()=>['service-spine','study-L-north','wc-north']))
 assert.ok(c.feeders.every(f=>f.wallCrossings.every(w=>w.straightThroughCore&&w.archReserveMm!>100)))
 assert.ok(c.calculations.every(q=>q.loadA<=q.conditionalRatingA&&q.dropV<q.limitV&&q.maximumZePlusJointsOhm>2))
 assert.ok(Math.abs(c.calculations[1]!.lineLengthM-c.calculations[1]!.cpcLengthM-2*c.homeRuns[1]!.lengthMm/1000)<1e-9)
 for(const[k,v]of Object.entries(c.qualifications))assert.equal(v,k==='designNetsSpecified',k)
 assert.equal(c.sourceBinding.CUCatastrophicWaterExposureQualified,false)
 assert.ok(c.calculations.every(q=>q.actualPfcA===null&&!q.adiabaticQualified))
})

test('source change recomputes the feed and evidence while unrelated room/kitchen remain controls',()=>{
 const a=run(),b=structuredClone(basis);b.electrical.consumerStationXYWHMm[2]+=200
 const moved=run(components,b)
 assert.notEqual(moved.circuit.designDigest,a.circuit.designDigest)
 assert.notEqual(moved.circuit.feeders[0]!.lengthMm,a.circuit.feeders[0]!.lengthMm)
 assert.deepEqual(moved.commonRoom,a.commonRoom)
 assert.deepEqual(moved.kitchen,a.kitchen)
 const c=structuredClone(components);c.circuitDesign={...c.circuitDesign,combinedRatingFactor:0.4}
 assert.ok(run(c).circuit.issues.some(i=>i.endsWith('rating-rejected')))
 assert.deepEqual(run(c).circuit.nets,a.circuit.nets)
})

test('short bend, shallow box, arch crossing, old low origin, overloaded source and missing cable fail explicitly',()=>{
 const edit=(value:Partial<typeof components.circuitDesign>)=>{const c=structuredClone(components);c.circuitDesign={...c.circuitDesign,...value};return run(c).circuit}
 assert.ok(edit({deviceTerminalLimitsMm2:{socket:null,switch:6,lamp:1.5}}).issues.includes('lamp:device-terminal-size-rejected'))
 assert.ok(edit({bendRadiusMm:30}).issues.some(i=>i.includes('bend-rejected')))
 assert.ok(edit({boxSizeMm:[225,100,40]}).issues.some(i=>i.includes('source-gland-body-rejected')))
 assert.ok(edit({boxSizeMm:[100,100,75]}).issues.some(i=>i.includes('source-gland-tool-rejected')||i.includes('terminal-holder-space-rejected')))
 assert.ok(edit({spineYMm:3200}).issues.some(i=>i.includes('arch-rejected')))
 const old=structuredClone(components);old.localHomeRunCandidate={...old.localHomeRunCandidate,sourceRiseMm:0}
 assert.ok(run(old).circuit.issues.some(i=>i.includes('source-bend-rejected')))
 const b=structuredClone(basis);b.electrical.phaseLoadA[2]=79
 assert.ok(run(components,b).circuit.issues.includes('phase-budget-rejected'))
 const c=structuredClone(components);c.circuitDesign={...c.circuitDesign,cables:{}}
 assert.throws(()=>run(c),/CABLE_REFERENCE_MISSING/)
})

test('actual closed source enclosure participates in every136 floor, preparation and furniture trajectory',async()=>{
 const result=await compiler.studyLighting(input,kit)
 assert.ok('closedSourceFloorRenewal' in result.lighting.circuit)
 const replay=result.lighting.circuit.closedSourceFloorRenewal
 assert.equal(replay.status,'computed-geometry-witnesses')
 assert.equal(replay.ordinaryHandling?.partCount,136)
 assert.equal(replay.ordinaryHandling?.witnessCount,136)
 assert.equal(replay.ordinaryHandling.minimumBoardFixedClearanceMm,10)
 assert.ok(replay.ordinaryHandling.parts.every(p=>(p.boardFixedPlanClearanceMm??-Infinity)>=10-1e-7))
 assert.deepEqual(replay.preparation?.conflictingPhaseIds,[])
 assert.deepEqual(replay.furniture?.conflictingPhaseIds,[])
 assert.equal(replay.physicalAcceptance,false)
 assert.equal(replay.ownerAcceptance,false)
 assert.ok('closedFixedVolumes' in replay&&replay.closedFixedVolumes)
 const closed=replay.closedFixedVolumes,room=kit.kit,context=room.structuralConsequence,plan=room.request.ordinaryHandling
 assert.ok(context&&plan)
 for(const limit of [1200,1300]){
  const lower=compileStudyStructuralRenewal(context,room.floor.parts,room.floor.emitterPlinth,{...plan,maximumTravelMm:limit},room.floor.installedInlet,closed)
  assert.equal(lower.status,'computed-geometry-conflicts')
  assert.ok(lower.ordinaryHandling!.witnessCount<136)
  assert.ok('requestDigest' in lower&&lower.requestDigest!==replay.requestDigest)
 }
 const changed=structuredClone(plan),target=changed.protocols.find(p=>p.boardId==='small-square')
 assert.ok(target&&Array.isArray(target.boardOriginXYMm))
 const targetId=target.partId
 target.boardOriginXYMm=[target.boardOriginXYMm[0],target.boardOriginXYMm[1]+1]
 const tighter=compileStudyStructuralRenewal(context,room.floor.parts,room.floor.emitterPlinth,changed,room.floor.installedInlet,closed)
 assert.equal(tighter.status,'computed-geometry-conflicts')
 assert.equal(tighter.ordinaryHandling!.witnessCount,135)
 assert.deepEqual(tighter.ordinaryHandling!.parts.filter(p=>p.state!=='joined-geometry-witness').map(p=>({partId:p.partId,diagnostic:p.diagnostic})),
  [{partId:targetId,diagnostic:'IAS_ORDINARY_BOARD_SETTING_CLEARANCE'}])
 assert.deepEqual(tighter.ordinaryHandling!.parts.filter(p=>p.partId!==targetId),replay.ordinaryHandling.parts.filter(p=>p.partId!==targetId))
})


test('closed volume projection is retained for workers and board placement despite a low panel underpass',()=>{
 assert.throws(()=>studyPanelTransferProfile(1),/INVALID_STUDY_TRANSFER_FINISH/)
 const room=kit.kit,context=room.structuralConsequence,plan=room.request.ordinaryHandling
 assert.ok(context&&plan)
 const [x,y,z,w,d,h]=run().circuit.sourceBox.boxMm
 const replay=(box:readonly[number,number,number,number,number,number])=>compileStudyStructuralRenewal(context,room.floor.parts,room.floor.emitterPlinth,plan,room.floor.installedInlet,{
  volumes:[{id:'adverse-closed-sourcebox',xyzxyzMm:box}],panelTransfer:studyPanelTransferProfile(room.floor.wearingFaceMm+room.floor.beddingMm),
 })
 // Bring the same complete enclosure into the access field; no high-box bypass
 // is permitted for workers or a carried/placed ordinary rest board.
 const adverse=replay([x!,y!-600,z!,x!+w!,y!+d!-600,z!+h!])
 assert.equal(adverse.status,'computed-geometry-conflicts')
 assert.ok(adverse.ordinaryHandling!.witnessCount<136)
 const low=replay([x!,y!,0,x!+w!,y!+d!,h!])
 assert.equal(low.status,'computed-geometry-conflicts')
 assert.ok(low.ordinaryHandling!.witnessCount<136)
})
