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
 for(const value of[{clearWidthMm:350},{...c,schema:'had-split-plant-room/1'},{...c,fittedFrame:{clearWidthMm:1100}},{...c,derivedPass:true},{...c,settingMm:0},{...c,bridgeFirstRestBoxMm:[0,0,0,0,1,1]}])assert.throws(()=>admitSplitPlantRoomChoice(value),/Unsupported complete/)
 assert.equal(edit(state,'selected',1).status,'rejected');assert.equal(edit(state,'clearWidthMm',NaN).status,'rejected');assert.equal(edit(state,'bridgeHardwareBudgetEachKg',1).status,'rejected');assert.equal(edit(state,'bridgeHardwareBudgetEachKg',1,'kg').status,'applied')
 assert.equal(edit(beginEngineeringEdit(start,'missing'),'clearWidthMm',350).status,'rejected')
 const partial={...state.document,stages:{...state.document.stages,inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:{clearWidthMm:350}}}}
 await assert.rejects(()=>compileEngineeringDocument(partial),/Unsupported complete/)
 const changedId={...state.document,stages:{...state.document.stages,inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:{...c,id:'HAD/another-room'}}}}
 await assert.rejects(()=>compileEngineeringDocument(changedId),/Unsupported saved Plant room object identity/)
})

test('the140mm aspect-ratio comparison is an atomic complete saved choice, with exact reversal and unsupported undersize rejection',()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),choice=request.sourceEnvelope.splitPlantRoom,
  state=beginEngineeringEdit({schema:'current-engineering-document/1',design:readGeorgianDesignSnapshot(),bindings:{},stages:{roofPitch:{pitchDeg:42},inletSourceEnvelope:{...request.sourceEnvelope.settings,splitPlantRoom:{...choice,clearHeightMm:150}}}},'height'),
  change=edit(state,'clearHeightMm',140)
 assert.equal(change.status,'applied');if(change.status!=='applied')return
 const saved=JSON.parse(saveEngineeringEdit(change.state))
 assert.equal(saved.stages.inletSourceEnvelope.splitPlantRoom.clearHeightMm,140)
 assert.equal(saved.stages.inletSourceEnvelope.requiredPlantLmin,state.document.stages.inletSourceEnvelope&&request.sourceEnvelope.settings.requiredPlantLmin)
 assert.equal(edit(state,'clearHeightMm',47).status,'rejected')
 const undo=replayEngineeringEdit(change.state,engineeringBase(change.state),'undo');assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
})

test('the same saved ground joins the existing vertical-profile arch; an absent profile stays explicitly unjoined',async()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),start=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  stages={roofPitch:start.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom}},
  absent=await compileEngineeringDocument({...start,stages}),joined=await compileEngineeringDocument({...start,stages:{...stages,houseVerticalProfile:{}}}),
  a=absent.engineering.inletSourceEnvelope!.splitPlantRoom.comparison!.rawArchVerticalReservation!,b=joined.engineering.inletSourceEnvelope!.splitPlantRoom.comparison!.rawArchVerticalReservation!
 assert.equal(a.groundFflAbsoluteMm,530);assert.equal(a.sourceFixedCountercase.belowSpringReserveMm,-300);assert.equal(a.sourceFixedCountercase.belowCrownHeadReserveMm,0)
 assert.equal(a.joinedProfileComparison,null);assert.ok(a.diagnostics.includes('SPLIT_PLANT_ROOM/raised-ground-arch-profile-not-joined'))
 assert.equal(b.joinedProfileComparison!.springAbsoluteMm,3080);assert.equal(b.joinedProfileComparison!.headAbsoluteMm,3380)
 assert.equal(b.joinedProfileComparison!.belowSpringReserveMm,230);assert.equal(b.joinedProfileComparison!.geometryOnly,true);assert.equal(b.actualFittedClearanceQualified,false)
 assert.deepEqual(absent.engineering.inletSourceEnvelope!.bound,joined.engineering.inletSourceEnvelope!.bound)
 assert.deepEqual(absent.engineering.inletSourceEnvelope!.roomCatchment,joined.engineering.inletSourceEnvelope!.roomCatchment)
})

test('one saved fitted-width edit coordinates actual inlet and station while preserving minimum cargo, Utility, source and stored duties',async()=>{
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),start=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  doc={...start,stages:{roofPitch:start.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},houseVerticalProfile:{},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom}}},
  state=beginEngineeringEdit(doc,'fitted-frame'),before=await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(state))),editResult=edit(state,'fittedFrame.clearWidthMm',1000)
 assert.equal(editResult.status,'applied');if(editResult.status!=='applied')return
 const after=await compileEngineeringDocument(JSON.parse(saveEngineeringEdit(editResult.state))),a=before.engineering.inletSourceEnvelope!,b=after.engineering.inletSourceEnvelope!,pa=a.splitPlantRoom.comparison!,pb=b.splitPlantRoom.comparison!,
  sa=a.joinedDirection.room.indoorRoutes.splitStationComparison,sb=b.joinedDirection.room.indoorRoutes.splitStationComparison
 if(pa.state!=='unadopted-threshold-drainage-successor'||pb.state!=='unadopted-threshold-drainage-successor')throw Error('savedground')
 assert.equal(pa.actualFittedFrame.effectiveOpenWidthMm,1100);assert.equal(pb.actualFittedFrame.effectiveOpenWidthMm,1000)
 assert.deepEqual(pa.actualFittedFrame.minimumCargoMm,pb.actualFittedFrame.minimumCargoMm)
 assert.equal(sa.branchDevelopment.comparison!.choice.sourceEntryMm[1],3975);assert.equal(sb.branchDevelopment.comparison!.choice.sourceEntryMm[1],4000)
 assert.equal(sa.frameCoordination.stationShiftYMm,-25);assert.equal(sb.frameCoordination.stationShiftYMm,0)
 assert.equal(pa.actualFittedFrame.headerToRawSpringReserveMm,130);assert.equal(pb.actualFittedFrame.headerToRawSpringReserveMm,130)
 assert.equal(pa.fittedDoor.necessaryDeclaredDoorAndParkedGoodsGeometryScreen,true)
 assert.equal(pa.bridge.removablePieces.necessaryAuthoredFittedFrameFirstLiftWidthScreen,true);assert.equal(pb.bridge.removablePieces.necessaryAuthoredFittedFrameFirstLiftWidthScreen,false)
 assert.equal(pa.bridge.removablePieces.actualFrameLiftEdgeReserveMm,7.5);assert.equal(pb.bridge.removablePieces.actualFrameLiftEdgeReserveMm,-42.5)
 assert.deepEqual(a.bound,b.bound);assert.deepEqual(a.branches,b.branches);assert.deepEqual(a.roomCatchment,b.roomCatchment);assert.deepEqual(a.joinedDirection.room.indoorCuts,b.joinedDirection.room.indoorCuts)
 assert.deepEqual(pa.storedRelease,pb.storedRelease);assert.deepEqual(pa.pocket,pb.pocket);assert.equal(pa.sourceOnlyLmin,pb.sourceOnlyLmin)
 assert.equal(pa.completeOccupiedArrangementQualified,false);assert.equal(pb.completeOccupiedArrangementQualified,false)
 const undo=replayEngineeringEdit(editResult.state,engineeringBase(editResult.state),'undo');assert.equal(undo.status,'applied');if(undo.status==='applied')assert.equal(saveEngineeringEdit(undo.state),saveEngineeringEdit(state))
 assert.equal(edit(state,'fittedFrame.clearWidthMm',800).status,'rejected');assert.equal(edit(state,'fittedFrame.selected',1).status,'rejected')
})
