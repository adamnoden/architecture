/**
 * RWT-06: the space exchange between an eastern outdoor court route and the
 * selected east plant room. Neither wall assembly is certified or selected.
 * All dimensions are millimetres; this is a plan-only lower-bound test.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs} from './open-loggia-event.mjs';

const intersection=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
const topOf=rect=>rect[1]+rect[3];
const windowBand=o=>[o.centre-o.width/2,o.centre+o.width/2];

export function screenCourtPlantSpaceExchange(source=readInputs()){
  const h=source.house.model,mat=source.envelope.model;
  assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
  assert.equal(h.shell,12000);
  assert.deepEqual(h.court,[4250,4250,3500,3500]);
  assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]);
  assert.equal(h.weather.total,519.5);
  assert.match(mat.threshold.lowestJunction.status,/unqualified/);

  const plant=h.groundWalls.find(w=>w.id==='plant-north');
  const rear=h.groundWalls.find(w=>w.id==='rear-east');
  assert(plant&&rear,'selected plant and rear walls are required');
  assert.deepEqual(plant.finishedFaces,[6403,6597]);
  assert.equal(plant.t,194);
  assert.deepEqual(rear.finishedFaces,[8155.5,8424.5]);
  const controls=h.groundFurniture['plant-controls'];
  const buffer=h.groundFurniture['plant-primary-buffer-round-bounding600'];
  assert.deepEqual(controls,[11270.5,5550,300,650]);
  assert.deepEqual(buffer,[10050,5550,600,600]);
  const spine=h.groundWalls.find(w=>w.id==='service-spine');
  assert.deepEqual(spine.holes,[[2750,3650]]);
  const eastOpenings=h.openings.GROUND;
  const courtWindow=eastOpenings.find(o=>o.id==='court-east-1');
  const outerWindow=eastOpenings.find(o=>o.id==='east-window-2');
  assert.deepEqual(windowBand(courtWindow),[6350,7350]);
  assert.deepEqual(windowBand(outerWindow),[6900,7900]);

  const existingNorth=h.court[1]+h.court[3];
  const grossPassage=1200;
  const nominalCornerPier=200;
  const wallCases=[
    {id:'unweathered-control',thicknessFromPlantSouthMm:plant.t,
     validEnvelopeCandidate:false,
     scope:'Existing internal partition falsely treated as an exterior weather wall; invalid control only.'},
    {id:'rebuild-plant-wall',thicknessFromPlantSouthMm:h.weather.total,
     validEnvelopeCandidate:false,
     scope:'Replace the internal partition from its fixed south face with the selected 519.5 mm loggia wall as a spatial comparator; full assembly not designed.'},
    {id:'add-separate-weather-wall',thicknessFromPlantSouthMm:plant.t+h.weather.total,
     validEnvelopeCandidate:false,
     scope:'Retain plant partition and add a whole 519.5 mm exterior wall on its north, with no construction tolerance; not a selected assembly.'}
  ];
  const cases=wallCases.map(wall=>{
    const sumOfShiftsMm=plant.finishedFaces[0]+wall.thicknessFromPlantSouthMm+
      grossPassage+nominalCornerPier-existingNorth;
    assert(sumOfShiftsMm>0);
    const exchanges=[
      {id:'move-plant-only',plantSouthShiftMm:sumOfShiftsMm,courtNorthExtensionMm:0},
      {id:'share-evenly',plantSouthShiftMm:sumOfShiftsMm/2,courtNorthExtensionMm:sumOfShiftsMm/2},
      {id:'extend-court-only',plantSouthShiftMm:0,courtNorthExtensionMm:sumOfShiftsMm}
    ].map(change=>{
      const southPlantFace=plant.finishedFaces[0]-change.plantSouthShiftMm;
      const routeStart=southPlantFace+wall.thicknessFromPlantSouthMm;
      const routeEnd=routeStart+grossPassage;
      const courtNorth=existingNorth+change.courtNorthExtensionMm;
      const centreSquareSide=h.court[3]+2*change.courtNorthExtensionMm;
      const nominalPlants={
        controlsCollisionDepthMm:Math.max(0,topOf(controls)-southPlantFace),
        bufferCollisionDepthMm:Math.max(0,topOf(buffer)-southPlantFace),
        controlsNominalGapMm:southPlantFace-topOf(controls)
      };
      return {
        ...change,
        routeYBandMm:[routeStart,routeEnd],
        corridorToCourtCornerMm:courtNorth-routeEnd,
        proposedCourtNorthMm:courtNorth,
        newNorthRingDepthMm:h.shell-courtNorth,
        centreSquareSideMm:centreSquareSide,
        centreSquareAdditionalCourtM2:(centreSquareSide**2-h.court[2]*h.court[3])/1e6,
        northOnlyAdditionalCourtM2:h.court[2]*change.courtNorthExtensionMm/1e6,
        rearWallFinishedBandEncroachmentMm:intersection([existingNorth,courtNorth],rear.finishedFaces),
        currentCourtWindowOverlapMm:intersection([routeStart,routeEnd],windowBand(courtWindow)),
        currentOuterWindowOverlapMm:intersection([routeStart,routeEnd],windowBand(outerWindow)),
        ...nominalPlants,
        safeSecondPassageAdmitted:false
      };
    });
    return {...wall,requiredJointPlanMoveMm:sumOfShiftsMm,exchanges};
  });
  return {
    authority:'Selected-source lower-bound PLAN exchange; 1200 gross passage and 200 corner pier are trial reservations, not clearance or structural minima.',
    sources:{had:source.house.blob,mat:source.envelope.blob},
    selected:{court:h.court,plantWallFinishedFacesMm:plant.finishedFaces,
      rearWallFinishedFacesMm:rear.finishedFaces,completeWeatherWallComparatorMm:h.weather.total},
    cases,
    decision:'Neither the earlier 247 mm bare-band shift nor expanding the court by a few centimetres establishes a second daylight outlet. A weathered east passage needs an explicit HAD/STR/MAT/IAS/OAS house redesign, followed by RWT/DPL site and first-harm proof. RWT-06 remains planned.',
    excluded:['No actual finished walking width, weather wall qualification or arch/thrust/support calculation.',
      'No existing window moved; an overlap means the held opening schedule would need redesign.',
      'No claims about a safe flooded garden, common-outlet fault independence or receiving head.',
      'Courtyard growth, whether rectangular or centred square, is a comparison not a new selected house.']
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const x=screenCourtPlantSpaceExchange();
  console.log(JSON.stringify(x.cases.map(c=>({id:c.id,requiredJointPlanMoveMm:c.requiredJointPlanMoveMm,
    fixedPlant:c.exchanges[2],fixedCourt:c.exchanges[0]})),null,2));
}
