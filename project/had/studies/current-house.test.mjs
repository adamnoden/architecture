import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {deriveCurrentHouse,scheduleText} from './current-house.mjs';
import {cookerFault} from './cooker-fault.mjs';
import {servicePlate,storePlate} from './occupied-service-plate.mjs';
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
    assert.equal(opening.leaves,0);
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
    assert.equal(purge.clearRectangularAreaM2,.7);
    assert(purge.lowerBoundAreaRatio>1);
    assert.deepEqual(purge.operatingTierLocalZ,[1250,2410]);
  }
  assert(choice.purge.find(p=>p.room==='kitchenDining').lowerBoundAreaRatio<1.11);
});

test('the room-side first tube clears glazing and the whole cassette reaches a furniture-clear dry rest',()=>{
  const overlap=(a,b)=>[0,1].every(i=>Math.min(a[i]+a[i+2],b[i]+b[i+2])>Math.max(a[i],b[i]));
  for(const head of x.selectedServiceInterfaces.heads){
    const r=head.renewal,rest=head.receiver.headReceiver,first=r.panelStates[0],last=r.panelStates.at(-1);
    assert.equal(r.firstPiece.axialPilotMM,0);
    assert.equal(r.firstPiece.normalMM[0]-r.finishedWallNormalMM,75.5);
    assert(r.removedNext.retainedRiserToCassetteMM>=90||r.removedNext.retainedTrunkToCassetteMM>=25);
    near(Math.hypot(last[0]-first[0],last[1]-first[1]),900);
    for(const i of [0,1]){
      assert(last[i]-rest[i]>=25,head.id+' near receiver edge');
      assert(rest[i]+rest[i+2]-last[i]-last[i+3]>=25,head.id+' far receiver edge');
    }
    assert.deepEqual(r.loweredBox.slice(0,2),last.slice(0,2));
    const furniture=structuredClone(head.level==='GROUND'?m.groundFurniture:m.upperFurniture),park=head.receiver.parkedFurniture;
    if(park){
      assert(overlap(head.receiver.platform,furniture[park.id]));
      furniture[park.id]=park.plan;
    }
    for(const [id,item]of Object.entries(furniture))for(const field of ['platform','headReceiver'])
      assert(!overlap(head.receiver[field],item),head.id+' '+field+' '+id);
    if(head.holes[0].id!=='cooker-exhaust'){
      const rejectedBottom=head.holes[0].point[2]-(head.level==='FIRST'?3450:0)-113.5-250;
      assert(rejectedBottom<head.bandBottom);
    }
  }
});
