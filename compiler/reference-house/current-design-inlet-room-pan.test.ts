import assert from 'node:assert/strict'
import test from 'node:test'
import { inletRoomPan, inletClosedOutfall } from './current-design/inlet-room-pan.js'
const input = { roomPlanMm:[9397,429.5,2173.5,2023.5],outletXmm:[9640,10160],inletYmm:689.5,
  invertMm:325,slopeRatio:100,floorMm:530,floorUndersideMm:515,distributionBottomMm:270,
  chuteWidthMm:400,chuteHeightMm:150,chuteSlopeRatio:50,datumMm:-180,settingMm:10,metalMm:2,insulationMm:20,
  waterStageComparisonsMm:{'both-blocked-to-floor':530,'declared-submerged':700,'dry':0} }
test('the actual folded pan descends to both mouths and fits with positive reserves without a trapped heel',()=>{
  const pan=inletRoomPan(input)
  assert.deepEqual(pan.surfaceMm,[319.8,356.74])
  assert.equal(pan.twoOpenOutlets.trappedHeelBelowOutletsMm,0)
  assert.equal(pan.oneBlockedOutlet.saddleAboveInvertMm,2.6)
  assert.ok(Math.abs(pan.bottomAfterInsulationAndSettingMm-17.8)<1e-9)
  assert.ok(Math.abs(pan.topAfterSettingMm-148.26)<1e-8)
  assert.equal(pan.necessaryGeometryScreen,true)
  assert.ok(pan.upstandFaces.length>12)
  assert.equal(pan.internalStepFaces.length,8)
  assert.equal(pan.flowInterfaceFaces.length,4)
  assert.ok(pan.completeDevelopedSheetOnlyKg!>pan.slopingSheetOnlyKg)
  assert.ok(pan.afterLowerSettingDevelopedSheetUpperKg!>pan.completeDevelopedSheetOnlyKg!)
  assert.equal(pan.rejectedFlatAtDistributionBase.trappedHeelMm,55)
  assert.equal(pan.rejectedFlatAtDistributionBase.bottomAfterInsulationAndSettingMm,-32)
  assert.equal(pan.wholeFaultMaximumLoadKg,null)
  assert.equal(pan.assuredAvailableStorageLitres,null)
  const steeper=inletRoomPan({...input,slopeRatio:50})
  assert.ok(steeper.surfaceMm[1]>pan.surfaceMm[1])
  assert.ok(steeper.nominalGrossWaterToFloorLitres!<pan.nominalGrossWaterToFloorLitres!)
})
test('exact pressure on every inclined/vertical face balances independently integrated water weight and first moments',()=>{
  const pan=inletRoomPan(input),hydro=pan.hydrostaticCases.find(c=>c.id==='both-blocked-to-floor')!,
    columns=pan.waterLoadOrigins.reduce((s,c)=>{
      for(const k of Object.keys(s) as (keyof typeof s)[])s[k]+=c.wrenchKN_KNm[k]
      return s
    },{Fx:0,Fy:0,Fz:0,Mx:0,My:0,Mz:0})
  for(const k of Object.keys(columns) as (keyof typeof columns)[])
    assert.ok(Math.abs(hydro.summedSurfaceWrenchKN_KNm[k]-columns[k])<1e-9,k)
  const sum=pan.waterLoadOrigins.reduce((s,c)=>s+c.massKg,0)
  assert.ok(Math.abs(sum-pan.afterLowerSettingGrossWaterToFloorUpperKg!)<1e-9)
  assert.ok(Math.abs(columns.Fz+sum*9.80665/1000)<1e-9)
  assert.ok(Math.abs(columns.My)>0.1,'The actual asymmetrical drain placement must retain its real moment')
  const submerged=pan.hydrostaticCases.find(c=>c.id==='declared-submerged')!
  assert.equal(submerged.stageAboveFlushFloorMm,170)
  assert.ok(submerged.summedSurfaceWrenchKN_KNm.Fz<columns.Fz)
  assert.equal(submerged.actualSourceTransientJetAirPressureAndOverflowDistributionQualified,false)
  assert.match(submerged.interpretation,/NOT containment/)
  assert.ok(pan.hydrostaticCases.find(c=>c.id==='dry')!.metalFaceLoads.every(c=>c.wrenchKN_KNm.Fz===0))
})
test('a pan crossing its overflow plane cannot supply a fake exact storage or water-load integral',()=>{
  const bad=inletRoomPan({...input,invertMm:510,distributionBottomMm:450})
  assert.equal(bad.necessaryGeometryScreen,false)
  assert.equal(bad.nominalGrossWaterToFloorLitres,null)
  assert.equal(bad.afterLowerSettingGrossWaterToFloorUpperKg,null)
  assert.deepEqual(bad.hydrostaticCases,[])
  assert.ok(bad.diagnostics.includes('INLET_ROOM_PAN_CROSSES_OVERFLOW_PLANE_WATER_INTEGRAL_UNSUPPORTED'))
  assert.throws(()=>inletRoomPan({...input,slopeRatio:0}),/Unsupported/)
})


test('real closed outfalls carry stock/water and actual metal/interface pressure without a fictitious capped port',()=>{
  const origin=[10483.75,1441.25,-180],stages={'both-blocked-to-floor':530,submerged:700},
    pan=inletRoomPan({...input,waterStageComparisonsMm:stages}),
    pipe=inletClosedOutfall({id:'HAD/utility-floor-outfall-1',axisXMm:9640,wallInnerYMm:429.5,terminalYMm:-990,
      wallInvertMm:319.8,terminalInvertMm:291.41,widthMm:400,heightMm:150,metalMm:2,originMm:origin,settingMm:10,waterStageComparisonsMm:stages})
  assert.ok(Math.abs(pipe.fullWaterInventoryControl.massKg-85.17)<1e-9)
  assert.ok(Math.abs(pipe.bodyStockGravity.massKg-28.18468352)<1e-9)
  for(const c of pipe.hydrostaticCases){
    assert.equal(c.fullWaterPrism,true)
    const sum=c.summedClosureWrenchKN_KNm,weight=pipe.fullWaterInventoryControl.wrenchKN_KNm
    for(const k of Object.keys(weight) as (keyof typeof weight)[])assert.ok(Math.abs(sum[k]-weight[k])<1e-9,k)
    const a=c.openInterfaceLoads.find(l=>l.id.includes('inside-open-cut'))!,
      halves=pan.hydrostaticCases.find(p=>p.id===c.id)!.openPortInterfaceLoads.filter(l=>l.id.includes('port-2')||l.id.includes('port-3'))
    assert.equal(halves.length,2)
    for(const k of Object.keys(weight) as (keyof typeof weight)[])assert.ok(Math.abs(a.wrenchKN_KNm[k]+halves.reduce((s,h)=>s+h.wrenchKN_KNm[k],0))<1e-9,'joined '+k)
  }
  assert.equal(pipe.fullWaterGravityIsNotAdditionalToHydrostaticMetalLoads,true)
})
