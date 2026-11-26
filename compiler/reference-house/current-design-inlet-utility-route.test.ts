import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {inletUtilityRoute,admitUtilityRouteChoice,type UtilityRouteChoice} from './current-design/inlet-utility-route.js'
import type {IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const json=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8')),
 receipt=json('project/had/studies/inlet-source-envelope.results.json'),room=receipt.joinedDirection.room,r=room.indoorRoutes,cuts=room.indoorCuts,
 source=json('project/had/studies/south-inlet-under-sill.json'),choice=json('project/had/studies/inlet-utility-north-route.json') as UtilityRouteChoice,
 input:IndoorRoutesInput={roomPlanMm:r.roomPlanMm,bankMm:[cuts.authoredChoices.bankXMm,cuts.authoredChoices.bankYMm],utilityAxisZMm:cuts.authoredChoices.utilityAxisZMm,plantAxisZMm:cuts.authoredChoices.plantAxisZMm,...r.authoredRouteGeometry,
  utilitySourcePathMm:source.branches[0].coordinates,plantSourcePathMm:source.branches[1].coordinates,plantTransferMm:receipt.joinedDirection.transfer.pathMm,groundFflMm:cuts.groundStage.fflMm,ceilingMm:3100,
  utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,
  networkAllowancesBar:[receipt.settings.utilityNetworkLossBar,receipt.settings.plantNetworkLossBar],comparison:r.authoredComparison,obstacles:r.checkedObstacles},
 run=(i=input,ch=choice)=>inletUtilityRoute({choice:ch,input:i,cuts,retained:r.retainedServiceComparison.services})
test('complete joined geometry rejects the narrow north feed after both settings, despite its bare pipe fit',()=>{
 const a=run()
 assert.equal(a.geometry.necessaryActualUtilityGeometry,false)
 assert.ok(a.geometry.failures.some(v=>v.kind==='valve-obstacle'&&v.id.includes('shield-connection-1')&&Math.abs(v.reserveMm+5.5)<1e-8))
 assert.ok(a.geometry.failures.some(v=>v.kind==='corner-obstacle'&&v.id.includes('complete-shifted-utility-maintenance')))
 assert.equal(a.geometry.twoIndependentSettingsMm,20)
 assert.ok(a.geometry.minimumByKind.find(v=>v.kind==='ordinary-arm')!.reserveMm>50)
 assert.equal(a.completeInstallationAccepted,false)
})
test('the formed final sweep uses its real circular tube, exact length/centroid and after-forming material bounds',()=>{
 const a=run(),p=a.paths.find(p=>p.id==='utility/downstream')!,arc=p.corners.find(v=>v.kind==='factory-formed-copper-sweep')!,
  stock=a.stock.find(v=>v.id.endsWith('/formed-stock'))!
 assert.ok(Math.abs(arc.arcLengthMm-112*Math.PI/2)<1e-10)
 assert.ok(arc.arcMm!.every(v=>Math.abs(v[1]-1250)<1e-10&&v[0]<=10760&&v[2]<=2250))
 assert.ok(Math.abs(stock.centroidMm[0]-(10648+112*2/Math.PI))<1e-10)
 assert.ok(Math.abs(stock.centroidMm[2]-(2138+112*2/Math.PI))<1e-10)
 assert.ok(a.geometry.formedMaximumChordCoverMm>0&&a.geometry.formedMaximumChordCoverMm<.005)
 assert.ok(a.geometry.checks.filter(v=>v.id.startsWith(arc.id)&&v.id.includes('actual-retained-hot-backbone')).every(v=>v.reserveMm>27.14))
 assert.equal(a.hydraulics.minimumAuthoredBoreMm,24.9)
 assert.equal(a.procurement.cataloguePartSelected,false)
 assert.equal(a.hydraulics.formedBendLossCoefficientQualified,false)
 const virtualLength=p.virtualPointsMm.slice(1).reduce((n,v,k)=>n+Math.hypot(...v.map((x,j)=>x-p.virtualPointsMm[k][j])),0)
 assert.ok(Math.abs(p.centrelineLengthMm-virtualLength+112*(2-Math.PI/2))<1e-8)
})
test('geometry, source connection, pressure, density and absolute ground perturbations propagate independently',()=>{
 const a=run(),raised=run({...input,groundFflMm:input.groundFflMm+530}),pressured=run({...input,maximumGaugeBar:input.maximumGaugeBar*1.1}),dense=run({...input,comparison:{...input.comparison,jacketDensityKgM3:16000}})
 assert.equal(a.quantities.centrelineLengthMm,raised.quantities.centrelineLengthMm)
 a.stock.forEach((s,k)=>assert.equal(raised.stock[k].absoluteOriginMm[2],s.absoluteOriginMm[2]+530))
 assert.ok(dense.quantities.referenceMassKg>a.quantities.referenceMassKg)
 a.pressureCorners.forEach((v,k)=>v.fullGaugeWrenchN_Nm.forEach((n,j)=>assert.ok(Math.abs(pressured.pressureCorners[k].fullGaugeWrenchN_Nm[j]-n*1.1)<1e-7)))
 const changed=structuredClone(choice);(changed.upstreamVirtualCornersMm.at(-1)! as unknown as number[])[0]++
 assert.throws(()=>run(input,changed),/flange tail/)
 for(const mutate of [(v:any)=>v.extra=true,(v:any)=>v.formedTurn.minimumWallAfterFormingMm=.9,(v:any)=>v.formedTurn.minimumOuterDiameterAfterFormingMm=27,(v:any)=>v.formedTurn.centrelineRadiusMm=56]){
  const bad=structuredClone(choice);mutate(bad);assert.throws(()=>admitUtilityRouteChoice(bad),/Unsupported/)
 }
})
