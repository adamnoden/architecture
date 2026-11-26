import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {inletUtilityColdService} from './current-design/inlet-utility-service.js'
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
 station={bankXMm:choice.station!.axisMm[0],bankYMm:choice.station!.axisMm[1],utilityAxisZMm:choice.station!.axisMm[2],plantAxisZMm:receipt.settings.indoorPlantAxisZMm,
  operatorXYZMm:choice.station!.ordinaryShoulderMm,tailOffsetMm:330},body=station.operatorXYZMm,
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

const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR,purge=compareInletUtilityPurge(result,old.purge)
if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'rear-main-current-geometry.json'),JSON.stringify({scope:'Current rear main geometry only; old front carrier is retired and no whole-host or support pass is inherited.',context,result,purge},null,2))}
console.info('REAR_MAIN_CURRENT '+JSON.stringify({terminal:result.paths[1].virtualPointsMm.at(-1),quantity:result.quantities,hydraulics:result.hydraulics,minima:result.geometry.minimumByKind,failures:result.geometry.failures,purgeMinima:purge.minimumByKind,purgeFailures:purge.failures.slice(0,8)}))
test('selected rear main replaces old front terminal and derives all tubes/fittings from its own controlling input',()=>{
 assert.deepEqual(result.paths[1].virtualPointsMm.at(-1),[10870,600,950])
 assert.equal(result.topology.sameLegacyTerminal,false)
 assert.equal(result.topology.legacyIndoorTailApplicable,false)
 assert.deepEqual(result.topology.legacyTerminalLocalMm,[10760,1250,1000])
 assert.equal(result.geometry.necessaryActualUtilityGeometry,true,JSON.stringify(result.geometry.minimumByKind))
 assert.equal(purge.necessaryKnownPurgeGeometry,true,JSON.stringify(purge.minimumByKind))
 assert.ok(result.hydraulics.allowanceReserveBar>0)
 assert.equal((choice.coldDistribution as any).carrier,undefined)
 assert.equal(result.completeInstallationAccepted,false)
})
test('rear terminal perturbation changes actual stock, pressure head and old evidence applicability',()=>{
 const altered=structuredClone(choice);altered.terminalLocalMm=[10970,600,950]
 const q=inletUtilityRoute({choice:altered,input,cuts,retained:rawRoutes.retainedServiceComparison.services})
 assert.equal(q.quantities.centrelineLengthMm,result.quantities.centrelineLengthMm+100)
 assert.equal(q.hydraulics.riseBar,result.hydraulics.riseBar)
 assert.notEqual(q.hydraulics.straightLossBar,result.hydraulics.straightLossBar)
 assert.deepEqual(q.paths[1].virtualPointsMm.at(-1),altered.terminalLocalMm)
 const low=structuredClone(choice);low.upstreamVirtualCornersMm=[[10080,600,1175],[9550,600,1175]]
 assert.equal(compareInletUtilityPurge(inletUtilityRoute({choice:low,input,cuts,retained:rawRoutes.retainedServiceComparison.services}),old.purge).necessaryKnownPurgeGeometry,false)
})
test('rear route uses actual thermal world axes and retains the seized support demand',()=>{
 const path=result.paths[1].physicalPolylineMm as P[],pipe={outerDiameterMm:28.1,wallMm:1.38,elasticModulusMpa:117200,poissonRatio:.34,expansionMmMK:.017},
  q=compareInletRouteThermal({pathMm:path,fixedPointMm:path[0],guide:{pointMm:[9550,1900,1350],freeAxisMm:[0,0,1]},pipe,temperatureExcursionK:40})
 if(dir)writeFileSync(join(dir,'rear-main-actual-thermal.json'),JSON.stringify(q,null,2))
 assert.ok(q.whollyRestrainedStraightControl.forceN>9000)
 assert.ok(q.uniform.fixedForceN.every(Number.isFinite))
 assert.equal(q.actualJointGuideNetworkStiffnessAndFrictionQualified,false)
})

const service=inletUtilityColdService({route:result,choice:choice.coldService,roomMm:old.wetUtilityPlanMm,washerReservationMm:services.utility.washerReservation,washerBodyMm:services.utility.washer,washerHeightMm:read('project/ias/studies/utility-first-release.json').native.height,maximumGaugeBar:input.maximumGaugeBar,input,retained:rawRoutes.retainedServiceComparison.services,host})
const servicePurge=compareInletUtilityPurge(result,old.purge,service.normalPermanentEnvelopes)
if(dir)writeFileSync(join(dir,'rear-main-actual-cold-service.json'),JSON.stringify({service,servicePurge},null,2))
console.info('REAR_MAIN_COLD_SERVICE '+JSON.stringify({inventory:service.inventory,failures:service.failures,purge:servicePurge.minimumByKind}))
test('rear source joint uses its real horizontal faces and drains BEFORE separation behind actual local stop boundaries',()=>{
 assert.equal(service.currentTerminalType,'rear-horizontal-source-union')
 assert.equal(service.necessarySpecifiedGeometry,true,JSON.stringify(service.failures))
 assert.equal(servicePurge.necessaryKnownPurgeGeometry,true,JSON.stringify(servicePurge.minimumByKind))
 assert.equal(service.actualCarrierAdditionalBareMembers.length,1)
 assert.equal(service.normalPermanentEnvelopes.some(m=>m.id.includes('terminal-continuation')),false)
 assert.ok(service.inventory.isolatedBranchConservativeCeilingL<20)
 assert.equal(service.inventory.additionalRearTreeInventoryRequiredBeforeWholeBranchReceiverPass,true)
 assert.equal(service.inventory.wholeClosedUInventoryProvedHere,false)
 assert.ok(service.orderedMethod[0].includes('Verify zero pressure before any face release'))
 assert.ok(service.orderedMethod[1].includes('Lower tails can retain cold water'))
 assert.equal(service.drain.wholeInletFullyEmptyClaimed,false)
 assert.equal(service.completeInstallationAccepted,false)
})
