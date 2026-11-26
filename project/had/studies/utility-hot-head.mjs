
/** Current ordinary hot-head connection. Geometry only; actual source controls,
 * products, pipe forming, supports, pressure and physical work remain explicit. */
import {utilityRetainedHotGeometry} from './incoming-water-terminal.mjs';
import {finiteBends,exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),point=p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite),
 gap=(a,b)=>{const q=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return q.some(v=>v>0)?Math.hypot(...q.map(v=>Math.max(v,0))):Math.max(...q)},
 move=(b,p)=>[b[0]+p[0],b[1]+p[1],b[2]+p[2],...b.slice(3)],
 union=bs=>{const lo=[0,1,2].map(k=>Math.min(...bs.map(b=>b[k]))),hi=[0,1,2].map(k=>Math.max(...bs.map(b=>b[k]+b[k+3])));return[...lo,...hi.map((v,k)=>v-lo[k])]},
 box=(p,r,half)=>[p[0]-r,p[1]-r,p[2]-half,2*r,2*r,half],
 len=path=>path.slice(1).reduce((n,p,k)=>n+Math.hypot(...p.map((v,j)=>v-path[k][j])),0);
export function deriveUtilityHotHead({choice,sourceHotVertices,head,obstacles=[],settingEachMm=10}){
 const c=choice,r=utilityRetainedHotGeometry(sourceHotVertices),start=r.terminal.at(-1),end=head.hotPortMm,two=2*settingEachMm;
 if(!c||c.schema!=='had-utility-hot-head/1'||c.sourceCutId!=='P/Utility-H0-hot-cut'||!Array.isArray(c.virtualSpoolMm)||c.virtualSpoolMm.length!==4||c.virtualSpoolMm.some(p=>!point(p))||!same(c.virtualSpoolMm[0],start)||!same(c.virtualSpoolMm.at(-1),end)
  ||![c.centrelineRadiusMm,c.tubeMaximumODMm,c.tubeMinimumWallMm,c.jacketRadialMm,c.sourceUnionBareDiameterMm,c.sourceUnionHalfLengthMm,c.headUnionAFMm,c.headUnionHalfLengthMm,c.headInitialLiftMm,c.spoolReleaseUpMm,c.spoolNorthToRestMm,c.maximumColdMaintenanceC,c.maximumPartialBatchL,c.receiverUsableMinimumL,c.receiverMaximumWallMm].every(Number.isFinite)
  ||c.centrelineRadiusMm<4*c.tubeMaximumODMm||c.tubeMinimumWallMm<=0||c.tubeMaximumODMm<=2*c.tubeMinimumWallMm||c.jacketRadialMm<26||c.sourceUnionBareDiameterMm<80||c.sourceUnionHalfLengthMm<30||c.headUnionAFMm<24||c.headUnionHalfLengthMm<32||c.headInitialLiftMm<35||c.spoolReleaseUpMm<10||c.headInitialLiftMm-c.spoolReleaseUpMm<20||c.spoolNorthToRestMm<100||c.maximumColdMaintenanceC<0||c.maximumColdMaintenanceC>40||c.maximumPartialBatchL<=0||c.maximumPartialBatchL>5||c.receiverUsableMinimumL<=0||c.receiverMaximumWallMm<2
  ||!Array.isArray(c.receiverOuterMm)||c.receiverOuterMm.length!==6||!c.receiverOuterMm.every(Number.isFinite)||c.receiverOuterMm.slice(3).some(v=>v<=2*c.receiverMaximumWallMm)||!Number.isFinite(settingEachMm)||settingEachMm<10||obstacles.some(o=>!o.id||!Array.isArray(o.boxMm)||o.boxMm.length!==6||o.boxMm.some(v=>!Number.isFinite(v))))throw Error('Unsupported actual H0, hot-head source, formed spool or receiver');
 const bends=finiteBends(c.virtualSpoolMm,c.centrelineRadiusMm,.5),tubeR=c.tubeMaximumODMm/2+c.jacketRadialMm,headBareR=c.headUnionAFMm/(2*Math.cos(Math.PI/6)),
  sourceFace=start,headFace=end,sourceBare=box(sourceFace,c.sourceUnionBareDiameterMm/2,0).map((v,k)=>k===5?c.sourceUnionHalfLengthMm:v),
  headBare=box(headFace,headBareR,c.headUnionHalfLengthMm),
  expanded=(b,n)=>[b[0]-n,b[1]-n,b[2]-n,b[3]+2*n,b[4]+2*n,b[5]+2*n],
  fixedSourceBare=[start[0]-c.sourceUnionBareDiameterMm/2,start[1]-c.sourceUnionBareDiameterMm/2,start[2]-c.sourceUnionHalfLengthMm,c.sourceUnionBareDiameterMm,c.sourceUnionBareDiameterMm,c.sourceUnionHalfLengthMm],
  normal=[{id:'U/hot/source-fixed-union',boxMm:expanded(fixedSourceBare,c.jacketRadialMm)},{id:'U/hot/source-moving-union',boxMm:expanded(sourceBare,c.jacketRadialMm)},{id:'U/hot/head-moving-union',boxMm:expanded(headBare,c.jacketRadialMm)}],
  checks=[],add=(id,kind,reserveMm)=>checks.push({id,kind,reserveMm});
 for(let k=1;k<bends.path.length;k++){const a=bends.path[k-1],b=bends.path[k],q=[...a.map((v,j)=>Math.min(v,b[j])-tubeR-bends.hausdorffError),...a.map((v,j)=>Math.abs(v-b[j])+2*(tubeR+bends.hausdorffError))];normal.push({id:'U/hot/formed-spool/'+k,boxMm:q})}
 for(const m of normal)for(const o of obstacles)add(m.id+'/'+o.id,'normal',gap(m.boxMm,o.boxMm)-two);
 add('hot/source-straight-before-first-bend','fitting-leg',c.virtualSpoolMm[1][2]-bends.bends[0].tangent-start[2]-c.sourceUnionHalfLengthMm-two);
 add('hot/head-straight-after-last-bend','fitting-leg',end[2]-c.headUnionHalfLengthMm-c.virtualSpoolMm[2][2]-bends.bends[1].tangent-two);
 const headLift=c.headInitialLiftMm,up=c.spoolReleaseUpMm;
 add('hot/upper-face-clearance-after-head-lift-and-spool-up','ordered-release',headLift-up-two);
 add('hot/lower-face-separation-before-north','ordered-release',up-10);
 const sourceBodyOuterL=r.isolation.bodyBox.slice(3).reduce((a,b)=>a*b,1)/1e6,
  h0LowerFace=r.isolation.bodyBox[2],backboneTailMm=h0LowerFace-r.backbone.at(-1)[2],
  backboneOuterL=Math.PI*37**2*backboneTailMm/1e6,terminalOuterL=Math.PI*25**2*len(r.terminal)/1e6,
  spoolWaterL=Math.PI/4*(c.tubeMaximumODMm-2*c.tubeMinimumWallMm)**2*len(bends.path)/1e6,
  sourceUnionOuterL=c.sourceUnionBareDiameterMm**2*(2*c.sourceUnionHalfLengthMm)/1e6,
  headUnionOuterL=(2*headBareR)**2*(2*c.headUnionHalfLengthMm)/1e6,
  actualDrainEnvelope=[r.drainTee[0]-50,r.drainTee[1]-50,150,100,100,r.drainTee[2]-150],
  drainOuterL=actualDrainEnvelope.slice(3).reduce((a,b)=>a*b,1)/1e6,
  localWaterUpperL=sourceBodyOuterL+backboneOuterL+terminalOuterL+spoolWaterL+sourceUnionOuterL+headUnionOuterL+drainOuterL,
  bin=c.receiverOuterMm,w=c.receiverMaximumWallMm,innerGrossL=(bin[3]-2*w)*(bin[4]-2*w)*(bin[5]-2*w)/1e6,spout=[r.drainTee[0],r.drainTee[1],150];
 add('hot/finite-H0-local-envelope-water-versus-receiver','inventory',c.receiverUsableMinimumL-localWaterUpperL);
 add('hot/receiver-required-net-below-physical-inner-ceiling','inventory',innerGrossL-c.receiverUsableMinimumL);
 add('hot/receiver-airgap','receiver',spout[2]-bin[2]-bin[5]-two);
 add('hot/spout-within-receiver-rim','receiver',Math.min(spout[0]-bin[0]-w,bin[0]+bin[3]-w-spout[0],spout[1]-bin[1]-w,bin[1]+bin[4]-w-spout[1])-two);
 for(const o of obstacles)add('hot/receiver/'+o.id,'receiver',gap(bin,o.boxMm)-two);

 const frontRail=obstacles.find(o=>o.id===c.frontUpperRailId),
  moving=normal.filter(m=>m.id!=='U/hot/source-fixed-union'),
  before=[0,0,up],after=[0,c.spoolNorthToRestMm,up],
  phaseObstacles=obstacles.filter(o=>o.id!==c.frontUpperRailId&&o.id!=='current-prefab-bowl'),
  renewalChecks=moving.flatMap(m=>phaseObstacles.map(o=>({id:m.id+'/'+o.id,kind:'spool-north-after-explicit-member-release',reserveMm:gap(union([move(m.boxMm,before),move(m.boxMm,after)]),o.boxMm)-two}))),
  blockedControl=frontRail?moving.map(m=>({id:m.id+'/'+frontRail.id,kind:'upper-rail-still-present-rejected-control',reserveMm:gap(union([move(m.boxMm,before),move(m.boxMm,after)]),frontRail.boxMm)-two})):[];
 if(!frontRail||c.frontUpperRailRemovedBeforeSpoolNorth!==true||c.headFullyRemovedBeforeFrontRailReleaseRequired!==true)renewalChecks.push({id:'hot/actual-front-rail-and-head-release-required',kind:'required-phase',reserveMm:-1});
 checks.sort((a,b)=>a.reserveMm-b.reserveMm);
 return {schema:'had-utility-current-hot-head/1',retained:r,choice:c,formedSpool:bends,normalPermanentEnvelopes:normal,
  inventory:{sourceH0FullExternalBodyL:sourceBodyOuterL,downstreamBackboneFull74mmCoverL:backboneOuterL,lowerTerminalFull50mmCoverL:terminalOuterL,newSpoolMaximumWaterL:spoolWaterL,sourceUnionFullExternalBoxL:sourceUnionOuterL,headUnionFullExternalBoxL:headUnionOuterL,drainFullExternalBoxL:drainOuterL,isolatedH0LowerBranchUpperL:localWaterUpperL,metalAndInsulationDeliberatelyIncluded:true,domesticStoreOrUpperNetworkIncluded:false,actualH0ClosureAndZeroPressureQualified:false},
  receiver:{outerMm:bin,innerGrossCeilingL:innerGrossL,requiredVerifiedNetL:c.receiverUsableMinimumL,spoutMm:spout,maximumPartialBatchL:c.maximumPartialBatchL,closeDrainBeforeEmptying:true,actualNetCapacityAndHandlingQualified:false},
  headFirstRelease:{headFirstUpMm:headLift,thenCapturedSpoolUpMm:up,thenSpoolNorthMm:c.spoolNorthToRestMm,fixedSourceUnionBareMm:fixedSourceBare,movingSourceHalfBareMm:sourceBare,movingHeadHalfBareMm:headBare,capsFitOnlyAfterSpoolWithdrawn:true,opposedAxialFacesNotReleasedBySpoolTranslationAlone:true},
  renewalGeometry:{checks:renewalChecks,failures:renewalChecks.filter(q=>q.reserveMm< -1e-7),necessaryConditionalSpoolSweeps:renewalChecks.every(q=>q.reserveMm>= -1e-7),frontUpperRailStillPresentControl:blockedControl,headFullRemovalToolAndTemporaryStabilityProofAccepted:false},
  geometry:{checks,failures:checks.filter(q=>q.reserveMm< -1e-7),necessarySpecifiedGeometry:checks.every(q=>q.reserveMm>=-1e-7)},
  sequence:['Close actual H0 and sink local cold stop; disable heat as required, cool<=40C, verify zero pressure below BOTH real cuts before any union release. H0 replacement itself requires actual upstream domestic-store/upper isolation.','Attach positive support and use actual capped365 hot drain/150 spout over verified12L shallow receiver. Drain in<=5L batches with cock CLOSED before each empty; no store inventory enters the local bound.','Capture and drain the head, strip both joint jackets/nuts and make the specified first head lift. Fully remove the head to an independent positive rest BEFORE dry member release; its complete pickup/rest remains a separate proof obligation. Positively support/brace the remaining frame and mechanically remove only the actual front UPPER rail before the captured hot spool lifts10mm and travels north. No stopped compression coupler is a union.','Fit matched source and head blanks ONLY AFTER the captured spool clears; head, water and frame retain independent positive supports. Rebuild, inspect and pressure/leak test all thermal/pressure/safety interfaces before occupied operation.'],
  actualPressureMaterialAndThermalProofAccepted:false,actualToolReactionAndHeadPickupAccepted:false,actualRenewalSupportAndCompleteInstallationAccepted:false};
}
