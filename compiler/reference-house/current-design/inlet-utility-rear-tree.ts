/** Pure rear Utility tree; actual obstacles/retained services are injected.
 * No40mm frame-leg capacity, old carrier or pressure/material approval is inherited. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type Branch={tubeODMm:number;minimumTubeODMm:number;minimumWallMm:number;maximumWallMm:number;pathToStopMm:P[];pathFromStopToHeadMm?:P[];ordinaryShoulderMm:P;floorOperatorXYMm?:readonly[number,number];stop:{id:string;axisMm:P;flowAxis:P;faceMm:number;bareCrossMm:number;wheelDiameterMm:number;minimumKvM3h:number;maximumDryKg:number;stemWestMm?:number;stemNorthMm?:number;stemAboveAxisMm?:number}}
type Controls={commonPathMm:P[];washerTeeMm:P;sinkTeeMm:P;washer:Branch;sink:Branch;designFlowsLmin:{washer:number;sink:number};prefabSinkHead:{bowlPlanMm:readonly[number,number,number,number];bowlBottomMm:number;floodRimMm:number;coldPortMm:P;hotPortMm:P;floorOperatorXYMm:readonly[number,number];shoulderMm:P;maximumReachMm:number;pillarHandleMm:P[];spoutOutletsMm:P[]};rearTree:{schema:string;selectedForDevelopment:boolean;maximumCompleteDryAndColdResidualKg:number;maximumCaptiveResidualL:number;loweringMm:number;northFirstMm:number;westParkMm:number;northParkMm:number;frontLowerRailRemovedBeforeNorthMovement:boolean;temporaryCarryBarInstalledOnlyAfterTreeParked:boolean;actualInstalledSupportAndHandlingAccepted:false;sourceJoint:{id:string;fixedFaceLocalMm:P;flowAxis:P;bareFaceLengthMm:number;bareCrossMm:number;captiveCapProjectionMm:number;wrappedCrossMm:number;minimumAxialReleaseMm:number;manufacturerAndPhysicalPressureQualification:false}}}
export type UtilityRearTreeChoice={schema:string;id:string;terminalLocalMm:P;coldDistribution:Controls;coldService:{drainTeeZMm:number;minimumVerifiedUsableBinL:number}}
export type UtilityRearTreeContext={
 bindingDigest:string;maximumGaugeBar:number;settingEachMm:number;jacketRadialMm:number;floorMm:number;ceilingMm:number;mainOnlyInventoryUpperLitres:number
 obstacles:readonly{id:string;boxMm:B;presence:'always'|'head-before-strip'|'front-lower-rail'|'carry-bar-after-park'}[]
 retainedPaths:readonly{id:string;pointsMm:readonly P[];radiusWithSupportsMm:number}[]
 /** Missing remains false; these flags cannot admit an installed assembly. */
 evidence:{lodgeUAndMainZero:boolean;sourceDrainVerified:boolean;washerClosedHoseOnPositiveRest:boolean;headHotH0AndColdZeroHeadRemoved:boolean;lowPocketCapturedAndCapped:boolean;matchedUnionReleaseVerified:boolean;frontRailRemoved:boolean;carryBarTimingVerified:boolean;independentLoadedCaptureAndParkRestVerified:boolean}
 support:{normalWheelCoupleNm:number;coldMaintenanceToolCoupleNm:number;handlingDynamicFactor:number;declaredSlideTravelMm:P|null;actualReactionLawImplemented:false}
}
type Part={id:string;kind:'tube'|'fitting'|'union'|'stop';group:string;bare:B;wrapped:B;joins:string[];normalOnly:boolean;cap:boolean;waterUpperL:number;dryUpperKg:number}
const tuple=(v:unknown,n:number)=>Array.isArray(v)&&v.length===n&&v.every(x=>typeof x==='number'&&Number.isFinite(x))
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,k)=>Math.abs(v-b[k])<1e-7)
const plus=(a:P,b:P,s=1):P=>[a[0]+s*b[0],a[1]+s*b[1],a[2]+s*b[2]]
const sub=(a:P,b:P):P=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const length=(a:P)=>Math.hypot(...a)
const unit=(a:P):P=>a.map(v=>v/length(a)) as unknown as P
const centred=(p:P,d:P):B=>[p[0]-d[0]/2,p[1]-d[1]/2,p[2]-d[2]/2,...d]
const expand=(b:B,r:number):B=>[b[0]-r,b[1]-r,b[2]-r,b[3]+2*r,b[4]+2*r,b[5]+2*r]
const moved=(b:B,p:P):B=>[b[0]+p[0],b[1]+p[1],b[2]+p[2],b[3],b[4],b[5]]
const union=(bs:readonly B[]):B=>{const a=[0,1,2].map(k=>Math.min(...bs.map(b=>b[k]))),z=[0,1,2].map(k=>Math.max(...bs.map(b=>b[k]+b[k+3])));return[a[0],a[1],a[2],z[0]-a[0],z[1]-a[1],z[2]-a[2]]}
const gap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)}
const litres=(b:B)=>b[3]*b[4]*b[5]/1e6
const shaft=(a:P,b:P,r:number):B=>{const u=unit(sub(b,a)),q=a.map((v,k)=>r*Math.sqrt(Math.max(0,1-u[k]**2)));return[Math.min(a[0],b[0])-q[0],Math.min(a[1],b[1])-q[1],Math.min(a[2],b[2])-q[2],Math.abs(a[0]-b[0])+2*q[0],Math.abs(a[1]-b[1])+2*q[1],Math.abs(a[2]-b[2])+2*q[2]]}
const validPath=(p:unknown)=>Array.isArray(p)&&p.length>=2&&p.length<=64&&p.every(v=>tuple(v,3))&&p.slice(1).every((v,k)=>length(sub(v,p[k]))>1e-7)
const prof=(b:Branch)=>({od:b.tubeODMm,minWall:b.minimumWallMm,maxWall:b.maximumWallMm,end:b.tubeODMm>20?40:32,af:b.tubeODMm>20?32:24})
export function admitUtilityRearTreeChoice(v:unknown):UtilityRearTreeChoice{
 const c=v as UtilityRearTreeChoice,d=c?.coldDistribution,t=d?.rearTree,j=t?.sourceJoint
 if(c?.schema!=='had-utility-route/2'||!c.id||t?.schema!=='had-utility-rear-cold-tree/1'||t.selectedForDevelopment!==true||!tuple(c.terminalLocalMm,3)||!validPath(d.commonPathMm)
  ||!j?.id||!same(j.fixedFaceLocalMm,c.terminalLocalMm)||!same(j.fixedFaceLocalMm,d.commonPathMm[0])||!same(j.flowAxis,[1,0,0])
  ||![t.loweringMm,t.northFirstMm,t.westParkMm,t.northParkMm,t.maximumCompleteDryAndColdResidualKg,t.maximumCaptiveResidualL,j.bareFaceLengthMm,j.bareCrossMm,j.captiveCapProjectionMm,j.wrappedCrossMm,j.minimumAxialReleaseMm].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0)
  ||j.wrappedCrossMm<j.bareCrossMm+52||j.minimumAxialReleaseMm<10||t.actualInstalledSupportAndHandlingAccepted!==false||j.manufacturerAndPhysicalPressureQualification!==false
  ||!c.coldService||!Number.isFinite(c.coldService.drainTeeZMm)||!Number.isFinite(c.coldService.minimumVerifiedUsableBinL))throw Error('Unsupported rear tree source')
 for(const b of[d.washer,d.sink]){
  const s=b?.stop
  if(!s?.id||!validPath(b.pathToStopMm)||!tuple(s.axisMm,3)||!tuple(s.flowAxis,3)||!tuple(b.ordinaryShoulderMm,3)
   ||![b.tubeODMm,b.minimumTubeODMm,b.minimumWallMm,b.maximumWallMm,s.faceMm,s.bareCrossMm,s.wheelDiameterMm,s.minimumKvM3h,s.maximumDryKg].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0)
   ||b.tubeODMm<14||b.tubeODMm>23||b.minimumTubeODMm>b.tubeODMm||b.minimumWallMm>b.maximumWallMm||b.minimumTubeODMm<=2*b.maximumWallMm
   ||!same(b.pathToStopMm.at(-1)!,plus(s.axisMm,s.flowAxis,-s.faceMm/2)))throw Error('Unsupported complete rear stop face')
 }
 if(!same(d.washer.stop.flowAxis,[0,1,0])||!same(d.sink.stop.flowAxis,[0,0,-1])||!(Number.isFinite(d.washer.stop.stemWestMm)!==Number.isFinite(d.washer.stop.stemAboveAxisMm))||!Number.isFinite(d.sink.stop.stemNorthMm)
  ||!tuple(d.washer.floorOperatorXYMm,2)||!validPath(d.sink.pathFromStopToHeadMm)||!same(d.sink.pathFromStopToHeadMm![0],plus(d.sink.stop.axisMm,d.sink.stop.flowAxis,d.sink.stop.faceMm/2))
  ||!same(d.sink.pathFromStopToHeadMm!.at(-1)!,d.prefabSinkHead.coldPortMm)||!same(d.washer.pathToStopMm[0],d.washerTeeMm)||!same(d.sink.pathToStopMm[0],d.sinkTeeMm)
  ||!d.commonPathMm.some(p=>same(p,d.washerTeeMm))||!same(d.commonPathMm.at(-1)!,d.sinkTeeMm))throw Error('Unsupported shared header or head topology')
 return structuredClone(c)
}
export function inletUtilityRearTree(i:{choice:unknown;context:UtilityRearTreeContext}){
 const c=admitUtilityRearTreeChoice(i.choice),x=i.context,d=c.coldDistribution,t=d.rearTree,j=t.sourceJoint
 if(!x?.bindingDigest||![x.maximumGaugeBar,x.settingEachMm,x.jacketRadialMm,x.floorMm,x.ceilingMm,x.mainOnlyInventoryUpperLitres].every(Number.isFinite)||x.settingEachMm<10||x.jacketRadialMm<26||x.maximumGaugeBar<=0||x.mainOnlyInventoryUpperLitres<0
  ||!x.obstacles?.length||x.obstacles.some(o=>!o.id||!tuple(o.boxMm,6)||o.boxMm.slice(3).some(n=>n<=0))||!x.retainedPaths?.length||x.retainedPaths.some(p=>!p.id||!validPath(p.pointsMm)||!Number.isFinite(p.radiusWithSupportsMm))
  ||!x.support||x.support.actualReactionLawImplemented!==false||x.support.normalWheelCoupleNm<10||x.support.coldMaintenanceToolCoupleNm<60||x.support.handlingDynamicFactor<1.5||!x.evidence||Object.values(x.evidence).some(v=>typeof v!=='boolean'))throw Error('Unsupported injected rear tree context')
 const two=2*x.settingEachMm,wrap=x.jacketRadialMm,pw=prof(d.washer),ps=prof(d.sink),parts:Part[]=[],checks:{id:string;phase:string;reserveMm:number}[]=[],
  add=(id:string,phase:string,reserveMm:number)=>checks.push({id,phase,reserveMm}),
  make=(id:string,kind:Part['kind'],group:string,b:B,joins:P[],normalOnly=false,cap=false,water=0,dry=0)=>{const p:Part={id,kind,group,bare:b,wrapped:expand(b,wrap),joins:joins.map(p=>p.join('/')),normalOnly,cap,waterUpperL:water,dryUpperKg:dry};parts.push(p);return p},
  pipe=(id:string,points:readonly P[],p:ReturnType<typeof prof>)=>points.slice(1).forEach((b,k)=>{const a=points[k],L=length(sub(b,a)),idmax=p.od-2*p.minWall,idmass=p.od-2*p.maxWall;make(id+'/tube/'+k,'tube',id+'/tube/'+k,shaft(a,b,p.od/2),[a,b],false,false,Math.PI*idmax**2/4*L/1e6,Math.PI*(p.od**2-idmass**2)/4*L/1e9*8960)}),
  fitting=(id:string,p:P,arms:{dir:P;end:number;af:number}[])=>{const r=Math.max(...arms.map(a=>a.af/(2*Math.cos(Math.PI/6)))),b=union([centred(p,[2*r,2*r,2*r]),...arms.map(a=>shaft(p,plus(p,a.dir,a.end),a.af/(2*Math.cos(Math.PI/6))))]);make(id,'fitting',id,b,[p],false,false,litres(b),litres(b)*8.96)},
  corners=(id:string,points:readonly P[],p:ReturnType<typeof prof>)=>{for(let k=1;k<points.length-1;k++){const a=unit(sub(points[k-1],points[k])),b=unit(sub(points[k+1],points[k]));if(Math.abs(a.reduce((s,v,z)=>s+v*b[z],0)+1)<1e-7)continue;fitting(id+'/elbow/'+k,points[k],[{dir:a,end:p.end,af:p.af},{dir:b,end:p.end,af:p.af}])}}
 pipe('common',d.commonPathMm,pw);pipe('washer',d.washer.pathToStopMm,pw);corners('washer',d.washer.pathToStopMm,pw)
 pipe('sink/feed',d.sink.pathToStopMm,ps);corners('sink/feed',d.sink.pathToStopMm,ps)
 pipe('sink/lower',d.sink.pathFromStopToHeadMm!,ps);corners('sink/lower',d.sink.pathFromStopToHeadMm!,ps)
 fitting('washer/actual-run-down-tee',d.washerTeeMm,[{dir:[-1,0,0],end:40,af:32},{dir:[1,0,0],end:40,af:32},{dir:[0,0,-1],end:40,af:32}])
 fitting('sink/factory-reducing90',d.sinkTeeMm,[{dir:[-1,0,0],end:40,af:32},{dir:[0,0,-1],end:32,af:24}])
 const joint=(id:string,face:P,axis:P,sign:number,cross:number,half:number)=>{
  const body=shaft(plus(face,axis,sign<0?-half:0),plus(face,axis,sign<0?0:half),cross/2),cap=shaft(face,plus(face,axis,-sign*j.captiveCapProjectionMm),cross/2)
  make(id+'/moving-half','union',id,body,[face],false,false,litres(body),litres(body)*8.96);make(id+'/cap','union',id,cap,[face],false,true,litres(cap),litres(cap)*8.96)
 }
 joint(j.id,j.fixedFaceLocalMm,j.flowAxis,1,j.bareCrossMm,j.bareFaceLengthMm/2)
 joint('washer/upstream-matched-union',d.washer.pathToStopMm.at(-1)!,d.washer.stop.flowAxis,-1,j.bareCrossMm,j.bareFaceLengthMm/2)
 joint('sink/head-matched-union',d.prefabSinkHead.coldPortMm,[0,0,1],-1,ps.af/Math.cos(Math.PI/6),ps.end)
 const stop=(name:string,b:Branch,normalOnly:boolean)=>{
  const s=b.stop,body=shaft(plus(s.axisMm,s.flowAxis,-s.faceMm/2),plus(s.axisMm,s.flowAxis,s.faceMm/2),s.bareCrossMm/2),axis:P=name==='washer'?(s.stemAboveAxisMm!==undefined?[0,0,1]:[-1,0,0]):[0,1,0],wheel=plus(s.axisMm,axis,name==='washer'?(s.stemAboveAxisMm??s.stemWestMm!):s.stemNorthMm!),r=s.wheelDiameterMm/2,
   control=union([shaft(s.axisMm,wheel,Math.min(r,s.bareCrossMm/2)),shaft(plus(wheel,axis,-5),plus(wheel,axis,5),r)])
  make(name+'/stop-body','stop',s.id,body,[plus(s.axisMm,s.flowAxis,-s.faceMm/2),plus(s.axisMm,s.flowAxis,s.faceMm/2)],normalOnly,false,litres(body),s.maximumDryKg)
  const q=make(name+'/stem-wheel','stop',s.id,control,[],normalOnly);q.wrapped=control
  return{wheelMm:wheel,body,control}
 }
 const ws=stop('washer',d.washer,true),ss=stop('sink',d.sink,false),normal=parts.filter(p=>!p.cap),moving=parts.filter(p=>!p.normalOnly),
  bowl:B=[d.prefabSinkHead.bowlPlanMm[0],d.prefabSinkHead.bowlPlanMm[1],d.prefabSinkHead.bowlBottomMm,d.prefabSinkHead.bowlPlanMm[2],d.prefabSinkHead.bowlPlanMm[3],d.prefabSinkHead.floodRimMm-d.prefabSinkHead.bowlBottomMm],
  obstacles=[...x.obstacles,{id:'source-prefab-bowl',boxMm:bowl,presence:'head-before-strip' as const}],
  active=(phase:string)=>obstacles.filter(o=>!(o.presence==='head-before-strip'&&phase!=='normal')&&!(o.presence==='front-lower-rail'&&!['normal','release','lower'].includes(phase)&&t.frontLowerRailRemovedBeforeNorthMovement)&&!(o.presence==='carry-bar-after-park'&&phase!=='park'&&t.temporaryCarryBarInstalledOnlyAfterTreeParked)),
  collision=(phase:string,members:readonly Part[],a:P,b:P)=>{
   for(const p of members){const box=union([moved(p.wrapped,a),moved(p.wrapped,b)]);add(p.id+'/floor',phase,box[2]-x.floorMm-two);add(p.id+'/ceiling',phase,x.ceilingMm-box[2]-box[5]-two)
    for(const o of active(phase))add(p.id+'/'+o.id,phase,gap(box,o.boxMm)-two)
    for(const q of x.retainedPaths)for(let k=1;k<q.pointsMm.length;k++)add(p.id+'/'+q.id+'/'+k,phase,exactSegmentBoxDistance(q.pointsMm[k-1],q.pointsMm[k],box)-q.radiusWithSupportsMm-two)
   }
  }
 collision('normal',normal,[0,0,0],[0,0,0])
 for(let a=0;a<normal.length;a++)for(let b=a+1;b<normal.length;b++){const p=normal[a],q=normal[b];if(p.group===q.group||p.joins.some(v=>q.joins.includes(v)))continue;add(p.id+'/'+q.id,'nonmate-metal',gap(p.bare,q.bare)-two)}
 const legs=(id:string,p:readonly P[],first:number,last:number,end:number)=>{for(let k=1;k<p.length;k++)add(id+'/'+k,'fitting-legs',length(sub(p[k],p[k-1]))-(k===1?first:end)-(k===p.length-1?last:end)-two)}
 legs('common',d.commonPathMm,j.bareFaceLengthMm/2,40,40);legs('washer',d.washer.pathToStopMm,40,j.bareFaceLengthMm/2,40);legs('sink/feed',d.sink.pathToStopMm,32,0,32);legs('sink/lower',d.sink.pathFromStopToHeadMm!,0,32,32)
 const release=plus(plus([0,0,0],j.flowAxis,j.minimumAxialReleaseMm),d.washer.stop.flowAxis,-j.minimumAxialReleaseMm),
  offsets:P[]=[[0,0,0],release,plus(release,[0,0,-1],t.loweringMm),[0,0,-t.loweringMm],[0,t.northFirstMm,-t.loweringMm],[-t.westParkMm,t.northFirstMm,-t.loweringMm],[-t.westParkMm,t.northFirstMm+t.northParkMm,-t.loweringMm]],
  phases=['release','lower','restore-and-cap','north','west','north-to-park']
 for(let k=1;k<offsets.length;k++)collision(phases[k-1],k<3?moving.filter(p=>!p.cap):moving,offsets[k-1],offsets[k])
 collision('park',moving,offsets.at(-1)!,offsets.at(-1)!)
 // The washer stop/hose stays retained. Interface contact during collar release
 // needs actual matched-union proof; completed lower/long moves need free space.
 for(const p of moving)for(const q of[ws.body,ws.control])add(p.id+'/retained-washer-stop','lowered-retained-stop',gap(moved(p.wrapped,offsets[3]),q)-two)
 const tasks=[{id:'washer',body:d.washer.floorOperatorXYMm!,shoulder:d.washer.ordinaryShoulderMm,wheel:ws.wheelMm,r:d.washer.stop.wheelDiameterMm/2},{id:'sink',body:d.prefabSinkHead.floorOperatorXYMm,shoulder:d.sink.ordinaryShoulderMm,wheel:ss.wheelMm,r:d.sink.stop.wheelDiameterMm/2}],
  operation=tasks.map(o=>{let reach=0;for(let k=0;k<=30;k++){const a=(-15+k)*Math.PI/180,g:P=o.id==='washer'?(d.washer.stop.stemAboveAxisMm!==undefined?[o.wheel[0]+o.r*Math.sin(a),o.wheel[1]+o.r*Math.cos(a),o.wheel[2]]:[o.wheel[0],o.wheel[1]+o.r*Math.cos(a),o.wheel[2]+o.r*Math.sin(a)]):[o.wheel[0]+o.r*Math.sin(a),o.wheel[1],o.wheel[2]+o.r*Math.cos(a)];reach=Math.max(reach,length(sub(g,o.shoulder)));for(const q of active('normal'))add(o.id+'/arm/'+q.id+'/'+k,'operation',exactSegmentBoxDistance(o.shoulder,g,q.boxMm)-40-two);for(const q of x.retainedPaths)for(let z=1;z<q.pointsMm.length;z++)add(o.id+'/arm/'+q.id+'/'+z+'/'+k,'operation',segmentDistance(o.shoulder,g,q.pointsMm[z-1],q.pointsMm[z])-q.radiusWithSupportsMm-40-two)}
   add(o.id+'/reach','operation',d.prefabSinkHead.maximumReachMm-reach);add(o.id+'/shoulder-in-body','operation',300-Math.hypot(o.body[0]-o.shoulder[0],o.body[1]-o.shoulder[1]))
   for(const q of active('normal'))add(o.id+'/body/'+q.id,'operation',exactSegmentBoxDistance([o.body[0],o.body[1],x.floorMm],[o.body[0],o.body[1],x.floorMm+2000],q.boxMm)-300-two)
   return{id:o.id,maximumGripReachMm:reach,bodyRadiusMm:300,armRadiusMm:40,gripSectorDegrees:[-15,15]}
  }),
  water=moving.reduce((s,p)=>s+p.waterUpperL,0),dry=moving.reduce((s,p)=>s+p.dryUpperKg,0),otherDryBudget=t.maximumCompleteDryAndColdResidualKg-t.maximumCaptiveResidualL-dry,retainedWasherStopWater=normal.filter(p=>p.normalOnly).reduce((s,p)=>s+p.waterUpperL,0),receiver=x.mainOnlyInventoryUpperLitres+water+retainedWasherStopWater,
  free=(p:P)=>sub(p,j.fixedFaceLocalMm).map(v=>v*17e-6*40) as unknown as P,seizedStress=110000*17e-6*40,seized=(p:ReturnType<typeof prof>)=>seizedStress*Math.PI*(p.od**2-(p.od-2*p.maxWall)**2)/4,
  force=(p:ReturnType<typeof prof>)=>x.maximumGaugeBar*1e5*Math.PI*((p.od-2*p.minWall)/1000)**2/4,failures=checks.filter(q=>q.reserveMm< -1e-7),allEvidence=Object.values(x.evidence).every(Boolean)
 return{schema:'had-utility-rear-tree-comparison/1' as const,choice:c,source:{bindingDigest:x.bindingDigest,context:x,caseDigest:sha256SemanticFingerprint({choice:c,context:x}),method:'single-common-header-full-fittings-and-captive-release/1'},physicalInstallationAdmitted:false,installedAcceptance:false,wholeTreeStripIsHistoricalStressControlOnly:true,ordinaryBoltedMemberRenewalToolStabilityAndLoadProofAccepted:false,
  geometry:{parts,checks,failures,sharedHeaderCount:1,sinkNodeType:'factory22-in15-down-reducing90-not-a-capped-tee',normalNecessary:!failures.some(q=>['normal','nonmate-metal','fitting-legs','operation'].includes(q.phase)),stripNecessary:!failures.some(q=>!['normal','nonmate-metal','fitting-legs','operation'].includes(q.phase)),sharedJoinedJacketOverlapIsNotMetalCollision:true},
  operation:{tasks:operation,normalWheelCoupleNm:x.support.normalWheelCoupleNm,washerAvailableAfterFirstPull:false,actualStopAndHumanTaskQualified:false},
  strip:{offsetsMm:offsets,phases,diagonalAxialReleaseMm:release,capsOnlyAfterCompletedLevelLowering:true,washerStopAndHoseRetainedOnIndependentRest:true,sinkStopAndLowLoopTravelWithTree:true,headRemovedSeparatelyAfterH0AndColdZero:true,frontLowerRailRemovalRequired:true,carryBarInstalledAfterParkRequired:true,parkedParts:moving.map(p=>({id:p.id,boxMm:moved(p.wrapped,offsets.at(-1)!)})),matchedUnionReleaseAndLoadedCaptureQualified:false},
  inventory:{sharedHeaderCountedOnce:true,treeWaterGeometricUpperLitres:water,fullBareComponentCavityAndJoinedTubeOverlapAreConservativeUppers:true,maximumCaptiveResidualDesignLitres:t.maximumCaptiveResidualL,treeWithinResidualCap:water<=t.maximumCaptiveResidualL,source740DrainEmptiesWholeTree:false,lowestSinkPathMm:Math.min(...d.sink.pathFromStopToHeadMm!.map(p=>p[2])),sourceDrainMm:c.coldService.drainTeeZMm,washerStopHoseMachineAndHotHeadWaterIncluded:false,retainedClosedWasherStopBodyWaterUpperLitres:retainedWasherStopWater,retainedWasherStopBodyAddedOnceToReceiver:true,mainOnlyInventoryUpperLitres:x.mainOnlyInventoryUpperLitres,mainPlusTreeAndRetainedStopUpperLitres:receiver,receiverLitres:c.coldService.minimumVerifiedUsableBinL,receiverReserveLitres:c.coldService.minimumVerifiedUsableBinL-receiver,necessaryCombinedReceiverComparison:receiver<=c.coldService.minimumVerifiedUsableBinL,actualNetworkExclusionAndControlledCaptureQualified:false},
  stock:{knownTubeAndConservativeBareComponentDryUpperKg:dry,remainingInsulationClampsHardwareDryBudgetKg:otherDryBudget,completeDryPlusResidualDesignKg:t.maximumCompleteDryAndColdResidualKg,referenceCapturedVerticalIncludingDynamicN:t.maximumCompleteDryAndColdResidualKg*9.81*x.support.handlingDynamicFactor,actualMassCGAndSupportResistanceQualified:false,frame40LegsAreCapacityProof:false},
  pressure:{maximumGaugeBar:x.maximumGaugeBar,maximumWaterBoresMm:{washer:pw.od-2*pw.minWall,sink:ps.od-2*ps.minWall},pipeEndThrustN:{washer:force(pw),sink:force(ps)},normalStopLossBar:{washer:(d.designFlowsLmin.washer*.06/d.washer.stop.minimumKvM3h)**2,sink:(d.designFlowsLmin.sink*.06/d.sink.stop.minimumKvM3h)**2},normalWheelCoupleNm:x.support.normalWheelCoupleNm,coldZeroToolCoupleNm:x.support.coldMaintenanceToolCoupleNm,chargedDisconnectionAllowed:false,actualPressureAndOppositeReactionQualified:false},
  thermalAndSupport:{temperatureChangeK:40,pipeTemperatureChangeIsStoredWaterTemperature:false,freeHeaderXMovementMm:(d.sinkTeeMm[0]-j.fixedFaceLocalMm[0])*17e-6*40,freeWasherStopVectorMm:free(d.washer.stop.axisMm),freeSinkStopVectorMm:free(d.sink.stop.axisMm),declaredSlideTravelMm:x.support.declaredSlideTravelMm,fullySeizedStraightStressMPa:seizedStress,fullySeizedStraightAxialUpperN:{washer:seized(pw),sink:seized(ps)},elasticLoopKernelExecuted:false,actualReactionLawImplemented:false,requiredInterfaces:['fixed source union with real normal thrust receiver','positive gravity seats','bolted antirotation forks:10Nm normal/60Nm cold tools','explicit slides with no friction credit','independent loaded capture and positive park rest']},
  evidence:{required:x.evidence,allDeclaredEvidencePresent:allEvidence,qualified:false},
  sequence:['Operate internalU and localwasher whilewasherhome. CloseLodgeU; verifyzero and attach/verifycontrolled740drain.','Retainclosedwasherstop+hoseonindependentrest; neveropenitsdownstreamfaceorchargeunknownmachinewaterto4L.','IsolateactualhotH0/coldhead, cool/zero/boundcontents, removehead andcapcold/hotends. Sinkstopandlowloopremainwithtree.','Separatelycapture/capbelow740pockets; source740cannotempty300/530legs. Prove4Lresidualand20kgcompletecapture.','Removejointjackets, releaseactualcaptivecollars/counterholdonpositivesupport; diagonalaxialrelease, lowerlevel, restoreXYandcap.','Mechanicallyremovefrontlowerrail; keepcarrybarabsent; north,west,norththroughactualopeningtopositiverest. Installcarrybaronlyafterpark.','Restoreactualsupports/rails/unions/pressuretests/jacketsandlocalisolationbeforeuse.'],
  diagnostics:[...(failures.length?['UTILITY_REAR_TREE/actual-geometry-operation-or-strip-conflicts']:[]),...(water>t.maximumCaptiveResidualL?['UTILITY_REAR_TREE/water-upper-exceeds-residual-cap']:[]),...(otherDryBudget<0?['UTILITY_REAR_TREE/known-dry-plus-residual-exceeds-mass-cap']:[]),...(!allEvidence?['UTILITY_REAR_TREE/isolation-release-capture-and-rest-not-verified']:[]),'UTILITY_REAR_TREE/below740-sink-pocket-needs-separate-capture','UTILITY_REAR_TREE/source-washer-head-matched-unions-not-stopped-couplers-required','UTILITY_REAR_TREE/actual-slide-fork-anchor-and-capture-laws-unimplemented','UTILITY_REAR_TREE/actual-hotH0-new-head-interface-not-proved','UTILITY_REAR_TREE/pressure-material-handling-and-installed-acceptance-missing']}
}
