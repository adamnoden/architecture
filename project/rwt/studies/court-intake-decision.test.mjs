import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { courtDecision, decisionDrawing } from './court-intake-decision.mjs';
const d=courtDecision();
const near=(value,reference,tol=.01)=>assert(Math.abs(value-reference)<tol, [value,reference].join(' vs '));

test('the remaining graded edge needs both the released shadow and additional real wet width',()=>{
  assert.equal(d.firstHarm,null);
  assert.equal(d.geometricCrest-d.stage,50);
  const {existing,removeBeam,clear450,retainFootExtend50,retainSupportsExtend300,sixWetClosed}=d.inlet;
  near(existing.edge[0].entry,2.50457);
  assert(removeBeam.edge[0].entry<d.duty && removeBeam.edge[0].lip>d.duty);
  for(const option of [clear450,retainFootExtend50]){
    assert(option.edge[1].entry>d.duty && option.edge[2].entry<d.duty);
    assert(option.limitingLength>150 && option.limitingLength<160);
  }
  assert(retainSupportsExtend300.edge[1].entry<d.duty);
  assert(sixWetClosed.edge[2].entry>d.duty);
});
test('dry supports require reversible hold-down and a captured separate pan stroke',()=>{
  const r=d.ramp, [east,west]=r.rails;
  for(const s of r.rails){
    near(s.reactionsN[0]+s.reactionsN[1],s.totalLoadN);
    s.bearingDisplacementMm.forEach(gap=>near(gap,0));
  }
  assert(east.reactionsN[0]<-3500 && west.reactionsN[1]<-650);
  near(east.deflectionMm[2],-.7584);
  assert(Math.min(...r.safeGap)>10);
  near(r.minimumMovingKg,128.575);
  assert.deepEqual([r.panIntrusion,r.panParkGap,r.parkToModule,r.moduleToWeather],[125,55,27.5,25]);
  near(r.sweepToRail,32.19);
});
test('neither ramp position admits the east corner chamber and a longer slide breaches the court',()=>{
  const c=d.chambers;
  assert.deepEqual(c.installedOverlap,[450,450]);assert.deepEqual(c.storedOverlap,[450,450]);
  assert.deepEqual(c.normalInstalledOverlap,[0,425]);assert.deepEqual(c.normalStoredOverlap,[80,425]);
  assert.deepEqual([c.strokeToClearEast,c.wallOvershoot],[705,55]);
});
test('a partitioned 250 to 400 discharge prices real width, tail, back pressure and water load',()=>{
  const s=d.stilling, b=s.basket, nominal=s.screens.find(v=>v.width===300);
  assert(s.spoutEnd<s.dividerX && s.dividerX<s.lipX && s.top>s.spoutZ);
  assert(s.ports[1]<s.crest && s.ports[0]>s.bottom);
  assert(s.portCentresY.every(y=>y-20>=b[1] && y+20<=b[1]+b[3]));
  assert(s.lipY[0]>=6600 && s.lipY[1]<=7200 && s.lipY[1]-s.lipY[0]===400);
  assert(nominal.lowerReserve>0 && nominal.upperReserve>0);
  assert(s.lowerReserveAtRaisedTail<0 && s.upperReserveAtRaisedCrest<0);
  near(s.portLoss,57.459);near(s.removableBlockedWaterKg,85.7565);
  assert(s.jetDepth<s.operatingDepth && s.operatingDepth<250);
  assert(s.stressedMinimumGross>b[3] && s.stressedMinimumGross<600);
  for(const probe of s.screens.filter(t=>t.width<=b[3]*.75))assert(probe.stressedCrestRange[0]>probe.stressedCrestRange[1]);
});

test('the published plan and stage section reproduce the comparison',()=>{
  assert.equal(readFileSync(new URL('court-intake-decision.svg',import.meta.url),'utf8'),decisionDrawing(d));
});
