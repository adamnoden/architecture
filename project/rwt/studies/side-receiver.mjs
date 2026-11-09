import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
import {trigRange} from './bent-spool-control.mjs';

const directory = 'project/rwt/studies/';
const read = name => JSON.parse(fs.readFileSync(directory + name, 'utf8'));

// Clock only the outboard N18 elbow a quarter-turn south at fabrication.
// Its removal roll traverses the sector -90..0 of the original outlet box.
// In the basis (pipe axis, north, up-normal), t=0..90 has angle t-90.
function outletSweep(spool) {
  const {axisAnchor,fall,outletBox:box} = spool.geometry;
  const c=1/Math.hypot(1,fall), s=fall*c;
  const corners=[0,1].flatMap(i=>[0,1].flatMap(j=>[0,1].map(k=>[i,j,k].map((v,d)=>box[d]+v*box[3+d]))));
  const parts=corners.map(([x,y,z])=>{
    const dx=x-axisAnchor[0],dy=y-axisAnchor[1],dz=z-axisAnchor[2];
    const along=c*dx-s*dz,up=s*dx+c*dz;
    return {r:Math.hypot(dy,up),coeff:[
      [axisAnchor[0]+c*along,-s*dy,s*up],
      [axisAnchor[1],up,dy],
      [axisAnchor[2]-s*along,-c*dy,c*up]
    ]};
  });
  const boundsAt=phase=>[0,1,2].map(d=>{
    const values=parts.flatMap(p=>{
      const [a,b,c]=p.coeff[d];
      if(phase==='sweep'){const q=trigRange(a,b,c);return [q.min.value,q.max.value];}
      return [a+(phase==='installed'?b:c)];
    });
    return [Math.min(...values),Math.max(...values)];
  });
  const play=2*Math.max(...parts.map(p=>p.r))*Math.sin(Math.PI/360);
  return {installed:boundsAt('installed'),sweep:boundsAt('sweep'),locked:boundsAt('locked'),oneDegreeChord:play};
}

function highTurn(spool, low, east) {
  const [x,y,z]=spool.geometry.outletCorner;
  const nativeLeg=Math.hypot(...spool.geometry.freeOutlet.map((p,i)=>p-spool.geometry.outletCorner[i]));
  const port=[x,y-nativeLeg,z], radius=79.5, sweep=outletSweep(spool);
  const allowance=10, shift=460, nose=port[1]+98, length=700, lip=nose-length;
  const offsetX=400, rim=low.northRimY-1300;
  const basin=[x+offsetX-low.basin[2]/2,rim-low.basin[3],low.basin[2],low.basin[3]];
  const spill=[basin[0],basin[1]-low.spill[3],basin[2],low.spill[3]];
  const crest=-1060, rearSill=-1005, roof=-740, shroudNorth=6535, tailNorth=6150;
  const mobile=[x-302,lip,604,length], parked=[mobile[0],lip-shift,mobile[2],length];
  const tailClear=680, tailLip=rim-east.splashReservation.upstreamOfLip;
  const tailLine=[[x,tailNorth],[x,5550],[x+offsetX,4950],[x+offsetX,tailLip]];
  const widths=[tailClear,tailClear,tailClear,low.limits[0].width];
  const edge=direction=>tailLine.map(([cx,cy],i)=>[cx+direction*(widths[i]/2+2),cy]);
  const tailPolygon=[...edge(-1),...edge(1).reverse()];
  const doglegLength=Math.hypot(600,offsetX), effectiveDoglegWidth=tailClear*600/doglegLength;
  const foundation=JSON.parse(fs.readFileSync('project/str/studies/current-house-grid.json','utf8'));
  const nearbyCaps=foundation.heads.filter(p=>p.xy[0]>11000 && p.xy[1]+p.capXY[1]/2>=spill[1]
    && p.xy[1]-p.capXY[1]/2<=rim).map(p=>({id:p.id,xy:p.xy,plan:p.capXY,capZ:p.capZ,
      excavationPlanGap:basin[0]-(p.xy[0]+p.capXY[0]/2)}));
  const fixedGuides=[6100,6230], guideHead=50, guideOffset=400;
  const guideSouth=fixedGuides[0],guideNorth=fixedGuides[1];
  // Per unit of supported gravity; extreme CG may lie at any point on box length.
  const northFractions=[parked[1],nose].map(cg=>(cg-guideSouth)/(guideNorth-guideSouth));
  const parkedNorth=parked[1]+parked[3], fixedNorth=guideNorth+guideHead/2;
  const deploymentX=spool.lowerTrackReference.bankSpanComparison.crossing.parkedEndX;
  const highestPool=Math.min(port[2]-radius-low.choices.outletAirGap,rearSill);
  const predictedEnergy=highestPool-crest+low.kineticCredit;
  const tailFloorAtRim=-1110-(tailNorth-5550+doglegLength+4950-rim)*low.grade;
  const rail=spool.lowerTrackReference.loweredTrack;
  const lowerSweepY=sweep.sweep[1][0]-allowance;
  const lockMargin=allowance+sweep.oneDegreeChord;
  const lowestLockedDraw=sweep.locked[2][0]-spool.renewal.translation*spool.geometry.fall-lockMargin;
  const lowestAtInstall=sweep.installed[2][0]-allowance;
  assert.deepEqual(spool.spatialStateProof.fieldY,low.drawFieldY);
  return {port,nativeLeg,basin,spill,rim,tailLine,tailPolygon,tailClear,effectiveDoglegWidth,nearbyCaps,tailFloorAtRim,mobile,parked,shift,
    rearSill,roof,crest,shroudNorth,fixedGuides,guideHead,guideOffset,highestPool,lowPort:port[2]-radius,
    headGainedAtLowestLip:port[2]-radius-low.lowPort,maximumEnergyAtBackspill:predictedEnergy,
    losslessAvailableMargins:low.limits.map(row=>predictedEnergy-row.minimumEnergy),
    halfWidthPoolAtZeroApproach:crest+low.limits[1].minimumEnergy,
    frontRecessFromOpenPipe:port[1]-shroudNorth,
    fixedTailToRim:tailFloorAtRim-2-5-(low.fault+low.choices.rimAllowance),
    operatingOverlapY:tailNorth-lip,parkedEndToRim:parked[1]-rim,parkedEndToDogleg:parked[1]-5550,
    lateralClearFromTerminalEach:(basin[2]-widths.at(-1))/2,
    widestMobileOrGuideY:Math.max(parkedNorth,fixedNorth),
    parkedPlanGapToDryField:low.drawFieldY[0]-Math.max(parkedNorth,fixedNorth),
    tailWallInternalGap:(tailClear-mobile[2])/2,
    mobileBearingOverlap:fixedGuides.map(p=>Math.min(p-guideHead/2-lip,parkedNorth-(p+guideHead/2))),
    guideToKnownPostX:Math.min(...east.retainedStructuralPenetrations.posts.map(p=>p.plan[0]))-(x+guideOffset+guideHead/2),
    northReactionPerUnitWeight:northFractions,southReactionPerUnitWeight:northFractions.map(f=>1-f).reverse(),
    filledBoxWaterKgUpper:.600*length/1000*((roof-(-1060))/1000)*1000,
    sweep,assumedCombinedRigidAndDeformation:allowance,stowedKitToRollY:lowerSweepY-Math.max(parkedNorth,fixedNorth),
    inletAndFrameToStowedKit:Math.min(spool.spatialStateProof.frameY[0],...spool.spatialStateProof.gated
      .filter(p=>p.id!=='native-outlet460box').map(p=>p.locked90Y[0]))-Math.max(parkedNorth,fixedNorth),
    installedBendToLowRearSill:lowestAtInstall-rearSill,installedBendToTallShroud:sweep.installed[1][0]-allowance-shroudNorth,
    outerBridgeGap:sweep.sweep[0][0]-allowance-spool.spatialStateProof.bridgeCasesAfterDeformation.at(-1).x[1],
    fixedRailEndToRollingBend:sweep.sweep[0][0]-allowance-deploymentX,
    lockedEndToTrackCapY:Math.min(sweep.locked[1][0]-lockMargin-(rail.pairedTrackAxesY[0]+rail.cap[0]/2),
      (rail.pairedTrackAxesY[1]-rail.cap[0]/2)-(sweep.locked[1][1]+lockMargin)),
    lowestLockedDraw,allDrawObstaclesQualified:false,hydraulicallyAccepted:false,siteAccepted:false};
}

// Deliberately gift a clean independent receiver and no downstream losses.
function blockedCatcher(high,low) {
  const flow=low.duty, floor=high.crest, firstWet=high.rearSill, sheet=low.choices.sheet;
  const longState=read('temporary-two-path-control.json').states.find(s=>s.state==='N LONG OPEN');
  const storageUpperLitres=low.limits[0].width*high.mobile[3]*(firstWet-floor)/1e6;
  const accessAllowance=high.assumedCombinedRigidAndDeformation;
  const guideNorth=high.fixedGuides[1]+high.guideHead/2;
  const drawSouth=low.drawFieldY[0], grossSlot=drawSouth-guideNorth-2*accessAllowance;
  const clearSlot=grossSlot-2*sheet, north=drawSouth-accessAllowance, south=guideNorth+accessAllowance;
  const slotY=(north+south)/2, westWall=high.mobile[0];
  const minimumEnergy=width=>1500*Math.cbrt((flow/width)**2/9.81);
  const maximumQuietCapacity=(width,head)=>width*Math.sqrt(9.81)*(head/1500)**1.5;
  const idealAtFloor=firstWet-floor+low.kineticCredit;
  // Independent low-side opening at -1045 may assist during ordinary partial
  // obstruction. Also test the stronger always-wet opening at the tray floor.
  const slotCrest=-1045, available=firstWet-slotCrest+low.kineticCredit;
  const cornerX=12450, elbowY=4900, terminalX=12875, lipY=4500;
  const line=[[westWall,slotY],[cornerX,slotY],[cornerX,elbowY],[terminalX,elbowY],[terminalX,lipY]];
  const invert=-1100, pathLength=line.slice(1).reduce((l,p,i)=>l+Math.hypot(p[0]-line[i][0],p[1]-line[i][1]),0);
  const grade=low.grade, rimFrame=high.basin[1]+high.basin[3], lipInvert=invert-pathLength*grade;
  const catchBox=[cornerX-grossSlot/2,south,westWall-cornerX+grossSlot/2,grossSlot];
  const mainWestAtElbow=high.tailLine[1][0]+(high.tailLine[2][0]-high.tailLine[1][0])*
    ((high.tailLine[1][1]-(elbowY+grossSlot/2))/(high.tailLine[1][1]-high.tailLine[2][1]))-high.tailClear/2-sheet;
  return {storageUpperLitres,longStateCombinedEBackupFlow:longState.combinedEBackupDutyLps,
    secondsAtLongCombinedEBackup:storageUpperLitres/longState.combinedEBackupDutyLps,secondsToFirstLowEdge:storageUpperLitres/flow,firstWet,lowCurbY:[high.shroudNorth,high.mobile[1]+high.mobile[3]],
    guideNorth,drawSouth,accessAllowance,grossSlot,clearSlot,slotCrest,south,north,available,idealAtFloor,
    sideSlotMaximumQuietCapacity:maximumQuietCapacity(clearSlot,available),
    upperSecondsWithServingSlot:storageUpperLitres/(flow-maximumQuietCapacity(clearSlot,available)),
    flushMaximumQuietCapacity:maximumQuietCapacity(clearSlot,idealAtFloor),
    flushDeficit:minimumEnergy(clearSlot)-idealAtFloor,minimumFlushWidth:flow/(Math.sqrt(9.81)*(idealAtFloor/1500)**1.5),
    zeroClearanceGross:drawSouth-guideNorth,zeroClearanceCleanHeadMargin:idealAtFloor-minimumEnergy(drawSouth-guideNorth),
    quarterBlockedEvenWithNoMargins:minimumEnergy((drawSouth-guideNorth)*.75)-idealAtFloor,
    catchBox,line,lipInvert,entryInvert:invert,terminalFall:grade,lipY,rimFrame,
    bypassToMainAtTopRun:high.tailPolygon[0][0]-(cornerX+grossSlot/2),
    bypassToMainAtDogleg:mainWestAtElbow-(terminalX+grossSlot/2),
    basinLeftMargin:terminalX-grossSlot/2-high.basin[0],basinFarMargin:lipY-high.basin[1],
    outletToRimAtCrossing:lipInvert+(rimFrame-lipY)*grade-sheet-5-(low.fault+low.choices.rimAllowance),
    physicallyAdmitted:false,receiverIndependentAgainstCommonSiteFlood:false};
}

// Trial only: preserve the native outlet, rotate the entire receiving territory
// south and let a removable quiet header feed it without a pressure joint.
export function sideReceiver() {
  const had = readSelected().model;
  const east = had.model.rwtReceivingInterface.east;
  const spool = read('upper-first-release.json');
  const duty = read('selected-water-event.json').duty.flowLps;
  const [portX, portY, portZ] = spool.geometry.freeOutlet;
  const [oldX, oldY, basinLength, basinWidth] = east.receiverBounds;
  const spillLength = east.blockedOutletSpill.requiredContinuation[2];
  const sourcePosts = east.retainedStructuralPenetrations.posts.map(post => post.plan);
  const southPostFace = Math.min(...sourcePosts.map(post => post[1]));
  const northRimY = 6050;
  const southEdgeY = northRimY - basinLength;
  const basin = [portX - basinWidth / 2, southEdgeY, basinWidth, basinLength];
  const spill = [basin[0], southEdgeY - spillLength, basinWidth, spillLength];
  const farLipY = northRimY - east.splashReservation.upstreamOfLip;
  const crestY = portY - 200;
  const clearWidth = east.terminal.waterClear;
  const grade = 0.01;
  // The lowest point of a nominal 159 OD circular exit normal to the native
  // outlet axis. A flat centred point would overstate the available air gap.
  const lowPort = portZ - 159 / 2 * Math.abs(spool.geometry.flangeNormal[0]);
  const fault = east.blockedOutletSpill.maximumFaultedReceiverWater;
  const choices = {rimAllowance:25, undersideGap:5, downwardMovement:5, sheet:2,
    outletAirGap:10, maximumQuietApproachVelocityMps:0.15};
  const crestAboveRim = choices.undersideGap + choices.downwardMovement + choices.sheet
    + (crestY - northRimY) * grade;
  const minimumCrest = fault + choices.rimAllowance + crestAboveRim;
  const highestPool = lowPort - choices.outletAirGap;
  const kineticCredit = choices.maximumQuietApproachVelocityMps ** 2 / (2 * 9.81) * 1000;
  const availableEnergyMm = highestPool - minimumCrest + kineticCredit;
  const limits = [clearWidth, clearWidth / 2].map(width => {
    const unitFlow = (duty / 1000) / (width / 1000);
    const criticalDepth = 1000 * Math.cbrt(unitFlow ** 2 / 9.81);
    const minimumEnergy = 1.5 * criticalDepth;
    return {width, criticalDepth, minimumEnergy, deficit:minimumEnergy - availableEnergyMm,
      maximumRimAllowance:highestPool + kineticCredit - fault - crestAboveRim - minimumEnergy};
  });
  const chute = [portX - clearWidth / 2 - choices.sheet, farLipY,
    clearWidth + 2 * choices.sheet, portY + 200 - farLipY];
  const fixedRailEnd = spool.lowerTrackReference.bankSpanComparison.crossing.parkedEndX;
  assert.deepEqual(east.receiverBounds, spool.geometry.receiver);
  assert(crestY > northRimY && farLipY < northRimY);
  const low = {duty, port:[portX,portY,portZ], lowPort, basin, spill, oldBasin:[oldX,oldY,basinLength,basinWidth],
    oldSpill:east.blockedOutletSpill.requiredContinuation, nativeHorizontalAxisAtBend:spool.geometry.outletCorner[2], northRimY, southPostFace,
    southPostClear:southPostFace-northRimY,
    drawFieldY:spool.spatialStateProof.fieldY, northStage:spool.renewal.stage,
    landwardFaceToHouse:basin[0]-12000, lateralMargin:(basinWidth-clearWidth)/2,
    lipDownstreamPlan:farLipY-southEdgeY, farLipY, crestY, chute,
    chuteToParkedTrack:chute[0]-fixedRailEnd, fixedRailEnd, chuteToPost:Math.min(...sourcePosts.map(p=>p[0]))-chute[0]-chute[2],
    grade, choices, fault, crestAboveRim, minimumCrest, highestPool, kineticCredit, availableEnergyMm, limits,
    intakeAdmitted:false, maintenanceAdmitted:false, receiverAdopted:false};
  const high=highTurn(spool,low,east);
  return {...low,high,blocked:blockedCatcher(high,low)};
}

export function drawing(o) {
  const px = x => 92 + (x-12000)*0.151, py = y => 565 - (y-2400)*0.088;
  const rect = ([x,y,w,h], colour, extra='') =>
    `<rect x="${px(x)}" y="${py(y+h)}" width="${w*.151}" height="${h*.088}" fill="${colour}" ${extra}/>`;
  const label = (x,y,s,size=16) => `<text x="${x}" y="${y}" font-size="${size}">${s}</text>`;
  const datum = z => 420-(z+1250)*2.5;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="1505" viewBox="0 0 1320 1505"><rect width="1320" height="1505" fill="#fbfaf5"/><g font-family="sans-serif" fill="#263d42">';
  s+=label(35,42,'South receiver comparison',29)+label(35,72,'Ordinary wet route and the straight renewal lane · dimensions in mm',16);
  s+=rect(o.oldBasin,'none','stroke="#89969b" stroke-dasharray="6 5"')+rect(o.oldSpill,'none','stroke="#89969b" stroke-dasharray="6 5"');
  s+=rect([12250,o.drawFieldY[0],3750,o.drawFieldY[1]-o.drawFieldY[0]],'#ded9c8');
  s+=rect(o.spill,'#d0dbc6')+rect(o.basin,'#bad1d3')+rect(o.chute,'#6a8485');
  s+=`<circle cx="${px(o.port[0])}" cy="${py(o.port[1])}" r="5" fill="#804a33"/>`;
  s+=label(96,113,'N ↑')+label(330,py(6800),'Removal lane')+label(125,py(5000),'Receiver')+label(120,py(3350),'South spill');
  s+=label(94,645,'Dashed outline · original basin and east spill',15);
  s+=label(94,610,'West edge is only '+o.landwardFaceToHouse.toFixed(0)+' from the nominal east façade.',15);
  s+=label(735,115,'Quiet-header section at full duty',22);
  const marks=[
    [o.lowPort,'Lowest native outlet lip','#725640'],
    [o.highestPool,'Highest permitted pool','#297080'],
    [o.minimumCrest,'Minimum clean outlet crest','#8d493e'],
    [o.fault+o.choices.rimAllowance,'Trial north retaining crest','#536b57'],
    [o.fault,'Fault-water datum','#358699']
  ];
  for(const [z,name,c] of marks){
    s+=`<path d="M740 ${datum(z)}h120" stroke="${c}" stroke-width="3"/>`+label(875,datum(z)+5,`${name}  ${z.toFixed(1)}`,15);
  }
  s+=label(735,490,`Available specific energy   ${o.availableEnergyMm.toFixed(1)} mm`,18);
  s+=label(735,525,`Minimum at the full-width crest   ${o.limits[0].minimumEnergy.toFixed(1)} mm`,18);
  s+=label(735,572,'Quiet tray rejected at the trial rim margin.',18);
  const h=o.high, hx=x=>80+(x-11600)*.19, hy=y=>1160-(y-1000)*.065;
  const highRect=([x,y,w,t],fill,extra='')=>
    `<rect x="${hx(x)}" y="${hy(y+t)}" width="${w*.19}" height="${t*.065}" fill="${fill}" ${extra}/>`;
  s+=label(35,713,'Turn before dropping · withdraw the catcher on land',26);
  s+=highRect([12250,o.drawFieldY[0],2550,o.drawFieldY[1]-o.drawFieldY[0]],'#ded9c8');
  s+=highRect(h.basin,'#bad1d3')+highRect(h.spill,'#d0dbc6');
  s+=`<polygon points="${h.tailPolygon.map(([x,y])=>hx(x)+','+hy(y)).join(' ')}" fill="#61888b"/>`;
  s+=highRect(h.parked,'none','stroke="#714862" stroke-width="2.5" stroke-dasharray="4 2"');
  s+=highRect(h.mobile,'none','stroke="#614831" stroke-width="2.5"');
  for(const cap of h.nearbyCaps) {
    const [x,y]=cap.xy,[w,t]=cap.plan;
    s+=highRect([x-w/2,y-t/2,w,t],'#929594')+label(hx(x-w/2),hy(y)-4,cap.id,13);
  }
  s+=label(390,hy(6950),'Dry draw field',14)+label(420,hy(6000),'Fixed tray turns east',14);
  s+=label(hx(h.basin[0])+8,hy(3650),'Basin',15)+label(hx(h.spill[0])+8,hy(1800),'Spill',15);
  s+=label(70,1203,'Solid box · serving. Dashed box · parked. Grey · source pile caps.',15);
  s+=label(740,780,'Horizontal outlet and parked catcher',21);
  s+=label(740,829,`Operating port Y${h.port[1]} / Z${h.port[2].toFixed(1)} faces south.`,17);
  s+=label(740,875,`The ${h.mobile[3]} mm catcher slides ${h.shift} mm before the pipe rolls.`,17);
  s+=label(740,921,`Parked equipment stays ${h.parkedPlanGapToDryField} mm from the draw field.`,17);
  s+=label(740,967,`Half-width ideal margin at the rear sill: ${h.losslessAvailableMargins[1].toFixed(1)} mm.`,17);
  s+=label(740,1013,`Plan gap to the nearest represented cap: ${Math.min(...h.nearbyCaps.map(p=>p.excavationPlanGap)).toFixed(1)} mm.`,17);
  s+=label(740,1073,'Tilted, obstructed or splashing water can wet the dry lane.',16);
  s+=label(740,1110,'Tail flow, support reactions and actual ground remain open.',16);
  const b=o.blocked;
  s+=label(35,1265,'Complete forward blockage · the rear and low side curbs are first to wet',23);
  s+=`<polyline points="${b.line.map(([x,y])=>hx(x)+','+hy(y)).join(' ')}" stroke="#9a582f" stroke-width="3" stroke-dasharray="5 3" fill="none"/>`;
  s+=label(38,1310,`At ${o.duty.toFixed(3)} L/s the empty catcher reaches −1005 in at most ${b.secondsToFirstLowEdge.toFixed(2)} s.`,17);
  s+=label(38,1350,'Dashed ochre in the plan · proposed separate route to the south basin.',16);
  s+=label(38,1390,`West guide ends Y${b.guideNorth}. Dry lane starts Y${b.drawSouth}.`,16);
  s+=label(38,1430,`Clear slot ${b.clearSlot} mm. Ideal width needed even at the floor ${b.minimumFlushWidth.toFixed(1)} mm.`,16);
  s+=label(38,1470,'Reject this single side slot. The blocked state still lacks a contained escape.',17);
  return s+'</g></svg>\n';
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = sideReceiver();
  for (const [file, data] of [['side-receiver.json', JSON.stringify(result,null,2)+'\n'], ['side-receiver.svg', drawing(result)]]) {
    if (process.argv.includes('--check')) assert.equal(fs.readFileSync(directory+file,'utf8'),data);
    else fs.writeFileSync(directory+file,data);
  }
}
