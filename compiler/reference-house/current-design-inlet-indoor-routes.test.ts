import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {inletIndoorRoutes,drawInletIndoorRoutes,type IndoorRoutesInput} from './current-design/inlet-indoor-routes.js'
const source=JSON.parse(readFileSync(new URL('../../project/had/studies/south-inlet-under-sill.json',import.meta.url),'utf8'))
const input:IndoorRoutesInput={roomPlanMm:[9397,429.5,2173.5,2023.5],bankMm:[11350,2350],utilityAxisZMm:1350,plantAxisZMm:1860,
 utilitySourcePathMm:source.branches[0].coordinates,plantSourcePathMm:source.branches[1].coordinates,
 plantTransferMm:[[10900,2360,2235],[10600,3900,2235]],groundFflMm:0,ceilingMm:3100,utilityLmin:20,plantLmin:45,maximumGaugeBar:9,
 networkAllowancesBar:[.5,1],obstacles:[{id:'maintenance',boxMm:[10145,1505,0,1100,750,3100]}],comparison:{frictionFactor:.03,cornerK:.9,temperatureChangeK:40}}
test('four actual paths join opposite valve faces, avoid each other and preserve the full equipment field',()=>{
 const r=inletIndoorRoutes(input)
 assert.deepEqual(r.diagnostics,[])
 assert.equal(r.necessaryStraightPipeGeometryAndBudgetComparison,true)
 assert.ok(Math.abs(r.nearestPair.afterTwoJacketsAndSettingsMm-9.9)<1e-9)
 assert.ok(r.minimumSelfClearanceMm>19)
 assert.deepEqual(r.paths[0].pointsMm.at(-1),[11350,2350,1270])
 assert.deepEqual(r.paths[1].pointsMm[0],[11350,2350,1430])
 assert.deepEqual(r.paths[2].pointsMm.at(-1),[11350,2350,1780])
 assert.deepEqual(r.paths[3].pointsMm[0],[11350,2350,1940])
 assert.deepEqual(r.paths[3].pointsMm.at(-1),input.plantTransferMm.at(-1))
 assert.ok(r.branches.every(b=>b.lossAndRiseWithinExistingAllowanceComparison))
 assert.ok(r.straightCopperStockComparisonKg>24)
 assert.equal(r.pipe.minimumHydraulicBoreMm,25.14)
 assert.equal(r.pipe.maximumWaterAndPressureBoreMm,26.060000000000002)
 assert.ok(Math.abs(r.maximumStraightPipeWaterComparisonKg-12.607695630736202)<1e-9)
 assert.equal(r.support.nativeStructuralActionsAdopted,false)
 assert.equal(r.fullInsulatedFittingEnvelopeQualified,false)
 assert.equal(r.fullRouteRenewalQualified,false)
 assert.equal(r.topology.sharedHeader,false)
 assert.match(drawInletIndoorRoutes(r),/actual saved-bank/)
})
test('gravity, fixed-pressure corners and thermal comparisons have independent physical closure',()=>{
 const r=inletIndoorRoutes(input),translated=inletIndoorRoutes({...input,groundFflMm:530}),pressured=inletIndoorRoutes({...input,maximumGaugeBar:10}),hot=inletIndoorRoutes({...input,comparison:{...input.comparison,temperatureChangeK:80}})
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
})
