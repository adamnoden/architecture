import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {upperFirst,renderUpper} from './upper-first-release.mjs';
const o=upperFirst();
test('upper-first changes the installed datum instead of inheriting a failed zero-drop flange pass',()=>{
 assert.equal(o.geometry.axisAnchor[2],-815);assert.equal(o.completeAngularProof.dropBeforeRoll,0);
 assert(o.zeroDropAtOldDatumRejected.bridgeClearance[0].minimumClearance<0);
 assert(o.spatialStateProof.bridgeCasesAfterDeformation.every(b=>b.minimumClearance>35));
 assert.equal(o.rearFixture.connectionReferenceZ,-630);assert.equal(o.rearFixture.memberTop,-580);assert.equal(o.rearFixture.memberBottom,-680);
 assert.equal(o.rearFixture.westSupport.connectionCentroidBelowProposedReturn,150);
 assert.equal(o.rearFixture.eastSupport.memberTopAboveSoffit,50);
 assert.equal(o.rearFixture.westReturn.rejectedNorthSupport.existingEWGirder,false);
 assert(o.rearFixture.westReturn.localRootMomentReferenceKnM[1]>9);
 assert.equal(o.rearFixture.westReturn.structurallyAccepted,false);
});
test('one rear support clears the complete native solids and leaves actual support/kit qualification open',()=>{
 assert(o.fullSolidSeparation.bodyChecks.every(x=>x.separated));
 assert(Math.min(...o.fullSolidSeparation.bodyChecks.map(x=>x.minimumGuaranteedAxisGap))>=62.5);
 assert(o.fullSolidSeparation.frameCheck.minimumGuaranteedAxisGap>220);
 assert.equal(o.fullSolidSeparation.minimumNorthWaterPlanGap,25);
 assert.equal(o.fullSolidSeparation.minimumArmToNeighborAfter10,25);
 assert.equal(o.rearFixture.structurallyAccepted,false);assert.equal(o.fullSolidSeparation.actualKitAccepted,false);
});
test('real200square point, independent water and signed capture upset price the positive seat/anchor duty',()=>{
 const a=o.rearFixture.nominalActionDomain;
 assert.deepEqual(a.pointCentres,{x:[6835,6940],y:[6950,7300]});
 assert.equal(a.cases,2560);
 assert(a.reactionsKn.front[0]<0&&a.reactionsKn.front[1]>18);
 assert(a.reactionsKn.rear[0]<-11&&a.reactionsKn.rear[1]>0);
 assert(a.reactionsKn.west[0]<0&&a.reactionsKn.east[0]<0);
 assert(a.reactionsKn.torsionEachUnshared>2);
 assert.equal(a.captureForceQualified,false);
 assert(o.upperAssembly.fullWetReferenceKg>80);
 assert.equal(o.upperAssembly.deliveredMassBoundEstablished,false);
});
test('full upper body needs the above-guard yaw and corrected CG/drive bounds remain conditional',()=>{
 assert(o.upperExport.unrotatedEachSideWith10<10);
 assert(o.upperExport.yaw90MinimumEachSide>=150);
 assert(o.upperExport.minimumOverGuardAfter10>200);
 assert(o.upperExport.minimumBelowRoofAfter10>=260);
 assert(o.upperExport.continuousYawRadius>333);
 assert.equal(o.renewal.cgBound.cases,1536);assert(o.renewal.cgBound.liftMinimumCgReserve>90&&o.renewal.cgBound.liftMinimumCgReserve<100);
 assert(o.nativeEndActions.rotation.wholeUnrestrictedReferenceGravityNm>800);
 assert.equal(o.nativeEndActions.rotation.unrestrictedGravityWithin500Reference,false);
 assert.equal(o.upperExport.actorSweepAccepted,false);
 assert.equal(o.wholeMethodAccepted,false);assert.equal(o.physicalEventPerformed,false);assert.equal(o.firstSusceptible,null);
});
test('stock centred CX003 intersects the seated lid and its direct bridle fails at every guard-clearing height',()=>{
 const {firstPick,guardTransit,accepted}=o.ordinaryUpperHandler;
 assert.deepEqual(firstPick.pickXY,[6887.5,7125]);
 assert(firstPick.minimumLidPlanInteriorForAnyHeadYaw>30);
 assert.equal(firstPick.highestStockHandChainBottom,-130);
 assert.equal(firstPick.verticalInterferenceAtLeast,130);
 assert(guardTransit.idealMaxBridleHeight>250&&guardTransit.idealMaxBridleHeight<252);
 assert(guardTransit.shortageEvenWithZeroTrolleyRailAndRiggingFittings>230);
 assert.equal(accepted,false);
});
test('lower track includes the final moving wheel and distinguishes actual in-receiver arm from rail at the boundary',()=>{
 const track=o.lowerTrackReference;
 assert(track.legacyRailRejected.topProjectsIntoFrameDepthBy>79);
 assert(track.loweredTrack.endReserve>120);
 assert.equal(track.loweredTrack.clipSection.webClearanceAfter3,1);
 assert(track.fixedSupport.isolatedExistingSizeReference.pointMidspanDeflection>5);
 assert.equal(track.localSiteConsequences.lastReceiverSupport,13500);
 assert(track.localSiteConsequences.armFaultSubmergenceAtReceiverSupport>35);
 assert(track.localSiteConsequences.localGradeFor500AtFarthestSupport<-1840);
 assert.equal(track.wholeTrackAccepted,false);
});
test('new upper-first source and changed geometry sheet reproduce',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/upper-first-release.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/upper-first-release.svg','utf8'),renderUpper(o));
});
