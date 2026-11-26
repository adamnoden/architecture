import {admitSplitPlantRoomChoice,type SplitPlantRoomChoice} from './inlet-split-plant-room-choice.js'
export {admitSplitPlantRoomChoice} from './inlet-split-plant-room-choice.js'
export type {SplitPlantRoomChoice} from './inlet-split-plant-room-choice.js'
/** Whole Plant drainage successor. One real pocket, pan and two threshold outfalls;
 * existing geometry/hydraulics methods retain their adverse cases and limits. */
import {inletRoomPocket} from './inlet-room-pocket.js'
import {inletRoomPan,inletClosedOutfall} from './inlet-room-pan.js'
import {inletCabinetProductFacts} from './inlet-cabinet-copper.js'
import {rectangularCatchmentScreen} from './inlet-room-catchment.js'
import {segmentBoxDistance,segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import {admitResolvedPlantFittedFrame,type inletSplitPlantBranch} from './inlet-split-plant-branch.js'
import {inletStoreImpulseBarrier} from './inlet-store-impulse.js'
type Pair=readonly[number,number]
type Point=readonly[number,number,number]
/** Minimum cargo duty is not installed clearance. Raw arch is on sourceFFL0;
 * a saved raised floor consumes that actual opening, including its curved crown. */
export function comparePlantRawArchReservation(i:{rawSpringMm:number;rawHeadMm:number;groundFflMm:number;minimumCargoHeightMm:number;settingEachMm:number;translatedProfile?:{springAbsoluteMm:number;headAbsoluteMm:number;occupiedShiftMm:number;groundCaseDigest:string;profileCaseDigest:string}}){
 if(![i.rawSpringMm,i.rawHeadMm,i.groundFflMm,i.minimumCargoHeightMm,i.settingEachMm].every(Number.isFinite)||i.rawHeadMm<i.rawSpringMm||i.minimumCargoHeightMm<=0||i.settingEachMm<10)throw Error('Unsupported Plant raw arch vertical reservation')
 const top=i.groundFflMm+i.minimumCargoHeightMm,springReserve=i.rawSpringMm-top-2*i.settingEachMm,headReserve=i.rawHeadMm-top-2*i.settingEachMm,p=i.translatedProfile
 if(p&&(![p.springAbsoluteMm,p.headAbsoluteMm,p.occupiedShiftMm].every(Number.isFinite)||!p.groundCaseDigest||!p.profileCaseDigest||p.occupiedShiftMm!==i.groundFflMm||p.springAbsoluteMm!==i.rawSpringMm+p.occupiedShiftMm||p.headAbsoluteMm!==i.rawHeadMm+p.occupiedShiftMm))throw Error('Unsupported joined Plant arch profile')
 const profileComparison=p?{...p,belowSpringReserveMm:p.springAbsoluteMm-top-2*i.settingEachMm,belowCrownHeadReserveMm:p.headAbsoluteMm-top-2*i.settingEachMm,geometryOnly:true}:null
 return{schema:'had-plant-raw-arch-reservation/1',rawArchDatum:'source-groundFFL0',rawSpringAbsoluteMm:i.rawSpringMm,rawHeadAbsoluteMm:i.rawHeadMm,groundFflAbsoluteMm:i.groundFflMm,minimumCargoHeightDutyMm:i.minimumCargoHeightMm,minimumCargoTopAbsoluteMm:top,twoIndependentSettingsMm:2*i.settingEachMm,
  sourceFixedCountercase:{belowSpringReserveMm:springReserve,belowCrownHeadReserveMm:headReserve,necessaryBelowSpringReservation:springReserve>=0,scope:'Conditional source-fixed opening only; not a selected raised-house opening.'},joinedProfileComparison:profileComparison,
  necessaryJoinedProfileBelowSpringReservation:profileComparison?profileComparison.belowSpringReserveMm>=0:null,curvedCrownNotRectangularClearance:true,actualFittedClearanceQualified:false,minimumCargoIsActualFrame:false,
  diagnostics:profileComparison?(profileComparison.belowSpringReserveMm<0?['SPLIT_PLANT_ROOM/minimum-cargo-conflicts-joined-profile-arch']:[]):i.groundFflMm!==0?['SPLIT_PLANT_ROOM/raised-ground-arch-profile-not-joined']:[]}
}
export type SplitPlantRoomInput={choice:SplitPlantRoomChoice;branch:ReturnType<typeof inletSplitPlantBranch>;
 sourceMaximumPlantLmin:number;sourceMaximumAbsoluteBar:number;exteriorPlanObstacles:readonly{id:string;planMm:readonly[number,number,number,number]}[];rawArchVerticalInput?:Parameters<typeof comparePlantRawArchReservation>[0];bridgeHomeObstacles:readonly{id:string;boxMm:readonly[number,number,number,number,number,number]}[];rawEastOpeningYMm:Pair;cargoClearYMm:Pair;eastOuterXMm:number;
 ground?:{ffl:number;mineralCourse:Pair;dryRC:Pair;glass:Pair;accessibleDistribution:Pair;finish:Pair;coldGridTop:number;exteriorGrade:number;rcDensityKNm3:number;mineralDensityKNm3:number};
 grid:Parameters<typeof inletRoomPocket>[0]['grid'];threshold:{plateWidthYMm:Pair;outerEdgeXMm:number;wheelActionIncludingDynamicN:number;wheelBandMm:number;elasticModulusMPa:number;steelDensityKgM3:number;proofComparisonMPa:number};
 stored:{family:string;orderedMinimumUsableL:number;catalogueComparatorL:number;maximumRetainedAndDrainableL:null;d2OutfallMm:Point}}
const tuple=(x:unknown,n:number)=>Array.isArray(x)&&x.length===n&&[...x].every(Number.isFinite)
const rotatePoint=(p:readonly number[])=>[-p[1],p[0],p[2]]
/** Proper rotation U=houseY,V=-houseX. Wrenches rotate with the same matrix;
 * origins stay at the same physical point, so no extra moment translation. */
function houseCoordinates(value:any,key=''):any{
 if(Array.isArray(value)){
  if(value.length===3&&value.every(Number.isFinite)&&['pointMm','originMm','massCentroidXYZMm','normal'].includes(key))return rotatePoint(value)
  if(['cornersMm','outletMouthsMm','clearCornersMm','lowerSettingClearCornersMm'].includes(key))return value.map(p=>Array.isArray(p)&&p.length===3?rotatePoint(p):houseCoordinates(p))
  return value.map(v=>houseCoordinates(v))
 }
 if(value&&typeof value==='object'){
  if(['Fx','Fy','Fz','Mx','My','Mz'].every(k=>Object.hasOwn(value,k)))return{Fx:-value.Fy,Fy:value.Fx,Fz:value.Fz,Mx:-value.My,My:value.Mx,Mz:value.Mz}
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,houseCoordinates(v,k)]))
 }
 return value
}
export function inletSplitPlantRoom(i:SplitPlantRoomInput){
 const c=admitSplitPlantRoomChoice(i?.choice),thresholdKeys=['plateWidthYMm','outerEdgeXMm','wheelActionIncludingDynamicN','wheelBandMm','elasticModulusMPa','steelDensityKgM3','proofComparisonMPa'].sort()
 if(!i||!i.threshold||Object.keys(i.threshold).sort().join(',')!==thresholdKeys.join(',')||Object.entries(i.threshold).some(([k,v])=>k!=='plateWidthYMm'&&!Number.isFinite(v))
  ||![i.rawEastOpeningYMm,i.cargoClearYMm,i.threshold.plateWidthYMm].every(p=>tuple(p,2))||![i.sourceMaximumPlantLmin,i.sourceMaximumAbsoluteBar,i.eastOuterXMm].every(Number.isFinite)||i.sourceMaximumPlantLmin<=0||i.sourceMaximumAbsoluteBar<=0
  ||!Array.isArray(i.exteriorPlanObstacles)||!i.exteriorPlanObstacles.length||i.exteriorPlanObstacles.some(o=>!o.id||!tuple(o.planMm,4)||o.planMm.slice(2).some((v:number)=>v<=0))
  ||!Array.isArray(i.bridgeHomeObstacles)||!i.bridgeHomeObstacles.length||i.bridgeHomeObstacles.some(v=>!v.id||!tuple(v.boxMm,6)||v.boxMm.slice(3).some((v:number)=>v<=0))
  ||i.threshold.wheelActionIncludingDynamicN<=0||i.threshold.wheelBandMm<=0||i.threshold.elasticModulusMPa<=0||i.threshold.steelDensityKgM3<=0||i.threshold.proofComparisonMPa<=0
  ||!i.grid||!i.grid.girders||!i.grid.crossBeams||!Array.isArray(i.grid.heads)||!i.branch||i.branch.schema!=='had-split-plant-branch-result/1'||!i.branch.sourceBindingDigest||!tuple(i.branch.roomPlanMm,4)||i.branch.selected!==false
  ||!i.stored||i.stored.maximumRetainedAndDrainableL!==null||!tuple(i.stored.d2OutfallMm,3)||!i.stored.family||![i.stored.orderedMinimumUsableL,i.stored.catalogueComparatorL].every(Number.isFinite)||i.stored.orderedMinimumUsableL<=0||i.stored.catalogueComparatorL<=0)
  throw Error('Unsupported complete Plant room inputs')
 const frame=admitResolvedPlantFittedFrame(i.branch.fittedFrame),fr=frame.resolvedInput,a=i.rawArchVerticalInput
 if(JSON.stringify(frame.rawOpeningYMm)!==JSON.stringify(i.rawEastOpeningYMm)||fr.wallOuterXMm!==i.eastOuterXMm||fr.wallInnerXMm!==i.branch.roomPlanMm[0]+i.branch.roomPlanMm[2]
  ||(i.ground&&i.ground.ffl!==fr.groundFflMm)||(a&&(a.rawSpringMm!==fr.rawSpringMm||a.rawHeadMm!==fr.rawHeadMm||a.groundFflMm!==fr.groundFflMm||fr.openingShiftMm!==(a.translatedProfile?.occupiedShiftMm??(a.groundFflMm===0?0:null)))))throw Error('Unsupported mixed-source Plant frame/room geometry')
 if(Object.keys(c.fittedFrame).some(k=>JSON.stringify((c.fittedFrame as any)[k])!==JSON.stringify((i.branch.fittedFrame.choice as any)[k])))throw Error('Unsupported unjoined fitted frame and branch revision')
 const rawArchVerticalReservation=i.rawArchVerticalInput?comparePlantRawArchReservation(i.rawArchVerticalInput):null
 const [west,south,width,depth]=i.branch.roomPlanMm,east=west+width,
  raw=i.rawEastOpeningYMm,cargo=i.cargoClearYMm,actualFrame=i.branch.fittedFrame,fitted=actualFrame.effectiveClearYMm,wall=i.eastOuterXMm-east,
  outerWidth=c.clearWidthMm+2*(c.insulationMm+c.metalMm),outerHeight=c.clearHeightMm+2*(c.insulationMm+c.metalMm),length=c.insideRunMm+wall+c.outsideRunMm,
  maximumInfillClearWidthMm=Math.min(...actualFrame.infills.map(f=>f.widthMm))-2*(c.insulationMm+c.metalMm+c.settingMm),
  maximumPocketClearHeightMm=c.localPocketDepthMm-2*(c.insulationMm+c.metalMm+c.settingMm),
  oldInfillScreen=maximumInfillClearWidthMm>0&&maximumPocketClearHeightMm>47?rectangularCatchmentScreen(i.sourceMaximumPlantLmin,maximumInfillClearWidthMm,maximumPocketClearHeightMm,length,c.outfallSlopeRatio):null,
  hydraulic=rectangularCatchmentScreen(i.sourceMaximumPlantLmin,c.clearWidthMm,c.clearHeightMm,length,c.outfallSlopeRatio),
  laneChecks=c.outletAxesYMm.map((y,k)=>({id:c.id+'/outfall-'+(k+1),axisYMm:y,insideCargoReserveMm:Math.min(y-outerWidth/2-cargo[0],cargo[1]-y-outerWidth/2)-c.settingMm})),
  centralGapMm=c.outletAxesYMm[1]-c.outletAxesYMm[0]-outerWidth,
  centreRailReserveMm=(centralGapMm-c.centralRailWidthMm)/2-2*c.settingMm,
  infillGeometryRejected=oldInfillScreen===null||!oldInfillScreen.necessaryOpenChannelScreen
 if(wall<=0||raw[0]>=cargo[0]||raw[1]<=cargo[1]||cargo[0]>=cargo[1]||c.outletAxesYMm[0]>=c.outletAxesYMm[1]||maximumInfillClearWidthMm<=0||maximumPocketClearHeightMm<=47)throw Error('Unsupported actual Plant entry interfaces')
 let requiredClearWidthMm:number|null=null
 if(maximumPocketClearHeightMm>47){let lo=1,hi=2000;if(rectangularCatchmentScreen(i.sourceMaximumPlantLmin,hi,maximumPocketClearHeightMm,length,c.outfallSlopeRatio).necessaryOpenChannelScreen){for(let n=0;n<60;n++){const m=(lo+hi)/2;if(rectangularCatchmentScreen(i.sourceMaximumPlantLmin,m,maximumPocketClearHeightMm,length,c.outfallSlopeRatio).necessaryOpenChannelScreen)hi=m;else lo=m}requiredClearWidthMm=hi}}
 const terminalBore=inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm-2*inletCabinetProductFacts.pipe.minimumWallMm,
  storedAdditionalHeadMm=i.branch.resolvedInput.cylindricalStore.heightMm,
  storedComparisonAbsoluteBar=i.sourceMaximumAbsoluteBar+c.storedAdverseMinimumDensityKgM3*9.81*storedAdditionalHeadMm/1e8,
  storedComparisonLmin=Math.PI/4*(terminalBore/1000)**2*Math.sqrt(2*storedComparisonAbsoluteBar*1e5/c.storedAdverseMinimumDensityKgM3)*60000,
  combinedAdverseLmin=i.sourceMaximumPlantLmin+storedComparisonLmin,
  storedSourceDrainComparison=rectangularCatchmentScreen(combinedAdverseLmin,c.clearWidthMm,c.clearHeightMm,length,c.outfallSlopeRatio)
 const door=comparePlantFittedDoor(i),common={schema:'had-split-plant-room-result/1',id:c.id,choice:c,sourceBindingDigest:i.branch.sourceBindingDigest,groundFflMm:i.branch.groundFflMm,selected:false as const,
  rawArchVerticalReservation,branchIdentity:i.branch.id,branchPrerequisites:{sameCurrentSource:i.branch.sourceBindingDigest,connections:i.branch.connections,geometryDiagnostics:i.branch.diagnostics,fullBranchArrangementComplete:i.branch.fullBranchArrangementComplete,pressureAndGravityReferenceOnly:true},resolvedInput:i,roomPlanMm:i.branch.roomPlanMm,rawEastOpeningYMm:raw,retainedCargoClearYMm:cargo,actualFittedFrame:actualFrame,fittedDoor:door,masonryOpeningChanged:false,
  sourceOnlyLmin:i.sourceMaximumPlantLmin,storedInventoryUsedAsFlowLimit:false,manualResponseCredited:false,sourceRestrictionQualificationTransferred:false,
  rejectedInfillOnly:{maximumClearWidthMm:maximumInfillClearWidthMm,maximumClearHeightMm:maximumPocketClearHeightMm,screen:oldInfillScreen,requiredClearWidthAtSameHeightMm:requiredClearWidthMm,rejected:infillGeometryRejected,
   interpretation:'Generous upper envelope: actual fitted technical side cassettes ('+actualFrame.infills.map(f=>f.widthMm).join('/')+'mm) and the actual floor pocket are fully available, before source pipe, seals, support or bridge stock. Failure rules out this infill-only open-channel comparison.'},
  thresholdRoute:{kind:'two-independent-closed-outfalls-under-removable-threshold',lengthMm:length,wallDepthMm:wall,outerPackageMm:[outerWidth,outerHeight],laneChecks,centralGapMm,centreRailReserveMm,hydraulic,
   retained1000mmCargoWidth:i.cargoClearYMm[1]-i.cargoClearYMm[0],noCargoWidthReduction:true,old120mmBridgeProofApplicable:false,independentOutfallReceiversRequired:true,
   upperAndLowerClearancesRequireActualGround:true,actualReceiverAndBridgeResistanceQualified:false},storedRelease:{...i.stored,coordinateDatum:'Retained D2 point is local occupiedFFL; actual gravity receiver remains uncoordinated.',absoluteD2OutfallReferenceMm:i.stored.d2OutfallMm.map((v,k)=>v+(k===2?i.branch.groundFflMm:0)),catalogueOrMinimumUsedAsMaximum:false,houseSideReleaseBoundedByLodge:false,maximumReleaseLmin:null,
   actualExitBoreCvPressureTemperatureAndAntivacuumQualified:false,actualIncidentStationInventory:i.branch.incidentStations,
   releaseEvidenceRequired:'Actual maximum retained/drainable store, expansion and each upper-network inventory; every incident cut/exit and restriction/Cv; admitted hot-water minimum density and maximum thermal/pressure/head state; nonreturn normal/failed-open and air-admission/vacuum states; coupled simultaneous source/store/upper-network discharge at the same physical fault. Resolve before Plant containment selection, through exact factory assembly data and reproducible network release model.',
   conditionalAdverse:{state:'declared-adverse-comparator-not-actual-rate-bound',faultNode:'Unlocated full-pressure/full-outer-height energy sensitivity; not the actual high-tee release. Source and store are separate incident feeds; upper network is not empty.',actualIncidentStationPeak:false,terminalBoreReferenceMm:terminalBore,sourceMaximumAbsoluteBar:i.sourceMaximumAbsoluteBar,additionalFullCylinderHeightComparisonMm:storedAdditionalHeadMm,minimumDensityComparisonKgM3:c.storedAdverseMinimumDensityKgM3,thermalPressureLimitQualified:false,storedOnlyLmin:storedComparisonLmin,sourcePlusStoredLmin:combinedAdverseLmin,drainScreen:storedSourceDrainComparison,sourcePlusStoredDrainScreen:storedSourceDrainComparison.necessaryOpenChannelScreen,unknownUpperNetworkAdditional:true},
   requiredStates:['source-feed-at-maximum','downstream-stored-backfeed-cut-open','failed-nonreturn-plus-hot-store-release','trapped-upper-network','separate-primary-buffer-and-HX-breach','D2-relief-with-blocked-or-submerged-terminal'],completeReleaseModelQualified:false},
  completeOccupiedArrangementQualified:false as const,nativeStructuralActionsAdopted:false as const,installedAcceptance:false as const}
 if(!i.ground)return{...common,state:'missing-saved-ground' as const,ground:null,pocket:null,pan:null,outfalls:null,bridge:null,receiverCases:null,diagnostics:[...(rawArchVerticalReservation?.diagnostics??[]),'SPLIT_PLANT_ROOM/requires-actual-saved-ground',...door.diagnostics,'SPLIT_PLANT_ROOM/store-backfeed-release-unbounded']}
 const g=i.ground
 const groundKeys=['ffl','mineralCourse','dryRC','glass','accessibleDistribution','finish','coldGridTop','exteriorGrade','rcDensityKNm3','mineralDensityKNm3'].sort()
 if(Object.keys(g).sort().join(',')!==groundKeys.join(',')||!Object.values(g).flat().every(Number.isFinite)||g.ffl!==i.branch.groundFflMm||g.finish[1]!==g.ffl||g.finish[0]!==g.accessibleDistribution[1])throw Error('Unsupported mismatched Plant ground datum')
 const pocket=inletRoomPocket({levels:g,roomPlanMm:i.branch.roomPlanMm,depthMm:c.localPocketDepthMm,isolationGapMm:c.isolationGapMm,grid:i.grid,rcDensityKNm3:g.rcDensityKNm3,mineralDensityKNm3:g.mineralDensityKNm3,roomId:'plant'}),
  distribution=pocket.levels.accessibleDistribution,invert=distribution[0]+c.invertAboveDistributionMm,wallInvert=invert-c.insideRunMm/c.outfallSlopeRatio,terminalInvert=invert-length/c.outfallSlopeRatio,
  receiver=(rise:number)=>{const crest=g.exteriorGrade+c.receiverCrestAboveGradeMm+32+rise,head=1000*(i.sourceMaximumPlantLmin/60000/(1.7*c.receiverWidthMm/1000))**(2/3),water=crest+head;
   return{crestMm:crest,waterMm:water,freeDropReserveMm:terminalInvert-water-25-c.settingMm,submergedTerminal:water>=terminalInvert,coefficientComparison:1.7,coefficientAndSiteQualified:false}},
  ordinary=receiver(0),high=receiver(c.receiverHighAdverseMm),stages={'one-outlet-unavailable-source-only-unqualified-stage':invert+hydraulic.requiredHeadAboveInvertMm+c.settingMm,'both-blocked-to-flush-floor':g.ffl,'ordinary-exterior-tailwater':ordinary.waterMm,'high-submerged-exterior-tailwater':high.waterMm},
  localPan=inletRoomPan({roomPlanMm:[south,-east,depth,width],outletXmm:c.outletAxesYMm,inletYmm:-east+c.insideRunMm,invertMm:invert,slopeRatio:c.panSlopeRatio,floorMm:g.ffl,floorUndersideMm:g.finish[0],distributionBottomMm:distribution[0],datumMm:g.coldGridTop,settingMm:c.settingMm,metalMm:c.metalMm,insulationMm:c.insulationMm,chuteWidthMm:c.clearWidthMm,chuteHeightMm:c.clearHeightMm,chuteSlopeRatio:c.outfallSlopeRatio,waterStageComparisonsMm:stages,roomId:'plant'}),
  pan=houseCoordinates(localPan),outfalls=c.outletAxesYMm.map((y,k)=>houseCoordinates(inletClosedOutfall({id:c.id+'/outfall-'+(k+1),axisXMm:y,wallInnerYMm:-east,terminalYMm:-i.eastOuterXMm-c.outsideRunMm,wallInvertMm:wallInvert,terminalInvertMm:terminalInvert,widthMm:c.clearWidthMm,heightMm:c.clearHeightMm,metalMm:c.metalMm,originMm:[south+depth/2,-west-width/2,g.coldGridTop],settingMm:c.settingMm,waterStageComparisonsMm:stages}))),
  bridgeBox=[east-c.isolationGapMm,i.threshold.plateWidthYMm[0],g.ffl-c.bridgeThicknessMm,i.threshold.outerEdgeXMm-east+c.isolationGapMm,i.threshold.plateWidthYMm[1]-i.threshold.plateWidthYMm[0],c.bridgeThicknessMm],
  bridgeKg=bridgeBox[3]*bridgeBox[4]*bridgeBox[5]/1e9*i.threshold.steelDensityKgM3,
  railCentresYMm=[cargo[0]-c.settingMm,(cargo[0]+cargo[1])/2,cargo[1]+c.settingMm],railEnvelopesYMm=railCentresYMm.map(y=>[y-c.centralRailWidthMm/2,y+c.centralRailWidthMm/2]),physicalStripSpanMm=Math.max(railCentresYMm[1]-railCentresYMm[0],railCentresYMm[2]-railCentresYMm[1]),
  stress=1.5*i.threshold.wheelActionIncludingDynamicN*physicalStripSpanMm/(i.threshold.wheelBandMm*c.bridgeThicknessMm**2),adverseSpanMm=physicalStripSpanMm+2*c.settingMm,adverseStress=stress*adverseSpanMm/physicalStripSpanMm,
  outerRailPackageReservesMm=[c.outletAxesYMm[0]-outerWidth/2-railEnvelopesYMm[0][1]-2*c.settingMm,railEnvelopesYMm[2][0]-c.outletAxesYMm[1]-outerWidth/2-2*c.settingMm],
  bridge={boxMm:bridgeBox,outerRailPackageReservesMm,coordinateDatum:'Absolute source-ground XYZ; removable-piece motion has its separately labelled localFFL coordinates.',railCentresYMm,railEnvelopesYMm,stockReferenceKg:bridgeKg,wheelActionIncludingDynamicN:i.threshold.wheelActionIncludingDynamicN,wheelBandMm:i.threshold.wheelBandMm,simplySupportedRailCentreStripSpanMm:physicalStripSpanMm,
   nominalStripStressMPa:stress,adverseRailCentreSpanMm:adverseSpanMm,adverseStripStressMPa:adverseStress,nominalOuterBearingWidthMm:c.centralRailWidthMm,outerBearingWidthAfterIndependentSettingsMm:c.centralRailWidthMm-2*c.settingMm,bearingPressureSplittingAndRailResistanceQualified:false,proofComparisonMPa:i.threshold.proofComparisonMPa,nominalStripScreen:stress<=i.threshold.proofComparisonMPa,adverseSpanOnlyStripScreen:adverseStress<=i.threshold.proofComparisonMPa,
   lowerToPackageAfterSettingMm:g.ffl-c.bridgeThicknessMm-(invert+c.clearHeightMm+c.insulationMm+c.metalMm)-c.settingMm,
   lowerToPackageAfterTwoIndependentSettingsMm:g.ffl-c.bridgeThicknessMm-(invert+c.clearHeightMm+c.insulationMm+c.metalMm)-2*c.settingMm,
   centralRailWidthMm:c.centralRailWidthMm,centralRailAvailableReserveMm:centreRailReserveMm,
   oldThresholdPlateReused:false,ordinaryHandRemovalClaimed:false,positiveLoadedCaptureRequired:true,referenceWheelActionIsActualLoadedMaximum:false,referenceStockPropertiesQualified:false,railSectionsSeatsAndActualColdGridTransferQualified:false,
   supportDuty:'Three longitudinal independent supports outside the two water bodies; actual rail sections, end seats, exterior support, bridge edge/catch, captured lifting and reinstatement remain to be designed. No pan/pipe support or cantilever is credited.'},
  pieces=(()=>{
   const frameObstacles=[...actualFrame.infills.map(f=>({id:f.id,boxMm:f.fullReservedBoxMm.map((v,k)=>v-(k===2?g.ffl:0))})),{id:actualFrame.id+'/header',boxMm:[east,fitted[0],c.fittedFrame.clearHeightMm+(actualFrame.resolvedInput.floorRiseMm??0),wall,actualFrame.effectiveOpenWidthMm,c.fittedFrame.headerDepthMm]},{id:actualFrame.id+'/parked-leaf',boxMm:door.parkedLeafBoxMm}],
    length=bridgeBox[3],spanY=bridgeBox[4],pieceWidth=(length-c.bridgeJointGapMm*(c.bridgePieceCount-1))/c.bridgePieceCount,rest=c.bridgeFirstRestBoxMm,
    centre:[number,number]=[rest[0]+rest[3]/2,rest[1]+rest[4]/2],top=rest[2]+rest[5],liftBottom=bridgeBox[2]-g.ffl+c.bridgeLiftMm,
    gap=(a:readonly number[],b:readonly number[])=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)},
    radius=Math.hypot(pieceWidth,spanY)/2,
    rows=Array.from({length:c.bridgePieceCount},(_,k)=>{
     const start=[bridgeBox[0]+k*(pieceWidth+c.bridgeJointGapMm),bridgeBox[1],bridgeBox[2]-g.ffl,pieceWidth,spanY,c.bridgeThicknessMm],
      target=[centre[0]-spanY/2,centre[1]-pieceWidth/2,top,spanY,pieceWidth,c.bridgeThicknessMm],
      carryA=[start[0],start[1],liftBottom],carryB=[centre[0]-pieceWidth/2,centre[1]-spanY/2,liftBottom],
      phases=[{id:'captured-vertical-first-release',boxMm:[...start.slice(0,3),pieceWidth,spanY,c.bridgeThicknessMm+c.bridgeLiftMm]},
       {id:'captured-straight-west-clear-of-frame',boxMm:[Math.min(carryA[0],carryB[0]),start[1],liftBottom,Math.abs(carryA[0]-carryB[0])+pieceWidth,spanY,c.bridgeThicknessMm]},
       {id:'level-inside-carry-to-rest',boxMm:[carryB[0],Math.min(start[1],carryB[1]),liftBottom,pieceWidth,Math.abs(start[1]-carryB[1])+spanY,c.bridgeThicknessMm]},
       {id:'quarter-turn-above-rest',boxMm:[centre[0]-radius,centre[1]-radius,liftBottom,2*radius,2*radius,c.bridgeThicknessMm]},
       {id:'controlled-lower-to-positive-rest',boxMm:[target[0],target[1],top,target[3],target[4],liftBottom-top+c.bridgeThicknessMm]}],
      frameChecks=phases.flatMap(p=>frameObstacles.map(o=>({phase:p.id,obstacle:o.id,reserveMm:gap(p.boxMm,o.boxMm)-2*c.settingMm}))),
      obstacleChecks=phases.flatMap(p=>i.bridgeHomeObstacles.map(o=>({phase:p.id,obstacle:o.id,reserveMm:gap(p.boxMm,o.boxMm)-2*c.settingMm}))),
      pipeChecks=phases.flatMap(p=>i.branch.paths.flatMap(r=>{const points=r.formedGeometry?.path??r.points;return points.slice(1).map((b,k)=>({phase:p.id,path:r.id,segment:k,reserveMm:segmentBoxDistance(points[k],b,p.boxMm as [number,number,number,number,number,number])-r.radiusMm-2*c.settingMm-(r.formedGeometry?.hausdorffError??0)}))})),
      fittingChecks=phases.flatMap(p=>i.branch.paths.filter(r=>!r.removable).flatMap(r=>r.corners.map(corner=>({phase:p.id,path:r.id,corner:corner.index,reserveMm:gap(p.boxMm,corner.boxMm)-2*c.settingMm})))),
      sheetKg=pieceWidth*spanY*c.bridgeThicknessMm/1e9*i.threshold.steelDensityKgM3
     return{id:c.id+'/threshold-piece-'+(k+1),startBoxMm:start,restBoxMm:target,sheetKg,hardwareBudgetKg:c.bridgeHardwareBudgetEachKg,completeBudgetKg:sheetKg+c.bridgeHardwareBudgetEachKg,
      phases,minimumAuthoredFrameReserveMm:Math.min(...frameChecks.map(v=>v.reserveMm)),frameFailures:frameChecks.filter(v=>v.reserveMm<0),minimumHomeObstacleReserveMm:Math.min(...obstacleChecks.map(v=>v.reserveMm)),minimumActualPipeReserveMm:Math.min(...pipeChecks.map(v=>v.reserveMm),...fittingChecks.map(v=>v.reserveMm)),obstacleFailures:obstacleChecks.filter(v=>v.reserveMm<0),pipeFailures:pipeChecks.filter(v=>v.reserveMm<0),fittingFailures:fittingChecks.filter(v=>v.reserveMm<0)}
    })
   if(pieceWidth<=i.threshold.wheelBandMm||liftBottom<top)throw Error('Unsupported bridge piece or first-rest geometry')
   return{coordinateDatum:'Local occupied groundFFL; add saved ground.ffl to every Z for absolute source-ground coordinates. Retained pipes, fittings and home obstacles use this same local datum.',pieceWidthMm:pieceWidth,jointGapMm:c.bridgeJointGapMm,firstRestBoxMm:rest,firstRestEdgeReserveMm:Math.min((rest[3]-spanY)/2,(rest[4]-pieceWidth)/2)-2*c.settingMm,pieces:rows,
    eachCompleteMassLimitComparisonKg:c.bridgeCompletePieceMassLimitKg,normalWaterAndCargoModesClosedDuringRenewal:true,radiatorHomeUsedNotSimultaneousRenewal:true,
    fittedCargoClearWidthMm:actualFrame.effectiveOpenWidthMm,requiredStraightFirstLiftWidthWithSettingsMm:spanY+4*c.settingMm,fittedFrameAndLowerInfillFirstReleaseQualified:false,actualFrameLiftEdgeReserveMm:Math.min(bridgeBox[1]-fitted[0],fitted[1]-bridgeBox[1]-bridgeBox[4])-2*c.settingMm,necessaryAuthoredFittedFrameFirstLiftWidthScreen:Math.min(bridgeBox[1]-fitted[0],fitted[1]-bridgeBox[1]-bridgeBox[4])-2*c.settingMm>=0,firstLiftRequiresSeparatelyAdmittedLowerFrameInfillRelease:spanY+4*c.settingMm>actualFrame.effectiveOpenWidthMm,
    minimumHomeObstacleReserveMm:Math.min(...rows.map(v=>v.minimumHomeObstacleReserveMm)),minimumActualPipeReserveMm:Math.min(...rows.map(v=>v.minimumActualPipeReserveMm)),
    completeHardwareMeasured:false,gripsRetainersCapturedFirstReleaseAndRestResistanceQualified:false,temporaryRestFloorReactionsQualified:false}
  })(),
  // The real Plant floor body ends inside the wall. Its distribution-base
  // interval does not extend through retained wall/DPC or into outside air.
  floorBodyEastMm=pocket.local!.bodyMinMaxMm[2],mouthHouseXMm=east-c.insideRunMm,
  floorBodyDeltaMm=floorBodyEastMm-mouthHouseXMm,
  floorBodyFlowFaceMm=floorBodyDeltaMm>=0?invert-floorBodyDeltaMm/c.outfallSlopeRatio:invert-floorBodyDeltaMm/c.panSlopeRatio,
  actualFloorBodyBottomAfterTwoSettingsMm=floorBodyFlowFaceMm-c.metalMm-c.insulationMm-distribution[0]-2*c.settingMm,
  exteriorWallPackageBottomMm=invert-c.insulationMm-c.metalMm-(c.insideRunMm+wall)/c.outfallSlopeRatio,
  retainedWallDpcAfterTwoSettingsMm=exteriorWallPackageBottomMm-g.mineralCourse[1]-2*c.settingMm,
  bottomReserve=exteriorWallPackageBottomMm-distribution[0]-c.settingMm,
  topReserve=distribution[1]-invert-c.clearHeightMm-c.insulationMm-c.metalMm-c.settingMm,
  necessarySourceOnlyDrainGeometry=hydraulic.necessaryOpenChannelScreen&&laneChecks.every(v=>v.insideCargoReserveMm>=0)&&actualFloorBodyBottomAfterTwoSettingsMm>=0&&retainedWallDpcAfterTwoSettingsMm>=0&&topReserve>=0&&ordinary.freeDropReserveMm>=0&&localPan.necessaryGeometryScreen&&pocket.local?.necessaryGeometryScreen,
  storedImpulse=(()=>{
   const exclusions=[...i.bridgeHomeObstacles.map(o=>({id:o.id,planMm:[o.boxMm[0],o.boxMm[1],o.boxMm[3],o.boxMm[4]] as const})),{id:c.id+'/complete-threshold-plan-reservation',planMm:[bridgeBox[0],bridgeBox[1],bridgeBox[3],bridgeBox[4]] as const}],
    compare=(outletState:'free-surviving-outlet'|'submerged-or-unqualified'|'both-blocked',outletShiftMm:number)=>inletStoreImpulseBarrier({planMm:i.branch.roomPlanMm,exclusions,
     panHighestAfterIndependentSettingMm:localPan.surfaceMm[1]+c.settingMm,initialStageMm:invert+outletShiftMm+hydraulic.requiredHeadAboveInvertMm,
     // Keep the inlet open: the current method cannot credit pressured flow.
     // Both pool levels follow the SAME actual outlet setting. The independently
     // lower cover/threshold and higher pan are separate adverse settings.
     safeStageMm:Math.min(invert+outletShiftMm+c.clearHeightMm-15,g.finish[0]-c.settingMm,bridgeBox[2]-c.settingMm),
     sourceLmin:i.sourceMaximumPlantLmin,minimumOutflowAtAndAboveInitialLmin:hydraulic.necessaryOpenChannelScreen&&ordinary.freeDropReserveMm>=0?i.sourceMaximumPlantLmin:0,outletState,
     additionalUnrepresentedDisplacementLitres:null,completeMaximumFiniteReleaseLitres:i.stored.maximumRetainedAndDrainableL}),
    settingCases=[-c.settingMm,c.settingMm].map(shift=>({outletShiftMm:shift,comparison:compare('free-surviving-outlet',shift)})),
    retainedRailClearWidthUpperMm=physicalStripSpanMm-c.centralRailWidthMm-4*c.settingMm-2*(c.insulationMm+c.metalMm),
    retainedBridgeClearHeightUpperMm=g.ffl-c.bridgeThicknessMm-invert-c.insulationMm-c.metalMm-2*c.settingMm,
    generousWholeRawArch=retainedBridgeClearHeightUpperMm>47?rectangularCatchmentScreen(i.sourceMaximumPlantLmin,raw[1]-raw[0],retainedBridgeClearHeightUpperMm,length,c.outfallSlopeRatio):null,
    generousGrossCap=generousWholeRawArch?localPan.projectedAreaM2*Math.max(0,generousWholeRawArch.openEntryHeadReserveMm):0
   return{schema:'had-plant-store-impulse/1',settingCases,conditionalGeometricCapAfterKnownExclusionsLitres:Math.min(...settingCases.map(v=>v.comparison.afterKnownExclusionsCapLitres)),
    knownChannelAndBridgeGeometryScreen:!!necessarySourceOnlyDrainGeometry&&bridge.lowerToPackageAfterTwoIndependentSettingsMm>=0&&centreRailReserveMm>=0&&outerRailPackageReservesMm.every(v=>v>=0)&&bridge.nominalStripScreen&&bridge.adverseSpanOnlyStripScreen,
    highSubmerged:compare('submerged-or-unqualified',0),bothBlocked:compare('both-blocked',0),actualMaximumFiniteInventoryAndAdditionalDisplacementKnown:false,
    retainedGeometryBounds:{clearWidthUpperMm:retainedRailClearWidthUpperMm,clearHeightUpperMm:retainedBridgeClearHeightUpperMm,scope:'Retained three equal-width rails, independent setting allowances, same pocket/invert, bridge thickness and cargo reservation. Does not rule out a redesigned support/outlet architecture.'},
    generousWholeRawArchControl:{clearWidthMm:raw[1]-raw[0],clearHeightMm:retainedBridgeClearHeightUpperMm,hydraulic:generousWholeRawArch,grossImpulseCapLitres:generousGrossCap,ignoresAllApparatusAndSupportDisplacement:true,ignoresCompetingIndependentOutletAndMaterialWidths:true,constructibleArrangement:false,actualTransientImpossibilityProved:false},
    safeStageOwner:'Minimum of surviving open inlet crown minus existing15mm air, actual finish underside and bridge underside; covers independently10mm low.',
    conditionalOnly:'Known object footprints conservatively exclude their full stage depth, even for objects above water. Actual further feet, supports, covers, connected free water space and complete store/upper maximum inventory remain unknown.',
    steadySourcePlusStoreAdverseRejected:!storedSourceDrainComparison.necessaryOpenChannelScreen,completeOccupiedArrangementQualified:false}
  })(),
  diagnostics=[...(rawArchVerticalReservation?.diagnostics??[]),...door.diagnostics,...pocket.local!.diagnostics,...localPan.diagnostics,...(pieces.firstRestEdgeReserveMm<0||pieces.pieces.some(p=>p.completeBudgetKg>c.bridgeCompletePieceMassLimitKg||p.minimumAuthoredFrameReserveMm<0||p.minimumHomeObstacleReserveMm<0||p.minimumActualPipeReserveMm<0)?['SPLIT_PLANT_ROOM/bridge-piece-renewal-comparison-fails']:[]),...(!necessarySourceOnlyDrainGeometry?['SPLIT_PLANT_ROOM/source-only-drain-geometry-fails']:[]),...(bridge.lowerToPackageAfterTwoIndependentSettingsMm<0||!bridge.nominalStripScreen||!bridge.adverseSpanOnlyStripScreen||centreRailReserveMm<0||outerRailPackageReservesMm.some(v=>v<0)||bridgeBox[1]>railEnvelopesYMm[0][0]||bridgeBox[1]+bridgeBox[4]<railEnvelopesYMm[2][1]?['SPLIT_PLANT_ROOM/threshold-bridge-comparison-fails']:[]),...(high.freeDropReserveMm<0?['SPLIT_PLANT_ROOM/high-or-submerged-tailwater-rejected']:[]),'SPLIT_PLANT_ROOM/both-outfalls-blocked-unattended-spill',...(!storedSourceDrainComparison.necessaryOpenChannelScreen?['SPLIT_PLANT_ROOM/conditional-source-plus-store-drain-fails']:[]),'SPLIT_PLANT_ROOM/store-backfeed-release-unbounded','SPLIT_PLANT_ROOM/finite-store-inventory-and-free-volume-unqualified','SPLIT_PLANT_ROOM/pressure-jet-wet-door-and-electrical-separation-unqualified',...(pieces.necessaryAuthoredFittedFrameFirstLiftWidthScreen?[]:['SPLIT_PLANT_ROOM/fitted-frame-infill-first-release-unproved']),'SPLIT_PLANT_ROOM/threshold-support-and-captured-renewal-unqualified','SPLIT_PLANT_ROOM/DPC-weather-warmth-material-interfaces-unqualified','SPLIT_PLANT_ROOM/replacement-dead-and-water-actions-not-in-52-head-model']
 return{...common,state:'unadopted-threshold-drainage-successor' as const,ground:g,pocket,pan,outfalls,bridge:{...bridge,removablePieces:pieces},receiverCases:{ordinary,highSubmerged:high,bothBlocked:'reject-unattended-no-storage-or-manual-credit'},
  drainageGeometry:{distributionMm:distribution,invertMm:invert,wallInvertMm:wallInvert,terminalInvertMm:terminalInvert,bottomAfterSettingMm:bottomReserve,oldUniformDistributionPlaneInterpretation:'Retained historical reservation at outer wall; it is not the actual local-floor body boundary and no longer decides floor-body fit.',actualFloorBody:{eastEdgeHouseXMm:floorBodyEastMm,flowFaceMm:floorBodyFlowFaceMm,metalAndInsulationUndersideMm:floorBodyFlowFaceMm-c.metalMm-c.insulationMm,distributionBaseMm:distribution[0],twoIndependentSettingsMm:2*c.settingMm,bottomReserveMm:actualFloorBodyBottomAfterTwoSettingsMm},retainedWall:{outsidePackageBottomMm:exteriorWallPackageBottomMm,retainedDpcTopMm:g.mineralCourse[1],twoIndependentSettingsMm:2*c.settingMm,reserveMm:retainedWallDpcAfterTwoSettingsMm,weatherThermalAndActualSupportQualified:false},knownFloorAndBridgeInterfaceGeometryScreen:actualFloorBodyBottomAfterTwoSettingsMm>=0&&retainedWallDpcAfterTwoSettingsMm>=0&&bridge.lowerToPackageAfterTwoIndependentSettingsMm>=0,topAfterSettingMm:topReserve,necessarySourceOnlyDrainGeometry:!!necessarySourceOnlyDrainGeometry},
  localPanCoordinateTransform:'Proper rotation U=houseY,V=-houseX; public pan faces, origins and all force/moment vectors returned in house XYZ.',
  storedImpulse,inventory:{panDevelopedCopperUpperKg:localPan.afterLowerSettingDevelopedSheetUpperKg,outfallCopperKg:outfalls.map(x=>x.bodyStockGravity.massKg),blockedPanWaterUpperKg:localPan.afterLowerSettingGrossWaterToFloorUpperKg,closedWaterKg:outfalls.map(x=>x.fullWaterInventoryControl.massKg),bridgeStockKg:bridgeKg,
   completeInstalledDeadMassKg:null,wholeFaultMaximumWaterKg:null,panWaterAndClosedWaterDomainsDisjoint:true,waterWeightControlNotAdditionalToHydrostaticMetalActions:true,replacementFloorNotAutomaticallyAdded:true},
  maintenance:'Isolate the independent Plant Lodge and house cuts and actual store/upper/primary energy; verify cold zero-pressure; retain source/tee/tree on separate supports. Capture bridge and every pan/outfall before release; keep D2 and electrical/PV independence. No live-sibling, hand-lift or pan-supported pipe credit.',diagnostics}
}
export function drawInletSplitPlantRoom(r:ReturnType<typeof inletSplitPlantRoom>){
 const diagnosticRows=r.diagnostics.filter(d=>d.startsWith('SPLIT_PLANT_ROOM')||d.startsWith('PLANT_FITTED_DOOR')),height=Math.max(980,760+diagnosticRows.length*25+65)
 const [x,y,w,d]=r.roomPlanMm,scale=.1,X=(v:number)=>40+(v-x)*scale,Y=(v:number)=>560-(v-y)*scale,
  box=(b:readonly number[],colour:string)=>`<rect x="${X(b[0])}" y="${Y(b[1]+b[4])}" width="${b[3]*scale}" height="${b[4]*scale}" fill="${colour}" stroke="#6c7168"/>`,
  text=(a:number,b:number,s:string,size=16)=>`<text x="${a}" y="${b}" font-size="${size}">${s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`
 return`<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="${height}" viewBox="0 0 1250 ${height}"><rect width="1250" height="${height}" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">${text(30,40,'Plant wet-floor successor · two independent threshold outfalls',25)}${text(30,75,'Unchanged masonry/cargo opening. Local floor, bridge, source/store and receivers remain unadopted.')}
 <rect x="40" y="${Y(y+d)}" width="${w*scale}" height="${d*scale}" fill="#dce9e5" stroke="#6c7168"/>${r.branchIdentity?text(40,145,'Plant room · actual bound geometry'):''}
 ${box([...r.fittedDoor.requiredClearExternalWorkDeckPlanMm.slice(0,2),0,...r.fittedDoor.requiredClearExternalWorkDeckPlanMm.slice(2),1],'#eee3ce')}
 ${r.actualFittedFrame.infills.map(f=>box(f.fullReservedBoxMm,'#c6b494')).join('')}
 ${r.fittedDoor.exteriorPlanObstacles.map(o=>box([...o.planMm.slice(0,2),0,...o.planMm.slice(2),1],'#b6a3a1')).join('')}
 ${box([r.actualFittedFrame.hingeMm[0]-r.actualFittedFrame.leafHalfMm,r.actualFittedFrame.hingeMm[1]-r.actualFittedFrame.leafSpanMm,0,r.actualFittedFrame.choice.leafThicknessMm,r.actualFittedFrame.leafSpanMm,1],'#e6e4dd')}${box(r.fittedDoor.parkedLeafBoxMm,'#e6e4dd')}
 ${r.resolvedInput.branch.paths.map(p=>`<polyline points="${(p.formedGeometry?.path??p.points).map(a=>`${X(a[0])},${Y(a[1])}`).join(' ')}" fill="none" stroke="#357d91" stroke-width="2"/>`).join('')}
 <polyline points="${r.fittedDoor.poses.map(p=>`${X(p.shoulderMm[0])},${Y(p.shoulderMm[1])}`).join(' ')}" fill="none" stroke="#866457" stroke-dasharray="4 4"/>
 ${r.fittedDoor.poses.filter((_,k)=>k===0||k===5||k===10).map(p=>`<circle cx="${X(p.shoulderMm[0])}" cy="${Y(p.shoulderMm[1])}" r="${r.fittedDoor.bodyRadiusMm*scale}" fill="#ad8369" fill-opacity=".12" stroke="#866457"/>`).join('')}
 ${text(40,200,`Effective frame ${r.actualFittedFrame.effectiveOpenWidthMm}mm; minimum cargo ${r.actualFittedFrame.minimumCargoMm[0]}mm.`)}${text(40,230,`Exterior deck ${r.fittedDoor.requiredExternalDeckFootprintM2.toFixed(3)}m² at local FFL.`)}${text(40,260,'Closed/parked leaf and body poses are separate states.',14)}${text(40,290,'Actual deck, frame, hardware and site remain unqualified.',14)}
 ${r.bridge?box(r.bridge.boxMm,'#c8bb96'):''}${r.outfalls?r.outfalls.map((o:any)=>{const p=o.clearCornersMm,lo=[0,1,2].map(k=>Math.min(...p.map((v:any)=>v[k]))),hi=[0,1,2].map(k=>Math.max(...p.map((v:any)=>v[k])));return box([...lo,...hi.map((v,k)=>v-lo[k])],'#94bcc4')}).join(''):''}
 ${text(600,150,`Source-only ${r.sourceOnlyLmin.toFixed(3)} L/min; stored backfeed remains unbounded.`)}${text(600,195,`Old infill-only route: ${r.rejectedInfillOnly.rejected?'REJECTED':'necessary screen only'}.`)}${text(600,240,`Two complete packages: ${r.thresholdRoute.outerPackageMm.join(' × ')} mm.`)}${text(600,285,`Cargo width retained: ${r.thresholdRoute.retained1000mmCargoWidth} mm.`)}${text(600,330,`Each lane edge reserve: ${r.thresholdRoute.laneChecks.map(v=>v.insideCargoReserveMm.toFixed(1)).join(' / ')} mm.`)}${text(600,375,r.state==='unadopted-threshold-drainage-successor'?`Source-only drain geometry: ${r.drainageGeometry.necessarySourceOnlyDrainGeometry?'within declared comparisons':'REJECTED'}.`:'Saved ground required for actual floor/receiver levels.')}
 ${text(600,420,r.bridge?`Bridge stock ${r.bridge.stockReferenceKg.toFixed(2)} kg; nominal strip ${r.bridge.nominalStripStressMPa.toFixed(1)} MPa.`:'No bridge or stock proof without ground.')}${text(600,465,'New rail seats, exterior support and loaded capture required.')}${text(600,510,'Old120 mm plate proof is not reused.')}${text(600,555,r.state==='unadopted-threshold-drainage-successor'?`Conditional impulse cap ${r.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres.toFixed(2)} L; free volume unqualified.`:'D2 independent; saved ground required for impulse cap.')}${text(600,595,`Source + store sensitivity: ${r.storedRelease.conditionalAdverse.sourcePlusStoredLmin.toFixed(1)} L/min · ${r.storedRelease.conditionalAdverse.sourcePlusStoredDrainScreen?'necessary screen only':'REJECTED'}.`)}${text(600,630,`Fitted ${r.actualFittedFrame.effectiveOpenWidthMm}mm; spring reserve ${r.actualFittedFrame.headerToRawSpringReserveMm===null?'profile unjoined':r.actualFittedFrame.headerToRawSpringReserveMm.toFixed(0)+'mm'}; renewal withheld.`)}${text(30,650,'Adverse states and current limits',20)}${diagnosticRows.map((d,k)=>text(35,690+25*k,d.replace('SPLIT_PLANT_ROOM/',''),14)).join('')}${text(30,height-30,'HAD OPEN · no complete occupied arrangement, material exception, support capacity or selected house',17)}</g></svg>`
}

/** Exact rectangular leaf/pipe distance at every sampled pose, with continuous
 * Lipschitz coverage. This does not make a classified door or force/thermal pass. */
export function comparePlantFittedDoor(i:SplitPlantRoomInput){
 const f=i.branch.fittedFrame,c=f.choice,rise=f.resolvedInput.floorRiseMm??0,s=2*i.choice.settingMm,L=f.leafSpanMm,t=c.leafThicknessMm,h=c.clearHeightMm,half=t/2,step=Math.PI/1800,
  hinge=f.hingeMm,localLeaf=[0,-half,0,L,t,h] as const,
  toWorld=(u:number,v:number,z:number,a:number):Point=>[hinge[0]+u*Math.sin(a)+v*Math.cos(a),hinge[1]-u*Math.cos(a)+v*Math.sin(a),z+rise],
  toLocal=(p:readonly number[],a:number):Point=>[(p[0]-hinge[0])*Math.sin(a)-(p[1]-hinge[1])*Math.cos(a),(p[0]-hinge[0])*Math.cos(a)+(p[1]-hinge[1])*Math.sin(a),p[2]-rise],
  pairGap=(a:readonly number[],b:readonly number[])=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)},
  localBodySpeed=Math.hypot(2*c.operatorBulgeMm,Math.abs(c.operatorNormalEndMm-c.operatorNormalStartMm)/(Math.PI/2)),
  worldBodySpeed=Math.hypot(L+c.operatorEndOffsetMm+c.operatorBulgeMm,Math.max(Math.abs(c.operatorNormalStartMm),Math.abs(c.operatorNormalEndMm)))+localBodySpeed,
  cover={leafMm:Math.hypot(L,half)*step/2,bodyWorldMm:worldBodySpeed*step/2,bodyRelativeLeafMm:localBodySpeed*step/2},
  pipeSegments=i.branch.paths.flatMap(r=>{const points=r.formedGeometry?.path??r.points;return points.slice(1).map((b,k)=>({id:r.id,index:k,a:points[k],b,radius:r.radiusMm,error:r.formedGeometry?.hausdorffError??0}))}),
  minima={leafPipe:Infinity,bodyPipe:Infinity,armPipe:Infinity,bodyLeaf:Infinity,armLeaf:Infinity,bodyDeck:Infinity,bodyFixed:Infinity,armFixed:Infinity,leafFixed:Infinity,deckFixed:Infinity},
  witness={} as Record<string,unknown>,poses=[] as {angleDeg:number;shoulderMm:Point;gripMm:Point;bodyPlanMm:readonly[number,number]}[]
 let maxReach=0
 const accept=(key:keyof typeof minima,value:number,detail:unknown)=>{if(value<minima[key]){minima[key]=value;witness[key]=detail}}
 const exteriorObstacles=i.exteriorPlanObstacles.map(o=>({id:o.id,boxMm:[o.planMm[0],o.planMm[1],0,o.planMm[2],o.planMm[3],Math.max(2300,c.clearHeightMm+rise)] as const})),fixed=[...i.bridgeHomeObstacles,...exteriorObstacles],deck=c.externalWorkDeckPlanMm
 for(const o of exteriorObstacles)accept('deckFixed',pairGap([deck[0],deck[1],0,deck[2],deck[3],1],o.boxMm)-s,{obstacle:o.id})
 for(let k=0;k<=900;k++){
  const a=k*step,deg=k/10,U=L+c.operatorEndOffsetMm+c.operatorBulgeMm*Math.sin(2*a),V=c.operatorNormalStartMm+(c.operatorNormalEndMm-c.operatorNormalStartMm)*k/900,
   shoulder=toWorld(U,V,c.operatorShoulderHeightMm,a),grip=toWorld(L-c.handleOffsetFromFreeEndMm,c.handleProjectionMm,c.handleHeightMm,a),axisA:Point=[shoulder[0],shoulder[1],rise],axisB:Point=[shoulder[0],shoulder[1],2000+rise],
   leafCorners=[[0,-half],[0,half],[L,-half],[L,half]].map(([u,v])=>toWorld(u,v,0,a)),lo=[0,1].map(j=>Math.min(...leafCorners.map(p=>p[j]))),hi=[0,1].map(j=>Math.max(...leafCorners.map(p=>p[j]))),leafBox=[lo[0],lo[1],rise,hi[0]-lo[0],hi[1]-lo[1],h],
   deck=c.externalWorkDeckPlanMm,bodyR=300,armR=40,
   deckReserve=Math.min(shoulder[0]-deck[0],deck[0]+deck[2]-shoulder[0],shoulder[1]-deck[1],deck[1]+deck[3]-shoulder[1])-bodyR-s-c.deckGuardIntrusionMm-cover.bodyWorldMm,
   bodyLeaf=segmentBoxDistance([U,V,0],[U,V,2000],localLeaf)-bodyR-s-cover.bodyRelativeLeafMm,
   armLeaf=segmentBoxDistance([U,V,c.operatorShoulderHeightMm],[L-c.handleOffsetFromFreeEndMm,c.handleProjectionMm,c.handleHeightMm],localLeaf)-armR-s-cover.bodyRelativeLeafMm,
   reach=Math.hypot(...shoulder.map((v,j)=>v-grip[j]))
  maxReach=Math.max(maxReach,reach);accept('bodyLeaf',bodyLeaf,{angleDeg:deg});accept('armLeaf',armLeaf,{angleDeg:deg});accept('bodyDeck',deckReserve,{angleDeg:deg,shoulderMm:shoulder})
  for(const p of pipeSegments){
   accept('leafPipe',segmentBoxDistance(toLocal(p.a,a),toLocal(p.b,a),localLeaf)-p.radius-s-cover.leafMm-p.error,{angleDeg:deg,path:p.id,segment:p.index})
   accept('bodyPipe',segmentDistance(axisA,axisB,p.a,p.b)-bodyR-p.radius-s-cover.bodyWorldMm-p.error,{angleDeg:deg,path:p.id,segment:p.index})
   accept('armPipe',segmentDistance(shoulder,grip,p.a,p.b)-armR-p.radius-s-cover.bodyWorldMm-p.error,{angleDeg:deg,path:p.id,segment:p.index})
  }
  for(const o of fixed){
   accept('bodyFixed',segmentBoxDistance(axisA,axisB,o.boxMm)-bodyR-s-cover.bodyWorldMm,{angleDeg:deg,obstacle:o.id})
   accept('armFixed',segmentBoxDistance(shoulder,grip,o.boxMm)-armR-s-cover.bodyWorldMm,{angleDeg:deg,obstacle:o.id})
   accept('leafFixed',pairGap(leafBox,o.boxMm)-s-cover.leafMm,{angleDeg:deg,obstacle:o.id})
  }
  if(k%90===0||k===900)poses.push({angleDeg:deg,shoulderMm:shoulder,gripMm:grip,bodyPlanMm:[shoulder[0],shoulder[1]]})
 }
 const parked= [hinge[0],hinge[1]-half,rise,L,t,h] as const,
  goodsChecks=i.branch.goods.map(g=>{const boxes=g.pathMm.slice(1).map((b:readonly number[],k:number)=>{const a=g.pathMm[k];return[Math.min(a[0],b[0])-g.completeRadiusMm,Math.min(a[1],b[1])-g.completeRadiusMm,rise,Math.abs(a[0]-b[0])+2*g.completeRadiusMm,Math.abs(a[1]-b[1])+2*g.completeRadiusMm,g.maximumCompleteHeightMm]});return{id:g.id,parkedLeafReserveMm:Math.min(...boxes.map((b:readonly number[])=>pairGap(parked,b)))-s}}),
  gravity=(angle:number)=>{const centre=toWorld(L/2,0,h/2,angle),absolute=centre.map((v,k)=>v+(k===2?i.branch.groundFflMm:0)),Fz=-c.leafMassBudgetKg*9.81;return{referenceCentreMm:absolute,forceMomentN_Nm:[0,0,Fz,absolute[1]/1000*Fz,-absolute[0]/1000*Fz,0],hingeGravityMomentReferenceNm:c.leafMassBudgetKg*9.81*L/2000}},
  diagnostics=[...Object.entries(minima).filter(([,v])=>v<0).map(([k])=>'PLANT_FITTED_DOOR/'+k),...(maxReach+cover.bodyRelativeLeafMm>650?['PLANT_FITTED_DOOR/reach']:[]),...(goodsChecks.some(g=>g.parkedLeafReserveMm<0)?['PLANT_FITTED_DOOR/parked-leaf-goods']:[]),...(f.sourceBoreSideReserveMm<0?['PLANT_FITTED_DOOR/source-infill-port-side-land']:[]),...(f.exactOuterArchGeometry?(f.exactOuterArchGeometry.necessaryExactRectangleFit?[]:['PLANT_FITTED_DOOR/outer-frame-curved-arch-fit']):f.headerToRawSpringReserveMm===null?['PLANT_FITTED_DOOR/raised-arch-profile-not-joined']:f.headerToRawSpringReserveMm<0?['PLANT_FITTED_DOOR/frame-header-raw-arch']:[])]
 return{schema:'had-plant-fitted-door-comparison/1',fittedFrameId:f.id,datum:'Local occupied groundFFL for geometry; leaf budget origins additionally translate by saved groundFFL.',effectiveOpenClearWidthMm:f.effectiveOpenWidthMm,minimumCargoWidthMm:f.minimumCargoMm[0],parkedLeafBoxMm:parked,
  hingeMm:hinge,leafSpanMm:L,leafThicknessMm:t,exactNorthLeafSweptMinimumYMm:f.exactNorthLeafSweptMinimumYMm,sourceOnlyYSeparationAfterTwoSettingsMm:f.exactNorthLeafSweptMinimumYMm-f.sourceAxisYMm-i.branch.resolvedInput.envelope.backboneRadiusMm-s,
  continuous:{stepDeg:.1,executedPoses:901,coverMm:cover,method:'Exact segment-to-rectangular-leaf distances at all poses; speed/Hausdorff bounds cover intervening leaf and body/arm states. No blanket22mmY expansion near the closed tip.'},minima,witness,sampledMaxReachMm:maxReach,maxReachMm:maxReach+cover.bodyRelativeLeafMm,reachLimitMm:650,bodyRadiusMm:300,armRadiusMm:40,twoIndependentSettingsMm:s,poses,goodsChecks,
  requiredClearExternalWorkDeckPlanMm:c.externalWorkDeckPlanMm,requiredExternalDeckFootprintM2:deck[2]*deck[3]/1e6,exteriorPlanObstacles:i.exteriorPlanObstacles,guardIntrusionMm:c.deckGuardIntrusionMm,requiredExteriorDeckAbsoluteZMm:i.branch.groundFflMm,ordinaryDeckSupportGradeAndActualHandoverQualified:false,
  operatingMode:'Goods home and east deck clear before opening; one operator follows the declared exterior handle path. Hold leaf positively at90degrees before apparatus or bridge renewal. No simultaneous door swing, cart transit, or source-fault response credit.',
  leafGravityBudget:{kg:c.leafMassBudgetKg,closed:gravity(0),parked:gravity(Math.PI/2),actualCompleteStockMassAndCentroidKnown:false,frameHingeWallAndFoundationTransferQualified:false,windAndOperatingTorqueQualified:false},
  necessaryDeclaredDoorAndParkedGoodsGeometryScreen:diagnostics.length===0,matchedWeatherAirThermalFireSealsAndHardwareQualified:false,thermalAssemblyAndUValue:null,doorOperatingForceAndHumanPerformanceQualified:false,fullOccupiedArrangementComplete:false,selected:false,diagnostics}
}
