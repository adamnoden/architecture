import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {courtStaticLevelForLitres,compareCourtOutletClosure} from './court-outlet-closure.mjs';

const near=(a,b,eps=1e-8)=>assert(Math.abs(a-b)<eps,`${a} != ${b}`);

test('closed-court volume inversion reproduces the selected finite floor strips',()=>{
  const v=compareCourtOutletClosure();
  near(v.geometry.geometricCourtOnlyVolumeToUnqualifiedJoinLitres,280);
  near(v.geometry.volumeAtGroundFFL0Litres,568.75);
  near(v.geometry.volumeAtGeometricDoorCrest15Litres,752.5);
  near(v.geometry.mouthZmm,-110);
  near(v.geometry.unqualifiedWallBaseComparisonZmm,-30);
  near(courtStaticLevelForLitres(0),-110);
  near(courtStaticLevelForLitres(280),-30);
  near(courtStaticLevelForLitres(568.75),0);
  near(courtStaticLevelForLitres(752.5),15);
});

test('outward roof does NOT save unqualified wall-base join from full-mouth obstruction',()=>{
  const v=compareCourtOutletClosure(), high=v.comparison.cases[2];
  near(high.intensityMmPerHour,216);
  near(v.comparison.durationSeconds,600);
  const wall=high.areas.wallLineCourtM2,offset=high.areas.internallyConsistent200MmOverhangExposedCourtM2;
  near(wall.areaM2,12.25);near(offset.areaM2,9.61);
  near(wall.incomingLitresPerSecond,.735);
  near(offset.incomingLitresPerSecond,.5766);
  near(wall.tenMinuteVolumeLitres,441);
  near(offset.tenMinuteVolumeLitres,345.96);
  near(wall.idealNoOutletHydrostaticLevelMm,-11.348486805539277);
  near(offset.idealNoOutletHydrostaticLevelMm,-21.48372879714919);
  near(wall.geometricBelowUnqualifiedJoinMm,-18.651513194460723);
  near(offset.geometricBelowUnqualifiedJoinMm,-8.51627120285081);
  assert(wall.reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(offset.reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(wall.idealNoOutletHydrostaticLevelMm>offset.idealNoOutletHydrostaticLevelMm);
});

test('earlier event rates bracket the join without pretending every rain event fails',()=>{
  const v=compareCourtOutletClosure(), [low,mid,high]=v.comparison.cases;
  const w=id=>id.areas.wallLineCourtM2, o=id=>id.areas.internallyConsistent200MmOverhangExposedCourtM2;
  near(low.intensityMmPerHour,72);
  near(mid.intensityMmPerHour,144);
  near(w(low).tenMinuteVolumeLitres,147);
  near(o(low).tenMinuteVolumeLitres,115.32);
  near(w(mid).tenMinuteVolumeLitres,294);
  near(o(mid).tenMinuteVolumeLitres,230.64);
  near(w(mid).idealNoOutletHydrostaticLevelMm,-28.04764607319394);
  near(o(mid).idealNoOutletHydrostaticLevelMm,-37.39303457262913);
  assert(!w(low).reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(!o(mid).reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(w(mid).reachesOrPassesUnqualifiedJoinInIdealModel);
  assert(w(high).idealNoOutletHydrostaticLevelMm>w(mid).idealNoOutletHydrostaticLevelMm);
});

test('no synthetic detention, leakage or evacuation clock is exported',()=>{
  const v=compareCourtOutletClosure();
  assert(!Object.hasOwn(v.comparison,'syntheticVolumeDivideRateAt216ToUnqualifiedJoinSeconds'));
  assert(!Object.hasOwn(v.comparison,'timeToFirstHarmSeconds'));
  assert.match(v.authority,/NOT a verified first leak/);
  assert(v.failureStates.noSafeDetentionTimeCredited);
  assert(!v.failureStates.realSillFirstLeakQualified);
  assert(!v.failureStates.alternativeHumanExitFromGardenProved);
  assert(!v.failureStates.fullRoofFailureToCourtProvedAbsent);
  assert.match(v.next,/Do not select/);
  assert.match(v.decision,/does not satisfy RWT-06/);
});

test('source drift and invalid volume fail closed',()=>{
  for(const x of [-1,NaN,Infinity])assert.throws(()=>courtStaticLevelForLitres(x));
  const changed=structuredClone(readInputs());
  changed.envelope.model.threshold.mineralDpc.inner[1]=-40;
  assert.throws(()=>compareCourtOutletClosure(changed));
  const changedHouse=structuredClone(readInputs());
  changedHouse.house.model.court[2]=3600;
  assert.throws(()=>compareCourtOutletClosure(changedHouse));
});
