import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {forkStudy,drawFork,headBudget} from './forked-side-outlet.mjs';

const f=forkStudy();
test('each outlet is separate before the old failure plane and spills over the actual basin',()=>{
  assert(f.port[1]>f.rootsY && f.rootsY>f.originalCatcherCutY);
  assert.deepEqual(f.paths.map(p=>p.at(-1)),[[13175,4500],[13525,4500]]);
  assert.deepEqual(f.terminalSideMargins,[545.5,545.5]);
  assert(f.doglegNormalClearMm>174 && f.lipToNorthRim===250 && f.lipToSouthCrest===1750);
  assert(f.faultWaterClearAfterMovement>223 && f.rimClearAfterMovement>198);
});
test('one surviving barrel has positive head margin at both duties only at the steeper of the two trial grades',()=>{
  for(const {selected,shallow} of f.budgets){
    assert(selected.remainingHeadAtK2Mm>0 && shallow.remainingHeadAtK2Mm<0);
    assert.equal(selected.grade,1/40);
    assert.equal(shallow.grade,1/100);
  }
  const b=f.budgets[1].selected;
  assert.equal(b.flowLps,4.43895);
  assert(b.fittingKLimitAfterExit>2.63 && b.fittingKLimitAfterExit<2.64);
  assert(b.drop-b.friction-4*b.velocityHead<0); // K=3 plus exit at backup duty
  assert(headBudget(b.flowLps,f.lengthMm,1/40,120).remainingHeadAtK2Mm<0);
});
test('the whole fork retracts without separating either branch, and still needs positive restraint',()=>{
  assert.equal(f.parkedClearOfDryField,153);
  assert.equal(f.fixedGuideToRim,600);
  assert.equal(f.parkedRunnerGapToRim,50);
  assert.equal(f.parkedXClearOfBasin,90);
  assert.equal(f.crossTravelClearOfPostsY,53);
  assert.equal(f.minimumRailOverlap,90);
  assert(f.noseTieSweepsPost && f.crossTieToKnownPostY===115);
  assert.equal(f.stowedTipToSouthCrest,1290);
  assert(f.headToKnownPostXAfterAllowance>=240 && f.eastBoreToKnownPostXInOccupiedY>255);
  assert(f.northReactionPerWeight[0]<0 && f.southReactionPerWeight[0]<0);
  assert(f.separateTubeCopperKg>32 && f.separateTubeFullWaterKg>68);
  assert.equal(f.upstreamAvailableHead,null);
  assert.equal(f.adopted,false);
});
test('published fork data and plan reproduce',()=>{
  assert.deepEqual(JSON.parse(fs.readFileSync(new URL('./forked-side-outlet.json',import.meta.url))),f);
  assert.equal(fs.readFileSync(new URL('./forked-side-outlet.svg',import.meta.url),'utf8'),drawFork(f));
});
