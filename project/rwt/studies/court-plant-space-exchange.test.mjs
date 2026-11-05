import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {screenCourtPlantSpaceExchange} from './court-plant-space-exchange.mjs';

test('three wall comparisons retain the selected geometry and expose the missing 325.5/519.5 mm',()=>{
  const x=screenCourtPlantSpaceExchange();
  assert.deepEqual(x.selected.court,[4250,4250,3500,3500]);
  assert.equal(x.selected.completeWeatherWallComparatorMm,519.5);
  assert.deepEqual(x.cases.map(c=>c.id),['unweathered-control','rebuild-plant-wall','add-separate-weather-wall']);
  assert.deepEqual(x.cases.map(c=>c.requiredJointPlanMoveMm),[247,572.5,766.5]);
  assert(x.cases.every(c=>!c.validEnvelopeCandidate));
  assert.match(x.authority,/PLAN exchange/);
});

test('rebuilding the plant wall is a bounded source trade-off, not a free 247 mm repair',()=>{
  const c=screenCourtPlantSpaceExchange().cases[1];
  const [plant,shared,court]=c.exchanges;
  assert.equal(plant.plantSouthShiftMm,572.5);
  assert.equal(plant.controlsCollisionDepthMm,369.5);
  assert.equal(plant.bufferCollisionDepthMm,319.5);
  assert.equal(shared.plantSouthShiftMm,286.25);
  assert.equal(shared.courtNorthExtensionMm,286.25);
  assert.equal(shared.controlsCollisionDepthMm,83.25);
  assert.equal(court.proposedCourtNorthMm,8322.5);
  assert.deepEqual(court.routeYBandMm,[6922.5,8122.5]);
  assert.equal(court.centreSquareSideMm,4645);
  assert.equal(court.centreSquareAdditionalCourtM2,9.326025);
  assert.equal(court.northOnlyAdditionalCourtM2,2.00375);
  assert.equal(court.rearWallFinishedBandEncroachmentMm,167);
  assert.equal(court.currentCourtWindowOverlapMm,427.5);
  assert.equal(court.currentOuterWindowOverlapMm,977.5);
});

test('all sketches use the same 200 mm hypothetical corner reservation and keep safety unknown',()=>{
  const x=screenCourtPlantSpaceExchange();
  for(const c of x.cases)for(const e of c.exchanges){
    assert.equal(e.corridorToCourtCornerMm,200);
    assert.equal(e.plantSouthShiftMm+e.courtNorthExtensionMm,c.requiredJointPlanMoveMm);
    assert.equal(e.routeYBandMm[1]-e.routeYBandMm[0],1200);
    assert(!e.safeSecondPassageAdmitted);
  }
  assert.match(x.decision,/RWT-06 remains planned/);
  assert.match(x.excluded.join(' '),/No claims about a safe flooded garden/);
});

test('full wall added north of plant consumes even more house or plant space',()=>{
  const c=screenCourtPlantSpaceExchange().cases[2];
  const court=c.exchanges[2];
  assert.equal(c.requiredJointPlanMoveMm,766.5);
  assert.equal(court.proposedCourtNorthMm,8516.5);
  assert.equal(court.centreSquareSideMm,5033);
  assert.equal(court.centreSquareAdditionalCourtM2,13.081089);
  assert.equal(court.rearWallFinishedBandEncroachmentMm,361);
  assert.equal(court.currentCourtWindowOverlapMm,233.5);
  assert.equal(court.currentOuterWindowOverlapMm,783.5);
});

test('any source geometry or weather build-up change invalidates the original exchange',()=>{
  const b=structuredClone(readInputs());
  b.house.model.weather.total=500;
  assert.throws(()=>screenCourtPlantSpaceExchange(b));
  b.house.model.weather.total=519.5;
  b.house.model.groundWalls.find(w=>w.id==='plant-north').finishedFaces[1]=6610;
  assert.throws(()=>screenCourtPlantSpaceExchange(b));
  b.house.model.groundWalls.find(w=>w.id==='plant-north').finishedFaces[1]=6597;
  b.house.model.court[3]=3600;
  assert.throws(()=>screenCourtPlantSpaceExchange(b));
});
