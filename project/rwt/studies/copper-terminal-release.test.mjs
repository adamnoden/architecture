import test from 'node:test';
import assert from 'node:assert/strict';
import {firstRelease, remainingSocketRelease, passage, derive, report, render} from './copper-terminal-release.mjs';

const base = {leftEngagement:40,rightEngagement:50,leftAvailableTravel:0,rightAvailableTravel:0,separationAllowance:5};

test('fixed opposed stops prevent either first disengagement', () => {
  const r = firstRelease(base);
  assert.deepEqual(r.allowedTranslation,{min:0,max:0});
  assert.equal(r.leftRequiredRightward,45);
  assert.equal(r.rightRequiredLeftward,55);
  assert.equal(r.firstAxialReleaseExists,false);
});
test('after actual terminal-body removal, the remaining socket gets a different release check', () => {
  const r = derive().rightTerminalBodyRemoved;
  assert.equal(r.requiredTravel,45);
  assert.equal(r.remainingTravel,35);
  assert.equal(r.remainingSocketCanDisengage,true);
  assert.match(r.scope,/ALREADY been removed/);
  assert.equal(derive().rightBayTooShort.remainingSocketCanDisengage,false);
});
test('rightward clearance threshold includes the explicit separation allowance', () => {
  assert.equal(firstRelease({...base,rightAvailableTravel:44}).firstAxialReleaseExists,false);
  assert.equal(firstRelease({...base,rightAvailableTravel:45}).firstAxialReleaseExists,true);
});
test('leftward release is independently possible, preserving direction', () => {
  assert.equal(firstRelease({...base,leftAvailableTravel:54}).firstAxialReleaseExists,false);
  const r = firstRelease({...base,leftAvailableTravel:55});
  assert.equal(r.rightCanDisengage,true);
  assert.equal(r.leftCanDisengage,false);
  assert.deepEqual(r.allowedTranslation,{min:-55,max:0});
});
test('positive engagements at both stops stay trapped across a finite adversarial grid', () => {
  for (const l of [1,10,40,100]) for (const r of [1,20,50,200]) {
    assert.equal(firstRelease({...base,leftEngagement:l,rightEngagement:r,separationAllowance:0}).firstAxialReleaseExists,false);
  }
});
test('carried hardware, not bare tube, controls the passage screen', () => {
  const r = derive();
  assert.equal(r.bareTubeOnly.remainingDiametralClearance,32);
  assert.equal(r.bareTubeOnly.status,'positive-clearance-only');
  assert.equal(r.plateStillAttached.remainingDiametralClearance,-40);
  assert.equal(r.plateStillAttached.status,'interference-or-no-reserve');
});
test('unmeasured hardware cannot silently become zero or the bare-tube diameter', () => {
  assert.equal(derive().compressionRingUnmeasured.status,'unknown');
  assert.equal(passage({minimumBore:null,largestCarriedEnvelope:108,requiredDiametralClearance:10}).status,'unknown');
  assert.equal(passage({minimumBore:150,largestCarriedEnvelope:140,requiredDiametralClearance:10}).status,'interference-or-no-reserve');
});
test('invalid and degenerate inputs fail rather than produce a plausible answer', () => {
  for (const key of Object.keys(base)) for (const n of [-1,NaN,Infinity,undefined]) assert.throws(()=>firstRelease({...base,[key]:n}));
  assert.throws(()=>firstRelease({...base,leftEngagement:0}));
  assert.throws(()=>remainingSocketRelease({engagement:0,separationAllowance:5,freeTravel:80}));
  assert.throws(()=>remainingSocketRelease({engagement:40,separationAllowance:5,freeTravel:Infinity}));
  assert.throws(()=>passage({minimumBore:0,largestCarriedEnvelope:108,requiredDiametralClearance:10}));
  assert.throws(()=>passage({minimumBore:150,largestCarriedEnvelope:undefined,requiredDiametralClearance:10}));
});
test('report and sheet preserve synthetic scope and are deterministic', () => {
  assert.equal(report(),report());
  assert.equal(render(),render());
  assert.match(report(),/Synthetic diagnostic dimensions/);
  assert.match(render(),/NOT construction dimensions/);
  assert.match(render(),/W1/); assert.match(render(),/W2/);
});
