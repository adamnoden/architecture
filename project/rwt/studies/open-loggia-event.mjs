import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

// One source-bound RWT-06 comparison, not a general hydraulic solver.
const inputs = {
  house: 'project/had/studies/open-north-loggia.json',
  envelope: 'project/mat/studies/loggia-envelope-section.json',
};
const expected = {
  house: '25faad2c4d40df2b7da7212f73808843a88d2f52',
  envelope: '0ec54ba2420b9337ce81b1867eef4c83d661e69b',
};
const blob = s => crypto.createHash('sha1').update(`blob ${Buffer.byteLength(s)}\0`).update(s).digest('hex');
export function readInputs() {
  return Object.fromEntries(Object.entries(inputs).map(([key,path]) => {
    const raw = fs.readFileSync(path,'utf8');
    assert.equal(blob(raw),expected[key],`${path} changed: reassess this bounded comparison`);
    return [key,{path,blob:blob(raw),model:JSON.parse(raw)}];
  }));
}

// Integrate positive depth over a linear floor strip. mm^3 / 1e6 = litres.
export function stripLitres(level,width,run,low,high) {
  assert(width > 0 && run > 0 && high >= low);
  if (level <= low) return 0;
  if (high === low) return width*run*(level-low)/1e6;
  if (level < high) return width*run*(level-low)**2/(2*(high-low))/1e6;
  return width*run*(level-(low+high)/2)/1e6;
}
export function uniformDepth(q,b,n,slope) {
  let low=0,high=1;
  for(let k=0;k<100;k++) {
    const y=(low+high)/2,a=b*y,r=a/(b+2*y);
    if(a*r**(2/3)*Math.sqrt(slope)/n < q) low=y; else high=y;
  }
  return 1000*(low+high)/2;
}
export function build(source=readInputs()) {
  const h=source.house.model,m=source.envelope.model,w=m.protectedWater;
  assert.equal(h.selection.identity,'HAD-B-OPEN-LOGGIA-2026-11-02');
  assert.deepEqual(h.court,[4250,4250,3500,3500]);
  assert.deepEqual(h.outdoorWaterTerritories.normalGross,[4825,7750,400,4250]);
  assert.equal(h.outdoorWaterTerritories.normalLiner.inside,w.normal.channelClear);
  assert.equal(h.outdoorWaterTerritories.relief[2],w.relief.minimumClearWidth);
  assert.deepEqual(m.outdoor.courtWalking,[0,-30,-110]);
  assert.match(m.threshold.lowestJunction.position,/Pan end return to masonry\/DPC at−30/);
  assert.equal(h.sections.waterLevels.courtNorth,m.outdoor.courtWalking[2]);
  assert.equal(h.sections.waterLevels.loggiaNorth,m.outdoor.gardenTerrace);
  const levels={mouth:-110,panJoin:-30,floor:0,geometricCrest:m.threshold.saddle.top,terrace:m.outdoor.gardenTerrace};
  const courtAt = level => stripLitres(level,3500,1500,-30,0)+stripLitres(level,3500,2000,-110,-30);
  const loggiaAt = level => stripLitres(level,2400,4250,-152.5,-110);
  const storage=[-30,0,15].map(level=>({levelMm:level,courtOnlyLitres:courtAt(level),courtAndLoggiaLitres:courtAt(level)+loggiaAt(level)}));
  const catchment={wallLineInnerRoofM2:47.8125,wallLineCourtM2:12.25,offsetInnerRoofM2:50.4525,offsetExposedCourtM2:9.61,combinedM2:60.0625};
  assert.equal(catchment.wallLineInnerRoofM2+catchment.wallLineCourtM2,catchment.combinedM2);
  assert.equal(catchment.offsetInnerRoofM2+catchment.offsetExposedCourtM2,catchment.combinedM2);
  const events=[72,144,216].map(intensity=>{
    const q=intensity*catchment.combinedM2/3600,depth=uniformDepth(q/1000,.25,.02,.01),reliefDepth=uniformDepth(q/1000,1.8,.025,.01);
    const criticalDepth=1000*((q/1000/1.8)**2/9.81)**(1/3);
    return {intensityMmPerHour:intensity,combinedLitresPerSecond:q,tenMinuteLitres:q*600,
      normalUniformDepthMm:depth,reliefUniformDepthMm:reliefDepth,
      idealReliefCriticalDepthMm:criticalDepth,idealSpecificEnergyMm:1.5*criticalDepth,
      idealMouthDamHeightToPanJoinMm:levels.panJoin-levels.mouth-1.5*criticalDepth,
      noOutletCourtOnlySecondsToComparison:storage[0].courtOnlyLitres/q,
      noOutletCourtAndLoggiaSecondsToComparison:storage[0].courtAndLoggiaLitres/q};
  });
  const dam=[0,60,80,110,125].map(height=>({heightMm:height,crestMm:levels.mouth+height,
    staticPanJoinSeparationMm:levels.panJoin-(levels.mouth+height),
    comparison:height>=80?'reaches or exceeds unqualified pan join before flow head':'below pan join geometrically; not safe-level acceptance'}));
  const renewal=w.normal.renewal;
  const r=renewal.bodyStage,relief=h.outdoorWaterTerritories.relief;
  const overlapX=Math.max(0,Math.min(r[0]+r[2],relief[0]+relief[2])-Math.max(r[0],relief[0]));
  const overlapY=Math.max(0,Math.min(r[1]+r[3],relief[1]+relief[3])-Math.max(r[1],relief[1]));
  return {authority:'Bounded source/event/first-harm challenge. No inlet, hydraulic, material, physical, access or site acceptance; RWT-06 remains open.',
    startingMain:'96005b88ef4f3aff98a660261aa2e99ac47f9101',
    inputs:Object.fromEntries(Object.entries(source).map(([key,{path,blob}])=>[key,{path,blob}])),
    catchment,levels,storage,events,dam,
    assumptions:['Vertical rainfall and runoff coefficient one; roof failure sends all inner-roof water to court.',
      'Constant illustrative rainfall, not a chosen site event or climate allowance; facade, splash and additional terrace rain omitted.',
      'Hydrostatic connected empty floor strips, no losses, all outlets unavailable; no credit for voids, receiver/ramp storage or safe detention.',
      'Uniform-flow probes omit intake capture, bends, transitions, losses and tailwater. Ideal critical energy is a frictionless lower bound only.',
      'Critical-energy comparison assumes a hypothetical broad crest, full 1800 width and negligible approach velocity. It is not a stage/discharge model of the actual loggia.',
      'The -30 pan join is an unqualified wetting comparison, not an established first leakage threshold or allowable water level.'],
    renewal:{lengthMm:renewal.straightLength,bodyOutsideWidthMm:renewal.bodyOutsideWidth,liftMm:renewal.lift,bodyStage:r,
      stageOverlapWithReliefMm:[overlapX,overlapY],normalAndReliefLive:false,temporaryRainRouteQualified:false,
      consequence:'STOP before opening: weather forecast is not rain isolation. No admitted temporary catchment/route, so wet-state renewal unavailable.'},
    highLevel:{eaveMm:h.exterior.eaves,physicalOuterEdgeMm:h.exterior.physicalOuterEdge,
      historicEaveMm:6800,eaveIncreaseMm:h.exterior.eaves-6800,
      historicScaffoldPlatformMm:5800,newNominalEaveGapMm:h.exterior.eaves-5800,
      platformLoweredHeightMm:1980,portalJambSpringMm:h.insulatedPortal.finishedJambSpring,
      portalWidthBelowSpringMm:2400,loweredMachineWidthMm:736,
      scope:'Existing CE outdoor AWP comparison only; actual contacts, slope levelling, guarded reach, recovery and receiver handling remain unqualified. No roof transfer.'},
    verdict:'Retain open-loggia architecture for development, reject any present hydraulic/safe-escape or wet-renewal admission. Reconcile actual first harm and full event/receiving route before RWT-07 selection.'};
}
export function render(v) {
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const t=(x,y,s,size=3.2,color='#243b4b')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="DejaVu Sans,Arial">';
  s+=t(16,17,'OPEN LOGGIA: UNQUALIFIED PAN JOIN CHALLENGE',6)+t(16,26,'RWT-06 / selected B source / bounded arithmetic; NOT a hydraulic or safe-access acceptance',3.5);
  const X=y=>22+(y-4250)/30,Y=z=>94-z/3;
  for(const [a,b,za,zb]of [[4250,5750,0,-30],[5750,7750,-30,-110],[7750,12000,-110,-152.5]])s+=`<line x1="${X(a)}" y1="${Y(za)}" x2="${X(b)}" y2="${Y(zb)}" stroke="#437c82" stroke-width="1"/>`;
  for(const [z,label,color]of [[15,'+15 geometric crest only','#7d687e'],[-30,'-30 actual unqualified pan end / DPC join','#b34935'],[-110,'-110 mouth floor','#437c82']]){
    s+=`<line x1="22" y1="${Y(z)}" x2="293" y2="${Y(z)}" stroke="${color}" stroke-width=".35" stroke-dasharray="2 1"/>`+t(298,Y(z)+1,label,3,color);
  }
  s+=t(22,47,'Longitudinal floor only: horizontal 1:30 / vertical 1:3 at original A3',3.3)+t(22,57,'80 mm mouth dam reaches the pan-join level before any positive discharge head.',3.5,'#b34935');
  s+=`<line x1="${X(7750)}" y1="${Y(-110)}" x2="${X(7750)}" y2="${Y(-30)}" stroke="#b34935" stroke-width="1.4"/>`+t(X(7750)+3,120,'80 mm dam',3.2,'#b34935');
  s+=t(22,155,'Court 3500 = 1500 / 30 fall + 2000 / 80 fall; loggia 4250 / 42.5 fall.',3.2);
  s+=t(16,174,'Combined roof + court: conserved 60.0625 m²; overhang is not counted twice.',4);
  const columns=[18,85,151,224,302];
  ['Illustrative rain','Combined Q','10 minute volume','Cu uniform depth','Relief uniform depth'].forEach((label,i)=>s+=t(columns[i],187,label,3.3));
  v.events.forEach((e,k)=>[`${e.intensityMmPerHour} mm/h`,`${e.combinedLitresPerSecond.toFixed(4)} L/s`,`${e.tenMinuteLitres.toFixed(2)} L`,`${e.normalUniformDepthMm.toFixed(2)} mm`,`${e.reliefUniformDepthMm.toFixed(2)} mm`].forEach((label,i)=>s+=t(columns[i],199+11*k,label)));
  s+=t(18,238,'At -30: court-only geometric pool 280 L; court + loggia 1312.75 L. No safe storage is admitted.',3.4,'#b34935');
  s+=t(18,249,'Uniform flow and ideal critical-energy probes omit inlet, bends, backwater and actual first leakage.',3.2);
  s+=t(18,260,'Both-route blanket, common high tailwater and 4250 liner renewal remain explicit failed controls.',3.2);
  s+=t(18,271,'Eave now +7100; old +5800 scaffold reservation is 1300 below it. No high-level method accepted.',3.2);
  s+=t(18,286,'Reproduce: node project/rwt/studies/open-loggia-event.mjs --check. Read ../rwt-06-open-loggia-event.md.',2.9);
  return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const v=build(),base='project/rwt/studies/open-loggia-event';
 for(const [ext,out]of [['json',JSON.stringify(v,null,2)+'\n'],['svg',render(v)]]) {
   const p=`${base}.${ext}`;
   if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),out,`${p} stale`);else fs.writeFileSync(p,out);
 }
 console.log('RWT-06 source/event comparison verified; no hydraulic, first-harm or access admission.');
}
