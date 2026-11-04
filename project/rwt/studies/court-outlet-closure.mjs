/**
 * RWT-06: fully blocked north-mouth court-only, hydrostatic ponding screen.
 *
 * Even if an outward-only roof deletes routine inner-roof runoff, direct court
 * rain persists. This is an *adverse lossless-storage counterexample*, NOT a
 * weather forecast, actual first leakage, safe detention clock, flood routing,
 * product proof or an accepted site/outlet.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs,build,stripLitres} from './open-loggia-event.mjs';
import {recomposeRoofAndCourt} from './court-roof-recomposition.mjs';

const courtVolumeLitres=levelMm=>
  stripLitres(levelMm,3500,1500,-30,0)+
  stripLitres(levelMm,3500,2000,-110,-30);

/** Invert only the selected *finite* two-strip court surface; no false time model. */
export function courtStaticLevelForLitres(litres){
  assert(Number.isFinite(litres)&&litres>=0,'required volume must be finite and nonnegative');
  let low=-110,high=200;
  assert(courtVolumeLitres(low)<=litres&&courtVolumeLitres(high)>litres,'chosen finite range does not contain the volume');
  for(let k=0;k<100;k++){
    const mid=(low+high)/2;
    if(courtVolumeLitres(mid)<litres)low=mid;
    else high=mid;
  }
  return (low+high)/2;
}

export function compareCourtOutletClosure(source=readInputs()){
  const original=build(source);
  const joined=recomposeRoofAndCourt({rainSources:source});
  const c=original.catchment,root=original.levels;
  assert.equal(joined.selected.firstHarmComparatorMm,root.panJoin);
  assert.equal(joined.selected.originalExteriorEaveMm,7100);
  assert.equal(joined.candidate.courtComparators.outwardOnlyDirectCourtLitresPerSecond,.735);
  assert.equal(c.wallLineCourtM2,12.25);
  assert.equal(c.offsetExposedCourtM2,9.61);
  assert.equal(root.mouth,-110);
  assert.equal(root.panJoin,-30);
  const atComparatorLitres=courtVolumeLitres(root.panJoin);
  assert.equal(atComparatorLitres,280);
  const comparisonDurationSeconds=600;
  const intensitiesMmPerHour=[72,144,216];
  const areaIdentities={
    wallLineCourtM2:c.wallLineCourtM2,
    internallyConsistent200MmOverhangExposedCourtM2:c.offsetExposedCourtM2
  };
  const cases=intensitiesMmPerHour.map(intensityMmPerHour=>({
    intensityMmPerHour,
    areas:Object.fromEntries(Object.entries(areaIdentities).map(([identity,areaM2])=>{
      const incomingLitresPerSecond=intensityMmPerHour*areaM2/3600;
      const tenMinuteVolumeLitres=incomingLitresPerSecond*comparisonDurationSeconds;
      const idealNoOutletHydrostaticLevelMm=courtStaticLevelForLitres(tenMinuteVolumeLitres);
      const geometricBelowUnqualifiedJoinMm=root.panJoin-idealNoOutletHydrostaticLevelMm;
      return [identity,{
        areaM2,incomingLitresPerSecond,tenMinuteVolumeLitres,
        idealNoOutletHydrostaticLevelMm,
        geometricBelowUnqualifiedJoinMm,
        reachesOrPassesUnqualifiedJoinInIdealModel:geometricBelowUnqualifiedJoinMm<=0
      }];
    }))
  }));
  const high=cases[2].areas;
  assert(high.wallLineCourtM2.reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(high.internallyConsistent200MmOverhangExposedCourtM2.reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(high.wallLineCourtM2.idealNoOutletHydrostaticLevelMm>
    high.internallyConsistent200MmOverhangExposedCourtM2.idealNoOutletHydrostaticLevelMm);
  const physicalEventEquivalenceSecondsAtJoin=Object.fromEntries(
    Object.entries(areaIdentities).map(([id,areaM2])=>
      [id,atComparatorLitres/(216*areaM2/3600)]
    )
  );
  return {
    authority:'Unadopted 10-minute constant-rain, zero-outlet, court-only volumetric sensitivity. The -30 pan/DPC join is an UNQUALIFIED FIRST-WETTING COMPARATOR, NOT a verified first leak or acceptable ponding stage. No residence time, evacuation clock, actual site, safe backup or acceptance.',
    sources:joined.sources,
    geometry:{
      courtSouthYmm:source.house.model.court[1],
      courtNorthYmm:source.house.model.court[1]+source.house.model.court[3],
      courtGrossWidthMm:source.house.model.court[2],
      mouthZmm:root.mouth,
      unqualifiedWallBaseComparisonZmm:root.panJoin,
      geometricCourtOnlyVolumeToUnqualifiedJoinLitres:atComparatorLitres,
      volumeAtGroundFFL0Litres:courtVolumeLitres(0),
      volumeAtGeometricDoorCrest15Litres:courtVolumeLitres(15)
    },
    comparison:{
      durationSeconds:comparisonDurationSeconds,
      stormIntensitiesMmPerHour:intensitiesMmPerHour,
      areaIdentities,cases,
      syntheticVolumeDivideRateAt216ToUnqualifiedJoinSeconds:physicalEventEquivalenceSecondsAtJoin
    },
    failureStates:{
      northMouthFullyBlocked:true,
      noDischargeFromCourt:true,
      roofFacesOutwardOnlyCandidate:true,
      realSillFirstLeakQualified:false,
      gardenBackwaterIncluded:false,
      fullRoofFailureToCourtProvedAbsent:false,
      noSafeDetentionTimeCredited:true,
      alternativeHumanExitFromGardenProved:false
    },
    next:'Do not select the outward-only roof/single-surface option as a safe drainage system. First author a house/source junction that can tolerate the named higher wetting stage and a real physically independent passive backup/outfall (or redesign court/roof/site). This is a negative RWT-06 gate; no guessed pan upgrade, extra concealed pipe, pump or nominal ten-minute response allowance.',
    decision:'Even the reduced direct-court-only inflow in a complete north-mouth failure overtops the unqualified -30 wall-base comparison in the 216 mm/h ten-minute geometric sensitivity, for BOTH the wall-line and exposed-200mm-overhang areas. Roof reversal removes ordinary inner-roof loading but does not satisfy RWT-06 blocked-state first-harm acceptance.'
  };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=compareCourtOutletClosure();
  console.log(JSON.stringify({geometry:v.geometry,comparison:v.comparison,
    failureStates:v.failureStates,decision:v.decision},null,2));
}
