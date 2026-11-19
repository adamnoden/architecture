/** Actual ordinary-operator route; no inferred plot or access-class approval. */
import assert from 'node:assert/strict';
const rect=(x0,y0,x1,y1)=>[Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0)];
const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
export function deriveGardenFailureBypass(model,renewal){
  const grade=model.approaches.authoredExteriorGrade,flights=model.approaches.front.flights;
  const width=1200,spacing=1500,near=-1200,far=near-9000;
  let z=0,x=6000,y=near;const route=[[6000,0,0],[6000,-600,0],[x,y,z]],ramps=[],landings=[];
  landings.push({plan:[5400,-1200,1200,1200],z:0});
  for(let i=0;i<flights.length;i++){
    const direction=i%2===0?-1:1,endY=y+direction*flights[i],endZ=z-flights[i]/20;
    ramps.push({plan:rect(x-width/2,y,x+width/2,endY),from:[x,y,z],to:[x,endY,endZ],slope:20});
    route.push([x,endY,endZ]);
    const turnY=endY+direction*600;
    if(i<flights.length-1){
      const nextX=x-spacing;
      landings.push({plan:[nextX-width/2,Math.min(endY,endY+direction*1200),spacing+width,1200],z:endZ});
      route.push([x,turnY,endZ],[nextX,turnY,endZ],[nextX,endY,endZ]);x=nextX;
    }else{
      landings.push({plan:[x-width/2,Math.min(endY,endY+direction*1200),width,1200],z:endZ});
      route.push([x,turnY,endZ]);
    }
    y=endY;z=endZ;
  }
  assert.equal(z,grade);
  const foot=route.at(-1),bypass=[[1000,13500,grade],[-2000,13500,grade],[-2000,foot[1],grade],foot];
  const bypassSolids=bypass.slice(1).map((b,i)=>{
    const a=bypass[i];return [Math.min(a[0],b[0])-600,Math.min(a[1],b[1])-600,Math.abs(a[0]-b[0])+1200,Math.abs(a[1]-b[1])+1200];
  });
  const interfaceSource=model.rwtReceivingInterface;
  assert(interfaceSource?.source?.blob,'Garden bypass requires the actual source-bound RWT receiving interface');
  const receivingN=structuredClone(interfaceSource.north.receiverBounds);
  const continuationN=structuredClone(interfaceSource.north.blockedOutletSpill.requiredContinuation);
  const reservations=[receivingN,continuationN],usableGarden=[-800,12500,4800,4500];
  for(const p of reservations){
    assert(p.length===4&&p.every(Number.isFinite)&&p[2]>0&&p[3]>0,'Invalid receiving/disposal reservation');
    assert(!overlap(usableGarden,p),'Usable garden overlaps current N receiver or required spill continuation');
    assert(bypassSolids.every(r=>!overlap(r,p)),'Garden bypass overlaps current N receiver or required spill continuation');
  }
  assert(bypassSolids.every(r=>!overlap(r,renewal.servicePlatform)));
  const northExtent=[Math.min(...reservations.map(p=>p[0])),Math.min(...reservations.map(p=>p[1])),
    Math.max(...reservations.map(p=>p[0]+p[2])),Math.max(...reservations.map(p=>p[1]+p[3]))];
  const gardenEastReserve=Math.min(...reservations.map(p=>p[0]))-(usableGarden[0]+usableGarden[2]);
  const westBypassEastReserve=Math.min(...reservations.map(p=>p[0]))-Math.max(...bypassSolids.map(p=>p[0]+p[2]));
  const minX=Math.min(...ramps.map(r=>r.plan[0]),...landings.map(r=>r.plan[0]));
  const maxX=Math.max(...ramps.map(r=>r.plan[0]+r.plan[2]),...landings.map(r=>r.plan[0]+r.plan[2]));
  const minY=Math.min(...ramps.map(r=>r.plan[1]),...landings.map(r=>r.plan[1]));
  const length=points=>points.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b[0]-points[i][0],b[1]-points[i][1],b[2]-points[i][2]),0);
  for(const r of ramps)assert.equal(Math.abs(r.from[2]-r.to[2])*20,Math.abs(r.from[1]-r.to[1]));
  // Every600-diameter actor centreline is600 from each1200 side edge.
  // All switchback centres are600 from the outer landing edge and use a
  //2700-wide shared landing; neighbouring flight clear lanes stay300 apart.
  assert.equal(spacing-width,300);
  return {status:'SOURCE-DRAWN ORDINARY OPERATOR REFERENCE; SITE AND ACCESS QUALIFICATION UNEARNED',
    grade,body:{radius:300,height:1800},clearWidth:width,flightSpacing:spacing,
    usableGarden:{plan:usableGarden,z:grade,
      scope:'Usable garden is at declared exterior grade WEST of the N receiving territory. Low loggia terrace is not the safe faulted occupant state.'},
    receivingN:{source:structuredClone(interfaceSource.source),plan:receivingN,
      requiredSpillContinuation:continuationN,combinedExtent:northExtent,
      directedSpillBoundary:structuredClone(interfaceSource.north.directedSpillBoundary),
      historicalBypassReservation:{plan:[4800,12000,2400,2500],role:'Superseded standalone bypass reservation ONLY; not current receiver/disposal authority.'},
      role:'BOTH actual RWT receiver and required blocked-outlet spill continuation are unoccupied water/disposal reservations. Actual containment/head/outfall remains RWT/DPL.'},
    bypass,groundPathEnvelope:bypassSolids,frontApproach:{route,ramps,landings,foot,
      footprint:[minX-100,minY-100,maxX-minX+200,-minY+200],
      guardTerritoryEach:100,guardHeight:1100,
      support:'Project mineral ramp/landing reference:200 structural depth with discrete supports at≤2000 spacing. Actual ground/bearing/reinforcement/edge/guard capacity and drainage remain STR/MAT/BCR.'},
    actualTravel:{groundBypass:length(bypass),frontFolded:length(route),total:length(bypass)+length(route)},
    operation:'When N mouth/route is unavailable, close the low garden/loggia approach. An occupant in the usable garden takes the west ground path, then the actual folded front approach to the protected occupied front exit. The reverse route reaches the usable garden without crossing N or E work. No escape through ponded court/loggia is credited.',
    conditions:['The N nominated low spill must be directed NORTH by continuous non-spill south/west/east boundaries above faulted−650 PLUS qualified wave/splash/movement/tolerance allowance. Plan separation alone is insufficient; if containment/disposal fails, the garden bypass safety claim fails.',
      'The actual plot must contain the entire1200 clear west path, folded front ramp/landings/guards, usable garden and separate N/E receivers.',
      'West surface drainage and outer roof collection must discharge clear of this route at the nominated event; no claim of immunity to whole-site flood.',
      'No E handling, stored modules, parked vehicle or service apparatus may occupy this protected route.',
      '1200 width/landings are prototype controls. The600 actor proof is not wheelchair, assisted evacuation, building-regulation or physical slip/lighting/weather qualification.'],
    checks:{gardenEastReserve,westBypassEastReserve,receiverAndContinuationChecked:true,receivingContainmentAccepted:false,continuousAtOneGrade:true,frontSlopes:true,clearOfNReceiver:true,clearOfEWork:true,
      ordinaryActorLandingSideReserve:300,siteAccepted:false,accessClassAccepted:false}};
}

export function renderGardenFailureBypass(v){
  const x=n=>100+(n+3000)*.025,y=n=>650-n*.025;
  const r=(a,c)=>`<rect x="${x(a[0])}" y="${y(a[1]+a[3])}" width="${a[2]*.025}" height="${a[3]*.025}" fill="${c}"/>`;
  const t=(px,py,s,size=13)=>`<text x="${px}" y="${py}" font-family="Arial" font-size="${size}">${s}</text>`;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1080" viewBox="0 0 1400 1080"><rect width="1400" height="1080" fill="#fbfaf5"/>';
  s+=t(30,35,'N-UNAVAILABLE GARDEN STATE · ONE SOURCE-DRAWN WEST BYPASS / NOT SITE OR ACCESS APPROVAL',17);
  s+=r([0,0,12000,12000],'#dedbd2')+r(v.usableGarden.plan,'#c4d5a8')+r(v.receivingN.plan,'#a2ccdf')+r(v.receivingN.requiredSpillContinuation,'#c6e0eb');
  for(const p of v.groundPathEnvelope)s+=r(p,'#8cbda0');
  for(const p of v.frontApproach.ramps)s+=r(p.plan,'#ba9d70');
  for(const p of v.frontApproach.landings)s+=r(p.plan,'#dec9a4');
  const draw=pts=>`<polyline points="${pts.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')}" stroke="#254e42" stroke-width="2" fill="none"/>`;
  s+=draw(v.bypass)+draw(v.frontApproach.route);
  s+=t(x(1000),y(7500),'HOUSE 12×12m');
  s+=t(x(-2000)-35,y(6000),'WEST');
  s+=t(x(500),y(15500),'Usable garden');
  s+=t(x(v.receivingN.plan[0]),y(14500),'N receiver',11);
  s+=t(x(v.receivingN.requiredSpillContinuation[0]),y(15950),'Required spill',11);
  s+=t(690,140,`One exterior grade ${v.grade}; front exit0. No low-loggia escape credited.`);
  s+=t(690,180,'1200 clear route /600 actor;1500 flight centres leave300 between clear lanes.');
  s+=t(690,220,'Folded front flights retain1:20 and≤9000 runs;1200 long turn/terminal landings.');
  s+=t(690,260,'Turning landings2700 wide;100 outside guard territory /1100 guard height.');
  s+=t(690,300,`Actual ground bypass ${(v.actualTravel.groundBypass/1000).toFixed(2)}m; folded front ${(v.actualTravel.frontFolded/1000).toFixed(2)}m.`);
  s+=t(690,340,`Total garden-to-front reference ${(v.actualTravel.total/1000).toFixed(2)}m: a real convenience/site cost.`);
  s+=t(690,380,`Actual N receiver +spill X${v.receivingN.combinedExtent[0]}..${v.receivingN.combinedExtent[2]} /Y${v.receivingN.combinedExtent[1]}..${v.receivingN.combinedExtent[3]}.`);
  s+=t(690,400,`Garden east reserve ${v.checks.gardenEastReserve}; west bypass reserve ${v.checks.westBypassEastReserve}. E work remains east.`);
  s+=t(690,420,'No plan crossing. Directed spill/retaining boundaries remain UNPROVED.');
  s+=t(690,460,'West roof/surface drainage, whole plot fit, ground/supports and actual weather');
  s+=t(690,485,'must be qualified. Keep this route free of parked vehicles/stored components.');
  s+=t(690,540,'Ordinary operator geometry only: wheelchair/assisted escape/regulatory');
  s+=t(690,565,'classification, guarding capacity, lighting/slip and physical acceptance remain open.');
  s+=t(30,1030,'The declared garden is at exterior grade. The north garden/loggia approach is closed while N is unavailable; front access remains independently connected.');
  return s+'</svg>\n';
}
