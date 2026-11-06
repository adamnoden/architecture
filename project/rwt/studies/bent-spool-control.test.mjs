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
 assert(o.geometry.straightCut<6000&&o.geometry.straightCut>5800);
 assert(o.loads.bendWaterGrossBoxBoundKg>49);
 assert(o.loads.knownWetIncludingBareFrameKg>351);
 assert.equal(o.renewal.translation,5855);assert.equal(o.renewal.requiredDeckEnd,19250);
 assert.equal(o.renewal.stageGrowthBeyondOld4700Control,2100);
 assert(o.renewal.cgBound.liftMinimumCgReserve>900);
 assert(o.renewal.cgBound.lowerCradleMinimumCgReserve>1400);
 assert(o.renewal.cgBound.parkedX[1]>16300,'Old farcradle cannot silently inherit the CG bound');
 assert.equal(o.accepted,false);assert.equal(o.siteAccepted,false);
});
test('new continuous proof and inspection sheet reproduce without admitting unresolved joints',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/bent-spool-control.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/bent-spool-control.svg','utf8'),renderBent(o));
 assert.equal(o.physicalEventPerformed,false);assert.equal(o.firstSusceptible,null);
});
