import {serviceApertures} from './service-apertures.mjs';

const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const length=path=>path.slice(1).reduce((sum,p,i)=>sum+distance(p,path[i]),0);
const clone=value=>structuredClone(value);

function serviceRenewal(head,ffl){
  const port=head.holes[0],axis=port.point[2]-ffl,receiver=head.receiver;
  // Normal distance increases inward from the outer masonry face. The
  // finished room face is 429.5, beyond the retained glazing and weather head.
  const box=(normal,along,z)=>head.wall==='outer-east'
    ?[12000-normal[1],along[0],ffl+z[0],normal[1]-normal[0],along[1]-along[0],z[1]-z[0]]
    :head.wall==='outer-west'
      ?[normal[0],along[0],ffl+z[0],normal[1]-normal[0],along[1]-along[0],z[1]-z[0]]
      :[along[0],12000-normal[1],ffl+z[0],along[1]-along[0],normal[1]-normal[0],z[1]-z[0]];
  const panelZ=[axis-150,axis+150],along=head.wall==='outer-north'?port.point[0]:port.point[1];
  const states=[0,600,900].map(draw=>box([455+draw,505+draw],receiver.cassetteAlong,panelZ));
  return {part:'Room-side inner service cassette. The retained wall sleeve and outer weather head have their own exterior renewal operation.',
    maximumCompleteMassKG:25,finishedWallNormalMM:429.5,retainedOuterSleeveEndNormalMM:455,
    cassetteNormalMM:[455,505],maximumPanelWidthMM:receiver.cassetteAlong[1]-receiver.cassetteAlong[0],
    panelLocalZ:panelZ,inwardDrawMM:600,secondDrawMM:300,firstDuctDropMM:250,
    firstPiece:{part:'Room-side straight tube with two radial split collars and flat butt joints',
      normalMM:[505,600],completeOD:227,axialPilotMM:0,
      initialBox:box([505,600],[along-113.5,along+113.5],[axis-114.5,axis+114.5]),
      droppedBox:box([505,600],[along-113.5,along+113.5],[axis-364.5,axis-135.5]),
      clearOfFixedGlazingMM:505-429.5},
    removedNext:port.id==='cooker-exhaust'
      ?{part:'Separate elbow and short diagonal tail',maximumCentrelineLengthMM:600,retainedTrunkAlongMinimum:10350,
        retainedTrunkToCassetteMM:10350-113.5-receiver.cassetteAlong[1]}
      :{part:'Separate elbow and lower riser',maximumCentrelineLengthMM:600,retainedRiserBottomLocalZ:2800,
        retainedRiserToCassetteMM:2800-panelZ[1]},
    panelStates:states,loweredBox:box([1355,1405],receiver.cassetteAlong,[900,1200]),receiver,
    support:'Two independent temporary runners support the cassette before its accessible fasteners are released. They remain engaged through 600 mm and 300 mm travel. Transfer onto the supported carrier inside the dry-rest field before lowering its base to 900 mm. The selected feet, runners and anchors must support the complete 25 kg design envelope and task loads.',
    order:['Isolate the fan, cooker and hot duty. Support both duct sides, the retained sleeve and the inner cassette.',
      'Open both radial collars of the 95 mm room-side tube at normal 505–600. Lower that supported tube 250 mm and carry it inward to the dry receiver.',
      'Remove the separately supported elbow and lower riser. Cap the retained sleeve at its accessible room-side flat face. Release the inner cassette from the flat joint.',
      'Draw the 50 mm-deep cassette inward 600 mm and then 300 mm on its runners. Transfer its complete body to the receiver before lowering. Restore and test the disturbed boundaries before enabling the room.'],
    rejection:'A socket or pilot crossing the joint, an inaccessible fastener, a larger body or a retained elbow in the swept volume rejects this internal task.'};
}

// An architectural interface selection on SAP-C1. Keep the failed inherited
// ports in structuralServiceReview so the source rewind remains inspectable.
export function selectServiceInterfaces(house,structure,corner,base,occupied){
  const m=house.model,s=m.architecturalServices,review=house.structuralServiceReview;
  const heads=clone(review.fixedHeads);
  const paths={
    'ground-WC':[[8200,1600,2950],[8400,1600,3010],[8950,1600,3004.5],[8950,0,2985]],
    utility:[[10800,1900,2950],[11000,1900,3010],[11275,1900,3007.25],
      [11275,2100,3005.25],[11275,2100,2507.25],[12000,2100,2500]],
    kitchen:[[10150,9950,2950],[10150,10150,3010],[8400,10150,2992.5],
      [8400,11275,2981.25],[8400,11275,2497.25],[8400,12000,2490]],
    'rear-bath':[[1700,9400,6400],[750,9400,6390.5],[750,9900,6385.5],
      [750,9900,5957.5],[0,9900,5950]],
    'family-bath':[[10875,5450,6400],[11275,5450,6410.25],[11275,5750,6407.25],[12000,5750,6400]],
    'principal-bath':[[11075,6900,6400],[11275,6900,6405],[11275,7400,6400],[11275,7400,6067.25],[12000,7400,6060]]
  };
  const drainPaths={
    'ground-WC':[[8200,1600,2940],[9130,1600,2930.7],[9130,800,2922.7],[9130,800,2808],[9130,0,2800]],
    utility:[[10800,1900,2940],[11200,1900,2936],[11200,2320,2931.8],[11200,2320,2508],[12000,2320,2500]],
    kitchen:[[10150,9950,2940],[8180,9950,2920.3],[8180,11200,2907.8],[8180,11200,2498],[8180,12000,2490]],
    'rear-bath':[[1700,9400,6390],[800,9400,6381],[800,10145,6373.55],[800,10145,5958],[0,10145,5950]],
    'family-bath':[[10875,5450,6390],[11200,5450,6386.75],[11200,5950,6381.75],[11200,5950,6258],[12000,5950,6250]],
    'principal-bath':[[11075,6900,6390],[11200,6900,6388.75],[11200,7600,6381.75],[11200,7600,6068],[12000,7600,6060]]
  };
  const withdrawals={
    utility:{platform:[10245,1525,1100,750],headReceiver:[10350,1775,600,650],cassetteAlong:[1800,2400],direction:[-600,0,0],secondDraw:[-300,0,0]},
    kitchen:{platform:[7750,10300,900,1100],headReceiver:[8100,10450,500,600],cassetteAlong:[8125,8575],direction:[0,-600,0],secondDraw:[0,-300,0]},
    'rear-bath':{platform:[650,9550,1100,750],headReceiver:[825,9575,650,650],cassetteAlong:[9600,10200],direction:[600,0,0],secondDraw:[300,0,0]},
    cooker:{platform:[9700,10350,1000,1100],headReceiver:[9625,10550,600,600],cassetteAlong:[9650,10150],direction:[0,-600,0],secondDraw:[0,-300,0],
      parkedFurniture:{id:'low-food-larder',plan:[7750,10400,1000,200]}}
  };
  const headByPort=new Map(heads.flatMap(h=>h.holes.map(p=>[p.id,h])));
  const replacements=new Map(review.ports.filter(p=>p.replacement).map(p=>[p.id,p.replacement]));
  for(const port of m.exteriorPortGeometry){
    const replacement=replacements.get(port.id),head=headByPort.get(port.id);
    if(replacement)port.p=clone(replacement.point);
    if(head){
      port.p=clone(head.holes.find(p=>p.id===port.id).point);
      port.cassette=true;
      port.windowHead=head.id;
    }
    if(port.id==='ground-WC-exhaust')port.p=clone(paths['ground-WC'].at(-1));
    if(port.id.endsWith('-condensate'))port.p=clone(drainPaths[port.id.replace('-condensate','')].at(-1));
    port.wall=port.p[0]===0?'outer-west':port.p[0]===m.shell?'outer-east':port.p[1]===0?'outer-south':'outer-north';
    port.localZ=port.p[2]-port.level*m.sections.firstFFL;
  }
  // Give every horizontal duct and independent condensate line a real fall.
  // Lower the ground WC outlet so the original 20 mm supports still fit.
  for(const fan of s.fanAccess){
    if(!paths[fan.id])continue;
    fan.path=clone(paths[fan.id]);
    const drain=m.exteriorPortGeometry.find(p=>p.id===fan.id+'-condensate');
    fan.ceilingTrapDrainPort={...fan.ceilingTrapDrainPort,centre:clone(drain.p),
      path:clone(drainPaths[fan.id]),routeStartMinimumZ:drainPaths[fan.id][0][2],
      scope:'Explicit falling route from the local trap outlet to its own visible outside sleeve. The drain remains independently accessible for cleaning.',
      fallRule:'Continuously falling independent 15 mm maximum outside drain. No return into the fan or concealed discharge into the head.'};
    const q=13,v=q/1000/(Math.PI*.125**2/4),L=length(fan.path)/1000;
    const ductPa=.6*v*v*(7+.025*L/.125);
    const roomPa=base.air.transfer.twoDoorPathScreenDepressionPa;
    fan.selectedRoute={lengthMM:L*1000,clearDuctMM:125,completeInsulatedOD:227,
      sumKMaximum:7,normalLps:q,ductPa,roomPa,secondaryFrontPa:2,
      normalResistancePa:ductPa+roomPa+2,comparisonBackpressurePa:20,
      minimumOutwardGradient:.01,
      upperBodyToSectionMM:(fan.level?6550:3170)-Math.max(...fan.path.map(p=>p[2]))-113.5,
      groundSupportClearanceMM:fan.level?null:3170-Math.max(...fan.path.map(p=>p[2]))-113.5-20,
      splitLengthsMaximumMM:600,maintenance:withdrawals[fan.id]??fan.maintenance,
      scope:'Whole installed K includes all bends, trap, transition, grille, terminal and connections. Fan CF1 and measured normal/boost flow remain acceptance conditions.'};
    const extract=m.servicesInterface.extract.find(p=>p.id===fan.id);
    extract.mainPort=clone(fan.path.at(-1));
    extract.condensatePort=clone(fan.ceilingTrapDrainPort);
    extract.path=clone(fan.path);
    extract.selectedRoute=fan.selectedRoute;
  }
  for(const inlet of s.supply){
    const port=m.exteriorPortGeometry.find(p=>p.id===inlet.id+'-supply');
    inlet.point=clone(port.p);inlet.wall=port.wall.replace('outer-','');
    inlet.faceTopLocal=port.localZ+200;inlet.ceilingClearance=3100-inlet.faceTopLocal;
    inlet.selectedFirstRelease={inwardDrawMM:450,retainedOuterWeatherFlange:true,
      sequence:'Isolate the local ventilation task, support the inner terminal, release the radial collar and draw its cartridge into the room. Keep the fixed outer sleeve and temporary weather closure supported.'};
  }
  s.cooker.extractPoint=clone(m.exteriorPortGeometry.find(p=>p.id==='cooker-exhaust').p);
  s.cooker.exhaustRoute=[[11125,11443.5,2600],[9900,11275,2572.25],[9900,12000,2565]];
  s.cooker.selectedRoute={lengthFromStackMM:length(s.cooker.exhaustRoute),
    clearDuctMM:125,completeInsulatedOD:s.cooker.fullInsulatedOD,
    conservativeAddedLengthM:review.hoodReroute.addedLengthM,conservativeAddedK:review.hoodReroute.addedBendK,
    operation:review.hoodReroute,minimumOutwardGradient:.01,
    splitLengthsMaximumMM:600,maintenance:withdrawals.cooker,
    cleaning:'Separate cleanout at each turn and independently supported split tubes. No sealed inaccessible elbow or shared wet-room duct. Close the cooking station for grease cleaning and retain the exhaust shut-off upstream.'};
  // The normal cooker duty now uses the longer selected route. Its fault
  // controls keep the greater inherited flow envelope as an adverse bound.
  s.cooker.operatingAir=review.hoodReroute;
  m.servicesInterface.cooker=s.cooker;
  m.servicesInterface.supply=s.supply;
  const selectedCheck=serviceApertures(m,structure,corner);
  for(const port of selectedCheck.ports){
    const current=m.exteriorPortGeometry.find(p=>p.id===port.id);
    current.minimumRingOrCassetteReserve=port.minimum;
    current.pass=port.minimum>=25;
    current.scope='Selected complete formed aperture on the sixteen shifted SAP-C1 openings. Fixed-head and outside weather faces are separately scheduled.';
  }
  for(const edit of structure.openingEdits){
    for(const register of [m.openings,m.archOpeningRegister]){
      const opening=register[edit.level].find(p=>p.id===edit.id);
      if(opening.centre!==edit.old)throw Error('Changed structural source '+edit.id);
      opening.centre=edit.new;
    }
  }
  for(const head of heads){
    const opening=m.archOpeningRegister[head.level].find(o=>o.id===head.id);
    const room=head.id==='east-window-0'?'utility':head.id==='west-window-3'?'rearBath':'kitchenDining';
    head.room=room;head.lowerGlass='FIXED';head.lowGlassHeightMM=head.bandBottom-opening.sill-150;
    const utility=head.id==='east-window-0';
    head.lowGlassWidthMM=head.width-(utility?275:150);
    head.partitionReturn=utility?{rawApertureEndY:head.along+head.width/2,retainedWallFaceY:2453,
      originalOverlapMM:head.along+head.width/2-2453,blindJambY:[2400,2600],
      clearGlassEndY:2400,clearGlassToWallMM:53,serviceCassetteAlongY:[1800,2400],
      cassetteToWallMM:53,additionalGrossBlindAreaM2:.2*(head.bandBottom-opening.sill)/1000,
      support:'Independent opaque jamb/partition return within the existing rough opening. Retain the utility wall and both original load-path duties. The glazing and removable service panel carry no masonry.'}:null;
    head.lowerGlassClearAreaM2=head.lowGlassWidthMM*head.lowGlassHeightMM/1e6;
    head.receiver=withdrawals[head.holes[0].id.replace('-exhaust','')];
    head.weather={metalFace:'316L outer and inner metal faces, mineral insulation and timber frame constituents charged to MAT.',
      outerProjectionMaximumMM:100,outwardThroatMinimumAreaMM2:Math.PI*125**2/4*.9,
      upperLapMM:40,sideLapMM:25,bottomDripProjectionMM:30,drainedOuterJoint:true,
      innerBoundary:'Separate accessible air seal and insulated sleeve. No water path through mineral insulation or into the frame.',
      admission:'Actual joint constituents, pressure, wind-driven rain, thermal bridges and exhaust re-entry remain measured/product/site obligations.'};
    head.renewal=serviceRenewal(head,head.level==='FIRST'?m.sections.firstFFL:0);
    for(const register of [m.openings,m.archOpeningRegister]){
      const q=register[head.level].find(o=>o.id===head.id);
      q.operation='FIXED lower glazing with separately removable service head';q.leaves=0;
      q.fixedTransomTopBand=q.head-head.bandBottom;q.openingLeafHeadMaximum=null;
      q.serviceHead=clone(head);
    }
  }
  // Consume the same occupied furniture consequences as the structural source.
  m.groundFurniture['cold-storage']=clone(structure.kitchen.newFridge);
  m.fridgeDoor={...m.fridgeDoor,hinge:clone(structure.kitchen.hinge),
    operation:'WEST from the high/north hinge, with the appliance 300 mm south.',
    operationWitness:{source:'project/str/studies/reconciled-house-interface.json',
      continuousBodyLowerBound:structure.kitchen.bodyToFixedMm,continuousArmLowerBound:structure.kitchen.armToFixedMm}};
  m.upperFurniture.principal=clone(structure.principalBed.ordinaryBed);
  delete m.upperFurniture['principal-head'];
  s.emitters.find(e=>e.id==='principal-N').renewal.parkedBed=clone(structure.principalBed.servicePark);
  m.windowRequirements=m.windowRequirements.filter(w=>!['kitchen8300','kitchen10200'].includes(w.id)).map(w=>{
    const action=occupied.namedWindowActions[w.id];
    return action?{...w,body:clone(action.body),handle:clone(action.grip),planReach:action.reach,
      source:'project/str/studies/house-corner-rewind.json'}:w;
  });
  m.inheritedWaterHouseEvidence={source:'project/had/studies/water-replan.json',
    wholeHouseFit:m.wholeHouseFit,architecturalDevelopmentProof:m.architecturalDevelopmentProof,
    scope:'The preceding water-house proofs retain their exact old geometry. The occupied service composition does not inherit a whole-house pass from them.'};
  delete m.wholeHouseFit;
  delete m.architecturalDevelopmentProof;
  const purge=[['utility','GROUND','south-window-4'],['rearBath','FIRST','north-window-0'],
    ['kitchenDining','GROUND','east-window-3']].map(([room,level,id])=>{
    const w=m.archOpeningRegister[level].find(o=>o.id===id),clear=.7;
    return {room,opening:id,roomAreaM2:s.rooms[room].plan,clearRectangularAreaM2:clear,
      centre:w.centre,operatingTierLocalZ:[1250,2410],movingFrameWH:[852,1160],minimumClearAfterHardwareWH:[700,1000],
      floorTwentiethM2:s.rooms[room].plan/20,openingAngleMinimumDegrees:35,
      lowerBoundAreaRatio:clear/(s.rooms[room].plan/20)};
  });
  const headArea=heads.reduce((total,h)=>total+h.grossHeadAreaM2,0);
  const daylight=['utility','rearBath','kitchenDining'].map(room=>{
    const removed=heads.filter(h=>h.room===room).reduce((n,h)=>n+h.grossHeadAreaM2+(h.partitionReturn?.additionalGrossBlindAreaM2??0),0);
    return {room,oldGrossGlazingM2:s.rooms[room].windows,opaqueHeadM2:removed,
      retainedGrossGlazingM2:s.rooms[room].windows-removed,
      retainedToFloorRatio:(s.rooms[room].windows-removed)/s.rooms[room].plan};
  });
  const outlets=m.exteriorPortGeometry.filter(p=>p.id.endsWith('-exhaust'));
  const intakes=m.exteriorPortGeometry.filter(p=>p.id.endsWith('-supply')||p.id==='cooker-makeup');
  const separation=outlets.map(outlet=>{
    const distances=intakes.map(inlet=>({id:inlet.id,axisDistanceMM:distance(outlet.p,inlet.p),
      clearSphericalFaceBoundMM:distance(outlet.p,inlet.p)-Math.SQRT2*(200+180)}));
    return {outlet:outlet.id,nearestIntake:distances.sort((a,b)=>a.axisDistanceMM-b.axisDistanceMM)[0]};
  });
  const interfaceSelection={id:'HAD-SERVICES-02',basis:structure.candidate,heads,
    ports:selectedCheck.ports.map(p=>({id:p.id,point:p.point,radius:p.radius,minimumMM:p.minimum})),
    fixedHeadOpaqueAreaM2:headArea,additionalUtilityBlindAreaM2:.27,purge,daylight,separation,
    normalHouseExtractLps:s.fanAccess.reduce((n,f)=>n+f.modes[0],0),
    conservativeFloorCriterionLps:base.air.floorCriterionLps,
    heatBoundary:'Retain the former whole-opening Uw 1.6 upper limit and all opening perimeters. No heat-loss reduction is credited for the opaque bands.',
    outside:'All exhausts discharge openly outside the four external elevations. No outlet enters the courtyard, loggia or an architectural screen. Head glazing remains fixed below the new outlets. Resolve site wind, nearby open windows and buildings with the selected terminal before installation.',
    scope:'One occupied architectural reference with complete service locations. Installed apparatus, material exceptions, weather, fire, wind and structural acceptance remain separately owned.'};
  house.selectedServiceInterfaces=interfaceSelection;
  s.materials.serviceHeadOccurrences=heads.map(h=>({occurrence:'S10 '+h.level+' '+h.id,
    fixedOuterHead:'316L faces and sleeve, mineral insulation, independently supported timber frame',
    innerCassette:'316L removable inner face and split-collar tubes with supported flat joints',
    ancillary:'Actual seals, coatings, binders, fasteners and joint constituents enter the strict material register before installation.',
    utilityBlindReturnM2:h.partitionReturn?.additionalGrossBlindAreaM2??0,approvedExceptions:0}));
  s.facade=interfaceSelection;s.authority='HAD-SERVICES-02 selected occupied architectural reference';
  m.servicesInterface.source=s.authority;
  m.servicesOccurrenceProof={source:s.authority,emitters:s.emitters.length,extract:s.fanAccess.length,fittedWC:4};
  m.servicesAuxiliaryProjection.source=s.authority;
  m.servicesAuxiliaryProjection.serviceHeads=heads.map(h=>({id:h.id,level:h.level,renewal:h.renewal}));
  m.servicesProjection={source:s.authority,path:'project/had/studies/current-house-services.json',method:'Default current-house compositor and its source-bound schedule.'};
  m.selection={decision:'SELECT occupied service reference',source:'project/had/studies/current-house.mjs',result:'project/had/inhabited-services-selection.md'};
  house.id='HAD-SERVICES-02';house.architecturalServiceSelected=true;
  return interfaceSelection;
}
