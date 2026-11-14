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
const bridge = {
  fixedRailCentreY: [475,925], footX: [3450,4550], footXYHalf: [35,35],
  trolleyPathX: [3900,4300], spanMM:1100, railRHSMM:[40,20,3], undersideZ:210,
  crossbeamCentreZ:250, clearLiftAndHardwareZ:175, handlingBlockMassKG:1,
  conservativeHorizontalPullN:100, trackMisalignmentMM:5, plusVerticalInstallationAllowanceMM:10
};
const [westFoot,eastFoot]=bridge.footX;
const [southRail,northRail]=bridge.fixedRailCentreY;
const [footHalfX,footHalfY]=bridge.footXYHalf;
const [width,height,wall]=bridge.railRHSMM;
const railInertia = (width*height**3-(width-2*wall)*(height-2*wall)**3)/12;
const worstPackage=packageMass.at(-1).handlingMassKG+bridge.handlingBlockMassKG;
const wholeMovingForce=worstPackage*g*lift.handlingFactor;
const maxWheelForce=wholeMovingForce;
const testedRailSpan=eastFoot-westFoot;
const railE=200000;
const loadBendingStress = (maxWheelForce*testedRailSpan/4)*(height/2)/railInertia;
const nominalDeflection = maxWheelForce*testedRailSpan**3/(48*railE*railInertia);
const offCentreY=bridge.trackMisalignmentMM;
const railSpacing=northRail-southRail;
const trolleyAtThen = bridge.trolleyPathX.map(x => ({
  x,
  foreAftReactionsN:[wholeMovingForce*(eastFoot-x)/testedRailSpan,
    wholeMovingForce*(x-westFoot)/testedRailSpan]
}));
bridge.totalMovingForceN=wholeMovingForce;
bridge.railBound={testedRailSpan,railInertia,loadBendingStress,nominalDeflection,
  note:'Whole moving force on one ideal simple span. Ignores rail self-mass, local wheel/contact, splice, foot and cross-beam checks.'};
bridge.positiveClearance={
  southFootToWall: southRail-footHalfY-429.5,
  northFootToWall: 1103-(northRail+footHalfY),
  farFootToWall:4703-(eastFoot+footHalfX),
  southFootToTile:release.lift[1]-(southRail+footHalfY),
  northFootToTile:northRail-footHalfY-release.lift[3],
  guaranteedTaskHeight:bridge.undersideZ-bridge.clearLiftAndHardwareZ-bridge.plusVerticalInstallationAllowanceMM-nominalDeflection,
  trackSpacing:railSpacing,
  trolleyAtThen,
  maximumOneSideVerticalN:wholeMovingForce*(.5+offCentreY/railSpacing)
};
bridge.shoeCrossesTileLateralBand=bridge.positiveClearance.southFootToTile<0||bridge.positiveClearance.northFootToTile<0;
assert.equal(bridge.shoeCrossesTileLateralBand,true);
const revised = {
  railCentresY:[470,940],footHalfY:15,spanMM:testedRailSpan,
  southWallReserveMM:470-15-429.5,
  southTileReserveMM:release.lift[1]-(470+15),
  northTileReserveMM:940-15-release.lift[3],
  northWallReserveMM:1103-(940+15)
};
revised.southSkirtingClearanceMM=revised.southWallReserveMM-18;
revised.southSkirtingAfter5SettingMM=revised.southSkirtingClearanceMM-5;
revised.southRailToTileMM=release.lift[1]-(revised.railCentresY[0]+width/2);
revised.overSkirtingHeightMM=bridge.undersideZ-150;
const endOfTravel=release.firstRest[2];
revised.farFeetToFirstRestMM=eastFoot-footHalfX-endOfTravel;
const pullOverturn = bridge.conservativeHorizontalPullN * bridge.crossbeamCentreZ;
const crossRailUpliftConservativeN = pullOverturn/(revised.railCentresY[1]-revised.railCentresY[0]);
const loadedMomentAboutNearestFootNmm =
  wholeMovingForce*(eastFoot-bridge.trolleyPathX.at(-1));
Object.assign(revised,{crossRailUpliftConservativeN,loadedMomentAboutNearestFootNmm,
  outboardTippingMomentNmm:pullOverturn,
  minimumIdealVerticalRestraintBeyondSymmetricHalfN:Math.max(0,crossRailUpliftConservativeN-wholeMovingForce/2),
  worstSetupFreeFootCoupleN:crossRailUpliftConservativeN,
  unladenTemporaryTiesRequired:true
});
assert(revised.southSkirtingAfter5SettingMM>0&&revised.southTileReserveMM>0&&revised.northTileReserveMM>0);
assert(revised.southRailToTileMM>0&&revised.farFeetToFirstRestMM>0);
assert(loadedMomentAboutNearestFootNmm>pullOverturn);
const nearestRhsToLoadGap = bridge.fixedRailCentreY[1]-release.lift[3]-bridge.railRHSMM[0]/2;
assert(nearestRhsToLoadGap>0);
assert(bridge.positiveClearance.guaranteedTaskHeight>0);
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
  packageMass,maximumHorizontalReach,modeledReachByState,seamCases,rigidSpread,bridge,revised,adverse,
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

function drawBridge(){
  const sx=x=>16+(x-3350)*.13, sy=y=>139-(y-425)*.13;
  const plot=(x,y,w,h,fill,stroke='#675949',corner=0)=>
    '<rect x="'+sx(x)+'" y="'+sy(y+h)+'" width="'+w*.13+'" height="'+h*.13+'" rx="'+corner+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".35"/>';
  const line=(x,y,z,t)=>'<path d="M'+sx(x)+' '+sy(y)+' L'+sx(z)+' '+sy(t)+'" stroke="#463e34" stroke-width=".45"/>';
  const a=(x,y,s,cls='body')=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+s+'</text>';
  const module=box=>plot(box[0],box[1],box[2]-box[0],box[3]-box[1],'#d4bea0');
  const facts=[
    ['147.4 N','Factored load with 1 kg lifting hardware.'],
    ['21.46 MPa / 1.08 mm','Ideal single rail stress and deflection.'],
    ['23.92 mm','Available after setting and ideal rail bend.'],
    ['53.19 N','Ideal restraint from the 100 N snag comparator.']
  ];
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="297mm" height="210mm" viewBox="0 0 297 210" role="img" aria-labelledby="title desc">',
    '<title id="title">Study lift bridge, retained bay and fixed first rest</title><desc id="desc">Plan comparison of a portable four-post guide, fixed rails and the verified transfer box, with calculations and critical clearances.</desc>',
    '<style>.title{font:7px Georgia;fill:#362c25}.head{font:4px Georgia;fill:#362c25}.body{font:3.3px Arial;fill:#443830}.small{font:2.7px Arial;fill:#443830}</style>',
    '<rect width="297" height="210" fill="#f8f4eb"/>',
    a(12,14,'A guided lift for the Study tile','title'),a(12,22,'Trial plan and load-path comparison · millimetres · fittings and restraint remain open'),
    a(12,37,'Foot positions and guided travel','head'),
    plot(3350,429.5,1353,673.5,'#ede4d6'),
    module(release.lift),module(release.firstRest),
    ...revised.railCentresY.map(y=>plot(westFoot,y-20,eastFoot-westFoot,40,'#8c9691')),
    ...bridge.footX.flatMap(x=>revised.railCentresY.map(y=>plot(x-35,y-15,70,30,'#5b605d'))),
    ...bridge.trolleyPathX.map(x=>plot(x-12,450,24,500,'none','#5c4838')),
    line(3900,700,4300,700),line(4260,677,4300,700),line(4260,723,4300,700),
    a(83,90,'First lift'),a(137,90,'First rest'),
    a(12,148,'X3450 and X4550 feet straddle both travel states.'),
    a(12,155,'Y470 and Y940 shoes leave 15 / 25 to moving tile edges.'),
    a(12,162,'South shoe clears the 18 mm skirting by 7.5 nominal.'),
    a(204,37,'Trial load screen','head'),
    ...facts.flatMap(([value,label],i)=>[a(204,51+21*i,value,'head'),a(204,58+21*i,label,'small')]),
    a(12,173,'Close the room. Fit and positively restrain both rail frames before any extraction. Travelling cradle handles pitch and first rest.'),
    a(12,181,'Show actual feet and under-rail clearances, wheel capture, operation sequence and parked assembly before qualifying the concept.'),
    a(12,199,'An ideal rail screen compares options. It does not rate fabricated equipment or certify a handling method.','small'),
    '</svg>\n'
  ].join('');
}

for(const [name,content] of [
  ['workable-study-release.json',JSON.stringify(receipt,null,2)+'\n'],
  ['workable-study-release.svg',drawSheet()],
  ['workable-study-lift-bridge.svg',drawBridge()]
]){
  const target = new URL(name,import.meta.url);
  if(process.argv.includes('--check')) assert.equal(readFileSync(target,'utf8'),content,name+' drift');
  else writeFileSync(target,content);
}
