import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {sideReceiver} from './side-receiver.mjs';
import {readSelected} from './selected-water-event.mjs';

const gravity = 9.81;

// An equal-depth sensitivity for ONE surviving half-full 155 mm barrel.
// Charge entry with no approach velocity credit and discharge with one velocity head.
export function headBudget(flowLps, lengthMm, grade, diameterMm = 155) {
  const diameter = diameterMm / 1000;
  const roughness = 0.020;
  const area = Math.PI * diameter ** 2 / 8;
  const velocity = flowLps / 1000 / area;
  const velocityHead = 1000 * velocity ** 2 / (2 * gravity);
  const frictionSlope = (roughness * velocity / (diameter / 4) ** (2 / 3)) ** 2;
  const drop = lengthMm * grade, friction = lengthMm * frictionSlope;
  return {flowLps, diameterMm, grade, roughness, velocity, velocityHead, drop, friction,
    fittingKLimitAfterExit: (drop - friction) / velocityHead - 1,
    remainingHeadAtK2Mm: drop - friction - 3 * velocityHead};
}

export function forkStudy() {
  const parent = sideReceiver();
  const {port, basin, spill, shift} = parent.high;
  const [x,y,z] = port;
  const od = 159, bore = 155, grade = 1/40;
  const rootsY = 6250, offsetY = 5000, outletY = parent.high.tailLine.at(-1)[1];
  const centreOffset = basin[0] + basin[2]/2 - x;
  const paths = [-175,175].map(offset => [[x,y], [x+offset,rootsY],
    [x+offset+centreOffset,offsetY], [x+offset+centreOffset,outletY]]);
  const lengths = paths.map(path => path.slice(1).map(([px,py],i) =>
    Math.hypot(px-path[i][0],py-path[i][1])));
  const length = lengths[0].reduce((a,b) => a+b, 0);
  const straightPairM = lengths.reduce((sum,leg) => sum+(leg[1]+leg[2])/1000,0);
  const allowance = parent.high.assumedCombinedRigidAndDeformation;
  const forkNorthAllowance = 75;
  const guides = [[12650,5400],[13750,5400],[12650,5900],[13750,5900]];
  const guideHalf = 50, runnerY = [5260,6500];
  const rim = basin[1]+basin[3], effectiveTipZ = z-length*grade;
  // Vertical outside half-depth is conservatively taken as the full radius.
  // At the rim the pipes stay clear even if their entire drop has occurred there.
  // During a level slide south, any bore crossing a post's Y band is no
  // farther east than where its centreline first meets the expanded south face.
  // The closest known post stands at X13475 on its western face (source-derived).
  const posts = readSelected().model.model.rwtReceivingInterface.east.retainedStructuralPenetrations.posts;
  const postX = Math.min(...posts.map(post=>post.plan[0]));
  const postY = Math.min(...posts.map(post=>post.plan[1])), radius = od/2+allowance;
  const topTieAxisY = 6150, tieHalfDepth = 50;
  const eastLeg = paths[1];
  const clippedY = Math.max(eastLeg[2][1], Math.min(rootsY, postY-radius));
  const eastAtPost = eastLeg[1][0]+centreOffset*(rootsY-clippedY)/(rootsY-offsetY);
  const headHalfWidth = 275;
  const fixedGuideYs = guides.map(g=>g[1]);
  const supportSpan = Math.max(...fixedGuideYs)-Math.min(...fixedGuideYs);
  const northReactionPerWeight = [outletY-shift-od/2,y+forkNorthAllowance].map(cg =>
    (cg-Math.min(...fixedGuideYs))/supportSpan);
  const crossTravel = 1650;
  const xLimits = [Math.min(...guides.map(g=>g[0]))-guideHalf, Math.max(...guides.map(g=>g[0]))+guideHalf];
  const parkedBox = [xLimits[0]+crossTravel-allowance,outletY-shift-od/2-allowance,
    xLimits[1]+crossTravel+allowance,y+forkNorthAllowance-shift+allowance];
  const tubeCgY = (lengths[0][1]*(rootsY+offsetY)/2+lengths[0][2]*(offsetY+outletY)/2)
    /(lengths[0][1]+lengths[0][2]);
  const budgets = [parent.duty,parent.blocked.longStateCombinedEBackupFlow].map(flow =>
    ({selected:headBudget(flow,length,grade),shallow:headBudget(flow,length,0.01)}));
  return {port,basin,spill,paths,lengths,lengthMm:length,ordinaryFlow:parent.duty,grade,od,bore,
    originalCatcherCutY:parent.high.mobile[1], rootsY, forkNorthAllowance, shift, guides,guideHalf,runnerY,
    separatedClearMm:paths[1][1][0]-paths[0][1][0]-od,
    // The parallel dogleg's cross-stream separation is smaller than its X spacing.
    doglegNormalClearMm:(paths[1][1][0]-paths[0][1][0])*(rootsY-offsetY)/lengths[0][1]-od,
    terminalAxisZ:effectiveTipZ, conservativeOutsideSoffitZ:effectiveTipZ-od/2,
    faultWaterClearAfterMovement:effectiveTipZ-od/2-allowance-parent.fault,
    rimClearAfterMovement:effectiveTipZ-od/2-allowance-(parent.fault+parent.choices.rimAllowance),
    terminalSideMargins:[paths[0].at(-1)[0]-od/2-basin[0],basin[0]+basin[2]-paths[1].at(-1)[0]-od/2],
    lipToNorthRim:rim-outletY, lipToSouthCrest:outletY-basin[1],
    stowedTipToSouthCrest:outletY-shift-basin[1], drawSouth:parent.drawFieldY[0],
    parkedClearOfDryField:parent.drawFieldY[0]-(y+forkNorthAllowance-shift+allowance),
    fixedGuideToRim:Math.min(...guides.map(g=>g[1]-guideHalf))-rim,
    minimumRailOverlap:Math.min(...guides.flatMap(g=>[
      g[1]-guideHalf-runnerY[0], runnerY[1]-shift-(g[1]+guideHalf)])),
    separateTubeCopperKg:straightPairM * Math.PI*(od**2-bore**2)/4e6*8960,
    separateTubeFullWaterKg:straightPairM * Math.PI*bore**2/4e6*1000,
    crossTravel,parkedBox,parkedXClearOfBasin:parkedBox[0]-basin[0]-basin[2],
    crossTravelClearOfPostsY:postY-parkedBox[3], parkedRunnerGapToRim:runnerY[0]-shift-rim,
    servingAndStowedTubeCgY:[tubeCgY,tubeCgY-shift],
    topTieAxisY, tieHalfDepth, crossTieToKnownPostY:postY-(topTieAxisY+tieHalfDepth+allowance),
    noseTieSweepsPost:runnerY[1]>postY && runnerY[1]-shift<postY,
    knownPostWestFace:postX, knownPostSouthFace:postY, commonHeadHalfWidth:headHalfWidth,
    headToKnownPostXAfterAllowance:postX-(x+headHalfWidth+allowance),
    eastBoreToKnownPostXInOccupiedY:postX-eastAtPost-radius,
    northReactionPerWeight,southReactionPerWeight:northReactionPerWeight.map(r=>1-r).reverse(),
    budgets, actualFittingLoss:null, upstreamAvailableHead:null, supportsQualified:false, adopted:false};
}

export function drawFork(f) {
  const scale=.134, px=x=>35+(x-12350)*scale, py=y=>100+(6900-y)*scale;
  const rect=(x,y,w,h,style)=>`<rect x="${px(x)}" y="${py(y+h)}" width="${w*scale}" height="${h*scale}" ${style}/>`;
  const line=(pts,style)=>`<polyline points="${pts.map(([x,y])=>px(x)+','+py(y)).join(' ')}" fill="none" ${style}/>`;
  const txt=(x,y,t,size=14)=>`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`;
  const p=['<svg xmlns="http://www.w3.org/2000/svg" width="920" height="750" viewBox="0 0 920 750">',
    '<title>Two separate outlets over the south receiver</title>',
    '<desc>The fork serves the basin, slides south to disconnect, then crosses east into a separate dry parking space.</desc>',
    '<rect width="920" height="750" fill="#fffdf8"/><g font-family="sans-serif" fill="#20352e">',
    txt(32,40,'Two separate outlets over the south receiver',26),txt(32,68,'Plan detail   /   north up   /   dimensions in millimetres'),
    rect(12350,f.drawSouth,3200,450,'fill="#f1e8d9"'),rect(...f.basin,'fill="#dcebe6" stroke="#6e8a7e"'),
    rect(f.spill[0],f.spill[1]+f.spill[3]-330,f.spill[2],330,'fill="#eef3ee" stroke="#6e8a7e"')];
  const [x0,y0,x1,y1]=f.parkedBox;
  p.push(rect(x0,y0,x1-x0,y1-y0,'fill="#f0f0e8" stroke="#777f70" stroke-dasharray="5 4"'));
  for(const station of [f.guides[0],f.guides[2]]){
    p.push(line([station,[f.guides[1][0]+f.crossTravel,station[1]]],'stroke="#969887" stroke-dasharray="3 4"'));
  }
  for(const [x,y] of f.guides) p.push(rect(x-f.guideHalf,y-f.guideHalf,2*f.guideHalf,2*f.guideHalf,'fill="#898b7b"'));
  for(const path of f.paths) {
    p.push(line(path,`stroke="#4c7165" stroke-width="${f.od*scale}" stroke-linejoin="round"`),
           line(path,'stroke="#e8f4ed" stroke-width="1.5" stroke-dasharray="5 4"'),
           line(path.map(([x,y])=>[x+f.crossTravel,y-f.shift]),'stroke="#777f70" stroke-width="2" stroke-dasharray="5 4"'));
  }
  p.push(line([[12350,f.originalCatcherCutY],[14150,f.originalCatcherCutY]],'stroke="#924f3d" stroke-width="1.5" stroke-dasharray="5 4"'),
    txt(45,py(f.basin[1])-13,'South spill crest',13),txt(49,py(f.basin[1])+32,'Spill continues south',12),
    txt(291,py(f.drawSouth)-8,'Dry draw lane',12),txt(73,py(f.basin[1]+f.basin[3])+19,'Basin',12),
    txt(505,123,'SERVING',17),txt(505,149,'Two enclosed bores cross the old failure plane,'),
    txt(505,169,'marked in rust. Each ends over the south basin.'),
    txt(505,215,'ISOLATED AND DRAINED',17),txt(505,242,'Release one upstream joint. Move 460 south,'),
    txt(505,262,'then 1650 east to the dashed dry parking box.'),
    txt(505,302,'During the first move the tips still overhang water.'),
    txt(505,322,'The permanent pipe stays locked until the fork is parked.'),
    txt(505,376,'GREY GUIDE HEADS',17),txt(505,402,'Two east–west travel lines stay on the dry side'),
    txt(505,422,'of the north rim. Guide support and anchors are proposed.'),
    txt(505,478,'ONE BRANCH BLOCKED',17),txt(505,505,'The other bore needs the full flow. The upstream'),
    txt(505,525,'fork, receiving basin and final outfall remain shared.'),
    txt(32,729,'Design comparison. Receiver levels, joint access, lifting, supports and freedom from backwater remain open.',13),'</g></svg>');
  return p.join('\n')+'\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const f=forkStudy();
  for(const [extension,data] of [['json',JSON.stringify(f,null,2)+'\n'],['svg',drawFork(f)]]){
    const file=fileURLToPath(new URL('./forked-side-outlet.'+extension,import.meta.url));
    if(process.argv.includes('--check')){
      if(fs.readFileSync(file,'utf8')!==data) throw Error('Stale '+file);
    }else fs.writeFileSync(file,data);
  }
}
