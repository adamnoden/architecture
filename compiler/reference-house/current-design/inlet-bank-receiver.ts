/** Pure finite receiver comparisons. A geometric admission is never a support selection. */
import {inletRouteOperation,type inletIndoorRoutes} from './inlet-indoor-routes.js'
import type {inletEntrySideCuts} from './inlet-indoor-cuts.js'
import {segmentBoxDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
type Point=readonly[number,number,number]
type Box=readonly[number,number,number,number,number,number]
export type InletBankReceiverSettings={clampWidthMm:number;clampHeightMm:number;clampRadialThicknessMm:number;toolAxialMm:number;toolSouthStrokeMm:number}
type Inputs={routes:ReturnType<typeof inletIndoorRoutes>;cuts:ReturnType<typeof inletEntrySideCuts>;wallCoreYMm:readonly[number,number];settings:InletBankReceiverSettings}
const gap=(a:Box,b:Box)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)}
const minimum=<T extends {reserveMm:number}>(rows:T[])=>rows.reduce((a,b)=>b.reserveMm<a.reserveMm?b:a)
const segments=(p:readonly Point[])=>p.slice(1).map((b,k)=>({a:p[k],b}))
const cross=(a:readonly number[],b:readonly number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const wrench=(p:readonly number[],f:readonly number[],origin:readonly number[]= [0,0,0])=>[...f,...cross(p.map((v,k)=>(v-origin[k])/1000),f)]
const sum=(rows:readonly number[][])=>rows.reduce((a,b)=>a.map((v,k)=>v+b[k]),[0,0,0,0,0,0])
export const inletBankClampReference={model:'Walraven DMC113028, geometric comparator only',widthMm:210,stripAxialHeightMm:25,radialThicknessMm:5,publishedFaZN:1700,
 document:'B15 310 EN-DUB03/2025 primary drawing',url:'https://files.walraven.com/repository/rnd/documents/EN-DUB/Two%20Bolt%20Riser%20Clamp%20-%20B%2015%20310%20(EN-DUB).pdf',
 actualBoltCentresLengthTorqueCopperToleranceAndWholeMaterialQualified:false} as const
export function inletBankReceiver(i:Inputs){
 if(!i||!i.settings||!i.routes||!i.cuts||!Array.isArray(i.wallCoreYMm)||i.routes.paths.length!==4||i.cuts.valves.length!==2||!i.routes.checkedObstacles.length)throw Error('Unsupported complete bank receiver source')
 const s=i.settings,r=i.routes,c=i.cuts,routeOperation=inletRouteOperation(r,c),setting=r.pipe.settingEachPipeMm,
  values=[s.clampWidthMm,s.clampHeightMm,s.clampRadialThicknessMm,s.toolAxialMm,s.toolSouthStrokeMm,...i.wallCoreYMm]
 if(values.some(v=>!Number.isFinite(v))||s.clampWidthMm<40||s.clampHeightMm<=0||s.clampRadialThicknessMm<=0||s.toolAxialMm<=0||s.toolSouthStrokeMm<=0||i.wallCoreYMm.length!==2||i.wallCoreYMm[1]<=i.wallCoreYMm[0])throw Error('Unsupported finite bank receiver comparison')
 const wrapping=r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,jacketR=r.pipe.maximumOuterDiameterMm/2+wrapping,
  axialGapMm=r.authoredRouteGeometry.tailOffsetMm-r.cornerTerritory.portTakeoffMm-r.cornerTerritory.insulatedBodyRadiusComparisonMm-106,
  offset=(106+r.authoredRouteGeometry.tailOffsetMm-r.cornerTerritory.portTakeoffMm-r.cornerTerritory.insulatedBodyRadiusComparisonMm)/2,
  receivers=c.valves.flatMap(v=>[-1,1].map(side=>{
   const centre:Point=[v.axisMm[0],v.axisMm[1],v.axisMm[2]+side*offset],
    half=[s.clampWidthMm/2,r.pipe.maximumOuterDiameterMm/2+s.clampRadialThicknessMm,s.clampHeightMm/2],
    metal=[...centre.map((n,k)=>n-half[k]),...half.map(v=>2*v)] as unknown as Box,
    cover=[...centre.map((n,k)=>n-half[k]-wrapping),...half.map(v=>2*(v+wrapping))] as unknown as Box,
    tool:Box=[centre[0]-half[0]-s.toolAxialMm/2,centre[1]-half[1]-s.toolSouthStrokeMm,centre[2]-s.toolAxialMm/2,
     2*half[0]+s.toolAxialMm,2*half[1]+s.toolSouthStrokeMm+s.toolAxialMm/2,s.toolAxialMm],
    obstacles=[{id:'receiver-cover',box:cover},{id:'declared-tool-sweep',box:tool}].flatMap(part=>r.checkedObstacles.map(o=>({part:part.id,obstacle:o.id,reserveMm:gap(part.box,o.boxMm)-setting}))),
    otherPipes=r.paths.filter(p=>!p.id.startsWith(v.branch+'/')).flatMap(p=>segments(p.pointsMm).flatMap(seg=>[{id:'cover',box:cover},{id:'tool',box:tool}].map(part=>({part:part.id,path:p.id,reserveMm:segmentBoxDistance(seg.a,seg.b,part.box)-jacketR-2*setting})))),
    arms=c.valves.flatMap(valve=>valve.grips.map(g=>segmentBoxDistance(c.ordinaryOperator.shoulderMm,g.pointMm,cover)-c.ordinaryOperator.armRadiusMm-setting)),
    minCover=minimum(obstacles.filter(o=>o.part==='receiver-cover')),
    minPlannedTool=minimum(obstacles.filter(o=>o.part==='declared-tool-sweep'&&o.obstacle!=='complete-shifted-utility-maintenance')),
    maintenanceConflict=minimum(obstacles.filter(o=>o.part==='declared-tool-sweep'&&o.obstacle==='complete-shifted-utility-maintenance')),
    minPipe=minimum(otherPipes),roomReserve=Math.min(cover[0]-r.roomPlanMm[0],r.roomPlanMm[0]+r.roomPlanMm[2]-cover[0]-cover[3],cover[1]-r.roomPlanMm[1],r.roomPlanMm[1]+r.roomPlanMm[3]-cover[1]-cover[4])-setting,
    stripReserve=axialGapMm-s.clampHeightMm-2*setting,toolReserve=axialGapMm-s.toolAxialMm-2*setting,armReserve=Math.min(...arms)
   return{id:'HAD/indoor-receiver/'+v.branch+'/'+(side<0?'below':'above'),branch:v.branch,side:side<0?'below':'above',centreMm:centre,
    absoluteOriginMm:centre.map((n,k)=>n+(k===2?c.groundStage.fflMm:0)),metalComparisonBoxMm:metal,newDemountableCoverBoxMm:cover,declaredToolSweepBoxMm:tool,
    adjacentJacketAxialGapMm:axialGapMm,stripAfterTwoSettingsMm:stripReserve,toolAfterTwoSettingsMm:toolReserve,
    minimumOccupiedCover:minCover,minimumPlannedTool:minPlannedTool,occupiedMaintenanceToolConflict:maintenanceConflict,minimumOtherBranchPipe:minPipe,
    roomAfterSettingMm:roomReserve,ordinaryFullArmAfterSettingMm:armReserve,
    necessaryFiniteClampTerritory:Math.min(stripReserve,toolReserve,minCover.reserveMm,minPlannedTool.reserveMm,minPipe.reserveMm,roomReserve,armReserve)>=0,
    actualClampAndToolMatched:false,actualJacketAndThermalBridgeQualified:false,finiteWallCarrierAndResistanceQualified:false}
  })),
  reactions=c.valves.map(v=>{
   const paths=r.paths.filter(p=>p.id.startsWith(v.branch+'/')),receiver=receivers.find(t=>t.branch===v.branch&&t.side==='below')!,
    wallOriginMm=[v.axisMm[0],(i.wallCoreYMm[0]+i.wallCoreYMm[1])/2,v.axisMm[2]+c.groundStage.fflMm],
    tailHalfSpanGravityN=paths.reduce((n,p)=>n-(p.id.endsWith('/upstream')?p.stock.at(-1)!:p.stock[0]).materialDensityComparisonGravityWrenchKNKNm[2]*1000/2,0),
    nominalValveGravityN=v.nominalValveKg*9.81,localGravityN=tailHalfSpanGravityN+nominalValveGravityN,
    cases=[-1,1].flatMap(pressureSign=>[0,-1,1].map(thermalSign=>{
     const forceN=[0,0,pressureSign*v.pressureCutClearBoreComparisonN+thermalSign*r.completelyLockedStraightTubeAxialComparisonN-localGravityN]
     return{pressureSign,thermalSign,pipeComparisonForceN:forceN,coreComparisonWrenchN_Nm:wrench(receiver.absoluteOriginMm,forceN,wallOriginMm),
      interpretation:thermalSign===0?'Ideal frictionless guide/one-datum control; actual coupled flexibility and restraint redistribution unsolved.':'Fully locked straight-tube adverse comparator, never valve-body or anchor acceptance.',
      ratioToPublished1700NClampReference:Math.abs(forceN[2])/inletBankClampReference.publishedFaZN,actualSupportReactionSolved:false,installedResistanceQualified:false}
    }))
   return{branch:v.branch,wallOriginMm,pipeWrenchOriginMm:receiver.absoluteOriginMm,tailHalfSpanGravityN,nominalValveGravityN,localReferenceGravityN:localGravityN,cases,
    actualValveCentroidAndCompleteMassKnown:false,localGravityScope:'Only the two adjacent tail half-spans and nominal valve. Remaining route gravity stays with named unqualified distributed guide obligations.'}
  }),
  guideRows=r.paths.flatMap(p=>p.stock.flatMap((stock,k)=>[p.pointsMm[k],p.pointsMm[k+1]].map((point,end)=>{
   const origin=point.map((n,j)=>n+(j===2?c.groundStage.fflMm:0)),f=[0,0,stock.materialDensityComparisonGravityWrenchKNKNm[2]*500]
   return{id:stock.id+'/ideal-guide/'+end,originMm:origin,referenceWrenchN_Nm:wrench(origin,f),actualReceiverQualified:false}
  }))),
  source=sum(r.paths.flatMap(p=>p.stock.map(stock=>stock.materialDensityComparisonGravityWrenchKNKNm.map(v=>v*1000)))),
  guides=sum(guideRows.map(v=>v.referenceWrenchN_Nm)),closure=source.map((v,k)=>v-guides[k])
 if(closure.some(v=>Math.abs(v)>1e-7))throw Error('Ideal guide gravity lost source force or first moment')
 return{schema:'had-bank-receiver-comparison/1',state:'unadopted-finite-clamp-and-reaction-comparison',settings:s,clampReference:inletBankClampReference,
  datum:{groundFflMm:c.groundStage.fflMm,wallCoreYMm:i.wallCoreYMm,shieldGeometryReferenceIsNotSharedSupport:true},receivers,reactions,
  guideGravity:{sourceWrenchN_Nm:source,guideWrenchN_Nm:guides,closureN_Nm:closure,rows:guideRows,distinctUnqualifiedPointCount:new Set(guideRows.map(v=>v.originMm.join(','))).size,
   interpretation:'Uniform segment half-gravity at both endpoints: exact ideal force/moment closure, no physical guide selection and no52-head foundation mapping.'},
  installation:{maintenanceFieldRetained:true,plannedState:'No equipment withdrawn into the complete maintenance working field; all fixed equipment, doors and ordinary body corridor remain.',
   actualBoltToolAssemblyAndCoverWithdrawalQualified:false,actualContinuousLoadedCaptureQualified:false,
   sequence:'Independently capture valve and both flange/tail halves before clamp release or10mm flange separation; remove new split cover first. No fixed clamp is silently made sliding.'},
  routeOperation,necessaryRouteOperationAndClampEnvelopeScreen:r.necessaryStraightPipeGeometryAndBudgetComparison&&c.necessaryOrdinaryOperationEnvelopeScreen&&routeOperation.necessaryRouteOperationEnvelopeScreen&&receivers.every(v=>v.necessaryFiniteClampTerritory),
  diagnostics:[...routeOperation.diagnostics,...receivers.filter(v=>!v.necessaryFiniteClampTerritory).map(v=>'INLET_RECEIVER_TERRITORY/'+v.id)],
  lockedStraight1700NClampRejected:r.completelyLockedStraightTubeAxialComparisonN>inletBankClampReference.publishedFaZN,
  actualMaterialProductToolAndCarrierSelected:false,actualCoupledThermalAndPressureReactionSolved:false,actualPierTransferQualified:false,nativeStructuralActionsAdopted:false,wholeOccupiedArrangementComplete:false}
}
export function drawInletBankReceiver(r:ReturnType<typeof inletBankReceiver>){
 const x0=r.receivers[0].centreMm[0],X=(x:number)=>100+(x-x0+160)*1.2,Z=(z:number)=>930-z*.38,
  text=(x:number,y:number,t:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1040" viewBox="0 0 1200 1040"><rect width="1200" height="1040" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">${text(35,45,'Finite indoor bank receivers · comparison only',26)}${text(35,80,'25mm strip / declared tools / new25mm insulation +1mm jacket. Actual matched parts and cold bridge unqualified.')}${text(35,115,'X/Z projection · local FFL; axes shown with no scale claim',17)}${r.receivers.map(v=>{const b=v.newDemountableCoverBoxMm;return `<rect x="${X(b[0])}" y="${Z(b[2]+b[5])}" width="${b[3]*1.2}" height="${b[5]*.38}" fill="#d8c8aa" stroke="#755e38"/><line x1="${X(v.centreMm[0])}" x2="${X(v.centreMm[0])}" y1="${Z(v.centreMm[2]-70)}" y2="${Z(v.centreMm[2]+70)}" stroke="#498091"/>`+text(134,Z(v.centreMm[2])+35,`${v.branch}/${v.side}`,14)}).join('')}${text(510,165,`Necessary route/operation/clamp screen: ${r.necessaryRouteOperationAndClampEnvelopeScreen?'within declared bounds':'REJECTED'}.`)}${text(510,205,'Actual finite wall carrier and pier resistance are not supplied.')}${text(510,245,'No pan, shield, finish or floor-cover load sharing.')}${text(510,285,'Tool approach: planned maintenance working field unoccupied.')}${text(510,325,'Ordinary complete working-field and equipment duties retained.')}${text(510,365,'Free-guide reaction rows are ideal controls, not solved support loads.')}${text(510,405,`Locked straight1700N clamp: ${r.lockedStraight1700NClampRejected?'REJECTED':'reference only'}.`)}${text(510,445,`Absolute gravity origins use saved FFL ${r.datum.groundFflMm}mm.`)}${text(510,485,'No native structural action is adopted.')}${text(35,995,'HAD OPEN · actual materials/tools, pressure/thermal supports, jacket renewal and loaded capture remain unqualified',17)}</g></svg>`
}
