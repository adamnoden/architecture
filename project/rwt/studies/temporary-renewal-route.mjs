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
        overrun:{crestAtY7350:-74,upstreamEquivalentAtY7000:-60,
          apronAtY7750:-110,apronSlope:.09,
          scope:'Open x5600–7100 south-face spill at y7350, then 400-long falling apron to existing mouth surface. -60 is a conservative upstream-equivalent level-screen, not a constructed horizontal crest.'},
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
        idealFullReliefLevelFromHeaderOverrunMm:-60+e(1.5),
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
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const path='project/rwt/studies/temporary-renewal-route.json',out=JSON.stringify(build(),null,2)+'\n';
  if(process.argv.includes('--check')) assert.equal(fs.readFileSync(path,'utf8'),out,`${path} stale`);
  else fs.writeFileSync(path,out);
  console.log('RWT-06 temporary route geometry and uniform-flow screen verified; no physical admission.');
}
