/** Finite copper-joint counterexample. mm, degrees C; no hydraulic or construction acceptance. */
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

export const inputs = Object.freeze({
  lengthA:3000, lengthB:3000, installedGap:12, combinedPositionAllowance:2,
  installationC:20, minimumMetalC:-10, maximumMetalC:70,
  alphaPerK:0.0000098*1.8,
  authority:'Authored two-compartment fixture, not a house eave, climate range, prescribed joint or capacity result.',
  alphaSource:'CDA Hung Gutters, Table 10.2A: 0.0000098 per degree F; multiplied by 1.8 for per K.',
  restraint:'Both outer ends fixed; adjacent divider ends slide toward the joint on heating. Cap fixed to A only.'
});
const finite=(name,x)=>{if(!Number.isFinite(x))throw Error(`${name} must be finite`);};
export function movement(p=inputs) {
  for(const name of ['lengthA','lengthB','installedGap','combinedPositionAllowance','installationC','minimumMetalC','maximumMetalC','alphaPerK'])finite(name,p[name]);
  if(p.lengthA<=0||p.lengthB<=0||p.installedGap<=0||p.alphaPerK<=0||p.combinedPositionAllowance<0)throw Error('Invalid dimensions or coefficient');
  if(p.minimumMetalC>p.installationC||p.maximumMetalC<p.installationC)throw Error('Installation temperature must be within stated range');
  const activeLength=p.lengthA+p.lengthB;
  const hotClosure=activeLength*p.alphaPerK*(p.maximumMetalC-p.installationC);
  const coldOpening=activeLength*p.alphaPerK*(p.installationC-p.minimumMetalC);
  return {activeLength,hotClosure,coldOpening,
    minimumHotGap:p.installedGap-hotClosure-p.combinedPositionAllowance,
    maximumColdGap:p.installedGap+coldOpening+p.combinedPositionAllowance,
    relativeTravelHotToCold:hotClosure+coldOpening,
    geometricContactAvoided:p.installedGap-hotClosure-p.combinedPositionAllowance>0,
    waterTightness:'unknown',coverWeatherOverlap:'not selected',supportCapacity:'unknown'};
}
/** Only a counterexample's directed reachability. No head, elevation, capacity or safety credit. */
export function reachable(edges,start,destinations,removed=[]) {
  if(!Array.isArray(edges)||edges.some(e=>!Array.isArray(e)||e.length!==2||e.some(v=>typeof v!=='string'||!v)))throw Error('Invalid edge');
  if(typeof start!=='string'||!start||!Array.isArray(destinations)||destinations.length===0||destinations.some(v=>typeof v!=='string'||!v))throw Error('Invalid path query');
  if(!Array.isArray(removed)||removed.some(v=>typeof v!=='string'||!v))throw Error('Invalid obstruction');
  const unavailable=new Set(removed), seen=new Set(), todo=[start];
  while(todo.length){const n=todo.pop();if(unavailable.has(n)||seen.has(n))continue;seen.add(n);for(const [a,b]of edges)if(a===n)todo.push(b);}
  return destinations.filter(n=>seen.has(n));
}
export const pairOnly=[['A','P-A'],['P-A','OUT-A'],['B','P-B'],['P-B','OUT-B']];
export const localRelief=[...pairOnly,['A','R-A'],['R-A','SAFE-A'],['B','R-B'],['R-B','SAFE-B']];
export const commonReceiver=[['A','P-A'],['A','R-A'],['P-A','GULLY'],['R-A','GULLY'],['GULLY','OUT']];
export function derive(){
  return {authority:'Unadopted joint and route counterexample; a reachable path is necessary but NOT sufficient for safe drainage.',inputs,thermal:movement(),
    cases:[
      {id:'two-pipes-separated-by-divider',removed:['P-A'],from:'A',reachable:reachable(pairOnly,'A',['OUT-A','OUT-B'],['P-A']),meaning:'B pipe cannot back up compartment A across a solid divider.'},
      {id:'own-relief-primary-blocked',removed:['P-A'],from:'A',reachable:reachable(localRelief,'A',['OUT-A','SAFE-A'],['P-A']),meaning:'A separate local path exists topologically; its head/capacity/destination are not proved.'},
      {id:'own-primary-relief-blocked',removed:['R-A'],from:'A',reachable:reachable(localRelief,'A',['OUT-A','SAFE-A'],['R-A']),meaning:'Primary remains topologically reachable, not a hydraulic pass.'},
      {id:'shared-receiver-blocked',removed:['GULLY'],from:'A',reachable:reachable(commonReceiver,'A',['OUT'],['GULLY']),meaning:'Two outlets into one blocked receiver have no surviving route.'},
      {id:'both-local-inlets-blocked',removed:['P-A','R-A'],from:'A',reachable:reachable(localRelief,'A',['OUT-A','SAFE-A'],['P-A','R-A']),meaning:'Common inlet obstruction still requires a separate assessed final spill route.'}
    ]};
}
export const json=r=>JSON.stringify(r,(_k,v)=>{if(typeof v!=='number')return v;if(!Number.isFinite(v))throw Error('Nonfinite report');return Number(v.toPrecision(12));},2)+'\n';
export function render(r){
  const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
  const t=(x,y,s,z=3.8)=>`<text x="${x}" y="${y}" font-size="${z}">${esc(s)}</text>`;
  const line=(x,y,xx,yy)=>`<path d="M${x} ${y}L${xx} ${yy}" fill="none" stroke="black" stroke-width=".45"/>`;
  const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="black" stroke-width=".45"/>`;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="black">';
  s+=t(14,18,'Copper gutters: movement must not defeat backup drainage',6.2);
  s+=t(14,28,'RWT-METALS / 30 October 2026 / unadopted mechanism study / schematic, not to scale');
  s+=line(14,34,406,34)+t(14,45,'A   Two pipes are not a redundant pair across a solid expansion divider',4.8);
  s+=box(24,58,174,25)+box(206,58,174,25)+t(38,73,'Compartment A / trial 3000 mm')+t(220,73,'Compartment B / trial 3000 mm');
  s+=line(194,55,194,88)+line(210,55,210,88)+line(190,52,214,52)+t(162,99,'Capped movement break',3.5);
  s+=line(55,83,55,117)+line(350,83,350,117)+t(24,127,'P-A BLOCKED')+t(317,127,'P-B open');
  s+=line(46,100,64,113)+line(46,113,64,100)+t(107,119,'No cross-divider flow path to P-B.');
  s+=line(14,136,406,136)+t(14,147,'B   Give each compartment its own primary and separately routed relief',4.8);
  s+=box(24,158,174,20)+box(206,158,174,20)+t(53,171,'A: P-A + R-A')+t(237,171,'B: P-B + R-B');
  for(const x of [55,160,245,350])s+=line(x,178,x,198);
  s+=t(27,207,'Primary A')+t(133,207,'Relief A')+t(217,207,'Primary B')+t(323,207,'Relief B');
  s+=t(14,219,'Separate labels do not prove independent receivers. Check blocked ends and common backwater.');
  s+=t(14,228,'Every relief still needs a reachable crest, full failure-case flow and safe discharge below vulnerable fabric.');
  s+=line(14,235,406,235)+t(14,246,'C   Movement arithmetic / both outer ends fixed / adjacent ends slide',4.4);
  s+=t(14,257,`Trial metal -10 to +70 C; installed +20 C. Two 3 m lengths close the gap ${r.thermal.hotClosure.toFixed(3)} mm hot.`);
  s+=t(14,267,`12 mm installed gap minus 2 mm combined allowance leaves ${r.thermal.minimumHotGap.toFixed(3)} mm in this model.`);
  s+=t(14,277,'Not a climate specification, weather-lap proof or joint selection. Do not solder the sliding cover to both ends.');
  s+=t(14,288,'Source and exclusions: ../copper-assembly-candidates.md; copper-compartments.mjs and .test.mjs',3.3);
  return s+'</g></svg>\n';
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('Use no flag or --check');
  const dir=dirname(fileURLToPath(import.meta.url)),r=derive();
  for(const [name,value]of Object.entries({'copper-compartments.json':json(r),'copper-compartments.svg':render(r)})){
    const path=resolve(dir,name);if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),value,`${name} drift`);else writeFileSync(path,value);
  }
  console.log(json({thermal:r.thermal,cases:r.cases}));
}
