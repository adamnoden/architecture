import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {compareInletRouteThermal} from './current-design/inlet-fixed-thermal.js'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {inletEntrySideCuts} from './current-design/inlet-indoor-cuts.js'
import {inletUtilityRoute,inletUtilityFixedEnvelopes,compareInletUtilityPurge,type UtilityRouteChoice} from './current-design/inlet-utility-route.js'
import {readInletCornerContext,utilityCornerBoundary,runUtilityCornerHost} from './current-design/inlet-utility-corner.js'
import type {IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
const receipt=read('project/had/studies/inlet-source-envelope.results.json'),old=receipt.joinedDirection.room,rawRoutes=old.indoorRoutes,
 water=read('project/had/studies/water-replan.json').model,services=read('project/had/studies/current-house-services.json'),
 source=read('project/had/studies/south-inlet-under-sill.json'),saved=read('project/ccr/studies/working-house-comparison.json'),
 choice=read('project/had/studies/inlet-utility-compact-route.json') as UtilityRouteChoice,
 stage=saved.stages.distributedFloor,context=readInletCornerContext(stage.cornerWidthsMm.SE,sha256SemanticFingerprint(stage)),
 boundary=utilityCornerBoundary(context,old.wetUtilityPlanMm,water.internalArchControls.actualRadialFinish),
 host=runUtilityCornerHost(context,water.internalArchControls.actualRadialFinish,source.branches.find((v:any)=>v.id==='utility').coordinates.at(-1)),
 station={bankXMm:9550,bankYMm:1600,utilityAxisZMm:1175,plantAxisZMm:receipt.settings.indoorPlantAxisZMm,
  operatorXYZMm:[9950,1720,1450] as P,tailOffsetMm:330},body=station.operatorXYZMm,
 plantWall=water.groundWalls.find((v:any)=>v.id==='plant-intermediate-arch'),
 frameCovers=rawRoutes.checkedObstacles.filter((v:any)=>v.id.includes('shield-connection')).map((v:any)=>v.boxMm as B),
 retainedFurniture=Object.fromEntries(Object.entries(old.retainedFurniture).filter(([id])=>id!=='service-utility-valveBay').map(([id,p])=>[id,id==='service-utility-sink'?host.revisedUtility.sink:id==='service-utility-rearServiceChase'?host.revisedUtility.rearServiceChase:p])),
 cuts=inletEntrySideCuts({roomPlanMm:old.wetUtilityPlanMm,portalXMm:old.indoorCuts.rawPortalXMm,wallFacesYMm:old.northWallFacesYMm,
  jambFinishMm:water.internalArchControls.actualRadialFinish,shieldPlaneXMm:old.electricalScreen.barrierPlaneMm.x,
  washerFirstRestMm:services.utility.washerFirstRest,maintenancePlanMm:old.indoorCuts.sourceMaintenancePlanMm,maintenanceTopMm:3100,
  frameCoversMm:frameCovers,...station,maintenanceShiftXMm:receipt.settings.indoorMaintenanceShiftXMm,maintenanceShiftYMm:receipt.settings.indoorMaintenanceShiftYMm,
  wheelInboardMm:receipt.settings.indoorWheelInboardMm,utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,
  maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,groundFflMm:530,
  doorHingeNorthOfWallMm:receipt.settings.indoorDoorHingeNorthOfWallMm,plantWall:{facesYMm:plantWall.finishedFaces,openingXMm:plantWall.holes[0]},
  retainedFurniture:retainedFurniture as Record<string,readonly[number,number,number,number]>,protectedDoorOpenLeafMm:water.plantReferenceDoor.fullyOpenEastLeaf}),
 input:IndoorRoutesInput={roomPlanMm:old.wetUtilityPlanMm,bankMm:[station.bankXMm,station.bankYMm],utilityAxisZMm:station.utilityAxisZMm,plantAxisZMm:station.plantAxisZMm,
  tailOffsetMm:station.tailOffsetMm,utilityReturnXMm:9820,westernReturnXMm:9700,utilitySourcePathMm:source.branches.find((v:any)=>v.id==='utility').coordinates,
  plantSourcePathMm:source.branches.find((v:any)=>v.id==='plant').coordinates,plantTransferMm:receipt.joinedDirection.transfer.pathMm,groundFflMm:530,ceilingMm:3100,
  utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,
  networkAllowancesBar:[receipt.settings.utilityNetworkLossBar,receipt.settings.plantNetworkLossBar],comparison:rawRoutes.authoredComparison,
  obstacles:[...rawRoutes.checkedObstacles.filter((o:any)=>!o.id.startsWith('actual-native-SE-')).map((o:any)=>o.id==='ordinary-operator-body-and-approach'?{id:o.id,boxMm:[body[0]-300,Math.min(...cuts.ordinaryOperator.approachMm.map(p=>p[1]))-300,0,600,Math.abs(cuts.ordinaryOperator.approachMm[1][1]-cuts.ordinaryOperator.approachMm[0][1])+600,2000] as B}:o.id==='retained-sink-conservative2000-high-envelope'?{id:o.id,boxMm:[host.revisedUtility.sink[0],host.revisedUtility.sink[1],0,host.revisedUtility.sink[2],host.revisedUtility.sink[3],2000] as B}:o),
   ...boundary.finishedCoreRectanglesXYMm.map((r,k)=>({id:'actual-native-SE-finished-return/'+k,boxMm:[r[0],r[1],0,r[2]-r[0],r[3]-r[1],3100] as B}))]},
 result=inletUtilityRoute({choice,input,cuts,retained:rawRoutes.retainedServiceComparison.services})
const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'compact-route-geometry.json'),JSON.stringify({scope:'Fresh source-geometry fixture; not full saved-document compiler, global source audit, support or installation acceptance.',savedDistributedFloor:stage,context,boundary,host,station,cuts,result},null,2))}
console.info('COMPACT_EXISTING_PURGE_DUTY '+JSON.stringify(old.purge))
console.info('COMPACT_WEST_WALL_ACTUAL_CHECKS '+JSON.stringify({station,minima:result.geometry.minimumByKind,failures:result.geometry.failures,quantity:result.quantities,hydraulics:result.hydraulics}))
test('compact west-wall main keeps internal isolation with an actual unobstructed ordinary path before washer pull',()=>{
 assert.equal(stage.cornerWidthsMm.SE,200)
 assert.equal(host.necessaryGeometryComparisons,true)
 assert.deepEqual(result.valve.axisMm,[9550,1600,1175])
 assert.equal(result.valve.flowAxis,'north-south')
 assert.equal(result.valve.stem,'vertical-up')
 assert.deepEqual(result.paths[0].virtualPointsMm.at(-1),[9550,1450,1175])
 assert.deepEqual(result.paths[1].virtualPointsMm[0],[9550,1750,1175])
 assert.deepEqual(result.paths[1].virtualPointsMm.at(-1),[10760,1250,1000])
 assert.equal(result.geometry.necessaryActualUtilityGeometry,true,JSON.stringify(result.geometry.failures))
 assert.equal(result.ordinaryAccess.washerState,'home-before-first-pull')
 assert.equal(result.ordinaryAccess.availableWhileWasherAtFirstRest,false,'Isolation is deliberately BEFORE washer first pull; the occupied rest is not silently removed from that different state.')
 assert.equal(result.ordinaryAccess.legacyDoorAfterPathNotInherited,true)
 assert.ok(result.hydraulics.minimumValveKvRequiredByExistingBudget!<2.5)
 assert.ok(result.hydraulics.allowanceReserveBar>0)
 assert.equal(result.valve.nominalValveKg,null)
 assert.equal(result.valve.maximumDryModuleKg,4)
 assert.equal(result.procurement.actualCompactManufacturerKvAndMassKnown,false)
 assert.equal(result.completeInstallationAccepted,false)
})
test('unprocured Kv and mass are explicit design conditions; adverse valve duty or geometry never inherits a pass',()=>{
 const weak=structuredClone(choice);weak.valveDesign!.minimumFullOpenKvM3h=1
 const bad=inletUtilityRoute({choice:weak,input,cuts,retained:rawRoutes.retainedServiceComparison.services})
 assert.equal(bad.geometry.necessaryActualUtilityGeometry,false)
 assert.ok(bad.geometry.failures.some(v=>v.kind==='hydraulics'))
 const heavier=structuredClone(choice);heavier.valveDesign!.maximumDryModuleKg=8
 const heavy=inletUtilityRoute({choice:heavier,input,cuts,retained:rawRoutes.retainedServiceComparison.services})
 assert.ok('designGravityUpperN' in heavy.valve&&'designGravityUpperN' in result.valve)
 assert.equal(heavy.valve.designGravityUpperN,2*result.valve.designGravityUpperN!)
 assert.equal(heavy.quantities.centrelineLengthMm,result.quantities.centrelineLengthMm)
 const wide=structuredClone(choice);wide.valveDesign!.maximumBareModuleMm=[160,300,90]
 const blocked=inletUtilityRoute({choice:wide,input,cuts,retained:rawRoutes.retainedServiceComparison.services})
 assert.equal(blocked.geometry.necessaryActualUtilityGeometry,false)
 assert.ok(blocked.geometry.failures.some(v=>v.kind==='valve-obstacle'))
})

const hostWithMain=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL('../../project/had/studies/utility-corner-host.py',import.meta.url))],{
 input:JSON.stringify({geometry:context.geometry,liningThicknessMm:27,waterTerminalLocalMm:[10760,1250,1000],utilityMainEnvelopes:inletUtilityFixedEnvelopes(result)}),encoding:'utf8',maxBuffer:4*1024*1024})),
 up=result.paths.find(p=>p.id==='utility/upstream')!.physicalPolylineMm.slice().reverse() as P[],
 down=result.paths.find(p=>p.id==='utility/downstream')!.physicalPolylineMm as P[],
 pipe={outerDiameterMm:28.1,wallMm:1.38,elasticModulusMpa:117200,poissonRatio:.34,expansionMmMK:.017},
 thermalUp=compareInletRouteThermal({pathMm:up,fixedPointMm:up[0],guide:{pointMm:[10300,1000,965],freeAxisMm:[0,1,0]},pipe,temperatureExcursionK:receipt.settings.pipeTemperatureChangeK}),
 thermalDown=compareInletRouteThermal({pathMm:down,fixedPointMm:down[0],guide:{pointMm:[9550,1900,1350],freeAxisMm:[0,0,1]},pipe,temperatureExcursionK:receipt.settings.pipeTemperatureChangeK})
console.info('COMPACT_IAS_HOST_JOIN '+JSON.stringify(hostWithMain.independentUtilityMainJoin))
console.info('COMPACT_THERMAL_COMPARISONS '+JSON.stringify({upstream:thermalUp,downstream:thermalDown}))
if(dir){writeFileSync(join(dir,'compact-host-main-join.json'),JSON.stringify(hostWithMain,null,2));writeFileSync(join(dir,'compact-thermal-comparisons.json'),JSON.stringify({upstream:thermalUp,downstream:thermalDown},null,2))}
test('same actual permanent compact main and covered pipes preserve existing IAS frame/carrier/crew geometry criteria',()=>{
 const joined=hostWithMain.independentUtilityMainJoin
 assert.equal(joined.necessaryKnownNominalGeometry,true,JSON.stringify(joined))
 assert.ok(joined.minimumNominalGapMm>=25)
 assert.ok(joined.afterTwoIndependent10mmSettingsMm>=0)
 assert.equal(joined.actualConnectionsAndCompleteInstalledHandlingAccepted,false)
})
test('explicit horizontal/vertical guides use the same kernel in actual world axes and retain the seized straight challenge',()=>{
 for(const q of [thermalUp,thermalDown]){
  const u=q.uniform,forces=[u.fixedForceN,u.terminalForceN,u.guideForceN],cross=(a:readonly number[],b:readonly number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
   lever=(p:readonly number[])=>p.map((v,k)=>v-q.fixedPointMm[k]),tm=cross(lever(q.terminalPointMm),u.terminalForceN),gm=cross(lever(q.guide!.pointMm),u.guideForceN)
  assert.ok(forces.every(v=>v.every(Number.isFinite)))
  for(let k=0;k<3;k++){
   assert.ok(Math.abs(forces.reduce((n,f)=>n+f[k],0))<1e-5,'World forces close independently of the route stiffness.')
   assert.ok(Math.abs(u.fixedMomentNmm[k]+u.terminalMomentNmm[k]+tm[k]+gm[k])<1e-3,'Moments about the actual fixed point close with all guide lever arms.')
  }
  assert.ok(Math.abs(q.guide!.freeAxisMm.reduce((n,v,k)=>n+v*u.guideForceN[k],0))<1e-7)
 }
 assert.ok(thermalUp.whollyRestrainedStraightControl.forceN>9000)
 assert.ok(Math.abs(thermalUp.whollyRestrainedStraightControl.stressMPa-79.696)<1e-7)
 const wrongAxis=compareInletRouteThermal({pathMm:[[0,0,0],[0,850,0],[530,850,0]],fixedPointMm:[0,0,0],guide:{pointMm:[0,450,0],freeAxisMm:[0,0,1]},pipe,temperatureExcursionK:40})
 assert.ok(Math.max(...wrongAxis.independentSegmentBounds.fixedForceN)>9000,'Separate straight restrained segment control: a wrong vertical guide on a horizontal straight segment retains its axial expansion challenge; this is not the new loop's response.')
 assert.throws(()=>compareInletRouteThermal({pathMm:up,fixedPointMm:up[0],guide:{pointMm:[10300,1000,966],freeAxisMm:[0,1,0]},pipe,temperatureExcursionK:40}),/actual straight route/)
 const zero=compareInletRouteThermal({pathMm:down,fixedPointMm:down[0],guide:{pointMm:[9550,1900,1350],freeAxisMm:[0,0,1]},pipe,temperatureExcursionK:0})
 assert.ok(zero.independentSegmentBounds.fixedForceN.every(v=>v===0))
 assert.equal(thermalDown.actualJointGuideNetworkStiffnessAndFrictionQualified,false)
 assert.equal(thermalDown.guideFreeTravelIncludingBendingSolved,false)
})

const purgeJoin=compareInletUtilityPurge(result,old.purge)
console.info('COMPACT_CURRENT_PURGE_JOIN '+JSON.stringify({minima:purgeJoin.minimumByKind,failures:purgeJoin.failures.slice(0,8),failureCount:purgeJoin.failures.length}))
if(dir)writeFileSync(join(dir,'compact-current-purge-join.json'),JSON.stringify(purgeJoin,null,2))
test('same actual compact main preserves current standing purge body, articulated arms, leaves and stay task',()=>{
 assert.equal(purgeJoin.necessaryKnownPurgeGeometry,true,JSON.stringify(purgeJoin.minimumByKind))
 const low=structuredClone(choice);low.upstreamVirtualCornersMm=[[10080,600,1175],[9550,600,1175]]
 const rejected=compareInletUtilityPurge(inletUtilityRoute({choice:low,input,cuts,retained:rawRoutes.retainedServiceComparison.services}),old.purge)
 assert.equal(rejected.necessaryKnownPurgeGeometry,false)
 assert.ok(rejected.failures.some(r=>r.kind==='purge-body'&&r.afterTwoSettingsMm< -100))
 assert.equal(purgeJoin.completeInstalledWindowAndPipeAcceptance,false)
})


test('full same pipe/fitting envelopes preserve source upright washer sweep plus an explicit35mm vertical perturbation',()=>{
 const source=read('project/ias/studies/utility-first-release.json'),sweep=source.geometry.sweep,authoredExtraHeight=35,
  box:B=[sweep[0],sweep[1],0,sweep[2],sweep[3],source.native.height+authoredExtraHeight],
  gap=(a:readonly number[],b:readonly number[])=>{const g=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return g.some(v=>v>0)?Math.hypot(...g.map(v=>Math.max(v,0))):Math.max(...g)},
  checks=inletUtilityFixedEnvelopes(result).map(m=>({id:m.id,nominalMm:gap(m.boxMm,box),afterTwoSettingsMm:gap(m.boxMm,box)-result.geometry.twoIndependentSettingsMm})).sort((a,b)=>a.afterTwoSettingsMm-b.afterTwoSettingsMm)
 console.info('COMPACT_UPRIGHT_WASHER_SWEEP '+JSON.stringify({sourceUprightSweepMm:sweep,sourceHeightMm:source.native.height,authoredExtraHeightMm:authoredExtraHeight,minimum:checks[0],completeHandlingAccepted:false}))
 assert.ok(checks[0].afterTwoSettingsMm>=0,JSON.stringify(checks[0]))
})
