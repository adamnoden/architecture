import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
import {cookerFault} from './cooker-fault.mjs';
import {servicePlate,storePlate} from './occupied-service-plate.mjs';
const x=deriveCurrentHouse(),m=x.model,s=m.architecturalServices;
const near=(a,b,tol=1e-5)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
test('recovered 46 openings and 15 actual level-specific occupied room loads reproduce',()=>{
 const record=JSON.parse(readFileSync(new URL('inhabited-service-rooms.json',import.meta.url)));
 near(s.heat.hotSpareW,467.4952459946253);near(s.heat.minRoomMarginW,62.65234371925908);
 near(s.heat.designHotW,record.totals.designHotW);assert.equal(s.heat.count,15);assert.equal(s.heat.closedOpenings,46);
 assert.equal(s.emitters.length,16);assert.equal(s.roomElectric.length,4);
 for(const e of s.emitters)assert.deepEqual((e.level?m.upperFurniture:m.groundFurniture)['service-emitter-'+e.id],e.completePlanWithValvesAndBrackets);
});
test('current independent DHW and corrected three-shutter operating states reproduce without retroactive predecessor change',()=>{
 const record=JSON.parse(readFileSync(new URL('inhabited-service-faults.json',import.meta.url))),a=s.cooker.closure.proof;
 near(a.hoodLps[0],record.air.hoodLps[0]);near(a.failedSupplyDoorN,14.0803987);
 assert.equal(a.cases,96);assert(a.hotPa[0]>-4.01&&a.hotPa[1]<-3.5);assert.equal(a.requiredLoadedClosureS,4.75);
 assert.equal(s.hotWater.missedL40,0);near(s.hotWater.minimumMixedC,46.8842824);
 assert.equal(s.plant.cylinder.stockMS103.acceptedAt3point5Bar,false);
 assert.deepEqual(m.groundFurniture['plant-water-reserve'],[9450,3870,760,760]);
 assert(s.plant.primaryBuffer.defrostKWh<s.plant.primaryBuffer.chargedKWh);
 assert.equal(m.protectedDoorAirTransfer.length,8);assert.equal(m.wetWallAirTransfer.length,4);
 assert.equal(x.courtReceiver.id,'HAD-COURT-BYPASS-01');assert.equal(x.installedPerformance,false);
});

test('store cradle clears the two piers and retained plant only after first release',()=>{
  const route=m.storeExchange;
  assert.equal(route.centredWest,8);
  assert.equal(route.offset,17);
  assert.equal(route.jacketToCartEdge,28);
  assert.equal(route.fixed.westWall,25);
  assert.equal(route.fixed.riser,25);
  assert(Object.values(route.fixed).every(c=>c>=route.margin));
  assert.equal(route.retainedManifoldAxis,-15);
  near(route.firstManifoldAxisContact,76.08485357);
  near(route.tundishAxis,91.57526073);
  near(route.maxRetainedValveRadius,45.96045419);
});

test('published schedule and both figures reproduce from the complete house option',()=>{
  for(const [file,render] of [['current-house-services.json',scheduleText],['current-house-services.svg',servicePlate],['store-exchange.svg',storePlate]])
    assert.equal(readFileSync(new URL(file,import.meta.url),'utf8'),render(x),file);
  assert.equal(Object.keys(x.inputs).length,10);
});

test('same seat time, different flow histories: the room pressure can fail or recover',()=>{
  const {lateSeat,stagedEarlyFlow,largeAirVolume}=s.cooker.closure.supplyLoss;
  assert(lateSeat.atDeadline<-12 && lateSeat.lastOutside>5.9);
  assert(stagedEarlyFlow.atDeadline>-4 && stagedEarlyFlow.lastOutside<4.5);
  assert(largeAirVolume.lastOutside<4.6);
  assert(Math.abs(cookerFault(x,{dt:.00025}).atDeadline-stagedEarlyFlow.atDeadline)<.002);
  for(let mask=0;mask<32;mask++){
    const result=cookerFault(x,{mask,volumeScale:1.2});
    assert(result.atDeadline>=-5 && result.lastOutside<4.61,`mask ${mask}`);
  }
});
test('rear WC option costs the actual alternative without deleting a wet fan or lowering house duty',()=>{
  const option=x.separateRearOption;
  assert.equal(option.wc,4);assert.equal(option.roomFans,s.fanAccess.length);
  assert.deepEqual([option.cold,option.hot,option.bathingPlaces],[13,8,2]);
  assert.equal(option.omittedRearBranchMM,3370);assert.equal(option.bedroom4TwoDoorsToBathMM,18764.2);
});

test('the unpowered house needs a measured outward path even when all shutters reach their seats',()=>{
  const result=s.cooker.closure.lossOfExhaust;
  assert(result.allExtractsOffOneWay.atDeadline>35);
  assert(result.hoodTrip.maximum>18 && result.hoodTrip.atDeadline<0);
  assert(result.allExtractsOffTwoWay.lastOutside<3.4);
  const area=result.sixInletsEachReverseEquivalentMM2;
  for(const v of m.servicesInterface.supply) assert.equal(v.minimumReverseEquivalentArea,area);
  for(let blockedOutlet=0;blockedOutlet<6;blockedOutlet++){
    const loss=cookerFault(x,{fault:'power',mask:0,volumeScale:1.2,reverseArea:area,blockedOutlet});
    assert(loss.lastOutside<3.86 && loss.atDeadline<.81);
  }
});

test('the first cold draw separates all three flat faces and preserves the tank jacket',()=>{
  const first=s.plant.independentSafety.firstRelease;
  assert.deepEqual(first.firstDraw,[-65,28,12]);
  assert(first.faceOpeningMM.every(n=>n>=9));
  assert(Object.values(first.jacketClearanceLowerMM).every(n=>n>=25));
  assert.equal(first.maxEngagementMM,0);
  assert.equal(s.cooker.fullInsulatedOD,227);
});
