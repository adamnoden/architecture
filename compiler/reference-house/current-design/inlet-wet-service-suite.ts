import {inletOpenClosedOutfall} from './inlet-open-closed-outfall.js'
import {rectangularCatchmentScreen} from './inlet-room-catchment.js'
import {inletRoomPocket} from './inlet-room-pocket.js'

export type WetServiceSuiteChoice={schema:'had-wet-service-suite/1';id:string;centreXMm:number;plantEndYMm:number;utilityEndYMm:number;clearWidthMm:number;slopeRatio:number;localPocketDepthMm:number;isolationGapMm:number;railCentresOffsetMm:number;railWidthMm:number;barThicknessMm:number;barWidthMm:number;barGapMm:number;metalMm:number;insulationMm:number;settingMm:number}
const keys=['schema','id','centreXMm','plantEndYMm','utilityEndYMm','clearWidthMm','slopeRatio','localPocketDepthMm','isolationGapMm','railCentresOffsetMm','railWidthMm','barThicknessMm','barWidthMm','barGapMm','metalMm','insulationMm','settingMm'].sort()
export function admitWetServiceSuiteChoice(value:unknown):WetServiceSuiteChoice{
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).sort().join()!==keys.join())throw Error('Complete versioned wet service suite choice required')
 const c=value as WetServiceSuiteChoice
 if(c.schema!=='had-wet-service-suite/1'||c.id!=='HAD/connected-wet-service-suite'||!Object.entries(c).filter(([k])=>!['schema','id'].includes(k)).every(([,v])=>Number.isFinite(v)&&Number(v)>0)||c.plantEndYMm<=c.utilityEndYMm||c.clearWidthMm<300||c.clearWidthMm>800||c.slopeRatio<50||c.slopeRatio>200||c.localPocketDepthMm>350||c.settingMm<10||c.metalMm<2||c.insulationMm<20||c.barGapMm>15)throw Error('Unsupported wet service suite choice')
 return structuredClone(c)
}
type Cell={id:string;cornersMm:readonly (readonly number[])[]}
/** Exact interpolation in an existing planar pan cell; no historical receipt. */
export function panSurfaceAt(cells:readonly Cell[],x:number,y:number){
 const values=cells.flatMap(c=>{
  const [a,b,,d]=c.cornersMm,ux=b[0]-a[0],uy=b[1]-a[1],vx=d[0]-a[0],vy=d[1]-a[1],det=ux*vy-uy*vx
  if(!Number.isFinite(det)||Math.abs(det)<1e-9)throw Error('Unsupported degenerate pan cell')
  const u=((x-a[0])*vy-(y-a[1])*vx)/det,v=(ux*(y-a[1])-uy*(x-a[0]))/det
  if(u< -1e-9||u>1+1e-9||v< -1e-9||v>1+1e-9)return[]
  const expected=b[2]+d[2]-a[2]
  if(Math.abs(expected-c.cornersMm[2][2])>1e-6)throw Error('Unsupported nonplanar pan cell')
  return[{cellId:c.id,zMm:a[2]+u*(b[2]-a[2])+v*(d[2]-a[2])}]
 })
 if(!values.length||Math.max(...values.map(v=>v.zMm))-Math.min(...values.map(v=>v.zMm))>1e-6)throw Error('Unsupported missing or stepped pan join')
 return{pointMm:[x,y,values[0].zMm],cellIds:values.map(v=>v.cellId)}
}
function panCrossSection(cells:readonly Cell[],centre:number,width:number,y:number){
 const lo=centre-width/2,hi=centre+width/2,xs=[...new Set([lo,centre,hi,...cells.flatMap(c=>c.cornersMm.map(p=>p[0])).filter(x=>x>lo&&x<hi)])].sort((a,b)=>a-b),
  samples=xs.map(x=>panSurfaceAt(cells,x,y))
 return{samples,highestSurfaceMm:Math.max(...samples.map(s=>s.pointMm[2])),lowestSurfaceMm:Math.min(...samples.map(s=>s.pointMm[2]))}
}

export function drawInletWetServiceSuite(r:ReturnType<typeof inletWetServiceSuite>){
 const [x,y,w,d]=r.geometry.lobbyPlanMm,k=.15,X=(v:number)=>35+(v-x)*k,Y=(v:number)=>550-(v-y)*k,
  [a,b]=r.geometry.linkBottomEndsXYZMm,t=(yy:number,s:string)=>`<text x="420" y="${yy}" font-size="16">${s}</text>`
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="760" viewBox="0 0 1160 760"><rect width="1160" height="760" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#25221c"><text x="35" y="40" font-size="25">Connected wet service suite · unselected comparison</text><text x="35" y="74" font-size="16">Absolute ground datum; visible dryable wetting permitted. Complete store release remains unknown.</text><rect x="${X(x)}" y="${Y(y+d)}" width="${w*k}" height="${d*k}" fill="#dce9e5" stroke="#554f43"/><line x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="#428493" stroke-width="${r.geometry.clearWidthMm*k}" opacity=".6"/><text x="35" y="640" font-size="15">Actual lobby pocket; independent flush removable grate required.</text>${t(140,`Link ${r.geometry.clearWidthMm}mm clear; bottom ${a[2].toFixed(2)} → ${b[2].toFixed(2)}mm.`)}${t(172,`Plant raised spill lip ${r.geometry.raisedPlantSpillLipMm.toFixed(2)}mm; no trapped Utility heel.`)}${t(204,`Opening / rail reserves ${r.geometry.archAfterTwoSettingsMm.toFixed(2)} / ${r.geometry.railGutterAfterTwoSettingsMm.toFixed(2)}mm.`)}${r.coupledSourceCases.map((c,j)=>t(265+j*96,`${c.id.replaceAll('_',' / ')}`)+t(293+j*96,`${c.receivingTotalLmin.toFixed(2)} L/min: pools ${c.sourcePoolMm.toFixed(2)} / ${c.receivingPoolMm.toFixed(2)}mm; ${c.conditionalSteadyEnergyScreen?'conditional energy envelope':'FAIL'}.`)+t(321+j*96,`Under-grate air / outlet crown reserves ${c.underGrateAirReserveMm.toFixed(2)} / ${c.outletCrownReserveMm.toFixed(2)}mm.`)).join('')}${t(590,'Half surviving width +32mm deposit +K1.5; actual receiving pool charged.')}${t(622,'High/submerged/all-blocked: no steady outlet credit.')}${t(654,'Seats, cold-grid transfer, electrical/warm seams, site and real release OPEN.')}<text x="35" y="718" font-size="17">No installation, architectural acceptance, hydraulic qualification or finished-floor adoption.</text></g></svg>`
}

/** Sufficient, deliberately conservative subcritical energy envelope, not a
 * free-outlet substitution. Uniform half-width obstruction and32mm deposit.
 * At y>=yc, velocity head<=yc/2 and Sf<=Sf(yc). Charge this friction over the
 * entire run, ignoring its beneficial fall. Include the downstream pool energy
 * even above the mouth; the highest bed additionally requires minimum specific
 * energy1.5yc. Actual transitions/jumps/obstructions remain unqualified.
 */
export function wetSuiteLinkHead(qLmin:number,widthMm:number,lengthMm:number,highestBedMm:number,downstreamBedMm:number,downstreamPoolMm:number){
 if(![qLmin,widthMm,lengthMm,highestBedMm,downstreamBedMm,downstreamPoolMm].every(Number.isFinite)||qLmin<=0||widthMm<=0||lengthMm<=0||highestBedMm<downstreamBedMm)throw Error('Unsupported wet suite energy domain')
 const q=qLmin/60000,b=widthMm/2000,g=9.81,yc=Math.cbrt(q*q/(g*b*b)),v=q/(b*yc),r=b*yc/(b+2*yc),sf=.015**2*v*v/r**(4/3),
  depositedHighest=highestBedMm+32,depositedDownstream=downstreamBedMm+32,
  tailDepth=Math.max(yc,(downstreamPoolMm-depositedDownstream)/1000),tailVelocity=q/(b*tailDepth),
  downstreamEnergy=depositedDownstream+1000*(tailDepth+tailVelocity**2/(2*g)),
  required=Math.max(depositedHighest+1500*yc,downstreamEnergy)+sf*lengthMm+1.5*500*yc
 return{requiredUpstreamPoolMm:required,downstreamPoolMm,downstreamEnergyMm:downstreamEnergy,criticalDepthMm:1000*yc,survivingWidthMm:b*1000,chargedFrictionMm:sf*lengthMm,entranceKComparison:1.5,bedDepositMm:32,freeOutletAssumed:false,actualProfileQualified:false}
}

/** Standard-step energy balance for a wholly subcritical, vented rectangular
 * link. Actual downstream pool boundary; no free-critical or pressure-flow
 * transition. Solve E_a=E_b+(Sf_a+Sf_b)dx/2 on y>yc at each step. Charge K1.5
 * entrance at computed upstream velocity. n=.015 remains an assumption.
 */
export function wetSuiteSubcriticalBackwater(qLmin:number,widthMm:number,lengthMm:number,upstreamBedMm:number,downstreamBedMm:number,downstreamPoolMm:number){
 if(![qLmin,widthMm,lengthMm,upstreamBedMm,downstreamBedMm,downstreamPoolMm].every(Number.isFinite)||Math.min(qLmin,widthMm,lengthMm)<=0)throw Error('Unsupported wet suite backwater domain')
 const q=qLmin/60000,b=widthMm/2000,g=9.81,yc=Math.cbrt(q*q/(g*b*b)),tail=(downstreamPoolMm-downstreamBedMm-32)/1000,
  energy=(y:number)=>y+(q/(b*y))**2/(2*g),sf=(y:number)=>{const area=b*y,radius=area/(b+2*y);return .015**2*(q/area)**2/radius**(4/3)},
  step=(count:number)=>{
   if(tail<=yc*(1+1e-8))return{count,supported:false as const,reason:'downstream-boundary-not-strictly-subcritical',requiredUpstreamPoolMm:null,minimumDepthRatio:null,maximumWaterSurfaceMm:null}
   let y=tail,maximum=downstreamPoolMm,minimumRatio=y/yc
   const dx=lengthMm/count/1000
   for(let k=1;k<=count;k++){
    const za=(downstreamBedMm+(upstreamBedMm-downstreamBedMm)*k/count+32)/1000,
     zb=(downstreamBedMm+(upstreamBedMm-downstreamBedMm)*(k-1)/count+32)/1000,
     rhs=zb+energy(y)+sf(y)*dx/2,f=(depth:number)=>za+energy(depth)-sf(depth)*dx/2-rhs
    let lo=yc*(1+1e-8),hi=Math.max(y*2,lo*2)
    if(f(lo)>=0)return{count,supported:false as const,reason:'subcritical-branch-terminates-before-upstream-end',requiredUpstreamPoolMm:null,minimumDepthRatio:minimumRatio,maximumWaterSurfaceMm:null}
    while(f(hi)<0){hi*=2;if(hi>100)throw Error('Wet suite backwater root exceeds100m depth comparison domain')}
    for(let j=0;j<60;j++){const mid=(lo+hi)/2;if(f(mid)>0)hi=mid;else lo=mid}
    y=(lo+hi)/2;minimumRatio=Math.min(minimumRatio,y/yc);maximum=Math.max(maximum,(za+y)*1000)
   }
   const velocity=q/(b*y),required=upstreamBedMm+32+1000*(y+2.5*velocity**2/(2*g))
   return{count,supported:true as const,reason:null,requiredUpstreamPoolMm:required,minimumDepthRatio:minimumRatio,maximumWaterSurfaceMm:Math.max(maximum,required)}
  },refinements=[32,64,128].map(step),last=refinements[2],previous=refinements[1],
  difference=(a:typeof last,b:typeof last)=>a.requiredUpstreamPoolMm===null||b.requiredUpstreamPoolMm===null||a.maximumWaterSurfaceMm===null||b.maximumWaterSurfaceMm===null?null:Math.max(Math.abs(a.requiredUpstreamPoolMm-b.requiredUpstreamPoolMm),Math.abs(a.maximumWaterSurfaceMm-b.maximumWaterSurfaceMm)),
  change=difference(last,previous),coarseChange=difference(previous,refinements[0]),
  converged=refinements.every(r=>r.supported)&&change!==null&&coarseChange!==null&&coarseChange<=.04&&change<=.01&&change<=coarseChange+1e-9
 return{state:converged?'resolved-subcritical-comparison' as const:'unsupported-subcritical-comparison' as const,refinements,coarseConvergenceChangeMm:coarseChange,coarseConvergenceToleranceMm:.04,convergenceChangeMm:change,convergenceToleranceMm:.01,requiredUpstreamPoolMm:converged?last.requiredUpstreamPoolMm:null,maximumWaterSurfaceMm:converged?last.maximumWaterSurfaceMm:null,criticalDepthMm:yc*1000,survivingWidthMm:b*1000,bedDepositMm:32,entranceKComparison:1.5,manningNComparison:.015,actualConstituentsDebrisGrateAndProfileQualified:false,methodReferences:['https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/7.0/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/equations-for-basic-profile-calculations','https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/6.1/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/friction-loss-evaluation']}
}

type PocketInput=Parameters<typeof inletRoomPocket>[0]
type Room={actualGeometry:{routes:readonly{id:string;mouthXYZMm:readonly number[];closedClearCornersMm:readonly(readonly number[])[]}[];openChuteClearWidthMm:number;openChuteSlopeRatio:number;indoorCoverUndersideMm:number;receiverCrestMm:number;receiverWidthMm:number;receiverCoefficientComparison:number;highAdverseRiseMm:number};planMm:readonly number[];pan:{cells:readonly Cell[];necessaryGeometryScreen:boolean};outletGeometryScreen:boolean;invertMm:number;clearWidthMm:number;clearHeightMm:number;lengthMm:number;slopeRatio:number;terminalInvertMm:number;receiverWaterMm:number;sourceLmin:number}
export function inletWetServiceSuite(i:{choice:WetServiceSuiteChoice;lobbyPlanMm:readonly number[];utilityOpeningXMm:readonly number[];plantOpeningXMm:readonly number[];utility:Room;plant:Room;ground:PocketInput['levels'];grid:PocketInput['grid'];floorObstacles:readonly {id:string;planMm:readonly number[]}[];rcDensityKNm3:number;mineralDensityKNm3:number;reference:{wheelN:number;wheelBandMm:number;steelDensityKgM3:number;proofMPa:number};unlocatedStoredEnergySensitivityLmin:number}){
 const c=admitWetServiceSuiteChoice(i.choice),u=i.utility,p=i.plant,s=c.settingMm,ffl=i.ground.ffl,
  join=panCrossSection(u.pan.cells,c.centreXMm,c.clearWidthMm,c.utilityEndYMm),plantJoin=panCrossSection(p.pan.cells,c.centreXMm,c.clearWidthMm,c.plantEndYMm),length=c.plantEndYMm-c.utilityEndYMm,
  // Flat transverse gutter floor stands at or above EVERY actual receiving
  // pan segment across its width, not merely its centre. The resulting small
  // downward spill step is explicit; no concealed trapped gutter heel.
  utilityBed=join.highestSurfaceMm,plantBed=utilityBed+length/c.slopeRatio,
  pocket=inletRoomPocket({levels:i.ground,roomPlanMm:i.lobbyPlanMm,depthMm:c.localPocketDepthMm,isolationGapMm:c.isolationGapMm,grid:i.grid,rcDensityKNm3:i.rcDensityKNm3,mineralDensityKNm3:i.mineralDensityKNm3,roomId:'lobby'}),
  arch=[Math.max(i.utilityOpeningXMm[0],i.plantOpeningXMm[0]),Math.min(i.utilityOpeningXMm[1],i.plantOpeningXMm[1])],
  outerHalf=c.clearWidthMm/2+c.insulationMm+c.metalMm,railSpan=2*c.railCentresOffsetMm,railOuter=railSpan/2+c.railWidthMm/2,
  archReserve=Math.min(c.centreXMm-railOuter-arch[0],arch[1]-c.centreXMm-railOuter)-2*s,
  railGutterReserve=c.railCentresOffsetMm-c.railWidthMm/2-outerHalf-2*s,
  bedReserve=Math.min(utilityBed,plantBed)-c.metalMm-c.insulationMm-pocket.levels.accessibleDistribution[0]-2*s,
  stress=1.5*i.reference.wheelN*(railSpan+2*s)/(i.reference.wheelBandMm*c.barThicknessMm**2),barKg=(railSpan+c.railWidthMm)*c.barWidthMm*c.barThicknessMm/1e9*i.reference.steelDensityKgM3,
  fixedFloorConflicts=i.floorObstacles.filter(o=>{const [x,y,w,d]=o.planMm;return x<c.centreXMm+railOuter+2*s&&x+w>c.centreXMm-railOuter-2*s&&y<c.plantEndYMm+2*s&&y+d>c.utilityEndYMm-2*s}).map(o=>o.id),
  geometry=u.pan.necessaryGeometryScreen&&p.pan.necessaryGeometryScreen&&u.outletGeometryScreen&&p.outletGeometryScreen&&archReserve>=0&&railGutterReserve>=0&&bedReserve>=0&&plantBed>=plantJoin.highestSurfaceMm&&pocket.local?.necessaryGeometryScreen===true&&fixedFloorConflicts.length===0,
  event=(id:string,from:Room,to:Room,transferLmin:number,localLmin:number,reverse=false)=>{
   const total=transferLmin+localLmin,outlet=rectangularCatchmentScreen(total,to.clearWidthMm,to.clearHeightMm,to.lengthMm,to.slopeRatio),
    receivingPool=to.invertMm+outlet.requiredHeadAboveInvertMm+s,
    // High outlet setting and independently high link floor are charged. The
    // actual receiving pool, not a free-critical depth, controls the wet link.
    link=wetSuiteLinkHead(transferLmin,c.clearWidthMm,length,plantBed+s,reverse?plantBed+s:utilityBed+s,receivingPool),
    backwater=wetSuiteSubcriticalBackwater(transferLmin,c.clearWidthMm,length,(reverse?utilityBed:plantBed)+s,(reverse?plantBed:utilityBed)+s,receivingPool),
    sourcePool=backwater.requiredUpstreamPoolMm??link.requiredUpstreamPoolMm,freeDrop=to.terminalInvertMm-s-to.receiverWaterMm-25,
    // Pool and crown belong to the SAME shifted outlet. Do not combine its
    // +setting pool with a fictitious -setting crown. The independent walking
    // floor and link settings are separately adverse.
    crownReserve=to.clearHeightMm-15-outlet.requiredHeadAboveInvertMm,
    floorReserve=ffl-15-s-Math.max(receivingPool,sourcePool),grateAirReserve=ffl-c.barThicknessMm-15-s-Math.max(receivingPool,sourcePool,backwater.maximumWaterSurfaceMm??sourcePool),
    receiverForFullFlow=to.actualGeometry.receiverCrestMm+1000*(total/60000/(to.actualGeometry.receiverCoefficientComparison*to.actualGeometry.receiverWidthMm/1000))**(2/3),
    actualOutfallProfiles=to.actualGeometry.routes.map(route=>inletOpenClosedOutfall({id:route.id,maximumLmin:total,mouthXYZMm:route.mouthXYZMm,closedClearCornersMm:route.closedClearCornersMm,openChuteClearWidthMm:to.actualGeometry.openChuteClearWidthMm,openChuteSlopeRatio:to.actualGeometry.openChuteSlopeRatio,indoorCoverUndersideMm:to.actualGeometry.indoorCoverUndersideMm,settingEachMm:s,receiverWaterMm:receiverForFullFlow,outletState:'one-surviving-free-outlet'})),
    actualHighReceiverProfiles=to.actualGeometry.routes.map(route=>inletOpenClosedOutfall({id:route.id,maximumLmin:total,mouthXYZMm:route.mouthXYZMm,closedClearCornersMm:route.closedClearCornersMm,openChuteClearWidthMm:to.actualGeometry.openChuteClearWidthMm,openChuteSlopeRatio:to.actualGeometry.openChuteSlopeRatio,indoorCoverUndersideMm:to.actualGeometry.indoorCoverUndersideMm,settingEachMm:s,receiverWaterMm:receiverForFullFlow+to.actualGeometry.highAdverseRiseMm,outletState:'high-or-submerged'})),
    screen=geometry&&backwater.state==='resolved-subcritical-comparison'&&outlet.necessaryOpenChannelScreen&&freeDrop>=0&&crownReserve>=0&&floorReserve>=0&&grateAirReserve>=0
   return{id,actualOutfallProfiles,actualHighReceiverProfiles,receiverWaterRecomputedAtFullReceivingFlowMm:receiverForFullFlow,allPossibleSurvivingOutfallsPassActualDomain:actualOutfallProfiles.length===2&&actualOutfallProfiles.every(p=>p.necessaryActualFreeSurfaceScreen),oldUniformPoolCrownScreenRetainedAsSufficientControl:true,byBranchLmin:{plant:p.sourceLmin,utility:u.sourceLmin},transferLmin,receivingTotalLmin:total,receivingPoolMm:receivingPool,sourcePoolMm:sourcePool,link,backwater,sourcePoolMethod:backwater.state==='resolved-subcritical-comparison'?'standard-step-subcritical':'conservative-upper-only-profile-unsupported',outlet,freeDropReserveMm:freeDrop,outletCrownReserveMm:crownReserve,visibleFloorReserveMm:floorReserve,underGrateAirReserveMm:grateAirReserve,conservativeUpperBoundUnderGrateAirReserveMm:ffl-c.barThicknessMm-15-s-Math.max(receivingPool,link.requiredUpstreamPoolMm),conditionalSteadyEnergyScreen:screen,otherRoomOutletsCredited:0,actualSurfaceDistributionQualified:false}
  },
  cases=[event('Plant-East-both-unavailable_Utility-South-one-unavailable',p,u,p.sourceLmin,u.sourceLmin),event('Utility-South-both-unavailable_Plant-East-one-unavailable',u,p,u.sourceLmin,p.sourceLmin,true),event('unlocated-full-height-store-energy-sensitivity',p,u,i.unlocatedStoredEnergySensitivityLmin,u.sourceLmin)],
  blocked={conditionalSteadyEnergyScreen:false,sourceLmin:p.sourceLmin+u.sourceLmin,reason:'No outlet credit with all four blocked, or all available terminals high/submerged. No pump, manual response or invented automatic closure.'},
  floorArea=c.clearWidthMm*Math.hypot(length,plantBed-utilityBed)/1e6,sideArea=length*(2*ffl-plantBed-utilityBed)/2e6,
  sideCentroidZ=(ffl**2-(plantBed**2+plantBed*utilityBed+utilityBed**2)/3)/(2*ffl-plantBed-utilityBed),midY=(c.plantEndYMm+c.utilityEndYMm)/2,sideCentroidY=c.utilityEndYMm+length*((ffl-utilityBed)+2*(ffl-plantBed))/(3*(2*ffl-plantBed-utilityBed)),
  metalRows=[{id:c.id+'/floor-sheet',areaM2:floorArea,centreMm:[c.centreXMm,midY+c.metalMm/(2*c.slopeRatio*Math.sqrt(1+1/c.slopeRatio**2)),(plantBed+utilityBed)/2-c.metalMm/(2*Math.sqrt(1+1/c.slopeRatio**2))]},
    ...[-1,1].map((direction,k)=>({id:c.id+'/side-sheet-'+(k+1),areaM2:sideArea,centreMm:[c.centreXMm+direction*(c.clearWidthMm+c.metalMm)/2,sideCentroidY,sideCentroidZ]}))].map(row=>({...row,massKg:row.areaM2*c.metalMm/1000*8960,originMm:row.centreMm,forceKN:[0,0,-row.areaM2*c.metalMm/1000*8960*9.81/1000],actualGridReceiverReactions:null})),
  grossWaterToFloorLitres=c.clearWidthMm*length*(ffl-(plantBed+utilityBed)/2)/1e6
 return{schema:'had-wet-service-suite-comparison/1',state:'unselected-connected-wet-service-suite',selected:false,authoredChoice:c,datum:'Absolute source-ground XYZ from the same saved ground case; no finished-floor adoption.',
  geometry:{lobbyPlanMm:i.lobbyPlanMm,commonFinishedOpeningXMm:arch,utilityPanJoin:join,plantPanJoin:plantJoin,linkBottomEndsXYZMm:[[c.centreXMm,c.plantEndYMm,plantBed],[c.centreXMm,c.utilityEndYMm,utilityBed]],clearWidthMm:c.clearWidthMm,outerWidthMm:2*outerHalf,archAfterTwoSettingsMm:archReserve,railGutterAfterTwoSettingsMm:railGutterReserve,bottomAfterTwoSettingsMm:bedReserve,raisedPlantSpillLipMm:plantBed-plantJoin.highestSurfaceMm,utilitySpillStepMaximumMm:utilityBed-join.lowestSurfaceMm,openSideWallTopMm:ffl,fixedFloorConflicts,necessaryGeometryScreen:geometry},
  newGravityInventory:{metalRows,comparisonCopperDensityKgM3:8960,grossUndisplacedGutterWaterToFloorLitres:grossWaterToFloorLitres,actualAssuredStorageLitres:null,grateStockTotalKg:barKg*Math.ceil(length/(c.barWidthMm+c.barGapMm)),railsCapturesHardwareInsulationAndSeamsKg:null,actualHydrostaticFaceActionsAndSourceJetLoads:null,flatStockOnlyBeforeSeamsAndJunctionLaps:true,wholeLoadPathQualified:false},
  sourceDutyEnvelope:{byBranchLmin:{plant:p.sourceLmin,utility:u.sourceLmin},summedSeparateFaultBoundsLmin:p.sourceLmin+u.sourceLmin,scope:'Conservative simultaneous upper envelope of separately bounded source faults; not an actual common-source operating point.',commonSourceCouplingSolved:false,actualNetworkOperatingPoint:false},
  lobbyPocket:pocket,walkingFloor:{flushLevelMm:ffl,barWidthMm:c.barWidthMm,openGapMm:c.barGapMm,pieceCount:Math.ceil(length/(c.barWidthMm+c.barGapMm)),barStockEachKg:barKg,hardwareEachKg:null,adverseStripStressMPa:stress,referenceProofComparisonMPa:i.reference.proofMPa,referenceStripScreen:stress<=i.reference.proofMPa,actualStockWheelSeatCaptureAndSlipQualified:false,withdrawalAndFirstRestQualified:false},
  coupledSourceCases:cases,allOutletsBlocked:blocked,highSubmerged:blocked,
  storedRelease:{completeMaximumInventoryLitres:null,actualReleaseHydrograph:null,conditionalImpulseTestRequired:false,actualContainmentScreen:null,meaning:'Visible dryable wetting is permissible;42L sufficient impulse test is optional and is not a required capacity. Source+store sensitivity remains adverse, not an actual low-port peak.'},
  interfaces:{eastDoorFrameCargoAndExteriorDeckReplanned:false,existingFourOutletsRetained:true,lobbyChangesFromDryToWet:true,ordinaryPassageRequiresCapturedFlushRemovableGrate:true,independentColdCutsRetained:true,commonPanWorkRequiresBothFeedsAndStoreUpperEnergyIsolated:true,PVRemainsSeparateDryStreethead:true,actualMainboardJetAndWetFloorSeparationQualified:false,dpcWarmthWeatherSeamsAndMaterialsQualified:false,noProlongedConcealedWettingQualified:false,floorReplacementNotAutomaticallyAdditionalLoad:true,wholeFloorGridAndFoundationResistanceQualified:false},
  diagnostics:['WET_SUITE/actual-store-pressure-backfeed-air-and-upper-network-unbounded','WET_SUITE/open-link-transition-jet-debris-and-spreading-unqualified','WET_SUITE/actual-site-receiver-capacity-unqualified','WET_SUITE/common-wet-lobby-electrical-boundary-and-loaded-grate-renewal-unqualified',...(!geometry?['WET_SUITE/actual-geometry-screen-fails']:[])],preSiteArrangementComplete:false,installedAcceptance:false}
}
