/** Owning geometric/demand observer for individually renewed dry-frame members.
 * Proposed independent water receivers are explicit design geometry, not selected
 * anchors, installed clips or a replacement for current native structural proof. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {intersectPlan,expandPlan,planArea,type PlanRectangle} from './inlet-orthogonal-plan.js'
import {exactSegmentBoxDistance,finiteBends} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import type {readUtilityCurrentGeometrySource} from './inlet-utility-proof-source.js'
import type {UtilityRearTreeChoice} from './inlet-utility-rear-tree.js'
import {inletUtilityRearTree} from './inlet-utility-rear-tree.js'
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
  memberEndGap=(d as unknown as{frameRenewal:{memberJointDesign:{memberEndGapMm:number}}}).frameRenewal.memberJointDesign.memberEndGapMm,
  members=rails.map(q=>{const b=q.boxMm,axis=b[3]>b[4]?0:1,start=(axis===0?minX:minY)+40+memberEndGap,end=(axis===0?maxX:maxY)-memberEndGap,
   replacement:B=axis===0?[start,b[1],b[2],end-start,b[4],b[5]]:[b[0],start,b[2],b[3],end-start,b[5]]
   return{id:q.id,drawnBoxMm:b,boltedCutBoxMm:replacement,cutLengthMm:end-start,drawnCentreToCentreLengthMm:b[axis+3],boltsPerEndRequired:2,actualBoltedJointSelected:false}
  }),
  washer=d.washer.stop.axisMm,sink=d.sink.stop.axisMm,
  // The header receiver fits BETWEEN the actual22/15 descending branches.
  headX=(d.washerTeeMm[0]+d.sinkTeeMm[0])/2+2,
  beams=[
   {id:'independent-water/header',axisX:headX,endY:d.commonPathMm[0][1],z:830,section:r.headerReceiverSectionMm,I:r.headerReceiverMinimumIMM4,A:r.headerReceiverMinimumAreaMM2,mate:['common/tube/1'],loadBoreMm:20.3},
   {id:'independent-water/washer',axisX:washer[0],endY:washer[1],z:620,section:r.valveReceiverSectionMm,I:r.valveReceiverMinimumIMM4,A:r.valveReceiverMinimumAreaMM2,mate:[] as string[],loadBoreMm:20.3},
   {id:'independent-water/sink',axisX:sink[0]+80,endY:sink[1],z:250,section:r.valveReceiverSectionMm,I:r.valveReceiverMinimumIMM4,A:r.valveReceiverMinimumAreaMM2,mate:['sink/stop-body'],loadBoreMm:13.7}
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
  headerFree=d.commonPathMm.at(-1)![0]-d.commonPathMm[0][0],ordinaryCapture=inletUtilityOrdinaryCapture({source,wet})
 return{schema:'had-utility-independent-member-observer/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,choice:wet.choice,boundary:source.boundary,requirements:r,tools}),
  currentSavedDocumentAdmitted:false,requirements:r,wholeAssembledFrameWithdrawalRequired:false,coldTreeOrSourceUnionOpenedForDryMemberRenewal:false,
  members,ordinaryCapture,drawnRailEndsNeedActualBoltedJointRedesign:false,actualBoltedRailJointResistanceQualified:false,normalIndependentWaterBeamCandidate:{beams,checks,failures:checks.filter(q=>q.reserveMm< -1e-7),demands,
   fullClampForkSlidesAndWallAnchorGeometryIncluded:false,actualWallElevationAndMaterialRead:false,permanentWallSteelExcludedFromMoving20kgTree:true,
   steelSectionDemandWithinAuthoredComparison:demands.every(v=>Math.max(v.normalExtremeFibreMPa,v.coldZeroExtremeFibreMPa)<=r.referenceAllowableMPa)},
  retiredClearSpanComparison:{role:'old no-end-gap clear span; not current bolted-member force result',longestClearSpanMm:longestUpper+2*memberEndGap,extremeFibreMPa:r.upperRailComparisonPointLoadN*(longestUpper+2*memberEndGap)/4*r.upperRailDepthMm/2/r.upperRailMinimumIMM4},
  railComparison:{longestClearSpanMm:longestUpper,pointLoadN:r.upperRailComparisonPointLoadN,extremeFibreMPa:railMoment*r.upperRailDepthMm/2/r.upperRailMinimumIMM4,
   deflectionMm:r.upperRailComparisonPointLoadN*longestUpper**3/(48*r.elasticModulusMPa*r.upperRailMinimumIMM4),sectionJointAndLoadPathQualified:false},
  stability:{deadweightRestoringCreditN:0,horizontalComparisonN:r.comparisonHorizontalMaintenanceN,heightMm:870,
   requiredPositivePairHoldDownN:{eastWest:r.comparisonHorizontalMaintenanceN*870/spanX,northSouth:r.comparisonHorizontalMaintenanceN*870/spanY},
   twoOrthogonalTemporaryBracesRequired:true,actualBraceAnchorAndRemainingMemberProofAccepted:false},
  thermal:{freeHeaderXmm:headerFree*r.copperExpansionPerK*r.temperatureExcursionK,declaredSlideTravelEachWayMm:r.declaredMinimumSlideTravelEachWayMm,
   slidePositiveGravityAndAntiRotationRequired:true,frictionCredited:false,actualBranchedTubeReactionLawImplemented:false,
   seizedGuideAndWhollyRestrainedStraightAdverseCaseRetained:true},
  tools:{tasks:tools,checks:toolChecks,failures:toolChecks.filter(v=>v.reserveMm< -1e-7),requiredRailEndInterfaces:members.length*2,
   authoredJointGeometryInterfaces:ordinaryCapture.interfaces.length,geometricallyClearJointInterfaces:ordinaryCapture.geometryFailures.some(q=>!q.id.startsWith('capture/'))?0:ordinaryCapture.interfaces.length,
   firstFrontUpperRailToolCases:ordinaryCapture.frontUpperRailTools.tasks.length,authoredAndProvedRailEndInterfaces:0,allMemberToolAndExtractionInterfacesRequiredForThisCount:true,actualSocketCounterholdBodyAndWithdrawalProofAccepted:false},
  head:{fullCapturedHeadOrIndividualBowlPillarAndBoardRemovalProved:false,headRemovedBeforeAnyLoadedFrameReleaseRequired:false,positiveHeadCaptureBeforeFirstRailReleaseRequired:true},
  actualIndependentWaterSupportAccepted:false,ordinaryMemberRenewalAccepted:false,
  diagnostics:['UTILITY_MEMBER/all-member-extraction-and-tools-unproved','UTILITY_MEMBER/static-head-capture-floor-and-hardware-capacity-unqualified',
   'UTILITY_MEMBER/permanent-water-clamp-slide-fork-and-wall-anchorage-incomplete','UTILITY_MEMBER/temporary-frame-bracing-and-positive-hold-down-required',
   ...(checks.some(v=>v.reserveMm<0)?['UTILITY_MEMBER/proposed-independent-beam-geometry-conflicts']:[])]}
}

type CaptureControls={ schema:string;method:string;wholeHeadWestParkRequiredForOrdinaryRenewal?:boolean;rollingOperator?:{floorStartXYMm:readonly[number,number];floorEndXYMm:readonly[number,number];maximumBodyHeightMm:number;bodyRadiusMm:number;shoulderOffsetMm:P;handleInitialMm:P;maximumControllableRollingForceN:number;actualCasterAndPhysicalHandlingQualified:false};rejectedOverheadGantry?:CaptureControls;fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement?:boolean;fork?:{axisXMm:readonly number[];crossbearerXExtentMm:readonly[number,number];minimumTorsionalJMm4:number;minimumClosedWallMm:number;meanClosedAreaMm2:number;poissonRatio:number;rearTipYMm:number;rootYMm:number;bottomMm:number;widthMm:number;depthMm:number;rootPadHeightMm:number;minimumIMM4:number;minimumAreaMM2:number;strokeMm:number;liftColumnTopMm:number;baseTopMm:number;maximumCapturedWetHeadKg:number;gravityDynamicFactor:number;frontFootYMm:number;baseRearYMm:number;maximumReferenceDeflectionMm:number;minimumRemainingClearanceAfterDeflectionMm:number};postsXYMm:readonly(readonly[number,number])[];topAxisZMm:number;memberCrossMm:number;soleCrossMm:number;soleThicknessMm:number;headTrackYMm:readonly number[];liftingEyesMm:readonly P[];
 maximumCapturedWetHeadKg:number;headCGPlanDesignMm:readonly[number,number,number,number];maximumPillarAndSpoutCrossMm:number;maximumSpoutCrossMm:number;firstLiftMm:number;southClearanceMm:number;rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift:boolean;jointJacketsStrippedLengthMm:number;maximumHandleCrossMm:number;maximumHeadZMm:number;liftMm:number;westTransferMm:number;minimumHoistClosedHeightMm:number;
 restPlanMm:readonly[number,number,number,number];restTopMm:number;restTopDepthMm:number;restPostsXYMm:readonly(readonly[number,number])[];restPostCrossMm:number;
 maximumSectionAreaMm2:number;minimumSectionAreaMm2:number;minimumSectionIMm4:number;maximumSteelDensityKgM3:number;minimumSteelDensityKgM3:number;normalWorkingFloorXYMm:readonly[number,number];normalWorkingShoulderMm:P;externalHorizontalComparisonN:number;frictionResistanceCredited:false;actualProductsFloorHorizontalReactionAndPhysicalHandlingAccepted:false
}
type JointControls={schema:string;connectionMethod:string;ratchetHandleNorthMm:number;steadyHandNorthMm:number;ratchetWorkingSectorDegrees:readonly[number,number];frontToolShoulderMm:P;frontToolBodyFloorXYMm:readonly[number,number];maximumSocketRadiusMm:number;minimumSocketExtensionMm:number;lowerSocketExtensionMm:number;memberEndGapMm:number;seatTravelsWithCapturedRail:boolean;gravitySeatLengthMm:number;gravitySeatWidthMm:number;gravitySeatThicknessMm:number;boltEdgeMm:number;boltDiameterMm:number;boltPitchMm:number;boltFirstFromCutMm:number;boltHeadAFMm:number;boltHeadHeightMm:number;captiveBossDiameterMm:number;captiveBossHeightMm:number;minimumThreadEngagementMm:number;actualReceiverWeldBoltMaterialAndLocalHSSProofAccepted:false}
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
  if(!fork||fork.axisXMm.length!==1||fork.minimumIMM4<=0||fork.strokeMm<c.liftMm||![fork.minimumTorsionalJMm4,fork.minimumClosedWallMm,fork.meanClosedAreaMm2,fork.poissonRatio,...fork.crossbearerXExtentMm].every(Number.isFinite)||fork.minimumTorsionalJMm4<=0||fork.minimumClosedWallMm<=0||fork.meanClosedAreaMm2<=0||fork.poissonRatio<0||fork.poissonRatio>=.5)throw Error('Actual finite fork capture source required')
  hardware.length=0
  for(const [k,p]of c.postsXYMm.entries()){
   put('capture/leg/'+k,[p[0]-c.soleCrossMm/2,p[1]-c.soleCrossMm/2,0,c.soleCrossMm,c.soleCrossMm,6])
   put('capture/base-stub/'+k,[p[0]-20,p[1]-20,6,40,40,14])
  }
  for(const x of[...new Set(c.postsXYMm.map(p=>p[0]))])put('capture/base-NS/'+x,[x-20,fork.baseRearYMm,20,40,fork.frontFootYMm-fork.baseRearYMm,40])
  for(const y of[fork.baseRearYMm,fork.frontFootYMm])put('capture/base-EW/'+y,[x0,y-20,20,x1-x0,40,40])
  for(const x of fork.axisXMm){
   put('capture/lift-column/'+x,[x-20,fork.rootYMm-20,60,40,40,fork.liftColumnTopMm-60])
   put('capture/fork/'+x,[x-fork.widthMm/2,fork.rearTipYMm,fork.bottomMm,fork.widthMm,fork.rootYMm-fork.rearTipYMm,fork.depthMm])

  }
  for(const y of c.headTrackYMm)put('capture/fork/crossbearer/'+y,[fork.crossbearerXExtentMm[0],y-fork.widthMm/2,fork.bottomMm,fork.crossbearerXExtentMm[1]-fork.crossbearerXExtentMm[0],fork.widthMm,fork.depthMm])
  put('capture/column-cross-brace',[Math.min(...fork.axisXMm),fork.rootYMm-20,480,Math.max(40,Math.max(...fork.axisXMm)-Math.min(...fork.axisXMm)),40,40])
  const hand=c.rollingOperator!.handleInitialMm
  put('capture/rolling-handle-column',[hand[0]-10,hand[1]-10,60,20,20,hand[2]-60],[],true)
  put('capture/rolling-handle-base',[hand[0],hand[1]-10,30,Math.min(...c.postsXYMm.map(p=>p[0]))-hand[0],20,20],[],true)
 }
 const candidateFrame=frame.map(q=>{
  if(!q.id.includes(' rail '))return q
  const b=q.boxMm,EW=b[3]>b[4]
  return{...q,boxMm:(EW?[b[0]+20+j.memberEndGapMm,b[1],b[2],b[3]-40-2*j.memberEndGapMm,b[4],b[5]]:[b[0],b[1]+20+j.memberEndGapMm,b[2],b[3],b[4]-40-2*j.memberEndGapMm,b[5]]) as B}
 }),candidateById=new Map(candidateFrame.map(q=>[q.id,q])),
 interfaces=rails.flatMap(q=>{
  const b=q.boxMm,EW=b[3]>b[4],axis=EW?'EW':'NS',upper=b[2]>500,axisIndex=EW?0:1,
   ends=[b[axisIndex],b[axisIndex]+b[axisIndex+3]]
  return ends.map((a,k)=>{
   const centre:P=EW?[a,b[1]+b[4]/2,b[2]+b[5]/2]:[b[0]+b[3]/2,a,b[2]+b[5]/2],
    leg=legs.reduce((best,v)=>Math.hypot(v.boxMm[0]+20-centre[0],v.boxMm[1]+20-centre[1])<Math.hypot(best.boxMm[0]+20-centre[0],best.boxMm[1]+20-centre[1])?v:best,legs[0]),
    face=leg.boxMm[axisIndex]+(k===0?40:0),sign=k===0?1:-1,
    seat:B=EW?[k===0?face:face-j.gravitySeatLengthMm,b[1],b[2]-j.gravitySeatThicknessMm,j.gravitySeatLengthMm,b[4],j.gravitySeatThicknessMm]:
     [b[0],k===0?face:face-j.gravitySeatLengthMm,b[2]-j.gravitySeatThicknessMm,b[3],j.gravitySeatLengthMm,j.gravitySeatThicknessMm],
    id=q.id+'/end/'+k,proposedMemberCutBoxMm=candidateById.get(q.id)!.boxMm,
    boltCentresMm=[0,1].map(n=>{
     const along=face+sign*(j.memberEndGapMm+j.boltFirstFromCutMm+n*j.boltPitchMm)
     return(EW?[along,b[1]+b[4]/2,seat[2]-j.boltHeadHeightMm]:[b[0]+b[3]/2,along,seat[2]-j.boltHeadHeightMm]) as P
    }),
    bossBoxesMm=boltCentresMm.map(p=>[p[0]-j.captiveBossDiameterMm/2,p[1]-j.captiveBossDiameterMm/2,b[2],j.captiveBossDiameterMm,j.captiveBossDiameterMm,j.captiveBossHeightMm] as B)
   put(id+'/gravity-seat',seat,[q.id,leg.id])
   for(const[n,p]of boltCentresMm.entries()){
    put(id+'/upward-bolt-head/'+n,[p[0]-j.boltHeadAFMm/2,p[1]-j.boltHeadAFMm/2,p[2],j.boltHeadAFMm,j.boltHeadAFMm,j.boltHeadHeightMm],[q.id,leg.id])
    put(id+'/upward-bolt-shank/'+n,[p[0]-j.boltDiameterMm/2,p[1]-j.boltDiameterMm/2,seat[2],j.boltDiameterMm,j.boltDiameterMm,j.gravitySeatThicknessMm+j.minimumThreadEngagementMm],[q.id,leg.id])
    put(id+'/captive-reinforced-boss/'+n,bossBoxesMm[n],[q.id,leg.id])
   }
   return{id,railId:q.id,legId:leg.id,axis,upper,proposedMemberCutBoxMm,sourceIASFrameStillCentrelineComparator:true,seatMm:seat,receiverPlateMm:null,boltCentresMm,bossBoxesMm,boltAxisMm:[0,0,1] as P,boltDiameterMm:j.boltDiameterMm,seatTravelsWithCapturedRail:j.seatTravelsWithCapturedRail,requiredMemberEndGapMm:j.memberEndGapMm,
    connectionMethod:j.connectionMethod,seatBearingLengthMm:j.gravitySeatLengthMm-j.memberEndGapMm,boltsPerInterface:2,seatReferenceDemandN:2000,receiverWebAndWeldGeometryComplete:false,actualBoltToolAndJointResistanceAccepted:false}
  })
 })
 const retiredCentrelineSeatChecks=hardware.filter(q=>q.id.includes('/gravity-seat')).flatMap(q=>frame.filter(v=>!q.mates.includes(v.id)).map(v=>({id:q.id+'/'+v.id,reserveMm:gap(q.boxMm,v.boxMm)-two})))

 const washer=source.services.utility.washerFirstRest,
  fixed=[...source.rearTreeContext.obstacles.filter(q=>q.presence!=='carry-bar-after-park'&&q.presence!=='head-before-strip'&&q.id!=='source-washer-home').map(q=>candidateById.has(q.id)?{...q,boxMm:candidateById.get(q.id)!.boxMm}:q),
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

 const rejectedWholeHeadMotionChecks:{id:string;phase:string;reserveMm:number}[]=[]
 for(const p of headParts){
  compare(p.id,sweep(p.boxMm,[0,0,0],[0,0,c.firstLiftMm]),'head-first-lift',[...frameMates,...portMates])
  if(i.mode==='fork'){
   compare(p.id,sweep(p.boxMm,[0,0,c.firstLiftMm],[0,0,c.liftMm]),'head-raised-static',[...portMates])
   const n=rows.length
   compare(p.id,sweep(p.boxMm,[0,0,c.liftMm],[-c.westTransferMm,0,c.liftMm]),'rejected-whole-head-west',portMates)
   rejectedWholeHeadMotionChecks.push(...rows.splice(n))
  }else{
   const rearRail='IAS/frame/EW rail at y750 / z850'
   compare(p.id,sweep(p.boxMm,[0,0,c.firstLiftMm],[0,-c.southClearanceMm,c.firstLiftMm]),'head-south-clearance',[rearRail,...portMates])
   compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.firstLiftMm],[0,-c.southClearanceMm,c.liftMm]),'head-remaining-lift',[rearRail,...portMates])
   compare(p.id,sweep(p.boxMm,[0,-c.southClearanceMm,c.liftMm],[-c.westTransferMm,-c.southClearanceMm,c.liftMm]),'head-west',portMates)
  }
 }


 const movingFrameBlockedControl:{id:string;phase:string;reserveMm:number}[]=[]
 let forkDeflectionMm=0,forkTorsionCoverMm=0,forkTorsionNmm=0,forkTorsionTwistRad=0,forkTorsionShearMPa=0
 if(i.mode==='fork'){
  const fk=c.fork!,W=c.maximumCapturedWetHeadKg*9.81*1.5,L=fk.rootYMm-fk.rearTipYMm
  forkDeflectionMm=W*L**3/(3*193000*fk.minimumIMM4)
  const cg=c.headCGPlanDesignMm,ecc=Math.max(Math.abs(cg[0]-two-fk.axisXMm[0]),Math.abs(cg[0]+cg[2]+two-fk.axisXMm[0])),G=193000/(2*(1+fk.poissonRatio))
  forkTorsionNmm=W*ecc;forkTorsionTwistRad=forkTorsionNmm*L/(G*fk.minimumTorsionalJMm4)
  forkTorsionCoverMm=Math.max(...fk.crossbearerXExtentMm.map(x=>Math.abs(x-fk.axisXMm[0])))*forkTorsionTwistRad
  forkTorsionShearMPa=forkTorsionNmm/(2*fk.meanClosedAreaMm2*fk.minimumClosedWallMm)
  for(const q of hardware.filter(v=>v.id.startsWith('capture/'))){
   const raised=q.id.startsWith('capture/fork/')||q.id.startsWith('capture/bearing/')?c.liftMm:0,
    b=sweep(q.boxMm,[0,0,raised],[-c.westTransferMm,0,raised]),
    count=rows.length
   compare(q.id+'/moving',b,'fork-trolley-west',c.fullDryFrameKnockedDownWhileHeadCapturedBeforeWestMovement?frame.map(v=>v.id):[])
   if(q.id.startsWith('capture/fork/'))for(const row of rows.slice(count))row.reserveMm-=forkDeflectionMm+forkTorsionCoverMm
   rejectedWholeHeadMotionChecks.push(...rows.splice(count))
   for(const v of frame)movingFrameBlockedControl.push({id:q.id+'/'+v.id,phase:'whole-frame-left-standing-rejected-control',reserveMm:gap(b,v.boxMm)-two})
  }
 }

 const rollingChecks:{id:string;phase:string;reserveMm:number}[]=[]
 if(i.mode==='fork'){
  for(const row of rows)if(row.phase==='temporary-and-end-hardware'&&row.id.startsWith('capture/fork/'))row.reserveMm-=forkDeflectionMm+forkTorsionCoverMm
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
  rejectedWholeHeadMotionChecks.push(...rollingChecks)
 }

 const braceSource=(d as unknown as{frameRenewal:{temporaryBracing:{schema:string;crossMm:number;minimumAreaMm2:number;minimumIMM4:number;maximumUnbalancedHorizontalComparisonN:number;members:readonly{id:string;endsMm:readonly[P,P];mateFrameIds:readonly string[]}[];clevisEnvelopeMm:P;pinDiameterMm:number}}}).frameRenewal.temporaryBracing,
  braceChecks:{id:string;phase:string;reserveMm:number}[]=[],braceDemands:{id:string;lengthMm:number;axialComparisonN:number;eulerPinnedN:number;axialMPa:number}[]=[]
 if(braceSource?.schema!=='had-utility-temporary-pinned-braces/1'||braceSource.members.length<3||braceSource.crossMm<20)throw Error('Actual finite temporary brace source required')
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
 add('head-required-positive-capture-before-rear-rail','gravity',(i.mode==='fork'?c.firstLiftMm>=wet.hot.headFirstRelease.thenCapturedSpoolUpMm+two:c.rearUpperRailReleasedOnlyAfterPositiveCaptureAndFirstLift&&c.firstLiftMm>=35)&&c.jointJacketsStrippedLengthMm>=100?0:-1)


 const waste=inletUtilityHeadWaste({source,wet})
 const frontRailTools:{id:string;reserveMm:number}[]=[],frontRailToolTasks:{id:string;shoulderMm:P;workingGripMm:P;steadyGripMm:P;socketMm:readonly[P,P];ratchetMm:readonly[P,P]}[]=[]
 for(const end of interfaces.filter(p=>p.railId==='IAS/frame/EW rail at y1350 / z850'))for(const p of end.boltCentresMm)for(let sectorIndex=0;sectorIndex<=16;sectorIndex++){
  const theta=(j.ratchetWorkingSectorDegrees[0]+(j.ratchetWorkingSectorDegrees[1]-j.ratchetWorkingSectorDegrees[0])*sectorIndex/16)*Math.PI/180,
   sectorCoverMm=j.ratchetHandleNorthMm*(1-Math.cos(Math.abs(j.ratchetWorkingSectorDegrees[1]-j.ratchetWorkingSectorDegrees[0])*Math.PI/180/32)),
   root:P=[p[0],p[1],p[2]-j.minimumSocketExtensionMm],grip:P=[p[0]+j.ratchetHandleNorthMm*Math.sin(theta),p[1]+j.ratchetHandleNorthMm*Math.cos(theta),root[2]],
   steady:P=[p[0]+j.steadyHandNorthMm*Math.sin(theta),p[1]+j.steadyHandNorthMm*Math.cos(theta),root[2]],shoulder=j.frontToolShoulderMm,segments:readonly(readonly[P,P])[]=[[p,root],[root,grip]],
   target=end.id+'/'+p[0]+'/sector/'+sectorIndex
  frontRailToolTasks.push({id:target,shoulderMm:shoulder,workingGripMm:grip,steadyGripMm:steady,socketMm:segments[0],ratchetMm:segments[1]})
  for(const[hand,g]of[['working',grip],['steady',steady]] as const)frontRailTools.push({id:target+'/'+hand+'-reach',reserveMm:600-Math.hypot(...g.map((v,k)=>v-shoulder[k]))})
  const foreign=[...fixed,...cold,...hot,...waste.parts.map(q=>({id:q.id,boxMm:q.boxMm})),...hardware.filter(q=>!q.afterFrameKnockdown&&!q.id.startsWith(end.id+'/'))]
  for(const q of foreign)if(![end.railId,end.legId].includes(q.id)){
   for(const[hand,g]of[['working',grip],['steady',steady]] as const)frontRailTools.push({id:target+'/'+hand+'-arm/'+q.id,reserveMm:exactSegmentBoxDistance(shoulder,g,q.boxMm)-40-sectorCoverMm-two})
   for(const[part,seg]of segments.entries())frontRailTools.push({id:target+'/socket-ratchet/'+part+'/'+q.id,reserveMm:exactSegmentBoxDistance(...seg,q.boxMm)-j.maximumSocketRadiusMm-sectorCoverMm-two})
  }
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++){
   for(const[hand,g]of[['working',grip],['steady',steady]] as const)frontRailTools.push({id:target+'/'+hand+'-arm/'+q.id+'/'+k,reserveMm:segmentDistance(shoulder,g,q.pointsMm[k-1],q.pointsMm[k])-40-q.radiusWithSupportsMm-sectorCoverMm-two})
   for(const[part,seg]of segments.entries())frontRailTools.push({id:target+'/socket-ratchet/'+part+'/'+q.id+'/'+k,reserveMm:segmentDistance(...seg,q.pointsMm[k-1],q.pointsMm[k])-j.maximumSocketRadiusMm-q.radiusWithSupportsMm-sectorCoverMm-two})
  }
  for(const br of braceSource.members){
   for(const[hand,g]of[['working',grip],['steady',steady]] as const)frontRailTools.push({id:target+'/'+hand+'-arm/'+br.id,reserveMm:segmentDistance(shoulder,g,...br.endsMm)-40-braceSource.crossMm/2-sectorCoverMm-two})
   for(const[part,seg]of segments.entries())frontRailTools.push({id:target+'/socket-ratchet/'+part+'/'+br.id,reserveMm:segmentDistance(...seg,...br.endsMm)-j.maximumSocketRadiusMm-braceSource.crossMm/2-sectorCoverMm-two})
  }
 }
 const toolFloor=j.frontToolBodyFloorXYMm,bodyA:P=[toolFloor[0],toolFloor[1],0],bodyB:P=[toolFloor[0],toolFloor[1],2000]
 frontRailTools.push({id:'front-upper-rail/shoulder-within-actual-body',reserveMm:300-Math.hypot(j.frontToolShoulderMm[0]-toolFloor[0],j.frontToolShoulderMm[1]-toolFloor[1])})
 for(const q of [...fixed,...cold,...hot,...waste.parts.map(q=>({id:q.id,boxMm:q.boxMm})),...hardware.filter(q=>!q.afterFrameKnockdown)])frontRailTools.push({id:'front-upper-rail/body/'+q.id,reserveMm:exactSegmentBoxDistance(bodyA,bodyB,q.boxMm)-300-two})
 frontRailTools.push({id:'front-upper-rail/real-upward-captive-boss-requirement',reserveMm:j.connectionMethod==='gravity-seat-upward-M8-into-reinforced-captive-rail-boss'?0:-1})

 const outletSource=(d.prefabSinkHead as unknown as{maximumOutletBoreMm:readonly[number,number];mixing:string}),
  airGapChecks=d.prefabSinkHead.spoutOutletsMm.map((p,k)=>({id:'head/independent-outlet-airgap/'+k,phase:'normal-head-airgap',reserveMm:p[2]-d.prefabSinkHead.floodRimMm-two-2*outletSource.maximumOutletBoreMm[k]})),
  separation=Math.hypot(...d.prefabSinkHead.spoutOutletsMm[0].map((v,k)=>v-d.prefabSinkHead.spoutOutletsMm[1][k]))-c.maximumSpoutCrossMm-two,
  independentHeadPressureComponents=[{id:'U/head-cold-pillar',inletMm:d.prefabSinkHead.coldPortMm,outletMm:d.prefabSinkHead.spoutOutletsMm[0]},{id:'P/head-hot-pillar',inletMm:d.prefabSinkHead.hotPortMm,outletMm:d.prefabSinkHead.spoutOutletsMm[1]}]
 airGapChecks.push({id:'head/no-mixer-bridge-independent-spout-bodies',phase:'normal-head-airgap',reserveMm:outletSource.mixing==='only in open bowl'?separation:-1})
 normalHeadChecks.push(...airGapChecks)
 const raisedHeadClearanceChecks:{id:string;reserveMm:number}[]=[]
 for(const p of headParts)for(const q of hot.filter(v=>v.id!=='U/hot/source-fixed-union')){
  const up=wet.hot.headFirstRelease.thenCapturedSpoolUpMm,north=wet.hot.headFirstRelease.thenSpoolNorthMm,
   moved:B=[q.boxMm[0],q.boxMm[1],q.boxMm[2]+up,q.boxMm[3],q.boxMm[4]+north,q.boxMm[5]],
   raised:B=[p.boxMm[0],p.boxMm[1],p.boxMm[2]+c.liftMm,p.boxMm[3],p.boxMm[4],p.boxMm[5]]
  raisedHeadClearanceChecks.push({id:p.id+'/'+q.id,reserveMm:gap(raised,moved)-two})
 }
 normalHeadChecks.push(...waste.checks.filter(q=>q.phase==='normal-waste'))
 for(const q of hardware.filter(p=>!p.afterFrameKnockdown))for(const p of waste.parts){
  const reserve=p.segmentMm?exactSegmentBoxDistance(p.segmentMm[0],p.segmentMm[1],q.boxMm)-p.radiusMm!-two:gap(q.boxMm,p.boxMm)-two
  rows.push({id:q.id+'/'+p.id,phase:q.id.startsWith('capture/')?'static-capture-versus-waste':'permanent-joint-versus-waste',reserveMm:reserve-(q.id.startsWith('capture/fork/')?forkDeflectionMm+forkTorsionCoverMm:0)})
 }
 const jointVsReceiverChecks=hardware.filter(p=>!p.id.startsWith('capture/')&&!p.afterFrameKnockdown).map(q=>({id:q.id+'/controlled-waste-receiver',phase:'drain-before-capture-actual-frame-joints',reserveMm:gap(q.boxMm,(d as unknown as{wasteService:WasteControls}).wasteService.receiverOuterMm)-two}))
 rows.push(...jointVsReceiverChecks)
 const retainedWasteParts=waste.parts.filter(p=>!p.id.startsWith('waste/drain-dry-extension/')),
  spoolVsWasteChecks:{id:string;reserveMm:number}[]=[]
 for(const q of hot.filter(p=>p.id!=='U/hot/source-fixed-union')){
  const up=wet.hot.headFirstRelease.thenCapturedSpoolUpMm,north=wet.hot.headFirstRelease.thenSpoolNorthMm,
   b:B=[q.boxMm[0],q.boxMm[1],q.boxMm[2]+up,q.boxMm[3],q.boxMm[4]+north,q.boxMm[5]]
  for(const p of retainedWasteParts)spoolVsWasteChecks.push({id:q.id+'/'+p.id,reserveMm:p.segmentMm?exactSegmentBoxDistance(p.segmentMm[0],p.segmentMm[1],b)-p.radiusMm!-two:gap(b,p.boxMm)-two})
 }
 raisedHeadClearanceChecks.push(...spoolVsWasteChecks,...waste.dryRodRelease.checks)

 const H=c.externalHorizontalComparisonN,W=c.maximumCapturedWetHeadKg*9.81*1.5,span=x1-x0,gravityBeamMoment=i.mode==='fork'?W*(c.fork!.rootYMm-c.fork!.rearTipYMm):W*span/4,
  referenceDepth=i.mode==='fork'?c.fork!.depthMm:s,referenceI=i.mode==='fork'?c.fork!.minimumIMM4:c.minimumSectionIMm4,
  steelLengthMm=i.mode==='fork'?2*(c.fork!.frontFootYMm-c.fork!.baseRearYMm)+2*(x1-x0)+2*(c.fork!.liftColumnTopMm-60)+2*(c.fork!.rootYMm-c.fork!.rearTipYMm)+Math.max(...c.fork!.axisXMm)-Math.min(...c.fork!.axisXMm):4*z+2*(x1-x0)+2*(y1-y0)+c.headTrackYMm.length*(x1-x0),
  massUpperKg=steelLengthMm*c.maximumSectionAreaMm2/1e9*c.maximumSteelDensityKgM3,
  geometryFailures=rows.filter(q=>q.phase!=='gravity'&&q.reserveMm< -1e-7),gravityFailures=rows.filter(q=>q.phase==='gravity'&&q.reserveMm< -1e-7)
 return{schema:'had-utility-ordinary-head-capture/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,context:source.rearTreeContext,frame:source.host.geometry.frame,activePaths:source.route.paths,choice:wet.choice,controls:c,joints:j}),
  controls:c,waste,airGap:{checks:airGapChecks,netLipToFloodRimMm:d.prefabSinkHead.spoutOutletsMm.map(p=>p[2]-d.prefabSinkHead.floodRimMm-two),requiredTwoOutletBoresMm:outletSource.maximumOutletBoreMm.map(v=>2*v),independentHeadPressureComponents,sinkReservoirBackfeedGeometricallyExcluded:airGapChecks.every(q=>q.reserveMm>=0),actualProductBoresAndPhysicalBackfeedQualification:false},raisedHeadClearanceChecks,frontUpperRailTools:{tasks:frontRailToolTasks,checks:frontRailTools,failures:frontRailTools.filter(q=>q.reserveMm<0),actualBoltSleeveWeldAndLoadedRemovalQualified:false},rejectedWholeHeadMotion:{role:'historical stress only; ordinary work keeps head captured on original plan',checks:rejectedWholeHeadMotionChecks,failures:rejectedWholeHeadMotionChecks.filter(q=>q.reserveMm<0)},normalHeadChecks,normalHeadFailures:normalHeadChecks.filter(q=>q.reserveMm< -1e-7),normalCompleteHeadNecessary:normalHeadChecks.every(q=>q.reserveMm>=-1e-7),mode:i.mode,temporaryBracing:{source:braceSource,checks:braceChecks,failures:braceChecks.filter(q=>q.reserveMm<0),demands:braceDemands,actualPinSleeveHSSWallAndFloorResistanceQualified:false},rollingOperator:{checks:rollingChecks,failures:rollingChecks.filter(q=>q.reserveMm<0),actualHumanForceAndCasterRollingQualified:false},movingFrameBlockedControl,forkReference:{maximumOneForkDynamicN:c.maximumCapturedWetHeadKg*9.81*1.5,deflectionMm:forkDeflectionMm,torsionalMomentNmm:forkTorsionNmm,torsionalTwistRad:forkTorsionTwistRad,torsionalCoverMm:forkTorsionCoverMm,totalElasticEnvelopeCoverMm:forkDeflectionMm+forkTorsionCoverMm,torsionalShearMPa:forkTorsionShearMPa,requiresPositiveAntiRollGuide:true,actualSectionAndGuideCapacityQualified:false},earliestTools:{checks:earliestToolChecks,failures:earliestToolChecks.filter(q=>q.reserveMm<0),frontRailRemovedBeforeNorthToolsRequired:true,headToolAperturesOrActualJawFlatDatumsAuthored:true},slings:{checks:slingChecks,active:i.mode==='gantry',minimumEachResultantN:Math.hypot(W,W*c.southClearanceMm/(z-c.liftingEyesMm[0][2]-c.liftMm)),actualHoistGuidesAndSideShiftMechanismQualified:false},phase:'washer-first-rest; LodgeU/H0/localcutsverifiedzero; source740andH0365drained; matchedheadunionjacketsstripped',
  hardware,interfaces,candidateFrame,retiredCentrelineSeatControl:{role:'rejected original centreline-length stock; candidate bolted rails use explicit finite cuts',checks:retiredCentrelineSeatChecks,failures:retiredCentrelineSeatChecks.filter(q=>q.reserveMm<0)},headParts,checks:rows,geometryFailures,gravityFailures,necessaryGravityGeometry:geometryFailures.length===0&&gravityFailures.length===0,
  sequence:i.mode==='fork'?[
   'Close actual LodgeU/H0/local source cuts, cool, verify zero pressure and drain through the source-derived1550 high vent/740 controlled cold drain and365 hot drain. Neither head union nor a later blank establishes isolation.',
   'Park washer at its actual first rest. Seat the low floor trolley; engage four positive factory under-bowl capture ribs and take full head gravity load BEFORE releasing a loaded rail. Independent water supports remain made.',
   'Install the actual two-plane temporary frame bracing and positive locating/hold-down interface; its physical floor resistance remains unqualified. Capture and unbolt only the FRONT upper rail to expose north-side head union tools.',
   'Counterhold the complete820 pressure unions at804/836mm flats with stripped joint jackets. Capture and disconnect the actual sink waste/trap joint too; use the visible source-owned closed waste backfeed cut, controlled receiver and top-accessed captive blind/flange protocol.',
   'Raise the captured whole head by the selected65mm first clearance, then continue straight to380mm. The below-face AF24 half remains with the spool and above-face counterpart with the head. The two actual board rectangles with one60x60NW service corner clear H0; no SOUTH shift or rear-rail-first manoeuvre is required.',
   'With the complete head captured HIGH at the original plan and water/waste independently supported, capture and renew the remaining seven dry rails and four legs individually underneath. Complete web/tool/bracing/extraction qualification remains false; no assembled-frame or whole-head withdrawal is required.',
   'Keep the complete head captured HIGH on its original plan while renewing dry members and the hot spool. WEST/SOUTH whole-head transfer is only a rejected historical stress comparison. The200N adverse horizontal/floor reaction remains an unresolved comparison.',
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
   captureGeometryChecks:[...rows.filter(q=>q.id.startsWith('capture/')&&(q.phase==='temporary-and-end-hardware'||q.phase==='static-capture-versus-waste')),...braceChecks],gravityChecks:rows.filter(q=>q.phase==='gravity'),
   headReleaseAndRestChecks:i.mode==='gantry'?[...rows.filter(q=>q.phase.startsWith('head-'))]:[],raisedHeadClearanceChecks:[...frontRailTools,...rows.filter(q=>q.phase==='head-first-lift'||q.phase==='head-raised-static'),...raisedHeadClearanceChecks],isolationAndDrainChecks:[...waste.isolationAndDrainChecks,...waste.checks.filter(q=>q.phase==='normal-waste'),...jointVsReceiverChecks],
   fullHeadDynamicN:W,eachEyeAndHoistMinimumVerticalDemandN:W,referenceBeamStressMPa:Math.hypot(gravityBeamMoment*referenceDepth/2/referenceI,Math.sqrt(3)*forkTorsionShearMPa),referenceAllowableMPa:200/1.5,
   actualPhysicalHandlingFloorAndInstalledAcceptance:false as const},
  ordinaryRenewalAccepted:false,
  diagnostics:[...(geometryFailures.length?['UTILITY_CAPTURE/actual-head-hardware-or-retained-service-geometric-conflicts']:[]),'UTILITY_CAPTURE/horizontal200N-needs-real-positive-floor-reaction-not-friction',
   'UTILITY_CAPTURE/factory-head-eyes-mass-CG-and-hoists-not-physically-qualified','UTILITY_CAPTURE/member-webs-full-tool-and-member-extraction-proofs-incomplete']}
}

/** Schematic uses the same actual solid rectangles and foot/member shapes as
 * the numeric observer. It does not imply a structural/handling admission. */
export function utilityOrdinaryHeadPlanSvg(r:ReturnType<typeof inletUtilityOrdinaryCapture>){
 const esc=(v:string)=>v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;'),
  rect=(id:string,b:readonly number[],colour:string)=>'<rect data-part="'+esc(id)+'" x="'+b[0]+'" y="'+b[1]+'" width="'+b[3]+'" height="'+b[4]+'" fill="'+colour+'" fill-opacity=".38" stroke="'+colour+'" stroke-width="3"/>',
  head=r.headParts.filter(q=>q.id.startsWith('head/board/')||q.id==='head/bowl'),
  normal=head.map(q=>rect(q.id,q.boxMm,q.id==='head/bowl'?'#377c95':'#8c621d')).join(''),
  captured=head.map(q=>rect(q.id+'/captured',q.boxMm,q.id==='head/bowl'?'#377c95':'#8c621d')).join(''),
  trolley=r.hardware.filter(q=>q.id.startsWith('capture/')&&!q.afterFrameKnockdown).map(q=>rect(q.id,q.boxMm,'#685397')).join(''),
  waste=r.waste.parts.map(q=>rect(q.id,q.boxMm,'#478567')).join('')
 return'<svg xmlns="http://www.w3.org/2000/svg" viewBox="9300 400 4800 2100"><rect x="9300" y="400" width="4800" height="2100" fill="white"/><text x="9400" y="490" font-size="36">Normal occupied head: real source solids</text>'+normal+waste+'<g transform="translate(2400 0)"><text x="9400" y="490" font-size="36">STATIC captured head +'+r.controls.liftMm+'mm</text>'+captured+trolley+waste+'</g><text x="9400" y="2230" font-size="27">One60x60NW service corner; individual bolted members and hot spool renew underneath</text><text x="9400" y="2280" font-size="27">WEST/SOUTH whole-head transfer is a historical failed control; qualification incomplete</text></svg>'
}

type WasteControls={
 schema:string;bowlWallMm:number;headFixingCount:number;headFixingDiameterMm:number;maximumHeadFixingTorqueNm:number;headOutletMm:P;bowlOutletHoleMm:number;topAccessFixingRadiusMm:number;headFlangeMm:readonly[number,number];fixedNeckMm:readonly[number,number];
 neckVirtualMm:readonly P[];neckRadiusMm:number;potBoxMm:B;minimumWaterSealMm:number;outfallVirtualMm:readonly P[];outfallRadiusMm:number;
 maximumTubeODMm:number;minimumTubeODMm:number;minimumWallMm:number;minimumClearBoreAfterFormingMm:number;
 serviceCut:{id:string;pathIndex:number;axisXMm:number;completeFaceMm:number;bareCrossMm:number;controlNorthYMm:number;maximumDryStemDiameterMm:number;minimumPressureDifferentialPa:number};
 captiveHeadBlind:{id:string;maximumODMm:number;bottomMm:number;heightMm:number;installedAfterCutClosedAndFiniteDrainBeforeHeadRelease:boolean};
 drainPathMm:readonly P[];drainValve:{axisMm:P;faceMm:number;bareCrossMm:number;controlMm:P;maximumDryStemDiameterMm:number;maximumOrificeMm:number;removableDryExtension:{id:string;fixedStubTopMm:number;releaseUpMm:number;northToRestMm:number;restBottomMm:P;maximumDryKg:number;actualKeeperAndPhysicalHandlingQualified:false}};
 receiverOuterMm:B;maximumReceiverWallMm:number;minimumVerifiedUsableL:number;maximumPartialBatchL:number;maximumBowlResidualBeforeWasteCutL:number;maximumCapturedHeadResidualL:number;
 tool:{headShoulderMm:P;headGripYMm:number;headGripZMm:number;maximumShaftRadiusMm:number;minimumWorkingLengthMm:number;minimumUniversalAngleDegrees:number;cutShoulderMm:P;drainShoulderMm:P;bodyFloorXYMm:readonly[number,number];maximumReachMm:number};
 normalDesignWaterC:number;maintenanceMaximumC:number;designFaultWaterC:number;actualFactoryTrapSealStrainerBlankTubeToolsMaterialAndRetainedCapMatchQualified:false
}
/** Source-owned visible waste branch. Geometry and full external water bounds,
 * including a real backfeed service cut, not an assumed harmless open sewer. */
export function inletUtilityHeadWaste(i:{source:Source;wet:Wet}){
 const {source,wet}=i,d=wet.choice.coldDistribution,w=(d as unknown as{wasteService:WasteControls}).wasteService,two=2*source.rearTreeContext.settingEachMm
 if(w?.schema!=='had-utility-visible-metal-waste/1'||w.actualFactoryTrapSealStrainerBlankTubeToolsMaterialAndRetainedCapMatchQualified!==false||w.minimumClearBoreAfterFormingMm<=0||w.minimumVerifiedUsableL<=0||two!==20)throw Error('Actual visible metal waste source required')
 const parts:{id:string;boxMm:B;segmentMm?:readonly[P,P];radiusMm?:number;headMate:boolean;waterUpperL:number}[]=[],
  checks:{id:string;phase:string;reserveMm:number}[]=[],add=(id:string,phase:string,reserveMm:number)=>checks.push({id,phase,reserveMm}),
  box=(p:P,s:P):B=>[p[0]-s[0]/2,p[1]-s[1]/2,p[2]-s[2]/2,...s],
  length=(a:P,b:P)=>Math.hypot(...b.map((v,k)=>v-a[k])),
  shaft=(a:P,b:P,r:number):B=>{const L=length(a,b),v=b.map((n,k)=>(n-a[k])/L),q=v.map(n=>r*Math.sqrt(Math.max(0,1-n*n)));return[a[0]-q[0]+Math.min(0,b[0]-a[0]),a[1]-q[1]+Math.min(0,b[1]-a[1]),a[2]-q[2]+Math.min(0,b[2]-a[2]),Math.abs(b[0]-a[0])+2*q[0],Math.abs(b[1]-a[1])+2*q[1],Math.abs(b[2]-a[2])+2*q[2]]},
  put=(id:string,b:B,headMate=false,water=true)=>parts.push({id,boxMm:b,headMate,waterUpperL:water?b[3]*b[4]*b[5]/1e6:0}),
  pipe=(id:string,points:readonly P[],radius:number,error=0)=>points.slice(1).forEach((b,k)=>{const a=points[k];parts.push({id:id+'/'+k,boxMm:shaft(a,b,radius+error),segmentMm:[a,b],radiusMm:radius+error,headMate:false,waterUpperL:Math.PI*radius**2*length(a,b)/1e6})}),
  outlet=w.headOutletMm,neck=finiteBends(w.neckVirtualMm,w.neckRadiusMm,1),outfall=finiteBends(w.outfallVirtualMm,w.outfallRadiusMm,1),
  cap=source.host.revisedUtility.retainedWasteCap as B,capAxis:P=[cap[0]+cap[3]/2,cap[1]+cap[4]/2,cap[2]+cap[5]],
  R=w.maximumTubeODMm/2
 put('waste/head-underflange',[outlet[0]-w.headFlangeMm[0]/2,outlet[1]-w.headFlangeMm[0]/2,outlet[2]-w.headFlangeMm[1],w.headFlangeMm[0],w.headFlangeMm[0],w.headFlangeMm[1]],true)
 put('waste/fixed-strainer-neck',[outlet[0]-w.fixedNeckMm[0]/2,outlet[1]-w.fixedNeckMm[0]/2,w.neckVirtualMm[0][2],w.fixedNeckMm[0],w.fixedNeckMm[0],w.fixedNeckMm[1]],true)
 pipe('waste/factory-neck',neck.path as P[],R,neck.hausdorffError);put('waste/visible-pot',w.potBoxMm)
 pipe('waste/factory-outfall',outfall.path as P[],R,outfall.hausdorffError)
 const a=w.outfallVirtualMm[0],b=w.outfallVirtualMm[1],t=(w.serviceCut.axisXMm-a[0])/(b[0]-a[0]),cutAxis:P=[w.serviceCut.axisXMm,a[1],a[2]+t*(b[2]-a[2])],
  unit=b.map((v,k)=>(v-a[k])/length(a,b)) as unknown as P,
  cutA=cutAxis.map((v,k)=>v-unit[k]*w.serviceCut.completeFaceMm/2) as unknown as P,cutB=cutAxis.map((v,k)=>v+unit[k]*w.serviceCut.completeFaceMm/2) as unknown as P,
  cutGrip:P=[cutAxis[0],w.serviceCut.controlNorthYMm,cutAxis[2]]
 put('waste/complete-backfeed-cut',shaft(cutA,cutB,w.serviceCut.bareCrossMm/2))
 pipe('waste/backfeed-cut-dry-rod',[cutAxis,cutGrip],w.serviceCut.maximumDryStemDiameterMm/2)
 pipe('waste/controlled-drain',w.drainPathMm,6.5)
 put('waste/drain-valve',box(w.drainValve.axisMm,[w.drainValve.bareCrossMm,w.drainValve.bareCrossMm,w.drainValve.faceMm]))
 pipe('waste/drain-fixed-stub',[w.drainValve.axisMm,[w.drainValve.axisMm[0],w.drainValve.axisMm[1],w.drainValve.removableDryExtension.fixedStubTopMm]],w.drainValve.maximumDryStemDiameterMm/2)
 pipe('waste/drain-dry-extension',[[w.drainValve.axisMm[0],w.drainValve.axisMm[1],w.drainValve.removableDryExtension.fixedStubTopMm],w.drainValve.controlMm],w.drainValve.maximumDryStemDiameterMm/2)
 const blind=w.captiveHeadBlind,blindBox:B=[outlet[0]-blind.maximumODMm/2,outlet[1]-blind.maximumODMm/2,blind.bottomMm,blind.maximumODMm,blind.maximumODMm,blind.heightMm]
 put('waste/captive-head-blind',blindBox,true,false)
 const fixed=source.rearTreeContext.obstacles.filter(q=>q.presence!=='carry-bar-after-park'&&q.presence!=='head-before-strip'),
  foreign=[...fixed,...wet.cold.geometry.parts.filter(q=>!q.cap).map(q=>({id:'cold/'+q.id,boxMm:q.wrapped})),...wet.hot.normalPermanentEnvelopes],
  distance=(p:typeof parts[number],q:B)=>p.segmentMm?exactSegmentBoxDistance(p.segmentMm[0],p.segmentMm[1],q)-p.radiusMm!:gap(p.boxMm,q)
 for(const p of parts){
  for(const q of foreign){if(q.boxMm.every((v,k)=>Math.abs(v-cap[k])<1e-7))continue;add(p.id+'/'+q.id,'normal-waste',distance(p,q.boxMm)-two)}
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)add(p.id+'/'+q.id+'/'+k,'normal-waste',p.segmentMm?segmentDistance(...p.segmentMm,q.pointsMm[k-1],q.pointsMm[k])-p.radiusMm!-q.radiusWithSupportsMm-two:exactSegmentBoxDistance(q.pointsMm[k-1],q.pointsMm[k],p.boxMm)-q.radiusWithSupportsMm-two)
  for(const path of source.route.paths){for(const q of path.straight)add(p.id+'/'+path.id+'/'+q.index,'normal-waste',p.segmentMm?segmentDistance(...p.segmentMm,q.a,q.b)-p.radiusMm!-source.route.geometry.jacketRadiusMm-two:exactSegmentBoxDistance(q.a,q.b,p.boxMm)-source.route.geometry.jacketRadiusMm-two)
   for(const q of path.corners)if(q.kind==='boxed-compression-elbow')add(p.id+'/'+q.id,'normal-waste',distance(p,q.boxMm)-two)}
 }
 const h=d.prefabSinkHead,bowl=h.bowlPlanMm
 add('waste/actual-cap-terminal','source-join',-length(w.outfallVirtualMm.at(-1)!,capAxis))
 add('waste/geometric-water-seal','source-join',w.outfallVirtualMm[0][2]-w.neckVirtualMm.at(-1)![2]-w.minimumWaterSealMm)
 add('waste/pot-dip-above-actual-floor','source-join',w.neckVirtualMm.at(-1)![2]-w.potBoxMm[2]-two)
 add('waste/clear-bore-versus-wall-design','source-join',w.minimumTubeODMm-2*w.minimumWallMm-w.minimumClearBoreAfterFormingMm)
 add('waste/bowl-outlet-west','flange',outlet[0]-w.headFlangeMm[0]/2-bowl[0]-two);add('waste/bowl-outlet-east','flange',bowl[0]+bowl[2]-outlet[0]-w.headFlangeMm[0]/2-two)
 add('waste/bowl-outlet-south','flange',outlet[1]-w.headFlangeMm[0]/2-bowl[1]-two);add('waste/bowl-outlet-north','flange',bowl[1]+bowl[3]-outlet[1]-w.headFlangeMm[0]/2-two)
 add('waste/blind-through-real-bowl-opening','flange',(w.bowlOutletHoleMm-blind.maximumODMm)/2-two)
 const bin=w.receiverOuterMm,wall=w.maximumReceiverWallMm,gross=(bin[3]-2*wall)*(bin[4]-2*wall)*(bin[5]-2*wall)/1e6,
  inventory=parts.reduce((n,p)=>n+p.waterUpperL,0)+w.maximumBowlResidualBeforeWasteCutL
 add('waste/finite-water-versus-verified-bin','inventory',w.minimumVerifiedUsableL-inventory);add('waste/claimed-bin-versus-physical-inner-ceiling','inventory',gross-w.minimumVerifiedUsableL)
 for(const q of fixed)add('waste/bin-before-fork/'+q.id,'drain-before-capture',gap(bin,q.boxMm)-two)
 for(const[id,b]of Object.entries(source.host.geometry.frame))if(id!=='temporary carry bar')add('waste/bin-before-fork/raw-host-frame/'+id,'drain-before-capture',gap(bin,b as B)-two)
 const tip=w.drainPathMm.at(-1)!
 add('waste/drain-airgap','drain-before-capture',tip[2]-bin[2]-bin[5]-two)
 const tools:{id:string;shoulderMm:P;gripMm:P;shaftMm:readonly[P,P];minimumAngleDegrees:number}[]=[]
 for(let k=0;k<w.headFixingCount;k++){const ang=(90+120*k)*Math.PI/180,target:P=[outlet[0]+w.topAccessFixingRadiusMm*Math.cos(ang),outlet[1]+w.topAccessFixingRadiusMm*Math.sin(ang),outlet[2]],
  grip:P=[target[0],w.tool.headGripYMm,w.tool.headGripZMm],L=length(target,grip),angle=Math.atan2(Math.abs(grip[1]-target[1]),grip[2]-target[2])*180/Math.PI
  tools.push({id:'waste/top-flange-fixing/'+k,shoulderMm:w.tool.headShoulderMm,gripMm:grip,shaftMm:[target,grip],minimumAngleDegrees:angle})
  add('waste/flange-driver-length/'+k,'tools',w.tool.minimumWorkingLengthMm-L);add('waste/flange-universal-angle/'+k,'tools',w.tool.minimumUniversalAngleDegrees-angle)
  // The actual open bowl cavity, not a fictitious solid block, receives the driver.
  const rimU=(h.floodRimMm-target[2])/(grip[2]-target[2]),rimY=target[1]+rimU*(grip[1]-target[1])
  add('waste/driver-open-bowl-north/'+k,'tools',bowl[1]+bowl[3]-w.bowlWallMm-rimY-w.tool.maximumShaftRadiusMm-two)
  add('waste/driver-open-bowl-east/'+k,'tools',bowl[0]+bowl[2]-w.bowlWallMm-target[0]-w.tool.maximumShaftRadiusMm-two)
  add('waste/driver-open-bowl-west/'+k,'tools',target[0]-bowl[0]-w.bowlWallMm-w.tool.maximumShaftRadiusMm-two)
 }
 tools.push({id:'waste/backfeed-cut-control',shoulderMm:w.tool.cutShoulderMm,gripMm:cutGrip,shaftMm:[cutAxis,cutGrip],minimumAngleDegrees:0},{id:'waste/drain-control',shoulderMm:w.tool.drainShoulderMm,gripMm:w.drainValve.controlMm,shaftMm:[w.drainValve.axisMm,w.drainValve.controlMm],minimumAngleDegrees:0})
 for(const op of tools){add(op.id+'/reach','tools',w.tool.maximumReachMm-length(op.shoulderMm,op.gripMm))
  for(const q of foreign){add(op.id+'/arm/'+q.id,'tools',exactSegmentBoxDistance(op.shoulderMm,op.gripMm,q.boxMm)-40-two);if(op.id.startsWith('waste/top-'))add(op.id+'/driver/'+q.id,'tools',exactSegmentBoxDistance(...op.shaftMm,q.boxMm)-w.tool.maximumShaftRadiusMm-two)}
  for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)add(op.id+'/arm/'+q.id+'/'+k,'tools',segmentDistance(op.shoulderMm,op.gripMm,q.pointsMm[k-1],q.pointsMm[k])-q.radiusWithSupportsMm-40-two)
 }


 const dryRod=parts.find(p=>p.id.startsWith('waste/drain-dry-extension/'))!,ext=w.drainValve.removableDryExtension,
  rodUp:B=[dryRod.boxMm[0],dryRod.boxMm[1],dryRod.boxMm[2],dryRod.boxMm[3],dryRod.boxMm[4],dryRod.boxMm[5]+ext.releaseUpMm],
  rodNorth:B=[dryRod.boxMm[0],dryRod.boxMm[1],dryRod.boxMm[2]+ext.releaseUpMm,dryRod.boxMm[3],dryRod.boxMm[4]+ext.northToRestMm,dryRod.boxMm[5]],
  dryRodChecks:{id:string;reserveMm:number}[]=[]
 for(const [phase,b]of [['up',rodUp],['north',rodNorth]] as const)for(const q of foreign)dryRodChecks.push({id:'waste/dry-extension/'+phase+'/'+q.id,reserveMm:gap(b,q.boxMm)-two})
 dryRodChecks.push({id:'waste/dry-extension/positive-stub-release',reserveMm:ext.releaseUpMm-two})
 const capBounds=(d as unknown as{frameRenewal:{headCapture:CaptureControls}}).frameRenewal.headCapture,
  headControls=[...d.prefabSinkHead.pillarHandleMm.map((p,k)=>({id:'head/handle/'+k,boxMm:box(p,[capBounds.maximumHandleCrossMm,capBounds.maximumHandleCrossMm,capBounds.maximumHandleCrossMm])})),
   ...[d.prefabSinkHead.coldPortMm,d.prefabSinkHead.hotPortMm].map((p,k)=>({id:'head/pillar/'+k,boxMm:[p[0]-capBounds.maximumPillarAndSpoutCrossMm/2,p[1]-capBounds.maximumPillarAndSpoutCrossMm/2,p[2],capBounds.maximumPillarAndSpoutCrossMm,capBounds.maximumPillarAndSpoutCrossMm,capBounds.maximumHeadZMm-p[2]] as B}))]
 for(const op of tools)for(const q of headControls){add(op.id+'/arm/'+q.id,'tools',exactSegmentBoxDistance(op.shoulderMm,op.gripMm,q.boxMm)-40-two);if(op.id.startsWith('waste/top-'))add(op.id+'/driver/'+q.id,'tools',exactSegmentBoxDistance(...op.shaftMm,q.boxMm)-w.tool.maximumShaftRadiusMm-two)}
 const bodyA:P=[w.tool.bodyFloorXYMm[0],w.tool.bodyFloorXYMm[1],0],bodyB:P=[bodyA[0],bodyA[1],2000]
 for(const q of[...foreign,...parts])add('waste/maintenance-body/'+q.id,'tools',exactSegmentBoxDistance(bodyA,bodyB,q.boxMm)-300-two)
 const isolationChecks=[
  {id:'pressure/actual-source-H0-body',reserveMm:source.actualHot.isolation.bodyBox.length===6?0:-1},
  {id:'pressure/actual-cold-local-stop',reserveMm:wet.cold.geometry.parts.some(p=>p.id==='sink/stop-body')?0:-1},
  {id:'pressure/full-cold-controlled-receiver',reserveMm:wet.cold.inventory.receiverReserveLitres},
  {id:'pressure/full-hot-controlled-receiver',reserveMm:wet.hot.receiver.requiredVerifiedNetL-wet.hot.inventory.isolatedH0LowerBranchUpperL},
  {id:'waste/visible-backfeed-cut-complete-body',reserveMm:w.serviceCut.completeFaceMm>=200&&w.serviceCut.bareCrossMm>=100?0:-1},
  ...checks.filter(q=>['source-join','flange','inventory','drain-before-capture','tools'].includes(q.phase)).map(q=>({id:q.id,reserveMm:q.reserveMm}))
 ]
 const pressureCuts=(d as unknown as{normalWholeHouseIsolation:readonly string[]}).normalWholeHouseIsolation // Source-owned controls remain explicitly required; physical operation is never inferred.
 return{schema:'had-utility-visible-metal-waste-result/1',sourceDigest:sha256SemanticFingerprint({context:source.bindingDigest,choice:wet.choice,cap}),controls:w,parts,neck,outfall,cutAxisMm:cutAxis,cutGripMm:cutGrip,actualCapBoxMm:cap,actualCapAxisMm:capAxis,tools,checks,failures:checks.filter(q=>q.reserveMm< -1e-7),
  necessaryKnownWasteGeometry:checks.every(q=>q.reserveMm>=-1e-7),isolationAndDrainChecks:isolationChecks,inventory:{allExternalBareBoxesAndPipeOuterCylindersUpperL:inventory,receiverVerifiedMinimumL:w.minimumVerifiedUsableL,receiverInnerGrossCeilingL:gross,maximumPartialBatchL:w.maximumPartialBatchL,drainResidualIncluded:true,downstreamSewerInventoryExcludedOnlyAfterRealBackfeedCutClosed:true},
  sequence:['Keep local hot/cold closed and verify pressure zero; empty bowl normally while waste cut is still open.','Close the real visible waste backfeed cut with its north rod. Verify no continuing backfeed. Place supported10L receiver BEFORE head trolley, drain in<=5L batches; close cock before emptying and remove receiver before seating the trolley.','After positive head capture/front rail release, use source-sized top-accessed tools through the open bowl; fit captive metal blind to the fixed tail seat after isolation/drain, remove upper strainer retainers and release the head flange.','The supported trap/outfall/closed backfeed cut stay made to the actual floor cap while head is raised. Replace individual dry members and hot spool independently; rebuild and leak-test all waste/pressure interfaces before opening either cut.'],
  pressureCuts,dryRodRelease:{checks:dryRodChecks,failures:dryRodChecks.filter(q=>q.reserveMm<0),positiveCaptureAndKeeperRequired:true,actualPhysicalHandlingQualified:false},normalDesignWaterC:w.normalDesignWaterC,maximumColdMaintenanceC:w.maintenanceMaximumC,designFaultWaterC:w.designFaultWaterC,actualBackfeedValveSealToolsStrainerSupportAndCapPhysicalMatchQualified:false}
}

type PortalHeadFastening={operatorBodyFloorXYMm:readonly[number,number];operatorShoulderMm:P;socketLowerFaceAbovePedestalMm:number;minimumSocketHeadEngagementMm:number;ratchetHandleLengthMm:number;ratchetSteadyGripMm:number;ratchetMaximumDiameterMm:number;ratchetWorkingSectorDegrees:readonly[number,number];ratchetSweepIntervals:number;schema:string;method:string;frontBoltRowsFromBoardMm:readonly[number,number];boltDiameterMm:number;boltLengthMm:number;boltTensileAreaMm2:number;boltHeadAFMm:number;boltHeadDiameterMm:number;boltHeadHeightMm:number;boltHeadBottomMm:number;minimumThreadEngagementMm:number;frameThreadBlockMm:readonly[number,number,number];frameThreadBlockBottomMm:number;headLoadBossMm:readonly[number,number,number];headLoadBossBottomMm:number;headLoadPedestalMm:readonly[number,number,number];headLoadPedestalBottomMm:number;deckAccessDiameterMm:number;deckPlugDiameterMm:number;deckPlugThicknessMm:number;rearDowelDiameterMm:number;rearDowelBottomMm:number;rearDowelTopMm:number;rearDowelCollarDiameterMm:number;rearDowelCollarClearBoreMm:number;rearDowelCollarBottomMm:number;rearDowelCollarTopMm:number;frontLipThicknessMm:number;frontLipDepthMm:number;frontLipBottomMm:number;leftCornerBandDepthMm:number;referenceSteelProofMPa:number;toolSocketMaximumDiameterMm:number;toolExtensionMm:number;toolTorqueNm:number;actualDeliveredFastenerThreadWeldSheetAndLoadTransferQualified:false}
type PortalDesign={maximumHeadFactoryWeldMassKg:number;headRelease:PortalHeadFastening;schema:string;sideAxisFromBoardEdgeMm:number;beamRearFromBoardMm:number;beamFrontFromBoardMm:number;rearLegFromBoardMm:number;frontLegFromBoardMm:number;sideRibCrossMm:readonly[number,number];sideRibWallMm:number;sideRibRearFromBoardMm:number;sideRibFrontFromBoardMm:number;framePostCrossMm:readonly[number,number];framePostWallMm:number;frameBeamCrossMm:readonly[number,number];frameBeamWallMm:number;lowerRearCrossMm:readonly[number,number];lowerRearWallMm:number;lowerRearAxisZMm:number;braceCrossMm:number;braceWallMm:number;rearBraceAxisYOffsetsMm:readonly number[];rearBraceLowZMm:number;rearBraceHighZMm:number;sideBraceAxisXOffsetsMm:readonly number[];sideBraceLowZMm:number;sideBraceHighZMm:number;solePlanMm:readonly[number,number];soleThicknessMm:number;headClipPlateMm:readonly[number,number,number];headClipAxisZMm:number;headClipRearFromBoardMm:number;headClipFrontFromBoardMm:number;headMountBoltDiameterMm:number;headMountBoltMaximumLengthMm:number;minimumHeadSheetMm:number;maximumHeadSheetMm:number;maximumHeadDryAccessoriesKg:number;maximumEachHeadPressureAssemblyKg:number;underBowlPadMm:readonly[number,number,number];maximumFrameJointAndWeldMassKg:number;minimumSteelDensityKgM3:number;maximumSteelDensityKgM3:number;matchedOneHeadFabricationBoundMm:number;maximumCapturedWetHeadKg:number;normalFrontEdgePointComparisonN:number;normalHorizontalComparisonN:number;normalForceHeightMm:number;frontUpperAndLowerTiesIncluded:false;actualDeliveredMaterialWeldAndJointProofAccepted:false;actualFloorBearingAndBallastSupportAccepted:false}
/** Complete alternate normal support. This observer does not yet replace the
 * legacy cage adapter or admit finite portal capture/extraction/floor loads. */
export function inletUtilityPortalCandidate(i:{source:Source;wet:Wet;capture:ReturnType<typeof inletUtilityOrdinaryCapture>;braceObstacleRepresentation?:'exact-members'|'filled-bay-control';headMountRepresentation?:'front-top-bolts'|'legacy-cross-clips-control';headToolRepresentation?:'inward-ratchet'|'bare-axis-arm-control';headSocketRepresentation?:'flat-ended'|'capsule-control';headShoulderRepresentation?:'source-standing'|'old-low-shoulder-control'}){
 const {source,wet,capture}=i,d=wet.choice.coldDistribution,h=d.prefabSinkHead,
  p=(d as unknown as{frameRenewal:{portalDesign:PortalDesign}}).frameRenewal.portalDesign,two=2*source.rearTreeContext.settingEachMm
 if(p?.schema!=='had-utility-two-side-portals/1'||!Number.isFinite(p.maximumEachHeadPressureAssemblyKg)||p.maximumEachHeadPressureAssemblyKg<=0||p.maximumEachHeadPressureAssemblyKg*2>p.maximumHeadDryAccessoriesKg||p.frontUpperAndLowerTiesIncluded!==false||two!==20||p.maximumHeadSheetMm<p.minimumHeadSheetMm||p.normalForceHeightMm<capture.controls.maximumHeadZMm)throw Error('Actual complete portal source and full occupied head action height required')
 const mountMode=i.headMountRepresentation??'front-top-bolts',toolMode=i.headToolRepresentation??'inward-ratchet',socketMode=i.headSocketRepresentation??'flat-ended',shoulderMode=i.headShoulderRepresentation??'source-standing',f=p.headRelease
 if(f?.schema!=='had-utility-front-head-fastening/1'||f.actualDeliveredFastenerThreadWeldSheetAndLoadTransferQualified!==false||p.normalForceHeightMm<f.boltHeadBottomMm+f.boltHeadHeightMm+f.toolExtensionMm+f.ratchetMaximumDiameterMm/2)throw Error('Source-bound head fastening requirements required')
 const top=(h as unknown as{topPlanMm:readonly[number,number,number,number];topZMm:readonly[number,number];topSolidPlansMm:readonly(readonly[number,number,number,number])[]}),
  plan=top.topPlanMm,xs=[plan[0]+p.sideAxisFromBoardEdgeMm,plan[0]+plan[2]-p.sideAxisFromBoardEdgeMm],
  yr=plan[1]+p.rearLegFromBoardMm,yf=plan[1]+plan[3]-p.frontLegFromBoardMm,beamA=plan[1]+p.beamRearFromBoardMm,beamB=plan[1]+plan[3]-p.beamFrontFromBoardMm,
  ribA=plan[1]+p.sideRibRearFromBoardMm,ribB=plan[1]+plan[3]-p.sideRibFrontFromBoardMm,
  ribBottom=top.topZMm[0]-p.sideRibCrossMm[1],beamBottom=ribBottom-p.frameBeamCrossMm[1],rho=p.maximumSteelDensityKgM3,
  area=(w:number,h:number,t:number)=>w*h-(w-2*t)*(h-2*t),box=(x:number,y:number,z:number,a:number,b:number,c:number):B=>[x,y,z,a,b,c],
  parts:{id:string;boxMm:B;group:string;massUpperKg:number;segmentMm?:readonly[P,P];radiusMm?:number}[]=[],
  put=(id:string,b:B,group:string,volume:number)=>parts.push({id,boxMm:b,group,massUpperKg:volume*rho/1e9}),
  bar=(id:string,a:P,b:P,s:number,t:number,group:string)=>{
   const L=Math.hypot(...b.map((v,k)=>v-a[k])),B0:B=[...a.map((v,k)=>Math.min(v,b[k])-s/2),...a.map((v,k)=>Math.abs(v-b[k])+s)] as unknown as B
   parts.push({id,boxMm:B0,group,massUpperKg:area(s,s,t)*L*rho/1e9,segmentMm:[a,b],radiusMm:s*Math.SQRT2/2})
  }
 for(const[side,x]of xs.entries()){
  for(const[end,y]of[yr,yf].entries()){
   put('portal/'+side+'/leg/'+end,box(x-p.framePostCrossMm[0]/2,y-p.framePostCrossMm[1]/2,p.soleThicknessMm,...p.framePostCrossMm,beamBottom-p.soleThicknessMm),'frame',area(...p.framePostCrossMm,p.framePostWallMm)*(beamBottom-p.soleThicknessMm))
   put('portal/'+side+'/sole/'+end,box(x-p.solePlanMm[0]/2,y-p.solePlanMm[1]/2,0,...p.solePlanMm,p.soleThicknessMm),'frame',p.solePlanMm[0]*p.solePlanMm[1]*p.soleThicknessMm)
  }
  put('portal/'+side+'/side-upper',box(x-p.frameBeamCrossMm[0]/2,beamA,beamBottom,p.frameBeamCrossMm[0],beamB-beamA,p.frameBeamCrossMm[1]),'frame',area(...p.frameBeamCrossMm,p.frameBeamWallMm)*(beamB-beamA))
  put('head/factory-side-rib/'+side,box(x-p.sideRibCrossMm[0]/2,ribA,ribBottom,p.sideRibCrossMm[0],ribB-ribA,p.sideRibCrossMm[1]),'factory-head',area(...p.sideRibCrossMm,p.sideRibWallMm)*(ribB-ribA)-(mountMode==='front-top-bolts'?(2*Math.PI*(f.boltDiameterMm+1)**2/4+Math.PI*f.rearDowelCollarClearBoreMm**2/4)*2*p.sideRibWallMm:0))
  for(const[k,off]of p.sideBraceAxisXOffsetsMm.entries())bar('portal/'+side+'/side-brace/'+k,[x+off,yr,k===0?p.sideBraceLowZMm:p.sideBraceHighZMm],[x+off,yf,k===0?p.sideBraceHighZMm:p.sideBraceLowZMm],p.braceCrossMm,p.braceWallMm,'frame')
  if(mountMode==='legacy-cross-clips-control')for(const[k,y]of[plan[1]+p.headClipRearFromBoardMm,plan[1]+plan[3]-p.headClipFrontFromBoardMm].entries()){
   for(const sign of[-1,1]){
    const bx=x+(sign<0?-p.sideRibCrossMm[0]/2-p.headClipPlateMm[0]:p.sideRibCrossMm[0]/2)
    put('head/clip/'+side+'/'+k+'/'+sign,box(bx,y-p.headClipPlateMm[1]/2,p.headClipAxisZMm-p.headClipPlateMm[2]/2,...p.headClipPlateMm),'factory-head',p.headClipPlateMm.reduce((n,v)=>n*v,1))
   }
   for(const off of[-15,15])put('head/mount-bolt/'+side+'/'+k+'/'+off,box(x-p.headMountBoltMaximumLengthMm/2,y+off-p.headMountBoltDiameterMm/2,p.headClipAxisZMm-p.headMountBoltDiameterMm/2,p.headMountBoltMaximumLengthMm,p.headMountBoltDiameterMm,p.headMountBoltDiameterMm),'factory-head',Math.PI*p.headMountBoltDiameterMm**2/4*p.headMountBoltMaximumLengthMm+2*13*13*6)
  }
  if(mountMode==='front-top-bolts'){
   const yd=plan[1]+p.headClipRearFromBoardMm
   put('portal/'+side+'/rear-locating-dowel',box(x-f.rearDowelDiameterMm/2,yd-f.rearDowelDiameterMm/2,f.rearDowelBottomMm,f.rearDowelDiameterMm,f.rearDowelDiameterMm,f.rearDowelTopMm-f.rearDowelBottomMm),'frame',Math.PI*f.rearDowelDiameterMm**2/4*(f.rearDowelTopMm-f.rearDowelBottomMm))
   put('head/rear-locating-collar/'+side,box(x-f.rearDowelCollarDiameterMm/2,yd-f.rearDowelCollarDiameterMm/2,f.rearDowelCollarBottomMm,f.rearDowelCollarDiameterMm,f.rearDowelCollarDiameterMm,f.rearDowelCollarTopMm-f.rearDowelCollarBottomMm),'factory-head',Math.PI*(f.rearDowelCollarDiameterMm**2-f.rearDowelCollarClearBoreMm**2)/4*(p.sideRibCrossMm[1]-2*p.sideRibWallMm))
   for(const[k,off]of f.frontBoltRowsFromBoardMm.entries()){
    const y=plan[1]+off,D=f.boltDiameterMm
    put('portal/'+side+'/head-thread-block/'+k,box(x-f.frameThreadBlockMm[0]/2,y-f.frameThreadBlockMm[1]/2,f.frameThreadBlockBottomMm,...f.frameThreadBlockMm),'frame',f.frameThreadBlockMm.reduce((n,v)=>n*v,1))
    put('head/load-boss/'+side+'/'+k,box(x-f.headLoadBossMm[0]/2,y-f.headLoadBossMm[1]/2,f.headLoadBossBottomMm,...f.headLoadBossMm),'factory-head',f.headLoadBossMm[0]*f.headLoadBossMm[1]*(f.headLoadBossMm[2]-2*p.sideRibWallMm)-Math.PI*(f.boltDiameterMm+1)**2/4*(f.headLoadBossMm[2]-2*p.sideRibWallMm))
    put('head/load-pedestal/'+side+'/'+k,box(x-f.headLoadPedestalMm[0]/2,y-f.headLoadPedestalMm[1]/2,f.headLoadPedestalBottomMm,...f.headLoadPedestalMm),'factory-head',f.headLoadPedestalMm.reduce((n,v)=>n*v,1)-Math.PI*(f.boltDiameterMm+1)**2/4*f.headLoadPedestalMm[2])
    put('head/mount-bolt/'+side+'/'+k,box(x-D/2,y-D/2,f.boltHeadBottomMm-f.boltLengthMm,D,D,f.boltLengthMm),'factory-head',Math.PI*D**2/4*f.boltLengthMm)
    put('head/mount-bolt-head/'+side+'/'+k,box(x-f.boltHeadDiameterMm/2,y-f.boltHeadDiameterMm/2,f.boltHeadBottomMm,f.boltHeadDiameterMm,f.boltHeadDiameterMm,f.boltHeadHeightMm),'factory-head',Math.PI*f.boltHeadDiameterMm**2/4*f.boltHeadHeightMm)
    put('head/deck-access-plug/'+side+'/'+k,box(x-f.deckPlugDiameterMm/2,y-f.deckPlugDiameterMm/2,top.topZMm[1],f.deckPlugDiameterMm,f.deckPlugDiameterMm,f.deckPlugThicknessMm),'factory-head',Math.PI*f.deckPlugDiameterMm**2/4*f.deckPlugThicknessMm)
   }
  }
 }
 if(mountMode==='front-top-bolts'){
  const cut=(h as unknown as{serviceCornerRemovedPlanMm:readonly[number,number,number,number]}).serviceCornerRemovedPlanMm,
   x0=cut[0]+cut[2],front=plan[1]+plan[3],lipLength=plan[0]+plan[2]-x0,
   bandWidth=xs[0]+p.sideRibCrossMm[0]/2-x0,bandLength=front-ribB
  if(bandWidth<=0||bandLength<=0)throw Error('Actual open service-corner band required')
  put('head/front-load-lip',box(x0,front-f.frontLipThicknessMm,f.frontLipBottomMm,lipLength,f.frontLipThicknessMm,f.frontLipDepthMm),'factory-head',lipLength*f.frontLipThicknessMm*f.frontLipDepthMm)
  put('head/left-corner-load-band',box(x0,ribB,top.topZMm[0]-f.leftCornerBandDepthMm,bandWidth,bandLength,f.leftCornerBandDepthMm),'factory-head',bandWidth*bandLength*f.leftCornerBandDepthMm)
  put('head/right-front-rib-extension',box(xs[1]-p.sideRibCrossMm[0]/2,ribB,ribBottom,p.sideRibCrossMm[0],bandLength,p.sideRibCrossMm[1]),'factory-head',area(...p.sideRibCrossMm,p.sideRibWallMm)*bandLength)
 }
 put('portal/rear/lower-tie',box(xs[0],yr-p.lowerRearCrossMm[0]/2,p.lowerRearAxisZMm-p.lowerRearCrossMm[1]/2,xs[1]-xs[0],...p.lowerRearCrossMm),'frame',area(...p.lowerRearCrossMm,p.lowerRearWallMm)*(xs[1]-xs[0]))
 for(const[k,off]of p.rearBraceAxisYOffsetsMm.entries())bar('portal/rear/diagonal/'+k,[xs[0],yr+off,k===0?p.rearBraceLowZMm:p.rearBraceHighZMm],[xs[1],yr+off,k===0?p.rearBraceHighZMm:p.rearBraceLowZMm],p.braceCrossMm,p.braceWallMm,'frame')
 for(const[k,e]of capture.controls.liftingEyesMm.entries())put('head/internal-reinforcement-pad/'+k,box(e[0]-p.underBowlPadMm[0]/2,e[1]-p.underBowlPadMm[1]/2,e[2],...p.underBowlPadMm),'factory-head',p.underBowlPadMm.reduce((n,v)=>n*v,1))
 const foreign=[...source.rearTreeContext.obstacles.filter(q=>!q.id.startsWith('IAS/frame/')&&q.presence!=='head-before-strip'&&q.presence!=='carry-bar-after-park'),
  ...wet.cold.geometry.parts.filter(q=>!q.cap).map(q=>({id:'cold/'+q.id,boxMm:q.wrapped})),...wet.hot.normalPermanentEnvelopes,...capture.waste.parts.map(q=>({id:q.id,boxMm:q.boxMm}))],
  checks:{id:string;kind:string;reserveMm:number}[]=[],add=(id:string,kind:string,reserveMm:number)=>checks.push({id,kind,reserveMm}),
  compare=(q:typeof parts[number],o:{id:string;boxMm:B},kind:string,allowance=two)=>add(q.id+'/'+o.id,kind,(q.segmentMm?exactSegmentBoxDistance(...q.segmentMm,o.boxMm)-q.radiusMm!:gap(q.boxMm,o.boxMm))-allowance)
 for(const q of parts){
  for(const o of foreign)compare(q,{id:o.id,boxMm:o.boxMm as B},'made-services-and-source-obstacles')
  for(const o of capture.headParts)if(o.id!=='head/board/0'&&o.id!=='head/board/1'&&!(q.id.startsWith('head/internal-reinforcement-pad/')&&o.id==='head/bowl'))compare(q,o,'complete-head',q.group==='factory-head'?p.matchedOneHeadFabricationBoundMm:two)
  for(const o of source.rearTreeContext.retainedPaths)for(let k=1;k<o.pointsMm.length;k++)add(q.id+'/'+o.id+'/'+k,'actual-retained-services',q.segmentMm?segmentDistance(...q.segmentMm,o.pointsMm[k-1],o.pointsMm[k])-q.radiusMm!-o.radiusWithSupportsMm-two:exactSegmentBoxDistance(o.pointsMm[k-1],o.pointsMm[k],q.boxMm)-o.radiusWithSupportsMm-two)
  for(const path of source.route.paths){
   for(const o of path.straight)add(q.id+'/'+path.id+'/'+o.index,'actual-main',q.segmentMm?segmentDistance(...q.segmentMm,o.a,o.b)-q.radiusMm!-source.route.geometry.jacketRadiusMm-two:exactSegmentBoxDistance(o.a,o.b,q.boxMm)-source.route.geometry.jacketRadiusMm-two)
   for(const o of path.corners)if(o.kind==='boxed-compression-elbow')compare(q,{id:o.id,boxMm:o.boxMm},'actual-full-main-fittings')
   else if(o.arcMm)for(let k=1;k<o.arcMm.length;k++)add(q.id+'/'+o.id+'/'+k,'actual-formed-main',q.segmentMm?segmentDistance(...q.segmentMm,o.arcMm[k-1],o.arcMm[k])-q.radiusMm!-source.route.geometry.jacketRadiusMm-o.arcCoverMm-two:exactSegmentBoxDistance(o.arcMm[k-1],o.arcMm[k],q.boxMm)-source.route.geometry.jacketRadiusMm-o.arcCoverMm-two)
  }
  add(q.id+'/room-west','room',q.boxMm[0]-source.input.roomPlanMm[0]-two)
  add(q.id+'/room-east','room',source.input.roomPlanMm[0]+source.input.roomPlanMm[2]-q.boxMm[0]-q.boxMm[3]-two)
 }
 const braceObstacleRepresentation=i.braceObstacleRepresentation??'exact-members',
  added=parts.filter(q=>!q.segmentMm||braceObstacleRepresentation==='filled-bay-control').map(q=>({id:'candidate-'+q.id,boxMm:q.boxMm,presence:'always' as const})),
  addedPaths=parts.filter(q=>q.segmentMm&&braceObstacleRepresentation==='exact-members').map(q=>({id:'candidate-'+q.id,pointsMm:q.segmentMm!,radiusWithSupportsMm:q.radiusMm!})),
  candidateCold=inletUtilityRearTree({choice:wet.choice,context:{...source.rearTreeContext,obstacles:[...source.rearTreeContext.obstacles.filter(q=>!q.id.startsWith('IAS/frame/')),...added],retainedPaths:[...source.rearTreeContext.retainedPaths,...addedPaths]}}),
  cg=capture.controls.headCGPlanDesignMm,W=p.maximumCapturedWetHeadKg*9.81*1.5,
  reactionCases=[cg[0]-two,cg[0]+cg[2]+two].flatMap(x=>[cg[1]-two,cg[1]+cg[3]+two].map(y=>{
   const u=(x-xs[0])/(xs[1]-xs[0]),v=(y-yr)/(yf-yr)
   return{cgXYMm:[x,y],u,v,reactionsN:[W*(1-u)*(1-v),W*u*(1-v),W*(1-u)*v,W*u*v]}
  })),
  bearingChecks=[{id:'head-rib/side-overlap-after-relative-settings',reserveMm:Math.min(p.sideRibCrossMm[0],p.frameBeamCrossMm[0])-two},{id:'head-rib/end-overlap-after-relative-settings',reserveMm:Math.min(ribB,beamB)-Math.max(ribA,beamA)-two}],
  unilateralReactionCases=reactionCases.flatMap((q,k)=>[Math.max(0,q.u+q.v-1),Math.min(q.u,q.v)].map(t=>({cgVertex:k,t,reactionsN:[W*(1-q.u-q.v+t),W*(q.u-t),W*(q.v-t),W*t]}))),
  reactionChecks=unilateralReactionCases.flatMap((q,k)=>q.reactionsN.map((r,j)=>({id:'unilateral-equilibrium/'+k+'/'+j,reserveN:r}))),
  unilateralCornerReactionBoundsN=[0,1,2,3].map(k=>({corner:k,minimumN:Math.min(...unilateralReactionCases.map(q=>q.reactionsN[k])),maximumN:Math.max(...unilateralReactionCases.map(q=>q.reactionsN[k]))})),

  sheetArea=top.topSolidPlansMm.reduce((s,b)=>s+b[2]*b[3],0)-h.bowlPlanMm[2]*h.bowlPlanMm[3],
  bowlSheetArea=h.bowlPlanMm[2]*h.bowlPlanMm[3]+2*(h.bowlPlanMm[2]+h.bowlPlanMm[3])*(h.floodRimMm-h.bowlBottomMm),
  cgStockBounds=(()=>{
   const boardCentre=[0,1].map(k=>(top.topSolidPlansMm.reduce((s,b)=>s+b[2]*b[3]*(b[k]+b[k+2]/2),0)-h.bowlPlanMm[2]*h.bowlPlanMm[3]*(h.bowlPlanMm[k]+h.bowlPlanMm[k+2]/2))/sheetArea),
    fixed=parts.filter(q=>q.group==='factory-head').map(q=>({massKg:q.massUpperKg,centre:[q.boxMm[0]+q.boxMm[3]/2,q.boxMm[1]+q.boxMm[4]/2]})),
    pressureParts=capture.headParts.filter(q=>/^head\/(pillar|handle|spout)\//.test(q.id)),
    accessories=[0,1].map(k=>{
     const a=pressureParts.filter(q=>new RegExp('head/(pillar|handle|spout)/'+k+'$').test(q.id))
     return{maximumKg:p.maximumEachHeadPressureAssemblyKg,lo:[0,1].map(j=>Math.min(...a.map(q=>q.boxMm[j]))),hi:[0,1].map(j=>Math.max(...a.map(q=>q.boxMm[j]+q.boxMm[j+3])))}
    }),
    water=pressureParts.map(q=>({maximumKg:q.boxMm[3]*q.boxMm[4]*q.boxMm[5]/1e6,lo:q.boxMm.slice(0,2),hi:[q.boxMm[0]+q.boxMm[3],q.boxMm[1]+q.boxMm[4]]})),
    w=(d as unknown as{wasteService:WasteControls}).wasteService
   water.push({maximumKg:w.maximumBowlResidualBeforeWasteCutL,lo:h.bowlPlanMm.slice(0,2),hi:[h.bowlPlanMm[0]+h.bowlPlanMm[2],h.bowlPlanMm[1]+h.bowlPlanMm[3]]})
   const variables=[...accessories,...water,...(mountMode==='front-top-bolts'?[{maximumKg:p.maximumHeadFactoryWeldMassKg,lo:plan.slice(0,2),hi:[plan[0]+plan[2],plan[1]+plan[3]]}]:[])],bounds:{axis:number;side:'lo'|'hi';centroidMm:number}[]=[]
   for(const axis of[0,1])for(const side of['lo','hi'] as const){
    let best=side==='lo'?Infinity:-Infinity
    for(const density of[p.minimumSteelDensityKgM3,p.maximumSteelDensityKgM3])for(const ts of[p.minimumHeadSheetMm,p.maximumHeadSheetMm])for(const tb of[p.minimumHeadSheetMm,p.maximumHeadSheetMm]){
     const board=sheetArea*ts*density/1e9,bowl=bowlSheetArea*tb*density/1e9,
      m0=board+bowl+fixed.reduce((s,q)=>s+q.massKg*density/rho,0),
      f0=board*boardCentre[axis]+bowl*(h.bowlPlanMm[axis]+h.bowlPlanMm[axis+2]/2)+fixed.reduce((s,q)=>s+q.massKg*density/rho*q.centre[axis],0)
     for(let bits=0;bits<2**variables.length;bits++){
      let mass=m0,first=f0
      variables.forEach((q,k)=>{if(bits&(1<<k)){mass+=q.maximumKg;first+=q.maximumKg*q[side][axis]}})
      best=side==='lo'?Math.min(best,first/mass):Math.max(best,first/mass)
     }
    }
    bounds.push({axis,side,centroidMm:best})
   }
   const rect=capture.controls.headCGPlanDesignMm,boxBounds=[bounds[0].centroidMm,bounds[2].centroidMm,bounds[1].centroidMm,bounds[3].centroidMm]
   return{bounds,maximumFactoryHeadWeldInventoryKg:mountMode==='front-top-bolts'?p.maximumHeadFactoryWeldMassKg:0,capturedHeadOuterWaterCeilingL:water.reduce((s,q)=>s+q.maximumKg,0),
    pressureBodiesWaterCeilingByPillarL:[0,1].map(k=>pressureParts.filter(q=>new RegExp('head/(pillar|handle|spout)/'+k+'$').test(q.id)).reduce((s,q)=>s+q.boxMm[3]*q.boxMm[4]*q.boxMm[5]/1e6,0)),
    pressureBodyComponentIds:(h as unknown as{independentPressureComponents:readonly{id:string}[]}).independentPressureComponents.map(q=>q.id),
    pressureDevicePartsByPillar:[0,1].map(k=>{
     const a=pressureParts.filter(q=>new RegExp('head/(pillar|handle|spout)/'+k+'$').test(q.id)),
      lo=[0,1,2].map(j=>Math.min(...a.map(q=>q.boxMm[j]))),hi=[0,1,2].map(j=>Math.max(...a.map(q=>q.boxMm[j]+q.boxMm[j+3]))),
      lengths=lo.map((v,j)=>hi[j]-v),sorted=[...lengths].sort((a,b)=>a-b)
     return{componentId:(h as unknown as{independentPressureComponents:readonly{id:string}[]}).independentPressureComponents[k].id,parts:a.map(q=>({id:q.id,outerBoxMm:q.boxMm,outerBoxVolumeL:q.boxMm[3]*q.boxMm[4]*q.boxMm[5]/1e6})),sumOuterBoxVolumesL:a.reduce((s,q)=>s+q.boxMm[3]*q.boxMm[4]*q.boxMm[5]/1e6,0),axisAlignedEnclosingBoxMm:[...lo,...lengths],fitsAnyOrthogonal80by80by300Box:sorted.every((v,j)=>v<=[80,80,300][j]),arbitraryObliqueDeviceFitProved:false,actualMeasuredPressureVolumeAndFamilyQualified:false,datum:'occupied-ground-FFL-local'}
    }),
    bowlResidualDuringCaptureCeilingL:w.maximumBowlResidualBeforeWasteCutL,maximumEachPressureAssemblyDryKg:p.maximumEachHeadPressureAssemblyKg,
    minimumModeledHeadSteelKg:(sheetArea+bowlSheetArea)*p.minimumHeadSheetMm*p.minimumSteelDensityKgM3/1e9+fixed.reduce((s,q)=>s+q.massKg*p.minimumSteelDensityKgM3/rho,0),
    declaredPlanMm:rect,withinDeclaredSourceBox:boxBounds[0]>=rect[0]&&boxBounds[1]>=rect[1]&&boxBounds[2]<=rect[0]+rect[2]&&boxBounds[3]<=rect[1]+rect[3],
    method:'exact extrema of independent bounded first moments; actual factory product mass/material/CG unqualified',factoryHeadMeasuredAndQualified:false}
  })(),
  headSteelKg=(sheetArea+bowlSheetArea)*p.maximumHeadSheetMm*rho/1e9+parts.filter(q=>q.group==='factory-head').reduce((s,q)=>s+q.massUpperKg,0)+(mountMode==='front-top-bolts'?p.maximumHeadFactoryWeldMassKg:0),
  headWetCeilingKg=headSteelKg+p.maximumHeadDryAccessoriesKg+(d as unknown as{wasteService:WasteControls}).wasteService.maximumCapturedHeadResidualL,
  mass={cgStockBounds,headSheetAndBowlAreaMm2:sheetArea+bowlSheetArea,headSteelUpperKg:headSteelKg,completeHeadWetUpperKg:headWetCeilingKg,declaredCapturedHeadKg:p.maximumCapturedWetHeadKg,captureMassReserveKg:p.maximumCapturedWetHeadKg-headWetCeilingKg,frameSteelUpperKg:parts.filter(q=>q.group==='frame').reduce((s,q)=>s+q.massUpperKg,0),frameJointAndWeldDesignCeilingKg:p.maximumFrameJointAndWeldMassKg,frameCompleteDesignMassUpperKg:parts.filter(q=>q.group==='frame').reduce((s,q)=>s+q.massUpperKg,0)+p.maximumFrameJointAndWeldMassKg,actualFrameJointEnvelopesAndWeldsQualified:false},
  oldFrame=Object.entries(source.host.geometry.frame).filter(([id,b])=>id.includes(' rail ')&&(b as B)[2]+(b as B)[5]===top.topZMm[0]).map(([id,b])=>{
   const a=b as B,patches=top.topSolidPlansMm.map(r=>({width:Math.max(0,Math.min(a[0]+a[3],r[0]+r[2])-Math.max(a[0],r[0])),depth:Math.max(0,Math.min(a[1]+a[4],r[1]+r[3])-Math.max(a[1],r[1]))}))
   return{id,actualBoxMm:a,nominalBearingAreaMm2:patches.reduce((s,q)=>s+q.width*q.depth,0),minimumNarrowBearingNominalMm:Math.max(...patches.filter(q=>q.width*q.depth>0).map(q=>Math.min(q.width,q.depth))),factorySheetLoadTransferAndRestraintProved:false}
  })

 const headRelease=(()=>{
  const rows=f.frontBoltRowsFromBoardMm.map(y=>plan[1]+y),span=Math.abs(rows[1]-rows[0]),front=plan[1]+plan[3]+two,
   sideSpan=xs[1]-xs[0],outerX=plan[0]+plan[2]+two,
   fullFrontPointN=p.normalFrontEdgePointComparisonN,fullSideFrontPointN=fullFrontPointN*(1+Math.max(0,outerX-xs[1])/sideSpan),
   H=p.normalForceHeightMm+two,rotationMomentNmm=p.normalHorizontalComparisonN*Math.max(0,H-top.topZMm[0]),
   gravitySideFraction=Math.max(...reactionCases.map(q=>Math.max(q.u,1-q.u))),
   gravitySideUpperN=W*gravitySideFraction,
   sideMomentNmm=fullSideFrontPointN*(front-Math.min(...rows))+rotationMomentNmm+gravitySideUpperN*(ribB-ribA)/4,
   grossI=(p.sideRibCrossMm[0]*p.sideRibCrossMm[1]**3-(p.sideRibCrossMm[0]-2*p.sideRibWallMm)*(p.sideRibCrossMm[1]-2*p.sideRibWallMm)**3)/12,
   clearanceHole=f.boltDiameterMm+1,removedFlangeI=2*(clearanceHole*p.sideRibWallMm**3/12+clearanceHole*p.sideRibWallMm*(p.sideRibCrossMm[1]/2-p.sideRibWallMm/2)**2),
   netI=grossI-removedFlangeI,netZ=netI/(p.sideRibCrossMm[1]/2),
   boltTensionUpperN=fullSideFrontPointN*(front-Math.min(...rows))/span+rotationMomentNmm/span+gravitySideUpperN,
   cut=(h as unknown as{serviceCornerRemovedPlanMm:readonly[number,number,number,number]}).serviceCornerRemovedPlanMm,
   bandWidth=xs[0]+p.sideRibCrossMm[0]/2-(cut[0]+cut[2]),bandLength=plan[1]+plan[3]-ribB,
   lipSpan=xs[1]-(cut[0]+cut[2])+two,lipI=f.frontLipThicknessMm*f.frontLipDepthMm**3/12,
   lipStressMPa=fullFrontPointN*lipSpan/4/(lipI/(f.frontLipDepthMm/2)),
   bandI=bandWidth*f.leftCornerBandDepthMm**3/12,bandStressMPa=fullSideFrontPointN*(bandLength+two)/(bandI/(f.leftCornerBandDepthMm/2)),
   allowableMPa=f.referenceSteelProofMPa/1.5,
   reference={frontPointActionN:fullFrontPointN,fullOneSideFrontReactionUpperN:fullSideFrontPointN,unilateralGravitySideFraction:gravitySideFraction,gravitySideUpperN,sideMomentNmm,sideRibGrossIMM4:grossI,verticalClearanceHoleMm:clearanceHole,sideRibNetIMM4:netI,sideRibNetStressMPa:sideMomentNmm/netZ,boltTensionUpperEachN:boltTensionUpperN,boltTensionStressMPa:boltTensionUpperN/f.boltTensileAreaMm2,boltShearUpperEachN:p.normalHorizontalComparisonN+f.toolTorqueNm*1000/span,boltShearStressMPa:(p.normalHorizontalComparisonN+f.toolTorqueNm*1000/span)/(Math.PI*f.boltDiameterMm**2/4),frontLipStressMPa:lipStressMPa,leftCornerBandStressMPa:bandStressMPa,allowableMPa,referenceNecessary:netI>0&&Math.max(sideMomentNmm/netZ,boltTensionUpperN/f.boltTensileAreaMm2,lipStressMPa,bandStressMPa)<=allowableMPa,rearDowelUpliftResistanceCreditedN:0,actualThreadBossWeldSheetLocalBucklingAndMaterialQualified:false},
   toolChecks:{id:string;kind:string;reserveMm:number}[]=[],putCheck=(id:string,kind:string,reserveMm:number)=>toolChecks.push({id,kind,reserveMm}),
   shoulder=shoulderMode==='old-low-shoulder-control'?capture.controls.normalWorkingShoulderMm:f.operatorShoulderMm,body=f.operatorBodyFloorXYMm,
   fixedTools=[...foreign,...capture.hardware.filter(q=>q.id.startsWith('capture/')&&!q.afterFrameKnockdown).map(q=>({id:q.id,boxMm:q.boxMm})),...parts.map(q=>({id:q.id,boxMm:q.boxMm}))],
   toolTasks:{id:string;gripMm:P;shaftMm:readonly[P,P];socketBoxMm:B;accessHoleMm:readonly[number,number,number];socketHeadEngagementMm:number;mainGripsMm:P[];steadyGripsMm:P[]}[]=[]
  if(mountMode==='front-top-bolts')for(const[side,x]of xs.entries())for(const[k,y]of rows.entries()){
   const id='head/top-tool/'+side+'/'+k,a:P=[x,y,f.boltHeadBottomMm+f.boltHeadHeightMm],b:P=[x,y,a[2]+f.toolExtensionMm],
    targetIds=['head/mount-bolt/'+side+'/'+k,'head/mount-bolt-head/'+side+'/'+k,'head/deck-access-plug/'+side+'/'+k],
    R=f.toolSocketMaximumDiameterMm/2,lower=f.headLoadPedestalBottomMm+f.headLoadPedestalMm[2]+f.socketLowerFaceAbovePedestalMm,
    socketBox:B=[x-R,y-R,lower,2*R,2*R,b[2]-lower],engagement=f.boltHeadBottomMm+f.boltHeadHeightMm-lower,
    db=(box:B)=>socketMode==='flat-ended'?gap(socketBox,box):exactSegmentBoxDistance(a,b,box)-R,
    ds=(a0:P,b0:P,r:number)=>socketMode==='flat-ended'?exactSegmentBoxDistance(a0,b0,socketBox)-r:segmentDistance(a,b,a0,b0)-R-r,
    task={id,gripMm:b,shaftMm:[a,b] as readonly[P,P],socketBoxMm:socketBox,accessHoleMm:[x,y,f.deckAccessDiameterMm] as const,socketHeadEngagementMm:engagement,mainGripsMm:[] as P[],steadyGripsMm:[] as P[]}
   toolTasks.push(task)
   putCheck(id+'/matched-deck-aperture','matched-factory-hole',f.deckAccessDiameterMm/2-R-p.matchedOneHeadFabricationBoundMm)
   putCheck(id+'/socket-head-engagement','engagement',engagement-f.minimumSocketHeadEngagementMm)
   putCheck(id+'/thread','engagement',Math.min(f.frameThreadBlockBottomMm+f.frameThreadBlockMm[2],f.boltHeadBottomMm)-Math.max(f.frameThreadBlockBottomMm,f.boltHeadBottomMm-f.boltLengthMm)-f.minimumThreadEngagementMm)
   putCheck(id+'/one-hand-torque-demand','force',p.normalHorizontalComparisonN-f.toolTorqueNm*1000/f.ratchetHandleLengthMm)
   for(const o of fixedTools)if(!targetIds.includes(o.id))putCheck(id+'/socket/'+o.id,'socket',db(o.boxMm as B)-(o.id.startsWith('head/')?p.matchedOneHeadFabricationBoundMm:two))
   for(const o of capture.headParts)if(!o.id.startsWith('head/board/'))putCheck(id+'/socket/'+o.id,'socket',db(o.boxMm)-p.matchedOneHeadFabricationBoundMm)
   for(const o of source.rearTreeContext.retainedPaths)for(let j=1;j<o.pointsMm.length;j++)putCheck(id+'/socket/'+o.id+'/'+j,'socket',ds(o.pointsMm[j-1],o.pointsMm[j],o.radiusWithSupportsMm)-two)
   for(const path of source.route.paths){
    for(const q of path.straight)putCheck(id+'/socket/'+path.id+'/'+q.index,'socket',ds(q.a,q.b,source.route.geometry.jacketRadiusMm)-two)
    for(const q of path.corners)if(q.kind==='boxed-compression-elbow')putCheck(id+'/socket/'+q.id,'socket',db(q.boxMm)-two)
    else if(q.arcMm)for(let j=1;j<q.arcMm.length;j++)putCheck(id+'/socket/'+q.id+'/'+j,'socket',ds(q.arcMm[j-1],q.arcMm[j],source.route.geometry.jacketRadiusMm+q.arcCoverMm)-two)
   }
   const N=toolMode==='inward-ratchet'?f.ratchetSweepIntervals:1,step=(f.ratchetWorkingSectorDegrees[1]-f.ratchetWorkingSectorDegrees[0])*Math.PI/180/N,
    handleRadius=f.ratchetMaximumDiameterMm/2,sign=side===0?1:-1
   for(let n=0;n<N;n++){
    const angle=(f.ratchetWorkingSectorDegrees[0]+(n+.5)*(f.ratchetWorkingSectorDegrees[1]-f.ratchetWorkingSectorDegrees[0])/N)*Math.PI/180,
     cover=toolMode==='inward-ratchet'?2*f.ratchetHandleLengthMm*Math.sin(Math.abs(step)/4):0,
     main:P=toolMode==='inward-ratchet'?[x+sign*f.ratchetHandleLengthMm*Math.cos(angle),y+f.ratchetHandleLengthMm*Math.sin(angle),b[2]]:b,
     steady:P=toolMode==='inward-ratchet'?[x+sign*f.ratchetSteadyGripMm*Math.cos(angle),y+f.ratchetSteadyGripMm*Math.sin(angle),b[2]]:b
    task.mainGripsMm.push(main);task.steadyGripsMm.push(steady)
    for(const[hand,grip]of[['drive',main],['steady',steady]] as const){
     putCheck(id+'/'+hand+'/reach/'+n,'reach',600-Math.hypot(...grip.map((v,j)=>v-shoulder[j]))-cover)
     for(const o of [...fixedTools,...capture.headParts])putCheck(id+'/'+hand+'/arm/'+o.id+'/'+n,'arm',exactSegmentBoxDistance(shoulder,grip,o.boxMm as B)-40-two-cover)
     for(const o of source.rearTreeContext.retainedPaths)for(let j=1;j<o.pointsMm.length;j++)putCheck(id+'/'+hand+'/arm/'+o.id+'/'+j+'/'+n,'arm',segmentDistance(shoulder,grip,o.pointsMm[j-1],o.pointsMm[j])-40-o.radiusWithSupportsMm-two-cover)
     for(const path of source.route.paths){
      for(const q of path.straight)putCheck(id+'/'+hand+'/arm/'+path.id+'/'+q.index+'/'+n,'arm',segmentDistance(shoulder,grip,q.a,q.b)-40-source.route.geometry.jacketRadiusMm-two-cover)
      for(const q of path.corners)if(q.kind==='boxed-compression-elbow')putCheck(id+'/'+hand+'/arm/'+q.id+'/'+n,'arm',exactSegmentBoxDistance(shoulder,grip,q.boxMm)-40-two-cover)
      else if(q.arcMm)for(let j=1;j<q.arcMm.length;j++)putCheck(id+'/'+hand+'/arm/'+q.id+'/'+j+'/'+n,'arm',segmentDistance(shoulder,grip,q.arcMm[j-1],q.arcMm[j])-40-source.route.geometry.jacketRadiusMm-q.arcCoverMm-two-cover)
     }
    }
    if(toolMode==='inward-ratchet'){
     for(const o of [...fixedTools,...capture.headParts])putCheck(id+'/handle/'+o.id+'/'+n,'handle',exactSegmentBoxDistance(b,main,o.boxMm as B)-handleRadius-two-cover)
     for(const o of source.rearTreeContext.retainedPaths)for(let j=1;j<o.pointsMm.length;j++)putCheck(id+'/handle/'+o.id+'/'+j+'/'+n,'handle',segmentDistance(b,main,o.pointsMm[j-1],o.pointsMm[j])-handleRadius-o.radiusWithSupportsMm-two-cover)
     for(const path of source.route.paths){
      for(const q of path.straight)putCheck(id+'/handle/'+path.id+'/'+q.index+'/'+n,'handle',segmentDistance(b,main,q.a,q.b)-handleRadius-source.route.geometry.jacketRadiusMm-two-cover)
      for(const q of path.corners)if(q.kind==='boxed-compression-elbow')putCheck(id+'/handle/'+q.id+'/'+n,'handle',exactSegmentBoxDistance(b,main,q.boxMm)-handleRadius-two-cover)
      else if(q.arcMm)for(let j=1;j<q.arcMm.length;j++)putCheck(id+'/handle/'+q.id+'/'+j+'/'+n,'handle',segmentDistance(b,main,q.arcMm[j-1],q.arcMm[j])-handleRadius-source.route.geometry.jacketRadiusMm-q.arcCoverMm-two-cover)
     }
    }
   }
  }
  for(const o of fixedTools){
   if(o.boxMm[2]>=2000||o.boxMm[2]+o.boxMm[5]<=0)continue
   const dx=Math.max(o.boxMm[0]-body[0],body[0]-o.boxMm[0]-o.boxMm[3],0),dy=Math.max(o.boxMm[1]-body[1],body[1]-o.boxMm[1]-o.boxMm[4],0)
   putCheck('head/top-tool/body/'+o.id,'body',Math.hypot(dx,dy)-300-two)
  }
  const oldCrossBoltReaches=parts.filter(q=>mountMode==='legacy-cross-clips-control'&&q.id.startsWith('head/mount-bolt/')).map(q=>({id:q.id,reachReserveMm:600-Math.hypot(q.boxMm[0]+q.boxMm[3]/2-shoulder[0],q.boxMm[1]+q.boxMm[4]/2-shoulder[1],q.boxMm[2]+q.boxMm[5]/2-shoulder[2])}))
  return{method:mountMode,toolRepresentation:toolMode,socketRepresentation:socketMode,shoulderRepresentation:shoulderMode,operatorShoulderMm:shoulder,operatorBodyFloorXYMm:body,reference,toolTasks,toolChecks,toolFailures:toolChecks.filter(q=>q.reserveMm< -1e-7),necessaryTools:mountMode==='front-top-bolts'&&toolTasks.length===4&&toolChecks.every(q=>q.reserveMm>=-1e-7),oldCrossBoltReaches,rearDowelClearanceAfterFirstLiftMm:capture.controls.firstLiftMm-(f.rearDowelTopMm-ribBottom)-two,sequence:['pressure/waste isolated and bounded; positive head fork bearing established','remove four metal plugs and four front top-driven bolts from north','pressure/waste unions released under actual capture guard','head first65UP releases plain rear locating dowels; then static380UP'],fullyRemovedHeadOrRearOperatorRequired:false,actualPhysicalFastenerSheetWeldAndSupportQualified:false}
 })()
 return{schema:'had-utility-two-side-portal-observer/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,choice:wet.choice,portal:p,braceObstacleRepresentation,mountMode,toolMode,socketMode,shoulderMode}),braceObstacleRepresentation,headMountRepresentation:mountMode,headRelease,parts,checks,geometryFailures:checks.filter(q=>q.reserveMm< -1e-7),candidateColdNormal:candidateCold.geometry.normalNecessary,candidateColdFailures:candidateCold.geometry.failures.filter(q=>['normal','operation','nonmate-metal','fitting-legs'].includes(q.phase)),
  normalBearing:{factoryBoardToSideRibsToNSBeamsToFourLegsToFloor:true,contactDatum:{headRibBottomMm:ribBottom,NSBeamTopMm:beamBottom+p.frameBeamCrossMm[1],threadBlockTopMm:f.frameThreadBlockBottomMm+f.frameThreadBlockMm[2],threadBlockToHeadBossVoidMm:f.headLoadBossBottomMm-f.frameThreadBlockBottomMm-f.frameThreadBlockMm[2],compressionThroughRibAndBeamFaces:true,boltCompressionColumnCredited:false,localBeamWallCaptiveBlockWeldAndThreadQualified:false},bearingChecks,reactionChecks,unilateralReactionCases,unilateralCornerReactionBoundsN,conditionalBilinearReactionCases:reactionCases,reactionAssumption:'Bilinear values are a conditional stiffness comparator; the unilateral t interval bounds equilibrium without equal-stiffness credit.',actualIndividualLegReactionsQualified:false,dynamicHeadN:W,minimumHorizontalOverlapMm:Math.min(p.sideRibCrossMm[0],p.frameBeamCrossMm[0])-two,minimumLongitudinalOverlapMm:Math.min(ribB,beamB)-Math.max(ribA,beamA)-two,necessary:bearingChecks.every(q=>q.reserveMm>=0)&&reactionChecks.every(q=>q.reserveN>=-1e-7),actualFactoryHeadSheetBowlWeldAndMatchedBoltsQualified:false},
  mass,legacyCage:{role:'explicit stock and bearing control only; not normal support acceptance',upperRails:oldFrame},
  demandedInterfaces:{normalFrontEdgePointN:p.normalFrontEdgePointComparisonN,frontEdgeRearPairUpliftBeforeDeadWeightN:p.normalFrontEdgePointComparisonN*(plan[1]+plan[3]-yf)/(yf-yr),horizontalActionN:p.normalHorizontalComparisonN,actualForceHeightMm:p.normalForceHeightMm,normalHeightAfterTwoSettingsMm:p.normalForceHeightMm+two,requiredFloorMomentNmm:p.normalHorizontalComparisonN*(p.normalForceHeightMm+two),capturedHeadHeightAfterTwoSettingsMm:capture.controls.maximumHeadZMm+capture.controls.liftMm+two,capturedHeadHorizontalMomentNmm:p.normalHorizontalComparisonN*(capture.controls.maximumHeadZMm+capture.controls.liftMm+two),frictionCreditedN:0},
  actualFloorBallastMemberCaptureToolsAndFiniteRenewalQualified:false,normalGravityCapacityAccepted:false,ordinaryRenewalAccepted:false}
}

type PortalFiniteControls={rearTranslationOrder:'west-before-up';schema:string;portalKeyDepthMm:number;portalLiftMm:number;portalNorthMm:number;rearParkAxisYMm:number;rearRotationCentreXMm:number;rearRotationCentreZMm:number;rearParkLevelsMm:readonly number[];normalReceiverInwardOffsetMm:number;receiverPostCrossMm:number;receiverPostWallMm:number;receiverBasePlanMm:readonly[number,number];receiverTopPlanMm:readonly[number,number];receiverPlateMm:number;receiverAnchorDiameterMm:number;receiverAnchorEmbedMm:number;receiverAnchorHeadDiameterMm:number;receiverAnchorHeadHeightMm:number;minimumRCCoverMm:number;receiverFloorKeyDiameterMm:number;receiverReferenceE_MPa:number;receiverReferenceSteelProofMPa:number;receiverSocketAFMm:number;receiverSocketMaximumODMm:number;receiverBoltMinimumThreadMm:number;receiverBoltTorqueNm:number;temporaryCaptureToolMaximumDryKg:number;temporaryCaptureToolPayloadKg:number;maximumSidePortalWithTemporaryClampsKg:number;maximumRearMemberWithTemporaryClampsKg:number;steelDensityUpperKgM3:number;actualDeliveredFixtureJointRCWaterproofAirThermalAndHandlingQualified:false}
/** Same selected portal case: finite member sweeps and actual source-pocket
 * receivers. Unmodelled positive holding/tool interfaces remain named gates. */
export function inletUtilityPortalFiniteRenewal(i:{source:Source;wet:Wet;capture:ReturnType<typeof inletUtilityOrdinaryCapture>;portal:ReturnType<typeof inletUtilityPortalCandidate>;movingBraceRepresentation?:'exact-sampled-capsules'|'filled-bay-control';rearRouteOrder?:'west-before-up'|'old-up-before-west-control'}){
 const {source,wet,capture,portal}=i,d=wet.choice.coldDistribution,
  r=(d as unknown as{frameRenewal:{portalDesign:{finiteRenewal:PortalFiniteControls}}}).frameRenewal.portalDesign.finiteRenewal,
  floor=(source as unknown as{candidateFloorPocket:{schema:string;bindingDigest:string;occupiedFflAbsoluteMm:number;currentSavedDocumentAdmitted:false;nativeFloorOrForceApprovalTransferred:false;pocket:{levels:{ffl:number};local:{levelBoxes:readonly{id:string;planMinMaxMm:PlanRectangle;planRectanglesXYMm?:readonly PlanRectangle[];zMm:readonly[number,number]}[]}|null}}}).candidateFloorPocket,
  two=2*source.rearTreeContext.settingEachMm
 if(r?.schema!=='had-utility-portal-finite-renewal/1'||r.actualDeliveredFixtureJointRCWaterproofAirThermalAndHandlingQualified!==false||floor?.schema!=='had-utility-candidate-floor-pocket-context/1'||!floor.pocket.local||floor.occupiedFflAbsoluteMm!==source.groundFflMm||floor.pocket.levels.ffl!==source.groundFflMm||floor.nativeFloorOrForceApprovalTransferred!==false)throw Error('Same source-bound Utility pocket and unadmitted finite renewal controls required')
 const rc=floor.pocket.local.levelBoxes.find(q=>q.id==='dryRC')
 if(!rc)throw Error('Actual notched RC level box required')
 const rcPlans=rc.planRectanglesXYMm??[rc.planMinMaxMm],rcTop=rc.zMm[1]-source.groundFflMm,rcBottom=rc.zMm[0]-source.groundFflMm,
  shift=(b:B,p:P):B=>[b[0]+p[0],b[1]+p[1],b[2]+p[2],b[3],b[4],b[5]],
  sweep=(a:B,b:B):B=>[...a.slice(0,3).map((v,k)=>Math.min(v,b[k])),...a.slice(0,3).map((v,k)=>Math.max(v+a[k+3],b[k]+b[k+3])-Math.min(v,b[k]))] as unknown as B,
  room=source.input.roomPlanMm,parts=portal.parts,foreignBase=source.rearTreeContext.obstacles.filter(q=>!q.id.startsWith('IAS/frame/')&&q.presence!=='head-before-strip'&&q.presence!=='carry-bar-after-park'&&q.id!=='source-washer-home'),
  rest=source.services.utility.washerFirstRest,washerH=source.rearTreeContext.obstacles.find(q=>q.id==='source-washer-home')!.boxMm[5],
  pressure=[...wet.cold.geometry.parts.filter(q=>!q.cap).map(q=>({id:'cold/'+q.id,boxMm:q.wrapped})),...wet.hot.normalPermanentEnvelopes,...capture.waste.parts.map(q=>({id:q.id,boxMm:q.boxMm}))],
  raisedHead=[...capture.headParts,...parts.filter(q=>q.group==='factory-head')].map(q=>({id:'raised/'+q.id,boxMm:shift(q.boxMm,[0,0,capture.controls.liftMm])})),
  fixture=capture.hardware.filter(q=>q.id.startsWith('capture/')&&!q.afterFrameKnockdown).map(q=>({id:q.id,boxMm:shift(q.boxMm,[0,0,q.id.startsWith('capture/fork/')?capture.controls.liftMm:0])})),
  fixed=[...foreignBase,{id:'actual-washer-first-rest',boxMm:[rest[0],rest[1],0,rest[2],rest[3],washerH] as B},...pressure,...raisedHead,...fixture],
  checks:{componentId:string;phase:string;movingPrimitiveId?:string;obstacleId:string;reserveMm:number}[]=[],components:{id:string;sourcePartIds:string[];stockUpperKg:number;phases:string[]}[]=[],
  removedOriginalIds:string[]=[],parked:{id:string;boxMm:B;segmentMm?:readonly[P,P];radiusMm?:number}[]=[],phaseState:{componentId:string;removedOriginalIds:string[];parkedObstacleIds:string[]}[]=[],
  checkIndex=new Map<string,number>(),record=(...rows:typeof checks)=>{for(const q of rows){const key=JSON.stringify([q.componentId,q.phase,q.movingPrimitiveId,q.obstacleId]),k=checkIndex.get(key);if(k===undefined){checkIndex.set(key,checks.length);checks.push(q)}else if(q.reserveMm<checks[k].reserveMm)checks[k]=q}},
  compare=(id:string,phase:string,b:B,exclude:readonly string[],cover=0,moving?:{segment:readonly[P,P];radiusMm:number;primitiveId?:string})=>{
   const db=(box:B)=>moving?exactSegmentBoxDistance(...moving.segment,box)-moving.radiusMm:gap(b,box),ds=(segment:readonly[P,P],radius:number)=>moving?segmentDistance(...moving.segment,...segment)-moving.radiusMm-radius:exactSegmentBoxDistance(...segment,b)-radius
   const push=(...rows:typeof checks)=>record(...rows.map(q=>({...q,movingPrimitiveId:moving?.primitiveId})))
   for(const q of fixed)push({componentId:id,phase,obstacleId:q.id,reserveMm:db(q.boxMm as B)-two-cover})
   for(const q of parked)push({componentId:id,phase,obstacleId:q.id,reserveMm:q.segmentMm?ds(q.segmentMm,q.radiusMm!)-two-cover:db(q.boxMm)-two-cover})
   for(const q of parts.filter(q=>q.group==='frame'&&!exclude.includes(q.id)&&!removedOriginalIds.includes(q.id))){
    if(q.segmentMm)push({componentId:id,phase,obstacleId:q.id,reserveMm:ds(q.segmentMm,q.radiusMm!)-two-cover})
    else push({componentId:id,phase,obstacleId:q.id,reserveMm:db(q.boxMm)-two-cover})
   }
   for(const q of source.rearTreeContext.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)push({componentId:id,phase,obstacleId:q.id+'/'+k,reserveMm:ds([q.pointsMm[k-1],q.pointsMm[k]],q.radiusWithSupportsMm)-two-cover})
   for(const path of source.route.paths){
    for(const q of path.straight)push({componentId:id,phase,obstacleId:path.id+'/'+q.index,reserveMm:ds([q.a,q.b],source.route.geometry.jacketRadiusMm)-two-cover})
    for(const q of path.corners)if(q.kind==='boxed-compression-elbow')push({componentId:id,phase,obstacleId:q.id,reserveMm:db(q.boxMm)-two-cover})
    else if(q.arcMm)for(let k=1;k<q.arcMm.length;k++)push({componentId:id,phase,obstacleId:q.id+'/'+k,reserveMm:ds([q.arcMm[k-1],q.arcMm[k]],source.route.geometry.jacketRadiusMm+q.arcCoverMm)-two-cover})
   }
   push({componentId:id,phase,obstacleId:'room-west',reserveMm:b[0]-room[0]-two-cover},{componentId:id,phase,obstacleId:'room-east',reserveMm:room[0]+room[2]-b[0]-b[3]-two-cover})
  },
  representation=i.movingBraceRepresentation??'exact-sampled-capsules',rearRouteOrder=i.rearRouteOrder??r.rearTranslationOrder,
  samplingProofs:{componentId:string;primitiveId:string;phase:string;sampleCount:number;chordCoverMm:number;maximumStepMm:number}[]=[],
  sampleMove=(id:string,primitiveId:string,phase:string,a0:P,b0:P,a1:P,b1:P,radius:number,exclude:readonly string[])=>{
   const travel=Math.max(Math.hypot(...a1.map((v,k)=>v-a0[k])),Math.hypot(...b1.map((v,k)=>v-b0[k]))),N=Math.max(1,Math.ceil(travel/5)),cover=travel/(2*N)
   samplingProofs.push({componentId:id,primitiveId,phase,sampleCount:N,chordCoverMm:cover,maximumStepMm:travel/N})
   for(let k=0;k<N;k++){
    const u=(k+.5)/N,a=a0.map((v,j)=>v+(a1[j]-v)*u) as unknown as P,b=b0.map((v,j)=>v+(b1[j]-v)*u) as unknown as P,
     box:B=[...a.map((v,j)=>Math.min(v,b[j])-radius),...a.map((v,j)=>Math.abs(v-b[j])+2*radius)] as unknown as B
    compare(id,phase,box,exclude,cover,{segment:[a,b],radiusMm:radius,primitiveId})
   }
  },
  rear=parts.filter(q=>q.id.startsWith('portal/rear/')),
  rearIds=rear.map(q=>q.id)
 for(const[which,q]of rear.entries()){
  phaseState.push({componentId:q.id,removedOriginalIds:[...removedOriginalIds],parkedObstacleIds:parked.map(q=>q.id)})
  const b=q.boxMm,c:P=q.segmentMm?[(q.segmentMm[0][0]+q.segmentMm[1][0])/2,(q.segmentMm[0][1]+q.segmentMm[1][1])/2,(q.segmentMm[0][2]+q.segmentMm[1][2])/2]:[b[0]+b[3]/2,b[1]+b[4]/2,b[2]+b[5]/2],
   end:P=[r.rearRotationCentreXMm,r.rearParkAxisYMm,r.rearRotationCentreZMm],L=q.segmentMm?Math.hypot(...q.segmentMm[1].map((v,k)=>v-q.segmentMm![0][k])):b[3],
   s=q.segmentMm?2*q.radiusMm!/Math.SQRT2:Math.min(b[4],b[5]),angle=q.segmentMm?Math.atan2(q.segmentMm[1][2]-q.segmentMm[0][2],q.segmentMm[1][0]-q.segmentMm[0][0]):0,
   prism=(centre:P,a:number):B=>{const dx=Math.abs(L*Math.cos(a))/2+Math.abs(s*Math.sin(a))/2,dz=Math.abs(L*Math.sin(a))/2+Math.abs(s*Math.cos(a))/2;return[centre[0]-dx,centre[1]-s/2,centre[2]-dz,2*dx,s,2*dz]},
   p0=prism(c,angle),c1:P=[c[0],end[1],c[2]],c2:P=rearRouteOrder==='west-before-up'?[end[0],end[1],c[2]]:[c[0],end[1],end[2]],phases=['captured-rear-member-to-south-plane',rearRouteOrder==='west-before-up'?'rear-member-west-at-source-height':'rear-member-up-before-west-control',rearRouteOrder==='west-before-up'?'rear-member-up-after-west-clearance':'rear-member-west-after-up-control','rear-member-rotate-flat','rear-member-positive-park']
  const ends=(centre:P,a:number):readonly[P,P]=>[[centre[0]-L/2*Math.cos(a),centre[1],centre[2]-L/2*Math.sin(a)],[centre[0]+L/2*Math.cos(a),centre[1],centre[2]+L/2*Math.sin(a)]],
   move=(phase:string,from:P,to:P,a0:number,a1:number)=>{
    if(q.segmentMm&&representation==='exact-sampled-capsules'){
     if(a0===a1)sampleMove(q.id,q.id,phase,...ends(from,a0),...ends(to,a1),q.radiusMm!,[q.id])
     else for(let n=0;n<64;n++){
      const a=a0+(a1-a0)*n/64,z=a0+(a1-a0)*(n+1)/64,e0=ends(from,a),e1=ends(to,z),
       mid=ends(from,(a+z)/2),arcCover=L/2*(1-Math.cos(Math.abs(z-a)/2)),
       box:B=[...mid[0].map((v,k)=>Math.min(v,mid[1][k])-q.radiusMm!),...mid[0].map((v,k)=>Math.abs(v-mid[1][k])+2*q.radiusMm!)] as unknown as B,
       cover=Math.max(Math.hypot(...e1[0].map((v,k)=>v-e0[0][k])),Math.hypot(...e1[1].map((v,k)=>v-e0[1][k])))/2+arcCover
      samplingProofs.push({componentId:q.id,primitiveId:q.id,phase,sampleCount:1,chordCoverMm:cover,maximumStepMm:2*cover})
      compare(q.id,phase,box,[q.id],cover,{segment:mid,radiusMm:q.radiusMm!,primitiveId:q.id})
     }
    }else compare(q.id,phase,sweep(prism(from,a0),prism(to,a1)),[q.id],a0===a1?0:Math.hypot(L/2,s/2)*(1-Math.cos(Math.abs(a1-a0)/2)))
   }
  void p0
  move(phases[0],c,c1,angle,angle)
  move(phases[1],c1,c2,angle,angle)
  move(phases[2],c2,end,angle,angle)
  if(q.segmentMm&&representation==='exact-sampled-capsules')move(phases[3],end,end,angle,0)
  else for(let n=0;n<64;n++)move(phases[3],end,end,angle*(1-n/64),angle*(1-(n+1)/64))
  move(phases[4],end,[end[0],end[1],r.rearParkLevelsMm[which]],0,0)
  components.push({id:q.id,sourcePartIds:[q.id],stockUpperKg:q.massUpperKg,phases})
  removedOriginalIds.push(q.id)
  parked.push({id:'parked/'+q.id,boxMm:prism([end[0],end[1],r.rearParkLevelsMm[which]],0),...(q.segmentMm&&representation==='exact-sampled-capsules'?{segmentMm:ends([end[0],end[1],r.rearParkLevelsMm[which]],0),radiusMm:q.radiusMm}:{})})
 }
 for(const side of[0,1]){
  const group=parts.filter(q=>q.id.startsWith('portal/'+side+'/')),exclude=[...rearIds,...group.map(q=>q.id)],id='portal/side-unit/'+side
  phaseState.push({componentId:id,removedOriginalIds:[...removedOriginalIds],parkedObstacleIds:parked.map(q=>q.id)})
  for(const q of group){
   if(q.segmentMm&&representation==='exact-sampled-capsules'){
    const up=q.segmentMm.map(p=>[p[0],p[1],p[2]+r.portalLiftMm]) as unknown as readonly[P,P],north=up.map(p=>[p[0],p[1]+r.portalNorthMm,p[2]]) as unknown as readonly[P,P]
    sampleMove(id,q.id,'side-unit-up-to-release-positive-floor-key',...q.segmentMm,...up,q.radiusMm!,exclude)
    sampleMove(id,q.id,'side-unit-captured-north-park',...up,...north,q.radiusMm!,exclude)
   }else{
    compare(id,'side-unit-up-to-release-positive-floor-key',sweep(q.boxMm,shift(q.boxMm,[0,0,r.portalLiftMm])),exclude)
    compare(id,'side-unit-captured-north-park',sweep(shift(q.boxMm,[0,0,r.portalLiftMm]),shift(q.boxMm,[0,r.portalNorthMm,r.portalLiftMm])),exclude)
   }
  }
  components.push({id,sourcePartIds:group.map(q=>q.id),stockUpperKg:group.reduce((n,q)=>n+q.massUpperKg,0),phases:['side-unit-up-to-release-positive-floor-key','side-unit-captured-north-park']})
  for(const q of group){removedOriginalIds.push(q.id);parked.push({id:'parked/'+q.id,boxMm:shift(q.boxMm,[0,r.portalNorthMm,r.portalLiftMm]),...(q.segmentMm?{segmentMm:q.segmentMm.map(p=>[p[0],p[1]+r.portalNorthMm,p[2]+r.portalLiftMm]) as unknown as readonly[P,P],radiusMm:q.radiusMm}:{})})}
 }
 const receiverParts:{id:string;boxMm:B;role:string}[]=[],receiverChecks:{id:string;reserveMm:number}[]=[],receiverFootprintChecks:{id:string;probePlanMm:PlanRectangle;probeAreaMm2:number;coveredAreaMm2:number;missingAreaMm2:number;contained:boolean;status:'contained'|'outside-actual-RC'}[]=[],receiverDemands:{id:string;axialUpperN:number;upliftUpperN:number;shearUpperN:number;referenceMomentAtRCNmm:number;referenceSteelExtremeMPa:number;referenceAnchorTensionEachN:number;referenceAnchorMPa:number}[]=[],
  put=(id:string,b:B,role:string)=>receiverParts.push({id,boxMm:b,role}),
  contain=(id:string,b:B)=>{
   // Actual pocket cells are disjoint; intersection areas cover the probe once.
   // subtractPlan intentionally rejects an empty remainder and is not a containment predicate.
   if(rcPlans.some((a,k)=>rcPlans.slice(k+1).some(b=>{const c=intersectPlan(a,b);return c!==null&&planArea(c)>1e-7})))throw Error('Disjoint actual RC footprint cells required')
   const probePlanMm=expandPlan([b[0],b[1],b[0]+b[3],b[1]+b[4]],two),probeAreaMm2=planArea(probePlanMm),
    coveredAreaMm2=rcPlans.reduce((n,q)=>{const c=intersectPlan(probePlanMm,q);return n+(c?planArea(c):0)},0),
    missingAreaMm2=Math.max(0,probeAreaMm2-coveredAreaMm2),contained=missingAreaMm2<=1e-7
   receiverFootprintChecks.push({id:id+'/same-notched-RC-plan-after-two-settings',probePlanMm,probeAreaMm2,coveredAreaMm2,missingAreaMm2,contained,status:contained?'contained':'outside-actual-RC'})
  },
  S=r.receiverPostCrossMm,t=r.receiverPostWallMm,A=S*S-(S-2*t)**2,I=(S**4-(S-2*t)**4)/12,
  gravity=capture.demand.fullHeadDynamicN+portal.mass.frameCompleteDesignMassUpperKg*9.81*1.5+r.temporaryCaptureToolPayloadKg*9.81*1.5,
  normalF=portal.demandedInterfaces.horizontalActionN,normalH=portal.demandedInterfaces.normalHeightAfterTwoSettingsMm,
  normalLegs=parts.filter(q=>q.id.includes('/leg/'))
 for(const q of normalLegs){
  const x=q.boxMm[0]+q.boxMm[3]/2,y=q.boxMm[1]+q.boxMm[4]/2,east=q.id.startsWith('portal/1/'),offset=east?r.normalReceiverInwardOffsetMm:0,
   cx=x-offset,id='RC-receiver/'+q.id,base:B=[cx-r.receiverBasePlanMm[0]/2,y-r.receiverBasePlanMm[1]/2,rcTop-r.receiverPlateMm,...r.receiverBasePlanMm,r.receiverPlateMm],
   crown:B=[x-r.receiverTopPlanMm[0]/2,y-r.receiverTopPlanMm[1]/2,-r.receiverPlateMm,...r.receiverTopPlanMm,r.receiverPlateMm],stemTop=offset?-r.receiverPlateMm-S:-r.receiverPlateMm
  put(id+'/cast-base',base,'cast-RC');contain(id+'/cast-base',base)
  put(id+'/standoff',[cx-S/2,y-S/2,rcTop,S,S,stemTop-rcTop],'through-renewable-upper-layers')
  if(offset)put(id+'/inward-corbel',[cx-S/2,y-S/2,stemTop,offset+S,S,S],'structural-corbel-no-glass-bearing')
  put(id+'/blind-floor-crown',crown,'removable-frame-interface')
  for(const dx of[-25,25])for(const dy of[-45,45]){
   const ax=cx+dx,ay=y+dy,D=r.receiverAnchorDiameterMm,HD=r.receiverAnchorHeadDiameterMm,
    head:B=[ax-HD/2,ay-HD/2,rcTop-r.receiverAnchorEmbedMm-r.receiverAnchorHeadHeightMm,HD,HD,r.receiverAnchorHeadHeightMm]
   put(id+'/cast-rod/'+dx+'/'+dy,[ax-D/2,ay-D/2,rcTop-r.receiverAnchorEmbedMm,D,D,r.receiverAnchorEmbedMm],'cast-RC-anchor')
   put(id+'/cast-head/'+dx+'/'+dy,head,'cast-RC-anchor');contain(id+'/cast-head/'+dx+'/'+dy,head)
   receiverChecks.push({id:id+'/cast-head-cover/'+dx+'/'+dy,reserveMm:head[2]-rcBottom-r.minimumRCCoverMm-two})
  }
  const N=gravity+portal.demandedInterfaces.normalFrontEdgePointN,U=portal.demandedInterfaces.frontEdgeRearPairUpliftBeforeDeadWeightN+normalF*normalH/Math.max(1,Math.max(...normalLegs.map(q=>q.boxMm[1]))-Math.min(...normalLegs.map(q=>q.boxMm[1]))),
   M=normalF*(normalH-rcTop)+N*offset,anchor=M/50/2+U/4
  receiverDemands.push({id,axialUpperN:N,upliftUpperN:U,shearUpperN:normalF,referenceMomentAtRCNmm:M,referenceSteelExtremeMPa:M*S/2/I+N/A,referenceAnchorTensionEachN:anchor,referenceAnchorMPa:anchor/84.3})
 }
 const fixtureIds=components.map(q=>q.id),toolChecks=portal.headRelease.toolChecks
 return{schema:'had-utility-portal-finite-renewal/1',sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,portal:portal.sourceDigest,floor,controls:r,representation,rearRouteOrder}),movingBraceRepresentation:representation,rearRouteOrder,samplingProofs,components,phaseState,finalParkedParts:parked,checks,necessaryFiniteGeometry:checks.every(q=>Number.isFinite(q.reserveMm)&&q.reserveMm>=-1e-7),geometryFailures:checks.filter(q=>q.reserveMm< -1e-7),
  receiver:{sourceContextDigest:floor.bindingDigest,occupiedFflAbsoluteMm:source.groundFflMm,rcLocalMm:[rcBottom,rcTop],actualRCPlans:rcPlans,parts:receiverParts,checks:receiverChecks,footprintChecks:receiverFootprintChecks,geometryFailures:[...receiverChecks.filter(q=>q.reserveMm<0),...receiverFootprintChecks.filter(q=>!q.contained)],demands:receiverDemands,referenceNecessarySteel:receiverDemands.every(q=>Math.max(q.referenceSteelExtremeMPa,q.referenceAnchorMPa)<=r.receiverReferenceSteelProofMPa/1.5),frictionResistanceCreditedN:0,actualRCBreakoutRebarWeldWaterproofAirAndPointThermalJoinAccepted:false},
  toolChecks,toolFailures:toolChecks.filter(q=>q.reserveMm< -1e-7),memberIds:fixtureIds,
  positiveCaptureRequirement:{headGravityRemainsOnIndependentFloorFork:true,oneCapturedRearMemberOrSidePortalAtATime:true,allThreeRearMembersPositivelyParkedBeforeSidePortalRelease:true,maximumSidePortalWithClampsKg:r.maximumSidePortalWithTemporaryClampsKg,maximumRearMemberWithClampsKg:r.maximumRearMemberWithTemporaryClampsKg,temporaryPositiveCaptureFixtureGeometryQualified:false},
  temporaryStability:{receiverSteelDemandsIncluded:true,headForkMomentReceiversAndMemberCaptureFixtureStillRequireCompleteGeometry:true,RCAndFloorActualCapacityAccepted:false},
  specificOpenGates:['front top-driven bolt net-section/thread/weld/material and actual tool product qualification','removable frame foot key, threaded cups and wrench geometry','head-fork positive moment receiver/clamp and capture-tool geometry','RC reinforcement/breakout, thermal point bridge and actual waterproof/air seal'],
  ordinaryRenewalAccepted:false,currentSavedDocumentAdmitted:false}
}
