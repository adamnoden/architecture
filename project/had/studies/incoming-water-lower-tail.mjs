/** Geometry comparison for the shorter lower-cap driver and end-supported rail trials. */
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {assertBridgeNativeHouse,boxGap,nativeBoxGaps,segmentGaps,uprightBodyGaps} from './incoming-water-bridge-native.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {lowerCapComparator} from './incoming-water-lower-cap.mjs';
import {segmentBodyDistance,segmentDistance} from './service-interface-geometry.mjs';

const requiredRemoteMM=25;
const guideLevels=[650,850];
const railEndMM=400.0307, travelMM=260;
const shaftLengthMM=100, leverLengthMM=60;
const minimum=rows=>rows.reduce((a,b)=>a.gapMM<=b.gapMM?a:b);

export function deriveLowerTailComparison(){
  const house=deriveCurrentHouse().model;
  assertBridgeNativeHouse(house);
  const cylinder=house.architecturalServices.plant.cylinder;
  const cap=lowerCapComparator(house);
  const flangeRadiusMM=cap.planDiscRadiusMM;
  const capProjectionMM=cap.thinnerUnselectedComparison.projectionMM;
  const tipNormalMM=capProjectionMM-3, shoulderNormalMM=capProjectionMM+2;
  const port=[...cap.candidateLowerPortXY,cap.candidateLowerPortZ];
  const {tangentOffsetMM,heightOffsetMM}=cap.boltPattern;
  const boltTangents=[-tangentOffsetMM,tangentOffsetMM];
  const direction=cylinder.westSeat.map((v,i)=>v-port[i]);
  const seatNormalMM=Math.hypot(...direction);
  const normal=direction.map(v=>v/seatNormalMM);
  const tangent=[-normal[1],normal[0]];
  const world=(n,t,z)=>[port[0]+normal[0]*n+tangent[0]*t,port[1]+normal[1]*n+tangent[1]*t,z];
  const local=([x,y,z])=>[
    (x-port[0])*normal[0]+(y-port[1])*normal[1],
    (x-port[0])*tangent[0]+(y-port[1])*tangent[1],z,
  ];
  const discFrame=p=>{const [n,t,z]=local(p);return [t,z-port[2],n];};
  const parked=finiteBends([[travelMM,0,port[2]],[travelMM+seatNormalMM,0,port[2]],[travelMM+seatNormalMM,0,1100]],75,1);
  const parkedPipe=parked.path.map(p=>world(...p));

  function compareDriver({railStartMM,railTangentMM,linkOffsetMM,shoulder,arrivalMM,supports=[]}){
    const rails=guideLevels.map(z=>[world(railStartMM,railTangentMM,z),world(railEndMM,railTangentMM,z)]);
    const links=guideLevels.map(z=>[world(seatNormalMM+travelMM+linkOffsetMM,railTangentMM,z),world(seatNormalMM+travelMM,0,z)]);

    function obstacles(a,b,radius,shaftAtBolt){
      const rooms=segmentGaps(a,b,radius).filter(x=>!(shaftAtBolt&&x.id==='cylinder'))
        .map(x=>({id:x.id,gapMM:x.value}));
      const discs=(shaftAtBolt?[travelMM]:[capProjectionMM,travelMM]).map(n=>({
        id:n===travelMM?'parked flange':'cap flange',
        gapMM:segmentBodyDistance(discFrame(a),discFrame(b),[0,0],[n,n],flangeRadiusMM)-radius,
      }));
      return [
        ...rooms,...discs,
        {id:'parked tail and shoe',gapMM:Math.min(...parkedPipe.slice(1).map((end,i)=>
          segmentDistance(a,b,parkedPipe[i],end)))-20-radius-parked.hausdorffError},
        ...rails.map(([c,d])=>({id:'closed rail',gapMM:segmentDistance(a,b,c,d)-20-radius})),
        ...links.map(([c,d])=>({id:'capture link',gapMM:segmentDistance(a,b,c,d)-10-radius})),
        ...supports.map(({id,box})=>({id,gapMM:exactSegmentBoxDistance(local(a),local(b),box)-radius})),
      ];
    }

    const bolts=[];
    const angularStepDeg=.25;
    const angularAllowanceMM=leverLengthMM*angularStepDeg*Math.PI/360;
    for(const t of boltTangents)for(const z of [port[2]-heightOffsetMM,port[2]+heightOffsetMM]){
      assert(z>0&&z<cylinder.height);
      const shaftEnd=world(capProjectionMM+shaftLengthMM,t,z);
      const tipStart=world(tipNormalMM,t,z), shoulderStart=world(shoulderNormalMM,t,z);
      const fixed=[['internal bit',tipStart,shoulderStart,3.5],['shaft',shoulderStart,shaftEnd,7]];
      const fixedWitness=minimum(fixed.flatMap(([part,a,b,r])=>obstacles(a,b,r,true).map(row=>({...row,part}))));
      const neutralDeg=t>0?45:15;
      const witnesses=[fixedWitness];
      let reachMM=0;
      for(let i=0;i<=120;i++){
        const angleDeg=neutralDeg-15+i*angularStepDeg;
        const angle=angleDeg*Math.PI/180;
        const hand=world(capProjectionMM+shaftLengthMM+leverLengthMM*Math.sin(angle),t+leverLengthMM*Math.cos(angle),z);
        const parts=[['lever',shaftEnd,hand,5],['hand',hand,hand,50],['arm',shoulder,hand,40]];
        for(const [part,a,b,r] of parts){
          const witness=minimum(obstacles(a,b,r,false));
          witnesses.push({...witness,part,angleDeg,gapMM:witness.gapMM-angularAllowanceMM});
        }
        reachMM=Math.max(reachMM,Math.hypot(...hand.map((v,j)=>v-shoulder[j]))+angularAllowanceMM);
      }
      bolts.push({t,z,neutralDeg,minimum:minimum(witnesses),reachMM});
    }

    const plan=([x,y])=>[x,y,0];
    const bodyObstacles=[
      ...rails.map(([a,b])=>({id:'closed rail',a,b,radius:20})),
      ...links.map(([a,b])=>({id:'capture link',a,b,radius:10})),
      ...parkedPipe.slice(1).map((b,i)=>({id:'parked tail and shoe',a:parkedPipe[i],b,radius:20+parked.hausdorffError})),
      ...[capProjectionMM,travelMM].map(n=>({id:'flange',a:world(n,-flangeRadiusMM,port[2]),b:world(n,flangeRadiusMM,port[2]),radius:0})),
    ];
    const bodyArrival=minimum(Array.from({length:arrivalMM?11:1},(_,i)=>{
      const centre=[shoulder[0],shoulder[1]+arrivalMM*(1-i/10)];
      const point=plan(centre);
      const fixtures=bodyObstacles.map(({id,a,b,radius})=>({id,value:segmentDistance(point,point,plan(a),plan(b))-300-radius}));
      const feet=supports.map(({id,box:b})=>({id,value:exactSegmentBoxDistance(plan(local(point)),plan(local(point)),[b[0],b[1],0,b[3],b[4],1])-300}));
      return minimum([...uprightBodyGaps(centre,2000,300),...fixtures,...feet].map(({id,value})=>({id,centre,gapMM:value-arrivalMM/20})));
    }));
    return {shaftLengthMM,leverLengthMM,travelMM,shoulder,arrivalMM,angularStepDeg,bolts,bodyArrival,
      minimum:minimum(bolts.map(b=>b.minimum)),maximumReachMM:Math.max(...bolts.map(b=>b.reachMM))};
  }

  const shellGap=(n,r)=>Math.min(...boltTangents.map(t=>{
    const p=world(n,t,port[2]);
    return Math.hypot(p[0]-cylinder.centre[0],p[1]-cylinder.centre[1])-cylinder.body[2]/2-r;
  }));
  const shorterDriver=compareDriver({railStartMM:60,railTangentMM:-35,linkOffsetMM:5,shoulder:[10545,4200,625],arrivalMM:50});

  // Finite witnesses on the unsupported rail-end alternatives. The first is
  // evaluated at the made position, and the second during continuous travel.
  const nearPlate=[35,-43,839,25,16,22];
  const madeTailStart=[seatNormalMM,0,455], madeTailEnd=[seatNormalMM,0,1100];
  const shiftedStrokeMM=22;
  const shiftedLink=[world(seatNormalMM+shiftedStrokeMM+20,-60,850),world(seatNormalMM+shiftedStrokeMM,0,850)];
  const westPost=segmentGaps(...shiftedLink,10).find(row=>row.id==='westPost');
  assert(westPost,'The moved-link comparison requires the native west post');

  // A separate temporary frame moves the reaction to the other side of the
  // tail. Its finite end supports stay outside the closed carriage sweep.
  const floorRailStartMM=55, floorRailTangentMM=68, floorLinkOffsetMM=20;
  const supports=[
    {id:'near foot',box:[30,23,0,95,90,20]},
    {id:'far foot',box:[375,23,0,90,90,20]},
    {id:'near end post',box:[32,77,20,20,30,841]},
    {id:'far end post',box:[405,53,20,30,30,841]},
    ...guideLevels.flatMap(z=>[
      {id:`near end plate Z${z}`,box:[50,60,z-11,floorRailStartMM-50,40,22]},
      {id:`far end plate Z${z}`,box:[railEndMM,60,z-11,405-railEndMM,16,22]},
    ]),
  ];
  const floorDriver=compareDriver({railStartMM:floorRailStartMM,railTangentMM:floorRailTangentMM,
    linkOffsetMM:floorLinkOffsetMM,shoulder:[10545,4250,625],arrivalMM:0,supports});
  const floorStatic=minimum([
    ...supports.flatMap(({id,box})=>nativeBoxGaps(box,world,local).map(q=>({part:id,id:q.id,gapMM:q.value}))),
    ...guideLevels.flatMap(z=>segmentGaps(world(floorRailStartMM,floorRailTangentMM,z),world(railEndMM,floorRailTangentMM,z),20)
      .map(q=>({part:`rail Z${z}`,id:q.id,gapMM:q.value}))),
  ]);
  const carriage=minimum(guideLevels.flatMap(z=>supports.map(({id,box})=>({id,z,
    gapMM:boxGap(box,[seatNormalMM+5-20,floorRailTangentMM-12,z-15,travelMM+40,24,30]),
  }))));
  const strokes=Array.from({length:travelMM/2+1},(_,i)=>i*2);
  const movingTail=minimum(strokes.flatMap(stroke=>{
    const path=parked.path.map(([n,t,z])=>[n-travelMM+stroke,t,z]);
    return supports.map(({id,box})=>({id,stroke,gapMM:Math.min(...path.slice(1).map((end,i)=>
      exactSegmentBoxDistance(path[i],end,box)))-20-1-parked.hausdorffError}));
  }));
  const movingLink=minimum(strokes.flatMap(stroke=>guideLevels.flatMap(z=>{
    const a=[seatNormalMM+stroke+floorLinkOffsetMM,floorRailTangentMM,z],b=[seatNormalMM+stroke,0,z];
    return [
      ...supports.map(({id,box})=>({id,z,stroke,gapMM:exactSegmentBoxDistance(a,b,box)-10-1})),
      ...segmentGaps(world(...a),world(...b),10).map(({id,value})=>({id,z,stroke,gapMM:value-1})),
    ];
  })));
  const solidNearPostI=30*20**3/12;
  const cantilever=guideLevels.map((z,i)=>{
    const horizontalN=[265,165][i];
    return {z,horizontalN,deflectionMM:horizontalN*(z-20)**3/(3*200000*solidNearPostI)};
  });

  return {
    status:'DEVELOPMENT_NOT_ADOPTED',requiredRemoteMM,
    shorterDriver,
    localBolt:{capProjectionMM,internalBitGapMM:shellGap(tipNormalMM,3.5),shaftShoulderGapMM:shellGap(shoulderNormalMM,7),
      rejectedCupGapMM:shellGap(capProjectionMM-5,7),combinedSettingAndWorkingGapMM:6},
    railEndFailures:{madeTailToNearPlateMM:exactSegmentBoxDistance(madeTailStart,madeTailEnd,nearPlate)-20,
      shiftedLinkToWestPostMM:westPost.value,shiftedStrokeMM},
    independentFloorFrame:{floorRailStartMM,floorRailTangentMM,floorLinkOffsetMM,supports,
      driver:floorDriver,staticMinimum:floorStatic,carriage,movingTail,movingLink,
      supportComparison:{installedGuideBudgetMM:1,assumedE_Nmm2:200000,idealSolidPostSectionMM:[20,30],cantilever}},
    holds:[
      'The cap and bolt are a native mating interface. The shell, bit, socket, actual torque and pressure hardware require a matched detail.',
      'The tool check includes trial rail, shoe and link envelopes at the parked position. It earns no restraint load path, complete latch, stand retirement or first rest.',
      'The two end-support trials fail the remote comparison. Revise the reaction path before reconsidering lower-tail capture.',
      'The independent frame is an unselected geometric comparator at the work stance. Its ideal single posts fail the deflection screen and do not qualify floor reaction, bracing or access to the stance.',
    ],
  };
}

if(process.argv[1]===fileURLToPath(import.meta.url))
  console.log(JSON.stringify(deriveLowerTailComparison(),null,2));
