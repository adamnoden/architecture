/**
 * RWT-06: a conditional broad, accessible court-to-garden surface fall.
 *
 * This deliberately removes the *proposed* concealed/covered normal carrier,
 * its parallel relief reservation, and both steep terminal bodies in a
 * comparison, not in HAD/MAT's selected house. The actual site is unknown.
 * No shallow-channel computation proves jet capture, blockage safety, a dry
 * pedestrian escape, physical water boundaries, or lawful site disposal.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs,build,uniformDepth,idealCrestSpecificEnergyMm} from './open-loggia-event.mjs';
import {compareTerminalReception} from './court-terminal-reception.mjs';

export function compareOpenSurfaceRoute(source=readInputs()){
 const h=source.house.model,m=source.envelope.model;
 const selected=build(source),terminal=compareTerminalReception(source);
 assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
 assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]);
 assert.equal(h.sections.waterLevels.courtNorth,-110);
 assert.equal(h.sections.waterLevels.loggiaNorth,-152.5);
 assert.equal(m.outdoor.gardenTerrace,h.sections.waterLevels.loggiaNorth);
 assert.equal(m.threshold.mineralDpc.inner[1],-30);
 assert.equal(m.protectedWater.relief.minimumClearWidth,1800);
 assert.equal(m.protectedWater.relief.slope,.01);
 assert.equal(m.terminals.guardNorthY,13200);
 const [x,y,widthMm,runMm]=h.loggia.clear;
 const courtMouthMm=h.sections.waterLevels.courtNorth;
 const outerBoundaryMm=h.sections.waterLevels.loggiaNorth;
 const actualNominalFallMm=courtMouthMm-outerBoundaryMm;
 const sourceSlope=actualNominalFallMm/runMm;
 assert(Math.abs(sourceSlope-.01)<1e-12);
 const lastSelectedExteriorDatumYmm=m.terminals.guardNorthY;
 const continuationRunMm=lastSelectedExteriorDatumYmm-(y+runMm);
 assert.equal(continuationRunMm,1200);
 const hypotheticalContinuationLevelMm=outerBoundaryMm-sourceSlope*continuationRunMm;
 const unqualifiedFirstHarmMm=m.threshold.mineralDpc.inner[1];
 const nominalReceiverWaterMm=m.terminals.normal.receiver.nominalWaterPlane;
 const missedTerritories={
  normal:terminal.geometry.normal.gapBeforeReceiverSouthEdgeMm,
  relief:terminal.geometry.relief.gapBeforeReceiverSouthEdgeMm
 };
 const events=[72,144,216].map(intensityMmPerHour=>{
  const areaM2={
   selectedInwardRoofFailure: selected.catchment.combinedM2,
   futureOutwardOnlyIntact: selected.catchment.wallLineCourtM2
  };
  const cases=Object.fromEntries(Object.entries(areaM2).map(([name,area])=>{
   const q=intensityMmPerHour*area/3600;
   const uniformMm=uniformDepth(q/1000,widthMm/1000,m.protectedWater.relief.roughnessStress,sourceSlope);
   const idealEnergyMm=idealCrestSpecificEnergyMm(q,widthMm);
   return [name,{
    catchmentM2:area,litresPerSecond:q,
    fullWidthUniformDepthMm:uniformMm,
    idealUnblockedMouthSurfaceMm:courtMouthMm+uniformMm,
    idealCrestEnergyMm:idealEnergyMm,
    idealSeparationToUnqualifiedFirstHarmAt60MmDamMm:
      unqualifiedFirstHarmMm-(courtMouthMm+60+idealEnergyMm),
    idealSeparationToUnqualifiedFirstHarmAt70MmDamMm:
      unqualifiedFirstHarmMm-(courtMouthMm+70+idealEnergyMm)
   }];
  }));
  return {intensityMmPerHour,cases};
 });
 const fullStress=events[2].cases.selectedInwardRoofFailure;
 const narrowedEnergyMm=idealCrestSpecificEnergyMm(fullStress.litresPerSecond,600);
 const narrowed60DamJoinSeparationMm=unqualifiedFirstHarmMm-
  (courtMouthMm+60+narrowedEnergyMm);
 return {
  authority:'Unadopted architectural alternative, not a hydraulic design, suitable site, safe first-harm level, dual-purpose walkway or emergency independence.',
  source:{had:source.house.blob,mat:source.envelope.blob},
  selected:{
   footprint:[x,y,widthMm,runMm],
   courtMouthMm,outerBoundaryMm,runMm,nominalFallMm:actualNominalFallMm,
   slope:sourceSlope,firstHarmComparatorMm:unqualifiedFirstHarmMm,
   selectedNormalCarrierGrossMm:h.outdoorWaterTerritories.normalGross[2],
   selectedBroadReliefMm:m.protectedWater.relief.minimumClearWidth,
   selectedTerminalChuteWidthMm:m.terminals.relief.visibleChute.width,
   existingTerminalPlanGapsMm:missedTerritories
  },
  challenger:{
   arrangement:'One continuously visible and accessible-in-normal-conditions sloping outdoor surface, rather than separate buried/covered carrier, shallow relief trough and steep chute. Actual supporting/weathering/occupation and site section must be redesigned.',
   hypotheticalFullWidthMm:widthMm,
   hypotheticalContinuationToGuardYmm:lastSelectedExteriorDatumYmm,
   additionalOutsideHouseRunMm:continuationRunMm,
   hypotheticalContinuationEndMm:hypotheticalContinuationLevelMm,
   unchangedAuthoredReceiverWaterMm:nominalReceiverWaterMm,
   elevationDiscontinuityToUnverifiedWaterMm:hypotheticalContinuationLevelMm-nominalReceiverWaterMm,
   remainingRequirements:[
    'Construct a full-width outdoor water-and-pedestrian floor from court to garden without a trapping threshold or vulnerable pan/masonry join. Do not treat a nominal walking surface as a dry flood escape.',
    'Design all upstream intake/turn and downstream continuing ground slope, real site flood backwater, harmless overflow, surface wear/traction, support and accessible cleaning.',
    'No full-width north passage survives a blanket across its complete mouth or shared north garden flooding. No N+1 or independent site-receiver claim follows.',
    'A new ROF/HAD source must decide whether roof runoff reaches the court; until then retain the full 60.0625 m2 stress. High-eave maintenance remains unresolved on the selected inward roof.',
    'If the real site does not admit a continuously lower, lawful surface receiving landscape and safe first-harm limits, reject this design rather than burying a pump or retrofitting a concealed low pipe.'
   ]
  },
  events,
  adverse:{
   at216mmhFullRoofFailure:fullStress,
   lostWidthControlMm:600,
   narrowed60DamJoinSeparationMm,
   highCommonReceivingWaterAtUnqualifiedJoinMm:unqualifiedFirstHarmMm,
   commonReceivingFloodStillFails:true,
   fullMouthDamStillFails:true,
   realInletCapacityUnproved:true,
   noSafeDetentionOrResponseTimeCredited:true
  },
  decision:'The full-width open surface is a simpler architectural family worthy of one HAD/STR/DPL joined comparison, not a selected fix. Neither the 400/1800 split nor two steep terminal objects are necessary to describe a possible gravity path, but failure escape and actual site descent remain unproved. RWT-06 stays planned.'
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const v=compareOpenSurfaceRoute();
 console.log(JSON.stringify({
  selected:v.selected,challenger:v.challenger,
  fullStress:v.events[2],adverse:v.adverse,decision:v.decision
 },null,2));
}
