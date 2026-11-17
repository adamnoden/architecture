import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.env.SOUTH_INLET_REPO
  ? pathToFileURL(resolve(process.env.SOUTH_INLET_REPO)+'/')
  : new URL('../../../',import.meta.url);
const sources = {};
function source(path) {
  const url = new URL(path,root);
  const bytes = readFileSync(url);
  sources[path] = createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  return {url,bytes};
}
const kernelPath = 'project/had/studies/south-inlet-sill-insert-kernel.mjs';
const {readSouthInletSillInsertInputs,sourceSouthInletSillInsertCase,deriveSouthInletSillInsert} =
  await import(source(kernelPath).url);
source('project/had/studies/service-interface-geometry.mjs');
const inputs = readSouthInletSillInsertInputs(path=>JSON.parse(source(path).bytes));
const geometry = deriveSouthInletSillInsert(inputs,sourceSouthInletSillInsertCase(inputs));
const result = {
  disposition:'Prefer the framed sill insert as a geometric development of independent chambers. Retain the indoor inlet reference.',
  sources,...geometry,
};
const {jambAndSill:{jambs},opening,frame,bores,vents,loads,handlingAndVentHoodReservations,rejected} = result;
const {window,cells} = inputs;
const {eastStile} = loads;
const {unchangedPlantVentWithNewHeader:oldHighVent,earlierEastStile:oldEastRail,
  widerEastStile:oldWideEastRail,deeperUnchangedProfile:oldHighSoffitComparison} = rejected;
const round = value=>Number(value.toFixed(4));
assert.deepEqual(jambs,[[9195,9400],[10400,10605]]);
assert.equal(frame.z[1],750);
assert(handlingAndVentHoodReservations.utilityCellWestFaceToNarrowCutMM===45);
assert(handlingAndVentHoodReservations.utilityCarrierWestAfter5ToNarrowCutMM>=80);
assert(handlingAndVentHoodReservations.exteriorHoodSeparationAfter10MM>=170);
assert(result.projectedOpenedAreaM2.narrowInsert<result.projectedOpenedAreaM2.fullSpanInsert/2);
assert(bores.every(bore=>Math.min(...Object.values(bore.apertureAfter10))>=5));
assert(vents.every(v=>Math.min(...Object.values(v.apertureAfter5),v.mainBoreReserveAfter5MM)>=9 && v.freeCoreAboveWetStageGrossMM>0));
assert.equal(result.plantWetCellPackingAfterSettingMm,5);
assert(oldHighVent.apertureAfter5.headerMM<0 && oldEastRail.eastMM===0 && oldWideEastRail.eastMM<0);
assert(oldHighSoffitComparison.plantTopMM<0);
assert(eastStile.afterTwo2MMSettingsFrameWidthReserveMM===0 && eastStile.normalTopDisplacementMM<2);
assert(loads.combinedElasticCornerStressMPa<70 && loads.correspondingVerticalAndHorizontalDeflectionsMM.every(d=>d<1));
assert.equal(round(loads.outerSUncut.addedSimpleBalanceVerticalKN.reduce((a,b)=>a+b)),3);
const files={'south-inlet-sill-insert.json':JSON.stringify(result,null,2)+'\n'};
const sx=x=>48+(x-9100)*0.66;
const sy=z=>555-z*0.60;
const rect=(x0,x1,z0,z1,color,stroke=color)=>'<rect x="'+sx(x0)+'" y="'+sy(z1)+'" width="'+(x1-x0)*0.66+'" height="'+(z1-z0)*0.60+'" fill="'+color+'" stroke="'+stroke+'"/>';
const disk=([x,,z],r,color)=>'<ellipse cx="'+sx(x)+'" cy="'+sy(z)+'" rx="'+r*0.66+'" ry="'+r*0.60+'" fill="'+color+'" stroke="#fff"/>';
const caption=(x,y,t)=>'<text x="'+x+'" y="'+y+'">'+t+'</text>';
files['south-inlet-sill-insert.svg']=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1150 680" width="1150" height="680" aria-labelledby="title">
<title id="title">South utility sill and independently vented inlet cells</title>
<style>text{font:17px sans-serif;fill:#172d39} .title{font:700 28px sans-serif}</style>
<rect width="1150" height="680" fill="#fffdf6"/>
<text class="title" x="44" y="40">South utility sill and independently vented inlet cells</text>
${caption(44,72,'Projection onto the inside wall. Dimensions and levels in mm.')}
${rect(jambs[0][0],jambs[0][1],0,800,'#cebfa8')}
${rect(jambs[1][0],jambs[1][1],0,800,'#cebfa8')}
${rect(window.clear[0],window.clear[1],window.sill,800,'#d9eef2')}
${rect(frame.x[0],frame.x[1],frame.z[0],frame.z[1],'#204756')}
${rect(opening.x[0],opening.x[1],opening.z[0],opening.z[1],'#fffdf6')}
${rect(...frame.retainedWestInfillX,opening.z[0],opening.z[1],'#d9c9ae')}
${cells.branches.map((cell,i)=>rect(...cell.case.sideLimitsX,130,685,i===0?'#dbeef1':'#e1e9d2')).join('')}
${bores.map(bore=>disk(bore.axis[1],bore.formedReserveODMM/2,bore.id.endsWith('-pressure')?'#2e6e84':'#517750')).join('')}
${vents.map(v=>disk(v.axis[1],v.outerDiameterMM/2,'#ce7541')).join('')}
${rect(9195,10605,-25,0,'#b7bfc1')}
${caption(78,530,'West jamb')}
${caption(940,530,'East jamb')}
${caption(62,585,'Existing foundation beam below Z−180 stays uncut.')}
${caption(100,632,'Window sill Z750')}
${caption(365,632,'Sill member Z700–750')}
${caption(724,632,'Clear insert X9950–10380')}
${caption(320,328,'Retained infill')}
${caption(545,480,'Contained wet cells')}
</svg>\n`;
for(const [name,content] of Object.entries(files)){
  const destination=new URL(name,import.meta.url);
  if(process.argv.includes('--write')) writeFileSync(destination,content);
  else if(process.argv.includes('--check')) assert.equal(readFileSync(destination,'utf8'),content);
  else if(name.endsWith('.json')) process.stdout.write(content);
}
