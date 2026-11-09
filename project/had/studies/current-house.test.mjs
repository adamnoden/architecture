import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
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
  assert.equal(Object.keys(x.inputs).length,9);
});
