/** Bounded section comparison, not an engineered floor or permission to omit a membrane. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

export const basis = Object.freeze({
  sourceCommit: 'd81aab99cd8900395deffc16a26f1490fb9658f6',
  sourceBlobs: {
    'compiler/reference-house/georgian/section-source.ts': '1617867dc3441206c116ddf877dcfd5ba89fb5a4',
    'compiler/reference-house/georgian/section-exemplar.ts': '75bf5c749da5095c07eed46105817a79095ca418'
  },
  authority: 'Authored alternative section; no house adoption, capacity, material or membrane-omission acceptance.',
  wall: {outer:102.5, cavity:160, innerIncludingFinish:155},
  groundReserve:300,
  // These are deliberately unselected arithmetic probes, not an approved product build-up.
  layers: {finish:15, distribution:65, insulation:100, structure:150},
  voids: {guidanceComparison:150, supplierComparison:225, drawnTrial:300},
  trial: {mineralDpcBand:150, ventClearBore:100, topGap:20, bottomGap:30},
  oldExternalGroundBelowFfl:150
});

function nonnegative(name, n) {
  if (!Number.isFinite(n) || n < 0) throw new RangeError(`${name}: finite nonnegative number required`);
}
export function stackDepth({finish, distribution, insulation, structure, voidDepth}) {
  const inputs = {finish, distribution, insulation, structure, voidDepth};
  Object.entries(inputs).forEach(([key,value]) => nonnegative(key,value));
  if (structure === 0 || voidDepth === 0) throw new RangeError('Suspended comparison requires positive structure and void');
  return finish + distribution + insulation + structure + voidDepth;
}
export function ventBudget({voidDepth, dpcBand, clearBore, topGap, bottomGap, completeDuctEnvelope}) {
  Object.entries({voidDepth,dpcBand,clearBore,topGap,bottomGap}).forEach(([k,v]) => nonnegative(k,v));
  if (clearBore === 0) throw new RangeError('Clear bore must be positive');
  if (completeDuctEnvelope !== null) {
    nonnegative('completeDuctEnvelope',completeDuctEnvelope);
    if (completeDuctEnvelope < clearBore) throw new RangeError('Complete duct cannot be smaller than its clear bore');
  }
  const residualBeyondBore = voidDepth - dpcBand - clearBore - topGap - bottomGap;
  return {residualBeyondBore,
    completeEnvelopeResidual: completeDuctEnvelope === null ? null : voidDepth-dpcBand-completeDuctEnvelope-topGap-bottomGap,
    completeDuctFit:'not-established',
    scope:'One straight below-DPC route only; body, cavity crossing, support, free area and water protection remain unqualified.'};
}
export function relativeRaise(totalDepth, fixedSolumBelowOldFfl) {
  nonnegative('totalDepth',totalDepth); nonnegative('fixedSolumBelowOldFfl',fixedSolumBelowOldFfl);
  return Math.max(0,totalDepth-fixedSolumBelowOldFfl);
}
export function derive() {
  const stack = Object.values(basis.layers).reduce((a,b)=>a+b,0);
  const cases=Object.fromEntries(Object.entries(basis.voids).map(([name,voidDepth])=>{
    const depth=stackDepth({...basis.layers,voidDepth});
    return [name,{voidDepth,totalDepth:depth,excessOverReserve:depth-basis.groundReserve,
      relativeRaiseAtFixedOldGround:relativeRaise(depth,basis.oldExternalGroundBelowFfl)}];
  }));
  const t=basis.trial;
  return {authority:basis.authority, sourceCommit:basis.sourceCommit, sourceBlobs:basis.sourceBlobs,
    wallTotal:Object.values(basis.wall).reduce((a,b)=>a+b,0),floorStack:stack,cases,
    straightVentBoreOnlyMinimum:t.mineralDpcBand+t.ventClearBore,
    drawnVent:ventBudget({voidDepth:basis.voids.drawnTrial,dpcBand:t.mineralDpcBand,clearBore:t.ventClearBore,
      topGap:t.topGap,bottomGap:t.bottomGap,completeDuctEnvelope:null}),
    trialDpcLowerEdgeClearance:cases.drawnTrial.totalDepth-stack-t.mineralDpcBand,
    membraneOmission:'not-established; actual site, ground gas, floor and junction evidence required',
    serviceAccess:'not-established; ventilation space is not a renewal route',
    excluded:['Floor load/span, concrete constituents and reinforcement exposure',
      'Qualified mineral DPC and its bearing, bedding and controlling datum',
      'Actual insulation, finishes, separators and thermal/air continuity',
      'Duct body, grille, cavity crossing, distribution and airflow',
      'Groundwater, gas, heave, flood and lawful passive discharge',
      'Thresholds, accessible approach and complete service intervention']};
}
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function render() {
  const d=derive();
  const txt=(x,y,t,size=3.4)=>`<text x="${x}" y="${y}" font-size="${size}">${escape(t)}</text>`;
  const line=(x1,y1,x2,y2,dash=false)=>`<path d="M${x1},${y1}L${x2},${y2}" fill="none" stroke="black" stroke-width=".35"${dash?' stroke-dasharray="2 1"':''}/>`;
  const rect=(x,y,w,h,fill='none',dash=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="black" stroke-width=".35"${dash?' stroke-dasharray="2 1"':''}/>`;
  const dim=(x,y1,y2,t)=>line(x,y1,x,y2)+line(x-1.5,y1,x+1.5,y1)+line(x-1.5,y2,x+1.5,y2)+txt(x+2,(y1+y2)/2+1,t,3);
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="black">';
  s+=txt(14,17,'Raised suspended floor: challenge the need for the membrane',6);
  s+=txt(14,26,'MAT-ENVELOPE | 31 October 2026 | comparison, NOT construction | dimensions in mm',3.5)+line(14,32,406,32);
  s+=txt(14,43,'A   Connected straight-wall trial',4.5);
  s+=txt(14,51,'Wall allocation source-bound; floor, DPC and ground positions are authored probes.',3.1);
  // Diagram at 1:10 geometrically, but bearing and DPC are unqualified reservations.
  const wallX=60, ffl=82, scale=.1;
  const ow=basis.wall.outer*scale, cw=basis.wall.cavity*scale, iw=basis.wall.innerIncludingFinish*scale;
  const ix=wallX+ow+cw, room=ix+iw, floorEnd=204;
  const floorBottom=ffl+d.floorStack*scale, solum=ffl+d.cases.drawnTrial.totalDepth*scale;
  s+=rect(wallX,59,ow,97,'#eeeeee')+rect(ix,59,iw,97,'#eeeeee');
  let y=ffl;
  for(const [key,depth] of Object.entries(basis.layers)) {
    const start=key==='structure'?ix+iw-10:room;
    s+=rect(start,y,floorEnd-start,depth*scale,key==='insulation'?'url(#hatch)':'white');
    y+=depth*scale;
  }
  s+=rect(wallX,floorBottom,ow,15,'white',true)+rect(ix,floorBottom,iw,15,'white',true);
  s+=txt(21,72,'OUTSIDE',3.3)+txt(143,72,'ROOM',3.3)+line(room,ffl,211,ffl)+txt(207,ffl-2,'FFL 0',3.1);
  s+=line(18,solum,wallX,solum)+line(room,solum,204,solum)+txt(17,solum+6,'G / solum -630: illustrative, not surveyed',3.1);
  const ventTop=floorBottom+15+2, ventBottom=ventTop+10;
  s+=rect(45,ventTop,room-45+10,10,'white',true)+line(39,(ventTop+ventBottom)/2,174,(ventTop+ventBottom)/2,true);
  s+=txt(18,163,'Dashed vent: 100 CLEAR bore only; its body / weathering / grille are unknown.',3.1);
  s+=txt(18,171,'Dashed DPC band: 150 nominal course territory; no grade, beds or datum approved.',3.1);
  s+=txt(18,179,'No tray, support fill, beam-end shield or loadbearing air opening is invented.',3.1);
  s+=line(18,ffl+30,210,ffl+30,true)+txt(17,ffl+29,'old 300 reserve',2.8);
  s+=dim(213,ffl,floorBottom,'330')+dim(213,floorBottom,solum,'300');
  s+=txt(130,88,'15 finish + 65 distribution',3)+txt(130,98,'100 insulation probe',3)+txt(130,108,'150 structure probe',3);
  s+=txt(118,123,'Ventilated void, NOT service access',3);
  s+=txt(18,187,'Bearing overlap is schematic; the 155 inner allocation includes finish, not only masonry.',3.1);
  s+=txt(18,194,'A duct larger than its bore consumes the remaining space. This is not a fit approval.',3.1);
  s+=line(230,39,230,194);
  s+=txt(241,43,'B   Depth is spent once',4.5);
  s+=txt(241,55,'Fixed floor-stack probe: 15 + 65 + 100 + 150 = 330',3.2);
  s+=txt(241,67,'Void comparison',3.3)+txt(309,67,'Total',3.3)+txt(351,67,'Beyond 300',3.3)+line(241,71,402,71);
  for(const [i,[label,c]] of [['AD C example',d.cases.guidanceComparison],['Supplier FAQ',d.cases.supplierComparison],['Drawn trial',d.cases.drawnTrial]].entries()) {
    const yy=81+i*12;
    s+=txt(241,yy,`${label}: ${c.voidDepth}`,3.2)+txt(309,yy,c.totalDepth,3.2)+txt(351,yy,c.excessOverReserve,3.2);
  }
  s+=txt(241,121,'150 DPC band + 100 clear duct already consumes 250.',3.1);
  s+=txt(241,129,'150 / 225 voids fail THIS straight below-band route.',3.1);
  s+=txt(241,137,'300 - 150 - 100 = 50 for body and all other spacing.',3.1);
  s+=txt(241,145,'Drawn 20 + 30 gaps spend that 50: no body margin.',3.1);
  s+=txt(241,157,'An offset or different DPC/vent arrangement is a new',3.1);
  s+=txt(241,165,'section, not permission to perforate the mineral DPC.',3.1);
  s+=txt(241,179,'No U-value, bearing, weather seal, ventilation layout',3.1);
  s+=txt(241,187,'or membrane-omission decision is established.',3.1);
  s+=line(14,199,406,199)+txt(14,211,'C   Conditions travel together',4.5);
  s+=txt(18,223,'GROUND   No sunken wet pit or pump dependency. Gas, heave and flood evidence remain site-specific.',3.4);
  s+=txt(18,233,'WALL        Mineral DPC must interrupt the actual support path; protect floor ends from lateral cavity water.',3.4);
  s+=txt(18,243,'FLOOR      Qualify the complete mineral structure, thermal edge, air closure and all retained constituents.',3.4);
  s+=txt(18,253,'SERVICES  Keep routine pipe renewal accessible; do not cut structural beams or count this void as a crawlway.',3.4);
  s+=line(14,267,406,267)+txt(14,278,'Decision: retain a suspended-floor alternative; do not delete the DPM from the existing slab arrangement.',3.6);
  s+=txt(14,288,'Source and limits: ../suspended-mineral-ground-floor.md | No geometry, material exception or packet completion is adopted.',3.1);
  return s+'</g><defs><pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0,4L4,0" stroke="#999" stroke-width=".2"/></pattern></defs></svg>\n';
}
export function verifySources(root) {
  for (const [path,expected] of Object.entries(basis.sourceBlobs)) {
    const bytes=readFileSync(resolve(root,path));
    const actual=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
    assert.equal(actual,expected,`Reassess changed section source: ${path}`);
  }
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if (args.length>1 || args.some(a=>a!=='--check')) throw new Error('Use --check or no argument');
  const dir=dirname(fileURLToPath(import.meta.url));
  verifySources(resolve(dir,'../../..'));
  for (const [name,content] of Object.entries({'suspended-ground-section.json':JSON.stringify(derive(),null,2)+'\n','suspended-ground-section.svg':render()})) {
    const path=resolve(dir,name);
    if (args.includes('--check')) assert.equal(readFileSync(path,'utf8'),content,`Regenerate ${name}`);
    else writeFileSync(path,content);
  }
  console.log('Suspended-floor comparison checked; no installed-system acceptance.');
}
