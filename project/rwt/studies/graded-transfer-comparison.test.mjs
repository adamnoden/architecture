import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compare} from './graded-transfer-comparison.mjs';

test('finite chute respects selected endpoints and does not adopt the comparison',()=>{
 const o=compare();
 assert.deepEqual(o.sourceRun.x,[6125,7550]);
 assert(o.candidateProfile.toeHorizontalRunMm<200);
 assert.equal(o.selectedGeometryChanged,false);
 assert.equal(o.candidateProfile.endingAngleDegrees,0);
 assert.deepEqual(JSON.parse(fs.readFileSync('project/rwt/studies/graded-transfer-comparison.json','utf8')),o);
});

test('zero-friction path conserves energy and rejects a nominal-only narrow split',()=>{
 const o=compare(),c=id=>o.cases.find(v=>v.branch===id&&v.roughness===0);
 const drop=o.sourceRun.floor[0]-o.sourceRun.floor[1];
 for(const a of o.cases.filter(a=>a.roughness===0))
  assert(Math.abs(a.finalSpecificEnergyMm-a.initialSpecificEnergyMm-drop)<.001);
 assert(c('N100-unwidened').horizontalConjugateComparisonMm>130);
 assert(c('S225').horizontalConjugateComparisonMm>100);
 assert(c('N100-to215').horizontalConjugateComparisonMm<93);
 assert(c('S225-to340').horizontalConjugateComparisonMm<91);
 assert(o.branches.find(b=>b.id==='N100-to215').maximumFlowLps>2.38);
});

test('sectional energy comparison converges without hiding curved-toe acceleration',()=>{
 const a=compare(3000),b=compare(6000);
 for(let i=0;i<a.cases.length;i++){
  assert(Math.abs(a.cases[i].horizontalConjugateComparisonMm-b.cases[i].horizontalConjugateComparisonMm)<.001);
  assert(a.cases[i].toeNormalAccelerationOverGravity>0);
 }
});
