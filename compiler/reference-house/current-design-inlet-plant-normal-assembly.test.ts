import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {inletSplitPlantBranch,derivePlantFittedFrame} from './current-design/inlet-split-plant-branch.js'
import {readLocalUtilityPocketSettings} from './current-design/inlet-source-envelope.js'
import {inletPlantNormalAssembly,readPlantNormalAssemblyChoice} from './current-design/inlet-plant-normal-assembly.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const room=read('project/had/studies/inlet-local-pocket.results.json').splitPlantRoom.comparison
const original=room.resolvedInput.branch
const {reviewSvg:_svg,...saved}=original
const legacy=()=>inletSplitPlantBranch(structuredClone(original.resolvedInput))
const services=read('project/had/studies/current-house-services.json'),rad=services.heatBodies.find((r:any)=>r.id==='plant-N')
const settings=readLocalUtilityPocketSettings()
const input=()=>({branch:legacy(),floorRiseMm:150,choice:readPlantNormalAssemblyChoice(),sourceMinimumDynamicBar:settings.sourceMinimumDynamicBar,sourceDelivery:{minimumApertureMm:settings.plantApertureNominalMm-settings.apertureToleranceMm,dischargeCoefficient:settings.dischargeCoefficientComparison,densityKgM3:1000},normalPressureReference:{pointHouseLocalMm:[...services.plant.independentSafety.expansion.slice(0,2),services.plant.independentSafety.expansion[2]+150] as readonly[number,number,number],gaugeBar:read('project/had/studies/inlet-store-vessel-candidate.json').expansion.normalRegulatorGaugeBar},radiatorInstalledPlanMm:rad.plan as readonly[number,number,number,number]})
const clean=(a:unknown)=>JSON.parse(JSON.stringify(a))
test('optional walking rise preserves exact historical branch/frame output when omitted',()=>{
 const b=legacy()
 assert.deepEqual(clean(b),saved)
 const f=derivePlantFittedFrame(structuredClone(original.fittedFrame.resolvedInput))
 assert.deepEqual(clean(f),original.fittedFrame)
 assert.equal(Object.hasOwn(b,'floorRiseMm'),false)
 assert.equal(Object.hasOwn(f.resolvedInput,'floorRiseMm'),false)
})
test('raised actual store and goods share one floor while entry, isolator and upper cold tree stay fixed',()=>{
 const i=input(),r=inletPlantNormalAssembly(i),q=r.branch.choice
 assert.equal(r.branch.groundFflMm,530);assert.equal(r.branch.floorRiseMm,150)
 assert.deepEqual(q.sourceEntryMm,i.branch.choice.sourceEntryMm)
 assert.equal(r.branch.referenceValve.axisMm[2],i.branch.referenceValve.axisMm[2]+150)
 assert.equal(r.stationCase.externalStationJSONChanged,false)
 assert.equal(q.storePortTrialMm[2],530)
 assert.deepEqual(q.coldTreeInterfaceMm,i.branch.choice.coldTreeInterfaceMm)
 assert.equal(q.coldTreeInterfaceMm[2],2945)
 assert.ok(q.storeFixedPathMm.every(p=>p[2]===i.branch.choice.outletStemMm.at(-1)![2]))
 assert.equal(q.storeRemovableDropMm[0][2],i.branch.choice.storeRemovableDropMm[0][2]);assert.equal(q.storeRemovableDropMm[1][2],i.branch.choice.storeRemovableDropMm[1][2])
 assert.equal(q.storeTerminalMm.at(-1)![2],530)
 assert.equal(r.frame.frameBottomAbsoluteMm,680)
 assert.equal(r.frame.frameClearHeadAbsoluteMm,2980)
 assert.equal(r.frame.frameHeaderTopAbsoluteMm,3080)
 assert.equal(r.frame.rawHouseProfileAndRaisedLeafSweepAccepted,false)
 const port=r.branch.incidentStations.stations.find(s=>s.role==='store-factory-port')!
 assert.equal(port.absolutePointMm[2],1060)
 assert.equal(r.branch.incidentStations.storeOuterEnvelopeTopAbsoluteMm,2330)
 assert.ok(r.branch.geometry.goodsChecks.length>0)
 assert.ok(r.branch.pressureNetworkEquilibriumResidualN_Nm.every(v=>Math.abs(v)<1e-6))
 assert.notEqual(r.branch.referenceStraightStockKg,i.branch.referenceStraightStockKg)
 assert.equal(r.branch.lockedStraightTubeThermalReferenceN,i.branch.lockedStraightTubeThermalReferenceN)
})
test('common inline PRV has real spools, normal pressure comparison and actual operating/step/tool cases',()=>{
 const r=inletPlantNormalAssembly(input())
 assert.equal(r.regulator.placedBeforeBothActualColdBranches,true)
 assert.equal(r.regulator.nonreturnOrSafetyIsolationCredited,false)
 assert.equal(r.regulator.normalPressureReference.gaugeBar,2)
 assert.ok(r.regulator.regulatedGaugeBar>2,'The lower PRV setpoint includes the actual rise to the expansion datum.')
 assert.equal(r.regulator.placedBeforeInternalPlantCut,true)
 assert.equal(r.regulator.minimumKvDesignRequirement,12)
 assert.ok(r.regulator.prvInActualSingleStem)
 assert.equal(r.actualStemParts.length,3)
 assert.equal(r.inlineInventory.completePRVExternalEnvelopeAsWaterUpperL,1.28)
 assert.ok(r.inlineInventory.netAddedWaterInventoryUpperL>1)
 assert.ok(r.pressureDatumAtCuts.find(p=>p.id==='factory-port')!.staticGaugeBar>2)
 assert.ok(r.pressureDatumAtCuts.find(p=>p.id==='tree-interface')!.staticGaugeBar<2)
 assert.ok(r.stock.PRVOccupiedVirtualTubeRemovedKg>0)
 assert.equal(r.taskModes.length,2)
 assert.equal(r.taskModes[0].shoulder[2],1600)
 assert.equal(r.taskModes[1].shoulder[2],1600)
 assert.ok(r.taskModes[1].toolBoxLocalMm)
 assert.ok(r.taskModes[1].toolRouteChecks.length>0)
 assert.ok(r.regulator.restrictionLossBar>1.3&&r.regulator.restrictionLossBar<1.4)
 assert.equal(r.regulator.necessaryAuthorityComparison,false,'Current10.3mm minimum source cannot hold the static setpoint at the full45L/min duty.')
 assert.ok(r.regulator.fullFlowOutletGaugeBar<r.regulator.regulatedGaugeBar)
 assert.ok(r.routeHydraulics.every(p=>p.availableBar>0))
 assert.ok(r.supportDemand.seizedStraightThermalCounterexampleN>1000)
 assert.equal(r.actualNormalPressureInstallationAccepted,false)
 assert.equal(r.renewal.actualTwoSpannerCaptureAndUnionsAccepted,false)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'Plant-common-PRV-normal-installation.json'),JSON.stringify(r,null,2))}
 console.info('PLANT_COMMON_PRV_NORMAL '+JSON.stringify({geometryFailures:r.geometryFailures,prv:r.regulator,frame:r.frame,stock:r.stock,support:r.supportDemand,tasks:r.taskModes.map(t=>({id:t.id,reach:t.reachMm,body:t.necessaryBodyAndArmGeometry,floor:t.floorReserveMm,head:t.headReserveMm,bodyObjects:t.objectChecks.filter(p=>p.bodyReserveMm<0||p.armReserveMm<0||(p.stepReserveMm!==null&&p.stepReserveMm<0)),route:t.routeChecks.filter(p=>p.bodyReserveMm<0||p.armReserveMm<0),corners:t.cornerChecks.filter(p=>p.bodyReserveMm<0||p.armReserveMm<0),tool:t.toolRouteChecks.filter(p=>p.reserveMm<0||p.driverReserveMm<0),toolOwnBody:t.toolOwnBodyReserveMm})),route:r.routeHydraulics}))
})
test('source, floor, regulator, pressure and actual operator perturbations invalidate dependent evidence',()=>{
 const i=input(),r=inletPlantNormalAssembly(i),small=structuredClone(i)
 small.choice.minimumKv=.3
 assert.equal(inletPlantNormalAssembly(small).regulator.necessaryAuthorityComparison,false)
 const wide=structuredClone(i);wide.choice.prvCompleteEnvelopeMm=[800,800,800]
 const bad=inletPlantNormalAssembly(wide)
 assert.equal(bad.regulator.prvInActualSingleStem,false)
 assert.equal(bad.necessaryDeclaredGeometry,false)
 const floor=structuredClone(i);floor.floorRiseMm=100;floor.normalPressureReference.pointHouseLocalMm=[...i.normalPressureReference.pointHouseLocalMm.slice(0,2),services.plant.independentSafety.expansion[2]+100] as readonly[number,number,number]
 const lower=inletPlantNormalAssembly(floor)
 assert.equal(lower.frame.frameBottomAbsoluteMm,630)
 assert.notEqual(lower.sourceDigest,r.sourceDigest)
 assert.equal(lower.branch.choice.storePortTrialMm[2],480)
 assert.deepEqual(lower.branch.choice.coldTreeInterfaceMm,r.branch.choice.coldTreeInterfaceMm)
 const tooFar=structuredClone(i);tooFar.choice.ordinaryShoulderXYMm=[10500,4700]
 assert.equal(inletPlantNormalAssembly(tooFar).taskModes[1].necessaryBodyAndArmGeometry,false)
 const ignored=structuredClone(i);ignored.sourceDelivery.minimumApertureMm=1000000
 assert.equal(inletPlantNormalAssembly(ignored).regulator.necessaryAuthorityComparison,true,'Omitting the real inlet restriction would falsely pass; retain this regression.')
 const mixed=structuredClone(i);mixed.branch.choice.sourceEntryMm[0]+=1
 assert.throws(()=>inletPlantNormalAssembly(mixed),/Actual current Plant branch|Unsupported/)
 const broken=structuredClone(original.resolvedInput);broken.floorRiseMm=150
 assert.throws(()=>inletSplitPlantBranch(broken),/walking-floor datum join/)
})
