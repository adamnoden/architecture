import assert from 'node:assert/strict';
import test from 'node:test';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {crossfeed, minimumHead, requiredWidth} from './middle-eave-crossfeed.mjs';

const r = crossfeed();
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-7, a+' vs '+b);

test('fixed lower path joins both retained mouths while a narrower centre drops below it', () => {
  assert.deepEqual(r.outletsP,[4500,7500]);
  assert.equal(r.fixedWallTop-r.blockedStage,r.frontFreeboard);
  assert.ok(r.outletsP[0]<r.ends[0] && r.ends[1]<r.outletsP[1]);
  near(r.crown-r.endInvert,(r.ends[1]-r.ends[0])/200);
  assert.ok(r.endInvert-r.previousHighestBedAtJoin>0 && r.endInvert-r.previousHighestBedAtJoin<1);
  assert.ok(r.dripMin>=50 && r.guideGap>=10 && r.separateBodies>=10);
  assert.ok(r.neighbourAfterDrop>=10 && r.underCrossfeed>=10 && r.bypassToRaisedLip>=10);
  execFileSync(process.execPath,[fileURLToPath(new URL('./middle-eave-crossfeed.mjs',import.meta.url)),'--check']);
});

test('front projection over empty space narrows the two openings, independent of flow direction', () => {
  assert.equal(r.transfer.width,185);
  assert.equal(r.end.width,155);
  assert.ok(r.normal.adverseMargin>0 && r.transfer.adverseMargin>0);
  assert.ok(r.end.adverseMargin<-.9 && r.end.adverseMargin>-1);
  for (const section of [r.normal,r.transfer,r.end]) {
    assert.ok(section.k1Margin<0);
    near(requiredWidth(r.duty,minimumHead(r.duty,section.width,1),1),section.width);
  }
  assert.ok(r.requiredK1.reduce((a,b)=>a+b)>r.maxClear+15);
  assert.equal(r.maxClear,380);
});

test('reduced flow has a finite total loss allowance and a non-drowned outlet target', () => {
  const c = r.candidate;
  const velocity = (c.flowLps/r.end.width)/(c.criticalDepth/1000);
  near(velocity**2,9.81*c.criticalDepth/1000);
  near(c.headNeeded,c.criticalDepth+1000*velocity**2/(2*9.81)+c.totalLossBudget);
  near(c.healthyStageLimit,r.endInvert-r.adverseLevel+c.criticalDepth);
  assert.ok(c.available-c.headNeeded>1 && c.available-c.headNeeded<1.5);
  assert.ok(r.end.adverseK1FlowLimit>c.flowLps && r.end.adverseK1FlowLimit<2.49);
});
