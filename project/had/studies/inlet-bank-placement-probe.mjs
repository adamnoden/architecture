/** Recovery-only bounded receiver placement; existing geometry methods, no new solver. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {segmentBoxDistance,segmentDistance} from './service-interface-geometry.mjs'
const root=new URL('../../../',import.meta.url),read=p=>readFileSync(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex')
const request=JSON.parse(read('project/had/studies/inlet-bank-placement-reference.json')),bytes=read(request.source.path)
if(hash(bytes)!==request.source.sha256)throw Error('Changed source; reassess placement, never silently rebind a recovery proof')
const source=JSON.parse(bytes),room=source.joinedDirection.room,r=room.indoorRoutes,cuts=room.indoorCuts,
 setting=request.settingEachInterfaceMm,port=r.cornerTerritory.portTakeoffMm,cornerR=r.cornerTerritory.insulatedBodyRadiusComparisonMm,
 jacketR=(r.pipe.maximumOuterDiameterMm+2*r.pipe.radialInsulationMm+2*r.pipe.jacketEachSideMm)/2,
 wrapping=r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,
 ceilingMm=Math.max(...r.paths.flatMap(p=>p.corners.map(c=>c.territoryBoxMm[2]+c.territoryBoxMm[5])))+r.cornerTerritory.minimumCeilingReserveMm+setting,
 segments=p=>p.slice(1).map((b,k)=>({a:p[k],b,index:k})),length=(a,b)=>Math.hypot(...a.map((x,k)=>x-b[k])),
 vector=(a,b)=>a.map((x,k)=>(b[k]-x)/length(a,b)),
 gap=(a,b)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(x=>x>0)?Math.hypot(...d.map(x=>Math.max(0,x))):Math.max(...d)},
 minimum=rows=>rows.reduce((a,b)=>b.reserveMm<a.reserveMm?b:a,{reserveMm:Infinity}),
 box=(point,half)=>[...point.map((v,k)=>v-half[k]),...half.map(v=>2*v)]
function investigate(spec){
 if(!Number.isFinite(spec.tailOffsetMm)||spec.tailOffsetMm<200||![spec.utilityAxisShiftMm,spec.bankShiftXMm??0,spec.utilityReturnShiftXMm??0].every(Number.isFinite))throw Error('Finite declared tail and axis choices required')
 const paths=structuredClone(r.paths).map(path=>{
  const utility=path.id.startsWith('utility/'),down=path.id.endsWith('/downstream'),shift=utility?spec.utilityAxisShiftMm:0,
   axis=utility?cuts.authoredChoices.utilityAxisZMm:cuts.authoredChoices.plantAxisZMm,oldCorner=axis+(down?200:-200)
  path.pointsMm.forEach((p,k)=>{const sourceX=p[0];if([cuts.authoredChoices.bankXMm,cuts.authoredChoices.bankXMm+140,cuts.authoredChoices.bankXMm-170,cuts.authoredChoices.bankXMm-1310].includes(sourceX)&&!(spec.preserveWestReturnXMm&&sourceX===cuts.authoredChoices.bankXMm-1310))p[0]+=(spec.bankShiftXMm??0)
   if(path.id==='utility/downstream'&&sourceX===cuts.authoredChoices.bankXMm-170)p[0]+=(spec.utilityReturnShiftXMm??0)
   if(p[2]===oldCorner)p[2]+=shift+(down?1:-1)*(spec.tailOffsetMm-200)
   if((!down&&k===path.pointsMm.length-1)||(down&&k===0))p[2]+=shift})
  const ss=segments(path.pointsMm)
  path.centrelineLengthMm=ss.reduce((n,s)=>n+length(s.a,s.b),0)
  path.corners=path.pointsMm.slice(1,-1).map((p,k)=>{
   const before=vector(path.pointsMm[k],p),after=vector(p,path.pointsMm[k+2]),
    ends=[p,p.map((n,j)=>n-port*before[j]),p.map((n,j)=>n+port*after[j])],
    lo=p.map((_,j)=>Math.min(...ends.map(p=>p[j]))-cornerR),hi=p.map((_,j)=>Math.max(...ends.map(p=>p[j]))+cornerR)
   return{id:path.id+'/corner/'+k,boxMm:[...lo,...hi.map((n,j)=>n-lo[j])]}
  })
  return path
 })
 const pairs=[],cornerPairs=[],cornerPipes=[],cornerObstacles=[],pipeObstacles=[],selfPairs=[]
 for(let ai=0;ai<paths.length;ai++){
  const a=paths[ai],own=segments(a.pointsMm)
  for(let si=0;si<own.length;si++)for(let ti=si+2;ti<own.length;ti++)selfPairs.push({path:a.id,reserveMm:segmentDistance(own[si].a,own[si].b,own[ti].a,own[ti].b)-2*(jacketR+setting)})
  for(let bi=ai+1;bi<paths.length;bi++)for(const sa of segments(a.pointsMm))for(const sb of segments(paths[bi].pointsMm))
   pairs.push({a:a.id,b:paths[bi].id,reserveMm:segmentDistance(sa.a,sa.b,sb.a,sb.b)-2*(jacketR+setting)})
  for(const c of a.corners){
   for(let bi=0;bi<paths.length;bi++)if(ai!==bi){
    for(const d of paths[bi].corners)cornerPairs.push({a:c.id,b:d.id,reserveMm:gap(c.boxMm,d.boxMm)-2*setting})
    for(const s of segments(paths[bi].pointsMm))cornerPipes.push({corner:c.id,path:paths[bi].id,reserveMm:segmentBoxDistance(s.a,s.b,c.boxMm)-jacketR-2*setting})
   }
   for(const o of r.checkedObstacles)cornerObstacles.push({corner:c.id,obstacle:o.id,reserveMm:gap(c.boxMm,o.boxMm)-setting})
  }
  for(const s of segments(a.pointsMm))for(const o of r.checkedObstacles)
   pipeObstacles.push({path:a.id,obstacle:o.id,reserveMm:segmentBoxDistance(s.a,s.b,o.boxMm)-jacketR-setting})
 }
 const routeMinima={pipeToPipe:minimum(pairs),cornerToCorner:minimum(cornerPairs),cornerToOtherPipe:minimum(cornerPipes),cornerToObstacle:minimum(cornerObstacles),pipeToObstacle:minimum(pipeObstacles),pipeToOwnNonadjacent:minimum(selfPairs),cornerToCeiling:{reserveMm:Math.min(...paths.flatMap(p=>p.corners.map(c=>ceilingMm-c.boxMm[2]-c.boxMm[5]-setting)))}},
  valves=cuts.valves.map(v=>{
   const shift=v.branch==='utility'?spec.utilityAxisShiftMm:0,axis=[v.axisMm[0]+(spec.bankShiftXMm??0),v.axisMm[1],v.axisMm[2]+shift],
    grips=v.grips.map(g=>{const p=g.pointMm.map((n,k)=>n+(k===2?shift:k===0?(spec.bankShiftXMm??0):0));return length(cuts.ordinaryOperator.shoulderMm,p)})
   const physicalParts=[['body',v.insulatedValveBodyEnvelopeMm],['stem',v.stemWheelEnvelopeMm]].map(([id,b])=>({id,box:b.map((n,k)=>n+(k===2?shift:k===0?(spec.bankShiftXMm??0):0))})),
    occupied=physicalParts.flatMap(p=>r.checkedObstacles.map(o=>({part:p.id,obstacle:o.id,reserveMm:gap(p.box,o.boxMm)-setting}))),
    renewal=v.replacement.wholeValveSweepMm.map((n,k)=>n+(k===2?shift:k===0?(spec.bankShiftXMm??0):0))
   return{branch:v.branch,axisMm:axis,maximumGripReachMm:Math.max(...grips),minimumOccupiedObstacle:minimum(occupied),wholeValveWestSweepMm:renewal,
    continuousLoadedCaptureAndFirstRestQualified:false}
  }),receivers=valves.flatMap(valve=>[-1,1].map(side=>{
   const axialGapMm=spec.tailOffsetMm-port-cornerR-106,
    installedStripReserveMm=axialGapMm-request.clamp.stripAxialHeightMm-2*setting,
    toolReserveMm=axialGapMm-request.tool.authoredAxialEnvelopeMm-2*setting,
    // Place midway between the unchanged106mm valve jacket limit and declared elbow jacket.
    offset=(106+spec.tailOffsetMm-port-cornerR)/2,
    centre=valve.axisMm.map((v,k)=>v+(k===2?side*offset:0)),
    metalHalf=[request.clamp.overallWidthMm/2,r.pipe.maximumOuterDiameterMm/2+request.clamp.stripRadialThicknessMm,request.clamp.stripAxialHeightMm/2],
    metal=box(centre,metalHalf),cover=box(centre,metalHalf.map(v=>v+wrapping)),
    tool=[centre[0]-metalHalf[0]-request.tool.authoredAxialEnvelopeMm/2,centre[1]-metalHalf[1]-request.tool.authoredSouthApproachMm,centre[2]-request.tool.authoredAxialEnvelopeMm/2,
     2*metalHalf[0]+request.tool.authoredAxialEnvelopeMm,2*metalHalf[1]+request.tool.authoredSouthApproachMm+request.tool.authoredAxialEnvelopeMm/2,request.tool.authoredAxialEnvelopeMm],
    occupied=[['receiver-cover',cover],['declared-tool-sweep',tool]].flatMap(([part,b])=>r.checkedObstacles.map(o=>({part,obstacle:o.id,reserveMm:gap(b,o.boxMm)-setting}))),
    otherPipes=paths.filter(p=>!p.id.startsWith(valve.branch+'/')).flatMap(p=>segments(p.pointsMm).flatMap(s=>[['cover',cover],['tool',tool]].map(([part,b])=>({part,path:p.id,reserveMm:segmentBoxDistance(s.a,s.b,b)-jacketR-2*setting})))),
    armClearanceMm=Math.min(...cuts.valves.flatMap(v=>v.grips.map(g=>{const tip=g.pointMm.map((n,k)=>n+(k===0?(spec.bankShiftXMm??0):k===2&&v.branch==='utility'?spec.utilityAxisShiftMm:0));return segmentBoxDistance(cuts.ordinaryOperator.shoulderMm,tip,cover)-cuts.ordinaryOperator.armRadiusMm-setting}))),
    roomBoundsMm=Math.min(cover[0]-r.roomPlanMm[0],r.roomPlanMm[0]+r.roomPlanMm[2]-cover[0]-cover[3],cover[1]-r.roomPlanMm[1],r.roomPlanMm[1]+r.roomPlanMm[3]-cover[1]-cover[4])-setting
   return{branch:valve.branch,side:side<0?'below':'above',centreMm:centre,adjacentJacketAxialGapMm:axialGapMm,
    installedStripReserveMm,declaredToolReserveMm:toolReserveMm,metalBoxMm:metal,newDemountableCoverBoxMm:cover,declaredToolSweepBoxMm:tool,
    minimumOrdinaryCoverObstacle:minimum(occupied.filter(v=>v.part==='receiver-cover')),minimumPlannedToolObstacle:minimum(occupied.filter(v=>v.part==='declared-tool-sweep'&&v.obstacle!=='complete-shifted-utility-maintenance')),
    occupiedMaintenanceToolConflict:minimum(occupied.filter(v=>v.part==='declared-tool-sweep'&&v.obstacle==='complete-shifted-utility-maintenance')),minimumOtherBranchPipe:minimum(otherPipes),roomBoundsMm,ordinaryFullArmClearanceMm:armClearanceMm,
    necessaryFiniteClampTerritory:armClearanceMm>=0&&installedStripReserveMm>=0&&toolReserveMm>=0&&minimum(occupied.filter(v=>v.part==='receiver-cover'||v.obstacle!=='complete-shifted-utility-maintenance')).reserveMm>=0&&minimum(otherPipes).reserveMm>=0&&roomBoundsMm>=0,
    coverInterpretation:'New combined removable25mm insulation/1mm jacket envelope around clamp. Its intersection with the same branch existing insulation requires actual joined detailing, never a deducted insulation allowance.',
    installationState:'Maintenance equipment not withdrawn into its full retained working field; fixed washer, sink, radiator, complete doors and operator corridor remain obstacles. This state supplies no ordinary fault-response credit.',
    actualBoltFullEnvelopeToolTorqueAndThermalBridgeQualified:false,installedReceiverOrAnchorQualified:false}
  })),
  branches=r.branches.map(b=>{const centrelineLengthMm=paths.filter(p=>p.id.startsWith(b.id+'/')).reduce((n,p)=>n+p.centrelineLengthMm,0),
   deltaLengthMm=centrelineLengthMm-b.centrelineLengthMm,comparisonLossBar=b.comparisonLossBar+b.straightLossBar*deltaLengthMm/b.centrelineLengthMm
   const dM=deltaLengthMm/1000,oldTotalM=r.branches.reduce((n,v)=>n+v.centrelineLengthMm/1000,0),
    areaJ=Math.PI/4*((2*jacketR)**2-(2*jacketR-2*r.pipe.jacketEachSideMm)**2)/1e6,
    areaI=Math.PI/4*((2*jacketR-2*r.pipe.jacketEachSideMm)**2-r.pipe.maximumOuterDiameterMm**2)/1e6
   return{id:b.id,centrelineLengthMm,deltaLengthMm,comparisonLossBar,netRiseBar:b.netRiseBar,
    deltaStraightCopperReferenceKg:dM*r.straightCopperStockComparisonKg/oldTotalM,deltaMaximumWaterReferenceKg:dM*r.maximumStraightPipeWaterComparisonKg/oldTotalM,
    deltaJacketVolumeM3:dM*areaJ,deltaInsulationVolumeM3:dM*areaI,deltaJacketAtSteel8000ReferenceKg:dM*areaJ*8000,
    deltaInsulationAt200ReferenceKg:dM*areaI*200,materialAndDensitySelection:false,
    allocationAfterLossAndRiseBar:b.allocatedNetworkLossBar-comparisonLossBar-Math.max(0,b.netRiseBar),freeRunExpansion40KMm:centrelineLengthMm*.000017*40,
    coupledThermalReactionSolved:false}
  })
 return{...spec,paths:paths.map(p=>({id:p.id,pointsMm:p.pointsMm,centrelineLengthMm:p.centrelineLengthMm})),routeMinima,valves,receivers,branches,
  necessaryRouteAndClampEnvelopeTerritory: Object.values(routeMinima).every(v=>v.reserveMm>=0)&&valves.every(v=>v.maximumGripReachMm<=650&&v.minimumOccupiedObstacle.reserveMm>=0)&&receivers.every(v=>v.necessaryFiniteClampTerritory),
  currentSharedInputsChanged:false,actualProductAndResistanceSelected:false}
}
const cases=request.cases.map(investigate),control=cases[0],candidate=cases[6]
for(const [key,expected]of [['pipeToPipe',r.nearestPair.afterTwoJacketsAndSettingsMm],['cornerToCorner',r.cornerTerritory.minimumOtherCornerReserveMm],['cornerToOtherPipe',r.cornerTerritory.minimumOtherPipeReserveMm],['cornerToObstacle',r.cornerTerritory.minimumObstacleReserveMm]])
 assert.ok(Math.abs(control.routeMinima[key].reserveMm-expected)<1e-7,'Unchanged actual route control must reproduce '+key)
assert.equal(control.necessaryRouteAndClampEnvelopeTerritory,false)
assert.ok(cases[1].routeMinima.pipeToPipe.reserveMm<0)
assert.ok(cases[2].routeMinima.cornerToCorner.reserveMm<0)
assert.equal(cases[3].necessaryRouteAndClampEnvelopeTerritory,false)
assert.ok(cases[3].receivers.some(v=>v.minimumOtherBranchPipe.reserveMm<0))
assert.equal(cases[4].necessaryRouteAndClampEnvelopeTerritory,false)
assert.ok(cases[4].valves.some(v=>v.minimumOccupiedObstacle.reserveMm<0))
assert.equal(cases[5].necessaryRouteAndClampEnvelopeTerritory,false)
assert.equal(candidate.necessaryRouteAndClampEnvelopeTerritory,true)
assert.ok(candidate.branches.reduce((n,b)=>n+b.deltaLengthMm,0)>360)
assert.throws(()=>investigate({tailOffsetMm:NaN,utilityAxisShiftMm:0}),/Finite/)
const strippedGapMm=200-port-(cornerR-wrapping)-80,
 cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
 totalM=r.branches.reduce((n,b)=>n+b.centrelineLengthMm/1000,0),
 jacketArea=Math.PI/4*((2*jacketR)**2-(2*jacketR-2*r.pipe.jacketEachSideMm)**2)/1e6,
 insulationArea=Math.PI/4*((2*jacketR-2*r.pipe.jacketEachSideMm)**2-r.pipe.maximumOuterDiameterMm**2)/1e6,
 referenceMassPerM=(r.straightCopperStockComparisonKg+r.maximumStraightPipeWaterComparisonKg)/totalM+jacketArea*8000+insulationArea*200,
 pressureN=cuts.valves[0].pressureCutClearBoreComparisonN,ffl=cuts.groundStage.fflMm,
 candidateActions=candidate.paths.map(path=>({id:path.id,materialReference:'Steel jacket8000/insulation200 sensitivities; no material/density or installed mass selection',
  segmentGravity:segments(path.pointsMm).map(s=>{const originMm=s.a.map((n,k)=>(n+s.b[k])/2+(k===2?ffl:0)),massKg=length(s.a,s.b)/1000*referenceMassPerM,forceN=[0,0,-massKg*9.81];return{id:path.id+'/'+s.index,originMm,massKg,gravityWrenchN_Nm:[...forceN,...cross(originMm.map(v=>v/1000),forceN)]}}),
  cornerPressure:path.pointsMm.slice(1,-1).map((p,k)=>{const a=vector(path.pointsMm[k],p),b=vector(p,path.pointsMm[k+2]),forceN=a.map((v,j)=>pressureN*(v-b[j])),originMm=p.map((n,j)=>n+(j===2?ffl:0));return{id:path.id+'/corner/'+k,originMm,fluidOnCornerComparisonWrenchN_Nm:[...forceN,...cross(originMm.map(v=>v/1000),forceN)],actualStructuralReaction:false}})})),
 result={schema:'had-bank-placement-recovery/1',state:'recovery-only-not-current-design',source:request.source,request,
 method:{path:'project/had/studies/inlet-bank-placement-probe.mjs',sha256:hash(read('project/had/studies/inlet-bank-placement-probe.mjs'))},
 existingShortTail:{barePipeFlangeToTangentMm:200-80-port,unchangedAdjacentJacketGapMm:200-port-cornerR-106,
  strippedBareEnvelopeGapMm:strippedGapMm,stripAfterTwoSettingsMm:strippedGapMm-request.clamp.stripAxialHeightMm-2*setting,
  declaredToolAfterTwoSettingsMm:strippedGapMm-request.tool.authoredAxialEnvelopeMm-2*setting,
  oldWrenchPointMinus115IsNotClampAdmission:true,shortTailReboxedReceiverOrThermalBridgeAccepted:false},
 cases,candidateActions,
 candidateOrigins:{groundFflMm:cuts.groundStage.fflMm,groundDatum:cuts.groundStage,
  namedValveAxesAbsoluteMm:candidate.valves.map(v=>({branch:v.branch,originMm:v.axisMm.map((n,k)=>n+(k===2?cuts.groundStage.fflMm:0))})),
  namedReceiverAbsoluteMm:candidate.receivers.map(v=>({id:v.branch+'/'+v.side,originMm:v.centreMm.map((n,k)=>n+(k===2?cuts.groundStage.fflMm:0))})),
  sourceColdCutPressureComparisonN:cuts.valves[0].pressureCutClearBoreComparisonN,lockedStraightThermalReferenceN:r.completelyLockedStraightTubeAxialComparisonN,
  actualValveCentroidAndStructuralReactionKnown:false},
 obligations:{sourceCutPressureAndLocked9232NComparatorUnchanged:true,clampNotAcceptedAsThermalAnchor:true,
  continuousRequiredInsulationAndCondensationDetailQualified:false,actualValveTailReleaseAndTemporaryCaptureQualified:false,
  removalSequence:'Independently capture valve and both tail/flange halves before releasing clamps or moving10mm flange halves. Remove new split cover first. No frictionless sliding or temporary support capacity is assumed.',
  actualBoltAssemblyToolAndJacketWithdrawalPathsQualified:false,opposedPierSpreaderInstallationAndCapacityQualified:false,
  addedClampCarrierFittingMassKnown:false,wholePipeBeamAndCoupledThermalAnalysisComplete:false,
  groundDatum:cuts.groundStage,sourceNativeStructuralActionsAdopted:false,wholeRoomAccepted:false}}
const out=JSON.stringify(result,null,2)+'\n'
if(process.argv.includes('--check'))assert.equal(read('project/had/studies/inlet-bank-placement-probe.json').toString(),out)
else writeFileSync(new URL('project/had/studies/inlet-bank-placement-probe.json',root),out)
console.log(JSON.stringify({cases:cases.map(c=>({id:c.id,necessaryTerritory:c.necessaryRouteAndClampEnvelopeTerritory,routeMinima:c.routeMinima,receiver:c.receivers[0]})),unchangedControls:true,adverseShift70Rejected:true},null,2))
