import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {admitPlantFittedFrameChoice} from './current-design/inlet-split-plant-room-choice.js'
import {derivePlantFittedFrame,admitResolvedPlantFittedFrame,inletSplitPlantBranch} from './current-design/inlet-split-plant-branch.js'
import {comparePlantFittedDoor} from './current-design/inlet-split-plant-room.js'
import {inletPlantNormalAssembly,readPlantNormalAssemblyChoice} from './current-design/inlet-plant-normal-assembly.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const saved=read('project/had/studies/inlet-local-pocket.results.json').splitPlantRoom.comparison,
 raw=read('project/had/studies/inlet-plant-tanked-walk-candidate.json'),services=read('project/had/studies/current-house-services.json'),
 settings=read('project/had/studies/inlet-plant-tanked-supply-candidate.json').settings,vessel=read('project/had/studies/inlet-store-vessel-candidate.json'),
 gap={leafBottomGapMm:14,leafHeadGapMm:5,maximumInstalledLeafRelativeErrorMm:3},
 near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b)
function normal(g=gap,height=2300){
 const branch=inletSplitPlantBranch(structuredClone(saved.resolvedInput.branch.resolvedInput)),
  frameChoice={...branch.fittedFrame.choice,externalWorkDeckPlanMm:raw.externalDeckPlanMm,clearWidthMm:raw.frame.clearWidthMm,clearHeightMm:height,headerDepthMm:raw.frame.headerDepthMm,sourceOpeningDiameterMm:raw.frame.sourceInfillPortDiameterMm,...g}
 return inletPlantNormalAssembly({branch,floorRiseMm:raw.walkingRiseAboveHouseFflMm,bufferAdditionalRiseMm:raw.appliancePlatform.bufferCradleRiseMm,frameChoice,frameOuterWidthMm:raw.frame.outerWidthMm,choice:readPlantNormalAssemblyChoice(),sourceMinimumDynamicBar:settings.sourceMinimumDynamicBar,sourceDelivery:{minimumApertureMm:settings.plantApertureNominalMm-settings.apertureToleranceMm,dischargeCoefficient:settings.dischargeCoefficientComparison,densityKgM3:1000},normalPressureReference:{pointHouseLocalMm:[services.plant.independentSafety.expansion[0],services.plant.independentSafety.expansion[1],services.plant.independentSafety.expansion[2]+raw.walkingRiseAboveHouseFflMm],gaugeBar:vessel.expansion.normalRegulatorGaugeBar},radiatorInstalledPlanMm:services.heatBodies.find((r:any)=>r.id==='plant-N').plan})
}
function door(n:ReturnType<typeof normal>,top:readonly[number,number]=[679,681]){
 const p=structuredClone(saved.resolvedInput),home=p.bridgeHomeObstacles.map((o:any)=>{
  if(o.id==='actual-Plant-valve-body')return{...o,boxMm:n.branch.referenceValve.bodyMm}
  if(o.id==='actual-Plant-valve-stem')return{...o,boxMm:n.branch.referenceValve.stemMm}
  if(o.id==='actual-plant-radiator-home')return{...o,boxMm:o.boxMm.map((v:number,k:number)=>v+(k===2?raw.walkingRiseAboveHouseFflMm:0))}
  const same=n.branch.obstacles.find(b=>b.id===o.id);if(!same)throw Error('Missing actual door home obstacle '+o.id);return same
 })
 return comparePlantFittedDoor({...p,branch:n.branch,choice:{...p.choice,fittedFrame:n.branch.fittedFrame.choice},bridgeHomeObstacles:home},{planMm:[raw.bridge.postRow.plankInnerXMm,raw.bridge.plateWidthYMm[0],raw.bridge.postRow.plankOuterXMm-raw.bridge.postRow.plankInnerXMm,raw.bridge.plateWidthYMm[1]-raw.bridge.plateWidthYMm[0]],topAbsoluteRangeMm:top})
}
test('omitted paired gaps preserve the complete saved legacy frame without extra output',()=>{
 const original=saved.resolvedInput.branch.fittedFrame,actual=derivePlantFittedFrame(structuredClone(original.resolvedInput))
 assert.deepEqual(JSON.parse(JSON.stringify(actual)),original)
 assert.equal(Object.hasOwn(actual,'leafBody'),false)
 assert.deepEqual(admitPlantFittedFrameChoice(structuredClone(original.choice)),original.choice)
 assert.throws(()=>admitPlantFittedFrameChoice({...original.choice,leafBottomGapMm:14}),/Complete paired/)
 assert.throws(()=>admitPlantFittedFrameChoice({...original.choice,...gap,maximumInstalledLeafRelativeErrorMm:20}),/Unsupported paired/)
})
test('actual2300 frame keeps its arch and clear cargo opening while the leaf body clears measured deck and head',()=>{
 const n=normal(),f=n.branch.fittedFrame,d=door(n),body=f.leafBody!
 assert.equal(f.clearHeightMm,2300);assert.equal(f.verticalDatum.frameClearHeadAbsoluteMm,2980);assert.equal(f.verticalDatum.frameHeaderTopAbsoluteMm,3080)
 assert.equal(body.bottomAbsoluteMm,694);assert.equal(body.topAbsoluteMm,2975);assert.equal(body.heightMm,2281)
 assert.equal(body.minimumHeadGapAfterRelativeErrorMm,2)
 assert.ok(f.exactOuterArchGeometry!.necessaryExactRectangleFit)
 assert.ok(n.necessaryDeclaredGeometry,JSON.stringify(n.geometryFailures))
 const parked=n.branch.obstacles.find(o=>o.id==='actual-fitted-parked-leaf-body')!
 assert.ok(parked);assert.equal(parked.boxMm[2]+n.branch.groundFflMm,694);assert.equal(parked.boxMm[5],2281)
 assert.deepEqual(d.parkedLeafBoxMm,parked.boxMm)
 assert.equal(d.leafBody!.localBoxMm[2],14);assert.equal(d.leafBody!.localBoxMm[5],2281)
 assert.equal(d.leafDeckJoin!.closedLeafPlanOverlapsActualDeck,true)
 assert.equal(d.leafDeckJoin!.nominalMinimumBodyToDeckMm,13)
 assert.equal(d.leafDeckJoin!.minimumBodyToDeckAfterFittingMm,10)
 assert.equal(d.leafDeckJoin!.minimumHeadGapAfterFittingMm,2)
 assert.ok(d.leafDeckJoin!.necessaryMatchedVerticalClearance)
 assert.ok(d.necessaryDeclaredDoorAndParkedGoodsGeometryScreen,JSON.stringify(d.diagnostics))
 near(d.leafGravityBudget.closed.referenceCentreMm[2],(694+2975)/2)
 assert.equal(d.leafGravityBudget.kg,f.choice.leafMassBudgetKg,'The shorter envelope earns no invented favourable mass reduction')
 assert.equal(d.matchedWeatherAirThermalFireSealsAndHardwareQualified,false)
 assert.equal(d.leafDeckJoin!.actualInstalledFittingWeatherAirThermalFireSealAndHardwareAccepted,false)
 const summary={frame:f,normalFailures:n.geometryFailures,parkedLeaf:parked,door:d,actualInstalledAcceptance:false}
 console.info('PLANT_MATCHED_LEAF_DECK '+JSON.stringify(summary))
 if(process.env.RUNNER_TEMP){const dir=join(process.env.RUNNER_TEMP,'had-utility-west-proof');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'plant-matched-leaf-deck.json'),JSON.stringify(summary,null,2))}
})
test('zero-gap complete leaf has a real one-millimetre closed overlap with the681deck',()=>{
 const n=normal({leafBottomGapMm:0,leafHeadGapMm:0,maximumInstalledLeafRelativeErrorMm:3}),d=door(n)
 assert.equal(d.leafDeckJoin!.closedLeafPlanOverlapsActualDeck,true)
 assert.equal(d.leafDeckJoin!.physicalClosedLeafDeckBodyOverlapMm,1)
 assert.equal(d.leafDeckJoin!.minimumBodyToDeckAfterFittingMm,-4)
 assert.equal(d.leafDeckJoin!.necessaryMatchedVerticalClearance,false)
 assert.ok(d.diagnostics.includes('PLANT_FITTED_DOOR/actual-finished-deck-leaf-body-clearance'))
 assert.equal(d.necessaryDeclaredDoorAndParkedGoodsGeometryScreen,false)
 assert.notEqual(n.sourceDigest,normal().sourceDigest)
})
test('relative fitting, actual deck growth, source arch and stale derived body invalidate their own evidence',()=>{
 const excessive=door(normal({...gap,maximumInstalledLeafRelativeErrorMm:6}))
 assert.equal(excessive.leafDeckJoin!.minimumHeadGapAfterFittingMm,-1)
 assert.equal(excessive.necessaryDeclaredDoorAndParkedGoodsGeometryScreen,false)
 const high=door(normal(),[679,700])
 assert.equal(high.leafDeckJoin!.physicalClosedLeafDeckBodyOverlapMm,6)
 assert.equal(high.leafDeckJoin!.necessaryMatchedVerticalClearance,false)
 const tall=normal(gap,2350)
 assert.equal(tall.branch.fittedFrame.leafBody!.topAbsoluteMm,3025)
 assert.equal(tall.branch.fittedFrame.exactOuterArchGeometry!.necessaryExactRectangleFit,false)
 assert.ok(tall.geometryFailures.includes('PLANT_NORMAL/actual-outer-frame-or-service-cassette-fit-fails'))
 const stale=structuredClone(normal().branch.fittedFrame);stale.choice.leafBottomGapMm=16
 assert.throws(()=>admitResolvedPlantFittedFrame(stale),/Unsupported derived/)
})
