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
 assert.equal(guardTransit.minimumTopHookZForClearStockLoop,guardTransit.minimumBodyTop+2100+10);
 assert(guardTransit.minimumTopHookZForClearStockLoop>3600);
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
 const joined=track.fixedSupport.fullyJoinedCapReference;
 assert.equal(joined.pointMidspanDeflection.toFixed(3),'3.463');
 assert(joined.interfaceShearFlowNPerMm>36&&joined.interfaceShearFlowNPerMm<37);
 assert.equal(joined.accepted,false);assert.equal(track.wholeTrackAccepted,false);
});
test('continuous lock play includes full draw and both-coordinate allowance at each eligible bridge',()=>{
 const lock=o.positiveLockReference,[reference,adverse]=lock.crownCases;
 assert.deepEqual(reference.bridges.map(b=>Number(b.minimumClearance.toFixed(2))),[27.91,42.03,69.88]);
 assert.equal(adverse.bridges[0].minimumClearance.toFixed(2),'24.72');
 for(const [i,b] of reference.bridges.entries()){
  assert(b.minimumClearance>=lock.requiredBridgeClearanceMm);
  assert(adverse.bridges[i].minimumClearance<b.minimumClearance);
  assert.equal(b.governing.body,'complete-moving285flange-prism');
  assert(!b.eligibleBodies.includes('native-outlet460box'));
 }
 assert(adverse.bridges[0].minimumClearance<lock.requiredBridgeClearanceMm);
 assert.equal(lock.unsharedSingleLockLoadKn.toFixed(2),'10.26');
 assert(lock.uniformTorqueTwistDegrees>lock.pinFitDegrees);
 assert.equal(lock.actualLockAccepted,false);
});
test('bank seats clear the receiver while the full moving wheel train stays within the beam bound',()=>{
 const bridge=o.lowerTrackReference.bankSpanComparison;
 assert.deepEqual(bridge.bankX,[12250,14950]);assert.deepEqual(bridge.omittedSupportX,[13500]);
 assert.deepEqual(bridge.headToReceiverX,[200,400]);assert(bridge.originalJoinedSingleWheelMm>5);
 const L=bridge.slopedSpan,E=200000,I=bridge.grossI,P=8500,q=bridge.fullBoreWaterAndSteelNPerMm;
 // Independent pointwise influence solution. Mirror to the side before the load.
 function displacement(x,a){
  if(x>a){x=L-x;a=L-a;}
  const b=L-a;
  return P*b*x*(L*L-b*b-x*x)/(6*L*E*I);
 }
 let sampledPeak=0;
 for(let first=-bridge.wheelPitch;first<=L;first+=L/160){
  const positions=[first,first+bridge.wheelPitch].filter(a=>a>=0&&a<=L);
  for(let step=0;step<=120;step++){
   const x=L*step/120,dead=q*x*(L**3-2*L*x*x+x**3)/(24*E*I);
   sampledPeak=Math.max(sampledPeak,dead+positions.reduce((sum,a)=>sum+displacement(x,a),0));
  }
 }
 assert(sampledPeak>bridge.singleWheelMm+bridge.fullWetDeadLoadMm);
 assert(sampledPeak<=bridge.totalDeflectionUpperMm&&bridge.totalDeflectionUpperMm<4);
 assert(bridge.oneBankDownBoundKn>12.5&&bridge.oneBankUpBoundKn>5.7);
 assert(bridge.ordinaryGapAfter5AtEast>48&&Math.abs(bridge.ordinaryGapAfter5AtEast+bridge.faultImmersionAfter5AtEast-150)<1e-8);
 assert.equal(bridge.accepted,false);
});
test('new upper-first source and changed geometry sheet reproduce',()=>{
 assert.equal(fs.readFileSync('project/rwt/studies/upper-first-release.json','utf8'),JSON.stringify(o,null,2)+'\n');
 assert.equal(fs.readFileSync('project/rwt/studies/upper-first-release.svg','utf8'),renderUpper(o));
});
