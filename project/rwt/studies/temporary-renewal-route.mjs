import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readInputs, uniformDepth } from './open-loggia-event.mjs';

// Spatial and uniform-flow comparison only. The source pins belong to the
// upstream event study; they must be reassessed if either owning model moves.
const blob = raw => crypto.createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
export function build() {
  const source=readInputs(), m=source.envelope.model, n=m.protectedWater.normal;
  assert.equal(n.renewal.straightLength,4250);
  assert.equal(n.renewal.bodyOutsideWidth,303);
  assert.deepEqual(m.terminals.normal.closedDownroute.clear,[250,100]);
  assert.equal(m.terminals.normal.closedDownroute.outlet,-600);
  assert.equal(m.terminals.normal.receiver.nominalWaterPlane,-800);
  assert.equal(m.terminals.guardNorthY,13200);
  const trial={clearWidth:300,wallHeight:38,gauge:1.5,slope:0.01,roughness:0.020,
    lowerThanNormal:50,recessIncrease:15,proposedLift:1350,
    guardHeightAboveTerrace:1100,riggingAboveBody:150};
  const invertAt=y=>n.carrierBottom.find(([station])=>station===y)[1]-trial.lowerThanNormal;
  const mainBottomAt=y=>n.carrierBottom.find(([station])=>station===y)[1];
  const section=[7750,12000,13200].map(y=>{
    const walking=y<=12000 ? -110-(y-7750)*.01 : -152.5;
    const existingRecessTop=walking-70-100;
    const proposedRecessTop=existingRecessTop-trial.recessIncrease;
    const invert=invertAt(y),troughBottom=invert-trial.gauge;
    return {y,walking,normalBottom:mainBottomAt(y),troughInvert:invert,
      troughTop:invert+trial.wallHeight,troughBottom,
      existingRecessTop,proposedRecessTop,
      existingBottomClearance:troughBottom-existingRecessTop,
      proposedBottomClearance:troughBottom-proposedRecessTop,
      proposedRcSoffit:proposedRecessTop-200};
  });
  const q=(216*60.0625/3600)/1000;
  const d=uniformDepth(q,trial.clearWidth/1000,trial.roughness,trial.slope);
  const b=trial.clearWidth/1000,h=trial.wallHeight/1000;
  const full=b*h*(b*h/(b+2*h))**(2/3)*Math.sqrt(trial.slope)/trial.roughness*1000;
  const guardTop=-152.5+trial.guardHeightAboveTerrace;
  const liftedNorthBottom=mainBottomAt(12000)+trial.proposedLift;
  const liftedSouthRiggingTop=mainBottomAt(7750)+76.5+trial.proposedLift+trial.riggingAboveBody;
  assert.equal(section[2].existingBottomClearance,2.75);
  assert.equal(section[2].proposedBottomClearance,17.75);
  assert.equal(section[1].proposedRcSoffit-(-550),12.5);
  assert(liftedNorthBottom>guardTop);
  assert(liftedSouthRiggingTop<2175);
  const surfaceProfile=[
    {y:7350,walk:-94,invert:-123.5,deckTop:-164},
    {y:7750,walk:-110,invert:-127.5,deckTop:-180},
    {y:12000,walk:-152.5,invert:-170,deckTop:-222.5},
    {y:13200,walk:-152.5,invert:-182,deckTop:-222.5},
  ].map(p=>({...p,bottom:p.invert-1.5,belowWalking:p.walk-(p.invert-1.5),aboveRcTop:p.invert-1.5-p.deckTop,lip:p.invert+65}));
  for(let i=1;i<surfaceProfile.length;i++)
    assert.equal((surfaceProfile[i].invert-surfaceProfile[i-1].invert)/(surfaceProfile[i].y-surfaceProfile[i-1].y),-.01);
  assert.equal(Math.min(...surfaceProfile.map(p=>p.aboveRcTop)),39);
  const surface={
    trial:{grossX:[5300,5600],clearWidthMm:297,wallHeightMm:65,
      residualReliefX:[5600,7100],normalX:[4825,5225],
      header:{plan:[4250,7000,3500,350],widthMm:350,
        northInvertAtY7000:{westX4250:-99,outletX5300:-109.5,eastX7750:-85},
        outletAtY7350:-123.5,
        overrun:{crestAtY7350:-94,upstreamEquivalentAtY7000:-80,
          apronAtY7750:-110,apronSlope:.04,
          scope:'Open x5600–7100 south-face spill flush with walking at y7350, then 400-long existing-grade falling apron to mouth. -80 is an upstream-equivalent level-screen, not a constructed crest.'},
        slopes:'1% crossfall from both ends into x5300 and 4% south fall y7000–7350 matching court surface; full 3.60375 L/s assigned conservatively to the longer east branch for section screen.'},
      profile:surfaceProfile,
      terminal:'New separately supported visible side chute at x5300–5600/y13200–13650 from invert -182 to outlet -600 above authored N/W receiver; E chute remains x6500–7100.'},
    events:[72,144,216].map(intensity=>{
      const flow=intensity*60.0625/3600,qs=flow/1000;
      const depth=uniformDepth(qs,.297,.020,.01), reliefDepth=uniformDepth(qs,1.5,.025,.01);
      const e=width=>1500*((qs/width)**2/9.81)**(1/3);
      return {intensityMmPerHour:intensity,combinedLitresPerSecond:flow,
        temporaryUniformDepthMm:depth,temporaryWallMarginMm:65-depth,
        residualReliefUniformDepthMm:reliefDepth,
        temporaryIdealControlEnergyMm:e(.297),
        temporaryIdealLevelAtMouthMm:-127.5+e(.297),
        headerEastUniformDepthMm:uniformDepth(qs,.35,.020,.01),
        headerEastIdealControlLevelMm:-85+e(.35),
        idealFullReliefLevelFromHeaderOverrunMm:-80+e(1.5),
        idealLocalOverrunLevelAtY7350Mm:-94+e(1.5),
        idealLocalMarginToAdjacentTroughLipMm:-58.5-(-94+e(1.5)),
        reliefIdealControlEnergyMm:e(1.5),
        idealReliefMouthDamHeightToUnqualifiedJoinMm:80-e(1.5)};
    }),
    finishPrice:'The surface bypass is recessed 19–31 mm into the walking finish, not into RC200. At the flat y12000–13200 terrace it falls another 12 mm in a dedicated removable finish strip. A flush load-rated normal-state insert and independent support shoes to RC are required; no surviving 9 mm stone sliver is credited structurally.',
    serviceState:'Top-access sectional modules inside 300 gross, normal remaining live during installation and removal; full 1800 relief is deliberately reduced to 1500 only in the declared major-renewal state. No body stage or gantry bearing inside that 1500.',
  };
  return {
    authority:'Conditional surface service route with retained under-liner rejected control; not an installed or hydraulic acceptance.',
    source:Object.fromEntries(Object.entries(source).map(([k,{path}])=>[k,{path,blob:blob(fs.readFileSync(path,'utf8'))}])),
    trial, section,
    event216:{combinedLitresPerSecond:q*1000,tenMinuteLitres:q*1e3*600,
      uniformDepthMm:d,nominalWallFreeboardMm:trial.wallHeight-d,
      fullWallUniformCapacityLitresPerSecond:full,
      idealCriticalEnergyMm:1500*((q/b)**2/9.81)**(1/3),
      limits:'Manning uniform flow at n=.020, S=.01 only. No interception, transition, cover/seam leakage, local loss, surcharge, tailwater, tolerance or chosen design storm.'},
    lifting:{guardTop, liftedNorthBottom,nominalGuardSeparation:liftedNorthBottom-guardTop,
      liftedSouthRiggingTop,nominalTieSeparation:2175-liftedSouthRiggingTop,
      former600NorthBottom:mainBottomAt(12000)+600,
      limits:'Authored 1100 guard-height assumption; finite lifting axis/gantry, load and support need qualification.'},
    normalTail:{outlet:-600,nominalReceivingPlane:-800,nominalAirgap:200,
      limits:'Existing N/W receiving territory, not a surveyed outfall. The temporary branch shares its receiving failure and requires its own lower falling side entry, not an uphill join to the -256/-268 liner.'},
    surface,
  };
}
export function render(v) {
  const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
  const txt=(x,y,s,size=3.1,color='#203746')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}">${esc(s)}</text>`;
  const line=(x1,y1,x2,y2,color='#455869',width=.5,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
  const rect=(x,y,w,h,fill,stroke='#455869')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width=".3"/>`;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="DejaVu Sans,Arial,sans-serif">';
  s+=txt(16,16,'RWT-06 / TEMPORARY WHOLE-LINER RENEWAL',5.7)+txt(16,25,'Conditional 300 gross service state; 1500 residual relief. Physical inlet, first harm, supports and plot remain unqualified.',3.2);
  const X=x=>20+(x-4250)/24,Y=y=>45+(y-7000)/46;
  s+=txt(20,37,'A  PLAN / FINISH STRIPS',3.6);
  s+=rect(X(4250),Y(7000),3500/24,350/46,'#e9d7b6');
  s+=rect(X(4800),Y(7750),2400/24,4250/46,'#f4f0e8');
  s+=rect(X(4825),Y(7750),400/24,5450/46,'#97b5c4');
  s+=rect(X(5300),Y(7350),300/24,5850/46,'#c57f53');
  s+=rect(X(5600),Y(7750),1500/24,5450/46,'#b4d6d1');
  s+=line(X(5600),Y(7350),X(7100),Y(7350),'#b34935',1.3);
  s+=rect(X(5300),Y(13200),300/24,450/46,'#a86143');
  s+=txt(20,204,'Inlet V: x4250..7750 / y7000..7350; collector outlet x5300.',2.8);
  s+=txt(20,211,'Old normal x4825..5225; temporary x5300..5600; E residual x5600..7100.',2.8);
  s+=txt(20,218,'Open overrun y7350/−94 → y7750/−110; N/W chute x5300..5600.',2.8);
  const P=y=>195+(y-7000)/31,Z=z=>77+(-30-z)/1.3;
  s+=txt(195,37,'B  LONGITUDINAL SECTION / ABSOLUTE z',3.6);
  s+=line(P(7000),Z(-30),P(13200),Z(-30),'#b34935',.5,'3 2')+txt(196,72,'−30 unqualified pan/DPC join',2.8,'#b34935');
  const walk=[[7000,-80],[7350,-94],[7750,-110],[12000,-152.5],[13200,-152.5]];
  for(let i=1;i<walk.length;i++)s+=line(P(walk[i-1][0]),Z(walk[i-1][1]),P(walk[i][0]),Z(walk[i][1]),'#526d71',1.1);
  const rc=[[7000,-150],[7350,-164],[7750,-180],[12000,-222.5],[13200,-222.5]];
  for(let i=1;i<rc.length;i++)s+=line(P(rc[i-1][0]),Z(rc[i-1][1]),P(rc[i][0]),Z(rc[i][1]),'#8b99a0',1.2);
  const trough=[[7350,-123.5],[7750,-127.5],[12000,-170],[13200,-182]];
  for(let i=1;i<trough.length;i++)s+=line(P(trough[i-1][0]),Z(trough[i-1][1]),P(trough[i][0]),Z(trough[i][1]),'#b2623d',1.3);
  s+=line(P(7350),Z(-94),P(7750),Z(-110),'#b34935',1.3);
  for(const [y,z]of trough)s+=`<circle cx="${P(y)}" cy="${Z(z)}" r="1" fill="#b2623d"/>`+txt(P(y)-6,Z(z)-3,`${y}:${z}`,2.35);
  s+=txt(195,50,'Grey walk and RC top; copper invert; red open overrun.',2.8);
  s+=txt(195,57,'Terrace walk stays −152.5; invert falls −170→−182.',2.8);
  s+=txt(195,64,'Bottom below walk 19..31; above RC top 39..51.',2.8);
  s+=line(16,226,404,226,'#88949c',.3);
  s+=txt(18,237,'C  WORST ILLUSTRATIVE 216 mm/h / 60.0625 m² = 3.60375 L/s',3.5);
  s+=txt(18,247,'297 clear uniform depth 28.97; residual1500 depth 11.75. Neither proves inlet, losses or tailwater.',3.1);
  s+=txt(18,256,'Header east ideal full-Q level −51.84: only21.84 below unqualified −30 join.',3.1,'#b34935');
  s+=txt(18,265,'Overrun local ideal stage −81.43 at y7350: 22.93 below adjacent lip−58.5.',3.1);
  s+=txt(18,274,'Whole liner 1350 lift: 146.25 nominal over guard; north stage y13650..17900 bridges N/W receiver.',3.1);
  s+=txt(18,286,'No selected service method. Reproduce: node project/rwt/studies/temporary-renewal-route.mjs --check',2.9);
  return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const v=build(),base='project/rwt/studies/temporary-renewal-route';
  for(const [extension,out] of [['json',JSON.stringify(v,null,2)+'\n'],['svg',render(v)]]) {
    const path=`${base}.${extension}`;
    if(process.argv.includes('--check')) assert.equal(fs.readFileSync(path,'utf8'),out,`${path} stale`);
    else fs.writeFileSync(path,out);
  }
  console.log('RWT-06 temporary route geometry and uniform-flow screen verified; no physical admission.');
}
