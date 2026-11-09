import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {serviceRoutes} from './joined-service-routes.mjs';
const {record:r,plate}=serviceRoutes(),{roof,ground}=r;
const eq=(a,b,epsilon=1e-7)=>assert.ok(Math.abs(a-b)<epsilon,`${a} is outside tolerance of ${b}`);
test('selected HAD, generated record and figure refer to the same service state',()=>{
  assert.deepEqual(r,JSON.parse(readFileSync(new URL('./joined-service-routes.json',import.meta.url))));
  assert.equal(plate,readFileSync(new URL('./joined-service-routes.svg',import.meta.url),'utf8'));
  assert.equal(ground.aisle,700);assert.equal(r.disposition.qualifiedFirstHarm,null);assert.equal(r.disposition.complete,false);
});
test('source roof is allocated once and all five retained-neighbour movements are bounded',()=>{
  eq(roof.tributary.combined,3.60375);eq(roof.tributary.oneCorner,.7704);eq(roof.tributary.directCourt,.52215);
  assert.ok(roof.reach.formerAdverse<0&&roof.reach.shortenedAdverse>12);
  assert.ok(roof.straight.freeThrow>roof.straight.unhoodedLanding&&roof.straight.lowerExitBelowSpill>0);
  assert.equal(roof.straight.bays.length,5);assert.equal(roof.straight.bays[2].upstream,0);
  for(const b of roof.straight.bays){assert.ok(b.turningDripReserve>26);if(b.upstream)assert.ok(b.pickupWater<6632);}
  for(const h of roof.straight.rows)assert.ok(h.rimReserve>11&&h.floodedBootControlReserve>117);
});
test('concentrated feed, local basin failure and restricted N tail remain separate',()=>{
  eq(ground.concentrated.localError,.969484736,1e-6);eq(ground.concentrated.localWithAllEdgeBlock,.258088706,1e-6);
  eq(ground.broad.headReserve,.159301169,1e-5);assert.ok(ground.broad.withAdditionalQuarterMm<3.60375);
  assert.ok(ground.failedBasket.northCases.every(x=>x.sourceAboveNearestN<0));
  assert.ok(ground.underApron.channelCases.every(x=>x.reserveFromOldSill>70));
  assert.ok(ground.underApron.pairedSurfaceToRoof<6);eq(ground.directHigh.nozzleSpoutPlanOverlap,4);
  assert.ok(ground.highReturn.pairedFreeboard>11&&ground.highReturn.parkedPastWellAfterTwo5===5);
  assert.ok(ground.highReturn.gratingCases[0].orificeHead>ground.highReturn.nominalLandingAboveGrate);
  assert.ok(ground.highReturn.gratingCases[1].orificeHead<ground.highReturn.pairedMinimumSillToHighestGrate);
});
