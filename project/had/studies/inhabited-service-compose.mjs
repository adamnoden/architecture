// Prospective current occupied-house compositor recovered on the branch for
// HAD-SERVICES-ADOPTION. Historical water and structural documents stay immutable.
export function composeOccupiedHouse(twoExit,previous,offer,tempered,heatPurchase,rooms,faults,court){
  const copy=o=>JSON.parse(JSON.stringify(o)),model=copy(twoExit.model),s=copy(previous.interfaces.architecturalServices);
  const controls=s.plant.controlsHydraulics,riser=s.plant.riserGross,bufferStation=s.plant.primaryBuffer.station;
  const centre=offer.comparedStore.centre;
  const cylinder={family:'Bespoke pressure-rated unvented Howden mineral-clad direct store in MS103-size territory',
    stockMS103:{allowedHeadM:25,workingBar:2.45,emptyKg:118,fullKg:488,acceptedAt3point5Bar:false},
    catalogueL:370,orderedMinUsableL:300,body:[centre[0]-380,centre[1]-380,760,760],
    station:[9450,3870,760,760],height:1650,workingEast:offer.comparedStore.newWorkingEast,
    centre,cartRadius:425,minDoor:[1000,2300],doorRaw:[3900,5300],
    path:[[9830,4250],[10500,4250],[10500,4575],[12500,4575]],westSeat:offer.comparedStore.newWestSeat,
    lift:'Empty, isolate, cap and independently support. Remove west bridge AND stand; permit the directly sensed factory T&P to remain. Prove actual gross valve/case and captured dry mass.'};
  const buffer={article:'UK Cylinders FCBVS0300',station:bufferStation,body:[10177.5,5052.5,545,545],height:1975,
    maxRetainedHeight:2175,completeDiameter:600,nominalL:300,requiredUsefulLayerL:260,dryFullKg:[45,335],
    defrostKWh:rooms.totals.tenMinuteDefrostKWh,chargedKWh:rooms.totals.chargedStratifiedKWh,
    maxDeck:100,minimumRecoveryMinutes:rooms.totals.rechargeMin};
  const safety={directTopTP:[10035,4550,1730],expansion:[10120,4760,1720],manifold:[10035,4660,1620],tangent:[10035,4800,1480],
    tundish:[10035,4800,1400],D1Developed:[432.263,441.699],D1ToJacketMin:27.998,topValveRadial:36.65,
    D2:[['G½',28,11.847],['G¾',35,13.447],['G1',42,14.647]],maxD2EquivalentM:18,outfall:[12350,2500,-1850],
    shoulder:[10545,4425,1450],TPExpAndTundishReach:[595.08,604.77,635],mainsPortTrial:[10131.50,4018.71,380],
    elementRelease:{port:[10210,4250],immersionAndTool:[550,150],endX:10910},requiresFactoryUnventedAssembly:true};
  s.schemaVersion=2;s.authority='HAD-SERVICES-ADOPTION-01 recovery proposal';
  s.plant={controlsHydraulics:controls,riserGross:riser,cylinder,primaryBuffer:buffer,independentSafety:safety,
    heatPump:{model:'Panasonic WH-WXG16ME8',body:heatPurchase.preferredThreePhase.newBodyMM,usableKW:14,
      primary:[65,55],secondary:[55,45],maxOutdoorAmpsPerPhase:19,protectedSiteZone:heatPurchase.preferredThreePhase.openGroundZone,
      correctedPrimary:heatPurchase.preferredThreePhase.correctedPrimary,secondaryHXkWperK:1.4,backupKWCredited:0},
    maintenance:{ladderClearTank:350,ladderClearBuffer:399,ladderEastBayOverlap:[585,470],crewToTankAfter300:70,
      entry:'Park the isolated ladder before working the east face, removing the vessel or energising the wetted plant.'}};
  const changed={'principal-N':[1200,offer.principal.trialH600L1200],'bed2-S':[900,[3425,429.5,1050,200]],'bed3-S':[900,[7625,429.5,1050,200]]};
  s.emitters=s.emitters.map(e=>{
    if(!changed[e.id])return e;
    const [length,box]=changed[e.id],bed2=e.id==='bed2-S',principal=e.id==='principal-N';
    return {...e,length,completePlanWithValvesAndBrackets:box,renewal:{frontOnly:true,length,
      firstRest:principal?[10165,10760,1350,300]:[bed2?3400:7600,700,1100,300],
      parkedWardrobe:principal?null:bed2?[2320,'existing Y']:[9180,980],parkedBed:principal?offer.principal.servicePark:null,
      minStoredFurnitureReserve:principal?25:bed2?67.5:47.5,pairedCrouchedValveReach:principal?null:[471.5,474.6],
      actions:'Empty and restrain furniture; isolate/counterhold/support both valves and lift to captured front receiver. Leak-test, vent, retether and restore.'}};
  });
  s.roomElectric=[
    {id:'protected-ground-fan',room:'protected-G',case:[4200,2747,275,131],z:[350,750],article:'Stiebel CK20 236653',W:2000,V:230,phase:'L2'},
    {id:'protected-ground-panel',room:'protected-G',case:[2920,2747,426,100],z:[350,800],article:'Stiebel CNS100 202003',W:1000,V:240,phase:'L2'},
    {id:'protected-upper-fan',room:'protected-F',case:[8179.5,5755,131,275],z:[350,750],article:'Stiebel CK20 236653',W:2000,V:230,phase:'L3'},
    {id:'rear-bedroom-panel',room:'bed4',case:[7425.5,8450,100,348],z:[350,800],article:'Stiebel CNS50 202001',W:500,V:240,phase:'L3'}];
  s.fanAccess=s.fanAccess.map(f=>({...f,article:'Titon TP640Hi',modes:f.id==='kitchen'?[5,16,20]:[13,16]}));
  s.cooker={...s.cooker,hood:'Swegon Salsa/Twist 10 V on verified hot demand',minimumCaptureLps:48,extractPoint:[11125,12000,2600],duct:125,
    makeupFormedTerritory:320,makeupRequirement:'Measured separately tempered direct intake, 18°C minimum high, 78 L/s floor',
    supplyUnit:{model:'Blauberg EC MW 700 S31',plan:tempered.roomAndRelease.unitPlan,z:tempered.roomAndRelease.unitConservativeZ,route:tempered.roomAndRelease.intakeOffsetRoute},
    stack:{hoodConnector:[1679,1879],addedIsolation:[1879,2079],fan:[2079,2432],outletStraight:[2432,2521],bendAxis:2600},
    closure:{article:'Belimo NKQ24A-SR 6 Nm, stored-power 4 s, zero bridging',seats:[[11125,11443.5,1979],[11282.5,11450,3010],[11380,8600,2400]],
      detectionS:.35,actuatorS:4,witnessS:.40,maxExtractLeakLpsEach:.25,proof: faults.air}};
  s.transfers={dryDoorIds:['STUDY','FD-WEST-CROSS','BED2','BED3','BED4','PRINCIPAL','PLANT','FD-EAST-CROSS'],
    wet:[['guestWC',0,'wc-north',8875],['rearBath',1,'rear-wet-east',9910],['familyBath',1,'wet-spine',5010],['principalBath',1,'rear-east-principal',11150]],
    dryArticle:'LVN20S including Talkback, approved fire-door host, liners and conductor hinges',wetArticle:'LVH44S 250×200 in qualified rigid wall',
    eastEquivalent:35000,otherEquivalent:7600,stair:90000,warning:'Measured flow with all native hardware, false/tripped shutter, humidity, fault and alarm state are independent conditions.'};
  s.rooms=rooms.rooms;s.heat=rooms.totals;s.hotWater=faults.hotWater;
  s.electrical={phaseHotA:[51,32.912318840579715,32.778985507246375],servicePhases:3,nominalAperPhase:80,
    rule:'Measured site minimum and replacement controls, 216.2 V sensitivity, DHW inhibited during cooking. Domestic accessory and actual field loads remain separate.'};
  s.materials={approvedExceptions:0,offerCounts:offer.counts,rearStack:offer.rearFoulService,
    occurrences:['S01 copper and accessible heat-protected repairs','S02 316L foul spool, four EPDM seal positions and accessible condensate',
      'S03 separated primary and sixteen hydronic plus four electric emitters','S04 unvented pressure-rated mineral-clad build',
      'S05 six local fans','S06 six inlets, eight dry doors and four wet wall transfers','S07 separate hood/tempered supply and three fast isolators',
      'S08 separate accessible MI power and data','S09 wired pressure/travel/heat witnesses','S10 restored boundary at every actual crossing']};
  model.architecturalServices=s;
  for(const e of s.emitters)(e.level?model.upperFurniture:model.groundFurniture)['service-emitter-'+e.id]=e.completePlanWithValvesAndBrackets;
  for(const e of s.roomElectric)(e.room==='protected-G'?model.groundFurniture:model.upperFurniture)['supplement-'+e.id]=e.case;
  model.groundFurniture['plant-water-reserve']=cylinder.station;delete model.groundFurniture['plant-primary-buffer-round-bounding600'];
  model.groundFurniture['plant-primary-buffer-FCBVS0300']=buffer.body;
  model.fixedServicesAboveFloor=[{id:'cooker-water-tempering',plan:s.cooker.supplyUnit.plan,z:s.cooker.supplyUnit.z}];
  for(const [id,point,radius] of [['cooker-exhaust',s.cooker.extractPoint,160],['cooker-makeup',s.cooker.makeupPoint,160]]){
    const p=model.exteriorPortGeometry.find(q=>q.id===id);
    p.minimumRingOrCassetteReserve-=Math.hypot(...p.p.map((v,i)=>v-point[i]))+radius-p.r;
    p.r=radius;p.p=point;p.localZ=point[2];p.pass=p.minimumRingOrCassetteReserve>10;
    if(!p.pass)throw Error('Changed port outside bounded arch reservation '+id);
  }
  const dry=model.protectedRoute.doors.filter(d=>s.transfers.dryDoorIds.includes(d.id)).map(d=>({id:d.id,opening:d.id==='FD-EAST-CROSS'?[409,409]:[209,209],
    centreAlong:(d.rough[0]+d.rough[1])/2,centreHeight:650}));
  const wet=s.transfers.wet.map(([room,l,id,along])=>{
    const w=(l?model.upperWalls:model.groundWalls).find(w=>w.id===id),i=w.a[0]===w.b[0]?1:0;
    if(!w||w.t<95||along-145<Math.min(w.a[i],w.b[i])||along+145>Math.max(w.a[i],w.b[i])||w.holes.some(([a,b])=>along+145>a&&along-145<b))throw Error('Wet transfer crosses existing rough '+id);
    return {room,level:l,host:id,along,centreHeight:2050,opening:[290,240],thickness:w.t};});
  model.protectedDoorAirTransfer=dry;model.wetWallAirTransfer=wet;
  model.protectedRoute.smokeVentTransfer='Measured 35000 east cross, 7600 each remaining small link, matched complete fire/smoke closure.';
  model.servicesInterface={...model.servicesInterface,source:s.authority,plant:{controls,buffer,riser,cylinder,safety},
    cooker:s.cooker,emitters:s.emitters.map(e=>({id:e.id,room:e.room,level:e.level,plan:e.completePlanWithValvesAndBrackets,z:[e.bottomLocal,e.topLocal]})),
    extract:model.servicesInterface.extract.map(e=>({...e,article:'Titon TP640Hi',modes:s.fanAccess.find(f=>f.id===e.id).modes})),
    electrical:s.electrical,roomElectric:s.roomElectric};
  model.plantReferenceDoor.wallChecks=model.plantReferenceDoor.wallChecks.filter(w=>!w.fixed.includes('cylinder'));
  model.plantReferenceDoor.selectedMineralCase={centre,operatorReserve:35,requiresEastCargo:true};
  model.servicesProjection={source:s.authority,keyedFieldsEqual:true};model.servicesOccurrenceProof={source:s.authority,emitters:16,extract:6};
  model.servicesAuxiliaryProjection={...model.servicesAuxiliaryProjection,source:s.authority,method:'Retained room-fan service geometry and new equipment duties.'};
  model.currentCourt=court.id;model.water.currentReceiver=court.id;
  return {id:'HAD-SERVICES-ADOPTION-01-RECOVERY',model,courtReceiver:court,threeBathing:true,
    separateRearOption:{selected:false,cold:13,hot:8,bathingPlaces:2,roomFans:6},siteAccepted:false,installedPerformance:false};
}
