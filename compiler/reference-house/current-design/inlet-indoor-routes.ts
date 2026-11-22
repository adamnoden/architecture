/** Explicit cold paths for the doorway-operated indoor cuts.
 * Coordinates and comparisons are serialisable; no pressure/thermal support is invented. */
import { inletCabinetProductFacts } from './inlet-cabinet-copper.js'
import { segmentBoxDistance, segmentDistance } from '../../../project/had/studies/service-interface-geometry.mjs'
type Point=readonly[number,number,number]
type Box=readonly[number,number,number,number,number,number]
type Path={id:string;pointsMm:readonly Point[];valveSpan?:readonly[number,number]}
export type IndoorRoutesInput={roomPlanMm:readonly[number,number,number,number];bankMm:readonly[number,number];utilityAxisZMm:number;plantAxisZMm:number;
 utilitySourcePathMm:readonly Point[];plantSourcePathMm:readonly Point[];plantTransferMm:readonly Point[];
 groundFflMm:number;ceilingMm:number;utilityLmin:number;plantLmin:number;maximumGaugeBar:number;
 networkAllowancesBar:readonly[number,number];obstacles:readonly{id:string;boxMm:Box}[];
 comparison:{frictionFactor:number;cornerK:number;temperatureChangeK:number}}
const distance=(a:Point,b:Point)=>Math.hypot(...a.map((v,k)=>v-b[k]))
const vec=(a:Point,b:Point)=>{const l=distance(a,b);return a.map((v,k)=>(b[k]-v)/l) as unknown as Point}
const segments=(p:readonly Point[])=>p.slice(1).map((b,k)=>({a:p[k],b,lengthMm:distance(p[k],b),index:k}))
const cross=(a:Point,b:Point)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
export function inletIndoorRoutes(i:IndoorRoutesInput){
 const values=[...i.roomPlanMm,...i.bankMm,i.utilityAxisZMm,i.plantAxisZMm,i.groundFflMm,i.ceilingMm,i.utilityLmin,i.plantLmin,i.maximumGaugeBar,...i.networkAllowancesBar,...Object.values(i.comparison)]
 if(values.some(v=>!Number.isFinite(v))||i.maximumGaugeBar<=0||i.maximumGaugeBar>12||i.plantAxisZMm-i.utilityAxisZMm<400
  ||i.utilitySourcePathMm.length!==7||i.plantSourcePathMm.length!==16||i.plantTransferMm.length!==2
  ||[...i.utilitySourcePathMm,...i.plantSourcePathMm,...i.plantTransferMm].some(p=>p.length!==3||p.some(v=>!Number.isFinite(v)))
  ||i.comparison.frictionFactor<=0||i.comparison.cornerK<0||i.comparison.temperatureChangeK<0
  ||i.obstacles.some(o=>o.boxMm.length!==6||o.boxMm.some(v=>!Number.isFinite(v))||o.boxMm.slice(3).some(v=>v<=0))) throw Error('Unsupported indoor pipe-route inputs')
 const [x,y]=i.bankMm,u=i.utilityAxisZMm,p=i.plantAxisZMm,
  us=i.utilitySourcePathMm[2],ps=i.plantSourcePathMm[2],ue=i.utilitySourcePathMm[6],pt=i.plantTransferMm[0],
  east=x+140,west=x-1270,returnX=x-1140,upperU=2850,upperP=3000,
  // Each four-part topology terminates on opposite faces of its own actual160mm valve.
  // Short vertical tails are not replaced by a shared header or a hidden bypass.
  paths:Path[]=[
   {id:'utility/upstream',pointsMm:[us,[us[0],us[1],2725],[east,us[1],2725],[east,y-240,2725],[east,y-240,u-200],[east,y,u-200],[x,y,u-200],[x,y,u-80]]},
   {id:'utility/downstream',pointsMm:[[x,y,u+80],[x,y,u+200],[returnX,y,u+200],[returnX,y,upperU],[west,y,upperU],[west,ue[1],upperU],[ue[0],ue[1],upperU],ue]},
   {id:'plant/upstream',pointsMm:[ps,[ps[0],ps[1],2610],[x,ps[1],2610],[x,y-120,2610],[x,y-120,p-200],[x,y,p-200],[x,y,p-80]]},
   {id:'plant/downstream',pointsMm:[[x,y,p+80],[x,y,p+200],[east,y,p+200],[east,y,upperP],[pt[0],pt[1],upperP],pt,...i.plantTransferMm.slice(1)]}
  ],pipeFacts=inletCabinetProductFacts.pipe,od=pipeFacts.maximumOuterDiameterIncludingOvalityMm,
  id=pipeFacts.minimumOuterDiameterIncludingOvalityMm-2*pipeFacts.maximumWallMm,waterBore=od-2*pipeFacts.minimumWallMm,jacketRadius=(od+52)/2,setting=10,
  copperAreaM2=Math.PI/4*(od**2-(od-2*pipeFacts.maximumWallMm)**2)/1e6,waterAreaM2=Math.PI/4*waterBore**2/1e6,flowAreaM2=Math.PI/4*id**2/1e6,
  pipeRows=paths.map(path=>{const ss=segments(path.pointsMm)
   if(ss.some(s=>s.lengthMm<=0)) throw Error('Zero-length indoor pipe leg')
   const stock=ss.map(s=>{const origin=s.a.map((v,k)=>(v+s.b[k])/2+(k===2?i.groundFflMm:0)) as unknown as Point,
    copperKg=s.lengthMm/1000*copperAreaM2*8960,waterKg=s.lengthMm/1000*waterAreaM2*1000,
    force:Point=[0,0,-(copperKg+waterKg)*9.81/1000]
    return{id:'HAD/indoor-pipe/'+path.id+'/'+s.index,originMm:origin,copperKg,fullWaterKg:waterKg,
      fullWaterGravityWrenchKNKNm:[...force,...cross(origin.map(v=>v/1000) as unknown as Point,force)]}
   }),corners=path.pointsMm.slice(1,-1).map((point,k)=>{const before=vec(path.pointsMm[k],point),after=vec(point,path.pointsMm[k+2]),
     angleRad=Math.acos(Math.max(-1,Math.min(1,before.reduce((n,v,j)=>n+v*after[j],0)))),
     pressureForceN=before.map((v,j)=>i.maximumGaugeBar*1e5*waterAreaM2*(v-after[j]))
     return{id:'HAD/indoor-pipe/'+path.id+'/corner/'+k,pointMm:point,turnAngleDeg:angleRad*180/Math.PI,fullPressureComparisonForceN:pressureForceN,
      previousLegMm:ss[k].lengthMm,nextLegMm:ss[k+1].lengthMm,
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
  diagnostics=[...selfSeparations.filter(s=>s.afterTwoJacketsAndSettingsMm<0).map(s=>'INLET_PIPE_SELF_COLLISION/'+s.id),...(nearest.afterTwoJacketsAndSettingsMm<0?['INLET_INDOOR_ROUTE_COLLISION']:[]),
   ...pipeRows.filter(r=>r.roomReserveAfterSettingMm<0||r.ceilingReserveAfterSettingMm<0||!r.straightLeg84MmTakeoffScreen||r.obstacles.some(o=>o.afterJacketAndSettingMm<0)).map(r=>'INLET_PIPE_ENVELOPE/'+r.id),
   ...branches.filter(b=>!b.lossAndRiseWithinExistingAllowanceComparison).map(b=>'INLET_PIPE_BUDGET/'+b.id)]
 return{schema:'had-indoor-pipe-routes/1',state:'unadopted-route-comparison',coordinateDatum:'Local occupied-groundFFL; stock origins include supplied saved-groundFFL translation.',
  pipe:{source:pipeFacts.model,maximumOuterDiameterMm:od,minimumWallMm:pipeFacts.minimumWallMm,maximumWallMm:pipeFacts.maximumWallMm,
   minimumHydraulicBoreMm:id,maximumWaterAndPressureBoreMm:waterBore,
   toleranceInterpretation:'Separate adverse extrema for friction, copper stock and contained water/pressure; these are not one physical tolerance state or installed mass.',radialInsulationMm:25,jacketEachSideMm:1,settingEachPipeMm:setting,
   copperDensityComparisonKgM3:8960,waterDensityComparisonKgM3:1000},
  roomPlanMm:i.roomPlanMm,checkedObstacles:i.obstacles,authoredComparison:i.comparison,paths:pipeRows,nearestPair:nearest,minimumSelfClearanceMm:Math.min(...selfSeparations.map(s=>s.afterTwoJacketsAndSettingsMm)),branches,
  straightCopperStockComparisonKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.copperKg,0),0),maximumStraightPipeWaterComparisonKg:pipeRows.reduce((n,r)=>n+r.stock.reduce((n,s)=>n+s.fullWaterKg,0),0),
  twoValveReferenceKg:12,otherInstalledStockMassKg:null,
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

/** Inspect the actual polyline coordinates in plan and in an X/Z projection. */
export function drawInletIndoorRoutes(r:ReturnType<typeof inletIndoorRoutes>){
 const colours=['#267a87','#64a2a4','#93513d','#c58c55'],text=(x:number,y:number,s:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`,
  line=(points:readonly Point[],elevation:boolean,colour:string)=>`<polyline points="${points.map(p=>`${50+(p[0]-r.roomPlanMm[0])*.13},${elevation?1160-p[2]*.13:640-(p[1]-r.roomPlanMm[1])*.13}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="3"/>`
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1250" viewBox="0 0 1200 1250"><rect width="1200" height="1250" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">${text(35,40,'Independent indoor cold paths · actual saved-bank comparison',25)}${text(35,75,'Straight centreline envelopes only. Fitted corners, independent supports and loaded renewal remain unqualified.')}${text(35,120,'PLAN · source entry to separate indoor valves and the retained terminal/Plant transfer',18)}${`<rect x="50" y="${640-r.roomPlanMm[3]*.13}" width="${r.roomPlanMm[2]*.13}" height="${r.roomPlanMm[3]*.13}" fill="none" stroke="#6f766e"/>`}${r.checkedObstacles.filter(o=>/maintenance|washer/.test(o.id)).map(o=>`<rect x="${50+(o.boxMm[0]-r.roomPlanMm[0])*.13}" y="${640-(o.boxMm[1]+o.boxMm[4]-r.roomPlanMm[1])*.13}" width="${o.boxMm[3]*.13}" height="${o.boxMm[4]*.13}" fill="#d7d2c5" stroke="#9f9a8d"/>`).join('')}${r.paths.map((p,k)=>line(p.pointsMm,false,colours[k])).join('')}${text(35,720,'X/Z PROJECTION · local floor datum; no vertical exaggeration used as clearance proof',18)}${r.paths.map((p,k)=>line(p.pointsMm,true,colours[k])).join('')}${r.paths.map((p,k)=>`<line x1="600" x2="615" y1="${145+k*40}" y2="${145+k*40}" stroke="${colours[k]}" stroke-width="4"/>`+text(620,150+k*40,`${p.id}: ${(p.centrelineLengthMm/1000).toFixed(3)}m; corner interfaces: ${p.corners.length}.`)).join('')}${text(620,345,`Closest pipes after jackets/settings: ${r.nearestPair.afterTwoJacketsAndSettingsMm.toFixed(2)}mm.`)}${text(620,385,`Upper copper stock: ${r.straightCopperStockComparisonKg.toFixed(3)} kg; water: ${r.maximumStraightPipeWaterComparisonKg.toFixed(3)} kg.`)}${text(620,425,'Valve references: 12 kg; fittings, jackets and supports unweighed.')}${r.branches.map((b,k)=>text(620,485+k*40,`${b.id}: loss: ${b.comparisonLossBar.toFixed(4)} bar; rise: ${b.netRiseBar.toFixed(4)} bar.`)).join('')}${text(620,610,`Geometry/budget comparison: ${r.necessaryStraightPipeGeometryAndBudgetComparison?'within declared comparisons':'REJECTED'}.`)}${text(620,650,'Loss coefficients are authored comparisons, not proved limits.')}${text(620,850,'Four paths; no cross-connection, header or bypass.')}${text(620,890,'Upstream/downstream tails end at actual 160 mm valve faces.')}${text(620,930,'Named copper/water gravity and pressure-corner vectors exported.')}${text(620,970,'Actual fixed/sliding clips and masonry receivers still required.')}${text(620,1010,'Lodge cuts and actual hot/store/upper draining remain required.')}${text(620,1050,'No route or added mass is admitted into native ground-zero STR.')}${text(35,1210,'HAD OPEN · no product/material selection, full occupied arrangement or construction acceptance',18)}</g></svg>`
}
