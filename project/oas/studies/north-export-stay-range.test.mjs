import test from 'node:test';
import assert from 'node:assert/strict';
import {
  basis,readSelectedOccurrence,authoredLengthMm,
  authoredAngleAtMaximumMm,boundedDecision
} from './north-export-stay-range.mjs';
const near=(a,b,eps=1e-8)=>
  assert(Math.abs(a-b)<eps,`${a} != ${b}`);

test('pin actual FIRST north-0 identity, not a neighbour or ground grille',()=>{
  const o=readSelectedOccurrence();
  assert.equal(o.centre,1800);
  assert.equal(o.spring,2550);
  assert.equal(o.cillDepthMaximum,50);
  assert.deepEqual(basis.documentedTravelMm,[222,286]);
  assert.equal(basis.documentedFrameHolePitchMm,25);
  assert.equal(basis.documentedLeafHolePitchMm,20);
});
test('both mirrored leaves share the pivot-length result',()=>{
  for(const angle of [0,15,30,45,60,70,75,80,90])
    near(authoredLengthMm(angle,-1),authoredLengthMm(angle,1));
  near(authoredLengthMm(0),224);
  near(authoredLengthMm(70),281.3029972863419);
  near(authoredLengthMm(75),288.0730632596559);
  near(authoredLengthMm(80),294.83707740481964);
});
test('old 80 degrees and even 75 exceed this 20 IN hypothetical 286 maximum',()=>{
  const d=boundedDecision();
  assert(d.old80OverMaximumMm>8);
  assert(d.trial70NominalExtensionRemainingMm>4);
  assert(d.trial70NominalExtensionRemainingMm<5);
  assert(authoredLengthMm(75)>286);
  near(d.theoreticalZeroToleranceAngleLimitDeg,73.47022811506957,1e-7);
  near(authoredLengthMm(d.theoreticalZeroToleranceAngleLimitDeg),286);
  assert.match(d.disposition,/70 degrees is a conditional hypothesis/);
});
test('model monotonicity and boundary violations cannot be reinterpreted as product proof',()=>{
  for(let deg=1;deg<=90;deg++)
    assert(authoredLengthMm(deg)>authoredLengthMm(deg-1));
  assert.equal(basis.documentedFrameHolePitchMm===40,false);
  for(const bad of [-1,91,NaN,Infinity])
    assert.throws(()=>authoredLengthMm(bad));
  assert.throws(()=>authoredLengthMm(20,0));
  assert.throws(()=>authoredAngleAtMaximumMm(1000));
  assert.throws(()=>authoredAngleAtMaximumMm(200));
  assert.equal(boundedDecision().actualHardwareAccepted,undefined);
});
