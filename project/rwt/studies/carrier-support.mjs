/** Finite RWT comparison; not hydraulic, pipework or structural approval. Units: mm, N, MPa. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import assert from 'node:assert/strict';

export const inputs = Object.freeze({
  run:4250, fall:60, endProjection:100, endStation:175,
  carrier:{product:'Radius VS2751 / black PE100 SDR17 / 6 m straight',odMin:110,odMax:110.7,wallMin:6.6,wallMax:7.4,boreMin:95.2,boreMax:97.5,handlingMassKgM:2.3},
  sleeve:{product:'Radius VS3050 / black PE100 SDR17 / dimensional comparator only',odMin:180,odMax:181.1,boreMin:156.2,boreMax:159.7},
  spacer:{family:'PSI CaseX DSI PA/PE 4',carrierMin:106.6,carrierMax:120,skid:16,part:'3-001-01028',rejectedSkid:25,rejectedPart:'3-001-01029'},
  modulusReference:160, modulusSensitivity:80, waterDensityKgM3:1000, gravity:9.80665,
  adverseDifferentialMm:3, stationZoneMm:100, originalEccentricityMm:5,
});
const positive=(name,n)=>{if(!Number.isFinite(n)||n<=0)throw Error(`${name} must be finite and positive`);};
export function beam(span, modulus, load, inertia, chordSlope, adverseDifference=0) {
  for(const [name,value] of Object.entries({span,modulus,load,inertia,chordSlope}))positive(name,value);
  if(!Number.isFinite(adverseDifference)||adverseDifference<0)throw Error('adverse difference must be finite and nonnegative');
  const sag=5*load*span**4/(384*modulus*inertia);
  const endpointRotation=load*span**3/(24*modulus*inertia);
  const residual=chordSlope-adverseDifference/span-endpointRotation;
  return {span,modulus,sag,endpointRotation,residualDownhillMmM:residual*1000,monotoneInThisModel:residual>0};
}
export function displacement(x,span,modulus,load,inertia) {
  if(!Number.isFinite(x)||x<0||x>span)throw Error('position outside span');
  return load*x*(span**3-2*span*x*x+x**3)/(24*modulus*inertia);
}
export function derive(p=inputs) {
  const c=p.carrier,s=p.sleeve;
  for(const [name,value] of Object.entries({run:p.run,fall:p.fall,endStation:p.endStation,od:c.odMin,wall:c.wallMin}))positive(name,value);
  if(p.endStation*2>=p.run||c.wallMin*2>=c.odMin)throw Error('invalid support or pipe geometry');
  const inertia=Math.PI/64*(c.odMin**4-(c.odMin-2*c.wallMin)**4);
  const waterMassKgM=p.waterDensityKgM3*Math.PI*(c.boreMax/1000)**2/4;
  const load=(c.handlingMassKgM+waterMassKgM)*p.gravity/1000;
  const slope=p.fall/p.run;
  const cases=[2500,1250,487.5].map(span=>beam(span,p.modulusReference,load,inertia,slope));
  const spacingSearch=Array.from({length:18},(_,i)=>i+3).map(count=>{
    const pitch=(p.run-2*p.endStation)/(count-1);
    const intact=beam(pitch,p.modulusSensitivity,load,inertia,slope,p.adverseDifferentialMm);
    const oneInactive=beam(pitch*2,p.modulusSensitivity,load,inertia,slope,p.adverseDifferentialMm);
    return {count,pitch,intact,oneInactive,eligible:intact.monotoneInThisModel&&oneInactive.monotoneInThisModel};
  });
  const candidate=spacingSearch.find(x=>x.eligible);
  if(!candidate)throw Error('No candidate satisfies the stated finite sensitivity screen');
  const stations=Array.from({length:candidate.count},(_,i)=>p.endStation+i*candidate.pitch);
  const ringEnvelope=c.odMax+2*p.spacer.skid; // Ideal radial projection only, NOT measured bolt/clocking envelope.
  const lowerGap=(s.boreMin-c.odMax)/2-p.originalEccentricityMm;
  const clearance={bareConcentricRadialMin:(s.boreMin-c.odMax)/2,originalEccentricLowerGap:lowerGap,
    ideal16Envelope:ringEnvelope,ideal16ConcentricRadialRemaining:(s.boreMin-ringEnvelope)/2,
    ideal16RemainingAtOriginalEccentricity:(s.boreMin-ringEnvelope)/2-p.originalEccentricityMm,
    idealGravityOffsetMin:(s.boreMin-c.odMax)/2-p.spacer.skid,
    idealGravityOffsetMax:(s.boreMax-c.odMin)/2-p.spacer.skid,
    ideal25SmallestEnvelope:c.odMin+2*p.spacer.rejectedSkid,
    ideal25BestDiametralClearance:s.boreMax-c.odMin-2*p.spacer.rejectedSkid};
  const twoInactive=beam(candidate.pitch*3,p.modulusSensitivity,load,inertia,slope,p.adverseDifferentialMm);
  return {authority:'Unadopted finite support/clearance screen. No installed assembly, allowable tolerance or safe drainage pass.',
    inputs:p,inertia,waterMassKgM,load,chordFallMmM:slope*1000,cases,
    spacingSearch,candidate:{countPerCarrier:candidate.count,countForTwo:2*candidate.count,pitch:candidate.pitch,stations,
      intact:candidate.intact,oneInactive:candidate.oneInactive,twoInactive,
      assumedAxialZone:p.stationZoneMm,clearEndTerritory:p.endStation-p.stationZoneMm/2,
      terminalTailToBodyEnd:p.endStation+p.endProjection,
      terminalCondition:'Independent accessible end supports required; end cantilevers, fittings and seal loads NOT analysed.'},clearance,
    unresolved:['Actual ring collar/bolt dimensions, clocking, bearing and installed centreline',
      'Radius approval of casing spacer contact and sustained load/temperature modulus',
      'Sleeve burial, ovality, settlement, continuous support and tell-tale drainage',
      'Pressure-rated removable court annular seal, tool access and independent terminal supports',
      'Loaded installation/withdrawal force and joint-free replacement',
      'Inlets, capacity, hydraulic head, first vulnerable fabric and actual receiving water']};
}
const fmt=(n,d=2)=>n.toFixed(d);
export function render(r) {
  const a=r.candidate;
  const text=(x,y,s,size=3.4)=>`<text x="${x}" y="${y}" font-size="${size}">${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}</text>`;
  const line=(x,y,x2,y2,extra='')=>`<path d="M${x},${y}L${x2},${y2}" fill="none" stroke="black" stroke-width=".35" ${extra}/>`;
  let v='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="black">';
  v+=text(12,16,'North court carrier | support and renewal subassembly',6);
  v+=text(12,24,'30 October 2026 | Unadopted development study | mm unless stated | not for construction');
  v+=line(12,29,408,29)+text(12,39,'A   Located support stations along each 4250 crossing',4.2);
  const X=s=>28+s*.08;
  v+=line(X(0),65,X(4250),65)+line(X(-100),70,X(4350),70);
  for(const s of a.stations){v+=`<rect x="${X(s-50)}" y="54" width="8" height="20" fill="none" stroke="black" stroke-width=".35"/>`;v+=text(X(s)-4,82,`${s}`,2.8);}
  v+=line(X(0),48,X(0),75)+line(X(4250),48,X(4250),75);
  v+=text(12,92,`${a.countPerCarrier} support stations per carrier; ${a.countForTwo} for two carriers; ${a.pitch} centre pitch. Longitudinal scale 1:12.5.`);
  v+=text(12,100,'Rectangles reserve 100 axial each, not actual ring profiles. First/last station 175 from sleeve end.');
  v+=text(12,108,'125 clear end territory; 275 to projecting pipe end needs separate external support. No seal is a support.');
  v+=line(12,116,408,116)+text(12,127,'B   Gravity-profile screen, not a hydraulic capacity calculation',4.2);
  const rows=[['Span','E / MPa','Sag / mm','Worst downhill / mm/m','Screen'],
    ...r.cases.map(x=>[`${x.span}`,`${x.modulus}`,fmt(x.sag),fmt(x.residualDownhillMmM),x.monotoneInThisModel?'positive':'reverse fall']),
    ...[['Intact',a.intact],['One inactive',a.oneInactive],['Two inactive',a.twoInactive]].map(([label,x])=>[`${x.span} (${label})`,`${x.modulus}`,fmt(x.sag,3),fmt(x.residualDownhillMmM),x.monotoneInThisModel?'positive':'reverse fall'])];
  rows.forEach((row,i)=>row.forEach((s,j)=>{v+=text([12,113,158,213,333][j],138+i*8,s,3.3);}));
  v+=text(12,199,'80 MPa and 3 mm adverse endpoint differential are authored sensitivities, not certified design limits.');
  v+=text(12,207,'Simply supported uniform full-water load; large sag rows are rejection screens, not physical predictions.');
  v+=line(12,215,408,215)+text(12,226,'C   Product geometry and removal boundary',4.2);
  v+=text(12,236,'Carrier: Radius VS2751 / 110 SDR17; sleeve comparator: VS3050 / 180 SDR17.');
  v+=text(12,244,'Published OD 110.0-110.7; sleeve bore 156.2-159.7. Use delivered circularity, not nominal 160.');
  v+=text(12,252,`PSI PA/PE 4, 16 skid: ideal envelope ${fmt(r.clearance.ideal16Envelope,1)}; minimum radial remainder ${fmt(r.clearance.ideal16ConcentricRadialRemaining)}.`);
  v+=text(12,260,'25 skid: smallest ideal envelope 160 exceeds best listed 159.7 bore. Not a viable nominal substitution.');
  v+=text(12,268,'16 skid is a candidate only: bolts, actual profile, contact clocking and seal movement remain unverified.');
  v+=text(12,280,'Keep 5250 x 1600 exterior withdrawal territory; remove end coupling/seal first; preserve visible annular drain.');
  v+=text(12,289,'Read ../carrier-support.md and executable source for evidence, assumptions and exclusions. RWT-06 remains open.',3.1);
  return v+'</g></svg>\n';
}
function gitBlob(raw){return createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex');}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=dirname(fileURLToPath(import.meta.url));
  const raw=readFileSync(resolve(root,'north-court-carrier.json'));
  assert.equal(gitBlob(raw),'e516ebb375a2120a300e05bd869e7edcbb28f2c8','Reassess changed north-trial evidence; do not silently regenerate');
  const trial=JSON.parse(raw);
  assert.equal(trial.run,inputs.run);assert.equal(trial.trial.fall,inputs.fall);assert.equal(trial.trial.endProjection,inputs.endProjection);
  const result={...derive(),subject:{path:'project/rwt/studies/north-court-carrier.json',blob:gitBlob(raw),sourceId:trial.sourceId,
    boundary:'Applies to the dated unadopted north comparison only, not proof of current-house adoption or freshness of its historical prose fingerprints.'}};
  const outputs={'carrier-support.json':JSON.stringify(result,null,2)+'\n','carrier-support.svg':render(result)};
  if(process.argv.some(x=>!['--check'].includes(x)&&x.startsWith('--')))throw Error('Use --check or no flag');
  for(const [name,content] of Object.entries(outputs)) {
    const path=resolve(root,name);
    if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),content,`${name} needs regeneration`);
    else writeFileSync(path,content);
  }
  console.log(JSON.stringify({count:result.candidate.countPerCarrier,pitch:result.candidate.pitch,oneInactive:result.candidate.oneInactive,clearance:result.clearance},null,2));
}
