/** Unselected utility frame first-rest comparator for HAD-INLET-RESOLUTION.
 *
 * Replays the recovered Y1110 lower crossings and 285 mm north shift
 * against the exact main-house and IAS frame sources. A geometric check is
 * NOT a selected services interface, product rating or physical lift plan.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>readFileSync(new URL(path,root));
const blob=buf=>createHash('sha1').update('blob '+buf.length+'\0').update(buf).digest('hex');
const hostPath='project/ias/studies/utility-host-revised-route.json';
const housePath='project/had/studies/water-replan.json';
const HOST_BLOB='69e6b0aa5e1847f09c7ac3da3b98eec9bf1d5c0b';

const moved=(box,shift)=>[...box.slice(0,3).map((n,i)=>n+shift[i]),...box.slice(3)];
const swept=(box,a,b)=>[...box.slice(0,3).map((n,i)=>n+Math.min(a[i],b[i])),
  ...box.slice(3).map((n,i)=>n+Math.abs(b[i]-a[i]))];
const boxGap=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)));
const rectIn=(inner,outer)=>[0,1].every(i=>inner[i]>=outer[i]&&inner[i]+inner[i+3]<=outer[i]+outer[i+3]);
const plus=(a,b)=>a.map((v,i)=>v+b[i]);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const pathBox=(route,box)=>Math.min(...route.path.slice(1).map((p,i)=>
  exactSegmentBoxDistance(route.path[i],p,box)))-25-route.hausdorffError;

export const utilityRestVertices={
  coldWasher:[[10760,1250,1000],[10760,1250,950],[10800,1250,900],[10800,1250,750]],
  coldSink:[[10800,1250,900],[10800,835,900],[10800,835,500],
    [10800,1110,500],[11110,1110,500],[11110,1275,500],[11110,1275,595]],
  hotSink:[[10860,1250,1000],[10860,1250,950],[10860,750,950],
    [10800,750,950],[10800,750,400],[10800,1110,400],
    [11300,1110,400],[11300,1275,400],[11300,1275,595]],
};

export function utilityFirstRestPreflight(){
  const hostBytes=read(hostPath);
  assert.equal(blob(hostBytes),HOST_BLOB,'IAS host geometry changed: rebase the utility first-rest candidate');
  const host=JSON.parse(hostBytes);
  const h=JSON.parse(read(housePath)).model;
  assert.equal(h.shell,12000);assert.equal(h.envelope,429.5);
  assert.deepEqual(host.geometry.frame['leg 1'],[10955,730,6,40,40,864]);
  assert.deepEqual(host.geometry.frame['leg 4'],[11505,1330,6,40,40,864]);

  const radiator=h.architecturalServices.emitters.find(x=>x.id==='utility-E');
  const [wx,wy,ww,wd]=h.architecturalServices.utility.washer;
  const [rx,ry,rw,rd]=radiator.completePlanWithValvesAndBrackets;
  const fixed={
    washer:[wx,wy,0,ww,wd,848],
    radiator:[rx,ry,radiator.bottomLocal,rw,rd,radiator.topLocal-radiator.bottomLocal],
    eastWall:[h.shell-h.envelope,0,0,h.envelope,12000,3500],
    rackPost:[10875,1165,0,20,20,850],
    rackFoot:[10835,1100,0,70,100,10],
    rearLink300:[10875,700,300,20,485,20],
    rearLink800:[10875,700,800,20,485,20],
    coldCap:[10723,1213,963,74,74,1799],
    hotCap:[10823,1213,963,74,74,2019],
    H0:[10823,1213,1417.5,74,147,165],
    washerReactionArm:[10825,1215,695,60,20,20],
    washerReactionReturn:[10875,1165,695,20,70,20],
    washerSplitKey:[10770,1220,715,60,60,10],
  };
  const states=[[0,0,0],[0,0,35],[0,285,35],[0,285,0]];
  const routes=Object.fromEntries(Object.entries(utilityRestVertices)
    .map(([id,vertices])=>[id,finiteBends(vertices,25)]));
  const frameFixed=[],framePipes=[],rackPipe=[];
  for(let leg=1;leg<states.length;leg++)
    for(const [member,box]of Object.entries(host.geometry.frame)){
      const sweep=swept(box,states[leg-1],states[leg]);
      for(const [obstacle,b]of Object.entries(fixed))
        frameFixed.push({leg,member,obstacle,gapMM:boxGap(sweep,b)});
      for(const [pipe,route]of Object.entries(routes))
        framePipes.push({leg,member,pipe,gapMM:pathBox(route,sweep)});
    }
  for(const [pipe,route]of Object.entries(routes))
    for(const obstacle of ['rackPost','rackFoot','rearLink300','rearLink800'])
      rackPipe.push({pipe,obstacle,gapMM:pathBox(route,fixed[obstacle])});
  frameFixed.sort((a,b)=>a.gapMM-b.gapMM);
  framePipes.sort((a,b)=>a.gapMM-b.gapMM);
  rackPipe.sort((a,b)=>a.gapMM-b.gapMM);

  const crew=[
    {id:'west',centre:[10395,1725],shoulder:[10395,1725,1100],
      grips:[[10775,1360,1050],[10775,1360,1130]]},
    {id:'east',centre:[11045,1725],shoulder:[11045,1725,1100],
      grips:[[11400,1360,1050],[11400,1360,1130]]},
  ];
  const bodyChecks=[],armChecks=[];
  for(const worker of crew)
    for(let leg=1;leg<states.length;leg++){
      const a=states[leg-1],b=states[leg],bodyA=plus(worker.centre,a.slice(0,2)),bodyB=plus(worker.centre,b.slice(0,2));
      for(const [obstacle,box]of Object.entries(fixed)){
        // Plan-cylinder comparator: ignore vertical separation to avoid a
        // fictitious benefit from crew shoulder height.
        const planBox=[box[0],box[1],0,box[3],box[4],0];
        bodyChecks.push({worker:worker.id,leg,obstacle,
          gapMM:exactSegmentBoxDistance([...bodyA,0],[...bodyB,0],planBox)-300});
      }
      const travel=Math.hypot(...b.map((v,i)=>v-a[i])),halfStep=travel/200;
      for(const [index,grip]of worker.grips.entries())
        for(const [obstacle,box]of Object.entries(fixed)){
          let arm=Infinity,hand=Infinity;
          for(let i=0;i<=100;i++){
            const d=mix(a,b,i/100);
            const shoulder=plus(worker.shoulder,d),handPoint=plus(grip,d);
            arm=Math.min(arm,exactSegmentBoxDistance(shoulder,handPoint,box)-40);
            hand=Math.min(hand,exactSegmentBoxDistance(handPoint,handPoint,box)-40);
          }
          armChecks.push({worker:worker.id,grip:index,leg,obstacle,
            armGapLowerMM:arm-halfStep,handGapLowerMM:hand-halfStep});
        }
    }
  bodyChecks.sort((a,b)=>a.gapMM-b.gapMM);
  armChecks.sort((a,b)=>Math.min(a.armGapLowerMM,a.handGapLowerMM)-
    Math.min(b.armGapLowerMM,b.handGapLowerMM));
  const maximumReachMM=Math.max(...crew.flatMap(w=>w.grips.map(p=>
    Math.hypot(...p.map((v,i)=>v-w.shoulder[i])))));

  const feet=Object.fromEntries(Object.entries(host.geometry.frame)
    .filter(([name])=>name.startsWith('sole '))
    .map(([name,box])=>[name,moved(box,states.at(-1))]));
  const patches=[
    [10930,1000,-30,65,110,30],[11480,1000,-30,65,110,30],
    [10930,1545,-30,65,110,30],[11480,1545,-30,65,110,30],
  ];
  const landing=Object.entries(feet).map(([foot,box])=>({foot,patch:patches.findIndex(p=>rectIn(box,p))}));
  assert(landing.every(r=>r.patch>=0),landing);
  const conservativeFootAreaMM2=(65-2)*(110-2);
  const pressureAt2kNFootMPa=2000/conservativeFootAreaMM2;

  // Rejected earlier Y1125 crossing fails against the actual rack post.
  const oldCold=utilityRestVertices.coldSink.map(p=>
    p[1]===1110?[p[0],1125,p[2]]:[...p]);
  const oldHot=utilityRestVertices.hotSink.map(p=>
    p[1]===1110?[p[0],1125,p[2]]:[...p]);
  const rejectedRackGapMM=Math.min(
    pathBox(finiteBends(oldCold,25),fixed.rackPost),
    pathBox(finiteBends(oldHot,25),fixed.rackPost));

  // These are screening limits, not tolerances automatically credited to
  // physical construction or a human-handling certification.
  assert(frameFixed[0].gapMM>=25,frameFixed[0]);
  assert(framePipes[0].gapMM>=25,framePipes[0]);
  assert(rackPipe[0].gapMM>=25,rackPipe[0]);
  assert(bodyChecks[0].gapMM>=25-1e-6,bodyChecks[0]);
  assert(armChecks.every(x=>x.armGapLowerMM>=25&&x.handGapLowerMM>=25),armChecks[0]);
  assert(maximumReachMM<650,maximumReachMM);
  assert(pressureAt2kNFootMPa<.3,pressureAt2kNFootMPa);
  assert(rejectedRackGapMM<25,rejectedRackGapMM);

  return {
    status:'BOUNDED UTILITY FIRST-REST COMPARATOR; NOT SOURCE ADOPTION',
    inputs:{IASHostBlob:HOST_BLOB,hostPath,housePath,
      frameTravelNorthMM:285,frameVerticalLiftMM:35,pipeRadiusMM:25,
      bentPipeArcBoundMM:routes.coldSink.hausdorffError},
    routes:utilityRestVertices,
    frameStaticMinimum:frameFixed[0],
    framePipeMinimum:framePipes[0],
    pipeRackMinimum:rackPipe[0],
    crewBodyMinimum:bodyChecks[0],
    crewHandArmMinimum:armChecks[0],
    maximumGripReachMM:maximumReachMM,
    footLanding:landing,
    conservativeFootAreaMM2,pressureAt2kNFootMPa,
    rejectedEarlierY1125RackGapMM:rejectedRackGapMM,
    holds:[
      'Source house and IAS host are unchanged; a selected inlet overlay has not been authored.',
      'Actual washer stop key, native matched contact, factory head release and pipe end cap/pressure suitability remain qualifications.',
      'Crew body/arm envelopes are design comparisons; the measured frame mass/CG, pin/strap forces, anchors and physical lifting procedure remain unproved.',
      'The flush load-bearing floor patches and floor/ground load path are not construction acceptance.',
      'IAS retains onward frame export, occupied-room renewal and return duties.',
    ],
  };
}
if(process.argv[1]&&import.meta.url.endsWith(process.argv[1])){
  process.stdout.write(JSON.stringify(utilityFirstRestPreflight(),null,2)+'\n');
}
