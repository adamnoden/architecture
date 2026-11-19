import test from 'node:test';
import assert from 'node:assert/strict';
import {inputs,movement,reachable,pairOnly,localRelief,commonReceiver,derive,json,render} from './copper-compartments.mjs';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
test('movement uses both lengths and converts the CDA Fahrenheit coefficient',()=>{
  close(inputs.alphaPerK,17.64e-6);const r=movement();close(r.hotClosure,5.292);close(r.coldOpening,3.1752);
  close(r.minimumHotGap,4.708);close(r.maximumColdGap,17.1752);close(r.relativeTravelHotToCold,8.4672);
});
test('contact and restraint counterexamples are not hidden by a positive nominal gap',()=>{
  assert.equal(movement({...inputs,installedGap:7}).geometricContactAvoided,false);
  close(movement({...inputs,lengthA:1500,lengthB:1500}).hotClosure,movement().hotClosure/2);
  close(movement({...inputs,maximumMetalC:20,minimumMetalC:20}).hotClosure,0);
});
test('outlets on opposite sides of a divider cannot back each other up',()=>{
  assert.deepEqual(reachable(pairOnly,'A',['OUT-A','OUT-B'],['P-A']),[]);
  assert.deepEqual(reachable(pairOnly,'B',['OUT-A','OUT-B'],['P-B']),[]);
});
test('each compartment has a distinct surviving topological path when either inlet is removed',()=>{
  for(const side of ['A','B']){
    assert.deepEqual(reachable(localRelief,side,[`OUT-${side}`,`SAFE-${side}`],[`P-${side}`]),[`SAFE-${side}`]);
    assert.deepEqual(reachable(localRelief,side,[`OUT-${side}`,`SAFE-${side}`],[`R-${side}`]),[`OUT-${side}`]);
  }
});
test('common receiver and common inlet failures defeat apparent duplication',()=>{
  assert.deepEqual(reachable(commonReceiver,'A',['OUT'],['GULLY']),[]);
  assert.deepEqual(reachable(localRelief,'A',['OUT-A','SAFE-A'],['P-A','R-A']),[]);
  assert.deepEqual(reachable([...localRelief,['SAFE-A','A']],'A',['SAFE-A']),['SAFE-A']);
});
test('nonfinite, invalid geometry and malformed graphs fail closed',()=>{
  for(const p of [{lengthA:0},{alphaPerK:NaN},{installedGap:-1},{combinedPositionAllowance:-1},{minimumMetalC:21}])assert.throws(()=>movement({...inputs,...p}));
  assert.throws(()=>reachable([['A']],'A',['OUT']));assert.throws(()=>reachable([],'A',[]));assert.throws(()=>json({n:Infinity}));
});
test('report and physical sheet are deterministic and preserve the claim boundary',()=>{
  const r=derive();assert.equal(json(r),json(derive()));assert.equal(render(r),render(derive()));
  assert.match(render(r),/width="420mm" height="297mm"/);assert.match(render(r),/not to scale/);
  assert.equal(r.thermal.waterTightness,'unknown');assert.match(r.authority,/NOT sufficient/);
});
