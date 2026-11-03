import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOutwardRoofFourFace,roofHeightAt} from './outward-four-face-topology.mjs';
const near=(a,b,eps=1e-8)=>assert(Math.abs(a-b)<eps,`${a} != ${b}`);

test('annular four-face mesh conserves exterior catchment with no invented fifth roof face',()=>{
 const d=buildOutwardRoofFourFace();
 assert.deepEqual(d.faces.map(f=>f.name),['south','east','north','west']);
 assert.equal(d.hips.length,4);
 for(const f of d.faces)near(f.planAreaM2,32.9375);
 near(d.faceAreaM2,131.75);
 near(d.eachFaceUniform216LitresPerSecond,1.97625);
 near(d.totalExterior216LitresPerSecond,7.905);
 assert.equal(d.params.pitchDeg,5);
});
test('every exterior edge remains the low eave and every court edge the high rim',()=>{
 const d=buildOutwardRoofFourFace(),p=d.params;
 for(const t of [0,4250,6000,7750,12000]){
  for(const [x,y] of [[t,0],[t,12000],[0,t],[12000,t]])
   near(roofHeightAt(p,x,y),7100);
 }
 for(const t of [4250,5000,6000,7000,7750]){
  for(const [x,y] of [[t,4250],[t,7750],[4250,t],[7750,t]])
   near(roofHeightAt(p,x,y),d.innerHighMm);
 }
 for(const hip of d.hips){
  near(hip.outerZ,7100);near(hip.innerZ,d.innerHighMm);
  for(const fraction of [.1,.5,.9]){
   const x=hip.outer[0]+fraction*(hip.inner[0]-hip.outer[0]);
   const y=hip.outer[1]+fraction*(hip.inner[1]-hip.outer[1]);
   near(roofHeightAt(p,x,y),7100+fraction*(d.innerHighMm-7100));
  }
 }
 assert.throws(()=>roofHeightAt(p,6000,6000),/open-air court/);
 assert.throws(()=>roofHeightAt(p,-1,6000),/outside the roof shell/);
});
test('four open planar faces fall strictly outward without a valley in their interiors',()=>{
 const d=buildOutwardRoofFourFace(),p=d.params,move=100;
 const samples=[
  [[6000,2500],[6000,2500-move]],
  [[9500,6000],[9500+move,6000]],
  [[6000,9500],[6000,9500+move]],
  [[2500,6000],[2500-move,6000]],
 ];
 const drop=move*Math.tan(p.pitchDeg*Math.PI/180);
 for(const [onFace,outward] of samples){
  near(roofHeightAt(p,...onFace)-roofHeightAt(p,...outward),drop);
 }
 assert(d.warning.includes('Zero valleys'));
});
test('high-court roof ridge trades against the selected attic datum, not free service space',()=>{
 const shallow=buildOutwardRoofFourFace(undefined,5);
 const medium=buildOutwardRoofFourFace(undefined,12);
 const steep=buildOutwardRoofFourFace(undefined,25);
 near(shallow.atticDatumMm,6900);
 near(shallow.rawAtticMaxMm,571.8268199851773);
 near(medium.rawAtticMaxMm,1103.365387097594);
 near(steep.rawAtticMaxMm,2181.8075471587435);
 near(shallow.rawAtticHeadBandsMm.at2000,0);
 near(medium.rawAtticHeadBandsMm.at2000,0);
 near(steep.rawAtticHeadBandsMm.at2000,389.8875430827943,1e-6);
 near(shallow.minPitchFor2000MmRawAtInnerEdgeDeg,22.95408653762848,1e-8);
 assert.throws(()=>buildOutwardRoofFourFace(undefined,0),/positive finite/);
 assert.throws(()=>buildOutwardRoofFourFace(undefined,50),/positive finite/);
});
