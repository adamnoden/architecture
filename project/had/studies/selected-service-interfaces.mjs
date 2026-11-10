import {serviceApertures} from './service-apertures.mjs';
import {selectPurgeWindows} from './purge-window-interfaces.mjs';
import {pathSeparation} from './service-interface-geometry.mjs';
import {headMaintenance} from './service-head-maintenance.mjs';

const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const length=path=>path.slice(1).reduce((sum,p,i)=>sum+distance(p,path[i]),0);
const clone=value=>structuredClone(value);

// An architectural interface selection on SAP-C1. Keep the failed inherited
// ports in structuralServiceReview so the source rewind remains inspectable.
export function selectServiceInterfaces(house,structure,corner,base,occupied){
  const m=house.model,s=m.architecturalServices,review=house.structuralServiceReview;
  const heads=clone(review.fixedHeads).map(h=>({...h,newOpaque:true}));
  const principalOpening=m.archOpeningRegister.FIRST.find(w=>w.id==='east-window-2');
  const rise=principalOpening.head-principalOpening.spring,half=principalOpening.width/2;
  const R=(half**2+rise**2)/(2*rise),archArea=R*R*Math.acos((R-rise)/R)-(R-rise)*half;
  const principalHoles=[['principal-bath-exhaust',7400,140,284],['principal-bath-condensate',7600,20,60]].map(([id,along,radius,faceWidth])=>{
    const gap=(z,r)=>Math.min(R-Math.hypot(along-7400,z-principalOpening.head+R)-r,500-Math.abs(along-7400)-r,z-2360-r)-75;
    return {id,radius,point:[12000,along,6054],frameGap:Math.min(gap(2604,radius),gap(2609.05,radius)),
      faceShape:id.endsWith('exhaust')?'circle':'square',faceWidth,
      faceGap:Math.min(gap(2603,faceWidth/2),gap(2604,faceWidth/2))};
  });
  heads.push({level:'FIRST',wall:'outer-east',id:'east-window-2',width:1000,along:7400,bandBottom:2360,border:75,
    holes:principalHoles,grossHeadAreaM2:(archArea+1000*(2550-2360))/1e6,newOpaque:false,incrementalOpaqueAreaM2:.01,
    interHoleWebMM:40,betweenWeatherFacesMM:28,
    cowl:'The main cartridge has a round284 outer face and a196-square downturned cowl within it. Its196×60 clear throat is11760mm². A2mm metal telescopic skirt with280mm internal diameter overlaps the278mm fixed receiver45mm. Nominal radial gap1mm, measured minimum0.5mm, with a drained lower exit and separate inner air seal. The insulation and247mm collar pass through the274mm clear receiver.'});
  const paths={
    'ground-WC':[[8200,1600,2950],[8400,1600,3000],[8950,1600,2994.5],[8950,0,2975]],
    utility:[[10800,1900,2950],[11000,1900,3000],[11275,1900,2997.25],
      [11275,2100,2995.25],[11275,2100,2507.25],[12000,2100,2500]],
    kitchen:[[10150,9950,2950],[10150,10150,3000],[8400,10150,2982.5],
      [8400,11275,2971.25],[8400,11275,2497.25],[8400,12000,2490]],
    'rear-bath':[[1700,9400,6370],[750,9400,6360.5],[750,9900,6355.5],
      [750,9900,5957.5],[0,9900,5950]],
    'family-bath':[[10875,5450,6370],[11275,5450,6380.25],[11275,5750,6377.25],[11275,5750,6132.25],[12000,5750,6125]],
    'principal-bath':[[11075,6900,6370],[11275,6900,6375],[11275,7400,6370],[11275,7400,6061.25],[12000,7400,6054]]
  };
  const drainPaths={
    'ground-WC':[[8200,1600,2790],[9130,1600,2780.7],[9130,800,2772.7],[9130,800,2708],[9130,0,2700]],
    utility:[[10800,1900,2790],[11075,1900,2787.25],[11075,2320,2783.05],[11075,2320,2509.25],[12000,2320,2500]],
    kitchen:[[10150,9950,2790],[8180,9950,2770.3],[8180,11075,2759.05],[8180,11075,2499.25],[8180,12000,2490]],
    'rear-bath':[[1700,9400,6210],[950,9400,6202.5],[950,10145,6195.05],[950,10145,5959.5],[0,10145,5950]],
    'family-bath':[[10875,5450,6210],[11075,5450,6208],[11075,6000,6202.5],[11075,6000,6109.25],[12000,6000,6100]],
    'principal-bath':[[11075,6900,6210],[11075,7600,6203],[11075,7600,6063.25],[12000,7600,6054]]
  };
  const roomAccess={
    utility:{platform:[10710,1765,650,650],body:[11035,2090]},
    kitchen:{platform:[8000,10700,650,650],body:[8325,11025]},
    'rear-bath':{platform:[640,9575,650,650],body:[965,9900]},
    'principal-bath':{platform:[10675,6725,650,650],body:[11000,7050],deckZ:600},
    cooker:{platform:[9615,10748,650,650],body:[9940,11073],
      parkedFurniture:{id:'low-food-larder',plan:[9700,8450,1000,200]}}
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
    if(port.id==='family-bath-exhaust')port.p=clone(paths['family-bath'].at(-1));
    if(port.id.endsWith('-condensate'))port.p=clone(drainPaths[port.id.replace('-condensate','')].at(-1));
    port.wall=port.p[0]===0?'outer-west':port.p[0]===m.shell?'outer-east':port.p[1]===0?'outer-south':'outer-north';
    port.localZ=port.p[2]-port.level*m.sections.firstFFL;
  }
  // Give every horizontal duct and independent condensate line a real fall.
  // Lower the ground WC outlet so the original 20 mm supports still fit.
  for(const fan of s.fanAccess){
    if(!paths[fan.id])continue;
    fan.path=clone(paths[fan.id]);
    if(fan.level){
      fan.selectedLoweringMM=30;
      fan.podZ=fan.podZ.map(z=>z-30);
      fan.workerEquipmentRequirement.ceilingFaceLocal-=30;
      fan.workerEquipmentRequirement.requiredTaskContactLocal=fan.workerEquipmentRequirement.requiredTaskContactLocal.map(z=>z-30);
      fan.workerEquipmentRequirement.maximumHeadTopLocal=2740;
    }
    const drain=m.exteriorPortGeometry.find(p=>p.id===fan.id+'-condensate');
    fan.ceilingTrapDrainPort={...fan.ceilingTrapDrainPort,centre:clone(drain.p),
      path:clone(drainPaths[fan.id]),routeStartMinimumZ:drainPaths[fan.id][0][2],
      scope:'Explicit falling route from the local trap outlet to its own visible outside sleeve. The drain remains independently accessible for cleaning.',
      fallRule:'Continuously falling independent 15 mm maximum outside drain. No return into the fan or concealed discharge into the head.'};
    const q=13,v=q/1000/(Math.PI*.125**2/4),L=length(fan.path)/1000;
    const ductPa=.6*v*v*(7+.025*L/.125);
    const roomPa=base.air.transfer.twoDoorPathScreenDepressionPa;
    fan.selectedRoute={lengthMM:L*1000,clearDuctMM:125,completeInsulatedOD:227,maximumCollarOD:247,
      sumKMaximum:7,normalLps:q,ductPa,roomPa,secondaryFrontPa:2,
      normalResistancePa:ductPa+roomPa+2,comparisonBackpressurePa:20,
      minimumOutwardGradient:.01,
      upperBodyToSectionMM:(fan.level?6550:3170)-Math.max(...fan.path.map(p=>p[2]))-113.5,
      groundSupportClearanceMM:fan.level?null:3170-Math.max(...fan.path.map(p=>p[2]))-123.5-20,
      completeSupportToSectionMM:(fan.level?6550:3170)-Math.max(...fan.path.map(p=>p[2]))-123.5-20,
      mainToIndependentDrainMM:pathSeparation(fan.path,drainPaths[fan.id])-123.5-7.5,
      splitLengthsMaximumMM:600,maintenance:roomAccess[fan.id]??fan.maintenance,
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
    splitLengthsMaximumMM:600,maintenance:roomAccess.cooker,
    cleaning:'Separate cleanout at each turn and independently supported split tubes. No sealed inaccessible elbow or shared wet-room duct. Close the cooking station for grease cleaning and retain the exhaust shut-off upstream.'};
  // The normal cooker duty now uses the longer selected route. Its fault
  // controls keep the greater inherited flow envelope as an adverse bound.
  s.cooker.operatingAir=review.hoodReroute;
  m.servicesInterface.cooker=s.cooker;
  m.servicesInterface.supply=s.supply;
  const weatherFaces=m.exteriorPortGeometry.map(p=>{
    const selected=headByPort.get(p.id)?.holes.find(h=>h.id===p.id);
    return {id:p.id,width:selected?.faceWidth??(p.id.endsWith('-supply')?400:p.id.endsWith('-condensate')?60:p.id==='east-foul-flashing'?320:p.id==='cooker-makeup'?360:330),
      shape:selected?.faceShape??(p.id.endsWith('-supply')||p.id.endsWith('-condensate')?'square':'circle'),
      outerProjectionMaximumMM:100,...(selected?{headGapMM:selected.faceGap}:{})};
  });
  const selectedCheck=serviceApertures(m,structure,corner,weatherFaces);
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
  // Reconcile the kitchen fridge before checking the actual purge bodies.
  m.groundFurniture['cold-storage']=clone(structure.kitchen.newFridge);
  const purgeChoice=selectPurgeWindows(m);
  for(const head of heads){
    const opening=m.archOpeningRegister[head.level].find(o=>o.id===head.id);
    const room=head.id==='east-window-0'?'utility':head.id==='west-window-3'?'rearBath':head.id==='east-window-2'?'principalBath':'kitchenDining';
    head.room=room;head.lowerGlass=head.id==='east-window-2'?'SOUTH RECTANGULAR LEAF plus fixed remaining glass':'FIXED';head.lowGlassHeightMM=head.bandBottom-opening.sill-150;
    const utility=head.id==='east-window-0';
    head.lowGlassWidthMM=head.width-(utility?275:150);
    head.partitionReturn=utility?{rawApertureEndY:head.along+head.width/2,retainedWallFaceY:2453,
      originalOverlapMM:head.along+head.width/2-2453,blindJambY:[2400,2600],
      clearGlassEndY:2400,clearGlassToWallMM:53,serviceCassetteAlongY:[1800,2400],
      cassetteToWallMM:53,additionalGrossBlindAreaM2:.2*(head.bandBottom-opening.sill)/1000,
      support:'Independent opaque jamb/partition return within the existing rough opening. Retain the utility wall and both original load-path duties. The glazing and removable service panel carry no masonry.'}:null;
    head.lowerGlazedFieldBeforeFramesM2=head.lowGlassWidthMM*head.lowGlassHeightMM/1e6;
    head.roomAccess=roomAccess[head.holes[0].id.replace('-exhaust','')];
    head.weather={metalFace:'316L outer and inner metal faces, mineral insulation and timber frame constituents charged to MAT.',
      outerProjectionMaximumMM:100,outwardThroatMinimumAreaMM2:Math.PI*125**2/4*.9,
      headPanelUpperLapMM:40,headPanelSideLapMM:25,bottomDripProjectionMM:30,drainedOuterJoint:true,
      principalTelescopicJoint:head.id==='east-window-2'?{receiverOD:278,skirtOD:284,skirtMetal:2,nominalRadialGap:1,minimumMeasuredRadialGap:.5,axialOverlap:45,lowerDrainOpen:true}:null,
      innerBoundary:'Separate accessible air seal and insulated sleeve. No water path through mineral insulation or into the frame.',
      admission:'Actual joint constituents, pressure, wind-driven rain, thermal bridges and exhaust re-entry remain measured/product/site obligations.'};
    for(const register of [m.openings,m.archOpeningRegister]){
      const q=register[head.level].find(o=>o.id===head.id);
      if(head.id!=='east-window-2'){
        q.operation='FIXED lower glazing and fixed service head with exterior cartridges';q.leaves=0;
        q.openingLeafHeadMaximum=null;
      }
      q.fixedTransomTopBand=q.head-head.bandBottom;
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
  const purge=purgeChoice.windows;
  const headArea=heads.filter(h=>h.newOpaque).reduce((total,h)=>total+h.grossHeadAreaM2,0);
  const daylight=['utility','rearBath','kitchenDining','principalBath'].map(room=>{
    const removed=heads.filter(h=>h.room===room).reduce((n,h)=>n+h.grossHeadAreaM2+(h.partitionReturn?.additionalGrossBlindAreaM2??0),0)
      +(room==='rearBath'?purgeChoice.additionalRearBlindAreaM2:0);
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
  for(const head of heads)headMaintenance(head,m);
  const interfaceSelection={id:'HAD-SERVICES-02',basis:structure.candidate,heads,
    ports:selectedCheck.ports.map(p=>({id:p.id,point:p.point,radius:p.radius,minimumMM:p.minimum})),
    weatherFaces:selectedCheck.ports.map(p=>p.weather),
    fixedHeadOpaqueAreaM2:headArea,additionalUtilityBlindAreaM2:.27,additionalPrincipalBandAreaM2:.01,purge,daylight,separation,
    occupiedConsequences:{radiators:purgeChoice.relocations,inverter:purgeChoice.inverter,additionalRearBlindAreaM2:purgeChoice.additionalRearBlindAreaM2},
    normalHouseExtractLps:s.fanAccess.reduce((n,f)=>n+f.modes[0],0),
    conservativeFloorCriterionLps:base.air.floorCriterionLps,
    heatBoundary:'Retain the former whole-opening Uw 1.6 upper limit and all opening perimeters. No heat-loss reduction is credited for the opaque bands.',
    outside:'All exhausts discharge openly outside the four external elevations. No outlet enters the courtyard, loggia or an architectural screen. Head glazing remains fixed below the new outlets. Resolve site wind, nearby open windows and buildings with the selected terminal before installation.',
    scope:'One occupied architectural reference with complete service locations. Installed apparatus, material exceptions, weather, fire, wind and structural acceptance remain separately owned.'};
  house.selectedServiceInterfaces=interfaceSelection;
  s.materials.serviceHeadOccurrences=heads.map(h=>({occurrence:'S10 '+h.level+' '+h.id,
    fixedOuterHead:'316L faces and sleeve, mineral insulation, independently supported timber frame',
    portCartridge:'316L removable outward cartridge and supported flat room-side joint, with retained fixed receiver and separate temporary weather blank',
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
