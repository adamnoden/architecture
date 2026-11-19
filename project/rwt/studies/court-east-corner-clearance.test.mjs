import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {screenNorthEastPassage} from './court-east-corner-clearance.mjs';

test('the source-locked east route still needs 1200 gross across 4250 of inhabited ring',()=>{
  const v=screenNorthEastPassage();
  assert.equal(v.eastBandWidthMm,1200);
  assert.deepEqual(v.selected.court,[4250,4250,3500,3500]);
  assert.deepEqual(v.cases.map(c=>c.cornerPierReservationMm),[0,140,200,300]);
  for(const c of v.cases){
    assert.equal(c.grossGroundFootprintM2,5.1);
    assert.equal(c.bandMm[0],7750);
    assert.equal(c.bandMm[2],4250);
    assert.equal(c.bandMm[3],1200);
    assert(!c.completeOutdoorPassageAdmitted);
    assert.equal(c.currentlyUnopenedServiceSpineWidthMm,1200);
  }
  assert.match(v.next,/RWT-06 remains planned/);
});

test('northmost band fails to clear the existing finished plant wall even without a corner pier',()=>{
  const v=screenNorthEastPassage();
  const c=v.cases[0];
  assert.deepEqual(c.bandMm,[7750,6550,4250,1200]);
  assert.equal(c.currentAvailableGrossNorthOfPlantWallMm,1153);
  assert.equal(c.minimumPlantWallSouthShiftMm,47);
  assert.equal(c.relocatedPlantWallSouthFinishedFaceMm,6356);
  assert.equal(c.controlsOverlapAfterRelocationMm,0);
  assert.equal(c.bufferOverlapAfterRelocationMm,0);
  assert.equal(c.courtWindowDisplacedIntervalMm,800);
  assert.equal(c.outerWindowDisplacedIntervalMm,850);
});

test('hypothetical corner reservations force increasing wall and plant-equipment conflicts',()=>{
  const c=screenNorthEastPassage().cases;
  assert.deepEqual(c.map(v=>v.currentAvailableGrossNorthOfPlantWallMm),[1153,1013,953,853]);
  assert.deepEqual(c.map(v=>v.minimumPlantWallSouthShiftMm),[47,187,247,347]);
  assert.deepEqual(c.map(v=>v.controlsOverlapAfterRelocationMm),[0,0,44,144]);
  assert.deepEqual(c.map(v=>v.bufferOverlapAfterRelocationMm),[0,0,0,94]);
  assert.deepEqual(c[2].bandMm,[7750,6350,4250,1200]);
  assert.equal(c[2].relocatedPlantWallSouthFinishedFaceMm,6156);
  assert.match(screenNorthEastPassage().authority,/not structural minima/);
});

test('window sacrifice survives the corner and plant fit arithmetic; no certified second outlet follows',()=>{
  const v=screenNorthEastPassage();
  assert.deepEqual(v.cases.map(c=>c.courtWindowDisplacedIntervalMm),[800,940,1000,1000]);
  assert.deepEqual(v.cases.map(c=>c.outerWindowDisplacedIntervalMm),[850,710,650,550]);
  assert(v.cases.every(c=>c.courtWindowDisplacedIntervalMm>0&&c.outerWindowDisplacedIntervalMm>0));
  assert.match(v.decision,/cross-owner house redesign/);
  assert.match(v.authority,/UNPROVED/);
});

test('changed selected geometry or fixture clearance cannot reuse this comparison',()=>{
  const b=structuredClone(readInputs());
  b.house.model.court[3]=3600;
  assert.throws(()=>screenNorthEastPassage(b));
  b.house.model.court[3]=3500;
  b.house.model.groundFurniture['plant-controls'][3]=600;
  assert.throws(()=>screenNorthEastPassage(b));
  b.house.model.groundFurniture['plant-controls'][3]=650;
  b.house.model.groundWalls.find(w=>w.id==='plant-north').finishedFaces[1]=6600;
  assert.throws(()=>screenNorthEastPassage(b));
});
