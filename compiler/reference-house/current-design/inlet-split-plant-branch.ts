/** Independent Plant inlet development. Authored paths remain a candidate until every
 * actual source, joint, relief, support and material interface is admitted. No receipt input. */
import { segmentDistance, segmentBoxDistance } from '../../../project/had/studies/service-interface-geometry.mjs'
import { finiteBends } from '../../../project/had/studies/incoming-water-geometry.mjs'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {admitPlantFittedFrameChoice} from './inlet-split-plant-room-choice.js'
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'

type Point=readonly[number,number,number]
type Box=readonly[number,number,number,number,number,number]
type Path=readonly Point[]
export type SplitPlantBranchChoice={schema:'had-split-plant-branch/1';id:string;units:'mm';datum:'occupied-ground-FFL';
 sourceEntryMm:Point;insideEntryMm:Point;upstreamPathMm:Path;outletStemMm:Path;storeFixedPathMm:Path;treeFixedPathMm:Path;storeRemovableDropMm:Path;storeTerminalMm:Path;
 storePortTrialMm:Point;coldTreeInterfaceMm:Point;sourceEntryOpeningDiameterMm:number;storeDropBendRadiusMm:number;storeTerminalBendRadiusMm:number}
export type SplitPlantBranchInputs={choice:SplitPlantBranchChoice;sourceBindingDigest:string;groundFflMm:number;roomPlanMm:readonly[number,number,number,number];ceilingMm:number;fittedFrame:ReturnType<typeof derivePlantFittedFrame>;
 valve:{axisMm:Point;bodyMm:Box;stemMm:Box;knownKg:number};ordinaryShoulderMm:Point;
 envelope:{backboneRadiusMm:number;terminalRadiusMm:number;settingsEachMm:number;insulationRadialThicknessMm:number;jacketThicknessMm:number};operating:{plantDutyLmin:number;temperatureChangeK:number;maximumGaugeBar:number};
 obstacles:readonly{id:string;boxMm:Box}[];goods:readonly{id:string;pathMm:readonly(readonly[number,number])[];completeRadiusMm:number;maximumCompleteHeightMm:number}[];
 cylindricalStore:{centreXYMm:readonly[number,number];radiusMm:number;heightMm:number};
 retainedStorePortTrialMm:Point;retainedTreeInterfaceMm:Point;sourceEntryCargoSouthYMm:number;sourceEntryInfillYMm:readonly[number,number];
 comparison:{frictionFactor:number;cornerK:number;jacketDensityKgM3:number;insulationDensityKgM3:number}}
const choiceKeys=['schema','id','units','datum','sourceEntryMm','insideEntryMm','upstreamPathMm','outletStemMm','storeFixedPathMm','treeFixedPathMm','storeRemovableDropMm','storeTerminalMm','storePortTrialMm','coldTreeInterfaceMm','sourceEntryOpeningDiameterMm','storeDropBendRadiusMm','storeTerminalBendRadiusMm'].sort()
const keys=(x:unknown,k:readonly string[])=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===[...k].sort().join(',')
const tuple=(x:unknown,n:number):x is readonly number[]=>Array.isArray(x)&&x.length===n&&[...x].every(v=>typeof v==='number'&&Number.isFinite(v))
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,k)=>v===b[k])
const length=(a:Point,b:Point)=>Math.hypot(...a.map((v,k)=>v-b[k]))
const segments=(p:Path)=>p.slice(1).map((b,k)=>({a:p[k],b,index:k,lengthMm:length(p[k],b)}))
const direction=(a:Point,b:Point)=>{const l=length(a,b);return a.map((v,k)=>(b[k]-v)/l) as unknown as Point}
const cross=(p:Point,f:Point)=>[p[1]*f[2]-p[2]*f[1],p[2]*f[0]-p[0]*f[2],p[0]*f[1]-p[1]*f[0]]
const gap=(a:Box,b:Box)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)}
export function inletSplitPlantBranch(i:SplitPlantBranchInputs){
 const q=i?.choice
 if(!i||!q||!i.envelope||!i.operating||!i.valve||!keys(i.operating,['plantDutyLmin','temperatureChangeK','maximumGaugeBar'])||!keys(i.envelope,['backboneRadiusMm','terminalRadiusMm','settingsEachMm','insulationRadialThicknessMm','jacketThicknessMm'])||!keys(i.comparison,['frictionFactor','cornerK','jacketDensityKgM3','insulationDensityKgM3'])||Object.keys(q).sort().join(',')!==choiceKeys.join(',')||typeof i.sourceBindingDigest!=='string'||!i.sourceBindingDigest||!i.fittedFrame||i.fittedFrame.sourceAxisYMm!==q.sourceEntryMm[1]||i.fittedFrame.sourceOpeningDiameterMm!==q.sourceEntryOpeningDiameterMm)throw Error('Unsupported independent Plant branch input ownership')
 admitResolvedPlantFittedFrame(i.fittedFrame)
 if(i.fittedFrame.resolvedInput.groundFflMm!==i.groundFflMm||!same(i.fittedFrame.infills[0].intervalYMm,i.sourceEntryInfillYMm)||i.fittedFrame.effectiveClearYMm[0]!==i.sourceEntryCargoSouthYMm||i.fittedFrame.resolvedInput.wallInnerXMm!==i.roomPlanMm[0]+i.roomPlanMm[2])throw Error('Unsupported fitted Plant frame ground join')
 const paths=[{id:'plant/upstream',points:q.upstreamPathMm,removable:false,radiusMm:i.envelope.backboneRadiusMm},
  {id:'plant/outlet-stem',points:q.outletStemMm,removable:false,radiusMm:i.envelope.backboneRadiusMm},
  {id:'plant/store-fixed',points:q.storeFixedPathMm,removable:false,radiusMm:i.envelope.backboneRadiusMm},
  {id:'plant/tree-fixed',points:q.treeFixedPathMm,removable:false,radiusMm:i.envelope.backboneRadiusMm},
  {id:'plant/store-removable-drop',points:q.storeRemovableDropMm,removable:true,radiusMm:i.envelope.backboneRadiusMm},
  {id:'plant/store-terminal',points:q.storeTerminalMm,removable:true,radiusMm:i.envelope.terminalRadiusMm}]
 if(!i||!q||!i.comparison||q.schema!=='had-split-plant-branch/1'||q.units!=='mm'||q.datum!=='occupied-ground-FFL'||typeof q.id!=='string'||!q.id
  ||![q.sourceEntryMm,q.insideEntryMm,i.valve.axisMm,i.ordinaryShoulderMm,q.storePortTrialMm,q.coldTreeInterfaceMm,i.retainedStorePortTrialMm,i.retainedTreeInterfaceMm].every(p=>tuple(p,3))
  ||!paths||paths.some(p=>!Array.isArray(p.points)||p.points.length<2||![...p.points].every(v=>tuple(v,3))||segments(p.points).some(s=>s.lengthMm<=0))
  ||![i.envelope.backboneRadiusMm,i.envelope.terminalRadiusMm,i.envelope.settingsEachMm,i.envelope.insulationRadialThicknessMm,i.envelope.jacketThicknessMm,i.operating.plantDutyLmin,i.operating.temperatureChangeK,i.operating.maximumGaugeBar,q.sourceEntryOpeningDiameterMm,q.storeDropBendRadiusMm,q.storeTerminalBendRadiusMm,i.groundFflMm,i.ceilingMm,i.sourceEntryCargoSouthYMm,...Object.values(i.comparison)].every(Number.isFinite)
  ||i.envelope.backboneRadiusMm<40.05||i.envelope.terminalRadiusMm<25||i.envelope.settingsEachMm<10||i.envelope.insulationRadialThicknessMm<25||i.envelope.jacketThicknessMm<1||i.operating.plantDutyLmin<44||i.operating.maximumGaugeBar<=0||i.operating.maximumGaugeBar>12||i.operating.temperatureChangeK<0||q.sourceEntryOpeningDiameterMm<=2*i.envelope.backboneRadiusMm||q.storeDropBendRadiusMm<=0||q.storeTerminalBendRadiusMm<=0||i.comparison.frictionFactor<=0||i.comparison.cornerK<0||i.comparison.jacketDensityKgM3<=0||i.comparison.insulationDensityKgM3<=0
  ||!tuple(i.sourceEntryInfillYMm,2)||i.sourceEntryInfillYMm[1]<=i.sourceEntryInfillYMm[0]||!tuple(i.roomPlanMm,4)||i.roomPlanMm.slice(2).some(v=>v<=0)||i.ceilingMm<2000||!i.valve||![i.valve.bodyMm,i.valve.stemMm].every(b=>tuple(b,6)&&b.slice(3).every(v=>v>0))||!Number.isFinite(i.valve.knownKg)||i.valve.knownKg<=0
  ||!tuple(i.valve.axisMm,3)||!Array.isArray(i.obstacles)||!i.obstacles.length||new Set(i.obstacles.map(o=>o.id)).size!==i.obstacles.length||i.obstacles.some(o=>!o.id||!tuple(o.boxMm,6)||o.boxMm.slice(3).some((v:number)=>v<=0))
  ||!Array.isArray(i.goods)||i.goods.length!==2||new Set(i.goods.map(g=>g.id)).size!==2||i.goods.some(g=>!g.id||!Array.isArray(g.pathMm)||g.pathMm.length<2||![...g.pathMm].every((p:unknown)=>tuple(p,2))||!Number.isFinite(g.completeRadiusMm)||g.completeRadiusMm<=0||!Number.isFinite(g.maximumCompleteHeightMm)||g.maximumCompleteHeightMm<=0)
  ||!i.cylindricalStore||!tuple(i.cylindricalStore.centreXYMm,2)||!Number.isFinite(i.cylindricalStore.radiusMm)||i.cylindricalStore.radiusMm<=0||!Number.isFinite(i.cylindricalStore.heightMm)||i.cylindricalStore.heightMm<=0)
  throw Error('Unsupported independent Plant branch inputs')
 if(Math.abs(i.envelope.backboneRadiusMm-(inletCabinetProductFacts.pipe.maximumOuterDiameterIncludingOvalityMm/2+i.envelope.insulationRadialThicknessMm+i.envelope.jacketThicknessMm))>1e-9)throw Error('Unsupported inconsistent backbone jacket source')
 const port=42,fitR=inletCabinetProductFacts.coupling.spannerMm/(2*Math.cos(Math.PI/6))+i.envelope.insulationRadialThicknessMm+i.envelope.jacketThicknessMm,setting=2*i.envelope.settingsEachMm,
  bottom=i.valve.axisMm.map((v,k)=>v-(k===2?80:0)),top=i.valve.axisMm.map((v,k)=>v+(k===2?80:0)),
  connections=[['source-entry',q.upstreamPathMm[0],q.sourceEntryMm],['valve-in',q.upstreamPathMm.at(-1)!,bottom],['valve-out',q.outletStemMm[0],top],
   ['tee-store',q.storeFixedPathMm[0],q.outletStemMm.at(-1)!],['tee-tree',q.treeFixedPathMm[0],q.outletStemMm.at(-1)!],
   ['store-high-split',q.storeFixedPathMm.at(-1)!,q.storeRemovableDropMm[0]],['store-low-split',q.storeRemovableDropMm.at(-1)!,q.storeTerminalMm[0]],
   ['factory-port',q.storeTerminalMm.at(-1)!,i.retainedStorePortTrialMm],['tree-interface',q.treeFixedPathMm.at(-1)!,i.retainedTreeInterfaceMm]] as const
 if(!same(q.sourceEntryMm.slice(1),q.insideEntryMm.slice(1))||q.insideEntryMm[0]!==i.roomPlanMm[0]+i.roomPlanMm[2]||q.sourceEntryMm[0]<=q.insideEntryMm[0]||q.upstreamPathMm[1][0]>=q.insideEntryMm[0]||!same(q.upstreamPathMm[1].slice(1),q.insideEntryMm.slice(1))||connections.some(([,a,b])=>!same(a,b))||!same(q.storePortTrialMm,i.retainedStorePortTrialMm)||!same(q.coldTreeInterfaceMm,i.retainedTreeInterfaceMm))throw Error('Unsupported changed Plant source/valve/store/tree connection')
 const beforeIn=q.upstreamPathMm.at(-2)!,afterOut=q.outletStemMm[1],axis=i.valve.axisMm,
  axialLowerLimit=i.valve.bodyMm[2]-i.envelope.backboneRadiusMm-2*i.envelope.settingsEachMm,
  axialUpperLimit=i.valve.bodyMm[2]+i.valve.bodyMm[5]+i.envelope.backboneRadiusMm+2*i.envelope.settingsEachMm
 if(beforeIn[0]!==axis[0]||beforeIn[1]!==axis[1]||beforeIn[2]>=axialLowerLimit||afterOut[0]!==axis[0]||afterOut[1]!==axis[1]||afterOut[2]<=axialUpperLimit)throw Error('Unsupported nonaxial Plant valve-face connection')
 const pipe=inletCabinetProductFacts.pipe,od=pipe.maximumOuterDiameterIncludingOvalityMm,waterBore=od-2*pipe.minimumWallMm,
  hydraulicBore=pipe.minimumOuterDiameterIncludingOvalityMm-2*pipe.maximumWallMm,copperArea=Math.PI/4*(od**2-(od-2*pipe.maximumWallMm)**2),waterArea=Math.PI/4*waterBore**2,
  jacketArea=Math.PI*(i.envelope.backboneRadiusMm**2-(i.envelope.backboneRadiusMm-i.envelope.jacketThicknessMm)**2),insulationArea=Math.PI*((i.envelope.backboneRadiusMm-i.envelope.jacketThicknessMm)**2-(od/2)**2),pAN=i.operating.maximumGaugeBar*1e5*waterArea/1e6,
  rows=paths.map(p=>{const ss=segments(p.points),corners=p.points.slice(1,-1).map((point,k)=>{const before=direction(p.points[k],point),after=direction(point,p.points[k+2]),
    ports=[point,point.map((v,j)=>v-port*before[j]),point.map((v,j)=>v+port*after[j])],lower=point.map((_,j)=>Math.min(...ports.map(p=>p[j]))-fitR),upper=point.map((_,j)=>Math.max(...ports.map(p=>p[j]))+fitR),
    force=before.map((v,j)=>pAN*(v-after[j])) as unknown as Point,absolute=point.map((v,j)=>v+(j===2?i.groundFflMm:0)) as unknown as Point
    return{index:k,pointMm:point,angleDeg:Math.acos(Math.max(-1,Math.min(1,before.reduce((n,v,j)=>n+v*after[j],0))))*180/Math.PI,boxMm:[...lower,...upper.map((v,j)=>v-lower[j])] as unknown as Box,
      sourcePressureCornerWrenchN_Nm:[...force,...cross(absolute.map(v=>v/1000) as unknown as Point,force)]}}),
   stock=ss.map(s=>{const copperKg=s.lengthMm*copperArea/1e9*8960,waterKg=s.lengthMm*waterArea/1e9*1000,jacketKg=p.id==='plant/store-terminal'?0:s.lengthMm*jacketArea/1e9*i.comparison.jacketDensityKgM3,insulationKg=p.id==='plant/store-terminal'?0:s.lengthMm*insulationArea/1e9*i.comparison.insulationDensityKgM3,
     origin=s.a.map((v,k)=>(v+s.b[k])/2+(k===2?i.groundFflMm:0)) as unknown as Point,force:Point=[0,0,-(copperKg+waterKg+jacketKg+insulationKg)*9.81]
     return{id:q.id+'/'+p.id+'/segment/'+s.index,referenceCopperKg:copperKg,referenceWaterKg:waterKg,referenceJacketKg:jacketKg,referenceInsulationKg:insulationKg,wrapperReferenceIncluded:p.id!=='plant/store-terminal',actualTerminalWrapperMassKg:null,absoluteOriginMm:origin,referenceGravityWrenchN_Nm:[...force,...cross(origin.map(v=>v/1000) as unknown as Point,force)]}})
   if(!p.removable&&corners.some(c=>Math.abs(c.angleDeg-90)>1e-9))throw Error('Unsupported non90degree fixed Plant fitting')
   const formedGeometry=p.removable?finiteBends(p.points,p.id==='plant/store-removable-drop'?q.storeDropBendRadiusMm:q.storeTerminalBendRadiusMm):null
   return{...p,segments:ss,corners,formedGeometry,fittingGeometryKind:p.removable?'explicit-formed-tube-radius':'boxed-factory-elbow-reservation',stock,centrelineLengthMm:ss.reduce((n,s)=>n+s.lengthMm,0),actualFittingGeometryQualified:false}}),
    fixed=rows.filter(r=>!r.removable),
  commonTee=q.outletStemMm.at(-1)!,teePairs=new Set(['plant/outlet-stem|plant/store-fixed','plant/outlet-stem|plant/tree-fixed','plant/store-fixed|plant/tree-fixed']),
  jointExcludedRadiusMm=port+fitR+setting,
  commonTeeSegments=(a:typeof fixed[number],sa:ReturnType<typeof segments>[number],b:typeof fixed[number],sb:ReturnType<typeof segments>[number])=>{
   if(!teePairs.has([a.id,b.id].sort().join('|')))return null
   const ap=same(sa.a,commonTee)?'a':same(sa.b,commonTee)?'b':null,bp=same(sb.a,commonTee)?'a':same(sb.b,commonTee)?'b':null
   if(!ap||!bp)return null
   if(sa.lengthMm<=jointExcludedRadiusMm||sb.lengthMm<=jointExcludedRadiusMm)throw Error('Unsupported short common-tee branch reservation')
   const trim=(s:typeof sa,end:'a'|'b')=>{const other=end==='a'?s.b:s.a,u=direction(commonTee,other),p=commonTee.map((v,k)=>v+jointExcludedRadiusMm*u[k]) as unknown as Point;return end==='a'?{a:p,b:s.b}:{a:s.a,b:p}}
   return{a:trim(sa,ap),b:trim(sb,bp),node:'plant/common-outlet-tee',pointMm:commonTee,excludedRadiusMm:jointExcludedRadiusMm,
    scope:'Only the two incident straight ends at this declared physical tee; actual tee geometry and pressure/thermal resistance remain unsupported.'}
  },
  crossPathChecks=fixed.flatMap((a,ai)=>fixed.slice(ai+1).flatMap(b=>[
   ...a.segments.flatMap(sa=>b.segments.map(sb=>{const joint=commonTeeSegments(a,sa,b,sb);return{a:a.id,b:b.id,part:'pipe-pipe',aIndex:sa.index,bIndex:sb.index,
    reserveMm:segmentDistance(joint?joint.a.a:sa.a,joint?joint.a.b:sa.b,joint?joint.b.a:sb.a,joint?joint.b.b:sb.b)-a.radiusMm-b.radiusMm-setting,connectionExemption:joint?{node:joint.node,pointMm:joint.pointMm,excludedRadiusMm:joint.excludedRadiusMm,scope:joint.scope}:null}})),
   ...a.corners.flatMap(c=>b.segments.map(s=>({a:a.id,b:b.id,part:'fitting-pipe',aIndex:c.index,bIndex:s.index,reserveMm:segmentBoxDistance(s.a,s.b,c.boxMm)-b.radiusMm-setting,connectionExemption:null}))),
   ...b.corners.flatMap(c=>a.segments.map(s=>({a:b.id,b:a.id,part:'fitting-pipe',aIndex:c.index,bIndex:s.index,reserveMm:segmentBoxDistance(s.a,s.b,c.boxMm)-a.radiusMm-setting,connectionExemption:null}))),
   ...a.corners.flatMap(c=>b.corners.map(d=>({a:a.id,b:b.id,part:'fitting-fitting',aIndex:c.index,bIndex:d.index,reserveMm:gap(c.boxMm,d.boxMm)-setting,connectionExemption:null})))
  ])),
  roomBoundaryChecks=rows.flatMap(r=>{
   const insidePoints=r.id==='plant/upstream'?[q.insideEntryMm.map((v,k)=>v-(k===0?r.radiusMm+i.envelope.settingsEachMm:0)) as unknown as Point,...r.points.slice(1)]:r.formedGeometry?.path??r.points,
    reserve=(p:Point,radius:number)=>Math.min(p[0]-i.roomPlanMm[0],i.roomPlanMm[0]+i.roomPlanMm[2]-p[0],p[1]-i.roomPlanMm[1],i.roomPlanMm[1]+i.roomPlanMm[3]-p[1],p[2],i.ceilingMm-p[2])-radius-i.envelope.settingsEachMm-(r.formedGeometry?.hausdorffError??0),
    pipeRows=insidePoints.map((p,k)=>({path:r.id,part:'pipe',index:k,reserveMm:reserve(p,r.radiusMm)})),
    cornerRows=r.removable?[]:r.corners.map(c=>({path:r.id,part:'fitting-box',index:c.index,reserveMm:Math.min(c.boxMm[0]-i.roomPlanMm[0],i.roomPlanMm[0]+i.roomPlanMm[2]-c.boxMm[0]-c.boxMm[3],c.boxMm[1]-i.roomPlanMm[1],i.roomPlanMm[1]+i.roomPlanMm[3]-c.boxMm[1]-c.boxMm[4],c.boxMm[2],i.ceilingMm-c.boxMm[2]-c.boxMm[5])-i.envelope.settingsEachMm}))
   return[...pipeRows,...cornerRows]
  }),
  valveChecks=rows.flatMap(r=>r.segments.flatMap(s=>{
   const axial=(r.id==='plant/upstream'&&s.index===r.segments.length-1)||(r.id==='plant/outlet-stem'&&s.index===0),
    a=axial&&r.id==='plant/outlet-stem'?[s.a[0],s.a[1],i.valve.bodyMm[2]+i.valve.bodyMm[5]+r.radiusMm+setting] as Point:s.a,
    b=axial&&r.id==='plant/upstream'?[s.b[0],s.b[1],i.valve.bodyMm[2]-r.radiusMm-setting] as Point:s.b
   return[{id:'body',boxMm:i.valve.bodyMm},{id:'stem',boxMm:i.valve.stemMm}].map(v=>({path:r.id,segment:s.index,valvePart:v.id,connectedAxialInterfaceTrimmed:axial,reserveMm:segmentBoxDistance(a,b,v.boxMm)-r.radiusMm-setting}))
  })),obstacleChecks=rows.filter(r=>!r.removable).flatMap(r=>i.obstacles.flatMap(o=>[
   ...r.segments.map(s=>({path:r.id,part:'pipe',segment:s.index,obstacle:o.id,reserveMm:segmentBoxDistance(s.a,s.b,o.boxMm)-r.radiusMm-setting})),
   ...r.corners.map(c=>({path:r.id,part:'fitting-box',corner:c.index,obstacle:o.id,reserveMm:gap(c.boxMm,o.boxMm)-setting}))])),
  goodsChecks=fixed.flatMap(r=>i.goods.flatMap(g=>{
    const boxes=g.pathMm.slice(1).map((b,k)=>{const a=g.pathMm[k];return[Math.min(a[0],b[0])-g.completeRadiusMm,Math.min(a[1],b[1])-g.completeRadiusMm,0,Math.abs(a[0]-b[0])+2*g.completeRadiusMm,Math.abs(a[1]-b[1])+2*g.completeRadiusMm,g.maximumCompleteHeightMm] as Box})
    return[...r.segments.map(s=>({path:r.id,goods:g.id,part:'pipe',segment:s.index,reserveMm:Math.min(...boxes.map(b=>segmentBoxDistance(s.a,s.b,b)))-r.radiusMm-setting})),
     ...r.corners.map(c=>({path:r.id,goods:g.id,part:'fitting-box',corner:c.index,reserveMm:Math.min(...boxes.map(b=>gap(c.boxMm,b)))-setting}))]})),
  selfChecks=fixed.flatMap(r=>r.corners.flatMap((c,k)=>[
   ...r.corners.slice(k+1).map(d=>({path:r.id,a:k,b:d.index,part:'same-path-corners',reserveMm:gap(c.boxMm,d.boxMm)-setting})),
   ...r.segments.filter(s=>s.index!==k&&s.index!==k+1).map(s=>({path:r.id,a:k,b:s.index,part:'same-path-corner-returning-pipe',reserveMm:segmentBoxDistance(s.a,s.b,c.boxMm)-r.radiusMm-setting}))])),
  arms=fixed.flatMap(r=>{let worst={path:r.id,reserveMm:Infinity};for(let ib=0;ib<=40;ib+=2)for(let a=-15;a<=15;a++){const t=a*Math.PI/180,grip:Point=[i.valve.axisMm[0]-217+ib,i.valve.axisMm[1]+62.5*Math.sin(t),i.valve.axisMm[2]-62.5*Math.cos(t)],cover=1.5454153912482278
    for(const s of r.segments){const reserveMm=segmentDistance(i.ordinaryShoulderMm,grip,s.a,s.b)-40-r.radiusMm-setting-cover;if(reserveMm<worst.reserveMm)worst={path:r.id,reserveMm}}
    for(const c of r.corners){const reserveMm=segmentBoxDistance(i.ordinaryShoulderMm,grip,c.boxMm)-40-setting-cover;if(reserveMm<worst.reserveMm)worst={path:r.id,reserveMm}}
   }return[worst]}),
  cylinder=i.cylindricalStore,drop=rows.find(r=>r.id==='plant/store-removable-drop')!,
  dropStoreReserveMm=Math.min(...segments(drop.formedGeometry!.path).map(s=>segmentDistance(s.a,s.b,[...cylinder.centreXYMm,0],[...cylinder.centreXYMm,cylinder.heightMm])))-cylinder.radiusMm-i.envelope.backboneRadiusMm-setting-drop.formedGeometry!.hausdorffError,
  ingressBorePipePositionReserveMm=q.sourceEntryOpeningDiameterMm/2-i.envelope.backboneRadiusMm-i.envelope.settingsEachMm,
  ingressBoreAfterTwoIndependentSettingsMm=ingressBorePipePositionReserveMm-i.fittedFrame.resolvedInput.settingEachMm,
  ingressBorePerCoordinatePositionAdverseMm=q.sourceEntryOpeningDiameterMm/2-i.envelope.backboneRadiusMm-Math.SQRT2*(i.envelope.settingsEachMm+i.fittedFrame.resolvedInput.settingEachMm),
  ingressBoreAdditionalIndependentMachiningAdverseMm=ingressBoreAfterTwoIndependentSettingsMm-i.fittedFrame.resolvedInput.settingEachMm,
  ingressCargoJambReserveMm=i.sourceEntryCargoSouthYMm-q.insideEntryMm[1]-q.sourceEntryOpeningDiameterMm/2-i.envelope.settingsEachMm,
  ingressInfillSideReserveMm=Math.min(q.insideEntryMm[1]-i.sourceEntryInfillYMm[0],i.sourceEntryInfillYMm[1]-q.insideEntryMm[1])-q.sourceEntryOpeningDiameterMm/2-i.fittedFrame.resolvedInput.settingEachMm,
  lengthById=Object.fromEntries(rows.map(r=>[r.id,r.centrelineLengthMm])),routeLengths={store:lengthById['plant/upstream']+lengthById['plant/outlet-stem']+lengthById['plant/store-fixed']+lengthById['plant/store-removable-drop']+lengthById['plant/store-terminal'],tree:lengthById['plant/upstream']+lengthById['plant/outlet-stem']+lengthById['plant/tree-fixed']},
  area=Math.PI/4*(hydraulicBore/1000)**2,velocity=i.operating.plantDutyLmin/60000/area,
  hydraulicComparisons=Object.entries(routeLengths).map(([outlet,length])=>({outlet,lengthMm:length,fullPlantDutyAsSeparateAdverseBranchLmin:i.operating.plantDutyLmin,straightOnlyLossBar:i.comparison.frictionFactor*length/1000/(hydraulicBore/1000)*1000*velocity**2/2/1e5,fullNetworkLossQualified:false})),
  pressureNodeMap=new Map<string,{id:string;originMm:Point;wrenchN_Nm:number[];contributors:string[]}>(),
  addPressureNode=(id:string,point:Point,force:Point,contributor:string)=>{const absolute=point.map((v,k)=>v+(k===2?i.groundFflMm:0)) as unknown as Point,wrench=[...force,...cross(absolute.map(v=>v/1000) as unknown as Point,force)],row=pressureNodeMap.get(id)??{id,originMm:absolute,wrenchN_Nm:[0,0,0,0,0,0],contributors:[]};wrench.forEach((v,k)=>row.wrenchN_Nm[k]+=v);row.contributors.push(contributor);pressureNodeMap.set(id,row)},
  pressurePopulate=rows.forEach(r=>r.segments.forEach(s=>{const t=direction(s.a,s.b),id=(p:Point,k:number)=>same(p,commonTee)?q.id+'/common-outlet-tee':q.id+'/'+(connections.find(([,a])=>same(a,p))?.[0]??r.id+'/vertex/'+k)
    addPressureNode(id(s.a,s.index),s.a,t.map(v=>-pAN*v) as unknown as Point,r.id+'/segment/'+s.index+'/from')
    addPressureNode(id(s.b,s.index+1),s.b,t.map(v=>pAN*v) as unknown as Point,r.id+'/segment/'+s.index+'/to')
  })),
  pressureNodalWrenches=[...pressureNodeMap.values()],pressureNetworkEquilibriumResidualN_Nm=pressureNodalWrenches.reduce((a,b)=>a.map((v,k)=>v+b.wrenchN_Nm[k]),[0,0,0,0,0,0]),
  valveOrigin=i.valve.axisMm.map((v,k)=>v+(k===2?i.groundFflMm:0)) as unknown as Point,valveForce:Point=[0,0,-i.valve.knownKg*9.81],
  nominalValveGravityWrenchN_Nm=[...valveForce,...cross(valveOrigin.map(v=>v/1000) as unknown as Point,valveForce)],
  referenceGravityResultantWrenchN_Nm=rows.flatMap(r=>r.stock).reduce((a,s)=>a.map((v,k)=>v+s.referenceGravityWrenchN_Nm[k]),nominalValveGravityWrenchN_Nm),
  incidentCuts=[
   {role:'source-outer-cut',kind:'joint-free-wall-spool-boundary',point:q.sourceEntryMm},
   {role:'source-inner-cut',kind:'joint-free-wall-spool-boundary',point:q.insideEntryMm},
   {role:'valve-lower-face',kind:'separating-interface',point:bottom},
   {role:'valve-upper-face',kind:'separating-interface',point:top},
   {role:'common-outlet-tee',kind:'three-branch-connection',point:commonTee},
   {role:'store-high-split',kind:'separating-interface',point:q.storeFixedPathMm.at(-1)!},
   {role:'store-low-split',kind:'separating-interface',point:q.storeRemovableDropMm.at(-1)!},
   ...q.storeTerminalMm.slice(1,-1).map((point,k)=>({role:'store-terminal/vertex-'+(k+1),kind:'formed-tube-wall-cut-not-invented-joint',point})),
   {role:'store-factory-port',kind:'actual-factory-port-trial',point:q.storePortTrialMm},
   {role:'cold-tree-interface',kind:'connected-current-cold-tree-boundary',point:q.coldTreeInterfaceMm}],
  incidentStations={schema:'had-plant-incident-stations/1',coordinateDatum:'Local occupied groundFFL; absolute XYZ adds the same saved groundFFL to Z.',
   storeOuterEnvelopeTopLocalMm:i.cylindricalStore.heightMm,storeOuterEnvelopeTopAbsoluteMm:i.cylindricalStore.heightMm+i.groundFflMm,actualLiquidLevelKnown:false,
   stations:incidentCuts.map(n=>({id:q.id+'/incident/'+n.role,role:n.role,kind:n.kind,localPointMm:[...n.point],absolutePointMm:n.point.map((v,k)=>v+(k===2?i.groundFflMm:0)),
    outerTopMinusStationSignedMm:i.cylindricalStore.heightMm-n.point[2],nonnegativeOuterTopGravityHeadComparisonMm:Math.max(0,i.cylindricalStore.heightMm-n.point[2]),
    sourceStoreAndColdTreePotentiallyConnectedWithAllCutsOpen:true,actualValveNonreturnAirAdmissionAndPressureStateKnown:false,actualMaximumReleaseLmin:null,actualDrainableInventoryLitres:null})),
   interpretation:'Geometric outer-top-to-cut comparisons only. Zero positive gravity head at a high cut does not exclude pressure release, siphon or upper-network backfeed. Actual pressure, air paths and liquid inventory must be solved at each real station.',
   pressureAndGravityCombinedAtActualStation:false,allFaultLocationsCovered:false,
   unsupportedIncidentFamilies:['actual-store-hot-outlet-and-secondary-return-network','expansion-vessel-and-safety-manifold-faults','primary-buffer-and-heat-exchanger-breach','vessel-shell-element-or-flange-breach'],
   completeReleaseNetworkQualified:false},
  diagnostics=[...(crossPathChecks.some(v=>v.reserveMm<0)?['SPLIT_PLANT_BRANCH/cross-path-fixed-territory']:[]),...(roomBoundaryChecks.some(v=>v.reserveMm < -1e-7)?['SPLIT_PLANT_BRANCH/finished-room-boundary']:[]),...(valveChecks.some(v=>v.reserveMm < -1e-7)?['SPLIT_PLANT_BRANCH/valve-route']:[]),...new Set(obstacleChecks.filter(v=>v.reserveMm<0).map(v=>'SPLIT_PLANT_BRANCH/fixed-obstacle/'+v.obstacle)),...new Set(goodsChecks.filter(v=>v.reserveMm<0).map(v=>'SPLIT_PLANT_BRANCH/goods/'+v.goods)),
   ...(selfChecks.some(v=>v.reserveMm<0)?['SPLIT_PLANT_BRANCH/self-fitting-territory']:[]),...(arms.some(v=>v.reserveMm<0)?['SPLIT_PLANT_BRANCH/ordinary-arm']:[]),
   ...(dropStoreReserveMm<25?['SPLIT_PLANT_BRANCH/full-backbone-drop-cylinder-clearance']:[]),...(ingressBoreAfterTwoIndependentSettingsMm<0?['SPLIT_PLANT_BRANCH/service-infill-port-pipe-position-envelope']:[]),...(ingressInfillSideReserveMm<0?['SPLIT_PLANT_BRANCH/service-infill-port-side-land']:[]),...(ingressCargoJambReserveMm<0?['SPLIT_PLANT_BRANCH/entry-cargo-jamb']:[]),
   'SPLIT_PLANT_BRANCH/east-service-infill-frame-weather-frost-unsupported','SPLIT_PLANT_BRANCH/tee-and-fixed-receivers-unsupported','SPLIT_PLANT_BRANCH/stored-backfeed-containment-relief-unsupported','SPLIT_PLANT_BRANCH/material-product-renewal-unsupported','SPLIT_PLANT_BRANCH/terminal-wrapper-and-fitting-stock-unsupported']
 return{schema:'had-split-plant-branch-result/1',id:q.id,state:'explicit-connected-branch-development-with-rejected-interfaces',choice:q,
  sourceBindingDigest:i.sourceBindingDigest,resolvedInput:i,fittedFrame:i.fittedFrame,sourceIndependent:true,entryKind:'south-service-infill-within-existing-raw-arch',sourceEntryInfillYMm:i.sourceEntryInfillYMm,newMasonryHoleCredited:false,actualInfillFrameAndIndependentSupportQualified:false,noUtilityColdHeaderOrPlantTransferThroughUtility:true,roomPlanMm:i.roomPlanMm,ceilingMm:i.ceilingMm,groundFflMm:i.groundFflMm,obstacles:i.obstacles,goods:i.goods,referenceValve:i.valve,ordinaryShoulderMm:i.ordinaryShoulderMm,connections:connections.map(([id,a])=>({id,pointMm:a})),paths:rows,
  lengthInterpretation:'Full virtual-corner polyline stock reference, not manufactured tube cuts; formed paths and their chord error are returned separately. Real fittings/tee and full installed stock remain unqualified.',massInterpretation:'Separate adverse pipe tolerance/density reference; terminal contains copper/water only. Terminal wrapper, fittings, tee, receiver, capture and actual materials remain unqualified; this is not complete installed mass.',knownValveKg:i.valve.knownKg,referenceStraightStockKg:rows.flatMap(r=>r.stock).reduce((n,s)=>n+s.referenceCopperKg+s.referenceWaterKg+s.referenceJacketKg+s.referenceInsulationKg,0),
  incidentStations,pressureNodalWrenches,pressureNetworkEquilibriumResidualN_Nm,referenceGravityResultantWrenchN_Nm,nominalValveGravity:{referenceOriginMm:valveOrigin,wrenchN_Nm:nominalValveGravityWrenchN_Nm,actualFactoryCentroidKnown:false},
  pressureInterpretation:'Uniform source-pressure nodal reference includes every pipe end, corner and shared tee exactly once; endpoint cuts complete equilibrium. These are not simultaneous solved guide reactions. Actual momentum, loss, valve closed/open states and thermal compatibility remain unqualified.',
  lockedStraightTubeThermalReferenceN:117200*copperArea*.000017*i.operating.temperatureChangeK,actualValveGuideAndSupportReactionsN:null,
  geometry:{crossPathChecks,roomBoundaryChecks,valveChecks,obstacleChecks,goodsChecks,selfChecks,arms,dropStoreReserveMm,ingressCargoJambReserveMm,ingressBorePipePositionReserveMm,ingressBoreAfterTwoIndependentSettingsMm,ingressBoreAdditionalIndependentMachiningAdverseMm,ingressBorePerCoordinatePositionAdverseMm,ingressPositionBudget:{pipeAxisTotalMm:i.envelope.settingsEachMm,frameHoleAxisTotalMm:i.fittedFrame.resolvedInput.settingEachMm,withinInfillHolePositionMm:i.fittedFrame.resolvedInput.settingEachMm,norm:'Euclidean radial displacement in the bore YZ plane; independent per-coordinate boxes are an adverse control, not credited.',ownership:'Frame/hole total includes fabrication and installation; within-infill land is another constraint on that same finished hole, not a third independently added radial error.',additionalIndependentMachiningAdverseTotalMm:i.envelope.settingsEachMm+2*i.fittedFrame.resolvedInput.settingEachMm,actualFabricatedInstalledPositionAndSealQualified:false},ingressInfillSideReserveMm},hydraulicComparisons,
  normalMode:'Cylinder and buffer home; ordinary Plant approach available. No manual response credit.',
  replacementMode:'Independently isolate Lodge and store/upper inventory; drain and verify zero pressure; capture and remove BOTH explicitly removable store connections before goods transit. Fixed source and tree remain positively supported.',
  fullBranchArrangementComplete:false,nativeStructuralActionsAdopted:false,selected:false,diagnostics}
}

/** Drawing consumes the exact result. Display coordinates have no semantic authority. */
export function drawInletSplitPlantBranch(r:ReturnType<typeof inletSplitPlantBranch>){
 const sx=.17,X=(x:number)=>50+(x-9300)*sx,Y=(y:number)=>640-(y-3797)*sx,Z=(z:number)=>1270-z*sx,
  esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!)),
  txt=(x:number,y:number,s:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`,
  poly=(points:Path,elevation:boolean,c:string,w=3)=>`<polyline points="${points.map(p=>`${X(p[0])},${elevation?Z(p[2]):Y(p[1])}`).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}"/>`,
  box=(b:Box,elevation:boolean,c:string)=>`<rect x="${X(b[0])}" y="${elevation?Z(b[2]+b[5]):Y(b[1]+b[4])}" width="${b[3]*sx}" height="${(elevation?b[5]:b[4])*sx}" fill="${c}" stroke="#7c786e"/>`,
  min=(a:readonly{reserveMm:number}[])=>Math.min(...a.map(v=>v.reserveMm)),high=r.incidentStations.stations.find(s=>s.role==='common-outlet-tee')!,low=r.incidentStations.stations.find(s=>s.role==='store-factory-port')!
 return`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1360" viewBox="0 0 1280 1360"><defs><clipPath id="plant-branch-plan"><rect x="25" y="130" width="625" height="550"/></clipPath><clipPath id="plant-branch-elevation"><rect x="25" y="740" width="625" height="540"/></clipPath></defs><rect width="1280" height="1360" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">
 ${txt(35,40,'Independent Plant branch · complete explicit topology, unresolved interfaces',24)}
 ${txt(35,75,'New east entry; no Plant cold feed in Utility. Source entry, containment, materials and structural admission remain unqualified.')}
 ${txt(35,110,'PLAN · actual fixed objects, source station and explicit removable store connection',18)}
 <g clip-path="url(#plant-branch-plan)">${r.obstacles.map(o=>box(o.boxMm,false,'#d9d4c7')).join('')}${box(r.referenceValve.bodyMm,false,'#dfa666')}${box(r.referenceValve.stemMm,false,'#dfa666')}
 ${r.paths.map(p=>poly(p.formedGeometry?.path??p.points,false,p.removable?'#a24f38':'#247d8a')).join('')}
 ${poly([r.ordinaryShoulderMm,[r.referenceValve.axisMm[0]-217,r.referenceValve.axisMm[1],r.referenceValve.axisMm[2]-62.5]],false,'#627d48',2)}</g>
 ${txt(680,155,`Fixed-route / full goods reserve: ${min(r.geometry.goodsChecks).toFixed(3)} mm.`)}
 ${txt(680,195,`Fixed objects: ${min(r.geometry.obstacleChecks).toFixed(3)} mm; arm: ${min(r.geometry.arms).toFixed(3)} mm.`)}
 ${txt(680,235,`Original full-jacket drop / cylinder: ${r.geometry.dropStoreReserveMm.toFixed(3)} mm; required25 mm.`)}
 ${txt(680,275,`Reference straight stock: ${r.referenceStraightStockKg.toFixed(3)} kg + valve${r.knownValveKg} kg.`)}
 ${txt(680,315,'Fixed and sliding guide reactions remain unsolved.')}${txt(680,355,'Store and cold-tree branches remain independently explicit.')}
 ${txt(680,395,'Red connection leaves before cylinder travel; no pipe-flex credit.')}${txt(680,435,`Goods height design limits: ${r.goods.map(g=>g.maximumCompleteHeightMm).join(' / ')} mm.`)}
 ${txt(680,475,`Source port / fitted-cargo reserve: ${r.geometry.ingressCargoJambReserveMm.toFixed(1)} mm.`)}
 ${txt(680,515,`${r.choice.sourceEntryOpeningDiameterMm} mm service-infill port: ${r.geometry.ingressBoreAfterTwoIndependentSettingsMm.toFixed(2)} mm pipe plus total frame/hole reserve.`)}${txt(680,550,'Existing raw arch; infill/frame, seals and weather path remain unqualified.')}
 ${txt(680,590,`Outer-top gravity comparison: tee${high.nonnegativeOuterTopGravityHeadComparisonMm.toFixed(0)} / port${low.nonnegativeOuterTopGravityHeadComparisonMm.toFixed(0)} mm.`)}${txt(680,630,'Geometry only; pressure, air paths and actual release unknown.')}
 ${txt(35,715,'X/Z PROJECTION · exact local heights; intersecting projections do not establish physical contact',18)}
 <g clip-path="url(#plant-branch-elevation)">${r.obstacles.filter(o=>!o.id.includes('south-west')&&!o.id.includes('service-spine')).map(o=>box(o.boxMm,true,'#e3dfd4')).join('')}
 ${box(r.referenceValve.bodyMm,true,'#dfa666')}${box(r.referenceValve.stemMm,true,'#dfa666')}${r.paths.map(p=>poly(p.formedGeometry?.path??p.points,true,p.removable?'#a24f38':'#247d8a')).join('')}</g>
 ${txt(680,820,'Current failure and exact unsupported interfaces:',18)}${r.diagnostics.map((d,k)=>txt(680,860+k*34,d.replace('SPLIT_PLANT_BRANCH/',''),14)).join('')}
 ${txt(35,1320,'HAD OPEN · no complete room, inlet, support, product, owner or physical acceptance. Native STR receives no new action.',17)}
 </g></svg>`
}

/** One fitted frame inside the unchanged masonry arch. Clear width is effective
 * at90degrees INCLUDING the parked44mm leaf, not merely a jamb-axis distance. */
export function derivePlantFittedFrame(i:{choice:import('./inlet-split-plant-room-choice.js').PlantFittedFrameChoice;rawOpeningYMm:readonly[number,number];rawSpringMm:number;rawHeadMm:number;groundFflMm:number;openingShiftMm:number|null;minimumCargoMm:readonly[number,number];wallInnerXMm:number;wallOuterXMm:number;settingEachMm:number}){
 if(!i||!keys(i,['choice','rawOpeningYMm','rawSpringMm','rawHeadMm','groundFflMm','openingShiftMm','minimumCargoMm','wallInnerXMm','wallOuterXMm','settingEachMm']))throw Error('Unsupported fitted Plant frame inputs')
 const c=admitPlantFittedFrameChoice(i.choice),r=i.rawOpeningYMm,min=i.minimumCargoMm
 if(!c||!tuple(r,2)||!tuple(min,2)||![i.rawSpringMm,i.rawHeadMm,i.groundFflMm,i.wallInnerXMm,i.wallOuterXMm,i.settingEachMm].every(Number.isFinite)||(i.openingShiftMm!==null&&(!Number.isFinite(i.openingShiftMm)||i.openingShiftMm!==i.groundFflMm))||r[1]<=r[0]||i.wallOuterXMm<=i.wallInnerXMm||c.clearWidthMm<min[0]||c.clearHeightMm<min[1]||c.clearWidthMm>=r[1]-r[0]||i.settingEachMm<10)throw Error('Unsupported fitted Plant frame and actual arch')
 const centre=(r[0]+r[1])/2,clearYMm=[centre-c.clearWidthMm/2,centre+c.clearWidthMm/2] as const,infillsYMm=[[r[0],clearYMm[0]],[clearYMm[1],r[1]]] as const,
  sourceAxisYMm=(infillsYMm[0][0]+infillsYMm[0][1])/2,leafHalf=c.leafThicknessMm/2,
  hingeMm=[i.wallOuterXMm+leafHalf,clearYMm[1]+leafHalf,0] as const,leafSpanMm=c.clearWidthMm+leafHalf,
  // North hinge lies half a leaf inside its own infill. Closed leaf is wholly
  // outboard of the wall face; parked inboard skin equals effective clear north.
  sourceBoreSideReserveMm=Math.min(sourceAxisYMm-r[0],clearYMm[0]-sourceAxisYMm)-c.sourceOpeningDiameterMm/2-i.settingEachMm,
  sourceFixedHeaderToSpringReserveMm=i.rawSpringMm-i.groundFflMm-c.clearHeightMm-c.headerDepthMm-2*i.settingEachMm,
  sourceFixedHeaderToHeadReserveMm=i.rawHeadMm-i.groundFflMm-c.clearHeightMm-c.headerDepthMm-2*i.settingEachMm,
  headerToRawSpringReserveMm=i.openingShiftMm===null?null:i.rawSpringMm+i.openingShiftMm-i.groundFflMm-c.clearHeightMm-c.headerDepthMm-2*i.settingEachMm,
  headerToRawHeadReserveMm=i.openingShiftMm===null?null:i.rawHeadMm+i.openingShiftMm-i.groundFflMm-c.clearHeightMm-c.headerDepthMm-2*i.settingEachMm
 return{schema:'had-plant-fitted-frame-result/1',id:c.id,resolvedInput:structuredClone({...i,choice:c}),choice:c,rawOpeningYMm:r,rawSpringMm:i.rawSpringMm,rawHeadMm:i.rawHeadMm,minimumCargoMm:min,effectiveClearYMm:clearYMm,effectiveOpenWidthMm:c.clearWidthMm,clearHeightMm:c.clearHeightMm,
  infills:infillsYMm.map((v,k)=>({id:c.id+(k?'/north-infill':'/south-infill'),intervalYMm:v,widthMm:v[1]-v[0],fullReservedBoxMm:[i.wallInnerXMm,v[0],i.openingShiftMm??0,i.wallOuterXMm-i.wallInnerXMm,v[1]-v[0],i.rawSpringMm] as Box})),
  sourceAxisYMm,sourceOpeningDiameterMm:c.sourceOpeningDiameterMm,sourceBoreSideReserveMm,headerToRawSpringReserveMm,headerToRawHeadReserveMm,sourceFixedCountercase:{headerToSpringReserveMm:sourceFixedHeaderToSpringReserveMm,headerToHeadReserveMm:sourceFixedHeaderToHeadReserveMm},
  verticalDatum:{rawArchDatum:'source-groundFFL0',openingTranslationMm:i.openingShiftMm,joinedProfileGeometryOnly:true,frameBottomAbsoluteMm:i.groundFflMm,frameClearHeadAbsoluteMm:i.groundFflMm+c.clearHeightMm,frameHeaderTopAbsoluteMm:i.groundFflMm+c.clearHeightMm+c.headerDepthMm,rawSpringAbsoluteMm:i.rawSpringMm,rawHeadAbsoluteMm:i.rawHeadMm,twoIndependentSettingsMm:2*i.settingEachMm},hingeMm,leafSpanMm,leafHalfMm:leafHalf,parkedInboardFaceYMm:hingeMm[1]-leafHalf,
  exactNorthLeafSweptMinimumYMm:hingeMm[1]-Math.hypot(leafSpanMm,leafHalf),hingeOutboardOffsetMm:leafHalf,hingeIntoNorthInfillMm:leafHalf,
  frameLeafInterfaces:'Purpose-designed north hinge; closed leaf skin touches outer wall face, parked leaf skin defines effective clear north. Matched rebate/seals/hardware and actual hinge receivers are unqualified.',
  newMasonryOpening:false,selected:false,actualFrameMaterialThermalWeatherFireSupportAndHardwareQualified:false,ordinarySourceFaultResponseCredited:false}
}

export function admitResolvedPlantFittedFrame(value:unknown){
 const f=value as ReturnType<typeof derivePlantFittedFrame>
 if(!f||f.schema!=='had-plant-fitted-frame-result/1'||!f.resolvedInput)throw Error('Unsupported derived Plant fitted frame')
 const actual=derivePlantFittedFrame(f.resolvedInput)
 if(sha256SemanticFingerprint(actual)!==sha256SemanticFingerprint(f))throw Error('Unsupported derived Plant fitted frame')
 return actual
}

/** Shift only source/station-coincident authored Y stations. Retained factory
 * store split, store port and cold-tree interface remain their actual sources. */
export function coordinatePlantFrameBranch(frame:ReturnType<typeof derivePlantFittedFrame>,branch:SplitPlantBranchChoice,station:import('./inlet-indoor-cuts.js').SplitPlantStationChoice){
 const old=station.axisMm[1],dy=frame.sourceAxisYMm-old
 if(branch.schema!=='had-split-plant-branch/1'||!same(branch.sourceEntryMm.slice(1),branch.insideEntryMm.slice(1))||branch.upstreamPathMm.some(p=>p[1]!==old)||branch.outletStemMm.some(p=>p[1]!==old)||branch.storeFixedPathMm.length!==3||branch.treeFixedPathMm.length!==4||branch.storeFixedPathMm.slice(0,2).some(p=>p[1]!==old)||branch.treeFixedPathMm.slice(0,2).some(p=>p[1]!==old))throw Error('Unsupported reference station-to-branch Y relationship')
 const shift=(p:Point)=>[p[0],p[1]+dy,p[2]] as Point,shiftPrefix=(p:Path,n:number)=>p.map((v,k)=>k<n?shift(v):v),
  choice:SplitPlantBranchChoice={...branch,sourceEntryMm:shift(branch.sourceEntryMm),insideEntryMm:shift(branch.insideEntryMm),upstreamPathMm:branch.upstreamPathMm.map(shift),outletStemMm:branch.outletStemMm.map(shift),storeFixedPathMm:shiftPrefix(branch.storeFixedPathMm,2),treeFixedPathMm:shiftPrefix(branch.treeFixedPathMm,2),sourceEntryOpeningDiameterMm:frame.sourceOpeningDiameterMm},
  stationChoice={...station,axisMm:shift(station.axisMm)}
 return{frame,choice,stationChoice,referenceAxisYMm:old,stationShiftYMm:dy,authoredReferenceFileChanged:false,sourceEntryGeometryChanged:dy!==0,retainedStoreAndTreeInterfacesMoved:false}
}
