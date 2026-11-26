import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../core/identity.js'
import {readInletSourceEnvelopeSettings} from './current-design/inlet-source-envelope.js'
import {admitStoreVesselChoice,inletStoreVessel,storeVesselInnerVolumeLitres,storeVesselPointInside,type StoreVesselSource} from './current-design/inlet-store-vessel.js'
const read=(path:string)=>JSON.parse(readFileSync(new URL('../../'+path,import.meta.url),'utf8'))
const choice=admitStoreVesselChoice(read('project/had/studies/inlet-store-vessel-candidate.json'))
const services=read('project/had/studies/current-house-services.json'),mat=read('project/mat/studies/whole-house-service-baseline.json'),settings=readInletSourceEnvelopeSettings(),p=services.plant
const hotJoin=mat.trunks.find((t:{id:string})=>t.id==='ground-front-west').selected3DProfile[0]
const source:StoreVesselSource={
 bindingDigest:sha256SemanticFingerprint({plant:p,settings,hotJoin}),groundFflMm:530,
 cylinder:{centreLocalXYMm:[p.cylinder.centre[0],p.cylinder.centre[1]],outerRadiusMm:p.cylinder.body[2]/2,outerTopLocalMm:p.cylinder.height,family:p.cylinder.family},
 coldPortLocalMm:[p.independentSafety.mainsPortTrial[0],p.independentSafety.mainsPortTrial[1],p.independentSafety.mainsPortTrial[2]],tAndPMountLocalMm:[p.independentSafety.directTopTP[0],p.independentSafety.directTopTP[1],p.independentSafety.directTopTP[2]],
 immersionPortLocalXYMm:[p.independentSafety.elementRelease.port[0],p.independentSafety.elementRelease.port[1]],
 immersionElementLengthMm:p.independentSafety.elementRelease.immersionAndTool[0],immersionToolDrawMm:p.independentSafety.elementRelease.immersionAndTool[1],
 upperHotTreeJoinLocalMm:[hotJoin[0],hotJoin[1],hotJoin[2]],inletMaximumAbsoluteBar:settings.sourceMaximumTotalBar+settings.atmosphericMaximumBar,
 outsideMinimumAbsoluteBar:settings.atmosphericMinimumBar,outsideMaximumAbsoluteBar:settings.atmosphericMaximumBar,sourceMinimumDynamicGaugeBar:settings.sourceMinimumDynamicBar
}
const run=(c:unknown=choice,s:StoreVesselSource=source)=>inletStoreVessel({choice:c,source:s})
const near=(a:number,b:number,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,String(a)+' != '+String(b))
test('650mm pressure interior and explicit ports bound330L; outer case and catalogue minimum are not water inventory',()=>{
 const r=run()
 near(storeVesselInnerVolumeLitres(choice),326.3002119681649)
 near(r.inventory.bodyAndPortsUpperLitres,329.9977119681649)
 assert.equal(r.inventory.maximumBodyAndPortsDesignLitres,330);assert.equal(r.inventory.necessaryFiniteBodyInventoryScreen,true)
 near(r.inventory.outerCaseCylinderComparisonLitres,748.5158656443042)
 assert.equal(r.inventory.outerCaseComparisonAppliesToWaterInventory,false)
 assert.equal(r.inventory.knownPassageAuditAddedAgainToBodyUpper,false);assert.equal(r.inventory.portsBudgetIsMaximumAdditionalOutsideInnerWater,true)
 assert.equal(r.inventory.nominalUsableDeliveryQualified,false);assert.equal(r.supplierSelected,false);assert.equal(r.installedAcceptance,false)
 const bigger=structuredClone(choice);bigger.inner.diameterMm=660
 const challenged=run(bigger)
 assert.equal(challenged.inventory.necessaryFiniteBodyInventoryScreen,false)
 assert.ok(challenged.diagnostics.includes('STORE_VESSEL/body-and-ports-exceed-design-cap'))
 assert.equal(challenged.geometry.outerRadiusMm,r.geometry.outerRadiusMm)
 assert.notEqual(challenged.source.caseDigest,r.source.caseDigest)
})
test('local pressure body and every factory interface translate groundFFL once',()=>{
 const r=run(),zero=run(choice,{...source,groundFflMm:0})
 assert.equal(r.geometry.innerLowestLocalMm,520);assert.equal(r.geometry.innerTopLocalMm,1570)
 assert.deepEqual(r.geometry.straightLocalZMm,[620,1470])
 assert.equal(r.geometry.innerLowestAbsoluteMm,1050);assert.equal(r.geometry.innerTopAbsoluteMm,2100)
 for(const group of[r.connections.cold,r.connections.drain,r.connections.tAndP]){
  group.pathLocalMm.forEach((v,k)=>assert.deepEqual(group.pathAbsoluteMm[k],[v[0],v[1],v[2]+530]))
 }
 assert.deepEqual(r.connections.hot.routeToUpperTreeAbsoluteMm,r.connections.hot.routeToUpperTreeLocalMm.map(v=>[v[0],v[1],v[2]+530]))
 assert.equal(zero.geometry.innerTopAbsoluteMm,1570);assert.equal(zero.inventory.bodyAndPortsUpperLitres,r.inventory.bodyAndPortsUpperLitres)
 assert.deepEqual(zero.connections.drain.pathLocalMm,r.connections.drain.pathLocalMm)
 assert.notEqual(zero.source.caseDigest,r.source.caseDigest)
})
test('actual cold380 rises into water; drain150 descends from actual bottom; preferred TP tip clears its full envelope and preserves the rejected point',()=>{
 const r=run()
 assert.deepEqual(r.connections.cold.pathLocalMm[0],source.coldPortLocalMm)
 assert.equal(r.connections.cold.pathLocalMm[0][2],380);assert.equal(r.connections.cold.pathLocalMm[1][2],620)
 assert.equal(r.connections.cold.factoryPressureRiseMm,240);assert.equal(r.connections.cold.wetPointInside,true)
 assert.equal(r.connections.drain.pathLocalMm[1][2],150)
 near(r.connections.drain.requiredMaximumDirectPassageLengthMm,530.3772242470453)
 assert.equal(r.connections.drain.requiredContinuousFallMm,370);assert.equal(r.connections.drain.nonRisingPath,true)
 assert.deepEqual(r.connections.tAndP.pathLocalMm[0],source.tAndPMountLocalMm)
 near(r.connections.tAndP.requiredProbeLengthMm,255.97851472340406)
 near(r.connections.tAndP.requiredProbeLengthAfterTwoSettingsMm,275.97851472340406)
 assert.ok(r.connections.tAndP.requiredProbeLengthAfterTwoSettingsMm<280)
 assert.equal(r.connections.tAndP.sensePointInside,true)
 near(r.connections.tAndP.nearestInnerWallMm,29.48891263388906,1e-6)
 near(r.connections.tAndP.tipEnvelopeReserveAfterTwoSettingsMm,4.488912633889061,1e-6)
 assert.equal(r.geometry.necessaryGeometryScreen,true)
 const old=structuredClone(choice);old.connections.tAndP.sensePointLocalMm=[9990,4490,1490]
 const rejected=run(old)
 near(rejected.connections.tAndP.requiredProbeLengthMm,251.44581921360316)
 assert.equal(rejected.connections.tAndP.sensePointInside,true)
 near(rejected.connections.tAndP.tipEnvelopeReserveAfterTwoSettingsMm,-3.299470237562737,1e-6)
 assert.equal(rejected.geometry.necessaryGeometryScreen,false,'A point inside the dome does not pass a sensor plus two independent settings')
 assert.ok(rejected.diagnostics.includes('STORE_VESSEL/TP-tip-radius-and-two-settings-exceed-interior-clearance'))
 const short=structuredClone(choice);short.connections.tAndP.maximumProbeLengthMm=260
 assert.ok(run(short).diagnostics.includes('STORE_VESSEL/TP-probe-length-exceeds-authored-bound'))
 const outside=structuredClone(choice);outside.connections.cold.wetPointLocalMm=[10131.5,4018.71,380]
 assert.equal(run(outside).connections.cold.wetPointInside,false)
})
test('immersion has an authored real Z and retained550+150 draw; hot nozzle joins the actual upper trunk separately from reliefD1',()=>{
 const r=run()
 assert.equal(r.connections.immersion.portLocalMm[2],1100)
 assert.deepEqual(r.connections.immersion.tipLocalMm,[9660,4250,1100])
 assert.deepEqual(r.connections.immersion.withdrawalEndLocalMm,[10910,4250,1100])
 assert.equal(r.connections.immersion.axisAndElementInStraightDomain,true)
 near(r.connections.immersion.tipWallReserveAfterTwoSettingsMm,121)
 assert.equal(r.connections.immersion.completeToolAndRemovalObstacleFitQualified,false)
 assert.equal(r.connections.hot.origin,'new-owner-authored-hot-draw-nozzle-not-D1-relief-manifold')
 assert.equal(r.connections.hot.routeJoined,true);assert.deepEqual(r.connections.hot.upperTreeJoinLocalMm,hotJoin)
 assert.equal(storeVesselPointInside(choice,source.cylinder.centreLocalXYMm,r.connections.hot.neckLocalMm[0]),true)
 const disconnected=structuredClone(choice);disconnected.connections.hot.routeToUpperTreeLocalMm=[[9800,4250,1730],[9800,5000,2900]]
 assert.equal(run(disconnected).connections.hot.routeJoined,false)
 const high=structuredClone(choice);high.connections.immersion.axisZMm=1550
 assert.equal(run(high).connections.immersion.axisAndElementInStraightDomain,false)
})
test('ellipsoid bottom residual plus complete passage/boss and declared trapped cavities is distinct from filled mass',()=>{
 const r=run(),x=r.coldCargo
 near(x.maximumBodyBottomResidualLitres,.013184740768340766)
 near(x.maximumFactoryPassageResidualLitres,.32658092149986934)
 near(x.maximumBossResidualLitres,.006157521601035994)
 near(x.knownResidualLitres,.3459231838692461)
 near(x.maximumResidualKg,1.8459231838692461)
 assert.equal(x.necessaryResidualScreen,true);assert.equal(x.completeColdCargoDesignKg,252)
 near(x.oneWheelIncludingDynamicN,3708.18)
 assert.equal(r.normalFilled.bodyDryPlusWaterDesignCeilingKg,580);near(r.normalFilled.bodyDryPlusWaterGravityN,5689.8)
 assert.equal(r.normalFilled.actualCompleteFilledCGLocalMm,null);assert.equal(x.actualDryCGLocalMm,null)
 assert.deepEqual(r.normalFilled.innerSymmetricWaterCentroidLocalMm,[9830,4250,1045])
 const lip=structuredClone(choice);lip.connections.drain.maximumPickupLipMm=30
 assert.equal(run(lip).coldCargo.necessaryResidualScreen,false)
 const higher=structuredClone(choice);higher.inner.lowestWettedZMm+=20
 const changed=run(higher)
 assert.ok(changed.connections.drain.requiredMaximumDirectPassageLengthMm>r.connections.drain.requiredMaximumDirectPassageLengthMm)
 assert.equal(changed.normalFilled.bodyDryPlusWaterDesignCeilingKg,r.normalFilled.bodyDryPlusWaterDesignCeilingKg)
 const denser=structuredClone(choice);denser.expansion.coldDensityUpperKgM3=1005
 const densityChanged=run(denser)
 near(densityChanged.normalFilled.maximumBodyWaterKg,331.65)
 near(densityChanged.normalFilled.bodyDryPlusWaterDesignCeilingKg,581.65)
 near(densityChanged.coldCargo.maximumResidualKg,r.coldCargo.maximumResidualKg*1.005)
})
test('20L total expansion capacity bounds water independently of precharge; explicit normal60C law does not establish charged-fault temperature',()=>{
 const r=run(),e=r.expansion
 assert.equal(e.totalInternalCapacityLitres,20);assert.equal(e.maximumDrainableWaterLitres,20)
 assert.equal(e.totalCapacityIsIndependentMaximumWaterBound,true);assert.equal(e.legacy25LitresImported,false)
 assert.equal(r.inventory.bodyPlusExpansionDesignUpperLitres,350)
 assert.equal(r.inventory.upperColdHotReturnRisersAndFittingsIncluded,false)
 assert.equal(r.inventory.primaryBufferIncluded,false);assert.equal(r.inventory.actualMaximumWholeConnectedReleaseLitres,null)
 assert.equal(e.maximumNormalHeatedInventoryLitres,370)
 near(e.initialWaterUpperLitres,.5555555555555571)
 near(e.thermalExpansionUpperLitres,6.78207739307534)
 near(e.maximumNormalGaugeBar!,5.60438729956826)
 assert.equal(e.necessaryNormalThermalComparison,true)
 assert.equal(r.operating.normalDhwTemperatureC,60);assert.equal(r.operating.maximumColdMaintenanceTemperatureC,40)
 near(r.operating.actualSourceMaximumGaugeBar,9.2)
 assert.equal(r.operating.necessaryPressureDesignBoundaryScreen,true)
 assert.equal(r.operating.pipeTemperatureChangeUsedAsWaterTemperature,false)
 assert.equal(r.operating.maximumFaultTemperatureC,null);assert.equal(r.operating.maximumFaultTemperatureQualified,false)
 assert.equal(r.operating.normalTemperatureLimitPhysicallyQualified,false);assert.equal(r.operating.pressureMaterialAndSafetyControlsQualified,false)
 assert.equal(e.actualGasSeparatorPrechargeAndReliefQualified,false);assert.equal(e.regulatorLossAndSimultaneousDutyQualified,false)
 const small=structuredClone(choice);small.expansion.totalInternalCapacityLitres=5;small.expansion.maximumDrainableWaterLitres=5
 assert.equal(run(small).expansion.necessaryNormalThermalComparison,false)
 const highPressure=run(choice,{...source,inletMaximumAbsoluteBar:10.8})
 assert.equal(highPressure.operating.necessaryPressureDesignBoundaryScreen,false)
 assert.ok(highPressure.diagnostics.includes('STORE_VESSEL/pressure-design-boundary-below-actual-source'))
})
test('missing, forged, nonnumeric and unsupported data reject without mutating the source',()=>{
 const before=JSON.stringify({choice,source})
 const absent=structuredClone(choice) as Partial<typeof choice>;delete absent.expansion
 assert.throws(()=>run(absent),/Unsupported/)
 assert.throws(()=>inletStoreVessel({...{choice,source},unexpected:1} as Parameters<typeof inletStoreVessel>[0]),/Unsupported/)
 assert.throws(()=>run({...choice,installedAcceptance:true}),/Unsupported/)
 assert.throws(()=>run({...choice,maximumBodyAndPortsLitres:'330'}),/Unsupported/)
 assert.throws(()=>run({...choice,operating:{...choice.operating,normalDhwTemperatureC:90}}),/Unsupported/)
 assert.throws(()=>run({...choice,expansion:{...choice.expansion,maximumDrainableWaterLitres:19}}),/Unsupported/)
 assert.throws(()=>run(choice,{...source,groundFflMm:NaN}),/Unsupported/)
 assert.throws(()=>run(choice,{...source,immersionPortLocalXYMm:[10000,4250]}),/Unsupported/)
 run();assert.equal(JSON.stringify({choice,source}),before)
})
