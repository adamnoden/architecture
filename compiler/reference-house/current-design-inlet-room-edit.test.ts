import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSourceEnvelopeCase,readLocalUtilityPocketSettings} from './current-design/inlet-source-envelope.js'
import {readGroundSectionCase} from './current-design/structural-ground.js'
import {readEngineeringDocument,compileEngineeringDocument} from './current-design/engineering-document.js'
import {applyEngineeringEdit,beginEngineeringEdit,currentEngineeringReply,editablePlantRoomId,engineeringBase,engineeringTicket,replayEngineeringEdit,saveEngineeringEdit} from './current-design/engineering-edit.js'
import {runEditorEngineeringRequest} from '../../project/ade/browser-editor/engineering-api.js'
import {admitSplitPlantRoomChoice} from './current-design/inlet-split-plant-room.js'
const edit=(state:ReturnType<typeof beginEngineeringEdit>,inputId:string,value:number,units='mm')=>applyEngineeringEdit(state,{schema:'current-engineering-edit/1',units,base:engineeringBase(state),operation:{kind:'set-plant-room-field',assemblyId:editablePlantRoomId,inputId,value}})
test('complete saved Plant choice drives the same CLI/browser/compiler, regenerates own outputs, preserves Utility and invalidates stale replies',async()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),start=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  doc={...start,stages:{roofPitch:start.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom}}},
  state=beginEngineeringEdit(doc,'plant-room'),before=await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(state))),
  changed=edit(state,'clearWidthMm',350)
 assert.equal(changed.status,'applied');if(changed.status!=='applied')return
 const after=await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(changed.state))),baseTicket=engineeringTicket(state,'before'),ticket=engineeringTicket(changed.state,'after'),browser=await runEditorEngineeringRequest({ticket}),
  cli=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--bundle','-'],{input:saveEngineeringEdit(changed.state),encoding:'utf8',maxBuffer:16*1024*1024})),
  a=before.engineering.inletSourceEnvelope!,b=after.engineering.inletSourceEnvelope!
 const pa=a.splitPlantRoom.comparison!,pb=b.splitPlantRoom.comparison!
 if(pa.state!=='unadopted-threshold-drainage-successor'||pb.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved ground required')
 assert.equal(b.splitPlantRoom.choiceOwnership,'complete-authored-request')
 assert.equal(b.splitPlantRoom.comparison!.choice.clearWidthMm,350)
 assert.notEqual(b.splitPlantRoom.comparison!.reviewSvg,a.splitPlantRoom.comparison!.reviewSvg)
 assert.ok(b.splitPlantRoom.comparison!.thresholdRoute.hydraulic.requiredHeadAboveInvertMm>a.splitPlantRoom.comparison!.thresholdRoute.hydraulic.requiredHeadAboveInvertMm)
 assert.notEqual(pb.inventory.outfallCopperKg[0],pa.inventory.outfallCopperKg[0])
 assert.deepEqual(a.roomCatchment,b.roomCatchment);assert.deepEqual(a.joinedDirection,b.joinedDirection);assert.deepEqual(a.bound,b.bound)
 assert.deepEqual(before.engineering.groundSection,after.engineering.groundSection);assert.deepEqual(before.engineering.roofPitch,after.engineering.roofPitch)
 assert.deepEqual(cli.engineering.inletSourceEnvelope.splitPlantRoom,JSON.parse(JSON.stringify(b.splitPlantRoom)))
 assert.deepEqual(browser.documentIdentity,after.documentIdentity);assert.equal(currentEngineeringReply(changed.state,baseTicket,{ticket:baseTicket}),undefined);assert.ok(currentEngineeringReply(changed.state,ticket,browser))
 assert.notDeepEqual(before.documentIdentity,after.documentIdentity)
 const undo=replayEngineeringEdit(changed.state,engineeringBase(changed.state),'undo');assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
 const adverse=edit(state,'clearWidthMm',100);assert.equal(adverse.status,'applied');if(adverse.status==='applied'){
  const bad=await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(adverse.state))),plant=bad.engineering.inletSourceEnvelope!.splitPlantRoom.comparison!;if(plant.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved ground required');assert.equal(plant.drainageGeometry.necessarySourceOnlyDrainGeometry,false)
  assert.deepEqual(bad.engineering.inletSourceEnvelope!.bound,a.bound);assert.equal(bad.engineering.inletSourceEnvelope!.preSiteArrangementComplete,false)
 }
})
test('complete authored schema, identity ownership and atomic field bounds reject invented passes or missing choices',async()=>{
 const request=readInletSourceEnvelopeCase(readCurrentDesignResolution()),c=request.sourceEnvelope.splitPlantRoom,start=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  state=beginEngineeringEdit({...start,stages:{roofPitch:start.stages.roofPitch,inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:c}}},'choices')
 for(const value of[{clearWidthMm:350},{...c,derivedPass:true},{...c,settingMm:0},{...c,bridgeFirstRestBoxMm:[0,0,0,0,1,1]}])assert.throws(()=>admitSplitPlantRoomChoice(value),/Unsupported complete/)
 assert.equal(edit(state,'selected',1).status,'rejected');assert.equal(edit(state,'clearWidthMm',NaN).status,'rejected');assert.equal(edit(state,'bridgeHardwareBudgetEachKg',1).status,'rejected');assert.equal(edit(state,'bridgeHardwareBudgetEachKg',1,'kg').status,'applied')
 assert.equal(edit(beginEngineeringEdit(start,'missing'),'clearWidthMm',350).status,'rejected')
 const partial={...state.document,stages:{...state.document.stages,inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:{clearWidthMm:350}}}}
 await assert.rejects(()=>compileEngineeringDocument(partial),/Unsupported complete/)
 const changedId={...state.document,stages:{...state.document.stages,inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:{...c,id:'HAD/another-room'}}}}
 await assert.rejects(()=>compileEngineeringDocument(changedId),/Unsupported saved Plant room object identity/)
})

test('the140mm aspect-ratio comparison is an atomic complete saved choice, with exact reversal and unsupported undersize rejection',()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),choice=request.sourceEnvelope.splitPlantRoom,
  state=beginEngineeringEdit({schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{},stages:{roofPitch:{pitchDeg:42},inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:choice}}},'height'),
  change=edit(state,'clearHeightMm',140)
 assert.equal(change.status,'applied');if(change.status!=='applied')return
 const saved=JSON.parse(saveEngineeringEdit(change.state))
 assert.equal(saved.stages.inletSourceEnvelope.splitPlantRoom.clearHeightMm,140)
 assert.equal(saved.stages.inletSourceEnvelope.requiredPlantLmin,state.document.stages.inletSourceEnvelope&&request.sourceEnvelope.settings.requiredPlantLmin)
 assert.equal(edit(state,'clearHeightMm',47).status,'rejected')
 const undo=replayEngineeringEdit(change.state,engineeringBase(change.state),'undo');assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
})
