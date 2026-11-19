import test from 'node:test';
import assert from 'node:assert/strict';
import {build,readInputs,stripLitres,uniformDepth,render,idealCrestSpecificEnergyMm,idealCrestJoinSeparationMm} from './open-loggia-event.mjs';
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('piecewise pool integration preserves dry, partial and fully wetted strips',()=>{
 near(stripLitres(-110,3500,2000,-110,-30),0);
 near(stripLitres(-70,3500,2000,-110,-30),70);
 near(stripLitres(-30,3500,2000,-110,-30),280);
 near(stripLitres(0,3500,2000,-110,-30),490);
});
test('combined event conserves roof interception and rejects double-counting',()=>{
 const v=build();near(v.catchment.combinedM2,60.0625);
 assert(v.catchment.offsetInnerRoofM2+v.catchment.wallLineCourtM2>v.catchment.combinedM2);
 near(v.events[1].combinedLitresPerSecond,2.4025);near(v.events[1].tenMinuteLitres,1441.5);
 near(v.storage[0].courtOnlyLitres,280);near(v.storage[0].courtAndLoggiaLitres,1312.75);
});
test('actual pan join rejects inherited floor/crest controls and positive-head equality',()=>{
 const v=build();const d=v.dam.find(x=>x.heightMm===80);near(d.crestMm,-30);near(d.staticPanJoinSeparationMm,0);
 assert(v.dam.find(x=>x.heightMm===110).staticPanJoinSeparationMm<0);
 assert(v.dam.find(x=>x.heightMm===125).staticPanJoinSeparationMm<0);
 for(const e of v.events)assert(e.idealMouthDamHeightToPanJoinMm<80);
 // 60 mm dam is only an ideal energy screen; no actual-safe Boolean is created.
 assert(v.events.every(e=>e.idealMouthDamHeightToPanJoinMm>60));
 assert.equal(v.safeWaterLevel,undefined);
});
test('monotonic probes and equivalent filling clocks do not create hydraulic acceptance',()=>{
 const v=build();assert(uniformDepth(.006,.25,.02,.01)>uniformDepth(.003,.25,.02,.01));
 for(const e of v.events){assert(e.reliefUniformDepthMm<e.normalUniformDepthMm);near(e.noOutletCourtOnlySecondsToComparison*e.combinedLitresPerSecond,280);}
 assert.match(v.assumptions.join(' '),/not an established first leakage/);
});
test('source drift fails closed; renewal consumes relief and old eave access does not transfer',()=>{
 const s=structuredClone(readInputs());s.house.model.outdoorWaterTerritories.normalLiner.inside=300;assert.throws(()=>build(s));
 const v=build();assert.deepEqual(v.renewal.stageOverlapWithReliefMm,[350,3600]);
 assert.equal(v.renewal.normalAndReliefLive,false);assert.equal(v.renewal.temporaryRainRouteQualified,false);
 near(v.highLevel.eaveIncreaseMm,300);near(v.highLevel.newNominalEaveGapMm,1300);
 assert.match(render(v),/NOT a hydraulic/);assert.match(v.authority,/RWT-06 remains open/);
});

test('combined mouth dam and reduced opening can exceed the unqualified pan join even in ideal flow',()=>{
 const v=build(),q=v.events[2].combinedLitresPerSecond;
 const separation=(widthMm,damMm)=>idealCrestJoinSeparationMm({
  flowLitresPerSecond:q,clearWidthMm:widthMm,
  crestMm:v.levels.mouth+damMm,vulnerableJoinMm:v.levels.panJoin
 });
 near(idealCrestSpecificEnergyMm(q,1800),v.events[2].idealSpecificEnergyMm);
 near(separation(1800,60),8.869286009845958);
 near(separation(900,60),2.331092902872321);
 near(separation(600,60),-3.152818109936934);
 assert(separation(1800,70)<0,'70 mm dam fails even at full 1800 mm ideal width');
 assert(separation(600,60)<0,'600 mm clear width with 60 mm dam fails');
 // Positive ideal head separation is NOT an acceptance or waterproofing verdict.
 assert(separation(900,60)>0);
 for(const width of [1800,1500,1200,900,600,300]) {
  assert(separation(width,60)>separation(width,70));
 }
 for(const height of [0,40,60,70,80]){
  assert(separation(1800,height)>separation(900,height));
  assert(separation(900,height)>separation(600,height));
 }
 assert.throws(()=>idealCrestSpecificEnergyMm(q,0));
 assert.throws(()=>idealCrestSpecificEnergyMm(-q,1800));
});
