/** Owning geometric/demand observer for individually renewed dry-frame members.
 * Proposed independent water receivers are explicit design geometry, not selected
 * anchors, installed clips or a replacement for current native structural proof. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import type {readUtilityCurrentGeometrySource} from './inlet-utility-proof-source.js'
import type {inletUtilityWetAssembly} from './inlet-utility-wet-assembly.js'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type Source=ReturnType<typeof readUtilityCurrentGeometrySource>
type Wet=ReturnType<typeof inletUtilityWetAssembly>
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
  members,drawnRailEndsNeedActualBoltedJointRedesign:true,normalIndependentWaterBeamCandidate:{beams,checks,failures:checks.filter(q=>q.reserveMm< -1e-7),demands,
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
  head:{fullCapturedHeadOrIndividualBowlPillarAndBoardRemovalProved:false,headRemovedBeforeAnyLoadedFrameReleaseRequired:true},
  actualIndependentWaterSupportAccepted:false,ordinaryMemberRenewalAccepted:false,
  diagnostics:['UTILITY_MEMBER/actual-bolted-end-joints-tools-and-withdrawal-not-yet-authored','UTILITY_MEMBER/full-head-capture-and-positive-rest-not-proved',
   'UTILITY_MEMBER/permanent-water-clamp-slide-fork-and-wall-anchorage-incomplete','UTILITY_MEMBER/temporary-frame-bracing-and-positive-hold-down-required',
   ...(checks.some(v=>v.reserveMm<0)?['UTILITY_MEMBER/proposed-independent-beam-geometry-conflicts']:[])]}
}
