import test from 'node:test';
import assert from 'node:assert/strict';
import {readInputs} from './open-loggia-event.mjs';
import {compareOutwardOnlyRoof} from './outward-court-load.mjs';
const near=(actual,expected,epsilon=1e-8)=>assert(Math.abs(actual-expected)<epsilon,
  `${actual} differs from ${expected}`);

test('selected HAD and current ROF ridge arithmetic bound the counterfactual',()=>{
 const v=compareOutwardOnlyRoof(),a=v.wallLineProjectionM2;
 near(a.court,12.25);near(a.innerRoof,47.8125);near(a.outerRoof,83.9375);
 near(a.currentRoofToCourtPlusDirect,60.0625);
 near(a.outwardRoofToCourtPlusDirect,12.25);
 near(a.outwardRoofToExterior,131.75);
 near(a.roofShiftToExterior,47.8125);
 near(v.geometry.currentRidgeMm,8090.903773579372,1e-6);
 near(v.geometry.maxOutwardPitchToNotExceedCurrentRidgeDeg,13.124268122791706,1e-8);
 assert(v.geometry.slopes.every(s=>s.courtHighEdgeMm>v.geometry.selectedCourtEaveMm));
 assert(v.geometry.slopes.find(s=>s.pitchDeg===12).changeFromSelectedRidgeMm<0);
 assert(v.geometry.slopes.find(s=>s.pitchDeg===15).changeFromSelectedRidgeMm>0);
 near(v.geometry.slopes.find(s=>s.pitchDeg===25).courtHighEdgeMm,9081.807547158744,1e-6);
});
test('roof-to-court water is displaced, not made to disappear',()=>{
 const v=compareOutwardOnlyRoof();
 for(const e of v.events){
  near(e.courtReductionLitresPerSecond,e.outerIncreaseLitresPerSecond);
  near(e.currentCourtLitresPerSecond+e.currentExteriorLitresPerSecond,
       e.outwardCourtLitresPerSecond+e.outwardExteriorLitresPerSecond);
  near(e.currentCourtTenMinuteLitres,e.currentCourtLitresPerSecond*600);
  near(e.outwardCourtTenMinuteLitres,e.outwardCourtLitresPerSecond*600);
  assert(e.outwardCourtLitresPerSecond>0);
 }
 const e=v.events.find(e=>e.intensityMmPerHour===216);
 near(e.currentCourtLitresPerSecond,3.60375);
 near(e.outwardCourtLitresPerSecond,.735);
 near(e.currentExteriorLitresPerSecond,5.03625);
 near(e.outwardExteriorLitresPerSecond,7.905);
 near(e.currentCourtTenMinuteLitres,2162.25);
 near(e.outwardCourtTenMinuteLitres,441);
});
test('reduced court loading changes ideal blockage comparison but cannot certify first harm',()=>{
 const v=compareOutwardOnlyRoof();
 const x=v.events.find(e=>e.intensityMmPerHour===216).idealCompoundObstruction;
 near(x.currentStageMm,-26.847181890063073);
 near(x.outwardStageMm,-41.97782160029027);
 assert(x.currentSeparationFromUnqualifiedPanJoinMm<0);
 assert(x.outwardSeparationFromUnqualifiedPanJoinMm>0);
 assert.match(v.jointComparison.note,/not real safe water level/);
 assert.match(v.rejects.join(' '),/common tailwater/);
 assert.equal(v.safeOverflowApproved,undefined);
});
test('changed selected house datum fails closed rather than reusing a stale roof option',()=>{
 const h=structuredClone(readInputs());
 h.house.model.exterior.eaves=6800;
 assert.throws(()=>compareOutwardOnlyRoof(h),/7100/);
 h.house.model.exterior.eaves=7100;
 h.house.model.exterior.ridge+=100;
 assert.throws(()=>compareOutwardOnlyRoof(h),/roof datum changed/);
});
