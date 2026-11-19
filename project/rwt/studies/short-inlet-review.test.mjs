import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {review,convergenceProbe} from './short-inlet-review.mjs';
test('short actual-section review agrees with independent adaptive integration and retains600loss-placement failure',()=>{
 const r=review(),x=r.rejected600.cases;
 assert(Math.abs(x[0].quietCapacityLps-3.5519433690680726)<1e-7);
 assert(Math.abs(x[1].quietCapacityLps-3.864346089963328)<1e-7);
 assert.equal(x[0].passesThisReference,false);
 assert.equal(x[1].passesThisReference,true);
 assert(x.filter(v=>v.block==='deepestTotalQuarter').every(v=>!v.passesThisReference));
 const p=convergenceProbe();assert(Math.abs(p[0].capacity-p[2].capacity)<1e-7);
 assert.equal(r.selectedGeometryChanged,false);assert.equal(r.accepted,false);
});
test('one-row sign remains thin and actual extra pan/hinge tradeoff retains longer approach failure',()=>{
 const r=review(),one=r.singleNorth.cases.find(x=>x.block==='deepestTotalQuarter'&&x.lipK===0);
 assert(Math.abs(one.quietCapacityLps-3.69212603)<1e-7);
 assert(one.quietReserveMm>0&&one.quietReserveMm<1);
 const old=r.sixWetRetainedHinge.cases.find(x=>x.lengthMm===200);
 const arm=r.sixWetHungLatch.cases.find(x=>x.lengthMm===200);
 assert.equal(old.passesThisReference,false);assert.equal(arm.passesThisReference,true);
 assert(r.sixWetHungLatch.cases.every(x=>x.entranceK+x.lipK===1));
 assert.deepEqual(r.sixWetRetainedHinge.intervals.at(-1),[7247.5,7350]);
});
test('finite reviewed values reproduce without creating site or physical admission',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/short-inlet-review.json','utf8'),JSON.stringify(review(),null,2)+'\n');
});
