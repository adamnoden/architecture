/**
 * RWT-06 selected HAD-B / MAT terminal receiving section.
 *
 * A narrow source-bound topology and elevation audit. No water trajectory,
 * capture capacity, jet velocity, subcritical backwater, weather, site rights
 * or operating acceptance can be inferred from these rectangles and levels.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs,uniformDepth} from './open-loggia-event.mjs';

const inside=(x,[left,_y,width])=>x>=left&&x<=left+width;
const right=(rect)=>rect[0]+rect[2];
const front=(rect)=>rect[1];
const back=(rect)=>rect[1]+rect[3];

export function compareTerminalReception(source=readInputs()) {
  const house=source.house.model,mat=source.envelope.model;
  const water=mat.protectedWater,term=mat.terminals;
  assert.equal(house.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
  assert.deepEqual(house.court,[4250,4250,3500,3500]);
  assert.deepEqual(house.outdoorWaterTerritories.relief,[5300,7750,1800,4250]);
  assert.equal(water.normal.channelClear,250);
  assert.equal(water.normal.flowSlope,.01);
  assert.equal(water.relief.minimumClearWidth,1800);
  assert.equal(mat.outdoor.gardenTerrace,-152.5);
  assert.equal(mat.threshold.mineralDpc.inner[1],-30);
  assert.match(mat.threshold.lowestJunction.position,/−30/);
  assert.equal(term.guardNorthY,13200);
  assert.equal(term.normal.coveredExtension,350);
  assert.equal(term.normal.endY,term.guardNorthY+term.normal.coveredExtension);
  assert.equal(term.relief.endY,term.guardNorthY);
  assert.equal(term.relief.visibleChute.run,350);
  assert.equal(term.relief.crest,mat.outdoor.gardenTerrace);
  assert.equal(water.normal.carrierBottom.at(-1)[0],term.guardNorthY);
  const last=water.normal.carrierBottom.at(-1)[1];
  assert(Math.abs(term.normal.invert-(last-term.normal.coveredExtension*water.normal.flowSlope))<1e-9);
  const normalReceiver=term.normal.receiver.bounds;
  const reliefReceiver=term.relief.receiver.bounds;
  const normalDischargeY=term.normal.endY;
  // The chute's run has no specified vector; even spending ALL its stated
  // length northward is the most favourable possible endpoint ordinate.
  const reliefMaxNorthDischargeY=term.relief.endY+term.relief.visibleChute.run;
  const normalPlanGap=front(normalReceiver)-normalDischargeY;
  const reliefPlanGap=front(reliefReceiver)-reliefMaxNorthDischargeY;
  assert(inside(term.normal.centreX,normalReceiver));
  assert(inside(term.relief.x[0],reliefReceiver));
  assert(inside(term.relief.x[1],reliefReceiver));
  assert(right(normalReceiver)<reliefReceiver[0],'receivers now overlap in plan');
  assert(normalPlanGap>0&&reliefPlanGap>0,'outlet/receiver plan alignment changed: reassess');
  const nominalOutlet=term.normal.closedDownroute.outlet;
  assert.equal(nominalOutlet,term.relief.visibleChute.outlet);
  assert.equal(term.normal.receiver.nominalWaterPlane,term.relief.receiver.nominalWaterPlane);
  const proposedReceiverWater=term.normal.receiver.nominalWaterPlane;
  const verticalAirGap=nominalOutlet-proposedReceiverWater;
  assert.equal(verticalAirGap,term.normal.receiver.airgap);
  assert.equal(verticalAirGap,term.relief.receiver.airgap);
  const guardToReceiverFrontMm=front(normalReceiver)-term.guardNorthY;
  const westEastReceiverSeparationMm=reliefReceiver[0]-right(normalReceiver);
  const proposedBufferMm=300; // explicit trial, NOT a capture design allowance
  const receivingOptions={
    authoredBufferMm:proposedBufferMm,
    normalAdditionalNorthReachMm:normalPlanGap+proposedBufferMm,
    reliefAdditionalNorthReachMm:reliefPlanGap+proposedBufferMm,
    normalReceiverSouthwardShiftMm:normalPlanGap+proposedBufferMm,
    reliefReceiverSouthwardShiftMm:reliefPlanGap+proposedBufferMm,
    movedReceiverFrontYmm:front(normalReceiver)-(normalPlanGap+proposedBufferMm),
    movedReceiverGapNorthOfGuardMm:guardToReceiverFrontMm-(normalPlanGap+proposedBufferMm),
    status:'Alternative relocation or extension envelopes ONLY. No approved lip, collector, spill spread, receiver or movement/structural capacity.'
  };
  const wallLineM2=60.0625;
  const courtOnlyM2=house.court[2]*house.court[3]/1e6;
  const normalBottomAtMouth=water.normal.carrierBottom.find(([y])=>y===7750)?.[1];
  assert(Number.isFinite(normalBottomAtMouth));
  const reliefFloorAtMouth=mat.outdoor.courtWalking[2];
  assert.equal(reliefFloorAtMouth,house.sections.waterLevels.courtNorth);
  const firstHarmComparator=mat.threshold.mineralDpc.inner[1];
  const primaryWallHeight=house.outdoorWaterTerritories.normalLiner.insideWallHeight;
  const events=[72,144,216].map(intensity=>{
    const fullQ=intensity*wallLineM2/3600;
    const courtOnlyQ=intensity*courtOnlyM2/3600;
    const normalDepth=uniformDepth(fullQ/1000,water.normal.channelClear/1000,
      water.normal.roughnessStress,water.normal.flowSlope);
    const reliefDepth=uniformDepth(fullQ/1000,water.relief.minimumClearWidth/1000,
      water.relief.roughnessStress,water.relief.slope);
    return {
      intensityMmPerHour:intensity,
      fullRoofAndCourtLitresPerSecond:fullQ,
      courtRainAloneLitresPerSecond:courtOnlyQ,
      normalFullDutyUniformDepthMm:normalDepth,
      normalMouthIdealSurfaceLevelMm:normalBottomAtMouth+normalDepth,
      normalMouthNominalWallHeadLeftMm:primaryWallHeight-normalDepth,
      reliefFullDutyUniformDepthMm:reliefDepth,
      reliefMouthIdealSurfaceLevelMm:reliefFloorAtMouth+reliefDepth,
      reliefMouthIdealSeparationToUnqualifiedPanJoinMm:
        firstHarmComparator-(reliefFloorAtMouth+reliefDepth)
    };
  });
  const noInitialVerticalVelocityFallSeconds=Math.sqrt(2*(verticalAirGap/1000)/9.81);
  return {
    authority:'RWT-06 source-bound elevation and plan-negative audit only. No accepted hydraulic discharge, wetting safety, site drainage or receiver capture.',
    inputs:{had:{path:source.house.path,blob:source.house.blob},
      mat:{path:source.envelope.path,blob:source.envelope.blob}},
    geometry:{
      guardNorthYmm:term.guardNorthY,
      normal:{centreXmm:term.normal.centreX,lipYmm:normalDischargeY,
        invertAtLipMm:term.normal.invert,
        closedDownrouteClearMm:term.normal.closedDownroute.clear,
        outletLevelMm:nominalOutlet,receiver:normalReceiver,
        gapBeforeReceiverSouthEdgeMm:normalPlanGap},
      relief:{mouthWidthMm:water.relief.minimumClearWidth,crestMm:term.relief.crest,
        chuteStartYmm:term.relief.endY,chuteRunMm:term.relief.visibleChute.run,
        maximumNorthLipYmm:reliefMaxNorthDischargeY,
        authoredChuteVerticalDropMm:term.relief.crest-term.relief.visibleChute.outlet,
        impliedVerticalDropPerRun: (term.relief.crest-term.relief.visibleChute.outlet)/term.relief.visibleChute.run,
        outletLevelMm:term.relief.visibleChute.outlet,
        receiver:reliefReceiver,gapBeforeReceiverSouthEdgeMm:reliefPlanGap},
      receiving:{
        nominalWaterPlaneMm:proposedReceiverWater,nominalOutletLevelMm:nominalOutlet,
        nominalVerticalAirGapMm:verticalAirGap,
        receiverPlanSeparationMm:westEastReceiverSeparationMm,
        guardToReceiverFrontMm:guardToReceiverFrontMm,
        zeroOutwardTravelHasNoPlanReceivingOverlap:true,
        bestCaseNorthwardChuteStillMissesReceiver:true,
        unsupportedIdealBallistic:{
          assumedFallMm:verticalAirGap,
          zeroInitialVerticalVelocityFallSeconds:noInitialVerticalVelocityFallSeconds,
          theoreticalMinimumNorthwardVelocityFor100mmMs:(normalPlanGap/1000)/noInitialVerticalVelocityFallSeconds,
          scope:'Vacuum point trajectory from horizontal, zero vertical exit speed. NOT a measured launch, wind, splash, flow distribution, landing or safety rule.'
        },
        candidateChanges:receivingOptions
      }
    },
    levelLedger:{
      selectedCourtMouthFloorMm:reliefFloorAtMouth,
      unqualifiedPanDpcComparatorMm:firstHarmComparator,
      normalMouthInvertMm:normalBottomAtMouth,
      normalMouthLipMm:normalBottomAtMouth+primaryWallHeight,
      terraceDatumMm:mat.outdoor.gardenTerrace,
      outletLevelMm:nominalOutlet,
      waterLevelAtBothUnverifiedReceiversMm:proposedReceiverWater
    },
    events,
    stateChecks:[
      'At nominal -800 water planes, both -600 outlets have 200 mm vertical air gap, but neither authored lip has a vertical plan projection within its named receiver. Capture and first wetting have not been demonstrated.',
      'At a receiving plane of -600, the nominal open outlet air gap is zero; backwater, splash and possible coupling need a real joined terminal and independent route analysis.',
      'Both named rectangles are disjoint in plan, but their equal authored -800 water planes and common external site do NOT prove independent flood, infiltration or lawful outfalls.',
      'Nominal uniform-flow water levels are section probes only. Actual roof jets, court inlet, open-to-closed copper transition, severe chute slope, head losses, overflow and first leakage are unqualified.',
      'The visible chute falls 447.5 mm over 350 mm of plan run; do not apply 1%-slope open-channel Manning capacity to that rapid chute or its impact receiver.',
      'Retain the only selected north loggia as a single whole-mouth cut. A second grating, or an outward roof, cannot conjure a second through-ring surface escape.'
    ],
    decision:'Require a continuous, supported, deliberately located outlet-to-receiver landing and affected first-harm section for both N/W and E before the nominal 200 mm air gap or two exits can be credited. RWT-06 remains planned.'
  };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const d=compareTerminalReception();
 console.log(JSON.stringify({normalGap:d.geometry.normal.gapBeforeReceiverSouthEdgeMm,
  reliefGap:d.geometry.relief.gapBeforeReceiverSouthEdgeMm,
  nominalAir:d.geometry.receiving.nominalVerticalAirGapMm,
  fullStress:d.events.at(-1),verdict:d.decision},null,2));
}
