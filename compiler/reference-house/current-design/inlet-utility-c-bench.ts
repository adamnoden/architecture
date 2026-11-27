/** Source-owned front-access C-bench geometry and conditional demand observer.
 * This replaces neither the saved house nor an RC/material/handling qualification.
 * Rear pads carry compression only. No rear bolt, friction or legacy receiver is credited. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {intersectPlan,expandPlan,planArea,validPlanRectangle,type PlanRectangle} from './inlet-orthogonal-plan.js'
import {exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {solveExplicitLinearSystem} from './inlet-fixed-thermal.js'
import {inletUtilityPortalCandidate,type inletUtilityOrdinaryCapture} from './inlet-utility-member-renewal.js'
import {inletUtilityRearTree} from './inlet-utility-rear-tree.js'
import type {readUtilityCurrentGeometrySource} from './inlet-utility-proof-source.js'
import type {inletUtilityWetAssembly} from './inlet-utility-wet-assembly.js'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type Source=ReturnType<typeof readUtilityCurrentGeometrySource>
type Wet=ReturnType<typeof inletUtilityWetAssembly>
type Part={id:string;boxMm:B;volumeUpperMm3:number;massUpperKg:number;centreMm:P;owner:string;kind:string}
type Check={id:string;phase:string;reserveMm:number}
type Control={
 schema:string;selectedForCompleteDevelopment:boolean;sourceRole:string;drainReceivers:{schema:string;wasteOuterMm:B;hotOuterMm:B;installedOnlyForControlledFiveLitreBatchesBeforeCaptureTool:boolean;activeLegacyReceiverShapesChanged:false};
 baseRailCrossMm:readonly[number,number];baseRailWallMm:number;baseRailYBoundsMm:readonly[number,number];baseRailBottomMm:number;
 rearPostSpreadPlateMm:P;frontLegSoleMm:P;rearBearingPlateMm:P;frontBearingPlateMm:P;bearingStandoffMm:P;frontReceiverAxisYMm:number;
 normalAnchorYMm:readonly number[];temporaryToolAnchorYMm:number;normalAnchorDiameterMm:number;normalAnchorHeadDiameterMm:number;normalAnchorHeadHeightMm:number;
 normalAnchorCounterboreMm:readonly[number,number];normalAnchorThroughBoreMm:number;normalAnchorLengthMm:number;anchorReinforcementMm:P;anchorBlindThreadBlockMm:P;anchorBlindBlockTopMm:number;anchorMinimumEngagementMm:number;
 frontReceiverCrossMm:readonly[number,number];frontReceiverWallMm:number;frontReceiverCrownMm:P;frontReceiverRailYBoundsMm:readonly[number,number];frontReceiverRailBottomMm:number;
 frontRCPlateMm:P;frontRCPlateXOffsetsMm:readonly number[];frontRCAnchorDiameterMm:number;frontRCAnchorHeadMm:readonly[number,number];frontRCAnchorPitchMm:readonly[number,number];frontRCAnchorEmbedMm:number;
 rearReceiverCrossMm:readonly[number,number];rearReceiverWallMm:number;rearRCPlateMm:P;rearRCPlateXOffsetsMm:readonly number[];rearRCAnchorDiameterMm:number;rearRCAnchorHeadMm:readonly[number,number];rearRCAnchorPitchMm:readonly[number,number];rearRCAnchorEmbedMm:number;
 minimumRCCoverMm:number;normalOperatingTemperatureExcursionK:number;steelExpansionPerK:number;rearGravityBearingRequiredSlideMm:number;
 eachCJointAndWeldMassCeilingKg:number;eachFrontLegJointAndWeldMassCeilingKg:number;eachCaptureClampMassCeilingKg:number;captureClampCountPerMember:number;capturePayloadDesignKg:number;memberLoadDynamicFactor:number;eachFrontReceiverWeldMassCeilingKg:number;eachRearReceiverWeldMassCeilingKg:number;
 frontLegRelease:{schema:string;liftMm:number;northMm:number;actualPinLugCaptureParkToolsAndStabilityQualified:false};
 CRelease:{schema:string;liftMm:number;southMm:number;rearHasNoAboveFloorReleaseFastener:boolean;actualWholeComponentExtractionAndPositiveCaptureQualified:false};
 allNewReceiverRCWeldThreadThermalWaterproofAndPhysicalHandlingQualified:false;frictionResistanceCredited:false;legacyReceiversTransferred:false;ordinaryRenewalAccepted:false
}
const area=(a:number,b:number,t:number)=>a*b-(a-2*t)*(b-2*t)
const inertia=(a:number,b:number,t:number)=>(a*b**3-(a-2*t)*(b-2*t)**3)/12
const centre=(b:B):P=>[b[0]+b[3]/2,b[1]+b[4]/2,b[2]+b[5]/2]
const gap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)}
const shift=(b:B,p:P):B=>[b[0]+p[0],b[1]+p[1],b[2]+p[2],b[3],b[4],b[5]]
/** Disjoint actual RC cells are a coverage domain, not holes to subtract.
 * Missing area is an area diagnostic; it is deliberately not called a distance. */
export function utilityBenchPlanCoverage(probe:PlanRectangle,cells:readonly PlanRectangle[]){
 if(!validPlanRectangle(probe)||!cells.length||cells.some(c=>!validPlanRectangle(c)))throw Error('Actual min/max RC coverage rectangles required')
 for(let a=0;a<cells.length;a++)for(let b=a+1;b<cells.length;b++){
  const x=intersectPlan(cells[a],cells[b]);if(x&&planArea(x)>1e-7)throw Error('RC coverage cells must be disjoint')
 }
 const targetAreaMm2=planArea(probe),coveredAreaMm2=cells.reduce((s,c)=>{const q=intersectPlan(probe,c);return s+(q?planArea(q):0)},0),
  missingAreaMm2=Math.max(0,targetAreaMm2-coveredAreaMm2)
 return{targetAreaMm2,coveredAreaMm2,missingAreaMm2,contained:missingAreaMm2<=1e-7,status:missingAreaMm2<=1e-7?'contained':'outside-actual-RC-cells'}
}

type PortalControl={sideAxisFromBoardEdgeMm:number;rearLegFromBoardMm:number;frontLegFromBoardMm:number;beamRearFromBoardMm:number;beamFrontFromBoardMm:number;maximumSteelDensityKgM3:number;normalFrontEdgePointComparisonN:number;normalHorizontalComparisonN:number;normalForceHeightMm:number;maximumCapturedWetHeadKg:number;matchedOneHeadFabricationBoundMm:number;headRelease:{boltDiameterMm:number;rearDowelDiameterMm:number;rearDowelCollarClearBoreMm:number};weldedRearL:{postCapPlanMm:readonly[number,number];postCapThicknessMm:number};cBench:Control}
type FrameInput={supplementaryMasses:readonly{massUpperKg:number;centreMm:P}[];Cparts:readonly Part[];frontLegParts:readonly Part[];frontLegPresent:boolean;headGravityN:number;headCGYMm:number;edgePointN:number;edgeYMm:number;horizontalN:number;forceHeightMm:number;E_MPa:number;jointStiffnessFactor:number;control:Control;rearY:number;frontY:number;beamZ:number}
/** Small Euler-Bernoulli centreline comparator. The removable front leg is
 * pin-ended and axial; rear bearing is unilateral. All frame/bolt fixity is a
 * stated conditional stiffness law, never an actual joint qualification. */
function frameDemand(i:FrameInput){
 const c=i.control,baseZ=c.baseRailBottomMm+c.baseRailCrossMm[1]/2,
  nodes:readonly(readonly[number,number])[]=[[c.frontReceiverAxisYMm,baseZ],[i.rearY,baseZ],[i.rearY,i.beamZ],[i.frontY,i.beamZ],[i.frontY,baseZ]],
  n=nodes.length*3,K=Array.from({length:n},()=>Array(n).fill(0) as number[]),F=Array(n).fill(0) as number[],
  railA=area(...c.baseRailCrossMm,c.baseRailWallMm),railI=inertia(...c.baseRailCrossMm,c.baseRailWallMm),
  postA=area(40,40,3),postI=inertia(40,40,3),beamA=area(30,40,3),beamI=inertia(30,40,3)
 const beam=(a:number,b:number,A:number,I:number)=>{
  const dy=nodes[b][0]-nodes[a][0],dz=nodes[b][1]-nodes[a][1],L=Math.hypot(dy,dz),co=dy/L,si=dz/L,E=i.E_MPa,
   q=E*A/L,v=12*E*I/L**3,w=6*E*I/L**2,r=4*E*I/L,s=2*E*I/L,
   k=[[q,0,0,-q,0,0],[0,v,w,0,-v,w],[0,w,r,0,-w,s],[-q,0,0,q,0,0],[0,-v,-w,0,v,-w],[0,w,s,0,-w,r]],
   T=[[co,si,0,0,0,0],[-si,co,0,0,0,0],[0,0,1,0,0,0],[0,0,0,co,si,0],[0,0,0,-si,co,0],[0,0,0,0,0,1]],
   ix=[a*3,a*3+1,a*3+2,b*3,b*3+1,b*3+2]
  for(let u=0;u<6;u++)for(let v=0;v<6;v++)for(let g=0;g<6;g++)for(let h=0;h<6;h++)K[ix[u]][ix[v]]+=T[g][u]*k[g][h]*T[h][v]
 }
 beam(1,4,railA,railI);beam(4,0,railA,railI);beam(1,2,postA,postI*i.jointStiffnessFactor);beam(2,3,beamA,beamI*i.jointStiffnessFactor)
 if(i.frontLegPresent){
  const a=4,b=3,L=nodes[b][1]-nodes[a][1],k=i.E_MPa*postA/L
  K[3*a+1][3*a+1]+=k;K[3*b+1][3*b+1]+=k;K[3*a+1][3*b+1]-=k;K[3*b+1][3*a+1]-=k
 }
 // Every actual member/plate/block/bolt stock weight is included. Nearest-node
 // lumping preserves its exact signed resultant and first moment.
 for(const p of[...i.Cparts,...(i.frontLegPresent?i.frontLegParts:[]),...i.supplementaryMasses]){
  let at=0,dist=Infinity
  nodes.forEach((v,k)=>{const d=Math.hypot(v[0]-p.centreMm[1],v[1]-p.centreMm[2]);if(d<dist){at=k;dist=d}})
  const W=p.massUpperKg*9.81*c.memberLoadDynamicFactor
  F[at*3+1]-=W;F[at*3+2]-=W*(p.centreMm[1]-nodes[at][0])
 }
 F[10]-=i.headGravityN+i.edgePointN;F[9]+=i.horizontalN
 F[11]-=i.headGravityN*(i.headCGYMm-i.frontY)+i.edgePointN*(i.edgeYMm-i.frontY)+i.horizontalN*(i.forceHeightMm-i.beamZ)
 const run=(rearContact:boolean)=>{
  const fixed=new Set([0,1,2,...(rearContact?[4]:[])]),free=Array.from({length:n},(_,k)=>k).filter(k=>!fixed.has(k)),
   sol=solveExplicitLinearSystem(free.map(a=>free.map(b=>K[a][b])),free.map(a=>F[a])),u=Array(n).fill(0) as number[]
  free.forEach((a,k)=>u[a]=sol[k])
  const R=K.map((row,a)=>row.reduce((s,v,b)=>s+v*u[b],0)-F[a]),
   rearN=rearContact?R[4]:0,rearGapMm=rearContact?0:u[4],
   admissible=rearContact?rearN>=-1e-7:rearGapMm>=-1e-7
  return{rearContact,rearCompressionN:rearN,rearGapMm,admissible,frontReaction:{FY_N:R[0],FZ_N:R[1],MX_Nmm:R[2]},topDisplacementMm:{Y:u[9],Z:u[10]},residualN:Math.max(...free.map(a=>Math.abs(R[a])))}
 }
 const contact=run(true),released=run(false),valid=[contact,released].filter(q=>q.admissible)
 if(valid.length===0)throw Error('No admissible unilateral rear-contact state in conditional C-frame model')
 return{selected:contact.admissible?contact:released,contactComparator:contact,releasedComparator:released,
  conditionalModel:'Euler-Bernoulli centreline C; pin-ended axial front leg; rigid front receiver; known E; varied rear-post/top-beam flexural stiffness; exact signed stock resultants, nearest-node selfweight lumping.',
  actualDeliveredJointFixityQualified:false,actualReactionQualified:false}
}

export function inletUtilityCBench(i:{source:Source;wet:Wet;capture:ReturnType<typeof inletUtilityOrdinaryCapture>}){
 const {source,wet,capture}=i,
  p=(wet.choice.coldDistribution as unknown as{frameRenewal:{portalDesign:PortalControl}}).frameRenewal.portalDesign,
  c=p.cBench,two=2*source.rearTreeContext.settingEachMm,
  history=inletUtilityPortalCandidate({source,wet,capture}),
  h=wet.choice.coldDistribution.prefabSinkHead as unknown as{topPlanMm:readonly[number,number,number,number]},
  headPlan=h.topPlanMm,xs=[headPlan[0]+p.sideAxisFromBoardEdgeMm,headPlan[0]+headPlan[2]-p.sideAxisFromBoardEdgeMm],
  yr=headPlan[1]+p.rearLegFromBoardMm,yf=headPlan[1]+headPlan[3]-p.frontLegFromBoardMm,
  beamY0=headPlan[1]+p.beamRearFromBoardMm,beamY1=headPlan[1]+headPlan[3]-p.beamFrontFromBoardMm,
  rho=p.maximumSteelDensityKgM3,parts:Part[]=[],checks:Check[]=[],
  add=(id:string,phase:string,reserveMm:number)=>checks.push({id,phase,reserveMm}),
  put=(id:string,b:B,owner:string,volume:number,kind='metal')=>{
   if(!(volume>=0)||b.some(v=>!Number.isFinite(v))||b.slice(3).some(v=>v<=0))throw Error('Invalid authored C-bench solid')
   parts.push({id,boxMm:b,owner,kind,volumeUpperMm3:volume,massUpperKg:volume*rho/1e9,centreMm:centre(b)})
  },
  box=(x:number,y:number,z:number,a:number,b:number,d:number):B=>[x-a/2,y-b/2,z,a,b,d],
  steel=(id:string,b:B,owner:string)=>put(id,b,owner,b[3]*b[4]*b[5]),
  cylinder=(id:string,x:number,y:number,z:number,D:number,L:number,owner:string)=>put(id,box(x,y,z,D,D,L),owner,Math.PI*D**2/4*L)
 if(c?.schema!=='had-utility-front-access-two-C-benches/1'||c.selectedForCompleteDevelopment!==true||two!==20||c.frictionResistanceCredited!==false||c.legacyReceiversTransferred!==false||c.ordinaryRenewalAccepted!==false||c.allNewReceiverRCWeldThreadThermalWaterproofAndPhysicalHandlingQualified!==false)throw Error('Explicit unqualified source C-bench controls required')
 const floor=source.candidateFloorPocket
 if(!floor.pocket.local)throw Error('Actual local floor pocket required')
 const rc=floor.pocket.local.levelBoxes.find(q=>q.id==='dryRC')
 if(!rc||floor.occupiedFflAbsoluteMm!==530||floor.nativeFloorOrForceApprovalTransferred!==false)throw Error('Same-source unadopted FFL530 RC pocket required')
 const rcPlans=(rc.planRectanglesXYMm??[rc.planMinMaxMm]) as readonly PlanRectangle[],
  rcBottom=rc.zMm[0]-530,rcTop=rc.zMm[1]-530,coverage:{id:string;expandedProbeMm:PlanRectangle;missingAreaMm2:number;contained:boolean;status:string}[]=[],
  cover=(id:string,b:B,extra=0)=>{
   const probe=expandPlan([b[0],b[1],b[0]+b[3],b[1]+b[4]],two+extra),q=utilityBenchPlanCoverage(probe,rcPlans)
   coverage.push({id,expandedProbeMm:probe,missingAreaMm2:q.missingAreaMm2,contained:q.contained,status:q.status})
  },
  capZ=810-p.weldedRearL.postCapThicknessMm,baseTop=c.baseRailBottomMm+c.baseRailCrossMm[1],
  spreadTop=baseTop+c.rearPostSpreadPlateMm[2],
  HSS=(id:string,b:B,t:number,owner:string)=>put(id,b,owner,area(b[3],b[5],t)*b[4])
 for(const[side,x]of xs.entries()){
  const C='C/'+side,L='front-leg/'+side,
   rail:B=[x-c.baseRailCrossMm[0]/2,c.baseRailYBoundsMm[0],c.baseRailBottomMm,c.baseRailCrossMm[0],c.baseRailYBoundsMm[1]-c.baseRailYBoundsMm[0],c.baseRailCrossMm[1]]
  HSS(C+'/base-rail',rail,c.baseRailWallMm,C)
  steel(C+'/rear-post-spreader',box(x,yr,baseTop,...c.rearPostSpreadPlateMm),C)
  put(C+'/rear-post',box(x,yr,spreadTop,40,40,capZ-spreadTop),C,area(40,40,3)*(capZ-spreadTop))
  steel(C+'/rear-post-cap',box(x,yr,capZ,...p.weldedRearL.postCapPlanMm,p.weldedRearL.postCapThicknessMm),C)
  put(C+'/top-NS-beam',[x-15,beamY0,810,30,beamY1-beamY0,40],C,area(30,40,3)*(beamY1-beamY0))
  steel(C+'/rear-bearing-plate',box(x,yr,0,...c.rearBearingPlateMm),C)
  steel(C+'/rear-bearing-standoff',box(x,yr,c.rearBearingPlateMm[2],...c.bearingStandoffMm),C)
  steel(C+'/front-bearing-plate',box(x,c.frontReceiverAxisYMm,0,...c.frontBearingPlateMm),C)
  for(const y of c.normalAnchorYMm){
   steel(C+'/front-standoff/'+y,box(x,y,c.frontBearingPlateMm[2],...c.bearingStandoffMm),C)
   const a=c.anchorReinforcementMm,blockVolume=a[0]*a[1]*a[2],
    removedHSS=area(...c.baseRailCrossMm,c.baseRailWallMm)*a[1],
    bores=Math.PI*c.normalAnchorCounterboreMm[0]**2/4*c.normalAnchorCounterboreMm[1]+Math.PI*c.normalAnchorThroughBoreMm**2/4*(a[2]-c.normalAnchorCounterboreMm[1])
   // Existing rail stock already counted: replace its complete local60mm with
   // the solid recessed anchor block, rather than silently double-count metal.
   put(C+'/anchor-reinforcement/'+y,box(x,y,c.baseRailBottomMm,...a),C,blockVolume-removedHSS-bores)
   cylinder(C+'/M20-anchor-shaft/'+y,x,y,baseTop-c.normalAnchorLengthMm,c.normalAnchorDiameterMm,c.normalAnchorLengthMm,C)
   cylinder(C+'/M20-recessed-head/'+y,x,y,baseTop-c.normalAnchorHeadHeightMm,c.normalAnchorHeadDiameterMm,c.normalAnchorHeadHeightMm,C)
   add(C+'/recessed-anchor-head/'+y,'joints',baseTop-(baseTop-c.normalAnchorHeadHeightMm+c.normalAnchorHeadHeightMm))
   const tip=baseTop-c.normalAnchorLengthMm,blockTop=c.anchorBlindBlockTopMm,
    engagement=Math.min(baseTop,blockTop)-Math.max(tip,blockTop-c.anchorBlindThreadBlockMm[2])
   add(C+'/thread-engagement/'+y,'joints',engagement-c.anchorMinimumEngagementMm)
  }
  steel(L+'/sole',box(x,yf,baseTop,...c.frontLegSoleMm),L)
  const legBottom=baseTop+c.frontLegSoleMm[2]
  put(L+'/post',box(x,yf,legBottom,40,40,capZ-legBottom),L,area(40,40,3)*(capZ-legBottom))
  steel(L+'/cap',box(x,yf,capZ,...p.weldedRearL.postCapPlanMm,p.weldedRearL.postCapThicknessMm),L)
  // Reuse only actual factory head-thread blocks/dowel geometry, not any old
  // brace, receiver, normal frame mass or physical approval.
  for(const q of history.parts.filter(q=>q.id.startsWith('portal/'+side+'/head-thread-block/')||q.id==='portal/'+side+'/rear-locating-dowel'))put(C+'/'+q.id,q.boxMm,C,q.massUpperKg/rho*1e9)
  const front='front-receiver/'+side,rcX=x+c.frontRCPlateXOffsetsMm[side],
   b=box(rcX,c.frontReceiverAxisYMm,rcTop,...c.frontRCPlateMm)
  steel(front+'/RC-plate',b,front);cover(front+'/RC-plate',b)
  const postBottom=rcTop+c.frontRCPlateMm[2],postTop=c.frontReceiverRailBottomMm
  put(front+'/RC-standoff',box(rcX,c.frontReceiverAxisYMm,postBottom,...c.frontReceiverCrossMm,postTop-postBottom),front,area(...c.frontReceiverCrossMm,c.frontReceiverWallMm)*(postTop-postBottom))
  const left=rcX>x?x+40:rcX-40,right=rcX>x?rcX+40:x-40,
   corbel:B=[left,c.frontReceiverAxisYMm-40,postTop,right-left,80,80]
  put(front+'/eccentric-corbel',corbel,front,area(80,80,6)*(right-left))
  const ry=c.frontReceiverRailYBoundsMm
  HSS(front+'/NS-receiver-rail',[x-40,ry[0],postTop,80,ry[1]-ry[0],80],c.frontReceiverWallMm,front)
  steel(front+'/flush-crown',box(x,(ry[0]+ry[1])/2,-10,...c.frontReceiverCrownMm),front)
  for(const y of[...c.normalAnchorYMm,c.temporaryToolAnchorYMm])steel(front+'/blind-thread-block/'+y,box(x,y,c.anchorBlindBlockTopMm-c.anchorBlindThreadBlockMm[2],...c.anchorBlindThreadBlockMm),front)
  for(const sx of[-1,1])for(const sy of[-1,1]){
   const ax=rcX+sx*c.frontRCAnchorPitchMm[0]/2,ay=c.frontReceiverAxisYMm+sy*c.frontRCAnchorPitchMm[1]/2,z=rcTop-c.frontRCAnchorEmbedMm,
    id=front+'/cast-anchor/'+sx+'/'+sy,D=c.frontRCAnchorDiameterMm,hd=c.frontRCAnchorHeadMm
   cylinder(id,ax,ay,z,D,c.frontRCAnchorEmbedMm+c.frontRCPlateMm[2]+20,front)
   const head=box(ax,ay,z-hd[1],hd[0],hd[0],hd[1]);put(id+'/head',head,front,Math.PI*hd[0]**2/4*hd[1]);cover(id,head,c.minimumRCCoverMm)
   add(id+'/bottom-cover','RC-cover',z-hd[1]-rcBottom-c.minimumRCCoverMm-two)
  }
  const rear='rear-gravity-receiver/'+side,rx=x+c.rearRCPlateXOffsetsMm[side],rp=box(rx,yr,rcTop,...c.rearRCPlateMm)
  steel(rear+'/RC-plate',rp,rear);cover(rear+'/RC-plate',rp)
  const topZ=-c.rearRCPlateMm[2]-c.rearReceiverCrossMm[1],bottom=rcTop+c.rearRCPlateMm[2]
  put(rear+'/standoff',box(rx,yr,bottom,...c.rearReceiverCrossMm,topZ-bottom),rear,area(...c.rearReceiverCrossMm,c.rearReceiverWallMm)*(topZ-bottom))
  const rx0=Math.min(rx,x)-20,rx1=Math.max(rx,x)+20
  put(rear+'/corbel',[rx0,yr-20,topZ,rx1-rx0,40,40],rear,area(40,40,5)*(rx1-rx0))
  steel(rear+'/flush-gravity-pad',box(x,yr,-c.rearRCPlateMm[2],c.rearBearingPlateMm[0],c.rearBearingPlateMm[1],c.rearRCPlateMm[2]),rear)
  for(const sx of[-1,1])for(const sy of[-1,1]){
   const ax=rx+sx*c.rearRCAnchorPitchMm[0]/2,ay=yr+sy*c.rearRCAnchorPitchMm[1]/2,z=rcTop-c.rearRCAnchorEmbedMm,id=rear+'/cast-anchor/'+sx+'/'+sy,hd=c.rearRCAnchorHeadMm
   cylinder(id,ax,ay,z,c.rearRCAnchorDiameterMm,c.rearRCAnchorEmbedMm+c.rearRCPlateMm[2]+15,rear)
   const head=box(ax,ay,z-hd[1],hd[0],hd[0],hd[1]);put(id+'/head',head,rear,Math.PI*hd[0]**2/4*hd[1]);cover(id,head,c.minimumRCCoverMm)
   add(id+'/bottom-cover','RC-cover',z-hd[1]-rcBottom-c.minimumRCCoverMm-two)
  }
 }

 const mainCheck=(id:string,b:B,emit:(id:string,reserve:number)=>void,cover=0)=>{
  for(const q of[{id:source.route.valve.id+'/body',boxMm:source.route.valve.insulatedValveBodyEnvelopeMm},{id:source.route.valve.id+'/stem-wheel',boxMm:source.route.valve.stemWheelEnvelopeMm}])emit(id+'/'+q.id,gap(b,q.boxMm)-two-cover)
  for(const path of source.route.paths){
   for(const q of path.straight)emit(id+'/'+path.id+'/'+q.index,exactSegmentBoxDistance(q.a,q.b,b)-source.route.geometry.jacketRadiusMm-two-cover)
   for(const q of path.corners)if(q.kind==='boxed-compression-elbow')emit(id+'/'+q.id,gap(b,q.boxMm)-two-cover)
   else if(q.arcMm)for(let k=1;k<q.arcMm.length;k++)emit(id+'/'+q.id+'/'+k,exactSegmentBoxDistance(q.arcMm[k-1],q.arcMm[k],b)-source.route.geometry.jacketRadiusMm-q.arcCoverMm-two-cover)
  }
 },
 actualBoundary=source.boundary.finishedCoreRectanglesXYMm.map((q,k)=>({id:'same-native-SE-finished-return/'+k,boxMm:[q[0],q[1],0,q[2]-q[0],q[3]-q[1],source.rearTreeContext.ceilingMm] as B})),
 foreign=[...actualBoundary,...source.rearTreeContext.obstacles.filter(q=>!q.id.startsWith('IAS/frame/')&&q.presence!=='carry-bar-after-park'&&q.presence!=='head-before-strip')],
  water=[...wet.cold.geometry.parts.filter(q=>!q.cap).map(q=>({id:'cold/'+q.id,boxMm:q.wrapped})),...wet.hot.normalPermanentEnvelopes,...capture.waste.parts.map(q=>({id:q.id,boxMm:q.boxMm}))],
  retained=source.rearTreeContext.retainedPaths,
  newFrame=parts.filter(q=>q.owner.startsWith('C/')||q.owner.startsWith('front-leg/')),
  factoryHead=history.parts.filter(q=>q.group==='factory-head'),
  checkWorld=(id:string,phase:string,b:B,obstacles:readonly{id:string;boxMm:B}[],paths=true)=>{
   for(const q of obstacles)add(id+'/'+q.id,phase,gap(b,q.boxMm)-two)
   mainCheck(id,b,(key,reserve)=>add(key,phase,reserve))
   const room=source.input.roomPlanMm
   add(id+'/room-west',phase,b[0]-room[0]-two);add(id+'/room-east',phase,room[0]+room[2]-b[0]-b[3]-two)
   add(id+'/room-south',phase,b[1]-room[1]-two);add(id+'/room-north',phase,room[1]+room[3]-b[1]-b[4]-two)
   add(id+'/source-ceiling',phase,source.rearTreeContext.ceilingMm-b[2]-b[5]-two)
   if(paths)for(const q of retained)for(let k=1;k<q.pointsMm.length;k++)add(id+'/'+q.id+'/'+k,phase,exactSegmentBoxDistance(q.pointsMm[k-1],q.pointsMm[k],b)-q.radiusWithSupportsMm-two)
  }
 for(const a of newFrame){
  checkWorld(a.id,'normal-wet',a.boxMm,[...foreign,...water])
  for(const q of capture.headParts){
   const matchedDowel=a.id.endsWith('/rear-locating-dowel')&&q.id.startsWith('head/board/'),allowance=matchedDowel?0.5:two
   add(a.id+'/'+q.id,'normal-whole-head',gap(a.boxMm,q.boxMm)-allowance)
  }
  const side=a.owner.split('/')[1],upper=a.id.includes('/top-NS-beam')||a.id.includes('/portal/'),
   matched=p.matchedOneHeadFabricationBoundMm
  for(const b of factoryHead){
   const sameSide=b.id.startsWith('head/factory-side-rib/'+side)||b.id.startsWith('head/load-boss/'+side+'/')
    ||b.id.startsWith('head/rear-locating-collar/'+side)||b.id.startsWith('head/mount-bolt/'+side+'/')
    ||(side==='0'&&b.id==='head/left-corner-load-band')||(side==='1'&&b.id==='head/right-front-rib-extension'),
    qGap=gap(a.boxMm,b.boxMm),planeBearing=upper&&sameSide&&Math.abs(a.boxMm[2]+a.boxMm[5]-b.boxMm[2])<1e-7,
    sameXY=Math.hypot(a.centreMm[0]-(b.boxMm[0]+b.boxMm[3]/2),a.centreMm[1]-(b.boxMm[1]+b.boxMm[4]/2))<1e-7,
    normalBoltBore=upper&&b.id.startsWith('head/mount-bolt/'+side+'/')&&
     (a.id.includes('/top-NS-beam')||sameXY)&&Math.abs(b.boxMm[0]+b.boxMm[3]/2-xs[Number(side)])<1e-7&&b.boxMm[3]===p.headRelease.boltDiameterMm,
    normalDowelBore=a.id.endsWith('/rear-locating-dowel')&&
     (b.id==='head/rear-locating-collar/'+side||b.id==='head/factory-side-rib/'+side)&&
     p.headRelease.rearDowelCollarClearBoreMm>=p.headRelease.rearDowelDiameterMm+2*matched
   // Only the authored M10 through-bore, matching rear-dowel bore and exact
   //850 compression plane are intentional metal interfaces. Other head stock
   // still has its actual geometric gap checked; no whole-group exclusion.
   const reserve=normalBoltBore?(1/2-matched):normalDowelBore?(p.headRelease.rearDowelCollarClearBoreMm-p.headRelease.rearDowelDiameterMm)/2-matched:
    planeBearing?0:qGap-(upper&&sameSide?matched:two)
   add(a.id+'/'+b.id,'normal-head',reserve)
  }
 }
 for(const[side]of xs.entries()){
  const same=history.parts.find(q=>q.id==='portal/'+side+'/side-upper')!,
   now=newFrame.find(q=>q.id==='C/'+side+'/top-NS-beam')!
  add('exact-upper-bearing-geometry/'+side,'source-join',JSON.stringify(same.boxMm)===JSON.stringify(now.boxMm)?0:-1)
 }
 const candidateCold=inletUtilityRearTree({choice:wet.choice,context:{...source.rearTreeContext,
  obstacles:[...source.rearTreeContext.obstacles.filter(q=>!q.id.startsWith('IAS/frame/')),...[...newFrame,...factoryHead].map(q=>({id:'C-bench/'+q.id,boxMm:q.boxMm,presence:'always' as const}))]}}),
  coldFailures=candidateCold.geometry.failures.filter(q=>['normal','operation','nonmate-metal','fitting-legs'].includes(q.phase)),
  d=wet.choice.coldDistribution as unknown as{wasteService:{receiverOuterMm:B;maximumReceiverWallMm:number;minimumVerifiedUsableL:number};hotService:{receiverOuterMm:B;receiverMaximumWallMm:number;receiverUsableMinimumL:number}},
  bins=[{id:'waste-bin',boxMm:c.drainReceivers.wasteOuterMm,wall:d.wasteService.maximumReceiverWallMm,net:d.wasteService.minimumVerifiedUsableL},{id:'hot-bin',boxMm:c.drainReceivers.hotOuterMm,wall:d.hotService.receiverMaximumWallMm,net:d.hotService.receiverUsableMinimumL}],
  binStock=bins.map(b=>{
   const B0=b.boxMm,t=b.wall,inner=(B0[3]-2*t)*(B0[4]-2*t)*(B0[5]-2*t),cavity=(B0[3]-2*t)*(B0[4]-2*t)*(B0[5]-t),steelVolume=B0[3]*B0[4]*B0[5]-cavity,
    massKg=steelVolume*rho/1e9,waterBatchKg=5,centreMm=centre(B0)
   checkWorld(b.id,'drain-bins',B0,newFrame)
   return{id:b.id,boxMm:B0,steelVolumeUpperMm3:steelVolume,dryUpperKg:massKg,maximumBatchWaterKg:waterBatchKg,combinedBatchMassKg:massKg+waterBatchKg,centreMm,grossInternalLitres:cavity/1e6,geometricCapacityWith2mmFreeboardLitres:inner/1e6,verifiedUsableLitresRequirement:b.net,usableReserveLitres:inner/1e6-b.net,actualStiffnessCapacityAndHandlingQualified:false}
  }),
  mass=(owner:string,joints:number)=>{
   const ps=parts.filter(q=>q.owner===owner),stock=ps.reduce((s,q)=>s+q.massUpperKg,0),
    clamps=c.captureClampCountPerMember*c.eachCaptureClampMassCeilingKg,total=stock+joints+clamps,
    stockCG:P=[0,1,2].map(k=>ps.reduce((s,q)=>s+q.massUpperKg*q.centreMm[k],0)/stock) as unknown as P,
    min:P=[0,1,2].map(k=>Math.min(...ps.map(q=>q.boxMm[k]))) as unknown as P,
    max:P=[0,1,2].map(k=>Math.max(...ps.map(q=>q.boxMm[k]+q.boxMm[k+3]))) as unknown as P
   return{owner,stockUpperKg:stock,jointAndWeldMassCeilingKg:joints,captureClampMassCeilingKg:clamps,
    capturedDesignCeilingDerivedKg:Math.ceil(total*2)/2,totalCapturedUpperKg:total,
    payloadReserveKg:c.capturePayloadDesignKg-total,stockCGMm:stockCG,
    CGWithUnplacedWeldAndClampMassBoxMm:[...min,...max.map((v,k)=>v-min[k])] as unknown as B,
    captureClampEnvelopeAndActualPositiveHandlingQualified:false}
  },
  captured=xs.flatMap((_,side)=>[mass('C/'+side,c.eachCJointAndWeldMassCeilingKg),mass('front-leg/'+side,c.eachFrontLegJointAndWeldMassCeilingKg)]),
  frameSteelUpperKg=newFrame.reduce((s,q)=>s+q.massUpperKg,0),
  fixedReceiverSteelUpperKg=parts.filter(q=>q.owner.includes('receiver/')).reduce((s,q)=>s+q.massUpperKg,0),
  frameJointMassUpperKg=2*(c.eachCJointAndWeldMassCeilingKg+c.eachFrontLegJointAndWeldMassCeilingKg),fixedReceiverWeldMassUpperKg=2*(c.eachFrontReceiverWeldMassCeilingKg+c.eachRearReceiverWeldMassCeilingKg),
  signedDemandCases:(ReturnType<typeof frameDemand>&{side:number;frontRCWrench:{FX_N:number;FY_N:number;FZ_N:number;MX_Nmm:number;MY_Nmm:number;MZ_Nmm:number};rearRCWrench:{FZ_N:number;MY_Nmm:number};jointStiffnessFactor:number;weldMassCGEnd:string})[]=[]
 for(const[side]of xs.entries())for(const jointStiffnessFactor of[0.5,1,2])for(const horizontalN of[-p.normalHorizontalComparisonN,p.normalHorizontalComparisonN])for(const headCGYMm of[headPlan[1],headPlan[1]+headPlan[3]])for(const end of[0,1]){
  const input:FrameInput={supplementaryMasses:[{massUpperKg:c.eachCJointAndWeldMassCeilingKg,centreMm:[xs[side],c.baseRailYBoundsMm[end],capZ]},{massUpperKg:c.eachFrontLegJointAndWeldMassCeilingKg,centreMm:[xs[side],yf+(end?1:-1)*c.frontLegSoleMm[1]/2,capZ]}],Cparts:parts.filter(q=>q.owner==='C/'+side),frontLegParts:parts.filter(q=>q.owner==='front-leg/'+side),frontLegPresent:true,
   headGravityN:p.maximumCapturedWetHeadKg*9.81*c.memberLoadDynamicFactor,headCGYMm,
   edgePointN:p.normalFrontEdgePointComparisonN*(1+(headPlan[0]+headPlan[2]+two-xs[1])/(xs[1]-xs[0])),edgeYMm:headPlan[1]+headPlan[3],horizontalN,
   forceHeightMm:p.normalForceHeightMm+two,E_MPa:193000,jointStiffnessFactor,control:c,rearY:yr,frontY:yf,beamZ:830}
  const r=frameDemand(input),f=r.selected.frontReaction,rx=xs[side]+c.frontRCPlateXOffsetsMm[side],
   fixedStock=parts.filter(q=>q.owner==='front-receiver/'+side),rearStock=parts.filter(q=>q.owner==='rear-gravity-receiver/'+side),
   frontOwnN=fixedStock.reduce((s,q)=>s+q.massUpperKg,0)*9.81*c.memberLoadDynamicFactor,
   rearOwnN=rearStock.reduce((s,q)=>s+q.massUpperKg,0)*9.81*c.memberLoadDynamicFactor,
   frontWeldN=c.eachFrontReceiverWeldMassCeilingKg*9.81*c.memberLoadDynamicFactor,rearWeldN=c.eachRearReceiverWeldMassCeilingKg*9.81*c.memberLoadDynamicFactor,
   frontRCWrench={FX_N:0,FY_N:-f.FY_N,FZ_N:-f.FZ_N-frontOwnN-frontWeldN,
    MX_Nmm:-f.MX_Nmm+(c.baseRailBottomMm+c.baseRailCrossMm[1]/2-rcTop)*f.FY_N-fixedStock.reduce((s,q)=>s+q.massUpperKg*9.81*c.memberLoadDynamicFactor*(q.centreMm[1]-c.frontReceiverAxisYMm),0),
    MY_Nmm:(xs[side]-rx)*f.FZ_N+fixedStock.reduce((s,q)=>s+q.massUpperKg*9.81*c.memberLoadDynamicFactor*(q.centreMm[0]-rx),0),
    MZ_Nmm:-(xs[side]-rx)*f.FY_N},
   rearRCWrench={FZ_N:-r.selected.rearCompressionN-rearOwnN-rearWeldN,MY_Nmm:-c.rearRCPlateXOffsetsMm[side]*r.selected.rearCompressionN+rearStock.reduce((s,q)=>s+q.massUpperKg*9.81*c.memberLoadDynamicFactor*(q.centreMm[0]-(xs[side]+c.rearRCPlateXOffsetsMm[side])),0)}
  signedDemandCases.push({...r,side,frontRCWrench,rearRCWrench,jointStiffnessFactor,weldMassCGEnd:end?'north':'south'})
 }
 // Include explicit declared joint/weld mass in the complete comparison. It
 // cannot disappear merely because its as-delivered local envelope is unknown.
 const jointGravityUpperN=frameJointMassUpperKg*9.81*c.memberLoadDynamicFactor,
  missingInterfaces=[
   'Positive front-leg capture ears/pins, separate locked park and front-only installation tools',
   'Positive C-frame capture and full extraction/park beyond the first40UP/50S release',
   'Head/fork-to-new-front-receiver load path, all new tool steel/actuator/bin/capture mass and actual signed combined wrench',
   'Actual removable front-leg-to-base/top pin or bolt groups, welds, counterhold/socket envelopes and local HSS resistance',
   'Actual RC anchor/plate/corbel stiffness and strength, waterproof/air/thermal closure through renewable floor layers'
  ],
  raisedHead=[...capture.headParts,...factoryHead].map(q=>({id:'raised/'+q.id,boxMm:shift(q.boxMm,[0,0,capture.controls.liftMm])})),
  currentCapture=capture.hardware.filter(q=>q.id.startsWith('capture/')&&!q.afterFrameKnockdown).map(q=>({id:q.id,boxMm:shift(q.boxMm,[0,0,q.id.startsWith('capture/fork/')?capture.controls.liftMm:0])})),
  finiteChecks:Check[]=[],
  finite=(owner:string,phase:string,from:P,to:P,obstacles:readonly{id:string;boxMm:B}[])=>{
   const n=Math.max(1,Math.ceil(Math.hypot(...to.map((v,k)=>v-from[k]))/5)),cover=Math.hypot(...to.map((v,k)=>v-from[k]))/(2*n),
    own=parts.filter(q=>q.owner===owner&&!q.id.includes('/M20-'))
   for(let k=0;k<n;k++){
    const t=(k+0.5)/n,delta:P=from.map((v,j)=>v+t*(to[j]-v)) as unknown as P
    for(const a of own){
     const b=shift(a.boxMm,delta)
     mainCheck(owner+'/'+a.id,b,(id,reserveMm)=>finiteChecks.push({id,phase,reserveMm}),cover)
     const room=source.input.roomPlanMm,axisCover=to.map((v,k)=>Math.abs(v-from[k])/(2*n))
     for(const k of[0,1]){
      finiteChecks.push({id:owner+'/'+a.id+'/room-min/'+k,phase,reserveMm:b[k]-axisCover[k]-room[k]-two})
      finiteChecks.push({id:owner+'/'+a.id+'/room-max/'+k,phase,reserveMm:room[k]+room[k+2]-b[k]-b[k+3]-axisCover[k]-two})
     }
     finiteChecks.push({id:owner+'/'+a.id+'/floor-contact',phase,reserveMm:b[2]-axisCover[2]})
     finiteChecks.push({id:owner+'/'+a.id+'/ceiling',phase,reserveMm:source.rearTreeContext.ceilingMm-b[2]-b[5]-two-axisCover[2]})
     for(const q of obstacles){
      // Matched normal gravity faces may slide or separate after actual capture
      // and joint release. Only the exact cap/beam, sole/rail or bearing/pad
      // plane is admitted; it never permits physical metal penetration.
      const mate=(a.id.endsWith('/cap')&&q.id===owner.replace('front-leg/','C/')+'/top-NS-beam')
       ||(a.id.endsWith('/sole')&&(q.id===owner.replace('front-leg/','C/')+'/base-rail'||q.id.startsWith(owner.replace('front-leg/','C/')+'/anchor-reinforcement/')))
       ||(a.id.endsWith('/rear-bearing-plate')&&q.id==='rear-gravity-receiver/'+owner.split('/')[1]+'/flush-gravity-pad')
       ||(a.id.endsWith('/front-bearing-plate')&&q.id==='front-receiver/'+owner.split('/')[1]+'/flush-crown'),
       normalFace=a.id.endsWith('/cap')?a.boxMm[2]+a.boxMm[5]<=q.boxMm[2]+1e-7:a.boxMm[2]>=q.boxMm[2]+q.boxMm[5]-1e-7,
       noPenetration=a.id.endsWith('/cap')?b[2]+b[5]<=q.boxMm[2]+1e-7:b[2]>=q.boxMm[2]+q.boxMm[5]-1e-7,
       separationMonotone=to[2]>=from[2]&&from[2]>=0,
       intentional=mate&&normalFace&&noPenetration&&separationMonotone
      finiteChecks.push({id:owner+'/'+a.id+'/'+q.id,phase,reserveMm:intentional?Math.max(0,gap(b,q.boxMm)):gap(b,q.boxMm)-two-cover})
     }
     for(const q of retained)for(let v=1;v<q.pointsMm.length;v++)finiteChecks.push({id:owner+'/'+a.id+'/'+q.id+'/'+v,phase,reserveMm:exactSegmentBoxDistance(q.pointsMm[v-1],q.pointsMm[v],b)-q.radiusWithSupportsMm-two-cover})
    }
   }
   return{phase,owner,fromMm:from,toMm:to,sampleCount:n,maximumStepMm:2*cover,chordCoverMm:cover}
  },
  movements:ReturnType<typeof finite>[]=[]
 for(const[side]of xs.entries()){
  const L='front-leg/'+side,C='C/'+side,
   fixed=[...foreign,...water,...raisedHead,...currentCapture,
    ...newFrame.filter(q=>q.owner!==L&&q.owner!==C).map(q=>({id:q.id,boxMm:q.boxMm}))],
   Cbody=parts.filter(q=>q.owner===C&&!q.id.includes('/M20-')).map(q=>({id:q.id,boxMm:q.boxMm}))
  // Head is already independently captured; the unloaded front cap and sole
  // slide NORTH on their exact normal bearing planes before the leg lifts.
  movements.push(finite(L,'front-leg-NORTH',[0,0,0],[0,c.frontLegRelease.northMm,0],[...fixed,...Cbody]))
  movements.push(finite(L,'front-leg-UP',[0,c.frontLegRelease.northMm,0],[0,c.frontLegRelease.northMm,c.frontLegRelease.liftMm],[...fixed,...Cbody]))
  const otherFrames=newFrame.filter(q=>q.owner!==C&&q.owner!==L).map(q=>({id:q.id,boxMm:q.boxMm})),
   receivers=parts.filter(q=>q.owner.includes('receiver/')).map(q=>({id:q.id,boxMm:q.boxMm})),
   Cfixed=[...foreign,...water,...raisedHead,...currentCapture,...otherFrames,...receivers]
  movements.push(finite(C,'C-UP',[0,0,0],[0,0,c.CRelease.liftMm],Cfixed))
  movements.push(finite(C,'C-SOUTH',[0,0,c.CRelease.liftMm],[0,-c.CRelease.southMm,c.CRelease.liftMm],Cfixed))
 }
 const normalFailures=checks.filter(q=>q.reserveMm< -1e-7),finiteFailures=finiteChecks.filter(q=>q.reserveMm< -1e-7),
  thermalTravelMm=c.normalOperatingTemperatureExcursionK*c.steelExpansionPerK*Math.abs(c.frontReceiverAxisYMm-yr)
 return{schema:'had-utility-front-access-C-bench-observer/1',
  sourceDigest:sha256SemanticFingerprint({source:source.bindingDigest,floor:floor.bindingDigest,choice:wet.choice,controls:c}),
  sourceControllingChoice:wet.choice.id,parts,checks,normalFailures,coldFailures,normalNecessary:normalFailures.length===0&&coldFailures.length===0&&binStock.every(q=>q.usableReserveLitres>=0)&&history.normalBearing.necessary,
  normalBearing:{sameActualFactoryHeadPartsUsed:true,datumMm:850,beamTopMm:850,rearPostCapTopMm:810,frontLegCapTopMm:810,headSteelAndWaterUpperKg:history.mass.completeHeadWetUpperKg,exactExistingMatchedBearingGeometryNecessary:history.normalBearing.necessary,actualCapacityQualified:false},
  RC:{sameSourcePocketDigest:floor.bindingDigest,rcTopLocalMm:rcTop,rcBottomLocalMm:rcBottom,actualPlanRectanglesMm:rcPlans,coverage,coverageFailures:coverage.filter(q=>!q.contained),nativeForceOrFloorApprovalTransferred:false},
  stock:{frameSteelUpperKg,frameJointMassUpperKg,frameMassUpperKg:frameSteelUpperKg+frameJointMassUpperKg,fixedReceiverSteelUpperKg,fixedReceiverWeldMassUpperKg,binStock,captured,
   everyPlacedMetalPartHasStockAndCG:true,unplacedWeldAndClampCeilingsExplicit:true,
   completeToolCaptureInstallationMassAccounted:false,legacyFrameOrReceiverMassBorrowed:false},
  thermal:{temperatureExcursionK:c.normalOperatingTemperatureExcursionK,freeRearBearingTravelMm:thermalTravelMm,declaredRearTravelMm:c.rearGravityBearingRequiredSlideMm,reserveMm:c.rearGravityBearingRequiredSlideMm-thermalTravelMm,
   rearHorizontalRestraintN:0,rearTensionCapacityCreditedN:0,frictionResistanceCreditedN:0,actualDeliveredSlideLawQualified:false},
  loads:{signedDemandCases,jointGravityUpperN,jointGravityIncludedAtBothActualMemberPlanExtrema:true,
   completeCommonReceiverWrenchDerived:false,allHeadWeightAndFrontEdgePointAppliedToEachSingleSideIsConservativeLocalComparator:true,frontEdgeSideAmplificationIncludes20mmXSettings:true,normalFrameAndReceiverOwnStockWrenchesDerived:true,unmodelledOutOfPlane200NCaseStillRequired:true,
   actualRCOrJointCapacityAccepted:false},
  finite:{movements,checks:finiteChecks,failures:finiteFailures,firstReleaseNecessary:finiteFailures.length===0,
   fullCFrameExtractionAndParkProved:false,positiveCaptureAndParkToolsProved:false,completeOrdinaryCrewJointReachProved:false},
  historicalSevenBrace:{sourceCommit:'fc715cdfcfa2bbcefbc9bd4de72c047edd85b1e4',finiteFailureCount:35,ordinaryRenewalAccepted:false},
  missingInterfaces,ordinaryRenewalAccepted:false,physicalInstallationAdmitted:false,currentSavedDocumentAdmitted:false}
}
