import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
import {cookerFault} from './cooker-fault.mjs';
import {servicePlate,storePlate} from './occupied-service-plate.mjs';
import {segmentDistance} from './service-interface-geometry.mjs';
const x=deriveCurrentHouse(),m=x.model,s=m.architecturalServices;
const near=(a,b,tol=1e-5)=>assert(Math.abs(a-b)<tol,`${a} != ${b}`);
test('recovered 46 openings and 15 actual level-specific occupied room loads reproduce',()=>{
 const record=JSON.parse(readFileSync(new URL('inhabited-service-rooms.json',import.meta.url)));
 near(s.heat.hotSpareW,467.4952459946253);near(s.heat.minRoomMarginW,62.65234371925908);
 near(s.heat.designHotW,record.totals.designHotW);assert.equal(s.heat.count,15);assert.equal(s.heat.closedOpenings,46);
 assert.equal(s.emitters.length,16);assert.equal(s.roomElectric.length,4);
 for(const e of s.emitters)assert.deepEqual((e.level?m.upperFurniture:m.groundFurniture)['service-emitter-'+e.id],e.completePlanWithValvesAndBrackets);
});
test('current independent DHW and corrected three-shutter operating states reproduce without retroactive predecessor change',()=>{
 const record=JSON.parse(readFileSync(new URL('inhabited-service-faults.json',import.meta.url))),a=s.cooker.closure.proof;
 near(a.hoodLps[0],record.air.hoodLps[0]);near(a.failedSupplyDoorN,14.0803987);
 assert.equal(a.cases,96);assert(a.hotPa[0]>-4.01&&a.hotPa[1]<-3.5);assert.equal(a.requiredLoadedClosureS,4.75);
 assert.equal(s.hotWater.missedL40,0);near(s.hotWater.minimumMixedC,46.8842824);
 assert.equal(s.plant.cylinder.stockMS103.acceptedAt3point5Bar,false);
 assert.deepEqual(m.groundFurniture['plant-water-reserve'],[9450,3870,760,760]);
 assert(s.plant.primaryBuffer.defrostKWh<s.plant.primaryBuffer.chargedKWh);
 assert.equal(m.protectedDoorAirTransfer.length,8);assert.equal(m.wetWallAirTransfer.length,4);
 assert.equal(x.courtReceiver.id,'HAD-COURT-BYPASS-01');assert.equal(x.installedPerformance,false);
});

test('store cradle clears the two piers and retained plant only after first release',()=>{
  const route=m.storeExchange;
  assert.equal(route.centredWest,8);
  assert.equal(route.offset,17);
  assert.equal(route.jacketToCartEdge,28);
  assert.equal(route.fixed.westWall,25);
  assert.equal(route.fixed.riser,25);
  assert(Object.values(route.fixed).every(c=>c>=route.margin));
  assert.equal(route.retainedManifoldAxis,-15);
  near(route.firstManifoldAxisContact,76.08485357);
  near(route.tundishAxis,91.57526073);
  near(route.maxRetainedValveRadius,45.96045419);
});

test('published schedule and both figures reproduce from the complete house option',()=>{
  for(const [file,render] of [['current-house-services.json',scheduleText],['current-house-services.svg',servicePlate],['store-exchange.svg',storePlate]])
    assert.equal(readFileSync(new URL(file,import.meta.url),'utf8'),render(x),file);
  assert.equal(Object.keys(x.inputs).length,17);
});

test('same seat time, different flow histories: the room pressure can fail or recover',()=>{
  const {lateSeat,stagedEarlyFlow,largeAirVolume}=s.cooker.closure.supplyLoss;
  assert(lateSeat.atDeadline<-12 && lateSeat.lastOutside>5.9);
  assert(stagedEarlyFlow.atDeadline>-4 && stagedEarlyFlow.lastOutside<4.5);
  assert(largeAirVolume.lastOutside<4.6);
  assert(Math.abs(cookerFault(x,{dt:.00025}).atDeadline-stagedEarlyFlow.atDeadline)<.002);
  for(let mask=0;mask<32;mask++){
    const result=cookerFault(x,{mask,volumeScale:1.2});
    assert(result.atDeadline>=-5 && result.lastOutside<4.61,`mask ${mask}`);
  }
});
test('rear WC option costs the actual alternative without deleting a wet fan or lowering house duty',()=>{
  const option=x.separateRearOption;
  assert.equal(option.wc,4);assert.equal(option.roomFans,s.fanAccess.length);
  assert.deepEqual([option.cold,option.hot,option.bathingPlaces],[13,8,2]);
  assert.equal(option.omittedRearBranchMM,3370);assert.equal(option.bedroom4TwoDoorsToBathMM,18764.2);
});

test('the unpowered house needs a measured outward path even when all shutters reach their seats',()=>{
  const result=s.cooker.closure.lossOfExhaust;
  assert(result.allExtractsOffOneWay.atDeadline>35);
  assert(result.hoodTrip.maximum>18 && result.hoodTrip.atDeadline<0);
  assert(result.allExtractsOffTwoWay.lastOutside<3.4);
  const area=result.sixInletsEachReverseEquivalentMM2;
  for(const v of m.servicesInterface.supply) assert.equal(v.minimumReverseEquivalentArea,area);
  for(let blockedOutlet=0;blockedOutlet<6;blockedOutlet++){
    const loss=cookerFault(x,{fault:'power',mask:0,volumeScale:1.2,reverseArea:area,blockedOutlet});
    assert(loss.lastOutside<3.86 && loss.atDeadline<.81);
  }
});

test('the first cold draw separates all three flat faces and preserves the tank jacket',()=>{
  const first=s.plant.independentSafety.firstRelease;
  assert.deepEqual(first.firstDraw,[-65,28,12]);
  assert(first.faceOpeningMM.every(n=>n>=9));
  assert(Object.values(first.jacketClearanceLowerMM).every(n=>n>=25));
  assert.equal(first.maxEngagementMM,0);
  assert.equal(s.cooker.fullInsulatedOD,227);
});

test('furnished sanitary and utility occurrences have one joined geometry',()=>{
  assert.equal(x.fixtureJoin.utilityClearFrontMM,235);
  assert.deepEqual(m.groundFurniture['guest-WC-pan'],s.fittedWater.wcs.guest.pan);
  assert.deepEqual(m.upperFurniture['family-WC'],s.fittedWater.wcs.family.suite);
  for(const [name,b] of Object.entries(s.fittedWater.basins)){
    const item=name==='guest'?m.groundFurniture['guest-WC-basin']:m.upperFurniture[name+'-basin'];
    assert.deepEqual(item,b.pan);
  }
  assert.equal(s.utility.acquiredBranch.branchLength,960);
  assert.deepEqual(s.fittedWater.wcs.guest.southWall,[8900,0,163.75]);
});
test('SAP-C1 rejects the old service holes, and five full inlet faces can move into clear bays',()=>{
  const {ports}=x.structuralServiceReview;
  assert.equal(ports.length,21);
  assert.equal(ports.filter(p=>p.ring<0).length,6);
  assert.equal(ports.filter(p=>p.minimum<0).length,12);
  const replacements=ports.filter(p=>p.replacement);
  assert.equal(replacements.length,5);
  assert(replacements.every(p=>p.replacement.minimum>=25&&p.replacement.faceClearance>=25));
  assert.equal(ports.filter(p=>p.minimum<0&&!p.replacement).length,7);
});

test('four priced fixed heads can house the seven pipes before product and room acceptance',()=>{
  const r=x.structuralServiceReview;
  assert.equal(r.fixedHeads.flatMap(h=>h.holes).length,7);
  assert(r.fixedHeads.flatMap(h=>h.holes).every(h=>h.frameGap>=25&&h.faceGap>=25));
  assert(r.fixedHeads.every(h=>h.interHoleWebMM===null||h.interHoleWebMM>=25&&h.betweenWeatherFacesMM>=25));
  assert.equal(r.hoodReroute.cases,96);assert(r.hoodReroute.hoodLps[0]>65);
});

test('the service composition consumes shifted openings and resolves every formed-port clash',()=>{
  const choice=x.selectedServiceInterfaces;
  assert.equal(choice.ports.length,21);
  assert(choice.ports.every(p=>p.minimumMM>=25));
  for(const p of choice.ports)assert.deepEqual(m.exteriorPortGeometry.find(q=>q.id===p.id).p,p.point);
  for(const head of choice.heads){
    const opening=m.openings[head.level].find(q=>q.id===head.id);
    assert.equal(opening.centre,head.along);
    assert.equal(opening.leaves,head.id==='east-window-2'?1:0);
  }
  assert.equal(m.groundFurniture['cold-storage'][1],8725);
  assert.deepEqual(m.upperFurniture.principal,x.structuralServiceReview.principalBed.ordinaryBed);
  assert.equal(m.wholeHouseFit,undefined);
  assert(m.inheritedWaterHouseEvidence.wholeHouseFit.pass);
});

test('all six ducts and trap drains fall outward while the ground supports remain inside the section',()=>{
  for(const fan of s.fanAccess){
    assert(fan.selectedRoute.normalResistancePa<18);
    assert(fan.selectedRoute.upperBodyToSectionMM>=25);
    assert(fan.selectedRoute.completeSupportToSectionMM>=25);
    assert(fan.selectedRoute.mainToIndependentDrainMM>=25);
    if(fan.level===0)assert(fan.selectedRoute.groundSupportClearanceMM>=25);
    for(const [path,first]of [[fan.path,2],[fan.ceilingTrapDrainPort.path,1]]){
      for(let i=first;i<path.length;i++){
        const a=path[i-1],b=path[i],horizontal=Math.hypot(b[0]-a[0],b[1]-a[1]);
        assert(a[2]-b[2]>=horizontal/100-1e-6,fan.id);
      }
    }
    assert.deepEqual(fan.path.at(-1),m.servicesInterface.extract.find(q=>q.id===fan.id).mainPort);
    assert.deepEqual(fan.ceilingTrapDrainPort.path.at(-1),m.exteriorPortGeometry.find(q=>q.id===fan.id+'-condensate').p);
  }
  assert(s.cooker.selectedRoute.operation.hoodLps[0]>s.cooker.minimumCaptureLps);
});

test('fixed heads charge the utility partition return and use the reduced operating-tier purge area',()=>{
  const choice=x.selectedServiceInterfaces,utility=choice.heads.find(h=>h.room==='utility');
  near(choice.fixedHeadOpaqueAreaM2,2.09502159886);
  assert.equal(utility.partitionReturn.originalOverlapMM,147);
  assert.equal(utility.partitionReturn.cassetteToWallMM,53);
  near(utility.partitionReturn.additionalGrossBlindAreaM2,.27);
  for(const purge of choice.purge){
    assert.equal(purge.nominalOpeningAreaM2,purge.room==='principalBath'?.30625:.7);
    assert(purge.openingAreaMethod.includes('Table1.4'));
    assert(purge.lowerBoundAreaRatio>1);
    assert.deepEqual(purge.operatingTierLocalZ,[1250,purge.room==='principalBath'?2285:2410]);
  }
  assert(choice.purge.find(p=>p.room==='kitchenDining').lowerBoundAreaRatio<1.11);
});

test('four purge windows consume their shifted frames, finite leaves and reachable manual stays',()=>{
  const choice=x.selectedServiceInterfaces;
  assert.deepEqual(choice.purge.map(p=>p.centre),[9900,2100,9900,7400]);
  for(const p of choice.purge){
    assert(p.minimumFurnitureClearance.mm>=25,p.room+' '+JSON.stringify(p.minimumFurnitureClearance));
    assert(p.maximumGripReachMM<600,p.room+' grip');
    assert(p.completeLeafToCentrePostMM>8);
    assert(p.rejected400WideLeafToCentrePostMM<0);
    assert.equal(p.bodyRadiusMM,300);
    assert.equal(p.bodyToAnyMovingLeafMM,25);
    assert(p.stayVerticalSeparationMM>=15&&p.upperStayToMovingLeafMM>=15);
    for(const leaf of p.leaves){
      near(leaf.stay.openLengthMM,300);
      assert(leaf.stay.pegReachMM<600,p.room+' stay');
      assert.equal(leaf.completeWHDepth[2],128);
      const a=leaf.articulatedArm;
      assert(a.upperLengthMM<=350&&a.maximumForearmLengthMM<=350);
      assert(a.maximumCombinedLengthMM<600);
      assert(a.handToPostLowerMM>=25&&a.handToOwnLeafMM>=25);
      assert(a.forearmToPostLowerMM>=25&&a.upperToPostLowerMM>=25);
      assert(a.rejected350HandleToPostMM<0);
    }
  }
  assert.equal(m.archOpeningRegister.FIRST.find(w=>w.id==='west-window-3').sill,850);
  assert.deepEqual(s.utility.PVinverterLocalZ,[2100,2650]);
  assert.equal(choice.occupiedConsequences.additionalRearBlindAreaM2,.1);
  assert(s.emitters.some(e=>e.id==='rear-W'));
  assert(s.emitters.some(e=>e.id==='kitchen-W'));
  assert(!s.emitters.some(e=>e.id==='rear-N'||e.id==='kitchen-E'));
  for(const e of s.emitters)assert.deepEqual(m.servicesInterface.emitters.find(p=>p.id===e.id).plan,e.completePlanWithValvesAndBrackets);
});

test('complete independent drains reject the old near-coincident main-duct routes',()=>{
  near(segmentDistance([0,0,0],[10,0,0],[5,-5,0],[5,5,0]),0);
  near(segmentDistance([0,0,0],[10,0,0],[0,0,160],[10,0,160]),160);
  near(segmentDistance([0,0,0],[0,0,0],[0,0,10],[0,0,20]),10);
  assert(10-123.5-7.5<0);
  for(const f of s.fanAccess){
    near(f.path[0][2]-f.ceilingTrapDrainPort.path[0][2],160);
    assert(f.selectedRoute.mainToIndependentDrainMM>=25);
    assert.equal(f.selectedRoute.maximumCollarOD,247);
  }
});

test('fixed heads renew one outward cartridge at a time on finite side stations',()=>{
  const overlap=(a,b)=>[0,1].every(i=>Math.min(a[i]+a[i+2],b[i]+b[i+2])>Math.max(a[i],b[i]));
  for(const head of x.selectedServiceInterfaces.heads){
    const r=head.renewal;
    assert(r.roomBodyToFurnitureMM>=25);
    assert(r.roomBodyToInstalledDuctMM>=25);
    assert.equal(r.kneelingHeightMM,1380);
    assert.equal(r.stage.completeTopZ-r.stage.deckZ,2000);
    assert(r.stage.roofVerticalReserveMM>=25);
    assert.equal(r.stage.roofLeaderNormalClearanceMM,50);
    const furniture=structuredClone(head.level==='GROUND'?m.groundFurniture:m.upperFurniture),park=r.roomAccess.parkedFurniture;
    if(park)furniture[park.id]=park.plan;
    for(const [id,item]of Object.entries(furniture)){
      const emitter=s.emitters.find(e=>'service-emitter-'+e.id===id);
      if(emitter&&emitter.bottomLocal>r.roomDeckLocalZ+r.kneelingHeightMM)continue;
      if(id==='service-utility-PVinverter')continue;
      assert(!overlap(r.roomAccess.platform,item),head.id+' platform '+id);
    }
    for(const c of r.cartridges){
      assert(c.minimumRadialRunningClearanceMM>=3);
      assert.equal(c.firstOutwardDrawMM,650);
      assert.equal(c.finalOutwardDrawMM,805);
      near(c.initial.z[0]-c.clearanceState.z[0],6.5);
      near(c.initial.z[0]-c.dryRest.z[0],8.05);
      assert(c.after650InnerTipToRetainedFaceMM>=45);
      assert(c.dryRest.outwardNormalMM[0]-c.dryRestNormalMM[0]>=25);
      assert(c.dryRestNormalMM[1]-c.dryRest.outwardNormalMM[1]>=25);
      assert(c.roomRelease.handReachMM<=600);
      assert(c.roomRelease.requiredExtensionMM<=c.roomRelease.steelSocketExtensionMaximumMM);
      assert(c.roomRelease.armToInstalledDuctMinimumMM>=25);
      assert(c.exterior.bodyToCompleteMovingPartMM>=25);
      assert(c.exterior.frontHandReachMM<=600&&c.exterior.sideHandReachMM<=600);
      assert(c.exterior.frontToolRequiredMM<=c.exterior.frontToolMaximumMM);
      assert(c.exterior.sideToolRequiredMM<=c.exterior.sideToolMaximumMM);
      assert(c.temporaryBlank.gapToRoomDuctMM>=25&&c.temporaryBlank.minimumRoomFaceClearanceMM>=25);
      assert(r.rejectedInteriorRig.partOverlap&&r.rejectedInteriorRig.supportIntersection);
    }
  }
});

test('all21 complete weather faces retain the actual selected structural and head margins',()=>{
  assert.equal(x.selectedServiceInterfaces.weatherFaces.length,21);
  for(const f of x.selectedServiceInterfaces.weatherFaces){
    assert(f.minimumMM>=25,f.id+' '+f.minimumMM);
    assert.equal(f.outerProjectionMaximumMM,100);
  }
  const principal=x.selectedServiceInterfaces.heads.find(h=>h.id==='east-window-2');
  assert.equal(principal.holes[0].faceWidth,284);
  assert.equal(principal.weather.principalTelescopicJoint.minimumMeasuredRadialGap,.5);
});
