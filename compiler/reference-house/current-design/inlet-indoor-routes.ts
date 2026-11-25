/** Explicit cold paths for the doorway-operated indoor cuts.
 * Coordinates and comparisons are serialisable; no pressure/thermal support is invented. */
import type { inletEntrySideCuts } from './inlet-indoor-cuts.js'
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'
import { segmentBoxDistance, segmentDistance } from '../../../project/had/studies/service-interface-geometry.mjs'
type Point=readonly[number,number,number]
type Box=readonly[number,number,number,number,number,number]
type Path={id:string;pointsMm:readonly Point[];valveSpan?:readonly[number,number]}
export type IndoorRoutesInput={roomPlanMm:readonly[number,number,number,number];bankMm:readonly[number,number];utilityAxisZMm:number;plantAxisZMm:number;
 tailOffsetMm:number;utilityReturnXMm:number;westernReturnXMm:number;
 utilitySourcePathMm:readonly Point[];plantSourcePathMm:readonly Point[];plantTransferMm:readonly Point[];
 groundFflMm:number;ceilingMm:number;utilityLmin:number;plantLmin:number;maximumGaugeBar:number;
 networkAllowancesBar:readonly[number,number];obstacles:readonly{id:string;boxMm:Box}[];
 comparison:{frictionFactor:number;cornerK:number;temperatureChangeK:number;jacketDensityKgM3:number;insulationDensityKgM3:number}}
const tuple=(value:unknown,n:number)=>Array.isArray(value)&&value.length===n&&[...value].every(v=>typeof v==='number'&&Number.isFinite(v))
const distance=(a:Point,b:Point)=>Math.hypot(...a.map((v,k)=>v-b[k]))
const vec=(a:Point,b:Point)=>{const l=distance(a,b);return a.map((v,k)=>(b[k]-v)/l) as unknown as Point}
const segments=(p:readonly Point[])=>p.slice(1).map((b,k)=>({a:p[k],b,lengthMm:distance(p[k],b),index:k}))
const cross=(a:Point,b:Point)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
export function inletIndoorRoutes(i:IndoorRoutesInput){return evaluateInletIndoorRoutes(i)}

/** Explicit candidate paths use the same geometry, quantities and hydraulic method.
 * All four actual source/valve/terminal endpoints remain unchanged. No candidate is adopted. */
export function compareInletIndoorRouteCandidate(i:IndoorRoutesInput,candidate:{schema:'had-indoor-route-candidate/1';paths:readonly Path[]}){
 if(!candidate||candidate.schema!=='had-indoor-route-candidate/1'||Object.keys(candidate).sort().join(',')!=='paths,schema'||!Array.isArray(candidate.paths)||candidate.paths.length!==4)throw Error('Unsupported indoor route candidate')
 const control=evaluateInletIndoorRoutes(i)
 for(const p of control.paths){
  const matches=candidate.paths.filter(v=>v?.id===p.id)
  if(matches.length!==1)throw Error('Unsupported candidate path identity')
  const c=matches[0],points=c.pointsMm
  if(Object.keys(c).sort().join(',')!=='id,pointsMm'||!Array.isArray(points)||points.length<3||![...points].every(p=>tuple(p,3))||segments(points).some(v=>v.lengthMm<=0)
   ||JSON.stringify(points[0])!==JSON.stringify(p.pointsMm[0])||JSON.stringify(points.at(-1))!==JSON.stringify(p.pointsMm.at(-1))
   ||JSON.stringify(points[p.id.endsWith('/upstream')?points.length-2:1])!==JSON.stringify(p.pointsMm[p.id.endsWith('/upstream')?p.pointsMm.length-2:1]))throw Error('Unsupported changed candidate connection')
  for(let k=1;k<points.length-1;k++){const a=vec(points[k-1],points[k]),b=vec(points[k],points[k+1]);if(Math.abs(a.reduce((n,v,j)=>n+v*b[j],0))>1e-10)throw Error('Unsupported non90degree candidate corner')}
 }
 return evaluateInletIndoorRoutes(i,candidate.paths)
}
function evaluateInletIndoorRoutes(i:IndoorRoutesInput,candidatePaths?:readonly Path[]){
 if(!i||!tuple(i.roomPlanMm,4)||!tuple(i.bankMm,2)
  ||!tuple(i.networkAllowancesBar,2)
  ||!Array.isArray(i.utilitySourcePathMm)||!Array.isArray(i.plantSourcePathMm)||!Array.isArray(i.plantTransferMm)
  ||!Array.isArray(i.obstacles)||!i.comparison)throw Error('Unsupported indoor pipe-route inputs')
 const values=[...i.roomPlanMm,...i.bankMm,i.utilityAxisZMm,i.plantAxisZMm,i.groundFflMm,i.ceilingMm,i.tailOffsetMm,i.utilityReturnXMm,i.westernReturnXMm,i.comparison.jacketDensityKgM3,i.comparison.insulationDensityKgM3,i.utilityLmin,i.plantLmin,i.maximumGaugeBar,...i.networkAllowancesBar,i.comparison.frictionFactor,i.comparison.cornerK,i.comparison.temperatureChangeK]
 if(values.some(v=>!Number.isFinite(v))||i.roomPlanMm.slice(2).some(v=>v<=0)||i.ceilingMm<=0||i.utilityLmin<=0||i.plantLmin<=0||i.networkAllowancesBar.some(v=>v<0)||i.maximumGaugeBar<=0||i.maximumGaugeBar>12||i.plantAxisZMm-i.utilityAxisZMm<400
  ||i.utilitySourcePathMm.length!==7||i.plantSourcePathMm.length!==16||i.plantTransferMm.length!==2
  ||[...i.utilitySourcePathMm,...i.plantSourcePathMm,...i.plantTransferMm].some(p=>!tuple(p,3))
  ||i.tailOffsetMm<200||i.tailOffsetMm>400||i.utilityReturnXMm>=i.bankMm[0]||i.westernReturnXMm>=i.utilityReturnXMm||i.comparison.jacketDensityKgM3<=0||i.comparison.jacketDensityKgM3>10000||i.comparison.insulationDensityKgM3<=0||i.comparison.insulationDensityKgM3>1000
  ||i.comparison.frictionFactor<=0||i.comparison.cornerK<0||i.comparison.temperatureChangeK<0
  ||new Set(i.obstacles.map(o=>o?.id)).size!==i.obstacles.length
  ||i.obstacles.some(o=>!o||typeof o.id!=='string'||!o.id||!tuple(o.boxMm,6)||o.boxMm.slice(3).some((v:number)=>v<=0))) throw Error('Unsupported indoor pipe-route inputs')
 const [x,y]=i.bankMm,u=i.utilityAxisZMm,p=i.plantAxisZMm,
  us=i.utilitySourcePathMm[2],ps=i.plantSourcePathMm[2],ue=i.utilitySourcePathMm[6],pt=i.plantTransferMm[0],
  east=x+140,west=i.westernReturnXMm,returnX=i.utilityReturnXMm,t=i.tailOffsetMm,upperU=2250,upperP=2990,
  // Each four-part topology terminates on opposite faces of its own actual160mm valve.
  // Short vertical tails are not replaced by a shared header or a hidden bypass.
  paths:readonly Path[]=candidatePaths??[
   {id:'utility/upstream',pointsMm:[us,[us[0],us[1],2740],[east,us[1],2740],[east,y-240,2740],[east,y-240,u-t],[east,y,u-t],[x,y,u-t],[x,y,u-80]]},
   {id:'utility/downstream',pointsMm:[[x,y,u+80],[x,y,u+t],[returnX,y,u+t],[returnX,y,upperU],[west,y,upperU],[west,ue[1],upperU],[ue[0],ue[1],upperU],ue]},
   {id:'plant/upstream',pointsMm:[ps,[ps[0],ps[1],2610],[x,ps[1],2610],[x,y-120,2610],[x,y-120,p-t],[x,y,p-t],[x,y,p-80]]},
   {id:'plant/downstream',pointsMm:[[x,y,p+80],[x,y,p+t],[east,y,p+t],[east,y,upperP],[pt[0],pt[1],upperP],pt,...i.plantTransferMm.slice(1)]}
  ],pipeFacts=inletCabinetProductFacts.pipe,od=pipeFacts.maximumOuterDiameterIncludingOvalityMm,
  id=pipeFacts.minimumOuterDiameterIncludingOvalityMm-2*pipeFacts.maximumWallMm,waterBore=od-2*pipeFacts.minimumWallMm,jacketRadius=(od+52)/2,setting=10,
  copperAreaM2=Math.PI/4*(od**2-(od-2*pipeFacts.maximumWallMm)**2)/1e6,waterAreaM2=Math.PI/4*waterBore**2/1e6,flowAreaM2=Math.PI/4*id**2/1e6,
  jacketAreaM2=Math.PI/4*((od+52)**2-(od+50)**2)/1e6,insulationAreaM2=Math.PI/4*((od+50)**2-od**2)/1e6,
  fittingRadius=inletCabinetProductFacts.coupling.spannerMm/(2*Math.cos(Math.PI/6))+25+1,cornerPort=inletCabinetProductFacts.elbow.portToVirtualCornerMm,
  pipeRows=paths.map(path=>{const ss=segments(path.pointsMm)
   if(ss.some(s=>s.lengthMm<=0)) throw Error('Zero-length indoor pipe leg')
   const stock=ss.map(s=>{const origin=s.a.map((v,k)=>(v+s.b[k])/2+(k===2?i.groundFflMm:0)) as unknown as Point,
    copperKg=s.lengthMm/1000*copperAreaM2*8960,waterKg=s.lengthMm/1000*waterAreaM2*1000,
    force:Point=[0,0,-(copperKg+waterKg)*9.81/1000]
    const jacketVolumeM3=s.lengthMm/1000*jacketAreaM2,insulationVolumeM3=s.lengthMm/1000*insulationAreaM2,
     jacketDensityReferenceKg=jacketVolumeM3*i.comparison.jacketDensityKgM3,insulationDensityReferenceKg=insulationVolumeM3*i.comparison.insulationDensityKgM3,
     referenceForce:Point=[0,0,-(copperKg+waterKg+jacketDensityReferenceKg+insulationDensityReferenceKg)*9.81/1000]
    return{id:'HAD/indoor-pipe/'+path.id+'/'+s.index,originMm:origin,copperKg,fullWaterKg:waterKg,jacketVolumeM3,insulationVolumeM3,jacketDensityReferenceKg,insulationDensityReferenceKg,
      materialDensityComparisonGravityWrenchKNKNm:[...referenceForce,...cross(origin.map(v=>v/1000) as unknown as Point,referenceForce)],
      actualInsulationJacketMaterialsAndCompleteMassKnown:false,
      fullWaterGravityWrenchKNKNm:[...force,...cross(origin.map(v=>v/1000) as unknown as Point,force)]}
   }),corners=path.pointsMm.slice(1,-1).map((point,k)=>{const before=vec(path.pointsMm[k],point),after=vec(point,path.pointsMm[k+2]),
     angleRad=Math.acos(Math.max(-1,Math.min(1,before.reduce((n,v,j)=>n+v*after[j],0)))),
     pressureForceN=before.map((v,j)=>i.maximumGaugeBar*1e5*waterAreaM2*(v-after[j])),
     ports=[point,point.map((v,j)=>v-cornerPort*before[j]),point.map((v,j)=>v+cornerPort*after[j])],
     lower=point.map((_v,j)=>Math.min(...ports.map(p=>p[j]))-fittingRadius),
     upper=point.map((_v,j)=>Math.max(...ports.map(p=>p[j]))+fittingRadius),
     territoryBoxMm=[lower[0],lower[1],lower[2],upper[0]-lower[0],upper[1]-lower[1],upper[2]-lower[2]] as Box
     const absoluteOriginMm=point.map((v,j)=>v+(j===2?i.groundFflMm:0)),pressureKN=pressureForceN.map(v=>v/1000)
     return{id:'HAD/indoor-pipe/'+path.id+'/corner/'+k,absoluteOriginMm,fullGaugeFluidOnCornerWrenchKNKNm:[...pressureKN,...cross(absoluteOriginMm.map(v=>v/1000) as unknown as Point,pressureKN as unknown as Point)],pointMm:point,turnAngleDeg:angleRad*180/Math.PI,fullPressureComparisonForceN:pressureForceN,
      previousLegMm:ss[k].lengthMm,nextLegMm:ss[k+1].lengthMm,territoryBoxMm,
      factoryBendTangentAndFittingSelected:false,
      pressureInterpretation:'Uniform full-gauge static fluid-on-bend reference pA(t_in-t_out); momentum, local pressure loss and restraint redistribution are not included.'}
   }),obstacles=i.obstacles.map(o=>({id:o.id,afterJacketAndSettingMm:Math.min(...ss.map(s=>segmentBoxDistance(s.a,s.b,o.boxMm)))-jacketRadius-setting}))
   return{id:path.id,pointsMm:path.pointsMm,centrelineLengthMm:ss.reduce((n,s)=>n+s.lengthMm,0),stock,corners,obstacles,
    roomReserveAfterSettingMm:Math.min(...path.pointsMm.slice(0,path.id==='plant/downstream'?-1:undefined).map(p=>Math.min(p[0]-i.roomPlanMm[0],i.roomPlanMm[0]+i.roomPlanMm[2]-p[0],p[1]-i.roomPlanMm[1],i.roomPlanMm[1]+i.roomPlanMm[3]-p[1],p[2])))-jacketRadius-setting,
    ceilingReserveAfterSettingMm:i.ceilingMm-Math.max(...path.pointsMm.map(p=>p[2]))-jacketRadius-setting,
    minimumLegMm:Math.min(...ss.map(s=>s.lengthMm)),straightLeg84MmTakeoffScreen:ss.every(s=>s.lengthMm>=84),
    actualFittingTakeoffAndInsulatedCornerEnvelopeQualified:false}
  }),
  selfSeparations=paths.flatMap(path=>segments(path.pointsMm).flatMap((a,ai)=>segments(path.pointsMm).slice(ai+2).map(b=>({id:path.id,aSegment:a.index,bSegment:b.index,afterTwoJacketsAndSettingsMm:segmentDistance(a.a,a.b,b.a,b.b)-2*(jacketRadius+setting)})))),
  separations=paths.flatMap((a,ai)=>paths.slice(ai+1).flatMap(b=>segments(a.pointsMm).flatMap(sa=>segments(b.pointsMm).map(sb=>({a:a.id,aSegment:sa.index,b:b.id,bSegment:sb.index,
   afterTwoJacketsAndSettingsMm:segmentDistance(sa.a,sa.b,sb.a,sb.b)-2*(jacketRadius+setting)}))))),
  nearest=separations.sort((a,b)=>a.afterTwoJacketsAndSettingsMm-b.afterTwoJacketsAndSettingsMm)[0],
  branches=['utility','plant'].map((branch,k)=>{const rows=pipeRows.filter(r=>r.id.startsWith(branch+'/')),l=rows.reduce((n,r)=>n+r.centrelineLengthMm,0),q=k?i.plantLmin:i.utilityLmin,
    velocity=q/60000/flowAreaM2,cornerCount=rows.reduce((n,r)=>n+r.corners.length,0),
    straightLossBar=i.comparison.frictionFactor*l/1000/(id/1000)*1000*velocity**2/2/1e5,
    cornerLossBar=cornerCount*i.comparison.cornerK*1000*velocity**2/2/1e5,valveLossBar=(q*.06/12)**2,
    lossBar=straightLossBar+cornerLossBar+valveLossBar,
    elevationMm=(k?i.plantTransferMm.at(-1)![2]:ue[2])-(k?ps[2]:us[2])
    return{id:branch,centrelineLengthMm:l,velocityMps:velocity,comparisonCornerCount:cornerCount,straightLossBar,cornerLossBar,valveLossBar,
      comparisonLossBar:lossBar,allocatedNetworkLossBar:i.networkAllowancesBar[k],unallocatedNetworkAllowanceBeforeRiseBar:i.networkAllowancesBar[k]-lossBar,
      unallocatedNetworkAllowanceAfterRiseBar:i.networkAllowancesBar[k]-lossBar-Math.max(elevationMm,0)*9.81e-5,
      netLocalRiseMm:elevationMm,netRiseBar:elevationMm*9.81e-5,
      lossAndRiseWithinExistingAllowanceComparison:lossBar+Math.max(elevationMm,0)*9.81e-5<=i.networkAllowancesBar[k],
      pipeFrictionBendCoefficientsAndInstalledKvQualified:false,remainingActualNetworkLossQualified:false,
      freeAxialThermalExpansionMm:l*.000017*i.comparison.temperatureChangeK}
  }),
  cornerPipeChecks=pipeRows.flatMap(a=>a.corners.flatMap(c=>paths.filter(b=>b.id!==a.id).flatMap(b=>segments(b.pointsMm).map(seg=>({corner:c.id,path:b.id,segment:seg.index,
    reserveMm:segmentBoxDistance(seg.a,seg.b,c.territoryBoxMm)-jacketRadius-2*setting}))))),
  cornerObstacleChecks=pipeRows.flatMap(a=>a.corners.flatMap(c=>i.obstacles.map(o=>{const aa=c.territoryBoxMm,bb=o.boxMm,
    gaps=[0,1,2].map(k=>Math.max(aa[k]-bb[k]-bb[k+3],bb[k]-aa[k]-aa[k+3])),
    distance=gaps.some(g=>g>0)?Math.hypot(...gaps.map(g=>Math.max(g,0))):Math.max(...gaps)
    return{corner:c.id,obstacle:o.id,reserveMm:distance-setting}
  }))),
  cornerCornerChecks=pipeRows.flatMap((a,ai)=>a.corners.flatMap(c=>pipeRows.slice(ai+1).flatMap(b=>b.corners.map(d=>{const aa=c.territoryBoxMm,bb=d.territoryBoxMm,
   gaps=[0,1,2].map(k=>Math.max(aa[k]-bb[k]-bb[k+3],bb[k]-aa[k]-aa[k+3])),
   distance=gaps.some(g=>g>0)?Math.hypot(...gaps.map(g=>Math.max(g,0))):Math.max(...gaps)
   return{a:c.id,b:d.id,reserveMm:distance-2*setting}
  })))),
  // Only the two incident straight legs are fitting interfaces. A returning
  // leg on the same path has no exemption; separate fittings retain both settings.
  samePathCornerPipeChecks=pipeRows.flatMap(p=>p.corners.flatMap((c,ci)=>segments(p.pointsMm)
   .filter(s=>s.index!==ci&&s.index!==ci+1).map(s=>({corner:c.id,path:p.id,segment:s.index,
    reserveMm:segmentBoxDistance(s.a,s.b,c.territoryBoxMm)-jacketRadius-2*setting})))),
  samePathCornerCornerChecks=pipeRows.flatMap(p=>p.corners.flatMap((c,ci)=>p.corners.slice(ci+1).map(d=>{const aa=c.territoryBoxMm,bb=d.territoryBoxMm,
   gaps=[0,1,2].map(k=>Math.max(aa[k]-bb[k]-bb[k+3],bb[k]-aa[k]-aa[k+3])),
   distance=gaps.some(g=>g>0)?Math.hypot(...gaps.map(g=>Math.max(g,0))):Math.max(...gaps)
   return{a:c.id,b:d.id,reserveMm:distance-2*setting}
  }))),
  samePathTerritoryPass=samePathCornerPipeChecks.every(c=>c.reserveMm>=0)&&samePathCornerCornerChecks.every(c=>c.reserveMm>=0),
  cornerCeilingReserveMm=Math.min(...pipeRows.flatMap(p=>p.corners.map(c=>i.ceilingMm-c.territoryBoxMm[2]-c.territoryBoxMm[5]-setting))),
  cornerTerritoryPass=samePathTerritoryPass&&cornerCeilingReserveMm>=0&&cornerCornerChecks.every(c=>c.reserveMm>=0)&&cornerPipeChecks.every(c=>c.reserveMm>=0)&&cornerObstacleChecks.every(c=>c.reserveMm>=0),
  diagnostics=[...(!cornerTerritoryPass?['INLET_PIPE_FITTING_TERRITORY']:[]),...(!samePathTerritoryPass?['INLET_PIPE_OWN_FITTING_TERRITORY']:[]),...selfSeparations.filter(s=>s.afterTwoJacketsAndSettingsMm<0).map(s=>'INLET_PIPE_SELF_COLLISION/'+s.id),...(nearest.afterTwoJacketsAndSettingsMm<0?['INLET_INDOOR_ROUTE_COLLISION']:[]),
   ...pipeRows.filter(r=>r.roomReserveAfterSettingMm<0||r.ceilingReserveAfterSettingMm<0||!r.straightLeg84MmTakeoffScreen||r.obstacles.some(o=>o.afterJacketAndSettingMm<0)).map(r=>'INLET_PIPE_ENVELOPE/'+r.id),
   ...branches.filter(b=>!b.lossAndRiseWithinExistingAllowanceComparison).map(b=>'INLET_PIPE_BUDGET/'+b.id)]
 return{schema:'had-indoor-pipe-routes/2',state:'unadopted-route-comparison',coordinateDatum:'Local occupied-groundFFL; stock origins include supplied saved-groundFFL translation.',
  pipe:{source:pipeFacts.model,maximumOuterDiameterMm:od,minimumWallMm:pipeFacts.minimumWallMm,maximumWallMm:pipeFacts.maximumWallMm,
   minimumHydraulicBoreMm:id,maximumWaterAndPressureBoreMm:waterBore,
   toleranceInterpretation:'Separate adverse extrema for friction, copper stock and contained water/pressure; these are not one physical tolerance state or installed mass.',radialInsulationMm:25,jacketEachSideMm:1,settingEachPipeMm:setting,
   copperDensityComparisonKgM3:8960,waterDensityComparisonKgM3:1000,jacketDensityComparisonKgM3:i.comparison.jacketDensityKgM3,insulationDensityComparisonKgM3:i.comparison.insulationDensityKgM3,actualJacketAndInsulationMaterialsSelected:false},
  cornerTerritory:{basis:'Authored full boxed territory containing both42mm virtual-port legs and39mm AF circumscribed hex plus25mm insulation/1mm jacket; actual commercial body, tails and tools remain unqualified.',
   portTakeoffMm:cornerPort,insulatedBodyRadiusComparisonMm:fittingRadius,minimumCeilingReserveMm:cornerCeilingReserveMm,
   minimumOtherCornerReserveMm:Math.min(...cornerCornerChecks.map(c=>c.reserveMm)),
   minimumOtherPipeReserveMm:Math.min(...cornerPipeChecks.map(c=>c.reserveMm)),minimumObstacleReserveMm:Math.min(...cornerObstacleChecks.map(c=>c.reserveMm)),
   perOtherCorner:cornerCornerChecks.filter(c=>c.reserveMm<10),perOtherPipe:cornerPipeChecks.filter(c=>c.reserveMm<10),perObstacle:cornerObstacleChecks.filter(c=>c.reserveMm<10),
   minimumSamePathCornerReserveMm:Math.min(...samePathCornerCornerChecks.map(c=>c.reserveMm)),
   minimumSamePathPipeReserveMm:Math.min(...samePathCornerPipeChecks.map(c=>c.reserveMm)),
   perSamePathCorner:samePathCornerCornerChecks.filter(c=>c.reserveMm<10),perSamePathPipe:samePathCornerPipeChecks.filter(c=>c.reserveMm<10),
   necessarySamePathTerritoryComparison:samePathTerritoryPass,
   incidentStraightLegsOnlyExempt:true,
   overlappingReservationsInterpretation:'A negative reserve rejects these separate boxed reservations; an actual joined fitting can replace them only with new explicit geometry and evidence.',
   necessaryBoxedCornerTerritoryComparison:cornerTerritoryPass,actualFittingBodyAndToolsQualified:false},
  roomPlanMm:i.roomPlanMm,authoredRouteGeometry:{tailOffsetMm:t,utilityReturnXMm:candidatePaths?candidatePaths.find(p=>p.id==='utility/downstream')!.pointsMm[2][0]:returnX,westernReturnXMm:candidatePaths?Math.min(...candidatePaths.find(p=>p.id==='utility/downstream')!.pointsMm.map(p=>p[0])):west},explicitCandidatePaths:candidatePaths??null,checkedObstacles:i.obstacles,authoredComparison:i.comparison,paths:pipeRows,nearestPair:nearest,minimumSelfClearanceMm:Math.min(...selfSeparations.map(s=>s.afterTwoJacketsAndSettingsMm)),branches,
  straightCopperStockComparisonKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.copperKg,0),0),maximumStraightPipeWaterComparisonKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.fullWaterKg,0),0),
  twoValveReferenceKg:12,narrowCopperWaterAndNominalValveSubtotalKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.copperKg+s.fullWaterKg,0),12),
  insulationAndJacketInventory:{jacketVolumeM3:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.jacketVolumeM3,0),0),insulationVolumeM3:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.insulationVolumeM3,0),0),
   jacketDensityReferenceKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.jacketDensityReferenceKg,0),0),insulationDensityReferenceKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.insulationDensityReferenceKg,0),0),
   interpretation:'Virtual-corner cylindrical volumes and explicit density sensitivities; actual materials, closure cuts, fitting/clamp wrapping, binders, joints, moisture and complete installed mass unqualified.'},
  otherInstalledStockMassKg:null,straightLengthInterpretation:'Full virtual-corner polyline stock comparison, not actual tube cut lengths; fittings and exact installed contents remain unqualified.',
  completelyLockedStraightTubeAxialComparisonN:117200*copperAreaM2*1e6*.000017*i.comparison.temperatureChangeK,
  reservedConnections:{sourceChaseAndTerminalBayAreInterfacesNotSolidObstacleBoxes:true,actualLiveSourceTailAndTerminalRenewalQualified:false,
   finalPlantTransferUsesExistingActualTwoArchCrossingProof:true},
  topology:{independentColdBranches:true,sharedHeader:false,permanentBypass:false,sourceRestrictionsChanged:false,
   utilityOldIndoorPathRemoved:i.utilitySourcePathMm.slice(2),plantOldIndoorPathRemoved:i.plantSourcePathMm.slice(2),
   plantTransferConnected:true,actualDownstreamTreeAndStoreReleaseQualified:false},
  support:{pressureCornersAndKnownGravityExported:true,actualIndependentClipsGuidesAnchorsAndMasonryReceiversQualified:false,
   thermalFlexibilityQualified:false,installedResistanceQualified:false,loadedWithdrawalCaptureAndFirstRestsQualified:false,
   nativeStructuralActionsAdopted:false,noPanShieldFurnitureOrFloorCoverSupportCredited:true},
  necessaryStraightPipeGeometryAndBudgetComparison:diagnostics.length===0,diagnostics,
  fullInsulatedFittingEnvelopeQualified:false,fullRouteRenewalQualified:false,wholeOccupiedArrangementComplete:false,selected:false}
}

/** Join actual connected faces, valve bodies and continuous ordinary arm sweeps.
 * Only the exact connected axial end inside its own expanded body interface is
 * trimmed. All returning legs and sibling valves remain checked. */
export function inletRouteOperation(r:ReturnType<typeof inletIndoorRoutes>,c:ReturnType<typeof inletEntrySideCuts>){
 const pathIds=['utility/upstream','utility/downstream','plant/upstream','plant/downstream'],branches=['utility','plant']
 if(!r||!c||!Array.isArray(r.paths)||r.paths.length!==4||pathIds.some(id=>r.paths.filter(p=>p?.id===id).length!==1)
  ||!Array.isArray(c.valves)||c.valves.length!==2||branches.some(id=>c.valves.filter(v=>v?.branch===id).length!==1)
  ||!c.ordinaryOperator||!tuple(c.ordinaryOperator.shoulderMm,3)||!Number.isFinite(c.ordinaryOperator.armRadiusMm)||c.ordinaryOperator.armRadiusMm<=0
  ||!c.authoredChoices||!Number.isFinite(c.authoredChoices.wheelInboardMm)||c.authoredChoices.wheelInboardMm<0||c.authoredChoices.wheelInboardMm>40
  ||!r.pipe||![r.pipe.maximumOuterDiameterMm,r.pipe.radialInsulationMm,r.pipe.jacketEachSideMm,r.pipe.settingEachPipeMm].every(v=>Number.isFinite(v)&&v>0)
  ||r.paths.some(p=>!Array.isArray(p.pointsMm)||p.pointsMm.length<3||![...p.pointsMm].every(p=>tuple(p,3))||segments(p.pointsMm).some(s=>s.lengthMm<=0)||!Array.isArray(p.corners)||p.corners.some(v=>!tuple(v.territoryBoxMm,6)||v.territoryBoxMm.slice(3).some(n=>n<=0)))
  ||c.valves.some(v=>!tuple(v.axisMm,3)||![v.insulatedValveBodyEnvelopeMm,v.stemWheelEnvelopeMm].every(b=>tuple(b,6)&&b.slice(3).every(n=>n>0))||!Array.isArray(v.grips)||v.grips.length!==6||v.grips.some(g=>!tuple(g.pointMm,3)||!Number.isFinite(g.regripAngleDeg)||!Number.isFinite(g.inboardMm))))throw Error('Unsupported actual route operation geometry')
 const sector= c.valves.map(v=>({branch:v.branch,angles:[...new Set(v.grips.map(g=>g.regripAngleDeg))].sort((a,b)=>a-b),inboards:[...new Set(v.grips.map(g=>g.inboardMm))].sort((a,b)=>a-b)}))
 if(sector.some(v=>JSON.stringify(v.angles)!=='[-15,0,15]'||JSON.stringify(v.inboards)!==JSON.stringify(c.authoredChoices.wheelInboardMm?[0,c.authoredChoices.wheelInboardMm]:[0])))throw Error('Unsupported changed ordinary regrip sector')
 const clean=(v:number)=>Math.abs(v)<1e-7?0:v,
  radius=r.pipe.maximumOuterDiameterMm/2+r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,
  settings=2*r.pipe.settingEachPipeMm,shoulder=c.ordinaryOperator.shoulderMm as Point,
  armR=c.ordinaryOperator.armRadiusMm,inboard=c.authoredChoices.wheelInboardMm,
  angleStepDeg=1,inboardSteps=Math.max(1,Math.ceil(inboard/2)),inboardStepMm=inboard/inboardSteps,
  sweepCoverMm=62.5*Math.PI/180*angleStepDeg/2+inboardStepMm/2,
  gap=(a:Box,b:Box)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)},
  allSegments=r.paths.flatMap(path=>segments(path.pointsMm).map(seg=>({path:path.id,...seg}))),
  interfaces=r.paths.map(path=>{
   const branch=path.id.split('/')[0],v=c.valves.find(v=>v.branch===branch),upstream=path.id.endsWith('/upstream')
   if(!v)throw Error('Unsupported missing actual route valve')
   const index=upstream?path.pointsMm.length-2:0,end=path.pointsMm[upstream?path.pointsMm.length-1:0],adjacent=path.pointsMm[upstream?path.pointsMm.length-2:1],axis=v.axisMm,sign=upstream?-1:1,
    limit=(upstream?v.insulatedValveBodyEnvelopeMm[2]:v.insulatedValveBodyEnvelopeMm[2]+v.insulatedValveBodyEnvelopeMm[5])+sign*(radius+settings)
   if(end[0]!==axis[0]||end[1]!==axis[1]||end[2]!==axis[2]+sign*80||adjacent[0]!==axis[0]||adjacent[1]!==axis[1]||sign*(adjacent[2]-limit)<=0)
    throw Error('Unsupported actual route valve-face connection: '+path.id)
   return{path:path.id,branch,segment:index,faceMm:end,excludedToMm:[axis[0],axis[1],limit] as Point,
    basis:'Only connected axial end through own insulated body plus jacket and two settings; no returning leg or other valve excluded.'}
  }),
  valveChecks=allSegments.flatMap(seg=>c.valves.flatMap(v=>{
   const connection=interfaces.find(i=>i.path===seg.path&&i.branch===v.branch&&i.segment===seg.index),
    a=connection&&seg.index===0?connection.excludedToMm:seg.a,
    b=connection&&seg.index!==0?connection.excludedToMm:seg.b
   return [{kind:'body',box:v.insulatedValveBodyEnvelopeMm},{kind:'stem-wheel',box:v.stemWheelEnvelopeMm}].map(o=>({path:seg.path,segment:seg.index,valve:v.branch,kind:o.kind,reserveMm:clean(segmentBoxDistance(a,b,o.box as Box)-radius-settings),connectedEndTrimmed:!!connection}))
  })),
  cornerValveChecks=r.paths.flatMap(p=>p.corners.flatMap(corner=>c.valves.flatMap(v=>[
   {kind:'body',box:v.insulatedValveBodyEnvelopeMm},{kind:'stem-wheel',box:v.stemWheelEnvelopeMm}
  ].map(o=>({corner:corner.id,valve:v.branch,kind:o.kind,reserveMm:gap(corner.territoryBoxMm,o.box as Box)-settings}))))),
  armChecks=c.valves.flatMap(v=>{
   let closest:{path:string;segment:number;valve:string;inboardMm:number;angleDeg:number;gripMm:Point;reserveMm:number}|undefined
   let closestCorner:{corner:string;valve:string;inboardMm:number;angleDeg:number;reserveMm:number}|undefined
   const sign=v.branch==='utility'?1:-1
   for(let ib=0;ib<=inboardSteps;ib++)for(let angle=-15;angle<=15;angle+=angleStepDeg){
    const inboardMm=ib*inboardStepMm,a=angle*Math.PI/180,
     grip:Point=[v.axisMm[0]-217+inboardMm,v.axisMm[1]+62.5*Math.sin(a),v.axisMm[2]+sign*62.5*Math.cos(a)]
    for(const seg of allSegments){const reserveMm=segmentDistance(shoulder,grip,seg.a,seg.b)-armR-radius-settings-sweepCoverMm
     if(!closest||reserveMm<closest.reserveMm)closest={path:seg.path,segment:seg.index,valve:v.branch,inboardMm,angleDeg:angle,gripMm:grip,reserveMm}}
    for(const path of r.paths)for(const corner of path.corners){const reserveMm=segmentBoxDistance(shoulder,grip,corner.territoryBoxMm)-armR-settings-sweepCoverMm
     if(!closestCorner||reserveMm<closestCorner.reserveMm)closestCorner={corner:corner.id,valve:v.branch,inboardMm,angleDeg:angle,reserveMm}}
   }
   return{valve:v.branch,pipe:closest!,corner:closestCorner!}
  }),
  minimumValveReserveMm=Math.min(...valveChecks.map(v=>v.reserveMm),...cornerValveChecks.map(v=>v.reserveMm)),
  minimumArmReserveMm=Math.min(...armChecks.flatMap(v=>[v.pipe.reserveMm,v.corner.reserveMm])),
  diagnostics=[...(minimumValveReserveMm<0?['INLET_ROUTE_VALVE_BODY_OR_STEM_COLLISION']:[]),...(minimumArmReserveMm<0?['INLET_ROUTE_ORDINARY_ARM_COLLISION']:[])]
 return{schema:'had-inlet-route-operation/1',state:'necessary-declared-envelope-comparison',
  pipeJacketRadiusMm:radius,armCapsuleRadiusMm:armR,twoIndependentSettingsMm:settings,ordinaryShoulderMm:shoulder,
  valveEnvelopes:c.valves.map(v=>({branch:v.branch,bodyMm:v.insulatedValveBodyEnvelopeMm,stemWheelMm:v.stemWheelEnvelopeMm})),
  continuousRegrip:{angleRangeDeg:[-15,15],inboardRangeMm:[0,inboard],angleStepDeg,inboardStepMm,sweepCoverMm,
   interpretation:'All interpolated capsules covered by sampled capsule plus Lipschitz allowance; no reduction of arm, jacket or settings.'},
  connectionInterfaces:interfaces,minimumValveReserveMm,minimumArmReserveMm,
  valveChecks:valveChecks.filter(v=>v.reserveMm<10),cornerValveChecks:cornerValveChecks.filter(v=>v.reserveMm<10),armChecks,
  necessaryRouteOperationEnvelopeScreen:diagnostics.length===0,diagnostics,
  actualWheelPositionTorqueAndFactoryInterfacesQualified:false,fullOccupiedArrangementComplete:false}
}

export type InletRetainedRouteServices={boxes:readonly{id:string;boxMm:Box}[];paths:readonly{id:string;pointsMm:readonly Point[];radiusWithSupportsMm:number}[]}
/** Retained source-fed hot/heat services, fan/condensate and actual occupied package sweeps. */
export function inletRouteRetainedServices(r:ReturnType<typeof inletIndoorRoutes>,services:InletRetainedRouteServices){
 if(!services||Object.keys(services).sort().join(',')!=='boxes,paths'||!Array.isArray(services.boxes)||!Array.isArray(services.paths)
  ||new Set([...services.boxes,...services.paths].map(v=>v?.id)).size!==services.boxes.length+services.paths.length
  ||services.boxes.some(v=>typeof v.id!=='string'||!v.id||!tuple(v.boxMm,6)||v.boxMm.slice(3).some((n:number)=>n<=0))
  ||services.paths.some(v=>typeof v.id!=='string'||!v.id||!Array.isArray(v.pointsMm)||v.pointsMm.length<2||![...v.pointsMm].every(p=>tuple(p,3))||!Number.isFinite(v.radiusWithSupportsMm)||v.radiusWithSupportsMm<=0))throw Error('Unsupported retained service route geometry')
 const radius=r.pipe.maximumOuterDiameterMm/2+r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,settings=2*r.pipe.settingEachPipeMm,
  gap=(a:Box,b:Box)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)},
  rows=r.paths.flatMap(p=>{
   const ss=segments(p.pointsMm)
   return[...services.boxes.flatMap(o=>[
    ...ss.map(s=>({path:p.id,part:'pipe',segment:s.index,obstacle:o.id,reserveMm:segmentBoxDistance(s.a,s.b,o.boxMm)-radius-settings})),
    ...p.corners.map(c=>({path:p.id,part:'fitting-box',corner:c.id,obstacle:o.id,reserveMm:gap(c.territoryBoxMm,o.boxMm)-settings}))
   ]),...services.paths.flatMap(o=>segments(o.pointsMm).flatMap(t=>[
    ...ss.map(s=>({path:p.id,part:'pipe',segment:s.index,obstacle:o.id,obstacleSegment:t.index,reserveMm:segmentDistance(s.a,s.b,t.a,t.b)-radius-o.radiusWithSupportsMm-settings})),
    ...p.corners.map(c=>({path:p.id,part:'fitting-box',corner:c.id,obstacle:o.id,obstacleSegment:t.index,reserveMm:segmentBoxDistance(t.a,t.b,c.territoryBoxMm)-o.radiusWithSupportsMm-settings}))
   ]))]
  }).sort((a,b)=>a.reserveMm-b.reserveMm),minimumByObstacle=[...services.boxes,...services.paths].map(o=>rows.find(r=>r.obstacle===o.id)!),failures=rows.filter(v=>v.reserveMm<0)
 return{schema:'had-inlet-route-retained-services/1',state:'necessary-declared-retained-service-comparison',services,pipeJacketRadiusMm:radius,twoIndependentSettingsMm:settings,minimumByObstacle,failures,
  necessaryRetainedServiceEnvelopeScreen:failures.length===0,diagnostics:[...new Set(failures.map(v=>'INLET_RETAINED_SERVICE_COLLISION/'+v.obstacle))],
  actualFactoryFittingToolsAndCompleteOccupiedArrangementQualified:false,selected:false}
}

/** Inspect the actual polyline coordinates in plan and in an X/Z projection. */
export function drawInletIndoorRoutes(r:ReturnType<typeof inletIndoorRoutes>,operation?:ReturnType<typeof inletRouteOperation>,retained?:ReturnType<typeof inletRouteRetainedServices>){
 const colours=['#267a87','#64a2a4','#93513d','#c58c55'],text=(x:number,y:number,s:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`,
  line=(points:readonly Point[],elevation:boolean,colour:string)=>`<polyline points="${points.map(p=>`${50+(p[0]-r.roomPlanMm[0])*.13},${elevation?1160-p[2]*.13:640-(p[1]-r.roomPlanMm[1])*.13}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="3"/>`
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1250" viewBox="0 0 1200 1250"><rect width="1200" height="1250" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">${text(35,40,'Independent indoor cold paths · actual saved-bank comparison',25)}${text(35,75,'Declared pipe and boxed fitting territories. Factory fit, independent supports and loaded renewal remain unqualified.')}${text(35,120,'PLAN · source entry to separate indoor valves and the retained terminal/Plant transfer',18)}${`<rect x="50" y="${640-r.roomPlanMm[3]*.13}" width="${r.roomPlanMm[2]*.13}" height="${r.roomPlanMm[3]*.13}" fill="none" stroke="#6f766e"/>`}${r.checkedObstacles.filter(o=>/maintenance|washer/.test(o.id)).map(o=>`<rect x="${50+(o.boxMm[0]-r.roomPlanMm[0])*.13}" y="${640-(o.boxMm[1]+o.boxMm[4]-r.roomPlanMm[1])*.13}" width="${o.boxMm[3]*.13}" height="${o.boxMm[4]*.13}" fill="#d7d2c5" stroke="#9f9a8d"/>`).join('')}${operation?operation.valveEnvelopes.flatMap(v=>[v.bodyMm,v.stemWheelMm]).map(b=>`<rect x="${50+(b[0]-r.roomPlanMm[0])*.13}" y="${640-(b[1]+b[4]-r.roomPlanMm[1])*.13}" width="${b[3]*.13}" height="${b[4]*.13}" fill="#e5b8a8" stroke="#9b4331"/>`).join(''):''}${r.paths.map((p,k)=>line(p.pointsMm,false,colours[k])).join('')}${operation?operation.armChecks.map(a=>line([operation.ordinaryShoulderMm,a.pipe.gripMm],false,'#bd2525')).join(''):''}${text(35,720,'X/Z PROJECTION · local floor datum; no vertical exaggeration used as clearance proof',18)}${operation?operation.valveEnvelopes.flatMap(v=>[v.bodyMm,v.stemWheelMm]).map(b=>`<rect x="${50+(b[0]-r.roomPlanMm[0])*.13}" y="${1160-(b[2]+b[5])*.13}" width="${b[3]*.13}" height="${b[5]*.13}" fill="#e5b8a8" stroke="#9b4331"/>`).join(''):''}${r.paths.map((p,k)=>line(p.pointsMm,true,colours[k])).join('')}${operation?operation.armChecks.map(a=>line([operation.ordinaryShoulderMm,a.pipe.gripMm],true,'#bd2525')).join(''):''}${r.paths.map((p,k)=>`<line x1="600" x2="615" y1="${145+k*40}" y2="${145+k*40}" stroke="${colours[k]}" stroke-width="4"/>`+text(620,150+k*40,`${p.id}: ${(p.centrelineLengthMm/1000).toFixed(3)}m; corner interfaces: ${p.corners.length}.`)).join('')}${text(620,345,`Closest pipes after jackets/settings: ${r.nearestPair.afterTwoJacketsAndSettingsMm.toFixed(2)}mm.`)}${text(620,385,`Upper copper stock: ${r.straightCopperStockComparisonKg.toFixed(3)} kg; water: ${r.maximumStraightPipeWaterComparisonKg.toFixed(3)} kg.`)}${text(620,425,'Valves12kg; jacket/insulation refs; complete mass unknown.')}${r.branches.map((b,k)=>text(620,485+k*40,`${b.id}: loss: ${b.comparisonLossBar.toFixed(4)} bar; rise: ${b.netRiseBar.toFixed(4)} bar.`)).join('')}${text(620,570,`Boxed fitting territories: ${r.cornerTerritory.necessaryBoxedCornerTerritoryComparison?'within declared bounds':'REJECTED'}.`)}${text(620,610,`Geometry/budget comparison: ${r.necessaryStraightPipeGeometryAndBudgetComparison?'within declared comparisons':'REJECTED'}.`)}${text(620,650,'Loss coefficients are authored comparisons, not proved limits.')}${text(620,700,`Route / valve / arm screen: ${operation?.necessaryRouteOperationEnvelopeScreen?'within declared bounds':operation?'REJECTED':'not joined'}.`)}${text(620,740,operation?`Arm reserve ${operation.minimumArmReserveMm.toFixed(2)}mm; valve ${operation.minimumValveReserveMm.toFixed(2)}mm.`:'Actual valve and arm geometry must be joined.')}${text(620,785,retained?`Retained services / complete package: ${retained.necessaryRetainedServiceEnvelopeScreen?'within declared bounds':'REJECTED'}.`:'Retained service/package comparison not joined.')}${text(620,820,retained?.failures.length?`Worst reserve: ${retained.failures[0].reserveMm.toFixed(2)} mm.`:'No whole occupied-arrangement acceptance.')}${text(620,850,'Four paths; no cross-connection, header or bypass.')}${text(620,890,'Upstream/downstream tails end at actual 160 mm valve faces.')}${text(620,930,'Named copper/water gravity and pressure-corner vectors exported.')}${text(620,970,'Actual fixed/sliding clips and masonry receivers still required.')}${text(620,1010,'Lodge cuts and actual hot/store/upper draining remain required.')}${text(620,1050,'No route or added mass is admitted into native ground-zero STR.')}${text(35,1210,'HAD OPEN · no product/material selection, full occupied arrangement or construction acceptance',18)}</g></svg>`
}
