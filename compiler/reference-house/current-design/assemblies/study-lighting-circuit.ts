import {sha256SemanticFingerprint} from '../../../core/identity.js'
import type {LightingBasis} from './study-lighting.js'
import type {deriveLightingCornerDetail} from './study-lighting-corner.js'
import {segmentBoxDistance,segmentDistance} from '../../../../project/had/studies/service-interface-geometry.mjs'
type P=readonly number[]
type H=ReturnType<typeof deriveLightingCornerDetail>['localHomeRunComparison']
export interface StudyCircuitDesign{
 readonly schema:'ias-study-circuit-design/1';readonly nominalVoltageV:number;readonly cmin:number;readonly phase:'L3'
 readonly bendRadiusMm:number;readonly pitchMm:number;readonly highLevelMm:number;readonly corridorYMm:number;readonly spineYMm:number;readonly wcXMm:number;readonly studyXMm:number;readonly riserXMm:number
 readonly boxSizeMm:P;readonly boxRearMm:number;readonly boxBottomMm:number;readonly toolDiameterMm:number;readonly tailOrderAllowanceMm:number;readonly clearanceMm:number;readonly settingMm:number;readonly combinedRatingFactor:number;readonly maximumFillFraction:number
 readonly socket:{way:string;article:string;ratedA:number;cable:string;dropFraction:number};readonly lighting:{way:string;article:string;ratedA:number;cable:string;dropFraction:number}
 readonly cables:Readonly<Record<string,{diameterMm:number;areaMm2:number;exposedRatingA:number;mVPerAM:number;r1OhmKm:number;r2OhmKm:number;sheathMm2:number;kgKm:number}>>
 readonly gland:{threadMm:number;projectionMm:number;potMm:number;potDiameterMm:number;locknutCornersMm:number}
 readonly deviceTerminalLimitsMm2:Readonly<Record<'socket'|'switch'|'lamp',number|null>>
 readonly terminal:{reference:string;maximumMm2:number;ratedA:number;ratedV:number;reservationMm:P}
 readonly evidence:readonly {id:string;url:string;finding:string;retrieval:string}[]
}
const distance=(a:P,b:P)=>Math.hypot(...a.map((v,i)=>v-b[i]!))
const length=(p:readonly P[])=>p.slice(1).reduce((n,b,i)=>n+distance(p[i]!,b),0)
const boxGap=(a:P,b:P)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]!-b[i]!-b[i+3]!,b[i]!-a[i]!-a[i+3]!,0)))
function round(vertices:readonly P[],R:number){
 const path:number[][]=[Array.from(vertices[0]!)],issues:string[]=[]
 for(let i=1;i<vertices.length-1;i++){
  const a=vertices[i-1]!,b=vertices[i]!,c=vertices[i+1]!,u=b.map((v,j)=>(v-a[j]!)/distance(a,b)),v=c.map((x,j)=>(x-b[j]!)/distance(b,c))
  if(Math.abs(u.reduce((n,x,j)=>n+x*v[j]!,0))>1e-9){issues.push('nonorthogonal-feeder-vertex');continue}
  if(distance(a,b)<(i===1?R:2*R)||distance(b,c)<(i===vertices.length-2?R:2*R))issues.push('overlapping-feeder-bends')
  const centre=b.map((x,j)=>x-u[j]!*R+v[j]!*R)
  for(let k=0;k<=30;k++){const angle=k*Math.PI/60;path.push(centre.map((x,j)=>x+R*(-v[j]!*Math.cos(angle)+u[j]!*Math.sin(angle))))}
 }
 path.push(Array.from(vertices.at(-1)!))
 return{verticesMm:vertices,pathMm:path,radiusMm:R,chordErrorMm:R*(1-Math.cos(Math.PI/120)),lengthMm:length(path),issues}
}
/** Source-bound circuit specification; physical terminal/installed qualification remains separate. */
export function deriveStudyLightingCircuit(b:LightingBasis,h:H,s:StudyCircuitDesign){
 if(!s||s.schema!=='ias-study-circuit-design/1'||s.phase!=='L3')throw TypeError('IAS_CIRCUIT_UNSUPPORTED_SPECIFICATION')
 const finite=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)
 if(![s.nominalVoltageV,s.cmin,s.bendRadiusMm,s.pitchMm,s.highLevelMm,s.corridorYMm,s.spineYMm,s.wcXMm,s.studyXMm,s.riserXMm,s.boxRearMm,s.boxBottomMm,s.toolDiameterMm,s.tailOrderAllowanceMm,s.clearanceMm,s.settingMm,s.combinedRatingFactor,s.maximumFillFraction,...s.boxSizeMm,...Object.values(s.gland),s.terminal.maximumMm2,s.terminal.ratedA,s.terminal.ratedV,...s.terminal.reservationMm].every(finite)
  ||s.boxSizeMm.length!==3||s.boxSizeMm.some(n=>n<=0)||s.bendRadiusMm<=0||s.pitchMm<=0||s.boxRearMm<0||s.boxBottomMm<0||s.combinedRatingFactor<=0||s.combinedRatingFactor>1||s.maximumFillFraction<=0||s.maximumFillFraction>1||s.cmin<=0||s.cmin>1)throw TypeError('IAS_CIRCUIT_COMPONENT_DOMAIN_INVALID')
 if(!s.deviceTerminalLimitsMm2||['socket','switch','lamp'].some(id=>{const n=s.deviceTerminalLimitsMm2[id as keyof typeof s.deviceTerminalLimitsMm2];return n!==null&&(!finite(n)||n<=0)}))throw TypeError('IAS_CIRCUIT_DEVICE_TERMINAL_REFERENCE_INVALID')
 const e=b.electrical,cu=e?.consumerStationXYWHMm
 if(!cu||cu.length!==4||!cu.every(finite)||!e.incoming?.path.length||!e.dryDistribution?.path.length||!e.phaseLoadA||e.phaseLoadA.length!==3||!e.phaseLoadA.every(finite))throw Error('IAS_CIRCUIT_CURRENT_SOURCE_UNAVAILABLE')
 const issues:string[]=[],coreY=h.routes[0]!.sourcePointMm[1]!+h.boxes[0]!.entryAxisCoreDepthRequirementMm
 const box=[h.bayPlanMm[0]!,coreY-s.boxRearMm-s.boxSizeMm[2]!,s.boxBottomMm,s.boxSizeMm[0]!,s.boxSizeMm[2]!,s.boxSizeMm[1]!],right=box[0]!+box[3]!,top=box[2]!+box[5]!,ID=h.conduitInsideDiameterMm
 const feeders=[s.socket,s.lighting].map((way,i)=>{
  const cable=s.cables[way.cable];if(!cable||!Object.values(cable).every(n=>finite(n)&&n>0))throw Error('IAS_CIRCUIT_CABLE_REFERENCE_MISSING')
  const offset=i*s.pitchMm,z=s.highLevelMm+(1-i)*s.pitchMm,y=coreY-59,x=s.riserXMm+(1-i)*s.pitchMm
  const origin=[cu[0]!+cu[2]!-offset,e.incoming!.path.at(-1)![1]!+offset,1500+offset],entry=[right,y,box[2]!+25+offset*1.25]
  const route=round([origin,[origin[0]!,origin[1]!,z],[origin[0]!,s.spineYMm+offset,z],[s.wcXMm-offset,s.spineYMm+offset,z],[s.wcXMm-offset,s.corridorYMm+offset,z],[s.studyXMm-offset,s.corridorYMm+offset,z],[s.studyXMm-offset,y,z],[x,y,z],[x,y,entry[2]!],entry],s.bendRadiusMm)
  issues.push(...route.issues.map(q=>way.way+':'+q))
  const insideRadiusMm=s.bendRadiusMm-cable.diameterMm/2,requiredInsideRadiusMm=6*cable.diameterMm,ceilingReserveMm=b.room.ceilingZMm-Math.max(...route.pathMm.map(p=>p[2]!))-cable.diameterMm/2-s.settingMm
  if(insideRadiusMm<requiredInsideRadiusMm)issues.push(way.way+':bend-rejected')
  if(ceilingReserveMm<s.clearanceMm)issues.push(way.way+':ceiling-rejected')
  const wallCrossings=e.walls.flatMap(w=>{
   const normal=w.a[0]===w.b[0]?0:1,along=1-normal,core=w.structuralCore??[w.a[normal]!-w.t/2,w.a[normal]!+w.t/2]
   const lo=[Math.min(w.a[0]!,w.b[0]!),Math.min(w.a[1]!,w.b[1]!),0],size=[Math.abs(w.b[0]!-w.a[0]!),Math.abs(w.b[1]!-w.a[1]!),b.room.ceilingZMm];lo[normal]=core[0]!;size[normal]=core[1]!-core[0]!
   const hits=route.pathMm.slice(1).flatMap((p,j)=>segmentBoxDistance(route.pathMm[j]!,p,[...lo,...size])<cable.diameterMm/2+route.chordErrorMm?[j]:[])
   if(!hits.length)return[]
   const points=hits.map(j=>{const a=route.pathMm[j]!,c=route.pathMm[j+1]!,t=Math.max(0,Math.min(1,(w.a[normal]!-a[normal]!)/(c[normal]!-a[normal]!)));return a.map((v,k)=>v+t*(c[k]!-v))}),p=points[Math.floor(points.length/2)]!
   const reserve=Math.min(...(w.holes??[]).map(q=>Math.max(q[0]!-p[along]!,p[along]!-q[1]!)-e.arch.radialRing))-10-2*s.settingMm,straight=Math.max(...points.map(q=>q[along]!))-Math.min(...points.map(q=>q[along]!))<1e-6
   if(reserve<s.clearanceMm)issues.push(way.way+':'+w.id+'-arch-rejected')
   if(!straight)issues.push(way.way+':'+w.id+'-curved-core-crossing-rejected')
   return[{wallId:w.id,centreMm:p,boreDiameterMm:20,coreNormalRangeMm:core,archReserveMm:Number.isFinite(reserve)?reserve:null,straightThroughCore:straight,
    duty:'New bounded sleeved/sealed side-spandrel crossing; no longitudinal chase or retrospective drilling authorisation.',masonryQualified:false,fireAirAcousticSealQualified:false}]
  })
  return{...way,phase:s.phase,cable:{reference:way.cable,...cable},...route,insideRadiusMm,requiredInsideRadiusMm,ceilingReserveMm,wallCrossings,sourceInterfaceMm:origin,sourceTerminalCADQualified:false,entryMm:entry,correctedRatingA:cable.exposedRatingA*s.combinedRatingFactor}
 })
 const portPitchMm=Math.max(Math.abs(h.routes[0]!.sourcePointMm[0]!-h.routes[1]!.sourcePointMm[0]!),Math.ceil(s.toolDiameterMm/2+s.gland.locknutCornersMm/2+2*s.settingMm+s.clearanceMm))
 const runs=h.routes.map((r,i)=>{
  const cable=s.cables[i===0?s.socket.cable:s.lighting.cable]!,depth=i===0?59:i===2?43:coreY-r.sourcePointMm[1]!,sourceY=coreY-depth,portX=h.routes[2]!.sourcePointMm[0]!+(2-i)*portPitchMm,dx=r.sourcePointMm[0]!-portX,dy=r.sourcePointMm[1]!-sourceY,delta=Math.hypot(dx,dy),ux=delta?dx/delta:0,uy=delta?dy/delta:0,R=s.bendRadiusMm
  if(delta>2*R)throw RangeError('IAS_CIRCUIT_SOURCE_OFFSET_UNSUPPORTED')
  const angle=Math.acos(1-delta/(2*R)),rise=2*R*Math.sin(angle),startZ=top+s.gland.projectionMm
  const path:number[][]=[[portX,sourceY,top],[portX,sourceY,startZ]]
  for(let k=1;k<=20;k++){const a=angle*k/20;path.push([portX+ux*R*(1-Math.cos(a)),sourceY+uy*R*(1-Math.cos(a)),startZ+R*Math.sin(a)])}
  for(let k=1;k<=20;k++){const a=angle*k/20;path.push([portX+dx/2+ux*R*(Math.cos(angle-a)-Math.cos(angle)),sourceY+dy/2+uy*R*(Math.cos(angle-a)-Math.cos(angle)),startZ+R*Math.sin(angle)+R*(Math.sin(angle)-Math.sin(angle-a))])}
  path.push(Array.from(r.sourcePointMm))
  const straightAboveMm=r.sourcePointMm[2]!-startZ-rise,fillFraction=cable.diameterMm**2/ID**2,insideRadiusMm=r.bend.radiusMm-ID/2
  if(straightAboveMm<s.clearanceMm)issues.push(r.id+':source-bend-rejected')
  if(fillFraction>s.maximumFillFraction)issues.push(r.id+':fill-rejected')
  if(insideRadiusMm<6*cable.diameterMm||R-cable.diameterMm/2<6*cable.diameterMm)issues.push(r.id+':cable-bend-rejected')
  const sideToolReserveMm=Math.min(portX-box[0]!,right-portX)-Math.max(s.gland.locknutCornersMm,s.toolDiameterMm)/2-s.settingMm,counterholdRearReserveMm=depth-s.boxRearMm-s.toolDiameterMm/2-s.settingMm
  if(Math.min(sideToolReserveMm,counterholdRearReserveMm)<s.clearanceMm)issues.push(r.id+':source-gland-tool-rejected')
  if(depth-s.gland.locknutCornersMm/2<s.boxRearMm||depth+s.gland.locknutCornersMm/2>s.boxRearMm+s.boxSizeMm[2]!)issues.push(r.id+':source-gland-body-rejected')
  return{id:r.id,sourceInterfaceId:r.sourceInterfaceId,enclosureId:r.enclosureId,role:['socket-L-N-E','switch-COM-L1-E','lighting-outlet-L-N-E'][i],cable,
   lengthMm:r.tubeLengthMm+r.collarLengthMm+2*s.tailOrderAllowanceMm+length(path),fillFraction,insideRadiusMm,requiredInsideRadiusMm:6*cable.diameterMm,
   transition:{sourcePortMm:path[0]!,homeRunInterfaceMm:r.sourcePointMm,pathMm:path,radiusMm:R,straightAboveMm,sideToolReserveMm,counterholdRearReserveMm},
   devicePort:{enclosureId:r.enclosureId,entryThreadMm:s.gland.threadMm,potDiameterMm:s.gland.potDiameterMm,potLengthMm:s.gland.potMm,coordinatesQualified:false,
    duty:'One matched RGM/RPSL end. The continuous MI sheath protects the short gap beyond the bushed conduit; no custom conduit/gland splitter. Actual port/terminal CAD remains unqualified.'}}
 })
 const neighbourToolChecks=runs.flatMap((r,i)=>runs.flatMap((q,j)=>i===j?[]:[{port:r.sourceInterfaceId,neighbour:q.sourceInterfaceId,reserveMm:distance(r.transition.sourcePortMm,q.transition.sourcePortMm)-s.toolDiameterMm/2-s.gland.locknutCornersMm/2-2*s.settingMm}]))
 if(neighbourToolChecks.some(q=>q.reserveMm<s.clearanceMm))issues.push('source-port-neighbour-tool-rejected')
 let pair=Infinity
 for(let i=1;i<feeders[0]!.pathMm.length;i++)for(let j=1;j<feeders[1]!.pathMm.length;j++)pair=Math.min(pair,segmentDistance(feeders[0]!.pathMm[i-1]!,feeders[0]!.pathMm[i]!,feeders[1]!.pathMm[j-1]!,feeders[1]!.pathMm[j]!))
 const pairReserveMm=pair-(feeders[0]!.cable.diameterMm+feeders[1]!.cable.diameterMm)/2-2*s.settingMm-2*feeders[0]!.chordErrorMm
 if(pairReserveMm<s.clearanceMm)issues.push('feeder-pair-rejected')
 const localBodies=[...h.carrierStripsXZMm.map((p,i)=>({id:'carrier/'+i,box:[p[0]!,coreY-h.carrierDepthMm[1]!,p[1]!,p[2]!-p[0]!,h.carrierDepthMm[1]!-h.carrierDepthMm[0]!,p[3]!-p[1]!]})),...h.caseRenewal.flatMap(c=>c.checkedPartSweeps.map(p=>({id:c.id+'/'+p.phase+'/'+p.partId,box:p.box})))]
 const retainedChecks=feeders.flatMap(f=>localBodies.map(o=>({way:f.way,bodyId:o.id,reserveMm:Math.min(...f.pathMm.slice(1).map((p,i)=>segmentBoxDistance(f.pathMm[i]!,p,o.box)))-f.cable.diameterMm/2-f.chordErrorMm-2*s.settingMm})))
 if(retainedChecks.some(q=>q.reserveMm<s.clearanceMm))issues.push('feeder-retained-body-or-renewal-rejected')
 const serviceChecks=feeders.flatMap(f=>e.serviceRoutes.filter(r=>!['power-incoming','power-distribution','lighting-controls-data'].includes(r.id)&&r.path.length>1).map(r=>{
  let d=Infinity;for(let i=1;i<f.pathMm.length;i++)for(let j=1;j<r.path.length;j++)d=Math.min(d,segmentDistance(f.pathMm[i-1]!,f.pathMm[i]!,r.path[j-1]!,r.path[j]!))
  return{way:f.way,serviceId:r.id,centrelineReserveMm:d-f.cable.diameterMm/2-f.chordErrorMm,targetMm:50,fullSectionQualified:false,scope:'Declared source paths only; actual outside sections, insulation, wet successor and supports remain to join.'}
 }))
 if(serviceChecks.some(q=>q.centrelineReserveMm<q.targetMm))issues.push('declared-service-path-separation-rejected')
 const cradle=[box[0]!-20,h.caseRestPlanMm[1]!,box[0]!+box[3]!+25,h.caseRestPlanMm[1]!+130],parked=[box[0]!,cradle[1]!+35,100,box[3]!,box[4]!,box[5]!]
 const sweeps=[{phase:'normal-draw',box:[box[0]!,parked[1]!,box[2]!,box[3]!,box[1]!+box[4]!-parked[1]!,box[5]!]},{phase:'lower-to-rest',box:[box[0]!,parked[1]!,100,box[3]!,box[4]!,box[2]!+box[5]!-100]}]
 const closed=h.boxes.map((p,i)=>({id:p.id,box:[p.xMm[0]!-7,coreY-(p.closedCoverDepthMm?.[1]??h.totalDepthMm),p.zMm[0]!-7,p.xMm[1]!-p.xMm[0]!+14,(i===2?p.depthMm[1]!+2:h.totalDepthMm)-p.depthMm[0]!,p.zMm[1]!-p.zMm[0]!+14]}))
 const renewalChecks=sweeps.flatMap(p=>closed.map(o=>({phase:p.phase,bodyId:o.id,reserveMm:boxGap(p.box,o.box)-2*s.settingMm}))),cradleInFloor=b.room.bands.some(p=>cradle[0]!>=p[0]!&&cradle[1]!>=p[1]!&&cradle[2]!<=p[2]!&&cradle[3]!<=p[3]!),moduleReserveMm=cradle[1]!-h.firstRestPlanMm[3]!-2*s.settingMm
 const occupiedCradle=b.room.occupied.filter(([,p])=>cradle[0]!<p[2]!&&cradle[2]!>p[0]!&&cradle[1]!<p[3]!&&cradle[3]!>p[1]!).map(([id])=>id)
 if(renewalChecks.some(q=>q.reserveMm<s.clearanceMm)||!cradleInFloor||moduleReserveMm<s.clearanceMm||occupiedCradle.length)issues.push('sourcebox-complete-renewal-rejected')
 const skirtReserveMm=box[2]!-b.room.skirtingTopMm-2*s.settingMm
 if(skirtReserveMm<s.clearanceMm||s.boxRearMm+s.boxSizeMm[2]!>h.totalDepthMm-s.clearanceMm)issues.push('sourcebox-skirt-or-front-rejected')
 if(s.terminal.maximumMm2<Math.max(...Object.values(s.cables).map(c=>c.areaMm2))||s.terminal.ratedA<s.lighting.ratedA||s.terminal.ratedV<s.nominalVoltageV)issues.push('source-terminal-rating-rejected')
 const terminalBox=[box[0]!+10,coreY-70,box[2]!+20,5*s.terminal.reservationMm[0]!,s.terminal.reservationMm[1]!,s.terminal.reservationMm[2]!]
 if([0,1,2].some(i=>terminalBox[i]!-box[i]!<s.clearanceMm+s.settingMm||box[i]!+box[i+3]!-terminalBox[i]!-terminalBox[i+3]!<s.clearanceMm+s.settingMm))issues.push('terminal-holder-space-rejected')
 if(feeders.some(f=>Math.min(f.entryMm[2]!-box[2]!,top-f.entryMm[2]!)-s.gland.locknutCornersMm/2-s.settingMm<s.clearanceMm))issues.push('feeder-source-entry-rejected')
 const totals=[(feeders[0]!.lengthMm+runs[0]!.lengthMm+2*s.tailOrderAllowanceMm)/1000,(feeders[1]!.lengthMm+runs[1]!.lengthMm+runs[2]!.lengthMm+2*s.tailOrderAllowanceMm)/1000]
 for(const [id,way]of [['socket',s.socket],['switch',s.lighting],['lamp',s.lighting]] as const){const maximum=s.deviceTerminalLimitsMm2[id];if(maximum!==null&&maximum<s.cables[way.cable]!.areaMm2)issues.push(id+':device-terminal-size-rejected')}
 const calculations=feeders.map((f,i)=>{
  const metres=totals[i]!,feederM=(f.lengthMm+2*s.tailOrderAllowanceMm)/1000,lineLengthM=i?feederM+2*runs[1]!.lengthMm/1000+runs[2]!.lengthMm/1000:metres,cpcLengthM=i?feederM+runs[2]!.lengthMm/1000:metres,dropV=f.cable.mVPerAM*f.ratedA*metres/1000,limitV=s.nominalVoltageV*f.dropFraction,hotCableLoopOhm=(f.cable.r1OhmKm*lineLengthM+f.cable.r2OhmKm*cpcLengthM)*1.21/1000,maximumZsOhm=s.nominalVoltageV*s.cmin/(5*f.ratedA),maximumZePlusJointsOhm=maximumZsOhm-hotCableLoopOhm
  if(f.ratedA>f.correctedRatingA)issues.push(f.way+':rating-rejected');if(dropV>limitV)issues.push(f.way+':drop-rejected');if(maximumZePlusJointsOhm<=0)issues.push(f.way+':earth-loop-rejected')
  return{way:f.way,lengthM:metres,loadA:f.ratedA,conditionalRatingA:f.correctedRatingA,dropV,limitV,lineLengthM,cpcLengthM,hotCableLoopOhm,maximumZsOhm,maximumZePlusJointsOhm,actualZeOhm:null,actualPfcA:null,maximumPfcA:6000,deviceI2tA2s:null,adiabaticQualified:false,externalTailComparison:{specifiedCopperAreaMm2:f.cable.areaMm2,assumedPVC70CK:115,withstandA2s:(115*f.cable.areaMm2)**2,genericClass3B6kAPointA2s:35000,pointMarginA2s:(115*f.cable.areaMm2)**2-35000,actualFactoryTailAreaMm2:null,actualFullFaultRangeQualified:false,scope:'Relative external conductor/tail sizing at one generic6kA point only. Actual conductor/sleeve temperatures, complete fault range, device curve, factory leads and earth-tail assembly remain unqualified.'},
   condition:'TN design bound at70C; upstream Ze AND unmodelled connection/bond resistance must fit the remainder. No actual TN/TT system is declared. Exact B-device Ia, earth/RCD tests and fault thermal withstand remain unqualified.'}
 })
 const phaseAfterA=e.phaseLoadA.map((n,i)=>n+(i===2?s.socket.ratedA+s.lighting.ratedA:0));if(phaseAfterA.some(n=>n>e.nominalAperPhase))issues.push('phase-budget-rejected')
 return{schema:'ias-study-circuit/1',status:issues.length?'DESIGN_REJECTED':'SPECIFIED_DEVELOPMENT',designDigest:sha256SemanticFingerprint({source:b.source,room:b.room,electrical:e,specification:s,homeRuns:h.routes}),source:b.source,
  sourceBinding:{wallPlan:e.walls,consumerStationXYWHMm:cu,incoming:e.incoming,dryDistribution:e.dryDistribution,phaseBeforeA:e.phaseLoadA,phaseAfterA,nominalAperPhase:e.nominalAperPhase,CUCatastrophicWaterExposureQualified:false},
  choice:'Two independent protected radials; one-way mechanical switch. No shared downstream neutral, dimmer, automation or exposed custom busbar.',feeders,homeRuns:runs,portPitchMm,neighbourToolChecks,pairReserveMm,retainedChecks,serviceChecks,calculations,physicalMILengths:5,cableEnds:10,cableStock:{references:[...new Set(feeders.map(f=>f.cable.reference))],orderLengthM:calculations.reduce((n,q)=>n+q.lengthM,0),knownCableKg:calculations.reduce((n,q,i)=>n+q.lengthM*feeders[i]!.cable.kgKm/1000,0),glandFamily:`Matched ${s.gland.threadMm}mm RGM/RPSL ends for each listed cable family; supplied assembly unqualified`,completeInstalledMassQualified:false},
  sourceBox:{id:'IAS/STUDY/fixed-sourcebox',boxMm:box,openingXZMm:[box[0]!,box[2]!,right,top],skirtReserveMm,terminalNets:['S-L','S-N','L-L','L-N','L-SL'],terminal:s.terminal,terminalReservationMm:terminalBox,
   boundary:'Independently supported fixed steel back replaces its bounded board patch; retained lid/perimeter seal stay closed when decoration is removed. No boundary performance is inferred.',
   endReleaseRequiredMm:s.gland.projectionMm+11+s.gland.potMm,topEndReleaseReserveMm:Math.min(...h.routes.map(r=>r.sourcePointMm[2]!))-top-s.gland.projectionMm-11-s.gland.potMm-s.settingMm,
   renewal:{cradlePlanMm:cradle,parkedBoxMm:parked,sweeps,checks:renewalChecks,cradleInFloor,moduleReserveMm,occupiedCradle,physicalQualified:false},portPatternAndHolderCADQualified:false},
  nets:[{id:'S-L',ends:[s.socket.way+'/L-out','SOURCE/S-L','SOCKET/L']},{id:'S-N',ends:[s.socket.way+'/N-out','SOURCE/S-N','SOCKET/N']},{id:'L-L',ends:[s.lighting.way+'/L-out','SOURCE/L-L','SWITCH/COM']},{id:'L-SL',ends:['SWITCH/L1','SOURCE/L-SL','LIGHTING-OUTLET/L']},{id:'L-N',ends:[s.lighting.way+'/N-out','SOURCE/L-N','LIGHTING-OUTLET/N']},{id:'PE',ends:['DB-UTILITY/PE-bar','SOURCE/PE-bar','SOCKET/E','SWITCH/E','LIGHTING-OUTLET/E','each-box','each-carrier','each-conduit']}],
  terminalSchedule:[{id:'SOCKET',reference:'Forbes&Lomax13A single',terminals:['L','N','E'],conductorMm2:s.cables[s.socket.cable]!.areaMm2,publishedMaximumMm2:s.deviceTerminalLimitsMm2.socket,actualFitQualified:false},{id:'SWITCH',reference:'Forbes&Lomax20A1gang2wayrocker used1way',terminals:['COM','L1','E'],unused:'L2',conductorMm2:s.cables[s.lighting.cable]!.areaMm2,publishedMaximumMm2:s.deviceTerminalLimitsMm2.switch,actualFitQualified:false},{id:'LAMP',reference:'Forbes&Lomax13A single lighting-only outlet on separate B6 radial; factory-plugged fitting downstream',terminals:['L','N','E'],conductorMm2:s.cables[s.lighting.cable]!.areaMm2,publishedMaximumMm2:s.deviceTerminalLimitsMm2.lamp,actualFitQualified:false}],
  rejected:[{id:'continuous-socket-through-stock-sourcebox',cableEnds:8,reason:'Captures the stock closed box on the complete board-to-socket MI length; local box replacement would require wholesale cable release or a new split-entry mechanism.'},{id:'sourcebox-Z25..125',reason:'Introduces a low fixed obstruction absent from the actual crafted-floor renewal proof.'}],
  consumedCableRenewal:{retiredCableRecoveryRequired:false,newInstalledIntermediateJoints:0,continuousPhysicalMILengths:5,
   sequence:['isolate-lock-prove-dead-all-sources','support-retained-circuit-and-retired-sections','disconnect-labelled-ends-and-release-glands','cut-consumed-cable-into-supported-scrap-lengths','remove-retired-sections-without-disturbing-retained-services','progressively-feed-new-continuous-length-through-accessible-planned-sleeves','form-bends-and-attach-independent-supports-progressively','make-matched-sealed-ends-and-test-before-energising'],
   newCoilFeedAndFormAccessQualified:false,installedContinuityQualified:false,
   scope:'Consumed cable may be cut after safe isolation. Reusable sourcebox, rails, covers and retained circuits keep their separate complete renewal checks. Historical local intact-body sweeps are narrow geometry screens, not a whole-house intact-cable extraction proof.'},
  lightingOutlet:{way:s.lighting.way,ratedCircuitA:s.lighting.ratedA,accessoryRatingA:13,label:'LIGHTING ONLY — B6',terminals:['L','N','E'],fixedConductorMm2:s.cables[s.lighting.cable]!.areaMm2,
   separateFromGeneralSocketWay:s.socket.way,connection:'MI to fixed lighting outlet; complete factory plug/lead/inline switch/fitting downstream. No adaptor, shared neutral or field replacement of factory tails.',
   factoryPlugDimensionsQualified:false,factoryFuseIdentityQualified:false,cordParkingAndWithdrawalQualified:false,physicalQualified:false},
  renewal:['Isolate both named ways, lock out and prove dead; include PV/backfeed. A wall switch is functional control only.','Open independent dry-route fronts and sourcebox lid; every retained cable, box and boundary remains supported.','Disconnect labelled L/N/SL/PE ends; release glands without twisting sealed pots. Remove local bushed conduit sections/clips from the room side, not by pulling stiff MI through multiple bends.','Sourcebox replacement releases five locally terminated cable ends. Counterhold the rearward entries first; release adjacent independently supported ends where full handle access requires it. Support every sealed end, release its gland, withdraw each pot through its own entry, then release and draw/lower the supported complete box. Actual grip, tools and prepared-end motion remain unqualified.','Cut safely isolated consumed MI into independently supported scrap lengths; progressively feed and form a new continuous length through planned accessible sleeves, remake matched sealed ends and add no installed splice. Actual coil/feed/form working access remains unqualified.','Restore all protective bonds, closures and penetrations; verify polarity, continuity, insulation, fault/RCD performance and ordinary manual switching before enabling.'],
  conditions:{combinedThermalFactor:s.combinedRatingFactor,thermalAuthority:'Authored minimum combined installation/group/ambient factor, not a measured prediction.',tailOrderAllowanceMm:s.tailOrderAllowanceMm,tailAuthority:'Order/cutback allowance, not a claim that150mm is coiled inside each72mm device box.',dataSharesPowerContainment:false,waterSharesPowerContainment:false,separationAuthority:'50mm project target against declared paths; full selected wet/heat/PV sections and supports remain to join.'},
  qualifications:{designNetsSpecified:true,installedConnectionsEstablished:false,matchedBoardQualified:false,deviceTerminalCADQualified:false,supplyEarthAndFaultQualified:false,materialAdmission:false,physicalTrial:false,ownerAcceptance:false,wholeRoomAllArrangementsWired:false},
  remaining:['Specific fixed-outlet/port/tool qualification, complete factory plug/fuse/lead/fitting interface, actual fault thermal energy and supplied MI revision.','Complete independent feeder supports, accessible sleeves and progressive new-coil feed/form access remain to join. Retired MI may be cut; no intact spent-length recovery is required.','Complete sourcebox closed pose versus every floor-renewal trajectory still requires joined replay; cradle fit alone is not that proof.','Desk/side/south task lighting, other arrangements and the whole-house way schedule remain unwired duties.'],primaryEvidence:s.evidence,issues:[...new Set(issues)]}
}
