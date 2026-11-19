import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {compareTerminalReception} from './court-terminal-reception.mjs';
const near=(actual,expected,eps=1e-8)=>
  assert(Math.abs(actual-expected)<eps,`${actual} != ${expected}`);

test('joined HAD/MAT terminals have vertical clearance but no plan-aligned receiver below either lip',()=>{
  const d=compareTerminalReception();
  near(d.geometry.normal.gapBeforeReceiverSouthEdgeMm,100);
  near(d.geometry.relief.gapBeforeReceiverSouthEdgeMm,100);
  near(d.geometry.receiving.nominalVerticalAirGapMm,200);
  near(d.geometry.receiving.receiverPlanSeparationMm,300);
  near(d.geometry.receiving.guardToReceiverFrontMm,450);
  near(d.geometry.normal.lipYmm,13550);
  near(d.geometry.relief.maximumNorthLipYmm,13550);
  assert.equal(d.geometry.receiving.zeroOutwardTravelHasNoPlanReceivingOverlap,true);
  assert.equal(d.geometry.receiving.bestCaseNorthwardChuteStillMissesReceiver,true);
  assert.equal(d.inputs.had.blob,'25faad2c4d40df2b7da7212f73808843a88d2f52');
  assert.equal(d.inputs.mat.blob,'0ec54ba2420b9337ce81b1867eef4c83d661e69b');
});

test('no free 300mm splash allowance: any plausible landing correction moves real infrastructure',()=>{
  const d=compareTerminalReception(),c=d.geometry.receiving.candidateChanges;
  near(c.authoredBufferMm,300);
  near(c.normalAdditionalNorthReachMm,400);
  near(c.reliefAdditionalNorthReachMm,400);
  near(c.normalReceiverSouthwardShiftMm,400);
  near(c.reliefReceiverSouthwardShiftMm,400);
  near(c.movedReceiverFrontYmm,13250);
  near(c.movedReceiverGapNorthOfGuardMm,50);
  near(d.geometry.receiving.unsupportedIdealBallistic.theoreticalMinimumNorthwardVelocityFor100mmMs,
    .49522722057657537,1e-12);
  assert.match(d.geometry.receiving.unsupportedIdealBallistic.scope,/NOT a measured launch/);
  assert.equal(d.receiverCaptureAccepted,undefined);
});

test('full-duty face stress keeps primary/relief and first-harm arithmetic separate',()=>{
  const d=compareTerminalReception(),e=d.events.find(x=>x.intensityMmPerHour===216);
  near(d.levelLedger.selectedCourtMouthFloorMm,-110);
  near(d.levelLedger.unqualifiedPanDpcComparatorMm,-30);
  near(d.levelLedger.normalMouthInvertMm,-213.75);
  near(d.levelLedger.normalMouthLipMm,-138.75);
  near(e.fullRoofAndCourtLitresPerSecond,3.60375);
  near(e.courtRainAloneLitresPerSecond,.735);
  near(e.normalFullDutyUniformDepthMm,32.8421825883965,1e-8);
  near(e.normalMouthIdealSurfaceLevelMm,-180.9078174116035,1e-8);
  near(e.normalMouthNominalWallHeadLeftMm,42.1578174116035,1e-8);
  near(e.reliefFullDutyUniformDepthMm,10.5116403311734,1e-8);
  near(e.reliefMouthIdealSurfaceLevelMm,-99.4883596688266,1e-8);
  near(e.reliefMouthIdealSeparationToUnqualifiedPanJoinMm,69.4883596688266,1e-8);
  for(let i=1;i<d.events.length;i++){
    assert(d.events[i].fullRoofAndCourtLitresPerSecond>d.events[i-1].fullRoofAndCourtLitresPerSecond);
    assert(d.events[i].normalFullDutyUniformDepthMm>d.events[i-1].normalFullDutyUniformDepthMm);
    assert(d.events[i].reliefFullDutyUniformDepthMm>d.events[i-1].reliefFullDutyUniformDepthMm);
  }
});

test('visible chute is not mild-slope Manning and separate rectangles are not distinct accepted destinations',()=>{
  const d=compareTerminalReception();
  near(d.geometry.relief.authoredChuteVerticalDropMm,447.5);
  near(d.geometry.relief.impliedVerticalDropPerRun,447.5/350);
  assert(d.geometry.relief.impliedVerticalDropPerRun>1);
  near(d.levelLedger.outletLevelMm,-600);
  near(d.levelLedger.waterLevelAtBothUnverifiedReceiversMm,-800);
  assert.match(d.stateChecks.join(' '),/common external site/);
  assert.match(d.stateChecks.join(' '),/do not apply 1%-slope open-channel Manning/);
  assert.match(d.decision,/RWT-06 remains planned/);
});

test('source drift and fictitious terminal alignment cannot silently become an accepted result',()=>{
  const src=structuredClone(readInputs());
  src.envelope.model.terminals.normal.endY+=100;
  assert.throws(()=>compareTerminalReception(src),/expected|equal|13200/);
  const other=structuredClone(readInputs());
  other.envelope.model.terminals.relief.receiver.bounds[1]=13550;
  assert.throws(()=>compareTerminalReception(other),/outlet\/receiver plan alignment changed/);
  const common=structuredClone(readInputs());
  common.envelope.model.terminals.normal.receiver.bounds[0]=6100;
  assert.throws(()=>compareTerminalReception(common));
});
