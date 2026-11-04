/**
 * RWT-06: near-north east daylight route, source-bound geometric no-fit.
 * This is NOT a selected second outlet, an allowable structural corner pier,
 * a qualified pedestrian width, a hydraulic check or a site receiving proof.
 */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs} from './open-loggia-event.mjs';

const overlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
const windowInterval=o=>[o.centre-o.width/2,o.centre+o.width/2];

export function screenNorthEastPassage(source=readInputs()){
  const h=source.house.model;
  assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
  assert.deepEqual(h.court,[4250,4250,3500,3500]);
  assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]);
  assert.match(source.envelope.model.threshold.lowestJunction.status,/unqualified/);

  const plantWall=h.groundWalls.find(w=>w.id==='plant-north');
  const spine=h.groundWalls.find(w=>w.id==='service-spine');
  assert(plantWall&&spine,'source plant boundary and service spine are required');
  assert.deepEqual(plantWall.a,[9300,6500]);
  assert.deepEqual(plantWall.b,[12000,6500]);
  assert.deepEqual(plantWall.finishedFaces,[6403,6597]);
  assert.deepEqual(plantWall.structuralCore,[6430,6570]);
  assert.deepEqual(spine.holes,[[2750,3650]]);
  const controls=h.groundFurniture['plant-controls'];
  const buffer=h.groundFurniture['plant-primary-buffer-round-bounding600'];
  assert.deepEqual(controls,[11270.5,5550,300,650]);
  assert.deepEqual(buffer,[10050,5550,600,600]);
  const fixtureTop=rect=>rect[1]+rect[3];
  const eastOpenings=h.openings.GROUND.filter(o=>o.wall==='court-east'||o.wall==='outer-east');
  const eastCourtWindow=eastOpenings.find(o=>o.id==='court-east-1');
  const outerWindow=eastOpenings.find(o=>o.id==='east-window-2');
  assert(eastCourtWindow&&outerWindow,'the two selected near-north east windows are required');
  assert.deepEqual(windowInterval(eastCourtWindow),[6350,7350]);
  assert.deepEqual(windowInterval(outerWindow),[6900,7900]);

  const eastBandWidthMm=1200;
  const eastRingRunMm=h.shell-(h.court[0]+h.court[2]);
  const northCourtY=h.court[1]+h.court[3];
  assert.equal(eastRingRunMm,4250);
  const cases=[0,140,200,300].map(cornerPierReservationMm=>{
    // Put the whole straight band as far north as possible, respecting the
    // nominal corner reservation. Any southern move worsens plant-wall fit.
    const northY=northCourtY-cornerPierReservationMm;
    const southY=northY-eastBandWidthMm;
    const currentAvailableGrossMm=northY-plantWall.finishedFaces[1];
    const minimumPlantWallSouthShiftMm=Math.max(0,eastBandWidthMm-currentAvailableGrossMm);
    const relocatedPlantSouthFaceMm=plantWall.finishedFaces[0]-minimumPlantWallSouthShiftMm;
    const interval=[southY,northY];
    const currentSpineHoleWidthInBandMm=spine.holes.reduce((n,hole)=>n+overlap(interval,hole),0);
    return {
      cornerPierReservationMm,
      bandMm:[h.court[0]+h.court[2],southY,eastRingRunMm,eastBandWidthMm],
      grossGroundFootprintM2:eastRingRunMm*eastBandWidthMm/1e6,
      currentAvailableGrossNorthOfPlantWallMm:currentAvailableGrossMm,
      minimumPlantWallSouthShiftMm,
      relocatedPlantWallSouthFinishedFaceMm:relocatedPlantSouthFaceMm,
      controlsOverlapAfterRelocationMm:Math.max(0,fixtureTop(controls)-relocatedPlantSouthFaceMm),
      bufferOverlapAfterRelocationMm:Math.max(0,fixtureTop(buffer)-relocatedPlantSouthFaceMm),
      courtWindowDisplacedIntervalMm:overlap(interval,windowInterval(eastCourtWindow)),
      outerWindowDisplacedIntervalMm:overlap(interval,windowInterval(outerWindow)),
      currentlyUnopenedServiceSpineWidthMm:eastBandWidthMm-currentSpineHoleWidthInBandMm,
      completeOutdoorPassageAdmitted:false
    };
  });
  assert(cases.every(c=>c.currentlyUnopenedServiceSpineWidthMm===1200));
  assert(cases.every(c=>c.minimumPlantWallSouthShiftMm>0));
  return {
    authority:'Source-locked east near-north 1200 mm GROSS passage challenge. Corner-pier numbers are illustrative reservations, not structural minima. Reallocated walls/openings, weathering, actual usable widths, safe garden egress, lawful receivers, blocked-state independence and real first harm are UNPROVED.',
    source:{had:source.house.blob,mat:source.envelope.blob},
    selected:{court:h.court,plantWallFinishedFacesMm:plantWall.finishedFaces,
      plantWallStructuralCoreMm:plantWall.structuralCore,
      plantControls:controls,plantBuffer:buffer,
      courtEastWindowMm:windowInterval(eastCourtWindow),
      outerEastWindowMm:windowInterval(outerWindow)},
    eastBandWidthMm,cases,
    decision:'Even a hypothetical ZERO corner pier leaves only 1153 mm gross above the finished plant wall, short of the 1200 mm band. A 200 mm CORNER-PIER TRIAL requires shifting that wall 247 mm south, intercepting 44 mm of the present controls; it also replaces two selected windows and breaches an unopened load-bearing spine. This is a cross-owner house redesign, not a minor extra rain outlet or an admitted independent safe exit.',
    next:'HAD/STR/MAT/IAS/OAS must propose and draw an actual east wall/arch/corner support, relocated plant room and equipment, two rewritten weather openings, upper-storey/roof bearing, usable circulation and site-receiver interfaces. The selected house remains unchanged; RWT-06 remains planned.'
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const v=screenNorthEastPassage();
  console.log(JSON.stringify({source:v.source,cases:v.cases,decision:v.decision},null,2));
}
