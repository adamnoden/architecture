import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveFramedInletBay} from './inlet-framed-bay.mjs';

test('framed inlet separates the full-depth drains and the fitted wheel',()=>{
  const result=deriveFramedInletBay();
  assert.deepEqual(result,JSON.parse(readFileSync(new URL('./inlet-framed-bay.json',import.meta.url),'utf8')));
  assert.equal(result.frame.intakeSideClearanceAfterSettingMM,25);
  assert.equal(result.frame.foundation.separationFromSouthJambMM,65);
  assert.equal(result.frame.foundation.northJambOverlapMM,150);
  assert(result.drainage.pipes[0].retiredZ70OuterBaseClearanceAfterSettingMM<0);
  assert(result.drainage.pipes[0].minimumEdgeClearanceAfterSettingMM>=20);
  assert.deepEqual(result.drainage.receivingSeparationAfterSettingMM,[25,25]);
  assert(result.drainage.outsidePipeGapAfterSettingMM>25);
  assert.equal(result.closure.oldFrontBoundAfterSettingMM,-2);
  assert.equal(result.closure.newFrontBoundAfterSettingMM,33);
});
