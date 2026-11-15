import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {deriveFixedStation} from './inlet-fixed-station.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {utilityHeadObstacles,utilityHeadSweeps,utilityTerminalStudy} from './incoming-water-terminal.mjs';

const read=key=>JSON.parse(readFileSync(new URL(key,import.meta.url),'utf8'));
const settingMM=10;
const clearanceMM=25;
const pairMarginMM=settingMM+clearanceMM;
const round=value=>Number(value.toFixed(5));
const productSource='https://www.acornthorn.co.uk/basins-bowls-catering-sinks/freestanding-catering-sinks/catering-sink-single-bowl';
const assemblySource='https://www.acornthorn.co.uk/imagprod/downloads/CS860%20Self%20Assembly%20Sink%20Instructions.pdf';

export function deriveUtilityCutoverLift(){
  const {model}=deriveCurrentHouse();
  const inlet=deriveFixedStation();
  const study=read('./incoming-water.json');
  const predecessor=study.utilitySuccessor;
  const cold=inlet.paths.utility;
  const hot=study.utility.vertices.hot;
  assert.deepEqual(cold.at(-1),predecessor.vertices.coldWasher[0]);
  assert.deepEqual(hot.at(-1),predecessor.vertices.hotSink[0]);
  const actual=utilityHeadObstacles(model);
  const hotEast=actual.hotCap[0]+actual.hotCap[3];
  const eastWallX=actual.eastWall[0];
  const availableWidthMM=eastWallX-hotEast-2*pairMarginMM;
  const historical=predecessor.head.raised;
  const head=[actual.frame[0],historical[1],historical[2]+10,600,...historical.slice(4)];
  const moves=predecessor.head.moves.map(move=>[...move]);
  moves.at(-1)[2]-=10;
  const retainedRoutes={cold:finiteBends(cold,75),hot:finiteBends(hot,75)};
  const detailed=utilityHeadSweeps(head,moves,actual).map(({stage,box,obstacles})=>{
    const backbone=Object.fromEntries(Object.entries(retainedRoutes).map(([key,route])=>[key,
      round(Math.min(...route.path.slice(1).map((point,i)=>exactSegmentBoxDistance(route.path[i],point,box)))-37-route.hausdorffError-settingMM)]));
    const namedObstacles=Object.fromEntries(obstacles.map(o=>[o.id,round(o.gapMM-settingMM)]));
    return {stage,box,namedObstacles,backbone,minimumMM:Math.min(...Object.values(namedObstacles),...Object.values(backbone))};
  });
  const down=moves.at(-1);
  const centre=head.slice(0,2).map((v,i)=>v+head[i+3]/2);
  const landing=[centre[0]+down[0],centre[1]+down[1],head[2]+down[2]];
  const stands=predecessor.head.receiver;
  const endBounds=[landing[0]-head[3]/2,landing[1]-head[4]/2,head[3],head[4]];
  const supportClearance=[endBounds[0]-stands.plan[0],stands.plan[0]+stands.plan[2]-endBounds[0]-endBounds[2],
    endBounds[1]-stands.plan[1],stands.plan[1]+stands.plan[3]-endBounds[1]-endBounds[3]];
  const retiredHeadGap=Math.min(...utilityHeadSweeps(historical,predecessor.head.moves,actual).flatMap(stage=>stage.obstacles.map(o=>o.gapMM-settingMM)));
  const shortfallMM=historical[3]-availableWidthMM;
  assert(retiredHeadGap<clearanceMM&&shortfallMM>0);
  const relocatedStartX=head[0]-10;
  const relocatedHotMaximumX=relocatedStartX-pairMarginMM;
  const widerFallback={
    packageWidthMM:historical[3],southwestX:relocatedStartX,maximumHotBoundaryX:relocatedHotMaximumX,
    minimumHotBoundaryShiftWestMM:hotEast-relocatedHotMaximumX,
    wallGapAfterSettingMM:eastWallX-relocatedStartX-historical[3]-settingMM,
    disposition:'Redraw and re-sweep the complete hot control and backbone if the fitted package cannot fit.',
  };
  assert(widerFallback.wallGapAfterSettingMM>=clearanceMM);
  assert(detailed.every(stage=>stage.minimumMM>=clearanceMM));
  assert.deepEqual(landing,[10505,1800,350]);
  assert(supportClearance.every(gap=>gap>=25));
  const breakOperations=predecessor.tool.checks.map(row=>({id:row.id,minimumToolAfterSettingMM:round(row.toolGapLowerMM-settingMM)}));
  const lowWork=predecessor.controlledDrain.drains.map(drain=>({
    id:drain.id,minimumArmAfterSettingMM:round(Math.min(...drain.clearance.map(item=>item.armMM))-settingMM),
  }));
  const releaseGeometry={headBodyBottom:670,toolZ:620,drainShoulder:[11025,1725,500],receiver:[11055,925,0,390,400,75]};
  const release=utilityTerminalStudy(model,read('../../ias/studies/utility-host-revised-route.json'),releaseGeometry);
  const proposedTools=release.tool.checks.map(row=>({
    id:row.id,toolMM:round(row.toolGapLowerMM-settingMM),handMM:round(row.handGapLowerMM-settingMM),
    armMM:round(row.armGapLowerMM-settingMM),otherUnionMM:round(row.otherUnionGapLowerMM-settingMM),
    reachMM:round(row.maxReachUpperMM),
  }));
  const proposedDrains=release.controlledDrain.drains.map(row=>{
    const obstruction=row.clearance.reduce((least,item)=>item.armMM<least.armMM?item:least);
    return {id:row.id,controllingObstacle:obstruction.id,armMM:round(obstruction.armMM-settingMM),reachMM:round(row.reachMM)};
  });
  const receiverAfterSettingMM=release.controlledDrain.receiverInsertionMinimumMM-settingMM;
  const installedHeadBottom=historical[2]-predecessor.headLiftToFullClearance;
  assert(proposedTools.every(row=>Math.min(row.toolMM,row.handMM,row.armMM,row.otherUnionMM)>=clearanceMM));
  assert(proposedDrains.every(row=>row.armMM>=clearanceMM));
  assert(receiverAfterSettingMM>=clearanceMM);
  return {
    status:'PREFERRED_UTILITY_HEAD_HANDLING_RESERVATION',
    inletEndpoints:{cold:cold.at(-1),hot:hot.at(-1),coincidenceMM:0},
    oldLift:{head:historical,minimumMM:retiredHeadGap,xWidthShortfallMM:shortfallMM},
    fittedLift:{head,moves,details:detailed,landing,eastWallX,hotBoundaryEastX:hotEast,availableWidthMM,
      receiver:stands.plan,supportClearance,maximumLoadedWidthAtSelectedXMM:eastWallX-head[0]-pairMarginMM,
      widerFallback},
    cutover:{unionPoints:predecessor.breaks.map(row=>row.point),breakOperations,lowWork,
      releaseCandidate:{...releaseGeometry,proposedTools,proposedDrains,receiverAfterSettingMM,
        grossReceiverUpperLitres:release.controlledDrain.grossCuboidUpperLitres,
        installedHeadZ:[installedHeadBottom,installedHeadBottom+head[5]],
        initialVerticalTravelMM:head[2]-installedHeadBottom,
        scope:'Relieve the bowl/skirt obstruction only, keeping rim, retained tails and overall fitted transport envelope. Prove the actual shell relief, nut engagement, operator and receiver handling, net receiver volume and initial vertical sweep before adoption.'},
      capture:{productSource,assemblySource,requiredActualMovingWidthMM:head[3],completeMovingDepthMM:head[4],completeMovingHeightMM:head[5],
        method:'Support with independent above-head drive and three or more positively restrained load contacts within the entire plan width. With zero pressure and independent wet ends closed, capture at least three non-collinear supported contacts before the four fixing screws leave. Verify actual load, contact capacity, mass centre, support path, anti-tip restraint and sustained tension over every stage. Lower to independent two-rail rest while retaining capture. Do not grip outside the width during the north transit.'},
      hold:'Before pre-site cutover verify the relieved shell and nut engagement, occupied receiver operation and initial vertical sweep. Source water fittings, complete chamber, loaded release and as-built site evidence are separate later qualifications.'},
  };
}

function drawing({fittedLift:f,oldLift:o}){
  const x=v=>105+(v-10000)*.43, y=v=>465-(v-650)*.26;
  const rect=(a,b,w,d,fill)=>`<rect x="${x(a)}" y="${y(b+d)}" width="${w*.43}" height="${d*.26}" fill="${fill}" stroke="#31434a"/>`;
  const first=f.details[0];
  const head=f.head;
  const width=f.availableWidthMM;
  const labels=(xx,yy,value)=>`<text x="${xx}" y="${yy}">${value}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 610" role="img" aria-labelledby="title desc">
<title id="title">Route the captured utility head inside a fitted 600 millimetre envelope</title>
<desc id="desc">Plan of first lift, north transit and west transit around the hot control, cold cap and east wall, with an independent landing.</desc>
<style>text{font:16px sans-serif;fill:#293d3b}.title{font:bold 28px sans-serif}</style>
<rect width="1000" height="610" fill="#f8f4e9"/>
<text x="35" y="48" class="title">Leave the frame and fixed plumbing in place</text>
${labels(35,76,'House plan in millimetres · Complete captured head envelope')}
${rect(f.eastWallX,650,100,1550,'#d8c7a5')}
${rect(10823,1213,74,147,'#c78764')}
${rect(10723,1213,74,74,'#789eb5')}
${rect(...f.receiver,'#d9e8e0')}
${rect(head[0],head[1],head[3],head[4],'#e6ceb5')}
${rect(head[0],head[1]+760,head[3],head[4],'#d6d7e9')}
<line x1="${x(11235)}" y1="${y(1040)}" x2="${x(11235)}" y2="${y(1800)}" stroke="#3f7166" stroke-width="3"/>
<line x1="${x(11235)}" y1="${y(1800)}" x2="${x(10505)}" y2="${y(1800)}" stroke="#3f7166" stroke-width="3"/>
${labels(35,504,`Fixed passage permits ${width} mm after settings. The former ${o.head[3]} mm package exceeds that by ${o.xWidthShortfallMM} mm.`)}
${labels(35,532,`Lift to Z${head[2]} · draw 760 north, 730 west, lower 585 · ${Math.min(...f.details.map(s=>s.minimumMM))} mm minimum after settings.`)}
${labels(35,560,`Stage 1 keeps ${first.backbone.hot.toFixed(2)} mm to the hot backbone and ${first.namedObstacles.eastWall} mm to the wall after settings.`)}
${labels(850,100,'North ↑')}
${labels(202,125,'Independent rest')}
${labels(510,117,'North transfer')}
${labels(515,421,'Raised start')}
${labels(300,270,'Cold end cap')}
${labels(383,357,'Hot control')}
<path d="M395 274l25 27M445 345l16-25" fill="none" stroke="#31434a"/>
${labels(850,395,'East wall')}
<line x1="35" x2="960" y1="577" y2="577" stroke="#a2aaa3"/>
${labels(35,599,'The actual supplier head, capture, fastener access and appliance loads require verification.')}
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveUtilityCutoverLift();
  const outputs={json:JSON.stringify(result,null,2)+'\n',svg:drawing(result)};
  for(const [extension,content] of Object.entries(outputs)){
    const path=new URL(`utility-cutover-lift.${extension}`,import.meta.url);
    if(process.argv.includes('--write')) writeFileSync(path,content);
    else if(process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),content);
    else if(extension==='json') process.stdout.write(content);
  }
}
