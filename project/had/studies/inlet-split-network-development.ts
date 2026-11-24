/** Explicit incomplete split-network development, using existing shared methods.
 * The Plant route remains a co-located control, never a solved split-room route. */
import assert from 'node:assert/strict'
import {createHash}from'node:crypto'
import {readFileSync,writeFileSync}from'node:fs'
import {fileURLToPath}from'node:url'
import {readCurrentDesignResolution}from'../../../compiler/reference-house/current-design/resolve.js'
import {readInletSourceEnvelopeCase,runInletSourceEnvelopeCase}from'../../../compiler/reference-house/current-design/inlet-source-envelope.js'
import {compareInletIndoorRouteCandidate,inletRouteOperation,inletRouteRetainedServices,type IndoorRoutesInput}from'../../../compiler/reference-house/current-design/inlet-indoor-routes.js'
import {inletBankReceiver}from'../../../compiler/reference-house/current-design/inlet-bank-receiver.js'
import {deriveUtilityWideCapture}from'./utility-wide-capture.mjs'
const read=(name:string)=>JSON.parse(readFileSync(new URL(name,import.meta.url),'utf8'))
const point=(p:readonly number[])=>{if(p.length!==3||!p.every(Number.isFinite))throw Error('Unsupported physical point');return[p[0],p[1],p[2]] as const}
const sourceBlob=(name:string)=>{const b=readFileSync(new URL(name,import.meta.url));return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex')}
type Choice={id:string;descentXMm:number;descentYMm:number;highRouteZMm:number;hotRiserXMm:number}
export function runSplitNetworkDevelopment(){
 const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),nominal=runInletSourceEnvelopeCase(resolved,request.sourceEnvelope),room=nominal.joinedDirection.room,r=room.indoorRoutes,c=room.indoorCuts,
  native=read('south-inlet-under-sill.json'),choices=read('inlet-split-network-development.json'),expected=[c.authoredChoices.bankXMm,c.authoredChoices.bankYMm,c.authoredChoices.utilityAxisZMm]
 if(!choices||Object.keys(choices).sort().join(',')!=='cases,expectedUtilityBankMm,schema'||choices.schema!=='had-split-network-development/1'||!Array.isArray(choices.cases)||!choices.cases.length||new Set(choices.cases.map((v:{id:string})=>v?.id)).size!==choices.cases.length||JSON.stringify(choices.expectedUtilityBankMm)!==JSON.stringify(expected))throw Error('Unsupported changed Utility station; explicit candidate needs reconciliation')
 if(!r.candidateComparison.comparison)throw Error('Unsupported retained-service basis; current source candidate needs reconciliation')
 const input:IndoorRoutesInput={roomPlanMm:r.roomPlanMm,bankMm:[expected[0],expected[1]],utilityAxisZMm:expected[2],plantAxisZMm:c.authoredChoices.plantAxisZMm,...r.authoredRouteGeometry,
  utilitySourcePathMm:native.branches[0].coordinates,plantSourcePathMm:native.branches[1].coordinates,plantTransferMm:nominal.joinedDirection.transfer.pathMm.map(point),groundFflMm:c.groundStage.fflMm,ceilingMm:3100,
  utilityLmin:nominal.settings.requiredUtilityLmin,plantLmin:nominal.settings.requiredPlantLmin,maximumGaugeBar:nominal.bound.maximumAbsoluteTotalBar-nominal.settings.atmosphericMinimumBar,
  networkAllowancesBar:[nominal.settings.utilityNetworkLossBar,nominal.settings.plantNetworkLossBar],comparison:r.authoredComparison,obstacles:r.checkedObstacles}
 const cases=(choices.cases as Choice[]).map(choice=>{
  if(!choice||Object.keys(choice).sort().join(',')!=='descentXMm,descentYMm,highRouteZMm,hotRiserXMm,id'||typeof choice.id!=='string'||!choice.id||![choice.descentXMm,choice.descentYMm,choice.highRouteZMm,choice.hotRiserXMm].every(Number.isFinite))throw Error('Unsupported split-network development choice')
  const x=choice.descentXMm,y=choice.descentYMm,z=choice.highRouteZMm,original=r.paths.find(p=>p.id==='utility/upstream')!,
   candidate={schema:'had-indoor-route-candidate/1' as const,paths:r.paths.map(p=>({id:p.id,pointsMm:(p.id===original.id?[p.pointsMm[0],[p.pointsMm[0][0],p.pointsMm[0][1],z],[x,p.pointsMm[0][1],z],[x,y,z],[x,y,1020],[11360,y,1020],[11360,2350,1020],p.pointsMm.at(-1)!]:p.pointsMm).map(point)}))},
   route=compareInletIndoorRouteCandidate(input,candidate),operation=inletRouteOperation(route,c),bank=inletBankReceiver({routes:route,cuts:c,wallCoreYMm:room.bankReceiver.datum.wallCoreYMm,settings:room.bankReceiver.settings}),
   wide=deriveUtilityWideCapture({hotRiserXMm:choice.hotRiserXMm}),services=structuredClone(r.candidateComparison.comparison!.retained.services),utility=route.paths.filter(p=>p.id.startsWith('utility/'))
  services.paths.find(p=>p.id==='actual-retained-hot-backbone')!.pointsMm=wide.hot.backbone
  services.paths.find(p=>p.id==='actual-retained-hot-terminal')!.pointsMm=wide.hot.terminal
  services.boxes.find(p=>p.id==='actual-hot-H0-body')!.boxMm=wide.hot.body
  const retained=inletRouteRetainedServices({...route,paths:utility},services),larger=inletRouteRetainedServices({...route,paths:utility,pipe:{...route.pipe,settingEachPipeMm:20}},services),
   largerBank=inletBankReceiver({routes:{...route,pipe:{...route.pipe,settingEachPipeMm:20}},cuts:c,wallCoreYMm:room.bankReceiver.datum.wallCoreYMm,settings:room.bankReceiver.settings}),uReceivers=bank.receivers.filter(v=>v.branch==='utility'),u=route.branches.find(v=>v.id==='utility')!
  return{id:choice.id,authoredChoice:choice,utilityPaths:candidate.paths.filter(p=>p.id.startsWith('utility/')),utilityBranchBudget:u,
   utilityLoadInventory:utility.map(p=>({id:p.id,stock:p.stock,corners:p.corners})),
   utilityValveReference:c.valves.find(v=>v.branch==='utility'),
   thermalReferences:{temperatureChangeK:input.comparison.temperatureChangeK,freePlusComparisonMm:u.freeAxialThermalExpansionMm,freeMinusComparisonMm:-u.freeAxialThermalExpansionMm,completelyLockedStraightTubePlusN:route.completelyLockedStraightTubeAxialComparisonN,completelyLockedStraightTubeMinusN:-route.completelyLockedStraightTubeAxialComparisonN,
    actualIndependentSegmentTemperaturesAndSupportsQualified:false,interpretation:'Existing uniform-temperature free/locked straight-tube comparisons only; neither bounds actual flexible routed valve, joint or capture reactions.'},
   actualMaximumGaugeBar:input.maximumGaugeBar,sourceFedFaultBoundsLmin:nominal.branches.map(b=>({id:b.id,maximum:b.maximumLimitedEachLmin})),
   ordinaryUtilityArm:operation.armChecks.find(v=>v.valve==='utility'),utilityValveFailures:operation.valveChecks.filter(v=>v.path.startsWith('utility/')&&v.valve==='utility'&&v.reserveMm<0),
   utilityCornerValveFailures:operation.cornerValveChecks.filter(v=>v.corner.includes('/utility/')&&v.valve==='utility'&&v.reserveMm<0),
   fullCoLocatedControlDiagnostics:route.diagnostics,
   utilityFittingFailures:{obstacles:route.cornerTerritory.perObstacle.filter(v=>v.corner.includes('/utility/')&&v.reserveMm<0),otherUtilityPipe:route.cornerTerritory.perOtherPipe.filter(v=>v.corner.includes('/utility/')&&v.path.startsWith('utility/')&&v.reserveMm<0),otherUtilityCorner:route.cornerTerritory.perOtherCorner.filter(v=>v.a.includes('/utility/')&&v.b.includes('/utility/')&&v.reserveMm<0)},
   utilityRouteObstacles:utility.map(p=>({id:p.id,roomReserveAfterOne10mmSetting:p.roomReserveAfterSettingMm,obstacles:p.obstacles.filter(v=>v.afterJacketAndSettingMm<0)})),
   retainedMinima:retained.minimumByObstacle,retainedDiagnostics:retained.diagnostics,
   receiverPipes:uReceivers.map(v=>({id:v.id,closest:v.minimumOtherBranchPipe,necessaryFiniteClampTerritory:v.necessaryFiniteClampTerritory})),
   larger20mmSettingAdverse:{retainedMinima:larger.minimumByObstacle,receiverPipes:largerBank.receivers.filter(v=>v.branch==='utility').map(v=>({id:v.id,closest:v.minimumOtherBranchPipe,necessaryFiniteClampTerritory:v.necessaryFiniteClampTerritory})),roomReserveMm:Math.min(...utility.map(p=>p.roomReserveAfterSettingMm))-10},
   fullHotAssemblyComparison:wide,priorH0MaxX10880Mm:wide.hot.body[0]+wide.hot.body[3]<=10880,
   independentSourceStoreReliefColdReplacementAndPhysicalCaptureQualified:false,actualSplitPlantRoutesAndFullNetworkSupportQualified:false,selected:false}
 })
 return{schema:'had-split-network-development-result/1',source:nominal.source,developmentSources:Object.fromEntries(['inlet-split-network-development.ts','inlet-split-network-development.json','utility-wide-capture.mjs'].map(p=>[p,sourceBlob(p)])),authoredChoices:choices,
  scope:'Utility route-only counterfactual toward split rooms. Plant paths remain historical co-located current controls. No split-network fit, mass, force, fault or renewal qualification is inferred.',
  method:'Existing compareInletIndoorRouteCandidate, inletRouteOperation, inletRouteRetainedServices, inletBankReceiver and deriveUtilityWideCapture; no new geometry or structural solver.',cases,
  actualSplitNetworkCurrentSourceAdoption:false,completeOccupiedArrangementQualified:false,selected:false}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const content=JSON.stringify(runSplitNetworkDevelopment(),null,2)+'\n',path=new URL('inlet-split-network-development.results.json',import.meta.url)
 if(process.argv.includes('--write'))writeFileSync(path,content)
 else if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),content)
 else process.stdout.write(content)
}
