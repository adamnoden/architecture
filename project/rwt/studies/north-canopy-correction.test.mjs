import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canopy,renderCanopy} from './north-canopy-correction.mjs';
test('falling crown owns EVERY entry and true50mm lap; old global slot stays rejected',()=>{
 const o=canopy();
 for(const s of o.stations){
  assert(s.roofValley>s.crown);assert.equal(s.flashing.verticalContactLength,50);
  assert.equal(s.flashing.sidewallContactZ[1]-s.flashing.sidewallContactZ[0],50);
  assert(s.flashing.returnEndsAbove90Trial>0);
  assert(s.sideSlotX.every(v=>v[1]-v[0]===15));
 }
 assert(o.stations.at(-1).flashing.roofToFoldEnd>o.stations[0].flashing.roofToFoldEnd);
 assert(o.stations.at(-1).crown<2000,'2030 global hole is not inside this falling box');
 assert.equal(o.selectedGeometryChanged,false);assert.equal(o.accepted,false);
});
test('conserved combined flow and adverse obstruction stay visible with real support/crew envelopes',()=>{
 const o=canopy();assert.equal(o.flow.combinedLps,4.43895);
 assert(o.flow.straightCases.find(c=>c.n===.025&&c.remainingWidthFraction===1).satisfies90Depth);
 assert.equal(o.flow.straightCases.find(c=>c.n===.025&&c.remainingWidthFraction===.75).satisfies90Depth,false);
 assert(o.supports.bypass.minimumHorizontalGapToGrossFlange>0&&o.supports.bypass.minimumVerticalGapAboveHood>0);
 assert(o.crew.nominalReserve>0&&o.crew.nominalReserve<30);
 assert.equal(o.turn.grossOuterRadius,301.5);assert(o.receiver.terminalNearEdgeReserve>0);
 assert(o.loads.fullBlockedPrismaticWaterKg>200);
 assert(o.flow.blockedReceiverCases.every(c=>c.reserveToDeclaredFaultedMaximum>0));
 assert(o.flow.terminalImpact.maximumInputHead>=2051.5&&o.flow.terminalImpact.qualifiedSplash===false);
 assert.equal(o.qualifiedFirstHarm,null);
 assert.equal(o.failureMatrix.length,2);assert(o.failureMatrix.every(c=>c.result.startsWith('FAIL')));
});
test('actual canopy sheet and values reproduce',()=>{
 const o=canopy();
 assert.equal(fs.readFileSync('project/rwt/studies/north-canopy-correction.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/north-canopy-correction.svg','utf8'),renderCanopy(o));
});
