import assert from 'node:assert/strict';
import test from 'node:test';
import {traceInletFirstWetting} from './incoming-water-first-wetting.mjs';

const result=traceInletFirstWetting();

test('the entry bypasses the pans, while the unions and drain spouts project inside',()=>{
  assert.equal(result.status,'LOCAL_PROJECTION_NOT_ADOPTION');
  assert.equal(result.entry.cut,'B0');
  assert.equal(result.entry.boundaryCutForB0,'provider upstream isolation');
  assert.deepEqual(result.entry.insideFaceProjection,[11570.5,2800,600]);
  assert.equal(result.entry.exceedanceEastOfPanMM,20.5);
  assert.equal(result.localPoints[0].projectedFirstLocalSurface,'floor or wall toe');
  assert.equal(result.entry.localDripFlashing.minProjectionMM,55.5);
  assert.deepEqual(result.entry.localDripFlashing.entryWitnessProjection.map(p=>p.lapAfterTwoSettingsMM),[4.5,19.5,29.5]);
  assert.deepEqual(result.entry.localDripFlashing.entryWitnessProjection.map(p=>p.geometryPass),[false,false,true]);
  assert.equal(result.entry.localDripFlashing.jetCaptureCredit,false);
  const unions=result.localPoints.filter(p=>p.source.includes('union'));
  assert.equal(unions.length,6);
  assert.deepEqual(unions.map(p=>p.localPlanMarginMM),[50,55,57,68,50,75]);
  assert.deepEqual(unions.map(p=>p.positiveUpstreamCut),['B0','B0','I0','I0','I0','I0']);
  assert(result.receiver.spoutsConfinedInProjection);
  assert(result.localPoints.every(p=>!p.actualCaptureCredit));
});

test('a blocked witness and finite controlled pan do not protect the escape passage',()=>{
  assert.equal(result.receiver.blockedWitnessFirstUncapturedVolumeLitres,0);
  assert.deepEqual(result.receiver.rateComparisons.map(c=>c.secondsFromFirstCapturedWater.map(q=>q.seconds)),[[80,32,16],[30,12,6]]);
  assert.equal(result.protectedThreshold.width,742.5);
  assert.equal(result.protectedThreshold.westStanceGapMM,25);
  assert.equal(result.protectedThreshold.sealsOrFloorUpstandProven,false);
  assert.equal(result.utilityElectrical.body[0],9397);
  assert(result.overflowWitnesses.every(c=>c.crossingPlanDistancesMM.protectedHall===1803));
  assert.equal(result.overflowWitnesses[0].nearestWallToePlanDistancesMM.south,28);
  assert.equal(result.overflowWitnesses[1].nearestWallToePlanDistancesMM.north,28);
  assert.equal(result.safetyDischarge.creditedAsFloorDrain,false);
});
