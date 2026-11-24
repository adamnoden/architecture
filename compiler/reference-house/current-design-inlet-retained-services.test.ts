import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {compareInletIndoorRouteCandidate,inletRouteRetainedServices,type IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const receipt=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8')),room=receipt.joinedDirection.room,r=room.indoorRoutes,c=room.indoorCuts,
 source=JSON.parse(readFileSync(new URL('../../project/had/studies/south-inlet-under-sill.json',import.meta.url),'utf8')),
 authored=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-route-candidate.json',import.meta.url),'utf8')),
 input:IndoorRoutesInput={roomPlanMm:r.roomPlanMm,bankMm:[c.authoredChoices.bankXMm,c.authoredChoices.bankYMm],utilityAxisZMm:c.authoredChoices.utilityAxisZMm,plantAxisZMm:c.authoredChoices.plantAxisZMm,...r.authoredRouteGeometry,
  utilitySourcePathMm:source.branches[0].coordinates,plantSourcePathMm:source.branches[1].coordinates,plantTransferMm:receipt.joinedDirection.transfer.pathMm,groundFflMm:c.groundStage.fflMm,ceilingMm:3100,utilityLmin:receipt.settings.requiredUtilityLmin,plantLmin:receipt.settings.requiredPlantLmin,
  maximumGaugeBar:receipt.bound.maximumAbsoluteTotalBar-receipt.settings.atmosphericMinimumBar,networkAllowancesBar:[receipt.settings.utilityNetworkLossBar,receipt.settings.plantNetworkLossBar],comparison:r.authoredComparison,obstacles:r.checkedObstacles}
test('own fitting and whole retained duties reject the reroute despite separate operation/clamp checks',()=>{
 const x=r.candidateComparison
 assert.equal(x.state,'unadopted-explicit-comparison');assert.equal(x.selected,false)
 assert.equal(x.comparison.route.necessaryStraightPipeGeometryAndBudgetComparison,false)
 assert.ok(Math.abs(x.comparison.route.cornerTerritory.minimumSamePathCornerReserveMm+91.03332099679028)<1e-8)
 assert.ok(Math.abs(x.comparison.route.cornerTerritory.minimumSamePathPipeReserveMm+40.566660498623875)<1e-8)
 assert.equal(x.comparison.bank.necessaryRouteOperationAndClampEnvelopeScreen,false)
 assert.equal(x.comparison.bank.routeOperation.necessaryRouteOperationEnvelopeScreen,true)
 assert.deepEqual(x.comparison.bank.diagnostics,[],'unchanged operation/clamp method remains a separate passing control')
 assert.equal(x.comparison.retained.necessaryRetainedServiceEnvelopeScreen,false)
 assert.equal(x.comparison.necessaryJoinedEnvelopeScreen,false)
 const minima=x.comparison.retained.minimumByObstacle
 assert.ok(Math.abs(minima.find((v:any)=>v.obstacle==='actual-retained-hot-backbone').reserveMm+.8582016912242949)<1e-7)
 assert.ok(minima.find((v:any)=>v.obstacle==='complete620mm-head-sweep/1').reserveMm < -103)
 assert.ok(minima.find((v:any)=>v.obstacle==='actual-utility-fan-condensate').reserveMm>2.44)
 assert.equal(x.comparison.completeOccupiedArrangementQualified,false)
 assert.ok(r.retainedServiceComparison.diagnostics.includes('INLET_RETAINED_SERVICE_COLLISION/actual-utility-fan-condensate'))
 const plant=room.bankReceiver.receivers.filter((v:any)=>v.branch==='plant')
 assert.ok(plant.every((v:any)=>v.minimumOtherBranchPipe.path==='plant/upstream'&&v.minimumOtherBranchPipe.reserveMm < -59),'own returning pipe must not disappear from the tool sweep')
})
test('same route method retains real connections/90degree corners, quantities, adverse pressure and unknown geometry rejection',()=>{
 const a=compareInletIndoorRouteCandidate(input,authored),b=compareInletIndoorRouteCandidate({...input,maximumGaugeBar:10,comparison:{...input.comparison,jacketDensityKgM3:4000}},authored)
 assert.deepEqual(a.paths.map(p=>p.pointsMm),authored.paths.map((p:any)=>p.pointsMm))
 assert.equal(a.authoredRouteGeometry.utilityReturnXMm,11310)
 assert.throws(()=>compareInletIndoorRouteCandidate({...input,tailOffsetMm:200},authored),/Unsupported changed candidate connection/)
 assert.ok(a.paths.every(p=>p.corners.every(c=>Math.abs(c.turnAngleDeg-90)<1e-9)))
 assert.equal(a.straightCopperStockComparisonKg,b.straightCopperStockComparisonKg)
 assert.equal(b.insulationAndJacketInventory.jacketDensityReferenceKg,a.insulationAndJacketInventory.jacketDensityReferenceKg/2)
 const f=a.paths[0].corners[0].fullPressureComparisonForceN,g=b.paths[0].corners[0].fullPressureComparisonForceN
 f.forEach((v,k)=>assert.ok(Math.abs(v*10/input.maximumGaugeBar-g[k])<1e-9))
 for(const change of [(x:any)=>x.extra=true,(x:any)=>x.paths[1].id=x.paths[0].id,(x:any)=>x.paths[1].pointsMm[0][0]++,(x:any)=>x.paths[1].pointsMm[1][0]++]){
  const x=structuredClone(authored);change(x);assert.throws(()=>compareInletIndoorRouteCandidate(input,x),/Unsupported/)
 }
})
test('retained comparison uses exact physical radii and both settings; obstacle edits cannot alter route stock',()=>{
 const candidate=r.candidateComparison.comparison,services=candidate.retained.services,a=inletRouteRetainedServices(candidate.route,services),changed=structuredClone(services)
 changed.paths.find((v:any)=>v.id==='actual-retained-hot-backbone').radiusWithSupportsMm+=1
 const b=inletRouteRetainedServices(candidate.route,changed),old=a.minimumByObstacle.find(v=>v.obstacle==='actual-retained-hot-backbone')!,next=b.minimumByObstacle.find(v=>v.obstacle==='actual-retained-hot-backbone')!
 assert.ok(Math.abs(old.reserveMm-1-next.reserveMm)<1e-10)
 assert.equal(a.twoIndependentSettingsMm,20);assert.equal(a.pipeJacketRadiusMm,40.05)
 assert.throws(()=>inletRouteRetainedServices(candidate.route,{...services,paths:[...services.paths,...services.paths]}),/Unsupported/)
 assert.throws(()=>inletRouteRetainedServices(candidate.route,{...services,boxes:[{id:'bad',boxMm:[0,0,0,1,1,0]}]}),/Unsupported/)
})

test('a real own-dogleg edit recomputes fitting reserves, quantities and exact reversal without changing Utility',()=>{
 const before=compareInletIndoorRouteCandidate(input,authored),changed=structuredClone(authored)
 const plant=changed.paths.find((p:any)=>p.id==='plant/upstream')
 plant.pointsMm[5][0]+=1;plant.pointsMm[6][0]+=1
 const after=compareInletIndoorRouteCandidate(input,changed)
 assert.ok(Math.abs(after.cornerTerritory.minimumSamePathCornerReserveMm-before.cornerTerritory.minimumSamePathCornerReserveMm-1)<1e-8)
 assert.ok(Math.abs(after.cornerTerritory.minimumSamePathPipeReserveMm-before.cornerTerritory.minimumSamePathPipeReserveMm-1)<1e-8)
 assert.deepEqual(after.paths.filter(p=>p.id.startsWith('utility/')),before.paths.filter(p=>p.id.startsWith('utility/')))
 assert.deepEqual(after.branches[0],before.branches[0])
 assert.ok(after.straightCopperStockComparisonKg>before.straightCopperStockComparisonKg)
 assert.equal(after.cornerTerritory.necessarySamePathTerritoryComparison,false)
 assert.ok(after.cornerTerritory.perSamePathPipe.every(c=>{
  const index=Number(c.corner.split('/').at(-1));return c.segment!==index&&c.segment!==index+1
 }))
 plant.pointsMm[5][0]-=1;plant.pointsMm[6][0]-=1
 assert.deepEqual(compareInletIndoorRouteCandidate(input,changed),before)
})
