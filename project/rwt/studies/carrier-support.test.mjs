import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inputs,beam,displacement,derive,render,reportJson} from './carrier-support.mjs';
const r=derive();
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('inertia uses minimum OD and wall; load combines upper water and handling mass',()=>{
 near(r.inertia,2876943.0399382724,1e-5);near(r.load,0.09577361982189433);
});
test('beam boundary values and analytic midpoint agree',()=>{
 const L=390,E=80;const b=beam(L,E,r.load,r.inertia,60/4250);
 near(displacement(0,L,E,r.load,r.inertia),0);near(displacement(L,L,E,r.load,r.inertia),0);
 near(displacement(L/2,L,E,r.load,r.inertia),b.sag);
 for(let i=0;i<=100;i++)near(displacement(i*L/100,L,E,r.load,r.inertia),displacement(L-i*L/100,L,E,r.load,r.inertia));
});
test('doubling span gives 16-fold sag and 8-fold rotation; doubling modulus halves both',()=>{
 const a=beam(390,80,r.load,r.inertia,60/4250),b=beam(780,80,r.load,r.inertia,60/4250),c=beam(390,160,r.load,r.inertia,60/4250);
 near(b.sag/a.sag,16);near(b.endpointRotation/a.endpointRotation,8);near(a.sag/c.sag,2);
});
test('eleven is smallest count passing intact and one-inactive authored sensitivity',()=>{
 assert.equal(r.candidate.countPerCarrier,11);assert.equal(r.candidate.pitch,390);
 assert.ok(r.spacingSearch.filter(x=>x.count<11).every(x=>!x.eligible));
 assert.ok(r.candidate.oneInactive.monotoneInThisModel);assert.equal(r.candidate.twoInactive.monotoneInThisModel,false);
 assert.deepEqual(r.candidate.stations,[175,565,955,1345,1735,2125,2515,2905,3295,3685,4075]);
});
test('sampled downward profile is strictly monotone for both admitted screening cases',()=>{
 for(const b of [r.candidate.intact,r.candidate.oneInactive]){
  const slope=60/4250-inputs.adverseDifferentialMm/b.span;
  const z=x=>-slope*x-displacement(x,b.span,b.modulus,r.load,r.inertia);
  for(let i=1;i<=1000;i++)assert.ok(z(i*b.span/1000)<z((i-1)*b.span/1000));
 }
});
test('wide generic spacing and even 1250 reference do not earn a gravity grade pass here',()=>{
 assert.equal(r.cases[0].monotoneInThisModel,false);assert.equal(r.cases[1].monotoneInThisModel,false);
});
test('actual dimension ranges eliminate nominal 160 bore and 25 mm skid assumption',()=>{
 near(r.clearance.ideal25BestDiametralClearance,-0.3);near(r.clearance.ideal16ConcentricRadialRemaining,6.75);
 near(r.clearance.ideal16RemainingAtOriginalEccentricity,1.75);near(r.clearance.originalEccentricLowerGap,17.75);
 near(r.clearance.idealGravityOffsetMin,6.75);near(r.clearance.idealGravityOffsetMax,8.85);
});
test('bad dimensions and nonfinite values fail closed',()=>{
 assert.throws(()=>beam(0,80,1,1,1));assert.throws(()=>beam(1,NaN,1,1,1));assert.throws(()=>beam(1,80,1,1,1,-1));
 assert.throws(()=>derive({...inputs,run:100}));assert.throws(()=>displacement(2,1,80,1,1));
});
test('render is deterministic, explicit physical page and no construction claim',()=>{
 assert.equal(reportJson({rotation:0.0029985625387972206}),reportJson({rotation:0.002998562538797221}));
 assert.equal(reportJson({rotation:0.00037482031734965257}),reportJson({rotation:0.0003748203173496526}));
 assert.deepEqual(JSON.parse(reportJson(r)).spacingSearch.map(x=>x.eligible),r.spacingSearch.map(x=>x.eligible));
 assert.throws(()=>reportJson({sag:Infinity}));
 assert.equal(render(r),render(derive()));assert.match(render(r),/width="420mm" height="297mm"/);
 assert.match(render(r),/not for construction/);assert.match(render(r),/RWT-06 remains open/);
});
