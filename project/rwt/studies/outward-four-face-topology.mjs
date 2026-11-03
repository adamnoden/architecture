import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readInputs} from './open-loggia-event.mjs';
import {compareOutwardOnlyRoof} from './outward-court-load.mjs';

const rad=deg=>deg*Math.PI/180;
export function roofHeightAt({shellMm,courtMinMm,courtMaxMm,outerEaveMm,pitchDeg},x,y){
 assert(Number.isFinite(x)&&Number.isFinite(y));
 assert(x>=0&&x<=shellMm&&y>=0&&y<=shellMm,'point outside the roof shell');
 assert(!(x>courtMinMm&&x<courtMaxMm&&y>courtMinMm&&y<courtMaxMm),
  'point lies in open-air court, not roof');
 return outerEaveMm+Math.min(x,y,shellMm-x,shellMm-y)*Math.tan(rad(pitchDeg));
}
const area=polygon=>{
 let sum=0;
 for(let i=0;i<polygon.length;i++){
  const [x1,y1]=polygon[i],[x2,y2]=polygon[(i+1)%polygon.length];
  sum+=x1*y2-x2*y1;
 }
 return Math.abs(sum)/2/1e6;
};
export function buildOutwardRoofFourFace(inputs=readInputs(),pitchDeg=5){
 const candidate=compareOutwardOnlyRoof(inputs),h=inputs.house.model;
 assert(Number.isFinite(pitchDeg)&&pitchDeg>0&&pitchDeg<45,'study only: positive finite pitch below 45 degrees');
 const shellMm=h.shell,courtMinMm=h.court[0],courtMaxMm=courtMinMm+h.court[2],
  wingMm=courtMinMm,outerEaveMm=h.exterior.eaves,atticDatumMm=h.sections.atticDatum;
 assert.equal(shellMm-courtMaxMm,wingMm);
 assert.equal(h.sections.atticDatum,6900);
 const param={shellMm,courtMinMm,courtMaxMm,outerEaveMm,pitchDeg};
 const P={
  SW:[0,0],SE:[shellMm,0],NE:[shellMm,shellMm],NW:[0,shellMm],
  sw:[courtMinMm,courtMinMm],se:[courtMaxMm,courtMinMm],
  ne:[courtMaxMm,courtMaxMm],nw:[courtMinMm,courtMaxMm]
 };
 const faceSpecs=[
  ['south','y to 0',[P.SW,P.SE,P.se,P.sw]],
  ['east','x to 12000',[P.SE,P.NE,P.ne,P.se]],
  ['north','y to 12000',[P.NE,P.NW,P.nw,P.ne]],
  ['west','x to 0',[P.NW,P.SW,P.sw,P.nw]],
 ];
 const faces=faceSpecs.map(([name,drainage,vertices])=>({
  name,drainage,vertices,planAreaM2:area(vertices),
  corners:vertices.map(([x,y])=>({x,y,z:roofHeightAt(param,x,y)}))
 }));
 const hips=[
  [P.SW,P.sw],[P.SE,P.se],[P.NE,P.ne],[P.NW,P.nw]
 ].map(([outer,inner])=>({outer,inner,outerZ:roofHeightAt(param,...outer),
  innerZ:roofHeightAt(param,...inner)}));
 const innerHighMm=outerEaveMm+wingMm*Math.tan(rad(pitchDeg));
 const rawAtticMaxMm=innerHighMm-atticDatumMm;
 const rawBandForTargetMm=target=>{
  const needed=(atticDatumMm+target-outerEaveMm)/Math.tan(rad(pitchDeg));
  return Math.max(0,Math.min(wingMm,wingMm-Math.max(0,needed)));
 };
 const faceM2=faces.reduce((s,f)=>s+f.planAreaM2,0);
 assert(Math.abs(faceM2-candidate.wallLineProjectionM2.outwardRoofToExterior)<1e-8);
 return {
  authority:'Four planar roof faces as a bounded outward-draining TOPOLOGY only. No ROF/HAD roof adoption, material pitch rating, structural support, water test, loft access or site drainage acceptance.',
  source:{had:inputs.house.blob,mat:inputs.envelope.blob,comparison:'project/rwt/studies/outward-court-load.mjs'},
  params:param,
  faces,hips,
  innerHighMm,rawAtticMaxMm,atticDatumMm,
  rawAtticHeadBandsMm:{at1800:rawBandForTargetMm(1800),at2000:rawBandForTargetMm(2000)},
  minPitchFor2000MmRawAtInnerEdgeDeg:Math.atan((atticDatumMm+2000-outerEaveMm)/wingMm)*180/Math.PI,
  faceAreaM2:faceM2,eachFaceUniform216LitresPerSecond:faces[0].planAreaM2*216/3600,
  totalExterior216LitresPerSecond:faceM2*216/3600,
  warning:'Zero valleys and no horizontal-area flat roof is a geometric property only. Four hips and continuous inner high rim require actual weathering and movement design. No usable attic band, high-edge access, outer blocked-gutter overflow, independent receiving or courtyard first-harm accepted.'
 };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const v=buildOutwardRoofFourFace();
 console.log(`RWT-06 four-face outward roof: ${v.faceAreaM2} m2 roof, ${v.hips.length} hips, ${v.rawAtticMaxMm.toFixed(1)} mm raw attic peak above selected datum; study only.`);
}
