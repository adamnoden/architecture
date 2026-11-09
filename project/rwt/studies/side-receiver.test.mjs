import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {sideReceiver, drawing} from './side-receiver.mjs';

const result = sideReceiver();
test('both southern water territories clear the complete dry field and the known post face',()=>{
  const [x,y,w,h] = result.basin;
  assert.equal(y+h,6050);
  assert.deepEqual(result.spill,[x,y-1500,w,1500]);
  assert.equal(result.southPostClear,275);
  assert.equal(result.drawFieldY[0]-(y+h),375);
  assert.equal(result.lateralMargin,500);
  assert.equal(result.lipDownstreamPlan,1750);
  assert(result.landwardFaceToHouse>146 && result.landwardFaceToHouse<147);
  assert(result.chuteToParkedTrack>194 && result.chuteToPost>226);
  assert.equal(result.maintenanceAdmitted,false);
});
test('even the lossless clean quiet outlet fails at the trial rim margin',()=>{
  const q=result.duty/1000;
  for (const row of result.limits) {
    const velocity = q/(row.width*row.criticalDepth/1e6);
    assert(Math.abs(velocity**2/(9.81*row.criticalDepth/1000)-1)<1e-10);
    assert(Math.abs(row.maximumRimAllowance+row.deficit-result.choices.rimAllowance)<1e-10);
  }
  assert(result.lowPort<result.port[2]);
  assert.equal(result.availableEnergyMm.toFixed(2),'12.35');
  assert.equal(result.limits[0].deficit.toFixed(2),'10.80');
  assert.equal(result.limits[1].maximumRimAllowance.toFixed(2),'0.60');
  assert.equal(result.intakeAdmitted,false);
  assert.equal(result.receiverAdopted,false);
});
test('side receiver outputs reproduce the source-bound comparison',()=>{
  const base='project/rwt/studies/side-receiver';
  assert.deepEqual(JSON.parse(fs.readFileSync(base+'.json')),result);
  assert.equal(fs.readFileSync(base+'.svg','utf8'),drawing(result));
});

test('a separately clocked standard outlet traverses its continuous sector and reverses on the dry track',()=>{
  const h=result.high, baseline=JSON.parse(fs.readFileSync('project/rwt/studies/upper-first-release.json'));
  const [cx,cy,cz]=baseline.geometry.axisAnchor, fall=baseline.geometry.fall;
  const c=1/Math.hypot(1,fall),s=fall*c, box=baseline.geometry.outletBox;
  // Independent Rodrigues rotation sampled across the complete negative quarter-turn.
  for(let degree=-90;degree<=0;degree+=0.5) {
    const angle=degree*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle);
    for(const i of [0,1])for(const j of [0,1])for(const k of [0,1]) {
      const a=box[0]+i*box[3]-cx,b=box[1]+j*box[4]-cy,d=box[2]+k*box[5]-cz;
      const along=c*a-s*d, xyz=[cx+a*cos+s*b*sin+c*along*(1-cos),
        cy+b*cos+(-s*a-c*d)*sin,cz+d*cos+c*b*sin-s*along*(1-cos)];
      xyz.forEach((v,n)=>assert(v>=h.sweep.sweep[n][0]-1e-8 && v<=h.sweep.sweep[n][1]+1e-8));
    }
  }
  assert.deepEqual(h.port.slice(0,2),[12950,6647]);
  assert(h.installedBendToLowRearSill>18 && h.installedBendToTallShroud>25);
  assert(h.fixedRailEndToRollingBend>110 && h.outerBridgeGap>440);
  assert(h.lockedEndToTrackCapY>175 && h.stowedKitToRollY>260);
  assert.equal(h.allDrawObstaclesQualified,false);
});
test('the parked catcher and its supports clear the permanent wet path; the pressure and spilling boundary stay open',()=>{
  const h=result.high;
  assert.equal(h.parked[1]-5550,35);
  assert(h.mobileBearingOverlap.every(v=>v>=30));
  assert.equal(h.parkedPlanGapToDryField,140);
  assert.equal(h.tailWallInternalGap,38);
  assert.equal(h.lateralClearFromTerminalEach,500);
  assert.deepEqual(h.nearbyCaps.map(p=>p.id),['P06','P17']);
  assert(h.nearbyCaps.every(p=>p.excavationPlanGap===432.5));
  assert(h.southReactionPerUnitWeight[0]<-3.9 && h.northReactionPerUnitWeight[1]>4.9);
  assert(h.losslessAvailableMargins[1]>19 && h.losslessAvailableMargins[1]<20);
  assert.equal(h.hydraulicallyAccepted,false);
  assert.equal(h.siteAccepted,false);
});
