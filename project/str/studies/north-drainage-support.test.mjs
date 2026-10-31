import assert from 'node:assert/strict';
import test from 'node:test';
import {arch,axisAt,clearance,derive,loadEvidence,render,gitBlob,trial} from './north-drainage-support.mjs';
const close=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
const a=arch({span:650,rise:75,ring:215,top:-185});
const tube={shape:'circle',offset:200,axisZ:-420,width:108};
test('pinned studies locate two threshold bands and a distinct 3415 room territory',()=>{
  const r=derive(); assert.equal(r.removedContinuousSlabLength,3415);
  assert.equal(r.retainedThresholdBandsLength,835); assert.equal(r.roomOpenableAreaM2,2.22);
  assert.deepEqual(r.flatBridgeNearUpperGaps.map(x=>x.gap),[81,25]);
});
test('the complete tube, not just the crown or centre point, controls arch contact',()=>{
  const c=clearance(a,tube); close(c.requiredDrop,63.7263620459172);
  assert.ok(c.gap<0); const lowered={...tube,axisZ:tube.axisZ-c.requiredDrop};
  close(clearance(a,lowered).gap,0); assert.ok(clearance(a,{...lowered,axisZ:lowered.axisZ+.01}).gap<0);
});
test('illustrative normal allowance is separate from zero-reserve contact',()=>{
  const c=clearance(a,tube,10); close(c.requiredDrop,74.18530700361714);
  close(clearance(a,{...tube,axisZ:tube.axisZ-c.requiredDrop},10).gap,10);
});
test('catalogue box corners cannot be silently replaced by a circular flange',()=>{
  const box={...tube,shape:'box',width:220};
  close(clearance(a,box).requiredDrop,157.8941201463706);
  assert.ok(clearance(a,box).requiredDrop>clearance(a,{...box,shape:'circle'}).requiredDrop);
});
test('a deeper-rise ring consumes more overhead room at the retained fixed crown',()=>{
  const deeper=arch({span:650,rise:150,ring:215,top:-185});
  close(clearance(deeper,tube).requiredDrop,92.13703059092745);
  assert.ok(clearance(deeper,tube).requiredDrop>clearance(a,tube).requiredDrop);
});
test('whole-building vertical translation cannot cure relative interference',()=>{
  const shifted=arch({span:650,rise:75,ring:215,top:-185+550});
  close(clearance(shifted,{...tube,axisZ:tube.axisZ+550}).requiredDrop,clearance(a,tube).requiredDrop);
});
test('station interpolation is bounded and the high end controls the descending straight route',()=>{
  const [,r]=loadEvidence(), s=r.comparisonSlices;
  close(axisAt(7750,s),-420); close(axisAt(12000,s),-480);
  assert.ok(clearance(a,{...tube,axisZ:axisAt(8167.5,s)}).requiredDrop<clearance(a,tube).requiredDrop);
  assert.throws(()=>axisAt(12001,s));
});
test('envelopes outside the abutments and unsupported inputs cannot earn a pass',()=>{
  assert.equal(clearance(a,{...tube,width:300}).status,'outside-abutment-lines');
  for (const v of [null,undefined,NaN,Infinity,-1,0]) assert.throws(()=>arch({span:650,rise:v,ring:215,top:-185}));
  assert.throws(()=>clearance(a,tube,-1)); assert.throws(()=>clearance(a,{...tube,shape:'guess'}));
  assert.throws(()=>arch({span:650,rise:400,ring:215,top:-185}));
});
test('geometry checks never certify support, water boundaries or installed removal',()=>{
  const r=derive(); assert.equal(r.acceptance,'not-established');
  for(const k of ['actualSupportCapacity','actualAbutments','actualWaterBoundary','actualModuleRelease','actualReceiverLevel']) assert.equal(r[k],null);
  assert.equal(render(r),render(r)); assert.match(render(r),/NOT construction/);
});
test('pinned source mutation and plan mutation fail visibly',()=>{
  const evidence=loadEvidence(); evidence[0].plan.room.length=1;
  assert.throws(()=>derive(evidence)); assert.notEqual(gitBlob('x'),gitBlob('x\n'));
  assert.equal(trial.normalAllowance,10);
});
