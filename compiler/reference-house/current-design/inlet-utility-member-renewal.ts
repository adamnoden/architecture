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

type CaptureControls={ schema:string;method:string;rollingOperator?:{floorStartXYMm:readonly[number,number];floorEndXYMm:readonly[number,number];maximumBodyHeightMm:number;bodyRadiusMm:number;shoulderOffsetMm:P;handleInitialMm:P;maximumControllableRollingForceN:number;actualCasterAndPhysicalHandlingQualified:false};rejectedOverheadGantry?:CaptureControls;fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement?:boolean;fork?:{axisXMm:readonly number[];rearTipYMm:number;rootYMm:number;bottomMm:number;widthMm:number;depthMm:number;rootPadHeightMm:number;minimumIMM4:number;minimumAreaMM2:number;strokeMm:number;liftColumnTopMm:number;baseTopMm:number;maximumCapturedWetHeadKg:number;gravityDynamicFactor:number;frontFootYMm:number;baseRearYMm:number;maximumReferenceDeflectionMm:number;minimumRemainingClearanceAfterDeflectionMm:number};postsXYMm:readonly(readonly[number,number])[];topAxisZMm:number;memberCrossMm:number;soleCrossMm:number;soleThicknessMm:number;headTrackYMm:readonly number[];liftingEyesMm:readonly P[];
 maximumCapturedWetHeadKg:number;headCGPlanDesignMm:readonly[number,number,number,number];maximumPillarAndSpoutCrossMm:number;maximumSpoutCrossMm:number;firstLiftMm:number;southClearanceMm:number;rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift:boolean;jointJacketsStrippedLengthMm:number;maximumHandleCrossMm:number;maximumHeadZMm:number;liftMm:number;westTransferMm:number;minimumHoistClosedHeightMm:number;
 restPlanMm:readonly[number,number,number,number];restTopMm:number;restTopDepthMm:number;restPostsXYMm:readonly(readonly[number,number])[];restPostCrossMm:number;
 maximumSectionAreaMm2:number;minimumSectionAreaMm2:number;minimumSectionIMm4:number;maximumSteelDensityKgM3:number;minimumSteelDensityKgM3:number;normalWorkingFloorXYMm:readonly[number,number];normalWorkingShoulderMm:P;externalHorizontalComparisonN:number;frictionResistanceCredited:false;actualProductsFloorHorizontalReactionAndPhysicalHandlingAccepted:false
}
type JointControls={schema:string;memberEndGapMm:number;seatTravelsWithCapturedRail:boolean;gravitySeatLengthMm:number;gravitySeatWidthMm:number;gravitySeatThicknessMm:number;receiverWidthMm:number;receiverThicknessMm:number;boltEdgeMm:number;boltDiameterMm:number;boltPitchMm:number;upperBoltZMm:{EW:readonly number[];NS:readonly number[]};lowerBoltZMm:{EW:readonly number[];NS:readonly number[]};northProjectionMm:{EW:number;NS:number};actualReceiverWeldBoltMaterialAndLocalHSSProofAccepted:false}
/** Positive vertical capture and finite body/member geometry. Horizontal floor
 * reaction is deliberately a separate unsatisfied action without friction or a
 * real locating receiver. A geometric gravity path cannot approve that action. */
export function inletUtilityOrdinaryCapture(i:{source:Source;wet:Wet}){return inletUtilityHeadCaptureCore({...i,mode:'fork'})}
export function inletUtilityRejectedGantryControl(i:{source:Source;wet:Wet}){return inletUtilityHeadCaptureCore({...i,mode:'gantry'})}
function inletUtilityHeadCaptureCore(i:{source:Source;wet:Wet;mode:'fork'|'gantry'}){
 const {source,wet}=i,d=wet.choice.coldDistribution,
  f=(d as unknown as{frameRenewal:{headCapture:CaptureControls;memberJointDesign:JointControls}}).frameRenewal,c=i.mode==='gantry'?f?.headCapture.rejectedOverheadGantry!:f?.headCapture,j=f?.memberJointDesign,two=2*source.rearTreeContext.settingEachMm
 if(c?.schema!=='had-utility-floor-head-capture/1'||j?.schema!=='had-utility-bolted-member-end/1'||c.postsXYMm.length!==4||c.liftingEyesMm.length!==4||c.restPostsXYMm.length!==4||two!==20
  ||c.frictionResistanceCredited!==false||c.actualProductsFloorHorizontalReactionAndPhysicalHandlingAccepted!==false||j.actualReceiverWeldBoltMaterialAndLocalHSSProofAccepted!==false
  ||c.memberCrossMm<(i.mode==='gantry'?50:30)||c.maximumCapturedWetHeadKg<=0||c.liftMm<=0||c.westTransferMm<=0||c.minimumSectionIMm4<=0||j.boltPitchMm<3*j.boltDiameterMm)throw Error('Actual head capture and bolted end design controls required')
 const frame=Object.entries(source.host.geometry.frame).filter(([id])=>id!=='temporary carry bar').map(([id,b])=>({id:'IAS/frame/'+id,boxMm:b as B})),
  legs=frame.filter(q=>q.id.includes('/leg ')),rails=frame.filter(q=>q.id.includes(' rail ')),
  px=c.postsXYMm.map(p=>p[0]),py=c.postsXYMm.map(p=>p[1]),x0=Math.min(...px),x1=Math.max(...px),y0=Math.min(...py),y1=Math.max(...py),
  hardware:{id:string;boxMm:B;mates:readonly string[];afterFrameKnockdown:boolean}[]=[],put=(id:string,b:B,mates:readonly string[]=[],afterFrameKnockdown=false)=>hardware.push({id,boxMm:b,mates,afterFrameKnockdown}),
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

 if(i.mode==='fork'){
  const fork=c.fork
  if(!fork||fork.axisXMm.length!==2||fork.minimumIMM4<=0||fork.strokeMm<c.liftMm)throw Error('Actual finite fork capture source required')
  hardware.length=0
  for(const [k,p]of c.postsXYMm.entries()){
   put('capture/leg/'+k,[p[0]-c.soleCrossMm/2,p[1]-c.soleCrossMm/2,0,c.soleCrossMm,c.soleCrossMm,6])
  }
  for(const x of[...new Set(c.postsXYMm.map(p=>p[0]))])put('capture/base-NS/'+x,[x-20,fork.baseRearYMm,20,40,fork.frontFootYMm-fork.baseRearYMm,40])
  for(const y of[fork.baseRearYMm,fork.frontFootYMm])put('capture/base-EW/'+y,[x0,y-20,20,x1-x0,40,40])
  for(const x of fork.axisXMm){
   put('capture/lift-column/'+x,[x-20,fork.rootYMm-20,60,40,40,fork.liftColumnTopMm-60])
   put('capture/fork/'+x,[x-fork.widthMm/2,fork.rearTipYMm,fork.bottomMm,fork.widthMm,fork.rootYMm-fork.rearTipYMm,fork.depthMm])

  }
  for(const p of c.liftingEyesMm)put('capture/bearing/'+p[0]+'/'+p[1],[p[0]-8,p[1]-10,fork.bottomMm+fork.depthMm,16,20,fork.rootPadHeightMm])
  put('capture/column-cross-brace',[Math.min(...fork.axisXMm),fork.rootYMm-20,480,Math.max(...fork.axisXMm)-Math.min(...fork.axisXMm),40,40])
  const hand=c.rollingOperator!.handleInitialMm
  put('capture/rolling-handle-column',[hand[0]-10,hand[1]-10,60,20,20,hand[2]-60],[],true)
  put('capture/rolling-handle-base',[hand[0],hand[1]-10,30,Math.min(...c.postsXYMm.map(p=>p[0]))-hand[0],20,20],[],true)
 }
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
  fixed=[...source.rearTreeContext.obstacles.filter(q=>q.presence!=='carry-bar-after-park'&&q.presence!=='head-before-strip'&&q.id!=='source-washer-home'),
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
 for(const q of hardware){if(q.afterFrameKnockdown)continue;compare(q.id,q.boxMm,'temporary-and-end-hardware',q.mates);if(!q.id.startsWith('capture/fork/')&&!q.id.startsWith('capture/bearing/'))add(q.id+'/current-bowl','temporary-and-end-hardware',gap(q.boxMm,bowlB)-two);add(q.id+'/actual-room-west','temporary-and-end-hardware',q.boxMm[0]-source.input.roomPlanMm[0]-two);add(q.id+'/actual-room-east','temporary-and-end-hardware',source.input.roomPlanMm[0]+source.input.roomPlanMm[2]-q.boxMm[0]-q.boxMm[3]-two)}
 // Full new head product bounds are authored requirements, not point-only taps.
 const top=(d as unknown as{prefabSinkHead:{topPlanMm:readonly[number,number,number,number];topZMm:readonly[number,number];topSolidPlansMm:readonly(readonly[number,number,number,number])[]}}).prefabSinkHead,
  hp=top.topPlanMm,headParts=[...(i.mode==='gantry'?[hp]:top.topSolidPlansMm).map((p,k)=>({id:'head/board/'+k,boxMm:[p[0],p[1],top.topZMm[0],p[2],p[3],top.topZMm[1]-top.topZMm[0]] as B})),{id:'head/bowl',boxMm:bowlB},
   ...[bowl.coldPortMm,bowl.hotPortMm].map((p,k)=>({id:'head/pillar/'+k,boxMm:[p[0]-c.maximumPillarAndSpoutCrossMm/2,p[1]-c.maximumPillarAndSpoutCrossMm/2,p[2],c.maximumPillarAndSpoutCrossMm,c.maximumPillarAndSpoutCrossMm,c.maximumHeadZMm-p[2]] as B})),
   ...bowl.pillarHandleMm.map((p,k)=>({id:'head/handle/'+k,boxMm:centred(p,[c.maximumHandleCrossMm,c.maximumHandleCrossMm,c.maximumHandleCrossMm])})),
   ...bowl.spoutOutletsMm.map((p,k)=>({id:'head/spout/'+k,boxMm:[p[0]-c.maximumSpoutCrossMm/2,p[1]-c.maximumSpoutCrossMm/2,p[2],c.maximumSpoutCrossMm,bowl.coldPortMm[1]-p[1]+c.maximumSpoutCrossMm,c.maximumSpoutCrossMm] as B}))
  ],
  frameMates=frame.filter(q=>q.boxMm[2]+q.boxMm[5]===870).map(q=>q.id),
  portMates=['cold/sink/head-matched-union/moving-half','cold/sink/lower/tube/2','U/hot/head-moving-union',...hot.filter(q=>q.id.startsWith('U/hot/formed-spool/')).map(q=>q.id)]

 const normalHeadChecks:{id:string;phase:string;reserveMm:number}[]=[]
 for(const p of headParts){
  const before=rows.length
  compare(p.id,p.boxMm,'normal-complete-head',[...frameMates,...portMates])
  normalHeadChecks.push(...rows.splice(before))
 }
 for(const p of headParts){
  // Existing matched ports and head bearing surfaces are intentional mates
  // during the monotonic upward release; BOTH joint jackets must be stripped.
  compare(p.id,sweep(p.boxMm,[0,0,0],[0,0,c.firstLiftMm]),'head-first-lift',[...frameMates,...portMates])
  const rearRail='IAS/frame/EW rail at y750 / z850'
  compare(p.id,sweep(p.boxMm,[0,0,c.firstLiftMm],[0,-c.southClearanceMm,c.firstLiftMm]),'head-south-clearance',[rearRail,...portMates])
  compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.firstLiftMm],[0,-c.southClearanceMm,c.liftMm]),'head-remaining-lift',[rearRail,...portMates])
  compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.liftMm],[-c.westTransferMm,-c.southClearanceMm,c.liftMm]),'head-west',[...portMates,...(i.mode==='fork'&&c.fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement?frame.map(q=>q.id):[])])
  for(const q of hardware.filter(v=>i.mode==='gantry'&&(v.id.startsWith('capture/')||(v.id.startsWith('IAS/frame/')&&(!v.id.includes('EW rail at y750 / z850')||!j.seatTravelsWithCapturedRail)))))add(p.id+'/'+q.id,'head-gantry',gap(sweep(p.boxMm,[0,-c.southClearanceMm,c.liftMm],[-c.westTransferMm,-c.southClearanceMm,c.liftMm]),q.boxMm)-two)
 }


 const movingFrameBlockedControl:{id:string;phase:string;reserveMm:number}[]=[]
 let forkDeflectionMm=0
 if(i.mode==='fork'){
  const fk=c.fork!,W=c.maximumCapturedWetHeadKg*9.81*1.5,L=fk.rootYMm-fk.rearTipYMm
  forkDeflectionMm=W*L**3/(3*193000*fk.minimumIMM4)
  for(const q of hardware.filter(v=>v.id.startsWith('capture/'))){
   const raised=q.id.startsWith('capture/fork/')||q.id.startsWith('capture/bearing/')?c.liftMm:0,
    b=sweep(q.boxMm,[0,0,raised],[-c.westTransferMm,0,raised]),
    count=rows.length
   compare(q.id+'/moving',b,'fork-trolley-west',c.fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement?frame.map(v=>v.id):[])
   if(q.id.startsWith('capture/fork/'))for(const row of rows.slice(count))row.reserveMm-=forkDeflectionMm
   for(const v of frame)movingFrameBlockedControl.push({id:q.id+'/'+v.id,phase:'whole-frame-left-standing-rejected-control',reserveMm:gap(b,v.boxMm)-two})
  }
 }

 const rollingChecks:{id:string;phase:string;reserveMm:number}[]=[]
 if(i.mode==='fork'){
  for(const row of rows)if(row.phase==='temporary-and-end-hardware'&&row.id.startsWith('capture/fork/'))row.reserveMm-=forkDeflectionMm
  const op=c.rollingOperator
  if(!op||op.maximumBodyHeightMm<=0||op.bodyRadiusMm!==300)throw Error('Actual low-trolley operator body and handle path required')
  const stationary=[...fixed.filter(q=>!q.id.startsWith('IAS/frame/')),...cold,...hot],
   a:P=[op.floorStartXYMm[0],op.floorStartXYMm[1],0],b:P=[op.floorEndXYMm[0],op.floorEndXYMm[1],0],
   cylinder=(p:P,q:P,box:B)=>{
    const planar=exactSegmentBoxDistance(p,q,[box[0],box[1],-1,box[3],box[4],2])-op.bodyRadiusMm,
     dz=Math.max(box[2]-op.maximumBodyHeightMm,-box[2]-box[5])
    return(planar>0||dz>0?Math.hypot(Math.max(planar,0),Math.max(dz,0)):Math.max(planar,dz))-two
   }
  for(const q of stationary)rollingChecks.push({id:'rolling/body/'+q.id,phase:'rolling-body',reserveMm:cylinder(a,b,q.boxMm)})

  const relativeB:P=[b[0]+c.westTransferMm,b[1],0]
  for(const q of hardware.filter(v=>v.id.startsWith('capture/'))){
   const raised=q.id.startsWith('capture/fork/')||q.id.startsWith('capture/bearing/')?c.liftMm:0
   rollingChecks.push({id:'rolling/body-relative-to-trolley/'+q.id,phase:'rolling-body',reserveMm:cylinder(a,relativeB,[q.boxMm[0],q.boxMm[1],q.boxMm[2]+raised,q.boxMm[3],q.boxMm[4],q.boxMm[5]])})
  }
  const count=30,cover=Math.max(Math.hypot(b[0]-a[0],b[1]-a[1]),c.westTransferMm)/(2*count)
  for(let k=0;k<=count;k++){
   const u=k/count,shoulder:P=[a[0]+(b[0]-a[0])*u+op.shoulderOffsetMm[0],a[1]+(b[1]-a[1])*u+op.shoulderOffsetMm[1],op.shoulderOffsetMm[2]],
    grip:P=[op.handleInitialMm[0]-c.westTransferMm*u,op.handleInitialMm[1],op.handleInitialMm[2]]
   rollingChecks.push({id:'rolling/reach/'+k,phase:'rolling-arm',reserveMm:600-Math.hypot(...grip.map((v,z)=>v-shoulder[z]))})
   for(const q of stationary)rollingChecks.push({id:'rolling/arm/'+q.id+'/'+k,phase:'rolling-arm',reserveMm:exactSegmentBoxDistance(shoulder,grip,q.boxMm)-40-two-cover})
   for(const q of source.rearTreeContext.retainedPaths)for(let z=1;z<q.pointsMm.length;z++)rollingChecks.push({id:'rolling/arm/'+q.id+'/'+z+'/'+k,phase:'rolling-arm',reserveMm:segmentDistance(shoulder,grip,q.pointsMm[z-1],q.pointsMm[z])-q.radiusWithSupportsMm-40-two-cover})
  }
  rows.push(...rollingChecks)
 }

 const braceSource=(d as unknown as{frameRenewal:{temporaryBracing:{schema:string;crossMm:number;minimumAreaMm2:number;minimumIMM4:number;maximumUnbalancedHorizontalComparisonN:number;members:readonly{id:string;endsMm:readonly[P,P];mateFrameIds:readonly string[]}[];clevisEnvelopeMm:P;pinDiameterMm:number}}}).frameRenewal.temporaryBracing,
  braceChecks:{id:string;phase:string;reserveMm:number}[]=[],braceDemands:{id:string;lengthMm:number;axialComparisonN:number;eulerPinnedN:number;axialMPa:number}[]=[]
 if(braceSource?.schema!=='had-utility-temporary-pinned-braces/1'||braceSource.members.length!==4||braceSource.crossMm<20)throw Error('Actual finite temporary brace source required')
 for(const br of braceSource.members){
  const [a,b]=br.endsMm,r=braceSource.crossMm/2,L=Math.hypot(...b.map((v,k)=>v-a[k])),
   horizontal=Math.hypot(b[0]-a[0],b[1]-a[1]),N=braceSource.maximumUnbalancedHorizontalComparisonN*L/horizontal
  braceDemands.push({id:br.id,lengthMm:L,axialComparisonN:N,eulerPinnedN:Math.PI**2*193000*braceSource.minimumIMM4/L**2,axialMPa:N/braceSource.minimumAreaMm2})
  for(const q of[...fixed,...cold,...hot])if(!br.mateFrameIds.includes(q.id))braceChecks.push({id:br.id+'/'+q.id,phase:'temporary-brace',reserveMm:exactSegmentBoxDistance(a,b,q.boxMm)-r-two})
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)braceChecks.push({id:br.id+'/'+q.id+'/'+k,phase:'temporary-brace',reserveMm:segmentDistance(a,b,q.pointsMm[k-1],q.pointsMm[k])-q.radiusWithSupportsMm-r-two})
  for(const p of source.route.paths){
   for(const leg of p.straight)braceChecks.push({id:br.id+'/'+p.id+'/'+leg.index,phase:'temporary-brace',reserveMm:segmentDistance(a,b,leg.a,leg.b)-r-source.route.geometry.jacketRadiusMm-two})
   for(const corner of p.corners)if(corner.kind==='boxed-compression-elbow')braceChecks.push({id:br.id+'/'+corner.id,phase:'temporary-brace',reserveMm:exactSegmentBoxDistance(a,b,corner.boxMm)-r-two})
  }
  braceChecks.push({id:br.id+'/current-bowl',phase:'temporary-brace',reserveMm:exactSegmentBoxDistance(a,b,bowlB)-r-two})
  for(const [k,p]of br.endsMm.entries()){
   const clevis=centred(p,braceSource.clevisEnvelopeMm),start=rows.length
   compare('temporary-brace-clevis/'+br.id+'/'+k,clevis,'temporary-brace-clevis',br.mateFrameIds)
   braceChecks.push(...rows.splice(start))
  }
 }
 rows.push(...braceChecks)
 const slingChecks:{id:string;phase:string;reserveMm:number}[]=[]
 const beforeSlingRows=rows.length
 if(i.mode==='gantry')for(const [k,e]of c.liftingEyesMm.entries()){
  const sling:B=[e[0]-10,e[1]-c.southClearanceMm-10,e[2],20,c.southClearanceMm+20,z-e[2]]
  compare('capture/sling-initial/'+k,sling,'capture-sling')
  const travelling:B=[e[0]-c.westTransferMm-10,e[1]-c.southClearanceMm-10,e[2]+c.liftMm,c.westTransferMm+20,c.southClearanceMm+20,z-e[2]-c.liftMm]
  compare('capture/sling-west/'+k,travelling,'capture-sling')
 }
 slingChecks.push(...rows.slice(beforeSlingRows))
 const earliestToolChecks:{id:string;phase:string;reserveMm:number}[]=[]
 for(const [name,p]of [['cold',bowl.coldPortMm],['hot',bowl.hotPortMm]] as const)for(const flatZ of[p[2]-16,p[2]+16]){
  const wrenchHead:B=[p[0]-27.5,p[1]-35,flatZ-3,55,65,6],wrenchShaft:B=[p[0]-8,p[1]+15,flatZ-3,16,135,6],
   board=headParts.find(q=>q.id.startsWith('head/board/')&&p[0]>=q.boxMm[0]&&p[0]<=q.boxMm[0]+q.boxMm[3])!.boxMm
  for(const [part,b]of [['head',wrenchHead],['shaft',wrenchShaft]] as const){
   earliestToolChecks.push({id:name+'/'+flatZ+'/'+part+'/source-solid-board-without-authored-tool-aperture',phase:'earliest-union-tools',reserveMm:gap(b,board)-two})
   const rail=frame.find(q=>q.id==='IAS/frame/EW rail at y1350 / z850')!
   earliestToolChecks.push({id:name+'/'+flatZ+'/'+part+'/front-upper-rail-present-control',phase:'earliest-union-tools',reserveMm:gap(b,rail.boxMm)-two})
  }
 }

 add('head-rest/top-mates-bowl','gravity',bowl.bowlBottomMm+c.liftMm-c.restTopMm)
 if(i.mode==='gantry')add('head/hoist-collapse','gravity',c.topAxisZMm-(c.liftingEyesMm[0][2]+c.liftMm)-c.minimumHoistClosedHeightMm-two)
 else add('head/fork-available-stroke','gravity',c.fork!.strokeMm-c.liftMm)
 const cg=c.headCGPlanDesignMm,eyes=c.liftingEyesMm,ex=eyes.map(p=>p[0]),ey=eyes.map(p=>p[1])
 for(const [id,v]of Object.entries({west:cg[0]-Math.min(...ex),east:Math.max(...ex)-cg[0]-cg[2],south:cg[1]-Math.min(...ey),north:Math.max(...ey)-cg[1]-cg[3]}))add('head-CG/'+id,'gravity',v-two)
 add('head-required-positive-capture-before-rear-rail','gravity',(i.mode==='fork'?c.firstLiftMm>=65:c.rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift&&c.firstLiftMm>=35)&&c.jointJacketsStrippedLengthMm>=100?0:-1)
 const H=c.externalHorizontalComparisonN,W=c.maximumCapturedWetHeadKg*9.81*1.5,span=x1-x0,gravityBeamMoment=i.mode==='fork'?W*(c.fork!.rootYMm-c.fork!.rearTipYMm):W*span/4,
  referenceDepth=i.mode==='fork'?c.fork!.depthMm:s,referenceI=i.mode==='fork'?c.fork!.minimumIMM4:c.minimumSectionIMm4,
  steelLengthMm=i.mode==='fork'?2*(c.fork!.frontFootYMm-c.fork!.baseRearYMm)+2*(x1-x0)+2*(c.fork!.liftColumnTopMm-60)+2*(c.fork!.rootYMm-c.fork!.rearTipYMm)+Math.max(...c.fork!.axisXMm)-Math.min(...c.fork!.axisXMm):4*z+2*(x1-x0)+2*(y1-y0)+c.headTrackYMm.length*(x1-x0),
  massUpperKg=steelLengthMm*c.maximumSectionAreaMm2/1e9*c.maximumSteelDensityKgM3,
  geometryFailures=rows.filter(q=>q.phase!=='gravity'&&q.reserveMm< -1e-7),gravityFailures=rows.filter(q=>q.phase==='gravity'&&q.reserveMm< -1e-7)
 return{schema:'had-utility-ordinary-head-capture/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,context:source.rearTreeContext,frame:source.host.geometry.frame,activePaths:source.route.paths,choice:wet.choice,controls:c,joints:j}),
  controls:c,normalHeadChecks,normalHeadFailures:normalHeadChecks.filter(q=>q.reserveMm< -1e-7),normalCompleteHeadNecessary:normalHeadChecks.every(q=>q.reserveMm>=-1e-7),mode:i.mode,temporaryBracing:{source:braceSource,checks:braceChecks,failures:braceChecks.filter(q=>q.reserveMm<0),demands:braceDemands,actualPinSleeveHSSWallAndFloorResistanceQualified:false},rollingOperator:{checks:rollingChecks,failures:rollingChecks.filter(q=>q.reserveMm<0),actualHumanForceAndCasterRollingQualified:false},movingFrameBlockedControl,forkReference:{maximumOneForkDynamicN:c.maximumCapturedWetHeadKg*9.81*1.5,deflectionMm:forkDeflectionMm,actualSectionAndGuideCapacityQualified:false},earliestTools:{checks:earliestToolChecks,failures:earliestToolChecks.filter(q=>q.reserveMm<0),frontRailRemovedBeforeNorthToolsRequired:true,headToolAperturesOrActualJawFlatDatumsAuthored:true},slings:{checks:slingChecks,active:i.mode==='gantry',minimumEachResultantN:Math.hypot(W,W*c.southClearanceMm/(z-c.liftingEyesMm[0][2]-c.liftMm)),actualHoistGuidesAndSideShiftMechanismQualified:false},phase:'washer-first-rest; LodgeU/H0/localcutsverifiedzero; source740andH0365drained; matchedheadunionjacketsstripped',
  hardware,interfaces,headParts,checks:rows,geometryFailures,gravityFailures,necessaryGravityGeometry:geometryFailures.length===0&&gravityFailures.length===0,
  sequence:i.mode==='fork'?[
   'Close actual LodgeU/H0/local source cuts, cool, verify zero pressure and drain through the source-derived1550 high vent/740 controlled cold drain and365 hot drain. Neither head union nor a later blank establishes isolation.',
   'Park washer at its actual first rest. Seat the low floor trolley; engage four positive factory under-bowl capture ribs and take full head gravity load BEFORE releasing a loaded rail. Independent water supports remain made.',
   'Install the actual two-plane temporary frame bracing and positive locating/hold-down interface; its physical floor resistance remains unqualified. Capture and unbolt only the FRONT upper rail to expose north-side head union tools.',
   'Counterhold the complete820 pressure unions at804/836mm flats with stripped joint jackets. Capture and disconnect the actual sink waste/trap joint too; its authored geometry remains an explicit missing interface.',
   'Raise the captured whole head65mm for complete32mm union-half clearance, then continue straight to380mm. The two actual board rectangles with one60x60NW service corner clear H0; no SOUTH shift or rear-rail-first manoeuvre is required.',
   'With the complete head supported on the trolley and water on independent receivers, capture and knock down the remaining seven dry rails and four legs individually. Complete web/tool/bracing/extraction qualification remains false; no assembled-frame withdrawal is used.',
   'Only after dry members are cleared, roll the complete captured head WEST800mm to the emptied washer bay. Use the declared kneeling operator/side handle path and bounded rolling force; the200N adverse horizontal/floor reaction remains an unresolved comparison.',
   'Restore positive supports, all bolted members, matched hot/cold unions, waste/trap, jackets and local cuts; inspect and pressure/leak test before occupied use.'
  ]:['Isolate, cool and positively drain both actual independent head sources. Retain coldtree/sourceunion made; put washer at actual firstrest.','Seat and cross-brace the temporary floor gantry and empty-bay positive head rest. Attach all four factory head eyes and take the full head gravity load BEFORE any rail release.','Capture the head, positively brace the remaining frame and mechanically remove the FRONT upper rail before north-side union tools. The authored820mm head port gives actual jaw-flat heights804/836mm; both are below the870mm board after fulltwo10 settings. Actual tool product and full handling remain unqualified. Counterhold both matched head unions with stripped jackets; lift the captured head35mm, positively release the rear upper rail, shift SOUTH60mm, complete360mm lift, then travel WEST800mm on two captive top tracks to the positive rest. The rear UPPER rail must first be captured and independently renewed after35mm head lift, allowing60mm SOUTH clearance before the remaining lift; this avoids the real H0backbone.','Only after the entire head is resting independently may the front upper rail and the individually bolted dry members be renewed on positive temporary stability supports. Restore and leak-test all joints before occupied use.'],
  demand:{fullHeadDynamicN:W,eachEyeAndHoistMinimumVerticalDemandN:W,temporaryCaptureSteelStockUpperKg:massUpperKg,gantrySteelStockUpperKg:i.mode==='gantry'?massUpperKg:null,steelStockLengthMm:steelLengthMm,referenceEWBeamMomentNmm:gravityBeamMoment,referenceEWBeamStressMPa:gravityBeamMoment*referenceDepth/2/referenceI,
   fullHeadAndGantryOnOneFootUpperN:(massUpperKg+c.maximumCapturedWetHeadKg)*9.81*1.5,footBearingAreaMm2:c.soleCrossMm**2,
   externalHorizontalComparisonN:H,frictionHorizontalResistanceCreditedN:0,unbalancedHorizontalDemandWithoutPositiveFloorReceiverN:H,
   actualFloorContactReactionsMaterialBucklingAndStabilityAccepted:false},
  jointReference:{gravitySeatCantileverMm:j.gravitySeatLengthMm,full2000NseatRootStressMPa:2000*j.gravitySeatLengthMm*6/(j.gravitySeatWidthMm*j.gravitySeatThicknessMm**2),
   boltShearAreaMm2:36.6,twoBolt2000NnominalShearMPa:1000/36.6,actualWeldHSSLocalWallAndBoltResistanceAccepted:false},
  sourcePortJacketsRemovedOnlyAtMatchedRelease:true,headSourceFactoryEyesMassCGAndProductBoundsQualified:false,
  exactMemberWebsToolSocketsSpannerArcsAndExtractionQualified:false,actualTwoPlaneTemporaryBracingAndPositiveFloorReceiverIncluded:false,
  sourceBoundCapturePhase:{schema:'had-utility-head-capture-phase/1' as const,sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,context:source.rearTreeContext,frame:source.host.geometry.frame,activePaths:source.route.paths,choice:wet.choice,controls:c,joints:j}),
   headHotPortMm:bowl.hotPortMm,headColdPortMm:bowl.coldPortMm,frontUpperRailId:'IAS/frame/EW rail at y1350 / z850',
   captureGeometryChecks:[...rows.filter(q=>q.id.startsWith('capture/')&&q.phase==='temporary-and-end-hardware'),...braceChecks],gravityChecks:rows.filter(q=>q.phase==='gravity'),
   headReleaseAndRestChecks:[...rows.filter(q=>q.phase.startsWith('head-')||q.phase.startsWith('fork-')||q.phase.startsWith('rolling-')),...earliestToolChecks.filter(q=>!q.id.includes('front-upper-rail-present-control')),{id:i.mode==='fork'?'actual-sink-waste-release-and-finite-member-knockdown-tool-support-proof-incomplete':'rear-upper-rail-captured-with-seats-withdrawal-and-park-incomplete',reserveMm:-1}],
   fullHeadDynamicN:W,eachEyeAndHoistMinimumVerticalDemandN:W,referenceBeamStressMPa:gravityBeamMoment*referenceDepth/2/referenceI,referenceAllowableMPa:200/1.5,
   actualPhysicalHandlingFloorAndInstalledAcceptance:false as const},
  ordinaryRenewalAccepted:false,
  diagnostics:[...(geometryFailures.length?['UTILITY_CAPTURE/actual-head-hardware-or-retained-service-geometric-conflicts']:[]),'UTILITY_CAPTURE/horizontal200N-needs-real-positive-floor-reaction-not-friction',
   'UTILITY_CAPTURE/factory-head-eyes-mass-CG-and-hoists-not-physically-qualified','UTILITY_CAPTURE/member-webs-full-tool-and-member-extraction-proofs-incomplete']}
}

/** Schematic uses the same actual solid rectangles and foot/member shapes as
 * the numeric observer. It does not imply a structural/handling admission. */
export function utilityOrdinaryHeadPlanSvg(r:ReturnType<typeof inletUtilityOrdinaryCapture>){
 const esc=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  rect=(id:string,b:readonly number[],colour:string,offset=0)=>'<rect data-part="'+esc(id)+'" x="'+(b[0]+offset)+'" y="'+b[1]+'" width="'+b[3]+'" height="'+b[4]+'" fill="'+colour+'" fill-opacity=".38" stroke="'+colour+'" stroke-width="3"/>',
  head=r.headParts.filter(q=>q.id.startsWith('head/board/')||q.id==='head/bowl'),
  normal=head.map(q=>rect(q.id,q.boxMm,q.id==='head/bowl'?'#377c95':'#8c621d')).join(''),
  parked=head.map(q=>rect(q.id+'/parked',q.boxMm,q.id==='head/bowl'?'#377c95':'#8c621d',-r.controls.westTransferMm)).join(''),
  trolley=r.hardware.filter(q=>q.id.startsWith('capture/')).map(q=>rect(q.id,q.boxMm,'#685397')).join('')
 return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="9300 400 2400 2100"><rect x="9300" y="400" width="2400" height="2100" fill="white"/><text x="9400" y="490" font-size="36">Utility component renewal: source-derived plan</text>'+normal+parked+trolley+'<text x="9400" y="2230" font-size="27">One60x60NW service corner; normal / captured380UP / WEST800park</text><text x="9400" y="2280" font-size="27">Floor, waste, web/tool and physical handling qualification incomplete</text></svg>'
}
