/** Current-source inlet development. A feasible object path is not an assembly adoption. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
import {inletEnvelopeWitness} from './selected-water-duties.mjs';
import {pathSeparation,segmentBoxDistance,segmentBodyDistance} from './service-interface-geometry.mjs';
import {finiteBends} from './incoming-water-geometry.mjs';
import {utilityTerminalStudy} from './incoming-water-terminal.mjs';

const root=new URL('../../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root)));
const blob=path=>{
  const b=readFileSync(new URL(path,root));
  return createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
};
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const points2=path=>path.map(p=>[p[0],p[1],0]);
const boxGap=(route,box,r)=>Math.min(...route.path.slice(1).map((b,i)=>segmentBoxDistance(route.path[i],b,box)))-r-route.hausdorffError;
const bodyGap=(route,xy,z,bodyR,pipeR)=>Math.min(...route.path.slice(1).map((b,i)=>segmentBodyDistance(route.path[i],b,xy,z,bodyR)))-pipeR-route.hausdorffError;
const pointSegment=(p,a,b)=>{
  const d=b.map((v,i)=>v-a[i]),den=d.reduce((n,v)=>n+v*v,0);
  const t=den?Math.max(0,Math.min(1,p.reduce((n,v,i)=>n+(v-a[i])*d[i],0)/den)):0;
  return {distance:Math.hypot(...p.map((v,i)=>v-a[i]-t*d[i])),fraction:t};
};
const boxDistance=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)));
const sweptBox=(box,a,b)=>[...box.slice(0,3).map((v,i)=>v+Math.min(a[i],b[i])),...box.slice(3).map((v,i)=>v+Math.abs(b[i]-a[i]))];

export const coldBackboneVertices=[
  [11315,2725,1000],[11315,2725,2725],[11315,2323,2725],
  [11505,2199.2,2725],[11505,600,2725],[10760,600,2725],
  [10760,1250,2725],[10760,1250,1000]
];
export const hotBackboneVertices=[
  [10100,3200,2945],[10100,600,2945],[10860,600,2945],
  [10860,1250,2945],[10860,1250,1000]
];
export const terminalVertices={
  coldWasher:[[10760,1250,1000],[10760,1250,950],[10800,1250,900],[10800,1250,750]],
  coldSink:[[10800,1250,900],[10800,835,900],[10800,835,500],[10800,1050,500],[11160,1050,500],[11160,1050,595]],
  hotSink:[[10860,1250,1000],[10860,1250,950],[10860,750,950],[10800,750,950],[10800,750,400],[10800,1000,400],[11340,1000,400],[11340,1050,400],[11340,1050,595]]
};

function utilityComparison(model,base,host){
  const s=model.architecturalServices,u=s.utility;
  const fan=s.fanAccess.find(f=>f.id==='utility');
  const heat=base.heat.emitterSchedule.find(e=>e.id==='utility-E');
  const pipeR=base.pipeInsulation.pipeBodiesAndInsulatedOD.cold22/2;
  assert.equal(pipeR,37,'Reassess changed complete cold insulation reservation');
  assert.equal(base.pipeInsulation.pipeBodiesAndInsulatedOD.hot22/2,pipeR);
  const heatPath=heat.pressurePairBranchPlan.map(p=>[...p,heat.upperBranchAxisLocal]);
  heatPath.push([...heat.pressurePairBranchPlan.at(-1),0]);
  const fanR=fan.selectedRoute.maximumCollarOD/2+20;
  const [x,y,w,d]=fan.podPlan,pod=[x,y,fan.podZ[0],w,d,fan.podZ[1]-fan.podZ[0]];
  const [px,py,pw,pd]=fan.selectedRoute.maintenance.platform;
  const oldLowTail=[11315,2380,1000];
  const oldTailInside=segmentBoxDistance(oldLowTail,oldLowTail,[px,py,0,pw,pd,1100])===0;
  const routes={cold:finiteBends(coldBackboneVertices),hot:finiteBends(hotBackboneVertices)};
  const gaps={};
  for(const [id,route]of Object.entries(routes))gaps[id]={
    fanWithSupports:pathSeparation(route.path,fan.path)-fanR-pipeR-route.hausdorffError,
    completeHeatPair:pathSeparation(route.path,heatPath)-84-pipeR-route.hausdorffError,
    condensate:pathSeparation(route.path,fan.ceilingTrapDrainPort.path)-fan.ceilingTrapDrainPort.maximumDrainOD/2-pipeR-route.hausdorffError,
    fanPod:boxGap(route,pod,pipeR),
    fanWorker:bodyGap(route,fan.selectedRoute.maintenance.body,[700,fan.workerEquipmentRequirement.maximumHeadTopLocal],300,pipeR),
    eastWall:model.shell-model.envelope-Math.max(...route.path.map(p=>p[0]))-pipeR-route.hausdorffError,
    headNorth:boxGap(route,[10930,735,925,610,1370,600],pipeR),
    headWest:boxGap(route,[10200,1495,925,1340,610,600],pipeR),
    washerPull:boxGap(route,[u.washer[0],u.washer[1],0,u.washer[2],u.washer[3]+u.washerFirstRest[1]-u.washer[1],848],pipeR),
    PVwork:boxGap(route,[...u.PVworkingField.slice(0,2),0,...u.PVworkingField.slice(2),2800],pipeR),
    electricalWork:boxGap(route,[...u.electricalWorkingField.slice(0,2),0,...u.electricalWorkingField.slice(2),2800],pipeR)
  };
  const capBoxes=[[10723,1213,963,74,74,1799],[10823,1213,963,74,74,2019]];
  const capSweeps={};
  for(const kind of['frame','carrier']){
    let minimum={gapMM:Infinity};
    for(let i=1;i<host.states[kind].length;i++)for(const [member,box]of Object.entries(host.geometry[kind]))for(const [cap,b]of capBoxes.entries()){
      const gapMM=boxDistance(sweptBox(box,host.states[kind][i-1],host.states[kind][i]),b);
      if(gapMM<minimum.gapMM)minimum={gapMM,leg:i-1,member,cap};
    }
    capSweeps[kind]=minimum;
  }
  return {pipeR,bendRadius:75,chordErrorMM:routes.cold.hausdorffError,
    vertices:{cold:coldBackboneVertices,hot:hotBackboneVertices},gapsMM:gaps,
    hotColdGapMM:pathSeparation(routes.cold.path,routes.hot.path)-2*pipeR-routes.cold.hausdorffError-routes.hot.hausdorffError,
    capBoxes,capSweeps,
    rejected:{oldLowTail,currentPlatform:fan.selectedRoute.maintenance.platform,
      oldLowTailInsidePlatform:oldTailInside,oldUpperBranch:[11200,1800,2945],oldUpperBranchInsidePod:segmentBoxDistance([11200,1800,2945],[11200,1800,2945],pod)===0,
      capAt950AxisToLiftedFrameMM:950-pipeR-905},
    scope:'Finite nominal backbone routes and full pipe reservations. Replace the former cold/hot utility feeds; do not install parallel feeds. No fitting or support can exceed the declared envelope without repeating this screen.',
    holds:['New formed pier crossings require their own structural/fabric detail: cold X11315/Z2725, hot X10100/Z2945 at Y2550.',
      'Critical cold-route gaps are only about28 mm against a25 mm comparison. Actual setting, jacket and support tolerances must fit the remaining reserve.',
      'The cold endpoint moves40 mm west of the old fixed upper-water axis; both full caps and a new independently supported restraint are required.',
      'The existing temporary restraint beam intentionally meets a pipe support interface. Its actual saddle/contact and changed load path are not a clearance pass.',
      'No native head first-release, material, condensation or handling acceptance follows from this backbone screen.']};
}

function terminalComparison(host){
  const r=25,routes=Object.fromEntries(Object.entries(terminalVertices).map(([id,path])=>[id,finiteBends(path,25)]));
  const obstacles={};
  for(const[id,b]of Object.entries(host.geometry.frame))if(id!=='temporary carry bar')obstacles[id]=b;
  for(const[id,b]of Object.entries(host.geometry.carrier))if(id!=='water fitting and cap domain'&&id!=='compact carrier post'){
    const moved=[...b];moved[3]-=30;obstacles[id]=moved;
    obstacles[id+' return']=[10875,1165,b[2],20,70,b[5]];
  }
  Object.assign(obstacles,{rackPost:[10875,1165,0,20,20,850],rackFoot:[10835,1100,0,70,100,10],
    rearLink300:[10875,700,300,20,485,20],rearLink800:[10875,700,800,20,485,20],
    washer:[10076,800,0,598,600,848],headLowerBound:[10935,740,650,600,600,600]});
  for(const[i,[x,y,w,d]]of host.floorAndWall.seatPlan.entries())obstacles['wholeFootWindow'+i]=[x,y,0,w,d,900];
  const gaps={};
  for(const[id,route]of Object.entries(routes))gaps[id]=Object.entries(obstacles).map(([obstacle,b])=>({obstacle,gapMM:boxGap(route,b,r)})).sort((a,b)=>a.gapMM-b.gapMM).slice(0,5);
  const waste=[[11270,940,610],[10760,940,597.25],[10760,1275,588.875],[10875,1275,586]];
  const pair=(a,b)=>pathSeparation(routes[a].path,routes[b].path)-2*r-routes[a].hausdorffError-routes[b].hausdorffError;
  return {status:'NOT_ADOPTED',completeTerminalR:r,bendRadius:25,vertices:terminalVertices,gapsMM:gaps,
    hotColdWasherGapMM:pair('hotSink','coldWasher'),hotColdSinkGapMM:pair('hotSink','coldSink'),
    wasteGapsMM:Object.fromEntries(Object.entries(routes).map(([id,route])=>[id,pathSeparation(route.path,waste)-r-25-route.hausdorffError])),
    materialScope:'This is an explicit exposed, removable apparatus-connection comparison below the insulated backbone. R25 is not a silently reduced R37 backbone. Native fitting, guard, touch-temperature, condensation and receiver duties remain unqualified.',
    adverse:['The washer stem meets the existing valve reaction arm at its authored support contact. Actual saddle/fitting shape is required; negative geometric distance is not a free collision exception.',
      'Proposed under-bowl breaks are not yet proved reachable from the valve-bay worker. Their coordinates do not identify the actual native tap ports.',
      'Rigid tails and their first breaks must be removable without extending the factory head outside its610 mm transport package or retained250 mm underhang. This has not been earned.']};
}

function bridgeComparison(model,base){
  const cylinder=model.architecturalServices.plant.cylinder,c=cylinder.centre;
  assert.deepEqual(cylinder.body,[9450,3870,760,760]);
  const west=cylinder.westSeat,east=[11075,3970],r=37,crown=2150,lift=85;
  const heat=base.heat.emitterSchedule.find(e=>e.id==='plant-N').pressurePairBranchPlan.at(-1);
  const diagonal=pointSegment(c,west,[west[0]+120,west[1]+160]);
  const heatDiagonal=pointSegment(heat,east,[east[0]+120,east[1]+160]);
  const bodyPath=[[8800,3200],[10545,3200],[10545,3850],[10570,3970],[10545,4250]];
  const operatorPipe=pathSeparation(points2(bodyPath),points2([west,west]))-300-r;
  const eastPier=[10880,3585,-100,1120,230,4000];
  const eastPierGap=Math.min(...points2(bodyPath).slice(1).map((b,i)=>segmentBoxDistance(points2(bodyPath)[i],b,eastPier)))-300;
  const radius=75,width=east[0]-west[0],rise=crown-1040;
  const frame=[10255,4375,0,1000,400,1],cbody=cylinder.body,bbody=model.architecturalServices.plant.primaryBuffer.body;
  return {status:'OBJECT_PATH_ONLY',westSeat:west,eastSeat:east,unionMadeZ:[1040,1100],nutBackoffReservation:60,lift,crown,
    installedRadius:r,bendRadius:radius,centrelineLengthMM:2*rise+width-4*radius+Math.PI*radius,
    currentCaseGapMM:Math.hypot(west[0]-c[0],west[1]-c[1])-380-r,
    rejectedOldSeatGapMM:Math.hypot(10090-c[0],3970-c[1])-380-r,
    rejectedOldLowBridgeOrdinaryBodyGapMM:pathSeparation(points2(model.plantReferenceDoor.operatorCentrePath),points2([west,east]))-300-r,
    oldTiltRackNotApplicable:true,
    ordinaryBody:{radius:300,path:bodyPath,headTopBound:2000,pipeUndersideGapMM:crown-r-2000,westLegGapMM:operatorPipe,eastPierGapMM:eastPierGap,
      scope:'Dogleg includes the retained18 mm baseboard with27 mm finish; it is not the colliding straightX10570 alternative.'},
    motion:{diagonal:[120,160],westCaseGapMM:diagonal.distance-380-r,westMinimumAtFraction:diagonal.fraction,
      eastHeatGapMM:heatDiagonal.distance-84-r,eastMinimumAtFraction:heatDiagonal.fraction,
      nextNorthY:4575,nextNorthCaseGapMM:west[0]+120-c[0]-380-r,
      finishedPanelUndersideZ:2350,liftedCrownGapMM:2350-(crown+lift+r)},
    firstRestTrial:{centre:[10755,4575],platform:[1000,400],deck:100,
      caseAABBClearance:boxDistance(frame,[...cbody.slice(0,2),0,...cbody.slice(2),1]),
      bufferClearance:boxDistance(frame,[...bbody.slice(0,2),0,...bbody.slice(2),1]),
      status:'NOT_ACCEPTED: a prepositioned frame blocks the obvious handler stance; object clearances do not establish captured lowering.'},
    holds:['Retain native union disengagement/backoff, independent counter-holds and supported release; axes alone do not prove mating surfaces.',
      'The complete cylinder-side socket, tail and stand must leave the eccentricR425 cart before the cylinder moves; the old retained-tail proof was for a595 mm case.',
      'The independent T&P/manifold first-release duty remains. A cold union must never isolate safety relief from a charged vessel.',
      'Ordinary head height is an explicit2000 mm comparison, not universal anthropometry. Handling equipment, actual mass, grips, forces and final receiver still need a complete arrangement.']};
}

export function deriveIncomingWaterStudy(){
  const house=deriveCurrentHouse(),base=read('project/mat/studies/whole-house-service-baseline.json'),host=read('project/ias/studies/utility-host-revised-route.json');
  assert.equal(scheduleText(house),readFileSync(new URL('project/had/studies/current-house-services.json',root),'utf8'));
  const sourcePaths=['project/had/studies/current-house.mjs','project/had/studies/current-house-services.json','project/had/studies/selected-water-duties.mjs',
    'project/had/studies/incoming-water.mjs','project/had/studies/incoming-water-geometry.mjs','project/had/studies/incoming-water-terminal.mjs','project/had/studies/service-interface-geometry.mjs',
    'project/mat/studies/whole-house-service-baseline.json','project/mat/studies/service-material-offer.json','project/mat/studies/plant-inlet-route.py',
    'project/mat/studies/east-water-plant.json','project/ias/studies/utility-first-release.json','project/ias/studies/utility-host-revised-route.json',
    'project/ias/studies/utility-bench-release.py','project/ias/ias-03-utility-factory-head.md'];
  return {packet:'HAD-INLET-RESOLUTION',status:'IN_PROGRESS_NOT_ADOPTED',baselineMain:'003f61bacebd4cb3294280059b64f1bb5fc87f88',selection:house.id,
    sourceBlobs:Object.fromEntries(sourcePaths.map(p=>[p,blob(p)])),inputs:house.inputs,
    unchangedSelectedGeometry:{fullCurrentHouseSHA256:digest(house),exteriorPortsSHA256:digest(house.model.exteriorPortGeometry),weatherFacesSHA256:digest(house.selectedServiceInterfaces.weatherFaces),
      scope:'This development checkpoint does not mutate the selected house or its compact schedule. The rejected inherited route remains selected only as an adverse witness.'},
    inheritedInlet:inletEnvelopeWitness(house.model),utility:utilityComparison(house.model,base,host),terminal:terminalComparison(host),
    utilitySuccessor:utilityTerminalStudy(house.model,host),bridge:bridgeComparison(house.model,base),
    adoption:{adopted:false,remaining:['A located main/branch isolation station with a complete retained-end and controlled-drain arrangement.',
      'A complete current-cylinder bridge/tail/stand first-release, capture and receiving sequence preserving ordinary plant entry.',
      'Accessible utility sink first breaks and actual head/tail separation, beyond a nominal backbone and tube path.'],
      receivingGates:['TRIAD-GATE','MRA-02'],noCredit:['physical qualification','material exception','complete internal-water acceptance','safe unattended mains-leak containment','real-site frost/provider admission']}};
}
export const incomingWaterText=study=>JSON.stringify(study,(_,v)=>typeof v==='number'?Number(v.toFixed(8)):v,2)+'\n';
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const output=incomingWaterText(deriveIncomingWaterStudy()),target=new URL('incoming-water.json',import.meta.url);
  if(process.argv.includes('--write'))writeFileSync(target,output);
  else if(process.argv.includes('--check'))assert.equal(readFileSync(target,'utf8'),output,'Regenerate incoming-water.json');
  else process.stdout.write(output);
}
