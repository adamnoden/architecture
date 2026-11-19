/** RWT material/terminal comparison. mm, N, MPa. Not an installed assembly approval. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {beam,derive as derivePE,inputs as pe,reportJson} from './carrier-support.mjs';

export const sourceBlob='a351d1ab5d8f8dba38829a341e91b10762d42e7a';
export const pvc=Object.freeze({product:'Marley UL406 solid-wall PVC-U / 6 m double spigot',od:110,odMax:110.3,listedWall:3.2,listedMassKgM:1.7,referenceModulus:900,sensitivityModulus:450,skid:16});
export const terminal=Object.freeze({projection:200,centreOutside:75,contactWidth:60,couplingLength:128,couplingOverlap:64,toolAllowance:80,courtAccess:600,handlingAllowance:800});
const positive=(name,n)=>{if(!Number.isFinite(n)||n<=0)throw Error(`${name} must be finite and positive`);};
export function section(od,wall,mass,bore) {
  for(const [k,v] of Object.entries({od,wall,mass,bore}))positive(k,v);
  if(wall*2>=od||bore>=od+1)throw Error('Invalid section geometry');
  const inertia=Math.PI/64*(od**4-(od-2*wall)**4);
  const waterMass=1000*Math.PI*(bore/1000)**2/4;
  return {inertia,waterMass,load:(mass+waterMass)*pe.gravity/1000};
}
/** Required effective longitudinal EI; null means adverse levels already defeat gravity. */
export function requiredEI(span,load,slope,difference=3) {
  for(const [k,v] of Object.entries({span,load,slope}))positive(k,v);
  if(!Number.isFinite(difference)||difference<0)throw Error('Invalid endpoint difference');
  const availableSlope=slope-difference/span;
  return availableSlope<=0?null:load*span**3/(24*availableSlope);
}
export function evaluate(count,modulus,missed=1) {
  if(!Number.isInteger(count)||count<3||count>100)throw Error('Invalid support count');
  if(!Number.isInteger(missed)||missed<0||missed>count-2)throw Error('Invalid inactive interior count');
  const pitch=(pe.run-2*pe.endStation)/(count-1);
  const s=section(pvc.od,pvc.listedWall,pvc.listedMassKgM,pvc.odMax-2*pvc.listedWall);
  const intact=beam(pitch,modulus,s.load,s.inertia,pe.fall/pe.run,pe.adverseDifferentialMm);
  const adverse=beam((missed+1)*pitch,modulus,s.load,s.inertia,pe.fall/pe.run,pe.adverseDifferentialMm);
  return {count,pitch,modulus,missed,intact,adverse,passesScreen:intact.monotoneInThisModel&&adverse.monotoneInThisModel};
}
/** Axial reservation, not matched installed socket engagement or a support/load proof. */
export function endGeometry(t=terminal) {
  for(const [k,v] of Object.entries(t))positive(k,v);
  if(t.couplingOverlap>=t.couplingLength)throw Error('Coupling overlap exceeds length');
  const supportNear=t.centreOutside-t.contactWidth/2;
  const supportFar=t.centreOutside+t.contactWidth/2;
  const couplingNear=t.projection-t.couplingOverlap;
  const gap=couplingNear-supportFar;
  const parkingExtent=t.projection+t.couplingLength+t.toolAllowance;
  return {support:[supportNear,supportFar],couplingOnCarrier:[couplingNear,t.projection],gap,
    fitsSeparated:supportNear>=0&&gap>0,
    adjacentSpan:pe.endStation+t.centreOutside,unsupportedEndToCentre:t.projection-t.centreOutside,
    fixedStubParking:t.couplingLength,parkingExtent,courtRemainder:t.courtAccess-parkingExtent,
    bodyLength:pe.run+2*t.projection,externalWithdrawal:pe.run+2*t.projection+t.handlingAllowance};
}
export function derive() {
  const bore=pvc.odMax-2*pvc.listedWall;
  const s=section(pvc.od,pvc.listedWall,pvc.listedMassKgM,bore);
  const slope=pe.fall/pe.run;
  const previous=derivePE();
  const search=Array.from({length:18},(_,i)=>evaluate(i+3,pvc.sensitivityModulus));
  const candidate=search.find(x=>x.passesScreen);
  if(!candidate)throw Error('No passing candidate in finite family');
  const thresholds=[5,6,7,8,9].map(count=>{
    const pitch=(pe.run-2*pe.endStation)/(count-1);
    const required=[pitch,2*pitch].map(span=>requiredEI(span,s.load,slope,pe.adverseDifferentialMm));
    const stiffness=required.some(x=>x===null)?null:Math.max(...required);
    return {count,pitch,requiredEffectiveEI:stiffness,equivalentModulus:stiffness===null?null:stiffness/s.inertia};
  });
  const ends=endGeometry();
  const terminalScreen=beam(ends.adjacentSpan,pvc.sensitivityModulus,s.load,s.inertia,slope,pe.adverseDifferentialMm);
  return {authority:'Development preference only. Moduli, endpoint difference, wall/mass and terminal reservations are not delivered-product or installed-system guarantees.',
    source:{model:'carrier-support.mjs',blob:sourceBlob,main:'27b32f233983219c287e5bb3c03cabfb9646b0b2'},
    unchanged:{run:pe.run,fall:pe.fall,firstRing:pe.endStation,sleeveBore:[pe.sleeve.boreMin,pe.sleeve.boreMax]},
    pvc,section:{...s,comparisonBore:bore},thresholds,
    comparisons:[{material:'PE prior sensitivity',count:previous.candidate.countPerCarrier,pitch:previous.candidate.pitch,modulus:80,adverse:previous.candidate.oneInactive},
      {material:'PVC generic lower creep reference, not Marley rating',...evaluate(6,900)},
      {material:'PVC half-reference sensitivity fails at seven',...evaluate(7,450)},
      {material:'PVC half-reference candidate',...candidate},
      {material:'PVC two inactive supports counterexample',...evaluate(candidate.count,450,2)}],
    candidate:{countPerCarrier:candidate.count,countForTwo:candidate.count*2,pitch:candidate.pitch,
      stations:Array.from({length:candidate.count},(_,i)=>pe.endStation+i*candidate.pitch),
      ringReductionFromPE:previous.candidate.countForTwo-candidate.count*2,
      idealRadialClearance:(pe.sleeve.boreMin-pvc.odMax-2*pvc.skid)/2,
      independentTerminalSupportsForTwo:4},
    terminal:{inputs:terminal,...ends,screen:terminalScreen,
      oldProjectionSameReservations:endGeometry({...terminal,projection:100}),
      supportAtSleeveMouth:{span:pe.endStation,rigidResidualMmM:(slope-pe.adverseDifferentialMm/pe.endStation)*1000,
        requiredEI:requiredEI(pe.endStation,s.load,slope,pe.adverseDifferentialMm)},
      maximumDifferenceAtCandidateSpan:ends.adjacentSpan*(slope-terminalScreen.endpointRotation),
      exclusions:'This isolated span screen excludes continuous-beam/terminal moments, overhang and coupling loads, bracket/base design, engagement, pressure seal and actual tool travel.'},
    decision:'Prioritise solid-wall gravity PVC-U with eight ring stations for matched-assembly development; retain PE as fallback. No adoption or RWT-06 completion.',
    unresolved:['Marley effective longitudinal stiffness and delivered wall/mass; generic PVC modulus cannot approve UL406',
      'Actual ring dimensions, contact, retention and loaded pull force',
      'Installed end coupling engagement, independent supports, pressure-qualified court seal and outward annular drainage',
      'Structure, hydraulic capacity, threshold boundary and real-site receiving levels']};
}
export function render(r) {
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const text=(x,y,s,size=3.3)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`;
  const line=(x,y,a,b)=>`<path d="M${x},${y}L${a},${b}" fill="none" stroke="black" stroke-width=".3"/>`;
  const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="black" stroke-width=".35"/>`;
  let v='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="black">';
  v+=text(12,16,'Conventional carrier | support and terminal comparison',6)+text(12,25,'30 October 2026 / RWT-06 / development comparison only / mm / not for construction');
  v+=line(12,31,408,31)+text(12,42,'A   Same 4250 crossing; PVC-U solid wall instead of PE100',4.2);
  const X=x=>24+x/12.5;
  v+=line(X(0),65,X(pe.run),65);
  r.candidate.stations.forEach(s=>{v+=rect(X(s-50),54,8,19)+text(X(s)-5,83,s.toFixed(1),2.8);});
  v+=text(12,96,`Eight rings per carrier at ${r.candidate.pitch.toFixed(2)} centres; 16 total, versus previous 22. Four end supports remain.`);
  v+=text(12,104,'100 axial ring zones are reservations, not measured PSI collars. Longitudinal scale 1:12.5.');
  v+=line(12,112,408,112)+text(12,123,'B   Conditional fall screen / 3 mm adverse end difference / one inactive ring',4.2);
  const rows=[['Case','E MPa','Rings','Residual mm/m'],['PE previous','80','11',r.comparisons[0].adverse.residualDownhillMmM.toFixed(3)],
    ['PVC reference','900','6',r.comparisons[1].adverse.residualDownhillMmM.toFixed(3)],
    ['PVC sensitivity','450','7',r.comparisons[2].adverse.residualDownhillMmM.toFixed(3)],
    ['PVC candidate','450','8',r.comparisons[3].adverse.residualDownhillMmM.toFixed(3)],
    ['PVC two inactive','450','8',r.comparisons[4].adverse.residualDownhillMmM.toFixed(3)]];
  rows.forEach((row,i)=>row.forEach((s,j)=>{v+=text([12,125,206,282][j],135+i*8,s);}));
  v+=text(12,186,'900 is generic PVC creep reference; 450 is authored sensitivity. Neither is a Marley product rating.');
  v+=line(12,193,408,193)+text(12,204,'C   Accessible terminal / axial development reservation, 1:2',4.2);
  const T=x=>235-x/2;
  v+=line(T(0),225,T(408),225)+line(T(0),215,T(0),239);
  v+=rect(T(105),216,30,18)+rect(T(264),218,64,14);
  v+=text(T(105),245,'60 support',3.1)+text(T(264),245,'UE405 / 128',3.1)+text(243,224,'Sleeve mouth',3.1);
  v+=text(12,256,'Support centre 75 out; pipe projects 200; assumed coupling overlap 64; clear axial gap 31.');
  v+=text(12,264,'128 fixed-stub parking + 80 tool territory gives 408 reach; 192 remains inside the 600 court access trial.');
  v+=text(12,272,'Pipe body increases to 4650; exterior withdrawal becomes 5450 x 1600. No hidden corridor reduction.');
  v+=text(12,282,'End supports at the sleeve mouth fail the 3 mm / 175 span case regardless of pipe stiffness.');
  v+=text(12,290,'Coupling engagement, ring retention, seal, terminal loads and hydraulics remain unresolved. Read ../conventional-carrier.md.',3);
  return v+'</g></svg>\n';
}
export function checkSource(path=resolve(dirname(fileURLToPath(import.meta.url)),'carrier-support.mjs')) {
  const raw=readFileSync(path);const hash=createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');
  assert.equal(hash,sourceBlob,'Reassess changed support model before comparison');return hash;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.slice(2).some(x=>x!=='--check'))throw Error('Use --check or no arguments');
  checkSource();const r=derive(),root=dirname(fileURLToPath(import.meta.url));
  for(const [name,content] of Object.entries({'conventional-carrier.json':reportJson(r),'conventional-carrier.svg':render(r)})){
    const path=resolve(root,name);
    if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),content,`${name} needs regeneration`);
    else writeFileSync(path,content);
  }
  console.log(reportJson({candidate:r.candidate,terminal:r.terminal,thresholds:r.thresholds}));
}
