import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {readSources} from '../../str/studies/outward-roof-structure.mjs';
import {recomposeRoofAndCourt,renderRecompositionSvg} from './court-roof-recomposition.mjs';

const near=(a,b,eps=1e-6)=>assert(Math.abs(a-b)<eps,`${a} differs from ${b}`);

test('candidate composes the selected protected ceiling with a raised-eave outward roof',()=>{
  const v=recomposeRoofAndCourt(),s=v.selected,c=v.candidate,r=c.roofTrial;
  assert.deepEqual(s.courtMm,[4250,4250,3500,3500]);
  assert.deepEqual(s.loggiaMm,[4800,7750,2400,4250]);
  near(s.originalExteriorEaveMm,7100);
  near(s.originalSelectedRidgeMm,8090.903773579372);
  near(s.retainedProtectedCeilingTopMm,6620);
  near(c.outerEaveLiftTrialMm,175);
  near(c.roofPitchDeg,8);
  near(r.outerEaveMm,7275);
  near(r.highCourtRimMm,7872.298547485164);
  near(r.highCourtRimBelowOriginalRidgeMm,218.60522609420786);
  near(r.idealNominalGapToProtectedCeilingMm,151.97404521997396);
  assert(r.keepsHighCourtRimBelowOldRidge);
  assert(r.inheritedSectionAvoidsNegativeNominalOverlap);
  assert.match(v.authority,/not selected or fit for occupation/);
});

test('pitch selection exposes high-court visual cost and disallows unchanged 12 degree height envelope',()=>{
  const v=recomposeRoofAndCourt(),a=v.candidate.pitchSensitivities;
  assert.deepEqual(a.map(x=>x.pitchDeg),[5,8,10,12]);
  assert(a.slice(0,3).every(x=>x.keepsHighCourtRimBelowOldRidge));
  assert(!a[3].keepsHighCourtRimBelowOldRidge);
  assert(a.every(x=>x.inheritedSectionAvoidsNegativeNominalOverlap));
  assert(a[1].riseAboveOriginalCourtEaveMm>770);
  assert(a[2].highCourtRimBelowOriginalRidgeMm<70);
  assert(a[3].highCourtRimBelowOriginalRidgeMm<0);
  assert.match(v.candidate.retainedObligations.join(' '),/facade\/ceiling/);
});

test('one ordinary wettable corridor avoids the invented independent dry-lane fit, not its safety duties',()=>{
  const v=recomposeRoofAndCourt(),s=v.candidate.courtComparators;
  near(v.selected.actualOnlyGrossNorthThroatMm,2400);
  near(s.fullExistingInwardRoofFailureLitresPerSecond,3.60375);
  near(s.outwardOnlyDirectCourtLitresPerSecond,.735);
  near(s.innerRoofMovedToOutsideM2,47.8125);
  near(s.exteriorCatchmentUnderOutwardRoofM2,131.75);
  near(s.exteriorInflowAfterReassignmentLitresPerSecond,7.905);
  near(s.nominalFullWidthUnblockedOnePercentUniformDepthMm,3.3954748249957722);
  near(s.courtMouthToUnqualifiedFirstHarmMm,80);
  near(s.idealClosedCourtOnlyLitresBelowUnqualifiedJoin,280);
  assert(s.normalPedestrianAndWaterAreSameOutdoorSurface);
  assert(!s.independentProtectedDryGardenExit);
  assert(!s.fullNorthMouthClosureSurvives);
  assert(!s.highNorthTailwaterSurvives);
  assert(!s.actualFirstLeakageLevelEstablished);
  assert(!s.lawfullyDrainedSiteEstablished);
  assert.match(v.admission,/HAD\/ROF\/STR\/MAT/);
});

test('the open court floor really falls in one outdoor direction to an UNSELECTED garden continuation',()=>{
  const v=recomposeRoofAndCourt(),path=v.candidate.floorPath;
  assert.deepEqual(path.map(p=>p.yMm),[4250,5750,7750,12000,13200]);
  assert.deepEqual(path.map(p=>p.zMm),[0,-30,-110,-152.5,-164.5]);
  assert(path.every((p,i)=>i===0||(p.yMm>path[i-1].yMm&&p.zMm<path[i-1].zMm)));
  assert.match(path[4].role,/NOT site level/);
  assert(!('selectedGardenOutfall' in v.candidate));
  assert(v.candidate.absentComponentsIfFutureSelected.length>=3);
});

test('moving roof runoff leaves a full-action inner structural bearing, never free roof support',()=>{
  const r=recomposeRoofAndCourt().candidate.roofActions;
  near(r.roofProjectionExcludingOverhangsM2,131.75);
  near(r.originalSTRRoofWithExtensionsM2,144.15);
  near(r.hypotheticalTwoLineHighCourtRimDownKN,339.15);
  near(r.hypotheticalTwoLineHighCourtRimUpliftKN,-121.125);
  assert.match(r.warning,/not member reactions/);
});

test('input drift fails closed, not inherited roof clearance or first-harm praise',()=>{
  const s=readSources(),r=readInputs();
  const roof=structuredClone(s);
  roof.mat.ceilingTop=6600;
  assert.throws(()=>recomposeRoofAndCourt({roofSources:roof,rainSources:r}));
  const rain=structuredClone(r);
  rain.envelope.model.threshold.mineralDpc.inner[1]=-80;
  assert.throws(()=>recomposeRoofAndCourt({roofSources:s,rainSources:rain}));
  const changed=structuredClone(r);
  changed.house.model.loggia.clear[2]=2600;
  assert.throws(()=>recomposeRoofAndCourt({roofSources:s,rainSources:changed}));
});

test('generated dual-scale section labels its authority and both geometries deterministically',()=>{
  const a=renderRecompositionSvg(),b=renderRecompositionSvg();
  assert.equal(a,b);
  assert(a.startsWith('<svg'));
  assert(a.endsWith('</svg>'));
  assert.match(a,/RWT-06 \/ JOINED ROOF AND COURT RECOMPOSITION/);
  assert.match(a,/TRIAL 8 deg \/ eave \+175 mm/);
  assert.match(a,/UNRESOLVED: first leak/);
  assert.match(a,/Separate vertical scales/);
  assert(!a.includes('NaN'));
  assert(!a.includes('undefined'));
});
