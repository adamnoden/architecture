import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {control,renderControl,renderMouth} from './closed-east-control.mjs';
test('one ordinary fixed tube fits450beam; moving native flange separately rejects original draw',()=>{
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
 assert.equal(o.terminal.pad[2],1100);
 assert.equal(o.carrier.flange.catalogOutside,285);
 assert.equal(o.carrier.flange.catalogMassEachKg,7);
 assert(o.carrier.flange.wellFloorReserve===15);
 assert(o.loads.movingTubeAndTwoCatalogFlangesWetKg>144);
 assert(o.terminal.nearReceiverReserve>0&&o.terminal.farReceiverReserve>0&&o.terminal.airGapAtDeclaredFaultedMaximum>0);
 assert(o.carrier.supportCases.every(c=>c.residualDownhillMmPerM>0));
 assert.equal(o.siteAccepted,false);
});
test('closed-control source values and inspection sheet reproduce',()=>{
 const o=control();assert.equal(fs.readFileSync('project/rwt/studies/closed-east-control.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/closed-east-control.svg','utf8'),renderControl(o));
 assert.equal(fs.readFileSync('project/rwt/studies/closed-mouth-rewind.svg','utf8'),renderMouth(o));
});
test('finite inlet rewind pays walls, flanges, ramp shadows and preserves adverse approach failure',()=>{
 const o=control().mouthRewind,[same,candidate]=o.candidates;
 assert.equal(o.selectedGeometryChanged,false);assert.equal(o.accepted,false);
 assert.equal(same.creditedWidth,413.5);assert.equal(candidate.creditedWidth,463.5);
 assert.equal(candidate.northCoverLength+candidate.southCoverLength,1100);
 assert.deepEqual(candidate.unchangedShadows,[[7175,7275],[7375,7400]]);
 assert.equal(o.geometry.countEach,5);assert.equal(o.geometry.gateFrameReserves[0],25);
 assert.equal(o.geometry.parkedLeafReserve,2.5);assert.equal(o.geometry.weatherEntryNorthReserve,0);
 const low=c=>c.cases.find(x=>x.n===.04&&x.depthRule==='upstream-depth');
 const high=c=>c.cases.find(x=>x.n===.04&&x.depthRule==='critical-depth');
 assert(same.idealK1Remaining75CapacityLps>o.assignedLps);
 assert(low(same).quietCapacityLps<o.assignedLps);
 assert(low(candidate).quietCapacityLps>o.assignedLps);
 assert(high(candidate).quietCapacityLps<o.assignedLps);
 assert(o.geometry.stairs.firstTreadVerticalGap>100);
});

test('native moving flange failure cannot inherit tube clearance or tune nominal millimetres',()=>{
 const o=control(),f=o.carrier.movingFlangeClearance;
 assert.equal(f.installedTopGap,2.5);assert.equal(f.firstEntryTranslation,75);
 assert(f.sameLevelFirstEntryTopGap<4&&f.sameLevelFirstEntryTopGap<f.minimumAuthoredMovingClearance);
 assert(f.rotatedDisc.installedTopGap<3&&f.rotatedDisc.firstEntryTopGap<4);
 assert(f.rotatedDisc.firstLeadingPointEntryTranslation<75);
 assert.equal(f.accepted,false);assert(o.renewal.ordered.some(x=>x.startsWith('HOLD:')));
 assert(Math.abs(o.intakeTurn.factoryPortBinding.topPort[2]+467.60920197580214)<1e-8);
 assert(Math.abs(o.intakeTurn.horizontalAxisAt[2]-o.intakeTurn.factoryPortBinding.pipeAxisAtHorizontalPort)<1e-8);
 assert(o.collectingChange.outletShiftEW>6&&o.collectingChange.outletShiftEW<7);
 assert(o.intakeTurn.factoryPortBinding.aboveBridgeTopPortZ>0);
 assert.equal(o.renewal.aboveBridgeWholeControl.accepted,false);
});
