import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {beam,reportJson,inputs as pe} from './carrier-support.mjs';
import {derive,evaluate,endGeometry,terminal,requiredEI,section,checkSource,pvc} from './conventional-carrier.mjs';
const close=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('comparison imports the exact reviewed support model',()=>{assert.equal(checkSource(),'a351d1ab5d8f8dba38829a341e91b10762d42e7a');});
test('published solid-wall section and full-water load are independently reproducible',()=>{
 const s=section(110,3.2,1.7,103.9);
 close(s.inertia,1532192.516692358);close(s.load,0.09981736073181453);
 assert.ok(s.waterMass>8);assert.ok(s.waterMass<9);
});
test('eight is first passing PVC count at stated half-reference sensitivity',()=>{
 const r=derive();assert.equal(r.candidate.countPerCarrier,8);close(r.candidate.pitch,3900/7);
 for(let n=3;n<8;n++)assert.equal(evaluate(n,450).passesScreen,false);
 assert.equal(evaluate(8,450).passesScreen,true);
 assert.equal(evaluate(8,450,2).passesScreen,false);
 assert.equal(r.candidate.ringReductionFromPE,6);
});
test('a six-ring reference pass must not survive the lower-modulus counterexample',()=>{
 assert.equal(evaluate(6,900).passesScreen,true);assert.equal(evaluate(6,450).passesScreen,false);
 close(evaluate(8,450).adverse.residualDownhillMmM,3.0797179827469594);
});
test('inverted stiffness boundary agrees with direct beam calculation',()=>{
 const s=section(110,3.2,1.7,103.9),L=2*3900/7,required=requiredEI(L,s.load,60/4250,3);
 close(required/s.inertia,328.7018006399267);
 assert.equal(beam(L,(required/s.inertia)*.999,s.load,s.inertia,60/4250,3).monotoneInThisModel,false);
 assert.equal(beam(L,(required/s.inertia)*1.001,s.load,s.inertia,60/4250,3).monotoneInThisModel,true);
});
test('sleeve-mouth terminal is impossible under 3 mm endpoint error even without sag',()=>{
 const r=derive();assert.equal(r.terminal.supportAtSleeveMouth.requiredEI,null);
 close(r.terminal.supportAtSleeveMouth.rigidResidualMmM,-3.025210084033614);
 assert.equal(requiredEI(100,1,.03,3),null);
});
test('actual terminal span is screened separately, not borrowed from ring pitch',()=>{
 const r=derive();assert.equal(r.terminal.adjacentSpan,250);
 close(r.terminal.screen.residualDownhillMmM,2.023395397037403);
 const s=r.section;
 assert.equal(beam(250,450,s.load,s.inertia,60/4250,3.6).monotoneInThisModel,false);
});
test('end reservations expose old overlap and spend increased body length',()=>{
 const n=endGeometry(),o=endGeometry({...terminal,projection:100});
 assert.equal(n.gap,31);assert.equal(n.fitsSeparated,true);
 assert.equal(o.gap,-69);assert.equal(o.fitsSeparated,false);
 assert.equal(n.bodyLength,4650);assert.equal(n.externalWithdrawal,5450);
 assert.equal(n.parkingExtent,408);assert.equal(n.courtRemainder,192);
});
test('station geometry retains both boundaries and no ring zones overlap',()=>{
 const r=derive(),s=r.candidate.stations;
 assert.equal(s[0],175);assert.equal(s.at(-1),4075);
 for(let i=1;i<s.length;i++)assert.ok(s[i]-s[i-1]>pe.stationZoneMm);
 close(r.candidate.idealRadialClearance,6.95);
 assert.ok(pvc.odMax+32<pe.sleeve.boreMin);
});
test('invalid and degenerate inputs are rejected rather than producing plausible outputs',()=>{
 for(const x of [NaN,Infinity,0,-1])assert.throws(()=>requiredEI(x,1,.01,3));
 assert.throws(()=>requiredEI(100,1,.01,-1));assert.throws(()=>evaluate(2,450));
 assert.throws(()=>evaluate(8,450,7));assert.throws(()=>evaluate(8,0));
 assert.throws(()=>section(110,60,1.7,103));assert.throws(()=>endGeometry({...terminal,couplingOverlap:128}));
});
test('source drift fails closed and retained outputs are deterministic',()=>{
 const dir=mkdtempSync(join(tmpdir(),'rwt-'));
 try{const p=join(dir,'source');writeFileSync(p,'changed');assert.throws(()=>checkSource(p),/Reassess/);}finally{rmSync(dir,{recursive:true,force:true});}
 const raw=readFileSync(new URL('./conventional-carrier.json',import.meta.url),'utf8');
 assert.equal(raw,reportJson(derive()));assert.ok(!raw.includes('Infinity'));
});
