/** Owning geometric/demand observer for individually renewed dry-frame members.
 * Proposed independent water receivers are explicit design geometry, not selected
 * anchors, installed clips or a replacement for current native structural proof. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import type {readUtilityCurrentGeometrySource} from './inlet-utility-proof-source.js'
import type {UtilityRearTreeChoice} from './inlet-utility-rear-tree.js'
import type {inletUtilityRearTree} from './inlet-utility-rear-tree.js'
import type {UtilityHotHeadResult} from '../../../project/had/studies/utility-hot-head.mjs'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type Source=ReturnType<typeof readUtilityCurrentGeometrySource>
type Wet={choice:UtilityRearTreeChoice;cold:ReturnType<typeof inletUtilityRearTree>;hot:UtilityHotHeadResult}
export type UtilityMemberToolTask={id:string;shoulderMm:P;gripMm:P;toolSegmentMm:readonly[P,P];toolRadiusMm:number;intentionalTargetIds:readonly string[]}
const gap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)}
/** Geometry and member properties below are new DESIGN REQUIREMENTS. Their
 * actual delivered section/weld/receiver/bolt resistances remain unqualified. */
export const utilityMemberDesignRequirements={
 elasticModulusMPa:193000,referenceAllowableMPa:200/1.5,
 maximumCompleteWaterAssemblyKg:20,gravityDynamicFactor:1.5,
 normalWheelNm:10,coldZeroToolNm:60,comparisonHorizontalMaintenanceN:200,
 valveReceiverSectionMm:50,valveReceiverMinimumIMM4:190000,valveReceiverMinimumAreaMM2:500,
 headerReceiverSectionMm:40,headerReceiverMinimumIMM4:90000,headerReceiverMinimumAreaMM2:400,
 upperRailMinimumIMM4:70000,upperRailDepthMm:40,upperRailComparisonPointLoadN:2000,
 declaredMinimumSlideTravelEachWayMm:5,temperatureExcursionK:40,copperExpansionPerK:17e-6
} as const
export function inletUtilityMemberRenewal(i:{source:Source;wet:Wet;tools?:readonly UtilityMemberToolTask[]}){
 const {source,wet}=i,d=wet.choice.coldDistribution,r=utilityMemberDesignRequirements,two=2*source.rearTreeContext.settingEachMm
 if(two!==20||!source.boundary.finishedCoreRectanglesXYMm.length)throw Error('Actual SE boundary and two10mm settings required')
 const rearFaceAt=(x:number,half:number)=>Math.max(source.input.roomPlanMm[1],...source.boundary.finishedCoreRectanglesXYMm
  .filter(q=>q[0]<x+half&&q[2]>x-half&&q[1]<=source.input.roomPlanMm[1]+1e-7&&q[3]>source.input.roomPlanMm[1])
  .map(q=>q[3]))
 const frame=Object.entries(source.host.geometry.frame).filter(([id])=>id!=='temporary carry bar').map(([id,b])=>({id:'IAS/frame/'+id,boxMm:b as B})),
 legs=frame.filter(v=>v.id.includes('/leg ')),rails=frame.filter(v=>v.id.includes(' rail ')),
 xs=legs.map(v=>v.boxMm[0]),ys=legs.map(v=>v.boxMm[1]),legWidth=legs[0]?.boxMm[3]
 if(legs.length!==4||rails.length!==8||legWidth!==40)throw Error('Actual four40mm legs and eight existing rails required')
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),
  members=rails.map(q=>{const b=q.boxMm,axis=b[3]>b[4]?0:1,start=(axis===0?minX:minY)+40,end=axis===0?maxX:maxY,
   replacement:B=axis===0?[start,b[1],b[2],end-start,b[4],b[5]]:[b[0],start,b[2],b[3],end-start,b[5]]
   return{id:q.id,drawnBoxMm:b,boltedCutBoxMm:replacement,cutLengthMm:end-start,drawnCentreToCentreLengthMm:b[axis+3],boltsPerEndRequired:2,actualBoltedJointSelected:false}
  }),
  washer=d.washer.stop.axisMm,sink=d.sink.stop.axisMm,
  // The header receiver fits BETWEEN the actual22/15 descending branches.
  headX=(d.washerTeeMm[0]+d.sinkTeeMm[0])/2+2,
  beams=[
   {id:'independent-water/header',axisX:headX,endY:d.commonPathMm[0][1],z:830,section:r.headerReceiverSectionMm,I:r.headerReceiverMinimumIMM4,A:r.headerReceiverMinimumAreaMM2,mate:['common/tube/1'],loadBoreMm:20.3},
   {id:'independent-water/washer',axisX:washer[0],endY:washer[1],z:620,section:r.valveReceiverSectionMm,I:r.valveReceiverMinimumIMM4,A:r.valveReceiverMinimumAreaMM2,mate:[] as string[],loadBoreMm:20.3},
   {id:'independent-water/sink',axisX:sink[0]+80,endY:sink[1],z:450,section:r.valveReceiverSectionMm,I:r.valveReceiverMinimumIMM4,A:r.valveReceiverMinimumAreaMM2,mate:['sink/stop-body'],loadBoreMm:13.7}
  ].map(v=>{const rearFaceYMm=rearFaceAt(v.axisX,v.section/2)
   if(rearFaceYMm>=v.endY)throw Error('Receiver is inside actual local finished return')
   const intentionalReceiverWallIds=source.boundary.finishedCoreRectanglesXYMm.flatMap((q,k)=>q[0]<v.axisX+v.section/2&&q[2]>v.axisX-v.section/2&&Math.abs(q[3]-rearFaceYMm)<1e-7?['actual-native-SE-finished-return/'+k]:[])
   return{...v,rearFaceYMm,intentionalReceiverWallIds,boxMm:[v.axisX-v.section/2,rearFaceYMm,v.z-v.section/2,v.section,v.endY-rearFaceYMm,v.section] as B}}),
  checks:{id:string;reserveMm:number}[]=[],add=(id:string,reserveMm:number)=>checks.push({id,reserveMm}),
  cold=wet.cold.geometry.parts.filter(p=>!p.cap),hot=wet.hot.normalPermanentEnvelopes
 for(const b of beams){
  for(const p of cold)if(!b.mate.includes(p.id))add(b.id+'/'+p.id,gap(b.boxMm,p.wrapped)-two)
  for(const q of frame)add(b.id+'/'+q.id,gap(b.boxMm,q.boxMm)-two)
  for(const q of source.rearTreeContext.obstacles)if(!q.id.startsWith('IAS/frame/')&&!q.id.includes('rear-finished-face')&&!b.intentionalReceiverWallIds.includes(q.id))add(b.id+'/'+q.id,gap(b.boxMm,q.boxMm)-two)
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)add(b.id+'/'+q.id+'/'+k,exactSegmentBoxDistance(q.pointsMm[k-1],q.pointsMm[k],b.boxMm)-q.radiusWithSupportsMm-two)
  for(const q of hot)add(b.id+'/'+q.id,gap(b.boxMm,q.boxMm as B)-two)
 }
 const gravity=r.maximumCompleteWaterAssemblyKg*9.81*r.gravityDynamicFactor,
  demands=beams.map(b=>{const L=b.endY-b.rearFaceYMm,pressure=source.rearTreeContext.maximumGaugeBar*.1*Math.PI*b.loadBoreMm**2/4,
   // Deliberately put the complete20kg+full end thrust on EACH receiver.
   normalForce=gravity+pressure,normalMoment=normalForce*L+r.normalWheelNm*1000,coldZeroMoment=gravity*L+r.coldZeroToolNm*1000
   return{id:b.id,lengthMm:L,pressureEndThrustN:pressure,gravityUpperN:gravity,normalMomentNmm:normalMoment,coldZeroMomentNmm:coldZeroMoment,
    normalExtremeFibreMPa:normalMoment*b.section/2/b.I+pressure/b.A,coldZeroExtremeFibreMPa:coldZeroMoment*b.section/2/b.I,
    normalDeflectionMm:normalForce*L**3/(3*r.elasticModulusMPa*b.I),
    requiredAnchorForceN:normalForce,requiredAnchorMomentNmm:Math.max(normalMoment,coldZeroMoment),
    actualWallReceiverAnchorsWeldClipAndRotationResistanceQualified:false}
  }),
  spanX=maxX-minX,spanY=maxY-minY,tools=i.tools??[],toolChecks:{id:string;reserveMm:number}[]=[]
 for(const t of tools){
  toolChecks.push({id:t.id+'/hand-reach',reserveMm:600-Math.hypot(...t.gripMm.map((v,k)=>v-t.shoulderMm[k]))})
  for(const q of [...frame,...source.rearTreeContext.obstacles])if(!t.intentionalTargetIds.includes(q.id)){
   toolChecks.push({id:t.id+'/arm/'+q.id,reserveMm:exactSegmentBoxDistance(t.shoulderMm,t.gripMm,q.boxMm)-40-two})
   toolChecks.push({id:t.id+'/tool/'+q.id,reserveMm:exactSegmentBoxDistance(...t.toolSegmentMm,q.boxMm)-t.toolRadiusMm-two})
  }
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++){
   toolChecks.push({id:t.id+'/arm/'+q.id+'/'+k,reserveMm:segmentDistance(t.shoulderMm,t.gripMm,q.pointsMm[k-1],q.pointsMm[k])-40-q.radiusWithSupportsMm-two})
   toolChecks.push({id:t.id+'/tool/'+q.id+'/'+k,reserveMm:segmentDistance(...t.toolSegmentMm,q.pointsMm[k-1],q.pointsMm[k])-t.toolRadiusMm-q.radiusWithSupportsMm-two})
  }
 }
 const longestUpper=Math.max(...members.filter(v=>v.drawnBoxMm[2]===830).map(v=>v.cutLengthMm)),
  railMoment=r.upperRailComparisonPointLoadN*longestUpper/4,
  headerFree=d.commonPathMm.at(-1)![0]-d.commonPathMm[0][0]
 return{schema:'had-utility-independent-member-observer/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,choice:wet.choice,boundary:source.boundary,requirements:r,tools}),
  currentSavedDocumentAdmitted:false,requirements:r,wholeAssembledFrameWithdrawalRequired:false,coldTreeOrSourceUnionOpenedForDryMemberRenewal:false,
  members,ordinaryCapture:inletUtilityOrdinaryCapture({source,wet}),drawnRailEndsNeedActualBoltedJointRedesign:true,normalIndependentWaterBeamCandidate:{beams,checks,failures:checks.filter(q=>q.reserveMm< -1e-7),demands,
   fullClampForkSlidesAndWallAnchorGeometryIncluded:false,actualWallElevationAndMaterialRead:false,permanentWallSteelExcludedFromMoving20kgTree:true,
   steelSectionDemandWithinAuthoredComparison:demands.every(v=>Math.max(v.normalExtremeFibreMPa,v.coldZeroExtremeFibreMPa)<=r.referenceAllowableMPa)},
  railComparison:{longestClearSpanMm:longestUpper,pointLoadN:r.upperRailComparisonPointLoadN,extremeFibreMPa:railMoment*r.upperRailDepthMm/2/r.upperRailMinimumIMM4,
   deflectionMm:r.upperRailComparisonPointLoadN*longestUpper**3/(48*r.elasticModulusMPa*r.upperRailMinimumIMM4),sectionJointAndLoadPathQualified:false},
  stability:{deadweightRestoringCreditN:0,horizontalComparisonN:r.comparisonHorizontalMaintenanceN,heightMm:870,
   requiredPositivePairHoldDownN:{eastWest:r.comparisonHorizontalMaintenanceN*870/spanX,northSouth:r.comparisonHorizontalMaintenanceN*870/spanY},
   twoOrthogonalTemporaryBracesRequired:true,actualBraceAnchorAndRemainingMemberProofAccepted:false},
  thermal:{freeHeaderXmm:headerFree*r.copperExpansionPerK*r.temperatureExcursionK,declaredSlideTravelEachWayMm:r.declaredMinimumSlideTravelEachWayMm,
   slidePositiveGravityAndAntiRotationRequired:true,frictionCredited:false,actualBranchedTubeReactionLawImplemented:false,
   seizedGuideAndWhollyRestrainedStraightAdverseCaseRetained:true},
  tools:{tasks:tools,checks:toolChecks,failures:toolChecks.filter(v=>v.reserveMm< -1e-7),requiredRailEndInterfaces:members.length*2,
   authoredAndProvedRailEndInterfaces:0,actualSocketCounterholdBodyAndWithdrawalProofAccepted:false},
  head:{fullCapturedHeadOrIndividualBowlPillarAndBoardRemovalProved:false,headRemovedBeforeAnyLoadedFrameReleaseRequired:false,positiveHeadCaptureBeforeFirstRailReleaseRequired:true},
  actualIndependentWaterSupportAccepted:false,ordinaryMemberRenewalAccepted:false,
  diagnostics:['UTILITY_MEMBER/actual-bolted-end-joints-tools-and-withdrawal-not-yet-authored','UTILITY_MEMBER/full-head-capture-and-positive-rest-not-proved',
   'UTILITY_MEMBER/permanent-water-clamp-slide-fork-and-wall-anchorage-incomplete','UTILITY_MEMBER/temporary-frame-bracing-and-positive-hold-down-required',
   ...(checks.some(v=>v.reserveMm<0)?['UTILITY_MEMBER/proposed-independent-beam-geometry-conflicts']:[])]}
}

type CaptureControls={
 schema:string;postsXYMm:readonly(readonly[number,number])[];topAxisZMm:number;memberCrossMm:number;soleCrossMm:number;soleThicknessMm:number;headTrackYMm:readonly number[];liftingEyesMm:readonly P[];
 maximumCapturedWetHeadKg:number;headCGPlanDesignMm:readonly[number,number,number,number];maximumPillarAndSpoutCrossMm:number;maximumSpoutCrossMm:number;firstLiftMm:number;southClearanceMm:number;rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift:boolean;jointJacketsStrippedLengthMm:number;maximumHandleCrossMm:number;maximumHeadZMm:number;liftMm:number;westTransferMm:number;minimumHoistClosedHeightMm:number;
 restPlanMm:readonly[number,number,number,number];restTopMm:number;restTopDepthMm:number;restPostsXYMm:readonly(readonly[number,number])[];restPostCrossMm:number;
 maximumSectionAreaMm2:number;minimumSectionAreaMm2:number;minimumSectionIMm4:number;maximumSteelDensityKgM3:number;minimumSteelDensityKgM3:number;normalWorkingFloorXYMm:readonly[number,number];normalWorkingShoulderMm:P;externalHorizontalComparisonN:number;frictionResistanceCredited:false;actualProductsFloorHorizontalReactionAndPhysicalHandlingAccepted:false
}
type JointControls={schema:string;memberEndGapMm:number;seatTravelsWithCapturedRail:boolean;gravitySeatLengthMm:number;gravitySeatWidthMm:number;gravitySeatThicknessMm:number;receiverWidthMm:number;receiverThicknessMm:number;boltEdgeMm:number;boltDiameterMm:number;boltPitchMm:number;upperBoltZMm:{EW:readonly number[];NS:readonly number[]};lowerBoltZMm:{EW:readonly number[];NS:readonly number[]};northProjectionMm:{EW:number;NS:number};actualReceiverWeldBoltMaterialAndLocalHSSProofAccepted:false}
/** Positive vertical capture and finite body/member geometry. Horizontal floor
 * reaction is deliberately a separate unsatisfied action without friction or a
 * real locating receiver. A geometric gravity path cannot approve that action. */
export function inletUtilityOrdinaryCapture(i:{source:Source;wet:Wet}){
 const {source,wet}=i,d=wet.choice.coldDistribution,
  f=(d as unknown as{frameRenewal:{headCapture:CaptureControls;memberJointDesign:JointControls}}).frameRenewal,c=f?.headCapture,j=f?.memberJointDesign,two=2*source.rearTreeContext.settingEachMm
 if(c?.schema!=='had-utility-floor-head-capture/1'||j?.schema!=='had-utility-bolted-member-end/1'||c.postsXYMm.length!==4||c.liftingEyesMm.length!==4||c.restPostsXYMm.length!==4||two!==20
  ||c.frictionResistanceCredited!==false||c.actualProductsFloorHorizontalReactionAndPhysicalHandlingAccepted!==false||j.actualReceiverWeldBoltMaterialAndLocalHSSProofAccepted!==false
  ||c.memberCrossMm<50||c.maximumCapturedWetHeadKg<=0||c.liftMm<=0||c.westTransferMm<=0||c.minimumSectionIMm4<=0||j.boltPitchMm<3*j.boltDiameterMm)throw Error('Actual head capture and bolted end design controls required')
 const frame=Object.entries(source.host.geometry.frame).filter(([id])=>id!=='temporary carry bar').map(([id,b])=>({id:'IAS/frame/'+id,boxMm:b as B})),
  legs=frame.filter(q=>q.id.includes('/leg ')),rails=frame.filter(q=>q.id.includes(' rail ')),
  px=c.postsXYMm.map(p=>p[0]),py=c.postsXYMm.map(p=>p[1]),x0=Math.min(...px),x1=Math.max(...px),y0=Math.min(...py),y1=Math.max(...py),
  hardware:{id:string;boxMm:B;mates:readonly string[]}[]=[],put=(id:string,b:B,mates:readonly string[]=[])=>hardware.push({id,boxMm:b,mates}),
  centred=(p:P,dim:P):B=>[p[0]-dim[0]/2,p[1]-dim[1]/2,p[2]-dim[2]/2,...dim],
  sweep=(b:B,a:P,z:P):B=>[b[0]+Math.min(a[0],z[0]),b[1]+Math.min(a[1],z[1]),b[2]+Math.min(a[2],z[2]),b[3]+Math.abs(a[0]-z[0]),b[4]+Math.abs(a[1]-z[1]),b[5]+Math.abs(a[2]-z[2])],
  s=c.memberCrossMm,z=c.topAxisZMm
 for(const [k,p]of c.postsXYMm.entries()){put('capture/leg/'+k,[p[0]-s/2,p[1]-s/2,c.soleThicknessMm,s,s,z-c.soleThicknessMm]);put('capture/sole/'+k,[p[0]-c.soleCrossMm/2,p[1]-c.soleCrossMm/2,0,c.soleCrossMm,c.soleCrossMm,c.soleThicknessMm])}
 for(const y of[y0,y1,...c.headTrackYMm])put('capture/EW/'+y,[x0,y-s/2,z-s/2,x1-x0,s,s])
 for(const x of[x0,x1])put('capture/NS/'+x,[x-s/2,y0,z-s/2,s,y1-y0,s])
 const rp=c.restPlanMm,rt=c.restTopMm
 put('rest/top-envelope',[rp[0],rp[1],rt-c.restTopDepthMm,rp[2],rp[3],c.restTopDepthMm])
 for(const [k,p]of c.restPostsXYMm.entries())put('rest/leg/'+k,[p[0]-c.restPostCrossMm/2,p[1]-c.restPostCrossMm/2,0,c.restPostCrossMm,c.restPostCrossMm,rt-c.restTopDepthMm])
 for(const y of[...new Set(c.restPostsXYMm.map(p=>p[1]))])put('rest/EW/'+y,[Math.min(...c.restPostsXYMm.map(p=>p[0])),y-c.restPostCrossMm/2,rt-c.restTopDepthMm,c.restPlanMm[2]-20,c.restPostCrossMm,c.restTopDepthMm])
 const interfaces=rails.flatMap(q=>{
  const b=q.boxMm,EW=b[3]>b[4],axis=EW?'EW':'NS',upper=b[2]>500,axisIndex=EW?0:1,
   ends=[b[axisIndex],b[axisIndex]+b[axisIndex+3]],
   pair=upper?j.upperBoltZMm[axis]:j.lowerBoltZMm[axis]
  return ends.map((a,k)=>{
   const centre:P=EW?[a,b[1]+b[4]/2,b[2]+b[5]/2]:[b[0]+b[3]/2,a,b[2]+b[5]/2],
    leg=legs.reduce((best,v)=>Math.hypot(v.boxMm[0]+20-centre[0],v.boxMm[1]+20-centre[1])<Math.hypot(best.boxMm[0]+20-centre[0],best.boxMm[1]+20-centre[1])?v:best,legs[0]),
    lx=leg.boxMm[0]+20,ly=leg.boxMm[1]+20,faceY=ly+20+j.northProjectionMm[axis],
    seat:B=EW?[k===0?leg.boxMm[0]+40:leg.boxMm[0]-j.gravitySeatLengthMm,b[1],b[2]-j.gravitySeatThicknessMm,j.gravitySeatLengthMm,b[4],j.gravitySeatThicknessMm]:
     [b[0],k===0?leg.boxMm[1]+40:leg.boxMm[1]-j.gravitySeatLengthMm,b[2]-j.gravitySeatThicknessMm,b[3],j.gravitySeatLengthMm,j.gravitySeatThicknessMm],
    plate:B=[lx-j.receiverWidthMm/2,faceY-j.receiverThicknessMm/2,Math.min(...pair)-j.boltEdgeMm,j.receiverWidthMm,j.receiverThicknessMm,Math.max(...pair)-Math.min(...pair)+2*j.boltEdgeMm],
    id=q.id+'/end/'+k
   put(id+'/gravity-seat',seat,[q.id,leg.id]);put(id+'/receiver-plate',plate,[leg.id])
   const proposedMemberCutBoxMm:B=EW?[b[0]+20+j.memberEndGapMm,b[1],b[2],b[3]-40-2*j.memberEndGapMm,b[4],b[5]]:[b[0],b[1]+20+j.memberEndGapMm,b[2],b[3],b[4]-40-2*j.memberEndGapMm,b[5]]
   return{id,railId:q.id,legId:leg.id,axis,upper,proposedMemberCutBoxMm,sourceIASFrameStillCentrelineComparator:true,seatMm:seat,receiverPlateMm:plate,boltCentresMm:pair.map(h=>[lx,faceY,h] as P),boltAxisMm:[0,1,0] as P,boltDiameterMm:j.boltDiameterMm,seatTravelsWithCapturedRail:j.seatTravelsWithCapturedRail,requiredMemberEndGapMm:j.memberEndGapMm,
    boltsPerInterface:2,seatReferenceDemandN:2000,receiverWebAndWeldGeometryComplete:false,actualBoltToolAndJointResistanceAccepted:false}
  })
 })
 const washer=source.services.utility.washerFirstRest,
  fixed=[...source.rearTreeContext.obstacles.filter(q=>q.presence!=='carry-bar-after-park'&&q.id!=='source-washer-home'),
   {id:'capture-phase/washer-at-source-first-rest',boxMm:[washer[0],washer[1],0,washer[2],washer[3],source.rearTreeContext.obstacles.find(q=>q.id==='source-washer-home')!.boxMm[5]] as B,presence:'always' as const}],
  cold=wet.cold.geometry.parts.filter(q=>!q.cap).map(q=>({id:'cold/'+q.id,boxMm:q.wrapped})),
  hot=wet.hot.normalPermanentEnvelopes.map(q=>({id:q.id,boxMm:q.boxMm as B})),
  bowl=d.prefabSinkHead,bowlB:B=[bowl.bowlPlanMm[0],bowl.bowlPlanMm[1],bowl.bowlBottomMm,bowl.bowlPlanMm[2],bowl.bowlPlanMm[3],bowl.floodRimMm-bowl.bowlBottomMm],
  rows:{id:string;phase:string;reserveMm:number}[]=[],add=(id:string,phase:string,reserveMm:number)=>rows.push({id,phase,reserveMm}),
  compare=(id:string,b:B,phase:string,mates:readonly string[]=[])=>{
   for(const q of [...fixed,...cold,...hot])if(!mates.includes(q.id))add(id+'/'+q.id,phase,gap(b,q.boxMm)-two)
   for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)add(id+'/'+q.id+'/'+k,phase,exactSegmentBoxDistance(q.pointsMm[k-1],q.pointsMm[k],b)-q.radiusWithSupportsMm-two)
   for(const p of source.route.paths){for(const leg of p.straight)add(id+'/active-main/'+p.id+'/'+leg.index,phase,exactSegmentBoxDistance(leg.a,leg.b,b)-source.route.geometry.jacketRadiusMm-two)
    for(const corner of p.corners)if(corner.kind==='boxed-compression-elbow')add(id+'/'+corner.id,phase,gap(b,corner.boxMm)-two)
    else if(corner.arcMm)for(let k=1;k<corner.arcMm.length;k++)add(id+'/'+corner.id+'/'+k,phase,exactSegmentBoxDistance(corner.arcMm[k-1],corner.arcMm[k],b)-source.route.geometry.jacketRadiusMm-corner.arcCoverMm-two)}
  }
 for(const q of hardware){compare(q.id,q.boxMm,'temporary-and-end-hardware',q.mates);add(q.id+'/current-bowl','temporary-and-end-hardware',gap(q.boxMm,bowlB)-two);add(q.id+'/actual-room-west','temporary-and-end-hardware',q.boxMm[0]-source.input.roomPlanMm[0]-two);add(q.id+'/actual-room-east','temporary-and-end-hardware',source.input.roomPlanMm[0]+source.input.roomPlanMm[2]-q.boxMm[0]-q.boxMm[3]-two)}
 // Full new head product bounds are authored requirements, not point-only taps.
 const top=(d as unknown as{prefabSinkHead:{topPlanMm:readonly[number,number,number,number];topZMm:readonly[number,number]}}).prefabSinkHead,
  hp=top.topPlanMm,headParts=[{id:'head/board',boxMm:[hp[0],hp[1],top.topZMm[0],hp[2],hp[3],top.topZMm[1]-top.topZMm[0]] as B},{id:'head/bowl',boxMm:bowlB},
   ...[bowl.coldPortMm,bowl.hotPortMm].map((p,k)=>({id:'head/pillar/'+k,boxMm:[p[0]-c.maximumPillarAndSpoutCrossMm/2,p[1]-c.maximumPillarAndSpoutCrossMm/2,p[2],c.maximumPillarAndSpoutCrossMm,c.maximumPillarAndSpoutCrossMm,c.maximumHeadZMm-p[2]] as B})),
   ...bowl.pillarHandleMm.map((p,k)=>({id:'head/handle/'+k,boxMm:centred(p,[c.maximumHandleCrossMm,c.maximumHandleCrossMm,c.maximumHandleCrossMm])})),
   ...bowl.spoutOutletsMm.map((p,k)=>({id:'head/spout/'+k,boxMm:[p[0]-c.maximumSpoutCrossMm/2,p[1]-c.maximumSpoutCrossMm/2,p[2],c.maximumSpoutCrossMm,bowl.coldPortMm[1]-p[1]+c.maximumSpoutCrossMm,c.maximumSpoutCrossMm] as B}))
  ],
  frameMates=frame.filter(q=>q.boxMm[2]+q.boxMm[5]===870).map(q=>q.id),
  portMates=['cold/sink/head-matched-union/moving-half','cold/sink/lower/tube/2','U/hot/head-moving-union',...hot.filter(q=>q.id.startsWith('U/hot/formed-spool/')).map(q=>q.id)]
 for(const p of headParts){
  // Existing matched ports and head bearing surfaces are intentional mates
  // during the monotonic upward release; BOTH joint jackets must be stripped.
  compare(p.id,sweep(p.boxMm,[0,0,0],[0,0,c.firstLiftMm]),'head-first-lift',[...frameMates,...portMates])
  const rearRail='IAS/frame/EW rail at y750 / z850'
  compare(p.id,sweep(p.boxMm,[0,0,c.firstLiftMm],[0,-c.southClearanceMm,c.firstLiftMm]),'head-south-clearance',[rearRail,...portMates])
  compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.firstLiftMm],[0,-c.southClearanceMm,c.liftMm]),'head-remaining-lift',[rearRail,...portMates])
  compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.liftMm],[-c.westTransferMm,-c.southClearanceMm,c.liftMm]),'head-west',portMates)
  for(const q of hardware.filter(v=>v.id.startsWith('capture/')||(v.id.startsWith('IAS/frame/')&&(!v.id.includes('EW rail at y750 / z850')||!j.seatTravelsWithCapturedRail))))add(p.id+'/'+q.id,'head-gantry',gap(sweep(p.boxMm,[0,-c.southClearanceMm,c.liftMm],[-c.westTransferMm,-c.southClearanceMm,c.liftMm]),q.boxMm)-two)
 }

 const slingChecks:{id:string;phase:string;reserveMm:number}[]=[]
 const beforeSlingRows=rows.length
 for(const [k,e]of c.liftingEyesMm.entries()){
  const sling:B=[e[0]-10,e[1]-c.southClearanceMm-10,e[2],20,c.southClearanceMm+20,z-e[2]]
  compare('capture/sling-initial/'+k,sling,'capture-sling')
  const travelling:B=[e[0]-c.westTransferMm-10,e[1]-c.southClearanceMm-10,e[2]+c.liftMm,c.westTransferMm+20,c.southClearanceMm+20,z-e[2]-c.liftMm]
  compare('capture/sling-west/'+k,travelling,'capture-sling')
 }
 slingChecks.push(...rows.slice(beforeSlingRows))
 const earliestToolChecks:{id:string;phase:string;reserveMm:number}[]=[]
 for(const [name,p]of [['cold',bowl.coldPortMm],['hot',bowl.hotPortMm]] as const)for(const flatZ of[p[2]-16,p[2]+16]){
  const wrenchHead:B=[p[0]-27.5,p[1]-35,flatZ-3,55,65,6],wrenchShaft:B=[p[0]-8,p[1]+15,flatZ-3,16,135,6],
   board=headParts.find(q=>q.id==='head/board')!.boxMm
  for(const [part,b]of [['head',wrenchHead],['shaft',wrenchShaft]] as const){
   earliestToolChecks.push({id:name+'/'+flatZ+'/'+part+'/source-solid-board-without-authored-tool-aperture',phase:'earliest-union-tools',reserveMm:gap(b,board)-two})
   const rail=frame.find(q=>q.id==='IAS/frame/EW rail at y1350 / z850')!
   earliestToolChecks.push({id:name+'/'+flatZ+'/'+part+'/front-upper-rail-present-control',phase:'earliest-union-tools',reserveMm:gap(b,rail.boxMm)-two})
  }
 }

 add('head-rest/top-mates-bowl','gravity',bowl.bowlBottomMm+c.liftMm-c.restTopMm)
 add('head/hoist-collapse','gravity',c.topAxisZMm-(c.liftingEyesMm[0][2]+c.liftMm)-c.minimumHoistClosedHeightMm-two)
 const cg=c.headCGPlanDesignMm,eyes=c.liftingEyesMm,ex=eyes.map(p=>p[0]),ey=eyes.map(p=>p[1])
 for(const [id,v]of Object.entries({west:cg[0]-Math.min(...ex),east:Math.max(...ex)-cg[0]-cg[2],south:cg[1]-Math.min(...ey),north:Math.max(...ey)-cg[1]-cg[3]}))add('head-CG/'+id,'gravity',v)
 add('head-required-positive-capture-before-rear-rail','gravity',c.rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift&&c.firstLiftMm>=35&&c.jointJacketsStrippedLengthMm>=100?0:-1)
 const H=c.externalHorizontalComparisonN,W=c.maximumCapturedWetHeadKg*9.81*1.5,span=x1-x0,gravityBeamMoment=W*span/4,steelLengthMm=4*z+2*(x1-x0)+2*(y1-y0)+c.headTrackYMm.length*(x1-x0),
  massUpperKg=steelLengthMm*c.maximumSectionAreaMm2/1e9*c.maximumSteelDensityKgM3,
  geometryFailures=rows.filter(q=>q.phase!=='gravity'&&q.reserveMm< -1e-7),gravityFailures=rows.filter(q=>q.phase==='gravity'&&q.reserveMm< -1e-7)
 return{schema:'had-utility-ordinary-head-capture/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,context:source.rearTreeContext,frame:source.host.geometry.frame,activePaths:source.route.paths,choice:wet.choice,controls:c,joints:j}),
  controls:c,earliestTools:{checks:earliestToolChecks,failures:earliestToolChecks.filter(q=>q.reserveMm<0),frontRailRemovedBeforeNorthToolsRequired:true,headToolAperturesOrActualJawFlatDatumsAuthored:false},slings:{checks:slingChecks,minimumEachResultantN:Math.hypot(W,W*c.southClearanceMm/(z-c.liftingEyesMm[0][2]-c.liftMm)),actualHoistGuidesAndSideShiftMechanismQualified:false},phase:'washer-first-rest; LodgeU/H0/localcutsverifiedzero; source740andH0365drained; matchedheadunionjacketsstripped',
  hardware,interfaces,headParts,checks:rows,geometryFailures,gravityFailures,necessaryGravityGeometry:geometryFailures.length===0&&gravityFailures.length===0,
  sequence:['Isolate, cool and positively drain both actual independent head sources. Retain coldtree/sourceunion made; put washer at actual firstrest.','Seat and cross-brace the temporary floor gantry and empty-bay positive head rest. Attach all four factory head eyes and take the full head gravity load BEFORE any rail release.','Capture the head, positively brace the remaining frame and mechanically remove the FRONT upper rail before north-side union tools. Actual head access apertures/jaw-flat datums remain an explicit failed interface. Counterhold both matched head unions with stripped jackets; lift the captured head35mm, positively release the rear upper rail, shift SOUTH60mm, complete360mm lift, then travel WEST800mm on two captive top tracks to the positive rest. The rear UPPER rail must first be captured and independently renewed after35mm head lift, allowing60mm SOUTH clearance before the remaining lift; this avoids the real H0backbone.','Only after the entire head is resting independently may the front upper rail and the individually bolted dry members be renewed on positive temporary stability supports. Restore and leak-test all joints before occupied use.'],
  demand:{fullHeadDynamicN:W,eachEyeAndHoistMinimumVerticalDemandN:W,gantrySteelStockUpperKg:massUpperKg,steelStockLengthMm:steelLengthMm,referenceEWBeamMomentNmm:gravityBeamMoment,referenceEWBeamStressMPa:gravityBeamMoment*s/2/c.minimumSectionIMm4,
   fullHeadAndGantryOnOneFootUpperN:(massUpperKg+c.maximumCapturedWetHeadKg)*9.81*1.5,footBearingAreaMm2:c.soleCrossMm**2,
   externalHorizontalComparisonN:H,frictionHorizontalResistanceCreditedN:0,unbalancedHorizontalDemandWithoutPositiveFloorReceiverN:H,
   actualFloorContactReactionsMaterialBucklingAndStabilityAccepted:false},
  jointReference:{gravitySeatCantileverMm:j.gravitySeatLengthMm,full2000NseatRootStressMPa:2000*j.gravitySeatLengthMm*6/(j.gravitySeatWidthMm*j.gravitySeatThicknessMm**2),
   boltShearAreaMm2:36.6,twoBolt2000NnominalShearMPa:1000/36.6,actualWeldHSSLocalWallAndBoltResistanceAccepted:false},
  sourcePortJacketsRemovedOnlyAtMatchedRelease:true,headSourceFactoryEyesMassCGAndProductBoundsQualified:false,
  exactMemberWebsToolSocketsSpannerArcsAndExtractionQualified:false,actualTwoPlaneTemporaryBracingAndPositiveFloorReceiverIncluded:false,
  sourceBoundCapturePhase:{schema:'had-utility-head-capture-phase/1' as const,sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,context:source.rearTreeContext,frame:source.host.geometry.frame,activePaths:source.route.paths,choice:wet.choice,controls:c,joints:j}),
   headHotPortMm:bowl.hotPortMm,headColdPortMm:bowl.coldPortMm,frontUpperRailId:'IAS/frame/EW rail at y1350 / z850',
   captureGeometryChecks:rows.filter(q=>q.id.startsWith('capture/')),gravityChecks:rows.filter(q=>q.phase==='gravity'),
   fullHeadDynamicN:W,eachEyeAndHoistMinimumVerticalDemandN:W,referenceBeamStressMPa:gravityBeamMoment*s/2/c.minimumSectionIMm4,referenceAllowableMPa:200/1.5,
   actualPhysicalHandlingFloorAndInstalledAcceptance:false as const},
  ordinaryRenewalAccepted:false,
  diagnostics:[...(geometryFailures.length?['UTILITY_CAPTURE/actual-head-hardware-or-retained-service-geometric-conflicts']:[]),'UTILITY_CAPTURE/horizontal200N-needs-real-positive-floor-reaction-not-friction',
   'UTILITY_CAPTURE/factory-head-eyes-mass-CG-and-hoists-not-physically-qualified','UTILITY_CAPTURE/member-webs-full-tool-and-member-extraction-proofs-incomplete']}
}
