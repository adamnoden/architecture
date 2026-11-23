import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {inletIndoorRoutes,inletRouteOperation,drawInletIndoorRoutes,type IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const source=JSON.parse(readFileSync(new URL('../../project/had/studies/south-inlet-under-sill.json',import.meta.url),'utf8'))
const input:IndoorRoutesInput={roomPlanMm:[9397,429.5,2173.5,2023.5],bankMm:[11350,2350],utilityAxisZMm:1350,plantAxisZMm:1890,
 tailOffsetMm:200,utilityReturnXMm:11180,westernReturnXMm:10040,utilitySourcePathMm:source.branches[0].coordinates,plantSourcePathMm:source.branches[1].coordinates,
 plantTransferMm:[[10900,2360,2400],[10600,3900,2400]],groundFflMm:0,ceilingMm:3100,utilityLmin:20,plantLmin:45,maximumGaugeBar:9,
 networkAllowancesBar:[.5,1],obstacles:[{id:'maintenance',boxMm:[10145,1505,0,1100,750,3100]},{id:'ordinary-body-approach',boxMm:[10370,2130,0,600,1060,2000]}],comparison:{frictionFactor:.03,cornerK:.9,temperatureChangeK:40,jacketDensityKgM3:8000,insulationDensityKgM3:200}}
test('four actual paths join opposite valve faces, avoid each other and preserve the full equipment field',()=>{
 const r=inletIndoorRoutes(input)
 assert.deepEqual(r.diagnostics,[])
 assert.equal(r.necessaryStraightPipeGeometryAndBudgetComparison,true)
 assert.ok(r.nearestPair.afterTwoJacketsAndSettingsMm>14)
 assert.ok(r.minimumSelfClearanceMm>19)
 assert.deepEqual(r.paths[0].pointsMm.at(-1),[11350,2350,1270])
 assert.deepEqual(r.paths[1].pointsMm[0],[11350,2350,1430])
 assert.deepEqual(r.paths[2].pointsMm.at(-1),[11350,2350,1810])
 assert.deepEqual(r.paths[3].pointsMm[0],[11350,2350,1970])
 assert.deepEqual(r.paths[3].pointsMm.at(-1),input.plantTransferMm.at(-1))
 assert.ok(r.branches.every(b=>b.lossAndRiseWithinExistingAllowanceComparison))
 assert.ok(r.straightCopperStockComparisonKg>22)
 assert.equal(r.pipe.minimumHydraulicBoreMm,25.14)
 assert.equal(r.pipe.maximumWaterAndPressureBoreMm,26.060000000000002)
 assert.ok(r.maximumStraightPipeWaterComparisonKg>10)
 assert.equal(r.cornerTerritory.necessaryBoxedCornerTerritoryComparison,true)
 assert.equal(r.support.nativeStructuralActionsAdopted,false)
 assert.equal(r.fullInsulatedFittingEnvelopeQualified,false)
 assert.equal(r.fullRouteRenewalQualified,false)
 assert.equal(r.topology.sharedHeader,false)
 assert.match(drawInletIndoorRoutes(r),/actual saved-bank/)
})
test('gravity, fixed-pressure corners and thermal comparisons have independent physical closure',()=>{
 const r=inletIndoorRoutes(input),translated=inletIndoorRoutes({...input,groundFflMm:530}),pressured=inletIndoorRoutes({...input,maximumGaugeBar:10}),hot=inletIndoorRoutes({...input,comparison:{...input.comparison,temperatureChangeK:80,jacketDensityKgM3:8000,insulationDensityKgM3:200}})
 for(let k=0;k<r.paths.length;k++)for(let j=0;j<r.paths[k].stock.length;j++){
  const a=r.paths[k].stock[j],b=translated.paths[k].stock[j]
  assert.deepEqual(a.fullWaterGravityWrenchKNKNm,b.fullWaterGravityWrenchKNKNm,'vertical datum translation preserves vertical-force moments')
  assert.ok(Math.abs(b.originMm[2]-a.originMm[2]-530)<1e-9)
  assert.ok(Math.abs(a.fullWaterGravityWrenchKNKNm[2]+(a.copperKg+a.fullWaterKg)*9.81/1000)<1e-12)
 }
 assert.equal(pressured.straightCopperStockComparisonKg,r.straightCopperStockComparisonKg)
 assert.equal(pressured.maximumStraightPipeWaterComparisonKg,r.maximumStraightPipeWaterComparisonKg)
 const a=r.paths[0].corners[0].fullPressureComparisonForceN,b=pressured.paths[0].corners[0].fullPressureComparisonForceN
 a.forEach((v,k)=>assert.ok(Math.abs(v*10/9-b[k])<1e-9))
 assert.equal(hot.completelyLockedStraightTubeAxialComparisonN,2*r.completelyLockedStraightTubeAxialComparisonN)
 assert.equal(hot.branches[0].freeAxialThermalExpansionMm,2*r.branches[0].freeAxialThermalExpansionMm)
 assert.deepEqual(hot.paths,r.paths)
})
test('a real obstruction, insufficient ceiling, changed flow and unsupported source reject or invalidate actual consumers',()=>{
 const base=inletIndoorRoutes(input),blocked=inletIndoorRoutes({...input,obstacles:[...input.obstacles,{id:'real-route-obstacle',boxMm:[11400,2000,1000,150,200,1800]}]})
 assert.ok(blocked.diagnostics.includes('INLET_PIPE_ENVELOPE/utility/upstream'))
 assert.equal(inletIndoorRoutes({...input,ceilingMm:3000}).necessaryStraightPipeGeometryAndBudgetComparison,false)
 const flow=inletIndoorRoutes({...input,plantLmin:70})
 assert.deepEqual(flow.branches[0],base.branches[0]);assert.ok(flow.branches[1].comparisonLossBar>base.branches[1].comparisonLossBar)
 assert.equal(flow.straightCopperStockComparisonKg,base.straightCopperStockComparisonKg)
 assert.equal(inletIndoorRoutes({...input,networkAllowancesBar:[.01,.01]}).necessaryStraightPipeGeometryAndBudgetComparison,false)
 assert.throws(()=>inletIndoorRoutes({...input,plantSourcePathMm:[]}),/Unsupported/)
 assert.throws(()=>inletIndoorRoutes({...input,maximumGaugeBar:NaN}),/Unsupported/)
 for(const malformed of [{bankMm:[11350]},{roomPlanMm:[9397,429.5,0,2023.5]},
  {networkAllowancesBar:[.5]}, {comparison:{frictionFactor:.03,cornerK:.9}},
  {plantSourcePathMm:[null,...input.plantSourcePathMm.slice(1)]},
  {obstacles:[...input.obstacles,...input.obstacles]}, {utilityLmin:-20}])
  assert.throws(()=>inletIndoorRoutes({...input,...malformed} as IndoorRoutesInput),/Unsupported/)
 const sparse={...input,bankMm:new Array(2)} as unknown as IndoorRoutesInput
 assert.throws(()=>inletIndoorRoutes(sparse),/Unsupported/)

})

test('actual source8 route counterexample joins valve bodies, precise face connections and continuous ordinary arm sweeps',()=>{
 const receipt=JSON.parse(readFileSync(new URL('../../project/had/studies/inlet-source-envelope.results.json',import.meta.url),'utf8')),
  r=receipt.joinedDirection.room.indoorRoutes,c=receipt.joinedDirection.room.indoorCuts,o=inletRouteOperation(r,c)
 assert.equal(r.necessaryStraightPipeGeometryAndBudgetComparison,true,'old narrow geometry/budget check missed these interfaces')
 assert.equal(o.necessaryRouteOperationEnvelopeScreen,false)
 const sibling=o.valveChecks.find(v=>v.path==='utility/downstream'&&v.segment===2&&v.valve==='plant'&&v.kind==='stem-wheel')!
 assert.ok(Math.abs(sibling.reserveMm+60.05)<1e-6)
 assert.equal(sibling.connectedEndTrimmed,false)
 const returning=o.valveChecks.find(v=>v.path==='plant/upstream'&&v.segment===3&&v.valve==='plant'&&v.kind==='body')!
 assert.ok(Math.abs(returning.reserveMm+23.55)<1e-6,'same-branch returning leg has no connection exemption')
 assert.equal(returning.connectedEndTrimmed,false)
 assert.ok(o.valveChecks.filter(v=>v.connectedEndTrimmed).every(v=>v.reserveMm===0))
 assert.equal(o.connectionInterfaces.length,4)
 assert.ok(o.minimumArmReserveMm < -100)
 assert.equal(o.armChecks.find(v=>v.valve==='plant')!.pipe.path,'utility/downstream')
 assert.ok(o.continuousRegrip.sweepCoverMm>1.54)
 assert.equal(o.twoIndependentSettingsMm,20)
 assert.equal(o.pipeJacketRadiusMm,40.05)
 assert.equal(o.armCapsuleRadiusMm,40)
 assert.match(drawInletIndoorRoutes(r,o),/Route \/ valve \/ arm screen: REJECTED/)
 const changed=structuredClone(r);changed.paths[0].pointsMm.at(-1)[0]+=1
 assert.throws(()=>inletRouteOperation(changed,c),/Unsupported actual route valve-face/)
 const wrong=structuredClone(c);wrong.authoredChoices.wheelInboardMm=NaN
 assert.throws(()=>inletRouteOperation(r,wrong),/Unsupported actual route operation/)
})
