import {sha256SemanticFingerprint} from '../../../core/identity.js'
import type {LightingBasis} from './study-lighting.js'
import type {deriveLightingCornerDetail} from './study-lighting-corner.js'
import {segmentBoxDistance,segmentDistance} from '../../../../project/had/studies/service-interface-geometry.mjs'
type P=readonly number[]
type Closed6=readonly[number,number,number,number,number,number]
type H=ReturnType<typeof deriveLightingCornerDetail>['localHomeRunComparison']
export interface StudyCircuitDesign{
 readonly schema:'ias-study-circuit-design/1';readonly nominalVoltageV:number;readonly cmin:number;readonly phase:'L3'
 readonly bendRadiusMm:number;readonly pitchMm:number;readonly highLevelMm:number;readonly corridorYMm:number;readonly spineYMm:number;readonly wcXMm:number;readonly studyXMm:number;readonly riserXMm:number
 readonly boxSizeMm:P;readonly boxRearMm:number;readonly boxBottomMm:number;readonly toolDiameterMm:number;readonly tailOrderAllowanceMm:number;readonly clearanceMm:number;readonly settingMm:number;readonly combinedRatingFactor:number;readonly maximumFillFraction:number
 readonly socket:{way:string;article:string;ratedA:number;cable:string;dropFraction:number};readonly lighting:{way:string;article:string;ratedA:number;cable:string;dropFraction:number}
 readonly cables:Readonly<Record<string,{diameterMm:number;areaMm2:number;exposedRatingA:number;mVPerAM:number;r1OhmKm:number;r2OhmKm:number;sheathMm2:number;kgKm:number}>>
 readonly gland:{threadMm:number;projectionMm:number;potMm:number;potDiameterMm:number;locknutCornersMm:number}
 readonly deviceTerminalLimitsMm2:Readonly<Record<'socket'|'switch'|'lamp',number|null>>
 readonly appliancePreparation:{readonly operatorPathXYMm:readonly (readonly number[])[];readonly carryOffsetMm:number;readonly traySizeMm:readonly number[];readonly trayOffsetFromDeskMm:readonly number[];readonly tabletopComparisonMm:number;readonly standingShoulderMm:number;readonly kneelingShoulderMm:number;readonly carriedBottomMm:number;readonly carryAssemblyHeightMm:number;readonly samplingErrorMm:number}
 readonly applianceLead:{bendRadiusMm:number;standOffMm:number;diameterRequirementMm:number;plugEnvelopeMm:readonly number[];unpluggedPlugEnvelopeMm:readonly number[];guideBodyEnvelopeMm:readonly number[];plugDrawMm:number;operatorRadiusMm:number;operatorLeftOfBayMm:number;operatorStandBackMm:number;reachLimitMm:number;flexAreaMm2:number;cutbackAllowanceMm:number}
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

/** Conditional ordinary small-appliance preparation. Geometry is sourced to the same
 * desk, occupied room and fixed bay; product, handling and tabletop load proofs stay open. */
function applianceFloorPreparation(b:LightingBasis,h:H,s:StudyCircuitDesign,fitting:{shadeWidthMm:number;shadeHeightMm:number;projectionMm:number;leadLengthMm:number;wallPlateDiameterMm:number},fixtureX:number,fixtureZ:number,clips:readonly{id:string;pointMm:P}[]){
 const p=s.appliancePreparation
 if(!p||s.applianceLead.operatorRadiusMm!==300||s.applianceLead.reachLimitMm!==600||s.clearanceMm<5||s.settingMm<5)throw TypeError('IAS_APPLIANCE_PREPARATION_INPUT_INVALID')
 const R=s.applianceLead.operatorRadiusMm,setting=2*s.settingMm,error=p.samplingErrorMm
 if(!p||p.operatorPathXYMm.length!==5||p.traySizeMm.length!==3||p.trayOffsetFromDeskMm.length!==2||![...p.operatorPathXYMm.flat(),p.carryOffsetMm,...p.traySizeMm,...p.trayOffsetFromDeskMm,p.tabletopComparisonMm,p.standingShoulderMm,p.kneelingShoulderMm,p.carriedBottomMm,p.carryAssemblyHeightMm,error].every(Number.isFinite)||error<=0||error>1)throw TypeError('IAS_APPLIANCE_PREPARATION_INPUT_INVALID')
 const approachStart=[b.room.door.rough[1]!+25,h.frontYMm-282.5],body=p.operatorPathXYMm,desk=b.room.occupied.find(([id])=>id==='study-desk')?.[1]
 if(!desk)throw Error('IAS_APPLIANCE_PREPARATION_DESK_UNAVAILABLE')
 const inside=(r:P)=>Math.abs(b.room.bands.reduce((n,q)=>n+Math.max(0,Math.min(r[2]!,q[2]!)-Math.max(r[0]!,q[0]!))*Math.max(0,Math.min(r[3]!,q[3]!)-Math.max(r[1]!,q[1]!)),0)-(r[2]!-r[0]!)*(r[3]!-r[1]!))<1e-5
 const rectGap=(a:P,q:P)=>Math.hypot(Math.max(a[0]!-q[2]!,q[0]!-a[2]!,0),Math.max(a[1]!-q[3]!,q[1]!-a[3]!,0))
 const segmentRect=(a:P,z:P,q:P)=>segmentBoxDistance([a[0]!,a[1]!,0],[z[0]!,z[1]!,0],[q[0]!,q[1]!,-1,q[2]!-q[0]!,q[3]!-q[1]!,2])
 const fixed=[{id:'closed-bay',box:h.bayPlanMm}],bodyChecks=body.slice(1).flatMap((v,i)=>[
  ...b.room.occupied.map(([id,q])=>({id,phase:i,reserveMm:segmentRect(body[i]!,v,q)-R,requiredMm:25})),
  ...fixed.map(q=>({id:q.id,phase:i,reserveMm:segmentRect(body[i]!,v,q.box)-R-setting,requiredMm:s.clearanceMm}))])
 const approachChecks=[...b.room.occupied.map(([id,q])=>({id,reserveMm:segmentRect(approachStart,body[0]!,q)-R,requiredMm:25})),...fixed.map(q=>({id:q.id,reserveMm:segmentRect(approachStart,body[0]!,q.box)-R-setting,requiredMm:s.clearanceMm}))]
 const approachContained=inside([Math.min(approachStart[0]!,body[0]![0]!)-R,Math.min(approachStart[1]!,body[0]![1]!)-R,Math.max(approachStart[0]!,body[0]![0]!)+R,Math.max(approachStart[1]!,body[0]![1]!)+R])
 const bodyContained=body.slice(1).every((v,i)=>inside([Math.min(v[0]!,body[i]![0]!)-R,Math.min(v[1]!,body[i]![1]!)-R,Math.max(v[0]!,body[i]![0]!)+R,Math.max(v[1]!,body[i]![1]!)+R]))
 const outlet=h.boxes[2]!,outletX=(outlet.xMm[0]!+outlet.xMm[1]!)/2
 const releaseToolReachMm=Math.max(...clips.map(g=>Math.hypot(g.pointMm[0]!-body[0]![0]!,g.pointMm[1]!-body[0]![1]!,g.pointMm[2]!-p.standingShoulderMm)))
 const unplugReachMm=Math.hypot(body[0]![0]!-outletX,body[0]![1]!-h.frontYMm)
 const poses:{phase:string;body:number[];centre:number[];angle:number;allowMountContact:boolean;placing:boolean}[]=[]
 const interpolate=(a:P,z:P,t:number)=>a.map((v,i)=>v+(z[i]!-v)*t)
 const add=(phase:string,a:P,z:P,ca:P,cz:P,aa:number,az:number,allowMountContact=false,placing=false)=>{
  const bound=distance(a,z)+distance(ca,cz)+Math.abs(az-aa)*Math.hypot(fitting.shadeWidthMm,fitting.projectionMm)/2
  const steps=Math.max(1,Math.ceil(bound/error))
  for(let i=0;i<=steps;i++){const t=i/steps;poses.push({phase,body:interpolate(a,z,t),centre:interpolate(ca,cz,t),angle:aa+(az-aa)*t,allowMountContact,placing})}
 }
 const draw=h.normalDrawMm,installed=[fixtureX,h.frontYMm-fitting.projectionMm/2],withdrawn=[fixtureX,installed[1]!-draw]
 add('unplug-support-release-and-normal-draw',body[0]!,body[1]!,installed,withdrawn,0,0,true)
 const shifted=[withdrawn[0]!+body[2]![0]!-body[1]![0]!,withdrawn[1]!+body[2]![1]!-body[1]![1]!]
 add('supported-transfer-east',body[1]!,body[2]!,withdrawn,shifted,0,0)
 const theta=Math.atan2(shifted[1]!-body[2]![1]!,shifted[0]!-body[2]![0]!),held=[body[2]![0]!+p.carryOffsetMm*Math.cos(theta),body[2]![1]!+p.carryOffsetMm*Math.sin(theta)]
 add('turn-appliance-tangentially',body[2]!,body[2]!,shifted,held,0,theta-Math.PI)
 const arcSteps=Math.ceil(Math.abs(theta)*(p.carryOffsetMm+Math.hypot(fitting.shadeWidthMm,fitting.projectionMm)/2)/error)
 for(let i=0;i<=arcSteps;i++){const t=theta*(1-i/arcSteps);poses.push({phase:'ordinary-hand-turn-in-clear-north-field',body:Array.from(body[2]!),centre:[body[2]![0]!+p.carryOffsetMm*Math.cos(t),body[2]![1]!+p.carryOffsetMm*Math.sin(t)],angle:t,allowMountContact:false,placing:false})}
 for(let i=2;i<4;i++)add('carry-to-desk-'+i,body[i]!,body[i+1]!,[body[i]![0]!+p.carryOffsetMm,body[i]![1]!],[body[i+1]![0]!+p.carryOffsetMm,body[i+1]![1]!],0,0)
 const tray=[desk[0]!+p.trayOffsetFromDeskMm[0]!,desk[1]!+p.trayOffsetFromDeskMm[1]!,desk[0]!+p.trayOffsetFromDeskMm[0]!+p.traySizeMm[0]!,desk[1]!+p.trayOffsetFromDeskMm[1]!+p.traySizeMm[1]!]
 const target=[(tray[0]!+tray[2]!)/2,(tray[1]!+tray[3]!)/2]
 const placementArcSteps=Math.ceil(Math.PI/2*(p.carryOffsetMm+Math.hypot(fitting.shadeWidthMm,fitting.projectionMm)/2)/error)
 for(let i=0;i<=placementArcSteps;i++){const t=-Math.PI/2*i/placementArcSteps;poses.push({phase:'turn-in-clear-field-above-tabletop',body:Array.from(body[4]!),centre:[body[4]![0]!+p.carryOffsetMm*Math.cos(t),body[4]![1]!+p.carryOffsetMm*Math.sin(t)],angle:t,allowMountContact:false,placing:true})}
 const overDesk=[body[4]![0]!,target[1]!-10]
 add('extend-above-tabletop',body[4]!,body[4]!,[body[4]![0]!,body[4]![1]!-p.carryOffsetMm],overDesk,-Math.PI/2,-Math.PI/2,false,true)
 add('orient-above-tabletop',body[4]!,body[4]!,overDesk,overDesk,-Math.PI/2,0,false,true)
 add('lower-into-temporary-desk-tray',body[4]!,body[4]!,overDesk,target,0,0,false,true)
 let bodyItem=Infinity,limitingBodyItemPhase='',furnitureReserve=Infinity,fixedReserve=Infinity,boundaryContained=true,maximumGripReach=0
 for(const pose of poses){
  const cs=Math.cos(pose.angle),sn=Math.sin(pose.angle),hw=fitting.shadeWidthMm/2,hd=fitting.projectionMm/2
  const corners=[[-hw,-hd],[-hw,hd],[hw,-hd],[hw,hd]].map(([x,y])=>[pose.centre[0]!+x!*cs-y!*sn,pose.centre[1]!+x!*sn+y!*cs])
  const box=[Math.min(...corners.map(v=>v[0]!)),Math.min(...corners.map(v=>v[1]!)),Math.max(...corners.map(v=>v[0]!)),Math.max(...corners.map(v=>v[1]!))]
  boundaryContained&&=inside([box[0]!-setting-error,box[1]!-setting-error,box[2]!+setting+error,box[3]!+setting+error])
  const dx=pose.body[0]!-pose.centre[0]!,dy=pose.body[1]!-pose.centre[1]!,u=dx*cs+dy*sn,v=-dx*sn+dy*cs
  const bodyReserve=Math.hypot(Math.max(Math.abs(u)-hw,0),Math.max(Math.abs(v)-hd,0))-R-setting-error
  if(bodyReserve<bodyItem){bodyItem=bodyReserve;limitingBodyItemPhase=pose.phase}
  for(const [id,q]of b.room.occupied)if(id!=='study-desk'||!pose.placing)furnitureReserve=Math.min(furnitureReserve,rectGap(box,q)-error)
  if(!pose.allowMountContact)fixedReserve=Math.min(fixedReserve,rectGap(box,h.bayPlanMm)-setting-error)
  // Two normal handholds around the90mm mounting plate; whole shade is not a hand position.
  for(const sign of[-1,1])maximumGripReach=Math.max(maximumGripReach,Math.hypot(pose.centre[0]!+sign*fitting.wallPlateDiameterMm/2*cs-pose.body[0]!,pose.centre[1]!+sign*fitting.wallPlateDiameterMm/2*sn-pose.body[1]!))
 }
 const trayContained=tray[0]!>=desk[0]!+10&&tray[1]!>=desk[1]!+10&&tray[2]!<=desk[2]!-10&&tray[3]!<=desk[3]!-10
 const verticalReserve=p.carriedBottomMm-p.tabletopComparisonMm-setting
 const standingReachMm=Math.hypot(maximumGripReach+error,Math.max(Math.abs(fixtureZ-p.standingShoulderMm),Math.abs(p.carriedBottomMm+fitting.shadeHeightMm/2-p.standingShoulderMm)))
 const finalGripPlanMm=Math.max(...[-1,1].map(sign=>Math.hypot(target[0]!+sign*fitting.wallPlateDiameterMm/2-body[4]![0]!,target[1]!-body[4]![1]!)))
 const placedReachMm=Math.hypot(finalGripPlanMm,p.tabletopComparisonMm+fitting.shadeHeightMm/2-p.kneelingShoulderMm)
 const unplugReach3DMm=Math.hypot(unplugReachMm,(outlet.zMm[0]!+outlet.zMm[1]!)/2-p.standingShoulderMm)
 const coilRadiusMm=s.applianceLead.bendRadiusMm,coilRiseMm=25,coilLengthMm=Math.hypot(2*Math.PI*coilRadiusMm,coilRiseMm),tailMm=(fitting.leadLengthMm-coilLengthMm)/2
 const helixPathMm=Array.from({length:361},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/360;return[coilRadiusMm*Math.cos(a),coilRadiusMm+coilRadiusMm*Math.sin(a),fitting.shadeHeightMm+10+coilRiseMm*i/360]})
 const coilPathMm=[[0,-Math.sqrt(Math.max(0,tailMm*tailMm-100)),fitting.shadeHeightMm],...helixPathMm,[0,Math.sqrt(Math.max(0,tailMm*tailMm-625)),fitting.shadeHeightMm+60]]
 const packedPlugBoundsMm=[-30,coilPathMm.at(-1)![1]!-35,fitting.shadeHeightMm+60,30,coilPathMm.at(-1)![1]!+35,fitting.shadeHeightMm+112]
 const packedContained=coilPathMm.every(v=>Math.abs(v[0]!)+s.applianceLead.diameterRequirementMm/2<=fitting.shadeWidthMm/2-s.settingMm&&Math.abs(v[1]!)+s.applianceLead.diameterRequirementMm/2<=fitting.projectionMm/2-s.settingMm&&v[2]!+s.applianceLead.diameterRequirementMm/2<=p.carryAssemblyHeightMm-s.settingMm)&&packedPlugBoundsMm[5]!<=p.carryAssemblyHeightMm-s.settingMm&&p.carryAssemblyHeightMm<=p.traySizeMm[2]!&&p.traySizeMm[0]!>=fitting.shadeWidthMm+2*s.settingMm&&p.traySizeMm[1]!>=fitting.projectionMm+2*s.settingMm
 const packed={completeSizeMm:p.traySizeMm,carriedPlanSizeMm:[fitting.shadeWidthMm,fitting.projectionMm],carriedHeightMm:p.carryAssemblyHeightMm,
  packedContained,packedPlugBoundsMm,coilPathMm,coilRadiusMm,coilRiseMm,coilLengthMm,tailMm,externalLengthMm:coilLengthMm+2*tailMm,
  connectedExitAndPlugPositionsQualified:false,scope:'Isolated loose single helix only; no energized coil. Fitting0..160, flex170..195 and plug220..272 fit the declared300mm high handling reservation. Actual supported packing and supplied grommet/plug construction require validation.'}
 const issues:string[]=[]
 if(!bodyContained||!approachContained||approachChecks.some(v=>v.reserveMm<v.requiredMm)||bodyChecks.some(v=>v.reserveMm<v.requiredMm))issues.push('appliance-preparation-body-route-rejected')
 if(!boundaryContained||Math.min(bodyItem,fixedReserve)<s.clearanceMm||furnitureReserve<25)issues.push('appliance-preparation-complete-carry-rejected')
 if(Math.max(unplugReach3DMm,releaseToolReachMm,standingReachMm,placedReachMm)>s.applianceLead.reachLimitMm||!trayContained||verticalReserve<s.clearanceMm||tailMm<50||!packedContained)issues.push('appliance-preparation-desk-rest-rejected')
 return{schema:'ias-appliance-floor-preparation/1',status:issues.length?'GEOMETRY_REJECTED' as const:'CONDITIONAL_GEOMETRY_WITNESS' as const,
  approachStartXYMm:approachStart,approachContained,approachChecks,operatorPathXYMm:body,bodyRadiusMm:R,bodyChecks,bodyContained,unplugReachMm,releaseToolReachMm,maximumGripReachMm:Math.max(standingReachMm,placedReachMm),horizontalGripReachMm:maximumGripReach,standingReachMm,placedReachMm,unplugReach3DMm,standingShoulderMm:p.standingShoulderMm,kneelingShoulderMm:p.kneelingShoulderMm,
  fullComponentBodyReserveMm:bodyItem,limitingBodyItemPhase,fullComponentFixedReserveMm:fixedReserve,fullComponentFurnitureReserveMm:furnitureReserve,
  boundaryContained,samplingErrorBoundMm:error,poseCount:poses.length,deskId:'study-desk',deskXYXYMm:desk,trayXYXYMm:tray,trayContained,
  tabletopComparisonMm:p.tabletopComparisonMm,tabletopMeasured:false,carriedBottomMm:p.carriedBottomMm,verticalReserveMm:verticalReserve,packed,
  retainedGuideFixings:clips.map(g=>({id:g.id+'/captive-backing',xyzxyzMm:[g.pointMm[0]!-s.applianceLead.guideBodyEnvelopeMm[0]!/2,h.frontYMm,g.pointMm[2]!-10,g.pointMm[0]!+s.applianceLead.guideBodyEnvelopeMm[0]!/2,h.frontYMm+15,g.pointMm[2]!+10] as Closed6})),
  sequence:['Identify/isolate B6, lock and prove dead; unplug accessible13A plug.','Support fitting; remove its ordinary mounting screws and both ordinary screwed flex clips/spacers completely. Captive steel backing lands stay inside the closed paid bay. No terminal or MI work.','Normal-draw50mm while stepping east, transfer into clear north field, turn the supported fitting/managed flex and carry along the source-checked path.','Carry at the authored1320mm bottom/1600mm shoulder profile; after positioning above the tray, lower with the bounded1050mm kneeling shoulder profile. Place the isolated complete appliance in a180x300x300 temporary tray inside the source desk footprint. Move/rest it with the ordinary desk through every furniture stage; no separate floor obstruction.','After floor renewal reverse the clear route, refit clips/retention and verify manual function before reinstating.'],
  mountingToolsAndTemporaryPackingQualified:false,tabletopAndLoadedDeskMovementQualified:false,physicalAcceptance:false,ownerAcceptance:false,issues}
}

export function deriveStudyLightingCircuit(b:LightingBasis,h:H,s:StudyCircuitDesign,fitting:{manufacturer:string;reference:string;leadLengthMm:number;shadeWidthMm:number;shadeHeightMm:number;projectionMm:number;wallPlateDiameterMm:number;plugSpaceWitnessMm:readonly number[]}){
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
 const a=s.applianceLead
 if(!a||a.flexAreaMm2!==0.75||!fitting||![...Object.values(a).flat(),fitting.leadLengthMm,fitting.projectionMm,...fitting.plugSpaceWitnessMm].every(n=>Number.isFinite(n)&&n>0)||a.plugEnvelopeMm.length!==3||a.guideBodyEnvelopeMm.length!==3)throw TypeError('IAS_APPLIANCE_LEAD_SOURCE_INVALID')
 const outlet=h.boxes[2]!,outletX=(outlet.xMm[0]!+outlet.xMm[1]!)/2,outletZ=(outlet.zMm[0]!+outlet.zMm[1]!)/2
 const fixtureX=h.cableOpening.centreXMm,fixtureZ=h.cableOpening.centreZMm,cordY=h.frontYMm-a.standOffMm
 const leadVertices=(bow:number)=>[[fixtureX,cordY,fixtureZ],[fixtureX,cordY,fixtureZ-a.bendRadiusMm],[fixtureX+bow,cordY,fixtureZ-a.bendRadiusMm],[fixtureX+bow,cordY,outletZ+a.bendRadiusMm],[outletX,cordY,outletZ+a.bendRadiusMm],[outletX,cordY,outletZ]]
 let low=2*a.bendRadiusMm,high=h.bayPlanMm[2]!-fixtureX-a.diameterRequirementMm/2-s.settingMm
 if(high<low)issues.push('appliance-lead-bay-edge-rejected')
 const minLength=round(leadVertices(low),a.bendRadiusMm).lengthMm,maxLength=round(leadVertices(high),a.bendRadiusMm).lengthMm
 if(fitting.leadLengthMm<minLength||fitting.leadLengthMm>maxLength)issues.push('appliance-lead-length-outside-short-flex-domain')
 for(let i=0;i<40;i++){const mid=(low+high)/2;if(round(leadVertices(mid),a.bendRadiusMm).lengthMm<fitting.leadLengthMm)low=mid;else high=mid}
 const vertices=leadVertices((low+high)/2),lead=round(vertices,a.bendRadiusMm),wireR=a.diameterRequirementMm/2
 if(lead.issues.length)issues.push(...lead.issues.map(q=>'appliance-lead:'+q))
 const wireVolumes=[{id:'IAS/STUDY/complete-appliance-lead-envelope',xyzxyzMm:[...[0,1,2].map(j=>Math.min(...vertices.map(p=>p[j]!))-wireR),...[0,1,2].map(j=>Math.max(...vertices.map(p=>p[j]!))+wireR)]}]
 const [pw,ph,pd]=a.plugEnvelopeMm
 const plugVolume={id:'IAS/STUDY/lighting-outlet-plug-space-witness',xyzxyzMm:[outletX-pw!/2,h.frontYMm-pd!,outletZ-ph!/2,outletX+pw!/2,h.frontYMm,outletZ+ph!/2]}
 const clips=[vertices[2]!,vertices[3]!].map((p,i)=>({id:'IAS/STUDY/lead-guide/'+i,pointMm:p}))
 const guideVolumes=clips.map(g=>({id:g.id,xyzxyzMm:[g.pointMm[0]!-a.guideBodyEnvelopeMm[0]!/2,g.pointMm[1]!-a.guideBodyEnvelopeMm[1]!/2,g.pointMm[2]!-a.guideBodyEnvelopeMm[2]!/2,g.pointMm[0]!+a.guideBodyEnvelopeMm[0]!/2,h.frontYMm,g.pointMm[2]!+a.guideBodyEnvelopeMm[2]!/2]}))
 const fittingVolume={id:'IAS/STUDY/complete-Type80-appliance-envelope',xyzxyzMm:[fixtureX-fitting.shadeWidthMm/2,h.frontYMm-fitting.projectionMm,fixtureZ-fitting.shadeHeightMm/2,fixtureX+fitting.shadeWidthMm/2,h.frontYMm,fixtureZ+fitting.shadeHeightMm/2]}
 const operator=[h.bayPlanMm[0]!-a.operatorLeftOfBayMm,h.frontYMm-a.operatorStandBackMm],R=a.operatorRadiusMm
 const area=b.room.bands.reduce((n,p)=>n+Math.max(0,Math.min(p[2]!,operator[0]!+R)-Math.max(p[0]!,operator[0]!-R))*Math.max(0,Math.min(p[3]!,operator[1]!+R)-Math.max(p[1]!,operator[1]!-R)),0)
 const furniture=b.room.occupied.map(([id,p])=>({id,reserveMm:Math.hypot(Math.max(p[0]!-operator[0]!,operator[0]!-p[2]!,0),Math.max(p[1]!-operator[1]!,operator[1]!-p[3]!,0))-R}))
 const operatorSquareContained=Math.abs(area-4*R*R)<1e-6
 if(!operatorSquareContained||furniture.some(p=>p.reserveMm<25))issues.push('appliance-plug-operator-field-rejected')
 const operatorReachMm=Math.hypot(outletX-operator[0]!,a.operatorStandBackMm)
 if(operatorReachMm>a.reachLimitMm)issues.push('appliance-plug-reach-rejected')
 const operatorBayReserveMm=Math.hypot(Math.max(h.bayPlanMm[0]!-operator[0]!,operator[0]!-h.bayPlanMm[2]!,0),Math.max(h.frontYMm-operator[1]!,operator[1]!-h.bayPlanMm[3]!,0))-R-2*s.settingMm
 const operatorFittingReserveMm=Math.hypot(Math.max(fixtureX-fitting.shadeWidthMm/2-operator[0]!,operator[0]!-fixtureX-fitting.shadeWidthMm/2,0),Math.max(h.frontYMm-fitting.projectionMm-operator[1]!,operator[1]!-h.frontYMm,0))-R-2*s.settingMm
 if(Math.min(operatorBayReserveMm,operatorFittingReserveMm)<s.clearanceMm)issues.push('appliance-operator-fixed-body-rejected')
 const unplugSweepXYZMm=[outletX-pw!/2,h.frontYMm-pd!-a.plugDrawMm,outletZ-ph!/2,outletX+pw!/2,h.frontYMm,outletZ+ph!/2]
 const parkedPlugZ=h.carrierXZMm[1]!+60,parkedPlugX=fixtureX+100,[ppw,pph,ppd]=a.unpluggedPlugEnvelopeMm
 const parkedVertices=(bottom:number)=>[[fixtureX,cordY,fixtureZ],[fixtureX,cordY,bottom],[parkedPlugX,cordY,bottom],[parkedPlugX,cordY,parkedPlugZ]]
 let pLow=h.moduleHandlingXZMm[1]!+wireR+s.settingMm,pHigh=Math.min(fixtureZ,parkedPlugZ)-a.bendRadiusMm
 for(let i=0;i<40;i++){const mid=(pLow+pHigh)/2;if(round(parkedVertices(mid),a.bendRadiusMm).lengthMm>fitting.leadLengthMm)pLow=mid;else pHigh=mid}
 const parkedLead=round(parkedVertices((pLow+pHigh)/2),a.bendRadiusMm)
 const parkingContained=parkedLead.pathMm.every(p=>p[0]!-wireR>=h.moduleHandlingXZMm[0]!+s.settingMm&&p[0]!+wireR<=h.moduleHandlingXZMm[2]!-s.settingMm&&p[2]!-wireR>=h.moduleHandlingXZMm[1]!+s.settingMm&&p[2]!+wireR<=h.moduleHandlingXZMm[3]!-s.settingMm)&&Math.abs(parkedLead.lengthMm-fitting.leadLengthMm)<.001&&parkedLead.issues.length===0
 if(parkedPlugX-ppw!/2<h.moduleHandlingXZMm[0]!+s.settingMm||parkedPlugX+ppw!/2>h.moduleHandlingXZMm[2]!-s.settingMm||parkedPlugZ-pph!/2<h.moduleHandlingXZMm[1]!+s.settingMm||parkedPlugZ+pph!/2>h.moduleHandlingXZMm[3]!-s.settingMm)issues.push('appliance-parked-plug-envelope-rejected')
 if(!parkingContained)issues.push('appliance-unplugged-carrier-parking-rejected')
 if(a.bendRadiusMm-a.diameterRequirementMm/2<6*a.diameterRequirementMm)issues.push('appliance-flex-bend-rejected')
 const plugSweepBox=[unplugSweepXYZMm[0]!,unplugSweepXYZMm[1]!,unplugSweepXYZMm[2]!,unplugSweepXYZMm[3]!-unplugSweepXYZMm[0]!,unplugSweepXYZMm[4]!-unplugSweepXYZMm[1]!,unplugSweepXYZMm[5]!-unplugSweepXYZMm[2]!]
 const plugRetained=[...h.carrierStripsXZMm.map((p,i)=>({id:'carrier/'+i,box:[p[0]!,coreY-h.carrierDepthMm[1]!,p[1]!,p[2]!-p[0]!,h.carrierDepthMm[1]!-h.carrierDepthMm[0]!,p[3]!-p[1]!]})),...h.boxes.slice(0,2).map(p=>({id:p.id,box:[p.xMm[0]!-7,coreY-h.totalDepthMm,p.zMm[0]!-7,86,h.totalDepthMm-p.depthMm[0]!,86]}))]
 const plugWithdrawalChecks=plugRetained.map(p=>({id:p.id,reserveMm:boxGap(plugSweepBox,p.box)-2*s.settingMm}))
 if(plugWithdrawalChecks.some(p=>p.reserveMm<s.clearanceMm))issues.push('appliance-plug-withdrawal-rejected')
 const carrierRail=h.carrierStripsXZMm[1]!,railX=(carrierRail[0]!+carrierRail[2]!)/2
 const backingTabs=clips.map(g=>{const bottom=g.pointMm[2]!-15,top=Math.max(g.pointMm[2]!+35,h.carrierXZMm[1]!+25),box=[g.pointMm[0]!-5,coreY-h.carrierDepthMm[1]!,bottom,30,2,top-bottom]
  return{id:g.id+'/retained-flat-steel-tab',boxMm:box,railAttachmentPointMm:[railX,box[1]!,g.pointMm[2]!<h.carrierXZMm[1]!?h.carrierXZMm[1]!+15:g.pointMm[2]!+20],clipAttachmentPointMm:[g.pointMm[0]!+10,box[1]!,g.pointMm[2]!],stockMassKg:30*2*(top-bottom)*7850/1e9,matingCarrierContactIntended:true,anchorAndThreadsQualified:false}})
 const backingChecks=backingTabs.flatMap(t=>h.boxes.map(p=>({tabId:t.id,bodyId:p.id,reserveMm:boxGap(t.boxMm,[p.xMm[0]!-7,coreY-h.totalDepthMm,p.zMm[0]!-7,86,h.totalDepthMm-p.depthMm[0]!,86])-2*s.settingMm})))
 if(backingChecks.some(v=>v.reserveMm<s.clearanceMm))issues.push('appliance-clip-backing-enclosure-rejected')
 const clipTool=h.handToolReference,clipToolRadius=clipTool.maximumDiameterMm/2,clipTools=clips.map(g=>({id:g.id,fromMm:[g.pointMm[0]!+10,g.pointMm[1]!-a.guideBodyEnvelopeMm[1]!/2,g.pointMm[2]!],toMm:[g.pointMm[0]!+10,g.pointMm[1]!-a.guideBodyEnvelopeMm[1]!/2-clipTool.lengthMm,g.pointMm[2]!]}))
 const guideToolBodies=[...plugRetained,{id:fittingVolume.id,box:[fittingVolume.xyzxyzMm[0]!,fittingVolume.xyzxyzMm[1]!,fittingVolume.xyzxyzMm[2]!,fittingVolume.xyzxyzMm[3]!-fittingVolume.xyzxyzMm[0]!,fittingVolume.xyzxyzMm[4]!-fittingVolume.xyzxyzMm[1]!,fittingVolume.xyzxyzMm[5]!-fittingVolume.xyzxyzMm[2]!]}]
 const clipToolChecks=clipTools.flatMap(t=>guideToolBodies.map(o=>({clipId:t.id,bodyId:o.id,reserveMm:segmentBoxDistance(t.fromMm,t.toMm,o.box)-clipToolRadius-2*s.settingMm})))
 if(clipToolChecks.some(v=>v.reserveMm<s.clearanceMm))issues.push('appliance-guide-release-tool-rejected')
 const floorPreparation=applianceFloorPreparation(b,h,s,fitting,fixtureX,fixtureZ,clips)
 issues.push(...floorPreparation.issues)
 const applianceLead={floorPreparation,fitting,planeYMm:cordY,...lead,diameterRequirementMm:a.diameterRequirementMm,insideBendMm:a.bendRadiusMm-a.diameterRequirementMm/2,requiredBendMm:6*a.diameterRequirementMm,
  guides:clips,backingTabs,backingChecks,backingSteelKg:backingTabs.reduce((sum,t)=>sum+t.stockMassKg,0),clipTools,clipToolChecks,clipFastening:'Front ordinary screws, removable complete clips/spacers, captive backing within paid bay; selected clip/fastener/lands remain unqualified.',nominalFixedVolumes:[...wireVolumes,plugVolume,...guideVolumes,fittingVolume].map(v=>{if(v.xyzxyzMm.length!==6||!v.xyzxyzMm.every(Number.isFinite))throw TypeError('IAS_APPLIANCE_VOLUME_INVALID');return{...v,xyzxyzMm:v.xyzxyzMm as unknown as Closed6}}),
  plugEnvelopeMm:a.plugEnvelopeMm,plugSpaceAuthority:'Generous authored60x70mm face/30mm installed projection bounds selectedSN1382 3A plug: manufacturer20mm installed projection plus10mm envelope allowance. Actual supplied assembly fit remains unqualified.',
  topology:'One short visible flex bow; no inline switch, hidden coil or cavity storage. Prepared plug/flex/fitting stay together during unplugged cassette renewal.',
  preparation:{externalLengthMm:fitting.leadLengthMm,cutbackOrderAllowanceMm:a.cutbackAllowanceMm,minimumInitialCutMm:fitting.leadLengthMm+a.cutbackAllowanceMm,flex:'Nexans018065107 H03VV-F2x0.75 round copper/PVC',conductorMm2:a.flexAreaMm2,plug:'SN1382 BS1363-1,3A fuse, screw cord grip',fittingClass:'II',earth:'No PE connection to ClassII fitting; fixed outlet, boxes, carrier and MI retain their own protective earth',grommet:'100141',strainRelief:'101892',manufacturerConfigurationSupported:true,workshopContinuityInsulationPolarityAndStrainTestsQualified:false},
  operation:{operatorCentreXYMm:operator,bodyRadiusMm:R,bodySquareContained:operatorSquareContained,furnitureChecks:furniture,furnitureMinimumMm:25,reachLimitMm:a.reachLimitMm,operatorReachMm,operatorBayReserveMm,operatorFittingReserveMm,unplugSweepXYZMm,plugWithdrawalChecks,parking:{path:parkedLead,plugCentreMm:[parkedPlugX,cordY,parkedPlugZ],containedByCarrierHandlingEnvelope:parkingContained,sequence:'Isolate/unplug, release open fixed guides, support short flex/plug on the carrier hooks before its ordinary normal draw and first rest. No hidden coil, factory-terminal work or floor-dangling plug.'},handToolAndLoadedHandlingQualified:false},
  conditionalCompleteEnvelopeComputed:true,completeFactoryAssemblyGeometryQualified:false,guideCapacityQualified:false,cordReleaseAndLoadedHandlingQualified:false,
  scope:'Conditional complete plug/flex/guide installation envelope. Standard manufacturer-supported workshop cable/plug preparation, not stock-cord shortening. Actual grommet/connector/strain relief, supplied plug/flex and loaded cassette handling remain unqualified.'}
 const phaseAfterA=e.phaseLoadA.map((n,i)=>n+(i===2?s.socket.ratedA+s.lighting.ratedA:0));if(phaseAfterA.some(n=>n>e.nominalAperPhase))issues.push('phase-budget-rejected')
 return{schema:'ias-study-circuit/1',status:issues.length?'DESIGN_REJECTED':'SPECIFIED_DEVELOPMENT',designDigest:sha256SemanticFingerprint({source:b.source,room:b.room,electrical:e,specification:s,fitting,homeRuns:{routes:h.routes,boxes:h.boxes,caseRenewal:h.caseRenewal,carrierDepthMm:h.carrierDepthMm,carrierStripsXZMm:h.carrierStripsXZMm,moduleSweepPlanMm:h.moduleSweepPlanMm,parkedModulePlanMm:h.parkedModulePlanMm}}),source:b.source,
  sourceBinding:{wallPlan:e.walls,consumerStationXYWHMm:cu,incoming:e.incoming,dryDistribution:e.dryDistribution,phaseBeforeA:e.phaseLoadA,phaseAfterA,nominalAperPhase:e.nominalAperPhase,CUCatastrophicWaterExposureQualified:false},
  applianceLead,choice:'Two independent protected radials; one-way mechanical switch. No shared downstream neutral, dimmer, automation or exposed custom busbar.',feeders,homeRuns:runs,portPitchMm,neighbourToolChecks,pairReserveMm,retainedChecks,serviceChecks,calculations,physicalMILengths:5,cableEnds:10,cableStock:{references:[...new Set(feeders.map(f=>f.cable.reference))],orderLengthM:calculations.reduce((n,q)=>n+q.lengthM,0),knownCableKg:calculations.reduce((n,q,i)=>n+q.lengthM*feeders[i]!.cable.kgKm/1000,0),glandFamily:`Matched ${s.gland.threadMm}mm RGM/RPSL ends for each listed cable family; supplied assembly unqualified`,completeInstalledMassQualified:false},
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
   separateFromGeneralSocketWay:s.socket.way,connection:'MI to fixed lighting outlet; manufacturer-supported short external flex, conventional3A fused plug and fitting downstream. No fixed2.5mm2-to-unknown-lamp-terminal adapter or shared neutral.',
   selectedPlugEnvelopeQualified:false,selectedThreeAmpFuseSuppliedIdentityQualified:false,cordParkingAndWithdrawalQualified:false,physicalQualified:false},
  renewal:['Isolate both named ways, lock out and prove dead; include PV/backfeed. A wall switch is functional control only.','Open independent dry-route fronts and sourcebox lid; every retained cable, box and boundary remains supported.','Disconnect labelled L/N/SL/PE ends; release glands without twisting sealed pots. Remove local bushed conduit sections/clips from the room side, not by pulling stiff MI through multiple bends.','Sourcebox replacement releases five locally terminated cable ends. Counterhold the rearward entries first; release adjacent independently supported ends where full handle access requires it. Support every sealed end, release its gland, withdraw each pot through its own entry, then release and draw/lower the supported complete box. Actual grip, tools and prepared-end motion remain unqualified.','Cut safely isolated consumed MI into independently supported scrap lengths; progressively feed and form a new continuous length through planned accessible sleeves, remake matched sealed ends and add no installed splice. Actual coil/feed/form working access remains unqualified.','Restore all protective bonds, closures and penetrations; verify polarity, continuity, insulation, fault/RCD performance and ordinary manual switching before enabling.'],
  conditions:{combinedThermalFactor:s.combinedRatingFactor,thermalAuthority:'Authored minimum combined installation/group/ambient factor, not a measured prediction.',tailOrderAllowanceMm:s.tailOrderAllowanceMm,tailAuthority:'Order/cutback allowance, not a claim that150mm is coiled inside each72mm device box.',dataSharesPowerContainment:false,waterSharesPowerContainment:false,separationAuthority:'50mm project target against declared paths; full selected wet/heat/PV sections and supports remain to join.'},
  qualifications:{designNetsSpecified:true,installedConnectionsEstablished:false,matchedBoardQualified:false,deviceTerminalCADQualified:false,supplyEarthAndFaultQualified:false,materialAdmission:false,physicalTrial:false,ownerAcceptance:false,wholeRoomAllArrangementsWired:false},
  remaining:['Specific fixed-outlet/port/tool qualification, complete factory plug/fuse/lead/fitting interface, actual fault thermal energy and supplied MI revision.','Complete independent feeder supports, accessible sleeves and progressive new-coil feed/form access remain to join. Retired MI may be cut; no intact spent-length recovery is required.','Complete sourcebox closed pose versus every floor-renewal trajectory still requires joined replay; cradle fit alone is not that proof.','Desk/side/south task lighting, other arrangements and the whole-house way schedule remain unwired duties.'],primaryEvidence:s.evidence,issues:[...new Set(issues)]}
}
