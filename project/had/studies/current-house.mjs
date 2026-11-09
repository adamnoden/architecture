import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {roomSelection} from './inhabited-service-rooms.mjs';
import {controlAndStorage} from './inhabited-service-faults.mjs';
import {composeOccupiedHouse} from './inhabited-service-compose.mjs';
const project=new URL('../../',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path+'.json',project),'utf8'));
export function deriveCurrentHouse(){
  const h=read('had/studies/water-replan'),base=read('mat/studies/whole-house-service-baseline'),
    offer=read('mat/studies/service-material-offer'),temp=read('mat/studies/tempered-kitchen-air'),
    plant=read('mat/studies/local-extract-heat-and-store'),court=read('had/studies/receiver-selection');
  const thermal=roomSelection(h.model,read('mat/studies/whole-house-leakage-duty'),base,offer,read('mat/studies/loggia-soffit').thermal);
  const outcomes=controlAndStorage(read('mat/studies/joined-cooker-system').SwegonExternalMotorCandidate.fanChartSamplesPa);
  return composeOccupiedHouse(h,base,offer,temp,plant,thermal,outcomes,court);
}
if(process.argv[1]===fileURLToPath(import.meta.url)) process.stdout.write(JSON.stringify(deriveCurrentHouse())+'\n');
