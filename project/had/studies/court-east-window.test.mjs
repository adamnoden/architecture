import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveWaterReplan} from './water-replan.mjs';
import {verifyCourtEastWindow} from './court-east-window.mjs';
test('actual E6850 window retains symmetry with continuous lateral sash operation and closed-cover cleaning',()=>{
 const v=deriveWaterReplan().model.courtEastWindow6850;
 assert.equal(v.retainedRoughOpening.width,1000);assert(v.proof.minimumConservativeBodyReserve>=25);
 assert(v.proof.maximumConservativeHandleReach<=600);assert(v.proof.maximumCleaningPoleReach<=1800);
 for(const [mutate,re]of[[x=>x.interior.bodyEnd[0]+=100,/sash\/operator/],[x=>x.cleaning.eastGuardState='RETAINED',/retained guard/],[x=>x.cleaning.closedWalkingCoverReference.bottomZ=-120,/underside hits/]]){
 const bad=JSON.parse(JSON.stringify(v));mutate(bad);assert.throws(()=>verifyCourtEastWindow(bad),re);
 }
});
