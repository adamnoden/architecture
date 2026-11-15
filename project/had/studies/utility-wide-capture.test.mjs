import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {deriveUtilityWideCapture} from './utility-wide-capture.mjs';

test('wider captured utility package keeps the service states only with the rebuilt hot route and link',()=>{
  const result=deriveUtilityWideCapture();
  const {hot,release}=result;
  assert.equal(result.package[3],620);
  assert.deepEqual(result.stages.map(row=>row.clearanceMM),[25,25.5,30]);
  const fixedWork=[...Object.values(result.workClear),...Object.values(result.staticClear)];
  assert(fixedWork.every(clearance=>clearance>=25));
  assert(hot.westOnlyGapMM<0);
  assert(hot.rectangularColdAttachmentMM<25);
  assert(release.hotValveToColdCapMM>=25);
  assert(hot.rearLowerLink.originalGapMM<25);
  assert(hot.rearLowerLink.revisedGapMM>=25);
  assert(hot.nearestTerminalObstacles.every(row=>row.afterSettingMM>=25));
  assert(hot.carryBarGapMM<0);
  assert(hot.controlAfterLanding.bodyToStandMM>=25);
  assert(release.tools.every(row=>row.clearanceMM>=25));
  assert(release.drains.every(row=>Math.min(row.armMM,row.pipeMM)>=25));
  assert.equal(release.receiverAfterSettingMM,25);
  assert(release.retainedWasherSupportContactUnchanged);
  assert(Object.values(release.coldTerminalClearances).every(row=>row.afterSettingMM>=25));
  assert.equal(release.capturedHeadInitialTravelMM,385);
  assert.deepEqual(release.contactedLegs.map(row=>row.marginMM),[15,15,15,15]);
  assert.equal(readFileSync(new URL('./utility-wide-capture.json',import.meta.url),'utf8'),JSON.stringify(result,null,2)+'\n');
});
