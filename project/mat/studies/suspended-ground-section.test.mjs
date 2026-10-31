import assert from 'node:assert/strict';
import test from 'node:test';
import {basis,stackDepth,ventBudget,relativeRaise,derive,render} from './suspended-ground-section.mjs';
test('floor thickness and clear void are not competing claims to the same reserve',()=>{
  const d=derive(); assert.equal(d.wallTotal,417.5); assert.equal(d.floorStack,330);
  assert.deepEqual(Object.values(d.cases).map(v=>[v.totalDepth,v.excessOverReserve]),[[480,180],[555,255],[630,330]]);
});
test('vent needs space below the whole authored DPC band, not only the floor soffit',()=>{
  const f=v=>ventBudget({voidDepth:v,dpcBand:150,clearBore:100,topGap:0,bottomGap:0,completeDuctEnvelope:null});
  assert.equal(f(150).residualBeyondBore,-100); assert.equal(f(225).residualBeyondBore,-25); assert.equal(f(300).residualBeyondBore,50);
});
test('a clear bore is not the full duct; positive budget is never a fit approval',()=>{
  assert.equal(derive().drawnVent.completeEnvelopeResidual,null);
  const v=ventBudget({voidDepth:300,dpcBand:150,clearBore:100,topGap:20,bottomGap:30,completeDuctEnvelope:120});
  assert.equal(v.completeEnvelopeResidual,-20); assert.equal(v.completeDuctFit,'not-established');
});
test('a fixed-ground raise is not the deficit against a drawing reserve',()=>{
  assert.equal(relativeRaise(480,150),330); assert.equal(relativeRaise(555,150),405);
  assert.equal(relativeRaise(630,150),480); assert.equal(relativeRaise(480,600),0);
});
test('missing, non-finite, negative and impossible envelopes are rejected',()=>{
  for(const n of [undefined,NaN,Infinity,-1]) assert.throws(()=>stackDepth({...basis.layers,voidDepth:n}));
  assert.throws(()=>stackDepth({...basis.layers,structure:0,voidDepth:150}));
  assert.throws(()=>ventBudget({voidDepth:300,dpcBand:150,clearBore:100,topGap:0,bottomGap:0,completeDuctEnvelope:99}));
});
test('the reproducible sheet preserves unknown material, access and site decisions',()=>{
  const d=derive(); assert.match(d.membraneOmission,/not-established/); assert.match(d.serviceAccess,/not-established/);
  assert.equal(render(),render()); assert.match(render(),/NOT construction/); assert.match(render(),/no body margin/);
});
