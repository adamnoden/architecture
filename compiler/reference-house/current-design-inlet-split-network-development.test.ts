import assert from'node:assert/strict'
import test from'node:test'
import{readFileSync}from'node:fs'
import{deriveUtilityWideCapture}from'../../project/had/studies/utility-wide-capture.mjs'
import{runSplitNetworkDevelopment}from'../../project/had/studies/inlet-split-network-development.js'
test('whole hot-riser comparison retains the exact default and rejects an apparently helpful east shift at the actual head interface',()=>{
 const current=deriveUtilityWideCapture(),saved=JSON.parse(readFileSync(new URL('../../project/had/studies/utility-wide-capture.json',import.meta.url),'utf8'))
 assert.deepEqual(current,saved)
 const moved=deriveUtilityWideCapture({hotRiserXMm:10850})
 assert.equal(moved.hot.body[0]+moved.hot.body[3],10887)
 assert.ok(moved.stages[0].clearanceMM<18)
 assert.equal(moved.experimentalAuthoredChoices?.selected,false)
 assert.equal(moved.disposition,'EXPERIMENTAL_HOT_RISER_COMPARISON_UNSELECTED')
 for(const bad of[{hotRiserXMm:NaN},{hotRiserXMm:0},{extra:10850},null])assert.throws(()=>deriveUtilityWideCapture(bad as {hotRiserXMm:number}),/Unsupported/)
})
test('shared methods retain full head, maintenance, fan and clamp tools in incomplete split-network comparisons',()=>{
 const result=runSplitNetworkDevelopment(),base=result.cases.find(v=>v.id==='east-below-fan')!,two=result.cases.find(v=>v.id==='whole-hot-two-east')!,ten=result.cases.find(v=>v.id==='whole-hot-ten-east-adverse')!,west=result.cases.find(v=>v.id==='west-riser-maintenance-adverse')!,high=result.cases.find(v=>v.id==='east-high-fan-adverse')!,hot=(v:typeof base)=>v.retainedMinima.find(v=>v.obstacle==='actual-retained-hot-backbone')!
 assert.ok(hot(base).reserveMm<-.85)
 assert.ok(hot(two).reserveMm>0&&hot(two).reserveMm<.3)
 assert.deepEqual(two.fullHotAssemblyComparison.stages.map(v=>v.clearanceMM),[25,25.5,30])
 assert.equal(two.priorH0MaxX10880Mm,true);assert.equal(ten.priorH0MaxX10880Mm,false)
 assert.ok(base.receiverPipes.every(v=>v.closest.reserveMm>3&&v.closest.reserveMm<3.5))
 assert.ok(base.larger20mmSettingAdverse.receiverPipes.every(v=>v.closest.reserveMm<0))
 assert.ok(base.larger20mmSettingAdverse.roomReserveMm<0)
 assert.ok(west.utilityRouteObstacles.some(v=>v.obstacles.some(o=>o.id==='complete-shifted-utility-maintenance'&&o.afterJacketAndSettingMm<-50)))
 assert.ok(high.retainedMinima.some(v=>v.obstacle==='actual-utility-fan-duct-with20mm-supports'&&v.reserveMm<0))
 assert.deepEqual(base.sourceFedFaultBoundsLmin,two.sourceFedFaultBoundsLmin)
 assert.ok(result.cases.every(v=>!v.selected&&!v.independentSourceStoreReliefColdReplacementAndPhysicalCaptureQualified&&!v.actualSplitPlantRoutesAndFullNetworkSupportQualified))
 assert.equal(result.actualSplitNetworkCurrentSourceAdoption,false)
})
