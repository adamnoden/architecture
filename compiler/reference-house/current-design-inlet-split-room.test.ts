import assert from 'node:assert/strict'
import test from 'node:test'
import {derivePlantFittedFrame} from './current-design/inlet-split-plant-branch.js'
import {readFileSync} from 'node:fs'
import {inletSplitPlantRoom,type SplitPlantRoomInput} from './current-design/inlet-split-plant-room.js'
const receipt=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-local-pocket.results.json',import.meta.url),'utf8')),
 r=receipt.splitPlantRoom.comparison,input=r.resolvedInput as SplitPlantRoomInput,
 nominal=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8'))
const close=(a:number,b:number,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`)
test('whole Plant successor replaces failed infills while retaining the full cargo and masonry opening',()=>{
 const x=inletSplitPlantRoom(input)
 assert.deepEqual(JSON.parse(JSON.stringify(x)),(({reviewSvg,...rest}:any)=>rest)(r))
 assert.equal(x.state,'unadopted-threshold-drainage-successor');if(x.state!=='unadopted-threshold-drainage-successor')return
 assert.equal(x.rejectedInfillOnly.rejected,true);assert.equal(x.rejectedInfillOnly.maximumClearWidthMm,86)
 assert.ok(x.rejectedInfillOnly.requiredClearWidthAtSameHeightMm!>170)
 assert.equal(x.thresholdRoute.retained1000mmCargoWidth,1000);assert.equal(x.masonryOpeningChanged,false)
 assert.deepEqual(x.thresholdRoute.outerPackageMm,[444,184]);assert.ok(x.thresholdRoute.laneChecks.every(v=>v.insideCargoReserveMm===13))
 assert.equal(x.drainageGeometry.necessarySourceOnlyDrainGeometry,true);close(x.drainageGeometry.bottomAfterSettingMm,.41)
 assert.ok(x.pocket.local?.supportPresentAtSides.west&&x.pocket.local.supportPresentAtSides.east&&x.pocket.local.supportPresentAtSides.south&&x.pocket.local.supportPresentAtSides.north)
 close(x.pocket.local!.quantityBounds.slabAndMineralWeightKN,23.62497175)
 assert.equal(x.completeOccupiedArrangementQualified,false);assert.equal(x.nativeStructuralActionsAdopted,false)
 assert.equal(x.branchPrerequisites.fullBranchArrangementComplete,false)
 assert.equal(nominal.splitPlantRoom.comparison.state,'missing-saved-ground')
 assert.equal(nominal.splitPlantRoom.comparison.pan,null)
})
test('the complete source is charged to each surviving outlet; high/submerged and both-blocked states reject without storage or manual credit',()=>{
 const x=inletSplitPlantRoom(input);if(x.state!=='unadopted-threshold-drainage-successor')throw Error('Missing source-bound ground')
 close(x.sourceOnlyLmin,234.680939);assert.ok(x.thresholdRoute.hydraulic.openEntryHeadReserveMm>16)
 assert.ok(x.receiverCases.ordinary.freeDropReserveMm>335);assert.ok(x.receiverCases.highSubmerged.freeDropReserveMm< -264)
 assert.equal(x.receiverCases.highSubmerged.submergedTerminal,true);assert.match(x.receiverCases.bothBlocked,/reject/)
 assert.equal(x.manualResponseCredited,false);assert.equal(x.pan.assuredAvailableStorageLitres,null)
 const adverse=inletSplitPlantRoom({...input,sourceMaximumPlantLmin:1000});if(adverse.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 assert.equal(adverse.drainageGeometry.necessarySourceOnlyDrainGeometry,false)
 assert.deepEqual(adverse.pocket,x.pocket);assert.deepEqual(adverse.bridge,x.bridge)
 assert.equal(adverse.sourceOnlyLmin,1000)
})
test('downstream hot/store and upper-network release cannot inherit the Lodge aperture or the source-only pass',()=>{
 const x=inletSplitPlantRoom(input),s=x.storedRelease
 assert.equal(s.maximumRetainedAndDrainableL,null);assert.equal(s.maximumReleaseLmin,null)
 assert.equal(s.catalogueOrMinimumUsedAsMaximum,false);assert.equal(s.houseSideReleaseBoundedByLodge,false)
 assert.ok(s.conditionalAdverse.storedOnlyLmin>1400);assert.ok(s.conditionalAdverse.sourcePlusStoredLmin>s.conditionalAdverse.storedOnlyLmin)
 assert.equal(s.conditionalAdverse.sourcePlusStoredDrainScreen,false);assert.equal(s.conditionalAdverse.unknownUpperNetworkAdditional,true)
 assert.equal(s.conditionalAdverse.thermalPressureLimitQualified,false)
 assert.match(s.releaseEvidenceRequired,/exit and restriction\/Cv/)
})
test('all pan and closed-channel pressure loads rotate into actual house coordinates and join once at real open cuts',()=>{
 const x=inletSplitPlantRoom(input);if(x.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 const pan=x.pan,hydro=pan.hydrostaticCases.find((c:any)=>c.id==='both-blocked-to-flush-floor'),keys=['Fx','Fy','Fz','Mx','My','Mz']
 assert.equal(pan.id,'HAD/plant-graded-room-pan');assert.ok(pan.vertices.every((v:any)=>v.pointMm[0]>=9397&&v.pointMm[0]<=11570.5&&v.pointMm[1]>=3797&&v.pointMm[1]<=5780.5))
 const sum=Object.fromEntries(keys.map(k=>[k,pan.waterLoadOrigins.reduce((n:number,v:any)=>n+v.wrenchKN_KNm[k],0)]))
 for(const k of keys)close(hydro.summedSurfaceWrenchKN_KNm[k],sum[k])
 for(const [j,o]of x.outfalls.entries()){
  close(o.fullWaterInventoryControl.massKg,79.492);close(o.bodyStockGravity.massKg,27.67593472)
  assert.ok(o.clearCornersMm.every((p:number[])=>p[0]>=11570.5&&p[0]<=12990))
  const h=o.hydrostaticCases.find((c:any)=>c.id==='both-blocked-to-flush-floor'),inside=h.openInterfaceLoads.find((v:any)=>v.id.includes('inside-open-cut')),
   halves=hydro.openPortInterfaceLoads.filter((v:any)=>j===0?/port-2\/water$|port-3\/water$/.test(v.id):/port-6\/water$|port-7\/water$/.test(v.id))
  assert.equal(halves.length,2)
  for(const k of keys){close(h.summedClosureWrenchKN_KNm[k],o.fullWaterInventoryControl.wrenchKN_KNm[k]);close(inside.wrenchKN_KNm[k]+halves.reduce((n:number,v:any)=>n+v.wrenchKN_KNm[k],0),0)}
 }
 assert.equal(x.inventory.panWaterAndClosedWaterDomainsDisjoint,true)
 assert.equal(x.inventory.waterWeightControlNotAdditionalToHydrostaticMetalActions,true)
})
test('eleven complete piece budgets, first release and positive rests replace an impossible whole-bridge hand-lift',()=>{
 const x=inletSplitPlantRoom(input);if(x.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 const p=x.bridge.removablePieces;assert.equal(p.pieces.length,11);assert.ok(p.pieces.every(v=>v.completeBudgetKg<15))
 assert.ok(p.minimumHomeObstacleReserveMm>0);assert.ok(p.minimumActualPipeReserveMm>0);assert.ok(p.firstRestEdgeReserveMm>0)
 assert.ok(p.pieces.every(v=>v.phases.length===5));assert.equal(p.completeHardwareMeasured,false)
 assert.equal(p.gripsRetainersCapturedFirstReleaseAndRestResistanceQualified,false)
 assert.equal(p.fittedFrameAndLowerInfillFirstReleaseQualified,false);assert.equal(p.requiredStraightFirstLiftWidthWithSettingsMm,1085);assert.equal(x.bridge.outerBearingWidthAfterIndependentSettingsMm,5);assert.equal(x.bridge.simplySupportedRailCentreStripSpanMm,510);assert.equal(x.bridge.adverseRailCentreSpanMm,530);
 assert.equal(x.bridge.oldThresholdPlateReused,false);assert.equal(x.bridge.ordinaryHandRemovalClaimed,false)
 const larger=structuredClone(input);larger.choice.bridgeHardwareBudgetEachKg=2
 const bad=inletSplitPlantRoom(larger);assert.ok(bad.diagnostics.includes('SPLIT_PLANT_ROOM/bridge-piece-renewal-comparison-fails'))
 const low=structuredClone(input);low.choice.bridgeLiftMm=50
 assert.throws(()=>inletSplitPlantRoom(low),/Unsupported bridge piece or first-rest/)
})
test('editable geometry and unsupported references propagate without substituting historical rooms or inventing acceptance',()=>{
 for(const change of[(i:any)=>i.choice.fakePass=true,(i:any)=>i.sourceMaximumPlantLmin=0,(i:any)=>i.choice.settingMm=5,(i:any)=>i.ground.ffl++,(i:any)=>i.stored.maximumRetainedAndDrainableL=370,(i:any)=>i.bridgeHomeObstacles=[]]){
  const x=structuredClone(input);change(x);assert.throws(()=>inletSplitPlantRoom(x),/Unsupported/)
 }
 const moved=structuredClone(input);moved.choice.outletAxesYMm=[4500,5000]
 const x=inletSplitPlantRoom(moved);assert.ok(x.diagnostics.includes('SPLIT_PLANT_ROOM/source-only-drain-geometry-fails'))
 assert.deepEqual(x.storedRelease,r.storedRelease)
 const before=JSON.stringify(input);inletSplitPlantRoom(input);assert.equal(JSON.stringify(input),before)
 assert.deepEqual(inletSplitPlantRoom(JSON.parse(before)),inletSplitPlantRoom(input))
})

test('actual floor body, retained wall DPC and independent bridge settings replace an artificial uniform outer-wall base',()=>{
 const reference=structuredClone(input);reference.choice.clearHeightMm=150
 const before=inletSplitPlantRoom(reference);if(before.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 const actual=before.drainageGeometry.actualFloorBody,wall=before.drainageGeometry.retainedWall
 close(actual.eastEdgeHouseXMm,11520.5);close(actual.flowFaceMm,313.8);close(actual.bottomReserveMm,1.8);assert.equal(actual.twoIndependentSettingsMm,20)
 close(wall.outsidePackageBottomMm,280.41);close(wall.retainedDpcTopMm,150);close(wall.reserveMm,110.41)
 close(before.bridge.lowerToPackageAfterTwoIndependentSettingsMm,-9);assert.equal(before.drainageGeometry.knownFloorAndBridgeInterfaceGeometryScreen,false)
 assert.ok(before.diagnostics.includes('SPLIT_PLANT_ROOM/threshold-bridge-comparison-fails'))
 const changed=structuredClone(input);changed.choice.clearHeightMm=140
 const lower=inletSplitPlantRoom(changed);if(lower.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 close(lower.bridge.lowerToPackageAfterTwoIndependentSettingsMm,1);close(lower.thresholdRoute.hydraulic.openEntryHeadReserveMm,16.705968713187048)
 assert.equal(lower.drainageGeometry.knownFloorAndBridgeInterfaceGeometryScreen,true);assert.equal(lower.drainageGeometry.necessarySourceOnlyDrainGeometry,true)
 assert.deepEqual(lower.drainageGeometry.actualFloorBody,before.drainageGeometry.actualFloorBody);assert.deepEqual(lower.drainageGeometry.retainedWall,before.drainageGeometry.retainedWall)
 assert.deepEqual(lower.pocket,before.pocket);assert.equal(lower.sourceOnlyLmin,before.sourceOnlyLmin)
 assert.ok(lower.inventory.outfallCopperKg[0]<before.inventory.outfallCopperKg[0]);assert.ok(lower.inventory.closedWaterKg[0]<before.inventory.closedWaterKg[0])
 assert.equal(lower.storedRelease.conditionalAdverse.sourcePlusStoredDrainScreen,false);assert.equal(lower.bridge.removablePieces.fittedFrameAndLowerInfillFirstReleaseQualified,false);assert.equal(lower.completeOccupiedArrangementQualified,false)
})

test('authored1100 effective frame retains150infills and all eleven whole strips; joined geometry and unjoined adverse profile stay separate',()=>{
 const x=inletSplitPlantRoom(input);if(x.state!=='unadopted-threshold-drainage-successor')throw Error('ground')
 const f=x.actualFittedFrame,d=x.fittedDoor,p=x.bridge.removablePieces
 assert.equal(f.effectiveOpenWidthMm,1100);assert.deepEqual(f.minimumCargoMm,[1000,2300]);assert.deepEqual(f.infills.map(v=>v.widthMm),[150,150]);assert.equal(f.sourceAxisYMm,3975)
 assert.equal(f.sourceOpeningDiameterMm,125);assert.equal(f.sourceBoreSideReserveMm,2.5)
 close(f.sourceFixedCountercase.headerToSpringReserveMm,-400);close(f.sourceFixedCountercase.headerToHeadReserveMm,-100);assert.equal(f.headerToRawSpringReserveMm,130)
 assert.equal(d.continuous.executedPoses,901);assert.ok(Object.values(d.minima).every(v=>v>0));assert.ok(d.minima.leafPipe>13.75);assert.ok(d.minima.armLeaf>5);assert.equal(d.minima.deckFixed,5)
 assert.ok(d.maxReachMm>d.sampledMaxReachMm);assert.ok(d.maxReachMm<650);assert.equal(d.requiredExternalDeckFootprintM2,4.41)
 assert.deepEqual(d.diagnostics,[]);assert.equal(d.necessaryDeclaredDoorAndParkedGoodsGeometryScreen,true)
 assert.equal(receipt.houseVerticalProfile.geometryOnly,true);assert.equal(receipt.unjoinedProfileControl.implicitTranslationCredited,false);assert.equal(receipt.unjoinedProfileControl.necessaryDoorGeometryScreen,false);assert.ok(receipt.unjoinedProfileControl.diagnostics.includes('PLANT_FITTED_DOOR/raised-arch-profile-not-joined'))
 assert.equal(p.actualFrameLiftEdgeReserveMm,7.5);assert.equal(p.necessaryAuthoredFittedFrameFirstLiftWidthScreen,true);assert.equal(p.firstLiftRequiresSeparatelyAdmittedLowerFrameInfillRelease,false)
 assert.ok(p.pieces.every(v=>v.minimumAuthoredFrameReserveMm===7.5&&v.frameFailures.length===0));assert.equal(p.fittedFrameAndLowerInfillFirstReleaseQualified,false)
 assert.equal(d.leafGravityBudget.kg,100);assert.equal(d.leafGravityBudget.actualCompleteStockMassAndCentroidKnown,false);assert.equal(d.matchedWeatherAirThermalFireSealsAndHardwareQualified,false)
 assert.equal(x.completeOccupiedArrangementQualified,false);assert.equal(x.nativeStructuralActionsAdopted,false)
})


test('an internally rederived frame cannot substitute another raw arch, wall or profile into the current room',()=>{
 for(const change of[{rawOpeningYMm:[3890,5330] as const},{wallOuterXMm:12091},{rawSpringMm:2551},{openingShiftMm:null}]){
  const bad=structuredClone(input);bad.branch.fittedFrame=derivePlantFittedFrame({...bad.branch.fittedFrame.resolvedInput,...change});assert.throws(()=>inletSplitPlantRoom(bad),/Unsupported mixed-source/)
 }
})
