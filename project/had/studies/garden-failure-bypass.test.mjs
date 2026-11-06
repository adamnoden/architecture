import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveWaterReplan} from './water-replan.mjs';
import {deriveGardenFailureBypass} from './garden-failure-bypass.mjs';
test('the occupied front exit continuously reaches a grade-level garden without N water or E maintenance',()=>{
  const v=deriveWaterReplan(),b=v.model.gardenFailureBypass;
  assert.equal(b.grade,v.model.approaches.authoredExteriorGrade);
  assert.deepEqual(b.frontApproach.route[0],[6000,0,0]);
  assert.deepEqual(b.bypass.at(-1),b.frontApproach.foot);
  assert(b.bypass.every(p=>p[2]===b.grade));
  assert.equal(b.frontApproach.foot[2],b.grade);
  assert(b.frontApproach.landings.every(l=>l.plan[3]===1200));
  assert.equal(b.flightSpacing-b.clearWidth,300);
  assert(b.actualTravel.total>b.actualTravel.frontFolded);
  assert.equal(b.checks.siteAccepted,false);
  assert.equal(b.checks.accessClassAccepted,false);
});
test('E staging cannot silently consume the west garden escape',()=>{
  const v=deriveWaterReplan();
  assert.throws(()=>deriveGardenFailureBypass(v.model,{servicePlatform:[-3000,-20000,3000,40000]}));
});
