import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fitHousehold} from './fitted-house-services.mjs';
import {serviceApertures} from './service-apertures.mjs';
import {servicePlate,storePlate} from './occupied-service-plate.mjs';
import {cookerFault} from './cooker-fault.mjs';
import {fileURLToPath} from 'node:url';
import {roomSelection} from './inhabited-service-rooms.mjs';
import {controlAndStorage} from './inhabited-service-faults.mjs';
import {composeOccupiedHouse} from './inhabited-service-compose.mjs';
import {selectServiceInterfaces} from './selected-service-interfaces.mjs';
import {selectedServicePlate} from './selected-service-plate.mjs';
import {reconcileSelectedWaterDuties} from './selected-water-duties.mjs';
const project=new URL('../../',import.meta.url);
export function deriveCurrentHouse(){
  const inputs={};
  function read(path){
    const bytes=readFileSync(new URL(path+'.json',project));
    inputs['project/'+path+'.json']=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
    return JSON.parse(bytes);
  }
  const h=read('had/studies/water-replan'),base=read('mat/studies/whole-house-service-baseline'),
    offer=read('mat/studies/service-material-offer'),temp=read('mat/studies/tempered-kitchen-air'),
    plant=read('mat/studies/local-extract-heat-and-store'),court=read('had/studies/receiver-selection');
  const thermal=roomSelection(h.model,read('mat/studies/whole-house-leakage-duty'),base,offer,read('mat/studies/loggia-soffit').thermal);
  const fanCharts=read('mat/studies/joined-cooker-system').SwegonExternalMotorCandidate.fanChartSamplesPa;
  const outcomes=controlAndStorage(fanCharts);
  const house=composeOccupiedHouse(h,base,offer,temp,plant,thermal,outcomes,court);
  const rear=read('ias/studies/shared-family-bathing');
  const [cold,hot]=rear.services.withDiverter;
  const [wc,showers,baths,roomFans]=rear.threeRoomComparators.rearWCPlusSharedBathShower;
  house.separateRearOption={selected:false,cold,hot,wc,bathingPlaces:showers+baths,roomFans,
    omittedRearBranchMM:rear.services.rearShowerBranchesRemovedFromUseMm,
    bedroom4TwoDoorsToBathMM:rear.access.twoOperatedDoorsAndBathArrivalMm,
    bathRimMM:rear.room.rim,retainedRearPort:rear.services.retainedRearPort,
    basis:'Identical heated envelope, rear wet-room target and six fans. Keep the same four-person water draw, case and plant duty.'};
  const closure=house.model.architecturalServices.cooker.closure;
  closure.supplyLoss={lateSeat:cookerFault(house,{profile:'late'}),
    stagedEarlyFlow:cookerFault(house),largeAirVolume:cookerFault(house,{volumeScale:1.2}),
    requiredFlowDeadlines:[{seconds:1.35,fraction:.50},{seconds:2.35,fraction:.25},{seconds:3.35,fraction:.10},{seconds:4.35,fraction:0}],
    scope:'Maximum fraction of the peak-to-seated exhaust increment. Flow measurements must include the operating fans, bypass, wind draw and both closed-seat leakages. The loaded assembly is unqualified.'};
  const reverseArea=5000;
  for(const inlet of house.model.architecturalServices.supply) inlet.minimumReverseEquivalentArea=reverseArea;
  house.model.servicesInterface.supply=house.model.architecturalServices.supply;
  closure.lossOfExhaust={hoodTrip:cookerFault(house,{fault:'hood',mask:0,reverseArea}),
    allExtractsOffOneWay:cookerFault(house,{fault:'power',mask:0}),
    allExtractsOffTwoWay:cookerFault(house,{fault:'power',mask:0,reverseArea}),
    peakInwardLps:closure.proof.directLps[1],maximumSeatedInwardLps:closure.maxExtractLeakLpsEach,
    sixInletsEachReverseEquivalentMM2:reverseArea,
    scope:'Bound the actively supplied airflow even if both kitchen extracts stop. Forward weather/insect/acoustic area is tested independently from unpowered outward area.'};
  const householdWater=read('ias/studies/household-water');
  house.fixtureJoin=fitHousehold(house.model,householdWater,read('ias/studies/fitted-wc-schedule'),
    read('ias/studies/utility-first-release'),read('ias/studies/utility-host-revised-route'));
  const structure=read('str/studies/reconciled-house-interface');
  const corner=read('str/studies/current-house-arch-movement');
  house.structuralServiceReview=serviceApertures(house.model,structure,corner);
  const ductStress=controlAndStorage(fanCharts,2,2).air;
  house.structuralServiceReview.hoodReroute={addedLengthM:2,addedBendK:2,cases:ductStress.cases,
    hoodLps:ductStress.hoodLps,directLps:ductStress.directLps,kitchenPa:ductStress.hotPa};
  house.structuralServiceReview.principalBed=structure.principalBed;
  house.structuralServiceReview.kitchen=structure.kitchen;
  selectServiceInterfaces(house,structure,corner,base,read('str/studies/house-corner-rewind'));
  house.model.currentAdoptionBlockers=reconcileSelectedWaterDuties(house.model,householdWater,base);
  return {...house,inputs};
}
// Compact, reproducible review projection of the selected furnished house.
export function serviceSchedule(house){
  const {model:m}=house, s=m.architecturalServices;
  return {proposal:house.id,structurallyAdopted:false,qualifiedPhysical:false,sources:house.inputs,court:house.courtReceiver.id,
    wholeHeat:s.heat, domestic:s.hotWater, plant:s.plant,
    heatBodies:s.emitters.map(e=>({id:e.id,room:e.room,plan:e.completePlanWithValvesAndBrackets})),
    localElectric:s.roomElectric,air:s.cooker,
    wetRoomFans:s.fanAccess.map(f=>({id:f.id,plan:f.podPlan,selectedMode:f.modes})),
    transferDoors:m.protectedDoorAirTransfer,wetTransferWalls:m.wetWallAirTransfer,
    materials:s.materials,storeExchange:m.storeExchange,separateRearOption:house.separateRearOption,
    fixtureJoin:house.fixtureJoin,fittedWater:s.fittedWater,utility:s.utility,structuralServiceReview:house.structuralServiceReview,
    architecturalServiceSelected:house.architecturalServiceSelected,selectedServiceInterfaces:house.selectedServiceInterfaces};
}
// Round derived quantities for reproducible text across supported Node engines.
export const scheduleText=house=>JSON.stringify(serviceSchedule(house),(_,v)=>typeof v==='number'?Number(v.toFixed(8)):v,2)+'\n';
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const house=deriveCurrentHouse();
  if(process.argv.includes('--write')){
    for(const [file,bytes] of [['current-house-services.json',scheduleText(house)],['current-house-services.svg',servicePlate(house)],['store-exchange.svg',storePlate(house)],['selected-service-interfaces.svg',selectedServicePlate(house)]])
      writeFileSync(new URL(file,import.meta.url),bytes);
  } else process.stdout.write(JSON.stringify(house)+'\n');
}
