/** Recovery exploration only. Not a current compiler consumer or support acceptance. */
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const root=new URL('../../../',import.meta.url),read=p=>readFileSync(new URL(p,root)),hash=b=>createHash('sha256').update(b).digest('hex')
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const wrench=(pointMm,forceN,originMm=[0,0,0])=>[...forceN,...cross(pointMm.map((v,k)=>(v-originMm[k])/1000),forceN)]
const sum=rows=>rows.reduce((a,b)=>a.map((v,k)=>v+b[k]),[0,0,0,0,0,0])
const settings=JSON.parse(read('project/had/studies/inlet-bank-carrier-reference.json'))
const bytes=read(settings.source.path)
if(hash(bytes)!==settings.source.sha256)throw Error('Changed inlet source: author a new exploration request; do not rebind old results')
const receipt=JSON.parse(bytes),room=receipt.joinedDirection.room,routes=room.indoorRoutes,
 wall=room.electricalScreen.supportFrame.connections.find(c=>c.wallId==='utility-north'),
 ffl=room.indoorCuts.groundStage.fflMm,
 pressureGaugeBar=receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,
 pressureBoreMm=routes.pipe.maximumWaterAndPressureBoreMm,
 pressureN=pressureGaugeBar*1e5*Math.PI/4*(pressureBoreMm/1000)**2,
 totalLengthM=routes.branches.reduce((n,b)=>n+b.centrelineLengthMm/1000,0),
 pipeOD=routes.pipe.maximumOuterDiameterMm,insulatedOD=pipeOD+2*routes.pipe.radialInsulationMm,
 jacketOD=insulatedOD+2*routes.pipe.jacketEachSideMm,
 jacketAreaM2=Math.PI/4*(jacketOD**2-insulatedOD**2)/1e6,
 insulationAreaM2=Math.PI/4*(insulatedOD**2-pipeOD**2)/1e6
assert.equal(routes.support.nativeStructuralActionsAdopted,false)
assert.deepEqual(wall.coreYMm,[2480,2620])
const scenarios=settings.jacketDensitiesKgM3.flatMap(jacket=>settings.insulationDensitiesKgM3.map(insulation=>{
 const branches=routes.branches.map(branch=>{
  const paths=routes.paths.filter(p=>p.id.startsWith(branch.id+'/')),
   valve=room.indoorCuts.valves.find(v=>v.branch===branch.id),
   wallOriginMm=[valve.axisMm[0],(wall.coreYMm[0]+wall.coreYMm[1])/2,valve.axisMm[2]+ffl],
   pipeAnchorOriginMm=[valve.axisMm[0],valve.axisMm[1],valve.axisMm[2]-settings.carrier.pipeAnchorBelowValveAxisMm+ffl],
   segmentSources=[],guides=[]
  let bankGuideGravityN=0
  for(const path of paths)for(let k=0;k<path.stock.length;k++){
   const stock=path.stock[k],a=path.pointsMm[k].map((v,j)=>v+(j===2?ffl:0)),b=path.pointsMm[k+1].map((v,j)=>v+(j===2?ffl:0)),
    lengthM=Math.hypot(...a.map((v,j)=>v-b[j]))/1000,
    jacketKg=lengthM*jacketAreaM2*jacket.density,
    insulationKg=insulation===null?null:lengthM*insulationAreaM2*insulation,
    representedKg=stock.copperKg+stock.fullWaterKg+jacketKg+(insulationKg??0),forceN=[0,0,-representedKg*9.81],
    originMm=a.map((v,j)=>(v+b[j])/2),source={id:stock.id,originMm,lengthM,copperKg:stock.copperKg,waterKg:stock.fullWaterKg,jacketKg,insulationKg,
     representedKg,gravityWrenchN_Nm:wrench(originMm,forceN)}
   segmentSources.push(source)
   for(const [end,p]of [['a',a],['b',b]])guides.push({id:stock.id+'/guide-'+end,originMm:p,forceN:forceN.map(v=>v/2),gravityWrenchN_Nm:wrench(p,forceN.map(v=>v/2)),physicalReceiverQualified:false})
   if((path.id.endsWith('/upstream')&&k===path.stock.length-1)||(path.id.endsWith('/downstream')&&k===0))bankGuideGravityN+=representedKg*9.81/2
  }
  const grouped=new Map()
  for(const g of guides){const key=g.originMm.join(',');if(!grouped.has(key))grouped.set(key,{...g,forceN:[0,0,0],gravityWrenchN_Nm:[0,0,0,0,0,0]});const item=grouped.get(key);item.forceN=item.forceN.map((v,k)=>v+g.forceN[k]);item.gravityWrenchN_Nm=item.gravityWrenchN_Nm.map((v,k)=>v+g.gravityWrenchN_Nm[k])}
  const uniqueGuides=[...grouped.values()]
  const sourceWrench=sum(segmentSources.map(s=>s.gravityWrenchN_Nm)),guideWrench=sum(uniqueGuides.map(g=>g.gravityWrenchN_Nm)),
   closure=sourceWrench.map((v,k)=>v-guideWrench[k])
  assert.ok(closure.every(v=>Math.abs(v)<1e-9),'Endpoint gravity reference must preserve force and first moments')
  const nominalValveGravityN=6*9.81,localGravityN=bankGuideGravityN+nominalValveGravityN,
   cases=[-1,1].flatMap(sign=>[0,-1,1].map(thermalSign=>{
    const forceN=[0,0,sign*pressureN+thermalSign*routes.completelyLockedStraightTubeAxialComparisonN-localGravityN]
    return{id:`${branch.id}/pressure-${sign}/thermal-${thermalSign}`,pressureSign:sign,thermalSign,
     pipeAnchorForceN:forceN,receivingCoreWrenchN_Nm:wrench(pipeAnchorOriginMm,forceN,wallOriginMm),
     interpretation:thermalSign===0?'Ideal frictionless sliding-guide/one-anchor reference; actual tube flexibility, endpoint constraints and clamp friction NOT solved.':'Fully locked straight-tube comparator applied at the independent pipe-anchor, not accepted valve-body loading.',
     requiredAbsoluteAxialN:Math.abs(forceN[2]),publishedClampAxialReferenceN:settings.clamp.publishedFaZN,
     forceToCatalogueReferenceRatio:Math.abs(forceN[2])/settings.clamp.publishedFaZN,
     installedResistanceOrCapacityClaim:false}
   }))
  return{id:branch.id,wallOriginMm,pipeAnchorOriginMm,sourceGravityWrenchN_Nm:sourceWrench,guideGravityWrenchN_Nm:guideWrench,gravityClosureN_Nm:closure,
   ...(jacket.density===8000&&insulation===200?{segmentSources,guidePoints:uniqueGuides}:{fullSpatialRowsRetainedInSteel8000Insulation200Reference:true}),
   unqualifiedGuidePointCount:uniqueGuides.length,bankGuideGravityN,nominalValveGravityN,localRepresentedGravityN:localGravityN,
   nominalValveXYCentroidQualified:false,carrierClampsJacketsFittingsAndToolsMassComplete:false,
   unknownInsulationMass:insulation===null,cases,
   localGravityScope:'Two actual adjacent120mm tail half-spans plus6kg valve reference. Remaining route gravity is explicitly assigned to unqualified independent guide receivers, never silently onto bank/pan/shield.'}
 })
 return{jacket,insulationDensityKgM3:insulation,insulationProductSelected:false,
  jacketMassKg:totalLengthM*jacketAreaM2*jacket.density,
  insulationMassKg:insulation===null?null:totalLengthM*insulationAreaM2*insulation,
  representedRouteAndNominalValveMassKg:routes.straightCopperStockComparisonKg+routes.maximumStraightPipeWaterComparisonKg+12+totalLengthM*jacketAreaM2*jacket.density+(insulation===null?0:totalLengthM*insulationAreaM2*insulation),
  completeInstalledMass:false,branches}
}))
const result={schema:'had-bank-carrier-recovery-exploration/1',state:'recovery-only-not-current-design-or-resistance',source:settings.source,
 method:{path:'project/had/studies/inlet-bank-carrier-probe.mjs',sha256:hash(read('project/had/studies/inlet-bank-carrier-probe.mjs'))},
 authoringCase:settings,datum:{groundFflMm:ffl,wallCoreYMm:wall.coreYMm,wallFinishedFacesYMm:room.northWallFacesYMm,geometricReferenceToShieldIsNotLoadSharing:true},
 volume:{totalVirtualCentrelineLengthM:totalLengthM,pipeODMm:pipeOD,insulatedODMm:insulatedOD,jacketODMm:jacketOD,
  jacketM3:jacketAreaM2*totalLengthM,insulationM3:insulationAreaM2*totalLengthM,cutLengthsFittingsAndEndsQualified:false},
 pressure:{sourceGaugeComparisonBar:pressureGaugeBar,maximumBoreMm:pressureBoreMm,oneSignedColdSourceCutN:pressureN,
  storedBackfeedPressureBoundQualified:false,flowMomentumOrTransientQualified:false},
 thermal:{lockedReferenceN:routes.completelyLockedStraightTubeAxialComparisonN,referenceDeltaK:40,
  lockedToPublished1700NClampRatio:routes.completelyLockedStraightTubeAxialComparisonN/settings.clamp.publishedFaZN,
  lockedClampArrangementRejected:true,moreClampsNotUsedToConcealMissingFlexibility:true,actualCoupledReactionSolved:false},
 scenarios,
 physicalBoundaries:{valveExternalPipingStressAcceptance:false,actualClampOn28point1ThinCopperAndSignedLoadQualified:false,
  actualClampFullEnvelopeTorqueAndMaterialQualified:false,bearingShelfOrValveMetalLandInvented:false,
  opposedCoreSpreaderPlateGroupAndWallTransferQualified:false,finishPanShieldOrWalkingCoverSupportCredited:false,
  sourceGroundOr52HeadActionsUpdated:false,installedOrWholeRoomAccepted:false}}
if(process.argv.includes('--check'))assert.equal(read('project/had/studies/inlet-bank-carrier-probe.json').toString(),JSON.stringify(result,null,2)+'\n')
else writeFileSync(new URL('project/had/studies/inlet-bank-carrier-probe.json',root),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({jacketM3:result.volume.jacketM3,insulationM3:result.volume.insulationM3,lockedRatio:result.thermal.lockedToPublished1700NClampRatio,scenarios:scenarios.length,allGuideForceAndMomentChecks:true}))
