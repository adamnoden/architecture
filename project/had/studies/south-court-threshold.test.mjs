import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveSouthCourtThreshold} from './south-court-threshold.mjs';
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
test('threshold reference cannot silently inherit a different rough opening, frame depth or leaf clearance',()=>{
  for(const mutate of [d=>d.rough[0]--,d=>d.frameDepth[1]++,d=>d.leafBottom--]){
    const changed=JSON.parse(JSON.stringify(door));mutate(changed);
    assert.throws(()=>deriveSouthCourtThreshold(changed));
  }
});
