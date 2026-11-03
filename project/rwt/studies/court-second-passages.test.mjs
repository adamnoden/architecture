import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {investigateSecondOpenPassages} from './court-second-passages.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);

test('north has one 2400 clear outdoor daylight passage; each new trial consumes 5.1m2 before its walls',()=>{
 const a=investigateSecondOpenPassages();
 assert.deepEqual(a.source.selectedNorthLoggia,[4800,7750,2400,4250]);
 assert.equal(a.options.length,3);
 assert.deepEqual(a.options.map(x=>x.direction),['west','east','south']);
 for(const o of a.options){
  near(o.minimumOpenGroundTerritoryM2,5.1);
  assert.equal(o.verifiedIndependentDaylightExit,false);
 }
 assert.match(a.stop,/RWT-06 remains planned/);
});
test('west side-channel would break the stair and two selected court-window intervals',()=>{
 const w=investigateSecondOpenPassages().options[0];
 near(w.stairBodyOverlapM2,2.88);
 const named=w.courtAndOuterOpenings.filter(x=>x.face==='court-west').map(x=>[x.id,x.overlapMm]);
 assert.deepEqual(named,[['court-west-0',250],['court-west-1',250]]);
 assert(w.crossedInternalWalls.some(x=>x.id==='protected-stair-east'&&x.unopenedLengthMm>=1200));
 assert.match(w.sourceProtectedRouteConflict,/stair/);
});
test('east daylight passage would cut solid service spine and collide with source plant kit',()=>{
 const e=investigateSecondOpenPassages().options[1];
 assert(e.crossedInternalWalls.some(x=>x.id==='service-spine'&&x.unopenedLengthMm===1200));
 assert(e.crossedInternalWalls.some(x=>x.id==='plant-north'&&x.unopenedLengthMm>0));
 for(const id of ['plant-primary-buffer-round-bounding600','plant-controls']){
  const item=e.existingGroundEquipment.find(x=>x.id===id);
  assert(item&&item.overlapAreaM2>0,id);
 }
 assert.deepEqual(e.courtAndOuterOpenings.filter(x=>x.face==='court-east').map(x=>x.overlapMm),[250,250]);
 assert.equal(e.stairBodyOverlapM2,0);
});
test('south route traverses the selected protected entrance; two existing door openings do not create outdoor independence',()=>{
 const s=investigateSecondOpenPassages().options[2];
 assert.deepEqual(s.courtAndOuterOpenings.map(x=>[x.id,x.overlapMm]),[
  ['front-door',1200],['grand-court-entry-south',1200]
 ]);
 assert.match(s.sourceProtectedRouteConflict,/protected entry\/hall/);
 assert.equal(s.stairBodyOverlapM2,0);
});
test('changed selected source geometry refuses stale feasibility conclusion',()=>{
 const b=structuredClone(readInputs());
 b.house.model.court=[4200,4200,3600,3600];
 assert.throws(()=>investigateSecondOpenPassages(b),/deepEqual/);
 b.house.model.court=[4250,4250,3500,3500];
 b.house.model.loggia.clear[2]=2200;
 assert.throws(()=>investigateSecondOpenPassages(b),/deepEqual/);
});
