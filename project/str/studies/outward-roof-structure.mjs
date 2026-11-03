import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Finite STR-HOUSE counterfactual, not a selected roof or a structural solver.
// Read only the same actual HAD, MAT and STR comparison sources. If any moves,
// review the affected physical relationship instead of silently repinning.
const sourceContracts={
  had:{path:'project/had/studies/open-north-loggia.json',blob:'25faad2c4d40df2b7da7212f73808843a88d2f52'},
  mat:{path:'project/mat/studies/loggia-roof-section.json',blob:'a44ff7ae37a71c2da9523cc19b44a60a8888f73c'},
  str:{path:'project/str/studies/open-loggia-support.json',blob:'20dec4384d09a0d02075fdd34a247e775532763b'},
};
const gitBlob=raw=>createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
export function readSources(){
  return Object.fromEntries(Object.entries(sourceContracts).map(([name,source])=>{
    const raw=readFileSync(source.path,'utf8');
    assert.equal(gitBlob(raw),source.blob,`${source.path} changed: re-evaluate physical roof/structure comparison`);
    return [name,JSON.parse(raw)];
  }));
}
const radians=d=>d*Math.PI/180;
const nominal= (actual,expected,explanation)=>assert(Math.abs(actual-expected)<1e-6,explanation+`: ${actual} != ${expected}`);
const qKpaFor=loads=>({
  downULS:1.35*loads.Gmax+1.5*loads.Q,
  noFavourableDeadLoadUplift:-1.5*loads.wind_stress
});
export function joinedRoofTrade(source=readSources()){
  const h=source.had,m=source.mat,s=source.str;
  assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
  assert.deepEqual(h.court,[4250,4250,3500,3500]);
  assert.equal(h.shell,12000);
  assert.equal(h.exterior.eaves,7100);
  assert.equal(h.sections.atticDatum,6900);
  assert.equal(m.pitch,25);
  nominal(h.exterior.ridge,m.ridge,'selected roof ridge');
  nominal(h.exterior.eaves,m.eave,'selected eave');
  assert.equal(s.actual_roof.plan_area,144.15);
  assert.equal(s.actual_roof.loads.Gmin_uplift,0);

  const inset=m.supportFromWeatherFace;
  assert.equal(inset,332.5);
  nominal(m.roofAtSupport,m.eave+inset*Math.tan(radians(m.pitch)),'existing MAT roof seat height');
  nominal(m.totalVertical,m.totalNormal/Math.cos(radians(m.pitch)),'source normal to vertical stack');
  // This difference is the existing source's primary-to-purlin soffit offset,
  // not an intrinsic invariant of all new-pitch roof members.
  const inheritedPurlinDropMm=m.roofAtSupport-m.totalVertical-m.purlins.underside;
  assert(inheritedPurlinDropMm>0);

  const L=(h.shell-h.court[2])/2,outerWidth=h.shell,innerWidth=h.court[2];
  const mm2m2=area=>area/1e6;
  // Trapezoid cross-section width w(t)=outerWidth-(outerWidth-innerWidth)t/L.
  // With *only* two continuous vertical support-resultant lines, at t=0 and
  // t=L, force and first-moment equilibrium gives this precise partition.
  // It is NOT a design for individual hips, corner posts or real roof members.
  const faceArea=mm2m2((outerWidth+innerWidth)*L/2);
  const courtReactionArea=mm2m2(L*(outerWidth/2-(outerWidth-innerWidth)/3));
  const outerReactionArea=faceArea-courtReactionArea;
  const loads=qKpaFor(s.actual_roof.loads);
  const faceCounts=4;
  const totalArea=faceCounts*faceArea;
  const twoLineArea={faceTotalM2:faceArea,faceOuterM2:outerReactionArea,faceCourtM2:courtReactionArea,
    wholeRoofM2:totalArea,wholeOuterM2:faceCounts*outerReactionArea,wholeCourtM2:faceCounts*courtReactionArea};
  nominal(totalArea,h.shell**2/1e6-h.court[2]**2/1e6,'four-face wall-line roof projection');
  const resultants=Object.fromEntries(Object.entries(loads).map(([kind,q])=>[kind,{
    qKpa:q,totalKN:q*twoLineArea.wholeRoofM2,outerKN:q*twoLineArea.wholeOuterM2,
    courtKN:q*twoLineArea.wholeCourtM2,
    faceKN:q*twoLineArea.faceTotalM2,
    faceOuterKN:q*twoLineArea.faceOuterM2,faceCourtKN:q*twoLineArea.faceCourtM2
  }]));
  const rimPitchLimitDeg=Math.atan((h.exterior.ridge-m.eave)/L)*180/Math.PI;
  function sectionAt(pitchDeg){
    assert(Number.isFinite(pitchDeg)&&pitchDeg>0&&pitchDeg<45,'pitch must be positive and below 45° for this finite trial');
    const p=radians(pitchDeg);
    const faceAtWarmInnerLeafMm=m.eave+inset*Math.tan(p);
    const normalStackVerticalMm=m.totalNormal/Math.cos(p);
    const bottomOfInheritedPurlinMm=faceAtWarmInnerLeafMm-normalStackVerticalMm-inheritedPurlinDropMm;
    return {pitchDeg,faceAtWarmInnerLeafMm,normalStackVerticalMm,
      inheritedPurlinDropMm,bottomOfInheritedPurlinMm,
      nominalClearanceAboveSelectedCeilingMm:bottomOfInheritedPurlinMm-m.ceilingTop,
      courtHighRimMm:m.eave+L*Math.tan(p)};
  }
  const sections=[5,8,12,rimPitchLimitDeg,15,25].map(sectionAt);
  nominal(sectionAt(25).bottomOfInheritedPurlinMm,m.purlins.underside,'historical roof section reproduces actual purlin soffit');
  let low=1,high=35;
  assert(sectionAt(low).nominalClearanceAboveSelectedCeilingMm<0);
  assert(sectionAt(high).nominalClearanceAboveSelectedCeilingMm>0);
  for(let i=0;i<70;i++){
    const mid=(low+high)/2;
    if(sectionAt(mid).nominalClearanceAboveSelectedCeilingMm>=0)high=mid;
    else low=mid;
  }
  return {
    status:'STR-HOUSE conditional roof reversal challenge; no roof adoption, member strength, diaphragm/hip support or permit',
    sources:Object.fromEntries(Object.entries(sourceContracts).map(([k,v])=>[k,{path:v.path,blob:v.blob}])),
    model:'One complete 12 m shell / 3.5 m court annular projection, four faces, no projected overhang. Hypothetical two parallel vertical resultant lines per face, no separate hip or corner vertical reactions/moments. Transverse global force/first moment only.',
    roof:{projectionM2:totalArea,earlierSTRRoofIncludingExtensionsM2:s.actual_roof.plan_area,
      unmodelledProjectionDifferenceM2:s.actual_roof.plan_area-totalArea,
      note:'The 12.4 m2 difference is an extent/overhang comparability warning, NOT a saved load or changed covering mass.'},
    twoLineArea,resultants,
    section:{
      controlledCeilingTopMm:m.ceilingTop,outerEaveMm:m.eave,
      innerLeafInsetMm:inset,inheritedMatNormalStackMm:m.totalNormal,
      inheritedSecondaryPurlinDropMm:inheritedPurlinDropMm,
      currentRidgeMm:h.exterior.ridge,
      rimPitchLimitForCurrentRidgeDeg:rimPitchLimitDeg,
      minimumPitchForZeroNominalCeilingCollisionDeg:high,
      clearanceAtRidgeLimitedPitchMm:sectionAt(rimPitchLimitDeg).nominalClearanceAboveSelectedCeilingMm,
      sections
    },
    bounds:[
      'Changing weather-water drainage direction does NOT eliminate roof reactions or hold-down duties at the high courtyard rim.',
      'Two-line reactions are conditional global equilibrium resultants. Hip/purlin/diaphragm, lateral/uplift and individual wall/pier distributions are unallocated, NOT two real line-beam capacities.',
      '25 degree MATCH is a source-consistency check. Transferring its normal assembly and purlin drop to shallow faces is a deliberately adverse same-section comparator, NOT an approved shallow-pitch kit or product-rating inference.',
      'Net clearance near zero is NOT practical buildability: real framing, deflection, supports, tolerance, fire, insulation continuity and maintenance require a matched section. Existing MAT roof low-edge/eave provisions must be re-authored for an outward roof.',
      'The current 144.15 m2 STR roof budget includes extents outside the 131.75 m2 wall-line comparison; its 908.145 kN down case cannot be naively compared with this trial as a structural mass saving.',
      'The structure must connect court-rim, hips, outer bearings, upper cores/heads, first-floor diaphragm, warm/cold grid and site-dependent supports. Actual G, Q, wind and combinations remain unselected.'
    ]
  };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const v=joinedRoofTrade();
 console.log(JSON.stringify({
  faceAreaM2:v.twoLineArea.faceTotalM2,
  courtULSKN:v.resultants.downULS.courtKN,
  outerULSKN:v.resultants.downULS.outerKN,
  ridgeLimitDeg:v.section.rimPitchLimitForCurrentRidgeDeg,
  zeroClearPitchDeg:v.section.minimumPitchForZeroNominalCeilingCollisionDeg,
  clearance5DegMm:v.section.sections[0].nominalClearanceAboveSelectedCeilingMm
 },null,2));
}
