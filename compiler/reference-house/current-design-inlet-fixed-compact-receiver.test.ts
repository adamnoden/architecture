import assert from 'node:assert/strict'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSillInsertCase,runInletSillInsertCase} from './current-design/inlet-sill-insert.js'
import {readInletFaultCase,runInletFaultCase} from './current-design/inlet-fault.js'
import {compileFixedInletCandidate,readFixedInletSettings} from './current-design/inlet-fixed-entry.js'
import {compareCurrentFixedInletSupport} from './current-design/inlet-fixed-support-integration.js'
import {compareFixedInletReceiver} from './current-design/inlet-fixed-receiver.js'
import {compareCompactFixedInletReceiver} from './current-design/inlet-fixed-compact-receiver.js'

function current(overrides:Partial<ReturnType<typeof readFixedInletSettings>>={}){
  const resolved=readCurrentDesignResolution(),insertCase=readInletSillInsertCase(resolved).insert,insert=runInletSillInsertCase(resolved,insertCase)
  const faultCase=readInletFaultCase(resolved,insertCase).fault,fault=runInletFaultCase(resolved,faultCase,insertCase)
  return compareCurrentFixedInletSupport(resolved,compileFixedInletCandidate(resolved,{...readFixedInletSettings(),riserYMm:600,...overrides},{insert,faultCase,fault}))
}

test('the finite cantilever has physical interfaces and conditional internal capacity rather than inherited supplier admission',()=>{
  const joined=current(),result=joined.compactReceiver
  assert.equal(joined.receivers.guidedRoute.disposition,'retired-continuous-backplate-comparison')
  assert.ok(result.mass.representedSteelUpperBoundKg<joined.receivers.guidedRoute.mass.knownFabricatedSteelKg*.6)
  assert.equal(result.geometry.jambAxisXMm,10502.5)
  assert.equal(result.geometry.railBoxesMm[0][0],10030)
  assert.equal(result.geometry.railBoxesMm[0][3],472.5)
  assert.equal(result.internalComparisons.railPlateAndWeldPass,true)
  assert.equal(result.internalComparisons.localSteelPass,true)
  assert.equal(result.internalComparisons.conditionalTubeContactPass,true)
  assert.equal(result.internalComparisons.isolatedCatalogueScreenPass,true)
  assert.equal(result.completeSupportCapacity,false)
  assert.equal(result.strDuty.sourceLongitudinalCage.transverseDiameterMm,null)
  for(const mount of result.geometry.pipeMounts){
    assert.ok(mount.mountingPlateToBareTubeAfter5Mm>=0)
    if(mount.kind==='fixed-clamp'){
      assert.equal(mount.firstCouplingParkClearAfter5Mm,104)
      assert.equal(mount.boreDiameterMm,28)
    }
    const plate=mount.mountingPlateBodyMm
    for(const lug of mount.rearLugBlanksMm)assert.equal(lug[1],plate[1]+plate[4])
    assert.equal(mount.bolt.nominalDiameterMm,10)
  }
  assert.ok(result.geometry.knownLocalSocketHoopDrillClearAfterTwo5Mm>0)
  assert.equal(result.operatingReview.nativeJawToSupportBoundsClear,true)
  assert.ok(result.operatingReview.toolPoses.every(pose=>pose.supportBodiesAfter5Mm>=0))
  assert.equal(result.operatingReview.lowerRenewalWithCurrentWeldedArmPass,true)
  assert.ok(result.operatingReview.lowerRenewalReview.every(row=>row.actualTranslationMm[1]===739.5&&row.bareTubeToPermanentSupportAfter5AndCurveMm>0))
  assert.equal(result.geometry.layout.guideZMm,1800)
  assert.deepEqual(result.geometry.backplates[1].anchorAxesMm.map(p=>p[2]),[1370,1730])
  const lower=result.geometry.backplates[0],upper=result.geometry.backplates[1],port=lower.throughPortMm!
  assert.deepEqual([port[2],port[2]+port[5]],[900,1000])
  assert.ok(lower.bodyMm[2]+lower.bodyMm[5]<1270-30-5)
  assert.ok(upper.bodyMm[2]>1270+30+5)
  for(const plate of result.geometry.backplates)for(const toe of plate.toePackingStripsMm){
    assert.equal(toe[1],result.geometry.jambFaceYMm)
    assert.equal(toe[1]+toe[4],plate.bodyMm[1])
  }
})

test('a separate point-load control recovers all three lever moments about the actual jamb and gravity is not smeared',()=>{
  const joined=current(),reference=joined.receivers.guidedRoute,input=reference.sourceContext,operating=joined.compactReceiver.sourceContext.operating
  const zero={...input,branches:input.branches.map(b=>({...b,pressureEndForceN:0,knownStockMassKg:0,guidedThermalActions:{
    fixedPointWrench:{...b.guidedThermalActions!.fixedPointWrench,forceComponentBoundsN:[0,0,0],momentComponentBoundsNmm:[0,0,0]},
    guideWrench:{...b.guidedThermalActions!.guideWrench,forceComponentBoundsN:[0,0,0],momentComponentBoundsNmm:[0,0,0]}}}))}
  const dead=compareCompactFixedInletReceiver(compareFixedInletReceiver(zero,'guided-route'),operating)
  const loaded=compareCompactFixedInletReceiver(compareFixedInletReceiver({...zero,branches:zero.branches.map((b,i)=>({...b,pressureEndForceN:i===0?100:0}))},'guided-route'),operating)
  const a=dead.joints[0].wallWrench,b=loaded.joints[0].wallWrench,dx=10502.5-input.branches[0].pipeAxisXMm
  assert.ok(Math.abs(b.forceComponentBoundsN[1]-a.forceComponentBoundsN[1]-100)<1e-5)
  assert.ok(Math.abs(b.forceComponentBoundsN[2]-a.forceComponentBoundsN[2]-100)<1e-5)
  assert.ok(Math.abs(b.momentComponentBoundsNmm[0]-a.momentComponentBoundsNmm[0]-100*(600-402.5+880-850))<1e-5)
  for(const axis of [1,2])assert.ok(Math.abs(b.momentComponentBoundsNmm[axis]-a.momentComponentBoundsNmm[axis]-100*dx)<1e-5)
  const ledger=dead.mass.ledger.filter(row=>row.level===850)
  assert.ok(Math.abs(a.forceComponentBoundsN[2]-ledger.reduce((n,row)=>n+row.massUpperKg*9.81,0))<1e-5)
  assert.ok(Math.abs(a.momentComponentBoundsNmm[1]-ledger.reduce((n,row)=>n+row.massUpperKg*9.81*Math.abs(row.pointMm[0]-10502.5),0))<1e-5)
  assert.ok(Math.abs(a.momentComponentBoundsNmm[0]-ledger.reduce((n,row)=>n+row.massUpperKg*9.81*Math.abs(row.pointMm[1]-402.5),0))<1e-5)
})

test('full fixed-point couples enter local plate/contact proof and the full-restraint frame cannot masquerade as compact release',()=>{
  const joined=current(),reference=joined.receivers.guidedRoute,operating=joined.compactReceiver.sourceContext.operating,withMoment=compareCompactFixedInletReceiver(reference,operating)
  const released=compareFixedInletReceiver({...reference.sourceContext,branches:reference.sourceContext.branches.map(b=>({...b,guidedThermalActions:{...b.guidedThermalActions!,
    fixedPointWrench:{...b.guidedThermalActions!.fixedPointWrench,momentComponentBoundsNmm:[0,0,0]}}}))},'guided-route')
  const noMoment=compareCompactFixedInletReceiver(released,operating)
  assert.ok(withMoment.local[1].steelStressMpa.mountingPlate>noMoment.local[1].steelStressMpa.mountingPlate*3)
  assert.ok(withMoment.local[1].clamp.pressureContactEnvelopeMpa>noMoment.local[1].clamp.pressureContactEnvelopeMpa*3)
  assert.deepEqual(withMoment.geometry,noMoment.geometry)
  assert.throws(()=>compareCompactFixedInletReceiver(compareFixedInletReceiver(reference.sourceContext,'full-restraint'),operating),/actual guided-route/)
})

test('actual hood and funnel datums control M10 fit without moving the declared pipe restraints',()=>{
  const joined=current(),reference=joined.receivers.guidedRoute,operating=joined.compactReceiver.sourceContext.operating
  const narrow={...operating,hoods:operating.hoods.map(h=>({...h,bodyMm:[h.bodyMm[0],h.bodyMm[1],h.bodyMm[2],150,h.bodyMm[4],h.bodyMm[5]]}))}
  const wide={...operating,hoods:operating.hoods.map(h=>({...h,bodyMm:[h.bodyMm[0],h.bodyMm[1],h.bodyMm[2],165,h.bodyMm[4],h.bodyMm[5]]}))}
  const rejected=compareCompactFixedInletReceiver(reference,narrow),replacement=compareCompactFixedInletReceiver(reference,wide)
  assert.equal(rejected.operatingReview.actualCurrentHoodsFitM10Ears,false)
  assert.equal(replacement.operatingReview.actualCurrentHoodsFitM10Ears,true)
  assert.equal(replacement.geometry.proposedSiblingHoodGapAfterTwo3MetalAndTwo5SettingMm,24)
  assert.equal(replacement.geometry.hoodReview[1].fixedClampBottomToActualFunnelTopAfter3MetalAnd5SettingMm,12)
  assert.equal(replacement.operatingReview.actualFunnelToSupportBoundsClear,true)
  assert.equal(replacement.operatingReview.lowerRenewalWithCurrentWeldedArmPass,true)
  const raisedFunnel=compareCompactFixedInletReceiver(reference,{...wide,hoods:wide.hoods.map(h=>({...h,bodyMm:[h.bodyMm[0],h.bodyMm[1],820,h.bodyMm[3],h.bodyMm[4],h.bodyMm[5]]}))})
  assert.equal(raisedFunnel.operatingReview.actualFunnelToSupportBoundsClear,false)
  assert.deepEqual(rejected.joints,replacement.joints)
})

test('the actual shifted cuts and guide resolve the rejected second jaw pose while retaining the full positive-Y lower draw',()=>{
  const before=current({lowerCutZMm:975,upperCutZMm:1425,valveCentreZMm:1200,upperPipeGuideZMm:1680}),after=current()
  assert.equal(before.compactReceiver.operatingReview.nativeJawToSupportBoundsClear,false)
  assert.equal(after.compactReceiver.operatingReview.nativeJawToSupportBoundsClear,true)
  assert.equal(before.compactReceiver.operatingReview.lowerRenewalWithCurrentWeldedArmPass,true)
  assert.equal(after.compactReceiver.operatingReview.lowerRenewalWithCurrentWeldedArmPass,true)
  assert.ok(after.compactReceiver.operatingReview.toolPoses.filter(p=>p.cycle===2&&p.joint==='lower-riser').every(p=>p.supportBodiesAfter5Mm>15))
  assert.equal(after.thermal[0].result.guideWrench.pointMm[2],1800)
  assert.equal(after.receivers.guidedRoute.actions.thermalActionWrenches[0].guide.pointMm[2],1800)
  assert.ok(!after.diagnostics.includes('COMPACT_WELDED_ARM_BLOCKS_LOWER_L_EXTRACTION'))
  const reverse=compareCompactFixedInletReceiver(after.receivers.guidedRoute,{...after.compactReceiver.sourceContext.operating,
    renewals:after.compactReceiver.sourceContext.operating.renewals.map(row=>({...row,translationMm:[0,-739.5,0]}))})
  assert.equal(reverse.operatingReview.lowerRenewalWithCurrentWeldedArmPass,false)
})

test('the actual60mm hood setting adds fabrication space without changing the solved support load path',()=>{
  const before=current(),wider=current({controlHoodEastAllowanceMm:60})
  assert.ok(wider.compactReceiver.geometry.hoodReview.every(h=>h.currentBodyMm[3]===170&&h.currentM10EarToEastSideAfter3MetalAnd5SettingMm===7))
  assert.equal(wider.compactReceiver.geometry.proposedSiblingHoodGapAfterTwo3MetalAndTwo5SettingMm,19)
  const east=Math.max(...wider.compactReceiver.geometry.hoodReview.map(h=>h.currentBodyMm[0]+h.currentBodyMm[3]))
  assert.equal(wider.hostWindow.candidateClearXMm[1]-east-8,47)
  assert.equal(wider.compactReceiver.operatingReview.nativeJawToSupportBoundsClear,true)
  assert.equal(wider.compactReceiver.operatingReview.lowerRenewalWithCurrentWeldedArmPass,true)
  assert.deepEqual(wider.compactReceiver.joints,before.compactReceiver.joints)
})
