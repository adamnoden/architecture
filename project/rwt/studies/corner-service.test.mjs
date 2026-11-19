import test from 'node:test';
import assert from 'node:assert/strict';
import {cornerService,floorStations,extendedIntake} from './corner-service.mjs';
import {cleanout} from './ground-mouth-cleanout.mjs';

const c=cornerService();
test('both corner edges release in the diagonal move; two reflected source outlets share one point',()=>{
  assert.deepEqual(c.duplicateLead,[4500,4500]);
  assert.deepEqual([c.oldReturnLoss,c.oldClear],[270,3200]);
  assert.deepEqual([c.tray.primaryActive,c.tray.secondaryActive,c.tray.dryClear],[85,105,45]);
  assert.ok(c.tray.untouchedStripAfterSeam>478 && c.tray.armOverlap===150);
  assert.ok(c.moving.oldGuardHitsCorner);
  assert.ok(c.moving.guardEach>134 && c.moving.midClear===121 && c.moving.topClear===101);
  assert.equal(c.moving.restReserve,50);
  assert.deepEqual(c.compare.wellOverlap,[175,100]);
});
test('remove the common throat before lowering; blocked receiver can cross under the draw but cannot discharge raw into the shallow ground body',()=>{
  assert.equal(c.spool.fixedTopToDraw,135);
  assert.equal(c.spool.parkToPickup,25);
  assert.ok(c.spool.sweptBandClear>136 && c.pickup.minPlanGap>90);
  assert.ok(c.pickup.stageReserve>9 && c.pickup.stageReserve<10);
  assert.ok(c.header.headReserve>113 && c.header.overheadToDraw===145 && c.header.firstRestPlanReserve>299);
  assert.ok(c.header.jet.every(x=>x.conjugate>100));
  assert.ok(c.chamber.localConjugate>70 && c.chamber.localConjugate<71);
  assert.equal(c.chamber.crewGap,750);
  assert.ok(c.chamber.coverLiftKN>9.75 && c.chamber.blockedStaticKPa>60.96);
  assert.ok(Object.values(c.compare.cornerReactions).every(rs=>Math.min(...rs)<0 && Math.abs(rs.reduce((a,b)=>a+b)-5)<1e-8));
});
test('priced tool head and leading shoe clear both drips on the insertion, descent and bed sweep',()=>{
  assert.deepEqual(c.vacuum.original.requiredPole,[5980,6770]);
  assert.deepEqual(c.vacuum.modular.requiredPole,[5815,6630]);
  assert.equal(c.vacuum.narrowBendOnModular.poleOutsideGutter,-15);
  assert.deepEqual(Object.values(floorStations()).map(s=>s.missed.length),[0,115,142,15]);
  assert.ok(Object.values(floorStations(true,1175)).every(s=>!s.missed.length));
  for(const h of [c.vacuum.original,c.vacuum.modular]){
    assert.equal(h.shieldSideReserve,15);
    assert.ok(h.poleOutsideGutter>=65 && h.shoeToSecondaryOnDescent>=35);
    assert.deepEqual([h.reachToInsideEdge,h.reachToOutsideEdge],[5,5]);
  }
});
test('the old tool ports miss the high sill hidden behind a rail; separate oblique guides reach both mouths',()=>{
  const a=cleanout(false), b=cleanout();
  assert.equal(a.sillMisses,25);
  assert.deepEqual([b.station,b.existingPostY,b.postY],[14950,[6350,7450],[5950,7850]]);
  assert.deepEqual([b.wetFootingGap,b.armLength,b.momentKNm],[75,575,2.875]);
  assert.ok(b.railBottomAtCrest>-1130);
  assert.deepEqual([b.targetCount,b.sillTargets,b.missed,b.sillMisses],[4105,1419,0,0]);
  assert.ok(b.longest<1804 && b.ports.length===13);
  assert.equal(b.frames.length,11);
  assert.deepEqual(b.frames.filter(f=>f.yMax-f.yMin>180),[
    {x:14350,yMin:6010,yMax:6340},{x:14750,yMin:6010,yMax:6340}
  ]);
});

test('price new clear E inlet after loss at the deepest quarter and the placed approach loss',()=>{
  assert.ok(extendedIntake(125,0)<c.flow && extendedIntake(150,0)>c.flow);
  assert.ok(extendedIntake(250,3.36)<c.flow && extendedIntake(300,3.36)>c.flow);
  assert.ok(extendedIntake(300,5)<c.flow);
});
