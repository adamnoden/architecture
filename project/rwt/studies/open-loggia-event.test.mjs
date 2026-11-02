import test from 'node:test';
import assert from 'node:assert/strict';
import {build,readInputs,stripLitres,uniformDepth,render} from './open-loggia-event.mjs';
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
