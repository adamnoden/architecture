/** B-plan cabinet and floor-closure geometry; no structural or firestop acceptance. */
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../../../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const blob = p => {
  const b = readFileSync(new URL(p, root));
  return createHash('sha1').update('blob ' + b.length + '\0').update(b).digest('hex');
};
const pins = {
  'project/str/studies/house-plan.json': 'd722ada30df5729852043f0010433a890e399999',
  'project/str/studies/house-supports.json': '0703a34f0a15b392b5cf534fd39f0d30fc9440e3',
  'project/str/studies/house-source.json': '47871731baee1a5bed113e1f6839a419620c6351',
  'project/had/had-03-family-bath-slider.md': '99038c32222fe4805c4de9d0a7220f49162d62d2',
  'project/had/studies/family-bath-slider.json': '56d77f0d98c0a3648396b682f1e2fd4a415a08f7',
  'project/had/studies/family-bath-slider.py': 'd82eb1eb647fba26757c92f762a463671755dec6',
};
for (const [p, sha] of Object.entries(pins)) assert.equal(blob(p), sha, 'Reassess changed source: ' + p);
const plan = JSON.parse(read('project/str/studies/house-plan.json'));
const support = JSON.parse(read('project/str/studies/house-supports.json'));
const source = JSON.parse(read('project/str/studies/house-source.json'));
const bay = support.service.illustrative_structural_service_bay;
const riser = support.service.riser_gross;
const cabinet = support.service.upper_cabinet_gross;
assert.deepEqual(bay, [9370,4650,700,800]);
assert.deepEqual(riser, [9410,4700,550,700]);
assert.deepEqual(cabinet, plan.first_objects['family-service-cabinet']);
const spine = plan.first_walls.find(w => w.id === 'wet-spine');
const door = spine.holes[0];
assert.deepEqual(door, [5450,6350]);
const {shell, envelope: E, court, levels} = source.sourceDimensions;
const radius = 300; // Same declared circular proxy as the joined B plan; not a person or clearance standard.
const had = JSON.parse(read('project/had/studies/family-bath-slider.json'));
const slider = had.authored_geometry_mm;
assert.equal(slider.body_diameter, radius*2);
assert.deepEqual(slider.raw_aperture, door);
assert.deepEqual(slider.leaf_open, [9156,4680,44,1000]);
const jambs = [
  {id:'slider-south-jamb',rectangle:[9215,door[0],170,slider.jamb_each]},
  {id:'slider-north-jamb',rectangle:[9215,slider.lining_clear[1],170,slider.jamb_each]},
];
const area = r => r[2] * r[3];
const intersectionArea = (a,b) => Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])) * Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));
const collar = [
  {side:'west', rectangle:[9370,4650,40,800]},
  {side:'east', rectangle:[9960,4650,110,800]},
  {side:'south', rectangle:[9410,4650,550,50]},
  {side:'north', rectangle:[9410,5400,550,50]},
];
assert.equal(collar.reduce((n,p) => n+area(p.rectangle),0), area(bay)-area(riser));
for (let i=0;i<collar.length;i++) for(let j=i+1;j<collar.length;j++) assert.equal(intersectionArea(collar[i].rectangle,collar[j].rectangle),0);

// Split the actual finite wall reservations at their actual openings.
const walls = plan.first_walls.flatMap(w => {
  const horizontal = w.a[1] === w.b[1];
  assert(horizontal || w.a[0] === w.b[0], 'Axis-aligned source walls only');
  const at = horizontal ? w.a[1] : w.a[0], lo = horizontal ? w.a[0] : w.a[1], hi = horizontal ? w.b[0] : w.b[1];
  const stops = [lo,...w.holes.flat(),hi].sort((a,b) => a-b);
  return stops.slice(0,-1).flatMap((v,i) => stops[i+1] > v && !w.holes.some(([l,u]) => v >= l && stops[i+1] <= u)
    ? [{id:w.id+':'+i, rectangle:horizontal ? [v,at-w.t/2,stops[i+1]-v,w.t] : [at-w.t/2,v,w.t,stops[i+1]-v]}] : []);
});
const fixed = [
  ...walls, ...jambs,
  {id:'court-with-wall-reservation',rectangle:[court.x-E,court.y-E,court.width+2*E,court.depth+2*E]},
  {id:'stair',rectangle:plan.stair}, {id:'void',rectangle:plan.void},
  ...Object.entries(plan.first_objects).filter(([id]) => id !== 'family-service-cabinet').map(([id,rectangle]) => ({id,rectangle})),
];
function segmentMargin(a,b,r) {
  assert(a.length === 2 && b.length === 2 && [...a,...b,...r].every(Number.isFinite));
  assert(a[0] === b[0] || a[1] === b[1], 'Only complete axis-aligned segments are checked');
  const dx = Math.max(r[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-r[0]-r[2],0);
  const dy = Math.max(r[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-r[1]-r[3],0);
  return Math.hypot(dx,dy)-radius;
}
function checkRoute(path, rectangle, state) {
  assert(['open','closed'].includes(state));
  const obstacles = [...fixed,{id:'cabinet',rectangle},
    {id:'slider-'+state,rectangle:slider['leaf_'+state]}, {id:'slider-guide',rectangle:slider.guide_plan}];
  const segments = path.slice(1).map((to,i) => {
    const from = path[i];
    const clearances = obstacles.map(o => ({obstacle:o.id,margin:segmentMargin(from,to,o.rectangle)}));
    clearances.push({obstacle:'outer-finished-boundary',margin:Math.min(...from,...to,shell-from[0],shell-from[1],shell-to[0],shell-to[1])-E-radius});
    clearances.sort((a,b) => a.margin-b.margin);
    return {from,to,...clearances[0]};
  });
  return {path,sliderState:state,segments,minimumMargin:Math.min(...segments.map(s => s.margin)),passes:segments.every(s => s.margin >= 0)};
}
const pointGap = (p,r) => Math.hypot(Math.max(r[0]-p[0],p[0]-r[0]-r[2],0),Math.max(r[1]-p[1],p[1]-r[1]-r[3],0));
function pointSegment(p,a,b) {
  const dx=b[0]-a[0], dy=b[1]-a[1], den=dx*dx+dy*dy;
  const t=den ? Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) : 0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function segmentGap(a,b,r) {
  let lo=0,hi=1;
  for(let j=0;j<2;j++) {
    const d=b[j]-a[j];
    if(d===0) {if(a[j]<r[j] || a[j]>r[j]+r[j+2]) {lo=1;hi=0;break;}}
    else {
      const ts=[(r[j]-a[j])/d,(r[j]+r[j+2]-a[j])/d].sort((x,y)=>x-y);
      lo=Math.max(lo,ts[0]);hi=Math.min(hi,ts[1]);if(lo>hi) break;
    }
  }
  if(lo<=hi) return 0;
  return Math.min(pointGap(a,r),pointGap(b,r),...[[r[0],r[1]],[r[0]+r[2],r[1]],[r[0],r[1]+r[3]],[r[0]+r[2],r[1]+r[3]]].map(p=>pointSegment(p,a,b)));
}
// Reuse HAD's exact affine body/grip motion. Only the changed cabinet is new:
// all other obstacles and the panel/guide/reach proof remain the pinned HAD result.
function cabinetCoupling(rectangle) {
  const states=had.coupled.illustrative_states, first=states[0], last=states.at(-1);
  const interpolate=(a,b,t)=>a.map((n,j)=>n+(b[j]-n)*t);
  const steps=had.coupled.sample_intervals;
  const bodyHalf=Math.hypot(...last.body.map((n,j)=>n-first.body[j]))/(2*steps);
  const armHalf=Math.max(bodyHalf,Math.hypot(...last.grip.map((n,j)=>n-first.grip[j]))/(2*steps));
  assert.equal(bodyHalf,had.coupled.body_half_step_bound_mm);
  assert.equal(armHalf,had.coupled.arm_half_step_bound_mm);
  let bodyMin=Infinity,armMin=Infinity;
  for(let i=0;i<=steps;i++) {
    const body=interpolate(first.body,last.body,i/steps), grip=interpolate(first.grip,last.grip,i/steps);
    bodyMin=Math.min(bodyMin,pointGap(body,rectangle)-radius);
    armMin=Math.min(armMin,segmentGap(body,grip,rectangle)-slider.hand_forearm_diameter/2);
  }
  const bodyBound=Math.min(had.coupled.body_fixed_clearance_lower_bound_mm,bodyMin-bodyHalf);
  const armBound=Math.min(had.coupled.arm_fixed_clearance_lower_bound_mm,armMin-armHalf);
  return {initialBodyCabinetMargin:pointGap(first.body,rectangle)-radius,
    cabinetBodySampleMinimum:bodyMin,cabinetArmSampleMinimum:armMin,
    combinedBodyLowerBound:bodyBound,combinedArmLowerBound:armBound,
    bodyHalfStepBound:bodyHalf,armHalfStepBound:armHalf,
    passes:bodyBound>=0 && armBound>=0};
}
const variants = [
  {id:'A',name:'Retained cabinet',rectangle:cabinet},
  {id:'B',name:'Full enlargement',rectangle:[9385,4575,770,950]},
  {id:'C',name:'East-only enlargement',rectangle:[9385,4675,770,750]},
].map(v => {
  const r=v.rectangle;
  const entry=checkRoute(had.entry_path,r,'open');
  const coupled=cabinetCoupling(r);
  const inheritedClosedTasks=Object.fromEntries(Object.entries(had.closed_task_paths).map(([name,path])=>[name,checkRoute(path,r,'closed')]));
  const revisedCabinetApproach=v.id==='C' ? checkRoute([[9710,5880],[10500,5880],[10500,5050]],r,'closed') : null;
  const selectedCabinetApproach=revisedCabinetApproach ?? inheritedClosedTasks['cabinet approach'];
  return {...v,
    bathGap:r[1]-plan.first_objects['family-bath1700'][1]-plan.first_objects['family-bath1700'][3],
    doorwaySouthJambGap:door[0]-r[1]-r[3],
    basinGap:plan.first_objects['family-basin'][1]-r[1]-r[3],
    eastFreeStrip:shell-E-r[0]-r[2],
    openingOutsideCabinetM2:(area(bay)-intersectionArea(bay,r))/1e6,
    entry,coupled,inheritedClosedTasks,revisedCabinetApproach,
    completeInheritedSequencePasses:entry.passes && coupled.passes && Object.values(inheritedClosedTasks).every(t=>t.passes),
    completeComparedSequencePasses:entry.passes && coupled.passes && selectedCabinetApproach.passes && Object.entries(inheritedClosedTasks).filter(([name])=>name!=='cabinet approach').every(([,t])=>t.passes),
  };
});
const close=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} differs from ${b}`);
variants[0].entry.segments.forEach((s,i)=>close(s.margin,had.entry.segment_margins_mm[i]));
for(const [name,r] of Object.entries(variants[0].inheritedClosedTasks)) r.segments.forEach((s,i)=>close(s.margin,had.closed_task_results[name].segment_margins_mm[i]));
assert.deepEqual(variants.map(v=>v.doorwaySouthJambGap),[25,-75,25]);
assert.deepEqual(variants.map(v=>v.openingOutsideCabinetM2),[0.11,0.012,0.04625]);
assert.deepEqual(variants.map(v=>v.entry.minimumMargin),[18,-75,18]);
assert.deepEqual(variants.map(v=>v.coupled.initialBodyCabinetMargin),[25,-75,25]);
assert.deepEqual(variants.map(v=>v.inheritedClosedTasks['cabinet approach'].minimumMargin),[15,-155,-155]);
assert.deepEqual(variants.map(v=>v.completeInheritedSequencePasses),[true,false,false]);
assert.deepEqual(variants.map(v=>v.completeComparedSequencePasses),[true,false,true]);
assert.deepEqual(variants[2].revisedCabinetApproach.segments.map(s=>s.margin),[15,45]);
assert.equal(checkRoute([[8910,3250],[8910,6000]],cabinet,'open').minimumMargin,-54);
assert.equal(segmentGap([-10,5],[20,5],[0,0,10,10]),0);
assert.equal(segmentMargin([-10,313],[20,313],[0,0,10,10]),3);
assert.throws(()=>segmentMargin([0,0],[1,1],[3,3,1,1]));
assert.throws(()=>segmentMargin([NaN,0],[NaN,1],[3,3,1,1]));
const data = {
  status:'Unadopted B-plan enclosure/closure comparison; no installed assembly, human-use, structural or firestop acceptance.',
  startingMain:'d81aab99cd8900395deffc16a26f1490fb9658f6',units:'mm unless stated otherwise',sourcePins:pins,
  bay,riser,cabinet,doorwayY:door,bodyProxyRadius:radius,
  walkingBoundary:{assumption:'Every positive route/sequence result requires a continuous, supported, flush walking surface wherever the body proxy overlaps the structural opening.',
    actualFloorClosureAndCapacityVerified:false,retainedCabinetApproachProxyOverlapFromBayEastMm:Math.max(0,bay[0]+bay[2]-(had.closed_task_paths['cabinet approach'].at(-1)[0]-radius)),
    limit:'Obstacle clearance is conditional on that unresolved prerequisite; it is not safe passage over an open bay.'},
  inheritedHAD:{owner:'project/had/had-03-family-bath-slider.md',geometry:slider,sequence:had.sequence,
    coupled:had.coupled,adverseControls:had.adverse_controls,limits:had.limits,
    rule:'Reuse the pinned HAD entry, coupled closing/reopening and closed-task paths; test the cabinet change, not a parallel slider proposal.'},
  closure:{grossOpeningM2:area(bay)/1e6,grossRiserM2:area(riser)/1e6,
    geometricAreaOutsideGrossRiserM2:(area(bay)-area(riser))/1e6,
    geometricAreaInsideCabinetOutsideGrossRiserM2:(area(cabinet)-area(riser))/1e6,
    collarTerritories:collar,actualClosurePanelAreaM2:null,actualIndividualPenetrations:null,
    limit:'Territories are not loose panels, specified bearing widths or a firestop. The gross riser is not sealed.'},
  fixedSupportAndClosure:{authoredTerritory:[9370,4575,785,950],finishedFloorLevel:levels.first,
    actualFrameMembers:null,actualBearingOrAnchors:null,actualCabinetLoads:null,actualProtection:null,actualSectionDepth:null,
    rule:'Fixed, supported and flush where exposed to the room; cabinet load path independent of removable infill and service pipes. No hanger capacity assigned to cabinet loads.'},
  variants,
  renewal:{firstRelease:'East nonstructural face only; support it before releasing its accessible room-side fixings.',
    retained:'Permanent trim, fixed chassis, cabinet load supports, floor closure outside actual service apertures and structural protection.',
    actualClearFaceOpening:null,actualPartWithdrawalEnvelope:null,actualSealingAndReinstatement:null,
    limit:'HAD supplies a complete declared door/body/arm proxy sequence, not human acceptance. The closed cabinet approach does not prove actual face release, tools, handling or component withdrawal.'},
};

const svg = [], add = s => svg.push(s);
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text = (x,y,t,c='') => add(`<text x="${x}" y="${y}" class="${c}">${esc(t)}</text>`);
const rect = (x,y,w,h,c) => add(`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`);
const line = (x,y,xx,yy,c='line') => add(`<path d="M${x},${y}L${xx},${yy}" class="${c}"/>`);
add('<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#fffdf8"/><style>text{font-family:Arial,sans-serif;font-size:3.1px;fill:#243d43}.title{font-size:6px;font-weight:bold}.head{font-size:4px;font-weight:bold}.small{font-size:2.7px}.wall{fill:#d9dfdf;stroke:#65777b;stroke-width:.3}.fixture{fill:#e8edf0;stroke:#7b8d96;stroke-width:.35}.bay{fill:#f3e7ce;stroke:#426775;stroke-width:.45}.cabinet{fill:none;stroke:#956d37;stroke-width:.5;stroke-dasharray:2,1}.riser{fill:url(#h);stroke:#9a5b44;stroke-width:.4}.slider{fill:#e2d5e9;stroke:#916a9f;stroke-width:.4}.frame{fill:none;stroke:#a47c95;stroke-width:.4;stroke-dasharray:1,1}.line{fill:none;stroke:#536d73;stroke-width:.35}.path{fill:none;stroke:#277f69;stroke-width:.7}.entry{fill:none;stroke:#437f9a;stroke-width:.45;stroke-dasharray:1,1}.closed{fill:none;stroke:#916a9f;stroke-width:.3;stroke-dasharray:1,1}.old{fill:none;stroke:#bd6d48;stroke-width:.5;stroke-dasharray:1.5,1}.face{fill:none;stroke:#1b6f99;stroke-width:1}.body{fill:#c7e4da;fill-opacity:.35;stroke:#277f69;stroke-width:.4}.warn{fill:#9d4f32}.closure{fill:#f3e7ce;stroke:#b89b63;stroke-width:.3}</style><defs><pattern id="h" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0,3L3,0" stroke="#b88670" stroke-width=".25"/></pattern></defs>');
text(12,14,'Riser enclosure: keep the floor boundary and the approach','title');
text(12,23,'31 October 2026 / unadopted B plan / mm / north up / A3 at 100% / plans 1:25; closure inset 1:10');
text(12,31,'Positive paths require a supported, continuous, flush floor across any overlapped opening. This study has not earned that closure.','small');
text(12,36,'Blue dashed: entry (gallery cropped) · purple: open/closed leaf · green: closed approach · brown dashed: cabinet · blue edge: removable face','small');
for (const [i,v] of variants.entries()) {
  const ox=12+i*134, oy=45, S=1/25;
  text(ox,41,`${v.id}  ${v.name}`,'head');
  const X=x=>ox+(x-8700)*S, Y=y=>oy+(6500-y)*S;
  const box=(r,c)=>rect(X(r[0]),Y(r[1]+r[3]),r[2]*S,r[3]*S,c);
  box([9215,3785,170,door[0]-3785],'wall');box([9215,door[1],170,6415-door[1]],'wall');
  box([9385,6415,2197.5,85],'wall');box([11582.5,3785,85,2630],'wall');
  for(const key of ['family-bath1700','family-basin','family-WC']) box(plan.first_objects[key],'fixture');
  box(data.fixedSupportAndClosure.authoredTerritory,'frame');box(bay,'bay');box(riser,'riser');box(v.rectangle,'cabinet');box(slider.leaf_open,'slider');box(slider.leaf_closed,'closed');box(slider.guide_plan,'frame');for(const j of jambs) box(j.rectangle,'wall');
  line(X(v.rectangle[0]+v.rectangle[2]),Y(v.rectangle[1]),X(v.rectangle[0]+v.rectangle[2]),Y(v.rectangle[1]+v.rectangle[3]),'face');
  const path=(points,c)=>{for(let j=1;j<points.length;j++) line(X(points[j-1][0]),Y(points[j-1][1]),X(points[j][0]),Y(points[j][1]),c);};
  path([[8750,4475],...had.entry_path.slice(2)],'entry');
  const approach=v.revisedCabinetApproach ?? v.inheritedClosedTasks['cabinet approach'];
  if(v.id!=='B') path(approach.path,'path');
  else path(approach.path,'old');
  const body=v.id==='B' ? had.coupled.illustrative_states[0].body : approach.path.at(-1);
  add(`<circle cx="${X(body[0])}" cy="${Y(body[1])}" r="${radius*S}" class="${v.id==='B'?'old':'body'}"/>`);
  text(X(9580),Y(4110),'Bath','small');text(X(9820),Y(6300),'Basin','small');
  text(ox,159,`${v.rectangle[2]} × ${v.rectangle[3]}; bath gap ${v.bathGap}`,'small');
  text(ox,166,v.doorwaySouthJambGap<0?'75 into room-side doorway; old route fails':`25 clear of room-side south jamb`,'small'+(v.doorwaySouthJambGap<0?' warn':''));
  text(ox,173,v.id==='B'?'Initial HAD torso collides by 75; sequence fails':`HAD entry 18; cabinet approach 15${v.id==='C'?' (east leg 45)':''}`,'small');
}
line(12,180,408,180);
text(12,189,'D  Closure territories, not four loose strips','head');
const bx=17,by=192,S=.1;
const B=(r,c)=>rect(bx+(r[0]-bay[0])*S,by+(bay[1]+bay[3]-r[1]-r[3])*S,r[2]*S,r[3]*S,c);
for(const p of collar) B(p.rectangle,'closure');B(riser,'riser');B(cabinet,'cabinet');
text(95,202,'700 × 800 opening = 0.560 m²');
text(95,210,'550 × 700 gross services = 0.385 m²','warn');
text(95,218,'Hatched zone is NOT a sealed penetration.','small warn');
text(95,229,'Outside gross riser: 0.175 m² geometrically.');
text(95,237,'Outside retained cabinet: 0.110 m².');
text(95,245,'Neither is an earned panel or firestop area.','small');
text(95,257,'West 40 includes retained 15 wall finish.','small');
text(95,265,'Keep the fixed wall termination inspectable.','small');
text(244,189,'E  Fixed support; renewable face','head');
text(244,200,'1  Fixed chassis; complete floor boundary.');
text(244,208,'    Exposed room floor stays flush at +3450.','small');
text(244,219,'2  Support and release the east face.');
text(244,227,'    No cabinet load on that face or pipes.','small');
text(244,238,'3  Isolate and release the actual component.');
text(244,246,'    Actual aperture, travel and seals unknown.','small');
text(244,257,'4  Restore boundaries before closing.');
text(244,265,'    Retain trim and structural protection.','small');
line(12,273,408,273);
text(12,282,'HAD limits remain: 638 opening, 650 reach sensitivity, 5 basin margin. Develop A first; C needs actual access benefit; B needs redesign.','small');
text(12,290,'Support/frame outlines are occupancy territories, not bearing/member sizes. No selected material, firestop, capacity or IAS-03 completion.','small');
add('</svg>');
const outputs = {'project/ias/studies/b-plan-riser-closure.json':JSON.stringify(data,null,2)+'\n','project/ias/studies/b-plan-riser-closure.svg':svg.join('\n')+'\n'};
for(const [path,contents] of Object.entries(outputs)) {
  if(process.argv.includes('--check')) assert.equal(read(path),contents,'Stale output: '+path);
  else writeFileSync(new URL(path,root),contents);
}
console.log('B-plan closure identities, inherited HAD sequence and adverse cabinet controls passed; assembly remains unadopted.');
