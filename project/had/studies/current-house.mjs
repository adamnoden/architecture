import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {servicePlate,storePlate} from './occupied-service-plate.mjs';
import {fileURLToPath} from 'node:url';
import {roomSelection} from './inhabited-service-rooms.mjs';
import {controlAndStorage} from './inhabited-service-faults.mjs';
import {composeOccupiedHouse} from './inhabited-service-compose.mjs';
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
  const outcomes=controlAndStorage(read('mat/studies/joined-cooker-system').SwegonExternalMotorCandidate.fanChartSamplesPa);
  return {...composeOccupiedHouse(h,base,offer,temp,plant,thermal,outcomes,court), inputs};
}
// Compact, reproducible review projection of the full furnished-house candidate.
export function serviceSchedule(house){
  const {model:m}=house, s=m.architecturalServices;
  return {proposal:house.id,structurallyAdopted:false,qualifiedPhysical:false,sources:house.inputs,court:house.courtReceiver.id,
    wholeHeat:s.heat, domestic:s.hotWater, plant:s.plant,
    heatBodies:s.emitters.map(e=>({id:e.id,room:e.room,plan:e.completePlanWithValvesAndBrackets})),
    localElectric:s.roomElectric,air:s.cooker,
    wetRoomFans:s.fanAccess.map(f=>({id:f.id,plan:f.podPlan,selectedMode:f.modes})),
    transferDoors:m.protectedDoorAirTransfer,wetTransferWalls:m.wetWallAirTransfer,
    materials:s.materials,storeExchange:m.storeExchange};
}
// Round derived quantities for reproducible text across supported Node engines.
export const scheduleText=house=>JSON.stringify(serviceSchedule(house),(_,v)=>typeof v==='number'?Number(v.toFixed(8)):v,2)+'\n';
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const house=deriveCurrentHouse();
  if(process.argv.includes('--write')){
    for(const [file,bytes] of [['current-house-services.json',scheduleText(house)],['current-house-services.svg',servicePlate(house)],['store-exchange.svg',storePlate(house)]])
      writeFileSync(new URL(file,import.meta.url),bytes);
  } else process.stdout.write(JSON.stringify(house)+'\n');
}
