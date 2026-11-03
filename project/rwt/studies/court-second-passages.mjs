import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs} from './open-loggia-event.mjs';

// RWT-06: specific 1.2m clear-axis probes, not automatic passage layout.
// Every candidate cuts a DIFFERENT house side from the selected north loggia.
const intersect=(a,b)=>{
 const x=Math.max(a[0],b[0]),y=Math.max(a[1],b[1]);
 const right=Math.min(a[0]+a[2],b[0]+b[2]);
 const bottom=Math.min(a[1]+a[3],b[1]+b[3]);
 return [x,y,Math.max(0,right-x),Math.max(0,bottom-y)];
};
const area=x=>x[2]*x[3]/1e6;
const faceNames={west:['court-west','outer-west'],east:['court-east','outer-east'],south:['court-south','outer-south']};
const faceInterval=r=>r.direction==='south'?[r.rect[0],r.rect[0]+r.rect[2]]:[r.rect[1],r.rect[1]+r.rect[3]];
const intervalOverlap=(a,b)=>Math.max(0,Math.min(a[1],b[1])-Math.max(a[0],b[0]));
const wallCrossing=(wall,rect)=>{
 const [x,y,w,h]=rect,[[ax,ay],[bx,by]]=[wall.a,wall.b];
 if(ax===bx)return x<ax&&ax<x+w&&intervalOverlap([y,y+h],[Math.min(ay,by),Math.max(ay,by)])>0;
 if(ay===by)return y<ay&&ay<y+h&&intervalOverlap([x,x+w],[Math.min(ax,bx),Math.max(ax,bx)])>0;
 throw Error('Non-axial source wall requires deliberate renewed treatment');
};
const straight=[
 {id:'west-through-stair',direction:'west',rect:[0,5400,4250,1200]},
 {id:'east-through-plant',direction:'east',rect:[7750,5400,4250,1200]},
 {id:'south-through-entrance',direction:'south',rect:[5400,0,1200,4250]}
];
export function investigateSecondOpenPassages(source=readInputs()){
 const h=source.house.model,mat=source.envelope.model;
 assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
 assert.equal(h.shell,12000);
 assert.deepEqual(h.court,[4250,4250,3500,3500]);
 assert.deepEqual(h.loggia.clear,[4800,7750,2400,4250]);
 assert.equal(h.sections.groundFFL,0);
 assert.equal(mat.threshold.lowestJunction.status.includes('unqualified'),true);
 const options=straight.map(r=>{
  const band=faceInterval(r),[courtFace,outerFace]=faceNames[r.direction];
  const onFace=h.openings.GROUND
   .filter(o=>o.wall===courtFace||o.wall===outerFace)
   .map(o=>({id:o.id,face:o.wall,kind:o.kind,
    overlapMm:intervalOverlap(band,[o.centre-o.width/2,o.centre+o.width/2])}))
   .filter(o=>o.overlapMm>0);
  const wallCrossings=h.groundWalls.filter(w=>wallCrossing(w,r.rect)).map(w=>{
   const [ax,ay]=w.a;
   const axis=ax===w.b[0]?'x':'y';
   const overlap=axis==='x'?
    [Math.max(r.rect[1],Math.min(ay,w.b[1])),Math.min(r.rect[1]+r.rect[3],Math.max(ay,w.b[1]))]:
    [Math.max(r.rect[0],Math.min(ax,w.b[0])),Math.min(r.rect[0]+r.rect[2],Math.max(ax,w.b[0]))];
   const uncovered=overlap[1]-overlap[0]-
    (w.holes||[]).reduce((sum,hole)=>sum+intervalOverlap(overlap,hole),0);
   return {id:w.id,axis,crossedIntervalMm:overlap,unopenedLengthMm:Math.max(0,uncovered)};
  });
  const furniture=Object.entries(h.groundFurniture).map(([id,rct])=>({
   id,overlapAreaM2:area(intersect(r.rect,rct))})).filter(o=>o.overlapAreaM2>0);
  const stairs=area(intersect(r.rect,h.stair));
  return {id:r.id,direction:r.direction,straightBandMm:r.rect,
   minimumOpenGroundTerritoryM2:area(r.rect),courtAndOuterOpenings:onFace,
   crossedInternalWalls:wallCrossings,
   existingGroundEquipment:furniture,
   stairBodyOverlapM2:stairs,
   sourceProtectedRouteConflict:r.direction==='south'?'Shares the selected front-to-court protected entry/hall, not a second outdoor route':
    r.direction==='west'?'Slices the source stair footprint and protected stair east wall':
    'Cuts the selected service spine and ground PLANT equipment territory',
   verifiedIndependentDaylightExit:false};
 });
 return {
  scope:'Three explicitly bounded 1200 mm straight secondary daylight-passages, not a search over every possible location/shape or a real architectural design. No safe escape, hydraulic, structural, fire, site, first-harm or occupant acceptance.',
  source:{had:source.house.blob,mat:source.envelope.blob,
   selectedNorthLoggia:h.loggia.clear,unqualifiedPanJoinMm:-30},
  options,
  finding:'None of these three simple orthogonal second outlets is a minor independent drain addition to the selected inhabited house. A second genuinely outdoor through-ring passage requires a deliberate HAD/STR/IAS/OAS programme redesign, with existing protected route and room use retained or explicitly reconsidered. The north 2400 mm loggia remains the one authored daylight outlet, not an automatically proven harmless overflow.',
  stop:'RWT-06 remains planned. Do not relabel a concealed pipe across occupied rooms, a flooded subfloor, an open front door, or a shared north receiver as an independent passive route.'
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const v=investigateSecondOpenPassages();
 console.log(JSON.stringify(v.options.map(o=>({id:o.id,areaM2:o.minimumOpenGroundTerritoryM2,
  openings:o.courtAndOuterOpenings,stairM2:o.stairBodyOverlapM2,
  solidWalls:o.crossedInternalWalls.filter(w=>w.unopenedLengthMm>0).map(w=>w.id),
  fixtureCount:o.existingGroundEquipment.length})),null,2));
}
