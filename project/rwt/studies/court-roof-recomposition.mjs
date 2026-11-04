/**
 * RWT-06: source-bound joined architectural rewind.
 *
 * One outward-draining four-face roof, a higher exterior eave and a SINGLE
 * wettable outdoor court-to-garden passage. This is NOT an adopted house model,
 * roofing specification, independent flood route, safe pedestrian route, site
 * drainage consent or structural design. Conserves all selected source owners.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSources,joinedRoofTrade} from '../../str/studies/outward-roof-structure.mjs';
import {readInputs,build as buildCourtEvent} from './open-loggia-event.mjs';
import {compareOpenSurfaceRoute} from './court-full-width-surface.mjs';
import {compareOutwardOnlyRoof} from './outward-court-load.mjs';

const rad = degrees => degrees*Math.PI/180;
const round = (n,places=6)=>Number(n.toFixed(places));

export function recomposeRoofAndCourt({roofSources=readSources(), rainSources=readInputs()}={}){
  const str=joinedRoofTrade(roofSources);
  const open=compareOpenSurfaceRoute(rainSources);
  const event=buildCourtEvent(rainSources);
  const outward=compareOutwardOnlyRoof(rainSources);
  const had=rainSources.house.model;
  const matRoof=roofSources.mat;
  const matWater=rainSources.envelope.model;
  assert.equal(had.selection.identity,roofSources.had.selection.identity);
  assert.equal(had.exterior.eaves,matRoof.eave);
  assert.equal(had.exterior.ridge,str.section.currentRidgeMm);
  assert.equal(matRoof.ceilingTop,6620,'protected ceiling revision requires a fresh joined design');
  assert.deepEqual(had.loggia.clear,[4800,7750,2400,4250]);
  assert.deepEqual(matWater.outdoor.courtWalking,[0,-30,-110]);
  assert.equal(matWater.threshold.mineralDpc.inner[1],-30);
  assert.equal(had.sections.waterLevels.loggiaNorth,-152.5);
  const outerEaveLiftTrialMm=175; // A visible exterior/facade rewrite, not a tolerance budget.
  const nominalPitchDeg=8;       // No shallow-pitch product suitability established.
  const pitchTrialsDeg=[5,8,10,12];
  const spanToCourtMm=(had.shell-had.court[2])/2;
  const adoptedCeilingTopMm=str.section.controlledCeilingTopMm;
  const originalEaveMm=str.section.outerEaveMm;
  const newOuterEaveMm=originalEaveMm+outerEaveLiftTrialMm;
  const originalRoofRidgeMm=str.section.currentRidgeMm;
  const roofTrial=pitchDeg=>{
    const p=rad(pitchDeg);
    const highCourtRimMm=newOuterEaveMm+spanToCourtMm*Math.tan(p);
    const purlinSoffitInheritedStackMm=newOuterEaveMm+
      str.section.innerLeafInsetMm*Math.tan(p)-
      str.section.inheritedMatNormalStackMm/Math.cos(p)-
      str.section.inheritedSecondaryPurlinDropMm;
    return {
      pitchDeg, outerEaveMm:newOuterEaveMm,
      highCourtRimMm, riseAboveOriginalCourtEaveMm:highCourtRimMm-originalEaveMm,
      highCourtRimBelowOriginalRidgeMm:originalRoofRidgeMm-highCourtRimMm,
      modelledInheritedPurlinSoffitMm:purlinSoffitInheritedStackMm,
      idealNominalGapToProtectedCeilingMm:purlinSoffitInheritedStackMm-adoptedCeilingTopMm,
      keepsHighCourtRimBelowOldRidge:highCourtRimMm<=originalRoofRidgeMm,
      inheritedSectionAvoidsNegativeNominalOverlap:purlinSoffitInheritedStackMm>adoptedCeilingTopMm
    };
  };
  const pitches=pitchTrialsDeg.map(roofTrial);
  const nominal=pitches.find(p=>p.pitchDeg===nominalPitchDeg);
  assert(nominal);
  assert(nominal.highCourtRimBelowOriginalRidgeMm>0);
  assert(nominal.idealNominalGapToProtectedCeilingMm>0);
  assert(pitches.find(p=>p.pitchDeg===12).highCourtRimBelowOriginalRidgeMm<0);
  const qSelected=event.events.find(e=>e.intensityMmPerHour===216);
  const qOutward=outward.events.find(e=>e.intensityMmPerHour===216);
  const surfaceAt216=open.events.find(e=>e.intensityMmPerHour===216);
  assert(qSelected&&qOutward&&surfaceAt216);
  const directOnly=surfaceAt216.cases.futureOutwardOnlyIntact;
  assert(Math.abs(directOnly.litresPerSecond-qOutward.outwardCourtLitresPerSecond)<1e-10);
  const floorPath=[
    {yMm:had.court[1],zMm:matWater.outdoor.courtWalking[0],role:'Court south occupied landing; selected surface'},
    {yMm:had.court[1]+1500,zMm:matWater.outdoor.courtWalking[1],role:'Court intermediate grade; selected surface'},
    {yMm:had.court[1]+had.court[3],zMm:matWater.outdoor.courtWalking[2],role:'North court mouth; selected surface'},
    {yMm:had.shell,zMm:had.sections.waterLevels.loggiaNorth,role:'Outside house at north loggia; selected surface'},
    {yMm:matWater.terminals.guardNorthY,zMm:open.challenger.hypotheticalContinuationEndMm,role:'Unadopted 1% beyond-house continuation, NOT site level'}
  ];
  for(let i=1;i<floorPath.length;i++)assert(floorPath[i].yMm>floorPath[i-1].yMm &&
    floorPath[i].zMm<floorPath[i-1].zMm);
  const courtComparators={
    fullExistingInwardRoofFailureLitresPerSecond:qSelected.combinedLitresPerSecond,
    outwardOnlyDirectCourtLitresPerSecond:qOutward.outwardCourtLitresPerSecond,
    innerRoofMovedToOutsideM2:outward.wallLineProjectionM2.roofShiftToExterior,
    exteriorCatchmentUnderOutwardRoofM2:outward.wallLineProjectionM2.outwardRoofToExterior,
    exteriorInflowAfterReassignmentLitresPerSecond:qOutward.outwardExteriorLitresPerSecond,
    nominalFullWidthUnblockedOnePercentUniformDepthMm:directOnly.fullWidthUniformDepthMm,
    nominalFullWidthUnblockedBroadCrestEnergyMm:directOnly.idealCrestEnergyMm,
    courtMouthToUnqualifiedFirstHarmMm:
      matWater.threshold.mineralDpc.inner[1]-had.sections.waterLevels.courtNorth,
    idealClosedCourtOnlyLitresBelowUnqualifiedJoin:
      event.storage.find(x=>x.levelMm===-30).courtOnlyLitres,
    normalPedestrianAndWaterAreSameOutdoorSurface:true,
    independentProtectedDryGardenExit:false,
    fullNorthMouthClosureSurvives:false,
    highNorthTailwaterSurvives:false,
    actualFirstLeakageLevelEstablished:false,
    lawfullyDrainedSiteEstablished:false
  };
  const roofActions={
    roofProjectionExcludingOverhangsM2:str.roof.projectionM2,
    hypotheticalTwoLineHighCourtRimDownKN:str.resultants.downULS.courtKN,
    hypotheticalTwoLineHighCourtRimUpliftKN:str.resultants.noFavourableDeadLoadUplift.courtKN,
    originalSTRRoofWithExtensionsM2:str.roof.earlierSTRRoofIncludingExtensionsM2,
    warning:'These are inherited conditional two-line action resultants, not member reactions, strength, uplift anchorage or a like-for-like overhang load proof.'
  };
  return {
    authority:'A whole-architecture RECOMPOSITION CANDIDATE only. Exact selected HAD/MAT/STR remain unchanged; trial 8 degree four-face roof, +175 eave and dual-use wettable north loggia are not selected or fit for occupation/construction.',
    sources:{
      had:rainSources.house.blob,waterMat:rainSources.envelope.blob,
      roofMat:str.sources.mat.blob,structure:str.sources.str.blob
    },
    selected:{
      houseMm:had.shell,courtMm:had.court,loggiaMm:had.loggia.clear,
      originalExteriorEaveMm:originalEaveMm,
      originalSelectedRidgeMm:originalRoofRidgeMm,
      retainedProtectedCeilingTopMm:adoptedCeilingTopMm,
      presentInwardRoofDrainage:true,
      actualOnlyGrossNorthThroatMm:had.loggia.clear[2],
      firstHarmComparatorMm:matWater.threshold.mineralDpc.inner[1]
    },
    candidate:{
      roof:'Four continuously OUTWARD-pitched faces, one slope each, hips from outer to court corners; inner high rim has no routine roof-water collector.',
      roofPitchDeg:nominalPitchDeg,
      outerEaveLiftTrialMm,roofTrial:nominal,pitchSensitivities:pitches,
      court:'One deliberately rain-wettable, 2400 gross, full-width outdoor pedestrian AND gravity surface in ordinary use; NOT a separate dry flood escape.',
      floorPath, courtComparators, roofActions,
      absentComponentsIfFutureSelected:[
        'High inner-eave ordinary rainwater gutter and high-court receiver replacement apparatus',
        'Covered 400 gross north copper normal route and its 4250 mm whole-body wet renewal',
        'Parallel 1800 broad relief plus 600 steep chute and their unlanded twin -800 receivers'
      ],
      retainedObligations:[
        'Real outward shallow-pitch roof metal assembly, high rim weathering, hips, diaphragm, hold-downs, outer gutters, leaf/facade/ceiling/thermal/fire interfaces.',
        'Actual court water floor slab/support/threshold and measured first harm under full mouth debris, high receiving head, splash and wet weather maintenance.',
        'Alternative protected house access and safe garden operation during closure of the north passage; no separate dry garden egress is established.',
        'Matched site survey and receiving water, positive daylight gravity head and lawful receiving destination. The historic -800 water plane is rejected, NOT replaced by an invented datum.',
        'Real flood/blocked-state decision: preserve explicit failure and owner-house moisture duties rather than accepting nominal 1% fall as N+1.'
      ]
    },
    admission:'An explicit four-owner HAD/ROF/STR/MAT source decision and RWT/DPL failure/site acceptance are required. The no-change old house is NOT made equivalent to the candidate by these calculations.',
    decision:'Advance a single outward-only roof plus wettable open court surface as a cohesive pre-site design candidate. It removes the unearned simultaneous dry-lane requirement and potential high-court gutter machinery, while exposing eave/facade rise and first-harm/site gates. RWT-06 remains planned; do not adopt without joined section and safety proofs.'
  };
}
export function renderRecompositionSvg(v=recomposeRoofAndCourt()){
  // Two explicit sections at different vertical scales: neither panel is a
  // building permit drawing or a second editable design source.
  const esc=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const t=(x,y,value,size=4,color='#252f35')=>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(value)}</text>`;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="DejaVu Sans,Arial,sans-serif">';
  s+=t(14,18,'RWT-06 / JOINED ROOF AND COURT RECOMPOSITION',7);
  s+=t(14,26,'Unselected section hypotheses. Separate vertical scales. No safety or construction admission.',3.6);
  s+='<line x1="14" y1="31" x2="406" y2="31" stroke="#252f35" stroke-width=".6"/>';
  // Panel 1, 4250 mm wing: roof/wall section on y0..4250.
  const xr=x=>24+x/21;
  const yr=z=>130-(z-6300)/24;
  const a=v.candidate.roofTrial;const b=v.selected;
  s+=t(18,39,'A  /  SOUTH WING ROOF  -  outer eave to high court rim',4.6);
  s+=`<line x1="${xr(0)}" y1="${yr(a.outerEaveMm)}" x2="${xr(4250)}" y2="${yr(a.highCourtRimMm)}" stroke="#2d6975" stroke-width="1.7"/>`;
  const originalRidge=b.originalSelectedRidgeMm;
  s+=`<path d="M ${xr(0)} ${yr(b.originalExteriorEaveMm)} L ${xr(2125)} ${yr(originalRidge)} L ${xr(4250)} ${yr(b.originalExteriorEaveMm)}" fill="none" stroke="#999" stroke-width=".55" stroke-dasharray="2 1"/>`;
  s+=`<line x1="${xr(0)}" y1="${yr(b.retainedProtectedCeilingTopMm)}" x2="${xr(4250)}" y2="${yr(b.retainedProtectedCeilingTopMm)}" stroke="#997454" stroke-width=".6" stroke-dasharray="2 1"/>`;
  s+=t(232,49,`TRIAL 8 deg / eave +${v.candidate.outerEaveLiftTrialMm} mm`,4.1,'#2d6975');
  s+=t(232,56,`High rim +${round(a.highCourtRimMm,1)} / below old ridge ${round(a.highCourtRimBelowOriginalRidgeMm,1)} mm`,3.5);
  s+=t(232,63,`Modelled purlin / ceiling nominal gap ${round(a.idealNominalGapToProtectedCeilingMm,1)} mm`,3.5);
  s+=t(232,70,'Old grey: inherited 25 deg ridge, not an admitted new section',3.3,'#666');
  s+=t(232,78,'Both high-rim down/uplift bearings remain; hips/anchors not designed',3.3);
  s+=t(24,122,'Exterior weather face',3);
  s+=t(182,122,'Court roof high line',3);
  // Panel 2, court y4250..13200, longitudinal open surface. Exaggerated
  // vertical scale (real fall 164.5 over 8950).
  s+=t(18,142,'B  /  COURT FLOOR -> OPEN NORTH LOGGIA -> CONDITIONAL GARDEN',4.6);
  const X=y=>24+(y-4250)/26;
  const Y=z=>202-z/3.2;
  let d='';
  for(const [i,p]of v.candidate.floorPath.entries())d+=(i?' L ':'M ')+X(p.yMm)+' '+Y(p.zMm);
  s+=`<path d="${d}" fill="none" stroke="#2d6975" stroke-width="1.6"/>`;
  for(const p of v.candidate.floorPath){
    s+=`<circle cx="${X(p.yMm)}" cy="${Y(p.zMm)}" r="1.4" fill="#2d6975"/>`;
  }
  s+=`<line x1="${X(7750)}" y1="169" x2="${X(7750)}" y2="260" stroke="#aaa" stroke-dasharray="2 1"/>`;
  s+=`<line x1="${X(12000)}" y1="169" x2="${X(12000)}" y2="260" stroke="#aaa" stroke-dasharray="2 1"/>`;
  s+=t(X(4250),174,'Court south',3.1);
  s+=t(X(7750)-16,174,'Court north',3.1);
  s+=t(X(12000)-18,174,'House edge',3.1);
  s+=t(350,174,'Trial garden',3.1);
  s+=t(24,201,'+0',3.4);
  s+=t(X(7750)-10,258,'-110',3.4);
  s+=t(X(12000)-10,270,'-152.5',3.4);
  s+=t(365,279,'-164.5',3.4);
  s+=t(26,151,'1% loggia; garden continuation hypothetical. No -800 receiving water or dry escape claimed.',3.4);
  s+=t(26,160,'Direct court rain @216 mm/h: 0.735 L/s vs current combined roof/court 3.604 L/s.',3.4);
  s+=t(26,291,'UNRESOLVED: first leak / full blockage / outer outfall / high tailwater / physical wettable floor.',3.5,'#914836');
  s+='</g></svg>';
  return s;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=recomposeRoofAndCourt();
  if(process.argv.includes('--svg')){
    process.stdout.write(renderRecompositionSvg(v));
  }else console.log(JSON.stringify({
    sources:v.sources, selected:v.selected, roofTrial:v.candidate.roofTrial,
    pitchSensitivities:v.candidate.pitchSensitivities,
    floor:v.candidate.floorPath, water:v.candidate.courtComparators,
    roofActions:v.candidate.roofActions, decision:v.decision
  },null,2));
}
