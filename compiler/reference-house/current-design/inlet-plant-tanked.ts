import {sha256SemanticFingerprint} from '../../core/identity.js'
import {inletSplitPlantRoom} from './inlet-split-plant-room.js'
import {inletSplitPlantBranch} from './inlet-split-plant-branch.js'
import {supercriticalOutfallProfile,inletColdSourceMinimumDensityKgM3} from './inlet-open-closed-outfall.js'
import {admitStoreVesselChoice,storeVesselInnerVolumeLitres} from './inlet-store-vessel.js'
import {plantPotableInventory,type PlantInventoryControl} from './inlet-plant-potable-inventory.js'
import {plantTankedWalkingSurface,type PlantWalkControl} from './inlet-plant-tanked-walk.js'
type B=readonly[number,number,number,number,number,number]
type C=PlantWalkControl&{revision:number;maximumBulkWaterRelativeWalkingMm:number;upstandAboveWalkingMm:number;legacyContinuousFinishRetainedInPlant:boolean;closedDuctStorageCreditLitres:number;legacyFinishUndersideProtectedMm:number;
 outfalls:{clearWidthMm:number;clearHeightMm:number;metalMm:number;outletAxesYMm:readonly[number,number];entranceKComparison:number;manningNComparison:number;invertRiseAboveExistingMm:number;maximumPlateDeflectionMm:number;receiverClearWidthMm:number;receiverMetalMm:number};
 frame:{clearWidthMm:number;clearHeightMm:number;headerDepthMm:number;sourceInfillPortDiameterMm:number};inventory:PlantInventoryControl;
 internalAccess:{firstRiseFraction:number;treadPlanMm:readonly[number,number,number,number];riseAtYMm:readonly[number,number];operatorCentreXMm:number;parkedSourceLeafEastXMm:number};
 externalDeckPlanMm:readonly[number,number,number,number];externalRampRunMm:number}
const length=(p:readonly(readonly number[])[])=>p.slice(1).reduce((s,b,k)=>s+Math.hypot(...b.map((v,j)=>v-p[k][j])),0)
const area=(r:readonly number[])=>r[2]*r[3]/1e6
const boxL=(b:readonly number[])=>b.slice(3).reduce((a,b)=>a*b,1)/1e6
const tee=(a:{takeoffMm:number;nutAFMm:number})=>{const r=a.nutAFMm/(2*Math.cos(Math.PI/6));return 2*(a.takeoffMm+r)*(a.takeoffMm+2*r)*2*r/1e6}
const wetB=(b:B,lo:number,hi:number,room:readonly number[])=>Math.max(0,Math.min(b[0]+b[3],room[0]+room[2])-Math.max(b[0],room[0]))*Math.max(0,Math.min(b[1]+b[4],room[1]+room[3])-Math.max(b[1],room[1]))*Math.max(0,Math.min(b[2]+b[5],hi)-Math.max(b[2],lo))/1e6
/** One selected physical alternative: open metal walking floor over the actual
 * pan, independently supported apparatus, upstands/threshold at walking level,
 * and bridge rails OVER the outlet bodies. Bulk capacity takes NO closed-duct
 * storage or discharge-during-rupture credit. This is not a current native
 * force result, a product rating or physical installation approval. */
export function inletPlantTankedRoom(i:{choice:unknown;plant:any;vesselChoice:unknown;mat:unknown;maximumSourceApertureMm:number}){
 const c=i.choice as C,p=i.plant,v=admitStoreVesselChoice(i.vesselChoice)
 if(c?.schema!=='had-plant-tanked-walk/1'||!c.id||c.legacyContinuousFinishRetainedInPlant!==false||c.closedDuctStorageCreditLitres!==0||c.walkingRiseAboveHouseFflMm<0||c.walkingRiseAboveHouseFflMm>150||c.maximumBulkWaterRelativeWalkingMm>=0||c.upstandAboveWalkingMm<0
  ||!p?.resolvedInput||p.state!=='unadopted-threshold-drainage-successor'||!p.ground||!p.pan||!p.bridge||!p.resolvedInput.branch?.resolvedInput||!Number.isFinite(i.maximumSourceApertureMm)||i.maximumSourceApertureMm<=0)throw Error('Actual source Plant pan and explicit tanked-walk replacement required')
 const numeric=[c.walkingRiseAboveHouseFflMm,c.maximumBulkWaterRelativeWalkingMm,c.upstandAboveWalkingMm,c.bridgeAboveWalkingMm,...Object.values(c.outfalls),...Object.values(c.frame),...c.internalAccess.treadPlanMm,...c.internalAccess.riseAtYMm,c.internalAccess.firstRiseFraction,c.internalAccess.operatorCentreXMm,c.externalRampRunMm].flat()
 if(numeric.some(n=>typeof n!=='number'||!Number.isFinite(n))||c.outfalls.manningNComparison<.005||c.outfalls.manningNComparison>.05||c.outfalls.entranceKComparison<0||c.outfalls.entranceKComparison>5||c.internalAccess.firstRiseFraction<=0||c.internalAccess.firstRiseFraction>=1)throw Error('Bounded tanked Plant conditions required')
 const original=p.resolvedInput.branch,{reviewSvg:_reviewSvg,...branch}=original,fresh=inletSplitPlantBranch(original.resolvedInput)
 if(sha256SemanticFingerprint(branch)!==sha256SemanticFingerprint(fresh))throw Error('Mixed or modified original Plant branch source')
 const wheel=(v.handling.maximumCompleteDryCargoKg+v.handling.maximumCargoResidualKg)*9.81*v.handling.cargoDynamicFactor,
  sourceCase={...p.resolvedInput,choice:{...p.choice,clearWidthMm:c.outfalls.clearWidthMm,clearHeightMm:c.outfalls.clearHeightMm,metalMm:c.outfalls.metalMm,outletAxesYMm:c.outfalls.outletAxesYMm,invertAboveDistributionMm:p.choice.invertAboveDistributionMm+c.outfalls.invertRiseAboveExistingMm,bridgeThicknessMm:c.bridge.thicknessMm,bridgePieceCount:c.bridge.pieceCount,referenceWheelActionIncludingDynamicN:wheel,receiverWidthMm:c.outfalls.receiverClearWidthMm},
   threshold:{...p.resolvedInput.threshold,wheelActionIncludingDynamicN:wheel}},
  replay=inletSplitPlantRoom(sourceCase)
 if(replay.state!=='unadopted-threshold-drainage-successor'||!replay.pan||!replay.outfalls||!replay.ground)throw Error('No supported actual pan/closed-body replay for tanked Plant')
 const pan=replay.pan as any,outfalls=replay.outfalls as any[],g=replay.ground,room=replay.roomPlanMm,s=p.choice.settingMm,walk=g.ffl+c.walkingRiseAboveHouseFflMm,
  crest=walk+c.upstandAboveWalkingMm,maximum=Math.min(walk+c.maximumBulkWaterRelativeWalkingMm,crest-2*s),
  exactQ=Math.PI/4*(i.maximumSourceApertureMm/1000)**2*Math.sqrt(2*p.resolvedInput.sourceMaximumAbsoluteBar*1e5/inletColdSourceMinimumDensityKgM3)*60000
 if(Math.abs(exactQ-p.sourceOnlyLmin)>1e-4)throw Error('Actual source aperture/absolute pressure contradicts Plant source-flow fixture')
 const profiles=outfalls.map((o:any,k:number)=>{
  const mouth=pan.outletMouthsMm[k] as number[],corners=o.clearCornersMm as number[][],terminal=corners.slice(0,4).filter((a:number[])=>a[0]===Math.max(...corners.map((v:number[])=>v[0]))),
   end=[terminal.reduce((a:number,p:number[])=>a+p[0],0)/terminal.length,terminal.reduce((a:number,p:number[])=>a+p[1],0)/terminal.length,terminal[0][2]],
   L=Math.hypot(end[0]-mouth[0],end[1]-mouth[1]),b=c.outfalls.clearWidthMm/2/1000,yc=Math.cbrt((exactQ/60000)**2/(9.81*b*b)),
   refinements=[32,64,128].map(steps=>supercriticalOutfallProfile({qLmin:exactQ,effectiveWidthMm:b*1000,lengthMm:L,slope:1/p.choice.outfallSlopeRatio,inletDepthMm:yc*1000,stationsMm:[p.choice.insideRunMm],steps,manningN:c.outfalls.manningNComparison})),
   pool=mouth[2]+32+1000*yc*(1.5+c.outfalls.entranceKComparison/2)+s,
   receiver=replay.receiverCases!.ordinary.waterMm,freeDrop=end[2]-s-receiver-25
  return{id:o.id,actualMouthMm:mouth,actualTerminalMm:end,lengthMm:L,effectiveSurvivingWidthMm:b*1000,depositMm:32,entryK:c.outfalls.entranceKComparison,criticalDepthMm:yc*1000,initialSourcePoolMm:pool,refinements,freeDropReserveMm:freeDrop,necessaryFreeSourceProfile:freeDrop>=0&&refinements.every(r=>r.state==='resolved-supercritical-profile')}
 })
 const initial=Math.max(...profiles.map(r=>r.initialSourcePoolMm)),network=plantPotableInventory(i.mat,c.inventory),m=i.mat as any,
  riserVertical=Math.max(...m.trunks.filter((t:any)=>t.duties.includes('hot')).map((t:any)=>t.selected3DProfile[0][2]))-Math.min(...m.trunks.filter((t:any)=>t.duties.includes('hot')).map((t:any)=>t.selected3DProfile[0][2])),
  riserEndBound=2*(m.plant.riserGross[2]+m.plant.riserGross[3]),riserRows=[{id:'cold',od:c.inventory.trunkMaximumBareOuterDiameterMm,f:c.inventory.fitting.twentyTwo},{id:'hot',od:c.inventory.trunkMaximumBareOuterDiameterMm,f:c.inventory.fitting.twentyTwo},{id:'hot-return',od:c.inventory.terminalAndReturnMaximumBareOuterDiameterMm,f:c.inventory.fitting.fifteen}].map(r=>({...r,verticalMm:riserVertical,maximumEndDetourMm:riserEndBound,pipeOuterUpperL:Math.PI/4*r.od**2*(riserVertical+riserEndBound)/1e6,fullFittingUpperL:6*tee(r.f)})),
  riserUpper=riserRows.reduce((a,r)=>a+r.pipeOuterUpperL+r.fullFittingUpperL,0),
  feedRows=original.paths.map((r:any)=>{const L=length(r.points);return{id:r.id,virtualTubeLengthMm:L,outerTubeUpperL:Math.PI/4*28.1**2*L/1e6,fullFittingUpperL:Math.max(r.points.length-2,0)*tee(c.inventory.fitting.twentyEight)}}),
  pressureValveOuter=boxL(original.referenceValve.bodyMm)+boxL(original.referenceValve.stemMm),
  feedUpper=feedRows.reduce((n:number,r:any)=>n+r.outerTubeUpperL+r.fullFittingUpperL,0)+2*pressureValveOuter,
  vesselGeometry=storeVesselInnerVolumeLitres(v)+v.maximumWettedPortsAndAccessoriesLitres,
  vesselUpper=v.maximumBodyAndPortsLitres,expansionUpper=v.expansion.maximumDrainableWaterLitres,
  release=vesselUpper+expansionUpper+network.wholeSelectedTrunkBranchAndDeviceDesignUpperL+riserUpper+feedUpper,
  mouthRoofMaximum=Math.max(...pan.outletMouthsMm.map((p:number[])=>p[2]+c.outfalls.clearHeightMm+c.outfalls.metalMm+replay.choice.insulationMm)),
  externalBeamLeft=c.bridge.outsideRailSeatXMm-c.bridge.crossBeamSectionWHtMm[0]/2,
  externalRoof=mouthRoofMaximum-(externalBeamLeft-pan.outletMouthsMm[0][0])/replay.choice.outfallSlopeRatio,
  walking=plantTankedWalkingSurface({choice:c,roomPlanMm:room as [number,number,number,number],houseFflMm:g.ffl,initialWaterMm:initial,maximumWaterMm:maximum,wheelN:wheel,panMinimumMm:pan.surfaceMm[0],panMaximumMm:pan.surfaceMm[1],bridgeInnerXMm:p.bridge.boxMm[0],bridgeOuterXMm:p.resolvedInput.threshold.outerEdgeXMm,bridgePlateYMm:p.resolvedInput.threshold.plateWidthYMm,outfallRoofMaximumMm:mouthRoofMaximum,sourceRoofAtExternalBeamMm:externalRoof,settingEachMm:s}),
  gross=area(room)*(maximum-initial),net=gross-walking.solidsIncrementUpperL,
  reserve=net-release,
  minBed=Math.min(...outfalls.flatMap(o=>o.clearCornersMm.slice(0,4).map((p:number[])=>p[2])))-s,maxPressureMPa=9.81*(maximum-minBed)/1e6,
  stripStress=.75*maxPressureMPa*c.outfalls.clearWidthMm**2/c.outfalls.metalMm**2,
  plateDeflection=5*maxPressureMPa*c.outfalls.clearWidthMm**4/(32*c.material.elasticModulusMPa*c.outfalls.metalMm**3),
  upstands=pan.upstandFaces.map((f:any)=>({...f,cornersMm:f.cornersMm.map((a:number[])=>[a[0],a[1],a[2]===g.ffl?crest:a[2]])})),
  allFaces=[...pan.cells.map((c:any)=>({cornersMm:c.cornersMm})),...upstands],
  triangleArea=(a:number[],b:number[],c:number[])=>{const x=b.map((v,k)=>v-a[k]),y=c.map((v,k)=>v-a[k]);return Math.hypot(x[1]*y[2]-x[2]*y[1],x[2]*y[0]-x[0]*y[2],x[0]*y[1]-x[1]*y[0])/2e6},
  developed=allFaces.reduce((n:number,f:any)=>n+f.cornersMm.slice(1,-1).reduce((s:number,b:number[],k:number)=>s+triangleArea(f.cornersMm[0],b,f.cornersMm[k+2]),0),0),
  movingIds=new Set(['actual-vessel-home-conservative-box','actual-buffer-complete-station','actual-radiator-renewal-reservation']),
  sourceLocalFromHouseFloor=original.obstacles.map((o:any)=>({...o,movesWithPlantWalkingFloor:movingIds.has(o.id),boxMm:o.boxMm.map((a:number,k:number)=>a+(k===2&&movingIds.has(o.id)?c.walkingRiseAboveHouseFflMm:0))})),
  sourceMovedObstacles=sourceLocalFromHouseFloor.map((o:any)=>({...o,boxMm:o.boxMm.map((a:number,k:number)=>a+(k===2?g.ffl:0))})),
  bodyRawBase={sourceHouseFflMm:g.ffl,serviceWalkingFflMm:walk,declaredPlantApparatusAndPortsRelativeTranslationMm:[0,0,c.walkingRiseAboveHouseFflMm],movingSourceObjectIds:[...movingIds],coordinateDatum:'absolute source comparison: groundFFL added once; only explicit Plant apparatus move; house piers/spine/CU/frame/opposite covers remain fixed.',sourceLocalFromHouseFloor,fullHeightControlsAndRiserRemainFixedConservativeTerritories:true,fixedHouseFeedLocalMm:original.choice.coldTreeInterfaceMm,actualTransformedSourceEnvelopes:sourceMovedObstacles,actualFactoryPortAndServiceRenewalJoinsAccepted:false},
  actualCargoMaximum=Math.max(...original.goods.map((r:any)=>r.maximumCompleteHeightMm)),
  actualFrame={sourceClearHeightMm:p.choice.fittedFrame.clearHeightMm,choice:c.frame,bottomMm:walk,clearHeadMm:walk+c.frame.clearHeightMm,headerTopMm:walk+c.frame.clearHeightMm+c.frame.headerDepthMm,actualCompleteCargoMaximumMm:actualCargoMaximum,cargoHeadReserveAfterTwoSettingsMm:c.frame.clearHeightMm-actualCargoMaximum-2*s,nominalSourceCeilingMm:original.ceilingMm+g.ffl,headerReserveAfterTwoSettingsMm:original.ceilingMm+g.ffl-walk-c.frame.clearHeightMm-c.frame.headerDepthMm-2*s,joinedRawArchAndActualLeafSweepAccepted:false},
  sourceRetired=network.retiredUtilityColdDutyIncluded===false,
  diagnostics=[...(!profiles.every(r=>r.necessaryFreeSourceProfile)?['PLANT_TANK/source-profile-or-exterior-receiver-unsupported']:[]),...(reserve<0?['PLANT_TANK/full-store-pressure-network-static-volume-fails']:[]),...(vesselGeometry>vesselUpper?['PLANT_TANK/vessel-inner-and-ports-exceed-cap']:[]),...(stripStress>c.material.allowableComparisonMPa||plateDeflection>c.outfalls.maximumPlateDeflectionMm?['PLANT_TANK/closed-body-hydrostatic-plate-comparison-fails']:[]),
   'PLANT_TANK/actual-open-fixture-reservoir-air-gaps-and-riser-joins-still-required','PLANT_TANK/actual-service-port-stand-and-D2-renewal-transform-required','PLANT_TANK/source-ground-and-raised-house-profile-force-proof-not-adopted','PLANT_TANK/pressure-jet-wave-thermal-material-seams-and-real-receivers-unqualified']
 return{schema:'had-current-Plant-tanked-walk/1',id:c.id,source:{caseDigest:sha256SemanticFingerprint({choice:c,source:p.resolvedInput,vessel:v,mat:i.mat,aperture:i.maximumSourceApertureMm}),legacyFixtureUsedAsExplicitGeometryInput:true,nativeForceOrPositiveReceiptAcceptanceTransferred:false,sourceColdMinimumDensityKgM3:inletColdSourceMinimumDensityKgM3,sourceColdMaximumAbsoluteBar:p.resolvedInput.sourceMaximumAbsoluteBar,sourceMaximumApertureMm:i.maximumSourceApertureMm,sourceMaximumDischargeLmin:exactQ},choice:c,
  levels:{houseFflMm:g.ffl,legacyFinishMm:g.finish,legacyFinishActuallyReplacedByProposedGrating:true,walkingMm:walk,upstandCrestMm:crest,maximumBulkWaterMm:maximum,sourcePoolMm:initial,panSurfaceMm:pan.surfaceMm},
  panGeometry:{cells:pan.cells,vertices:pan.vertices,upstandFaces:upstands,outletMouthsMm:pan.outletMouthsMm,metalMm:c.outfalls.metalMm,material:c.material,developedSurfaceAndReturnsM2:developed,referenceSteelSkinKg:developed*c.outfalls.metalMm/1000*c.material.densityKgM3},
  outfalls:{bodies:outfalls.map(o=>({id:o.id,clearCornersMm:o.clearCornersMm})),profiles,maximumHydrostaticMPa:maxPressureMPa,simpleFullWidthPlateStressMPa:stripStress,simpleFullWidthPlateDeflectionMm:plateDeflection,hydrostaticPlateNecessary:stripStress<=c.material.allowableComparisonMPa&&plateDeflection<=c.outfalls.maximumPlateDeflectionMm,roofAirReserveDoesNotBoundRupturePool:true,storageCreditL:0,actualTransientJetsAirAndSupportQualified:false},
  walking,inventory:{vesselInnerAndPortsGeometryL:vesselGeometry,vesselMaximumDesignL:vesselUpper,expansionMaximumWaterL:expansionUpper,network,normalHotAndReturnNetworkDesignUpperL:network.rows.filter(r=>r.duty==='hot'||r.duty==='hot-return').reduce((n,r)=>n+r.pipeOuterWaterUpperL+r.fullFittingBoxUpperL+r.completeDeviceOuterUpperL,0),riserRows,riserRoutingDesignUpperL:riserUpper,riserActualFinalPathsJoined:false,feedRows,fullSourceAndDrainValveBodiesUpperL:2*pressureValveOuter,wholePlantFeedAndDrainUpperL:feedUpper,fullInstantPressureNetworkDesignReleaseL:release,primaryBufferSeparateHydraulicEventNotAdded:true,fixtureReservoirBackfeedExcluded:false},
  containment:{event:'Late source-fed equilibrium plus instantaneous full vessel and communicating bounded pressure-network water; zero discharge-during-instantaneous-release and zero duct-storage credit. Continuing mains during air clearance requires a separate transient comparison.',grossIncrementalRoomL:gross,actualSteelAndSealedEnvelopeDisplacementUpperL:walking.solidsIncrementUpperL,availableIncrementalRoomLowerL:net,fullReleaseDesignL:release,reserveL:reserve,actualOutflowAirAndContinuingMainsTransientAccepted:false,necessaryClosedPressureNetworkVolumeScreen:reserve>=0&&profiles.every(r=>r.necessaryFreeSourceProfile)&&vesselGeometry<=vesselUpper,wholeInstallationCatastrophicApproval:false},
  fittedFrame:actualFrame,serviceGeometry:bodyRawBase,sourceRetirementRequiredAndPresent:sourceRetired,independentSourceHouseIsolationRequiresBothUandP:true,installedAcceptance:false,diagnostics}
}
