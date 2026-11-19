import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveWaterReplan} from './water-replan.mjs';
import {deriveGardenFailureBypass} from './garden-failure-bypass.mjs';
test('the occupied front exit continuously reaches a grade-level garden without N water or E maintenance',()=>{
  const v=deriveWaterReplan(),b=v.model.gardenFailureBypass;
  assert.equal(b.grade,v.model.approaches.authoredExteriorGrade);
  assert.deepEqual(b.frontApproach.route[0],[6000,0,0]);
  assert.deepEqual(b.bypass.at(-1),b.frontApproach.foot);
  assert(b.bypass.every(p=>p[2]===b.grade));
  assert.equal(b.frontApproach.foot[2],b.grade);
  assert(b.frontApproach.landings.every(l=>l.plan[3]===1200));
  assert.equal(b.flightSpacing-b.clearWidth,300);
  assert(b.actualTravel.total>b.actualTravel.frontFolded);
  assert.equal(b.checks.siteAccepted,false);
  assert.equal(b.checks.accessClassAccepted,false);
});
test('E staging cannot silently consume the west garden escape',()=>{
  const v=deriveWaterReplan();
  assert.throws(()=>deriveGardenFailureBypass(v.model,{servicePlatform:[-3000,-20000,3000,40000]}));
});

test('garden bypass consumes BOTH current receiver and blocked-outlet continuation, preserving history only as history',()=>{
 const v=deriveWaterReplan(),b=v.model.gardenFailureBypass,n=v.model.rwtReceivingInterface.north;
 assert.deepEqual(b.receivingN.plan,n.receiverBounds);
 assert.deepEqual(b.receivingN.requiredSpillContinuation,n.blockedOutletSpill.requiredContinuation);
 assert.deepEqual(b.receivingN.combinedExtent,[4250,13450,5750,16650]);
 assert.equal(b.receivingN.source.blob,v.model.rwtReceivingInterface.source.blob);
 assert.equal(b.receivingN.directedSpillBoundary.directionProved,false);
 assert.equal(b.checks.receivingContainmentAccepted,false);
 assert.equal(b.checks.gardenEastReserve,250);assert.equal(b.checks.westBypassEastReserve,2150);
 const gardenHit=structuredClone(v.model);gardenHit.rwtReceivingInterface.north.blockedOutletSpill.requiredContinuation=[-100,15150,1500,1500];
 assert.throws(()=>deriveGardenFailureBypass(gardenHit,v.renewal),/Usable garden overlaps/);
 const routeHit=structuredClone(v.model);routeHit.rwtReceivingInterface.north.blockedOutletSpill.requiredContinuation=[-2500,13250,1000,1000];
 assert.throws(()=>deriveGardenFailureBypass(routeHit,v.renewal),/Garden bypass overlaps/);
});
