import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {control,renderControl} from './closed-east-control.mjs';
test('one ordinary closed control fits actual450beam and950clear faces without borrowing250bridge',()=>{
 const o=control();assert.equal(o.retained.fieldBeamUnderside,-630);
 assert(o.carrier.fieldMinimumCrownGap>60);
 assert(o.carrier.movingSideReserves.every(v=>v>=o.retained.minimumMovingClearanceEach));
 assert(o.carrier.flangeWestToFirstBeamEW>0&&o.carrier.flangeEastBeyondOuterBeamEW>0);
 assert(o.intakeTurn.reservedBox[0]+o.intakeTurn.reservedBox[3]<=7550);
 assert(o.intakeTurn.reservedBox[2]>-950);
 assert.equal(o.selectedGeometryChanged,false);assert.equal(o.accepted,false);
 assert.equal(o.renewal.hiddenMiddleJoint,false);
});
test('ordinary screens retain inlet/debris/low-flow failures rather than rescuing an open65throat',()=>{
 const o=control(),h=o.hydraulics;
 assert(h.uniformCases.find(c=>c.n===.025&&c.boreFraction===.75).passesAssignedFullBoreScreen);
 assert.equal(h.uniformCases.find(c=>c.n===.025&&c.boreFraction===.5).passesAssignedFullBoreScreen,false);
 assert(h.unchangedMouthCases.find(c=>c.lossK===1&&c.remainingFraction===.75).requiredCourtStage>-35);
 assert(h.slowHeaderCounterexample.slice(0,2).every(c=>c.optimisticTailwaterReserveMm<0));
 assert(h.slowHeaderCounterexample.at(-1).optimisticTailwaterReserveMm<3);
 assert(h.cleanPartialCases.every(c=>c.depthMm<153.5/2));
 assert(h.lossCases.every(c=>c.fallOnlyReserveMm>0));
 assert(h.pressureBoundaries.maximumRoofHeadAtLowestInvertMm>7900);
 assert.equal(o.qualifiedFirstHarm,null);
});
test('one-piece renewal pays exterior land and full blocked water; old short rack cannot be reused',()=>{
 const o=control(),n=o.renewal;
 assert.equal(n.stageExtensionEW,2200);assert.equal(n.deckExtensionEW,950);
 assert(n.temporaryCradleX[1]>n.oldDeckEndX);
 assert(n.temporaryCradleX[0]<n.pipeParkCentreX&&n.pipeParkCentreX<n.temporaryCradleX[1]);
 assert(o.loads.fullBlockedTubeWaterKg>88&&o.loads.tubeOnlyWetKg>130);
 assert.equal(n.completeHandlerSweepProved,false);
 assert.equal(o.terminal.pad[2],1000);
 assert(o.terminal.nearReceiverReserve>0&&o.terminal.farReceiverReserve>0&&o.terminal.airGapAtDeclaredFaultedMaximum>0);
 assert(o.carrier.supportCases.every(c=>c.residualDownhillMmPerM>0));
 assert.equal(o.siteAccepted,false);
});
test('closed-control source values and inspection sheet reproduce',()=>{
 const o=control();assert.equal(fs.readFileSync('project/rwt/studies/closed-east-control.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/closed-east-control.svg','utf8'),renderControl(o));
});
