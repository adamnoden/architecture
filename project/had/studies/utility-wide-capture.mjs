import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {pathSeparation,segmentBodyDistance} from './service-interface-geometry.mjs';
import {terminalVertices,utilityH0,utilityHeadObstacles,utilityHeadSweeps,utilityTerminalStudy} from './incoming-water-terminal.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const settingMM=10;
const clearanceMM=25;
const round=value=>Number(value.toFixed(5));
const dist=(path,measure,radius)=>Math.min(...path.path.slice(1).map((p,i)=>measure(path.path[i],p)))-radius-path.hausdorffError-settingMM;
const gap=(path,box,radius)=>dist(path,(a,b)=>exactSegmentBoxDistance(a,b,box),radius);
const boxGap=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)))-settingMM;
const pair=(a,b,radius)=>pathSeparation(a.path,b.path)-radius-a.hausdorffError-b.hausdorffError-settingMM;

export function deriveUtilityWideCapture(){
  const {model}=deriveCurrentHouse();
  const input=read('./incoming-water.json');
  const predecessor=read('./utility-cutover-lift.json');
  const host=read('../../ias/studies/utility-host-revised-route.json');
  const frame=Object.fromEntries(Object.entries(host.geometry.frame).map(([id,box])=>[id,[box[0]-10,...box.slice(1)]]));
  const virtualHost={...host,geometry:{...host.geometry,frame}};
  const x=10840,y=1345;
  const hotIsolation={...utilityH0,axis:[x,y,1500],wheel:[x,y+95,1500],bodyBox:[x-37,y-37,1417.5,74,147,165]};
  const coldPath=input.utility.vertices.cold;
  const hotPath=input.utility.vertices.hot.map((p,i)=>i<2?p:i===2?[x,p[1],p[2]]:[x,y,p[2]]);
  const hotDrainTee=[11300,1275,365];
  const hotVertices=[[x,y,1000],[x,y,950],[10808,1375,750],[10808,1375,381],[10800,1000,375],[11300,1000,369],hotDrainTee,terminalVertices.hotSink.at(-1)];
  const cold=finiteBends(coldPath),hot=finiteBends(hotPath);
  const hotTail=finiteBends(hotVertices,25);
  const coldTails=Object.fromEntries(Object.entries(terminalVertices).filter(([id])=>id!=='hotSink').map(([id,v])=>[id,finiteBends(v,25)]));
  const oldHotOnly=finiteBends(hotPath.map((p,i)=>i>2?[p[0],1250,p[2]]:p));
  const fixed=utilityHeadObstacles(model);
  fixed.frame[0]-=10;
  fixed.H0=hotIsolation.bodyBox;
  fixed.hotCap=[x-37,y-37,963,74,74,2019];
  const head=[10915,735,935,620,610,700];
  const moves=[[0,0,0],[0,760,0],[-720,760,0],[-720,760,-585]];
  const stages=utilityHeadSweeps(head,moves,fixed).map(({stage,box,obstacles})=>{
    const closest=obstacles.reduce((least,item)=>item.gapMM<least.gapMM?item:least);
    const pressure=[gap(cold,box,37),gap(hot,box,37),gap(hotTail,box,25)];
    return {stage,box,closest:closest.id,obstacleMM:round(closest.gapMM-settingMM),
      pressureMM:pressure.map(round),clearanceMM:round(Math.min(closest.gapMM-settingMM,...pressure))};
  });
  const services=model.architecturalServices.utility;
  const fan=model.architecturalServices.fanAccess.find(item=>item.id==='utility');
  const base=read('../../mat/studies/whole-house-service-baseline.json');
  const heat=base.heat.emitterSchedule.find(e=>e.id==='utility-E');
  const heatPath=heat.pressurePairBranchPlan.map(point=>[...point,heat.upperBranchAxisLocal]);
  heatPath.push([...heat.pressurePairBranchPlan.at(-1),0]);
  const staticClear={
    fanWithSupportsMM:round(Math.min(pathSeparation(hot.path,fan.path)-fan.selectedRoute.maximumCollarOD/2-20-37-hot.hausdorffError,
      pathSeparation(hotTail.path,fan.path)-fan.selectedRoute.maximumCollarOD/2-20-25-hotTail.hausdorffError)-settingMM),
    heatPairMM:round(Math.min(pathSeparation(hot.path,heatPath)-84-37-hot.hausdorffError,
      pathSeparation(hotTail.path,heatPath)-84-25-hotTail.hausdorffError)-settingMM),
    condensateMM:round(Math.min(pathSeparation(hot.path,fan.ceilingTrapDrainPort.path)-fan.ceilingTrapDrainPort.maximumDrainOD/2-37-hot.hausdorffError,
      pathSeparation(hotTail.path,fan.ceilingTrapDrainPort.path)-fan.ceilingTrapDrainPort.maximumDrainOD/2-25-hotTail.hausdorffError)-settingMM),
  };
  const workBoxes={
    washer:[...services.washer.slice(0,2),0,services.washer[2],services.washerFirstRest[1]+services.washerFirstRest[3]-services.washer[1],848],
    PV:[...services.PVworkingField.slice(0,2),0,...services.PVworkingField.slice(2),2800],
    electrical:[...services.electricalWorkingField.slice(0,2),0,...services.electricalWorkingField.slice(2),2800],
  };
  const workClear=Object.fromEntries(Object.entries(workBoxes).map(([id,b])=>[id,round(Math.min(gap(hot,b,37),gap(hotTail,b,25)))]));
  const fanReach=(a,b)=>segmentBodyDistance(a,b,fan.selectedRoute.maintenance.body,[700,fan.workerEquipmentRequirement.maximumHeadTopLocal],300);
  workClear.fan=round(Math.min(dist(hot,fanReach,37),dist(hotTail,fanReach,25)));
  const caseOptions=predecessor.cutover.releaseCandidate;
  const rearLinks={original:[10875,700,300,20,485,20],candidate:[10875,700,290,20,485,20]};
  const hotShoulder=[11185,1725,1450];
  const operations=utilityTerminalStudy(model,virtualHost,{
    headBodyBottom:caseOptions.headBodyBottom,headBodyX:10925,toolZ:caseOptions.toolZ,
    drainShoulder:caseOptions.drainShoulder,receiver:caseOptions.receiver,hotDrainTee,hotVertices,hotIsolation,hotShoulder,rearLowerLinkZ:290,
  });
  const contactedLegs=Object.entries(frame).filter(([id])=>id.startsWith('sole')).map(([id,b],i)=>{
    const [sx,sy,sw,sd]=host.floorAndWall.seatPlan[i];
    return {id,box:b,marginMM:Math.min(b[0]-sx,b[1]-sy,sx+sw-b[0]-b[3],sy+sd-b[1]-b[4])};
  });
  const seatStand=[10160,1465,0,690,670,700];
  const transferBody=[10195,1495,350,620,610,700];
  const standMargins=[
    transferBody[0]-seatStand[0],seatStand[0]+seatStand[3]-transferBody[0]-transferBody[3],
    transferBody[1]-seatStand[1],seatStand[1]+seatStand[4]-transferBody[1]-transferBody[4],
  ];
  const hotHand=operations.hotIsolation.handCentre;
  const sways=operations.hotIsolation.fixedObjectClearances.flatMap(row=>[row.handMM,row.armMM]);
  const coldCapClearance=exactSegmentBoxDistance(operations.hotIsolation.shoulder,hotHand,fixed.coldCap)-40-settingMM;
  return {
    disposition:'PREFER_WIDER_RESERVATION_FOR_JOINED_DETAIL',
    candidate:'620 mm complete captured head with a dedicated hot riser turn and 10 mm bench shift west',
    package:head, bareTop:[10925,740,600,600],moves,stages,workClear,staticClear,
    hot:{body:fixed.H0,cap:fixed.hotCap,backbone:hotPath,terminal:hotVertices,
      westOnlyGapMM:round(pair(cold,oldHotOnly,74)),pairedBackbonesMM:round(pair(cold,hot,74)),
      lowerToColdBranchesMM:round(Math.min(...Object.values(coldTails).map(route=>pair(hotTail,route,50)))),
      upperToColdBranchesMM:round(Math.min(...Object.values(coldTails).map(route=>pair(hot,route,62)))),
      lowerToColdBackboneMM:round(pair(hotTail,cold,62)),
      nearestTerminalObstacles:operations.pipeClearances.hotSink.slice(0,5).map(({obstacle,gapMM})=>({obstacle,afterSettingMM:round(gapMM-settingMM)})),
      wasteClearAfterSettingMM:round(operations.wasteGapsMM.hotSink-settingMM),
      localHotHandMM:round(Math.min(...sways)-settingMM),coldCapArmMM:round(coldCapClearance),
      controlAfterLanding:{shoulder:hotShoulder,reachMM:round(operations.hotIsolation.reachMM),
        bodyToStandMM:hotShoulder[0]-300-(seatStand[0]+seatStand[3])-settingMM},
      rectangularColdAttachmentMM:round(boxGap(fixed.H0,fixed.coldCap)),
      rearLowerLink:{...rearLinks,originalGapMM:round(gap(hotTail,rearLinks.original,25)),
        revisedGapMM:round(gap(hotTail,rearLinks.candidate,25)),coldBranchClearancesMM:Object.fromEntries(
          Object.entries(coldTails).map(([id,path])=>[id,round(gap(path,rearLinks.candidate,25))]))},
      carryBarGapMM:round(gap(hotTail,frame['temporary carry bar'],25)),
    },
    release:{
      headWorkingBottom:caseOptions.headBodyBottom,spannerZ:caseOptions.toolZ,
      tools:operations.tool.checks.map(row=>({id:row.id,clearanceMM:round(row.toolGapLowerMM-settingMM),reachMM:round(row.maxReachUpperMM)})),
      drains:operations.controlledDrain.drains.map(row=>({id:row.id,armMM:round(Math.min(...row.clearance.map(item=>item.armMM))-settingMM),
        pipeMM:round(Math.min(...row.clearance.map(item=>item.pipeMM))-settingMM)})),
      receiverAfterSettingMM:operations.controlledDrain.receiverInsertionMinimumMM-settingMM,
      coldTerminalClearances:Object.fromEntries(['coldSink','coldWasher'].map(id=>{
        const {obstacle,gapMM}=operations.pipeClearances[id].find(row=>row.obstacle!=='valve reaction arm');
        return [id,{obstacle,afterSettingMM:round(gapMM-settingMM)}];
      })),
      retainedWasherSupportContactUnchanged:round(operations.pipeClearances.coldWasher[0].gapMM)===round(input.utilitySuccessor.pipeClearances.coldWasher[0].gapMM),
      capturedHeadInitialTravelMM:385,stand:seatStand,standMargins,standToHotTailMM:round(gap(hotTail,seatStand,25)),contactedLegs,
      hotValveToColdCapMM:round(exactSegmentBoxDistance([10760,1250,963],[10760,1250,2762],fixed.H0)-37-settingMM),
    },
  };
}

function drawing({hot,package:head,bareTop,release,stages}){
  const x=value=>60+(value-10000)*.43;
  const y=value=>482-(value-650)*.25;
  const rect=(a,b,w,d,fill)=>`<rect x="${x(a)}" y="${y(b+d)}" width="${w*.43}" height="${d*.25}" fill="${fill}" stroke="#3c514c"/>`;
  const label=(a,b,copy)=>`<text x="${a}" y="${b}">${copy}</text>`;
  const drop=hot.terminal.map(p=>`${x(p[0])},${y(p[1])}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 640" role="img" aria-labelledby="title description">
<title id="title">Make space for the complete utility head capture</title>
<desc id="description">Plan with a wider start and receiving stand, a moved hot control, and its new lower route to the existing sink union.</desc>
<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0l6 3-6 3z" fill="#356252"/></marker></defs>
<style>text{font:16px sans-serif;fill:#263d36}.title{font:bold 29px sans-serif}</style>
<rect width="1000" height="640" fill="#fbf7ec"/>
<text x="35" y="46" class="title">Carry the complete 620 mm package</text>
${label(35,73,'House plan, millimetres · Local occupied states shown in sequence')}
${rect(11570.5,650,100,1560,'#d8c7a5')}
${rect(release.stand[0],release.stand[1],release.stand[3],release.stand[4],'#d5e7d8')}
${rect(head[0],1495,head[3],head[4],'#dde2eb')}
${rect(head[0],head[1],head[3],head[4],'#f2d1af')}
${rect(...bareTop,'#ecc498')}
${rect(10723,1213,74,74,'#a2bdcd')}
${rect(hot.body[0],hot.body[1],hot.body[3],hot.body[4],'#ce886a')}
<polyline points="${drop}" fill="none" stroke="#ae6042" stroke-width="2.5" stroke-dasharray="6 4"/>
<path d="M${x(11225)} ${y(1040)}V${y(1800)}H${x(10505)}" fill="none" stroke="#356252" stroke-width="3" marker-end="url(#arrow)"/>
${label(138,142,'Independent first rest')}
${label(470,145,'North transfer')}
${label(470,430,'Raised start')}
${label(800,116,'North ↑')}
${label(800,206,'East wall')}
${label(800,319,'620 mm envelope')}
${label(800,344,'600 mm bare top')}
${label(259,306,'Retained cold')}
${label(280,267,'New H0 position')}
${label(104,422,'Bend below the cold branch')}
<path d="M353 302l18 24M395 273l26 34M335 412l77-27" stroke="#65746b" fill="none"/>
<line x1="35" x2="960" y1="506" y2="506" stroke="#a0aaa3"/>
${label(35,535,`Raised transfer · 760 north, 720 west, 585 down · Modeled clearances ${stages.map(s=>s.clearanceMM).join(' / ')} mm.`)}
${label(35,566,'The hot run uses a lower turn and an independent drain. Lower the rack link from Z300 to Z290.')}
${label(35,597,'Actual supports, circular cold attachment, assembled capture and initial lift still require verification.')}
</svg>
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
  const result=deriveUtilityWideCapture();
  const outputs={json:JSON.stringify(result,null,2)+'\n',svg:drawing(result)};
  for(const [extension,content] of Object.entries(outputs)){
    const output=new URL(`./utility-wide-capture.${extension}`,import.meta.url);
    if(process.argv.includes('--write')) writeFileSync(output,content);
    else if(process.argv.includes('--check')) assert.equal(readFileSync(output,'utf8'),content);
    else if(extension==='json') process.stdout.write(content);
  }
}
