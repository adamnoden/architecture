/** Located threshold support comparison. Geometry only; all distances in mm. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
export const sources = Object.freeze([
  {path:'project/rwt/studies/segmented-copper-access.json', blob:'8e1a32d97118faa5697b1f77aaf1a4449a1c5733'},
  {path:'project/rwt/studies/raised-terminal-section.json', blob:'accba05df4cc394732dcbe8e95bdd375a45adca8'}
]);
export const trial = Object.freeze({supportTop:-185, flatDepth:100, archRing:215, rises:[75,150], normalAllowance:10});
const finite = (name,v) => { if (!Number.isFinite(v)) throw new RangeError(`${name} must be finite`); };
const positive = (name,v) => { finite(name,v); if (v<=0) throw new RangeError(`${name} must be positive`); };
const rounded = v => Number(v.toFixed(3));
export function gitBlob(text) {
  const b=Buffer.from(text); return createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
}
export function loadEvidence(base=root) {
  return sources.map(s => {
    const text=readFileSync(resolve(base,s.path),'utf8');
    assert.equal(gitBlob(text),s.blob,`${s.path} changed: reassess this historical comparison`);
    return JSON.parse(text);
  });
}
export function axisAt(y, {nearY,farY,nearAxis,farAxis}) {
  for (const [n,v] of Object.entries({y,nearY,farY,nearAxis,farAxis})) finite(n,v);
  if (farY<=nearY || y<nearY || y>farY) throw new RangeError('Station outside the positive crossing length');
  return nearAxis+(farAxis-nearAxis)*(y-nearY)/(farY-nearY);
}
export function arch({span,rise,ring,top}) {
  positive('span',span); positive('rise',rise); positive('ring',ring); finite('top',top);
  if (rise>span/2) throw new RangeError('Only minor segmental or semicircular arches supported');
  const radius=((span/2)**2+rise**2)/(2*rise);
  return {span,rise,ring,top,radius,centreZ:top-ring-radius,crown:top-ring,spring:top-ring-rise};
}
/** Upper-envelope checks only, within the vertical abutment lines and above the circle centre. */
export function clearance(a, {shape,offset,axisZ,width,height=width}, allowance=0) {
  finite('offset',offset); finite('axisZ',axisZ); positive('width',width); positive('height',height);
  finite('allowance',allowance); if (allowance<0) throw new RangeError('Negative clearance allowance');
  if (!['circle','box'].includes(shape) || (shape==='circle' && height!==width)) throw new RangeError('Invalid envelope shape');
  const half=width/2, lateral=Math.abs(offset);
  if (lateral+half>a.span/2) return {status:'outside-abutment-lines',gap:null,requiredDrop:null};
  if (axisZ-height/2<a.centreZ) throw new RangeError('Envelope outside upper-arc supported domain');
  const vertical=axisZ-a.centreZ;
  const gap=shape==='circle' ? a.radius-Math.hypot(lateral,vertical)-half
    : a.radius-Math.hypot(lateral+half,vertical+height/2);
  const targetRadius=a.radius-allowance-(shape==='circle'?half:0);
  const targetX=lateral+(shape==='box'?half:0);
  if (targetRadius<=targetX) return {status:'no-upper-arc-solution',gap,requiredDrop:null};
  const maxAxisZ=a.centreZ+Math.sqrt(targetRadius**2-targetX**2)-(shape==='box'?height/2:0);
  if (maxAxisZ-height/2<a.centreZ) return {status:'no-upper-arc-solution',gap,requiredDrop:null};
  return {status:gap>=allowance?'upper-envelope-only':'interference-or-insufficient-allowance',gap,
    requiredDrop:Math.max(0,axisZ-maxAxisZ),maxAxisZ};
}
export function derive([seg,raised]=loadEvidence()) {
  const p=seg.plan, s=raised.comparisonSlices;
  assert.deepEqual(p.axes,[5800,6200]);
  assert.deepEqual([p.courtThreshold.from,p.courtThreshold.to,p.room.from,p.room.to,p.gardenThreshold.from,p.gardenThreshold.to],
    [7750,8167.5,8167.5,11582.5,11582.5,12000]);
  assert.equal(p.oldOpening.width,p.oldOpening.to-p.oldOpening.from);
  assert.equal(p.room.length,p.room.to-p.room.from);
  assert.equal(s.nearY,p.courtThreshold.from); assert.equal(s.farY,p.gardenThreshold.to);
  assert.equal(s.undersidePlane,trial.supportTop-trial.flatDepth);
  const mid=(p.oldOpening.from+p.oldOpening.to)/2;
  const bodies=[{id:'bare-tube',shape:'circle',width:raised.catalogue.tubeSizeMm},
    {id:'intact-flange-box',shape:'box',width:raised.catalogue.listedEnvelopeMm[1]}];
  assert.equal(bodies[0].width,108); assert.equal(bodies[1].width,220);
  const stations=[p.courtThreshold.from,p.courtThreshold.to,p.gardenThreshold.from,p.gardenThreshold.to];
  const cases=trial.rises.map(rise=>{
    const a=arch({span:p.oldOpening.width,rise,ring:trial.archRing,top:trial.supportTop});
    return {rise,radius:rounded(a.radius),crown:a.crown,spring:a.spring,bodies:bodies.map(body=>{
      const checks=stations.flatMap(y=>p.axes.map(x=>{
        const axisZ=axisAt(y,s), args={...body,offset:x-mid,axisZ};
        const contact=clearance(a,args), reserve=clearance(a,args,trial.normalAllowance);
        assert.notEqual(contact.requiredDrop,null);
        return {x,y,axisZ:rounded(axisZ),normalGap:rounded(contact.gap),contactDrop:rounded(contact.requiredDrop),
          dropForIllustrativeAllowance:rounded(reserve.requiredDrop)};
      }));
      return {id:body.id,shape:body.shape,width:body.width,checks,
        controllingContactDrop:Math.max(...checks.map(c=>c.contactDrop)),
        controllingAllowanceDrop:Math.max(...checks.map(c=>c.dropForIllustrativeAllowance))};
    })};
  });
  return {authority:'Historical route plus authored structural alternatives. No capacity, safe water level or installed access acceptance.',
    sources, trial, plan:p, roomOpenableAreaM2:rounded(p.room.length*p.oldOpening.width/1e6),
    removedContinuousSlabLength:p.room.length, retainedThresholdBandsLength:p.courtThreshold.length+p.gardenThreshold.length,
    stationAxes:stations.map(y=>({y,z:rounded(axisAt(y,s))})),
    flatBridgeNearUpperGaps:bodies.map(b=>({id:b.id,gap:s.undersidePlane-s.nearAxis-b.width/2})),
    archCases:cases,
    actualSupportCapacity:null, actualAbutments:null, actualWaterBoundary:null, actualModuleRelease:null,
    actualReceiverLevel:null, acceptance:'not-established'};
}
export function render(r=derive()) {
  const escape=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const text=(x,y,t,size=3.4)=>`<text x="${x}" y="${y}" font-size="${size}">${escape(t)}</text>`;
  const path=(d,dash='')=>`<path d="${d}" fill="none" stroke="black" stroke-width=".45"${dash?' stroke-dasharray="'+dash+'"':''}/>`;
  const box=(x,y,w,h,dash='')=>path(`M${x},${y}h${w}v${h}h-${w}Z`,dash);
  let out='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g fill="black" font-family="Arial,sans-serif">';
  out+=text(14,17,'North drain route: keep the doorway supported during renewal',6);
  out+=text(14,26,'STR-HOUSE | 31 October 2026 | candidate geometry only; NOT construction or hydraulic acceptance',3.3);
  out+=path('M14,32H406');
  out+=text(14,43,'1  Longitudinal section: fixed threshold supports, independently openable room floor',4.2);
  const sy=y=>36+(y-7750)*.08, elev=z=>56-z*.09;
  for (const [key,label] of [['courtThreshold','court'],['room','3415 mm openable territory'],['gardenThreshold','garden']]) {
    const b=r.plan[key], x=sy(b.from), w=(b.to-b.from)*.08;
    out+=text(x+2,51,label,3.1);
    out+=path(`M${x},56h${w}`,key==='room'?'3 2':'');
    if(key!=='room') out+=box(x,elev(-185),w,9);
    else out+=box(x,elev(-185),w,9,'1 2');
  }
  out+=text(14,57,'FFL 0',3)+text(14,74,'-185',3)+text(14,83,'-285',3);
  for(const off of [-54,54]) out+=path(`M36,${elev(-420+off)}L376,${elev(-480+off)}`);
  out+=path(`M36,${elev(-420)}L376,${elev(-480)}`,'3 1');
  out+=text(111,87,'108 tube envelope / retained 60 mm fall: unadopted comparison',3.1);
  out+=text(17,101,'W2?',3)+text(379,101,'outlet?',3);
  out+=text(36,112,'7750')+text(71,112,'8167.5')+text(303,112,'11582.5')+text(367,112,'12000');
  out+=text(17,119,'Dotted slab: incompatible with top access unless replaced by an actual supported opening/cover system.',3.2);
  out+=path('M14,122H406');
  out+=text(14,133,'2  Transverse alternatives at the near interface: common support top z -185',4.2);
  const sc=.09, zToY=z=>145+(-185-z)*sc;
  // Deliberately separate panels use the same x/z scale; no member size is approved.
  out+=box(36,145,58.5,9)+text(30,142,'100-deep flat comparator',3.3);
  for (const offset of [-200,200]) {
    const cx=65.25+offset*sc, cy=zToY(-420);
    out+=`<circle cx="${cx}" cy="${cy}" r="${54*sc}" fill="none" stroke="black" stroke-width=".45"/>`;
    out+=box(cx-110*sc,cy-110*sc,220*sc,220*sc,'1.5 1');
  }
  out+=text(22,209,'Bare tube: 81 mm upper gap.',3.1)+text(22,216,'220 box: 25 mm; not tool clearance.',3.1);
  out+=text(22,223,'Bending/tension and capacity unresolved.',3.1);
  for (const [i,rise] of trial.rises.entries()) {
    const a=arch({span:650,rise,ring:215,top:-185}), cx=204+i*135;
    const angle=Math.asin(325/a.radius), inner=[],outer=[];
    for (let j=0;j<=32;j++) { const t=-angle+2*angle*j/32;
      inner.push([cx+Math.sin(t)*a.radius*sc,zToY(a.centreZ+Math.cos(t)*a.radius)]);
      outer.push([cx+Math.sin(t)*(a.radius+215)*sc,zToY(a.centreZ+Math.cos(t)*(a.radius+215))]); }
    const coords=[...inner,...outer.reverse()];
    out+=path(coords.map((p,j)=>`${j?'L':'M'}${p.map(v=>v.toFixed(3)).join(',')}`).join('')+'Z');
    out+=text(cx-48,142,`215 radial ring / ${rise} rise`,3.3);
    for (const offset of [-200,200]) {
      const px=cx+offset*sc, py=zToY(-420);
      out+=`<circle cx="${px}" cy="${py}" r="${54*sc}" fill="none" stroke="black" stroke-width=".45"/>`;
      out+=box(px-110*sc,py-110*sc,220*sc,220*sc,'1.5 1');
    }
    const c=r.archCases[i];
    out+=text(cx-51,209,`Bare-tube contact drop: ${c.bodies[0].controllingContactDrop.toFixed(1)} mm.`,3.1);
    out+=text(cx-51,216,`220-box clearance bound: ${c.bodies[1].controllingContactDrop.toFixed(1)} mm.`,3.1);
    out+=text(cx-51,223,'Arch thrust / abutments NOT resolved.',3.1);
  }
  out+=text(17,235,'Solid circles: 108 bare tube. Dashed squares: 220 catalogue bounding box, NOT a declared flange shape.',3.2);
  out+=text(17,243,'All contact drops have ZERO reserve; actual supports, seals, tools and movement need more space.',3.2);
  out+=path('M14,250H406');
  out+=text(14,261,'3  Water, support and occupation remain controlling',4.1);
  out+=text(20,271,'Lowering the route is not a free fix: re-derive collector, outfall, leak escape and safe maintenance levels.',3.3);
  out+=text(20,279,'Whole-house raising leaves pipe-versus-support interference unchanged. No new house datum is selected.',3.3);
  out+=text(14,290,'Read ../north-drainage-support-result.md. Permanent support is retained; the wet assembly and removal path remain unaccepted.',2.9);
  return out+'</g></svg>\n';
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if (args.length>1 || args.some(a=>!['--write','--check'].includes(a))) throw new Error('Use --write, --check, or no argument');
  const result=derive(), svg=render(result), target=resolve(here,'north-drainage-support.svg');
  if (args[0]==='--write') writeFileSync(target,svg);
  if (args[0]==='--check') assert.equal(readFileSync(target,'utf8'),svg,'Support sheet needs regeneration');
  console.log(JSON.stringify(result,null,2));
}
