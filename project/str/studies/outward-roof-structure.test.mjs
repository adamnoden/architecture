import test from 'node:test';
import assert from 'node:assert/strict';
import {readSources,joinedRoofTrade} from './outward-roof-structure.mjs';

const near=(actual,expected,tol=1e-6)=>assert(Math.abs(actual-expected)<tol,
 `${actual} != ${expected}`);

test('outward annular face and two-line support-resultant equilibrium are conserved',()=>{
 const r=joinedRoofTrade(),a=r.twoLineArea;
 near(a.faceTotalM2,32.9375);
 near(a.faceCourtM2,13.458333333333332);
 near(a.faceOuterM2,19.479166666666668);
 near(a.wholeCourtM2,53.83333333333333);
 near(a.wholeOuterM2,77.91666666666667);
 near(a.wholeRoofM2,131.75);
 near(a.wholeCourtM2+a.wholeOuterM2,a.wholeRoofM2);
 // The global first moment from each trapezoid is balanced at t=L.
 near(a.faceCourtM2*4250,4250*(12000/2-(12000-3500)/3)*4250/1e6);
 near(r.roof.unmodelledProjectionDifferenceM2,12.4);
 assert.match(r.roof.note,/NOT a saved load/);
});
test('both signed load challenges preserve total action without assuming real bearings',()=>{
 const r=joinedRoofTrade(),d=r.resultants.downULS,u=r.resultants.noFavourableDeadLoadUplift;
 near(d.qKpa,6.3);near(u.qKpa,-2.25);
 near(d.totalKN,830.025);
 near(d.courtKN,339.15);near(d.outerKN,490.875);
 near(d.faceCourtKN,84.7875);near(d.faceOuterKN,122.71875);
 near(u.totalKN,-296.4375);
 near(u.courtKN,-121.125);near(u.outerKN,-175.3125);
 for(const v of [d,u]){
  near(v.courtKN+v.outerKN,v.totalKN);
  near(4*v.faceKN,v.totalKN);
  near(v.faceCourtKN+v.faceOuterKN,v.faceKN);
 }
 assert.match(r.model,/no separate hip/);
});
test('same existing MAT stack fails to fit 5-12 degree faces below protected ceiling at the inner leaf',()=>{
 const v=joinedRoofTrade().section;
 const get=p=>v.sections.find(x=>x.pitchDeg===p);
 near(v.controlledCeilingTopMm,6620);
 near(v.inheritedMatNormalStackMm,500.7);
 near(v.inheritedSecondaryPurlinDropMm,44.13511675849986);
 near(get(5).nominalClearanceAboveSelectedCeilingMm,-37.657728794084505);
 near(get(8).nominalClearanceAboveSelectedCeilingMm,-23.02595478002604);
 near(get(12).nominalClearanceAboveSelectedCeilingMm,-5.345995852137094);
 near(get(25).nominalClearanceAboveSelectedCeilingMm,38.45085555351761);
 near(v.rimPitchLimitForCurrentRidgeDeg,13.124268122791706);
 near(v.minimumPitchForZeroNominalCeilingCollisionDeg,13.308716423201334);
 assert(v.clearanceAtRidgeLimitedPitchMm<0);
 assert(v.minimumPitchForZeroNominalCeilingCollisionDeg>v.rimPitchLimitForCurrentRidgeDeg);
 // This fractional-millimetre overlap near the two thresholds is not a
 // manufacturing tolerance, structural capacity or categorical impossibility.
 assert(v.clearanceAtRidgeLimitedPitchMm>-1);
});
test('changing any controlling house, MAT stack or source identity fails closed',()=>{
 const s=readSources();
 const x=structuredClone(s);
 x.had.exterior.eaves=6800;
 assert.throws(()=>joinedRoofTrade(x));
 const y=structuredClone(s);
 y.mat.pitch=12;
 assert.throws(()=>joinedRoofTrade(y));
 const z=structuredClone(s);
 z.str.actual_roof.plan_area=131.75;
 assert.throws(()=>joinedRoofTrade(z));
});
