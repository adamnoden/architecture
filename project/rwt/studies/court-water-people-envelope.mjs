/**
 * RWT-06: a source-linked corridor *width* incompatibility and a conditional
 * roof/topology rewind. Does not qualify people, drainage, barriers, structure,
 * access, hydraulic performance, first harm or selected ROF/HAD/MAT sources.
 */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readInputs, uniformDepth, idealCrestJoinSeparationMm } from './open-loggia-event.mjs';
import { compareSurfaceApron } from './court-surface-apron.mjs';
import { compareOutwardOnlyRoof } from './outward-court-load.mjs';

export function compareCourtWaterAndPeople(source=readInputs()){
  // Both earlier studies insist upon the identical pinned selected HAD/MAT blobs.
  const apron=compareSurfaceApron(source);
  const roof=compareOutwardOnlyRoof(source);
  const h=source.house.model,m=source.envelope.model;
  const throatMm=h.loggia.clear[2],courtGrossMm=h.court[2];
  const normalGrossMm=apron.selected.normalGross[2];
  const selectedReliefMm=apron.selected.reliefGrossWidthMm;
  const existingSeparatorMm=apron.selected.normalToReliefGapMm;
  const dryGrossTrialMm=1200; // Design enquiry, NOT Approved Document guidance or usable clear.
  const secondWetDrySeparatorMm=75; // New gross reservation, NOT a rated barrier.
  const selectedTripleDemandMm=
    normalGrossMm+existingSeparatorMm+selectedReliefMm+secondWetDrySeparatorMm+dryGrossTrialMm;
  const originalPortalFinishLossMm=
    h.insulatedPortal.rawSpan-h.insulatedPortal.finishedWidthAtVerticalJambs;
  assert.equal(h.insulatedPortal.finishedWidthAtVerticalJambs,throatMm);
  assert.deepEqual(apron.selected.dryStripsGrossMm,[25,75,100]);
  assert.equal(throatMm,2400);
  assert.equal(courtGrossMm,3500);
  assert.equal(normalGrossMm,400);
  assert.equal(selectedReliefMm,1800);
  assert.equal(existingSeparatorMm,75);
  assert.equal(originalPortalFinishLossMm,560);
  assert.equal(m.protectedWater.relief.minimumClearWidth,selectedReliefMm);
  assert.equal(m.protectedWater.relief.slope,.01);
  assert.equal(m.threshold.mineralDpc.inner[1],-30);
  const reducedReliefTrialMm=600; // Future hypothetical full-length route, NOT the current 600 chute.
  const reducedDemandMm=
    normalGrossMm+existingSeparatorMm+reducedReliefTrialMm+secondWetDrySeparatorMm+dryGrossTrialMm;
  const modestDryGrossTrialMm=900;
  const reducedWithModestDryMm=reducedDemandMm-dryGrossTrialMm+modestDryGrossTrialMm;
  const selected216=roof.events.find(e=>e.intensityMmPerHour===216);
  assert(selected216);
  const levels={
    mouthMm:h.sections.waterLevels.courtNorth,
    unqualifiedFirstHarmMm:m.threshold.mineralDpc.inner[1],
    hypotheticalDebrisDamMm:60,
    reducedClearWidthMm:reducedReliefTrialMm
  };
  const reliefCrestMm=levels.mouthMm+levels.hypotheticalDebrisDamMm;
  const idealAt600=(q)=>({
    litresPerSecond:q,
    idealUniformDepthOnOnePercentMm:uniformDepth(
      q/1000,reducedReliefTrialMm/1000,m.protectedWater.relief.roughnessStress,m.protectedWater.relief.slope),
    idealSeparationToUnqualifiedJoinWith60MmDamMm:idealCrestJoinSeparationMm({
      flowLitresPerSecond:q,clearWidthMm:reducedReliefTrialMm,
      crestMm:reliefCrestMm,vulnerableJoinMm:levels.unqualifiedFirstHarmMm
    })
  });
  const currentStress=idealAt600(selected216.currentCourtLitresPerSecond);
  const outwardStress=idealAt600(selected216.outwardCourtLitresPerSecond);
  return {
    authority:'Pre-site width and ideal flow counterexample only. Current HAD-B 2400 throat and 1800 relief remain selected; neither smaller relief nor outward-only roof, dry escape, first harm or new opening are admitted.',
    inputBlobs:{had:source.house.blob,mat:source.envelope.blob},
    selected:{
      throatMm,courtGrossMm,originalRoughPortalMm:h.insulatedPortal.rawSpan,
      finishedPortalMm:h.insulatedPortal.finishedWidthAtVerticalJambs,
      originalPortalFinishLossMm,normalGrossMm,existingSeparatorMm,selectedReliefMm,
      originalGrossDryStripsMm:apron.selected.dryStripsGrossMm,
      actualLargestUnusedEdgeGrossMm:apron.selected.maxSingleGrossDryStripMm
    },
    simultaneousTrial:{
      description:'Current normal and full 1800 relief, plus a NEW 75 gross wet/dry separator and a 1200 gross pedestrian reservation.',
      dryGrossTrialMm,secondWetDrySeparatorMm,
      requiredFinishedThroatMm:selectedTripleDemandMm,
      exceedsSelectedThroatMm:selectedTripleDemandMm-throatMm,
      exceedsEntireCourtGrossMm:selectedTripleDemandMm-courtGrossMm,
      nominalRoughPortalIfOld560FinishLossContinuedMm:selectedTripleDemandMm+originalPortalFinishLossMm,
      nominalRoughPortalOverCourtGrossMm:selectedTripleDemandMm+originalPortalFinishLossMm-courtGrossMm,
      noFitWithinSelectedHouse:true
    },
    outwardRoofOnlyTrial:{
      description:'Only if a NEW outward-draining roof removes routine inner-roof inflow: compare a genuinely 600 gross full-length relief with the 400 gross normal and 1200 gross separate walking lane.',
      notPresentSource:'The selected 600 mm relief CHUTE is a terminal contraction, not a 600 mm full-length relief or an admission.',
      futureReliefGrossMm:reducedReliefTrialMm,
      requiredFinishedThroatMm:reducedDemandMm,
      remainingUnallocatedGrossMm:throatMm-reducedDemandMm,
      with900GrossDryTrial:{
        dryGrossMm:modestDryGrossTrialMm,
        requiredFinishedThroatMm:reducedWithModestDryMm,
        remainingUnallocatedGrossMm:throatMm-reducedWithModestDryMm
      },
      divertedRoofCatchmentM2:roof.wallLineProjectionM2.roofShiftToExterior,
      displacedRoofLoadToExteriorLitresPerSecondAt216:selected216.outerIncreaseLitresPerSecond,
      courtLoadBeforeAndAfter: {
        current:currentStress,
        outwardOnlyCounterfactual:outwardStress
      },
      sourceRoofStillInward:true,
      positiveIdealHeadNotWaterSafety:true
    },
    hardFaults:[
      'The 1200 dry band is GROSS, not finished usable clear; a 75 separator is no tested upstand, barrier, waterproof seam or edge support. The 50 mm remainder in the 600-width future option has no load/guard/weather tolerance.',
      'The selected 1800-wide surface cannot be replaced by a 600-wide full-length channel merely because the terminal chute is 600. The current inward roof full-failure 216 mm/h check already has negative ideal separation to the unqualified -30 join with 60 mm dam.',
      'The roof direction is selected inward. Removing 47.8125 m2 of roof inflow requires new roof geometry, higher court rim, exterior collectors, structural loads and adjacent first-harm reproof; an intact collector cannot be assumed in its failure state.',
      'A dry lane physically beside a route does not survive common north-mouth obstruction, high tailwater, local splashing, overtopping or floor/joint failure without a separately admitted all-state section.',
      'A 3550 finished throat is wider than the full 3500 courtyard gross width BEFORE piers, arches, wall insulation, weathering and handling; retaining the old 560 finish subtraction would require a 4110 rough portal. The building must be recomposed if that trial is required.'
    ],
    decision:'Reject adding an independent 1200 gross dry lane beside BOTH selected water routes in HAD-B. Test outward-only roof plus smaller full-length relief as ONE linked ROF/HAD/STR/MAT/RWT architectural rewrite; its 50 mm leftover and unqualified first harm mean it is a constrained challenger, not an adoptable fix. RWT-06 remains planned.'
  };
}
if (process.argv[1]===fileURLToPath(import.meta.url)){
  const a=compareCourtWaterAndPeople();
  console.log(JSON.stringify({selected:a.selected,simultaneousTrial:a.simultaneousTrial,
    outwardRoofOnlyTrial:a.outwardRoofOnlyTrial,decision:a.decision},null,2));
}
