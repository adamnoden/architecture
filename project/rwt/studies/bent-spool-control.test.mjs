import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bentSpool,trigRange,renderBent} from './bent-spool-control.mjs';
const o=bentSpool();
test('complete roll preserves its actual interior75.942degree adverse extreme',()=>{
 const q=o.completeAngularProof.sweeps.find(x=>x.id==='native-outlet460box').angular[1];
 assert(q.maximumAtDegrees>75&&q.maximumAtDegrees<77);
 assert(q.maximum>o.completeAngularProof.sweeps.find(x=>x.id==='native-outlet460box').rolled[1][1]+10);
 assert(o.spatialStateProof.controls.fullAngularConstantStripAfterDeformation<25);
 const f=trigRange(0,3,4);assert(Math.abs(f.max.value-5)<1e-10);assert(f.max.phi>0&&f.max.phi<Math.PI/2);
});
test('whole bending solids stay out of bridge during roll and a misplaced roll really fails',()=>{
 assert(o.spatialStateProof.gated.filter(x=>x.id!=='straight-tube-conservative160square').every(x=>x.outsideEveryBridgeWhileRolling));
 assert(o.spatialStateProof.lockedTranslationMinimumNorthReserve>35);
 assert(o.spatialStateProof.bridgeCasesAfterDeformation.every(x=>x.minimumClearance>35));
 assert(o.spatialStateProof.controls.misplacedWholeFlangeInsideCourtBeam);
 assert(o.spatialStateProof.controls.unlockedWouldHitBridge);
 assert(o.spatialStateProof.controls.unlockedFullRotationInPortalMaximumZ>-410);
 assert(o.actualPostTranslation.supportX.includes(13500));
 assert(o.actualPostTranslation.minimumToNorthColumn>80);
});
test('whole frame, wet bodies and unconcentrated hardware charge the actual long export and CG',()=>{
 assert(o.geometry.straightCut<6000&&o.geometry.straightCut>5500);
 assert(o.loads.bendWaterGrossBoxBoundKg>49);
 assert(o.loads.knownWetIncludingBareFrameKg>320);
 assert(o.renewal.translation>5524&&o.renewal.translation<5525);assert.equal(o.renewal.requiredDeckEnd,18850);
 assert.equal(o.renewal.stageGrowthBeyondOld4700Control,1700);
 assert(o.renewal.cgBound.liftMinimumCgReserve>750);
 assert(o.renewal.cgBound.lowerCradleMinimumCgReserve>1400);
 assert(o.renewal.cgBound.parkedX[1]>16300,'Old farcradle cannot silently inherit the CG bound');
 assert.equal(o.accepted,false);assert.equal(o.siteAccepted,false);
});
test('new continuous proof and inspection sheet reproduce without admitting unresolved joints',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/bent-spool-control.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/bent-spool-control.svg','utf8'),renderBent(o));
 assert.equal(o.physicalEventPerformed,false);assert.equal(o.firstSusceptible,null);
});

test('whole rolling native solids exclude the carrier, preserving the old65degree rail conflict',()=>{
 assert.equal(o.frameRollProof.rejectedLongFrame.collision,true);
 assert.equal(o.frameRollProof.rejectedLongFrame.angleDegrees,65);
 assert(o.frameRollProof.inletEndGapAfterAdditionalFrameAndDeformation>30);
 assert(o.frameRollProof.outletEndGapAfterAdditionalFrameAndDeformation>100);
 assert.equal(o.frameRollProof.fullMethodAccepted,false);
});
test('ordinary two-position crew screen pays the real aperture instead of inheriting failed stationary reach',()=>{
 assert(o.failedFixedStationControls.originalFacing.maximumReferenceHandReach>650);
 assert(o.failedFixedStationControls.originalNorthFacing.maximumReferenceHandReach>700);
 assert(o.verticalJointReference.singleStationControls.every(x=>x.maximumReferenceHandReach>600));
 assert.equal(o.verticalJointReference.geometryFailures,0);
 assert(o.verticalJointReference.maximumReferenceHandReach<420);
 assert.equal(o.wellAndCrew.rejected100Opening.intrusion,25);
 assert.equal(o.wellAndCrew.southWidening,175);
 assert.equal(o.wellAndCrew.retainedPanDuringFirstRelease.module,3);
 assert(o.wellAndCrew.routeProof.minimumFlangePlanGapAfter5>=25);
 assert(o.wellAndCrew.routeProof.minimumWestOpeningReserveAfter5>=25);
 assert.equal(o.wellAndCrew.routeProof.originalDirectCrossingWouldHit,true);
 assert.equal(o.verticalJointReference.wholeDeliveredBodyAccepted,false);
 assert.equal(o.verticalJointReference.installedMethodAccepted,false);
 assert.equal(o.verticalJointReference.torqueAccepted,false);
 assert.equal(o.wellAndCrew.routeProof.full3DPostureAccepted,false);
});
