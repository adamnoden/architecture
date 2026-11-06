import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveSouthCourtThreshold,verifyThresholdMaintainedState} from './south-court-threshold.mjs';
import {deriveWaterReplan} from './water-replan.mjs';
const door=JSON.parse(readFileSync(new URL('./open-north-loggia.json',import.meta.url))).southCourtWeatherDoor;
test('one threshold reference allocates installation, actual pan/weep/fixing levels and separate gravity paths',()=>{
  const v=deriveSouthCourtThreshold(door);
  assert.equal(v.frame.jambEach,40);
  assert.equal(v.primarySill.leafClearance,4);
  assert.equal(v.pan.secondaryOutlet.lipZ-v.secondaryTray.bedZ,25);
  assert.equal(v.fixings.panFloorPenetrations,0);
  assert(v.fixings.z.every(z=>z>v.pan.ends.crestZ));
  assert.equal(v.primaryTray.destination.includes('N court'),true);
  assert.equal(v.secondaryTray.destination.includes('Separate E'),true);
  assert.equal(v.levelBudget.maximumQuietOperatingStageZ,-35);
  assert.equal(v.admission.firstSusceptibleQualifiedZ,null);
  assert.equal(v.admission.geometricReference,false);
});
test('pan rotation keeps stored leaves, fixed E guard and the actual operator clear',()=>{
  const v=deriveWaterReplan(),t=v.model.southCourtThresholdReference;
  const p=verifyThresholdMaintainedState(t,v.renewal);assert(p.bodyReserve>=25);
  const bad=JSON.parse(JSON.stringify(t));bad.maintainedState.leafTask.uprightStorage.plan=[5500,5100,200,1000];
  assert.throws(()=>verifyThresholdMaintainedState(bad,v.renewal),/Pan rotation hits stored leaf/);
  const actor=JSON.parse(JSON.stringify(t));actor.maintainedState.panTask.operator.centre=[6500,5200];
  assert.throws(()=>verifyThresholdMaintainedState(actor,v.renewal),/rotation hits actual operator/);
});
test('threshold reference cannot silently inherit a different rough opening, frame depth or leaf clearance',()=>{
  for(const mutate of [d=>d.rough[0]--,d=>d.frameDepth[1]++,d=>d.leafBottom--]){
    const changed=JSON.parse(JSON.stringify(door));mutate(changed);
    assert.throws(()=>deriveSouthCourtThreshold(changed));
  }
});

test('integral apron and floor underside are included in the pan draw, rotation and edge-on storage',()=>{
  const v=deriveWaterReplan(),t=v.model.southCourtThresholdReference,p=t.maintainedState.panTask;
  assert.deepEqual(t.pan.bodyEnvelope.plan,[5102,4030,1796,420]);
  assert.deepEqual(t.pan.bodyEnvelope.z,[-56.5,75]);
  assert.deepEqual(p.wholeBodyMaximum,[1796,420,131.5]);
  assert.equal(p.clearDrawPlan[1],4030);
  assert.equal(p.storage.height,450);
  assert(verifyThresholdMaintainedState(t,v.renewal).bodyReserve>=25);
  for(const [mutate,message]of [
    [x=>x.maintainedState.panTask.wholeBodyMaximum[1]=360,/envelope omits integral apron/],
    [x=>x.maintainedState.panTask.wholeBodyMaximum[2]=130,/envelope omits integral apron or floor thickness/],
    [x=>x.maintainedState.panTask.planRotationRadius=Math.hypot(1796,360)/2,/rotation radius omits complete/],
    [x=>x.maintainedState.panTask.clearDrawPlan[1]=4090,/draw reservation omits installed integral apron/],
    [x=>x.maintainedState.panTask.storage.height=400,/storage omits complete integral body/],
  ]){
    const bad=structuredClone(t);mutate(bad);
    assert.throws(()=>verifyThresholdMaintainedState(bad,v.renewal),message);
  }
  assert.equal(t.admission.material,false);
  assert.equal(t.admission.weatherPhysical,false);
  assert.equal(t.admission.geometricReference,false);
});
