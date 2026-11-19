const clone=value=>structuredClone(value);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const rectDistance=(p,r)=>Math.hypot(Math.max(r[0]-p[0],p[0]-r[0]-r[2],0),Math.max(r[1]-p[1],p[1]-r[1]-r[3],0));

// Current service composition only. Earlier MAT, IAS and STR occurrences keep
// their recorded geometry and cannot inherit these occupied-window results.
export function selectPurgeWindows(model){
  const s=model.architecturalServices;
  const relocations=[
    {id:'rear-N',nextId:'rear-W',level:1,plan:[429.5,9250,200,650],
      branch:[[1800,10800],[800,10800],[800,9900],[529.5,9900]]},
    {id:'kitchen-E',nextId:'kitchen-W',level:0,plan:[7719.5,10195,200,1350],
      branch:[[10500,10800],[8000,10800],[8000,10195],[7819.5,10195]]},
    {id:'principal-E-high',nextId:'principal-S-high',level:1,plan:[10975,6600,550,200],z:[2075,2675],length:400,
      branch:[[11200,7000],[11200,6700],[11000,6700]]}
  ].map(change=>{
    const emitter=s.emitters.find(e=>e.id===change.id),old=clone(emitter);
    const furniture=change.level?model.upperFurniture:model.groundFurniture;
    delete furniture['service-emitter-'+change.id];
    emitter.id=change.nextId;
    emitter.completePlanWithValvesAndBrackets=clone(change.plan);
    emitter.pressurePairBranchPlan=clone(change.branch);
    if(change.z)[emitter.bottomLocal,emitter.topLocal]=change.z;
    let heatChangeW=0;
    if(change.length){
      emitter.length=change.length;
      const room=s.rooms[emitter.room],oldOutput=room.selectedHydronicW;
      room.selectedHydronicW*=956/(2389*.5);
      heatChangeW=room.selectedHydronicW-oldOutput;
      room.marginW+=heatChangeW;
      emitter.selectedCatalogue={article:'Stelrad Compact K3 3063304',nominalDelta50W:956,
        bodyHW:[600,400],dryMassKG:21,filledBodyMassKG:24.92,
        outputAt55_45_22W:room.selectedHydronicW,roomDutyW:room.designDutyW,
        source:'https://www.stelrad.com/wp-content/uploads/2019/12/25928_Compact_-K3_Web.pdf'};
      emitter.renewal.handling='A21kg dry body plus valves and clips. Use the selected captured wall-tied carriage for its complete30kg exchange envelope.';
    }
    furniture['service-emitter-'+change.nextId]=clone(change.plan);
    return {...change,previousPlan:old.completePlanWithValvesAndBrackets,previousBranch:old.pressurePairBranchPlan,
      heatChangeW,reason:'Release the floor approach to the retained purge window. Retain the complete valves and exchange duty. The separately scheduled principal400mm radiator retains its room heat margin.'};
  });
  s.heat.minRoomMarginW=Math.min(...Object.values(s.rooms).map(r=>r.marginW));
  // The rear west light is already fixed by its service head. Give the moved
  // radiator its original 50 mm lifting reserve below a 50 mm maximum cill.
  for(const register of [model.openings,model.archOpeningRegister]){
    register.FIRST.find(w=>w.id==='west-window-3').sill=850;
  }
  const utility=s.utility;
  const inverter={previousPlan:clone(utility.PVinverter),plan:[9397,700,250,500],localZ:[2100,2650],
    standingHeightMM:2000,overheadReserveMM:100,
    maintenance:'Isolate PV at the separate electrical station. Move the empty washer to its existing dry rest before erecting the access platform. The ordinary standing body remains below the inverter. Confirm the complete unit ventilation and fixing clearances within this reservation.'};
  utility.PVinverter=clone(inverter.plan);
  utility.PVinverterLocalZ=clone(inverter.localZ);
  utility.PVworkingField=[9647,700,1000,600];
  model.groundFurniture['service-utility-PVinverter']=clone(inverter.plan);
  model.servicesInterface.emitters=s.emitters.map(e=>({id:e.id,room:e.room,level:e.level,plan:clone(e.completePlanWithValvesAndBrackets),z:[e.bottomLocal,e.topLocal]}));
  model.servicesInterface.utility=utility;
  const definitions=[
    {room:'utility',level:'GROUND',opening:'south-window-4',wall:'south',body:[9725,754.5]},
    {room:'rearBath',level:'FIRST',opening:'north-window-0',wall:'north',body:[2100,11245.5]},
    {room:'kitchenDining',level:'GROUND',opening:'east-window-3',wall:'east',body:[11245.5,9950]},
    {room:'principalBath',level:'FIRST',opening:'east-window-2',wall:'east',body:[11242.5,7100],hands:[-1],head:2285,clearWH:[350,875]}
  ];
  const windows=definitions.map(item=>{
    const w=model.archOpeningRegister[item.level].find(p=>p.id===item.opening);
    const point=(along,normal,z)=>item.wall==='east'?[12000-normal,along,z]
      :item.wall==='north'?[along,12000-normal,z]:[along,normal,z];
    const ffl=item.level==='FIRST'?model.sections.firstFFL:0;
    const shoulder=[...item.body,ffl+1400],leaves=[];
    for(const hand of item.hands??[-1,1]){
      const hinge=w.centre+hand*425;
      const at=(angle,u,v,z)=>{
        const a=angle*Math.PI/180;
        return point(hinge-hand*(u*Math.cos(a)+v*Math.sin(a)),301.5-u*Math.sin(a)+v*Math.cos(a),ffl+z);
      };
      const samples=Array.from({length:141},(_,i)=>i/4);
      const gripPath=samples.map(a=>at(a,270,193,1370));
      const elbow=point(w.centre+hand*90,550,ffl+1380);
      const movingPivot=at(35,150,0,hand===-1?1190:1225);
      const pegNormal=495,pivotNormal=301.5-150*Math.sin(35*Math.PI/180);
      const pegAlong=hinge-hand*(150*Math.cos(35*Math.PI/180)+Math.sqrt(300**2-(pegNormal-pivotNormal)**2));
      const closedPegAlong=hinge-hand*(150+Math.sqrt(300**2-(pegNormal-301.5)**2));
      const z=hand===-1?1190:1225;
      leaves.push({hand,hinge:point(hinge,301.5,ffl+1250),completeWHDepth:[370,(item.head??2410)-1250,128],maximumMassKG:25,
        frames:[0,17.5,35].map(a=>({angle:a,plan:[[0,0],[370,0],[370,128],[0,128]].map(([u,v])=>at(a,u,v,1250).slice(0,2))})),
        gripPath:gripPath.filter((_,i)=>i===0||i===70||i===140),
        maximumSampledReachMM:Math.max(...gripPath.map(p=>distance(shoulder,p))),
        reachSamplingErrorMM:Math.hypot(270,193)*Math.PI/180*.125,
        articulatedArm:{elbow,upperLengthMM:distance(shoulder,elbow),maximumForearmLengthMM:Math.max(...gripPath.map(p=>distance(elbow,p))),
          capsuleRadiusMM:40,maximumCombinedLengthMM:distance(shoulder,elbow)+Math.max(...gripPath.map(p=>distance(elbow,p))),
          upperToPostLowerMM:550-429.5-40,forearmToPostLowerMM:90-25-40,handToOwnLeafMM:193-128-40,
          handToPostLowerMM:400-Math.hypot(270,193)-40,
          rejected350HandleToPostMM:400-Math.hypot(350,193)-40},
        stay:{pivot:movingPivot,openPeg:point(pegAlong,pegNormal,ffl+z),closedPeg:point(closedPegAlong,pegNormal,ffl+z),
          pivotToHoleMM:300,completeBarSectionMM:[20,5],completeVerticalEnvelopeMM:20,
          openLengthMM:distance(movingPivot,point(pegAlong,pegNormal,ffl+z)),
          pegReachMM:Math.max(distance(shoulder,point(pegAlong,pegNormal,ffl+z)),distance(shoulder,point(closedPegAlong,pegNormal,ffl+z)))},
        scope:'Plain bronze pin-and-peg stay, positive closed catch and three butt hinges. Grip remains controlled through the complete 0–35 degree travel before the stay is seated. The two stay planes are staggered below the moving leaves.'});
    }
    const furniture=item.level==='FIRST'?model.upperFurniture:model.groundFurniture;
    const clearances=Object.entries(furniture).filter(([,r])=>Array.isArray(r)&&r.length===4)
      .map(([id,r])=>{
        const emitter=s.emitters.find(e=>'service-emitter-'+e.id===id);
        const bottom=emitter?.bottomLocal??(id==='service-utility-PVinverter'?inverter.localZ[0]:0);
        const planGap=rectDistance(item.body,r)-300,verticalGap=Math.max(bottom-2000,0);
        return {id,mm:verticalGap?Math.hypot(Math.max(planGap,0),verticalGap):planGap,verticalGapMM:verticalGap};
      });
    const minimum=clearances.sort((a,b)=>a.mm-b.mm)[0];
    const clearWH=item.clearWH??[700,1000],area=clearWH[0]*clearWH[1]/1e6;
    const result={...item,centre:w.centre,roomAreaM2:s.rooms[item.room].plan,
      operatingTierLocalZ:[1250,item.head??2410],fixedLowerGlassToLocalZ:1175,guardTopMaximumLocalZ:1100,
      fixedCentrePost:{widthMM:50,normalMM:[301.5,429.5]},hingeHalfSpacingMM:425,
      leaves,openingAngleMinimumDegrees:35,nominalOpeningWH:clearWH,nominalOpeningAreaM2:area,
      openingAreaMethod:'England ADF Volume1,2021 Table1.4. A hinged opening of at least30 degrees uses opening area at least floor area/20. The selected stop is35 degrees. This is the nominal opening-area method; finite leaves still occupy part of the aperture plane.',
      floorTwentiethM2:s.rooms[item.room].plan/20,lowerBoundAreaRatio:area/(s.rooms[item.room].plan/20),
      minimumUnobstructedGlassM2:leaves.length*.270*((item.head??2410)-1250-100)/1000,
      bodyRadiusMM:300,bodyHeightMM:2000,shoulder,minimumFurnitureClearance:minimum,
      bodyToFinishedWallMM:25,bodyToAnyMovingLeafMM:25,
      completeLeafToCentrePostMM:400-Math.hypot(370,128),
      rejected400WideLeafToCentrePostMM:400-Math.hypot(400,128),
      maximumGripReachMM:Math.max(...leaves.map(p=>p.maximumSampledReachMM+p.reachSamplingErrorMM)),
      stayVerticalSeparationMM:35-20,upperStayToMovingLeafMM:1250-(1225+10),
      operation:'Close the room door where its swing enters the task. Open the positive catches from the standing position. Hold each leaf through its full outward travel, then seat its bronze stay before releasing the grip. Reverse this sequence to close. Keep both stays controlled during handover.',
      weather:'Two-stage drained meeting rebates and cill. No inward-opening arched coupled sash or removable guard is inherited. The defined rectangular sash, hinges, catches, stays, seals, glazing and frame require joined wind, rain, cycle and whole-window Uw qualification.',
      materials:{frame:'Mechanically jointed solid timber and retained glass family',hardware:'Unlacquered bronze hinges, catches, stay bars and pins',
        unresolved:['Glazing edge materials and flexible weather seals','Lubricants and any coatings or bushings','Actual hinge, stay and catch fastener constituents'],approvedExceptions:0},
      hardwareComparator:'https://croft.co.uk/products/bulb-end-casement-stay',
      hardwareBoundary:'The 305 mm Croft family is a dimensional and material comparator. This reference requires 300 mm between the actual pivot and selected peg hole, explicit 20×5 mm bronze bars and the drawn offset mounting lugs. No unmeasured stock pivot spacing or load rating is credited.'};
    for(const register of [model.openings,model.archOpeningRegister]){
      const q=register[item.level].find(p=>p.id===item.opening);
      q.operation=leaves.length===2?'Paired outward rectangular manual purge leaves at 35 degrees':'One southern outward rectangular manual leaf at 35 degrees with fixed northern glazing';q.leaves=leaves.length;
      q.operatingTierLocalZ=[1250,item.head??2410];q.openingLeafHeadMaximum=item.head??2410;q.selectedPurge=clone(result);
    }
    return result;
  });
  return {windows,relocations,inverter,additionalRearBlindAreaM2:.1};
}
