import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs,idealCrestSpecificEnergyMm} from './open-loggia-event.mjs';

// RWT-06 counterfactual against the selected HAD-B court and the ROF-07
// outward-only pitched-ring family. NO roof source or network is selected.
const toRadians=degrees=>degrees*Math.PI/180;
export function compareOutwardOnlyRoof(inputs=readInputs()){
 const h=inputs.house.model;
 assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
 assert.deepEqual(h.court,[4250,4250,3500,3500]);
 assert.equal(h.shell,12000);
 assert.equal(h.exterior.eaves,7100);
 assert.equal(h.exterior.overhang,200);
 assert.equal(h.outdoorWaterTerritories.relief[2],1800);
 const wing=(h.shell-h.court[2])/2;
 const ridgeInset=wing/2;
 const historicPitchDeg=25;
 assert(Math.abs(h.exterior.ridge-(h.exterior.eaves+ridgeInset*Math.tan(toRadians(historicPitchDeg))))<1e-6,
  'Selected roof datum changed; re-evaluate outward-only geometry');
 const areaM2=mm2=>mm2/1e6;
 const courtM2=areaM2(h.court[2]*h.court[3]);
 const ringM2=areaM2(h.shell**2-h.court[2]*h.court[3]);
 const outerM2=areaM2(h.shell**2-(h.shell-2*ridgeInset)**2);
 const innerM2=ringM2-outerM2;
 const currentCourtM2=innerM2+courtM2;
 const outwardCourtM2=courtM2;
 const outwardOuterM2=ringM2;
 const limitDeg=Math.atan((h.exterior.ridge-h.exterior.eaves)/wing)*180/Math.PI;
 const slopes=[5,8,12,15,25].map(pitchDeg=>({
  pitchDeg,
  courtHighEdgeMm:h.exterior.eaves+wing*Math.tan(toRadians(pitchDeg)),
  riseAboveSelectedCourtEaveMm:wing*Math.tan(toRadians(pitchDeg)),
  changeFromSelectedRidgeMm:h.exterior.eaves+wing*Math.tan(toRadians(pitchDeg))-h.exterior.ridge
 }));
 const selectedMouthMm=-110,unqualifiedPanJoinMm=-30;
 const damHeightMm=60,remainingClearWidthMm=600;
 const events=[72,144,216].map(intensityMmPerHour=>{
  const q=area=>intensityMmPerHour*area/3600;
  const currentCourtLitresPerSecond=q(currentCourtM2);
  const outwardCourtLitresPerSecond=q(outwardCourtM2);
  const currentExteriorLitresPerSecond=q(outerM2);
  const outwardExteriorLitresPerSecond=q(outwardOuterM2);
  const idealStage=flow=>selectedMouthMm+damHeightMm+
   idealCrestSpecificEnergyMm(flow,remainingClearWidthMm);
  return {intensityMmPerHour,
   currentCourtLitresPerSecond,outwardCourtLitresPerSecond,
   currentExteriorLitresPerSecond,outwardExteriorLitresPerSecond,
   courtReductionLitresPerSecond:currentCourtLitresPerSecond-outwardCourtLitresPerSecond,
   outerIncreaseLitresPerSecond:outwardExteriorLitresPerSecond-currentExteriorLitresPerSecond,
   currentCourtTenMinuteLitres:currentCourtLitresPerSecond*600,
   outwardCourtTenMinuteLitres:outwardCourtLitresPerSecond*600,
   idealCompoundObstruction:{
    damHeightMm,remainingClearWidthMm,
    currentStageMm:idealStage(currentCourtLitresPerSecond),
    outwardStageMm:idealStage(outwardCourtLitresPerSecond),
    currentSeparationFromUnqualifiedPanJoinMm:unqualifiedPanJoinMm-idealStage(currentCourtLitresPerSecond),
    outwardSeparationFromUnqualifiedPanJoinMm:unqualifiedPanJoinMm-idealStage(outwardCourtLitresPerSecond)
   }
  };
 });
 assert(Math.abs(currentCourtM2+outerM2-(courtM2+ringM2))<1e-10);
 return {
  authority:'Architectural rainfall/load and edge-height sensitivity ONLY. This is a counterfactual ROF-07 family, not selected HAD roof geometry, hydraulic acceptance, site drainage or a safe first-harm level.',
  source:{selectedHAD:inputs.house.path,selectedHADBlob:inputs.house.blob,selectedMAT:inputs.envelope.path,selectedMATBlob:inputs.envelope.blob,
   roofFamily:'ROF-07 outward-only pitched-ring comparison; no ROF/HAD source change'},
  geometry:{shellMm:h.shell,courtSideMm:h.court[2],wingMm:wing,baselineOuterEaveMm:h.exterior.eaves,
   currentRidgeMm:h.exterior.ridge,selectedCourtEaveMm:h.exterior.eaves,baselinePitchDeg:historicPitchDeg,
   maxOutwardPitchToNotExceedCurrentRidgeDeg:limitDeg,
   everyPositiveOutwardPitchRaisesCourtEdge:true,
   slopes},
  wallLineProjectionM2:{innerRoof:innerM2,outerRoof:outerM2,court:courtM2,
   currentRoofToCourtPlusDirect:currentCourtM2,
   outwardRoofToCourtPlusDirect:outwardCourtM2,
   outwardRoofToExterior:outwardOuterM2,
   roofShiftToExterior:innerM2,
   note:'Wall-line vertical-rain, runoff coefficient one; not pitch/wind-adjusted or a selected hydraulic event. Consistent 200 mm inner overhang reduces exposed courtyard to 9.61 m2 but cannot be mixed with wall-line outer loads.'},
  jointComparison:{selectedMouthMm,unqualifiedPanJoinMm,
   note:'Ideal broad-crest with negligible approach velocity, 60 mm dam and 600 mm remaining width; hypothetical first-harm comparator, not real safe water level.'},
  events,
  rejects:['Changing roof runoff direction does not qualify normal court inlet, first-harm, safe overflow, common tailwater, direct court rain or existing outer discharge.',
   'At fixed 7100 mm exterior eave, ANY outward roof pitch raises the inner court rim. The 13.124 degree ridge-height limit does not preserve the existing 7100 mm court-eave/daylight datum.',
   'No matched low-pitch roof assembly, junctions, wind/snow/structural loads, access, maintenance or site water receiving capacity is admitted.']
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const out=compareOutwardOnlyRoof();
 assert(out.events[2].currentCourtLitresPerSecond>out.events[2].outwardCourtLitresPerSecond);
 console.log('RWT-06 outward-only roof counterfactual verified; no roof or drainage admission.');
}
