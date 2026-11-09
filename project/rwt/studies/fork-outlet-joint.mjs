import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {forkStudy, headBudget} from './forked-side-outlet.mjs';

// A cylinder fixed to the quarter-turned spout moves with its original bend.
// Undo the quarter-turn before comparing the complete cylinder to that prism.
export function stubFit(geometry, port, exposed, od = 159) {
  const c = 1/Math.hypot(1,geometry.fall), s = geometry.fall*c;
  const n = [c,0,-s], north = [0,1,0], up = [s,0,c];
  const anchor = geometry.axisAnchor;
  const delta = port.map((v,i)=>v-anchor[i]);
  const dot = (a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
  const near = anchor.map((v,i)=>v+n[i]*dot(n,delta)+up[i]*dot(north,delta)-north[i]*dot(up,delta));
  const far = near.map((v,i)=>v-exposed*up[i]);
  const bounds = near.map((v,i)=>{
    const radius = od/2*Math.hypot(n[i],north[i]);
    return [Math.min(v,far[i])-radius,Math.max(v,far[i])+radius];
  });
  const box = geometry.outletBox;
  const margins = bounds.map(([lo,hi],i)=>[lo-box[i],box[i]+box[3+i]-hi]);
  return {near,far,bounds,margins,maximumLengthAtLowerFace:exposed+margins[2][0]/c};
}

export function jointStudy() {
  const spool = JSON.parse(fs.readFileSync(new URL('./upper-first-release.json',import.meta.url),'utf8'));
  const lead = 247, fork = forkStudy({levelLeadMm:lead,rootsY:6100,grade:1/30});
  const [x,y,z] = fork.port;
  const exposed = 60, engagement = 31, gap = 2, casingWidth = 107, casingOd = 181, closingHeight = 212;
  const midY = y-exposed-gap/2;
  const casingY = [midY-casingWidth/2,midY+casingWidth/2];
  const fit = stubFit(spool.geometry,fork.port,exposed);
  const datumTrial = 5;
  const copperArea = Math.PI*(fork.od**2-fork.bore**2)/4;
  const waterArea = Math.PI*fork.bore**2/4;
  const copperKg = copperArea*(exposed+engagement)*8.96e-6;
  const exposedWaterKg = waterArea*exposed*1e-6;
  const gravity = 9.81, baseArm = spool.geometry.outletCorner[1]-y;
  // Copper inside the socket counts as metal. Count newly exposed water only;
  // the established gross bend-water allowance already includes the socket.
  const torqueNm = gravity*(copperKg*(baseArm+(exposed-engagement)/2)+exposedWaterKg*(baseArm+exposed/2))/1000;
  const casingTop = closingHeight - casingOd/2;
  const tool = {length:234,openingDegrees:18,headWidth:24,headThickness:10.2,handAllowance:35};
  const yReach = casingWidth/2+tool.length*Math.sin(tool.openingDegrees*Math.PI/360)+tool.handAllowance;
  const zReach = casingTop+tool.length+tool.handAllowance;
  // A proposed service territory. The closed catalogue dimensions do not give
  // the peeled gasket, the released pins, the installer or the assembly tool.
  const pocket = {x:[x-200,x+300],y:[midY-150,midY+150],z:[z-140,z+425]};
  const levelError = 10;
  const grades = fork.budgets.map(({selected})=>{
    const old = headBudget(selected.flowLps,fork.lengthMm,1/40,fork.bore,lead);
    return {flowLps:selected.flowLps,oldGradeMarginMm:old.remainingHeadAtK2Mm,
      marginMm:selected.remainingHeadAtK2Mm,afterLevelErrorMm:selected.remainingHeadAtK2Mm-levelError,
      limitingCombinedKAfterLevelError:selected.fittingKLimitAfterExit-levelError/selected.velocityHead};
  });
  const actualEndGapLimit = 5; // OD 159 OPEN-FLEX 1, no strip insert
  return {port:fork.port,exposed,engagement,gap,casingWidth,casingOd,closingHeight,casingY,midY,
    forkPlainEndY:y-exposed-gap,plainLandCoveredEach:(casingWidth-gap)/2,
    socketToCasingRoom:y-casingY[1],actualEndGapLimit,
    originalHalfWidthFit:stubFit(spool.geometry,fork.port,casingWidth/2),trialFit:fit,
    fabricationAllowance:datumTrial,leastPrismMarginAfterAllowance:Math.min(...fit.margins.flat())-datumTrial,
    copperKg,exposedWaterKg,addedWetTorqueBoundNm:torqueNm,
    remainingHardwareKgAfterWetStub:spool.nominalSpoolLoads.remainingHardwareKg-copperKg-exposedWaterKg,
    axialThrustNPerMetreDifferentialHead:waterArea*1e-6*1000*gravity,
    tool,pocket,casingTop,pocketSideReserveOverHandle:150-yReach,
    pocketHeightReserveOverHandle:425-zReach,minimumPocketToSplitterY:pocket.y[0]-fork.paths[0][0][1],
    pocketToKnownPostX:fork.knownPostWestFace-pocket.x[1],
    paths:fork.paths,splitY:fork.paths[0][0][1],rootsY:fork.rootsY,lead,totalLength:fork.lengthMm,grade:fork.grade,levelError,grades,
    doglegClear:fork.doglegNormalClearMm,rimClear:fork.rimClearAfterMovement,parkedBasinClear:fork.parkedXClearOfBasin,
    actualOpenAndToolSweep:null,actualLoss:null,supportsQualified:false,materialExceptionApproved:false};
}

export function jointFigure(j) {
  const svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 990 580" width="990" height="580">',
    '<title>Service joint at the removable rainwater fork</title>',
    '<desc>Plan of the straight joint and fork, with a larger axial section of the two plain tube ends and the removable coupling.</desc>',
    '<rect width="990" height="580" fill="#f9f8f3"/><g font-family="sans-serif" fill="#233936">'];
  const text=(x,y,t,size=14)=>svg.push(`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`);
  const line=(pts,col,sw=2,dash='')=>svg.push(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-dasharray="${dash}"/>`);
  const box=(x,y,w,h,fill,stroke='none')=>svg.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`);
  const ink='#344d49',water='#267477',copper='#a4633c',grey='#ccd1c4';
  text(32,39,'Service joint at the removable rainwater fork',25);
  text(32,67,'The clasp comes off before either the native spool or the outlet carriage moves.');
  text(32,110,'PLAN  /  NORTH UP',14);
  const xy=([x,y])=>[40+(x-12550)*.22,130+(6760-y)*.22];
  let [px,py]=xy([j.pocket.x[0],j.pocket.y[1]]);
  box(px,py,(j.pocket.x[1]-j.pocket.x[0])*.22,(j.pocket.y[1]-j.pocket.y[0])*.22,'#e3e3d5');
  line([xy(j.port),xy(j.paths[0][0])],copper,4);
  for(const path of j.paths) line(path.slice(0,2).map(xy),water,5);
  text(210,151,'Native socket');text(210,181,'Clasp and tool territory');text(210,214,'Common inlet');
  text(40,321,`Separate branch axes at Y${j.rootsY}.`);
  text(40,348,`Full ${j.lead} mm common reach charged at zero fall.`);
  text(40,375,`Both downstream legs fall 1 in ${1/j.grade}.`);
  text(453,110,'AXIAL SECTION  /  SOUTH TO THE LEFT',14);
  const sx=y=>505+(y-(j.port[1]-170))*1.9;
  const ax=254,scale=.72;
  const south=j.forkPlainEndY,north=j.port[1]-j.exposed;
  for(const [lo,hi] of [[j.port[1]-170,south],[north,j.port[1]+j.engagement]]) {
    for(const sign of [-1,1]) line([[sx(lo),ax+sign*79.5*scale],[sx(hi),ax+sign*79.5*scale]],copper,4);
  }
  for(const sign of [-1,1]) line(j.casingY.map(y=>[sx(y),ax+sign*j.casingOd/2*scale]),ink,6);
  for(const sign of [-1,1]) line([j.port[1],j.port[1]+j.engagement].map(y=>[sx(y),ax+sign*84*scale]),grey,5);
  line([[sx(j.midY),ax-82],[sx(j.midY),ax+81]],ink,1,'3 4');
  text(496,154,`${j.casingWidth} mm removable casing`);text(510,255,'Fork');text(818,255,'Spool');
  text(474,363,`${j.gap} mm nominal end gap. Both sealing lands are plain copper.`);
  text(474,389,`${j.exposed} mm exposed spigot / ${j.engagement} mm socket engagement trial.`);
  text(32,444,'WITH ONE BRANCH BLOCKED',15);
  const backup=j.grades[1];
  text(32,473,`At ${backup.flowLps.toFixed(3)} L/s and K = 2, ${backup.afterLevelErrorMm.toFixed(1)} mm remains after a ${j.levelError} mm adverse endpoint difference.`);
  text(32,503,'Test the actual inlet, fitting loss, level control and common receiver before relying on the second route.');
  text(32,552,'Dimensional comparison. The gasket, tool opening, independent restraints and discharge are unqualified.',13);
  return [...svg,'</g></svg>',''].join('\n');
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const j = jointStudy();
  for(const [ext,content] of [['json',JSON.stringify(j,null,2)+'\n'],['svg',jointFigure(j)]]) {
    const out = new URL(`./fork-outlet-joint.${ext}`,import.meta.url);
    if(process.argv.includes('--check')) {
      if(fs.readFileSync(out,'utf8')!==content) throw new Error(`Regenerate ${out.pathname}.`);
    } else fs.writeFileSync(out,content);
  }
}
