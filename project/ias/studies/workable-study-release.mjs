import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const source = new URL('workable-study-floor.json', import.meta.url);
const bytes = readFileSync(source);
const { release } = JSON.parse(bytes);

const g = 9.81;
const panel = { pitch: 400, gap: 3, skin: 18, beddingTerritory: 2, nominalDensity: 700 };
const side = panel.pitch - panel.gap;
const lift = {
  behindEdge: 20, offsetsFromCentre: [-55, 55], gripHeight: 80,
  nominalHandHalfEnvelope: [36, 24, 24], assumedShoulderZ: 480,
  trialToolLength: 115, toolKeepClearOverHead: 150,
  oneFittingMassKG: 0.10, handlingFactor: 1.5,
};
const rest = { pad: 3, fullTileSupportRequired: true };
const captured = {
  retentionAxisSetback: 38, countersinkTerritory: 3,
  embeddedSocketTerritory: 13, bottomReserve: 5, resilientLayerTrial: 3
};
assert.equal(panel.skin + panel.beddingTerritory, 20);
assert.equal(captured.embeddedSocketTerritory + captured.bottomReserve, panel.skin);
assert.equal(release.firstRest[0] - release.lift[0], panel.pitch);
assert.equal(release.stanceEnd[0] - release.stanceStart[0], panel.pitch);
assert.equal(release.stanceEnd[1], release.stanceStart[1]);

const centerY = (release.lift[1] + release.lift[3]) / 2;
const halfSeam = panel.gap / 2;
const trailingGripX = release.lift[0] + halfSeam + lift.behindEdge;
const gripY = lift.offsetsFromCentre.map(offset => centerY + offset);
const handlerToGripX = trailingGripX - release.stanceStart[0];
const maximumHorizontalReach = Math.max(...gripY.map(y=>Math.hypot(handlerToGripX,y-release.stanceStart[1])));
const reachAt = z=>Math.hypot(maximumHorizontalReach,lift.assumedShoulderZ-z);
const modeledReachByState = { initialDetach:reachAt(lift.gripHeight), carry:reachAt(lift.gripHeight+release.assumedVerticalLiftMM), rest:reachAt(lift.gripHeight+rest.pad) };
const packageMass = [
  {finish:'18 mm timber',faceMassKG:side**2*panel.skin*panel.nominalDensity/1e9},
  {finish:'12 mm stone + 3 mm steel',faceMassKG:side**2*(12*2700+3*7850)/1e9}
].map(({finish,faceMassKG})=>{
  const handlingMassKG=faceMassKG+2*lift.oneFittingMassKG;
  return {
    finish,faceMassKG,handlingMassKG,
    sharedLoadEachN:handlingMassKG*g*lift.handlingFactor/2,
    oneFittingFaultN:handlingMassKG*g*lift.handlingFactor,
    oneEdgeOverturningNm:handlingMassKG*g*lift.handlingFactor*(side/2-lift.behindEdge)/1000
  };
});

const seamCases = [
  { name:'Opposing ±0.5 mm accumulated setting and 0.5 mm growth per edge', setting:0.5,growthPerEdge:0.5 },
  { name:'Opposing ±0.5 mm accumulated setting and 1.0 mm growth per edge', setting:0.5,growthPerEdge:1.0 },
  { name:'Opposing ±0.75 mm accumulated setting and 1.0 mm growth per edge', setting:0.75,growthPerEdge:1.0 }
].map(({name,setting,growthPerEdge})=>({name,residual:panel.gap-2*(setting+growthPerEdge)}));
const rigidSpread = {
  frontPickupFromTrailingEdge: side-lift.behindEdge,
  restrainedPitchingRequiresBothRows: true
};
rigidSpread.rowSeparation = rigidSpread.frontPickupFromTrailingEdge-lift.behindEdge;
rigidSpread.developedReachToForwardRowMM = Math.hypot(
  rigidSpread.frontPickupFromTrailingEdge+halfSeam+release.lift[0]-release.stanceStart[0],
  centerY-release.stanceStart[1]);
rigidSpread.staticRowSharePerSideN = packageMass.map(item=>item.sharedLoadEachN);
rigidSpread.threeMillimetreResilientLayerOverrun = captured.resilientLayerTrial;
const adverse = {
  uncoveredStructuralOpeningUnderPiece: 0,
  recessDepthDuringExchangedState: panel.skin+panel.beddingTerritory,
  remainingMaterialBelowFasteningPilotBeforeFactoring: captured.bottomReserve,
  freeFinishDepth: 20-panel.skin-panel.beddingTerritory,
  gripPlanGapToBody:handlerToGripX-release.workerRadiusMM-lift.nominalHandHalfEnvelope[0],
  fullTransferNeedsProtectedRoom: true
};
assert(seamCases[0].residual > 0);
assert.equal(seamCases[1].residual,0);
assert(seamCases[2].residual < 0);
assert(adverse.gripPlanGapToBody > 0);
assert.equal(adverse.freeFinishDepth,0);

const receipt = {
  status:'Partial geometric and handling-load comparison for a pre-site concept.',
  sourceSHA256:createHash('sha256').update(bytes).digest('hex'),
  panel,lift,captured,rest,
  handledBodySide:side,trailGripX:trailingGripX,gripY,
  packageMass,maximumHorizontalReach,modeledReachByState,seamCases,rigidSpread,adverse,
  hold:'The two grips are on one edge. The loaded piece requires a restrained upper pickup spread or guided cradle before lift and transfer can be adopted. Trial mass, hand envelopes, scale and deflections do not establish human forces, material behaviour, screw/insert capacity, support performance, water or fire admission.'
};

function drawSheet(){
  const ink='#362c25',timber='#ac8060',metal='#777f7d',paper='#f8f4eb',mineral='#c7bba5';
  const line=(x1,y1,x2,y2,w=.3) => '<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" stroke="'+ink+'" fill="none" stroke-width="'+w+'"/>';
  const rect=(x,y,w,h,fill=paper)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+ink+'" stroke-width=".25"/>';
  const circle=(x,y,r,fill=paper)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+ink+'" stroke-width=".25"/>';
  const txt=(x,y,value,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+value+'</text>';
  const dim=(a,b,y,label)=>line(a,y-1,a,y+1)+line(b,y-1,b,y+1)+line(a,y,b,y)+txt(a,y-2,label,'small');
  const bar=(x,y,len,label)=>rect(x,y,len/2,1,ink)+rect(x+len/2,y,len/2,1)+txt(x,y+5,label,'small');
  const arcText='Millimetres · print at actual size · scale bars verify output';
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210" role="img" aria-labelledby="title desc">',
    '<title id="title">Study finish retention and local release</title><desc id="desc">A dimensioned 1:2 section across the finish seam and a 1:5 Study plan excerpt show geometric limits of a top-lifted tile. Both retain the continuous substrate.</desc>',
    '<style>.title{font:7px Georgia;fill:#362c25}.head{font:4px Georgia;fill:#362c25}.body{font:3.3px Arial;fill:#443830}.small{font:2.7px Arial;fill:#443830}</style>',
    '<rect width="297" height="210" fill="'+paper+'"/>',
    txt(12,14,'Study · retain, lift and put one piece down','title'),txt(12,22,arcText),
    txt(12,36,'A · 1:2 finish support and top access','head'),
    txt(154,36,'B · 1:5 first lift and projected rest','head'),
    rect(12,74,124,10,mineral),rect(12,73,124,1,'#d8caae'),
    rect(12,64,60,9,timber),rect(73.5,64,62.5,9,timber),
    rect(90.5,64,4,1.5,metal),rect(92.1,65.5,.8,5,metal),
    dim(72,73.5,54,'3 seam'),dim(73.5,92.5,60,'38 retention stud axis'),
    line(92.5,51,92.5,64),txt(94.5,51,'Top release, no projecting head','small'),
    txt(12,94,'18 timber + 2 bedding = 20 finish allowance.'),txt(12,100,'The continuous structural support stays in place.'),
    txt(12,106,'The removable piece leaves a 20 mm finish recess.'),bar(12,114,50,'100 mm at 1:2'),
    rect(154,51,79.4,79.4,'#b29370'),rect(234,51,61,79.4,'#ecdfc3'),
    '<path d="M295 51h-61v79.4h61" fill="none" stroke="#544939" stroke-width=".25" stroke-dasharray="1.5 1"/>',
    circle(158,79.7,1.3,metal),circle(158,101.7,1.3,metal),line(158,79.7,158,101.7),
    '<path d="M158 79.7H229.4V101.7H158" fill="none" stroke="#76614c" stroke-width=".35" stroke-dasharray="1 1.5"/>',
    dim(154,233.4,46,'397 finished · 400 pitch'),dim(154,158,139,'20 pickup setback'),
    line(197,97,255,97),line(251,94,255,97),line(255,97,251,100),
    bar(154,148,40,'200 mm at 1:5'),
    txt(154,167,'55 vertical release, then 400 east to flush first rest.'),
    txt(154,173,'Adjacent landing is shown cropped at the sheet edge.'),
    txt(154,179,'Temporary openings stay inside a closed room.'),
    txt(12,151,'Two close pickups on one edge need a positive','body'),
    txt(12,157,'pitch restraint for the load. Independent grips'),
    txt(12,163,'leave a large gravity moment about their axis.'),
    txt(12,176,'Keep anchorage and any structural receiver'),
    txt(12,182,'separate from the 18 mm wearing layer.'),
    txt(12,199,'Concept only · fabrication, material movement, sound, handling and capacity remain design and test duties','small'),
    '</svg>\n'
  ].join('');
}

for(const [name,content] of [
  ['workable-study-release.json',JSON.stringify(receipt,null,2)+'\n'],
  ['workable-study-release.svg',drawSheet()]
]){
  const target = new URL(name,import.meta.url);
  if(process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8'),content,name+' drift');
  else writeFileSync(target,content);
}
