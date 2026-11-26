import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {inletEntrySideCuts} from './current-design/inlet-indoor-cuts.js'
import {inletUtilityRoute,type UtilityRouteChoice} from './current-design/inlet-utility-route.js'
import {readInletCornerContext,utilityCornerBoundary,runUtilityCornerHost} from './current-design/inlet-utility-corner.js'
import type {IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
const receipt=read('project/had/studies/inlet-source-envelope.results.json'),old=receipt.joinedDirection.room,rawRoutes=old.indoorRoutes,
 water=read('project/had/studies/water-replan.json').model,services=read('project/had/studies/current-house-services.json'),
 source=read('project/had/studies/south-inlet-under-sill.json'),saved=read('project/ccr/studies/working-house-comparison.json'),
 choice=read('project/had/studies/inlet-utility-west-route.json') as UtilityRouteChoice,
 stage=saved.stages.distributedFloor,context=readInletCornerContext(stage.cornerWidthsMm.SE,sha256SemanticFingerprint(stage)),
 boundary=utilityCornerBoundary(context,old.wetUtilityPlanMm,water.internalArchControls.actualRadialFinish),
 host=runUtilityCornerHost(context,water.internalArchControls.actualRadialFinish,source.branches.find((v:any)=>v.id==='utility').coordinates.at(-1)),
 station={bankXMm:10030,bankYMm:2050,utilityAxisZMm:1270,plantAxisZMm:receipt.settings.indoorPlantAxisZMm,
  operatorXYZMm:[10530,2600,1450] as P,tailOffsetMm:330},body=station.operatorXYZMm,
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
if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'west-route-geometry.json'),JSON.stringify({scope:'Fresh source-geometry fixture; not full saved-document compiler, global source audit, support or installation acceptance.',savedDistributedFloor:stage,context,boundary,host,station,cuts,result},null,2))}
console.info('WEST_STATION_ACTUAL_CHECKS '+JSON.stringify({station,minima:result.geometry.minimumByKind,failures:result.geometry.failures,quantity:result.quantities,hydraulics:result.hydraulics}))
test('the complete west station geometry has fresh actual source, SE host, valve and ordinary-access checks',()=>{
 assert.equal(stage.cornerWidthsMm.SE,200)
 assert.equal(host.necessaryGeometryComparisons,true)
 assert.deepEqual(result.paths[0].virtualPointsMm[0],source.branches.find((v:any)=>v.id==='utility').coordinates[2])
 assert.deepEqual(result.paths[1].virtualPointsMm.at(-1),[10760,1250,1000])
 assert.deepEqual(result.valve.axisMm,[10030,2050,1270])
 assert.equal(result.valve.stem,'horizontal-north')
 assert.equal(result.topology.oldCoLocatedPlantBankRetired,true)
 assert.equal(result.completeInstallationAccepted,false)
 assert.equal(result.geometry.necessaryActualUtilityGeometry,true,JSON.stringify(result.geometry.failures))
})
test('fresh west result exposes rather than conceals inherited output or unjoined renewal obligations',()=>{
 const inheritedWestGrips=result.valve.grips.some(g=>g.pointMm[0]<station.bankXMm-100)
 console.info('WEST_STATION_PENDING_JOINS '+JSON.stringify({inheritedWestGrips,receiverAndHostSequenceJoined:false,hostCrewFinal:host.states.crew.map((p:number[][])=>p.at(-1)),receiverRequirement:{rotation:'north-south',widthMm:receipt.settings.indoorClampWidthMm,coverHeightMm:receipt.settings.indoorClampHeightMm+52,tailOffsetMm:station.tailOffsetMm},completeInstallationAccepted:result.completeInstallationAccepted}))
 assert.equal(result.renewal.allNewRouteAndSupportRenewalQualified,false)
 assert.equal(result.support.actualIndependentGuidesAndAnchorsDesigned,false)
 // A recovered WIP output still exposes the inherited west-grip list. This is
 // an observed defect to correct, never a passed north-wheel assembly claim.
 assert.equal(inheritedWestGrips,true)
})
