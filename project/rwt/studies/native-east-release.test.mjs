import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nativeRelease,renderNative} from './native-east-release.mjs';
const o=nativeRelease();
test('actual low-posture native reference cannot inherit standing shoulder or original floor',()=>{
 assert(o.manualReference.maximumReferenceReach<600);
 assert(o.standingControl.maximumReferenceReach>1000);
 assert(o.originalFloorControl.maximumReferenceReach>800);
 assert(o.uncontrolledStraightToolControl.maximumReferenceReach>600);
 assert.equal(o.manualReference.perBoltWorst.length,8);
 assert(o.manualReference.flangeFaceNormal[2]<0);
 assert.equal(o.manualReference.accepted,false);
 assert(o.manualReference.torqueSensitivity.at(-1).tangentialHandForceN>500);
});
test('open platform removes unearned RC enclosure but retains real support and ground failures',()=>{
 const p=o.platform;
 assert(p.deadKn<2.3&&p.rcComparator.fixedKn>36);
 assert(p.steelScreen.barStressMPa<p.steelScreen.proofStressHypothesis);
 assert(p.minimumPointAndDeadKn>0);
 assert(p.minimumWithHorizontalKn<0,'Free bearing cannot inherit an anchored-platform pass');
 assert(p.maximumPlusUniformKn>8.5);
 assert.equal(p.geometry.clearanceAllowanceBeyond500,0);
 assert.equal(p.carrierSupported,false);
 assert.equal(o.selectedGeometryChanged,false);assert.equal(o.accepted,false);
});
test('supported first drop counts wet water and real frame, never borrowing a dry50kg claim',()=>{
 const c=o.carrierSupport;
 assert(c.combinedKnownWetKg>250&&c.bareFrameKg>107);
 assert(c.remainingHardwareBudgetKg>50&&c.remainingHardwareBudgetKg<55);
 assert(c.initialMotion.remainingAxialBeforeBeamWhenDropStarts>60);
 assert(c.initialMotion.larger290MovingEnvelopeGap>40);
 assert(c.initialMotion.frameLowAtWestAfterDrop<-950);
 assert.equal(c.initialMotion.newFloorReserve,185);
 assert(c.conservativeMidpointDeflectionMm>11);
 assert.equal(o.siteAccepted,false);
});
test('source and inspection sheet reproduce with all admissions still false',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/native-east-release.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/native-east-release.svg','utf8'),renderNative(o));
 assert.equal(o.physicalEventPerformed,false);
});
