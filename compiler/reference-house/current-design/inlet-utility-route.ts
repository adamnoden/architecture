/** One complete Utility branch. The co-located, retired Plant bank is not a
 * physical obstacle in this separate-room successor. No product or support is
 * admitted by a geometric comparison. */
import {finiteBends,exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import {inletCabinetProductFacts} from './inlet-cabinet-copper.js'
import type {IndoorRoutesInput,InletRetainedRouteServices} from './inlet-indoor-routes.js'
import type {inletEntrySideCuts} from './inlet-indoor-cuts.js'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type CompactValveDesign={referenceModel:'SANT SBM-14 DN20';maximumBareModuleMm:readonly[number,number,number];connectionHalfSpanMm:number;maximumOpenStemAboveAxisMm:number;handwheelDiameterMm:number;maximumDryModuleKg:number;minimumFullOpenKvM3h:number}
export type UtilityRouteChoice={schema:'had-utility-route/1'|'had-utility-route/2';id:string;stem:'horizontal-west'|'horizontal-north'|'vertical-up';valveDesign?:CompactValveDesign;ordinaryApproachWaypointsMm?:readonly P[];upstreamVirtualCornersMm:readonly P[];downstreamVirtualCornersMm:readonly P[];
 formedTurn:{path:'utility/downstream';cornerIndex:number;centrelineRadiusMm:number;maximumAngularStepDeg:number;maximumOuterDiameterAfterFormingMm:number;minimumOuterDiameterAfterFormingMm:number;minimumWallAfterFormingMm:number;maximumWallAfterFormingMm:number}}
const tuple=(v:unknown,n:number)=>Array.isArray(v)&&v.length===n&&[...v].every(x=>typeof x==='number'&&Number.isFinite(x))
const length=(a:P,b:P)=>Math.hypot(...a.map((v,k)=>v-b[k]))
const direction=(a:P,b:P)=>a.map((v,k)=>(b[k]-v)/length(a,b)) as unknown as P
const segments=(points:readonly P[])=>points.slice(1).map((b,index)=>({a:points[index],b,index,lengthMm:length(points[index],b)}))
const dot=(a:P,b:P)=>a.reduce((n,v,k)=>n+v*b[k],0)
const cross=(a:readonly number[],b:readonly number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const gap=(a:B,b:B)=>{const g=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return g.some(v=>v>0)?Math.hypot(...g.map(v=>Math.max(v,0))):Math.max(...g)}
export function admitUtilityRouteChoice(value:unknown):UtilityRouteChoice{
 const c=value as UtilityRouteChoice,compact=c?.schema==='had-utility-route/2',keys=['schema','id','stem','upstreamVirtualCornersMm','downstreamVirtualCornersMm','formedTurn',...(compact?['valveDesign','ordinaryApproachWaypointsMm']:[])]
 if(!c||Object.keys(c).sort().join(',')!==keys.sort().join(',')||!['had-utility-route/1','had-utility-route/2'].includes(c.schema)||typeof c.id!=='string'||!c.id||!(compact?['vertical-up']:['horizontal-west','horizontal-north']).includes(c.stem)
  ||![c.upstreamVirtualCornersMm,c.downstreamVirtualCornersMm].every(p=>Array.isArray(p)&&p.length>=2&&[...p].every(v=>tuple(v,3)))||!c.formedTurn)throw Error('Unsupported complete Utility route choice')
 if(compact){const d=c.valveDesign
  if(!d||Object.keys(d).sort().join(',')!=='connectionHalfSpanMm,handwheelDiameterMm,maximumBareModuleMm,maximumDryModuleKg,maximumOpenStemAboveAxisMm,minimumFullOpenKvM3h,referenceModel'
   ||d.referenceModel!=='SANT SBM-14 DN20'||!tuple(d.maximumBareModuleMm,3)||d.maximumBareModuleMm.some(v=>v<=0)
   ||![d.connectionHalfSpanMm,d.maximumOpenStemAboveAxisMm,d.handwheelDiameterMm,d.maximumDryModuleKg,d.minimumFullOpenKvM3h].every(Number.isFinite)
   ||d.maximumBareModuleMm[0]<70||d.maximumBareModuleMm[0]>160||d.maximumBareModuleMm[2]<70||d.maximumBareModuleMm[2]>160
   ||d.maximumBareModuleMm[1]!==2*d.connectionHalfSpanMm||d.connectionHalfSpanMm<100||d.connectionHalfSpanMm>250
   ||d.maximumOpenStemAboveAxisMm<130||d.maximumOpenStemAboveAxisMm>250||d.handwheelDiameterMm<70||d.handwheelDiameterMm>125
   ||d.maximumDryModuleKg<2||d.maximumDryModuleKg>12||d.minimumFullOpenKvM3h<1||d.minimumFullOpenKvM3h>12
   ||!Array.isArray(c.ordinaryApproachWaypointsMm)||c.ordinaryApproachWaypointsMm.length<2||c.ordinaryApproachWaypointsMm.some(p=>!tuple(p,3)))throw Error('Complete compact valve design conditions and real approach required')
 }
 const f=c.formedTurn
 if(Object.keys(f).sort().join(',')!=='centrelineRadiusMm,cornerIndex,maximumAngularStepDeg,maximumOuterDiameterAfterFormingMm,maximumWallAfterFormingMm,minimumOuterDiameterAfterFormingMm,minimumWallAfterFormingMm,path'
  ||f.path!=='utility/downstream'||!Number.isInteger(f.cornerIndex)||f.cornerIndex<0||f.cornerIndex>=c.downstreamVirtualCornersMm.length
  ||![f.centrelineRadiusMm,f.maximumAngularStepDeg,f.maximumOuterDiameterAfterFormingMm,f.minimumOuterDiameterAfterFormingMm,f.minimumWallAfterFormingMm,f.maximumWallAfterFormingMm].every(Number.isFinite)
  ||f.centrelineRadiusMm<4*28||f.centrelineRadiusMm>200||f.maximumAngularStepDeg<=0||f.maximumAngularStepDeg>1
  ||f.maximumOuterDiameterAfterFormingMm!==28.1||f.minimumOuterDiameterAfterFormingMm!==27.9||f.minimumWallAfterFormingMm!==1.02||f.maximumWallAfterFormingMm!==1.5)throw Error('Unsupported authored formed copper domain')
 return structuredClone(c)
}

function orientedUtilityValve(source:ReturnType<typeof inletEntrySideCuts>['valves'][number],stem:UtilityRouteChoice['stem'],cuts:ReturnType<typeof inletEntrySideCuts>){
 const [x,y,z]=source.axisMm,shoulder=cuts.ordinaryOperator.shoulderMm as P,room=cuts.exactRoomPlanMm,
  jamb=[cuts.door.hingeMm[0],cuts.door.hingeMm[0]+cuts.door.finishedOpeningMm],north=room[1]+room[3],
  lobby=cuts.door.hingeMm[1]-cuts.door.hingeNorthOfWallMm,east=room[0]+room[2],
  walls:B[]=[[room[0],north,0,jamb[0]-room[0],lobby-north,3100],[jamb[1],north,0,east-jamb[1],lobby-north,3100]],
  grips=source.grips.map(g=>{
   const a=g.regripAngleDeg*Math.PI/180,p=(stem==='horizontal-north'?[x+62.5*Math.sin(a),y+217-g.inboardMm,z+62.5*Math.cos(a)]:[x-217+g.inboardMm,y+62.5*Math.sin(a),z+62.5*Math.cos(a)]) as P
   return{pointMm:p,inboardMm:g.inboardMm,regripAngleDeg:g.regripAngleDeg,reachMm:length(shoulder,p),
    wallAfterArmAndTwoSettingsMm:Math.min(...walls.map(w=>exactSegmentBoxDistance(shoulder,p,w)))-cuts.ordinaryOperator.armRadiusMm-20}
  }),
  body=source.insulatedValveBodyEnvelopeMm,stemBox=(stem==='horizontal-north'?[x-62.5,y,z-62.5,125,217,125]:source.stemWheelEnvelopeMm) as B,
  lo=body.map((_v,k)=>k<3?Math.min(body[k],stemBox[k]):0),hi=[0,1,2].map(k=>Math.max(body[k]+body[k+3],stemBox[k]+stemBox[k+3])),
  westDrawMm=275,sweep=[lo[0]-westDrawMm,lo[1],lo[2],hi[0]-lo[0]+westDrawMm,hi[1]-lo[1],hi[2]-lo[2]] as B
 return{id:source.id,branch:source.branch,axisMm:source.axisMm,flowAxis:'vertical',stem,
  insulatedValveBodyEnvelopeMm:body,stemWheelEnvelopeMm:stemBox,grips,maximumGripReachMm:Math.max(...grips.map(g=>g.reachMm)),
  tailElbowVirtualCornersMm:source.tailElbowVirtualCornersMm,nominalValveKg:source.nominalValveKg,knownGravityN:source.knownGravityN,
  pressureCutClearBoreComparisonN:source.pressureCutClearBoreComparisonN,actualCompletedPayloadKg:null,actualFactoryFlowArrowAndSpindleOrientationQualified:false,
  replacement:{releaseEachFlangeMm:10,firstTranslationMm:[-westDrawMm,0,0],wholeValveSweepMm:sweep,firstRestAxisMm:[x-westDrawMm,y,z],
   actualCaptureAndRestCapacityQualified:false,actualTailReleaseToolsAndReinstatementQualified:false},
  actualProductAndFactoryTailsSelected:false}
}

function compactUtilityValve(d:CompactValveDesign,cuts:ReturnType<typeof inletEntrySideCuts>){
 const source=cuts.valves.find(v=>v.branch==='utility')!
 const [x,y,z]=source.axisMm,[w,l,h]=d.maximumBareModuleMm,rr=d.handwheelDiameterMm/2,
  body:B=[x-w/2-26,y-l/2-26,z-h/2-26,w+52,l+52,h+52],
  wheel:B=[x-rr,y-rr,z+h/2,2*rr,2*rr,d.maximumOpenStemAboveAxisMm-h/2],
  grips=[-15,0,15].map(deg=>({pointMm:[x+rr*Math.cos(deg*Math.PI/180),y+rr*Math.sin(deg*Math.PI/180),z+d.maximumOpenStemAboveAxisMm-10] as P,
   regripAngleDeg:deg,inboardMm:0}))
 return{id:'HAD/utility/compact-west-wall-main',branch:'utility',axisMm:source.axisMm,flowAxis:'north-south',stem:'vertical-up',
  insulatedValveBodyEnvelopeMm:body,stemWheelEnvelopeMm:wheel,grips,maximumGripReachMm:Math.max(...grips.map(g=>length(cuts.ordinaryOperator.shoulderMm as P,g.pointMm))),
  tailElbowVirtualCornersMm:[] as number[][],nominalValveKg:null,maximumDryModuleKg:d.maximumDryModuleKg,knownGravityN:null,designGravityUpperN:d.maximumDryModuleKg*9.81,
  pressureCutClearBoreComparisonN:source.pressureCutClearBoreComparisonN,actualCompletedPayloadKg:null,actualFactoryFlowArrowAndSpindleOrientationQualified:false,
  replacement:{releaseEachFlangeMm:null,plannedColdCutsRequired:true,interfaceUnionsSelected:false,firstTranslationMm:[100,0,0],wholeValveSweepMm:[body[0],body[1],body[2],body[3]+100,body[4],body[5]] as B,firstRestAxisMm:[x+100,y,z],
   actualCaptureAndRestCapacityQualified:false,actualTailReleaseToolsAndReinstatementQualified:false},
  actualProductAndFactoryTailsSelected:false}
}

export function inletUtilityRoute(i:{choice:UtilityRouteChoice;input:IndoorRoutesInput;cuts:ReturnType<typeof inletEntrySideCuts>;retained:InletRetainedRouteServices}){
 const c=admitUtilityRouteChoice(i.choice),s=i.input,cuts=i.cuts,facts=inletCabinetProductFacts,source=s.utilitySourcePathMm[2],terminal=s.utilitySourcePathMm[6],
  sourceValve=cuts.valves.find(v=>v.branch==='utility'),
  compact=c.schema==='had-utility-route/2',
  valve=sourceValve?(compact?compactUtilityValve(c.valveDesign!,cuts):orientedUtilityValve(sourceValve,c.stem,cuts)):undefined
 if(!valve||!tuple(source,3)||!tuple(terminal,3)||!tuple(s.roomPlanMm,4)||!Number.isFinite(s.groundFflMm)||s.utilityLmin<=0||s.maximumGaugeBar<=0||s.maximumGaugeBar>12)throw Error('Actual Utility source, valve and datum required')
 const [x,y,z]=valve.axisMm,flowIndex=compact?1:2,halfSpan=compact?c.valveDesign!.connectionHalfSpanMm:80,
  upstreamFace=valve.axisMm.map((v,k)=>v-(k===flowIndex?halfSpan:0)) as unknown as P,downstreamFace=valve.axisMm.map((v,k)=>v+(k===flowIndex?halfSpan:0)) as unknown as P,
  [west,south,width,depth]=s.roomPlanMm,east=west+width,north=south+depth,
  radius=facts.pipe.maximumOuterDiameterIncludingOvalityMm/2+26,setting=10,fittingR=facts.coupling.spannerMm/(2*Math.cos(Math.PI/6))+26,takeoff=facts.elbow.portToVirtualCornerMm,
  pathInputs=[{id:'utility/upstream',points:[source,...c.upstreamVirtualCornersMm,upstreamFace]},
   {id:'utility/downstream',points:[downstreamFace,...c.downstreamVirtualCornersMm,terminal]}]
 if(!compact&&(JSON.stringify(c.upstreamVirtualCornersMm.at(-1))!==JSON.stringify([x,y,z-s.tailOffsetMm])
  ||JSON.stringify(c.downstreamVirtualCornersMm[0])!==JSON.stringify([x,y,z+s.tailOffsetMm])))throw Error('Changed actual Utility flange tail connection')
 if(compact){const a=direction(c.upstreamVirtualCornersMm.at(-1)!,upstreamFace),b=direction(downstreamFace,c.downstreamVirtualCornersMm[0]);if(a.some((v,k)=>Math.abs(v-(k===flowIndex?1:0))>1e-10)||b.some((v,k)=>Math.abs(v-(k===flowIndex?1:0))>1e-10))throw Error('Changed actual compact module port direction')}
 const paths=pathInputs.map(p=>{
  const original=segments(p.points)
  if(original.some(v=>v.lengthMm<=0))throw Error('Zero Utility leg')
  const corners=p.points.slice(1,-1).map((point,k)=>{
   const before=direction(p.points[k],point),after=direction(point,p.points[k+2])
   if(Math.abs(dot(before,after))>1e-10)throw Error('Utility route requires orthogonal noncollinear corners')
   const formed=p.id===c.formedTurn.path&&k===c.formedTurn.cornerIndex,
    bend=formed?finiteBends([p.points[k],point,p.points[k+2]],c.formedTurn.centrelineRadiusMm,c.formedTurn.maximumAngularStepDeg):null,
    arc=formed?(bend!.path as P[]).slice(1,-1):null,
    ports=arc??[point,point.map((v,j)=>v-takeoff*before[j]) as unknown as P,point.map((v,j)=>v+takeoff*after[j]) as unknown as P],
    cover=formed?radius+bend!.hausdorffError:fittingR,
    lo=point.map((_v,j)=>Math.min(...ports.map(p=>p[j]))-cover),hi=point.map((_v,j)=>Math.max(...ports.map(p=>p[j]))+cover),
    box=[...lo,...hi.map((v,k)=>v-lo[k])] as unknown as B,
    centroid=formed?point.map((v,j)=>v+(-1+2/Math.PI)*c.formedTurn.centrelineRadiusMm*before[j]+(1-2/Math.PI)*c.formedTurn.centrelineRadiusMm*after[j]) as unknown as P:point
   return{id:'HAD/utility-route/'+p.id+'/corner/'+k,index:k,pointMm:point,before,after,kind:formed?'factory-formed-copper-sweep':'boxed-compression-elbow',boxMm:box,
    arcMm:arc,arcCoverMm:formed?bend!.hausdorffError:0,centroidMm:centroid,
    arcLengthMm:formed?c.formedTurn.centrelineRadiusMm*Math.PI/2:0,
    tangentMm:formed?c.formedTurn.centrelineRadiusMm:0,
    pressureOriginAbsoluteMm:point.map((v,j)=>v+(j===2?s.groundFflMm:0)),
    fullGaugeFluidOnCornerForceN:before.map((v,j)=>s.maximumGaugeBar*1e5*Math.PI/4*((28.1-2*1.02)/1000)**2*(v-after[j])),
    pressureAndFormingQualified:false}
  }),straight=original.map(leg=>{const prior=corners[leg.index-1],next=corners[leg.index],
   a=prior?.arcMm?prior.arcMm.at(-1)!:leg.a,b=next?.arcMm?next.arcMm[0]:leg.b
   if(dot(direction(leg.a,leg.b),direction(a,b))<1-1e-10||length(a,b)<=0)throw Error('Formed turn consumes actual Utility leg')
   return{...leg,a,b,lengthMm:length(a,b)}
  })
  return{id:p.id,virtualPointsMm:p.points,straight,corners,physicalPolylineMm:[straight[0].a,...straight.flatMap((leg,k)=>[leg.b,...(corners[k]?.arcMm?.slice(1)??[])])],
   centrelineLengthMm:straight.reduce((n,v)=>n+v.lengthMm,0)+corners.reduce((n,v)=>n+v.arcLengthMm,0)}
 }),allCorners=paths.flatMap(p=>p.corners.map(c=>({...c,path:p.id}))),
  cornerSegment=(c:typeof allCorners[number],a:P,b:P)=>c.arcMm?Math.min(...segments(c.arcMm).map(v=>segmentDistance(a,b,v.a,v.b)))-radius-c.arcCoverMm:exactSegmentBoxDistance(a,b,c.boxMm),
  cornerBox=(c:typeof allCorners[number],b:B)=>c.arcMm?Math.min(...segments(c.arcMm).map(v=>exactSegmentBoxDistance(v.a,v.b,b)))-radius-c.arcCoverMm:gap(c.boxMm,b),
  cornerCorner=(a:typeof allCorners[number],b:typeof allCorners[number])=>a.arcMm?Math.min(...segments(a.arcMm).map(v=>cornerSegment(b,v.a,v.b)))-radius-a.arcCoverMm:b.arcMm?Math.min(...segments(b.arcMm).map(v=>exactSegmentBoxDistance(v.a,v.b,a.boxMm)))-radius-b.arcCoverMm:gap(a.boxMm,b.boxMm),
  checks:{id:string;kind:string;reserveMm:number}[]=[],add=(id:string,kind:string,reserveMm:number)=>checks.push({id,kind,reserveMm}),
  settings=2*setting,allStraight=paths.flatMap(p=>p.straight.map(v=>({...v,path:p.id}))),
  obstacles=[...s.obstacles,...i.retained.boxes],
  absolute=(p:P)=>p.map((v,k)=>v+(k===2?s.groundFflMm:0)) as unknown as P
 for(const [part,box] of [['body',valve.insulatedValveBodyEnvelopeMm],['stem',valve.stemWheelEnvelopeMm]] as const){
  for(const o of obstacles)add('utility/valve-'+part+'/'+o.id,'valve-obstacle',gap(box,o.boxMm)-settings)
  for(const o of i.retained.paths)for(const t of segments(o.pointsMm))add('utility/valve-'+part+'/'+o.id+'/'+t.index,'valve-service',exactSegmentBoxDistance(t.a,t.b,box)-o.radiusWithSupportsMm-settings)
  add('utility/valve-'+part+'/room','valve-room',Math.min(box[0]-west,east-box[0]-box[3],box[1]-south,north-box[1]-box[4],box[2],s.ceilingMm-box[2]-box[5])-setting)
 }
 for(const p of paths){
  for(const leg of p.straight){
   for(const o of obstacles)add(p.id+'/leg/'+leg.index+'/'+o.id,'pipe-obstacle',exactSegmentBoxDistance(leg.a,leg.b,o.boxMm)-radius-settings)
   for(const o of i.retained.paths)for(const t of segments(o.pointsMm))add(p.id+'/leg/'+leg.index+'/'+o.id+'/'+t.index,'pipe-service',segmentDistance(leg.a,leg.b,t.a,t.b)-radius-o.radiusWithSupportsMm-settings)
   for(const point of [leg.a,leg.b])add(p.id+'/leg/'+leg.index+'/room','pipe-room',Math.min(point[0]-west,east-point[0],point[1]-south,north-point[1],point[2],s.ceilingMm-point[2])-radius-setting)
  }
 }
 for(const a of allStraight)for(const b of allStraight){if(a.path>b.path||a.path===b.path&&a.index+2>b.index)continue
  if(a.path===b.path&&a.index>=b.index)continue
  add(a.path+'/'+a.index+'/'+b.path+'/'+b.index,'pipe-pair',segmentDistance(a.a,a.b,b.a,b.b)-2*radius-settings)
 }
 for(const c of allCorners){
  for(const o of obstacles)add(c.id+'/'+o.id,'corner-obstacle',cornerBox(c,o.boxMm)-settings)
  for(const o of i.retained.paths)for(const t of segments(o.pointsMm))add(c.id+'/'+o.id+'/'+t.index,'corner-service',cornerSegment(c,t.a,t.b)-o.radiusWithSupportsMm-settings)
  add(c.id+'/room','corner-room',Math.min(c.boxMm[0]-west,east-c.boxMm[0]-c.boxMm[3],c.boxMm[1]-south,north-c.boxMm[1]-c.boxMm[4],c.boxMm[2],s.ceilingMm-c.boxMm[2]-c.boxMm[5])-setting)
  for(const leg of allStraight){if(c.path===leg.path&&(leg.index===c.index||leg.index===c.index+1))continue
   add(c.id+'/'+leg.path+'/'+leg.index,'corner-pipe',cornerSegment(c,leg.a,leg.b)-radius-settings)
  }
 }
 for(let a=0;a<allCorners.length;a++)for(let b=a+1;b<allCorners.length;b++)add(allCorners[a].id+'/'+allCorners[b].id,'corner-pair',cornerCorner(allCorners[a],allCorners[b])-settings)
 // Exact connected axial ends only. Returning legs are never trimmed.
 for(const p of paths)for(const leg of p.straight){
  const upstream=p.id.endsWith('/upstream'),connected=upstream?leg.index===p.straight.length-1:leg.index===0,
   limit=upstream?valve.insulatedValveBodyEnvelopeMm[flowIndex]-radius-settings:valve.insulatedValveBodyEnvelopeMm[flowIndex]+valve.insulatedValveBodyEnvelopeMm[flowIndex+3]+radius+settings,
   a=connected&&!upstream?valve.axisMm.map((v,k)=>k===flowIndex?limit:v) as unknown as P:leg.a,b=connected&&upstream?valve.axisMm.map((v,k)=>k===flowIndex?limit:v) as unknown as P:leg.b
  if(connected&&(upstream?b[flowIndex]<a[flowIndex]:a[flowIndex]>b[flowIndex]))throw Error('Insufficient actual Utility connected axial tail')
  for(const [kind,box] of [['body',valve.insulatedValveBodyEnvelopeMm],['stem',valve.stemWheelEnvelopeMm]] as const)add(p.id+'/'+leg.index+'/valve-'+kind,'valve-pipe',exactSegmentBoxDistance(a,b,box)-radius-settings)
 }
 for(const corner of allCorners)for(const [kind,box] of [['body',valve.insulatedValveBodyEnvelopeMm],['stem',valve.stemWheelEnvelopeMm]] as const)add(corner.id+'/valve-'+kind,'valve-corner',cornerBox(corner,box)-settings)
 // Continuous ordinary sector:1degree ×2mm samples plus rigorous endpoint
 // displacement cover. This includes both pipe settings and the full40mm arm.
 const shoulder=cuts.ordinaryOperator.shoulderMm as P,inboard=compact?0:cuts.authoredChoices.wheelInboardMm,inboardSteps=Math.max(1,Math.ceil(inboard/2)),
  cover=(compact?c.valveDesign!.handwheelDiameterMm/2:62.5)*Math.PI/180/2+inboard/inboardSteps/2,
  grips=Array.from({length:31},(_,a)=>-15+a).flatMap(deg=>Array.from({length:inboardSteps+1},(_,k)=>(compact?[x+c.valveDesign!.handwheelDiameterMm/2*Math.cos(deg*Math.PI/180),y+c.valveDesign!.handwheelDiameterMm/2*Math.sin(deg*Math.PI/180),z+c.valveDesign!.maximumOpenStemAboveAxisMm-10]:c.stem==='horizontal-north'?[x+62.5*Math.sin(deg*Math.PI/180),y+217-k*inboard/inboardSteps,z+62.5*Math.cos(deg*Math.PI/180)]:[x-217+k*inboard/inboardSteps,y+62.5*Math.sin(deg*Math.PI/180),z+62.5*Math.cos(deg*Math.PI/180)]) as P))
 const jamb=[cuts.door.hingeMm[0],cuts.door.hingeMm[0]+cuts.door.finishedOpeningMm],lobbyFace=cuts.door.hingeMm[1]-cuts.door.hingeNorthOfWallMm,
  walls:B[]=[[west,north,0,jamb[0]-west,lobbyFace-north,s.ceilingMm],[jamb[1],north,0,east-jamb[1],lobbyFace-north,s.ceilingMm]],
  bodyObstacles=[...walls,...cuts.door.allParkedOpenLeavesMm,...s.obstacles.filter(o=>compact?o.id==='retained-washer':o.id==='occupied-washer-rest').map(o=>[o.boxMm[0],o.boxMm[1],0,o.boxMm[3],o.boxMm[4],2000] as B)]
 const actualApproach=compact?[cuts.door.afterOpenPathMm[0],...c.ordinaryApproachWaypointsMm!,shoulder]:cuts.ordinaryOperator.approachMm
 if(JSON.stringify(actualApproach.at(-1))!==JSON.stringify(shoulder))throw Error('Actual compact approach must reach the controlling operator')
 for(const a of segments(actualApproach))for(const b of bodyObstacles)add('utility/connected-ordinary-approach','ordinary-approach',exactSegmentBoxDistance(a.a,a.b,b)-cuts.ordinaryOperator.bodyRadiusMm-settings)
 let occupiedFirstRestBodyReserveMm=Infinity
 for(const leg of segments(actualApproach))for(const o of s.obstacles.filter(o=>o.id==='occupied-washer-rest')){
  const b=[o.boxMm[0],o.boxMm[1],0,o.boxMm[3],o.boxMm[4],2000] as B
  occupiedFirstRestBodyReserveMm=Math.min(occupiedFirstRestBodyReserveMm,exactSegmentBoxDistance(leg.a,leg.b,b)-cuts.ordinaryOperator.bodyRadiusMm-settings)
 }
 if(compact){
  for(const leg of segments(actualApproach))for(const o of s.obstacles.filter(o=>!o.id.startsWith('ordinary-operator')&&!o.id.startsWith('wet-door-complete-moving')&&!['occupied-washer-rest','complete-shifted-utility-maintenance'].includes(o.id))){
   const b=o.id==='retained-washer'?[o.boxMm[0],o.boxMm[1],0,o.boxMm[3],o.boxMm[4],2000] as B:o.boxMm
   add('utility/ordinary-fixed/'+o.id,'ordinary-fixed-furniture',exactSegmentBoxDistance(leg.a,leg.b,b)-cuts.ordinaryOperator.bodyRadiusMm-settings)
  }
  for(const [key,reserve] of Object.entries(cuts.door.continuousBoundsMm))add('utility/actual-door-opening/'+key,'door-opening',key==='maximumReachMm'?650-reserve:reserve)
  add('utility/actual-door-before','door-opening',cuts.door.connectedBeforeMm)
  if(cuts.door.connectedPhaseChangeMm!==null)add('utility/actual-door-phase-change','door-opening',cuts.door.connectedPhaseChangeMm)
 }
 let minimumArmReserveMm=Infinity
 for(const grip of grips){
  add('utility/ordinary-reach','ordinary-reach',cuts.ordinaryOperator.reachLimitMm-length(shoulder,grip)-cover)
  for(const wall of walls)minimumArmReserveMm=Math.min(minimumArmReserveMm,exactSegmentBoxDistance(shoulder,grip,wall)-cuts.ordinaryOperator.armRadiusMm-settings-cover)
  for(const leg of allStraight)minimumArmReserveMm=Math.min(minimumArmReserveMm,segmentDistance(shoulder,grip,leg.a,leg.b)-radius-cuts.ordinaryOperator.armRadiusMm-settings-cover)
  for(const corner of allCorners)minimumArmReserveMm=Math.min(minimumArmReserveMm,cornerSegment(corner,shoulder,grip)-cuts.ordinaryOperator.armRadiusMm-settings-cover)
 }
 add('utility/continuous-ordinary-arm','ordinary-arm',minimumArmReserveMm)
 const od=28.1,maxWall=facts.pipe.maximumWallMm,bore=od-2*facts.pipe.minimumWallMm,
  copperArea=Math.PI/4*(od**2-(od-2*maxWall)**2)/1e6,waterArea=Math.PI/4*bore**2/1e6,
  jacketArea=Math.PI/4*((od+52)**2-(od+50)**2)/1e6,insulationArea=Math.PI/4*((od+50)**2-od**2)/1e6,
  stock=paths.flatMap(p=>[...p.straight.map(v=>({id:'HAD/utility-route/'+p.id+'/straight/'+v.index,lengthMm:v.lengthMm,centroidMm:v.a.map((n,k)=>(n+v.b[k])/2) as unknown as P})),
   ...p.corners.filter(c=>c.arcMm).map(c=>({id:c.id+'/formed-stock',lengthMm:c.arcLengthMm,centroidMm:c.centroidMm}))].map(row=>{
    const rowCopperArea=row.id.endsWith('/formed-stock')?Math.PI/4*(od**2-(od-2*c.formedTurn.maximumWallAfterFormingMm)**2)/1e6:copperArea,
     copperKg=row.lengthMm/1000*rowCopperArea*8960,waterKg=row.lengthMm/1000*waterArea*1000,jacketKg=row.lengthMm/1000*jacketArea*s.comparison.jacketDensityKgM3,insulationKg=row.lengthMm/1000*insulationArea*s.comparison.insulationDensityKgM3,
     origin=absolute(row.centroidMm),force=[0,0,-(copperKg+waterKg+jacketKg+insulationKg)*9.81/1000]
    return{...row,absoluteOriginMm:origin,copperKg,waterKg,jacketDensityReferenceKg:jacketKg,insulationDensityReferenceKg:insulationKg,
     referenceMassKg:copperKg+waterKg+jacketKg+insulationKg,referenceGravityWrenchKN_KNm:[...force,...cross(origin.map(v=>v/1000),force)]}
   })),totalLengthMm=paths.reduce((n,p)=>n+p.centrelineLengthMm,0),
  hydraulicBoreMm=Math.min(facts.pipe.minimumOuterDiameterIncludingOvalityMm-2*maxWall,c.formedTurn.minimumOuterDiameterAfterFormingMm-2*c.formedTurn.maximumWallAfterFormingMm),velocity=s.utilityLmin/60000/(Math.PI/4*(hydraulicBoreMm/1000)**2),
  straightLossBar=s.comparison.frictionFactor*totalLengthMm/hydraulicBoreMm*1000*velocity**2/2/1e5,
  cornerLossBar=allCorners.length*s.comparison.cornerK*1000*velocity**2/2/1e5,valveLossBar=(s.utilityLmin*.06/(compact?c.valveDesign!.minimumFullOpenKvM3h:12))**2,riseBar=Math.max(terminal[2]-source[2],0)*9.81e-5,
  allowanceReserveBar=s.networkAllowancesBar[0]-straightLossBar-cornerLossBar-valveLossBar-riseBar
 if(allowanceReserveBar<0)add('utility/network-allowance','hydraulics',allowanceReserveBar)
 if(checks.some(v=>!Number.isFinite(v.reserveMm)))throw Error('Non-finite actual Utility geometry comparison')
 checks.sort((a,b)=>a.reserveMm-b.reserveMm)
 const failures=checks.filter(c=>c.reserveMm< -1e-7),pressureCorners=allCorners.map(c=>({id:c.id,absoluteOriginMm:c.pressureOriginAbsoluteMm,
  fullGaugeWrenchN_Nm:[...c.fullGaugeFluidOnCornerForceN,...cross(c.pressureOriginAbsoluteMm.map(v=>v/1000),c.fullGaugeFluidOnCornerForceN)]}))
 return{schema:'had-utility-route-assembly/1',choice:c,valve,ordinaryShoulderMm:shoulder,ordinaryApproachMm:actualApproach,ordinaryAccess:{washerState:compact?'home-before-first-pull':'occupied-first-rest',sourceOpeningContinuousBoundsMm:cuts.door.continuousBoundsMm,sourceDoorConnectedBeforeMm:cuts.door.connectedBeforeMm,legacyDoorAfterPathNotInherited:compact,occupiedFirstRestBodyReserveMm,availableWhileWasherAtFirstRest:occupiedFirstRestBodyReserveMm>=0,actualLodgeBackupQualified:false,localWasherStopAndOtherUsersLiveDutyQualified:false,doorHardwareAndForceQualified:false},state:'authored-separate-room-utility-development',paths,stock,pressureCorners,
  datum:{groundFflMm:s.groundFflMm,localCeilingComparisonMm:s.ceilingMm,ceilingJoinedToNativeForceModel:false},
  geometry:{jacketRadiusMm:radius,twoIndependentSettingsMm:settings,compressionFittingRadiusMm:fittingR,formedMaximumChordCoverMm:Math.max(...allCorners.map(v=>v.arcCoverMm)),
   minimumReserveMm:checks[0].reserveMm,minimumByKind:[...new Set(checks.map(v=>v.kind))].map(kind=>checks.find(v=>v.kind===kind)!),failures,checks,
   necessaryActualUtilityGeometry:failures.length===0,continuousArmCoverMm:cover},
  quantities:{centrelineLengthMm:totalLengthMm,referenceCopperKg:stock.reduce((n,r)=>n+r.copperKg,0),referenceWaterKg:stock.reduce((n,r)=>n+r.waterKg,0),referenceMassKg:stock.reduce((n,r)=>n+r.referenceMassKg,0),
   gravityWrenchKN_KNm:stock.reduce((a,r)=>a.map((v,k)=>v+r.referenceGravityWrenchKN_KNm[k]),[0,0,0,0,0,0]),
   scope:'Exact straight and formed-sweep cylindrical reference stock. Compression bodies, insertion overlap, tools, clips and actual wrapping/complete installed mass remain unqualified.'},
  hydraulics:{minimumValveKvRequiredByExistingBudget:s.networkAllowancesBar[0]>straightLossBar+cornerLossBar+riseBar?s.utilityLmin*.06/Math.sqrt(s.networkAllowancesBar[0]-straightLossBar-cornerLossBar-riseBar):null,
   valveKvInterpretation:compact?'Authored minimum procurement requirement; no manufacturer coefficient, tested performance or complete pressure/material qualification is represented.':'Existing BSA6T published Kv comparison; actual complete installed connection performance unqualified.',minimumAuthoredBoreMm:hydraulicBoreMm,velocityMps:velocity,straightLossBar,cornerLossBar,valveLossBar,riseBar,allowanceReserveBar,
   formedBendLossCoefficientQualified:false,actualMinimumHydraulicBoreAfterFormingQualified:false,wholeInstalledNetworkQualified:false},
  topology:{sameActualSourceSplice:true,sameActualValveFacesAndTerminal:true,sharedHeader:false,permanentBypass:false,oldCoLocatedPlantBankRetired:true,separatePlantBranchUnchanged:true},
  procurement:{compactValveDesignConditions:compact?c.valveDesign:null,actualCompactManufacturerKvAndMassKnown:false,formedSweepIsAuthoredFactoryRequirement:true,cataloguePartSelected:false,wallAndOvalityMeasuredAfterForming:false,pressureAndMaterialQualification:false},
  renewal:{ordinaryUsePhase:compact?'Washer and service head home; isolate before first pull. Occupied first rest is not an ordinary access claim.':'Doorway control includes occupied washer first-rest approach.',existingBankAndFlangeReleaseMethodPreserved:!compact,allNewRouteAndSupportRenewalQualified:false},
  support:{referenceGravityAndPressureExported:true,actualIndependentGuidesAndAnchorsDesigned:false,thermalFlexibilityAndNativeReceiverTransferAccepted:false},
  completeInstallationAccepted:false,selected:false}
}
