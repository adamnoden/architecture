import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {finiteBends,exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {deriveIncomingWaterStudy,incomingWaterText} from './incoming-water.mjs';
import {deriveCurrentHouse} from './current-house.mjs';
import {utilityFirstRestPreflight} from './utility-first-rest-preflight.mjs';
import {deriveBridgeNative} from './incoming-water-bridge-native.mjs';
import {bridgeNativeMotionResult} from './incoming-water-bridge-native-motion.mjs';
import {lowerCapComparator,lowerCapPlanEnvelope} from './incoming-water-lower-cap.mjs';
import {deriveLowerTailComparison} from './incoming-water-lower-tail.mjs';
import {deriveReleaseSupport} from './incoming-water-release-support.mjs';
import {deriveStandRetirement} from './incoming-water-stand-retirement.mjs';
import {compareDryDockSupport} from './incoming-water-dock-support.mjs';

const study=deriveIncomingWaterStudy();
test('finite bends represent a real quarter-circle and reject impossible tangent lengths',()=>{
  const r=finiteBends([[0,0,0],[100,0,0],[100,100,0]],25);
  assert.equal(r.bends[0].angleDeg,90);
  assert(Math.abs(r.bends[0].tangent-25)<1e-10);
  assert(r.path.every(p=>p.every(Number.isFinite)));
  // The arc is centred at(75,25), tangent at(75,0) and(100,25).
  for(const p of r.path.slice(1,-1))assert(Math.abs(Math.hypot(p[0]-75,p[1]-25)-25)<1e-10);
  assert(r.hausdorffError<.001);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[10,10,0]],25),/consume leg/);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[0,0,0]],25),/reversal/);
  assert.throws(()=>finiteBends([[0,0,0],[10,0,0],[10,10,0]],-1),/positive/);
});

test('current-source adverse controls defeat the inherited small-cylinder and utility proofs',()=>{
  assert.equal(study.inheritedInlet.totalLengthInsideRequiredEnvelopeMM,200);
  assert(study.bridge.rejectedOldSeatGapMM<-34);
  assert.equal(study.bridge.rejectedOldLowBridgeOrdinaryBodyGapMM,-337);
  assert.equal(study.utility.rejected.oldLowTailInsidePlatform,true);
  assert.equal(study.utility.rejected.oldUpperBranchInsidePod,true);
  assert.equal(study.utility.rejected.capAt950AxisToLiftedFrameMM,8);
});

test('full insulation and finite bends clear named utility bodies but do not earn terminal adoption',()=>{
  assert.equal(study.utility.pipeR,37);
  assert.equal(study.utility.bendRadius,75);
  for(const row of Object.values(study.utility.gapsMM))for(const gap of Object.values(row))assert(gap>25);
  assert(study.utility.hotColdGapMM>25);
  assert(study.utility.gapsMM.cold.fanWithSupports<29,'Do not hide the narrow setting reserve');
  assert.equal(study.utility.capSweeps.frame.gapMM,58);
  assert.equal(study.utility.capSweeps.carrier.gapMM,113);
  assert.equal(study.terminal.status,'NOT_ADOPTED');
  assert(study.terminal.gapsMM.coldWasher.some(x=>x.gapMM<0&&x.obstacle==='valve reaction arm'));
  assert(study.terminal.adverse.some(x=>x.includes('reachable')));
});

test('the higher bridge preserves a bounded ordinary path and uses continuous motion minima',()=>{
  assert.equal(study.bridge.crown,2150);
  assert.equal(study.bridge.ordinaryBody.pipeUndersideGapMM,113);
  assert(study.bridge.ordinaryBody.westLegGapMM>30);
  assert(Math.abs(study.bridge.ordinaryBody.eastPierGapMM-35)<2e-8);
  assert.equal(study.bridge.motion.finishedPanelUndersideZ,2350);
  assert.equal(study.bridge.motion.liftedCrownGapMM,78);
  assert(Math.abs(study.bridge.motion.westCaseGapMM-43)<1e-9);
  assert(Math.abs(study.bridge.motion.eastHeatGapMM-41)<1e-9);
  assert.equal(study.bridge.motion.westMinimumAtFraction,.025);
  assert.equal(study.bridge.motion.eastMinimumAtFraction,.17);
  assert.equal(study.bridge.status,'OBJECT_PATH_ONLY');
  assert.match(study.bridge.firstRestTrial.status,/NOT_ACCEPTED/);
});

test('front utility breaks include a reaction key, real tool thickness, hands and the larger captured head',()=>{
  const t=study.utilitySuccessor;
  assert.deepEqual(t.breaks.map(b=>b.point),[[11110,1275,595],[11300,1275,595]]);
  assert.equal(t.unionMadeZ[1],625);
  for(const c of t.tool.checks){
    assert(c.toolGapLowerMM>25);assert(c.handGapLowerMM>25);assert(c.armGapLowerMM>25);
    assert(c.otherUnionGapLowerMM>25);assert(c.maxReachUpperMM<650);
  }
  assert.equal(t.reactionSupport.verticalKeyToolGapMM,31.6);
  assert(t.reactionSupport.minimumNonContact.every(x=>x.gapMM>=25-1e-6));
  assert(t.reactionSupport.preliminaryForceCase.combinedBendingStressNmm2<50);
  assert(t.reactionSupport.preliminaryForceCase.tipDeflectionMM<1);
  assert.equal(t.head.completeHeight,700);
  assert.equal(t.head.retainedBelowRim,350);
  assert(t.head.minimumSweeps.every(x=>x.gapMM>=25-1e-6));
  assert(t.hotIsolation.reachMM<400);
  assert.equal(t.hotIsolation.handToOwnPipeMM,48);
  assert(Math.abs(t.controlledDrain.minimumFixedGapMM-25)<1e-6);
  assert.equal(t.controlledDrain.grossCuboidUpperLitres,12);
  assert.equal(t.controlledDrain.requiredNetLitres,10);
  assert.match(t.controlledDrain.noCredit,/unattended burst/);
});

test('development cannot silently adopt a route or release the existing house blocker',()=>{
  const house=deriveCurrentHouse();
  assert.equal(study.adoption.adopted,false);
  assert.equal(study.status,'IN_PROGRESS_NOT_ADOPTED');
  for(const s of[house.model.architecturalServices,house.model.servicesInterface])
    assert.equal(s.otherServiceDuties.find(x=>x.id==='incoming-water').status,'REJECTED_RETAINED_ROUTE');
  assert(house.model.currentAdoptionBlockers.some(x=>x.includes('Incoming-water REWIND')));
  assert.equal(readFileSync(new URL('incoming-water.json',import.meta.url),'utf8'),incomingWaterText(study));
});

test('located main and branch cuts include finite valve modules and full tool sectors',()=>{
  const s=study.station;
  for(const c of s.moduleContracts){assert(c.moduleSpareMM>=10);assert.equal(c.fullSeatSeparationAfterLiftMM,25);}
  for(const c of s.controls){assert(c.reachMM<650);assert(c.otherPipeGapMM>25);assert(c.otherValveGapMM>25);assert(c.riserGapMM>25);}
  for(const c of s.tool.checks){assert(c.toolGapLowerMM>25);assert(c.handGapLowerMM>25);assert(c.armGapLowerMM>25);assert(c.maxReachUpperMM<650);}
  assert(s.bodyChecks.every(c=>c.gapMM>=25-1e-6));assert(s.ordinaryBodyMinimumMM>25);
  assert(s.heatClearances.every(c=>c.gapMM>25));
  assert.equal(s.entry.riserToCapPlanMM,200);
  assert(s.functionalCuts.some(c=>c.work==='I0 or any joint before I0'&&c.cuts[0]==='B0'));
  assert.match(s.drain.scope,/unattended/);
});


test('segment/AABB distance handles crossings, degenerate points and long diagonals analytically',()=>{
  const box=[0,0,0,10,10,10],tol=2e-8;
  for(const[a,b,d]of[[[-5,5,5],[15,5,5],0],[[-5,15,5],[15,15,5],5],[[-3,-4,5],[-3,-4,5],5],[[20,20,20],[20,20,20],Math.sqrt(300)],[[-1e6,20,0],[1e6,20,0],10]])
    assert(Math.abs(exactSegmentBoxDistance(a,b,box)-d)<tol);
});

test('station captured release clears retained supports and provides reachable positive first-rest capture',()=>{
  const h=study.station.handling;
  for(const r of h.results){
    assert(r.bodyGapLowerMM>=25-1e-6);assert(r.objectRoomGapLowerMM>=25);
    assert(r.movingBodyGapLowerMM>=25);assert(r.maximumGripReachMM<650);
    assert(r.fixedSweep.every(x=>x.gapMM>=25));
    for(const n of r.nativeControls.results){assert(n.loadedBareTubeGapLowerMM>=2);assert(n.otherObjectGapLowerMM>=25);assert(n.maximumReachMM<650);}
    for(const n of r.nativeControls.keys){assert(n.minimumHandMM>=25);assert(n.minimumArmMM>=25);assert(n.reachMM<650);}
    assert(r.firstRest.remoteMinimum.every(x=>x.gapMM>=25));
    for(const n of r.firstRest.keyChecks){assert(n.minimumHandMM>=25);assert(n.minimumArmMM>=25);assert(n.reachMM<650);}
    assert(r.firstRest.native.cheekBendingNmm2<100);assert(r.firstRest.native.cheekDeflectionMM<.1);
  }
  assert(h.handoff.minimumWithdrawalBodyMM>25);assert(h.handoff.minimumSubsequentCrewSeparationMM>=25);
  assert(h.forceCase.vonMisesNmm2<100);assert(h.forceCase.carrier.netBendingStressNmm2<100);assert(h.forceCase.yoke.resultantBendingNmm2<100);
  assert.match(h.receiver.staging,/does not authorise unbolting/);
});

test('controlled drains have reachable valves and distinguish sealed low pockets from empty pipes',()=>{
  for(const d of study.station.drain.definitions){assert(d.minimumHandMM>=25);assert(d.minimumArmMM>=25);assert(d.reachMM<650);assert(d.airGapMM>=75);}
  assert.match(study.station.drain.retainedLowPockets,/kept sealed/);
  for(const d of study.utilitySuccessor.controlledDrain.drains){assert(d.clearance.every(c=>c.handMM>=25&&c.armMM>=25));assert(d.reachMM<650);}
});

test('unselected utility frame first rest closes Y1125 rack failure with finite Y1110/285 sweeps',()=>{
  const c=utilityFirstRestPreflight();
  assert.equal(c.status,'BOUNDED UTILITY FIRST-REST COMPARATOR; NOT SOURCE ADOPTION');
  assert.equal(c.inputs.frameTravelNorthMM,285);
  assert.equal(c.routes.coldSink[3][1],1110);
  assert(c.frameStaticMinimum.gapMM>=25);
  assert(c.framePipeMinimum.gapMM>=25);
  assert(c.pipeRackMinimum.gapMM>=25);
  assert.equal(c.frameStaticMinimum.obstacle,'eastWall');
  assert(Math.abs(c.frameStaticMinimum.gapMM-25.5)<1e-7);
  assert(c.framePipeMinimum.gapMM<30);
  assert(c.rejectedEarlierY1125RackGapMM<15);
  assert(c.crewBodyMinimum.gapMM>=25-1e-6); // exact segment/AABB solver subtracts a numerical 1e-8 mm
  assert(c.crewHandArmMinimum.armGapLowerMM>=25);
  assert(c.crewHandArmMinimum.handGapLowerMM>=25);
  assert(c.maximumGripReachMM<650);
  assert(c.footLanding.length===4&&c.footLanding.every(f=>f.patch>=0));
  assert(c.pressureAt2kNFootMPa<.3);
  assert(study.adoption.adopted===false,'No selected-house mutation from a standalone design comparator');
});

test('recovered upper bridge native tool, capture and receiving geometry remains source-bound and unselected',()=>{
  const b=deriveBridgeNative();
  assert.equal(b.status,'DEVELOPMENT_NOT_ADOPTED');
  assert.equal(b.toolChecks.length,2);
  for(const t of b.toolChecks){
    assert(t.minimum.value>25,t.side+' remote tool bound');
    assert(t.maxReach.value<600,t.side+' reach bound');
  }
  for(const c of b.controlChecks){
    assert(c.minimum.value>=25,c.side+' '+c.id+' remote control bound');
    assert(c.reach<600,c.side+' '+c.id+' reach');
  }
  assert.equal(b.receiver.status,'NATIVE_ENTRY_AND_ACCESS_COMPARISON');
  assert.equal(b.receiver.entry.allPositive,true);
  assert.equal(b.receiver.entry.guideMotionAllPositive,true);
  assert(b.receiver.entry.rejectedRaised56GateSignedGap<0);
  assert(b.receiver.entry.rejectedLowerFirstGateSignedGap<0);
  assert(b.receiver.structuralComparison.remainingEastReserveAfterBothDeflectionsAnd1mmFabrication>0);
  assert(b.receiver.rows.every(c=>c.minimum.value>25&&c.maxReach<600));
  assert.equal(study.adoption.adopted,false,'Native comparator must not silently select the house');
});

test('twenty-state upper-bridge swept metal and pipes recover independent adverse motion evidence',()=>{
  const m=bridgeNativeMotionResult;
  assert.equal(m.status,'NOMINAL_CONTINUOUS_CAPTURE_SWEEP');
  assert.equal(m.requiredMM,25);
  assert.equal(m.states.length,20);
  assert(m.pipeSamplesChecked>10000);
  assert(m.partsMinimum.gap>=25,m.partsMinimum);
  assert(m.pipeMinimum.gap>=25,m.pipeMinimum);
  assert(m.retainedFailedOldCatchGap<0,m.retainedFailedOldCatchGap);
  assert(m.motionAllowance.remainingMetal>=25,m.motionAllowance);
  assert(m.nativeHeelToOwnArmDuringGuidedCapture.length>=2);
  assert.equal(study.adoption.adopted,false);
});

test('lower cylinder cap tests exact eccentric cart envelope without adopting a rated fitting',()=>{
  const r=lowerCapComparator();
  assert.equal(r.status,'LOWER CAP GEOMETRY-ONLY; PRESSURE/RECEIVER/SEAL NOT QUALIFIED');
  assert(Math.abs(r.originalRecoveredProjection.retainedR400ClearanceMM-4.59781746)<1e-5);
  assert(r.originalRecoveredProjection.marginAfterTwo5MMSettingsMM<0);
  assert(Math.abs(r.thinnerUnselectedComparison.marginAfterTwo5MMSettingsMM-4.49678589)<1e-5);
  assert(r.rejectedLongerProjection.retainedR400ClearanceMM<0);
  assert(r.maximumProjectionBeforeR400MM>29.6&&r.maximumProjectionBeforeR400MM<29.7);
  assert(Math.abs(lowerCapPlanEnvelope(r.maximumProjectionAfterTwo5MMSettingsMM).marginAfterTwo5MMSettingsMM)<1e-8);
  assert(Math.abs(r.maximumProjectionAfterTwo5MMSettingsMM-19.5433268)<1e-6);
  for(const p of [r.driverParking.recovered25,r.driverParking.thinner15]){
    assert(p.oldStopShaftSignedGapMM<0);
    assert(p.proposedStopShaftSignedGapMM<p.requiredMM);
    assert(p.inboardLeverHandGapMM<p.requiredMM);
    assert(p.outboardLeverHandGapLowerMM>85);
  }
  assert.equal(r.driverParking.recovered25.proposedStopShaftCentrelineDistanceMM,15);
  assert.equal(r.driverParking.thinner15.proposedStopShaftCentrelineDistanceMM,25);
  assert.equal(r.driverParking.recovered25.shaftOnlyMinimumStopMM,297);
  assert.equal(r.driverParking.thinner15.shaftOnlyMinimumStopMM,287);
  assert(Math.abs(r.localCylinderEnvelope.thinner15ShaftGapMM-9.72461749)<1e-6);
  assert(Math.abs(r.localCylinderEnvelope.cartSettingLimitShaftGapMM-14.24837694)<1e-6);
  assert(r.localCylinderEnvelope.cartSettingLimitShaftGapMM<25);
  assert.throws(()=>lowerCapPlanEnvelope(-1));
  assert.throws(()=>lowerCapPlanEnvelope(Infinity));
  assert.equal(study.adoption.adopted,false);
});

test('short lower-cap driver clears four parked bolt approaches and retains adverse rail-end witnesses',()=>{
  const r=deriveLowerTailComparison();
  assert.equal(r.status,'DEVELOPMENT_NOT_ADOPTED');
  assert.equal(r.shorterDriver.travelMM,260);
  assert.equal(r.shorterDriver.bolts.length,4);
  assert(r.shorterDriver.bolts.every(b=>b.minimum.gapMM>r.requiredRemoteMM&&b.reachMM<470));
  assert.equal(r.shorterDriver.minimum.id,'westPost');
  assert(Math.abs(r.shorterDriver.minimum.gapMM-37.25181454)<1e-6);
  assert.equal(r.shorterDriver.bodyArrival.gapMM,32.5);
  assert(r.localBolt.rejectedCupGapMM<r.localBolt.combinedSettingAndWorkingGapMM);
  assert(r.localBolt.internalBitGapMM>r.localBolt.combinedSettingAndWorkingGapMM);
  assert(r.localBolt.shaftShoulderGapMM>r.localBolt.combinedSettingAndWorkingGapMM);
  assert(Math.abs(r.railEndFailures.madeTailToNearPlateMM-13.61888207)<1e-6);
  assert(Math.abs(r.railEndFailures.shiftedLinkToWestPostMM-10.55838423)<1e-6);
  assert.equal(r.railEndFailures.shiftedStrokeMM,22);
  const floor=r.independentFloorFrame;
  assert.equal(floor.driver.arrivalMM,0);
  assert(floor.driver.bolts.every(b=>b.minimum.gapMM>r.requiredRemoteMM&&b.reachMM<500));
  assert(floor.driver.bodyArrival.gapMM>r.requiredRemoteMM);
  assert(floor.staticMinimum.gapMM>30);
  assert(floor.movingTail.gapMM>44);
  assert(floor.movingLink.gapMM>28);
  assert(floor.carriage.gapMM>10);
  assert(floor.supportComparison.cantilever.every(c=>c.deflectionMM>floor.supportComparison.installedGuideBudgetMM));
  assert.equal(study.adoption.adopted,false);
});

test('the lower-tail release follows the beam and current dock, including rejected shared occupancy',()=>{
  const result=deriveReleaseSupport(),{departure,near,far}=result;
  assert(near.toes.every(toe=>toe.insideBeamMarginMM<0));
  assert(far.toes.every(toe=>toe.insideBeamMarginMM>100));
  assert(near.anchors.every(anchor=>anchor.inBeamPlanMarginMM>=80));
  assert(far.anchors.every(anchor=>anchor.inBeamPlanMarginMM>=120));
  assert(result.geometry.toolGap.gapMM>25);
  assert(result.directToeTrial.geometry.toolGap.gapMM<0);
  assert(result.directToeTrial.geometry.braceGap.gapMM<0);
  assert(departure.ordinaryAccessWithFrame.gapMM<0);
  assert(departure.externalAccessWithFrame.gapMM>25);
  assert(departure.retainedRailControl.some(phase=>phase.partGap.gapMM<-40));
  assert(departure.retainedEndBypassChallenger.some(phase=>phase.partGap.gapMM<-25));
  assert(departure.detachedRailChallenger.every(phase=>
    Math.min(phase.partGap.gapMM,phase.bodyToPackage.gapMM,phase.bodyGap.gapMM,phase.handOrArmGap.gapMM)>25));
  assert(departure.receiver.ownHandToBearingAtRestMM>2);
  assert(departure.receiver.pipeCentreToBearingSouthEdgeMM-20>25);
  assert(departure.detachedRailChallenger.every(phase=>phase.maximumReachMM<600));
  assert.equal(departure.receiver.nativeVerticalSeparationAtRestMM,0);
  assert(departure.receiver.bearingLandProjection);
  const capture=departure.temporaryCapture;
  assert(capture.firstCaptureClearance.gapMM>31);
  assert(capture.yokeToMast.gapMM>31&&capture.yokeToUnremovedGuides.gapMM>=30);
  assert(capture.lowPickupClearance.gapMM<0);
  assert(capture.shortestAnchorFootToBeamEdgeMM>140);
  assert(capture.anchorRowDemandN>1200);
  assert(departure.railExtraction.every(({normalNear,towardsYoke,releasedShortBar})=>
    normalNear.gapMM<0&&towardsYoke.gapMM<0&&releasedShortBar.staged.liftFirst.gapMM>10&&
    releasedShortBar.staged.slideSecond.gapMM>10));
  assert(departure.railExtraction.every(rail=>rail.releasedShortBar.firstLift250MM.gapMM<0));
  assert(departure.railExtraction.every(({releasedShortBar:{staged:{rest}}})=>
    rest.lowerThird.gapMM>100&&rest.landGapAtRestMM===0&&rest.minimumLateralBearingOverhangMM===3));
  const keeper=departure.receiver.positiveDockKeeperTrial;
  assert.equal(keeper.reactions.verticalLeverArmMM,180);
  assert(keeper.reactions.upperReactionN>300&&keeper.reactions.lowerReactionN<-200);
  assert(keeper.reactions.baseRowCoupleN>1100);
  assert(keeper.approachResult.gapMM>5&&keeper.settlingResult.gapMM>5);
  assert.equal(keeper.pinTravelMM,51);
  assert(keeper.northActuationTrial.gap.gapMM>35&&keeper.northActuationTrial.reachMM<450);
  assert(keeper.southActuationTrial.secondBodyGap.gapMM>54);
  assert(keeper.southActuationTrial.secondOperatorToFirstMM>224);
  assert(keeper.southActuationTrial.secondOperatorToDockGuardMM>=95);
  assert(keeper.southActuationTrial.gap.gapMM>75&&keeper.southActuationTrial.reachMM<460);
  assert(departure.longerKeeperKeyControl.gapMM<1);
  const dock=departure.dockComparison;
  assert.equal(dock.cylinder.oldGapMM,35);
  assert.equal(dock.cylinder.requiredGapMM,-45);
  assert.equal(dock.wholeUShiftChallenger.eastHandlerToInsideGuardMM,-30);
  assert(dock.retainedWholeUNorthDogleg.route.gapMM>25);
  assert(dock.retainedWholeUNorthDogleg.afterSettingsMM<25);
  assert(dock.retainedWholeUNorthDogleg.northEndpointMinimumY>dock.retainedWholeUNorthDogleg.northEndpointMaximumY);
  assert(dock.tailRest.landingToRequiredCartMM<0);
  assert(dock.tailRest.parkedToRequiredCartMM>200);
  assert.equal(dock.emptyWholeUReceiverParking.lateralCartClearanceLowerMM,75);
  assert(dock.emptyWholeUReceiverParking.parkedToRequiredCartMM>200);
  assert(dock.emptyWholeUReceiverParking.bodyGapBetweenParkedReceiversMM<0);
  assert(dock.emptyWholeUReceiverParking.bodyGapToSouthGuardMM<0);
  assert.equal(result.status,'DEVELOPMENT_NOT_ADOPTED');
});

test('the intact stand clears only the high-lift sequence and requires positive restraint before retirement',()=>{
  const stand=deriveStandRetirement();
  const dock=compareDryDockSupport(stand);
  assert.equal(dock.status,'DEVELOPMENT_NOT_ADOPTED');
  assert.equal(dock.gradeRiseMM,1774);
  assert.equal(dock.receivingLiftAtLevelMM,-26);
  assert.equal(dock.packedLiftClearWidthMM,1500);
  assert.equal(dock.alignedLiftClearWidthMM,1600);
  assert.deepEqual(dock.alignedLiftClearY,[3450,5050]);
  assert.deepEqual(dock.receiverInterface.straightThroughClearPlanMM,[1300,1600]);
  assert.equal(dock.largestLiftClearLengthMM,1300);
  assert(dock.cargoCases.every(({scaffoldIntersects})=>scaffoldIntersects));
  assert(dock.crewByCargo.every(row=>row.wheelToCrewMinimumMM>=75&&row.secondSideCrewAvailableMM<0));
  assert(dock.standRestToCargoMM.every(row=>row.gapMM===0));
  assert.deepEqual(dock.feet[0].xy,[12400,3650]);
  assert.equal(Math.min(...dock.feet.map(foot=>foot.collectorGapMM)),145);
  assert.equal(Math.min(...dock.feet.map(foot=>foot.capGapMM)),157.5);
  assert.equal(Math.min(...dock.feet.map(foot=>foot.ductGapMM)),275);
  assert.equal(Math.min(...dock.feet.map(foot=>foot.scaffoldGapMM)),60);
  assert(dock.complete.min.force<-514&&dock.complete.max.force>3863);
  assert(dock.stand.min.force<-267&&dock.stand.max.force>1289);
  assert(dock.equalFootBallastKG>209&&dock.equalFootBallastKG<210);
  assert(dock.preloadedFootPressureKPa>70&&dock.preloadedFootPressureKPa<71);
  assert(dock.rigidFloorContrast.shelfMomentNMM>895000);
  assert(dock.rigidFloorContrast.idealRemainingGateClearanceMM>2);
  assert(dock.cargoControl.gradeHoldN>28&&dock.cargoControl.hypothetical15MMStepN>2133);

  assert(stand.motion.every(phase=>phase.gap>30));
  assert(stand.body.every(phase=>phase.gap>25&&phase.handOrArm.gap>25&&phase.maximumReachMM<600));
  assert.equal(stand.thresholdSlice.highestZ,2223);
  const handoff=stand.suspendedHandoff;
  assert.equal(handoff.clearHeadroomMM,77);
  assert.equal(handoff.availableStackMM,42);
  assert.equal(handoff.overTopShortfallMM,38);
  assert.deepEqual(handoff.lateralBudgetEachSideMM,[120,365]);
  assert.deepEqual(handoff.sidePickupRemainingMM,[60,305]);
  assert.equal(handoff.underBaseClearanceMM,-10);
  assert(handoff.staticGravityOnlyGaugeMM>421&&handoff.staticGravityOnlyGaugeMM<422);
  assert(handoff.centredHandoffVerticalN>1765&&handoff.centredHandoffVerticalN<1766);
  const side=stand.sideHandoff;
  assert.deepEqual(side.railYs,[4185,4960]);
  assert.deepEqual(side.handovers.inboard.keeperRailOverlapMM,[90,90]);
  assert.deepEqual(side.handovers.outboard.keeperRailOverlapMM,[90,90]);
  assert.equal(side.handovers.inboard.standToPlateMM,155);
  assert.equal(side.handovers.outboard.standBeyondCollectorMM,260);
  assert(side.frameToNative.gap>37.9&&side.fixedToStand.gap>36.9);
  assert.equal(side.rigidFrameToRails.gap,15);
  assert.equal(side.preEntryClearance.to,'buffer');
  assert(side.preEntryClearance.gap>27&&side.preEntryClearance.gap<28);
  assert(side.sideInstallation[0].gap<-39&&side.sideInstallation[1].gap<16);
  assert(side.verticalInstallation.every(row=>row.gap>40));

  assert.equal(side.frameToStand.to,'southBrace');
  assert(side.frameToStand.gap>12&&side.frameToStand.gap<13);
  assert(side.workerClearance.gap>50&&side.workerReachMM<365);
  assert(side.feet.slice(0,2).every(foot=>foot.girderEdgeInsetMM===259.5&&foot.gapToCoverMM===77));
  assert(side.feet.slice(2).every(foot=>foot.girderEdgeInsetMM<0&&foot.gapToScaffoldMM>68));
  assert(side.minKeeperN<-175&&side.maxKeeperN>841);
  assert(side.minSupportN<-173&&side.maxSupportN>1275);
  assert(side.fullAxisCantileverDeflectionMM>4.9);
  assert(side.nominalBraceAxialN>192&&side.nominalBraceAxialN<193);
  assert(side.fixedToNative.gap>37.4&&side.overheadToNative.gap>50.4&&side.overheadToStand.gap>48.4);
  assert(side.oneKneeAxialN>173&&side.transverseBaseCoupleN>226&&side.dockBaseCoupleN>208);
  assert(side.transverseBraceWorkerClearance.gap<-19.9&&side.transverseBraceStandClearance.gap<-46);
  assert.deepEqual(side.offsetLegY,[4089,5056]);
  assert(side.keeperToHangers.gap<-33.9);
  assert(side.jawToFixed.gap>37&&side.jawToHangers.gap>15.8);
  assert.equal(side.jawToRail.gap,4);
  assert(side.remainingGateRailClearanceMM>2.3&&side.remainingGateRailClearanceMM<2.4);
  assert(side.splitKeeperTrials.every(keeper=>keeper.carriageSweep.gap>37.5&&keeper.actuatorSweep.gap>38.6));
  assert(side.splitKeeperTrials.every(keeper=>keeper.sweep.gap>40.9&&keeper.outboardFixedSweep.gap>65.2));
  assert(side.splitKeeperTrials.every(keeper=>keeper.latchShearN>126&&keeper.latchShearN<127));
  assert(side.splitKeeperTrials.every(keeper=>keeper.parkedClearance.gap>55.5&&
    keeper.xHands.every(station=>station.rodStrokeMM===40&&station.reaches<297&&station.linkage.gap>12)));

  assert.equal(stand.thresholdSlice.minimumServicePlateLateralMarginMM,142.5);
  assert(stand.adverse.shortLift.some(phase=>phase.gap<10));
  assert(stand.adverse.openLeaf.some(phase=>phase.gap<25));
  assert(stand.adverse.expandedCradle.some(phase=>phase.gap<25));
  assert(stand.stability.massKG>70&&stand.stability.massKG<80);
  assert(stand.stability.pointSupport.mostAdverseN<-90);
  assert(stand.stability.restrainedCarrierTrial.minimumOpposedTieForceN>2000);
  assert(stand.stability.firstTakeoverTrial.liftingKeySupports.every(key=>key.verticalForceN>0));
  const restraint=stand.restraint;
  assert(restraint.trackPadMotion.every(phase=>phase.gap>30));
  assert(restraint.wideTrackPadMotion.every(phase=>phase.gap>30));
  assert(restraint.linearStaticRatingComparison>1);
  assert(restraint.wideStaticRatingUsage<1&&3*restraint.wideStaticRatingUsage>1);
  assert.deepEqual(restraint.railBedsRequiringSlab.map(bed=>bed.pointsBeyondBeam.length),[0,1,2]);
  const crossing=restraint.thresholdDockConnection;
  assert(crossing.opposingHoldDownN>1270&&crossing.opposingHoldDownN<1271);
  const signed=crossing.signedReactions;
  assert.equal(signed.cases.length,10);
  assert.equal(signed.maximumHoldDownN,1725);
  assert(signed.maximumCompressionN>3036&&signed.maximumCompressionN<3037);
  assert.deepEqual(signed.cases.filter(row=>row.verticalN===0).map(row=>row.reactionsN),
    [[1725,-1725],[-1725,1725]]);
  const staticGravity=signed.cases.find(row=>row.state==='estimated stand at static gravity'&&row.horizontalN===100);
  assert(staticGravity.reactionsN[0]<-1539&&staticGravity.reactionsN[0]>-1540);
  const coplanar=crossing.coplanarCrossing;
  assert.equal(coplanar.railSpan,558);
  assert.equal(coplanar.crossSpan,715);
  assert.equal(coplanar.coplanarStackZ,61);
  assert.equal(coplanar.stackedStackZ,96);
  assert(coplanar.crossheadMinimumSupportN<-193&&coplanar.crossheadMinimumSupportN>-194);
  assert(coplanar.crossheadStressMPa>36&&coplanar.crossheadStressMPa<37);
  assert(coplanar.crossheadMaximumDifferentialMM>0.015&&coplanar.crossheadMaximumDifferentialMM<0.016);
  assert.equal(coplanar.continuousDeckOverlapsGuideMM,5);
  assert.equal(coplanar.clearanceAboveGuideMM,16);
  const bridge=crossing.independentDryBridge;
  assert.equal(bridge.dryBridgeSpanMM,558);
  assert.equal(bridge.innerFootToDryFaceMM,20);
  assert.equal(bridge.outerFootBeyondCollectorMM,90);
  assert(bridge.innerSupportIntersectsCoverPlan&&bridge.outerSupportIntersectsScaffoldPlan);
  assert.equal(bridge.minimumRailBlockStackMM-bridge.movingCaptureBaselineMM,13);
  assert(bridge.maximumBridgeBottomAtCurrentDatumMM<0);
  assert(bridge.fixedBridgeMotion.some(phase=>phase.gap<0));
  assert(stand.landing.firstRestIdealGravityScreenPasses);
  assert(stand.landing.positiveKeeperRequired);
  assert(stand.landing.cartConflictMM<0);
  assert.equal(stand.status,'DEVELOPMENT_NOT_ADOPTED');
});
