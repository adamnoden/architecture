/**
 * RWT-06: compare an uncontracted surface relief apron against the selected
 * 600 mm steep chute at the existing north termination.
 *
 * Pre-site, source-bound *negative* design screen. It does not determine
 * outlet capacity, pedestrian safety, site levels, structure or hydraulic head.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs,uniformDepth} from './open-loggia-event.mjs';
import {compareTerminalReception} from './court-terminal-reception.mjs';

const right=r=>r[0]+r[2];
export function compareSurfaceApron(source=readInputs()){
 const house=source.house.model,mat=source.envelope.model;
 const terminal=compareTerminalReception(source);
 const loggia=house.loggia.clear,normal=house.outdoorWaterTerritories.normalGross,
  relief=house.outdoorWaterTerritories.relief;
 assert.deepEqual(loggia,[4800,7750,2400,4250]);
 assert.deepEqual(normal,[4825,7750,400,4250]);
 assert.deepEqual(relief,[5300,7750,1800,4250]);
 assert(normal[0]>=loggia[0]&&right(normal)<relief[0]&&right(relief)<=right(loggia));
 assert.equal(mat.terminals.guardNorthY,13200);
 assert.equal(mat.terminals.relief.endY,mat.terminals.guardNorthY);
 assert.equal(mat.terminals.relief.crest,mat.outdoor.gardenTerrace);
 assert.equal(mat.terminals.relief.visibleChute.width,600);
 assert.equal(mat.terminals.relief.x[1]-mat.terminals.relief.x[0],600);

 // These are plan gaps, not approved walking or passage widths. Each open
 // water route runs to the north edge in the selected ground/terminal scheme.
 const dryStripsGrossMm=[
  normal[0]-loggia[0],
  relief[0]-right(normal),
  right(loggia)-right(relief)
 ];
 const receiver=mat.terminals.relief.receiver.bounds;
 const overlapTargetMm=terminal.geometry.receiving.candidateChanges.authoredBufferMm;
 const targetLipYmm=receiver[1]+overlapTargetMm;
 const runFromGuardMm=targetLipYmm-mat.terminals.guardNorthY;
 const extraBeyondSelectedChuteMm=targetLipYmm-terminal.geometry.relief.maximumNorthLipYmm;
 assert(runFromGuardMm>0&&extraBeyondSelectedChuteMm>0);
 const illustrativeApronSlope=.01;
 const illustrativeEndLevelMm=mat.terminals.relief.crest-runFromGuardMm*illustrativeApronSlope;
 const proposedReceiverWaterLevelMm=mat.terminals.relief.receiver.nominalWaterPlane;
 const fallFromApronToAuthoredWaterMm=illustrativeEndLevelMm-proposedReceiverWaterLevelMm;
 const stress=terminal.events.find(e=>e.intensityMmPerHour===216);
 assert(stress);
 const q=stress.fullRoofAndCourtLitresPerSecond;
 const roughness=mat.protectedWater.relief.roughnessStress;
 const fullWidthIdealDepthMm=uniformDepth(q/1000,relief[2]/1000,roughness,illustrativeApronSlope);
 const pinchedWidthMm=mat.terminals.relief.visibleChute.width;
 const pinchedIdealDepthMm=uniformDepth(q/1000,pinchedWidthMm/1000,roughness,illustrativeApronSlope);

 return {
  authority:'RWT-06 hypothetical uncontracted surface-apron comparison only. No roof, channel, dry passage, impact receiver, site grade, flood independence or water-head acceptance.',
  inputBlobs:{had:source.house.blob,mat:source.envelope.blob},
  selected:{
   loggiaGross:loggia,normalGross:normal,reliefGross:relief,
   dryStripsGrossMm,maxSingleGrossDryStripMm:Math.max(...dryStripsGrossMm),
   loggiaGrossWidthMm:loggia[2],
   normalGrossWidthMm:normal[2],normalToReliefGapMm:relief[0]-right(normal),
   reliefGrossWidthMm:relief[2],chuteGrossWidthMm:pinchedWidthMm,
   widthReductionMm:relief[2]-pinchedWidthMm,
   receiverFrontYmm:receiver[1],chuteBestCaseLipYmm:terminal.geometry.relief.maximumNorthLipYmm,
   selectedChuteDropMm:terminal.geometry.relief.authoredChuteVerticalDropMm
  },
  hypothetical:{
   fullReliefWidthMm:relief[2],runFromGuardMm,
   nominalLandingOverlapMm:overlapTargetMm,
   targetLipYmm,extraBeyondSelectedChuteMm,
   footprintGrossM2:relief[2]*runFromGuardMm/1e6,
   assumedSurfaceSlope:illustrativeApronSlope,
   startLevelMm:mat.terminals.relief.crest,
   endLevelMm:illustrativeEndLevelMm,
   authoredReceiverWaterLevelMm:proposedReceiverWaterLevelMm,
   terminalDropToAuthoredReceiverWaterMm:fallFromApronToAuthoredWaterMm,
   widthAndDryPathConflict:true,
   retainedNormalTerminalPlanGapMm:terminal.geometry.normal.gapBeforeReceiverSouthEdgeMm,
   status:'Comparison only: neither a sourced apron support nor a safe dry passage, site water level, terminal impact and overflow geometry is selected.'
  },
  flowComparison:{
   intensityMmPerHour:216,fullDutyLitresPerSecond:q,
   idealConstantOnePercentWideDepthMm:fullWidthIdealDepthMm,
   idealConstantOnePercentPinchedDepthMm:pinchedIdealDepthMm,
   scope:'For identical ideal 1% shallow rectangular channels, 600 mm pinching increases uniform depth. This is NOT a chute capacity: the actual chute drops 447.5 mm in 350 mm, with contraction, free jet, impact and backwater unmodelled.'
  },
  dispositions:[
   'A full-width open 1800 mm relief apron to the authored receiver with 300 mm trial overlap needs 750 mm plan run beyond guard y13200; it offers at most 100 mm gross contiguous side refuge inside the 2400 mm loggia alongside the normal route. It is not a dry pedestrian/maintenance escape.',
   'The 600 mm chute conserves a potential larger dry strip but contracts the upstream 1800 mm relief. Its steep 447.5/350 drop and receiver plan miss require a real inlet/turn/jet/impact/fault proof, not 1% Manning extrapolation.',
   'The 1% apron trial reaches z=-160 mm at y13950. Retaining the authored -800 receiver-water plane then leaves 640 mm vertical travel at the edge; a shallow surface continuation does NOT join that water plane or prove harmless impact.',
   'A regraded surface landscape alternative would require a DIFFERENT ground/receiver source, separate supported walking and maintenance passage, real site flood level and an explicit structural/weathering transition.',
   'Normal copper terminal still misses its own receiver in plan; neither apron alternative resolves whole north mouth blockage or common exterior tailwater. RWT-06 remains planned.'
  ]
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const d=compareSurfaceApron();
 console.log(JSON.stringify({selected:d.selected,hypothetical:d.hypothetical,flow:d.flowComparison},null,2));
}
