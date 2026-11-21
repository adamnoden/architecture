import assert from 'node:assert/strict'
import test from 'node:test'
import {compareFixedInletThermalRoute,compareFixedInletThermalWithReceiver} from './current-design/inlet-fixed-thermal.js'
import {readInletCabinetCase,runInletCabinetCase} from './current-design/inlet-cabinet-copper.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
const input={pathMm:[[0,-600,300],[0,0,300],[130,0,300],[130,0,2800],[900,0,2800],[900,1700,2800]] as const,fixedPointZMm:1900,guideZMm:2100,temperatureExcursionK:40,pipe:{outerDiameterMm:28,wallMm:1.2,elasticModulusMpa:117200,poissonRatio:.34,expansionMmMK:.017}}
const post={baseZMm:100,postAxisXYMm:[130,-80] as const,topZMm:2130,widthXMm:60,depthYMm:80,wallMm:4,elasticModulusMpa:200000,poissonRatio:.3}
const near=(a:readonly number[],b:readonly number[],relative=1e-5)=>a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<relative*Math.max(1,Math.abs(b[i])),`${v} != ${b[i]}`))
test('one finite receiver converges to the original rigid control and preserves compatibility, zero and linear thermal response',()=>{
 const rigid=compareFixedInletThermalRoute(input),limit=compareFixedInletThermalWithReceiver(input,{...post,elasticModulusMpa:1e16}),finite=compareFixedInletThermalWithReceiver(input,post)
 near(limit.fixedPointWrench.uniformForceN,rigid.combinedFixedPointWrench.uniformForceN)
 near(limit.fixedPointWrench.uniformMomentNmm,rigid.combinedFixedPointWrench.uniformMomentNmm)
 near(limit.fixedPointWrench.forceComponentBoundsN,rigid.combinedFixedPointWrench.forceComponentBoundsN)
 assert.equal(finite.compatibilityResidual,0);assert.equal(finite.postComplianceSymmetryError,0)
 assert.notDeepEqual(finite.fixedPointWrench,limit.fixedPointWrench)
 assert.ok(Math.max(...finite.fixedPointReceiverMotion.translationBoundsMm)>0)
 const zero=compareFixedInletThermalWithReceiver({...input,temperatureExcursionK:0},post),twice=compareFixedInletThermalWithReceiver({...input,temperatureExcursionK:80},post)
 assert.deepEqual(zero.fixedPointWrench.forceComponentBoundsN,[0,0,0]);assert.deepEqual(zero.fixedPointReceiverMotion.translationBoundsMm,[0,0,0])
 near(twice.fixedPointWrench.forceComponentBoundsN,finite.fixedPointWrench.forceComponentBoundsN.map(n=>n*2))
 assert.throws(()=>compareFixedInletThermalWithReceiver(input,{...post,baseZMm:2000}),/finite receiver/)
})
test('whole copper cabinet recomputes real routes, access, quantities, source window costs and rejects stale or undeclared settings',()=>{
 const d=readCurrentDesignResolution(),request=readInletCabinetCase(d),baseline=runInletCabinetCase(d,request.cabinet)
 assert.equal(baseline.branches.length,2);assert.equal(baseline.selected,false);assert.equal(baseline.installedAcceptance,false)
 assert.equal(baseline.productFacts.pipe.model,'Lawton TY0283');assert.equal(baseline.productFacts.elbow.sku,'HH-5020401--')
 assert.ok(baseline.branches.every(c=>c.valveSideAfter5Mm>40&&c.wrenchSideAfter5Mm>100&&c.renewal.drawToFirstRestWasherAfter5Mm>100))
 assert.ok(baseline.pressureSupports.every(c=>c.grossSectionNormalStressMpa<c.grossSectionComparisonLimitMpa&&c.baseToFinishedBackAfter5Mm>10))
 assert.equal(baseline.architecture.sourceHost.nominalBoundingWindowObscuredMm2,977500)
 assert.ok(baseline.pressureSupports.every(c=>c.baseBodyMm[2]===0&&c.postBodyMm[2]===c.baseBodyMm[5]&&c.receivingDemand.socket30ToPostAfter5Mm>15&&c.receivingDemand.fourEqualStiffnessFastenerTensionUpperEachN>0))
 assert.equal(baseline.branches.flatMap(c=>c.materialResidues).length,6)
 assert.ok(baseline.branches.flatMap(c=>c.materialResidues).every(c=>!c.ownerExceptionApproved))
 const move=runInletCabinetCase(d,{...request.cabinet,settings:{...request.cabinet.settings,riserYMm:620}})
 assert.notDeepEqual(move.branches.map(c=>c.pathMm),baseline.branches.map(c=>c.pathMm));assert.notDeepEqual(move.pressureSupports,baseline.pressureSupports)
 assert.notDeepEqual(move.quantities,baseline.quantities);assert.deepEqual(move.architecture.sourceHost,baseline.architecture.sourceHost)
 const widen=runInletCabinetCase(d,{...request.cabinet,settings:{...request.cabinet.settings,cabinetWidthMm:900}})
 assert.notDeepEqual(widen.architecture.sourceHost,baseline.architecture.sourceHost);assert.notEqual(widen.reviewSvg,baseline.reviewSvg)
 assert.equal(JSON.stringify(runInletCabinetCase(d,JSON.parse(JSON.stringify(request.cabinet)))),JSON.stringify(baseline))
 assert.throws(()=>runInletCabinetCase(d,{...request.cabinet,bindingDigest:'stale'}),/Stale/)
 assert.throws(()=>runInletCabinetCase(d,{...request.cabinet,settings:{...request.cabinet.settings,pipeWallMm:.9}}),/domain/)
 assert.throws(()=>runInletCabinetCase(d,{...request.cabinet,selected:true}),/Versioned/)
 assert.throws(()=>runInletCabinetCase(d,{...request.cabinet,settings:{...request.cabinet.settings,cabinetXMm:9000}}),/both actual source compartments/)
 assert.ok(runInletCabinetCase(d,{...request.cabinet,settings:{...request.cabinet.settings,frontYMm:600,riserYMm:600}}).diagnostics.includes('RISER_OR_VALVE_NOT_CONTAINED_IN_CABINET'))
 const missing={...d,disciplineBindings:d.disciplineBindings.map(f=>f.id==='had-fixed-inlet-arrangement'?{...f,identities:{...f.identities,'compiler/reference-house/current-design/inlet-cabinet-copper.ts':'0'.repeat(40)}}:f)}
 assert.throws(()=>readInletCabinetCase(missing),/not admitted/)
})
