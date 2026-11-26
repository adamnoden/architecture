/** Shared owning source-geometry adapter for Utility proofs. It executes only
 * existing pure geometric readers/host metadata, never a native force case.
 * The historical receipt contributes labelled geometric context; its authority
 * and global current-source audit are not promoted by this adapter. */
import {readFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {inletRoomPocket} from './inlet-room-pocket.js'
import {inletEntrySideCuts} from './inlet-indoor-cuts.js'
import {inletUtilityRoute,type UtilityRouteChoice} from './inlet-utility-route.js'
import {inletUtilityColdService} from './inlet-utility-service.js'
import {readInletCornerContext,utilityCornerBoundary,runUtilityCornerHost} from './inlet-utility-corner.js'
import {utilityRetainedHotGeometry} from '../../../project/had/studies/incoming-water-terminal.mjs'
import type {IndoorRoutesInput} from './inlet-indoor-routes.js'
import type {UtilityRearTreeContext} from './inlet-utility-rear-tree.js'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
/** Exact same raised-floor recipe and local pocket as the current water
 * geometry. This carries geometry only; it does not adopt its ground/native
 * force case or remove the raised-house profile integration gate. */
export function deriveUtilityCandidateFloorPocket(i:{
 choice:unknown;roomPlanMm:readonly number[];planExclusionsMm:NonNullable<Parameters<typeof inletRoomPocket>[0]['planExclusionsMm']>;
 grid:Parameters<typeof inletRoomPocket>[0]['grid'];sourceGroundLayers:unknown;defaults:any;mineralSource:any
}){
 const c=i.choice as {schema:string;groundCaseId:string;depthMm:number;isolationGapMm:number},
  layers=i.sourceGroundLayers as number[],d=i.defaults,m=i.mineralSource?.bondedMineralBase,
  recipe=d?.cases?.find((r:any)=>r.caseId===c?.groundCaseId),common=d?.commonSettings,
  positive=(a:unknown):a is number[]=>Array.isArray(a)&&a.length>0&&a.every(n=>Number.isFinite(n)&&n>0)
 if(c?.schema!=='had-utility-floor-pocket-choice/1'||c.groundCaseId!==d?.recommendedCaseId||!recipe||!Number.isFinite(recipe.courseBottomMm)
  ||!positive(layers)||layers.length!==4||!positive(m?.beds)||!positive(m?.courses)||!Number.isFinite(common?.serviceZoneMm)||common.serviceZoneMm<=0
  ||![c.depthMm,c.isolationGapMm,common.rcDensityKNm3,common.mineralDensityBudgetKNm3].every(Number.isFinite))
  throw Error('Actual source-derived Utility candidate floor recipe required')
 if(layers.join(',')!=='15,65,100,200'||i.grid.girders['court-S']?.z.join(',')!=='-630,-180')throw Error('Unsupported source floor-layer or cold-grid domain; re-coordinate the actual ground producer')
 const bottom=recipe.courseBottomMm,courseHeight=[...m.beds,...m.courses].reduce((a:number,b:number)=>a+b,0),
  dryBottom=bottom+courseHeight,dryTop=dryBottom+layers[3],glassTop=dryTop+layers[2],finishBottom=glassTop+common.serviceZoneMm,ffl=finishBottom+layers[0],
  levels={mineralCourse:[bottom,dryBottom]as const,dryRC:[dryBottom,dryTop]as const,glass:[dryTop,glassTop]as const,accessibleDistribution:[glassTop,finishBottom]as const,finish:[finishBottom,ffl]as const,ffl,coldGridTop:i.grid.girders['court-S']?.z[1]}
 if(ffl!==530)throw Error('Utility occupied FFL530 no longer matches the source-derived floor; re-coordinate the actual room and services')
 const pocket=inletRoomPocket({levels,roomPlanMm:i.roomPlanMm,planExclusionsMm:i.planExclusionsMm,depthMm:c.depthMm,isolationGapMm:c.isolationGapMm,grid:i.grid,rcDensityKNm3:common.rcDensityKNm3,mineralDensityKNm3:common.mineralDensityBudgetKNm3,roomId:'utility'})
 if(!pocket.local)throw Error('A real source-bound local Utility RC pocket is required')
 return{schema:'had-utility-candidate-floor-pocket-context/1' as const,bindingDigest:sha256SemanticFingerprint(i),pocket,
  occupiedFflAbsoluteMm:ffl,datum:'Absolute raised-floor candidate datum; subtract this same FFL only for occupied-local geometry.',
  currentSavedDocumentAdmitted:false as const,nativeFloorOrForceApprovalTransferred:false as const,actualRaisedHouseProfileAndReceiverCapacityAccepted:false as const}
}
export function readUtilityCurrentGeometrySource(){
 const sourceObjectDigests:Record<string,string>={}
 const read=(p:string)=>{const v=JSON.parse(readFileSync(new URL('../../../'+p,import.meta.url),'utf8'));sourceObjectDigests[p]=sha256SemanticFingerprint(v);return v}
const receipt=read('project/had/studies/inlet-source-envelope.results.json'),old=receipt.joinedDirection.room,rawRoutes=old.indoorRoutes,
 water=read('project/had/studies/water-replan.json').model,services=read('project/had/studies/current-house-services.json'),
 source=read('project/had/studies/south-inlet-under-sill.json'),saved=read('project/ccr/studies/working-house-comparison.json'),
 choice=read('project/had/studies/inlet-utility-compact-route.json') as UtilityRouteChoice,
 stage=saved.stages.distributedFloor,context=readInletCornerContext(stage.cornerWidthsMm.SE,sha256SemanticFingerprint(stage)),
 boundary=utilityCornerBoundary(context,old.wetUtilityPlanMm,water.internalArchControls.actualRadialFinish),
 host=runUtilityCornerHost(context,water.internalArchControls.actualRadialFinish,source.branches.find((v:any)=>v.id==='utility').coordinates.at(-1)),
 station={bankXMm:choice.station!.axisMm[0],bankYMm:choice.station!.axisMm[1],utilityAxisZMm:choice.station!.axisMm[2],plantAxisZMm:receipt.settings.indoorPlantAxisZMm,
  operatorXYZMm:choice.station!.ordinaryShoulderMm,tailOffsetMm:330},body=station.operatorXYZMm,
 plantWall=water.groundWalls.find((v:any)=>v.id==='plant-intermediate-arch'),
 frameCovers=rawRoutes.checkedObstacles.filter((v:any)=>v.id.includes('shield-connection')).map((v:any)=>v.boxMm as B),
 retainedFurniture=Object.fromEntries(Object.entries(old.retainedFurniture).filter(([id])=>id!=='service-utility-valveBay').map(([id,p])=>[id,id==='service-utility-sink'?host.revisedUtility.sink:id==='service-utility-rearServiceChase'?host.revisedUtility.rearServiceChase:p])),
 cuts=inletEntrySideCuts({roomPlanMm:old.wetUtilityPlanMm,portalXMm:old.indoorCuts.rawPortalXMm,wallFacesYMm:old.northWallFacesYMm,
  jambFinishMm:water.internalArchControls.actualRadialFinish,shieldPlaneXMm:old.electricalScreen.barrierPlaneMm.x,
  washerFirstRestMm:services.utility.washerFirstRest,maintenancePlanMm:old.indoorCuts.sourceMaintenancePlanMm,maintenanceTopMm:3100,
  frameCoversMm:frameCovers,...station,maintenanceShiftXMm:receipt.settings.indoorMaintenanceShiftXMm,maintenanceShiftYMm:receipt.settings.indoorMaintenanceShiftYMm,
  wheelInboardMm:receipt.settings.indoorWheelInboardMm,utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,
  maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,groundFflMm:530,
  doorHingeNorthOfWallMm:receipt.settings.indoorDoorHingeNorthOfWallMm,plantWall:{facesYMm:plantWall.finishedFaces,openingXMm:plantWall.holes[0]},
  retainedFurniture:retainedFurniture as Record<string,readonly[number,number,number,number]>,protectedDoorOpenLeafMm:water.plantReferenceDoor.fullyOpenEastLeaf}),
 input:IndoorRoutesInput={roomPlanMm:old.wetUtilityPlanMm,bankMm:[station.bankXMm,station.bankYMm],utilityAxisZMm:station.utilityAxisZMm,plantAxisZMm:station.plantAxisZMm,
  tailOffsetMm:station.tailOffsetMm,utilityReturnXMm:9820,westernReturnXMm:9700,utilitySourcePathMm:source.branches.find((v:any)=>v.id==='utility').coordinates,
  plantSourcePathMm:source.branches.find((v:any)=>v.id==='plant').coordinates,plantTransferMm:receipt.joinedDirection.transfer.pathMm,groundFflMm:530,ceilingMm:3100,
  utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,
  networkAllowancesBar:[receipt.settings.utilityNetworkLossBar,receipt.settings.plantNetworkLossBar],comparison:rawRoutes.authoredComparison,
  obstacles:[...rawRoutes.checkedObstacles.filter((o:any)=>!o.id.startsWith('actual-native-SE-')).map((o:any)=>o.id==='ordinary-operator-body-and-approach'?{id:o.id,boxMm:[body[0]-300,Math.min(...cuts.ordinaryOperator.approachMm.map(p=>p[1]))-300,0,600,Math.abs(cuts.ordinaryOperator.approachMm[1][1]-cuts.ordinaryOperator.approachMm[0][1])+600,2000] as B}:o.id==='retained-sink-conservative2000-high-envelope'?{id:o.id,boxMm:[host.revisedUtility.sink[0],host.revisedUtility.sink[1],0,host.revisedUtility.sink[2],host.revisedUtility.sink[3],2000] as B}:o),
   ...boundary.finishedCoreRectanglesXYMm.map((r,k)=>({id:'actual-native-SE-finished-return/'+k,boxMm:[r[0],r[1],0,r[2]-r[0],r[3]-r[1],3100] as B}))]},
 result=inletUtilityRoute({choice,input,cuts,retained:rawRoutes.retainedServiceComparison.services})

const service=inletUtilityColdService({route:result,choice:choice.coldService,roomMm:old.wetUtilityPlanMm,washerReservationMm:services.utility.washerReservation,washerBodyMm:services.utility.washer,washerHeightMm:read('project/ias/studies/utility-first-release.json').native.height,maximumGaugeBar:input.maximumGaugeBar,input,retained:rawRoutes.retainedServiceComparison.services,host})

 const candidateFloorPocket=deriveUtilityCandidateFloorPocket({
  choice:(choice as unknown as{candidateFloorPocket:unknown}).candidateFloorPocket,roomPlanMm:old.wetUtilityPlanMm,planExclusionsMm:boundary.actualPanExclusionsXYMm,
  grid:read('project/str/studies/current-house-grid.json'),sourceGroundLayers:water.northNormalRoute.floorJoin.layers,
  defaults:read('project/str/studies/dry-side-ground-section.json'),mineralSource:read('project/mat/studies/conventional-ground-junction.json')
 })
 const prefabHead=(choice.coldDistribution as {prefabSinkHead:{topSolidPlansMm:readonly(readonly[number,number,number,number])[];topZMm:readonly[number,number]}}).prefabSinkHead
 const actualHot=utilityRetainedHotGeometry(read('project/had/studies/incoming-water.json').utility.vertices.hot),
  bindingDigest=sha256SemanticFingerprint({sourceObjectDigests,nativeContext:context,boundary}),
  frame=Object.entries(host.geometry.frame).map(([id,v])=>({id:'IAS/frame/'+id,boxMm:v as B,presence:(id==='temporary carry bar'?'carry-bar-after-park':id==='EW rail at y1350 / z135'?'front-lower-rail':'always') as 'always'|'carry-bar-after-park'|'front-lower-rail'})),
  excluded=(id:string)=>id.startsWith('ordinary-operator')||id.startsWith('wet-door-complete-moving')||['occupied-washer-rest','complete-shifted-utility-maintenance','retained-sink-conservative2000-high-envelope','retained-washer'].includes(id),
  rearTreeContext:UtilityRearTreeContext={
   bindingDigest,maximumGaugeBar:input.maximumGaugeBar,settingEachMm:10,jacketRadialMm:26,floorMm:0,ceilingMm:input.ceilingMm,
   mainOnlyInventoryUpperLitres:service.inventory.isolatedBranchConservativeCeilingL,
   obstacles:[...frame,...prefabHead.topSolidPlansMm.map((p,k)=>({id:'current-prefab-board/'+k,boxMm:[p[0],p[1],prefabHead.topZMm[0],p[2],p[3],prefabHead.topZMm[1]-prefabHead.topZMm[0]] as B,presence:'head-before-strip' as const})),...input.obstacles.filter(o=>!excluded(o.id)).map(o=>({...o,presence:'always' as const})),
    ...rawRoutes.retainedServiceComparison.services.boxes.filter((o:{id:string})=>!excluded(o.id)&&!o.id.startsWith('complete620mm-head-sweep/')).map((o:{id:string;boxMm:B})=>({...o,presence:'always' as const})),
    {id:'source-washer-home',boxMm:[services.utility.washer[0],services.utility.washer[1],0,services.utility.washer[2],services.utility.washer[3],read('project/ias/studies/utility-first-release.json').native.height],presence:'always'}],
   retainedPaths:[...rawRoutes.retainedServiceComparison.services.paths.filter((p:{id:string})=>!p.id.toLowerCase().includes('hot')),
    {id:'retained-H0-hot-terminal',pointsMm:actualHot.terminal,radiusWithSupportsMm:25},
    {id:'retained-H0-hot-backbone',pointsMm:actualHot.backbone,radiusWithSupportsMm:37}],
   evidence:{lodgeUAndMainZero:false,sourceDrainVerified:false,washerClosedHoseOnPositiveRest:false,headHotH0AndColdZeroHeadRemoved:false,lowPocketCapturedAndCapped:false,matchedUnionReleaseVerified:false,frontRailRemoved:false,carryBarTimingVerified:false,independentLoadedCaptureAndParkRestVerified:false},
   support:{normalWheelCoupleNm:10,coldMaintenanceToolCoupleNm:60,handlingDynamicFactor:1.5,declaredSlideTravelMm:null,actualReactionLawImplemented:false}
  }
 return{scope:'Shared current Utility source-geometry proof adapter; no saved-document or native force admission.',currentSavedDocumentAdmitted:false,physicalInstallationAdmitted:false,sourceObjectDigests,bindingDigest,choice,water,services,rawSource:source,nativeContext:context,boundary,host,station,cuts,input,route:result,service,retained:rawRoutes.retainedServiceComparison.services,actualHot,rearTreeContext,candidateFloorPocket,retiredHistoricalEnvelopeIds:rawRoutes.retainedServiceComparison.services.boxes.filter((o:{id:string})=>o.id.startsWith('complete620mm-head-sweep/')).map((o:{id:string})=>o.id),groundFflMm:530,verticalContract:'Local occupied FFL coordinates; no3170-minus530 inferred ceiling.'}
}
