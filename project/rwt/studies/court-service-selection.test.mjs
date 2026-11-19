import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {serviceSelection} from './court-service-selection.mjs';
import {serviceDrawing} from './court-service-selection-plate.mjs';

const r=serviceSelection();
test('a blind in motion can surcharge the high outlet before the court reaches its quiet reference',()=>{
  const [ordinary,long]=r.windows.cases;
  assert.deepEqual(r.windows.shadows,[62.5,170]);
  assert.equal(ordinary.lifts[1].restrictedCrestWidth,67.5);
  assert(ordinary.lifts[1].openSoffitClear>17);
  assert(long.lifts[1].openSoffitClear<0 && long.lifts[1].impactToQuietReference>10);
  assert.equal(r.windows.allowLongWhileChangingScreen,false);
  assert.equal(ordinary.holesToVerify,102);
});
test('worker has a dry exit, a reachable surface eye and exclusion from every loaded movement',()=>{
  const h=r.handling;
  assert.equal(h.shoes.length,4); assert.equal(h.smallRests.length,3); assert(h.rackClear>=20);
  assert(h.entryGap>300 && h.bayAtFeet>=40 && h.guardGap>=35);
  assert(h.allClear>65 && h.innerWall>340 && h.wandReserve>13);
  assert(h.thickSlotReserve>12 && h.hookFit.remainingGrossKgAfterLidAndHook>14 && h.includingMovingArmKNm.E>.24);
  assert(h.surfaceEyeMaximumReach<1900 && h.bareEyeVerticalReach>2100);
  assert(Object.values(h.minimumRestoringKNm).every(m=>m>.1));
});
test('accepted programme scope and its selected source regenerate, with site and wet acceptance open',()=>{
  assert.equal(r.duties.length,6);
  assert.equal(r.successor,'RWT-07'); assert.equal(r.ground.eastDry.footEnd,21900);
  assert.equal(r.qualifiedFirstHarm,null);assert.equal(r.acceptedSite,false);
  assert.deepEqual(JSON.parse(readFileSync(new URL('./court-service-selection.json',import.meta.url))),r);
  assert.equal(readFileSync(new URL('./court-service-selection.svg',import.meta.url),'utf8'),serviceDrawing(r));
});
